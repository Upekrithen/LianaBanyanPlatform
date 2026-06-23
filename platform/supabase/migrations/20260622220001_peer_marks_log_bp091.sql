-- peer_marks_log: tracks Marks earned by peers for completed cooperative work
-- BP091 · M22 · 2026-06-22
-- Uses Postgres syntax only. gen_random_uuid() not uuid_generate_v4().

CREATE TABLE IF NOT EXISTS peer_marks_log (
  id              BIGSERIAL PRIMARY KEY,
  peer_id         TEXT        NOT NULL,
  task_id         UUID        NOT NULL,
  task_source     TEXT        NOT NULL
    CHECK (task_source IN ('plow_loop','member_query','thunderclap','heartbeat_maintenance','mic_primary','mic_shadow','mic_failover_hero')),
  marks_earned    INTEGER     NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  receipt_ref     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE peer_marks_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "peers_read_own_marks"
  ON peer_marks_log
  FOR SELECT
  USING (peer_id = auth.uid()::text);

CREATE POLICY "service_role_full"
  ON peer_marks_log
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_peer_marks_log_peer_id ON peer_marks_log (peer_id);
CREATE INDEX IF NOT EXISTS idx_peer_marks_log_completed_at ON peer_marks_log (completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_marks_log_task_source ON peer_marks_log (task_source);
