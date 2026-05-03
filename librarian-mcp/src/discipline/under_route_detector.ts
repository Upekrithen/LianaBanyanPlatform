/**
 * Under-Route Detection — Gap 7 / Bushel 18 Sub-Pod D
 * =====================================================
 * Implements detection logic per under_route_detection_canon_bp021.
 * Sentinel-Tasks-PRIMARY strategy: closes AAR closed-loop.
 *
 * Under-routing: an agent dispatches a Detective query but uses a
 * LOWER-capability path (Phase 0 pheromone only) when a HIGHER-capability
 * path (Phase 1 RPC → Scribes) was warranted by the query complexity.
 *
 * Detection heuristics (Sentinel-Tasks-PRIMARY):
 *   H1: Phase 0 returned fewer than MIN_HITS hits for a HIGH_COMPLEXITY query
 *   H2: Query topics count > TOPIC_COMPLEXITY_THRESHOLD but only Phase 0 used
 *   H3: Caller explicitly requested RPC fallback but fallback was NOT triggered
 *   H4: Consecutive under-route events on same scribe → escalate to KnightReport
 *
 * Primitive slug: under_route_detection
 */

import { emitPheromone } from '../scribes/pheromone.js';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DetectorQueryContext {
  query: string;
  topic_count: number;          // number of extracted topics
  hits_returned: number;        // Detective result hit count
  phase_0_used: boolean;
  fallback_to_rpc: boolean;
  caller_requested_rpc?: boolean;
  scribe_target?: string;
  session_id?: string;
}

export type UnderRouteHeuristic = 'H1_insufficient_hits' | 'H2_complexity_not_escalated' | 'H3_rpc_suppressed' | 'H4_consecutive_escalation';

export interface UnderRouteEvent {
  ts: string;
  query: string;
  heuristic: UnderRouteHeuristic;
  session_id?: string;
  scribe_target?: string;
  detail: string;
}

// ─── Configuration ─────────────────────────────────────────────────────────

export interface UnderRouteDetectorConfig {
  minHitsForHighComplexity: number;   // default 3
  topicComplexityThreshold: number;   // default 5
  consecutiveThreshold: number;       // default 3
}

const DEFAULT_DETECTOR_CONFIG: UnderRouteDetectorConfig = {
  minHitsForHighComplexity: 3,
  topicComplexityThreshold: 5,
  consecutiveThreshold: 3,
};

// ─── Detector ──────────────────────────────────────────────────────────────

export class UnderRouteDetector {
  private config: UnderRouteDetectorConfig;
  private consecutiveCount: Map<string, number> = new Map();
  private events: UnderRouteEvent[] = [];

  constructor(config: Partial<UnderRouteDetectorConfig> = {}) {
    this.config = { ...DEFAULT_DETECTOR_CONFIG, ...config };
  }

  /**
   * Inspect a Detective query result context and detect under-routing.
   * Returns all triggered heuristics (empty = no under-routing detected).
   */
  detect(ctx: DetectorQueryContext): UnderRouteHeuristic[] {
    const triggered: UnderRouteHeuristic[] = [];

    // H1: Phase 0 returned too few hits for a high-complexity query
    const isHighComplexity = ctx.topic_count >= this.config.topicComplexityThreshold;
    if (isHighComplexity && ctx.phase_0_used && !ctx.fallback_to_rpc &&
        ctx.hits_returned < this.config.minHitsForHighComplexity) {
      triggered.push('H1_insufficient_hits');
      this._record(ctx, 'H1_insufficient_hits',
        `High-complexity query (topics=${ctx.topic_count}) returned only ${ctx.hits_returned} hits via Phase 0; RPC not triggered`);
    }

    // H2: High topic count but only Phase 0 used (no escalation)
    if (ctx.topic_count >= this.config.topicComplexityThreshold && ctx.phase_0_used && !ctx.fallback_to_rpc) {
      triggered.push('H2_complexity_not_escalated');
      this._record(ctx, 'H2_complexity_not_escalated',
        `Query with ${ctx.topic_count} topics used Phase 0 only (escalation threshold=${this.config.topicComplexityThreshold})`);
    }

    // H3: Caller requested RPC but fallback was suppressed
    if (ctx.caller_requested_rpc && !ctx.fallback_to_rpc) {
      triggered.push('H3_rpc_suppressed');
      this._record(ctx, 'H3_rpc_suppressed',
        `Caller requested RPC fallback but fallback_to_rpc=false`);
    }

    // H4: Consecutive events on same scribe → escalate
    if (triggered.length > 0 && ctx.scribe_target) {
      const key = ctx.scribe_target;
      const count = (this.consecutiveCount.get(key) ?? 0) + 1;
      this.consecutiveCount.set(key, count);
      if (count >= this.config.consecutiveThreshold) {
        triggered.push('H4_consecutive_escalation');
        this._record(ctx, 'H4_consecutive_escalation',
          `${count} consecutive under-route events on scribe=${key}; escalation triggered`);
        // Emit pheromone for KnightReport visibility
        emitPheromone('UnderRouteDetector', `escalation-${key}-${Date.now()}`,
          `under-route escalation scribe ${key} consecutive ${count}`, {
          flavorClass: { cognition: 'discipline-class', audience: 'knight-build' },
          synthesisClass: 'under_route_detection',
        });
      }
    } else if (triggered.length === 0 && ctx.scribe_target) {
      this.consecutiveCount.set(ctx.scribe_target, 0);
    }

    return triggered;
  }

  /** Return all recorded under-route events. */
  getEvents(): Readonly<UnderRouteEvent[]> {
    return [...this.events];
  }

  /** Clear state (test teardown). */
  reset(): void {
    this.consecutiveCount.clear();
    this.events = [];
  }

  private _record(ctx: DetectorQueryContext, heuristic: UnderRouteHeuristic, detail: string): void {
    this.events.push({
      ts: new Date().toISOString(),
      query: ctx.query,
      heuristic,
      session_id: ctx.session_id,
      scribe_target: ctx.scribe_target,
      detail,
    });
  }
}

/** Singleton for production use. */
export const underRouteDetector = new UnderRouteDetector();
