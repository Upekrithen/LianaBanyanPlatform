-- 20260619_membership_subscription_substrate_market_bp087.sql
-- BLACK MAMBA Pay-to-Join BP087
-- Knight ships. Bishop applies via: psql $SUPABASE_DB_URL -f <path>

CREATE TABLE IF NOT EXISTS mnemosynec_members (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id      TEXT UNIQUE NOT NULL,
  email                  TEXT,
  intent                 TEXT NOT NULL DEFAULT 'other',
  status                 TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  joined_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_paid_at          TIMESTAMPTZ,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mnemosynec_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON mnemosynec_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "anon_read_own_by_session" ON mnemosynec_members
  FOR SELECT USING (true);

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS first_paid_at           TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_mnemosynec_members_stripe_session
  ON mnemosynec_members (stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_membership_payments_stripe_session
  ON membership_payments (stripe_session_id);
