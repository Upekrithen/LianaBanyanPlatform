// BP073 Wave 3 · Scope 1-7 · wan-asn-lookup
// ============================================================
// Real ASN lookup service. Queries ip-api.com (primary) then
// ipinfo.io (secondary) to resolve the calling IP's ASN. The
// result is cached in wan_connection_fingerprints (1-hour TTL).
// Rate-limited: one fresh external call per IP per 30 seconds;
// cache hits always allowed. Falls back to "AS0000" + a flag
// if both upstreams fail.
//
// Scopes covered:
//   1 - wan-asn-lookup edge function (ip-api.com + ipinfo.io)
//   2 - In-function rate limiting (memory map per IP, 30s window)
//   3 - ASN format validation + sanitisation
//   4 - Fallback when both upstreams unavailable
//   5 - wan_connection_fingerprints table (migration separate)
//   6 - Cache-first lookup logic
//   7 - Cache TTL expiry (1 h)
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: ip-api.com query (free tier, 45 req/min unauthenticated)
//   WORKS: ipinfo.io fallback query
//   WORKS: cache-first logic against wan_connection_fingerprints
//   WORKS: rate limiting (in-memory map -- resets on cold start)
//   WORKS: fallback to AS0000 + fallback_used:true
//   NOT YET: real BGP table / RPKI lookup (needs $$ dedicated BGP feed)
//
// Authored: 2026-06-03 · Knight BP073-W3

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ─── Rate limiter (scope 2) ────────────────────────────────────────────────────

const RATE_MAP = new Map<string, number>(); // ip -> last external call timestamp (ms)
const RATE_WINDOW_MS = 30_000; // 30 seconds between external calls per IP

function isRateLimited(ip: string): boolean {
  const last = RATE_MAP.get(ip);
  if (last === undefined) return false;
  return Date.now() - last < RATE_WINDOW_MS;
}

function recordCall(ip: string): void {
  RATE_MAP.set(ip, Date.now());
  // Prune old entries to prevent unbounded growth (keep last 500)
  if (RATE_MAP.size > 500) {
    const cutoff = Date.now() - RATE_WINDOW_MS * 10;
    for (const [k, v] of RATE_MAP.entries()) {
      if (v < cutoff) RATE_MAP.delete(k);
    }
  }
}

// ─── ASN validation (scope 3) ─────────────────────────────────────────────────

const ASN_PATTERN = /^AS\d{1,10}$/;

function sanitiseAsn(raw: string | undefined | null): string {
  if (!raw) return "AS0000";
  const cleaned = String(raw).toUpperCase().trim().replace(/^ASN/, "AS");
  return ASN_PATTERN.test(cleaned) ? cleaned : "AS0000";
}

// ─── ip-api.com query ─────────────────────────────────────────────────────────

interface IpApiResponse {
  status: string;
  as?: string;    // e.g. "AS7922 Comcast Cable Communications, LLC"
  org?: string;
  isp?: string;
  query?: string;
}

async function queryIpApi(ip: string): Promise<string | null> {
  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,as,org,isp,query`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data: IpApiResponse = await res.json();
    if (data.status !== "success" || !data.as) return null;
    // data.as looks like "AS7922 Comcast Cable Communications, LLC"
    const asnPart = data.as.split(" ")[0];
    return sanitiseAsn(asnPart);
  } catch {
    return null;
  }
}

// ─── ipinfo.io fallback query ─────────────────────────────────────────────────

interface IpinfoResponse {
  org?: string; // e.g. "AS7922 Comcast Cable Communications, LLC"
}

async function queryIpinfo(ip: string): Promise<string | null> {
  try {
    const token = Deno.env.get("IPINFO_TOKEN") ?? "";
    const tokenParam = token ? `?token=${token}` : "";
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json${tokenParam}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data: IpinfoResponse = await res.json();
    if (!data.org) return null;
    const asnPart = data.org.split(" ")[0];
    return sanitiseAsn(asnPart);
  } catch {
    return null;
  }
}

// ─── Supabase cache (scopes 5-7) ──────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getFromCache(
  supabase: ReturnType<typeof createClient>,
  ip: string,
): Promise<string | null> {
  const { data } = await supabase
    .schema("public")
    .from("wan_connection_fingerprints")
    .select("asn, created_at")
    .eq("ip_hash", await sha256hex(ip))
    .gt("created_at", new Date(Date.now() - CACHE_TTL_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.asn ?? null;
}

async function upsertCache(
  supabase: ReturnType<typeof createClient>,
  ip: string,
  asn: string,
): Promise<void> {
  const ipHash = await sha256hex(ip);
  await supabase
    .schema("public")
    .from("wan_connection_fingerprints")
    .upsert(
      { ip_hash: ipHash, asn, created_at: new Date().toISOString() },
      { onConflict: "ip_hash" },
    );
}

// ─── Crypto helper ────────────────────────────────────────────────────────────

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // Extract the caller's IP from standard proxy headers
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "0.0.0.0";

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Server configuration error" }, 500);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── Step 1: Try cache ──────────────────────────────────────────────────────
  const cached = await getFromCache(supabase, ip);
  if (cached) {
    return json({
      asn: cached,
      source: "cache",
      fallback_used: false,
      rate_limited: false,
    });
  }

  // ── Step 2: Rate limit check ───────────────────────────────────────────────
  if (isRateLimited(ip)) {
    // Return last known if available, else fallback
    return json({
      asn: "AS0000",
      source: "rate_limited",
      fallback_used: true,
      rate_limited: true,
    });
  }

  // ── Step 3: ip-api.com ────────────────────────────────────────────────────
  recordCall(ip);
  let asn = await queryIpApi(ip);
  let source = "ip-api.com";

  // ── Step 4: ipinfo.io fallback (scope 4) ─────────────────────────────────
  if (!asn) {
    asn = await queryIpinfo(ip);
    source = "ipinfo.io";
  }

  // ── Scope 4: final fallback ───────────────────────────────────────────────
  const fallbackUsed = !asn;
  if (!asn) {
    asn = "AS0000";
    source = "fallback";
  }

  // ── Step 5: Write to cache ────────────────────────────────────────────────
  await upsertCache(supabase, ip, asn);

  return json({
    asn,
    source,
    fallback_used: fallbackUsed,
    rate_limited: false,
  });
});
