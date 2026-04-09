# KNIGHT SESSION 121: Stripe Billing — Subscriptions, Credit Purchases, and Creator Payouts

## Brief
Call `brief_me("stripe billing, subscriptions, credit purchases, creator payouts, membership payment")`

## Context
K116-K117 deployed (Turn-Key + Red Carpet). K118-K120 queued. K120 laid the foundation for Stripe Connect (migration + Edge Functions). K121 wires REAL MONEY through the platform. This is the session that makes Credits worth $1, memberships worth $5/year, and creator payouts real.

Without this session, everything is a demo. After this session, money flows.

Canonical stats: 2,000 innovations | 1,511 claims | 10 provisionals | 22 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Credits are prepaid store credit ($1=1). Memberships are annual subscriptions. Payouts are product revenue minus platform margin. Never use investment language.

## Deliverable 1: Stripe Product + Price Configuration

### Supabase Edge Function: `stripe-setup-products`
One-time setup function that creates Stripe Products and Prices:

```
Product: "Liana Banyan Membership"
  Price: $5/year (recurring, annual)
  Price: $10/year (recurring, annual — Builder tier)
  Price: $25/year (recurring, annual — Patron tier)

Product: "Liana Banyan Credits"
  Price: $1/credit (one-time, quantity-based)
```

### Migration: `20260326000017_stripe_billing.sql`
```sql
-- Membership subscriptions
CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  
  -- Plan
  tier TEXT DEFAULT 'member' CHECK (tier IN ('free', 'member', 'builder', 'patron')),
  price_usd NUMERIC(10,2),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit wallet (running balance)
CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  balance INT DEFAULT 0,
  lifetime_purchased INT DEFAULT 0,
  lifetime_spent INT DEFAULT 0,
  lifetime_earned INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit transactions (ledger)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INT NOT NULL, -- positive = credit, negative = debit
  type TEXT NOT NULL CHECK (type IN ('purchase', 'backing', 'pledge', 'pledge_refund', 'payout', 'match', 'reward', 'transfer')),
  description TEXT,
  reference_id UUID, -- project_id, escrow_id, etc.
  stripe_payment_intent_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription" ON membership_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own wallet" ON credit_wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Initialize wallet for existing users
INSERT INTO credit_wallets (user_id, balance)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

## Deliverable 2: Supabase Edge Functions

### `stripe-create-checkout-session`
Creates a Stripe Checkout session for:
- **Membership signup**: redirects to Stripe-hosted checkout for $5/year subscription
- **Credit purchase**: redirects to Stripe-hosted checkout for X Credits at $1 each
- **Membership upgrade**: prorated upgrade from Member to Builder/Patron

Input: `{ type: 'membership' | 'credits', tier?: string, quantity?: number }`
Output: `{ url: string }` (Stripe Checkout URL)

### `stripe-create-portal-session`
Creates a Stripe Customer Portal session for:
- Viewing/updating subscription
- Updating payment method
- Canceling subscription
- Viewing invoice history

### `stripe-webhook`
Handles all Stripe webhook events:
- `checkout.session.completed` → Create/update subscription OR add Credits to wallet
- `invoice.paid` → Renew subscription period
- `invoice.payment_failed` → Mark subscription as past_due
- `customer.subscription.updated` → Sync tier changes
- `customer.subscription.deleted` → Mark as canceled
- `transfer.created` → Record creator payout

### `stripe-connect-payout`
Initiates a payout from platform to creator's Stripe Connect account:
- Calculates: total Credits earned - 20% platform margin = payout amount
- Creates Stripe Transfer to creator's connected account
- Records in `creator_payouts` table
- Debits from platform's Credit pool

## Deliverable 3: Membership Flow UI

### Page: `/membership` — Membership Tiers
```
┌────────────────────────────────────────────────────────────┐
│  Choose Your Membership                                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Explorer  │  │ Member   │  │ Builder  │  │ Patron  │    │
│  │   FREE    │  │  $5/yr   │  │  $10/yr  │  │ $25/yr  │   │
│  │           │  │          │  │          │  │          │   │
│  │ Browse    │  │ +Sell    │  │ +Priority│  │ +All     │   │
│  │ Buy       │  │ +Cue Card│  │ +Support │  │ +Patron  │   │
│  │           │  │ +TurnKey │  │ +Badge   │  │ +Letters │   │
│  │           │  │ +Map     │  │          │  │          │   │
│  │ [Current] │  │ [Join]   │  │ [Join]   │  │ [Join]   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────────────────────────────────────────┘
```

On "Join" click → `stripe-create-checkout-session` → Stripe Checkout → redirect back with success/cancel

### Page: `/dashboard/membership` — Manage Membership
- Current tier + renewal date
- "Manage Subscription" → Stripe Customer Portal
- "Upgrade" → checkout session for higher tier
- Transaction history (Credit purchases, subscription charges)

### Components
- `MembershipTierCards.tsx` — The tier comparison grid
- `MembershipStatus.tsx` — Dashboard widget showing current tier + renewal
- `UpgradeButton.tsx` — Triggers Stripe Checkout for tier upgrade

### Hooks
- `useMembership()` — fetch current subscription status
- `useCreateCheckout(type, tier?, quantity?)` — mutation creating Checkout session
- `useManageSubscription()` — mutation creating Customer Portal session

## Deliverable 4: Credit Purchase + Wallet UI

### Page: `/buy-credits`
```
┌────────────────────────────────────────────┐
│  Buy Credits   ($1 = 1 Credit)             │
│                                            │
│  [10]  [25]  [50]  [100]  [250]  [Custom]  │
│                                            │
│  Your balance: 42 Credits                  │
│                                            │
│  [Buy 50 Credits — $50]                    │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │ Recent Purchases                  │      │
│  │ Mar 26 — 50 Credits ($50)   ✅   │      │
│  │ Mar 20 — 25 Credits ($25)   ✅   │      │
│  └──────────────────────────────────┘      │
└────────────────────────────────────────────┘
```

### Wallet Widget (appears on dashboard + project pages)
```
┌─────────────────┐
│ 💰 42 Credits   │
│ [Buy More]      │
└─────────────────┘
```

### Components
- `BuyCreditsPage.tsx` — Full purchase page with quantity selector
- `CreditWalletWidget.tsx` — Compact balance display + buy link
- `TransactionHistory.tsx` — Table of all Credit transactions
- `CreditBalanceHeader.tsx` — Shows balance in top nav bar

### Hooks
- `useCreditWallet()` — fetch wallet balance
- `useCreditTransactions()` — fetch transaction ledger
- `useBuyCredits(quantity)` — mutation creating Checkout session for Credits

## Deliverable 5: Creator Payout Dashboard

### Page: `/dashboard/earnings`
```
┌────────────────────────────────────────────────────┐
│  Your Earnings                                      │
│                                                     │
│  Available to withdraw: 1,240 Credits ($1,240)     │
│  Platform fee (20%): $310                          │
│  You receive: $930                                  │
│                                                     │
│  [Withdraw to Bank →]                               │
│                                                     │
│  Stripe Account: ✅ Connected                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Earnings by Project                           │  │
│  │ Leather Knife Sheath — 340 Credits earned     │  │
│  │ Terrain Set Alpha — 900 Credits earned        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Payout History                                │  │
│  │ Mar 15 — $500 — ✅ Completed                  │  │
│  │ Feb 28 — $300 — ✅ Completed                  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Components
- `EarningsSummary.tsx` — Total earnings, platform fee, net payout
- `ProjectEarningsBreakdown.tsx` — Per-project earnings table
- `PayoutHistoryTable.tsx` — List of past payouts with status
- `WithdrawButton.tsx` — Triggers payout to Stripe Connect account

### Hooks
- `useEarnings()` — fetch earnings summary
- `useProjectEarnings()` — fetch per-project breakdown
- `useRequestPayout()` — mutation to initiate withdrawal

## Deliverable 6: Integration Points

### Turn-Key Wizard → Credit Check
When creator backs their own project (matched funding), check wallet balance:
- Sufficient Credits → debit wallet, create backing record
- Insufficient Credits → prompt to buy more, link to /buy-credits

### Red Carpet Pledge → Wallet Debit
When community member pledges Credits to a showcased project:
- Check wallet balance
- Debit wallet → create escrow record
- On claim conversion: escrow converts to project backing

### Membership Gate
Certain actions require active membership:
- Creating a Turn-Key project → Member+ required
- Entering a contest → Member+ required
- Claiming a showcased project → Member+ required
- Backing a project → Explorer can back (no gate)

Show upgrade prompt when non-member tries gated action.

### Top Navigation → Credit Balance
Add `CreditBalanceHeader` to the main nav bar (next to user avatar):
```
[💰 42] [Avatar ▼]
```

## Deliverable 7: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/membership" element={<MembershipPage />} />
<Route path="/buy-credits" element={<ProtectedRoute><BuyCreditsPage /></ProtectedRoute>} />
<Route path="/dashboard/membership" element={<ProtectedRoute><MembershipDashboard /></ProtectedRoute>} />
<Route path="/dashboard/earnings" element={<ProtectedRoute><EarningsDashboard /></ProtectedRoute>} />
```

### Canonical Stats
- `innovationCount: 2000` (no change)

## Build + Deploy
Build and deploy all 8 hosting targets + Edge Functions.

**IMPORTANT:** Edge Functions must be deployed to Supabase separately from Firebase hosting. Use `supabase functions deploy` for each Edge Function.

## Quality Checks
- [ ] Membership signup creates Stripe Checkout session
- [ ] Successful payment creates subscription record
- [ ] Credit purchase adds to wallet balance
- [ ] Wallet balance displays in nav bar
- [ ] Transaction ledger records all Credit movements
- [ ] Creator earnings page shows correct amounts
- [ ] Payout triggers Stripe Transfer to connected account
- [ ] Membership gate blocks non-members from gated actions
- [ ] Turn-Key wizard checks wallet balance before backing
- [ ] Red Carpet pledge debits wallet + creates escrow
- [ ] All 8 Firebase targets deployed
- [ ] Edge Functions deployed to Supabase

## FOR THE KEEP.
