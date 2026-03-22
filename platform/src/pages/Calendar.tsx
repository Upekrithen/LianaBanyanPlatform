/**
 * LB Calendar — FullCalendar-powered personal/business/family calendar.
 * Uses calendar_events table with toggleable calendar types.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalIcon, Plus, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  CALENDAR_TYPE_CONFIG,
  type CalendarType,
  type CalendarEvent,
} from '@/lib/calendarService';
import { runCalendarSync } from '@/lib/calendarSync';

const ALL_TYPES: CalendarType[] = ['personal', 'family', 'business', 'coalition', 'route', 'defense', 'education'];

interface EventForm {
  title: string;
  description: string;
  calendar_type: CalendarType;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string;
  color: string;
  is_private: boolean;
}

const emptyForm = (): EventForm => ({
  title: '',
  description: '',
  calendar_type: 'personal',
  start_time: '',
  end_time: '',
  all_day: false,
  location: '',
  color: CALENDAR_TYPE_CONFIG.personal.color,
  is_private: false,
});

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  const [enabledTypes, setEnabledTypes] = useState<Set<CalendarType>>(new Set(['personal', 'family', 'business']));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!user || synced) return;
    runCalendarSync(user.id).then(() => {
      setSynced(true);
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    });
  }, [user, synced, queryClient]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', user?.id, [...enabledTypes].sort().join(','), dateRange.start.toISOString()],
    queryFn: () => fetchEvents(user!.id, [...enabledTypes], dateRange.start, dateRange.end),
    enabled: !!user && enabledTypes.size > 0,
  });

  const fcEvents = useMemo(() =>
    events.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_time,
      end: e.end_time || undefined,
      allDay: e.all_day,
      color: e.color || CALENDAR_TYPE_CONFIG[e.calendar_type as CalendarType]?.color || '#3b82f6',
      extendedProps: { event: e },
      ...(e.recurrence_rule ? { rrule: e.recurrence_rule } : {}),
    })),
    [events]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!form.title.trim()) throw new Error('Title is required');
      if (!form.start_time) throw new Error('Start time is required');

      if (editingId) {
        return updateEvent(editingId, {
          title: form.title,
          description: form.description || null,
          start_time: new Date(form.start_time).toISOString(),
          end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
          all_day: form.all_day,
          location: form.location || null,
          color: form.color || null,
          is_private: form.is_private,
          calendar_type: form.calendar_type,
        });
      } else {
        return createEvent({
          owner_id: user.id,
          calendar_type: form.calendar_type,
          title: form.title,
          description: form.description || null,
          start_time: new Date(form.start_time).toISOString(),
          end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
          all_day: form.all_day,
          recurrence_rule: null,
          location: form.location || null,
          color: form.color || CALENDAR_TYPE_CONFIG[form.calendar_type]?.color || null,
          source_type: 'manual',
          source_id: null,
          is_private: form.is_private,
          metadata: {},
        });
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? 'Event updated' : 'Event created' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      toast({ title: 'Event deleted' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDialogOpen(false);
      setEditingId(null);
    },
  });

  const handleDateClick = useCallback((arg: { dateStr: string; allDay: boolean }) => {
    const f = emptyForm();
    f.start_time = arg.dateStr.includes('T') ? arg.dateStr.slice(0, 16) : arg.dateStr + 'T09:00';
    f.all_day = arg.allDay;
    setForm(f);
    setEditingId(null);
    setDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((arg: { event: { id: string; extendedProps: { event: CalendarEvent } } }) => {
    const e = arg.event.extendedProps.event;
    setForm({
      title: e.title,
      description: e.description || '',
      calendar_type: e.calendar_type as CalendarType,
      start_time: e.start_time.slice(0, 16),
      end_time: e.end_time?.slice(0, 16) || '',
      all_day: e.all_day,
      location: e.location || '',
      color: e.color || '',
      is_private: e.is_private,
    });
    setEditingId(e.id);
    setDialogOpen(true);
  }, []);

  const handleDatesSet = useCallback((arg: { start: Date; end: Date }) => {
    setDateRange({ start: arg.start, end: arg.end });
  }, []);

  const handleEventDrop = useCallback((arg: { event: { id: string; start: Date | null; end: Date | null; allDay: boolean } }) => {
    if (!arg.event.start) return;
    updateEvent(arg.event.id, {
      start_time: arg.event.start.toISOString(),
      end_time: arg.event.end?.toISOString() || null,
      all_day: arg.event.allDay,
    }).then(() => queryClient.invalidateQueries({ queryKey: ['calendar-events'] }));
  }, [queryClient]);

  const toggleType = (type: CalendarType) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  if (!user) {
    return (
      <PortalPageLayout variant="stage" maxWidth="xl" xrayId="calendar">
        <div className="text-center py-20">
          <CalIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Sign in to access your calendar.</p>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="calendar">
      <div className="flex gap-4">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-56 shrink-0 hidden md:block">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calendars</p>
                  <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
                {ALL_TYPES.map(type => {
                  const cfg = CALENDAR_TYPE_CONFIG[type];
                  const enabled = enabledTypes.has(type);
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={enabled}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color, opacity: enabled ? 1 : 0.3 }}
                      />
                      <span className={`text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    </label>
                  );
                })}
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={() => { setForm(emptyForm()); setEditingId(null); setDialogOpen(true); }}>
                  <Plus className="w-3 h-3 mr-1" /> Add Event
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main calendar */}
        <div className="flex-1 min-w-0">
          {!sidebarOpen && (
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => setSidebarOpen(true)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Show calendars
              </button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => { setForm(emptyForm()); setEditingId(null); setDialogOpen(true); }}>
                <Plus className="w-3 h-3 mr-1" /> Add Event
              </Button>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-2 md:p-4 [&_.fc]:text-sm [&_.fc-button]:!text-xs [&_.fc-button]:!px-2 [&_.fc-button]:!py-1 [&_.fc-toolbar-title]:!text-base [&_.fc-event]:!text-xs [&_.fc-event]:!rounded [&_.fc-event]:!px-1 [&_.fc-daygrid-day]:!border-border [&_.fc-col-header-cell]:!border-border [&_.fc-scrollgrid]:!border-border [&_th]:!border-border [&_td]:!border-border [&_.fc-day-today]:!bg-amber-500/10">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={fcEvents}
              editable
              selectable
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              eventDrop={handleEventDrop}
              eventResize={handleEventDrop as any}
              height="auto"
              dayMaxEvents={3}
              nowIndicator
              loading={(loading) => {}}
            />
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div>
              <Label htmlFor="evt-title">Title</Label>
              <Input id="evt-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" required />
            </div>

            <div>
              <Label htmlFor="evt-type">Calendar</Label>
              <Select value={form.calendar_type} onValueChange={(v: CalendarType) => setForm(f => ({ ...f, calendar_type: v, color: CALENDAR_TYPE_CONFIG[v]?.color || f.color }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{CALENDAR_TYPE_CONFIG[t].emoji} {CALENDAR_TYPE_CONFIG[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="evt-start">Start</Label>
                <Input id="evt-start" type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="evt-end">End</Label>
                <Input id="evt-end" type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.all_day} onCheckedChange={c => setForm(f => ({ ...f, all_day: c === true }))} />
                All day
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.is_private} onCheckedChange={c => setForm(f => ({ ...f, is_private: c === true }))} />
                Private
              </label>
            </div>

            <div>
              <Label htmlFor="evt-loc">Location</Label>
              <Input id="evt-loc" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Optional" />
            </div>

            <div>
              <Label htmlFor="evt-desc">Description</Label>
              <Textarea id="evt-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" rows={2} />
            </div>

            <div>
              <Label htmlFor="evt-color">Color</Label>
              <Input id="evt-color" type="color" value={form.color || '#3b82f6'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-16 h-8 p-0 border-0" />
            </div>

            <DialogFooter className="flex gap-2">
              {editingId && (
                <Button type="button" variant="destructive" size="sm" onClick={() => deleteMutation.mutate(editingId)} disabled={deleteMutation.isPending}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
