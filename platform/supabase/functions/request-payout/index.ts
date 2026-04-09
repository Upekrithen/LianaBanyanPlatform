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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    const { amount_cents, payout_speed = "standard" } = await req.json();
    if (!amount_cents || amount_cents < 100) throw new Error("Minimum payout is $1.00");

    const { data: acct } = await supabaseClient
      .from("member_connect_accounts")
      .select("id, stripe_account_id, payouts_enabled")
      .eq("user_id", user.id)
      .single();

    if (!acct?.payouts_enabled) throw new Error("Payouts not enabled on your account");

    const { data: cardholder } = await supabaseClient
      .from("lb_cardholders")
      .select("card_balance_cents")
      .eq("user_id", user.id)
      .single();

    if (!cardholder || cardholder.card_balance_cents < amount_cents) {
      throw new Error("Insufficient balance");
    }

    const feeCents = payout_speed === "instant" ? Math.ceil(amount_cents / 100) : 0;
    const netCents = amount_cents - feeCents;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    // Create transfer to connected account
    const transferParams = new URLSearchParams({
      amount: netCents.toString(),
      currency: "usd",
      destination: acct.stripe_account_id,
      "metadata[lb_user_id]": user.id,
      "metadata[payout_speed]": payout_speed,
    });

    const transferRes = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: transferParams,
    });
    const transfer = await transferRes.json();
    if (!transferRes.ok) throw new Error(transfer?.error?.message || "Transfer failed");

    // Record payout
    const { data: payout, error: payoutErr } = await supabaseClient
      .from("member_payouts")
      .insert({
        user_id: user.id,
        connect_account_id: acct.id,
        amount_cents,
        fee_cents: feeCents,
        net_amount_cents: netCents,
        payout_speed,
        stripe_transfer_id: transfer.id,
        status: "processing",
      })
      .select()
      .single();

    if (payoutErr) throw payoutErr;

    // Deduct from card balance
    await supabaseClient
      .from("lb_cardholders")
      .update({ card_balance_cents: cardholder.card_balance_cents - amount_cents })
      .eq("user_id", user.id);

    console.log(`[Payout] ${payout_speed} payout of ${netCents} cents for user ${user.id}`);
    return new Response(
      JSON.stringify({ success: true, payout }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[Payout] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
