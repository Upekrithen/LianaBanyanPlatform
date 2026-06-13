# MNEMOSYNE COME -- MnemosyneC-as-MCP-Server Architecture Spec
**SEG-MNEMOSYNE-COME / Bishop / BP079 / 2026-06-10**
**Status: STAGED FOR FOUNDER REVIEW -- not published**

---

## §1 The 30-Second Pitch

MnemosyneC exposes the cooperative-class substrate as an MCP server. Each cohort AI (Bishop, Knight, Rook, Pawn) configures its MCP client to talk to the LOCAL MnemosyneC instance. No external MCP dependency. Substrate IS the source of truth. Mesh federation makes cross-machine writes durable. As was Foretold.

The Agora ARCHIVE bridge is dead (path nonexistent). The 3.2MB flat file crashes on unicode. Rook was never wired. Pawn has no substrate. One canonical fix closes all four gaps simultaneously: MnemosyneC listens for MCP calls, proxies them to the substrate, and responds. Every cohort member -- regardless of which AI host process they run in -- speaks the same protocol to the same source.

This is `canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051` in architectural form: a cooperative-class pattern that any member's MnemosyneC instance can instantiate, federate with peers, and self-verify via the LB Frame self-verifying replica mechanism (canon_lb_frame_self_verifying_full_replica_resilience_platform_down_proof_bp063). The cooperative-class IS the network. MCP is the thin RPC wire.

---

## §2 Tools Exposed

The following ~20 canonical MCP tools are exposed by MnemosyneC. Grouped by function class.

### 2A -- Substrate Read (no auth required for local stdio)

| Tool Name | Maps To | Description |
|---|---|---|
| `brief_me` | `librarian.brief_me` | Session-opening substrate brief: what's canonical, what's changed, what's pending. |
| `search_knowledge` | `librarian.search_knowledge` | Full-text + semantic search across the substrate knowledge index. |
| `pheromone_query` | `librarian.pheromone_query` | Query pheromone signals (canonical direction markers, last-known state). |
| `get_schema` | `librarian.get_schema` | Retrieve canonical schema for a named substrate domain. |
| `get_page_info` | `librarian.get_page_info` | Page/section metadata from the substrate hierarchy. |
| `query_domain` | `librarian.query_domain` | Query a named substrate domain (e.g. "librarian", "platform", "cohort"). |
| `get_component` | `librarian.get_component` | Retrieve a named substrate component definition. |
| `get_architecture` | `librarian.get_architecture` | Full architecture snapshot for a named system. |
| `consult_scribes` | `librarian.consult_scribes` | Ask the scribes layer (canonical memory, not live web). |
| `detective_investigate` | `librarian.detective_investigate` | Deep-dive investigation on a topic using substrate evidence. |
| `pearl_decode` | `librarian.pearl_decode` | Decode a pearl ID to its full content. |
| `soccerball_decode` | `librarian.soccerball_decode` | Decode a soccerball (session ID) reference. |
| `get_mnemosynec_status` | `ipc:amplify:status` | Current MnemosyneC instance status: version, model loaded, substrate health, mesh peer count. |

### 2B -- Substrate Write (auth-gated: local stdio requires no auth; HTTP+SSE requires shared secret)

| Tool Name | Maps To | Description |
|---|---|---|
| `pearl_emit` | `librarian.pearl_emit` | Emit a new pearl (canonical knowledge fragment). Audit-logged with originating cohort client tag. |
| `eblet_emit` | `librarian.eblit_emit` | Emit an eblet (atomic substrate record). |
| `soccerball_emit` | `librarian.soccerball_emit` | Emit a soccerball (session boundary marker). |
| `scribe_log` | `librarian.scribe_log` | Log a canonical event to the scribes layer. |

### 2C -- Knight-Bishop Bridge Replacement

| Tool Name | Behavior | Description |
|---|---|---|
| `send_message` | Emits a pearl with `addressed_to: <target>` and `from: <source>` slots | Replaces `mcp__knight-bishop-bridge__send_message`. Durable because it is a pearl in the substrate, not a function call to a dead socket. |
| `check_messages` | Pearl query filtered by `addressed_to: self, status: unread` | Replaces polling `KNIGHT_BISHOP_MESSAGES.md`. Returns new messages since last check. |
| `ack_message` | Updates pearl `status: read` | Marks a message as acknowledged so it does not reappear in check_messages. |

### 2D -- Platform / Session Tools

| Tool Name | Maps To | Description |
|---|---|---|
| `get_cohort_status` | `ipc:amplify:mesh-peers` + `librarian.get_cohort_class` | Returns current cohort online/offline status, peer count, federation health. |
| `get_model_status` | `ipc:amplify:model-list` | Returns loaded local models, current default, Ollama status. |

**Total: 20 canonical tools.** Knight may add tools during Wave D -- this spec defines the shape and auth contract, not the exhaustive final list.

---

## §3 Transport Model

### 3A -- stdio (local cohort clients: Bishop + Knight on same machine as MnemosyneC)

MnemosyneC spawns a stdio MCP subprocess on demand. The subprocess is a Node.js script at `librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs`. Claude Code (Bishop) and Cursor (Knight) configure this as a standard `stdio` MCP server.

Why stdio first:
- Zero network surface (no open port)
- No auth required (trust local OS user)
- Fastest latency (in-process IPC via stdin/stdout pipes)
- Already the model used by the current librarian MCP (supervise.mjs wraps stdio)

The stdio subprocess communicates with the running MnemosyneC Electron main process via IPC -- either named pipe (Windows) or Unix socket. The Electron main process already has the window.amplify bridge; the stdio shim is a thin adapter that translates MCP JSON-RPC to IPC calls.

```
Bishop (Claude Code)
  |-- stdio --> mnemosynec-mcp-stdio.mjs
                  |-- named pipe --> MnemosyneC main process
                                       |-- IPC --> librarian-mcp dist/server.js (substrate)
                                       |-- IPC --> local Ollama / Gemma
                                       |-- TCP  --> mesh peer (if federated read needed)
```

### 3B -- HTTP+SSE (remote cohort clients: Rook + Pawn on different process/machine)

MnemosyneC exposes an HTTP server on a configurable port. Default: **11482** (Knight confirms; chosen to avoid collision with any existing Frame port -- TODO: Knight verifies port 11482 is free in the platform port map).

The HTTP server implements MCP over SSE (Server-Sent Events) per the MCP HTTP transport spec. Rook and Pawn configure their MCP clients to point at `http://[machine-ip]:11482/mcp`.

```
Rook (Antigravity / Gemini on separate machine or process)
  |-- HTTP+SSE --> MnemosyneC:11482/mcp
                    |-- auth: shared-secret header
                    |-- routes to same substrate layer as stdio path
```

The HTTP server is an Express-style listener in MnemosyneC's main process. It does NOT need to run if no remote clients are configured. Boot behavior: start listening on first successful remote client config load, or on explicit Founder toggle in the Developer tab.

### 3C -- WebSocket (optional, Wave E)

Low-latency bidirectional channel for real-time mesh events (e.g., pheromone stream, mesh topology changes). Not required for Wave D. Deferred to Wave E per §9.

---

## §4 Auth Model

### Local stdio -- no auth
Local stdio connections are trusted by OS: only a process running as the same OS user can connect to the stdio pipe. This matches the LB Frame self-verifying replica trust model: if you can attach to the process, you are the authorized user.

### Remote HTTP+SSE -- shared secret
A shared secret is derived as:
```
secret = HMAC-SHA256(
  key:   Founder_auth_users_id_UUID,  // from Supabase auth.users.id (Task #15: Founder provides)
  data:  "mnemosynec-mcp-v1-" + machine_hostname
)
```

This secret is written to `~/.mnemosynec/mcp-secret.txt` on first generation. It is presented in the `Authorization: Bearer <secret>` header on every HTTP+SSE call. Rook and Pawn read the secret from the same file (cross-machine: copy via secure channel; or re-derive from the same UUID + hostname pair).

**Rotation:** Secret rotates on explicit Founder action (Developer tab button: "Rotate MCP Secret"). Existing sessions get a 60-second grace period then must reconnect. No automatic rotation -- avoids disrupting active cohort sessions.

**Rate limiting:** 100 tool calls per minute per client IP (configurable). Prevents Starscreaming-class runaway (per canon reference in BP070 close-stamp: 5000-req runaway). Rate limit is WARN-and-throttle, not hard-block on first offense.

**TODO (Task #15 dependency):** The shared secret derivation requires `Founder_auth_users_id_UUID`. This is pending Knight confirmation per Task #15. Wave D SEG-MC-3 and SEG-MC-6 must check this prerequisite before completing auth implementation.

---

## §5 Multi-Client Support

A single MnemosyneC instance supports concurrent MCP sessions:

- Bishop stdio session (Claude Code)
- Knight stdio session (Cursor)
- Rook HTTP+SSE session (Antigravity, when billing wall resolves)
- Pawn HTTP+SSE session (future Comet or upgraded perplexity-pawn proxy)

Sessions are tracked by client ID (provided at connection time: `"client_id": "bishop"` / `"knight"` / `"rook"` / `"pawn"`). Pearl emissions and substrate writes are tagged with the originating client ID for audit traceability.

Concurrent writes use optimistic locking at the substrate layer (already implemented in the librarian-mcp substrate write path). No session blocks another.

The `check_messages` tool filters by `addressed_to: self` using the client_id -- so Bishop sees messages addressed to Bishop and Knight sees messages addressed to Knight. No cross-contamination.

---

## §6 Federation

**Per-machine sovereignty:**
- Founder M1 runs MnemosyneC. Bishop (Claude Code on M1) uses M1's MnemosyneC via stdio.
- Knight M2 runs MnemosyneC. Knight (Cursor on M2) uses M2's MnemosyneC via stdio.
- Two MnemosyneC instances federate via the existing peer mesh (BP067 20/20 hash-verified).

**Write propagation:**
When Bishop calls `pearl_emit` via M1's MnemosyneC:
1. M1 writes to local substrate
2. M1 mesh peer broadcasts the pearl to M2
3. M2 receives, verifies hash, writes to local substrate
4. M2's `check_messages` returns the pearl to Knight on next poll

This is the cooperative-class durability: writes are durable as long as at least one mesh peer is reachable. The LB Frame self-verifying replica (canon_lb_frame_self_verifying_full_replica_resilience_platform_down_proof_bp063) means even if M1's MnemosyneC crashes after writing, M2 has the pearl.

**Read locality:**
Reads (brief_me, search_knowledge, pearl_decode, etc.) are served from the local substrate first. If a requested pearl is not in the local store, the mesh is queried. This keeps local reads fast and avoids latency on every tool call.

**Partition behavior:**
If M1 and M2 lose network connectivity, writes queue locally and reconcile when connectivity restores. The mesh uses the same reconciliation logic proven in BP067. Local-only reads continue working during partition (graceful degradation to single-machine substrate).

---

## §7 Failure Modes (Truth-Always)

| Failure | Detection | Behavior | Recovery |
|---|---|---|---|
| MnemosyneC crashes (main process) | stdio clients see "connection closed"; HTTP clients get 503 | stdio: falls back to disk Yoke pattern (already proven this session). HTTP: Rook/Pawn get a clear error, not silent failure. | MnemosyneC auto-restarts (Electron crash recovery). stdio clients reconnect on next MCP call. HTTP clients reconnect via standard SSE reconnect. |
| librarian-mcp dist/server.js crashes inside MnemosyneC | IPC call returns error | MnemosyneC surfaces error to MCP caller as tool_error result with descriptive message. The supervise.mjs restart logic restarts the subprocess within 5s. | Automatic restart. Pearl writes that were in-flight at crash time may be lost (acknowledged gap; future work: write-ahead log). |
| 3.2MB file / unicode surrogate | No longer relevant | KNIGHT_BISHOP_MESSAGES.md is replaced by substrate pearls. Pearls are UTF-8 validated at emit time. Surrogate pairs are rejected at the substrate layer, not silently corrupted. | By design: moving off flat files eliminates this failure class. |
| Network partition between M1 and M2 | Mesh heartbeat timeout | Writes queue locally. Reads are local-only. | Queue flushes when partition heals. No data loss (queue is on-disk). |
| Auth secret leak | Key rotation (Founder action) | Old secret invalidated after 60s grace. New secret re-distributed. | Explicit Founder action required. No auto-rotation to avoid disrupting sessions. |
| MnemosyneC substrate temporarily wrong (bug) | Any cohort member gets wrong answer from brief_me / search_knowledge | This is the honest risk: a substrate bug means wrong canonical answers briefly. There is no external oracle to cross-check. | Truth-Always canon applies. If a cohort member suspects wrong substrate data, they flag it to Founder immediately. The adversarial Pawn role (canon pearl_3835b813 Red-Queen) is to catch these by checking external web sources against substrate claims. |
| Port 11482 collision | HTTP bind fails at startup | MnemosyneC logs error, disables HTTP transport, continues in stdio-only mode. | Knight assigns an alternate port; config updated. |

---

## §8 Why This Is the Right Move Now

"Until Mnemosyne Come" was the deferred state. We are now AT "Mnemosyne Come" because:

**(a)** v0.1.38 verified on Founder M1 (this session) -- MnemosyneC runs, window.amplify bridge works, IPC infrastructure is live.

**(b)** Wave A + Wave B Red Carpet substrate just shipped -- local substrate writes are live for the first time. The substrate is writable. This is the prerequisite that was missing for MCP write tools.

**(c)** v0.1.39 progress UX (shipped this session) -- long-running operations now show real progress. The MCP server boot sequence (model load, substrate index, mesh discovery) is the kind of operation that needs visible progress. The UX infrastructure is ready.

**(d)** The 4-AI cohort is operating today with disk-file fallback. The fragility is observed, not theoretical. The Agora build path is dead. The 3.2MB file has hit unicode crashes. Rook has never been wired. The cost of continued fallback is measurable session friction every day.

**(e)** The librarian-mcp already has a working Node.js MCP server with supervisor. The stdio shim is a thin adapter. SEG-MC-1 is the scaffold, not a ground-up build.

**(f)** `canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051` -- this architecture makes MnemosyneC's substrate-as-MCP a pattern any member can replicate. Every member with MnemosyneC gets the same cooperative-class substrate. That is the doctrine: the pattern propagates through the network, not just through the 4-AI cohort.

---

## §9 Out of Scope (Wave E or Later)

- **UI for member-facing MCP tool browsing:** A tab in MnemosyneC where members can see what MCP tools are available and test them. Wave E.
- **MCP capability discovery for non-cohort tools:** Other AI assistants (Copilot, etc.) discovering and connecting to MnemosyneC MCP without manual config. Requires MCP capability advertisement standard.
- **MCP gateway federation across cooperative-class members:** Not just the 4-AI cohort but ANY member's MnemosyneC instance exposing tools to any other member's tools. This is the full cooperative-class network effect (canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051 fulfilled at network scale). Wave E -- requires member consent model, rate limit per member, and revenue/joules accounting for cross-member tool calls.
- **WebSocket transport:** Real-time bidirectional streaming (e.g., live pheromone stream to a connected AI). Wave E.
- **MCP tool marketplace:** Members publish custom tools to the substrate; other members subscribe. Very Wave E.

---

*READY FOR FOUNDER REVIEW -- see MNEMOSYNE_COME_03_BISHOP_MCP_CONFIG_PATCH.md for the Bishop config patch*
