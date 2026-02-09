/**
 * RED CARPET VERIFICATION EDGE FUNCTION
 * ======================================
 * Two actions:
 *   1. "send-code" — Generate a 6-digit code, store it, send to email
 *   2. "verify-code" — Check the code against stored record
 *
 * Called from the /RedCarpet page when a domain-matched email is entered.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action } = body;

    // ─── ACTION: SEND CODE ───
    if (action === 'send-code') {
      const { email, recipientId, recipientName, category, domain } = body;

      if (!email || !domain) {
        return new Response(
          JSON.stringify({ error: 'Email and domain required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      // Insert the access record with pending status
      const { data: record, error: insertError } = await supabase
        .from('red_carpet_access')
        .insert({
          email,
          domain,
          recipient_id: recipientId || null,
          recipient_name: recipientName || null,
          category: category || null,
          entry_mode: 'domain-pending',
          verification_code: code,
          code_expires_at: expiresAt,
          user_agent: req.headers.get('user-agent') || null,
          referrer_url: req.headers.get('referer') || null,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // ─── SEND EMAIL ───
      // Try Resend if API key is configured
      const resendKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendKey) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Liana Banyan <noreply@lianabanyan.com>',
              to: [email],
              subject: `Your verification code: ${code}`,
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                  <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Liana Banyan</h1>
                  <p style="color: #666; margin-bottom: 32px;">Red Carpet Verification</p>
                  
                  <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #666; font-size: 14px; margin-bottom: 8px;">Your verification code</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${code}</div>
                    <p style="color: #999; font-size: 12px; margin-top: 12px;">Expires in 15 minutes</p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    We recognized your organization and have prepared a personalized walkthrough for you. 
                    Enter this code to continue.
                  </p>
                  
                  <p style="color: #999; font-size: 12px; margin-top: 32px;">
                    If you didn't request this code, you can safely ignore this email.<br>
                    LIANA BANYAN CORPORATION — Wyoming C-Corp
                  </p>
                </div>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error('Resend error:', await emailResponse.text());
          } else {
            console.log(`Verification code sent to ${email}`);
          }
        } catch (emailErr) {
          console.error('Email send failed:', emailErr);
          // Don't fail the request — code is still stored
        }
      } else {
        // No email service configured — log code for development
        console.log(`[DEV] Verification code for ${email}: ${code}`);
        console.log(`[DEV] No RESEND_API_KEY configured. Set it to enable email delivery.`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          accessId: record.id,
          message: 'Verification code sent to your email',
          // In development, include code for testing (remove in production)
          ...(resendKey ? {} : { devCode: code }),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── ACTION: VERIFY CODE ───
    if (action === 'verify-code') {
      const { accessId, code } = body;

      if (!accessId || !code) {
        return new Response(
          JSON.stringify({ error: 'Access ID and code required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the record
      const { data: record, error: fetchError } = await supabase
        .from('red_carpet_access')
        .select('*')
        .eq('id', accessId)
        .single();

      if (fetchError || !record) {
        return new Response(
          JSON.stringify({ error: 'Record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check brute force (max 5 attempts)
      if (record.verification_attempts >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check expiration
      if (new Date(record.code_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Code expired. Please request a new code.' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment attempts
      await supabase
        .from('red_carpet_access')
        .update({ verification_attempts: record.verification_attempts + 1 })
        .eq('id', accessId);

      // Check code
      if (record.verification_code !== code.trim()) {
        return new Response(
          JSON.stringify({ error: 'Invalid code', attemptsRemaining: 4 - record.verification_attempts }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // SUCCESS — Mark as verified
      await supabase
        .from('red_carpet_access')
        .update({
          entry_mode: 'domain-verified',
          verified_at: new Date().toISOString(),
        })
        .eq('id', accessId);

      console.log(`✅ Verified: ${record.email} (${record.domain}) → ${record.recipient_name}`);

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          recipientId: record.recipient_id,
          recipientName: record.recipient_name,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action. Use "send-code" or "verify-code".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Red carpet verification error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
