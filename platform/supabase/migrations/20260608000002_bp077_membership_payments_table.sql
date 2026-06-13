-- BP077 — membership_payments table + member_profiles Stripe columns
-- These were in archive legacy migrations but never applied to the baseline.
-- Required by create-membership-checkout and handle-membership-webhook edge functions.

-- ─── membership_payments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             UUID NOT NULL REFERENCES auth.users(id),
  amount                NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  currency              TEXT DEFAULT 'usd',
  stripe_session_id     TEXT,
  stripe_payment_intent TEXT,
  status                TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  period_start          DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end            DATE NOT NULL DEFAULT (CURRENT_DATE + interval '1 year'),
  is_renewal            BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_membership_payments_member
  ON membership_payments(member_id, status);

CREATE INDEX IF NOT EXISTS idx_membership_payments_stripe
  ON membership_payments(stripe_session_id);

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own payments"
  ON membership_payments FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Members can insert own payments"
  ON membership_payments FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Service role full access to membership_payments"
  ON membership_payments FOR ALL
  USING (auth.role() = 'service_role');

-- ─── member_profiles — add Stripe/membership columns if absent ───────────────
ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS membership_status     TEXT DEFAULT 'inactive'
    CHECK (membership_status IN ('inactive', 'active', 'cancelled', 'expired', 'lifetime')),
  ADD COLUMN IF NOT EXISTS membership_expires_at DATE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id    TEXT;

CREATE INDEX IF NOT EXISTS idx_member_profiles_membership_status
  ON member_profiles(membership_status);
