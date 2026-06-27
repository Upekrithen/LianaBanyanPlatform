-- M22-EXTENDED v4 · csia_suggestions table · BP096
-- Canon pearl: ed362ed7c254c82a (canon_suggestions_ten_dollar_micro_tier_marks_or_cash_bp096)
-- Postgres only. No SQLite primitives. (canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)
-- Apply AFTER M23 (20260627000002). Unblocks submit-suggestion edge function.
--
-- Table: csia_suggestions
--   $10 suggestion micro-tier. Member pays $10 cash (Stripe) OR Marks-equivalent.
--   Admin/curator-only status transitions; authenticated users INSERT + SELECT own only.

-- ─── 1. csia_suggestions table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS csia_suggestions (
  id                        BIGSERIAL PRIMARY KEY,
  suggestion_id             UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  member_id                 UUID NOT NULL REFERENCES entity_memberships(id) ON DELETE CASCADE,
  suggestion_text           TEXT NOT NULL,
  paid_amount_cents         INTEGER NOT NULL DEFAULT 1000,  -- $10 default
  payment_mode              TEXT NOT NULL DEFAULT 'cash'
                              CHECK (payment_mode IN ('cash', 'marks')),
  payment_status            TEXT NOT NULL DEFAULT 'pending'
                              CHECK (payment_status IN (
                                'pending', 'paid', 'marks_charged', 'refunded', 'failed'
                              )),
  stripe_payment_intent_id  TEXT,
  marks_grant_id            UUID REFERENCES marks_grants(grant_id) ON DELETE SET NULL,
  accepted_status           TEXT NOT NULL DEFAULT 'submitted'
                              CHECK (accepted_status IN (
                                'submitted', 'under_review', 'accepted',
                                'rejected', 'escalated_to_submission'
                              )),
  parent_submission_id      UUID REFERENCES csia_submissions(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE csia_suggestions IS
    'CSIA suggestion micro-tier — $10 cash or Marks-equivalent. '
    'Members submit improvement suggestions for active rounds. '
    'Status transitions admin/curator only (service_role). '
    'Canon pearl: ed362ed7c254c82a '
    '(canon_suggestions_ten_dollar_micro_tier_marks_or_cash_bp096). '
    'BP096 Founder-direct.';

-- ─── 2. Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_csia_suggestions_member_id
  ON csia_suggestions(member_id);

CREATE INDEX IF NOT EXISTS idx_csia_suggestions_payment_status
  ON csia_suggestions(payment_status);

CREATE INDEX IF NOT EXISTS idx_csia_suggestions_accepted_status
  ON csia_suggestions(accepted_status);

CREATE INDEX IF NOT EXISTS idx_csia_suggestions_created_at
  ON csia_suggestions(created_at);

-- ─── 3. updated_at auto-bump trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION bump_csia_suggestions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS csia_suggestions_updated_at_trigger ON csia_suggestions;
CREATE TRIGGER csia_suggestions_updated_at_trigger
  BEFORE UPDATE ON csia_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION bump_csia_suggestions_updated_at();

-- ─── 4. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE csia_suggestions ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS for all writes and admin transitions
-- (edge functions use service key — no explicit policy needed for service_role)

-- authenticated: SELECT own suggestions only
CREATE POLICY csia_suggestions_select_own ON csia_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = member_id::text);

-- authenticated: INSERT own suggestions only
CREATE POLICY csia_suggestions_insert_own ON csia_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = member_id::text);

-- No UPDATE or DELETE for authenticated role.
-- Status transitions (payment_status, accepted_status) via service_role only.

\echo '=== M22-EXTENDED v4: csia_suggestions table applied ==='
