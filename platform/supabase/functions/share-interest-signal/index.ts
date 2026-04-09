import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ShareBody = {
  beacon_id?: string;
};

const isMissingColumnError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "42703";

const getCueCard = async (supabase: ReturnType<typeof createClient>, memberId: string) => {
  const memberLookup = await supabase
    .from("cue_cards")
    .select("id, shared_beacons")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!memberLookup.error) {
    return { key: "member_id", record: memberLookup.data };
  }

  if (!isMissingColumnError(memberLookup.error)) {
    throw memberLookup.error;
  }

  const userLookup = await supabase
    .from("cue_cards")
    .select("id, shared_beacons")
    .eq("user_id", memberId)
    .maybeSingle();

  if (userLookup.error) throw userLookup.error;
  return { key: "user_id", record: userLookup.data };
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

    const body = (await req.json()) as ShareBody;
    const beaconId = body.beacon_id?.trim();
    if (!beaconId) {
      return new Response(JSON.stringify({ error: "beacon_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: beacon, error: beaconError } = await supabase
      .from("beacons")
      .select("id, user_id, member_id, reading_paper_key, reading_depth, reading_position, reading_ref_code")
      .eq("id", beaconId)
      .eq("orange_subtype", "reading")
      .or(`user_id.eq.${user.id},member_id.eq.${user.id}`)
      .maybeSingle();

    if (beaconError) throw beaconError;
    if (!beacon) {
      return new Response(JSON.stringify({ error: "Reading beacon not found for this member" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cueCard = await getCueCard(supabase, user.id);
    const existingIds = Array.isArray(cueCard.record?.shared_beacons)
      ? (cueCard.record?.shared_beacons as string[])
      : [];
    const nextIds = Array.from(new Set([...existingIds, beacon.id]));

    let updatedCueCard: unknown = null;
    if (cueCard.record?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("cue_cards")
        .update({ shared_beacons: nextIds } as never)
        .eq("id", cueCard.record.id)
        .select("id, shared_beacons, interest_visibility")
        .single();
      if (updateError) throw updateError;
      updatedCueCard = updated;
    } else {
      const payload = {
        [cueCard.key]: user.id,
        shared_beacons: nextIds,
      };
      const { data: inserted, error: insertError } = await supabase
        .from("cue_cards")
        .insert(payload as never)
        .select("id, shared_beacons, interest_visibility")
        .single();
      if (insertError) throw insertError;
      updatedCueCard = inserted;
    }

    const { data: beacons, error: beaconsError } = await supabase
      .from("beacons")
      .select(
        "id, reading_paper_key, reading_depth, reading_position, reading_ref_code, updated_at, member_id, user_id",
      )
      .in("id", nextIds);
    if (beaconsError) throw beaconsError;

    return new Response(
      JSON.stringify({
        success: true,
        cue_card: updatedCueCard,
        shared_beacons: beacons ?? [],
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
