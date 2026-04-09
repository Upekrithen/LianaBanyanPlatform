import { corsHeaders, runPollingJob } from "../_shared/engagementIngestion.ts";

type LinkedInMetrics = {
  likesSummary?: { totalLikes?: number };
  commentsSummary?: { totalComments?: number };
  sharesSummary?: { totalShares?: number };
  totalShareStatistics?: {
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    impressionCount?: number;
  };
};

async function fetchLinkedInMetrics(platformPostId: string) {
  const token = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  if (!token) return null;

  const actionUrn = `urn:li:share:${platformPostId}`;
  const url = `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(actionUrn)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });
  if (!response.ok) return null;

  const json = (await response.json()) as LinkedInMetrics;
  const summary = json.totalShareStatistics ?? {};
  return {
    like: json.likesSummary?.totalLikes ?? summary.likeCount ?? 0,
    comment: json.commentsSummary?.totalComments ?? summary.commentCount ?? 0,
    share: json.sharesSummary?.totalShares ?? summary.shareCount ?? 0,
    save: 0,
    view: summary.impressionCount ?? 0,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await runPollingJob({
      workerName: "poll-linkedin-engagement",
      platform: "linkedin",
      fetchMetrics: fetchLinkedInMetrics,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
