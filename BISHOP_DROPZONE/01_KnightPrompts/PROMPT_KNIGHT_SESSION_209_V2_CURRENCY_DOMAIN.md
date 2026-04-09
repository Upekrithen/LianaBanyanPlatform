# KNIGHT SESSION 209 — v2 Currency Domain Migration
## Priority: HIGH | Source: Bishop B056 Domain Audit
## Prerequisite: K208 (Onboarding) complete + K211 (FocusShell) complete
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md` (Pawn's UI/UX audit)
## Complexity: VERY HIGH — Most complex domain in the platform

---

## CONTEXT

Currency is the economic engine of Liana Banyan — three currencies (Credits, Marks, Joules) plus Medallions, LB Card, escrow, and the full Stripe integration. In v1 this was scattered across lb_card, financial, and connect_payouts domains with massive duplication (9 checkout functions with ~700 lines of shared boilerplate). v2 consolidates all of it.

**K204 found a LIVE BUG**: EarningsDashboard shows withdrawal fee at 20%, should be 16.7% (Cost+20% means platform takes 16.67%, creator keeps 83.3%). Fix this during migration.

---

## V1 INVENTORY (from deep audit)

### Tables (15+ across 30+ migrations)
**Credits**: user_credits, credit_transactions, credit_matches, credit_withdrawals
**Marks**: user_marks, marks_transactions, shadow_marks
**Joules**: user_joules, joules_transactions, matchtrade_joules_collateral
**Medallions**: medallion_eligibility, medallion_mint_batches, medallion_designs, medallion_production_orders, member_medallion_collection
**LB Card**: lb_card, lb_card_transactions, lb_card_loads, lb_card_pins, transaction_ledger
**Connect**: member_connect_accounts, member_payouts

### Edge Functions (27+)
**Credits**: create-credit-checkout, process-credit-match, verify-credit-payment
**Medallions**: mint-medallions
**Marks**: process-marks-payback
**Escrow**: process-roommate-escrow
**LB Card**: create-lb-card, create-lb-cardholder, update-lb-card-controls, fund-lb-card
**Stripe/Checkout (9 DUPLICATED)**: create-checkout-session, create-subscription-checkout, create-menu-checkout, create-preorder-checkout, create-guild-stake-checkout, create-credit-checkout, create-membership-checkout, stripe-create-checkout-session, create-lb-card
**Stripe Connect**: stripe-express-create, connect-payout, request-payout, payout-webhook, verify-connect
**Webhooks**: handle-stripe-webhook, handle-membership-webhook, handle-shopping-webhook
**Other**: withdrawal-request, revenue-transparency, mercury-sync, mercury-balance

### Pages (9 currency-specific + 28 financial)
**Currency**: BuyCreditsPage, CreditPurchaseSuccess, EarmarkCredits, PayoutsPage, WarChestPage, WildfireRunsPage, Withdraw
**Financial**: EarningsDashboard, TransparencyLedger + 26 more

### Components (20+)
CreditPurchaseModal, CreditBalanceHeader, CreditSymbol, CreditWalletWidget, RequireCredits, JouleToC20Converter, BackerPledgeEscrow, MedallionBadge, MedallionDesignConfigurator, MedallionMintingManager, MedallionProductionTracker, MedallionUserCard, MedallionQRVerification, MedallionFundingExplainer, ShipMedallion + more

### Hooks (3)
useBuyCredits, useCreditWallet, useCanonicalStats

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/currency/
├── pages/
│   ├── WalletPage.tsx            # Unified wallet: Credits, Marks, Joules (AppShell)
│   ├── BuyCreditsPage.tsx        # Credit purchase flow (FocusShell)
│   ├── CreditSuccessPage.tsx     # Purchase confirmation (FocusShell)
│   ├── EarmarkPage.tsx           # Credit earmarking (AppShell)
│   ├── WithdrawPage.tsx          # Withdrawal request (AppShell)
│   ├── PayoutsPage.tsx           # Payout history + Stripe Connect (AppShell)
│   ├── TransparencyLedgerPage.tsx # Public transparency ledger (FocusShell)
│   ├── LBCardPage.tsx            # LB Card management (AppShell)
│   ├── WarChestPage.tsx          # WarChest (Joules vault) (AppShell)
│   ├── MedallionPage.tsx         # Medallion collection + minting (AppShell)
│   └── EarningsDashboardPage.tsx # Creator earnings overview (AppShell)
├── components/
│   ├── CreditBalance.tsx         # Balance display (Credits/Marks/Joules)
│   ├── CreditWalletWidget.tsx    # Compact wallet widget for sidebars
│   ├── CurrencyConverter.tsx     # Joule↔C20 conversion display
│   ├── RequireCredits.tsx        # Access gating by credit balance
│   ├── MedallionCard.tsx         # Medallion display card
│   ├── MedallionMinter.tsx       # Minting interface
│   ├── LBCardWidget.tsx          # LB Card status widget
│   ├── EscrowDisplay.tsx         # Escrow hold visualization
│   ├── TransactionRow.tsx        # Reusable transaction line item
│   └── WithdrawalFeeDisplay.tsx  # Shows 16.67% platform fee (FIX THE BUG)
├── hooks/
│   ├── useWallet.ts              # UNIFIED wallet hook (Credits + Marks + Joules)
│   ├── useCredits.ts             # Credit-specific operations
│   ├── useMarks.ts               # Marks operations (earned, pledged, backed)
│   ├── useJoules.ts              # Joules operations (collateral, vault)
│   ├── useMedallions.ts          # Medallion collection + minting
│   ├── useLBCard.ts              # LB Card operations
│   ├── usePayouts.ts             # Stripe Connect payouts
│   └── useEscrow.ts              # Escrow management
├── lib/
│   ├── currencyTypes.ts          # All currency TypeScript types
│   ├── currencyConstants.ts      # PLATFORM_FEE = 0.1667, CREATOR_KEEPS = 0.833
│   ├── checkoutService.ts        # ONE consolidated checkout (replaces 9 duplicates)
│   ├── stripeConnect.ts          # Stripe Connect helper
│   ├── mercurySync.ts            # Mercury bank integration
│   └── medallionService.ts       # Medallion minting + production
├── routes.tsx
└── index.ts
```

---

## CRITICAL DESIGN DECISIONS

### 1. ONE Checkout Function (replaces 9)
v1 has 9 nearly-identical checkout edge functions with ~700 lines of duplicated Stripe boilerplate. v2 consolidates to ONE:

```typescript
// lib/checkoutService.ts
export async function createCheckout(params: {
  type: 'credit' | 'membership' | 'menu' | 'preorder' | 'guild_stake' | 'subscription' | 'lb_card';
  amount: number;
  currency: 'usd' | 'credits' | 'marks';
  metadata: Record<string, string>;
}) { ... }
```

Single edge function: `create-checkout` handles ALL types via the `type` param.

### 2. Fix the Withdrawal Fee Bug
```typescript
// lib/currencyConstants.ts
export const PLATFORM_MARGIN = 0.20;        // Cost + 20%
export const PLATFORM_FEE_PCT = 16.67;      // NOT 20%
export const CREATOR_KEEPS_PCT = 83.33;     // NOT 80%
export const ON_500_TRANSACTION = 416.67;   // $500 × 83.33%
```

EarningsDashboard must show 16.67% platform fee, NOT 20%.

### 3. Three-Currency Architecture
- **Credits** ($1 = 1 Credit): One-way valve. NEVER cash out to fiat. Irrevocable.
- **Marks** (effort-differential): Backed Marks (Joule-collateral, governance) + Pledged Marks (escrowed per-project). Sponsorship ONE LEVEL ONLY.
- **Joules** (surplus/"forever stamp"): Locked value. One-way valve from surplus.

### 4. FocusShell Pages Follow Pawn's Design Spec
BuyCreditsPage (FocusShell) and TransparencyLedgerPage (FocusShell) must use HeroStage, HeroActions, HeroProof shared components. Hero owns the viewport. No floating widgets. See `FOCUS_SHELL_DESIGN_SPEC.md`.

### 5. LB Card Is Blocked
DD-2 (LB Card/Stripe) is BLOCKED on external approval. Build the interface but gate it behind a feature flag. Don't build the actual card issuance integration — just the UI shell.

### 5. Medallion Sponsorship (NOT WWWWW)
The old name is dead. It's Medallion Sponsorship. ONE LEVEL ONLY. Not MLM.

---

## BUILD STEPS

1. Read all 15+ table schemas via Librarian
2. Design clean v2 schema: `00003_v2_currency.sql` — consolidate, normalize, remove duplication
3. Build the ONE checkout edge function (replaces 9)
4. Build pages (11) with proper shells
5. Build hooks (8) — useWallet is the key unifier
6. Wire routes
7. Export public API: `useWallet`, `useCredits`, `RequireCredits`, `CreditBalance`, `currencyRoutes`

---

## IMPORTS FROM MEMBERSHIP

```tsx
import { useMembership } from '../membership';
```

Currency operations require active membership check.

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

**Every session must end with this.** No exceptions.

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/wallet` shows unified Credits/Marks/Joules view
3. `/buy-credits` shows purchase flow
4. EarningsDashboard shows **16.67%** platform fee (NOT 20%)
5. No hardcoded checkout functions — all go through `checkoutService.ts`
6. `get_migration_status("currency")` shows v2 pages > 0
7. Librarian indexes rebuilt

---

## SEC REMINDER
- Credits are NOT securities. Never use "equity", "shares", "dividends", "ROI", "invest"
- Use "participation", "allocation", "contribution", "back"
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- No passive income language. No "will earn" promises.

---

*Bishop B056 — v2 Currency Domain*
*3 currencies. 1 checkout. Fix the 16.67% bug. Kill the 9 duplicates.*
*FOR THE KEEP!*
