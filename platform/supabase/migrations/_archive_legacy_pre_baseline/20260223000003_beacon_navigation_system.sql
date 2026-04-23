-- =====================================================
-- BEACON BREADCRUMB NAVIGATION SYSTEM
-- Innovation: User-placed waypoints with portal-back
-- =====================================================

-- Beacons table (user-placed navigation markers)
CREATE TABLE IF NOT EXISTS beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Beacon identification
  beacon_color TEXT NOT NULL CHECK (beacon_color IN ('green', 'blue', 'yellow', 'red', 'purple', 'orange')),
  beacon_number INTEGER, -- Sequential per user (auto-assigned)

  -- Location
  path TEXT NOT NULL, -- URL path where beacon was dropped
  page_title TEXT, -- Human-readable page title

  -- Content
  note TEXT, -- User's note about why they marked this

  -- Orange Protocol (custom beacons)
  orange_subtype TEXT CHECK (orange_subtype IN (
    'game_marker', 'share_person', 'social_cue', 'gift',
    'treasure', 'learning', 'trade_route', 'custom'
  )),
  orange_payload JSONB, -- Custom data for orange beacons

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT valid_orange CHECK (
    (beacon_color = 'orange' AND orange_subtype IS NOT NULL) OR
    (beacon_color != 'orange' AND orange_subtype IS NULL)
  )
);

-- Auto-assign beacon numbers per user
CREATE OR REPLACE FUNCTION assign_beacon_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(beacon_number), 0) + 1
  INTO NEW.beacon_number
  FROM beacons
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_number_trigger ON beacons;
CREATE TRIGGER beacon_number_trigger
  BEFORE INSERT ON beacons
  FOR EACH ROW
  EXECUTE FUNCTION assign_beacon_number();

-- Indexes for beacons (drop first to allow re-running)
DROP INDEX IF EXISTS idx_beacons_user;
DROP INDEX IF EXISTS idx_beacons_color;
DROP INDEX IF EXISTS idx_beacons_path;
DROP INDEX IF EXISTS idx_beacons_created;

CREATE INDEX idx_beacons_user ON beacons(user_id);
CREATE INDEX idx_beacons_color ON beacons(beacon_color);
CREATE INDEX idx_beacons_path ON beacons(path);
CREATE INDEX idx_beacons_created ON beacons(created_at DESC);

-- =====================================================
-- BEACON RUN GAMES (Ghost Mode Only)
-- =====================================================

-- Beacon Run courses (user-created games)
CREATE TABLE IF NOT EXISTS beacon_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id),

  -- Course info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),

  -- Route data
  beacon_ids UUID[] NOT NULL, -- Ordered array of beacon IDs
  total_beacons INTEGER NOT NULL,
  estimated_minutes INTEGER,

  -- Competition settings
  ante_credits INTEGER DEFAULT 0, -- Entry fee
  prize_pool_credits INTEGER DEFAULT 0,

  -- Stats
  times_started INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES profiles(id),

  -- Publication
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Ghost Mode requirement (always true for Beacon Runs)
  requires_ghost_mode BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate slug for beacon runs
CREATE OR REPLACE FUNCTION generate_beacon_run_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' ||
                SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_slug_trigger ON beacon_runs;
CREATE TRIGGER beacon_run_slug_trigger
  BEFORE INSERT ON beacon_runs
  FOR EACH ROW
  EXECUTE FUNCTION generate_beacon_run_slug();

-- Beacon Run progress (tracking user attempts)
CREATE TABLE IF NOT EXISTS beacon_run_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  run_id UUID NOT NULL REFERENCES beacon_runs(id),

  -- Progress tracking
  beacons_reached UUID[] DEFAULT '{}',
  current_beacon_index INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  elapsed_seconds INTEGER DEFAULT 0,

  -- Ghost Mode verification
  ghost_session_id UUID, -- Links to ghost session for validation

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  UNIQUE(user_id, run_id, started_at)
);

-- Beacon Run leaderboard entries
CREATE TABLE IF NOT EXISTS beacon_run_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES beacon_runs(id),
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- Performance
  completion_time_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ranking
  rank INTEGER,

  -- Crow Feathers earned
  crow_feathers_earned INTEGER DEFAULT 0,

  UNIQUE(run_id, user_id, completed_at)
);

-- =====================================================
-- TREASURE MAPS (Tradeable Journey Records)
-- =====================================================

CREATE TABLE IF NOT EXISTS treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id),

  -- Map info
  name TEXT NOT NULL,
  description TEXT,
  map_type TEXT CHECK (map_type IN (
    'pathway_guide', 'completionist', 'speedrun',
    'hidden_path', 'beacon_run_course'
  )),

  -- Content
  beacon_ids UUID[] NOT NULL, -- Beacons included in this map
  route_data JSONB, -- Additional route information

  -- Trading
  price_marks INTEGER DEFAULT 0, -- Price in Marks
  is_for_sale BOOLEAN DEFAULT FALSE,
  times_sold INTEGER DEFAULT 0,

  -- Stats
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Map purchases
CREATE TABLE IF NOT EXISTS treasure_map_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES treasure_maps(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),

  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(map_id, buyer_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_run_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_run_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_map_purchases ENABLE ROW LEVEL SECURITY;

-- Beacons: Users can only see/manage their own
CREATE POLICY "Users can view own beacons" ON beacons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own beacons" ON beacons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own beacons" ON beacons
  FOR DELETE USING (auth.uid() = user_id);

-- Beacon Runs: Anyone can view published, creators can manage
CREATE POLICY "Anyone can view published beacon runs" ON beacon_runs
  FOR SELECT USING (is_published = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can create beacon runs" ON beacon_runs
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own beacon runs" ON beacon_runs
  FOR UPDATE USING (auth.uid() = creator_id);

-- Beacon Run Progress: Users can only see/manage their own
CREATE POLICY "Users can view own progress" ON beacon_run_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON beacon_run_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON beacon_run_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard: Anyone can view
CREATE POLICY "Anyone can view leaderboard" ON beacon_run_leaderboard
  FOR SELECT USING (TRUE);

-- Treasure Maps: Anyone can view for-sale, creators can manage
CREATE POLICY "Anyone can view for-sale maps" ON treasure_maps
  FOR SELECT USING (is_for_sale = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can create maps" ON treasure_maps
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own maps" ON treasure_maps
  FOR UPDATE USING (auth.uid() = creator_id);

-- Map Purchases: Users can view their own
CREATE POLICY "Users can view own purchases" ON treasure_map_purchases
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchases" ON treasure_map_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update beacon run stats when completed
CREATE OR REPLACE FUNCTION update_beacon_run_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    -- Update run stats
    UPDATE beacon_runs
    SET
      times_completed = times_completed + 1,
      best_time_seconds = CASE
        WHEN best_time_seconds IS NULL OR NEW.elapsed_seconds < best_time_seconds
        THEN NEW.elapsed_seconds
        ELSE best_time_seconds
      END,
      best_time_user_id = CASE
        WHEN best_time_seconds IS NULL OR NEW.elapsed_seconds < best_time_seconds
        THEN NEW.user_id
        ELSE best_time_user_id
      END
    WHERE id = NEW.run_id;

    -- Insert leaderboard entry
    INSERT INTO beacon_run_leaderboard (run_id, user_id, completion_time_seconds)
    VALUES (NEW.run_id, NEW.user_id, NEW.elapsed_seconds);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_completion_trigger ON beacon_run_progress;
CREATE TRIGGER beacon_run_completion_trigger
  AFTER UPDATE ON beacon_run_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_beacon_run_stats();

-- Increment times_started when progress created
CREATE OR REPLACE FUNCTION increment_run_started()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beacon_runs
  SET times_started = times_started + 1
  WHERE id = NEW.run_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_started_trigger ON beacon_run_progress;
CREATE TRIGGER beacon_run_started_trigger
  AFTER INSERT ON beacon_run_progress
  FOR EACH ROW
  EXECUTE FUNCTION increment_run_started();

-- =====================================================
-- INDEXES (drop first to allow re-running)
-- =====================================================

DROP INDEX IF EXISTS idx_beacon_runs_creator;
DROP INDEX IF EXISTS idx_beacon_runs_published;
DROP INDEX IF EXISTS idx_beacon_runs_featured;
DROP INDEX IF EXISTS idx_beacon_run_progress_user;
DROP INDEX IF EXISTS idx_beacon_run_progress_run;
DROP INDEX IF EXISTS idx_beacon_run_leaderboard_run;
DROP INDEX IF EXISTS idx_beacon_run_leaderboard_time;
DROP INDEX IF EXISTS idx_treasure_maps_creator;
DROP INDEX IF EXISTS idx_treasure_maps_for_sale;

CREATE INDEX idx_beacon_runs_creator ON beacon_runs(creator_id);
CREATE INDEX idx_beacon_runs_published ON beacon_runs(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_beacon_runs_featured ON beacon_runs(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_beacon_run_progress_user ON beacon_run_progress(user_id);
CREATE INDEX idx_beacon_run_progress_run ON beacon_run_progress(run_id);

CREATE INDEX idx_beacon_run_leaderboard_run ON beacon_run_leaderboard(run_id);
CREATE INDEX idx_beacon_run_leaderboard_time ON beacon_run_leaderboard(completion_time_seconds);

CREATE INDEX idx_treasure_maps_creator ON treasure_maps(creator_id);
CREATE INDEX idx_treasure_maps_for_sale ON treasure_maps(is_for_sale) WHERE is_for_sale = TRUE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE beacons IS 'User-placed navigation markers for the Beacon Breadcrumb system';
COMMENT ON TABLE beacon_runs IS 'User-created Beacon Run game courses (Ghost Mode only)';
COMMENT ON TABLE beacon_run_progress IS 'Tracks user progress through Beacon Run courses';
COMMENT ON TABLE beacon_run_leaderboard IS 'Completion times and rankings for Beacon Runs';
COMMENT ON TABLE treasure_maps IS 'Tradeable journey records created from beacon trails';
