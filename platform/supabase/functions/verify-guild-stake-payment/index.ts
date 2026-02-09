import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID required");
    }

    console.log(`[Verify Guild Stake] Checking session: ${session_id}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, status: session.payment_status }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const userId = session.metadata?.user_id;
    const tier = session.metadata?.tier;
    const classLevel = parseInt(session.metadata?.class_level || "0");
    const amount = parseFloat(session.metadata?.amount || "0");
    const cumulative = parseFloat(session.metadata?.cumulative || "0");

    if (!userId || !tier || !classLevel) {
      throw new Error("Invalid session metadata");
    }

    // Record stake payment
    const { error: paymentError } = await supabaseClient
      .from("guild_stake_payments")
      .insert({
        user_id: userId,
        tier,
        class_level: classLevel,
        amount_paid: amount,
        cumulative_total: cumulative,
        stripe_price_id: session.metadata?.price_id || "",
        stripe_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent as string,
        payment_status: "completed",
      });

    if (paymentError) {
      console.error("[Verify Guild Stake] Payment record error:", paymentError);
      throw paymentError;
    }

    // Update or create user guild progression
    const { data: existing } = await supabaseClient
      .from("user_guild_progression")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Update existing progression
      const { error: updateError } = await supabaseClient
        .from("user_guild_progression")
        .update({
          current_tier: tier,
          current_class: classLevel,
          total_stake_paid: cumulative,
          current_tier_started_at: classLevel === 1 ? new Date().toISOString() : existing.current_tier_started_at,
          current_class_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;
    } else {
      // Create new progression record
      const { error: createError } = await supabaseClient
        .from("user_guild_progression")
        .insert({
          user_id: userId,
          current_tier: tier,
          current_class: classLevel,
          total_stake_paid: cumulative,
        });

      if (createError) throw createError;
    }

    // Update guild investment fund
    const fundColumn = tier === "journeyman" ? "total_journeyman_stakes" : "total_master_stakes";
    const { error: fundError } = await supabaseClient.rpc("increment", {
      row_id: (await supabaseClient.from("guild_investment_fund").select("id").single()).data?.id,
      x: amount,
    });

    // Manual update if RPC doesn't exist
    const { data: fundData } = await supabaseClient
      .from("guild_investment_fund")
      .select("*")
      .single();

    if (fundData) {
      await supabaseClient
        .from("guild_investment_fund")
        .update({
          total_fund_amount: (fundData.total_fund_amount || 0) + amount,
          [fundColumn]: (fundData[fundColumn] || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fundData.id);
    }

    console.log(`[Verify Guild Stake] Success: ${tier} class ${classLevel} for user ${userId}`);

    return new Response(
      JSON.stringify({
        verified: true,
        status: "paid",
        tier,
        class_level: classLevel,
        amount,
        cumulative,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Verify Guild Stake] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
