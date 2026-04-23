# REPORT: K448(B118) — MCP Build-Window Crossfire Gate

**Knight:** Cursor (Sonnet 4.6)  
**Bishop session:** B118  
**Date:** April 23, 2026  
**Predecessor gate:** K447 @ commit `fba9f87`, tag `v-cathedral-rls-ci-K447` ✓ verified  
**Target tag:** `v-mcp-build-gate-K448`  
**BRIDLE Rule 7 report**

---

## Incident Context (B118 Crossfire)

Bishop called `mcp__librarian__run_session_start` while Knight was mid-rebuild of `src/server.ts` for K438b. `tsc` was rewriting `dist/server.js` at the exact moment, and the K441 auto-reload watcher was restarting the MCP process. The call hung silently for ~90 seconds. Client spent the time chasing a K429 regression that wasn't there — wasted context burn with no actionable signal.

**Structural diagnosis:** Any time Knight edits `src/` and runs `tsc` or the K441 watcher kicks in, concurrent tool calls from Bishop/Cursor can land in the gap between "old process dying" and "new process ready". The gap produces a silent hang because the MCP protocol sees no response and has no timeout signal from the server.

**Fix principle:** Turn the silent hang into a structured error. Before the process goes down for rebuild, write a lock file. Clients that call during the window get `{ error: "server_rebuilding", retry_after_ms: N }` — not silence.

---

## Deliverables Completed

| # | Deliverable | Status | Notes |
|---|---|---|---|
| 1 | `librarian-mcp/src/buildGate.ts` | ✓ Created | Core gate logic; exports `checkRebuildLock()` |
| 2 | `librarian-mcp/scripts/build-guarded.mjs` | ✓ Created | Lock-writing tsc wrapper with stale detection |
| 3 | `package.json` — `build-guarded` script | ✓ Added | `node scripts/build-guarded.mjs` |
| 4 | `src/server.ts` — `registerTool()` + `buildGateCheck()` | ✓ Added | Single wrapper; all 44 tools protected |
| 5 | `.gitignore` — `.rebuild.lock` entry | ✓ Added | Lock file never tracked |
| 6 | `tests/test_build_gate.mjs` | ✓ Created | 8/8 green |
| 7 | `librarian-mcp/docs/BUILD_GATE.md` | ✓ Created | Operator doc + retry guidance |
| 8 | Commit + tag `v-mcp-build-gate-K448` | ✓ Done |  |
| 9 | BRIDLE Rule 7 report (this file) | ✓ |  |

---

## Files Changed

```
librarian-mcp/src/buildGate.ts                  (new — 120 lines, core gate logic)
librarian-mcp/scripts/build-guarded.mjs         (new — 90 lines, lock-writing wrapper)
librarian-mcp/tests/test_build_gate.mjs         (new — 260 lines, 8 test cases)
librarian-mcp/docs/BUILD_GATE.md                (new — 130 lines, operator doc)
librarian-mcp/src/server.ts                     (modified — import + ~25 lines added,
                                                  44 server.tool() → registerTool() replacements)
librarian-mcp/package.json                      (modified — build-guarded script + test list)
librarian-mcp/.gitignore                        (modified — .rebuild.lock added)
```

---

## Architecture Detail

### Lock file lifecycle

```
npm run build-guarded                     ← Always use for MCP server changes
  │
  ├── if .rebuild.lock exists:
  │   └── age > 60s → warn "stale, overwriting"   (crashed build cleanup)
  │       age ≤ 60s → warn "lock exists, overwriting"
  │
  ├── write .rebuild.lock:
  │   { pid, startedAt, expectedDurationMs: 30000, triggeredBy }
  │
  ├── execSync(BUILD_TSC_CMD ?? "npx tsc")
  │
  ├── success → delete .rebuild.lock → exit 0
  └── failure → rewrite .rebuild.lock:
      { status:"failed", error:<tsc output>, failedAt } → exit 1
```

### Dispatcher gate (every tool call)

```typescript
registerTool(name, desc, schema, handler)
  └── server.tool(name, desc, schema, async (args) => {
        const blocked = buildGateCheck();    // ONE function
        if (blocked) return blocked;         // ONE early-return
        return handler(args);
      });
```

`buildGateCheck()` calls `checkRebuildLock()` which returns:
- `null` → no lock, proceed
- `{ warning: "stale_lock" }` → log + proceed
- `{ error: "server_rebuilding", retry_after_ms }` → return to client
- `{ error: "server_build_failed", last_error, since }` → return to client

### Generic typing fix

The original draft used `handler: (args: any)` which broke Zod schema→args type inference, causing TypeScript `TS7006` errors on array `.filter()` callbacks across ~5 tool handlers. Fixed by adding a proper generic:

```typescript
type AnyZodShape = Record<string, z.ZodType<any, any, any>>;
function registerTool<S extends AnyZodShape>(
  name: string, desc: string, schema: S,
  handler: (args: z.infer<z.ZodObject<S>>) => Promise<ToolContent>
): void { ... }
```

This preserves full Zod-to-handler type inference. `tsc --noEmit` passes clean.

---

## Test Results

```
TAP version 13
ok 1 - no lock file → checkRebuildLock returns null (proceed)
ok 2 - fresh active lock → returns server_rebuilding with positive retry_after_ms
ok 3 - stale active lock (age > expectedDurationMs + 10s) → returns stale_lock warning
ok 4 - failed lock state → returns server_build_failed with last_error and since
ok 5 - malformed lock file → checkRebuildLock returns null (graceful, no crash)
ok 6 - triggered_by field is preserved in server_rebuilding response
ok 7 - build-guard: success run → .rebuild.lock is deleted after tsc exits 0
ok 8 - build-guard: failure run → .rebuild.lock has status:'failed' after exit
1..8
# pass 8
# fail 0
```

Tests 7 and 8 invoke `build-guarded.mjs` with `BUILD_TSC_CMD="node -e process.exit(N)"` — avoids running real tsc in tests and avoids Windows CMD nested-quote parsing issues.

---

## Out of Scope (K449+)

| Item | Notes |
|---|---|
| Process supervision / auto-restart | pm2/nodemon task flagged in `project_librarian_mcp_reliability.md` |
| Client-side retry loop in Bishop/Knight | Gate provides `retry_after_ms`; honoring it is a client-side implementation task |
| Gate for non-build transient states | Build is the observed crossfire source; extend if other states surface |
| Deploy-on-green Cathedral export/import | K448 scope was the MCP gate, not deploy orchestration |

---

## BRIDLE Compliance

| Rule | Status |
|---|---|
| Rule 1: No schema changes without migration | ✓ — No DB schema touched |
| Rule 2: No secrets in committed files | ✓ — `.rebuild.lock` gitignored; no credentials |
| Rule 3: Predecessor gate verified | ✓ — fba9f87 + v-cathedral-rls-ci-K447 confirmed |
| Rule 4: tsc passes clean | ✓ — `tsc --noEmit` exits 0 |
| Rule 5: Tests green | ✓ — 8/8 |
| Rule 6: Escape hatch preserved | ✓ — `npm run build` (raw tsc) remains available |
| Rule 7: Bishop handoff report filed | ✓ — This document |

---

*KNIGHT K448 complete. FOR THE KEEP!*
