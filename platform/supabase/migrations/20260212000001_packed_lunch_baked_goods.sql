-- ============================================================================
-- PACKED LUNCH & BAKED GOODS EXPANSION
-- ============================================================================
-- Phase 1: Bulk ordering, baked goods category, meal stamping
-- Phase 2: Proprietary recipe portfolio
-- Phase 3: Taste tester system
-- Phase 4: Icing pool
-- Phase 5: Cottage law compliance
-- Phase 6: Documentation marketplace
-- ============================================================================

-- ============================================================================
-- PHASE 1: BULK ORDERING & BAKED GOODS
-- ============================================================================

-- 1.1 Add offering type and bulk options to lmd_meals
ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  offering_type TEXT DEFAULT 'standard'
    CHECK (offering_type IN ('standard', 'packed_lunch', 'baked_goods', 'catering'));

ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  bulk_minimum INTEGER DEFAULT 1;

ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  bulk_increment INTEGER DEFAULT 1;

ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  volume_discount_tiers JSONB DEFAULT '[
    {"min_qty": 5, "discount_percent": 5},
    {"min_qty": 10, "discount_percent": 10},
    {"min_qty": 20, "discount_percent": 15},
    {"min_qty": 40, "discount_percent": 20}
  ]';

ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  cottage_law_category TEXT; -- 'cookies', 'cakes', 'breads', etc.

ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  requires_permit BOOLEAN DEFAULT false;

-- 1.2 Add quantity and discount tracking to meal_orders
ALTER TABLE meal_orders ADD COLUMN IF NOT EXISTS
  quantity INTEGER DEFAULT 1;

ALTER TABLE meal_orders ADD COLUMN IF NOT EXISTS
  unit_price NUMERIC;

ALTER TABLE meal_orders ADD COLUMN IF NOT EXISTS
  bulk_discount_percent NUMERIC DEFAULT 0;

ALTER TABLE meal_orders ADD COLUMN IF NOT EXISTS
  bulk_discount_amount NUMERIC DEFAULT 0;

ALTER TABLE meal_orders ADD COLUMN IF NOT EXISTS
  total_price NUMERIC;

-- 1.3 Meal Stamping System
CREATE TABLE IF NOT EXISTS meal_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES lmd_meals(id) ON DELETE CASCADE,
  order_id UUID REFERENCES meal_orders(id),
  maker_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Stamp identification
  stamp_code TEXT UNIQUE NOT NULL, -- e.g., "LB-20260212-ABC123"
  batch_number INTEGER DEFAULT 1,
  items_in_batch INTEGER DEFAULT 1,
  item_index INTEGER DEFAULT 1, -- Which item in batch (1 of 5, 2 of 5, etc.)

  -- Food safety
  made_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  best_by TIMESTAMPTZ,
  shelf_life_hours INTEGER DEFAULT 24,

  -- Ingredients tracking
  ingredients_hash TEXT, -- SHA-256 of ingredient list
  allergens TEXT[] DEFAULT '{}',

  -- Cottage law compliance
  cottage_law_compliant BOOLEAN DEFAULT true,
  permit_number TEXT,
  state_code TEXT, -- State where made

  -- Quality tracking
  quality_checked BOOLEAN DEFAULT false,
  quality_checked_at TIMESTAMPTZ,
  quality_checker_id UUID REFERENCES auth.users(id),

  -- Issue tracking
  has_issue BOOLEAN DEFAULT false,
  issue_reported_at TIMESTAMPTZ,
  issue_description TEXT,
  issue_resolved BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_stamps_meal ON meal_stamps(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_stamps_maker ON meal_stamps(maker_id);
CREATE INDEX IF NOT EXISTS idx_meal_stamps_code ON meal_stamps(stamp_code);
CREATE INDEX IF NOT EXISTS idx_meal_stamps_order ON meal_stamps(order_id);
CREATE INDEX IF NOT EXISTS idx_meal_stamps_date ON meal_stamps(made_at DESC);

-- Function to generate stamp code
CREATE OR REPLACE FUNCTION generate_stamp_code()
RETURNS TEXT AS $$
DECLARE
  v_date TEXT;
  v_random TEXT;
BEGIN
  v_date := to_char(now(), 'YYYYMMDD');
  v_random := upper(substr(md5(random()::text), 1, 6));
  RETURN 'LB-' || v_date || '-' || v_random;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate stamp code
CREATE OR REPLACE FUNCTION set_stamp_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stamp_code IS NULL THEN
    NEW.stamp_code := generate_stamp_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_stamp_code
BEFORE INSERT ON meal_stamps
FOR EACH ROW EXECUTE FUNCTION set_stamp_code();

-- ============================================================================
-- PHASE 2: PROPRIETARY RECIPE PORTFOLIO
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_recipe_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Recipe details
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,

  -- Stored as JSON (proprietary, not normalized)
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',

  -- Classification
  recipe_type TEXT DEFAULT 'meal' CHECK (recipe_type IN ('meal', 'baked_good', 'beverage', 'other')),
  cuisine TEXT,
  meal_type TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',

  -- Timing
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 4,

  -- Privacy
  is_proprietary BOOLEAN DEFAULT true,

  -- Usage tracking (from LMD orders using this recipe)
  times_used INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_servings_sold INTEGER DEFAULT 0,
  average_rating NUMERIC,
  rating_count INTEGER DEFAULT 0,

  -- Graduation to public Pantry
  eligible_for_graduation BOOLEAN DEFAULT false,
  graduation_criteria_met_at TIMESTAMPTZ,
  graduated_to_pantry_id UUID REFERENCES pantry_recipes(id),
  graduated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user ON user_recipe_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON user_recipe_portfolio(recipe_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_proprietary ON user_recipe_portfolio(is_proprietary);

-- Link LMD meals to portfolio recipes
ALTER TABLE lmd_meals ADD COLUMN IF NOT EXISTS
  portfolio_recipe_id UUID REFERENCES user_recipe_portfolio(id);

-- Function to check graduation eligibility
CREATE OR REPLACE FUNCTION check_recipe_graduation_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if meets criteria: 25+ orders, 4.0+ rating, no issues
  IF NEW.total_orders >= 25
     AND NEW.average_rating >= 4.0
     AND NEW.is_proprietary = true
     AND NEW.graduated_to_pantry_id IS NULL THEN

    -- Check for safety issues
    IF NOT EXISTS (
      SELECT 1 FROM meal_stamps ms
      JOIN lmd_meals m ON ms.meal_id = m.id
      WHERE m.portfolio_recipe_id = NEW.id
      AND ms.has_issue = true
      AND ms.issue_resolved = false
    ) THEN
      NEW.eligible_for_graduation := true;
      NEW.graduation_criteria_met_at := COALESCE(NEW.graduation_criteria_met_at, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_graduation
BEFORE UPDATE ON user_recipe_portfolio
FOR EACH ROW EXECUTE FUNCTION check_recipe_graduation_eligibility();

-- ============================================================================
-- PHASE 3: TASTE TESTER SYSTEM
-- ============================================================================

-- Track taste testing activities
CREATE TABLE IF NOT EXISTS taste_tester_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Recipe reference (public or portfolio)
  recipe_id UUID REFERENCES pantry_recipes(id),
  portfolio_recipe_id UUID REFERENCES user_recipe_portfolio(id),

  -- Order details
  order_id UUID REFERENCES meal_orders(id),
  order_number INTEGER NOT NULL, -- What number order this was for the recipe
  ordered_at TIMESTAMPTZ DEFAULT now(),

  -- Rewards earned
  marks_earned INTEGER DEFAULT 0,
  reputation_earned INTEGER DEFAULT 0,

  -- Conversion tracking
  recipe_reached_5k BOOLEAN DEFAULT false,
  recipe_reached_5k_at TIMESTAMPTZ,
  converted_to_credits BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  credits_received NUMERIC DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique index for taste test records (one per user per recipe type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_taste_test_public
  ON taste_tester_records(user_id, recipe_id)
  WHERE recipe_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_taste_test_portfolio
  ON taste_tester_records(user_id, portfolio_recipe_id)
  WHERE portfolio_recipe_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_taste_records_user ON taste_tester_records(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_records_recipe ON taste_tester_records(recipe_id);
CREATE INDEX IF NOT EXISTS idx_taste_records_portfolio ON taste_tester_records(portfolio_recipe_id);

-- User taste tester stats
CREATE TABLE IF NOT EXISTS user_taste_tester_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Totals
  total_recipes_tested INTEGER DEFAULT 0,
  total_marks_earned INTEGER DEFAULT 0,
  total_reputation_earned INTEGER DEFAULT 0,

  -- Current balance
  current_marks_balance INTEGER DEFAULT 0,

  -- Conversion tracking
  total_marks_converted INTEGER DEFAULT 0,
  total_credits_from_conversion NUMERIC DEFAULT 0,

  -- Success tracking
  recipes_reached_5k INTEGER DEFAULT 0, -- How many they tested hit 5K

  -- Master Taster status (10+ successful)
  is_master_taster BOOLEAN DEFAULT false,
  master_taster_achieved_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Function to calculate taste tester rewards
CREATE OR REPLACE FUNCTION calculate_taste_tester_reward(p_order_number INTEGER)
RETURNS TABLE(marks INTEGER, reputation INTEGER) AS $$
BEGIN
  IF p_order_number <= 100 THEN
    RETURN QUERY SELECT 5, 10;
  ELSIF p_order_number <= 500 THEN
    RETURN QUERY SELECT 3, 5;
  ELSIF p_order_number <= 2000 THEN
    RETURN QUERY SELECT 2, 3;
  ELSIF p_order_number <= 5000 THEN
    RETURN QUERY SELECT 1, 1;
  ELSE
    RETURN QUERY SELECT 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and convert marks to credits
CREATE OR REPLACE FUNCTION check_master_taster_conversion(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_successful_recipes INTEGER;
  v_marks_to_convert INTEGER;
BEGIN
  -- Count recipes that reached 5K that this user tested
  SELECT COUNT(*) INTO v_successful_recipes
  FROM taste_tester_records
  WHERE user_id = p_user_id
  AND recipe_reached_5k = true;

  -- If 10+ successful, convert marks to credits
  IF v_successful_recipes >= 10 THEN
    -- Get current marks balance
    SELECT current_marks_balance INTO v_marks_to_convert
    FROM user_taste_tester_stats
    WHERE user_id = p_user_id;

    IF v_marks_to_convert > 0 THEN
      -- Update stats
      UPDATE user_taste_tester_stats SET
        current_marks_balance = 0,
        total_marks_converted = total_marks_converted + v_marks_to_convert,
        total_credits_from_conversion = total_credits_from_conversion + v_marks_to_convert,
        is_master_taster = true,
        master_taster_achieved_at = COALESCE(master_taster_achieved_at, now()),
        updated_at = now()
      WHERE user_id = p_user_id;

      -- TODO: Add credits to user's account
      -- This would integrate with the credits system

      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 4: ICING POOL
-- ============================================================================

-- Icing pool periods
CREATE TABLE IF NOT EXISTS icing_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'quarterly')),

  -- Totals
  previous_period_volume NUMERIC DEFAULT 0,
  current_period_volume NUMERIC DEFAULT 0,
  volume_increase NUMERIC GENERATED ALWAYS AS (
    GREATEST(0, current_period_volume - previous_period_volume)
  ) STORED,

  -- Calculation
  lb_margin_rate NUMERIC DEFAULT 0.167, -- 16.7%
  icing_rate NUMERIC DEFAULT 0.20, -- 20% of margin increase
  margin_from_increase NUMERIC GENERATED ALWAYS AS (
    GREATEST(0, current_period_volume - previous_period_volume) * 0.167
  ) STORED,
  total_icing_pool NUMERIC GENERATED ALWAYS AS (
    GREATEST(0, current_period_volume - previous_period_volume) * 0.167 * 0.20
  ) STORED,

  -- Status
  status TEXT DEFAULT 'accumulating' CHECK (status IN ('accumulating', 'calculated', 'distributed')),
  calculated_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icing_pool_period ON icing_pool(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_icing_pool_status ON icing_pool(status);

-- Per-recipe icing tracking
CREATE TABLE IF NOT EXISTS icing_recipe_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES icing_pool(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES pantry_recipes(id),
  portfolio_recipe_id UUID REFERENCES user_recipe_portfolio(id),

  -- Volume
  previous_orders INTEGER DEFAULT 0,
  current_orders INTEGER DEFAULT 0,
  order_increase INTEGER GENERATED ALWAYS AS (
    GREATEST(0, current_orders - previous_orders)
  ) STORED,

  -- Revenue
  previous_revenue NUMERIC DEFAULT 0,
  current_revenue NUMERIC DEFAULT 0,
  revenue_increase NUMERIC GENERATED ALWAYS AS (
    GREATEST(0, current_revenue - previous_revenue)
  ) STORED,

  -- Icing allocation
  icing_allocated NUMERIC DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Icing distributions to makers
CREATE TABLE IF NOT EXISTS icing_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES icing_pool(id) ON DELETE CASCADE,
  recipe_stats_id UUID REFERENCES icing_recipe_stats(id),

  -- Recipient
  maker_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Calculation
  maker_orders_count INTEGER DEFAULT 0,
  total_recipe_orders INTEGER DEFAULT 0,
  share_percentage NUMERIC,
  icing_amount NUMERIC NOT NULL,

  -- Payment
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icing_dist_pool ON icing_distributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_icing_dist_maker ON icing_distributions(maker_id);
CREATE INDEX IF NOT EXISTS idx_icing_dist_status ON icing_distributions(status);

-- ============================================================================
-- PHASE 5: COTTAGE LAW COMPLIANCE
-- ============================================================================

-- State cottage law rules
CREATE TABLE IF NOT EXISTS cottage_law_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  state_code TEXT NOT NULL,
  state_name TEXT NOT NULL,

  -- Basic rules
  is_allowed BOOLEAN DEFAULT true,
  annual_revenue_limit NUMERIC,

  -- Quantity limits
  daily_limit INTEGER,
  weekly_limit INTEGER,
  monthly_limit INTEGER,

  -- Allowed foods
  allowed_food_types TEXT[] DEFAULT '{}',
  prohibited_food_types TEXT[] DEFAULT '{}',

  -- Requirements
  registration_required BOOLEAN DEFAULT false,
  permit_required BOOLEAN DEFAULT false,
  permit_threshold_weekly INTEGER, -- At what weekly volume permit needed
  food_handler_cert_required BOOLEAN DEFAULT false,
  kitchen_inspection_required BOOLEAN DEFAULT false,

  -- Labeling
  labeling_required BOOLEAN DEFAULT true,
  required_label_items TEXT[] DEFAULT '{
    "producer_name",
    "producer_address",
    "product_name",
    "ingredients",
    "allergens",
    "made_in_home_kitchen"
  }',

  -- Sales restrictions
  direct_sales_only BOOLEAN DEFAULT true,
  online_sales_allowed BOOLEAN DEFAULT false,
  farmers_market_allowed BOOLEAN DEFAULT true,

  -- Links
  official_url TEXT,
  application_url TEXT,

  -- Metadata
  last_verified DATE,
  effective_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(state_code)
);

-- Community-contributed cottage law guides
CREATE TABLE IF NOT EXISTS cottage_law_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  state_code TEXT NOT NULL,
  county TEXT,
  city TEXT,
  jurisdiction_type TEXT DEFAULT 'state' CHECK (jurisdiction_type IN ('state', 'county', 'city')),

  -- Content
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL,

  -- Structured data
  permit_thresholds JSONB DEFAULT '[]', -- [{qty: 5, type: "none"}, {qty: 50, type: "basic_permit"}]
  step_by_step_permit JSONB DEFAULT '[]', -- Steps to get permit
  local_resources JSONB DEFAULT '[]', -- Local health dept contacts, etc.

  -- Metadata
  effective_date DATE,
  last_verified DATE,
  source_urls TEXT[] DEFAULT '{}',

  -- Contributor
  contributor_id UUID REFERENCES auth.users(id),

  -- Quality
  vote_count INTEGER DEFAULT 0,
  average_rating NUMERIC,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Marketplace
  price_credits NUMERIC DEFAULT 5,
  times_purchased INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'outdated', 'archived')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cottage_guides_state ON cottage_law_guides(state_code);
CREATE INDEX IF NOT EXISTS idx_cottage_guides_status ON cottage_law_guides(status);
CREATE INDEX IF NOT EXISTS idx_cottage_guides_contributor ON cottage_law_guides(contributor_id);

-- Guide purchases
CREATE TABLE IF NOT EXISTS cottage_law_guide_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES cottage_law_guides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Transaction
  price_paid NUMERIC NOT NULL,
  contributor_earned NUMERIC, -- 70%
  lb_earned NUMERIC, -- 30%

  purchased_at TIMESTAMPTZ DEFAULT now(),

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  was_helpful BOOLEAN,
  review TEXT,
  rated_at TIMESTAMPTZ,

  UNIQUE(guide_id, user_id)
);

-- User cottage law compliance tracking
CREATE TABLE IF NOT EXISTS user_cottage_law_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  state_code TEXT NOT NULL,

  -- Current status
  current_weekly_output INTEGER DEFAULT 0,
  current_monthly_revenue NUMERIC DEFAULT 0,
  current_annual_revenue NUMERIC DEFAULT 0,

  -- Permit status
  has_permit BOOLEAN DEFAULT false,
  permit_number TEXT,
  permit_expires DATE,

  -- Certifications
  has_food_handler_cert BOOLEAN DEFAULT false,
  cert_number TEXT,
  cert_expires DATE,

  -- Alerts
  approaching_threshold BOOLEAN DEFAULT false,
  threshold_alert_sent_at TIMESTAMPTZ,
  over_threshold BOOLEAN DEFAULT false,

  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, state_code)
);

-- ============================================================================
-- PHASE 6: DOCUMENTATION MARKETPLACE
-- ============================================================================

-- Documentation items (hints, walkthroughs, step-by-steps)
CREATE TABLE IF NOT EXISTS documentation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type and category
  doc_type TEXT NOT NULL CHECK (doc_type IN ('hint', 'walkthrough', 'step_by_step', 'guide', 'faq')),
  category TEXT NOT NULL, -- 'cottage_law', 'technique', 'safety', 'business', 'platform', 'equipment'
  subcategory TEXT,

  -- Content
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',

  -- Targeting
  tags TEXT[] DEFAULT '{}',
  applicable_states TEXT[] DEFAULT '{}',
  applicable_initiatives TEXT[] DEFAULT '{}', -- 'lmd', 'pantry', 'shopping'
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Contributor
  contributor_id UUID REFERENCES auth.users(id),

  -- Pricing
  price_credits NUMERIC DEFAULT 0, -- 0 = free
  contributor_share NUMERIC DEFAULT 0.70, -- 70%

  -- Quality metrics
  vote_count INTEGER DEFAULT 0,
  average_rating NUMERIC,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  times_purchased INTEGER DEFAULT 0,
  times_viewed INTEGER DEFAULT 0,

  -- Revenue
  total_revenue NUMERIC DEFAULT 0,
  contributor_earnings NUMERIC DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'featured', 'archived')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  featured_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_docs_type ON documentation_items(doc_type);
CREATE INDEX IF NOT EXISTS idx_docs_category ON documentation_items(category);
CREATE INDEX IF NOT EXISTS idx_docs_contributor ON documentation_items(contributor_id);
CREATE INDEX IF NOT EXISTS idx_docs_status ON documentation_items(status);
CREATE INDEX IF NOT EXISTS idx_docs_featured ON documentation_items(featured_at DESC) WHERE status = 'featured';

-- Documentation purchases
CREATE TABLE IF NOT EXISTS documentation_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documentation_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Transaction
  price_paid NUMERIC NOT NULL,
  contributor_earned NUMERIC,
  lb_earned NUMERIC,

  purchased_at TIMESTAMPTZ DEFAULT now(),

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  was_helpful BOOLEAN,
  review TEXT,
  rated_at TIMESTAMPTZ,

  UNIQUE(doc_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_purchases_user ON documentation_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_purchases_doc ON documentation_purchases(doc_id);

-- Contributor earnings from documentation
CREATE TABLE IF NOT EXISTS documentation_contributor_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Content counts
  total_items_published INTEGER DEFAULT 0,
  total_hints INTEGER DEFAULT 0,
  total_walkthroughs INTEGER DEFAULT 0,
  total_guides INTEGER DEFAULT 0,

  -- Earnings
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0, -- After LB cut

  -- Icing from quality
  icing_earned NUMERIC DEFAULT 0,

  -- Quality metrics
  average_rating NUMERIC,
  total_helpful_votes INTEGER DEFAULT 0,

  -- Payouts
  last_payout_at TIMESTAMPTZ,
  pending_payout NUMERIC DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Meal stamps
ALTER TABLE meal_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stamps_select_own" ON meal_stamps
  FOR SELECT USING (
    maker_id = auth.uid()
    OR order_id IN (SELECT id FROM meal_orders WHERE user_id = auth.uid())
  );

CREATE POLICY "stamps_insert_own" ON meal_stamps
  FOR INSERT WITH CHECK (maker_id = auth.uid());

CREATE POLICY "stamps_update_own" ON meal_stamps
  FOR UPDATE USING (maker_id = auth.uid());

-- Portfolio recipes
ALTER TABLE user_recipe_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_select_own" ON user_recipe_portfolio
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "portfolio_insert_own" ON user_recipe_portfolio
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "portfolio_update_own" ON user_recipe_portfolio
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "portfolio_delete_own" ON user_recipe_portfolio
  FOR DELETE USING (user_id = auth.uid());

-- Taste tester records
ALTER TABLE taste_tester_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taste_select_own" ON taste_tester_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "taste_insert_own" ON taste_tester_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Taste tester stats
ALTER TABLE user_taste_tester_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taste_stats_select_own" ON user_taste_tester_stats
  FOR SELECT USING (user_id = auth.uid());

-- Icing distributions
ALTER TABLE icing_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "icing_select_own" ON icing_distributions
  FOR SELECT USING (maker_id = auth.uid());

-- Cottage law guides - public read for published
ALTER TABLE cottage_law_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guides_select_published" ON cottage_law_guides
  FOR SELECT USING (status = 'published' OR contributor_id = auth.uid());

CREATE POLICY "guides_insert_own" ON cottage_law_guides
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "guides_update_own" ON cottage_law_guides
  FOR UPDATE USING (contributor_id = auth.uid());

-- Cottage law purchases
ALTER TABLE cottage_law_guide_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_purchases_select_own" ON cottage_law_guide_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "guide_purchases_insert_own" ON cottage_law_guide_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- User cottage law status
ALTER TABLE user_cottage_law_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cottage_status_select_own" ON user_cottage_law_status
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cottage_status_upsert_own" ON user_cottage_law_status
  FOR ALL USING (user_id = auth.uid());

-- Documentation items - public read for published
ALTER TABLE documentation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docs_select_published" ON documentation_items
  FOR SELECT USING (status IN ('published', 'featured') OR contributor_id = auth.uid());

CREATE POLICY "docs_insert_own" ON documentation_items
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "docs_update_own" ON documentation_items
  FOR UPDATE USING (contributor_id = auth.uid());

-- Documentation purchases
ALTER TABLE documentation_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_purchases_select_own" ON documentation_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "doc_purchases_insert_own" ON documentation_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE meal_stamps IS 'Every meal/baked good is stamped by maker for tracking safety and rewards';
COMMENT ON TABLE user_recipe_portfolio IS 'Private/proprietary recipes that can graduate to public Pantry';
COMMENT ON TABLE taste_tester_records IS 'Tracks early orderers of new recipes for Taste Tester rewards';
COMMENT ON TABLE icing_pool IS 'Monthly pool from volume increase on popular recipes, distributed to makers';
COMMENT ON TABLE cottage_law_rules IS 'State-level cottage food law rules and requirements';
COMMENT ON TABLE cottage_law_guides IS 'Community-contributed local guides for cottage law compliance';
COMMENT ON TABLE documentation_items IS 'Marketplace for hints, walkthroughs, and step-by-step guides';
