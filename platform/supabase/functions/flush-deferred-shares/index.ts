// flush-deferred-shares · BP086 BLACK MAMBA Amendment
// Retries email sends deferred while mnemosynec.org domain was verifying.
// Invoke manually or wire to a Supabase cron job.
// Deploy: supabase functions deploy flush-deferred-shares --project-ref ruuxzilgmuwddcofqecc

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceKey || !resendKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "server config error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: deferred, error: fetchErr } = await supabase
    .from("email_send_attempts")
    .select("id, recipient_email, message")
    .eq("status", "deferred-domain-verifying")
    .order("attempted_at", { ascending: true })
    .limit(50);

  if (fetchErr) {
    return new Response(
      JSON.stringify({ ok: false, error: fetchErr.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  let sent = 0;
  let stillDeferred = 0;
  let failed = 0;

  for (const row of deferred ?? []) {
    const emailHtml = `
      <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
        <h2 style="color:#22c55e;">Hello from Dr. Mnemosynec!</h2>
        <p>Someone thought you&rsquo;d appreciate this:</p>
        <p><a href="https://mnemosynec.org/" style="color:#22c55e;font-weight:bold;">MnemosyneC &mdash; Free, local AI substrate. No account required to start.</a></p>
        <p>It&rsquo;s cooperative AI that runs on your own hardware. Free at the base tier. You keep 83.3% of anything you earn on the platform.</p>
        ${row.message ? `<blockquote style="border-left:3px solid #22c55e;padding-left:1rem;color:#64748b;">${row.message}</blockquote>` : ""}
        <hr style="border-color:#1e293b;"/>
        <p style="font-size:0.75rem;color:#64748b;">You can <a href="https://mnemosynec.org/">visit the site</a> or ignore this message.</p>
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
        to: [row.recipient_email],
        subject:
          "Someone wanted you to see this \u2014 from Dr. Mnemosynec",
        html: emailHtml,
      }),
    });

    if (resendRes.ok) {
      await supabase
        .from("email_send_attempts")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", row.id);
      sent++;
    } else {
      const errText = await resendRes.text();
      const lower = errText.toLowerCase();
      const stillVerifying =
        resendRes.status === 422 ||
        resendRes.status === 403 ||
        lower.includes("domain") ||
        lower.includes("verification") ||
        lower.includes("sender identity");

      if (stillVerifying) {
        stillDeferred++;
      } else {
        await supabase
          .from("email_send_attempts")
          .update({
            status: "failed",
            error_detail: errText.substring(0, 500),
          })
          .eq("id", row.id);
        failed++;
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      sent,
      stillDeferred,
      failed,
      total: (deferred ?? []).length,
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
