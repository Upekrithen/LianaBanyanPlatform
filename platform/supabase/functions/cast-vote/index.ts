// cast-vote — M23 · BP096
// Canon pearl: canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092
// Member votes on a CSIA submission. Open to all authenticated members.
// Idempotent: UNIQUE constraint on (member_id, submission_id) enforced at DB level.
// No conflict-of-interest gates at this layer (member votes are open advisory).
//
// Truth-Always:
//   - Depends on csia_member_votes table (M22-EXTENDED). Must have UNIQUE(member_id, submission_id).
//   - vote_value: numeric score (e.g., 1-5) OR boolean approve/reject string — schema determines.
//     This function accepts vote_value as integer 1-5.

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
    submission_id?: string;
    vote_value?: number; // 1-5
    comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return corsResponse(req, { ok: false, error: "Invalid JSON body" }, 400);
  }

  const { member_id, submission_id, vote_value } = body;
  if (!member_id) return corsResponse(req, { ok: false, error: "member_id is required" }, 400);
  if (!submission_id) return corsResponse(req, { ok: false, error: "submission_id is required" }, 400);
  if (vote_value === undefined || vote_value === null) {
    return corsResponse(req, { ok: false, error: "vote_value is required (integer 1-5)" }, 400);
  }
  if (!Number.isInteger(vote_value) || vote_value < 1 || vote_value > 5) {
    return corsResponse(req, { ok: false, error: "vote_value must be an integer between 1 and 5" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify member exists
  const { data: member } = await supabase
    .from("entity_memberships")
    .select("id")
    .eq("member_id", member_id)
    .maybeSingle();

  if (!member) {
    return corsResponse(req, { ok: false, error: "Member not found or not active" }, 403);
  }

  // Verify submission exists and is in voteable state
  const { data: submission } = await supabase
    .from("csia_submissions")
    .select("id, status")
    .eq("id", submission_id)
    .maybeSingle();

  if (!submission) {
    return corsResponse(req, { ok: false, error: "Submission not found" }, 404);
  }
  if (!["submitted", "under_review"].includes(submission.status)) {
    return corsResponse(req, { ok: false, error: `Submission not open for voting (status: ${submission.status})` }, 422);
  }

  // Upsert vote (idempotent on member_id + submission_id)
  const { data, error } = await supabase
    .from("csia_member_votes")
    .upsert(
      {
        member_id,
        submission_id,
        vote_value,
        comment: body.comment ?? null,
        voted_at: new Date().toISOString(),
      },
      { onConflict: "member_id,submission_id" }
    )
    .select("id, vote_value, voted_at")
    .single();

  if (error) {
    console.error("cast-vote upsert error:", error.message);
    return corsResponse(req, { ok: false, error: "Failed to record vote: " + error.message }, 500);
  }

  return corsResponse(req, { ok: true, vote_id: data.id, vote_value: data.vote_value, voted_at: data.voted_at });
});
