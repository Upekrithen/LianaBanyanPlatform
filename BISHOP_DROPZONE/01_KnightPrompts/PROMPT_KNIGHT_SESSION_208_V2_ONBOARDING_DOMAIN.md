# KNIGHT SESSION 208 — v2 Onboarding Domain Migration
## Priority: HIGH | Source: Bishop B056 Domain Audit
## Prerequisite: K207 (Membership) complete + K211 (FocusShell) complete or in parallel
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md` (Pawn's UI/UX audit)

---

## CONTEXT

Onboarding is the second v2 domain — the first user experience after auth. It covers Ghost World browsing, Cold Start pathways, Guided Discovery, Red Carpet welcome, Wildfire Tour, and the trickle onboarding system. In v2, Ghost World BROWSING lives here (Ghost World the GAME lives in gaming domain).

---

## V1 INVENTORY (from deep audit)

### Tables (3)
- `onboarding_cohorts` (6 cols) — batch onboarding groups
- `onboarding_members` (7 cols) — member ↔ cohort link
- `onboarding_credits` (12 cols) — credits awarded during onboarding

### Edge Functions (2)
- `red-carpet-verify` — 6-digit email verification code
- `connect-onboarding-refresh` — refresh onboarding state

### Pages (11)
WelcomeGatePage, TrickleOnboarding, RedCarpet, OnboardingStatusPage, OnboardingStart, GuidedDiscovery, CaptainOnboardingPage, AgentOnboarding, FirstSteps, ColdStartDashboard, ColdStartHub, ColdStartCalculator

### Components
**onboarding/ (3)**: KeirseyAssessmentCard, KeirseyResultsForm, RedCarpetWelcome
**cold-start/ (7)**: BackerPledgeEscrow, CareUnitSelector, ClaimDukedomForm, JesperDashboard, SixPersonVerification, LocalColdStartDashboard + index
**Also**: GhostWorld browsing (3 pages — GhostWorld, GhostWorldMap, GhostWorldMall) — ghost BROWSING for non-members

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/onboarding/
├── pages/
│   ├── WelcomeGatePage.tsx      # First landing (FocusShell)
│   ├── FirstStepsPage.tsx       # Post-signup orientation (FocusShell)
│   ├── GuidedDiscoveryPage.tsx  # Feature discovery tour (AppShell)
│   ├── OnboardingStatusPage.tsx # Progress tracker (AppShell)
│   ├── GhostBrowsePage.tsx      # Ghost World browsing for non-members (FocusShell)
│   ├── ColdStartPage.tsx        # 6 Cold Start pathways (AppShell)
│   └── RedCarpetPage.tsx        # Red Carpet welcome experience (FocusShell)
├── components/
│   ├── WelcomeFlow.tsx          # Multi-step welcome wizard
│   ├── ColdStartPathways.tsx    # 6 pathways: Food, Manufacturing, Service, Local Business, Guild, Tribe
│   ├── GhostBrowser.tsx         # Non-member browsing experience
│   ├── KeirseyAssessment.tsx    # Personality assessment for pathway matching
│   ├── OnboardingProgress.tsx   # Progress indicator
│   └── TrickleReveal.tsx        # Progressive feature revelation
├── hooks/
│   ├── useOnboarding.ts         # Onboarding state machine
│   ├── useGhostMode.ts          # Ghost browsing state
│   └── useColdStart.ts          # Cold start pathway selection
├── lib/
│   ├── onboardingTypes.ts       # Types
│   ├── onboardingSteps.ts       # Step definitions
│   └── coldStartPathways.ts     # 6 pathway configurations
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Ghost browsing ≠ Ghost World game.** Ghost BROWSING (non-member preview) → onboarding domain. Ghost World (game with malls, leaderboards, crow feathers) → gaming domain.

2. **Six Cold Start Pathways** (one per Production Level):
   - Food (Let's Make Dinner)
   - Manufacturing (Canister/Factory)
   - Service (Crew Call)
   - Local Business (Storefront)
   - Guild (Professional community)
   - Tribe (Personal community)

3. **Trickle Onboarding**: Don't show everything at once. Reveal features progressively. The 60/30/10 rule applies.

4. **Red Carpet**: Email-verified welcome experience. Different variants for different referral types (member invite, family invite, business pitch, driver recruit, medallion scan).

5. **WildFire Tour mode**: Mock data ONLY shown during tour. Real users see empty/zero state.

6. **FocusShell pages follow Pawn's design spec**: Hero owns the viewport. No floating widgets. No bookshelf rail. Inline proof strip replaces floating promo. See `FOCUS_SHELL_DESIGN_SPEC.md` and `focus-shell-reference.html` for exact patterns. Use `HeroStage`, `HeroTitle`, `HeroActions`, `HeroProof` shared components from K211.

---

## BUILD STEPS

1. Use Librarian: `get_schema("onboarding_cohorts")`, `get_schema("onboarding_members")`, `get_schema("onboarding_credits")`
2. Create clean v2 migration: `platform-v2/supabase/migrations/00002_v2_onboarding.sql`
3. Build pages with proper shell assignment (FocusShell for welcome/ghost, AppShell for dashboard)
4. Wire routes in `routes.tsx`
5. Export public API: `useOnboarding`, `useGhostMode`, `GhostBrowser`, `onboardingRoutes`
6. Register in `AppRouter.tsx`

---

## IMPORTS FROM MEMBERSHIP DOMAIN

```tsx
import { useMembership, MembershipGate } from '../membership';
```

Onboarding needs membership status to decide: show ghost mode, show onboarding, or show dashboard.

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

**Every session must end with this.** No exceptions.

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/welcome` shows Welcome Gate (FocusShell)
3. `/ghost` shows non-member browsing experience
4. `/onboarding` shows progress (AppShell)
5. `/cold-start` shows 6 pathways
6. `get_migration_status("onboarding")` shows v2 pages > 0
7. Librarian indexes rebuilt

---

*Bishop B056 — v2 Onboarding Domain*
*Ghost browsing + Cold Start + Red Carpet + Trickle Onboarding*
*FOR THE KEEP!*
