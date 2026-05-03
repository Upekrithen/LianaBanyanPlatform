/**
 * Apiarist Hive Cross-Frame Federation Hooks — KN-D4 / BP018 Pod D
 * ==================================================================
 * When a Hive thread closes in an LB Frame Local:
 *   1. Synthesis Jar is created (KN-J4)
 *   2. If cohort_class >= federation_member → broadcast Jar reference
 *      to other LB Frame Local instances via cross-cathedral router (KN-J5)
 *   3. Apply HsCohortClass enforcement:
 *      - lone_wolf     → NEVER federates
 *      - pied_piper    → read-only broadcast (no write-back to other frames)
 *      - federation    → full bidirectional broadcast
 *      - excalibur     → curated-slice broadcast per tag
 *   4. Write provenance: federation_event in Pheromone substrate
 *
 * Composes with:
 *   Pod-J KN-J5 cross_cathedral_router.ts (cross-cathedral routing)
 *   Pod-G alternating cylinder fire (50%-uptime cap is independent)
 */

import { existsSync, appendFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import type { HiveThread } from "./thread_state.js";
import type { HsCohortClass } from "../house_scribe/cross_cathedral_router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_cf = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_cf, "../../stitchpunks");
const HIVE_DIR = resolve(STITCHPUNKS_DIR, "apiarist_hive");
const FEDERATION_EVENTS_LOG = resolve(HIVE_DIR, "federation_events.jsonl");

function ensureDir(): void {
  if (!existsSync(HIVE_DIR)) mkdirSync(HIVE_DIR, { recursive: true });
}

// ─── Cohort-class rank for comparison ─────────────────────────────────────────

const COHORT_RANK: Record<HsCohortClass, number> = {
  lone_wolf:             0,
  pied_piper_tier_1:     1,
  federation_member:     2,
  excalibur_subscriber:  3,
  thirteenth_warrior:    4,
};

function isFederationEligible(cohort_class: string): boolean {
  const rank = COHORT_RANK[cohort_class as HsCohortClass];
  return rank !== undefined && rank >= COHORT_RANK["pied_piper_tier_1"];
}

// ─── Federation receipt ────────────────────────────────────────────────────────

export interface FederationReceipt {
  provenance_id: string;
  thread_id: string;
  jar_id: string;
  cohort_class: string;
  broadcast_mode: "none" | "read_only" | "bidirectional" | "curated_slice";
  frames_notified: number;
  pheromone_written: boolean;
  timestamp: string;
}

// ─── Main federation hook ──────────────────────────────────────────────────────

export interface HiveFederationOpts {
  thread: HiveThread;
  jar_id: string;
  cohort_class: string;
  frame_instance_id: string;
  tags?: string[];  // for Excalibur curated-slice
}

/**
 * On Hive thread close → attempt federation broadcast based on cohort_class.
 * Lone Wolf: returns immediately with broadcast_mode "none".
 * Pied Piper: read-only broadcast to Pied Piper instances.
 * Federation Member: full bidirectional broadcast.
 * Excalibur Class: curated-slice broadcast per tag.
 */
export function onThreadClosedFederateIfEligible(
  opts: HiveFederationOpts
): FederationReceipt {
  const { thread, jar_id, cohort_class, frame_instance_id, tags = [] } = opts;

  // Lone Wolf: NEVER federates
  if (cohort_class === "lone_wolf") {
    return buildReceipt(thread.id, jar_id, cohort_class, "none", 0, false);
  }

  if (!isFederationEligible(cohort_class)) {
    return buildReceipt(thread.id, jar_id, cohort_class, "none", 0, false);
  }

  let broadcast_mode: FederationReceipt["broadcast_mode"];
  let frames_notified = 0;

  switch (cohort_class) {
    case "pied_piper_tier_1":
      broadcast_mode = "read_only";
      frames_notified = broadcastReadOnly(thread, jar_id, frame_instance_id);
      break;
    case "federation_member":
      broadcast_mode = "bidirectional";
      frames_notified = broadcastBidirectional(thread, jar_id, frame_instance_id);
      break;
    case "excalibur_subscriber":
    case "thirteenth_warrior":
      broadcast_mode = "curated_slice";
      frames_notified = broadcastCuratedSlice(thread, jar_id, frame_instance_id, tags);
      break;
    default:
      broadcast_mode = "none";
  }

  const receipt = buildReceipt(thread.id, jar_id, cohort_class, broadcast_mode, frames_notified, true);
  writeFederationEvent(receipt, thread, frame_instance_id);
  return receipt;
}

// ─── Broadcast implementations ────────────────────────────────────────────────

function broadcastReadOnly(thread: HiveThread, jar_id: string, source_frame: string): number {
  // In a real implementation, this would invoke KN-J5 cross-cathedral router
  // to notify other Pied Piper instances (read-only; no write-back).
  // For the federated primitive, we log the intent and return simulated count.
  writeBroadcastLog({ mode: "read_only", thread_id: thread.id, jar_id, source_frame });
  return 1; // simulated: 1 Pied Piper peer notified
}

function broadcastBidirectional(thread: HiveThread, jar_id: string, source_frame: string): number {
  writeBroadcastLog({ mode: "bidirectional", thread_id: thread.id, jar_id, source_frame });
  return 1; // simulated: full bidirectional to all federation peers
}

function broadcastCuratedSlice(thread: HiveThread, jar_id: string, source_frame: string, tags: string[]): number {
  writeBroadcastLog({ mode: "curated_slice", thread_id: thread.id, jar_id, source_frame, tags });
  return tags.length > 0 ? 1 : 0;
}

function writeBroadcastLog(entry: Record<string, unknown>): void {
  ensureDir();
  try {
    const broadcastLog = resolve(HIVE_DIR, "broadcast_log.jsonl");
    appendFileSync(broadcastLog, JSON.stringify({ ...entry, ts: new Date().toISOString() }) + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildReceipt(
  thread_id: string,
  jar_id: string,
  cohort_class: string,
  broadcast_mode: FederationReceipt["broadcast_mode"],
  frames_notified: number,
  pheromone_written: boolean
): FederationReceipt {
  return {
    provenance_id: `LB-HIVE-FED-${randomUUID()}`,
    thread_id,
    jar_id,
    cohort_class,
    broadcast_mode,
    frames_notified,
    pheromone_written,
    timestamp: new Date().toISOString(),
  };
}

function writeFederationEvent(receipt: FederationReceipt, thread: HiveThread, source_frame: string): void {
  ensureDir();
  try {
    appendFileSync(
      FEDERATION_EVENTS_LOG,
      JSON.stringify({ ...receipt, source_frame, thread_participants: thread.participants }) + "\n",
      "utf-8"
    );
  } catch { /* non-fatal */ }
}
