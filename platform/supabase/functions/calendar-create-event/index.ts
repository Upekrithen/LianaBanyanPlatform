/**
 * CALENDAR-CREATE-EVENT — Create a family calendar event
 * =======================================================
 * Creates an event on a family calendar with optional attendees,
 * recurrence, and reminders.
 * 
 * POST body:
 *   - calendarId: UUID (optional - uses family default if not provided)
 *   - familyId: UUID (required if calendarId not provided)
 *   - title: string
 *   - description: string (optional)
 *   - eventType: string (birthday, holiday, meal, etc.)
 *   - startTime: ISO string
 *   - endTime: ISO string (optional)
 *   - allDay: boolean (optional)
 *   - location: string (optional)
 *   - attendees: UUID[] (family_member IDs, optional)
 *   - recurrenceRule: string (RRULE format, optional)
 *   - reminderMinutes: number[] (optional)
 *   - isPrivate: boolean (optional)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
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

    const body = await req.json();
    const {
      calendarId,
      familyId,
      title,
      description,
      eventType,
      startTime,
      endTime,
      allDay,
      location,
      attendees,
      recurrenceRule,
      reminderMinutes,
      isPrivate,
    } = body;

    if (!title || !startTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, startTime' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!calendarId && !familyId) {
      return new Response(
        JSON.stringify({ error: 'Either calendarId or familyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the calendar
    let targetCalendarId = calendarId;
    let targetFamilyId = familyId;

    if (!targetCalendarId) {
      // Get the default family calendar
      const { data: defaultCalendar } = await supabase
        .from('family_calendars')
        .select('id, family_id')
        .eq('family_id', familyId)
        .eq('is_default', true)
        .single();

      if (!defaultCalendar) {
        // Get any calendar for this family
        const { data: anyCalendar } = await supabase
          .from('family_calendars')
          .select('id, family_id')
          .eq('family_id', familyId)
          .limit(1)
          .single();

        if (!anyCalendar) {
          return new Response(
            JSON.stringify({ error: 'No calendar found for this family' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        targetCalendarId = anyCalendar.id;
        targetFamilyId = anyCalendar.family_id;
      } else {
        targetCalendarId = defaultCalendar.id;
        targetFamilyId = defaultCalendar.family_id;
      }
    } else {
      // Get family from calendar
      const { data: calendar } = await supabase
        .from('family_calendars')
        .select('family_id')
        .eq('id', targetCalendarId)
        .single();

      if (!calendar) {
        return new Response(
          JSON.stringify({ error: 'Calendar not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      targetFamilyId = calendar.family_id;
    }

    // Verify user is a member of this family
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', targetFamilyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this family' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from('family_events')
      .insert({
        calendar_id: targetCalendarId,
        title,
        description: description || null,
        event_type: eventType || 'custom',
        start_time: startTime,
        end_time: endTime || null,
        all_day: allDay || false,
        location: location || null,
        attendees: attendees || [],
        recurrence_rule: recurrenceRule || null,
        is_recurring: !!recurrenceRule,
        reminder_minutes: reminderMinutes || [30],
        is_private: isPrivate || false,
        created_by: member.id,
        source: 'manual',
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      return new Response(
        JSON.stringify({ error: 'Failed to create event', details: eventError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create RSVP records for attendees
    if (attendees && attendees.length > 0) {
      const rsvpRecords = attendees.map((attendeeId: string) => ({
        event_id: event.id,
        member_id: attendeeId,
        status: attendeeId === member.id ? 'accepted' : 'pending',
      }));

      await supabase.from('family_event_rsvps').insert(rsvpRecords);
    }

    console.log(`📅 ${member.nickname} created event: "${title}"`);

    return new Response(
      JSON.stringify({
        success: true,
        event,
        message: `Event "${title}" created successfully!`,
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
