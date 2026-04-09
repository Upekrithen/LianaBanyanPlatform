import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AttributeBody = {
  new_member_id?: string;
  source_beacon_ref_code?: string;
};

const tierFromCount = (count: number) => {
  if (count >= 100) return "beacon";
  if (count >= 25) return "torch";
  if (count >= 5) return "matchstick";
  return "linchpin";
};

const tryInsertConnection = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  sourceMemberId: string,
  newMemberId: string,
  sourceBeaconId: string,
  sourcePaperKey: string | null,
) => {
  const variants = [
    {
      source_member_id: sourceMemberId,
      target_member_id: newMemberId,
      source_type: "reading_beacon",
      source_beacon_id: sourceBeaconId,
      source_paper_key: sourcePaperKey,
    },
    {
      referrer_id: sourceMemberId,
      referred_id: newMemberId,
      source_type: "reading_beacon",
      source_beacon_id: sourceBeaconId,
      source_paper_key: sourcePaperKey,
    },
    {
      from_member_id: sourceMemberId,
      to_member_id: newMemberId,
      source_type: "reading_beacon",
      source_beacon_id: sourceBeaconId,
      source_paper_key: sourcePaperKey,
    },
  ];

  let lastError: unknown = null;
  for (const payload of variants) {
    const result = await supabaseAdmin
      .from("linchpin_connections")
      .insert(payload as never)
      .select("*")
      .single();

    if (!result.error) return result.data;
    lastError = result.error;
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to insert linchpin connection");
};

const countConnections = async (supabaseAdmin: ReturnType<typeof createClient>, memberId: string) => {
  const candidates = ["source_member_id", "referrer_id", "from_member_id"];
  for (const col of candidates) {
    const { count, error } = await supabaseAdmin
      .from("linchpin_connections")
      .select("id", { count: "exact", head: true })
      .eq(col, memberId);
    if (!error) return count ?? 0;
  }
  return 0;
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server is missing Supabase service credentials" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = (await req.json()) as AttributeBody;
    const newMemberId = body.new_member_id?.trim();
    const beaconRefCode = body.source_beacon_ref_code?.trim();

    if (!newMemberId || !beaconRefCode) {
      return new Response(JSON.stringify({ error: "new_member_id and source_beacon_ref_code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sourceBeacon, error: sourceBeaconError } = await supabaseAdmin
      .from("beacons")
      .select("id, member_id, user_id, reading_paper_key, reading_ref_code")
      .eq("reading_ref_code", beaconRefCode)
      .eq("orange_subtype", "reading")
      .maybeSingle();

    if (sourceBeaconError) throw sourceBeaconError;
    if (!sourceBeacon) {
      return new Response(JSON.stringify({ error: "Reading beacon not found for ref code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceMemberId = sourceBeacon.member_id ?? sourceBeacon.user_id;
    if (!sourceMemberId) {
      return new Response(JSON.stringify({ error: "Reading beacon is missing source member information" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const attribution = await tryInsertConnection(
      supabaseAdmin,
      sourceMemberId,
      newMemberId,
      sourceBeacon.id,
      sourceBeacon.reading_paper_key,
    );

    const totalAttributions = await countConnections(supabaseAdmin, sourceMemberId);
    const tier = tierFromCount(totalAttributions);

    await supabaseAdmin
      .from("member_profiles")
      .update({
        linchpin_referrals: totalAttributions,
        linchpin_tier: tier,
      } as never)
      .eq("id", sourceMemberId);

    return new Response(
      JSON.stringify({
        success: true,
        attribution,
        linchpin: {
          source_member_id: sourceMemberId,
          referral_count: totalAttributions,
          tier,
        },
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
