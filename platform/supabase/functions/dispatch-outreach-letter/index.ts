/**
 * DISPATCH-OUTREACH-LETTER — Glass Door governance-gated letter dispatch
 * ========================================================================
 * K412 / B099 — The Glass Door Phase 2
 * Innovation #2262 The Glass Door
 *
 * Checks the letter_dispatch_authorized predicate (TouchStone) before
 * dispatching. In advisory mode, logs the verdict but proceeds. In
 * binding mode, the verdict gates dispatch.
 *
 * POST body: { letter_id: string }
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { letter_id } = await req.json();

    if (!letter_id) {
      return new Response(
        JSON.stringify({ error: "letter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the outreach letter
    const { data: letter, error: letterErr } = await supabase
      .from("outreach_letters")
      .select("*")
      .eq("letter_id", letter_id)
      .single();

    if (letterErr || !letter) {
      return new Response(
        JSON.stringify({ error: "letter not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!["scheduled", "pre_responded"].includes(letter.state)) {
      return new Response(
        JSON.stringify({ error: `letter state is '${letter.state}', must be 'scheduled' or 'pre_responded'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Compute governance verdict
    const { data: verdictRows } = await supabase.rpc("compute_outreach_letter_verdict", {
      p_letter_id: letter_id,
    });
    const verdict = verdictRows?.[0];

    // Binding mode: verdict gates dispatch
    if (letter.voting_mode === "binding" && verdict) {
      if (verdict.verdict === "vetoed") {
        return new Response(
          JSON.stringify({
            dispatched: false,
            reason: `Binding veto (${verdict.veto_pct?.toFixed(1)}% veto, threshold ${letter.vote_threshold_veto_pct}%)`,
            verdict,
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (verdict.verdict !== "approved" && verdict.verdict !== "no_votes") {
        return new Response(
          JSON.stringify({
            dispatched: false,
            reason: `Binding mode: insufficient approval (${verdict.approval_pct?.toFixed(1)}%, need ${letter.vote_threshold_approval_pct}%)`,
            verdict,
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Check if scheduled time has arrived
    if (letter.scheduled_dispatch && new Date(letter.scheduled_dispatch) > new Date()) {
      return new Response(
        JSON.stringify({
          dispatched: false,
          reason: `Scheduled dispatch time not yet reached: ${letter.scheduled_dispatch}`,
        }),
        { status: 425, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Find matching dispatch queue row to use existing dispatch-letter pipeline
    const { data: dispatchRow } = await supabase
      .from("letter_dispatch_queue")
      .select("id")
      .ilike("recipient_name", `%${letter.recipient_name}%`)
      .eq("status", "queued")
      .limit(1)
      .single();

    if (dispatchRow) {
      const dispatchRes = await fetch(
        `${supabaseUrl}/functions/v1/dispatch-letter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ letter_dispatch_id: dispatchRow.id }),
        },
      );

      const dispatch = await dispatchRes.json();

      if (!dispatchRes.ok) {
        return new Response(
          JSON.stringify({ dispatched: false, reason: "dispatch-letter failed", detail: dispatch }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Determine target state — pre_responded letters become formally_dispatched
    const targetState = letter.state === "pre_responded" ? "formally_dispatched" : "dispatched";

    // Update outreach_letters state
    await supabase
      .from("outreach_letters")
      .update({
        state: targetState,
        dispatched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          ...(letter.metadata || {}),
          dispatch_verdict: verdict,
        },
      })
      .eq("letter_id", letter_id);

    console.log(`[dispatch-outreach-letter] Dispatched ${letter.slug} to ${letter.recipient_name} (verdict: ${verdict?.verdict}, state: ${targetState})`);

    // C.3: Fan-out Six-Degrees email to flagged members (fire-and-forget)
    fetch(`${supabaseUrl}/functions/v1/fan-out-six-degrees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ letter_id }),
    }).catch((e) => console.error("[dispatch-outreach-letter] fan-out-six-degrees error:", e));

    return new Response(
      JSON.stringify({ dispatched: true, verdict, state: targetState }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[dispatch-outreach-letter] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
