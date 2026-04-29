/**
 * FAN-OUT-SIX-DEGREES — Notify members who flagged Six-Degrees on a letter
 * =========================================================================
 * K537 / B131 — Glass Door Open Outreach
 * Innovation #2262 The Glass Door + A&A #2327 candidate
 *
 * Called by dispatch-outreach-letter after successful formal dispatch.
 * Sends every member who set six_degrees_flag=true on this letter a
 * personalized introduction-invitation email.
 *
 * POST body: { letter_id: string }
 * Returns: { ok: true, fanned_out: number, skipped: number }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildFanOutEmail(
  recipientName: string,
  letterSlug: string,
  memberName: string,
  platformUrl: string,
): { subject: string; html: string } {
  const letterUrl = `${platformUrl}/outreach/${letterSlug}`;
  const subject = `You flagged that you know ${recipientName} — we just dispatched their letter`;
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 22px; font-weight: bold; margin: 0;">Liana Banyan</h1>
        <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Glass Door — Open Outreach</p>
      </div>

      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">
        We dispatched the letter to ${recipientName}.
      </h2>

      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Hi ${memberName},
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Earlier, when the letter to <strong>${recipientName}</strong> appeared on our Glass Door,
        you flagged that you personally know them. We just formally dispatched that letter.
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        If you'd like to make an introduction, here's a starter template you can adapt:
      </p>

      <div style="background: #f9fafb; border-left: 3px solid #d4a853; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
        <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.7;">
          <em>"Hey ${recipientName}, I'm a member of Liana Banyan — a cooperative service platform
          that puts 83.3% of revenue directly back to the people doing the work. The Founder reached out
          to you directly; I wanted to add a personal note that I think this is worth your time.
          The letter is at: ${letterUrl}"</em>
        </p>
      </div>

      <p style="font-size: 14px; line-height: 1.7; color: #555;">
        There's no pressure — this is purely your call. You flagged it; we're honoring that signal
        by letting you know the letter is now in play. Totally fine to sit this one out.
      </p>

      <div style="margin: 28px 0;">
        <a href="${letterUrl}"
           style="display: inline-block; background: #d4a853; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View the Letter on Glass Door →
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
        <p style="color: #999; font-size: 11px; line-height: 1.5; margin: 0;">
          LIANA BANYAN CORPORATION — Wyoming C-Corp<br>
          Glass Door Open Outreach: Our outreach is on the record before it arrives.<br>
          Membership: $5/year, identical for all members. A&A #2262, #2327 candidate.
        </p>
      </div>
    </div>
  `;
  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const platformUrl = Deno.env.get("PUBLIC_PLATFORM_URL") || "https://lianabanyan.com";

    const supabase = createClient(supabaseUrl, serviceKey);

    const { letter_id } = await req.json();
    if (!letter_id) {
      return new Response(
        JSON.stringify({ error: "letter_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch letter
    const { data: letter, error: letterErr } = await supabase
      .from("outreach_letters")
      .select("recipient_name, slug")
      .eq("letter_id", letter_id)
      .single();

    if (letterErr || !letter) {
      return new Response(
        JSON.stringify({ error: "Letter not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch all flaggers via the view
    const { data: flaggers, error: flagErr } = await supabase
      .from("outreach_six_degrees_flaggers")
      .select("member_id, email, full_name")
      .eq("letter_id", letter_id);

    if (flagErr) {
      return new Response(
        JSON.stringify({ error: flagErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!flaggers || flaggers.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, fanned_out: 0, skipped: 0, message: "No Six-Degrees flaggers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let fanned_out = 0;
    let skipped = 0;

    for (const flagger of flaggers) {
      if (!flagger.email) {
        skipped++;
        continue;
      }

      const memberName = flagger.full_name || "Member";
      const { subject, html } = buildFanOutEmail(
        letter.recipient_name,
        letter.slug,
        memberName,
        platformUrl,
      );

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Liana Banyan <outreach@lianabanyan.com>",
          to: [flagger.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        fanned_out++;
        console.log(`[fan-out-six-degrees] Sent to ${flagger.email} for letter ${letter.slug}`);
      } else {
        skipped++;
        const resBody = await res.text();
        console.error(`[fan-out-six-degrees] Failed to send to ${flagger.email}: ${resBody}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, fanned_out, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[fan-out-six-degrees] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
