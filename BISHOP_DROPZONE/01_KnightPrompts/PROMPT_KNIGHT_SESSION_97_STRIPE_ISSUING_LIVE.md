# KNIGHT SESSION 97 — Stripe Issuing → LB Card (Go Live)
## Bishop 032 | March 24, 2026
## Innovation Count: 1,938
## Based on: K95 (Multi-Endpoint + LB Card Schema), K96 (Commerce Webhook + Ledger)
## Provider: **Stripe Issuing** (CONFIRMED ACTIVE on dashboard)

---

## MISSION

Wire Stripe Issuing into the existing LB Card infrastructure and flip the feature flag to LIVE. K95 built the schema + edge functions with Stripe Issuing API calls. K96 built the transaction ledger + commerce webhook. This session:

1. Adds provider-agnostic columns (so future providers can slot in without refactor)
2. Creates a shared adapter with **Stripe-only implementation** + typed interfaces for future providers
3. Connects `fund-lb-card` to actually move money (Stripe Issuing balance)
4. Adds ledger entries for card transactions
5. Flips `lb_card_enabled` to true — removes "Coming Soon"

**One provider. One session. Cards go live.**

---

## CONTEXT: WHAT'S ALREADY DEPLOYED

### Database Tables (migration `20260323000010_lb_card_and_war_chest.sql`)

| Table | Key Columns |
|-------|-------------|
| `lb_cardholders` | `id`, `user_id`, `stripe_cardholder_id`, `status`, `card_balance_cents`, `spending_limit_daily`, `spending_limit_monthly` |
| `lb_cards` | `id`, `cardholder_id`, `stripe_card_id`, `card_type`, `status`, `last_four`, `exp_month`, `exp_year` |
| `lb_card_transactions` | `id`, `card_id`, `stripe_authorization_id`, `amount_cents`, `merchant_name`, `merchant_category`, `status` |
| `lb_card_funding` | `id`, `cardholder_id`, `amount_cents`, `funding_type`, `source_description`, `stripe_transfer_id` |
| `transaction_ledger` | `stripe_event_id`, `ledger_category`, `amount_cents`, `is_patronage`, `webhook_source` |
| `founder_feature_flags` | `feature_key`, `is_enabled`, `notes` |

### Edge Functions (ALL DEPLOYED, all contain Stripe Issuing API calls)

| Function | Current State |
|----------|---------------|
| `create-lb-cardholder` | Creates `issuing/cardholders` via raw Stripe fetch |
| `create-lb-card` | Creates `issuing/cards` via raw Stripe fetch |
| `get-lb-card-details` | Retrieves card number/CVC via Stripe expand[] |
| `update-lb-card-controls` | Freeze/unfreeze/limits via raw Stripe fetch |
| `lb-card-webhook` | Handles 4 Issuing events, checks card_balance_cents |
| `fund-lb-card` | DB-only — updates card_balance_cents. Does NOT call Stripe yet |

### Shared Utilities

| File | Purpose |
|------|---------|
| `_shared/ledgerWriter.ts` | `writeLedgerEntry()` — idempotent ledger inserts |
| `_shared/war-chest-fifo.ts` | FIFO allocation for War Chest |

### Frontend

| File | Purpose |
|------|---------|
| `src/pages/LBCardPage.tsx` | "Coming Soon" when `lb_card_enabled=false`, full card manager when enabled |

### Environment (ALREADY SET in Supabase secrets)

- `STRIPE_SECRET_KEY` — live key
- `STRIPE_ISSUING_WEBHOOK_SECRET` — webhook signing secret (just configured by Founder)

---

## TASK 1: Migration — Provider-Agnostic Columns + Enable Flag

**File**: `supabase/migrations/20260324000001_k97_stripe_issuing_live.sql`

```sql
-- ============================================
-- K97: Stripe Issuing Go-Live
-- Adds provider-agnostic columns (future-proofing)
-- Enables lb_card_enabled feature flag
-- ============================================

-- Provider columns on lb_cardholders
ALTER TABLE lb_cardholders
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe'
    CHECK (provider IN ('stripe', 'unit', 'lithic')),
  ADD COLUMN IF NOT EXISTS provider_cardholder_id TEXT,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'approved'
    CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

-- Backfill from existing stripe columns
UPDATE lb_cardholders
  SET provider_cardholder_id = stripe_cardholder_id, provider = 'stripe'
  WHERE stripe_cardholder_id IS NOT NULL AND provider_cardholder_id IS NULL;

-- Provider columns on lb_cards
ALTER TABLE lb_cards
  ADD COLUMN IF NOT EXISTS provider_card_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_cards
  SET provider_card_id = stripe_card_id
  WHERE stripe_card_id IS NOT NULL AND provider_card_id IS NULL;

-- Provider columns on lb_card_transactions
ALTER TABLE lb_card_transactions
  ADD COLUMN IF NOT EXISTS provider_authorization_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_card_transactions
  SET provider_authorization_id = stripe_authorization_id
  WHERE stripe_authorization_id IS NOT NULL AND provider_authorization_id IS NULL;

-- Provider columns on lb_card_funding
ALTER TABLE lb_card_funding
  ADD COLUMN IF NOT EXISTS provider_transfer_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}';

UPDATE lb_card_funding
  SET provider_transfer_id = stripe_transfer_id
  WHERE stripe_transfer_id IS NOT NULL AND provider_transfer_id IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cardholders_provider ON lb_cardholders(provider, provider_cardholder_id);
CREATE INDEX IF NOT EXISTS idx_cards_provider ON lb_cards(provider_card_id);

-- FLIP THE SWITCH
UPDATE founder_feature_flags
  SET is_enabled = true, enabled_at = NOW(),
      notes = 'LIVE — Stripe Issuing connected (K97)'
  WHERE feature_key = 'lb_card_enabled';

-- Set active provider
INSERT INTO founder_feature_flags (feature_key, is_enabled, enabled_at, notes)
VALUES ('lb_card_provider', true, NOW(), 'stripe')
ON CONFLICT (feature_key) DO UPDATE
  SET is_enabled = true, enabled_at = NOW(), notes = 'stripe';
```

---

## TASK 2: Shared Provider Adapter (Stripe-Only Implementation)

**File**: `supabase/functions/_shared/cardProviderAdapter.ts`

Build the adapter with **typed interfaces** for all operations, but **only implement the Stripe branch**. The interfaces future-proof for Unit/Lithic — a future K-session adds their implementations without touching existing code.

```typescript
// _shared/cardProviderAdapter.ts
// Provider-agnostic card adapter — Stripe Issuing implementation
// Future providers: add implementation functions, update dispatcher

export type CardProvider = 'stripe' | 'unit' | 'lithic';

// ── Interfaces (provider-agnostic) ──────────────────────

export interface CreateCardholderParams {
  firstName: string;
  lastName: string;
  email: string;
  billing: { line1: string; city: string; state?: string; postalCode: string; country: string };
}

export interface CreateCardholderResult {
  providerCardholderId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface CreateCardParams {
  providerCardholderId: string;
  type: 'virtual' | 'physical';
  currency?: string;
}

export interface CreateCardResult {
  providerCardId: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  status: string;
  metadata: Record<string, unknown>;
}

export interface CardDetailsResult {
  number: string;
  cvc: string;
  expMonth: number;
  expYear: number;
}

export interface FundCardParams {
  providerCardholderId: string;
  amountCents: number;
  description: string;
  idempotencyKey: string;
}

export interface FundCardResult {
  providerTransferId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface UpdateCardStatusParams {
  providerCardId: string;
  action: 'freeze' | 'unfreeze' | 'cancel';
}

export interface UpdateCardStatusResult {
  providerCardId: string;
  newStatus: string;
  metadata: Record<string, unknown>;
}

// ── Stripe Implementation ───────────────────────────────

function stripeHeaders(): Record<string, string> {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  return {
    Authorization: `Basic ${btoa(key + ':')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

async function stripePost(path: string, body: URLSearchParams): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST', headers: stripeHeaders(), body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${path} failed`);
  return data;
}

async function stripeGet(path: string): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: stripeHeaders().Authorization },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe GET ${path} failed`);
  return data;
}

async function stripeCreateCardholder(p: CreateCardholderParams): Promise<CreateCardholderResult> {
  const body = new URLSearchParams();
  body.append('type', 'individual');
  body.append('name', `${p.firstName} ${p.lastName}`.trim());
  body.append('individual[first_name]', p.firstName);
  body.append('individual[last_name]', p.lastName);
  body.append('email', p.email);
  body.append('billing[address][line1]', p.billing.line1);
  body.append('billing[address][city]', p.billing.city);
  body.append('billing[address][postal_code]', p.billing.postalCode);
  body.append('billing[address][country]', p.billing.country);
  if (p.billing.state) body.append('billing[address][state]', p.billing.state);
  body.append('status', 'active');

  const data = await stripePost('/issuing/cardholders', body);
  return { providerCardholderId: data.id, status: data.status, metadata: { raw: data } };
}

async function stripeCreateCard(p: CreateCardParams): Promise<CreateCardResult> {
  const body = new URLSearchParams();
  body.append('cardholder', p.providerCardholderId);
  body.append('currency', p.currency || 'usd');
  body.append('type', p.type);
  body.append('status', 'active');
  body.append('spending_controls[blocked_categories][]', 'cash_advance');
  body.append('spending_controls[blocked_categories][]', 'automated_fuel_dispensers');

  const data = await stripePost('/issuing/cards', body);
  return {
    providerCardId: data.id,
    lastFour: data.last4 ?? '',
    expMonth: data.exp_month,
    expYear: data.exp_year,
    status: data.status,
    metadata: { raw: data },
  };
}

async function stripeGetCardDetails(providerCardId: string): Promise<CardDetailsResult> {
  const data = await stripeGet(
    `/issuing/cards/${encodeURIComponent(providerCardId)}?expand[]=number&expand[]=cvc`
  );
  return {
    number: typeof data.number === 'string' ? data.number : data.number?.number ?? '',
    cvc: typeof data.cvc === 'string' ? data.cvc : data.cvc?.cvc ?? '',
    expMonth: data.exp_month,
    expYear: data.exp_year,
  };
}

async function stripeFundCard(p: FundCardParams): Promise<FundCardResult> {
  // Stripe Issuing funding model:
  // The Issuing balance is pre-funded by the Founder (via Stripe Dashboard or top-ups).
  // Individual cardholder balances are tracked locally in card_balance_cents.
  // The lb-card-webhook checks card_balance_cents before approving authorizations.
  //
  // Phase 1 (MVP): local balance is authoritative. Stripe balance is pre-funded.
  // Phase 2: automate top-ups via stripe.topups.create() when balance is low.
  
  console.log('[stripeFundCard] Phase 1: local balance is authoritative. Amount:', p.amountCents);
  return {
    providerTransferId: `local_${p.idempotencyKey}`,
    status: 'completed',
    metadata: { phase: 1, note: 'Local balance — Stripe Issuing balance pre-funded by Founder' },
  };
}

async function stripeUpdateCardStatus(p: UpdateCardStatusParams): Promise<UpdateCardStatusResult> {
  const statusMap: Record<string, string> = { freeze: 'inactive', unfreeze: 'active', cancel: 'canceled' };
  const body = new URLSearchParams();
  body.append('status', statusMap[p.action] || 'inactive');

  const data = await stripePost(`/issuing/cards/${encodeURIComponent(p.providerCardId)}`, body);
  return { providerCardId: data.id, newStatus: data.status, metadata: { raw: data } };
}

// ── Dispatcher ──────────────────────────────────────────

export function getProvider(): CardProvider {
  const p = (Deno.env.get('LB_CARD_PROVIDER') ?? 'stripe').toLowerCase();
  if (p === 'unit' || p === 'lithic') return p;
  return 'stripe';
}

export async function createCardholder(params: CreateCardholderParams): Promise<CreateCardholderResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented. Only 'stripe' is active.`);
  return stripeCreateCardholder(params);
}

export async function createCard(params: CreateCardParams): Promise<CreateCardResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeCreateCard(params);
}

export async function getCardDetails(providerCardId: string): Promise<CardDetailsResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeGetCardDetails(providerCardId);
}

export async function fundCard(params: FundCardParams): Promise<FundCardResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeFundCard(params);
}

export async function updateCardStatus(params: UpdateCardStatusParams): Promise<UpdateCardStatusResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeUpdateCardStatus(params);
}
```

---

## TASK 3: Refactor Edge Functions to Use Adapter

For each of the 6 edge functions: replace raw Stripe fetch calls with adapter imports. Keep ALL existing auth checks, DB operations, error handling, CORS headers.

### 3A: `create-lb-cardholder/index.ts`

**Replace** the raw `fetch('https://api.stripe.com/v1/issuing/cardholders', ...)` block with:

```typescript
import { createCardholder, getProvider } from '../_shared/cardProviderAdapter.ts';

// ... existing auth + validation stays identical ...

const result = await createCardholder({
  firstName, lastName, email: user.email!,
  billing: { line1, city, state, postalCode, country },
});

const { data: row, error: insErr } = await supabaseAdmin
  .from('lb_cardholders')
  .insert({
    user_id: user.id,
    stripe_cardholder_id: result.providerCardholderId,
    provider_cardholder_id: result.providerCardholderId,
    provider: getProvider(),
    status: 'active',
    kyc_status: 'approved',
    provider_metadata: result.metadata,
  })
  .select()
  .single();
```

### 3B: `create-lb-card/index.ts`

```typescript
import { createCard, getProvider } from '../_shared/cardProviderAdapter.ts';

const result = await createCard({
  providerCardholderId: cardholder.provider_cardholder_id || cardholder.stripe_cardholder_id,
  type: 'virtual',
  currency: 'usd',
});

const { data: row } = await supabaseAdmin
  .from('lb_cards')
  .insert({
    cardholder_id: cardholder.id,
    stripe_card_id: result.providerCardId,
    provider_card_id: result.providerCardId,
    card_type: 'virtual',
    status: 'active',
    last_four: result.lastFour,
    exp_month: result.expMonth,
    exp_year: result.expYear,
    provider_metadata: result.metadata,
  })
  .select('id, cardholder_id, card_type, status, last_four, exp_month, exp_year, created_at')
  .single();
```

### 3C: `get-lb-card-details/index.ts`

```typescript
import { getCardDetails } from '../_shared/cardProviderAdapter.ts';

const providerCardId = cardRow.provider_card_id || cardRow.stripe_card_id;
const details = await getCardDetails(providerCardId);

return jsonResponse({
  number: details.number,
  cvc: details.cvc,
  exp_month: details.expMonth,
  exp_year: details.expYear,
});
```

### 3D: `update-lb-card-controls/index.ts`

```typescript
import { updateCardStatus } from '../_shared/cardProviderAdapter.ts';

if (action === 'freeze' || action === 'unfreeze') {
  const providerCardId = cardRow.provider_card_id || cardRow.stripe_card_id;
  await updateCardStatus({ providerCardId, action });
}
```

### 3E: `fund-lb-card/index.ts` — ADD PROVIDER CALL + LEDGER

```typescript
import { fundCard } from '../_shared/cardProviderAdapter.ts';
import { writeLedgerEntry } from '../_shared/ledgerWriter.ts';

// ... existing balance update + funding row insert stays identical ...

const providerCardholderId = cardholder.provider_cardholder_id || cardholder.stripe_cardholder_id;
if (providerCardholderId) {
  try {
    const fundResult = await fundCard({
      providerCardholderId,
      amountCents: amount_cents,
      description: source_description || `LB Card funding: ${funding_type}`,
      idempotencyKey: `fund_${cardholder.id}_${Date.now()}`,
    });
    await supabaseAdmin
      .from('lb_card_funding')
      .update({ provider_transfer_id: fundResult.providerTransferId })
      .eq('cardholder_id', cardholder.id)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (err) {
    console.error('[fund-lb-card] Provider call failed, local balance updated:', err);
  }
}

await writeLedgerEntry({
  stripe_event_id: `card_fund_${cardholder.id}_${Date.now()}`,
  ledger_category: 'card_funding',
  amount_cents: amount_cents,
  payee_id: user_id,
  is_patronage: false,
  description: `Card funding: ${funding_type}`,
  webhook_source: 'fund-lb-card',
});
```

### 3F: `lb-card-webhook/index.ts` — ADD LEDGER ENTRIES

```typescript
import { writeLedgerEntry } from '../_shared/ledgerWriter.ts';

// After inserting lb_card_transactions:
await writeLedgerEntry({
  stripe_event_id: `card_txn_${authorizationId}`,
  ledger_category: 'card_transaction',
  amount_cents: amount,
  payer_id: cardholder.user_id,
  is_patronage: false,
  description: `Card purchase: ${merchantName || 'Unknown'}`,
  metadata: { merchant_category: merchantCategory, merchant_name: merchantName },
  webhook_source: 'lb-card-webhook',
});
```

---

## TASK 4: Update Card UI

### `src/pages/LBCardPage.tsx`

Migration flips `lb_card_enabled = true` — "Coming Soon" drops automatically. Add:

```tsx
const providerFlag = flags?.find((f: any) => f.feature_key === 'lb_card_provider');
const provider = providerFlag?.notes ?? 'stripe';

// In card visual:
<span className="text-xs text-muted-foreground opacity-60">
  Powered by {provider === 'stripe' ? 'Stripe' : provider}
</span>
```

---

## TASK 5: Set Environment Variable

Add to Supabase Edge Function secrets:
```
LB_CARD_PROVIDER = stripe
```

---

## TASK 6: Update Stats

`platform/src/hooks/useCanonicalStats.ts` — innovation count: **1,938**

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260324000001_k97_stripe_issuing_live.sql` | Provider columns + enable flag |
| `supabase/functions/_shared/cardProviderAdapter.ts` | Stripe-only adapter with future-proof interfaces |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `supabase/functions/create-lb-cardholder/index.ts` | Use adapter |
| `supabase/functions/create-lb-card/index.ts` | Use adapter |
| `supabase/functions/get-lb-card-details/index.ts` | Use adapter |
| `supabase/functions/update-lb-card-controls/index.ts` | Use adapter |
| `supabase/functions/fund-lb-card/index.ts` | Add provider call + ledger entry |
| `supabase/functions/lb-card-webhook/index.ts` | Add ledger entries + provider columns |
| `src/pages/LBCardPage.tsx` | Provider badge |

## DO NOT TOUCH

Membership Stripe (K94) | Transaction Ledger core (K95) | Coalition (K94)
Red Carpet / Slingshot (K93) | ADAPT Score (K92) | Front Door (K91)
Commerce Engine (K80) | Star Chamber (K79/K80) | MoneyPenny (K84)
Calendar (K82) | Beacon (K75/K82) | Treasure Map (K81)
Vehicle files (K85) | Political Expedition (K86) | Design Pipeline (K87)
Ghost World (K88) | Housing (K89) | Congress API (K90)
K96 commerce webhook + project funding | ledgerWriter.ts | war-chest-fifo.ts

---

## SECURITY REQUIREMENTS

1. **Purchase-only**: blocked_categories includes cash_advance + automated_fuel_dispensers
2. **No PCI data in DB**: Card numbers/CVCs fetched live from Stripe, never stored
3. **Idempotency**: fundCard uses idempotencyKey, webhook uses stripe_event_id for dedup
4. **Rate limiting**: Card detail reveal: max 3/hour
5. **Auto-freeze**: 5 declines in 1 hour → freeze card + notify
6. **Webhook signature verification**: uses STRIPE_ISSUING_WEBHOOK_SECRET
7. **Cash domain sealed**: No FK to credit/mark/joule tables

---

## BUILD ORDER

```
1. Migration (provider columns + enable flag)
2. cardProviderAdapter.ts (Stripe implementation)
3. Refactor create-lb-cardholder
4. Refactor create-lb-card
5. Refactor get-lb-card-details
6. Refactor update-lb-card-controls
7. Refactor fund-lb-card (+ ledger entry)
8. Update lb-card-webhook (+ ledger entries + provider columns)
9. Update LBCardPage (provider badge)
10. Stats
```

---

## DEPLOY CHECKLIST

1. Set `LB_CARD_PROVIDER=stripe` in Supabase secrets
2. `npx supabase db push --project-ref ruuxzilgmuwddcofqecc`
3. Deploy ALL card functions:
   ```
   npx supabase functions deploy create-lb-cardholder --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy create-lb-card --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy get-lb-card-details --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy update-lb-card-controls --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy fund-lb-card --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy lb-card-webhook --project-ref ruuxzilgmuwddcofqecc
   ```
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main -P default`

## TEST CHECKLIST

1. LB Card page shows ACTIVE card UI (not "Coming Soon")
2. Create cardholder → verify in Stripe Issuing dashboard
3. Issue virtual card → last four + expiry display correctly
4. Fund card $10 → card_balance_cents + lb_card_funding + transaction_ledger
5. Reveal card details → number + CVC display
6. Freeze → inactive in Stripe + frozen locally
7. Unfreeze → active again
8. Spending limits → stored in lb_cardholders
9. Simulate purchase → webhook → lb_card_transactions + transaction_ledger
10. Simulate decline → logged, balance unchanged
11. No duplicate ledger entries on retry
12. Provider badge shows "Powered by Stripe"
13. Zero console errors

---

## SESSION WEIGHT: MEDIUM

One migration, one new shared module (Stripe-only), 6 mechanical edge function refactors, 1 small UI update.

---

## FUTURE PROVIDER EXPANSION (NOT THIS SESSION)

To add a new provider later:
1. Add implementation functions to cardProviderAdapter.ts
2. Update dispatcher to route to new provider
3. Add provider's webhook handler
4. Change LB_CARD_PROVIDER env var
5. Deploy. Done.

Interfaces defined. Schema has provider columns. Zero refactoring needed.

---

**First card issued. First purchase at a local business. The cooperative economy starts here.**

**FOR THE KEEP.**