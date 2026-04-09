import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReadAlongBody = {
  source_member_id?: string;
  paper_key?: string;
};

const clampDepth = (depth: number) => Math.max(1, Math.min(4, depth));
const pad3 = (value: number) => String(value).padStart(3, "0");
const makePaperAbbrev = (paperKey: string) => {
  const letters = paperKey.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "PPR").padEnd(3, "X");
};
const createRefCode = (beaconNumber: number, paperKey: string, position: number) =>
  `Read${pad3(beaconNumber)}${makePaperAbbrev(paperKey)}${pad3(position)}`;

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

    const body = (await req.json()) as ReadAlongBody;
    const sourceMemberId = body.source_member_id?.trim();
    const paperKey = body.paper_key?.trim();
    if (!sourceMemberId || !paperKey) {
      return new Response(JSON.stringify({ error: "source_member_id and paper_key are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sourceBeacon, error: sourceError } = await supabase
      .from("beacons")
      .select("id, reading_paper_key, reading_position, reading_depth")
      .eq("orange_subtype", "reading")
      .eq("reading_paper_key", paperKey)
      .or(`member_id.eq.${sourceMemberId},user_id.eq.${sourceMemberId}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sourceError) throw sourceError;

    if (!sourceBeacon) {
      return new Response(JSON.stringify({ error: "Source member has no reading beacon for this paper" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourcePosition = Math.max(0, Number(sourceBeacon.reading_position ?? 0));
    const sourceDepth = clampDepth(Number(sourceBeacon.reading_depth ?? 1));

    const { data: existing } = await supabase
      .from("beacons")
      .select("id, reading_depth")
      .eq("orange_subtype", "reading")
      .eq("reading_paper_key", paperKey)
      .or(`member_id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();

    let beacon: unknown;
    if (existing?.id) {
      const mergedDepth = Math.max(sourceDepth, Number(existing.reading_depth ?? 1));
      const { data: updated, error: updateError } = await supabase
        .from("beacons")
        .update({
          reading_position: sourcePosition,
          reading_depth: mergedDepth,
        } as never)
        .eq("id", existing.id)
        .select(
          "id, reading_paper_key, reading_position, reading_depth, reading_ref_code, updated_at, member_id, user_id",
        )
        .single();
      if (updateError) throw updateError;
      beacon = updated;
    } else {
      const { count } = await supabase
        .from("beacons")
        .select("id", { head: true, count: "exact" })
        .or(`member_id.eq.${user.id},user_id.eq.${user.id}`)
        .eq("orange_subtype", "reading");
      const beaconNumber = (count ?? 0) + 1;
      const refCode = createRefCode(beaconNumber, paperKey, sourcePosition);

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
          reading_position: sourcePosition,
          reading_depth: sourceDepth,
        } as never)
        .select(
          "id, reading_paper_key, reading_position, reading_depth, reading_ref_code, updated_at, member_id, user_id",
        )
        .single();
      if (insertError) throw insertError;
      beacon = inserted;
    }

    await supabase.from("reading_cohorts").upsert(
      [
        { paper_key: paperKey, member_id: sourceMemberId, joined_via_member_id: null },
        { paper_key: paperKey, member_id: user.id, joined_via_member_id: sourceMemberId },
      ] as never,
      { onConflict: "paper_key,member_id", ignoreDuplicates: true },
    );

    const { count: cohortCount } = await supabase
      .from("reading_cohorts")
      .select("id", { head: true, count: "exact" })
      .eq("paper_key", paperKey);

    return new Response(
      JSON.stringify({
        success: true,
        beacon,
        cohort_size: cohortCount ?? 0,
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
