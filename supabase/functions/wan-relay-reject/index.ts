// wan-relay-reject — Supabase Edge Function
// Records an invite rejection, updates sender cooldown, returns cooldown_until.
// SEG-V0153A-P1-REJECTION-COOLDOWN

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Decode a base64url string to UTF-8 text (Deno-compatible, no Buffer).
function decodeBase64url(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: { invite_token?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { invite_token, source } = body;
  if (!invite_token || !source) {
    return json({ error: 'Missing invite_token or source' }, 400);
  }
  if (source !== 'email_link' && source !== 'in_app') {
    return json({ error: 'source must be email_link or in_app' }, 400);
  }

  // ── Decode invite token ──────────────────────────────────────────────────────
  // Format: mnemo-invite-<base64url({peerId}:{nonce}:{expiresAt})>
  const PREFIX = 'mnemo-invite-';
  if (!invite_token.startsWith(PREFIX)) {
    return json({ error: 'Invalid token format: missing mnemo-invite- prefix' }, 400);
  }

  let sender_peer_id: string;
  try {
    const raw = decodeBase64url(invite_token.slice(PREFIX.length));
    sender_peer_id = raw.split(':')[0];
    if (!sender_peer_id) throw new Error('empty sender segment');
  } catch (e) {
    return json({ error: `Could not parse token: ${String(e)}` }, 400);
  }

  // ── Recipient identity (hashed — no raw email stored) ─────────────────────
  // Use JWT sub if authenticated, otherwise 'anon'.
  let recipientIdentifier = 'anon';
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const jwt = authHeader.slice(7);
      const payloadB64 = jwt.split('.')[1];
      if (payloadB64) {
        const payload = JSON.parse(atob(payloadB64));
        recipientIdentifier = payload.sub ?? payload.email ?? 'anon';
      }
    } catch { /* non-fatal — fall back to 'anon' */ }
  }
  const recipient_hash = await sha256Hex(recipientIdentifier);

  // ── Supabase service-role client ────────────────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Edge function misconfigured: missing SUPABASE env vars' }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── Insert rejection log ─────────────────────────────────────────────────────
  const { error: logErr } = await supabase.from('member_rejection_log').insert({
    sender_peer_id,
    recipient_hash,
    rejected_at: new Date().toISOString(),
    source,
  });
  if (logErr) {
    console.error('rejection log insert error:', logErr.message);
    // Non-fatal — still update the summary
  }

  // ── Upsert rejection summary (fetch-then-upsert for accurate increment) ────
  const { data: existing, error: fetchErr } = await supabase
    .from('member_rejection_summary')
    .select('total_rejections')
    .eq('sender_peer_id', sender_peer_id)
    .maybeSingle();

  if (fetchErr) {
    console.error('rejection summary fetch error:', fetchErr.message);
  }

  const newTotal = (existing?.total_rejections ?? 0) + 1;
  // Option 2 (Founder-ratified): store raw count; decay at invite gate time
  const cooldownMs = newTotal * 5 * 60 * 1000;
  const cooldown_until = new Date(Date.now() + cooldownMs).toISOString();

  const { error: upsertErr } = await supabase.from('member_rejection_summary').upsert(
    {
      sender_peer_id,
      total_rejections: newTotal,
      last_rejection_at: new Date().toISOString(),
      cooldown_until,
    },
    { onConflict: 'sender_peer_id' },
  );
  if (upsertErr) {
    console.error('rejection summary upsert error:', upsertErr.message);
    return json({ error: 'Failed to update rejection summary' }, 500);
  }

  return json({ ok: true, cooldown_until });
});
