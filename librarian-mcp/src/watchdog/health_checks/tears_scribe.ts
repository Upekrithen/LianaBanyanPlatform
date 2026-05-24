/**
 * Watchdog health check — Tears Scribe daemon (B81)
 *
 * Tears Scribe logs subject-down events with no breakage as Tears candidates.
 * Health probe: check for the tears_scribe state directory and signal file.
 *
 * R-MECHANISM-VERIFY: file mtime round-trip.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";

const TEARS_SCRIBE_DIR = resolve(homedir(), ".claude", "state", "tears_scribe");
const TEARS_SCRIBE_LOG = resolve(TEARS_SCRIBE_DIR, "tears_signals.jsonl");

const STALE_DEGRADED_MS = 48 * 60 * 60 * 1000;  // 48 hours
const STALE_DOWN_MS     = 96 * 60 * 60 * 1000;  // 96 hours

export async function checkTearsScribe(): Promise<HealthCheckResult> {
  const start = Date.now();
  const subject = "tears-scribe";

  if (!existsSync(TEARS_SCRIBE_DIR)) {
    return {
      subject,
      status: 'degraded',
      latency_ms: Date.now() - start,
      metadata: {
        error: "Tears Scribe B81 state directory missing — not yet landed",
        details: { b81_landed: false },
      },
      checked_at: new Date().toISOString(),
    };
  }

  if (!existsSync(TEARS_SCRIBE_LOG)) {
    return {
      subject,
      status: 'degraded',
      latency_ms: Date.now() - start,
      metadata: {
        error: "Tears Scribe dir exists but no signal log yet",
        details: { b81_landed: true, log_exists: false },
      },
      checked_at: new Date().toISOString(),
    };
  }

  try {
    const mtime = statSync(TEARS_SCRIBE_LOG).mtimeMs;
    const ageMs = Date.now() - mtime;
    const lastActivity = new Date(mtime).toISOString();
    const latency = Date.now() - start;

    if (ageMs > STALE_DOWN_MS) {
      return {
        subject,
        status: 'down',
        latency_ms: latency,
        metadata: { last_activity: lastActivity, error: `No tears signals in ${Math.round(ageMs / 3600000)}h` },
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
      metadata: { last_activity: lastActivity, details: { b81_landed: true } },
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
