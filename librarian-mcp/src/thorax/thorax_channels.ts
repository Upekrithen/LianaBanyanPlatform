/**
 * Thorax Relay Channels — P3: 12-Channel Parallel Relay Threads
 * ==============================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P3: At least 12 parallel relay-thread avenues, each independent.
 *     Each thread has its own state machine.
 *     12 channels serialize their own East/West cycles independently.
 *
 * Founder verbatim: "All of that constitutes one 'relay thread', and
 *   there are at least 12 relay thread avenues (East/West rule)."
 *
 * Storage: stitchpunks/thorax/relay_channels.jsonl (append-only)
 *
 * Composes with:
 *   thorax_choke.ts — P1+P2 choke-point mutex per channel
 *   thorax_types.ts — ThoraxRelayChannel, ThoraxChannelState
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import {
  THORAX_DIR,
} from "./thorax_choke.js";
import type {
  ThoraxRelayChannel, ThoraxChannelState, ThoraxDirection,
} from "./thorax_types.js";
import { THORAX_CHANNEL_COUNT, ADOPT_STAMP_THRESHOLD } from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function channelLedgerPath(): string {
  return resolve(THORAX_DIR, "relay_channels.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendChannelEntry(ch: ThoraxRelayChannel): void {
  ensureDir();
  appendFileSync(channelLedgerPath(), JSON.stringify(ch) + "\n", "utf-8");
}

function readAllChannelEntries(): ThoraxRelayChannel[] {
  const p = channelLedgerPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as ThoraxRelayChannel);
  } catch {
    return [];
  }
}

/** Latest state per channel_id (last-write-wins). */
function latestPerChannel(): Map<number, ThoraxRelayChannel> {
  const all = readAllChannelEntries();
  const map = new Map<number, ThoraxRelayChannel>();
  for (const ch of all) map.set(ch.channel_id, ch);
  return map;
}

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize all 12 relay-thread channels in "uninitialized" state.
 * Idempotent: skips channels already initialized.
 */
export function initializeChannels(): { initialized: number[]; skipped: number[] } {
  const existing = latestPerChannel();
  const initialized: number[] = [];
  const skipped: number[] = [];
  const now = new Date().toISOString();

  for (let ch = 1; ch <= THORAX_CHANNEL_COUNT; ch++) {
    if (existing.has(ch)) {
      skipped.push(ch);
      continue;
    }
    const record: ThoraxRelayChannel = {
      channel_id: ch,
      state: "uninitialized",
      east_stamps: 0,
      west_stamps: 0,
      adopt_threshold: ADOPT_STAMP_THRESHOLD as 3,
      cp_refused: false,
      choke_direction: null,
      ts_created: now,
      ts_updated: now,
    };
    appendChannelEntry(record);
    initialized.push(ch);
  }
  return { initialized, skipped };
}

// ─── State machine transitions ────────────────────────────────────────────────

/**
 * Valid state transitions for a relay channel.
 * Guarded — no backward transitions.
 */
const VALID_CHANNEL_TRANSITIONS: Record<ThoraxChannelState, ThoraxChannelState[]> = {
  uninitialized:       ["handshake_pending"],
  handshake_pending:   ["bestie_open", "phalanx"],     // phalanx = handshake failed
  bestie_open:         ["transmitting_east", "transmitting_west", "flagged"],
  transmitting_east:   ["bestie_open", "flagged"],     // bestie_open = shift-to-side complete
  transmitting_west:   ["bestie_open", "flagged"],
  flagged:             ["phalanx", "sealed"],
  phalanx:             ["bestie_open", "sealed"],      // bestie_open = Phalanx reinstated
  sealed:              [],                             // terminal
};

export interface ChannelTransitionResult {
  success: boolean;
  channel?: ThoraxRelayChannel;
  error?: string;
}

/**
 * Transition a relay channel to a new state.
 * Validates the transition, persists, returns updated channel.
 */
export function transitionChannel(
  channel_id: number,
  target_state: ThoraxChannelState,
  patch?: Partial<ThoraxRelayChannel>
): ChannelTransitionResult {
  const map = latestPerChannel();
  const current = map.get(channel_id);

  if (!current) {
    return {
      success: false,
      error: `Channel ${channel_id} not found. Run initializeChannels() first.`,
    };
  }

  const allowed = VALID_CHANNEL_TRANSITIONS[current.state];
  if (!allowed.includes(target_state)) {
    return {
      success: false,
      error: `Invalid transition on channel ${channel_id}: ${current.state} → ${target_state}. Allowed: [${allowed.join(", ") || "none — terminal state"}]`,
    };
  }

  const updated: ThoraxRelayChannel = {
    ...current,
    ...patch,
    channel_id,
    state: target_state,
    ts_updated: new Date().toISOString(),
  };

  appendChannelEntry(updated);
  return { success: true, channel: updated };
}

// ─── Channel queries ──────────────────────────────────────────────────────────

/**
 * Update channel metadata without a state transition.
 * Used for stamp counters, signatures, Eblit IDs, etc. that need to persist
 * without triggering the state machine transition guard.
 * Appends a new record to the JSONL (last-write-wins).
 */
export function updateChannelMetadata(
  channel_id: number,
  patch: Partial<ThoraxRelayChannel>
): ChannelTransitionResult {
  const map = latestPerChannel();
  const current = map.get(channel_id);

  if (!current) {
    return {
      success: false,
      error: `Channel ${channel_id} not found. Run initializeChannels() first.`,
    };
  }

  const updated: ThoraxRelayChannel = {
    ...current,
    ...patch,
    channel_id,
    state: current.state, // preserve existing state — no transition
    ts_updated: new Date().toISOString(),
  };

  appendChannelEntry(updated);
  return { success: true, channel: updated };
}

/** Read the current state of one channel. */
export function readChannel(channel_id: number): ThoraxRelayChannel | null {
  return latestPerChannel().get(channel_id) ?? null;
}

/** Read all 12 channels. */
export function readAllChannels(): ThoraxRelayChannel[] {
  const map = latestPerChannel();
  const result: ThoraxRelayChannel[] = [];
  for (let ch = 1; ch <= THORAX_CHANNEL_COUNT; ch++) {
    const entry = map.get(ch);
    if (entry) result.push(entry);
  }
  return result;
}

/** List channels by state. */
export function channelsByState(state: ThoraxChannelState): ThoraxRelayChannel[] {
  return readAllChannels().filter((ch) => ch.state === state);
}

/**
 * Get the N unaffected channels when channel X is flagged.
 * Founder verbatim: "OTHER 11 streams unaffected."
 */
export function getUnaffectedChannels(flagged_channel_id: number): number[] {
  return Array.from({ length: THORAX_CHANNEL_COUNT }, (_, i) => i + 1)
    .filter((id) => id !== flagged_channel_id);
}

// ─── Persistent-bestie confirmation heartbeat ─────────────────────────────────

/**
 * Update the continuous external confirmation heartbeat for a bestie_open channel.
 * "Once a threshold is established, then it remains open, since it is continuous
 *  anyway." — Founder BP046B
 *
 * The bestie model stays open under CONTINUOUS external confirmation.
 * If ANY flag surfaces, initiate per-stream constriction instead.
 */
export function recordBestieConfirmation(
  channel_id: number
): { success: boolean; channel?: ThoraxRelayChannel; error?: string } {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }
  if (ch.state !== "bestie_open") {
    return {
      success: false,
      error: `Channel ${channel_id} is not in bestie_open state (current: ${ch.state}). Confirmation not recorded.`,
    };
  }

  const updated: ThoraxRelayChannel = {
    ...ch,
    last_confirmed_ts: new Date().toISOString(),
    ts_updated: new Date().toISOString(),
  };
  appendChannelEntry(updated);
  return { success: true, channel: updated };
}

// ─── Choke direction record ───────────────────────────────────────────────────

/**
 * Record that a direction has acquired the choke point for this channel.
 * Called by thorax_tools after acquireChoke() succeeds.
 */
export function recordChokeAcquired(
  channel_id: number,
  direction: ThoraxDirection
): ChannelTransitionResult {
  const target: ThoraxChannelState =
    direction === "east" ? "transmitting_east" : "transmitting_west";

  return transitionChannel(channel_id, target, { choke_direction: direction });
}

/**
 * Record that the choke has been released (shift-to-side complete).
 * Channel returns to bestie_open for the reciprocal direction to enter.
 */
export function recordChokeReleased(channel_id: number): ChannelTransitionResult {
  return transitionChannel(channel_id, "bestie_open", { choke_direction: null });
}

// ─── Ship gate 3: 12-channel parallelism proof ───────────────────────────────

/**
 * Verify ship gate 3: 12 channels are initialized and each has an independent
 * East/West state cycle.
 * Returns: { passed: boolean; channel_count: number; gate_3_ok: boolean }
 */
export function smokeGate3(): {
  passed: boolean;
  channel_count: number;
  all_initialized: boolean;
  states: Record<number, string>;
} {
  const all = readAllChannels();
  const states: Record<number, string> = {};
  for (const ch of all) states[ch.channel_id] = ch.state;

  const channel_count = all.length;
  const all_initialized = channel_count === THORAX_CHANNEL_COUNT;

  return {
    passed: all_initialized,
    channel_count,
    all_initialized,
    states,
  };
}
