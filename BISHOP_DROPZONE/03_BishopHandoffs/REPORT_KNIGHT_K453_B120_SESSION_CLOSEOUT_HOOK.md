# REPORT — Knight K453 / Bishop B120
## Bishop Session Closeout Atomic Hook

**Knight session:** K453  
**Bishop session:** B120  
**Date:** 2026-04-23  
**BRIDLE version:** v10  
**Tag:** `v-bishop-closeout-K453`  
**Complexity:** LIGHT (1.0 hr)

---

## Why This Exists

B120 opened to find the Librarian index 758 session-gaps stale. Two full Bishop sessions (B118 + B119) — containing MCP reliability chain, Slow Blade V2, K451 baseline cutover, and 15 Prov 14 innovation candidates — were invisible to `get_session_context`, `get_diff_since_session`, and `brief_me`. The three-step closeout process (write milestone MD → rebuild Librarian → verify) existed in memory (`feedback_session_closeout_updates_librarian.md`) but was not enforced by a single command. Bishop forgot step 2. This script makes that impossible: one command, three steps, loud failure if any step fails.

**Founder directive B120:** *"we REALLY need to MAKE each session close out actually update Librarian as part of the process."*

---

## What Shipped

| File | Description |
|------|-------------|
| `scripts/bishop_closeout.sh` | Bash script — three-step atomic closeout |
| `scripts/bishop_closeout.ps1` | PowerShell script — same contract, Windows-native |

### Exit-code contract

| Exit code | Meaning |
|-----------|---------|
| `0` | All three steps passed. Session is fully indexed. |
| `1` | Step 1, 2, or 3 failed. Error printed. Nothing swallowed. |

The scripts do NOT modify the milestone file (Bishop writes it before calling), do NOT commit (Bishop handles git), and do NOT auto-detect session end (Bishop calls explicitly).

---

## Script Invocation

**Windows (PowerShell — primary platform):**
```powershell
# From LianaBanyanPlatform root:
.\scripts\bishop_closeout.ps1 B120 "Summary of what happened in B120"
```

**Linux/macOS (bash):**
```bash
./scripts/bishop_closeout.sh B120 "Summary of what happened in B120"
```

Both accept positional args: `SessionId` (required, form `B<number>`) and `Summary` (optional, documentation only).

---

## Three-Step Contract

### Step 1 — Milestone file verification
Checks that `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B{N}_CLOSEOUT.md` exists.  
Fails loudly with the full path searched if the file is absent.  
**Note:** Bishop writes this file before calling the script. The script only validates.

### Step 2 — Librarian rebuild
Runs `npm run rebuild` from `librarian-mcp/`.  
On success: prints rebuild time and session count from `context.json`.  
On failure: prints the last 20 lines of output and exits 1.

**Edge case — Index is FRESH:** If no files changed since the last build, the indexer outputs "Index is FRESH (built X ago). Nothing to do." and exits 0. The script handles this correctly: it displays `(fresh/no-op, N sessions)` and proceeds to step 3. This is not an error — if the milestone file was already present before the last rebuild, the session is already indexed.

**Edge case — npm run rebuild exits 0 but no index files updated:** Caught by step 3. If the session ID doesn't appear in `context.json` after the rebuild exits 0, the script prints a FAIL and exits 1. The exit-0-but-no-update scenario is therefore detected at step 3, not step 2.

### Step 3 — Session visibility verification
Reads `librarian-mcp/index/context.json` and checks that the session array contains an entry with `id == "B{N}"`.  
This mirrors what `get_diff_since_session B{N-1}` would return — if the ID is in `context.json`, the Librarian MCP tool will surface it.  
Fails loudly with a diagnostic message if the session is absent after rebuild.

---

## Test Run Transcript

### Test A — Failure case (missing milestone)

```
> .\scripts\bishop_closeout.ps1 B120

=== Bishop Closeout: B120 ===================================

--- Step 1/3: Verifying milestone file ---
  [FAIL]  Milestone file NOT found.
          Searched: C:\...\BISHOP_DROPZONE\03_BishopHandoffs\MILESTONE_B120_CLOSEOUT.md

  Bishop must write MILESTONE_B120_CLOSEOUT.md before calling this script.

Exit code: 1
```

**Result:** PASS — script fails clearly at step 1, prints exact path searched, exits 1.

### Test B — Success case (B119, milestone exists)

```
> .\scripts\bishop_closeout.ps1 B119 "K453 final test"

=== Bishop Closeout: B119 ===================================
    Summary: K453 final test

--- Step 1/3: Verifying milestone file ---
  [OK]  Milestone file found: BISHOP_DROPZONE\03_BishopHandoffs\MILESTONE_B119_CLOSEOUT.md

--- Step 2/3: Rebuilding Librarian index ---
    Running: npm run rebuild (in librarian-mcp\)
  [OK]  Librarian index rebuilt (fresh/no-op, 233 sessions)

--- Step 3/3: Verifying B119 is indexed ---
  [OK]  Session B119 now visible in Librarian index

===================================================================
  [OK]  Milestone file verified: BISHOP_DROPZONE\03_BishopHandoffs\MILESTONE_B119_CLOSEOUT.md
  [OK]  Librarian index rebuilt (fresh/no-op, 233 sessions)
  [OK]  Session B119 now visible via get_diff_since_session B118
===================================================================

    Bishop closeout COMPLETE for B119.
    Ledger entry: "K453 final test"

Exit code: 0
```

**Result:** PASS — all three steps verified, success banner printed, exits 0.

**Notes on "fresh/no-op":** The B119 milestone was already indexed (from the manual rebuild that opened B120). The incremental build detected no file changes and short-circuited to "Index is FRESH". The script correctly handled this: step 3 confirmed B119 is in `context.json`, so the session is verified without a full rebuild. This is the correct behavior — no work is ever skipped, only unnecessary recomputation.

### Test cleanup
No test files were created (used existing MILESTONE_B119_CLOSEOUT.md). No cleanup needed.

---

## BRIDLE v10 Compliance

| Rule | Status | Notes |
|------|--------|-------|
| R1 — No orphaned deliverables | ✓ | Both files committed under main |
| R2 — Exit codes are meaningful | ✓ | 0 = full success, 1 = any step failed, never swallowed |
| R3 — Loud failure by default | ✓ | Each failure prints path/output searched; no silent degradation |
| R4 — Pre-registered prediction | ✓ | Prompt pre-staged by Bishop before K453 dispatch |
| R5 — Tests documented | ✓ | Two test cases in this report with exact transcripts |
| R6 — No scope creep | ✓ | No MCP wrapper, no auto-detection, no Knight session support (K454+) |
| R7 — Report filed | ✓ | This document |
| R8 — Memory updated | ✓ | `feedback_session_closeout_updates_librarian.md` step 2 updated |
| R9 — Tag on green | ✓ | `v-bishop-closeout-K453` applied post-commit |
| R10 — build-guarded not required | N/A | Did not touch `librarian-mcp/src/` — no TypeScript compilation needed for scripts |

---

## Edge Cases Surfaced

1. **`npm run rebuild` exits 0 but "fresh" (no new files):** Handled. Script reads `context.json` directly to verify rather than trusting the rebuild log message alone. If the milestone was already indexed, step 3 confirms and the script exits 0. Correct behavior.

2. **`npm run rebuild` exits 0 but session still absent:** Caught by step 3. This would indicate a bug in `parseSessionCloseouts.ts` (e.g., the filename doesn't match `MILESTONE_B*_CLOSEOUT.md` regex). The script would exit 1 with a diagnostic. Knight should check the milestone filename convention.

3. **Large `context.json` parse time:** `ConvertFrom-Json` on a ~400KB file is fast (< 1s on this hardware). No performance concern.

4. **Non-B session IDs:** The script rejects any `SessionId` not matching `^B\d+$` at startup. Knight sessions (`K<NNN>`) are explicitly out of scope per prompt.

---

## Recommended Next Actions for Bishop

1. **B120 closeout:** Run `.\scripts\bishop_closeout.ps1 B120 "summary"` once MILESTONE_B120_CLOSEOUT.md is written.
2. **Establish ritual:** Add `.\scripts\bishop_closeout.ps1 B{N} "..."` as the last line of the Bishop closeout checklist in MEMORY.md.
3. **K454 (optional, Tier 2):** Convert this script to a Claude Code stop-hook in `~/.claude/settings.json` so Bishop *cannot* forget. K453 is Tier 1 (Bishop must remember to run). K454 = Tier 2 (automation). The script delivered here is the prerequisite.

---

*FOR THE KEEP.*
