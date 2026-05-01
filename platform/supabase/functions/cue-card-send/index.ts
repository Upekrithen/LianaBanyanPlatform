/**
 * cue-card-send — KN087 / BP009
 * ============================================================
 * Receives a one-button Cue Card send request, creates a
 * creator_referrals row (pending state), arms the vesting
 * trigger, and dispatches the Cue Card email via Resend.
 *
 * BRIDLE v11 compliance:
 *   Rule 1: Integrates with EXISTING creator_referrals.
 *   Rule 2: No fiat cashout — Marks/Credits closed-loop.
 *   Rule 3: NOT MLM. Flat per direct referral. No downstream cut.
 *   Rule 4: Rewards vest at HANDSHAKE_COMPLETED, not at send time.
 *   Rule 5: license_door (AGPL | Apache) persisted and applied to email template.
 *   Rule 6: Kallistra framing — "make more WITH us."
 *
 * Request body:
 *   sender_id      UUID       — authenticated user
 *   recipient_email string   — email/handle of recipient
 *   platform        string   — source platform
 *   personal_message string  — optional personal note
 *   license_door    "AGPL"|"Apache"
 *
 * Response:
 *   { success, referral_id, tier_name, marks_per_ref }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_BOUNDARIES = [
  { name: 'Pioneer',     upTo: 100,   marks: 10   },
  { name: 'Vanguard',    upTo: 500,   marks: 5    },
  { name: 'Pathfinder',  upTo: 2000,  marks: 3    },
  { name: 'Trailblazer', upTo: 10000, marks: 2    },
  { name: 'Guide',       upTo: 50000, marks: 1.5  },
  { name: 'Ambassador',  upTo: Infinity, marks: 1 },
];

function getTierForCount(vestedCount: number) {
  for (const tier of TIER_BOUNDARIES) {
    if (vestedCount < tier.upTo) return tier;
  }
  return TIER_BOUNDARIES[TIER_BOUNDARIES.length - 1];
}

function buildCueCardEmail(params: {
  senderName: string;
  recipientEmail: string;
  licenseDoor: 'AGPL' | 'Apache';
  personalMessage: string | null;
  referralToken: string;
}) {
  const { senderName, licenseDoor, personalMessage, referralToken } = params;
  const downloadUrl = `https://lianabanyan.com/lb-frame?ref=${referralToken}&door=${licenseDoor}`;
  const licenseLabel = licenseDoor === 'Apache' ? 'Big-Guy (Apache 2.0)' : 'Community (AGPL v3)';
  const licenseDesc =
    licenseDoor === 'Apache'
      ? 'Permissive license — integrate into proprietary products while keeping your IP.'
      : 'Open-source cooperative license — modifications stay open, community-protected.';

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <div style="border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #0d9488; margin: 0; font-size: 28px;">LB Frame</h1>
        <p style="color: #666; margin: 4px 0 0; font-size: 14px;">by Liana Banyan Corporation — Cooperative Substrate</p>
      </div>

      <p style="font-size: 16px; line-height: 1.7;">
        ${senderName ? `<strong>${senderName}</strong> thought you'd find this useful.` : 'Someone thought you'd find this useful.'}
      </p>

      ${personalMessage ? `
        <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="font-style: italic; color: #334155; margin: 0; font-size: 15px;">"${personalMessage}"</p>
        </div>
      ` : ''}

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a;">I'm not here to compete with you.</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 16px;">
          I'm inviting you into something bigger.
          <br><br>
          <strong>What you keep:</strong> Your brand. Your customers. Your IP. Your tools.<br>
          <strong>What you gain:</strong> Access to 2,267 cooperative innovations. Substrate that makes
          cheaper AI perform like expensive AI. A network that adds without cannibalizing.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; font-size: 14px; color: #065f46;">
            <strong>Your door:</strong> ${licenseLabel}<br>
            <span style="color: #047857;">${licenseDesc}</span>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.3px;">
          Download LB Frame
        </a>
        <p style="margin: 10px 0 0; font-size: 12px; color: #94a3b8;">Takes 2 minutes. Runs a Handshake that configures your environment. Then you're in.</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin: 0;">
          LIANA BANYAN CORPORATION — Wyoming C-Corp<br>
          Cooperative Service Platform · Cost+20% margin · 83.3% creator allocation<br>
          Service Marks are closed-loop cooperative participation allocation — no fiat redemption, ever.<br>
          <a href="https://lianabanyan.com" style="color: #0d9488;">lianabanyan.com</a>
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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;

    const db = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      sender_id,
      recipient_email,
      platform = 'email',
      personal_message = null,
      license_door = 'AGPL',
    } = body;

    if (!sender_id || !recipient_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'sender_id and recipient_email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['AGPL', 'Apache'].includes(license_door)) {
      return new Response(
        JSON.stringify({ success: false, error: 'license_door must be AGPL or Apache' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get sender's vested count for tier calculation
    const { count: vestedCount } = await db
      .from('creator_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', sender_id)
      .eq('handshake_vesting_state', 'REWARDS_VESTED');

    const tier = getTierForCount(vestedCount ?? 0);

    // Get sender's display name
    const { data: profile } = await db
      .from('profiles')
      .select('full_name, username')
      .eq('id', sender_id)
      .single();

    const senderName = profile?.full_name || profile?.username || 'A Liana Banyan member';

    // Create creator_referrals row (BRIDLE Rule 1 — use existing table)
    const { data: referral, error: refErr } = await db
      .from('creator_referrals')
      .insert({
        referrer_id: sender_id,
        referred_handle: recipient_email,
        referred_platform: platform in ['instagram', 'etsy', 'tiktok', 'email', 'other']
          ? platform : 'other',
        recipient_email,
        personal_message,
        license_door,
        handshake_vesting_state: 'PENDING_RECIPIENT_DOWNLOAD',
      })
      .select('id')
      .single();

    if (refErr || !referral) {
      console.error('[cue-card-send] referral insert error:', refErr);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create referral record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dispatch Cue Card email via Resend (if API key configured)
    if (resendKey && recipient_email.includes('@')) {
      const html = buildCueCardEmail({
        senderName,
        recipientEmail: recipient_email,
        licenseDoor: license_door,
        personalMessage: personal_message,
        referralToken: referral.id,
      });

      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Liana Banyan <noreply@lianabanyan.com>',
          to: [recipient_email],
          subject: `${senderName} sent you an LB Frame Cue Card`,
          html,
        }),
      });

      if (!emailResp.ok) {
        console.warn('[cue-card-send] email failed (referral row still created):', await emailResp.text());
      }
    }

    console.log(`[cue-card-send] Referral ${referral.id} created. Sender ${sender_id} tier: ${tier.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        referral_id: referral.id,
        tier_name: tier.name,
        marks_per_ref: tier.marks,
        vesting_state: 'PENDING_RECIPIENT_DOWNLOAD',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[cue-card-send] error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
