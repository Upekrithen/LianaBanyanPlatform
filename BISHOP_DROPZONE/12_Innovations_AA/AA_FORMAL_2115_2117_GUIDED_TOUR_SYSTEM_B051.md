---
name: Guided Tour System — Three-Mode Navigation, Adaptive Detail Switcher, and Content Notes Overlay
description: Three Crown Jewel innovations: a three-mode content navigation system (Topic Focus, Category Browse, Guided Tour auto-advancing with Return Beacons); a persistent 3-position detail level toggle (Skipping Stones / Wading In / Deep Dive) mapping to the 6-depth Crow's Nest; and a floating notes overlay with dual-path persistence (personal localStorage or cooperative submission) routed through AI categorization to the 7-member Librarian Guild.
type: aa_formal
innovation_id: "2115-2117"
ratification_session: B051
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - guided tour engine three mode content navigation
  - adaptive detail level switcher skipping stones wading in deep dive
  - content notes overlay librarian processing pipeline
  - aa formal 2115
  - aa formal 2116
  - aa formal 2117
  - return beacon bookmark cephas navigation
  - crows nest six depth system
  - moneypenny note categorization librarian guild routing
cooperative_defensive_patent_pledge_2260_umbrella: true
canon_eblet_pointer: null
---
# A&A FORMALS — Innovations #2115-#2117
## Guided Tour Content Consumption System
## Bishop B051

---

## #2115 — Guided Tour Engine (Three-Mode Content Navigation)
**Category**: User Experience / Content
**Crown Jewel**: YES — No prior art for a cooperative platform content system with three distinct navigation modes (Topic, Category, Guided Tour) operating across 391 architectural concepts with real-time skip/save/resume navigation and Return Beacon bookmarks.
**Prior Art**: Content tours exist (onboarding flows, product tours like Intro.js). Wikipedia has category browsing. But a three-mode system where users choose Topic (focused chain), Category (all connections), or Full Guided Tour (auto-advancing through every category with skip/save/exit controls), integrated with the platform's 6-depth system and cooperative knowledge architecture — no prior art found.

### Description
Three-mode content navigation system for the Cephas knowledge base:

**Mode 1 — Topic Focus**: User selects a topic (e.g., "How to Restart Local Manufacturing" → Decentralized Factory). Content plays as a focused chain — each article/concept connects to the next within the topic. User follows the thread. Think podcast playlist.

**Mode 2 — Category Browse**: User selects a category (e.g., "Economics", "Architecture", "Initiatives"). All content within that category displayed with cross-connections visible. User can jump between related items. Think Wikipedia category page but interactive.

**Mode 3 — Guided Tour**: The full platform walkthrough. Mentions each category, starts going through it, allows: skip forward (next item), skip to next category, place Return Beacon (save + bookmark), exit. If you just sit there, you learn the entire platform. Think museum audio guide.

All three modes support the existing 6-depth Crow's Nest system (Glimpse → Peek → Tell Me More → Sample → Show Me → To-Go), mapped to 3 user-facing levels:
- **Skipping Stones** (Glimpse + Peek) — surface level, key points only
- **Wading In** (Tell Me More) — moderate depth, full context
- **Deep Dive** (Sample + Show Me + To-Go) — full detail, try it, guided tour, homework

Users can switch between these 3 detail levels AT ANY TIME during navigation.

### Innovation Markers
- Three distinct navigation modes for same content corpus
- Real-time detail level switching (Skipping Stones ↔ Wading In ↔ Deep Dive)
- Return Beacon save points with resume capability
- Auto-advancing Guided Tour with category-based segmentation
- Integration with existing 6-depth Crow's Nest system

### Formal Claim
A cooperative platform content navigation system comprising three distinct browsing modes operating across a shared knowledge base: (1) a topic-focused sequential chain where articles progress through a curated sequence within a subject domain; (2) a category browser displaying all content within a classification with visible cross-connections to related items; and (3) an auto-advancing guided tour that sequentially presents content organized by category with user controls for skipping forward, skipping to next category, placing persistent return bookmarks, and exiting, wherein all three modes support real-time switching between three progressive detail levels mapped to an underlying six-depth engagement hierarchy.

---

## #2116 — Adaptive Detail Level Switcher
**Category**: User Experience
**Crown Jewel**: No
**Prior Art**: Progressive disclosure exists. But live-switching between 3 abstraction levels while navigating content, where the same article renders differently at each level using the platform's existing depth data (glimpse/peek/tell_me_more), and the choice persists across navigation — that's ours.

### Description
A persistent UI control (3-position toggle: Skipping Stones / Wading In / Deep Dive) that changes how every content item renders in real time. At Skipping Stones, articles show only the Glimpse + Peek text. At Wading In, they expand to Tell Me More. At Deep Dive, they show full content plus action buttons (Try It, Show Me, Pack To-Go). The choice persists in localStorage and applies across all three navigation modes. Users can switch mid-article — the content smoothly expands or contracts without losing scroll position.

### Innovation Markers
- 3-position detail toggle persisting across navigation
- Content renders adapt in real-time (expand/contract without page reload)
- Mapped to existing 6-depth system (3 user-facing levels ↔ 6 internal depths)
- Scroll position preserved on level switch

### Formal Claim
An adaptive content rendering system for a knowledge base platform wherein a persistent three-position detail level selector controls the depth at which all content items render, where each level maps to a subset of an underlying multi-depth engagement hierarchy, the selected level persists across navigation sessions via local storage, content elements smoothly expand or contract in response to level changes without losing the user's scroll position, and the detail preference applies uniformly across multiple content browsing modes.

---

## #2117 — Content Notes Overlay with Librarian Processing Pipeline
**Category**: Community / Knowledge Management
**Crown Jewel**: YES — No prior art for a user annotation overlay on cooperative content that feeds into a categorized AI triage → human Librarian Guild processing pipeline, where submitted notes can influence the canonical content.
**Prior Art**: Annotation tools exist (Hypothesis, Google Docs comments, Medium highlights). Feedback forms exist. But a floating overlay (reusing the XRay/YCDB pattern) where users write free-form notes per content item, choose between saving locally OR submitting for cooperative consideration, where submitted notes are categorized by MoneyPenny (AI), then distributed to the Staff of Librarians (7 Section Librarians + 2 Master Librarians) by category — that's ours.

### Description
Floating overlay panel (triggered by pencil icon or keyboard shortcut) that appears on any Guided Tour content item. Users write free-form notes. Two save options:

**Save as Personal Notes**: Stored in localStorage (or member profile if authenticated). Only the user sees them. Appear as subtle note indicators on content items during future visits.

**Submit for Consideration**: Note is saved to `tour_notes_submitted` table. MoneyPenny categorizes it (content correction, feature suggestion, question, praise, criticism, idea). Then routed to the appropriate Section Librarian based on content domain:
- Section 1: Economics/Currency
- Section 2: Letters/Outreach
- Section 3: Initiatives/Programs
- Section 4: Technology/Architecture
- Section 5: Legal/Compliance
- Section 6: Content/Articles
- Section 7: HexIsle/Manufacturing

Librarians process notes: incorporate corrections, flag suggestions for Founder review, answer questions (response sent back to member), archive praise, route criticism to relevant teams.

### Innovation Markers
- Dual-path notes (personal save vs cooperative submission)
- AI categorization (MoneyPenny) → human domain expert processing (Librarian Guild)
- Notes appear as indicators on content items for return visits
- Per-content-item annotation with context preservation
- Reuses XRayOverlay pattern for consistent UI

### Formal Claim
A cooperative content annotation system comprising: a floating overlay interface for creating free-form notes attached to specific knowledge base items; a dual-path persistence mechanism where notes can be saved locally for personal reference or submitted for cooperative review; an AI-powered categorization service that classifies submitted notes by type (correction, suggestion, question, praise, criticism, idea) and routes them to domain-specific human reviewers organized in a hierarchical guild structure; and a feedback loop where processed notes can result in canonical content updates, response messages to the submitting member, or escalation to platform governance.

---

## STATS AFTER THIS FILING

| Metric | Value |
|--------|-------|
| Innovation chain end | #2117 |
| Crown Jewels | **163** (161 + 2 new: #2115 Guided Tour, #2117 Notes Overlay) |
| Formal claims | ~2,088 (2,085 + 3 new) |

---

*A&A Formals #2115-#2117 — Bishop B051*
*Guided Tour system designed. Three modes. Three detail levels. Notes pipeline.*
*FOR THE KEEP!*
