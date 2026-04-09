import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * moneypenny-signal — Red Carpet signal processor + threshold alert system.
 *
 * Accepts: { action: 'process_pending' | 'check_thresholds' | 'send_signal', signal_id? }
 * Actions:
 *   process_pending  — Process all pending red_carpet_signals (send emails)
 *   check_thresholds — Check member milestones and generate signals
 *   send_signal      — Send a specific signal by ID
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { action, signal_id } = await req.json();
    let result: any;

    switch (action) {
      case 'process_pending': {
        result = await processPendingSignals(supabase, supabaseUrl, serviceKey);
        break;
      }
      case 'check_thresholds': {
        result = await checkThresholds(supabase);
        break;
      }
      case 'send_signal': {
        if (!signal_id) throw new Error('signal_id required for send_signal');
        result = await sendSignal(supabase, supabaseUrl, serviceKey, signal_id);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}. Use process_pending, check_thresholds, or send_signal.`);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processPendingSignals(supabase: any, supabaseUrl: string, serviceKey: string) {
  const { data: pending } = await supabase
    .from('red_carpet_signals')
    .select('*')
    .eq('status', 'pending')
    .order('created_at')
    .limit(20);

  if (!pending || pending.length === 0) {
    return { processed: 0, message: 'No pending signals' };
  }

  let sent = 0;
  let failed = 0;

  for (const signal of pending) {
    try {
      const emailPayload = buildEmailPayload(signal);

      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (emailRes.ok) {
        await supabase.from('red_carpet_signals')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', signal.id);
        sent++;
      } else {
        await supabase.from('red_carpet_signals')
          .update({ status: 'failed' })
          .eq('id', signal.id);
        failed++;
      }
    } catch {
      await supabase.from('red_carpet_signals')
        .update({ status: 'failed' })
        .eq('id', signal.id);
      failed++;
    }
  }

  return { processed: pending.length, sent, failed };
}

async function checkThresholds(supabase: any) {
  const signals: any[] = [];

  // Check member count milestones
  const { data: memberStat } = await supabase
    .from('platform_canonical')
    .select('value')
    .eq('key', 'member_count')
    .single();

  if (memberStat) {
    const count = parseInt(memberStat.value);
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    for (const m of milestones) {
      if (count >= m && count < m + 5) {
        const { data: existing } = await supabase
          .from('red_carpet_signals')
          .select('id')
          .eq('signal_type', 'milestone')
          .ilike('trigger_condition', `%${m} member%`)
          .limit(1);

        if (!existing || existing.length === 0) {
          const { data: signal } = await supabase.from('red_carpet_signals').insert({
            signal_type: 'milestone',
            trigger_condition: `Platform reached ${m} members`,
            template_id: 'milestone_announcement',
          }).select().single();
          if (signal) signals.push(signal);
        }
      }
    }
  }

  // Check launch condition thresholds
  const { data: conditions } = await supabase
    .from('launch_conditions')
    .select('initiative_number, condition_type, current_value, target_value');

  if (conditions) {
    for (const lc of conditions) {
      const pct = lc.target_value > 0 ? (lc.current_value / lc.target_value) * 100 : 0;
      if (pct >= 100) {
        const triggerKey = `initiative_${lc.initiative_number}_${lc.condition_type}_met`;
        const { data: existing } = await supabase
          .from('red_carpet_signals')
          .select('id')
          .eq('signal_type', 'threshold_alert')
          .ilike('trigger_condition', `%${triggerKey}%`)
          .limit(1);

        if (!existing || existing.length === 0) {
          const { data: signal } = await supabase.from('red_carpet_signals').insert({
            signal_type: 'threshold_alert',
            trigger_condition: `${triggerKey}: Initiative #${lc.initiative_number} ${lc.condition_type} target met`,
            template_id: 'launch_condition_met',
          }).select().single();
          if (signal) signals.push(signal);

          await supabase.from('moneypenny_actions').insert({
            title: `Initiative #${lc.initiative_number} — ${lc.condition_type} target MET`,
            description: `Launch condition fulfilled. Review if initiative is ready to activate.`,
            source: 'auto',
            priority: 'urgent',
          });
        }
      }
    }
  }

  return { signals_created: signals.length, signals };
}

async function sendSignal(supabase: any, supabaseUrl: string, serviceKey: string, signalId: string) {
  const { data: signal } = await supabase
    .from('red_carpet_signals')
    .select('*')
    .eq('id', signalId)
    .single();

  if (!signal) throw new Error('Signal not found');
  if (signal.status === 'sent') return { already_sent: true };

  const emailPayload = buildEmailPayload(signal);

  const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  });

  if (emailRes.ok) {
    await supabase.from('red_carpet_signals')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', signalId);
    return { sent: true };
  }

  throw new Error('Email send failed');
}

function buildEmailPayload(signal: any) {
  const templates: Record<string, { subject: string; body: string }> = {
    crown_response_ack: {
      subject: 'Crown Letter Response Received — Action Required',
      body: `A Crown Letter recipient has responded.\n\nDetails: ${signal.trigger_condition}\n\nPlease review and respond promptly. This is a high-priority contact.`,
    },
    milestone_announcement: {
      subject: `Platform Milestone: ${signal.trigger_condition}`,
      body: `${signal.trigger_condition}\n\nThis milestone may warrant a social media announcement or community update.`,
    },
    launch_condition_met: {
      subject: `Launch Condition Met — ${signal.trigger_condition}`,
      body: `A launch condition has been fulfilled.\n\n${signal.trigger_condition}\n\nReview the Launch Tracker to determine next steps.`,
    },
    welcome: {
      subject: 'Welcome to Liana Banyan',
      body: `Welcome, ${signal.invitee_name || 'new member'}!\n\nYour journey with Liana Banyan begins now. Explore the platform at lianabanyan.com.`,
    },
  };

  const template = templates[signal.template_id] || templates.milestone_announcement;

  return {
    type: 'outreach',
    email: signal.invitee_email || 'founder@lianabanyan.com',
    data: {
      recipientName: signal.invitee_name || 'Founder',
      senderName: 'MoneyPenny @ Liana Banyan',
      subject: template.subject,
      body: template.body,
      ctaText: 'Open Dashboard',
      ctaUrl: 'https://lianabanyan.com/moneypenny/briefing',
    },
  };
}
