# Knight Session K358 — WildFire Tour Mode Integration
# Bishop B086 | Priority: MEDIUM | Depends on: K355 DEPLOYED

## CONTEXT
WildFire Tour mode exists in fragments: WildfireBeaconRun.tsx (full component), WildfireRunContext.tsx (context provider), GlobalWildfireRun.tsx (global wrapper), MSAPage.tsx (toggle demo). But it's not wired into subscription or crew UI. The Tour should let prospective members experience the platform as if they had a live subscription, crew, and storefront — all with demo data — before committing $5.

## WHAT TO BUILD

### 1. WildFire Tour Provider Enhancement
Modify `WildfireRunContext.tsx` to add:
- `isTourMode: boolean` — global flag
- `tourProfile: MockProfile` — simulated member with $5 membership, 3 active subscriptions, 1 crew membership, 1 storefront
- `tourStats: MockStats` — Credits: $47.50, Marks: 12, Joules: 3, MSA balance: $4,250

### 2. Tour Mode for Subscription Pages
**SubscriptionChannelsPage** and **Subscriptions** pages:
- When `isTourMode`, show 3 demo subscription channels:
  - "Montana Makers Weekly" — manufacturing updates ($2/mo in Credits)
  - "San Antonio Eats" — food node newsletter (5 Marks/mo)
  - "HexIsle Strategy Guide" — gaming tips (1 Joule/quarter)
- Each shows: subscriber count (demo), next delivery, content preview
- Subscribe button triggers "Join for $5/year to subscribe for real" CTA
- Toggle in header: "WildFire Tour: ON/OFF" (orange pill, matches MSAPage pattern)

### 3. Tour Mode for Crew Pages
**CrewCallPage** and **CrewDashboard**:
- When `isTourMode`, show demo crew "San Antonio Launch Crew":
  - 4 demo members (mix of roles: Captain, First Mate, Crew, Apprentice)
  - 2 open positions ("Photographer needed", "Social media manager")
  - Active project: "Farmers Market Pop-Up" with timeline
- "Apply" button → "Join for $5/year to apply for real" CTA
- Crew chat placeholder: 3 demo messages showing collaboration

### 4. Tour Mode for Storefront
**MarketplaceV2Page** and **StorefrontBuilderV2**:
- When `isTourMode`, show builder in preview mode
- Demo storefront pre-populated: "Your First Shop" with 3 template products
- Cost+20% breakdown visible on each product
- "This is YOUR storefront" callout explaining 83.3% creator keeps

### 5. Tour Entry Points
- Add "Try WildFire Tour" button to:
  - GuidedTourPage (if exists) or WelcomeV2Page
  - ColdStartHub (all 7 pathways)
  - Landing page hero section
- Tour auto-activates on `/tour` route
- Tour persists via localStorage until explicitly ended
- "Exit Tour" floating button (bottom-right, orange) visible on all pages during tour

### 6. Tour Completion CTA
After visiting 5+ pages in tour mode, show completion modal:
- "You've explored the platform! Ready to make it real?"
- Show what they experienced vs what's waiting
- "$5/year — that's it" with MembershipPage link
- Dismiss option (tour continues)

## FILES TO CREATE/MODIFY
- Modify `platform/src/contexts/WildfireRunContext.tsx` — add tour mode state
- Create `platform/src/data/tourMockData.ts` — all demo data in one place
- Modify `platform/src/pages/Subscriptions.tsx` — tour mode branch
- Modify `platform/src/pages/CrewCallPage.tsx` — tour mode branch
- Modify `platform/src/pages/v2/commerce/MarketplaceV2Page.tsx` — tour mode branch
- Create `platform/src/components/wildfire/TourExitButton.tsx`
- Create `platform/src/components/wildfire/TourCompletionModal.tsx`
- Modify routes — add `/tour` entry point
- Modify `platform/src/pages/WelcomeV2Page.tsx` — add Tour CTA
- Modify `platform/src/pages/ColdStartHub.tsx` — add Tour CTA per pathway

## CONSTRAINTS
- Tour data is CLIENT-SIDE ONLY — no Supabase writes during tour
- All mock data in a single `tourMockData.ts` file for easy maintenance
- Tour mode must be visually distinct: orange tint/badge on all tour-mode pages
- CTA always links to MembershipPage, never auto-enrolls
- Cost+20% and 83.3% creator keeps shown on every storefront product
- Three currencies (Credits, Marks, Joules) all represented in tour data
- Follow existing MSAPage WildFire Tour toggle pattern

## DONE WHEN
- [ ] WildfireRunContext enhanced with tour mode
- [ ] Subscription pages show demo channels in tour mode
- [ ] Crew pages show demo crew in tour mode
- [ ] Marketplace shows demo storefront in tour mode
- [ ] /tour route activates tour mode
- [ ] Tour CTAs on Welcome + ColdStart pages
- [ ] Completion modal after 5+ page visits
- [ ] Exit Tour button visible throughout
- [ ] No Supabase writes during tour
