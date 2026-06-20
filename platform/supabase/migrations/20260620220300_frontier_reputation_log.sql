-- frontier_reputation_log migration
-- BP087 Wave 4 · Keys and Engines · Knight ships · Bishop applies via psql per §15
-- Records all update hash-mismatch events for public trust auditability.

CREATE TABLE IF NOT EXISTS frontier_reputation_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_frame_id     text NOT NULL,
  claimed_hash        text NOT NULL,
  ledger_hash         text NOT NULL,
  mismatch_delta      jsonb,
  requesting_frame_id text NOT NULL,
  timestamp           timestamptz NOT NULL DEFAULT now(),
  update_version      text NOT NULL,
  severity            text NOT NULL DEFAULT 'mismatch',
  resolved            boolean NOT NULL DEFAULT false
);

ALTER TABLE frontier_reputation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "frontier_reputation_log_anon_select"
  ON frontier_reputation_log
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "frontier_reputation_log_anon_insert"
  ON frontier_reputation_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "frontier_reputation_log_service_role_all"
  ON frontier_reputation_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_version
  ON frontier_reputation_log (update_version);

CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_timestamp
  ON frontier_reputation_log (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_frontier_reputation_log_requesting_frame
  ON frontier_reputation_log (requesting_frame_id);
