# K355: The Luis Test — Wire EVERYTHING End-to-End
# Priority: LAUNCH BLOCKING — if it doesn't work for Luis, it doesn't work
# Bishop: B084 | Date: 2026-04-07

## WHO IS LUIS

Luis Sabino drives through neighborhoods in San Antonio with a truck and trailer full of lawn equipment. His business card is a picture of a wheelbarrow with sod, his name, a Gmail address, and a phone number. The back is blank. He can't take credit cards. He can't do subscriptions. He can't hire help without word of mouth. He has no website, no merchant account, no marketing, no route optimization.

Luis IS the platform's target user. If Liana Banyan works for Luis, it works for everyone.

## OBJECTIVE

Wire every existing system into a working end-to-end flow for a service provider like Luis. This is NOT new features — this is CONNECTING systems that already exist but aren't wired to each other.

## PHASE 1: STRIPE CHECKOUT — Connect Storefronts to Payment Processing

Stripe is configured (STRIPE_SECRET_KEY in Edge Function secrets). Wire it to storefronts.

### 1a. Checkout Edge Function

Create or update `platform/supabase/functions/storefront-checkout/index.ts`:

```typescript
// Input: { storefront_id, product_id, quantity, payment_method: 'credits' | 'stripe' }
// If credits: deduct from credit_wallets, insert into storefront_orders
// If stripe: create Stripe Checkout Session, redirect to Stripe, handle webhook
// On success: insert into storefront_orders, credit the storefront owner (83.3%)
// On failure: refund/cancel

// For service storefronts (like Luis):
// - Create a pending order (half payment now)
// - Hold second half in escrow (project_escrow_ledger)
// - Release on completion confirmation (with photo proof)
```

### 1b. Checkout UI Component

Create `platform/src/components/storefront/CheckoutButton.tsx`:
- "Pay with Credits" button (immediate, deducts from wallet)
- "Pay with Card" button (redirects to Stripe Checkout)
- Shows Cost+20% breakdown inline
- For services: shows "50% now, 50% on completion" split

### 1c. Order Confirmation Flow
- After payment: show order in member's dashboard
- Notify storefront owner via platform notification
- For services: schedule the appointment via Calendar system

Wire into `StorefrontDetailPage.tsx` (K352 created this).

## PHASE 2: SUBSCRIPTION PREPAY — Monthly Service Subscriptions

### 2a. Connect Subscriptions to Service Storefronts

The `subscription_tiers` and `member_subscriptions` tables exist. Wire them to service storefronts:

```sql
-- Add storefront_id to subscription_tiers
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS storefront_id UUID REFERENCES storefronts(id);
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS service_frequency TEXT; -- 'weekly', 'biweekly', 'monthly'
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS service_description TEXT;
```

### 2b. Subscription Widget on Storefront

On Luis's storefront, customers see:
```
LAWN CARE SUBSCRIPTION
☐ Weekly mow + edge — $35/week ($30.63 prepaid/Credits)
☐ Biweekly mow + edge — $45/visit
☐ Monthly full service — $120/month ($104.50 prepaid)
[Subscribe →]
```

Prepaid Credits are cheaper than per-visit cash — incentivizes the subscription.

### 2c. Route Generation

When multiple customers in a neighborhood subscribe:
- Auto-generate a route for the service provider
- Display on Calendar: "Tuesday: 4 lawns, Rogers Park neighborhood"
- Customer gets notification: "Luis is scheduled for your lawn on Tuesday"

## PHASE 3: SPLIT PAYMENT WITH PHOTO PROOF

### 3a. Service Escrow System

When a service is ordered:
1. Customer pays 50% upfront (Credits or Stripe)
2. 50% goes into `project_escrow_ledger` as held funds
3. Service provider completes work
4. Service provider uploads before/after photos (use existing `photo_bounties` or `photo_bounty_claims` infrastructure)
5. Customer confirms completion
6. Escrow releases the remaining 50% to the provider
7. If dispute: Star Chamber arbitration

### 3b. Photo Proof Component

Create `platform/src/components/service/ServiceCompletionProof.tsx`:
- Before photo (uploaded by provider before starting)
- After photo (uploaded by provider after completing)
- Customer approval button
- Dispute button → Star Chamber
- Auto-release after 72 hours if customer doesn't respond

### 3c. Wire to Order Flow

In `storefront_orders`:
```sql
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES project_escrow_ledger(id);
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS completion_status TEXT DEFAULT 'pending'
  CHECK (completion_status IN ('pending', 'in_progress', 'completed', 'disputed', 'auto_released'));
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS before_photo_url TEXT;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS after_photo_url TEXT;
ALTER TABLE storefront_orders ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ;
```

## PHASE 4: CREW CALL — HIRING THROUGH THE PLATFORM

Luis wants to hire a helper. On traditional platforms, he'd pay to list a job, pay a recruiter, handle payroll paperwork.

On Liana Banyan:
1. Luis posts a Crew Call: "Need lawn helper, $15/hr, 3 days/week, San Antonio"
2. The Crew Call system (`crew_call_roles`, `crew_invites`, `crew_members`) is already built
3. Members apply through the platform
4. Luis picks someone
5. Payment flows through the platform (Cost+20% on the wage)
6. Both earn reputation (ADAPT scores, XP)
7. If the helper is good, Luis can add them permanently to his crew

### Wire Crew Call to Service Storefronts:

On Luis's storefront page, show:
```
HIRING
Luis is looking for help:
- Lawn Care Assistant — $15/hr, 3 days/week
- [Apply through Crew Call →]
```

This links to the existing Crew Call system with the storefront pre-filled.

## PHASE 5: CREDITS AS MERCHANT ACCOUNT

Until the LB Card is approved (DD-2 blocked on Stripe/Lithic), Credits ARE Luis's merchant account:

1. Customer buys Credits ($1 = 1 Credit)
2. Customer pays Luis in Credits for lawn service
3. Luis accumulates Credits in his wallet
4. Luis uses Credits to buy supplies on the platform marketplace
5. OR Luis pays his helper in Credits
6. The Credits economy IS the payment system — no bank account needed

### Wire Credit Payment to Storefronts:

The `credit_wallets` and `credit_transactions` tables exist. Wire them to the checkout:
- Deduct Credits from customer wallet
- Add Credits to provider wallet (minus Cost+20%)
- Record in `credit_transactions` with order reference

## PHASE 6: CUE CARD BUSINESS CARDS — REAL PRINT + SHIP

### 6a. Business Card Generator

On the Cue Card Creator page (`/cue-cards/create`):
- Member enters: name, business name, phone, email, tagline
- System generates: professional card with QR code linking to their storefront
- QR code uses the Hofund channel system for attribution tracking
- Preview: front and back of card

### 6b. Print + Ship via Printful

The Printful API token is configured. Wire it:
1. Card design → Printful print-ready format
2. Member orders 100/250/500 cards
3. Payment via Credits or Stripe
4. Printful prints and ships directly
5. Threshold pricing: 100 cards = $15, 250 = $30, 500 = $45 (volume discount)

### 6c. Luis's Card vs His Current Card

```
CURRENT: Wheelbarrow photo. Name. Gmail. Phone. Blank back.

LIANA BANYAN VERSION:
Front: Clean design. "Luis Sabino Lawn Care"
       Phone. Professional email.
       QR code → lianabanyan.com/storefront/luis-sabino-lawn-care
       "Scan to book instantly"

Back:  Services + prices
       "Subscribe for weekly service — prepay and save"
       "Accepting Credits and Cards"
       Liana Banyan member badge
```

## PHASE 7: NEIGHBORHOOD ADVERTISING — RIDESHARE ROUTE SIGNS

### 7a. Digital Route Signs

The `rideshare_routes` system shows routes in a neighborhood. Add "advertising" to routes:
- When someone browses Rideshare Routes in a neighborhood, they also see:
  - Local service providers (Luis's lawn care)
  - Local storefronts
  - "For Rent" signs for empty slots

### 7b. Physical Sign Generation

Like the business cards, generate printable signs:
- "RIDESHARE: Need a ride to [destination]? Scan this QR code"
- "LAWN CARE by Luis — Scan to book" (yard sign format)
- Printed via Printful, shipped to member
- QR codes track which sign generated which lead

### 7c. Neighborhood Landing Page

Each neighborhood (K353) shows:
- Local services (lawn care, tutoring, cleaning)
- Local storefronts (crafts, food, digital)
- Local rideshare routes
- "New here? See what your neighbors offer"

## PHASE 8: HEXISLE PRE-ORDER CHECKOUT

Wire the Stripe checkout to HexIsle products:
1. STL downloads: immediate digital delivery after payment
2. Physical products (full Hexel set): threshold-based pre-order
3. Canister System: Wave 1 pre-order at $149
4. On payment: insert into `storefront_orders`, decrement `order_count` toward threshold
5. When threshold reached: trigger production notification

## VALIDATION — THE LUIS TEST

Run through this exact sequence:

1. ☐ Luis joins for $5/year
2. ☐ Luis creates a storefront: "Luis Sabino Lawn Care"
3. ☐ Luis lists services: mow + edge ($35), full service ($120/mo subscription)
4. ☐ Luis orders 100 business cards with QR code ($15)
5. ☐ A neighbor finds Luis via the neighborhood page
6. ☐ Neighbor subscribes to biweekly lawn service, prepays with Credits
7. ☐ Luis gets notification: "New subscription — Tuesday route"
8. ☐ Luis completes the job, uploads before/after photos
9. ☐ Neighbor confirms completion, second half releases from escrow
10. ☐ Luis now has Credits in his wallet
11. ☐ Luis posts a Crew Call for a helper
12. ☐ A member applies and gets hired
13. ☐ Luis pays helper through the platform
14. ☐ Both earn XP and reputation

If all 14 steps work, the platform is real.

## REFERENCE

- Stripe: STRIPE_SECRET_KEY in Edge Function secrets
- Printful: PRINTFUL_API_TOKEN in Edge Function secrets
- Credit wallets: `credit_wallets`, `credit_transactions`
- Escrow: `project_escrow_ledger`
- Subscriptions: `subscription_tiers`, `member_subscriptions`
- Crew Call: `crew_call_roles`, `crew_invites`, `crew_members`
- Rideshare: `rideshare_routes`, `rideshare_matches`
- Photo proof: `photo_bounties`, `photo_bounty_claims`
- Calendar: `calendar_events`, `calendar_shares`
- Cue Cards: `cue_card_campaigns`, `stamped_cue_cards`
- Storefronts: `storefronts`, `storefront_products`, `storefront_orders`
- Hofund QR: `hofund_channels`, `hofund_dial_position`
- ADAPT: `adapt_scores`, `xp_scores`
