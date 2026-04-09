# KNIGHT SESSION 186 — Stripe Recurring Subscription Webhooks
## Bishop B050 | Integration Completion Phase
## CRITICAL: Real money flow depends on this

---

## CONTEXT

Stripe Connect is COMPLETE (Express accounts, webhooks, payouts). One-time checkouts WORK. But recurring subscriptions DON'T process — the webhook handlers for invoice/subscription lifecycle events are MISSING.

K121 created: membership_subscriptions, credit_wallets, credit_transactions tables.
K182 created: subscription_channels, channel_subscriptions, subscription_billing tables (Universal Subscription Engine).

The Universal Subscription Engine supports 4 currencies (marks, credits, joules, dollars). When currency='dollars', the subscription MUST go through Stripe Billing. Currently it doesn't — there's no webhook to confirm recurring payments.

Existing shared helper: `supabase/functions/_shared/ledgerWriter.ts` — deduplicates by stripe_event_id using idempotent inserts.

Platform margin: Cost + 20%. Creators keep 83.3%. Platform keeps 16.7%. This is CONSTITUTIONAL — locked in the operating agreement.

---

## DELIVERABLE 1: Subscription Webhook Handler

**NEW FILE:** `supabase/functions/handle-subscription-webhook/index.ts`

```typescript
// Deno Edge Function
// Handle recurring subscription lifecycle events from Stripe

// Events to handle:

// 1. invoice.payment_succeeded
//    - Extract subscription_id from invoice.subscription
//    - Find channel_subscription by stripe_subscription_id
//    - Write to subscription_billing: amount, currency='dollars', status='paid'
//    - Calculate split: 83.3% to creator (payee), 16.7% to platform
//    - Write transaction_ledger entry via ledgerWriter (category: 'subscription')
//    - Update channel_subscription: status='active', next_billing_date = current_period_end
//    - Increment subscriber stats on subscription_channels

// 2. customer.subscription.updated
//    - Sync status changes (active, past_due, canceled, trialing)
//    - If price changed, update channel_subscription amount

// 3. customer.subscription.deleted
//    - Mark channel_subscription status = 'canceled'
//    - Set canceled_at = now()
//    - Decrement subscriber_count on subscription_channels

// 4. invoice.payment_failed
//    - Mark channel_subscription status = 'past_due'
//    - Log failure reason from invoice.last_payment_error
//    - TODO: trigger member notification (future MoneyPenny integration)
```

Validate Stripe signatures with HMAC-SHA256 using `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET` env var.
Use existing `ledgerWriter.ts` for deduplication — pass `stripe_event_id` from the event.

---

## DELIVERABLE 2: Route Subscription Events

**MODIFY:** `supabase/functions/stripe-webhook/index.ts`

Add routing for subscription-related events to the new handler. If the main webhook currently handles all events, add cases for:
- `invoice.payment_succeeded` (where invoice.subscription is not null)
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed` (where invoice.subscription is not null)

---

## DELIVERABLE 3: Create Stripe Price on Dollar Channel Creation

**MODIFY:** The subscription channel creation flow (likely in `SubscriptionChannelsPage.tsx` or equivalent).

When a creator creates a subscription_channel with `currency = 'dollars'`:
1. Call a new Edge Function: `create-subscription-product/index.ts`
2. That function creates a Stripe Product (name = channel title) and Stripe Price (amount, recurring interval from billing_cycle)
3. Store `stripe_product_id` and `stripe_price_id` on the subscription_channels row

**NEW FILE:** `supabase/functions/create-subscription-product/index.ts`

```typescript
// Input: { channel_id, title, amount_cents, billing_cycle }
// 1. Create Stripe Product: { name: title, metadata: { channel_id } }
// 2. Create Stripe Price: { product: product.id, unit_amount: amount_cents, currency: 'usd', recurring: { interval: billing_cycle } }
// 3. Update subscription_channels SET stripe_product_id, stripe_price_id
// Return: { stripe_product_id, stripe_price_id }
```

---

## DELIVERABLE 4: Stripe Checkout for Dollar Subscriptions

**MODIFY:** The subscription purchase flow (where member clicks "Subscribe" on a dollar-currency channel).

When `channel.currency === 'dollars'`:
1. Call Edge Function: `create-subscription-checkout/index.ts`
2. Creates Stripe Checkout Session with `mode: 'subscription'`, using the channel's `stripe_price_id`
3. Include `metadata: { channel_id, subscriber_id }` so the webhook can link back
4. On checkout.session.completed, create channel_subscription record with `stripe_subscription_id`

**NEW FILE:** `supabase/functions/create-subscription-checkout/index.ts`

```typescript
// Input: { channel_id, subscriber_id }
// 1. Look up channel to get stripe_price_id
// 2. Get or create Stripe Customer for subscriber
// 3. Create Checkout Session: mode='subscription', price=stripe_price_id
// 4. Return: { checkout_url }
```

---

## DELIVERABLE 5: Migration (if needed)

Add columns to subscription_channels if not present:
```sql
ALTER TABLE subscription_channels ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE subscription_channels ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE channel_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE channel_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

---

## DELIVERABLE 6: Stats + Deploy

- Update useCanonicalStats: knightSessions=186
- Update canonical.json
- Build: zero errors
- Deploy all 8 targets + Cephas

---

## CRITICAL RULES

- Cost + 20% is CONSTITUTIONAL. Creator keeps 83.3%. Platform keeps 16.7%.
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- Entity is Liana Banyan CORPORATION (Wyoming C-Corp). NOT an LLC.
- Use existing ledgerWriter.ts — do NOT create a new deduplication mechanism.
- All Edge Functions are Deno (not Node.js).

---

## BUILD + DEPLOY CHECKLIST

```
[ ] handle-subscription-webhook/index.ts
[ ] create-subscription-product/index.ts
[ ] create-subscription-checkout/index.ts
[ ] Route subscription events in stripe-webhook/index.ts
[ ] Add Stripe columns migration
[ ] Wire dollar channel creation to Stripe Product/Price
[ ] Wire dollar subscription to Stripe Checkout
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 186 — Bishop (Foreman), B050*
*Stripe Recurring Subscriptions — Make real money flow.*
*FOR THE KEEP!*