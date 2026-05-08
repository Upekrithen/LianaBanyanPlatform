/**
 * Ledger Stitchpunk — reflective-axis provenance management.
 * K28 §6 — Bushel 72 BP032.
 */

import type { StitchpunkTask, InsertRunResult } from "./types.js";
import { LEDGER_IDENTITY } from "./identity.js";
import { infer, currentInsert } from "./insert_swap.js";

export const LEDGER_TASKS: StitchpunkTask[] = [
  {
    id: "ledger_T1",
    input: "Record Eblit entry: session=K533, hash=8fa2b91c, scribe=oracle_circuit, sequence=1001, ts=2026-05-08T13:30:00Z",
    expected_triggers: ["LEDGER_ENTRY", "SEQUENCE_NUMBER"],
    expected_semantic_claims: ["ledger entry recorded", "sequence position 1001"],
  },
  {
    id: "ledger_T2",
    input: "Coroner has flagged Eblit cluster BDF-3814 as PROMOTION_CANDIDATE with cohesion 0.87. Approve promotion to permanent ledger.",
    expected_triggers: ["PROMOTION_APPROVED", "CITATION_ANCHOR"],
    expected_semantic_claims: ["promotion approved", "citation anchor created for cluster BDF-3814"],
  },
  {
    id: "ledger_T3",
    input: "Stone tablet sequence 990-999 all verified. Write citation anchor for K28 empirical receipt, session BP032.",
    expected_triggers: ["CITATION_ANCHOR", "LEDGER_ENTRY"],
    expected_semantic_claims: ["citation anchor for K28", "stone tablet sequence verified"],
  },
];

export async function runLedgerTask(task: StitchpunkTask): Promise<InsertRunResult> {
  const insert = currentInsert();
  const { output, inference_ms } = await infer(LEDGER_IDENTITY, task.input);

  const triggersUsed = task.expected_triggers.filter(t =>
    output.trigger_words.includes(t) || output.raw_text.includes(t)
  );
  const triggerMatchRate = task.expected_triggers.length > 0
    ? triggersUsed.length / task.expected_triggers.length
    : 1;

  const schemaValid =
    output.schema_version === LEDGER_IDENTITY.output_schema_version &&
    output.stitchpunk_id === LEDGER_IDENTITY.id &&
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
