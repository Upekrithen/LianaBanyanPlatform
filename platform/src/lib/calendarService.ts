/**
 * Calendar Service — CRUD for calendar_events and calendar_shares
 */

import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  owner_id: string;
  calendar_type: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  recurrence_rule: string | null;
  location: string | null;
  color: string | null;
  source_type: string | null;
  source_id: string | null;
  is_private: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CalendarShare {
  id: string;
  calendar_owner_id: string;
  calendar_type: string;
  shared_with_id: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export type CalendarType = 'personal' | 'family' | 'business' | 'coalition' | 'route' | 'defense' | 'education';

export const CALENDAR_TYPE_CONFIG: Record<CalendarType, { label: string; emoji: string; color: string }> = {
  personal: { label: 'Personal', emoji: '📅', color: '#3b82f6' },
  family: { label: 'Family', emoji: '👨‍👩‍👧‍👦', color: '#10b981' },
  business: { label: 'Business', emoji: '🏪', color: '#f59e0b' },
  coalition: { label: 'Coalition', emoji: '🤝', color: '#a855f7' },
  route: { label: 'Delivery Route', emoji: '🚚', color: '#06b6d4' },
  defense: { label: 'Defense Klaus', emoji: '🛡️', color: '#ef4444' },
  education: { label: 'Didasko', emoji: '📚', color: '#8b5cf6' },
};

export async function fetchEvents(
  userId: string,
  calendarTypes: CalendarType[],
  start: Date,
  end: Date
): Promise<CalendarEvent[]> {
  if (calendarTypes.length === 0) return [];

  const { data, error } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .or(`owner_id.eq.${userId}`)
    .in('calendar_type', calendarTypes)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []) as CalendarEvent[];
}

export async function createEvent(
  event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events' as never)
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data as CalendarEvent;
}

export async function updateEvent(
  id: string,
  changes: Partial<Pick<CalendarEvent, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'recurrence_rule' | 'location' | 'color' | 'is_private' | 'calendar_type'>>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events' as never)
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CalendarEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events' as never)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function shareCalendar(
  calendarType: CalendarType,
  shareWithId: string,
  permission: 'view' | 'edit' = 'view'
): Promise<CalendarShare> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_shares' as never)
    .insert({
      calendar_owner_id: user.id,
      calendar_type: calendarType,
      shared_with_id: shareWithId,
      permission,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CalendarShare;
}

export async function getSharedCalendars(userId: string): Promise<CalendarShare[]> {
  const { data, error } = await supabase
    .from('calendar_shares' as never)
    .select('*')
    .eq('shared_with_id', userId);

  if (error) throw error;
  return (data || []) as CalendarShare[];
}
