import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES: Record<string, { price_id: string; amount: number }> = {
  member:  { price_id: Deno.env.get("STRIPE_PRICE_MEMBER")  || "", amount: 500 },
  builder: { price_id: Deno.env.get("STRIPE_PRICE_BUILDER") || "", amount: 1000 },
  patron:  { price_id: Deno.env.get("STRIPE_PRICE_PATRON")  || "", amount: 2500 },
};

const CREDIT_PRICE_ID = Deno.env.get("STRIPE_PRICE_CREDIT") || "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) throw new Error("Not authenticated");

    const { type, tier, quantity } = await req.json() as {
      type: "membership" | "credits";
      tier?: string;
      quantity?: number;
    };

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    // Find or create Stripe customer
    const custSearch = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`,
      { headers: { Authorization: `Basic ${btoa(stripeKey + ":")}` } }
    );
    const custData = await custSearch.json();
    let customerId = custData.data?.[0]?.id;

    if (!customerId) {
      const newCust = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(stripeKey + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: user.email,
          "metadata[user_id]": user.id,
        }),
      });
      const nc = await newCust.json();
      if (!newCust.ok) throw new Error(nc?.error?.message || "Customer creation failed");
      customerId = nc.id;
    }

    let params: Record<string, string>;

    if (type === "membership") {
      const selectedTier = tier || "member";
      const tierConfig = TIER_PRICES[selectedTier];
      if (!tierConfig?.price_id) throw new Error(`Invalid tier: ${selectedTier}`);

      params = {
        customer: customerId,
        "line_items[0][price]": tierConfig.price_id,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        "success_url": `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/membership?canceled=true`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "membership_subscription",
        "metadata[tier]": selectedTier,
        "subscription_data[metadata][user_id]": user.id,
        "subscription_data[metadata][tier]": selectedTier,
      };
    } else if (type === "credits") {
      const qty = Math.max(1, Math.min(10000, quantity || 10));
      if (!CREDIT_PRICE_ID) throw new Error("Credit price not configured");

      params = {
        customer: customerId,
        "line_items[0][price]": CREDIT_PRICE_ID,
        "line_items[0][quantity]": qty.toString(),
        mode: "payment",
        "success_url": `${origin}/credit-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/buy-credits?canceled=true`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "credit_purchase",
        "metadata[credits]": qty.toString(),
        "payment_intent_data[metadata][user_id]": user.id,
        "payment_intent_data[metadata][credits]": qty.toString(),
      };
    } else {
      throw new Error(`Invalid type: ${type}`);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe checkout error");

    console.log(`[checkout-session] ${type} session ${session.id} for ${user.email}`);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[checkout-session] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
