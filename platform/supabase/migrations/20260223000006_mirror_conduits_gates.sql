-- ============================================================================
-- MIRROR CONDUITS & GATES SYSTEM
-- Migration: 20260223000006
-- Date: February 23, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: MIRROR CONDUITS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mirror_conduits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_a_location TEXT NOT NULL,
  mirror_b_location TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  riddle_clue TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mirror_a_location, mirror_b_location)
);

CREATE TABLE IF NOT EXISTS user_conduit_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conduit_id UUID REFERENCES mirror_conduits(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  candle_collected BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, conduit_id)
);

CREATE TABLE IF NOT EXISTS user_candles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  standard_amount DECIMAL(4,1) DEFAULT 0,
  babylon_amount DECIMAL(4,1) DEFAULT 0,
  last_regeneration TIMESTAMPTZ DEFAULT NOW(),
  regeneration_count INTEGER DEFAULT 0
);

-- RLS for conduit tables
ALTER TABLE mirror_conduits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conduit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_conduits ON mirror_conduits FOR SELECT USING (true);
CREATE POLICY own_conduit_progress ON user_conduit_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_candles ON user_candles FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: GATES & FRIEND WORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_friend_words (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_via TEXT CHECK (discovered_via IN ('lintel', 'manual', 'gift')),
  PRIMARY KEY (user_id, word)
);

CREATE TABLE IF NOT EXISTS gate_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  friend_word TEXT NOT NULL,
  language TEXT NOT NULL,
  passed_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_gate_passages_gate;
CREATE INDEX idx_gate_passages_gate ON gate_passages(gate_id, passed_at DESC);

-- View for lintel display (last 3 per gate)
CREATE OR REPLACE VIEW gate_lintels AS
SELECT 
  gate_id,
  array_agg(friend_word ORDER BY passed_at DESC) AS recent_words,
  array_agg(language ORDER BY passed_at DESC) AS recent_languages
FROM (
  SELECT DISTINCT ON (gate_id, friend_word)
    gate_id,
    friend_word,
    language,
    passed_at
  FROM gate_passages
  ORDER BY gate_id, friend_word, passed_at DESC
) sub
GROUP BY gate_id;

-- RLS for friend words and passages
ALTER TABLE user_friend_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS own_friend_words ON user_friend_words;
DROP POLICY IF EXISTS view_gate_passages ON gate_passages;
DROP POLICY IF EXISTS insert_gate_passages ON gate_passages;

CREATE POLICY own_friend_words ON user_friend_words FOR ALL USING (auth.uid() = user_id);
CREATE POLICY view_gate_passages ON gate_passages FOR SELECT USING (true);
CREATE POLICY insert_gate_passages ON gate_passages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CONTENT RATINGS & EXCEPTION STAMPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_content_rating (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_rating TEXT DEFAULT 'GA' CHECK (current_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  verified_age BOOLEAN DEFAULT FALSE,
  rating_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exception_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_rating TEXT NOT NULL CHECK (from_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  to_rating TEXT NOT NULL CHECK (to_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  passphrase_hash TEXT NOT NULL,
  stamped_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only user can see their own stamps (privacy-first)
ALTER TABLE user_content_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE exception_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_content_rating ON user_content_rating FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_exception_stamps ON exception_stamps FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 4: TREASURE MAPS (User-Created Circuits)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  beacon_path JSONB DEFAULT '[]',
  test_completed BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  publication_cost_paid BOOLEAN DEFAULT FALSE,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS treasure_map_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES user_treasure_maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completion_time_seconds INTEGER,
  UNIQUE(map_id, user_id)
);

-- RLS for treasure maps
ALTER TABLE user_treasure_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_map_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_published_maps ON user_treasure_maps FOR SELECT USING (published = true OR auth.uid() = creator_id);
CREATE POLICY own_maps ON user_treasure_maps FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY own_completions ON treasure_map_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY view_completions ON treasure_map_completions FOR SELECT USING (true);

-- ============================================================================
-- PART 5: FUNCTIONS
-- ============================================================================

-- Function to regenerate candles with increasing intervals
CREATE OR REPLACE FUNCTION regenerate_candle(p_user_id UUID) RETURNS DECIMAL AS $$
DECLARE
  v_candles RECORD;
  v_wait_minutes INTEGER;
  v_can_regenerate BOOLEAN;
  v_new_amount DECIMAL;
BEGIN
  SELECT * INTO v_candles FROM user_candles WHERE user_id = p_user_id;
  
  IF v_candles IS NULL THEN
    INSERT INTO user_candles (user_id, standard_amount) VALUES (p_user_id, 0.1)
    RETURNING standard_amount INTO v_new_amount;
    RETURN v_new_amount;
  END IF;

  CASE v_candles.regeneration_count
    WHEN 0 THEN v_wait_minutes := 1;
    WHEN 1 THEN v_wait_minutes := 3;
    WHEN 2 THEN v_wait_minutes := 10;
    WHEN 3 THEN v_wait_minutes := 30;
    WHEN 4 THEN v_wait_minutes := 60;
    ELSE v_wait_minutes := 180;
  END CASE;

  v_can_regenerate := v_candles.last_regeneration + (v_wait_minutes || ' minutes')::INTERVAL <= NOW();

  IF v_can_regenerate THEN
    UPDATE user_candles
    SET 
      standard_amount = LEAST(standard_amount + 0.1, 10.0),
      last_regeneration = NOW(),
      regeneration_count = regeneration_count + 1
    WHERE user_id = p_user_id
    RETURNING standard_amount INTO v_new_amount;
    RETURN v_new_amount;
  END IF;

  RETURN v_candles.standard_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use a candle
CREATE OR REPLACE FUNCTION use_candle(
  p_user_id UUID,
  p_amount DECIMAL,
  p_is_babylon BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
  v_candles RECORD;
BEGIN
  SELECT * INTO v_candles FROM user_candles WHERE user_id = p_user_id;
  
  IF v_candles IS NULL THEN
    RETURN FALSE;
  END IF;

  IF p_is_babylon THEN
    IF v_candles.babylon_amount < p_amount THEN
      RETURN FALSE;
    END IF;
    UPDATE user_candles SET babylon_amount = babylon_amount - p_amount WHERE user_id = p_user_id;
  ELSE
    IF v_candles.standard_amount < p_amount THEN
      RETURN FALSE;
    END IF;
    UPDATE user_candles SET standard_amount = standard_amount - p_amount WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock Black Babylon candles when threshold reached
CREATE OR REPLACE FUNCTION check_babylon_unlock() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.standard_amount >= 11.0 AND OLD.standard_amount < 11.0 THEN
    NEW.babylon_amount := COALESCE(NEW.babylon_amount, 0) + 1.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS babylon_unlock_trigger ON user_candles;
CREATE TRIGGER babylon_unlock_trigger
  BEFORE UPDATE ON user_candles
  FOR EACH ROW
  EXECUTE FUNCTION check_babylon_unlock();

-- ============================================================================
-- PART 6: SEED DATA
-- ============================================================================

-- Seed some initial mirror conduits
INSERT INTO mirror_conduits (mirror_a_location, mirror_b_location, difficulty_level, riddle_clue)
VALUES 
  ('index:choose-path:left', 'index:choose-path:right', 1, NULL),
  ('landing:hero:mirror', 'initiatives:overview:mirror', 2, NULL),
  ('senate:hall:entrance', 'labyrinth:center:exit', 3, 'Where all guilds meet, beneath the tower'),
  ('guild:harper:door', 'guild:harper:practice', 2, NULL),
  ('treasury:chest:mirror', 'treasury:vault:mirror', 3, 'Where wealth is stored, another waits')
ON CONFLICT DO NOTHING;

-- Seed rating descriptions into DNA lock
INSERT INTO dna_lock (key, value, data_type, is_locked, locked_by, description, category)
VALUES 
  ('content_rating_ST', 'Shirley Temple - All ages, completely wholesome', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings'),
  ('content_rating_GA', 'General - General audiences', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings'),
  ('content_rating_UV', 'Ultra-Violet - Strictly age-gated explicit content', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================
