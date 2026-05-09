/**
 * MCP Tool: moneypenny_schedule — Propose a time slot (G10 gate)
 * v1: read-only proposals; does NOT write to any calendar.
 * Bushel 82, BP034
 */

import type { CallerClass } from "../types.js";
import { autoSchedule } from "../calendar/auto_scheduler.js";

export interface MoneyPennyScheduleInput {
  caller_class: CallerClass;
  duration_minutes: number;
  preferred_window_start?: string;
  preferred_window_end?: string;
  notes?: string;
}

export async function moneyPennySchedule(input: MoneyPennyScheduleInput) {
  const result = await autoSchedule({
    caller_class: input.caller_class,
    duration_minutes: input.duration_minutes,
    preferred_window_start: input.preferred_window_start,
    preferred_window_end: input.preferred_window_end,
    notes: input.notes,
  });

  if (result.kind === "human_review") {
    return {
      kind: "human_review",
      reason: result.reason,
      ts: new Date().toISOString(),
    };
  }

  return {
    kind: "slot",
    start: result.start,
    end: result.end,
    prep_window_start: result.prep_window_start,
    confidence: result.confidence,
    note: "v1: read-only proposal. Confirm and add to calendar manually.",
    ts: new Date().toISOString(),
  };
}
