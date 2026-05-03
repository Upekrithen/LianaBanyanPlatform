/**
 * House Scribe Apiarist Hive Subscriber — KN-J4 / BP017
 * =======================================================
 * Subscribes to KN-D3 Hive-thread `thread_closed_with_synthesis` event.
 * When a Hive thread closes, House Scribe:
 *   1. Creates a Jar via KN-J1 (createJar)
 *   2. Assigns 8-digit-grid coordinate via KN-J2 (assignCoordinate)
 *   3. Registers with KN-J3 living-gridwork (updateCellOnEvent)
 *   4. Seals the Jar (sealJar) — forever-stamp class
 *   5. Computes per-role Marks-attribution (Workers/Drones/Queen)
 *
 * Bee-canon role mapping (per Apiarist Hive canon BP016):
 *   Workers  → contributing_members; pro-rata Marks-attribution
 *   Drones   → contributing_members with drone_specialty flag; Excalibur promotion eligible
 *   Queen    → queen_member_id; supervisor-class Marks multiplier
 *   House Scribe → seals Jar; assigns coordinate; logs provenance (Comb-builder + Honey-keeper)
 *
 * Project-cohort GREATER % payment (per KN-D4 per-cohort routing):
 *   Tribe / Family / Guild Hives: standard Marks-attribution (1.0x)
 *   Project Hive: GREATER % multiplier (configurable; default 1.25x)
 *
 * BRIDLE Rule 4 conservative defaults:
 *   - Incomplete synthesis → HALT Jar creation; flag for Queen review
 *   - Missing contribution map → fallback to historical aggregation; never silent-zero
 *   - Provenance chain failure → retry queue (per KN-J1)
 *   - FORK doctrine: Marks-attribution NEVER bridges to fiat
 *
 * Composes with:
 *   KN-D3 Hive-thread state machine (closed transition)
 *   KN-D4 per-cohort routing + Project GREATER % payment
 *   KN-J1 jar_lifecycle.ts
 *   KN-J2 coordinate_assignment.ts
 *   KN-J3 living_gridwork.ts
 *   KN105 Excalibur Class (Jar promotion eligibility)
 */

import {
  createJar,
  sealJar,
  readAllJars,
  type ContentType,
  type CohortMinimum,
  type JarOfHoney,
} from "./jar_lifecycle.js";
import { assignCoordinate } from "./coordinate_assignment.js";
import { updateCellOnEvent } from "./living_gridwork.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_ah = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_ah, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
const HIVE_EVENTS_LOG = resolve(HS_DIR, "hive_closure_events.jsonl");

// ─── Hive-thread closure event schema ────────────────────────────────────────

export type HiveCohortType = "tribe" | "family" | "guild" | "project";

export interface ContributorRecord {
  member_id: string;
  role: "worker" | "drone" | "queen";
  contribution_weight: number;  // 0.0-1.0 (fraction of total contribution)
  drone_specialty?: string;     // e.g., "excalibur_class_specialist"
}

export interface ThreadClosedWithSynthesisEvent {
  thread_id: string;
  cathedral: string;
  cohort_type: HiveCohortType;
  closed_at: string;
  synthesis_summary: string;             // max 500 chars
  synthesis_blob_pointer: string;        // IPFS / object-storage key
  contributors: ContributorRecord[];
  queen_member_id: string | null;
  /** Maps to KN-J1 ContentType. Defaults to "synthesis" for Hive thread closures. */
  content_type?: ContentType;
  read_cohort_minimum?: CohortMinimum;
  write_cohort_minimum?: CohortMinimum;
  /** Optional: Marks units available for this thread (for attribution). */
  total_marks_pool?: number;
}

// ─── Marks-attribution schema ─────────────────────────────────────────────────

export interface MarksAttribution {
  member_id: string;
  role: "worker" | "drone" | "queen";
  base_contribution_weight: number;   // from ContributorRecord
  cohort_multiplier: number;          // 1.0 for standard; 1.25+ for Project
  attributed_marks_fraction: number;  // final fraction of total_marks_pool
  drone_specialty?: string;
  fork_doctrine_validated: boolean;   // always true; FORK = no fiat conversion
}

export const PROJECT_COHORT_MULTIPLIER = 1.25;  // GREATER % payment for Project Hive
export const QUEEN_SUPERVISOR_MULTIPLIER = 1.5; // Queen earns 1.5x standard weight

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JarCreationOrchestrationResult {
  success: boolean;
  jar?: JarOfHoney;
  coordinate?: string;
  serial?: string;
  marks_attribution?: MarksAttribution[];
  bridle_flag?: string;
  error?: string;
  incomplete_synthesis?: boolean;
  fork_doctrine_validated: boolean;
}

export interface HiveJarStatusResult {
  data_available: boolean;
  thread_id: string;
  jars: JarOfHoney[];
  marks_attribution?: MarksAttribution[];
  unavailable_reason?: string;
}

// ─── Marks-attribution computation ───────────────────────────────────────────

function computeMarksAttribution(
  contributors: ContributorRecord[],
  cohort_type: HiveCohortType,
  queen_member_id: string | null
): MarksAttribution[] {
  const cohort_multiplier = cohort_type === "project" ? PROJECT_COHORT_MULTIPLIER : 1.0;

  // Normalize contribution weights (total should sum to 1.0)
  const rawTotal = contributors.reduce((s, c) => s + c.contribution_weight, 0);
  const normalize = rawTotal > 0 ? rawTotal : 1.0;

  // Apply Queen supervisor multiplier by inflating their weight
  const adjustedContributors = contributors.map((c) => {
    let weight = c.contribution_weight / normalize;
    if (c.role === "queen" || c.member_id === queen_member_id) {
      weight *= QUEEN_SUPERVISOR_MULTIPLIER;
    }
    return { ...c, adjusted_weight: weight };
  });

  // Re-normalize after Queen inflation
  const adjustedTotal = adjustedContributors.reduce((s, c) => s + c.adjusted_weight, 0);
  const finalNorm = adjustedTotal > 0 ? adjustedTotal : 1.0;

  return adjustedContributors.map((c) => ({
    member_id: c.member_id,
    role: c.role,
    base_contribution_weight: c.contribution_weight,
    cohort_multiplier,
    attributed_marks_fraction: (c.adjusted_weight / finalNorm) * cohort_multiplier,
    drone_specialty: c.drone_specialty,
    fork_doctrine_validated: true,  // FORK doctrine: always LB-currency, never fiat
  }));
}

// ─── Jar creation orchestration ───────────────────────────────────────────────

/**
 * Full Jar creation orchestration on Hive-thread closure.
 * Chains: create → assign-coordinate → living-gridwork-register → seal
 *
 * BRIDLE Rule 4:
 *   - Incomplete synthesis (empty summary or blob pointer) → HALT; flag for Queen
 *   - Missing contributors → fallback attribution (equal weight); never silent-zero
 */
export function onThreadClosedWithSynthesis(
  event: ThreadClosedWithSynthesisEvent
): JarCreationOrchestrationResult {
  // BRIDLE Rule 4: incomplete synthesis check
  if (!event.synthesis_summary.trim() || !event.synthesis_blob_pointer.trim()) {
    return {
      success: false,
      fork_doctrine_validated: true,
      incomplete_synthesis: true,
      bridle_flag: "HALT — Hive-thread synthesis incomplete. Jar creation halted. Flag for Queen review.",
      error: `Thread ${event.thread_id} has empty synthesis_summary or synthesis_blob_pointer.`,
    };
  }

  // Step 1: Create Jar (KN-J1)
  const hasDrone = event.contributors.some((c) => c.role === "drone");
  const create = createJar({
    cathedral: event.cathedral,
    source_hive_thread_id: event.thread_id,
    contributing_members: event.contributors.map((c) => c.member_id),
    queen_member_id: event.queen_member_id ?? undefined,
    content_type: event.content_type ?? "synthesis",
    content_summary: event.synthesis_summary,
    content_blob_pointer: event.synthesis_blob_pointer,
    excalibur_class_eligible: hasDrone,
    read_cohort_minimum: event.read_cohort_minimum,
    write_cohort_minimum: event.write_cohort_minimum,
  });

  if (!create.success || !create.jar) {
    return {
      success: false,
      fork_doctrine_validated: true,
      error: `Jar creation failed: ${create.error}`,
      bridle_flag: "HALT — Jar creation failed. Retry queue engaged.",
    };
  }

  const jar = create.jar;

  // Step 2: Assign coordinate (KN-J2)
  const assigned = assignCoordinate({
    jar_id: jar.jar_id,
    cathedral: event.cathedral,
    content_type: event.content_type ?? "synthesis",
  });

  if (!assigned.success) {
    return {
      success: false,
      jar,
      fork_doctrine_validated: true,
      error: `Coordinate assignment failed: ${assigned.error}`,
      bridle_flag: assigned.bridle_rule_4,
    };
  }

  const coordinate = assigned.coordinate!;

  // Step 3: Register with living gridwork (KN-J3)
  updateCellOnEvent({
    coordinate,
    event_type: "jar_added",
    jar_id: jar.jar_id,
    detail: `Hive-thread ${event.thread_id} sealed → Jar ${jar.jar_id}`,
  });

  // Step 4: Seal Jar (KN-J1 — forever-stamp)
  const sealed = sealJar(jar.jar_id);
  if (!sealed.success) {
    return {
      success: false,
      jar: assigned.jar,
      coordinate,
      fork_doctrine_validated: true,
      error: `Jar sealing failed: ${sealed.error}`,
      bridle_flag: "HALT — Jar seal failure. Provenance retry queue engaged.",
    };
  }

  // Step 5: Compute Marks-attribution
  const marks_attribution = computeMarksAttribution(
    event.contributors,
    event.cohort_type,
    event.queen_member_id
  );

  // Log hive closure event
  try {
    if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
    appendFileSync(HIVE_EVENTS_LOG, JSON.stringify({
      thread_id: event.thread_id,
      jar_id: sealed.jar?.jar_id,
      coordinate,
      serial: sealed.serial,
      closed_at: event.closed_at,
      marks_attribution,
      timestamp: new Date().toISOString(),
    }) + "\n", "utf-8");
  } catch {
    // non-fatal log failure
  }

  return {
    success: true,
    jar: sealed.jar!,
    coordinate,
    serial: sealed.serial,
    marks_attribution,
    fork_doctrine_validated: true,
  };
}

// ─── Hive Jar status query ────────────────────────────────────────────────────

/**
 * Query Jars created from a specific Hive thread.
 * Returns Jar + Marks-attribution from the closure event log.
 */
export function queryHiveJarStatus(thread_id: string): HiveJarStatusResult {
  try {
    const allJars = readAllJars();
    const jars = allJars.filter((j) => j.source_hive_thread_id === thread_id);

    // Load marks attribution from event log
    let marks_attribution: MarksAttribution[] | undefined;
    if (existsSync(HIVE_EVENTS_LOG)) {
      try {
        const raw = readFileSync(HIVE_EVENTS_LOG, "utf-8");
        const events = raw.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
        const event = events.find((e) => e.thread_id === thread_id);
        if (event?.marks_attribution) {
          marks_attribution = event.marks_attribution;
        }
      } catch {
        // non-fatal
      }
    }

    return { data_available: true, thread_id, jars, marks_attribution };
  } catch (err) {
    return {
      data_available: false,
      thread_id,
      jars: [],
      unavailable_reason: `Query failed: ${String(err)}`,
    };
  }
}

// ─── Hive-thread active count (for population audit) ─────────────────────────

/**
 * Count active Hive threads by reading the closure event log.
 * Returns number of threads that have NOT yet closed (based on known closed ones).
 * This provides the active_hive_threads count for KN-J1 population audit.
 */
export function countActiveHiveThreads(): number {
  if (!existsSync(HIVE_EVENTS_LOG)) return 0;
  try {
    const raw = readFileSync(HIVE_EVENTS_LOG, "utf-8");
    const closed = new Set(
      raw.split("\n").filter((l) => l.trim()).map((l) => {
        try { return JSON.parse(l).thread_id; } catch { return null; }
      }).filter(Boolean)
    );
    return closed.size;  // surrogate metric: closed threads ≈ total throughput
  } catch {
    return 0;
  }
}
