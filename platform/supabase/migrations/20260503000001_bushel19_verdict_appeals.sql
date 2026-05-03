-- Bushel 19 — Scales/Bouncer/Judge Member-Visible Verdict UX Productization
-- ============================================================================
-- BP021 / KN095 / Bushel 19
--
-- Creates:
--   verdict_log        — backend-writable verdict history (Bouncer/Scales/Judge)
--   verdict_appeals    — member-filed Mordecai-Esther decree-compositions
--
-- Year of Jubilee ledger semantics: append-only, no deletes.
-- Members file appeals (INSERT); cannot delete or update their own appeals.
-- Admins (service role) can update status on resolution.

-- ── verdict_log ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS verdict_log (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id         text        NOT NULL,
  stage           text        NOT NULL CHECK (stage IN ('bouncer', 'scales', 'judge')),
  verdict         text        NOT NULL,
  rationale       text,
  matched_pattern_id          text,
  canonical_precedent_cited   text,
  eblet_path      text,
  scribe_id       text,
  decided_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verdict_log_case_id_idx    ON verdict_log (case_id);
CREATE INDEX IF NOT EXISTS verdict_log_decided_at_idx ON verdict_log (decided_at DESC);
CREATE INDEX IF NOT EXISTS verdict_log_stage_idx      ON verdict_log (stage);

ALTER TABLE verdict_log ENABLE ROW LEVEL SECURITY;

-- Authenticated members can read the verdict log (member-transparent by design)
CREATE POLICY "Authenticated users can view verdict log"
  ON verdict_log FOR SELECT
  TO authenticated
  USING (true);

-- Backend writes via service role (bypasses RLS); no client INSERT
-- (Python Bouncer/Scales/Judge will write via service key when backend integration is added)


-- ── verdict_appeals ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS verdict_appeals (
  appeal_id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id                  text        NOT NULL,
  member_id                uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- The member's contradictory response (Mordecai-Esther decree-composition)
  contradictory_response   text        NOT NULL,
  -- Optional: canonical rules or precedents the member relies on
  authority_basis          text,
  submitted_at             timestamptz NOT NULL DEFAULT now(),
  status                   text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'resolved', 'escalated')),
  -- Populated by Judge after reconsideration
  judge_reconsidered_at    timestamptz,
  judge_response           text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verdict_appeals_member_id_idx    ON verdict_appeals (member_id);
CREATE INDEX IF NOT EXISTS verdict_appeals_case_id_idx      ON verdict_appeals (case_id);
CREATE INDEX IF NOT EXISTS verdict_appeals_submitted_at_idx ON verdict_appeals (submitted_at DESC);
CREATE INDEX IF NOT EXISTS verdict_appeals_status_idx       ON verdict_appeals (status);

ALTER TABLE verdict_appeals ENABLE ROW LEVEL SECURITY;

-- Members can view only their own appeals
CREATE POLICY "Members can view own appeals"
  ON verdict_appeals FOR SELECT
  TO authenticated
  USING (member_id = auth.uid());

-- Members can file appeals (INSERT only — append-only ledger semantics)
CREATE POLICY "Members can file appeals"
  ON verdict_appeals FOR INSERT
  TO authenticated
  WITH CHECK (member_id = auth.uid());

-- Members CANNOT update or delete their own appeals (Year of Jubilee permanence)
-- (No UPDATE or DELETE policies — intentional: appeals are permanent once filed)

-- Admins can view all appeals (service role bypasses RLS for resolution workflow)


-- ── Comment ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE verdict_log IS
  'Bushel 19 BP021 — Bouncer/Scales/Judge verdict history. '
  'Written by backend (service role). Year of Jubilee: append-only.';

COMMENT ON TABLE verdict_appeals IS
  'Bushel 19 BP021 — Mordecai-Esther decree-compositions. '
  'Members file contradictory responses with co-equal authority. '
  'Year of Jubilee: append-only. No deletes permitted.';
