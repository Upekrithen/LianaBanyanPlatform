---
name: The Representative Scorecard
description: A cooperative-member-created, data-backed persistent tracking artifact for elected representatives' actions on specific policy issues, enabling member-voted escalation and coordinated political action across election cycles.
type: aa_formal
innovation_id: "2261"
ratification_session: B098
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - representative scorecard
  - elected representative tracking cooperative
  - member voted scorecard escalation
  - data backed political scorecard
  - persistent representative tracking artifact
  - political expedition scorecard
  - aa formal 2261
  - power to the people scorecard
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A Formal #2261 — The Representative Scorecard (Power to the People, Literally)

**Innovation #:** 2261 (promoted in B098 from B096 stub)
**Category:** Political Engagement / Governance / Member Activation
**Crown Jewel:** **YES**
**Original Stub Session:** B096
**Formal Drafting Session:** B098
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh
**Source Stub:** `BISHOP_DROPZONE/INNOVATION_STUB_2247_REPRESENTATIVE_SCORECARD_B096.md`
**Related:** Political Expedition production system, #2130 Counter-Vote, Paper #41 Section 5 (state-level grid stress data and Congressional district identification)

---

## TL;DR

A cooperative-member-created, cooperative-member-voted, data-backed persistent tracking artifact for an elected representative's actions on a specific issue, combining (a) real data sources (voting records from Congress.gov / state legislature APIs, public statements from press releases and social media, geographic district context, and constituent impact data), (b) cooperative-member-voted priority escalation, (c) actionable triggers that surface escalated scorecards for coordinated action (letter-writing, coordinated testimony, petition filings, Red Carpet treatment), and (d) persistent tracking across election cycles. **A new type of cooperative political artifact** that combines petition-like, vote-like, scorecard-like, watchdog-dossier-like, beacon-like, and initiative-like properties depending on the action state.

---

## Independent Claim

**Claim 1.** A computer-implemented method for creating and operating data-backed persistent tracking artifacts for elected representatives in a cooperative platform, comprising:

(a) Receiving, from cooperative members, scorecard creation requests identifying an elected representative and a specific policy issue;

(b) Automatically populating the scorecard with data from external sources including: the representative's voting record on related legislation, the representative's public statements on the issue, a list of facilities or infrastructure within the representative's jurisdiction relevant to the issue, and constituent impact data associated with the issue;

(c) Enabling cooperative members to view the scorecard, fact-check entries, add evidence, and vote on whether the scorecard represents a consistent or inconsistent stance by the representative;

(d) Accumulating a member-consensus rating on the scorecard based on the distribution of member votes;

(e) Upon the scorecard reaching a configurable escalation threshold (e.g., ≥100 members voting "needs attention"), routing the scorecard to the cooperative's political action coordination layer (Political Expedition production system) as an input to coordinated-action queues;

(f) Persisting the scorecard across election cycles, accumulating historical context on the representative's record on the specific issue over time.

**Dependent Claim 1.1** — The method of Claim 1, wherein the data sources of (b) are ingested via the cooperative platform's Stitchpunk-Corps-pattern pipeline bridge (SP-10), providing standardized ingestion from Congress.gov, state legislature APIs, press release feeds, and public social media.

**Dependent Claim 1.2** — The method of Claim 1, wherein escalated scorecards feed the cooperative's existing political engagement systems including Political Expedition, Counter-Vote (Innovation #2130), Pioneer Proposals, and the Red Carpet letter program, enabling the scorecard to trigger letter-writing campaigns, coordinated testimony, petition filings, or personalized Red Carpet treatment of the representative.

**Dependent Claim 1.3** — The method of Claim 1, wherein the scorecard implements horizontal scalability such that a single representative can have multiple distinct scorecards (one per issue tracked), and a single member can create scorecards for multiple representatives.

**Dependent Claim 1.4** — The method of Claim 1, wherein the member-fact-checking of (c) creates a falsifiable public record of the representative's position, distinguishing the scorecard from opinion-based political aggregators.

**Dependent Claim 1.5** — The method of Claim 1, wherein scorecards are implemented as a new type of cooperative platform Deck Card (ScorecardCard), rendered through the platform's shared card rendering infrastructure.

**Dependent Claim 1.6** — A system comprising a processor, a scorecards database, a representative data ingestion pipeline, a member voting layer, a political action coordination layer, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.5.

---

## Prior Art Distinction

Existing political scorecard sites (GovTrack, Ballotpedia, OpenSecrets, Vote Smart) are **one-way information displays curated by expert staff for consumer consumption**. Petition platforms (Change.org, Move On) collect signatures but do not structure them against representative voting records or persistent tracking. Civic engagement tools (Countable, Democracy.io) surface votes to members but do not tie them to cooperative-platform economic systems. **No existing platform combines (a) cooperative member creation of the tracking artifact, (b) cooperative member voting on escalation priority, (c) data-backed automatic population from structured public sources, (d) horizontal scaling across issues and representatives, (e) integration with a cooperative political action coordination layer, and (f) persistent cross-election-cycle tracking.** The combination is novel and operationalizes the "power to the people" framing in a way no existing civic-tech platform achieves.

---

## Cross-References

- **Source stub:** `INNOVATION_STUB_2247_REPRESENTATIVE_SCORECARD_B096.md`
- **Political Expedition production system** — the downstream coordination layer
- **#2130 Counter-Vote** — feeds from scorecards with high negative consensus
- **Paper #41 Section 5** — provides the seed data for initial production scorecards
- **Pawn B59 Congressional District Breakdown** — provides the district-level data for the initial scorecard set
- **Founder attribution:** B096 direct proposal cited in source stub.

---

**FOR THE KEEP.**
