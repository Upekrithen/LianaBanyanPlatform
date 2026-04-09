import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseStripeSignature(header: string | null): { t: string; v1: string[] } | null {
  if (!header) return null;
  const tMatch = header.match(/(?:^|,)\s*t=(\d+)/);
  const t = tMatch?.[1];
  if (!t) return null;
  const v1: string[] = [];
  for (const m of header.matchAll(/(?:^|,)\s*v1=([^,\s]+)/g)) {
    v1.push(m[1]);
  }
  if (v1.length === 0) return null;
  return { t, v1 };
}

function hexEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyStripeSignature(
  rawBody: string,
  stripeSignatureHeader: string | null,
  secret: string
): Promise<boolean> {
  const parsed = parseStripeSignature(stripeSignatureHeader);
  if (!parsed) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  const ts = parseInt(parsed.t, 10);
  if (Number.isNaN(ts) || Math.abs(nowSec - ts) > 300) {
    console.error("Stripe Connect webhook timestamp outside tolerance");
    return false;
  }

  const signedPayload = `${parsed.t}.${rawBody}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const hex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return parsed.v1.some((v) => hexEquals(hex, v));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error("Missing STRIPE_CONNECT_WEBHOOK_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  const okSig = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
  if (!okSig) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let event: { id?: string; type?: string; account?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const eventType = event.type;
  const obj = event.data?.object;
  const connectedAccountId = event.account;

  console.log(`[connect-account-webhook] ${eventType}`, { eventId: event.id, connectedAccountId });

  try {
    if (eventType === "account.updated") {
      const acct = obj as Record<string, unknown> | undefined;
      if (!acct) return jsonResponse({ received: true });

      const stripeAccountId = (acct.id as string) || connectedAccountId;
      if (!stripeAccountId) return jsonResponse({ received: true });

      const payoutsEnabled = acct.payouts_enabled as boolean | undefined;
      const chargesEnabled = acct.charges_enabled as boolean | undefined;
      const detailsSubmitted = acct.details_submitted as boolean | undefined;
      const requirements = acct.requirements as { currently_due?: string[]; disabled_reason?: string } | undefined;

      let onboardingStatus: string;
      if (detailsSubmitted && payoutsEnabled) {
        onboardingStatus = "complete";
      } else if (requirements?.disabled_reason) {
        onboardingStatus = "restricted";
      } else {
        onboardingStatus = "pending";
      }

      const { error: updErr } = await supabase
        .from("member_connect_accounts")
        .update({
          onboarding_status: onboardingStatus,
          payouts_enabled: payoutsEnabled ?? false,
          charges_enabled: chargesEnabled ?? false,
          stripe_metadata: {
            details_submitted: detailsSubmitted,
            requirements_due: requirements?.currently_due ?? [],
            disabled_reason: requirements?.disabled_reason ?? null,
            updated_from_event: event.id,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_account_id", stripeAccountId);

      if (updErr) console.error("[connect-account-webhook] account.updated DB error:", updErr);

      if (onboardingStatus === "complete") {
        const { data: connectRow } = await supabase
          .from("member_connect_accounts")
          .select("user_id")
          .eq("stripe_account_id", stripeAccountId)
          .maybeSingle();

        if (connectRow) {
          await supabase
            .from("lb_cardholders")
            .update({ payout_preference: "connect_standard" })
            .eq("user_id", connectRow.user_id);
          console.log("[connect-account-webhook] Set payout_preference to connect_standard for user:", connectRow.user_id);
        }
      }

      return jsonResponse({ received: true });
    }

    if (eventType === "payout.paid") {
      const payout = obj as Record<string, unknown> | undefined;
      if (!payout) return jsonResponse({ received: true });

      const stripePayoutId = payout.id as string;
      if (!stripePayoutId) return jsonResponse({ received: true });

      const { data: payoutRow, error: updErr } = await supabase
        .from("member_payouts")
        .update({
          status: "paid",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payout_id", stripePayoutId)
        .select("id, user_id, amount_cents")
        .maybeSingle();

      if (updErr) console.error("[connect-account-webhook] payout.paid DB error:", updErr);

      if (payoutRow) {
        await writeLedgerEntry({
          stripe_event_id: `connect_payout_paid_${event.id}`,
          ledger_category: "connect_payout",
          amount_cents: payoutRow.amount_cents,
          payee_id: payoutRow.user_id,
          is_patronage: false,
          description: `Connect payout completed: ${stripePayoutId}`,
          webhook_source: "connect-account-webhook",
          metadata: { stripe_payout_id: stripePayoutId, status: "paid" },
        });
      }

      return jsonResponse({ received: true });
    }

    if (eventType === "payout.failed") {
      const payout = obj as Record<string, unknown> | undefined;
      if (!payout) return jsonResponse({ received: true });

      const stripePayoutId = payout.id as string;
      const failureCode = payout.failure_code as string | undefined;
      const failureMessage = payout.failure_message as string | undefined;

      if (!stripePayoutId) return jsonResponse({ received: true });

      const { data: payoutRow, error: updErr } = await supabase
        .from("member_payouts")
        .update({
          status: "failed",
          failure_reason: failureMessage || failureCode || "Unknown failure",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payout_id", stripePayoutId)
        .select("id, user_id, connect_account_id, amount_cents")
        .maybeSingle();

      if (updErr) console.error("[connect-account-webhook] payout.failed DB error:", updErr);

      if (payoutRow) {
        const { data: ch } = await supabase
          .from("lb_cardholders")
          .select("id, card_balance_cents")
          .eq("user_id", payoutRow.user_id)
          .maybeSingle();

        if (ch) {
          await supabase
            .from("lb_cardholders")
            .update({
              card_balance_cents: (ch.card_balance_cents ?? 0) + payoutRow.amount_cents,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ch.id);
          console.log("[connect-account-webhook] Refunded balance after payout failure:", payoutRow.amount_cents);
        }

        await writeLedgerEntry({
          stripe_event_id: `connect_payout_failed_${event.id}`,
          ledger_category: "connect_payout",
          amount_cents: payoutRow.amount_cents,
          payee_id: payoutRow.user_id,
          is_patronage: false,
          status: "failed",
          description: `Connect payout failed: ${failureMessage || failureCode || "unknown"}`,
          webhook_source: "connect-account-webhook",
          metadata: { stripe_payout_id: stripePayoutId, failure_code: failureCode },
        });
      }

      return jsonResponse({ received: true });
    }

    if (eventType === "transfer.created") {
      const transfer = obj as Record<string, unknown> | undefined;
      const transferId = transfer?.id as string | undefined;
      console.log("[connect-account-webhook] transfer.created:", transferId);
      return jsonResponse({ received: true });
    }

    console.log("[connect-account-webhook] Unhandled event:", eventType);
    return jsonResponse({ received: true });

  } catch (e) {
    console.error("[connect-account-webhook] Error:", e);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
