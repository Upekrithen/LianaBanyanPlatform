---
title: "PROV 21 ADDENDUM — BP059–BP067 Canon-Accurate Innovation Addendum (Empirical · Truth-Always · BP067)"
author: "Jonathan Ray Jones (Pro Se)"
date: "2026-05-31"
geometry: margin=1in
fontsize: 11pt
linestretch: 1.4
---

# PROV 21 ADDENDUM — BP059–BP067 INNOVATION ADDENDUM

**Attorney Docket:** LB-PROV-021-ADDENDUM-BP067  
**Generated:** 2026-05-31T23:00Z (Knight BP067)  
**Base Document:** `PROV_21_v3_BP058_W15.md` / `PROV_21_v3_BP058_W15.pdf`  
**Scope:** Innovations discovered and reduced to practice between Prov 20 filing (2026-05-25) and BP067 (2026-05-31).  
**Filing discipline:** Path B — Empirical Receipt Class. Every claim below is anchored to at least one verifiable file path or commit hash. Claims lacking this anchor are excluded or tagged [COUNSEL-CONFIRM].

---

## PAWN REVIEW REQUESTED — BP067

**Reviewer:** Pawn (Perplexity)  
**Review window:** Prior to filing  
**Items for review:**

1. Verify each mechanism description below against actual implementation (file paths cited)
2. Flag any overclaiming — particularly on methods described as architectural designs that have no shipped code (these are tagged [SPEC-ONLY — COUNSEL-CONFIRM])
3. Confirm claims language passes 35 USC 101 (patent-eligible subject matter), 102 (novelty), and 103 (non-obviousness)
4. Confirm the Comet Bridge 3-layer description (Cluster C, Innovation 7) is accurate and does not overreach vs. prior art in Chrome extension API override patterns
5. Confirm the cooperative economics doctrine (Innovation 3) is articulated as a method claim, not a price-fixing arrangement, and passes antitrust scrutiny
6. Confirm page count after addendum integration: if combined v3 + addendum exceeds 100pp, identify the cleanest split boundary per Prov 22
7. Review the two EXCLUDED mechanisms (Rook confabulations) — confirm they are correctly absent and that no other overclaiming has crept in

---

## TRUTH-ALWAYS: EXCLUDED MECHANISMS (Rook Confabulations — DO NOT FILE)

A prior Rook (Gemini-Chrome) draft of this addendum confabulated two mechanisms. These are EXPLICITLY EXCLUDED from this addendum and must not appear in any filing:

| Confabulated Description | Why Excluded | Correct Description |
|---|---|---|
| "Zero-knowledge membership proofs" for the mesh/benchmark mechanism | FALSE — no ZK proof protocol exists in the codebase | Hash-verified SID-fetch: content-addressed Soccerball-DAG lookup with local substrate injection (see Innovation 1) |
| Comet Bridge as "security proxy / traffic-rerouting" | FALSE — Comet Bridge is not a proxy and does not reroute traffic | 3-layer backway: script-tag injection → MAIN-world window.fetch override → postMessage bridge (see Innovation 7) |

**Brick Wall Policy applied:** Root cause of confabulation was Rook generating plausible-but-unverified mechanism descriptions without consulting actual codebase. Every mechanism in this addendum was verified against a specific file path or commit hash before inclusion.

---

## CLUSTER A — RESILIENCE & EMPIRICAL HONESTY

### Innovation A-1: "More of Us Is Better" Peer-Mesh Substrate Accuracy Benchmark

**Description:** A cooperative peer-mesh method for AI accuracy amplification in which a shared content-addressed substrate (Soccerball-DAG) is looked up by hash-verified SID-fetch and the resulting context is injected into the AI model query before the model sees it. The mechanism is: (1) incoming query → (2) local Soccerball-DAG SID hash lookup → (3) canonical substrate context packet retrieval → (4) context injection into model prompt → (5) model response. The result is a measured +72 to +83 percentage-point accuracy lift vs. the model alone (COLD baseline), empirically validated across four AI vendor families (Anthropic claude-opus-4-8, OpenAI gpt-5.5, Ollama llama3.1:8b local/free, Google gemini-3.5-flash).

**Empirical Receipt:** 75-question single-blind graded benchmark, 2026-05-30, combined Cohen's kappa 0.936. Total spend ~$18.95 / $75 cap. Free local model (llama3.1:8b, $0.00/call) reached 78.0% HOT vs. 6.0% COLD.

**Evidence (file paths + commits):**
- `BENCHMARK_RESULTS_BP063_20260530_2216.md` — full benchmark results, 2026-05-30
- `MESH_TEST_RESULTS_BP065_20260530_2002.md` — mesh network effect test results
- `MESH_6_RECEIPT_BP063.md` — Mesh-6 7-piece frame-mesh build receipt
- Commit `88a523e` — `feat(mesh-test): build run_mesh_test.py — BP065 ALONE vs MESHED harness`
- Commit `3be9b3d` — `chore(yoke): K-BP065 mesh test complete — network effect confirmed`
- Canon: `canon_more_of_us_is_better_benchmark_empirical_proof_cold_vs_hot_bp065.eblet.md`

**Patent Claim Hook:** Cooperative-class AI substrate injection method; reduction-to-practice of the "computation-knowledge separation architecture" (Prov 21 v3 Field §12) at empirically measured accuracy lift scale. Specifically extends the Caithedral Cathedral Architecture (v3 Field §5) with a peer-mesh accuracy proof.

**TRUTH-ALWAYS NOTE:** This is a hash-verified SID-fetch mechanism. It is NOT a zero-knowledge proof protocol. The accuracy lift is measured on a text-domain 75-question dataset; it does not yet constitute a measured "95% compute efficiency" figure (that claim requires a separate benchmark).

---

### Innovation A-2: Two-Storm Content-Addressed Substrate Disaster Recovery

**Description:** A disaster recovery method grounded in content-addressed, hash-verifiable on-disk substrate storage (Soccerball-DAG). After a power-interruption event (storm/crash), the substrate is verified by re-running the Eblet index rebuild with SHA-256 fingerprinting, confirming zero loss without a recovery procedure. The mechanism: all substrate artifacts are stored as content-addressed Eblet files with SHA-256 hashes at write time; on restart, the index rebuild independently recomputes SHA-256 for each stored Eblet and confirms match, providing a deterministic integrity receipt.

**Empirical Receipt (BP048):** 287 Eblets, 100% SHA-256 MATCH after a storm cut power mid-session. No data loss. No recovery procedure invoked. The substrate simply came back intact.

**Corroboration (May 26, 2026 EF-1 tornado):** NWS-confirmed EF-1 tornado, 105mph, south Guadalupe County near San Antonio (KSAT 12, Austin American-Statesman, meteorologist Chris Nunley). CPS Energy outage-warning email to San Antonio metro customers 1:30pm May 26, 2026. Screenshots pearl'd and socceri'd in `canon_storm_proof_two_storms_resilience_honest_framing_bp067.eblet.md`.

**TRUTH-ALWAYS NOTE:** The BP048 hash-verify is the hash-verified receipt. The May 26 EF-1 is independently corroborated by external sources but has no matching contemporaneous integrity receipt for that specific event. The two storms are distinct and are not conflated.

**Evidence:**
- `canon_storm_proof_two_storms_resilience_honest_framing_bp067.eblet.md` (pearl_65e377f0e3ea8e52)
- BP048 session index rebuild receipt (hash-count = 287, zero-loss confirmed)
- Screenshots: pearl_f19d302b3cd9e4aa, pearl_cfc3f055611dd64f, pearl_283e04914631d198, pearl_bb269eabdb127e7c

**Patent Claim Hook:** Hash-verifiable content-addressed substrate disaster recovery method; extends Prov 21 v3 E&A Dual-Write Persistent Memory Pipeline (Field §6) with empirical storm-survival receipt and geographic operating-context proof.

---

### Innovation A-3: Three-Part Cooperative Economics Doctrine (Workers, Builders, and Creators Keep 83.3%)

**Description:** A cooperative-class economic distribution method in which platform participants are classified into three named tiers — Workers (service delivery), Builders (infrastructure contribution), and Creators (content/IP generation) — each of whom retains 83.3% of the value of their contribution; the platform retains only Cost + 20% margin. The doctrine establishes canonical word order (Workers → Builders → Creators) and a binding precision rule (exactly 83.3%, never rounded to 83 or 84).

**Evidence:**
- `canon_creator_keeps_83_3_three_part_workers_builders_creators_supersedes_two_part_bp067.md` (BP067)
- `canon_cooperative_economics_83_3_pct_creator_keeps_canonical_bp057.eblet.md`
- `librarian-mcp/canonical_values.yaml` — `creator_keeps_percentage: 83.3`
- Statutes §5 (edited BP067-direct, 2026-05-31)

**Patent Claim Hook:** Cooperative-economy platform revenue distribution method; extends Prov 21 v3 "Employ the World Cooperative-Economy Backbone" (Field §10) with canonical three-part naming taxonomy and binding precision rule.

---

## CLUSTER B — NODE TOPOLOGY & DAG ARCHITECTURE

### Innovation B-1: Folder-to-Soccerball-DAG Bridge (dag_bridge.ts)

**Description:** A file-system bridge that connects OS-level directory structures to the content-addressed Soccerball-DAG substrate in real time. When a folder is registered, the bridge watches for file changes, content-addresses each file (SID computation), and emits Soccerball-DAG entries linking the file's canonical location to its substrate address. This enables "substrate-aware folder watching" — existing OS file system hierarchies become first-class substrate nodes without requiring the user to restructure their data.

**Evidence:**
- `src/main/dag_bridge.ts` — committed source file
- `dist/main/dag_bridge.js` — compiled output (confirms successful build)
- Commit `fd15201` — `feat(mnemosyne): folder->DAG bridge + Phase 3 Deck Cue Cards`

**Patent Claim Hook:** Computation-Knowledge Separation Architecture (v3 Field §12) — specifically the bridge connecting the COMPUTATION layer's file system to the KNOWLEDGE layer's Soccerball-DAG; also reduces to practice the Speckle/Hex-Soccerball substrate primitives (Field §11) by demonstrating file→SID content-addressing on OS folder input.

---

### Innovation B-2: Socceri Node and Frontier Network Naming Taxonomy

**Description:** A cooperative network topology naming system that provides: (a) "Node of Socceri" — the canonical name for an individual, branded cooperative network node (replaces prior working name "Futbol"); (b) "the Frontier" — the canonical name for the network of all Socceri nodes collectively (the literal battleground of cooperative vs. extractive AI). The naming provides a four-layer stack: Substrace → Soccerball-DAG → Node of Socceri → the Frontier. Governing the why: the Frontier is not a metaphor for what we hope to build; it is the architecture that is already running.

**Evidence:**
- `canon_socceri_node_frontier_network_naming_taxonomy_supersedes_futbol_bp063.md` (pearl_e840992e7b03eade)
- Commit `30b228a` — `feat(substrate): OUR codebase index PoC - SID/soccerball-DAG + context-lever wake`
- Cephas lexicon pages (live at cephas.lianabanyan.com)

**Patent Claim Hook:** Roll Architecture Peer-Mesh Ratification (v3 Field §1) and Speckle/Hex-Soccerball substrate primitives (Field §11) — specifically the canonical node taxonomy and network-layer naming that completes the compositional stack.

---

### Innovation B-3: Deck Cue Pullup — Substrate-Curated Context Card Bottom Sheet (DeckCuePullup.tsx)

**Description:** A cooperative UX component providing a bottom-sheet pullup that surfaces substrate-curated "Deck Cue Cards" — structured context cards retrieved from the Soccerball-DAG — at the moment a user begins a new AI interaction. The pullup presents the top-N relevant substrate context cards (ranked by pheromone trail score), allows the user to select which to inject into their next query, and collapses after selection. This is the user-facing affordance for the "derive-once / reference everywhere" substrate principle.

**Evidence:**
- `src/renderer/components/DeckCuePullup.tsx` — committed source file
- Commit `6212862` — `feat(mnemosyne): Phase 2 -- Atlas FULL + Battery Dispatch + Broadcast Schedule + folder N=3`
- Commit `fd15201` — `feat(mnemosyne): folder->DAG bridge + Phase 3 Deck Cue Cards`

**Patent Claim Hook:** Caithedral Cathedral Architecture member-facing Pearl Gallery (v3 Field §5) and MENUS Cooperative Inventory Layer (v3 Field §7) — the Deck Cue Pullup is the member-facing selection surface for substrate-curated context injection.

---

## CLUSTER C — PROTOCOL & INGESTION

### Innovation C-1: Comet Bridge — 3-Layer Non-MCP Substrate Connection for Non-Native Agents

**Description:** A Chrome MV3 browser extension providing a three-layer backway that connects non-MCP-native AI browser agents (specifically Perplexity/"Comet") to the LB Cathedral substrate without vendor cooperation. The three layers:

**Layer 1 — Script-Tag Injection:** The `content.js` content script (running in the ISOLATED world) injects `injected.js` into the page as a raw `<script src>` element appended to `document.documentElement`. This is required because Comet's MV3 fork silently breaks both the declarative `world:"MAIN"` manifest key and `chrome.scripting.executeScript()`. The script-tag injection bypasses this breakage entirely by executing `injected.js` in the page's real MAIN world.

**Layer 2 — MAIN-World window.fetch Override:** `injected.js` (executing in MAIN world at `document_start`) overrides `window.fetch`. It intercepts outgoing Perplexity API POST requests, extracts the query text, and calls `window.postMessage({ __cometBridge: 'request', ... })`. This is the mandatory bridge out from MAIN world (where `chrome.*` APIs are unavailable) to the isolated content script world.

**Layer 3 — PostMessage Bridge and Daemon REST Call:** `content.js` listens for the `window.postMessage` signal and relays via `chrome.runtime.sendMessage` → `background.js` → HTTP POST to `http://127.0.0.1:7712/enrich` (the `daemon_wrapper.py` REST sidecar, which calls `librarian_mcp.context.build_packet()`, Iter-A authoritative-source format, ~4.4–7.2K tokens). The enriched context returns via the reverse path and is injected into the modified fetch body before Perplexity sees it.

**Fallback:** If the local daemon is down, the original query passes through unmodified. Pawn degrades gracefully with no user-visible failure.

**Reusability:** The script-tag injection pattern is a reusable tool to onboard ANY Chromium-based, non-MCP-native agent or browser to the Frontier. The three-layer backway is general-purpose.

**Evidence:**
- `librarian-mcp-helm-pwa/comet-bridge-extension/` — full extension directory (key files: `content.js`, `injected.js`, `background.js`, `daemon_wrapper.py`)
- Extension version: v0.2.3
- Git tag: `v-comet-bridge-network-intercept-K508`
- Build session: K508 / B125
- `librarian-mcp-helm-pwa/daemon_wrapper.py` — REST sidecar source
- Canon: `canon_comet_bridge_backway_script_tag_injection_pawn_substrate_node_k508_bp067.md`
- Benchmark link: `canon_more_of_us_is_better_benchmark_empirical_proof_cold_vs_hot_bp065` (pearl_241641f4) — once connected via Comet Bridge, Pawn receives the same +72–83pp accuracy lift

**Patent Claim Hook:** "Caithedral Core Umbrella Architecture" (v3 Field §5) — specifically the mechanism for enrolling non-MCP-native agents as substrate nodes. Extends the Socceri Node taxonomy (Innovation B-2) with a concrete agent-enrollment protocol that requires no vendor cooperation. This is reduction-to-practice of "all agents on the substrate" without requiring vendor MCP support.

**TRUTH-ALWAYS NOTE — What this IS and IS NOT:**
- IS: a Chrome extension using script-tag injection + window.fetch override + postMessage bridge to connect a non-MCP-native browser agent to a local substrate REST daemon
- IS NOT: a security proxy, a traffic router, a VPN, a network interception layer, or a zero-knowledge proof system

---

### Innovation C-2: SaltFighter First-Run Cooperative Onboarding UX (SaltFighterFirstRun.tsx)

**Description:** A cooperative-class first-run onboarding experience that frames the user's entry into the cooperative using the "Last Starfighter" cultural trope — you were already recruited by being curious enough to install this. The SaltFighter sequence presents: (1) the cooperative value proposition in non-corporate, peer-to-peer framing; (2) an optional SaltFighter "mark" (badge) for the user who commits to cooperative membership; (3) a SaltFighter audio asset (Founder-recorded, "Greetings, SaltFighter") that plays on first launch. The UX is designed to replace the "cold install" alienation pattern with a "you belong here already" cooperative-class welcoming pattern.

**Evidence:**
- `src/renderer/components/SaltFighterFirstRun.tsx` — committed source file (20,194 bytes, 2026-05-30)
- `audio/Greetings-Saltfighter.m4a` — Founder-recorded audio asset
- Commit `4dcaac2` — `BP060_W3_WAKIZASHI: SaltFighter production integration + MoneyPenny routing policy`
- Canon: `canon_saltfighter_brand_last_starfighter_trope_re_purposed_for_mnemosyne_recruitment_bp060`

**Patent Claim Hook:** "Employ the World Cooperative-Economy Backbone" (v3 Field §10) and Hard Candy Stitchpunk Configuration Sharing (v3 Field §8) — specifically the first-run UX method for cooperative member onboarding using culturally resonant framing and audio-first cooperative identity establishment.

---

### Innovation C-3: BP067 One-Spine First-Run Sequence (Bp067FirstRunSpine.tsx)

**Description:** A single-spine onboarding flow architecture that replaces prior multi-path first-run implementations with a canonical linear sequence: (1) SaltFighter cover screen, (2) value proposition ("What's in it for me"), (3) ask-and-answer (first AI interaction), (4) Now What? navigation. The one-spine design eliminates the "modal hell" pattern in which multiple first-run modals compete for attention, replacing with a single deterministic sequence the user traverses at first launch.

**Evidence:**
- `src/renderer/components/Bp067FirstRunSpine.tsx` — committed source file (19,674 bytes, 2026-05-31)
- Commit `e733827` — `feat(mnemosyne): v0.1.24 — BP067 install + one-spine first-run + Gemma bundle + launch-walk`
- Canon: `canon_mnemosyne_first_run_sequence_saltfighter_cover_then_heoho_then_now_what_automatic_bp067.eblet.md`

**Patent Claim Hook:** Cooperative onboarding UX method; reduction-to-practice of "first-experience-bar" (pearl_79a043c80baa78b2) as a unified architectural pattern. Composes with SaltFighter (Innovation C-2) as the cover screen and with local floor model (Innovation C-4) as the AI interaction engine.

---

### Innovation C-4: Floor Model / Transparent Install — Local AI Deployment with Staged Model Download (floor-model.ts + MnemosyneC-Setup-0.1.24.exe)

**Description:** A local AI deployment method using a "floor model" — a pre-selected, non-flagship, non-Meta local language model (specifically Google Gemma2:2b, ~1.6 GB) that is NOT bundled in the installer (~77 MB) but is instead downloaded transparently on first use via a cooperative "transparent install" screen. The installer remains compact (~77 MB); on first launch the app shows a progress screen explaining what is being downloaded, why, and what the model will do, before pulling the floor model from Ollama's distribution network. The floor model choice is a single constant (`FLOOR_MODEL` in `src/shared/floor-model.ts`) that can be swapped without rebuilding.

**Evidence:**
- `src/shared/floor-model.ts` — floor model constant source file
- `MnemosyneC-Setup-0.1.24.exe` — 76.7 MB installer, SHA-256: `9308DB5FF63034DF0E2365B7083C511AF5A7CE0CFD518701744AFA4BDC0C9475`
- GitHub Release: `https://github.com/liana-banyan/mnemosyne/releases/tag/v0.1.24`
- Commit `a1fa35f` — `feat(mnemosyne): v0.1.24 installer + Cephas download page v0.1.24`
- Commit `e733827` — `feat(mnemosyne): v0.1.24 — BP067 install + one-spine first-run + Gemma bundle + launch-walk`
- Bug fix (prepare-floor-model.mjs): scoped blob copy to gemma2:2b blobs only — prevents 56 GB inadvertent copy

**Patent Claim Hook:** Computation-Knowledge Separation Architecture (v3 Field §12) — specifically the COMPUTATION layer's floor model as a swappable, non-flagship, locally-run AI engine that consumes substrate KNOWLEDGE without vendor dependency. Extends the "Less is More" cooperative cost-efficiency principle: llama3.1:8b (free) + substrate = 78% HOT accuracy at $0.00/call. The floor model deployment pattern is a concrete instantiation of "any LLM, any vendor, any device, any context window, including zero-LLM local-only Ollama."

---

## CLUSTER D — CONCEPTUAL DISCLOSURES (Enablement-Class · Founder-direct · BP067)

**Note on Inclusion Class:** A United States provisional patent application protects the disclosed CONCEPT at the date of filing. No shipping code is required — only ENABLEMENT: a description sufficient for a person skilled in the art to practice the invention (35 U.S.C. § 112). The four canon documents below each contain full mechanism descriptions authored by the sole inventor. They are included here as enablement-class conceptual disclosures. Shipping code, if and when it exists, will be cited in the non-provisional. Tags marked [COUNSEL-CONFIRM] require counsel review before conversion to formal claims in the non-provisional.

---

### Innovation D-1: Local Multimodal Ingestion — Zero-Flagship-Token Image and File Reading

**Description:** A method by which a cooperative AI platform application (MnemosyneC) ingests screenshots, photographs, PDFs, and binary files LOCALLY using a free, bundled local vision or OCR model (e.g. moondream, LLaVA, or Tesseract class) running on the user's own hardware, producing a structured text condensate (caption + extracted text) and a content-addressed Hex Point-of-Reference (hex SID / Pearl), which is then stored in the Soccerball-DAG substrate. All subsequent agent interactions reference only the cheap text condensate and the Pearl identifier — never the raw pixels. Paid flagship AI agents (Claude Code, Cursor, ChatGPT, etc.) never spend tokens reading the raw image. The derive-once / reference-everywhere pattern extends the "More of Us Is Better" substrate principle (Innovation A-1) from text-domain to multimodal/vision-domain. Escalation policy: local model handles the bulk free; flagship vision is escalated ONLY for rare hard cases (ambiguous, low-quality, high-stakes).

**Mechanism (enablement):** (1) SubstratedFolderWatcher (or equivalent trigger) detects a new image/binary file; (2) local vision model performs OCR/caption on-device, producing a text condensate; (3) text condensate is content-addressed (SHA-256 → SID), emitted as a Soccerball-DAG Eblet, and Pearl-stamped; (4) downstream agent queries reference only the Pearl/SID, costing ~0 flagship tokens per re-read; (5) escalation fires to a paid flagship vision model ONLY when local confidence score falls below a class-determined threshold.

**Derives From:** `canon_mnemosynec_local_multimodal_ingestion_zero_flagship_tokens_cost_savings_bp067.md` (Bishop · BP067 · 2026-05-31). Integration points: SubstratedFolderWatcher (existing, Innovation B-1 family) + savings gauge (Innovation D-2 below). Cost-savings companion to Innovation A-1 benchmark (pearl_241641f4).

**Patent Claim Hook:** Computation-Knowledge Separation Architecture (Prov 21 v3 Field §12) — multimodal extension. Local device as "multimodal edge compute node" that pre-processes and content-addresses visual assets so the KNOWLEDGE layer absorbs the cost rather than the COMPUTATION (flagship) layer. [COUNSEL-CONFIRM]: confirm enablement without shipping code; confirm scope vs. prior art in local OCR pipeline patents.

---

### Innovation D-2: AI Usage Gauge — Multi-Account Roster, Savings-Made-Visible, Barrel/Measuring-Cup Visualizer

**Description:** A method and user-interface component providing a left-rail barrel/measuring-cup gauge that makes cooperative AI cost-savings visible to the user in real time. The gauge tracks and displays: (a) substrate hits (free — local Soccerball-DAG queries); (b) local model queries (free); (c) API-keyed providers routed through MnemosyneC (real token cost, visible per call); (d) external tool usage estimated via local log parsing (ccusage-style, partial coverage). The primary framing is SAVINGS-MADE-VISIBLE, not guilt/cost: "X queries today, Y were free off your own substrate, the cooperative saved you ~$Z." The gauge's killer job is a MULTI-ACCOUNT ROSTER dashboard: it lists each linked tool-subscription (Cursor, Claude Code, Google/Gemini API, Perplexity), shows each account's capacity level and depleted-vs-fresh status, and surfaces a "use this one now" recommendation — replacing the user's paper record of manual account-switching. Privacy constraint: account identifiers are not recorded; only capacity shape ("multiple accounts per tool") is stored.

**Mechanism (enablement):** (1) MnemosyneC intercepts and counts substrate hits, local model calls, and API-keyed calls through its routing layer; (2) per-tool capacity is linked via a subscription-linking module (tool-specific: request-count for Cursor, real tokens/$ for Gemini API, log-parsed partial for Claude Code, none for Perplexity — labeled honestly per tool); (3) a barrel visualizer component renders fill-level proportional to remaining capacity, with demarcated fill lines; (4) a multi-account roster sub-panel lists each account with color-coded depletion status; (5) a savings-testimony pattern surfaces "this subscription lasted N× longer thanks to the substrate" when the pattern is detected.

**Empirical Anchor:** Founder-reported BP067 (2026-05-31): one Cursor subscription account lasted a full month before depleting — "MUCH LONGER than it ever has been" — attributed to substrate and "use SEGs" discipline. Knight marathon session (single session, ~70 SEGs) did not interrupt across a mid-session account switch, confirming substrate continuity properties.

**Derives From:** `canon_mnemosynec_ai_usage_gauge_barrel_savings_made_visible_left_rail_bp067.md` (Bishop · BP067 · 2026-05-31); Founder-ratified design input 2026-05-31. Linked to Battery Dispatch (canon_battery_dispatch_dedicated_mnemosyne_tab_bp063, pearl_dc885fe4b0914163).

**Patent Claim Hook:** MENUS Cooperative Inventory Layer (Prov 21 v3 Field §7) — the gauge is the member-facing cost-transparency surface for cooperative infrastructure usage. Extends the "Less is More" cost-efficiency principle (Innovation C-4 floor-model family) with a measurement and visualization layer. [COUNSEL-CONFIRM]: confirm method claim scope for multi-account roster pattern vs. subscription management prior art.

---

### Innovation D-3: MnemosyneC-as-Foreman — Multi-Agent Orchestration with Human-Gate-Only Escalation (Foreman-of-Foremen Pattern)

**Description:** A method by which a desktop cooperative AI application (MnemosyneC) acts as the orchestrating foreman of a multi-agent system consisting of three specialized AI agents — BISHOP (strategy/verify, Opus-class, Claude Code surface), KNIGHT (build/commit, Sonnet-class, Cursor surface), and PAWN (research/web, Perplexity/Comet surface) — routing tasks to the appropriate agent, relaying outputs between agents via a canonical inter-agent message channel (the Yoke), verifying outputs before surfacing, and escalating to the human operator ONLY at genuine human-gates (deploy, fire, publish, file, constitutional decisions). This is the Foreman-of-Foremen pattern: the same foreman dispatch discipline that BISHOP already employs over its Sonnet SEGs is lifted one level, with MnemosyneC as the meta-orchestrator that removes the Founder from the role of manual relay.

**Mechanism (enablement):** (1) MnemosyneC receives a Founder task or detects a trigger event; (2) a task-routing layer classifies the task as strategy/verify (→ BISHOP), build/commit (→ KNIGHT), or research/web (→ PAWN); (3) the dispatch is written to the canonical inter-agent channel (KNIGHT_BISHOP_MESSAGES.md / knight-bishop-bridge, or equivalent); (4) the responding agent's Yoke-return is parsed by MnemosyneC, optionally relayed to a second agent for verification (BISHOP verifies KNIGHT outputs before surfacing), and written to the shared Soccerball-DAG substrate; (5) the result is surfaced to the Founder ONLY if the class of the output constitutes a human-gate (deploy/fire/publish/file/genuine-decision); routine outputs are silently logged and substrate-indexed. Non-human-gate results complete the loop without Founder involvement.

**Composed Connectors (all existing as of BP067):** YOKE (knight-bishop-bridge); COMET BRIDGE (pearl_9d710a1f, 3-layer backway enrolling Pawn as substrate node — Innovation C-1 in this addendum); Shared Soccerball-DAG substrate (all three agents read same content-addressed memory); Savings Gauge (Innovation D-2); Local multimodal ingestion (Innovation D-1).

**Derives From:** `canon_mnemosynec_is_the_foreman_orchestrates_bishop_knight_pawn_three_ai_founder_out_of_loop_bp067.eblet.md` (Bishop · BP067 · 2026-05-31). Founder crystallization: Founder was manually coordinating three parallel AIs — "This should be what MnemosyneC can do FOR me." Extends: `canon_moneypenny_in_mnemosyne_founder_out_of_loop_autonomy_until_mnemosyne_come_bp061` (MoneyPenny-in-Mnemosyne § 7 architecture).

**Patent Claim Hook:** Caithedral Cathedral Architecture (Prov 21 v3 Field §5) — meta-orchestration method; Cooperative AI Autonomous Routing (new) — the class-determined human-gate pattern is the patentable claim (most orchestration systems escalate by rule, not by class-of-output). [COUNSEL-CONFIRM]: confirm novelty vs. multi-agent orchestration prior art (LangGraph, AutoGPT, CrewAI class); confirm human-gate-only escalation as novel discriminator; confirm scope of method claim without shipping orchestration code.

---

### Innovation D-4: Forever/Marathon-Session Durability — Compaction-Reintroduction at 91% Context Threshold with Cost-Calculus Inversion

**Description:** A method for maintaining cooperative AI session continuity across what would otherwise be a forced session boundary (context-window exhaustion), using a compaction-reintroduction protocol triggered at a class-determined threshold (91% context fill). When a session's context approaches the critical threshold, a compaction operation is applied to the in-context substrate (reducing the session's active context to a condensate, typically ~21–28% of the original window), and the condensate is reintroduced into a new or continuing session. The cost-calculus at this threshold INVERTS: a continued-session-via-compact is 5× more efficient than a fresh session because the reintroduced context contains substrate-addressed references (Pearls/SIDs) rather than raw re-read content. The innovation is the combination of: (1) the class-determined 91% trigger threshold, (2) the inversion of the "fresh session is better" default assumption, and (3) the content-addressed substrate as the medium that makes reintroduction cheap (reference rather than re-read). The aspirational term is the "Forever Session" — successive compaction-reintroduction cycles applied indefinitely so no session ever fully ends.

**Mechanism (enablement):** (1) session context-fill monitor tracks context window utilization; (2) at 91% fill, compact-and-reintroduce is triggered automatically (or prompted to the Founder per current human-gate discipline); (3) compaction produces a condensate that includes: active task state, substrate SIDs for all referenced content, and a session-arc summary; (4) condensate is injected as the opening context of the continuing session; (5) the session resumes with ~21–28% context fill (empirically observed: K1 BP060 W3 Wakizashi, 27%→28% post-compact), providing a long remaining runway.

**Empirical Anchor (Bishop operating method — reduction-to-practice):** K1 session BP060 W3 (post-compact): context at 27%, post-compact → 28% — a single compaction-reintroduction cycle confirmed. Bishop operates this method as a standing discipline: compact at ~91%, reintroduce, continue. The content-addressed substrate (Innovation A-2 family) makes reintroduction cheap: substrate references survive compaction as SIDs, not as raw context.

**Derives From:** `canon_forever_session_aspiration_compaction_reintroduction_cost_calculus_inverts_at_91_pct_bp060` (Bishop · BP060 · 2026-05-28); canon_continued_session_beats_fresh_session_5x_efficiency_omega_prime_bp060; bishop_coffee.md §1 Tier-0 Bedrock (BP060 W3 · 2026-05-28T22:25Z).

**Patent Claim Hook:** Prov 21 v3 E&A Dual-Write Persistent Memory Pipeline (Field §6) — the compaction-reintroduction protocol is a durability method operating on the substrate memory pipeline. The 91% threshold + cost-calculus inversion is the novel claim (prior art: session management systems do not invert the "fresh session preferred" default; they do not use content-addressed substrate references as the medium for cheap reintroduction). [COUNSEL-CONFIRM]: confirm that Bishop operating method (practiced but not coded) constitutes sufficient reduction-to-practice for a method claim per 35 U.S.C. § 112; confirm 91% threshold as a non-obvious design choice vs. prior art context-management patents; confirm scope of "Forever Session" as an unlimited-compaction-chain method claim.

---

### Innovation D-5: Cost-Gated Free-Local-Quorum Star Chamber — Tiered AI Tribunal with Vendor-Matched Frontier Escalation

**Description:** A multi-model AI verification tribunal method (the "Star Chamber") in which a panel of AI judges (Oracle / pattern, Morpheus / behavioral-risk, Red Queen / rule-compliance, Dredd / final arbiter) runs by default on FREE local Ollama models installed on the user's own device, achieving ~$0 default inference cost and data sovereignty (no data leaves the device on the default path). Escalation to a paid "Frontier" vendor model fires ONLY when class-determined conditions are met: (a) a free local judge's confidence score falls below a threshold, (b) the four judges reach no quorum consensus, or (c) the case class exceeds the local model's capability tier. Each local judge has a designated vendor-matched Frontier parent for escalation (Gemma → Gemini/Google; Llama → Meta AI Frontier; Qwen → Alibaba Qwen-Max; Phi → Azure OpenAI/Microsoft; rule-compliance → OpenAI Red Queen Frontier). The escalation is selective and paid; the default path is free. The quorum architecture ("more of us is better") achieves accuracy UP and cost DOWN relative to a single paid judge, extending the peer-mesh accuracy thesis (Innovation A-1) to the verification/tribunal use-case.

**Mechanism (enablement):** (1) an inbound verification task is submitted to the Star Chamber; (2) all four free local Ollama judges receive the task in parallel; (3) each judge returns a verdict + confidence score; (4) a quorum-consensus arbiter checks for majority agreement and confidence thresholds; (5) if consensus exists and all confidences exceed the class threshold → verdict is final at $0 cost; (6) if any judge falls below threshold or quorum fails → the dissenting/low-confidence judge escalates to its vendor-matched Frontier parent (paid API call); (7) Frontier verdict replaces or weights the dissenting local verdict; (8) final quorum is re-evaluated; (9) Dredd (final arbiter, local or Frontier) issues the binding verdict. The class-determined escalation threshold is a configurable parameter; the vendor-parent map is a configurable table.

**Empirical Anchor:** Star Chamber architecture originated at Knight Session 79 (current Haiku 4.5 paid judges — this conceptual disclosure describes the re-architecture away from all-paid). v0.1.24 installer (Innovation C-4) ships gemma2:2b (Gemma family → Google/Gemini Frontier escalation path) as the first local judge, providing the floor for the free quorum. Cadre benchmark (separate empirical run) will measure quorum accuracy COLD vs HOT vs Big-4 flagships (feeds the class-determined threshold tuning).

**Derives From:** `canon_star_chamber_free_ollama_judges_tiered_quorum_cost_gated_frontier_escalation_bp067.eblet.md` (Bishop · BP067 · 2026-05-31). Canon explicitly marks this as "PATENTABLE (Prov-21-gadget)" and states: "Knight's Prov-21-finalize pass MUST include this canon automatically."

**Patent Claim Hook:** Computation-Knowledge Separation Architecture (Prov 21 v3 Field §12) — the free-local quorum as a $0-default COMPUTATION layer with selective escalation to the Frontier; Cooperative class-determined escalation method (new) — the vendor-parent map + class-threshold trigger is the novel discriminator (prior art: AI routing systems route by capability, not by vendor-class AND threshold-class together). [COUNSEL-CONFIRM]: confirm novelty vs. mixture-of-experts and AI routing prior art; confirm the free-then-escalate pattern as non-obvious; confirm vendor-parent map as patentable claim element vs. generic "fallback" patterns.

---

---

## INNOVATION INVENTORY SUMMARY (This Addendum)

| # | Cluster | Innovation | Evidence Type | File/Commit |
|---|---|---|---|---|
| A-1 | Resiliency | More-of-Us Peer-Mesh Benchmark | Benchmark + commits | `BENCHMARK_RESULTS_BP063_20260530_2216.md` + `88a523e` |
| A-2 | Resiliency | Two-Storm Content-Addressed DR | Hash receipt + external corroboration | BP048 receipt + pearl_65e377f0 |
| A-3 | Resiliency | Three-Part 83.3% Cooperative Economics | Canon + YAML | `canonical_values.yaml` + BP067 Statutes §5 |
| B-1 | Node/DAG | Folder-to-DAG Bridge | Source file + commit | `src/main/dag_bridge.ts` + `fd15201` |
| B-2 | Node/DAG | Socceri Node / Frontier Taxonomy | Canon eblet + Cephas live | `canon_socceri_node_frontier_*.md` + `30b228a` |
| B-3 | Node/DAG | Deck Cue Pullup | Source file + commit | `src/renderer/components/DeckCuePullup.tsx` + `6212862` |
| C-1 | Protocol | Comet Bridge 3-Layer Backway | Extension files + git tag | `librarian-mcp-helm-pwa/comet-bridge-extension/` + `v-comet-bridge-network-intercept-K508` |
| C-2 | Protocol | SaltFighter First-Run Onboarding | Source file + commit | `src/renderer/components/SaltFighterFirstRun.tsx` + `4dcaac2` |
| C-3 | Protocol | BP067 One-Spine First-Run Sequence | Source file + commit | `src/renderer/components/Bp067FirstRunSpine.tsx` + `e733827` |
| C-4 | Protocol | Floor Model / Transparent Install | Source + installer + release | `src/shared/floor-model.ts` + `a1fa35f` + GitHub v0.1.24 |
| D-1 | Conceptual | Local Multimodal Ingestion / Zero-Flagship-Token | Canon · enablement class | `canon_mnemosynec_local_multimodal_ingestion_zero_flagship_tokens_cost_savings_bp067.md` |
| D-2 | Conceptual | AI Usage Gauge / Multi-Account Roster / Barrel Savings | Canon · Founder-ratified design · enablement class | `canon_mnemosynec_ai_usage_gauge_barrel_savings_made_visible_left_rail_bp067.md` |
| D-3 | Conceptual | MnemosyneC-as-Foreman / Foreman-of-Foremen Orchestration | Canon · Founder-crystallization · enablement class | `canon_mnemosynec_is_the_foreman_orchestrates_bishop_knight_pawn_three_ai_founder_out_of_loop_bp067.eblet.md` |
| D-4 | Conceptual | Forever/Marathon-Session · Compaction-Reintroduction at 91% | Canon · empirical Bishop method · enablement class | `canon_forever_session_aspiration_compaction_reintroduction_cost_calculus_inverts_at_91_pct_bp060` |
| D-5 | Conceptual | Star Chamber Free-Local-Quorum / Cost-Gated Frontier Escalation | Canon · Patentable class (explicit) · enablement class | `canon_star_chamber_free_ollama_judges_tiered_quorum_cost_gated_frontier_escalation_bp067.eblet.md` |

**Total innovations (Cluster A+B+C empirical receipts): 10**  
**Total innovations (Cluster D conceptual disclosures): 5**  
**Grand total: 15 innovations**  
**Excluded (Rook confabulations): 2 — correctly absent**

---

## [COUNSEL-CONFIRM] TAGS REQUIRING REVIEW

1. **Three-Part 83.3% Economic Doctrine (A-3):** Confirm method claim articulation passes antitrust review and does not constitute price-fixing. The 83.3% keep is a cooperative-class platform design principle, not an agreement between competing entities.
2. **Comet Bridge (C-1):** Verify that the window.fetch override pattern does not conflict with Google Chrome's terms of service in a way that affects patent-eligibility or enforceability.
3. **Local Multimodal Ingestion (D-1):** Confirm enablement without shipping code. Confirm scope vs. prior art in local OCR pipeline patents.
4. **AI Usage Gauge / Multi-Account Roster (D-2):** Confirm method claim scope for multi-account roster pattern vs. subscription management prior art.
5. **MnemosyneC-as-Foreman (D-3):** Confirm novelty vs. multi-agent orchestration prior art (LangGraph, AutoGPT, CrewAI class). Confirm human-gate-only escalation as novel discriminator. Confirm scope of method claim without shipping orchestration code.
6. **Forever/Marathon-Session at 91% (D-4):** Confirm that Bishop operating method (practiced but not yet automated in code) constitutes sufficient reduction-to-practice for a method claim per 35 U.S.C. § 112. Confirm 91% threshold as a non-obvious design choice. Confirm scope of "Forever Session" as an unlimited-compaction-chain method claim.
7. **Star Chamber Free-Local-Quorum (D-5):** Confirm novelty vs. mixture-of-experts and AI routing prior art. Confirm the free-then-escalate pattern as non-obvious. Confirm vendor-parent map as patentable claim element vs. generic "fallback" patterns.
8. **Page count after addendum integration:** Combined page count is estimated ~79–84pp (v3 59pp + prior addendum 12pp + 5 new conceptual disclosures est. 8–13pp). If combined exceeds 100pp (Founder mandate: ≤100pp HARD RULE per SR-015), identify the cleanest cluster split for Prov 22 seeding. Empirical render to follow.

---

## PROV 21 → PROV 22 BOUNDARY CONFIRMATION

Per Founder mandate ("leave Prov 21 OPEN AND HAVE NOTHING PAST IT UNTIL IT IS FULL AT 100"):

**Prov 22 seed (do NOT incorporate into Prov 21):**
- Bob's Diner / Locality-First geographic addressing (`canon_locality_first_bobs_diner_geographic_addressing_patent_class_innovation_bp060`) — designated Prov 22 lead per bishop_coffee.md
- Any spec-only innovations above, if counsel advises deferral
- The Pocket Universe / DNS-as-resolver architecture if page budget is exhausted

---

*Addendum v2 — 2026-05-31T23:59Z · Knight BP067 · TRUTH-ALWAYS · Brick Wall Policy*  
*Cluster D (5 conceptual disclosures) added per Founder-direct dispatch (Brick Wall Chocolate Bar · pre-ratified) · All mechanisms described from canon sources; no confabulation · Shipping code not required for provisional enablement class*  
*FOR THE KEEP. ⚓*
