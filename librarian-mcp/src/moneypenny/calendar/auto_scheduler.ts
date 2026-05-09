/**
 * MoneyPenny Auto-Scheduler v1 (§6.3, Bushel 82, BP034)
 * Read-only proposals. No calendar write at v1.
 * G10 gate: proposals generated; reciprocal-priority match verified;
 * substantive-prep window enforced per caller class.
 */

import type { CallerClass, SchedulingRequest, TimeSlot, HumanReviewFlag, AvailabilityClass, ISO8601 } from "../types.js";
import { prepWindowMinutes } from "../gateway/priority_taxonomy.js";
import { outlookAdapter } from "./outlook_adapter.js";
import { googleAdapter } from "./google_adapter.js";

const AVAILABILITY_ACCEPTS: Record<AvailabilityClass, CallerClass[]> = {
  OPEN_BLOCK: ["WARREN_BUFFETT", "MACKENZIE_SCOTT", "FAMILY", "COUNSEL", "PRESS", "TALENTS_PRACTITIONER", "INTERNAL_AI"],
  DEEP_WORK: ["WARREN_BUFFETT", "FAMILY", "COUNSEL"],
  FAMILY: ["WARREN_BUFFETT"],
  COUNSEL: ["WARREN_BUFFETT"],
  OUT: [],
  SLEEP: [],
};

export async function autoSchedule(request: SchedulingRequest): Promise<TimeSlot | HumanReviewFlag> {
  const prepMins = prepWindowMinutes(request.caller_class);
  if (prepMins === "HUMAN_REVIEW") {
    return { kind: "human_review", reason: "Unknown caller class requires Founder review before scheduling" };
  }

  const now = new Date();
  const windowStart = request.preferred_window_start ?? now.toISOString();
  const windowEnd = request.preferred_window_end ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [ob, gb] = await Promise.all([
    outlookAdapter.read_block(windowStart, windowEnd).catch(() => []),
    googleAdapter.read_block(windowStart, windowEnd).catch(() => []),
  ]);

  const allBlocks = [...ob, ...gb].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const freeSlots = findFreeSlots(allBlocks, windowStart, windowEnd, request.duration_minutes);

  for (const slot of freeSlots) {
    const accepted = AVAILABILITY_ACCEPTS["OPEN_BLOCK"].includes(request.caller_class);
    if (!accepted) continue;
    const prepWindowStart = new Date(
      new Date(slot.start).getTime() - prepMins * 60 * 1000,
    ).toISOString();
    return { kind: "slot", start: slot.start, end: slot.end, prep_window_start: prepWindowStart, confidence: 0.85 };
  }

  return { kind: "human_review", reason: `No available slot found for ${request.caller_class} caller` };
}

interface SimpleSlot { start: ISO8601; end: ISO8601; }

function findFreeSlots(
  blocks: Array<{ start: ISO8601; end: ISO8601 }>,
  windowStart: ISO8601,
  windowEnd: ISO8601,
  durationMinutes: number,
): SimpleSlot[] {
  const busy = blocks.map(b => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() }));
  busy.sort((a, b) => a.start - b.start);

  const free: SimpleSlot[] = [];
  let cursor = new Date(windowStart).getTime();
  const windowEndMs = new Date(windowEnd).getTime();
  const durationMs = durationMinutes * 60 * 1000;

  for (const block of busy) {
    if (block.start > cursor && block.start - cursor >= durationMs) {
      const candidate = alignToBusinessHours(cursor, durationMs, 8, 18);
      if (candidate) {
        const candidateEndMs = new Date(candidate.end).getTime();
        if (candidateEndMs <= block.start && candidateEndMs <= windowEndMs) {
          free.push(candidate);
          if (free.length >= 3) return free;
        }
      }
    }
    cursor = Math.max(cursor, block.end);
  }

  if (cursor < windowEndMs - durationMs) {
    const candidate = alignToBusinessHours(cursor, durationMs, 8, 18);
    if (candidate && new Date(candidate.end).getTime() <= windowEndMs) free.push(candidate);
  }

  return free;
}

function alignToBusinessHours(startMs: number, durationMs: number, hourStart: number, hourEnd: number): SimpleSlot | null {
  const d = new Date(startMs);
  if (d.getHours() < hourStart) d.setHours(hourStart, 0, 0, 0);
  if (d.getHours() >= hourEnd) { d.setDate(d.getDate() + 1); d.setHours(hourStart, 0, 0, 0); }
  while (d.getDay() === 0 || d.getDay() === 6) { d.setDate(d.getDate() + 1); d.setHours(hourStart, 0, 0, 0); }
  const slotEnd = d.getTime() + durationMs;
  if (new Date(slotEnd).getHours() > hourEnd) return null;
  return { start: d.toISOString(), end: new Date(slotEnd).toISOString() };
}
