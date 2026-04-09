import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ExportBody = {
  period_start?: string;
  period_end?: string;
};

type DistributionRow = {
  platform: string;
  channel: string;
  content_type: string | null;
  hour_local: number;
  likes: number;
  replies: number;
  reposts: number;
  clicks: number;
  cross_ref_clicks: number;
  beacon_creates: number;
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

    const body = (await req.json().catch(() => ({}))) as ExportBody;
    const now = new Date();
    const defaultStart = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const periodStart = safeDate(body.period_start) ?? defaultStart;
    const periodEnd = safeDate(body.period_end) ?? now;

    const { data: analyticsRows, error: analyticsError } = await supabase
      .from("distribution_analytics")
      .select("platform, channel, content_type, hour_local, likes, replies, reposts, clicks, cross_ref_clicks, beacon_creates")
      .gte("time_slot", periodStart.toISOString())
      .lte("time_slot", periodEnd.toISOString());
    if (analyticsError) throw new Error(analyticsError.message);

    const rows = (analyticsRows ?? []) as DistributionRow[];
    const topSpiceByPlatform = getTopSpiceByPlatform(rows);
    const bestTimeSlotByPlatform = getBestTimeSlotByPlatform(rows);
    const crossRefRate = getCrossRefConversionRate(rows);

    const { data: chapters, error: chaptersError } = await supabase
      .from("crewman_chapters")
      .select("chapter_number, current_engagement, vote_threshold")
      .in("status", ["staged", "streaming", "published"]);
    if (chaptersError) throw new Error(chaptersError.message);

    const voteGateProgress: Record<string, string> = {};
    for (const chapter of chapters ?? []) {
      const current = Number(chapter.current_engagement ?? 0);
      const threshold = Math.max(1, Number(chapter.vote_threshold ?? 1));
      const pct = Math.min(999, Math.round((current / threshold) * 100));
      voteGateProgress[`chapter_${chapter.chapter_number}`] = `${pct}%`;
    }

    const { data: funnelRows, error: funnelError } = await supabase
      .from("opening_gambit_funnel_events")
      .select("event_type")
      .gte("created_at", periodStart.toISOString())
      .lte("created_at", periodEnd.toISOString());
    if (funnelError) throw new Error(funnelError.message);

    const funnel = summarizeFunnel(funnelRows ?? []);
    const narrativeSummary = buildNarrative({
      topSpiceByPlatform,
      bestTimeSlotByPlatform,
      crossRefRate,
      funnel,
    });

    return responseOk({
      period: `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`,
      top_spice_by_channel: topSpiceByPlatform,
      best_time_slot: bestTimeSlotByPlatform,
      cross_ref_conversion_rate: crossRefRate,
      vote_gate_progress: voteGateProgress,
      letter_to_viewer_to_member_funnel: funnel,
      viewing_schedule_url: "https://lianabanyan.com/crewman/viewing-schedule",
      narrative_summary: narrativeSummary,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function safeDate(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function score(row: DistributionRow) {
  return row.likes + row.replies + row.reposts + row.clicks + row.cross_ref_clicks + row.beacon_creates;
}

function getTopSpiceByPlatform(rows: DistributionRow[]) {
  const platformSpiceScores = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const platform = normalizePlatform(row.platform);
    const spice = (row.content_type || "untyped").toLowerCase();
    if (!platformSpiceScores.has(platform)) {
      platformSpiceScores.set(platform, new Map<string, number>());
    }
    const spiceMap = platformSpiceScores.get(platform)!;
    spiceMap.set(spice, (spiceMap.get(spice) ?? 0) + score(row));
  }

  const output: Record<string, string> = {};
  for (const [platform, spiceMap] of platformSpiceScores.entries()) {
    let winner = "untyped";
    let best = -1;
    for (const [spice, spiceScore] of spiceMap.entries()) {
      if (spiceScore > best) {
        best = spiceScore;
        winner = spice;
      }
    }
    output[platform] = winner;
  }
  return output;
}

function getBestTimeSlotByPlatform(rows: DistributionRow[]) {
  const map = new Map<string, Map<number, number>>();
  for (const row of rows) {
    const platform = normalizePlatform(row.platform);
    if (!map.has(platform)) map.set(platform, new Map<number, number>());
    const hourMap = map.get(platform)!;
    hourMap.set(row.hour_local, (hourMap.get(row.hour_local) ?? 0) + score(row));
  }

  const output: Record<string, string> = {};
  for (const [platform, hourMap] of map.entries()) {
    let bestHour = 0;
    let bestScore = -1;
    for (const [hour, total] of hourMap.entries()) {
      if (total > bestScore) {
        bestScore = total;
        bestHour = hour;
      }
    }
    output[platform] = formatHour(bestHour);
  }
  return output;
}

function getCrossRefConversionRate(rows: DistributionRow[]) {
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks ?? 0), 0);
  if (clicks === 0) return 0;
  const crossRefClicks = rows.reduce((sum, row) => sum + Number(row.cross_ref_clicks ?? 0), 0);
  return Number((crossRefClicks / clicks).toFixed(4));
}

function summarizeFunnel(rows: Array<{ event_type?: string }>) {
  const summary = {
    letter_open: 0,
    viewing_schedule_visit: 0,
    series_engagement: 0,
    member_conversion: 0,
    conversion_rate_from_visit: 0,
  };

  for (const row of rows) {
    const eventType = row.event_type ?? "";
    if (eventType === "letter_open") summary.letter_open += 1;
    if (eventType === "viewing_schedule_visit") summary.viewing_schedule_visit += 1;
    if (eventType === "series_engagement") summary.series_engagement += 1;
    if (eventType === "member_conversion") summary.member_conversion += 1;
  }

  if (summary.viewing_schedule_visit > 0) {
    summary.conversion_rate_from_visit = Number(
      (summary.member_conversion / summary.viewing_schedule_visit).toFixed(4),
    );
  }

  return summary;
}

function normalizePlatform(value: string) {
  const v = (value || "twitter").toLowerCase();
  return v === "x" ? "twitter" : v;
}

function formatHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "pm" : "am";
  const twelve = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${twelve}${suffix}`;
}

function buildNarrative(input: {
  topSpiceByPlatform: Record<string, string>;
  bestTimeSlotByPlatform: Record<string, string>;
  crossRefRate: number;
  funnel: {
    letter_open: number;
    viewing_schedule_visit: number;
    series_engagement: number;
    member_conversion: number;
    conversion_rate_from_visit: number;
  };
}) {
  const samplePlatform = Object.keys(input.topSpiceByPlatform)[0] ?? "twitter";
  const spice = input.topSpiceByPlatform[samplePlatform] ?? "untyped";
  const slot = input.bestTimeSlotByPlatform[samplePlatform] ?? "midday";
  return `${samplePlatform} favored ${spice} content around ${slot}, with cross-reference conversion at ${(input.crossRefRate * 100).toFixed(1)}%. Opening Gambit funnel moved ${input.funnel.viewing_schedule_visit} viewing-schedule visits and ${input.funnel.member_conversion} member conversions in the sampled period.`;
}

function responseOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
