import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { session_id } = await req.json();
    if (!session_id) throw new Error("Session ID required");

    console.log(`[Verify Guild Stake] Checking session: ${session_id}`);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`,
      { headers: { "Authorization": `Basic ${btoa(stripeKey + ":")}` } }
    );
    const session = await stripeRes.json();

    if (!stripeRes.ok) throw new Error(session?.error?.message || "Stripe lookup failed");

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const userId = session.metadata?.user_id;
    const tier = session.metadata?.tier;
    const classLevel = parseInt(session.metadata?.class_level || "0");
    const amount = parseFloat(session.metadata?.amount || "0");
    const cumulative = parseFloat(session.metadata?.cumulative || "0");
    if (!userId || !tier || !classLevel) throw new Error("Invalid session metadata");

    await supabaseClient.from("guild_stake_payments").insert({
      user_id: userId,
      tier,
      class_level: classLevel,
      amount_paid: amount,
      cumulative_total: cumulative,
      stripe_price_id: session.metadata?.price_id || "",
      stripe_session_id: session_id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      payment_status: "completed",
    });

    const { data: existing } = await supabaseClient
      .from("user_guild_progression").select("*")
      .eq("user_id", userId).maybeSingle();

    if (existing) {
      await supabaseClient.from("user_guild_progression").update({
        current_tier: tier,
        current_class: classLevel,
        total_stake_paid: cumulative,
        current_tier_started_at: classLevel === 1 ? new Date().toISOString() : existing.current_tier_started_at,
        current_class_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);
    } else {
      await supabaseClient.from("user_guild_progression").insert({
        user_id: userId,
        current_tier: tier,
        current_class: classLevel,
        total_stake_paid: cumulative,
      });
    }

    const { data: fundData } = await supabaseClient
      .from("guild_investment_fund").select("*").single();

    if (fundData) {
      const fundColumn = tier === "journeyman" ? "total_journeyman_stakes" : "total_master_stakes";
      await supabaseClient.from("guild_investment_fund").update({
        total_fund_amount: (fundData.total_fund_amount || 0) + amount,
        [fundColumn]: (fundData[fundColumn] || 0) + amount,
        updated_at: new Date().toISOString(),
      }).eq("id", fundData.id);
    }

    console.log(`[Verify Guild Stake] Success: ${tier} class ${classLevel} for user ${userId}`);
    return new Response(
      JSON.stringify({ verified: true, status: "paid", tier, class_level: classLevel, amount, cumulative }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Verify Guild Stake] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
