/**
 * MCP Tool: moneypenny_status — Query current routing/context state (G11 gate)
 * Bushel 82, BP034
 */

import type { MoneyPennyStatus } from "../types.js";
import { getArbiterStats } from "../gateway/no_collision_arbiter.js";
import { readAvailabilityRecord, describeAvailability } from "../calendar/availability_state.js";
import { getActiveThreadCount } from "../mcci/thread_store.js";

const startupTime = Date.now();

export function moneyPennyStatus(): MoneyPennyStatus & {
  availability_description: string;
  availability_set_at: string;
  availability_set_by: string;
  hold_queue_depth: number;
} {
  const stats = getArbiterStats();
  const availRecord = readAvailabilityRecord();

  const totalActiveThreads = (() => {
    try { return getActiveThreadCount(); } catch { return 0; }
  })();

  const uptime = Math.floor((Date.now() - startupTime) / 1000);

  return {
    active_threads: totalActiveThreads,
    on_hold: stats.hold_queue_depth,
    founder_availability: availRecord.class,
    oldest_held_call: stats.oldest_hold_age_seconds !== null
      ? { thread_id: stats.active_call?.thread_id ?? "unknown", age_seconds: Math.round(stats.oldest_hold_age_seconds) }
      : null,
    uptime_seconds: uptime,
    total_routed_today: stats.today_routed_count,
    receipt_count_today: stats.today_receipt_count,
    availability_description: describeAvailability(availRecord.class),
    availability_set_at: availRecord.set_at,
    availability_set_by: availRecord.set_by,
    hold_queue_depth: stats.hold_queue_depth,
  };
}
