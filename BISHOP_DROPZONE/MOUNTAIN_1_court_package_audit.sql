-- Mountain 1 · Court Package Audit
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
-- Tracks usage + convergence history for all Court Packages

CREATE TABLE IF NOT EXISTS court_package_audit (
  id                      TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  package_name            TEXT NOT NULL,
  members_json            TEXT NOT NULL,   -- JSON array of model_ids in this fire
  usage_count             INTEGER NOT NULL DEFAULT 1,
  last_used_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_fires             INTEGER NOT NULL DEFAULT 0,
  escalation_count        INTEGER NOT NULL DEFAULT 0,
  avg_variance            REAL,            -- rolling average variance across all fires
  convergence_history     TEXT             -- JSON array of last 20 variance values (ring buffer)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_court_package_audit_package_name
  ON court_package_audit(package_name);

CREATE INDEX IF NOT EXISTS idx_court_package_audit_recorded_at
  ON court_package_audit(recorded_at DESC);
