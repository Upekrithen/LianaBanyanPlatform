-- K525 · Phase A.2 + Phase D.1 + Phase C.1
-- Conductor's Baton LAUNCH: cost-cap columns, feature flags, receipt-share opt-in
-- Migration: 20260427120001_k525_conductor_cost_cap_and_flags.sql
--
-- Adds:
--   1. Per-member monthly Conductor spend ledger + opt-in cap (Phase A.2)
--   2. Per-member opt-in for public Cost-Slasher receipt sharing (Phase C.1)
--   3. Platform-wide feature_flags table for staged rollout (Phase D.1)
--      seeded with CONDUCTOR_BATON_ENABLED = false until Prov 14 trigger
--
-- Forward-only migration. No drops; existing K446a column (conductor_mode) untouched.

-- =============================================================================
-- 1. Cost-cap columns on members
-- =============================================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS monthly_conductor_spend_usd NUMERIC(12,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_conductor_cap_usd   NUMERIC(12,4),
  ADD COLUMN IF NOT EXISTS monthly_conductor_period_start DATE;

COMMENT ON COLUMN public.members.monthly_conductor_spend_usd IS
  'Running USD total spent through the Conductor router this billing period (#2277, K525). '
  'Reset to 0 when monthly_conductor_period_start rolls over to a new month.';

COMMENT ON COLUMN public.members.monthly_conductor_cap_usd IS
  'Optional monthly USD cap on Conductor-routed spend (#2272, K525). NULL = no cap. '
  'When monthly_conductor_spend_usd >= this value, the router forces mode=manual until reset.';

COMMENT ON COLUMN public.members.monthly_conductor_period_start IS
  'YYYY-MM-01 of the current billing period (UTC). Stale value triggers a reset on next write.';

-- =============================================================================
-- 2. Receipt-share opt-in (default OPT-OUT per B129 founder direction)
-- =============================================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS conductor_receipt_share_optin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.members.conductor_receipt_share_optin IS
  'Member opted in to public Cost-Slasher receipt sharing (#2272, K525). '
  'Default FALSE — only members who explicitly opt in expose a public-shareable savings receipt. '
  'B129 Founder direction: "only actual losers pre-check something that will help them unless you uncheck it."';

-- =============================================================================
-- 3. Platform-wide feature_flags table (Phase D.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  flag_key      TEXT PRIMARY KEY,
  enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT,
  rollout_wave  TEXT,                              -- 'wave_0' | 'wave_1' | 'wave_2' | 'rolled_back'
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.feature_flags IS
  'Platform-wide feature flags for staged rollout (K525). Single canonical source: '
  'when enabled=false the feature is fully disabled (rollback). UI hooks read this table '
  'on render; flag flips propagate within seconds via Supabase realtime if subscribed.';

-- Seed CONDUCTOR_BATON_ENABLED = false (locked until Prov 14 trigger)
INSERT INTO public.feature_flags (flag_key, enabled, description, rollout_wave)
VALUES (
  'CONDUCTOR_BATON_ENABLED',
  FALSE,
  'Conductor''s Baton master kill switch. Wave 0 dogfood (Founder-only) requires Founder ' ||
  'to flip this to TRUE in their own session. Wave 1 / Wave 2 require platform-wide flip ' ||
  'gated on Prov 14 filing. Rollback: flip to FALSE; all members fall back to single-vendor ' ||
  'Anthropic until investigation resolved.',
  'wave_0'
)
ON CONFLICT (flag_key) DO NOTHING;

-- Seed CONDUCTOR_RECEIPT_PUBLIC_SHARE = false (member-facing receipt page locked until Prov 14)
INSERT INTO public.feature_flags (flag_key, enabled, description, rollout_wave)
VALUES (
  'CONDUCTOR_RECEIPT_PUBLIC_SHARE',
  FALSE,
  'When TRUE, opted-in members can share a public Cost-Slasher receipt URL (#2272 closure). '
  'Locked until Prov 14 trigger fires. Internal/dogfood receipts remain visible in the member''s '
  'own Helm regardless.',
  'wave_0'
)
ON CONFLICT (flag_key) DO NOTHING;

-- =============================================================================
-- 4. RLS policies for feature_flags
-- =============================================================================

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Public read: anyone authenticated can read flags (so UI gating works)
DROP POLICY IF EXISTS "feature_flags_read" ON public.feature_flags;
CREATE POLICY "feature_flags_read"
  ON public.feature_flags
  FOR SELECT
  USING (true);

-- Write: service role only (admin operations); members cannot flip flags
-- (No INSERT/UPDATE/DELETE policy = denied for non-service-role)

-- =============================================================================
-- 5. Index for fast period-rollover scans
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_members_conductor_period_start
  ON public.members (monthly_conductor_period_start)
  WHERE monthly_conductor_cap_usd IS NOT NULL;

-- =============================================================================
-- Done.
-- =============================================================================
