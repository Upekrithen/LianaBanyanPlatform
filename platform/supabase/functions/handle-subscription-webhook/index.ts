import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET") || "";

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

type SupabaseAdmin = ReturnType<typeof createClient>;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";

  const valid = await verifySignature(body, sigHeader);
  if (!valid && WEBHOOK_SECRET) {
    console.error("[subscription-webhook] Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  const type = event.type as string;
  const eventId = event.id as string;

  console.log(`[subscription-webhook] Event: ${type} (${eventId})`);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    switch (type) {
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(admin, event.data.object, eventId);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(admin, event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(admin, event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(admin, event.data.object);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(admin, event.data.object);
        break;
      default:
        console.log(`[subscription-webhook] Unhandled: ${type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[subscription-webhook] Error handling ${type}:`, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─── checkout.session.completed ──────────────────────────────────────────────
// Creates the channel_subscription record when Stripe Checkout completes.

async function handleCheckoutCompleted(admin: SupabaseAdmin, session: any) {
  const paymentType = session.metadata?.payment_type;
  if (paymentType !== "channel_subscription") return;

  const channelId = session.metadata?.channel_id;
  const subscriberId = session.metadata?.subscriber_id;
  const stripeSubscriptionId = session.subscription;
  const stripeCustomerId = session.customer;

  if (!channelId || !subscriberId || !stripeSubscriptionId) {
    console.warn("[subscription-webhook] checkout missing required metadata");
    return;
  }

  await admin.from("channel_subscriptions" as never).insert({
    subscriber_id: subscriberId,
    channel_id: channelId,
    currency: "dollars",
    status: "active",
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
  } as never);

  console.log(`[subscription-webhook] Channel subscription created: channel=${channelId} subscriber=${subscriberId}`);
}

// ─── invoice.payment_succeeded ───────────────────────────────────────────────
// Recurring payment confirmed. Write billing record + ledger entry.
// Constitutional split: creator 83.3%, platform 16.7%.

async function handleInvoicePaymentSucceeded(admin: SupabaseAdmin, invoice: any, eventId: string) {
  const stripeSubId = invoice.subscription;
  if (!stripeSubId) return;

  const { data: channelSub } = await admin
    .from("channel_subscriptions" as never)
    .select("id, channel_id, subscriber_id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle() as { data: { id: string; channel_id: string; subscriber_id: string } | null };

  if (!channelSub) {
    console.log(`[subscription-webhook] invoice.payment_succeeded — not a channel subscription: ${stripeSubId}`);
    return;
  }

  const { data: channel } = await admin
    .from("subscription_channels" as never)
    .select("creator_id, price")
    .eq("id", channelSub.channel_id)
    .maybeSingle() as { data: { creator_id: string; price: number } | null };

  if (!channel) return;

  const amountCents = invoice.amount_paid || 0;
  const amountDollars = amountCents / 100;
  const creatorAmount = Math.round(amountDollars * 0.833 * 100) / 100;
  const platformAmount = Math.round((amountDollars - creatorAmount) * 100) / 100;

  await admin.from("subscription_billing" as never).insert({
    subscription_id: channelSub.id,
    amount: amountDollars,
    currency: "dollars",
    creator_amount: creatorAmount,
    platform_amount: platformAmount,
    stripe_fee: 0,
    status: "paid",
  } as never);

  await writeLedgerEntry({
    stripe_event_id: eventId,
    ledger_category: "subscription",
    amount_cents: amountCents,
    currency: "usd",
    payer_id: channelSub.subscriber_id,
    payee_id: channel.creator_id,
    is_patronage: false,
    status: "completed",
    description: `Channel subscription payment — ${amountDollars} USD`,
    webhook_source: "handle-subscription-webhook",
    metadata: {
      channel_id: channelSub.channel_id,
      subscription_id: channelSub.id,
      creator_amount: creatorAmount,
      platform_amount: platformAmount,
    },
  });

  const periodEnd = invoice.lines?.data?.[0]?.period?.end;
  if (periodEnd) {
    await admin.from("channel_subscriptions" as never).update({
      status: "active",
      next_billing_at: new Date(periodEnd * 1000).toISOString(),
      last_billed_at: new Date().toISOString(),
    } as never).eq("id", channelSub.id);
  }

  console.log(`[subscription-webhook] Billing recorded: $${amountDollars} (creator: $${creatorAmount}, platform: $${platformAmount})`);
}

// ─── customer.subscription.updated ───────────────────────────────────────────
// Sync status changes: active, past_due, canceled, trialing.
// If price changed, update channel_subscription amount.

async function handleSubscriptionUpdated(admin: SupabaseAdmin, subscription: any) {
  const stripeSubId = subscription.id;

  const { data: channelSub } = await admin
    .from("channel_subscriptions" as never)
    .select("id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle() as { data: { id: string } | null };

  if (!channelSub) return;

  const update: Record<string, unknown> = {
    status: subscription.status,
  };

  if (subscription.current_period_end) {
    update.next_billing_at = new Date(subscription.current_period_end * 1000).toISOString();
  }

  await admin.from("channel_subscriptions" as never)
    .update(update as never)
    .eq("id", channelSub.id);

  console.log(`[subscription-webhook] Channel subscription updated: ${stripeSubId} → ${subscription.status}`);
}

// ─── customer.subscription.deleted ───────────────────────────────────────────
// Mark canceled, set canceled_at, decrement subscriber count.

async function handleSubscriptionDeleted(admin: SupabaseAdmin, subscription: any) {
  const stripeSubId = subscription.id;

  const { data: channelSub } = await admin
    .from("channel_subscriptions" as never)
    .select("id, channel_id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle() as { data: { id: string; channel_id: string } | null };

  if (!channelSub) return;

  await admin.from("channel_subscriptions" as never).update({
    status: "canceled",
    canceled_at: new Date().toISOString(),
  } as never).eq("id", channelSub.id);

  await admin.rpc("decrement_channel_subscribers" as never, {
    p_channel_id: channelSub.channel_id,
  } as never).then(() => {}, () => {
    // Fallback: trigger handles this, RPC is optional
  });

  console.log(`[subscription-webhook] Channel subscription canceled: ${stripeSubId}`);
}

// ─── invoice.payment_failed ──────────────────────────────────────────────────
// Mark past_due, log failure reason.

async function handleInvoicePaymentFailed(admin: SupabaseAdmin, invoice: any) {
  const stripeSubId = invoice.subscription;
  if (!stripeSubId) return;

  const { data: channelSub } = await admin
    .from("channel_subscriptions" as never)
    .select("id")
    .eq("stripe_subscription_id", stripeSubId)
    .maybeSingle() as { data: { id: string } | null };

  if (!channelSub) return;

  const failureReason = invoice.last_payment_error?.message || "Payment failed";

  await admin.from("channel_subscriptions" as never).update({
    status: "past_due",
  } as never).eq("id", channelSub.id);

  await admin.from("subscription_billing" as never).insert({
    subscription_id: channelSub.id,
    amount: (invoice.amount_due || 0) / 100,
    currency: "dollars",
    creator_amount: 0,
    platform_amount: 0,
    stripe_fee: 0,
    status: "failed",
  } as never);

  console.log(`[subscription-webhook] Payment failed for ${stripeSubId}: ${failureReason}`);
}
