import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AttributionBody = {
  recipient_identifier?: string;
  letter_slug?: string;
  wave?: string;
  event_type?: "letter_open" | "viewing_schedule_visit" | "series_engagement" | "member_conversion";
  series_key?: "bst" | "spoonfuls" | "skipping_stones";
  member_id?: string;
  event_metadata?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as AttributionBody;
    const recipient = body.recipient_identifier?.trim();
    const eventType = body.event_type;
    if (!recipient || !eventType) {
      return new Response(
        JSON.stringify({ error: "recipient_identifier and event_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = {
      recipient_identifier: recipient,
      letter_slug: body.letter_slug ?? null,
      wave: body.wave ?? null,
      event_type: eventType,
      series_key: body.series_key ?? null,
      member_id: body.member_id ?? null,
      event_metadata: body.event_metadata ?? {},
    };

    const { data, error } = await supabase
      .from("opening_gambit_funnel_events")
      .insert(payload)
      .select("id, event_type, created_at")
      .single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true, event: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
