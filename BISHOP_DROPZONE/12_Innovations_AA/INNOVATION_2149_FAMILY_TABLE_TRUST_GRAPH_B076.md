# Innovation #2149 — Family Table Trust Graph (Six Degrees of Separation Scoring + Selfie Verification)

**Innovation #:** 2149 (next in sequence after #2148 TCA)
**Parent initiative:** The Family Table (#5 of Sweet Sixteen)
**Crown Jewel candidate:** YES (novel trust-infrastructure mechanism, privacy-preserving, directly productizes "extended family support" at platform scale)
**Captured:** Bishop B076 | April 4, 2026
**Source:** Founder direction, live

---

## The Problem

The Family Table is the cooperative's family-logistics-support initiative. It helps members handle the coordination overhead of running a household — scheduling, resource access, and the practical support that used to come from extended family networks before those networks dispersed.

The hardest version of that problem is **trusting someone to enter your home** — babysitting, eldercare drop-ins, house-sitting, emergency childcare. Existing marketplace solutions either rely on thin review stars (vulnerable to gaming and sparse in new markets) or on centralized background checks (expensive, slow, privacy-invasive, and only cover criminal history).

## The Mechanism: Six-Degree Trust Scoring

When Member A needs to interact with Member B in a trust-critical context, the platform computes a **trust score** based on the actual social graph between them:

| Degree of separation | Meaning | Points per path |
|---|---|---|
| **1st degree** | Someone A and B both know directly | **2.0** |
| **2nd degree** | A knows someone who knows B (one intermediate) | **1.0** |
| **3rd degree** | A knows someone who knows someone who knows B (two intermediates) | **0.5** |

**6 points required** for trust-critical interactions (entering another member's home, caring for children, caring for elders).

Example: Julie wants to babysit the Rodriguez twins.
- 3 × first-degree connections (she and Mrs. Rodriguez both know the same 3 people) = 3 × 2.0 = **6.0 points ✓**
- OR: 1 first-degree + 2 second-degree = 2.0 + 2 × 1.0 = **4.0 points ✗** (insufficient)
- OR: 1 first-degree + 2 second-degree + 4 third-degree = 2.0 + 2.0 + 2.0 = **6.0 points ✓** (mixed path)

## The Per-Degree Stamp Requirement

**Every degree of separation requires an explicit stamp from each intermediate.** If Maria is the 2nd-degree connection between Julie and Mrs. Rodriguez, Maria must explicitly stamp: "I know Julie, I know the Rodriguez family, and I am willing to say I think this connection is okay to bridge."

Stamps are **per-interaction**, not per-relationship. Maria is attesting to a specific trust bridge, not giving blanket approval for all of Julie's future interactions. This preserves cooperative accountability: each member is responsible for vouching, and the stamp is auditable.

No implicit graph inference. No scraping contact lists. No "people you may know." Every degree must be affirmatively stamped by the humans on that path.

## The Selfie Verification Gate

Immediately before the agreed interaction occurs (babysitter arriving at door, eldercare visit start), both parties **take a selfie and submit it as a stamped verification**. The selfie is timestamped and explicitly tagged as "pre-interaction verification" for this specific engagement.

This anchors the interaction to verified present-moment identity, not just prior trust score. It also creates an auditable record: if something goes wrong, there is a clear timestamp of who was physically present at the door.

## Why This Is Crown Jewel

1. **Novel trust architecture** — most platforms use review stars or centralized checks. Degree-scoring with per-bridge stamps is structurally different and novel.
2. **Privacy-preserving** — no demographic data, no background-check industry dependency, no contact-list scraping.
3. **Productizes extended-family networks** — platform-level implementation of the "six degrees" heuristic applied to real household trust decisions.
4. **Composable** — the 6-point threshold and degree weights can scale to other initiatives (Household Concierge, eldercare via Tatiana Schlossberg Health Accords, etc.).
5. **Cooperative accountability** — every trust bridge is stamped by a named member, creating a web of explicit vouching.

## Open Design Questions (for Founder / Knight / architect input)

1. **Recomputation cadence** — trust graph recomputes on demand, or cached with invalidation? (Stamp expiry rules?)
2. **Stamp revocation** — can Maria revoke her stamp after a bad outcome, and does that retroactively affect the score?
3. **Reputation interaction** — does a member's ADAPT score or prior interaction history boost or modify degree scoring?
4. **Threshold variability** — is 6 points fixed, or does trust-critical activity type modulate the threshold? (Babysitting = 6, eldercare = 8, house-sitting while away = 10?)
5. **Selfie storage policy** — retained for how long post-interaction? Deleted on uneventful completion? Member-controlled?
6. **Appeals / overrides** — how does a new member with zero connections bootstrap trust? Initiative-level sponsor stamp?

## Related Innovations to Cross-Link

- **Medallions** — trust-graph activity likely generates Medallion accumulation
- **Zero Demographics** — trust graph is identity-aware without being demographic-aware
- **Sponsorship Marks (one-level)** — related attribution mechanic
- **Cue Card system** — booking/scheduling the interaction itself
- **Family Cue Cards** (Diana, Rosario) — members already in the system as exemplars

## Next Steps

1. **A&A formal** for #2149 to be drafted (Bishop queue, next session)
2. **Pudding** candidate — "Six Degrees to Your Babysitter" or similar
3. **Knight architecture prompt** — data model for trust_stamps table, graph-traversal query, selfie-verification dispatch
4. **Crown Jewel promotion decision** — Founder to confirm
5. **Integrate into Family Table initiative page** on Cephas

---

*Innovation #2149 captured by Bishop B076 from live Founder direction. Should not be lost in session churn. Ready for A&A formalization in subsequent session.*
