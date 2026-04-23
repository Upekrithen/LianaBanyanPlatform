-- ════════════════════════════════════════════════════════════════════════════
-- GHOST WORLD & HALF-LIFE LEADERBOARDS
-- ════════════════════════════════════════════════════════════════════════════
--
-- "Not in normal mode. You'd have to go Ghost."
-- "The crow remembers what the ghost forgets."
--
-- This migration creates the tables for:
-- 1. Crow Feathers (permanent achievements for Ghost World players)
-- 2. Ghost Leaderboards (time-bracketed speedrun records)
-- 3. Real World Leaderboards (service/trust metrics for members)
-- 4. Session Purchases (when users pay to keep their loot)
-- 5. Treasure Maps (member-created beacon routes)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- CROW FEATHERS
-- Permanent achievements for Ghost World players
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crow_feathers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL CHECK (category IN (
    'golden_keys', 'areas_discovered', 'labyrinth_speed',
    'conduits_traversed', 'friend_words', 'candles_earned',
    'deck_cards_viewed', 'beacon_journeys'
  )),
  time_bracket TEXT NOT NULL CHECK (time_bracket IN (
    'under_15m', '15m_30m', '30m_1h', '1h_2h', '2h_3h',
    '3h_4h', '4h_6h', '6h_8h', '8h_10h', '10h_12h', 'absolute'
  )),
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  superseded_by INTEGER REFERENCES crow_feathers(id),
  UNIQUE(id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_crow_feathers_user ON crow_feathers(user_id);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_category ON crow_feathers(category, time_bracket);

-- ════════════════════════════════════════════════════════════════════
-- GHOST LEADERBOARDS
-- Current records for each category/time bracket combination
-- ════════════════════════════════════════════════════════════════════

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

CREATE INDEX IF NOT EXISTS idx_ghost_leaderboard_category ON ghost_leaderboard(category);

-- ════════════════════════════════════════════════════════════════════
-- REAL WORLD LEADERBOARDS (Members Only)
-- Service, trust, and reliability metrics
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS real_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'five_star_deliveries', 'on_time_rate', 'gratitude_marks',
    'consistency_streak', 'guild_rank', 'response_time',
    'collaboration_score'
  )),
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN (
    'lifetime', 'rolling_30', 'rolling_7', 'current'
  )),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rank INTEGER,
  UNIQUE(category, user_id)
);

CREATE INDEX IF NOT EXISTS idx_real_leaderboard_category ON real_leaderboard(category, rank);

-- ════════════════════════════════════════════════════════════════════
-- SESSION PURCHASES
-- When users pay to keep their Ghost World loot
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS session_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_duration_minutes INTEGER NOT NULL,
  items_preserved JSONB NOT NULL DEFAULT '{}',
  price_paid DECIMAL(6,2) NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('save', 'end')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_purchases_user ON session_purchases(user_id);

-- ════════════════════════════════════════════════════════════════════
-- GHOST SESSIONS
-- Track active and historical Ghost World sessions
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ghost_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMPTZ,
  loot JSONB NOT NULL DEFAULT '{}',
  saved_loot JSONB,
  saved_at TIMESTAMPTZ,
  free_cue_card_id UUID,
  free_cue_card_selected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ghost_sessions_user ON ghost_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_active ON ghost_sessions(user_id, ended_at) WHERE ended_at IS NULL;

-- ════════════════════════════════════════════════════════════════════
-- TREASURE MAPS
-- Member-created beacon routes for Ghost World speedruns
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),

  -- Route data
  beacons JSONB NOT NULL DEFAULT '[]',
  starting_location TEXT NOT NULL,
  ending_location TEXT NOT NULL,
  estimated_time_minutes INTEGER,

  -- Requirements
  required_candles INTEGER DEFAULT 0,
  required_equipment JSONB DEFAULT '[]',

  -- Economics
  ante_price DECIMAL(6,2) DEFAULT 0,
  creator_earnings DECIMAL(12,2) DEFAULT 0,
  total_runs INTEGER DEFAULT 0,

  -- Records
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES auth.users(id),
  best_time_at TIMESTAMPTZ,

  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasure_maps_creator ON treasure_maps(creator_id);
CREATE INDEX IF NOT EXISTS idx_treasure_maps_published ON treasure_maps(is_published, difficulty_level);

-- ════════════════════════════════════════════════════════════════════
-- TREASURE MAP RUNS
-- Records of players completing treasure maps
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasure_map_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES treasure_maps(id) NOT NULL,
  runner_id UUID REFERENCES auth.users(id) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_time_seconds INTEGER,
  ante_paid DECIMAL(6,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN (
    'in_progress', 'completed', 'abandoned', 'failed'
  )),
  beacons_reached JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_map_runs_map ON treasure_map_runs(map_id);
CREATE INDEX IF NOT EXISTS idx_map_runs_runner ON treasure_map_runs(runner_id);

-- ════════════════════════════════════════════════════════════════════
-- MEMBER EQUIPMENT / ARMORY
-- Equipment members can bring into Ghost World
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS member_armory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_data JSONB DEFAULT '{}',
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  acquired_from TEXT,  -- 'purchase', 'reward', 'trade', etc.
  is_tradeable BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_member_armory_user ON member_armory(user_id);

-- ════════════════════════════════════════════════════════════════════
-- JOIN THE FRAY - LEAGUE ENTRIES
-- Discord league competition entries
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fray_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  map_id UUID REFERENCES treasure_maps(id),
  discord_channel_id TEXT,

  -- Schedule
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,

  -- Economics
  entry_ante DECIMAL(6,2) DEFAULT 0,
  prize_pool DECIMAL(12,2) DEFAULT 0,
  platform_cut_percent DECIMAL(4,2) DEFAULT 20,

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
  )),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fray_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES fray_leagues(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  ante_paid DECIMAL(6,2),

  -- Results
  best_run_id UUID REFERENCES treasure_map_runs(id),
  best_time_seconds INTEGER,
  final_rank INTEGER,
  prize_earned DECIMAL(6,2),

  UNIQUE(league_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fray_entries_league ON fray_entries(league_id);
CREATE INDEX IF NOT EXISTS idx_fray_entries_user ON fray_entries(user_id);

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

-- Crow Feathers: Everyone can read, only system can write
ALTER TABLE crow_feathers ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_crow_feathers ON crow_feathers FOR SELECT USING (true);

-- Ghost Leaderboard: Public read
ALTER TABLE ghost_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_ghost_leaderboard ON ghost_leaderboard FOR SELECT USING (true);

-- Real Leaderboard: Public read
ALTER TABLE real_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_real_leaderboard ON real_leaderboard FOR SELECT USING (true);

-- Ghost Sessions: Users see their own
ALTER TABLE ghost_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_ghost_sessions ON ghost_sessions FOR ALL USING (auth.uid() = user_id);

-- Session Purchases: Users see their own
ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_session_purchases ON session_purchases FOR ALL USING (auth.uid() = user_id);

-- Treasure Maps: Public read for published, creator can edit own
ALTER TABLE treasure_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_published_maps ON treasure_maps FOR SELECT USING (is_published = true OR auth.uid() = creator_id);
CREATE POLICY edit_own_maps ON treasure_maps FOR ALL USING (auth.uid() = creator_id);

-- Treasure Map Runs: Users see their own
ALTER TABLE treasure_map_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_map_runs ON treasure_map_runs FOR ALL USING (auth.uid() = runner_id);

-- Member Armory: Users see their own
ALTER TABLE member_armory ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_armory ON member_armory FOR ALL USING (auth.uid() = user_id);

-- Fray Leagues: Public read
ALTER TABLE fray_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_fray_leagues ON fray_leagues FOR SELECT USING (true);

-- Fray Entries: Public read for rankings, users manage their own
ALTER TABLE fray_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_fray_entries ON fray_entries FOR SELECT USING (true);
CREATE POLICY manage_own_fray_entries ON fray_entries FOR ALL USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ════════════════════════════════════════════════════════════════════

COMMENT ON TABLE crow_feathers IS 'Permanent Ghost World achievements - "The crow remembers what the ghost forgets"';
COMMENT ON TABLE ghost_leaderboard IS 'Current records for Ghost World speedrun categories';
COMMENT ON TABLE real_leaderboard IS 'Member service/trust leaderboards';
COMMENT ON TABLE ghost_sessions IS 'Active and historical Ghost World sessions';
COMMENT ON TABLE session_purchases IS 'When users pay to keep their Ghost World loot';
COMMENT ON TABLE treasure_maps IS 'Member-created beacon routes for speedruns';
COMMENT ON TABLE treasure_map_runs IS 'Individual attempts at completing treasure maps';
COMMENT ON TABLE member_armory IS 'Equipment members can bring into Ghost World';
COMMENT ON TABLE fray_leagues IS 'Join the Fray - organized Discord leagues';
COMMENT ON TABLE fray_entries IS 'User registrations for Fray leagues';
