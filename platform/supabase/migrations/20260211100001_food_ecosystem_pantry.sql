-- ============================================================================
-- FOOD ECOSYSTEM PHASE 2: THE PANTRY (RECIPE REPOSITORY)
-- ============================================================================
-- Recipe repository with:
-- - Vote-weighted credits from LB's 20% margin
-- - Diminishing returns on credit payouts  
-- - $500 lifetime cap per recipe
-- - Cooking Spoon and Hot Pepper badges after cap
-- ============================================================================

-- ============================================================================
-- 1. PANTRY RECIPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Recipe Content
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT, -- Required for submission but nullable in schema
  
  -- Recipe Details
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER GENERATED ALWAYS AS (COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)) STORED,
  servings INTEGER DEFAULT 4,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  
  -- Classification
  cuisine TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage', 'appetizer', 'side')),
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  
  -- Status & Approval
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Credit Tracking
  total_credits_paid NUMERIC(10,2) DEFAULT 0,
  is_credit_capped BOOLEAN DEFAULT false, -- True when $500 cap reached
  credit_cap_reached_at TIMESTAMPTZ,
  
  -- Engagement Metrics
  vote_count INTEGER DEFAULT 0,
  make_count INTEGER DEFAULT 0, -- Number of times marked "I made this"
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0, -- Bookmarks
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- For duplicate detection
  ingredient_hash TEXT -- Hash of normalized ingredients for similarity checking
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_creator ON pantry_recipes(creator_id);
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_status ON pantry_recipes(status);
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_cuisine ON pantry_recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_meal_type ON pantry_recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_vote_count ON pantry_recipes(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_pantry_recipes_created ON pantry_recipes(created_at DESC);

-- ============================================================================
-- 2. PANTRY RECIPE INGREDIENTS TABLE (Normalized)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE CASCADE NOT NULL,
  
  -- Ingredient Details
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT, -- tbsp, cup, oz, lb, etc.
  preparation TEXT, -- diced, minced, sliced, etc.
  is_optional BOOLEAN DEFAULT false,
  
  -- For shopping list integration
  normalized_name TEXT, -- Lowercase, singular, trimmed
  category TEXT, -- produce, dairy, meat, pantry, etc.
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  section TEXT, -- For grouping (e.g., "For the sauce", "For the dough")
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON pantry_recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_normalized ON pantry_recipe_ingredients(normalized_name);

-- ============================================================================
-- 3. PANTRY RECIPE STEPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE CASCADE NOT NULL,
  
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  tip TEXT, -- Optional tip for this step
  image_url TEXT, -- Optional step photo
  duration_minutes INTEGER, -- Time for this step
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(recipe_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON pantry_recipe_steps(recipe_id);

-- ============================================================================
-- 4. PANTRY RECIPE VOTES TABLE (Makers Only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Voting requires making the recipe first
  has_made BOOLEAN DEFAULT false,
  made_at TIMESTAMPTZ,
  made_count INTEGER DEFAULT 0, -- How many times they've made it
  
  -- Vote (only counted if has_made = true)
  vote INTEGER CHECK (vote IN (-1, 0, 1)), -- -1 = downvote, 0 = neutral, 1 = upvote
  voted_at TIMESTAMPTZ,
  
  -- Rating (optional detailed rating)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  review_at TIMESTAMPTZ,
  
  -- Photo of their version (optional)
  photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(recipe_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_votes_recipe ON pantry_recipe_votes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_votes_user ON pantry_recipe_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_votes_makers ON pantry_recipe_votes(recipe_id) WHERE has_made = true;

-- ============================================================================
-- 5. PANTRY RECIPE USES TABLE (Credit Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipe_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES pantry_recipes(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Usage Context
  usage_type TEXT DEFAULT 'cooked' CHECK (usage_type IN ('cooked', 'meal_plan', 'shopping_list', 'lmd_ordered')),
  
  -- Credit awarded for this use
  credits_awarded NUMERIC(10,4) DEFAULT 0,
  credit_calculation JSONB, -- Store the calculation details
  
  -- For LMD integration
  lmd_meal_id UUID,
  lmd_order_id UUID,
  
  used_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_uses_recipe ON pantry_recipe_uses(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_uses_user ON pantry_recipe_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_uses_date ON pantry_recipe_uses(used_at DESC);

-- ============================================================================
-- 6. PANTRY RECIPE COLLECTIONS (User's Saved Recipes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_recipe_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pantry_collection_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES pantry_recipe_collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  
  UNIQUE(collection_id, recipe_id)
);

-- ============================================================================
-- 7. INGREDIENT MASTER LIST (For Autocomplete & Normalization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pantry_ingredients_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  common_units TEXT[] DEFAULT '{}',
  aliases TEXT[] DEFAULT '{}', -- Alternative names
  is_approved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_master_name ON pantry_ingredients_master(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_master_normalized ON pantry_ingredients_master(normalized_name);

-- ============================================================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update vote/make counts on recipe
CREATE OR REPLACE FUNCTION update_recipe_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE pantry_recipes SET
      vote_count = (
        SELECT COALESCE(SUM(vote), 0) 
        FROM pantry_recipe_votes 
        WHERE recipe_id = NEW.recipe_id AND has_made = true AND vote IS NOT NULL
      ),
      make_count = (
        SELECT COUNT(*) 
        FROM pantry_recipe_votes 
        WHERE recipe_id = NEW.recipe_id AND has_made = true
      ),
      updated_at = now()
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pantry_recipes SET
      vote_count = (
        SELECT COALESCE(SUM(vote), 0) 
        FROM pantry_recipe_votes 
        WHERE recipe_id = OLD.recipe_id AND has_made = true AND vote IS NOT NULL
      ),
      make_count = (
        SELECT COUNT(*) 
        FROM pantry_recipe_votes 
        WHERE recipe_id = OLD.recipe_id AND has_made = true
      ),
      updated_at = now()
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recipe_counts
AFTER INSERT OR UPDATE OR DELETE ON pantry_recipe_votes
FOR EACH ROW EXECUTE FUNCTION update_recipe_counts();

-- Function to update total credits and check cap
CREATE OR REPLACE FUNCTION update_recipe_credits()
RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC;
  recipe_creator UUID;
BEGIN
  -- Get current total credits for recipe
  SELECT COALESCE(SUM(credits_awarded), 0) INTO total
  FROM pantry_recipe_uses
  WHERE recipe_id = NEW.recipe_id;
  
  -- Get recipe creator
  SELECT creator_id INTO recipe_creator
  FROM pantry_recipes
  WHERE id = NEW.recipe_id;
  
  -- Update recipe
  UPDATE pantry_recipes SET
    total_credits_paid = total,
    is_credit_capped = (total >= 500),
    credit_cap_reached_at = CASE 
      WHEN total >= 500 AND credit_cap_reached_at IS NULL THEN now()
      ELSE credit_cap_reached_at
    END,
    updated_at = now()
  WHERE id = NEW.recipe_id;
  
  -- Award credits to creator's account
  IF NEW.credits_awarded > 0 THEN
    -- This would integrate with the main credits system
    -- For now, we track it in the recipe_uses table
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recipe_credits
AFTER INSERT ON pantry_recipe_uses
FOR EACH ROW EXECUTE FUNCTION update_recipe_credits();

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE pantry_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_collection_recipes ENABLE ROW LEVEL SECURITY;

-- Recipes: Anyone can view approved, creators can edit their own
CREATE POLICY "pantry_recipes_select" ON pantry_recipes 
  FOR SELECT USING (is_approved = true OR creator_id = auth.uid());

CREATE POLICY "pantry_recipes_insert" ON pantry_recipes 
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "pantry_recipes_update" ON pantry_recipes 
  FOR UPDATE USING (creator_id = auth.uid());

-- Ingredients: Same as recipes
CREATE POLICY "pantry_ingredients_select" ON pantry_recipe_ingredients 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND (is_approved = true OR creator_id = auth.uid()))
  );

CREATE POLICY "pantry_ingredients_insert" ON pantry_recipe_ingredients 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

CREATE POLICY "pantry_ingredients_update" ON pantry_recipe_ingredients 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

CREATE POLICY "pantry_ingredients_delete" ON pantry_recipe_ingredients 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

-- Steps: Same as recipes
CREATE POLICY "pantry_steps_select" ON pantry_recipe_steps 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND (is_approved = true OR creator_id = auth.uid()))
  );

CREATE POLICY "pantry_steps_insert" ON pantry_recipe_steps 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

CREATE POLICY "pantry_steps_update" ON pantry_recipe_steps 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

CREATE POLICY "pantry_steps_delete" ON pantry_recipe_steps 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pantry_recipes WHERE id = recipe_id AND creator_id = auth.uid())
  );

-- Votes: Anyone can view, users manage their own
CREATE POLICY "pantry_votes_select" ON pantry_recipe_votes 
  FOR SELECT USING (true);

CREATE POLICY "pantry_votes_insert" ON pantry_recipe_votes 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "pantry_votes_update" ON pantry_recipe_votes 
  FOR UPDATE USING (user_id = auth.uid());

-- Uses: Users see their own, system can insert
CREATE POLICY "pantry_uses_select" ON pantry_recipe_uses 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "pantry_uses_insert" ON pantry_recipe_uses 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Collections: Users manage their own, public collections visible to all
CREATE POLICY "pantry_collections_select" ON pantry_recipe_collections 
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "pantry_collections_insert" ON pantry_recipe_collections 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "pantry_collections_update" ON pantry_recipe_collections 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "pantry_collections_delete" ON pantry_recipe_collections 
  FOR DELETE USING (user_id = auth.uid());

-- Collection recipes
CREATE POLICY "pantry_collection_recipes_select" ON pantry_collection_recipes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pantry_recipe_collections WHERE id = collection_id AND (user_id = auth.uid() OR is_public = true))
  );

CREATE POLICY "pantry_collection_recipes_insert" ON pantry_collection_recipes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pantry_recipe_collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "pantry_collection_recipes_delete" ON pantry_collection_recipes 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pantry_recipe_collections WHERE id = collection_id AND user_id = auth.uid())
  );

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================
COMMENT ON TABLE pantry_recipes IS 'Recipe repository - The Pantry. Creators earn fractional credits per use with diminishing returns and $500 cap.';
COMMENT ON COLUMN pantry_recipes.is_credit_capped IS 'True when recipe has earned $500 lifetime cap - after which Cooking Spoon badges are awarded instead';
COMMENT ON TABLE pantry_recipe_votes IS 'Votes restricted to users who have marked has_made = true (makers only voting)';
COMMENT ON TABLE pantry_recipe_uses IS 'Tracks each use of a recipe for credit calculation';
