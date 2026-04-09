# KNIGHT SESSION 303 — V2 Cold Start (AppShell)
## Bishop B079 | April 5, 2026 | Phase 2 page 2 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_30_MASTER_DESIGN_PACKET_B057.md` § 3
**Depends on**: K294 Foundation primitives (AppShell, Hero, StickyMobileCTA)
**Tracker row**: `Cold Start` (B30 batch)

---

## PAGE PURPOSE

Guided choice among 6 pathways without paralysis. Reduce choice paralysis across 6 equal options.

## ROUTE

`/cold-start` (AppShell). Post-auth, member-facing.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Cold Start."
- **Headline**: "Choose your starting path."
- **Body**: "Pick the lane that best matches what you want to build first. You can expand later."
- **Primary CTA**: NONE — the pathway cards ARE the action
- **Secondary CTA**: "I'm not sure yet." → opens recommendation drawer
- **Utility strip**: "6 pathways" · "Change later" · "Guided setup"

## SECTION FLOW

1. Hero (AppShell variant, orientation card)
2. **Helper text band** — reassurance line: "Most people begin with the path closest to their first transaction."
3. **2x3 pathway grid** — 6 equal cards:
   - Food
   - Manufacturing
   - Service
   - Local Business
   - Guild
   - Tribe
4. **"How the pathways differ" accordion** (collapsed by default)
5. **"What happens after you choose" explainer** (3 steps: commit → setup → first transaction)

## DESIGN INSTRUCTION

- **NOT a carousel**. 2x3 grid (desktop) / 1-column stack (mobile).
- Each card has a "best for" tag (e.g., "best for: first-time sellers", "best for: skill-for-hire").
- "I'm not sure yet" opens a **recommendation drawer** with 3-4 questions → suggested pathway.
- Key reassurance: **"You can expand later"** appears under headline AND inside each card footer.
- No default-selected card. No dominant card. 6 EQUAL options.

## PATHWAY CARD STRUCTURE

Each of the 6 cards:
- Pathway name + icon
- One-sentence purpose
- "Best for:" tag
- 2-3 bullet capabilities
- "You can expand later" footer
- Primary action: "Start with [pathway]" → routes to pathway setup

**Suggested tag content (verify against canon)**:
- Food: "best for: cooks, growers, meal-makers"
- Manufacturing: "best for: makers, builders, production"
- Service: "best for: skills-for-hire, crew members"
- Local Business: "best for: existing shops, storefronts"
- Guild: "best for: professional bodies, charters"
- Tribe: "best for: neighborhoods, interests, family"

## MOBILE

- Single-column stack, scroll through 6 cards
- Sticky segment filter bar at top: "Food / Make / Serve / Shop / Guild / Tribe"
- "Change later" under headline
- StickyMobileCTA: "I'm not sure yet" as secondary action bar

## COMPONENTS TO USE (from K294)

- `<AppShell pageTitle="Cold Start">`
- `<Hero variant="app">`
- `<StickyMobileCTA>`
- `useTourTarget('cold-start')` on hero or grid wrapper

## NEW COMPONENTS (build in `platform/src/components/v2/cold-start/`)

- `PathwayGrid.tsx` — 2x3 grid wrapper
- `PathwayCard.tsx` — individual pathway card with "best for" tag, capabilities, footer
- `RecommendationDrawer.tsx` — "I'm not sure yet" drawer with 3-4 question flow
- `PathwayDifferences.tsx` — accordion comparison
- `WhatHappensNext.tsx` — 3-step explainer

## DATA

- 6 pathways are canonical (Food/Manufacturing/Service/Local Business/Guild/Tribe) — map to "Six Cold Start Pathways" in memory
- Each pathway routes to its setup page (stub if destinations don't exist — link to `/cold-start/[pathway]` placeholder)
- Recommendation drawer logic: 3-4 questions, simple rule-based mapping

## BANNED (pre-completion check)

- NO dominant card / hero default selection
- NO "upgrade/premium/unlock"
- NO demographic-profiling questions in the recommendation drawer (ask about INTENT: "what do you want to do first?", not "who are you?")
- NO red states
- NO LLC / CEO / invest language
- NO carousel or auto-advance

## ACCEPTANCE

- [ ] Route `/cold-start` wired in AppShell sidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 6 pathway cards render 2x3 desktop / 1-col mobile
- [ ] Each card has "best for" tag, capabilities, "expand later" footer
- [ ] "I'm not sure yet" drawer opens, 3-4 intent questions, returns suggestion
- [ ] Accordion "How the pathways differ" is collapsed by default
- [ ] `data-tour-target="cold-start"` anchor placed
- [ ] Mobile: sticky filter bar, single-column, StickyMobileCTA present
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K303'`, `in_progress` → `review`
- [ ] Librarian `update_session` K303
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not build the 6 pathway destination setup flows (stub links)
- Do not change sidebar navigation for other pages
- Do not add demographic questions to recommendation drawer
- Do not create any new database tables

---

*Bishop B079 — Phase 2 page 2 of 6 — Cold Start*
*FOR THE KEEP!*
