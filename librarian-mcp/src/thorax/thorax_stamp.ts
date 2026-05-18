/**
 * Thorax Stamp Protocol — P5: 2-stamp share / 3-stamp adopt
 * =========================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P5: 2-stamp share / 3-stamp adopt protocol with Chronos tag + Eblit snapshot.
 *
 * Founder verbatim: "Default is required two stamps, one on each side, to share
 *   and another stamp to adopt. So easy to revert to alternate timeline of
 *   conditional operators, preset by authoring source."
 *
 * "Chronos tags keep the record per eblet and iron tablet."
 *
 * Composes with:
 *   - Chronos (chronos_query) for epoch tagging
 *   - Eblits (snapshot-at-access) for frozen stamp-state at moment of application
 *   - Touchstone (touchstone_verify) for 2-stamp / adopt authority
 *   - thorax_channels.ts (stamp count update)
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID, createHash } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import { readChannel, updateChannelMetadata } from "./thorax_channels.js";
import { captureEblitSnapshot } from "./thorax_eblit.js";
import type { StampRecord, StampClass, ThoraxDirection } from "./thorax_types.js";
import { ADOPT_STAMP_THRESHOLD } from "./thorax_types.js";
import { readEblitSnapshot } from "./thorax_eblit.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function stampLedgerPath(): string {
  return resolve(THORAX_DIR, "stamp_ledger.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendStamp(record: StampRecord): void {
  ensureDir();
  appendFileSync(stampLedgerPath(), JSON.stringify(record) + "\n", "utf-8");
}

function readStamps(): StampRecord[] {
  const p = stampLedgerPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as StampRecord);
  } catch {
    return [];
  }
}

/** Stamps for a given channel, latest per stamp_id (append-only). */
export function readChannelStamps(channel_id: number): StampRecord[] {
  return readStamps().filter((s) => s.channel_id === channel_id);
}

// ─── Chronos tag generation ────────────────────────────────────────────────────

/**
 * Generate a Chronos epoch tag for this stamp.
 * Format: thorax:<channel_id>:<epoch_ms>:<stamp_sequence>
 */
function generateChronosTag(channel_id: number, stamp_seq: number): string {
  return `thorax:${channel_id}:${Date.now()}:s${stamp_seq}`;
}

// ─── Stamp application ────────────────────────────────────────────────────────

export interface ApplyStampResult {
  success: boolean;
  stamp?: StampRecord;
  stamp_class?: StampClass;
  share_threshold_met?: boolean;  // true when 2 stamps (1 per side) are present
  adopt_threshold_met?: boolean;  // true when 3 stamps are present
  error?: string;
}

/**
 * Apply a stamp to a channel.
 *
 * Share rule: 1 East stamp + 1 West stamp = 2 total → share authorized.
 * Adopt rule: 3 stamps total (any combination) → adopt authorized.
 *
 * Each stamp application captures an Eblit snapshot of the stamp-state
 * at the moment of application — deterministic frozen frame per P10.
 */
export function applyStamp(
  channel_id: number,
  stamper_node_id: string,
  stamper_direction: ThoraxDirection
): ApplyStampResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }
  if (!["bestie_open", "transmitting_east", "transmitting_west"].includes(ch.state)) {
    return {
      success: false,
      error: `Channel ${channel_id} is in state=${ch.state}. Stamps can only be applied in open/transmitting states.`,
    };
  }

  const all_stamps = readChannelStamps(channel_id);
  const stamp_seq = all_stamps.length + 1;

  const east_stamps = ch.east_stamps + (stamper_direction === "east" ? 1 : 0);
  const west_stamps = ch.west_stamps + (stamper_direction === "west" ? 1 : 0);
  const total_stamps = east_stamps + west_stamps;

  const share_threshold_met = east_stamps >= 1 && west_stamps >= 1; // 1 per side
  const adopt_threshold_met = total_stamps >= ADOPT_STAMP_THRESHOLD;

  const stamp_class: StampClass = adopt_threshold_met ? "adopt" : "share";
  const chronos_tag = generateChronosTag(channel_id, stamp_seq);

  // Capture Eblit snapshot of stamp-state at this moment
  const eblit = captureEblitSnapshot(channel_id, "stamp_state", {
    east_stamps_before: ch.east_stamps,
    west_stamps_before: ch.west_stamps,
    east_stamps_after: east_stamps,
    west_stamps_after: west_stamps,
    stamp_seq,
    stamper_direction,
    stamper_node_id,
  });

  const stamp: StampRecord = {
    stamp_id: `thorax-stamp-${randomUUID()}`,
    channel_id,
    stamper_node_id,
    stamper_direction,
    stamp_class,
    chronos_tag,
    eblit_snapshot_id: eblit.snapshot_id,
    east_stamps_at_time: east_stamps,
    west_stamps_at_time: west_stamps,
    ts: new Date().toISOString(),
  };

  appendStamp(stamp);

  // Update channel stamp counters (metadata-only — no state transition)
  updateChannelMetadata(channel_id, {
    east_stamps,
    west_stamps,
    chronos_tag,
    last_eblit_snapshot_id: eblit.snapshot_id,
  });

  return {
    success: true,
    stamp,
    stamp_class,
    share_threshold_met,
    adopt_threshold_met,
  };
}

// ─── Stamp verification ────────────────────────────────────────────────────────

export interface StampVerificationResult {
  channel_id: number;
  east_stamps: number;
  west_stamps: number;
  total_stamps: number;
  share_authorized: boolean;
  adopt_authorized: boolean;
  latest_chronos_tag?: string;
  latest_eblit_snapshot_id?: string;
}

/**
 * Verify current stamp state for a channel.
 * Used by CP-refusal logic and transmission gate.
 */
export function verifyStamps(channel_id: number): StampVerificationResult {
  const ch = readChannel(channel_id);
  const east_stamps = ch?.east_stamps ?? 0;
  const west_stamps = ch?.west_stamps ?? 0;
  const total_stamps = east_stamps + west_stamps;

  return {
    channel_id,
    east_stamps,
    west_stamps,
    total_stamps,
    share_authorized: east_stamps >= 1 && west_stamps >= 1,
    adopt_authorized: total_stamps >= ADOPT_STAMP_THRESHOLD,
    latest_chronos_tag: ch?.chronos_tag,
    latest_eblit_snapshot_id: ch?.last_eblit_snapshot_id,
  };
}

// ─── Alternate-timeline revert ────────────────────────────────────────────────

/**
 * Revert to an alternate timeline by fetching a prior Eblit snapshot of stamp-state.
 * "Easy to revert to alternate timeline of conditional operators, preset by authoring source."
 *
 * Returns the frozen stamp-state from the requested Eblit snapshot_id.
 */
export function revertToAlternateTimeline(
  channel_id: number,
  target_eblit_snapshot_id: string
): {
  found: boolean;
  channel_id: number;
  target_snapshot_id: string;
  stamp_state_at_snapshot?: Record<string, unknown>;
} {
  const snapshot = readEblitSnapshot(target_eblit_snapshot_id);

  if (!snapshot || snapshot.channel_id !== channel_id) {
    return { found: false, channel_id, target_snapshot_id: target_eblit_snapshot_id };
  }

  return {
    found: true,
    channel_id,
    target_snapshot_id: target_eblit_snapshot_id,
    stamp_state_at_snapshot: snapshot.frozen_content,
  };
}
