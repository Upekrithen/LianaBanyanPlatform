-- BP079 Red Carpet Substrate — Wave A Schema Migration
-- 2026-06-10
-- SEG-RC-A-Schema (Sonnet 4.6)
--
-- This migration creates the full Red Carpet substrate:
-- - ALTERs creator_referrals to add introducer + business columns
-- - CREATEs 8 new tables: cue_card_templates, leviathan_cue_cards, red_carpet_access,
--   cue_card_share_clicks, cue_card_destinations, promotion_attributions, referrals, social_frame_locks
-- - Creates SECURITY DEFINER functions for anon access patterns
-- - ALTERs membership_payments to add introducer_user_id
-- - Enables RLS on all new tables

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 1 — ALTER creator_referrals (existing table, extend only)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.creator_referrals
  ADD COLUMN IF NOT EXISTS introducer_user_id    uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS business_entity_id    uuid REFERENCES entity_memberships(id),
  ADD COLUMN IF NOT EXISTS business_node_type    text CHECK (business_node_type IN ('food','local-business','service','tribe','manufacturing','guild','broadcast','hexisle')),
  ADD COLUMN IF NOT EXISTS business_card_id      uuid, -- FK added after leviathan_cue_cards is created
  ADD COLUMN IF NOT EXISTS first_seen_at         timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS activated_at          timestamptz,
  ADD COLUMN IF NOT EXISTS rc_stripe_session_id  text;

CREATE INDEX IF NOT EXISTS idx_creator_referrals_introducer ON public.creator_referrals(introducer_user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 2 — CREATE new tables (in dependency order)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── cue_card_templates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cue_card_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type         text NOT NULL CHECK (node_type IN ('food','local-business','service','tribe','manufacturing','guild','broadcast','hexisle')),
  template_name     text NOT NULL,
  template_payload  jsonb NOT NULL DEFAULT '{}',
  system_owned      boolean NOT NULL DEFAULT true,
  creator_user_id   uuid REFERENCES auth.users(id),
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.cue_card_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view templates"
  ON public.cue_card_templates FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to templates"
  ON public.cue_card_templates FOR ALL
  USING (auth.role() = 'service_role');

-- ─── leviathan_cue_cards ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leviathan_cue_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id uuid NOT NULL REFERENCES auth.users(id),
  node_type       text NOT NULL CHECK (node_type IN ('food','local-business','service','tribe','manufacturing','guild','broadcast','hexisle')),
  template_id     uuid REFERENCES public.cue_card_templates(id),
  payload         jsonb NOT NULL DEFAULT '{}',
  short_token     text UNIQUE NOT NULL,
  qr_code_url     text,
  created_at      timestamptz DEFAULT now(),
  expires_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_leviathan_cue_cards_short_token ON public.leviathan_cue_cards(short_token);
CREATE INDEX IF NOT EXISTS idx_leviathan_cue_cards_creator ON public.leviathan_cue_cards(creator_user_id);

ALTER TABLE public.leviathan_cue_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators own their cards"
  ON public.leviathan_cue_cards FOR ALL
  USING (auth.uid() = creator_user_id);

CREATE POLICY "Service role full access to cue cards"
  ON public.leviathan_cue_cards FOR ALL
  USING (auth.role() = 'service_role');

-- Now that leviathan_cue_cards exists, add the FK from creator_referrals
ALTER TABLE public.creator_referrals
  ADD CONSTRAINT IF NOT EXISTS fk_creator_referrals_business_card
  FOREIGN KEY (business_card_id) REFERENCES public.leviathan_cue_cards(id);

-- ─── red_carpet_access ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.red_carpet_access (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email_hash  text NOT NULL,
  recipient_user_id     uuid REFERENCES auth.users(id),
  introducer_user_id    uuid NOT NULL REFERENCES auth.users(id),
  grant_token           text UNIQUE NOT NULL,
  grant_expires_at      timestamptz NOT NULL DEFAULT now() + interval '30 days',
  used_at               timestamptz,
  card_id               uuid REFERENCES public.leviathan_cue_cards(id),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_red_carpet_access_grant_token ON public.red_carpet_access(grant_token);
CREATE INDEX IF NOT EXISTS idx_red_carpet_access_recipient ON public.red_carpet_access(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_red_carpet_access_introducer ON public.red_carpet_access(introducer_user_id);

ALTER TABLE public.red_carpet_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipients can view own grants"
  ON public.red_carpet_access FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Introducers can view own grants"
  ON public.red_carpet_access FOR SELECT
  USING (auth.uid() = introducer_user_id);

CREATE POLICY "Service role full access to red_carpet_access"
  ON public.red_carpet_access FOR ALL
  USING (auth.role() = 'service_role');

-- ─── cue_card_share_clicks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cue_card_share_clicks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id           uuid NOT NULL REFERENCES public.leviathan_cue_cards(id),
  click_token           text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  clicked_at            timestamptz DEFAULT now(),
  anonymous_session_id  text NOT NULL,
  ip_country            text,
  user_agent_class      text,
  converted             boolean NOT NULL DEFAULT false,
  conversion_event_id   uuid
);

CREATE INDEX IF NOT EXISTS idx_cue_card_share_clicks_card ON public.cue_card_share_clicks(cue_card_id);
CREATE INDEX IF NOT EXISTS idx_cue_card_share_clicks_token ON public.cue_card_share_clicks(click_token);

ALTER TABLE public.cue_card_share_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to share clicks"
  ON public.cue_card_share_clicks FOR ALL
  USING (auth.role() = 'service_role');

-- ─── cue_card_destinations ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cue_card_destinations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id       uuid NOT NULL REFERENCES public.leviathan_cue_cards(id),
  destination_type  text NOT NULL CHECK (destination_type IN ('onboard','storefront','walkthrough')),
  destination_url   text NOT NULL,
  ab_variant        text,
  priority          int NOT NULL DEFAULT 1,
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cue_card_destinations_card ON public.cue_card_destinations(cue_card_id);

ALTER TABLE public.cue_card_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card creators own destinations"
  ON public.cue_card_destinations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.leviathan_cue_cards
      WHERE leviathan_cue_cards.id = cue_card_destinations.cue_card_id
      AND leviathan_cue_cards.creator_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to destinations"
  ON public.cue_card_destinations FOR ALL
  USING (auth.role() = 'service_role');

-- ─── promotion_attributions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promotion_attributions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_user_id      uuid NOT NULL REFERENCES auth.users(id),
  attributed_amount_cents int NOT NULL DEFAULT 0,
  currency_class          text NOT NULL DEFAULT 'credits' CHECK (currency_class IN ('credits','marks','joules')),
  attribution_event       text NOT NULL CHECK (attribution_event IN ('first_signup','first_payment','recurring_payment','subscription_renewal','food_node_first_sub','food_node_recurring')),
  source_entity_id        uuid,
  source_payment_id       uuid REFERENCES public.membership_payments(id),
  vesting_unlock_at       timestamptz,
  claimed_at              timestamptz,
  created_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotion_attributions_introducer ON public.promotion_attributions(introducer_user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_attributions_vesting ON public.promotion_attributions(introducer_user_id, claimed_at);

ALTER TABLE public.promotion_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Introducers can view own attributions"
  ON public.promotion_attributions FOR SELECT
  USING (auth.uid() = introducer_user_id);

CREATE POLICY "Service role full access to attributions"
  ON public.promotion_attributions FOR ALL
  USING (auth.role() = 'service_role');

-- ─── referrals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  uuid NOT NULL REFERENCES auth.users(id),
  referred_user_id  uuid REFERENCES auth.users(id),
  referral_code     text UNIQUE NOT NULL,
  referral_source   text,
  created_at        timestamptz DEFAULT now(),
  converted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers own their referrals"
  ON public.referrals FOR ALL
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Service role full access to referrals"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

-- ─── social_frame_locks ────────────────────────────────────────────────────────
-- Schema inferred from lib usage at platform/src/lib/cueCardClickTracking.ts
CREATE TABLE IF NOT EXISTS public.social_frame_locks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_card_id        uuid NOT NULL,
  user_id             uuid NOT NULL REFERENCES auth.users(id),
  total_clicks        int NOT NULL DEFAULT 0,
  clicks_per_lock     int NOT NULL DEFAULT 5,
  lock_top            boolean NOT NULL DEFAULT true,
  lock_right          boolean NOT NULL DEFAULT true,
  lock_bottom         boolean NOT NULL DEFAULT true,
  lock_left           boolean NOT NULL DEFAULT true,
  is_fully_unlocked   boolean NOT NULL DEFAULT false,
  unlocked_at         timestamptz,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(deck_card_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_frame_locks_user ON public.social_frame_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_social_frame_locks_deck_card ON public.social_frame_locks(deck_card_id);

ALTER TABLE public.social_frame_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their frame locks"
  ON public.social_frame_locks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to frame locks"
  ON public.social_frame_locks FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 3 — SECURITY DEFINER functions for anon access patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── mark_red_carpet_grant_used ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_red_carpet_grant_used(p_grant_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.red_carpet_access
  SET
    used_at = now(),
    recipient_user_id = auth.uid()
  WHERE grant_token = p_grant_token
    AND used_at IS NULL
    AND grant_expires_at > now();
END;
$$;

-- ─── record_cue_card_click ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_cue_card_click(
  p_card_id uuid,
  p_anon_session_id text,
  p_ip_country text,
  p_ua_class text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_click_token uuid;
BEGIN
  INSERT INTO public.cue_card_share_clicks (
    cue_card_id,
    anonymous_session_id,
    ip_country,
    user_agent_class
  ) VALUES (
    p_card_id,
    p_anon_session_id,
    p_ip_country,
    p_ua_class
  )
  RETURNING click_token INTO v_click_token;

  RETURN v_click_token;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 4 — ALTER membership_payments to add introducer_user_id
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.membership_payments
  ADD COLUMN IF NOT EXISTS introducer_user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_membership_payments_introducer
  ON public.membership_payments(introducer_user_id)
  WHERE introducer_user_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
