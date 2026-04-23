-- ═══════════════════════════════════════════════════════════════
-- BEACON BREADCRUMB NAVIGATION SYSTEM
-- Six-color beacons + Orange Protocol + Ghost Mode Beacon Runs
-- Innovation: Beacon Breadcrumb Navigation System
-- Date: February 19, 2026
-- ═══════════════════════════════════════════════════════════════

-- ─── BEACON COLORS & ORANGE PROTOCOL ───

-- Add color to beacons (Green, Blue, Yellow, Red, Purple, Orange)
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  beacon_color TEXT DEFAULT 'green' CHECK (beacon_color IN ('green', 'blue', 'yellow', 'red', 'purple', 'orange'));

-- Add sequential beacon number per user
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  beacon_number INTEGER;

-- Orange Protocol fields
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  orange_subtype TEXT CHECK (orange_subtype IS NULL OR orange_subtype IN (
    'game_marker', 'share_person', 'social_cue', 'gift',
    'treasure', 'learning', 'trade_route', 'custom'
  ));

ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  orange_payload JSONB DEFAULT NULL;
  -- Structure: { subtype, customLabel, shareWith, isGameMarker, isTradeRoute }

-- ─── BEACON RUN GAMES (Ghost Mode Only) ───

CREATE TABLE IF NOT EXISTS public.beacon_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  description     TEXT,

  -- Route data
  beacon_ids      UUID[] NOT NULL DEFAULT '{}',
  total_beacons   INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER,

  -- Competition settings
  ante_credits    INTEGER DEFAULT 0,
  prize_pool_credits INTEGER DEFAULT 0,

  -- Stats
  times_started   INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES auth.users(id),

  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  is_featured     BOOLEAN DEFAULT FALSE,

  -- Ghost Mode requirement (always true for Beacon Runs)
  requires_ghost_mode BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_beacon_runs_creator ON public.beacon_runs(creator_id);
CREATE INDEX idx_beacon_runs_featured ON public.beacon_runs(is_featured) WHERE is_featured = TRUE;

-- Beacon Run Progress
CREATE TABLE IF NOT EXISTS public.beacon_run_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  run_id          UUID NOT NULL REFERENCES public.beacon_runs(id) ON DELETE CASCADE,

  -- Progress
  beacons_reached UUID[] DEFAULT '{}',
  current_beacon_index INTEGER DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,

  -- Time tracking
  elapsed_seconds INTEGER DEFAULT 0,

  -- Ghost Mode verification
  ghost_session_id UUID,

  -- Crow Feather earned (if record set)
  crow_feather_id INTEGER REFERENCES public.crow_feathers(id)
);

CREATE INDEX idx_beacon_run_progress_user ON public.beacon_run_progress(user_id);
CREATE INDEX idx_beacon_run_progress_run ON public.beacon_run_progress(run_id);

-- ─── CROW FEATHERS FOR BEACON RUNS ───

-- Ensure crow_feathers table exists (from Half-Life system)
CREATE TABLE IF NOT EXISTS public.crow_feathers (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  category        TEXT NOT NULL,
  record_value    DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER,
  time_bracket    TEXT,
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  feather_number  INTEGER NOT NULL,
  superseded_by   INTEGER REFERENCES public.crow_feathers(id),

  -- Beacon Run specific
  beacon_run_id   UUID REFERENCES public.beacon_runs(id),

  UNIQUE(feather_number)
);

CREATE INDEX IF NOT EXISTS idx_crow_feathers_user ON public.crow_feathers(user_id);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_category ON public.crow_feathers(category);

-- ─── GHOST MODE SESSIONS (for Members entering Ghost Mode) ───

CREATE TABLE IF NOT EXISTS public.ghost_mode_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),

  -- Session tracking
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- What they did in Ghost Mode
  beacons_dropped INTEGER DEFAULT 0,
  beacon_runs_created INTEGER DEFAULT 0,
  beacon_runs_played INTEGER DEFAULT 0,

  -- Crow Feathers earned
  crow_feathers_earned INTEGER DEFAULT 0,

  -- Equipment brought from Portfolio
  equipment_brought JSONB DEFAULT '[]'
);

CREATE INDEX idx_ghost_mode_sessions_user ON public.ghost_mode_sessions(user_id);

-- ─── RLS POLICIES ───

ALTER TABLE public.beacon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beacon_run_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghost_mode_sessions ENABLE ROW LEVEL SECURITY;

-- Beacon Runs: creators can manage, all can view published
CREATE POLICY "beacon_runs_select" ON public.beacon_runs
  FOR SELECT USING (published_at IS NOT NULL OR creator_id = auth.uid());
CREATE POLICY "beacon_runs_insert" ON public.beacon_runs
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "beacon_runs_update" ON public.beacon_runs
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "beacon_runs_delete" ON public.beacon_runs
  FOR DELETE USING (auth.uid() = creator_id);

-- Beacon Run Progress: users can manage their own
CREATE POLICY "beacon_run_progress_select" ON public.beacon_run_progress
  FOR SELECT USING (user_id = auth.uid() OR ghost_id IS NOT NULL);
CREATE POLICY "beacon_run_progress_insert" ON public.beacon_run_progress
  FOR INSERT WITH CHECK (user_id = auth.uid() OR ghost_id IS NOT NULL);
CREATE POLICY "beacon_run_progress_update" ON public.beacon_run_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Ghost Mode Sessions: users can manage their own
CREATE POLICY "ghost_mode_sessions_all" ON public.ghost_mode_sessions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Crow Feathers: public read, authenticated insert
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crow_feathers' AND policyname = 'crow_feathers_select') THEN
    ALTER TABLE public.crow_feathers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "crow_feathers_select" ON public.crow_feathers FOR SELECT USING (true);
    CREATE POLICY "crow_feathers_insert" ON public.crow_feathers FOR INSERT WITH CHECK (auth.uid() = user_id OR ghost_id IS NOT NULL);
  END IF;
END $$;

-- ─── LEADERBOARD CATEGORIES FOR BEACON RUNS ───

-- Add new categories to any existing leaderboard_categories table
-- Or create a simple tracking table
CREATE TABLE IF NOT EXISTS public.leaderboard_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  category_type   TEXT NOT NULL DEFAULT 'ghost' CHECK (category_type IN ('ghost', 'real', 'both')),
  time_bracketed  BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.leaderboard_categories (name, display_name, category_type, time_bracketed, description) VALUES
  ('beacon_run_speed', 'Beacon Run Speed', 'ghost', FALSE, 'Fastest completion of a specific Beacon Run'),
  ('beacon_journeys_completed', 'Beacon Journeys', 'ghost', TRUE, 'Most Beacon Runs completed in a session'),
  ('beacons_dropped', 'Beacons Dropped', 'ghost', TRUE, 'Most beacons dropped in a session'),
  ('maps_created', 'Maps Created', 'ghost', FALSE, 'Total Beacon Run maps created')
ON CONFLICT (name) DO NOTHING;

-- ─── FUNCTION: Get next beacon number for user ───

CREATE OR REPLACE FUNCTION get_next_beacon_number(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(beacon_number), 0) + 1
  FROM public.beacons
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL;

-- ─── TRIGGER: Auto-assign beacon number on insert ───

CREATE OR REPLACE FUNCTION assign_beacon_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.beacon_number IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.beacon_number := get_next_beacon_number(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_number_trigger ON public.beacons;
CREATE TRIGGER beacon_number_trigger
  BEFORE INSERT ON public.beacons
  FOR EACH ROW
  EXECUTE FUNCTION assign_beacon_number();

-- ═══════════════════════════════════════════════════════════════
-- COMPLETE
-- "The crow remembers what the ghost forgets."
-- ═══════════════════════════════════════════════════════════════
