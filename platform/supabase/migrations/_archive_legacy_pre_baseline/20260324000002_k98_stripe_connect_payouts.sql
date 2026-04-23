-- ============================================
-- K98: Stripe Connect Payouts
-- New tables for Connect accounts + payout history
-- Adds payout_preference to lb_cardholders
-- ============================================

-- =============================================
-- TABLE 1: member_connect_accounts
-- =============================================

CREATE TABLE member_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_status IN ('not_started', 'pending', 'complete', 'restricted')),
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  default_payout_speed TEXT NOT NULL DEFAULT 'standard'
    CHECK (default_payout_speed IN ('standard', 'instant')),
  country TEXT DEFAULT 'US',
  stripe_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 2: member_payouts
-- =============================================

CREATE TABLE member_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  connect_account_id UUID NOT NULL REFERENCES member_connect_accounts(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  fee_cents INTEGER NOT NULL DEFAULT 0,
  net_amount_cents INTEGER NOT NULL,
  payout_speed TEXT NOT NULL CHECK (payout_speed IN ('standard', 'instant')),
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'canceled')),
  failure_reason TEXT,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COLUMN: payout_preference on lb_cardholders
-- =============================================

ALTER TABLE lb_cardholders
  ADD COLUMN IF NOT EXISTS payout_preference TEXT DEFAULT 'lb_card'
    CHECK (payout_preference IN ('lb_card', 'connect_instant', 'connect_standard'));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_connect_accounts_user ON member_connect_accounts(user_id);
CREATE INDEX idx_connect_accounts_stripe ON member_connect_accounts(stripe_account_id);
CREATE INDEX idx_payouts_user ON member_payouts(user_id, created_at DESC);
CREATE INDEX idx_payouts_status ON member_payouts(status, created_at DESC);
CREATE INDEX idx_payouts_stripe_transfer ON member_payouts(stripe_transfer_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE member_connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own connect account" ON member_connect_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own payouts" ON member_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manages all connect accounts" ON member_connect_accounts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin manages all payouts" ON member_payouts
  FOR ALL USING (public.is_admin());

-- Allow members to update their own payout_preference
CREATE POLICY "Users update own payout preference" ON lb_cardholders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- LEDGER CATEGORIES: add connect payout types
-- =============================================

ALTER TABLE transaction_ledger DROP CONSTRAINT IF EXISTS transaction_ledger_ledger_category_check;
ALTER TABLE transaction_ledger ADD CONSTRAINT transaction_ledger_ledger_category_check
  CHECK (ledger_category IN (
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
    'card_transaction',
    'connect_payout',
    'connect_payout_fee'
  ));

-- =============================================
-- FEATURE FLAG
-- =============================================

INSERT INTO founder_feature_flags (feature_key, is_enabled, enabled_at, notes)
VALUES ('connect_payouts_enabled', false, NULL, 'Enable after first Connect account tested')
ON CONFLICT (feature_key) DO NOTHING;
