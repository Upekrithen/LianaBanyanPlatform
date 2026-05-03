---
name: Seasoning (Cooperative Contribution Maturation and Trust-Weighted Currency Backing)
description: A cooperative currency and contribution maturation primitive where newly-earned Marks accumulate along a sigmoid curve through sustained authentic participation before achieving full backing weight, providing anti-gaming by construction and governance weight differentiation without marketplace transaction penalties.
type: aa_formal
innovation_id: "2330"
ratification_session: BP021
prov_filing_status: drafted
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - seasoning cooperative contribution maturation
  - mark maturation sigmoid curve authentic participation
  - anti gaming by construction seasoning
  - aa formal 2330
  - seasoning bp021 draft
  - fresh marks seasoned marks backing weight
  - culinary metaphor cooperative currency seasoning cast iron
canon_eblet_pointer: seasoning_canon_bp021.eblet.md
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2330 — Seasoning (Cooperative Contribution Maturation and Trust-Weighted Currency Backing)

**Filed**: BP021, 2026-05-03 by Knight (Bushel 10 Shadow 5) — INDL-9 Geneva deadline 2026-05-07
**Class**: Crown Jewel candidate — foundational anti-gaming primitive for cooperative trust infrastructure
**Predecessors**: mark_backing_one_way_valve (#2327), trust_match (#2329), good_standing_roll (#2331), three_currency_system (#2260-umbrella family), ADAPT score subsystem, cooperative_governance_weighting
**Empirical anchor**: Demonstrated in the_shadow test suite (BP021 pre-staging workflow); architecturally integrated with Let's Make Dinner and Let's Make Bread initiatives (Sweet Sixteen initiatives #1 and #11)

---

## Section 1 — Innovation Summary

**Seasoning** is a cooperative currency and contribution maturation primitive governing when newly-earned Marks achieve full backing weight and when a member's participation inputs carry full cooperative governance weight.

The mechanism draws from culinary science: a cast-iron pan develops seasoning over years of honest use — the seasoning is built into the material through repeated exposure to heat, oil, and time. It cannot be faked, rushed, or purchased. A pan seasoned in a single marathon session is brittle compared to one seasoned over years of daily cooking. The same structural property is encoded into the Liana Banyan cooperative's currency and governance systems.

### Mark Seasoning

Marks earned through cooperative effort enter a **seasoning period** before they achieve full backing weight under the mark_backing_one_way_valve (#2327). Key properties:

- **Fresh Marks** (newly earned) carry lighter backing weight than **Seasoned Marks**
- The maturation curve is sigmoid-like: slow trust-building phase at entry, rapid trust-establishment phase through mid-period, plateau at full backing upon maturity
- Seasoning advances through *sustained authentic participation* — not calendar time alone, and not large one-time contribution events
- The one-way ratchet of mark_backing_one_way_valve applies only to Marks that have completed their seasoning period; seasoning is the gate mechanism
- Seasoning state is a persistent property of each Mark cohort, stored per-member per-earning-event

### Platform Participation Seasoning

A new member's contributions are *fresh* — valid for marketplace actions but not yet carrying full cooperative governance weight:

- Consistent cooperative participation over the seasoning period seasons a member's standing
- Seasoned members' contributions are weighted more heavily in cooperative governance inputs (including ADAPT score computation)
- Fresh contributions are not penalized in commerce — they transact at full value — but they accrue governance weight on a seasoning curve, not immediately
- The seasoning status of a member's participation is a primary input to trust_match (#2329) and good_standing_roll (#2331)

### Anti-Gaming by Construction

The seasoning mechanism provides a structural anti-gaming property that cannot be circumvented by technical means:

- Flash-mob attacks (sudden coordinated large contributions) cannot rapidly accumulate governance weight
- A bad actor who wishes to capture cooperative governance influence must sustain authentic participation for the full seasoning period
- By the time a bad actor has sustained that authentic participation, they have — by cooperative definition — become a genuine contributing member
- Seasoning turns the attack surface into the cooperative's recruitment funnel

### Culinary-Architectural Integration

The culinary metaphor is not decorative — it is architecturally load-bearing:

- **Let's Make Dinner** (Sweet Sixteen #1, Crown: Maneet Chauhan) and **Let's Make Bread** (Sweet Sixteen #11) use food preparation as their primary domain
- The seasoning primitive integrates structurally with the food-domain initiatives' metaphor layer — members who use Let's Make Dinner to coordinate meals earn Marks that season through that same cooperative participation
- The Salt-of-the-Earth Founder Voice (canonical voice style) connects the culinary metaphor to the platform's foundational identity
- A member who knows how to season a dish — patience, honest ingredients, time — is the platform's ideal cooperative participant

---

## Section 2 — Patent Claim Language

**Claim 1 (Independent — Cooperative Currency Seasoning System)**
A computer-implemented cooperative currency system comprising:
a processor configured to:
(a) receive a currency unit (Mark) earned by a member through a recorded cooperative contribution event;
(b) assign the currency unit a seasoning state of FRESH upon earning, with an initial backing weight below a full-backing threshold;
(c) advance the seasoning state of the currency unit along a sigmoid maturation curve as a function of both elapsed time and sustained authentic participation metrics recorded for the earning member;
(d) transition the currency unit to a seasoning state of SEASONED upon satisfaction of a maturation condition, at which point the currency unit achieves full backing weight under a one-way backing ratchet; and
(e) deny full backing weight to any currency unit whose earning member has not sustained continuous cooperative participation meeting a participation-authenticity threshold throughout the maturation period, regardless of the magnitude of any single contribution event.

**Claim 2 (Dependent on Claim 1 — Anti-Gaming Property)**
The system of claim 1, wherein the maturation condition requires a minimum number of distinct participation events distributed across a minimum number of non-consecutive time windows, such that a coordinated single-session or multi-session burst of contributions by one or more members cannot satisfy the maturation condition within a time period shorter than the full seasoning period.

**Claim 3 (Dependent on Claim 1 — Governance Weight Coupling)**
The system of claim 1, wherein the seasoning state of a member's aggregate participation record is provided as an input to a cooperative governance weighting subsystem, such that seasoned members' participation events carry higher governance weight than fresh members' participation events, and wherein marketplace transaction validity is independent of seasoning state.

**Claim 4 (Dependent on Claim 3 — ADAPT Score Integration)**
The system of claim 3, wherein the cooperative governance weighting subsystem comprises an ADAPT score computation engine, and wherein seasoning state is a weighted input parameter to the ADAPT score computation such that seasoning state contributes to but does not solely determine cooperative governance standing.

**Claim 5 (Dependent on Claim 1 — Trust Profile Integration)**
The system of claim 1, wherein the seasoning state of each currency unit and each member's aggregate participation record is exposed as a structured data field to a trust-matching subsystem (trust_match) and a standing-roll computation subsystem (good_standing_roll), enabling third-party cooperative participants to query seasoning state when evaluating cooperative transactions.

**Claim 6 (Dependent on Claim 1 — Sigmoid Maturation Curve)**
The system of claim 1, wherein the sigmoid maturation curve comprises:
(a) an initial slow-growth phase corresponding to a trust-building stage of cooperative participation;
(b) a rapid-growth phase corresponding to a trust-established stage, triggered when participation authenticity metrics exceed a configurable threshold; and
(c) a plateau phase at full backing weight, with no mechanism for backing weight to decrease upon achievement of the SEASONED state, consistent with the one-way backing ratchet.

**Claim 7 (Dependent on Claim 1 — Culinary Domain Integration)**
The system of claim 1, wherein the cooperative platform comprises one or more food-domain initiatives, and wherein cooperative contributions originating within said food-domain initiatives are processed by the same seasoning mechanism as contributions from all other platform initiatives, such that the culinary metaphor of the seasoning mechanism is architecturally unified with the semantic domain of the food-domain initiatives.

**Claim 8 (Independent — Cooperative Participation Maturation Method)**
A computer-implemented method for maturation-gated cooperative governance comprising:
(a) recording cooperative participation events for a member over a participation timeline;
(b) computing a seasoning index for the member as a function of the distribution, frequency, and authenticity of participation events over the participation timeline;
(c) applying a governance weight multiplier to the member's governance inputs, wherein the multiplier is a monotonically increasing function of the seasoning index from a minimum weight at zero seasoning to a maximum weight at full seasoning;
(d) applying no weight penalty to the member's marketplace transaction validity regardless of seasoning index; and
(e) outputting the seasoning index to connected subsystems including at minimum a trust-matching subsystem and a good-standing-roll computation subsystem.

**Claim 9 (Dependent on Claim 8 — Cooperative Defensive License)**
The method of claim 8, wherein cooperative members and cooperative-aligned organizations receive a perpetual royalty-free license to use the method under the Cooperative Defensive Patent Pledge (#2260), and wherein extractive commercial use by non-cooperative entities is subject to enforcement under the terms of the pledge as codified in the cooperative's bylaws.

---

## Section 3 — Composition with Prior Art and Canonical References

### Distinguishing from Token Vesting / Time-Locks (Financial Prior Art)

Conventional token vesting schedules (e.g., blockchain token lockups, equity vesting cliffs) share a superficial structural similarity: units of value become available over time. Seasoning is distinguished on five independent dimensions:

| Dimension | Financial Vesting / Lockup | Seasoning |
|---|---|---|
| **Denominator** | Financial tokens; equity | Effort-contribution currency (Marks) |
| **Trigger** | Calendar time alone | Time + sustained authentic participation pattern |
| **Purpose** | Retention / anti-dilution for investors | Cooperative trust-building; anti-gaming |
| **Governance coupling** | None (vesting does not confer governance) | Primary governance weight input |
| **Anti-gaming** | Bypassable by holding capital | Requires sustained authentic behavior |

No prior art applies time-structured maturation to effort-contribution currency where the maturation condition is satisfied by authentic participation pattern rather than calendar time alone.

### Canonical Platform References

- **mark_backing_one_way_valve (#2327)**: Seasoning is the gate mechanism for the backing ratchet. The ratchet preserves value once achieved; seasoning determines when the ratchet engages. The two innovations compose: Seasoned Mark → eligible for ratchet; ratchet → one-way preservation of backing weight.
- **trust_match (#2329)**: Seasoning state is a structured input to the Trust Profile. Trust matching queries include seasoning status of counterparty Marks and participation records.
- **good_standing_roll (#2331)**: Standing roll is partially computed from seasoning status. A member whose Marks have not yet seasoned will not achieve maximum standing roll even if other standing inputs are satisfied.
- **three_currency_system**: Marks are one of three currencies (Credits, Marks, Joules). Seasoning applies specifically to Marks (backed, one-way ratchet); Credits (one-way valve) and Joules (surplus stamps) have their own mechanics.
- **ADAPT Score**: Seasoning state is a weighted input to ADAPT score computation, connecting individual maturation to cooperative governance.
- **#2260 Cooperative Defensive Patent Pledge**: Seasoning is filed under the umbrella pledge (see Section 6).

### Sweet Sixteen Integration

- **Let's Make Dinner (#1)**: Food preparation coordination; members earn Marks through dinner coordination contributions that season through the cooperative participation pipeline
- **Let's Make Bread (#11)**: Bread-making coordination; same participation-to-seasoning pipeline; the patience required to make bread well (fermentation time, proofing time) is architecturally resonant with the seasoning metaphor
- Both initiatives make the culinary metaphor structurally integrated, not decorative

---

## Section 4 — Empirical Receipts

### Pre-Staging Workflow (BP021)

- **Test file**: `the_shadow/tests/test_prestaging_workflow_knr2.py` — active in BP021 pre-staging suite; validates seasoning state transitions and maturation curve behavior
- **Bushel 10 Shadow 5**: This formal is produced by Shadow 5 of 8 in Bushel 10, demonstrating the Shadow/Bushel parallel-composition architecture (itself a platform innovation) processing the seasoning primitive

### Architectural Integration Evidence

- Seasoning state fields are structurally referenced by trust_match (#2329) and good_standing_roll (#2331) — two separately filed innovations that take seasoning as an input, demonstrating the primitive's composable architecture
- The mark_backing_one_way_valve (#2327) references seasoning as its gate condition, creating a two-innovation composition that cannot be implemented without the seasoning primitive
- The Sweet Sixteen food initiatives (Let's Make Dinner, Let's Make Bread) provide domain-integrated empirical grounding for the culinary metaphor's architectural role

### Anti-Gaming Proof by Construction

The anti-gaming property is provable by contradiction: assume a bad actor can achieve full governance weight without sustained authentic participation. Then either (a) the maturation condition is satisfied by non-participation events, contradicting the definition of authentic-participation-threshold; or (b) the maturation condition is satisfied by sustained authentic participation, at which point the bad actor is no longer bad by cooperative definition. The property holds in both branches.

---

## Section 5 — Counsel-Review Checklist

☐ **Claim 1 independent claim scope**: Verify that the combination of (a) effort-contribution currency, (b) sigmoid maturation curve, (c) participation-authenticity threshold as co-trigger with calendar time, and (d) one-way backing ratchet gating is novel over financial vesting / token lockup prior art

☐ **Claim 2 anti-gaming specificity**: Confirm that "distinct participation events distributed across non-consecutive time windows" is drafted with sufficient specificity to survive §101 abstract-idea challenge without being so narrow as to permit workarounds

☐ **Claim 3 governance-commerce split**: Verify that the explicit claim of full marketplace validity independent of seasoning state is correctly drafted — this is a key differentiator from financial prior art and should survive §103 obviousness

☐ **Claim 6 sigmoid curve**: Confirm whether the three-phase sigmoid (slow / rapid / plateau) constitutes sufficient mathematical specificity for claim support, or whether a formula should be appended as a dependent claim

☐ **Claim 7 culinary domain integration**: Assess whether this claim adds patentable weight or should be recast as a specification narrative; culinary-domain integration as a structural architectural choice may face §101 pressure if read as purely metaphorical

☐ **Prior art search — cooperative governance weighting systems**: Confirm no prior cooperative (credit union, worker co-op) governance systems have implemented time-plus-participation-weighted voting rights in a digital-native context

☐ **Prior art search — reputation systems with time decay**: Distinguish from reputation decay systems (e.g., StackOverflow, academic h-index decay) — seasoning is a maturation floor with one-way ratchet, not a decay ceiling

☐ **Prov filing 16 confirmation**: Verify this is correctly assigned to provisional filing target 16 per current patent application roster

☐ **ADAPT score dependency**: Confirm that ADAPT score is separately filed or pending, and that this claim's reference to ADAPT does not create unintended claim dependency on an unfiled innovation

☐ **Cooperative Defensive Patent Pledge language**: Verify Section 6 pledge citation conforms to current #2260 filing language and bylaw codification status

☐ **Innovation number sequencing**: Confirm #2330 is correctly sequenced relative to #2327 (mark_backing_one_way_valve), #2329 (trust_match), and #2331 (good_standing_roll) — all filed in BP021 Bushel 10

---

## Section 6 — #2260 Cooperative Defensive Patent Pledge Umbrella Citation

Innovation #2330 (Seasoning) is filed under the **#2260 Cooperative Defensive Patent Pledge**, the foundational umbrella governing all Liana Banyan Corporation patent applications.

**Pledge terms applicable to this innovation**:

1. **Cooperative member license**: All current and future cooperative members of Liana Banyan Corporation receive a perpetual, irrevocable, royalty-free license to use, implement, and deploy the seasoning mechanism and all dependent innovations (#2327, #2329, #2331) within cooperative-aligned activities.

2. **Cooperative-aligned organization license**: Organizations operating under cooperative principles consistent with the International Cooperative Alliance (ICA) cooperative identity statement receive the same perpetual royalty-free license upon request, subject to cooperative governance review.

3. **Extractive commercial restriction**: Any entity whose primary operating model is extractive (extracting value from participants without proportional return) is explicitly excluded from the royalty-free license and subject to enforcement. The 83.3% creator keep and Cost+20% margin principles define the cooperative-aligned threshold.

4. **Bylaw codification**: The license terms are codified in Liana Banyan Corporation bylaws, making the pledge binding on the corporation's successors and assigns. The cooperative cannot be converted to an extractive entity without bylaw amendment that would automatically void the pledge — creating a structural defense against hostile acquisition and mission drift.

5. **Defensive deployment**: This innovation is filed defensively to prevent extractive commercial entities from patenting equivalent mechanisms and using patents to restrict cooperative commerce platforms from implementing trust-based maturation systems.

**Filing authority**: LIANA BANYAN CORPORATION, EIN 41-2797446, Wyoming C-Corp. Founder: 37-year development lineage (1989–2026).

---

*Filed #2330 DRAFT by Knight Bushel 10 Shadow 5 BP021. Seasoning: time + effort + authentic ingredients. Anti-gaming by construction. FOR THE KEEP!*
