-- K431: Upekrithen-scoped Pedestal Stake tables
-- Two-track economy separation: upekrithen.* tables are NOT in public schema.
-- No FK to public.members — a natural person can be both a cooperative member
-- and a Pedestal Stake holder, but the systems track them independently.
--
-- STAGED ONLY — do NOT apply until Founder is ready.

-- 1. Create the upekrithen schema
CREATE SCHEMA IF NOT EXISTS upekrithen;

-- Expose upekrithen schema to PostgREST (required for Supabase client access)
ALTER DEFAULT PRIVILEGES IN SCHEMA upekrithen GRANT ALL ON TABLES TO postgres, service_role;
GRANT USAGE ON SCHEMA upekrithen TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA upekrithen TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA upekrithen GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- ============================================================================
-- Table 1: upekrithen.pedestal_early_interest
-- Testing-the-waters signups (allowed under Reg CF before offering launches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS upekrithen.pedestal_early_interest (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    name            TEXT,
    user_id         UUID REFERENCES auth.users(id),
    consent_given   BOOLEAN NOT NULL DEFAULT false,
    consent_text    TEXT NOT NULL,
    consent_version TEXT NOT NULL DEFAULT '1.0',
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    source_page     TEXT,
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    source          TEXT DEFAULT 'web',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_upekrithen_early_interest_email
    ON upekrithen.pedestal_early_interest(email);

-- ============================================================================
-- Table 2: upekrithen.pedestal_applications
-- Full application pipeline — K432 wires the real flow
-- ============================================================================
CREATE TABLE IF NOT EXISTS upekrithen.pedestal_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id         UUID NOT NULL REFERENCES auth.users(id),
    status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'kyc_pending', 'kyc_approved', 'kyc_rejected',
        'form_c_accepted', 'subscription_pending', 'subscription_signed',
        'payment_pending', 'payment_completed', 'issued', 'cancelled', 'rejected'
    )),
    -- Investor self-declared financials
    income_attested     INTEGER,
    net_worth_attested  INTEGER,
    computed_cap        INTEGER,
    -- Form C / OM acceptance
    form_c_accepted_timestamp       TIMESTAMPTZ,
    -- Subscription agreement
    subscription_agreement_signed_at TIMESTAMPTZ,
    -- KYC
    kyc_provider        TEXT,
    kyc_result          JSONB DEFAULT '{}',
    -- Bad actor check (Reg CF requirement)
    bad_actor_check_result JSONB DEFAULT '{}',
    -- Metadata
    state_of_residence  TEXT,
    country_of_residence TEXT DEFAULT 'US',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upekrithen_applications_investor
    ON upekrithen.pedestal_applications(investor_id);
CREATE INDEX IF NOT EXISTS idx_upekrithen_applications_status
    ON upekrithen.pedestal_applications(status);

-- ============================================================================
-- Table 3: upekrithen.pedestal_holders
-- Issued stake records — NO FK to public.members
-- ============================================================================
CREATE TABLE IF NOT EXISTS upekrithen.pedestal_holders (
    holder_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id     UUID REFERENCES upekrithen.pedestal_applications(id),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    stake_count         INTEGER NOT NULL DEFAULT 0,
    certificate_url     TEXT,
    issued_at           TIMESTAMPTZ,
    full_name           TEXT NOT NULL,
    email               TEXT NOT NULL,
    state_of_residence  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upekrithen_holders_user ON upekrithen.pedestal_holders(user_id);

-- ============================================================================
-- Table 4: upekrithen.pedestal_issuance_log
-- Immutable audit trail — write-only. No UPDATE, no DELETE.
-- ============================================================================
CREATE TABLE IF NOT EXISTS upekrithen.pedestal_issuance_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holder_id   UUID NOT NULL REFERENCES upekrithen.pedestal_holders(holder_id),
    action      TEXT NOT NULL,
    actor       TEXT NOT NULL,
    details     JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upekrithen_issuance_log_holder
    ON upekrithen.pedestal_issuance_log(holder_id);

-- ============================================================================
-- Table 5: upekrithen.regcf_offering_raises
-- Annual cap tracking per 12-month rolling window (Reg CF: $5M/year)
-- ============================================================================
CREATE TABLE IF NOT EXISTS upekrithen.regcf_offering_raises (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start            DATE NOT NULL,
    period_end              DATE NOT NULL,
    cumulative_raised_usd   INTEGER NOT NULL DEFAULT 0,
    annual_cap_usd          INTEGER NOT NULL DEFAULT 5000000,
    holder_count            INTEGER NOT NULL DEFAULT 0,
    last_updated            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Updated-at triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION upekrithen.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON upekrithen.pedestal_applications;
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON upekrithen.pedestal_applications
    FOR EACH ROW EXECUTE FUNCTION upekrithen.update_updated_at();

DROP TRIGGER IF EXISTS trg_holders_updated_at ON upekrithen.pedestal_holders;
CREATE TRIGGER trg_holders_updated_at
    BEFORE UPDATE ON upekrithen.pedestal_holders
    FOR EACH ROW EXECUTE FUNCTION upekrithen.update_updated_at();

-- ============================================================================
-- RLS policies
-- ============================================================================

-- Early interest
ALTER TABLE upekrithen.pedestal_early_interest ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ei_anon_insert" ON upekrithen.pedestal_early_interest;
CREATE POLICY "ei_anon_insert" ON upekrithen.pedestal_early_interest
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ei_staff_select" ON upekrithen.pedestal_early_interest;
CREATE POLICY "ei_staff_select" ON upekrithen.pedestal_early_interest
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder', 'moderator')
        )
    );

-- Applications
ALTER TABLE upekrithen.pedestal_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_own_read" ON upekrithen.pedestal_applications;
CREATE POLICY "app_own_read" ON upekrithen.pedestal_applications
    FOR SELECT USING (investor_id = auth.uid());
DROP POLICY IF EXISTS "app_staff_read" ON upekrithen.pedestal_applications;
CREATE POLICY "app_staff_read" ON upekrithen.pedestal_applications
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
        )
    );
DROP POLICY IF EXISTS "app_investor_insert" ON upekrithen.pedestal_applications;
CREATE POLICY "app_investor_insert" ON upekrithen.pedestal_applications
    FOR INSERT WITH CHECK (investor_id = auth.uid());

-- Holders
ALTER TABLE upekrithen.pedestal_holders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "holders_own_read" ON upekrithen.pedestal_holders;
CREATE POLICY "holders_own_read" ON upekrithen.pedestal_holders
    FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "holders_staff_read" ON upekrithen.pedestal_holders;
CREATE POLICY "holders_staff_read" ON upekrithen.pedestal_holders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
        )
    );

-- Issuance log: write-only. No UPDATE, no DELETE policy.
ALTER TABLE upekrithen.pedestal_issuance_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "issuance_log_staff_select" ON upekrithen.pedestal_issuance_log;
CREATE POLICY "issuance_log_staff_select" ON upekrithen.pedestal_issuance_log
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
        )
    );
DROP POLICY IF EXISTS "issuance_log_system_insert" ON upekrithen.pedestal_issuance_log;
CREATE POLICY "issuance_log_system_insert" ON upekrithen.pedestal_issuance_log
    FOR INSERT WITH CHECK (true);
-- Explicitly: NO UPDATE or DELETE policies. RLS denies by default.

-- Offering raises
ALTER TABLE upekrithen.regcf_offering_raises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "raises_public_read" ON upekrithen.regcf_offering_raises;
CREATE POLICY "raises_public_read" ON upekrithen.regcf_offering_raises
    FOR SELECT USING (true);

-- ============================================================================
-- Two-track separation enforcement:
-- NO foreign keys from upekrithen.* to public.members (or any public.* member table).
-- A natural person can exist in both systems, but they are tracked independently.
-- The ONLY FK to auth.users is for authentication identity — NOT for cooperative
-- membership equivalence.
-- ============================================================================

-- Seed initial raise tracking period
INSERT INTO upekrithen.regcf_offering_raises
    (period_start, period_end, cumulative_raised_usd, annual_cap_usd, holder_count)
VALUES
    (CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 0, 5000000, 0)
ON CONFLICT DO NOTHING;
