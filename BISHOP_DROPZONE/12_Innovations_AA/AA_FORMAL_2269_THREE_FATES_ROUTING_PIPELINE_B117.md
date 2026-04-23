# A&A Formal #2269 — Three Fates Routing Pipeline for AI Session Listeners

**Innovation #:** 2269
**Category:** AI Coordination / Session-to-Memory Routing / Multi-Scribe Architecture
**Crown Jewel:** **CANDIDATE** — recommend YES. The routing stage is the architectural move that makes Cathedral-scale retrieval economically viable.
**Bishop Session:** B117 (Formal draft). Originated: Founder design during B116, direct quote: *"Let's make THIS the three Fates that categorize together and invoke the sleeping Scribes that it applies to."*
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh.
**Related:** #2270 (Scribes Cathedral — the storage substrate the Fates route into), #2268 (Member-Owned Cathedral — the member-product deployment that invokes the Fates at session-listener scale), #2271 (SP-21 Tidbit Scribe — deliberately bypasses the Fates; distinction claimed in #2271 Claim 5).
**Implementation artifact:** `librarian-mcp/src/scribes/fates.ts` (K436 commit `6c47d9b`). MCP tool `fates_route` registered at `librarian-mcp/src/server.ts`. Test coverage: `tests/test_fates_router.mjs`, 4 cases green.

---

## TL;DR (2 lines)

A three-stage routing pipeline — **Clotho** (spin candidate themes), **Lachesis** (score themes against Scribe registry), **Atropos** (cut specific dispatch-directives to awakened Scribes) — connects a single stream of session content to many sleeping domain-specialist recorders. The Fates do gatekeeping once per exchange, enabling Cathedral-scale ingest (≥1000 Scribes) without per-Scribe scan cost. Recursive: any Scribe with internal sub-phases can use the same pattern internally.

---

## The Problem

An append-only domain-indexed Cathedral (per #2270) faces a routing problem at scale: if the Cathedral grows to hundreds or thousands of Scribes, a naive approach in which every Scribe scans every session exchange is O(N × M) where N is session messages and M is Scribe count. At Cathedral-scale, this becomes economically infeasible.

Existing solutions fail in specific ways:

1. **Manual routing** ("the member names which Scribe to append to") shifts the burden to the human. Works at 5 Scribes; fails at 50, catastrophic at 500.
2. **Fan-out-all ("every message to every Scribe, let each filter")** scales O(N × M) compute and storage. Wastes writes on Scribes that are irrelevant to the content.
3. **Full-text reverse-index matching** (like Elasticsearch routing) scales O(N × log M) if done well, but lacks semantic-domain awareness — routes based on keywords rather than declared expertise structure.
4. **LLM-per-message classification** ("ask the model which Scribes apply") is expensive ($0.001+ per routing decision) and non-deterministic at scale.

The gap: a routing pipeline that is (a) semantically aware of declared Scribe expertise structure, (b) runs once per exchange not per Scribe, (c) is deterministic and auditable via logged routing records, and (d) scales to Cathedral-size Scribe registries without recomputing relevance per-Scribe.

---

## Mechanism

### Stage 1 — Clotho (Spinner): candidate-theme extraction

Input: a session exchange (the user's message, the assistant's response, or a chunk thereof).

Process: extract candidate themes as a bounded set of noun-phrase / entity-regex matches over the content. Clotho's implementation (per `librarian-mcp/src/scribes/fates.ts`) uses named-entity regex for:

- Innovation identifiers (`#22xx`, `#2xxxx`)
- Session identifiers (`B###`, `K###`, `R###`, `P###`)
- Provisional identifiers (`Prov ##`, `LB-PROV-###`)
- Stitchpunk identifiers (`SP-##`)
- Known platform proper nouns (drawn from a configurable list; currently: R9, BRIDLE, Landing, Prov14, Vault, etc.)
- Bridle-rule citations (`Rule #`)

Output: a set of candidate themes with provenance pointers back to specific substrings in the input.

### Stage 2 — Lachesis (Measurer): theme-to-Scribe scoring

Input: Clotho's candidate-theme set + the Cathedral's current `registry.yaml`.

Process: each candidate theme is scored against each Scribe in the registry based on:

- **Primary-field match** (full credit — theme directly matches the Scribe's Level-1 field)
- **Adjacent-field match** (partial credit proportional to the adjacent's declared expertise level: Level-2 adjacents get more weight than Level-12 adjacents)
- **Active-vs-queued status** (only Scribes marked active receive routes; queued Scribes accumulate theme-counts for later consideration)

Output: per-theme, a ranked list of Scribes with scores. A declared dispatch-cap (default: 5 Scribes per theme) prevents fan-out on rare high-coverage themes.

### Stage 3 — Atropos (Cutter): dispatch and routing-record closure

Input: Lachesis's ranked Scribe lists per theme.

Process:

1. For each theme, select the top-K Scribes (K ≤ cap) and emit a specific `scribe_log` directive to each: "append entry with content [...] to tablet X."
2. If a theme crosses the coverage-gap threshold (declared as ≥3 Scribes per shared topic per #2270 triply-redundant-witness), and Lachesis found only 1 or 2 matches, Atropos flags a **coverage-gap signal** for Bishop/member review.
3. Write a routing record to `fates_log.jsonl` documenting: the exchange hash, the Clotho themes extracted, the Lachesis scores, the Atropos dispatches, and any coverage-gap flags.

Output: confirmed dispatches + closed routing record.

### Scale economics

Per-exchange cost: one Clotho pass + one Lachesis scoring pass + one Atropos dispatch pass. Total: O(themes × active-Scribes) for Lachesis, which at typical active-Scribe counts (5–50 in production) is a few hundred comparisons per exchange. Compare to fan-out-all's O(active-Scribes) writes per exchange — orders of magnitude cheaper at scale.

### Recursive application

Any Scribe with internal structure may apply the Fates pattern to its own internal phases. Observed production instance: **Prov 14 Scribe** uses Fates-as-internal-pipeline for its THRESH-DESCRIBE-FINALIZE phases:

- THRESH (Clotho-analogue) — spin candidate innovations from session material
- DESCRIBE (Lachesis-analogue) — measure candidates against Crown-Jewel criteria, assign IDs
- FINALIZE (Atropos-analogue) — cut A&A Formal documents, move to Ready-to-File

This recursion is declared, not accidental. A single Scribe is small-scale Fates; the Cathedral is large-scale Fates; the routing primitive is the same.

### Distinction from Scribes Cathedral (#2270)

The Fates are the **routing pipeline**. The Cathedral is the **storage substrate**. They compose but are independently claimable:

- Fates can route to any append-only storage (not only the Scribes Cathedral of #2270)
- Cathedral can be populated manually (without Fates routing) for small-scale or test deployments
- Each patent claim should be filed to protect the specific contribution, not the combined artifact

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What it misses |
|---|---|---|
| Elasticsearch / Solr routing | Document-to-shard routing via hash or query | No semantic-domain awareness; no expertise-structure weighting |
| Kafka topic routing | Producer-side partition selection | No content-aware routing; no multi-destination coverage requirements |
| LangChain / LlamaIndex routers | LLM-per-message classification | Cost-prohibitive at scale; non-deterministic; no audit trail |
| Publish/subscribe event buses | Topic-based filter subscription | Subscribers must pre-declare filters; no scoring-based selection |
| Actor-model dispatch | Per-actor mailbox with supervisor routing | No domain-semantic-awareness at the dispatch layer |

### Novel combination

1. **Three-stage pipeline named for the Moirai** (Clotho / Lachesis / Atropos), each stage with a distinct architectural role: extraction, measurement, dispatch. The separation is not cosmetic — it enables independent tuning and auditing of each stage.
2. **Expertise-level-weighted scoring in Lachesis.** Scribes declare 1 primary + up to 12 adjacent fields at declared levels 2–12; Lachesis weights matches by declared level. This is the specific primitive that makes domain-semantic routing possible at Cathedral scale.
3. **Coverage-gap detection in Atropos.** When a theme's dispatch list is shorter than the declared triply-redundant-witness threshold, Atropos flags for review rather than silently under-dispatching. This turns routing from a best-effort layer into an observability layer.
4. **Routing record as first-class audit artifact.** `fates_log.jsonl` records every routing decision, enabling post-hoc analysis of "why was this exchange sent to Scribe X but not Scribe Y?" — essential for trust in automated routing.
5. **Recursive application** (Fates-inside-Fates) — the same pipeline at Cathedral scale AND at single-Scribe internal-phase scale. Declared in the architecture, not accidental.

### What we are NOT claiming

- Publish/subscribe is not novel.
- Routing is not novel.
- Three-stage pipelines are not novel.
- Named-entity extraction is not novel.
- **What is novel is the specific combination: (semantic-domain-aware three-stage named pipeline) + (expertise-level-weighted scoring with declared primary and adjacent fields) + (coverage-gap detection with triply-redundant-witness threshold) + (routing record as audit artifact) + (recursive application), applied to LLM session content dispatch into domain-indexed append-only storage.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for routing content from an LLM-agent session to a plurality of domain-specialist storage artifacts, comprising:

(a) receiving a unit of session content;

(b) a first stage extracting a set of candidate themes from said content by named-entity matching against a declared entity pattern set;

(c) a second stage scoring each candidate theme against each of a plurality of specialists in a registry, wherein each specialist declares one primary domain field and zero or more adjacent fields with declared expertise levels, and wherein the score for a theme-specialist pair is a function of primary-field match, adjacent-field matches weighted by declared expertise level, and the specialist's active-versus-queued status;

(d) a third stage selecting, for each candidate theme, a top-K subset of specialists bounded by a declared dispatch cap, emitting append-directives to the selected specialists, and comparing the selected subset's cardinality against a declared coverage-gap threshold;

(e) writing a routing record comprising a hash of said content, the extracted themes, the scoring results, the dispatches emitted, and any coverage-gap flags.

**Claim 2 (Apparatus).** A system comprising: a Clotho module implementing Claim 1(b); a Lachesis module implementing Claim 1(c) against a registry file; an Atropos module implementing Claim 1(d); a routing-record module implementing Claim 1(e); and an MCP-tool-or-equivalent interface exposing the pipeline as a single callable whose inputs are session content and whose outputs are dispatches plus routing records.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the declared entity pattern set of Claim 1(b) comprises at least: innovation identifiers (regex-matching a declared identifier format), session identifiers (regex-matching agent-and-session-number format), provisional identifiers, and configurable platform proper nouns.
- **Claim 4.** The method of Claim 1 wherein the declared expertise levels of Claim 1(c) range from 1 (primary, highest credit) to 12 (lowest credit), and wherein the scoring function applies non-linear weighting across the level range to favor primary-field matches.
- **Claim 5.** The method of Claim 1 wherein the declared coverage-gap threshold of Claim 1(d) is three or greater, consistent with a triply-redundant-witness property on shared topics.
- **Claim 6.** The method of Claim 1 further comprising: at session close, emitting an aggregate summary of routing records comprising at least: total themes extracted, total dispatches issued, coverage-gap count, and hottest-specialist-per-session identification.
- **Claim 7.** The method of Claim 1 wherein the pipeline is recursively applicable: any specialist storage artifact of Claim 1(d) may internally implement the same method, with its internal-phase structure serving as the three stages, such that a single architectural primitive governs both Cathedral-scale and specialist-internal routing.
- **Claim 8.** The method of Claim 2 wherein the routing record module writes JSONL lines one per routing decision, enabling append-only audit without coordination between concurrent routing invocations.
- **Claim 9.** The method of Claim 1 wherein the specialist registry's active-versus-queued distinction is loaded from a configuration file and can be updated at runtime without restarting the pipeline.

---

## Implementation evidence

- **Source:** `librarian-mcp/src/scribes/fates.ts` (K436 commit `6c47d9b`)
- **MCP tool registration:** `librarian-mcp/src/server.ts` — `fates_route` tool exposed
- **Tests:** `librarian-mcp/tests/test_fates_router.mjs` — 4 cases covering entity regexes, dispatch + cap + sort + empty-text invariants. All green.
- **Runtime performance:** consult_scribes latency p95 = 1.6ms against 200ms target (per K436 Knight report)
- **Fates log:** `librarian-mcp/stitchpunks/scribes/fates_log.jsonl` — populated with 3 routing records at K436 seeding, actively appended B117
- **Registry:** `librarian-mcp/stitchpunks/scribes/registry.yaml` — 5 active Scribes (R9, BRIDLE, Landing, Prov14, Vault) + 6 queued

---

## Cross-References

1. **#2270 Scribes Cathedral** — the storage substrate; Fates route INTO Cathedral tablets
2. **#2268 Member-Owned Cathedral** — the member-product deployment; Fates run as session-listener for each member
3. **#2271 SP-21 Tidbit Scribe** — explicitly bypasses the Fates (per #2271 Claim 5); the bypass is a deliberate architectural distinction
4. **Prov 14 Scribe THRESH-DESCRIBE-FINALIZE** — recursive Fates instance (Claim 7) applied internally to Prov 14 drafting
5. **#2263 Triple-Redundant Verification Architecture** — the multi-agent counterpart; Fates' coverage-gap detection is the single-pipeline analogue of triple-redundancy

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2269 entry
- [ ] Update `PROV_14_DRAFT.md` to note A&A Formal file path for #2269
- [ ] Counsel review before Prov 14 filing — specifically ask whether Claim 1's "named entity matching" is too broad; consider narrowing to the specific pattern set in Claim 3
- [ ] Optional: cite Claim 7 recursion in any paper on "observability of AI-session architectures"
- [ ] Optional: the Prov 14 Scribe uses this pattern internally — a diagram showing Cathedral-Fates-outside and Scribe-Fates-inside would strengthen the "recursive application" claim

---

**Innovation count:** no change (this formalizes #2269 which was already counted in B116).
**Crown Jewels:** candidate — Founder ratification needed. Recommend YES.
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Fifth A&A Formal of the Prov 14 thresh (after #2273, #2272, #2271, #2268). The routing primitive that makes the Cathedral scale.*

**FOR THE KEEP.**
