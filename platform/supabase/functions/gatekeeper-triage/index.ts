/**
 * GATEKEEPER TRIAGE — MoneyPenny AI Receptionist
 * ================================================
 * Public-facing contact form handler. Anyone can submit.
 * MoneyPenny screens via Claude, assigns tier, triggers SMS/email.
 *
 * Tier system:
 *   1 — Whitelist match (Crown recipients, known VIPs)
 *   2 — Claude flags as important (public figure, press, partnership)
 *   3 — Standard relevant message
 *   4 — Blocked (blacklist match or spam)
 *
 * Innovation #2021 | Knight Session 134
 * verify_jwt = false (public contact form)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactPayload {
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  sender_organization?: string;
  sender_title?: string;
  subject: string;
  message_body: string;
  member_id?: string | null;
}

interface ClaudeAnalysis {
  is_public_figure: boolean;
  public_figure_context: string | null;
  summary: string;
  category: 'partnership' | 'press' | 'member_issue' | 'collaboration' | 'investment_inquiry' | 'spam' | 'other';
  relevance_score: number;
  tier: number;
}

// ─── Rate Limiting (in-memory, per-instance) ────────────────────

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

// ─── Claude Analysis ────────────────────────────────────────────

async function analyzeWithClaude(
  payload: ContactPayload,
  anthropicKey: string,
): Promise<ClaudeAnalysis | null> {
  const systemPrompt = `You are MoneyPenny, an AI receptionist for Liana Banyan Corporation — a cooperative service platform.
Analyze this inbound contact form submission and return ONLY valid JSON:
{
  "is_public_figure": boolean,
  "public_figure_context": string or null,
  "summary": "one-line intent summary",
  "category": "partnership"|"press"|"member_issue"|"collaboration"|"investment_inquiry"|"spam"|"other",
  "relevance_score": 0-100,
  "tier": 2 or 3
}

Rules:
- Tier 2 = important (public figure, press, partnership, notable organization)
- Tier 3 = standard relevant message
- If category = "investment_inquiry", set tier 2 but note: Liana Banyan is a member-owned cooperative. We do not accept outside investment.
- If spam detected, set tier 4 and relevance_score 0.
- Be concise. Summary must be one sentence.`;

  const userPrompt = `Name: ${payload.sender_name}
Email: ${payload.sender_email}
Organization: ${payload.sender_organization || 'not provided'}
Title: ${payload.sender_title || 'not provided'}
Subject: ${payload.subject}
Message: ${payload.message_body.substring(0, 1000)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data.content?.[0]?.text;
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ClaudeAnalysis;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ─── SMS via MoneyPenny SMS queue ───────────────────────────────

async function queueSMS(
  supabase: ReturnType<typeof createClient>,
  message: string,
  priority: number,
  sourceId: string,
) {
  const founderPhone = Deno.env.get('FOUNDER_PHONE_NUMBER');
  if (!founderPhone) return;

  await supabase.from('moneypenny_sms_queue').insert({
    recipient_phone: founderPhone,
    message_body: message,
    priority,
    source: 'gatekeeper',
    source_id: sourceId,
  });
}

// ─── Auto-response email via Resend ─────────────────────────────

async function sendAutoResponse(
  recipientEmail: string,
  recipientName: string,
  subjectLine: string,
  bodyText: string,
) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MoneyPenny <noreply@lianabanyan.com>',
        to: recipientEmail,
        subject: subjectLine,
        text: `Dear ${recipientName},\n\n${bodyText}`,
      }),
    });
  } catch { /* non-critical — log silently */ }
}

// ─── Main Handler ───────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown';

    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: ContactPayload = await req.json();

    if (!payload.sender_name || !payload.sender_email || !payload.message_body) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, and message are required.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Check whitelist/blacklist ──────────────────────────────
    const nameLower = payload.sender_name.toLowerCase();
    const emailLower = payload.sender_email.toLowerCase();

    const { data: lists } = await supabase
      .from('gatekeeper_lists')
      .select('list_type, value')
      .in('list_type', ['whitelist', 'blacklist']);

    const whitelistValues = (lists || []).filter(l => l.list_type === 'whitelist').map(l => l.value.toLowerCase());
    const blacklistValues = (lists || []).filter(l => l.list_type === 'blacklist').map(l => l.value.toLowerCase());

    const isWhitelisted = whitelistValues.some(v =>
      nameLower.includes(v) || emailLower.includes(v)
    );
    const isBlacklisted = blacklistValues.some(v =>
      nameLower.includes(v) || emailLower.includes(v)
    );

    let tier = 3;
    let claudeAnalysis: ClaudeAnalysis | null = null;
    let isMember = false;

    if (payload.member_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', payload.member_id)
        .single();
      if (profile) isMember = true;
    }

    if (isBlacklisted) {
      tier = 4;
    } else if (isMember || isWhitelisted) {
      tier = 1;
    } else {
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (anthropicKey) {
        claudeAnalysis = await analyzeWithClaude(payload, anthropicKey);
        if (claudeAnalysis) {
          tier = claudeAnalysis.tier;
          if (claudeAnalysis.category === 'spam') tier = 4;
        }
      }
    }

    // ── Insert into gatekeeper_contacts ────────────────────────
    const { data: contact, error: insertError } = await supabase
      .from('gatekeeper_contacts')
      .insert({
        sender_name: payload.sender_name,
        sender_email: payload.sender_email,
        sender_phone: payload.sender_phone || null,
        sender_organization: payload.sender_organization || null,
        sender_title: payload.sender_title || null,
        subject: payload.subject || '(no subject)',
        message_body: payload.message_body,
        source: isMember ? 'member_contact' : 'contact_form',
        tier,
        relevance_score: claudeAnalysis?.relevance_score ?? null,
        claude_summary: claudeAnalysis?.summary
          ?? (isMember ? 'Authenticated member contact' : null)
          ?? (isWhitelisted ? 'Whitelist match — Crown/VIP contact' : null),
        claude_category: claudeAnalysis?.category
          ?? (isMember ? 'member_issue' : null)
          ?? (isWhitelisted ? 'partnership' : null),
        is_public_figure: claudeAnalysis?.is_public_figure ?? isWhitelisted,
        public_figure_context: claudeAnalysis?.public_figure_context ?? null,
        status: 'pending',
        member_id: payload.member_id || null,
      })
      .select('id')
      .single();

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    // ── Tier 1+2: SMS alert to Founder ─────────────────────────
    if (tier <= 2) {
      const urgency = tier === 1 ? '🚨 PRIORITY' : '📌 FLAGGED';
      const catLabel = claudeAnalysis?.category || 'VIP';
      const smsBody = `${urgency} Contact: ${payload.sender_name} (${catLabel})\n"${payload.subject}"\n${claudeAnalysis?.summary || payload.message_body.substring(0, 100)}`;

      await queueSMS(supabase, smsBody, tier, contact.id);

      await supabase
        .from('gatekeeper_contacts')
        .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
        .eq('id', contact.id);
    }

    // ── Tier 2+3: Auto-response email ──────────────────────────
    if (tier === 2 || tier === 3) {
      const { data: template } = await supabase
        .from('gatekeeper_templates')
        .select('subject_line, body_text')
        .eq('tier', tier)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (template) {
        await sendAutoResponse(
          payload.sender_email,
          payload.sender_name,
          template.subject_line || 'Thank you for contacting Liana Banyan',
          template.body_text,
        );
      }
    }

    // ── Tier 4: log silently (already inserted) ────────────────

    // ── Create MoneyPenny action for Tier 1 ────────────────────
    if (tier === 1) {
      await supabase.from('moneypenny_actions').insert({
        title: `Gatekeeper: ${payload.sender_name} — ${payload.subject}`,
        description: claudeAnalysis?.summary || `VIP contact from ${payload.sender_name}`,
        source: 'auto',
        source_ref: contact.id,
        priority: 'urgent',
        status: 'pending',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Your message has been received. MoneyPenny will ensure it reaches the right person.',
      contactId: contact.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
