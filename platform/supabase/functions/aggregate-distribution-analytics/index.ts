import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AggregateBody = {
  days_back?: number;
};

type EpisodeAnalyticsRow = {
  id: string;
  platform: string | null;
  channel: string | null;
  primary_spice: string | null;
  content_type: string | null;
  scheduled_for: string | null;
  posted_at: string | null;
  engagement_likes: number | null;
  engagement_replies: number | null;
  engagement_reposts: number | null;
  engagement_clicks: number | null;
  engagement_cross_ref_clicks: number | null;
  engagement_beacon_creates: number | null;
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as AggregateBody;
    const daysBack = Math.max(1, Math.floor(Number(body.days_back ?? 2)));
    const start = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)).toISOString();

    const { data, error } = await supabase
      .from("crewman_episodes")
      .select(
        "id, platform, channel, primary_spice, content_type, scheduled_for, posted_at, engagement_likes, engagement_replies, engagement_reposts, engagement_clicks, engagement_cross_ref_clicks, engagement_beacon_creates",
      )
      .eq("status", "posted")
      .gte("posted_at", start);

    if (error) throw new Error(error.message);

    const episodes = (data ?? []) as EpisodeAnalyticsRow[];
    let upserted = 0;
    for (const episode of episodes) {
      const slotIso = episode.scheduled_for || episode.posted_at || new Date().toISOString();
      const slotDate = new Date(slotIso);
      const row = {
        episode_id: episode.id,
        platform: normalizePlatform(episode.platform),
        time_slot: slotIso,
        day_of_week: slotDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
        hour_local: slotDate.getUTCHours(),
        channel: normalizeChannel(episode.channel),
        content_type: episode.primary_spice || episode.content_type || null,
        likes: Number(episode.engagement_likes ?? 0),
        replies: Number(episode.engagement_replies ?? 0),
        reposts: Number(episode.engagement_reposts ?? 0),
        clicks: Number(episode.engagement_clicks ?? 0),
        cross_ref_clicks: Number(episode.engagement_cross_ref_clicks ?? 0),
        beacon_creates: Number(episode.engagement_beacon_creates ?? 0),
        collected_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("distribution_analytics")
        .upsert(row, { onConflict: "episode_id,platform,time_slot" });
      if (upsertError) throw new Error(upsertError.message);
      upserted += 1;
    }

    const { data: aggregateRows, error: aggregateError } = await supabase
      .from("distribution_analytics")
      .select("platform, channel, content_type, day_of_week, hour_local, likes, replies, reposts, clicks, cross_ref_clicks, beacon_creates")
      .gte("collected_at", start);
    if (aggregateError) throw new Error(aggregateError.message);

    const best = bestTuple(aggregateRows ?? []);

    return responseOk({
      success: true,
      days_back: daysBack,
      episodes_processed: episodes.length,
      rows_upserted: upserted,
      best_performing_tuple: best,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function normalizePlatform(value: string | null) {
  const v = (value ?? "twitter").toLowerCase();
  return v === "x" ? "twitter" : v;
}

function normalizeChannel(value: string | null) {
  const v = (value ?? "bst").toLowerCase();
  if (v === "bst" || v === "spoonfuls" || v === "skipping_stones") return v;
  return "bst";
}

function bestTuple(rows: Array<Record<string, unknown>>) {
  const map = new Map<string, { score: number; platform: string; channel: string; content_type: string; slot: string }>();
  for (const row of rows) {
    const platform = String(row.platform ?? "twitter");
    const channel = String(row.channel ?? "bst");
    const contentType = String(row.content_type ?? "untyped");
    const slot = `${row.day_of_week ?? "Unknown"}@${row.hour_local ?? 0}`;
    const key = `${platform}|${channel}|${contentType}|${slot}`;
    const score = Number(row.likes ?? 0) +
      Number(row.replies ?? 0) +
      Number(row.reposts ?? 0) +
      Number(row.clicks ?? 0) +
      Number(row.cross_ref_clicks ?? 0) +
      Number(row.beacon_creates ?? 0);
    const existing = map.get(key);
    if (existing) {
      existing.score += score;
      continue;
    }
    map.set(key, { score, platform, channel, content_type: contentType, slot });
  }

  let winner: { score: number; platform: string; channel: string; content_type: string; slot: string } | null = null;
  for (const item of map.values()) {
    if (!winner || item.score > winner.score) winner = item;
  }
  return winner;
}

function responseOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
