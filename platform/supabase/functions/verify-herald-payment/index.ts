import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Verify Herald Payment
 * ======================
 * Called after Stripe checkout redirect. Verifies payment and activates subscription.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: authData } = await anonClient.auth.getUser(token);
    const user = authData.user;

    if (!user) throw new Error("Not authenticated");

    const { sessionId, tier } = await req.json();
    if (!sessionId || !tier) throw new Error("Missing sessionId or tier");

    console.log(`[Herald Verify] Verifying session ${sessionId} for user ${user.id}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" || session.metadata?.user_id !== user.id) {
      throw new Error("Payment not verified or user mismatch");
    }

    // Tier configs
    const tierConfigs: Record<string, any> = {
      torch_bearer: { price: 5, baseMultiplier: 1.25, maxMultiplier: 2.0, postsPerMonth: 2, chainBonus: 0.05 },
      herald: { price: 15, baseMultiplier: 1.5, maxMultiplier: 3.0, postsPerMonth: 4, chainBonus: 0.10 },
      town_crier: { price: 35, baseMultiplier: 2.0, maxMultiplier: 4.0, postsPerMonth: 8, chainBonus: 0.15 },
    };

    const config = tierConfigs[tier];
    if (!config) throw new Error(`Invalid tier: ${tier}`);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Upsert herald subscription — activate or upgrade
    const { error } = await supabaseClient
      .from("herald_subscriptions")
      .upsert({
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

    if (error) {
      console.error("[Herald Verify] DB error:", error);
      throw new Error("Failed to activate subscription");
    }

    console.log(`[Herald Verify] Subscription activated: ${tier} for ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, tier, message: "Herald subscription activated!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Herald Verify] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
