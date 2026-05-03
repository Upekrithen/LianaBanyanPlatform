/**
 * Algorithmic Efficiency Mandate — Inference Cost Telemetry Gate
 * ==============================================================
 * Gap 10 / Bushel 18 Sub-Pod E
 *
 * Instruments inference paths with baseline-vs-actual cost-telemetry gate.
 * Blocks expansion of member-facing LLM surfaces if actual cost exceeds 8×
 * baseline (8× rule from algorithmic_efficiency_mandate canon).
 *
 * Implementation:
 *   - Track per-surface baseline cost (tokens + latency)
 *   - Compare each inference call's actual cost vs baseline
 *   - Gate (block) expansion when 8× threshold breached
 *   - Emit telemetry pheromone on breach
 *   - Provide summary dashboard for session reporting
 *
 * The 8× rule: if actual_tokens > 8 × baseline_tokens for the same operation,
 * the surface is algorithmically inefficient and expansion must halt pending review.
 *
 * Primitive slug: algorithmic_efficiency_mandate
 */

import { emitPheromone } from '../scribes/pheromone.js';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface InferenceCallRecord {
  ts: string;
  surface: string;         // e.g. "detective_phase0" | "detective_team" | "moneypenny_router"
  operation: string;       // e.g. "query_pheromone" | "consult_scribes" | "brief_me"
  actual_tokens: number;
  actual_latency_ms: number;
  baseline_tokens: number;
  baseline_latency_ms: number;
  cost_ratio: number;      // actual_tokens / baseline_tokens
  latency_ratio: number;   // actual_latency_ms / baseline_latency_ms
  gated: boolean;          // true if cost_ratio > 8×
  session_id?: string;
}

export interface CostTelemetrySummary {
  total_calls: number;
  gated_calls: number;
  breach_rate: number;          // gated_calls / total_calls
  worst_surface: string | null;
  worst_cost_ratio: number;
  by_surface: Record<string, { calls: number; gated: number; avg_cost_ratio: number }>;
}

// ─── Baseline registry ─────────────────────────────────────────────────────

export const DEFAULT_BASELINES: Record<string, { tokens: number; latency_ms: number }> = {
  'detective_phase0':     { tokens: 200,   latency_ms: 50   },
  'detective_team':       { tokens: 2000,  latency_ms: 500  },
  'moneypenny_router':    { tokens: 500,   latency_ms: 100  },
  'consult_scribes':      { tokens: 1000,  latency_ms: 200  },
  'brief_me':             { tokens: 1500,  latency_ms: 300  },
  'catechist_grade':      { tokens: 800,   latency_ms: 150  },
  'outriders_dispatch':   { tokens: 400,   latency_ms: 80   },
  'scans_sweep':          { tokens: 300,   latency_ms: 60   },
};

// ─── Telemetry gate ─────────────────────────────────────────────────────────

export class InferenceCostTelemetry {
  private records: InferenceCallRecord[] = [];
  private baselines: Record<string, { tokens: number; latency_ms: number }>;
  private readonly GATE_MULTIPLE = 8;

  constructor(baselines?: Record<string, { tokens: number; latency_ms: number }>) {
    this.baselines = baselines ?? { ...DEFAULT_BASELINES };
  }

  /**
   * Record an inference call and check it against the 8× efficiency gate.
   * Returns { gated: true } if the surface should be blocked from expansion.
   */
  record(params: {
    surface: string;
    operation: string;
    actual_tokens: number;
    actual_latency_ms: number;
    session_id?: string;
  }): InferenceCallRecord {
    const baseline = this.baselines[params.surface] ?? this.baselines[params.operation] ?? { tokens: 1000, latency_ms: 200 };

    const costRatio    = params.actual_tokens / baseline.tokens;
    const latencyRatio = params.actual_latency_ms / baseline.latency_ms;
    const gated        = costRatio > this.GATE_MULTIPLE;

    const rec: InferenceCallRecord = {
      ts: new Date().toISOString(),
      surface: params.surface,
      operation: params.operation,
      actual_tokens: params.actual_tokens,
      actual_latency_ms: params.actual_latency_ms,
      baseline_tokens: baseline.tokens,
      baseline_latency_ms: baseline.latency_ms,
      cost_ratio: costRatio,
      latency_ratio: latencyRatio,
      gated,
      session_id: params.session_id,
    };

    this.records.push(rec);

    if (gated) {
      emitPheromone('EfficiencyGate', `breach-${params.surface}-${Date.now()}`,
        `algorithmic efficiency mandate breach surface ${params.surface} cost ratio ${costRatio.toFixed(1)}x baseline`, {
        cathedral: 'knight',
        flavorClass: { domain: 'bread', cognition: 'discipline-class', audience: 'knight-build' },
        synthesisClass: 'algorithmic_efficiency_mandate',
      });
      process.stderr.write(`[efficiency_gate] BREACH: surface=${params.surface} cost_ratio=${costRatio.toFixed(1)}x (gate=${this.GATE_MULTIPLE}x)\n`);
    }

    return rec;
  }

  /**
   * Check if a surface is currently gated (any record in the current session exceeds 8×).
   */
  isSurfaceGated(surface: string): boolean {
    return this.records.some(r => r.surface === surface && r.gated);
  }

  /**
   * Register or update a baseline for a surface.
   */
  setBaseline(surface: string, tokens: number, latencyMs: number): void {
    this.baselines[surface] = { tokens, latency_ms: latencyMs };
  }

  /**
   * Generate a cost telemetry summary.
   */
  getSummary(): CostTelemetrySummary {
    const bySurface: Record<string, { calls: number; gated: number; totalRatio: number }> = {};

    for (const rec of this.records) {
      if (!bySurface[rec.surface]) {
        bySurface[rec.surface] = { calls: 0, gated: 0, totalRatio: 0 };
      }
      bySurface[rec.surface].calls++;
      bySurface[rec.surface].totalRatio += rec.cost_ratio;
      if (rec.gated) bySurface[rec.surface].gated++;
    }

    let worstSurface: string | null = null;
    let worstRatio = 0;
    for (const [s, stats] of Object.entries(bySurface)) {
      const avgRatio = stats.totalRatio / stats.calls;
      if (avgRatio > worstRatio) { worstRatio = avgRatio; worstSurface = s; }
    }

    const totalCalls  = this.records.length;
    const gatedCalls  = this.records.filter(r => r.gated).length;

    return {
      total_calls: totalCalls,
      gated_calls: gatedCalls,
      breach_rate: totalCalls > 0 ? gatedCalls / totalCalls : 0,
      worst_surface: worstSurface,
      worst_cost_ratio: worstRatio,
      by_surface: Object.fromEntries(
        Object.entries(bySurface).map(([s, st]) => [s, {
          calls: st.calls,
          gated: st.gated,
          avg_cost_ratio: st.totalRatio / st.calls,
        }])
      ),
    };
  }

  /** Clear all records (test teardown). */
  reset(): void {
    this.records = [];
  }

  /** Expose gate multiple (for test assertions). */
  getGateMultiple(): number { return this.GATE_MULTIPLE; }
}

/** Singleton for production instrumentation. */
export const costTelemetry = new InferenceCostTelemetry();
