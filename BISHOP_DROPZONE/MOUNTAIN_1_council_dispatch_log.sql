-- Mountain 1 · Council Dispatch Log
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA

CREATE TABLE IF NOT EXISTS council_dispatch_log (
  id                      TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  task_id                 TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  council_package         TEXT NOT NULL,
  question_hash           TEXT NOT NULL,   -- SHA-256 of prompt · for convergence history
  prompt_excerpt          TEXT,            -- first 500 chars
  members_fired           INTEGER NOT NULL,
  member_answers          TEXT,            -- JSON array of { brain_id, answer_excerpt, latency_ms }
  variance                REAL NOT NULL,   -- 0.0-1.0
  variance_threshold      REAL NOT NULL,   -- from Court Package
  escalated               INTEGER NOT NULL DEFAULT 0,  -- 0=no 1=flagship fired
  escalation_brain        TEXT,            -- e.g. "claude-sonnet-4-6" if escalated
  aggregate_answer_excerpt TEXT,           -- first 500 chars of consensus
  total_latency_ms        INTEGER,
  substrate_context_bytes INTEGER,
  status                  TEXT NOT NULL    -- 'ok' | 'partial' | 'escalated' | 'error'
);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_created_at
  ON council_dispatch_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_council_package
  ON council_dispatch_log(council_package);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_escalated
  ON council_dispatch_log(escalated);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_question_hash
  ON council_dispatch_log(question_hash);
