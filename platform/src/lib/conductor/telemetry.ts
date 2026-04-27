/**
 * Conductor Telemetry — Latency + Cost Histograms + Vendor Mix
 * K525 · Phase A.4 · Innovation #2277
 *
 * In-process rolling-window telemetry for the Conductor router. Keeps a
 * bounded ring buffer of recent route events (default last 24 hours, capped
 * at MAX_EVENTS to bound memory) and exposes:
 *
 *   - `recordRoute()`     — called by router after every routing decision
 *   - `getLatencyHistogram(vendor, class)` — p50/p95/p99 + count
 *   - `getCostSummary(windowHours)` — total spend, vendor mix, savings
 *   - `getVendorMix(windowHours)` — % of routed queries per vendor
 *
 * Architecture:
 *   - Pure in-memory; per-process. Survives within a single Node.js / browser
 *     session. For multi-instance Cloud Run deployment, this layer is the
 *     fast path; canonical ledger lives in `scribe_Conductor.jsonl` (K524).
 *   - The aggregate platform dashboard reads from the scribe, NOT from this
 *     in-process telemetry. This module exists to power the per-member Helm
 *     UI cost ticker without round-tripping the scribe on every render.
 *
 * No PII: only vendor, model, query class, latency, cost, and timestamp.
 * Raw query never enters this telemetry; only its hash (when present).
 */

import type { VendorName } from "./adapters/types.js";
import type { QueryClass } from "./classifier.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RouteEvent {
  ts: number;                  // epoch ms
  vendor: VendorName;
  model: string;
  queryClass: QueryClass;
  latencyMs: number | null;    // null = not yet measured (route-only event)
  costUsd: number | null;      // null = not yet measured
  fallbackUsed: boolean;
  /** What the baseline (Opus 4.7) would have cost — for savings calculation. */
  baselineCostUsd: number | null;
  queryHash?: string;          // sha-256 of raw query (optional; never raw)
}

export interface LatencyHistogram {
  vendor: VendorName | null;   // null = aggregate across all vendors
  queryClass: QueryClass | null;
  count: number;
  p50: number | null;
  p95: number | null;
  p99: number | null;
  mean: number | null;
}

export interface VendorMixEntry {
  vendor: VendorName;
  count: number;
  percent: number;
  classBreakdown: Partial<Record<QueryClass, number>>;
}

export interface CostSummary {
  windowHours: number;
  count: number;
  totalCostUsd: number;
  totalBaselineCostUsd: number;
  totalSavingsUsd: number;
  /** USD savings vs single-vendor (Opus) baseline, as percent. */
  savingsPercent: number | null;
  vendorMix: VendorMixEntry[];
}

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

export const MAX_EVENTS = 5_000;             // Cap the ring buffer
export const DEFAULT_WINDOW_HOURS = 24 * 7;  // 7-day default for cost ticker

// ---------------------------------------------------------------------------
// State (per-process singleton)
// ---------------------------------------------------------------------------

const _events: RouteEvent[] = [];

function _trim(): void {
  if (_events.length > MAX_EVENTS) {
    _events.splice(0, _events.length - MAX_EVENTS);
  }
}

function _filterWindow(windowHours: number, nowMs: number = Date.now()): RouteEvent[] {
  const cutoff = nowMs - windowHours * 3600_000;
  return _events.filter((e) => e.ts >= cutoff);
}

function _percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.floor((p / 100) * sortedAsc.length)),
  );
  return sortedAsc[idx];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record a routing decision (and optionally its outcome). Called by the
 * router immediately after a routing decision. May be updated later via
 * `recordRouteOutcome()` to fill in latencyMs + costUsd once the vendor
 * call returns.
 */
export function recordRoute(evt: RouteEvent): void {
  _events.push({ ...evt });
  _trim();
}

/**
 * Patch a previously-recorded event (matched by ts + queryHash if provided)
 * with latency and cost data. No-op if no match found.
 */
export function recordRouteOutcome(
  ts: number,
  patch: Partial<Pick<RouteEvent, "latencyMs" | "costUsd" | "baselineCostUsd">>,
  queryHash?: string,
): void {
  for (let i = _events.length - 1; i >= 0; i--) {
    const e = _events[i];
    if (e.ts === ts && (!queryHash || e.queryHash === queryHash)) {
      if (patch.latencyMs !== undefined) e.latencyMs = patch.latencyMs;
      if (patch.costUsd !== undefined) e.costUsd = patch.costUsd;
      if (patch.baselineCostUsd !== undefined) e.baselineCostUsd = patch.baselineCostUsd;
      return;
    }
  }
}

/** Latency histogram for an optional vendor + class slice. */
export function getLatencyHistogram(
  vendor: VendorName | null = null,
  queryClass: QueryClass | null = null,
  windowHours: number = DEFAULT_WINDOW_HOURS,
): LatencyHistogram {
  const events = _filterWindow(windowHours)
    .filter((e) => e.latencyMs !== null)
    .filter((e) => (vendor ? e.vendor === vendor : true))
    .filter((e) => (queryClass ? e.queryClass === queryClass : true))
    .map((e) => e.latencyMs as number)
    .sort((a, b) => a - b);

  if (events.length === 0) {
    return {
      vendor,
      queryClass,
      count: 0,
      p50: null,
      p95: null,
      p99: null,
      mean: null,
    };
  }

  const sum = events.reduce((acc, x) => acc + x, 0);
  return {
    vendor,
    queryClass,
    count: events.length,
    p50: _percentile(events, 50),
    p95: _percentile(events, 95),
    p99: _percentile(events, 99),
    mean: sum / events.length,
  };
}

/** Vendor-mix breakdown. */
export function getVendorMix(
  windowHours: number = DEFAULT_WINDOW_HOURS,
): VendorMixEntry[] {
  const events = _filterWindow(windowHours);
  if (events.length === 0) return [];

  const totals = new Map<VendorName, { count: number; cls: Map<QueryClass, number> }>();
  for (const e of events) {
    const rec = totals.get(e.vendor) ?? { count: 0, cls: new Map() };
    rec.count++;
    rec.cls.set(e.queryClass, (rec.cls.get(e.queryClass) ?? 0) + 1);
    totals.set(e.vendor, rec);
  }

  const total = events.length;
  return [...totals.entries()]
    .map(([vendor, rec]) => ({
      vendor,
      count: rec.count,
      percent: Math.round((rec.count / total) * 1000) / 10, // one decimal
      classBreakdown: Object.fromEntries(rec.cls.entries()) as Partial<
        Record<QueryClass, number>
      >,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Aggregate cost + savings summary for the cost ticker. */
export function getCostSummary(
  windowHours: number = DEFAULT_WINDOW_HOURS,
): CostSummary {
  const events = _filterWindow(windowHours);
  const withCost = events.filter((e) => e.costUsd !== null);
  const totalCostUsd = withCost.reduce((acc, e) => acc + (e.costUsd ?? 0), 0);
  const totalBaselineCostUsd = withCost
    .filter((e) => e.baselineCostUsd !== null)
    .reduce((acc, e) => acc + (e.baselineCostUsd ?? 0), 0);
  const totalSavingsUsd = Math.max(0, totalBaselineCostUsd - totalCostUsd);

  return {
    windowHours,
    count: events.length,
    totalCostUsd,
    totalBaselineCostUsd,
    totalSavingsUsd,
    savingsPercent:
      totalBaselineCostUsd > 0
        ? Math.round((totalSavingsUsd / totalBaselineCostUsd) * 1000) / 10
        : null,
    vendorMix: getVendorMix(windowHours),
  };
}

/** Recent N events (newest first). For the Helm route-history list. */
export function getRecentRoutes(limit: number = 10): RouteEvent[] {
  return [..._events].slice(-limit).reverse();
}

/** Test-only: clear all telemetry state. */
export function _resetTelemetryForTests(): void {
  _events.length = 0;
}
