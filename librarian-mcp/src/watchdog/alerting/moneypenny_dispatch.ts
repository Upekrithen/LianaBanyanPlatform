/**
 * Watchdog Alerting — MoneyPenny dispatch (B82)
 *
 * Called when a CRITICAL subject is down >5 minutes.
 * Updates Founder availability state to surface the alert.
 *
 * Writes to:
 *   ~/.claude/state/watchdog/moneypenny_alerts.jsonl
 *
 * When B82 MoneyPenny is live, this also updates the availability state
 * so that Bishop session-open surfaces the alert to the Founder.
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";

interface MoneyPennyAlert {
  alert_class: 'CRITICAL_DOWN' | 'MULTI_DOWN';
  subjects_down: string[];
  down_duration_ms?: number;
  primary_subject?: string;
  health_results: HealthCheckResult[];
  intervention_required: boolean;
  message: string;
  ts: string;
  watchdog_version: string;
}

const MP_ALERTS_PATH  = resolve(homedir(), ".claude", "state", "watchdog", "moneypenny_alerts.jsonl");
const MP_AVAILABILITY = resolve(homedir(), ".claude", "state", "moneypenny", "availability.json");

function ensureDir(): void {
  mkdirSync(resolve(MP_ALERTS_PATH, ".."), { recursive: true });
}

export function dispatchMoneyPennyAlert(
  subjectsDown: HealthCheckResult[],
  downDurationMs?: number,
): MoneyPennyAlert {
  ensureDir();

  const alert: MoneyPennyAlert = {
    alert_class: 'CRITICAL_DOWN',
    subjects_down: subjectsDown.map(r => r.subject),
    down_duration_ms: downDurationMs,
    primary_subject: subjectsDown[0]?.subject,
    health_results: subjectsDown,
    intervention_required: true,
    message: buildAlertMessage(subjectsDown, downDurationMs),
    ts: new Date().toISOString(),
    watchdog_version: "BP034",
  };

  appendFileSync(MP_ALERTS_PATH, JSON.stringify(alert) + "\n", "utf-8");

  // If MoneyPenny availability state exists, inject the alert note
  // so the next Bishop session-open shows it
  tryInjectMoneyPennyNote(alert);

  console.error(`[watchdog/moneypenny] Critical alert dispatched: ${alert.message}`);
  return alert;
}

function buildAlertMessage(subjects: HealthCheckResult[], durationMs?: number): string {
  const names = subjects.map(r => r.subject).join(", ");
  const dur = durationMs ? ` for ${Math.round(durationMs / 60000)}min` : "";
  return `WATCHDOG: critical subject(s) DOWN${dur} → [${names}]. Founder intervention may be needed.`;
}

function tryInjectMoneyPennyNote(alert: MoneyPennyAlert): void {
  if (!existsSync(resolve(MP_AVAILABILITY, ".."))) return;
  try {
    const noteDir = resolve(homedir(), ".claude", "state", "moneypenny", "watchdog_alerts");
    mkdirSync(noteDir, { recursive: true });
    appendFileSync(
      resolve(noteDir, "pending_alerts.jsonl"),
      JSON.stringify(alert) + "\n",
      "utf-8",
    );
  } catch { /* best-effort */ }
}
