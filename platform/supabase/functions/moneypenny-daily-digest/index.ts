/**
 * MONEYPENNY DAILY DIGEST — Morning briefing for the Founder
 * ============================================================
 * Runs daily at 8 AM (configured via Supabase Dashboard cron).
 * Compiles yesterday's activity into a single SMS + inbox entry.
 *
 * Sections:
 *   1. Gatekeeper summary (contacts by tier)
 *   2. MoneyPenny inbox summary (emails classified)
 *   3. Pending actions count
 *   4. Social post stats
 *
 * Innovation #2021 (Gatekeeper integration) | Knight Session 134
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const since = yesterday.toISOString();

    // ── Gatekeeper Contacts ────────────────────────────────────
    const { data: gatekeeperContacts } = await supabase
      .from('gatekeeper_contacts')
      .select('tier, sender_name, subject, claude_summary')
      .gte('created_at', since);

    const gc = gatekeeperContacts || [];
    const tier1 = gc.filter(c => c.tier === 1);
    const tier2 = gc.filter(c => c.tier === 2);
    const tier3 = gc.filter(c => c.tier === 3);
    const tier4 = gc.filter(c => c.tier === 4);

    // ── MoneyPenny Inbox ───────────────────────────────────────
    const { count: inboxCount } = await supabase
      .from('moneypenny_inbox')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);

    // ── Pending Actions ────────────────────────────────────────
    const { count: pendingActions } = await supabase
      .from('moneypenny_actions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // ── Social Drafts ──────────────────────────────────────────
    const { count: socialDrafts } = await supabase
      .from('moneypenny_social_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft');

    // ── Compile Digest ─────────────────────────────────────────
    const lines: string[] = [
      `☀️ Daily Digest — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
      '',
    ];

    // Gatekeeper section
    lines.push(`📨 GATEKEEPER: ${gc.length} contact${gc.length !== 1 ? 's' : ''}`);
    lines.push(`  ${tier1.length} priority · ${tier2.length} flagged · ${tier3.length} standard · ${tier4.length} blocked`);

    if (tier1.length > 0 || tier2.length > 0) {
      lines.push('');
      const priorityContacts = [...tier1, ...tier2];
      for (const c of priorityContacts.slice(0, 5)) {
        const summary = c.claude_summary || c.subject || '(no subject)';
        lines.push(`  ⭐ ${c.sender_name}: ${summary}`);
      }
      if (priorityContacts.length > 5) {
        lines.push(`  ...and ${priorityContacts.length - 5} more`);
      }
    }

    lines.push('');
    lines.push(`📬 Inbox: ${inboxCount || 0} new emails`);
    lines.push(`📋 ${pendingActions || 0} actions pending`);
    lines.push(`📝 ${socialDrafts || 0} social drafts awaiting approval`);

    const digestText = lines.join('\n');

    // ── Send SMS ───────────────────────────────────────────────
    const founderPhone = Deno.env.get('FOUNDER_PHONE_NUMBER');
    if (founderPhone) {
      await supabase.from('moneypenny_sms_queue').insert({
        recipient_phone: founderPhone,
        message_body: digestText,
        priority: 2,
        source: 'daily_digest',
      });
    }

    // ── Store digest in social_daily_digests ────────────────────
    await supabase.from('social_daily_digests').insert({
      digest_date: new Date().toISOString().split('T')[0],
      content: digestText,
      status: 'sent',
      platform: 'sms',
      engagement_data: {
        gatekeeper: { total: gc.length, tier1: tier1.length, tier2: tier2.length, tier3: tier3.length, tier4: tier4.length },
        inbox: inboxCount || 0,
        actions: pendingActions || 0,
        drafts: socialDrafts || 0,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      digest: digestText,
      stats: {
        gatekeeper: { total: gc.length, tier1: tier1.length, tier2: tier2.length, tier3: tier3.length, tier4: tier4.length },
        inbox: inboxCount || 0,
        pendingActions: pendingActions || 0,
        socialDrafts: socialDrafts || 0,
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
