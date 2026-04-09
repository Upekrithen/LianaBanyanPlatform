# KNIGHT SESSION 324 — V2 Housing Hub (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 4 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_32_MASTER_DESIGN_PACKET_B057.md` § 1
**Depends on**: K294 Foundation. K220 Housing LIVE. WaterWheel + Roommate stamps data.
**Tracker row**: `Housing Hub` (B32 batch)

---

## PAGE PURPOSE

Decisive housing control room where contribution moves you up the cooperative priority line. Each tab = a chapter of the same cooperative housing story.

## ROUTE

`/housing` (AppShell).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Housing that remembers what you've done"
- **Headline**: "A housing cockpit where contribution moves you up the line."
- **Body**: "Your first view combines cooperative properties, your WaterWheel footprint, and a live priority ladder tied to your contributions."
- **Primary CTA**: "See where I stand"
- **Secondary CTA**: "See how to move up"
- **Proof strip**: "WaterWheel breakdown on every listing" · "Priority tier + next rung visible" · "Accountability stamps woven into housing story"

## SECTION FLOW

1. Hero + `MyHousingStoryCard` (tier, last 3 actions, next move)
2. `TabbedRail`: Properties / My Housing / Contribute / Housing Fund / Roommate
3. **Properties tab** (default): narrative snippets + WaterWheel split + your standing
4. **My Housing tab**: timeline with narrative labels connecting events to priority
5. **Contribute tab**: mission cards (name, why it matters, time, Marks/priority impact)
6. **Housing Fund tab**: fund graph + story panels ("This month enabled two subsidies")
7. **Roommate tab**: story snippets + stamp history, not demographics

## CRITICAL DESIGN RULES

- **Each tab = chapter of same cooperative housing story**
- **"Where am I, and what's my next meaningful move?"** = the answer every view provides
- **WaterWheel breakdown** appears on EVERY listing
- **Priority tier + next rung** always visible
- **Accountability stamps woven into story**, not separate tab
- **No demographics** on Roommate tab — stamp history only

## COMPONENTS (build in `platform/src/components/v2/housing/`)

- `MyHousingStoryCard.tsx`
- `HousingTabbedRail.tsx`
- `PropertyListingCard.tsx` (with WaterWheel breakdown)
- `WaterWheelBreakdown.tsx`
- `HousingTimeline.tsx` (narrative labels)
- `ContributionMissionCard.tsx`
- `HousingFundGraph.tsx`
- `RoommateStampHistory.tsx`
- `PriorityLadderVisualization.tsx`

## MOBILE

- `MyHousingStoryCard` pins under header
- One decision per screen
- Micro-learning as tappable chips
- StickyMobileCTA: "See where I stand"

## DATA

- K220 Housing schema + WaterWheel + Roommate stamp tables

## BANNED

- NO bank-ledger aesthetic on Housing Fund
- NO demographics on Roommate tab
- NO hiding WaterWheel from listings
- NO red states
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/housing` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] My Housing Story card pins under header on mobile
- [ ] 5 tabs render with narrative chapter framing
- [ ] WaterWheel breakdown on every property listing
- [ ] Priority tier + next rung visible
- [ ] Roommate tab uses stamp history only (no demographics)
- [ ] `data-tour-target="housing"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K324 review; Librarian logged

## DO NOT

- Do not show demographics on Roommate tab
- Do not omit WaterWheel breakdown on listings
- Do not bank-ledger the Housing Fund

---

*Bishop B080 — Phase 5 page 4 of 6 — Housing Hub*
*FOR THE KEEP!*
