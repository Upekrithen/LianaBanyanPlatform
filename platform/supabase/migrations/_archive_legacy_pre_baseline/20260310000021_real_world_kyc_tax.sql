-- ═══════════════════════════════════════════════════════════════════════════════
-- REAL WORLD KYC & TAX INFRASTRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Implements the "Go Live" gate database layer:
--   1. profiles updates  — KYC status, tax form collection, jurisdiction
--   2. tax_tracking table — YTD barter income/expense for Barter Wash mechanic
--
-- The "Barter Wash" Mechanic:
--   If a member earns $1,000 in Marks (taxable barter income) and spends those
--   Marks to hire someone on the platform (deductible business expense), the net
--   taxable impact is $0. The platform tracks both sides automatically.
--
-- Ghost → Real transition:
--   Users remain in Ghost World (kyc_status = 'unverified') until they
--   pass KYC via the "Go Live" wizard. Edge Functions must check
--   kyc_status = 'verified' before processing any real transaction.
--
-- Spec: BISHOP_DROPZONE/SPEC_REAL_WORLD_KYC_PROTOCOL.md
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 1. ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE kyc_status_enum AS ENUM (
    'unverified',   -- Ghost World (default)
    'pending',      -- KYC submitted, awaiting verification
    'verified',     -- Cleared for Real World transactions
    'rejected'      -- KYC failed / flagged
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tax_form_status_enum AS ENUM (
    'none',             -- No tax form collected yet
    'w9_collected',     -- US person — W-9 on file
    'w8ben_collected'   -- Non-US person — W-8BEN on file
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. PROFILES UPDATES ──────────────────────────────────────────────────────
-- Add KYC and tax columns to the existing profiles table.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum NOT NULL DEFAULT 'unverified';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_provider_ref TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tax_form_status tax_form_status_enum NOT NULL DEFAULT 'none';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_of_residence TEXT;

-- Index for quick lookups on KYC status (Edge Function guardrails)
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status
  ON public.profiles (kyc_status);

COMMENT ON COLUMN public.profiles.kyc_status IS
  'Ghost/Real boundary. Must be verified before any fiat or barter transaction.';
COMMENT ON COLUMN public.profiles.kyc_provider_ref IS
  'External KYC provider reference (e.g., Stripe Identity verification ID).';
COMMENT ON COLUMN public.profiles.tax_form_status IS
  'Tax form collection status. W-9 for US, W-8BEN for international.';
COMMENT ON COLUMN public.profiles.country_of_residence IS
  'ISO country code or full name. Determines tax form requirements (W-9 vs W-8BEN).';


-- ── 3. TAX TRACKING TABLE ────────────────────────────────────────────────────
-- Year-to-date tax tracking for the Barter Wash mechanic and 1099-K thresholds.
-- One row per user per tax year.

CREATE TABLE IF NOT EXISTS public.tax_tracking (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_year        INTEGER NOT NULL,

  -- Fiat (Credits) tracking — for 1099-K threshold monitoring
  fiat_volume_ytd       NUMERIC NOT NULL DEFAULT 0,

  -- Barter (Marks) tracking — the Barter Wash
  marks_earned_ytd      NUMERIC NOT NULL DEFAULT 0,    -- Gross barter income (taxable)
  marks_spent_ytd       NUMERIC NOT NULL DEFAULT 0,    -- Deductible barter expense (the wash)

  -- Transaction volume — for 1099-K transaction count threshold
  transaction_count_ytd INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One tracking row per user per year
  CONSTRAINT tax_tracking_user_year_unique UNIQUE (user_id, tax_year)
);

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS idx_tax_tracking_user_year
  ON public.tax_tracking (user_id, tax_year);

CREATE INDEX IF NOT EXISTS idx_tax_tracking_year
  ON public.tax_tracking (tax_year);

COMMENT ON TABLE public.tax_tracking IS
  'YTD tax tracking for Barter Wash mechanic. Marks earned = taxable income; Marks spent = deductible expense.';
COMMENT ON COLUMN public.tax_tracking.fiat_volume_ytd IS
  'Year-to-date fiat (Credits) volume in USD. Monitored for 1099-K threshold ($600).';
COMMENT ON COLUMN public.tax_tracking.marks_earned_ytd IS
  'Year-to-date Marks earned (gross barter income). Fair Market Value = taxable income.';
COMMENT ON COLUMN public.tax_tracking.marks_spent_ytd IS
  'Year-to-date Marks spent hiring others (deductible business expense). The Barter Wash offset.';
COMMENT ON COLUMN public.tax_tracking.transaction_count_ytd IS
  'Year-to-date transaction count. Monitored alongside fiat_volume for 1099-K thresholds.';


-- ── 4. RLS POLICIES ──────────────────────────────────────────────────────────

ALTER TABLE public.tax_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read their own tax tracking data
CREATE POLICY "tax_tracking_select_own"
  ON public.tax_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (Edge Functions / server-side) can insert/update tax volumes.
-- Regular users cannot manipulate their own tax data.
CREATE POLICY "tax_tracking_insert_service"
  ON public.tax_tracking
  FOR INSERT
  WITH CHECK (
    -- Service role bypasses RLS entirely, but as a defense-in-depth:
    auth.uid() = user_id
    AND current_setting('role') = 'service_role'
  );

CREATE POLICY "tax_tracking_update_service"
  ON public.tax_tracking
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND current_setting('role') = 'service_role'
  );

-- No user-level DELETE — tax records are append-only within a year
-- Admin override: direct DB access via Supabase dashboard


-- ── 5. UPDATED_AT TRIGGER ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION tax_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tax_tracking_updated_at ON public.tax_tracking;
CREATE TRIGGER trg_tax_tracking_updated_at
  BEFORE UPDATE ON public.tax_tracking
  FOR EACH ROW EXECUTE FUNCTION tax_tracking_updated_at();


-- ── 6. HELPER VIEW ───────────────────────────────────────────────────────────
-- Net taxable barter position per user per year (the Barter Wash result)

CREATE OR REPLACE VIEW public.v_barter_wash_summary AS
SELECT
  user_id,
  tax_year,
  marks_earned_ytd                          AS gross_barter_income,
  marks_spent_ytd                           AS barter_expense_deduction,
  (marks_earned_ytd - marks_spent_ytd)      AS net_taxable_barter,
  fiat_volume_ytd                           AS fiat_volume,
  transaction_count_ytd                     AS transaction_count,
  -- 1099-K threshold flag (current IRS threshold: $600)
  CASE
    WHEN fiat_volume_ytd >= 600 THEN true
    ELSE false
  END                                       AS exceeds_1099k_threshold,
  -- Barter threshold flag (1099-B at $600 FMV)
  CASE
    WHEN marks_earned_ytd >= 600 THEN true
    ELSE false
  END                                       AS exceeds_barter_threshold
FROM public.tax_tracking;

COMMENT ON VIEW public.v_barter_wash_summary IS
  'Read-only view showing each user''s Barter Wash position. Net = earned - spent.';

-- RLS on the underlying table already protects this view.
-- Users can only see rows where auth.uid() = user_id.
