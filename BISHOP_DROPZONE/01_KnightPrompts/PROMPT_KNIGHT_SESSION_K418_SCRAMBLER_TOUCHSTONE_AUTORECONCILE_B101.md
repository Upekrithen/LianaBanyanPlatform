# K418 — Triple-Redundant Scrambler Architecture (Innovation #2263)

**Priority:** CRITICAL — Founder directive. System integrity.
**Owner:** Knight
**Source:** B101 — Founder identified TouchStone went 15 sessions stale. Then designed the fix: three scramblers, three triggers, redundant redundancy.
**Innovation:** #2263 — Triple-Redundant Verification Architecture for AI Coordination Systems

---

## Problem (Three Failure Modes Found in B101)

### Failure 1: Silent Staleness
TouchStone deliverables went 15 sessions without updates (B096→B101). 56 items showed "pending" when many were already shipped.

### Failure 2: Stale Predicates Reject Truth
Predicates checked for "2233→2236" when canonical is at 2262. The system fights itself.

### Failure 3: Single Point of Failure
One scrambler + one trigger = one silent failure = total blindness.

---

## Architecture: Three Scramblers × Three Triggers

### THE THREE SCRAMBLERS

#### Scrambler A — Ledger Verifier (enhance existing)
- Checks canonical_values.yaml against session summaries and deliverable manifests
- Evidence source: internal records, session logs, YAML state files
- Checks: Do session summaries account for all canonical value changes? Are deliverable statuses consistent with session logs?

#### Scrambler B — Ground Truth Verifier (NEW)
- Checks actual deployed artifacts against what the ledger claims
- Evidence source: files on disk, live routes, Supabase tables, edge functions
- For each pending deliverable, checks:
  - Does the target file exist / was it modified since deliverable creation?
  - Do grep patterns from deliverable notes match current code?
  - Are referenced Supabase tables/functions present?
  - Do deployed site routes return 200?

#### Scrambler C — Tiebreaker / Arbiter (NEW)
- Activates ONLY when A and B disagree
- Voting protocol:

| Scrambler A | Scrambler B | Result |
|---|---|---|
| Pending | Code shipped | C decides — likely COMPLETE (ground truth wins for "did it ship?") |
| Complete | Code missing | C decides — likely REVERTED or ERROR (escalate to Founder) |
| Pending | Code missing | Confirmed PENDING — unanimous |
| Complete | Code shipped | Confirmed COMPLETE — unanimous |

- Logs all tiebreaks with reasoning for Founder audit
- **Self-healing:** when C resolves a disagreement, it updates A's ledger so drift doesn't persist
- Escalates to Founder when evidence is genuinely ambiguous

### THE THREE TRIGGERS

**The Founder's directive: "I want all 3, so that it makes SURE it all happens. Redundant redundancy."**

#### Trigger 1 — Hardwired into `brief_me` and `moneypenny_debrief`

This is the most reliable trigger because agents MUST call `brief_me` to start working. They can't skip it.

**At session start (`brief_me`):**
- Run all three scramblers as part of the brief generation
- Include results in the brief output under a "## Verification Status" section
- If ANY scrambler flags a conflict, it appears at the TOP of the brief — before task context
- The agent literally cannot receive their work context without seeing verification results

**At session end (`moneypenny_debrief`):**
- Run all three scramblers against the session's work
- Pattern-match files_changed and session summary against pending deliverables
- Flag auto-complete candidates
- Refuse to close the session if there are unreconciled tiebreaks (C has unresolved conflicts)
- Log everything

**Implementation:**
- In `brief_me` handler: after building the task brief, call `runTripleScrambler()` and append results
- In `moneypenny_debrief` handler: before writing the session record, call `runTripleScrambler()` with session context
- These are NOT optional calls. They are part of the function's core logic.

#### Trigger 2 — Scheduled Task (Cron)

Insurance policy. Runs whether or not any agent is active.

**Schedule:** Every 4 hours during active development periods
**What it does:**
- Runs all three scramblers against the full TouchStone manifest
- Writes results to `librarian-mcp/data/scrambler-reports/YYYY-MM-DD-HHmm.json`
- If conflicts are found, writes a summary to `BISHOP_DROPZONE/03_BishopHandoffs/SCRAMBLER_ALERT_[timestamp].md`
- The next `brief_me` call picks up the latest report and surfaces any unresolved alerts

**Implementation:**
- Create a Claude Code scheduled task OR a Supabase cron edge function
- The scheduled task calls `touchstone_reconcile` which runs all three scramblers
- Results persist to disk so they survive between sessions

#### Trigger 3 — Claude Code Hook (settings.json)

Belt and suspenders. Fires automatically on specific tool calls.

**Hook triggers:**
- `post_tool_call` for `run_session_end` → run triple scrambler before session closes
- `post_tool_call` for `moneypenny_debrief` → run triple scrambler (backup for Trigger 1)
- `post_tool_call` for `update_session` → run triple scrambler (catches manual session logging)
- `post_tool_call` for `touchstone_complete` → run Scrambler B (ground truth) to verify the completion claim

**Implementation:**
- Add hooks to `.claude/settings.json` for each agent workspace
- Hooks call a shell script that invokes the Librarian's scrambler endpoint
- If any hook fails, it logs the failure — hooks don't silently swallow errors

**Note:** This trigger depends on local settings.json being configured per agent. Include a verification step in `brief_me` that checks whether the hooks are configured and warns if they're missing.

### TRIGGER COVERAGE MATRIX

| Scenario | Trigger 1 (brief_me) | Trigger 2 (Cron) | Trigger 3 (Hook) |
|---|---|---|---|
| Normal session start | ✅ | — | — |
| Normal session end | ✅ | — | ✅ |
| Agent forgets to call debrief | — | ✅ (catches it within 4hr) | — |
| No sessions for 12 hours | — | ✅ | — |
| Agent calls update_session manually | — | — | ✅ |
| Someone marks deliverable complete | — | — | ✅ (ground truth verify) |
| All three fail simultaneously | Founder's .rtf logs are the ultimate backstop | | |

**Nine verification paths** (3 scramblers × 3 triggers). The only scenario where drift goes undetected is if all three triggers fail AND all three scramblers fail simultaneously. The probability is effectively zero.

---

## Additional Requirements

### Predicate Aging / Override
- Deliverable 10+ sessions old: stale predicate failure = WARNING, not REJECT
- Add `touchstone_force_complete` with logged override
- Every force-complete logs reason + agent

### Stale Deliverable Flagging
- Pending 5+ sessions, no change → `[STALE]`
- In-progress 10+ sessions, no update → `[ORPHANED]`
- Pattern-match titles against session summaries → `[POSSIBLY COMPLETED — verify]`

### Session Index Gap Detection
- B098, B099, B100 are NOT in the Librarian's session index
- Add `session_import` tool OR Scrambler flags missing sessions automatically

### Bulk Reconciliation Tool
- `touchstone_reconcile` runs all three scramblers against all pending deliverables
- Available for manual catch-up AND called by Trigger 2 (cron)

## Implementation Files

- `librarian-mcp/src/tools/scrambler.ts` — enhance Scrambler A, add triple-scrambler orchestrator
- `librarian-mcp/src/tools/scrambler-ground-truth.ts` — NEW: Scrambler B
- `librarian-mcp/src/tools/scrambler-arbiter.ts` — NEW: Scrambler C
- `librarian-mcp/src/tools/touchstone.ts` — add `touchstone_reconcile`, `touchstone_force_complete`
- `librarian-mcp/src/tools/brief-me.ts` — wire triple scrambler into brief generation
- `librarian-mcp/src/tools/moneypenny.ts` — wire triple scrambler into debrief
- `.claude/settings.json` — hook configuration for Trigger 3
- Scheduled task config for Trigger 2

## Acceptance Criteria

- [ ] Scrambler B checks deployed files, routes, tables against pending deliverables
- [ ] Scrambler C activates on A/B disagreement, votes by evidence weight
- [ ] Tiebreak resolutions auto-update the drifted verifier (self-healing)
- [ ] **Trigger 1:** `brief_me` includes triple scrambler results — cannot be skipped
- [ ] **Trigger 1:** `moneypenny_debrief` runs triple scrambler — refuses to close with unresolved conflicts
- [ ] **Trigger 2:** Scheduled task runs every 4 hours, writes reports to disk
- [ ] **Trigger 3:** Claude Code hooks fire on session-end and completion tool calls
- [ ] `brief_me` warns if Trigger 3 hooks are not configured
- [ ] `touchstone_force_complete` available with logged override
- [ ] Stale predicates (10+ sessions) downgraded from REJECT to WARNING
- [ ] `touchstone_reconcile` tool for bulk reconciliation
- [ ] Session index gap detection
- [ ] All tiebreak decisions logged for Founder audit

## Context

The Founder's words:
- "If it can get that far behind, how useful is it?" — on discovering 15-session staleness
- "WORSE than wrong." — on false-confidence failure mode
- "I think we need two scramblers, and if that, then three to break ties." — the TMR architecture
- "I want all 3, so that it makes SURE it all happens. Redundant redundancy." — the triple trigger
- "I only get one launch." — the standard everything is measured against

This is Innovation #2263. A&A formal: `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2263_TRIPLE_REDUNDANT_VERIFICATION.md`
