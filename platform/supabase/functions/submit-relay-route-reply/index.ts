// submit-relay-route-reply — BP099 K13
// Accepts relay inference answers from peers and writes to relay_route_replies.
// Marks the originating relay_routes row as answered.
//
// POST /functions/v1/submit-relay-route-reply
// Body: { route_id: string, peer_id: string, answer_json: object, processing_ms: number }
//
// Response 200: { ok: true, reply_id: string }
// Response 400: { ok: false, error: string }
// Response 409: { ok: false, error: string }
// Response 500: { ok: false, error: string }
//
// PHANTOM EXCLUSION: peer_id starting with '49f3e597' → 400.
// Schema note: relay_routes has no answered_at column (verified 2026-06-28 migration audit).
//
// Authored: 2026-06-28 — Knight BP099 K13

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PHANTOM_PREFIX = "49f3e597";

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid JSON body" }, 400);
  }

  const {
    route_id,
    peer_id,
    answer_json,
    processing_ms,
  } = (body as Record<string, unknown>) ?? {};

  if (
    !route_id || typeof route_id !== "string" ||
    !peer_id || typeof peer_id !== "string" ||
    answer_json === undefined || answer_json === null ||
    processing_ms === undefined || processing_ms === null
  ) {
    return json(
      { ok: false, error: "route_id, peer_id, answer_json, and processing_ms are required" },
      400,
    );
  }

  if (peer_id.startsWith(PHANTOM_PREFIX)) {
    console.log("[submit-relay-route-reply] phantom peer excluded:", peer_id);
    return json({ ok: false, error: "phantom peer excluded" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("[submit-relay-route-reply] missing env vars");
    return json({ ok: false, error: "server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Verify peer is active in peer_presence
  const { data: presenceRow, error: presenceError } = await supabase
    .from("peer_presence")
    .select("id")
    .eq("peer_id", peer_id)
    .limit(1)
    .maybeSingle();

  if (presenceError) {
    console.error("[submit-relay-route-reply] peer_presence lookup error:", presenceError.message);
    return json({ ok: false, error: "peer presence lookup failed: " + presenceError.message }, 500);
  }

  if (!presenceRow) {
    return json({ ok: false, error: "unknown peer" }, 400);
  }

  // 2. Verify route exists, is pending, and targets this peer
  const { data: route, error: routeError } = await supabase
    .from("relay_routes")
    .select("id, status, target_peer_id")
    .eq("id", route_id)
    .limit(1)
    .maybeSingle();

  if (routeError) {
    console.error("[submit-relay-route-reply] relay_routes lookup error:", routeError.message);
    return json({ ok: false, error: "route lookup failed: " + routeError.message }, 500);
  }

  if (!route) {
    return json({ ok: false, error: "route not found" }, 400);
  }

  if (route.status !== "pending") {
    return json({ ok: false, error: "route already answered" }, 409);
  }

  if (route.target_peer_id !== peer_id) {
    return json({ ok: false, error: "peer_id mismatch" }, 400);
  }

  // 3. INSERT reply row
  const { data: replyData, error: replyError } = await supabase
    .from("relay_route_replies")
    .insert({
      route_id,
      peer_id,
      answer_json,
      processing_ms,
    })
    .select("id")
    .single();

  if (replyError) {
    console.error("[submit-relay-route-reply] reply insert error:", replyError.message);
    return json({ ok: false, error: "reply insert failed: " + replyError.message }, 500);
  }

  // 4. Mark route answered
  // Note: relay_routes has no answered_at column (schema audit 2026-06-28)
  const { error: updateError } = await supabase
    .from("relay_routes")
    .update({ status: "answered" })
    .eq("id", route_id);

  if (updateError) {
    console.error("[submit-relay-route-reply] route update error:", updateError.message);
    // Non-fatal: reply was written; log and continue
    console.warn("[submit-relay-route-reply] WARNING: reply written but route status not updated for route", route_id);
  }

  console.log(
    `[submit-relay-route-reply] OK route=${route_id.slice(0, 8)} peer=${peer_id.slice(0, 8)} reply=${replyData.id.slice(0, 8)} processing_ms=${processing_ms}`,
  );

  return json({ ok: true, reply_id: replyData.id });
});
