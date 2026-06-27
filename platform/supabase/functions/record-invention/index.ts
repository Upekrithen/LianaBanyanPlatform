// record-invention — M23 · BP096
// Canon pearl: canon_code_contribution_pipeline_fork_submit_validate_accept_ip_ledger_attribute_bp092
//              canon_patent_floater_300_pool_revised_math_165_country_60_empress_75_puzzle_bp092
// When contributor identifies a novel method during build, records it in ip_ledger_entries.
// Sets inventor_name, royalty_share_pct=20, cooperative_share_pct=80, filing_status='draft'.
// Links to member's CLA (must be signed). Returns ip_ledger entry_id.
//
// Truth-Always:
//   - Depends on ip_ledger_entries table (M22 foundation).
//   - ip_ledger_entries must have: member_id, inventor_name, description, royalty_share_pct,
//     cooperative_share_pct, filing_status, cla_agreement_id, recorded_at columns.
//   - CLA must exist for member before recording invention (enforced here).
//   - 20/80 royalty split is CANON (canon_code_contribution_pipeline). Do not alter.

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
    inventor_name?: string; // full legal name for patent record
    title?: string;
    description?: string; // method description, novel claim summary
    prior_art_notes?: string;
    submission_id?: string; // optional link to CSIA submission
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, inventor_name, title, description } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!inventor_name) return corsResponse(req, { ok: false, error: "inventor_name (full legal name) is required" }, 400);
  if (!title) return corsResponse(req, { ok: false, error: "title is required" }, 400);
  if (!description) return corsResponse(req, { ok: false, error: "description is required" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Require CLA before recording invention
  const { data: cla, error: claError } = await supabase
    .from("contributor_agreements")
    .select("id")
    .eq("member_id", member_id)
    .eq("agreement_type", "cla")
    .maybeSingle();

  if (claError) {
    return corsResponse(req, { ok: false, error: "Failed to verify CLA: " + claError.message }, 500);
  }
  if (!cla) {
    return corsResponse(req, { ok: false, error: "CLA must be signed before recording an invention. Use /sign-cla first." }, 422);
  }

  const entryId = crypto.randomUUID();
  const recorded_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("ip_ledger_entries")
    .insert({
      id: entryId,
      member_id,
      inventor_name,
      title,
      description,
      prior_art_notes: body.prior_art_notes ?? null,
      submission_id: body.submission_id ?? null,
      cla_agreement_id: cla.id,
      royalty_share_pct: 20,        // CANON: 20% inventor
      cooperative_share_pct: 80,    // CANON: 80% cooperative
      filing_status: "draft",
      recorded_at,
    })
    .select("id, filing_status, recorded_at")
    .single();

  if (error) {
    console.error("record-invention insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record invention: " + error.message }, 500);
  }

  return corsResponse(req, {
    ok: true,
    ip_ledger_entry_id: data.id,
    filing_status: data.filing_status,
    recorded_at: data.recorded_at,
    royalty_share_pct: 20,
    cooperative_share_pct: 80,
    next_step: "Sign IP Assignment via /sign-assignment with this ip_ledger_entry_id",
  });
});
