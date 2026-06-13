# SEG-MC-7 Result — Cohort Config Patches
Date: 2026-06-10
Session: BP079 Wave D

## Files delivered

- `MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md` — updated SEG-MC-4 patch, now READY TO APPLY (shim verified)
- `MNEMOSYNE_COME_BISHOP_MCP_PATCH_READY.md` — new; instructs Bishop to add mcpServers block to ~/.claude/settings.json
- `MNEMOSYNE_COME_ROOK_MCP_PATCH_READY.md` — new; aspirational HTTP+SSE config for when Antigravity billing resolves
- `MNEMOSYNE_COME_PAWN_MCP_PATCH_READY.md` — new; Path A actionable (perplexity-pawn server upgrade), Path B deferred Wave E

## Knight patch status: READY TO APPLY

## Shim path verified: YES

```
Path: C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\scripts\mnemosynec-mcp-stdio.mjs
Test-Path result: True
Verified: 2026-06-10 SEG-MC-7
```

## Summary of changes per client

| Client | Config file | Action | Status |
|---|---|---|---|
| **Knight** (Cursor) | `C:\Users\Administrator\.cursor\mcp.json` | Remove 2 dead entries (`librarian-python-legacy`, `knight-bishop-bridge`); add `mnemosynec` with `MNEMOSYNEC_CLIENT_ID: knight` | **READY TO APPLY** |
| **Bishop** (Claude Code) | `C:\Users\Administrator\.claude\settings.json` | Add `mcpServers` block with `mnemosynec` entry; `MNEMOSYNEC_CLIENT_ID: bishop` | **STAGED** — apply after v0.1.40 installs on M1 |
| **Rook** (Antigravity/Gemini) | Antigravity MCP config (if supported) | HTTP+SSE transport to `http://[M1-IP]:11482/mcp`; `MNEMOSYNEC_CLIENT_ID: rook` | **ASPIRATIONAL** — Wave E when billing wall resolves |
| **Pawn** (Perplexity) | `~/.cursor/mcp-servers/perplexity-pawn/server.mjs` (Path A) | Upgrade pawn server to call `search_knowledge` before Perplexity API | **ACTIONABLE** — Wave D+1 implementation |

## Pre-apply checklist (Founder)

- [ ] Install MnemosyneC v0.1.40 on M1
- [ ] Verify MnemosyneC MCP server starts (Developer tab shows "MCP Server: running")
- [ ] Apply Knight patch to `~/.cursor/mcp.json`
- [ ] Restart Cursor; verify `mnemosynec` appears connected in MCP server list
- [ ] Call `mcp__mnemosynec__ping` from Knight; confirm pong response
- [ ] Apply Bishop patch to `~/.claude/settings.json`
- [ ] Restart Claude Code; confirm `mcp__mnemosynec__*` tools appear
- [ ] Test round-trip: Bishop send_message → Knight check_messages

*SEG-MC-7 complete. Knight / BP079 / 2026-06-10*
