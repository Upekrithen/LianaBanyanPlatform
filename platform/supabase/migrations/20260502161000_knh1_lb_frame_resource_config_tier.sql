-- KN-H1 (Pod-H #1 of 5) — Three-Tier Resource-Config Installer at LB Frame Handshake
-- BP017 Founder ratification turn 18-19.
-- Tier A NEEDS (default plan) / Tier B SUGGESTS (recommended uplift) / Tier C FOUNDER (empirical-receipt-source)
-- Anti-extraction by structural form: capital alone cannot purchase higher-tier participation.
-- Composes with KN102 cohort-class (orthogonal axis) + KN086 Handshake Phase 1 Discovery.

-- ── Step 1: enum type ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.lb_frame_resource_tier AS ENUM (
    'needs',
    'suggests',
    'founder'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Step 2: add tier columns to user_preferences ──────────────────────────
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS lb_frame_resource_config_tier
    public.lb_frame_resource_tier
    DEFAULT NULL;

COMMENT ON COLUMN public.user_preferences.lb_frame_resource_config_tier IS
  'LB Frame resource-config tier chosen by user at Handshake Phase 1 Discovery. '
  'NULL = not yet chosen. A=needs (default plan, no upgrade) / B=suggests (recommended uplift) / C=founder (empirical-receipt-source). '
  'Anti-extraction: no fiat-bridge; Tier C does not require fiat upgrade-purchase. Per BP017 Three-Tier Sovereignty canon (KN-H1).';

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS tier_chosen_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_preferences.tier_chosen_at IS
  'Timestamp when the user last set lb_frame_resource_config_tier. Updated on every re-selection (tier choice is reversible). '
  'NULL until first tier pick at Handshake. Composes with KN102 cohort_class (orthogonal axis).';

-- ── Step 3: index for analytics + admin queries ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_preferences_lb_frame_resource_tier
  ON public.user_preferences(lb_frame_resource_config_tier)
  WHERE lb_frame_resource_config_tier IS NOT NULL;

-- ── Step 4: function: set_lb_frame_resource_config_tier ───────────────────
-- Called from the platform UI at Handshake Step 1.3. User-sovereign: any member
-- can set any tier (no fiat-bridge enforcement at DB layer; advisory only at app layer).
-- Updates tier_chosen_at on every call (re-selection supported).
CREATE OR REPLACE FUNCTION public.set_lb_frame_resource_config_tier(
  p_user_id    UUID,
  p_tier       public.lb_frame_resource_tier,
  p_chosen_at  TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prev_tier public.lb_frame_resource_tier;
BEGIN
  -- Get previous tier for changelog
  SELECT lb_frame_resource_config_tier INTO v_prev_tier
  FROM public.user_preferences
  WHERE user_id = p_user_id;

  -- Upsert: create row if missing (first time user_preferences entry)
  INSERT INTO public.user_preferences (user_id, lb_frame_resource_config_tier, tier_chosen_at)
  VALUES (p_user_id, p_tier, p_chosen_at)
  ON CONFLICT (user_id) DO UPDATE
    SET lb_frame_resource_config_tier = EXCLUDED.lb_frame_resource_config_tier,
        tier_chosen_at                 = EXCLUDED.tier_chosen_at,
        updated_at                     = NOW();

  RETURN jsonb_build_object(
    'success',        true,
    'user_id',        p_user_id,
    'tier',           p_tier::TEXT,
    'prev_tier',      v_prev_tier::TEXT,
    'tier_chosen_at', p_chosen_at,
    'reselection',    (v_prev_tier IS NOT NULL AND v_prev_tier <> p_tier)
  );
END;
$$;

-- ── Step 5: function: get_lb_frame_resource_config_tier ───────────────────
-- Read-only: returns tier + tier_chosen_at for a given member.
-- Called by MCP tool get_lb_frame_resource_config_tier at Handshake Phase 1 Discovery.
-- BRIDLE Rule 4: if row not found, returns NULL tier (not_chosen state).
CREATE OR REPLACE FUNCTION public.get_lb_frame_resource_config_tier(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  v_tier       public.lb_frame_resource_tier;
  v_chosen_at  TIMESTAMPTZ;
BEGIN
  SELECT lb_frame_resource_config_tier, tier_chosen_at
  INTO   v_tier, v_chosen_at
  FROM   public.user_preferences
  WHERE  user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'user_id',       p_user_id,
      'tier',          NULL,
      'tier_chosen_at', NULL,
      'tier_state',    'not_chosen',
      'tier_label',    NULL,
      'tier_metadata', NULL
    );
  END IF;

  RETURN jsonb_build_object(
    'user_id',        p_user_id,
    'tier',           v_tier::TEXT,
    'tier_chosen_at', v_chosen_at,
    'tier_state',     CASE WHEN v_tier IS NULL THEN 'not_chosen' ELSE 'chosen' END,
    'tier_label',     CASE v_tier
                        WHEN 'needs'    THEN 'Tier A — NEEDS (whatever you have; no upgrade required)'
                        WHEN 'suggests' THEN 'Tier B — SUGGESTS (recommended uplift; better experience)'
                        WHEN 'founder'  THEN 'Tier C — FOUNDER (empirical-receipt-source; maximum-velocity)'
                        ELSE NULL
                      END,
    'tier_metadata',  CASE v_tier
                        WHEN 'needs' THEN jsonb_build_object(
                          'plan_requirement', 'default Claude Code plan',
                          'upgrade_required', false,
                          'anyone_can_run',   true,
                          'empirical_note',   'Cathedral Effect baseline lift at default-plan-class'
                        )
                        WHEN 'suggests' THEN jsonb_build_object(
                          'plan_recommendation', 'Claude Code Max or equivalent',
                          'upgrade_required',     false,
                          'anyone_can_run',        true,
                          'empirical_note',        'Documented uplift over Tier A; spec values in KN-H3'
                        )
                        WHEN 'founder' THEN jsonb_build_object(
                          'plan_note',        'Founder-customized plan (self-attested)',
                          'upgrade_required', false,
                          'anyone_can_run',   true,
                          'empirical_note',   'BP015->BP017 cascade generated under Tier C; empirical-receipt-source'
                        )
                        ELSE NULL
                      END
  );
END;
$$;

-- ── Step 6: RLS policies ──────────────────────────────────────────────────
-- user_preferences already has row-level security enabled with policies:
--   "Users manage own preferences" USING (auth.uid() = user_id)
--   "Authenticated read user_preferences" FOR SELECT
-- No new policies needed — new columns inherit existing table RLS.

-- ── Step 7: grant execute on new functions ────────────────────────────────
GRANT EXECUTE ON FUNCTION public.set_lb_frame_resource_config_tier(UUID, public.lb_frame_resource_tier, TIMESTAMPTZ)
  TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_lb_frame_resource_config_tier(UUID)
  TO authenticated, anon, service_role;
