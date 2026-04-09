import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TrackBody = {
  card_id?: string;
  scanned_by_member_id?: string | null;
};

const clampPosition = (value: number) => Math.max(0, value);

const anchorToPosition = (anchor: string | null) => {
  if (!anchor) return 0;
  const digits = anchor.match(/\d+/)?.[0];
  return clampPosition(Number(digits ?? 0));
};

const createBeaconRefCode = (cardId: string, paperKey: string, position: number) => {
  const cardToken = cardId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const paperToken = paperKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  const posToken = String(position).padStart(3, "0");
  return `Deck${cardToken}${paperToken}${posToken}`;
};

const originFromUrl = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return "https://lianabanyan.com";
  }
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
    const body = (await req.json()) as TrackBody;
    const cardId = body.card_id?.trim();
    const scannedByMemberId = body.scanned_by_member_id?.trim() || null;

    if (!cardId) {
      return new Response(JSON.stringify({ error: "card_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: card, error: cardError } = await supabaseAdmin
      .from("deck_cards")
      .select("id, scan_count, signup_count, deep_link_url, paper_key, section_anchor")
      .eq("id", cardId)
      .maybeSingle();
    if (cardError) throw cardError;
    if (!card) {
      return new Response(JSON.stringify({ error: "Deck card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nextScanCount = Number(card.scan_count ?? 0) + 1;
    const nextSignupCount = scannedByMemberId ? Number(card.signup_count ?? 0) : Number(card.signup_count ?? 0) + 1;

    const { error: updateCardError } = await supabaseAdmin
      .from("deck_cards")
      .update({
        scan_count: nextScanCount,
        signup_count: nextSignupCount,
      })
      .eq("id", cardId);
    if (updateCardError) throw updateCardError;

    if (!scannedByMemberId) {
      const origin = originFromUrl(card.deep_link_url ?? "");
      const signupUrl = `${origin}/join?card_id=${encodeURIComponent(cardId)}`;
      return new Response(
        JSON.stringify({
          success: true,
          is_member: false,
          deep_link_url: card.deep_link_url,
          redirect_url: signupUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paperKey = (card.paper_key ?? "").trim();
    if (paperKey) {
      const position = anchorToPosition(card.section_anchor);
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("beacons")
        .select("id, reading_depth, reading_position, reading_ref_code")
        .eq("user_id", scannedByMemberId)
        .eq("orange_subtype", "reading")
        .eq("reading_paper_key", paperKey)
        .maybeSingle();
      if (existingError) throw existingError;

      if (existing) {
        const { error: updateBeaconError } = await supabaseAdmin
          .from("beacons")
          .update({
            reading_position: position,
            reading_depth: Math.max(1, Number(existing.reading_depth ?? 1)),
          })
          .eq("id", existing.id);
        if (updateBeaconError) throw updateBeaconError;
      } else {
        const refCode = createBeaconRefCode(cardId, paperKey, position);
        const { error: insertBeaconError } = await supabaseAdmin
          .from("beacons")
          .insert({
            user_id: scannedByMemberId,
            member_id: scannedByMemberId,
            name: `Reading Beacon: ${paperKey}`,
            beacon_type: "personal",
            beacon_color: "orange",
            orange_subtype: "reading",
            location_type: "cephas_reading",
            location_path: `/read/${paperKey}`,
            reading_ref_code: refCode,
            reading_paper_key: paperKey,
            reading_position: position,
            reading_depth: 1,
          } as never);
        if (insertBeaconError) throw insertBeaconError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        is_member: true,
        deep_link_url: card.deep_link_url,
        redirect_url: card.deep_link_url,
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
