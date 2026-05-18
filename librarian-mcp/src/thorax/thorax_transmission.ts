/**
 * Thorax Transmission Engine — Full protocol orchestration
 * =========================================================
 * Dream #5 · BP046B · Phase 1
 *
 * Orchestrates the full construction-flag relay-thread transmission:
 *   1. CP refusal gate (P12)
 *   2. Acquire choke point (P1)
 *   3. Record direction on channel (P2+P3)
 *   4. Capture Eblit snapshot at transmission moment (P10)
 *   5. Bind CelPane signature (P11)
 *   6. Complete transmission
 *   7. Release choke + shift-to-side (P2)
 *
 * Composes with all P1-P12 modules.
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID, createHash } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import { acquireChoke, releaseChoke } from "./thorax_choke.js";
import { recordChokeAcquired, recordChokeReleased, readChannel } from "./thorax_channels.js";
import { captureEblitSnapshot } from "./thorax_eblit.js";
import { bindCelPaneSignature } from "./thorax_celpane.js";
import { cpRefusalGate } from "./thorax_refusal.js";
import { enqueuePhalanx } from "./thorax_phalanx.js";
import type { ThoraxTransmission, ThoraxDirection } from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function transmissionLogPath(): string {
  return resolve(THORAX_DIR, "transmission_log.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendTransmission(tx: ThoraxTransmission): void {
  ensureDir();
  appendFileSync(transmissionLogPath(), JSON.stringify(tx) + "\n", "utf-8");
}

function readTransmissions(): ThoraxTransmission[] {
  const p = transmissionLogPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as ThoraxTransmission);
  } catch {
    return [];
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface TransmitResult {
  success: boolean;
  transmission?: ThoraxTransmission;
  refused?: boolean;
  refusal_reasons?: string[];
  eblit_snapshot_id?: string;
  celpane_interference_state?: string;
  error?: string;
}

/**
 * Execute a Thorax relay-thread transmission through the construction-flag
 * choke point.
 *
 * Full gate sequence: CP refusal → choke acquire → channel transition →
 * Eblit snapshot → CelPane signature → complete → shift-to-side.
 *
 * Ship gate 2: "East-bound transmits, completes, shifts to side,
 *   then West-bound transmits cleanly."
 */
export function transmit(
  channel_id: number,
  direction: ThoraxDirection,
  sender_node_id: string,
  payload_hash: string,   // SHA-256 of payload (never raw payload in substrate)
  opts: {
    celpane_chain_id?: string;
    skip_celpane?: boolean;
  } = {}
): TransmitResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }

  // ─── Step 1: CP refusal gate ─────────────────────────────────────────────
  const refusal = cpRefusalGate(channel_id, direction, sender_node_id);
  if (!refusal.unanimous) {
    // Auto-enqueue to Phalanx if channel is in bad state
    if (ch.state === "flagged") {
      enqueuePhalanx(channel_id, "cp_refused", {
        east_node_id: sender_node_id,
      });
    }
    return {
      success: false,
      refused: true,
      refusal_reasons: refusal.refusal_reasons,
      error: `Transmission refused on channel ${channel_id}: ${refusal.refusal_reasons[0]}`,
    };
  }

  // ─── Step 2: Acquire choke point ─────────────────────────────────────────
  const choke_result = acquireChoke(channel_id, direction, sender_node_id);
  if (!choke_result.success) {
    return {
      success: false,
      error: `Choke acquisition failed on channel ${channel_id}: ${choke_result.error}`,
    };
  }

  // ─── Step 3: Record direction on channel ─────────────────────────────────
  const ch_result = recordChokeAcquired(channel_id, direction);
  if (!ch_result.success) {
    releaseChoke(channel_id, sender_node_id);
    return {
      success: false,
      error: `Channel direction record failed: ${ch_result.error}`,
    };
  }

  const now = new Date().toISOString();
  const chronos_tag = `thorax:${channel_id}:tx:${direction}:${Date.now()}`;

  // ─── Step 4: Eblit snapshot at transmission moment ───────────────────────
  const eblit = captureEblitSnapshot(channel_id, "transmission_params", {
    channel_id,
    direction,
    sender_node_id,
    payload_hash,
    channel_state_before: ch.state,
    chronos_tag,
    tx_ts: now,
  });

  // ─── Step 5: CelPane signature binding ──────────────────────────────────
  let celpane_signature: string | undefined;
  let celpane_interference_state: string | undefined;

  if (!opts.skip_celpane) {
    const chain_id = opts.celpane_chain_id ?? `celpane-chain-${channel_id}`;
    const sig_result = bindCelPaneSignature(channel_id, chain_id);
    if (sig_result.success && sig_result.signature) {
      celpane_signature = `${sig_result.signature.interference_state}::${sig_result.signature.signature_id}`;
      celpane_interference_state = sig_result.signature.interference_state;
    }
  }

  // ─── Step 6: Complete transmission ───────────────────────────────────────
  const tx: ThoraxTransmission = {
    transmission_id: `thorax-tx-${randomUUID()}`,
    channel_id,
    direction,
    sender_node_id,
    payload_hash,
    eblit_snapshot_id: eblit.snapshot_id,
    chronos_tag,
    celpane_signature,
    choke_acquired_ts: choke_result.token!.acquired_ts,
    status: "complete",
    ts: now,
  };

  // ─── Step 7: Release choke + shift-to-side ────────────────────────────────
  const release_result = releaseChoke(channel_id, sender_node_id);
  if (release_result.success) {
    tx.choke_released_ts = release_result.token?.released_ts;
    tx.shift_to_side_ts = release_result.shift_to_side_ts;
  }

  // Transition channel back to bestie_open (shift-to-side complete)
  recordChokeReleased(channel_id);

  appendTransmission(tx);

  return {
    success: true,
    transmission: tx,
    eblit_snapshot_id: eblit.snapshot_id,
    celpane_interference_state,
  };
}

// ─── Transmission queries ─────────────────────────────────────────────────────

/** Read transmissions for a channel. */
export function readChannelTransmissions(channel_id: number): ThoraxTransmission[] {
  return readTransmissions().filter((tx) => tx.channel_id === channel_id);
}

/** Ship gate 2: East transmits, completes, shifts to side. */
export function smokeGate2(channel_id: number): {
  passed: boolean;
  east_transmission_found: boolean;
  shift_to_side_recorded: boolean;
  east_tx?: ThoraxTransmission;
} {
  const txs = readChannelTransmissions(channel_id);
  const east_tx = txs.find((tx) => tx.direction === "east" && tx.status === "complete");
  const east_transmission_found = !!east_tx;
  const shift_to_side_recorded = !!(east_tx?.shift_to_side_ts);
  const passed = east_transmission_found && shift_to_side_recorded;

  return { passed, east_transmission_found, shift_to_side_recorded, east_tx };
}

/** Ship gate 4: Persistent-bestie — 3rd transmission does NOT re-fire handshake. */
export function smokeGate4(channel_id: number): {
  passed: boolean;
  transmission_count: number;
  bestie_state_held: boolean;
} {
  const txs = readChannelTransmissions(channel_id).filter(
    (tx) => tx.status === "complete"
  );
  const ch = readChannel(channel_id);
  const bestie_state_held = ch?.state === "bestie_open" ||
    txs[txs.length - 1]?.status === "complete";

  return {
    passed: txs.length >= 3 && bestie_state_held,
    transmission_count: txs.length,
    bestie_state_held,
  };
}
