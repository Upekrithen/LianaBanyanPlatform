// BP073 Wave 3 · Scope 6 · wan-address-history
// ============================================================
// Returns address history for the authenticated member.
// Supports optional filtering by epoch and/or peerId.
// Results are ordered by minted_at DESC.
//
// Scopes covered:
//   6  - Address history API
//  11  - Address expiry: expired field computed on-the-fly
//
// Query params:
//   ?epoch=N         -- filter to a specific cooperative epoch
//   ?peerId=xxx      -- filter to a specific peer
//   ?limit=N         -- max results (default 20, max 100)
//   ?expired=true    -- include expired addresses (default false)
//
// EMPIRICAL STATUS (BP073-W3):
//   WORKS: returns wan_address_history rows for auth user
//   WORKS: epoch + peer filters
//   WORKS: expired flag computed from expires_at
//   NOT YET: pagination cursor (uses limit only; cursor pending)
//
// Authored: 2026-06-03 · Knight BP073-W3

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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

  const url = new URL(req.url);
  const epochParam = url.searchParams.get("epoch");
  const peerParam = url.searchParams.get("peerId");
  const limitParam = url.searchParams.get("limit");
  const showExpired = url.searchParams.get("expired") === "true";

  const limit = Math.min(Math.max(parseInt(limitParam ?? "20", 10) || 20, 1), 100);

  let query = supabase
    .schema("public")
    .from("wan_address_history")
    .select(
      "wan_soccerball_id, peer_id, cooperative_epoch, asn_used, minted_at, expires_at, published",
    )
    .eq("member_id", user.id)
    .order("minted_at", { ascending: false })
    .limit(limit);

  if (epochParam) {
    const epoch = parseInt(epochParam, 10);
    if (!isNaN(epoch)) query = query.eq("cooperative_epoch", epoch);
  }

  if (peerParam) {
    query = query.eq("peer_id", peerParam);
  }

  if (!showExpired) {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) {
    return json({ error: "Failed to fetch address history" }, 500);
  }

  // Annotate with live expired flag
  const now = Date.now();
  const rows = (data ?? []).map((row) => ({
    ...row,
    expired: new Date(row.expires_at).getTime() < now,
  }));

  return json({ history: rows, count: rows.length });
});
