-- ============================================================================
-- Migration: 20260319000019_coverage_minutes.sql
-- Session 45 Task A: Coverage Minutes (Muffled Rule)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coverage_minutes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  minutes_earned numeric DEFAULT 0,
  minutes_spent  numeric DEFAULT 0,
  earned_events  jsonb DEFAULT '[]',
  spent_events   jsonb DEFAULT '[]',
  last_earned_at timestamptz,
  last_spent_at  timestamptz
);

ALTER TABLE coverage_minutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm_select_own" ON coverage_minutes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cm_insert_own" ON coverage_minutes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cm_update_own" ON coverage_minutes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- coverage_minute_transactions already exists from a prior migration (uses member_id).
-- Add context and expires_at columns if missing, and set up RLS policies using member_id.

ALTER TABLE coverage_minute_transactions ADD COLUMN IF NOT EXISTS context text;
ALTER TABLE coverage_minute_transactions ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE coverage_minute_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cmt_select_own" ON coverage_minute_transactions FOR SELECT TO authenticated USING (auth.uid() = member_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "cmt_insert_own" ON coverage_minute_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
