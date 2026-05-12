// BP039: Council Tally Cycle Edge Function
// Tallies votes for a council voting cycle and selects top 16 candidates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TallyRequest {
  cycle_id: string;
}

interface VoteTally {
  candidate_crown_id: string;
  support_count: number;
  abstain_count: number;
  reject_count: number;
  net_support_score: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse request body
    const { cycle_id }: TallyRequest = await req.json();

    if (!cycle_id) {
      return new Response(
        JSON.stringify({ error: "cycle_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Lock the cycle by setting status to 'closed'
    const { data: cycle, error: cycleError } = await supabaseClient
      .from("council_voting_cycles")
      .update({ status: "closed" })
      .eq("id", cycle_id)
      .eq("status", "open")
      .select()
      .single();

    if (cycleError || !cycle) {
      return new Response(
        JSON.stringify({
          error: "Cycle not found or already closed",
          details: cycleError
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Count votes per candidate using the view
    const { data: tallies, error: talliesError } = await supabaseClient
      .from("council_vote_tallies")
      .select("*")
      .eq("cycle_id", cycle_id)
      .order("net_support_score", { ascending: false });

    if (talliesError) {
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve vote tallies",
          details: talliesError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voteTallies = tallies as VoteTally[];

    // 3. Select top 16 candidates by net_support_score
    const top16 = voteTallies.slice(0, 16);
    const acceptedCrownIds = top16.map((t) => t.candidate_crown_id);

    // 4. Update crown statuses: top 16 get 'accepted', rest get 'rejected'
    if (acceptedCrownIds.length > 0) {
      const { error: acceptError } = await supabaseClient
        .from("initiative_crowns")
        .update({ crown_status: "accepted" })
        .in("id", acceptedCrownIds);

      if (acceptError) {
        console.error("Error accepting crowns:", acceptError);
        // Continue with tally even if status update fails
      }
    }

    // Update rejected crowns (all candidates not in top 16)
    const allCandidateIds = voteTallies.map((t) => t.candidate_crown_id);
    const rejectedIds = allCandidateIds.filter((id) => !acceptedCrownIds.includes(id));

    if (rejectedIds.length > 0) {
      const { error: rejectError } = await supabaseClient
        .from("initiative_crowns")
        .update({ crown_status: "rejected" })
        .in("id", rejectedIds);

      if (rejectError) {
        console.error("Error rejecting crowns:", rejectError);
      }
    }

    // 5. Mark cycle as 'tallied'
    const { error: tallyError } = await supabaseClient
      .from("council_voting_cycles")
      .update({ status: "tallied" })
      .eq("id", cycle_id);

    if (tallyError) {
      return new Response(
        JSON.stringify({
          error: "Failed to mark cycle as tallied",
          details: tallyError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        cycle_id,
        total_candidates: voteTallies.length,
        accepted_count: acceptedCrownIds.length,
        rejected_count: rejectedIds.length,
        top_16: top16.map((t) => ({
          candidate_crown_id: t.candidate_crown_id,
          net_support_score: t.net_support_score,
          support: t.support_count,
          abstain: t.abstain_count,
          reject: t.reject_count,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in council-tally-cycle:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
