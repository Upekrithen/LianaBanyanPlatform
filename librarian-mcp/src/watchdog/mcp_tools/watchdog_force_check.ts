/**
 * MCP Tool: mcp__watchdog__force_check
 *
 * Triggers an immediate out-of-cycle health check for all (or specified) subjects.
 * Returns fresh health results.
 * G5 gate: watchdog_force_check tool.
 */

import { runAllChecks } from "../health_checks/index.js";
import * as checks from "../health_checks/index.js";
import type { HealthCheckResult, HealthStatus } from "../types.js";
import {
  loadState, saveState, updateSubjectResult, appendHistory, writeHeartbeat,
} from "../state_store.js";

export interface WatchdogForceCheckInput {
  /** If provided, only check this specific subject by ID. */
  subject?: string;
}

export interface WatchdogForceCheckOutput {
  results: HealthCheckResult[];
  summary: { ok: number; degraded: number; down: number };
  triggered_at: string;
  duration_ms: number;
}

export async function watchdogForceCheck(
  input: WatchdogForceCheckInput = {},
): Promise<WatchdogForceCheckOutput> {
  const triggerStart = Date.now();

  let results: HealthCheckResult[];
  if (input.subject) {
    const found = await runSingleSubjectCheck(input.subject);
    results = found ? [found] : await runAllChecks();
  } else {
    results = await runAllChecks();
  }

  // Persist results
  let state = loadState();
  for (const result of results) {
    const prev = state.subjects[result.subject];
    if (prev && prev.status !== result.status) {
      appendHistory({
        event_type: 'status_change',
        subject: result.subject,
        from_status: prev.status as HealthStatus,
        to_status: result.status as HealthStatus,
        details: `force_check triggered status change`,
        ts: new Date().toISOString(),
      });
    }
    state = updateSubjectResult(state, result);
  }
  state.poll_count += 1;
  saveState(state);
  writeHeartbeat(state.poll_count);

  const summary = {
    ok:       results.filter(r => r.status === 'ok').length,
    degraded: results.filter(r => r.status === 'degraded').length,
    down:     results.filter(r => r.status === 'down').length,
  };

  return {
    results,
    summary,
    triggered_at: new Date().toISOString(),
    duration_ms: Date.now() - triggerStart,
  };
}

async function runSingleSubjectCheck(subject: string): Promise<HealthCheckResult | null> {
  const checkMap: Record<string, () => Promise<HealthCheckResult>> = {
    'librarian-mcp':        checks.checkLibrarianMcp,
    'moneypenny':           checks.checkMoneyPenny,
    'drekaskip':            checks.checkDrekaskip,
    'hearth':               checks.checkHearth,
    'sweat-scribe':         checks.checkSweatScribe,
    'tears-scribe':         checks.checkTearsScribe,
    'forager-scribe':       checks.checkForagerScribe,
    'substrate-api':        checks.checkSubstrateApi,
    'knight-bishop-bridge': checks.checkKnightBishopBridge,
  };
  const fn = checkMap[subject];
  return fn ? fn() : null;
}
