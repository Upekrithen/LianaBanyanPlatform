// share-from-mnemosynec · BP086 BLACK MAMBA Amendment
// Sender: DrM@mnemosynec.org (Founder-direct canon)
// Link: https://mnemosynec.org/
// Rate limit: 1 share per IP per minute, 10 per day
// Deferred-queue: if Resend rejects with domain-not-verified, stores row
// with status='deferred-domain-verifying' for flush-deferred-shares to retry.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// In-isolate rate limiting (resets on cold start)
const ipMinuteWindows = new Map<string, { count: number; resetAt: number }>();
const ipDayWindows = new Map<string, { count: number; resetAt: number }>();

function checkRate(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now >= entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isDomainVerifyingError(status: number, body: string): boolean {
  if (status === 422 || status === 403) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("domain_not_verified") ||
    lower.includes("domain not verified") ||
    lower.includes("not verified") ||
    lower.includes("verification") ||
    lower.includes("sender identity")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRate(ipMinuteWindows, ip, 1, 60_000)) {
    return json({ ok: false, error: "rate limited: 1 share per minute" }, 429);
  }
  if (!checkRate(ipDayWindows, ip, 10, 86_400_000)) {
    return json({ ok: false, error: "rate limited: 10 shares per day" }, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid JSON" }, 400);
  }

  const { recipient_email, message } = body as {
    recipient_email?: string;
    message?: string;
  };

  if (!recipient_email || !recipient_email.includes("@")) {
    return json({ ok: false, error: "valid recipient_email required" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceKey || !resendKey) {
    return json({ ok: false, error: "server config error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const recipientHash = await sha256hex(
    recipient_email.toLowerCase().trim(),
  );
  const senderIpHash = await sha256hex(ip);

  // Step 1: Insert attempt row as 'pending'
  const { error: insertErr } = await supabase
    .from("email_send_attempts")
    .upsert(
      {
        recipient_email: recipient_email.trim(),
        recipient_hash: recipientHash,
        sender_ip_hash: senderIpHash,
        message: message ?? null,
        status: "pending",
        attempted_at: new Date().toISOString(),
      },
      { onConflict: "recipient_hash,sender_ip_hash" },
    );

  if (insertErr) {
    console.warn("[share-from-mnemosynec] insert failed:", insertErr.message);
    // Non-fatal: continue to attempt send
  }

  // Step 2: Attempt Resend send
  const emailHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
      <h2 style="color:#22c55e;">Hello from Dr. Mnemosynec!</h2>
      <p>Someone thought you&rsquo;d appreciate this:</p>
      <p><a href="https://mnemosynec.org/" style="color:#22c55e;font-weight:bold;">MnemosyneC &mdash; Free, local AI substrate. No account required to start.</a></p>
      <p>It&rsquo;s cooperative AI that runs on your own hardware. Free at the base tier, and you keep 83.3% of anything you earn on the platform.</p>
      ${message ? `<blockquote style="border-left:3px solid #22c55e;padding-left:1rem;color:#64748b;">${message}</blockquote>` : ""}
      <hr style="border-color:#1e293b;"/>
      <p style="font-size:0.75rem;color:#64748b;">This was sent by someone who wanted to share MnemosyneC with you. You can <a href="https://mnemosynec.org/">visit the site</a> or simply ignore this.</p>
    </div>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "DrM@mnemosynec.org",
      to: [recipient_email.trim()],
      subject: "Someone wanted you to see this \u2014 from Dr. Mnemosynec",
      html: emailHtml,
    }),
  });

  const resendBody = await resendRes.text();

  if (resendRes.ok) {
    // Step 3a: Sent successfully
    await supabase
      .from("email_send_attempts")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("recipient_hash", recipientHash)
      .eq("sender_ip_hash", senderIpHash);

    return json({ ok: true, status: "sent" }, 200);
  }

  // Step 3b: Check for domain-verifying error → defer
  if (isDomainVerifyingError(resendRes.status, resendBody)) {
    console.log(
      `[share-from-mnemosynec] domain verifying — deferring send to ${recipientHash}`,
    );
    await supabase
      .from("email_send_attempts")
      .update({
        status: "deferred-domain-verifying",
        error_detail: resendBody.substring(0, 500),
      })
      .eq("recipient_hash", recipientHash)
      .eq("sender_ip_hash", senderIpHash);

    return json(
      { ok: true, queued: true, reason: "domain_verifying" },
      202,
    );
  }

  // Step 3c: Other error → failed
  console.error(
    `[share-from-mnemosynec] Resend error ${resendRes.status}:`,
    resendBody,
  );
  await supabase
    .from("email_send_attempts")
    .update({
      status: "failed",
      error_detail: resendBody.substring(0, 500),
    })
    .eq("recipient_hash", recipientHash)
    .eq("sender_ip_hash", senderIpHash);

  return json({ ok: false, error: "email send failed \u2014 try again" }, 500);
});
