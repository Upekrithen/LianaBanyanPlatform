# K419 — Wire Triple Scrambler Triggers 1, 2, and 3

**Priority:** CRITICAL — Completes Innovation #2263. Without triggers, the scramblers exist but don't fire.
**Owner:** Knight
**Source:** B101 — Founder directive: "I want all 3, so that it makes SURE it all happens."
**Depends on:** K418 (complete — Scramblers A/B/C + tools built)

---

## Context

K418 built the three scramblers and the tools. But tools that exist without triggers are the same problem we started with — things that CAN be forgotten WILL be forgotten. This session wires the three triggers that make verification automatic, mandatory, and inescapable.

## Trigger 1 — Hardwire into `brief_me` and `moneypenny_debrief`

### `brief_me` (session start)

In `librarian-mcp/src/tools/brief-me.ts` (or wherever `brief_me` is handled in `server.ts`):

After building the task brief, BEFORE returning the response:
1. Call `touchstone_reconcile` (which runs all three scramblers + staleness checks)
2. Append a `## Verification Status` section to the brief output
3. If ANY scrambler flags a conflict or disagreement, put it at the TOP of the brief — before task context
4. Include counts: `X stale | Y auto-complete candidates | Z disagreements | W orphaned`

The agent CANNOT receive their work context without seeing verification results. This is non-negotiable.

### `moneypenny_debrief` (session end)

In the debrief handler:
1. Before writing the session record, run `touchstone_reconcile` with the session's files_changed and summary
2. If there are unresolved tiebreaks (Scrambler C escalated to Founder), include them in the debrief output as `## UNRESOLVED — Founder Review Required`
3. Do NOT block session close on unresolved items — but make them impossible to miss in the output
4. Auto-flag deliverables that match the session's work as `[AUTO-COMPLETE CANDIDATE]`

### Implementation notes
- The reconcile call should have a timeout (30 seconds max) so it doesn't hang a session start
- If reconcile fails/times out, the brief still returns but includes a WARNING that verification didn't run
- Cache results for 5 minutes so multiple calls in the same session don't re-run

## Trigger 2 — Scheduled Task (Cron)

Create a scheduled task that runs independently of any agent session.

### Option A: Claude Code scheduled task
Using the `create_scheduled_task` MCP tool (if available in Knight's environment):
- Task ID: `triple-scrambler-sweep`
- Schedule: Every 4 hours (`0 */4 * * *`)
- Prompt: Run `touchstone_reconcile` against all pending deliverables. Write results to `librarian-mcp/data/scrambler-reports/YYYY-MM-DD-HHmm.json`. If conflicts found, write alert to `BISHOP_DROPZONE/03_BishopHandoffs/SCRAMBLER_ALERT_[timestamp].md`

### Option B: Supabase cron edge function
If Claude Code scheduled tasks aren't persistent enough:
- Create edge function `scrambler-sweep` that:
  - Reads TouchStone manifest from Supabase (or from a synced table)
  - Runs ground-truth checks against deployed routes/tables
  - Writes results to a `scrambler_reports` Supabase table
  - The next `brief_me` call queries this table for recent alerts

### Option C: Simple file-based watchdog
Minimum viable version:
- `brief_me` checks the timestamp of the last scrambler report
- If it's older than 4 hours, `brief_me` runs a full reconciliation itself (piggybacks on Trigger 1)
- This makes Trigger 1 self-escalating — if no cron exists, `brief_me` compensates

**Implement ALL THREE options if possible. At minimum, implement Option A + Option C.**

## Trigger 3 — Claude Code Hooks (settings.json)

Add hooks to the Claude Code settings that fire automatically on specific tool calls.

### Hooks to add

```json
{
  "hooks": {
    "post_tool_call": [
      {
        "matcher": "run_session_end",
        "command": "cd /path/to/librarian-mcp && node -e \"const {execSync} = require('child_process'); execSync('python scrambler/reconcile.py', {env: {...process.env, PYTHONIOENCODING: 'utf-8'}})\""
      },
      {
        "matcher": "moneypenny_debrief", 
        "command": "cd /path/to/librarian-mcp && node -e \"const {execSync} = require('child_process'); execSync('python scrambler/reconcile.py', {env: {...process.env, PYTHONIOENCODING: 'utf-8'}})\""
      },
      {
        "matcher": "update_session",
        "command": "cd /path/to/librarian-mcp && node -e \"const {execSync} = require('child_process'); execSync('python scrambler/reconcile.py', {env: {...process.env, PYTHONIOENCODING: 'utf-8'}})\""
      },
      {
        "matcher": "touchstone_complete",
        "command": "cd /path/to/librarian-mcp && node -e \"const {execSync} = require('child_process'); execSync('python scrambler/ground_truth.py', {env: {...process.env, PYTHONIOENCODING: 'utf-8'}})\""
      }
    ]
  }
}
```

### Self-monitoring
In `brief_me`, after the verification section, check whether the hooks are configured:
1. Read `.claude/settings.json` (or the project-level settings)
2. Check for the presence of the four hook matchers above
3. If any are missing, include a WARNING: `[TRIGGER 3 INCOMPLETE] Missing hooks: {list}. Run K419 hook installer.`

This means the ABSENCE of Trigger 3 is itself a finding that Trigger 1 reports. Self-monitoring.

### Hook installer
Create a utility script `librarian-mcp/scripts/install-hooks.js` that:
1. Reads the current `.claude/settings.json`
2. Adds/updates the scrambler hooks
3. Writes back
4. Can be run by any agent: `node librarian-mcp/scripts/install-hooks.js`

## Acceptance Criteria

- [ ] **Trigger 1:** `brief_me` includes triple scrambler results automatically — tested with a real session start
- [ ] **Trigger 1:** `moneypenny_debrief` runs triple scrambler — tested with a real session end
- [ ] **Trigger 1:** Verification timeout doesn't block session start (30s max, graceful fallback)
- [ ] **Trigger 2:** Scheduled task created (Option A at minimum)
- [ ] **Trigger 2:** File-based watchdog (Option C) implemented as fallback
- [ ] **Trigger 2:** Results written to disk and picked up by next `brief_me`
- [ ] **Trigger 3:** Hook configuration added to settings.json
- [ ] **Trigger 3:** `brief_me` self-monitors for missing hooks and warns
- [ ] **Trigger 3:** Hook installer script created
- [ ] End-to-end test: start a session → see verification in brief → do work → end session → see verification in debrief

## Test Protocol

1. Start a fresh session. Call `brief_me`. Verify the output includes a `## Verification Status` section with scrambler results.
2. Call `moneypenny_debrief` with a test summary. Verify it runs the triple scrambler and flags any auto-complete candidates.
3. Check that the scheduled task is registered (list scheduled tasks).
4. Check that hooks are in settings.json.
5. Call `brief_me` again. Verify it reports Trigger 3 status (hooks present/missing).
6. If the last scrambler report is >4hr old, verify `brief_me` runs a full reconcile itself (Option C watchdog).

## The Standard

The Founder said: "I only get one launch." Nine verification paths. No silent failures. No excuses. Wire it all.
