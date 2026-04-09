import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { channel_id } = await req.json() as { channel_id: string };
    if (!channel_id) throw new Error("Missing channel_id");

    // Look up channel for stripe_price_id
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: channel } = await admin
      .from("subscription_channels" as never)
      .select("stripe_price_id, title, creator_id")
      .eq("id", channel_id)
      .maybeSingle() as { data: { stripe_price_id: string | null; title: string; creator_id: string } | null };

    if (!channel?.stripe_price_id) {
      throw new Error("This channel is not configured for dollar payments");
    }

    if (channel.creator_id === user.id) {
      throw new Error("Cannot subscribe to your own channel");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) throw new Error("Stripe not configured");

    const authBasic = `Basic ${btoa(stripeKey + ":")}`;
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    // Get or create Stripe Customer
    const custSearch = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`,
      { headers: { Authorization: authBasic } }
    );
    const custData = await custSearch.json();
    let customerId = custData.data?.[0]?.id;

    if (!customerId) {
      const newCust = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: authBasic,
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

    // Create Checkout Session (subscription mode)
    const params = new URLSearchParams({
      customer: customerId,
      "line_items[0][price]": channel.stripe_price_id,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: `${origin}/subscription-channels?subscribed=${channel_id}`,
      cancel_url: `${origin}/subscription-channels?canceled=true`,
      "metadata[payment_type]": "channel_subscription",
      "metadata[channel_id]": channel_id,
      "metadata[subscriber_id]": user.id,
      "subscription_data[metadata][channel_id]": channel_id,
      "subscription_data[metadata][subscriber_id]": user.id,
      "subscription_data[metadata][payment_type]": "channel_subscription",
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: authBasic,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe checkout error");

    console.log(`[create-subscription-checkout] Session=${session.id} channel=${channel_id} subscriber=${user.id}`);

    return new Response(JSON.stringify({
      checkout_url: session.url,
      session_id: session.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[create-subscription-checkout] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
