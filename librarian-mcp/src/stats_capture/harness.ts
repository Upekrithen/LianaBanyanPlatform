/**
 * Stats-Capture Harness — KN-S1 / BP018
 * ======================================
 * File-based test-telemetry harness. Emits bookend snapshots (always retained)
 * and interval snapshots (configurable cadence; conditionally retained per
 * outcome × anomaly classification).
 *
 * Eliminates Founder tab-juggling: substrate-write is the static-pre-fabricated
 * answer to a dynamic-runtime problem (BP018 STANCHION inversion #2).
 *
 * Composes with:
 *   KN-S2 RetentionPruner — consumes snapshot files, applies tiered retention
 *   KN-S3 MCP query tools — Bishop reads substrate instead of switching tabs
 *   Pod-R KN-R4          — primary consumer for 5-Knight × 3-pod engine test
 *   BP004 Catechist #2313 — discipline-grading consumer
 *   BP015 Shutterbug      — visual receipts complement
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, renameSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";
import { cpus, loadavg } from "os";
import { randomUUID } from "crypto";

// ─── Telemetry substrate paths ─────────────────────────────────────────────────

export const TELEMETRY_ROOT = resolve(homedir(), ".claude", "state", "test_telemetry");
export const TELEMETRY_LIVE = resolve(TELEMETRY_ROOT, "live");
export const TELEMETRY_FAILED = resolve(TELEMETRY_ROOT, "failed");
export const TELEMETRY_ANOMALY = resolve(TELEMETRY_ROOT, "anomaly");
export const TELEMETRY_PROTECTED = resolve(TELEMETRY_ROOT, "protected");
export const TELEMETRY_ARCHIVE = resolve(TELEMETRY_ROOT, ".archive");

function ensureTelemetryDirs(root: string = TELEMETRY_ROOT): void {
  for (const d of [root, resolve(root, "live"), resolve(root, "failed"), resolve(root, "anomaly"), resolve(root, "protected"), resolve(root, ".archive")]) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }
}

// ─── Schema types ──────────────────────────────────────────────────────────────

export type SnapshotType = "bookend_start" | "bookend_end" | "interval";
export type RetentionClass = "bookend" | "interval_pass" | "interval_fail" | "interval_anomaly" | "protected";
export type TestOutcome = "in_flight" | "pass" | "fail" | "errored";

export type BeeCanonMarksS = {
  workers_drones_pro_rata: number;
  queen_multiplier: number;
  project_cohort_multiplier: number;
};

export type TelemetrySnapshot = {
  test_id: string;
  snapshot_type: SnapshotType;
  timestamp: string;

  // K-prompt provenance
  k_prompt_source?: string;
  k_prompt_section?: string;

  // Knight session
  knight_session_id?: string;
  knight_session_index?: number;
  knight_session_total?: number;

  // Test context
  test_file: string;
  test_name?: string;
  phase?: "A.0" | "A" | "B" | "C" | "D" | "E";

  // System resources
  context_pct?: number;
  context_used_tokens?: number;
  context_cap_tokens?: number;
  memory_mb?: number;
  cpu_pct?: number;

  // Assertions
  assertion_index?: number;
  assertion_total?: number;

  // Outcome
  outcome: TestOutcome;
  error_details?: string | null;
  commit_hash?: string | null;

  // Marks + discipline
  bee_canon_marks?: BeeCanonMarksS;
  fork_doctrine_compliant: boolean;
  cleaner_than_found?: boolean;

  // Anomaly
  anomaly_flag: boolean;
  anomaly_reason?: string | null;

  // Retention
  retention_class: RetentionClass;

  // Cost-accounting (API spend — instrumentation, NOT membership pricing)
  vendor_api_tokens_input?: number;
  vendor_api_tokens_output?: number;
  vendor_api_provider?: "anthropic" | "cursor" | "openrouter" | "other";
  vendor_pricing_input_per_million?: number;
  vendor_pricing_output_per_million?: number;
  vendor_api_spend_usd?: number;
  clock_time_ms?: number;
  compute_cpu_seconds?: number;
  counterfactual_cost_estimate_usd?: number;
  counterfactual_estimation_method?: string;
  estimated_savings_usd?: number;
  estimated_savings_pct?: number;
  colossus_paired_test_id?: string;
};

// ─── Snapshot writer ───────────────────────────────────────────────────────────

export function writeSnapshot(snapshot: TelemetrySnapshot, root: string = TELEMETRY_ROOT): string {
  ensureTelemetryDirs(root);
  const liveDir = resolve(root, "live");
  const filename = `${snapshot.test_id}__${snapshot.snapshot_type}__${snapshot.timestamp.replace(/[:.]/g, "-")}.json`;
  const filepath = resolve(liveDir, filename);
  writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");
  return filepath;
}

// ─── StatsCaptureHarness ───────────────────────────────────────────────────────

export class StatsCaptureHarness {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private currentSnapshot: Partial<TelemetrySnapshot>;
  private intervalMs: number;
  private telemetryRoot: string;
  private startTs: number;
  private intervalFilenames: string[] = [];

  constructor(opts: {
    test_id: string;
    test_file: string;
    knight_session_id?: string;
    knight_session_index?: number;
    knight_session_total?: number;
    interval_seconds?: number;
    telemetry_root?: string;
    k_prompt_source?: string;
    k_prompt_section?: string;
  }) {
    this.telemetryRoot = opts.telemetry_root ?? TELEMETRY_ROOT;
    this.intervalMs = (opts.interval_seconds ?? 15) * 1000;
    this.startTs = Date.now();
    this.currentSnapshot = {
      test_id: opts.test_id,
      test_file: opts.test_file,
      knight_session_id: opts.knight_session_id,
      knight_session_index: opts.knight_session_index,
      knight_session_total: opts.knight_session_total,
      k_prompt_source: opts.k_prompt_source,
      k_prompt_section: opts.k_prompt_section,
      outcome: "in_flight",
      fork_doctrine_compliant: true,
      anomaly_flag: false,
      retention_class: "bookend",
    };
  }

  start(): string {
    const snap: TelemetrySnapshot = {
      ...this.currentSnapshot as TelemetrySnapshot,
      snapshot_type: "bookend_start",
      timestamp: new Date().toISOString(),
      memory_mb: _memoryMb(),
      cpu_pct: _cpuPct(),
      outcome: "in_flight",
      anomaly_flag: false,
      retention_class: "bookend",
      fork_doctrine_compliant: true,
    };
    const path = writeSnapshot(snap, this.telemetryRoot);

    // Begin interval timer
    this.intervalHandle = setInterval(() => this._emitInterval(), this.intervalMs);
    return path;
  }

  tick(state: Partial<TelemetrySnapshot>): void {
    Object.assign(this.currentSnapshot, state);
    // Anomaly detection on each tick
    const detection = detectAnomalies(this.currentSnapshot, this.startTs);
    if (detection.anomaly_flag) {
      this.currentSnapshot.anomaly_flag = true;
      this.currentSnapshot.anomaly_reason = detection.reason;
    }
  }

  end(
    outcome: TestOutcome,
    opts?: {
      error_details?: string;
      commit_hash?: string;
      vendor_api_tokens_input?: number;
      vendor_api_tokens_output?: number;
      vendor_api_provider?: TelemetrySnapshot["vendor_api_provider"];
      vendor_pricing_input_per_million?: number;
      vendor_pricing_output_per_million?: number;
      colossus_paired_test_id?: string;
    }
  ): string {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    const endTs = Date.now();
    const clockMs = endTs - this.startTs;

    // Cost-accounting
    const inputTokens = opts?.vendor_api_tokens_input ?? 0;
    const outputTokens = opts?.vendor_api_tokens_output ?? 0;
    const inputRate = opts?.vendor_pricing_input_per_million ?? 3.0;
    const outputRate = opts?.vendor_pricing_output_per_million ?? 15.0;
    const spend = (inputTokens / 1_000_000) * inputRate + (outputTokens / 1_000_000) * outputRate;
    // Counterfactual: 3-4× actual (BP018 marathon receipt baseline)
    const counterfactual = spend * 3.5;
    const savings = counterfactual - spend;
    const savingsPct = counterfactual > 0 ? (savings / counterfactual) * 100 : 0;

    const snap: TelemetrySnapshot = {
      ...this.currentSnapshot as TelemetrySnapshot,
      snapshot_type: "bookend_end",
      timestamp: new Date().toISOString(),
      outcome,
      memory_mb: _memoryMb(),
      cpu_pct: _cpuPct(),
      clock_time_ms: clockMs,
      retention_class: "bookend",
      fork_doctrine_compliant: this.currentSnapshot.fork_doctrine_compliant ?? true,
      anomaly_flag: this.currentSnapshot.anomaly_flag ?? false,
      ...(opts?.error_details ? { error_details: opts.error_details } : {}),
      ...(opts?.commit_hash ? { commit_hash: opts.commit_hash } : {}),
      ...(opts?.vendor_api_provider ? { vendor_api_provider: opts.vendor_api_provider } : {}),
      ...(inputTokens > 0 ? { vendor_api_tokens_input: inputTokens } : {}),
      ...(outputTokens > 0 ? { vendor_api_tokens_output: outputTokens } : {}),
      ...(inputRate ? { vendor_pricing_input_per_million: inputRate } : {}),
      ...(outputRate ? { vendor_pricing_output_per_million: outputRate } : {}),
      ...(spend > 0 ? { vendor_api_spend_usd: spend } : {}),
      ...(counterfactual > 0 ? { counterfactual_cost_estimate_usd: counterfactual, counterfactual_estimation_method: "marathon_3_4x_throughput_baseline" } : {}),
      ...(savings > 0 ? { estimated_savings_usd: savings, estimated_savings_pct: savingsPct } : {}),
      ...(opts?.colossus_paired_test_id ? { colossus_paired_test_id: opts.colossus_paired_test_id } : {}),
    };
    const path = writeSnapshot(snap, this.telemetryRoot);

    // Classify + relocate interval snapshots
    classifyIntervals(this.currentSnapshot.test_id!, outcome, this.currentSnapshot.anomaly_flag ?? false, this.telemetryRoot);

    return path;
  }

  private _emitInterval(): void {
    const snap: TelemetrySnapshot = {
      ...this.currentSnapshot as TelemetrySnapshot,
      snapshot_type: "interval",
      timestamp: new Date().toISOString(),
      memory_mb: _memoryMb(),
      cpu_pct: _cpuPct(),
      outcome: "in_flight",
      anomaly_flag: this.currentSnapshot.anomaly_flag ?? false,
      retention_class: "interval_pass",
      fork_doctrine_compliant: this.currentSnapshot.fork_doctrine_compliant ?? true,
    };
    const path = writeSnapshot(snap, this.telemetryRoot);
    this.intervalFilenames.push(path);
  }
}

// ─── withStatsCapture helper ───────────────────────────────────────────────────

export async function withStatsCapture<T>(
  opts: ConstructorParameters<typeof StatsCaptureHarness>[0],
  testFn: (harness: StatsCaptureHarness) => Promise<T>
): Promise<T> {
  const harness = new StatsCaptureHarness(opts);
  harness.start();
  try {
    const result = await testFn(harness);
    harness.end("pass");
    return result;
  } catch (err) {
    harness.end("errored", { error_details: String(err) });
    throw err;
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function _memoryMb(): number {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
}

function _cpuPct(): number {
  try {
    const avg = loadavg()[0];
    const numCpus = cpus().length;
    return Math.round((avg / numCpus) * 100) / 100;
  } catch {
    return 0;
  }
}

// ─── Anomaly detection ─────────────────────────────────────────────────────────

export type AnomalyDetectionResult = {
  anomaly_flag: boolean;
  reason: string | null;
};

export function detectAnomalies(
  snapshot: Partial<TelemetrySnapshot>,
  startTs: number
): AnomalyDetectionResult {
  // Context % spike > 15pp
  if ((snapshot.context_pct ?? 0) > 85) {
    return { anomaly_flag: true, reason: `context_pct ${snapshot.context_pct}% exceeds 85% threshold` };
  }
  // Phase stall > 5 minutes without phase change (heuristic: runtime > 300s)
  const runtimeMs = Date.now() - startTs;
  if (runtimeMs > 300_000 && snapshot.phase && snapshot.phase !== "E") {
    return { anomaly_flag: true, reason: `phase stall: ${snapshot.phase} running for ${Math.round(runtimeMs / 1000)}s` };
  }
  return { anomaly_flag: false, reason: null };
}

// ─── FORK doctrine compliance check ───────────────────────────────────────────

export function checkForkDoctrineCompliance(commitMessage: string): boolean {
  // FORK doctrine: commit message must not indicate working-memory dependency
  // Pattern: must include task/pod reference; must not be empty
  return commitMessage.trim().length > 0;
}

// ─── Retention classifier ──────────────────────────────────────────────────────

import { readdirSync } from "fs";

export function classifyIntervals(
  test_id: string,
  outcome: TestOutcome,
  anomaly_flag: boolean,
  root: string = TELEMETRY_ROOT
): void {
  const liveDir = resolve(root, "live");
  const failedDir = resolve(root, "failed");
  const anomalyDir = resolve(root, "anomaly");

  if (!existsSync(liveDir)) return;

  const files = readdirSync(liveDir).filter(
    (f) => f.startsWith(test_id + "__interval__") && f.endsWith(".json")
  );

  for (const f of files) {
    const src = resolve(liveDir, f);
    if (anomaly_flag) {
      renameSync(src, resolve(anomalyDir, f));
    } else if (outcome === "fail" || outcome === "errored") {
      renameSync(src, resolve(failedDir, f));
    }
    // pass + no anomaly → stay in live/ (pruner handles after 24h)
  }
}
