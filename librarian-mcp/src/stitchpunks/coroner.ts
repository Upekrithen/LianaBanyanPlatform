/**
 * Coroner Stitchpunk — reactive-axis failure detection.
 * K28 §6 — Bushel 72 BP032.
 */

import type { StitchpunkTask, InsertRunResult } from "./types.js";
import { CORONER_IDENTITY } from "./identity.js";
import { infer, currentInsert } from "./insert_swap.js";

/** Standard Coroner tasks for Method 1 cross-vendor test. */
export const CORONER_TASKS: StitchpunkTask[] = [
  {
    id: "coroner_T1",
    input: "File hash mismatch: expected sha256=abc123, got sha256=xyz789. Eblit sequence=42 rejected.",
    expected_triggers: ["AUTOPSY_SIGNAL", "FAILURE_CLASS"],
    expected_semantic_claims: ["hash mismatch detected", "failure class: integrity violation"],
  },
  {
    id: "coroner_T2",
    input: "Session K521 ran 3 consecutive zero-hit retrievals. No Cathedral cache warming. 0 iron-tablet writes.",
    expected_triggers: ["AUTOPSY_SIGNAL", "FAILURE_CLASS"],
    expected_semantic_claims: ["consecutive zero-hits detected", "failure class: retrieval drought"],
  },
  {
    id: "coroner_T3",
    input: "Eblit cluster BDF-3814 has 4 entries, 3 shared triggers (oracle_flip, SWEEP_COMPLETE, LEDGER_ENTRY). Cluster cohesion score: 0.87.",
    expected_triggers: ["PROMOTION_CANDIDATE", "WITHIN_SPEC"],
    expected_semantic_claims: ["cluster cohesion above threshold", "promotion candidate approved"],
  },
  {
    id: "coroner_T4",
    input: "Pheromone substrate received 12 oracle_flip signals in 300ms window. Normal range: 0-3.",
    expected_triggers: ["AUTOPSY_SIGNAL", "FAILURE_CLASS"],
    expected_semantic_claims: ["pheromone spike detected", "failure class: signal storm"],
  },
  {
    id: "coroner_T5",
    input: "Iron tablet write sequence 1001-1010 all hash-verified. No conflicts. Session BP032.",
    expected_triggers: ["WITHIN_SPEC", "PROMOTION_CANDIDATE"],
    expected_semantic_claims: ["write sequence verified", "within operational parameters"],
  },
];

/** Run a single Coroner task through the current insert. */
export async function runCoronerTask(task: StitchpunkTask): Promise<InsertRunResult> {
  const swapStart = Date.now();
  const insert = currentInsert();
  const { output, inference_ms } = await infer(CORONER_IDENTITY, task.input);

  const triggersUsed = task.expected_triggers.filter(t =>
    output.trigger_words.includes(t) || output.raw_text.includes(t)
  );
  const triggerMatchRate = task.expected_triggers.length > 0
    ? triggersUsed.length / task.expected_triggers.length
    : 1;

  const schemaValid =
    output.schema_version === CORONER_IDENTITY.output_schema_version &&
    output.stitchpunk_id === CORONER_IDENTITY.id &&
    typeof output.summary === "string" &&
    Array.isArray(output.trigger_words);

  return {
    model_tag: insert.model_tag,
    task_id: task.id,
    output,
    schema_valid: schemaValid,
    triggers_used: triggersUsed,
    trigger_match_rate: triggerMatchRate,
    swap_latency_ms: Date.now() - swapStart - inference_ms,
    inference_ms,
  };
}
