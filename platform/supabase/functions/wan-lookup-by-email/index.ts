// BP073 Wave 3 · Scope 12 · wan-lookup-by-email
// ============================================================
// Looks up WAN soccerball addresses by email hash (not raw email).
// The caller supplies their email; the function hashes it
// server-side and queries wan_address_history for matching records.
// The raw email is NEVER stored or logged.
//
// Scopes covered:
//  12  - Address lookup by email API
//
// Query params (POST body):
//   { email, cooperativeEpoch?, peerId?, limit? }
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: email hashed server-side before any DB query
//   WORKS: returns matching rows from wan_address_history
//   WORKS: raw email never touches the DB
//   NOT YET: cross-epoch email-hash lookup (each epoch has a
//            different hash; pass specific epoch to reconstruct
//            a particular session)
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

function getCurrentCooperativeEpoch(): number {
  const EPOCH_ORIGIN = new Date("2026-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - EPOCH_ORIGIN) / (24 * 60 * 60 * 1000));
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

  const email = typeof body.email === "string" ? body.email.trim() : null;
  if (!email) {
    return json({ error: "email is required" }, 400);
  }

  const epoch = typeof body.cooperativeEpoch === "number"
    ? body.cooperativeEpoch
    : getCurrentCooperativeEpoch();
  const peerId = typeof body.peerId === "string" ? body.peerId.trim() : null;
  const limit = Math.min(Math.max(
    parseInt(String(body.limit ?? "20"), 10) || 20, 1,
  ), 100);

  // Hash email server-side -- raw email never stored
  const emailHash = await sha256hex(`${email.toLowerCase()}:${epoch}`);

  let query = supabase
    .schema("public")
    .from("wan_address_history")
    .select(
      "wan_soccerball_id, peer_id, cooperative_epoch, asn_used, minted_at, expires_at, published",
    )
    .eq("member_id", user.id)
    .eq("email_hash", emailHash)
    .order("minted_at", { ascending: false })
    .limit(limit);

  if (peerId) {
    query = query.eq("peer_id", peerId);
  }

  const { data, error } = await query;
  if (error) {
    return json({ error: "Failed to fetch addresses" }, 500);
  }

  return json({
    emailHash,
    cooperativeEpoch: epoch,
    addresses: data ?? [],
    count: (data ?? []).length,
  });
});
