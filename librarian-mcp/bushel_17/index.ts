/**
 * Bushel 17 — Module Index
 * Compaction-Continue vs New-Session-Reorient Sentinel A/B Apparatus
 *
 * Usage (after `tsc`):
 *   import { SENTINEL_CORPUS, runSentinelOnArmA, runSentinelOnArmB, aggregate } from './bushel_17/index.js';
 *
 * Canon: compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md
 * Authored BP021 turn 84 by Knight (Cursor / Sonnet 4.6)
 */

export { SENTINEL_CORPUS, TASK_BY_ID, TASKS_BY_CLASS, validateCorpusCoverage } from "./sentinel_corpus.js";
export type { SentinelTask, TaskClass, ScoringRubric } from "./sentinel_corpus.js";

export {
  runSentinelOnArmA,
  runSentinelOnArmB,
  fillMeasurements,
  scaffoldAllFireSlots,
  validateReceiptSchema,
} from "./sentinel_runner.js";
export type {
  Arm,
  SentinelMeasurements,
  SentinelReceipt,
  SessionContext,
  ScaffoldAllResult,
} from "./sentinel_runner.js";

export { aggregate } from "./aggregator.js";
export type {
  AggregatorOutput,
  ThresholdMap,
  PerTaskDelta,
  PerClassSummary,
  RoutingRecommendation,
  PivotDistanceThreshold,
  VariableDelta,
} from "./aggregator.js";
