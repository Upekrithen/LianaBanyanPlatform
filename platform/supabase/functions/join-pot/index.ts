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

type JoinPotPayload = {
  slot_id?: string;
  recipe_id?: string;
  spice?: SpiceType;
  proficiency?: number;
  project_completed?: boolean;
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

    const body = (await req.json().catch(() => ({}))) as JoinPotPayload;
    const proficiency = clampProficiency(body.proficiency ?? 1);
    const shouldIncrementProjects = body.project_completed === true;

    let slotId = body.slot_id?.trim();
    if (!slotId && body.recipe_id && body.spice && isSpiceType(body.spice)) {
      const { data: slotLookup, error: lookupError } = await adminClient
        .from("recipe_spice_slots")
        .select("id")
        .eq("recipe_id", body.recipe_id)
        .eq("spice", body.spice)
        .eq("status", "open")
        .limit(1)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      slotId = slotLookup?.id;
    }

    if (!slotId) {
      return respond({ error: "slot_id is required (or recipe_id + spice for an open slot)" }, 400);
    }

    const { data: slot, error: slotError } = await adminClient
      .from("recipe_spice_slots")
      .select("id, recipe_id, spice, status, filled_by, description")
      .eq("id", slotId)
      .maybeSingle();
    if (slotError) throw new Error(slotError.message);
    if (!slot) return respond({ error: "Recipe slot not found" }, 404);
    if (slot.status !== "open") return respond({ error: "Recipe slot is already filled" }, 409);

    const nowIso = new Date().toISOString();
    const { data: updatedSlot, error: updateSlotError } = await adminClient
      .from("recipe_spice_slots")
      .update({
        status: "filled",
        filled_by: user.id,
        filled_at: nowIso,
      })
      .eq("id", slot.id)
      .eq("status", "open")
      .select("*")
      .maybeSingle();
    if (updateSlotError) throw new Error(updateSlotError.message);
    if (!updatedSlot) return respond({ error: "Slot was filled by another member. Please refresh." }, 409);

    const { data: existingProfile, error: profileFetchError } = await adminClient
      .from("member_spice_profiles")
      .select("id, projects_completed, proficiency")
      .eq("member_id", user.id)
      .eq("spice", slot.spice)
      .maybeSingle();
    if (profileFetchError) throw new Error(profileFetchError.message);

    if (existingProfile) {
      const { error: profileUpdateError } = await adminClient
        .from("member_spice_profiles")
        .update({
          proficiency: Math.max(existingProfile.proficiency ?? 1, proficiency),
          projects_completed: shouldIncrementProjects
            ? (existingProfile.projects_completed ?? 0) + 1
            : existingProfile.projects_completed ?? 0,
        })
        .eq("id", existingProfile.id);
      if (profileUpdateError) throw new Error(profileUpdateError.message);
    } else {
      const { error: profileInsertError } = await adminClient
        .from("member_spice_profiles")
        .insert({
          member_id: user.id,
          spice: slot.spice,
          proficiency,
          projects_completed: shouldIncrementProjects ? 1 : 0,
        });
      if (profileInsertError) throw new Error(profileInsertError.message);
    }

    return respond({
      success: true,
      slot: updatedSlot,
      profile_updated: true,
    });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function isSpiceType(value: string): value is SpiceType {
  return (SPICES as readonly string[]).includes(value);
}

function clampProficiency(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
