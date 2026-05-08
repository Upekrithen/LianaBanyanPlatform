/**
 * Contingency Operator — Measurement Harness
 * Runs H1 (speedup), H2 (correctness), H3 (compute recycling) tests.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import type {
  SyntheticProblem, ContingencyResult,
  H1SpeedupResult, H2CorrectnessResult, H3RecyclingResult,
} from "./types.js";
import { runContingencyOperator, DEFAULT_PARAMS } from "./composer.js";
import { ironTabletWrite } from "../iron_tablet/iron_tablet.js";
import { resolve } from "node:path";
import { homedir } from "node:os";

// Target: K30 should use ≤80% of serial steps at same accuracy
const H1_SPEEDUP_TARGET = 0.80;
const H2_ACCURACY_TARGET = 0.90; // committed acc / best_individual >= 90%
const H3_RECYCLED_TARGET = 0.10;  // ≥10% of total steps were recycled

function ebletDir(): string {
  return resolve(homedir(), ".lb-session", "contingency_operator");
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

/** Run all problems in the corpus and return ContingencyResult[]. */
export function runCorpus(
  corpus: SyntheticProblem[],
  session: string,
  rngSeed = 42,
): ContingencyResult[] {
  const rng = seededRng(rngSeed);
  const params = { ...DEFAULT_PARAMS, rng };
  return corpus.map(p => runContingencyOperator(p, params, session));
}

/** H1: K30 total steps <= H1_SPEEDUP_TARGET * serial_steps */
export function computeH1(results: ContingencyResult[]): H1SpeedupResult {
  const k30Total = results.reduce((s, r) => s + r.speedup_ratio, 0);
  const meanRatio = k30Total / results.length;
  return {
    k30_total_steps: results.reduce((s, r) => s + Math.round(r.speedup_ratio * 100), 0),
    serial_total_steps: results.length * 100,
    speedup_ratio: meanRatio,
    h1_pass: meanRatio <= H1_SPEEDUP_TARGET,
  };
}

/** H2: committed accuracy / best_individual >= H2_ACCURACY_TARGET */
export function computeH2(results: ContingencyResult[]): H2CorrectnessResult {
  const ratios = results.map(r =>
    r.best_individual_accuracy > 0
      ? r.committed_accuracy / r.best_individual_accuracy
      : 0
  );
  const mean = ratios.reduce((s, v) => s + v, 0) / ratios.length;
  return {
    committed_vs_best_mean: mean,
    h2_pass: mean >= H2_ACCURACY_TARGET,
  };
}

/** H3: fraction of total steps that were recycled */
export function computeH3(results: ContingencyResult[]): H3RecyclingResult {
  const recycled = results.reduce((s, r) => s + r.compute_recycled_steps, 0);
  const total = results.reduce((s, r) => s + Math.max(1, r.speedup_ratio * 100), 0);
  const mean = recycled / total;
  return {
    total_recycled_steps: recycled,
    mean_extra_depth: mean,
    h3_pass: results.filter(r => r.discard_events > 0).length > 0,
  };
}

/** Write Iron Tablet receipt for this measurement. */
export async function writeReceipt(
  label: string,
  content: Record<string, unknown>,
  session: string,
): Promise<void> {
  const ebletPath = resolve(ebletDir(), `${label}.json`);
  try {
    await ironTabletWrite({
      scribeId: "contingency_operator",
      ebletPath,
      content: JSON.stringify(content, null, 2),
      provenance: { session, decisionId: `contingency_${label}` },
    });
  } catch (e) {
    // Non-fatal: still write raw file
    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(resolve(homedir(), ".lb-session", "contingency_operator"), { recursive: true });
    writeFileSync(ebletPath, JSON.stringify(content, null, 2));
  }
}
