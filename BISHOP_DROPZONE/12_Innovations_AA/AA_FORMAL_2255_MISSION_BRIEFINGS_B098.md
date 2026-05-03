---
name: Mission Briefings (Role-Specific Informational Tours)
description: A role-specific, repeatable informational tour system where each Mission Briefing is a multi-page submarine-door-sequence assembled from live Catapult Power data, curated per member role; a member holding multiple roles receives multiple distinct briefings, explicitly distinguished from one-time onboarding Red Carpet Rides.
type: aa_formal
innovation_id: "2255"
ratification_session: B098
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - mission briefings role-specific informational tours
  - role-multiplied repeatable briefings
  - submarine door sequence briefing assembly
  - aa formal 2255
  - catapult power mission briefing display
  - live-data assembled role briefings
  - mission briefings vs red carpet rides distinction
  - helm mission briefings dashboard card
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal #2255 — Mission Briefings (Role-Specific Informational Tours)

**Innovation #:** 2255 (renumbered in B098 from former #2238 per `INNOVATION_RENUMBERING_LOG_B098.md`)
**Category:** Helm / Content / Member Engagement
**Crown Jewel:** **YES**
**Original Session:** B093 (April 9, 2026)
**Renumbering Session:** B098 (April 11, 2026)
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh
**Source:** `BISHOP_DROPZONE/INNOVATIONS_2237_2238_CATAPULT_MISSION_B093.md`

---

## TL;DR

A role-specific, repeatable informational tour system for cooperative platform members. Each Mission Briefing is a multi-page submarine-door-sequence curated for a specific member role, displaying Catapult Power gauges for role-relevant entities, open opportunities, and recent achievements. Briefings are distinct from one-time onboarding experiences (Red Carpet Rides): Mission Briefings are **informational, repeatable, and role-multiplied** — a single member who holds multiple roles receives multiple distinct briefings, each curated to the domain, metrics, and opportunities relevant to that specific role. Briefing templates define page structure and relevant catapult metric entity types per role, enabling automatic assembly of briefing content from live platform data without per-member manual curation.

---

## Independent Claim

**Claim 1.** A computer-implemented method for delivering role-specific informational tours to cooperative platform members, comprising:

(a) Maintaining a briefing template database wherein each template record comprises a role slug, a title, a description, an ordered page sequence definition, and a set of catapult metric entity types relevant to the role;

(b) Maintaining a mission briefings database wherein each record associates a member identifier with one of their active roles and stores a snapshot of assembled briefing pages;

(c) Upon a member request to view a briefing, assembling the briefing by (i) retrieving the briefing template for the requested role, (ii) querying a catapult metrics database filtered by the template's entity type set, (iii) injecting the live catapult data into the template's page sequence, and (iv) returning the assembled pages for display;

(d) Rendering the assembled pages as a navigable submarine-door-sequence of card-based pages, each page displaying role context text and one or more universal momentum gauges for role-relevant entities;

(e) Supporting multiple distinct briefings per member wherein a member with N active roles receives N distinct briefings, each independently assembled from its role-specific template;

(f) Distinguishing Mission Briefings from one-time personalized onboarding experiences (Red Carpet Rides) by the following material characteristics: Mission Briefings are informational rather than welcoming, repeatable rather than one-time, role-multiplied rather than personal, and assembled from live data rather than pre-authored.

**Dependent Claim 1.1** — The method of Claim 1, wherein the auto-refresh flag enables members to receive either a one-time snapshot of the briefing at first view or a continuously-refreshed briefing that re-assembles from live data on each view.

**Dependent Claim 1.2** — The method of Claim 1, wherein each page of the assembled briefing includes an action button linking to the corresponding entity, enabling the member to transition from informational consumption to cooperative participation (contribution, vote, submission) in a single interaction.

**Dependent Claim 1.3** — The method of Claim 1, wherein the Helm dashboard displays a "Your Mission Briefings" section showing one card per active role, with a badge indicating how many tracked items are above a threshold (e.g., 75 on the 0-100 universal momentum scale) indicating proximity to launch.

**Dependent Claim 1.4** — A system comprising a processor, a briefing template database, a mission briefings database, a universal momentum metrics database, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.3.

---

## Prior Art Distinction

Onboarding tour systems (product tours, welcome wizards) are one-time experiences. Dashboard widgets display data statically. Personalized recommendation engines surface relevant content but do not structure it as role-specific multi-page tours with universal momentum integration. **No existing system combines (a) role-multiplied delivery where a single user receives multiple distinct tours corresponding to their multiple roles, (b) live-data assembly from a universal momentum metric substrate, (c) submarine-door visual sequencing shared with a broader platform card architecture, and (d) explicit distinction from one-time onboarding experiences via informational-and-repeatable framing.** The combination is novel.

---

## Cross-References

- **Original source file (B093):** `INNOVATIONS_2237_2238_CATAPULT_MISSION_B093.md`
- **Renumbering log:** `INNOVATION_RENUMBERING_LOG_B098.md`
- **Depends on:** #2254 Catapult Power (provides the universal momentum gauge component and metrics database)
- **Related innovations:** Red Carpet Rides (distinct from Mission Briefings), Helm dashboard, DeckCardShell multiverse iteration system
- **Refer to B093 source file for complete technical implementation detail and the Diana Jones multi-role example.**

---

**FOR THE KEEP.**
