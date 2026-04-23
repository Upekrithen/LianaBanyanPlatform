-- K132: Pitch Contingency Operator — Saved Scenarios + Share Chains
-- Innovations: #2001, #2002, #2003, #2004

-- ════════════════════════════════════════════════════════════
-- TABLE 1: saved_business_scenarios
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saved_business_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,

  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,

  campaign_id UUID,
  business_type TEXT NOT NULL,
  scenario_name TEXT DEFAULT 'Untitled Scenario',

  discount_tier TEXT NOT NULL,
  weekly_orders INTEGER NOT NULL,
  avg_order_value NUMERIC NOT NULL,
  delivery_pct NUMERIC NOT NULL,

  weekly_revenue NUMERIC,
  monthly_revenue NUMERIC,
  mark_earnings NUMERIC,
  promotion_level TEXT
);

ALTER TABLE saved_business_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_scenarios"
  ON saved_business_scenarios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anon_session_scenarios"
  ON saved_business_scenarios FOR ALL
  USING (user_id IS NULL AND session_id IS NOT NULL)
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE INDEX idx_saved_scenarios_user ON saved_business_scenarios(user_id);
CREATE INDEX idx_saved_scenarios_session ON saved_business_scenarios(session_id);
CREATE INDEX idx_saved_scenarios_expires ON saved_business_scenarios(expires_at)
  WHERE expires_at IS NOT NULL;

-- ════════════════════════════════════════════════════════════
-- TABLE 2: share_chains
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS share_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  current_streak INTEGER NOT NULL DEFAULT 0,
  highest_streak INTEGER NOT NULL DEFAULT 0,
  bonus_pct NUMERIC NOT NULL DEFAULT 0,
  sustained BOOLEAN NOT NULL DEFAULT false,

  last_share_at TIMESTAMPTZ,
  chain_expires_at TIMESTAMPTZ,

  total_shares INTEGER NOT NULL DEFAULT 0,
  total_bonus_points NUMERIC NOT NULL DEFAULT 0,
  total_bonus_marks NUMERIC NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON share_chains(user_id);

ALTER TABLE share_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_chain"
  ON share_chains FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
