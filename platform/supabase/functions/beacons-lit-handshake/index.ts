// BP098 M43 -- beacons-lit-handshake edge function
// Writes bonfire_lit_state handshake row and patches peer_presence.capabilities
// with beacons_lit_active: true. Called by Mnemosyne Electron app on startup
// and on 5-min heartbeat. Uses service role for bonfire_lit_state writes (RLS gate).
//
// POST /functions/v1/beacons-lit-handshake
// Body: { peer_id: string, context_type?: string, sync_status?: string }
// Auth: Authorization: Bearer <LB_access_token> (recommended) or anon
//
// Response 200: { ok: true, peer_id, bonfire_lit_state_id }
// Response 400: { ok: false, error: string }
// Response 500: { ok: false, error: string }
//
// PHANTOM EXCLUSION: peer_id starting with '49f3e597' is silently no-op'd.
//
// Authored: 2026-06-28 -- Knight BP098 M43

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PHANTOM_PREFIX = "49f3e597";

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
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
    peer_id,
    context_type = "priming",
    sync_status = "ok",
    app_version,
  } = (body as Record<string, string>) ?? {};

  if (!peer_id || typeof peer_id !== "string") {
    return json({ ok: false, error: "peer_id is required" }, 400);
  }

  // Phantom exclusion -- silent no-op per BP098 spec
  if (peer_id.startsWith(PHANTOM_PREFIX)) {
    console.log("[beacons-lit-handshake] phantom peer excluded:", peer_id);
    return json({ ok: true, peer_id, phantom: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "[beacons-lit-handshake] missing env vars",
    );
    return json({ ok: false, error: "server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date().toISOString();

  // 1. Upsert bonfire_lit_state (service role bypasses RLS gate)
  const { data: stateData, error: stateError } = await supabase
    .from("bonfire_lit_state")
    .upsert(
      {
        peer_id,
        context_type,
        last_sync_at: now,
        sync_status,
        updated_at: now,
      },
      { onConflict: "peer_id,context_type" },
    )
    .select("id")
    .single();

  if (stateError) {
    console.error(
      "[beacons-lit-handshake] bonfire_lit_state upsert failed:",
      stateError.message,
    );
    return json(
      {
        ok: false,
        error: "bonfire_lit_state write failed: " + stateError.message,
      },
      500,
    );
  }

  // 2. Patch peer_presence.capabilities with beacons_lit_active: true
  // Strategy: fetch existing row, merge capabilities, upsert.
  // Preserves all existing capability fields (version, platform, etc.).
  const { data: existingPresence } = await supabase
    .from("peer_presence")
    .select("capabilities")
    .eq("peer_id", peer_id)
    .maybeSingle();

  const existingCaps =
    (existingPresence?.capabilities as Record<string, unknown>) ?? {};
  const mergedCaps: Record<string, unknown> = {
    ...existingCaps,
    beacons_lit_active: true,
  };
  if (app_version) mergedCaps.app_version = app_version;

  const { error: presenceError } = await supabase
    .from("peer_presence")
    .upsert(
      {
        peer_id,
        capabilities: mergedCaps,
        last_seen_at: now,
      },
      { onConflict: "peer_id" },
    );

  if (presenceError) {
    // Non-fatal: log only. bonfire_lit_state write succeeded.
    // peer_presence is also updated by wan-relay-publish on the normal heartbeat cycle.
    console.warn(
      "[beacons-lit-handshake] peer_presence patch warning:",
      presenceError.message,
    );
  }

  console.log(
    `[beacons-lit-handshake] OK peer=${peer_id} ctx=${context_type} status=${sync_status} state_id=${stateData?.id}`,
  );

  return json({
    ok: true,
    peer_id,
    context_type,
    sync_status,
    bonfire_lit_state_id: stateData?.id ?? null,
    beacons_lit_active: true,
    ts: now,
  });
});
