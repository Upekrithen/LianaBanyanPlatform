---
name: Cephas Knowledge Architecture — Community Curation and Bidirectional Graph
description: A community-curated knowledge base featuring member-voted resource links with tiered visibility thresholds, and a bidirectional knowledge graph where Cephas documentation pages and platform features link to each other — creating an organic, self-curating documentation network.
type: aa_formal
innovation_id: "2005-2006"
ratification_session: B035
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: false
wrasseTriggers:
  - cephas knowledge architecture
  - community curated resource linking
  - bidirectional knowledge graph
  - cooperative documentation curation
  - cephas community voting thresholds
  - platform-wide reference network
  - aa formal 2005-2006
  - cephas feature linking
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovations #2005-#2006
## Cephas Knowledge Architecture
**Bishop Session:** 035 | **Date:** March 27, 2026
**Status:** DESIGN COMPLETE — Needs Knight Build

---

### Innovation #2005 — Cephas Community-Curated Resource Linking
**Type:** Feature
**Category:** Knowledge Infrastructure — Community Curation

**Description:**
Cephas articles include community-submitted resource links — external references, tutorials, tools, and examples that enrich the knowledge base. Links are submitted by any member but require voting thresholds before they appear publicly:
- 3 upvotes: Visible in "Community Resources" section
- 10 upvotes: Promoted to "Recommended" section
- 25 upvotes + 0 flags: Featured with contributor credit

This prevents spam while rewarding quality contributions. Contributors earn Marks for links that reach each threshold.

**Cooperative Significance:**
The knowledge base grows through collective effort, not editorial decree. Every member becomes a potential curator. The voting thresholds ensure quality without requiring moderator labor — the community governs itself.

**Connected Innovations:** #2006 (Bidirectional Knowledge Graph), Cephas system

---

### Innovation #2006 — Bidirectional Knowledge Graph
**Type:** Feature (Architecture)
**Category:** Knowledge Infrastructure — Graph Navigation

**Description:**
Cephas articles link TO platform features (e.g., "Learn more about Beacon Runs" → /beacons), AND platform features link BACK to Cephas (e.g., the Beacon Run page has a "How does this work?" link → Cephas article). This creates a bidirectional knowledge graph where every feature is documented and every document is actionable.

**Architecture:**
- knowledge_links table: source_type (cephas|feature), source_id, target_type, target_id, link_type (explains|references|teaches|extends)
- Cephas articles render "Try it now" buttons linking to live features
- Feature pages render "Learn more" links to relevant Cephas articles
- Graph traversal: from any node, discover connected knowledge

**Cooperative Significance:**
Most platforms separate documentation from functionality. The bidirectional graph erases that boundary. A member reading about cooperative economics can click directly into the tool that implements it. A member confused by a feature can instantly access the explanation. Knowledge and action become the same surface.

**Connected Innovations:** #2005 (Community-Curated Resources), Cephas system

---

**Innovation Count after #2006:** 2,006
