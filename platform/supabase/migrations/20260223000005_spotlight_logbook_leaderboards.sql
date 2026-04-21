-- ============================================================================
-- SPOTLIGHT, LOGBOOK, PORTFOLIO & LEADERBOARDS SYSTEM
-- Migration: 20260223000005
-- Date: February 23, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: SPOTLIGHT RANGER MODE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_spotlight_prefs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ranger_mode_enabled BOOLEAN DEFAULT TRUE,
  dismissed_spotlights TEXT[] DEFAULT '{}',
  last_reset TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_spotlight_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_spotlight_prefs ON user_spotlight_prefs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: PORTFOLIO SYSTEM (Members Only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_portfolios (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_data JSONB DEFAULT '{}',
  quantity DECIMAL(10,2) DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  is_treasure_map BOOLEAN DEFAULT FALSE,
  map_data JSONB
);

CREATE TABLE IF NOT EXISTS portfolio_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  relationship TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS portfolio_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Session logs for export
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  entries JSONB DEFAULT '[]',
  collected_items JSONB DEFAULT '[]',
  areas_discovered TEXT[] DEFAULT '{}',
  exported_at TIMESTAMPTZ,
  emailed_at TIMESTAMPTZ
);

-- Free cue card tracking
CREATE TABLE IF NOT EXISTS user_free_cue_card (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  cue_card_id TEXT,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID
);

-- RLS for portfolio tables
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_free_cue_card ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_portfolio ON user_portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_inventory ON portfolio_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_notes ON portfolio_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_maps ON portfolio_maps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_contacts ON portfolio_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_achievements ON portfolio_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_sessions ON session_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_free_card ON user_free_cue_card FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CROW FEATHERS (Permanent for all users)
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS crow_feather_number_seq START 1;

CREATE TABLE IF NOT EXISTS crow_feathers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  time_bracket TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  feather_number INTEGER NOT NULL DEFAULT nextval('crow_feather_number_seq'),
  superseded_by INTEGER REFERENCES crow_feathers(id),
  UNIQUE(feather_number)
);

DROP INDEX IF EXISTS idx_crow_feathers_user;
DROP INDEX IF EXISTS idx_crow_feathers_category;

CREATE INDEX idx_crow_feathers_user ON crow_feathers(user_id);
CREATE INDEX idx_crow_feathers_category ON crow_feathers(category, time_bracket);

ALTER TABLE crow_feathers ENABLE ROW LEVEL SECURITY;

-- Anyone can view crow feathers (public leaderboard)
DROP POLICY IF EXISTS view_crow_feathers ON crow_feathers;
CREATE POLICY view_crow_feathers ON crow_feathers FOR SELECT USING (true);
-- Only system can insert (via function)
DROP POLICY IF EXISTS insert_crow_feathers ON crow_feathers;
CREATE POLICY insert_crow_feathers ON crow_feathers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 4: GHOST WORLD LEADERBOARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ghost_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  time_bracket TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  crow_feather_id INTEGER REFERENCES crow_feathers(id),
  UNIQUE(category, time_bracket)
);

DROP INDEX IF EXISTS idx_ghost_leaderboard_category;
CREATE INDEX idx_ghost_leaderboard_category ON ghost_leaderboard(category, time_bracket);

ALTER TABLE ghost_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public viewing
DROP POLICY IF EXISTS view_ghost_leaderboard ON ghost_leaderboard;
CREATE POLICY view_ghost_leaderboard ON ghost_leaderboard FOR SELECT USING (true);

-- ============================================================================
-- PART 5: REAL WORLD LEADERBOARDS (Members Only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS real_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  period_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rank INTEGER,
  UNIQUE(category, user_id)
);

DROP INDEX IF EXISTS idx_real_leaderboard_category;
CREATE INDEX idx_real_leaderboard_category ON real_leaderboard(category, rank);

ALTER TABLE real_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public viewing
DROP POLICY IF EXISTS view_real_leaderboard ON real_leaderboard;
CREATE POLICY view_real_leaderboard ON real_leaderboard FOR SELECT USING (true);

-- ============================================================================
-- PART 6: SESSION PURCHASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_duration_minutes INTEGER NOT NULL,
  items_preserved JSONB NOT NULL,
  price_paid DECIMAL(6,2) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_purchases ON session_purchases FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 7: FUNCTIONS
-- ============================================================================

-- Function to check and award crow feather for a new record
CREATE OR REPLACE FUNCTION check_and_award_crow_feather(
  p_user_id UUID,
  p_username TEXT,
  p_category TEXT,
  p_time_bracket TEXT,
  p_record_value DECIMAL,
  p_session_duration_minutes INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_existing_record RECORD;
  v_feather_id INTEGER;
BEGIN
  -- Check if there's an existing record for this category/bracket
  SELECT * INTO v_existing_record
  FROM ghost_leaderboard
  WHERE category = p_category AND time_bracket = p_time_bracket;

  -- For labyrinth_speed, lower is better; for everything else, higher is better
  IF v_existing_record IS NULL OR
     (p_category = 'labyrinth_speed' AND p_record_value < v_existing_record.record_value) OR
     (p_category != 'labyrinth_speed' AND p_record_value > v_existing_record.record_value) THEN

    -- Award new crow feather
    INSERT INTO crow_feathers (user_id, category, record_value, session_duration_minutes, time_bracket)
    VALUES (p_user_id, p_category, p_record_value, p_session_duration_minutes, p_time_bracket)
    RETURNING id INTO v_feather_id;

    -- Mark old feather as superseded
    IF v_existing_record IS NOT NULL AND v_existing_record.crow_feather_id IS NOT NULL THEN
      UPDATE crow_feathers SET superseded_by = v_feather_id
      WHERE id = v_existing_record.crow_feather_id;
    END IF;

    -- Update or insert leaderboard entry
    INSERT INTO ghost_leaderboard (category, time_bracket, user_id, username, record_value, session_duration_minutes, crow_feather_id)
    VALUES (p_category, p_time_bracket, p_user_id, p_username, p_record_value, p_session_duration_minutes, v_feather_id)
    ON CONFLICT (category, time_bracket)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      username = EXCLUDED.username,
      record_value = EXCLUDED.record_value,
      session_duration_minutes = EXCLUDED.session_duration_minutes,
      achieved_at = NOW(),
      crow_feather_id = EXCLUDED.crow_feather_id;

    RETURN v_feather_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time bracket from session duration
CREATE OR REPLACE FUNCTION get_time_bracket(duration_minutes INTEGER) RETURNS TEXT AS $$
BEGIN
  IF duration_minutes < 15 THEN RETURN 'Under 15 minutes';
  ELSIF duration_minutes < 30 THEN RETURN '15-30 minutes';
  ELSIF duration_minutes < 60 THEN RETURN '30 min - 1 hour';
  ELSIF duration_minutes < 120 THEN RETURN '1-2 hours';
  ELSIF duration_minutes < 180 THEN RETURN '2-3 hours';
  ELSIF duration_minutes < 240 THEN RETURN '3-4 hours';
  ELSIF duration_minutes < 360 THEN RETURN '4-6 hours';
  ELSIF duration_minutes < 480 THEN RETURN '6-8 hours';
  ELSIF duration_minutes < 600 THEN RETURN '8-10 hours';
  ELSE RETURN '10-12 hours';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create portfolio for new member
CREATE OR REPLACE FUNCTION create_member_portfolio() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_status = 'active' AND (OLD.membership_status IS NULL OR OLD.membership_status != 'active') THEN
    INSERT INTO user_portfolios (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create portfolio when membership activates
DROP TRIGGER IF EXISTS create_portfolio_on_membership ON profiles;
CREATE TRIGGER create_portfolio_on_membership
  AFTER UPDATE OF membership_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_member_portfolio();

-- ============================================================================
-- PART 8: SEED DATA
-- ============================================================================

-- Insert some initial leaderboard categories into DNA lock for configuration
INSERT INTO dna_lock (key, value, data_type, is_locked, locked_by, description, category)
VALUES
  ('ghost_leaderboard_categories', 'golden_keys,areas_discovered,labyrinth_speed,conduit_jumps,friend_words,candles_earned,deck_cards_viewed,beacon_journeys', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Valid categories for Ghost World leaderboards', 'leaderboards'),
  ('real_leaderboard_categories', 'five_star_deliveries,on_time_rate,gratitude_received,collaboration_score,consistency_streak,guild_ranking', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Valid categories for Real World leaderboards', 'leaderboards'),
  ('session_purchase_prices', '0.50,1.00,1.50,2.50', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Session purchase prices by duration tier', 'pricing')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================
