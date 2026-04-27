/**
 * Conductor Circuit Breaker — Vendor Failure Handling
 * K525 · Phase A.1 · Innovation #2277
 *
 * Per-vendor circuit breaker that detects sustained vendor failures and routes
 * around the broken vendor for a cooldown period.
 *
 * Mechanic: if a vendor returns three 5xx responses within a 60-second window,
 * the breaker opens for that vendor for 5 minutes. Routing decisions in the
 * `route()` function consult `isVendorAvailable()` before selecting a vendor;
 * an OPEN vendor is excluded from the candidate set.
 *
 * Implementation notes:
 *   - In-process state only (a singleton Map). Survives between routing calls
 *     within the same process; resets on cold start. Acceptable for the dogfood
 *     wave; production multi-instance deployments will need shared state via
 *     a Supabase function or Redis (deferred to K-future).
 *   - Half-open state: after the cooldown elapses, the breaker becomes
 *     half-open and the next request is allowed to probe the vendor. Success
 *     closes the breaker; failure re-opens for another cooldown.
 *   - Non-fatal: callers MUST treat circuit-breaker checks as advisory. If
 *     all vendors are open (catastrophic), the router falls back to the
 *     conservative anthropic default — a closed-circuit attempt is still
 *     better than a guaranteed failure.
 *
 * Fairness note ("#37 Let your yea be yea"): the breaker reports its decisions
 * to the Conductor scribe via `mode: "circuit_breaker_open"` so members see
 * exactly when and why a vendor was excluded.
 */

import type { VendorName } from "./adapters/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitStatus {
  vendor: VendorName;
  state: CircuitState;
  failuresInWindow: number;
  openedAt: number | null;     // epoch ms
  cooldownEndsAt: number | null; // epoch ms
}

interface VendorRecord {
  /** Timestamps (ms) of recent 5xx failures within the rolling window. */
  failureTimestamps: number[];
  state: CircuitState;
  openedAt: number | null;
  cooldownEndsAt: number | null;
}

// ---------------------------------------------------------------------------
// Tunables (exported as constants for tests + telemetry)
// ---------------------------------------------------------------------------

export const FAILURE_THRESHOLD = 3;         // failures within window to open circuit
export const FAILURE_WINDOW_MS = 60_000;    // 60s rolling window
export const COOLDOWN_MS = 5 * 60_000;      // 5 minutes open before half-open probe

// ---------------------------------------------------------------------------
// State (per-process singleton)
// ---------------------------------------------------------------------------

const _state = new Map<VendorName, VendorRecord>();

function _ensure(vendor: VendorName): VendorRecord {
  let rec = _state.get(vendor);
  if (!rec) {
    rec = {
      failureTimestamps: [],
      state: "closed",
      openedAt: null,
      cooldownEndsAt: null,
    };
    _state.set(vendor, rec);
  }
  return rec;
}

function _pruneOldFailures(rec: VendorRecord, now: number): void {
  const cutoff = now - FAILURE_WINDOW_MS;
  rec.failureTimestamps = rec.failureTimestamps.filter((t) => t >= cutoff);
}

function _maybeTransitionToHalfOpen(rec: VendorRecord, now: number): void {
  if (
    rec.state === "open" &&
    rec.cooldownEndsAt !== null &&
    now >= rec.cooldownEndsAt
  ) {
    rec.state = "half_open";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record a vendor response. Pass `ok=false` for 5xx-class failures (or any
 * other "vendor is broken" signal); pass `ok=true` on success.
 *
 * Side effects: may mutate breaker state (close → open → half_open → closed).
 */
export function recordVendorResponse(
  vendor: VendorName,
  ok: boolean,
  nowMs: number = Date.now(),
): CircuitStatus {
  const rec = _ensure(vendor);
  _pruneOldFailures(rec, nowMs);
  _maybeTransitionToHalfOpen(rec, nowMs);

  if (ok) {
    // Success — clear failures, close breaker (regardless of prior state).
    rec.failureTimestamps = [];
    rec.state = "closed";
    rec.openedAt = null;
    rec.cooldownEndsAt = null;
    return _toStatus(vendor, rec);
  }

  // Failure path
  rec.failureTimestamps.push(nowMs);

  if (rec.state === "half_open") {
    // Half-open probe failed → re-open breaker for full cooldown
    rec.state = "open";
    rec.openedAt = nowMs;
    rec.cooldownEndsAt = nowMs + COOLDOWN_MS;
    return _toStatus(vendor, rec);
  }

  if (rec.failureTimestamps.length >= FAILURE_THRESHOLD && rec.state === "closed") {
    rec.state = "open";
    rec.openedAt = nowMs;
    rec.cooldownEndsAt = nowMs + COOLDOWN_MS;
  }

  return _toStatus(vendor, rec);
}

/**
 * Check whether a vendor is currently available (closed or half-open).
 * Returns false ONLY when the breaker is fully open.
 */
export function isVendorAvailable(
  vendor: VendorName,
  nowMs: number = Date.now(),
): boolean {
  const rec = _ensure(vendor);
  _pruneOldFailures(rec, nowMs);
  _maybeTransitionToHalfOpen(rec, nowMs);
  return rec.state !== "open";
}

/**
 * Return the current status for a vendor. Useful for telemetry, member-facing
 * dashboards, and the Conductor scribe `mode: "circuit_breaker_open"` log.
 */
export function getCircuitStatus(
  vendor: VendorName,
  nowMs: number = Date.now(),
): CircuitStatus {
  const rec = _ensure(vendor);
  _pruneOldFailures(rec, nowMs);
  _maybeTransitionToHalfOpen(rec, nowMs);
  return _toStatus(vendor, rec);
}

/**
 * Return statuses for all four canonical vendors. Used by the aggregate
 * vendor-mix dashboard so the UI can mark OPEN vendors as "temporarily
 * unavailable — auto-routed elsewhere" rather than silently disappearing.
 */
export function getAllCircuitStatuses(
  nowMs: number = Date.now(),
): CircuitStatus[] {
  const vendors: VendorName[] = ["anthropic", "openai", "google", "perplexity"];
  return vendors.map((v) => getCircuitStatus(v, nowMs));
}

/**
 * Reset all circuit-breaker state. Test-only helper; do not call from
 * production code. Exported so vitest suites can run hermetically.
 */
export function _resetCircuitBreakerForTests(): void {
  _state.clear();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _toStatus(vendor: VendorName, rec: VendorRecord): CircuitStatus {
  return {
    vendor,
    state: rec.state,
    failuresInWindow: rec.failureTimestamps.length,
    openedAt: rec.openedAt,
    cooldownEndsAt: rec.cooldownEndsAt,
  };
}
