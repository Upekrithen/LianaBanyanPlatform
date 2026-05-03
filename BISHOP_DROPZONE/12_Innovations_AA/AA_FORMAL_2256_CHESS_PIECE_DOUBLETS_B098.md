---
name: Chess-Piece Librarian Doublets (Four Parallel Truth-Snapshot Pipelines)
description: A computer-implemented architecture with four parallel ingestion pipelines — prose-semantic (Bishop), schema-structure (Knight), numerical-statistical (Rook), and provenance-citation (Pawn) — processing the same source corpus through intentionally different strategies, producing independent truth snapshots whose pairwise disagreements classify drift type for diagnostic precision.
type: aa_formal
innovation_id: "2256"
ratification_session: B098
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - chess piece librarian doublets
  - four parallel truth snapshot pipelines
  - orthogonal ingestion pipeline architecture
  - aa formal 2256
  - bishop knight rook pawn ingestion pipelines
  - diagnostic disagreement classification drift
  - four doublet chessboard truth triangulation
  - pairwise pipeline consistency comparison
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal #2256 — Chess-Piece Librarian Doublets (Four Parallel Truth-Snapshot Pipelines)

**Innovation #:** 2256 (promoted in B098 from B096 stub; see `INNOVATION_RENUMBERING_LOG_B098.md`)
**Category:** AI Infrastructure / Truth Triangulation / Multi-Agent Architecture
**Crown Jewel:** YES (CJ candidate)
**Original Stub Session:** B096
**Formal Drafting Session:** B098
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh — subject to the Cooperative Defensive Patent Pledge (#2260)
**Source Stub:** `BISHOP_DROPZONE/INNOVATION_STUBS_2237_2245_B096_CHESSBOARD.md`
**Related:** #2237 Four-Doublet Chessboard (parent architecture), #2238 TouchStone (K402 LIVE), #2259 The Scrambler (tests the Doublets)

---

## TL;DR

A computer-implemented architecture in which **four parallel ingestion pipelines process the same source corpus through intentionally different parsers, classifiers, and indexing strategies**, producing four independent truth snapshots that can be compared pairwise to triangulate agreement or diagnose disagreement. The four pipelines are assigned distinct biases by design: one prose-and-semantic-first (Bishop), one schema-and-structure-first (Knight), one numerical-and-statistical-first (Rook), and one provenance-and-citation-first (Pawn). Agreement across the four pipelines produces high-confidence truth. Disagreement is diagnostic — it tells the operator *which kind* of drift has occurred (narrative, schema, numerical, or provenance), rather than merely detecting that something is wrong.

---

## Problem Solved

Single-source-of-truth data architectures are vulnerable to silent drift: when the source is wrong, the downstream system has no way to detect it. Ensemble voting architectures using multiple AI models are vulnerable to shared training-data blindspots: when the models are trained on overlapping corpora, they agree on their mistakes. **Neither approach produces diagnostic disagreement.** The invention resolves both failure modes by using intentionally-different deterministic pipelines whose disagreements are structurally interpretable.

---

## Independent Claim

**Claim 1.** A computer-implemented method for producing multiple independent truth snapshots from a single source corpus in a cooperative platform, comprising:

(a) Maintaining four distinct ingestion pipelines, each comprising a parser, a classifier, an indexer, and a truth-snapshot output store, wherein the four pipelines are configured with materially different parsing, classification, and indexing strategies such that they produce structurally distinct truth snapshots from the same source corpus;

(b) Assigning each pipeline a primary bias from a set of four orthogonal axes: (i) prose-and-semantic-first, (ii) schema-and-structure-first, (iii) numerical-and-statistical-first, (iv) provenance-and-citation-first;

(c) Executing all four pipelines against the source corpus in parallel, producing four truth snapshots;

(d) Comparing pairwise the four truth snapshots at a set of comparable indices, detecting agreements and disagreements;

(e) When the four pipelines agree at a given index, treating the agreed value as triangulated truth;

(f) When the four pipelines disagree at a given index, classifying the disagreement type based on which pipelines disagreed, such that a disagreement between the prose pipeline and the schema pipeline indicates narrative-versus-schema drift, between the numerical pipeline and the other three indicates numerical drift, and between the provenance pipeline and the other three indicates citation drift.

**Dependent Claim 1.1** — The method of Claim 1, wherein the four pipelines are color-coded and namespaced for operational identification (e.g., Bishop=indigo, Knight=silver, Rook=slate, Pawn=amber).

**Dependent Claim 1.2** — The method of Claim 1, wherein the pairwise comparison of (d) is performed eagerly by a background consistency checker (The Scrambler, Innovation #2259) rather than lazily at query time, reducing per-query latency.

**Dependent Claim 1.3** — The method of Claim 1, wherein the disagreement classification of (f) is escalated to a cooperative governance layer for human review when the disagreement is material to cooperative decision-making (financial, legal, membership, or patent-related data).

**Dependent Claim 1.4** — A system comprising a processor, four pipeline instances, four truth-snapshot stores, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.3.

---

## Prior Art Distinction

Ensemble voting across AI models (Mixture of Experts, ensemble classifiers) relies on probabilistic models with shared training blindspots. Single-pipeline data architectures (traditional ETL, data warehouses) lack triangulation. Consensus protocols (Raft, Paxos) produce agreement on a single canonical value but do not preserve diagnostic disagreement. **No system combines (a) four deterministic pipelines with intentionally-orthogonal bias axes, (b) pairwise comparison producing diagnostic disagreement classification, and (c) integration with a cooperative-platform governance escalation layer.** Combination novel.

---

## Cross-References

- **Source stub:** `INNOVATION_STUBS_2237_2245_B096_CHESSBOARD.md`
- **Parent architecture:** #2237 Four-Doublet Chessboard
- **Deterministic coordinator:** #2238 TouchStone
- **Eager consistency checker:** #2259 The Scrambler

---

**FOR THE KEEP.**
