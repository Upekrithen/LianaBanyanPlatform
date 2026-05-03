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
 * Extension (BP021 Bushel 17 EXTENSION — Sipping Ethereal T):
 *   A 7th field on every receipt: background_shadow_tokens_during_arm
 *   Captures Shadow E-Giant continuous-background token spend within the arm execution window.
 *   Source: heartbeat eblets at ~/.claude/state/eblets/<session>/heartbeat_R11_shadow_*.eblet.md
 *   Heartbeats currently carry timestamp + position but not tokens_consumed →
 *   instrumentation_status: "scaffold_unfilled" until heartbeat format includes token data.
 *   When Shadows are not running, shadow_heartbeats_observed = 0, total_tokens = null.
 *
 * Receipts write to ~/.claude/state/bushel_17/sentinel_receipts/<arm>/<task_id>.json
 *
 * G4 CACHE TTL NOTE: Anthropic prompt-cache TTL is 5 minutes.
 *   Arm A fires within an active session (cache warm).
 *   Arm B fires after a fresh-session boot (cold cache, full re-cache cost).
 *   This differential MUST be logged in each receipt's provenance field.
 *
 * Canon anchor: compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md
 * Sipping canon: founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { TASK_BY_ID, SENTINEL_CORPUS, validateCorpusCoverage, type SentinelTask, type TaskClass } from "./sentinel_corpus.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Arm = "A_compaction_continue" | "B_new_session_reorient";

/**
 * Parsed representation of a single Shadow heartbeat eblet.
 * Path: ~/.claude/state/eblets/<session>/heartbeat_R11_shadow_<name>.eblet.md
 * Current heartbeat format carries ts + position but NOT tokens_consumed.
 * tokens_consumed is null until the heartbeat spec is extended to include cost data.
 */
export interface ShadowHeartbeatRead {
  shadow_id: string;
  session: string;
  ts: string;
  position: number | null;
  reattach_count: number | null;
  /** Token cost for this heartbeat window — null in current eblet format */
  tokens_consumed: number | null;
  /** Actual file path of the heartbeat eblet (for auditability) */
  source_path: string;
}

/**
 * Sipping Ethereal T cost-stream field — the 7th measured field on every receipt.
 * Captures Shadow E-Giant continuous-background token spend during the arm execution window.
 * Sister-class to Knight-fire-bookend T (KN-S3 BP018) and Bushel-pod parallel T (BP020).
 *
 * Canon: founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
 */
export interface BackgroundShadowTokensDuringArm {
  /** Sum of tokens_consumed across all Shadow heartbeats within window. null if unavailable. */
  total_tokens: number | null;
  /** Count of Shadow heartbeat eblets observed within the arm execution window. */
  shadow_heartbeats_observed: number;
  /** ISO-8601 arm execution window start (recorded immediately when arm function is called) */
  window_start_ts: string;
  /** ISO-8601 arm execution window end (recorded after arm execution completes + TTFA captured) */
  window_end_ts: string;
  /** Always "sipping_ethereal_t" — cost-stream taxonomy anchor */
  stream_class: "sipping_ethereal_t";
  /**
   * "live": Shadows were running AND heartbeats carry tokens_consumed data.
   * "scaffold_unfilled": Shadows not running (0 heartbeats), OR heartbeats present but
   *   tokens_consumed not yet in eblet format. Does NOT block G2 validation.
   */
  instrumentation_status: "live" | "scaffold_unfilled";
  /**
   * Reality-check: actual heartbeat eblet path prefix observed (or "none_found").
   * Verifies whether ~/.claude/state/eblets/<session>/heartbeat_* path matched.
   */
  heartbeat_path_observed: string;
}

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
  /**
   * Sipping Ethereal T cost-stream — 7th field (Bushel 17 EXTENSION BP021).
   * Background Shadow token spend during this arm's execution window.
   * Canon: founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
   */
  background_shadow_tokens_during_arm: BackgroundShadowTokensDuringArm;
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
// Shadow heartbeat scanner — Sipping Ethereal T cost-stream
// ---------------------------------------------------------------------------

/**
 * Eblet base directory: ~/.claude/state/eblets/
 * Heartbeat pattern per session: heartbeat_R11_shadow_<name>.eblet.md
 * Searches ALL session subdirectories to catch cross-session Shadow activity.
 */
const EBLET_BASE = join(
  process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator",
  ".claude",
  "state",
  "eblets"
);

/**
 * Parse a Shadow heartbeat eblet markdown file into a ShadowHeartbeatRead.
 * Expected format:
 *   # Shadow Heartbeat — R11_shadow_<name>
 *   - **ts:** `<ISO-8601>`
 *   - **session:** `<session_id>`
 *   - **position:** <number>
 *   - **reattach_count:** <number>
 */
function parseHeartbeatEblet(filePath: string): ShadowHeartbeatRead | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const tsMatch = content.match(/\*\*ts:\*\*\s*`([^`]+)`/);
    const sessionMatch = content.match(/\*\*session:\*\*\s*`([^`]+)`/);
    const posMatch = content.match(/\*\*position:\*\*\s*(\d+)/);
    const reattachMatch = content.match(/\*\*reattach_count:\*\*\s*(\d+)/);
    const tokensMatch = content.match(/\*\*tokens_consumed:\*\*\s*(\d+)/);
    const shadowIdMatch = filePath.match(/heartbeat_(.+)\.eblet\.md$/);

    if (!tsMatch) return null;

    return {
      shadow_id: shadowIdMatch ? shadowIdMatch[1] : "unknown",
      session: sessionMatch ? sessionMatch[1] : "unknown",
      ts: tsMatch[1],
      position: posMatch ? parseInt(posMatch[1], 10) : null,
      reattach_count: reattachMatch ? parseInt(reattachMatch[1], 10) : null,
      tokens_consumed: tokensMatch ? parseInt(tokensMatch[1], 10) : null,
      source_path: filePath,
    };
  } catch {
    return null;
  }
}

/**
 * Scan all Shadow heartbeat eblets across all session folders and return those
 * whose `ts` falls within [windowStart, windowEnd].
 *
 * Reality-check note (from Bushel 17 EXTENSION BP021):
 * Heartbeats currently live at ~/.claude/state/eblets/<session>/heartbeat_R11_shadow_*.eblet.md
 * NOT at ~/.claude/state/shadows/heartbeats/<id>/<ts>.json (predicted in the build spec).
 * This function uses the actual observed path.
 */
export function readShadowHeartbeatsWithinWindow(
  windowStart: Date,
  windowEnd: Date
): ShadowHeartbeatRead[] {
  if (!existsSync(EBLET_BASE)) return [];

  const results: ShadowHeartbeatRead[] = [];
  const startMs = windowStart.getTime();
  const endMs = windowEnd.getTime();

  try {
    const sessionDirs = readdirSync(EBLET_BASE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(EBLET_BASE, d.name));

    for (const sessionDir of sessionDirs) {
      try {
        const files = readdirSync(sessionDir)
          .filter((f) => f.startsWith("heartbeat_") && f.endsWith(".eblet.md"));

        for (const file of files) {
          const fullPath = join(sessionDir, file);
          const parsed = parseHeartbeatEblet(fullPath);
          if (!parsed) continue;

          const ts = new Date(parsed.ts);
          if (isNaN(ts.getTime())) continue;
          if (ts.getTime() >= startMs && ts.getTime() <= endMs) {
            results.push(parsed);
          }
        }
      } catch {
        // Skip unreadable session dir gracefully
      }
    }
  } catch {
    // EBLET_BASE unreadable — return empty
  }

  return results;
}

/**
 * Build the BackgroundShadowTokensDuringArm scaffold for a receipt.
 * Called at the END of arm execution (after receipt is written) so window_end_ts is accurate.
 */
export function buildSippingScaffold(
  windowStartTs: string,
  windowEndTs: string
): BackgroundShadowTokensDuringArm {
  const windowStart = new Date(windowStartTs);
  const windowEnd = new Date(windowEndTs);

  const heartbeats = readShadowHeartbeatsWithinWindow(windowStart, windowEnd);
  const populatedTokens = heartbeats.filter((h) => h.tokens_consumed !== null);
  const totalTokens =
    populatedTokens.length > 0
      ? populatedTokens.reduce((sum, h) => sum + (h.tokens_consumed ?? 0), 0)
      : null;

  const isLive = heartbeats.length > 0 && populatedTokens.length > 0;
  const observedPathPrefix =
    heartbeats.length > 0
      ? heartbeats[0].source_path.replace(/heartbeat_.*$/, "heartbeat_*")
      : "none_found";

  return {
    total_tokens: totalTokens,
    shadow_heartbeats_observed: heartbeats.length,
    window_start_ts: windowStartTs,
    window_end_ts: windowEndTs,
    stream_class: "sipping_ethereal_t",
    instrumentation_status: isLive ? "live" : "scaffold_unfilled",
    heartbeat_path_observed: observedPathPrefix,
  };
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
  cacheProvenanceNote: string,
  windowStartTs: string,
  windowEndTs: string
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
    background_shadow_tokens_during_arm: buildSippingScaffold(windowStartTs, windowEndTs),
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
 * Sipping Ethereal T: records window_start_ts on entry, window_end_ts after scaffold completes.
 */
export function runSentinelOnArmA(
  taskId: string,
  sessionContext: SessionContext,
  replicate: 1 | 2 | 3 = 1
): { receipt_path: string; receipt: SentinelReceipt } {
  const windowStartTs = new Date().toISOString();

  const task = TASK_BY_ID[taskId];
  if (!task) throw new Error(`Unknown task_id: ${taskId}. Valid IDs: ${Object.keys(TASK_BY_ID).join(", ")}`);

  const cacheNote =
    "Arm A — cache WARM: active Bishop session, within Anthropic 5-min prompt-cache TTL. " +
    `Session: ${sessionContext.session_id}. ` +
    `Post-compaction: ${sessionContext.is_post_compaction}. ` +
    `Context budget remaining: ${sessionContext.context_budget_remaining ?? "unknown"}.`;

  const windowEndTs = new Date().toISOString();
  const receipt = scaffoldReceipt(task, "A_compaction_continue", sessionContext, replicate, cacheNote, windowStartTs, windowEndTs);
  const receipt_path = writeReceipt(receipt);

  console.log(`[Bushel17/ArmA] Scaffolded receipt for ${taskId} rep${replicate} → ${receipt_path}`);
  console.log(`[Bushel17/ArmA] Sipping Ethereal T: ${receipt.background_shadow_tokens_during_arm.shadow_heartbeats_observed} heartbeats observed (status: ${receipt.background_shadow_tokens_during_arm.instrumentation_status})`);
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
 * Sipping Ethereal T: records window_start_ts on entry, window_end_ts after scaffold completes.
 */
export function runSentinelOnArmB(
  taskId: string,
  freshSessionContext: SessionContext,
  replicate: 1 | 2 | 3 = 1
): { receipt_path: string; receipt: SentinelReceipt } {
  const windowStartTs = new Date().toISOString();

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

  const windowEndTs = new Date().toISOString();
  const receipt = scaffoldReceipt(task, "B_new_session_reorient", freshSessionContext, replicate, cacheNote, windowStartTs, windowEndTs);
  const receipt_path = writeReceipt(receipt);

  console.log(`[Bushel17/ArmB] Scaffolded receipt for ${taskId} rep${replicate} → ${receipt_path}`);
  console.log(`[Bushel17/ArmB] Sipping Ethereal T: ${receipt.background_shadow_tokens_during_arm.shadow_heartbeats_observed} heartbeats observed (status: ${receipt.background_shadow_tokens_during_arm.instrumentation_status})`);
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
    "background_shadow_tokens_during_arm",
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

  // Sipping Ethereal T sub-field validation.
  // G2-pass rule: scaffold_unfilled is accepted — instrumentation_status check is non-blocking.
  if (receipt.background_shadow_tokens_during_arm) {
    const sipping = receipt.background_shadow_tokens_during_arm;
    const sippingRequired: (keyof BackgroundShadowTokensDuringArm)[] = [
      "shadow_heartbeats_observed",
      "window_start_ts",
      "window_end_ts",
      "stream_class",
      "instrumentation_status",
      "heartbeat_path_observed",
    ];
    for (const k of sippingRequired) {
      if (sipping[k] === undefined) {
        missing.push(`background_shadow_tokens_during_arm.${k}` as unknown as keyof SentinelReceipt);
      }
    }
    // stream_class must be "sipping_ethereal_t"
    if (sipping.stream_class !== undefined && sipping.stream_class !== "sipping_ethereal_t") {
      missing.push("background_shadow_tokens_during_arm.stream_class_mismatch" as unknown as keyof SentinelReceipt);
    }
    // instrumentation_status must be "live" | "scaffold_unfilled" — both pass G2
    if (
      sipping.instrumentation_status !== undefined &&
      sipping.instrumentation_status !== "live" &&
      sipping.instrumentation_status !== "scaffold_unfilled"
    ) {
      missing.push("background_shadow_tokens_during_arm.instrumentation_status_invalid" as unknown as keyof SentinelReceipt);
    }
  }

  return { ok: missing.length === 0, missing };
}
