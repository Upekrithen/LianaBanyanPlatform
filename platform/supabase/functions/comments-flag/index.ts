/**
 * comments-flag — BP084 Comments System
 * ======================================
 * POST { comment_id, reason }
 * Increments flagged_count. Requires Authorization (member-gated).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authorization required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: "Not authenticated" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { comment_id, reason } = body as { comment_id?: string; reason?: string };

  if (!comment_id || typeof comment_id !== "string") {
    return json({ error: "comment_id is required" }, 400);
  }
  if (!reason || typeof reason !== "string" || reason.length > 500) {
    return json({ error: "reason is required (max 500 chars)" }, 400);
  }

  // Verify comment exists and is not deleted
  const { data: comment } = await supabase
    .from("comments")
    .select("id, flagged_count, deleted_at")
    .eq("id", comment_id)
    .maybeSingle();

  if (!comment) return json({ error: "Comment not found" }, 404);
  if (comment.deleted_at) return json({ error: "Comment already deleted" }, 410);

  const { error: updateError } = await supabase
    .from("comments")
    .update({ flagged_count: (comment.flagged_count ?? 0) + 1 })
    .eq("id", comment_id);

  if (updateError) {
    console.error("[comments-flag] update error:", updateError.message);
    return json({ error: updateError.message }, 500);
  }

  console.log(`[comments-flag] comment=${comment_id} flagged by member=${user.id} reason="${reason}"`);

  return json({ success: true, flagged_count: (comment.flagged_count ?? 0) + 1 });
});
