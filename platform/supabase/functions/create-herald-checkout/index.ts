import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES: Record<string, { price: number; name: string }> = {
  torch_bearer: { price: 500, name: "Torch Bearer" },
  herald: { price: 1500, name: "Herald" },
  town_crier: { price: 3500, name: "Town Crier" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const { data } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { tier } = await req.json();
    const tierConfig = TIER_PRICES[tier];
    if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);

    console.log(`[Herald] ${user.email}, tier: ${tier}`);

    const { data: existing } = await supabaseClient
      .from("herald_subscriptions").select("tier, status")
      .eq("user_id", user.id).eq("status", "active").single();

    if (existing && existing.tier === tier) {
      return new Response(
        JSON.stringify({ error: "Already subscribed to this tier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "customer_email": user.email,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": `Herald — ${tierConfig.name}`,
        "line_items[0][price_data][product_data][description]": `Liana Banyan Herald ${tierConfig.name} monthly subscription`,
        "line_items[0][price_data][unit_amount]": tierConfig.price.toString(),
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][quantity]": "1",
        "mode": "subscription",
        "success_url": `${origin}/herald-success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
        "cancel_url": `${origin}/herald`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "herald_subscription",
        "metadata[herald_tier]": tier,
      }),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe error");

    console.log(`[Herald] Session created: ${session.id}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[Herald] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
