---
knight_session: K451
bishop_session: B119
bridle_version: 10
predecessor_gate: commit `51aeac8` (K450a diagnostic state) + tag `v-bridle-v10-K450b` on `42368a7`
target_tag: v-migration-baseline-K451
task_class: CI unblock + migration strategy cutover
estimated_model: Sonnet 4.6
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Context (read in full)

K450a blocked on the `20260209000003-5` migration block with three cascading errors:
1. FK violation on production-only UUID `790d4c44` in `medallion_eligibility` (20260209000003)
2. Missing column `gleaning_credits_received` in `member_currency_dashboard` view (20260209000004)
3. FK to missing table `ghost_profiles` from `durin_door_attempts` (20260209000005)

K450 applied two `DO IF EXISTS` guards (commits `43cdadc`, `51aeac8`) then hit the iteration ceiling on the third error. Halted correctly per K450 protocol.

Bishop architectural read (B119): guard-wrapping is backward. Each guard makes CI green by making the migration **no-op**, which means pgTAP runs against a schema that doesn't match production. Reviewed options A-D in the K450 handoff; **Option E is the right path**:

> **Option E — Production schema baseline.** Dump current prod schema once, commit as `00000000000000_baseline.sql`, archive the legacy pre-baseline migrations. CI thereafter replays baseline + post-baseline migrations only (self-contained, no prod credential needed in CI).

This is the standard Supabase-documented pattern for exactly this situation.

**Project ref:** `ruuxzilgmuwddcofqecc` (LianaBanyan).
**Total migrations in chain:** 657 (at time of writing).
**Blocked block:** `20260209000003-5` (three files).

---

## Scope

### Phase 1 — Baseline generation (local, one-time)

Before running any command, check if the CLI is already linked:

```bash
cat .supabase/.temp/project-ref 2>/dev/null
```

**If not linked:** Founder must run `supabase link --project-ref ruuxzilgmuwddcofqecc` from `platform/` and enter the DB password once. Password caches to `%APPDATA%\supabase\` on Windows; never enters git or any tracked file. Ask Founder as your ONE clarifying question **only if** `.supabase/` is missing AND there's no password in `Asteroid-ProofVault/LockBox/SDS.env` under any key matching `SUPABASE_DB_PASSWORD` (grep it, don't dump).

**Generate baseline:**

```bash
cd platform
supabase db dump --schema-only --linked > supabase/migrations/00000000000000_baseline.sql
```

Verify the dump is non-empty (`wc -l` should show thousands of lines) and contains expected sentinels like `CREATE TABLE public.medallion_eligibility`, `CREATE TABLE public.ghost_profiles`, and `CREATE TABLE public.durin_door_attempts`. If any of these three are missing, STOP and report — the dump is incomplete.

Strip the initial `DROP SCHEMA` / `CREATE SCHEMA public` lines from the baseline if present — Supabase local stack already creates those.

### Phase 2 — Archive legacy chain

Create the archive directory (separate from the existing `_archive_consolidation_scripts/` which is for Feb 23 ad-hoc scripts):

```bash
mkdir -p platform/supabase/migrations/_archive_legacy_pre_baseline
```

Move ALL migrations dated `2025*` and `20260[1-3]*` (i.e., everything strictly before `20260422100001_k427_entity_membership.sql`) into `_archive_legacy_pre_baseline/`. The cutoff date is **`20260422100001`** — K427 and everything after STAYS in the live migrations directory.

**EXPLICITLY PRESERVE LIVE** (must remain in `platform/supabase/migrations/`):
- `20260422100001_k427_entity_membership.sql`
- `20260422100002_k427_pedestal_stake_regcf.sql`
- `20260422230001_k431_upekrithen_schema_pedestal_stake.sql`
- `20260423000001_k432_pedestal_apply_flow_columns.sql`
- `00000000000000_baseline.sql` (the baseline you just dumped)
- Any migration dated after `20260423000001`

The archive should capture the entire legacy block — including the `20260209000003-5` files that caused the blockage. Do not delete; do not edit; simply `git mv` into the archive directory.

Also move `_archive_consolidation_scripts/` contents into `_archive_legacy_pre_baseline/` — consolidate archive dirs to one.

### Phase 3 — Revert K450's symptomatic guards

Revert commits `43cdadc` (DO IF EXISTS for medallion_eligibility + projects) and `51aeac8` (DO IF EXISTS for gleaning_credits_received view) by restoring the pre-guard SQL. These guards are in files that now live in `_archive_legacy_pre_baseline/` — they're harmless there, but for cleanliness, restore the files to their state before K450's patches BEFORE moving them to archive. Use `git log` on those files to find the commit before `43cdadc` / `51aeac8` and `git show $SHA:path > path` to restore.

Rationale: those guards were band-aids for a CI-ordering problem that Option E eliminates. Production ran fine without them; archive should reflect the production-accurate state.

### Phase 4 — Local validation gate (CRITICAL — do not skip)

Before pushing anything:

```bash
cd platform
supabase stop                       # clean slate
supabase db reset --debug           # applies baseline + post-baseline migrations
```

`supabase db reset` MUST succeed with zero errors. If it fails, STOP, diagnose, do not push. The validation gate exists precisely because K450 pushed broken CI changes three times in a row.

After successful reset, run the pgTAP tests locally:

```bash
supabase test db
```

All 14 pgTAP cases should pass. If any fail, diagnose before pushing.

### Phase 5 — CI workflow review

Open `.github/workflows/supabase-pgtap.yml` and verify:
- Path filters still match the live migration directory structure
- No workflow changes needed for baseline (baseline.sql is just a migration as far as `supabase start` is concerned)

If the workflow was doing anything clever with the 20260209 files specifically, remove that (unlikely; verify).

### Phase 6 — Commit + push + verify CI

One commit for the baseline-cutover with a clear message documenting:
- What moved to `_archive_legacy_pre_baseline/` (N files)
- The three caveats (repeated below for the commit message):
  1. `supabase db reset` locally now starts from baseline, not raw 2025/2026-early history — this is intentional
  2. Legacy block ordering bugs are archived but not fixed in archive — a K453+ audit session can address them if we ever need to rebuild prod from zero; not a CI blocker
  3. Zero GH Actions secrets added — baseline is a committed artifact, CI runs self-contained

Push to `main`. Watch for the CI run. Expected: **green on first run**.

If CI fails, diagnose. Common failure modes to check first:
- Baseline SQL contains `ALTER ROLE postgres` or similar privileged statements that fail against local stack → strip them
- Baseline references schemas (`auth`, `storage`, `graphql`) that local stack sets up differently → filter with `--schema public` on the dump
- Post-baseline migration references dropped-during-cutover state → shouldn't happen because cutoff is 20260422+; flag if it does

### Phase 7 — Documentation update

Append a section to `platform/supabase/README.md` (create if missing):

```markdown
## Migration baseline (B119 K451)

The migration chain was baselined on 2026-04-23 via `supabase db dump --schema-only` of
production. All pre-2026-04-22 migrations live in `_archive_legacy_pre_baseline/` for audit;
they are not replayed by `supabase db reset`.

If you need to rebuild prod from zero (rare — schema bugs in the archive), run archived
migrations manually in timestamp order and expect ordering errors in the 20260209000003-5
block. These are tracked for a future K453+ audit session.

Default local dev: `supabase db reset` starts from `00000000000000_baseline.sql`. This is
the desired and supported flow.
```

### Phase 8 — Tag + handoff

Tag the successful commit `v-migration-baseline-K451`.

File handoff report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K451_B119_BASELINE_MIGRATION.md` covering:
- Number of files moved to archive
- Final CI run ID + status (must be green)
- Baseline.sql line count + key sentinels confirmed
- Any statements stripped from baseline (if any)
- BRIDLE v10 compliance table

---

## Non-goals (do not do)

- Do NOT fix the ordering bugs in the archived legacy block. Separate session.
- Do NOT touch `platform/supabase/functions/`. Edge functions are out of scope.
- Do NOT touch pgTAP tests themselves (`platform/supabase/tests/`). They are K447's and they are fine.
- Do NOT add any GitHub Actions secret. The entire point is the baseline eliminates that need.
- Do NOT update `canonical_values.yaml` or Bishop memory. Bishop does that in B119 close.

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | `supabase link` confirmed (either pre-existing or Founder-assisted) | Phase 1 |
| 2 | `00000000000000_baseline.sql` committed, sentinels verified | Phase 1 |
| 3 | `_archive_legacy_pre_baseline/` contains all pre-20260422 migrations | Phase 2 |
| 4 | K450 guard-reverts applied on archived versions | Phase 3 |
| 5 | Local `supabase db reset` succeeds with zero errors | Phase 4 |
| 6 | Local `supabase test db` passes all 14 pgTAP cases | Phase 4 |
| 7 | CI workflow verified / adjusted | Phase 5 |
| 8 | Baseline-cutover commit pushed; CI GREEN on first run | Phase 6 |
| 9 | `platform/supabase/README.md` baseline section written | Phase 7 |
| 10 | Tag `v-migration-baseline-K451` on green commit | Phase 8 |
| 11 | Handoff report filed | Phase 8 |

---

## BRIDLE compliance (for your handoff report)

| Rule | How to demonstrate in handoff |
|---|---|
| Rule 1: Task done, no restate | Report opens with results, not summary |
| Rule 2: Verify before assert | Sentinel grep output in report |
| Rule 3: One clarifying question max | List it explicitly if used |
| Rule 4: Read everything | Quote one specific line from this prompt to prove reading |
| Rule 5: No invention | Cite file paths + SHAs for every claim |
| Rule 6: No unasked scope | List any temptations resisted |
| Rule 7: Plain close | Report ends with "Done. Tag: X. CI run: Y. Remaining: none" (or list remaining) |
| Rule 8: Correction → fix | N/A if no Bishop correction during execution |
| Rule 9: Rule break → flag | If any rule broken, first line of handoff says so |
| Rule 10: MCP tooling | Confirm no raw `npm run build` or `node dist/server.js` touched in librarian-mcp/ |

---

*Knight K451 authored by Bishop B119 (Claude Opus 4.7, 1M context), April 23 2026. Option E baseline cutover. FOR THE KEEP.*
