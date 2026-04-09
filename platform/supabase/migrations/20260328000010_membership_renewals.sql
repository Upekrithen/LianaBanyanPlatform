-- K151: membership_renewals table for Marks Payback renewal tracking
-- Mechanic: At 100+ Marks in a membership year, next renewal auto-deducts 5 Credits.

CREATE TABLE IF NOT EXISTS membership_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  renewal_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT NOT NULL CHECK (method IN ('credits', 'stripe', 'free_trial')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  marks_at_renewal INTEGER NOT NULL DEFAULT 0,
  credits_deducted NUMERIC(10,2) DEFAULT 0,
  stripe_payment_id TEXT,
  membership_year_start TIMESTAMPTZ,
  membership_year_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_renewals_member
  ON membership_renewals(member_id);

CREATE INDEX IF NOT EXISTS idx_membership_renewals_date
  ON membership_renewals(renewal_date DESC);

ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own renewals"
  ON membership_renewals FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Service role can insert renewals"
  ON membership_renewals FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE membership_renewals IS
  'Tracks membership renewal events — whether paid via Credits (Marks Payback), Stripe, or free trial.';
