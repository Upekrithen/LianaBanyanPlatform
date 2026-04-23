-- ============================================================================
-- FLY ON THE WALL — Transparency Dashboard Tables and Views
-- ============================================================================

-- PART 1: TRANSPARENCY METRICS TABLE
-- Stores periodic snapshots of platform health metrics
CREATE TABLE IF NOT EXISTS transparency_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Member metrics
  total_members INTEGER DEFAULT 0,
  active_members_30_day INTEGER DEFAULT 0,
  newcomers_this_period INTEGER DEFAULT 0,

  -- Transaction metrics
  total_transactions INTEGER DEFAULT 0,
  total_transaction_volume NUMERIC(15,2) DEFAULT 0,
  avg_transaction_value NUMERIC(10,2) DEFAULT 0,

  -- Financial metrics
  treasury_balance NUMERIC(15,2) DEFAULT 0,
  charitable_fund_balance NUMERIC(15,2) DEFAULT 0,
  creator_payout_total NUMERIC(15,2) DEFAULT 0,
  platform_margin_total NUMERIC(15,2) DEFAULT 0,

  -- Newcomer health (Boaz Principle)
  avg_time_to_first_transaction_hours NUMERIC(10,2),
  newcomer_30_day_retention NUMERIC(5,4),
  active_gleaners_count INTEGER DEFAULT 0,
  gleaning_credits_distributed NUMERIC(15,2) DEFAULT 0,

  -- Ghost economy
  ghost_credits_total_distributed NUMERIC(15,2) DEFAULT 0,
  ghost_credits_total_used NUMERIC(15,2) DEFAULT 0,
  ghost_credits_conversion_rate NUMERIC(5,4),
  ghost_to_member_conversion_count INTEGER DEFAULT 0,

  -- Industry comparison
  our_time_to_first_transaction_days NUMERIC(10,2),
  etsy_avg_time_to_first_sale_days NUMERIC(10,2) DEFAULT 30,
  our_project_success_rate NUMERIC(5,4),
  kickstarter_avg_project_success_rate NUMERIC(5,4) DEFAULT 0.38,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transparency_period ON transparency_metrics(period_end DESC);

-- PART 2: CREATE THE VIEW
CREATE OR REPLACE VIEW v_current_transparency_metrics AS
SELECT * FROM transparency_metrics
ORDER BY period_end DESC
LIMIT 1;

-- PART 3: SEED INITIAL DATA
-- Insert a baseline record so the dashboard shows something
INSERT INTO transparency_metrics (
  period_start,
  period_end,
  total_members,
  active_members_30_day,
  newcomers_this_period,
  total_transactions,
  treasury_balance,
  charitable_fund_balance,
  ghost_credits_total_distributed,
  ghost_credits_total_used,
  etsy_avg_time_to_first_sale_days,
  kickstarter_avg_project_success_rate
) VALUES (
  NOW() - INTERVAL '30 days',
  NOW(),
  1,  -- Founder
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  30,  -- Industry benchmark
  0.38  -- Industry benchmark
);

-- PART 4: FUNCTION TO UPDATE METRICS
-- Call this periodically (daily or hourly) to refresh the dashboard
CREATE OR REPLACE FUNCTION update_transparency_metrics()
RETURNS void AS $$
DECLARE
  v_total_members INTEGER;
  v_active_30d INTEGER;
  v_total_transactions INTEGER;
  v_treasury NUMERIC;
BEGIN
  -- Count members
  SELECT COUNT(*) INTO v_total_members FROM profiles WHERE is_active = true;

  -- Count active members (last 30 days)
  SELECT COUNT(*) INTO v_active_30d
  FROM profiles
  WHERE last_login_at > NOW() - INTERVAL '30 days';

  -- Count transactions (if table exists)
  BEGIN
    SELECT COUNT(*) INTO v_total_transactions FROM transactions;
  EXCEPTION WHEN undefined_table THEN
    v_total_transactions := 0;
  END;

  -- Get treasury balance from current_metrics if available
  SELECT metric_value INTO v_treasury
  FROM current_metrics
  WHERE metric_key = 'treasury_balance';

  -- Insert new snapshot
  INSERT INTO transparency_metrics (
    period_start,
    period_end,
    total_members,
    active_members_30_day,
    total_transactions,
    treasury_balance
  ) VALUES (
    NOW() - INTERVAL '1 day',
    NOW(),
    COALESCE(v_total_members, 0),
    COALESCE(v_active_30d, 0),
    COALESCE(v_total_transactions, 0),
    COALESCE(v_treasury, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- PART 5: ENSURE CURRENT_METRICS HAS KEY VALUES
INSERT INTO current_metrics (metric_key, metric_value, description, category)
VALUES
  ('innovation_count', 1244, 'Total documented innovations', 'platform'),
  ('crown_jewel_patents', 8, 'Patents with no prior art found', 'ip'),
  ('charitable_initiatives', 16, 'Sweet Sixteen initiatives', 'social'),
  ('creator_share_percent', 83.3, 'Creator keeps this percentage', 'economics'),
  ('platform_margin_percent', 20, 'Cost plus this percentage', 'economics'),
  ('membership_fee_annual', 5, 'Annual membership cost in USD', 'economics')
ON CONFLICT (metric_key) DO UPDATE SET
  metric_value = EXCLUDED.metric_value,
  updated_at = NOW();

-- PART 6: ROW LEVEL SECURITY
ALTER TABLE transparency_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_transparency ON transparency_metrics;
CREATE POLICY view_transparency ON transparency_metrics FOR SELECT USING (true);

-- PART 7: GRANT ACCESS TO THE VIEW
GRANT SELECT ON v_current_transparency_metrics TO anon, authenticated;
GRANT SELECT ON transparency_metrics TO anon, authenticated;

-- DONE!
SELECT 'Fly on the Wall transparency tables created!' as status;
