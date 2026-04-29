/**
 * LOCK-OUTREACH-LETTER — Founder transitions letter state
 * =========================================================
 * K537 / B131 — Glass Door Open Outreach
 * Innovation #2262 The Glass Door + A&A #2327 candidate
 *
 * Founder-only action. Transitions a letter through its state machine:
 *   draft → locked  (prose-passed; letter becomes visible on Glass Door)
 *   locked → proposed  (open for member voting)
 *   proposed → scheduled  (voting complete; Founder schedules dispatch)
 *   dispatched → pre_responded  (recipient found + responded before formal dispatch)
 *   pre_responded → formally_dispatched  (formal dispatch fires after pre-response)
 *
 * POST body: { letter_id: string, target_state: string }
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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify Founder auth (must be authenticated)
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

    // Check admin role
    const serviceSupabase = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await serviceSupabase
      .from("member_roles")
      .select("role")
      .eq("member_id", user.id)
      .in("role", ["admin", "founder"])
      .limit(1)
      .single();

    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Forbidden — admin/founder role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { letter_id, target_state } = await req.json();

    if (!letter_id || !target_state) {
      return new Response(
        JSON.stringify({ error: "letter_id and target_state are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const VALID_TARGET_STATES = [
      "locked", "proposed", "scheduled",
      "pre_responded", "formally_dispatched",
    ];

    if (!VALID_TARGET_STATES.includes(target_state)) {
      return new Response(
        JSON.stringify({ error: `Invalid target_state: ${target_state}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call the DB helper which enforces allowed transitions
    const { data, error } = await serviceSupabase.rpc("lock_outreach_letter", {
      p_letter_id: letter_id,
      p_target_state: target_state,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[lock-outreach-letter] ${user.email} transitioned ${letter_id} → ${target_state}`);

    return new Response(
      JSON.stringify({ ok: true, letter: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[lock-outreach-letter] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
