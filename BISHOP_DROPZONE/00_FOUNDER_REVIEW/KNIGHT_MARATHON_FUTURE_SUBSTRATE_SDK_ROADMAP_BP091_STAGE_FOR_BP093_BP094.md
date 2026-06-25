# Knight Marathon Future — Substrate SDK Roadmap
## FUTURE / ROADMAP CLASS · BP091 · Staged for BP093/BP094+ · Sonnet 4.6 SEG · **DO NOT FIRE YET**

> **THIS IS A ROADMAP DISPATCH. NO KNIGHT WORK IS AUTHORIZED HERE. STAGED AT BISHOP_DROPZONE FOR FOUNDER REVIEW. FIRE-CLASS DEPENDENCIES IN §8 MUST BE MET BEFORE EXECUTION.**

**Composed:** 2026-06-22 · Bishop Sonnet 4.6 SEG · Founder-direct BP091

---

## FOUNDER DIRECT (verbatim · BP091 2026-06-22 ~13:37 Central)

> *"I still think a good idea to provide it, which is the Substrate without Mnemosynec, right? But what does that even look like?"*

---

## Strategic Context

The MnemosyneC client is not the substrate — it is ONE client that consumes the substrate. This distinction is architectural and was canonized at `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_substrate_portable_mesh_integrates_with_any_reasoning_model_free_or_flagship_bp089.eblet.md`: *"the cooperative substrate is a portable cooperative private mesh that integrates with ANY model (free OR flagship) — works without MnemosyneC running."* An Electron installer that runs on Windows machines is exactly one entry point into a mesh designed to span Slackbots, Jupyter notebooks, CLI pipelines, and cooperative servers running in datacenters. The SDK is how that multi-entry-point reality becomes real.

The Designed-to-be-Copied doctrine (canonized at `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051.eblet.md`) is the strategic charter for this work. The cooperative does not grow by guarding its tools — it grows by distributing them. A developer who ships a Slackbot that calls `substrate.peer_presence.register()` is a cooperative propagation vector. Every SDK consumer who installs `@liana-banyan/substrate` becomes a substrate-expansion node. The SDK is the propagation mechanism Designed-to-be-Copied always pointed at.

The Android-of-AI licensing model (canonized at `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087.eblet.md`) already mapped this moment precisely. Layer 2 of that model — Apache 2.0 library extractions — is not a future aspiration; it is the canonical slot this SDK fills. Apache 2.0 is the right license not because it is soft on for-profit forks, but because the structural moat has nothing to do with the code. The moat is the live cooperative substrate: the member network, the Marks economy, the Caithedral Federation, the MIC broadcast layer, the Star Chamber SCaaS node graph. A for-profit company that forks the SDK code gets the library and falls directly into the Free-WITHOUT-Substrate inferiority the inequality trinity (BP085) names. They cannot fork the network.

The Heart-of-Peace orientation toward future SDK developers is deliberate. Cooperative membership is an invitation, not a gate. A developer who builds on `@liana-banyan/substrate` and does not join the cooperative is still expanding the cooperative mesh. Heart-of-Peace means: we do not treat potential SDK developers as threats to be screened or competitors to be feared. We treat them as builders we have not yet met. The SDK is the cooperative saying: here is the infrastructure; build something good with it.

---

## Empirical State (FUTURE — gadget-surveyed 2026-06-22 by Bishop Sonnet 4.6 SEG)

**What exists in the platform codebase today that is already factorable as a library vs platform-specific:**

The MnemosyneC platform at `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\` is NOT an Electron application — it is a React/Vite web application connecting to Supabase. This is significant: there is no `src/main/` Electron main-process directory. The platform is already browser/Node-compatible TypeScript. Factoring an SDK is therefore a monorepo workspace extraction, not a full port.

**Already library-class (no UI dependency, no Supabase singleton lock):**

- `src/lib/relay/relay_protocol.ts` — pure TypeScript wire types for the relay mesh (RelayMsg, RelayPeerEntry, EscalationMethod, RelayHopRecord). No imports of any kind. Immediately factorable.
- `src/lib/relay/relay_auth.ts` — RelayAuthManager class, HMAC token validation, session tracking. No browser/Node-specific imports. Factorable as-is with a production HMAC-SHA-256 swap (currently uses XOR placeholder per comments in code).
- `src/lib/relay/relay_registry.ts`, `relay_pool.ts`, `relay_health.ts`, `relay_escalation.ts`, `relay_cost.ts` — relay infrastructure logic. Mix of pure logic and server-calling code; need audit pass to separate interface contracts from Supabase calls.
- `src/lib/currencyService.ts` — THREE-GEAR CURRENCY pure types and math (MemberCurrency, MarkTransaction, JouleTransaction, calculateCostPlus20). The math functions (calculateCostPlus20, MARK_LEVELS, JOULE_MULTIPLIERS, MARKS_EARNING) are factorable immediately. The async API functions (getMemberCurrency, getMarksHistory) require a swappable backend adapter pattern rather than the current Supabase singleton.

**Requires refactoring before factoring (currently Supabase-coupled):**

- Currency read/write — currently `supabase.from("user_credits")...` calls. SDK needs an adapter interface (`LedgerAdapter`) that callers implement for their own backend.
- Identity/presence — `peer_presence` table inserts are Supabase-direct. SDK needs a `PresenceAdapter` interface.
- Thorax handshake — exists in the cooperative substrate server logic; needs extraction into a pure signing/verification module.

**Platform-specific, excluded from SDK (explained in §3):**

- `src/components/` — all React UI components
- `src/data/` — static seed data files for the cooperative platform
- Hugo site assets
- Auto-update mechanism (currently platform-managed)

---

## §1 SDK SURFACE — Minimum Viable API (FUTURE / ROADMAP)

> **ROADMAP-CLASS. These are candidate functions. Not coded. Not approved for Knight execution.**

The canonical 10 functions an `@liana-banyan/substrate` MVP exposes:

### 1. `substrate.identity.generateKeypair()`
Derive an Ed25519 keypair + compute the Soccerball address from it. Returns `{ privateKey, publicKey, soccerballAddress }`. Soccerball address is the L1 canonical peer ID per `canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091.eblet.md`. Pure crypto — no network call.

### 2. `substrate.identity.computeCircleNickname(selfAddress, peerAddress, knownPeers)`
Compute the L2 Default Circle Nickname for a peer relative to a viewer. Returns `"M0"` (self), `"M03"` (household), etc. Pure computation — no network call. (Per peer identity canon §3.)

### 3. `substrate.presence.register(config)`
Register a peer in the cooperative substrate mesh. Emits a `relay_join` message to `relay.lianabanyan.com` (or a configurable relay endpoint). Starts heartbeat. Returns a `PeerSession` object with `disconnect()` and `heartbeat()`. Per `canon_lan_as_wan_test_mode_4_machine_mesh_bp085.eblet.md`: always routes via WAN relay, no LAN shortcut until WAN receipt confirmed.

### 4. `substrate.presence.list()`
Return the current peer list from the relay. Returns `RelayPeerEntry[]`. Wraps `relay_peer_list` message handling.

### 5. `substrate.mic.subscribe(handler)`
Subscribe to MIC broadcasts. Handler called with each broadcast message. Per `canon_mic_machine_in_charge_naming_lock_bp086.eblet.md`: MIC is a ROLE per-broadcast, not a persistent identity. Subscriber receives Ed25519-signed broadcast envelope per `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086.eblet.md`. Returns an `unsubscribe()` function.

### 6. `substrate.mic.emit(message, signingKey)`
Emit a MIC broadcast as the current MIC-role peer. Signs the message with the caller's Ed25519 private key before transmission. State-changing broadcasts require explicit user approval per MIC STAMPED canon — the SDK enforces the signing contract; caller enforces the approval UX.

### 7. `substrate.thorax.handshake(remotePeerId, localKeypair)`
Execute the Thorax cross-peer key exchange with a remote peer. Returns a `ThoraxSession` with a derived shared secret. Callers use the shared secret for subsequent encrypted peer-to-peer messages. Built on Web Crypto API (SubtleCrypto.deriveKey) — compatible with browser and Node.js 18+.

### 8. `substrate.ledger.read(peerId, adapter)`
Read the three-gear currency balances (Credits, Marks, Joules) for a peer. Takes a `LedgerAdapter` interface that the caller implements for their backend. SDK ships a `SupabaseLedgerAdapter` reference implementation. Returns `MemberCurrency`.

### 9. `substrate.ledger.write(peerId, transaction, adapter)`
Write a ledger transaction (Marks award, Credits debit, Joules mint). Takes the same `LedgerAdapter` interface. Enforces the three-gear invariants (Credits face value, Marks earn-only via activity, Joules locked per Birthright Mechanic). Per `canon_three_gear_currency_differential_credits_marks_joules_mechanism_bp086.eblet.md`.

### 10. `substrate.substitution.classify(payment)`
Classify a payment into its Substitution Rail (Fiat/Credits/Marks/Barter) per `canon_substitution_rail_fiat_marks_credits_barter_payment_taxonomy_bp086.eblet.md`. Pure function — no network. Returns `{ rail, amount, note }`. Validates the closed-loop invariant (no Credits/Marks → external fiat conversion).

### 11. `substrate.caithedral.query(federationSlug)`
Query Caithedral Federation membership for a given federation slug. Returns member list with Soccerball addresses and L3 chosen display names. Note: "Caithedral" not "Cathedral" — spelling is canonical per BP091. Per `canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091.eblet.md` §4: `FireStorm94@TriCities` — the federation slug is the namespace.

### 12. `substrate.plow.prime(domain, bundle, model)`
Client entry point for the Plow Loop substrate-priming workflow. Passes a domain bundle to a substrate worker model, runs the classify-plow-prime-dispatch cycle per `canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089.eblet.md`. Returns a `PlowSession` with confidence score and iteration controls.

---

## §2 PACKAGE FORM (FUTURE / ROADMAP)

> **ROADMAP-CLASS. Not published. Not coded.**

**Primary — TypeScript (npm):**
```
@liana-banyan/substrate
```
- Pure TypeScript with Web Crypto API + Node.js 18+ compatible
- No Electron dependency
- Ships with `SupabaseLedgerAdapter` reference implementation
- tsconfig targets ES2020 with ESM + CJS dual-build
- Published to npmjs.org under `@liana-banyan` org

**Sibling — Python (PyPI):**
```
liana-banyan-substrate
```
- Python 3.10+ package for ML researchers
- Wraps the same relay protocol (WebSocket + Ed25519 via `cryptography` package)
- Priority use case: Jupyter notebooks, ML pipeline integration, Plow Loop clients in research contexts
- Published to PyPI under Liana Banyan Corporation

**Deferred to v2 (NOT in MVP):**
- Rust core with TypeScript/Python FFI bindings — premature optimization for MVP. TypeScript Web Crypto is fast enough for relay signaling and key derivation. Revisit when benchmarks prove a bottleneck.
- Mobile SDK (iOS/Android) — out of scope per §9
- Browser-only bundle (no Node.js) — out of scope per §9

---

## §3 WHAT GETS EXCLUDED vs Full MnemosyneC Client (FUTURE / ROADMAP)

The SDK is the cooperative substrate layer, not the cooperative application layer. The following are explicitly NOT part of `@liana-banyan/substrate`:

| Excluded | Why | Who provides it |
|---|---|---|
| React UI components (`src/components/`) | UI is caller's responsibility | The consuming application |
| Art-deco visual styling | Not substrate logic | Caller provides own design system |
| Tier picker / Ah Hayelped right-size UI | The `canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` detection *logic* can be offered as a separate utility function; the **rendering** stays with the consuming app | Caller renders own tier picker |
| Settings page / Settings UI | Application-layer concern | Caller builds own settings |
| Auto-update mechanism | Apps that consume the SDK manage their own update lifecycle | Caller / Electron app / npm | 
| Tray icon / Electron-specific code | No Electron dependency in SDK | Caller's desktop shell |
| Hugo site assets | Site assets are not substrate | mnemosynec.org / mnemosynec.ai |
| MIC broadcast user-approval modal | The SDK enforces the *signing contract*; the approval UX is the caller's responsibility | Consuming application |
| Star Chamber full orchestration | Star Chamber SCaaS is a separate product per `canon_star_chamber_multi_agent_consensus_verification_product_bp086.eblet.md`; the SDK exposes a `substrate.starChamber.client()` stub that routes to the SCaaS endpoint, not a local Star Chamber engine | SCaaS endpoint at Cost+20% |

---

## §4 LICENSE — APACHE 2.0 RECOMMENDED (FUTURE / ROADMAP)

> **ROADMAP-CLASS. Requires attorney review before publication. This is a recommendation, not a legal instrument.**

**Recommendation: Apache 2.0 for `@liana-banyan/substrate`.**

This maps directly to Layer 2 of the Android-of-AI licensing model as canonized at `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087.eblet.md`:

> *"Selected reference implementations and library-class extractions are published under Apache 2.0. This is the AOSP-equivalent: the open base that for-profit AI companies are EXPLICITLY ENCOURAGED to fork."*

The SDK is exactly this: a library extraction from the cooperative substrate, licensed Apache 2.0 for maximum developer adoption. `npm install` and corporate legal audit teams both prefer Apache 2.0 over SSPL — and that adoption is deliberate. The Android-of-AI model is not Apache because Apache is permissive; it is Apache because Apache is the strategic funnel into the cooperative network effect.

**Cooperative Defensive Patent Pledge #2260 still applies.** Apache 2.0 governs the *copyright* license; Pledge #2260 governs the *patent* license. Any SDK consumer who initiates patent litigation against MnemosyneC or any cooperative member forfeits their patent peace under Pledge #2260. This clause travels with the SDK regardless of the Apache 2.0 copyright license.

**SSPL stays for the full MnemosyneC client.** The installer, the server-side substrate node, and the full cooperative platform remain SSPL v1. SaaS providers who offer the full cooperative stack as a service must open-source their entire service stack per SSPL §13. The SDK does not change this: the SDK is the Apache library layer; the substrate node is the SSPL layer. Two separate release tracks. Clean.

**NOTICE file requirement.** The Apache 2.0 NOTICE file for `@liana-banyan/substrate` will include:
```
This software is part of the Liana Banyan Cooperative Substrate.
Patent peace is conditional on Cooperative Defensive Patent Pledge #2260:
https://lianabanyan.com/pledge-2260
Initiating patent litigation against a cooperative member revokes your patent license.
Trademarks: MnemosyneC, Dr. MnemosyneC, Liana Banyan, Cephas — controlled by Upekrithen LLC.
Not licensable without written permission: licensing@lianabanyan.com
```
Any derivative work must surface this NOTICE file per Apache 2.0 §4(d). This is not an additional restriction — it is the standard Apache 2.0 attribution requirement applied to cooperative-class software.

---

## §5 DISTRIBUTION (FUTURE / ROADMAP)

> **ROADMAP-CLASS. No registry accounts created. No repos published.**

| Channel | Details |
|---|---|
| npm registry | `@liana-banyan/substrate` under existing or to-be-created `@liana-banyan` npm org |
| GitHub | `github.com/liana-banyan/substrate-sdk` — public open-source repo, Apache 2.0 |
| PyPI | `liana-banyan-substrate` — sibling Python package |
| README quickstart | `npm install @liana-banyan/substrate` + 10-line Slackbot example |

**Three reference integrations (reference implementations, not products, not shipped with v1):**

1. **Slackbot** — a Slack app that registers a peer presence in the cooperative mesh, subscribes to MIC broadcasts, and posts them to a channel. Demonstrates `substrate.presence.register()` + `substrate.mic.subscribe()` in a serverless Node.js context.

2. **CLI tool** — a command-line peer that registers in the mesh, lists current peers, and can emit a MIC broadcast. Demonstrates the full identity stack (keypair generation → Soccerball address → relay registration). Useful for mesh debugging.

3. **Jupyter notebook** — a Python notebook that connects to the substrate, primes a domain bundle via Plow Loop, and runs a Star Chamber SCaaS session. Target audience: ML researchers evaluating cooperative substrate for MMLU-Pro style accuracy lift. Cross-references `canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089.eblet.md`.

---

## §6 THREAT MODEL — THE REVERSE-ENGINEERING CONCERN (FUTURE / ROADMAP)

**Honest acknowledgment first (Truth-Always discipline):**

Publishing `@liana-banyan/substrate` to npm accelerates the "for-profit AI company clones it" risk. A company that previously needed to reverse-engineer the relay protocol and identity stack can now run `npm install @liana-banyan/substrate` and read the source. This is real. It is acknowledged.

**Counter-argument (per Android-of-AI canon §5):**

The cooperative-class structure is the moat — not the code. What a for-profit company gets by forking the SDK:
- The relay protocol wire types
- The Ed25519 keypair derivation
- The Soccerball address computation
- The three-gear currency math

What they do NOT get:
- The live cooperative member network
- The Marks economy and its clearing history
- The Caithedral Federation trust graph
- The MIC broadcast layer with Ed25519-signed fleet state
- The Star Chamber SCaaS node graph
- The cooperative patent peace (Pledge #2260; sue a member and it's revoked)
- The trademarks (MnemosyneC, Liana Banyan, Cephas, Dr. MnemosyneC — controlled by Upekrithen LLC per TUP)
- The community

A stripped clone has none of these. The inequality trinity (BP085 canon) holds: Free WITH Substrate > Flagship WITHOUT Substrate. A company that forks the SDK and ships it without the cooperative network is shipping the wire protocol without the network. They have the postal standard without the postal service.

**Net assessment:** the SDK ADVANCES cooperative-class adoption faster than it accelerates the threat. Every developer who builds on `@liana-banyan/substrate` is a node in the mesh. The mesh is the moat. The code is the invitation.

**Mitigation in place:** Apache 2.0 NOTICE file (§4 above) + Pledge #2260 patent peace condition + TUP trademark enforcement + Supabase cooperative backend not included in SDK (callers must implement LedgerAdapter for their own backend, or pay Cost+20% to use the cooperative's Supabase instance). The cooperative's live substrate is not in the npm package.

---

## §7 ROADMAP / WORK BLOCKS (FUTURE — NOT AUTHORIZED FOR EXECUTION THIS BP)

> **Each phase requires a separate Marathon dispatch. This section names them; it does not fire them.**

### Phase 0 — SDK Architecture Spec (BP093 or later)
- Audit `src/lib/relay/` — separate pure wire logic from Supabase-coupled calls; define `PresenceAdapter` and `LedgerAdapter` interfaces
- Identify all Supabase singleton calls in candidate library code
- Define the monorepo workspace structure: `platform/` (existing web app) + `packages/substrate/` (new SDK workspace)
- Output: Architecture spec document. No code changes.

### Phase 1 — Monorepo Extraction
- Create `packages/substrate/` as a Yarn/pnpm workspace package within the platform monorepo
- Move `relay_protocol.ts`, `relay_auth.ts` (with production HMAC swap) into `packages/substrate/src/relay/`
- Move currency math (types + constants) into `packages/substrate/src/currency/`
- Move identity/crypto (keypair derivation, Soccerball computation) into `packages/substrate/src/identity/`
- Define `PresenceAdapter` and `LedgerAdapter` interfaces
- Ship `SupabaseLedgerAdapter` reference implementation (re-wraps existing `currencyService.ts` calls)
- All existing platform code imports from `@liana-banyan/substrate` workspace package — no behavior change
- Output: monorepo with internal SDK package that the platform consumes

### Phase 2 — Preview Publish
- Publish `@liana-banyan/substrate@0.1.0-preview` to npmjs.org
- Public GitHub repo at `github.com/liana-banyan/substrate-sdk`
- README quickstart with Slackbot example
- Output: npm package installable by external developers

### Phase 3 — Reference Integrations
- Build Slackbot reference integration (Node.js)
- Build CLI tool reference integration
- Build Jupyter notebook reference integration (Python package `liana-banyan-substrate` PyPI publish)
- Output: three reference repositories under `github.com/liana-banyan/`

### Phase 4 — v1.0.0 GA
- Full SDK surface stable + documented
- All 12 functions from §1 implemented and tested against cooperative substrate
- Integration tests run against live `relay.lianabanyan.com`
- Security audit: Ed25519 keypair handling, HMAC token generation, Thorax handshake
- Output: `@liana-banyan/substrate@1.0.0` stable release

---

## §8 PREREQUISITES BEFORE FIRING THIS MARATHON (HARD GATES)

**None of the above phases may be executed until ALL three gates pass. Founder must ratify gate satisfaction.**

| Gate | Condition | Rationale |
|---|---|---|
| G1 — Revenue | First $100 in cooperative member revenue empirically received | Validates the cooperative economic model is viable before SDK propagates it to external developers. An SDK without a working cooperative is an invitation to a broken party. |
| G2 — Demand | At least 3 cooperative-class developers have explicitly requested SDK access | Validates developer demand before engineering investment. Three is low enough to be real, high enough to be signal not noise. |
| G3 — Membership | MnemosyneC has 50+ active members so the SDK has empirical substrate to test against | External developers need a live mesh to connect to. 50 members is the minimum viable network for meaningful SDK integration testing. Below 50, integration tests are testing a nearly-empty network. |

---

## §9 OUT OF SCOPE (For Future Marathons Even After This One Fires)

These items are excluded from all phases above and require their own separate roadmap decisions:

- **Mobile SDK (iOS/Android)** — requires platform-specific crypto libraries, app store submission, and mobile-specific peer-presence lifecycle (app backgrounding). Not in scope for web/Node first wave.
- **Browser-only SDK bundle (no Node.js requirement)** — browser-only means no WebSocket server capability; relay client is browser-safe but requires careful CSP handling. Deferred.
- **GraphQL surface** — the SDK ships a TypeScript function API, not a GraphQL schema. If a caller wants GraphQL they wrap the SDK themselves.
- **Federation-protocol stabilization** — the Caithedral Federation wire protocol is still evolving. SDK consumers should treat `substrate.caithedral.query()` as experimental until the federation canonical protocol is locked.
- **Star Chamber full local engine** — SCaaS is a separately priced product. A local Star Chamber runner would require multi-model orchestration infrastructure that belongs in a separate roadmap.

---

## COMPOSITION WITH EXISTING CANON

| Canon | Relationship |
|---|---|
| `canon_substrate_portable_mesh_integrates_with_any_reasoning_model_free_or_flagship_bp089.eblet.md` | The SDK is the technical mechanism that makes "portable" real |
| `canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087.eblet.md` | SDK = Apache library extraction Layer 2 of the Android-of-AI model |
| `canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051.eblet.md` | SDK is the propagation mechanism Designed-to-be-Copied pointed at |
| `canon_mic_machine_in_charge_naming_lock_bp086.eblet.md` | `substrate.mic.subscribe()` + `substrate.mic.emit()` |
| `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086.eblet.md` | Ed25519-signed broadcast envelope; I8 security yoke applies to SDK consumers too |
| `canon_three_gear_currency_differential_credits_marks_joules_mechanism_bp086.eblet.md` | `substrate.ledger.read()` + `substrate.ledger.write()` + three-gear invariants |
| `canon_substitution_rail_fiat_marks_credits_barter_payment_taxonomy_bp086.eblet.md` | `substrate.substitution.classify()` |
| `canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091.eblet.md` | `substrate.identity.generateKeypair()` + `substrate.identity.computeCircleNickname()` |
| `canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089.eblet.md` | `substrate.plow.prime()` |
| `canon_star_chamber_multi_agent_consensus_verification_product_bp086.eblet.md` | `substrate.starChamber.client()` stub (Phase 4+) |
| `canon_lan_as_wan_test_mode_4_machine_mesh_bp085.eblet.md` | `substrate.presence.register()` always routes via WAN relay |

---

## STATUS

**STAGED. NOT FIRED. AWAITING FOUNDER REVIEW.**

Three hard gates in §8 must pass before any phase executes. No Knight work authorized. This dispatch sits in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` until Founder ratifies gate satisfaction and clears a specific phase for execution.

Companion canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_substrate_sdk_roadmap_apache_library_tier_separate_from_mnemosynec_client_bp091.eblet.md`

---

*Bishop Sonnet 4.6 · BP091 · 2026-06-22 · ROADMAP-CLASS · DO NOT FIRE YET · Heart-of-Peace toward future builders · Truth-Always on threat model*
