/**
 * process-roommate-escrow — K158 Edge Function
 *
 * Wraps the existing process_roommate_escrow() SQL function (K153 migration 000013).
 * Called weekly by pg_cron. Processes all active/probation roommate agreements:
 * checks upheld stamps, processes forfeits (respecting monthly cap), refills escrow,
 * updates clean/total weeks, triggers probation at cap.
 *
 * POST { process_all: true } — batch all active agreements
 * POST { agreement_id: uuid } — process a single agreement
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EscrowResult {
  agreement_id: string;
  action: string;
  marks_amount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const startedAt = new Date().toISOString();

    // Log start
    const { data: logRow } = await supabase
      .from("cron_job_log")
      .insert({ job_name: "process-roommate-escrow", started_at: startedAt })
      .select("id")
      .single();

    const logId = logRow?.id;

    let results: EscrowResult[] = [];

    if (body.agreement_id) {
      // Process single agreement via direct SQL call
      const { data, error } = await supabase.rpc("process_roommate_escrow");
      if (error) throw error;
      results = (data || []).filter(
        (r: EscrowResult) => r.agreement_id === body.agreement_id
      );
    } else if (body.process_all) {
      const { data, error } = await supabase.rpc("process_roommate_escrow");
      if (error) throw error;
      results = data || [];
    }

    // Summarize
    const forfeits = results.filter((r) => r.action === "forfeit");
    const refills = results.filter((r) => r.action === "escrow_refill");
    const probations = results.filter((r) => r.action === "probation_triggered");
    const totalForfeited = forfeits.reduce((s, r) => s + r.marks_amount, 0);

    const summary = {
      agreements_processed: refills.length,
      forfeits: forfeits.length,
      total_marks_forfeited: totalForfeited,
      escrow_refills: refills.length,
      probations_triggered: probations.length,
    };

    // Log completion
    if (logId) {
      await supabase
        .from("cron_job_log")
        .update({
          finished_at: new Date().toISOString(),
          status: "completed",
          records_processed: refills.length,
          details: summary,
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({ processed: true, ...summary, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("process-roommate-escrow error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
