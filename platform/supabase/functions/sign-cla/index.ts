// sign-cla — M23 · BP096
// Canon pearl: canon_code_contribution_pipeline_fork_submit_validate_accept_ip_ledger_attribute_bp092
// Records CLA (Contributor License Agreement) signature for a member.
// Inserts into contributor_agreements with agreement_type='cla'.
// Idempotent per member + cla_text_version (duplicate returns existing signature_id).
//
// Truth-Always:
//   - Depends on contributor_agreements table (M22 foundation).
//   - contributor_agreements must have: member_id, agreement_type, cla_text_version, signed_at, sig_method, sig_hash columns.
//   - sig_method: 'checkbox' | 'typed_name' | 'e_signature_hash'
//   - cla_text_version: semver string matching current published CLA (e.g., "1.0.0")

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
    cla_text_version?: string;
    sig_method?: SigMethod;
    sig_hash?: string; // SHA256 of agreement text + member_id + timestamp for audit trail
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, cla_text_version, sig_method } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!cla_text_version) return corsResponse(req, { ok: false, error: "cla_text_version is required (e.g. '1.0.0')" }, 400);
  if (!sig_method || !VALID_SIG_METHODS.includes(sig_method)) {
    return corsResponse(req, { ok: false, error: `sig_method must be one of: ${VALID_SIG_METHODS.join(", ")}` }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Idempotency: check for existing CLA signature at same version
  const { data: existing } = await supabase
    .from("contributor_agreements")
    .select("id, signed_at")
    .eq("member_id", member_id)
    .eq("agreement_type", "cla")
    .eq("cla_text_version", cla_text_version)
    .maybeSingle();

  if (existing) {
    return corsResponse(req, { ok: true, signature_id: existing.id, signed_at: existing.signed_at, already_signed: true });
  }

  const signatureId = crypto.randomUUID();
  const signed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("contributor_agreements")
    .insert({
      id: signatureId,
      member_id,
      agreement_type: "cla",
      cla_text_version,
      sig_method,
      sig_hash: body.sig_hash ?? null,
      signed_at,
    })
    .select("id, signed_at")
    .single();

  if (error) {
    console.error("sign-cla insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record CLA signature: " + error.message }, 500);
  }

  return corsResponse(req, { ok: true, signature_id: data.id, signed_at: data.signed_at, already_signed: false });
});
