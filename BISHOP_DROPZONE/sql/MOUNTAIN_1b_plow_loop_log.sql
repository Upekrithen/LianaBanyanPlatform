-- Mountain 1b · Plow Loop Log
-- KNIGHT MARATHON 7 · BP089 · 2026-06-21
-- Bishop applies · do not run directly
-- §15 BLOOD: Knight ships · Bishop applies
-- BISHOP PATCH BP089 2026-06-21: SQLite primitives substituted to Postgres per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089. Original Knight SQL ran SQLite syntax. Substitutions: lower(hex(randomblob(16))) → gen_random_uuid() · strftime → NOW() · REAL → NUMERIC · advantage_is_empty/escalated INTEGER bool → BOOLEAN.

CREATE TABLE IF NOT EXISTS plow_loop_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  query_hash          TEXT NOT NULL,   -- SHA-256 of query string
  prompt_excerpt      TEXT,            -- first 300 chars
  domain              TEXT NOT NULL,   -- DomainTag value
  council_package     TEXT NOT NULL,   -- CouncilPackageName used
  iterations          INTEGER NOT NULL,
  max_iterations      INTEGER NOT NULL DEFAULT 3,
  final_confidence    NUMERIC NOT NULL,   -- 0.0-1.0
  council_variance    NUMERIC NOT NULL,   -- from last MinorCouncilResult
  advantage_size      INTEGER NOT NULL DEFAULT 0, -- bundle_size_bytes (0 = empty)
  advantage_is_empty  BOOLEAN NOT NULL DEFAULT TRUE, -- false=had content true=empty
  escalated           BOOLEAN NOT NULL DEFAULT FALSE,  -- false=no true=flagship fired
  total_latency_ms    INTEGER,
  answer_excerpt      TEXT,            -- first 300 chars of final answer
  status              TEXT NOT NULL    -- 'ok' | 'classifier_fallback' | 'error'
);

CREATE INDEX IF NOT EXISTS idx_plow_loop_log_created_at
  ON plow_loop_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plow_loop_log_domain
  ON plow_loop_log(domain);

CREATE INDEX IF NOT EXISTS idx_plow_loop_log_query_hash
  ON plow_loop_log(query_hash);

CREATE INDEX IF NOT EXISTS idx_plow_loop_log_final_confidence
  ON plow_loop_log(final_confidence);
