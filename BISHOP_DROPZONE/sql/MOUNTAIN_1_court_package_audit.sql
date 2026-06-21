-- Mountain 1 · Court Package Audit
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
-- SYNTAX: PostgreSQL (Supabase). No SQLite syntax. See MOUNTAIN_1_SYNTAX_DISCIPLINE.md.

CREATE TABLE IF NOT EXISTS court_package_audit (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  package_name            TEXT NOT NULL,
  members_json            TEXT NOT NULL,
  usage_count             INTEGER NOT NULL DEFAULT 1,
  last_used_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_fires             INTEGER NOT NULL DEFAULT 0,
  escalation_count        INTEGER NOT NULL DEFAULT 0,
  avg_variance            REAL,
  convergence_history     TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_court_package_audit_package_name ON court_package_audit(package_name);
CREATE INDEX IF NOT EXISTS idx_court_package_audit_recorded_at ON court_package_audit(recorded_at DESC);
