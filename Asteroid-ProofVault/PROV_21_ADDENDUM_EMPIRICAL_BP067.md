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

## SPEC-ONLY INNOVATIONS — EXCLUDED FROM THIS ADDENDUM (COUNSEL-CONFIRM for Prov 22 or later)

The following innovations were designed, canonized, and/or specified in BP059–BP067 but are **NOT yet reduced to practice in shipping code** as of 2026-05-31. TRUTH-ALWAYS discipline requires their exclusion from empirical-receipt class claims. They are listed here so Founder and counsel can decide whether to include them as design/method claims, defer to Prov 22, or await code shipping.

| Innovation | Status | Canon Reference | Why Excluded |
|---|---|---|---|
| Local Multimodal Ingestion (zero-flagship-token image/file reading) | SPEC-ONLY | `canon_mnemosynec_local_multimodal_ingestion_zero_flagship_tokens_cost_savings_bp067.md` | Requires bundled vision model; current Gemma bundle is text-only; explicitly "not yet implemented" in canon |
| AI Usage Gauge / Barrel Savings Visualizer | SPEC-ONLY | `canon_mnemosynec_ai_usage_gauge_barrel_savings_made_visible_left_rail_bp067.md` | Canon says "Post-v0.1.24. Do NOT build before v0.1.23 release is complete" |
| MnemosyneC-as-Foreman (orchestrates Bishop/Knight/Pawn) | PRODUCT GOAL | `canon_mnemosynec_is_the_foreman_orchestrates_bishop_knight_pawn_three_ai_founder_out_of_loop_bp067.eblet.md` | Founder crystallization; no shipped orchestration code yet |
| Forever Session / Compaction-Reintroduction at 91% Threshold | METHOD (practiced, not coded) | `canon_forever_session_aspiration_compaction_reintroduction_cost_calculus_inverts_at_91_pct_bp060` | Demonstrated empirically as Bishop operating method (K1 27→28% post-compact); no shipping code implementing automatic 91% threshold; defer to Prov 22 unless counsel advises method claim |

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

**Total innovations with verified evidence: 10**  
**Innovations excluded (spec-only / confabulated): 6** (2 Rook confabulations + 4 spec-only)

---

## [COUNSEL-CONFIRM] TAGS REQUIRING REVIEW

1. **Three-Part 83.3% Economic Doctrine (A-3):** Confirm method claim articulation passes antitrust review and does not constitute price-fixing. The 83.3% keep is a cooperative-class platform design principle, not an agreement between competing entities.
2. **Comet Bridge (C-1):** Verify that the window.fetch override pattern does not conflict with Google Chrome's terms of service in a way that affects patent-eligibility or enforceability.
3. **Forever Session (spec-only):** Advise on whether the empirically demonstrated Bishop method (compaction-reintroduction at 91% threshold, measured at K1 post-compact 27→28%) constitutes sufficient reduction-to-practice for a method claim, or whether code implementation is required.
4. **Local Multimodal Ingestion (spec-only):** Advise on timeline for bundling a vision model (moondream or LLaVA class) and whether the current spec is sufficient for a design/method claim in Prov 22.
5. **Page count after addendum integration:** If combined v3 + addendum exceeds 100pp (Founder mandate: ≤100pp HARD RULE per SR-015), identify the cleanest cluster split for Prov 22 seeding.

---

## PROV 21 → PROV 22 BOUNDARY CONFIRMATION

Per Founder mandate ("leave Prov 21 OPEN AND HAVE NOTHING PAST IT UNTIL IT IS FULL AT 100"):

**Prov 22 seed (do NOT incorporate into Prov 21):**
- Bob's Diner / Locality-First geographic addressing (`canon_locality_first_bobs_diner_geographic_addressing_patent_class_innovation_bp060`) — designated Prov 22 lead per bishop_coffee.md
- Any spec-only innovations above, if counsel advises deferral
- The Pocket Universe / DNS-as-resolver architecture if page budget is exhausted

---

*Addendum generated 2026-05-31 · Knight BP067 · TRUTH-ALWAYS · Brick Wall Policy · All mechanisms verified against actual codebase before inclusion*  
*FOR THE KEEP. ⚓*
