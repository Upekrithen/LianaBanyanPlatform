// record-crew-formation — M23 · BP096
// Canon pearl: canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092
// Join My Crew toggle ON path. Records crew lead + member relationship.
// Inserts into csia_referrals AND csia_member_relationships (for conflict gate future use).
// Idempotent: returns existing relationship if already crew.
//
// Truth-Always:
//   - Depends on csia_referrals table (M22-EXTENDED).
//   - Depends on csia_member_relationships table (M22-EXTENDED or M23 helper migration).
//     If csia_member_relationships missing, falls back to csia_referrals only + surfaces warning.
//   - crew_lead_id cannot equal crew_member_id (self-crew rejected).

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
    crew_lead_id?: string;
    crew_member_id?: string; // the person joining the crew
    referral_code?: string; // optional: referral code used to join
    round_id?: string; // optional: associate with a specific round
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { crew_lead_id, crew_member_id } = body;
  if (!crew_lead_id) return corsResponse(req, { ok: false, error: "crew_lead_id is required" }, 400);
  if (!crew_member_id) return corsResponse(req, { ok: false, error: "crew_member_id is required" }, 400);
  if (crew_lead_id === crew_member_id) {
    return corsResponse(req, { ok: false, error: "Cannot form crew with yourself" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Idempotency: existing crew relationship
  const { data: existing } = await supabase
    .from("csia_referrals")
    .select("id, created_at")
    .eq("referrer_id", crew_lead_id)
    .eq("referred_id", crew_member_id)
    .maybeSingle();

  if (existing) {
    return corsResponse(req, { ok: true, relationship_id: existing.id, already_crew: true, formed_at: existing.created_at });
  }

  // Insert into csia_referrals
  const referralId = crypto.randomUUID();
  const formed_at = new Date().toISOString();

  const { data: referral, error: referralError } = await supabase
    .from("csia_referrals")
    .insert({
      id: referralId,
      referrer_id: crew_lead_id,
      referred_id: crew_member_id,
      referral_code: body.referral_code ?? null,
      round_id: body.round_id ?? null,
      relationship_type: "crew",
      created_at: formed_at,
    })
    .select("id, created_at")
    .single();

  if (referralError) {
    console.error("csia_referrals insert error:", referralError.message);
    return corsResponse(req, { ok: false, error: "Failed to record crew formation (referral): " + referralError.message }, 500);
  }

  // Insert into csia_member_relationships (for conflict gate future use)
  const relationshipId = crypto.randomUUID();
  const { error: relError } = await supabase
    .from("csia_member_relationships")
    .insert({
      id: relationshipId,
      member_a_id: crew_lead_id,
      member_b_id: crew_member_id,
      relationship_type: "crew",
      referral_id: referralId,
      established_at: formed_at,
    });

  let warning: string | undefined;
  if (relError) {
    // Non-fatal: referral recorded, relationship table may not exist yet
    if (relError.message.includes("does not exist") || relError.message.includes("relation")) {
      warning = "csia_member_relationships table missing — relationship recorded in csia_referrals only. Add table in M23 helper migration.";
    } else {
      warning = "csia_member_relationships insert failed: " + relError.message;
    }
    console.warn("csia_member_relationships warning:", warning);
  }

  const response: Record<string, unknown> = {
    ok: true,
    relationship_id: referral.id,
    crew_lead_id,
    crew_member_id,
    formed_at: referral.created_at,
    already_crew: false,
  };
  if (warning) response.warning = warning;

  return corsResponse(req, response);
});
