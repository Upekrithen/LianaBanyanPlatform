// submit-suggestion — M23 · BP096
// Canon pearl: canon_dual_license_save_more_than_you_pay_sspl_pledge_or_apache_business_bp092
// $10 suggestion micro-tier. Insert into csia_suggestions.
// Handles Stripe checkout for $10 OR Marks-equivalent deduction.
//
// Truth-Always FLAG: csia_suggestions table is DEFERRED to M22-EXTENDED v4.
//   If table does not exist, this function will return a 503 with clear flag rather than 500.
//   Deploy this function AFTER confirming csia_suggestions table exists in DB.
//   Expected columns: id, member_id, round_id, suggestion_text, payment_method,
//     stripe_checkout_session_id, marks_deducted, status, submitted_at.

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

type PaymentMethod = "stripe_card" | "marks";

function corsResponse(req: Request, body: unknown, status = 200): Response {
  const origin = req.headers.get("origin") ?? "";
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin), "Content-Type": "application/json" },
  });
}

const SUGGESTION_PRICE_CENTS = 1000; // $10.00
// Marks-equivalent: $10 / face value. Face value from env, default $1/mark = 10 marks.
function marksEquivalent(marksFaceValueCents: number): number {
  return Math.ceil(SUGGESTION_PRICE_CENTS / marksFaceValueCents);
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
    suggestion_text?: string;
    payment_method?: PaymentMethod;
    success_url?: string;
    cancel_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, round_id, suggestion_text, payment_method } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!round_id) return corsResponse(req, { ok: false, error: "round_id is required" }, 400);
  if (!suggestion_text || suggestion_text.trim().length < 10) {
    return corsResponse(req, { ok: false, error: "suggestion_text must be at least 10 characters" }, 400);
  }
  if (!payment_method || !["stripe_card", "marks"].includes(payment_method)) {
    return corsResponse(req, { ok: false, error: "payment_method must be 'stripe_card' or 'marks'" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const marksFaceValueCents = parseInt(Deno.env.get("MARKS_FACE_VALUE_CENTS") ?? "100", 10);
  const supabase = createClient(supabaseUrl, serviceKey);

  // Truth-Always: probe for table existence
  const { error: probeError } = await supabase
    .from("csia_suggestions")
    .select("id")
    .limit(1);

  if (probeError && (probeError.message.includes("does not exist") || probeError.message.includes("relation"))) {
    return corsResponse(req, {
      ok: false,
      error: "csia_suggestions table not yet deployed. This function requires M22-EXTENDED v4 migration.",
      truth_always_flag: "csia_suggestions TABLE MISSING — deferred to M22-EXTENDED v4",
    }, 503);
  }

  const suggestionId = crypto.randomUUID();

  if (payment_method === "marks") {
    const marksNeeded = marksEquivalent(marksFaceValueCents);

    // Deduct marks (best-effort via RPC or direct update)
    const { error: marksError } = await supabase.rpc("deduct_marks", {
      p_member_id: member_id,
      p_marks_count: marksNeeded,
      p_reason: "csia_suggestion",
      p_reference_id: suggestionId,
    });

    if (marksError) {
      console.error("Marks deduction error:", marksError.message);
      return corsResponse(req, { ok: false, error: "Failed to deduct marks: " + marksError.message + " — ensure deduct_marks RPC exists" }, 500);
    }

    const { data, error } = await supabase
      .from("csia_suggestions")
      .insert({
        id: suggestionId,
        member_id,
        round_id,
        suggestion_text: suggestion_text.trim(),
        payment_method: "marks",
        marks_deducted: marksNeeded,
        status: "received",
        submitted_at: new Date().toISOString(),
      })
      .select("id, status, submitted_at")
      .single();

    if (error) {
      return corsResponse(req, { ok: false, error: "Failed to record suggestion: " + error.message }, 500);
    }

    return corsResponse(req, { ok: true, suggestion_id: data.id, payment_method: "marks", marks_deducted: marksNeeded, status: data.status });
  }

  // stripe_card path
  if (!stripeKey) {
    return corsResponse(req, { ok: false, error: "Stripe not configured" }, 500);
  }

  const stripePayload = new URLSearchParams({
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "CSIA Suggestion Submission",
    "line_items[0][price_data][unit_amount]": SUGGESTION_PRICE_CENTS.toString(),
    "line_items[0][quantity]": "1",
    "mode": "payment",
    "success_url": body.success_url ?? "https://mnemosynec.org/csia/suggestion-success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": body.cancel_url ?? "https://mnemosynec.org/csia/suggestion-cancel",
    "metadata[suggestion_id]": suggestionId,
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
    return corsResponse(req, { ok: false, error: "Stripe checkout failed: " + (stripeData.error?.message ?? "unknown") }, 502);
  }

  // Insert suggestion as awaiting_payment; webhook confirms
  const { data, error } = await supabase
    .from("csia_suggestions")
    .insert({
      id: suggestionId,
      member_id,
      round_id,
      suggestion_text: suggestion_text.trim(),
      payment_method: "stripe_card",
      stripe_checkout_session_id: stripeData.id,
      status: "awaiting_payment",
      submitted_at: new Date().toISOString(),
    })
    .select("id, status")
    .single();

  if (error) {
    console.error("csia_suggestions insert error:", error.message);
    return corsResponse(req, { ok: true, suggestion_id: suggestionId, checkout_url: stripeData.url, warning: "DB insert failed: " + error.message });
  }

  return corsResponse(req, { ok: true, suggestion_id: data.id, checkout_url: stripeData.url, status: data.status });
});
