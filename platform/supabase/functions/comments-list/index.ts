/**
 * comments-list — BP084 Comments System
 * ======================================
 * GET ?thread_slug=<slug>&after=<iso>&limit=<n>
 * Returns paginated comments with member display_name.
 * Public read — no auth required.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey, authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const url = new URL(req.url);
  const threadSlug = url.searchParams.get("thread_slug") ?? "";
  const after = url.searchParams.get("after") ?? null;
  const limitRaw = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const limit = Math.min(Math.max(limitRaw, 1), 100);

  if (!threadSlug) return json({ error: "thread_slug is required" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from("comments")
    .select(`
      id,
      thread_slug,
      parent_id,
      member_id,
      body,
      created_at,
      edited_at,
      flagged_count,
      upvotes,
      downvotes,
      members ( display_name )
    `)
    .eq("thread_slug", threadSlug)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (after) {
    query = query.lt("created_at", after);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[comments-list] query error:", error.message);
    return json({ error: error.message }, 500);
  }

  return json({
    comments: data ?? [],
    has_more: (data?.length ?? 0) >= limit,
    next_after: data?.length ? data[data.length - 1].created_at : null,
  });
});
