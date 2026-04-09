/**
 * process-escrow-auto-release — K357 Edge Function
 *
 * Wraps auto_release_escrow() SQL function.
 * Scheduled every 6 hours via pg_cron. Releases held escrow entries
 * older than 72 hours with no open disputes.
 *
 * POST { process_all: true } — batch all eligible
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReleaseResult {
  escrow_id: string;
  project_id: string;
  amount_cents: number;
  action: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const startedAt = new Date().toISOString();

    const { data: logRow } = await supabase
      .from("cron_job_log")
      .insert({
        job_name: "escrow-auto-release",
        started_at: startedAt,
      })
      .select("id")
      .single();

    const logId = logRow?.id;

    const { data, error } = await supabase.rpc("auto_release_escrow");
    if (error) throw error;

    const results = (data || []) as ReleaseResult[];

    const totalReleased = results.reduce((s, r) => s + r.amount_cents, 0);

    const summary = {
      escrows_released: results.length,
      total_amount_cents: totalReleased,
      total_amount_dollars: (totalReleased / 100).toFixed(2),
    };

    if (logId) {
      await supabase
        .from("cron_job_log")
        .update({
          finished_at: new Date().toISOString(),
          status: "completed",
          records_processed: results.length,
          details: summary,
        })
        .eq("id", logId);
    }

    return new Response(JSON.stringify({ processed: true, ...summary, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("process-escrow-auto-release error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
