// record-signup-order — M23 · BP096
// Canon pearl: canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089
// Stamps signup_order on entity_memberships at member creation time.
// Confirms canonical order-matters guarantee for cooperative membership sequencing.
//
// Truth-Always: Depends on entity_memberships.signup_order column (BIGSERIAL or INT).
//   If not present in schema, this insert will fail gracefully and surface warning.
//   Migration 20260627000002 adds the column if missing.

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

function corsResponse(req: Request, body: unknown, status = 200): Response {
  const origin = req.headers.get("origin") ?? "";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsBaseHeaders,
      "Access-Control-Allow-Origin": resolveAllowOrigin(origin),
      "Content-Type": "application/json",
    },
  });
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...corsBaseHeaders, "Access-Control-Allow-Origin": resolveAllowOrigin(origin) },
    });
  }

  if (req.method !== "POST") {
    return corsResponse(req, { ok: false, error: "Method not allowed" }, 405);
  }

  let body: { member_id?: string; membership_id?: string };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, membership_id } = body;
  if (!member_id || !membership_id) {
    return corsResponse(req, { ok: false, error: "member_id and membership_id are required" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get next signup_order via sequence (or count-based fallback)
  const { data: countData, error: countError } = await supabase
    .from("entity_memberships")
    .select("signup_order", { count: "exact", head: false })
    .order("signup_order", { ascending: false })
    .limit(1);

  if (countError) {
    console.error("signup_order lookup error:", countError.message);
    return corsResponse(req, { ok: false, error: "Failed to determine signup_order: " + countError.message }, 500);
  }

  const next_order = countData && countData.length > 0 && countData[0].signup_order != null
    ? (countData[0].signup_order as number) + 1
    : 1;

  const { data, error } = await supabase
    .from("entity_memberships")
    .update({ signup_order: next_order })
    .eq("id", membership_id)
    .eq("member_id", member_id)
    .select("id, signup_order")
    .single();

  if (error) {
    console.error("record-signup-order update error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to stamp signup_order: " + error.message }, 500);
  }

  return corsResponse(req, { ok: true, membership_id: data.id, signup_order: data.signup_order });
});
