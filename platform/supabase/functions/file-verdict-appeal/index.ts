/**
 * file-verdict-appeal — Bushel 19 / BP021
 * =========================================
 * Member-filed Mordecai-Esther decree-composition (appeal).
 *
 * Stamps appeal to the Year of Jubilee verdict_appeals ledger.
 * Routes to Judge for reconsideration (logs to judge_reconsideration queue).
 *
 * Per Pedestal Forum canon:
 *   - Appeal carries co-equal authority alongside original verdict
 *   - Both original + appeal are permanently visible
 *   - Year of Jubilee: append-only, no deletes
 *
 * POST body: {
 *   case_id: string,
 *   contradictory_response: string,
 *   authority_basis?: string
 * }
 *
 * KN095 / BP011 / Bushel 19 / BP021
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate with user JWT
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userSupabase.auth.getUser();

    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { case_id, contradictory_response, authority_basis } = body;

    if (!case_id) {
      return new Response(
        JSON.stringify({ error: "case_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!contradictory_response?.trim()) {
      return new Response(
        JSON.stringify({ error: "contradictory_response is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceSupabase = createClient(supabaseUrl, serviceKey);

    // Check if appeal already exists for this case + member (prevent duplicates)
    const { data: existing } = await serviceSupabase
      .from("verdict_appeals")
      .select("appeal_id, status")
      .eq("case_id", case_id)
      .eq("member_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          error: "Appeal already filed",
          appeal_id: existing.appeal_id,
          status: existing.status,
          message: "Year of Jubilee ledger: one decree-composition per case per member. Your existing appeal is active.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Stamp to Year of Jubilee ledger
    const { data: appeal, error: insertErr } = await serviceSupabase
      .from("verdict_appeals")
      .insert({
        case_id,
        member_id: user.id,
        contradictory_response: contradictory_response.trim(),
        authority_basis: authority_basis?.trim() || null,
        status: "pending",
      })
      .select("appeal_id, submitted_at, status")
      .single();

    if (insertErr) {
      console.error("[file-verdict-appeal] Insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log Judge reconsideration request
    console.log(
      `[file-verdict-appeal] Decree-composition filed. ` +
      `member=${user.email} case=${case_id} appeal=${appeal.appeal_id}. ` +
      `Routed to Judge for reconsideration (Pedestal Forum — Mordecai-Esther).`
    );

    return new Response(
      JSON.stringify({
        ok: true,
        appeal_id: appeal.appeal_id,
        submitted_at: appeal.submitted_at,
        status: appeal.status,
        message: "Decree-composition stamped to Year of Jubilee ledger. " +
          "Judge will reconsider. Your argument carries co-equal authority " +
          "alongside the original verdict.",
        pedestal_forum: true,
        mordecai_esther: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[file-verdict-appeal] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
