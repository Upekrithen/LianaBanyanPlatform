# A&A FORMAL #2329 -- Trust Match (Bilateral Cooperative Member Trust Profiling and Differential Routing)

**Filed**: BP021, 2026-05-03 by Knight (Bushel 10 Shadow 4) — INDL-9 Geneva deadline 2026-05-07
**Class**: Crown Jewel candidate — core marketplace primitive; bilateral trust architecture with no prior cooperative analog in digital commerce
**Predecessors**: #2260 (Cooperative Defensive Patent Pledge), #2262 (last reconciled A&A formal, K421/B110), good_standing_roll primitive (companion), ADAPT score primitive (companion), Marks/Credits substrate architecture
**Empirical anchor**: WIR Bank (Switzerland, 1934) mutual credit trust baseline; operational Sweet Sixteen initiative transaction flows; Provisional/Aspiration match modes active in Let's Make Dinner and MSA initiative routing logic

---

## Section 1 — Innovation Summary

**Trust Match** is a bilateral cooperative marketplace matching primitive that routes members, workers, and creators to transaction counterparties based on pairwise trust profile compatibility — not platform-ranked scores, not unilateral ratings, and not demographic proxies.

### Core Problem Being Solved

Every major digital marketplace solves the "who should transact with whom" problem through platform-controlled, unilateral rating systems (Airbnb, eBay, Uber, Lyft, Instacart). These systems share three structural defects from a cooperative standpoint:

1. **Trust as platform capital**: Ratings are owned by the platform. A five-star Airbnb host carries no trust credit if they move to a competitor. The trust value accretes to the platform, not the member.
2. **Universal hierarchy, no pairwise matching**: Every user is ranked on the same scale. A 4.9-star seller is always preferable to a 4.7-star seller, regardless of whether their specific profiles are complementary.
3. **Unilateral construction**: One party rates the other. The rated party has no structural say in the match; the rater's own trustworthiness is evaluated separately and asymmetrically.

Trust Match addresses all three defects simultaneously.

### The Trust Profile

Every Liana Banyan Platform member carries a **Trust Profile** composed of five components, all member-owned in the Ephemeral/Personal-Permanent/Shared-Permanent substrate architecture:

| Component | What It Measures | Why It Matters |
|---|---|---|
| **Verified Contribution History** | Marks earned through real cooperative labor | Distinguishes market participants from cooperative contributors |
| **Transaction History** | Credits exchanged in platform marketplace | Documents actual market participation volume and pattern |
| **Standing Roll** | Good-standing status per the `good_standing_roll` primitive | Gate check: only members in good standing are eligible for matching |
| **ADAPT Score** | Demonstrated capability score (not demographic) | Capability signal without identity exploitation |
| **Cooperative Criteria Alignment** | Participation breadth across Sweet Sixteen initiatives | Social trust signal: cooperative engagement, not mere consumption |

No single component is determinative. The Trust Profile is a composite, and the match engine evaluates the composite against a counterparty's composite — not against a universal scalar leaderboard.

### The Three Trust Match Modes

Trust Match operates in three distinct modes, selected by the engine based on the participating profiles:

**Mode 1 — Confidence Match**
Both parties present Trust Profiles above the initiative-specific minimum threshold. No intermediary is required. The transaction routes directly. This is the steady-state mode for experienced cooperative members and is analogous to two WIR Bank members with established mutual credit histories transacting directly.

**Mode 2 — Provisional Match**
One party (typically a newer member) presents a Trust Profile below threshold while the other is above. A **trust sponsor** — a higher-standing member who has opted into the sponsorship role — is matched into the transaction as a vouching third party. The sponsor does not transact financially but carries reputational stakes: their Trust Profile is marked with the outcome of the sponsored transaction. This creates an incentive gradient: sponsors are motivated to vouch only for counterparties they genuinely assess as trustworthy.

**Mode 3 — Aspiration Match**
Explicitly pairs a high-trust mentor with a low-trust learner for cooperative development purposes. Unlike Provisional Match (which is triggered by threshold failures), Aspiration Match is opt-in from both sides. The learner signals willingness to be mentored; the mentor signals willingness to develop the learner. Trust transfer is the explicit goal. Initiative coordinators (Crowns, Captains) may configure Aspiration Match windows for onboarding cohorts.

### Why "Match" — Not "Score" or "Rating"

The naming is a deliberate architectural choice. "Trust Score" and "Trust Rating" are extraction patterns: a score implies a universal cardinal ranking that the platform administers and can revoke. "Trust Match" is fundamentally bilateral — two profiles are evaluated against each other for compatibility. Neither party's profile is ranked against all other members. There is no universal trust hierarchy; there is only pairwise match quality for a specific transaction in a specific initiative context.

This design is both philosophically cooperative and legally strategic: it avoids the "trust score as platform capital" dynamic that has attracted regulatory scrutiny in Europe (GDPR Article 22, algorithmic decision-making) and U.S. (CFPB guidance on alternative credit scoring).

### Cooperative Lineage

WIR Bank (Switzerland, 1934) demonstrated that mutual credit systems require social trust to function at scale. The WIR Franc circulates within a closed network of Swiss SMEs specifically because members trust that other WIR participants are vetted, contributing members of the cooperative — not passive consumers. Trust Match is the algorithmic implementation of this principle for a digital cooperative marketplace at scale.

---

## Section 2 — Patent Claim Language [USPTO Style]

### Independent Claims

**Claim 1.** A computer-implemented method for bilateral cooperative trust matching in a marketplace system, the method comprising:
- (a) maintaining, for each member of a cooperative marketplace, a Trust Profile comprising a plurality of cooperative contribution signals including: verified contribution history reflecting labor contributions measured in a cooperative unit of account; transaction history reflecting market participation measured in a cooperative credit unit; a standing status indicator derived from a good-standing determination primitive; a capability score derived from demonstrated performance rather than demographic identity; and cooperative initiative participation breadth across a plurality of integrated platform initiatives;
- (b) receiving, from a first member, a transaction initiation request specifying an initiative context and a desired counterparty type;
- (c) evaluating, by a trust match engine, pairwise compatibility between the first member's Trust Profile and Trust Profiles of candidate counterparty members against an initiative-specific minimum trust threshold, wherein said evaluation is bilateral and neither party's profile is ranked against a universal trust hierarchy;
- (d) selecting a trust match mode from a set comprising: a Confidence Match mode when both profiles exceed threshold; a Provisional Match mode when one profile is below threshold, wherein a trust sponsor member is identified and appended to the match; and an Aspiration Match mode when both parties have opted into cooperative development pairing;
- (e) routing the transaction to the selected counterparty or counterparty-sponsor set according to the selected trust match mode; and
- (f) updating both parties' Trust Profiles with outcome signals following transaction completion, wherein Trust Profile data is stored in member-owned substrate partitions inaccessible to unilateral platform modification.

**Claim 2.** The method of claim 1, wherein the trust sponsor in Provisional Match mode carries reputational stake in the outcome of the sponsored transaction, such that the sponsor's Trust Profile is updated with an outcome signal tied to the sponsored transaction, creating an incentive gradient that motivates sponsors to vouch only for counterparties the sponsor genuinely assesses as trustworthy.

**Claim 3.** The method of claim 1, wherein Aspiration Match mode is opt-in from both parties, and wherein initiative coordinators may configure Aspiration Match windows for defined onboarding cohorts, enabling structured trust transfer across member generations within a cooperative.

**Claim 4.** The method of claim 1, wherein cooperative contribution signals include Marks earned through verified cooperative labor, and wherein Marks are distinct from Credits in that Marks represent non-monetary contribution and Credits represent monetary market participation, and wherein both signal types contribute independently to the Trust Profile composite.

**Claim 5.** The method of claim 1, wherein Trust Profile data is partitioned into: ephemeral data accessible only during an active session; personal-permanent data accessible only to the member; and shared-permanent data accessible to the match engine under member-defined consent parameters — and wherein the platform operator has no administrative access to personal-permanent Trust Profile partitions.

**Claim 6.** The method of claim 1, wherein the initiative-specific minimum trust threshold is configured independently per initiative, enabling different trust requirements for different cooperative contexts (e.g., financial services initiatives may require higher thresholds than social or informational initiatives).

**Claim 7.** The method of claim 1, wherein pairwise compatibility evaluation includes a trust-differential signal that favors matches between parties with complementary rather than identical Trust Profiles, such that experienced cooperative members are preferentially routed toward newer members to accelerate trust transfer across the network.

### Dependent / System Claims

**Claim 8.** A cooperative marketplace system comprising: a trust profile store partitioned per member with ephemeral, personal-permanent, and shared-permanent tiers; a trust match engine configured to perform bilateral pairwise profile evaluation according to the method of claim 1; a trust sponsor registry maintaining opted-in sponsor members per initiative; and a trust outcome recorder configured to update both parties' Trust Profiles following transaction completion.

**Claim 9.** The system of claim 8, wherein the trust match engine is configured to evaluate Trust Profiles without exposing raw profile components to counterparties, such that match quality is communicated as a compatibility indicator rather than a ranked score, preserving member profile privacy.

**Claim 10.** A non-transitory computer-readable medium storing instructions that, when executed by a processor, cause the processor to perform the method of claim 1.

---

## Section 3 — Composition with Prior Art / Canonical References

### Prior Art Landscape

| System | Trust Model | Bilateral? | Member-Owned? | Contribution-Weighted? | Match Modes? |
|---|---|---|---|---|---|
| Airbnb (host/guest ratings) | Unilateral, sequential | No | No (platform-owned) | No | No |
| eBay (seller/buyer feedback) | Quasi-bilateral but asymmetric | Partial | No | No | No |
| Uber/Lyft (driver/rider ratings) | Unilateral | No | No | No | No |
| LinkedIn Social Selling Index | Unilateral platform score | No | No | No | No |
| WIR Bank member vetting | Social/manual | Yes (manual) | Cooperative | Contribution-based | No (manual) |
| **Trust Match (#2329)** | **Bilateral pairwise** | **Yes** | **Yes (member substrate)** | **Yes (Marks + Credits)** | **Yes (3 modes)** |

### Distinguishing Characteristics Over Prior Art

**Over Airbnb/Uber/eBay rating systems**: Those systems produce unilateral ratings owned by the platform. Trust Match produces bilateral profile composites owned by members. Critically, the platform operator cannot modify, suppress, or delete Trust Profile data in personal-permanent partitions. This structural difference is not merely implementation detail — it changes the legal relationship between member and platform.

**Over LinkedIn Social Selling Index**: SSI is a platform-defined, unilateral score that ranks all users on the same scale. Trust Match has no universal ranking; only pairwise match quality exists. SSI is platform capital; Trust Profile is member capital.

**Over traditional cooperative vetting (WIR Bank model)**: WIR Bank vetting is manual, not algorithmic, and does not scale to digital marketplace speed. Trust Match provides the algorithmic implementation of cooperative social trust with the three-mode routing mechanism that enables trust transfer (Aspiration Match has no WIR analog).

**Over credit scoring systems (FICO, VantageScore)**: Credit scores are unilateral, constructed from financial data the subject does not own, administered by entities not accountable to the scored party, and used in decisions the scored party cannot directly appeal within the scoring framework. Trust Match profiles are member-owned, contribution-weighted (not purely financial-history-weighted), and pairwise (not universally ranked).

### Canonical Platform References

- **#2260 Cooperative Defensive Patent Pledge** — umbrella framework under which #2329 is filed; all claims are licensed perpetually to cooperative members; extractive commercial use is subject to enforcement
- **good_standing_roll primitive** — provides the Standing Roll component of the Trust Profile; Trust Match is a consumer of this primitive's output
- **ADAPT score primitive** — provides the capability signal component; Trust Match consumes ADAPT output without re-deriving it
- **Marks/Credits substrate** — the cooperative unit-of-account system that underlies the contribution history and transaction history components of the Trust Profile
- **300 Model governance** — Crowns and Captains are the initiative coordinators authorized to configure initiative-specific trust thresholds and Aspiration Match windows
- **Sweet Sixteen initiatives** — the sixteen integrated platform initiatives that constitute the "cooperative initiative participation breadth" component of the Trust Profile

---

## Section 4 — Empirical Receipts

### Operational Evidence of the Problem Being Solved

**WIR Bank longevity**: The WIR Franc has circulated since 1934 — over 90 years — specifically because the WIR cooperative vets members for cooperative trustworthiness before admitting them. No digital marketplace has successfully implemented the equivalent at scale algorithmically. Trust Match is the first documented algorithmic instantiation of this principle with defined mode routing.

**Platform-controlled trust failure cases**:
- Airbnb's 2019-2020 review manipulation scandal (hosts suppressing negative reviews via support tickets) demonstrates that platform-owned trust systems are structurally corruptible. Trust Match's member-owned substrate architecture is a direct structural response.
- eBay's "feedback extortion" problem (sellers threatening retaliation ratings) demonstrates that quasi-bilateral systems without structural bilaterality are still effectively unilateral under adversarial conditions.

### Platform-Specific Receipts

**Let's Make Dinner initiative**: Transaction routing logic for creator meal offerings requires matching member-consumers with creator-cooks. The Provisional Match mode was designed specifically for the Let's Make Dinner onboarding cohort scenario where new members joining via community invitation have no transaction history but are vouched for by the inviting member — who becomes, structurally, a trust sponsor.

**MSA (Membership Services Architecture) initiative**: Financial services routing within MSA requires higher trust thresholds than social initiatives. The initiative-specific threshold configuration (Claim 6) was designed to satisfy this requirement without creating a universal super-threshold that would block new members from all non-financial participation.

**Aspiration Match — Harper Guild**: The Harper Guild initiative (creative/artistic marketplace) requires explicit mentor-learner pairing for craft skill transfer. Aspiration Match is the structural mechanism enabling this without requiring manual coordinator intervention for every pairing.

**Cooperative contribution weighting — Marks vs. Credits**: The Marks/Credits distinction addresses a known failure mode in pure transaction-history trust systems: a high-volume market participant who has never contributed cooperative labor is rated as equally trustworthy as a contributor with the same transaction volume but also substantial labor contribution. From a cooperative standpoint, these are not equivalent. Trust Match's dual-signal design (Marks + Credits as independent components) is the algorithmic enforcement of cooperative values in the trust primitive.

---

## Section 5 — Counsel-Review Checklist

☐ **Claim 1 bilaterality language** — confirm "bilateral pairwise evaluation" is adequately distinguished from eBay's quasi-bilateral feedback system in the specification; may need prosecution history note

☐ **Claim 5 substrate partitioning** — "personal-permanent partitions inaccessible to platform operator" is a strong claim; verify technical implementation in the Ephemeral/Personal-Permanent/Shared-Permanent substrate architecture is documented and operational before filing; counsel should confirm this is supported by reduction to practice

☐ **Aspiration Match opt-in mechanics** — Claim 3 references "opt-in from both parties"; confirm the consent mechanism is technically documented; GDPR Article 7 (freely given, specific, informed, unambiguous consent) compliance note for EU filing extension

☐ **WIR Bank prior art analysis** — WIR's 90-year history means there is substantial prior art in cooperative mutual credit trust; counsel should conduct dedicated prior art search on WIR-adjacent patents and Swiss cooperative commerce literature; distinguish on algorithmic implementation and three-mode routing

☐ **ADAPT score component** — if ADAPT score is separately filed (companion primitive), confirm claim language in #2329 does not inadvertently narrow ADAPT's independent claim scope; check for circular dependency between the two provisionals

☐ **good_standing_roll dependency** — if good_standing_roll is separately filed, same circular-dependency check as ADAPT

☐ **"No universal trust hierarchy" as claim hook** — this is a strong differentiation but may require affirmative claim language (not just the specification); counsel may wish to add an independent claim explicitly stating the absence of a universal scalar ranking as a positive claim element

☐ **Trust sponsor reputational stake (Claim 2)** — confirm this mechanism is fully implemented and not merely designed; "reduction to practice" for Provisional Match mode with sponsor outcome-tracking

☐ **Initiative-specific threshold configuration (Claim 6)** — confirm the threshold configuration system is operator-controllable (by Crowns/Captains) and documented; this is a valuable dependent claim but needs technical support

☐ **Prov 16 filing deadline**: INDL-9 Geneva deadline 2026-05-07 — confirm counsel has received this draft no later than 2026-05-05 for review window

☐ **#2260 umbrella citation** — confirm Section 6 language below matches the filed language in the #2260 provisional exactly; do not paraphrase the pledge language

---

## Section 6 — #2260 Cooperative Defensive Patent Pledge Umbrella Citation

This innovation is filed under the **#2260 Cooperative Defensive Patent Pledge**, the foundational defensive IP framework of LIANA BANYAN CORPORATION (EIN: 41-2797446, Wyoming C-Corp).

Under this pledge:

**Cooperative member license**: All members of the Liana Banyan Platform in good standing receive a perpetual, royalty-free, irrevocable license to use the methods and systems described in this provisional application within cooperative marketplace transactions. This license is codified in the platform bylaws and cannot be revoked by any action of the platform operator, board, or management without unanimous member consent.

**Extractive commercial use**: Any non-cooperative commercial entity seeking to implement bilateral cooperative trust profiling and differential routing as described in Claims 1–10 for the purpose of platform-owned trust capital accumulation, unilateral trust gatekeeping, or adversarial trust score commercialization is subject to enforcement under the patent rights claimed herein.

**Affirmative cooperative purpose**: The filing of this provisional application is an affirmative act of cooperative IP commons creation. The goal is not monopoly extraction but defensive protection: to ensure that the bilateral, member-owned, contribution-weighted trust architecture described herein cannot be patented by an extractive commercial entity and used to foreclose cooperative implementations.

**Relationship to prior filings**: #2329 Trust Match is one of the 13 provisional applications filed as of BP021 (2026-05-03), contributing to the corpus of approximately 2,412 formal claims across those applications. It is a core marketplace primitive of the Liana Banyan Platform's cooperative architecture and is designated a **Crown Jewel candidate** for its role in enabling member-owned trust at scale.

---

*Filed #2329 DRAFT by Knight Bushel 10 Shadow 4 BP021. Trust Match: bilateral, member-owned, cooperative-contribution-weighted. No universal hierarchy — only match quality. FOR THE KEEP!*
