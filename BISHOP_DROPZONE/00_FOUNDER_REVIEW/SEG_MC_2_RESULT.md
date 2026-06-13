# SEG-MC-2 Result — Librarian Read Tools
Date: 2026-06-10
Session: BP079 Wave D

## Status: COMPLETE

## librarian dist/server.js exists: YES (pre-built, no build step needed)

## Tools added (12)
1. `brief_me` — session-opening substrate brief (MoneyPenny Smart Router)
2. `search_knowledge` — full-text search across all index files
3. `pheromone_query` — Detective Phase 0 pheromone substrate query
4. `get_schema` — table schema / columns / constraints / RLS policies
5. `get_page_info` — page route / data queries / feature flag dependencies
6. `query_domain` — domain tables / functions / pages / feature flags
7. `get_component` — React component exports / imports / Supabase queries
8. `get_architecture` — architecture concept from Cephas (brief or full)
9. `consult_scribes` — Cathedral Scribe RAM-access query (bishop or knight)
10. `detective_investigate` — cross-Scribe investigation (Phase 0 + Phase 1)
11. `pearl_decode` — SSPS-encoded Pearl decode
12. `soccerball_decode` — Soccerball 32-char handle decode

## Tool count in shim: 17 (5 + 12)

## Unit test (original 4/4): PASS

Output:
```
SEG-MC-1 Basic Shim Test
────────────────────────────────────────
  ✓ PASS  Step 1 — initialize response received
  ✓ PASS  Step 2 — tools/list response received
  ✓ PASS  Step 3 — tools/list contains all 5 expected tools [ping, get_mnemosynec_status, send_message, check_messages, ack_message]
  ✓ PASS  Step 4 — ping returns pong:true (version=0.2.0, shim=mnemosynec-mcp-stdio)
────────────────────────────────────────
ALL 4/4 STEPS PASSED
```

## SEG-MC-2 smoke test (5/5): PASS

Output:
```
SEG-MC-2 Smoke Test
────────────────────────────────────────
  ✓ PASS  Step 1 — initialize (server=mnemosynec-mcp-stdio v0.2.0)
  ✓ PASS  Step 2 — tools/list count = 17
  ✓ PASS  Step 3 — all 5 original tools present
  ✓ PASS  Step 4 — all 12 librarian proxy tools present
  ✓ PASS  Step 5 — brief_me smoke: real response (length=4619)
────────────────────────────────────────
ALL 5/5 STEPS PASSED
```

## brief_me smoke test: PASS (real response, length=4619)

The librarian child server booted and returned a live substrate brief for task="test smoke". The proxy is fully operational.

## Proxy approach used: child-spawn-per-call

Each librarian tool call spawns a fresh `node dist/server.js` child, runs the MCP initialize handshake, calls `tools/call`, reads the response, then kills the child.

TODO Wave E: keep child alive for performance (persistent child + request multiplexing).

## Files modified
- `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs` — bumped to v0.2.0; added `spawn` + `createInterface` + `resolve` imports; added `LIBRARIAN_DIST` constant; added `proxyToLibrarian()` function; added 12 librarian proxy tool registrations

## New test file
- `librarian-mcp/tests/mcp-shim-seg-mc2-smoke.mjs` — SEG-MC-2 smoke test (tool count + all 12 proxy tools + brief_me live call)

## Graceful error behavior
If `dist/server.js` does not exist, all 12 librarian proxy tools return:
```json
{
  "error": "librarian not available",
  "hint": "Run: cd librarian-mcp && npm run build"
}
```
No crash. No exception propagated to the MCP client.

## Statute compliance
- Statute §3: Sonnet 4.6 SEG (Wave D SEG-MC-2) ✓
- No secrets echoed ✓
- Original 5 tools intact ✓
- Version bumped: 0.1.39 → 0.2.0 ✓
