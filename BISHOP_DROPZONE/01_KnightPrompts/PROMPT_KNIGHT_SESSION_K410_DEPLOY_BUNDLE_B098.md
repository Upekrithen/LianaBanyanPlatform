# Knight Session K410 — Deploy Bundle: Catch Up All Pending Infrastructure

**From:** Bishop (Claude Opus 4.6), Session B098
**To:** Knight (Cursor)
**Session type:** Operational catch-up, not feature development
**Feature count:** 1 bundled operational pass (counts as 1 feature against the 3-per-session ceiling)
**Priority:** HIGH — six pending migrations and three pending edge function deploys are blocking any new Open Water, Ripple, or Response Dashboard work from being testable in production.

---

## The Situation

Across Knight sessions K404b, K405, K406, K407, K408, and K409, six database migrations were created and committed to `platform/supabase/migrations/` but never pushed. Three edge functions were written and committed to `platform/supabase/functions/` but never deployed. The Librarian MCP server has two new tools (K406 canonical linter + K407 Scrambler) that require a server restart to be picked up. The Librarian's `overview.json` has known drift (shows 2,222 innovations when the canonical value in `canonical_values.yaml` is 2,250). None of this is new development work. It is operational catch-up.

The Founder has asked for this to be handled as a single bundled Knight session so the deploy state catches up to the code state in one pass.

**This prompt is K410 as a single operational bundle. It counts as 1 feature for the session accounting rules.**

---

## Deliverables

Execute the following in order. Each step has a verification gate before proceeding to the next.

### Step 1 — Database migration push

Run:

```
cd platform
supabase db push --linked
```

Expected migrations applied (in order):
- `20260411000001` — K404a anecdotes table + `/founder/story` page schema
- `20260411000002` — K404a continuation (if separate)
- `20260411000003` — K404b Open Water Core (seven tables, RLS, seeds)
- `20260411000004` — K405 Ripple Mechanics (`ripple_contributions`, `saa_cap_tracking`, `ripple_cascade_ledger`)
- `20260411000005` — K408 Open Water Cue Cards (three cue_card_templates rows with social variants)
- `20260411000006` — K409 Crown Letter Response Log (`crown_letter_response_log` table with RLS)

**Verification gate 1:** Run `supabase migration list` and confirm all six migrations show as `applied` in the remote column. If any show as `local only`, investigate and resolve before proceeding.

### Step 2 — Edge function deploys

Run, in parallel if the environment supports it:

```
supabase functions deploy commit-ripple
supabase functions deploy accrue-saa-and-cascade
supabase functions deploy log-letter-response
```

**Verification gate 2:** Run `supabase functions list` and confirm all three new functions are present in the remote deployment with a recent `created_at` timestamp. For each function, run a minimal smoke test (curl to the function URL with a known-invalid payload; expect a 400 response with validation error, not a 500 or a 404).

### Step 3 — Librarian MCP server restart + index rebuild

```
cd librarian-mcp
npm run rebuild
```

Then restart the Librarian MCP server so Claude Desktop picks up:
- The K406 `canonical_value_matches` MCP tool
- The K407 `scrambler_session_start` and `scrambler_session_closeout` MCP tools
- The corrected `get_canonical_numbers` tool reading from `canonical_values.yaml` instead of the stale `overview.json`
- The corrected `moneypenny_debrief` that reconciles drift against YAML instead of silently overwriting

**Verification gate 3:** Claude Desktop config points to the freshly-compiled `librarian-mcp/dist/server.js`. Restart Claude Desktop. In a new Claude Desktop session, call `get_canonical_numbers` and confirm the innovation count returns as 2,250 (the current canonical value after #2249 and #2250 were logged in Bishop B098), not 2,222 (the stale value). If it still returns 2,222, the YAML file needs updating — see Step 3b below.

### Step 3b — Canonical values YAML update (if drift detected)

The canonical values YAML at `librarian-mcp/canonical_values.yaml` may still show 2,240 or 2,248 if it was written before Bishop B098 logged #2249 and #2250. Update the following fields:

```yaml
stats:
  innovation_count: 2250
  crown_jewel_count: 216
  ...
```

If the YAML already has the correct values, skip this substep.

### Step 4 — Git commit

Commit all uncommitted work from K404b through K410, plus Bishop's B097 and B098 file drops. Use a single comprehensive commit message or a small number of scoped commits per Founder preference.

Files to commit include:
- All K404b–K409 new files (previously reported in each Knight session summary)
- Bishop B097 A&A formal files in `BISHOP_DROPZONE/AA_FORMAL_223[89]_*` and `AA_FORMAL_224[0-6]_*`
- Bishop B097 handoff file `BISHOP_DROPZONE/03_BishopHandoffs/BISHOP_HANDOFF_B097_TO_B098_FINAL.md`
- Bishop B097 Hemispheric Protocol manual `BISHOP_DROPZONE/SCHEDULING_STRATEGY_HEMISPHERIC_PROTOCOL_B097.md`
- Bishop B097 Founder biography `BISHOP_DROPZONE/FOUNDER_BIOGRAPHY_SOURCES_B097.md` (note: updated in Bishop B098)
- Bishop B097 Prov 7 amendment memo `BISHOP_DROPZONE/PROV7_AMENDMENT_MEMO_FOR_COUNSEL_B097.md`
- Bishop B098 Pudding #184 rewrite `BISHOP_DROPZONE/05_Puddings/PUDDING_184_GOING_FIRST_OPT_IN_B098.md`
- Bishop B098 Pawn B59 followup files `BISHOP_DROPZONE/PAWN_B59_GLOBAL_ROM_FIRST_DIVIDEND_BOX.md` and `PAWN_B59_TEXAS_PUE_DOSSIER.md`
- Bishop B098 papers `BISHOP_DROPZONE/08_Papers/PAPER_40A_*.md`, `PAPER_40B_*.md`, `PAPER_41_*.md`
- Bishop B098 A&A formals `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2249_*.md`, `AA_FORMAL_2250_*.md`
- Bishop B098 Herjavec letter patch `BISHOP_DROPZONE/06_Letters/HERJAVEC_LETTER_PATCH_PATENT_FUNDING_B098.md`
- This K410 prompt file

**Verification gate 4:** Run `git status` after the commit and confirm a clean working tree with no uncommitted files other than expected untracked artifacts (e.g., `node_modules`, `.env`, build outputs).

### Step 5 — Smoke tests on live production

After Step 1 and Step 2 succeed, run three minimal smoke tests against the live production deployment to confirm the K404b–K409 work is functional end-to-end:

**Smoke test A — Open Water Brief Submission:**
Navigate to `/openwater/publish` (the PublishBriefPage route). Confirm the "You Have a Play, I Have a Stage" Open Water cue card banner renders at the top of the page. Select Level 0 (Dinghy) and confirm the "Doing Something is What It Takes to Start" banner appears conditionally. Fill in a minimal test brief as a logged-in member and submit. Confirm the brief persists to the `patron_engagements` table in Supabase.

**Smoke test B — Ripple Contribution:**
Using the test brief from Smoke test A, navigate to the engagement detail page as a different test user (not the member and not any designated Patron). Submit a minimal Ripple contribution of type `resources`. Confirm it writes a row to `ripple_contributions` and creates an `engagement_event` of type `ripple_committed`.

**Smoke test C — Crown Letter Response Logging:**
Navigate to `/admin/response-log` as an admin user. Submit a test log entry for one of the 42 Opening Gambit recipients (use phase 1 recipient for the smoke test). Submit a `letter_dispatched` event. Then submit a `response_received` event with a classification of `curious`. Navigate to `/admin/response-dashboard` and confirm the recipient shows as "Responded" with a recent activity timestamp and a followup deadline calculated relative to the response event.

**If any smoke test fails:** Do not proceed to declare the session complete. Investigate the failure, fix the underlying issue, redeploy the affected migration or edge function, and re-run the failing smoke test until it passes.

### Step 6 — Report

Write a single summary report to `BISHOP_DROPZONE/13_Ops_Deploy/K410_DEPLOY_BUNDLE_REPORT_B098.md` containing:
- Migration push results (per-migration status)
- Edge function deploy results (per-function status)
- Librarian restart and index rebuild results
- Canonical values YAML status (updated or already current)
- Git commit hash(es)
- Smoke test results (A/B/C)
- Any issues encountered and how they were resolved

---

## Scope Exclusions

**This session is operational catch-up only.** Do NOT:
- Add new features
- Refactor existing code
- Touch anything outside the deliverable list above
- Attempt to implement K411 or any forward-looking Knight prompt
- Modify the B097 or B098 Bishop-authored files (Bishop owns those)

The 3-feature session limit applies, but this entire bundle counts as 1 feature. After completion, Knight has 2 remaining slots for forward-looking work if the Founder has other priorities.

---

## Why This Bundle

Bishop's session B098 drafted three papers (#40A/#40B/#41) and two A&A formals (#2249/#2250) that are load-bearing on the ROM-first licensing program the cooperative is about to begin. All three papers are gated on Provisional #13 filing. The Founder is filing Prov 13 tonight. Once Prov 13 is filed and papers begin circulating externally, Knight's Open Water, Ripple, and Response Dashboard infrastructure will be the production interface that Crown letter recipients and hyperscaler negotiators interact with when they respond. **That interface has to work on day one.** The deploy queue pending since K404b cannot wait for a later session — it must be caught up before the launch wave fires.

**FOR THE KEEP.**
