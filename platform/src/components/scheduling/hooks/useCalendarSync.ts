import { createEvent, deleteEvent, updateEvent } from "@/lib/calendarService";

type CalendarSyncInput = {
  ownerId: string;
  title: string;
  description?: string | null;
  startsAtIso: string;
  recurrenceRule?: string | null;
  location?: string | null;
  metadata?: Record<string, unknown>;
};

export function useCalendarSync() {
  async function createCalendarEvent(input: CalendarSyncInput) {
    const start = new Date(input.startsAtIso);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    return createEvent({
      owner_id: input.ownerId,
      calendar_type: "personal",
      title: input.title,
      description: input.description ?? null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      all_day: false,
      recurrence_rule: input.recurrenceRule ?? null,
      location: input.location ?? null,
      color: "#f59e0b",
      source_type: "beacon",
      source_id: null,
      is_private: false,
      metadata: input.metadata ?? {},
    });
  }

  async function updateCalendarEvent(eventId: string, input: Omit<CalendarSyncInput, "ownerId">) {
    return updateEvent(eventId, {
      title: input.title,
      description: input.description ?? null,
      start_time: input.startsAtIso,
      recurrence_rule: input.recurrenceRule ?? null,
      location: input.location ?? null,
    });
  }

  async function removeCalendarEvent(eventId: string) {
    return deleteEvent(eventId);
  }

  return {
    createCalendarEvent,
    updateCalendarEvent,
    removeCalendarEvent,
  };
}
