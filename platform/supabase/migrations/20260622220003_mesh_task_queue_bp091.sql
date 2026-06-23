-- mesh_task_queue: shared state store for in-flight cooperative tasks
-- BP091 · M22 · §A.6 in-flight task continuity
-- 2026-06-22

CREATE TABLE IF NOT EXISTS mesh_task_queue (
  id              BIGSERIAL PRIMARY KEY,
  task_id         UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  wave_id         UUID        NOT NULL,
  mic_peer_id     TEXT        NOT NULL,         -- which MIC dispatched this
  task_payload    JSONB       NOT NULL,          -- CooperativeTask JSON
  status          TEXT        NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','dispatched','responded','completed','failed')),
  assigned_peers  TEXT[]      NOT NULL DEFAULT '{}',
  responses       JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

ALTER TABLE mesh_task_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full"
  ON mesh_task_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated reads (all peers can see task state for MIC failover)
CREATE POLICY "auth_read_tasks"
  ON mesh_task_queue
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_mesh_task_queue_wave_id ON mesh_task_queue (wave_id);
CREATE INDEX IF NOT EXISTS idx_mesh_task_queue_status ON mesh_task_queue (status) WHERE status IN ('queued','dispatched');
CREATE INDEX IF NOT EXISTS idx_mesh_task_queue_mic_peer ON mesh_task_queue (mic_peer_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_mesh_task_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mesh_task_queue_updated_at ON mesh_task_queue;
CREATE TRIGGER mesh_task_queue_updated_at
  BEFORE UPDATE ON mesh_task_queue
  FOR EACH ROW EXECUTE FUNCTION update_mesh_task_queue_timestamp();
