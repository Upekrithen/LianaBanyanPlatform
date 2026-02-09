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
    console.log("[PROCESS-WITHDRAWAL] Starting withdrawal process");

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }
    console.log("[PROCESS-WITHDRAWAL] User authenticated:", user.id);

    // Parse request
    const { amount, withdrawal_type } = await req.json();
    console.log("[PROCESS-WITHDRAWAL] Request:", { amount, withdrawal_type });

    // Calculate withdrawal (validates eligibility)
    const { data: calcData, error: calcError } = await supabaseClient.rpc('calculate_withdrawal', {
      _user_id: user.id,
      _amount: amount,
      _withdrawal_type: withdrawal_type,
    });

    if (calcError) throw calcError;
    const calculation = calcData[0];
    
    if (!calculation.eligible) {
      throw new Error(calculation.error_message);
    }
    console.log("[PROCESS-WITHDRAWAL] Calculation valid:", calculation);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      console.log("[PROCESS-WITHDRAWAL] Created Stripe customer:", customerId);
    }

    // Create withdrawal record
    const { data: withdrawal, error: insertError } = await supabaseClient
      .from('credit_withdrawals')
      .insert({
        user_id: user.id,
        amount: amount,
        withdrawal_type: withdrawal_type,
        fee_percentage: calculation.fee_percentage,
        fee_amount: calculation.fee_amount,
        net_amount: calculation.net_amount,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) throw insertError;
    console.log("[PROCESS-WITHDRAWAL] Withdrawal record created:", withdrawal.id);

    // Create Stripe payout (requires Connect account setup)
    // For MVP, we'll simulate this and mark as pending
    // In production, this would create actual Stripe Transfer/Payout
    
    // Update user credits
    const creditField = withdrawal_type === 'contribution' ? 'contribution_credits' : 'earned_credits';
    const { error: updateError } = await supabaseClient.rpc('update_user_credits_withdrawal', {
      _user_id: user.id,
      _amount: amount,
      _credit_type: creditField,
    });

    if (updateError) {
      // Rollback withdrawal record
      await supabaseClient
        .from('credit_withdrawals')
        .update({ status: 'failed' })
        .eq('id', withdrawal.id);
      throw updateError;
    }

    // Mark withdrawal as completed (in production, this would happen via webhook)
    await supabaseClient
      .from('credit_withdrawals')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString(),
        stripe_payout_id: `po_sim_${Date.now()}`, // Simulated for MVP
      })
      .eq('id', withdrawal.id);

    console.log("[PROCESS-WITHDRAWAL] Withdrawal completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        withdrawal_id: withdrawal.id,
        net_amount: calculation.net_amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[PROCESS-WITHDRAWAL] ERROR:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
