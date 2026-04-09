/// One-time setup: creates Stripe Products + Prices for LB membership tiers and credits.
/// Run once via `supabase functions invoke stripe-setup-products`.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function stripePost(path: string, key: string, body: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(key + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Stripe error");
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Product 1: Liana Banyan Membership ──
    const membership = await stripePost("/products", stripeKey, {
      name: "Liana Banyan Membership",
      description: "Annual cooperative membership — access to all platform services",
    });

    const memberPrice = await stripePost("/prices", stripeKey, {
      product: membership.id,
      "unit_amount": "500",
      currency: "usd",
      "recurring[interval]": "year",
      nickname: "Member — $5/year",
    });

    const builderPrice = await stripePost("/prices", stripeKey, {
      product: membership.id,
      "unit_amount": "1000",
      currency: "usd",
      "recurring[interval]": "year",
      nickname: "Builder — $10/year",
    });

    const patronPrice = await stripePost("/prices", stripeKey, {
      product: membership.id,
      "unit_amount": "2500",
      currency: "usd",
      "recurring[interval]": "year",
      nickname: "Patron — $25/year",
    });

    // ── Product 2: Liana Banyan Credits ──
    const credits = await stripePost("/products", stripeKey, {
      name: "Liana Banyan Credits",
      description: "Prepaid store credit — $1 = 1 Credit",
    });

    const creditPrice = await stripePost("/prices", stripeKey, {
      product: credits.id,
      "unit_amount": "100",
      currency: "usd",
      nickname: "1 Credit — $1",
    });

    const result = {
      membership_product_id: membership.id,
      prices: {
        member: memberPrice.id,
        builder: builderPrice.id,
        patron: patronPrice.id,
      },
      credits_product_id: credits.id,
      credit_price_id: creditPrice.id,
    };

    console.log("[stripe-setup-products] Created:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe-setup-products] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
