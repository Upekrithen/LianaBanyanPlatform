# Knight Yoke-Return: Mnemosyne Come Wave D — COMPLETE
Date: 2026-06-10
Session: BP079
Commits (Wave D):
- SEG-MC-8 version bump:    8056f24  chore(release): bump MnemosyneC to v0.1.40 — Wave D MCP server (SEG-MC-8)
- SEG-MC-9 Cephas update:   44e67f2  chore(release): update Cephas download page to MnemosyneC v0.1.40 (Wave D MCP server)

## Per-SEG Status

| SEG | Task | Status |
|-----|------|--------|
| SEG-MC-1 | stdio shim scaffold | COMPLETE |
| SEG-MC-2 | librarian read tools (12) | COMPLETE |
| SEG-MC-3 | substrate write tools (4) | COMPLETE |
| SEG-MC-4 | bridge replacement (send/check/ack) | COMPLETE |
| SEG-MC-5 | integration test 28/28 | COMPLETE |
| SEG-MC-6 | HTTP+SSE transport :11482 | COMPLETE |
| SEG-MC-7 | cohort config patches (4) | COMPLETE |
| SEG-MC-8 | v0.1.40 bump + build + 28/28 verify | COMPLETE |
| SEG-MC-9 | DRAFT release + Cephas update | COMPLETE |

## Wave D version: v0.1.40
## Git commit (version bump): 8056f24
## Git commit (Cephas update): 44e67f2
## Installer SHA256: 67C78796B27935E43908AEF61B0B318B2D4500F517C902D1DFDBF767A5F792AB
## Installer size: 456.1 MB

## GitHub Release
- Status: DRAFT — awaiting Founder ratify to publish
- Release URL (draft): https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-741a7a52e1c3944bc1ab
- Published URL (after ratify): https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.1.40
- Asset attached: MnemosyneC-Setup-0.1.40.exe (456.1 MB, confirmed uploaded)
- Tag: v0.1.40 (annotated, pushed to origin)

## Cephas download page: UPDATED + DEPLOYED
- data/version.json: 0.1.38 ? 0.1.40
- layouts/download/list.html: all v0.1.38 ? v0.1.40 references updated
  - Download URL: ? Upekrithen/LianaBanyanPlatform/releases/download/v0.1.40/MnemosyneC-Setup-0.1.40.exe
  - SHA-512 (auto-update) display replaced with SHA-256: 67C78796...92AB
  - Release tag links: ? Upekrithen/LianaBanyanPlatform/releases/tag/v0.1.40
  - Technical table: filename, build hash, SHA row, hosting row all updated
  - Strapline: Version 0.1.40
- Hugo build: PASS (2477ms, all pages rendered)
- Firebase deploy: COMPLETE (cephas-lianabanyan, mnemosyne-lianabanyan, lianabanyan-museum)
- Commit: 44e67f2 pushed to origin main

## Tool count: 21
## Test count: 28/28 PASS
## Unicode safety: PASS
## Port 11482: confirmed free, HTTP+SSE ready

## Named pipe path: \\.\pipe\mnemosynec-mcp

## Supabase auth UUID (Task #15): PENDING — dev placeholder in use; production auth wires when Task #15 resolves

## Cohort config patches (all in BISHOP_DROPZONE/00_FOUNDER_REVIEW/)
- Knight: MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md — READY TO APPLY
- Bishop: MNEMOSYNE_COME_BISHOP_MCP_PATCH_READY.md — STAGED (apply after v0.1.40 installs on M1)
- Rook: MNEMOSYNE_COME_ROOK_MCP_PATCH_READY.md — aspirational (billing wall)
- Pawn: MNEMOSYNE_COME_PAWN_MCP_PATCH_READY.md — Path A actionable Wave D+1

## Founder next steps
1. Download MnemosyneC v0.1.40 from the DRAFT release (link above) and install on M1
2. Apply Knight MCP patch (MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md) — removes 2 dead entries, adds mnemosynec
3. Restart Cursor — mcp__mnemosynec__* tools appear
4. Apply Bishop MCP patch (MNEMOSYNE_COME_BISHOP_MCP_PATCH_READY.md) — adds mcpServers to ~/.claude/settings.json
5. Restart Claude Code — Bishop gains mcp__mnemosynec__* tools
6. Run round-trip test: Bishop sends via send_message, Knight receives via check_messages
7. Confirm substrate live writes (pearl_emit with MnemosyneC running = live, not queued)
8. Publish GitHub Release when verified (draft URL ? becomes v0.1.40 canonical URL)

## Note on Cephas download URL
The Cephas download page now points to Upekrithen/LianaBanyanPlatform (the main repo) rather than the
previous liana-banyan/mnemosynec-releases repo. The draft release is not yet public — the download
button will 404 until Founder publishes the release. Once published, the URL is live immediately.

## FOR THE KEEP
