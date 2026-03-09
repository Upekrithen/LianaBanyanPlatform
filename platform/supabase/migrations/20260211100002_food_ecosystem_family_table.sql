-- ============================================================================
-- FOOD ECOSYSTEM PHASE 3: THE FAMILY TABLE (MEAL PLANNING)
-- ============================================================================
-- Meal planning for individuals and Tribes (chosen families).
-- Integrates with The Pantry recipes and Let's Make Dinner.
-- Generates shopping lists with aggregation for Tribes.
-- ============================================================================

-- ============================================================================
-- 1. FAMILY MEAL PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS family_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Tribe/Family (optional - uses guild system)
  tribe_id UUID REFERENCES guilds(id),
  
  -- What's being planned
  recipe_id UUID REFERENCES pantry_recipes(id), -- From Pantry
  lmd_meal_id UUID REFERENCES lmd_meals(id), -- OR from Let's Make Dinner
  custom_meal_name TEXT, -- OR a custom entry
  
  -- When
  meal_date DATE NOT NULL,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack', 'brunch')),
  
  -- Serving details
  servings INTEGER DEFAULT 1,
  notes TEXT,
  
  -- Shopping integration
  include_in_shopping BOOLEAN DEFAULT true,
  shopping_list_id UUID, -- Will reference family_shopping_lists when added
  
  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'shopping', 'prepping', 'cooked', 'skipped')),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One meal per slot per day per user (can override)
  CONSTRAINT one_meal_per_slot UNIQUE(user_id, meal_date, meal_slot)
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON family_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_tribe ON family_meal_plans(tribe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON family_meal_plans(meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe ON family_meal_plans(recipe_id);

-- ============================================================================
-- 2. FAMILY SHOPPING LISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS family_shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Tribe aggregation
  tribe_id UUID REFERENCES guilds(id),
  is_tribe_aggregated BOOLEAN DEFAULT false,
  
  -- Period
  week_start DATE NOT NULL,
  week_end DATE GENERATED ALWAYS AS (week_start + INTERVAL '6 days') STORED,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'shopping', 'completed')),
  
  -- Fulfillment
  fulfillment_method TEXT CHECK (fulfillment_method IN (
    'personal', -- Self-shop
    'external_api', -- Push to HEB/Kroger/etc
    'lets_get_groceries', -- LB aggregate
    'lets_go_shopping' -- Micro-local volume
  )),
  external_api TEXT, -- heb, kroger, instacart, amazon_fresh
  external_order_id TEXT, -- ID from external system
  
  -- LB integration
  lgg_order_id UUID, -- Let's Get Groceries order
  lgs_order_id UUID, -- Let's Go Shopping order
  
  -- Delivery job (Phase 4)
  delivery_job_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON family_shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_tribe ON family_shopping_lists(tribe_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_week ON family_shopping_lists(week_start);

-- ============================================================================
-- 3. FAMILY SHOPPING LIST ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS family_shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES family_shopping_lists(id) ON DELETE CASCADE NOT NULL,
  
  -- Item details
  ingredient_name TEXT NOT NULL,
  normalized_name TEXT, -- Lowercase, singular
  quantity NUMERIC,
  unit TEXT,
  category TEXT, -- produce, dairy, meat, pantry, etc.
  
  -- Source tracking
  source_recipe_id UUID REFERENCES pantry_recipes(id),
  source_meal_plan_id UUID REFERENCES family_meal_plans(id),
  
  -- Shopping state
  is_checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  checked_by UUID REFERENCES auth.users(id),
  
  -- Price tracking (for budgeting)
  estimated_price NUMERIC,
  actual_price NUMERIC,
  
  -- Notes
  notes TEXT,
  substitutes TEXT, -- Alternative items
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopping_items_list ON family_shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_checked ON family_shopping_list_items(shopping_list_id, is_checked);

-- ============================================================================
-- 4. TRIBE MEAL PLAN SHARES TABLE
-- ============================================================================
-- When a user shares their meal plan with their Tribe
CREATE TABLE IF NOT EXISTS tribe_meal_plan_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES family_meal_plans(id) ON DELETE CASCADE NOT NULL,
  tribe_id UUID REFERENCES guilds(id) NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  can_add_to_aggregate BOOLEAN DEFAULT true, -- Others can add to tribe shopping
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(meal_plan_id, tribe_id)
);

-- ============================================================================
-- 5. INGREDIENT AGGREGATION VIEW
-- ============================================================================
-- Aggregates ingredients across meal plans for shopping list generation
CREATE OR REPLACE VIEW family_shopping_aggregation AS
SELECT 
  fmp.user_id,
  fmp.tribe_id,
  fmp.meal_date,
  pri.ingredient_name,
  pri.normalized_name,
  pri.unit,
  SUM(pri.quantity * COALESCE(fmp.servings, 1) / NULLIF(pr.servings, 0)) as total_quantity,
  pri.category,
  array_agg(DISTINCT pr.id) as recipe_ids,
  array_agg(DISTINCT fmp.id) as meal_plan_ids
FROM family_meal_plans fmp
JOIN pantry_recipes pr ON fmp.recipe_id = pr.id
JOIN pantry_recipe_ingredients pri ON pr.id = pri.recipe_id
WHERE fmp.include_in_shopping = true
  AND fmp.status IN ('planned', 'shopping')
GROUP BY 
  fmp.user_id,
  fmp.tribe_id,
  fmp.meal_date,
  pri.ingredient_name,
  pri.normalized_name,
  pri.unit,
  pri.category;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE family_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_meal_plan_shares ENABLE ROW LEVEL SECURITY;

-- Meal plans: Users see their own and shared tribe plans
CREATE POLICY "meal_plans_select" ON family_meal_plans 
  FOR SELECT USING (
    user_id = auth.uid() 
    OR tribe_id IN (
      SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plans_insert" ON family_meal_plans 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "meal_plans_update" ON family_meal_plans 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "meal_plans_delete" ON family_meal_plans 
  FOR DELETE USING (user_id = auth.uid());

-- Shopping lists: Users see their own and tribe lists
CREATE POLICY "shopping_lists_select" ON family_shopping_lists 
  FOR SELECT USING (
    user_id = auth.uid() 
    OR tribe_id IN (
      SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "shopping_lists_insert" ON family_shopping_lists 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "shopping_lists_update" ON family_shopping_lists 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "shopping_lists_delete" ON family_shopping_lists 
  FOR DELETE USING (user_id = auth.uid());

-- Shopping list items: Same as parent list
CREATE POLICY "shopping_items_select" ON family_shopping_list_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_shopping_lists 
      WHERE id = shopping_list_id 
      AND (user_id = auth.uid() OR tribe_id IN (
        SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "shopping_items_insert" ON family_shopping_list_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_shopping_lists 
      WHERE id = shopping_list_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "shopping_items_update" ON family_shopping_list_items 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_shopping_lists 
      WHERE id = shopping_list_id 
      AND (user_id = auth.uid() OR tribe_id IN (
        SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "shopping_items_delete" ON family_shopping_list_items 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_shopping_lists 
      WHERE id = shopping_list_id AND user_id = auth.uid()
    )
  );

-- Tribe shares
CREATE POLICY "tribe_shares_select" ON tribe_meal_plan_shares 
  FOR SELECT USING (
    shared_by = auth.uid() 
    OR tribe_id IN (
      SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tribe_shares_insert" ON tribe_meal_plan_shares 
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "tribe_shares_delete" ON tribe_meal_plan_shares 
  FOR DELETE USING (shared_by = auth.uid());

-- ============================================================================
-- 7. FUNCTIONS
-- ============================================================================

-- Function to generate shopping list from meal plans
CREATE OR REPLACE FUNCTION generate_shopping_list(
  p_user_id UUID,
  p_week_start DATE,
  p_tribe_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_list_id UUID;
BEGIN
  -- Create shopping list
  INSERT INTO family_shopping_lists (user_id, tribe_id, week_start, is_tribe_aggregated)
  VALUES (p_user_id, p_tribe_id, p_week_start, p_tribe_id IS NOT NULL)
  RETURNING id INTO v_list_id;
  
  -- Populate items from meal plans
  INSERT INTO family_shopping_list_items (
    shopping_list_id, 
    ingredient_name, 
    normalized_name, 
    quantity, 
    unit, 
    category,
    source_recipe_id,
    source_meal_plan_id
  )
  SELECT 
    v_list_id,
    pri.ingredient_name,
    pri.normalized_name,
    SUM(pri.quantity * COALESCE(fmp.servings, 1) / NULLIF(pr.servings, 0)),
    pri.unit,
    pri.category,
    pr.id,
    fmp.id
  FROM family_meal_plans fmp
  JOIN pantry_recipes pr ON fmp.recipe_id = pr.id
  JOIN pantry_recipe_ingredients pri ON pr.id = pri.recipe_id
  WHERE fmp.user_id = p_user_id
    AND fmp.meal_date BETWEEN p_week_start AND (p_week_start + INTERVAL '6 days')
    AND fmp.include_in_shopping = true
    AND fmp.status IN ('planned', 'shopping')
    AND (p_tribe_id IS NULL OR fmp.tribe_id = p_tribe_id)
  GROUP BY pri.ingredient_name, pri.normalized_name, pri.unit, pri.category, pr.id, fmp.id;
  
  -- Update meal plans to reference this shopping list
  UPDATE family_meal_plans SET 
    shopping_list_id = v_list_id,
    status = 'shopping'
  WHERE user_id = p_user_id
    AND meal_date BETWEEN p_week_start AND (p_week_start + INTERVAL '6 days')
    AND include_in_shopping = true
    AND status = 'planned';
  
  RETURN v_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================
COMMENT ON TABLE family_meal_plans IS 'Weekly meal planning for individuals and Tribes. Integrates with Pantry recipes and LMD.';
COMMENT ON TABLE family_shopping_lists IS 'Shopping lists generated from meal plans. Can aggregate across Tribe members.';
COMMENT ON TABLE family_shopping_list_items IS 'Individual items on a shopping list with check-off tracking.';
COMMENT ON FUNCTION generate_shopping_list IS 'Generates a shopping list from meal plans for a given week.';
