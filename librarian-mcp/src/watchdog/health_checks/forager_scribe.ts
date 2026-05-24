/**
 * Watchdog health check — Forager Scribe daemon
 *
 * Forager Scribe prospecting / Well of Knowledge population daemon.
 * Health probe: check for forager state directory and last-run marker.
 *
 * R-MECHANISM-VERIFY: file mtime round-trip.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";

const FORAGER_DIR  = resolve(homedir(), ".claude", "state", "forager_scribe");
const FORAGER_LOG  = resolve(FORAGER_DIR, "forager_runs.jsonl");
const FORAGER_LOCK = resolve(FORAGER_DIR, "forager.lock");

const STALE_DEGRADED_MS = 48 * 60 * 60 * 1000;  // 48 hours
const STALE_DOWN_MS     = 96 * 60 * 60 * 1000;  // 96 hours

export async function checkForagerScribe(): Promise<HealthCheckResult> {
  const start = Date.now();
  const subject = "forager-scribe";

  if (!existsSync(FORAGER_DIR)) {
    return {
      subject,
      status: 'degraded',
      latency_ms: Date.now() - start,
      metadata: {
        error: "Forager Scribe state directory missing — not yet initialized",
        details: { initialized: false },
      },
      checked_at: new Date().toISOString(),
    };
  }

  const lockExists = existsSync(FORAGER_LOCK);

  if (!existsSync(FORAGER_LOG)) {
    return {
      subject,
      status: 'degraded',
      latency_ms: Date.now() - start,
      metadata: {
        error: "Forager dir exists but no run log yet",
        details: { initialized: true, log_exists: false, lock_exists: lockExists },
      },
      checked_at: new Date().toISOString(),
    };
  }

  try {
    const mtime = statSync(FORAGER_LOG).mtimeMs;
    const ageMs = Date.now() - mtime;
    const lastActivity = new Date(mtime).toISOString();
    const latency = Date.now() - start;

    if (ageMs > STALE_DOWN_MS) {
      return {
        subject,
        status: 'down',
        latency_ms: latency,
        metadata: {
          last_activity: lastActivity,
          error: `No forager runs in ${Math.round(ageMs / 3600000)}h`,
        },
        checked_at: new Date().toISOString(),
      };
    }

    if (ageMs > STALE_DEGRADED_MS) {
      return {
        subject,
        status: 'degraded',
        latency_ms: latency,
        metadata: { last_activity: lastActivity, details: { age_hours: Math.round(ageMs / 3600000) } },
        checked_at: new Date().toISOString(),
      };
    }

    return {
      subject,
      status: 'ok',
      latency_ms: latency,
      metadata: {
        last_activity: lastActivity,
        details: { lock_active: lockExists },
      },
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      subject,
      status: 'down',
      latency_ms: Date.now() - start,
      metadata: { error: String(err) },
      checked_at: new Date().toISOString(),
    };
  }
}
