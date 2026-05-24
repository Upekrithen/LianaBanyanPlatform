/**
 * Watchdog Alerting — Hall Monitor advisory dispatch (LB-STACK-0223)
 *
 * Triggered when 3+ subjects are simultaneously down.
 * Hall Monitor is advisory class — no escalation beyond the event log.
 *
 * Writes to:
 *   ~/.claude/state/watchdog/hall_monitor_advisories.jsonl
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";

interface HallMonitorAdvisory {
  advisory_class: 'MULTI_DOWN';
  down_count: number;
  subjects_down: string[];
  health_results: HealthCheckResult[];
  advisory_text: string;
  ts: string;
  watchdog_version: string;
}

const HALL_MONITOR_PATH = resolve(
  homedir(), ".claude", "state", "watchdog", "hall_monitor_advisories.jsonl",
);

function ensureDir(): void {
  mkdirSync(resolve(HALL_MONITOR_PATH, ".."), { recursive: true });
}

export function dispatchHallMonitor(downResults: HealthCheckResult[]): HallMonitorAdvisory {
  ensureDir();

  const advisory: HallMonitorAdvisory = {
    advisory_class: 'MULTI_DOWN',
    down_count: downResults.length,
    subjects_down: downResults.map(r => r.subject),
    health_results: downResults,
    advisory_text: buildAdvisoryText(downResults),
    ts: new Date().toISOString(),
    watchdog_version: "BP034",
  };

  appendFileSync(HALL_MONITOR_PATH, JSON.stringify(advisory) + "\n", "utf-8");
  console.error(
    `[watchdog/hall_monitor] Advisory: ${downResults.length} subjects simultaneously down — ${advisory.subjects_down.join(", ")}`,
  );
  return advisory;
}

function buildAdvisoryText(results: HealthCheckResult[]): string {
  const names = results.map(r => r.subject).join(", ");
  return (
    `HALL_MONITOR ADVISORY: ${results.length} substrate subjects simultaneously down → [${names}]. ` +
    `This may indicate a system-wide issue. Watchdog cooperative repair loop activated (LB-STACK-0165).`
  );
}
