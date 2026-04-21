/**
 * HELM-TASK-DISPATCHER — Cron-callable batch dispatcher
 * =======================================================
 * K411 / B099 — Helm Schedule + MoneyPenny Reminders (Phase 1)
 *
 * Called by pg_cron every minute. Picks up pending tasks whose
 * fire_at has passed, dispatches each via dispatch-helm-task.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: pending } = await supabase
      .from("helm_tasks")
      .select("task_id")
      .eq("state", "pending")
      .lte("fire_at", new Date().toISOString())
      .limit(100);

    if (!pending || pending.length === 0) {
      return new Response(
        JSON.stringify({ count: 0, message: "No pending tasks" }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const results: { task_id: string; ok: boolean }[] = [];

    for (const t of pending) {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/dispatch-helm-task`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ task_id: t.task_id }),
          },
        );
        results.push({ task_id: t.task_id, ok: res.ok });
      } catch {
        results.push({ task_id: t.task_id, ok: false });
      }
    }

    console.log(`[helm-task-dispatcher] Processed ${results.length} tasks`);

    return new Response(
      JSON.stringify({ count: results.length, results }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[helm-task-dispatcher] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
