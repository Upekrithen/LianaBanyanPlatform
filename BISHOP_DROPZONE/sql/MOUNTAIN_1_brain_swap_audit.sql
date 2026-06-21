-- Mountain 1 · Brain Swap Audit
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
-- SYNTAX: PostgreSQL (Supabase). No SQLite syntax. See MOUNTAIN_1_SYNTAX_DISCIPLINE.md.

CREATE TABLE IF NOT EXISTS brain_swap_audit (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id                 TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category                TEXT NOT NULL,
  selection_type          TEXT NOT NULL,
  brain_selected          TEXT NOT NULL,
  brain_vendor            TEXT NOT NULL,
  selection_reason        TEXT,
  available_brains        TEXT,
  ping_latency_ms         INTEGER,
  fallback_from           TEXT,
  fallback_reason         TEXT,
  cost_per_1k_tokens      REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_created_at ON brain_swap_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_brain_selected ON brain_swap_audit(brain_selected);
CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_category ON brain_swap_audit(category);
