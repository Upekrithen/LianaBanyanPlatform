-- Mountain 1 · Brain Swap Audit
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA

CREATE TABLE IF NOT EXISTS brain_swap_audit (
  id                      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id                 TEXT NOT NULL,
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  category                TEXT NOT NULL,
  selection_type          TEXT NOT NULL,   -- 'council' | 'single_brain'
  brain_selected          TEXT NOT NULL,   -- brain_id or council_package_name
  brain_vendor            TEXT NOT NULL,
  selection_reason        TEXT,            -- e.g. "free_local_routine" | "tool_required" | "flagship_hard"
  available_brains        TEXT,            -- JSON array of brain_ids that were available
  ping_latency_ms         INTEGER,         -- from brain.ping() before selection
  fallback_from           TEXT,            -- if fallback: original brain_id that failed
  fallback_reason         TEXT,
  cost_per_1k_tokens      REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_created_at
  ON brain_swap_audit(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_brain_selected
  ON brain_swap_audit(brain_selected);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_category
  ON brain_swap_audit(category);
