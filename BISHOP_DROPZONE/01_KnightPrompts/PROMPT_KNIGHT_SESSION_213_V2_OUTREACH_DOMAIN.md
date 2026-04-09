# KNIGHT SESSION 213 — v2 Outreach Domain Migration
## Priority: HIGH | Source: Bishop B057 Domain Audit
## Prerequisite: K212 (Content) complete or in parallel
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md`

---

## CONTEXT

Outreach is the 6th v2 domain — how LB reaches the world. It covers Cue Cards (shareable member cards), Red Carpet (welcome experiences), Crown Letters (leadership outreach), transactional email (10 types), and campaign management. This domain has 26 migrations in v1 and 12 Red Carpet variants, making it larger than it first appears.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (20+ across 26 migrations)
- `cue_card_templates` — card designs
- `cue_card_destinations` — where cards point (13 cols)
- `cue_card_click_tracking` — click analytics (11 cols)
- `cue_card_campaigns` — campaign groupings (16 cols)
- `cue_card_shares` — individual shares (12 cols)
- `cue_card_attribution` — sponsorship tracking (ONE LEVEL ONLY, not MLM)
- `red_carpet_access` — access tokens
- `red_carpet_recipients` — recipient profiles (17 cols)
- `red_carpet_showcase` — showcase configurations
- `red_carpet_registry` — registry entries (22 cols)
- `red_carpet_fallback_visits` — fallback page tracking (7 cols)
- `crown_letters` — letter records
- `crown_letter_updates` — letter update history
- `crown_letter_delegations` — delegation tracking (9 cols)
- `campaign_plans` — campaign planning
- `hofund_cue_cards` — HexIsle-specific cards
- `treasure_keys_all_letters` — letter treasure keys

### Edge Functions (2)
- `send-transactional-email` — 10 types via Resend: welcome, pledge, credit, cancellation, milestone, project_claimed, delivery, contest, membership, payout, outreach
- `red-carpet-verify` — 6-digit email verification code

### Pages (12+)
**Cue Cards**: CueCardLanding, CueCardCreator, CueCardCreatorDashboard, CueCardDeckPage, CueCardCampaignDetailPage, CueCardCampaignLibrary, CueCardShareLanding, CueCardGeneratorV2
**Crown Letters**: CrownLettersPage, CrownLetterUpdate
**Red Carpet**: RedCarpet, CreatorRedCarpet

### Components (24)
**Cue Cards (10)**: CueCardDestinationConfig, CueCardCampaignGrid, CueCardCampaignCard, CueCardCampaignDetail, CueCardDeck, PrintableCueCard, DashboardCueCards, BeaconRunCueCard, SwoopCueCard, PuddingCueCards
**Red Carpet (12)**: RedCarpetFallback, RedCarpetRenderer, RedCarpetWalkthrough, RedCarpetBanner, RedCarpetShell, RedCarpetWelcome, BusinessPitchRedCarpet, DriverRecruitRedCarpet, FamilyInviteRedCarpet, GenericWelcomeRedCarpet, MedallionScanRedCarpet, MemberInviteRedCarpet
**Letters (2)**: LetterHeader, LockedCrownLetterView

### Hooks (4)
useCueCardCampaign, useCueCardCampaigns, useSponsoredCards, useBusinessCampaigns

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/outreach/
├── pages/
│   ├── CueCardLandingPage.tsx      # Public cue card viewer (FocusShell)
│   ├── CueCardCreatorPage.tsx      # Card creation tool (AppShell)
│   ├── CueCardDashboardPage.tsx    # Creator's card management (AppShell)
│   ├── CueCardCampaignPage.tsx     # Campaign detail + analytics (AppShell)
│   ├── CueCardDeckPage.tsx         # Browse available card decks (AppShell)
│   ├── CrownLettersPage.tsx        # Crown letter listing (AppShell)
│   ├── RedCarpetPage.tsx           # Red Carpet welcome experience (FocusShell)
│   └── CreatorRedCarpetPage.tsx    # Creator-specific Red Carpet (FocusShell)
├── components/
│   ├── cue-card/
│   │   ├── CueCardRenderer.tsx     # Universal card renderer
│   │   ├── CueCardEditor.tsx       # Card creation/editing
│   │   ├── CueCardDeck.tsx         # Deck display
│   │   ├── CampaignGrid.tsx        # Campaign overview grid
│   │   ├── PrintableCueCard.tsx    # Print-optimized layout
│   │   └── AttributionDisplay.tsx  # ONE-LEVEL sponsorship display (NOT MLM)
│   ├── red-carpet/
│   │   ├── RedCarpetShell.tsx      # Shared shell for all variants
│   │   ├── RedCarpetRenderer.tsx   # Dynamic variant renderer
│   │   ├── MemberInviteVariant.tsx
│   │   ├── FamilyInviteVariant.tsx
│   │   ├── BusinessPitchVariant.tsx
│   │   ├── DriverRecruitVariant.tsx
│   │   ├── MedallionScanVariant.tsx
│   │   └── GenericWelcomeVariant.tsx
│   └── letters/
│       ├── CrownLetterView.tsx     # Letter display (locked/unlocked)
│       └── LetterHeader.tsx        # Standardized letter header
├── hooks/
│   ├── useCueCards.ts              # Card CRUD + sharing
│   ├── useCampaigns.ts            # Campaign management
│   ├── useRedCarpet.ts            # Red Carpet state + verification
│   └── useAttribution.ts          # ONE-LEVEL attribution tracking
├── lib/
│   ├── outreachTypes.ts           # Types
│   ├── cueCardTemplates.ts        # Card template definitions
│   ├── redCarpetVariants.ts       # Variant configurations
│   ├── attributionRules.ts        # ONE LEVEL ONLY. Not MLM. Never 2nd-degree.
│   └── emailTypes.ts              # 10 transactional email types
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Cue Card Attribution is ONE LEVEL ONLY.** Sponsorship Marks flow from sponsor → sponsored member. NEVER 2nd-degree. This is NOT MLM. This is a hard architectural constraint. See `attributionRules.ts`.

2. **Red Carpet has 6 variants**: MemberInvite, FamilyInvite, BusinessPitch, DriverRecruit, MedallionScan, GenericWelcome. Each is a separate component rendered through RedCarpetRenderer based on the invite type.

3. **FocusShell pages**: CueCardLandingPage (public, pre-auth), RedCarpetPage (welcome flow), CreatorRedCarpetPage. These are entry points for non-members.

4. **AppShell pages**: Everything else — member-facing card creation, campaigns, letter management.

5. **Transactional email** (send-transactional-email): 10 types via Resend. The edge function stays as-is — it's shared infrastructure, not domain-specific.

6. **Crown Letters are SEC-clean.** All 12 crown letters have been reviewed. No investment language. No guarantees. See Bishop's SEC audit.

7. **4 cue card emails sent** so far (2 Diana B051 + 2 Founder test B052). System works via send-transactional-email, type 'outreach'.

---

## BUILD STEPS

1. Use Librarian: `get_schema("cue_card_campaigns")`, `get_schema("red_carpet_recipients")`, `get_schema("red_carpet_registry")`, `get_schema("cue_card_shares")`, `get_schema("cue_card_attribution")`
2. Build pages — start with CueCardCreatorPage (core tool), then RedCarpetPage (welcome), then campaigns
3. Port Red Carpet variants — all 6 must work
4. Wire routes — note FocusShell vs AppShell assignment
5. Export public API: `useCueCards`, `RedCarpetRenderer`, `CueCardRenderer`, `outreachRoutes`
6. Register in `AppRouter.tsx`

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership } from '../membership';
// Cue cards require membership. Red Carpet is pre-auth (FocusShell).
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/cue-cards` shows card landing (FocusShell)
3. `/cue-cards/create` shows card creator (AppShell, requires auth)
4. `/red-carpet/:token` shows correct variant based on invite type
5. Attribution display shows ONE level only
6. `get_migration_status("outreach")` shows v2 pages > 0
7. Librarian indexes rebuilt

---

*Bishop B057 — v2 Outreach Domain*
*Cue Cards + Red Carpet (6 variants) + Crown Letters + ONE-LEVEL attribution*
*FOR THE KEEP!*
