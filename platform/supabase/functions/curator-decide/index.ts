// curator-decide — M23 · BP096
// Canon pearl: canon_csia_two_layer_governance (M22 foundation) + canon_jury_bandwidth
// Curator records BINDING decision on a submission.
// CONFLICT-OF-INTEREST CHECK FIRST: queries csia_curator_eligibility view.
// If eligible_to_curate=false → reject with conflict reason.
// Inserts into csia_votes (binding curator votes table from M22).
//
// Truth-Always:
//   - Depends on csia_curator_eligibility VIEW (M22-EXTENDED). If view missing, returns 500 with flag.
//   - Depends on csia_votes table (M22 binding votes table — NOT csia_member_votes).
//   - decision: 'approve' | 'reject' | 'revise_required'

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

const VALID_DECISIONS = ["approve", "reject", "revise_required"] as const;
type Decision = typeof VALID_DECISIONS[number];

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
    curator_member_id?: string;
    submission_id?: string;
    round_id?: string;
    decision?: Decision;
    rationale?: string;
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { curator_member_id, submission_id, round_id, decision, rationale } = body;
  if (!curator_member_id) return corsResponse(req, { ok: false, error: "curator_member_id is required" }, 400);
  if (!submission_id) return corsResponse(req, { ok: false, error: "submission_id is required" }, 400);
  if (!round_id) return corsResponse(req, { ok: false, error: "round_id is required" }, 400);
  if (!decision || !VALID_DECISIONS.includes(decision)) {
    return corsResponse(req, { ok: false, error: `decision must be one of: ${VALID_DECISIONS.join(", ")}` }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Conflict-of-interest check via eligibility view
  const { data: eligibility, error: eligError } = await supabase
    .from("csia_curator_eligibility")
    .select("eligible_to_curate, conflict_reason")
    .eq("curator_member_id", curator_member_id)
    .eq("submission_id", submission_id)
    .maybeSingle();

  if (eligError) {
    console.error("Eligibility view error:", eligError.message);
    // Truth-Always flag: view may not exist yet
    if (eligError.message.includes("does not exist") || eligError.message.includes("relation")) {
      return corsResponse(req, {
        ok: false,
        error: "csia_curator_eligibility view not found — M22-EXTENDED migration may be incomplete",
        truth_always_flag: "csia_curator_eligibility VIEW missing",
      }, 500);
    }
    return corsResponse(req, { ok: false, error: "Failed to check curator eligibility: " + eligError.message }, 500);
  }

  if (eligibility && eligibility.eligible_to_curate === false) {
    return corsResponse(req, {
      ok: false,
      error: "Curator has a conflict of interest and cannot decide on this submission",
      conflict_reason: eligibility.conflict_reason ?? "conflict detected",
    }, 403);
  }

  // Insert binding curator decision
  const decisionId = crypto.randomUUID();
  const { data, error } = await supabase
    .from("csia_votes")
    .insert({
      id: decisionId,
      curator_member_id,
      submission_id,
      round_id,
      decision,
      rationale: rationale ?? null,
      decided_at: new Date().toISOString(),
    })
    .select("id, decision, decided_at")
    .single();

  if (error) {
    console.error("curator-decide insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record decision: " + error.message }, 500);
  }

  // Update submission status based on decision
  const submissionStatus = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "revision_required";
  await supabase
    .from("csia_submissions")
    .update({ status: submissionStatus, curator_decided_at: data.decided_at })
    .eq("id", submission_id);

  return corsResponse(req, { ok: true, decision_id: data.id, decision: data.decision, decided_at: data.decided_at, submission_status: submissionStatus });
});
