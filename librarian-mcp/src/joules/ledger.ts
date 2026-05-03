/**
 * Joules Ledger — KN-M1 / BP018
 * ==============================
 * Append-only JSONL ledger for Layer 7 Forever-Stamp Joules currency.
 *
 * Forever-Stamp invariant (canonical):
 *   face_value is IMMUTABLE once minted for the lifetime of the Joule.
 *   Transfers preserve face_value exactly.
 *   Redemption removes the Joule from circulation.
 *
 * HMAC + Chronos signing at every write (same pattern as KN-J1 Jar sealing).
 * Pheromone Pixie-Dust emitted on every append.
 *
 * Storage: stitchpunks/joules/joules_ledger.jsonl
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { createHmac, randomUUID } from "crypto";
import { JOULES_DIR, ensureJoulesDir, allocateJoulesSerial } from "./serial.js";
import { emitPheromone } from "../scribes/pheromone.js";

// ─── Paths ────────────────────────────────────────────────────────────────────

export const JOULES_LEDGER = resolve(JOULES_DIR, "joules_ledger.jsonl");

// ─── Schema ──────────────────────────────────────────────────────────────────

export type JoulesEntryType = "mint" | "transfer" | "redeem";

export interface JoulesEntry {
  id: string;                            // LB-JOULES-NNNN serial
  joule_uuid: string;                    // UUID v4 — stable identity across transfers
  tx_type: JoulesEntryType;
  face_value: number;                    // IMMUTABLE once minted (forever-stamp semantics)
  minted_from_marks?: number;            // Marks-surplus consumed (mint only)
  mark_backing_rule_pointer?: string;    // Gold tablet ID (Pod-N) cited as canonical backing rule
  from_member_id?: string;               // null for mint
  to_member_id: string;                  // recipient
  redemption_target?: string;            // civilization-class work descriptor (redeem only)
  ts: string;                            // ISO-8601 + Chronos
  hmac_signature: string;
}

// ─── Mutation-rejection error ─────────────────────────────────────────────────

export class ForeverStampViolation extends Error {
  constructor(joule_uuid: string, field: string) {
    super(
      `Forever-stamp violation: attempted to mutate field '${field}' on Joule ${joule_uuid}. ` +
      "face_value is IMMUTABLE once minted. Per FORK doctrine: forever-stamp Joules cannot be altered."
    );
    this.name = "ForeverStampViolation";
  }
}

// ─── HMAC ─────────────────────────────────────────────────────────────────────

export function computeJoulesHmac(id: string, joule_uuid: string, ts: string, face_value: number): string {
  const key = `lb-joules-chronos-${ts.slice(0, 10)}`;
  const payload = `${id}::${joule_uuid}::${face_value}::${ts}`;
  return createHmac("sha256", key).update(payload).digest("hex").slice(0, 16);
}

export function verifyJoulesHmac(entry: JoulesEntry): boolean {
  const expected = computeJoulesHmac(entry.id, entry.joule_uuid, entry.ts, entry.face_value);
  return entry.hmac_signature === expected;
}

// ─── Ledger write ─────────────────────────────────────────────────────────────

export interface AppendJoulesOpts {
  joule_uuid: string;
  tx_type: JoulesEntryType;
  face_value: number;
  minted_from_marks?: number;
  mark_backing_rule_pointer?: string;
  from_member_id?: string;
  to_member_id: string;
  redemption_target?: string;
}

export function appendJoulesEntry(opts: AppendJoulesOpts): JoulesEntry {
  ensureJoulesDir();

  const id = allocateJoulesSerial();
  const ts = new Date().toISOString();
  const hmac_signature = computeJoulesHmac(id, opts.joule_uuid, ts, opts.face_value);

  const entry: JoulesEntry = {
    id,
    joule_uuid: opts.joule_uuid,
    tx_type: opts.tx_type,
    face_value: opts.face_value,
    ts,
    hmac_signature,
    to_member_id: opts.to_member_id,
    ...(opts.minted_from_marks !== undefined ? { minted_from_marks: opts.minted_from_marks } : {}),
    ...(opts.mark_backing_rule_pointer ? { mark_backing_rule_pointer: opts.mark_backing_rule_pointer } : {}),
    ...(opts.from_member_id ? { from_member_id: opts.from_member_id } : {}),
    ...(opts.redemption_target ? { redemption_target: opts.redemption_target } : {}),
  };

  appendFileSync(JOULES_LEDGER, JSON.stringify(entry) + "\n", "utf-8");

  // Pheromone Pixie-Dust
  emitPheromone(
    "JoulesLedger",
    entry.id,
    `joules ${entry.tx_type} face_value:${entry.face_value} to:${entry.to_member_id} forever-stamp layer-7-currency`,
    { cathedral: "knight", flavorClass: { domain: "joules", cognition: "building-in-public" } }
  );

  return entry;
}

// ─── Ledger read ──────────────────────────────────────────────────────────────

export function readAllJoulesEntries(): JoulesEntry[] {
  ensureJoulesDir();
  if (!existsSync(JOULES_LEDGER)) return [];
  try {
    const raw = readFileSync(JOULES_LEDGER, "utf-8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as JoulesEntry);
  } catch {
    return [];
  }
}

/**
 * Get all ledger entries for a specific Joule UUID (its full tx history).
 */
export function getJoulesHistory(joule_uuid: string): JoulesEntry[] {
  return readAllJoulesEntries().filter((e) => e.joule_uuid === joule_uuid);
}

/**
 * Get the mint entry for a Joule UUID (always the first "mint" tx).
 */
export function getMintEntry(joule_uuid: string): JoulesEntry | undefined {
  return readAllJoulesEntries().find((e) => e.joule_uuid === joule_uuid && e.tx_type === "mint");
}

/**
 * Get the canonical face_value for a Joule UUID from its mint record.
 * Forever-stamp: this never changes.
 */
export function getCanonicalFaceValue(joule_uuid: string): number | undefined {
  return getMintEntry(joule_uuid)?.face_value;
}

/**
 * Assert forever-stamp invariant: all entries for a Joule must have the same face_value
 * as the mint entry. Throws ForeverStampViolation if not.
 */
export function assertForeverStampInvariant(joule_uuid: string): void {
  const history = getJoulesHistory(joule_uuid);
  if (history.length === 0) return;
  const mintEntry = history.find((e) => e.tx_type === "mint");
  if (!mintEntry) return;
  const canonical = mintEntry.face_value;
  for (const entry of history) {
    if (entry.face_value !== canonical) {
      throw new ForeverStampViolation(joule_uuid, "face_value");
    }
  }
}
