-- Migration: add publishing_cadence table
-- BP078 2026-06-08
-- Additive only. Does not touch outreach_letters.

CREATE TABLE IF NOT EXISTS publishing_cadence (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Piece metadata
  piece_title           TEXT NOT NULL,
  piece_slug            TEXT UNIQUE NOT NULL,           -- URL-safe identifier, e.g. 'free-gemma-vs-flagships'
  angle_label           TEXT NOT NULL,                  -- which angle from §5 inventory, e.g. 'Tier3Benchmark'
  cadence_position      INTEGER,                        -- which piece # in the cadence (1 = first piece fired)
  draft_path            TEXT,                           -- full path to draft file on disk

  -- Outlet
  outlet_target         TEXT NOT NULL,                  -- e.g. 'Wired', 'HackerNews', 'Cephas'
  outlet_pitch_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  pitch_sent_at         TIMESTAMPTZ,

  -- Submission state
  submission_state      TEXT NOT NULL DEFAULT 'drafting'
                          CHECK (submission_state IN (
                            'drafting',
                            'pawn_review',
                            'rook_review',
                            'founder_ratify',
                            'submitted',
                            'pending',
                            'rejected_with_reason',
                            'published',
                            're_routed_to_cephas'
                          )),

  submitted_at          TIMESTAMPTZ,
  response_due_by       TIMESTAMPTZ,                    -- submitted_at + outlet response window
  response_received_at  TIMESTAMPTZ,
  rejection_reason      TEXT,                           -- filled if submission_state = rejected_with_reason

  -- Follow-up
  next_action_due_by    TIMESTAMPTZ,                    -- when to follow up or auto-route to Cephas
  next_action_note      TEXT,

  -- Cephas publish
  cephas_published_at   TIMESTAMPTZ,
  cephas_url            TEXT,

  -- Proof receipt anchor
  receipt_path          TEXT,                           -- vault receipt this piece anchors to
  receipt_pearl_hash    TEXT,                           -- pearl hash of the anchor receipt

  -- Pipeline stage sign-offs
  pawn_pass_at          TIMESTAMPTZ,
  rook_pass_at          TIMESTAMPTZ,
  founder_ratified_at   TIMESTAMPTZ
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_publishing_cadence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER publishing_cadence_updated_at
  BEFORE UPDATE ON publishing_cadence
  FOR EACH ROW EXECUTE FUNCTION update_publishing_cadence_updated_at();

-- RLS: only authenticated users with founder role can insert/update
ALTER TABLE publishing_cadence ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE publishing_cadence IS 'BP078 Publishing Cadence tracker. One row per piece per outlet attempt.';

-- ── RLS Policies ──────────────────────────────────────────────────────────────
-- SELECT: any authenticated user can read cadence rows (internal dashboard use).
-- INSERT/UPDATE: restricted to the founder role (custom JWT claim) or service_role.
-- service_role bypasses RLS by default in Supabase (BYPASSRLS privilege) --
-- no explicit policy is required for service_role writes.

CREATE POLICY "publishing_cadence_authenticated_select"
  ON publishing_cadence
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "publishing_cadence_authenticated_select"
  ON publishing_cadence
  IS 'All authenticated users can read publishing cadence rows for dashboard display.';

CREATE POLICY "publishing_cadence_founder_insert"
  ON publishing_cadence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'founder');

COMMENT ON POLICY "publishing_cadence_founder_insert"
  ON publishing_cadence
  IS 'Only tokens carrying role=founder in their JWT may insert cadence rows. Service_role bypasses RLS.';

CREATE POLICY "publishing_cadence_founder_update"
  ON publishing_cadence
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'founder')
  WITH CHECK (auth.jwt() ->> 'role' = 'founder');

COMMENT ON POLICY "publishing_cadence_founder_update"
  ON publishing_cadence
  IS 'Only tokens carrying role=founder in their JWT may update cadence rows. Service_role bypasses RLS.';
