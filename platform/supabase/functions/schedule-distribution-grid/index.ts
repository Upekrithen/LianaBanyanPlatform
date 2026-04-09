import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SeriesKey = "bst" | "spoonfuls" | "skipping_stones";

type Episode = {
  id: string;
  chapter_id: string;
  sequence_number: number;
  channel: SeriesKey;
  content: string;
  status: string;
  scheduled_for: string | null;
};

type SchedulerPayload = {
  date?: string;
  channels?: string[];
  slots_per_day?: number;
  series_mix?: Partial<Record<SeriesKey, number>>;
};

type Assignment = {
  episode_id: string;
  series: SeriesKey;
  channel: string;
  scheduled_for: string;
  slot_index: number;
  content_type: string;
};

const DEFAULT_CHANNELS = ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"];
const DEFAULT_SERIES_MIX: Record<SeriesKey, number> = {
  bst: 1,
  spoonfuls: 2,
  skipping_stones: 1,
};

const PEAK_HOURS_UTC: Record<string, number[]> = {
  twitter: [14, 16, 18, 20, 22, 0],
  linkedin: [13, 15, 17, 19, 21, 23],
  threads: [14, 16, 18, 20, 22, 0],
  bluesky: [15, 17, 19, 21, 23, 1],
  instagram: [16, 18, 20, 22, 0, 2],
  facebook: [15, 17, 19, 21, 23, 1],
};

const SERIES_LABEL: Record<SeriesKey, string> = {
  bst: "BST",
  spoonfuls: "Spoonfuls",
  skipping_stones: "Skipping Stones",
};

const SERIES_TAG: Record<SeriesKey, string> = {
  bst: "#BST",
  spoonfuls: "#Spoonfuls",
  skipping_stones: "#SkippingStones",
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
    const body = (await req.json().catch(() => ({}))) as SchedulerPayload;
    const dateString = (body.date ?? todayDate()).trim();
    const slotsPerDay = Math.max(1, Number(body.slots_per_day ?? 6));
    const channels = normalizeChannels(body.channels);
    const seriesMix = normalizeSeriesMix(body.series_mix);

    const dayStart = new Date(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(dayStart.getTime())) {
      return errorResponse("Invalid date; expected YYYY-MM-DD", 400);
    }
    const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("crewman_episodes")
      .select("id, chapter_id, sequence_number, channel, content, status, scheduled_for")
      .eq("status", "queued")
      .is("scheduled_for", null)
      .in("channel", Object.keys(seriesMix))
      .order("chapter_id", { ascending: true })
      .order("sequence_number", { ascending: true });

    if (error) throw new Error(error.message);

    const grouped = groupBySeries((data ?? []) as Episode[]);
    const totalNeeded = channels.length * slotsPerDay;
    if (!hasEnoughEpisodes(grouped, totalNeeded)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Not enough unscheduled episodes to fill requested grid",
          requested_slots: totalNeeded,
          available_by_series: countRemaining(grouped),
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const assignments = buildAssignments({
      dayStart,
      slotsPerDay,
      channels,
      seriesMix,
      grouped,
    });

    for (const assignment of assignments) {
      const { error: updateError } = await supabase
        .from("crewman_episodes")
        .update({
          scheduled_for: assignment.scheduled_for,
          content_type: assignment.content_type,
        })
        .eq("id", assignment.episode_id);
      if (updateError) throw new Error(updateError.message);
    }

    const scheduledPosts = await loadScheduledPostsForDay(supabase, dayStart, dayEnd, channels);
    const pairings = await applyCrossReferences(supabase, scheduledPosts);

    return new Response(
      JSON.stringify({
        success: true,
        date: dateString,
        channels,
        slots_per_day: slotsPerDay,
        assignments_count: assignments.length,
        pairings_count: pairings.length,
        grid: assignments,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Unknown error");
  }
});

function buildAssignments({
  dayStart,
  slotsPerDay,
  channels,
  seriesMix,
  grouped,
}: {
  dayStart: Date;
  slotsPerDay: number;
  channels: string[];
  seriesMix: Record<SeriesKey, number>;
  grouped: Record<SeriesKey, Episode[]>;
}) {
  const assignments: Assignment[] = [];
  const daySeed = dayStart.getUTCDate() + dayStart.getUTCMonth();
  const weightedSeries = buildWeightedSeries(seriesMix);
  let globalRotation = daySeed % weightedSeries.length;

  for (let slotIndex = 0; slotIndex < slotsPerDay; slotIndex += 1) {
    const usedInSlot = new Set<SeriesKey>();

    for (let channelIndex = 0; channelIndex < channels.length; channelIndex += 1) {
      const channel = channels[channelIndex];
      const preferredSeries = pickSeriesForCell({
        weightedSeries,
        grouped,
        usedInSlot,
        rotationSeed: globalRotation + channelIndex + (slotIndex * channels.length),
      });
      const episode = grouped[preferredSeries].shift();
      if (!episode) {
        throw new Error(`Series ${preferredSeries} ran out of episodes during scheduling`);
      }

      usedInSlot.add(preferredSeries);
      const scheduledFor = buildTimestamp({
        dayStart,
        channel,
        slotIndex,
      });
      assignments.push({
        episode_id: episode.id,
        series: preferredSeries,
        channel,
        scheduled_for: scheduledFor.toISOString(),
        slot_index: slotIndex,
        content_type: `platform:${channel}`,
      });
    }

    globalRotation += 1;
  }

  return assignments;
}

function pickSeriesForCell({
  weightedSeries,
  grouped,
  usedInSlot,
  rotationSeed,
}: {
  weightedSeries: SeriesKey[];
  grouped: Record<SeriesKey, Episode[]>;
  usedInSlot: Set<SeriesKey>;
  rotationSeed: number;
}): SeriesKey {
  for (let offset = 0; offset < weightedSeries.length; offset += 1) {
    const idx = (rotationSeed + offset) % weightedSeries.length;
    const candidate = weightedSeries[idx];
    if (grouped[candidate].length === 0) continue;
    if (!usedInSlot.has(candidate)) return candidate;
  }

  for (let offset = 0; offset < weightedSeries.length; offset += 1) {
    const idx = (rotationSeed + offset) % weightedSeries.length;
    const candidate = weightedSeries[idx];
    if (grouped[candidate].length > 0) return candidate;
  }

  return "bst";
}

function buildTimestamp({
  dayStart,
  channel,
  slotIndex,
}: {
  dayStart: Date;
  channel: string;
  slotIndex: number;
}) {
  const schedule = PEAK_HOURS_UTC[channel] ?? [14, 16, 18, 20, 22, 0];
  const hour = schedule[slotIndex % schedule.length];
  const date = new Date(dayStart.getTime());
  date.setUTCHours(hour, (slotIndex * 7) % 60, 0, 0);
  return date;
}

function groupBySeries(episodes: Episode[]) {
  const grouped: Record<SeriesKey, Episode[]> = {
    bst: [],
    spoonfuls: [],
    skipping_stones: [],
  };

  for (const episode of episodes) {
    if (episode.channel in grouped) {
      grouped[episode.channel].push(episode);
    }
  }

  return grouped;
}

function normalizeChannels(input?: string[]) {
  if (!Array.isArray(input) || input.length === 0) return DEFAULT_CHANNELS;
  return input.map((channel) => channel.trim().toLowerCase()).filter(Boolean);
}

function normalizeSeriesMix(
  input?: Partial<Record<SeriesKey, number>>,
): Record<SeriesKey, number> {
  const merged: Record<SeriesKey, number> = {
    bst: Number(input?.bst ?? DEFAULT_SERIES_MIX.bst),
    spoonfuls: Number(input?.spoonfuls ?? DEFAULT_SERIES_MIX.spoonfuls),
    skipping_stones: Number(input?.skipping_stones ?? DEFAULT_SERIES_MIX.skipping_stones),
  };

  for (const key of Object.keys(merged) as SeriesKey[]) {
    if (!Number.isFinite(merged[key]) || merged[key] <= 0) {
      merged[key] = 1;
    }
  }
  return merged;
}

function buildWeightedSeries(seriesMix: Record<SeriesKey, number>) {
  const weighted: SeriesKey[] = [];
  for (const series of Object.keys(seriesMix) as SeriesKey[]) {
    const qty = Math.max(1, Math.floor(seriesMix[series]));
    for (let i = 0; i < qty; i += 1) weighted.push(series);
  }
  return weighted;
}

function hasEnoughEpisodes(grouped: Record<SeriesKey, Episode[]>, needed: number) {
  const total = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);
  return total >= needed;
}

function countRemaining(grouped: Record<SeriesKey, Episode[]>) {
  return {
    bst: grouped.bst.length,
    spoonfuls: grouped.spoonfuls.length,
    skipping_stones: grouped.skipping_stones.length,
  };
}

async function loadScheduledPostsForDay(
  supabase: ReturnType<typeof createClient>,
  start: Date,
  end: Date,
  channels: string[],
) {
  const { data, error } = await supabase
    .from("crewman_episodes")
    .select("id, channel, scheduled_for, content, content_type")
    .gte("scheduled_for", start.toISOString())
    .lt("scheduled_for", end.toISOString())
    .eq("status", "queued")
    .not("scheduled_for", "is", null)
    .order("scheduled_for", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{
    id: string;
    channel: SeriesKey;
    scheduled_for: string | null;
    content: string;
    content_type: string | null;
  }>).filter((post) => {
    const assigned = getAssignedPlatform(post);
    return assigned ? channels.includes(assigned) : false;
  });
}

async function applyCrossReferences(
  supabase: ReturnType<typeof createClient>,
  posts: Array<{
    id: string;
    channel: SeriesKey;
    scheduled_for: string | null;
    content: string;
    content_type: string | null;
  }>,
) {
  const updates: Array<{ id: string; cross_ref_post_id: string; cross_ref_text: string }> = [];

  for (const source of posts) {
    const target = findBestTarget(source, posts, 90);
    if (!target) continue;

    updates.push({
      id: source.id,
      cross_ref_post_id: target.id,
      cross_ref_text: buildCrossRefText(source, target),
    });
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("crewman_episodes")
      .update({
        cross_ref_post_id: update.cross_ref_post_id,
        cross_ref_text: update.cross_ref_text,
      })
      .eq("id", update.id);
    if (error) throw new Error(error.message);
  }

  return updates;
}

function findBestTarget(
  source: {
    id: string;
    channel: SeriesKey;
    scheduled_for: string | null;
    content: string;
    content_type: string | null;
  },
  allPosts: Array<{
    id: string;
    channel: SeriesKey;
    scheduled_for: string | null;
    content: string;
    content_type: string | null;
  }>,
  slotWindowMinutes: number,
) {
  const sourceTime = toTimestamp(source.scheduled_for);
  if (!sourceTime) return null;
  const sourcePlatform = getAssignedPlatform(source);

  const candidates = allPosts.filter((candidate) => {
    if (candidate.id === source.id) return false;
    if (candidate.channel === source.channel) return false;

    const candidatePlatform = getAssignedPlatform(candidate);
    if (!candidatePlatform || !sourcePlatform) return false;
    if (candidatePlatform === sourcePlatform) return false;

    const candidateTime = toTimestamp(candidate.scheduled_for);
    if (!candidateTime) return false;

    const minuteDelta = Math.abs((candidateTime - sourceTime) / (1000 * 60));
    return minuteDelta > 0 && minuteDelta <= slotWindowMinutes;
  });

  if (!candidates.length) return null;

  return candidates.sort((a, b) => {
    const aDelta = Math.abs((toTimestamp(a.scheduled_for)! - sourceTime) / (1000 * 60));
    const bDelta = Math.abs((toTimestamp(b.scheduled_for)! - sourceTime) / (1000 * 60));
    return aDelta - bDelta;
  })[0];
}

function buildCrossRefText(
  source: { channel: SeriesKey; content_type: string | null },
  target: { channel: SeriesKey; content_type: string | null; content: string },
) {
  const sourceSeries = SERIES_LABEL[source.channel];
  const targetSeries = SERIES_LABEL[target.channel];
  const sourcePlatform = titleCasePlatform(getAssignedPlatform(source) ?? "channel");
  const targetPlatform = titleCasePlatform(getAssignedPlatform(target) ?? "channel");
  const hook = truncateHook(target.content);
  return `Following ${sourceSeries} on ${sourcePlatform}? Today's ${targetSeries} on ${targetPlatform}: ${hook} ${SERIES_TAG[target.channel]}`;
}

function getAssignedPlatform(post: { content_type: string | null }) {
  if (!post.content_type) return null;
  if (!post.content_type.startsWith("platform:")) return null;
  return post.content_type.slice("platform:".length).toLowerCase();
}

function truncateHook(content: string) {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (normalized.length <= 84) return normalized;
  return `${normalized.slice(0, 83).trimEnd()}...`;
}

function toTimestamp(value: string | null) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function titleCasePlatform(value: string) {
  if (value === "twitter") return "X";
  if (value === "bluesky") return "Bluesky";
  if (value === "linkedin") return "LinkedIn";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
