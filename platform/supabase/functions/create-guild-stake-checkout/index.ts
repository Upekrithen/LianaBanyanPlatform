import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAKE_PRICES: Record<string, Record<number, { price_id: string; amount: number; cumulative: number }>> = {
  journeyman: {
    1: { price_id: "price_1SIXbLDMOngHJB3UEDaWbiPS", amount: 500, cumulative: 500 },
    2: { price_id: "price_1SIXbNDMOngHJB3U7xiBk8s2", amount: 750, cumulative: 1250 },
    3: { price_id: "price_1SIXbPDMOngHJB3UdLEdWZh0", amount: 1000, cumulative: 2250 },
    4: { price_id: "price_1SIXbRDMOngHJB3UTWbCeUvM", amount: 1250, cumulative: 3500 },
    5: { price_id: "price_1SIXbUDMOngHJB3UCAvQ76vD", amount: 1500, cumulative: 5000 },
    6: { price_id: "price_1SIXbVDMOngHJB3UEdTcQHAI", amount: 2000, cumulative: 7000 },
  },
  master: {
    1: { price_id: "price_1SIXbXDMOngHJB3Uo3saOuEr", amount: 10000, cumulative: 10000 },
    2: { price_id: "price_1SIXbYDMOngHJB3UtBihqlog", amount: 5000, cumulative: 15000 },
    3: { price_id: "price_1SIXbZDMOngHJB3Ud2oGWVrr", amount: 7500, cumulative: 22500 },
    4: { price_id: "price_1SIXbZDMOngHJB3UMjLa4MCy", amount: 10000, cumulative: 32500 },
    5: { price_id: "price_1SIXbZDMOngHJB3Uuk06p7rX", amount: 15000, cumulative: 47500 },
    6: { price_id: "price_1SIXbZDMOngHJB3UN782C4fu", amount: 20000, cumulative: 67500 },
  },
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
    const { tier, class_level } = await req.json();
    if (!tier || !class_level) throw new Error("Tier and class level required");
    if (!["journeyman", "master"].includes(tier)) throw new Error("Invalid tier");
    if (class_level < 1 || class_level > 6) throw new Error("Invalid class level");

    const authHeader = req.headers.get("Authorization")!;
    const { data } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log(`[Guild Stake] ${tier} class ${class_level} — user: ${user.email}`);

    const { data: existingPayment } = await supabaseClient
      .from("guild_stake_payments").select("id")
      .eq("user_id", user.id).eq("tier", tier).eq("class_level", class_level)
      .eq("payment_status", "completed").maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: `Stake for ${tier} class ${class_level} already paid` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stakeInfo = STAKE_PRICES[tier][class_level];
    if (!stakeInfo) throw new Error("Invalid stake configuration");

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
        "line_items[0][price]": stakeInfo.price_id,
        "line_items[0][quantity]": "1",
        "mode": "payment",
        "success_url": `${origin}/guild-stake-success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${origin}/dashboard`,
        "metadata[user_id]": user.id,
        "metadata[payment_type]": "guild_stake",
        "metadata[tier]": tier,
        "metadata[class_level]": class_level.toString(),
        "metadata[amount]": stakeInfo.amount.toString(),
        "metadata[cumulative]": stakeInfo.cumulative.toString(),
      }),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe error");

    console.log(`[Guild Stake] Session created: ${session.id}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[Guild Stake] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
