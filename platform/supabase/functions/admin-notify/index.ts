/**
 * ADMIN NOTIFY — Platform Event Notification System
 * ==================================================
 * Sends notifications to admins when key platform events occur.
 * Can be triggered by database triggers, cron jobs, or direct invocation.
 *
 * Event types:
 *   - new_user: New member registration
 *   - dispute_filed: Member filed a dispute
 *   - campaign_complete: Production campaign reached goal
 *   - rls_violation: RLS policy violation detected
 *   - founder_override: Founder override action logged
 *   - edge_function_error: Edge function threw unrecoverable error
 *   - high_value_transaction: Transaction over threshold
 *
 * Delivery channels:
 *   1. Supabase admin_notifications table (always)
 *   2. Email via send-transactional-email (if severity >= 'high')
 *
 * Request body:
 *   - event_type: string (required)
 *   - severity: 'low' | 'medium' | 'high' | 'critical' (default: 'medium')
 *   - title: string (required)
 *   - details: Record<string, any> (optional context)
 *   - actor_id?: string (user who triggered the event)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Severity = 'low' | 'medium' | 'high' | 'critical';

const VALID_EVENT_TYPES = [
  'new_user',
  'dispute_filed',
  'campaign_complete',
  'rls_violation',
  'founder_override',
  'edge_function_error',
  'high_value_transaction',
] as const;

interface NotifyRequest {
  event_type: string;
  severity?: Severity;
  title: string;
  details?: Record<string, any>;
  actor_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body: NotifyRequest = await req.json();

    if (!body.event_type || !body.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'event_type and title are required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const severity: Severity = body.severity || 'medium';
    const now = new Date().toISOString();

    // 1. Always insert into admin_notifications table
    const { data: notification, error: insertError } = await supabase
      .from('admin_notifications')
      .insert({
        event_type: body.event_type,
        severity,
        title: body.title,
        details: body.details || {},
        actor_id: body.actor_id || null,
        read: false,
        created_at: now,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert notification:', insertError.message);
      return new Response(JSON.stringify({
        success: false,
        error: `Insert failed: ${insertError.message}`,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. For high/critical severity — also email admins
    let emailSent = false;
    if (severity === 'high' || severity === 'critical') {
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', admin.user_id)
            .single();

          if (profile?.email) {
            try {
              await supabase.functions.invoke('send-transactional-email', {
                body: {
                  to: profile.email,
                  template: 'admin_alert',
                  data: {
                    event_type: body.event_type,
                    severity,
                    title: body.title,
                    details: JSON.stringify(body.details || {}, null, 2),
                    timestamp: now,
                  },
                },
              });
              emailSent = true;
            } catch (emailErr) {
              console.error(`Email to admin ${admin.user_id} failed:`, emailErr);
            }
          }
        }
      }
    }

    // 3. For critical severity — also log to moneypenny_actions for dashboard visibility
    if (severity === 'critical') {
      await supabase.from('moneypenny_actions').insert({
        title: `[CRITICAL] ${body.title}`,
        description: `Event: ${body.event_type}\n${JSON.stringify(body.details || {}, null, 2)}`,
        source: 'system',
        priority: 'urgent',
        status: 'pending',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      notification_id: notification?.id,
      email_sent: emailSent,
      severity,
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
