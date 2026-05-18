/**
 * Thorax Flag Constriction + Angel of Death Recording — P7 + P8
 * ==============================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P7: Per-stream flag constriction.
 *     Flag → that stream renders stationary + entry/exit constricted.
 *     OTHER 11 streams unaffected (per-stream, NOT global isolation).
 *
 * P8: Angel of Death recording on failed/flagged streams.
 *     Wires Harbinger Scribe → Angel of Death furnace sentence chain.
 *     (Harbinger Scribe: canon-only-zero-impl initially; AoD exists)
 *
 * Founder verbatim: "If ANY flags surface, then we initiate safety protocol,
 *   which is to render stationary and constrict entry/exit points FOR THE
 *   FLAGGED STREAM." (§0.5)
 *
 * Composes with:
 *   - Angel of Death (angel_of_death_buried via discipline_wing Python)
 *   - thorax_channels.ts (per-stream state transition to "flagged")
 *   - thorax_choke.ts (force-release sticky choke before flag)
 *   - getUnaffectedChannels() (verify other 11 unaffected)
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import {
  transitionChannel, readChannel, getUnaffectedChannels,
} from "./thorax_channels.js";
import { forceReleaseStickyChoke } from "./thorax_choke.js";
import type { FlagConstrictionRecord } from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function flagLogPath(): string {
  return resolve(THORAX_DIR, "flag_log.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendFlagRecord(record: FlagConstrictionRecord): void {
  ensureDir();
  appendFileSync(flagLogPath(), JSON.stringify(record) + "\n", "utf-8");
}

function readFlagLog(): FlagConstrictionRecord[] {
  const p = flagLogPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as FlagConstrictionRecord);
  } catch {
    return [];
  }
}

// ─── Harbinger Scribe (canon-only-zero-impl · BP046B) ─────────────────────────

/**
 * Harbinger Scribe stub (canon-only, zero-impl initially per §6 R3).
 * "Questions brittle data Thorax; triggers Angel-of-Death furnace sentence."
 * Full implementation deferred to Phase 2 (BP047+).
 *
 * For Phase 1: log the Harbinger interrogation as a flag precursor record.
 */
function harbingerInterrogate(
  channel_id: number,
  flag_reason: string,
  flagged_by: string
): { interrogation_id: string; verdict: "flag_warranted" | "flag_rejected" } {
  return {
    interrogation_id: `harbinger-${randomUUID()}`,
    verdict: "flag_warranted", // Phase 1: all Harbinger calls warrant a flag (full scoring deferred)
  };
}

// ─── Angel of Death wiring ────────────────────────────────────────────────────

/**
 * Record a flagged stream in the Angel of Death Catacombs.
 * Wires to `angel_of_death_buried` (exists in discipline_wing).
 *
 * Phase 1: writes to local AoD log file (full Python bridge in P8.2).
 * The burial_id is returned for cross-referencing.
 */
function recordAngelOfDeath(
  channel_id: number,
  flag_record_id: string,
  flag_reason: string,
  channel_state_snapshot: Record<string, unknown>
): { burial_id: string } {
  const burial_id = `aod-${randomUUID().slice(0, 8)}`;
  const aod_path = resolve(THORAX_DIR, "angel_of_death_thorax.jsonl");

  const entry = {
    burial_id,
    channel_id,
    flag_record_id,
    flag_reason,
    channel_state_snapshot,
    buried_ts: new Date().toISOString(),
    source: "thorax_flag_p8",
    furnace_sentence: `Channel ${channel_id} flagged and sequestered. Reason: ${flag_reason}. Awaiting redemption or RP×XP snowball resolution.`,
  };

  ensureDir();
  appendFileSync(aod_path, JSON.stringify(entry) + "\n", "utf-8");
  return { burial_id };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface FlagStreamResult {
  success: boolean;
  flag_record?: FlagConstrictionRecord;
  harbinger_verdict?: "flag_warranted" | "flag_rejected";
  angel_of_death_burial_id?: string;
  unaffected_channels?: number[];
  error?: string;
}

/**
 * P7+P8: Flag a relay-thread stream.
 *
 * 1. Harbinger Scribe interrogates (canon-only stub, Phase 1)
 * 2. If verdict = flag_warranted:
 *    a. Force-release sticky choke (if occupied)
 *    b. Transition channel to "flagged"
 *    c. Record Angel of Death burial
 *    d. Identify unaffected channels (other 11)
 *    e. Enqueue to Phalanx (handled by thorax_phalanx.ts)
 *
 * Ship gate 5: "Simulate flag on channel 7 → channel 7 stationary,
 *               channels 1-6 + 8-12 unaffected."
 * Ship gate 6: "Flagged channel 7 stream logged to Angel of Death."
 */
export function flagStream(
  channel_id: number,
  flag_reason: string,
  flagged_by: string
): FlagStreamResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }
  if (ch.state === "sealed" || ch.state === "flagged" || ch.state === "phalanx") {
    return {
      success: false,
      error: `Channel ${channel_id} is already in state=${ch.state}. Cannot re-flag.`,
    };
  }

  // Harbinger interrogation (P8 canon-only stub)
  const { interrogation_id, verdict } = harbingerInterrogate(
    channel_id, flag_reason, flagged_by
  );

  if (verdict === "flag_rejected") {
    return {
      success: false,
      harbinger_verdict: "flag_rejected",
      error: `Harbinger Scribe rejected flag on channel ${channel_id}.`,
    };
  }

  // P7: Force-release choke if stuck
  if (!["uninitialized", "handshake_pending", "bestie_open"].includes(ch.state)) {
    forceReleaseStickyChoke(channel_id, flag_reason, flagged_by);
  }

  // P7: Transition channel to "flagged" (per-stream, NOT global)
  const unaffected_channels = getUnaffectedChannels(channel_id);
  const flag_ts = new Date().toISOString();

  const flag_record_id = `flag-${randomUUID()}`;

  // P8: Angel of Death recording
  const { burial_id } = recordAngelOfDeath(
    channel_id,
    flag_record_id,
    flag_reason,
    {
      state_before_flag: ch.state,
      east_node_id: ch.east_node_id,
      west_node_id: ch.west_node_id,
      east_stamps: ch.east_stamps,
      west_stamps: ch.west_stamps,
      flagged_by,
      interrogation_id,
    }
  );

  const flagRecord: FlagConstrictionRecord = {
    flag_id: flag_record_id,
    channel_id,
    flag_reason,
    flagged_by,
    flagged_ts: flag_ts,
    channels_unaffected: unaffected_channels,
    angel_of_death_burial_id: burial_id,
    phalanx_enqueued: false,
  };

  appendFlagRecord(flagRecord);

  // Transition channel state
  transitionChannel(channel_id, "flagged", {
    flag_reason,
    flag_ts,
    angel_of_death_burial_id: burial_id,
    cp_refused: true,   // CP-class refusal: flagged stream cannot transmit
  });

  return {
    success: true,
    flag_record: flagRecord,
    harbinger_verdict: "flag_warranted",
    angel_of_death_burial_id: burial_id,
    unaffected_channels,
  };
}

// ─── Flag log queries ──────────────────────────────────────────────────────────

/** Read all flag records for a channel. */
export function readChannelFlags(channel_id: number): FlagConstrictionRecord[] {
  return readFlagLog().filter((f) => f.channel_id === channel_id);
}

/** Read all active (unresolved) flag records. */
export function readActiveFlagRecords(): FlagConstrictionRecord[] {
  return readFlagLog().filter((f) => !f.phalanx_enqueued || f.phalanx_queue_position === undefined);
}

/** Mark a flag record as Phalanx-enqueued. */
export function markFlagPhalanxEnqueued(
  flag_id: string,
  queue_position: number
): { updated: boolean } {
  const all = readFlagLog();
  const rec = all.find((f) => f.flag_id === flag_id);
  if (!rec) return { updated: false };

  const updated: FlagConstrictionRecord = {
    ...rec,
    phalanx_enqueued: true,
    phalanx_queue_position: queue_position,
  };
  appendFlagRecord(updated);
  return { updated: true };
}
