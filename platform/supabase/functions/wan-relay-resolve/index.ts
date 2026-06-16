// BP080 · SEG-WAN-2 · wan-relay-resolve
// BP084 · SEG-2 · includes capabilities from peer_presence (2026-06-15)
// ============================================================
// GET /functions/v1/wan-relay-resolve/:sid
// Resolves a SID to its latest PeanutRoll from wan_relay_records,
// enriched with capabilities from peer_presence (BP084 SEG-2).
// Returns 404 if not found or expired.
// --no-verify-jwt: SID is the auth token (intentionally anonymous).
//
// Rate limits (in-process per Deno isolate):
//   - 60 resolves per IP per minute
//
// Request: GET /wan-relay-resolve/<32-char-hex-sid>
// Response 200: PeanutRoll + { capabilities?, peer_id? }
// Response 400: { error:string }
// Response 404: { error:string }
// Response 429: { error:string }
// Response 500: { error:string }
//
// Authored: 2026-06-11 · Bishop SEG-WAN-2 (Option A ratify)
// Extended: 2026-06-15 · Knight BP084 SEG-2
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ── CORS ─────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wan-sid",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function peanutRollResponse(roll: unknown) {
  return new Response(JSON.stringify(roll), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── SID validation ────────────────────────────────────────────
const SID_RE = /^[0-9a-f]{32}$/;

function isValidSid(sid: string): boolean {
  return sid.length === 32 && SID_RE.test(sid);
}

// ── Epoch helpers ─────────────────────────────────────────────
function isExpired(expiresAt: string, nowMs: number = Date.now()): boolean {
  return new Date(expiresAt).getTime() <= nowMs;
}

// ── In-process rate limiter ───────────────────────────────────
interface WindowEntry {
  count: number;
  resetAt: number;
}
const ipWindows = new Map<string, WindowEntry>();

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

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "GET") {
    return json({ error: "method not allowed" }, 405);
  }

  // IP rate limit: 60 resolves per IP per minute
  const ip = getClientIp(req);
  if (!checkWindow(ipWindows, `resolve:ip:${ip}`, 60, 60 * 1000)) {
    return json({ error: "rate limited: too many resolve requests from this IP" }, 429);
  }

  // Extract SID from path: /functions/v1/wan-relay-resolve/<sid>
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const sid = pathParts[pathParts.length - 1];

  if (!sid || !isValidSid(sid)) {
    return json({ error: "invalid SID: must be 32-char hex" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("[wan-relay-resolve] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json({ error: "server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("wan_relay_records")
    .select("peanut_roll, expires_at")
    .eq("sid", sid)
    .maybeSingle();

  if (error) {
    console.error("[wan-relay-resolve] supabase error:", error.message);
    return json({ error: "storage error" }, 500);
  }

  if (!data || isExpired(data.expires_at as string)) {
    return json({ error: "not found" }, 404);
  }

  const roll = data.peanut_roll as Record<string, unknown>;

  // BP084 SEG-2: enrich with peer_presence capabilities if available
  if (roll && typeof roll.peer_id === "string") {
    const { data: presence } = await supabase
      .from("peer_presence")
      .select("capabilities, peer_id, lan_addresses")
      .eq("peer_id", roll.peer_id as string)
      .maybeSingle();

    if (presence) {
      const enriched = {
        ...roll,
        capabilities: presence.capabilities ?? null,
        peer_id: presence.peer_id,
        lan_addresses: presence.lan_addresses ?? [],
      };
      return peanutRollResponse(enriched);
    }
  }

  return peanutRollResponse(roll);
});
