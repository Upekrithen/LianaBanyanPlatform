-- =====================================================
-- GHOST CREDIT TERMS ACCEPTANCE
-- Legal compliance for Ghost Credit system
-- =====================================================

-- Add columns to profiles table for tracking terms acceptance
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ghost_credit_terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ghost_credit_terms_version INTEGER DEFAULT 0;

-- Create index for quick lookup of users who haven't accepted
CREATE INDEX IF NOT EXISTS idx_profiles_ghost_terms_pending
ON profiles(ghost_credit_terms_accepted_at)
WHERE ghost_credit_terms_accepted_at IS NULL;

-- Create index for version-based re-acceptance queries
CREATE INDEX IF NOT EXISTS idx_profiles_ghost_terms_version
ON profiles(ghost_credit_terms_version);

-- =====================================================
-- GHOST CREDIT LEDGER
-- Track all Ghost Credit transactions for audit
-- =====================================================

CREATE TABLE IF NOT EXISTS ghost_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL, -- Positive = credit, Negative = debit
  balance_after INTEGER NOT NULL, -- Running balance after transaction

  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'initial_grant',      -- First 200 credits on terms acceptance
    'weekly_topoff',      -- Weekly refresh up to 500
    'practice_spend',     -- Spent in Ghost World
    'practice_earn',      -- Earned in Ghost World
    'expiration',         -- Expired due to inactivity
    'admin_adjustment',   -- Manual admin adjustment
    'crow_feather_bonus'  -- Bonus from Ghost World achievements
  )),

  -- Context
  description TEXT,
  reference_id UUID, -- Optional link to related record
  reference_type TEXT, -- Type of related record (e.g., 'project', 'beacon_run')

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ghost credit transactions (drop first for idempotency)
DROP INDEX IF EXISTS idx_ghost_credit_txn_user;
DROP INDEX IF EXISTS idx_ghost_credit_txn_type;
DROP INDEX IF EXISTS idx_ghost_credit_txn_created;

CREATE INDEX idx_ghost_credit_txn_user ON ghost_credit_transactions(user_id);
CREATE INDEX idx_ghost_credit_txn_type ON ghost_credit_transactions(transaction_type);
CREATE INDEX idx_ghost_credit_txn_created ON ghost_credit_transactions(created_at DESC);

-- =====================================================
-- GHOST CREDIT BALANCE VIEW
-- Easy access to current balances
-- =====================================================

CREATE OR REPLACE VIEW v_ghost_credit_balances AS
SELECT
  p.id AS user_id,
  p.display_name,
  COALESCE(
    (SELECT balance_after
     FROM ghost_credit_transactions
     WHERE user_id = p.id
     ORDER BY created_at DESC
     LIMIT 1
    ), 0
  ) AS current_balance,
  (SELECT COUNT(*) FROM ghost_credit_transactions WHERE user_id = p.id) AS total_transactions,
  (SELECT created_at FROM ghost_credit_transactions WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) AS last_transaction_at,
  p.ghost_credit_terms_accepted_at,
  p.ghost_credit_terms_version
FROM profiles p;

-- =====================================================
-- FUNCTION: Grant Initial Ghost Credits
-- Called after terms acceptance
-- =====================================================

CREATE OR REPLACE FUNCTION grant_initial_ghost_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_initial_amount INTEGER := 200;
  v_existing_balance INTEGER;
BEGIN
  -- Check if user already has transactions (prevent double-grant)
  SELECT COALESCE(
    (SELECT balance_after FROM ghost_credit_transactions
     WHERE user_id = p_user_id
     ORDER BY created_at DESC LIMIT 1
    ), 0
  ) INTO v_existing_balance;

  -- Only grant if no existing balance
  IF v_existing_balance = 0 THEN
    INSERT INTO ghost_credit_transactions (
      user_id, amount, balance_after, transaction_type, description
    ) VALUES (
      p_user_id,
      v_initial_amount,
      v_initial_amount,
      'initial_grant',
      'Welcome to Ghost World! Here are your initial Ghost Credits.'
    );
    RETURN v_initial_amount;
  END IF;

  RETURN v_existing_balance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Weekly Top-Off
-- Refresh Ghost Credits up to 500 max
-- =====================================================

CREATE OR REPLACE FUNCTION topoff_ghost_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_max_balance INTEGER := 500;
  v_topoff_amount INTEGER := 100;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_actual_topoff INTEGER;
BEGIN
  -- Get current balance
  SELECT COALESCE(
    (SELECT balance_after FROM ghost_credit_transactions
     WHERE user_id = p_user_id
     ORDER BY created_at DESC LIMIT 1
    ), 0
  ) INTO v_current_balance;

  -- Calculate actual top-off (don't exceed max)
  v_actual_topoff := LEAST(v_topoff_amount, v_max_balance - v_current_balance);

  -- Only top off if there's room
  IF v_actual_topoff > 0 THEN
    v_new_balance := v_current_balance + v_actual_topoff;

    INSERT INTO ghost_credit_transactions (
      user_id, amount, balance_after, transaction_type, description
    ) VALUES (
      p_user_id,
      v_actual_topoff,
      v_new_balance,
      'weekly_topoff',
      'Weekly Ghost Credit refresh'
    );

    RETURN v_new_balance;
  END IF;

  RETURN v_current_balance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Spend Ghost Credits
-- Deduct credits for Ghost World activities
-- =====================================================

CREATE OR REPLACE FUNCTION spend_ghost_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT COALESCE(
    (SELECT balance_after FROM ghost_credit_transactions
     WHERE user_id = p_user_id
     ORDER BY created_at DESC LIMIT 1
    ), 0
  ) INTO v_current_balance;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient Ghost Credits. Have: %, Need: %', v_current_balance, p_amount;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  INSERT INTO ghost_credit_transactions (
    user_id, amount, balance_after, transaction_type, description, reference_id, reference_type
  ) VALUES (
    p_user_id,
    -p_amount,
    v_new_balance,
    'practice_spend',
    p_description,
    p_reference_id,
    p_reference_type
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE ghost_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own ghost credit transactions"
ON ghost_credit_transactions
FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert (via functions)
CREATE POLICY "System can insert ghost credit transactions"
ON ghost_credit_transactions
FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN profiles.ghost_credit_terms_accepted_at IS 'Timestamp when user accepted Ghost Credit terms';
COMMENT ON COLUMN profiles.ghost_credit_terms_version IS 'Version of terms user accepted (for re-acceptance on updates)';
COMMENT ON TABLE ghost_credit_transactions IS 'Audit log of all Ghost Credit transactions';
COMMENT ON FUNCTION grant_initial_ghost_credits IS 'Grant 200 initial Ghost Credits after terms acceptance';
COMMENT ON FUNCTION topoff_ghost_credits IS 'Weekly top-off up to 500 max';
COMMENT ON FUNCTION spend_ghost_credits IS 'Deduct Ghost Credits for Ghost World activities';
