-- BP098 Bonfire Lit Scribe — recovery script execution log
-- Append-only audit trail for all recovery scripts fired by recovery_runner.ts.

CREATE TABLE IF NOT EXISTS bonfire_lit_recovery_log (
  id             BIGSERIAL PRIMARY KEY,
  peer_id        TEXT        NOT NULL,
  script_name    TEXT        NOT NULL,
  trigger_reason TEXT        NOT NULL,
  fired_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  outcome        TEXT,                  -- 'success' | 'error' | 'skipped'
  duration_ms    INTEGER,
  detail         JSONB
);

-- Fast lookup for Gauntlet UI (most recent 20 entries)
CREATE INDEX IF NOT EXISTS idx_bonfire_lit_recovery_log_fired_at
  ON bonfire_lit_recovery_log (fired_at DESC);

CREATE INDEX IF NOT EXISTS idx_bonfire_lit_recovery_log_peer_id
  ON bonfire_lit_recovery_log (peer_id);

-- RLS: service_role writes; authenticated reads
ALTER TABLE bonfire_lit_recovery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bonfire_lit_recovery_log_service_write" ON bonfire_lit_recovery_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "bonfire_lit_recovery_log_read" ON bonfire_lit_recovery_log
  FOR SELECT USING (true);

COMMENT ON TABLE bonfire_lit_recovery_log IS
  'BP098: Bonfire Lit Scribe recovery script audit log. Append-only. '
  'Recovery runner writes here after each script execution.';
