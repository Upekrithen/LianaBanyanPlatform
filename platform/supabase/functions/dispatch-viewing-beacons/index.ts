import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-system-key",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SYSTEM_KEY = Deno.env.get("LB_SYSTEM_KEY") || "";

type BeaconRow = {
  id: string;
  member_id: string;
  content_type: string;
  content_id: string;
  content_title: string;
  content_url: string | null;
  scheduled_at: string;
  reminder_offset: string | null;
  recurrence_rule: string | null;
  label: string | null;
  status: "active" | "dispatched" | "cancelled" | "completed";
  helm_calendar_event_id: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const headerKey = req.headers.get("x-system-key");
  if (!authHeader && (!SYSTEM_KEY || headerKey !== SYSTEM_KEY)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nowIso = new Date().toISOString();

  const { data: activeBeacons, error: fetchError } = await supabaseAdmin
    .from("viewing_beacons")
    .select("*")
    .eq("status", "active")
    .not("reminder_offset", "is", null)
    .gte("scheduled_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lte("scheduled_at", new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = ((activeBeacons ?? []) as BeaconRow[]).filter((beacon) => isReminderDue(beacon, nowIso));
  let dispatched = 0;
  let recurrences = 0;

  for (const beacon of rows) {
    // Placeholder delivery channel: in-app queue would be added here.
    console.log(
      `[dispatch-viewing-beacons] reminder -> member=${beacon.member_id} beacon=${beacon.id} title="${beacon.content_title}"`,
    );

    const { error: markError } = await supabaseAdmin
      .from("viewing_beacons")
      .update({
        status: "dispatched",
        dispatched_at: nowIso,
      })
      .eq("id", beacon.id);

    if (markError) {
      console.error("[dispatch-viewing-beacons] mark dispatched error:", markError.message);
      continue;
    }
    dispatched += 1;

    if (!beacon.recurrence_rule) continue;

    const nextScheduledAt = computeNextOccurrence(beacon.scheduled_at, beacon.recurrence_rule);
    if (!nextScheduledAt) continue;

    const calendarEventId = await createCalendarEventForRecurrence(beacon, nextScheduledAt);

    const { error: insertError } = await supabaseAdmin.from("viewing_beacons").insert({
      member_id: beacon.member_id,
      content_type: beacon.content_type,
      content_id: beacon.content_id,
      content_title: beacon.content_title,
      content_url: beacon.content_url,
      scheduled_at: nextScheduledAt,
      reminder_offset: beacon.reminder_offset,
      recurrence_rule: beacon.recurrence_rule,
      label: beacon.label,
      status: "active",
      helm_calendar_event_id: calendarEventId,
    });

    if (insertError) {
      console.error("[dispatch-viewing-beacons] recurrence insert error:", insertError.message);
      continue;
    }

    recurrences += 1;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      scanned: rows.length,
      dispatched,
      recurrences,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

function isReminderDue(beacon: BeaconRow, nowIso: string) {
  if (!beacon.reminder_offset) return false;
  const scheduledAtMs = new Date(beacon.scheduled_at).getTime();
  const nowMs = new Date(nowIso).getTime();
  if (Number.isNaN(scheduledAtMs) || Number.isNaN(nowMs)) return false;
  const offsetMs = intervalToMs(beacon.reminder_offset);
  return scheduledAtMs - offsetMs <= nowMs;
}

function intervalToMs(intervalValue: string) {
  const raw = intervalValue.trim();

  // Postgres interval often comes through as HH:MM:SS
  if (/^\d{1,3}:\d{2}:\d{2}$/.test(raw)) {
    const [hours, minutes, seconds] = raw.split(":").map((part) => Number.parseInt(part, 10));
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  }

  const match = raw.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days)$/i);
  if (match) {
    const count = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("minute")) return count * 60 * 1000;
    if (unit.startsWith("hour")) return count * 60 * 60 * 1000;
    if (unit.startsWith("day")) return count * 24 * 60 * 60 * 1000;
  }

  return 15 * 60 * 1000;
}

function parseRRule(rrule: string) {
  const out = new Map<string, string>();
  for (const segment of rrule.split(";")) {
    const [key, value] = segment.split("=");
    if (key && value) out.set(key.toUpperCase(), value);
  }
  return out;
}

function computeNextOccurrence(currentIso: string, recurrenceRule: string) {
  const current = new Date(currentIso);
  if (Number.isNaN(current.getTime())) return null;

  const rrule = parseRRule(recurrenceRule);
  const freq = (rrule.get("FREQ") ?? "").toUpperCase();
  const interval = Math.max(1, Number.parseInt(rrule.get("INTERVAL") ?? "1", 10) || 1);
  const untilRaw = rrule.get("UNTIL");

  const next = new Date(current);
  if (freq === "DAILY") {
    next.setUTCDate(next.getUTCDate() + interval);
  } else if (freq === "WEEKLY") {
    next.setUTCDate(next.getUTCDate() + interval * 7);
  } else if (freq === "MONTHLY") {
    next.setUTCMonth(next.getUTCMonth() + interval);
  } else {
    return null;
  }

  if (untilRaw) {
    const untilDate = parseUntil(untilRaw);
    if (untilDate && next.getTime() > untilDate.getTime()) return null;
  }

  return next.toISOString();
}

function parseUntil(value: string) {
  const normalized = value.trim();
  if (!/^\d{8}T\d{6}Z$/.test(normalized)) return null;
  const year = Number.parseInt(normalized.slice(0, 4), 10);
  const month = Number.parseInt(normalized.slice(4, 6), 10) - 1;
  const day = Number.parseInt(normalized.slice(6, 8), 10);
  const hour = Number.parseInt(normalized.slice(9, 11), 10);
  const minute = Number.parseInt(normalized.slice(11, 13), 10);
  const second = Number.parseInt(normalized.slice(13, 15), 10);
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

async function createCalendarEventForRecurrence(beacon: BeaconRow, startsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert({
      owner_id: beacon.member_id,
      calendar_type: "personal",
      title: `📖 ${beacon.content_title}`,
      description: beacon.content_url
        ? `Scheduled viewing for ${beacon.content_type.replace(/_/g, " ")}: ${beacon.content_title}\n\nOpen content: ${beacon.content_url}`
        : `Scheduled viewing for ${beacon.content_type.replace(/_/g, " ")}: ${beacon.content_title}`,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      all_day: false,
      recurrence_rule: beacon.recurrence_rule,
      location: beacon.content_url,
      color: "#f59e0b",
      source_type: "beacon",
      source_id: null,
      is_private: false,
      metadata: {
        beacon_type: "viewing",
        parent_beacon_id: beacon.id,
        content_type: beacon.content_type,
        content_id: beacon.content_id,
      },
    })
    .select("id")
    .single();

  if (error) {
    console.error("[dispatch-viewing-beacons] calendar insert error:", error.message);
    return null;
  }
  return data?.id ?? null;
}
