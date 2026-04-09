import { corsHeaders, ingestWebhookPayload } from "../_shared/engagementIngestion.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const platformHint = req.headers.get("x-platform")?.toLowerCase();
    const platform = platformHint === "instagram" ? "instagram" : "facebook";
    return await ingestWebhookPayload({
      req,
      platform,
      workerName: "webhook-meta-engagement",
      secretEnvKey: "META_WEBHOOK_SECRET",
      signatureHeader: "x-hub-signature-256",
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
