-- ============================================================================
-- K438b Phase F — Starter-pack provisioning test suite (pgTAP)
-- ============================================================================
-- 2 cases covering cathedral.seed_starter_pack / ensure_member_cathedral and
-- the auth.users INSERT trigger:
--
--   8. New member signup triggers seed_starter_pack and creates 5 starter
--      Scribes (Work, Learning, Projects, Health, Family)
--   9. Starter Scribe keywords produce measurable hits when scored against
--      sample queries (smoke check that registry is non-degenerate)
--
-- Run via either:
--   * `supabase db test` (with the pgtap extension enabled)
--   * `psql -f platform/supabase/tests/cathedral_starter_pack_pgtap.sql`
--
-- The script self-creates a synthetic auth.users row, then ROLLBACKs all
-- changes. Production data is never touched.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

SELECT plan(7);

-- Provision a synthetic member; the on_auth_user_created trigger will fire
-- and call ensure_member_cathedral → provision_starter_scribes.
DO $$
DECLARE
    v_m UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data,
                            aud, role, created_at, updated_at,
                            instance_id, email_confirmed_at)
    VALUES
        (v_m, 'k438b-starter@example.test', '{}'::jsonb, '{}'::jsonb,
         'authenticated', 'authenticated', now(), now(),
         '00000000-0000-0000-0000-000000000000', now())
    ON CONFLICT (id) DO NOTHING;
END $$;

-- ─── Case 8 — exact starter-pack composition ─────────────────────────────

SELECT results_eq(
    $$ SELECT count(*)::int FROM cathedral.member_scribes
       WHERE member_id = '33333333-3333-3333-3333-333333333333'
         AND active = true $$,
    $$ VALUES (5) $$,
    'Starter pack: signup trigger provisions exactly 5 Scribes for the new member'
);

SELECT bag_eq(
    $$ SELECT name FROM cathedral.member_scribes
       WHERE member_id = '33333333-3333-3333-3333-333333333333'
         AND active = true $$,
    $$ VALUES ('Work'),('Learning'),('Projects'),('Health'),('Family') $$,
    'Starter pack: the 5 expected Scribe names are present'
);

-- Idempotence — second invocation of the seeding RPC must NOT duplicate.
SELECT lives_ok(
    $$ SELECT cathedral.seed_starter_pack('33333333-3333-3333-3333-333333333333') $$,
    'seed_starter_pack is idempotent (second call is a no-op)'
);

SELECT results_eq(
    $$ SELECT count(*)::int FROM cathedral.member_scribes
       WHERE member_id = '33333333-3333-3333-3333-333333333333' $$,
    $$ VALUES (5) $$,
    'Starter pack: count remains 5 after a second seed_starter_pack call'
);

-- ─── Case 9 — keywords produce measurable hits on sample queries ─────────
-- We model "measurable hit" the same way the registry scoring function does:
-- a query string is a hit iff it appears as substring of, or is contained
-- by, any keyword OR the primary_field. We assert 1+ Scribes match each of
-- four canonical sample queries hand-picked against the seed pack.

WITH q AS (
    SELECT unnest(ARRAY['project','doctor','course','family','sprint']) AS query
), hits AS (
    SELECT q.query,
           count(DISTINCT s.scribe_id) AS n
      FROM q
      JOIN cathedral.member_scribes s
        ON s.member_id = '33333333-3333-3333-3333-333333333333'
       AND s.active = true
       AND (
            EXISTS (
                SELECT 1 FROM unnest(s.keywords) AS kw
                 WHERE position(q.query IN lower(kw)) > 0
                    OR position(lower(kw) IN q.query) > 0
            )
            OR position(q.query IN lower(s.primary_field)) > 0
       )
     GROUP BY q.query
)
SELECT results_eq(
    $$ SELECT count(*)::int FROM (
         WITH q AS (
             SELECT unnest(ARRAY['project','doctor','course','family','sprint']) AS query
         ), hits AS (
             SELECT q.query,
                    count(DISTINCT s.scribe_id) AS n
               FROM q
               JOIN cathedral.member_scribes s
                 ON s.member_id = '33333333-3333-3333-3333-333333333333'
                AND s.active = true
                AND (
                     EXISTS (
                         SELECT 1 FROM unnest(s.keywords) AS kw
                          WHERE position(q.query IN lower(kw)) > 0
                             OR position(lower(kw) IN q.query) > 0
                     )
                     OR position(q.query IN lower(s.primary_field)) > 0
                )
              GROUP BY q.query
         )
         SELECT 1 FROM hits WHERE n >= 1
       ) sub $$,
    $$ VALUES (5) $$,
    'Starter pack: every sample query (project/doctor/course/family/sprint) hits at least one Scribe'
);

-- Spot-check: 'project' must hit the Work Scribe specifically (its keyword).
SELECT isnt_empty(
    $$ SELECT 1 FROM cathedral.member_scribes
       WHERE member_id = '33333333-3333-3333-3333-333333333333'
         AND name = 'Work'
         AND 'project' = ANY(keywords) $$,
    'Starter pack: Work Scribe contains the "project" keyword (canonical anchor)'
);

-- Spot-check: 'doctor' must hit the Health Scribe specifically.
SELECT isnt_empty(
    $$ SELECT 1 FROM cathedral.member_scribes
       WHERE member_id = '33333333-3333-3333-3333-333333333333'
         AND name = 'Health'
         AND 'doctor' = ANY(keywords) $$,
    'Starter pack: Health Scribe contains the "doctor" keyword (canonical anchor)'
);

SELECT * FROM finish();

ROLLBACK;
