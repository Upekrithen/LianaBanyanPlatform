/**
 * verify-mnemosynec-checkout — BP084 Join Flow Collapse
 * ======================================================
 * Public endpoint (verify_jwt = false).
 * Called client-side after Stripe redirects back to the gate page.
 *
 * Input:  POST { session_id: string }
 * Output: { success: boolean, intent?: string }
 *
 * On success, the client stores session_id as member_token in localStorage,
 * closes the modal, and reveals the gated content.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return json({ error: "Not configured" }, 500);

  let sessionId = "";
  try {
    const body = await req.json();
    sessionId = body.session_id || "";
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return json({ error: "Invalid session_id" }, 400);
  }

  // Retrieve session from Stripe
  const stripeResp = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { "Authorization": `Basic ${btoa(stripeKey + ":")}` } },
  );

  const session = await stripeResp.json();
  console.log(`[verify-mnemosynec] session=${sessionId} payment_status=${session.payment_status}`);

  if (!stripeResp.ok) {
    return json({ error: session.error?.message || "Session lookup failed", success: false }, 400);
  }

  const paid = session.payment_status === "paid";

  // Best-effort: write member row to mnemosynec_members if paid
  if (paid) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      try {
        const adminClient = createClient(supabaseUrl, serviceKey);
        await adminClient.from("mnemosynec_members").upsert({
          stripe_session_id: sessionId,
          email: session.customer_email || session.customer_details?.email || null,
          intent: session.metadata?.intent || "other",
          joined_at: new Date().toISOString(),
        }, { onConflict: "stripe_session_id" });
        console.log(`[verify-mnemosynec] member row written for session=${sessionId}`);
      } catch (e) {
        // Non-fatal — table may not exist yet. Gate still unlocks client-side.
        console.warn("[verify-mnemosynec] member row write failed (non-fatal):", e);
      }
    }
  }

  return json({
    success: paid,
    intent: session.metadata?.intent || "other",
  });
});
