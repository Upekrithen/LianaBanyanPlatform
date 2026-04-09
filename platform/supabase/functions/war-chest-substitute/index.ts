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
      .eq("feature_key", "war_chest_substitution")
      .maybeSingle();
    if (flagErr) throw flagErr;
    if (!flagRow?.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Feature not yet available", code: "FEATURE_DISABLED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (amount > 5000) {
      return new Response(
        JSON.stringify({ error: "Amount exceeds daily maximum of 5000 marks" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const startOfUtcDay = new Date();
    startOfUtcDay.setUTCHours(0, 0, 0, 0);
    const { data: todayRows, error: todayErr } = await supabase
      .from("war_chest_allocations")
      .select("amount")
      .eq("user_id", user.id)
      .eq("allocation_type", "substitution")
      .gte("created_at", startOfUtcDay.toISOString());
    if (todayErr) throw todayErr;
    const dailyTotal = (todayRows ?? []).reduce((s, r) => s + Number(r.amount), 0);
    if (round2(dailyTotal + amount) > 5000) {
      return new Response(
        JSON.stringify({ error: "Daily substitution limit of 5000 marks exceeded" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    let deductions: { id: string; delta: number }[] = [];
    let firstRecordId = "";
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

    const cashCents = Math.round(amount * 100);
    const { data: alloc, error: insErr } = await supabase
      .from("war_chest_allocations")
      .insert({
        user_id: user.id,
        source_work_record_id: firstRecordId,
        allocation_type: "substitution",
        amount,
        cash_paid_cents: cashCents,
        status: "completed",
      })
      .select("id")
      .single();
    if (insErr) {
      await rollbackFifoDeductions(supabase, deductions);
      throw insErr;
    }

    const fundUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/fund-lb-card`;
    const fundRes = await fetch(fundUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-system-key": Deno.env.get("LB_SYSTEM_KEY") || "",
      },
      body: JSON.stringify({
        user_id: user.id,
        amount_cents: Math.round(amount * 100),
        funding_type: "substitution",
        source_description: "War Chest substitution",
      }),
    });

    if (!fundRes.ok) {
      if (alloc?.id) {
        await supabase.from("war_chest_allocations").delete().eq("id", alloc.id);
      }
      await rollbackFifoDeductions(supabase, deductions);
      const errText = await fundRes.text();
      console.error("[war-chest-substitute] fund-lb-card failed:", fundRes.status, errText);
      return new Response(
        JSON.stringify({
          error: "Could not fund LB Card",
          details: errText.slice(0, 500),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
        cash_funded_cents: cashCents,
        remaining_eligible: remainingEligible,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("[war-chest-substitute]", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
