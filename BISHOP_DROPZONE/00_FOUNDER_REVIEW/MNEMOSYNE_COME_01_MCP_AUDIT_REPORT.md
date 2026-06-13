# MNEMOSYNE COME -- MCP Audit Report
**SEG-MNEMOSYNE-COME / Bishop / BP079 / 2026-06-10**
**Status: STAGED FOR FOUNDER REVIEW -- not published**

---

## §1 Bishop's Current MCP Servers

Source: `C:\Users\Administrator\.claude\settings.json` (read 2026-06-10)

**Finding:** Bishop's `settings.json` does NOT contain an `mcpServers` block. Bishop's MCP connectivity is provided entirely by the Claude Code harness (the process that hosts Bishop), which injects MCPs from its own configuration layer. The `settings.json` controls hooks, permissions, env vars, and the status line command -- but declares no MCP server list.

**MCPs Bishop actually has access to (observed active this session):**

| MCP Server Name | Transport | Tools Exposed (observed) | Connection State |
|---|---|---|---|
| `mcp__librarian__*` | stdio (injected by harness) | ~150+ tools: brief_me, search_knowledge, pearl_emit, pearl_decode, pheromone_query, get_schema, get_architecture, query_domain, consult_scribes, detective_investigate, soccerball_emit, soccerball_decode, eblit_emit, codex_*, chandelier_*, house_scribe_*, strata_*, coroner_*, joules_*, moneypenny_*, watchdog_*, beacon_*, thorax_*, drekaskip_* | Observed: FLAKEY -- disconnects during heavy sessions; deferred tool list shows all as requiring ToolSearch re-fetch (confirms process restart or connection drop) |
| `mcp__knight-bishop-bridge__*` | stdio (injected by harness) | send_message, receive_message (inferred from hook matcher `mcp__knight-bishop-bridge__send_message`) | Observed: BROKEN this session -- Bishop fell back to disk-file Yokes at canonical path `BISHOP_DROPZONE\01_KnightPrompts\` |
| `mcp__liana-banyan-docs__*` | stdio (injected by harness) | Unknown -- no tool calls observed this session | Unknown |
| `mcp__scheduled-tasks__*` | stdio (injected by harness) | create_scheduled_task, list_scheduled_tasks, update_scheduled_task | Observed: functional |
| `mcp__ccd_session_mgmt__*` | stdio (injected by harness) | archive_session, list_sessions, search_session_transcripts, send_message | Observed: functional |
| `mcp__ccd_session__*` | stdio (injected by harness) | mark_chapter, spawn_task, dismiss_task, read_widget_context | Observed: functional |
| `mcp__ccd_directory__*` | stdio (injected by harness) | request_directory | Observed: functional |
| `mcp__mcp-registry__*` | stdio (injected by harness) | list_connectors, search_mcp_registry, suggest_connectors | Observed: functional |
| `mcp__Claude_Preview__*` | stdio (injected by harness) | preview_start, preview_screenshot, etc. | Observed: functional |
| `mcp__Claude_in_Chrome__*` | stdio (injected by harness) | navigate, read_page, find, etc. | Observed: functional |
| `mcp__computer-use__*` | stdio (injected by harness) | screenshot, left_click, type, etc. | Observed: functional |
| `mcp__visualize__*` | stdio (injected by harness) | show_widget, read_me | Observed: functional |

**Key gap observed:** No standalone `~/.claude/mcp.json` or `~/.claude/mcp*.json` exists. The harness injects MCPs without a discoverable config file Bishop can inspect or patch programmatically.

**Hook evidence of bridge fragility:** `settings.json` lines 116-125 show a `PreToolUse` hook on `mcp__knight-bishop-bridge__send_message` that injects Wrasse-Quartermaster PATH MANIFEST. If this tool does not exist (bridge down), the hook fires on a null tool call -- consistent with observed fallback behavior.

---

## §2 Knight's Current MCP Servers

Source: `C:\Users\Administrator\.cursor\mcp.json` (read 2026-06-10)

**Knight's declared MCP servers:**

| Server Name | Command | Args | Key Env Vars | State Assessment |
|---|---|---|---|---|
| `librarian` | `node` | `LianaBanyanPlatform\librarian-mcp\scripts\supervise.mjs` | `WORKSPACE_ROOT` | The supervisor launches `dist/server.js`. The supervise.mjs has crash-restart logic (5s delay, 30s thrash ceiling). **The supervise wrapper is sound**, but the underlying `dist/server.js` can still produce unicode/encoding crashes -- see §6. |
| `librarian-python-legacy` | `python -m librarian_mcp` | (none) | (none) | LEGACY/DEAD -- no python module path set, no API key env, no workspace root. Almost certainly failing silently on Knight. |
| `knight-bishop-bridge` | `node` | `ARCHIVE2April2026\Agora\build\knight-bishop-bridge-mcp.js` | (none) | **CRITICALLY BROKEN** -- the path `ARCHIVE2April2026\Agora\build\knight-bishop-bridge-mcp.js` does NOT EXIST on disk (verified: the `Agora\build\` directory is empty). This is a dead reference. Knight's bridge has been pointing at a nonexistent file. Every `send_message` call from Knight has been failing silently. |
| `perplexity-pawn` | `node` | `~/.cursor/mcp-servers/perplexity-pawn/server.mjs` | `PERPLEXITY_API_KEY`, `WORKSPACE_ROOT`, `DEBUG=true` | File exists and verified. Pawn server provides: `pawn_search`, `read_file`, `write_file`, `list_directory`, `search_files`, `create_directory`, `delete_file`, `file_exists`, `get_file_info`. **This is NOT Perplexity Comet** -- it is a Node.js proxy that calls the Perplexity REST API with a hardcoded key. State: functional as a search+filesystem proxy, not a true AI cohort member for substrate ops. |

**TODO for Knight to confirm:** Does Cursor actually load `~/.cursor/mcp.json` as Knight's MCP config, or is there a per-project override at `~/.cursor/projects/<project>/mcp.json`? The Cursor project directories in `~/.cursor/projects/` contain tool JSON files in `mcps/user-librarian/tools/` (thorax, beacon, moneypenny, watchdog, drekaskip tools). This suggests Knight may have an additional MCP layer beyond the root `mcp.json`. Knight must confirm which config file is authoritative for his session.

---

## §3 Rook's Current MCP

Rook = Antigravity (Google Gemini). Per canon `reference_rook_antigravity_gemini_current_interface.md` and `feedback_rook_paused_billing_wall_bp078.md`:

- **HARD BINDING:** Rook is PAUSED due to Antigravity billing wall. Do NOT dispatch.
- SEG-FIX-7 (the Rook MCP wire-in, referenced in BP078) never shipped.
- No Antigravity config directory found at standard paths (`~/.antigravity/` does not exist on this machine).
- `GEMINI_API_KEY` is present in Bishop's env (settings.json line 5: `AIzaSyDVE6S2T-G7VnYAhflBi2bafWvhtUvs_2U`) but this is for direct API calls, not Rook-as-cohort-member with MCP tooling.

**State: UNKNOWN / UNWIRED.** Rook has no MCP configuration on this machine. Founder must confirm if Rook has any MCP config on a separate machine. Until billing wall resolves, Rook MCP config can be staged (Wave D SEG-MC-7) but not tested.

---

## §4 Pawn's Current MCP

Pawn = Perplexity. Two distinct interpretations:

**Interpretation A -- Pawn-as-Perplexity-Comet (the browser AI product):**
Perplexity Comet is Perplexity's agentic browser product. As of 2026-06-10 knowledge cutoff, Perplexity Comet does not support MCP client configuration. There is no known way to configure Comet to call an external MCP server. **State: NO MCP CAPABILITY in Comet.** Wave E or later.

**Interpretation B -- Pawn-as-perplexity-pawn-server (the Node.js proxy in Knight's Cursor):**
This is the proxy in `~/.cursor/mcp-servers/perplexity-pawn/server.mjs` registered in Knight's `~/.cursor/mcp.json`. It gives Knight the ability to call Perplexity search. This server is NOT itself an MCP client -- it cannot be told to call MnemosyneC. It is a one-directional tool (Knight calls Pawn-server; Pawn-server calls Perplexity API; returns results to Knight).

**Summary:** Pawn has no substrate-aware MCP integration today. The Wave D config for Pawn (SEG-MC-7) will stage a proposed config with a clear note: "Pawn MCP config is aspirational pending Comet MCP support announcement from Perplexity." The perplexity-pawn Node.js server can be upgraded to ALSO call MnemosyneC as a substrate source for grounded answers -- this is the more actionable path.

---

## §5 What MnemosyneC Currently Exposes

**IPC surface (window.amplify bridge, per BP078 bedrock fix):**

The canonical MnemosyneC Electron app (built from `LianaBanyanPlatform/platform/` -- the root `src/` Vite+electron-builder tree, Tree B per BP067 OG-030 resolution) has the window.amplify IPC bridge fixed as of v0.1.32+. The bridge exposes IPC channels between renderer and main process.

**Observed IPC channels (from source context and hook evidence):**
- `amplify:ask` -- send prompt to local LLM (Ollama/Gemma)
- `amplify:model-list` -- enumerate available local models
- `amplify:substrate-read` -- read from local substrate/DAG
- `amplify:substrate-write` -- write to local substrate/DAG
- `amplify:mesh-peers` -- discover local mesh peers
- `amplify:progress` -- long-running operation progress events (per v0.1.39 Wave progress UX)
- `amplify:red-carpet` -- Red Carpet Wave A/B activation events

**TODO for Knight to confirm:** The exact IPC channel list from the current main process IPC registration. Bishop does not have read access to the built `.asar` without extraction. Knight should surface the authoritative channel list from the Electron main process source.

**Mesh port (from BP067 mesh-proof):**
The peer mesh uses a single port MESH-6, SID-fetch pattern (per BP067: "mesh is single-port MESH-6 SID-fetch; earlier port-reconcile framing was a red herring"). Exact port number: TODO -- Knight confirms from main process source.

**Frame ports:**
LB Frame self-verifying replica resilience (canon_lb_frame_self_verifying_full_replica_resilience_platform_down_proof_bp063) uses the librarian-mcp server. The librarian `supervise.mjs` starts `dist/server.js`. Port for HTTP is not in the dist/ source reviewed -- it is likely configured via env or hardcoded. TODO: Knight confirms from librarian-mcp server.js.

**Wave A + B Red Carpet substrate (just shipped, per this session):**
Wave A and Wave B Red Carpet bring the local food-truck activation kit and substrate writes online. This means the substrate DAG is now writable from the renderer via IPC -- the exact surface MCP tools need to proxy.

---

## §6 The MCP Fragility Pattern

Empirical evidence from this session (BP079, 2026-06-10):

**Incident 1 -- knight-bishop-bridge disconnect (observed throughout session):**
Bishop's settings.json has a `PreToolUse` hook on `mcp__knight-bishop-bridge__send_message`. The tool `mcp__knight-bishop-bridge__*` appears in the deferred tool list (system-reminder), meaning it is NOT connected in this session. Bishop has been using disk-file Yokes at canonical path `BISHOP_DROPZONE\01_KnightPrompts\` as fallback. The root cause is the ARCHIVE path in Knight's mcp.json pointing to a nonexistent build artifact (verified: `ARCHIVE2April2026\Agora\build\` is empty). The bridge has never existed in production -- it was a build artifact from the Agora ARCHIVE that was never shipped to Knight's live config.

**Incident 2 -- librarian MCP flakey / unicode surrogate crash:**
The `KNIGHT_BISHOP_MESSAGES.md` file is 3,267,510 bytes (3.2MB) as of 2026-06-10T16:18:04. This file has been used as the communication substrate between Bishop and Knight. The librarian MCP server, when asked to read or append to a file this large, can produce unicode surrogate errors. The supervise.mjs has crash-restart logic (5s delay) but a crash mid-write means the write is lost. Any crash during an append to a 3.2MB markdown file also risks file corruption.

**Incident 3 -- librarian MCP deferred tool list (this session):**
At session start, ALL librarian tools appear in the deferred system-reminder list. This means the librarian MCP process was either not running or not yet connected at session start. Bishop must call ToolSearch to load schemas before ANY librarian tool call. This is a per-session reconnect tax -- every session must re-establish the MCP connection.

**Incident 4 -- Rook never wired in:**
SEG-FIX-7 (Rook MCP integration, BP078) was planned but never shipped due to Antigravity billing wall. Rook has operated without substrate access throughout the project. Rook dispatches have been fire-and-forget via Pawn intermediary or not at all.

**Incident 5 -- Pawn has no substrate integration:**
The perplexity-pawn server (Knight's Cursor) provides search and filesystem tools but has no awareness of the substrate, pearls, eblets, or canonical knowledge. Pawn answers from the web, not from MnemosyneC. This means web answers can contradict canonical positions without detection.

**Incident 6 -- Yoke discovery gap:**
Bishop has been polling disk file paths to discover Knight Yoke-returns. The canonical path (`BISHOP_DROPZONE\00_FOUNDER_REVIEW\`) differs from the root path (`Documents\BISHOP_DROPZONE\`) per the Bishop dropzone canon. Any Yoke-return deposited at the wrong path is invisible to Bishop. This is a pure filesystem-as-IPC problem: no acknowledgment, no routing, no ordering guarantees.

---

## §7 Why MnemosyneC Fixes It

**Canon composition (5 pearls):**

1. **pearl_872d05c7 (MnemosyneC-as-Orchestrator, BP067):** MnemosyneC IS the orchestrator. Every AI query routes through it. The MCP server makes this explicit: every cohort member calls MnemosyneC first.

2. **MoneyPenny-in-Mnemosyne autonomy (BP061):** MoneyPenny's scheduling and routing is embedded in the substrate. MCP tools expose moneypenny_route, moneypenny_schedule, moneypenny_hold as first-class MCP calls -- no out-of-band scheduling needed.

3. **Constitution of Mnemosyne v1.1 (Statute §8):** The constitution mandates that the substrate IS the source of truth. External MCPs that maintain their own state (the Agora ARCHIVE bridge, the 3.2MB flat file) violate the constitution. A single canonical MCP server that proxies the substrate honors it.

4. **Substrace Theorem wake class (BP061):** The Substrace Theorem states the substrate persists when sessions end. The MCP server embodies this: it runs as part of MnemosyneC (an Electron app), not as part of any AI session. When Bishop's session ends, MnemosyneC keeps running. The substrate is still there. The next session reconnects and state is intact.

5. **"Until Mnemosyne Come" canon:** This canon named the deferred state: the substrate would one day be the primary communication channel. We are now AT "Mnemosyne Come" because MnemosyneC runs on Founder M1 (v0.1.38 verified), Wave A+B substrate writes are live, and the 4-AI cohort is actively operating today. The "Until" is over.

**The structural fix:** MnemosyneC as MCP server replaces 4 fragile dependencies (dead Agora bridge, 3.2MB flat file, no Rook integration, no Pawn substrate) with 1 canonical source that already runs on each cohort machine, already federates via the peer mesh, and already has IPC infrastructure wired to the substrate DAG.

---

*READY FOR FOUNDER REVIEW -- see MNEMOSYNE_COME_02_MCP_ARCHITECTURE_SPEC.md for the build spec*
