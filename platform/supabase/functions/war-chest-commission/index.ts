import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  deductEligibleMarksFifo,
  rollbackFifoDeductions,
  round2,
} from "../_shared/war-chest-fifo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const anonClient = createClient(supabaseUrl, anonKey);
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: flagRow, error: flagErr } = await supabase
      .from("founder_feature_flags")
      .select("is_enabled")
      .eq("feature_key", "war_chest_commission")
      .maybeSingle();
    if (flagErr) throw flagErr;
    if (!flagRow?.is_enabled) {
      return new Response(
        JSON.stringify({
          error:
            "Commission is pending tax counsel review. This feature will be available once legal guidance is received.",
          code: "FEATURE_DISABLED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const target_project_id = body?.target_project_id as string | undefined;
    const target_bounty_id = body?.target_bounty_id as string | undefined;

    if (!target_project_id || !isUuid(target_project_id)) {
      return new Response(JSON.stringify({ error: "target_project_id must be a valid UUID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (target_bounty_id !== undefined && target_bounty_id !== null && target_bounty_id !== "" && !isUuid(target_bounty_id)) {
      return new Response(JSON.stringify({ error: "target_bounty_id must be a valid UUID when provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify project ownership: projects.owner_id references profiles.id (= auth user id)
    const { data: projectRow, error: projErr } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", target_project_id)
      .maybeSingle();
    if (projErr) throw projErr;
    if (!projectRow) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!projectRow.owner_id || projectRow.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Target project must be owned by the current user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: summary, error: sumErr } = await supabase
      .from("war_chest_summary")
      .select("available_eligible")
      .eq("user_id", user.id)
      .maybeSingle();
    if (sumErr) throw sumErr;
    const available = round2(Number(summary?.available_eligible ?? 0));
    if (amount > available) {
      return new Response(JSON.stringify({ error: "Insufficient eligible marks" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let firstRecordId = "";
    let deductions: { id: string; delta: number }[] = [];
    try {
      const fifo = await deductEligibleMarksFifo(supabase, user.id, amount);
      firstRecordId = fifo.firstRecordId;
      deductions = fifo.deductions;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "FIFO error";
      if (msg === "Insufficient eligible marks") {
        return new Response(JSON.stringify({ error: "Insufficient eligible marks" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    const { error: insErr } = await supabase.from("war_chest_allocations").insert({
      user_id: user.id,
      source_work_record_id: firstRecordId,
      allocation_type: "commission",
      amount,
      target_project_id,
      target_bounty_id: target_bounty_id && isUuid(target_bounty_id) ? target_bounty_id : null,
      saa_earned: 0,
      status: "completed",
    });
    if (insErr) {
      await rollbackFifoDeductions(supabase, deductions);
      throw insErr;
    }

    const { data: summaryAfter } = await supabase
      .from("war_chest_summary")
      .select("available_eligible")
      .eq("user_id", user.id)
      .maybeSingle();
    const remainingEligible = round2(Number(summaryAfter?.available_eligible ?? 0));

    return new Response(
      JSON.stringify({
        success: true,
        remaining_eligible: remainingEligible,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("[war-chest-commission]", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
