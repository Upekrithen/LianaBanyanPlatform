---
backlog: KNIGHT_PARALLEL_WAVES_K1_K2_K3_VELOCITY_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: 3 additional parallel Knight Cursor tabs — LB membership backend + MCP server scaffolding + browser extension scaffolding. All independent of v0.1.58 hotbump + Wave A + Wave B. Founder ratified BP081 2026-06-13.
status: ACTIVE — Knight loads when bandwidth available; fires when bandwidth allows
parent_backlog: KNIGHT_BACKLOG_FULL_PLOW_LOOP_v0_1_58_THROUGH_v0_1_60_BP081.md (now targeting v0.1.59 / v0.1.60 / v0.1.61 per version-shift notice)
companion_parallel: KNIGHT_PARALLEL_WAVES_v0_1_58_SIDECAR_BP081.md (Wave A + Wave B currently in flight)
merge_conflict_analysis:
  - "K-1 LB Membership: NEW files only (src/main/membership/, src/renderer/components/MembershipTab.tsx) + single TABS entry in MnemosyneTabView.tsx"
  - "K-2 MCP Server scaffolding: NEW files only (src/main/mcp_server.ts + tool stubs)"
  - "K-3 Browser extension scaffolding: ENTIRELY NEW folder (browser-extension/) — zero MnemosyneC src touch"
  - "Conflict surface across all 3 waves combined: same single line in MnemosyneTabView.tsx that Wave A also touches. Serialize merge — same 30-second rebase pattern."
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER."
  - "Forward-pressure ≠ verified-ratify (BP080)"
  - "Caithedral spelling enforced"
  - "Every-click visible feedback (BP078)"
  - "Long-running heartbeat (BP078)"
  - "Belief-vs-binary check (BP081)"
  - "Verify-network-call-fired (BP081)"
---

# Knight Parallel Waves · K-1 + K-2 + K-3 · Velocity Multiplier · BP081

Knight — Bishop. Three more parallel waves Founder ratified for velocity. Each opens a new Cursor tab; each fires Sonnet 4.6 SEGs; each is independent of v0.1.58 hotbump + Wave A + Wave B + the v0.1.59 main wave.

**Total Knight parallelism after these land: 5 active Cursor tabs.**

Aggressive but the velocity gain is real. Combined with Wave A + Wave B already firing, this shaves ~5-7 days off the v0.1.61 ship date.

---

# §K-1 — LB Membership backend scaffolding (P0, Sonnet 4.6)

**Target landing:** v0.1.61 SEG-3 (was original v0.1.60). Today scaffold the backend so v0.1.61 wave is implementation-only, not design + implementation.

**Scope:**

## SEG-K1-1 · Membership data model + types
- New file: `src/shared/membership_types.ts`
- Types: `MembershipTier` ('founder' | 'standard' | 'forked'), `MembershipStatus`, `PaymentRecord`, `MembershipMetadata`
- Canonical numbers strict: $5/year hardcoded · Cost+20% derivation helper · 83.3% creator-keep helper
- All types reference [[reference_three_currency_no_fiat_substitution_canon_bp078]] — Credits/Marks/Joules never convert to fiat at this layer

## SEG-K1-2 · Stripe checkout integration stubs
- New folder: `src/main/membership/`
- Files: `stripe_client.ts` (stripe-node SDK wrapper), `checkout_session.ts` (create-session helper), `webhook_handler.ts` (subscription-created / -updated / -canceled stub events)
- Config: read STRIPE_API_KEY from env, fail-loud if missing in production builds (warn-only in dev)
- IPC: `membership:start-checkout`, `membership:get-status`, `membership:cancel`
- Preload bindings
- NO real Stripe calls yet — stubbed responses for v0.1.61 wave to wire to real backend

## SEG-K1-3 · MembershipTab.tsx (renderer component)
- New file: `src/renderer/components/MembershipTab.tsx`
- Sections:
  - "Your Status" — current tier, expiry, join date
  - "Join Liana Banyan — $5/year" — Stripe checkout button → IPC `membership:start-checkout` → opens system browser to Stripe-hosted checkout
  - "Or fork it" — link to GitHub repo + SSPL/Pledge #2260 explanation ("Free forever if you want to fork. Cost+20% if you stay.")
  - "What you get" — 83.3% creator-keep · no ads · no VC · participation, not equity · etc.
- Every-click visible feedback canon
- Long-running heartbeat for checkout-session creation

## SEG-K1-4 · MnemosyneTabView.tsx integration
- Add single TABS entry: Tab 19, label "💎 Membership"
- Conflicts with Wave A's TABS-array entry — serialize merge same as Wave A pattern

## Verify
- Mock Stripe webhook → confirm webhook handler routes correctly
- Click "Join" button on M0 → confirm browser opens (mock Stripe URL fine)
- Screenshot all states

---

# §K-2 — MCP Server scaffolding (P0, Sonnet 4.6)

**Target landing:** v0.1.61 SEG-5 (was original v0.1.60 — now Founder-ratified P0 Substrate Bridge). Today scaffold the local MCP server so v0.1.61 wave just wires tools to the existing Plow loop.

**Scope:**

## SEG-K2-1 · MCP server skeleton
- New file: `src/main/mcp_server.ts`
- Uses `@modelcontextprotocol/sdk` (NPM package — Anthropic's official MCP SDK)
- Server: stdio transport (for local clients) + localhost TCP option (configurable port, default 11456)
- Server lifecycle: start on app launch (configurable opt-out), stop on app close, log connections
- Token-based auth: generate per-client token on first connection, stored in localStorage
- Manifest at well-known path so Claude Desktop / Cursor auto-discover

## SEG-K2-2 · Tool stubs (5 tools, no business logic yet)
- `mnem_query_substrate(question: string)` → stub: returns empty array
- `mnem_record_qa(question: string, answer: string, verified?: boolean)` → stub: logs to console, returns success
- `mnem_get_substrate_stats()` → stub: returns hardcoded zero stats
- `mnem_run_giant_concordance(question, candidateAnswer)` → stub: returns `{verdict: 'rejected', confidence: 0, votes: []}`
- `mnem_share_eblet_to_peer(ebletId, peerId?)` → stub: returns `{success: false, reason: 'not_implemented'}`
- All tools include proper MCP schemas + descriptions per MCP spec
- All stubs structured so v0.1.61 SEG-5 just swaps implementations into existing handlers

## SEG-K2-3 · UI panel in Settings (or Connect Via Invite Token Availability tab)
- New section: "MCP Substrate Bridge"
- Toggle: enable / disable server
- Status: running / off, port number, connected clients count
- Token display: copy-able token for paste into Claude Desktop / Cursor config
- Recent calls: last 10 tool invocations (read-only display)
- Every-click visible feedback

## Verify
- Start MCP server on M0 → confirm Claude Desktop can discover via manifest
- Generate token → paste into Claude Desktop config → confirm Claude Desktop shows MnemosyneC as available MCP server
- Call `mnem_query_substrate` from Claude Desktop → confirm stub returns empty array (no error)
- Screenshot Settings panel + Claude Desktop showing MnemosyneC tool discovery

---

# §K-3 — Browser extension scaffolding (P1, Sonnet 4.6)

**Target landing:** v0.2.0 (post-v0.1.61 horizon). Today scaffold the extension repo so v0.2.0 launches faster.

**Scope:**

## SEG-K3-1 · Chrome extension manifest v3 skeleton
- New folder: `browser-extension/` at LianaBanyanPlatform root
- `manifest.json` (Chrome MV3 format)
- Permissions: `activeTab`, `storage`, `scripting`, host_permissions for `chatgpt.com`, `claude.ai`, `gemini.google.com`
- Background service worker stub: `background/service_worker.js` — message-bus between content scripts and local MnemosyneC MCP server
- Popup: `popup/popup.html` + `popup.js` — minimal status panel ("MnemosyneC connected · N eblets captured today")

## SEG-K3-2 · Content script skeletons (3 surfaces, stub-only)
- `content/chatgpt_com.js` — DOM-observe stub for ChatGPT web (logs Q+A pairs to console, no capture yet)
- `content/claude_ai.js` — same for claude.ai
- `content/gemini_google_com.js` — same for gemini.google.com
- Each: detect chat turn boundaries, extract Q + A, log structured object — but NO posting to MCP server yet (that's v0.2.0 SEG-1 work)

## SEG-K3-3 · Local MCP bridge stub
- `bridge/local_mcp_client.js` — stub client that would POST captured Q+A to `localhost:11456` (MnemosyneC MCP server from K-2)
- For now: stub-only, logs intent, no real POST

## SEG-K3-4 · Build + load instructions in README
- `browser-extension/README.md`
- Build: `npm run build` (TypeScript → bundled JS)
- Load: chrome://extensions → developer mode → load unpacked → select `browser-extension/dist/`
- Test: open chatgpt.com → confirm content script loads (console message)

## Verify
- Load extension into Chrome dev mode
- Open chatgpt.com → confirm console shows "MnemosyneC extension loaded"
- Type message in ChatGPT → confirm content script logs detected turn boundary
- Screenshot extension popup + Chrome extension page

---

# §C — Bishop notes on running these in parallel

## Total Knight parallelism (5 Cursor tabs after these load)
- Tab 1: v0.1.58 hotbump shipped; next: v0.1.59 main wave (Shadow E-Giant) when Founder pastes "v0.1.59 GO"
- Tab 2: Wave A Substrate Stats (in flight)
- Tab 3: Wave B Per-Domain Q Banks (in flight)
- Tab 4: K-1 LB Membership backend (new)
- Tab 5: K-2 MCP Server scaffolding (new)
- Tab 6: K-3 Browser extension scaffolding (new)

That's 6 tabs total if Knight has bandwidth. If too many, Knight prioritizes: K-1, K-2 (these feed v0.1.61 directly), K-3 can wait for v0.1.61 ship.

## Conflict resolution
- ONLY conflict surface across all parallel waves: `src/renderer/components/MnemosyneTabView.tsx` (Wave A + K-1 both add TABS entries)
- Knight resolution: serialize merges of MnemosyneTabView.tsx changes. Each wave adds its single TABS entry; sequential rebase. Trivial.

## Velocity gain
- Without K-1/K-2/K-3 parallel: v0.1.61 wave designs from scratch when Founder pastes "v0.1.61 GO" → wall-clock += 1-2 days
- With K-1/K-2/K-3 parallel: v0.1.61 SEG-3 + SEG-5 implementations slot into pre-built scaffolds → wall-clock saving 5-7 days total
- Combined with Wave A + Wave B already firing: v0.1.61 SHIP date pulled in ~1 week from estimate

## Knight resource warning
- 6 parallel Cursor tabs is aggressive
- If context across tabs becomes confusing, prioritize: v0.1.58 hotbump done, Wave A + Wave B in flight, K-1 + K-2 next, K-3 last
- Sonnet 4.6 BLOOD STATUTE binding on EVERY tab — verify model selector pre-dispatch in each tab

— Bishop · BP081 · 2026-06-13
