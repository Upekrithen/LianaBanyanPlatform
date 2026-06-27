// sign-assignment — M23 · BP096
// Canon pearl: canon_code_contribution_pipeline_fork_submit_validate_accept_ip_ledger_attribute_bp092
// Records IP Assignment signature for a specific submission / ip_ledger_entry.
// Inserts into contributor_agreements with agreement_type='ip_assignment'.
// Links to ip_ledger_entries(entry_id) for chain-of-custody.
//
// Truth-Always:
//   - Depends on contributor_agreements table (M22 foundation).
//   - ip_ledger_entry_id is REQUIRED for ip_assignment (links invention to assignment chain).
//   - contributor_agreements must have ip_ledger_entry_id FK column.
//   - If ip_ledger_entry_id FK not present, insert will fail — surface warning.

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

const VALID_SIG_METHODS = ["checkbox", "typed_name", "e_signature_hash"] as const;
type SigMethod = typeof VALID_SIG_METHODS[number];

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
    ip_ledger_entry_id?: string;
    cla_text_version?: string; // version of assignment agreement text
    sig_method?: SigMethod;
    sig_hash?: string;
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, ip_ledger_entry_id, cla_text_version, sig_method } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!ip_ledger_entry_id) return corsResponse(req, { ok: false, error: "ip_ledger_entry_id is required for IP assignment" }, 400);
  if (!cla_text_version) return corsResponse(req, { ok: false, error: "cla_text_version is required (assignment agreement version)" }, 400);
  if (!sig_method || !VALID_SIG_METHODS.includes(sig_method)) {
    return corsResponse(req, { ok: false, error: `sig_method must be one of: ${VALID_SIG_METHODS.join(", ")}` }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify ip_ledger_entry belongs to this member
  const { data: ledgerEntry, error: ledgerError } = await supabase
    .from("ip_ledger_entries")
    .select("id, inventor_name")
    .eq("id", ip_ledger_entry_id)
    .eq("member_id", member_id)
    .maybeSingle();

  if (ledgerError || !ledgerEntry) {
    return corsResponse(req, { ok: false, error: "IP ledger entry not found or does not belong to this member" }, 404);
  }

  // Idempotency: existing assignment for same entry
  const { data: existing } = await supabase
    .from("contributor_agreements")
    .select("id, signed_at")
    .eq("member_id", member_id)
    .eq("agreement_type", "ip_assignment")
    .eq("ip_ledger_entry_id", ip_ledger_entry_id)
    .maybeSingle();

  if (existing) {
    return corsResponse(req, { ok: true, assignment_id: existing.id, signed_at: existing.signed_at, already_signed: true });
  }

  const assignmentId = crypto.randomUUID();
  const signed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("contributor_agreements")
    .insert({
      id: assignmentId,
      member_id,
      agreement_type: "ip_assignment",
      ip_ledger_entry_id,
      cla_text_version,
      sig_method,
      sig_hash: body.sig_hash ?? null,
      signed_at,
    })
    .select("id, signed_at")
    .single();

  if (error) {
    console.error("sign-assignment insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record assignment signature: " + error.message }, 500);
  }

  // Update ip_ledger_entry filing_status if still 'draft'
  await supabase
    .from("ip_ledger_entries")
    .update({ filing_status: "assigned", assignment_signed_at: signed_at })
    .eq("id", ip_ledger_entry_id)
    .eq("filing_status", "draft");

  return corsResponse(req, { ok: true, assignment_id: data.id, signed_at: data.signed_at, ip_ledger_entry_id, already_signed: false });
});
