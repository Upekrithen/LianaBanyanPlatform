# REPORT: K449(B118) — MCP Process Supervision Wrapper

**Knight:** Cursor (Sonnet 4.6)  
**Bishop session:** B118  
**Date:** April 23, 2026  
**Predecessor gate:** K448 @ commit `e8fe2d6`, tag `v-mcp-build-gate-K448` ✓ verified  
**Target tag:** `v-mcp-supervisor-K449`  
**BRIDLE Rule 7 report**

---

## Context: The Last Reliability Gap

K449 closes the final failure mode in the MCP reliability chain:

| Failure mode | Fix | Commit |
|---|---|---|
| Stale index on session start | K429 fingerprint incremental rebuild | e797320 |
| Canonical YAML drift from fingerprint scope | Added SCAN_FILES to fingerprint | 6849fac |
| Auto-reload after Knight edits | K441 Half D | (B117) |
| Build-window crossfire → silent hang | K448 build gate | e8fe2d6 |
| **Silent Node crash → no auto-recovery** | **K449 supervisor** | **this commit** |

If the Node MCP server crashes (OOM, unhandled Promise rejection, transport stall), the MCP client previously saw "unavailable" with no auto-recovery. The K448 build gate can't catch this class of failure because the server isn't rebuilding — it's simply dead. K449 adds a process supervisor that wraps the MCP server and restarts it on crash.

---

## Deliverables Completed

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 1 | `librarian-mcp/scripts/supervise.mjs` | ✓ Created | ~130 LOC, zero npm deps, cross-platform |
| 2 | `librarian-mcp/scripts/install-task-scheduler.ps1` | ✓ Created | Idempotent; restart-on-failure configured |
| 3 | `librarian-mcp/scripts/uninstall-task-scheduler.ps1` | ✓ Created | Idempotent cleanup |
| 4 | `package.json` — `start` / `start:raw` / `stop` | ✓ Updated | `start` now runs supervisor; `start:raw` is escape hatch |
| 5 | `.gitignore` — `.supervisor.pid`, `.supervisor.log*` | ✓ Updated | Runtime files never tracked |
| 6 | `librarian-mcp/tests/test_supervisor.mjs` | ✓ Created | 7 cases, all green |
| 7 | `librarian-mcp/docs/SUPERVISOR.md` | ✓ Created | Operator one-page doc |
| 8 | Commit + tag `v-mcp-supervisor-K449` | ✓ Done | |
| 9 | BRIDLE Rule 7 report (this file) | ✓ | |

---

## Files Changed

```
librarian-mcp/scripts/supervise.mjs              (new — 130 lines, supervisor wrapper)
librarian-mcp/scripts/install-task-scheduler.ps1 (new — idempotent Task Scheduler install)
librarian-mcp/scripts/uninstall-task-scheduler.ps1 (new — idempotent Task Scheduler remove)
librarian-mcp/tests/test_supervisor.mjs          (new — 200 lines, 7 test cases)
librarian-mcp/docs/SUPERVISOR.md                 (new — operator one-pager)
librarian-mcp/package.json                       (modified — start/start:raw/stop scripts + test list)
librarian-mcp/.gitignore                         (modified — .supervisor.pid + .supervisor.log* added)
```

---

## Architecture

### Supervisor lifecycle

```
npm start
  └── node scripts/supervise.mjs
        ├── writePid()  → .supervisor.pid (supervisor's own PID)
        ├── spawn(node dist/server.js)
        │
        ├── child exit code 0   → intentional shutdown; supervisor exits 0; no restart
        ├── child exit SIGTERM  → stopping=true was set before kill; no restart
        └── child exit code ≠ 0 → schedule restart
              ├── normal crash  → RESTART_DELAY_MS (5 s default)
              └── thrash        → THRASH_DELAY_MS (30 s default)
                  (3+ consecutive fast crashes, each child lived < FAST_CRASH_MS = 3 s)
```

### Graceful shutdown

```
npm stop
  └── node scripts/supervise.mjs --stop
        ├── read .supervisor.pid
        ├── process.kill(pid, "SIGTERM")
        └── poll until exit (5 s), then SIGKILL fallback

supervisor receives SIGTERM:
  ├── sets stopping = true
  ├── child.kill("SIGTERM")
  └── on child exit → removePid() + process.exit(0)
```

### Rolling log

- Writes to `.supervisor.log` via `appendFileSync` after every significant event
- On each write: checks `statSync(LOG_FILE).size`; if ≥ 10 MB, rotates before appending
- Rotation: `.log` → `.log.1` → `.log.2` → `.log.3` (3-file cap; `.log.3` is overwritten)

### Interaction with K448 build gate

When `npm run build-guarded` runs:
1. tsc rewrites `dist/server.js`
2. K441 auto-reload watcher triggers → old MCP process exits non-zero
3. **Supervisor** sees non-zero exit → schedules restart (5 s)
4. New MCP process starts → calls `clearPostBuildReloadLock()` → K448 gate cleared

The supervisor sits below K441 and handles the crash case; K441 handles the hot-reload case. They compose without conflict.

### Why not pm2 or nodemon

pm2 adds a global npm dependency plus a daemon that has its own restart/memory/log model — a second system to debug if it fails. nodemon is dev-focused; it watches files and restarts on change, not on crash. The 130-line bespoke supervisor is easier to audit, ships zero new `npm` dependencies, and follows the K448 pattern of small, auditable, zero-vendor-lock-in infrastructure.

### Environment variables (all configurable for testing)

| Variable | Default | Purpose |
|---|---|---|
| `SUPERVISOR_RESTART_DELAY_MS` | `5000` | Delay before restart after a crash |
| `SUPERVISOR_THRASH_DELAY_MS` | `30000` | Delay after 3+ consecutive fast crashes |
| `SUPERVISOR_FAST_CRASH_MS` | `3000` | Fast-crash threshold |
| `SUPERVISOR_LOG_MAX_BYTES` | `10485760` | Log rotation threshold |
| `SUPERVISOR_PID_FILE` | `.supervisor.pid` | PID file path |
| `SUPERVISOR_LOG_FILE` | `.supervisor.log` | Log file path |
| `SUPERVISOR_CHILD_CMD` | `node` | Child executable (for tests) |
| `SUPERVISOR_CHILD_ARGS` | `["dist/server.js"]` | Child args (for tests) |

---

## Test Results

```
TAP version 13
ok 1 - child exits non-zero → supervisor restarts it within 10s
ok 2 - child exits cleanly (code 0) → supervisor does NOT restart and exits 0
ok 3 - supervisor SIGTERM → sends SIGTERM to child, exits 0
ok 4 - three consecutive fast crashes → restart delay escalates to THRASH_DELAY_MS
ok 5 - --stop reads pidfile and sends SIGTERM to supervisor cleanly
ok 6 - supervisor log rotates when file exceeds LOG_MAX_BYTES
ok 7 - supervisor writes PID file on start and removes it on clean exit
1..7
# pass 7
# fail 0
```

All timing constants are overridden in tests via env vars (e.g., `SUPERVISOR_THRASH_DELAY_MS=600`, `SUPERVISOR_LOG_MAX_BYTES=512`) so the full suite runs in under 60 seconds without writing real 10 MB logs or waiting 30-second backoffs.

---

## Out of Scope

| Item | Notes |
|---|---|
| Linux/macOS systemd units | Windows only in K449; add systemd service file if Linux hosting is introduced |
| Health-check probes (`/health` HTTP endpoint) | Separate task; process-alive is sufficient for Founder-local use |
| Metrics / telemetry export | Not needed for local process supervision |
| Auto-reload integration | K441 already handles restart-on-change; supervisor handles crash-restart |

---

## BRIDLE Compliance

| Rule | Status |
|---|---|
| Rule 1: No schema changes without migration | ✓ — No DB schema touched |
| Rule 2: No secrets in committed files | ✓ — `.supervisor.pid`, `.supervisor.log*` gitignored; no credentials |
| Rule 3: Predecessor gate verified | ✓ — e8fe2d6 + v-mcp-build-gate-K448 confirmed |
| Rule 4: tsc passes clean | ✓ — supervise.mjs is pure ESM; no TypeScript compilation step |
| Rule 5: Tests green | ✓ — 7/7 |
| Rule 6: Escape hatch preserved | ✓ — `npm run start:raw` runs bare server with no supervisor |
| Rule 7: Bishop handoff report filed | ✓ — This document |

---

*KNIGHT K449 complete. FOR THE KEEP!*
