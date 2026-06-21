-- Mountain 3 · Librarian Corps Schema
-- BP089 · Knight Marathon 6
-- Bishop-authored migration (Knight shipped TypeScript only; SQL derived from TS REST calls)
-- Statute binding: §3 §14 §15 §16 §17
--
-- Tables authored here (referenced by TS REST writes):
--   file_cabinet_seal_log       -- I-C file_cabinet.ts writeSealLog()
--   librarian_council_vote_log  -- I-D dispatcher.ts writeVoteLog()
--
-- Tables NOT implemented by Knight (yoke-spec only, not in TS code):
--   librarian_corps_directory   -- UNIMPLEMENTED · surfaced to Bishop for Founder ratify
--   pyramid_index_canonical     -- UNIMPLEMENTED · surfaced to Bishop for Founder ratify
-- Truth-Always: these 2 tables are NOT created here. Separate migration required.

-- ---------------------------------------------------------------------------
-- file_cabinet_seal_log
-- Written by file_cabinet.ts writeSealLog() on every cabinet open.
-- Fields derived from POST body in file_cabinet.ts line ~57.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS file_cabinet_seal_log (
  id                          BIGSERIAL PRIMARY KEY,
  jar_id                      TEXT             NOT NULL,
  substrate_path              TEXT             NOT NULL,
  partition                   TEXT             NOT NULL,   -- 'canon' | 'pearl' | 'receipts' | 'eblet' | 'code' | 'downloaded'
  librarian_role              TEXT             NOT NULL,
  seal_status                 TEXT             NOT NULL,   -- 'intact' | 'SEAL_BROKEN' | 'not_sealed'
  latency_ms                  INTEGER,
  lazy_load_first_accessed_at TIMESTAMPTZ,
  session_bp                  TEXT,
  opened_at                   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fcsl_jar_id        ON file_cabinet_seal_log (jar_id);
CREATE INDEX IF NOT EXISTS idx_fcsl_substrate_path ON file_cabinet_seal_log (substrate_path);
CREATE INDEX IF NOT EXISTS idx_fcsl_seal_status   ON file_cabinet_seal_log (seal_status);
CREATE INDEX IF NOT EXISTS idx_fcsl_opened_at     ON file_cabinet_seal_log (opened_at DESC);

-- ---------------------------------------------------------------------------
-- librarian_council_vote_log
-- Written by dispatcher.ts writeVoteLog() on every council resolution.
-- Fields derived from POST body in dispatcher.ts writeVoteLog().
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS librarian_council_vote_log (
  id                BIGSERIAL PRIMARY KEY,
  cabinet_path      TEXT             NOT NULL,
  librarian_role    TEXT             NOT NULL,
  council_package   TEXT             NOT NULL,
  member_votes      JSONB            NOT NULL,   -- array of SubLibrarianVote objects
  consensus_y_n     BOOLEAN          NOT NULL,
  escalated_y_n     BOOLEAN          NOT NULL    DEFAULT FALSE,
  divergence_score  NUMERIC(6,4),
  latency_ms        INTEGER,
  session_bp        TEXT,
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lcvl_cabinet_path    ON librarian_council_vote_log (cabinet_path);
CREATE INDEX IF NOT EXISTS idx_lcvl_librarian_role  ON librarian_council_vote_log (librarian_role);
CREATE INDEX IF NOT EXISTS idx_lcvl_council_package ON librarian_council_vote_log (council_package);
CREATE INDEX IF NOT EXISTS idx_lcvl_consensus       ON librarian_council_vote_log (consensus_y_n);
CREATE INDEX IF NOT EXISTS idx_lcvl_escalated       ON librarian_council_vote_log (escalated_y_n);
CREATE INDEX IF NOT EXISTS idx_lcvl_created_at      ON librarian_council_vote_log (created_at DESC);
