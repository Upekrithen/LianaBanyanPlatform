import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_PACKAGES: Record<string, { price_id: string; credits: number; amount: number }> = {
  small: { price_id: "price_1SIXinDMOngHJB3UWGOCz64N", credits: 10, amount: 1000 },
  medium: { price_id: "price_1SIXioDMOngHJB3UsAUM63vM", credits: 50, amount: 5000 },
  large: { price_id: "price_1SIXipDMOngHJB3UnkpC4Gwx", credits: 100, amount: 10000 },
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
    const { package_size } = await req.json();
    if (!package_size || !CREDIT_PACKAGES[package_size]) {
      throw new Error("Invalid package size");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log(`[Credit Purchase] ${package_size} package — user: ${user.email}`);

    const { data: bonusData, error: bonusError } = await supabaseClient.rpc(
      'calculate_user_bonus_percentage',
      { _user_id: user.id }
    );

    if (bonusError) throw new Error('Failed to calculate bonus');
    if (!bonusData.can_purchase) {
      return new Response(
        JSON.stringify({ error: bonusData.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const pkg = CREDIT_PACKAGES[package_size];
    const totalCredits = Math.floor(pkg.credits * (1 + bonusData.bonus_percentage / 100));

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const origin = req.headers.get("origin") || "https://lianabanyan.com";

    const params = new URLSearchParams({
      "customer_email": user.email,
      "line_items[0][price]": pkg.price_id,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": `${origin}/credit-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${origin}/dashboard`,
      "metadata[user_id]": user.id,
      "metadata[payment_type]": "credit_purchase",
      "metadata[package_size]": package_size,
      "metadata[credits]": totalCredits.toString(),
      "metadata[base_credits]": pkg.credits.toString(),
      "metadata[bonus_percentage]": bonusData.bonus_percentage.toString(),
      "metadata[amount]": pkg.amount.toString(),
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe error");

    console.log(`[Credit Purchase] Session created: ${session.id}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[Credit Purchase] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
