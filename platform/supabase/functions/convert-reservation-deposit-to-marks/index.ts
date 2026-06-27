// convert-reservation-deposit-to-marks — M23 · BP096
// Canon pearl: canon_member_modal_substrate_advantage_immediate_value_bp092
//              canon_joules_pricing_event_purchase_face_value_outright_1_2_credits_bp092
// At cancellation: contestant chooses refund OR Marks conversion.
// (a) refund: $125 cash via Stripe refund on original charge
// (b) convert: insert into marks_grants with grant_source='reservation_conversion', marks_class='backed'
// Updates csia_reservations.contestant_share_status accordingly.
//
// Truth-Always:
//   - Backed marks = $125 / marks face value. Marks face value from env MARKS_FACE_VALUE_CENTS (default 100 = $1/mark).
//   - Depends on marks_grants table (M22-EXTENDED). Confirm columns before deploy.
//   - Depends on csia_reservations.contestant_share_status column.
//   - Stripe refund requires original charge_id stored on reservation; if missing, flags for manual review.
//   - Only $250 standard_cash reservations can refund $125; other tiers → convert-only.

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

type ConversionChoice = "refund_cash" | "convert_to_marks";

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
    reservation_id?: string;
    choice?: ConversionChoice;
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, reservation_id, choice } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!reservation_id) return corsResponse(req, { ok: false, error: "reservation_id is required" }, 400);
  if (!choice || !["refund_cash", "convert_to_marks"].includes(choice)) {
    return corsResponse(req, { ok: false, error: "choice must be 'refund_cash' or 'convert_to_marks'" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const marksFaceValueCents = parseInt(Deno.env.get("MARKS_FACE_VALUE_CENTS") ?? "100", 10);
  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch reservation
  const { data: reservation, error: resError } = await supabase
    .from("csia_reservations")
    .select("id, member_id, payment_tier, status, stripe_charge_id, amount_cents, contestant_share_status")
    .eq("id", reservation_id)
    .eq("member_id", member_id)
    .single();

  if (resError || !reservation) {
    return corsResponse(req, { ok: false, error: "Reservation not found" }, 404);
  }
  if (reservation.status === "cancelled") {
    return corsResponse(req, { ok: false, error: "Reservation already cancelled" }, 409);
  }
  if (reservation.contestant_share_status && reservation.contestant_share_status !== "pending") {
    return corsResponse(req, { ok: false, error: `Contestant share already processed (status: ${reservation.contestant_share_status})` }, 409);
  }

  const refundAmountCents = 12500; // $125.00 — contestant half of $250

  if (choice === "refund_cash") {
    if (reservation.payment_tier !== "standard_cash") {
      return corsResponse(req, { ok: false, error: "Cash refund only available for standard_cash tier. Choose convert_to_marks instead." }, 422);
    }
    if (!reservation.stripe_charge_id) {
      // Flag for manual review
      await supabase.from("csia_reservations").update({
        status: "cancelled",
        contestant_share_status: "manual_refund_required",
      }).eq("id", reservation_id);

      return corsResponse(req, {
        ok: true,
        status: "manual_refund_required",
        note: "No Stripe charge ID on record. Flagged for manual refund of $125.",
      });
    }

    if (!stripeKey) {
      return corsResponse(req, { ok: false, error: "Stripe not configured" }, 500);
    }

    // Issue Stripe refund for contestant half ($125)
    const refundPayload = new URLSearchParams({
      charge: reservation.stripe_charge_id,
      amount: refundAmountCents.toString(),
      reason: "requested_by_customer",
      "metadata[reservation_id]": reservation_id,
      "metadata[refund_type]": "contestant_cancellation_half",
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: refundPayload.toString(),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok) {
      return corsResponse(req, { ok: false, error: "Stripe refund failed: " + (stripeData.error?.message ?? "unknown") }, 502);
    }

    await supabase.from("csia_reservations").update({
      status: "cancelled",
      contestant_share_status: "refunded",
      stripe_refund_id: stripeData.id,
    }).eq("id", reservation_id);

    return corsResponse(req, {
      ok: true,
      choice: "refund_cash",
      refund_amount_cents: refundAmountCents,
      stripe_refund_id: stripeData.id,
      status: "refunded",
    });
  }

  // choice === 'convert_to_marks'
  const marksCount = Math.floor(refundAmountCents / marksFaceValueCents);
  const grantId = crypto.randomUUID();

  const { data: grant, error: grantError } = await supabase
    .from("marks_grants")
    .insert({
      id: grantId,
      member_id,
      marks_count: marksCount,
      marks_class: "backed",
      grant_source: "reservation_conversion",
      source_reservation_id: reservation_id,
      granted_at: new Date().toISOString(),
    })
    .select("id, marks_count")
    .single();

  if (grantError) {
    console.error("marks_grants insert error:", grantError.message);
    return corsResponse(req, { ok: false, error: "Failed to create marks grant: " + grantError.message }, 500);
  }

  await supabase.from("csia_reservations").update({
    status: "cancelled",
    contestant_share_status: "converted_to_marks",
  }).eq("id", reservation_id);

  return corsResponse(req, {
    ok: true,
    choice: "convert_to_marks",
    marks_granted: grant.marks_count,
    marks_class: "backed",
    grant_id: grant.id,
    status: "converted_to_marks",
  });
});
