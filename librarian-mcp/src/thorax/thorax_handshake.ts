/**
 * Thorax Pheromone Handshake + Persistent-Bestie State — P4 + P6
 * ===============================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P4: Pheromone-handshake (reciprocal-accept) initial establishment.
 *     "Both hands empty of gun at same time — called pheromone handshake
 *     and uses Eblets to confirm simultaneously (say it together)."
 *
 * P6: Persistent-bestie state.
 *     Once handshake establishes relay thread, stays open under continuous
 *     external confirmation. Airport-secure-zone analog: once cleared, fly
 *     anywhere within the bonded substrate without re-clearing.
 *
 * Composes with:
 *   - Pheromone substrate (pheromone.ts emitPheromone)
 *   - thorax_channels.ts (transitionChannel)
 *   - thorax_types.ts (PheromoneHandshakeRecord)
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import { transitionChannel, readChannel } from "./thorax_channels.js";
import type { PheromoneHandshakeRecord } from "./thorax_types.js";
import { emitPheromone } from "../scribes/pheromone.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function handshakeLedgerPath(): string {
  return resolve(THORAX_DIR, "handshake_ledger.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendHandshake(record: PheromoneHandshakeRecord): void {
  ensureDir();
  appendFileSync(handshakeLedgerPath(), JSON.stringify(record) + "\n", "utf-8");
}

function readHandshakes(): PheromoneHandshakeRecord[] {
  const p = handshakeLedgerPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as PheromoneHandshakeRecord);
  } catch {
    return [];
  }
}

/** Latest record per handshake_id. */
function latestHandshakes(): Map<string, PheromoneHandshakeRecord> {
  const all = readHandshakes();
  const map = new Map<string, PheromoneHandshakeRecord>();
  for (const r of all) map.set(r.handshake_id, r);
  return map;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface HandshakeInitiateResult {
  success: boolean;
  record?: PheromoneHandshakeRecord;
  error?: string;
}

/**
 * P4 Step 1: Initiate a pheromone handshake on a channel.
 * East node declares intent. Channel moves to handshake_pending.
 *
 * The handshake is NOT complete until BOTH nodes accept simultaneously.
 * "Both hands empty of gun — say it together."
 */
export function initiateHandshake(
  channel_id: number,
  east_node_id: string,
  west_node_id: string
): HandshakeInitiateResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }
  if (ch.state !== "uninitialized") {
    return {
      success: false,
      error: `Channel ${channel_id} is already in state=${ch.state}. Cannot re-initiate handshake.`,
    };
  }

  const handshake_id = `thorax-hs-${randomUUID()}`;
  const pheromone_topic = `thorax:channel:${channel_id}:handshake`;

  const record: PheromoneHandshakeRecord = {
    handshake_id,
    channel_id,
    east_node_id,
    west_node_id,
    east_accepted_ts: new Date().toISOString(),
    reciprocal_complete: false,
    pheromone_topic,
  };

  appendHandshake(record);

  // Transition channel to handshake_pending
  const transition = transitionChannel(channel_id, "handshake_pending", {
    east_node_id,
    west_node_id,
  });

  if (!transition.success) {
    return { success: false, error: `Channel transition failed: ${transition.error}` };
  }

  // Emit pheromone signal — West node subscribes to this topic to complete handshake
  emitPheromone(
    "ThoraxHandshake",
    handshake_id,
    `Thorax channel ${channel_id} handshake initiated by ${east_node_id} awaiting ${west_node_id}. Topic: ${pheromone_topic}`,
    {
      cathedral: "bishop",
      flavorClass: { cognition: "building-in-public", audience: "knight-build" },
    }
  );

  return { success: true, record };
}

export interface HandshakeAcceptResult {
  success: boolean;
  record?: PheromoneHandshakeRecord;
  bestie_established?: boolean;
  error?: string;
}

/**
 * P4 Step 2: West node accepts the handshake.
 * When BOTH have accepted → reciprocal_complete=true → channel enters bestie_open.
 *
 * "Data intertwined but not mixed." — Founder BP046B
 */
export function acceptHandshake(
  handshake_id: string,
  accepting_node_id: string
): HandshakeAcceptResult {
  const map = latestHandshakes();
  const record = map.get(handshake_id);

  if (!record) {
    return { success: false, error: `Handshake ${handshake_id} not found.` };
  }
  if (record.reciprocal_complete) {
    return { success: false, error: `Handshake ${handshake_id} already completed.` };
  }
  if (
    accepting_node_id !== record.west_node_id &&
    accepting_node_id !== record.east_node_id
  ) {
    return {
      success: false,
      error: `Node ${accepting_node_id} is not a participant in handshake ${handshake_id}.`,
    };
  }

  const now = new Date().toISOString();
  const updated: PheromoneHandshakeRecord = { ...record };

  if (accepting_node_id === record.west_node_id) {
    updated.west_accepted_ts = now;
  }

  // Check reciprocal-complete: both must have accepted
  const eastOk = !!(updated.east_accepted_ts);
  const westOk = !!(updated.west_accepted_ts);
  const both_complete = eastOk && westOk;

  if (both_complete) {
    updated.reciprocal_complete = true;
    updated.completed_ts = now;
  }

  appendHandshake(updated);

  if (both_complete) {
    // P6: Establish persistent-bestie state
    // Airport-secure-zone: once cleared, remains open under continuous confirmation
    const bestie_result = transitionChannel(
      record.channel_id,
      "bestie_open",
      {
        east_node_id: record.east_node_id,
        west_node_id: record.west_node_id,
        bestie_since: now,
        last_confirmed_ts: now,
      }
    );

    if (!bestie_result.success) {
      return {
        success: false,
        error: `Handshake complete but bestie transition failed: ${bestie_result.error}`,
      };
    }

    // Emit bestie-established pheromone
    emitPheromone(
      "ThoraxBestie",
      `bestie-${record.channel_id}-${now}`,
      `Thorax channel ${record.channel_id} bestie established: ${record.east_node_id} ↔ ${record.west_node_id}. Persistent-bestie open. Airport-secure-zone active.`,
      {
        cathedral: "bishop",
        flavorClass: { cognition: "building-in-public", audience: "knight-build" },
      }
    );

    return { success: true, record: updated, bestie_established: true };
  }

  return { success: true, record: updated, bestie_established: false };
}

// ─── Handshake queries ────────────────────────────────────────────────────────

/** Look up a handshake by ID. */
export function readHandshake(handshake_id: string): PheromoneHandshakeRecord | null {
  return latestHandshakes().get(handshake_id) ?? null;
}

/** Find active (pending, non-complete) handshake for a channel. */
export function findPendingHandshakeForChannel(
  channel_id: number
): PheromoneHandshakeRecord | null {
  const all = Array.from(latestHandshakes().values());
  return (
    all.find(
      (r) => r.channel_id === channel_id && !r.reciprocal_complete
    ) ?? null
  );
}

/** Find the completed handshake for a bestie_open channel. */
export function findBestieHandshakeForChannel(
  channel_id: number
): PheromoneHandshakeRecord | null {
  const all = Array.from(latestHandshakes().values());
  return (
    all.find(
      (r) => r.channel_id === channel_id && r.reciprocal_complete
    ) ?? null
  );
}

// ─── Ship gate 1: handshake smoke test ────────────────────────────────────────

/**
 * Ship gate 1 verification:
 * "Two nodes (Bishop laptop + Knight laptop) successfully handshake.
 *  Only one direction transmits at a time."
 *
 * Returns gate result for smoke testing.
 */
export function smokeGate1(channel_id: number): {
  passed: boolean;
  handshake_complete: boolean;
  channel_state: string;
  bestie_since?: string;
} {
  const ch = readChannel(channel_id);
  const hs = findBestieHandshakeForChannel(channel_id);

  const handshake_complete = !!(hs?.reciprocal_complete);
  const channel_state = ch?.state ?? "not_found";
  const passed = handshake_complete && channel_state === "bestie_open";

  return {
    passed,
    handshake_complete,
    channel_state,
    bestie_since: ch?.bestie_since,
  };
}
