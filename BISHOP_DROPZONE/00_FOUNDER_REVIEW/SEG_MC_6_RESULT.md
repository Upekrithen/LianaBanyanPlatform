# SEG-MC-6 Result — HTTP+SSE Transport
Date: 2026-06-10
Session: BP079 Wave D

## Status: COMPLETE

## Files created/modified
- `librarian-mcp/scripts/mnemosynec-mcp-http.mjs` (18125 bytes)
- `librarian-mcp/tests/mcp-http-health-test.mjs` (3875 bytes)
- `librarian-mcp/package.json` (scripts added: `mcp:http`, `mcp:stdio`)

## Port: 11482 (confirmed free and bound successfully)

## Secret file: `~/.mnemosynec/mcp-secret.txt` (auto-generated on first start — 32-byte random hex, mode 0o600)

## Health endpoint test: PASS

```
SEG-MC-6 HTTP health test
  ✔ server spawned and running
  ✔ health status == "ok"
  ✔ health version present: 0.1.39
  ✔ health port == 11482
  ✔ server killed

Results: 5 passed, 0 failed

Health response:
{
  "status": "ok",
  "version": "0.1.39",
  "port": 11482
}

SEG-MC-6 health test: PASS
```

## Rate limiting: in-memory Map (per Wave D spec)
- Map keyed by IP → `{count, resetAt}` entries
- 100 requests/minute per IP default (configurable via `config.json`)
- Stale entries pruned every 120s via `setInterval(...).unref()`
- No external dependencies

## Config bootstrap
- `~/.mnemosynec/config.json` auto-created on first start with defaults:
  ```json
  {
    "remote_mcp_enabled": false,
    "mcp_http_port": 11482,
    "rate_limit_per_minute": 100
  }
  ```
- Server starts if `remote_mcp_enabled: true` OR `--force` flag passed

## Endpoints implemented
| Endpoint | Auth | Notes |
|---|---|---|
| `GET /mcp/health` | None | Returns `{"status":"ok","version":"0.1.39","port":11482}` |
| `POST /mcp` | Bearer token | JSON-RPC 2.0; routes `tools/call` → librarian proxy |
| `GET /mcp/sse` | `?token=<secret>` | SSE stream; 30s ping keepalive |

## SSE implementation
- Full SSE implementation using Node.js built-in `http.ServerResponse`
- Sessions stored in `Map<sessionId, {res, pingTimer}>`
- 30-second ping: `data: {"type":"ping"}\n\n`
- Initial connection event: `data: {"type":"connected","session_id":"<id>"}\n\n`
- `X-Accel-Buffering: no` header for nginx/proxy compatibility
- Sessions cleaned up on `res.close` and `res.error` events
- `broadcastSseEvent(sessionId, eventData)` helper for tool response forwarding

## MCP tool routing (POST /mcp)
- `initialize` → returns server info inline (no proxy needed)
- `notifications/initialized` → ack
- `tools/list` → returns empty list (proxy handles actual tools)
- `tools/call` → proxies to `librarian dist/server.js` via same child-spawn pattern as SEG-MC-2
- Unknown methods → JSON-RPC `-32601` error

## Startup scripts (package.json)
```json
"mcp:http": "node scripts/mnemosynec-mcp-http.mjs --force",
"mcp:stdio": "node scripts/mnemosynec-mcp-stdio.mjs"
```

## Statute compliance
- Statute §3: Sonnet 4.6 SEG (Wave D SEG-MC-6) ✓
- No secrets echoed — `mcp-secret.txt` generated locally, never logged (only path logged) ✓
- Port 11482 confirmed free and operational ✓
- Zero external dependencies (uses Node.js built-in `http`, `crypto`, `child_process`) ✓

## Notes
- Wave D spec: correctness over performance — librarian proxy spawns a fresh child process per `tools/call` (same as SEG-MC-2 stdio shim). Wave E TODO: persistent child with request multiplexing.
- The `mnemosynec-mcp-http.mjs` server is intentionally standalone and does NOT import from the stdio shim — it reimplements `proxyToLibrarian` directly (same logic, separate process boundary).
- `export` statements at module bottom expose `makeHandler`, `loadConfig`, `loadOrCreateSecret`, `checkRateLimit`, `VERSION`, `DEFAULT_PORT` for future unit testing without spawning a full server.
