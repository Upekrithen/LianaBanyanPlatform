/**
 * Oracle Circuit — Measurement Harness
 * Ablation matrix (H1), predictive convergence (H2), bootstrap CIs.
 * K29 (LB-STACK-0184) — Bushel 73 BP032.
 */

import type {
  DecisionTask, TaskClass, ConditionName,
  AblationRow, ClassAccuracy,
  PredictiveConvergenceResult, H1Result,
  OracleCircuitReceipt, OracleFlipEvent,
} from "./types.js";
import { oracleCompose } from "./composer.js";
import { axis4BallotAccumulator } from "./axes/ballot.js";
import { CONFIDENCE_THRESHOLD } from "./axes/ballot.js";
import { ironTabletWrite } from "../iron_tablet/iron_tablet.js";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";

export const CONDITIONS: Record<ConditionName, number[]> = {
  "A1-only":    [1],
  "A2-only":    [2],
  "A3-only":    [3],
  "A4-only":    [4],
  "Drop-A1":    [2, 3, 4],
  "Drop-A2":    [1, 3, 4],
  "Drop-A3":    [1, 2, 4],
  "Drop-A4":    [1, 2, 3],
  "Full Oracle":[1, 2, 3, 4],
};

const TASK_CLASSES: TaskClass[] = [
  "pure_reactive", "derived_criterion", "variable_arity",
  "ballot_convergent", "mixed", "adversarial",
];

const PRIMARY_AXIS_FOR_CLASS: Partial<Record<TaskClass, ConditionName>> = {
  pure_reactive: "A1-only",
  derived_criterion: "A2-only",
  variable_arity: "A3-only",
  ballot_convergent: "A4-only",
};

// Bootstrap CI (95%) via 1000 resamples
function bootstrapCI(values: (0 | 1)[], nResamples = 1000): [number, number] {
  if (values.length === 0) return [0, 0];
  const means: number[] = [];
  for (let i = 0; i < nResamples; i++) {
    let sum = 0;
    for (let j = 0; j < values.length; j++) {
      sum += values[Math.floor(Math.random() * values.length)];
    }
    means.push(sum / values.length);
  }
  means.sort((a, b) => a - b);
  return [means[Math.floor(0.025 * nResamples)], means[Math.floor(0.975 * nResamples)]];
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Run the full ablation matrix: 9 conditions × N tasks.
 * Returns accuracy table with 95% bootstrap CIs.
 */
export function runAblationMatrix(corpus: DecisionTask[], circuitId: string): AblationRow[] {
  const rows: AblationRow[] = [];

  for (const [condName, axes] of Object.entries(CONDITIONS) as [ConditionName, number[]][]) {
    const perClass: Partial<Record<TaskClass, { bits: (0|1)[]; correct: number; total: number }>> = {};
    for (const cls of TASK_CLASSES) perClass[cls] = { bits: [], correct: 0, total: 0 };

    for (const task of corpus) {
      const result = oracleCompose(task, axes, circuitId);
      const cls = task.class;
      const bucket = perClass[cls]!;
      bucket.total++;
      if (result.correct) { bucket.correct++; bucket.bits.push(1); }
      else bucket.bits.push(0);
    }

    const per_class = {} as Record<TaskClass, ClassAccuracy>;
    for (const cls of TASK_CLASSES) {
      const b = perClass[cls]!;
      const accuracy = b.total > 0 ? b.correct / b.total : 0;
      const [ci_low, ci_high] = bootstrapCI(b.bits);
      per_class[cls] = { correct: b.correct, total: b.total, accuracy, ci_low, ci_high };
    }

    rows.push({ condition: condName, axes, per_class });
  }
  return rows;
}

/**
 * Compute H1 result from ablation rows.
 */
export function computeH1(rows: AblationRow[]): H1Result {
  const byName = Object.fromEntries(rows.map(r => [r.condition, r.per_class])) as
    Record<ConditionName, Record<TaskClass, ClassAccuracy>>;

  const full = byName["Full Oracle"];
  const dropConds: ConditionName[] = ["Drop-A1", "Drop-A2", "Drop-A3", "Drop-A4"];
  const singleConds: ConditionName[] = ["A1-only", "A2-only", "A3-only", "A4-only"];

  // H1a: mixed class — full vs best three-of-four
  const mixedFull = full.mixed?.accuracy ?? 0;
  const mixedBest3of4 = Math.max(...dropConds.map(c => byName[c].mixed?.accuracy ?? 0));
  const deltaPP = (mixedFull - mixedBest3of4) * 100;
  const h1aPass = deltaPP >= 15.0;

  // H1a adversarial
  const advFull = full.adversarial?.accuracy ?? 0;
  const advBest3of4 = Math.max(...dropConds.map(c => byName[c].adversarial?.accuracy ?? 0));
  const advDeltaPP = (advFull - advBest3of4) * 100;

  // H1b: graceful tradeoff — full vs specialized single-axis on pure-class tasks
  let passes = 0;
  let total = 0;
  for (const [cls, primaryCond] of Object.entries(PRIMARY_AXIS_FOR_CLASS) as [TaskClass, ConditionName][]) {
    const fullAcc = full[cls]?.accuracy ?? 0;
    const primaryAcc = byName[primaryCond][cls]?.accuracy ?? 0;
    const delta = (fullAcc - primaryAcc) * 100;
    if (delta >= -2.0) passes++;
    total++;
  }
  const h1bPass = passes === total;
  const h1aPassOvr = h1aPass;
  return {
    mixed_full: mixedFull,
    mixed_best_three_of_four: mixedBest3of4,
    delta_pp: deltaPP,
    adversarial_full: advFull,
    adversarial_delta_pp: advDeltaPP,
    graceful_tradeoff_passes: passes,
    graceful_tradeoff_total: total,
    h1a_pass: h1aPassOvr,
    h1b_pass: h1bPass,
    overall_pass: h1aPassOvr && h1bPass,
  };
}

/**
 * Measure H2: predictive convergence on ballot-convergent tasks.
 * For each task: at what fraction of ballots does prediction stabilize
 * at correct outcome with confidence ≥ 0.85?
 */
export function measurePredictiveConvergence(corpus: DecisionTask[]): PredictiveConvergenceResult {
  const ballotTasks = corpus.filter(t => t.class === "ballot_convergent");
  const fractionsToStabilize: number[] = [];
  const correctAt70: number[] = [];

  for (const task of ballotTasks) {
    const gtOutcome = (task.ground_truth[4] as [string, null])[0];
    const nBallots = task.ballots?.length ?? 0;
    let stabilizedFrac: number | null = null;

    for (let k = 1; k <= nBallots; k++) {
      const frac = k / nBallots;
      const result = axis4BallotAccumulator(task, frac);
      if (result?.kind === "ballot" && result.outcome === gtOutcome && result.confidence >= CONFIDENCE_THRESHOLD) {
        stabilizedFrac = frac;
        break;
      }
    }
    if (stabilizedFrac !== null) fractionsToStabilize.push(stabilizedFrac);

    const result70 = axis4BallotAccumulator(task, 0.7);
    correctAt70.push(result70?.kind === "ballot" && result70.outcome === gtOutcome ? 1 : 0);
  }

  const medStab = median(fractionsToStabilize);
  const meanStab = mean(fractionsToStabilize);
  const accAt70 = correctAt70.length > 0
    ? correctAt70.reduce((a, b) => a + b, 0) / correctAt70.length
    : 0;

  const h2Pass = medStab !== null && medStab <= 0.70 && accAt70 >= 0.85;

  return {
    tasks_evaluated: ballotTasks.length,
    tasks_stabilized: fractionsToStabilize.length,
    fractions_to_stabilize: fractionsToStabilize,
    median_stabilization_fraction: medStab,
    mean_stabilization_fraction: meanStab,
    accuracy_at_70pct: accAt70,
    h2_pass: h2Pass,
  };
}

const RECEIPT_DIR = resolve(homedir(), ".lb-session", "oracle_circuit");

/**
 * Write an Iron Tablet receipt for an ablation run.
 */
export async function writeIronTabletReceipt(
  label: string,
  data: Record<string, unknown>,
  session: string,
): Promise<string> {
  mkdirSync(RECEIPT_DIR, { recursive: true });
  const ebletPath = resolve(RECEIPT_DIR, `${label.replace(/\s+/g, "_")}.eblet.md`);
  const content = `# Oracle Circuit ${label} Receipt\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
  try {
    await ironTabletWrite({
      scribeId: "oracle_circuit",
      ebletPath,
      content,
      provenance: { session, decisionId: `oracle_circuit_${label}` },
    });
  } catch {
    // Fallback: write plain file
    writeFileSync(ebletPath, content, "utf-8");
  }
  return ebletPath;
}

/**
 * Serialize ablation rows into the receipt matrix format.
 */
export function serializeAblationMatrix(
  rows: AblationRow[],
): Record<ConditionName, Record<TaskClass, [number, number, number]>> {
  const out = {} as Record<ConditionName, Record<TaskClass, [number, number, number]>>;
  for (const row of rows) {
    out[row.condition] = {} as Record<TaskClass, [number, number, number]>;
    for (const [cls, acc] of Object.entries(row.per_class) as [TaskClass, ClassAccuracy][]) {
      out[row.condition][cls] = [acc.accuracy, acc.ci_low, acc.ci_high];
    }
  }
  return out;
}
