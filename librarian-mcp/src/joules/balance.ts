/**
 * Joules Balance — KN-M1 / BP018
 * ================================
 * Per-member balance computation from the append-only Joules ledger.
 *
 * Balance = received (mint + transfer-in) - sent (transfer-out) - redeemed
 *
 * Returns per-Joule face_value list for full transparency.
 * ONE-WAY VALVE: Marks converted to Joules can never be recovered as Marks.
 */

import { readAllJoulesEntries, type JoulesEntry } from "./ledger.js";

export interface JoulesBalance {
  member_id: string;
  total_face_value: number;
  joule_count: number;
  joules: Array<{ joule_uuid: string; face_value: number; last_tx: string }>;
}

/**
 * Compute the current Joules balance for a member.
 * Walks the full ledger; O(N) in ledger size.
 */
export function computeBalance(member_id: string): JoulesBalance {
  const entries = readAllJoulesEntries();

  // Track which Joule UUIDs are currently held by this member
  const holding = new Map<string, { face_value: number; last_tx: string }>();

  for (const entry of entries) {
    if (entry.tx_type === "mint" && entry.to_member_id === member_id) {
      holding.set(entry.joule_uuid, { face_value: entry.face_value, last_tx: entry.ts });
    } else if (entry.tx_type === "transfer") {
      if (entry.to_member_id === member_id) {
        // Received transfer — acquire with preserved face_value
        holding.set(entry.joule_uuid, { face_value: entry.face_value, last_tx: entry.ts });
      } else if (entry.from_member_id === member_id) {
        // Sent transfer — remove from holding
        holding.delete(entry.joule_uuid);
      }
    } else if (entry.tx_type === "redeem" && entry.from_member_id === member_id) {
      // Redeemed — remove from circulation
      holding.delete(entry.joule_uuid);
    }
  }

  const joules = Array.from(holding.entries()).map(([joule_uuid, { face_value, last_tx }]) => ({
    joule_uuid,
    face_value,
    last_tx,
  }));

  const total_face_value = joules.reduce((sum, j) => sum + j.face_value, 0);

  return {
    member_id,
    total_face_value,
    joule_count: joules.length,
    joules,
  };
}

/**
 * Get current holder of a Joule UUID (last transfer-in winner).
 */
export function getCurrentHolder(joule_uuid: string): string | undefined {
  const entries = readAllJoulesEntries().filter((e) => e.joule_uuid === joule_uuid);
  let holder: string | undefined;
  for (const entry of entries) {
    if (entry.tx_type === "mint") holder = entry.to_member_id;
    else if (entry.tx_type === "transfer") holder = entry.to_member_id;
    else if (entry.tx_type === "redeem") holder = undefined;
  }
  return holder;
}

/**
 * Check if a Joule is still in circulation (not redeemed).
 */
export function isInCirculation(joule_uuid: string): boolean {
  return getCurrentHolder(joule_uuid) !== undefined;
}

/**
 * Aggregate audit: total circulation, total minted, total redeemed.
 */
export interface JoulesAudit {
  total_minted: number;
  total_redeemed: number;
  total_in_circulation: number;
  total_face_value_minted: number;
  total_face_value_in_circulation: number;
  entry_count: number;
}

export function computeAudit(since?: string): JoulesAudit {
  const entries = readAllJoulesEntries().filter((e) => !since || e.ts >= since);

  const minted = new Map<string, number>();
  const redeemed = new Set<string>();

  for (const entry of entries) {
    if (entry.tx_type === "mint") {
      minted.set(entry.joule_uuid, entry.face_value);
    } else if (entry.tx_type === "redeem") {
      redeemed.add(entry.joule_uuid);
    }
  }

  const inCirculation = new Map<string, number>(
    Array.from(minted.entries()).filter(([uuid]) => !redeemed.has(uuid))
  );

  return {
    total_minted: minted.size,
    total_redeemed: redeemed.size,
    total_in_circulation: inCirculation.size,
    total_face_value_minted: Array.from(minted.values()).reduce((s, v) => s + v, 0),
    total_face_value_in_circulation: Array.from(inCirculation.values()).reduce((s, v) => s + v, 0),
    entry_count: entries.length,
  };
}
