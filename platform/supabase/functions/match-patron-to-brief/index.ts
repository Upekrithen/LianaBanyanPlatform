import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { brief_id, selected_patron_id } = await req.json();

    if (!brief_id || !selected_patron_id) {
      return new Response(
        JSON.stringify({ error: "brief_id and selected_patron_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify brief exists, is open, and belongs to the requesting user
    const { data: brief, error: briefErr } = await supabaseAdmin
      .from("open_water_briefs")
      .select("*")
      .eq("brief_id", brief_id)
      .single();

    if (briefErr || !brief) {
      return new Response(
        JSON.stringify({ error: "Brief not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (brief.member_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Only the brief owner can select a patron" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (brief.status !== "open") {
      return new Response(
        JSON.stringify({ error: `Brief is already ${brief.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify volunteer exists
    const { data: volunteer } = await supabaseAdmin
      .from("patron_volunteers")
      .select("volunteer_id")
      .eq("brief_id", brief_id)
      .eq("patron_id", selected_patron_id)
      .eq("withdrawn", false)
      .maybeSingle();

    if (!volunteer) {
      return new Response(
        JSON.stringify({ error: "Selected patron has not volunteered for this brief" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check bandwidth cap
    const { data: patron } = await supabaseAdmin
      .from("patron_registrations")
      .select("max_concurrent_engagements, current_concurrent_engagements")
      .eq("patron_id", selected_patron_id)
      .single();

    if (!patron) {
      return new Response(
        JSON.stringify({ error: "Patron registration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetLevel = String(brief.target_level);
    const maxCap = (patron.max_concurrent_engagements as Record<string, number>)[targetLevel] ?? 0;
    const currentCount = (patron.current_concurrent_engagements as Record<string, number>)[targetLevel] ?? 0;

    if (currentCount >= maxCap) {
      return new Response(
        JSON.stringify({
          error: `Patron is at capacity for Level ${brief.target_level} engagements (${currentCount}/${maxCap})`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create engagement
    const { data: engagement, error: engErr } = await supabaseAdmin
      .from("patron_engagements")
      .insert({
        brief_id,
        member_id: user.id,
        patron_id: selected_patron_id,
        level_at_start: brief.current_level,
        target_level: brief.target_level,
        contract_template_version: "v1-placeholder",
        status: "active",
      })
      .select("engagement_id, started_at")
      .single();

    if (engErr) throw engErr;

    // Update brief status
    await supabaseAdmin
      .from("open_water_briefs")
      .update({ status: "in_progress", selected_patron_id })
      .eq("brief_id", brief_id);

    // Increment patron's concurrent engagement counter
    const updatedConcurrent = {
      ...patron.current_concurrent_engagements,
      [targetLevel]: currentCount + 1,
    };
    await supabaseAdmin
      .from("patron_registrations")
      .update({ current_concurrent_engagements: updatedConcurrent })
      .eq("patron_id", selected_patron_id);

    // Log contract_signed event
    await supabaseAdmin.from("engagement_events").insert({
      engagement_id: engagement.engagement_id,
      event_type: "contract_signed",
      event_data: {
        brief_id,
        patron_id: selected_patron_id,
        level_at_start: brief.current_level,
        target_level: brief.target_level,
      },
      recorded_by: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, ...engagement }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
