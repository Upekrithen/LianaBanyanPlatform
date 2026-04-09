# KNIGHT SESSION 192 — LB Card Abstraction Layer + Lithic Integration
## Bishop B050 | DD-2 Resolution — Build the card issuing infrastructure
## First provider to approve wins. Build the abstraction now.

---

## CONTEXT

DD-2 (LB Card) is the ONLY Dirty Dozen item not GREEN. Two applications submitted March 30, 2026:
- Stripe Issuing (standard prepaid)
- Lithic (via Stearns Bank partnership)

The existing codebase has:
- `lb_cardholders`, `lb_cards`, `lb_card_transactions`, `lb_card_funding` tables — COMPLETE
- `LBCardPage.tsx` — Full UI (issuance, balance, reveal PAN/CVC, freeze, spending limits) — COMPLETE
- `provider` column supporting 'stripe', 'unit', 'lithic' — DESIGNED
- Edge Function stubs referenced but NOT BUILT: `create-lb-card`, `create-lb-cardholder`, `get-lb-card-details`, `update-lb-card-controls`
- `lb_card_enabled` feature flag — EXISTS (set to true in K97 migration, may be off in production)

The B049 evaluation specifies a `CardIssuer` TypeScript interface for provider abstraction.

**Strategy:** Build the abstraction layer + Lithic implementation NOW (sandbox is instant, no approval needed). When Stripe approves, add `StripeCardIssuer` as a second implementation. First to approve production goes live.

---

## DELIVERABLE 1: CardIssuer Abstraction

**NEW FILE:** `supabase/functions/_shared/cardIssuer.ts`

```typescript
export interface CardIssuerConfig {
  provider: 'stripe' | 'lithic' | 'unit';
  apiKey: string;
  sandboxMode: boolean;
}

export interface Cardholder {
  id: string;              // Provider's cardholder ID
  providerId: string;      // Our internal UUID
  status: string;          // 'pending' | 'active' | 'blocked'
}

export interface Card {
  id: string;              // Provider's card ID
  last4: string;
  expMonth: number;
  expYear: number;
  status: string;          // 'active' | 'frozen' | 'canceled'
  type: 'virtual' | 'physical';
}

export interface CardIssuer {
  createCardholder(params: {
    memberId: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: { line1: string; city: string; state: string; zip: string; country: string };
  }): Promise<Cardholder>;
  
  issueVirtualCard(cardholderId: string): Promise<Card>;
  
  issuePhysicalCard(cardholderId: string, shippingAddress: {
    line1: string; city: string; state: string; zip: string; country: string;
  }): Promise<Card>;
  
  fundCard(cardId: string, amountCents: number): Promise<{ transactionId: string }>;
  
  getCardDetails(cardId: string): Promise<{
    pan: string; cvc: string; expMonth: number; expYear: number;
  }>;
  
  freezeCard(cardId: string): Promise<void>;
  unfreezeCard(cardId: string): Promise<void>;
  cancelCard(cardId: string): Promise<void>;
  
  getTransactions(cardId: string, limit?: number): Promise<Array<{
    id: string; amount_cents: number; merchant: string; status: string; created_at: string;
  }>>;
}
```

---

## DELIVERABLE 2: Lithic Implementation

**NEW FILE:** `supabase/functions/_shared/lithicCardIssuer.ts`

Implement `CardIssuer` interface using Lithic REST API:

```
Base URL: https://api.lithic.com (production) / https://sandbox.lithic.com (sandbox)
Auth: API-Key header

Endpoints:
- POST /v1/accounts → createCardholder
- POST /v1/cards { type: "VIRTUAL" } → issueVirtualCard
- POST /v1/cards { type: "PHYSICAL" } → issuePhysicalCard  
- POST /v1/simulate/authorize + /v1/simulate/clearing → funding (sandbox)
- GET /v1/cards/{id}/pan → getCardDetails (PCI iframe alternative)
- PATCH /v1/cards/{id} { state: "PAUSED" } → freezeCard
- PATCH /v1/cards/{id} { state: "OPEN" } → unfreezeCard
- PATCH /v1/cards/{id} { state: "CLOSED" } → cancelCard
- GET /v1/transactions?card_token={id} → getTransactions
```

---

## DELIVERABLE 3: Edge Functions

Build all 4 Edge Functions that LBCardPage.tsx already calls:

### `supabase/functions/create-lb-cardholder/index.ts`
- Input: { member_id }
- Get member profile (name, email, address)
- Determine provider from `founder_feature_flags` ('lb_card_provider')
- Call `CardIssuer.createCardholder()`
- Insert into `lb_cardholders` with `provider`, `provider_cardholder_id`
- Return cardholder record

### `supabase/functions/create-lb-card/index.ts`
- Input: { cardholder_id, type: 'virtual' | 'physical', shipping_address? }
- Load cardholder to get provider
- Call `CardIssuer.issueVirtualCard()` or `issuePhysicalCard()`
- Insert into `lb_cards` with `provider_card_id`, `last4`, `exp_month`, `exp_year`
- Return card record

### `supabase/functions/get-lb-card-details/index.ts`
- Input: { card_id }
- Load card to get provider + provider_card_id
- Call `CardIssuer.getCardDetails()`
- Return PAN, CVC, expiry (SENSITIVE — only over TLS, only to card owner)

### `supabase/functions/update-lb-card-controls/index.ts`
- Input: { card_id, action: 'freeze' | 'unfreeze' | 'cancel' }
- Load card, call appropriate CardIssuer method
- Update `lb_cards` status
- Return updated card

---

## DELIVERABLE 4: Walking Billboard Signals

**NEW MIGRATION:**

```sql
-- Walking Billboard: every LB Card swipe at a non-participating merchant = demand signal
CREATE TABLE IF NOT EXISTS walking_billboard_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID REFERENCES lb_cardholders(id),
  merchant_name TEXT NOT NULL,
  merchant_category TEXT, -- MCC code or description
  amount_cents INTEGER NOT NULL,
  location TEXT, -- city/zip if available from transaction data
  is_participating_merchant BOOLEAN DEFAULT false,
  signal_strength INTEGER DEFAULT 1, -- increments with repeat visits
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aggregated view for Captains
CREATE VIEW walking_billboard_summary AS
SELECT 
  merchant_name,
  location,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT cardholder_id) as unique_cardholders,
  SUM(amount_cents) as total_spend_cents,
  MAX(created_at) as last_transaction
FROM walking_billboard_signals
WHERE NOT is_participating_merchant
GROUP BY merchant_name, location
ORDER BY transaction_count DESC;
```

---

## DELIVERABLE 5: Lithic Webhook Handler

**NEW FILE:** `supabase/functions/lb-card-webhook/index.ts`

Handle Lithic transaction webhooks:
- `transaction.authorized` → Write to `lb_card_transactions` + `walking_billboard_signals`
- `transaction.settled` → Update transaction status
- `transaction.declined` → Log decline reason
- Check merchant against participating merchants list → set `is_participating_merchant`

---

## DELIVERABLE 6: Feature Flag + Sandbox Testing

1. Set `lb_card_provider` = 'lithic' in `founder_feature_flags`
2. Set `lb_card_enabled` = true
3. Add `LITHIC_API_KEY` and `LITHIC_SANDBOX_KEY` to Supabase secrets
4. Test in sandbox: create cardholder → issue card → simulate transaction → verify Walking Billboard signal

---

## DELIVERABLE 7: Stats + Deploy

- Update useCanonicalStats: knightSessions=192
- Build: zero errors
- Deploy all 8 targets + Edge Functions

---

## CRITICAL RULES

- LB Card is funded SEPARATELY from Credits. Credits never cash out to fiat.
- Cost + 20% is CONSTITUTIONAL. 
- Entity is Liana Banyan CORPORATION. NOT an LLC.
- PCI compliance: NEVER log full PAN. Use provider's secure element/iframe for card display.
- Walking Billboard data is used by Captains to prioritize merchant outreach — NOT sold to third parties.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] CardIssuer abstraction interface
[ ] LithicCardIssuer implementation
[ ] create-lb-cardholder Edge Function
[ ] create-lb-card Edge Function
[ ] get-lb-card-details Edge Function
[ ] update-lb-card-controls Edge Function
[ ] walking_billboard_signals table + view migration
[ ] lb-card-webhook Edge Function (Lithic transactions)
[ ] Feature flags updated
[ ] Sandbox test: full lifecycle
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets + Edge Functions
```

---

*Knight Session 192 — Bishop (Foreman), B050*
*DD-2 resolution. Build the abstraction. First provider to approve goes live.*
*FOR THE KEEP!*