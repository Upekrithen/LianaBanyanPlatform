-- KN102 / KN103 (Pod-B) — Cohort-Class Librarian Fluidity + Cue Card 7-Day Recency Gate
-- BP016 ratification. Pairs: KN102 (librarian mode) + KN103 (vesting state machine).
-- BRIDLE compliance: extends creator_referrals; does NOT reinvent existing KN087 schema.

-- ── Phase 1: extend creator_referrals with recipient_used_at ─────────────────
-- Three-gate vesting condition (anti-farming preserved):
--   Gate 1: cue_card_sent_at populated (already exists)
--   Gate 2: handshake_vesting_state = 'HANDSHAKE_COMPLETED' (already exists)
--   Gate 3: recipient_used_at populated (NEW — any platform action post-handshake)
ALTER TABLE public.creator_referrals
  ADD COLUMN IF NOT EXISTS recipient_used_at TIMESTAMPTZ;

-- Index for fast 7-day window queries
CREATE INDEX IF NOT EXISTS idx_creator_referrals_recipient_used_at
  ON public.creator_referrals(referrer_id, recipient_used_at)
  WHERE recipient_used_at IS NOT NULL;

-- ── Phase 2: cohort_class type ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.cohort_class AS ENUM (
    'lone_wolf',
    'pied_piper_tier_1',
    'pied_piper_tier_2_plus',
    'federation_member',
    'excalibur_class_subscriber'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Phase 3: cue_card_vesting_summary RPC ─────────────────────────────────────
-- Returns the 7-day vesting context for a given member:
--   active_cue_card_count  — qualifying cards (all 3 gates, within last 7 days)
--   most_recent_qualifying_at — ISO timestamp of most recent qualifying card
--   expiry_at              — most_recent_qualifying_at + 7 days
--   hours_until_expiry     — float (null if no active cards)
CREATE OR REPLACE FUNCTION public.get_cue_card_vesting_summary(p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ := NOW() - INTERVAL '7 days';
  v_most_recent  TIMESTAMPTZ;
  v_active_count INTEGER;
  v_expiry_at    TIMESTAMPTZ;
  v_hours_until  FLOAT;
BEGIN
  -- Count qualifying cards: all 3 gates within last 7 days
  SELECT
    COUNT(*),
    MAX(recipient_used_at)
  INTO v_active_count, v_most_recent
  FROM public.creator_referrals
  WHERE
    referrer_id = p_member_id
    AND handshake_vesting_state IN ('HANDSHAKE_COMPLETED', 'REWARDS_VESTED')
    AND recipient_used_at IS NOT NULL
    AND recipient_used_at >= v_window_start;

  IF v_most_recent IS NULL THEN
    RETURN jsonb_build_object(
      'member_id',              p_member_id,
      'active_cue_card_count',  0,
      'most_recent_qualifying_at', NULL,
      'expiry_at',              NULL,
      'hours_until_expiry',     NULL
    );
  END IF;

  v_expiry_at   := v_most_recent + INTERVAL '7 days';
  v_hours_until := EXTRACT(EPOCH FROM (v_expiry_at - NOW())) / 3600.0;

  RETURN jsonb_build_object(
    'member_id',              p_member_id,
    'active_cue_card_count',  v_active_count,
    'most_recent_qualifying_at', v_most_recent,
    'expiry_at',              v_expiry_at,
    'hours_until_expiry',     GREATEST(v_hours_until, 0)
  );
END;
$$;

-- ── Phase 4: get_member_cohort_class RPC ──────────────────────────────────────
-- Single-call cohort-class probe used by LB Frame Handshake Phase 1 Discovery.
-- Priority order: federation_member > excalibur_class_subscriber > pied_piper > lone_wolf
CREATE OR REPLACE FUNCTION public.get_member_cohort_class(p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_membership_status TEXT;
  v_entity_active     BOOLEAN := false;
  v_vesting_summary   JSONB;
  v_cohort_class      TEXT;
  v_active_count      INTEGER;
  v_librarian_mode    TEXT;
BEGIN
  -- Gate 1: Individual federation membership ($5/year)
  SELECT membership_status INTO v_membership_status
  FROM public.profiles
  WHERE id = p_member_id;

  IF v_membership_status = 'active' THEN
    RETURN jsonb_build_object(
      'cohort_class',    'federation_member',
      'librarian_mode',  'fluid',
      'membership_status', v_membership_status,
      'cue_card_vesting', NULL
    );
  END IF;

  -- Gate 2: Excalibur Class subscription (entity_memberships; primary_contact_user_id match)
  SELECT EXISTS(
    SELECT 1 FROM public.entity_memberships
    WHERE primary_contact_user_id = p_member_id
      AND status = 'active'
  ) INTO v_entity_active;

  IF v_entity_active THEN
    RETURN jsonb_build_object(
      'cohort_class',    'excalibur_class_subscriber',
      'librarian_mode',  'fluid',
      'membership_status', v_membership_status,
      'cue_card_vesting', NULL
    );
  END IF;

  -- Gate 3: Pied Piper (7-day Cue Card recency window)
  v_vesting_summary := public.get_cue_card_vesting_summary(p_member_id);
  v_active_count    := (v_vesting_summary->>'active_cue_card_count')::INTEGER;

  IF v_active_count >= 1 THEN
    IF v_active_count >= 3 THEN
      v_cohort_class := 'pied_piper_tier_2_plus';
    ELSE
      v_cohort_class := 'pied_piper_tier_1';
    END IF;
    v_librarian_mode := 'fluid';
  ELSE
    v_cohort_class   := 'lone_wolf';
    v_librarian_mode := 'brittle';
  END IF;

  RETURN jsonb_build_object(
    'cohort_class',    v_cohort_class,
    'librarian_mode',  v_librarian_mode,
    'membership_status', v_membership_status,
    'cue_card_vesting', v_vesting_summary
  );
END;
$$;

-- ── Phase 5: mark_recipient_used RPC ─────────────────────────────────────────
-- Called by edge function / LB Frame when recipient takes platform action post-handshake.
-- Updates recipient_used_at on the most recent HANDSHAKE_COMPLETED referral for this sender.
CREATE OR REPLACE FUNCTION public.mark_cue_card_recipient_used(
  p_referral_id UUID,
  p_used_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.creator_referrals%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.creator_referrals WHERE id = p_referral_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'referral_not_found');
  END IF;

  IF v_row.handshake_vesting_state NOT IN ('HANDSHAKE_COMPLETED', 'REWARDS_VESTED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'handshake_not_completed', 'state', v_row.handshake_vesting_state);
  END IF;

  UPDATE public.creator_referrals
  SET recipient_used_at = p_used_at
  WHERE id = p_referral_id
    AND recipient_used_at IS NULL;

  RETURN jsonb_build_object(
    'success',       true,
    'referral_id',   p_referral_id,
    'recipient_used_at', p_used_at
  );
END;
$$;
