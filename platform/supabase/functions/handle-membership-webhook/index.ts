/**
 * handle-membership-webhook -- BP073 Wave 5 / Phase alpha
 * =========================================================
 * Handles all Stripe webhook events for the $5/year membership path.
 *
 * EVENTS HANDLED:
 *   checkout.session.completed          -- activate membership (T4-T7)
 *   checkout.session.async_payment_failed -- mark payment failed
 *   customer.subscription.deleted       -- cancellation flow
 *   charge.refunded                     -- refund flow
 *   invoice.payment_failed              -- payment retry logging
 *
 * SECURITIES-CLEAN: $5/year = cooperative membership fee.
 * Marks = participation units. Not equity, not shares, not guaranteed return.
 *
 * HELD: receipt email (RESEND_MEMBERSHIP_RECEIPT_ENABLED flag).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const log = (msg: string) => console.log(`[MembershipWebhook] ${msg}`);

// ─── Signature verification ───────────────────────────────────────────────────

async function verifyStripeSignature(
  body: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce((acc: Record<string, string>, part: string) => {
    const eq = part.indexOf("=");
    if (eq > 0) acc[part.slice(0, eq).trim()] = part.slice(eq + 1);
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];

  if (!timestamp || !expectedSig) return false;

  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (Math.abs(age) > 300) {
    log(`Signature too old: ${age}s`);
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  const computedSig = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSig === expectedSig;
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function resolveOrCreateUserId(
  session: Record<string, unknown>,
  meta: Record<string, string>,
  adminClient: ReturnType<typeof createClient>,
): Promise<string | null> {
  if (meta.user_id) return meta.user_id;

  const customerEmail =
    (session.customer_email as string) ||
    ((session.customer_details as Record<string, unknown> | undefined)?.email as string) ||
    meta.customer_email ||
    "";

  if (!customerEmail) {
    log("No user_id or customer email — cannot activate");
    return null;
  }

  log(`Anonymous membership path for ${customerEmail}`);

  const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listErr) {
    log(`listUsers failed: ${listErr.message}`);
    return null;
  }

  const existing = listData?.users?.find(
    (u) => u.email?.toLowerCase() === customerEmail.toLowerCase(),
  );

  let userId: string;
  if (existing) {
    userId = existing.id;
    log(`Found existing auth user ${userId}`);
  } else {
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
    });
    if (createErr || !newUser.user) {
      log(`Failed to create auth user: ${createErr?.message}`);
      return null;
    }
    userId = newUser.user.id;
    log(`Created auth user ${userId}`);
  }

  const { data: profile } = await adminClient
    .from("member_profiles")
    .select("id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    const usernameBase = customerEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30);
    const username = `${usernameBase}_${userId.slice(0, 8)}`;
    await adminClient.from("member_profiles").insert({
      user_id: userId,
      username,
      display_name: customerEmail.split("@")[0],
      membership_status: "inactive",
    });
    log(`Created member_profiles for ${userId}`);
  }

  return userId;
}

async function handleCheckoutCompleted(
  session: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
): Promise<void> {
  const meta = (session.metadata ?? {}) as Record<string, string>;

  if (meta.type !== "membership") {
    log("Not a membership payment -- skipping");
    return;
  }

  const userId = await resolveOrCreateUserId(session, meta, adminClient);
  if (!userId) {
    log("Could not resolve user for membership activation");
    return;
  }

  const inviteCode = meta.invite_code ?? "";
  const sessionId = session.id as string;
  const introducer_user_id = meta.introducer_user_id || null;

  log(`Processing membership activation for user ${userId}`);

  // T6: Update payment record to completed (or insert if anon path had no pending row)
  const { data: paymentData } = await adminClient
    .from("membership_payments")
    .update({
      status: "completed",
      stripe_payment_intent: (session.payment_intent as string) || null,
      completed_at: new Date().toISOString(),
      introducer_user_id: introducer_user_id,
    })
    .eq("stripe_session_id", sessionId)
    .select("id")
    .maybeSingle();

  let paymentRowId = paymentData?.id;

  if (!paymentRowId) {
    const { data: inserted } = await adminClient
      .from("membership_payments")
      .insert({
        member_id: userId,
        amount: 5.00,
        stripe_session_id: sessionId,
        stripe_payment_intent: (session.payment_intent as string) || null,
        status: "completed",
        is_renewal: meta.is_renewal === "true",
        completed_at: new Date().toISOString(),
        introducer_user_id: introducer_user_id,
      })
      .select("id")
      .single();
    paymentRowId = inserted?.id;
    log("Payment record inserted (anon path)");
  } else {
    log("Payment record updated (T6)");
  }

  // T7a: Activate membership in member_profiles
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await adminClient
    .from("member_profiles")
    .update({
      membership_status: "active",
      membership_expires_at: oneYearFromNow.toISOString().split("T")[0],
      stripe_customer_id: (session.customer as string) || null,
    })
    .eq("user_id", userId);

  log("member_profiles updated (T7a)");

  // T7b: Mark user_credits for backward compat
  await adminClient
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        membership_stake_paid: true,
        membership_stake_paid_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  log("user_credits updated (T7b)");

  // BP079: Red Carpet attribution tracking — if introducer_user_id is present, create attribution
  if (introducer_user_id && paymentRowId) {
    log(`Recording attribution for introducer ${introducer_user_id}`);
    await adminClient.from("promotion_attributions").insert({
      introducer_user_id: introducer_user_id,
      attributed_amount_cents: 500, // $5 membership payment → 500 credits (1:1 USD to cents)
      currency_class: "credits",
      attribution_event: "first_payment",
      source_payment_id: paymentRowId,
      vesting_unlock_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30-day vesting
    });
    log("Attribution recorded for introducer");
  }

  // Stage Marks for manual Founder approval (auto-gate off by default)
  await adminClient
    .from("marks_allocation_queue" as string)
    .insert({
      member_id: userId,
      reason: "membership_join",
      marks_units: 0, // HELD FOR FOUNDER -- rate set in platform_canonical
      phase: "manual",
      status: "pending_approval",
      triggered_by: sessionId,
      note:
        "Staged for Founder approval. Reason: membership_join. Rate: HELD FOR FOUNDER. " +
        "Marks = cooperative participation -- not equity, not shares, not guaranteed return.",
    } as Record<string, unknown>);

  log("Marks allocation staged (manual gate)");

  // Handle invite code if present
  if (inviteCode) {
    await adminClient
      .from("invitations")
      .update({
        status: "used",
        invitee_id: userId,
        used_at: new Date().toISOString(),
      })
      .eq("invite_code", inviteCode)
      .eq("status", "active");

    const { data: invitation } = await adminClient
      .from("invitations")
      .select("inviter_id")
      .eq("invite_code", inviteCode)
      .single();

    if (invitation) {
      const { data: newMember } = await adminClient
        .from("member_profiles")
        .select("display_name")
        .eq("user_id", userId)
        .maybeSingle();

      await adminClient.from("notifications").insert({
        user_id: (invitation as Record<string, unknown>).inviter_id,
        type: "invitation_accepted",
        title: "Invitation Accepted!",
        message: `${(newMember as Record<string, unknown> | null)?.display_name ?? "Someone"} joined using your invitation.`,
        link: "/invite",
      });

      log(`Inviter ${(invitation as Record<string, unknown>).inviter_id} notified`);
    }
  }

  // Welcome notification
  await adminClient.from("notifications").insert({
    user_id: userId,
    type: "membership_activated",
    title: "Welcome to Liana Banyan!",
    message: "Your Access Key is active. Start exploring your first steps.",
    link: "/first-steps",
  });

  log("Welcome notification sent");

  // HELD: receipt email (Resend)
  // When RESEND_MEMBERSHIP_RECEIPT_ENABLED is set to 'true' in platform_canonical,
  // call send-transactional-email with template='membership_receipt'.
  // This is HELD FOR FOUNDER to supply RESEND_API_KEY.
  log("Receipt email: HELD FOR FOUNDER (RESEND_MEMBERSHIP_RECEIPT_ENABLED not set)");
}

async function handleAsyncPaymentFailed(
  session: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
): Promise<void> {
  const meta = (session.metadata ?? {}) as Record<string, string>;
  if (meta.type !== "membership") return;

  const sessionId = session.id as string;
  const userId = meta.user_id;

  log(`Handling async payment failed for session ${sessionId}, user ${userId}`);

  await adminClient
    .from("membership_payments")
    .update({
      status: "failed",
      failed_reason: "checkout.session.async_payment_failed",
    })
    .eq("stripe_session_id", sessionId);

  // Notify member
  if (userId) {
    await adminClient.from("notifications").insert({
      user_id: userId,
      type: "payment_failed",
      title: "Payment Failed",
      message:
        "Your $5 membership payment could not be processed. " +
        "Please try again from the Join page.",
      link: "/join",
    });
  }

  log("Payment failure recorded and member notified");
}

async function handleSubscriptionDeleted(
  subscription: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
): Promise<void> {
  const customerId = subscription.customer as string;
  if (!customerId) return;

  log(`Handling subscription cancellation for customer ${customerId}`);

  // Find the member by stripe_customer_id
  const { data: profile } = await adminClient
    .from("member_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    log(`No member profile found for customer ${customerId}`);
    return;
  }

  const userId = (profile as Record<string, unknown>).user_id as string;

  // Update membership status
  await adminClient
    .from("member_profiles")
    .update({ membership_status: "cancelled" })
    .eq("user_id", userId);

  // Reflect in user_credits
  await adminClient
    .from("user_credits")
    .update({ membership_stake_paid: false })
    .eq("user_id", userId);

  // Notify member
  await adminClient.from("notifications").insert({
    user_id: userId,
    type: "membership_cancelled",
    title: "Membership Cancelled",
    message:
      "Your annual cooperative membership has been cancelled. " +
      "You can rejoin at any time for $5/year.",
    link: "/join",
  });

  log(`Membership cancelled for user ${userId}`);
}

async function handleChargeRefunded(
  charge: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  log(`Handling refund for payment_intent ${paymentIntentId}`);

  // Find the payment record by payment_intent
  const { data: payment } = await adminClient
    .from("membership_payments")
    .select("member_id, stripe_session_id")
    .eq("stripe_payment_intent", paymentIntentId)
    .maybeSingle();

  if (!payment) {
    log(`No membership payment found for intent ${paymentIntentId}`);
    return;
  }

  const paymentRecord = payment as Record<string, unknown>;

  // Mark payment as refunded
  await adminClient
    .from("membership_payments")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent", paymentIntentId);

  // Deactivate membership
  const userId = paymentRecord.member_id as string;
  await adminClient
    .from("member_profiles")
    .update({ membership_status: "inactive" })
    .eq("user_id", userId);

  await adminClient
    .from("user_credits")
    .update({ membership_stake_paid: false })
    .eq("user_id", userId);

  // Notify member
  await adminClient.from("notifications").insert({
    user_id: userId,
    type: "payment_refunded",
    title: "Membership Refunded",
    message:
      "Your $5 membership payment has been refunded. " +
      "Your membership is no longer active. Rejoin anytime.",
    link: "/join",
  });

  log(`Refund processed for user ${userId}`);
}

async function handleInvoicePaymentFailed(
  invoice: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>,
): Promise<void> {
  const customerId = invoice.customer as string;
  const invoiceId = invoice.id as string;
  const attemptCount = (invoice.attempt_count as number) ?? 1;

  log(`Handling invoice.payment_failed for invoice ${invoiceId}, attempt ${attemptCount}`);

  // Log retry attempt for monitoring
  await adminClient
    .from("membership_payments" as string)
    .insert({
      stripe_session_id: `retry_${invoiceId}_attempt_${attemptCount}`,
      member_id: customerId ?? "unknown",
      amount: 5.00,
      status: "failed",
      is_renewal: true,
      failed_reason: `invoice.payment_failed attempt ${attemptCount}`,
    } as Record<string, unknown>)
    .then(() => {
      // Non-critical -- best effort retry log
    });

  log(`Retry attempt ${attemptCount} logged for invoice ${invoiceId}`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

function jsonOk() {
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      log("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
      return new Response("Server config error", { status: 500 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();

    const sigValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!sigValid) {
      log("Signature verification failed");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
    log(`Event type: ${event.type}`);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, adminClient);
        break;

      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(event.data.object, adminClient);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, adminClient);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object, adminClient);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object, adminClient);
        break;

      default:
        log(`Unhandled event type: ${event.type} -- ignoring`);
    }

    return jsonOk();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`FATAL: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
