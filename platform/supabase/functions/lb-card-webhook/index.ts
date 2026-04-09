import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

// Lithic event types we handle
const HANDLED_EVENTS = [
  "transaction.authorized",
  "transaction.settled",
  "transaction.declined",
  "transaction.voided",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get("LITHIC_WEBHOOK_SECRET");
    if (webhookSecret) {
      const provided = req.headers.get("x-webhook-secret") ?? req.headers.get("webhook-verification");
      if (provided !== webhookSecret) {
        console.warn("[lb-card-webhook] Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    const payload = await req.json();
    const eventType = payload.event_type ?? payload.type ?? "";
    const txnData = payload.data ?? payload;

    console.log(`[lb-card-webhook] Event: ${eventType}, token: ${txnData.token ?? "unknown"}`);

    if (!HANDLED_EVENTS.includes(eventType as any)) {
      console.log(`[lb-card-webhook] Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const providerCardId = txnData.card?.token ?? txnData.card_token ?? null;
    const providerTxnId = txnData.token ?? "";
    const amountCents = Math.abs(txnData.amount ?? 0);
    const merchantName = txnData.merchant?.descriptor ?? txnData.merchant?.name ?? null;
    const merchantCategory = txnData.merchant?.mcc ?? null;
    const status = mapLithicStatus(eventType, txnData.status);

    // Look up our internal card by provider_card_id
    let cardRow: any = null;
    let cardholderRow: any = null;
    if (providerCardId) {
      const { data } = await adminClient
        .from("lb_cards")
        .select("*, lb_cardholders!inner(*)")
        .eq("provider_card_id", providerCardId)
        .maybeSingle();

      if (data) {
        cardRow = data;
        cardholderRow = (data as any).lb_cardholders;
      }
    }

    if (!cardRow) {
      console.warn(`[lb-card-webhook] No card found for provider_card_id=${providerCardId}`);
      return new Response(JSON.stringify({ received: true, card_not_found: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Idempotency: check if we already processed this event
    const { data: existingTxn } = await adminClient
      .from("lb_card_transactions")
      .select("id, status")
      .eq("provider_authorization_id", providerTxnId)
      .maybeSingle();

    if (existingTxn) {
      if (eventType === "transaction.settled" || eventType === "transaction.voided") {
        // Update existing transaction status
        await adminClient
          .from("lb_card_transactions")
          .update({
            status,
            provider_metadata: txnData,
          })
          .eq("id", existingTxn.id);

        console.log(`[lb-card-webhook] Updated txn ${existingTxn.id} to status=${status}`);
      } else {
        console.log(`[lb-card-webhook] Already processed ${providerTxnId}, skipping`);
      }

      return new Response(JSON.stringify({ received: true, deduplicated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Insert new transaction
    const { data: newTxn, error: txnErr } = await adminClient
      .from("lb_card_transactions")
      .insert({
        card_id: cardRow.id,
        provider_authorization_id: providerTxnId,
        stripe_authorization_id: null,
        amount_cents: amountCents,
        merchant_name: merchantName,
        merchant_category: merchantCategory,
        status,
        description: `${merchantName ?? "Transaction"} — ${eventType}`,
        provider_metadata: txnData,
      })
      .select("id")
      .single();

    if (txnErr) {
      console.error("[lb-card-webhook] Failed to insert transaction:", txnErr.message);
      throw txnErr;
    }

    // Update card balance for authorized transactions (debit)
    if (eventType === "transaction.authorized" && amountCents > 0 && cardholderRow) {
      const { error: balErr } = await adminClient.rpc("decrement_card_balance", {
        _cardholder_id: cardholderRow.id,
        _amount_cents: amountCents,
      }).maybeSingle();

      if (balErr) {
        // Fall back to direct update if RPC doesn't exist
        await adminClient
          .from("lb_cardholders")
          .update({
            card_balance_cents: Math.max(0, (cardholderRow.card_balance_cents ?? 0) - amountCents),
            updated_at: new Date().toISOString(),
          })
          .eq("id", cardholderRow.id);
      }
    }

    // Walking Billboard: record signal for Captain outreach intelligence
    if ((eventType === "transaction.authorized" || eventType === "transaction.settled") && cardholderRow) {
      const isParticipating = await checkParticipatingMerchant(adminClient, merchantName);

      const merchantInfo = txnData.merchant ?? {};
      await adminClient
        .from("walking_billboard_signals")
        .insert({
          cardholder_id: cardholderRow.id,
          card_id: cardRow.id,
          transaction_id: newTxn.id,
          merchant_name: merchantName,
          merchant_category: merchantCategory,
          merchant_descriptor: merchantInfo.descriptor ?? null,
          amount_cents: amountCents,
          location_city: merchantInfo.city ?? null,
          location_state: merchantInfo.state ?? null,
          location_country: merchantInfo.country ?? "US",
          location_zip: merchantInfo.postal_code ?? null,
          is_participating_merchant: isParticipating,
          signal_strength: 1,
          transacted_at: txnData.created ?? new Date().toISOString(),
          provider: "lithic",
          provider_event_id: providerTxnId,
        });

      console.log(
        `[lb-card-webhook] Walking Billboard signal: ${merchantName} (participating=${isParticipating})`,
      );
    }

    // Write to transaction ledger for Subchapter T classification
    try {
      await writeLedgerEntry({
        stripe_event_id: `lithic_${providerTxnId}`,
        ledger_category: "card_transaction",
        amount_cents: amountCents,
        payer_id: cardholderRow?.user_id,
        is_patronage: true,
        patronage_type: "purchase",
        description: `LB Card: ${merchantName ?? "transaction"} (${eventType})`,
        webhook_source: "lb-card-webhook",
        metadata: { provider: "lithic", event_type: eventType },
      });
    } catch (ledgerErr) {
      console.error("[lb-card-webhook] Ledger write failed (non-fatal):", ledgerErr);
    }

    console.log(
      `[lb-card-webhook] Processed ${eventType}: txn=${newTxn.id}, amount=${amountCents}c, merchant=${merchantName}`,
    );

    return new Response(JSON.stringify({ received: true, transaction_id: newTxn.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[lb-card-webhook] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function mapLithicStatus(eventType: string, rawStatus?: string): string {
  switch (eventType) {
    case "transaction.authorized":
      return "authorized";
    case "transaction.settled":
      return "completed";
    case "transaction.declined":
      return "declined";
    case "transaction.voided":
      return "voided";
    default:
      return rawStatus ?? "pending";
  }
}

async function checkParticipatingMerchant(
  adminClient: ReturnType<typeof createClient>,
  merchantName: string | null,
): Promise<boolean> {
  if (!merchantName) return false;

  // Check if merchant exists in our storefronts (approximate match)
  const normalized = merchantName.toLowerCase().trim();
  const { data } = await adminClient
    .from("storefronts")
    .select("id")
    .ilike("business_name", `%${normalized}%`)
    .limit(1)
    .maybeSingle();

  return !!data;
}
