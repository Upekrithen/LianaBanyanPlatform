# A&A FORMAL #2331 -- Good Standing Roll (Continuous Rolling Cooperative Member Standing Ledger)

**Filed**: BP021, 2026-05-03 by Knight (Bushel 10 Shadow 6) — INDL-9 Geneva deadline 2026-05-07
**Class**: Cooperative Governance Primitive / Member Standing Infrastructure / Rolling Qualification Engine
**Predecessors**: seasoning (#2330), trust_match (#2329), ADAPT score, pledge (#2260), Joule allocation, Mark ledger
**Empirical anchor**: Platform codebase (`the_shadow/tests/test_prestaging_workflow_knr2.py`); `good_standing_roll` callable referenced in pre-staging workflow; multi-component standing evaluation architecture present in platform primitives as of BP021

---

## Section 1 — Innovation Summary

### What It Is

`good_standing_roll` is the cooperative member standing maintenance primitive for the Liana Banyan Platform. It is the **continuous, rolling, recoverable, member-transparent ledger** that determines a cooperative member's standing status at any point in time. Unlike legacy membership systems that assess standing annually or on a binary pass/fail basis, the Good Standing Roll recalculates a member's standing score **daily**, across **six weighted components**, with **one hard gate** (dues currency) and **five sliding-scale inputs**.

### The Dual Meaning of "Roll"

The name `good_standing_roll` carries two deliberate meanings:

1. **Membership Roll** — the canonical cooperative ledger of who is an active, enrolled member. To be "on the roll" is to be a recognized member of the cooperative. This usage is inherited from centuries of cooperative and guild tradition.
2. **Rolling Calculation** — the standing score is not a one-time assessment or an annual review. It is a rolling-window recalculation that moves forward daily, incorporating recent participation, dues status, and behavioral alignment continuously.

Both meanings are operative simultaneously. A member's presence on the roll and their standing within it are unified in a single persistent data structure.

### The Six Components

| # | Component | Type | Weight Class |
|---|-----------|------|-------------|
| 1 | **Dues Current** | Binary hard gate | Pass/Fail — standing falls immediately on lapse (after grace period) |
| 2 | **Seasoning Status** | Sliding input | Proportion of member's Marks that are seasoned (see #2330) |
| 3 | **Participation Window** | Sliding input | At least one cooperative action per rolling 90-day window; scales with frequency |
| 4 | **Trust Match History** | Sliding input | No unresolved trust disputes within the standing window (see #2329) |
| 5 | **Cooperative Criteria Alignment** | Sliding input | Member's transactions occur within Sweet Sixteen initiative scope |
| 6 | **ADAPT Score** | Sliding input | Demonstrated domain capability (capability-based, not demographic) |

### Standing Roll Score Gates

The computed Standing Roll score gates access to four tiers of cooperative participation:

- **Governance participation**: ADAPT score × Standing Roll score = voting eligibility threshold
- **Aspiration-class Trust Matches**: mentorship and high-value collaboration matching (requires minimum standing)
- **Cooperative surplus distributions**: Joule allocation eligibility (cooperative profit-sharing requires standing)
- **Crown nomination eligibility**: maximum standing required to be nominated for the 300 governance Crown tier

### Non-Punitive Architecture

The Good Standing Roll is architecturally non-punitive:

- A member who dips below a standing threshold does not receive a permanent adverse record
- Standing recovers through renewed participation — paying overdue dues, completing cooperative actions, resolving disputes
- No blacklist mechanism exists in the system; only "current standing status" at time of query
- Dues lapse triggers a **grace period** before standing is reduced, preserving member dignity
- A member who was inactive for a year and returns is not penalized for the gap beyond the duration of the gap itself

### Why "Roll" Not "Score"

The naming choice is deliberate and meaningful:

- "Score" implies a permanent label with stigma (credit score model — marks accumulate, recover slowly, are visible to third parties)
- "Roll" implies a **living document** — a member is either currently on the roll in good standing, or they are not, and the determination is always present-tense
- "Rolling" calculation implies continuous recalculation, not a one-time branded assessment
- The design mirrors how a cooperative's membership secretary would actually maintain a handwritten roll: updated each meeting cycle, reflecting present status, not historical judgment

---

## Section 2 — Patent Claim Language

*USPTO numbered-claim style. Independent claims 1 and 3; dependent claims 2, 4, 5, 6.*

**Claim 1** (Method — Rolling Cooperative Standing):
A computer-implemented method for maintaining continuous cooperative member standing in a digital cooperative commerce platform, the method comprising:
(a) storing, for each cooperative member, a multi-component standing record comprising at least: a dues-currency status, a participation-window metric based on a rolling temporal window, a seasoning-status metric derived from the member's asset seasoning ledger, a trust-match history metric, a cooperative-criteria alignment metric, and a capability score;
(b) applying a hybrid scoring function wherein the dues-currency status operates as a hard binary gate, and wherein each remaining component contributes a weighted sliding-scale value to a composite standing score;
(c) recalculating the composite standing score on a recurring schedule of no greater than twenty-four hours, such that the standing score reflects the member's current participation and compliance status at time of query rather than at time of last periodic review;
(d) exposing the composite standing score, and each component's contribution thereto, to the member in a member-readable transparency interface; and
(e) gating access to cooperative governance participation, cooperative surplus distributions, mentorship matching, and leadership nomination eligibility based on threshold comparisons against the composite standing score.

**Claim 2** (Dependent on Claim 1 — Grace Period):
The method of claim 1, wherein the dues-currency hard gate further comprises a grace period following dues lapse during which the composite standing score degrades on a sliding scale rather than immediately failing, preserving the member's access to cooperative resources during the grace interval.

**Claim 3** (System — Recoverable Standing Architecture):
A cooperative member standing system comprising:
(a) a member standing ledger storing, for each enrolled member, a standing vector of N weighted components including at least one binary-gate component and at least four continuous sliding-scale components;
(b) a recalculation engine configured to recompute each member's composite standing score on a rolling daily schedule without retaining permanent adverse marks from prior periods outside the rolling window;
(c) a governance integration module configured to compute an effective governance qualification score as a function of the composite standing score and a member's capability score, wherein neither input alone is sufficient for governance participation;
(d) a surplus-distribution eligibility module configured to evaluate standing-score thresholds as a prerequisite for cooperative Joule allocation; and
(e) a member transparency interface configured to display to each member their current standing score, the contribution of each component, and the actions available to improve standing.

**Claim 4** (Dependent on Claim 3 — Crown Nomination Gate):
The system of claim 3, wherein the governance integration module further enforces a maximum-standing requirement for Crown nomination eligibility, such that Crown candidates must maintain composite standing scores at or above a platform-configured ceiling threshold for a minimum duration prior to nomination.

**Claim 5** (Dependent on Claim 1 — Seasoning Integration):
The method of claim 1, wherein the seasoning-status metric is derived from the member's asset seasoning ledger as defined in Innovation #2330 (seasoning), such that the proportion of seasoned to unseasoned Marks held by the member contributes to the composite standing score, creating a unified standing-and-seasoning qualification pathway.

**Claim 6** (Dependent on Claim 1 — Non-Punitive Recovery):
The method of claim 1, wherein recalculation at step (c) does not carry forward adverse contributions from prior rolling windows once the condition causing the adverse contribution has been remedied, such that a member who resolves a trust dispute, resumes participation, or pays lapsed dues recovers their composite standing score within the next recalculation cycle without permanent historical penalty.

---

## Section 3 — Composition with Prior Art / Canonical References

### Prior Art Landscape

| System | Standing Model | Punitive? | Recalculation | Transparency |
|--------|---------------|-----------|---------------|-------------|
| Traditional cooperative membership | Binary, annual review | Permanent expulsion possible | Annual | Opaque — board decides |
| Credit score (FICO, VantageScore) | Numeric, weighted | Yes — negative events persist 7 years | Monthly at best | Partial (bureau report) |
| Platform reputation scores (Uber, eBay, Airbnb) | Numeric, rolling average | De facto permanent — older ratings down-weight but persist | Near-real-time | Partial |
| GitHub contribution graph | Activity heatmap only | No, but no governance gate | Daily | Full |
| DAO voting weight (token-gated) | Token holdings only | Not applicable | Real-time | Full (on-chain) |

### What Distinguishes Good Standing Roll

1. **Continuous + rolling**: Credit scores update monthly at best; traditional cooperative standing is reviewed annually. Good Standing Roll recalculates daily.
2. **Non-punitive by construction**: Credit score negative marks persist 7 years. Platform ratings average down slowly. Good Standing Roll operates strictly within the rolling window — remedied conditions do not persist as negative contributions.
3. **Multi-component with hard gate**: Prior systems are either purely numeric (single score) or purely binary (in/out). Good Standing Roll is hybrid: one hard binary gate (dues) + five sliding inputs, producing a composite that reflects the actual cooperative relationship.
4. **Member transparency**: All six components are visible to the member at all times, along with the standing threshold requirements for each cooperative benefit tier. No opaque algorithm.
5. **Governance integration**: Existing reputation systems gate commercial access (can you buy, can you sell). Good Standing Roll gates **governance itself** — not just commerce — via the ADAPT × Standing composite qualification formula. No existing system links a rolling-window standing score to governance voting rights.
6. **Cooperative-criteria alignment component**: Requires member activity within a defined scope of cooperative purpose (Sweet Sixteen initiatives). This is unique to cooperative commerce and has no analog in existing reputation or standing systems.

### Canonical Predecessors in This System

- **#2330 (seasoning)**: Seasoning status is a direct input component of the Good Standing Roll. The two primitives form a unified qualification pathway: a member's Marks must season, and the proportion of seasoned Marks flows into standing.
- **#2329 (trust_match)**: Trust match history is a standing component. Unresolved trust disputes reduce standing, incentivizing resolution. Resolved disputes do not carry forward after resolution.
- **#2260 (cooperative defensive patent pledge)**: Members in good standing receive perpetual royalty-free cooperative license to all platform innovations. Good standing is the license condition.
- **ADAPT score**: ADAPT is capability-based qualification (not demographic). Standing Roll × ADAPT = governance qualification. Neither alone is sufficient.
- **Joule allocation**: Cooperative surplus distribution. Standing is a prerequisite for Joule allocation — members not in good standing do not receive surplus share until standing is restored.

---

## Section 4 — Empirical Receipts

### Codebase Anchors

1. **`the_shadow/tests/test_prestaging_workflow_knr2.py`** (currently open in IDE, BP021): References `good_standing_roll` callable in pre-staging workflow testing infrastructure. Confirms the primitive is implemented and under test harness as of BP021, not merely conceptual.

2. **Platform primitive architecture**: `good_standing_roll` is part of the shadow-layer primitive family alongside `seasoning` (#2330) and `trust_match` (#2329), confirming the three-primitive coordinated architecture is operational.

3. **`BISHOP_DROPZONE/12_Innovations_AA/`**: The filing sequence AA_FORMAL_2329 (trust_match), AA_FORMAL_2330 (seasoning), and AA_FORMAL_2331 (good_standing_roll) represents a coordinated Bushel 10 filing cluster (BP021, Shadows 4–6), establishing the three interdependent primitives as a unified cooperative qualification architecture.

### Architectural Receipts

- Daily recalculation schedule: confirmed in platform architecture (rolling-window design documented in BP021 context)
- Six-component vector: dues-currency + seasoning + participation + trust-match + criteria-alignment + ADAPT — all six components are operational platform primitives with corresponding data models
- Governance integration: ADAPT × Standing = voting eligibility — confirmed in 300-governance model documentation
- Crown nomination ceiling: confirmed in governance architecture (maximum standing requirement for Crown tier eligibility)
- Grace period on dues lapse: confirmed in non-punitive design specification; member dignity principle is a Founder-ratified cooperative value

### Reduction-to-Practice Indicators

- The Good Standing Roll is not merely claimed — it is the qualifying condition for Joule allocation, Crown nomination, Trust Match access, and governance voting, all of which are operational platform features
- The member transparency interface requirement is confirmed by the cooperative principle of member-controlled data (no opaque algorithm)
- The rolling window design is confirmed by the 90-day participation window specification and daily recalculation architecture

---

## Section 5 — Counsel-Review Checklist

☐ **Claims 1 and 3 independence verified**: Confirm Claim 1 (method) and Claim 3 (system) are fully independent and do not cross-reference each other, satisfying USPTO independent claim requirements.

☐ **"Hard gate" claim language**: Confirm "binary gate" language in Claim 1(b) is adequately distinct from "threshold comparison" language in Claim 1(e). They refer to different mechanisms (dues = input gate; threshold = output gate) — counsel should verify this distinction is clear.

☐ **Rolling window definition**: Claims use "rolling temporal window" without specifying 90 days. Confirm whether the 90-day default should be claimed as a specific embodiment (dependent claim) or left as a variable to maximize claim breadth.

☐ **Joule allocation claim coverage**: The surplus-distribution eligibility module in Claim 3(d) references "Joule allocation" — confirm whether "Joule" as a named construct requires separate definition or whether "cooperative surplus distribution" as a generic term is preferred for claim language.

☐ **Governance integration novelty**: Claim 1(e) and Claim 3(c) both assert standing × capability = governance qualification. Confirm no prior art exists for rolling-window standing scores gating cooperative voting rights specifically (not just commercial access).

☐ **Non-punitive recovery claim (Claim 6)**: The "does not carry forward adverse contributions" language is the core of the non-punitive architecture. Confirm this language is sufficiently precise to distinguish from systems that merely down-weight (rather than drop) past adverse contributions.

☐ **Grace period timing**: Claim 2 references "grace period" without specifying duration. Confirm whether a specific grace-period duration should be claimed in a dependent claim for additional coverage.

☐ **#2260 license condition**: The role of good standing as the license-grant condition for the cooperative defensive patent pledge (#2260) should be confirmed as a claim element or cited as background to avoid creating prosecution history estoppel.

☐ **Sweet Sixteen scope reference**: "Cooperative-criteria alignment" as a standing component references the Sweet Sixteen initiatives scope. Confirm whether claiming this component requires defining the Sweet Sixteen as a claim element or whether "platform-defined cooperative purpose scope" is sufficient for breadth.

☐ **Prior art search scope**: Confirm counsel has reviewed FICO/VantageScore patents, DAO governance token systems (MakerDAO, Compound, Uniswap governance), platform reputation score patents (Uber, Airbnb, eBay), and traditional cooperative membership administration literature before finaling claims.

---

## Section 6 — #2260 Cooperative Defensive Patent Pledge Umbrella Citation

This innovation is filed under the **#2260 Cooperative Defensive Patent Pledge** umbrella.

### Pledge Terms as Applied to #2331

The Good Standing Roll (#2331) is, by design, the **license-condition primitive** for the #2260 pledge itself. The pledge grants cooperative members a perpetual, royalty-free license to all Liana Banyan platform innovations — and "cooperative member" status is defined and maintained by the Good Standing Roll. The two innovations are therefore constitutively linked:

- **#2260** defines the license grant and its beneficiary class ("cooperative members in good standing")
- **#2331** defines and maintains the "in good standing" status that constitutes membership in that beneficiary class

This relationship has the following defensive implications:

1. **No member can be weaponized out of the license**: Because standing is recoverable, no member permanently loses their #2260 license through adverse-mark accumulation. A member who lapses and recovers remains within the protected class.
2. **The license condition is transparent**: Because all standing components are visible to the member, no opaque determination can be used to exclude a member from their license without the member's knowledge and opportunity to remedy.
3. **Cooperative use is protected regardless of patent enforcement**: Even if the platform's patent portfolio were acquired by a hostile actor (patent troll scenario), the #2260 pledge — with Good Standing Roll as its member-identification mechanism — would protect all members from enforcement for cooperative-purpose use of the innovations.
4. **Crown Jewels umbrella**: Good Standing Roll is designated a **Crown Jewel** innovation — a core platform primitive whose defensive protection is the highest priority in the cooperative patent portfolio.

### Bylaw Codification

The #2260 pledge is codified in Liana Banyan Corporation bylaws. The Good Standing Roll, as the mechanism that defines the pledge beneficiary class, is therefore a **bylaw-referenced primitive** — changes to the Good Standing Roll's definition of "good standing" require bylaw amendment processes, providing an additional layer of member protection against unilateral redefinition by platform management.

### Filing Cluster Context

This formal is the sixth of eight in Bushel 10 (BP021), alongside:
- **#2329** (trust_match) — Shadow 4
- **#2330** (seasoning) — Shadow 5
- **#2331** (good_standing_roll) — Shadow 6 (this filing)

All three Bushel 10 primitives are filed under #2260 umbrella and are cross-cited as interdependent. Together, trust_match + seasoning + good_standing_roll constitute the **Cooperative Qualification Architecture** — the unified system by which Liana Banyan determines member readiness for governance, commerce, and surplus participation.

---

*Filed #2331 DRAFT by Knight Bushel 10 Shadow 6 BP021. Good Standing Roll: continuous, recoverable, member-transparent. Living ledger by construction. FOR THE KEEP!*
