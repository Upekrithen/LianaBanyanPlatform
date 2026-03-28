/**
 * Calendar Plug Registry — Defines all calendar types, their auto-sources,
 * visual config, and editability. The Calendar page sidebar and type pickers
 * render from this array rather than hardcoded constants.
 */

export interface CalendarPlug {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  autoSources: string[];
  editable: boolean;
}

export const CALENDAR_PLUGS: CalendarPlug[] = [
  {
    id: 'personal',
    label: 'Personal',
    emoji: '📌',
    color: '#6366f1',
    description: 'Your personal events and reminders',
    autoSources: ['beacon_completion', 'wildfire_tour'],
    editable: true,
  },
  {
    id: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    color: '#ec4899',
    description: 'Family events, birthdays, appointments',
    autoSources: [],
    editable: true,
  },
  {
    id: 'business',
    label: 'Business',
    emoji: '🏪',
    color: '#f97316',
    description: 'Storefront hours, order cutoffs, business meetings',
    autoSources: ['storefront_cutoff', 'storefront_hours'],
    editable: true,
  },
  {
    id: 'coalition',
    label: 'Coalition',
    emoji: '🤝',
    color: '#14b8a6',
    description: 'Coalition events, joint promotions, alliance meetings',
    autoSources: ['coalition_event'],
    editable: true,
  },
  {
    id: 'route',
    label: 'Route',
    emoji: '🚗',
    color: '#eab308',
    description: 'Delivery windows, pickup times, route schedules',
    autoSources: ['delivery_window', 'order_pickup'],
    editable: true,
  },
  {
    id: 'defense',
    label: 'Defense',
    emoji: '⚖️',
    color: '#ef4444',
    description: 'Star Chamber hearings, Defense Klaus deadlines',
    autoSources: ['star_chamber_hearing'],
    editable: false,
  },
  {
    id: 'education',
    label: 'Education',
    emoji: '📚',
    color: '#8b5cf6',
    description: 'Didasko classes, quiz deadlines, certification dates',
    autoSources: ['quiz_completion', 'certification'],
    editable: true,
  },
  {
    id: 'platform',
    label: 'Platform',
    emoji: '📢',
    color: '#6366f1',
    description: 'Launches, maintenance windows, community events',
    autoSources: ['platform_announcement', 'maintenance_window'],
    editable: false,
  },
  {
    id: 'crew',
    label: 'Crew',
    emoji: '👥',
    color: '#ec4899',
    description: 'Crew table meetups, backing deadlines, milestone dates',
    autoSources: ['crew_meetup', 'crew_milestone'],
    editable: true,
  },
];

export const PLUG_MAP: Record<string, CalendarPlug> = Object.fromEntries(
  CALENDAR_PLUGS.map(p => [p.id, p]),
);
