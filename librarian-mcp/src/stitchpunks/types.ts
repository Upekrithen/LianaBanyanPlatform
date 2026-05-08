/**
 * Stitchpunks with Ollama Inserts — Types
 * K28 §6 cross-vendor anchor — LB-STACK-0183 — Bushel 72 BP032.
 */

/** A named trigger keyword that the Stitchpunk uses in outputs. */
export type TriggerWord = string;

/** Schema-enforced output format for a Stitchpunk response. */
export interface StitchpunkOutput {
  trigger_words: string[];      // list of trigger vocab used in this response
  summary: string;              // ≤200 char canonical summary
  schema_version: string;       // must equal identity.schema_version
  stitchpunk_id: string;        // must equal identity.id
  citations: string[];          // canonical citations per citation_convention
  semantic_claims: string[];    // structured claim list (for semantic convergence)
  raw_text: string;             // unmodified model output
}

/** Persistent identity of a Stitchpunk — substrate-resident. */
export interface StitchpunkIdentity {
  id: string;
  role: "coroner" | "ledger" | "librarian_corps";
  persona_prompt: string;        // injected before every inference call
  trigger_vocabulary: TriggerWord[];
  output_schema_version: string; // format version for StitchpunkOutput
  citation_convention: string;   // e.g. "K-number:description (YYYY-MM-DD)"
  rule_registry: string[];       // ordered rules the model must follow
}

/** A single task fed to a Stitchpunk. */
export interface StitchpunkTask {
  id: string;
  input: string;                 // raw input text
  expected_triggers: string[];   // subset of trigger_vocabulary expected to appear
  expected_semantic_claims: string[]; // canonical claims expected in output
}

/** Result of running a task through a Stitchpunk with one insert. */
export interface InsertRunResult {
  model_tag: string;
  task_id: string;
  output: StitchpunkOutput;
  schema_valid: boolean;
  triggers_used: string[];
  trigger_match_rate: number;     // # matched / # expected
  swap_latency_ms: number;
  inference_ms: number;
}

/** Cross-swap preservation measurement for one task. */
export interface SwapPreservationResult {
  task_id: string;
  baseline_model: string;
  swap_models: string[];
  trigger_preservation: number;   // H1a: fraction of trigger patterns preserved across swaps
  schema_preservation: number;    // H1b: fraction of valid schema outputs across swaps
  semantic_convergence: number;   // H1c: fraction of semantic claims preserved
  h1a_pass: boolean;
  h1b_pass: boolean;
  h1c_pass: boolean;
}

/** Full B72 receipt. */
export interface B72Receipt {
  session: string;
  authored: string;
  models: string[];
  tasks_count: number;
  h1a_mean: number;
  h1b_mean: number;
  h1c_mean: number;
  h2_cross_axis_rate: number;
  h3_persona_drift: number;
  h1_pass: boolean;
  k28_verdict: "confirmed" | "adopted_provisional_held" | "revision_required";
  g_gates: Record<string, boolean>;
}
