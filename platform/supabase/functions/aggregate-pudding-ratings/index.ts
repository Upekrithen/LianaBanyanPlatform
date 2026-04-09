import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AggregateBody = {
  pudding_number?: number;
};

type RatingRow = {
  pudding_number: number;
  pepper_count: number;
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

    const body = (await req.json().catch(() => ({}))) as AggregateBody;
    const requestedPudding = Number(body.pudding_number);
    const hasFilter = Number.isInteger(requestedPudding) && requestedPudding > 0;

    let ratingsQuery = supabase
      .from("pudding_pepper_ratings")
      .select("pudding_number, pepper_count");

    if (hasFilter) {
      ratingsQuery = ratingsQuery.eq("pudding_number", requestedPudding);
    }

    const { data, error } = await ratingsQuery;
    if (error) throw new Error(error.message);

    const ratings = (data ?? []) as RatingRow[];
    const aggregateByPudding = new Map<number, { count: number; sum: number }>();

    for (const rating of ratings) {
      const key = Number(rating.pudding_number);
      const current = aggregateByPudding.get(key) ?? { count: 0, sum: 0 };
      current.count += 1;
      current.sum += Number(rating.pepper_count ?? 0);
      aggregateByPudding.set(key, current);
    }

    let updatedRows = 0;
    for (const [puddingNumber, aggregate] of aggregateByPudding.entries()) {
      const avg = aggregate.count > 0 ? Number((aggregate.sum / aggregate.count).toFixed(2)) : null;

      const { error: updateError } = await supabase
        .from("cephas_puddings")
        .update({
          pepper_rating_avg: avg,
          pepper_rating_count: aggregate.count,
          updated_at: new Date().toISOString(),
        })
        .eq("pudding_number", puddingNumber);
      if (updateError) throw new Error(updateError.message);
      updatedRows += 1;
    }

    return jsonResponse({
      success: true,
      puddings_with_ratings: aggregateByPudding.size,
      updated_rows: updatedRows,
      filtered_pudding_number: hasFilter ? requestedPudding : null,
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
