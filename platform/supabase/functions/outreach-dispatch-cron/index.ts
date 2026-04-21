/**
 * OUTREACH-DISPATCH-CRON — Scheduled gate evaluator for Glass Door
 * ==================================================================
 * K412 / B099 — The Glass Door Phase 2
 * Innovation #2262 The Glass Door
 *
 * Called by pg_cron every 5 minutes. Finds scheduled letters whose
 * dispatch time has arrived and attempts governance-gated dispatch.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: ready } = await supabase
      .from("outreach_letters")
      .select("letter_id")
      .eq("state", "scheduled")
      .lte("scheduled_dispatch", new Date().toISOString());

    if (!ready || ready.length === 0) {
      return new Response(
        JSON.stringify({ count: 0, message: "No letters ready for dispatch" }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const results: { letter_id: string; ok: boolean; detail?: string }[] = [];

    for (const l of ready) {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/dispatch-outreach-letter`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ letter_id: l.letter_id }),
          },
        );
        const data = await res.json();
        results.push({
          letter_id: l.letter_id,
          ok: res.ok,
          detail: res.ok ? undefined : data?.reason,
        });
      } catch {
        results.push({ letter_id: l.letter_id, ok: false, detail: "fetch failed" });
      }
    }

    console.log(`[outreach-dispatch-cron] Evaluated ${results.length} letters`);

    return new Response(
      JSON.stringify({ count: results.length, results }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[outreach-dispatch-cron] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
