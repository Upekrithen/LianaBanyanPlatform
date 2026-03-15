/**
 * TRANSACTIONAL EMAIL — Multi-purpose email sender for Liana Banyan
 * ==================================================================
 * Handles all transactional emails via Resend:
 *   - welcome: New member welcome email
 *   - pledge_confirmation: Project pledge confirmation
 *   - credit_purchase: Credit purchase confirmation
 *   - pledge_cancellation: Pledge cancellation/refund confirmation
 *   - milestone_update: Project milestone notification
 *
 * SEC-safe: All language uses "sponsorship", "backing", "service credits".
 * Never "investment", "returns", "equity", or "profit".
 *
 * Innovation #1546 — Transactional Email System (Session 8A)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Email Templates ────────────────────────────────────────────

function baseTemplate(title: string, content: string, footer?: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Liana Banyan</h1>
        <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Cooperative Service Platform</p>
      </div>

      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">${title}</h2>

      ${content}

      <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
        ${footer || ''}
        <p style="color: #999; font-size: 11px; line-height: 1.5; margin-top: 16px;">
          LIANA BANYAN CORPORATION &mdash; Wyoming C-Corp<br>
          Service credits are not securities or financial instruments.<br>
          No expectation of profit. Service access only.
        </p>
        <p style="color: #ccc; font-size: 10px; margin-top: 8px;">
          If you did not expect this email, please disregard it.
        </p>
      </div>
    </div>
  `;
}

function welcomeEmail(name: string): string {
  return baseTemplate(
    'Welcome to Liana Banyan',
    `
      <p style="font-size: 15px; line-height: 1.6;">
        Hello${name ? ` ${name}` : ''},
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Welcome to the Liana Banyan cooperative. You are now a member of a platform
        where creators keep 83.3% of every transaction and where every service
        runs at Cost+20% &mdash; no more, ever.
      </p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="font-weight: 600; margin: 0 0 8px 0;">Here is what you can do now:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Browse and back projects in the Marketplace</li>
          <li>Explore all 16 initiatives</li>
          <li>Earn Credits by participating in the platform</li>
          <li>Discover HexIsle &mdash; the cooperative world</li>
        </ul>
      </div>
      <p style="font-size: 14px; color: #666;">
        If you have any questions, visit our Community Support page or reach out
        at support@lianabanyan.com.
      </p>
    `
  );
}

function pledgeConfirmationEmail(
  name: string,
  projectName: string,
  amount: number,
  newBalance: number
): string {
  return baseTemplate(
    'As You Wish &mdash; Pledge Confirmed',
    `
      <p style="font-size: 15px; line-height: 1.6;">
        ${name ? `${name}, your` : 'Your'} sponsorship has been confirmed.
      </p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Project</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${projectName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Credits Pledged</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${amount.toLocaleString()}</td>
          </tr>
          <tr style="border-top: 1px solid #d1fae5;">
            <td style="padding: 8px 0; color: #666;">Remaining Balance</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${newBalance.toLocaleString()} Credits</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Your sponsorship directly supports this project. You can view and manage
        your pledges anytime from your dashboard. Pledges can be cancelled for
        a full credit refund before the project is fulfilled.
      </p>
    `
  );
}

function creditPurchaseEmail(
  name: string,
  creditsAmount: number,
  bonusCredits: number,
  totalCredits: number,
  paidAmount: string
): string {
  return baseTemplate(
    'Credit Purchase Confirmed',
    `
      <p style="font-size: 15px; line-height: 1.6;">
        ${name ? `${name}, your` : 'Your'} credit purchase is complete.
      </p>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Payment Amount</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">$${paidAmount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Credits Received</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${creditsAmount.toLocaleString()}</td>
          </tr>
          ${bonusCredits > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #666;">Bonus Credits</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #16a34a;">+${bonusCredits.toLocaleString()}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 1px solid #dbeafe;">
            <td style="padding: 8px 0; color: #666;">New Balance</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${totalCredits.toLocaleString()} Credits</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #666;">
        Credits maintain 1:1 USD value and never expire. Use them to back
        projects, access services, or participate across the cooperative.
      </p>
    `
  );
}

function pledgeCancellationEmail(
  name: string,
  projectName: string,
  refundedAmount: number,
  newBalance: number
): string {
  return baseTemplate(
    'Pledge Cancelled &mdash; Credits Refunded',
    `
      <p style="font-size: 15px; line-height: 1.6;">
        ${name ? `${name}, your` : 'Your'} pledge has been cancelled and credits refunded.
      </p>
      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Project</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${projectName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Refunded</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #16a34a;">+${refundedAmount.toLocaleString()} Credits</td>
          </tr>
          <tr style="border-top: 1px solid #fde68a;">
            <td style="padding: 8px 0; color: #666;">New Balance</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${newBalance.toLocaleString()} Credits</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #666;">
        Your credits have been fully restored. You can use them to back
        other projects anytime.
      </p>
    `
  );
}

function milestoneUpdateEmail(
  name: string,
  projectName: string,
  milestoneName: string,
  description: string
): string {
  return baseTemplate(
    `Project Update: ${projectName}`,
    `
      <p style="font-size: 15px; line-height: 1.6;">
        ${name ? `${name}, a` : 'A'} project you backed has reached a milestone!
      </p>
      <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="font-weight: 600; font-size: 16px; margin: 0 0 4px 0;">${milestoneName}</p>
        <p style="color: #666; font-size: 14px; margin: 0;">${description}</p>
      </div>
      <p style="font-size: 14px; color: #666;">
        Visit the project page for full details and updates.
      </p>
    `
  );
}

function outreachEmail(
  recipientName: string,
  senderName: string,
  body: string,
  ctaText: string,
  ctaUrl: string,
  cueCardType: string | null
): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="border-bottom: 3px solid #e94560; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1a1a2e; margin: 0;">Liana Banyan</h1>
        <p style="color: #666; margin: 5px 0 0;">A Worker-Owned Cooperative</p>
      </div>

      ${recipientName ? `<p>Dear ${recipientName},</p>` : ''}

      <div style="line-height: 1.8; color: #333;">
        ${body}
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${ctaUrl}" style="
          display: inline-block;
          background: #e94560;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
        ">${ctaText}</a>
      </div>

      ${cueCardType ? `
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This message was sent via a <strong>${cueCardType}</strong> cue card by ${senderName}.
          </p>
        </div>
      ` : ''}

      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #999;">
        <p>Liana Banyan Corporation &mdash; A worker-owned cooperative</p>
        <p>1,662 innovations. 7 USPTO provisional applications. One cooperative.</p>
        <p><a href="https://lianabanyan.com" style="color: #e94560;">lianabanyan.com</a></p>
      </div>
    </div>
  `;
}

// ─── Main Handler ───────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { type, email, data } = body;

    if (!type || !email) {
      return new Response(
        JSON.stringify({ error: 'type and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let subject: string;
    let html: string;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to Liana Banyan';
        html = welcomeEmail(data?.name || '');
        break;

      case 'pledge_confirmation':
        subject = `As You Wish — You backed ${data?.projectName || 'a project'}`;
        html = pledgeConfirmationEmail(
          data?.name || '',
          data?.projectName || 'Unknown Project',
          data?.amount || 0,
          data?.newBalance || 0
        );
        break;

      case 'credit_purchase':
        subject = 'Credit Purchase Confirmed';
        html = creditPurchaseEmail(
          data?.name || '',
          data?.creditsAmount || 0,
          data?.bonusCredits || 0,
          data?.totalCredits || 0,
          data?.paidAmount || '0'
        );
        break;

      case 'pledge_cancellation':
        subject = 'Pledge Cancelled — Credits Refunded';
        html = pledgeCancellationEmail(
          data?.name || '',
          data?.projectName || 'Unknown Project',
          data?.refundedAmount || 0,
          data?.newBalance || 0
        );
        break;

      case 'milestone_update':
        subject = `Milestone reached: ${data?.projectName || 'Project'}`;
        html = milestoneUpdateEmail(
          data?.name || '',
          data?.projectName || 'Unknown Project',
          data?.milestoneName || 'New Milestone',
          data?.description || ''
        );
        break;

      case 'outreach':
        subject = data?.subject || 'A message from Liana Banyan';
        html = outreachEmail(
          data?.recipientName || '',
          data?.senderName || 'Liana Banyan',
          data?.body || '',
          data?.ctaText || 'Learn More',
          data?.ctaUrl || 'https://lianabanyan.com',
          data?.cueCardType || null
        );
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Send via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Liana Banyan <noreply@lianabanyan.com>',
        to: [email],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Email delivery failed', detail: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await emailResponse.json();
    console.log(`[transactional-email] Sent ${type} to ${email}:`, result.id);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Transactional email error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
