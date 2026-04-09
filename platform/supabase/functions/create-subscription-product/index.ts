import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CYCLE_TO_INTERVAL: Record<string, string> = {
  weekly: "week",
  monthly: "month",
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
    if (authError || !user) throw new Error("Not authenticated");

    const { channel_id, title, amount_cents, billing_cycle } = await req.json() as {
      channel_id: string;
      title: string;
      amount_cents: number;
      billing_cycle: string;
    };

    if (!channel_id || !title || !amount_cents) {
      throw new Error("Missing required fields: channel_id, title, amount_cents");
    }

    const interval = CYCLE_TO_INTERVAL[billing_cycle];
    if (!interval) {
      throw new Error(`Billing cycle '${billing_cycle}' not supported for Stripe recurring. Use weekly or monthly.`);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) throw new Error("Stripe not configured");

    const authBasic = `Basic ${btoa(stripeKey + ":")}`;

    // 1. Create Stripe Product
    const productRes = await fetch("https://api.stripe.com/v1/products", {
      method: "POST",
      headers: {
        Authorization: authBasic,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: title,
        "metadata[channel_id]": channel_id,
        "metadata[creator_id]": user.id,
      }),
    });
    const product = await productRes.json();
    if (!productRes.ok) throw new Error(product?.error?.message || "Stripe product creation failed");

    // 2. Create Stripe Price (recurring)
    const priceRes = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: {
        Authorization: authBasic,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        product: product.id,
        unit_amount: amount_cents.toString(),
        currency: "usd",
        "recurring[interval]": interval,
        "metadata[channel_id]": channel_id,
      }),
    });
    const price = await priceRes.json();
    if (!priceRes.ok) throw new Error(price?.error?.message || "Stripe price creation failed");

    // 3. Update subscription_channels with Stripe IDs
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await admin.from("subscription_channels" as never).update({
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    } as never).eq("id", channel_id).eq("creator_id", user.id);

    console.log(`[create-subscription-product] Product=${product.id} Price=${price.id} for channel=${channel_id}`);

    return new Response(JSON.stringify({
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[create-subscription-product] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
