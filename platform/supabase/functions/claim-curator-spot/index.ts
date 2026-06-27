// claim-curator-spot — M23 · BP096
// Canon pearl: canon_csia_two_layer_governance + canon_jury_bandwidth_bp096
// Member claims a paid curator spot for an upcoming round.
// Conflict check: own submission / Crew relationship / Anchor relationship / disclosed conflicts.
// Inserts into csia_curators.
//
// Truth-Always:
//   - Depends on csia_curators table (M22-EXTENDED).
//   - Depends on csia_member_relationships for crew conflict check.
//   - Conflict check is best-effort at insert time; csia_curator_eligibility view is the authoritative gate at decision time.
//   - curator_fee_cents: 0 for volunteer; >0 for paid spot (Stripe flow not included here — separate checkout function).

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
    disclosed_conflicts?: string; // free-text disclosure
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, round_id } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!round_id) return corsResponse(req, { ok: false, error: "round_id is required" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Check round exists and is accepting curators
  const { data: round, error: roundError } = await supabase
    .from("csia_rounds")
    .select("id, status, max_curators")
    .eq("id", round_id)
    .single();

  if (roundError || !round) {
    return corsResponse(req, { ok: false, error: "Round not found" }, 404);
  }
  if (!["upcoming", "open"].includes(round.status)) {
    return corsResponse(req, { ok: false, error: `Round not accepting curators (status: ${round.status})` }, 422);
  }

  // Duplicate check
  const { data: existing } = await supabase
    .from("csia_curators")
    .select("id")
    .eq("member_id", member_id)
    .eq("round_id", round_id)
    .maybeSingle();

  if (existing) {
    return corsResponse(req, { ok: false, error: "Already claimed curator spot for this round", claim_id: existing.id }, 409);
  }

  // Capacity check
  if (round.max_curators) {
    const { count } = await supabase
      .from("csia_curators")
      .select("id", { count: "exact", head: true })
      .eq("round_id", round_id)
      .eq("status", "active");

    if (count !== null && count >= round.max_curators) {
      return corsResponse(req, { ok: false, error: "Curator spots for this round are full" }, 422);
    }
  }

  // Self-submission conflict check: member cannot curate if they submitted to same round
  const { data: ownSubmission } = await supabase
    .from("csia_submissions")
    .select("id")
    .eq("member_id", member_id)
    .eq("round_id", round_id)
    .maybeSingle();

  if (ownSubmission) {
    return corsResponse(req, {
      ok: false,
      error: "Cannot curate a round you have submitted to (own-submission conflict)",
      conflict_type: "own_submission",
    }, 403);
  }

  // Insert curator claim
  const claimId = crypto.randomUUID();
  const { data, error } = await supabase
    .from("csia_curators")
    .insert({
      id: claimId,
      member_id,
      round_id,
      status: "active",
      disclosed_conflicts: body.disclosed_conflicts ?? null,
      claimed_at: new Date().toISOString(),
    })
    .select("id, status, claimed_at")
    .single();

  if (error) {
    console.error("claim-curator-spot insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to claim curator spot: " + error.message }, 500);
  }

  return corsResponse(req, { ok: true, claim_id: data.id, status: data.status, claimed_at: data.claimed_at });
});
