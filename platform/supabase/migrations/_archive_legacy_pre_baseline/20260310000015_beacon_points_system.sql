-- ============================================================
-- SNOW DOOR BEACON POINTS — The Northern Path
-- ============================================================
-- Unlocking the Snow Door opens the path North to Founder's Keep.
-- Seven beacons form a chain. Complete each to advance.
-- Complete all seven → earn the Teleportation Deck Card.
--
-- Like Wind Waker's Ballad of Gales:
--   Visit a location → it becomes a fast-travel point.
--   Complete the chain → unlock teleportation between ALL points.
--
-- Each beacon has a Snowflake Key (awards Joules).
-- Beacons unlock sequentially — you must complete #1 before #2.
-- ============================================================

-- ─── Beacon Definitions ───
CREATE TABLE IF NOT EXISTS beacon_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_number INT NOT NULL UNIQUE,           -- 1-7, sequential order
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '❄️',
  -- Challenge to complete this beacon
  challenge_type TEXT NOT NULL,                 -- 'snow_door_unlock', 'quiz_complete', 'translation', 'engagement', 'creation', 'exploration', 'final_challenge'
  challenge_description TEXT NOT NULL,
  challenge_requirement JSONB NOT NULL DEFAULT '{}',  -- Type-specific requirements
  -- Rewards
  joules_reward INT NOT NULL DEFAULT 5,
  marks_reward INT NOT NULL DEFAULT 0,
  snowflake_key_name TEXT,                     -- Name of the snowflake key earned
  -- Metadata
  latitude_hint TEXT,                          -- Atmospheric hint (not real GPS)
  lore_text TEXT,                              -- Story/flavor text
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── User Beacon Progress ───
CREATE TABLE IF NOT EXISTS beacon_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beacon_id UUID NOT NULL REFERENCES beacon_points(id) ON DELETE CASCADE,
  -- Completion state
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  -- Challenge evidence
  challenge_proof JSONB DEFAULT '{}',          -- What they did to complete it
  -- Rewards granted
  joules_awarded INT NOT NULL DEFAULT 0,
  marks_awarded INT NOT NULL DEFAULT 0,
  snowflake_key_earned BOOLEAN NOT NULL DEFAULT false,
  -- One completion per user per beacon
  UNIQUE(user_id, beacon_id)
);

-- ─── Teleportation Deck Cards ───
-- Earned by completing the full beacon chain.
CREATE TABLE IF NOT EXISTS teleportation_deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Card details
  card_name TEXT NOT NULL DEFAULT 'Northern Wind',
  card_tier TEXT NOT NULL DEFAULT 'legendary',
  -- Fast-travel destinations unlocked (beacon names)
  unlocked_destinations TEXT[] NOT NULL DEFAULT '{}',
  -- Usage tracking
  total_uses INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  -- Metadata
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  beacons_completed INT NOT NULL DEFAULT 7
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_beacon_progress_user
  ON beacon_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_beacon_progress_beacon
  ON beacon_progress(beacon_id);

CREATE INDEX IF NOT EXISTS idx_beacon_progress_completed
  ON beacon_progress(user_id, is_completed)
  WHERE is_completed = true;

-- ─── RLS Policies ───
ALTER TABLE beacon_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE teleportation_deck_cards ENABLE ROW LEVEL SECURITY;

-- Beacon definitions: everyone can read
CREATE POLICY "Anyone can view beacon points"
  ON beacon_points FOR SELECT
  USING (is_active = true);

-- Beacon progress: users see only their own
CREATE POLICY "Users can view own beacon progress"
  ON beacon_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beacon progress"
  ON beacon_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beacon progress"
  ON beacon_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Teleportation cards: users see only their own
CREATE POLICY "Users can view own teleportation card"
  ON teleportation_deck_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own teleportation card"
  ON teleportation_deck_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teleportation card"
  ON teleportation_deck_cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admin can manage beacons"
  ON beacon_points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin can view all beacon progress"
  ON beacon_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin can view all teleportation cards"
  ON teleportation_deck_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

-- ─── Seed the Seven Beacons ───

INSERT INTO beacon_points (beacon_number, name, description, icon, challenge_type, challenge_description, challenge_requirement, joules_reward, marks_reward, snowflake_key_name, latitude_hint, lore_text)
VALUES
  (1,
   'Founder''s Keep',
   'The starting point of the Northern Path. A warm fire burns in the hearth.',
   '🏰',
   'snow_door_unlock',
   'Unlock the Snow Door with any "North" password in any language.',
   '{"type": "snow_door_unlock", "door_id": "snow-door"}',
   12, 0,
   'Snowflake of Entry',
   '90°N — The Hearthstone',
   'The journey of a thousand miles begins with a single step through frost. The Keep has stood here since the platform''s founding, waiting for those who know the way North.'),

  (2,
   'The Standing Stones',
   'Ancient markers in a clearing. Each stone bears a word in a different language.',
   '🪨',
   'quiz_complete',
   'Complete any Paper Quiz on the Golden Key Quest (score 3/5 or higher).',
   '{"type": "quiz_complete", "min_score": 3, "min_total": 5}',
   8, 5,
   'Snowflake of Knowledge',
   '80°N — The Learning Circle',
   'The Standing Stones were placed by the first readers — those who proved they understood before they judged. Each stone represents a different paper, a different idea, a different way of seeing.'),

  (3,
   'The Frozen Bridge',
   'An ice bridge spans a deep ravine. Words carved into the railing shimmer in many scripts.',
   '🌉',
   'translation',
   'Visit the Friend Page and select any language that needs translators.',
   '{"type": "friend_page_visit", "action": "select_language"}',
   8, 5,
   'Snowflake of Tongues',
   '70°N — The Bridge of Words',
   'This bridge was built word by word, language by language. Every translation is a plank laid for the next traveler. The bridge grows stronger with every tongue spoken across it.'),

  (4,
   'The Watchtower',
   'A tall stone tower with a spiral stair. From the top, you can see the whole platform.',
   '🗼',
   'engagement',
   'Explore the Crow''s Nest — add at least one item to your To-Go Bag.',
   '{"type": "crows_nest_engage", "action": "add_to_bag"}',
   10, 5,
   'Snowflake of Sight',
   '60°N — The Observer''s Perch',
   'From the Watchtower, you see not just what IS, but what COULD BE. Every initiative, every innovation, every person working toward something better. The view changes you.'),

  (5,
   'The Ice Library',
   'Books frozen in crystal. Touch one and it thaws, releasing knowledge.',
   '📚',
   'exploration',
   'Visit the Academic Papers Directory and read any paper on Cephas (open a paper link).',
   '{"type": "paper_visit", "action": "open_paper"}',
   10, 5,
   'Snowflake of Depth',
   '50°N — The Crystal Stacks',
   'The Ice Library preserves every idea. Not behind glass — in ice. You must bring your own warmth to thaw what you want to read. The effort is the point.'),

  (6,
   'The Northern Forge',
   'Blue flames dance on an anvil. The air smells of ozone and possibility.',
   '🔥',
   'creation',
   'Visit the Help Wanted page or submit a Golden Key answer — create or contribute something.',
   '{"type": "creation_act", "actions": ["golden_key_submit", "help_wanted_visit"]}',
   12, 10,
   'Snowflake of Making',
   '40°N — The Blue Anvil',
   'The Northern Forge burns cold. Cold fire is harder to master than hot. But what you make here lasts longer — tempered by patience, not just heat.'),

  (7,
   'The Beacon Summit',
   'The final beacon. A pillar of light shoots into the aurora. The Teleportation Deck Card awaits.',
   '✨',
   'final_challenge',
   'Complete all 6 previous beacons. Claim your Teleportation Deck Card.',
   '{"type": "all_beacons_complete", "required_beacons": 6}',
   25, 15,
   'Snowflake of the Northern Wind',
   '0°N — The Crown of the World',
   'You walked the entire path. Every step earned. Every beacon lit by your effort. The Northern Wind now carries you — anywhere on the platform, instantly. This is what it means to have explored.');
