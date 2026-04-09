# KNIGHT SESSION 215 — v2 Financial Domain Migration
## Priority: HIGH | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency) complete — financial depends on currency types
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md`

---

## CONTEXT

Financial is the 8th v2 domain — dashboards, transparency, and payouts. It covers the 28+ dashboard pages (role-based earning views), the Transparent Ledger, payout/withdrawal system, Mercury bank integration, and Stripe webhook handling. The K204 audit found 28 dashboard pages that should consolidate to 5 + a role template. The currency DOMAIN handles Credits/Marks/Joules/LB Card — financial handles the DISPLAY, TRANSPARENCY, and PAYOUT of those currencies.

**Key split: Currency domain = the money. Financial domain = where you see it and move it.**

---

## V1 INVENTORY (from B056 deep audit)

### Tables (1 direct + shared with currency)
- `transaction_ledger` (22 cols) — master ledger: ledger_category, amount_cents, currency, payer_id, payee_id, status, reference_type/id
- Plus shared tables from currency domain: user_credits, user_marks, user_joules, member_connect_accounts, member_payouts

### Edge Functions (15)
**Checkout (9)**: create-credit-checkout, create-membership-checkout, create-menu-checkout, create-preorder-checkout, create-project-funding-checkout, create-sponsor-checkout, create-guild-stake-checkout, create-herald-checkout, create-subscription-checkout
**Processing (3)**: verify-credit-payment, process-credit-match, process-withdrawal
**Mercury (2)**: get-mercury-balance, mercury-keepalive
**Transparency (1)**: get-transparency-data

### Pages (28+ dashboards)
**Earnings/Transparency (3)**: EarningsDashboard, TransparentLedger, FinancialTransparencyPage
**Role Dashboards (25)**: Dashboard (main), CreatorDashboard, CaptainDashboardPage, CrewDashboard, MakerDashboard, ProviderDashboard, RunnerDashboard, ReviewerDashboard, OnboarderDashboard, AmbassadorDashboard, TestPilotDashboard, TasteTesterDashboard, HexisleDashboard, XRayBountyDashboard, CueCardCreatorDashboard, LibrarianDashboardPage, StewardDashboard, StewardLegalDashboard, StewardStampDashboard, LMDReviewerDashboard, ChainDashboard, CoverageMinutesDashboard, CPlus20Dashboard, C20PilotDashboard, AdminEscrowDashboard, MembershipDashboard

### K204 Findings
- **28 dashboard pages should consolidate to 5 + role template**: Main Dashboard, Earnings Dashboard, Transparency Dashboard, Admin Dashboard, Role-Specific Template
- **EarningsDashboard withdrawal fee bug**: shows 20%, should be 16.7% (fixed in K205)
- **9 checkout functions with ~700 lines duplicated**: should consolidate to 1 universal checkout (belongs in currency domain)
- Heavy overlap with currency — need clean boundary

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/financial/
├── pages/
│   ├── DashboardPage.tsx            # Main member dashboard hub (AppShell)
│   ├── EarningsDashboardPage.tsx    # Earnings overview across all roles (AppShell)
│   ├── TransparencyPage.tsx         # Public transparency ledger (AppShell)
│   ├── PayoutsPage.tsx              # Withdrawal/payout management (AppShell)
│   └── AdminFinancialPage.tsx       # Admin escrow + oversight (AppShell)
├── components/
│   ├── dashboard/
│   │   ├── RoleDashboardTemplate.tsx  # Universal template for all 25 role dashboards
│   │   ├── RoleCard.tsx              # Individual role earning card
│   │   ├── EarningsSummary.tsx       # Cross-role earnings aggregate
│   │   ├── PayoutHistory.tsx         # Payout/withdrawal history
│   │   └── DashboardGrid.tsx         # Responsive grid layout for role cards
│   ├── ledger/
│   │   ├── LedgerTable.tsx           # Filterable transaction table
│   │   ├── LedgerEntry.tsx           # Single transaction row
│   │   └── TransparencyChart.tsx     # Revenue/expense visualization
│   ├── payouts/
│   │   ├── WithdrawalForm.tsx        # Withdrawal request (fee: 16.7%, NOT 20%)
│   │   ├── PayoutMethodSelector.tsx  # Connect account selection
│   │   └── PayoutStatusBadge.tsx     # Status indicator
│   └── EscrowPanel.tsx               # Admin escrow holds/releases
├── hooks/
│   ├── useEarnings.ts               # Cross-role earnings aggregation
│   ├── useLedger.ts                 # Transaction ledger queries
│   ├── usePayouts.ts               # Payout/withdrawal management
│   ├── useMercuryBalance.ts        # Mercury bank balance (admin)
│   └── useTransparency.ts          # Public transparency data
├── lib/
│   ├── financialTypes.ts           # Types
│   ├── roleDefinitions.ts          # 25 roles with earning rules
│   ├── feeSchedule.ts              # Withdrawal fee: 16.7% (NOT 20%). FIXED IN K205.
│   ├── ledgerCategories.ts         # Ledger category taxonomy
│   └── transparencyRules.ts        # What's public vs private
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **CONSOLIDATE 28 DASHBOARDS TO 5 + TEMPLATE.** The biggest win in this migration. Instead of 28 separate dashboard pages, we have:
   - `DashboardPage` — hub showing all active roles
   - `EarningsDashboardPage` — detailed earnings across roles
   - `TransparencyPage` — public ledger
   - `PayoutsPage` — withdrawal management
   - `AdminFinancialPage` — admin oversight
   - `RoleDashboardTemplate` — universal component that renders any role's dashboard based on config

2. **RoleDashboardTemplate**: Each of the 25 roles (Creator, Captain, Crew, Maker, Provider, Runner, Reviewer, Onboarder, Ambassador, TestPilot, TasteTester, HexIsle, XRayBounty, CueCardCreator, Librarian, Steward, StewardLegal, StewardStamp, LMDReviewer, Chain, CoverageMinutes, CPlus20, C20Pilot, Admin, Membership) is defined in `roleDefinitions.ts` with its earning rules, and rendered by the template.

3. **Withdrawal fee is 16.7% — NOT 20%.** This was a live bug fixed in K205. The v2 code must use 16.7% from day one. See `feeSchedule.ts`.

4. **Currency vs Financial boundary**: Currency domain handles Credits/Marks/Joules/LB Card/Medallions — the assets themselves, their creation, transfer, and conversion. Financial domain handles the DISPLAY (dashboards), TRANSPARENCY (public ledger), and MOVEMENT (payouts/withdrawals) of those assets.

5. **9 checkout functions consolidate in Currency, not Financial.** The v1 had 9 nearly-identical checkout functions. In v2, there should be ONE universal checkout in the currency domain. Financial just displays the results.

6. **Mercury integration**: Admin-only. Shows LB Corp bank balance, sync status. Mercury-keepalive runs as cron.

7. **All pages are AppShell** — financial is fully member-facing, post-auth. Transparency page is member-visible but shows aggregate public data.

---

## BUILD STEPS

1. Use Librarian: `get_schema("transaction_ledger")`, `list_edge_functions("checkout")`, `list_edge_functions("withdrawal")`
2. Build RoleDashboardTemplate FIRST — this is the big consolidation
3. Define all 25 roles in `roleDefinitions.ts` with earning rules
4. Build 5 pages using the template
5. Port transparency ledger with charts
6. Wire routes in `routes.tsx`
7. Export public API: `useEarnings`, `RoleDashboardTemplate`, `LedgerTable`, `financialRoutes`
8. Register in `AppRouter.tsx`

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership } from '../membership';
// All financial pages are member-gated

// Currency types needed for display:
// import { CreditBalance, MarksBalance, JoulesBalance } from '../currency';
// (available after K209 completes)
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/dashboard` shows role cards for all active roles
3. `/earnings` shows cross-role earnings aggregate
4. `/transparency` shows public ledger
5. `/payouts` shows withdrawal form with 16.7% fee (NOT 20%)
6. RoleDashboardTemplate renders correctly for at least 3 different roles
7. `get_migration_status("financial")` shows v2 pages > 0
8. Librarian indexes rebuilt

---

*Bishop B057 — v2 Financial Domain*
*28 dashboards → 5 pages + RoleDashboardTemplate*
*Withdrawal fee: 16.7%. NOT 20%. Fixed forever.*
*FOR THE KEEP!*
