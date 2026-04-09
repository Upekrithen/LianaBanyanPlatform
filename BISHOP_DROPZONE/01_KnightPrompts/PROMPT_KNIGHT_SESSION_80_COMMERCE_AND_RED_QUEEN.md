# KNIGHT SESSION 80 — Commerce Engine Wiring + Mutual LLM Fallback

## Bishop: 024 | Innovation Count: 1,935 | Priority: PHASE 1 (Wire the Gaps)

---

> **TWO GOALS THIS SESSION:**
> 1. Close the earn loop — orders pay → earnings flow to LB Cards
> 2. Star Chamber judges get mutual fallback: Claude ↔ Perplexity. If either provider is down, the other catches it. Seamless to the user.

---

## WHAT ALREADY EXISTS (DO NOT REBUILD)

| Component | File | Status |
|-----------|------|--------|
| Menu checkout | `supabase/functions/create-menu-checkout/index.ts` | LIVE |
| Stripe webhook | `supabase/functions/stripe-webhook/index.ts` | LIVE — menu_order unhandled |
| Order aggregation | `supabase/functions/aggregate-orders/index.ts` | LIVE |
| Fund LB Card | `supabase/functions/fund-lb-card/index.ts` | LIVE |
| Star Chamber analyze | `supabase/functions/star-chamber-analyze/index.ts` | LIVE (K79) — all Claude |
| Commerce tables | storefronts, storefront_items, menu_orders | LIVE |
| LB Card tables | lb_cardholders, lb_cards, lb_card_transactions, lb_card_funding | LIVE |
| Revenue tables | onboarding_credits, steward_agreements | LIVE |

### Secrets already set:
- `ANTHROPIC_API_KEY` ✅
- `PERPLEXITY_API_KEY` ✅

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
    console.error('Earnings distribution failed (will retry):', distErr);
  }

  break;
}
```

### Also verify: `create-menu-checkout/index.ts`

Confirm the Stripe Checkout session metadata includes `payment_type: 'menu_order'` and `order_id`. If not, add:

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

The earnings engine. Called after payment. Calculates splits. Funds LB Cards.

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
const SYSTEM_KEY = Deno.env.get('LB_SYSTEM_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

Deno.serve(async (req) => {
  const { order_id } = await req.json();

  // 1. Fetch order
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

  // 2. Find onboarder and steward
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
  const subtotalCents = Math.round((order.subtotal || 0) * 100);
  const deliveryFeeCents = Math.round((order.delivery_fee || 0) * 100);
  const distributions: Array<{
    user_id: string; amount_cents: number;
    funding_type: string; source_description: string;
  }> = [];

  let creatorCents = subtotalCents;

  if (onboarder) {
    const onboarderCents = Math.round(subtotalCents * (onboarder.credit_percentage / 100));
    creatorCents -= onboarderCents;
    if (onboarderCents > 0) {
      distributions.push({
        user_id: onboarder.user_id, amount_cents: onboarderCents,
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
        user_id: steward.steward_id, amount_cents: stewardCents,
        funding_type: 'steward_fee',
        source_description: `2% steward fee from order ${order.id}`,
      });
    }
  }

  if (creatorCents > 0) {
    distributions.push({
      user_id: storefront.user_id, amount_cents: creatorCents,
      funding_type: 'creator_share',
      source_description: `Creator share from order ${order.id}`,
    });
  }

  if (deliveryFeeCents > 0) {
    distributions.push({
      user_id: storefront.user_id, amount_cents: deliveryFeeCents,
      funding_type: 'delivery_fee',
      source_description: `Delivery fee from order ${order.id}`,
    });
  }

  // 4. Execute via fund-lb-card
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
          user_id: dist.user_id, amount_cents: dist.amount_cents,
          funding_type: dist.funding_type, source_description: dist.source_description,
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
    order_id, distributions: results,
    total_distributed_cents: distributions.reduce((sum, d) => sum + d.amount_cents, 0),
  }), { headers: { 'Content-Type': 'application/json' } });
});
```

---

## TASK 3: Set LB_SYSTEM_KEY Secret

```bash
npx supabase secrets set LB_SYSTEM_KEY="lb-sys-PASTE-A-RANDOM-64-CHAR-HEX-STRING" --project-ref ruuxzilgmuwddcofqecc
```

Generate with PowerShell:
```powershell
-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
```

---

## TASK 4: Earnings Summary on LB Card Page

### File: `src/pages/LBCardPage.tsx`

Add an **Earnings Breakdown** section. Query `lb_card_funding` for current user:

```
┌─────────────────────────────────────────────┐
│  💳 Your LB Card                            │
│  Balance: $14.50                            │
│                                             │
│  Recent Earnings                            │
│  ├── Creator Share    $8.50  (3 orders)     │
│  ├── Delivery Fees    $6.00  (3 orders)     │
│  ├── Onboarding       $0.00                 │
│  └── Steward Fee      $0.00                 │
│                                             │
│  Last 5 Transactions                        │
│  Mar 22  Creator share  +$3.50  Order #47   │
│  Mar 22  Delivery fee   +$2.00  Order #47   │
│  Mar 21  Creator share  +$2.50  Order #46   │
│  ...                                        │
└─────────────────────────────────────────────┘
```

Read from `lb_card_funding WHERE user_id = auth.uid() ORDER BY created_at DESC`.

---

## TASK 5: Mutual LLM Fallback — Claude ↔ Perplexity

### File: `supabase/functions/star-chamber-analyze/index.ts`

**Design principle:** MUTUAL FALLBACK. Every judge stays online no matter what:
- **Oracle, Morpheus, Dredd** → prefer Claude, fall back to Perplexity if Claude is down
- **Red Queen** → prefers Perplexity (web-grounded rule checking), falls back to Claude if Perplexity is down
- User sees identical output regardless of which engine ran. Zero visible difference.

### Replace the existing `callClaude` function with this unified `callLLM`:

```typescript
type LLMProvider = 'claude' | 'perplexity';

/**
 * Unified LLM caller with mutual fallback.
 * - primary: which provider to try first
 * - If primary fails (timeout, auth, rate limit, billing), silently uses the other
 * - If BOTH fail, returns an error message as the analysis text (never throws)
 */
async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  primary: LLMProvider = 'claude'
): Promise<{ text: string; engine: LLMProvider | 'error' }> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');

  const providers: Array<{
    name: LLMProvider;
    call: () => Promise<string | null>;
  }> = [];

  // Build provider list in priority order
  const claudeCall = async (): Promise<string | null> => {
    if (!anthropicKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.content?.[0]?.text;
      return (text && text.length > 50) ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  const perplexityCall = async (): Promise<string | null> => {
    if (!perplexityKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      return (text && text.length > 50) ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  // Set order based on primary preference
  if (primary === 'claude') {
    providers.push({ name: 'claude', call: claudeCall });
    providers.push({ name: 'perplexity', call: perplexityCall });
  } else {
    providers.push({ name: 'perplexity', call: perplexityCall });
    providers.push({ name: 'claude', call: claudeCall });
  }

  // Try primary, then fallback
  for (const provider of providers) {
    const result = await provider.call();
    if (result) {
      console.log(`Judge used engine: ${provider.name}${provider.name !== primary ? ' (fallback)' : ''}`);
      return { text: result, engine: provider.name };
    }
    console.warn(`${provider.name} failed, trying next provider...`);
  }

  // Both failed — return graceful error text (never crash the analysis)
  console.error('ALL LLM providers failed for this judge call');
  return {
    text: 'Analysis temporarily unavailable. Both AI providers are currently unreachable. This judge will provide analysis when service is restored.',
    engine: 'error',
  };
}
```

### Update the judge invocation to use `callLLM`:

```typescript
// Oracle, Morpheus, Red Queen in parallel
const [oracleFull, morpheusFull, redQueenFull] = await Promise.all([
  callLLM(JUDGE_PROMPTS.oracle, caseContext, 'claude'),       // prefers Claude
  callLLM(JUDGE_PROMPTS.morpheus, caseContext, 'claude'),     // prefers Claude
  callLLM(JUDGE_PROMPTS.red_queen, caseContext, 'perplexity'), // prefers Perplexity
]);

const oracleResult = oracleFull.text;
const morpheusResult = morpheusFull.text;
const redQueenResult = redQueenFull.text;

console.log(`Engines — Oracle: ${oracleFull.engine}, Morpheus: ${morpheusFull.engine}, Red Queen: ${redQueenFull.engine}`);

// ... consensus detection stays the same ...

// Dredd (if needed) — prefers Claude, falls back to Perplexity
if (needsDredd) {
  const dreddFull = await callLLM(JUDGE_PROMPTS.dredd, dreddContext, 'claude');
  dreddResult = dreddFull.text;
  console.log(`Dredd engine: ${dreddFull.engine}`);
}
```

### Remove the old `callClaude` function entirely — `callLLM` replaces it.

### Update Red Queen's prompt for Perplexity's web search:

```typescript
red_queen: `You are RED QUEEN, the Rule Compliance judge on the Liana Banyan Star Chamber.
Your role: Enforce platform rules strictly but fairly. You have access to current legal and regulatory information.
Analyze this case by:
1. Identifying which specific platform rules apply (Cost+20% pricing, HEOHO principles, membership agreements)
2. Checking relevant cooperative law, Texas business code, or regulatory requirements if applicable
3. Determining if a violation occurred (yes/no/ambiguous) with cited basis
4. Checking if this is a first offense or repeat pattern
5. Recommending ONE specific action based on rule application
Liana Banyan principles: Cost+20% pricing, HEOHO (Help Each Other Help Ourselves), earned participation, transparent governance, Subchapter T cooperative structure.
Format: 2-3 paragraphs. Cite any rules or laws referenced. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,
```

### Store engine metadata on each analysis:

```typescript
// When writing analyses, append engine info for admin visibility:
const appendEngine = (text: string, engine: string) =>
  text + `\n\n---\n_Engine: ${engine}_`;

await addJudgeAnalysis(caseId, 'oracle', appendEngine(oracleResult, oracleFull.engine));
await addJudgeAnalysis(caseId, 'morpheus', appendEngine(morpheusResult, morpheusFull.engine));
await addJudgeAnalysis(caseId, 'red_queen', appendEngine(redQueenResult, redQueenFull.engine));
if (dreddResult) {
  await addJudgeAnalysis(caseId, 'dredd', appendEngine(dreddResult, dreddFull.engine));
}
```

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Build
npm run build

# 2. Deploy edge functions
npx supabase functions deploy stripe-webhook --project-ref ruuxzilgmuwddcofqecc
npx supabase functions deploy distribute-order-earnings --project-ref ruuxzilgmuwddcofqecc
npx supabase functions deploy star-chamber-analyze --project-ref ruuxzilgmuwddcofqecc

# 3. Set system key (if not already set)
npx supabase secrets set LB_SYSTEM_KEY="lb-sys-RANDOM-HEX" --project-ref ruuxzilgmuwddcofqecc

# 4. Deploy to Firebase
firebase deploy --only hosting:main -P default

# 5. Test Commerce Loop:
#    a. /menu/la-capital-del-sabor → add items → checkout → Stripe test card
#    b. Verify: menu_orders.stripe_payment_status = 'paid'
#    c. Verify: lb_card_funding entries for creator_share + delivery_fee
#    d. Verify: LBCardPage shows earnings breakdown

# 6. Test Mutual Fallback:
#    a. File a Star Chamber case
#    b. Check function logs for engine assignments:
#       "Oracle: claude, Morpheus: claude, Red Queen: perplexity"
#    c. To test Claude fallback → Perplexity: temporarily unset ANTHROPIC_API_KEY
#       Logs should show: "Oracle: perplexity (fallback), Morpheus: perplexity (fallback)"
#    d. To test Perplexity fallback → Claude: temporarily unset PERPLEXITY_API_KEY
#       Logs should show: "Red Queen: claude (fallback)"
#    e. Either way — all 3-4 judge analyses appear normally in the UI
```

---

## WHAT THIS COMPLETES

**Commerce:** First real money flowing through the cooperative:
```
Customer pays → webhook → order marked paid → earnings distributed:
  • Creator: subtotal minus credits
  • Onboarder: 3%    • Steward: 2%
  • Delivery: to creator (until runner system)
→ fund-lb-card → balance increases → LBCardPage shows it
```

**Star Chamber:** Mutual failover. Claude down? Perplexity catches. Perplexity down? Claude catches. Both down? Graceful error text, no crash. User never knows.

---

## INNOVATION COUNT: 1,935 (unchanged)

## FOR THE KEEP
