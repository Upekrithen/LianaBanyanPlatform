import { corsHeaders, ingestWebhookPayload } from "../_shared/engagementIngestion.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await ingestWebhookPayload({
      req,
      platform: "threads",
      workerName: "webhook-threads-engagement",
      secretEnvKey: "THREADS_WEBHOOK_SECRET",
      signatureHeader: "x-lb-signature",
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
