// BP065 · Tier-2 Onboarding · Part A (SEG-A2a) — mnemosyne-device-link
// Authenticated edge function: upserts a mnemosyne_device_links row for the calling user.
// Input: { peer_id, device_label?, app_version? }
// Output: { linked, user_id, peer_id }
// Requires: valid JWT (auth.uid() not null); optionally enforces active membership
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

  // Authenticated client — verifies JWT
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    db: { schema: "public" },
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  let body: { peer_id?: string; device_label?: string; app_version?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { peer_id, device_label, app_version } = body;
  if (!peer_id || typeof peer_id !== "string" || peer_id.trim().length === 0) {
    return jsonResponse({ error: "peer_id is required" }, 400);
  }

  // Service-role client for write (bypasses RLS for upsert — we already verified user above)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: "public" },
  });

  const now = new Date().toISOString();

  const { error: upsertError } = await adminClient
    .from("mnemosyne_device_links")
    .upsert(
      {
        user_id: user.id,
        peer_id: peer_id.trim(),
        device_label: device_label ?? null,
        platform: "mnemosyne",
        app_version: app_version ?? null,
        linked_at: now,
        last_seen_at: now,
      },
      { onConflict: "user_id,peer_id", ignoreDuplicates: false }
    );

  if (upsertError) {
    console.error("[mnemosyne-device-link] upsert error:", upsertError.message);
    return jsonResponse({ error: "Failed to link device" }, 500);
  }

  return jsonResponse({ linked: true, user_id: user.id, peer_id: peer_id.trim() });
});
