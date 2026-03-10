/**
 * FAMILY CALENDAR
 * ================
 * Shared calendar view with Google Calendar integration.
 * Shows birthdays, holidays, events, and auto-generated
 * events from meal plans and shopping.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Cake,
  Gift,
  Utensils,
  ShoppingCart,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FamilyEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  source: string;
  color?: string;
}

interface FamilyCalendarProps {
  familyId: string;
  calendarId?: string;
}

const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  birthday: <Cake className="h-3 w-3" />,
  holiday: <Gift className="h-3 w-3" />,
  meal: <Utensils className="h-3 w-3" />,
  shopping: <ShoppingCart className="h-3 w-3" />,
  default: <Clock className="h-3 w-3" />,
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  birthday: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  holiday: 'bg-red-500/20 text-red-300 border-red-500/30',
  anniversary: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  meal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  shopping: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  appointment: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  medical: 'bg-red-500/20 text-red-300 border-red-500/30',
  custom: 'bg-white/10 text-white/70 border-white/20',
};

const EVENT_TYPE_OPTIONS = [
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'holiday', label: '🎄 Holiday' },
  { value: 'anniversary', label: '💍 Anniversary' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'medical', label: '🏥 Medical' },
  { value: 'meal', label: '🍽️ Meal' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'school', label: '📚 School' },
  { value: 'work', label: '💼 Work' },
  { value: 'custom', label: '✨ Other' },
];

export function FamilyCalendar({ familyId, calendarId }: FamilyCalendarProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null);

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState("custom");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventAllDay, setEventAllDay] = useState(false);

  // Fetch calendar
  const { data: calendar } = useQuery({
    queryKey: ['family-calendar', familyId, calendarId],
    queryFn: async () => {
      let query = supabase
        .from('family_calendars')
        .select('*')
        .eq('family_id', familyId);

      if (calendarId) {
        query = query.eq('id', calendarId);
      } else {
        query = query.eq('is_default', true);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  // Fetch events for the month
  const { data: events, isLoading } = useQuery({
    queryKey: ['family-events', calendar?.id, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!calendar?.id) return [];

      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('family_events')
        .select('*')
        .eq('calendar_id', calendar.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as FamilyEvent[];
    },
    enabled: !!calendar?.id,
  });

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async () => {
      const startTime = eventAllDay
        ? `${eventDate}T00:00:00`
        : `${eventDate}T${eventTime}:00`;
      
      const endTime = eventAllDay
        ? `${eventDate}T23:59:59`
        : eventEndTime
          ? `${eventDate}T${eventEndTime}:00`
          : null;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-create-event`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: calendar?.id,
            familyId,
            title: eventTitle,
            description: eventDescription || undefined,
            eventType,
            startTime,
            endTime,
            allDay: eventAllDay,
            location: eventLocation || undefined,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-events', calendar?.id] });
      toast.success('Event created!');
      setShowAddEvent(false);
      resetEventForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Sync with Google
  const syncGoogle = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-sync-google`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: calendar?.id,
            direction: 'both',
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (data.needsAuth) {
          toast.info('Connect Google Calendar in Settings first');
          return;
        }
        throw new Error(data.error || 'Failed to sync');
      }
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['family-events', calendar?.id] });
        toast.success(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetEventForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventType("custom");
    setEventDate("");
    setEventTime("");
    setEventEndTime("");
    setEventLocation("");
    setEventAllDay(false);
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setEventDate(format(date, 'yyyy-MM-dd'));
    setShowAddEvent(true);
  };

  const getEventsForDay = (day: Date): FamilyEvent[] => {
    return (events || []).filter((event) =>
      isSameDay(new Date(event.start_time), day)
    );
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          <h2 className="font-semibold text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncGoogle.mutate()}
            disabled={syncGoogle.isPending}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", syncGoogle.isPending && "animate-spin")} />
            Sync Google
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-white/5">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-white/10"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div
                key={idx}
                onClick={() => handleAddEvent(day)}
                className={cn(
                  "min-h-[100px] p-1 border-b border-r border-white/10 cursor-pointer transition-colors hover:bg-white/5",
                  !isCurrentMonth && "bg-white/[0.02] opacity-50"
                )}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "w-7 h-7 flex items-center justify-center text-sm rounded-full",
                      isTodayDate && "bg-purple-500 text-white font-bold"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={cn(
                        "text-xs p-1 rounded truncate border flex items-center gap-1",
                        EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.custom
                      )}
                    >
                      {EVENT_TYPE_ICONS[event.event_type] || EVENT_TYPE_ICONS.default}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Title *</Label>
              <Input
                placeholder="What's happening?"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventAllDay}
                  onChange={(e) => setEventAllDay(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">All day</span>
              </label>
            </div>

            {!eventAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </Label>
              <Input
                placeholder="Where?"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Additional details..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEvent(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createEvent.mutate()}
              disabled={!eventTitle || !eventDate || createEvent.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {EVENT_TYPE_ICONS[selectedEvent.event_type]}
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(new Date(selectedEvent.start_time), 'EEEE, MMMM d, yyyy')}
              {selectedEvent && !selectedEvent.all_day && (
                <> at {format(new Date(selectedEvent.start_time), 'h:mm a')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3">
              <Badge className={EVENT_TYPE_COLORS[selectedEvent.event_type]}>
                {selectedEvent.event_type}
              </Badge>

              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.location && (
                <p className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedEvent.location}
                </p>
              )}

              {selectedEvent.source !== 'manual' && (
                <p className="text-xs text-muted-foreground">
                  Auto-generated from: {selectedEvent.source}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
