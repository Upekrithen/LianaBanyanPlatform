import { corsHeaders, runPollingJob } from "../_shared/engagementIngestion.ts";

type XPublicMetrics = {
  like_count?: number;
  reply_count?: number;
  retweet_count?: number;
  quote_count?: number;
  impression_count?: number;
  bookmark_count?: number;
};

async function fetchXMetrics(platformPostId: string) {
  const bearer = Deno.env.get("X_BEARER_TOKEN") || Deno.env.get("TWITTER_BEARER_TOKEN");
  if (!bearer) return null;

  const url = `https://api.twitter.com/2/tweets/${encodeURIComponent(platformPostId)}?tweet.fields=public_metrics`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!response.ok) return null;

  const json = await response.json();
  const metrics = (json?.data?.public_metrics ?? {}) as XPublicMetrics;
  return {
    like: metrics.like_count ?? 0,
    comment: metrics.reply_count ?? 0,
    share: (metrics.retweet_count ?? 0) + (metrics.quote_count ?? 0),
    save: metrics.bookmark_count ?? 0,
    view: metrics.impression_count ?? 0,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await runPollingJob({
      workerName: "poll-x-engagement",
      platform: "x",
      fetchMetrics: fetchXMetrics,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
