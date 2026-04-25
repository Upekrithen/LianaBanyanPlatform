/**
 * Edge Function: test-frame-results
 *
 * POST /test_frame_results — receive a member's verification run result
 * GET  /test_frame_results/aggregate — return aggregate stats for public dashboard
 * DELETE /test_frame_results/delete?member_id=X — right-to-deletion
 *
 * Privacy contract:
 *   - share_preference = 'private': stored locally only (this endpoint is NOT called)
 *   - share_preference = 'anonymous': stored without member_id
 *   - share_preference = 'public': stored with member_id
 *
 * K502 / B124
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── POST /test_frame_results ─────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname.endsWith("/test_frame_results")) {
    let body: {
      ai_vendor: string;
      cold_hot_pct: number;
      cathedral_hot_pct: number;
      lift_pp: number;
      questions_completed: number;
      share_preference: "anonymous" | "public";
      member_id?: string | null;
      client_timestamp: string;
    };

    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (
      !body.ai_vendor ||
      typeof body.cold_hot_pct !== "number" ||
      typeof body.cathedral_hot_pct !== "number" ||
      typeof body.lift_pp !== "number"
    ) {
      return new Response(JSON.stringify({ error: "missing_required_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Privacy enforcement: if anonymous, strip member_id even if provided
    const memberId = body.share_preference === "public" ? (body.member_id ?? null) : null;

    const { error } = await supabase.from("test_frame_results").insert({
      ai_vendor: body.ai_vendor,
      cold_hot_pct: Math.max(0, Math.min(100, body.cold_hot_pct)),
      cathedral_hot_pct: Math.max(0, Math.min(100, body.cathedral_hot_pct)),
      lift_pp: body.lift_pp,
      questions_completed: Math.max(0, Math.min(25, body.questions_completed || 0)),
      share_preference: body.share_preference,
      member_id: memberId,
      client_timestamp: body.client_timestamp,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── GET /test_frame_results/aggregate ────────────────────────────────────────
  if (req.method === "GET" && url.pathname.includes("aggregate")) {
    const { data, error } = await supabase
      .from("test_frame_results_aggregate")   // view defined in migration
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── DELETE /test_frame_results/delete?member_id=X ────────────────────────────
  if (req.method === "DELETE" && url.pathname.includes("delete")) {
    const memberId = url.searchParams.get("member_id");
    if (!memberId) {
      return new Response(JSON.stringify({ error: "member_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from("test_frame_results")
      .delete()
      .eq("member_id", memberId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, deleted: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
