-- KN087 / BP009 — LB Frame Cue Card Viral Onboarding
-- Extends creator_referrals with Handshake-vesting state machine + license door + LB Frame lifecycle.
-- BRIDLE v11 Rule 1: integrates with EXISTING creator_referrals. Does NOT reinvent.
-- BRIDLE v11 Rule 2: no fiat cashout ever. Marks/Credits closed-loop.
-- BRIDLE v11 Rule 3: flat-per-direct-referral (NOT MLM).
-- BRIDLE v11 Rule 4: rewards vest only at HANDSHAKE_COMPLETED.
-- BRIDLE v11 Rule 5: license_door persists AGPL/Apache per recipient choice.

-- Vesting state machine enum
DO $$ BEGIN
  CREATE TYPE public.cue_card_vesting_state AS ENUM (
    'PENDING_RECIPIENT_DOWNLOAD',
    'RECIPIENT_DOWNLOADED',
    'HANDSHAKE_INITIATED',
    'HANDSHAKE_COMPLETED',
    'REWARDS_VESTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- License door enum
DO $$ BEGIN
  CREATE TYPE public.cue_card_license_door AS ENUM (
    'AGPL',
    'Apache'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extend creator_referrals with LB Frame-specific columns
ALTER TABLE public.creator_referrals
  ADD COLUMN IF NOT EXISTS handshake_vesting_state public.cue_card_vesting_state
    NOT NULL DEFAULT 'PENDING_RECIPIENT_DOWNLOAD',
  ADD COLUMN IF NOT EXISTS license_door public.cue_card_license_door
    NOT NULL DEFAULT 'AGPL',
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS personal_message TEXT,
  ADD COLUMN IF NOT EXISTS handshake_session_id TEXT,
  ADD COLUMN IF NOT EXISTS vesting_state_updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Index on vesting state for efficient trigger lookups
CREATE INDEX IF NOT EXISTS idx_creator_referrals_vesting_state
  ON public.creator_referrals(handshake_vesting_state)
  WHERE handshake_vesting_state != 'REWARDS_VESTED';

-- Function: advance vesting state
-- Called by cue-card-vesting-trigger edge function when Handshake receipt arrives.
CREATE OR REPLACE FUNCTION public.advance_cue_card_vesting(
  p_referral_id UUID,
  p_new_state public.cue_card_vesting_state,
  p_handshake_session_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.creator_referrals%ROWTYPE;
  v_tier_reward NUMERIC;
  v_referrer_marks_column TEXT;
BEGIN
  SELECT * INTO v_row FROM public.creator_referrals WHERE id = p_referral_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'referral_not_found');
  END IF;

  UPDATE public.creator_referrals
  SET
    handshake_vesting_state = p_new_state,
    vesting_state_updated_at = NOW(),
    handshake_session_id = COALESCE(p_handshake_session_id, handshake_session_id),
    signed_up_at = CASE WHEN p_new_state = 'HANDSHAKE_COMPLETED' THEN NOW() ELSE signed_up_at END,
    completed_at = CASE WHEN p_new_state = 'REWARDS_VESTED' THEN NOW() ELSE completed_at END
  WHERE id = p_referral_id;

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', p_referral_id,
    'new_state', p_new_state::text,
    'advanced_at', NOW()
  );
END;
$$;

-- Function: compute Marks reward for a referrer based on their cumulative referral count
-- Used by cue-card-vesting-trigger at REWARDS_VESTED transition.
CREATE OR REPLACE FUNCTION public.compute_referral_marks_reward(
  p_referrer_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_completed INTEGER;
  v_reward NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_completed
  FROM public.creator_referrals
  WHERE referrer_id = p_referrer_id
    AND handshake_vesting_state = 'REWARDS_VESTED';

  -- Six-tier declining rate (BRIDLE v11 Rule 3 — flat per direct referral, NOT MLM)
  -- Pioneer:     1-100  → 10 Marks
  -- Vanguard:  101-500  →  5 Marks
  -- Pathfinder: 501-2000 → 3 Marks
  -- Trailblazer: 2001-10000 → 2 Marks
  -- Guide:      10001-50000 → 1.5 Marks
  -- Ambassador: 50001+  →  1 Mark (floor)
  IF v_total_completed < 100 THEN
    v_reward := 10;
  ELSIF v_total_completed < 500 THEN
    v_reward := 5;
  ELSIF v_total_completed < 2000 THEN
    v_reward := 3;
  ELSIF v_total_completed < 10000 THEN
    v_reward := 2;
  ELSIF v_total_completed < 50000 THEN
    v_reward := 1.5;
  ELSE
    v_reward := 1;
  END IF;

  RETURN v_reward;
END;
$$;
