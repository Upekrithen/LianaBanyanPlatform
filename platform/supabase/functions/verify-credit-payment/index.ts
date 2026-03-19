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

    console.log(`[Verify Credit] Checking session: ${session_id}`);

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
    const credits = parseFloat(session.metadata?.credits || "0");
    const amount = parseFloat(session.metadata?.amount || "0");
    const packageSize = session.metadata?.package_size;
    if (!userId || !credits) throw new Error("Invalid session metadata");

    const { data: existingTransaction } = await supabaseClient
      .from("credit_transactions").select("id")
      .eq("stripe_session_id", session_id).maybeSingle();

    if (existingTransaction) {
      return new Response(
        JSON.stringify({ verified: true, status: "paid", credits, already_processed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { data: currentCredits } = await supabaseClient
      .from("user_credits").select("total_credits, bonus_purchases_count")
      .eq("user_id", userId).single();

    if (currentCredits) {
      await supabaseClient.from("user_credits").update({
        total_credits: (currentCredits.total_credits || 0) + credits,
        bonus_purchases_count: (currentCredits.bonus_purchases_count || 0) + 1,
        last_bonus_purchase_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);
    }

    await supabaseClient.from("credit_transactions").insert({
      user_id: userId,
      transaction_type: "purchase",
      amount: amount / 100,
      credits_amount: credits,
      description: `Purchased ${credits} credits (${packageSize} package)`,
      stripe_session_id: session_id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      metadata: { package_size: packageSize },
    });

    console.log(`[Verify Credit] Success: ${credits} credits for user ${userId}`);
    return new Response(
      JSON.stringify({ verified: true, status: "paid", credits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Verify Credit] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
