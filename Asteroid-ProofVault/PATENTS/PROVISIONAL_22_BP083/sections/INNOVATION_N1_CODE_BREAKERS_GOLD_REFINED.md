---
title: "Innovation Area 36: Code Breakers Guild and Gold Refined by Fire"
status: founder-ratify-pending
class: provisional-patent-section
prov_target: PROV_22
bp_session: BP084
model: Sonnet 4.6
date: 2026-06-16
claim_group: 29
innovation_area: 36
cross_reference: "See Innovation Area 35 (Truth Integrity Chain, Claim Group 28) — the epistemic data structure that Code Breakers operate upon. These two innovation areas compose as a unit."
---

# Innovation Area 36: Code Breakers Guild and Gold Refined by Fire

*(Draft section for Founder review and counsel integration — status: founder-ratify-pending. Do NOT modify PROV_22_DRAFT_v02.md directly. Founder integrates manually after ratification.)*

---

## Anecdote — Founder Voice

*What survives the smashing is Immutable.*
*Code Breakers smash. Marks pay them.*
*Gold Refined by Fire.*

Here is the cooperative principle behind all of this: we pay people to break things.

The Code Breakers Guild is an open cooperative role — anyone can join. Code Breakers take claims that have been submitted to the substrate and attempt to demonstrate that they are false, incomplete, or overstated. They bring counter-evidence. They run tests. They push on the assumptions.

When a claim survives sustained, rigorous attack — when Code Breakers have hammered it from every angle and it holds — that claim earns a designation called Gold Refined by Fire. What survives the smashing is Immutable.

This is what peer review was supposed to do, before peer review became unpaid, anonymous, and hopelessly conflicted. This is what scientific replication was supposed to guarantee, before the replication crisis revealed that most published results do not replicate. The Code Breakers Guild does it for real, with transparent attribution, and we pay for it.

Because eliminating false claims is valuable work. It is some of the most valuable intellectual labor that exists. And the cooperative honors it.

---

### Background and Problem Statement

The scientific replication crisis — documented extensively in the literature following Ioannidis (2005, "Why Most Published Research Findings Are False") — demonstrates that traditional peer review is structurally inadequate as a verification mechanism. Unpaid reviewers have no financial stake in thorough adversarial review. Anonymous review removes attribution accountability. Confirmation bias in the reviewer pool — wherein researchers with sympathetic priors are selected for review — systematically favors confirmation over falsification. The result is a published literature in which the majority of findings in certain fields do not replicate under independent testing.

Bug bounty programs in software security represent the closest prior art with the correct incentive structure: adversarial parties (security researchers) are paid specifically to find failures in claims made by a system ("this software is secure"). Bug bounty programs have consistently outperformed unpaid internal security review in finding critical vulnerabilities, because financial incentives align the reviewer's interests with thorough adversarial searching rather than cursory confirmation.

No prior cooperative knowledge system provides: (a) a tiered claim-advancement mechanism where claims progress from UNTESTED through TESTED and FORGED to an IMMUTABLE designation only upon surviving a configurable number of adversarial challenges; (b) a named cooperative member tier progression that rewards members specifically for successful falsification work, equal in economic dignity to affirmation work; (c) a Refiner of Gold honor that inverts the typical recognition structure by awarding the highest cooperative distinction to members whose honest hardest attacks failed — because those failed attacks are the direct cause of a claim achieving Immutable status; (d) a tagged cooperative currency denomination for falsification work, enabling the cooperative to track and balance the ratio of affirmation work to falsification work across its member base; or (e) a reversal mechanism for Immutable claims that requires new empirical evidence plus cooperative majority vote, establishing a structurally high bar that is occasionally crossed.

---

## Application — Technical Specification

### 1. The Four-Tier Knowledge Claim Progression

Knowledge claims within the cooperative substrate advance through four tiers based on accumulated verification evidence. The tiers are mutually exclusive: a claim occupies exactly one tier at any moment.

**Tier 1 — UNTESTED**

A claim enters the substrate at UNTESTED status. UNTESTED claims may be surfaced in the cooperative review queue but carry no epistemic authority in the substrate's KNOWN field. UNTESTED claims that fail to advance within a configurable dormancy period (default: 90 days) are flagged for human review or archived.

**Tier 2 — TESTED**

A claim advances from UNTESTED to TESTED upon accumulating K = 20 independent verification attempts without a successful contradiction. Independent verification attempts may be contributed by: (a) automated cooperative plow pipeline runs (Claim Group 1 Loops 10 and 11 from Claim Group 28); or (b) cooperative member submissions. The K threshold is configurable per domain (default: K = 20 across all domains).

**Tier 3 — FORGED**

A claim advances from TESTED to FORGED upon either:
(a) surviving M = 10 adversarial contradiction attempts from Code Breaker members — attempts that specifically attempt to falsify the claim, not merely confirm it — without a successful falsification; or
(b) surviving without successful falsification for a configurable sustained period (default: 90 days from TESTED status).

The FORGED designation indicates that the claim has been subjected to intentional adversarial attack and has withstood it. FORGED claims carry elevated epistemic authority in the substrate's KNOWN field and receive a provenance-premium in the Excalibur Active Currents pheromone decay scoring (Claim Group 14), decaying more slowly than non-FORGED claims of equivalent age and access frequency.

**Tier 4 — GOLD_REFINED_BY_FIRE (Immutable)**

A claim achieves GOLD_REFINED_BY_FIRE status — the Immutable designation — when: (a) the claim has achieved FORGED status; (b) no successful contradiction has been recorded in any subsequent challenge cycle; and (c) the cooperative's designated Code Breaker verification committee (or the full Code Breaker membership, per cooperative bylaw) has reviewed the claim's challenge history and confirmed the Immutable designation.

GOLD_REFINED_BY_FIRE claims are displayed in cooperative dashboards with a distinct visual indicator. They carry maximum epistemic authority in the substrate KNOWN field and are exempt from automated re-evaluation by Loops 10, 11, and 12 unless a reversal petition is filed (see Section 4 below).

The four-tier progression is summarized in the following table:

| Tier | Name | Advancement Condition | Epistemic Authority |
|------|------|-----------------------|---------------------|
| 1 | UNTESTED | Submission | Minimal |
| 2 | TESTED | K=20 independent verifications, no successful contradiction | Moderate |
| 3 | FORGED | M=10 adversarial Code Breaker challenges survived OR 90 days sustained | High |
| 4 | GOLD_REFINED_BY_FIRE | FORGED + all subsequent challenges survived + committee review | Maximum (Immutable) |

---

### 2. Code Breaker Member Tier Progression

Code Breaker membership is an open cooperative role. Any member may take on Code Breaker assignments by selecting claims from the cooperative's Code Breaker queue — the surfaced candidates produced by Loop 11 (Claim Group 28, element (d)). Code Breaker members advance through four member tiers based on accumulated successful falsification work.

**Member Tier 1 — Initiate**

Awarded upon first successful claim falsification. A successful falsification is defined as: the Code Breaker submits counter-evidence for a THEORIES_OPEN-status claim; the counter-evidence achieves a contradiction confidence above the configurable threshold (default: 0.70) per Loop 11 scoring; and the claim is migrated to ELIMINATED status as a result. The Code Breaker who submitted the successful counter-evidence is recorded as the eliminator in the ELIMINATED field.

**Member Tier 2 — Journeyman**

Awarded upon accumulation of 10 successful claim falsifications (10 claims migrated to ELIMINATED status with the member as recorded eliminator). Journeyman Code Breakers are eligible to challenge TESTED-tier claims, contributing to FORGED tier advancement (or prevention).

**Member Tier 3 — Master**

Awarded upon: (a) accumulation of 100 successful claim falsifications; AND (b) 10 successful challenges against FORGED-tier claims, where "successful" means the FORGED claim was reversed to TESTED status as a result of the Master Code Breaker's counter-evidence. Master Code Breakers are eligible to review claims for GOLD_REFINED_BY_FIRE designation, serving on the verification committee.

**Member Tier 4 — Refiner of Gold**

The highest Code Breaker honor. Awarded to members who have made 10 good-faith adversarial challenges against claims that subsequently achieved GOLD_REFINED_BY_FIRE status — where "good-faith" is assessed by the cooperative's Code Breaker committee based on the quality, rigor, and originality of the challenge attempt, regardless of whether the challenge succeeded in falsifying the claim.

The Refiner of Gold designation is a deliberate inversion of the conventional recognition structure. In standard verification systems, the highest honor goes to the person who discovers a new truth. In the Code Breakers Guild, the highest honor goes to the person who tried hardest and most honestly to break a truth — and failed. Their failure is the direct cause of the claim earning its Immutable status. The cooperative names and honors that contribution.

**Economic parity:** All four Code Breaker member tiers earn cooperative contribution currency (Marks) for successful falsification work. The Marks earned for falsification work are denominated as negative-knowledge-denomination Marks (see Section 5 below). A member who devotes their cooperative career entirely to falsification work — never affirming, always attacking — earns at economic parity with a member who devotes their career entirely to affirmation work.

---

### 3. The Reversal of Immutable Process

GOLD_REFINED_BY_FIRE status is not permanent by definition — it is permanent by evidence. The cooperative's position is that Immutable status means "no counter-evidence has been found that survives Code Breaker scrutiny," not "no counter-evidence could ever exist." History of science provides examples of paradigms that appeared fully verified and were later revised upon discovery of genuinely new empirical data not available during the prior verification period.

A reversal petition may be filed by any Code Breaker member of Journeyman tier or above. A successful reversal petition requires:

**(a) New Empirical Data.** The petition must present empirical evidence that was not available during any prior challenge cycle — specifically, evidence generated or published after the most recent GOLD_REFINED_BY_FIRE designation. A petition presenting reinterpretation of previously available data is insufficient grounds for reversal.

**(b) Code Breaker Guild Majority Vote.** The petition is reviewed by the full Code Breaker membership (or a designated quorum per cooperative bylaw). A majority vote among voting members is required to admit the petition for formal review. This vote determines only whether the new empirical data is sufficiently significant to warrant reopening the claim — not whether the claim is false.

**(c) Formal Review Cycle.** If admitted, the claim is temporarily downgraded from GOLD_REFINED_BY_FIRE to FORGED pending a new challenge cycle incorporating the new empirical data. The claim must survive this new challenge cycle (M additional Code Breaker challenges without successful falsification) to re-achieve GOLD_REFINED_BY_FIRE status. If the new empirical data does produce a successful falsification, the claim is migrated to ELIMINATED with the full revision history preserved.

The reversal process is structurally designed to be high-bar but not impossible — it is occasionally crossed. The high bar protects Immutable claims from frivolous revision petitions; the possibility of crossing preserves the cooperative's epistemic integrity.

---

### 4. The Cooperative Pays Its Critics — Game-Theoretic Analysis

Traditional peer review is unpaid, anonymous, and structurally confirmation-biased. These three characteristics produce predictable pathologies: insufficient time investment (unpaid reviewers minimize review burden), missed failures (anonymous reviewers bear no reputational cost for poor review), and systematic underdetection of false positives (confirmation bias in reviewer selection and motivation).

Bug bounty programs in software security have demonstrated that paying adversarial verifiers specifically for finding failures — not for confirming security — reliably surfaces failures that unpaid internal review misses. The incentive structure of bug bounty is: the higher the severity of the bug found, the larger the reward. This aligns the verifier's financial interests with thorough adversarial searching.

The Code Breakers Guild applies the bug bounty incentive structure to cooperative knowledge verification, with one significant extension: the Refiner of Gold honor ensures that even the most thorough adversarial challenger who fails to break an Immutable claim is economically and reputationally rewarded. This removes the perverse incentive that might otherwise arise in a pure bounty system — the incentive to challenge only weak claims with high falsification probability. Under the Code Breakers model, the hardest challenges (against the strongest claims, with the lowest falsification probability) earn the highest honor, because successful survival of those challenges earns the claim its Immutable designation.

Does paying Code Breakers create perverse incentives toward manufactured falsifications? Analysis indicates it does not. Manufactured falsifications — submitting counter-evidence known to be false — are detectable by the same cooperative substrate that detected the original claims. A Code Breaker who submits false counter-evidence is subject to the same three-voter concordance arbitration (Claim Group 6) that challenges any submitted claim. False counter-evidence that fails concordance arbitration is rejected, and the submitting Code Breaker's reputation score is decremented. The cooperative's epistemic infrastructure is self-policing against manufactured falsifications by the same mechanism it uses against manufactured affirmations.

---

### 5. Negative-Knowledge Tokens — The Cooperative's Falsification Economy

Within the cooperative, members earn Marks as the cooperative's contribution currency. Under the standard model, Marks are earned for affirmation work: publishing verified content, completing cooperative services, delivering work that passes quality gates. These are confirmation-denomination Marks.

The Code Breakers Guild introduces a second denomination: negative-knowledge-denomination Marks. These are Marks tagged at the ledger level with `denomination: negative-knowledge`. They are earned specifically through successful demonstration that a knowledge claim is false, incomplete, or overstated.

**Economic properties of negative-knowledge-denomination Marks:**

- **Same currency.** Negative-knowledge Marks are Marks. They are not a separate currency. The 3-currency canon (Marks / Joules / Credits) is not extended. The denomination is a tag within the Marks system, not a new monetary instrument.
- **Redemption parity.** Negative-knowledge Marks carry a redemption multiplier of 1.0x — identical to confirmation Marks. A member who earns 100 negative-knowledge Marks may redeem them at exactly the same value as 100 confirmation Marks.
- **Tracking.** The cooperative ledger tracks confirmation-denomination and negative-knowledge-denomination Marks separately for each member. The aggregate ratio (confirmation balance / negative-knowledge balance) is visible on cooperative dashboards.
- **Ratio monitoring.** The cooperative dashboard surfaces two metrics: (a) per-member confirmation-to-negative-knowledge ratio, enabling each member to see the balance of their own verification activity; and (b) aggregate ratio across all active Code Breaker members, enabling the cooperative to monitor whether the collective verification effort is appropriately balanced between affirmation and falsification work.
- **Bounty activation.** When a claim is surfaced in the Code Breaker queue (by Loop 11 of Claim Group 28), the claim may be accompanied by a Marks bounty — a pledged amount of negative-knowledge-denomination Marks offered to the first Code Breaker who successfully falsifies the claim. Bounty pledging is voluntary; members, cooperative nodes, or the cooperative general fund may pledge bounties against specific claims.

The economic result is that a member who spends their career being the person who says "wait, that is wrong, here is why" is compensated equally with the member who says "here is a new thing, it is true." The intellectual labor of falsification is priced at par with the intellectual labor of affirmation. This is the cooperative's response to the replication crisis: not a call for more rigorous peer review by the same unpaid, anonymous, unaccountable process, but a structural re-pricing of falsification work as economically equal to affirmation work.

---

## Patent Claims — Claim Group 29

*(Claims drafted from canon sources cited in Yoke BP084: canon_code_breakers_guild_gold_refined_by_fire_elimination_marks_bp084. Verbatim claim substance from canon; patent-prose polish per PROV_22 style guide. Counsel finalizes formal language for non-provisional.)*

**29.1** A computer-implemented cooperative knowledge verification system comprising:
(a) an UNTESTED tier for newly submitted knowledge claims entering the cooperative substrate;
(b) a TESTED tier for claims advancing from UNTESTED upon accumulation of a configurable number K of independent verification attempts without a successful contradiction, wherein K is configurable per domain and defaults to 20;
(c) a FORGED tier for claims advancing from TESTED upon either: (i) surviving a configurable number M of adversarial contradiction attempts from cooperative Code Breaker members without a successful falsification, wherein M defaults to 10; or (ii) surviving without successful falsification for a configurable sustained period following TESTED promotion, wherein the default period is 90 days; and
(d) a GOLD_REFINED_BY_FIRE tier, designating a claim as Immutable, awarded when a FORGED-tier claim has survived all subsequent challenge cycles and has been confirmed by a cooperative Code Breaker verification committee review;
wherein each tier is mutually exclusive, each claim occupies exactly one tier at any moment, and advancement through tiers is monotonically increasing except upon admission of a reversal petition.

**29.2** The system of 29.1 further comprising a cooperative Code Breaker member tier progression comprising:
(a) an Initiate rank awarded upon first successful claim falsification, wherein a successful falsification is defined as submission of counter-evidence that achieves a contradiction confidence above a configurable threshold and causes a claim to migrate from THEORIES_OPEN status to ELIMINATED status;
(b) a Journeyman rank awarded upon accumulation of 10 successful claim falsifications;
(c) a Master rank awarded upon accumulation of 100 successful claim falsifications and 10 successful challenges against FORGED-tier claims causing those claims to revert from FORGED to TESTED status; and
(d) a Refiner of Gold rank awarded to members who have made a configurable number of good-faith adversarial challenges against claims that subsequently achieved GOLD_REFINED_BY_FIRE status, wherein the Refiner of Gold designation honors the member's role in the adversarial challenge process that earned the claim its Immutable designation, regardless of whether any individual challenge succeeded in falsification.

**29.3** A computer-implemented cooperative economic mechanism comprising:
(a) a cooperative contribution currency denominated as Marks;
(b) a negative-knowledge denomination tag applied at the ledger level to Marks earned specifically through successful demonstration that a knowledge claim is false, incomplete, or overstated, wherein the negative-knowledge denomination tag does not alter the Marks currency identity but records the epistemic nature of the work that produced the Marks;
(c) a redemption multiplier of 1.0x applied to negative-knowledge-denomination Marks, establishing economic parity between falsification-attributed Marks and affirmation-attributed Marks;
(d) a per-member cooperative dashboard metric surfacing the ratio of confirmation-denomination Marks to negative-knowledge-denomination Marks in each member's accumulated balance; and
(e) an aggregate cooperative dashboard metric surfacing the collective ratio of confirmation-denomination to negative-knowledge-denomination Marks across all active Code Breaker members.

---

## Diagrams

### Diagram E — Four-Tier Progression Flowchart (Figure 24)

```
[New claim submitted to substrate]
            |
            v
    +---------------+
    |   UNTESTED    |  (no epistemic authority; dormancy monitored)
    +---------------+
            |
            | K=20 independent verifications
            | with no successful contradiction
            v
    +---------------+
    |    TESTED     |  (moderate epistemic authority; Code Breaker eligible)
    +---------------+
            |
            | M=10 Code Breaker adversarial challenges survived
            | OR 90 days sustained without falsification
            v
    +---------------+
    |    FORGED     |  (high epistemic authority; pheromone-premium;
    +---------------+   GOLD candidate)
            |
            | All subsequent challenges survived
            | + Code Breaker committee review confirms
            v
    +--------------------------------+
    | GOLD_REFINED_BY_FIRE (Immutable)|
    +--------------------------------+
            |
            | [Reversal path -- occasional, high-bar]
            | New empirical data + Guild majority vote
            | + new challenge cycle
            |
            +-- [Reversal confirmed] --> ELIMINATED
            +-- [Reversal not confirmed] --> re-achieves GOLD_REFINED_BY_FIRE
```

*Figure 24: Four-tier knowledge claim progression — UNTESTED → TESTED → FORGED → GOLD_REFINED_BY_FIRE (Immutable), with configurable thresholds K=20, M=10, 90 days, and the reversal path requiring new empirical data and Guild majority vote.*

---

### Diagram F — Code Breaker Member Tier Progression (Figure 25)

```
+-------------------+      1 successful falsification
|      Initiate     | ---------------------------------------->
+-------------------+

+-------------------+      10 successful falsifications
|    Journeyman     | ---------------------------------------->
+-------------------+

+-------------------+      100 successful falsifications
|      Master       |      + 10 FORGED-tier challenges successful
+-------------------+

+-------------------+      10 good-faith challenges against
|  Refiner of Gold  |      claims that achieved IMMUTABLE
+-------------------+      (HIGHEST HONOR: honest failed attacks
                            that earned the claim its Immutable status)
```

*Figure 25: Code Breaker member tier progression — Initiate, Journeyman, Master, Refiner of Gold. The Refiner of Gold rank inverts conventional honor structure: highest rank awarded for honest hard attacks that FAILED, because those failed attacks directly caused claims to achieve Immutable status.*

---

### Diagram G — Negative-Knowledge Tokens Dashboard (Figure 26)

```
COOPERATIVE MEMBER DASHBOARD — Code Breaker Activity

Member: [cooperative_node_id]
+----------------------------------------------------------+
|  MARKS BALANCE                                           |
|  Total Marks:              1,247 M                       |
|  Confirmation-denomination:  894 M  (71.7%)              |
|  Negative-knowledge-denomination: 353 M (28.3%)          |
|                                                          |
|  Confirmation:Negative-Knowledge ratio:  2.53:1          |
+----------------------------------------------------------+
|  CODE BREAKER ACTIVITY                                   |
|  Claims falsified (total):    47                         |
|  Claims challenged (survived): 22                        |
|  Member tier:                 Master                     |
|  Claims I challenged now IMMUTABLE: 3                    |
|  (Refiner of Gold progress: 3/10)                        |
+----------------------------------------------------------+

AGGREGATE COOPERATIVE DASHBOARD
+----------------------------------------------------------+
|  ACTIVE CODE BREAKER MEMBERS: 847                        |
|  Aggregate confirmation Marks earned (30d): 2,847,000 M  |
|  Aggregate neg-knowledge Marks earned (30d): 1,103,000 M |
|  Aggregate ratio (30d): 2.58:1                           |
|                                                          |
|  Claims at GOLD_REFINED_BY_FIRE: 1,847                   |
|  Claims at FORGED:               12,394                  |
|  Claims at TESTED:               84,291                  |
|  Claims at UNTESTED:             203,847                  |
+----------------------------------------------------------+
```

*Figure 26: Negative-Knowledge Tokens dashboard — per-member view (confirmation vs. negative-knowledge Marks balance and ratio; Code Breaker tier progress; Refiner of Gold progress) and aggregate cooperative view (collective ratio; claim tier distribution).*

---

## Empirical Receipt and Reduction to Practice

The Code Breakers Guild and Gold Refined by Fire mechanism was ratified during BP084 session by Founder direct. The four-tier claim progression (UNTESTED → TESTED → FORGED → GOLD_REFINED_BY_FIRE) with thresholds K=20, M=10, and 90-day sustained period was ratified by Founder as the canonical verification ladder. The Refiner of Gold honor — awarding the highest Code Breaker distinction to members whose honest hardest attacks against eventually-Immutable claims failed — was ratified by Founder as a deliberate inversion of conventional recognition structure.

The negative-knowledge-denomination Marks mechanism was ratified as a tagged denomination within the existing Marks currency system, not a new cooperative currency. The 3-currency canon (Marks / Joules / Credits) is preserved; negative-knowledge Marks are Marks with a denomination tag, not a fourth currency. The 1.0x redemption multiplier was ratified by Founder as the canonical economic parity signal.

The game-theoretic analysis (paying Code Breakers inverts peer-review perverse incentives; comparison to bug bounty prior art) is grounded in the published literature: Ioannidis (2005) on peer review pathology; bug bounty program empirical results across the software security industry from 2010-present.

This mechanism composes with and extends: Claim Group 1 (Canonical Plow Pipeline — Code Breaker queue is surfaced by Loop 11); Claim Group 12 (Substitution Rail Triple-Mode Exchange — Marks earned by Code Breakers circulate via the Marks rail, not fiat); Claim Group 14 (EAC Pheromone Decay — FORGED and GOLD_REFINED_BY_FIRE claims receive provenance-premium in decay scoring); Claim Group 26 (Substitution Rail Cooperative Marketplace — Medallion provenance stamps interact with claim tier); and Claim Group 28 (Truth Integrity Chain — Loop 11 surfaces Code Breaker candidates; Loop 10 survival scores inform tier progression).

Reduction to practice: the Code Breakers Guild queue is implemented in the 12-Blade Column Plow runtime as a structured output of Loop 11 (Claim Group 28, element (d)). The tier-progression logic is implemented as a configurable threshold checker on the eblet-level K and M counters. The negative-knowledge-denomination Marks ledger tag is implemented in the cooperative marks-ledger schema as an enum field on the Marks transaction record.

---

*Cross-reference: Innovation Area 35 (Claim Group 28) — Truth Integrity Chain — defines the five-field TIC record (KNOWN / THEORIES_OPEN / ELIMINATED / DEPENDENCIES_UPSTREAM / APPLICATIONS_DOWNSTREAM) that Code Breakers operate upon. Innovation Area 35 must be read alongside Innovation Area 36 for full understanding of the verification architecture.*

---

*Liana Banyan Corporation * Inventor: J. Jones * Provisional Patent Application*
*BP084 * Sonnet 4.6 * June 16, 2026*
*Innovation Area 36 * Claim Group 29 * status: founder-ratify-pending*
