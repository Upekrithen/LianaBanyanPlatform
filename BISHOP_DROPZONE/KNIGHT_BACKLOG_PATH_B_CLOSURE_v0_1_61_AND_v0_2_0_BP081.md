---
backlog: KNIGHT_BACKLOG_PATH_B_CLOSURE_v0_1_61_AND_v0_2_0_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
target_versions: v0.1.61 (Mesh-Share + MCP-Real) · v0.2.0 (Browser-Ext-Finish)
purpose: Close Path B — substrate compounds across mesh AND across every AI tool the user touches. Three structural pillars complete the v1.0 substrate-OS thesis.
fires_after: v0.1.60 SHIPs LATEST (with the Amnesia/Cure homepage on mnemosynec.ai)
status: QUEUED — Knight fires when Founder pastes "v0.1.61 GO" / "v0.2.0 GO"
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER."
  - "Forward-pressure ≠ verified-ratify (BP080) — DRAFT until smoke green + 'publish it'"
  - "Caithedral spelling enforced"
  - "Actual runtime verify (BP078)"
  - "UX SEG screenshot mandatory (BP078)"
  - "Every-click visible feedback (BP078)"
  - "Long-running heartbeat (BP078)"
  - "Belief-vs-binary (BP081)"
  - "Verify-network-call-fired (BP081)"
  - "🔒 Secrets canon (BP081)"
  - "Disk-backed canon (BP080)"
  - "100%-read before eblet (Statutes §2 BP063)"
related:
  - "BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md — R4 was last remaining gap"
  - "KNIGHT_PARALLEL_WAVES_K1_K2_K3_VELOCITY_BP081.md — K-2 shipped the MCP scaffold, K-3 shipped the browser extension scaffold"
  - "BP081_POST_v0_1_60_HORIZON_INTERFACES_INTERACT.md — strategic frame"
substrate_thesis_completion:
  - "v0.1.55-v0.1.60 = local substrate accumulator (R1 write · R2 HOT read · R3 Andon persistence · 3-voter Giant · 14-domain Plow · Substrate Stats)"
  - "v0.1.61 = collective substrate accumulator (R4 mesh share + MCP real tools = Path B closed for MCP-aware clients)"
  - "v0.2.0 = browser-AI Path B closed (chatgpt.com / claude.ai / gemini.google.com → MnemosyneC substrate)"
  - "Result: 'every AI interaction grows your substrate' becomes empirically true for the majority of user types"
---

# Knight Backlog · Path B Closure · v0.1.61 + v0.2.0 · BP081

Knight — Bishop. Three structural pillars to close the substrate-OS thesis. Founder ratified all three. Fire after v0.1.60 SHIPs LATEST.

**Sequencing:**
1. v0.1.60 SHIPs (Amnesia/Cure homepage live on mnemosynec.ai)
2. v0.1.61 fires when Founder pastes "v0.1.61 GO" — MCP-Real + R4 Mesh-Share
3. v0.2.0 fires when Founder pastes "v0.2.0 GO" — Browser extension finish

Each wave: canonical Knight Yoke pattern (5-7 SEGs Sonnet 4.6, VERIFY, STAGING, SHIP, 4 EVERY TIME sharpenings).

---

# §A — v0.1.61 SCOPE — MCP Real Tools + R4 Cross-Mesh Eblet Sharing

**Theme:** the substrate compounds across MCP-aware AI tools AND across the mesh of consenting peers. After v0.1.61, when you use Claude Desktop, your MnemosyneC substrate informs Claude's answers; when you accept good answers, they land as eblets; and (with consent) those eblets propagate to your federated peers' substrates. **The substrate-as-asset thesis materializes empirically.**

## SEG-1 · MCP Real Tools — wire the 5 stubs to real implementations (P0, **Sonnet 4.6**)

**Reference:** K-2 from v0.1.59 wave shipped `src/main/mcp_server.ts` with port 11456, Bearer auth, recent-calls ring buffer, and 5 stub tools. v0.1.61 SEG-1 swaps stubs for real bodies.

### Tool 1 · `mnem_query_substrate(question: string)` → REAL

**Implementation:**
- Call existing `queryStats()` / eblet store query helpers from `mnem_eblet_store.ts`
- Use R2 HOT retrieve logic (already shipped v0.1.59) — sha256 exact-match first, then semantic-similarity fallback
- Return top-K verified eblets matching the question
- Schema: `{ eblets: Array<{ question, answer, verified, sha256, provenance, timestamp, domain? }>, totalMatches: number, queryTookMs: number }`
- Respect token-based auth (already wired K-2)
- Append to recent-calls ring buffer with tool name + caller token + result count

**Verify:** Claude Desktop calls `mnem_query_substrate` with sample question → confirm real eblets returned (post any test eblet via Plow first) → Settings panel "Recent calls" shows the invocation.

### Tool 2 · `mnem_record_qa(question: string, answer: string, verified?: boolean)` → REAL

**Implementation:**
- If `verified=true` → direct Andon-gated `writeVerifiedEblet` (user/tool vouched)
- If `verified=false` or unspecified → dispatch into the Plow loop (Spider/Sprite → Giant concordance from v0.1.60 → write only on verified verdict)
- Either path: provenance tagged as `mcp_client:<token-prefix>` so substrate stats can break down sources
- Return: `{ written: boolean, ebletSha256?: string, verdict?: 'verified' | 'rejected' | 'split', reason?: string }`
- Append to recent-calls

**Verify:** Claude Desktop calls `mnem_record_qa(question, answer, verified=true)` → confirm eblet appears in store via Substrate Stats Tab (count increments + provenance shows `mcp_client:...`).

### Tool 3 · `mnem_get_substrate_stats()` → REAL

**Implementation:**
- Direct passthrough to `queryStats()` (existing from K-1/Wave A)
- Schema: `{ totalEblets, verifiedCount, lastWriteTimestamp, topDomains: Array<{domain, count}>, quarantineCount }`
- Append to recent-calls

**Verify:** Claude Desktop renders stats card in its UI from the response.

### Tool 4 · `mnem_run_giant_concordance(question: string, candidateAnswer: string)` → REAL

**Implementation:**
- Direct passthrough to `runGiantConcordance` (real implementation from v0.1.60 A-1)
- 3-voter Ollama dispatch · correctness/consistency/coverage lenses · 2+/3 verdict
- Schema: `{ verdict: 'verified' | 'rejected' | 'split', confidence: number, votes: VoterVote[] }`
- Append to recent-calls

**Verify:** Claude Desktop asks MnemosyneC to verify an answer → Ollama server.log shows 3 `/api/chat` calls (the 3-voter dispatch) → Claude receives structured verdict.

### Tool 5 · `mnem_share_eblet_to_peer(ebletId: string, peerId?: string)` → REAL (depends on SEG-2 R4)

**Implementation:**
- If `peerId` specified → direct send via existing federation transport (LAN discovery from v0.1.55)
- If `peerId` omitted → broadcast to all federated peers (with user consent — see R4 consent UI)
- Returns: `{ success: boolean, peers: string[], failures: Array<{peerId, reason}> }`
- Append to recent-calls

**Verify:** M0 shares eblet to M1 via Claude Desktop tool call → M1's substrate stats show inbound eblet (provenance tagged `peer:<M0 id>`).

### Telemetry surface in MnemosyneC

- Extend Settings panel MCP section with: per-tool call count today, top-5 callers by token, recent error rate
- Every-click visible feedback on toggle

## SEG-2 · R4 Cross-Mesh Eblet Sharing (P0, **Sonnet 4.6**)

**Goal:** verified eblets propagate across federated peers with per-eblet opt-in consent. Closes R4 in the substrate-accumulator audit.

**Protocol:**

### §2.1 Per-eblet share flag

- Extend `EbletRecord` schema in `mnem_eblet_store.ts` with `shareConsent: 'private' | 'mesh' | 'public'` (default `private`)
- Two surfaces let user set consent:
  1. **Per-eblet toggle in Substrate Stats Tab "Recent writes" list** — small icon button: 🔒 private (default) / 🤝 mesh / 🌐 public (queued v0.6+, treat as `mesh` for v0.1.61)
  2. **Bulk default in Settings** — "By default, share new eblets to mesh: ON/OFF" — when OFF, every new eblet defaults `private`

### §2.2 Mesh propagation protocol

- New module: `src/main/mesh/eblet_share.ts`
- On eblet write (in `writeVerifiedEblet`): check `shareConsent`. If `mesh`, queue for propagation.
- Background propagation worker dispatches queued eblets via existing federation transport:
  - LAN peers: direct WebRTC or TCP (whatever existing federation uses)
  - WAN peers: via `relay.lianabanyan.com` Supabase Edge Function
- Each propagation includes: ebletId, sha256, question, answer, verified, originPeerId, originTimestamp
- Receiver verifies sha256 + verified flag + runs LOCAL Giant concordance check (3-voter) before accepting into local store
- If local Giant disagrees → reject + log + do NOT write (Andon-strict against peer-trust assumption)

### §2.3 Receiver-side acceptance

- Incoming eblets land in `eblets.inbound.jsonl` first (separate file)
- Background processor:
  - Validates sha256
  - Runs local Giant concordance
  - On verified → writes to main `eblets.jsonl` with provenance `peer:<originPeerId>`
  - On rejected → quarantines to `eblets.peer-rejected.jsonl`
- Substrate Stats Tab shows: inbound today, accepted, rejected, top inbound peers

### §2.4 Privacy & consent UI

- New Settings section: "Mesh Substrate Sharing"
- Display:
  - Total eblets shared out today / yesterday / this week
  - Total eblets received & accepted today
  - Per-peer breakdown (M1 sent you 12, M2 sent you 8)
  - Toggle: "Pause outbound sharing" (privacy panic button)
  - Toggle: "Pause inbound acceptance"
- Every-click visible feedback

### §2.5 Andon at the mesh layer

- A peer-sent eblet that fails LOCAL Giant concordance NEVER lands in main substrate
- A peer that consistently sends rejected eblets → mark suspicious in peer reputation cache
- Display in Federation panel: "M5 has sent 3 eblets, 0 accepted (suspicious)"

### Verify (runtime + verify-network-call-fired BP081)

- M0 + M1 + M2 all running v0.1.61
- M0 writes an eblet with `shareConsent: 'mesh'`
- M1 + M2 federation logs show inbound delivery within 5s (LAN), 30s (WAN)
- M1 + M2 Ollama server.log shows 3 `/api/chat` calls (local Giant concordance verifies before accept)
- M1's substrate stats show "1 inbound from M0 today"
- Screenshot all surfaces · sha256 of M0's eblet matches sha256 in M1's store

## SEG-3 · Subagent dispatch via MCP — let MnemosyneC RUN tools on Claude Desktop's behalf (P1, **Sonnet 4.6**)

**Bonus strategic capability — converts MnemosyneC from passive substrate to active substrate operator.**

**Goal:** add MCP tool `mnem_dispatch_seg(taskPrompt: string, opts?)` that dispatches a Sonnet 4.6 SEG on Claude Desktop's behalf. Claude Desktop calls this, MnemosyneC runs the SEG, returns result. Now any MCP-aware client gets access to Shadow E-Giants.

**Scope:**
- New tool exposed via mcp_server.ts: `mnem_dispatch_seg(taskPrompt, opts)`
- Backend: dispatches a local Sonnet 4.6 subagent (similar to how Bishop dispatches), returns final result
- Token-gated, opt-in per-client
- Recent-calls ring buffer tracks SEG dispatches

**Verify:** Claude Desktop calls `mnem_dispatch_seg("write a haiku about substrate")` → MnemosyneC fires a SEG → returns the haiku.

## SEG-4 · Carry-along sweep (P2, **Sonnet 4.6**)

Any v0.1.60 deferred items + drift.

## VERIFY · STAGING-UPLOAD · SHIP (Sonnet 4.6, canonical pattern)

Same 4 EVERY TIME sharpenings. **Update homepage at SHIP:** §1 STRUCTURAL gets a one-line update — *"Use Claude Desktop · Use Cursor · MnemosyneC's substrate flows through every MCP-aware tool."* (Bishop drafts the line + Knight integrates.)

---

# §B — v0.2.0 SCOPE — Browser Extension Finish

**Theme:** the chatgpt.com / claude.ai / gemini.google.com user gets substrate growth from every browser-AI session. Closes the "majority of AI users in browser tabs" Path B segment.

## SEG-1 · Content script Q+A capture (P0, **Sonnet 4.6**)

**Reference:** K-3 from v0.1.59 wave shipped `browser-extension/` with 15 files including content scripts that observe DOM but only console.log. v0.2.0 SEG-1 makes them post.

### Per-surface content scripts (real bodies)

**chatgpt_com.js:**
- MutationObserver on `[data-message-author-role]` (already in scaffold)
- Detect user-turn → assistant-turn pair completion
- Extract question (user) + answer (assistant) as plain text
- POST to local MnemosyneC MCP server at `localhost:11456` with auth token
- Endpoint: `mnem_record_qa` (verified=false → routes through Plow loop)
- On success: badge popup shows "+1 eblet candidate"
- On Plow verdict: badge updates "+1 eblet" (verified) or "0 (rejected)"

**claude_ai.js:** same pattern for `[data-testid="ai-turn"]`

**gemini_google_com.js:** same pattern for `.model-response-text`

### Token handshake flow

- First time extension runs → popup shows "Connect to your MnemosyneC"
- User clicks → fetches token from local MnemosyneC Settings MCP panel (extension prompts user to copy + paste, OR uses chrome.identity if same-origin)
- Token stored in `chrome.storage.local`
- All subsequent posts include `Authorization: Bearer <token>` header

### Inject flow (Path C)

**This is the unlock that wasn't in the original spec — make the extension ALSO inject substrate context BEFORE the user sends their message.**

- On user typing in chat input (debounced 500ms): extension calls `mnem_query_substrate(currentInput)`
- If hits returned: render a small floating panel "💡 MnemosyneC found 3 related answers in your substrate. [Inject as context?] [Dismiss]"
- If user clicks "Inject as context" → prepend a `<context>` block to their message before send
- The cloud AI receives substrate-informed context, answers better, the loop closes

### Verify (runtime + verify-network-call-fired)

- Load extension in Chrome dev mode
- Open chatgpt.com, paste token from MnemosyneC Settings
- Type a question, hit send → assistant responds → content script logs detected turn → POST to localhost:11456 fires → MnemosyneC MCP server log shows incoming call → eblet candidate enters Plow → verified-correct lands in store
- Substrate Stats Tab shows new eblet with provenance `browser_ext:chatgpt`
- Type a SECOND question similar to first → extension's inject panel appears with substrate hits
- Click Inject → ChatGPT receives prepended context → answers reference Founder's substrate
- Screenshot the full flow

## SEG-2 · Bridge stability (P0, **Sonnet 4.6**)

**Goal:** the `bridge/local_mcp_client.js` from K-3 is currently stub. v0.2.0 SEG-2 hardens it.

**Scope:**
- Real HTTP POST with retry-with-backoff (3 retries, exponential)
- Graceful failure if MnemosyneC not running → popup badge shows "🟡 MnemosyneC offline"
- Connection state cached, retried on next user turn
- Token rotation handled (if MnemosyneC issues new token, extension prompts user once)

**Verify:** simulate MnemosyneC down → extension retries → resume when MnemosyneC restarts → backlog of queued Q+A drains.

## SEG-3 · Extension popup polish (P1, **Sonnet 4.6**)

**Goal:** dark substrate UI from K-3 becomes a real status + control surface.

**Scope:**
- Status: 🟢 connected / 🟡 offline / 🔴 token-invalid
- Eblet count today + total
- Quick-disable toggle per site
- "Open MnemosyneC" button (launches via `mnemosynec://` deep link if registered, else falls back to launching the app)
- Settings: token, default share consent for browser-captured eblets

## SEG-4 · Chrome Web Store packaging (P2, **Sonnet 4.6**)

**Goal:** prepare for Chrome Web Store submission.

**Scope:**
- Build script produces `browser-extension/dist/mnemosynec-extension-v0.2.0.zip`
- README updates: store description, screenshots, privacy disclosure, version notes
- Privacy policy file (mnemosynec.ai/privacy)
- Permissions justification document (for Chrome Web Store reviewer)
- Note: actual submission is Founder action (Chrome Web Store dev account)

## VERIFY · STAGING · SHIP (Sonnet 4.6, canonical pattern)

v0.2.0 is browser-extension scope. The MnemosyneC app version stays whatever's current (likely v0.1.61.x or v0.1.62). Browser extension version is independent — `browser-extension/manifest.json` carries v0.2.0.

**Distribution at SHIP:**
- Initial: load-unpacked from `browser-extension/dist/` (developer mode users)
- Once verified: submit to Chrome Web Store (Founder action)
- Firefox AMO + Edge Add-ons: queue separately as v0.2.1 / v0.2.2

---

# §C — Bishop notes for the wave waves

## Strategic implication when v0.1.61 + v0.2.0 ship

**The substrate-OS thesis becomes empirically true.** From a user's perspective:

| Action | What happens |
|---|---|
| Open chatgpt.com, ask a question | Extension queries your substrate first → injects relevant verified answers as context → ChatGPT answers BETTER because of YOUR knowledge |
| Continue the chat | Extension captures user-assistant turns → posts to local MnemosyneC → Plow loop verifies → eblet lands |
| Switch to Claude Desktop | Same substrate available via MCP — Claude Desktop queries `mnem_query_substrate` automatically |
| Run Cursor for coding | Same substrate available via MCP — Cursor's AI is informed by your accumulated coding knowledge |
| Federate with a teammate | Verified eblets propagate (with consent) — your team's collective knowledge compounds |

**This is the moat.** Other AI vendors compete on model. MnemosyneC compounds on substrate across every AI surface the user touches. Structurally uncopyable because each user's substrate is theirs alone — even though the code is forkable under SSPL.

## Marketing update at v0.1.61 SHIP (Bishop drafts, Knight integrates)

Add to §1 STRUCTURAL on the homepage:

> *"Use MnemosyneC's Ask. Use Claude Desktop. Use Cursor. Use chatgpt.com in a browser (with our extension). Use whatever you already use, however you already use it. Your substrate compounds. Every AI gets smarter on your terms."*

## Sequencing reminder

- v0.1.60 must SHIP first (Amnesia/Cure homepage + 3-voter Giant + 14-domain Plow + everything that's already built)
- v0.1.61 fires when Founder pastes "v0.1.61 GO" pointing at this file
- v0.2.0 fires when Founder pastes "v0.2.0 GO" pointing at this file
- Knight uses Cursor parallel tabs as before (3-6 tabs per wave per his bandwidth assessment)

## Velocity gain

- Without these specs ready: composing them when Founder asks "what's next" costs 1-2 hours of back-and-forth
- With these specs disk-resident: Founder pastes "GO" → Knight starts immediately → no spec-cycle latency

— Bishop · BP081 · 2026-06-13
