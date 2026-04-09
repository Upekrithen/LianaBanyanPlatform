import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/// Stripe webhook handler — event-driven sync for subscriptions, credits, and payouts.
/// Configure in Stripe Dashboard → Webhooks → endpoint URL:
///   https://<project>.supabase.co/functions/v1/stripe-webhook

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

async function verifySignature(body: string, sigHeader: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) return false;

  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const v1Sig = parts["v1"];
  if (!timestamp || !v1Sig) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1Sig;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";

  const valid = await verifySignature(body, sigHeader);
  if (!valid && WEBHOOK_SECRET) {
    console.error("[stripe-webhook] Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  const type = event.type as string;

  console.log(`[stripe-webhook] Event: ${type} (${event.id})`);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    switch (type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(admin, event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(admin, event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(admin, event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(admin, event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(admin, event.data.object);
        break;
      case "transfer.created":
        await handleTransferCreated(admin, event.data.object);
        break;
      default:
        console.log(`[stripe-webhook] Unhandled event type: ${type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[stripe-webhook] Error handling ${type}:`, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─── Channel Subscription Detector ───────────────────────────────────────────
// Check if a Stripe subscription ID belongs to a channel_subscription (not membership).

async function isChannelSubscription(admin: ReturnType<typeof createClient>, stripeSubId: string): Promise<boolean> {
  const { data } = await admin
    .from("channel_subscriptions" as never)
    .select("id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle();
  return !!data;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

type SupabaseAdmin = ReturnType<typeof createClient>;

async function handleCheckoutCompleted(admin: SupabaseAdmin, session: any) {
  const userId = session.metadata?.user_id;
  const paymentType = session.metadata?.payment_type;

  if (!userId) {
    console.warn("[webhook] checkout.session.completed missing user_id");
    return;
  }

  if (paymentType === "channel_subscription") {
    // Handled by handle-subscription-webhook endpoint; log and skip here
    console.log(`[stripe-webhook] channel_subscription checkout — delegating to subscription webhook`);
    return;
  }

  if (paymentType === "membership_subscription") {
    const tier = session.metadata?.tier || "member";
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    await admin.from("membership_subscriptions" as never).upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      tier,
      price_usd: tier === "patron" ? 25 : tier === "builder" ? 10 : 5,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365.25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "user_id" });

    // Also mark legacy membership flags
    await admin.from("user_credits" as never).upsert({
      user_id: userId,
      membership_stake_paid: true,
    } as never, { onConflict: "user_id" });

    await admin.from("member_profiles" as never).update({
      membership_status: "active",
    } as never).eq("user_id", userId);

    console.log(`[webhook] Membership subscription created: ${tier} for ${userId}`);
  } else if (paymentType === "credit_purchase") {
    const credits = parseInt(session.metadata?.credits || "0", 10);
    if (credits <= 0) return;

    // Add to wallet
    const { data: wallet } = await admin
      .from("credit_wallets" as never)
      .select("balance, lifetime_purchased")
      .eq("user_id", userId)
      .maybeSingle() as { data: { balance: number; lifetime_purchased: number } | null };

    const currentBalance = wallet?.balance || 0;
    const currentPurchased = wallet?.lifetime_purchased || 0;

    await admin.from("credit_wallets" as never).upsert({
      user_id: userId,
      balance: currentBalance + credits,
      lifetime_purchased: currentPurchased + credits,
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "user_id" });

    // Record transaction
    await admin.from("credit_transactions" as never).insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `Purchased ${credits} credits`,
      stripe_payment_intent_id: session.payment_intent,
    } as never);

    console.log(`[webhook] ${credits} credits added to wallet for ${userId}`);
  } else if (paymentType === "project_pledge") {
    // ── B-4: Threshold-funded production pledge ──────────────
    const projectId = session.metadata?.project_id;
    const productionLevelId = session.metadata?.production_level_id;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (!projectId || !productionLevelId) {
      console.warn("[webhook] project_pledge missing project_id or production_level_id");
      return;
    }

    // Record the pledge
    await admin.from("pledges" as never).insert({
      production_level_id: productionLevelId,
      user_id: userId,
      amount,
      source: "stripe_checkout",
    } as never);

    // Check if threshold is met
    const { data: level } = await admin
      .from("production_levels" as never)
      .select("units_count, unit_price")
      .eq("id", productionLevelId)
      .maybeSingle() as { data: { units_count: number; unit_price: number } | null };

    if (level) {
      const threshold = level.units_count * level.unit_price;
      const { data: pledgeSum } = await admin
        .from("pledges" as never)
        .select("amount")
        .eq("production_level_id", productionLevelId) as { data: { amount: number }[] | null };

      const total = (pledgeSum || []).reduce((s, p) => s + Number(p.amount), 0);

      if (total >= threshold) {
        // Threshold met! Notify via admin notification
        await admin.from("admin_notifications" as never).insert({
          type: "threshold_met",
          title: `Production threshold reached!`,
          message: `Project ${projectId} level ${productionLevelId} has reached ${total}/${threshold}. Ready for production release.`,
          priority: "high",
        } as never);

        console.log(`[webhook] THRESHOLD MET: project=${projectId} level=${productionLevelId} total=${total}/${threshold}`);
      }
    }

    console.log(`[webhook] Project pledge: $${amount} for level ${productionLevelId} by ${userId}`);
  }
}

async function handleInvoicePaid(admin: SupabaseAdmin, invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  if (await isChannelSubscription(admin, subscriptionId)) {
    console.log(`[stripe-webhook] invoice.paid for channel subscription ${subscriptionId} — handled by subscription webhook`);
    return;
  }

  const periodEnd = invoice.lines?.data?.[0]?.period?.end;
  const periodStart = invoice.lines?.data?.[0]?.period?.start;

  await admin.from("membership_subscriptions" as never).update({
    status: "active",
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : undefined,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : undefined,
    updated_at: new Date().toISOString(),
  } as never).eq("stripe_subscription_id", subscriptionId);

  console.log(`[webhook] Invoice paid for membership subscription ${subscriptionId}`);
}

async function handleInvoiceFailed(admin: SupabaseAdmin, invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  if (await isChannelSubscription(admin, subscriptionId)) {
    console.log(`[stripe-webhook] invoice.payment_failed for channel subscription ${subscriptionId} — handled by subscription webhook`);
    return;
  }

  await admin.from("membership_subscriptions" as never).update({
    status: "past_due",
    updated_at: new Date().toISOString(),
  } as never).eq("stripe_subscription_id", subscriptionId);

  console.log(`[webhook] Invoice failed for membership subscription ${subscriptionId}`);
}

async function handleSubscriptionUpdated(admin: SupabaseAdmin, subscription: any) {
  const subId = subscription.id;

  if (await isChannelSubscription(admin, subId)) {
    console.log(`[stripe-webhook] subscription.updated for channel subscription ${subId} — handled by subscription webhook`);
    return;
  }

  const tier = subscription.metadata?.tier;
  const cancelAtEnd = subscription.cancel_at_period_end;

  const update: Record<string, unknown> = {
    status: subscription.status === "active" ? "active" : subscription.status,
    cancel_at_period_end: cancelAtEnd,
    updated_at: new Date().toISOString(),
  };

  if (tier) update.tier = tier;

  if (subscription.current_period_end) {
    update.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
  }

  await admin.from("membership_subscriptions" as never)
    .update(update as never)
    .eq("stripe_subscription_id", subId);

  console.log(`[webhook] Membership subscription updated: ${subId}`);
}

async function handleSubscriptionDeleted(admin: SupabaseAdmin, subscription: any) {
  const subId = subscription.id;

  if (await isChannelSubscription(admin, subId)) {
    console.log(`[stripe-webhook] subscription.deleted for channel subscription ${subId} — handled by subscription webhook`);
    return;
  }

  const { data: sub } = await admin
    .from("membership_subscriptions" as never)
    .select("user_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle() as { data: { user_id: string } | null };

  await admin.from("membership_subscriptions" as never).update({
    status: "canceled",
    updated_at: new Date().toISOString(),
  } as never).eq("stripe_subscription_id", subId);

  if (sub?.user_id) {
    await admin.from("member_profiles" as never).update({
      membership_status: "expired",
    } as never).eq("user_id", sub.user_id);
  }

  console.log(`[webhook] Membership subscription canceled: ${subId}`);
}

async function handleTransferCreated(admin: SupabaseAdmin, transfer: any) {
  const userId = transfer.metadata?.user_id;
  if (!userId) return;

  await admin.from("member_payouts" as never).update({
    status: "completed",
    stripe_transfer_id: transfer.id,
    completed_at: new Date().toISOString(),
  } as never).eq("user_id", userId).eq("status", "processing");

  console.log(`[webhook] Transfer ${transfer.id} recorded for ${userId}`);
}
