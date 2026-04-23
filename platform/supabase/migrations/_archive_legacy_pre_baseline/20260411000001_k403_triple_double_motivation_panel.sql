-- K403: Triple Double Motivation Panel
-- Innovation #2235 (CJ candidate). Bishop B096.
-- Tables: triple_double_config, choosing_log, rung_stamps
-- platform_canonical inserts for Dynamic Stats cross-ref

-- 1. Triple Double Config (member-pickable daily base)
CREATE TABLE IF NOT EXISTS triple_double_config (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  base_daily NUMERIC NOT NULL DEFAULT 100,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE triple_double_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own triple_double_config"
  ON triple_double_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triple_double_config"
  ON triple_double_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triple_double_config"
  ON triple_double_config FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Choosing Log (daily ritual + Can of False Enthusiasm)
CREATE TABLE IF NOT EXISTS choosing_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('choice', 'can_of_false_enthusiasm')),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_choosing_log_user_logged ON choosing_log(user_id, logged_at DESC);

ALTER TABLE choosing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own choosing_log"
  ON choosing_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own choosing_log"
  ON choosing_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Rung Stamps (milestone badges when 30-day avg crosses threshold)
CREATE TABLE IF NOT EXISTS rung_stamps (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rung_level SMALLINT NOT NULL CHECK (rung_level BETWEEN 0 AND 3),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  thirty_day_avg NUMERIC NOT NULL,
  UNIQUE (user_id, rung_level)
);

ALTER TABLE rung_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rung_stamps"
  ON rung_stamps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rung_stamps"
  ON rung_stamps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Platform canonical variables for Triple Double math
INSERT INTO platform_canonical (key, value, description) VALUES
  ('tripleDoubleBaseDefault', 100, 'Default daily target for Triple Double Rung 0'),
  ('tripleDoubleWeeksPerYear', 48, 'Weeks in the Triple Double calendar (4 weeks rest)'),
  ('tripleDoubleDaysPerWeek', 5, 'Work days per week in the Triple Double calendar'),
  ('tripleDoubleRung3Annual', 192000, 'Annual equivalent of Rung 3 at $100/day base')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;
