---
name: Member-Owned Scribes Cathedral as Membership Product
description: Every cooperative member receives a domain-indexed working memory (personal Scribes Cathedral) that persists across sessions, grows in value with participation, and is fully exportable on membership close, bridging the R9 retrieval substrate to cooperative membership product-market fit.
type: aa_formal
innovation_id: "2268"
ratification_session: B117
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - member owned scribes cathedral
  - personal working memory membership product
  - cathedral membership retention compounding
  - domain indexed working memory member
  - export on close cathedral standalone
  - cooperative membership cathedral asset
  - aa formal 2268
  - r9 retrieval member product bridge
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2268 — Member-Owned Scribes Cathedral as Membership Product

**Innovation #:** 2268
**Category:** AI Infrastructure / Member Product / Cooperative Economics Bridge
**Crown Jewel:** **CANDIDATE** — recommend YES (STRONG). This is the monetization bridge that connects the R9 retrieval substrate to member-facing product-market fit.
**Bishop Session:** B117 (Formal draft). Originated: Founder insight during B116 SP-22/23 Cathedral design exchange, direct quote: *"the Cathedrals shared among LB members would also be a very useful value of constant use of LB — and a HUGE membership incentive, especially for R9."*
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh. Requires Founder ratification on the member-product claims before filing; the method claims are filing-ready regardless.
**Related:** #2270 (Scribes Cathedral architecture — this is the member-deployed instance), #2269 (Three Fates routing — member-session listener), #2267 (Member-Generated Guide Corpus — Cathedral feeds into), #2260 (Cooperative Defensive Patent Pledge — consent-gated Scribe-sharing scaffolding), #2272 (Cost-Slasher — Cathedral amplifies cost-reduction claim over time).
**Implementation artifact:** SP-23 infrastructure at `librarian-mcp/stitchpunks/scribes/` (5 seed tablets: R9 / BRIDLE / Landing / Prov14 / Vault). Member-facing deployment: **gated on K437-on-SEALED-50 PASS** per Prove-Then-Product methodology (K438 Knight prompt exists as stub, not dispatched).

---

## TL;DR (2 lines)

Every Liana Banyan member owns a **domain-indexed working memory** (their personal Scribes Cathedral) that persists across sessions, computer restarts, and projects — growing in value the longer the member stays. Tablets are append-only, organized with primary + up to 12 adjacent fields of declared expertise, fed by a Three Fates routing pipeline listening to the member's work session. The Cathedral is the reason members stay subscribed — and the primary monetization bridge between the R9 retrieval substrate and cooperative-economic value creation.

---

## The Problem

Cooperative-economic platforms face a three-way tension between member retention, perceived value, and lock-in ethics:

1. **Retention requires ongoing value.** A $5/yr membership that delivers a one-time benefit churns at the next renewal. A membership that delivers compounding value retains.
2. **Perceived value scales with personalization.** Generic platform benefits (discounts, community access) are commoditized and easily matched by competitors. Personal assets that belong to the member and grow with their participation are structurally differentiable.
3. **Lock-in ethics forbid hostage-taking.** The cooperative cannot be the thing members "can't leave" — that's the extractive pattern Liana Banyan exists to reject. Value must be member-owned AND member-portable.

Existing solutions fail at least one corner of the triangle:

- **SaaS subscriptions** (Notion, Obsidian, Roam) satisfy (1) and (2) but lock members in through proprietary formats.
- **Traditional cooperatives** (credit unions, REI, food co-ops) satisfy (1) and (3) but offer member benefits that don't scale with participation intensity.
- **Open-source personal knowledge stores** (plain-text, Git-backed) satisfy (2) and (3) but have no subscription-retention mechanism.

The gap: a member-owned digital asset that grows in value the longer the member participates, is cooperatively-governed (not platform-captured), AND is exportable on membership close.

---

## Mechanism

### Member Cathedral instance

On membership creation, the member is provisioned a Cathedral: a structured filesystem path (or equivalent cloud-persisted directory) containing:

- **`registry.yaml`** — member's declared domains, each with a primary field (Level 1, canonical keeper) and up to 12 adjacent fields with declared expertise levels 2–12.
- **`scribe_<domain>.jsonl`** — one append-only tablet per Scribe. Tablets hold the Scribe's accumulated entries over time.
- **`fates_log.jsonl`** — per-session record of which Scribes were routed (by the Three Fates pipeline) during work.
- **`tidbits.jsonl`** — verify-action ledger (per #2271) — behavioral discipline record distinct from domain content.

The Cathedral is owned by the member in a legally-enforceable sense: (a) the data is member-exportable at any time via a `cathedral_export()` function producing a ZIP of the member's directory; (b) the member's directory is portable to any MCP-compatible host (not just LB-platform-hosted); (c) on membership close, the Cathedral is handed to the member with read/write-anywhere rights, subject only to the patent licensing terms of #2260 Cooperative Defensive Patent Pledge.

### Growth mechanics

The Cathedral grows in value along three axes:

1. **Depth per Scribe.** Each session the member works on a domain produces entries that accumulate in that Scribe's tablet. Over months, the Scribe becomes PhD-deep in the member's specific corner of the domain — not generic knowledge, but the member's canonical-keeper-of-record for their practice.
2. **Breadth of Scribes.** New domains surface over time as the member's work shifts. The Three Fates router auto-proposes new Scribes when session content consistently doesn't fit into existing tablets; the member ratifies or declines.
3. **Adjacency coverage.** Each Scribe's adjacents (up to 12) deepen as tangential topics surface. Triply-redundant witness property (per #2270) emerges organically: any topic the member repeatedly returns to is covered by ≥3 Scribes through overlapping adjacents.

### Retrieval amplification

The member's R9 retrieval baseline (from the public Librarian) is already substantial — 86.1pp mean lift on the canonical LB corpus per R10. The member's Cathedral amplifies this further: `consult_scribes` (#K436 MCP tool) retrieves top-10 most-relevant Scribe entries for any query, fed into the model context alongside the R9 preload. Over time, the member's personal Cathedral makes retrieval lift *on their specific work* higher than it is on LB-generic queries — because the Cathedral IS the member's canonical corpus.

### Consent-gated Scribe sharing

A member may, at their discretion, elect to contribute anonymized Scribe entries to a Guild's or Tribe's collective Scribe. This is consent-gated and non-default. Mechanics:

- Member reviews specific entries before sharing (opt-in at entry level, not tablet level)
- Shared entries are anonymized and stripped of session-identifying metadata before upload
- Contribution earns participation credit under #2266 Opt-In Member Documentation with Benefits
- Anyone receiving shared Scribe content operates under #2260 Pledge terms

This is the bridge to #2267 Member-Generated Guide Corpus: Scribe sharing is how collective knowledge accretes without compromising individual member ownership.

### Export on membership close

On membership termination (voluntary or otherwise), the Cathedral is packaged via `cathedral_export()` and delivered to the former member as a standalone bundle. The bundle includes:

1. All tablet JSONL files
2. `registry.yaml`
3. `cathedral_standalone_reader.py` — a minimal Python reader that parses the bundle outside the LB platform
4. A README.md documenting the JSONL schema and consult-scribes algorithm so the former member can implement retrieval independently
5. Copies of the AGPL-3.0 + Pledged Commons grant covering the software primitives so the former member knows their legal standing

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What it misses |
|---|---|---|
| Notion / Obsidian / Roam | Personal knowledge store, subscription SaaS | Proprietary format; no retrieval-tool integration; lock-in on export |
| RAG vector databases (Pinecone, Weaviate) | Production retrieval over personal corpora | No membership/cooperative-economic framing; no domain-indexed tablet schema; no routing pipeline |
| LangChain memory modules | Session/thread memory for LLM apps | Session-scoped, not member-scoped; no expertise-level declarations; no triply-redundant coverage |
| Credit union / REI / food co-op membership benefits | Cooperative membership with recurring value | Not personalized to participation intensity; no digital asset that grows with use |
| Open-source plain-text knowledge bases | Member-owned and exportable | No retrieval amplification; no subscription economics |

### Novel combination

1. **Domain-indexed tablet structure with declared expertise levels** (primary + 12 adjacents, levels 2–12 with declared PhD-adjacent / junior-adjacent / ancillary tiers). This is the specific organization that enables triply-redundant coverage to emerge without requiring the member to manually curate overlap.
2. **Three Fates routing pipeline as session listener** (#2269), consuming the member's work-session content and auto-dispatching to relevant Scribes. The routing stage is the architectural move that makes the Cathedral scale to ≥1000 Scribes without per-Scribe scan cost.
3. **Cooperative-economic framing.** The Cathedral is a personal asset that grows with participation AND is consent-gateable into collective Guild/Tribe Scribes — satisfying the three-way tension between retention, personalization, and anti-lock-in.
4. **Export-on-close as architectural commitment.** The `cathedral_standalone_reader.py` and JSONL schema documentation are shipped WITH every member's Cathedral, making the "member-owned, portable" claim structurally enforceable rather than rhetorical.
5. **Subscription retention driven by compounding personal value.** Unlike generic SaaS retention (features, support, network effects) or generic cooperative retention (voting rights, patronage), Cathedral retention is driven by the member's accumulated personal expertise record — the member leaves the most when leaving.

### What we are NOT claiming

- Personal knowledge stores are not novel.
- Subscription SaaS is not novel.
- Cooperative membership is not novel.
- Retrieval-augmented generation is not novel.
- **What is novel is the specific combination: (domain-indexed tablet schema with declared expertise levels) + (Three Fates routing listener) + (cooperative membership retention driven by the compounding personal asset) + (export-on-close architectural commitment via shipped standalone reader) — applied to LLM-augmented member services on a cooperative platform.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for providing a cooperative-platform member with a personal retrieval-augmented knowledge asset, comprising:

(a) on member enrollment, provisioning a per-member directory or equivalent persistent storage comprising (i) a declared registry of domain specialists, each specialist declaring one primary field and up to twelve adjacent fields of declared decreasing expertise level, (ii) one append-only storage artifact per specialist, and (iii) a routing log;

(b) during member-platform work sessions, a routing pipeline consumes session content and dispatches append-directives to a subset of the specialists selected based on content-relevance scoring against the declared primary and adjacent fields;

(c) at query time, the member's retrieval subsystem assembles context from: (i) a platform-wide retrieval corpus shared across all members, AND (ii) the member's personal specialist entries selected by the same content-relevance primitive;

(d) on membership termination, packaging the member's directory with a standalone reader program and schema documentation sufficient for the former member to operate the retrieval subsystem on exported data outside the cooperative platform.

**Claim 2 (Apparatus).** A cooperative-platform system comprising: a per-member Cathedral module implementing Claim 1(a); a routing pipeline implementing Claim 1(b); a retrieval module implementing Claim 1(c); an export module implementing Claim 1(d); and a subscription/membership enrollment module tying the Cathedral lifecycle to the member's membership state.

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the expertise levels of the adjacent fields are declared in tiers: levels 2–3 as PhD-adjacent, levels 4–6 as junior-adjacent, and levels 7–12 as ancillary; wherein the tier declaration informs the content-relevance scoring weight.
- **Claim 4.** The method of Claim 1 further comprising a consent-gated sharing mechanism whereby the member may, at entry-level granularity, contribute anonymized entries to a collective specialist store shared across a declared member group (Guild or Tribe).
- **Claim 5.** The method of Claim 4 wherein the consent-gated sharing earns the contributing member participation credit in a separately-disclosed benefits program.
- **Claim 6.** The method of Claim 1 wherein the routing pipeline of Claim 1(b) is structured as a three-stage pipeline: (i) candidate-theme extraction, (ii) theme-to-specialist scoring with selection cap, and (iii) dispatch-directive emission with routing-record closure.
- **Claim 7.** The method of Claim 1 wherein the append-only storage artifact of Claim 1(a)(ii) is a JSONL file, one entry per line, append-only by file-system semantics.
- **Claim 8.** The method of Claim 1 wherein the export package of Claim 1(d) is a self-contained archive including a Python or equivalent reader program whose source code is included alongside the data files.
- **Claim 9.** The method of Claim 1 wherein the retrieval amplification of Claim 1(c) produces measurable accuracy lift on member-specific queries greater than the accuracy lift from the platform-wide corpus alone, as measured by an empirical validation test.

---

## Empirical substrate

Per K437-on-SEED-18 (commit `7617a5f`, B117):

- Haiku + Cathedral: HOT-base 11.1% → HOT-cathedral 27.8% (+16.7pp)
- Opus + Cathedral: HOT-base 11.1% → HOT-cathedral 33.3% (+22.2pp)
- Mean lift: **+19.4pp lenient / +13.9pp strict** — both clearing the ≥5pp PASS criterion

Canonical evidence pending K437-on-SEALED-50 run (Bishop B117 sealed the 50-Q bank; Knight dispatch imminent). K438 (member-facing Cathedral ship) is gated on SEALED-50 PASS per Prove-Then-Product methodology.

---

## Cross-References

1. **#2270 Scribes Cathedral architecture** — the underlying data structure this member-product deploys
2. **#2269 Three Fates Routing Pipeline** — the session-listener that populates each member's Cathedral
3. **#2271 SP-21 Tidbit Scribe** — the verify-action ledger that accompanies the domain-content Scribes
4. **#2267 Member-Generated Guide Corpus** — the collective knowledge asset that consent-gated Scribe sharing (Claim 4) feeds
5. **#2260 Cooperative Defensive Patent Pledge** — the licensing frame under which shared Scribes operate
6. **#2266 Opt-In Member Documentation with Benefits** — the credit mechanism for Claim 5 participation
7. **#2272 Cost-Slasher Claim Ladder** — the marketing surface; Cathedral amplifies the cost-reduction claim over member-lifetime

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2268 entry (existing description covers this A&A)
- [ ] Update `PROV_14_DRAFT.md` to mark #2268 as Crown Jewel once Founder ratifies
- [ ] K438 Knight prompt (exists as stub) should reference this A&A Formal as the patent-protected backbone of the member-facing Cathedral build
- [ ] Counsel review before Prov 14 filing — specifically ask whether Claim 1(d) export-on-close requirement creates any unintended commitment that would be hard to honor if LB ever exits the MCP ecosystem
- [ ] Optional: cite Claim 1 in any member-facing marketing (Chapter 3 teaser, membership benefits page) once K437-on-SEALED-50 passes
- [ ] Optional: add Cathedral export to the members' rights one-pager

---

**Innovation count:** no change (this formalizes #2268 which was already counted in B116).
**Crown Jewels:** **CANDIDATE — recommend YES (STRONG)**. This is the innovation that converts R9's empirical lift from a benchmark number into a monetization bridge for the cooperative. Founder-ratification should be explicit.
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Fourth A&A Formal of the Prov 14 thresh (after #2273, #2272, #2271). The membership product that makes R9 a subscription business — not because members are locked in, but because they grow with it.*

**FOR THE KEEP.**
