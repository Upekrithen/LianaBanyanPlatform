// BP065 · Tier-2 Onboarding · Part B (SEG-A2b) — frontier-node-heartbeat
// Authenticated edge function: updates last_heartbeat_at for a registered frontier node.
// Only fires AFTER explicit registration (no ghost rows on launch).
// Input: { peer_id }
// Output: { ok, updated_at }
// search_path locked per §4 discipline
// Authored: 2026-05-30T21:30:00Z · Knight BP065

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = authHeader.slice(7);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    db: { schema: "public" },
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  let body: { peer_id?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { peer_id } = body;
  if (!peer_id || typeof peer_id !== "string") {
    return jsonResponse({ error: "peer_id is required" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: "public" },
  });

  const now = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from("frontier_nodes")
    .update({ last_heartbeat_at: now })
    .eq("user_id", user.id)
    .eq("peer_id", peer_id.trim())
    .is("withdrawn_at", null);

  if (updateError) {
    console.error("[frontier-node-heartbeat] update error:", updateError.message);
    return jsonResponse({ error: "Heartbeat failed" }, 500);
  }

  return jsonResponse({ ok: true, updated_at: now });
});
