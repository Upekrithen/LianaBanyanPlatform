import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/// Process a credit withdrawal via real Stripe Connect transfer.
/// Members cash out contribution or earned credits to their linked
/// bank account or debit card. If no Connect account is linked,
/// the withdrawal is rejected with a clear message.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    // ── Auth ──
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);
    if (authError || !user?.email) throw new Error("User not authenticated");

    const { amount, withdrawal_type } = await req.json();

    // ── Calculate fees via RPC ──
    const { data: calcData, error: calcError } = await admin.rpc(
      "calculate_withdrawal",
      {
        _user_id: user.id,
        _amount: amount,
        _withdrawal_type: withdrawal_type,
      }
    );
    if (calcError) throw calcError;
    const calculation = calcData[0];
    if (!calculation.eligible) throw new Error(calculation.error_message);

    // ── Verify Connect account ──
    const { data: connect } = (await admin
      .from("member_connect_accounts" as never)
      .select("id, stripe_account_id, payouts_enabled, onboarding_status")
      .eq("user_id", user.id)
      .maybeSingle()) as {
      data: {
        id: string;
        stripe_account_id: string;
        payouts_enabled: boolean;
        onboarding_status: string;
      } | null;
    };

    if (!connect?.stripe_account_id) {
      throw new Error(
        "No payout account linked. Set up direct deposit in your Payouts page first."
      );
    }
    if (!connect.payouts_enabled) {
      throw new Error(
        "Your payout account setup is incomplete. Finish onboarding in your Payouts page."
      );
    }

    // ── Insert withdrawal record (processing) ──
    const { data: withdrawal, error: insertError } = await admin
      .from("credit_withdrawals")
      .insert({
        user_id: user.id,
        amount,
        withdrawal_type,
        fee_percentage: calculation.fee_percentage,
        fee_amount: calculation.fee_amount,
        net_amount: calculation.net_amount,
        status: "processing",
        payout_method: "connect",
        connect_account_id: connect.id,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    // ── Debit credits ──
    const creditField =
      withdrawal_type === "contribution"
        ? "contribution_credits"
        : "earned_credits";
    const { error: updateError } = await admin.rpc(
      "update_user_credits_withdrawal",
      {
        _user_id: user.id,
        _amount: amount,
        _credit_type: creditField,
      }
    );

    if (updateError) {
      await admin
        .from("credit_withdrawals")
        .update({ status: "failed" })
        .eq("id", withdrawal.id);
      throw updateError;
    }

    // ── Real Stripe Transfer ──
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const netCents = Math.round(Number(calculation.net_amount) * 100);

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
        description: `LB withdrawal — ${withdrawal_type} — ${amount} credits`,
        "metadata[user_id]": user.id,
        "metadata[withdrawal_id]": withdrawal.id,
        "metadata[withdrawal_type]": withdrawal_type,
        "metadata[gross_amount]": amount.toString(),
        "metadata[fee_amount]": calculation.fee_amount.toString(),
      }),
    });

    const transfer = await transferRes.json();

    if (!transferRes.ok) {
      // Transfer failed — mark withdrawal failed but credits already debited,
      // so we need to reverse the credit debit
      await admin.rpc("update_user_credits_withdrawal", {
        _user_id: user.id,
        _amount: -amount, // negative = credit back
        _credit_type: creditField,
      });

      await admin
        .from("credit_withdrawals")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          stripe_payout_id: null,
          stripe_transfer_id: null,
        })
        .eq("id", withdrawal.id);

      throw new Error(
        transfer?.error?.message || "Stripe transfer failed — credits restored"
      );
    }

    // ── Success — update withdrawal record ──
    await admin
      .from("credit_withdrawals")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
        stripe_payout_id: transfer.id, // legacy column, store transfer ID here too
        stripe_transfer_id: transfer.id,
      })
      .eq("id", withdrawal.id);

    console.log(
      `[process-withdrawal] ${amount} ${withdrawal_type} credits → $${(netCents / 100).toFixed(2)} net to ${connect.stripe_account_id} (${transfer.id})`
    );

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawal.id,
        net_amount: calculation.net_amount,
        net_usd: (netCents / 100).toFixed(2),
        stripe_transfer_id: transfer.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[PROCESS-WITHDRAWAL] ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
