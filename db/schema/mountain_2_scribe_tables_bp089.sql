-- Mountain 2 · Persistent SEG Scribe Schema
-- BP089 · Knight Marathon 5
-- Statute binding: §3 §14 §15 §16 §17
-- NOTE: Bishop applies this migration. Knight does NOT run migrations directly.
--
-- New tables:
--   scribe_violations_log    -- every canon/statute violation detected by any persistent scribe
--   scribe_runtime_telemetry -- per-scribe uptime, throughput, drift counts per interval
--   scribe_council_vote_log  -- every 3-member Minor Council vote decision
--   scribe_drift_watch       -- 1-of-3 low-confidence flag log (review only)

-- ---------------------------------------------------------------------------
-- scribe_violations_log
-- Records every canon or statute violation detected by any persistent scribe.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scribe_violations_log (
  id                  SERIAL PRIMARY KEY,
  canon               VARCHAR(255)     NOT NULL,   -- canonId from corpus
  scribe              VARCHAR(64)      NOT NULL,   -- 'reminder_scribe' | 'wrasse_injector' | 'toolsmith_scribe'
  violator            VARCHAR(255)     NOT NULL,   -- agent id that produced the violation
  timestamp           BIGINT           NOT NULL,   -- epoch ms
  correction_applied  TEXT,                        -- corrected text or null if violation only logged
  statute_violated    VARCHAR(8),                  -- '§14' | '§15' | '§16' | '§17' or null
  pearl_id            VARCHAR(255),                -- pearl id emitted for this violation
  resolved            BOOLEAN          DEFAULT FALSE,
  resolved_at         BIGINT,
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_svl_scribe    ON scribe_violations_log (scribe);
CREATE INDEX IF NOT EXISTS idx_svl_violator  ON scribe_violations_log (violator);
CREATE INDEX IF NOT EXISTS idx_svl_timestamp ON scribe_violations_log (timestamp);
CREATE INDEX IF NOT EXISTS idx_svl_canon     ON scribe_violations_log (canon);

-- ---------------------------------------------------------------------------
-- scribe_runtime_telemetry
-- Records per-scribe uptime, throughput, and drift counts per interval.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scribe_runtime_telemetry (
  id                  SERIAL PRIMARY KEY,
  scribe              VARCHAR(64)      NOT NULL,
  interval_start      BIGINT           NOT NULL,   -- epoch ms
  interval_end        BIGINT           NOT NULL,   -- epoch ms
  uptime_ms           BIGINT           NOT NULL,
  dispatches_scanned  INTEGER          DEFAULT 0,
  violations_detected INTEGER          DEFAULT 0,
  pearls_emitted      INTEGER          DEFAULT 0,
  drift_count         INTEGER          DEFAULT 0,  -- compaction-class drift events (§14)
  false_positive_est  INTEGER          DEFAULT 0,
  model               VARCHAR(64),                 -- 'gemma4:12b'
  amber_flags         INTEGER          DEFAULT 0,  -- AMBER fallback activations
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_srt_scribe   ON scribe_runtime_telemetry (scribe);
CREATE INDEX IF NOT EXISTS idx_srt_interval ON scribe_runtime_telemetry (interval_start);

-- ---------------------------------------------------------------------------
-- scribe_council_vote_log
-- Records every 3-member Minor Council vote decision per enforcement question.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scribe_council_vote_log (
  id                  SERIAL PRIMARY KEY,
  scribe_id           VARCHAR(128)     NOT NULL,   -- ip_ledger row key of the parent scribe
  question_hash       VARCHAR(255)     NOT NULL,   -- hash of dispatch text + canonId being evaluated
  member_votes        JSONB            NOT NULL,   -- array of {seat, violationYn, articleCited, suggestedCorrection}
  consensus_y_n       BOOLEAN          NOT NULL,   -- true if 2-of-3 or 3-of-3 flagged
  pearl_id            VARCHAR(255),                -- pearl emitted as result of this vote, if any
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scvl_scribe_id     ON scribe_council_vote_log (scribe_id);
CREATE INDEX IF NOT EXISTS idx_scvl_question_hash ON scribe_council_vote_log (question_hash);
CREATE INDEX IF NOT EXISTS idx_scvl_consensus     ON scribe_council_vote_log (consensus_y_n);
CREATE INDEX IF NOT EXISTS idx_scvl_created_at    ON scribe_council_vote_log (created_at);

-- ---------------------------------------------------------------------------
-- scribe_drift_watch
-- Low-confidence 1-of-3 flag log. Review only. Does not block dispatch.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scribe_drift_watch (
  id                  SERIAL PRIMARY KEY,
  scribe_id           VARCHAR(128)     NOT NULL,   -- ip_ledger row key of the parent scribe
  question_hash       VARCHAR(255)     NOT NULL,   -- hash of the dispatch under review
  member_votes        BOOLEAN[]        NOT NULL,   -- [seatA, seatB, seatC] boolean flags
  canon_id            VARCHAR(255)     NOT NULL,   -- canon or statute suspected by the lone flagging member
  dispatch_id         VARCHAR(255)     NOT NULL,   -- agent id of the dispatch being watched
  timestamp           BIGINT           NOT NULL,   -- epoch ms
  reviewed            BOOLEAN          DEFAULT FALSE,
  reviewed_at         BIGINT,
  reviewer_note       TEXT,
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sdw_scribe_id   ON scribe_drift_watch (scribe_id);
CREATE INDEX IF NOT EXISTS idx_sdw_dispatch_id ON scribe_drift_watch (dispatch_id);
CREATE INDEX IF NOT EXISTS idx_sdw_timestamp   ON scribe_drift_watch (timestamp);
CREATE INDEX IF NOT EXISTS idx_sdw_reviewed    ON scribe_drift_watch (reviewed);
