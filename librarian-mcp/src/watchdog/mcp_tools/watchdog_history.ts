/**
 * MCP Tool: mcp__watchdog__history
 *
 * Returns health history events from the append-only log.
 * Supports filtering by subject, event_type, and hours lookback.
 * G5 gate: watchdog_history tool.
 */

import { readHistory, readHistorySince } from "../state_store.js";
import type { HealthEvent } from "../types.js";

export interface WatchdogHistoryInput {
  /** Hours to look back (default: 24). */
  hours?: number;
  /** Filter to a specific subject (optional). */
  subject?: string;
  /** Filter to a specific event_type (optional). */
  event_type?: HealthEvent['event_type'];
  /** Maximum number of events to return (default: 200). */
  limit?: number;
}

export interface WatchdogHistoryOutput {
  events: HealthEvent[];
  total_returned: number;
  filter: WatchdogHistoryInput;
  ts: string;
}

export function watchdogHistory(input: WatchdogHistoryInput = {}): WatchdogHistoryOutput {
  const hours = input.hours ?? 24;
  const limit = input.limit ?? 200;

  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  let events = readHistorySince(since);

  if (input.subject) {
    events = events.filter(e => e.subject === input.subject);
  }
  if (input.event_type) {
    events = events.filter(e => e.event_type === input.event_type);
  }

  // Most recent first
  events = events.reverse().slice(0, limit);

  return {
    events,
    total_returned: events.length,
    filter: input,
    ts: new Date().toISOString(),
  };
}
