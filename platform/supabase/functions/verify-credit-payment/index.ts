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

    console.log(`[Verify Credit Payment] Checking session: ${session_id}`);

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
    const credits = parseFloat(session.metadata?.credits || "0");
    const amount = parseFloat(session.metadata?.amount || "0");
    const packageSize = session.metadata?.package_size;

    if (!userId || !credits) {
      throw new Error("Invalid session metadata");
    }

    // Check if already processed
    const { data: existingTransaction } = await supabaseClient
      .from("credit_transactions")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existingTransaction) {
      console.log(`[Verify Credit Payment] Already processed: ${session_id}`);
      return new Response(
        JSON.stringify({
          verified: true,
          status: "paid",
          credits,
          already_processed: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update user credits and bonus tracking
    const { data: currentCredits } = await supabaseClient
      .from("user_credits")
      .select("total_credits, bonus_purchases_count")
      .eq("user_id", userId)
      .single();

    if (currentCredits) {
      const { error: updateError } = await supabaseClient
        .from("user_credits")
        .update({
          total_credits: (currentCredits.total_credits || 0) + credits,
          bonus_purchases_count: (currentCredits.bonus_purchases_count || 0) + 1,
          last_bonus_purchase_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("[Verify Credit Payment] Error updating credits:", updateError);
        throw updateError;
      }
    }

    // Record transaction
    const { error: transactionError } = await supabaseClient
      .from("credit_transactions")
      .insert({
        user_id: userId,
        transaction_type: "purchase",
        amount: amount / 100, // Convert cents to dollars
        credits_amount: credits,
        description: `Purchased ${credits} credits (${packageSize} package)`,
        stripe_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent as string,
        metadata: {
          package_size: packageSize,
        },
      });

    if (transactionError) {
      console.error("[Verify Credit Payment] Transaction record error:", transactionError);
      throw transactionError;
    }

    console.log(`[Verify Credit Payment] Success: ${credits} credits added for user ${userId}`);

    return new Response(
      JSON.stringify({
        verified: true,
        status: "paid",
        credits,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Verify Credit Payment] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
