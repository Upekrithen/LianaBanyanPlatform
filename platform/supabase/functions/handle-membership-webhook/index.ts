import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const log = (msg: string) => console.log(`[MembershipWebhook] ${msg}`);

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

    // Verify webhook signature manually (no SDK dependency)
    const parts = signature.split(",").reduce((acc: Record<string, string>, part: string) => {
      const [k, v] = part.split("=");
      acc[k.trim()] = v;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = parts["t"];
    const expectedSig = parts["v1"];

    if (!timestamp || !expectedSig) {
      return new Response("Invalid signature format", { status: 400 });
    }

    // Tolerance: reject events older than 5 minutes
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (Math.abs(age) > 300) {
      return new Response("Timestamp too old", { status: 400 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${body}`)
    );
    const computedSig = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSig !== expectedSig) {
      log("Signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    log(`Event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.metadata?.type !== "membership") {
        log("Not a membership payment, skipping");
        return jsonOk();
      }

      const userId = session.metadata.user_id;
      const inviteCode = session.metadata.invite_code || "";
      log(`Processing membership for user ${userId}`);

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // 1. Update payment record
      await adminClient
        .from("membership_payments")
        .update({
          status: "completed",
          stripe_payment_intent: session.payment_intent || null,
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

      log("Payment record updated");

      // 2. Activate membership in member_profiles
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      await adminClient
        .from("member_profiles")
        .update({
          membership_status: "active",
          membership_expires_at: oneYearFromNow.toISOString().split("T")[0],
          stripe_customer_id: session.customer || null,
        })
        .eq("user_id", userId);

      log("member_profiles updated");

      // 3. Also mark user_credits for backward compat
      await adminClient
        .from("user_credits")
        .upsert(
          {
            user_id: userId,
            membership_stake_paid: true,
            membership_stake_paid_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      log("user_credits updated");

      // 4. If invitation code, mark it as used
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
            user_id: invitation.inviter_id,
            type: "invitation_accepted",
            title: "Invitation Accepted!",
            message: `${newMember?.display_name || "Someone"} joined using your invitation.`,
            link: "/invite",
          });

          log(`Inviter ${invitation.inviter_id} notified`);
        }
      }

      // 5. Welcome notification
      await adminClient.from("notifications").insert({
        user_id: userId,
        type: "membership_activated",
        title: "Welcome to Liana Banyan!",
        message: "Your Access Key is active. Start exploring your first steps.",
        link: "/first-steps",
      });

      log("Welcome notification sent");
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

function jsonOk() {
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
