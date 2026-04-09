# KNIGHT SESSION 80 — Commerce Engine: Complete the Money Loop

## Bishop: 024 | Innovation Count: 1,935 | Priority: PHASE 1 (Wire the Gaps)

---

> **GOAL**: Close the earn loop. Right now orders go through Stripe Checkout but nothing happens after payment. Wire the stripe webhook → mark orders paid → distribute earnings to LB Cards.
>
> **THE GAP**: `stripe-webhook/index.ts` handles 5 payment types but logs `menu_order` as "Unhandled payment_type". The `fund-lb-card` function is READY but nothing calls it. This session connects them.

---

## WHAT ALREADY EXISTS (DO NOT REBUILD)

| Component | File | Status |
|-----------|------|--------|
| Menu checkout | `supabase/functions/create-menu-checkout/index.ts` | LIVE — creates Stripe session |
| Stripe webhook | `supabase/functions/stripe-webhook/index.ts` | LIVE — but menu_order unhandled |
| Order aggregation | `supabase/functions/aggregate-orders/index.ts` | LIVE — daily consolidation + email |
| Fund LB Card | `supabase/functions/fund-lb-card/index.ts` | LIVE — accepts user_id, amount_cents, funding_type |
| Commerce tables | storefronts, storefront_items, menu_orders | LIVE |
| LB Card tables | lb_cardholders, lb_cards, lb_card_transactions, lb_card_funding | LIVE |
| Revenue tables | onboarding_credits, steward_agreements, storefront_transfers | LIVE |
| Provider Dashboard | `src/pages/ProviderDashboard.tsx` | LIVE — shows orders |
| Runner Dashboard | `src/pages/RunnerDashboard.tsx` | LIVE — delivery management |
| Onboarder Dashboard | `src/pages/OnboarderDashboard.tsx` | LIVE — calculates earnings (read-only) |

---

## TASK 1: Handle `menu_order` in stripe-webhook

### File: `supabase/functions/stripe-webhook/index.ts`

Find the payment_type routing switch. Add the `menu_order` case:

```typescript
case 'menu_order': {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error('menu_order webhook missing order_id in metadata');
    break;
  }

  // 1. Mark order as paid
  const { data: order, error: orderError } = await supabaseAdmin
    .from('menu_orders')
    .update({ stripe_payment_status: 'paid' })
    .eq('id', orderId)
    .select('*, storefronts!inner(id, user_id, delivery_fee)')
    .single();

  if (orderError || !order) {
    console.error('Failed to update menu_order:', orderError);
    break;
  }

  console.log(`Menu order ${orderId} marked as paid. Total: ${order.total}`);

  // 2. Distribute earnings (async — don't block webhook response)
  // Call the distribute-order-earnings function
  try {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/distribute-order-earnings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'x-system-key': Deno.env.get('LB_SYSTEM_KEY') || '',
      },
      body: JSON.stringify({ order_id: orderId }),
    });
  } catch (distErr) {
    // Log but don't fail the webhook — earnings can be retried
    console.error('Earnings distribution failed (will retry):', distErr);
  }

  break;
}
```

### Also verify: `create-menu-checkout/index.ts`

Make sure the Stripe Checkout session metadata includes `payment_type: 'menu_order'` and `order_id`. Check that this is already being set. If not, add to the session creation:

```typescript
metadata: {
  payment_type: 'menu_order',
  order_id: orderId,
  storefront_id: storefrontId,
  customer_id: customerId || '',
}
```

---

## TASK 2: New Edge Function — `distribute-order-earnings`

### New file: `supabase/functions/distribute-order-earnings/index.ts`

This is the earnings engine. Called after payment confirmation. Calculates splits and funds LB Cards.

```typescript
// Input: { order_id: UUID }
// Process:
// 1. Fetch the paid order with storefront join
// 2. Calculate earnings splits
// 3. Call fund-lb-card for each recipient
// 4. Log all distributions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const SYSTEM_KEY = Deno.env.get('LB_SYSTEM_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

Deno.serve(async (req) => {
  const { order_id } = await req.json();

  // 1. Fetch order + storefront + onboarder + steward
  const { data: order } = await supabaseAdmin
    .from('menu_orders')
    .select('id, subtotal, delivery_fee, total, storefront_id, customer_id')
    .eq('id', order_id)
    .eq('stripe_payment_status', 'paid')
    .single();

  if (!order) return new Response(JSON.stringify({ error: 'Order not found or not paid' }), { status: 404 });

  const { data: storefront } = await supabaseAdmin
    .from('storefronts')
    .select('id, user_id')
    .eq('id', order.storefront_id)
    .single();

  if (!storefront) return new Response(JSON.stringify({ error: 'Storefront not found' }), { status: 404 });

  // 2. Find onboarder and steward for this storefront
  const { data: onboarder } = await supabaseAdmin
    .from('onboarding_credits')
    .select('user_id, credit_percentage')
    .eq('storefront_id', order.storefront_id)
    .eq('is_active', true)
    .eq('is_qualified', true)
    .maybeSingle();

  const { data: steward } = await supabaseAdmin
    .from('steward_agreements')
    .select('steward_id, management_fee_percentage')
    .eq('storefront_id', order.storefront_id)
    .eq('is_active', true)
    .maybeSingle();

  // 3. Calculate splits
  // Subtotal goes to creator (storefront owner)
  // Delivery fee goes to delivery runner (TBD — for now, to platform/creator)
  // Onboarding credit = credit_percentage of subtotal
  // Steward fee = management_fee_percentage of subtotal

  const subtotalCents = Math.round((order.subtotal || 0) * 100);
  const deliveryFeeCents = Math.round((order.delivery_fee || 0) * 100);

  const distributions: Array<{
    user_id: string;
    amount_cents: number;
    funding_type: string;
    source_description: string;
  }> = [];

  // Creator gets subtotal minus onboarding credit minus steward fee
  let creatorCents = subtotalCents;

  if (onboarder) {
    const onboarderCents = Math.round(subtotalCents * (onboarder.credit_percentage / 100));
    creatorCents -= onboarderCents;
    if (onboarderCents > 0) {
      distributions.push({
        user_id: onboarder.user_id,
        amount_cents: onboarderCents,
        funding_type: 'onboarding_credit',
        source_description: `3% onboarding credit from order ${order.id}`,
      });
    }
  }

  if (steward) {
    const stewardCents = Math.round(subtotalCents * (steward.management_fee_percentage / 100));
    creatorCents -= stewardCents;
    if (stewardCents > 0) {
      distributions.push({
        user_id: steward.steward_id,
        amount_cents: stewardCents,
        funding_type: 'steward_fee',
        source_description: `2% steward fee from order ${order.id}`,
      });
    }
  }

  // Creator gets remainder of subtotal
  if (creatorCents > 0) {
    distributions.push({
      user_id: storefront.user_id,
      amount_cents: creatorCents,
      funding_type: 'creator_share',
      source_description: `Creator share from order ${order.id}`,
    });
  }

  // Delivery fee — for now goes to creator (until delivery runner assignment system exists)
  // TODO: When runner assignment is wired, split delivery fee to runner
  if (deliveryFeeCents > 0) {
    distributions.push({
      user_id: storefront.user_id,
      amount_cents: deliveryFeeCents,
      funding_type: 'delivery_fee',
      source_description: `Delivery fee from order ${order.id}`,
    });
  }

  // 4. Execute distributions via fund-lb-card
  const results = [];
  for (const dist of distributions) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/fund-lb-card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'x-system-key': SYSTEM_KEY,
        },
        body: JSON.stringify({
          user_id: dist.user_id,
          amount_cents: dist.amount_cents,
          funding_type: dist.funding_type,
          source_description: dist.source_description,
          related_order_id: order.id,
        }),
      });
      const result = await resp.json();
      results.push({ ...dist, success: resp.ok, result });
    } catch (err) {
      results.push({ ...dist, success: false, error: String(err) });
    }
  }

  return new Response(JSON.stringify({
    order_id,
    distributions: results,
    total_distributed_cents: distributions.reduce((sum, d) => sum + d.amount_cents, 0),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## TASK 3: Set LB_SYSTEM_KEY Secret

The `fund-lb-card` function requires an `x-system-key` header. Generate and set this secret:

```bash
# Generate a random system key
npx supabase secrets set LB_SYSTEM_KEY="lb-sys-$(openssl rand -hex 32)" --project-ref ruuxzilgmuwddcofqecc
```

If `openssl` isn't available on Windows, use any random 64-character hex string:
```bash
npx supabase secrets set LB_SYSTEM_KEY="lb-sys-PASTE-A-RANDOM-64-CHAR-HEX-STRING-HERE" --project-ref ruuxzilgmuwddcofqecc
```

---

## TASK 4: Earnings Summary on LB Card Page

### File: `src/pages/LBCardPage.tsx`

Add an **Earnings Breakdown** section showing recent funding events:

Query `lb_card_funding` for the current user, grouped by `funding_type`:

```
┌─────────────────────────────────────────────┐
│  💳 Your LB Card                            │
│  Balance: $14.50                            │
│                                             │
│  Recent Earnings                            │
│  ├── Creator Share    $8.50  (3 orders)     │
│  ├── Delivery Fees    $6.00  (3 orders)     │
│  ├── Onboarding       $0.00  (no credits)   │
│  └── Steward Fee      $0.00  (not steward)  │
│                                             │
│  Last 5 Transactions                        │
│  Mar 22  Creator share  +$3.50  Order #47   │
│  Mar 22  Delivery fee   +$2.00  Order #47   │
│  Mar 21  Creator share  +$2.50  Order #46   │
│  Mar 21  Delivery fee   +$2.00  Order #46   │
│  Mar 20  Creator share  +$2.50  Order #45   │
└─────────────────────────────────────────────┘
```

This is a read from `lb_card_funding` WHERE `user_id = auth.uid()` ORDER BY `created_at DESC`.

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Build
npm run build

# 2. Deploy new + updated edge functions
npx supabase functions deploy stripe-webhook --project-ref ruuxzilgmuwddcofqecc
npx supabase functions deploy distribute-order-earnings --project-ref ruuxzilgmuwddcofqecc

# 3. Set system key secret
npx supabase secrets set LB_SYSTEM_KEY="lb-sys-RANDOM-HEX" --project-ref ruuxzilgmuwddcofqecc

# 4. Deploy to Firebase
firebase deploy --only hosting:main -P default

# 5. Test the full loop:
#    a. Go to /menu/la-capital-del-sabor (or any storefront slug)
#    b. Add items to cart, checkout with Stripe test card
#    c. Verify: menu_orders.stripe_payment_status = 'paid'
#    d. Verify: lb_card_funding has entries for creator_share + delivery_fee
#    e. Verify: lb_cardholders.card_balance_cents increased
#    f. Check LBCardPage shows earnings breakdown
```

---

## WHAT THIS COMPLETES

After this session, the full loop works:

```
Customer browses menu → adds to cart → Stripe Checkout → pays
  → webhook fires → order marked paid
  → distribute-order-earnings calculates splits:
     • Creator gets subtotal minus credits
     • Onboarder gets 3% (if qualified)
     • Steward gets 2% (if active)
     • Delivery fee to creator (until runner system wired)
  → fund-lb-card called for each recipient
  → LB Card balance increases
  → LBCardPage shows earnings breakdown
```

**This is the first real money flowing through the cooperative.**

---

## INNOVATION COUNT: 1,935 (unchanged)

## FOR THE KEEP
