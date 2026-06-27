-- M23 view + policy remediation — BP096
-- Drops and recreates csia_curator_eligibility with live-schema-correct columns.
-- Guards policy creation with DO block.

DROP VIEW IF EXISTS csia_curator_eligibility;

CREATE VIEW csia_curator_eligibility
    WITH (security_invoker = true)
AS
SELECT
    c.curator_id,
    c.curator_member_id,
    s.id                                            AS submission_id,
    s.member_id                                     AS submitter_member_id,
    CASE
        WHEN c.curator_member_id = s.member_id
            THEN FALSE
        WHEN EXISTS (
            SELECT 1
            FROM csia_member_relationships r
            WHERE (
                (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
                OR (r.member_a_id = s.member_id AND r.member_b_id = c.curator_member_id)
            )
        )
            THEN FALSE
        WHEN c.conflict_disclosures @> to_jsonb(s.member_id::text)
            THEN FALSE
        ELSE TRUE
    END                                             AS eligible_to_curate,
    CASE
        WHEN c.curator_member_id = s.member_id
            THEN 'curator_is_inventor'
        WHEN EXISTS (
            SELECT 1
            FROM csia_member_relationships r
            WHERE (
                (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
                OR (r.member_a_id = s.member_id AND r.member_b_id = c.curator_member_id)
            )
        )
            THEN 'relationship_conflict'
        WHEN c.conflict_disclosures @> to_jsonb(s.member_id::text)
            THEN 'disclosed_conflict'
        ELSE NULL
    END                                             AS conflict_reason
FROM csia_curators c
CROSS JOIN csia_submissions s
WHERE c.status = 'active';

COMMENT ON VIEW csia_curator_eligibility IS
    'Curator-submission eligibility. curator_member_id from csia_curators. '
    'security_invoker. BP096 live-schema-correct version.';

-- Guard policy creation (may already exist from M22-EXTENDED)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'csia_member_rel_select'
          AND tablename = 'csia_member_relationships'
    ) THEN
        EXECUTE 'CREATE POLICY csia_member_rel_select ON csia_member_relationships
            FOR SELECT USING (
                auth.uid()::text = member_a_id::text
                OR auth.uid()::text = member_b_id::text
            )';
    END IF;
END $$;

\echo '=== M23 view+policy remediation complete ==='
