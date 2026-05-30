// BP065 · Tier-2 Onboarding · Part B (SEG-A2b) — frontier-node-register
// Authenticated edge function: registers or re-activates a node in the public cooperative Frontier mesh.
// PREREQUISITE: the calling user MUST have a matching mnemosyne_device_links row (enforces 2a).
// Input: { peer_id, node_label?, app_version?, transport_hint?, relay_peer_id? }
// Output: { registered, frontier_node_id }
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

  let body: {
    peer_id?: string;
    node_label?: string;
    app_version?: string;
    transport_hint?: string;
    relay_peer_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { peer_id, node_label, app_version, transport_hint, relay_peer_id } = body;
  if (!peer_id || typeof peer_id !== "string" || peer_id.trim().length === 0) {
    return jsonResponse({ error: "peer_id is required" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: "public" },
  });

  // ENFORCE 2a PREREQUISITE: must have a linked device for this peer_id
  const { data: deviceLink, error: linkError } = await adminClient
    .from("mnemosyne_device_links")
    .select("id")
    .eq("user_id", user.id)
    .eq("peer_id", peer_id.trim())
    .is("revoked_at", null)
    .maybeSingle();

  if (linkError) {
    console.error("[frontier-node-register] device link lookup error:", linkError.message);
    return jsonResponse({ error: "Could not verify device link" }, 500);
  }

  if (!deviceLink) {
    return jsonResponse(
      { error: "Device not linked to a Liana Banyan account. Complete 2a (Connect Mnemosyne) first." },
      403
    );
  }

  const now = new Date().toISOString();

  // Upsert the node — clears withdrawn_at on re-registration
  const { data: upserted, error: upsertError } = await adminClient
    .from("frontier_nodes")
    .upsert(
      {
        user_id: user.id,
        peer_id: peer_id.trim(),
        node_label: node_label ?? null,
        app_version: app_version ?? null,
        transport_hint: transport_hint ?? null,
        relay_peer_id: relay_peer_id ?? null,
        registered_at: now,
        last_heartbeat_at: now,
        withdrawn_at: null,
      },
      { onConflict: "user_id,peer_id", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (upsertError || !upserted) {
    console.error("[frontier-node-register] upsert error:", upsertError?.message);
    return jsonResponse({ error: "Failed to register node" }, 500);
  }

  return jsonResponse({ registered: true, frontier_node_id: upserted.id });
});
