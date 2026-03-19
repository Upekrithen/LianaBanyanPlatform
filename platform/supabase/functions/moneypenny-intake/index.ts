/**
 * MONEYPENNY INTAKE — Email Classification & Inbox Population
 * ============================================================
 * Receives forwarded emails via webhook and classifies them into
 * the MoneyPenny inbox with priority and category assignment.
 *
 * Supports two intake modes:
 *   1. Gmail Pub/Sub — Google Cloud pushes new emails here
 *   2. Manual forward — Any email forwarding service POSTs here
 *
 * Classification rules (by sender domain):
 *   - Crown/VIP domains → priority 1, category "crown_response"
 *   - Press/media domains → priority 1, category "press"
 *   - Patent/legal domains → priority 1, category "patent"
 *   - @lianabanyan.com member → priority 2, category "member"
 *   - Known support patterns → priority 3, category "support"
 *   - Unknown → priority 4, category "unknown"
 *
 * Side effects:
 *   - Creates moneypenny_actions for high-priority emails
 *   - Creates red_carpet_signals for crown responses
 *
 * Request body:
 *   - from: string (sender email)
 *   - fromName?: string (sender display name)
 *   - to: string (recipient @lianabanyan.com address)
 *   - subject: string
 *   - bodyPreview: string (first 500 chars of body)
 *   - bodyFull?: string (full body for classification)
 *   - messageId?: string (Gmail message ID for dedup)
 *   - receivedAt?: string (ISO timestamp)
 *
 * For Gmail Pub/Sub, the body is a base64-encoded notification
 * containing the message metadata.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Classification Rules ──────────────────────────────────────────

const CROWN_DOMAINS = [
  'mackenzie-scott.com', 'craignewmark.com', 'ycombinator.com',
  'goldmansachs.com', 'bridgewater.com', 'sifma.org',
  'federalreserve.gov', 'sec.gov', 'ftc.gov',
  'whitehouse.gov', 'congress.gov', 'senate.gov',
];

const PRESS_DOMAINS = [
  'nytimes.com', 'washingtonpost.com', 'wsj.com', 'bloomberg.com',
  'reuters.com', 'apnews.com', 'bbc.co.uk', 'cnn.com',
  'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com',
  'forbes.com', 'fortune.com', 'businessinsider.com',
  'thepennyhoarder.com', 'npr.org', 'politico.com',
];

const PATENT_DOMAINS = [
  'uspto.gov', 'wipo.int', 'epo.org',
];

const LEGAL_DOMAINS = [
  'law.com', 'legalzoom.com', 'wyoming.gov',
];

interface EmailPayload {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  bodyPreview: string;
  bodyFull?: string;
  messageId?: string;
  receivedAt?: string;
}

interface GmailPubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface Classification {
  category: string;
  priority: number;
  isRedCarpet: boolean;
  actionTitle?: string;
}

function classifyEmail(from: string, subject: string, body?: string): Classification {
  const domain = from.split('@')[1]?.toLowerCase() || '';
  const subjectLower = subject.toLowerCase();

  if (CROWN_DOMAINS.some(d => domain.endsWith(d))) {
    return {
      category: 'crown_response',
      priority: 1,
      isRedCarpet: true,
      actionTitle: `Crown response from ${from}: ${subject}`,
    };
  }

  if (PRESS_DOMAINS.some(d => domain.endsWith(d))) {
    return {
      category: 'press',
      priority: 1,
      isRedCarpet: true,
      actionTitle: `Press inquiry from ${from}: ${subject}`,
    };
  }

  if (PATENT_DOMAINS.some(d => domain.endsWith(d)) || LEGAL_DOMAINS.some(d => domain.endsWith(d))) {
    return {
      category: 'patent',
      priority: 1,
      isRedCarpet: false,
      actionTitle: `Patent/legal from ${from}: ${subject}`,
    };
  }

  if (domain.endsWith('lianabanyan.com') || domain.endsWith('lianabanyan.biz')) {
    return { category: 'member', priority: 2, isRedCarpet: false };
  }

  if (subjectLower.includes('support') || subjectLower.includes('help') ||
      subjectLower.includes('issue') || subjectLower.includes('bug')) {
    return { category: 'support', priority: 3, isRedCarpet: false };
  }

  if (subjectLower.includes('partner') || subjectLower.includes('collab') ||
      subjectLower.includes('sponsor')) {
    return {
      category: 'press',
      priority: 2,
      isRedCarpet: false,
      actionTitle: `Partnership inquiry from ${from}: ${subject}`,
    };
  }

  return { category: 'unknown', priority: 4, isRedCarpet: false };
}

function parseGmailPubSub(rawBody: any): EmailPayload | null {
  try {
    const pubsub = rawBody as GmailPubSubMessage;
    if (pubsub?.message?.data) {
      const decoded = atob(pubsub.message.data);
      const parsed = JSON.parse(decoded);
      return {
        from: parsed.from || parsed.sender || '',
        fromName: parsed.fromName || parsed.senderName || '',
        to: parsed.to || parsed.recipient || '',
        subject: parsed.subject || '(no subject)',
        bodyPreview: (parsed.snippet || parsed.bodyPreview || '').substring(0, 500),
        messageId: parsed.messageId || pubsub.message.messageId,
        receivedAt: pubsub.message.publishTime,
      };
    }
  } catch { /* not a Pub/Sub message */ }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const rawBody = await req.json();

    // Try Gmail Pub/Sub format first, then direct POST
    const email = parseGmailPubSub(rawBody) || (rawBody as EmailPayload);

    if (!email.from || !email.subject) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: from, subject',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dedup check via messageId
    if (email.messageId) {
      const { data: existing } = await supabase
        .from('moneypenny_inbox')
        .select('id')
        .eq('action_notes', `gmail_id:${email.messageId}`)
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({
          success: true,
          duplicate: true,
          existingId: existing[0].id,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const classification = classifyEmail(email.from, email.subject, email.bodyFull);

    // ─── Insert into moneypenny_inbox ──────────────────────────────

    const { data: inboxItem, error: inboxError } = await supabase
      .from('moneypenny_inbox')
      .insert({
        sender_email: email.from,
        sender_name: email.fromName || email.from.split('@')[0],
        subject: email.subject,
        body_preview: email.bodyPreview || '',
        target_account: email.to || 'unknown',
        category: classification.category,
        priority: classification.priority,
        status: 'new',
        action_notes: email.messageId ? `gmail_id:${email.messageId}` : null,
        received_at: email.receivedAt || new Date().toISOString(),
      })
      .select('id')
      .single();

    if (inboxError) {
      throw new Error(`Inbox insert failed: ${inboxError.message}`);
    }

    // ─── Create action for high-priority emails ────────────────────

    if (classification.actionTitle && classification.priority <= 2) {
      await supabase.from('moneypenny_actions').insert({
        title: classification.actionTitle,
        description: `Email from ${email.from}: "${email.subject}"`,
        source: 'auto',
        source_ref: inboxItem.id,
        priority: classification.priority === 1 ? 'urgent' : 'normal',
        status: 'pending',
      });
    }

    // ─── Create Red Carpet signal for crown/press ──────────────────

    if (classification.isRedCarpet) {
      await supabase.from('red_carpet_signals').insert({
        invitee_name: email.fromName || email.from,
        invitee_email: email.from,
        signal_type: classification.category === 'crown_response'
          ? 'crown_response_needed'
          : 'threshold_alert',
        trigger_condition: `Inbound email: ${email.subject}`,
        status: 'pending',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      inboxId: inboxItem.id,
      classification: {
        category: classification.category,
        priority: classification.priority,
        isRedCarpet: classification.isRedCarpet,
      },
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
