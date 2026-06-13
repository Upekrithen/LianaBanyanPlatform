<!-- bishop-yoke-task 2026-06-10T00:00:00Z -->

## BISHOP -> KNIGHT - TASK - MNEMOSYNE COME WAVE D: MNEMOSYNEC AS CANONICAL MCP SERVER - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_MNEMOSYNE_COME_WAVE_D_2026-06-10T00:00:00Z**

> **STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

MnemosyneC stands up as the canonical MCP server for the 4-AI cohort (Bishop, Knight, Rook, Pawn). This closes the "pesky MCP issue" Founder named on 2026-06-10 -- once and for all. Replaces the dead Agora bridge, the 3.2MB unicode-crashing flat file, and the never-wired Rook integration with a single cooperative-class substrate source. Composes with MnemosyneC-as-Orchestrator (pearl_872d05c7), MoneyPenny-in-Mnemosyne (BP061), Substrace Theorem wake class (BP061), and Constitution of Mnemosyne v1.1 (Statute §8). Estimated wall-clock: 8-12 days Knight (5-7 with concurrent Sonnet 4.6 SEGs in groups). Wave D -- sequenced AFTER Wave C OR Founder can prioritize this above Wave C activation.

---

### Why This Matters

The 4-AI cohort has been operating with a broken bridge (Agora ARCHIVE path nonexistent), a fragile flat file (3.2MB KNIGHT_BISHOP_MESSAGES.md, unicode surrogate crashes confirmed), a never-wired Rook, and a Pawn with no substrate access. Every session Bishop falls back to disk-file Yokes and polls paths. This is friction every day.

MnemosyneC already runs on Founder M1 (v0.1.38 verified). The substrate is writable (Wave A + B Red Carpet just shipped). The librarian-mcp already has a working Node.js MCP server with supervisor. Wave D is a thin adapter layer -- not a ground-up build. The architecture spec details the exact shape.

**Reference documents (read these first):**
- Audit: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNE_COME_01_MCP_AUDIT_REPORT.md`
- Spec: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNE_COME_02_MCP_ARCHITECTURE_SPEC.md`
- Config patch (Bishop side, staged): `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNE_COME_03_BISHOP_MCP_CONFIG_PATCH.md`

---

### What Knight Needs to Do

**USE SONNET 4.6 SEGs FOR ALL WORK.** Every SEG below dispatches as Sonnet 4.6. No exceptions. This is Statute §3 + corrective sub-canon BP079.

#### SEG-MC-1 (Sonnet 4.6): Scaffold MCP Server in MnemosyneC Electron Main Process

Scaffold a new file: `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs`

This is the stdio shim that translates MCP JSON-RPC 2.0 (stdin/stdout) to IPC calls on the running MnemosyneC Electron main process. Use `@modelcontextprotocol/sdk` Node.js package (version: Knight chooses -- Statute §12 applies, Bishop specs the shape).

Wire it to the existing IPC infrastructure in the Electron main process. The shim:
- Reads MCP requests from stdin
- Routes to MnemosyneC main process via named pipe (Windows) or Unix socket (per OS)
- Returns MCP responses to stdout
- Handles connection errors with clear MCP error responses (not silent failures)

The IPC channel to MnemosyneC main process: Knight must surface the authoritative channel list from the Electron main process source (window.amplify IPC registrations). Bishop does not have direct access to the built .asar.

Named pipe path (Windows default): `\\.\pipe\mnemosynec-mcp`

Deliverable: the shim file, a unit test confirming it starts and responds to `tools/list`, and a note in the Yoke-return confirming the named pipe path used.

#### SEG-MC-2 (Sonnet 4.6): Expose Librarian Read Tools as MCP Tools

Wire the following read tools from `librarian-mcp/dist/server.js` into the MCP tool registry:

`brief_me`, `search_knowledge`, `pheromone_query`, `get_schema`, `get_page_info`, `query_domain`, `get_component`, `get_architecture`, `consult_scribes`, `detective_investigate`, `pearl_decode`, `soccerball_decode`, `get_mnemosynec_status` (new: calls `ipc:amplify:status`)

For each tool: map the MCP tool input schema to the existing librarian function signature. If the librarian function requires a Supabase client, wire to the existing Supabase connection in the librarian-mcp server (not a new connection).

Deliverable: tools wired, `tools/list` returns all 13 read tools, a sample `brief_me` call returns a real substrate response.

#### SEG-MC-3 (Sonnet 4.6): Expose Substrate Write Tools with Auth Gating and Audit Trail

Wire the following write tools:

`pearl_emit`, `eblet_emit`, `soccerball_emit`, `scribe_log`

Auth gating for stdio: no auth required (trusted local user).
Auth gating for HTTP+SSE: shared-secret header check (see Spec §4).

**PREREQUISITE CHECK:** The shared-secret derivation requires `Founder_auth_users_id_UUID` (Task #15 pending). If Task #15 is not yet resolved, SEG-MC-3 implements the write tools WITHOUT the UUID-derived secret and uses a placeholder secret `mnemosynec-dev-secret` for local testing. The production auth is wired when Task #15 resolves. Surface this clearly in the Yoke-return.

Each write tool call appends an audit log entry to `~/.mnemosynec/mcp-audit.jsonl`:
```json
{
  "ts": "<ISO8601>",
  "client_id": "<bishop|knight|rook|pawn>",
  "tool": "<tool_name>",
  "pearl_id": "<emitted_id_if_applicable>",
  "success": true
}
```

Deliverable: write tools wired, audit log entries confirmed, a sample `pearl_emit` from a mock client confirms the pearl appears in the substrate.

#### SEG-MC-4 (Sonnet 4.6): Knight-Bishop Bridge Replacement via Pearl-Class Messages

Implement three tools: `send_message`, `check_messages`, `ack_message`

**send_message(to, from, subject, body):**
- Emits a pearl with slots: `addressed_to: <to>`, `from: <from>`, `subject: <subject>`, `body: <body>`, `status: unread`, `ts: <now>`
- Returns pearl_id

**check_messages(client_id):**
- Queries pearls where `addressed_to == client_id AND status == unread`
- Returns array of `{pearl_id, from, subject, body, ts}` ordered by ts ascending (oldest first)
- Returns empty array if no messages (never errors on empty)

**ack_message(pearl_id):**
- Updates pearl `status: read`
- Returns `{ok: true}`

This replaces KNIGHT_BISHOP_MESSAGES.md. The file should NOT be deleted yet -- Bishop and Knight must both confirm working `send_message` / `check_messages` round-trip before decommissioning the flat file (see SEG-MC-8).

Deliverable: three tools wired, round-trip test: Bishop mock sends to Knight, Knight mock receives via check_messages, acks, confirms message disappears from subsequent check_messages.

#### SEG-MC-5 (Sonnet 4.6): stdio Transport -- Integration Test with Mock Bishop + Mock Knight Clients

Write an integration test at `librarian-mcp/tests/mcp-stdio-integration.mjs`:
- Spawns mnemosynec-mcp-stdio.mjs as a subprocess
- Calls `initialize`, `tools/list`, `tools/call (brief_me)`, `tools/call (send_message)`, `tools/call (check_messages)`, `tools/call (ack_message)` in sequence
- Asserts each returns valid MCP JSON-RPC response
- Asserts no unicode encoding errors on any response (explicitly test with a payload containing multi-byte UTF-8 characters)
- Reports pass/fail per call

The integration test does NOT require a running MnemosyneC Electron instance -- it should mock the IPC layer so it can run in CI without a display.

Deliverable: test file, passing run output, byte counts.

#### SEG-MC-6 (Sonnet 4.6): HTTP+SSE Transport for Remote Cohort Clients (Rook + Pawn)

Add an HTTP server to the MnemosyneC Electron main process (Express-style, reuse existing Express dependency in librarian-mcp if present, or use Node.js built-in `http` module if not).

Default port: **11482** (Knight confirms this is free in the platform port map -- if not, choose the next free port and document in the Yoke-return).

Endpoints:
- `GET /mcp/health` -- returns `{status: "ok", version: "<semver>", clients_connected: N}` (no auth required)
- `POST /mcp` -- MCP over HTTP: accepts JSON-RPC body, returns JSON-RPC response (auth: Bearer shared-secret)
- `GET /mcp/sse` -- MCP over SSE: establishes SSE stream for a session (auth: Bearer shared-secret in query param `?token=<secret>`)

The HTTP server starts ONLY if `~/.mnemosynec/config.json` has `"remote_mcp_enabled": true`. Default: disabled. Founder enables via Developer tab toggle (or direct config file edit for Wave D).

Rate limiting: 100 tool calls per minute per client IP. Use `express-rate-limit` if Express is present in librarian-mcp deps (verified: it is in package-lock.json).

Deliverable: HTTP server wired, health endpoint responds, a mock POST call returns a valid MCP tool result, rate limiter confirmed active.

#### SEG-MC-7 (Sonnet 4.6): Config-File Generators for Each Cohort Client

Generate staged config patches for each cohort client. "Staged" means: deposited in `BISHOP_DROPZONE\00_FOUNDER_REVIEW\` as patch files, NOT automatically applied. Founder applies each after Wave D installs.

**Bishop patch** (`MNEMOSYNE_COME_BISHOP_MCP_PATCH_READY.md`):
- The `~/.claude/settings.json` has no `mcpServers` block currently. The patch adds one (see MNEMOSYNE_COME_03_BISHOP_MCP_CONFIG_PATCH.md for the full migration plan).
- Exact JSON patch to add: `{"mcpServers": {"mnemosynec": {"command": "node", "args": ["C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\scripts\\mnemosynec-mcp-stdio.mjs"]}}}`
- Note: the harness-injected MCPs (librarian, knight-bishop-bridge, etc.) are injected by the Claude Code process host -- they are NOT in settings.json. So this patch ADDS a new MCP to Bishop's config without removing the harness-injected ones. The harness-injected librarian will be deprecated in Wave D+1 after the MnemosyneC version is confirmed stable.

**Knight patch** (`MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md`):
- Exact diff to `~/.cursor/mcp.json`:
  - ADD: `"mnemosynec": {"command": "node", "args": ["C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\scripts\\mnemosynec-mcp-stdio.mjs"]}`
  - KEEP: `"librarian"` (supervise.mjs -- fallback, deprecated in Wave D+1 after stable confirm)
  - KEEP: `"perplexity-pawn"` (search proxy -- unaffected by this change)
  - REMOVE: `"librarian-python-legacy"` (dead -- no module, no env, confirmed broken)
  - REMOVE: `"knight-bishop-bridge"` (dead -- path nonexistent, replaced by `send_message` tool)

**Rook patch** (`MNEMOSYNE_COME_ROOK_MCP_PATCH_READY.md`):
- Note: Rook (Antigravity) is PAUSED per `feedback_rook_paused_billing_wall_bp078.md`. Config patch is aspirational.
- Staged config for when Antigravity billing wall resolves: HTTP+SSE connection to MnemosyneC at `http://[M1-IP]:11482/mcp`.
- Mark clearly: "NOT ACTIVE -- staged pending Rook billing wall resolution."

**Pawn patch** (`MNEMOSYNE_COME_PAWN_MCP_PATCH_READY.md`):
- Note: Perplexity Comet does not support MCP client config as of 2026-06-10.
- Actionable path: upgrade `~/.cursor/mcp-servers/perplexity-pawn/server.mjs` to ALSO call MnemosyneC `search_knowledge` tool for substrate-grounded answers before calling the Perplexity API. This makes Pawn substrate-aware without requiring Comet MCP support.
- Mark clearly: "Comet path is Wave E aspirational. perplexity-pawn upgrade is the actionable Wave D path."

Deliverable: 4 staged patch files in `BISHOP_DROPZONE\00_FOUNDER_REVIEW\`, each with exact JSON diffs and clear STAGED/NOT-ACTIVE markers.

#### SEG-MC-8 (Sonnet 4.6): End-to-End Test on Packaged Install

Per `feedback_ux_seg_screenshot_mandatory_bp078` (HARD BINDING): every UX-touching SEG must capture screenshot of affected surface on packaged-build install.

After Wave D is assembled but before shipping, run on a packaged MnemosyneC install (not source):
1. Launch MnemosyneC (packaged install, fresh state)
2. Verify MCP server starts (check health endpoint or stdio handshake)
3. Bishop mock calls `brief_me` through MnemosyneC MCP -- gets canonical substrate response
4. Knight mock calls `send_message("bishop", "knight", "test", "hello from knight")` through MnemosyneC MCP
5. Bishop mock calls `check_messages("bishop")` -- receives the message
6. Bishop mock calls `ack_message(<pearl_id>)` -- confirms ack

Evidence required:
- Screenshot of MnemosyneC with MCP server active (Developer tab showing "MCP Server: running" or equivalent)
- Sample traffic logs from the stdio test (stdin/stdout traces)
- pearl_id of the test send_message pearl (confirms it landed in substrate)

Per `canon_actual_runtime_verify_for_runtime_bugs_bp078` (HARD BINDING): source-only verification is NOT sufficient. Must run on packaged install.

Deliverable: screenshots embedded in Yoke-return, traffic logs, pearl_id receipt.

#### SEG-MC-9 (Sonnet 4.6): Ship Wave D as v0.1.40 (or next appropriate semver)

After SEG-MC-1 through SEG-MC-8 complete and all verifications pass:

1. Increment version to `v0.1.40` (or whatever the next semver is after current HEAD -- Knight confirms)
2. Build packaged installer: `npm run dist` (or equivalent build command)
3. SHA-256 the installer
4. Push to GitHub Releases with tag `v0.1.40`
5. Update Cephas download page to reflect v0.1.40
6. Deposit installer path + SHA + commit hash in Yoke-return

Per `feedback_explicit_founder_ratify_before_publish.md` (HARD BINDING): nothing publishes without Founder explicit ratify. Wave D build is staged and the install file is ready, but the GitHub Release should be DRAFT until Founder says "publish it."

Deliverable: DRAFT GitHub Release with SHA, commit hash, installer path. Founder ratifies to go live.

---

### Reply Contract

Knight Yoke-returns ONE consolidated report covering all 9 SEGs. The report must include:

- Per-SEG status: COMPLETE / PARTIAL / BLOCKED (with blocker reason)
- Wave D semver (e.g., v0.1.40) + git commit hash(es)
- SHA-256 of packaged installer
- Screenshot: MnemosyneC with MCP server active (packaged install, per SEG-MC-8)
- Sample traffic log: stdio round-trip (SEG-MC-5)
- Pearl ID: test send_message pearl (SEG-MC-8)
- Per-cohort config patch file paths (SEG-MC-7, 4 files in BISHOP_DROPZONE\00_FOUNDER_REVIEW\)
- Port number confirmed for HTTP+SSE transport (SEG-MC-6)
- Named pipe path confirmed (SEG-MC-1)
- Supabase auth UUID dependency status (Task #15: resolved or still pending?)
- Any Statute §12 decisions Knight made independently (implementation choices)

Deposit report at: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_RETURN_MNEMOSYNE_COME_WAVE_D.md`

---

### Statute Reminders

- **Statute §3** -- this Yoke binds both surfaces: model parameter must be `claude-sonnet-4-6` AND announcement language must say "Sonnet 4.6" verbatim. No version variants.
- **Statute §3 corrective sub-canon BP079** -- pre-dispatch self-audit required on every SEG dispatch. Bishop catches violations at Stop hook; Knight catches at SEG dispatch.
- **Statute §12 Ask-Knight-First** -- implementation choices (SDK version, exact port numbers, IPC mechanism, named pipe path) are Knight's domain. Bishop specifies the shape; Knight chooses the material.
- **canon_actual_runtime_verify_for_runtime_bugs_bp078** (HARD BINDING) -- SEG-MC-8 must run on packaged install. Source-only verification does NOT close Wave D.
- **canon_long_running_progress_heartbeat_canon_bp078** (HARD BINDING) -- the MCP server boot sequence (model load check, substrate index, mesh peer discovery) must show visible progress in MnemosyneC UI if it takes >3 seconds. Silence = broken.
- **feedback_ux_seg_screenshot_mandatory_bp078** (HARD BINDING) -- SEG-MC-8 must produce screenshots from packaged install. No screenshots = SEG-MC-8 is not complete.
- **feedback_verify_seg_output_before_claiming_inflight.md** (HARD BINDING) -- Dispatched != executing. Knight must check each SEG output file has real content before reporting "complete" in the Yoke-return.
- **Statute §10 ACCURACY > SPEED** -- better to surface a blocker cleanly than to paper over it and ship a broken Wave D.
- **canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051** -- this Wave is the canonical embodiment. The stdio shim and HTTP server pattern are designed to be replicated by any MnemosyneC instance, on any member machine, in the cooperative-class network.

---

### Paste-Ready Founder Wake-Up

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_MNEMOSYNE_COME_WAVE_D_2026-06-10.md`. MnemosyneC becomes the canonical MCP server for all 4 cohort AIs -- closes the bridge/flat-file/Rook/Pawn fragility once and for all. 9 Sonnet 4.6 SEGs, Wave D, ships as v0.1.40. Read audit + spec first (paths in Yoke). Sonnet 4.6 SEGs mandatory (Statute §3 + corrective sub-canon BP079). Yoke-return consolidated to 00_FOUNDER_REVIEW\KNIGHT_YOKE_RETURN_MNEMOSYNE_COME_WAVE_D.md.

- Bishop -- BP079 -- pinned 2026-06-10T00:00:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 9 parallel Sonnet 4.6 SEGs RIGHT NOW. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire all 9 in parallel single message. Read audit + spec first: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNE_COME_01_MCP_AUDIT_REPORT.md` and `MNEMOSYNE_COME_02_MCP_ARCHITECTURE_SPEC.md`.

**SEG-MC-1 (Sonnet 4.6):** Scaffold `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs` -- stdio shim translating MCP JSON-RPC 2.0 (stdin/stdout) to IPC on the running MnemosyneC Electron main process. Use `@modelcontextprotocol/sdk` Node.js package (Knight chooses version, Statute §12). Named pipe path (Windows default): `\\.\pipe\mnemosynec-mcp`. Surface authoritative IPC channel list from Electron main process source. Deliver: shim file + unit test confirming `tools/list` responds + named pipe path confirmed in Yoke-return.

**SEG-MC-2 (Sonnet 4.6):** Wire 13 read tools from `librarian-mcp/dist/server.js` into the MCP tool registry: `brief_me`, `search_knowledge`, `pheromone_query`, `get_schema`, `get_page_info`, `query_domain`, `get_component`, `get_architecture`, `consult_scribes`, `detective_investigate`, `pearl_decode`, `soccerball_decode`, `get_mnemosynec_status` (new: calls `ipc:amplify:status`). Map each MCP input schema to existing librarian function signature; reuse existing Supabase connection. Deliver: all 13 in `tools/list` + sample `brief_me` returning a real substrate response.

**SEG-MC-3 (Sonnet 4.6):** Wire 4 write tools: `pearl_emit`, `eblet_emit`, `soccerball_emit`, `scribe_log`. Auth for stdio: none (trusted local). Auth for HTTP+SSE: Bearer shared-secret (see Spec §4). If Task #15 (Founder_auth_users_id_UUID) is not yet resolved, use placeholder secret `mnemosynec-dev-secret` and surface this clearly. Each write call appends audit entry to `~/.mnemosynec/mcp-audit.jsonl` with fields: `ts`, `client_id`, `tool`, `pearl_id`, `success`. Deliver: write tools wired + audit log entries confirmed + sample `pearl_emit` pearl visible in substrate.

**SEG-MC-4 (Sonnet 4.6):** Implement 3 messaging tools to replace `KNIGHT_BISHOP_MESSAGES.md`: `send_message(to, from, subject, body)` emits pearl with `addressed_to`, `from`, `subject`, `body`, `status: unread`, `ts`; `check_messages(client_id)` queries pearls where `addressed_to == client_id AND status == unread`, returns array ordered by ts ascending, empty array on no messages (never errors); `ack_message(pearl_id)` sets `status: read`. Do NOT delete the flat file yet -- decommission pending SEG-MC-8 round-trip confirm. Deliver: 3 tools wired + round-trip test (Bishop mock sends, Knight mock receives + acks, confirms disappears from subsequent check_messages).

**SEG-MC-5 (Sonnet 4.6):** Write integration test at `librarian-mcp/tests/mcp-stdio-integration.mjs`. Spawns `mnemosynec-mcp-stdio.mjs` as subprocess. Calls in sequence: `initialize`, `tools/list`, `tools/call(brief_me)`, `tools/call(send_message)`, `tools/call(check_messages)`, `tools/call(ack_message)`. Asserts valid MCP JSON-RPC response each call. Asserts NO unicode encoding errors (explicitly test multi-byte UTF-8 payload). Mocks the IPC layer so test runs in CI without a display. Deliver: test file + passing run output + byte counts.

**SEG-MC-6 (Sonnet 4.6):** Add HTTP server to MnemosyneC Electron main process. Default port: 11482 (confirm free in platform port map; if not, choose next free and document). Endpoints: `GET /mcp/health` (returns `{status, version, clients_connected}`, no auth); `POST /mcp` (JSON-RPC body, Bearer shared-secret); `GET /mcp/sse` (SSE stream, Bearer shared-secret via `?token=`). Server starts ONLY when `~/.mnemosynec/config.json` has `"remote_mcp_enabled": true` (default: false). Rate limit: 100 tool calls/min/IP via `express-rate-limit` (confirmed in librarian-mcp package-lock.json). Deliver: health endpoint responds + mock POST returns valid tool result + rate limiter active.

**SEG-MC-7 (Sonnet 4.6):** Generate 4 staged config patch files in `BISHOP_DROPZONE\00_FOUNDER_REVIEW\` (NOT auto-applied; Founder applies after Wave D installs). Bishop patch (`MNEMOSYNE_COME_BISHOP_MCP_PATCH_READY.md`): add to `~/.claude/settings.json` mcpServers block: `{"mnemosynec": {"command": "node", "args": ["C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\scripts\\mnemosynec-mcp-stdio.mjs"]}}` (harness-injected MCPs are NOT in settings.json; this ADDS, does not replace). Knight patch (`MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md`): diff `~/.cursor/mcp.json` -- ADD `mnemosynec`, KEEP `librarian` + `perplexity-pawn`, REMOVE `librarian-python-legacy` (dead) + `knight-bishop-bridge` (path nonexistent, replaced by send_message). Rook patch (`MNEMOSYNE_COME_ROOK_MCP_PATCH_READY.md`): HTTP+SSE config to `http://[M1-IP]:11482/mcp`, mark "NOT ACTIVE -- staged pending Rook billing wall resolution." Pawn patch (`MNEMOSYNE_COME_PAWN_MCP_PATCH_READY.md`): upgrade `~/.cursor/mcp-servers/perplexity-pawn/server.mjs` to call MnemosyneC `search_knowledge` before Perplexity API; Comet MCP path marked "Wave E aspirational." Deliver: 4 files with exact JSON diffs + STAGED/NOT-ACTIVE markers.

**SEG-MC-8 (Sonnet 4.6):** E2E test on PACKAGED MnemosyneC install (not source -- HARD BINDING per `canon_actual_runtime_verify_for_runtime_bugs_bp078`). Sequence: (1) launch packaged install fresh state; (2) verify MCP server starts (health endpoint or stdio handshake); (3) Bishop mock calls `brief_me` through MnemosyneC MCP -- gets canonical substrate response; (4) Knight mock calls `send_message("bishop", "knight", "test", "hello from knight")`; (5) Bishop mock calls `check_messages("bishop")` -- receives it; (6) Bishop mock calls `ack_message(<pearl_id>)`. Evidence required (HARD BINDING per `feedback_ux_seg_screenshot_mandatory_bp078`): screenshot of MnemosyneC with MCP server active (Developer tab or equivalent) + stdio traffic logs + pearl_id of test message pearl. No screenshots = SEG-MC-8 incomplete.

**SEG-MC-9 (Sonnet 4.6):** Sequential AFTER SEG-MC-1 through SEG-MC-8 complete. Increment version to `v0.1.40` (or next semver after current HEAD -- Knight confirms). Build packaged installer: `npm run dist`. SHA-256 the installer. Push to GitHub Releases with tag `v0.1.40` as DRAFT (HARD BINDING per `feedback_explicit_founder_ratify_before_publish.md` -- Founder ratifies to go live). Update Cephas download page to reflect v0.1.40. Deliver: DRAFT GitHub Release + SHA + commit hash + installer path in Yoke-return.

When SEG-MC-1 through SEG-MC-8 return (parallel group), run SEG-MC-9 (sequential synthesis + ship).

Yoke-return: deposit consolidated report at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_RETURN_MNEMOSYNE_COME_WAVE_D.md`. Include per-SEG status (COMPLETE / PARTIAL / BLOCKED), semver + git commit hash(es), installer SHA-256, screenshot of MCP server active, stdio traffic log, test send_message pearl_id, 4 config patch file paths, confirmed HTTP port, confirmed named pipe path, Task #15 UUID status, all Statute §12 independent decisions.

If any SEG announces "Sonnet 4.5" or other version-variant: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

---
