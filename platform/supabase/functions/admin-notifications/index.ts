/**
 * ADMIN NOTIFICATIONS — Alert Founder/Admins on Critical Platform Events
 * =======================================================================
 * Fires on significant events: new member signup, dispute filed,
 * campaign completion, RLS violation attempt, founder override action.
 *
 * Delivery channels:
 *   1. Supabase insert into `admin_notifications` table (always)
 *   2. Email via `send-transactional-email` (for priority 1 events)
 *   3. Future: Slack webhook, push notification
 *
 * Request body:
 *   - event_type: 'new_user' | 'dispute_filed' | 'campaign_complete' |
 *                 'rls_violation' | 'founder_override' | 'crown_response' |
 *                 'payment_received' | 'edge_function_error'
 *   - severity: 'info' | 'warning' | 'critical'
 *   - title: string (short summary)
 *   - details: Record<string, unknown> (event-specific payload)
 *   - actor_id?: string (user who triggered the event)
 *
 * SEC-safe: No financial language in notification templates.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EventType =
  | 'new_user'
  | 'dispute_filed'
  | 'campaign_complete'
  | 'rls_violation'
  | 'founder_override'
  | 'crown_response'
  | 'payment_received'
  | 'edge_function_error';

type Severity = 'info' | 'warning' | 'critical';

interface NotificationRequest {
  event_type: EventType;
  severity: Severity;
  title: string;
  details: Record<string, unknown>;
  actor_id?: string;
}

const EVENT_LABELS: Record<EventType, string> = {
  new_user: 'New Member',
  dispute_filed: 'Dispute Filed',
  campaign_complete: 'Campaign Complete',
  rls_violation: 'Security Alert',
  founder_override: 'Founder Override',
  crown_response: 'Crown Response',
  payment_received: 'Payment Received',
  edge_function_error: 'System Error',
};

const SEVERITY_EMOJI: Record<Severity, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body: NotificationRequest = await req.json();
    const { event_type, severity, title, details, actor_id } = body;

    if (!event_type || !title) {
      return new Response(
        JSON.stringify({ error: 'event_type and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Always persist to admin_notifications table
    const { data: notification, error: insertError } = await supabase
      .from('admin_notifications')
      .insert({
        event_type,
        severity: severity || 'info',
        title,
        details,
        actor_id: actor_id || null,
        read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert notification:', insertError);
    }

    // 2. For critical/warning events, send email via existing transactional email function
    let emailSent = false;
    if (severity === 'critical' || severity === 'warning') {
      try {
        const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
        if (adminEmail) {
          const emailResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-transactional-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({
                type: 'admin_alert',
                to: adminEmail,
                subject: `${SEVERITY_EMOJI[severity]} [${EVENT_LABELS[event_type]}] ${title}`,
                data: {
                  event_type,
                  severity,
                  title,
                  details: JSON.stringify(details, null, 2),
                  timestamp: new Date().toISOString(),
                },
              }),
            }
          );
          emailSent = emailResponse.ok;
        }
      } catch (emailErr) {
        console.error('Email delivery failed:', emailErr);
      }
    }

    // 3. Future: Slack webhook
    // const slackUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    // if (slackUrl && severity === 'critical') { ... }

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification?.id || null,
        email_sent: emailSent,
        event_type,
        severity,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('admin-notifications error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
