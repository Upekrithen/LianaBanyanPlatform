import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * BP079 Wave B — Create Food Node Subscription Checkout
 *
 * Creates a Stripe Checkout Session for a weekly food subscription.
 *
 * Request body:
 * {
 *   food_business_entity_id: string,    // entity_memberships.id
 *   weekly_intake: number,              // 1-7 meals per week
 *   delivery_day: string,               // 'monday' | 'tuesday' | ...
 *   introducer_user_id?: string         // Red Carpet attribution
 * }
 *
 * Response:
 * {
 *   url: string  // Stripe Checkout URL
 * }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const t0 = Date.now();
  const log = (msg: string) => console.log(`[FoodNodeCheckout +${Date.now() - t0}ms] ${msg}`);
  log("Request received");

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return jsonResponse({ error: "No authorization" }, 401);
    }

    // Parse request body
    const body = await req.json();
    const {
      food_business_entity_id,
      weekly_intake = 1,
      delivery_day,
      introducer_user_id
    } = body;

    if (!food_business_entity_id) {
      return jsonResponse({ error: "food_business_entity_id required" }, 400);
    }

    if (!delivery_day || !['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(delivery_day)) {
      return jsonResponse({ error: "Valid delivery_day required" }, 400);
    }

    log("Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    log("Authenticating user");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user?.email) {
      log(`Auth failed: ${authError?.message}`);
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    log(`Authenticated: ${user.email}`);

    // Verify entity_memberships exists
    log("Verifying food business entity");
    const { data: entity, error: entityError } = await supabaseClient
      .from("entity_memberships")
      .select("id, entity_name")
      .eq("id", food_business_entity_id)
      .maybeSingle();

    if (entityError || !entity) {
      log(`Entity not found: ${food_business_entity_id}`);
      return jsonResponse({ error: "Food business entity not found" }, 404);
    }

    // Check for existing active subscription
    log("Checking for existing subscription");
    const { data: existingSub } = await supabaseClient
      .from("food_node_subscriptions")
      .select("id, status")
      .eq("subscriber_user_id", user.id)
      .eq("food_business_entity_id", food_business_entity_id)
      .in("status", ["active", "pending"])
      .maybeSingle();

    if (existingSub) {
      log(`Existing ${existingSub.status} subscription found`);
      return jsonResponse({
        error: `You already have a ${existingSub.status} subscription to this food business`
      }, 400);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("STRIPE_SECRET_KEY not set");
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const foodNodePriceId = Deno.env.get("STRIPE_PRICE_FOOD_NODE_WEEKLY");
    if (!foodNodePriceId) {
      log("STRIPE_PRICE_FOOD_NODE_WEEKLY not set");
      return jsonResponse({ error: "Food subscription pricing not configured" }, 500);
    }

    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    log("Creating Stripe Checkout Session");

    // Stripe API call
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "success_url": `${origin}/dashboard?food_sub_success=true`,
        "cancel_url": `${origin}/food-subscriptions?canceled=true`,
        "customer_email": user.email,
        "client_reference_id": user.id,
        "line_items[0][price]": foodNodePriceId,
        "line_items[0][quantity]": weekly_intake.toString(),
        "metadata[subscriber_user_id]": user.id,
        "metadata[food_business_entity_id]": food_business_entity_id,
        "metadata[food_business_name]": entity.entity_name || "Unknown",
        "metadata[weekly_intake]": weekly_intake.toString(),
        "metadata[delivery_day]": delivery_day,
        "metadata[introducer_user_id]": introducer_user_id || "",
        "metadata[subscription_type]": "food_node",
        "subscription_data[metadata][subscription_type]": "food_node",
        "subscription_data[metadata][subscriber_user_id]": user.id,
        "subscription_data[metadata][food_business_entity_id]": food_business_entity_id,
      }).toString(),
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      log(`Stripe error: ${errText}`);
      return jsonResponse({ error: "Stripe API error", details: errText }, 500);
    }

    const session = await stripeRes.json();
    log(`Stripe session created: ${session.id}`);

    // Create pending subscription record
    log("Creating pending subscription record");
    const { error: insertError } = await supabaseClient
      .from("food_node_subscriptions")
      .insert({
        subscriber_user_id: user.id,
        food_business_entity_id,
        weekly_intake,
        delivery_day,
        status: "pending",
        introducer_user_id: introducer_user_id || null,
        stripe_price_id: foodNodePriceId,
      });

    if (insertError) {
      log(`Failed to create pending subscription: ${insertError.message}`);
      // Don't fail the checkout - webhook will handle it
    }

    log("Success");
    return jsonResponse({ url: session.url });

  } catch (err) {
    console.error("Error creating food node checkout:", err);
    return jsonResponse({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err)
    }, 500);
  }
});
