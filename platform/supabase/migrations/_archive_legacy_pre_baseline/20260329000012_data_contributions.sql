-- Migration: data_contributions table
-- Session: K164 — Bounty Poster Indicators + Data Population Rewards
-- Tracks origination, confirmation, and update contributions across all cooperative data types.

CREATE TABLE IF NOT EXISTS data_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('originate', 'confirm', 'update')),
  marks_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_contributions_scope
  ON data_contributions(table_name, record_id, contribution_type);

CREATE INDEX IF NOT EXISTS idx_data_contributions_contributor
  ON data_contributions(contributor_id, created_at DESC);

-- Rate-limit: max 20 contributions per member per day (anti-gaming)
CREATE OR REPLACE FUNCTION check_contribution_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM data_contributions
    WHERE contributor_id = NEW.contributor_id
      AND created_at > now() - INTERVAL '24 hours'
  ) >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 20 contributions per day';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contribution_rate_limit ON data_contributions;
CREATE TRIGGER trg_contribution_rate_limit
  BEFORE INSERT ON data_contributions
  FOR EACH ROW EXECUTE FUNCTION check_contribution_rate_limit();

-- RLS
ALTER TABLE data_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributions"
  ON data_contributions FOR SELECT
  USING (auth.uid() = contributor_id);

CREATE POLICY "Authenticated users can insert contributions"
  ON data_contributions FOR INSERT
  WITH CHECK (auth.uid() = contributor_id);
