import { corsHeaders, runPollingJob } from "../_shared/engagementIngestion.ts";

type ThreadsMetrics = {
  like_count?: number;
  likes?: number;
  comments_count?: number;
  replies_count?: number;
  reposts_count?: number;
  shares?: number;
  views?: number;
  impressions?: number;
};

async function fetchThreadsMetrics(platformPostId: string) {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  if (!token) return null;

  const fields = [
    "like_count",
    "likes",
    "comments_count",
    "replies_count",
    "reposts_count",
    "shares",
    "views",
    "impressions",
  ].join(",");
  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(platformPostId)}?fields=${fields}&access_token=${encodeURIComponent(token)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const json = (await response.json()) as ThreadsMetrics;
  return {
    like: json.like_count ?? json.likes ?? 0,
    comment: json.comments_count ?? json.replies_count ?? 0,
    share: json.reposts_count ?? json.shares ?? 0,
    save: 0,
    view: json.views ?? json.impressions ?? 0,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await runPollingJob({
      workerName: "poll-threads-engagement",
      platform: "threads",
      fetchMetrics: fetchThreadsMetrics,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
