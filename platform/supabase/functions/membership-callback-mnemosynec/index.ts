// membership-callback-mnemosynec — BP085
// Handles the MnemosyneC app membership return flow.
//
// GET  /  — verifies member_id exists in member_profiles, mints one-time token,
//           redirects to mnemosynec://membership-active?member_id=...&token=...
//
// POST /validate — receives { member_id, token }, validates one-time token,
//                  returns { valid: true } or { valid: false, error: ... }
//
// BLOOD: token is NEVER stored in plaintext — only SHA-256 hash is persisted.
// BLOOD: token value is NEVER logged.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return hexEncode(buf);
}

async function randomHex(bytes: number): Promise<string> {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return hexEncode(buf.buffer);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);

  // ── POST /validate ─────────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body = await req.json() as { member_id?: string; token?: string };
      const memberId = body.member_id;
      const token = body.token;

      if (!memberId || !token) {
        return new Response(
          JSON.stringify({ valid: false, error: "member_id and token required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Hash the token — NEVER log the plaintext value
      const tokenHash = await sha256(token);

      // Look up hash in activation_tokens table
      const { data: row, error: fetchErr } = await supabase
        .from("membership_activation_tokens")
        .select("id, member_id, consumed_at, expires_at")
        .eq("token_hash", tokenHash)
        .eq("member_id", memberId)
        .maybeSingle();

      if (fetchErr) {
        console.error("[membership-callback] DB lookup error:", fetchErr.message);
        return new Response(
          JSON.stringify({ valid: false, error: "Database error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (!row) {
        return new Response(
          JSON.stringify({ valid: false, error: "Token not found or invalid" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (row.consumed_at) {
        return new Response(
          JSON.stringify({ valid: false, error: "Token already consumed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (new Date(row.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, error: "Token expired" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Consume the token (one-time use)
      const { error: consumeErr } = await supabase
        .from("membership_activation_tokens")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id);

      if (consumeErr) {
        console.error("[membership-callback] Consume error:", consumeErr.message);
        return new Response(
          JSON.stringify({ valid: false, error: "Failed to consume token" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("[membership-callback] POST exception:", err);
      return new Response(
        JSON.stringify({ valid: false, error: "Internal error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  // ── GET / — verify member + mint token + redirect ──────────────────────────
  if (req.method === "GET") {
    const memberId = url.searchParams.get("member_id");

    if (!memberId) {
      return new Response(
        JSON.stringify({ error: "member_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify member exists in member_profiles
    const { data: member, error: memberErr } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("id", memberId)
      .maybeSingle();

    if (memberErr) {
      console.error("[membership-callback] Member lookup error:", memberErr.message);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mint one-time token (32 random bytes → hex)
    const rawToken = await randomHex(32);
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const { error: insertErr } = await supabase
      .from("membership_activation_tokens")
      .insert({
        member_id: memberId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (insertErr) {
      console.error("[membership-callback] Token insert error:", insertErr.message);
      return new Response(
        JSON.stringify({ error: "Failed to mint token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Redirect to mnemosynec:// deep link — token in URL (short-lived)
    const deepLink = `mnemosynec://membership-active?member_id=${encodeURIComponent(memberId)}&token=${encodeURIComponent(rawToken)}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": deepLink,
      },
    });
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
