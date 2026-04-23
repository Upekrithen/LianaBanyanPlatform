-- ============================================================================
-- Migration: 20260319000017_xp_system.sql
-- Session 44 Task A: XP scores + events
-- ============================================================================

CREATE TABLE IF NOT EXISTS xp_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp      numeric DEFAULT 0,
  tier          text DEFAULT 'bronze',
  bounty_xp     numeric DEFAULT 0,
  creator_xp    numeric DEFAULT 0,
  production_xp numeric DEFAULT 0,
  civic_xp      numeric DEFAULT 0,
  last_updated  timestamptz DEFAULT now()
);

ALTER TABLE xp_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_scores_select_auth" ON xp_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "xp_scores_insert_own" ON xp_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "xp_scores_update_own" ON xp_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS xp_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  xp_earned   numeric NOT NULL,
  details     jsonb,
  stamped_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_events_select_own" ON xp_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "xp_events_insert_own" ON xp_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
