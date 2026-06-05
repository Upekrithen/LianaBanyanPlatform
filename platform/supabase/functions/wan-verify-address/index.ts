// BP073 Wave 3 · Scope 5 · wan-verify-address
// ============================================================
// Address verification endpoint. Given a claimed wanSoccerballId
// and the derivation inputs (memberId, peerId, email, asnHint,
// epoch, sessionTimestampFloor), deterministically re-derives the
// address server-side and checks whether it matches the claim.
//
// Used by WanAddressWidget to show a "Server Verified" badge.
//
// Scopes covered:
//   5  - Address verification endpoint (server re-derives + compares)
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: server-side re-derivation and comparison
//   WORKS: rejects mismatches with verified:false
//   NOT YET: ZK proof or cryptographic attestation (requires separate infra)
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

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ASN_PATTERN = /^AS\d{1,10}$/;
function sanitiseAsn(raw: string | undefined | null): string {
  if (!raw) return "AS0000";
  const cleaned = String(raw).toUpperCase().trim().replace(/^ASN/, "AS");
  return ASN_PATTERN.test(cleaned) ? cleaned : "AS0000";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

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
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return json({ error: "Invalid token" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const claimedId = typeof body.wanSoccerballId === "string" ? body.wanSoccerballId.trim() : null;
  const memberId = typeof body.memberId === "string" ? body.memberId.trim() : null;
  const peerId = typeof body.peerId === "string" ? body.peerId.trim() : null;
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const asnHint = sanitiseAsn(typeof body.asnHint === "string" ? body.asnHint : null);
  const epoch = typeof body.cooperativeEpoch === "number" ? body.cooperativeEpoch : null;
  const sessionTimestampFloor = typeof body.sessionTimestampFloor === "number"
    ? body.sessionTimestampFloor
    : Math.floor(Date.now() / (60 * 60 * 1000)) * (60 * 60 * 1000);

  if (!claimedId || !memberId || !peerId || !email || epoch === null) {
    return json({ error: "wanSoccerballId, memberId, peerId, email, and cooperativeEpoch are required" }, 400);
  }

  // Security: caller can only verify their own address
  if (user.id !== memberId) {
    return json({ error: "memberId must match authenticated user" }, 403);
  }

  // Re-derive server-side
  const emailHash = await sha256hex(`${email.toLowerCase().trim()}:${epoch}`);
  const sessionNonce = await sha256hex(`${asnHint}:${sessionTimestampFloor}`);
  const derivedId = await sha256hex(
    `${memberId}:${peerId}:${sessionNonce}:${epoch}:${emailHash}`,
  );

  const verified = derivedId === claimedId;

  return json({
    verified,
    derivedId,
    claimedId,
    cooperativeEpoch: epoch,
  });
});
