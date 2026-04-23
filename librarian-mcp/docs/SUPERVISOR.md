# SUPERVISOR — MCP Process Supervisor

**K449(B118) · April 2026**

---

## Why this exists

K448 closed the *build-window crossfire* failure mode — concurrent MCP tool calls now get a structured error instead of a silent hang when a rebuild is in progress. K449 closes the remaining reliability gap: **silent Node process death**.

If the Node MCP server crashes (OOM, unhandled Promise rejection, transport stall), the MCP client sees "unavailable" with no auto-recovery. No structured error, no retry signal, no restart — just a dead socket. A build gate can't catch this because the server isn't rebuilding; it's simply dead.

`scripts/supervise.mjs` is a ~130-line bespoke Node ESM supervisor that keeps the MCP process alive across crashes. It sits below K441's auto-reload watcher and handles the class of failure that reload doesn't: a process that has crashed and gone quiet.

### Why not pm2 or nodemon?

pm2 adds a global npm dependency and a daemon layer that has its own restart/memory/log model — overkill for a single Founder-local process, and another thing that can break. nodemon is dev-focused; it watches files and reloads on change, not on crash. A 130-line bespoke supervisor is easier to audit, ships zero new npm dependencies, and matches the K448 pattern (small, auditable, zero vendor lock-in).

---

## How it works

```
npm start
  └── node scripts/supervise.mjs
        ├── writes .supervisor.pid          (supervisor's own PID)
        ├── spawns  node dist/server.js     (the MCP server)
        │
        ├── child exits code 0  → clean shutdown; supervisor exits 0; no restart
        ├── child SIGTERM (from supervisor) → supervisor is stopping; no restart
        └── child exits code ≠ 0 → schedule restart
              │
              ├── normal crash          → restart in 5 s
              └── 3+ fast crashes       → restart in 30 s  (thrash protection)
                  (child lived < 3 s)
```

**Interaction with K448 build gate:**
When `npm run build-guarded` runs, tsc rewrites `dist/server.js`, the K441 auto-reload watcher triggers, and the child MCP process exits (non-zero). The supervisor sees the non-zero exit and schedules a restart. The new server process calls `clearPostBuildReloadLock()` on startup, clearing the post-build gate. The two systems compose cleanly — this is the designed flow.

---

## Running the supervisor

### Development

```powershell
# From librarian-mcp/:
npm start                  # supervisor wraps the MCP server; auto-restarts on crash
npm run start:raw          # bare server, no supervisor (debugging the supervisor itself)
npm stop                   # send SIGTERM via pidfile; supervisor and child exit cleanly
```

### Production (Windows Task Scheduler)

Install the scheduled task (runs `npm start` at login):

```powershell
# From librarian-mcp/:
.\scripts\install-task-scheduler.ps1
```

Start it immediately without waiting for a re-login:

```powershell
Start-ScheduledTask -TaskName "LianaBanyanLibrarianMCP"
```

The task is configured with "restart on failure" (3 × 1-minute intervals) as a secondary net. The supervisor itself handles crash recovery; the Task Scheduler setting is a backstop if the supervisor process itself crashes unexpectedly.

To remove the task:

```powershell
.\scripts\uninstall-task-scheduler.ps1
```

---

## Tailing the supervisor log

```powershell
# PowerShell — tail the rolling log
Get-Content -Path librarian-mcp\.supervisor.log -Wait -Tail 50

# Or just read the last N lines
Get-Content -Path librarian-mcp\.supervisor.log -Tail 100
```

The log rotates when `.supervisor.log` reaches 10 MB. Rotated files are:
- `.supervisor.log.1` (most recent rotation)
- `.supervisor.log.2`
- `.supervisor.log.3` (oldest; deleted on next rotation)

---

## Stopping cleanly

```powershell
# From librarian-mcp/:
npm stop
```

This runs `node scripts/supervise.mjs --stop`, which:
1. Reads `.supervisor.pid`
2. Sends `SIGTERM` to the supervisor process
3. Polls for clean exit (up to 5 s)
4. Falls back to `SIGKILL` if the supervisor doesn't exit in time

The supervisor's `SIGTERM` handler stops the child process and removes the PID file before exiting.

To stop manually (if `npm stop` isn't available):

```powershell
# Read PID
$pid = Get-Content librarian-mcp\.supervisor.pid
# Send SIGTERM (Node.js handles this on Windows via libuv)
Stop-Process -Id $pid
```

---

## Configuration

All tuning parameters are set via environment variables, which is useful for CI or testing:

| Variable | Default | Purpose |
|---|---|---|
| `SUPERVISOR_RESTART_DELAY_MS` | `5000` | Delay before restart after a non-fast crash |
| `SUPERVISOR_THRASH_DELAY_MS` | `30000` | Delay after 3+ consecutive fast crashes |
| `SUPERVISOR_FAST_CRASH_MS` | `3000` | Crash threshold (uptime < this = "fast crash") |
| `SUPERVISOR_LOG_MAX_BYTES` | `10485760` | Log rotation threshold (10 MB) |
| `SUPERVISOR_PID_FILE` | `.supervisor.pid` | Override PID file path |
| `SUPERVISOR_LOG_FILE` | `.supervisor.log` | Override log file path |
| `SUPERVISOR_CHILD_CMD` | `node` | Override child executable (for tests) |
| `SUPERVISOR_CHILD_ARGS` | `["dist/server.js"]` | Override child args as JSON array (for tests) |

---

## Runtime files (gitignored)

| File | Purpose |
|---|---|
| `.supervisor.pid` | Supervisor's own PID; read by `--stop`; removed on clean exit |
| `.supervisor.log` | Rolling log of crash/restart events |
| `.supervisor.log.1` through `.log.3` | Rotated log files |

Both `.supervisor.pid` and `.supervisor.log*` are gitignored in `librarian-mcp/.gitignore`.

---

*Maintained by KNIGHT (Cursor). Last updated K449(B118), April 2026.*
