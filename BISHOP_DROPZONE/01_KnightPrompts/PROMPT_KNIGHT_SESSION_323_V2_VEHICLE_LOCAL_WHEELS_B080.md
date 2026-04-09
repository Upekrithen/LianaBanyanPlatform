# KNIGHT SESSION 323 — V2 Vehicle / Local Wheels (AppShell)
## Bishop B080 | April 5, 2026 | Phase 5 page 3 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 5
**Depends on**: K294 Foundation. K225 Vehicle LIVE. Solves "three bolted apps" problem.
**Tracker row**: `Vehicle / Local Wheels` (B35 batch)

---

## PAGE PURPOSE

Single home for Local Wheels + Lemon Lot + Rideshare Routes. Three-tab mode selector as LARGE sticky cards. Earn-down ownership visible.

## ROUTE

`/wheels` (AppShell).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Local Wheels"
- **Headline**: "One garage for rides, listings, and routes."
- **Body**: "Request a ride, list a vehicle, or match a commuter route — with earn-down ownership economics visible the whole way."
- **Primary CTA**: "Pick a mode"
- **Secondary CTA**: "How earn-down works"
- **Utility strip**: "Local Wheels · Lemon Lot · Rideshare Routes"

## LAYOUT

- **Top (sticky)**: `ThreeTabModeSelector` — LARGE sticky cards (NOT text tabs)
  - Local Wheels | Lemon Lot | Rideshare Routes
- **Local Wheels tab**:
  - `RideRequestCard` (minimal, fast)
  - `EarnDownProgressStrip` (visible to drivers; "Become a Driver" nudge for non-drivers)
  - `ActiveDriverMap` with ADAPT pins
  - `RecentRidesFeed`
- **Lemon Lot tab**:
  - `LemonLotGrid` with filter bar
  - `PostListingCTA`
  - `ListingDetailSlideOver` (no full-page nav)
- **Rideshare Routes tab**:
  - `RouteMatchBoard`
  - `PostRouteCTA` with cooperative framing in form
  - `MatchSuggestionsPanel`

## CRITICAL DESIGN RULES

- **Mode selector = LARGE cards**, not text tabs (solves three-bolted-apps problem)
- **Earn-down economics VISIBLE in UI** (80/20 split, ownership accumulation)
- **ADAPT pins on driver map** (no stars, no red badges)
- Listing detail = slide-over, NOT full-page nav

## COMPONENTS (build in `platform/src/components/v2/wheels/`)

- `ThreeTabModeSelector.tsx`
- `RideRequestCard.tsx`
- `EarnDownProgressStrip.tsx`
- `ActiveDriverMap.tsx` + `AdaptPin.tsx`
- `RecentRidesFeed.tsx`
- `LemonLotGrid.tsx` + `LemonListingCard.tsx`
- `ListingDetailSlideOver.tsx`
- `RouteMatchBoard.tsx` + `RouteCard.tsx`
- `MatchSuggestionsPanel.tsx`

## MOBILE

- Mode selector cards full-width stacked
- Active-tab content single-column
- Slide-overs fill screen on mobile
- StickyMobileCTA: contextual per tab

## DATA

- Existing K225 Vehicle schema + Lemon Lot + Rideshare tables

## BANNED

- NO text tabs (LARGE cards only)
- NO hiding earn-down economics
- NO red states on driver map
- NO full-page nav for listing detail
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language

## ACCEPTANCE

- [ ] Route `/wheels` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Three LARGE sticky mode cards (not text tabs)
- [ ] Earn-down progress visible to drivers + nudge to non-drivers
- [ ] Driver map uses ADAPT pins
- [ ] Listing detail opens as slide-over
- [ ] Route match board present with match suggestions
- [ ] `data-tour-target="wheels"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K323 review; Librarian logged

## DO NOT

- Do not use text tabs
- Do not hide earn-down mechanics
- Do not full-page nav to listing detail

---

*Bishop B080 — Phase 5 page 3 of 6 — Vehicle / Local Wheels*
*FOR THE KEEP!*
