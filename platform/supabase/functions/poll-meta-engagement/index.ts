import { corsHeaders, runPollingJob } from "../_shared/engagementIngestion.ts";

type MetaMetrics = {
  reactions?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
  shares?: { count?: number };
  insights?: {
    data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
  };
  like_count?: number;
};

async function fetchMetaMetrics(platformPostId: string) {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  if (!token) return null;

  const fields = [
    "reactions.summary(true)",
    "comments.summary(true)",
    "shares",
    "insights.metric(post_impressions)",
    "like_count",
  ].join(",");
  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(platformPostId)}?fields=${fields}&access_token=${encodeURIComponent(token)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const json = (await response.json()) as MetaMetrics;
  const impressions = json.insights?.data?.find((entry) => entry.name === "post_impressions")?.values?.[0]?.value ?? 0;
  return {
    like: json.reactions?.summary?.total_count ?? json.like_count ?? 0,
    comment: json.comments?.summary?.total_count ?? 0,
    share: json.shares?.count ?? 0,
    save: 0,
    view: impressions,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await runPollingJob({
      workerName: "poll-meta-engagement",
      platform: ["facebook", "instagram"],
      fetchMetrics: fetchMetaMetrics,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
