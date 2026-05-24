/**
 * MCP Tool: mcp__watchdog__status
 *
 * Returns current health state for all monitored subjects.
 * G5 gate: watchdog_status tool.
 */

import { loadState, readHeartbeat } from "../state_store.js";
import type { WatchdogState, HealthCheckResult } from "../types.js";

export interface WatchdogStatusOutput {
  summary: {
    total: number;
    ok: number;
    degraded: number;
    down: number;
    unknown: number;
  };
  subjects: HealthCheckResult[];
  last_poll_at: string;
  daemon_start: string;
  poll_count: number;
  heartbeat: { ts: string; poll_count: number } | null;
  ts: string;
}

export function watchdogStatus(): WatchdogStatusOutput {
  const state: WatchdogState = loadState();
  const subjects = Object.values(state.subjects);

  const summary = {
    total:    subjects.length,
    ok:       subjects.filter(s => s.status === 'ok').length,
    degraded: subjects.filter(s => s.status === 'degraded').length,
    down:     subjects.filter(s => s.status === 'down').length,
    unknown:  subjects.filter(s => s.status === 'unknown').length,
  };

  return {
    summary,
    subjects: subjects.sort((a, b) => a.subject.localeCompare(b.subject)),
    last_poll_at: state.last_poll_at,
    daemon_start: state.daemon_start,
    poll_count: state.poll_count,
    heartbeat: readHeartbeat(),
    ts: new Date().toISOString(),
  };
}
