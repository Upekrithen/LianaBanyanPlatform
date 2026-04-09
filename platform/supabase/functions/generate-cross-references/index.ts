import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GridPost = {
  id: string;
  channel: "bst" | "spoonfuls" | "skipping_stones";
  scheduled_for: string | null;
  content: string;
  content_type: string | null;
};

type GeneratorPayload = {
  date?: string;
  channels?: string[];
  slot_window_minutes?: number;
};

const SERIES_LABEL: Record<GridPost["channel"], string> = {
  bst: "BST",
  spoonfuls: "Spoonfuls",
  skipping_stones: "Skipping Stones",
};

const SERIES_TAG: Record<GridPost["channel"], string> = {
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = (await req.json().catch(() => ({}))) as GeneratorPayload;
    const dateString = (body.date ?? todayDate()).trim();
    const channels = (body.channels ?? []).map((item) => item.toLowerCase());
    const slotWindowMinutes = Number(body.slot_window_minutes ?? 90);

    const start = new Date(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      return new Response(JSON.stringify({ error: "Invalid date; expected YYYY-MM-DD" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const end = new Date(start.getTime() + (24 * 60 * 60 * 1000));

    const { data, error } = await supabase
      .from("crewman_episodes")
      .select("id, channel, scheduled_for, content, content_type")
      .gte("scheduled_for", start.toISOString())
      .lt("scheduled_for", end.toISOString())
      .eq("status", "queued")
      .not("scheduled_for", "is", null)
      .order("scheduled_for", { ascending: true });

    if (error) throw new Error(error.message);

    const posts = ((data ?? []) as GridPost[]).filter((post) => {
      if (!channels.length) return true;
      const assigned = getAssignedPlatform(post);
      return assigned ? channels.includes(assigned) : false;
    });

    const updates: Array<{ id: string; cross_ref_post_id: string; cross_ref_text: string }> = [];
    for (const source of posts) {
      const target = findBestTarget(source, posts, slotWindowMinutes);
      if (!target) continue;

      const text = buildCrossRefText(source, target);
      updates.push({
        id: source.id,
        cross_ref_post_id: target.id,
        cross_ref_text: text,
      });
    }

    for (const row of updates) {
      const { error: updateError } = await supabase
        .from("crewman_episodes")
        .update({
          cross_ref_post_id: row.cross_ref_post_id,
          cross_ref_text: row.cross_ref_text,
        })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: dateString,
        posts_considered: posts.length,
        pairings_generated: updates.length,
        pairings: updates,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
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

function findBestTarget(source: GridPost, allPosts: GridPost[], slotWindowMinutes: number) {
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

function buildCrossRefText(source: GridPost, target: GridPost) {
  const sourceSeries = SERIES_LABEL[source.channel];
  const targetSeries = SERIES_LABEL[target.channel];
  const sourcePlatform = titleCasePlatform(getAssignedPlatform(source) ?? "channel");
  const targetPlatform = titleCasePlatform(getAssignedPlatform(target) ?? "channel");
  const hook = truncateHook(target.content);

  return `Following ${sourceSeries} on ${sourcePlatform}? Today's ${targetSeries} on ${targetPlatform}: ${hook} ${SERIES_TAG[target.channel]}`;
}

function getAssignedPlatform(post: Pick<GridPost, "content_type">) {
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
