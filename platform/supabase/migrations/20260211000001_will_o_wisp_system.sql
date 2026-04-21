-- ═══════════════════════════════════════════════════════════════════════════════
-- WILL-O'-WISP CHASE SYSTEM
-- "The real ones are something to see. ;)" — Founder
--
-- Two Modes:
-- 1. Training Mode — Safe tutorial (handled client-side)
-- 2. Chase Mode — Competitive skill game with ante/payout
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────────
-- CHASE EVENTS
-- Each chase is a single competitive session
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisp_chases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Status lifecycle: pending → active → completed/cancelled
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),

  -- Entry requirements
  ante_amount INTEGER NOT NULL DEFAULT 10, -- Marks required to join
  min_participants INTEGER NOT NULL DEFAULT 2,
  max_participants INTEGER,

  -- Economics (20% platform cut)
  platform_cut DECIMAL(3,2) NOT NULL DEFAULT 0.20,
  total_pot INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,

  -- Path generation
  path_seed TEXT, -- Random seed for deterministic path generation
  path_length INTEGER, -- Number of mirrors to traverse
  difficulty TEXT NOT NULL DEFAULT 'novice'
    CHECK (difficulty IN ('novice', 'journeyman', 'expert', 'legendary')),

  -- Path data (JSON array of mirror IDs in order)
  path_mirrors JSONB DEFAULT '[]',

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  title TEXT,
  description TEXT
);

-- Indexes for chase queries
CREATE INDEX IF NOT EXISTS idx_wisp_chases_status ON wisp_chases(status);
CREATE INDEX IF NOT EXISTS idx_wisp_chases_created ON wisp_chases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wisp_chases_difficulty ON wisp_chases(difficulty);

-- ─────────────────────────────────────────────────────────────────────────────────
-- CHASE PARTICIPANTS
-- Tracks each user's participation and progress
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisp_chase_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chase_id UUID NOT NULL REFERENCES wisp_chases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timing
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ, -- When they actually began the chase
  finished_at TIMESTAMPTZ,

  -- Results
  finish_position INTEGER, -- 1st, 2nd, 3rd, etc.
  finish_time_ms INTEGER, -- Milliseconds to complete

  -- Economics
  ante_paid INTEGER NOT NULL,
  payout INTEGER DEFAULT 0,

  -- Status: chasing → finished/lost/quit
  status TEXT NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'chasing', 'finished', 'lost', 'quit')),

  -- Progress tracking (JSON array of { mirror_id, timestamp })
  path_progress JSONB DEFAULT '[]',
  current_mirror_index INTEGER DEFAULT 0,

  -- "The Pickle" tracking
  pickle_count INTEGER DEFAULT 0, -- Times got stuck
  pickle_time_lost_ms INTEGER DEFAULT 0, -- Total time lost to pickles

  UNIQUE(chase_id, user_id)
);

-- Indexes for participant queries
CREATE INDEX IF NOT EXISTS idx_wisp_participants_chase ON wisp_chase_participants(chase_id);
CREATE INDEX IF NOT EXISTS idx_wisp_participants_user ON wisp_chase_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_wisp_participants_status ON wisp_chase_participants(status);
CREATE INDEX IF NOT EXISTS idx_wisp_participants_position ON wisp_chase_participants(finish_position);

-- ─────────────────────────────────────────────────────────────────────────────────
-- USER WISP STATS
-- Lifetime statistics and unlock status
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_wisp_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Chase Mode unlock
  unlocked_chase_mode BOOLEAN NOT NULL DEFAULT FALSE,
  unlock_reason TEXT, -- 'reputation', 'leaderboard', 'skip_ahead'
  unlocked_at TIMESTAMPTZ,

  -- Lifetime stats
  total_chases INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  quits INTEGER NOT NULL DEFAULT 0,

  -- Economics
  total_ante_paid INTEGER NOT NULL DEFAULT 0,
  total_payout INTEGER NOT NULL DEFAULT 0,
  net_profit INTEGER NOT NULL DEFAULT 0, -- Can be negative

  -- Records
  best_finish INTEGER, -- Best position ever achieved
  best_time_ms INTEGER, -- Fastest completion ever

  -- Streaks
  current_win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,

  -- Difficulty breakdown (JSONB for flexibility)
  stats_by_difficulty JSONB DEFAULT '{
    "novice": {"chases": 0, "wins": 0},
    "journeyman": {"chases": 0, "wins": 0},
    "expert": {"chases": 0, "wins": 0},
    "legendary": {"chases": 0, "wins": 0}
  }',

  -- Training stats (even though they're safe, track engagement)
  training_wisps_completed INTEGER NOT NULL DEFAULT 0,
  first_candle_earned_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────────
-- CHASE RESULTS HISTORY
-- Permanent record of payouts (for audit and leaderboards)
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisp_chase_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chase_id UUID NOT NULL REFERENCES wisp_chases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Position and timing
  finish_position INTEGER NOT NULL,
  total_participants INTEGER NOT NULL,
  finish_time_ms INTEGER,

  -- Economics at time of payout
  ante_paid INTEGER NOT NULL,
  payout INTEGER NOT NULL,
  net_result INTEGER NOT NULL, -- payout - ante_paid

  -- Context
  difficulty TEXT NOT NULL,
  platform_cut_applied DECIMAL(3,2) NOT NULL,

  -- Whether this earned a Crow Feather (record-breaking)
  crow_feather_earned BOOLEAN DEFAULT FALSE,
  crow_feather_category TEXT,
  crow_feather_number INTEGER
);

CREATE INDEX IF NOT EXISTS idx_wisp_results_user ON wisp_chase_results(user_id);
CREATE INDEX IF NOT EXISTS idx_wisp_results_chase ON wisp_chase_results(chase_id);
CREATE INDEX IF NOT EXISTS idx_wisp_results_recorded ON wisp_chase_results(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_wisp_results_position ON wisp_chase_results(finish_position);

-- ─────────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────────

ALTER TABLE wisp_chases ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisp_chase_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wisp_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisp_chase_results ENABLE ROW LEVEL SECURITY;

-- Chases: Anyone can view active/completed, only creator can update pending
CREATE POLICY "Anyone can view active chases" ON wisp_chases
  FOR SELECT USING (status IN ('active', 'completed'));

CREATE POLICY "Users can view their own pending chases" ON wisp_chases
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create chases" ON wisp_chases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Participants: Users see their own, or any in active chases
CREATE POLICY "Users see their own participation" ON wisp_chase_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users see participants in their chases" ON wisp_chase_participants
  FOR SELECT USING (
    chase_id IN (SELECT id FROM wisp_chases WHERE status = 'active')
  );

CREATE POLICY "Users can join chases" ON wisp_chase_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation" ON wisp_chase_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Stats: Users see only their own
CREATE POLICY "Users see own wisp stats" ON user_wisp_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wisp stats" ON user_wisp_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wisp stats" ON user_wisp_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Results: Public for leaderboards
CREATE POLICY "Anyone can view chase results" ON wisp_chase_results
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────────

-- Function to calculate tiered payout distribution
-- "Beat half to win, tiered payout for order of winning"
CREATE OR REPLACE FUNCTION calculate_chase_payouts(p_chase_id UUID)
RETURNS TABLE(user_id UUID, payout INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_chase wisp_chases%ROWTYPE;
  v_total_pot INTEGER;
  v_winner_pot INTEGER;
  v_winner_count INTEGER;
  v_position INTEGER;
  v_payout INTEGER;
  v_remaining_pot INTEGER;
BEGIN
  -- Get chase details
  SELECT * INTO v_chase FROM wisp_chases WHERE id = p_chase_id;

  IF v_chase.status != 'completed' THEN
    RAISE EXCEPTION 'Chase must be completed to calculate payouts';
  END IF;

  -- Calculate winner pot (after platform cut)
  v_total_pot := v_chase.total_pot;
  v_winner_pot := FLOOR(v_total_pot * (1 - v_chase.platform_cut));

  -- Count winners (top half of finishers)
  SELECT COUNT(*) INTO v_winner_count
  FROM wisp_chase_participants
  WHERE chase_id = p_chase_id
    AND status = 'finished'
    AND finish_position <= CEIL(v_chase.participant_count::DECIMAL / 2);

  IF v_winner_count = 0 THEN
    RETURN;
  END IF;

  -- Tiered payout: 1st gets more than 2nd, etc.
  -- Simple formula: (winner_count - position + 1) / sum(1..winner_count)
  v_remaining_pot := v_winner_pot;

  FOR v_position IN 1..v_winner_count LOOP
    -- Calculate this position's share
    v_payout := FLOOR(
      v_winner_pot * (v_winner_count - v_position + 1)::DECIMAL
      / ((v_winner_count * (v_winner_count + 1)) / 2)
    );

    -- Find user at this position
    RETURN QUERY
    SELECT p.user_id, v_payout
    FROM wisp_chase_participants p
    WHERE p.chase_id = p_chase_id
      AND p.finish_position = v_position;
  END LOOP;
END;
$$;

-- Function to check if user has unlocked chase mode
CREATE OR REPLACE FUNCTION check_wisp_unlock(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats user_wisp_stats%ROWTYPE;
  v_reputation INTEGER;
  v_leaderboard_time INTEGER;
BEGIN
  -- Check if already unlocked
  SELECT * INTO v_stats FROM user_wisp_stats WHERE user_id = p_user_id;

  IF v_stats.unlocked_chase_mode THEN
    RETURN TRUE;
  END IF;

  -- TODO: Check reputation threshold
  -- SELECT reputation INTO v_reputation FROM user_profiles WHERE id = p_user_id;
  -- IF v_reputation >= 100 THEN
  --   UPDATE user_wisp_stats
  --   SET unlocked_chase_mode = TRUE, unlock_reason = 'reputation', unlocked_at = NOW()
  --   WHERE user_id = p_user_id;
  --   RETURN TRUE;
  -- END IF;

  -- TODO: Check leaderboard time
  -- Check total time on any leaderboard

  RETURN FALSE;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE wisp_chases IS 'Will-o-Wisp competitive chase events where players ante Marks to compete';
COMMENT ON TABLE wisp_chase_participants IS 'Individual player participation in wisp chases';
COMMENT ON TABLE user_wisp_stats IS 'Lifetime wisp statistics and chase mode unlock status';
COMMENT ON TABLE wisp_chase_results IS 'Permanent audit trail of chase results for leaderboards';

COMMENT ON COLUMN wisp_chases.platform_cut IS 'Platform takes 20% for maintenance and keeping the lights on';
COMMENT ON COLUMN wisp_chase_participants.pickle_count IS 'Number of times player got stuck (in a pickle) during chase';
COMMENT ON COLUMN user_wisp_stats.unlock_reason IS 'How user unlocked chase mode: reputation, leaderboard, or skip_ahead';

-- ─────────────────────────────────────────────────────────────────────────────────
-- CROW FEATHERS
-- Permanent achievements for setting records — the ONLY thing that persists for Ghosts
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crow_feathers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The category of record set
  category TEXT NOT NULL CHECK (category IN (
    'chase_speed', 'chase_streak', 'chase_earnings',
    'discovery', 'golden_keys', 'candles', 'mirror_travel'
  )),

  -- Unique global feather number (#1, #847, etc.)
  feather_number SERIAL UNIQUE,

  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- The record value (ms for speed, count for others)
  record_value INTEGER NOT NULL,

  -- Previous record info
  previous_record_value INTEGER,
  previous_holder_id UUID REFERENCES auth.users(id),

  -- Context
  difficulty TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_crow_feathers_user ON crow_feathers(user_id);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_category ON crow_feathers(category);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_achieved ON crow_feathers(achieved_at DESC);

-- RLS for crow feathers
ALTER TABLE crow_feathers ENABLE ROW LEVEL SECURITY;

-- Anyone can view crow feathers (public achievements)
CREATE POLICY "Anyone can view crow feathers" ON crow_feathers
  FOR SELECT USING (true);

-- Only system can insert crow feathers (awarded via functions)
CREATE POLICY "System inserts crow feathers" ON crow_feathers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

COMMENT ON TABLE crow_feathers IS 'Permanent achievements for setting records - the ONLY thing that persists for Ghosts';
COMMENT ON COLUMN crow_feathers.feather_number IS 'Globally unique feather number - #1 was the first ever, #847 was the 847th';

-- ═══════════════════════════════════════════════════════════════════════════════
-- "If you're good, you never lose — you only have to beat half the participants,
--  with a tiered payout for order of winning."
-- ═══════════════════════════════════════════════════════════════════════════════
