// submit-csia-reservation — M23 · BP096
// Canon pearl: canon_dual_license_save_more_than_you_pay_sspl_pledge_or_apache_business_bp092
// Creates Stripe Checkout session for $250 CSIA reservation OR marks pending for non-cash tiers.
// Three payment tiers: standard_cash | service_substituted | anchor_sponsored
//
// Truth-Always:
//   - Depends on csia_reservations table (M22-EXTENDED). Verify via information_schema before deploy.
//   - Stripe secret key loaded from STRIPE_SECRET_KEY env var — never echoed.
//   - service_substituted and anchor_sponsored tiers do NOT create Stripe session; status = 'pending_review'.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS origin allowlist — regex-validated, echoed back (BP096 CORS fix)
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/mnemosynec\.(org|ai)$/,
  /^http:\/\/localhost:1313$/,
  /^https:\/\/mnemosyne-lianabanyan--[a-z0-9-]+\.web\.app$/,
];

function resolveAllowOrigin(origin: string): string {
  if (ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin))) return origin;
  return "https://mnemosynec.org";
}

const corsBaseHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const VALID_TIERS = ["standard_cash", "service_substituted", "anchor_sponsored"] as const;
type PaymentTier = typeof VALID_TIERS[number];

function corsResponse(req: Request, body: unknown, status = 200): Response {
  const origin = req.headers.get("origin") ?? "";
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin), "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin) } });
  }
  if (req.method !== "POST") {
    return corsResponse(req, { ok: false, error: "Method not allowed" }, 405);
  }

  let body: {
    member_id?: string;
    round_id?: string;
    payment_tier?: PaymentTier;
    success_url?: string;
    cancel_url?: string;
    service_description?: string; // for service_substituted
    anchor_id?: string; // for anchor_sponsored
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, round_id, payment_tier, success_url, cancel_url } = body;

  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!round_id) return corsResponse(req, { ok: false, error: "round_id is required" }, 400);
  if (!payment_tier || !VALID_TIERS.includes(payment_tier)) {
    return corsResponse(req, { ok: false, error: `payment_tier must be one of: ${VALID_TIERS.join(", ")}` }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Check for duplicate reservation
  const { data: existing } = await supabase
    .from("csia_reservations")
    .select("id, status")
    .eq("member_id", member_id)
    .eq("round_id", round_id)
    .maybeSingle();

  if (existing) {
    return corsResponse(req, { ok: false, error: "Reservation already exists for this member + round", reservation_id: existing.id, status: existing.status }, 409);
  }

  // Non-cash tiers: insert pending, no Stripe
  if (payment_tier !== "standard_cash") {
    const { data, error } = await supabase
      .from("csia_reservations")
      .insert({
        member_id,
        round_id,
        payment_tier,
        status: "pending_review",
        service_description: body.service_description ?? null,
        anchor_id: body.anchor_id ?? null,
        amount_cents: 0,
      })
      .select("id")
      .single();

    if (error) {
      return corsResponse(req, { ok: false, error: "Failed to insert reservation: " + error.message }, 500);
    }
    return corsResponse(req, { ok: true, reservation_id: data.id, status: "pending_review", checkout_url: null });
  }

  // standard_cash: create Stripe Checkout session
  if (!stripeKey) {
    return corsResponse(req, { ok: false, error: "Stripe not configured" }, 500);
  }

  const reservationId = crypto.randomUUID();

  const stripePayload = new URLSearchParams({
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "CSIA Round Reservation",
    "line_items[0][price_data][unit_amount]": "25000", // $250.00
    "line_items[0][quantity]": "1",
    "mode": "payment",
    "success_url": success_url ?? "https://mnemosynec.org/csia/reservation-success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": cancel_url ?? "https://mnemosynec.org/csia/reservation-cancel",
    "metadata[reservation_id]": reservationId,
    "metadata[member_id]": member_id,
    "metadata[round_id]": round_id,
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: stripePayload.toString(),
  });

  const stripeData = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("Stripe error:", stripeData);
    return corsResponse(req, { ok: false, error: "Stripe checkout creation failed: " + (stripeData.error?.message ?? "unknown") }, 502);
  }

  // Insert reservation record (status = awaiting_payment until webhook confirms)
  const { data, error } = await supabase
    .from("csia_reservations")
    .insert({
      id: reservationId,
      member_id,
      round_id,
      payment_tier: "standard_cash",
      status: "awaiting_payment",
      stripe_checkout_session_id: stripeData.id,
      amount_cents: 25000,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Reservation insert error:", error.message);
    // Don't block — Stripe session created, webhook will reconcile
    return corsResponse(req, { ok: true, reservation_id: reservationId, checkout_url: stripeData.url, warning: "DB insert failed — webhook will reconcile: " + error.message });
  }

  return corsResponse(req, { ok: true, reservation_id: data.id, checkout_url: stripeData.url, status: "awaiting_payment" });
});
