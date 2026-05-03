/**
 * Conductor Internal Continuous Benchmarking
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Every Nth internal task fires in parallel across 2-3 vendors. Results feed
 * internal_rankings.ts via injectRankingEntry() — keeping the ranking table
 * self-correcting over time.
 *
 * Founder Fire Code preserved:
 *   - Benchmarking is OBSERVATION, not publication.
 *   - Results inform internal_rankings; they are never surfaced to members
 *     without explicit Founder fire decision.
 *   - Parallel sampling adds latency to the Nth task (benchmark task). The
 *     caller's primary response is NOT held up — benchmarking is fire-and-forget.
 *
 * Architecture:
 *   - `maybeBenchmark(request, primaryResult)` is called by the dispatch layer
 *     after every successful internal task execution.
 *   - Every N calls (configurable, default 20), it fires parallel vendor probes
 *     on the same task, compares HOT% (binary: primary result quality ≥ threshold),
 *     and injects updated ranking entries.
 *   - Results append to ~/.claude/state/bushel_x_conductor_internal/bench_log.jsonl
 *     if CONDUCTOR_INTERNAL_BENCH_DIR is set.
 *
 * Grade criterion for binary HOT (consistent with R13 methodology):
 *   An internal task response is "HOT" if the grading function returns true.
 *   Default: response length ≥ MIN_HOT_RESPONSE_CHARS (proxy for substantive output).
 *   TODO: Replace with Bishop-class canon-discipline grading when available.
 */

import type { InternalTaskRequest, InternalTaskResult } from "./internal_adapters/types.js";
import { dispatchInternalTask } from "./internal_adapters/index.js";
import { injectRankingEntry } from "./internal_rankings.js";
import type { VendorName } from "./adapters/types.js";
import type { InternalCostPriority, InternalModelVendorPair } from "./internal_rankings.js";

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

/** Run a benchmark probe on every Nth task execution. */
const BENCHMARK_EVERY_N = 20;

/** Minimum response character count to score a response as HOT. */
const MIN_HOT_RESPONSE_CHARS = 80;

/** Vendors to probe in parallel during a benchmark run. */
const BENCHMARK_PROBE_VENDORS: Array<{ vendor: VendorName; model: string }> = [
  { vendor: "anthropic", model: "claude-sonnet-4-6" },
  { vendor: "anthropic", model: "claude-haiku-4-5"  },
  { vendor: "openai",    model: "gpt-5-4-mini"      },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** Per-process call counter — resets on restart (acceptable for benchmarking). */
const _callCounts: Partial<Record<string, number>> = {};

function _taskKey(request: InternalTaskRequest): string {
  return `${request.role}/${request.taskClass}`;
}

// ---------------------------------------------------------------------------
// HOT grading
// ---------------------------------------------------------------------------

/**
 * Grade a response as HOT (binary pass/fail).
 * Current implementation: length proxy.
 * TODO: replace with Bishop canon-discipline grading (semantic accuracy check).
 */
function _isHot(response: string): boolean {
  return response.trim().length >= MIN_HOT_RESPONSE_CHARS;
}

// ---------------------------------------------------------------------------
// Benchmark probe
// ---------------------------------------------------------------------------

async function _runBenchmarkProbe(
  request: InternalTaskRequest,
  primaryResult: InternalTaskResult,
): Promise<void> {
  const probeResults: Array<{
    vendor: VendorName;
    model: string;
    hot: boolean;
    latencyMs: number;
    error: string | null;
  }> = [];

  // Fire probes in parallel (fire-and-forget from the caller's perspective)
  const probePromises = BENCHMARK_PROBE_VENDORS.map(async ({ vendor, model }) => {
    // Skip if this IS the primary vendor/model (already measured)
    if (vendor === primaryResult.vendor && model === primaryResult.model) return;

    const probeRequest: InternalTaskRequest = {
      ...request,
      vendor,
      model,
      mode: "auto", // probes always run in auto context
    };

    const start = Date.now();
    try {
      const result = await dispatchInternalTask(probeRequest);
      probeResults.push({
        vendor,
        model,
        hot: _isHot(result.response),
        latencyMs: Date.now() - start,
        error: null,
      });
    } catch (err) {
      probeResults.push({
        vendor,
        model,
        hot: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  await Promise.allSettled(probePromises);

  // Inject updated ranking entries based on probe results
  for (const probe of probeResults) {
    if (probe.error) continue; // Skip failed probes

    const existingEntry: InternalModelVendorPair = {
      vendor: probe.vendor,
      model: probe.model,
      hotPercent: probe.hot ? 100 : 0, // Binary — will be averaged on next probe run
      costPerTask: null,
      tier: probe.model.includes("haiku") || probe.model.includes("mini") ? "cheap" : "mid",
      source: "recurring-diagnostic",
      rankingAgeDays: 0,
      costPriorities: ["quality", "balanced", "economy"] as InternalCostPriority[],
    };

    injectRankingEntry(request.taskClass, existingEntry);
  }

  // Append bench_log entry (non-fatal, Node.js only)
  void _appendBenchLog({
    ts: new Date().toISOString(),
    task_class: request.taskClass,
    agent_role: request.role,
    primary_vendor: primaryResult.vendor,
    primary_model: primaryResult.model,
    primary_hot: _isHot(primaryResult.response),
    probes: probeResults,
  });
}

async function _appendBenchLog(record: unknown): Promise<void> {
  try {
    if (typeof process === "undefined" || !process.versions?.node) return;

    const benchDir = process.env.CONDUCTOR_INTERNAL_BENCH_DIR;
    if (!benchDir) return;

    const { appendFileSync, mkdirSync, existsSync } = await import("node:fs");
    const { resolve } = await import("node:path");

    const logPath = resolve(benchDir, "bench_log.jsonl");
    if (!existsSync(benchDir)) mkdirSync(benchDir, { recursive: true });
    appendFileSync(logPath, JSON.stringify(record) + "\n", "utf-8");
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call after every successful internal task execution.
 * On the Nth call for a task key, fires parallel vendor probes in the background.
 * Returns immediately — benchmarking does not block the primary response.
 */
export function maybeBenchmark(
  request: InternalTaskRequest,
  primaryResult: InternalTaskResult,
): void {
  const key = _taskKey(request);
  _callCounts[key] = (_callCounts[key] ?? 0) + 1;

  if (_callCounts[key] % BENCHMARK_EVERY_N === 0) {
    // Fire-and-forget: does not await
    void _runBenchmarkProbe(request, primaryResult);
    _callCounts[key] = 0; // Reset counter after benchmark fires
  }
}

/** Return current call counts per task key (for dashboard). */
export function getBenchmarkCallCounts(): Record<string, number> {
  return { ..._callCounts } as Record<string, number>;
}

/** Test-only: reset benchmark counters. */
export function _resetBenchmarkForTests(): void {
  for (const key of Object.keys(_callCounts)) {
    delete _callCounts[key];
  }
}
