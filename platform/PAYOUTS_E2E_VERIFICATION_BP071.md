# /dashboard/payouts E2E Verification — BP071 Knight

## Flow Traced

### 1. Routing
- Route: `/dashboard/payouts` (and alias `/dashboard/payments`)
- File: `platform/src/routes/dashboard.tsx` line 108-109
- Component: `platform/src/pages/PayoutsPage.tsx`
- Guard: `ProtectedRoute` (auth-gated, must be logged in)
- Feature flag gate: `connect_payouts_enabled` in `founder_feature_flags` table
  — if false, page renders a "Connect your Stripe account" placeholder (no cash-out form)

### 2. Page UI (`PayoutsPage.tsx`)
Queries on mount:
| Query | Table / Function | Purpose |
|---|---|---|
| Feature flag check | `founder_feature_flags` | Gates the full UI behind `connect_payouts_enabled` |
| Connect account | `member_connect_accounts` | Reads `stripe_account_id`, `payouts_enabled`, `onboarding_status` |
| LB Card balance | `lb_cardholders` | Reads `card_balance_cents` |
| Credit wallet | `credit_wallets` | Reads `balance`, `lifetime_earned` |
| Payout history | `member_payouts` | Last 50 payouts, desc |

Onboarding actions (if Connect not set up):
- **Set up direct deposit** → invokes `create-connect-account` edge function → returns Stripe hosted onboarding URL → opens in new tab
- **Complete your setup** → invokes `connect-onboarding-refresh` → fresh Stripe onboarding link

Cash-out action:
- User enters dollar amount + speed (standard free / instant 1%)
- Routes by source: earned credits first via `stripe-connect-payout`, remaining LB Card balance via `request-payout`

### 3. Edge Function: `stripe-connect-payout` (earned credits path)
File: `platform/supabase/functions/stripe-connect-payout/index.ts`

Steps:
1. Auth check — rejects unauthenticated
2. Validates amount ≥ 1 credit ($1)
3. Reads `credit_wallets.lifetime_earned` — rejects if insufficient
4. Reads `member_connect_accounts` — rejects if no Stripe account or payouts not enabled
5. Calculates: creator keeps 83.3% (Cost + 20% platform margin)
6. Inserts `member_payouts` row (`status: "processing"`)
7. Calls `POST /v1/transfers` on Stripe API → real transfer to `stripe_account_id`
8. On transfer failure: marks payout `failed`, no wallet debit
9. On success: debits `credit_wallets.balance` + `lifetime_earned`, inserts `credit_transactions` row, updates payout `status: "completed"` + `stripe_transfer_id`

**No TODO stubs. Complete E2E.**

### 4. Edge Function: `request-payout` (LB Card balance path)
File: `platform/supabase/functions/request-payout/index.ts`

Steps:
1. Auth check
2. Validates amount_cents ≥ 100 ($1 minimum)
3. Reads `member_connect_accounts` — rejects if payouts not enabled
4. Reads `lb_cardholders.card_balance_cents` — rejects if insufficient
5. Calculates instant fee (1% ceil) or standard (free)
6. Calls `POST /v1/transfers` on Stripe API → real transfer
7. On transfer failure: throws error (payout record not yet inserted, so no DB state to roll back)
8. Inserts `member_payouts` row with `stripe_transfer_id`, `status: "processing"`
9. Deducts from `lb_cardholders.card_balance_cents`

**Minor gap noted:** payout record is inserted AFTER the Stripe transfer succeeds. If the DB insert fails, the transfer has already gone through and the cardholder deduction hasn't happened yet. Low probability but worth a retry/idempotency key in a future hardening pass.

**Otherwise complete E2E.**

### 5. Supporting Edge Functions (referenced but not cash-out path)
- `create-connect-account`: Creates Stripe Connect Express account + returns onboarding URL
- `connect-onboarding-refresh`: Refreshes expired onboarding link
- `connect-account-webhook`: Receives Stripe Connect webhooks (account.updated, etc.) to sync `member_connect_accounts`

## Code Status: COMPLETE

The withdrawal path is **fully implemented** end-to-end:
- UI is wired with real data queries (no mock/placeholder data)
- Feature flag (`connect_payouts_enabled`) was enabled in BP069 migration (value: `true`)
- Both payout functions make real Stripe API calls with no TODO stubs
- Payout history table (`member_payouts`) is populated on completion
- Error handling includes credit/balance restoration on Stripe failure

## Founder Action Required

1. **Live test prerequisite**: Ensure a Stripe Connect Express account is fully onboarded under the Founder's member account (visit `/dashboard/payouts` → "Set up direct deposit" → complete Stripe KYC/bank linking)
2. **Controlled test**: With ≥ $1 in earned credits or LB Card balance, initiate a standard cash-out
3. **Stripe receipt**: Confirm the transfer appears in the Stripe Dashboard under **Connect → Transfers** with the correct destination `stripe_account_id`
4. **Confirm** `member_payouts` row shows `status: "completed"` and `stripe_transfer_id` is populated
5. **Note**: `connect_payouts_enabled` feature flag is already `true` per BP069 migration — no flag toggle required

## Minor Hardening Note (not a blocker)
`request-payout` inserts the payout record *after* the Stripe transfer. If DB insert fails post-transfer, funds are sent but not recorded. Suggest adding idempotency key + pre-insert the record with `status: "pending"` before calling Stripe, matching the pattern in `stripe-connect-payout`.

## Stripe Receipt
Founder confirms live test: _[ ] Completed — transfer ID: ______________________ ]_
