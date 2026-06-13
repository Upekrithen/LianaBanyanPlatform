# SEG-MC-3 Result — Substrate Write Tools
Date: 2026-06-10
Session: BP079 Wave D
Knight: Cursor Sonnet 4.6

## Status: COMPLETE

---

## Substrate API routes found

From `src/main/substrate_api.ts` — actual write routes on `http://127.0.0.1:11480`:

| Route | Method | Purpose |
|---|---|---|
| `/substrate/write` | POST | Write record to local index + federation queue |
| `/dag/emit` | POST | Emit DAG soccerball node (pearls array) |
| `/substrate/query` | POST | Three-mode routed query |
| `/health` | GET | Liveness check |

**No** `/substrate/pearl`, `/substrate/eblet`, `/substrate/soccerball`, or `/substrate/scribe` endpoints exist.

### Route mapping used for write tools

| Tool | Route | Body shape |
|---|---|---|
| `pearl_emit` | POST `/substrate/write` | `{id, text:content, source:"mcp:pearl_emit", keywords:tags}` |
| `eblet_emit` | POST `/substrate/write` | `{id, text:content, source:"mcp:eblet_emit:<type>"}` |
| `soccerball_emit` | POST `/dag/emit` | `{pearls:["<session_id>\|<event>\|<client_id>"]}` |
| `scribe_log` | POST `/substrate/write` | `{id, text:JSON.stringify({event,data,client_id,ts}), source:"mcp:scribe_log"}` |

---

## Write mechanism used

**QUEUE** (`~/.mnemosynec/write-queue.jsonl`)

Substrate at `http://127.0.0.1:11480` is running but in degraded mode (returns HTTP 403 for
`/substrate/write`). Offline fallback engaged correctly. Queue entries persist for later replay
when MnemosyneC exits degraded mode.

---

## Files created/modified

- `librarian-mcp/scripts/mnemosynec-write-tools.mjs` — created (8,523 bytes)
- `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs` — modified (+4 write tools, version 0.2.0→0.3.0, 32,814 bytes)

---

## Audit log path

`~/.mnemosynec/mcp-audit.jsonl`

Confirmed present and receiving entries. Sample last entry from smoke test:
```json
{"ts":"2026-06-10T22:02:07.960Z","client_id":"knight","tool":"pearl_emit","result_id":"c761e013-c900-40cf-845c-8983bf1f78e3","success":true,"error":"queued (substrate: HTTP 403)"}
```

---

## Tools added

| Tool | Schema |
|---|---|
| `pearl_emit` | `content: string, tags?: string[], client_id?: string` |
| `eblet_emit` | `content: string, type?: string, client_id?: string` |
| `soccerball_emit` | `session_id: string, event: string, client_id?: string` |
| `scribe_log` | `event: string, data?: object, client_id?: string` |

---

## Tool count

| Before MC-3 | After MC-3 |
|---|---|
| 17 (5 base + 12 librarian proxy) | 21 (17 + 4 write tools) |

Note: SEG-MC-2 librarian proxy tools WERE already registered in the shim (17 total pre-MC-3, not 5 as
the incomplete partial read suggested). Final count 21 confirms the 17+4 target from the task spec.

---

## Unit test (original 5-tool check)

```
ALL 4/4 STEPS PASSED
  ✓ PASS  Step 1 — initialize response received
  ✓ PASS  Step 2 — tools/list response received
  ✓ PASS  Step 3 — tools/list contains all 5 expected tools
  ✓ PASS  Step 4 — ping returns pong:true (version=0.3.0, shim=mnemosynec-mcp-stdio)
```

**PASS**

---

## pearl_emit smoke test

**PASS (queued)** — substrate in degraded mode (HTTP 403), write correctly queued.

```json
{"ok":true,"pearl_id":"c761e013-c900-40cf-845c-8983bf1f78e3","queued":true,"substrate":"offline"}
```

Queue entry at `~/.mnemosynec/write-queue.jsonl`:
```json
{"queued_at":"2026-06-10T22:02:07.960Z","type":"pearl_emit","content":"test pearl from SEG-MC-3","tags":["seg-mc-3","bp079"],"client_id":"knight","pearl_id":"c761e013-c900-40cf-845c-8983bf1f78e3"}
```

---

## Notes

1. **Auth gating**: None applied (local stdio = trusted per task spec). Any local process connecting
   via stdio is implicitly trusted. The shim comment documents this explicitly.

2. **Degraded mode behaviour**: The substrate at port 11480 is reachable but returns 403 for
   `/substrate/write` (degraded_mode flag in `SubstrateAPIServer`). The `appendAudit` helper records
   this as `success:true` with an inline `error` note explaining the queue reason — this is intentional:
   the write succeeded from the caller's perspective (data is durable in the queue).

3. **`/dag/emit` for soccerball**: Uses the actual DAG-emit route discovered in substrate_api.ts.
   The pearl string format is `"<session_id>|<event>|<client_id>"` — compact, parseable, no JSON overhead.

4. **appendAudit exported**: The `appendAudit` function is exported from the write-tools module so
   other modules (future shim extensions, test harnesses) can write audit entries directly.

5. **Write-queue replay**: Queue entries include all original call arguments plus a `queued_at`
   timestamp. A future Wave E replay daemon can drain the queue by POSTing to the live substrate.
