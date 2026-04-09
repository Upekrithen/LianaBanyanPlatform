import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TrackPuddingViewBody = {
  pudding_number?: number;
  viewer_id?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as TrackPuddingViewBody;
    const puddingNumber = Number(body.pudding_number);
    if (!Number.isInteger(puddingNumber) || puddingNumber <= 0) {
      return jsonResponse({ error: "pudding_number must be a positive integer" }, 400);
    }

    const { data: current, error: currentError } = await supabase
      .from("cephas_puddings")
      .select("pudding_number, view_count")
      .eq("pudding_number", puddingNumber)
      .maybeSingle();
    if (currentError) throw new Error(currentError.message);
    if (!current) {
      return jsonResponse({ error: "Pudding not found" }, 404);
    }

    const nextViewCount = Number(current.view_count ?? 0) + 1;
    const { data: updated, error: updateError } = await supabase
      .from("cephas_puddings")
      .update({ view_count: nextViewCount, updated_at: new Date().toISOString() })
      .eq("pudding_number", puddingNumber)
      .select("view_count, rating_active, pepper_rating_avg, pepper_rating_count")
      .single();
    if (updateError) throw new Error(updateError.message);

    return jsonResponse({
      pudding_number: puddingNumber,
      view_count: Number(updated.view_count ?? nextViewCount),
      rating_active: Boolean(updated.rating_active),
      pepper_rating_avg: updated.pepper_rating_avg === null ? null : Number(updated.pepper_rating_avg),
      pepper_rating_count: Number(updated.pepper_rating_count ?? 0),
      viewer_id: body.viewer_id ?? null,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
