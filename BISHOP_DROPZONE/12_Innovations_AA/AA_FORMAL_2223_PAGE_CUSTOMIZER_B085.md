# Innovation #2223 — Member Page Customizer (Crown Jewel Candidate)

**Session**: B085
**Date**: 2026-04-07
**Status**: ACKNOWLEDGED & ACCEPTED

---

## Description

A member-facing page layout customization system integrated into the X-Ray Goggles overlay. When a member activates X-Ray mode on any platform page, they can click "Customize THIS Page" to enter a drag-and-drop layout editor. Page elements (widgets, cards, sections, navigation blocks) become repositionable. The member saves their custom layout to their Helm (personal dashboard space), and from that point forward, that page loads in their personalized arrangement whenever they visit.

## Mechanics

1. **Activation**: Member enters X-Ray Goggles mode (Little Red Hen click). A "Customize This Page" button appears.
2. **Edit Mode**: Page elements gain drag handles. Elements are constrained to a layout grid. Members can reposition, resize, show/hide, or reorder sections.
3. **Save to Helm**: Layout configuration serialized as JSON and stored in the member's Helm profile (`helm_page_layouts` table, keyed by route + user_id).
4. **Load on Return**: When the member navigates to that route, their saved layout loads instead of the default. Falls back to default if no custom layout exists.
5. **Submit as Lark**: Member can submit their layout as a Lark bounty entry or Design Contest submission. Layout is saved as a shareable configuration (not a screenshot — the actual JSON layout).
6. **Community Voting**: Other members browse submitted layouts in the Design Democracy system and vote. Winning layouts can become new defaults (via the existing Design Pipeline).
7. **Overlay Integration**: Works through the existing Notes Overlay system. Custom layouts are a layer ON TOP of the base page, not modifications to the source code. The Overlay architecture already supports per-user, per-page state.

## Prior Art Distinction

- WordPress page builders (Elementor, Divi) allow layout customization but require admin access and modify the site for all users.
- Dashboard platforms (Notion, Grafana) allow widget arrangement but don't combine personalization with community voting/design contests.
- No known platform allows members to customize page layouts, save them personally, AND submit them as competitive design entries where the community votes to change platform defaults.

## Claims

1. A cooperative platform system wherein individual members may customize the visual layout of platform pages and persist those layouts to their personal dashboard space.
2. The system of claim 1, wherein layout customizations are activated through an accessibility overlay (X-Ray Goggles) that reveals page structure and enables drag-and-drop repositioning.
3. The system of claim 1, wherein customized layouts may be submitted as entries in community design contests, enabling democratic selection of platform-wide layout changes.
4. The system of claim 3, wherein winning community-selected layouts are promoted to new platform defaults through a design pipeline governance process.
5. The system of claim 1, wherein layout configurations are stored as portable JSON schemas independent of the underlying page implementation, enabling layout sharing between members.
6. The system of claim 1, wherein the Notes Overlay architecture provides per-user, per-page state management without modifying the source page structure.

## Connection to Existing Innovations

- **Design Democracy** (#1895): Community voting on design decisions
- **Notes Overlay** (K195): Per-user overlay state on any page
- **X-Ray Goggles / Little Red Hen**: The activation mechanism
- **Lark Bounty System**: Submission and reward pathway
- **Helm**: Personal storage for member customizations
- **Design Pipeline** (Production System): Governance for promoting designs

## Crown Jewel Assessment

**CANDIDATE** — This innovation creates a flywheel: members personalize their experience (retention), submit designs (engagement), vote on others' designs (community), and winning designs improve the platform (quality). It converts passive users into active platform designers without requiring any technical skill. The "every member is a designer" philosophy is core to Liana Banyan's cooperative model.
