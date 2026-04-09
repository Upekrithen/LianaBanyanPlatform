import { supabase } from "@/integrations/supabase/client";
import { createEvent, deleteEvent, updateEvent, type CalendarEvent } from "@/lib/calendarService";

export type ViewingBeaconContentType =
  | "pudding"
  | "bst_episode"
  | "spoonful"
  | "skipping_stone"
  | "paper";

export type ViewingBeaconStatus = "active" | "dispatched" | "cancelled" | "completed";

export interface ViewingBeacon {
  id: string;
  member_id: string;
  content_type: ViewingBeaconContentType;
  content_id: string;
  content_title: string;
  content_url: string | null;
  scheduled_at: string;
  reminder_offset: string | null;
  recurrence_rule: string | null;
  label: string | null;
  status: ViewingBeaconStatus;
  dispatched_at: string | null;
  helm_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

type CreateViewingBeaconInput = {
  memberId: string;
  contentType: ViewingBeaconContentType;
  contentId: string;
  contentTitle: string;
  contentUrl?: string | null;
  scheduledAt: string;
  reminderOffset?: string | null;
  recurrenceRule?: string | null;
  label?: string | null;
};

type UpdateViewingBeaconInput = {
  scheduledAt?: string;
  reminderOffset?: string | null;
  recurrenceRule?: string | null;
  label?: string | null;
  status?: ViewingBeaconStatus;
};

export async function createViewingBeacon(input: CreateViewingBeaconInput): Promise<ViewingBeacon> {
  const calendarEvent = await createCalendarEventForBeacon(input);

  const { data, error } = await supabase
    .from("viewing_beacons" as never)
    .insert({
      member_id: input.memberId,
      content_type: input.contentType,
      content_id: input.contentId,
      content_title: input.contentTitle,
      content_url: input.contentUrl ?? null,
      scheduled_at: input.scheduledAt,
      reminder_offset: input.reminderOffset ?? "15 minutes",
      recurrence_rule: input.recurrenceRule ?? null,
      label: input.label ?? null,
      status: "active",
      helm_calendar_event_id: calendarEvent.id,
    } as never)
    .select("*")
    .single();

  if (error) {
    await deleteEvent(calendarEvent.id).catch(() => undefined);
    throw error;
  }

  return data as ViewingBeacon;
}

export async function updateViewingBeacon(id: string, changes: UpdateViewingBeaconInput): Promise<ViewingBeacon> {
  const existing = await getViewingBeaconById(id);
  if (!existing) throw new Error("Viewing beacon not found.");

  const nextScheduledAt = changes.scheduledAt ?? existing.scheduled_at;
  const nextRecurrence = typeof changes.recurrenceRule === "undefined" ? existing.recurrence_rule : changes.recurrenceRule;

  if (existing.helm_calendar_event_id && (changes.scheduledAt || typeof changes.recurrenceRule !== "undefined" || typeof changes.label !== "undefined")) {
    await updateEvent(existing.helm_calendar_event_id, {
      title: `📖 ${existing.content_title}`,
      start_time: nextScheduledAt,
      recurrence_rule: nextRecurrence,
      description: buildCalendarDescription(existing.content_type, existing.content_title, existing.content_url),
    });
  }

  const updatePayload: Record<string, unknown> = {};
  if (typeof changes.scheduledAt !== "undefined") updatePayload.scheduled_at = changes.scheduledAt;
  if (typeof changes.reminderOffset !== "undefined") updatePayload.reminder_offset = changes.reminderOffset;
  if (typeof changes.recurrenceRule !== "undefined") updatePayload.recurrence_rule = changes.recurrenceRule;
  if (typeof changes.label !== "undefined") updatePayload.label = changes.label;
  if (typeof changes.status !== "undefined") updatePayload.status = changes.status;

  const { data, error } = await supabase
    .from("viewing_beacons" as never)
    .update(updatePayload as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ViewingBeacon;
}

export async function cancelViewingBeacon(id: string): Promise<ViewingBeacon> {
  const existing = await getViewingBeaconById(id);
  if (!existing) throw new Error("Viewing beacon not found.");

  if (existing.helm_calendar_event_id) {
    await deleteEvent(existing.helm_calendar_event_id).catch(() => undefined);
  }

  const { data, error } = await supabase
    .from("viewing_beacons" as never)
    .update({
      status: "cancelled",
      helm_calendar_event_id: null,
    } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ViewingBeacon;
}

export async function listUpcomingViewingBeacons(memberId: string, days = 7): Promise<ViewingBeacon[]> {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  const { data, error } = await supabase
    .from("viewing_beacons" as never)
    .select("*")
    .eq("member_id", memberId)
    .eq("status", "active")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ViewingBeacon[];
}

async function getViewingBeaconById(id: string): Promise<ViewingBeacon | null> {
  const { data, error } = await supabase
    .from("viewing_beacons" as never)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ViewingBeacon | null;
}

async function createCalendarEventForBeacon(input: CreateViewingBeaconInput): Promise<CalendarEvent> {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const normalizedUrl = normalizeContentUrl(input.contentUrl);

  return createEvent({
    owner_id: input.memberId,
    calendar_type: "personal",
    title: `📖 ${input.contentTitle}`,
    description: buildCalendarDescription(input.contentType, input.contentTitle, normalizedUrl),
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    all_day: false,
    recurrence_rule: input.recurrenceRule ?? null,
    location: normalizedUrl,
    color: "#f59e0b",
    source_type: "beacon",
    source_id: null,
    is_private: false,
    metadata: {
      beacon_type: "viewing",
      content_type: input.contentType,
      content_id: input.contentId,
      content_url: normalizedUrl,
      reminder_offset: input.reminderOffset ?? "15 minutes",
      target: "helm-calendar",
    },
  });
}

function buildCalendarDescription(contentType: string, contentTitle: string, contentUrl: string | null) {
  const seriesLabel = contentType.replace(/_/g, " ");
  if (!contentUrl) return `Scheduled viewing for ${seriesLabel}: ${contentTitle}`;
  return `Scheduled viewing for ${seriesLabel}: ${contentTitle}\n\nOpen content: ${contentUrl}`;
}

function normalizeContentUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/${value}`;
}
