import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UpsertBody = {
  paper_key?: string;
  position?: number;
  depth?: number;
};

const clampDepth = (depth: number) => Math.max(1, Math.min(4, depth));

const pad3 = (value: number) => String(value).padStart(3, "0");

const makePaperAbbrev = (paperKey: string) => {
  const letters = paperKey.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "PPR").padEnd(3, "X");
};

const createRefCode = (beaconNumber: number, paperKey: string, position: number) => {
  return `Read${pad3(beaconNumber)}${makePaperAbbrev(paperKey)}${pad3(position)}`;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as UpsertBody;
    const paperKey = body.paper_key?.trim();
    const position = Math.max(0, Number(body.position ?? 0));
    const nextDepth = clampDepth(Number(body.depth ?? 1));

    if (!paperKey) {
      return new Response(JSON.stringify({ error: "paper_key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing, error: existingError } = await supabase
      .from("beacons")
      .select("id, reading_ref_code, reading_depth, reading_position")
      .eq("user_id", user.id)
      .eq("orange_subtype", "reading")
      .eq("reading_paper_key", paperKey)
      .maybeSingle();

    if (existingError) throw existingError;

    const { data: progress } = await supabase
      .from("reading_progress")
      .select("percent_complete")
      .eq("member_id", user.id)
      .eq("content_id", paperKey)
      .maybeSingle();

    const isComplete = nextDepth >= 4 && Number(progress?.percent_complete ?? 0) >= 100;
    const completionTime = isComplete ? new Date().toISOString() : null;

    if (existing) {
      const currentDepth = Number(existing.reading_depth ?? 1);
      const mergedDepth = Math.max(currentDepth, nextDepth);
      const payload = {
        reading_position: position,
        reading_depth: mergedDepth,
        reading_completed_at: mergedDepth >= 4 ? completionTime : null,
      };

      const { data: updated, error: updateError } = await supabase
        .from("beacons")
        .update(payload)
        .eq("id", existing.id)
        .select(
          "id, user_id, member_id, reading_paper_key, reading_ref_code, reading_position, reading_depth, reading_completed_at, updated_at",
        )
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          mode: "updated",
          beacon: updated,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { count } = await supabase
      .from("beacons")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("orange_subtype", "reading");

    const beaconNumber = (count ?? 0) + 1;
    const refCode = createRefCode(beaconNumber, paperKey, position);

    const { data: inserted, error: insertError } = await supabase
      .from("beacons")
      .insert({
        user_id: user.id,
        member_id: user.id,
        name: `Reading Beacon: ${paperKey}`,
        beacon_type: "personal",
        beacon_color: "orange",
        orange_subtype: "reading",
        location_type: "cephas_reading",
        location_path: `/cephas/${paperKey}`,
        reading_ref_code: refCode,
        reading_paper_key: paperKey,
        reading_position: position,
        reading_depth: nextDepth,
        reading_completed_at: nextDepth >= 4 ? completionTime : null,
      } as never)
      .select(
        "id, user_id, member_id, reading_paper_key, reading_ref_code, reading_position, reading_depth, reading_completed_at, updated_at",
      )
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        mode: "created",
        beacon: inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
