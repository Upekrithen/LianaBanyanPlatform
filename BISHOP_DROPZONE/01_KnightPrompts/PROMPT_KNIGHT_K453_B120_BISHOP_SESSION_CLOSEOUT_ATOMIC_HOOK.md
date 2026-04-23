---
knight_session: K453
bishop_session: B120
complexity_tier: LIGHT
estimated_duration_hours: 1.0
recommended_model: sonnet-4.6
escalation_trigger: "If Librarian rebuild fails silently (exit 0 but no index files updated), or if the MILESTONE template structure conflicts with any existing Bishop handoff format — stop and escalate."
---

# Knight K453 — Bishop Session Closeout Atomic Hook

## B120, April 23 2026 — SELF-CONTAINED, SMALL SURFACE

**Status:** Bishop B120 ratified B119-side finding that session closeout is incomplete until Librarian index reflects it. B118 and B119 closeouts were written to disk but never triggered a Librarian rebuild — result was `get_diff_since_session(B117)` returning "No sessions recorded after B117" when B120 opened, with 758 session-gap warning in `brief_me`. Manual rebuild at B120 open recovered correct state.

**Founder directive B120:** *"we REALLY need to MAKE each session close out actually update Librarian as part of the process."*

**Memory:** `~/.claude/projects/C--Users-Administrator-Documents/memory/feedback_session_closeout_updates_librarian.md` (ratified B120).

**This prompt:** Build a one-command atomic closeout script. Three steps, no forgetting, no split brain.

---

## Prerequisite git state (VERIFIED by Bishop before dispatch)
- B120 open, working tree clean as of Bishop verification
- Librarian index just rebuilt successfully (31.8s incremental, 233 sessions indexed, B118 + B119 both present)
- K444 R11 Run B in flight (don't touch — separate process)

---

## Deliverable 1 — The script

Create **`LianaBanyanPlatform/scripts/bishop_closeout.sh`** with the following contract:

```bash
#!/usr/bin/env bash
# Usage: ./scripts/bishop_closeout.sh B120 "one-line summary of session"
#
# Three-step atomic Bishop session closeout:
#   1. Verify MILESTONE_B{N}_CLOSEOUT.md exists in BISHOP_DROPZONE/03_BishopHandoffs/
#      (Bishop writes this before calling the script — the script only validates + moves on)
#   2. Run `cd librarian-mcp && npm run rebuild` — capture exit code + tail
#   3. Verify with `get_diff_since_session B{N-1}` — the new B{N} entry MUST appear,
#      otherwise print FAILED and exit 1
#
# Exit 0 = full success. Exit 1 = any step failed (don't swallow errors).
# Prints a clear ✓/✗ line for each step and a one-line summary at the end.
```

**Must also produce:** A Windows-compatible variant `scripts/bishop_closeout.ps1` (PowerShell) since Founder runs Windows-native. Same three-step contract, same exit-code semantics. Use `;` for chaining per Windows convention (documented in MEMORY.md).

**Both variants MUST:**
- Error loudly if the expected milestone file is not found. Print path searched.
- Error loudly if npm rebuild exits non-zero. Print last 20 lines of output.
- Error loudly if `get_diff_since_session` doesn't list the new session ID. Show what it returned.
- Print a 3-line success banner when all pass:
  ```
  ✓ Milestone file verified: BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B120_CLOSEOUT.md
  ✓ Librarian index rebuilt (31.8s, 234 sessions)
  ✓ Session B120 now visible via get_diff_since_session B119
  ```

## Deliverable 2 — Test run

Run the script against a **mock session** (e.g. copy MILESTONE_B119_CLOSEOUT.md → MILESTONE_B119_TEST_COPY.md with B-id "B119test") and verify the script:
- Fails clearly when the file is missing
- Rebuilds successfully when the file is present
- Reports the new session is detectable afterwards
- Cleans up the test file on exit (or documents clearly that Knight should remove it after verification)

Document the test run results in the BRIDLE Rule 7 report.

## Deliverable 3 — MEMORY.md pointer update

Update `~/.claude/projects/C--Users-Administrator-Documents/memory/feedback_session_closeout_updates_librarian.md` — replace the current "How to apply" step 2 with the one-command invocation:

```
2. Run `./scripts/bishop_closeout.sh B{N} "summary"` from the platform root.
   Script does all three steps atomically and fails loudly if any step doesn't complete.
```

## Deliverable 4 — BRIDLE Rule 7 report

File at **`BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K453_B120_SESSION_CLOSEOUT_HOOK.md`**:
- What shipped (file paths)
- Test run transcript
- Exit-code contract reference
- One sentence on why this exists (point to B120 diagnostic)
- Any edge cases surfaced (e.g., if `npm run rebuild` finds no new files, does it still exit 0? Document.)

## Deliverable 5 — Commit + tag

- Target commit message: `K453(B120): Bishop session closeout atomic hook`
- Target tag: `v-bishop-closeout-K453`
- Branch: main (same as K447-K452 pattern — pull fresh before starting)

---

## Out of scope (don't do)

- MCP tool wrapper (`mcp__librarian__close_session`) — that's K454+ if Founder wants the Cursor-callable version later. K453 = shell script only.
- Auto-detection of "session ended" — Bishop calls the script explicitly. No inference.
- Knight session closeout — same pattern would apply to Knight sessions but different cadence and different milestone format. Separate prompt if needed.
- Touching the K444 R11 Run B process. Knight K444 owns that — stay out of the benchmark run.

## Why B120 dispatched this now

- K444 R11 Run B is long-running (rate-limit pauses extending wall-clock by 30+ minutes). Spare Knight capacity right now while the benchmark runs.
- Small surface, one-day max duration, no dependencies on K444 results.
- Closes an infrastructure gap that caused two full Bishop sessions (B118 + B119) of invisible work. If not fixed before B120 closes, B121 will open with the same gap.
- Founder quote B120: *"Small surface, high durability."* — that's the K453 shape exactly.

## One architectural note for Knight

The script is the **Tier 1 fix** — Bishop has to remember to run it. That's fine; Bishop runs a handful of closeout commands already (commit, push, write milestone MD), adding one more is low friction. If we want **Tier 2** (Bishop *cannot* forget because it's automated), that's a Claude Code stop-hook in `~/.claude/settings.json` calling this same script. K453 is only Tier 1. Tier 2 is K454 if Founder wants it, but the underlying script must exist first — which is what K453 delivers.
