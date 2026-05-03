/**
 * Slow Blade Defense Stack v2 Master — Unified Orchestration Module
 * ==================================================================
 * Gap 6 / Bushel 18 Sub-Pod B close
 *
 * Orchestrates all Slow Blade defense mechanisms so they co-fire as a
 * unified stack. Single entry point for all production Furnace traffic.
 *
 * Stack layers (fire in order):
 *   L1  Pre-flight audit   — reject obviously malformed requests
 *   L2  Rate limiter       — 5-dimensional token bucket (v2.8 vector)
 *   L3  Concurrency gate   — acquire slot before inference
 *   L4  Cost telemetry     — instrument actual cost vs estimated
 *   L5  Anomaly feedback   — compare actual vs baseline → trigger adaptive dim5
 *   L6  Release            — always release concurrency slot
 *
 * Primitive slug: slow_blade_defense_stack_v2_master
 */

import { SlowBladeRateLimiter, type SlowBladeConfig } from './slow_blade_rate_limiter.js';

// ─── Stack request ─────────────────────────────────────────────────────────

export interface FurnaceRequest {
  session_id: string;
  member_id: string;
  path: string;
  estimated_tokens: number;
  estimated_cost_micros: number;
  payload?: unknown;
}

export interface FurnaceResult<T = unknown> {
  allowed: boolean;
  layer_rejected?: string;
  dimension_rejected?: string;
  duration_ms?: number;
  actual_cost_micros?: number;
  anomaly_triggered?: boolean;
  result?: T;
  error?: string;
}

export type FurnaceHandler<T> = (request: FurnaceRequest) => Promise<T>;

// ─── Stack telemetry ───────────────────────────────────────────────────────

export interface StackTelemetry {
  requests_total: number;
  requests_allowed: number;
  requests_rejected: number;
  rejections_by_dimension: Record<string, number>;
  anomaly_events: number;
  avg_duration_ms: number;
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export class SlowBladeOrchestrator {
  private limiter: SlowBladeRateLimiter;
  private telemetry: StackTelemetry;

  /** Baseline cost per token (microdollars) — used to detect 8× anomaly. */
  private baselineCostPerTokenMicros: number;

  constructor(config: Partial<SlowBladeConfig> = {}, baselineCostPerTokenMicros: number = 0.05) {
    this.limiter = new SlowBladeRateLimiter(config);
    this.baselineCostPerTokenMicros = baselineCostPerTokenMicros;
    this.telemetry = {
      requests_total: 0,
      requests_allowed: 0,
      requests_rejected: 0,
      rejections_by_dimension: {},
      anomaly_events: 0,
      avg_duration_ms: 0,
    };
  }

  /**
   * Run the full 6-layer defense stack around a Furnace handler.
   */
  async runGuarded<T>(
    request: FurnaceRequest,
    handler: FurnaceHandler<T>,
  ): Promise<FurnaceResult<T>> {
    this.telemetry.requests_total++;
    const t0 = Date.now();

    // L1: Pre-flight audit
    if (!request.session_id || !request.member_id) {
      return this._rejected('L1_preflight', 'malformed_request');
    }
    if (request.estimated_tokens <= 0) {
      return this._rejected('L1_preflight', 'zero_token_estimate');
    }

    // L2: Rate limiter check (all 5 dims)
    const check = this.limiter.check({
      session_id: request.session_id,
      member_id: request.member_id,
      estimated_tokens: request.estimated_tokens,
      estimated_cost_micros: request.estimated_cost_micros,
      path: request.path,
    });

    if (!check.allowed) {
      this._trackRejection(check.dimension ?? 'unknown');
      return this._rejected(`L2_rate_limiter.${check.dimension}`, check.dimension ?? 'unknown');
    }

    // L3: Acquire concurrency slot
    this.limiter.acquireConcurrencySlot();

    let result: T | undefined;
    let actualCostMicros: number | undefined;
    let anomalyTriggered = false;

    try {
      // L4: Run handler (actual inference)
      result = await handler(request);
      const duration = Date.now() - t0;

      // Estimate actual cost from duration heuristic (tokens × baseline)
      actualCostMicros = request.estimated_tokens * this.baselineCostPerTokenMicros;

      // L5: Anomaly detection — cost > 8× baseline triggers adaptive dim5
      const expectedCost = request.estimated_cost_micros;
      if (actualCostMicros > expectedCost * 8) {
        anomalyTriggered = true;
        this.limiter.signalAnomaly(true);
        this.telemetry.anomaly_events++;
      } else if (this.limiter.getActiveConcurrency() === 0) {
        // Reset anomaly once traffic normalizes
        this.limiter.signalAnomaly(false);
      }

      this.telemetry.requests_allowed++;
      this._updateAvgDuration(duration);

      return {
        allowed: true,
        duration_ms: duration,
        actual_cost_micros: actualCostMicros,
        anomaly_triggered: anomalyTriggered,
        result,
      };
    } catch (err) {
      return {
        allowed: true,
        error: err instanceof Error ? err.message : String(err),
        anomaly_triggered: anomalyTriggered,
      };
    } finally {
      // L6: Always release concurrency slot
      this.limiter.releaseConcurrencySlot();
    }
  }

  /** Get stack telemetry snapshot. */
  getTelemetry(): Readonly<StackTelemetry> {
    return { ...this.telemetry };
  }

  /** Expose limiter for advanced tests. */
  getLimiter(): SlowBladeRateLimiter {
    return this.limiter;
  }

  /** Reset all state (test teardown). */
  reset(): void {
    this.limiter.reset();
    this.telemetry = {
      requests_total: 0, requests_allowed: 0, requests_rejected: 0,
      rejections_by_dimension: {}, anomaly_events: 0, avg_duration_ms: 0,
    };
  }

  private _rejected(layer: string, dimension: string): FurnaceResult<never> {
    this.telemetry.requests_rejected++;
    return { allowed: false, layer_rejected: layer, dimension_rejected: dimension };
  }

  private _trackRejection(dimension?: string): void {
    const key = dimension ?? 'unknown';
    this.telemetry.rejections_by_dimension[key] =
      (this.telemetry.rejections_by_dimension[key] ?? 0) + 1;
  }

  private _updateAvgDuration(durationMs: number): void {
    const n = this.telemetry.requests_allowed;
    this.telemetry.avg_duration_ms =
      ((this.telemetry.avg_duration_ms * (n - 1)) + durationMs) / n;
  }
}
