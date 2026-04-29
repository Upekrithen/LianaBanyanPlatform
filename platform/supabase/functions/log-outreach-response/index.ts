/**
 * LOG-OUTREACH-RESPONSE — Pre-dispatch and post-dispatch response handler
 * =========================================================================
 * K537 / B131 — Glass Door Open Outreach
 * Innovation #2262 The Glass Door + A&A #2327 candidate
 *
 * Logs a recipient response to an outreach letter, including pre-discovery
 * (recipient self-discovers + responds before formal dispatch).
 *
 * Per Decision 4: pre-response is logged independently; formal dispatch
 * fires on its own schedule (Option α — independent flows).
 *
 * If state == 'proposed' or 'scheduled' or 'locked', transitions to 'pre_responded'.
 * If state == 'dispatched', logs to outreach_letter_responses and sets state to
 * 'acknowledged' (standard flow, no state transition needed for pre-response).
 *
 * POST body: {
 *   letter_id: string,
 *   response_summary: string,
 *   response_classifier?: "positive" | "negative" | "neutral" | "pre_discovery" | "counter_proposal",
 *   source_channel?: string,  // e.g. "email", "phone", "in_person", "social"
 *   raw_response_text?: string
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRE_DISPATCH_STATES = ["draft", "locked", "proposed", "scheduled"];
const POST_DISPATCH_STATES = ["dispatched", "pre_responded"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth required (admin/founder logs the response)
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

    const serviceSupabase = createClient(supabaseUrl, serviceKey);

    const { letter_id, response_summary, response_classifier, source_channel, raw_response_text } = await req.json();

    if (!letter_id || !response_summary) {
      return new Response(
        JSON.stringify({ error: "letter_id and response_summary are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch letter
    const { data: letter, error: letterErr } = await serviceSupabase
      .from("outreach_letters")
      .select("letter_id, slug, state, recipient_name")
      .eq("letter_id", letter_id)
      .single();

    if (letterErr || !letter) {
      return new Response(
        JSON.stringify({ error: "Letter not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isPredispatch = PRE_DISPATCH_STATES.includes(letter.state);
    const isPostDispatch = POST_DISPATCH_STATES.includes(letter.state);

    if (!isPredispatch && !isPostDispatch) {
      return new Response(
        JSON.stringify({ error: `Cannot log response: letter state is '${letter.state}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert into outreach_letter_responses
    const { data: responseRow, error: respErr } = await serviceSupabase
      .from("outreach_letter_responses")
      .insert({
        letter_id,
        response_received_at: new Date().toISOString(),
        response_summary,
        response_classifier: response_classifier || (isPredispatch ? "pre_discovery" : "neutral"),
        metadata: {
          source_channel: source_channel || "unknown",
          logged_by: user.id,
          pre_dispatch: isPredispatch,
          raw_response_text: raw_response_text || null,
        },
      })
      .select("response_id")
      .single();

    if (respErr) {
      return new Response(
        JSON.stringify({ error: respErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If pre-dispatch: transition state to pre_responded
    let new_state = letter.state;
    if (isPredispatch) {
      await serviceSupabase
        .from("outreach_letters")
        .update({ state: "pre_responded", updated_at: new Date().toISOString() })
        .eq("letter_id", letter_id);
      new_state = "pre_responded";
      console.log(`[log-outreach-response] Pre-discovery response logged for ${letter.slug} — state → pre_responded`);
    } else {
      // Post-dispatch: transition to acknowledged
      await serviceSupabase
        .from("outreach_letters")
        .update({ state: "acknowledged", updated_at: new Date().toISOString() })
        .eq("letter_id", letter_id);
      new_state = "acknowledged";
      console.log(`[log-outreach-response] Response logged for ${letter.slug} — state → acknowledged`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        response_id: responseRow.response_id,
        letter_state: new_state,
        pre_dispatch: isPredispatch,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[log-outreach-response] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
