/**
 * CAST-OUTREACH-LETTER-VOTE — Member voting on Glass Door outreach letters
 * =========================================================================
 * K412 / B099 — The Glass Door Phase 2
 * Innovation #2262 The Glass Door
 *
 * Authenticated members cast votes (one per member per letter; upsert).
 * Returns the updated governance verdict after each vote.
 *
 * POST body: {
 *   letter_id: string,
 *   vote_type: "approve" | "request_edit" | "delay" | "redirect" | "veto" | "abstain",
 *   comment?: string,
 *   proposed_edit?: string,
 *   proposed_delay_days?: number,
 *   proposed_redirect_recipient?: string
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_VOTE_TYPES = [
  "approve", "request_edit", "delay", "redirect", "veto", "abstain",
] as const;

// States where governance voting is open
const GOVERNANCE_VOTE_STATES = ["proposed", "scheduled"] as const;
// States where amplify + six_degrees_flag are open (broader — includes locked)
const AMPLIFY_STATES = ["locked", "proposed", "scheduled"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth with user's JWT
    const userSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
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
    const {
      letter_id,
      vote_type,
      six_degrees_flag,
      comment,
      proposed_edit,
      proposed_delay_days,
      proposed_redirect_recipient,
    } = body;

    if (!letter_id) {
      return new Response(
        JSON.stringify({ error: "letter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Must have either vote_type or six_degrees_flag (or both)
    if (!vote_type && six_degrees_flag === undefined) {
      return new Response(
        JSON.stringify({ error: "vote_type or six_degrees_flag is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (vote_type && !VALID_VOTE_TYPES.includes(vote_type)) {
      return new Response(
        JSON.stringify({ error: `Invalid vote_type: ${vote_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use service role for upsert (RLS allows member_id = auth.uid())
    const serviceSupabase = createClient(supabaseUrl, serviceKey);

    // Verify letter exists and is in a voteable state
    const { data: letter } = await serviceSupabase
      .from("outreach_letters")
      .select("state, voting_window_start, voting_window_end")
      .eq("letter_id", letter_id)
      .single();

    if (!letter) {
      return new Response(
        JSON.stringify({ error: "Letter not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Amplify + six_degrees_flag open for locked/proposed/scheduled
    // Governance votes (non-approve) only open for proposed/scheduled
    const isAmplifyState = AMPLIFY_STATES.includes(letter.state as typeof AMPLIFY_STATES[number]);
    const isGovernanceState = GOVERNANCE_VOTE_STATES.includes(letter.state as typeof GOVERNANCE_VOTE_STATES[number]);

    if (!isAmplifyState) {
      return new Response(
        JSON.stringify({ error: `Voting closed — letter state is '${letter.state}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isGovernanceVote = vote_type && vote_type !== "approve";
    if (isGovernanceVote && !isGovernanceState) {
      return new Response(
        JSON.stringify({ error: `Governance voting only available in proposed/scheduled state (currently '${letter.state}')` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check voting window
    const now = new Date();
    if (letter.voting_window_end && new Date(letter.voting_window_end) < now) {
      return new Response(
        JSON.stringify({ error: "Voting window has closed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Upsert vote (merge six_degrees_flag with vote_type independently)
    const upsertData: Record<string, unknown> = {
      letter_id,
      member_id: user.id,
      voted_at: new Date().toISOString(),
    };
    if (vote_type !== undefined) {
      upsertData.vote_type = vote_type;
      upsertData.comment = comment || null;
      upsertData.proposed_edit = proposed_edit || null;
      upsertData.proposed_delay_days = proposed_delay_days || null;
      upsertData.proposed_redirect_recipient = proposed_redirect_recipient || null;
    }
    if (six_degrees_flag !== undefined) {
      upsertData.six_degrees_flag = Boolean(six_degrees_flag);
    }

    const { error: voteErr } = await serviceSupabase
      .from("outreach_letter_votes")
      .upsert(upsertData, { onConflict: "letter_id,member_id" });

    if (voteErr) {
      return new Response(
        JSON.stringify({ error: voteErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Recompute verdict
    const { data: verdictRows } = await serviceSupabase.rpc(
      "compute_outreach_letter_verdict",
      { p_letter_id: letter_id },
    );

    console.log(`[cast-outreach-letter-vote] ${user.email} voted '${vote_type}' on ${letter_id}`);

    return new Response(
      JSON.stringify({ ok: true, verdict: verdictRows?.[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[cast-outreach-letter-vote] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
