-- ============================================================================
-- DEMAND AGGREGATION SYSTEM
-- ============================================================================
-- Auto-propagates demand from meal orders to ingredient requirements,
-- aggregates across micro-local areas, and creates delivery jobs when
-- thresholds are met.
--
-- Flow:
-- 1. meal_order → auto-generates ingredient_demand_entries
-- 2. demand aggregates by ingredient + area + time window
-- 3. When threshold hit → grocery_delivery_job created
-- 4. Recipients notified: accept/self-fulfill/defer
-- ============================================================================

-- ============================================================================
-- MICRO-LOCAL AREAS (Geographic aggregation zones)
-- ============================================================================

-- Extend existing micro_local_areas if not already comprehensive
ALTER TABLE micro_local_areas ADD COLUMN IF NOT EXISTS
  aggregation_radius_miles NUMERIC DEFAULT 1.0;

ALTER TABLE micro_local_areas ADD COLUMN IF NOT EXISTS
  minimum_orders_to_aggregate INTEGER DEFAULT 2;

ALTER TABLE micro_local_areas ADD COLUMN IF NOT EXISTS
  minimum_value_to_aggregate NUMERIC DEFAULT 25.00;

ALTER TABLE micro_local_areas ADD COLUMN IF NOT EXISTS
  default_delivery_windows JSONB DEFAULT '[
    {"day": "monday", "cutoff_hour": 18, "delivery_day": "tuesday", "delivery_window": "10:00-14:00"},
    {"day": "wednesday", "cutoff_hour": 18, "delivery_day": "thursday", "delivery_window": "10:00-14:00"},
    {"day": "friday", "cutoff_hour": 18, "delivery_day": "saturday", "delivery_window": "10:00-14:00"}
  ]';

-- ============================================================================
-- INGREDIENT DEMAND ENTRIES
-- ============================================================================
-- Auto-generated when someone orders a meal that uses a recipe

CREATE TABLE IF NOT EXISTS ingredient_demand_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source of demand
  source_type TEXT NOT NULL CHECK (source_type IN ('meal_order', 'family_plan', 'manual', 'recipe_use')),
  meal_order_id UUID REFERENCES meal_orders(id) ON DELETE SET NULL,
  family_plan_id UUID, -- References family_meal_plans if from family table
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE SET NULL,
  portfolio_recipe_id UUID REFERENCES user_recipe_portfolio(id) ON DELETE SET NULL,

  -- Who needs this
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID, -- For family/tribe aggregation

  -- What's needed
  ingredient_name TEXT NOT NULL,
  ingredient_normalized TEXT NOT NULL, -- Lowercase, trimmed, standardized
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'lb', 'oz', 'count', 'cup', etc.

  -- Categorization
  category TEXT, -- 'produce', 'dairy', 'meat', 'pantry', 'frozen', etc.

  -- Location
  micro_local_area_id UUID REFERENCES micro_local_areas(id),
  latitude NUMERIC,
  longitude NUMERIC,
  zip_code TEXT,

  -- Timing
  needed_by DATE NOT NULL,
  flexibility_days INTEGER DEFAULT 1, -- Can wait up to X days

  -- Aggregation status
  aggregation_window_id UUID, -- Which window this got assigned to
  aggregation_status TEXT DEFAULT 'pending'
    CHECK (aggregation_status IN ('pending', 'aggregated', 'self_fulfilled', 'delivered', 'cancelled')),

  -- User preferences
  preferred_brand TEXT,
  organic_required BOOLEAN DEFAULT false,
  substitution_allowed BOOLEAN DEFAULT true,
  max_price_per_unit NUMERIC,

  -- Resolution
  fulfilled_by TEXT, -- 'self', 'delivery', 'store_pickup'
  fulfilled_at TIMESTAMPTZ,
  actual_item_purchased TEXT,
  actual_price NUMERIC,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demand_user ON ingredient_demand_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_area ON ingredient_demand_entries(micro_local_area_id);
CREATE INDEX IF NOT EXISTS idx_demand_needed ON ingredient_demand_entries(needed_by);
CREATE INDEX IF NOT EXISTS idx_demand_status ON ingredient_demand_entries(aggregation_status);
CREATE INDEX IF NOT EXISTS idx_demand_window ON ingredient_demand_entries(aggregation_window_id);
CREATE INDEX IF NOT EXISTS idx_demand_ingredient ON ingredient_demand_entries(ingredient_normalized);

-- ============================================================================
-- AGGREGATION WINDOWS
-- ============================================================================
-- Time-boxed collection periods for combining orders

CREATE TABLE IF NOT EXISTS demand_aggregation_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  micro_local_area_id UUID REFERENCES micro_local_areas(id),
  zip_code TEXT,
  area_name TEXT,

  -- Time boundaries
  window_opens TIMESTAMPTZ NOT NULL,
  window_closes TIMESTAMPTZ NOT NULL, -- Cutoff time for adding to this window
  target_delivery_date DATE NOT NULL,
  delivery_window_start TIME,
  delivery_window_end TIME,

  -- Aggregation stats
  participant_count INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  total_estimated_value NUMERIC DEFAULT 0,
  unique_ingredients INTEGER DEFAULT 0,

  -- Thresholds
  min_participants INTEGER DEFAULT 2,
  min_value NUMERIC DEFAULT 25.00,
  max_participants INTEGER DEFAULT 20,
  max_value NUMERIC DEFAULT 500.00,

  -- Status
  status TEXT DEFAULT 'collecting'
    CHECK (status IN ('collecting', 'threshold_met', 'job_created', 'in_progress', 'completed', 'cancelled')),
  threshold_met_at TIMESTAMPTZ,

  -- Resulting job
  delivery_job_id UUID, -- References grocery_delivery_jobs when created

  -- Volume discount applied
  volume_discount_percent NUMERIC DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agg_windows_area ON demand_aggregation_windows(micro_local_area_id);
CREATE INDEX IF NOT EXISTS idx_agg_windows_status ON demand_aggregation_windows(status);
CREATE INDEX IF NOT EXISTS idx_agg_windows_closes ON demand_aggregation_windows(window_closes);
CREATE INDEX IF NOT EXISTS idx_agg_windows_delivery ON demand_aggregation_windows(target_delivery_date);

-- ============================================================================
-- AGGREGATION PARTICIPANTS
-- ============================================================================
-- Who's in each window and their fulfillment preferences

CREATE TABLE IF NOT EXISTS aggregation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  aggregation_window_id UUID REFERENCES demand_aggregation_windows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  household_id UUID,

  -- Their items in this window
  item_count INTEGER DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,

  -- Participation status
  status TEXT DEFAULT 'auto_included'
    CHECK (status IN ('auto_included', 'opted_in', 'opted_out', 'self_fulfilling', 'delivered', 'cancelled')),

  -- Payment
  payment_authorized BOOLEAN DEFAULT false,
  payment_authorization_id TEXT,
  share_of_delivery_fee NUMERIC,
  total_charge NUMERIC,

  -- Notifications
  notified_of_aggregation BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- Delivery details
  delivery_address TEXT,
  delivery_instructions TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(aggregation_window_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_agg_participants_window ON aggregation_participants(aggregation_window_id);
CREATE INDEX IF NOT EXISTS idx_agg_participants_user ON aggregation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_agg_participants_status ON aggregation_participants(status);

-- ============================================================================
-- AGGREGATED SHOPPING LIST
-- ============================================================================
-- Combined list of ingredients across all participants in a window

CREATE TABLE IF NOT EXISTS aggregated_shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  aggregation_window_id UUID REFERENCES demand_aggregation_windows(id) ON DELETE CASCADE,

  -- Ingredient
  ingredient_normalized TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT,

  -- Aggregated quantities
  total_quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  requesting_users INTEGER DEFAULT 1,

  -- Purchasing
  estimated_unit_price NUMERIC,
  estimated_total_price NUMERIC,
  actual_unit_price NUMERIC,
  actual_total_price NUMERIC,

  -- Store info
  preferred_store TEXT,
  found_at_store TEXT,

  -- Status
  status TEXT DEFAULT 'needed'
    CHECK (status IN ('needed', 'purchased', 'substituted', 'unavailable', 'partial')),
  purchased_quantity NUMERIC,
  substitution_item TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(aggregation_window_id, ingredient_normalized, unit)
);

CREATE INDEX IF NOT EXISTS idx_agg_list_window ON aggregated_shopping_list(aggregation_window_id);
CREATE INDEX IF NOT EXISTS idx_agg_list_ingredient ON aggregated_shopping_list(ingredient_normalized);
CREATE INDEX IF NOT EXISTS idx_agg_list_category ON aggregated_shopping_list(category);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to normalize ingredient names
CREATE OR REPLACE FUNCTION normalize_ingredient(ingredient TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(ingredient, '\s+', ' ', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-generate demand entries from a meal order
CREATE OR REPLACE FUNCTION generate_demand_from_meal_order()
RETURNS TRIGGER AS $$
DECLARE
  v_recipe_id UUID;
  v_recipe RECORD;
  v_ingredient RECORD;
  v_area_id UUID;
  v_needed_date DATE;
BEGIN
  -- Get recipe ID from the meal
  SELECT m.portfolio_recipe_id, m.pickup_date
  INTO v_recipe_id, v_needed_date
  FROM lmd_meals m
  WHERE m.id = NEW.meal_offering_id;

  -- If no portfolio recipe, check if there's a pantry recipe linked
  IF v_recipe_id IS NULL THEN
    -- Could look up pantry recipe here
    RETURN NEW;
  END IF;

  -- Get recipe details
  SELECT * INTO v_recipe
  FROM user_recipe_portfolio
  WHERE id = v_recipe_id;

  IF v_recipe IS NULL THEN
    RETURN NEW;
  END IF;

  -- Parse ingredients from JSON and create demand entries
  -- Note: In production, ingredients would be normalized during recipe creation
  FOR v_ingredient IN
    SELECT
      jsonb_array_elements_text(v_recipe.ingredients) as ingredient_raw
  LOOP
    INSERT INTO ingredient_demand_entries (
      source_type,
      meal_order_id,
      portfolio_recipe_id,
      user_id,
      ingredient_name,
      ingredient_normalized,
      quantity,
      unit,
      needed_by,
      aggregation_status
    ) VALUES (
      'meal_order',
      NEW.id,
      v_recipe_id,
      NEW.recipient_id,
      v_ingredient.ingredient_raw,
      normalize_ingredient(v_ingredient.ingredient_raw),
      1, -- Would parse actual quantity in production
      'serving',
      COALESCE(v_needed_date, CURRENT_DATE + 2),
      'pending'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate demand from meal orders
DROP TRIGGER IF EXISTS trigger_generate_demand ON meal_orders;
CREATE TRIGGER trigger_generate_demand
AFTER INSERT ON meal_orders
FOR EACH ROW EXECUTE FUNCTION generate_demand_from_meal_order();

-- Function to find or create aggregation window for a demand entry
CREATE OR REPLACE FUNCTION assign_demand_to_window(demand_id UUID)
RETURNS UUID AS $$
DECLARE
  v_demand RECORD;
  v_window_id UUID;
  v_window RECORD;
BEGIN
  -- Get demand entry
  SELECT * INTO v_demand
  FROM ingredient_demand_entries
  WHERE id = demand_id;

  IF v_demand IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find existing open window for this area and timeframe
  SELECT * INTO v_window
  FROM demand_aggregation_windows
  WHERE (micro_local_area_id = v_demand.micro_local_area_id OR zip_code = v_demand.zip_code)
    AND status = 'collecting'
    AND window_closes > now()
    AND target_delivery_date >= v_demand.needed_by - v_demand.flexibility_days
    AND target_delivery_date <= v_demand.needed_by + v_demand.flexibility_days
  ORDER BY target_delivery_date ASC
  LIMIT 1;

  IF v_window IS NOT NULL THEN
    v_window_id := v_window.id;
  ELSE
    -- Create new window
    INSERT INTO demand_aggregation_windows (
      micro_local_area_id,
      zip_code,
      window_opens,
      window_closes,
      target_delivery_date,
      status
    ) VALUES (
      v_demand.micro_local_area_id,
      v_demand.zip_code,
      now(),
      now() + interval '24 hours', -- Closes tomorrow
      v_demand.needed_by,
      'collecting'
    )
    RETURNING id INTO v_window_id;
  END IF;

  -- Assign demand to window
  UPDATE ingredient_demand_entries
  SET aggregation_window_id = v_window_id,
      aggregation_status = 'aggregated',
      updated_at = now()
  WHERE id = demand_id;

  -- Update window stats
  PERFORM update_aggregation_window_stats(v_window_id);

  -- Add/update participant
  INSERT INTO aggregation_participants (
    aggregation_window_id,
    user_id,
    item_count,
    estimated_value,
    status
  ) VALUES (
    v_window_id,
    v_demand.user_id,
    1,
    COALESCE(v_demand.max_price_per_unit * v_demand.quantity, 5.00),
    'auto_included'
  )
  ON CONFLICT (aggregation_window_id, user_id) DO UPDATE SET
    item_count = aggregation_participants.item_count + 1,
    estimated_value = aggregation_participants.estimated_value + COALESCE(v_demand.max_price_per_unit * v_demand.quantity, 5.00),
    updated_at = now();

  RETURN v_window_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update aggregation window statistics
CREATE OR REPLACE FUNCTION update_aggregation_window_stats(window_id UUID)
RETURNS VOID AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT
    COUNT(DISTINCT user_id) as participant_count,
    COUNT(*) as total_items,
    SUM(COALESCE(max_price_per_unit * quantity, 5.00)) as total_value,
    COUNT(DISTINCT ingredient_normalized) as unique_ingredients
  INTO v_stats
  FROM ingredient_demand_entries
  WHERE aggregation_window_id = window_id
    AND aggregation_status = 'aggregated';

  UPDATE demand_aggregation_windows SET
    participant_count = COALESCE(v_stats.participant_count, 0),
    total_items = COALESCE(v_stats.total_items, 0),
    total_estimated_value = COALESCE(v_stats.total_value, 0),
    unique_ingredients = COALESCE(v_stats.unique_ingredients, 0),
    updated_at = now()
  WHERE id = window_id;

  -- Check if threshold is met
  PERFORM check_aggregation_threshold(window_id);
END;
$$ LANGUAGE plpgsql;

-- Function to check if aggregation threshold is met
CREATE OR REPLACE FUNCTION check_aggregation_threshold(window_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_window RECORD;
BEGIN
  SELECT * INTO v_window
  FROM demand_aggregation_windows
  WHERE id = window_id;

  IF v_window.status != 'collecting' THEN
    RETURN false;
  END IF;

  -- Check thresholds
  IF v_window.participant_count >= v_window.min_participants
     AND v_window.total_estimated_value >= v_window.min_value THEN

    UPDATE demand_aggregation_windows SET
      status = 'threshold_met',
      threshold_met_at = now(),
      updated_at = now()
    WHERE id = window_id;

    -- Calculate volume discount
    UPDATE demand_aggregation_windows SET
      volume_discount_percent = CASE
        WHEN total_estimated_value >= 200 THEN 15
        WHEN total_estimated_value >= 100 THEN 10
        WHEN total_estimated_value >= 50 THEN 5
        ELSE 0
      END
    WHERE id = window_id;

    -- Generate aggregated shopping list
    PERFORM generate_aggregated_shopping_list(window_id);

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to generate aggregated shopping list
CREATE OR REPLACE FUNCTION generate_aggregated_shopping_list(window_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Aggregate all ingredients
  INSERT INTO aggregated_shopping_list (
    aggregation_window_id,
    ingredient_normalized,
    display_name,
    category,
    total_quantity,
    unit,
    requesting_users,
    status
  )
  SELECT
    window_id,
    ingredient_normalized,
    MAX(ingredient_name) as display_name,
    MAX(category) as category,
    SUM(quantity) as total_quantity,
    unit,
    COUNT(DISTINCT user_id) as requesting_users,
    'needed'
  FROM ingredient_demand_entries
  WHERE aggregation_window_id = window_id
    AND aggregation_status = 'aggregated'
  GROUP BY ingredient_normalized, unit
  ON CONFLICT (aggregation_window_id, ingredient_normalized, unit) DO UPDATE SET
    total_quantity = EXCLUDED.total_quantity,
    requesting_users = EXCLUDED.requesting_users,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to create delivery job from aggregation window
CREATE OR REPLACE FUNCTION create_job_from_aggregation(window_id UUID)
RETURNS UUID AS $$
DECLARE
  v_window RECORD;
  v_job_id UUID;
BEGIN
  SELECT * INTO v_window
  FROM demand_aggregation_windows
  WHERE id = window_id;

  IF v_window.status != 'threshold_met' THEN
    RAISE EXCEPTION 'Window not ready for job creation';
  END IF;

  -- Create delivery job
  INSERT INTO grocery_delivery_jobs (
    status,
    pickup_store,
    total_items,
    estimated_total,
    recipient_count,
    estimated_duration_minutes,
    notes
  ) VALUES (
    'open',
    'TBD', -- Worker will choose store
    v_window.total_items,
    v_window.total_estimated_value,
    v_window.participant_count,
    30 + (v_window.participant_count * 10), -- Rough estimate
    'Aggregated order from ' || v_window.participant_count || ' households'
  )
  RETURNING id INTO v_job_id;

  -- Link window to job
  UPDATE demand_aggregation_windows SET
    status = 'job_created',
    delivery_job_id = v_job_id,
    updated_at = now()
  WHERE id = window_id;

  -- Notify participants (in production, would trigger notification)
  UPDATE aggregation_participants SET
    notified_of_aggregation = true,
    notified_at = now(),
    response_deadline = now() + interval '2 hours'
  WHERE aggregation_window_id = window_id
    AND status = 'auto_included';

  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function for participant to opt out and self-fulfill
CREATE OR REPLACE FUNCTION opt_out_of_aggregation(
  p_user_id UUID,
  p_window_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update participant status
  UPDATE aggregation_participants SET
    status = 'opted_out',
    responded_at = now(),
    updated_at = now()
  WHERE aggregation_window_id = p_window_id
    AND user_id = p_user_id;

  -- Mark their demand entries as self-fulfilling
  UPDATE ingredient_demand_entries SET
    aggregation_status = 'self_fulfilled',
    fulfilled_by = 'self',
    updated_at = now()
  WHERE aggregation_window_id = p_window_id
    AND user_id = p_user_id;

  -- Recalculate window stats
  PERFORM update_aggregation_window_stats(p_window_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ingredient_demand_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demand_select_own" ON ingredient_demand_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "demand_insert_own" ON ingredient_demand_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "demand_update_own" ON ingredient_demand_entries
  FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE demand_aggregation_windows ENABLE ROW LEVEL SECURITY;

-- Windows visible to participants
CREATE POLICY "windows_select_participant" ON demand_aggregation_windows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM aggregation_participants
      WHERE aggregation_window_id = demand_aggregation_windows.id
        AND user_id = auth.uid()
    )
  );

ALTER TABLE aggregation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select_own" ON aggregation_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "participants_update_own" ON aggregation_participants
  FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE aggregated_shopping_list ENABLE ROW LEVEL SECURITY;

-- Shopping list visible to window participants
CREATE POLICY "shopping_list_select_participant" ON aggregated_shopping_list
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM aggregation_participants
      WHERE aggregation_window_id = aggregated_shopping_list.aggregation_window_id
        AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ingredient_demand_entries IS 'Individual demand for ingredients, auto-generated from meal orders';
COMMENT ON TABLE demand_aggregation_windows IS 'Time-boxed windows for combining orders by area';
COMMENT ON TABLE aggregation_participants IS 'Users participating in each aggregation window';
COMMENT ON TABLE aggregated_shopping_list IS 'Combined shopping list for an aggregation window';
COMMENT ON FUNCTION generate_demand_from_meal_order() IS 'Trigger function to auto-create demand entries from meal orders';
COMMENT ON FUNCTION assign_demand_to_window(UUID) IS 'Assigns a demand entry to an aggregation window';
COMMENT ON FUNCTION check_aggregation_threshold(UUID) IS 'Checks if window has met threshold for job creation';
