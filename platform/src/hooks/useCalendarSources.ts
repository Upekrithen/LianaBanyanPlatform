/**
 * useCalendarSources — Calendar Plug Interface (K115 D3 / Innovation #1868)
 *
 * Typed source registration system. Each CalendarSourceType attaches via a
 * standard interface. The hook queries relevant tables based on user roles
 * and returns unified CalendarPlugEvent objects for FullCalendar rendering.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ─── Source Type Enum ──────────────────────────────────────────────────────
export type CalendarSourceType =
  | 'storefront'
  | 'coalition'
  | 'platform'
  | 'route'
  | 'crew';

// ─── Standard Event Schema ─────────────────────────────────────────────────
export interface CalendarPlugEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  sourceType: CalendarSourceType;
  sourceId: string;
  metadata: Record<string, unknown>;
}

// ─── Source Descriptor ─────────────────────────────────────────────────────
export interface CalendarSourceDescriptor {
  type: CalendarSourceType;
  label: string;
  emoji: string;
  color: string;
  description: string;
  editable: boolean;
  /** Roles that see this source enabled by default */
  defaultForRoles: string[];
}

export const CALENDAR_SOURCE_REGISTRY: CalendarSourceDescriptor[] = [
  {
    type: 'storefront',
    label: 'Storefront',
    emoji: '🏪',
    color: '#f97316',
    description: 'Order cutoffs, flash sales, business hours',
    editable: true,
    defaultForRoles: ['storefront_owner', 'provider'],
  },
  {
    type: 'coalition',
    label: 'Coalition',
    emoji: '🤝',
    color: '#14b8a6',
    description: 'Coalition meetings, group buys, joint promotions',
    editable: true,
    defaultForRoles: ['member', 'builder'],
  },
  {
    type: 'platform',
    label: 'Platform',
    emoji: '📢',
    color: '#6366f1',
    description: 'Launches, maintenance windows, community events',
    editable: false,
    defaultForRoles: ['all'],
  },
  {
    type: 'route',
    label: 'Route',
    emoji: '🚗',
    color: '#eab308',
    description: 'Delivery windows, pickup times, route schedules',
    editable: true,
    defaultForRoles: ['runner', 'provider'],
  },
  {
    type: 'crew',
    label: 'Crew',
    emoji: '👥',
    color: '#ec4899',
    description: 'Crew table meetups, backing deadlines, milestones',
    editable: true,
    defaultForRoles: ['member', 'builder'],
  },
];

export const SOURCE_MAP: Record<CalendarSourceType, CalendarSourceDescriptor> =
  Object.fromEntries(CALENDAR_SOURCE_REGISTRY.map(s => [s.type, s])) as Record<CalendarSourceType, CalendarSourceDescriptor>;

// ─── Role Detection ────────────────────────────────────────────────────────
async function detectUserRoles(userId: string): Promise<Set<string>> {
  const roles = new Set<string>(['all']);

  const [sfRes, coalRes, crewRes] = await Promise.all([
    supabase.from('storefronts').select('id').eq('user_id', userId).limit(1),
    supabase.from('buying_coalition_members' as never).select('id').eq('user_id', userId).limit(1),
    supabase.from('crew_members' as never).select('id').eq('user_id', userId).limit(1),
  ]);

  if (sfRes.data?.length) roles.add('storefront_owner').add('provider');
  if (coalRes.data?.length) roles.add('member');
  if (crewRes.data?.length) roles.add('member');

  return roles;
}

// ─── Source Data Fetchers ──────────────────────────────────────────────────

async function fetchStorefrontEvents(userId: string, start: Date, end: Date): Promise<CalendarPlugEvent[]> {
  const { data: events } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .eq('owner_id', userId)
    .eq('calendar_type', 'business')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  return (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    sourceType: 'storefront' as CalendarSourceType,
    sourceId: e.source_id || e.id,
    metadata: e.metadata || {},
  }));
}

async function fetchCoalitionEvents(userId: string, start: Date, end: Date): Promise<CalendarPlugEvent[]> {
  const { data: events } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .eq('owner_id', userId)
    .eq('calendar_type', 'coalition')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  return (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    sourceType: 'coalition' as CalendarSourceType,
    sourceId: e.source_id || e.id,
    metadata: e.metadata || {},
  }));
}

async function fetchPlatformEvents(start: Date, end: Date): Promise<CalendarPlugEvent[]> {
  const { data: events } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .eq('calendar_type', 'platform')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  return (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    sourceType: 'platform' as CalendarSourceType,
    sourceId: e.source_id || e.id,
    metadata: e.metadata || {},
  }));
}

async function fetchRouteEvents(userId: string, start: Date, end: Date): Promise<CalendarPlugEvent[]> {
  const { data: events } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .eq('owner_id', userId)
    .eq('calendar_type', 'route')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  return (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    sourceType: 'route' as CalendarSourceType,
    sourceId: e.source_id || e.id,
    metadata: e.metadata || {},
  }));
}

async function fetchCrewEvents(userId: string, start: Date, end: Date): Promise<CalendarPlugEvent[]> {
  const { data: events } = await supabase
    .from('calendar_events' as never)
    .select('*')
    .eq('owner_id', userId)
    .eq('calendar_type', 'crew')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  return (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    sourceType: 'crew' as CalendarSourceType,
    sourceId: e.source_id || e.id,
    metadata: e.metadata || {},
  }));
}

const FETCHERS: Record<CalendarSourceType, (userId: string, start: Date, end: Date) => Promise<CalendarPlugEvent[]>> = {
  storefront: fetchStorefrontEvents,
  coalition: fetchCoalitionEvents,
  platform: (_uid, start, end) => fetchPlatformEvents(start, end),
  route: fetchRouteEvents,
  crew: fetchCrewEvents,
};

// ─── Main Hook ─────────────────────────────────────────────────────────────

export interface UseCalendarSourcesOptions {
  enabledSources: Set<CalendarSourceType>;
  dateRange: { start: Date; end: Date };
}

export function useCalendarSources({ enabledSources, dateRange }: UseCalendarSourcesOptions) {
  const { user } = useAuth();

  const { data: userRoles = new Set<string>(['all']) } = useQuery({
    queryKey: ['calendar-user-roles', user?.id],
    queryFn: () => detectUserRoles(user!.id),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });

  const defaultSources = useMemo((): Set<CalendarSourceType> => {
    const defaults = new Set<CalendarSourceType>();
    for (const desc of CALENDAR_SOURCE_REGISTRY) {
      if (desc.defaultForRoles.some(r => userRoles.has(r))) {
        defaults.add(desc.type);
      }
    }
    return defaults;
  }, [userRoles]);

  const enabledArr = useMemo(() => [...enabledSources].sort(), [enabledSources]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-plug-events', user?.id, enabledArr.join(','), dateRange.start.toISOString()],
    queryFn: async () => {
      if (!user || enabledArr.length === 0) return [];
      const results = await Promise.all(
        enabledArr.map(src => FETCHERS[src](user.id, dateRange.start, dateRange.end))
      );
      return results.flat();
    },
    enabled: !!user && enabledArr.length > 0,
  });

  return {
    events,
    isLoading,
    userRoles,
    defaultSources,
    registry: CALENDAR_SOURCE_REGISTRY,
    sourceMap: SOURCE_MAP,
  };
}
