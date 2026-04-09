import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EngagementCounts = {
  likes: number;
  replies: number;
  reposts: number;
  simulated?: boolean;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: chapter } = await supabase
      .from("crewman_chapters")
      .select("*")
      .eq("status", "streaming")
      .order("chapter_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!chapter) {
      return responseOk({
        success: true,
        status: "idle",
        note: "No streaming chapter found.",
      });
    }

    const { data: postedEpisodes, error: postedError } = await supabase
      .from("crewman_episodes")
      .select("*")
      .eq("chapter_id", chapter.id)
      .eq("status", "posted")
      .order("sequence_number", { ascending: true });

    if (postedError) {
      throw new Error(postedError.message);
    }

    const updateResults: Array<{ episode_id: string; simulated: boolean }> = [];
    for (const episode of postedEpisodes ?? []) {
      const counts = await getEngagementForEpisode({
        supabase,
        platform: episode.platform,
        platformPostId: episode.platform_post_id,
      });

      await supabase
        .from("crewman_episodes")
        .update({
          engagement_likes: counts.likes,
          engagement_replies: counts.replies,
          engagement_reposts: counts.reposts,
        })
        .eq("id", episode.id);

      updateResults.push({ episode_id: episode.id, simulated: !!counts.simulated });
    }

    const { data: refreshedEpisodes } = await supabase
      .from("crewman_episodes")
      .select("engagement_likes, engagement_replies, engagement_reposts")
      .eq("chapter_id", chapter.id);

    const totalEngagement = (refreshedEpisodes ?? []).reduce((sum, episode) => {
      return sum +
        (episode.engagement_likes ?? 0) +
        (episode.engagement_replies ?? 0) +
        (episode.engagement_reposts ?? 0);
    }, 0);

    await supabase
      .from("crewman_chapters")
      .update({ current_engagement: totalEngagement })
      .eq("id", chapter.id);

    let publicationTriggered = false;
    let nextChapterStarted = false;

    if (totalEngagement >= chapter.vote_threshold && chapter.status === "streaming") {
      publicationTriggered = true;

      await supabase
        .from("crewman_chapters")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          current_engagement: totalEngagement,
        })
        .eq("id", chapter.id);

      if (chapter.cephas_content_key) {
        await supabase
          .from("helm_content_queue")
          .update({ status: "published", approved_at: new Date().toISOString() })
          .eq("slug", chapter.cephas_content_key);
      }

      const { data: nextChapter } = await supabase
        .from("crewman_chapters")
        .select("id")
        .eq("status", "staged")
        .gt("chapter_number", chapter.chapter_number)
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextChapter?.id) {
        await supabase
          .from("crewman_chapters")
          .update({
            status: "streaming",
            stream_started_at: new Date().toISOString(),
          })
          .eq("id", nextChapter.id);
        nextChapterStarted = true;
      }
    }

    return responseOk({
      success: true,
      chapter_id: chapter.id,
      chapter_number: chapter.chapter_number,
      current_engagement: totalEngagement,
      vote_threshold: chapter.vote_threshold,
      publication_triggered: publicationTriggered,
      next_chapter_started: nextChapterStarted,
      episodes_checked: updateResults.length,
      updates: updateResults,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function getEngagementForEpisode({
  supabase,
  platform,
  platformPostId,
}: {
  supabase: any;
  platform: string;
  platformPostId: string | null;
}): Promise<EngagementCounts> {
  const normalized = platform === "x" ? "twitter" : platform;

  if (!platformPostId) {
    return { likes: 0, replies: 0, reposts: 0, simulated: true };
  }

  if (normalized !== "twitter") {
    return simulatedCounts(platformPostId);
  }

  const socialAccount = await getTwitterAccount(supabase);
  const token = socialAccount?.access_token
    || Deno.env.get("CREWMAN_TWITTER_BEARER")
    || Deno.env.get("TWITTER_BEARER_TOKEN")
    || Deno.env.get("TWITTER_ACCESS_TOKEN");
  if (!token || platformPostId.startsWith("sim_")) {
    return simulatedCounts(platformPostId);
  }

  const tweetId = extractTweetId(platformPostId);
  const response = await fetch(
    `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 403 && text.toLowerCase().includes("unsupported authentication")) {
      return simulatedCounts(platformPostId);
    }
    throw new Error(`Twitter engagement lookup failed (${response.status}): ${text}`);
  }

  const json = await response.json();
  const metrics = json?.data?.public_metrics;

  return {
    likes: Number(metrics?.like_count ?? 0),
    replies: Number(metrics?.reply_count ?? 0),
    reposts: Number(metrics?.retweet_count ?? 0),
  };
}

function extractTweetId(platformPostId: string): string {
  if (platformPostId.includes("/")) {
    const pieces = platformPostId.split("/");
    return pieces[pieces.length - 1];
  }
  return platformPostId;
}

function simulatedCounts(seed: string): EngagementCounts {
  const base = Math.abs(hashCode(seed));
  return {
    likes: base % 37,
    replies: base % 11,
    reposts: base % 7,
    simulated: true,
  };
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function responseOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getTwitterAccount(supabase: any) {
  const { data } = await supabase
    .from("member_social_accounts")
    .select("access_token, is_default, last_used_at")
    .eq("platform", "twitter")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .limit(1);

  return data?.[0] ?? null;
}
