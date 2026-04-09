# KNIGHT SESSION 307 — V2 Calendar (AppShell)
## Bishop B080 | April 5, 2026 | Phase 2 page 6 of 6 (FINAL)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 6
**Depends on**: K294 Foundation primitives (AppShell, Hero, StickyMobileCTA)
**Tracker row**: `Calendar` (B32 batch)

---

## PAGE PURPOSE

Read your time as a story — how personal, cooperative, learning, and defense commitments braid together. NOT a grid of events. A pattern mirror.

## ROUTE

`/calendar` (AppShell). Post-auth, member-facing. Added to AppSidebar nav.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "See what your week says about you"
- **Headline**: "A calendar that shows how your cooperative life is unfolding."
- **Body**: "Seven threads — personal, family, business, coalition, route, defense, education — braided so you see patterns, not just events."
- **Primary CTA**: "Open this week"
- **Secondary CTA**: "Adjust my sources"
- **Utility strip**: "7 threads" · "Week reflection" · "Pattern hints"

## SECTION FLOW

1. Hero (AppShell variant)
2. **WeekReflectionPanel** (dominant card) — auto-summary: "6 hours coalition, 0 education, 2 housing" with ONE suggested adjustment
3. **BraidedWeekView** — 7-thread calendar visualization (color + icon per thread, NOT label-only)
4. **PatternHintCard** — smart-hint prompt: "Do you want to keep saying yes to this pattern?"
5. **ThreadSourceManager** (secondary) — list of 7 threads with on/off toggles + "Adjust my sources" CTA
6. **TripStoryCard** (conditional) — only renders when a Route thread event exists in the current week

## DESIGN INSTRUCTION

- **7 event types** distinguished by BOTH color AND icon (accessibility requirement):
  - Personal · Family · Business · Coalition · Route · Defense · Education
- Week Reflection panel auto-summarizes the current week and suggests ONE (not many) adjustment.
- Smart hints frame questions, not prescriptions: "Do you want to keep saying yes to this pattern?" — never "You are doing too much X."
- **NO red states**. Amber for imbalance, never red.
- **NO judgement copy**. Never "You are over-committed." Use "Room to adjust."

## COMPONENTS (build in `platform/src/components/v2/calendar/`)

- `WeekReflectionPanel.tsx` — dominant summary card with one adjustment suggestion
- `BraidedWeekView.tsx` — 7-thread visualization wrapper
- `ThreadEventTile.tsx` — individual event with color + icon per thread
- `ThreadSourceManager.tsx` — on/off toggles for 7 threads
- `PatternHintCard.tsx` — question-framed smart hints
- `TripStoryCard.tsx` — Route-thread trip summary (conditional)

## DATA

- 7 thread types are canonical. Wire as TypeScript enum: `'personal' | 'family' | 'business' | 'coalition' | 'route' | 'defense' | 'education'`
- Week reflection aggregation: mock the aggregator function; real data wires post-K307
- Thread sources map to existing domain tables where possible (Family Table, Crew Call, etc.) — STUB if source doesn't exist
- Pattern hint rules: simple rule-based heuristics (e.g., ">5h coalition AND 0 education → suggest 'add one learning block'")

## MOBILE

- Single-column stack: Hero → WeekReflectionPanel → BraidedWeekView (scrollable) → PatternHintCard → ThreadSourceManager
- StickyMobileCTA: "Open this week" → scrolls to BraidedWeekView
- Sticky top filter chips: 7 thread toggles (single-select filter)

## BANNED (pre-completion check)

- NO grid-of-events default view (braided thread view ONLY)
- NO red states
- NO judgemental copy ("over-committed", "falling behind", "declining")
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake
- NO prescriptive hints — all hints framed as questions

## ACCEPTANCE

- [ ] Route `/calendar` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] 7 threads render with distinct color AND icon
- [ ] WeekReflectionPanel auto-summarizes current week
- [ ] One (not many) suggested adjustment per week
- [ ] PatternHintCard uses question framing
- [ ] `data-tour-target="calendar"` anchor placed on BraidedWeekView
- [ ] Mobile: sticky thread filter chips, single-column, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K307'`, `in_progress` → `review`
- [ ] Librarian `update_session` K307
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not build event creation/edit flows (read-only visualization this session)
- Do not change sidebar navigation for other pages
- Do not create new database tables
- Do not wire real data aggregators (mock week data)

---

*Bishop B080 — Phase 2 page 6 of 6 — Calendar*
*Closes Phase 2 Member Core. Phase 3 Creator Workspaces opens at K308.*
*FOR THE KEEP!*
