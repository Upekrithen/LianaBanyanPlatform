-- Mountain 1 · Dr. M Dispatch Log
-- Bishop applies · do not run directly
-- KNIGHT MARATHON 4 · BP089 · BLACK MAMBA

CREATE TABLE IF NOT EXISTS dr_m_dispatch_log (
  id                      TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  task_id                 TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category                TEXT NOT NULL,
  prompt_excerpt          TEXT,            -- first 500 chars
  brain_used              TEXT NOT NULL,   -- brain_id (single) OR council_package_name (council)
  brain_vendor            TEXT NOT NULL,
  dispatch_mode           TEXT NOT NULL,   -- 'council' | 'single_brain'
  brain_fallback          INTEGER NOT NULL DEFAULT 0,  -- 0=no fallback 1=fallback used
  fallback_reason         TEXT,
  council_package_name    TEXT,            -- null if single_brain mode
  council_variance        REAL,            -- null if single_brain mode
  council_escalated       INTEGER,         -- 0/1 · null if single_brain mode
  council_member_count    INTEGER,         -- null if single_brain mode
  target_peer_id          TEXT,            -- null = local
  substrate_context_bytes INTEGER,
  hex_frame_size_bytes    INTEGER,
  crc_valid               INTEGER NOT NULL DEFAULT 1,
  latency_ms              INTEGER,
  response_excerpt        TEXT,            -- first 500 chars
  status                  TEXT NOT NULL,   -- 'ok' | 'substrate_read_error' | 'brain_error' | 'peer_error'
  error_detail            TEXT
);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_created_at
  ON dr_m_dispatch_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_brain_used
  ON dr_m_dispatch_log(brain_used);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_status
  ON dr_m_dispatch_log(status);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_dispatch_mode
  ON dr_m_dispatch_log(dispatch_mode);
