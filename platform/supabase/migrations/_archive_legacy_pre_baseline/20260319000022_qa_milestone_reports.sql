-- MoneyPenny Q&A — Milestone Reports
-- Aggregate stats generated at every 100-question mark

CREATE TABLE IF NOT EXISTS qa_milestone_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone integer NOT NULL UNIQUE,
  reached_at timestamptz NOT NULL DEFAULT now(),
  total_questions integer NOT NULL,
  worthwhile_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  throwaway_count integer NOT NULL DEFAULT 0,
  flamer_count integer NOT NULL DEFAULT 0,
  troll_count integer NOT NULL DEFAULT 0,
  bot_count integer NOT NULL DEFAULT 0,
  follow_up_rate numeric NOT NULL DEFAULT 0,
  total_marks_awarded numeric NOT NULL DEFAULT 0,
  top_categories jsonb NOT NULL DEFAULT '[]',
  avg_response_time_seconds integer NOT NULL DEFAULT 0
);

ALTER TABLE qa_milestone_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read milestone reports"
  ON qa_milestone_reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage milestone reports"
  ON qa_milestone_reports FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed: one milestone report at the 100-question mark
INSERT INTO qa_milestone_reports (milestone, reached_at, total_questions, worthwhile_count, duplicate_count, throwaway_count, flamer_count, troll_count, bot_count, follow_up_rate, total_marks_awarded, top_categories, avg_response_time_seconds)
VALUES (
  100,
  '2026-03-16T23:59:00Z',
  100,
  58,
  14,
  10,
  7,
  5,
  6,
  34.5,
  490,
  '[{"category":"Currency System","count":18},{"category":"HexIsle / Tereno","count":14},{"category":"Membership & Onboarding","count":12},{"category":"Governance","count":10},{"category":"Manufacturing","count":9},{"category":"BandWagon / Stewards","count":8},{"category":"Referrals","count":7}]'::jsonb,
  1080
);
