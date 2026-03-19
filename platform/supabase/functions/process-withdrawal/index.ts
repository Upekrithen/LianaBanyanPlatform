import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function stripeFetch(path: string, key: string, opts?: { method?: string; body?: URLSearchParams }) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: opts?.method || "GET",
    headers: {
      "Authorization": `Basic ${btoa(key + ":")}`,
      ...(opts?.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: opts?.body,
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user?.email) throw new Error("User not authenticated");

    const { amount, withdrawal_type } = await req.json();

    const { data: calcData, error: calcError } = await supabaseClient.rpc('calculate_withdrawal', {
      _user_id: user.id, _amount: amount, _withdrawal_type: withdrawal_type,
    });
    if (calcError) throw calcError;
    const calculation = calcData[0];
    if (!calculation.eligible) throw new Error(calculation.error_message);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    const customers = await stripeFetch(`/customers?email=${encodeURIComponent(user.email)}&limit=1`, stripeKey);
    let customerId = customers.data?.[0]?.id;
    if (!customerId) {
      const newCustomer = await stripeFetch("/customers", stripeKey, {
        method: "POST",
        body: new URLSearchParams({ email: user.email }),
      });
      customerId = newCustomer.id;
    }

    const { data: withdrawal, error: insertError } = await supabaseClient
      .from('credit_withdrawals').insert({
        user_id: user.id, amount, withdrawal_type,
        fee_percentage: calculation.fee_percentage,
        fee_amount: calculation.fee_amount,
        net_amount: calculation.net_amount,
        status: 'processing',
      }).select().single();
    if (insertError) throw insertError;

    const creditField = withdrawal_type === 'contribution' ? 'contribution_credits' : 'earned_credits';
    const { error: updateError } = await supabaseClient.rpc('update_user_credits_withdrawal', {
      _user_id: user.id, _amount: amount, _credit_type: creditField,
    });

    if (updateError) {
      await supabaseClient.from('credit_withdrawals').update({ status: 'failed' }).eq('id', withdrawal.id);
      throw updateError;
    }

    await supabaseClient.from('credit_withdrawals').update({
      status: 'completed',
      processed_at: new Date().toISOString(),
      stripe_payout_id: `po_sim_${Date.now()}`,
    }).eq('id', withdrawal.id);

    return new Response(
      JSON.stringify({ success: true, withdrawal_id: withdrawal.id, net_amount: calculation.net_amount }),
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
