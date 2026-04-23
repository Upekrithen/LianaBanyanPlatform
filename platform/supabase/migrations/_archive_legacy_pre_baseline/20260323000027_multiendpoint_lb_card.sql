-- ============================================
-- MIGRATION: 20260323000027_multiendpoint_lb_card.sql
-- Knight Session 95: Multi-Endpoint Webhooks + LB Card Provider-Agnostic
-- ============================================

-- =============================================
-- TRANSACTION CLASSIFICATION ENGINE
-- Each payment gets a ledger category at the webhook level
-- =============================================

CREATE TABLE IF NOT EXISTS transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_event_id TEXT UNIQUE,
  ledger_category TEXT NOT NULL CHECK (ledger_category IN (
    'membership',
    'commerce_storefront',
    'commerce_creator',
    'commerce_platform',
    'commerce_gleaners',
    'project_funding',
    'project_funder_credit',
    'project_seeding',
    'project_platform_cap',
    'project_escrow',
    'guild_payment',
    'coalition_fee',
    'housing_fund',
    'subscription',
    'card_funding',
    'card_transaction'
  )),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  payer_id UUID REFERENCES auth.users(id),
  payee_id UUID REFERENCES auth.users(id),
  storefront_id UUID,
  project_id UUID,
  initiative_id UUID,
  is_patronage BOOLEAN NOT NULL DEFAULT true,
  patronage_type TEXT CHECK (patronage_type IN ('purchase', 'labor', 'service', 'seeding', NULL)),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'held')),
  blockchain_tx_hash TEXT,
  blockchain_anchored_at TIMESTAMPTZ,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  webhook_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON transaction_ledger
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);
CREATE POLICY "Admin manages all ledger" ON transaction_ledger
  FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_ledger_category ON transaction_ledger(ledger_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_payer ON transaction_ledger(payer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_payee ON transaction_ledger(payee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_stripe ON transaction_ledger(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_ledger_project ON transaction_ledger(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ledger_patronage ON transaction_ledger(is_patronage, ledger_category);

-- Patronage vs Non-Patronage summary (Subchapter T annual reporting)
CREATE OR REPLACE VIEW ledger_patronage_summary AS
SELECT
  EXTRACT(YEAR FROM created_at) AS fiscal_year,
  is_patronage,
  ledger_category,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_cents,
  SUM(amount_cents) / 100.0 AS total_dollars
FROM transaction_ledger
WHERE status = 'completed'
GROUP BY fiscal_year, is_patronage, ledger_category
ORDER BY fiscal_year DESC, is_patronage DESC, total_cents DESC;

-- Per-member patronage summary (annual allocation calculation)
CREATE OR REPLACE VIEW member_patronage_summary AS
SELECT
  COALESCE(payer_id, payee_id) AS member_id,
  EXTRACT(YEAR FROM created_at) AS fiscal_year,
  patronage_type,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_cents,
  SUM(amount_cents) / 100.0 AS total_dollars
FROM transaction_ledger
WHERE status = 'completed' AND is_patronage = true
GROUP BY member_id, fiscal_year, patronage_type;

-- =============================================
-- PROVIDER-AGNOSTIC COLUMNS on LB Card tables
-- Existing tables from migration 000010 use Stripe-specific naming.
-- Add provider-agnostic columns so we can plug in Unit or Lithic.
-- =============================================

ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'pending'
  CHECK (provider IN ('pending', 'stripe', 'unit', 'lithic'));
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS provider_cardholder_id TEXT;
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false;
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS frozen_reason TEXT;
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_started'
  CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected'));
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS spending_limit_daily_cents INTEGER DEFAULT 500000;
ALTER TABLE lb_cardholders ADD COLUMN IF NOT EXISTS spending_limit_monthly_cents INTEGER DEFAULT 5000000;

ALTER TABLE lb_cards ADD COLUMN IF NOT EXISTS provider_card_id TEXT;

ALTER TABLE lb_card_transactions ADD COLUMN IF NOT EXISTS provider_authorization_id TEXT;
ALTER TABLE lb_card_transactions ADD COLUMN IF NOT EXISTS decline_reason TEXT;

ALTER TABLE lb_card_funding ADD COLUMN IF NOT EXISTS ledger_entry_id UUID REFERENCES transaction_ledger(id);

-- =============================================
-- LB CARD FEATURE FLAGS
-- =============================================

INSERT INTO founder_feature_flags (feature_key, is_enabled, notes) VALUES
  ('lb_card_enabled', false, 'Enable when card provider is connected'),
  ('lb_card_provider', false, 'Current provider: pending (stripe/unit/lithic)')
ON CONFLICT (feature_key) DO NOTHING;
