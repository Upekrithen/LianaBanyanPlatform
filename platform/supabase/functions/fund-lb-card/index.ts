import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { fundCard } from "../_shared/cardProviderAdapter.ts";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-system-key",
};

type FundBody = {
  user_id?: string;
  amount_cents?: number;
  funding_type?: string;
  source_description?: string;
  related_order_id?: string;
  related_project_id?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const systemKey = Deno.env.get("LB_SYSTEM_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!systemKey || !supabaseUrl || !supabaseKey) {
    console.error("Missing LB_SYSTEM_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const headerKey = req.headers.get("x-system-key");
  if (!headerKey || headerKey !== systemKey) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: FundBody;
  try {
    body = (await req.json()) as FundBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { user_id, amount_cents, funding_type, source_description, related_order_id, related_project_id } =
    body;

  if (!user_id || typeof user_id !== "string") {
    return new Response(JSON.stringify({ error: "user_id is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!funding_type || typeof funding_type !== "string") {
    return new Response(JSON.stringify({ error: "funding_type is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (typeof amount_cents !== "number" || !Number.isInteger(amount_cents)) {
    return new Response(JSON.stringify({ error: "amount_cents must be an integer" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (amount_cents <= 0 || amount_cents > 100_000) {
    return new Response(
      JSON.stringify({ error: "amount_cents must be > 0 and <= 100000" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: cardholder, error: lookupErr } = await supabase
    .from("lb_cardholders")
    .select("id, card_balance_cents, provider_cardholder_id, stripe_cardholder_id, payout_preference")
    .eq("user_id", user_id)
    .maybeSingle();

  if (lookupErr) {
    console.error("fund-lb-card lookup error", lookupErr);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!cardholder) {
    return new Response(JSON.stringify({ error: "No cardholder for user" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const newBalance = (cardholder.card_balance_cents ?? 0) + amount_cents;

  const { data: updated, error: updErr } = await supabase
    .from("lb_cardholders")
    .update({
      card_balance_cents: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardholder.id)
    .select("card_balance_cents")
    .single();

  if (updErr || !updated) {
    console.error("fund-lb-card update error", updErr);
    return new Response(JSON.stringify({ error: "Failed to update balance" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: fundErr } = await supabase.from("lb_card_funding").insert({
    cardholder_id: cardholder.id,
    amount_cents,
    funding_type,
    source_description: source_description ?? null,
    related_order_id: related_order_id ?? null,
    related_project_id: related_project_id ?? null,
  });

  if (fundErr) {
    console.error("fund-lb-card funding insert error", fundErr);
    await supabase
      .from("lb_cardholders")
      .update({
        card_balance_cents: cardholder.card_balance_cents ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardholder.id);
    return new Response(JSON.stringify({ error: "Failed to record funding" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const providerCardholderId = cardholder.provider_cardholder_id || cardholder.stripe_cardholder_id;
  if (providerCardholderId) {
    try {
      const fundResult = await fundCard({
        providerCardholderId,
        amountCents: amount_cents,
        description: source_description || `LB Card funding: ${funding_type}`,
        idempotencyKey: `fund_${cardholder.id}_${Date.now()}`,
      });
      await supabase
        .from("lb_card_funding")
        .update({ provider_transfer_id: fundResult.providerTransferId })
        .eq("cardholder_id", cardholder.id)
        .order("created_at", { ascending: false })
        .limit(1);
    } catch (err) {
      console.error("[fund-lb-card] Provider call failed, local balance updated:", err);
    }
  }

  await writeLedgerEntry({
    stripe_event_id: `card_fund_${cardholder.id}_${Date.now()}`,
    ledger_category: "card_funding",
    amount_cents: amount_cents,
    payee_id: user_id,
    is_patronage: false,
    description: `Card funding: ${funding_type}`,
    webhook_source: "fund-lb-card",
  });

  // Phase 1: Log payout preference for future auto-payout (manual cash-out for now)
  if (cardholder.payout_preference === "connect_instant" || cardholder.payout_preference === "connect_standard") {
    const { data: connectAcct } = await supabase
      .from("member_connect_accounts")
      .select("id, stripe_account_id, payouts_enabled")
      .eq("user_id", user_id)
      .maybeSingle();

    if (connectAcct?.payouts_enabled) {
      console.log("[fund-lb-card] Member prefers Connect payout — manual cash-out via /dashboard/payouts");
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      new_balance_cents: updated.card_balance_cents,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
