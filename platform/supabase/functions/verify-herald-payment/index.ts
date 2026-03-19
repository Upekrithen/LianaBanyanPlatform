import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_CONFIGS: Record<string, { price: number; baseMultiplier: number; maxMultiplier: number; postsPerMonth: number; chainBonus: number }> = {
  torch_bearer: { price: 5, baseMultiplier: 1.25, maxMultiplier: 2.0, postsPerMonth: 2, chainBonus: 0.05 },
  herald: { price: 15, baseMultiplier: 1.5, maxMultiplier: 3.0, postsPerMonth: 4, chainBonus: 0.10 },
  town_crier: { price: 35, baseMultiplier: 2.0, maxMultiplier: 4.0, postsPerMonth: 8, chainBonus: 0.15 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: authData } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    const { sessionId, tier } = await req.json();
    if (!sessionId || !tier) throw new Error("Missing sessionId or tier");

    console.log(`[Herald Verify] session ${sessionId} for user ${user.id}`);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { "Authorization": `Basic ${btoa(stripeKey + ":")}` } }
    );
    const session = await stripeRes.json();

    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe lookup failed");

    if (session.payment_status !== "paid" || session.metadata?.user_id !== user.id) {
      throw new Error("Payment not verified or user mismatch");
    }

    const config = TIER_CONFIGS[tier];
    if (!config) throw new Error(`Invalid tier: ${tier}`);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { error } = await supabaseClient.from("herald_subscriptions").upsert({
      user_id: user.id,
      tier,
      monthly_price: config.price,
      base_multiplier: config.baseMultiplier,
      chain_bonus: 0,
      max_multiplier: config.maxMultiplier,
      required_posts_per_month: config.postsPerMonth,
      posts_this_month: 0,
      current_month: currentMonth,
      chain_length: 0,
      chain_started_at: now.toISOString(),
      status: "active",
      stripe_subscription_id: session.subscription || null,
      updated_at: now.toISOString(),
    }, { onConflict: "user_id" });

    if (error) throw new Error("Failed to activate subscription");

    console.log(`[Herald Verify] Activated: ${tier} for ${user.id}`);
    return new Response(
      JSON.stringify({ success: true, tier, message: "Herald subscription activated!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Herald Verify] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
