# A&A FORMAL — Innovations #2010-#2014
## X-Ray Overlay + Community-Governed Visual Design (Design Democracy)
**Bishop Session:** 035 | **Date:** March 27, 2026
**Status:** DESIGN COMPLETE — Needs Knight Build
**Paper Candidate:** #2011 (Crown Jewel + Academic Paper)

---

### Innovation #2010 — Element Overlay ("You Can Do Better" Submission Layer)
**Type:** Feature
**Category:** Community Governance — Design Contribution

**Description:**
When a member activates X-Ray Goggles mode, every platform element with Larks (bounties) attached reveals a "You Can Do Better" sign along its border. The sign doesn't appear in normal mode — it's only visible through X-Ray.

Clicking "You Can Do Better" toggles the OVERLAY: a transparent layer that covers the existing element, allowing the member to:
- **Write in** — Type replacement text, labels, descriptions
- **Upload** — Drop an image, SVG, or design file that covers the existing visual
- **Submit** — Their version goes into the review/voting queue

The overlay is the member's canvas. What lies beneath is the current version. What they put on top is their proposed improvement. If the community votes it up, it replaces the original.

**Flow:**
1. Toggle X-Ray Goggles → tooltips appear, feedback text boxes visible
2. X-Ray reveals "You Can Do Better" signs on Lark-bearing assets (inline with border)
3. Click "You Can Do Better" on specific element → OVERLAY mode activates for that element
4. Member writes/uploads their submission over the existing content
5. Submit → enters review queue → community votes
6. If approved → replaces original (original preserved in version history)

**Architecture:**
- X-Ray mode: CSS class toggle that reveals hidden overlay triggers
- Lark detection: elements with associated bounties get border indicators
- Overlay layer: absolute-positioned transparent div over target element
- Submission: captures overlay content + element reference + screenshot diff
- Review queue: community voting with threshold-based auto-promotion

**Cooperative Significance:**
This is cooperative improvement made tangible. Instead of filing a bug report or writing a suggestion email, a member literally COVERS what's there with something better. The visual metaphor is powerful — "I see what you made, and I can make it better." This is how cooperatives should work: continuous improvement from the inside, by the people who use it.

**Connected Innovations:** #2011 (CSS Zen Garden), #2012 (Design Democracy Voting), existing X-Ray Goggles system, Lark bounty system

---

### Innovation #2011 — Community-Governed Visual Design (CSS Zen Garden Model)
**Type:** Feature (Crown Jewel + Paper Candidate)
**Category:** Community Governance — Visual Identity

**Description:**
Members can submit entire alternative layouts and styles for any page — same content, different presentation. Like CSS Zen Garden (the landmark web project that proved HTML and CSS separation), the cooperative's content layer remains constant while the visual layer becomes a community-governed canvas.

A member chooses a custom overlay, and the whole page transforms. Multiple overlays can coexist — the community votes on which become featured, and members can switch between them in their Helm preferences.

**Architecture:**
- Style submission: full CSS override file targeting platform class names
- Preview sandbox: submitted styles render in isolated iframe for review
- Voting: community votes on submitted styles per page/component
- Featured rotation: top-voted styles appear in "Style Gallery"
- Member preference: each member can set their preferred style overlay in Helm settings
- Version control: every style submission is versioned, original always recoverable

**Cooperative Significance:**
This is the paper. This is the Crown Jewel.

Traditional platforms enforce visual uniformity because they're brands. Cooperatives are communities. The CSS Zen Garden model says: "The content is ours. The presentation is yours." This transforms visual design from a corporate function into a community-governed, living experiment.

When members can change how the platform LOOKS — not just how it works — they have genuine ownership. This isn't theming (pick from 3 color schemes). This is DESIGN DEMOCRACY. The community decides what beauty means to them.

**Paper Title:** "Design Democracy: Community-Governed Visual Identity in Cooperative Digital Platforms"
**Key Arguments:**
1. Visual design as governance (who decides what a community looks like?)
2. CSS Zen Garden proved content-presentation separation at web scale
3. Cooperative platforms uniquely suited for community-governed design
4. Voting mechanisms as taste aggregation (different from market-based design)
5. Identity expression through collective visual choice

**Connected Innovations:** #2010 (Element Overlay), #2012-#2014 (Design Democracy stack)

---

### Innovation #2012 — Design Democracy Voting
**Type:** Feature
**Category:** Community Governance — Visual Preference Aggregation

**Description:**
Members vote on which visual overlays/layouts become featured or default. Voting is stratified:
- **Element-level:** Vote on specific component redesigns (buttons, cards, headers)
- **Page-level:** Vote on full page layout alternatives
- **Site-level:** Vote on complete theme overhauls

Voting weight can be influenced by:
- Member tenure (longer members = more voting weight)
- Design contribution history (active designers = more weight in design votes)
- Guild/Tribe membership (guild-specific votes weighted by guild members)

**Cooperative Significance:**
Design decisions in corporations are made by design teams. In cooperatives, they're made by the community. Design Democracy Voting creates the mechanism for this — a structured way to aggregate visual preferences that respects both expertise and participation.

**Connected Innovations:** #2011 (CSS Zen Garden), #2013 (Tiered Theme Governance)

---

### Innovation #2013 — Tiered Theme Governance (Guild/Tribe/Personal)
**Type:** Feature
**Category:** Visual Identity — Layered Control

**Description:**
Visual theme control operates at three levels, each overriding the one below:
1. **Guild level** — Guild banner, colors, typography (governs all Guild-context pages)
2. **Tribe level** — Tribe flair, accent colors, family imagery (governs Tribe-context pages)
3. **Personal level** — Member preferences, accessibility settings, chosen overlay

When a member is browsing their Guild's page, they see Guild visual identity. When they're in their Tribe's Family Table, they see Tribe visual identity. When they're in their Helm, they see their personal preferences.

**Cooperative Significance:**
This mirrors how identity actually works — professional context (Guild) vs. personal context (Tribe) vs. individual preference. The platform adapts its appearance to the social context, just as people adapt their presentation to different social settings.

**Connected Innovations:** #2012 (Design Democracy Voting), #2014 (Guild Banner Contests)

---

### Innovation #2014 — Guild Banner Contests
**Type:** Feature
**Category:** Community Engagement — Design Competition

**Description:**
Guilds run design competitions for their visual identity. Any member can submit banner/logo/color scheme designs for a Guild. The Guild's members vote on submissions. Winners receive:
- Marks (effort-differential currency)
- "Banner Designer" badge on their Helm profile
- Display credit on the Guild page ("Banner by @username")

Contests have deadlines, submission limits (max 3 per member), and voting periods. Past contest winners are preserved in the Guild's design history.

**Cooperative Significance:**
This is design as cooperative labor. The Guild doesn't hire a designer — it invites its community to participate in defining its visual identity. Winners earn cooperative currency, not just exposure. The labor is valued, the contribution is permanent, and the community chose it.

**Connected Innovations:** #2013 (Tiered Theme Governance), #2017 (Guild Visual Identity Stack)

---

**Innovation Count after #2014:** 2,014
**Crown Jewels:** 133 → 134 (#2011 Community-Governed Visual Design — CROWN JEWEL)
