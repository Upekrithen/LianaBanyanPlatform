# KNIGHT SESSION 304 — V2 Captain Dashboard (AppShell)
## Bishop B079 | April 5, 2026 | Phase 2 page 3 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 6
**Depends on**: K294 Foundation primitives
**Tracker row**: `Captain Dashboard` (B30 batch)

---

## PAGE PURPOSE

Action-first command view for business owners (Captains). "Where do I need to act today?" — NOT "How much data do I have?"

## ROUTE

`/captain` (AppShell). Captain role required (post-auth, post-role-grant).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Captain Dashboard."
- **Headline**: "Run the field from one screen."
- **Body**: "See territory status, active pipeline, incoming intelligence, and photo coverage in the order that helps you act."
- **Primary CTA**: "Open priority queue"
- **Secondary CTA**: "Review full territory"
- **Utility strip**: "Territory" · "Pipeline" · "Intelligence" · "Photo coverage"

## SECTION FLOW

1. Hero (AppShell variant)
2. **Top summary band** — 1 dominant card (Priority Queue) + 3 supporting cards
3. **2-column layout**:
   - **Left column**: Pipeline (top) + Territory (bottom)
   - **Right column**: Intelligence (top) + Photo Coverage (bottom)
4. **Below fold**: deeper layers per block (expand on drill-down)

## DOMINANT CARD (Priority Queue)

- Visually largest, top of band
- Shows 3-5 items needing Captain action TODAY
- Each item: one-line status + one recommended action button
- NOT a notification feed. Curated action list.

## SUPPORTING CARDS (3)

Each shows preview + one recommended action + "drill down" link:

- **Pipeline**: active deals / jobs / work-in-flight count + recommended next move
- **Territory**: geographic coverage snapshot + "review territory" action
- **Intelligence**: incoming tips / competitor signals / opportunity feeds
- **Photo Coverage**: bounty photo status / map coverage %

## DESIGN INSTRUCTION

- **1 dominant + 3 supporting** — NEVER 4 equal-weight panels
- **Action-first hierarchy** — every card preview → suggest one action → allow drill-down
- Progressive disclosure: preview status / one action / drill-down
- Dense operational chrome acceptable (this is the Captain's command center)
- No decorative chart real estate

## MOBILE

- First viewport: **Priority Queue card (dominant) + compact summary strip** only
- Maps, galleries, data tables below fold
- Card stack in priority order: Priority Queue → Pipeline → Territory → Intelligence → Photos
- StickyMobileCTA: "Open priority queue"

## COMPONENTS TO USE (from K294)

- `<AppShell pageTitle="Captain Dashboard">`
- `<Hero variant="app">`
- `<StickyMobileCTA>`
- `useTourTarget('captain')` on Priority Queue card

## NEW COMPONENTS (build in `platform/src/components/v2/captain/`)

- `PriorityQueueCard.tsx` — dominant card, curated action list
- `SupportingCardStrip.tsx` — 3-card strip wrapper (Pipeline/Territory/Intelligence/Photos can be 4, but visual weight stays supporting)
- `PipelineCard.tsx`
- `TerritoryCard.tsx`
- `IntelligenceCard.tsx`
- `PhotoCoverageCard.tsx`
- `CaptainSummaryStrip.tsx` — mobile compact summary

## DATA

- Captain role context likely exists — audit `captain_territories`, `captain_pipelines`, and similar tables
- Use existing data sources only. No schema changes.
- If tables don't exist yet, stub with realistic placeholder data and flag to Bishop

## BANNED

- NO 4 equal-weight panels
- NO notification-feed framing (Priority Queue is curated, not a feed)
- NO dashboard density for density's sake
- NO "KPI" / "metrics" language — use "status" / "standing" / "coverage"
- NO red states
- NO securities language, NO demographic fields, NO LLC/CEO

## ACCEPTANCE

- [ ] Route `/captain` wired, role-gated to Captain
- [ ] Hero copy matches spec EXACTLY
- [ ] Priority Queue is visually dominant (not equal to other cards)
- [ ] 4 supporting cards render (Pipeline, Territory, Intelligence, Photo Coverage)
- [ ] 2-column desktop layout: pipeline/territory left, intelligence/photos right
- [ ] Mobile: first viewport = dominant card + summary strip only
- [ ] `data-tour-target="captain"` on Priority Queue card
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K304'`, `in_progress` → `review`
- [ ] Librarian K304 logged
- [ ] Screenshots → `PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not build the territory-map drill-down subpage (stub)
- Do not rebuild pipeline state-management logic
- Do not add new Captain roles or permissions
- Do not wire to real intelligence feeds (stub data)

---

*Bishop B079 — Phase 2 page 3 of 6 — Captain Dashboard*
*FOR THE KEEP!*
