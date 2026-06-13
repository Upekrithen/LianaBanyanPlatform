# BP078 Publishing Cadence Migration Receipt

**Timestamp:** 2026-06-08T00:00:00Z (applied during BP078 session)
**Migration Version:** 20260608
**Migration Name:** publishing_cadence
**Migration File:** platform/supabase/migrations/20260608_publishing_cadence.sql
**Project Ref:** ruuxzilgmuwddcofqecc

## Apply Method

Surgical isolation. 18 pending local-only migrations moved to temp hold dir
(`supabase/_migrations_hold/`) before push, then restored immediately after.
This isolated our target from the w12 shadow_marks_ledger error and pre-existing
migration ordering conflicts per Knight's proven pattern.

Direct `supabase db push --linked` succeeded with only `20260608_publishing_cadence.sql`
in scope. Push output: "Applying migration 20260608_publishing_cadence.sql... Finished."

All 18 held files restored; temp dir removed. Zero files lost.

## Verification Results

### schema_migrations Row
- Version `20260608` confirmed present in `supabase_migrations.schema_migrations`
- Name field: `publishing_cadence`
- Full SQL stored in statements column (confirmed via psql query)

### Table Exists
- `publishing_cadence` table confirmed in `public` schema
- 25 columns verified matching BP078_PUBLISHING_CADENCE_CANON.md spec
- RLS enabled on table
- AUTO-UPDATE trigger `publishing_cadence_updated_at` present

### RLS Policies (3 of 3 Active)

| Policy Name | Command | Roles |
|---|---|---|
| publishing_cadence_authenticated_select | SELECT | {authenticated} |
| publishing_cadence_founder_insert | INSERT | {authenticated} |
| publishing_cadence_founder_update | UPDATE | {authenticated} |

All 3 policies confirmed via `pg_policies` query on production database.

Anon/authenticated SELECT verified via REST API (HTTP 200, empty array = table exists + RLS select policy active).

## Status

MIGRATION COMPLETE. Table live in production. No blockers surfaced.
