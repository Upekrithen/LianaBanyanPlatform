/**
 * comments-vote — BP084 Comments System
 * ======================================
 * POST { comment_id, vote: -1|1 }
 * Upserts into comment_votes, updates upvotes/downvotes on comments row.
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

  const { comment_id, vote } = body as { comment_id?: string; vote?: number };

  if (!comment_id || typeof comment_id !== "string") {
    return json({ error: "comment_id is required" }, 400);
  }
  if (vote !== 1 && vote !== -1) {
    return json({ error: "vote must be 1 or -1" }, 400);
  }

  // Get existing vote (if any) before upsert to compute delta
  const { data: existing } = await supabase
    .from("comment_votes")
    .select("vote")
    .eq("comment_id", comment_id)
    .eq("member_id", user.id)
    .maybeSingle();

  const { error: upsertError } = await supabase
    .from("comment_votes")
    .upsert(
      { comment_id, member_id: user.id, vote },
      { onConflict: "comment_id,member_id" },
    );

  if (upsertError) {
    console.error("[comments-vote] upsert error:", upsertError.message);
    return json({ error: upsertError.message }, 500);
  }

  // Recompute tallies from comment_votes (source of truth)
  const { data: tallies } = await supabase
    .from("comment_votes")
    .select("vote")
    .eq("comment_id", comment_id);

  const upvotes = tallies?.filter((r) => r.vote === 1).length ?? 0;
  const downvotes = tallies?.filter((r) => r.vote === -1).length ?? 0;

  await supabase
    .from("comments")
    .update({ upvotes, downvotes })
    .eq("id", comment_id);

  return json({ success: true, upvotes, downvotes, your_vote: vote, previous_vote: existing?.vote ?? null });
});
