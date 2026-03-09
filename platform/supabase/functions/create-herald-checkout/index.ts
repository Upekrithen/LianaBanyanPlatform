import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Herald Subscription Checkout
 * =============================
 * Creates a Stripe Checkout Session for Herald tier subscriptions.
 * Tiers: torch_bearer ($5/mo), herald ($15/mo), town_crier ($35/mo)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { tier } = await req.json();

    // Validate tier
    const tierPrices: Record<string, { price: number; name: string }> = {
      torch_bearer: { price: 500, name: "Torch Bearer" },   // $5/mo
      herald: { price: 1500, name: "Herald" },               // $15/mo
      town_crier: { price: 3500, name: "Town Crier" },       // $35/mo
    };

    const tierConfig = tierPrices[tier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    console.log(`[Herald] Creating checkout for ${user.email}, tier: ${tier}`);

    // Check for existing active subscription
    const { data: existing } = await supabaseClient
      .from("herald_subscriptions")
      .select("tier, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existing && existing.tier === tier) {
      return new Response(
        JSON.stringify({ error: "Already subscribed to this tier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a recurring subscription checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Herald — ${tierConfig.name}`,
              description: `Liana Banyan Herald ${tierConfig.name} monthly subscription`,
            },
            unit_amount: tierConfig.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/herald-success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${req.headers.get("origin")}/herald`,
      metadata: {
        user_id: user.id,
        payment_type: "herald_subscription",
        herald_tier: tier,
      },
    });

    console.log(`[Herald] Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Herald] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
