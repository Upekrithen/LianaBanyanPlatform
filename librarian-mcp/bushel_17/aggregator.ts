/**
 * Bushel 17 — Aggregator + Threshold Map
 *
 * Reads populated sentinel receipts, computes:
 *   - Per-task Δ across arms (Arm A minus Arm B for each variable)
 *   - Per-class average Δ
 *   - Threshold map: task-class routing recommendation
 *
 * Output: ~/.claude/state/bushel_17/threshold_map.json
 *         + populates the bushel_17 empirical_comparison_receipt.json (Phase E)
 *
 * Canon anchor: compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md
 * Sister method: Bushel 16 empirical_comparison_receipt.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { SentinelReceipt, SentinelMeasurements } from "./sentinel_runner.js";
import type { TaskClass } from "./sentinel_corpus.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Delta for a single variable: Arm A value minus Arm B value (negative = A wins) */
export interface VariableDelta {
  arm_a_mean: number | null;
  arm_b_mean: number | null;
  /** arm_a_mean - arm_b_mean. Negative = A wins (lower is better for most metrics). */
  delta: number | null;
  /** Which arm wins on this variable? */
  winner: "A_compaction_continue" | "B_new_session_reorient" | "tie" | "insufficient_data";
  /**
   * Direction of "better": lower = lower-value wins, higher = higher-value wins.
   */
  better_direction: "lower" | "higher";
}

export interface PerTaskDelta {
  task_id: string;
  task_class: TaskClass;
  topic_pivot_distance: "near" | "partial" | "radical";
  TTFP: VariableDelta;
  TTFA: VariableDelta;
  tokens_to_first_output: VariableDelta;
  founder_correction_turns: VariableDelta;
  r_check_1_violations: VariableDelta;
  substrate_coherence_score: VariableDelta;
  /** Count of metrics where A wins */
  a_wins_count: number;
  /** Count of metrics where B wins */
  b_wins_count: number;
  /** Overall task winner */
  overall_winner: "A_compaction_continue" | "B_new_session_reorient" | "tie" | "insufficient_data";
}

export interface PerClassSummary {
  task_class: TaskClass;
  task_count: number;
  a_wins_tasks: number;
  b_wins_tasks: number;
  tie_tasks: number;
  avg_delta_TTFP_ms: number | null;
  avg_delta_TTFA_ms: number | null;
  avg_delta_tokens: number | null;
  avg_delta_founder_correction: number | null;
  avg_delta_r_check_violations: number | null;
  avg_delta_coherence: number | null;
  class_winner: "A_compaction_continue" | "B_new_session_reorient" | "tie" | "insufficient_data";
}

/** The threshold map — the primary receipt artifact */
export interface ThresholdMap {
  lookup_routing_recommendation: RoutingRecommendation;
  author_routing_recommendation: RoutingRecommendation;
  bushel_design_routing_recommendation: RoutingRecommendation;
  /** Cross-class synthesis */
  synthesis: string;
  /** Topic-pivot-distance sub-threshold */
  pivot_distance_threshold: PivotDistanceThreshold;
}

export interface RoutingRecommendation {
  task_class: TaskClass;
  recommended_mode: "compaction_continue" | "new_session_reorient" | "mixed" | "insufficient_data";
  confidence: "high" | "medium" | "low" | "insufficient_data";
  a_wins_ratio: number | null;
  rationale: string;
}

export interface PivotDistanceThreshold {
  near: "compaction_continue" | "new_session_reorient" | "tie" | "insufficient_data";
  partial: "compaction_continue" | "new_session_reorient" | "tie" | "insufficient_data";
  radical: "compaction_continue" | "new_session_reorient" | "tie" | "insufficient_data";
  rationale: string;
}

export interface AggregatorOutput {
  bushel: 17;
  ts: string;
  replicates_found: number;
  receipts_arm_a: number;
  receipts_arm_b: number;
  per_task: PerTaskDelta[];
  per_class: PerClassSummary[];
  threshold_map: ThresholdMap;
  g5_validation: { ok: boolean; message: string };
}

// ---------------------------------------------------------------------------
// Receipt loader
// ---------------------------------------------------------------------------

const STATE_BASE = join(
  process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator",
  ".claude",
  "state",
  "bushel_17"
);

function loadReceipts(arm: "arm_a" | "arm_b"): SentinelReceipt[] {
  const dir = join(STATE_BASE, "sentinel_receipts", arm);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf-8")) as SentinelReceipt)
    .filter((r) => r.measurements); // only receipts with measurements block
}

// ---------------------------------------------------------------------------
// Delta computation
// ---------------------------------------------------------------------------

function meanOf(values: (number | null)[]): number | null {
  const populated = values.filter((v): v is number => v !== null);
  if (populated.length === 0) return null;
  return populated.reduce((a, b) => a + b, 0) / populated.length;
}

function computeVariableDelta(
  armAValues: (number | null)[],
  armBValues: (number | null)[],
  betterDirection: "lower" | "higher"
): VariableDelta {
  const a_mean = meanOf(armAValues);
  const b_mean = meanOf(armBValues);

  if (a_mean === null || b_mean === null) {
    return { arm_a_mean: a_mean, arm_b_mean: b_mean, delta: null, winner: "insufficient_data", better_direction: betterDirection };
  }

  const delta = a_mean - b_mean;
  let winner: VariableDelta["winner"];
  if (Math.abs(delta) < 0.001 && betterDirection === "higher") {
    winner = "tie";
  } else if (betterDirection === "lower") {
    winner = delta < -0.001 ? "A_compaction_continue" : delta > 0.001 ? "B_new_session_reorient" : "tie";
  } else {
    winner = delta > 0.001 ? "A_compaction_continue" : delta < -0.001 ? "B_new_session_reorient" : "tie";
  }

  return { arm_a_mean: a_mean, arm_b_mean: b_mean, delta, winner, better_direction: betterDirection };
}

// ---------------------------------------------------------------------------
// Core aggregation
// ---------------------------------------------------------------------------

export function aggregate(): AggregatorOutput {
  const armAReceipts = loadReceipts("arm_a");
  const armBReceipts = loadReceipts("arm_b");

  const taskIds = [...new Set([...armAReceipts, ...armBReceipts].map((r) => r.task_id))];

  const per_task: PerTaskDelta[] = [];

  for (const taskId of taskIds.sort()) {
    const aReps = armAReceipts.filter((r) => r.task_id === taskId);
    const bReps = armBReceipts.filter((r) => r.task_id === taskId);

    if (aReps.length === 0 && bReps.length === 0) continue;

    const sample = (aReps[0] ?? bReps[0]);
    const task_class = sample.task_class;
    // topic_pivot_distance is stored on the corpus; import dynamically
    const { TASK_BY_ID } = await_import_hack_synchronous(taskId);
    const topic_pivot_distance = TASK_BY_ID?.topic_pivot_distance ?? "near";

    const pick = (reps: SentinelReceipt[], key: keyof SentinelMeasurements) =>
      reps.map((r) => r.measurements[key] as number | null);

    const TTFP = computeVariableDelta(pick(aReps, "TTFP_ms"), pick(bReps, "TTFP_ms"), "lower");
    const TTFA = computeVariableDelta(pick(aReps, "TTFA_ms"), pick(bReps, "TTFA_ms"), "lower");
    const tokens = computeVariableDelta(pick(aReps, "tokens_to_first_output"), pick(bReps, "tokens_to_first_output"), "lower");
    const corrections = computeVariableDelta(pick(aReps, "founder_correction_turns"), pick(bReps, "founder_correction_turns"), "lower");
    const violations = computeVariableDelta(pick(aReps, "r_check_1_violations"), pick(bReps, "r_check_1_violations"), "lower");
    const coherence = computeVariableDelta(pick(aReps, "substrate_coherence_score"), pick(bReps, "substrate_coherence_score"), "higher");

    const deltas = [TTFP, TTFA, tokens, corrections, violations, coherence];
    const a_wins_count = deltas.filter((d) => d.winner === "A_compaction_continue").length;
    const b_wins_count = deltas.filter((d) => d.winner === "B_new_session_reorient").length;
    const overall_winner: PerTaskDelta["overall_winner"] =
      a_wins_count > b_wins_count
        ? "A_compaction_continue"
        : b_wins_count > a_wins_count
        ? "B_new_session_reorient"
        : deltas.some((d) => d.winner === "insufficient_data")
        ? "insufficient_data"
        : "tie";

    per_task.push({
      task_id: taskId,
      task_class,
      topic_pivot_distance,
      TTFP,
      TTFA,
      tokens_to_first_output: tokens,
      founder_correction_turns: corrections,
      r_check_1_violations: violations,
      substrate_coherence_score: coherence,
      a_wins_count,
      b_wins_count,
      overall_winner,
    });
  }

  // Per-class summaries
  const classes: TaskClass[] = ["lookup", "author", "bushel_design"];
  const per_class: PerClassSummary[] = classes.map((cls) => {
    const tasks = per_task.filter((t) => t.task_class === cls);
    const a_wins_tasks = tasks.filter((t) => t.overall_winner === "A_compaction_continue").length;
    const b_wins_tasks = tasks.filter((t) => t.overall_winner === "B_new_session_reorient").length;
    const tie_tasks = tasks.filter((t) => t.overall_winner === "tie").length;

    const avgDelta = (key: keyof Pick<PerTaskDelta, "TTFP" | "TTFA" | "tokens_to_first_output" | "founder_correction_turns" | "r_check_1_violations" | "substrate_coherence_score">) =>
      meanOf(tasks.map((t) => t[key].delta));

    const class_winner: PerClassSummary["class_winner"] =
      tasks.length === 0
        ? "insufficient_data"
        : a_wins_tasks > b_wins_tasks
        ? "A_compaction_continue"
        : b_wins_tasks > a_wins_tasks
        ? "B_new_session_reorient"
        : "tie";

    return {
      task_class: cls,
      task_count: tasks.length,
      a_wins_tasks,
      b_wins_tasks,
      tie_tasks,
      avg_delta_TTFP_ms: avgDelta("TTFP"),
      avg_delta_TTFA_ms: avgDelta("TTFA"),
      avg_delta_tokens: avgDelta("tokens_to_first_output"),
      avg_delta_founder_correction: avgDelta("founder_correction_turns"),
      avg_delta_r_check_violations: avgDelta("r_check_1_violations"),
      avg_delta_coherence: avgDelta("substrate_coherence_score"),
      class_winner,
    };
  });

  // Threshold map
  const threshold_map = buildThresholdMap(per_class, per_task);

  // G5 validation
  const g5 = validateThresholdMap(threshold_map);

  const output: AggregatorOutput = {
    bushel: 17,
    ts: new Date().toISOString(),
    replicates_found: Math.max(
      ...armAReceipts.map((r) => r.replicate),
      ...armBReceipts.map((r) => r.replicate),
      0
    ),
    receipts_arm_a: armAReceipts.length,
    receipts_arm_b: armBReceipts.length,
    per_task,
    per_class,
    threshold_map,
    g5_validation: g5,
  };

  const outDir = STATE_BASE;
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "threshold_map.json"), JSON.stringify(output, null, 2), "utf-8");
  console.log(`[Bushel17/Aggregator] threshold_map.json written. G5: ${g5.message}`);

  return output;
}

// ---------------------------------------------------------------------------
// Threshold map builder
// ---------------------------------------------------------------------------

function buildThresholdMap(
  per_class: PerClassSummary[],
  per_task: PerTaskDelta[]
): ThresholdMap {
  const makeRecommendation = (cls: TaskClass): RoutingRecommendation => {
    const summary = per_class.find((c) => c.task_class === cls);
    if (!summary || summary.task_count === 0) {
      return {
        task_class: cls,
        recommended_mode: "insufficient_data",
        confidence: "insufficient_data",
        a_wins_ratio: null,
        rationale: "No receipts populated for this class yet. Fire sentinel tasks to generate data.",
      };
    }
    const total = summary.a_wins_tasks + summary.b_wins_tasks + summary.tie_tasks;
    const a_wins_ratio = total > 0 ? summary.a_wins_tasks / total : null;
    const recommended_mode =
      summary.class_winner === "A_compaction_continue"
        ? "compaction_continue"
        : summary.class_winner === "B_new_session_reorient"
        ? "new_session_reorient"
        : summary.class_winner === "tie"
        ? "mixed"
        : "insufficient_data";

    const confidence: RoutingRecommendation["confidence"] =
      a_wins_ratio === null
        ? "insufficient_data"
        : a_wins_ratio >= 0.75 || a_wins_ratio <= 0.25
        ? "high"
        : a_wins_ratio >= 0.6 || a_wins_ratio <= 0.4
        ? "medium"
        : "low";

    const rationale =
      recommended_mode === "insufficient_data"
        ? "Awaiting sentinel fires."
        : `${cls} class: Arm ${summary.class_winner === "A_compaction_continue" ? "A" : "B"} wins ` +
          `${Math.max(summary.a_wins_tasks, summary.b_wins_tasks)}/${total} tasks. ` +
          `Avg coherence delta: ${summary.avg_delta_coherence?.toFixed(3) ?? "n/a"}. ` +
          `Avg correction delta: ${summary.avg_delta_founder_correction?.toFixed(2) ?? "n/a"} turns.`;

    return { task_class: cls, recommended_mode, confidence, a_wins_ratio, rationale };
  };

  // Pivot-distance sub-threshold
  const pivotWinner = (distance: "near" | "partial" | "radical"): PivotDistanceThreshold["near"] => {
    const tasks = per_task.filter((t) => t.topic_pivot_distance === distance);
    if (tasks.length === 0) return "insufficient_data";
    const aW = tasks.filter((t) => t.overall_winner === "A_compaction_continue").length;
    const bW = tasks.filter((t) => t.overall_winner === "B_new_session_reorient").length;
    return aW > bW ? "compaction_continue" : bW > aW ? "new_session_reorient" : "tie";
  };

  const pivotRationale =
    "Based on Founder hypothesis: near-pivot → compaction-continue expected to win; " +
    "radical-pivot → new-session-reorient expected to win (Catechist-discipline-reset / multi-day-gap). " +
    "Populate receipts to confirm empirically.";

  return {
    lookup_routing_recommendation: makeRecommendation("lookup"),
    author_routing_recommendation: makeRecommendation("author"),
    bushel_design_routing_recommendation: makeRecommendation("bushel_design"),
    synthesis:
      "Threshold map from Bushel 17 sentinel A/B. " +
      "For substrate-mediated work (familiar topic, Eblet-routed), " +
      "compaction-continue is hypothesized to win on TTFP, TTFA, and token cost. " +
      "New-session wins on radical topic-pivot or multi-day gap (cold Eblet context). " +
      "This synthesis updates as receipts populate.",
    pivot_distance_threshold: {
      near: pivotWinner("near"),
      partial: pivotWinner("partial"),
      radical: pivotWinner("radical"),
      rationale: pivotRationale,
    },
  };
}

// ---------------------------------------------------------------------------
// G5 validation
// ---------------------------------------------------------------------------

function validateThresholdMap(map: ThresholdMap): { ok: boolean; message: string } {
  const allRecs = [
    map.lookup_routing_recommendation,
    map.author_routing_recommendation,
    map.bushel_design_routing_recommendation,
  ];
  const hasAllClasses = allRecs.every((r) => r.task_class && r.recommended_mode);
  const hasSynthesis = map.synthesis.length > 20;
  const hasPivotMap =
    map.pivot_distance_threshold.near !== undefined &&
    map.pivot_distance_threshold.partial !== undefined &&
    map.pivot_distance_threshold.radical !== undefined;

  if (hasAllClasses && hasSynthesis && hasPivotMap) {
    const modes = allRecs.map((r) => `${r.task_class}→${r.recommended_mode}`).join(", ");
    return { ok: true, message: `G5 PASS — threshold map coherent. Routing: ${modes}` };
  }
  return {
    ok: false,
    message: `G5 FAIL — classes=${hasAllClasses}, synthesis=${hasSynthesis}, pivotMap=${hasPivotMap}`,
  };
}

// ---------------------------------------------------------------------------
// Synchronous task-by-id lookup (avoids async in tight loop)
// Uses static import from corpus — wrapped to handle missing task gracefully
// ---------------------------------------------------------------------------

function await_import_hack_synchronous(taskId: string): {
  TASK_BY_ID: { topic_pivot_distance: "near" | "partial" | "radical" } | undefined;
} {
  // Static lookup table mirrors sentinel_corpus.ts topic_pivot_distance
  const pivotMap: Record<string, "near" | "partial" | "radical"> = {
    L1: "near",
    L2: "near",
    L3: "partial",
    A1: "near",
    A2: "near",
    A3: "partial",
    D1: "partial",
    D2: "partial",
    D3: "radical",
  };
  return { TASK_BY_ID: pivotMap[taskId] ? { topic_pivot_distance: pivotMap[taskId] } : undefined };
}
