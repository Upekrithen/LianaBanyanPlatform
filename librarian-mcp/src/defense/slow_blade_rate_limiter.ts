/**
 * Slow Blade v2.8 — Server-Side Furnace Rate Limiter
 * ===================================================
 * Gap 2 / Bushel 18 Sub-Pod B close
 *
 * Provides server-side token-bucket rate limiting for production Furnace
 * inference paths (edge functions, DB writes, LLM calls). NOT demo-copy
 * alone — this is the enforcement layer that fires on production requests.
 *
 * v2.8 Vector:
 *   Dim 1 (Per-session):   max N tokens per session window
 *   Dim 2 (Per-member):    max M requests per minute per member
 *   Dim 3 (Global-burst):  hard ceiling on concurrent Furnace threads
 *   Dim 4 (Cost-gate):     estimated-cost check before expensive inference
 *   Dim 5 (Adaptive):      raises threshold when anomalous patterns detected
 *
 * Primitive slug: slow_blade_v2_8_vector
 * A&A: composes with #2317 Pheromone Substrate (emit on rate-limit event)
 */

import { emitPheromone } from '../scribes/pheromone.js';

// ─── Configuration ─────────────────────────────────────────────────────────

export interface SlowBladeConfig {
  /** Dim 1: Max token budget per session (default 100k) */
  sessionTokenCap: number;
  /** Dim 2: Max requests per member per minute window (default 30) */
  memberRequestsPerMinute: number;
  /** Dim 3: Max concurrent Furnace inference threads (default 5) */
  globalConcurrencyLimit: number;
  /** Dim 4: Max estimated cost per single request in microdollars (default 50000 = $0.05) */
  singleRequestCostCapMicros: number;
  /** Dim 5: Adaptive multiplier applied when anomaly detected (default 0.5 = halved) */
  adaptiveMultiplier: number;
}

export const DEFAULT_CONFIG: SlowBladeConfig = {
  sessionTokenCap:           100_000,
  memberRequestsPerMinute:   30,
  globalConcurrencyLimit:    5,
  singleRequestCostCapMicros: 50_000,
  adaptiveMultiplier:        0.5,
};

// ─── Rate-limit event ──────────────────────────────────────────────────────

export type LimitDimension = 'session_token' | 'member_rpm' | 'global_concurrency' | 'cost_gate' | 'adaptive';

export interface RateLimitEvent {
  ts: string;
  member_id: string;
  session_id: string;
  dimension: LimitDimension;
  value: number;
  limit: number;
  allowed: boolean;
  path: string;         // e.g. "inference/llm" | "edge/radar-ping" | "db/write"
}

// ─── Token bucket (in-process; for edge/serverless use stateless check only) ──

interface SessionBucket {
  tokensUsed: number;
  windowStart: number;
}

interface MemberBucket {
  requests: number;
  windowStart: number;
}

const _sessionBuckets = new Map<string, SessionBucket>();
const _memberBuckets  = new Map<string, MemberBucket>();
let _activeConcurrency = 0;

// ─── Core enforcement ──────────────────────────────────────────────────────

export class SlowBladeRateLimiter {
  private config: SlowBladeConfig;
  private anomalyDetected: boolean = false;

  constructor(config: Partial<SlowBladeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check all 5 dimensions before allowing a Furnace request.
   * Returns { allowed: true } or { allowed: false, dimension, value, limit }.
   */
  check(params: {
    session_id: string;
    member_id: string;
    estimated_tokens: number;
    estimated_cost_micros: number;
    path: string;
  }): { allowed: boolean; dimension?: LimitDimension; value?: number; limit?: number } {
    const now = Date.now();
    const effective = this.anomalyDetected ? this.config.adaptiveMultiplier : 1.0;

    // Dim 1: Session token cap
    const sessionBucket = _sessionBuckets.get(params.session_id) ?? { tokensUsed: 0, windowStart: now };
    const projectedTokens = sessionBucket.tokensUsed + params.estimated_tokens;
    const sessionCap = Math.floor(this.config.sessionTokenCap * effective);
    if (projectedTokens > sessionCap) {
      this._emit(params, 'session_token', projectedTokens, sessionCap, false);
      return { allowed: false, dimension: 'session_token', value: projectedTokens, limit: sessionCap };
    }

    // Dim 2: Member requests per minute
    const memberBucket = _memberBuckets.get(params.member_id) ?? { requests: 0, windowStart: now };
    const windowElapsed = now - memberBucket.windowStart;
    const resetWindow = windowElapsed > 60_000;
    const memberRequests = resetWindow ? 1 : memberBucket.requests + 1;
    const memberCap = Math.floor(this.config.memberRequestsPerMinute * effective);
    if (!resetWindow && memberBucket.requests >= memberCap) {
      this._emit(params, 'member_rpm', memberBucket.requests, memberCap, false);
      return { allowed: false, dimension: 'member_rpm', value: memberBucket.requests, limit: memberCap };
    }

    // Dim 3: Global concurrency
    const concurrencyCap = Math.floor(this.config.globalConcurrencyLimit * effective);
    if (_activeConcurrency >= concurrencyCap) {
      this._emit(params, 'global_concurrency', _activeConcurrency, concurrencyCap, false);
      return { allowed: false, dimension: 'global_concurrency', value: _activeConcurrency, limit: concurrencyCap };
    }

    // Dim 4: Single request cost gate
    const costCap = Math.floor(this.config.singleRequestCostCapMicros * effective);
    if (params.estimated_cost_micros > costCap) {
      this._emit(params, 'cost_gate', params.estimated_cost_micros, costCap, false);
      return { allowed: false, dimension: 'cost_gate', value: params.estimated_cost_micros, limit: costCap };
    }

    // All checks passed — commit buckets
    _sessionBuckets.set(params.session_id, {
      tokensUsed: sessionBucket.tokensUsed + params.estimated_tokens,
      windowStart: sessionBucket.windowStart,
    });
    _memberBuckets.set(params.member_id, {
      requests: memberRequests,
      windowStart: resetWindow ? now : memberBucket.windowStart,
    });

    this._emit(params, 'member_rpm', memberRequests, memberCap, true);
    return { allowed: true };
  }

  /** Call when a Furnace thread starts (increments active concurrency). */
  acquireConcurrencySlot(): void {
    _activeConcurrency++;
  }

  /** Call when a Furnace thread finishes (decrements active concurrency). */
  releaseConcurrencySlot(): void {
    _activeConcurrency = Math.max(0, _activeConcurrency - 1);
  }

  /** Dim 5: Signal anomaly — applies adaptive multiplier to all limits. */
  signalAnomaly(detected: boolean): void {
    this.anomalyDetected = detected;
  }

  /** Expose active concurrency for tests. */
  getActiveConcurrency(): number { return _activeConcurrency; }

  /** Reset all in-process buckets (test/teardown only). */
  reset(): void {
    _sessionBuckets.clear();
    _memberBuckets.clear();
    _activeConcurrency = 0;
    this.anomalyDetected = false;
  }

  private _emit(
    params: { session_id: string; member_id: string; path: string },
    dimension: LimitDimension,
    value: number,
    limit: number,
    allowed: boolean,
  ): void {
    emitPheromone('SlowBlade', `rate-event-${Date.now()}`, `slow blade rate limit ${dimension} path=${params.path}`, {
      cathedral: 'knight',
      flavorClass: { domain: 'spice', cognition: 'discipline-class', audience: 'knight-build' },
      synthesisClass: 'rate_limit_enforcement',
    });
    // Structured event for downstream audit (production: pipe to edge log / Supabase)
    const event: RateLimitEvent = {
      ts: new Date().toISOString(),
      member_id: params.member_id,
      session_id: params.session_id,
      dimension,
      value,
      limit,
      allowed,
      path: params.path,
    };
    process.stderr.write(`[slow_blade] ${JSON.stringify(event)}\n`);
  }
}
