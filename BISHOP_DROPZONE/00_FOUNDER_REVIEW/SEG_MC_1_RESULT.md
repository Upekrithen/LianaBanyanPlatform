# SEG-MC-1 Result — stdio shim scaffold
Date: 2026-06-10
Session: BP079 Wave D

## Status: COMPLETE

## Files created
- `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs` (12,833 bytes)
- `librarian-mcp/tests/mcp-stdio-shim-basic.mjs` (9,417 bytes)

## Named pipe path: `\\.\pipe\mnemosynec-mcp`

## Unit test result

```
SEG-MC-1 Basic Shim Test
────────────────────────────────────────
  ✓ PASS  Step 1 — initialize response received
  ✓ PASS  Step 2 — tools/list response received
  ✓ PASS  Step 3 — tools/list contains all 5 expected tools [ping, get_mnemosynec_status, send_message, check_messages, ack_message]
  ✓ PASS  Step 4 — ping returns pong:true (version=0.1.39, shim=mnemosynec-mcp-stdio)
────────────────────────────────────────
ALL 4/4 STEPS PASSED
```

Exit code: 0 (2274 ms)

## Tools registered

| Tool | Description |
|------|-------------|
| `ping` | Connectivity check — returns `{pong:true, version:"0.1.39", shim:"mnemosynec-mcp-stdio"}` |
| `get_mnemosynec_status` | Calls `http://127.0.0.1:11480/substrate/health`; returns `{status:"offline"}` gracefully if not running |
| `send_message` | Appends a message pearl to `~/.mnemosynec/messages.jsonl` (append-only JSONL) |
| `check_messages` | Reads unread pearls addressed to a `client_id` |
| `ack_message` | Sets a pearl's `status` to `"read"` by `pearl_id` |

## Architecture notes

- **Wave D scope:** MCP server skeleton + JSONL message store only. Named-pipe IPC to Electron main process is reserved for SEG-MC-2 (Wave E).
- **Transport:** `StdioServerTransport` from `@modelcontextprotocol/sdk` v^1.28.0 (already in `librarian-mcp/package.json`).
- **Message store:** `~/.mnemosynec/messages.jsonl` — auto-created on first `send_message` call.
- **HTTP fallback base:** `http://127.0.0.1:11480` (overridable via `MNEMOSYNEC_HTTP_BASE` env var).
- **Error handling:** All tool handlers are wrapped in try/catch — the shim never crashes on tool errors.
- **No build step required:** Pure `.mjs` ESM; runs directly with `node scripts/mnemosynec-mcp-stdio.mjs`.

## MCP config snippet (Claude Desktop / Cursor)

```json
{
  "mcpServers": {
    "mnemosynec": {
      "command": "node",
      "args": ["<workspace>/librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs"]
    }
  }
}
```

## Blockers / notes

- `get_mnemosynec_status` calls `/substrate/health` — if MnemosyneC uses a different health endpoint path, update `SUBSTRATE_BASE` constant or pass `MNEMOSYNEC_HTTP_BASE` env var.
- Named-pipe IPC (`\\.\pipe\mnemosynec-mcp`) is declared as a constant but not yet wired (SEG-MC-2 job).
- The JSONL rewrite in `ack_message` is synchronous and reads/writes the full file — fine for low message volume; a line-patch strategy can be added in Wave E if volume grows.
- Knight session: BP079
