import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ── HMAC token generation ─────────────────────────────────────────────────── */
async function generateToken(email: string, nonce: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(`${email}|SubstrateAwakens|${nonce}`);

  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── Email send (mirrors send-transactional-email pattern) ─────────────────── */
async function sendTokenEmail(email: string, displayName: string, token: string): Promise<void> {
  const supabaseFnBase = Deno.env.get("SUPABASE_URL") + "/functions/v1";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const body = {
    to: email,
    subject: "Your Substrate Awakens heartbeat token",
    html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#070e1c;color:#e2eaf8;padding:2rem;border-radius:12px;">
  <h2 style="color:#7fd1ff;margin:0 0 1rem;">Substrate Awakens</h2>
  <p>Hi ${escHtml(displayName || email.split("@")[0])},</p>
  <p>You're registered for the first live cooperative mesh benchmark.</p>
  <p><strong>Your one-time heartbeat token:</strong></p>
  <pre style="background:#0d1a2e;border:1px solid #3d5a8e;border-radius:8px;padding:1rem;font-size:1.1rem;letter-spacing:.05em;color:#7fd1ff;">${escHtml(token)}</pre>
  <p style="font-size:.88rem;color:rgba(226,234,248,.6);">
    Launch MnemosyneC v0.5.0 → Settings → Join Live Event → paste this token.<br>
    Do not share this token. It is single-use and tied to your email.
  </p>
  <p>
    <a href="https://mnemosynec.ai/live/SubstrateAwakens/" style="color:#7fd1ff;">Watch the live dashboard →</a>
  </p>
  <p style="font-size:.8rem;color:rgba(226,234,248,.3);">
    Liana Banyan Corporation · Truth-Always · Andon-Cord active
  </p>
</div>`,
    text: `Substrate Awakens heartbeat token for ${email}:\n\n${token}\n\nLaunch MnemosyneC v0.5.0 → Settings → Join Live Event → paste token.\n\nWatch live: https://mnemosynec.ai/live/SubstrateAwakens/`,
  };

  await fetch(`${supabaseFnBase}/send-transactional-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(body),
  });
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Main handler ───────────────────────────────────────────────────────────── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));
    const email: string = (body.email ?? "").trim().toLowerCase();
    const displayName: string = (body.display_name ?? "").trim();
    const ramTier: string = body.ram_tier ?? "unknown";

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* Throttle: check for existing registration in last 24h */
    const { data: existing } = await supabase
      .from("substrate_awakens_registrations")
      .select("id, token_issued_at")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const issuedAt = new Date(existing.token_issued_at).getTime();
      const hoursSince = (Date.now() - issuedAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return new Response(JSON.stringify({
          success: true,
          message: "Check your email — token already issued. Re-request available in " +
            Math.ceil(24 - hoursSince) + " hour(s).",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    /* Generate HMAC token */
    const nonce = crypto.randomUUID();
    const secret = Deno.env.get("COMMENTS_HMAC_SECRET") ?? "substrate-awakens-dev-secret";
    const token = await generateToken(email, nonce, secret);

    /* Upsert registration */
    const { error: upsertError } = await supabase
      .from("substrate_awakens_registrations")
      .upsert({
        email,
        display_name: displayName || null,
        ram_tier: ["unknown","lightweight","standard","premium","heavy"].includes(ramTier) ? ramTier : "unknown",
        heartbeat_token: token,
        token_issued_at: new Date().toISOString(),
      }, { onConflict: "email" });

    if (upsertError) {
      console.error("[register-SA] upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Registration failed — please try again" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* Send email (best-effort — don't block on failure) */
    sendTokenEmail(email, displayName || email.split("@")[0], token).catch((e) =>
      console.warn("[register-SA] email send error:", e)
    );

    return new Response(JSON.stringify({
      success: true,
      message: "Check your email for your heartbeat token. Truth-Always — see you Saturday.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[register-SA] error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
