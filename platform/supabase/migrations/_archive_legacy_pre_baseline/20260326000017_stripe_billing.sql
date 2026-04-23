-- K121: Stripe Billing — Subscriptions, Credit Wallets, Creator Payouts
-- Adds subscription-based membership tiers, credit wallet (running balance),
-- and credit transaction ledger alongside existing payment infrastructure.

-- ─── Membership subscriptions (Stripe-managed recurring billing) ────────────
CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,

  tier TEXT DEFAULT 'member' CHECK (tier IN ('free', 'member', 'builder', 'patron')),
  price_usd NUMERIC(10,2),

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Credit wallet (running balance per user) ──────────────────────────────
CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  balance INT DEFAULT 0,
  lifetime_purchased INT DEFAULT 0,
  lifetime_spent INT DEFAULT 0,
  lifetime_earned INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Credit transactions (immutable ledger) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'purchase', 'backing', 'pledge', 'pledge_refund',
    'payout', 'match', 'reward', 'transfer'
  )),
  description TEXT,
  reference_id UUID,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON membership_subscriptions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own wallet"
  ON credit_wallets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert transactions (webhook, edge functions)
CREATE POLICY "Service inserts transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user
  ON credit_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_membership_subs_stripe
  ON membership_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_membership_subs_customer
  ON membership_subscriptions(stripe_customer_id);

-- ─── Bootstrap wallets for existing users ────────────────────────────────────
INSERT INTO credit_wallets (user_id, balance)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
