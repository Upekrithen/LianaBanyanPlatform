# Knight Marathon Session 19 — Custom Order Checkout (Variable Amount)
## BP091 · 2026-06-22 · **STAGED FOR FOUNDER REVIEW — R1-R7 RATIFIED · HOLD FIRE UNTIL FOUNDER SAYS GO**

**R1-R7 all RATIFIED Founder-direct BP091 2026-06-22:**
- R1: New edge fn `create-custom-order-checkout` (separate from `create-membership-checkout`) ✅
- R2: Stripe Connect Express for creator payouts (83.3% to creator / 16.7% platform) ✅
- R3: New Supabase table `custom_orders` ✅
- R4: Webhook handler extended for `payment_type: "lb_custom_order"` ✅
- R5: $1 minimum (100 cents) ✅
- R6: Separate `/order/` Hugo route on mnemosynec.org ✅
- R7: Stage but HOLD fire until membership flow proves out — **HAS NOW PROVEN: Founder paid $5 successfully 2026-06-22** ✅

**R8: FIRE GATE — Founder discretion. Paste this file to Knight when ready to execute.**

**Model:** Sonnet 4.6 (Knight execution). Bishop strategist composed. Sonnet 4.6 SEG drafted.

---

## FOUNDER DIRECT (verbatim · BP091 2026-06-22 ~14:15 Central)

> *"we need to allow for single payments of any amount, as well. Because of ordering production levels, etc."*

---

## EMPIRICAL STATE (gadget-confirmed by Bishop 2026-06-22 before this dispatch)

| Surface | State |
|---|---|
| `custom_orders` Supabase table | **DOES NOT EXIST** — to be created in Block 1 |
| `member_connect_accounts` table | LIVE (baseline.sql) — columns: `user_id`, `stripe_account_id`, `payouts_enabled`, `onboarding_status` |
| Edge fn `create-membership-checkout` | LIVE · M17 deployed · anonymous + auth paths proven |
| Edge fn `stripe-webhook` | LIVE · handles `checkout.session.completed` by `payment_type` dispatch |
| Stripe account | `acct_1SIIjqRlWRgRXQ3Y` (Stripe Connect platform account) |
| Supabase URL | `https://ruuxzilgmuwddcofqecc.supabase.co` |
| Membership payment | **EMPIRICALLY PROVEN 2026-06-22** — Founder paid $5 successfully; `membership_payments` + `member_profiles` rows confirmed live |
| Hugo `/order/` route on mnemosynec.org | **DOES NOT EXIST** — to be created in Block 4 |
| `create-custom-order-checkout` edge fn | **DOES NOT EXIST** — to be created in Block 2 |
| `create-preorder-checkout` edge fn | EXISTS in ARCHIVE — **do NOT reference** (HexIsle-domain-locked, `founding_run_pledges` table, HexIsle product name prefix) |

---

## SCOPE LINE

**M19 IS:**
- A brand-new `create-custom-order-checkout` edge function that accepts variable line-item arrays and amounts — NOT a copy of `create-preorder-checkout` (domain-locked to HexIsle), NOT a modification of `create-membership-checkout` (subscription-only, $5/year fixed).
- A new `custom_orders` Supabase table purpose-built for one-time variable-amount payments.
- An extension of the existing `stripe-webhook` function to route `payment_type: "lb_custom_order"` events.
- A new static Hugo `/order/` page on mnemosynec.org with a plain HTML form (no React island — membership island is the complex one; orders are simpler).

**M19 IS NOT:**
- Touching the membership flow, `create-membership-checkout`, `membership_payments`, or `member_profiles` in any way.
- Building creator-side Stripe Connect onboarding (that is Marathon 20 — `create-connect-account` + `connect-onboarding-refresh` already exist in platform; they are referenced here but NOT extended).
- Recurring/subscription payments — `mode: "payment"` only, one-time checkout.
- Touching `create-preorder-checkout` or `founding_run_pledges` — those belong to HexIsle's launch arc.

The new edge fn COEXISTS with `create-preorder-checkout` and `create-membership-checkout` as a third independent Stripe entry point.

---

## BLOCK 1 — Bishop-direct: Create `custom_orders` migration (§15 BLOOD — Bishop applies, not Knight)

**Bishop executes this block via psql/REST before Knight wakes. Knight does NOT write migrations.**

Create file:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260622000001_custom_orders_bp091.sql`

```sql
-- custom_orders — variable-amount single payments, any creator, any product label
-- BP091 · M19 · 2026-06-22

CREATE TABLE IF NOT EXISTS public.custom_orders (
  id                        BIGSERIAL PRIMARY KEY,
  buyer_email               TEXT NOT NULL,
  buyer_user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: anon buyers allowed
  creator_user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  creator_stripe_account_id TEXT NOT NULL,
  product_label             TEXT NOT NULL,          -- human name shown on Stripe checkout ("Production Run — Wave 3")
  description               TEXT,
  items_json                JSONB NOT NULL DEFAULT '[]'::jsonb,
                                                    -- [{name, description, unit_cost_cents, quantity}]
  total_amount_cents        INTEGER NOT NULL CHECK (total_amount_cents >= 100),  -- R5: $1 minimum
  currency                  TEXT NOT NULL DEFAULT 'usd',
  stripe_session_id         TEXT UNIQUE,
  stripe_payment_intent     TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata                  JSONB DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at              TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_custom_orders_creator      ON public.custom_orders (creator_user_id);
CREATE INDEX idx_custom_orders_buyer_email  ON public.custom_orders (buyer_email);
CREATE INDEX idx_custom_orders_status       ON public.custom_orders (status);
CREATE INDEX idx_custom_orders_stripe_sess  ON public.custom_orders (stripe_session_id);
CREATE INDEX idx_custom_orders_created_at   ON public.custom_orders (created_at DESC);

-- RLS
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own orders (by email match via function or by user_id)
CREATE POLICY "Buyers view own orders by user_id"
  ON public.custom_orders FOR SELECT
  USING (auth.uid() = buyer_user_id);

-- Creators can see orders for items they sell
CREATE POLICY "Creators view own sale orders"
  ON public.custom_orders FOR SELECT
  USING (auth.uid() = creator_user_id);

-- Service role (edge fns) has full access — enforced by SUPABASE_SERVICE_ROLE_KEY usage in fns
-- No INSERT/UPDATE policy needed for anon/member roles: edge fn uses service role client

COMMENT ON TABLE public.custom_orders IS
  'Variable-amount single-payment orders. Buyer may be anon (email only) or authenticated. Creator must have a Stripe Connect Express account.';
```

**Apply via Bishop psql:**
```bash
psql "$DATABASE_URL" -f platform/supabase/migrations/20260622000001_custom_orders_bp091.sql
```
Or via Supabase dashboard SQL editor (copy-paste).

**Acceptance:** `SELECT COUNT(*) FROM public.custom_orders;` returns `0` — table exists, empty, ready.

---

## BLOCK 2 — Knight: Write `create-custom-order-checkout` edge function

**File to create:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\create-custom-order-checkout\index.ts`

Full implementation Knight writes:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// create-custom-order-checkout — BP091 M19
// Accepts variable line-item arrays from buyers.
// Creator must have a Stripe Connect Express account (member_connect_accounts).
// 83.3% to creator via transfer_data.destination; 16.7% application_fee_amount to platform.
// Supports both anon buyers (email in body) and authenticated buyers (Bearer token).

const ALLOWED_ORIGINS = [
  "https://lianabanyan.com",
  "https://www.lianabanyan.com",
  "https://mnemosynec.org",
  "https://www.mnemosynec.org",
  "https://mnemosynec.ai",
  "https://www.mnemosynec.ai",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResp(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

interface OrderItem {
  name: string;
  description?: string;
  unit_cost_cents: number;
  quantity: number;
}

interface OrderBody {
  email?: string;               // required if no Bearer token
  items: OrderItem[];
  creator_user_id: string;      // UUID of creator receiving payout
  product_label: string;        // shown on Stripe checkout page
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  if (req.method !== "POST") {
    return jsonResp(req, { error: "Method not allowed" }, 405);
  }

  const t0 = Date.now();
  const log = (msg: string) => console.log(`[custom-order +${Date.now() - t0}ms] ${msg}`);
  log("Request received");

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return jsonResp(req, { error: "Invalid JSON body" }, 400);
  }

  const { items, creator_user_id, product_label, success_url, cancel_url, metadata } = body;

  // Required field validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return jsonResp(req, { error: "items array is required and must not be empty" }, 400);
  }
  if (!creator_user_id) {
    return jsonResp(req, { error: "creator_user_id is required" }, 400);
  }
  if (!product_label) {
    return jsonResp(req, { error: "product_label is required" }, 400);
  }
  if (!success_url || !cancel_url) {
    return jsonResp(req, { error: "success_url and cancel_url are required" }, 400);
  }

  // Item validation
  for (const item of items) {
    if (!item.name || typeof item.name !== "string") {
      return jsonResp(req, { error: "Each item must have a name (string)" }, 400);
    }
    if (typeof item.unit_cost_cents !== "number" || item.unit_cost_cents < 1) {
      return jsonResp(req, { error: `Item "${item.name}": unit_cost_cents must be a positive integer` }, 400);
    }
    if (typeof item.quantity !== "number" || item.quantity < 1 || !Number.isInteger(item.quantity)) {
      return jsonResp(req, { error: `Item "${item.name}": quantity must be a positive integer` }, 400);
    }
  }

  // Total amount calculation — R5: must be >= 100 cents ($1.00 minimum)
  const total_amount_cents = items.reduce(
    (sum, item) => sum + item.unit_cost_cents * item.quantity,
    0
  );
  if (total_amount_cents < 100) {
    return jsonResp(req, {
      error: `Total order amount $${(total_amount_cents / 100).toFixed(2)} is below the $1.00 minimum`
    }, 400);
  }
  log(`Total: ${total_amount_cents} cents across ${items.length} item(s)`);

  // ── Stripe + Supabase setup ─────────────────────────────────────────────────
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return jsonResp(req, { error: "Payment service not configured" }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // ── Buyer identity resolution ───────────────────────────────────────────────
  // Two paths: authenticated buyer (Bearer token) or anonymous buyer (email in body).
  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  let buyer_email: string;
  let buyer_user_id: string | null = null;

  if (bearerToken) {
    // Authenticated path: resolve email from JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
    );
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(bearerToken);
    if (authErr || !user?.email) {
      log(`Auth failed: ${authErr?.message}`);
      return jsonResp(req, { error: "Invalid or expired token" }, 401);
    }
    buyer_email = user.email;
    buyer_user_id = user.id;
    log(`Authenticated buyer: ${buyer_email}`);
  } else {
    // Anonymous path: email required in body
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!rawEmail || !rawEmail.includes("@")) {
      return jsonResp(req, { error: "email is required for unauthenticated orders" }, 400);
    }
    buyer_email = rawEmail;
    log(`Anonymous buyer: ${buyer_email}`);
  }

  // ── Creator Stripe Connect account lookup ───────────────────────────────────
  // Requires creator to have completed Stripe Connect Express onboarding.
  // Uses member_connect_accounts table (already live — baseline.sql).
  const { data: connectAccount, error: connectErr } = await admin
    .from("member_connect_accounts")
    .select("stripe_account_id, payouts_enabled, onboarding_status")
    .eq("user_id", creator_user_id)
    .maybeSingle();

  if (connectErr) {
    log(`Connect account lookup error: ${connectErr.message}`);
    return jsonResp(req, { error: "Could not verify creator payment account" }, 500);
  }

  if (!connectAccount?.stripe_account_id) {
    return jsonResp(req, {
      error: "Creator must connect Stripe Express first. They have not completed Stripe Connect onboarding.",
      code: "CREATOR_NO_STRIPE_CONNECT"
    }, 422);
  }

  if (!connectAccount.payouts_enabled || connectAccount.onboarding_status !== "complete") {
    return jsonResp(req, {
      error: "Creator's Stripe Connect account is not yet active for payouts. Onboarding incomplete.",
      code: "CREATOR_STRIPE_CONNECT_INCOMPLETE"
    }, 422);
  }

  const creator_stripe_account_id = connectAccount.stripe_account_id;
  log(`Creator Connect account: ${creator_stripe_account_id}`);

  // ── Stripe customer dedup ───────────────────────────────────────────────────
  // Reuse existing Stripe customer by email to avoid duplicate customer records.
  let stripeCustomerId: string | null = null;
  try {
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${buyer_email}"`)}`,
      {
        headers: {
          Authorization: `Basic ${btoa(stripeKey + ":")}`,
        },
      }
    );
    const searchData = await searchRes.json();
    if (searchRes.ok && searchData.data?.length > 0) {
      stripeCustomerId = searchData.data[0].id;
      log(`Reusing Stripe customer: ${stripeCustomerId}`);
    }
  } catch (e) {
    log(`Customer search non-fatal error: ${String(e)} — will use customer_email fallback`);
  }

  // ── Insert pending custom_orders row BEFORE Stripe call ─────────────────────
  // Pledge-before-Stripe pattern: DB row exists before external call.
  // If Stripe fails, row stays in "pending" status for audit; no orphaned Stripe sessions.
  const { data: orderRow, error: insertErr } = await admin
    .from("custom_orders")
    .insert({
      buyer_email,
      buyer_user_id,
      creator_user_id,
      creator_stripe_account_id,
      product_label,
      description: body.metadata?.description ?? null,
      items_json: items,
      total_amount_cents,
      currency: "usd",
      status: "pending",
      metadata: metadata ?? {},
    })
    .select("id")
    .single();

  if (insertErr || !orderRow) {
    log(`custom_orders insert error: ${insertErr?.message}`);
    return jsonResp(req, { error: "Failed to record order" }, 500);
  }
  const orderId = orderRow.id;
  log(`Pending order row created: id=${orderId}`);

  // ── Build Stripe Checkout params ────────────────────────────────────────────
  // mode=payment (one-time), NOT subscription.
  // price_data used (not price ID) because amounts are variable per order.
  // application_fee_amount = 16.7% to platform; remainder flows to creator Connect account.
  const application_fee_amount = Math.round(total_amount_cents * 0.167);
  const successUrlFinal = success_url.includes("{CHECKOUT_SESSION_ID}")
    ? success_url
    : `${success_url}${success_url.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

  const stripeParams = new URLSearchParams();
  stripeParams.set("mode", "payment");
  stripeParams.set("success_url", successUrlFinal);
  stripeParams.set("cancel_url", cancel_url);
  stripeParams.set("customer_email", buyer_email);
  if (stripeCustomerId) {
    stripeParams.set("customer", stripeCustomerId);
    stripeParams.delete("customer_email"); // customer= supersedes customer_email
  }

  // Line items — one per item in the array, using price_data for variable amounts
  items.forEach((item, idx) => {
    const prefix = `line_items[${idx}]`;
    stripeParams.set(`${prefix}[price_data][currency]`, "usd");
    stripeParams.set(`${prefix}[price_data][unit_amount]`, String(item.unit_cost_cents));
    stripeParams.set(`${prefix}[price_data][product_data][name]`, item.name);
    if (item.description) {
      stripeParams.set(`${prefix}[price_data][product_data][description]`, item.description);
    }
    stripeParams.set(`${prefix}[quantity]`, String(item.quantity));
  });

  // Stripe Connect: direct charge to platform, transfer to creator
  stripeParams.set("payment_intent_data[application_fee_amount]", String(application_fee_amount));
  stripeParams.set("payment_intent_data[transfer_data][destination]", creator_stripe_account_id);

  // Metadata for webhook routing
  stripeParams.set("metadata[payment_type]", "lb_custom_order");
  stripeParams.set("metadata[order_id]", String(orderId));
  stripeParams.set("metadata[creator_user_id]", creator_user_id);
  stripeParams.set("metadata[buyer_email]", buyer_email);
  if (buyer_user_id) {
    stripeParams.set("metadata[buyer_user_id]", buyer_user_id);
  }
  stripeParams.set("metadata[product_label]", product_label);
  if (metadata) {
    Object.entries(metadata).forEach(([k, v]) => {
      // Stripe metadata keys must be <= 40 chars; values <= 500 chars
      if (k.length <= 40 && v.length <= 500) {
        stripeParams.set(`metadata[${k}]`, v);
      }
    });
  }

  // ── Stripe API call ─────────────────────────────────────────────────────────
  log(`Calling Stripe checkout.sessions.create — fee: ${application_fee_amount}¢ → ${creator_stripe_account_id}`);
  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(stripeKey + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: stripeParams,
  });

  const stripeData = await stripeRes.json();
  if (!stripeRes.ok || !stripeData.url) {
    log(`Stripe error: ${stripeData?.error?.message}`);
    // Mark order as failed so it doesn't sit in "pending" limbo
    await admin
      .from("custom_orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    return jsonResp(req, {
      error: stripeData?.error?.message || "Stripe checkout session creation failed"
    }, 500);
  }

  // ── Update pending row with Stripe session ID ───────────────────────────────
  await admin
    .from("custom_orders")
    .update({ stripe_session_id: stripeData.id })
    .eq("id", orderId);

  log(`Checkout session created: ${stripeData.id} for order ${orderId}`);
  return jsonResp(req, {
    url: stripeData.url,
    session_id: stripeData.id,
    order_id: orderId,
    total_amount_cents,
    application_fee_cents: application_fee_amount,
    creator_net_cents: total_amount_cents - application_fee_amount,
  });
});
```

**Deploy command (Knight runs):**
```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\platform
supabase functions deploy create-custom-order-checkout
```

**Acceptance:**
- `curl -X OPTIONS https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/create-custom-order-checkout -H "Origin: https://mnemosynec.org"` returns 200 with CORS header.
- Smoke POST (Block 5) returns `{url: "https://checkout.stripe.com/...", order_id: <N>}` with HTTP 200.

---

## BLOCK 3 — Knight: Extend `stripe-webhook` to handle `lb_custom_order`

**File to edit:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\stripe-webhook\index.ts`

The existing `handleCheckoutCompleted` function dispatches on `session.metadata?.payment_type`. Knight adds one new branch.

**In the `switch(type)` block — no change needed** (already routes all `checkout.session.completed` through `handleCheckoutCompleted`).

**In `handleCheckoutCompleted` function — add new branch after existing `paymentType` checks:**

Find the pattern (around line ~115 in current file):
```typescript
async function handleCheckoutCompleted(admin: SupabaseAdmin, session: any) {
  const userId = session.metadata?.user_id;
  const paymentType = session.metadata?.payment_type;

  if (!userId) {
    console.warn("[webhook] checkout.session.completed missing user_id");
    return;
  }
```

Note: for `lb_custom_order`, `user_id` may be absent (anon buyer) — so the early `!userId` guard must NOT block `lb_custom_order`. Knight must restructure that guard:

```typescript
async function handleCheckoutCompleted(admin: SupabaseAdmin, session: any) {
  const userId = session.metadata?.user_id;       // may be absent for anon buyers
  const paymentType = session.metadata?.payment_type;

  // ── lb_custom_order ──────────────────────────────────────────────────────
  if (paymentType === "lb_custom_order") {
    await handleCustomOrderCompleted(admin, session);
    return;
  }

  // All other payment types require user_id in metadata
  if (!userId) {
    console.warn("[webhook] checkout.session.completed missing user_id for paymentType:", paymentType);
    return;
  }

  // ... rest of existing handlers unchanged ...
```

**New handler function to add at the bottom of the file:**

```typescript
async function handleCustomOrderCompleted(admin: SupabaseAdmin, session: any) {
  const orderId = session.metadata?.order_id;
  const paymentIntent = session.payment_intent;

  if (!orderId) {
    console.error("[webhook] lb_custom_order: missing order_id in metadata");
    return;
  }

  console.log(`[webhook] lb_custom_order: completing order ${orderId}, pi=${paymentIntent}`);

  const { error } = await admin
    .from("custom_orders")
    .update({
      status: "completed",
      stripe_payment_intent: paymentIntent ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", parseInt(orderId, 10))
    .eq("status", "pending"); // safety: only transition from pending, never overwrite completed

  if (error) {
    console.error(`[webhook] lb_custom_order: failed to update order ${orderId}:`, error.message);
    throw error; // re-throw so webhook returns 500 and Stripe retries
  }

  console.log(`[webhook] lb_custom_order: order ${orderId} marked completed`);
}
```

**Deploy command (Knight runs):**
```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\platform
supabase functions deploy stripe-webhook
```

**Acceptance:**
- After Block 5 smoke test payment, `SELECT status, completed_at FROM custom_orders WHERE id = <smoke_order_id>` returns `status='completed'` and a non-null `completed_at`.

---

## BLOCK 4 — Knight: Hugo `/order/` route on mnemosynec.org

**Two files to create. No React island — static HTML form. Order pages are simpler than membership; a form POST to the edge fn is clean and sufficient for V1.**

### File 1 — Content

`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\order\_index.md`

```yaml
---
title: "Place a Custom Order"
description: "Order production runs, custom services, and one-time items from cooperative creators."
layout: "order"
---
```

### File 2 — Layout

`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\order\list.html`

```html
{{ define "main" }}
<section class="order-page">
  <div class="order-container">
    <h1>Place a Custom Order</h1>
    <p class="order-subtitle">Single payment · any amount · 83.3% to your creator</p>

    <form id="order-form" class="order-form" novalidate>
      <div class="form-group">
        <label for="order-email">Your email</label>
        <input type="email" id="order-email" name="email" required
               placeholder="you@example.com" autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="creator-id">Creator User ID</label>
        <input type="text" id="creator-id" name="creator_user_id" required
               placeholder="Paste creator UUID here" />
        <span class="field-hint">Your creator will give you this when they invoice you.</span>
      </div>

      <div class="form-group">
        <label for="product-label">Product / Order name</label>
        <input type="text" id="product-label" name="product_label" required
               placeholder="e.g. Production Run — Wave 3" maxlength="200" />
      </div>

      <div id="items-container">
        <div class="item-row" data-index="0">
          <h3>Item 1</h3>
          <div class="form-group">
            <label>Item name</label>
            <input type="text" name="item_name_0" required placeholder="e.g. Custom T-shirt" />
          </div>
          <div class="form-group">
            <label>Unit price ($)</label>
            <input type="number" name="item_price_0" required min="0.01" step="0.01" placeholder="25.00" />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" name="item_qty_0" required min="1" step="1" value="1" />
          </div>
        </div>
      </div>

      <button type="button" id="add-item-btn" class="btn-secondary">+ Add another item</button>

      <div class="order-summary" id="order-summary" style="display:none;">
        <strong>Order total: <span id="total-display">$0.00</span></strong>
        <small>Platform: 16.7% · Creator receives: 83.3%</small>
      </div>

      <div class="form-group" id="form-error" style="display:none; color: var(--color-error);">
      </div>

      <button type="submit" id="submit-btn" class="btn-primary">
        Proceed to secure payment
      </button>
    </form>
  </div>
</section>

<script>
(function() {
  const EDGE_FN = "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/create-custom-order-checkout";
  const SUPABASE_ANON_KEY = {{ printf "%q" (.Site.Params.supabaseAnonKey) }};
  const SUCCESS_URL = "{{ .Site.BaseURL }}order/success/?session_id={CHECKOUT_SESSION_ID}";
  const CANCEL_URL  = "{{ .Site.BaseURL }}order/";

  let itemCount = 1;

  // ── Add item row ──────────────────────────────────────────────────────────
  document.getElementById("add-item-btn").addEventListener("click", function() {
    const idx = itemCount++;
    const container = document.getElementById("items-container");
    const row = document.createElement("div");
    row.className = "item-row";
    row.dataset.index = String(idx);
    row.innerHTML = `
      <h3>Item ${idx + 1} <button type="button" class="remove-item" data-idx="${idx}">Remove</button></h3>
      <div class="form-group">
        <label>Item name</label>
        <input type="text" name="item_name_${idx}" required placeholder="Item name" />
      </div>
      <div class="form-group">
        <label>Unit price ($)</label>
        <input type="number" name="item_price_${idx}" required min="0.01" step="0.01" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label>Quantity</label>
        <input type="number" name="item_qty_${idx}" required min="1" step="1" value="1" />
      </div>
    `;
    container.appendChild(row);
    row.querySelector(".remove-item").addEventListener("click", function() {
      row.remove();
      updateTotal();
    });
    updateTotal();
  });

  // ── Live total calculation ────────────────────────────────────────────────
  function updateTotal() {
    const rows = document.querySelectorAll(".item-row");
    let total = 0;
    rows.forEach(function(row) {
      const idx = row.dataset.index;
      const price = parseFloat(row.querySelector(`[name="item_price_${idx}"]`)?.value || "0") || 0;
      const qty   = parseInt(row.querySelector(`[name="item_qty_${idx}"]`)?.value || "1", 10) || 1;
      total += price * qty;
    });
    const summary = document.getElementById("order-summary");
    const display = document.getElementById("total-display");
    if (total > 0) {
      summary.style.display = "block";
      display.textContent = "$" + total.toFixed(2);
    } else {
      summary.style.display = "none";
    }
  }
  document.getElementById("items-container").addEventListener("input", updateTotal);

  // ── Form submit ───────────────────────────────────────────────────────────
  document.getElementById("order-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const errEl = document.getElementById("form-error");
    const submitBtn = document.getElementById("submit-btn");
    errEl.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Opening payment…";

    const email         = document.getElementById("order-email").value.trim();
    const creatorId     = document.getElementById("creator-id").value.trim();
    const productLabel  = document.getElementById("product-label").value.trim();

    // Build items array
    const rows = document.querySelectorAll(".item-row");
    const items = [];
    for (const row of rows) {
      const idx   = row.dataset.index;
      const name  = row.querySelector(`[name="item_name_${idx}"]`)?.value?.trim() || "";
      const price = parseFloat(row.querySelector(`[name="item_price_${idx}"]`)?.value || "0") || 0;
      const qty   = parseInt(row.querySelector(`[name="item_qty_${idx}"]`)?.value || "1", 10) || 1;
      if (!name) { showError("Each item needs a name."); return; }
      if (price <= 0) { showError(`Item "${name}": price must be greater than $0.`); return; }
      items.push({ name, unit_cost_cents: Math.round(price * 100), quantity: qty });
    }

    if (items.length === 0) { showError("Add at least one item."); return; }
    const totalCents = items.reduce((s, i) => s + i.unit_cost_cents * i.quantity, 0);
    if (totalCents < 100) { showError("Order total must be at least $1.00."); return; }

    try {
      const res = await fetch(EDGE_FN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Origin": window.location.origin,
        },
        body: JSON.stringify({
          email,
          items,
          creator_user_id: creatorId,
          product_label: productLabel,
          success_url: SUCCESS_URL,
          cancel_url: CANCEL_URL,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        showError(data.error || "Could not create checkout session. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      showError("Network error. Please check your connection and try again.");
      console.error("[order] fetch error:", err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Proceed to secure payment";
    }

    function showError(msg) {
      errEl.textContent = msg;
      errEl.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Proceed to secure payment";
    }
  });
})();
</script>
{{ end }}
```

### File 3 — Success page

`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\order\success\_index.md`

```yaml
---
title: "Order Placed"
description: "Your order is confirmed."
layout: "order-success"
---
```

`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\order\success.html` (or add `order-success` as a new layout):

```html
{{ define "main" }}
<section class="order-success-page">
  <div class="success-container">
    <h1>Order Confirmed</h1>
    <p>Your payment is complete. The creator will be notified.</p>
    <p>You'll receive a confirmation email from Stripe at the address you provided.</p>
    <a href="{{ .Site.BaseURL }}" class="btn-primary">Return home</a>
  </div>
</section>
{{ end }}
```

**Build + deploy command (Knight runs):**
```bash
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --config config-mnemosynec.toml --minify
firebase deploy --only hosting:mnemosyne
```

**Acceptance:**
- `https://mnemosynec.org/order/` returns 200.
- Page renders the order form with at least one item row visible.
- JavaScript total calculation updates live as prices/quantities change.
- `https://mnemosynec.org/order/success/` returns 200.

---

## BLOCK 5 — Bishop empirical smoke test with a $10 test order

**Bishop executes this after Knight's deploy receipt. NOT Knight's job.**

Bishop runs the following curl smoke test from PowerShell to confirm the edge function is live and returning a Stripe checkout URL:

```powershell
$body = @{
  email            = "bishop-smoke@lianabanyan.com"
  creator_user_id  = "<FOUNDER_USER_UUID_FROM_member_profiles>"
  product_label    = "Bishop Smoke Test — Production Run Wave 1"
  success_url      = "https://mnemosynec.org/order/success/"
  cancel_url       = "https://mnemosynec.org/order/"
  items            = @(
    @{
      name             = "Test Widget"
      description      = "Bishop smoke test item — do not fulfill"
      unit_cost_cents  = 1000
      quantity         = 1
    }
  )
} | ConvertTo-Json -Depth 5

$res = Invoke-RestMethod `
  -Uri "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/create-custom-order-checkout" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "apikey"       = "<SUPABASE_ANON_KEY>"
    "Origin"       = "https://mnemosynec.org"
  } `
  -Body $body

$res | ConvertTo-Json
```

**Expected response shape:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "session_id": "cs_live_...",
  "order_id": 1,
  "total_amount_cents": 1000,
  "application_fee_cents": 167,
  "creator_net_cents": 833
}
```

**Note:** Smoke test requires Founder's UUID to be the `creator_user_id` because the Founder's Connect account is the only verified one. If Founder has not yet completed Stripe Express onboarding under their user account, the test will return `CREATOR_NO_STRIPE_CONNECT` — which is the correct behavior and proves the guard works.

Bishop then verifies via Supabase REST:
```
GET https://ruuxzilgmuwddcofqecc.supabase.co/rest/v1/custom_orders?order=created_at.desc&limit=1
Authorization: Bearer <SERVICE_ROLE_KEY>
apikey: <SERVICE_ROLE_KEY>
```
Expected: 1 row with `status='pending'` and `stripe_session_id='cs_live_...'`.

---

## VERIFICATION GATES (T1-T12)

| # | Gate | Pass criteria |
|---|---|---|
| T1 | Migration applied | `SELECT COUNT(*) FROM custom_orders` returns 0 (table exists, no error) |
| T2 | Edge fn deployed | `curl -X OPTIONS .../create-custom-order-checkout` returns 200 with CORS headers |
| T3 | CORS preflight | `Origin: https://mnemosynec.org` header in OPTIONS → `Access-Control-Allow-Origin: https://mnemosynec.org` |
| T4 | Missing creator guard | POST without `creator_user_id` → 400 with helpful error |
| T5 | No Stripe Connect guard | POST with valid body but creator has no Connect account → 422 with `CREATOR_NO_STRIPE_CONNECT` code |
| T6 | $1 minimum guard | Items summing to $0.99 → 400 with minimum error |
| T7 | Successful smoke checkout | Valid POST → 200 with `{url: "https://checkout.stripe.com/...", order_id: N}` |
| T8 | DB row created | `custom_orders` row exists with `status='pending'` and matching `stripe_session_id` |
| T9 | Webhook routing | `stripe-webhook` does NOT block on missing `user_id` for `lb_custom_order` events |
| T10 | Webhook completes | After simulated `checkout.session.completed` event → `custom_orders` row `status='completed'`, `completed_at` non-null |
| T11 | Hugo `/order/` live | `https://mnemosynec.org/order/` returns 200, form renders, no JS console errors |
| T12 | Hugo `/order/success/` live | `https://mnemosynec.org/order/success/` returns 200 |

---

## OUT OF SCOPE (do NOT do in this Marathon)

- **Creator Stripe Connect onboarding flow** — `create-connect-account` + `connect-onboarding-refresh` already exist in `platform/supabase/functions/`. Marathon 20 will expose these to creators via a UI at `/dashboard/payouts/`. M19 does NOT modify them.
- **Order history UI** — no buyer-facing order listing page in M19. V1 is Stripe email confirmation only.
- **Creator dashboard showing incoming orders** — Marathon 20.
- **Marks accrual for orders** — no Marks clearing in V1. Marks layer composes in separately.
- **Recurring/subscription orders** — `mode: "payment"` only in M19. Subscriptions are a separate flow.
- **HexIsle / `create-preorder-checkout` / `founding_run_pledges`** — untouched.
- **`create-membership-checkout` / `membership_payments` / `member_profiles`** — untouched.
- **React island for `/order/`** — static HTML form is sufficient for V1 and avoids the build complexity of Block 1 from M17.

---

## RATIFICATION GATES (Founder)

| # | Gate | Status |
|---|---|---|
| R1 | New edge fn `create-custom-order-checkout` separate from `create-membership-checkout` | **RATIFIED 2026-06-22** |
| R2 | Stripe Connect Express 83.3% creator / 16.7% platform split | **RATIFIED 2026-06-22** |
| R3 | New `custom_orders` Supabase table | **RATIFIED 2026-06-22** |
| R4 | `stripe-webhook` extended for `payment_type: "lb_custom_order"` | **RATIFIED 2026-06-22** |
| R5 | $1 minimum order amount | **RATIFIED 2026-06-22** |
| R6 | Separate `/order/` Hugo route on mnemosynec.org | **RATIFIED 2026-06-22** |
| R7 | Stage-but-hold-fire until membership proves out | **RATIFIED 2026-06-22 · UNBLOCKED: Founder paid $5 successfully** |
| R8 | FIRE GATE — Founder discretion | **PENDING FOUNDER GO** |

---

## ESTIMATED WALL CLOCK

| Block | Task | Est. time |
|---|---|---|
| Block 1 | Bishop applies migration (psql) | 10 min |
| Block 2 | Knight writes + deploys `create-custom-order-checkout` | 2-3 hrs |
| Block 3 | Knight extends `stripe-webhook` (surgical — one new branch + one new function) | 45 min |
| Block 4 | Knight creates Hugo `/order/` route (3 files) + deploys mnemosynec.org | 1-1.5 hrs |
| Block 5 | Bishop smoke test + DB verification | 20 min |
| T1-T12 | Verification gates | 1 hr |
| **Total** | **Single Knight session** | **5.5-6.5 hrs** |

---

## ANTICIPATED RETURN ARTIFACTS

Knight's KniPr return MUST include:

1. `create-custom-order-checkout` deploy confirmation (Supabase CLI output, function URL)
2. `stripe-webhook` deploy confirmation
3. Smoke POST curl/PowerShell response — full JSON including `order_id`, `session_id`, `total_amount_cents`
4. Supabase REST verification — `custom_orders` row count + first row `status` field
5. `https://mnemosynec.org/order/` live URL — confirmed HTTP 200
6. `https://mnemosynec.org/order/success/` live URL — confirmed HTTP 200
7. Diff summary: files added/modified in `platform/supabase/functions/` + `Cephas/cephas-hugo/`
8. T1-T12 verification: ALL PASS or FAIL with reason
9. Time-to-ship (start timestamp + end timestamp)

---

— Bishop Opus 4.7 · BP091 · 2026-06-22 · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes when Founder fires R8
