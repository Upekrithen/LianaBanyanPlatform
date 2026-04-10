# Knight Session K358 — WildFire Tour Mode Integration (UPDATED B092)
# Replaces original K358 from B086
# Priority: MEDIUM | Depends on: K375, K376, K377 DELIVERED

## CONTEXT — WHAT CHANGED
B092 built the HexIsle Archipelago on the museum site:
- `/hexisle` — 7-island world map (vertical archipelago)
- `/hexisle/:island` — Island Deck Cards with Ghost World / Real World backs
- `/hexisle/:island/:district` — District cards for Harvest (12 Verdana districts)
- X-Ray toggles Ghost World (lore) ↔ Real World (business descriptions)

**The Archipelago IS the tour now.** Ghost World mode = WildFire Tour. Each island teaches a business skill, each district maps to a platform feature. The old approach (mock data on flat subscription/crew/marketplace pages) is replaced by guided island exploration that LEADS to those pages when the visitor is ready.

## WHAT TO BUILD

### 1. Tour Entry: `/tour` Route → Archipelago with Tour Mode
- `/tour` route activates WildFire Tour mode (sets localStorage `wildfire_tour=true`)
- Redirects to `/hexisle` with tour state active
- Tour banner appears at bottom: orange pill "🔥 WildFire Tour" with "Exit Tour" button
- Tour mode persists across page navigation until explicitly ended

### 2. Tour-Aware Archipelago
When `wildfire_tour=true`:
- Islands unlock progressively: Island 1 (Harvest) is accessible, others show as "locked" (chalk outline, 30% opacity)
- Visiting an island and flipping its card (reading the back) "unlocks" the next island
- Progress stored in localStorage `hexisle_tour_progress`
- Unlocking animation: dashed path becomes solid, next island fades to full opacity
- LRH dialogue bubble appears at key moments:
  - First visit: "Welcome to the Archipelago. Each island teaches a skill. Start with Harvest."
  - After flipping Harvest: "You just learned about Manufacturing. Navigate Island is next."
  - After all 7 visited: Tour completion trigger

### 3. Tour-Aware Island Cards
When `wildfire_tour=true`:
- Real World (X-Ray) back of each island card adds platform feature previews:
  - Harvest → "Try the Storefront Builder" link → `/marketplace` (with tour mock data)
  - Navigate → "See the Subscription system" link → `/subscriptions` (tour mode)
  - Engineer → "Visit the Design Pipeline" link → `/design-pipeline` (tour mode)
  - Battle → "Check the Game Arena" link → `/hexisle-arena` (future)
  - Seek → "Browse Quality bounties" link → `/bounties` (tour mode)
  - Magic → "Explore customer service tools" link → `/crew` (tour mode)
  - Train → "See the Captain's Dashboard" link → `/captain` (tour mode)
- Each link passes `?tour=true` so destination pages know to show demo data

### 4. Tour-Aware District Cards
When `wildfire_tour=true` on Harvest Island districts:
- Tower of Peace → "Read 3 Cephas articles" challenge (links to `/library`)
- Harbor → "See the Lemon Lot demo" link
- Market Square → "Preview your Storefront" with 3 template products
- Forge Corner → "Tour the Canister System factory"
- The Tavern → "Visit a Keep demo" (Ghost World game room)
- Each district card gets a "✓ Visited" badge after being viewed

### 5. Tour Completion
After visiting all 7 islands (or 5+ district cards on Harvest):
- LRH appears with completion dialogue
- Show recap: "You explored Manufacturing, Sales, R&D, Competition, Quality, Service, Leadership"
- "$5/year — that's it. Own your work."
- CTA → MembershipPage
- Dismiss option: tour continues, visitor can keep exploring

### 6. Platform Page Tour Stubs (Minimal)
On main platform pages, when `?tour=true`:
- Show a simple "WildFire Tour" orange banner at top
- Display 2-3 demo items (from `tourMockData.ts`)
- "Join for $5/year to make this real" CTA at bottom
- Keep it MINIMAL — the Archipelago is the main tour, platform pages are just previews

### 7. Tour Entry Points
Add "🔥 Take the WildFire Tour" button to:
- Museum home page (HEOHO card, after Enter/Watch buttons)
- EnterDoors page (after the 3 doors)
- CephasBasement (library) page
- Cold Start pages (when they exist)

## FILES TO CREATE/MODIFY
- Create `platform/src/contexts/WildfireRunContext.tsx` — enhance with tour state
- Create `platform/src/data/tourMockData.ts` — minimal demo data
- Modify `platform/src/pages/museum/Archipelago.tsx` — tour-aware progressive unlock
- Modify `platform/src/pages/museum/IslandCard.tsx` — tour links + unlock tracking
- Modify `platform/src/pages/museum/DistrictCard.tsx` — visited badges + challenges
- Create `platform/src/components/wildfire/TourBanner.tsx` — persistent bottom banner
- Create `platform/src/components/wildfire/TourCompletionModal.tsx`
- Modify `platform/src/MuseumApp.tsx` — add `/tour` route
- Modify `platform/src/pages/museum/HomeScreen.tsx` — add Tour CTA
- Modify `platform/src/pages/museum/EnterDoors.tsx` — add Tour CTA

## CONSTRAINTS
- Tour is CLIENT-SIDE ONLY — no Supabase writes
- All progress in localStorage
- Tour mode visually distinct: orange accent (#f97316)
- CTA always links to MembershipPage, never auto-enrolls
- The Archipelago is the PRIMARY tour experience, platform pages are secondary
- LRH dialogue uses existing MascotBubble component

## KEY INSIGHT
The old K358 was "tour the platform pages with mock data." The new K358 is "explore the game world, and the game world teaches you what the platform does." The Ghost World / Real World duality makes this natural — Ghost World IS the tour, Real World IS the platform. X-Ray goggles let you see through the game to the business beneath.

## DONE WHEN
- [ ] `/tour` route activates tour mode → redirects to `/hexisle`
- [ ] Islands unlock progressively as visitor explores
- [ ] LRH dialogue at key progression points
- [ ] Platform page stubs show demo data with `?tour=true`
- [ ] Tour completion modal after 7 islands visited
- [ ] Tour CTAs on museum home + enter doors + library
- [ ] No Supabase writes during tour
- [ ] Orange "WildFire Tour" banner visible throughout
