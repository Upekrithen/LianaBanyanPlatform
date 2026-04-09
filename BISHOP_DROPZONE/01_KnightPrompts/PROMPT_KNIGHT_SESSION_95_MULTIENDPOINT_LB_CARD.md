# KNIGHT SESSION 95 — Multi-Endpoint Webhook Architecture + LB Card Foundation
## Bishop 031 | March 23, 2026
## Innovation Count: 1,938
## Based on: K94 (Membership Stripe + Coalition), K80 (Commerce Engine), K76 spec (LB Card)

---

## MISSION

Build the transaction classification engine and the LB Card foundation. Every payment type gets its own webhook endpoint writing to its own ledger category. The LB Card gets its database schema, UI, and War Chest dashboard — provider-agnostic so we can plug in Stripe Issuing, Unit, or Lithic when the card provider is resolved.

**Previous session**: K94 built $5 Membership Stripe Checkout + Coalition Dashboard. 699 files. 22 production systems. Webhook handler deployed for membership payments.

**Why this matters now**: Subchapter T requires clean separation of patronage vs non-patronage income. If all payments route through one webhook, we're commingling on arrival. Multiple endpoints = clean accounting from the source, not reconciliation after the fact. The Bylaws V2 (Section 14.03) requires this architecture.

---

## CONTEXT: EXISTING STRIPE INFRASTRUCTURE

| Component | Status | Location |
|-----------|--------|----------|
| `stripe-webhook` | LIVE (K80) | Storefront purchases — Commerce Engine |
| `handle-membership-webhook` | LIVE (K94) | $5 Access Key payments |
| `create-membership-checkout` | LIVE (K94) | Creates membership checkout sessions |
| `create-checkout` | LIVE (K80) | Creates storefront checkout sessions |
| `distribute-order-earnings` | LIVE (K80) | 83.3% creator / 13.3% LB / 3.3% Gleaner's |
| Stripe Checkout | LIVE | Payment collection |
| Stripe Issuing | BLOCKED | Not activated — card provider TBD |

---

## TASK 1: Migration — Multi-Endpoint Ledger + LB Card Schema

**File**: `supabase/migrations/20260323000027_multiendpoint_lb_card.sql`

```sql
-- ============================================
-- MIGRATION: 20260323000027_multiendpoint_lb_card.sql
-- Knight Session 95: Multi-Endpoint Webhooks + LB Card
-- ============================================

-- =============================================
-- TRANSACTION CLASSIFICATION ENGINE
-- Each payment gets a ledger category at the webhook level
-- =============================================

CREATE TABLE IF NOT EXISTS transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Source identification
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_event_id TEXT UNIQUE, -- idempotency key
  -- Classification
  ledger_category TEXT NOT NULL CHECK (ledger_category IN (
    'membership',           -- $5 Access Key (patronage)
    'commerce_storefront',  -- Storefront purchases (patronage)
    'commerce_creator',     -- Creator's 83.3% share (expense)
    'commerce_platform',    -- LB's 13.3% (non-patronage revenue)
    'commerce_gleaners',    -- Gleaner's Corner 3.3% (charity — separate books)
    'project_funding',      -- 1/3 Funding Standard — First Third (patronage)
    'project_funder_credit',-- 1/3 Funding Standard — Second Third (patronage allocation)
    'project_seeding',      -- 1/3 Funding Standard — Third Third seeding (patronage)
    'project_platform_cap', -- 1/3 Funding Standard — LB capped 20% (non-patronage)
    'project_escrow',       -- Bounty escrow held funds
    'guild_payment',        -- Guild/initiative specific (patronage by initiative)
    'coalition_fee',        -- Coalition alliance fees (patronage)
    'housing_fund',         -- Housing contributions (separate subsidiary)
    'subscription',         -- Subscription tier payments (patronage)
    'card_funding',         -- LB Card funding events (cash domain)
    'card_transaction'      -- LB Card spending (cash domain)
  )),
  -- Financial
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  -- Parties
  payer_id UUID REFERENCES auth.users(id),
  payee_id UUID REFERENCES auth.users(id),
  storefront_id UUID,
  project_id UUID,
  initiative_id UUID,
  -- Subchapter T classification
  is_patronage BOOLEAN NOT NULL DEFAULT true,
  patronage_type TEXT CHECK (patronage_type IN ('purchase', 'labor', 'service', 'seeding', NULL)),
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'held')),
  -- Blockchain anchor
  blockchain_tx_hash TEXT,
  blockchain_anchored_at TIMESTAMPTZ,
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  webhook_source TEXT, -- which endpoint processed this
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transaction_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON transaction_ledger
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);
CREATE POLICY "Admin manages all" ON transaction_ledger
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_ledger_category ON transaction_ledger(ledger_category, created_at DESC);
CREATE INDEX idx_ledger_payer ON transaction_ledger(payer_id, created_at DESC);
CREATE INDEX idx_ledger_payee ON transaction_ledger(payee_id, created_at DESC);
CREATE INDEX idx_ledger_stripe ON transaction_ledger(stripe_event_id);
CREATE INDEX idx_ledger_project ON transaction_ledger(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_ledger_patronage ON transaction_ledger(is_patronage, ledger_category);

-- Patronage vs Non-Patronage summary view (for Subchapter T annual reporting)
CREATE OR REPLACE VIEW ledger_patronage_summary AS
SELECT
  EXTRACT(YEAR FROM created_at) AS fiscal_year,
  is_patronage,
  ledger_category,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_cents,
  SUM(amount_cents) / 100.0 AS total_dollars
FROM transaction_ledger
WHERE status = 'completed'
GROUP BY fiscal_year, is_patronage, ledger_category
ORDER BY fiscal_year DESC, is_patronage DESC, total_cents DESC;

-- Per-member patronage summary (for annual allocation calculation)
CREATE OR REPLACE VIEW member_patronage_summary AS
SELECT
  COALESCE(payer_id, payee_id) AS member_id,
  EXTRACT(YEAR FROM created_at) AS fiscal_year,
  patronage_type,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_cents,
  SUM(amount_cents) / 100.0 AS total_dollars
FROM transaction_ledger
WHERE status = 'completed' AND is_patronage = true
GROUP BY member_id, fiscal_year, patronage_type;

-- =============================================
-- LB CARD SYSTEM (Cash Domain — Two-Domain Architecture)
-- Innovation #1758 + #1911
-- Provider-agnostic: works with Stripe Issuing, Unit, or Lithic
-- =============================================

CREATE TABLE IF NOT EXISTS lb_cardholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  -- Provider fields (filled when card provider is connected)
  provider TEXT DEFAULT 'pending' CHECK (provider IN ('pending', 'stripe', 'unit', 'lithic')),
  provider_cardholder_id TEXT,
  -- Card balance (CASH, not Credits — Two-Domain Architecture)
  card_balance_cents INTEGER NOT NULL DEFAULT 0,
  -- Controls
  spending_limit_daily_cents INTEGER DEFAULT 500000, -- $5,000
  spending_limit_monthly_cents INTEGER DEFAULT 5000000, -- $50,000
  is_frozen BOOLEAN DEFAULT false,
  frozen_reason TEXT,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lb_cardholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cardholder" ON lb_cardholders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manages cardholders" ON lb_cardholders FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS lb_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  provider_card_id TEXT,
  card_type TEXT DEFAULT 'virtual' CHECK (card_type IN ('virtual', 'physical')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'frozen', 'cancelled')),
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lb_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cards" ON lb_cards FOR SELECT USING (
  cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
);
CREATE POLICY "Admin manages cards" ON lb_cards FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS lb_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES lb_cards(id),
  provider_authorization_id TEXT,
  amount_cents INTEGER NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'reversed')),
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lb_card_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own card txns" ON lb_card_transactions FOR SELECT USING (
  card_id IN (
    SELECT lc.id FROM lb_cards lc
    JOIN lb_cardholders lch ON lc.cardholder_id = lch.id
    WHERE lch.user_id = auth.uid()
  )
);
CREATE POLICY "Admin manages card txns" ON lb_card_transactions FOR ALL USING (public.is_admin());

-- Card funding events (how cash arrives on the card)
CREATE TABLE IF NOT EXISTS lb_card_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  amount_cents INTEGER NOT NULL,
  funding_type TEXT NOT NULL CHECK (funding_type IN (
    'delivery_fee', 'creator_share', 'bounty_payout',
    'substitution', 'project_payment', 'manual_admin'
  )),
  source_description TEXT,
  related_order_id UUID,
  related_project_id UUID,
  ledger_entry_id UUID REFERENCES transaction_ledger(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lb_card_funding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own funding" ON lb_card_funding FOR SELECT USING (
  cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
);
CREATE POLICY "Admin manages funding" ON lb_card_funding FOR ALL USING (public.is_admin());

-- =============================================
-- WAR CHEST (Cooperative Domain tracking — eligible Marks)
-- =============================================

CREATE TABLE IF NOT EXISTS mark_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID,
  marks_earned NUMERIC(12,2) NOT NULL,
  work_description TEXT,
  is_funded BOOLEAN DEFAULT false,
  funded_at TIMESTAMPTZ,
  eligible_amount NUMERIC(12,2) DEFAULT 0,
  allocated_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mark_work_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own records" ON mark_work_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manages records" ON mark_work_records FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS war_chest_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  source_work_record_id UUID NOT NULL REFERENCES mark_work_records(id),
  allocation_type TEXT NOT NULL CHECK (allocation_type IN ('substitution', 'sponsorship', 'commission')),
  amount NUMERIC(12,2) NOT NULL,
  target_project_id UUID,
  cash_paid_cents INTEGER,
  saa_earned NUMERIC(12,2),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE war_chest_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own allocations" ON war_chest_allocations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin manages allocations" ON war_chest_allocations FOR ALL USING (public.is_admin());

-- War Chest summary view
CREATE OR REPLACE VIEW war_chest_summary AS
SELECT
  user_id,
  SUM(marks_earned) AS total_marks_earned,
  SUM(CASE WHEN is_funded THEN eligible_amount ELSE 0 END) AS total_eligible,
  SUM(allocated_amount) AS total_allocated,
  SUM(CASE WHEN is_funded THEN eligible_amount - allocated_amount ELSE 0 END) AS available_eligible
FROM mark_work_records
GROUP BY user_id;

-- =============================================
-- CARD PROVIDER FEATURE FLAGS
-- =============================================

-- Reuse founder_feature_flags if it exists, otherwise create
CREATE TABLE IF NOT EXISTS founder_feature_flags (
  feature_key TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  notes TEXT
);

INSERT INTO founder_feature_flags (feature_key, is_enabled, notes) VALUES
  ('lb_card_enabled', false, 'Enable when card provider is connected'),
  ('lb_card_provider', false, 'Current provider: pending (stripe/unit/lithic)'),
  ('war_chest_substitution', true, 'LIVE — clean 1099-NEC for labor'),
  ('war_chest_sponsorship', true, 'LIVE — SAA is non-transferable governance'),
  ('war_chest_commission', false, 'GRAYED OUT — constructive receipt needs counsel')
ON CONFLICT (feature_key) DO NOTHING;
```

---

## TASK 2: Webhook Router — Central Classification Layer

**File**: `supabase/functions/webhook-router/index.ts`

A utility module imported by ALL webhook handlers. Ensures every transaction gets classified and logged to `transaction_ledger`.

```typescript
// supabase/functions/_shared/ledgerWriter.ts
// Shared utility — import from any webhook handler

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface LedgerEntry {
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  stripe_event_id: string;
  ledger_category: string;
  amount_cents: number;
  currency?: string;
  payer_id?: string;
  payee_id?: string;
  storefront_id?: string;
  project_id?: string;
  initiative_id?: string;
  is_patronage: boolean;
  patronage_type?: string;
  status?: string;
  description?: string;
  metadata?: Record<string, any>;
  webhook_source: string;
}

export async function writeLedgerEntry(entry: LedgerEntry) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Idempotency: skip if event already processed
  const { data: existing } = await supabaseAdmin
    .from('transaction_ledger')
    .select('id')
    .eq('stripe_event_id', entry.stripe_event_id)
    .single();

  if (existing) {
    return { skipped: true, id: existing.id };
  }

  const { data, error } = await supabaseAdmin
    .from('transaction_ledger')
    .insert({
      ...entry,
      currency: entry.currency || 'usd',
      status: entry.status || 'completed',
      metadata: entry.metadata || {},
    })
    .select('id')
    .single();

  if (error) throw error;
  return { skipped: false, id: data.id };
}

export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
  stripe: any
): any {
  return stripe.webhooks.constructEvent(body, signature, secret);
}
```

**IMPORTANT**: Knight should create a `supabase/functions/_shared/` directory for this shared module. All webhook handlers import from `../_shared/ledgerWriter.ts`.

---

## TASK 3: Update Existing Webhooks to Write Ledger Entries

### 3A: Update `stripe-webhook` (Commerce Engine — K80)

After existing `distribute-order-earnings` logic, add ledger entries:

```typescript
// After distributing earnings, write to transaction_ledger:
import { writeLedgerEntry } from '../_shared/ledgerWriter.ts';

// Creator's share
await writeLedgerEntry({
  stripe_event_id: `${event.id}_creator`,
  ledger_category: 'commerce_creator',
  amount_cents: Math.round(creatorShareDollars * 100),
  payer_id: customerId,
  payee_id: creatorId,
  storefront_id: storefrontId,
  is_patronage: false, // expense, not patronage income
  description: `Creator share: ${creatorShareDollars}`,
  webhook_source: 'stripe-webhook',
});

// Platform share
await writeLedgerEntry({
  stripe_event_id: `${event.id}_platform`,
  ledger_category: 'commerce_platform',
  amount_cents: Math.round(platformShareDollars * 100),
  payer_id: customerId,
  is_patronage: false, // non-patronage revenue
  description: `Platform share: ${platformShareDollars}`,
  webhook_source: 'stripe-webhook',
});

// Gleaner's Corner
await writeLedgerEntry({
  stripe_event_id: `${event.id}_gleaners`,
  ledger_category: 'commerce_gleaners',
  amount_cents: Math.round(gleanersShareDollars * 100),
  payer_id: customerId,
  is_patronage: false, // charity — separate books
  description: `Gleaner's Corner: ${gleanersShareDollars}`,
  webhook_source: 'stripe-webhook',
});

// Full purchase (patronage record for the buying member)
await writeLedgerEntry({
  stripe_event_id: `${event.id}_purchase`,
  ledger_category: 'commerce_storefront',
  amount_cents: Math.round(totalDollars * 100),
  payer_id: customerId,
  storefront_id: storefrontId,
  is_patronage: true,
  patronage_type: 'purchase',
  description: `Storefront purchase`,
  webhook_source: 'stripe-webhook',
});
```

### 3B: Update `handle-membership-webhook` (K94)

After existing membership activation logic, add:

```typescript
await writeLedgerEntry({
  stripe_event_id: event.id,
  stripe_session_id: session.id,
  stripe_payment_intent: session.payment_intent as string,
  ledger_category: 'membership',
  amount_cents: 500, // $5.00
  payer_id: userId,
  is_patronage: true,
  patronage_type: 'purchase',
  description: 'Access Key — annual membership',
  webhook_source: 'handle-membership-webhook',
});
```

---

## TASK 4: LB Card UI — Provider-Agnostic

### 4A: `src/pages/LBCardPage.tsx` — Card Management

**NOTE**: If LBCardPage already exists from a prior session, UPDATE it. Don't create a duplicate.

The page should show:

**State 1: No Card (card provider not connected / feature flag off)**
```
┌─────────────────────────────────────────┐
│  LB Card — Coming Soon                  │
│                                         │
│  The LB Card lets you spend earnings    │
│  from the cooperative at local          │
│  businesses. Purchase-only. No ATM.     │
│  No cash-out.                           │
│                                         │
│  Your earnings are tracked and ready.   │
│  Cards will be available soon.          │
│                                         │
│  [Learn More About the LB Card]         │
└─────────────────────────────────────────┘
```

Check `founder_feature_flags` → `lb_card_enabled`. If false, show State 1.

**State 2: Card Active**
```
┌─────────────────────────────────────┐
│  LIANA BANYAN                       │
│  COOPERATIVE                        │
│                                     │
│  •••• •••• •••• 4242               │
│  EXP 03/28                          │
│                                     │
│  JONATHAN JONES                     │
│                                     │
│  Cash Balance: $47.50               │
│  ───────────────────                │
│  [Reveal Details] [Freeze] [Settings]│
└─────────────────────────────────────┘
```

Card visual: Navy (`#1A1F36`) background, gold text (`#D4A843`), white details.

Below the card:
- **Recent Transactions** — list from `lb_card_transactions`, sorted by date DESC
- **Funding History** — list from `lb_card_funding`, sorted by date DESC
- Each shows amount, merchant/source, date, status badge

### 4B: `src/components/LBCardSettings.tsx`

- Daily spending limit slider ($100-$10,000)
- Monthly spending limit slider ($500-$50,000)
- Freeze/Unfreeze toggle (big red button)
- Card status display

### 4C: `src/pages/WarChestPage.tsx` — War Chest Dashboard

**NOTE**: If WarChestPage already exists, UPDATE it with real data.

```
┌─────────────────────────────────────────┐
│  Your War Chest                         │
│  ───────────────────                    │
│  Total Marks Earned: 10,000             │
│  Eligible: 7,000                        │
│    Allocated: 3,500                     │
│    Available: 3,500                     │
│  Not Yet Eligible: 3,000                │
│    (from unfunded projects)             │
│  ───────────────────                    │
│  Deploy Your War Chest:                 │
│  ───────────────────                    │
│  [Get Paid]      ACTIVE                 │
│   Substitute eligible Marks for cash    │
│                                         │
│  [Sponsor]       ACTIVE                 │
│   Sponsor other projects,              │
│   earn IP governance (SAA)              │
│                                         │
│  [Commission]    COMING SOON            │
│   Fund bounties on your own project     │
│   (pending tax counsel)                 │
└─────────────────────────────────────────┘
```

Wire to `war_chest_summary` view. Check `founder_feature_flags` for each War Chest feature.

Substitution and Sponsorship: Show modal with amount input, confirmation, execute. Commission: Grayed out with tooltip explaining it needs tax counsel.

---

## TASK 5: Ledger Dashboard — Financial Transparency

### `src/pages/FinancialTransparencyPage.tsx` — UPDATE existing page

Add a new tab or section: **"Transaction Ledger"**

Shows the `ledger_patronage_summary` view:
- Patronage income total (all categories where `is_patronage = true`)
- Non-patronage income total (all categories where `is_patronage = false`)
- Charity total (Gleaner's Corner)
- Per-category breakdown with bar chart

This is the Subchapter T compliance dashboard. Board members can see:
- Are we below the 50% non-patronage threshold?
- What's the patronage pool available for allocation?
- Which initiatives are generating the most patronage activity?

Admin-only section. Check `is_admin()`.

---

## TASK 6: Routes + Navigation

### Routes

Add/verify in `App.tsx`:
```
/dashboard/lb-card → LBCardPage (if not already routed)
/dashboard/war-chest → WarChestPage (if not already routed)
```

### Sidebar

Ensure these exist in the sidebar:
- "LB Card" with `CreditCard` icon → `/dashboard/lb-card`
- "War Chest" with `Shield` icon → `/dashboard/war-chest`

---

## TASK 7: Update Stats

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,938** (unchanged — infrastructure session)

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260323000027_multiendpoint_lb_card.sql` | Ledger + LB Card + War Chest tables |
| `supabase/functions/_shared/ledgerWriter.ts` | Shared ledger writing utility |
| `src/components/LBCardSettings.tsx` | Card controls (if not exists) |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `supabase/functions/stripe-webhook/index.ts` | Add ledger entries for commerce splits |
| `supabase/functions/handle-membership-webhook/index.ts` | Add ledger entry for membership |
| `src/pages/LBCardPage.tsx` | Update with real schema, provider-agnostic states |
| `src/pages/WarChestPage.tsx` | Wire to real war_chest_summary view |
| `src/pages/FinancialTransparencyPage.tsx` | Add ledger dashboard section |
| `src/App.tsx` | Verify routes exist |
| `src/components/AppSidebar.tsx` | Verify sidebar links exist |

## DO NOT TOUCH

- Red Carpet / Slingshot (K93) | Coalition (K94) | ADAPT Score (K92)
- Front Door core flow (K91) | Star Chamber (K79/K80) | MoneyPenny (K84)
- Calendar (K82) | Beacon (K75/K82) | Treasure Map (K81)
- Vehicle files (K85) | Political Expedition (K86) | Design Pipeline (K87)
- Ghost World (K88) | Housing (K89) | Congress API (K90)

---

## SECURITY REQUIREMENTS

1. **Idempotency**: Every webhook checks `stripe_event_id` before writing. No duplicate ledger entries.
2. **Domain separation**: LB Card tables have NO foreign keys to credit tables. Cash domain and cooperative domain are hermetically sealed.
3. **Purchase-only**: When card provider is connected, block `cash_advance` and `atm` merchant categories.
4. **Rate limiting**: Card detail reveal: 3/hour. Substitution: 5/day. Sponsorship: 10/day.
5. **Auto-freeze**: 5 declines in 1 hour → freeze card + notify.
6. **Audit trail**: Every ledger entry has `webhook_source` and `stripe_event_id`.

---

## BUILD ORDER

```
Migration (ledger + LB Card + War Chest tables) — FIRST
  ↓
Shared utility (_shared/ledgerWriter.ts)
  ↓
Update stripe-webhook (add ledger entries) — CAREFUL: don't break existing flow
  ↓
Update handle-membership-webhook (add ledger entry)
  ↓
LB Card UI (provider-agnostic — "Coming Soon" state)
  ↓
War Chest dashboard (wire to real views)
  ↓
Financial Transparency ledger section
  ↓
Routes + nav verification
  ↓
Stats
```

---

## DEPLOY CHECKLIST

1. `npx supabase db push --project-ref ruuxzilgmuwddcofqecc` (migration 000027)
2. `npx supabase functions deploy stripe-webhook --project-ref ruuxzilgmuwddcofqecc`
3. `npx supabase functions deploy handle-membership-webhook --project-ref ruuxzilgmuwddcofqecc`
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main -P default`
6. Test: Make a storefront purchase → verify `transaction_ledger` has 4 entries (purchase, creator, platform, gleaners)
7. Test: $5 membership → verify `transaction_ledger` has 1 entry (membership)
8. Test: LB Card page shows "Coming Soon" (feature flag off)
9. Test: War Chest page loads with zero data
10. Test: Financial Transparency shows ledger summary (admin only)
11. Test: No duplicate entries on webhook retry
12. Zero console errors

---

## WHAT THIS ENABLES (K96+)

Once K95 is deployed:
- **K96**: 1/3 Funding Standard implementation (project funding webhook + escrow)
- **K97**: Card provider integration (when Stripe/Unit/Lithic is resolved)
- **K98**: Stripe Connect (connected accounts for creators — direct payouts)

The ledger is the foundation. Every future payment type plugs into the same classification engine. Clean Subchapter T books from day one.

---

## SESSION WEIGHT: HEAVY

New shared utility, major migration (3 table groups + views), updates to 2 existing webhook handlers, 3 frontend updates. But the architecture is clean and the changes to existing webhooks are additive (no breaking changes).

---

**Every dollar classified at arrival. Every category auditable. Every payment traceable. The cooperative's books are clean from the first transaction.**

**FOR THE KEEP.**
