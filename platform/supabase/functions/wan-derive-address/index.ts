// BP073 Wave 3 · Scopes 8-10 · wan-derive-address
// ============================================================
// Server-side email-bound WAN soccerball address derivation.
// Accepts (memberId, peerId, email, asnHint?) from an authenticated
// request. Derives the WAN soccerball address using the same
// algorithm as wan_soccerball_address.ts but server-verified,
// stores the result in wan_address_history, and returns the
// full address record.
//
// Scopes covered:
//   8  - wan-derive-address edge function
//   9  - Server-side email-bound derivation (crypto.subtle in Deno)
//  10  - Address insert into wan_address_history on derivation
//  11  - Address expiry field (expiresAt = mintedAt + 24h)
//  16  - Uses getCurrentCooperativeEpoch() server-side
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: SHA-256 derivation in Deno (crypto.subtle available)
//   WORKS: email hash included, raw email never stored
//   WORKS: result written to wan_address_history
//   PARTIAL: ASN validated but relies on caller supplying it --
//            production flow should call wan-asn-lookup first
//            (see WanAddressWidget integration)
//   NOT YET: DAG publish / peer resolution (downstream W1/W2 work)
//
// Authored: 2026-06-03 · Knight BP073-W3

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ─── Epoch ────────────────────────────────────────────────────────────────────

function getCurrentCooperativeEpoch(): number {
  const EPOCH_ORIGIN = new Date("2026-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - EPOCH_ORIGIN) / (24 * 60 * 60 * 1000));
}

function floorToHour(ts = Date.now()): number {
  return Math.floor(ts / (60 * 60 * 1000)) * (60 * 60 * 1000);
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Core derivation (mirrors wan_soccerball_address.ts logic) ────────────────

interface DerivedAddress {
  memberId: string;
  peerId: string;
  emailHash: string;
  sessionNonce: string;
  cooperativeEpoch: number;
  wanSoccerballId: string;
  asnUsed: string;
  mintedAt: string;
  expiresAt: string;
}

async function deriveAddress(
  memberId: string,
  peerId: string,
  email: string,
  asnHint: string,
): Promise<DerivedAddress> {
  const epoch = getCurrentCooperativeEpoch();
  const sessionTimestampFloor = floorToHour();

  const emailHash = await sha256hex(`${email.toLowerCase().trim()}:${epoch}`);
  const sessionNonce = await sha256hex(`${asnHint}:${sessionTimestampFloor}`);
  const wanSoccerballId = await sha256hex(
    `${memberId}:${peerId}:${sessionNonce}:${epoch}:${emailHash}`,
  );

  const mintedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    memberId,
    peerId,
    emailHash,
    sessionNonce,
    cooperativeEpoch: epoch,
    wanSoccerballId,
    asnUsed: asnHint,
    mintedAt,
    expiresAt,
  };
}

// ─── ASN validation ───────────────────────────────────────────────────────────

const ASN_PATTERN = /^AS\d{1,10}$/;

function sanitiseAsn(raw: string | undefined | null): string {
  if (!raw) return "AS0000";
  const cleaned = String(raw).toUpperCase().trim().replace(/^ASN/, "AS");
  return ASN_PATTERN.test(cleaned) ? cleaned : "AS0000";
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // Require authenticated caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Verify caller identity
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return json({ error: "Invalid token" }, 401);
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const memberId = typeof body.memberId === "string" ? body.memberId.trim() : null;
  const peerId = typeof body.peerId === "string" ? body.peerId.trim() : null;
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const asnHint = sanitiseAsn(
    typeof body.asnHint === "string" ? body.asnHint : null,
  );

  if (!memberId || !peerId || !email) {
    return json({ error: "memberId, peerId, and email are required" }, 400);
  }

  // Security: ensure caller is acting on their own memberId
  if (user.id !== memberId) {
    return json({ error: "memberId must match authenticated user" }, 403);
  }

  // Derive the address server-side
  const addr = await deriveAddress(memberId, peerId, email, asnHint);

  // Store in wan_address_history (scope 10)
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serviceSupabase = createClient(supabaseUrl, serviceKey ?? supabaseAnonKey);
  await serviceSupabase
    .schema("public")
    .from("wan_address_history")
    .insert({
      member_id: memberId,
      peer_id: peerId,
      email_hash: addr.emailHash,
      session_nonce: addr.sessionNonce,
      cooperative_epoch: addr.cooperativeEpoch,
      wan_soccerball_id: addr.wanSoccerballId,
      asn_used: addr.asnUsed,
      minted_at: addr.mintedAt,
      expires_at: addr.expiresAt,
      published: false,
    });

  return json({
    wanSoccerballId: addr.wanSoccerballId,
    emailHash: addr.emailHash,
    sessionNonce: addr.sessionNonce,
    cooperativeEpoch: addr.cooperativeEpoch,
    asnUsed: addr.asnUsed,
    mintedAt: addr.mintedAt,
    expiresAt: addr.expiresAt,
  });
});
