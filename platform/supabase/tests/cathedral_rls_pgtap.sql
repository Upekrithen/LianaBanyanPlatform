-- ============================================================================
-- K438b Phase F — Cathedral RLS test suite (pgTAP)
-- ============================================================================
-- 7 cases covering the K438a cathedral.* schema's row-level security:
--   1. Member A cannot SELECT member B's member_cathedrals row
--   2. Member A cannot SELECT member B's private Scribes
--   3. Member A CAN SELECT member B's commons-shared Scribes
--   4. Member A cannot UPDATE scribe_entries (append-only)
--   5. Member A cannot DELETE scribe_entries
--   6. Member A cannot UPDATE fates_log
--   7. Member A cannot INSERT a scribe_entry with another member's member_id
--
-- Run via either:
--   * `supabase db test` (after enabling the pgtap extension)
--   * `psql -f platform/supabase/tests/cathedral_rls_pgtap.sql` against a
--     local database where pgtap is installed
--
-- The script self-creates two synthetic auth.users rows (members A + B),
-- exercises every policy, then ROLLBACKs all changes — production data is
-- never touched. Wrap the whole run in BEGIN/ROLLBACK at the boundary.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

SELECT plan(7);

-- Provision two synthetic auth.users rows directly (bypass triggers).
-- The cathedral.on_auth_user_created trigger will fire and ensure_member_cathedral
-- will provision starter Scribes for each. We then add Scribes/entries explicitly.
DO $$
DECLARE
    v_a UUID := '11111111-1111-1111-1111-111111111111';
    v_b UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Insert members; ON CONFLICT keeps the script idempotent within one run.
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data,
                            aud, role, created_at, updated_at,
                            instance_id, email_confirmed_at)
    VALUES
        (v_a, 'k438b-rls-a@example.test', '{}'::jsonb, '{}'::jsonb,
         'authenticated', 'authenticated', now(), now(),
         '00000000-0000-0000-0000-000000000000', now()),
        (v_b, 'k438b-rls-b@example.test', '{}'::jsonb, '{}'::jsonb,
         'authenticated', 'authenticated', now(), now(),
         '00000000-0000-0000-0000-000000000000', now())
    ON CONFLICT (id) DO NOTHING;

    -- Member B has one private Scribe + one commons Scribe + one entry on each.
    INSERT INTO cathedral.member_scribes
        (scribe_id, member_id, name, primary_field, adjacents, keywords, share_level)
    VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', v_b,
         'B-private', 'private domain', '[]'::jsonb, ARRAY['secret'], 'private'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', v_b,
         'B-commons', 'public domain',  '[]'::jsonb, ARRAY['shared'], 'commons')
    ON CONFLICT (scribe_id) DO NOTHING;

    -- One entry per Scribe (trigger materializes shared_level)
    INSERT INTO cathedral.scribe_entries
        (entry_id, scribe_id, member_id, observation)
    VALUES
        ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', v_b,
         'B private observation — must NOT be visible to member A'),
        ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', v_b,
         'B commons observation — visible to all enrolled members')
    ON CONFLICT (entry_id) DO NOTHING;

    -- A fates_log row for member B
    INSERT INTO cathedral.fates_log (log_id, member_id, content_hash, themes)
    VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', v_b, 'sha256:fake', '["secret-theme"]'::jsonb)
    ON CONFLICT (log_id) DO NOTHING;
END $$;

-- ─── Switch to member A and assert RLS denials ──────────────────────────

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- Test 1: cannot SELECT B's member_cathedrals row
SELECT is_empty(
    $$ SELECT 1 FROM cathedral.member_cathedrals
       WHERE member_id = '22222222-2222-2222-2222-222222222222' $$,
    'RLS: member A cannot SELECT member B''s member_cathedrals row'
);

-- Test 2: cannot SELECT B's private Scribe
SELECT is_empty(
    $$ SELECT 1 FROM cathedral.member_scribes
       WHERE scribe_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
    'RLS: member A cannot SELECT member B''s private Scribes'
);

-- Test 3: CAN SELECT B's commons Scribe (because A has a member_cathedrals row)
SELECT isnt_empty(
    $$ SELECT 1 FROM cathedral.member_scribes
       WHERE scribe_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
    'RLS: member A CAN SELECT member B''s commons-shared Scribe'
);

-- Test 4: UPDATE on scribe_entries fails (append-only)
SELECT throws_ok(
    $$ UPDATE cathedral.scribe_entries
       SET observation = 'tampered'
       WHERE entry_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc2' $$,
    NULL,
    NULL,
    'RLS: member A cannot UPDATE scribe_entries (append-only enforced by policy omission)'
);

-- Test 5: DELETE on scribe_entries fails (append-only)
SELECT throws_ok(
    $$ DELETE FROM cathedral.scribe_entries
       WHERE entry_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc2' $$,
    NULL,
    NULL,
    'RLS: member A cannot DELETE scribe_entries (append-only enforced by policy omission)'
);

-- Test 6: UPDATE on fates_log fails
SELECT throws_ok(
    $$ UPDATE cathedral.fates_log SET themes = '[]'::jsonb
       WHERE log_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' $$,
    NULL,
    NULL,
    'RLS: member A cannot UPDATE fates_log (audit immutable)'
);

-- Test 7: INSERT scribe_entry with foreign member_id is rejected
-- Both the WITH CHECK on member_id = auth.uid() AND the materialize trigger's
-- member-mismatch check would fire here; either denial counts.
SELECT throws_ok(
    $$ INSERT INTO cathedral.scribe_entries
         (scribe_id, member_id, observation)
       VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
               '22222222-2222-2222-2222-222222222222',
               'A pretending to write into B''s tablet') $$,
    NULL,
    NULL,
    'RLS: member A cannot INSERT a scribe_entry with member B''s member_id'
);

SELECT * FROM finish();

ROLLBACK;
