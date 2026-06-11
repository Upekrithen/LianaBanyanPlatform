// BP080 · SEG-WAN-2 · wan-relay-publish
// ============================================================
// POST /functions/v1/wan-relay-publish
// Accepts a PeanutRoll JSON body, validates SID (32-char hex),
// upserts into wan_relay_records keyed by SID + cooperative_epoch.
// --no-verify-jwt: SID is the auth token (intentionally anonymous).
//
// Rate limits (in-process per Deno isolate):
//   - 10 publishes per IP per hour
//   - 3 publishes per SID per hour
//
// Request: PeanutRoll { v:1, s:string, p:string[], b:Record<string,string>, ts:number }
// Response 202: { ok:true, sid:string }
// Response 400: { ok:false, error:string }
// Response 429: { ok:false, error:string }
// Response 500: { ok:false, error:string }
//
// Authored: 2026-06-11 · Bishop SEG-WAN-2 (Option A ratify)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ── CORS ─────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wan-sid",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── PeanutRoll validation ─────────────────────────────────────
const SID_RE = /^[0-9a-f]{32}$/;

function isValidSid(sid: string): boolean {
  return sid.length === 32 && SID_RE.test(sid);
}

interface PeanutRoll {
  v: 1;
  s: string;
  p: string[];
  b: Record<string, string>;
  ts: number;
}

function isValidPeanutRoll(body: unknown): body is PeanutRoll {
  if (!body || typeof body !== "object") return false;
  const roll = body as Record<string, unknown>;
  return (
    roll.v === 1 &&
    typeof roll.s === "string" &&
    isValidSid(roll.s) &&
    Array.isArray(roll.p) &&
    (roll.p as unknown[]).every((x) => typeof x === "string") &&
    roll.b !== null &&
    typeof roll.b === "object" &&
    !Array.isArray(roll.b) &&
    Object.values(roll.b as Record<string, unknown>).every((x) => typeof x === "string") &&
    typeof roll.ts === "number"
  );
}

// ── Epoch helpers ─────────────────────────────────────────────
const EPOCH_ORIGIN_MS = new Date("2026-01-01T00:00:00Z").getTime();
const MS_PER_DAY = 86_400_000;

function getCooperativeEpoch(nowMs: number = Date.now()): number {
  return Math.floor((nowMs - EPOCH_ORIGIN_MS) / MS_PER_DAY);
}

function getExpiresAt(nowMs: number = Date.now()): Date {
  const epoch = getCooperativeEpoch(nowMs);
  return new Date(EPOCH_ORIGIN_MS + (epoch + 1) * MS_PER_DAY);
}

// ── In-process rate limiter ───────────────────────────────────
// NOTE: per-isolate; resets on cold-start. Sufficient for DoS protection.
interface WindowEntry {
  count: number;
  resetAt: number;
}
const ipWindows = new Map<string, WindowEntry>();
const sidWindows = new Map<string, WindowEntry>();

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

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  // IP rate limit: 10 publishes per IP per hour
  const ip = getClientIp(req);
  if (!checkWindow(ipWindows, `publish:ip:${ip}`, 10, 60 * 60 * 1000)) {
    return json({ ok: false, error: "rate limited: too many publishes from this IP" }, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid JSON body" }, 400);
  }

  if (!isValidPeanutRoll(body)) {
    return json(
      { ok: false, error: "invalid PeanutRoll: v must be 1, s must be 32-char hex" },
      400,
    );
  }

  const roll = body as PeanutRoll;

  // SID rate limit: 3 publishes per SID per hour
  if (!checkWindow(sidWindows, `publish:sid:${roll.s}`, 3, 60 * 60 * 1000)) {
    return json({ ok: false, error: "rate limited: too many publishes for this SID" }, 429);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("[wan-relay-publish] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json({ ok: false, error: "server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const nowMs = Date.now();
  const cooperativeEpoch = getCooperativeEpoch(nowMs);
  const expiresAt = getExpiresAt(nowMs);
  const ipHash = await sha256hex(ip);

  const { error } = await supabase.from("wan_relay_records").upsert(
    {
      sid: roll.s,
      peanut_roll: roll,
      cooperative_epoch: cooperativeEpoch,
      expires_at: expiresAt.toISOString(),
      published_at: new Date(nowMs).toISOString(),
      ip_hash: ipHash,
    },
    { onConflict: "sid" },
  );

  if (error) {
    console.error("[wan-relay-publish] supabase error:", error.message);
    return json({ ok: false, error: "storage error" }, 500);
  }

  return json({ ok: true, sid: roll.s }, 202);
});
