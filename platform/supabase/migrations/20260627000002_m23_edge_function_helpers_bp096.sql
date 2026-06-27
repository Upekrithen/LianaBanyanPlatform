-- M23 Edge Function Helpers · BP096
-- Postgres only. No SQLite primitives. (canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)
-- Adds: signup_order column, city_claims table, csia_member_relationships table,
--       deduct_marks RPC, assignment_signed_at column on ip_ledger_entries,
--       curator_decided_at column on csia_submissions, stripe_refund_id on csia_reservations.
-- Apply AFTER M22-EXTENDED (20260627000001).

-- ─── 1. signup_order on entity_memberships ─────────────────────────────────
ALTER TABLE entity_memberships
  ADD COLUMN IF NOT EXISTS signup_order BIGINT;

CREATE SEQUENCE IF NOT EXISTS entity_memberships_signup_order_seq
  START WITH 1 INCREMENT BY 1 NO CYCLE;

-- Backfill existing rows in insertion order (id is UUID; use created_at)
DO $$
BEGIN
  UPDATE entity_memberships
  SET signup_order = sub.rn
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC NULLS LAST) AS rn
    FROM entity_memberships
    WHERE signup_order IS NULL
  ) sub
  WHERE entity_memberships.id = sub.id;
END $$;

-- ─── 2. city_claims table ──────────────────────────────────────────────────
-- Truth-Always: entity_memberships PK is 'id' (UUID). No 'member_id' column exists.
-- FK must reference entity_memberships(id). (BP096 live schema audit)
CREATE TABLE IF NOT EXISTS city_claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES entity_memberships(id) ON DELETE CASCADE,
  city_name       TEXT NOT NULL,
  city_slug       TEXT NOT NULL, -- URL-safe: '{city}-{country_code}', e.g. 'nairobi-ke'
  country_code    CHAR(2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'relinquished')),
  claimed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  relinquished_at TIMESTAMPTZ,
  CONSTRAINT city_claims_slug_unique UNIQUE (city_slug),
  CONSTRAINT city_claims_member_unique UNIQUE (member_id)  -- one city per member
);

CREATE INDEX IF NOT EXISTS idx_city_claims_member_id ON city_claims(member_id);
CREATE INDEX IF NOT EXISTS idx_city_claims_country_code ON city_claims(country_code);

-- ─── 3. csia_member_relationships table ───────────────────────────────────
-- For conflict-of-interest gate (future curator-decide checks)
CREATE TABLE IF NOT EXISTS csia_member_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a_id       UUID NOT NULL,
  member_b_id       UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('crew', 'anchor', 'disclosed_conflict', 'family')),
  referral_id       UUID REFERENCES csia_referrals(id) ON DELETE SET NULL,
  established_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes             TEXT,
  CONSTRAINT csia_member_relationships_pair_unique UNIQUE (member_a_id, member_b_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_csia_member_rel_a ON csia_member_relationships(member_a_id);
CREATE INDEX IF NOT EXISTS idx_csia_member_rel_b ON csia_member_relationships(member_b_id);

-- ─── 4. ip_ledger_entries extra columns ────────────────────────────────────
ALTER TABLE ip_ledger_entries
  ADD COLUMN IF NOT EXISTS assignment_signed_at TIMESTAMPTZ;

-- ─── 5. csia_submissions extra columns ────────────────────────────────────
ALTER TABLE csia_submissions
  ADD COLUMN IF NOT EXISTS curator_decided_at TIMESTAMPTZ;

-- ─── 6. csia_reservations extra columns ───────────────────────────────────
ALTER TABLE csia_reservations
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;

-- Note: stripe_charge_id populated by stripe-webhook when payment confirmed.

-- ─── 7. deduct_marks RPC ──────────────────────────────────────────────────
-- Used by submit-suggestion (marks payment path).
-- Decrements member's marks balance; inserts debit row into marks_ledger (or marks_grants with negative).
-- Truth-Always: assumes marks_grants tracks balance via SUM(marks_count).
--   If a separate marks_balance table exists, adapt accordingly.
CREATE OR REPLACE FUNCTION deduct_marks(
  p_member_id   UUID,
  p_marks_count INT,
  p_reason      TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INT;
BEGIN
  -- Calculate current balance
  SELECT COALESCE(SUM(marks_count), 0)
  INTO v_balance
  FROM marks_grants
  WHERE member_id = p_member_id;

  IF v_balance < p_marks_count THEN
    RAISE EXCEPTION 'Insufficient marks balance. Have: %, Need: %', v_balance, p_marks_count;
  END IF;

  -- Insert debit as negative grant
  INSERT INTO marks_grants (
    id, member_id, marks_count, marks_class, grant_source, granted_at
  ) VALUES (
    gen_random_uuid(),
    p_member_id,
    -p_marks_count,  -- negative = debit
    'debit',
    p_reason,
    NOW()
  );
END;
$$;

-- ─── 8. csia_curator_eligibility VIEW (if not created in M22-EXTENDED) ────
-- Truth-Always: csia_curators uses 'curator_member_id' not 'member_id'.
-- Live schema audited BP096. Matches _fix_view_bp096.sql which applied correctly.
CREATE OR REPLACE VIEW csia_curator_eligibility AS
SELECT
  c.curator_member_id                   AS curator_member_id,
  s.id                                  AS submission_id,
  s.member_id                           AS submitter_member_id,
  CASE
    -- Own submission: ineligible
    WHEN c.curator_member_id = s.member_id THEN FALSE
    -- Crew relationship: ineligible
    WHEN EXISTS (
      SELECT 1 FROM csia_member_relationships r
      WHERE r.relationship_type = 'crew'
        AND (
          (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
          OR (r.member_b_id = c.curator_member_id AND r.member_a_id = s.member_id)
        )
    ) THEN FALSE
    ELSE TRUE
  END                                   AS eligible_to_curate,
  CASE
    WHEN c.curator_member_id = s.member_id THEN 'own_submission'
    WHEN EXISTS (
      SELECT 1 FROM csia_member_relationships r
      WHERE r.relationship_type = 'crew'
        AND (
          (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
          OR (r.member_b_id = c.curator_member_id AND r.member_a_id = s.member_id)
        )
    ) THEN 'crew_relationship'
    ELSE NULL
  END                                   AS conflict_reason
FROM csia_curators c
CROSS JOIN csia_submissions s;

-- ─── 9. RLS policies for new tables ───────────────────────────────────────

-- city_claims: members can read all, insert own, no update
ALTER TABLE city_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY city_claims_select ON city_claims
  FOR SELECT USING (true);

CREATE POLICY city_claims_insert ON city_claims
  FOR INSERT WITH CHECK (auth.uid()::text = member_id::text);

-- csia_member_relationships: service role only for writes; members can read own
ALTER TABLE csia_member_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY csia_member_rel_select ON csia_member_relationships
  FOR SELECT USING (
    auth.uid()::text = member_a_id::text
    OR auth.uid()::text = member_b_id::text
  );

-- Service role bypasses RLS for writes (edge functions use service key).
