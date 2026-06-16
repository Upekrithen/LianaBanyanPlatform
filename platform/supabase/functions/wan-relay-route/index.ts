// BP084 · SEG-2 · wan-relay-route — NEW (2026-06-15)
// ============================================================
// Cross-NAT payload routing.  Relay sees only opaque ciphertext + target peer_id.
// Payloads are encrypted client-side with Thorax AES-256-GCM before submission.
//
// POST /functions/v1/wan-relay-route
//   Body: { payload_encrypted: string, target_peer_id: string }
//   → stores in wan_relay_routed, returns 202
//
// GET /functions/v1/wan-relay-route?peer_id=<id>
//   → long-polls (up to 28 s) for inbound payload addressed to this peer
//   → returns 200 { payload_encrypted } or 204 (timeout, no payload)
//
// --no-verify-jwt: peer_id is the auth token (intentionally anonymous).
//
// Rate limits (in-process per Deno isolate):
//   - 20 POSTs per peer_id per minute
//   - 60 GETs per peer_id per minute
//
// Authored: 2026-06-15 · Knight BP084 SEG-2
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ── CORS ─────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-wan-peer-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── In-process rate limiter ───────────────────────────────────
interface WindowEntry {
  count: number;
  resetAt: number;
}
const postWindows = new Map<string, WindowEntry>();
const getWindows = new Map<string, WindowEntry>();

function checkWindow(
  map: Map<string, WindowEntry>,
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now >= entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

// ── Peer ID validation ────────────────────────────────────────
function isValidPeerId(id: string): boolean {
  // peer_id is a hex string or UUID; allow up to 128 chars, alphanumeric + hyphen
  return /^[0-9a-f-]{8,128}$/i.test(id);
}

function getSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

// ── Long-poll helper ──────────────────────────────────────────
// Polls DB every 1 s for up to LONG_POLL_MAX_MS
const LONG_POLL_MAX_MS = 28_000;
const POLL_INTERVAL_MS = 1_000;

async function longPollForPayload(
  supabase: ReturnType<typeof createClient>,
  peerId: string,
): Promise<string | null> {
  const deadline = Date.now() + LONG_POLL_MAX_MS;
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from("wan_relay_routed")
      .select("id, payload_encrypted")
      .eq("target_peer_id", peerId)
      .eq("claimed", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[wan-relay-route] poll error:", error.message);
      return null;
    }

    if (data) {
      // Mark claimed to prevent double-delivery
      await supabase
        .from("wan_relay_routed")
        .update({ claimed: true })
        .eq("id", (data as { id: number }).id);

      return (data as { payload_encrypted: string }).payload_encrypted;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return null; // timeout — 204
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // ── POST: store encrypted payload for target peer ─────────
  if (req.method === "POST") {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "invalid JSON body" }, 400);
    }

    const { payload_encrypted, target_peer_id } = body as {
      payload_encrypted?: string;
      target_peer_id?: string;
    };

    if (
      typeof payload_encrypted !== "string" ||
      payload_encrypted.length < 10 ||
      payload_encrypted.length > 65536
    ) {
      return json({ ok: false, error: "payload_encrypted required (10–65536 chars)" }, 400);
    }
    if (!target_peer_id || !isValidPeerId(target_peer_id)) {
      return json({ ok: false, error: "target_peer_id missing or invalid" }, 400);
    }

    if (!checkWindow(postWindows, `post:${target_peer_id}`, 20, 60_000)) {
      return json({ ok: false, error: "rate limited: too many route requests" }, 429);
    }

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = getSupabase();
    } catch {
      return json({ ok: false, error: "server configuration error" }, 500);
    }

    const { error } = await supabase.from("wan_relay_routed").insert({
      target_peer_id,
      payload_encrypted,
    });

    if (error) {
      console.error("[wan-relay-route] insert error:", error.message);
      return json({ ok: false, error: "storage error" }, 500);
    }

    return json({ ok: true, target_peer_id }, 202);
  }

  // ── GET: long-poll for inbound payload ────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url);
    const peerId = url.searchParams.get("peer_id");

    if (!peerId || !isValidPeerId(peerId)) {
      return json({ error: "peer_id query param missing or invalid" }, 400);
    }

    if (!checkWindow(getWindows, `get:${peerId}`, 60, 60_000)) {
      return json({ error: "rate limited: too many long-poll requests" }, 429);
    }

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = getSupabase();
    } catch {
      return json({ error: "server configuration error" }, 500);
    }

    const payload = await longPollForPayload(supabase, peerId);

    if (payload === null) {
      // 204: no payload within timeout — client should retry
      return new Response(null, { status: 204, headers: CORS });
    }

    return json({ payload_encrypted: payload }, 200);
  }

  return json({ error: "method not allowed" }, 405);
});
