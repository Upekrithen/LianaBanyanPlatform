-- K427 Workstream 1: Pedestal Stake Consumer Portal — Reg CF Architecture
-- Upekrithen LLC scoped tables — SEPARATE from Liana Banyan Corp cooperative tables
-- Two-track economy: liana_banyan.members ≠ upekrithen.pedestal_holders

-- Early interest signups (testing-the-waters — allowed under Reg CF)
CREATE TABLE IF NOT EXISTS pedestal_early_interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    user_id UUID REFERENCES auth.users(id),
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_text TEXT DEFAULT 'I consent to receive information about the Pedestal Stake offering from Upekrithen LLC.',
    ip_address TEXT,
    source TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pedestal_early_interest_email
    ON pedestal_early_interest(email);

-- Pedestal Stake holders (Upekrithen LLC — NOT Liana Banyan Corp)
CREATE TABLE IF NOT EXISTS pedestal_holders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,

    -- Reg CF investor qualification
    annual_income_usd INTEGER,
    net_worth_usd INTEGER,
    computed_investment_limit_usd INTEGER,
    investor_type TEXT DEFAULT 'retail' CHECK (investor_type IN ('retail', 'accredited')),

    -- KYC
    kyc_provider TEXT,
    kyc_reference_id TEXT,
    kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected', 'manual_review')),
    bad_actor_check_passed BOOLEAN,

    -- Offering
    subscription_amount_usd INTEGER,
    subscription_signed_at TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_reference TEXT,
    intermediary_reference TEXT,

    -- Issuance
    stake_count INTEGER DEFAULT 0,
    issuance_date TIMESTAMPTZ,
    certificate_pdf_url TEXT,

    -- State residence for blue-sky compliance
    state_of_residence TEXT,
    country_of_residence TEXT DEFAULT 'US',

    status TEXT DEFAULT 'applied' CHECK (status IN (
        'applied', 'kyc_pending', 'kyc_approved', 'subscription_pending',
        'payment_pending', 'issued', 'cancelled', 'rejected'
    )),

    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable issuance audit log (write-only — critical for Reg CF compliance)
CREATE TABLE IF NOT EXISTS pedestal_issuance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holder_id UUID NOT NULL REFERENCES pedestal_holders(id),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Annual raise tracking (Reg CF: $5M per 12-month period)
CREATE TABLE IF NOT EXISTS pedestal_raise_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cumulative_raised_usd INTEGER NOT NULL DEFAULT 0,
    annual_cap_usd INTEGER NOT NULL DEFAULT 5000000,
    holder_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cash-flow distributions to holders
CREATE TABLE IF NOT EXISTS pedestal_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holder_id UUID NOT NULL REFERENCES pedestal_holders(id),
    distribution_date DATE NOT NULL,
    amount_usd NUMERIC(12,2) NOT NULL,
    distribution_type TEXT DEFAULT 'quarterly' CHECK (distribution_type IN ('quarterly', 'annual', 'special')),
    payment_method TEXT,
    payment_reference TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'failed')),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Intermediary configuration (pluggable — Founder/counsel selects the actual partner)
CREATE TABLE IF NOT EXISTS pedestal_intermediary_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    provider_type TEXT CHECK (provider_type IN ('funding_portal', 'broker_dealer')),
    api_base_url TEXT,
    webhook_url TEXT,
    config_json JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pedestal_holders_user ON pedestal_holders(user_id);
CREATE INDEX IF NOT EXISTS idx_pedestal_holders_status ON pedestal_holders(status);
CREATE INDEX IF NOT EXISTS idx_pedestal_holders_state ON pedestal_holders(state_of_residence);
CREATE INDEX IF NOT EXISTS idx_pedestal_issuance_holder ON pedestal_issuance_log(holder_id);
CREATE INDEX IF NOT EXISTS idx_pedestal_distributions_holder ON pedestal_distributions(holder_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_pedestal_holder_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pedestal_holder_updated_at ON pedestal_holders;
CREATE TRIGGER trg_pedestal_holder_updated_at
    BEFORE UPDATE ON pedestal_holders
    FOR EACH ROW EXECUTE FUNCTION update_pedestal_holder_updated_at();

-- RLS
ALTER TABLE pedestal_early_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_issuance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_raise_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_intermediary_config ENABLE ROW LEVEL SECURITY;

-- Early interest: anyone can insert (public signup), own-user read
DROP POLICY IF EXISTS "early_interest_insert" ON pedestal_early_interest;
CREATE POLICY "early_interest_insert" ON pedestal_early_interest FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "early_interest_own_read" ON pedestal_early_interest;
CREATE POLICY "early_interest_own_read" ON pedestal_early_interest FOR SELECT
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Holders: own-user read/update, authenticated insert
DROP POLICY IF EXISTS "holders_own_read" ON pedestal_holders;
CREATE POLICY "holders_own_read" ON pedestal_holders FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "holders_own_update" ON pedestal_holders;
CREATE POLICY "holders_own_update" ON pedestal_holders FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "holders_insert" ON pedestal_holders;
CREATE POLICY "holders_insert" ON pedestal_holders FOR INSERT WITH CHECK (user_id = auth.uid());

-- Issuance log: write-only (anyone authenticated can write for audit), holder can read own
DROP POLICY IF EXISTS "issuance_log_insert" ON pedestal_issuance_log;
CREATE POLICY "issuance_log_insert" ON pedestal_issuance_log FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "issuance_log_own_read" ON pedestal_issuance_log;
CREATE POLICY "issuance_log_own_read" ON pedestal_issuance_log FOR SELECT
    USING (holder_id IN (SELECT id FROM pedestal_holders WHERE user_id = auth.uid()));

-- Raise tracking: public read (transparency)
DROP POLICY IF EXISTS "raise_tracking_public_read" ON pedestal_raise_tracking;
CREATE POLICY "raise_tracking_public_read" ON pedestal_raise_tracking FOR SELECT USING (true);

-- Distributions: holder reads own
DROP POLICY IF EXISTS "distributions_own_read" ON pedestal_distributions;
CREATE POLICY "distributions_own_read" ON pedestal_distributions FOR SELECT
    USING (holder_id IN (SELECT id FROM pedestal_holders WHERE user_id = auth.uid()));

-- Intermediary config: no public access (admin-only via service role)
-- No RLS SELECT policy = no public access by default

-- Seed initial raise tracking period
INSERT INTO pedestal_raise_tracking (period_start, period_end, cumulative_raised_usd, annual_cap_usd, holder_count)
VALUES (CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 0, 5000000, 0)
ON CONFLICT DO NOTHING;
