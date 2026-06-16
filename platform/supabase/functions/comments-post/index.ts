/**
 * comments-post — BP084 Comments System
 * ======================================
 * POST { thread_slug, parent_id?, body, heartbeat_sig }
 * Verifies heartbeat HMAC-SHA256, sanitizes body, inserts comment.
 * Requires Authorization header with Supabase JWT (member-gated).
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

/** Strip dangerous HTML — allow only plain text (no tags at all) */
function sanitizeBody(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** HMAC-SHA256 verification using Web Crypto */
async function verifyHmac(
  sig: string,
  memberId: string,
  threadSlug: string,
  createdAt: string,
  body: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const message = encoder.encode(`${memberId}${threadSlug}${createdAt}${body}`);
    const sigBytes = hexToBytes(sig);
    return await crypto.subtle.verify("HMAC", key, sigBytes, message);
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return arr;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Authorization required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const hmacSecret = Deno.env.get("COMMENTS_HMAC_SECRET") ?? "";

  if (!hmacSecret) return json({ error: "Server not configured" }, 500);

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

  const { thread_slug, parent_id, body: rawBody, heartbeat_sig } = body as {
    thread_slug?: string;
    parent_id?: string;
    body?: string;
    heartbeat_sig?: string;
  };

  if (!thread_slug || typeof thread_slug !== "string" || thread_slug.length > 200) {
    return json({ error: "Invalid thread_slug" }, 400);
  }
  if (!rawBody || typeof rawBody !== "string") {
    return json({ error: "body is required" }, 400);
  }
  if (!heartbeat_sig || typeof heartbeat_sig !== "string") {
    return json({ error: "heartbeat_sig is required" }, 400);
  }

  const sanitized = sanitizeBody(rawBody);
  if (sanitized.length < 1 || sanitized.length > 8000) {
    return json({ error: "body must be 1–8000 characters" }, 400);
  }

  const createdAt = new Date().toISOString();
  const memberId = user.id;

  const valid = await verifyHmac(heartbeat_sig, memberId, thread_slug, createdAt, sanitized, hmacSecret);
  if (!valid) {
    return json({ error: "Invalid heartbeat signature" }, 403);
  }

  // Verify member exists
  const { data: member } = await supabase
    .from("members")
    .select("id, display_name")
    .eq("id", memberId)
    .maybeSingle();

  if (!member) return json({ error: "Member record not found" }, 403);

  const insertData: Record<string, unknown> = {
    thread_slug,
    member_id: memberId,
    body: sanitized,
    heartbeat_sig,
    created_at: createdAt,
  };
  if (parent_id && typeof parent_id === "string") {
    insertData.parent_id = parent_id;
  }

  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert(insertData)
    .select("*, members(display_name)")
    .single();

  if (insertError) {
    console.error("[comments-post] insert error:", insertError.message);
    return json({ error: insertError.message }, 500);
  }

  return json({ success: true, comment });
});
