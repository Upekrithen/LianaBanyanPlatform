import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
  email?: string;
  items: OrderItem[];
  creator_user_id: string;
  product_label: string;
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

  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return jsonResp(req, { error: "Invalid JSON body" }, 400);
  }

  const { items, creator_user_id, product_label, success_url, cancel_url, metadata } = body;

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

  const total_amount_cents = items.reduce((sum, item) => sum + item.unit_cost_cents * item.quantity, 0);
  if (total_amount_cents < 100) {
    return jsonResp(req, { error: `Total order amount $${(total_amount_cents / 100).toFixed(2)} is below the $1.00 minimum` }, 400);
  }
  log(`Total: ${total_amount_cents} cents across ${items.length} item(s)`);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return jsonResp(req, { error: "Payment service not configured" }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  let buyer_email: string;
  let buyer_user_id: string | null = null;

  if (bearerToken) {
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
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!rawEmail || !rawEmail.includes("@")) {
      return jsonResp(req, { error: "email is required for unauthenticated orders" }, 400);
    }
    buyer_email = rawEmail;
    log(`Anonymous buyer: ${buyer_email}`);
  }

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
      error: "Creator must connect Stripe Express first.",
      code: "CREATOR_NO_STRIPE_CONNECT"
    }, 422);
  }

  if (!connectAccount.payouts_enabled || connectAccount.onboarding_status !== "complete") {
    return jsonResp(req, {
      error: "Creator's Stripe Connect account is not yet active for payouts.",
      code: "CREATOR_STRIPE_CONNECT_INCOMPLETE"
    }, 422);
  }

  const creator_stripe_account_id = connectAccount.stripe_account_id;
  log(`Creator Connect account: ${creator_stripe_account_id}`);

  let stripeCustomerId: string | null = null;
  try {
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${buyer_email}"`)}`,
      { headers: { Authorization: `Basic ${btoa(stripeKey + ":")}` } }
    );
    const searchData = await searchRes.json();
    if (searchRes.ok && searchData.data?.length > 0) {
      stripeCustomerId = searchData.data[0].id;
      log(`Reusing Stripe customer: ${stripeCustomerId}`);
    }
  } catch (e) {
    log(`Customer search non-fatal error: ${String(e)}`);
  }

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

  const application_fee_amount = Math.round(total_amount_cents * 0.167);
  const successUrlFinal = success_url.includes("{CHECKOUT_SESSION_ID}")
    ? success_url
    : `${success_url}${success_url.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

  const stripeParams = new URLSearchParams();
  stripeParams.set("mode", "payment");
  stripeParams.set("success_url", successUrlFinal);
  stripeParams.set("cancel_url", cancel_url);
  if (stripeCustomerId) {
    stripeParams.set("customer", stripeCustomerId);
  } else {
    stripeParams.set("customer_email", buyer_email);
  }

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

  stripeParams.set("payment_intent_data[application_fee_amount]", String(application_fee_amount));
  stripeParams.set("payment_intent_data[transfer_data][destination]", creator_stripe_account_id);
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
      if (k.length <= 40 && v.length <= 500) {
        stripeParams.set(`metadata[${k}]`, v);
      }
    });
  }

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
    await admin.from("custom_orders").update({ status: "failed" }).eq("id", orderId);
    return jsonResp(req, { error: stripeData?.error?.message || "Stripe checkout session creation failed" }, 500);
  }

  await admin.from("custom_orders").update({ stripe_session_id: stripeData.id }).eq("id", orderId);

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
