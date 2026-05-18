/**
 * Thorax Choke-Point Mutex — P1 + P2
 * =====================================
 * Dream #5 · BP046B · Phase 1
 *
 * P1: Choke-point mutex (token-pass) at relay-thread midpoint.
 *     Single-occupancy guarantee — NEVER simultaneous.
 *
 * P2: Directional alternation (East/West rule).
 *     After a direction passes: "shift to the side" clearing action,
 *     then reciprocal direction may enter the choke point.
 *
 * Founder verbatim: "transmission shadow requires clear line of sight,
 *   so only one thorax can occupy it at a time, but only through the
 *   choke point of the threshold barrier. Once past, it 'shifts to the
 *   side' to allow the other direction to also advance."
 *
 * Implementation class: one-lane-bridge mutex / I²C bus arbitration.
 * NOT Paxos/Raft/PBFT.
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHash } from "crypto";
import type {
  ThoraxDirection, ChokeToken,
} from "./thorax_types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_t = dirname(__filename);

export const STITCHPUNKS_DIR = resolve(__dirname_t, "../../stitchpunks");
export const THORAX_DIR = resolve(STITCHPUNKS_DIR, "thorax");

function ensureThoraxDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function chokeLogPath(): string {
  return resolve(THORAX_DIR, "choke_tokens.jsonl");
}

function appendChoke(token: ChokeToken): void {
  ensureThoraxDir();
  appendFileSync(chokeLogPath(), JSON.stringify(token) + "\n", "utf-8");
}

function readChokeTokens(): ChokeToken[] {
  const p = chokeLogPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as ChokeToken);
  } catch {
    return [];
  }
}

// ─── In-memory mutex state (per channel) ─────────────────────────────────────

/** Per-channel choke lock: { channel_id → active ChokeToken | null } */
const _chokeLocks = new Map<number, ChokeToken | null>();

function getChokeLock(channel_id: number): ChokeToken | null {
  if (!_chokeLocks.has(channel_id)) {
    // Restore from disk on first access
    const tokens = readChokeTokens();
    const active = tokens.find(
      (t) => t.channel_id === channel_id && !t.released_ts
    );
    _chokeLocks.set(channel_id, active ?? null);
  }
  return _chokeLocks.get(channel_id) ?? null;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface ChokeAcquireResult {
  success: boolean;
  token?: ChokeToken;
  error?: string;
  /** Who currently holds the lock if acquisition failed */
  current_holder?: string;
  current_direction?: ThoraxDirection;
}

/**
 * Attempt to acquire the choke-point mutex for a given channel + direction.
 * Returns success=false if choke is currently occupied (single-occupancy guarantee).
 *
 * "Both East-bound and West-bound chains cannot go simultaneously."
 */
export function acquireChoke(
  channel_id: number,
  direction: ThoraxDirection,
  holder_node_id: string
): ChokeAcquireResult {
  const existing = getChokeLock(channel_id);

  if (existing && !existing.released_ts) {
    return {
      success: false,
      error: `Choke point on channel ${channel_id} is occupied by direction=${existing.direction}. Wait for release + shift-to-side.`,
      current_holder: existing.holder_node_id,
      current_direction: existing.direction,
    };
  }

  const token: ChokeToken = {
    channel_id,
    direction,
    holder_node_id,
    acquired_ts: new Date().toISOString(),
  };

  _chokeLocks.set(channel_id, token);
  appendChoke(token);

  return { success: true, token };
}

export interface ChokeReleaseResult {
  success: boolean;
  token?: ChokeToken;
  error?: string;
  shift_to_side_ts?: string;
}

/**
 * Release the choke-point mutex for a given channel.
 * The "shift to the side" clearing action is recorded here —
 * this marks that the passed direction has cleared the choke point
 * and the reciprocal direction may now enter.
 *
 * Founder verbatim: "shifts to the side to allow the other direction
 *   to also advance into the choke point and move past as well."
 */
export function releaseChoke(
  channel_id: number,
  holder_node_id: string
): ChokeReleaseResult {
  const existing = getChokeLock(channel_id);

  if (!existing || existing.released_ts) {
    return {
      success: false,
      error: `No active choke token on channel ${channel_id} to release.`,
    };
  }

  if (existing.holder_node_id !== holder_node_id) {
    return {
      success: false,
      error: `Cannot release choke on channel ${channel_id}: holder mismatch. Current holder: ${existing.holder_node_id}.`,
    };
  }

  const shift_to_side_ts = new Date().toISOString();
  const released: ChokeToken = {
    ...existing,
    released_ts: shift_to_side_ts,
  };

  _chokeLocks.set(channel_id, null);
  appendChoke(released);

  return { success: true, token: released, shift_to_side_ts };
}

/**
 * Check if a channel's choke point is currently clear (no active holder).
 */
export function isChokeClear(channel_id: number): boolean {
  const lock = getChokeLock(channel_id);
  return !lock || !!lock.released_ts;
}

/**
 * Get the current choke token for a channel (null if clear).
 */
export function getActiveChokeToken(channel_id: number): ChokeToken | null {
  const lock = getChokeLock(channel_id);
  if (!lock || lock.released_ts) return null;
  return lock;
}

/**
 * Force-clear the choke (governance override only — use for stuck channels
 * prior to Angel of Death recording). Logs a special release with reason.
 */
export function forceReleaseStickyChoke(
  channel_id: number,
  reason: string,
  operator: string
): { released: boolean; log_id: string } {
  const log_id = createHash("sha256")
    .update(`force-choke-${channel_id}-${Date.now()}`)
    .digest("hex")
    .slice(0, 16);

  const existing = getChokeLock(channel_id);
  if (!existing || existing.released_ts) {
    return { released: false, log_id };
  }

  const forced: ChokeToken & { force_release?: boolean; force_reason?: string; force_operator?: string } = {
    ...existing,
    released_ts: new Date().toISOString(),
    force_release: true,
    force_reason: reason,
    force_operator: operator,
  };

  _chokeLocks.set(channel_id, null);
  appendChoke(forced as ChokeToken);

  return { released: true, log_id };
}

/**
 * Get status of all choke points (used by thorax_channel_status MCP tool).
 */
export function getAllChokeStatus(): Array<{
  channel_id: number;
  is_clear: boolean;
  direction?: ThoraxDirection;
  holder?: string;
  acquired_ts?: string;
}> {
  const result = [];
  for (let ch = 1; ch <= 12; ch++) {
    const lock = getChokeLock(ch);
    const is_clear = !lock || !!lock.released_ts;
    result.push({
      channel_id: ch,
      is_clear,
      direction:    is_clear ? undefined : lock?.direction,
      holder:       is_clear ? undefined : lock?.holder_node_id,
      acquired_ts:  is_clear ? undefined : lock?.acquired_ts,
    });
  }
  return result;
}

/** Generate a short hash id for this module. */
export function chokeTokenHash(token: ChokeToken): string {
  return createHash("sha256")
    .update(JSON.stringify(token))
    .digest("hex")
    .slice(0, 16);
}
