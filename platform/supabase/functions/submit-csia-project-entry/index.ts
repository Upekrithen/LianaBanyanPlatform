// submit-csia-project-entry — M23 · BP096
// Canon pearl: canon_code_contribution_pipeline_fork_submit_validate_accept_ip_ledger_attribute_bp092
// Contestant submits actual project entry after reservation accepted.
// Validates: CLA signed, Assignment signed, reservation paid, round open.
// Inserts into csia_submissions linked to csia_rounds.
//
// Truth-Always:
//   - Depends on csia_submissions table (M22 foundation). Confirm column set before deploy.
//   - Depends on contributor_agreements table for CLA/Assignment check.
//   - Depends on csia_reservations.status = 'paid' gate.
//   - csia_rounds.status must be 'open' for submission to proceed.

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
    title?: string;
    abstract?: string;
    submission_url?: string;
    ip_ledger_entry_id?: string; // optional link to recorded invention
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, round_id, title, abstract, submission_url } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!round_id) return corsResponse(req, { ok: false, error: "round_id is required" }, 400);
  if (!title) return corsResponse(req, { ok: false, error: "title is required" }, 400);
  if (!abstract) return corsResponse(req, { ok: false, error: "abstract is required" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Gate 1: Round must be open
  const { data: round, error: roundError } = await supabase
    .from("csia_rounds")
    .select("id, status, submission_deadline")
    .eq("id", round_id)
    .single();

  if (roundError || !round) {
    return corsResponse(req, { ok: false, error: "Round not found" }, 404);
  }
  if (round.status !== "open") {
    return corsResponse(req, { ok: false, error: `Round is not open for submissions (status: ${round.status})` }, 422);
  }
  if (round.submission_deadline && new Date(round.submission_deadline) < new Date()) {
    return corsResponse(req, { ok: false, error: "Submission deadline has passed" }, 422);
  }

  // Gate 2: Reservation must be paid
  const { data: reservation, error: resError } = await supabase
    .from("csia_reservations")
    .select("id, status")
    .eq("member_id", member_id)
    .eq("round_id", round_id)
    .single();

  if (resError || !reservation) {
    return corsResponse(req, { ok: false, error: "No reservation found for this member + round" }, 422);
  }
  if (reservation.status !== "paid") {
    return corsResponse(req, { ok: false, error: `Reservation not yet paid (status: ${reservation.status})` }, 422);
  }

  // Gate 3: CLA must be signed
  const { data: cla } = await supabase
    .from("contributor_agreements")
    .select("id")
    .eq("member_id", member_id)
    .eq("agreement_type", "cla")
    .maybeSingle();

  if (!cla) {
    return corsResponse(req, { ok: false, error: "CLA not signed. Sign CLA via /sign-cla before submitting." }, 422);
  }

  // Gate 4: IP Assignment must be signed (linked to ip_ledger_entry_id if provided)
  const assignmentQuery = supabase
    .from("contributor_agreements")
    .select("id")
    .eq("member_id", member_id)
    .eq("agreement_type", "ip_assignment");

  if (body.ip_ledger_entry_id) {
    assignmentQuery.eq("ip_ledger_entry_id", body.ip_ledger_entry_id);
  }

  const { data: assignment } = await assignmentQuery.maybeSingle();
  if (!assignment) {
    return corsResponse(req, { ok: false, error: "IP Assignment not signed. Sign assignment via /sign-assignment before submitting." }, 422);
  }

  // Insert submission
  const submissionId = crypto.randomUUID();
  const { data, error } = await supabase
    .from("csia_submissions")
    .insert({
      id: submissionId,
      member_id,
      round_id,
      reservation_id: reservation.id,
      title,
      abstract,
      submission_url: submission_url ?? null,
      ip_ledger_entry_id: body.ip_ledger_entry_id ?? null,
      cla_agreement_id: cla.id,
      assignment_agreement_id: assignment.id,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("id, status, submitted_at")
    .single();

  if (error) {
    console.error("csia_submissions insert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record submission: " + error.message }, 500);
  }

  return corsResponse(req, { ok: true, submission_id: data.id, status: data.status, submitted_at: data.submitted_at });
});
