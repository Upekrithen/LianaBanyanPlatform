# A&A FORMAL — Innovation #2149 (Family Table Trust Graph)
## Bishop Session B076 | April 4, 2026
## Patent Relevance: HIGH — Crown Jewel candidate
## Target: Provisional Patent 12 (OPEN)

---

## CLASSIFICATION

| Innovation # | Name | Crown Jewel | Parent |
|--------------|------|-------------|--------|
| 2149 | Family Table Trust Graph | Candidate | Member Trust Infrastructure |

---

## INNOVATION #2149 — FAMILY TABLE TRUST GRAPH

### Description

A six-degrees-of-separation trust-scoring system with per-bridge member stamping and pre-interaction selfie verification, designed to enable trust-critical member-to-member service interactions (babysitting, eldercare, house-sitting) without relying on anonymous review stars or centralized background-check services. Deployed within The Family Table initiative (#5 of Sweet Sixteen) as part of the cooperative's family-logistics-support infrastructure.

### Mechanics

**Trust score computation**:
- 1st-degree connection (mutual acquaintance between A and B): **2.0 points** per path
- 2nd-degree connection (A knows someone who knows B, one intermediary): **1.0 point** per path
- 3rd-degree connection (A knows someone who knows someone who knows B, two intermediaries): **0.5 points** per path
- **6.0 points required** for trust-critical interactions (entering another member's home, childcare, eldercare, house-sitting)

**Per-bridge stamping (mandatory)**:
- Every degree of separation in a claimed connection path requires an explicit stamp from each intermediary member
- Each intermediary affirmatively vouches: "I know A, I know B, and I am willing to say I think this connection is okay to bridge"
- Stamps are per-interaction, not per-relationship (intermediaries attest to a specific bridge, not blanket approval)
- No implicit graph inference, no contact-list scraping, no algorithmic connection suggestions — every bridge is affirmatively stamped by the humans on it

**Pre-interaction selfie verification**:
- Immediately before the scheduled interaction (babysitter arriving at door, eldercare visit start), both parties take a selfie
- Selfie is submitted as a stamped, timestamped verification record explicitly tagged as "pre-interaction verification" for that specific engagement
- Creates auditable record of physical presence at the moment of interaction

### Prior Art Distinction

**Versus review-star marketplaces** (Uber, TaskRabbit, Care.com, Rover): These platforms rely on anonymous numeric ratings and algorithmic trust scoring that members cannot inspect, contest, or trace. The Family Table Trust Graph is explicitly human-stamped at every degree of separation, preserving accountability.

**Versus centralized background checks** (Checkr, Sterling, HireRight): These rely on criminal-history databases, are expensive, slow, privacy-invasive, and cover only legal history — not social trust. The Trust Graph is free, instant, community-stamped, and preserves zero demographic data.

**Versus social-graph platforms** (LinkedIn, Facebook): These infer connections algorithmically from contact lists, email scraping, and co-engagement signals. The Trust Graph requires affirmative human stamps at each degree, with no scraping.

**Versus generic trust-graph academic proposals**: Academic trust-propagation models (e.g., Advogato, PageRank variants) typically weight edges by algorithmic inference. The Trust Graph's edges are human-stamped, per-interaction, and revocable.

### Claims

1. A member-to-member trust-scoring system that computes a connection score based on degrees of separation, with point values decreasing by degree (2.0 / 1.0 / 0.5 for 1st / 2nd / 3rd degree), requiring a minimum aggregate threshold (6.0 points) for trust-critical interactions.

2. A method for requiring affirmative per-bridge stamping by each intermediary member in a claimed trust path, where each stamp attests to specific awareness of both endpoint members and explicit willingness to bridge the connection.

3. A pre-interaction selfie-verification mechanism that timestamps and stamps member presence at the moment of agreed interaction, creating an auditable record of physical encounter.

4. A trust-scoring framework operating without storage of protected demographic data (age, gender, race, income, education, location) — integrating with a Zero Demographics platform architecture.

5. A per-interaction stamp model where intermediary vouches are scoped to specific bridges rather than granted as blanket endorsements, preserving cooperative accountability and enabling stamp revocation without cascading trust collapse.

6. A trust-graph computation method where affirmative human stamping at every degree of separation prevents the scoring system from operating on scraped, inferred, or algorithmically-derived connection data.

### Integration Points

- **The Family Table (#5)**: primary initiative; trust graph serves babysitting, eldercare, house-sitting use cases.
- **Household Concierge (#4)**: secondary integration; cleaning, maintenance, pet-care service bookings can require similar threshold.
- **Tatiana Schlossberg Health Accords (#6)**: eldercare drop-in visits may require higher threshold (e.g., 8.0 points).
- **Cue Card system**: scheduling the interaction itself runs through Cue Cards; trust score is a precondition.
- **Medallion accumulation**: trust-graph activity (stamping, being stamped, successful interactions) generates Medallions.
- **Zero Demographics architecture**: trust graph is identity-aware without being demographic-aware.
- **Sponsorship Marks (one-level attribution)**: related but distinct mechanic — trust bridges are not sponsorship chains.

### Open Design Parameters

The following parameters are implementation details, not claimed novelty; they can be tuned per deployment:

- Threshold variance by activity type (babysitting=6, eldercare=8, house-sitting-while-away=10)
- Stamp expiry / recomputation cadence
- Stamp revocation propagation rules
- Interaction-history reputation weighting
- Bootstrap mechanism for new members with zero connections
- Selfie retention policy post-interaction
- Appeals and override pathways

---

## Summary

The Family Table Trust Graph is a novel member-to-member trust infrastructure that computes connection scores from explicit, human-stamped, per-interaction bridge attestations across up to three degrees of separation, combined with pre-interaction selfie verification. It productizes the "extended family" heuristic of knowing someone who knows someone — and makes it accountable, privacy-preserving, and cooperatively governed.

It preserves cooperative accountability (every vouch is a named member's stamp), privacy (zero demographic data, no contact scraping), and member agency (stamps are per-interaction and revocable). No prior art combines these properties.

---

*A&A Formal drafted by Bishop B076. Ready for Prov 12 filing integration. Parent document: `INNOVATION_2149_FAMILY_TABLE_TRUST_GRAPH_B076.md`.*
