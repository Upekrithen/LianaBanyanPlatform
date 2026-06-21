-- Mountain 1 · Council Dispatch Log
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
-- SYNTAX: PostgreSQL (Supabase). No SQLite syntax. See MOUNTAIN_1_SYNTAX_DISCIPLINE.md.

CREATE TABLE IF NOT EXISTS council_dispatch_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id                 TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  council_package         TEXT NOT NULL,
  question_hash           TEXT NOT NULL,
  prompt_excerpt          TEXT,
  members_fired           INTEGER NOT NULL,
  member_answers          TEXT,
  variance                REAL NOT NULL,
  variance_threshold      REAL NOT NULL,
  escalated               INTEGER NOT NULL DEFAULT 0,
  escalation_brain        TEXT,
  aggregate_answer_excerpt TEXT,
  total_latency_ms        INTEGER,
  substrate_context_bytes INTEGER,
  status                  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_created_at ON council_dispatch_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_council_package ON council_dispatch_log(council_package);
CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_escalated ON council_dispatch_log(escalated);
CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_question_hash ON council_dispatch_log(question_hash);
