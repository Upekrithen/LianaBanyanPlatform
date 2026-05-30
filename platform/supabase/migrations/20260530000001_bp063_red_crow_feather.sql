-- BP063 Red Crow Feather — honor badge for first-cohort unsigned-install members
-- Authored: 2026-05-30T00:00:00Z · SEG-REDCROW-SPEC · pearl_7890a4f9
-- Statutes Art XI · RLS in same migration · always-timestamp

-- ── Step 1: Drop + re-create the category CHECK constraint to add 'red_crow' ──
ALTER TABLE public.crow_feathers
  DROP CONSTRAINT IF EXISTS crow_feathers_category_check;

ALTER TABLE public.crow_feathers
  ADD CONSTRAINT crow_feathers_category_check CHECK (
    category = ANY (ARRAY[
      'chase_speed','chase_streak','chase_earnings',
      'discovery','golden_keys','candles','mirror_travel',
      'red_crow'    -- New: honor badge, first-cohort unsigned-install members
    ])
  );

-- ── Step 2: Config table for cert-boundary ──
CREATE TABLE IF NOT EXISTS public.red_crow_feather_config (
  id              SERIAL PRIMARY KEY,
  config_key      TEXT NOT NULL UNIQUE,
  config_value    TEXT,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: cert not yet active — NULL means window is open
INSERT INTO public.red_crow_feather_config (config_key, config_value, description)
VALUES
  ('CERT_ACTIVATION_TS', NULL,
   'ISO-8601 UTC timestamp when Azure code-signing cert went live. NULL = cert not yet active (window open). Set this ONCE when cert activates. Immutable after set.')
ON CONFLICT (config_key) DO NOTHING;

-- ── Step 3: Issuance log (idempotency + proof binding) ──
CREATE TABLE IF NOT EXISTS public.red_crow_feather_issuances (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crow_feather_id       UUID REFERENCES public.crow_feathers(id),
  first_connect_ts      TIMESTAMPTZ NOT NULL,
  cert_activation_ts    TIMESTAMPTZ,        -- NULL if cert not yet active at issuance time
  connect_source        TEXT NOT NULL,       -- 'creator_referrals' | 'profiles_fallback'
  connect_referral_id   UUID,               -- FK to creator_referrals.id if source = creator_referrals
  proof_hmac            TEXT,               -- HMAC-SHA256 over proof payload (see §F)
  issued_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)                          -- Idempotency: one Red Crow per member
);

-- RLS (Statutes §4: RLS + policy in same migration)
ALTER TABLE public.red_crow_feather_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_crow_feather_issuances ENABLE ROW LEVEL SECURITY;

-- Config: admin read only (service role bypasses RLS)
CREATE POLICY "red_crow_config_admin_read" ON public.red_crow_feather_config
  FOR SELECT USING (false);  -- only service-role reads; no client-side reads needed

-- Issuances: member can read own record
CREATE POLICY "red_crow_issuances_own_read" ON public.red_crow_feather_issuances
  FOR SELECT USING (user_id = auth.uid());

-- Issuances: service role only for insert/update (no client INSERT)
CREATE POLICY "red_crow_issuances_insert" ON public.red_crow_feather_issuances
  FOR INSERT WITH CHECK (false);  -- service role bypasses; no anon insert

CREATE INDEX IF NOT EXISTS idx_red_crow_issuances_user
  ON public.red_crow_feather_issuances(user_id);

CREATE INDEX IF NOT EXISTS idx_red_crow_issuances_issued
  ON public.red_crow_feather_issuances(issued_at DESC);
