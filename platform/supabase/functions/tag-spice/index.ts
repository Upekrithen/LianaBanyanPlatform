import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPICES = [
  "salt",
  "garlic",
  "sugar",
  "cinnamon",
  "pepper",
  "ginger",
  "cumin",
  "paprika",
  "basil",
  "oregano",
] as const;

type SpiceType = (typeof SPICES)[number];

type TagSpicePayload = {
  episode_id?: string;
  primary_spice?: string;
  secondary_spices?: string[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as TagSpicePayload;
    const episodeId = body.episode_id?.trim();
    const primarySpice = body.primary_spice?.trim().toLowerCase();
    const secondaryRaw = Array.isArray(body.secondary_spices) ? body.secondary_spices : [];

    if (!episodeId) {
      return response({ error: "episode_id is required" }, 400);
    }
    if (!primarySpice || !isSpiceType(primarySpice)) {
      return response({ error: "primary_spice must be a valid spice_type" }, 400);
    }

    const secondarySpices = normalizeSecondarySpices(secondaryRaw, primarySpice);
    if (secondarySpices.error) {
      return response({ error: "secondary_spices allows a maximum of 3 values" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("crewman_episodes")
      .update({
        primary_spice: primarySpice,
        secondary_spices: secondarySpices.values,
      })
      .eq("id", episodeId)
      .select("id, primary_spice, secondary_spices")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return response({ error: "Episode not found" }, 404);

    return response({
      success: true,
      episode_id: data.id,
      primary_spice: data.primary_spice,
      secondary_spices: data.secondary_spices ?? [],
    });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function normalizeSecondarySpices(
  input: string[],
  primarySpice: SpiceType,
): { values: SpiceType[]; error: boolean } {
  const normalized = input
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is SpiceType => !!value && isSpiceType(value) && value !== primarySpice);

  const deduped = Array.from(new Set(normalized));
  return {
    values: deduped.slice(0, 3),
    error: deduped.length > 3,
  };
}

function isSpiceType(value: string): value is SpiceType {
  return (SPICES as readonly string[]).includes(value);
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
