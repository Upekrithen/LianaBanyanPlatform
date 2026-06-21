-- Mountain 1 · Dr. M Dispatch Log
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
-- SYNTAX: PostgreSQL (Supabase). No SQLite syntax. See MOUNTAIN_1_SYNTAX_DISCIPLINE.md.

CREATE TABLE IF NOT EXISTS dr_m_dispatch_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id                 TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category                TEXT NOT NULL,
  prompt_excerpt          TEXT,
  brain_used              TEXT NOT NULL,
  brain_vendor            TEXT NOT NULL,
  dispatch_mode           TEXT NOT NULL,
  brain_fallback          INTEGER NOT NULL DEFAULT 0,
  fallback_reason         TEXT,
  council_package_name    TEXT,
  council_variance        REAL,
  council_escalated       INTEGER,
  council_member_count    INTEGER,
  target_peer_id          TEXT,
  substrate_context_bytes INTEGER,
  hex_frame_size_bytes    INTEGER,
  crc_valid               INTEGER NOT NULL DEFAULT 1,
  latency_ms              INTEGER,
  response_excerpt        TEXT,
  status                  TEXT NOT NULL,
  error_detail            TEXT
);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_created_at ON dr_m_dispatch_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_brain_used ON dr_m_dispatch_log(brain_used);
CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_status ON dr_m_dispatch_log(status);
CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_dispatch_mode ON dr_m_dispatch_log(dispatch_mode);
