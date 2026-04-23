-- SHADOW MARKS & RECIPE BOUNTY SYSTEM
-- ====================================
-- Shadow Marks are speculative reputation that "crystallize" into real Marks
-- through community validation (votes/orders).
--
-- Educational metaphor: "Seeds that need sunlight (votes) to grow into plants (Marks)"
--
-- Key concepts:
-- 1. Category-based bounties reward filling empty/sparse shelves
-- 2. Shadow Marks decay over time if not validated
-- 3. Votes/orders "crystallize" Shadow Marks into permanent Marks
-- 4. Teaches vesting concept in an approachable way

-- ─── RECIPE CATEGORY TAXONOMY ───
-- Structured categories for bounty targeting

CREATE TABLE IF NOT EXISTS pantry_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Category hierarchy
  cuisine TEXT NOT NULL,              -- e.g., 'French', 'Mexican', 'Soul Food'
  meal_type TEXT NOT NULL,            -- e.g., 'Dinner', 'Breakfast', 'Dessert'
  style TEXT DEFAULT 'Standard',      -- e.g., 'Elegant', 'Comfort', 'Quick', 'Healthy'

  -- Display
  display_name TEXT NOT NULL,         -- e.g., 'French Elegant Dinners'
  description TEXT,
  icon TEXT DEFAULT '🍽️',

  -- Bounty state (calculated)
  recipe_count INTEGER DEFAULT 0,
  current_bounty_marks INTEGER DEFAULT 50,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cuisine, meal_type, style)
);

-- Seed initial categories (can expand later)
INSERT INTO pantry_categories (cuisine, meal_type, style, display_name, description, icon) VALUES
  -- French
  ('French', 'Dinner', 'Elegant', 'French Elegant Dinners', 'Sophisticated French cuisine for special occasions', '🇫🇷'),
  ('French', 'Dinner', 'Comfort', 'French Comfort Dinners', 'Hearty French home cooking', '🥖'),
  ('French', 'Dessert', 'Standard', 'French Desserts', 'Classic French pastries and sweets', '🥐'),

  -- Italian
  ('Italian', 'Dinner', 'Standard', 'Italian Dinners', 'Classic Italian main courses', '🇮🇹'),
  ('Italian', 'Dinner', 'Quick', 'Quick Italian Dinners', 'Fast Italian meals under 30 minutes', '⚡'),
  ('Italian', 'Dessert', 'Standard', 'Italian Desserts', 'Tiramisu, gelato, and more', '🍨'),

  -- Mexican
  ('Mexican', 'Dinner', 'Standard', 'Mexican Dinners', 'Authentic Mexican main dishes', '🇲🇽'),
  ('Mexican', 'Breakfast', 'Standard', 'Mexican Breakfasts', 'Huevos rancheros and beyond', '🍳'),
  ('Mexican', 'Snack', 'Standard', 'Mexican Snacks', 'Street food and appetizers', '🌮'),

  -- American
  ('American', 'Dinner', 'Comfort', 'American Comfort Food', 'Classic American comfort dinners', '🍔'),
  ('American', 'Breakfast', 'Standard', 'American Breakfasts', 'Pancakes, eggs, the works', '🥞'),
  ('American', 'Dinner', 'Healthy', 'Healthy American Dinners', 'Lighter American options', '🥗'),

  -- Soul Food
  ('Soul Food', 'Dinner', 'Standard', 'Soul Food Dinners', 'Traditional Southern soul food', '🍗'),
  ('Soul Food', 'Side', 'Standard', 'Soul Food Sides', 'Mac and cheese, greens, cornbread', '🌽'),

  -- Asian
  ('Chinese', 'Dinner', 'Standard', 'Chinese Dinners', 'Chinese main courses', '🥢'),
  ('Japanese', 'Dinner', 'Standard', 'Japanese Dinners', 'Japanese main dishes', '🍱'),
  ('Thai', 'Dinner', 'Standard', 'Thai Dinners', 'Thai main courses', '🥘'),
  ('Korean', 'Dinner', 'Standard', 'Korean Dinners', 'Korean main dishes', '🍜'),
  ('Vietnamese', 'Dinner', 'Standard', 'Vietnamese Dinners', 'Pho, banh mi, and more', '🍲'),
  ('Indian', 'Dinner', 'Standard', 'Indian Dinners', 'Indian curries and more', '🍛'),

  -- Mediterranean
  ('Mediterranean', 'Dinner', 'Standard', 'Mediterranean Dinners', 'Greek, Lebanese, Turkish dishes', '🫒'),
  ('Mediterranean', 'Dinner', 'Healthy', 'Healthy Mediterranean', 'Light Mediterranean options', '🥙'),

  -- Special categories
  ('Any', 'Breakfast', 'Quick', 'Quick Breakfasts', 'Under 15 minutes to start your day', '⏰'),
  ('Any', 'Dinner', 'Budget', 'Budget Dinners', 'Delicious meals under $5/serving', '💰'),
  ('Any', 'Dessert', 'Healthy', 'Healthy Desserts', 'Sweet treats without the guilt', '🍎')
ON CONFLICT (cuisine, meal_type, style) DO NOTHING;

-- ─── SHADOW MARKS TABLE ───
-- Tracks speculative reputation that vests over time

CREATE TABLE IF NOT EXISTS shadow_marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- What earned the shadow marks
  source_type TEXT NOT NULL CHECK (source_type IN ('recipe_bounty', 'taste_test', 'early_adopter', 'category_pioneer')),
  source_id UUID,  -- e.g., recipe_id, meal_id

  -- Amounts
  initial_amount INTEGER NOT NULL CHECK (initial_amount > 0),
  current_amount INTEGER NOT NULL CHECK (current_amount >= 0),
  crystallized_amount INTEGER DEFAULT 0 CHECK (crystallized_amount >= 0),

  -- Vesting status
  status TEXT NOT NULL DEFAULT 'vesting' CHECK (status IN ('vesting', 'partial', 'crystallized', 'expired')),

  -- Decay schedule (in days)
  decay_start_days INTEGER DEFAULT 3,
  decay_interval_days INTEGER DEFAULT 4,  -- Every 4 days after start
  decay_rate DECIMAL(3,2) DEFAULT 0.20,   -- 20% decay per interval

  -- Crystallization tracking
  votes_needed INTEGER DEFAULT 10,        -- Votes to fully crystallize
  votes_received INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_decay_at TIMESTAMPTZ,
  crystallized_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shadow_marks_user ON shadow_marks(user_id);
CREATE INDEX IF NOT EXISTS idx_shadow_marks_status ON shadow_marks(status) WHERE status = 'vesting';
CREATE INDEX IF NOT EXISTS idx_shadow_marks_source ON shadow_marks(source_type, source_id);

-- ─── RECIPE VOTES TABLE ───
-- Track votes on recipes (with Marks backing)

CREATE TABLE IF NOT EXISTS pantry_recipe_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Vote weight (Marks committed)
  marks_committed INTEGER NOT NULL CHECK (marks_committed >= 1),

  -- Timestamps
  voted_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(recipe_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_votes_recipe ON pantry_recipe_votes(recipe_id);

-- ─── FUNCTIONS ───

-- Calculate current bounty for a category based on recipe count
CREATE OR REPLACE FUNCTION calculate_category_bounty(recipe_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE
    WHEN recipe_count = 0 THEN 50   -- Empty: "Be the first!"
    WHEN recipe_count < 5 THEN 30   -- Sparse: "Help fill the shelf"
    WHEN recipe_count < 10 THEN 15  -- Growing: "Add variety"
    WHEN recipe_count < 20 THEN 5   -- Established: Standard contribution
    ELSE 0                          -- Full: No scarcity bonus
  END;
END;
$$;

-- Award shadow marks when a recipe is submitted
-- IMPORTANT: Every person who posts in the same category tier gets the SAME bounty.
-- The bounty only drops when the category crosses a threshold (0→5, 5→10, etc.)
-- This ensures fairness — if 3 people all post to an empty category, all 3 get 50 Shadow Marks.
CREATE OR REPLACE FUNCTION award_recipe_shadow_marks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_record RECORD;
  bounty_amount INTEGER;
BEGIN
  -- Find the category for this recipe
  SELECT * INTO category_record
  FROM pantry_categories
  WHERE cuisine ILIKE NEW.cuisine
    AND meal_type ILIKE NEW.meal_type
  LIMIT 1;

  IF category_record IS NOT NULL THEN
    -- Calculate bounty based on current count BEFORE this recipe
    -- Everyone posting at the same tier level gets the same reward
    bounty_amount := calculate_category_bounty(category_record.recipe_count);

    IF bounty_amount > 0 THEN
      -- Award shadow marks — same amount for everyone in this tier
      INSERT INTO shadow_marks (
        user_id,
        source_type,
        source_id,
        initial_amount,
        current_amount,
        votes_needed
      ) VALUES (
        NEW.creator_id,
        'recipe_bounty',
        NEW.id,
        bounty_amount,
        bounty_amount,
        CASE
          WHEN bounty_amount >= 50 THEN 10
          WHEN bounty_amount >= 30 THEN 7
          WHEN bounty_amount >= 15 THEN 5
          ELSE 3
        END
      );

      -- Update category count AFTER awarding (so next person in same tier still gets same amount)
      UPDATE pantry_categories
      SET recipe_count = recipe_count + 1,
          current_bounty_marks = calculate_category_bounty(recipe_count + 1),
          updated_at = NOW()
      WHERE id = category_record.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on recipe creation
DROP TRIGGER IF EXISTS trigger_award_recipe_shadow_marks ON pantry_recipes;
CREATE TRIGGER trigger_award_recipe_shadow_marks
  AFTER INSERT ON pantry_recipes
  FOR EACH ROW
  EXECUTE FUNCTION award_recipe_shadow_marks();

-- Process vote and crystallize shadow marks
CREATE OR REPLACE FUNCTION process_recipe_vote(
  p_recipe_id UUID,
  p_user_id UUID,
  p_marks_committed INTEGER
)
RETURNS TABLE(
  vote_recorded BOOLEAN,
  shadow_marks_crystallized INTEGER,
  creator_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recipe RECORD;
  v_shadow RECORD;
  v_crystallize_amount INTEGER := 0;
  v_new_votes INTEGER;
  v_crystallize_ratio DECIMAL;
BEGIN
  -- Get recipe info
  SELECT * INTO v_recipe FROM pantry_recipes WHERE id = p_recipe_id;
  IF v_recipe IS NULL THEN
    RAISE EXCEPTION 'Recipe not found';
  END IF;

  -- Record the vote
  INSERT INTO pantry_recipe_votes (recipe_id, user_id, marks_committed)
  VALUES (p_recipe_id, p_user_id, p_marks_committed)
  ON CONFLICT (recipe_id, user_id)
  DO UPDATE SET marks_committed = pantry_recipe_votes.marks_committed + p_marks_committed;

  -- Update recipe vote count
  UPDATE pantry_recipes
  SET vote_count = vote_count + p_marks_committed
  WHERE id = p_recipe_id;

  -- Check for shadow marks to crystallize
  SELECT * INTO v_shadow
  FROM shadow_marks
  WHERE source_type = 'recipe_bounty'
    AND source_id = p_recipe_id
    AND status IN ('vesting', 'partial')
  FOR UPDATE;

  IF v_shadow IS NOT NULL THEN
    -- Update votes received
    v_new_votes := v_shadow.votes_received + p_marks_committed;

    -- Calculate crystallization
    v_crystallize_ratio := LEAST(v_new_votes::DECIMAL / v_shadow.votes_needed, 1.0);
    v_crystallize_amount := FLOOR(v_shadow.current_amount * v_crystallize_ratio) - v_shadow.crystallized_amount;

    IF v_crystallize_amount > 0 THEN
      -- Update shadow marks record
      UPDATE shadow_marks
      SET votes_received = v_new_votes,
          crystallized_amount = crystallized_amount + v_crystallize_amount,
          status = CASE
            WHEN v_new_votes >= votes_needed THEN 'crystallized'
            ELSE 'partial'
          END,
          crystallized_at = CASE
            WHEN v_new_votes >= votes_needed THEN NOW()
            ELSE crystallized_at
          END
      WHERE id = v_shadow.id;

      -- Award real marks to the recipe creator
      INSERT INTO marks_transactions (user_id, amount, reason, reason_type)
      VALUES (v_recipe.creator_id, v_crystallize_amount,
              'Shadow Marks crystallized from recipe votes', 'shadow_crystallize');

      -- Update user's total marks
      UPDATE user_marks
      SET total_marks = total_marks + v_crystallize_amount
      WHERE user_id = v_recipe.creator_id;
    ELSE
      -- Just update vote count
      UPDATE shadow_marks
      SET votes_received = v_new_votes
      WHERE id = v_shadow.id;
    END IF;
  END IF;

  RETURN QUERY SELECT TRUE, v_crystallize_amount, v_recipe.creator_id;
END;
$$;

-- Decay shadow marks (run daily via cron)
CREATE OR REPLACE FUNCTION decay_shadow_marks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  decayed_count INTEGER := 0;
BEGIN
  -- Decay marks that are past their decay start
  UPDATE shadow_marks
  SET current_amount = GREATEST(
        current_amount - FLOOR(initial_amount * decay_rate),
        crystallized_amount
      ),
      last_decay_at = NOW(),
      status = CASE
        WHEN current_amount - FLOOR(initial_amount * decay_rate) <= crystallized_amount
        THEN 'expired'
        ELSE status
      END
  WHERE status IN ('vesting', 'partial')
    AND created_at + (decay_start_days || ' days')::INTERVAL < NOW()
    AND (last_decay_at IS NULL OR
         last_decay_at + (decay_interval_days || ' days')::INTERVAL < NOW());

  GET DIAGNOSTICS decayed_count = ROW_COUNT;

  -- Expire fully decayed marks
  UPDATE shadow_marks
  SET status = 'expired'
  WHERE status IN ('vesting', 'partial')
    AND expires_at < NOW();

  RETURN decayed_count;
END;
$$;

-- ─── VIEWS ───

-- Category bounty opportunities (for UI)
CREATE OR REPLACE VIEW pantry_bounty_opportunities AS
SELECT
  c.id,
  c.cuisine,
  c.meal_type,
  c.style,
  c.display_name,
  c.description,
  c.icon,
  c.recipe_count,
  calculate_category_bounty(c.recipe_count) as shadow_marks_available,
  CASE
    WHEN c.recipe_count = 0 THEN 'Be the FIRST! 🏆'
    WHEN c.recipe_count < 5 THEN 'Help fill the shelf'
    WHEN c.recipe_count < 10 THEN 'Add variety'
    WHEN c.recipe_count < 20 THEN 'Standard contribution'
    ELSE 'Shelf is full'
  END as bounty_message,
  CASE
    WHEN c.recipe_count = 0 THEN 'empty'
    WHEN c.recipe_count < 5 THEN 'sparse'
    WHEN c.recipe_count < 10 THEN 'growing'
    WHEN c.recipe_count < 20 THEN 'established'
    ELSE 'full'
  END as shelf_status
FROM pantry_categories c
ORDER BY calculate_category_bounty(c.recipe_count) DESC, c.display_name;

-- User's shadow marks summary
CREATE OR REPLACE VIEW user_shadow_marks_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'vesting') as vesting_count,
  SUM(current_amount) FILTER (WHERE status IN ('vesting', 'partial')) as total_shadow,
  SUM(crystallized_amount) as total_crystallized,
  SUM(initial_amount - crystallized_amount) FILTER (WHERE status = 'expired') as total_expired
FROM shadow_marks
GROUP BY user_id;

-- ─── RLS ───

ALTER TABLE shadow_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_recipe_votes ENABLE ROW LEVEL SECURITY;

-- Shadow marks: users see their own
DROP POLICY IF EXISTS "Users view own shadow marks" ON shadow_marks;
CREATE POLICY "Users view own shadow marks"
  ON shadow_marks FOR SELECT
  USING (auth.uid() = user_id);

-- Categories: everyone can view
DROP POLICY IF EXISTS "Anyone can view categories" ON pantry_categories;
CREATE POLICY "Anyone can view categories"
  ON pantry_categories FOR SELECT
  USING (true);

-- Votes: users can create their own, see all
DROP POLICY IF EXISTS "Users create own votes" ON pantry_recipe_votes;
CREATE POLICY "Users create own votes"
  ON pantry_recipe_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view votes" ON pantry_recipe_votes;
CREATE POLICY "Anyone can view votes"
  ON pantry_recipe_votes FOR SELECT
  USING (true);

-- Grant access to views
GRANT SELECT ON pantry_bounty_opportunities TO authenticated;
GRANT SELECT ON pantry_bounty_opportunities TO anon;
GRANT SELECT ON user_shadow_marks_summary TO authenticated;

COMMENT ON TABLE shadow_marks IS 'Speculative reputation that crystallizes through community validation';
COMMENT ON TABLE pantry_categories IS 'Hierarchical recipe categories with bounty tracking';
COMMENT ON VIEW pantry_bounty_opportunities IS 'Shows which categories need recipes and their bounty rewards';

-- ═══════════════════════════════════════════════════════════════════════════
-- ESCAPE VELOCITY: IP LEDGER PROTECTION FOR HIGH-PERFORMING RECIPES
-- ═══════════════════════════════════════════════════════════════════════════
-- When a recipe reaches "escape velocity" (100+ total votes), it earns:
-- 1. Permanent IP Ledger stamp (SHA-256 hash, immutable record)
-- 2. "Hot Pepper" badge (visual recognition)
-- 3. Portfolio protection (can never be removed by platform)
-- 4. Creator's perpetual attribution rights

-- Add escape velocity tracking to pantry_recipes
ALTER TABLE pantry_recipes
  ADD COLUMN IF NOT EXISTS escape_velocity_reached BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS escape_velocity_reached_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_ledger_hash TEXT;

-- DNA Lock for escape velocity threshold
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('recipe_escape_velocity_threshold', '100', 'integer', true, 'SYSTEM', 'Votes needed for recipe to reach escape velocity and earn IP Ledger protection', 'reputation')
ON CONFLICT (parameter_key) DO NOTHING;

-- Record recipe to IP Ledger when escape velocity is reached
CREATE OR REPLACE FUNCTION record_recipe_escape_velocity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  threshold INTEGER;
  ledger_data TEXT;
  ledger_hash TEXT;
BEGIN
  -- Get threshold from DNA lock
  SELECT parameter_value::INTEGER INTO threshold
  FROM dna_lock WHERE parameter_key = 'recipe_escape_velocity_threshold';

  -- Check if we just crossed the threshold
  IF NEW.vote_count >= threshold AND OLD.vote_count < threshold THEN
    -- Generate IP Ledger stamp data
    ledger_data := json_build_object(
      'recipe_id', NEW.id,
      'creator_id', NEW.creator_id,
      'title', NEW.title,
      'vote_count_at_escape', NEW.vote_count,
      'escape_velocity_timestamp', NOW(),
      'cuisine', NEW.cuisine,
      'meal_type', NEW.meal_type
    )::TEXT;

    -- Create SHA-256 hash (using pgcrypto)
    ledger_hash := encode(digest(ledger_data, 'sha256'), 'hex');

    -- Update recipe with escape velocity status
    NEW.escape_velocity_reached := true;
    NEW.escape_velocity_reached_at := NOW();
    NEW.ip_ledger_hash := ledger_hash;

    -- Record to acknowledgment_stamps (IP Ledger)
    INSERT INTO acknowledgment_stamps (
      user_id,
      action_type,
      rules_version,
      stamp_hash,
      acknowledged_at
    ) VALUES (
      NEW.creator_id,
      'recipe_escape_velocity',
      '1.0',  -- Recipe escape velocity rules version
      ledger_hash,
      NOW()
    );

    -- Award bonus MARKS for reaching escape velocity (50 bonus)
    INSERT INTO marks_transactions (user_id, amount, reason, reason_type)
    VALUES (NEW.creator_id, 50,
            'Recipe reached escape velocity (100+ votes): ' || NEW.title,
            'escape_velocity_bonus');

    UPDATE user_marks
    SET total_marks = total_marks + 50
    WHERE user_id = NEW.creator_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on recipe vote count update
DROP TRIGGER IF EXISTS trigger_recipe_escape_velocity ON pantry_recipes;
CREATE TRIGGER trigger_recipe_escape_velocity
  BEFORE UPDATE OF vote_count ON pantry_recipes
  FOR EACH ROW
  WHEN (NEW.vote_count > OLD.vote_count)
  EXECUTE FUNCTION record_recipe_escape_velocity();

-- View: Recipes that have reached escape velocity (protected IP)
CREATE OR REPLACE VIEW pantry_escape_velocity_recipes AS
SELECT
  r.id,
  r.title,
  r.creator_id,
  r.cuisine,
  r.meal_type,
  r.vote_count,
  r.escape_velocity_reached_at,
  r.ip_ledger_hash,
  r.created_at
FROM pantry_recipes r
WHERE r.escape_velocity_reached = true
ORDER BY r.escape_velocity_reached_at DESC;

GRANT SELECT ON pantry_escape_velocity_recipes TO authenticated;
GRANT SELECT ON pantry_escape_velocity_recipes TO anon;

COMMENT ON COLUMN pantry_recipes.escape_velocity_reached IS 'True when recipe hits 100+ votes, earning IP Ledger protection';
COMMENT ON COLUMN pantry_recipes.ip_ledger_hash IS 'SHA-256 hash recorded to acknowledgment_stamps for permanent attribution';

-- ═══════════════════════════════════════════════════════════════════════════
-- RECIPE FORKING: ATTRIBUTION & ROYALTY SPLIT
-- ═══════════════════════════════════════════════════════════════════════════
-- When someone creates a modified version of an existing recipe:
-- 1. Original creator retains perpetual attribution
-- 2. Fork creator gets their own IP entry
-- 3. Fork usage: 80% to fork creator, 20% to original
-- 4. Original usage: 100% to original creator

ALTER TABLE pantry_recipes
  ADD COLUMN IF NOT EXISTS forked_from_id UUID REFERENCES pantry_recipes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_fork BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fork_acknowledged_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_recipes_forked_from ON pantry_recipes(forked_from_id) WHERE forked_from_id IS NOT NULL;

-- DNA Lock for fork royalty split
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('recipe_fork_original_royalty', '20', 'integer', true, 'SYSTEM', 'Percent of fork recipe credits that go to original creator', 'reputation'),
  ('recipe_fork_creator_royalty', '80', 'integer', true, 'SYSTEM', 'Percent of fork recipe credits that go to fork creator', 'reputation')
ON CONFLICT (parameter_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- EARLY TASTER INCENTIVES: FIRST 1,000 TASTERS
-- ═══════════════════════════════════════════════════════════════════════════
-- For every 100 Makers, we want 1,000 Tasters (10:1 ratio)
-- Early Tasters earn bonus MARKS for ordering and voting

CREATE TABLE IF NOT EXISTS pantry_early_taster_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Tracking
  order_number INTEGER NOT NULL,  -- Which order number system-wide (1-1000)
  meal_id UUID REFERENCES lmd_meals(id) ON DELETE SET NULL,

  -- Rewards earned
  marks_earned INTEGER NOT NULL,
  reputation_earned INTEGER NOT NULL,
  badge_earned TEXT,  -- 'taste_pioneer', 'taste_enthusiast', 'master_taster'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, meal_id)
);

-- Track global taster count for early rewards
CREATE TABLE IF NOT EXISTS pantry_taster_counter (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Singleton
  total_tasters INTEGER DEFAULT 0,
  early_rewards_remaining INTEGER DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pantry_taster_counter (id, total_tasters, early_rewards_remaining)
VALUES (1, 0, 1000)
ON CONFLICT (id) DO NOTHING;

-- DNA Lock for taster rewards
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('early_taster_slots', '1000', 'integer', true, 'SYSTEM', 'Number of early taster reward slots', 'reputation'),
  ('early_taster_marks_tier1', '5', 'integer', true, 'SYSTEM', 'MARKS earned for orders 1-100', 'reputation'),
  ('early_taster_marks_tier2', '3', 'integer', true, 'SYSTEM', 'MARKS earned for orders 101-500', 'reputation'),
  ('early_taster_marks_tier3', '1', 'integer', true, 'SYSTEM', 'MARKS earned for orders 501-1000', 'reputation')
ON CONFLICT (parameter_key) DO NOTHING;

-- Function to award early taster rewards
CREATE OR REPLACE FUNCTION award_early_taster_reward(
  p_user_id UUID,
  p_meal_id UUID
)
RETURNS TABLE(
  marks_awarded INTEGER,
  reputation_awarded INTEGER,
  badge_awarded TEXT,
  order_number INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_num INTEGER;
  v_marks INTEGER := 0;
  v_reputation INTEGER := 0;
  v_badge TEXT := NULL;
BEGIN
  -- Check if user already claimed for this meal
  IF EXISTS (SELECT 1 FROM pantry_early_taster_rewards WHERE user_id = p_user_id AND meal_id = p_meal_id) THEN
    RETURN QUERY SELECT 0, 0, NULL::TEXT, 0;
    RETURN;
  END IF;

  -- Atomically get and increment counter
  UPDATE pantry_taster_counter
  SET total_tasters = total_tasters + 1,
      early_rewards_remaining = GREATEST(0, early_rewards_remaining - 1),
      updated_at = NOW()
  WHERE id = 1 AND early_rewards_remaining > 0
  RETURNING total_tasters INTO v_order_num;

  IF v_order_num IS NULL THEN
    -- No more early rewards available
    RETURN QUERY SELECT 0, 0, NULL::TEXT, 0;
    RETURN;
  END IF;

  -- Calculate rewards based on tier
  IF v_order_num <= 100 THEN
    v_marks := 5;
    v_reputation := 10;
    IF v_order_num <= 10 THEN
      v_badge := 'taste_pioneer';
    END IF;
  ELSIF v_order_num <= 500 THEN
    v_marks := 3;
    v_reputation := 5;
    IF v_order_num <= 50 THEN
      v_badge := 'taste_enthusiast';
    END IF;
  ELSE
    v_marks := 1;
    v_reputation := 2;
    IF v_order_num <= 100 THEN
      v_badge := 'master_taster';
    END IF;
  END IF;

  -- Record the reward
  INSERT INTO pantry_early_taster_rewards (user_id, meal_id, order_number, marks_earned, reputation_earned, badge_earned)
  VALUES (p_user_id, p_meal_id, v_order_num, v_marks, v_reputation, v_badge);

  -- Award MARKS
  IF v_marks > 0 THEN
    INSERT INTO marks_transactions (user_id, amount, reason, reason_type)
    VALUES (p_user_id, v_marks, 'Early Taster reward (order #' || v_order_num || ')', 'early_taster');

    UPDATE user_marks
    SET total_marks = total_marks + v_marks
    WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_marks, v_reputation, v_badge, v_order_num;
END;
$$;

-- RLS for early taster tables
ALTER TABLE pantry_early_taster_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_taster_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own taster rewards" ON pantry_early_taster_rewards;
CREATE POLICY "Users view own taster rewards"
  ON pantry_early_taster_rewards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view taster counter" ON pantry_taster_counter;
CREATE POLICY "Anyone can view taster counter"
  ON pantry_taster_counter FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- EARLY MAKER TRACKING: FIRST 100 MAKERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pantry_maker_counter (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Singleton
  total_makers INTEGER DEFAULT 0,
  early_rewards_remaining INTEGER DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pantry_maker_counter (id, total_makers, early_rewards_remaining)
VALUES (1, 0, 100)
ON CONFLICT (id) DO NOTHING;

-- DNA Lock for maker tracking
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('early_maker_slots', '100', 'integer', true, 'SYSTEM', 'Number of early maker reward slots', 'reputation')
ON CONFLICT (parameter_key) DO NOTHING;

ALTER TABLE pantry_maker_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view maker counter" ON pantry_maker_counter;
CREATE POLICY "Anyone can view maker counter"
  ON pantry_maker_counter FOR SELECT
  USING (true);

-- View: Early program status
CREATE OR REPLACE VIEW pantry_early_program_status AS
SELECT
  m.total_makers,
  m.early_rewards_remaining as maker_slots_remaining,
  100 - m.early_rewards_remaining as makers_claimed,
  t.total_tasters,
  t.early_rewards_remaining as taster_slots_remaining,
  1000 - t.early_rewards_remaining as tasters_claimed,
  CASE
    WHEN m.early_rewards_remaining > 0 OR t.early_rewards_remaining > 0 THEN 'OPEN'
    ELSE 'CLOSED'
  END as program_status
FROM pantry_maker_counter m, pantry_taster_counter t
WHERE m.id = 1 AND t.id = 1;

GRANT SELECT ON pantry_early_program_status TO authenticated;
GRANT SELECT ON pantry_early_program_status TO anon;
