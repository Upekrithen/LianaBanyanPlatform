# Knight Session K364 — Launch Embarrassment Cleanup
# Bishop B086 | Priority: CRITICAL | Launch-blocking

## CONTEXT
Audit found pages that say "Coming Soon" where the feature either already exists (just not wired) or is close enough to finish. Every "Coming Soon" on a page a Crown Letter recipient or new member might visit is a credibility hit. Fix them by MAKING THEM WORK.

## FEATURE 1: HelmPage Leaderboards (WIRE EXISTING COMPONENT)

HelmPage.tsx has 3 leaderboard cards at lines 1117/1127/1137 that say "Coming Soon":
- Fastest Times
- Most Beacons
- Most Completions

`BeaconRunLeaderboard` component ALREADY EXISTS and is ALREADY IMPORTED in HelmPage (line 58). It supports:
- Fastest completion time sorting
- Global stats (`totalRuns`, `totalCompletions`, `fastestTime`)
- `showGlobalStats` prop

### Fix
Replace each "Coming Soon" placeholder card with the actual `BeaconRunLeaderboard` component:
- "Fastest Times" → `<BeaconRunLeaderboard sortBy="time" limit={10} />`
- "Most Beacons" → `<BeaconRunLeaderboard sortBy="beacons" limit={10} showGlobalStats />`
- "Most Completions" → `<BeaconRunLeaderboard sortBy="completions" limit={10} />`

If the component doesn't support `sortBy` yet, add it — it's a simple query change.

## FEATURE 2: HelmPage Medallions (BUILD)

Lines 1264/1271 show placeholder cards for "Guild Medallion" and "Captain Medallion". Ship Medallion works. Build the other two:

### Guild Medallion
- Earned when member completes a Guild phase (has `guild_members` table, `guildChapterSystem.ts`)
- Query: member has active guild membership with chapter_progress >= threshold
- Display: guild name, chapter completed, date earned
- Use same medallion card pattern as Ship Medallion

### Captain Medallion
- Earned when member reaches Captain status (has `useCaptain.ts` hook, captain components)
- Query: member has captain role in `user_roles` or `captain_applications` approved
- Display: captain rank, crew managed, date earned
- Use same medallion card pattern as Ship Medallion

## FEATURE 3: SubscribePage Billing (WIRE TO EXISTING STRIPE)

SubscribePage says "Stripe billing integration coming soon." But `create-membership-checkout` edge function WORKS (tested with real $5 payment). The subscription flow should use the same pattern:

### Fix
- Replace "coming soon" text with actual subscription tier cards
- Each tier calls `create-membership-checkout` or a similar edge function
- Follow the exact pattern from `MembershipStakePayment.tsx` which already works
- If this is for content subscriptions (not membership), wire to `storefront-checkout` with subscription mode

## FEATURE 4: CephasContentDetailPage (FIX TEMPLATE)

Content detail pages show "Coming Soon" instead of rendering the actual content. K361 just fixed the Hugo build (1,295 pages). The React detail page needs to fetch content from Supabase and render it.

### Fix
- Query `cephas_content` or `platform_canonical` table by slug
- Render `content_markdown` field using a markdown renderer
- Show title, category, date, related content
- Follow pattern from existing working detail pages (e.g., `PaperPage.tsx` or `PuddingDemo.tsx`)

## FEATURE 5: GhostWorld Pop-Up Kiosks (FINISH)

"Pop-Up Kiosks coming soon!" — GhostWorld is the digital storefront map. Pop-Up Kiosks are temporary storefronts.

### Fix
- Query `storefronts` table filtered by `type = 'popup'` or add a `is_popup` boolean
- Display on the GhostWorld map as a different colored marker/hex
- If no popup storefronts exist in DB, show "No pop-ups active right now" (not "coming soon")
- Add "Request a Pop-Up" CTA that links to storefront creation

## DO NOT TOUCH (defer to future sessions)
- WarChestPage — blocked on tax counsel, can't finish
- DeveloperPortal — not on critical user path
- ContestDirectory — no contests to show
- StarChamber as a Service — future feature
- HallOfInnovations sponsor tiers — future feature

## CONSTRAINTS
- Every fix must USE REAL DATA from Supabase — no new mock data
- If a query returns empty results, show "None yet" or "Be the first" — NEVER "Coming Soon"
- Follow existing component patterns (don't reinvent)
- SEC-safe language throughout (no "earn", "invest", "returns", "risk/reward")

## DONE WHEN
- [ ] HelmPage leaderboards show real data (no "Coming Soon")
- [ ] HelmPage medallions show earned/unearned state (no placeholders)
- [ ] SubscribePage has working Stripe checkout (no "coming soon")
- [ ] CephasContentDetailPage renders actual content
- [ ] GhostWorld shows storefronts without "coming soon"
- [ ] Zero "Coming Soon" text on any page a Crown recipient or new member would visit
- [ ] Build passes, deploy all 8 + Cephas
