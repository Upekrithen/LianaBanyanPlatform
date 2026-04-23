# Cathedral pgTAP Test Suite — Operator Guide

**K447(B118) · April 2026 · 14 assertions · Supabase local stack**

---

## Overview

Two pgTAP files guard the Member Cathedral security surface:

| File | Cases | What it covers |
|---|---|---|
| `cathedral_rls_pgtap.sql` | 7 | Row-Level Security — member isolation, append-only writes, foreign-member spoofing |
| `cathedral_starter_pack_pgtap.sql` | 7 | Starter-pack provisioning — trigger fires, 5 Scribes created, idempotence, keyword hits |

Both files are wrapped in `BEGIN … ROLLBACK` — they self-clean; production data is never touched.

---

## Prerequisites

1. **Docker Desktop** running (Supabase local stack requires it)
2. **Supabase CLI ≥ 1.200** installed:
   ```bash
   # macOS / Linux
   brew install supabase/tap/supabase

   # Windows (PowerShell — via Scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
3. Working directory must be `platform/` (where `supabase/` lives)

---

## Running the tests locally

```bash
# From repo root:
cd platform

# First-time or after migrations changed — start the local stack:
supabase start

# Run all pgTAP suites in supabase/tests/:
supabase test db
```

The CLI applies every migration in `supabase/migrations/` before running the tests, then outputs TAP format to stdout.

### Expected green output

```
TAP version 14
1..14
ok 1 - RLS: member A cannot SELECT member B's member_cathedrals row
ok 2 - RLS: member A cannot SELECT member B's private Scribes
ok 3 - RLS: member A CAN SELECT member B's commons-shared Scribe
ok 4 - RLS: member A cannot UPDATE scribe_entries (append-only enforced by policy omission)
ok 5 - RLS: member A cannot DELETE scribe_entries (append-only enforced by policy omission)
ok 6 - RLS: member A cannot UPDATE fates_log (audit immutable)
ok 7 - RLS: member A cannot INSERT a scribe_entry with member B's member_id
ok 8 - Starter pack: signup trigger provisions exactly 5 Scribes for the new member
ok 9 - Starter pack: the 5 expected Scribe names are present
ok 10 - seed_starter_pack is idempotent (second call is a no-op)
ok 11 - Starter pack: count remains 5 after a second seed_starter_pack call
ok 12 - Starter pack: every sample query (project/doctor/course/family/sprint) hits at least one Scribe
ok 13 - Starter pack: Work Scribe contains the "project" keyword (canonical anchor)
ok 14 - Starter pack: Health Scribe contains the "doctor" keyword (canonical anchor)
```

---

## Interpreting failures

### `not ok N — <description>`

The TAP line begins with `not ok`. The failure message follows on subsequent lines. Common root causes:

| Symptom | Likely cause |
|---|---|
| RLS test 1–2 returns rows it shouldn't | A policy's `USING` clause is too permissive; re-examine `cathedral.member_cathedrals` SELECT policy |
| RLS test 3 returns empty | Policy requires `exists (select 1 from cathedral.member_cathedrals)` — new user wasn't provisioned |
| RLS tests 4–6 don't throw | The policy for UPDATE/DELETE wasn't dropped — confirm the migration landed |
| Starter-pack test 8 count ≠ 5 | The `on_auth_user_created` trigger or `ensure_member_cathedral` function failed silently; check `supabase/migrations/20260423020001_k438a_cathedral_schema.sql` |
| Starter-pack test 12 count ≠ 5 | A keyword was removed from the seed data; check `provision_starter_scribes` function body |

### `pgtap extension not found`

```sql
-- Already handled in both files:
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
```

If the extension is missing from the local image, add it to a new migration:
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### `supabase start` fails

```bash
supabase stop --no-backup   # clean orphaned containers
supabase start
```

---

## CI gate

GitHub Actions workflow: `.github/workflows/supabase-pgtap.yml`

Triggers on push/PR to `main` when `platform/supabase/**` changes. The workflow:
1. Spins up local Supabase stack (Docker-in-runner)
2. Runs `supabase test db`
3. Uploads TAP output as a workflow artifact (`pgtap-tap-output-<sha>`)
4. Posts the TAP block to the GitHub Actions step summary

The artifact is retained 30 days. Download it from the **Actions → workflow run → Artifacts** panel.

**Edge functions `cathedral-export` and `cathedral-import` carry a `DEPLOY-GATE` comment at the top of their `index.ts` files.** This is a reviewer-visible reminder that the workflow must be green on the current SHA before a Founder-triggered manual deploy.

---

## Adding a new pgTAP case

1. Decide which file the new case belongs to:
   - RLS / security isolation → `cathedral_rls_pgtap.sql`
   - Provisioning / trigger behaviour → `cathedral_starter_pack_pgtap.sql`
2. Increment `SELECT plan(N)` at the top of that file by the number of new assertions you're adding.
3. Write your assertion using any `pgTAP` function (`ok`, `is`, `isnt`, `throws_ok`, `results_eq`, `bag_eq`, `is_empty`, `isnt_empty`, …). See [pgTAP docs](https://pgtap.org/documentation.html).
4. Keep the file self-contained (insert fixtures inside the `BEGIN … ROLLBACK` block; use `ON CONFLICT DO NOTHING` for idempotence).
5. Run `supabase test db` locally to verify green.
6. Commit — the CI workflow will confirm it on the next push.

---

*Maintained by KNIGHT (Cursor). Last updated K447(B118), April 2026.*

_Last CI-trigger touch: K450a B118 2026-04-23. Workflow triggered by this touch commit; green SHA to be recorded once the run completes._
