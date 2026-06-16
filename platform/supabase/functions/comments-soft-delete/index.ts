/**
 * comments-soft-delete — BP084 Comments System
 * =============================================
 * POST { comment_id }
 * Author-only: sets deleted_at = now(). RLS enforces author check.
 * Requires Authorization (member-gated).
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
  // Use anon key so RLS policies (member_id = auth.uid()) are enforced
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

  const { comment_id } = body as { comment_id?: string };

  if (!comment_id || typeof comment_id !== "string") {
    return json({ error: "comment_id is required" }, 400);
  }

  // RLS policy "comments_update_author" enforces member_id = auth.uid()
  const { data, error: updateError } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", comment_id)
    .eq("member_id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[comments-soft-delete] update error:", updateError.message);
    return json({ error: updateError.message }, 500);
  }

  if (!data) {
    return json({ error: "Comment not found or not authored by you" }, 404);
  }

  return json({ success: true, deleted_at: new Date().toISOString() });
});
