---
name: Helm Card Dashboard (Desktop Frame Grid, Three-Mode Display)
description: A three-mode personal dashboard system rendering a member's Deck Cards as a categorized frame grid on desktop (TV Screens), a full-display single-card view (Movie Theater), and a swipeable deck on mobile (Shuffleable Deck), with progressive frame unlocking tied to cooperative Keep tier advancement and simultaneous X-Ray diagnostic flip.
type: aa_formal
innovation_id: "2253"
ratification_session: B098
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - helm card dashboard three-mode display
  - deck card frame grid tv screens
  - movie theater single card view
  - aa formal 2253
  - shuffleable deck mobile card display
  - progressive frame unlock keep tiers
  - simultaneous x-ray diagnostic flip cards
  - chalk outline progressive discovery dashboard
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal #2253 — Helm Card Dashboard (Desktop Frame Grid, Three-Mode Display)

**Innovation #:** 2253 (renumbered in B098 from former #2236 per `INNOVATION_RENUMBERING_LOG_B098.md`)
**Category:** Helm / Ghost World / Member Interface
**Crown Jewel:** **YES**
**Original Session:** B093 (April 9, 2026)
**Renumbering Session:** B098 (April 11, 2026)
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh
**Source:** `BISHOP_DROPZONE/INNOVATION_2236_HELM_CARD_DASHBOARD_B093.md`
**Production Status:** Shipped via Knight K389 (helm_card_layout table and HelmCardDashboard component live)

---

## TL;DR

A three-mode personal dashboard system rendering a cooperative platform member's functional Deck Cards as: (a) a categorized frame grid on desktop ("TV Screens" mode) where each frame holds a different functional card; (b) a full-display single-card view activated by clicking any card ("Movie Theater" mode); (c) a horizontally swipeable single-card deck on mobile ("Shuffleable Deck" mode). Frames start as chalk-outline placeholders using the platform's progressive-discovery visual system and unlock progressively through Keep tier advancement (Bronze=4 frames, Silver=6, Gold=8, Platinum=10, Diamond=12). Each frame supports category filtering, drag-to-rearrange positioning, pin/unpin state, notification badges, quick-flip interaction, and simultaneous X-Ray diagnostic flip across all frames.

---

## Independent Claim

**Claim 1.** A computer-implemented method for rendering a personal dashboard of functional cards to a cooperative platform member, comprising:

(a) Maintaining, for each member, a layout configuration comprising an ordered set of frame definitions, each frame definition specifying a category filter and an assigned card type;

(b) Deriving a frame count for the member from the member's current cooperative engagement tier, wherein higher tiers produce larger frame counts;

(c) Rendering the layout configuration in a first display mode as a responsive grid of card frames on a desktop viewport, each frame displaying its assigned card or a chalk-outline placeholder if no card is assigned;

(d) Rendering the same layout configuration in a second display mode as a full-viewport single card, activated by selecting a specific frame in the first display mode;

(e) Rendering the same layout configuration in a third display mode as a horizontally-swipeable single card on a mobile viewport, with swipe gestures advancing through the ordered set;

(f) Supporting drag-to-rearrange operations in the first display mode that persist to the layout configuration;

(g) Supporting a simultaneous diagnostic flip operation that flips all visible cards in the first display mode to their reverse side in a single animation, enabling at-a-glance inspection of every dashboard function.

**Dependent Claim 1.1** — The method of Claim 1, wherein the frame count derivation of (b) is Bronze=4, Silver=6, Gold=8, Platinum=10, Diamond=12, corresponding to the cooperative's Keep tier progression system.

**Dependent Claim 1.2** — The method of Claim 1, wherein the chalk-outline placeholder of (c) is rendered using a progressive-discovery visual system common to the cooperative platform, signaling to the member that additional capabilities are available but not yet accessed.

**Dependent Claim 1.3** — The method of Claim 1, wherein the three display modes of (c), (d), and (e) share a common card rendering component (DeckCardShell), ensuring visual and functional consistency across desktop and mobile experiences.

**Dependent Claim 1.4** — The method of Claim 1, wherein the drag-to-rearrange of (f) reuses the drag infrastructure of a cooperative-platform campaign editor (Campaign Forge), sharing code between the dashboard and the campaign-creation workflow.

**Dependent Claim 1.5** — The method of Claim 1, wherein the simultaneous diagnostic flip of (g) is invoked via an X-Ray control available across the cooperative platform, enabling consistent inspection semantics across dashboard, campaign, and card-library contexts.

**Dependent Claim 1.6** — A system comprising a processor, a layout configuration database, a card rendering component, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.5.

---

## Prior Art Distinction

Traditional dashboards (Notion, Salesforce, Jira) use fixed widget layouts with drag-to-resize panels. Card-based interfaces (Trello, trading card apps) organize content as cards but lack progressive unlocking tied to engagement tiers. Mobile home screens permit icon rearrangement but are static launchers, not functional surfaces. **No existing platform combines (a) a card-based personal dashboard where each card is a functional system interface, (b) progressive frame unlocking tied to cooperative engagement tiers earned rather than purchased, (c) three display modes (grid, theater, deck) sharing a single card rendering component across desktop and mobile, (d) drag-to-rearrange with category-filtered slots, (e) chalk-outline progressive discovery for unrevealed frames, and (f) simultaneous diagnostic flip across all visible cards.** The combination is novel.

---

## Cross-References

- **Original source file (B093):** `INNOVATION_2236_HELM_CARD_DASHBOARD_B093.md`
- **Renumbering log:** `INNOVATION_RENUMBERING_LOG_B098.md`
- **Production implementation:** Knight K389 (live in production)
- **Related innovations:** Deck Card System, #2229 Wardrobe Department, Keep Tiers, X-Ray diagnostic system, Progressive Discovery CSS framework, Campaign Forge (#2228)
- **Refer to B093 source file for complete technical implementation detail, display-mode specifications, and Founder origin narrative.**

---

**FOR THE KEEP.**
