import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // If called via Stripe webhook, verify signature
    let event: Stripe.Event;
    const whSecret = Deno.env.get("STRIPE_FUNDING_WEBHOOK_SECRET");
    if (sig && whSecret) {
      event = stripe.webhooks.constructEvent(body, sig, whSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type !== "invoice.payment_succeeded") {
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : (invoice.subscription as any)?.id;

    if (!subscriptionId) {
      console.log("[process-scheduled-funding] No subscription on invoice, skipping");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the funding schedule
    const { data: schedule } = await supabaseAdmin
      .from("lb_card_funding_schedules")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("status", "active")
      .maybeSingle();

    if (!schedule) {
      console.log(
        `[process-scheduled-funding] No active schedule for subscription ${subscriptionId}`,
      );
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountPaid = (invoice.amount_paid ?? 0) / 100;

    // ── VELOCITY CHECK ──
    // Calculate recipient's daily inbound total (including this payment)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: dailyTxns } = await supabaseAdmin
      .from("lb_card_funding_transactions")
      .select("amount")
      .eq("recipient_id", schedule.recipient_id)
      .gte("created_at", todayStart.toISOString())
      .in("status", ["completed", "processing"]);

    const dailyTotalSoFar = (dailyTxns ?? []).reduce(
      (sum: number, t: { amount: number }) => sum + (t.amount || 0),
      0,
    );
    const dailyTotalWithThis = dailyTotalSoFar + amountPaid;

    let complianceStatus: "clear" | "flagged" | "blocked" = "clear";

    if (dailyTotalWithThis > 9500) {
      complianceStatus = "blocked";
      // Create velocity alert and BLOCK
      await supabaseAdmin.from("funding_velocity_alerts").insert({
        recipient_id: schedule.recipient_id,
        funder_id: schedule.funder_id,
        alert_type: "daily_9500_block",
        daily_total: dailyTotalWithThis,
        status: "open",
      });

      // Record blocked transaction
      await supabaseAdmin.from("lb_card_funding_transactions").insert({
        schedule_id: schedule.id,
        funder_id: schedule.funder_id,
        recipient_id: schedule.recipient_id,
        amount: amountPaid,
        stripe_payment_intent_id:
          typeof invoice.payment_intent === "string"
            ? invoice.payment_intent
            : (invoice.payment_intent as any)?.id || null,
        purpose: schedule.purpose,
        status: "blocked",
        compliance_status: "blocked",
        daily_total_to_recipient: dailyTotalWithThis,
      });

      console.log(
        `[process-scheduled-funding] BLOCKED: $${amountPaid} to ${schedule.recipient_id} — daily total $${dailyTotalWithThis} exceeds $9,500 cap`,
      );

      return new Response(
        JSON.stringify({
          success: false,
          blocked: true,
          reason: "Daily funding cap of $9,500 exceeded",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (dailyTotalWithThis > 5000) {
      complianceStatus = "flagged";
      await supabaseAdmin.from("funding_velocity_alerts").insert({
        recipient_id: schedule.recipient_id,
        funder_id: schedule.funder_id,
        alert_type: "daily_5k_flag",
        daily_total: dailyTotalWithThis,
        status: "open",
      });
      console.log(
        `[process-scheduled-funding] FLAGGED: $${dailyTotalWithThis} daily total for ${schedule.recipient_id}`,
      );
    }

    // Record the transaction as processing
    const { data: txn, error: txnErr } = await supabaseAdmin
      .from("lb_card_funding_transactions")
      .insert({
        schedule_id: schedule.id,
        funder_id: schedule.funder_id,
        recipient_id: schedule.recipient_id,
        amount: amountPaid,
        stripe_payment_intent_id:
          typeof invoice.payment_intent === "string"
            ? invoice.payment_intent
            : (invoice.payment_intent as any)?.id || null,
        purpose: schedule.purpose,
        status: "processing",
        compliance_status: complianceStatus,
        daily_total_to_recipient: dailyTotalWithThis,
      })
      .select()
      .single();
    if (txnErr) throw txnErr;

    // ── COMPLIANT FLOW: Person A → Platform Issuing Balance → Person B spending_limit ──
    // Step 1: Payment already collected by Stripe subscription (invoice.payment_succeeded)
    // Step 2: Deposit to platform Issuing Balance (funds are already in the platform's Stripe balance)
    // Step 3: Increase the recipient's card spending_limit

    // Look up the recipient's active Issuing card
    const { data: recipientCard } = await supabaseAdmin
      .from("lb_cards")
      .select("stripe_card_id")
      .eq("user_id", schedule.recipient_id)
      .eq("status", "active")
      .maybeSingle();

    if (!recipientCard?.stripe_card_id) {
      await supabaseAdmin
        .from("lb_card_funding_transactions")
        .update({ status: "failed", error_message: "No active card found for recipient" })
        .eq("id", txn.id);
      throw new Error("Recipient has no active LB Card");
    }

    // Retrieve current card to get existing spending limit
    const card = await stripe.issuing.cards.retrieve(recipientCard.stripe_card_id);
    const currentLimit = (card.spending_controls?.spending_limits?.[0]?.amount ?? 0);
    const newLimit = currentLimit + Math.round(amountPaid * 100);

    // Update the card's spending limit (platform-controlled, compliant)
    await stripe.issuing.cards.update(recipientCard.stripe_card_id, {
      spending_controls: {
        spending_limits: [
          {
            amount: newLimit,
            interval: "all_time" as any,
          },
        ],
      },
    });

    // Mark transaction completed
    await supabaseAdmin
      .from("lb_card_funding_transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", txn.id);

    // Update schedule totals & next date
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await supabaseAdmin
      .from("lb_card_funding_schedules")
      .update({
        total_funded: (schedule.total_funded || 0) + amountPaid,
        funding_count: (schedule.funding_count || 0) + 1,
        last_funded_at: new Date().toISOString(),
        next_funding_at: new Date(
          (subscription as any).current_period_end * 1000,
        ).toISOString(),
      })
      .eq("id", schedule.id);

    console.log(
      `[process-scheduled-funding] Funded $${amountPaid} to ${schedule.recipient_id} (schedule ${schedule.id})`,
    );

    return new Response(
      JSON.stringify({ success: true, transaction_id: txn.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[process-scheduled-funding] Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
