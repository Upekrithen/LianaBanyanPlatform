/**
 * Bushel 17 — Sentinel Runner (Test Harness)
 * Shadow-cascade-eligible (composes with Bushel 16 LANDED Pod-G capability)
 *
 * Provides two fire functions:
 *   runSentinelOnArmA — compaction-continue mode (current session, post-compaction)
 *   runSentinelOnArmB — new-session-reorient mode (fresh session with Coffee+Wrasse+brief_me)
 *
 * Each run captures the 6 measured variables from the Bushel 17 canon:
 *   TTFP, TTFA, tokens_to_first_output, founder_correction_turns,
 *   r_check_1_violations, substrate_coherence_score
 *
 * Receipts write to ~/.claude/state/bushel_17/sentinel_receipts/<arm>/<task_id>.json
 *
 * G4 CACHE TTL NOTE: Anthropic prompt-cache TTL is 5 minutes.
 *   Arm A fires within an active session (cache warm).
 *   Arm B fires after a fresh-session boot (cold cache, full re-cache cost).
 *   This differential MUST be logged in each receipt's provenance field.
 *
 * Canon anchor: compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { TASK_BY_ID, SENTINEL_CORPUS, validateCorpusCoverage, type SentinelTask, type TaskClass } from "./sentinel_corpus.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Arm = "A_compaction_continue" | "B_new_session_reorient";

/** The 6 measured variables per run (Bushel 17 canon §Six measured variables) */
export interface SentinelMeasurements {
  /** Wall-clock ms from session-resume / compaction-resume to first non-orientation tool call */
  TTFP_ms: number | null;
  /** Wall-clock ms from session-resume to first substrate write (Eblet write, Codex entry, etc.) */
  TTFA_ms: number | null;
  /** Token count from session start to first useful response */
  tokens_to_first_output: number | null;
  /**
   * Human-labeled count of turns spent re-establishing context.
   * Placeholder at scaffold time; Founder fills from session observation.
   */
  founder_correction_turns: number | null;
  /**
   * Count of Reminder-Scribe-logged R-CHECK-1 violations during this task execution.
   * Placeholder at scaffold time; requires Reminder Scribe integration at fire-time.
   */
  r_check_1_violations: number | null;
  /** Detective-validated substrate coherence score, 0.0–1.000 (1.000 = ideal) */
  substrate_coherence_score: number | null;
}

export interface SentinelReceipt {
  task_id: string;
  task_class: TaskClass;
  arm: Arm;
  session_id: string;
  /** ISO-8601 timestamp of the fire */
  ts: string;
  /** Replicate index within this arm (1, 2, or 3 per G1 requirement) */
  replicate: 1 | 2 | 3;
  measurements: SentinelMeasurements;
  /** Rubric score assigned by Founder or Shadow post-review: 0.0–1.0 */
  completion_quality_rubric_score: number | null;
  /** Detective-validated anchors found in the response */
  detective_validation_anchors: string[];
  /**
   * Prompt-cache provenance note (G4).
   * Arm A: note that cache was warm (active session, within 5-min TTL).
   * Arm B: note that cache was cold (fresh session boot, full re-cache paid).
   */
  cache_provenance_note: string;
  /**
   * Free-form notes from Founder or Shadow about context re-establishment,
   * surprising failures, or notable quality deltas.
   */
  notes: string;
}

export interface SessionContext {
  /** BP-session ID, e.g. "BP021" */
  session_id: string;
  /** Is this session currently running post-compaction? (Arm A) */
  is_post_compaction: boolean;
  /** Context budget remaining (0.0–1.0), relevant for Arm A */
  context_budget_remaining: number | null;
  /** Was Coffee+Wrasse+brief_me handoff executed? (Arm B) */
  fresh_session_with_coffee_handoff: boolean;
  /** Timestamp of session start (ISO-8601) */
  session_start_ts: string;
}

// ---------------------------------------------------------------------------
// Receipt path helpers
// ---------------------------------------------------------------------------

const STATE_BASE = join(
  process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator",
  ".claude",
  "state",
  "bushel_17"
);

function receiptPath(arm: Arm, taskId: string, replicate: number): string {
  const armDir = arm === "A_compaction_continue" ? "arm_a" : "arm_b";
  const dir = join(STATE_BASE, "sentinel_receipts", armDir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, `${taskId}_rep${replicate}.json`);
}

function writeReceipt(receipt: SentinelReceipt): string {
  const path = receiptPath(receipt.arm, receipt.task_id, receipt.replicate);
  writeFileSync(path, JSON.stringify(receipt, null, 2), "utf-8");
  return path;
}

// ---------------------------------------------------------------------------
// Scaffold helpers (produce a blank receipt for human/Shadow fill-in)
// ---------------------------------------------------------------------------

function blankMeasurements(): SentinelMeasurements {
  return {
    TTFP_ms: null,
    TTFA_ms: null,
    tokens_to_first_output: null,
    founder_correction_turns: null,
    r_check_1_violations: null,
    substrate_coherence_score: null,
  };
}

function scaffoldReceipt(
  task: SentinelTask,
  arm: Arm,
  sessionCtx: SessionContext,
  replicate: 1 | 2 | 3,
  cacheProvenanceNote: string
): SentinelReceipt {
  return {
    task_id: task.task_id,
    task_class: task.task_class,
    arm,
    session_id: sessionCtx.session_id,
    ts: new Date().toISOString(),
    replicate,
    measurements: blankMeasurements(),
    completion_quality_rubric_score: null,
    detective_validation_anchors: [],
    cache_provenance_note: cacheProvenanceNote,
    notes: "",
  };
}

// ---------------------------------------------------------------------------
// Core fire functions
// ---------------------------------------------------------------------------

/**
 * runSentinelOnArmA — Compaction-Continue Mode
 *
 * Fires a sentinel task in the current Bishop session post-compaction.
 * Cache state: WARM (within active session, within 5-min Anthropic TTL).
 * Scaffold-only: writes a blank receipt to the arm_a directory.
 * Founder or Shadow fills measurements after the actual AI fire.
 *
 * G4: logs cache provenance as "warm — active session within 5-min Anthropic TTL"
 */
export function runSentinelOnArmA(
  taskId: string,
  sessionContext: SessionContext,
  replicate: 1 | 2 | 3 = 1
): { receipt_path: string; receipt: SentinelReceipt } {
  const task = TASK_BY_ID[taskId];
  if (!task) throw new Error(`Unknown task_id: ${taskId}. Valid IDs: ${Object.keys(TASK_BY_ID).join(", ")}`);

  const cacheNote =
    "Arm A — cache WARM: active Bishop session, within Anthropic 5-min prompt-cache TTL. " +
    `Session: ${sessionContext.session_id}. ` +
    `Post-compaction: ${sessionContext.is_post_compaction}. ` +
    `Context budget remaining: ${sessionContext.context_budget_remaining ?? "unknown"}.`;

  const receipt = scaffoldReceipt(task, "A_compaction_continue", sessionContext, replicate, cacheNote);
  const receipt_path = writeReceipt(receipt);

  console.log(`[Bushel17/ArmA] Scaffolded receipt for ${taskId} rep${replicate} → ${receipt_path}`);
  console.log(`[Bushel17/ArmA] PROMPT TO FIRE:\n---\n${task.prompt}\n---`);
  console.log(`[Bushel17/ArmA] Rubric must_contain: ${task.rubric.must_contain.join(", ")}`);

  return { receipt_path, receipt };
}

/**
 * runSentinelOnArmB — New-Session-Reorient Mode
 *
 * Fires a sentinel task in a fresh Bishop session with Coffee+Wrasse+brief_me handoff.
 * Cache state: COLD (fresh session boot, full re-cache cost paid).
 * Scaffold-only: writes a blank receipt to the arm_b directory.
 * Founder or Shadow fills measurements after the actual AI fire.
 *
 * G4: logs cache provenance as "cold — fresh session boot, full re-cache cost"
 */
export function runSentinelOnArmB(
  taskId: string,
  freshSessionContext: SessionContext,
  replicate: 1 | 2 | 3 = 1
): { receipt_path: string; receipt: SentinelReceipt } {
  const task = TASK_BY_ID[taskId];
  if (!task) throw new Error(`Unknown task_id: ${taskId}. Valid IDs: ${Object.keys(TASK_BY_ID).join(", ")}`);

  if (!freshSessionContext.fresh_session_with_coffee_handoff) {
    console.warn(
      `[Bushel17/ArmB] WARNING: fresh_session_with_coffee_handoff=false for ${taskId}. ` +
        "Arm B requires Coffee+Wrasse+brief_me handoff. Proceed anyway but document in notes."
    );
  }

  const cacheNote =
    "Arm B — cache COLD: fresh session boot, full Anthropic prompt-cache re-cost paid. " +
    `Session: ${freshSessionContext.session_id}. ` +
    `Coffee+Wrasse+brief_me handoff executed: ${freshSessionContext.fresh_session_with_coffee_handoff}.`;

  const receipt = scaffoldReceipt(task, "B_new_session_reorient", freshSessionContext, replicate, cacheNote);
  const receipt_path = writeReceipt(receipt);

  console.log(`[Bushel17/ArmB] Scaffolded receipt for ${taskId} rep${replicate} → ${receipt_path}`);
  console.log(`[Bushel17/ArmB] PROMPT TO FIRE:\n---\n${task.prompt}\n---`);
  console.log(`[Bushel17/ArmB] Rubric must_contain: ${task.rubric.must_contain.join(", ")}`);

  return { receipt_path, receipt };
}

/**
 * Fills in measurements on an existing scaffolded receipt.
 * Called by Founder or Shadow after observing the actual AI fire.
 */
export function fillMeasurements(
  receiptPath: string,
  measurements: Partial<SentinelMeasurements>,
  rubricScore: number,
  detectiveAnchors: string[],
  notes: string
): SentinelReceipt {
  if (!existsSync(receiptPath)) {
    throw new Error(`Receipt not found: ${receiptPath}`);
  }
  const existing: SentinelReceipt = JSON.parse(readFileSync(receiptPath, "utf-8"));
  const updated: SentinelReceipt = {
    ...existing,
    measurements: { ...existing.measurements, ...measurements },
    completion_quality_rubric_score: rubricScore,
    detective_validation_anchors: detectiveAnchors,
    notes,
    ts: new Date().toISOString(),
  };
  writeFileSync(receiptPath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

// ---------------------------------------------------------------------------
// G1 scaffold-all helper
// Scaffolds all 54 fire-slots (9 tasks × 2 arms × 3 replicates)
// ---------------------------------------------------------------------------

export interface ScaffoldAllResult {
  g1_validation: { ok: boolean; message: string };
  scaffolded_slots: number;
  arm_a_paths: string[];
  arm_b_paths: string[];
}

export function scaffoldAllFireSlots(
  armASessionCtx: SessionContext,
  armBSessionCtx: SessionContext
): ScaffoldAllResult {
  const g1 = validateCorpusCoverage();
  const arm_a_paths: string[] = [];
  const arm_b_paths: string[] = [];

  for (const task of SENTINEL_CORPUS) {
    for (const rep of [1, 2, 3] as const) {
      const { receipt_path: pa } = runSentinelOnArmA(task.task_id, armASessionCtx, rep);
      const { receipt_path: pb } = runSentinelOnArmB(task.task_id, armBSessionCtx, rep);
      arm_a_paths.push(pa);
      arm_b_paths.push(pb);
    }
  }

  const total = arm_a_paths.length + arm_b_paths.length;
  console.log(`\n[Bushel17] scaffoldAllFireSlots complete: ${total} slots scaffolded (G1: ${g1.message})`);

  return {
    g1_validation: g1,
    scaffolded_slots: total,
    arm_a_paths,
    arm_b_paths,
  };
}

// ---------------------------------------------------------------------------
// G2 validation helper: verify receipt schema completeness
// ---------------------------------------------------------------------------

export function validateReceiptSchema(receipt: SentinelReceipt): { ok: boolean; missing: string[] } {
  const required: (keyof SentinelReceipt)[] = [
    "task_id",
    "task_class",
    "arm",
    "session_id",
    "ts",
    "replicate",
    "measurements",
    "completion_quality_rubric_score",
    "detective_validation_anchors",
    "cache_provenance_note",
  ];
  const missing = required.filter((k) => receipt[k] === undefined);
  const measurementKeys: (keyof SentinelMeasurements)[] = [
    "TTFP_ms",
    "TTFA_ms",
    "tokens_to_first_output",
    "founder_correction_turns",
    "r_check_1_violations",
    "substrate_coherence_score",
  ];
  const missingMeasurements = measurementKeys.filter(
    (k) => !(k in receipt.measurements)
  );
  if (missingMeasurements.length > 0) {
    const prefixed = missingMeasurements.map((k) => `measurements.${k}`) as unknown as (keyof SentinelReceipt)[];
    missing.push(...prefixed);
  }
  return { ok: missing.length === 0, missing };
}
