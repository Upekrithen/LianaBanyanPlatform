---
name: Bloodhound Rebuild (Topic-Coherent Cooperative Cathedral Index Rebuild with Guided Miner Pre-Anchoring)
description: A topic-coherent Cathedral index rebuild system using a pre-pass TF-IDF corpus scout to build a global keyword density map, rank WellCandidates by scent density, detect drift gaps and overlaps, and pre-anchor Miners before file-one processing—eliminating filesystem-order fragility with deterministic stdlib-only output.
type: aa_formal
innovation_id: "2333"
ratification_session: BP021
prov_filing_status: drafted
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - bloodhound rebuild topic coherent index
  - tfidf corpus scout miner pre anchoring
  - wellcandidate density ranked guided rebuild
  - aa formal 2333
  - bloodhound rebuild bp021 draft
  - follows the scent densest trail first
  - deterministic corpus first ordering pheromone bridge rebuild
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2333 -- Bloodhound Rebuild (Topic-Coherent Cooperative Cathedral Index Rebuild with Guided Miner Pre-Anchoring)

**Filed**: BP021, 2026-05-03 by Knight (Bushel 10 Shadow 8) — INDL-9 Geneva deadline 2026-05-07
**Class**: Crown Jewel candidate. Corpus intelligence primitive.
**Status**: DRAFT — standalone candidate
**Prov filing target**: 16
**Predecessors**: Miners (#2296), Detective Scribe (#2316), Pheromone Substrate (#2317), Bloodhound Scout (K486/B123)
**Empirical anchor**: `bloodhound_report_K487.json` — real corpus scout run, WellCandidates produced for K487 rebuild pass

---

## Section 1 — Innovation Summary

### Plain English: The Tracking Dog That Finds the Scent Before You Open the First File

When a librarian rebuilds an index, the naive approach reads documents in whatever order the filesystem returns them. The first document's dominant vocabulary becomes the organizing principle for everything that follows. This is the K482 fragility: the index gets anchored to whatever word appeared most often in file-1, not to the word that best represents the collection as a whole.

Bloodhound Rebuild solves this with a tracking dog metaphor. A bloodhound doesn't read a trail sequentially — it puts its nose to the ground, sweeps the whole area, and follows the **densest scent cluster** first. Only after it knows where the strongest concentration of scent lies does it commit its path.

The Bloodhound Rebuild system works the same way:

1. **Scout the entire corpus first.** Before any Miner touches a file for indexing, the Bloodhound runs a pre-pass across all source material — every Scribe, every canonical surface, every `.md` file in the corpus. It extracts keywords via TF-IDF, builds a global keyword density map, and clusters topics by naive proximity.

2. **Rank by scent density.** Clusters are ordered from densest (highest intra-cluster keyword co-occurrence) to sparsest. The result is an ordered list of `WellCandidates` — topic clusters numbered by richness, not by filesystem accident.

3. **Detect drift.** The Bloodhound compares the current Scribe index state against the freshly-built global topic map. It surfaces two categories of structural problems:
   - **Gaps**: topics present in the corpus but not covered by any Scribe
   - **Overlaps**: topics indexed in multiple Scribes inconsistently, producing contradictory canonical answers

4. **Pre-anchor Miners before they see their first file.** Each Miner is initialized with `candidate[0].well_name` — the densest topic cluster — as its `primary_topic`. The Miner knows the semantic center of the corpus before it opens file-1. File-order dependence is eliminated by construction.

5. **Update the Pheromone Substrate.** After the guided rebuild, Bloodhound-surfaced topic clusters are converted into Pheromone flavor entries via `pheromone-bloodhound.mjs` (a Node.js companion script). This bridges the Python scout with the JavaScript Pheromone Substrate, extending the substrate's navigational sensitivity to newly discovered topic terrain.

6. **Write to Wrasse Registry.** Successful topic resolutions from the rebuild write to the Wrasse registry (the live-update pipeline), growing the substrate for all future Detective investigations.

The result: a deterministic, reproducible index. The same corpus always produces the same topic map, the same WellCandidate ordering, and the same Miner pre-anchors. The rebuild is verifiable by third parties without access to any LLM — it runs on stdlib only, with no external calls.

**Relationship to Detective Scribe (#2316)**: Detective investigates claims across Scribes; Bloodhound Rebuild is the custodian that keeps those Scribes topic-coherent. Detective is only as reliable as the index it queries. Bloodhound Rebuild maintains the structural integrity that Detective depends on.

**Design invariants**: No LLM calls. No mining during the scout phase. Stdlib only. Light-touch on large corpora (~2MB corpus processed in under 5 seconds). Deterministic output regardless of filesystem ordering.

---

## Section 2 — Patent Claim Language

**Claim 1 (Independent — Method):**
A computer-implemented method for topic-coherent index rebuild in a multi-Scribe knowledge substrate, comprising:
(a) executing a pre-pass corpus scout across all source documents prior to any indexing operation, wherein the scout applies term frequency–inverse document frequency (TF-IDF) extraction to each document independently;
(b) constructing a global keyword density map by aggregating per-document keyword frequency vectors across the entire corpus;
(c) producing an ordered set of topic cluster candidates ranked by intra-cluster keyword density from highest to lowest, wherein said ordering is independent of filesystem document order;
(d) prior to initiating any Miner indexing operation, pre-anchoring each Miner's primary topic using the highest-density cluster candidate as the initial semantic anchor; and
(e) performing the index rebuild pass with each Miner pre-anchored, such that topic assignment is determined by corpus-wide density rather than per-file sequential order.

**Claim 2 (Dependent on Claim 1 — Drift Detection):**
The method of Claim 1, further comprising:
(a) comparing the ordered topic cluster candidates against a current index state to identify coverage gaps, wherein a coverage gap is defined as a topic cluster present in the corpus but absent from any Scribe index entry; and
(b) identifying coverage overlaps, wherein a coverage overlap is defined as substantially the same topic cluster indexed under different identifiers in two or more Scribes;
(c) surfacing said gaps and overlaps as a drift report prior to initiating the guided rebuild pass.

**Claim 3 (Dependent on Claim 1 — Cross-Language Substrate Integration):**
The method of Claim 1, further comprising:
(a) translating the Python-generated ordered WellCandidates into a format consumable by a JavaScript Pheromone Substrate via a cross-language bridge module;
(b) inserting each WellCandidate's topic cluster as a new pheromone flavor entry in the Pheromone Substrate index; and
(c) propagating successful topic resolutions from the rebuild pass to a Wrasse Registry, wherein said registry serves as a live-update pipeline for future query routing.

**Claim 4 (Dependent on Claim 1 — Determinism and Verifiability):**
The method of Claim 1, wherein the pre-pass corpus scout operates without calls to any large language model, without network access, and without randomized operations, such that for any fixed corpus the method produces identical ordered WellCandidates across repeated executions, and wherein said determinism enables third-party verification of rebuild correctness without access to proprietary model weights.

**Claim 5 (Independent — System):**
A system for topic-coherent cooperative knowledge index rebuild, comprising:
(a) a corpus scout module configured to scan a multi-document corpus and produce a keyword density map without modifying the corpus or invoking any indexing operation;
(b) a topic cluster ranker configured to order identified topic clusters by intra-cluster density, producing an ordered WellCandidate list;
(c) a drift detector configured to compare the WellCandidate list against a current multi-Scribe index state and output a structured drift report identifying gaps and overlaps;
(d) a Miner pre-anchor injector configured to supply the highest-density WellCandidate as the primary_topic parameter to each Miner before the Miner processes its first document; and
(e) a substrate bridge configured to translate WellCandidates into pheromone flavor entries in a downstream navigational substrate, wherein said bridge operates across heterogeneous programming languages.

**Claim 6 (Dependent on Claim 5 — Cooperative Licensing):**
The system of Claim 5, wherein said system is deployed within a cooperative platform in which all members of said cooperative receive a perpetual, royalty-free license to use, modify, and redistribute the system, such that the system serves as a shared infrastructure primitive rather than a proprietary moat, and wherein this cooperative licensing constraint is codified in the platform's organizational bylaws.

---

## Section 3 — Composition with Prior Art / Canonical References

### Immediate Predecessors (Liana Banyan Canon)

| Innovation | Number | Relationship |
|---|---|---|
| Cooperative AI Miners (Root + Substrate Miners) | #2296 | Bloodhound Rebuild is the pre-anchoring scaffold for all Miner operations. #2296 Miners are the drillers; Bloodhound is the scout that ensures they drill in the right place first. |
| Detective Scribe | #2316 | Detective investigates across Scribes; Bloodhound Rebuild maintains the Scribe topic coherence that Detective's accuracy depends on. Custodian / Investigator duality. |
| Pheromone Substrate | #2317 | Bloodhound-surfaced topic clusters are injected as new pheromone flavors post-rebuild. Bloodhound Rebuild is a primary growth pathway for the Pheromone Substrate. |
| Wrasse Registry Live-Update Pipeline | #2317 | Successful Bloodhound resolutions write to Wrasse registry, feeding the same live-update pipeline used by Detective hits. |
| Cooperative Defensive Patent Pledge | #2260 | Meta-umbrella. All claims covered under cooperative perpetual royalty-free license. |

### Prior Art Distinctions (External)

**Apache Lucene / Elasticsearch index rebuild**: These systems rebuild from document streams in file-order or shard-order. There is no pre-pass to determine corpus-wide topic density before anchoring the first index entry. File-order dependence is inherent in the architecture. Bloodhound Rebuild's pre-pass + density-ranked pre-anchoring is structurally absent.

**TF-IDF in batch indexing systems**: TF-IDF is a well-known technique for document scoring. The novelty here is not TF-IDF itself but its application as a **pre-pass ordering mechanism** that determines Miner primary_topic initialization **before any indexing document is processed** — reversing the standard pipeline order.

**Incremental index update systems** (e.g., Solr delta import): These update an index incrementally as new documents arrive. They do not perform corpus-wide drift detection comparing indexed state against a fresh global topic map. They do not pre-anchor downstream mining agents.

**Graph-based corpus analysis tools**: Tools like Gephi or topic modeling systems (LDA, BERTopic) identify topic clusters but: (a) require LLM or statistical model calls; (b) produce probabilistic rather than deterministic output; (c) do not bridge to a downstream pheromone/navigational substrate via a cross-language bridge; (d) are not integrated into a rebuild pipeline that pre-anchors knowledge Miners.

The novel combination: **deterministic corpus-first ordering** + **pre-Miner anchor injection** + **drift detection** + **cross-language pheromone bridge** is not present in any known prior system.

---

## Section 4 — Empirical Receipts

### Receipt 1: `bloodhound_report_K487.json`
**Location**: `librarian-mcp/miners/bloodhound_report_K487.json`
**Description**: Real corpus scout output from the K487 rebuild pass. Contains the actual WellCandidates produced from the K487 corpus — a live run of the Bloodhound algorithm against production Cathedral data. Demonstrates that the algorithm produces ordered, ranked topic clusters from real multi-Scribe corpus material. This is the primary reduction-to-practice receipt.
**Significance**: Verifiable by third parties. The file represents a frozen snapshot of a deterministic run — re-running the same corpus through the algorithm produces the same output.

### Receipt 2: K486/B123 Delivery — Initial Bloodhound Implementation
**Location**: `librarian-mcp/miners/bloodhound.py`
**Description**: The K486 session delivered the Bloodhound corpus scout to production. B123 is the Bishop session that validated the delivery. The implementation reads `.md` files, applies per-file TF-IDF, builds the global density map, runs naive proximity clustering, and returns ordered WellCandidates. Confirmed: no LLM calls, no network access, stdlib only.
**Significance**: Establishes the working base implementation from which Bloodhound Rebuild extends. K486 is the anchor session for reduction-to-practice of the scout component.

### Receipt 3: `pheromone-bloodhound.mjs`
**Location**: `librarian-mcp/scripts/pheromone-bloodhound.mjs`
**Description**: Node.js companion script that consumes Bloodhound Python output and injects WellCandidates as pheromone flavor entries into the JavaScript Pheromone Substrate. This is the cross-language bridge described in Claims 3 and 5(e).
**Significance**: Demonstrates the Python → Node.js integration path. This cross-language bridge is a structural element of the novelty claim — it is the mechanism by which Bloodhound corpus intelligence propagates into the navigational substrate used by all downstream Detectives.

### Receipt 4: `npm run rebuild` Integration
**Location**: `librarian-mcp/package.json` (rebuild script), `librarian-mcp/` (full rebuild pipeline)
**Description**: The `npm run rebuild` command in `librarian-mcp/` triggers the full Bloodhound Rebuild sequence: Bloodhound scout → drift detection → guided Miner rebuild → Pheromone Substrate update → Wrasse registry write. This is the production entry point for the full system described in Claim 5.
**Significance**: Demonstrates system-level integration. The rebuild sequence is not a prototype — it is the production mechanism for keeping the Cathedral substrate topic-coherent across all sessions.

### Receipt 5: K482 Fragility Documentation
**Description**: The K482 session documented the pre-Bloodhound failure mode: Root Miner anchoring to `shipped` because that was the dominant keyword in the first file processed, not because `shipped` was the corpus's highest-density concept. This failure mode is the direct motivation for the Bloodhound Rebuild architecture. The contrast between K482 (fragile, file-order-dependent) and K487 (topic-coherent, Bloodhound-guided) is empirical demonstration of the innovation's practical value.

---

## Section 5 — Counsel-Review Checklist

☐ **Claim scope review**: Confirm Claim 1 is broad enough to cover both (a) full rebuild and (b) incremental rebuild scenarios where Bloodhound is used as a pre-pass before a partial re-index.

☐ **TF-IDF prior art clearance**: Confirm that applying TF-IDF as a pre-pass ordering mechanism for Miner pre-anchoring (rather than for document scoring/retrieval) is sufficiently novel. Specifically: is there prior art in which TF-IDF output is used to initialize a downstream agent's semantic anchor *before* that agent processes any document?

☐ **Cross-language bridge claim**: Verify that Claim 3 / Claim 5(e) adequately captures the Python→Node.js bridge as a structural element. Ensure the language of "heterogeneous programming languages" is not so broad as to read on trivially obvious API integrations, but narrow enough to capture the specific scout-to-substrate bridge architecture.

☐ **Determinism claim (Claim 4)**: Confirm that "identical ordered WellCandidates across repeated executions" language survives a 101 challenge. The determinism claim is both a technical property and a verifiability-by-third-parties argument — ensure the latter is properly framed for claim construction.

☐ **Drift detection novelty**: Verify that the combination of (a) producing a fresh global topic map from corpus and (b) comparing it against current index state for gap/overlap detection is not anticipated by incremental index maintenance systems in the prior art. Key differentiator: we compare against a *current Miner-indexed state*, not against a document modification timestamp.

☐ **Cooperative licensing integration**: Confirm that Claim 6's cooperative licensing language is patent-eligible subject matter or whether it belongs only in the specification/background. If Claim 6 is rejected as non-statutory, preserve the cooperative licensing statement in the specification as a policy declaration.

☐ **Prov target 16 filing**: Confirm this draft is incorporated into Provisional Application #16 before the INDL-9 Geneva deadline of 2026-05-07.

☐ **Reduction to practice**: Verify that `bloodhound_report_K487.json` is sufficient as reduction-to-practice for the rebuild (not just the scout). If the full rebuild sequence lacks a separate empirical receipt, schedule a documented rebuild run before the provisional filing.

☐ **Dependency mapping**: Confirm that #2296 (Miners), #2316 (Detective), and #2317 (Pheromone Substrate) are all cited in the provisional filing cross-references. Bloodhound Rebuild is a composition claim — the prior-filed primitives strengthen rather than undermine novelty.

☐ **Abstract idea risk (Alice/Mayo)**: The method claims describe concrete software operations on specific data structures. Confirm that the claims as written survive a § 101 abstract idea challenge by pointing to: the specific corpus scout pre-pass (not an abstract "analyzing data"), the WellCandidate ranked list as a concrete data structure, and the Miner pre-anchor injection as a concrete technical effect (elimination of file-order dependence in index state).

---

## Section 6 — #2260 Cooperative Defensive Patent Pledge Umbrella Citation

Innovation #2333 (Bloodhound Rebuild) is filed under and is governed by the **#2260 Cooperative Defensive Patent Pledge**.

**Effect**: All members of the Liana Banyan Cooperative receive a perpetual, irrevocable, royalty-free license to use, implement, modify, and redistribute the Bloodhound Rebuild system and all methods described in Claims 1–6 above. This license attaches at the moment of membership and survives any transfer or assignment of the underlying patent rights.

**Rationale**: Bloodhound Rebuild is a **shared infrastructure primitive**. It maintains the topic coherence of the Cathedral substrate — the same substrate that serves Detective (#2316), Miners (#2296), and all future knowledge operations across every cooperative initiative (Let's Make Dinner, Harper Guild, JukeBox, Didasko, Power to the People, and all remaining Sweet Sixteen). Restricting access to this primitive would undermine the cooperative's shared infrastructure model. The pledge converts it from a potential moat into a shared commons.

**Bylaw codification**: The cooperative perpetual royalty-free license for all cathedral substrate primitives is codified in the Liana Banyan Corporation bylaws. EIN: 41-2797446. State of incorporation: Wyoming C-Corp.

**Umbrella chain**: #2260 (Pledge) → #2296 (Miners) → #2316 (Detective) → #2317 (Pheromone Substrate) → **#2333 (Bloodhound Rebuild)**. Each successive primitive extends the cooperative's shared infrastructure under the same pledge umbrella.

---

*Filed #2333 DRAFT by Knight Bushel 10 Shadow 8 BP021. Bloodhound: follows the scent to the densest trail first. Topic-coherent rebuild by construction. FOR THE KEEP!*
