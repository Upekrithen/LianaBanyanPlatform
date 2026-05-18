/**
 * Thorax Phalanx Fallback Queue — P9
 * ===================================
 * Dream #5 · BP046B · Phase 1
 *
 * P9: Phalanx fallback queue for failed-handshake streams.
 *     Option C ratified by Founder (not deferred to Phase 3).
 *     "Entry point is attuned to specific frequency signature and
 *     threshold prevents thorax transmission without reciprocal acceptance."
 *
 * Founder verbatim: "Phalanx crowds so entry point is attuned to specific
 *   frequency signature and threshold prevents thorax transmission without
 *   reciprocal acceptance." (§0 Dream #5)
 *
 * The Phalanx queue holds failed/flagged streams awaiting independent review.
 * Streams in Phalanx are not destroyed — they await:
 *   - Redemption via official request (restores to bestie_open)
 *   - Escalation (sealed → Angel of Death furnace sentence complete)
 *
 * Composes with:
 *   - thorax_flag.ts (flagStream → Phalanx enqueue)
 *   - thorax_channels.ts (transitionChannel to "phalanx")
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import { transitionChannel, readChannel } from "./thorax_channels.js";
import { markFlagPhalanxEnqueued } from "./thorax_flag.js";
import type { PhalanxQueueEntry } from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function phalanxQueuePath(): string {
  return resolve(THORAX_DIR, "phalanx_queue.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendEntry(entry: PhalanxQueueEntry): void {
  ensureDir();
  appendFileSync(phalanxQueuePath(), JSON.stringify(entry) + "\n", "utf-8");
}

function readQueue(): PhalanxQueueEntry[] {
  const p = phalanxQueuePath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as PhalanxQueueEntry);
  } catch {
    return [];
  }
}

/** Latest entry per queue_id. */
function latestQueue(): Map<string, PhalanxQueueEntry> {
  const all = readQueue();
  const map = new Map<string, PhalanxQueueEntry>();
  for (const e of all) map.set(e.queue_id, e);
  return map;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface PhalanxEnqueueResult {
  success: boolean;
  entry?: PhalanxQueueEntry;
  queue_position?: number;
  error?: string;
}

/**
 * Enqueue a failed/flagged stream to the Phalanx fallback queue.
 * Channel transitions to "phalanx" state.
 *
 * "Phalanx crowds so entry point is attuned to specific frequency signature."
 */
export function enqueuePhalanx(
  channel_id: number,
  reason: PhalanxQueueEntry["reason"],
  opts: {
    flag_record_id?: string;
    east_node_id?: string;
    west_node_id?: string;
  } = {}
): PhalanxEnqueueResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }
  if (!["flagged", "handshake_pending"].includes(ch.state)) {
    return {
      success: false,
      error: `Channel ${channel_id} is in state=${ch.state}. Only flagged or handshake_pending channels can be enqueued to Phalanx.`,
    };
  }

  const unreviewed = Array.from(latestQueue().values()).filter((e) => !e.reviewed);
  const queue_position = unreviewed.length + 1;

  const entry: PhalanxQueueEntry = {
    queue_id: `phalanx-${randomUUID()}`,
    channel_id,
    reason,
    original_east_node_id: opts.east_node_id ?? ch.east_node_id,
    original_west_node_id: opts.west_node_id ?? ch.west_node_id,
    flag_record_id: opts.flag_record_id,
    enqueued_ts: new Date().toISOString(),
    reviewed: false,
    review_outcome: "pending",
  };

  appendEntry(entry);

  // Mark the flag record as Phalanx-enqueued
  if (opts.flag_record_id) {
    markFlagPhalanxEnqueued(opts.flag_record_id, queue_position);
  }

  // Transition channel to phalanx
  transitionChannel(channel_id, "phalanx");

  return { success: true, entry, queue_position };
}

// ─── Phalanx review ───────────────────────────────────────────────────────────

export interface PhalanxReviewResult {
  success: boolean;
  entry?: PhalanxQueueEntry;
  error?: string;
}

/**
 * Review a Phalanx queue entry.
 *
 * "reinstated" → channel returns to bestie_open (airport re-entry after clearing)
 * "sealed_angel_of_death" → channel sealed, furnace sentence complete
 */
export function reviewPhalanxEntry(
  queue_id: string,
  outcome: "reinstated" | "sealed_angel_of_death",
  reviewer: string
): PhalanxReviewResult {
  const map = latestQueue();
  const entry = map.get(queue_id);

  if (!entry) {
    return { success: false, error: `Phalanx entry ${queue_id} not found.` };
  }
  if (entry.reviewed) {
    return { success: false, error: `Phalanx entry ${queue_id} already reviewed (outcome: ${entry.review_outcome}).` };
  }

  const updated: PhalanxQueueEntry = {
    ...entry,
    reviewed: true,
    review_outcome: outcome,
    review_ts: new Date().toISOString(),
    reviewer,
  };
  appendEntry(updated);

  if (outcome === "reinstated") {
    transitionChannel(entry.channel_id, "bestie_open", {
      cp_refused: false,
      flag_reason: undefined,
      flag_ts: undefined,
    });
  } else {
    transitionChannel(entry.channel_id, "sealed");
  }

  return { success: true, entry: updated };
}

// ─── Phalanx queries ──────────────────────────────────────────────────────────

/** Read all unreviewed Phalanx entries (the active queue). */
export function readActivePhalanxQueue(): PhalanxQueueEntry[] {
  return Array.from(latestQueue().values()).filter((e) => !e.reviewed);
}

/** Read all Phalanx entries for a channel. */
export function readChannelPhalanxHistory(channel_id: number): PhalanxQueueEntry[] {
  return Array.from(latestQueue().values()).filter(
    (e) => e.channel_id === channel_id
  );
}

/** Ship gate 7 verification: failed-handshake correctly refused + queued. */
export function smokeGate7(channel_id: number): {
  passed: boolean;
  channel_state: string;
  phalanx_entry_found: boolean;
} {
  const ch = readChannel(channel_id);
  const entries = readChannelPhalanxHistory(channel_id);
  const phalanx_entry_found = entries.length > 0;
  const channel_state = ch?.state ?? "not_found";
  const passed = phalanx_entry_found && ["phalanx", "flagged"].includes(channel_state);

  return { passed, channel_state, phalanx_entry_found };
}
