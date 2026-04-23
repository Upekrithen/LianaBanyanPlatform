-- LMD MEAL REQUESTS — Mark-Backed Bounty System
-- ===============================================
-- Members can request meals with Marks (backed by Joules).
-- Two types: GENERAL (vote for what you want) and SPECIFIC (commit to buy)

CREATE TABLE IF NOT EXISTS lmd_meal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- What meal
  meal_name TEXT NOT NULL,
  pantry_recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE SET NULL,

  -- Request type
  request_type TEXT NOT NULL CHECK (request_type IN ('general', 'specific')),

  -- Marks commitment (backed 1:1 by Joules)
  marks_committed INTEGER NOT NULL CHECK (marks_committed >= 5),

  -- For GENERAL requests
  duration_days INTEGER CHECK (duration_days IS NULL OR (duration_days >= 1 AND duration_days <= 7)),

  -- For SPECIFIC requests
  specific_date DATE,
  portion_count INTEGER CHECK (portion_count IS NULL OR portion_count >= 1),

  -- Location filter
  postal_code TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired', 'withdrawn', 'forfeited')),
  expires_at DATE NOT NULL,

  -- If fulfilled, link to the meal/order
  fulfilled_by_meal_id UUID REFERENCES lmd_meals(id) ON DELETE SET NULL,
  fulfilled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lmd_requests_requester ON lmd_meal_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_lmd_requests_status ON lmd_meal_requests(status);
CREATE INDEX IF NOT EXISTS idx_lmd_requests_expires ON lmd_meal_requests(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lmd_requests_postal ON lmd_meal_requests(postal_code) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lmd_requests_recipe ON lmd_meal_requests(pantry_recipe_id) WHERE pantry_recipe_id IS NOT NULL;

-- RLS
ALTER TABLE lmd_meal_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active requests (chefs need to see demand)
CREATE POLICY "Active requests visible to all"
  ON lmd_meal_requests FOR SELECT
  USING (status = 'active');

-- Users can view their own requests (any status)
CREATE POLICY "Users view own requests"
  ON lmd_meal_requests FOR SELECT
  USING (auth.uid() = requester_id);

-- Users can create their own requests
CREATE POLICY "Users create own requests"
  ON lmd_meal_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update their own requests (withdraw, etc.)
CREATE POLICY "Users update own requests"
  ON lmd_meal_requests FOR UPDATE
  USING (auth.uid() = requester_id);

-- Function to auto-expire requests
CREATE OR REPLACE FUNCTION expire_lmd_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lmd_meal_requests
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expires_at < CURRENT_DATE;
END;
$$;

-- Aggregated demand view for chefs
CREATE OR REPLACE VIEW lmd_demand_summary AS
SELECT
  meal_name,
  pantry_recipe_id,
  postal_code,
  COUNT(*) as request_count,
  SUM(marks_committed) as total_marks,
  MIN(expires_at) as earliest_expiry,
  MAX(expires_at) as latest_expiry,
  ARRAY_AGG(DISTINCT specific_date) FILTER (WHERE specific_date IS NOT NULL) as specific_dates
FROM lmd_meal_requests
WHERE status = 'active'
GROUP BY meal_name, pantry_recipe_id, postal_code
ORDER BY total_marks DESC;

-- Grant access to the view
GRANT SELECT ON lmd_demand_summary TO authenticated;
GRANT SELECT ON lmd_demand_summary TO anon;

COMMENT ON TABLE lmd_meal_requests IS 'Mark-backed meal requests for Let''s Make Dinner demand signaling';
COMMENT ON VIEW lmd_demand_summary IS 'Aggregated demand view showing what meals people want in each area';
