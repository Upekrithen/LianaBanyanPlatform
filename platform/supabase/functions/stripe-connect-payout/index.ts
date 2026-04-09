import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/// Initiates a real Stripe Connect transfer from platform to creator's connected account.
/// Creator keeps 83.3% — platform margin is Cost + 20%.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { amount } = await req.json() as { amount: number };
    if (!amount || amount < 1) throw new Error("Minimum payout is 1 credit ($1)");

    // Verify wallet balance
    const { data: wallet } = await admin
      .from("credit_wallets" as never)
      .select("balance, lifetime_earned")
      .eq("user_id", user.id)
      .maybeSingle() as { data: { balance: number; lifetime_earned: number } | null };

    const earned = wallet?.lifetime_earned || 0;
    if (amount > earned) {
      throw new Error(`Insufficient earned credits. Available: ${earned}`);
    }

    // Verify Connect account
    const { data: connect } = await admin
      .from("member_connect_accounts" as never)
      .select("stripe_account_id, payouts_enabled")
      .eq("user_id", user.id)
      .maybeSingle() as { data: { stripe_account_id: string; payouts_enabled: boolean } | null };

    if (!connect?.stripe_account_id) {
      throw new Error("No Stripe Connect account linked. Set up payouts first.");
    }
    if (!connect.payouts_enabled) {
      throw new Error("Stripe Connect payouts not yet enabled. Complete onboarding first.");
    }

    // Calculate: creator keeps 83.3%, platform takes 16.7% (Cost + 20%)
    const grossCents = amount * 100;
    const platformFeeCents = Math.round(grossCents * 0.167);
    const netCents = grossCents - platformFeeCents;

    // Record pending payout
    const { data: payout, error: insertErr } = await admin
      .from("member_payouts" as never)
      .insert({
        user_id: user.id,
        amount_cents: grossCents,
        fee_cents: platformFeeCents,
        net_amount_cents: netCents,
        status: "processing",
        payout_speed: "standard",
      } as never)
      .select()
      .single() as { data: { id: string } | null; error: any };

    if (insertErr) throw insertErr;

    // Create Stripe Transfer
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const transferRes = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(stripeKey + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: netCents.toString(),
        currency: "usd",
        destination: connect.stripe_account_id,
        description: `LB creator payout — ${amount} credits`,
        "metadata[user_id]": user.id,
        "metadata[payout_id]": payout?.id || "",
        "metadata[gross_credits]": amount.toString(),
      }),
    });

    const transfer = await transferRes.json();

    if (!transferRes.ok) {
      await admin.from("member_payouts" as never).update({
        status: "failed",
        failure_reason: transfer?.error?.message || "Transfer failed",
      } as never).eq("id", payout?.id);
      throw new Error(transfer?.error?.message || "Stripe transfer failed");
    }

    // Debit wallet
    await admin.from("credit_wallets" as never).update({
      balance: (wallet?.balance || 0) - amount,
      lifetime_earned: earned - amount,
      updated_at: new Date().toISOString(),
    } as never).eq("user_id", user.id);

    // Record transaction
    await admin.from("credit_transactions" as never).insert({
      user_id: user.id,
      amount: -amount,
      type: "payout",
      description: `Payout of ${amount} credits ($${(netCents / 100).toFixed(2)} net)`,
      stripe_payment_intent_id: transfer.id,
    } as never);

    // Update payout record
    await admin.from("member_payouts" as never).update({
      status: "completed",
      stripe_transfer_id: transfer.id,
      completed_at: new Date().toISOString(),
    } as never).eq("id", payout?.id);

    console.log(`[connect-payout] ${amount} credits → $${(netCents / 100).toFixed(2)} to ${connect.stripe_account_id}`);

    return new Response(JSON.stringify({
      success: true,
      payout_id: payout?.id,
      gross_credits: amount,
      platform_fee_usd: (platformFeeCents / 100).toFixed(2),
      net_payout_usd: (netCents / 100).toFixed(2),
      stripe_transfer_id: transfer.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[connect-payout] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
