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
type ColdStartPathway = "food" | "manufacturing" | "service" | "local_business" | "guild" | "tribe";

type CreateRecipePayload = {
  project_id?: string;
  project_name?: string;
  cold_start_pathway?: ColdStartPathway;
  spice_slots?: Array<{ spice: SpiceType; description?: string }>;
  owner_spices?: SpiceType[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond({ error: "Missing Authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: authData, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !authData.user) return respond({ error: "Not authenticated" }, 401);
    const user = authData.user;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as CreateRecipePayload;
    const projectName = body.project_name?.trim();
    if (!projectName) return respond({ error: "project_name is required" }, 400);

    const pathway = body.cold_start_pathway;
    const ownerSpices = normalizeSpices(body.owner_spices ?? []);
    const customSlots = normalizeSlots(body.spice_slots ?? []);

    let defaultSpices: SpiceType[] = [];
    if (pathway) {
      const { data: blendRow, error: blendError } = await adminClient
        .from("default_recipe_blends")
        .select("default_spices")
        .eq("pathway", pathway)
        .maybeSingle();
      if (blendError) throw new Error(blendError.message);
      defaultSpices = normalizeSpices((blendRow?.default_spices ?? []) as string[]);
    }

    const mergedSpices = Array.from(
      new Set([
        ...defaultSpices,
        ...customSlots.map((slot) => slot.spice),
        ...ownerSpices,
      ]),
    );

    const { data: recipe, error: recipeError } = await adminClient
      .from("project_recipes")
      .insert({
        project_id: body.project_id ?? crypto.randomUUID(),
        project_name: projectName,
        owner_id: user.id,
        cold_start_pathway: pathway ?? null,
      })
      .select("*")
      .single();
    if (recipeError) throw new Error(recipeError.message);

    if (mergedSpices.length > 0) {
      const descriptionBySpice = new Map(customSlots.map((slot) => [slot.spice, slot.description?.trim() ?? null]));
      const nowIso = new Date().toISOString();
      const slotRows = mergedSpices.map((spice) => {
        const ownerSlot = ownerSpices.includes(spice);
        return {
          recipe_id: recipe.id,
          spice,
          status: ownerSlot ? "owner" : "open",
          filled_by: ownerSlot ? user.id : null,
          filled_at: ownerSlot ? nowIso : null,
          description: descriptionBySpice.get(spice) ?? null,
        };
      });

      const { error: slotError } = await adminClient
        .from("recipe_spice_slots")
        .insert(slotRows);
      if (slotError) throw new Error(slotError.message);
    }

    const { data: slots, error: slotsFetchError } = await adminClient
      .from("recipe_spice_slots")
      .select("*")
      .eq("recipe_id", recipe.id)
      .order("spice", { ascending: true });
    if (slotsFetchError) throw new Error(slotsFetchError.message);

    return respond({
      success: true,
      recipe,
      slots: slots ?? [],
    });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function normalizeSpices(input: string[]): SpiceType[] {
  const normalized = input
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is SpiceType => !!value && isSpiceType(value));
  return Array.from(new Set(normalized));
}

function normalizeSlots(input: Array<{ spice: SpiceType; description?: string }>) {
  const valid = input
    .map((slot) => ({
      spice: slot.spice?.trim().toLowerCase(),
      description: slot.description,
    }))
    .filter((slot): slot is { spice: SpiceType; description?: string } => isSpiceType(slot.spice));
  const bySpice = new Map<SpiceType, { spice: SpiceType; description?: string }>();
  valid.forEach((slot) => bySpice.set(slot.spice, slot));
  return Array.from(bySpice.values());
}

function isSpiceType(value: string): value is SpiceType {
  return (SPICES as readonly string[]).includes(value);
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
