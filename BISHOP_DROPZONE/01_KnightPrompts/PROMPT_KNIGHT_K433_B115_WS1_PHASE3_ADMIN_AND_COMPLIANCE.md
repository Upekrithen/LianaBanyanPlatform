# Knight K433 — K427 Workstream 1, Phase 3 of 3
## Pedestal Stake Reg CF portal: admin + compliance dashboard + cap-table + annual-raise tracking + two-track tests
## Bishop B115 — 2026-04-22 (late evening)
## Parent scope: [K427 B113 Counsel-Cleared Full Dispatch](./PROMPT_KNIGHT_K427_B113_ADDENDUM_COUNSEL_CLEARED_FULL_DISPATCH.md)
## Prior phases: [K431 Phase 1](./PROMPT_KNIGHT_K431_B115_WS1_PHASE1_ROUTES_AND_EARLY_INTEREST.md) + [K432 Phase 2](./PROMPT_KNIGHT_K432_B115_WS1_PHASE2_KYC_AND_ISSUANCE.md)

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.

**End of BRIDLE. Task follows.**

---

## Phase scope — Phase 3 of 3

**This session completes K427 WS1 by shipping the admin/compliance dashboard at `admin.lianabanyan.com/pedestal-stake` (or `/admin/pedestal-stake`), cap-table view, annual-raise tracking against the $5M Reg CF cap, bad-actor-check surfacing, and the full two-track separation test suite. After K433, WS1 is DONE except for Founder/counsel production-selection items (funding portal, final counsel content, production KYC provider).**

---

## Session hygiene

1. If the librarian MCP `run_session_start` tool hangs (known issue B115), SKIP it. Call `mcp__librarian__brief_me` directly with task string `"K427 WS1 Phase 3 — admin dashboard + cap-table + annual-raise tracking + bad-actor surfacing + two-track tests"`.
2. Read the K431 + K432 session reports (actual Knight output; may differ from prompts).
3. Read the K427 B113 counsel-cleared addendum §Acceptance criteria — this phase closes the remaining items.
4. Verify K432 shipped the issuance mechanics + investor dashboard live. If not, triage: either finish K432's gaps first or cut K433 scope to match. Report the cut clearly.

---

## Deliverables — Phase 3

### Admin route: `/admin/pedestal-stake` (behind existing staff-auth gate)

Grep the existing admin surface in the platform repo first — there's likely an `AdminLayout` + role-gate pattern already. Use it. Do NOT invent a new auth mechanism.

Panels on this dashboard:

1. **Issuance queue** — rows from `pedestal_applications` where `status` is between `kyc_complete` and `issued`. Staff can view application details, mark anomalies, and trigger issuance (if not auto-triggered by K432's flow). No ability to edit applicant-declared values.

2. **Cap-table view** — rows from `pedestal_holders` aggregated per investor. Columns: holder (anonymized by default, reveal on click with audit log entry), stake count, issuance date, certificate link, cumulative invested. Sort + filter by any column.

3. **Annual-raise tracking** — reads from `regcf_offering_raises`. Shows: current rolling 12-month raised, remaining headroom against $5M cap, projected runway at current pace, alert banner if within 10% of cap. "Rolling 12-month" is date-windowed — write a small helper, don't trust a single-row counter.

4. **Bad-actor-check results** — rows from `pedestal_applications.bad_actor_check_result`. Flag any `failed` or `flagged` results with a clear action prompt: staff must disposition (override with counsel approval, or reject application). Log dispositions to `pedestal_issuance_log` with reason.

5. **Compliance export** — one-click CSV export of the data needed for Form C-U updates (applicant count, funds raised, jurisdictions, aggregate demographics). Counsel files Form C-U periodically; this export is the source of truth. Do NOT file anything automatically — counsel files.

6. **Two-track-separation audit** — a dedicated panel that runs the separation-invariant test suite on a button press and displays the result. Gives staff one place to confirm the systems remain independent.

### Annual-cap-tracking helper

New file `src/lib/regcf-annual-cap.ts`:
- Function `computeRollingRaise(now: Date) → { raisedLast12Months: number, remainingHeadroom: number, percentOfCap: number }`
- Reads from `regcf_offering_raises`
- Handles edge cases: empty table (returns 0), table with entries older than 12 months (excludes them), straddling entries (if an issuance timestamp is within the window, it counts)
- $5,000,000 as a named constant; easy to bump if SEC rules change
- Unit tests for: empty state, single entry, entries straddling window, entries outside window, exactly-at-cap, above-cap (should not happen but test the behavior)

### Two-track separation test suite (complete)

Extend K431's + K432's tests with full coverage:

- Cannot query `pedestal_holders` with a JOIN to `members` (schema-level: no FK defined; test attempts the join and expects error)
- A user who is both shows independent data on both dashboards; no implied equivalence in UI or API
- Admin views clearly label "Upekrithen pedestal-stake system" vs "Liana Banyan cooperative members" — not interchangeable
- Voting: LB member votes never affect Upekrithen Pedestal Stake holder rights and vice versa (this is enforced by counsel's drafting at the legal layer, but surface a plain-English test that confirms the UI separation reflects it)

### Form C / OM content integration points

Placeholders remain until counsel delivers. Do NOT fabricate legal language. Where counsel content plugs in, leave clearly-commented TODO blocks:

```
{/* TODO(counsel): Insert final Form C reference language here. Contact: [counsel name per project_counsel_task_based.md] */}
```

---

## Non-goals for K433

- Do NOT select or commit to a funding portal (StartEngine / Republic / Wefunder) — Founder + counsel pick
- Do NOT file any actual Form C / Form C-U / Form C-AR — counsel files; we only provide the export
- Do NOT execute real ACH transfers — funding-portal adapter stays stubbed
- Do NOT begin K427 Workstream 2 (entity membership) — that's a separate Knight
- Do NOT add 506(c) surfaces — reserve data model only, do not build

---

## Reporting

1. Commit SHAs
2. Live admin dashboard URL + screenshot of each of the six panels
3. Rolling-raise helper unit test results
4. Two-track separation test suite — all green; attach raw test output
5. Compliance CSV export — attach a sample (with fake data) showing the columns counsel can use for Form C-U
6. List of remaining Founder/counsel-action items for production launch (funding-portal selection, production KYC provider, Form C content finalization, OM finalization, subscription agreement template finalization) — single checklist for Bishop to track
7. Any K427 B113 acceptance criteria still unmet after this phase — explicit list

---

## Definition of "WS1 complete" after K433

K427 Workstream 1 is considered DONE when all acceptance criteria from the B113 counsel-cleared addendum §Workstream 1 pass, all three K431-K432-K433 Knight reports are in the Bishop dropzone, and the Founder-action checklist from §Reporting item 6 above is staged for Bishop follow-up. Workstreams 2 and 3 remain separate tracks.

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*K433 dispatch written 2026-04-22 late evening by Bishop B115 (Claude Opus 4.7, 1M context). Phase 3 of K427 WS1. Closes the workstream except for Founder/counsel production-selection gates.*
