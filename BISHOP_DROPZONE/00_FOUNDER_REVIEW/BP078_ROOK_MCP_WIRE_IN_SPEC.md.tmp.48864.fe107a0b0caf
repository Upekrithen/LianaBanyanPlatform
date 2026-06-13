# BP078 — Rook MCP Wire-In Spec
**For Knight to build. Drafted by SEG-W (Bishop dispatch). 2026-06-08.**
**Status: FOUNDER REVIEW — not yet dispatched to Knight.**

use segs

---

## Overview

Two MCP connections wire Rook into the live Liana Banyan substrate:

1. **rook-bishop-bridge** — messaging channel between Bishop and Rook (clone-and-rename of knight-bishop-bridge)
2. **librarian-mcp read-only surface** — gives Rook gadget access to canon without write or dispatch permissions

This spec is Knight-buildable. Sections 1 and 2 are the build work. Sections 3 and 4 are what Founder pastes into Antigravity. Section 5 is the effort estimate. Section 6 is the smoke test.

---

## Section 1 — rook-bishop-bridge MCP Server

### Source

Clone knight-bishop-bridge. Rename to `rook-bishop-bridge`. Change all internal references from "KNIGHT" to "ROOK" and "knight" to "rook". The protocol, file format, and tool surface are identical. No new logic required.

Knight-bishop-bridge is assumed to live at a known path on this machine. Knight: locate it, clone it to a sibling directory (e.g., `C:\Users\Administrator\Documents\LianaBanyanPlatform\rook-bishop-bridge\` or wherever knight-bishop-bridge is stored), rename, update package.json name field to `rook-bishop-bridge`.

### Bridge file location

`C:\Users\Administrator\Documents\AntigravityWorkspace\bridge\ROOK_BISHOP_MESSAGES.md`

Create the `bridge\` subdirectory inside AntigravityWorkspace. This keeps Rook's bridge file inside his workspace, physically separate from the LianaBanyanPlatform tree. Bishop and Knight can also write to this file because they have filesystem access. Rook writes through the MCP tool. Bishop writes through the Yoke (knight-bishop-bridge points to KNIGHT_BISHOP_MESSAGES.md; the rook bridge points to ROOK_BISHOP_MESSAGES.md).

### Tool list

| Tool name | Description |
|---|---|
| `send_message` | Send a message to the bridge. Params: `to` (BISHOP, ROOK, or BOTH), `type` (request, response, info, task), `content` (string), `pin` (boolean, optional). |
| `check_messages` | Read messages from the bridge. Params: `class` (filter by type), `count` (max messages to return), `for_me` (boolean, returns only messages addressed to Rook), `include_pinned` (boolean, surfaces pinned tasks first). |
| `unpin_task` | Mark a pinned task as resolved. Params: `timestamp` (the timestamp from the pinned message header). |
| `get_workspace_status` | Returns Rook's workspace directory listing and any status notes. No params. |
| `list_files` | List files in a specified path within AntigravityWorkspace. Param: `path` (relative to workspace root). |
| `read_file` | Read a file from AntigravityWorkspace. Param: `path` (relative to workspace root). |
| `write_file` | Write a file to AntigravityWorkspace drafts or outputs. Param: `path`, `content`. Does NOT allow writes outside AntigravityWorkspace. |

### Pin and unpin semantics

Identical to knight-bishop-bridge. A pinned message appears at the top of every `check_messages` response until explicitly unpinned. Pin is set by the sender (Bishop sets `pin: true` on task dispatches to Rook). Rook calls `unpin_task` with the timestamp when the task is complete and the response has been sent.

### Security boundary

The rook-bishop-bridge server operates ONLY within `C:\Users\Administrator\Documents\AntigravityWorkspace\`. It must not:
- Read from or write to `C:\Users\Administrator\Documents\LianaBanyanPlatform\` (the live platform tree)
- Read from `C:\Users\Administrator\.claude\state\secrets\` (blacklisted by canon)
- Emit to librarian, Supabase, or any substrate write surface

Rook is a reader and analyst. His bridge is a communication surface only. All writes by Rook to the substrate happen through Bishop or Knight relaying the ratified output.

### Startup and config

The MCP server is a Node.js process (same as knight-bishop-bridge). It is registered in Antigravity's MCP Tools panel (see Section 3). It requires no API keys. It only needs filesystem access to `AntigravityWorkspace\bridge\`.

---

## Section 2 — librarian-mcp Read-Only Connection for Rook

### Does librarian-mcp support read-only mode?

As of BP078, Bishop does not have empirical confirmation that librarian-mcp supports a `read_only: true` flag or an equivalent deny-list at the server config level. **Knight: verify by checking the librarian-mcp server config / source or by running `search_knowledge` with a restricted key set.** This is the primary unknown in the spec.

**If librarian-mcp does NOT support a read-only flag natively**, the fallback is a thin wrapper MCP server (call it `librarian-rook-readonly`) that:
1. Proxies the allowlisted tools through to the real librarian-mcp endpoint
2. Returns an error for any tool not on the allowlist
3. Requires no changes to the upstream librarian-mcp server

### Allowed tool surface for Rook (read-only)

These tools give Rook full discovery and recall without any write or dispatch capability:

| Tool | Purpose |
|---|---|
| `brief_me` | Session-open orientation: BP number, canonical numbers, current state |
| `search_knowledge` | Full-text canon and eblet search |
| `pearl_decode` | Resolve a pearl ID to its content |
| `consult_scribes` | Retrieve session transcript summaries and key decisions |
| `chronos_query` | Time-ordered event queries |
| `codex_query` | Structured document / legal / IP ledger queries |
| `pheromone_query` | Topic-indexed substrate search (inverted index over eblets) |
| `get_architecture` | System architecture retrieval |
| `get_canonical_numbers` | Retrieve canonical numeric claims (2,473 written claims, 2,270 innovations, etc.) |

### Blocked tool surface (must not be exposed to Rook)

These are the write and dispatch surfaces. Rook must never be able to call them:

- `pearl_emit` — writes a new pearl to the substrate
- `gold_tablet_ratify` — ratifies a gold tablet (legal / IP class write)
- `coroner_log_signal` — logs a coroner signal
- `dispatch_pawn`, `dispatch_rook`, `team_dispatch` — any dispatch tool
- `eblit_emit` — substrate write
- `soccerball_emit` — content-addressed substrate write
- `codex_add_chapter`, `codex_bind`, `codex_create`, `codex_supersede` — codex write tools
- `scribe_log`, `correspondent_log` — log writes
- Any tool containing `ratify`, `emit`, `dispatch`, `mint`, `log_signal`, `create`, `update`, `write`, `supersede` in its name

**Knight: implement the allowlist as an explicit whitelist, not a blacklist.** New tools added to librarian-mcp in the future should NOT automatically become available to Rook. Rook must be re-granted access to any new tool explicitly.

### Connection endpoint

librarian-mcp runs locally on this machine. Knight: confirm the port/socket path (likely a local HTTP or stdio transport). The rook config (Section 3) will point to the same endpoint as Bishop's librarian-mcp connection, but filtered through the wrapper or the read-only flag.

---

## Section 3 — Antigravity MCP Config Snippet

**Founder: paste this into the Antigravity MCP Tools configuration panel.** Verify field names match what Antigravity shows in its UI — the exact key names may differ from what is shown here.

If Antigravity uses a JSON config file, the shape is likely:

```json
{
  "mcpServers": {
    "rook-bishop-bridge": {
      "command": "node",
      "args": [
        "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\rook-bishop-bridge\\index.js"
      ],
      "env": {}
    },
    "librarian-rook-readonly": {
      "command": "node",
      "args": [
        "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-rook-readonly\\index.js"
      ],
      "env": {}
    }
  }
}
```

**NOTE TO FOUNDER:** The exact path to the rook-bishop-bridge and librarian-rook-readonly server `index.js` files depends on where Knight stages them. Knight will provide the confirmed absolute paths in his Yoke return. The JSON shape above is the Claude Code MCP format (`command` + `args`). Antigravity may use a different format (e.g., a URL if it uses HTTP/SSE transport rather than stdio). Verify against Antigravity's MCP Tools documentation or its existing connected-server entries before pasting.

If Antigravity shows existing connections (e.g., the current librarian-mcp), use those as the format template and match exactly.

---

## Section 4 — Wake-Up Convention for Rook

When Bishop pin-Yokes Rook a task, the Founder pastes the following wake-up text into a fresh Antigravity conversation. Rook's first tool call is `mcp__rook-bishop-bridge__check_messages`.

**Standard Rook wake-up prompt (paste verbatim, fill in the bracketed fields):**

---

You are Rook (Gemini / Google), operating in the Liana Banyan crew. Hard bindings that apply every session:

- Model: Sonnet 4.6 equivalent for your platform. No em-dashes. No Composer 2.5. Gadget-first ALWAYS.
- Brick Wall: when your scope is ratified, proceed without re-asking. Stop and ask only if new scope arises.
- Truth-Always: never assert without current-turn empirical verification. Admit drifts immediately.
- Counsel SETTLED: legal/gain-share counsel questions are closed. Do not reopen.
- No Composer 2.5 (Cursor): do not use it for LB build work.
- use segs (if you dispatch sub-agents: fan them into parallel SEGs, never sequential single sends).

SESSION-OPEN FIRST ACTIONS (do before any substantive response):

1. Call `mcp__rook-bishop-bridge__check_messages` with `for_me: true, include_pinned: true`. Read the pinned task. That is your scope for this session.
2. Call `mcp__librarian__brief_me` with the session task string from the pinned message. Read the canonical numbers and any drift warnings it returns.
3. Read `C:\Users\Administrator\Documents\AntigravityWorkspace\source_snapshot_readonly\canon\STATUTES.md` and `BISHOP_COFFEE_BP078.md`.
4. Parallel-batch read the five Tier-0 bedrock canons (listed in `README_FOR_ROOK.md` in the same directory).
5. THEN begin the pinned task.

When your task is complete, call `mcp__rook-bishop-bridge__send_message` with `to: BISHOP, type: response, content: [your return]` and call `mcp__rook-bishop-bridge__unpin_task` with the pinned message timestamp.

Current BP: [BISHOP FILLS IN: BP078 or current BP at dispatch time]
Pinned task pearl: [BISHOP FILLS IN: pearl ID or short description]

---

**Note on canon snapshot path:** The `source_snapshot_readonly\canon\` path is inside `C:\Users\Administrator\Documents\AntigravityWorkspace\`. Rook's workspace root IS that directory. Rook can reach the canon files via `mcp__rook-bishop-bridge__read_file` with relative paths like `source_snapshot_readonly\canon\STATUTES.md`, or via direct `Read` if Antigravity supports it.

---

## Section 5 — Knight Build Estimate

### Ordered build steps

1. **Locate knight-bishop-bridge source.** Knight already has this codebase. Confirm the path.
2. **Clone to rook-bishop-bridge.** Rename identifiers. Update `package.json` name. Add `list_files`, `read_file`, `write_file` tools scoped to AntigravityWorkspace. Estimated: 2-3 SEG tasks (rename pass, tool additions, test).
3. **Create AntigravityWorkspace bridge directory.** `C:\Users\Administrator\Documents\AntigravityWorkspace\bridge\ROOK_BISHOP_MESSAGES.md` with standard header.
4. **Check librarian-mcp for read-only mode.** One gadget call or source inspection. If it supports a native read-only flag: configure it. If not: scaffold `librarian-rook-readonly` wrapper (allowlist-only proxy). Estimated: 1-4 SEG tasks depending on whether the wrapper is needed.
5. **Confirm Antigravity MCP format.** Knight: check the Antigravity docs or existing MCP Tool config on this machine. Provide Founder with exact confirmed JSON/YAML to paste.
6. **Stage in Cursor workspace.** Both new MCP servers should be runnable from a terminal before Founder connects them in Antigravity.
7. **Return Yoke with confirmed server paths and Antigravity config.**

### Effort estimate

| Step | SEG count | Wall-clock (rough) |
|---|---|---|
| Clone + rename rook-bishop-bridge | 2 SEGs | ~15 min |
| Add AntigravityWorkspace-scoped file tools | 1 SEG | ~10 min |
| librarian read-only check | 1 SEG | ~5 min |
| librarian-rook-readonly wrapper (if needed) | 3-4 SEGs | ~25 min |
| Antigravity format confirm + config snippet | 1 SEG | ~5 min |
| Total (no wrapper needed) | ~4 SEGs | ~35 min |
| Total (wrapper needed) | ~8 SEGs | ~60 min |

### Dependencies

- Knight needs access to the knight-bishop-bridge source. Confirmed: `KNIGHT_BISHOP_MESSAGES.md` lives at `C:\Users\Administrator\Documents\LianaBanyanPlatform\KNIGHT_BISHOP_MESSAGES.md`, so the bridge is in the LianaBanyanPlatform tree.
- librarian-mcp server config path: Knight has this from existing connections.
- Antigravity MCP config format: Knight needs to verify. If Antigravity is a web app, the Chrome MCP may be needed to inspect its settings panel format.

### Risks

- librarian-mcp does not support read-only mode natively (probable). Wrapper required, adding ~25 min.
- Antigravity MCP config format is not publicly documented (possible). Knight may need to inspect the UI or an existing config file on disk.
- Rook (Gemini) may not support MCP tool calls via the Antigravity interface in the same way Claude Code does. Founder should verify that Antigravity's Rook conversations can actually invoke MCP tools before Knight builds. This is the top risk. If Antigravity does not pass MCP tool results to Rook, Layer 2 is blocked and Layer 1 (snapshot reads) remains the only option.

---

## Section 6 — Smoke Test

Once both MCP servers are wired and Antigravity is configured:

**Smoke test steps:**

1. Bishop writes a small test task to the rook bridge: `mcp__knight-bishop-bridge__send_message` or direct file write to `ROOK_BISHOP_MESSAGES.md`. Content: "Rook smoke test. Call `brief_me` and return the current innovation count and BP number."
2. Founder opens a fresh Antigravity Rook conversation. Pastes the standard wake-up prompt with `pin: true` on the test task.
3. Rook calls `mcp__rook-bishop-bridge__check_messages`. Reads the pinned task.
4. Rook calls `mcp__librarian__brief_me` with "smoke test session open".
5. Rook returns: current BP number, innovation count (should be 2,270), and one canon citation from the snapshot.
6. Rook calls `mcp__rook-bishop-bridge__send_message` to=BISHOP with the result and calls `unpin_task`.
7. Bishop reads the return from `ROOK_BISHOP_MESSAGES.md`. Confirms: (a) correct BP number, (b) 2,270 innovations, (c) unpin happened.

**Pass criteria:**
- Rook's tool calls succeed (no MCP connection errors)
- Innovation count matches canonical (2,270)
- Unpin call lands in the bridge file
- Total wall-clock for smoke test under 2 minutes

**Failure modes to watch:**
- Rook cannot call MCP tools (Antigravity does not support it yet)
- librarian returns write-surface tools to Rook (allowlist misconfigured)
- Bridge file path wrong (file not found)
- Rook reads Layer 1 snapshot but reports stale numbers (drift from canon)

---

*Knight: use segs. This spec is Founder-reviewed before dispatch. Confirm Antigravity MCP support before building. Return confirmed server paths and exact Antigravity config JSON in your Yoke return. No em-dashes.*

*— SEG-W (Sonnet 4.6) · BP078 · 2026-06-08*
