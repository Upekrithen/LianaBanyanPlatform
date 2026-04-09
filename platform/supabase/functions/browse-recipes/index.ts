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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = req.method === "POST"
      ? (await req.json().catch(() => ({})) as Record<string, unknown>)
      : {};
    const querySpice = new URL(req.url).searchParams.get("spice");
    const spiceRaw = (payload.spice ?? querySpice ?? "").toString().trim().toLowerCase();
    const limitRaw = Number(payload.limit ?? new URL(req.url).searchParams.get("limit") ?? 50);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, Math.floor(limitRaw))) : 50;

    if (!isSpiceType(spiceRaw)) {
      return respond({ error: "spice is required and must match spice_type" }, 400);
    }

    const { data, error } = await supabase
      .from("recipe_spice_slots")
      .select(`
        id,
        recipe_id,
        spice,
        status,
        description,
        project_recipes!inner (
          id,
          project_id,
          project_name,
          owner_id,
          cold_start_pathway,
          created_at
        )
      `)
      .eq("status", "open")
      .eq("spice", spiceRaw)
      .limit(limit);
    if (error) throw new Error(error.message);

    const recipes = (data ?? []).map((slot: any) => ({
      slot_id: slot.id,
      recipe_id: slot.recipe_id,
      spice: slot.spice,
      description: slot.description ?? null,
      project: slot.project_recipes,
    }));

    return respond({
      success: true,
      spice: spiceRaw,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function isSpiceType(value: string): value is SpiceType {
  return (SPICES as readonly string[]).includes(value);
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
