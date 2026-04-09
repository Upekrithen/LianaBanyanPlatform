# KNIGHT SESSION 315 — V2 Crew Call Board (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 2 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 2
**Depends on**: K294 Foundation. K214 Commerce (CrewCallPage exists — ENHANCE).
**Tracker row**: `Crew Call Board` (B35 batch)

---

## PAGE PURPOSE

Hire-a-neighbor board with 6 categories. ADAPT-scored, Cost+20% transparent. Not TaskRabbit, not Craigslist.

## ROUTE

`/crew-call` (AppShell). Enhances existing K214 CrewCallPage.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Crew Call"
- **Headline**: "Hire the neighbor who already does it well."
- **Body**: "Browse crew members offering handyman, tutoring, delivery, pet care, tech support, and creative services — cooperative pricing, ADAPT-reviewed, visible."
- **Primary CTA**: "Browse all crew"
- **Secondary CTA**: "Offer my skills"
- **Utility strip**: "6 categories" · "ADAPT-reviewed" · "Cost+20%"

## LAYOUT

- **Sticky top**: Category Filter Bar (6 categories + All)
- **Below sticky**: Secondary Filter Row (location radius, availability, ADAPT score, sort)
- **Above grid (no filter)**: Featured Crew Rail (top ADAPT, hides when filter applied)
- **Main**: Crew Member Cards (3-col desktop / 2-col tablet / 1-col mobile)
- **Between filters & grid**: Cost+20% Transparency Panel (collapsible, localStorage-persisted)
- **Injected (conditional)**: Active Booking Status Bar (when member has active booking)

## CATEGORIES (canonical 6)

Handyman · Tutoring · Delivery · Pet Care · Tech Support · Creative

## CARD FIELDS

- Avatar + name
- Service title + one-line description
- **ADAPT arc visualization** (NOT stars)
- Rate range (Cost+20% descriptive)
- Location radius badge
- Availability chip
- "Book this crew" primary action

## COMPONENTS (build in `platform/src/components/v2/crew-call/`)

- `CategoryFilterBar.tsx` — sticky, 6 + All
- `SecondaryFilterRow.tsx` — radius, availability, ADAPT, sort
- `FeaturedCrewRail.tsx` — top ADAPT, hides on filter
- `CrewCard.tsx` — standardized member card
- `AdaptArcVisualization.tsx` — arc NOT stars
- `CostPlusTransparencyPanel.tsx` — collapsible, localStorage
- `ActiveBookingStatusBar.tsx` — injected when active booking

## CRITICAL DESIGN RULES

- **ADAPT = arc visualization, NEVER stars** (rule from B035 spec)
- **Cost+20% panel collapsible + localStorage-persisted**
- **Featured rail hides when any filter active** (reduce visual noise)
- Never gamified leaderboard
- Never "cheap" / "discount" framing — cooperative math is descriptive

## MOBILE

- Single-column cards
- Filter drawer (off-canvas) for secondary filters
- Sticky category chips at top
- StickyMobileCTA: "Browse all crew"

## DATA

- Use existing `crew_call_roles` / crew member tables (per K214 / K305 Marketplace)
- ADAPT scores pull from existing ADAPT system

## BANNED (pre-completion check)

- NO star ratings (arc only)
- NO "discount / cheap / deal" framing
- NO punitive messaging for low ADAPT
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake

## ACCEPTANCE

- [ ] Route `/crew-call` enhances existing K214 page
- [ ] Hero copy matches spec EXACTLY
- [ ] 6 categories + All in sticky filter bar
- [ ] ADAPT shown as arc visualization, never stars
- [ ] Cost+20% panel collapsible and localStorage-persisted
- [ ] Featured rail hides on any filter
- [ ] Active booking bar injects only when booking exists
- [ ] `data-tour-target="crew-call"` anchor placed
- [ ] Mobile: single-col, off-canvas filter drawer, sticky chips, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K315'`, `in_progress` → `review`
- [ ] Librarian `update_session` K315
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not use star ratings
- Do not break existing K214 booking flow
- Do not change crew member schema
- Do not show ADAPT for members without active ADAPT records

---

*Bishop B080 — Phase 4 page 2 of 6 — Crew Call Board*
*6 categories. ADAPT arcs not stars. Cost+20% transparency.*
*FOR THE KEEP!*
