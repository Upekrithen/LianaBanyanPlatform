# BUILD_GATE — MCP Build-Window Crossfire Gate

**K448(B118) · April 2026**

---

## Why this exists

**B118 crossfire incident:** Bishop called `mcp__librarian__run_session_start` while Knight was mid-rebuild of `src/server.ts` for K438b. `tsc` was rewriting `dist/server.js` and the K441 auto-reload watcher was simultaneously restarting the MCP process. The call didn't fail cleanly — it hung silently for ~90 seconds. Client wasted time chasing a K429 regression that wasn't there.

**Root cause:** Any time Knight edits `src/` and runs `tsc` (or `npm run rebuild` triggers the K441 auto-reload), concurrent MCP tool calls can hang because the server process is in an inconsistent transition state.

**Fix:** A deliberate "rebuilding" state surfaced via `.rebuild.lock`. Clients see a structured error with `retry_after_ms` instead of a silent hang.

---

## Architecture

```
npm run build-guarded
       │
       ▼
scripts/build-guarded.mjs
  ├── writes  .rebuild.lock  { pid, startedAt, expectedDurationMs, triggeredBy }
  ├── runs    tsc (or BUILD_TSC_CMD override for tests)
  ├── success → deletes .rebuild.lock
  └── failure → rewrites .rebuild.lock  { status:"failed", error, failedAt }

src/server.ts (runtime, every tool call)
  registerTool() wrapper
       │
       └── buildGateCheck()
               │
               └── checkRebuildLock()  [src/buildGate.ts]
                       │
                       ├── no lock → null → proceed
                       ├── active lock, age < window → { error:"server_rebuilding", retry_after_ms }
                       ├── active lock, age ≥ window → stale_lock warning → proceed
                       └── failed lock → { error:"server_build_failed", last_error, since }
```

---

## When to use `build-guarded` vs raw `build`

| Scenario | Command | Why |
|---|---|---|
| Normal MCP server change | `npm run build-guarded` | Always use guarded; protects concurrent callers |
| Rebuilding the index only | `npm run build-index` | Doesn't recompile TS; gate not relevant |
| `build-guarded` itself is broken | `npm run build` | Escape hatch; gate won't protect callers |
| CI pipeline | `npm run build` (in CI) | CI has no concurrent callers; raw build is fine |
| Debugging the gate | `npm run build` | Lets you test without lock side effects |

**Rule of thumb:** If a running Cursor/Bishop MCP client might be connected while you build, use `build-guarded`.

---

## Lock file reference

**Location:** `librarian-mcp/.rebuild.lock` (gitignored)

### Active build state
```json
{
  "pid": 12345,
  "startedAt": "2026-04-23T10:00:00.000Z",
  "expectedDurationMs": 30000,
  "triggeredBy": "build-guarded"
}
```

### Failed build state
```json
{
  "status": "failed",
  "error": "TS2345: Argument of type X is not assignable to Y",
  "failedAt": "2026-04-23T10:00:15.000Z"
}
```

The `expectedDurationMs` default is 30,000ms (30s). `tsc` typically runs in 10–15s; the 30s buffer covers post-compile K441 auto-reload startup. Change `EXPECTED_DURATION_MS` in `scripts/build-guarded.mjs` if measurements show a tighter/looser bound is needed.

---

## Client-side retry recommendation

When a tool call returns `{ "error": "server_rebuilding", "retry_after_ms": N, ... }`, clients **should**:

1. Log the response at debug level: `"MCP server rebuilding, will retry in Nms"`
2. Wait `retry_after_ms` milliseconds (or `retry_after_ms + jitter` to spread retries)
3. Retry the original tool call once

When a tool call returns `{ "error": "server_build_failed", ... }`, the server will **not** recover automatically. A human must:
1. Fix the TypeScript error
2. Run `npm run build-guarded` successfully (which writes and then deletes the lock)

---

## Dispatcher gate implementation

The gate is injected in `src/server.ts` via `registerTool()` — a one-function wrapper around `server.tool()`:

```typescript
function registerTool<S extends AnyZodShape>(name, desc, schema, handler) {
  server.tool(name, desc, schema, async (args) => {
    const blocked = buildGateCheck();   // ← THE gate check
    if (blocked) return blocked;        // ← THE early-return
    return handler(args);
  });
}
```

All 44 tool registrations use `registerTool()`. No per-handler changes were needed. Adding a new tool to the server automatically inherits the gate protection.

---

## Running the tests

```bash
# From librarian-mcp/:
npm run build          # compile first
node --test tests/test_build_gate.mjs

# Or via the full test suite:
npm test
```

8 test cases — all must pass green:

| # | Case |
|---|---|
| 1 | No lock → proceed |
| 2 | Fresh active lock → server_rebuilding |
| 3 | Stale active lock → stale_lock warning, proceed |
| 4 | Failed lock → server_build_failed |
| 5 | Malformed lock → null (graceful) |
| 6 | `triggered_by` field preserved |
| 7 | Build-guard success → lock deleted |
| 8 | Build-guard failure → lock has status:"failed" |

---

## Stale lock cleanup

If a lock is left behind by a crashed build (age > 60s when `build-guarded` starts):
```
[build-guarded] Stale .rebuild.lock found (age 180s > 60s). Previous build crashed without cleanup. Overwriting.
```

If the dispatcher sees a stale active lock at call time (age > `expectedDurationMs + 10s`):
```
[build-gate] Stale .rebuild.lock (age 45000ms). Proceeding. Consider running npm run build-guarded to clear.
```

To manually clear a stuck lock:
```bash
# From librarian-mcp/:
Remove-Item .rebuild.lock   # PowerShell
rm .rebuild.lock             # bash
```

---

*Maintained by KNIGHT (Cursor). Last updated K448(B118), April 2026.*
