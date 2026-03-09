/**
 * CALENDAR-SYNC-GOOGLE — Sync family calendar with Google Calendar
 * ==================================================================
 * Bidirectional sync between family calendars and Google Calendar.
 * Supports pull (import from Google), push (export to Google), or both.
 * 
 * POST body:
 *   - calendarId: UUID (family calendar)
 *   - direction: string ('pull', 'push', 'both')
 * 
 * GET params:
 *   - calendarId: UUID (get sync status)
 * 
 * Requires Google OAuth token stored in google_calendar_tokens
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  recurrence?: string[];
  attendees?: Array<{ email: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Return sync status
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const calendarId = url.searchParams.get('calendarId');

      if (!calendarId) {
        return new Response(
          JSON.stringify({ error: 'Missing calendarId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: calendar } = await supabase
        .from('family_calendars')
        .select('sync_enabled, google_calendar_id, google_account_email, last_sync_at')
        .eq('id', calendarId)
        .single();

      return new Response(
        JSON.stringify({ calendar }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Perform sync
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const body = await req.json();
    const { calendarId, direction } = body;

    if (!calendarId) {
      return new Response(
        JSON.stringify({ error: 'Missing calendarId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get calendar and verify access
    const { data: calendar, error: calError } = await supabase
      .from('family_calendars')
      .select('*, families(id)')
      .eq('id', calendarId)
      .single();

    if (calError || !calendar) {
      return new Response(
        JSON.stringify({ error: 'Calendar not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is a family member
    const { data: member } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', calendar.family_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google OAuth token
    const { data: googleToken } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('family_id', calendar.family_id)
      .single();

    if (!googleToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Google Calendar not connected',
          needsAuth: true,
          authUrl: '/api/auth/google-calendar', // Placeholder
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token needs refresh
    let accessToken = googleToken.access_token;
    if (new Date(googleToken.token_expiry) < new Date()) {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'Google OAuth not configured on server' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: googleToken.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshResponse.json();
        
        if (refreshData.error) {
          console.error('Token refresh error:', refreshData);
          return new Response(
            JSON.stringify({ error: 'Failed to refresh Google token', needsReauth: true }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        accessToken = refreshData.access_token;
        
        // Update stored token
        await supabase
          .from('google_calendar_tokens')
          .update({
            access_token: refreshData.access_token,
            token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', googleToken.id);
      } catch (refreshErr) {
        console.error('Token refresh error:', refreshErr);
        return new Response(
          JSON.stringify({ error: 'Failed to refresh Google token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const googleCalendarId = calendar.google_calendar_id || 'primary';
    let pulledCount = 0;
    let pushedCount = 0;

    // PULL: Import from Google Calendar
    if (direction === 'pull' || direction === 'both') {
      try {
        const timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 1); // Past month
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 6); // Next 6 months

        const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalendarId)}/events?` +
          `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&maxResults=250`;

        const eventsResponse = await fetch(eventsUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!eventsResponse.ok) {
          const error = await eventsResponse.text();
          console.error('Google Calendar API error:', error);
        } else {
          const eventsData = await eventsResponse.json();
          const googleEvents: GoogleEvent[] = eventsData.items || [];

          for (const gEvent of googleEvents) {
            // Check if event already exists
            const { data: existingEvent } = await supabase
              .from('family_events')
              .select('id')
              .eq('google_event_id', gEvent.id)
              .single();

            const startTime = gEvent.start.dateTime || `${gEvent.start.date}T00:00:00`;
            const endTime = gEvent.end.dateTime || `${gEvent.end.date}T23:59:59`;
            const allDay = !gEvent.start.dateTime;

            if (existingEvent) {
              // Update existing
              await supabase
                .from('family_events')
                .update({
                  title: gEvent.summary,
                  description: gEvent.description || null,
                  location: gEvent.location || null,
                  start_time: startTime,
                  end_time: endTime,
                  all_day: allDay,
                  recurrence_rule: gEvent.recurrence?.[0] || null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingEvent.id);
            } else {
              // Insert new
              await supabase
                .from('family_events')
                .insert({
                  calendar_id: calendarId,
                  title: gEvent.summary,
                  description: gEvent.description || null,
                  location: gEvent.location || null,
                  start_time: startTime,
                  end_time: endTime,
                  all_day: allDay,
                  recurrence_rule: gEvent.recurrence?.[0] || null,
                  is_recurring: !!gEvent.recurrence,
                  google_event_id: gEvent.id,
                  source: 'google',
                  created_by: member.id,
                });
              pulledCount++;
            }
          }
        }
      } catch (pullErr) {
        console.error('Pull error:', pullErr);
      }
    }

    // PUSH: Export to Google Calendar
    if (direction === 'push' || direction === 'both') {
      try {
        // Get local events without google_event_id
        const { data: localEvents } = await supabase
          .from('family_events')
          .select('*')
          .eq('calendar_id', calendarId)
          .is('google_event_id', null)
          .eq('source', 'manual');

        for (const localEvent of localEvents || []) {
          const googleEvent = {
            summary: localEvent.title,
            description: localEvent.description,
            location: localEvent.location,
            start: localEvent.all_day
              ? { date: localEvent.start_time.split('T')[0] }
              : { dateTime: localEvent.start_time },
            end: localEvent.all_day
              ? { date: (localEvent.end_time || localEvent.start_time).split('T')[0] }
              : { dateTime: localEvent.end_time || localEvent.start_time },
          };

          try {
            const createResponse = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(googleCalendarId)}/events`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(googleEvent),
              }
            );

            if (createResponse.ok) {
              const createdEvent = await createResponse.json();
              // Store the Google event ID
              await supabase
                .from('family_events')
                .update({ google_event_id: createdEvent.id })
                .eq('id', localEvent.id);
              pushedCount++;
            }
          } catch (pushErr) {
            console.error('Error pushing event:', pushErr);
          }
        }
      } catch (pushErr) {
        console.error('Push error:', pushErr);
      }
    }

    // Update sync timestamp
    await supabase
      .from('family_calendars')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_enabled: true,
      })
      .eq('id', calendarId);

    console.log(`📅 Google Calendar sync: ${pulledCount} pulled, ${pushedCount} pushed`);

    return new Response(
      JSON.stringify({
        success: true,
        pulled: pulledCount,
        pushed: pushedCount,
        message: `Synced with Google Calendar: ${pulledCount} events imported, ${pushedCount} events exported.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
