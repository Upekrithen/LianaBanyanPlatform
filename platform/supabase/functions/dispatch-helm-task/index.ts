/**
 * DISPATCH-HELM-TASK — Dispatches a single Helm Schedule task
 * =============================================================
 * K411 / B099 — Helm Schedule + MoneyPenny Reminders (Phase 1)
 * Innovation #2248 (Hemispheric Protocol) + #2257 (Glove email channel)
 *
 * POST body: { task_id: string }
 * Called by: helm-task-dispatcher (cron) or direct invocation
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
    const { task_id } = await req.json();

    if (!task_id) {
      return new Response(JSON.stringify({ error: "task_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch task + member email via a join
    const { data: task, error: taskErr } = await supabase
      .from("helm_tasks")
      .select("*")
      .eq("task_id", task_id)
      .single();

    if (taskErr || !task) {
      return new Response(JSON.stringify({ error: "task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up member email
    const { data: userData } = await supabase.auth.admin.getUserById(task.member_id);
    const recipientEmail = userData?.user?.email;

    // Hemispheric check — reschedule if needed
    if (task.hemispheric_aware) {
      const { data: slot } = await supabase.rpc("is_valid_hemispheric_slot", {
        p_member_id: task.member_id,
        p_fire_at: task.fire_at,
      });
      if (slot && slot.length > 0 && !slot[0].is_valid) {
        await supabase
          .from("helm_tasks")
          .update({ fire_at: slot[0].next_valid, updated_at: new Date().toISOString() })
          .eq("task_id", task_id);

        return new Response(
          JSON.stringify({ rescheduled: true, next: slot[0].next_valid }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Dispatch by channel
    const channels = task.channel === "all" ? ["email", "sms", "in_app"] : [task.channel];
    const dispatchResults: { channel: string; ok: boolean; stub?: boolean; deferred?: string }[] = [];

    for (const ch of channels) {
      if (ch === "email" && recipientEmail) {
        const emailRes = await fetch(
          `${supabaseUrl}/functions/v1/send-transactional-email`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "helm_reminder",
              email: recipientEmail,
              data: {
                title: task.title,
                body: task.body || "",
                priority_tier: task.priority_tier,
                source_kind: task.source_kind,
                helm_link: "https://lianabanyan.com/helm#schedule",
              },
            }),
          },
        );

        const emailData = await emailRes.json();
        await supabase.from("helm_task_dispatch_log").insert({
          task_id,
          channel: "email",
          recipient: recipientEmail,
          status: emailRes.ok ? "sent" : "failed",
          error_message: emailRes.ok ? null : JSON.stringify(emailData),
          external_id: emailData?.emailId || null,
        });
        dispatchResults.push({ channel: "email", ok: emailRes.ok });
      }

      if (ch === "in_app") {
        dispatchResults.push({ channel: "in_app", ok: true, stub: true });
      }

      if (ch === "sms") {
        dispatchResults.push({ channel: "sms", ok: false, deferred: "Phase 2" });
      }
    }

    // Mark fired
    await supabase
      .from("helm_tasks")
      .update({
        state: "fired",
        fired_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("task_id", task_id);

    console.log(`[dispatch-helm-task] Dispatched task ${task_id}: ${task.title}`);

    return new Response(
      JSON.stringify({ dispatched: true, results: dispatchResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[dispatch-helm-task] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
