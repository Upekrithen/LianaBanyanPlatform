import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_TYPES = ["resources", "reputation", "network", "skills"] as const;
type RippleType = (typeof VALID_TYPES)[number];

function validateRippleData(type: RippleType, data: unknown): string | null {
  if (!data || typeof data !== "object") return "ripple_data must be an object";
  const d = data as Record<string, unknown>;

  switch (type) {
    case "resources": {
      const validCurrencies = ["credits", "marks", "joules", "backed_marks"];
      if (!validCurrencies.includes(d.currency as string))
        return `currency must be one of: ${validCurrencies.join(", ")}`;
      if (typeof d.amount !== "number" || d.amount <= 0)
        return "amount must be a positive number";
      return null;
    }
    case "reputation": {
      if (typeof d.endorsement_text !== "string" || d.endorsement_text.length < 5)
        return "endorsement_text required (min 5 chars)";
      return null;
    }
    case "network": {
      if (!d.introduction_to_user_id)
        return "introduction_to_user_id is required";
      if (typeof d.introduction_context !== "string" || d.introduction_context.length < 5)
        return "introduction_context required (min 5 chars)";
      return null;
    }
    case "skills": {
      if (typeof d.service_description !== "string" || d.service_description.length < 5)
        return "service_description required (min 5 chars)";
      if (typeof d.estimated_hours !== "number" || d.estimated_hours <= 0)
        return "estimated_hours must be a positive number";
      return null;
    }
  }
}

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

    const { engagement_id, ripple_type, ripple_data } = await req.json();

    if (!engagement_id) {
      return new Response(
        JSON.stringify({ error: "engagement_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TYPES.includes(ripple_type)) {
      return new Response(
        JSON.stringify({ error: `ripple_type must be one of: ${VALID_TYPES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataErr = validateRippleData(ripple_type, ripple_data);
    if (dataErr) {
      return new Response(
        JSON.stringify({ error: dataErr }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify engagement exists and is active
    const { data: engagement, error: engErr } = await supabaseAdmin
      .from("patron_engagements")
      .select("engagement_id, member_id, patron_id, status")
      .eq("engagement_id", engagement_id)
      .single();

    if (engErr || !engagement) {
      return new Response(
        JSON.stringify({ error: "Engagement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (engagement.status !== "active") {
      return new Response(
        JSON.stringify({ error: `Engagement is ${engagement.status}, not active` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ripples are third-party backings — backer cannot be Member or Patron
    if (engagement.member_id === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot Ripple your own engagement as Member" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: patronReg } = await supabaseAdmin
      .from("patron_registrations")
      .select("user_id")
      .eq("patron_id", engagement.patron_id)
      .single();

    if (patronReg && patronReg.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot Ripple your own engagement as Patron" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize ripple_data defaults per type
    const normalizedData = { ...ripple_data };
    if (ripple_type === "resources") {
      normalizedData.committed = normalizedData.committed ?? false;
      normalizedData.delivered = normalizedData.delivered ?? false;
    }
    if (ripple_type === "reputation") {
      normalizedData.visible_on_member_profile =
        normalizedData.visible_on_member_profile ?? true;
    }
    if (ripple_type === "network") {
      normalizedData.delivered = normalizedData.delivered ?? false;
      normalizedData.delivered_at = normalizedData.delivered_at ?? null;
    }
    if (ripple_type === "skills") {
      normalizedData.delivered = normalizedData.delivered ?? false;
      normalizedData.delivery_notes = normalizedData.delivery_notes ?? "";
    }

    // Insert ripple
    const { data: ripple, error: insertErr } = await supabaseAdmin
      .from("ripple_contributions")
      .insert({
        engagement_id,
        backer_user_id: user.id,
        ripple_type,
        ripple_data: normalizedData,
        status: "active",
      })
      .select("ripple_id, committed_at")
      .single();

    if (insertErr) throw insertErr;

    // Log engagement event
    await supabaseAdmin.from("engagement_events").insert({
      engagement_id,
      event_type: "ripple_committed",
      event_data: {
        ripple_id: ripple.ripple_id,
        ripple_type,
        backer_user_id: user.id,
      },
      recorded_by: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, ripple_id: ripple.ripple_id, committed_at: ripple.committed_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
