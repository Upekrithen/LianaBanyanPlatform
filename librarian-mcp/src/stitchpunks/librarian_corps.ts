/**
 * LibrarianCorps Stitchpunk — proactive-axis knowledge sweep and synthesis.
 * K28 §6 — Bushel 72 BP032.
 */

import type { StitchpunkTask, InsertRunResult } from "./types.js";
import { LIBRARIAN_CORPS_IDENTITY } from "./identity.js";
import { infer, currentInsert } from "./insert_swap.js";

export const LIBRARIAN_CORPS_TASKS: StitchpunkTask[] = [
  {
    id: "corps_T1",
    input: "Sweep complete: 221 SUPERSEDE files processed, 420KB recovered, 85sec wall-time. Session BP031. Synthesize canonical summary.",
    expected_triggers: ["SWEEP_COMPLETE", "SYNTHESIS_COMPLETE"],
    expected_semantic_claims: ["221 files swept", "420KB recovered"],
  },
  {
    id: "corps_T2",
    input: "File PROMPT_KNIGHT_K453_B114_STITCH_CORONER_FLOW.md references K453 (landed) as NEXT. K453 now obsolete; K521 is NEXT.",
    expected_triggers: ["SUPERSEDE_SIGNAL", "KNOWLEDGE_ANCHOR"],
    expected_semantic_claims: ["supersede detected: K453 → K521", "outdated reference flagged"],
  },
  {
    id: "corps_T3",
    input: "Knowledge claim: Oracle Circuit K29 confirmed PASS (H1 +92pp, H2 98%). Anchor this to the Cathedral substrate for K28 §6 empirical receipt.",
    expected_triggers: ["KNOWLEDGE_ANCHOR", "SYNTHESIS_COMPLETE"],
    expected_semantic_claims: ["K29 Oracle Circuit confirmed", "anchored to Cathedral substrate"],
  },
  {
    id: "corps_T4",
    input: "Sweep corpus: 5 context files, each referencing 'canonical numbers'. Canonical innovation count = 2267. Surface any discrepancies.",
    expected_triggers: ["SWEEP_COMPLETE", "SUPERSEDE_SIGNAL"],
    expected_semantic_claims: ["canonical innovation count verified: 2267", "sweep complete"],
  },
];

export async function runLibrarianCorpsTask(task: StitchpunkTask): Promise<InsertRunResult> {
  const insert = currentInsert();
  const { output, inference_ms } = await infer(LIBRARIAN_CORPS_IDENTITY, task.input);

  const triggersUsed = task.expected_triggers.filter(t =>
    output.trigger_words.includes(t) || output.raw_text.includes(t)
  );
  const triggerMatchRate = task.expected_triggers.length > 0
    ? triggersUsed.length / task.expected_triggers.length
    : 1;

  const schemaValid =
    output.schema_version === LIBRARIAN_CORPS_IDENTITY.output_schema_version &&
    output.stitchpunk_id === LIBRARIAN_CORPS_IDENTITY.id &&
    typeof output.summary === "string" &&
    Array.isArray(output.trigger_words);

  return {
    model_tag: insert.model_tag,
    task_id: task.id,
    output,
    schema_valid: schemaValid,
    triggers_used: triggersUsed,
    trigger_match_rate: triggerMatchRate,
    swap_latency_ms: 0,
    inference_ms,
  };
}
