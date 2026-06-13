# MNEMOSYNE COME -- Bishop MCP Config Patch
**SEG-MNEMOSYNE-COME / Bishop / BP079 / 2026-06-10**
**Status: STAGED FOR FOUNDER REVIEW -- NOT APPLIED. Founder ratifies before Bishop applies.**

---

## Current Bishop MCP Config

Source: `C:\Users\Administrator\.claude\settings.json` (read 2026-06-10)

Bishop's `settings.json` does NOT contain an `mcpServers` block. The current file structure:

```json
{
  "env": { ... },
  "extraKnownMarketplaces": { ... },
  "hooks": { ... },
  "statusLine": { ... },
  "permissions": { ... },
  "skipWorkflowUsageWarning": true
}
```

**No `mcpServers` key exists anywhere in this file.**

Bishop's active MCPs are injected by the Claude Code harness process host. They are NOT declared in `settings.json`. This means:

1. Bishop cannot enumerate his own MCP list by reading `settings.json`
2. The harness-injected MCPs (librarian, knight-bishop-bridge, etc.) appear as deferred tools in system-reminder but have no config file Bishop can inspect
3. Adding an `mcpServers` block to `settings.json` ADDS additional MCPs -- it does NOT replace the harness-injected ones

**Current harness-injected MCPs (observed this session):**
- `mcp__librarian__*` (the canonical substrate layer -- flakey this session)
- `mcp__knight-bishop-bridge__*` (bridge to Knight -- BROKEN: dead Agora path)
- `mcp__liana-banyan-docs__*` (docs, state unknown)
- `mcp__scheduled-tasks__*` (functional)
- `mcp__ccd_session_mgmt__*` (functional)
- `mcp__ccd_session__*` (functional)
- `mcp__ccd_directory__*` (functional)
- `mcp__mcp-registry__*` (functional)
- `mcp__Claude_Preview__*` (functional)
- `mcp__Claude_in_Chrome__*` (functional)
- `mcp__computer-use__*` (functional via deferred)
- `mcp__visualize__*` (functional)

---

## Proposed Bishop MCP Config Diff

**Action: ADD `mcpServers` block to `~/.claude/settings.json`**

This adds the MnemosyneC MCP server as an ADDITIONAL configured MCP. The harness-injected MCPs remain active until Wave D is confirmed stable, at which point the harness config is updated (a separate step requiring Anthropic Claude Code harness config access -- TODO: confirm with Founder how harness-injected MCPs are controlled).

**Diff:**
```json
// ADD to ~/.claude/settings.json (inside the root object, at same level as "env"):

"mcpServers": {
  "mnemosynec": {
    "command": "node",
    "args": [
      "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\librarian-mcp\\scripts\\mnemosynec-mcp-stdio.mjs"
    ],
    "env": {
      "WORKSPACE_ROOT": "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform",
      "MNEMOSYNEC_CLIENT_ID": "bishop"
    }
  }
}
```

**Result after Wave D apply:** Bishop has BOTH the harness-injected `mcp__librarian__*` AND the new `mcp__mnemosynec__*`. During the transition period, Bishop uses `mcp__mnemosynec__*` tools for all substrate ops and bridge messaging. The harness-injected librarian remains as fallback.

**Wave D+1 deprecation:** After confirming `mcp__mnemosynec__*` is stable (Bishop can brief_me, send_message, check_messages reliably through MnemosyneC), the harness-injected librarian and knight-bishop-bridge are retired. This requires a separate harness config update -- Bishop notes this as a Founder action item.

---

## Migration Plan

Step 1: Wave D ships v0.1.40. Knight deploys `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs`.

Step 2: Founder installs MnemosyneC v0.1.40 on M1 (fresh install, packaged build per SEG-MC-8 evidence).

Step 3: MnemosyneC MCP server starts listening on local named pipe `\\.\pipe\mnemosynec-mcp` at app boot. The Developer tab shows "MCP Server: running" (per progress UX canon -- visible feedback on boot per `feedback_every_click_visible_feedback_canon_bp078`).

Step 4: Founder applies this Bishop config patch: adds the `mcpServers` block above to `~/.claude/settings.json`.

Step 5: Restart Claude Code (Bishop). The new `mcp__mnemosynec__*` tools appear in Bishop's tool list alongside the harness-injected tools.

Step 6: Bishop verifies by calling:
- `mcp__mnemosynec__brief_me` -- should return canonical substrate brief
- `mcp__mnemosynec__send_message` to Knight -- should land as pearl in substrate
- Knight calls `mcp__mnemosynec__check_messages` -- should receive the message
- Both confirm: round-trip works through MnemosyneC substrate

Step 7: Deprecate `mcp__knight-bishop-bridge__*` from the harness config (Founder + Bishop coordinate how to update harness-injected MCPs).

---

## Rollback Plan

If MnemosyneC MCP server has a fatal bug after Wave D apply:

**Immediate rollback (seconds):**
Remove the `mcpServers` block from `~/.claude/settings.json` (undo the diff above). Restart Claude Code. Bishop reverts to harness-injected MCPs only.

**The disk Yoke fallback remains live regardless:**
Bishop's fallback to disk-file Yokes at `BISHOP_DROPZONE\01_KnightPrompts\` never went away. Even with MnemosyneC MCP active, if a tool call fails, Bishop can always write a Yoke file. The floor mode is durable by design.

**Truth-Always note:** The disk Yoke pattern is not the canonical state -- it is a fallback. "As was Foretold" means the substrate becomes PRIMARY, not that the fallback disappears. Keep both paths operational during the transition period.

---

## Truth-Always Concerns (TODOs Knight Must Confirm)

1. **How are harness-injected MCPs controlled?** Bishop cannot find a config file that declares the harness-injected MCPs (librarian, knight-bishop-bridge, etc.). They are injected by the Claude Code process. The deprecation of these MCPs (Step 7) requires knowledge of the harness config mechanism. Founder may need to contact Anthropic support or check the Claude Code docs. **Bishop surfaces this honestly: Bishop does not know how to remove harness-injected MCPs from his own config.**

2. **Cursor MCP config authority.** Knight's `~/.cursor/mcp.json` is verified as the root config. However, per-project overrides may exist at `~/.cursor/projects/<project>/mcp.json`. Knight must confirm which config is authoritative for the LianaBanyanPlatform project session.

3. **Task #15 (Founder auth.users.id UUID).** The HTTP+SSE shared-secret auth uses this UUID. Until Task #15 resolves, SEG-MC-6 uses a dev placeholder. The production auth secret cannot be finalized without this value.

4. **IPC channel list from Electron main process.** Bishop read the `.asar` indirectly via source context and BP session history. The authoritative IPC channel list must come from Knight reading the Electron main process source. SEG-MC-1 depends on this.

5. **Port 11482 availability.** The HTTP+SSE transport uses port 11482. This is a Bishop-proposed default. Knight must verify no existing platform service uses this port before SEG-MC-6 binds to it.

6. **MnemosyneC mesh port number.** The peer mesh port (MESH-6 SID-fetch, per BP067) is referenced but the exact port number was not confirmed in this session. Knight must surface this from the Electron main process source.

---

*STAGED FOR FOUNDER REVIEW. Apply ONLY after Founder ratifies AND Wave D v0.1.40 installs successfully on M1.*
