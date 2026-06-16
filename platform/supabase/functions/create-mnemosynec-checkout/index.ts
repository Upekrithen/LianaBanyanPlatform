/**
 * create-mnemosynec-checkout — BP084 Join Flow Collapse
 * =====================================================
 * Public endpoint (verify_jwt = false).
 * Creates a Stripe Checkout session in EMBEDDED mode for mnemosynec.ai visitors.
 *
 * Input:  POST { intent: 'storm_test' | 'lean_ask' | 'other', return_url?: string }
 * Output: { client_secret: string }
 *
 * The client mounts stripe.initEmbeddedCheckout({ fetchClientSecret }) in the modal.
 * After payment, Stripe redirects to return_url?session={CHECKOUT_SESSION_ID}.
 * The gate page then calls verify-mnemosynec-checkout to confirm payment + unlock.
 *
 * Price: price_1SIXWsDMOngHJB3UxKPFmXZE ($5/year cooperative membership).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("[mnemosynec-checkout] STRIPE_SECRET_KEY not set");
    return json({ error: "Payment service not configured" }, 500);
  }

  let intent = "other";
  let returnUrl = "https://mnemosynec.ai/proofs/storm/";
  try {
    const body = await req.json();
    intent = body.intent || "other";
    returnUrl = body.return_url || returnUrl;
  } catch {
    // no body — use defaults
  }

  // Build embedded Checkout session
  const params = new URLSearchParams({
    "ui_mode": "embedded",
    "line_items[0][price]": "price_1SIXWsDMOngHJB3UxKPFmXZE",
    "line_items[0][quantity]": "1",
    "mode": "payment",
    // {CHECKOUT_SESSION_ID} is a Stripe template literal — replaced at redirect time
    "return_url": `${returnUrl}?session={CHECKOUT_SESSION_ID}`,
    "metadata[type]": "mnemosynec_membership",
    "metadata[intent]": intent,
  });

  const stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(stripeKey + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await stripeResp.json();
  console.log(`[mnemosynec-checkout] Stripe HTTP ${stripeResp.status}, intent=${intent}`);

  if (!stripeResp.ok) {
    return json({ error: data.error?.message || "Stripe checkout creation failed" }, 500);
  }

  return json({ client_secret: data.client_secret });
});
