/**
 * Watchdog health check — Sweat Scribe daemon (B80)
 *
 * Sweat Scribe appends effort signals to:
 *   ~/.claude/state/sweat_scribe/raw_signals.jsonl
 *
 * Health: file exists + has been written to within the last 24 hours
 * (or pending file exists for pre-B80 graceful degradation).
 *
 * R-MECHANISM-VERIFY: round-trip via file mtime.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { HealthCheckResult } from "../types.js";

const SWEAT_SCRIBE_LIVE = resolve(homedir(), ".claude", "state", "sweat_scribe", "raw_signals.jsonl");
const SWEAT_SCRIBE_PENDING = resolve(homedir(), ".claude", "state", "drekaskip", "effort_signals_pending.jsonl");

const STALE_DEGRADED_MS = 24 * 60 * 60 * 1000;   // 24 hours
const STALE_DOWN_MS     = 72 * 60 * 60 * 1000;   // 72 hours

export async function checkSweatScribe(): Promise<HealthCheckResult> {
  const start = Date.now();
  const subject = "sweat-scribe";

  // B80 not yet landed — graceful degradation
  if (!existsSync(SWEAT_SCRIBE_LIVE)) {
    const pendingExists = existsSync(SWEAT_SCRIBE_PENDING);
    return {
      subject,
      status: 'degraded',
      latency_ms: Date.now() - start,
      metadata: {
        error: "Sweat Scribe B80 not yet landed; pending buffer " + (pendingExists ? "active" : "missing"),
        details: { pending_buffer_exists: pendingExists, b80_landed: false },
      },
      checked_at: new Date().toISOString(),
    };
  }

  try {
    const mtime = statSync(SWEAT_SCRIBE_LIVE).mtimeMs;
    const ageMs = Date.now() - mtime;
    const lastActivity = new Date(mtime).toISOString();
    const latency = Date.now() - start;

    if (ageMs > STALE_DOWN_MS) {
      return {
        subject,
        status: 'down',
        latency_ms: latency,
        metadata: { last_activity: lastActivity, error: `No signals in ${Math.round(ageMs / 3600000)}h` },
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
      metadata: { last_activity: lastActivity, details: { b80_landed: true } },
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
