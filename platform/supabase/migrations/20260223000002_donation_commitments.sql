-- =====================================================
-- DONATION COMMITMENT TYPES
-- Four types of giving: Lump Sum, Recurring, Pool, Percentage
-- Created: February 23, 2026
-- =====================================================

-- Based on Architecture Decisions Feb 20, 2026:
-- Type 1: Lump Sum - One-time donation
-- Type 2: Recurring - Monthly with alerts before charging
-- Type 3: Pool - Larger sum drawn from until exhausted
-- Type 4: Percentage - % of project earnings to causes

CREATE TABLE IF NOT EXISTS donation_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Commitment Type
  type TEXT NOT NULL CHECK (type IN ('lump_sum', 'recurring', 'pool', 'percentage')),

  -- Amount (interpretation depends on type)
  -- lump_sum: total donation amount
  -- recurring: amount per period
  -- pool: total pool amount
  -- percentage: percentage value (e.g., 5 for 5%)
  amount DECIMAL(10,2) NOT NULL,

  -- Recurring specific
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  next_charge_date TIMESTAMPTZ,
  alert_before_charge BOOLEAN DEFAULT true,

  -- Pool specific
  remaining_pool DECIMAL(10,2),

  -- Percentage specific
  percentage_amount DECIMAL(5,2),

  -- Target
  target_type TEXT NOT NULL CHECK (target_type IN ('specific_project', 'general_fund', 'category')),
  target_id UUID, -- Project ID if specific_project
  target_name TEXT, -- Cached name for display
  category TEXT CHECK (category IN ('medical', 'housing', 'utilities', 'food', 'education', 'any')),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'exhausted', 'cancelled', 'completed')),

  -- Tracking
  total_donated DECIMAL(10,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  last_donation_date TIMESTAMPTZ,

  -- Stripe
  stripe_subscription_id TEXT,
  stripe_payment_method_id TEXT
);

-- Donation commitment transactions (individual donations from commitments)
CREATE TABLE IF NOT EXISTS donation_commitment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID REFERENCES donation_commitments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  amount DECIMAL(10,2) NOT NULL,

  -- Where it went (no FK to allow flexible ordering of migrations)
  project_id UUID,
  project_name TEXT,

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Notes
  notes TEXT
);

-- Function to process recurring commitments
CREATE OR REPLACE FUNCTION process_recurring_commitment(commitment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  commitment RECORD;
BEGIN
  SELECT * INTO commitment FROM donation_commitments WHERE id = commitment_id;

  IF commitment.status != 'active' OR commitment.type != 'recurring' THEN
    RETURN FALSE;
  END IF;

  -- Update next charge date based on frequency
  UPDATE donation_commitments
  SET next_charge_date = CASE commitment.frequency
    WHEN 'weekly' THEN NOW() + INTERVAL '1 week'
    WHEN 'biweekly' THEN NOW() + INTERVAL '2 weeks'
    WHEN 'monthly' THEN NOW() + INTERVAL '1 month'
    WHEN 'quarterly' THEN NOW() + INTERVAL '3 months'
  END,
  total_donated = total_donated + commitment.amount,
  donation_count = donation_count + 1,
  last_donation_date = NOW(),
  updated_at = NOW()
  WHERE id = commitment_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to draw from pool
CREATE OR REPLACE FUNCTION draw_from_pool(commitment_id UUID, draw_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  commitment RECORD;
BEGIN
  SELECT * INTO commitment FROM donation_commitments WHERE id = commitment_id;

  IF commitment.status != 'active' OR commitment.type != 'pool' THEN
    RETURN FALSE;
  END IF;

  IF commitment.remaining_pool < draw_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE donation_commitments
  SET remaining_pool = remaining_pool - draw_amount,
      total_donated = total_donated + draw_amount,
      donation_count = donation_count + 1,
      last_donation_date = NOW(),
      status = CASE WHEN remaining_pool - draw_amount <= 0 THEN 'exhausted' ELSE 'active' END,
      updated_at = NOW()
  WHERE id = commitment_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for active commitments summary
CREATE OR REPLACE VIEW v_donation_commitments_summary AS
SELECT
  dc.id,
  dc.user_id,
  dc.type,
  dc.amount,
  dc.frequency,
  dc.target_type,
  dc.target_name,
  dc.category,
  dc.status,
  dc.total_donated,
  dc.remaining_pool,
  dc.next_charge_date,
  dc.created_at,
  (SELECT COUNT(*) FROM donation_commitment_transactions WHERE commitment_id = dc.id) as transaction_count
FROM donation_commitments dc
WHERE dc.status != 'cancelled';

-- View for user giving summary
CREATE OR REPLACE VIEW v_user_giving_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_commitments,
  COUNT(*) FILTER (WHERE type = 'recurring' AND status = 'active') as active_recurring,
  SUM(total_donated) as lifetime_donated,
  SUM(remaining_pool) FILTER (WHERE type = 'pool' AND status = 'active') as available_pool,
  MAX(last_donation_date) as last_donation
FROM donation_commitments
GROUP BY user_id;

-- RLS
ALTER TABLE donation_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_commitment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own commitments
CREATE POLICY "Users can view own commitments"
  ON donation_commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own commitments"
  ON donation_commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments"
  ON donation_commitments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can see their own transactions
CREATE POLICY "Users can view own commitment transactions"
  ON donation_commitment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donation_commitments
      WHERE id = commitment_id AND user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donation_commitments_user ON donation_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_status ON donation_commitments(status);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_type ON donation_commitments(type);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_next_charge ON donation_commitments(next_charge_date) WHERE type = 'recurring' AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_donation_commitment_transactions_commitment ON donation_commitment_transactions(commitment_id);

-- Comments
COMMENT ON TABLE donation_commitments IS 'Four types of giving: lump_sum, recurring, pool, percentage';
COMMENT ON COLUMN donation_commitments.alert_before_charge IS 'Founder preference: always ask before charging';
COMMENT ON COLUMN donation_commitments.remaining_pool IS 'For pool type: amount remaining to be drawn';
