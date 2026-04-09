/**
 * DISPATCH-LETTER — Letter Dispatch Pipeline for Opening Gambit
 * ==============================================================
 * Sends a single letter via the transactional email system.
 * Enforces: Founder lock, rate limit (10/hr), personalized Red Carpet URL.
 *
 * Called from LetterDispatchPage with { letter_dispatch_id: string }
 * K362 / B086 — April 7, 2026
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_PER_HOUR = 10;

function letterEmailTemplate(
  recipientName: string,
  customIntro: string | null,
  letterBody: string | null,
  redCarpetSlug: string | null,
  subjectLine: string | null,
): string {
  const redCarpetUrl = redCarpetSlug
    ? `https://lianabanyan.com/RedCarpet/${redCarpetSlug}`
    : 'https://lianabanyan.com/RedCarpet';

  const introBlock = customIntro
    ? `<p style="font-size: 15px; line-height: 1.8; margin-bottom: 16px;">${customIntro}</p>`
    : '';

  const bodyBlock = letterBody
    ? letterBody
        .split('\n\n')
        .map((p: string) => `<p style="font-size: 15px; line-height: 1.8; margin-bottom: 12px;">${p}</p>`)
        .join('\n')
    : '<p style="font-size: 15px; line-height: 1.8;">A personal letter has been prepared for you. Please visit your personalized walkthrough to read it.</p>';

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
      <div style="border-bottom: 3px solid #b8860b; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Liana Banyan</h1>
        <p style="color: #666; margin: 5px 0 0; font-size: 14px;">A Cooperative Service Platform</p>
      </div>

      <p style="font-size: 15px; line-height: 1.8; margin-bottom: 16px;">Dear ${recipientName},</p>

      ${introBlock}

      ${bodyBlock}

      <div style="margin: 32px 0; text-align: center;">
        <a href="${redCarpetUrl}" style="
          display: inline-block;
          background: #b8860b;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          font-family: system-ui, sans-serif;
        ">Your Personalized Walkthrough</a>
        <p style="color: #999; font-size: 12px; margin-top: 8px;">
          A personalized walkthrough has been prepared for you
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.8; margin-top: 24px;">
        With respect and conviction,
      </p>
      <p style="font-size: 15px; line-height: 1.8; font-weight: bold;">
        Jonathan Ray Jones<br>
        <span style="font-weight: normal; color: #666; font-size: 13px;">
          Founder, Liana Banyan Corporation
        </span>
      </p>

      <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 16px;">
        <p style="color: #999; font-size: 11px; line-height: 1.6; font-family: system-ui, sans-serif;">
          LIANA BANYAN CORPORATION &mdash; Wyoming C-Corp (EIN 41-2797446)<br>
          2,224 innovations &bull; 12 provisional patent applications &bull; ~2,393 formal claims<br>
          Service credits are not securities or financial instruments.<br>
          <a href="https://lianabanyan.com" style="color: #b8860b;">lianabanyan.com</a>
        </p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const sb = createClient(supabaseUrl, supabaseKey);

    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json();
    const { letter_dispatch_id } = body;

    if (!letter_dispatch_id) {
      return new Response(
        JSON.stringify({ error: 'letter_dispatch_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch letter
    const { data: letter, error: fetchErr } = await sb
      .from('letter_dispatch_queue')
      .select('*')
      .eq('id', letter_dispatch_id)
      .single();

    if (fetchErr || !letter) {
      return new Response(
        JSON.stringify({ error: 'Letter not found', detail: fetchErr?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Must be in 'queued' status
    if (letter.status !== 'queued') {
      return new Response(
        JSON.stringify({ error: `Letter is '${letter.status}', must be 'queued' to send` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Must have email
    if (!letter.recipient_email) {
      return new Response(
        JSON.stringify({ error: `No email address for ${letter.recipient_name}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Rate limit check: max 10 per hour
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await sb
      .from('letter_send_log')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', oneHourAgo)
      .eq('success', true);

    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: `Rate limit reached: ${RATE_LIMIT_PER_HOUR} letters/hour. Try again later.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build email
    const subject = letter.subject_line || `A personal letter from the Founder of Liana Banyan`;
    const html = letterEmailTemplate(
      letter.recipient_name,
      letter.custom_intro,
      letter.letter_body,
      letter.red_carpet_slug,
      letter.subject_line,
    );

    // Send via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Jonathan Ray Jones — Liana Banyan <founder@lianabanyan.com>',
        to: [letter.recipient_email],
        subject,
        html,
      }),
    });

    const resendResult = await emailResponse.json();

    if (!emailResponse.ok) {
      // Log failure
      await sb.from('letter_send_log').insert({
        dispatch_id: letter_dispatch_id,
        email_message_id: null,
        success: false,
        error_message: JSON.stringify(resendResult),
      });

      // Mark bounced
      await sb
        .from('letter_dispatch_queue')
        .update({ status: 'bounced' })
        .eq('id', letter_dispatch_id);

      return new Response(
        JSON.stringify({ error: 'Email delivery failed', detail: resendResult }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const emailId = resendResult.id;

    // Log success
    await sb.from('letter_send_log').insert({
      dispatch_id: letter_dispatch_id,
      email_message_id: emailId,
      success: true,
    });

    // Update dispatch status
    await sb
      .from('letter_dispatch_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_message_id: emailId,
      })
      .eq('id', letter_dispatch_id);

    console.log(`[dispatch-letter] Sent to ${letter.recipient_name} <${letter.recipient_email}> — ID: ${emailId}`);

    return new Response(
      JSON.stringify({ success: true, emailId, recipient: letter.recipient_name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[dispatch-letter] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
