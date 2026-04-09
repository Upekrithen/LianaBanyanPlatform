# KNIGHT SESSION 207 — v2 Membership Domain Migration
## Priority: HIGH | Source: Bishop B056 Domain Audit
## Prerequisite: K205 (Trust Fixes) and K206 (Librarian V2 Deploy) complete

---

## CONTEXT

This is the FIRST v2 domain migration. Membership is the foundation — every other domain depends on auth + membership status. The v2 scaffold exists at `platform-v2/src/domains/membership/` (empty directory). This session populates it.

**IMPORTANT**: Do NOT copy v1 code blindly. The K204 audit found 3 sources of truth for membership status, 7 gating mechanisms, and significant table leakage from other domains. This migration is a CLEAN REBUILD informed by v1.

---

## STEP 1: Identify Core Membership Tables

The v1 `membership` domain has 20 tables, but many DON'T belong here. Use the Librarian:

```
get_schema("member_profiles")
get_schema("membership_payments")
get_schema("membership_subscriptions")
get_schema("membership_renewals")
get_schema("member_agreement_acceptances")
```

**Tables that belong in membership v2:**
- `member_profiles` (13 cols) — core member record
- `membership_payments` (12 cols) — payment history
- `membership_subscriptions` (12 cols) — active subscriptions
- `membership_renewals` (11 cols) — renewal tracking
- `member_agreement_acceptances` (5 cols) — legal agreements
- `member_armory` (9 cols) — member tools/capabilities
- `member_chains` (8 cols) — sponsorship chains (Medallion Sponsorship)

**Tables that DON'T belong in membership (move to their v2 domains):**
- `guild_membership_history`, `guild_memberships` → guild domain
- `tribe_memberships` → guild domain
- `arena_memberships` → gaming domain
- `member_connect_accounts`, `member_payouts` → currency domain
- `member_bill_tracking` → political domain
- `member_content_feeds` → content domain
- `member_payment_plugs` → currency domain
- `member_reps` → reputation domain
- `member_project_milestones` → helm domain
- `member_relationships` → guild/family domain
- `member_subscriptions` → currency domain (different from membership_subscriptions)

---

## STEP 2: Build the v2 Membership Module

### Directory Structure
```
platform-v2/src/domains/membership/
├── pages/
│   ├── MembershipPage.tsx       # Join/pricing page (FocusShell)
│   ├── MembershipGatePage.tsx   # Gate for non-members (FocusShell)
│   ├── MembershipDashboard.tsx  # Member status overview (AppShell)
│   ├── MemberProfilePage.tsx    # Profile editing (AppShell)
│   ├── MemberAgreementPage.tsx  # Legal agreements (FocusShell)
│   └── MembershipSuccessPage.tsx # Post-payment confirmation (FocusShell)
├── components/
│   ├── MembershipCard.tsx       # Membership status card
│   ├── PricingTable.tsx         # $5/year pricing display
│   ├── MembershipGate.tsx       # Gate component (reusable)
│   ├── RenewalBanner.tsx        # Renewal reminder
│   └── SponsorChainDisplay.tsx  # Medallion Sponsorship chain
├── hooks/
│   ├── useMembership.ts         # SINGLE source of truth for membership status
│   ├── useMemberProfile.ts      # Profile data
│   └── useRenewal.ts            # Renewal status/actions
├── lib/
│   ├── membershipGating.ts      # Consolidate 7 gating mechanisms → 3
│   ├── membershipTypes.ts       # TypeScript types
│   └── membershipConstants.ts   # Status enums, pricing constants
├── routes.tsx                   # Route definitions
└── index.ts                     # Public API exports
```

### Key Design Decisions

1. **ONE source of truth for membership status**: `useMembership()` hook queries `membership_subscriptions` table + Stripe status. No more checking 3 different places.

2. **THREE gating levels** (down from 7):
   - `isAuthenticated` — logged in via Supabase auth
   - `isMember` — has active $5/year membership
   - `isPaidCreator` — member with active Stripe Connect account

3. **$5/year is a Structural Bylaw** — hardcode this. Don't make it configurable.

4. **Cost+20% margin** — creator keeps 83.3%. Build this into the membership display.

5. **Medallion Sponsorship** (NOT WWWWW) — ONE LEVEL ONLY. Not MLM.

---

## STEP 3: Write the v2 Migration SQL

Create `platform-v2/supabase/migrations/00001_v2_membership.sql` with ONLY the 7 core membership tables. Clean schema — no accumulated ALTER TABLE patches.

Use `get_schema(table)` for each table to see current columns, then write the clean CREATE TABLE.

---

## STEP 4: Build the Pages

Reference v1 pages via Librarian:
```
get_component("MembershipPage")
get_component("MembershipDashboard")
get_component("MemberProfile")
```

Build each page with proper shell assignment:
- **FocusShell** (marketing): MembershipPage, MembershipGatePage, MemberAgreementPage, MembershipSuccessPage
- **AppShell** (workspace): MembershipDashboard, MemberProfilePage

---

## STEP 5: Wire Routes

In `routes.tsx`:
```tsx
import { lazy } from 'react';
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
// ... etc

export const membershipRoutes = [
  { path: '/membership', element: <FocusShell><MembershipPage /></FocusShell> },
  { path: '/membership/dashboard', element: <AppShell><MembershipDashboard /></AppShell> },
  { path: '/membership/profile', element: <AppShell><MemberProfilePage /></AppShell> },
  { path: '/membership/gate', element: <FocusShell><MembershipGatePage /></FocusShell> },
  { path: '/membership/agreement', element: <FocusShell><MemberAgreementPage /></FocusShell> },
  { path: '/membership/success', element: <FocusShell><MembershipSuccessPage /></FocusShell> },
];
```

---

## STEP 6: Export Public API

In `index.ts`:
```tsx
// Only these are importable by other domains
export { useMembership } from './hooks/useMembership';
export { useMemberProfile } from './hooks/useMemberProfile';
export { MembershipGate } from './components/MembershipGate';
export { membershipRoutes } from './routes';
export type { MembershipStatus, MemberProfile } from './lib/membershipTypes';
```

---

## STEP 7: Register in AppRouter

Add to `platform-v2/src/app/AppRouter.tsx`:
```tsx
import { membershipRoutes } from '../domains/membership';
// In the route array:
...membershipRoutes,
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

**Every session must end with this.** No exceptions.

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

Verify: 29+ domains, updated page/component counts, v2-migration shows membership progress.

---

## VERIFICATION

1. `npm run build` passes in platform-v2/
2. Navigate to `/membership` — shows pricing page
3. Navigate to `/membership/dashboard` — shows status (empty state for new users)
4. `useMembership()` returns consistent status from ONE source
5. Librarian `get_migration_status("membership")` shows v2 pages > 0
6. Librarian indexes rebuilt (see above)

---

## RULES REMINDER
- **$5/year** membership. Structural Bylaw.
- **83.3%** creator keeps. Cost+20%.
- **Medallion Sponsorship** — ONE LEVEL ONLY.
- **No securities language** — no "equity", "shares", "dividends", "ROI", "invest"
- **Entity**: Liana Banyan CORPORATION. NOT LLC.
- **No demographic data collection**. Privacy Bylaw.

---

*Bishop B056 — First v2 Domain Migration*
*Membership is the foundation. Build it clean.*
*FOR THE KEEP!*
