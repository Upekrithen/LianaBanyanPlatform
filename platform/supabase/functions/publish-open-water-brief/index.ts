import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COLD_START_PATHWAYS = [
  "food",
  "manufacturing",
  "service",
  "local_business",
  "guild",
  "tribe",
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      current_level,
      target_level,
      industry_pathway,
      industry_subtag,
      industry_freetext,
      growth_question,
      voucher_budget_credits = 0,
      voucher_budget_marks = 0,
      voucher_budget_joules = 0,
      preferred_engagement_length_days,
    } = body;

    // Validation
    if (typeof current_level !== "number" || current_level < 0 || current_level > 6) {
      return new Response(
        JSON.stringify({ error: "current_level must be 0-6" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof target_level !== "number" || target_level < 0 || target_level > 6) {
      return new Response(
        JSON.stringify({ error: "target_level must be 0-6" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (current_level === 0 && target_level < 1) {
      return new Response(
        JSON.stringify({ error: "Level 0 briefs must target at least Level 1" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (current_level > 0 && target_level <= current_level) {
      return new Response(
        JSON.stringify({ error: "target_level must be greater than current_level" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!COLD_START_PATHWAYS.includes(industry_pathway)) {
      return new Response(
        JSON.stringify({ error: `industry_pathway must be one of: ${COLD_START_PATHWAYS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!growth_question || typeof growth_question !== "string" || growth_question.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "growth_question is required (min 10 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (voucher_budget_credits < 0 || voucher_budget_marks < 0 || voucher_budget_joules < 0) {
      return new Response(
        JSON.stringify({ error: "Voucher budgets must be non-negative" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert brief
    const { data: brief, error: insertErr } = await supabaseAdmin
      .from("open_water_briefs")
      .insert({
        member_id: user.id,
        current_level,
        target_level,
        industry_pathway,
        industry_subtag: industry_subtag || null,
        industry_freetext: industry_freetext || null,
        growth_question: growth_question.trim(),
        voucher_budget_credits,
        voucher_budget_marks,
        voucher_budget_joules,
        preferred_engagement_length_days: preferred_engagement_length_days || null,
        status: "open",
      })
      .select("brief_id, published_at, status")
      .single();

    if (insertErr) throw insertErr;

    // Notify matching Patrons (best-effort, non-blocking)
    const { data: matchingPatrons } = await supabaseAdmin
      .from("patron_registrations")
      .select("user_id")
      .or(
        `registered_levels.cs.{${target_level}},registered_levels.cs.{${current_level + 1}},registered_levels.cs.{${Math.min(current_level + 2, 6)}}`
      )
      .neq("user_id", user.id);

    if (matchingPatrons && matchingPatrons.length > 0) {
      const notifications = matchingPatrons.map((p) => ({
        user_id: p.user_id,
        type: "open_water_brief",
        title: "New Open Water Brief",
        body: `A member published a Level ${current_level}→${target_level} brief in ${industry_pathway}`,
        data: { brief_id: brief.brief_id },
        read: false,
        created_at: new Date().toISOString(),
      }));

      await supabaseAdmin.from("notifications").insert(notifications).throwOnError().catch(() => {
        // notifications table may not exist yet — non-blocking
      });
    }

    return new Response(
      JSON.stringify({ success: true, ...brief }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
