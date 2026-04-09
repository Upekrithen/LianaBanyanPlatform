import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-system-key",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const SYSTEM_KEY = Deno.env.get("LB_SYSTEM_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const headerKey = req.headers.get("x-system-key");
  if (!SYSTEM_KEY || !headerKey || headerKey !== SYSTEM_KEY) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { order_id } = await req.json();

  const { data: order } = await supabaseAdmin
    .from("menu_orders")
    .select("id, subtotal, delivery_fee, total, storefront_id, customer_id")
    .eq("id", order_id)
    .eq("stripe_payment_status", "paid")
    .single();

  if (!order) {
    return new Response(
      JSON.stringify({ error: "Order not found or not paid" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: storefront } = await supabaseAdmin
    .from("storefronts")
    .select("id, user_id")
    .eq("id", order.storefront_id)
    .single();

  if (!storefront) {
    return new Response(
      JSON.stringify({ error: "Storefront not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: onboarder } = await supabaseAdmin
    .from("onboarding_credits")
    .select("user_id, credit_percentage")
    .eq("storefront_id", order.storefront_id)
    .eq("is_active", true)
    .eq("is_qualified", true)
    .maybeSingle();

  const { data: steward } = await supabaseAdmin
    .from("steward_agreements")
    .select("steward_id, management_fee_percentage")
    .eq("storefront_id", order.storefront_id)
    .eq("is_active", true)
    .maybeSingle();

  const subtotalCents = Math.round((order.subtotal || 0) * 100);
  const deliveryFeeCents = Math.round((order.delivery_fee || 0) * 100);

  const distributions: Array<{
    user_id: string;
    amount_cents: number;
    funding_type: string;
    source_description: string;
  }> = [];

  let creatorCents = subtotalCents;

  if (onboarder) {
    const onboarderCents = Math.round(
      subtotalCents * (onboarder.credit_percentage / 100),
    );
    creatorCents -= onboarderCents;
    if (onboarderCents > 0) {
      distributions.push({
        user_id: onboarder.user_id,
        amount_cents: onboarderCents,
        funding_type: "onboarding_credit",
        source_description: `3% onboarding credit from order ${order.id}`,
      });
    }
  }

  if (steward) {
    const stewardCents = Math.round(
      subtotalCents * (steward.management_fee_percentage / 100),
    );
    creatorCents -= stewardCents;
    if (stewardCents > 0) {
      distributions.push({
        user_id: steward.steward_id,
        amount_cents: stewardCents,
        funding_type: "steward_fee",
        source_description: `2% steward fee from order ${order.id}`,
      });
    }
  }

  if (creatorCents > 0) {
    distributions.push({
      user_id: storefront.user_id,
      amount_cents: creatorCents,
      funding_type: "creator_share",
      source_description: `Creator share from order ${order.id}`,
    });
  }

  if (deliveryFeeCents > 0) {
    distributions.push({
      user_id: storefront.user_id,
      amount_cents: deliveryFeeCents,
      funding_type: "delivery_fee",
      source_description: `Delivery fee from order ${order.id}`,
    });
  }

  const results = [];
  for (const dist of distributions) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/fund-lb-card`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
          "x-system-key": SYSTEM_KEY,
        },
        body: JSON.stringify({
          user_id: dist.user_id,
          amount_cents: dist.amount_cents,
          funding_type: dist.funding_type,
          source_description: dist.source_description,
          related_order_id: order.id,
        }),
      });
      const result = await resp.json();
      results.push({ ...dist, success: resp.ok, result });
    } catch (err) {
      results.push({ ...dist, success: false, error: String(err) });
    }
  }

  console.log(
    `[DistributeEarnings] Order ${order_id}: ${distributions.length} distributions, ` +
    `total ${distributions.reduce((s, d) => s + d.amount_cents, 0)} cents`,
  );

  // Calendar sync: log earnings split to storefront owner's calendar
  try {
    const creatorDist = distributions.find(d => d.funding_type === "creator_share");
    const onboarderDist = distributions.find(d => d.funding_type === "onboarding_credit");
    const stewardDist = distributions.find(d => d.funding_type === "steward_fee");

    await fetch(`${SUPABASE_URL}/functions/v1/calendar-sync-commerce`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
        "x-system-key": SYSTEM_KEY,
      },
      body: JSON.stringify({
        event_type: "earnings_distributed",
        user_id: storefront.user_id,
        metadata: {
          order_id: order_id,
          creator_amount: creatorDist?.amount_cents ?? 0,
          onboarder_amount: onboarderDist?.amount_cents ?? 0,
          steward_amount: stewardDist?.amount_cents ?? 0,
        },
      }),
    });
  } catch (calErr) {
    console.error("[DistributeEarnings] Calendar sync failed (non-critical):", calErr);
  }

  return new Response(
    JSON.stringify({
      order_id,
      distributions: results,
      total_distributed_cents: distributions.reduce(
        (sum, d) => sum + d.amount_cents,
        0,
      ),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
