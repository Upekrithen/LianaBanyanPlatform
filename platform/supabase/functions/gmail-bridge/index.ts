/**
 * GMAIL BRIDGE — Gmail Push → MoneyPenny Intake
 * ===============================================
 * Receives Gmail Push notifications via Google Cloud Pub/Sub,
 * fetches the actual email content via Gmail API, and forwards
 * it to the MoneyPenny inbox.
 *
 * Gmail Push sends: { emailAddress, historyId }
 * This function fetches the message and creates: { from, to, subject, bodyPreview }
 *
 * Setup requires:
 *   1. GCP project with Gmail API enabled
 *   2. Pub/Sub topic (e.g., projects/lianabanyan-403dc/topics/gmail-push)
 *   3. Push subscription → https://<SUPABASE_URL>/functions/v1/gmail-bridge
 *   4. Gmail watch on the inbox (gmail.users.watch)
 *   5. Supabase secrets:
 *      - GMAIL_CLIENT_ID
 *      - GMAIL_CLIENT_SECRET
 *      - GMAIL_REFRESH_TOKEN  (from initial OAuth consent)
 *      - GMAIL_WATCH_EMAIL    (the monitored inbox, e.g. hello@lianabanyan.com)
 *
 * Watch renewal: Gmail watches expire after 7 days.
 *   Set up a cron to call POST /gmail-bridge?action=renew-watch weekly.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Gmail API Helpers ──────────────────────────────────────────────

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

interface GmailAccessToken {
  access_token: string;
  expires_in: number;
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID');
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Gmail OAuth credentials in Supabase secrets');
  }

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data: GmailAccessToken = await resp.json();
  return data.access_token;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string; size: number };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string; size: number };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
  internalDate: string;
}

function getHeader(msg: GmailMessage, name: string): string {
  return msg.payload.headers.find(
    h => h.name.toLowerCase() === name.toLowerCase()
  )?.value || '';
}

function extractBody(msg: GmailMessage): string {
  // Try direct body (single-part messages)
  if (msg.payload.body?.data) {
    return decodeBase64Url(msg.payload.body.data);
  }

  // Try parts (multipart messages)
  if (msg.payload.parts) {
    // Prefer text/plain
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      // Recurse into nested parts
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
            return decodeBase64Url(subPart.body.data);
          }
        }
      }
    }
    // Fall back to text/html
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64Url(part.body.data);
        return stripHtml(html);
      }
    }
  }

  return msg.snippet || '';
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^"?([^"<]*)"?\s*<?([^>]+)>?$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ''),
      email: match[2].trim(),
    };
  }
  return { name: raw.split('@')[0], email: raw.trim() };
}

// ─── Gmail API Calls ────────────────────────────────────────────────

async function fetchHistory(
  accessToken: string,
  historyId: string,
  email: string
): Promise<string[]> {
  const url = `${GMAIL_API_BASE}/users/${email}/history` +
    `?startHistoryId=${historyId}&historyTypes=messageAdded&labelId=INBOX`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    if (resp.status === 404) {
      // historyId too old — fall back to latest messages
      return await fetchLatestMessageIds(accessToken, email, 5);
    }
    throw new Error(`History fetch failed: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  const messageIds: string[] = [];

  for (const record of data.history || []) {
    for (const added of record.messagesAdded || []) {
      if (added.message?.id && !messageIds.includes(added.message.id)) {
        messageIds.push(added.message.id);
      }
    }
  }

  return messageIds;
}

async function fetchLatestMessageIds(
  accessToken: string,
  email: string,
  count: number
): Promise<string[]> {
  const url = `${GMAIL_API_BASE}/users/${email}/messages` +
    `?maxResults=${count}&labelIds=INBOX&q=is:unread`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) return [];
  const data = await resp.json();
  return (data.messages || []).map((m: { id: string }) => m.id);
}

async function fetchMessage(
  accessToken: string,
  email: string,
  messageId: string
): Promise<GmailMessage> {
  const url = `${GMAIL_API_BASE}/users/${email}/messages/${messageId}?format=full`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    throw new Error(`Message fetch failed: ${resp.status}`);
  }

  return await resp.json();
}

async function renewWatch(accessToken: string, email: string, topic: string): Promise<void> {
  const url = `${GMAIL_API_BASE}/users/${email}/watch`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topicName: topic,
      labelIds: ['INBOX'],
    }),
  });

  if (!resp.ok) {
    throw new Error(`Watch renewal failed: ${resp.status} ${await resp.text()}`);
  }
}

// ─── Classification (reuse from moneypenny-intake) ──────────────────

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

const PATENT_DOMAINS = ['uspto.gov', 'wipo.int', 'epo.org'];
const LEGAL_DOMAINS = ['law.com', 'legalzoom.com', 'wyoming.gov'];

function classifyEmail(from: string, subject: string) {
  const domain = from.split('@')[1]?.toLowerCase() || '';
  const subjectLower = subject.toLowerCase();

  if (CROWN_DOMAINS.some(d => domain.endsWith(d))) {
    return { category: 'crown_response', priority: 1, isRedCarpet: true,
      actionTitle: `Crown response from ${from}: ${subject}` };
  }
  if (PRESS_DOMAINS.some(d => domain.endsWith(d))) {
    return { category: 'press', priority: 1, isRedCarpet: true,
      actionTitle: `Press inquiry from ${from}: ${subject}` };
  }
  if (PATENT_DOMAINS.some(d => domain.endsWith(d)) || LEGAL_DOMAINS.some(d => domain.endsWith(d))) {
    return { category: 'patent', priority: 1, isRedCarpet: false,
      actionTitle: `Patent/legal from ${from}: ${subject}` };
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
    return { category: 'press', priority: 2, isRedCarpet: false,
      actionTitle: `Partnership inquiry from ${from}: ${subject}` };
  }
  return { category: 'unknown', priority: 4, isRedCarpet: false };
}

// ─── Main Handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ─── Watch Renewal Endpoint ─────────────────────────────────
    if (action === 'renew-watch') {
      const watchEmail = Deno.env.get('GMAIL_WATCH_EMAIL') || 'hello@lianabanyan.com';
      const pubsubTopic = Deno.env.get('GMAIL_PUBSUB_TOPIC') ||
        'projects/lianabanyan-403dc/topics/gmail-push';
      const accessToken = await getAccessToken();
      await renewWatch(accessToken, watchEmail, pubsubTopic);

      return new Response(JSON.stringify({
        success: true,
        message: `Watch renewed for ${watchEmail}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Gmail Push Notification ────────────────────────────────
    const rawBody = await req.json();

    // Pub/Sub wraps the payload in message.data (base64)
    let notification: { emailAddress: string; historyId: string };

    if (rawBody?.message?.data) {
      const decoded = atob(rawBody.message.data);
      notification = JSON.parse(decoded);
    } else if (rawBody.emailAddress && rawBody.historyId) {
      notification = rawBody;
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unrecognized payload format. Expected Gmail Push notification.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { emailAddress, historyId } = notification;
    const accessToken = await getAccessToken();

    // Fetch new messages from history
    const messageIds = await fetchHistory(accessToken, historyId, emailAddress);

    if (messageIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        processed: 0,
        message: 'No new messages in history',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const msgId of messageIds) {
      try {
        // Dedup: check if this Gmail message ID is already in inbox
        const { data: existing } = await supabase
          .from('moneypenny_inbox')
          .select('id')
          .eq('action_notes', `gmail_id:${msgId}`)
          .limit(1);

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }

        const msg = await fetchMessage(accessToken, emailAddress, msgId);
        const fromRaw = getHeader(msg, 'From');
        const toRaw = getHeader(msg, 'To');
        const subject = getHeader(msg, 'Subject') || '(no subject)';
        const { name: fromName, email: fromEmail } = parseEmailAddress(fromRaw);
        const body = extractBody(msg);
        const bodyPreview = body.substring(0, 500);

        const classification = classifyEmail(fromEmail, subject);

        // Insert into moneypenny_inbox
        const { data: inboxItem, error: insertError } = await supabase
          .from('moneypenny_inbox')
          .insert({
            sender_email: fromEmail,
            sender_name: fromName || fromEmail.split('@')[0],
            subject,
            body_preview: bodyPreview,
            target_account: toRaw || emailAddress,
            category: classification.category,
            priority: classification.priority,
            status: 'new',
            action_notes: `gmail_id:${msgId}`,
            received_at: new Date(parseInt(msg.internalDate)).toISOString(),
          })
          .select('id')
          .single();

        if (insertError) {
          errors.push(`Insert failed for ${msgId}: ${insertError.message}`);
          continue;
        }

        // Create action for high-priority emails
        if (classification.actionTitle && classification.priority <= 2) {
          await supabase.from('moneypenny_actions').insert({
            title: classification.actionTitle,
            description: `Email from ${fromEmail}: "${subject}"`,
            source: 'auto',
            source_ref: inboxItem.id,
            priority: classification.priority === 1 ? 'urgent' : 'normal',
            status: 'pending',
          });
        }

        // Red Carpet signal for crown/press
        if (classification.isRedCarpet) {
          await supabase.from('red_carpet_signals').insert({
            invitee_name: fromName || fromEmail,
            invitee_email: fromEmail,
            signal_type: classification.category === 'crown_response'
              ? 'crown_response_needed' : 'threshold_alert',
            trigger_condition: `Inbound email: ${subject}`,
            status: 'pending',
          });
        }

        processed++;
      } catch (msgErr) {
        errors.push(`Error processing ${msgId}: ${msgErr instanceof Error ? msgErr.message : 'unknown'}`);
      }
    }

    // Store last processed historyId for next time
    await supabase.from('moneypenny_inbox').upsert({
      id: '00000000-0000-0000-0000-000000000001',
      sender_email: 'system@gmail-bridge',
      sender_name: 'Gmail Bridge',
      subject: `Last historyId: ${historyId}`,
      body_preview: JSON.stringify({
        lastHistoryId: historyId,
        lastProcessed: new Date().toISOString(),
        messagesProcessed: processed,
      }),
      target_account: emailAddress,
      category: 'system',
      priority: 5,
      status: 'processed',
      action_notes: `bridge_state:${historyId}`,
    }, { onConflict: 'id' });

    return new Response(JSON.stringify({
      success: true,
      processed,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      historyId,
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
