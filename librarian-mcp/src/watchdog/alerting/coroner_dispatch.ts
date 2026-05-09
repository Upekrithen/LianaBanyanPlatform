/**
 * Watchdog Alerting — Coroner Scribe dispatch (LB-STACK-0171)
 *
 * Dispatched when a subject status flips ok/degraded → down.
 * Coroner Scribe performs post-mortem analysis on failure events.
 *
 * The dispatch writes a structured record to:
 *   ~/.claude/state/watchdog/coroner_queue.jsonl
 *
 * Coroner picks up from this file on its next sweep.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";
import { coronerLogSignal } from "../../scribes/coroner_scribe.js";

interface CoronerDispatch {
  dispatch_type: 'SUBJECT_DOWN' | 'SUSTAINED_DEGRADED';
  subject: string;
  trigger: string;
  health_result: HealthCheckResult;
  failure_class: string;
  autopsy_signal: string;
  ts: string;
  watchdog_version: string;
}

const CORONER_QUEUE = resolve(homedir(), ".claude", "state", "watchdog", "coroner_queue.jsonl");

function ensureDir(): void {
  mkdirSync(resolve(CORONER_QUEUE, ".."), { recursive: true });
}

export function dispatchCoroner(result: HealthCheckResult, trigger = "subject_down"): CoronerDispatch {
  ensureDir();
  const dispatch: CoronerDispatch = {
    dispatch_type: 'SUBJECT_DOWN',
    subject: result.subject,
    trigger,
    health_result: result,
    failure_class: classifyFailure(result),
    autopsy_signal: buildAutopsySignal(result),
    ts: new Date().toISOString(),
    watchdog_version: "BP034",
  };
  appendFileSync(CORONER_QUEUE, JSON.stringify(dispatch) + "\n", "utf-8");
  console.error(`[watchdog/coroner] Dispatched post-mortem for subject="${result.subject}" failure_class="${dispatch.failure_class}"`);

  // Secondary write: route to Coroner Scribe daemon for substrate-discipline classification
  try {
    coronerLogSignal({
      source: "watchdog_dispatch",
      signal_class: "failure_event",
      payload: dispatch.autopsy_signal,
      rule_association: inferRuleAssociation(dispatch.failure_class),
      session: dispatch.watchdog_version,
      failure_class: dispatch.failure_class,
    });
  } catch { /* non-fatal — watchdog alerting must not block on scribe */ }

  return dispatch;
}

function inferRuleAssociation(failureClass: string): string | undefined {
  if (failureClass === "SUBSTRATE_STALE") return "BR-003";    // R-MECHANISM-VERIFY
  if (failureClass === "DEPENDENCY_MISSING") return "BR-003"; // R-MECHANISM-VERIFY
  // CONNECTIVITY_TIMEOUT and PROBE_FAILURE are infrastructure, not discipline-class
  return undefined;
}

function classifyFailure(result: HealthCheckResult): string {
  const err = result.metadata.error ?? "";
  if (err.includes("timeout"))   return "CONNECTIVITY_TIMEOUT";
  if (err.includes("ECONNREFUSED")) return "SERVICE_NOT_RUNNING";
  if (err.includes("stale") || err.includes("not rebuilt")) return "SUBSTRATE_STALE";
  if (err.includes("missing"))   return "DEPENDENCY_MISSING";
  if (result.latency_ms === 0)   return "PROBE_FAILURE";
  return "UNKNOWN_FAILURE";
}

function buildAutopsySignal(result: HealthCheckResult): string {
  return [
    `AUTOPSY_SIGNAL`,
    `FAILURE_CLASS:${classifyFailure(result)}`,
    `subject=${result.subject}`,
    result.metadata.error ? `error=${result.metadata.error.slice(0, 100)}` : "",
  ].filter(Boolean).join(" | ");
}
