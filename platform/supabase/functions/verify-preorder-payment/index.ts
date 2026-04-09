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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID required");
    }

    console.log(`[Verify PreOrder] Checking session: ${session_id}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const pledgeId = session.metadata?.pledge_id;
    const runId = session.metadata?.run_id;
    const totalAmount = parseFloat(session.metadata?.total_amount || "0");
    const userId = session.metadata?.user_id;

    if (!pledgeId) {
      throw new Error("No pledge ID in session metadata");
    }

    // Check if already verified (idempotent)
    const { data: existingPledge } = await supabase
      .from("founding_run_pledges")
      .select("status")
      .eq("id", pledgeId)
      .single();

    if (existingPledge?.status === "paid") {
      return new Response(
        JSON.stringify({ verified: true, status: "paid", already_verified: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Mark pledge as paid
    const { error: pledgeError } = await supabase
      .from("founding_run_pledges")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pledgeId);

    if (pledgeError) {
      console.error("[Verify PreOrder] Pledge update error:", pledgeError);
    }

    // Update founding run totals
    if (runId) {
      const { error: runError } = await supabase.rpc("increment_founding_run_totals", {
        _run_id: runId,
        _amount: totalAmount,
      });

      if (runError) {
        // Fallback: manual increment if RPC doesn't exist
        console.warn("[Verify PreOrder] RPC fallback — incrementing manually");
        const { data: run } = await supabase
          .from("founding_runs")
          .select("current_amount, backer_count")
          .eq("id", runId)
          .single();

        if (run) {
          await supabase
            .from("founding_runs")
            .update({
              current_amount: (parseFloat(String(run.current_amount)) + totalAmount),
              backer_count: (run.backer_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", runId);
        }
      }
    }

    console.log(`[Verify PreOrder] Pledge ${pledgeId} verified — $${totalAmount} paid`);

    return new Response(
      JSON.stringify({
        verified: true,
        status: "paid",
        pledge_id: pledgeId,
        total_amount: totalAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Verify PreOrder] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
