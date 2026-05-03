/**
 * On Deck Scribe — Substrate Write-Back — KN-Q3 / BP018
 * =======================================================
 * Wires every On Deck Scribe state-transition to:
 *   1. Pheromone provenance ledger (ODS-class serial + Chronos HMAC)
 *   2. Local-log retry queue (BRIDLE Rule 4 fallback)
 *
 * Event classes:
 *   append        — new K-prompt entered queue
 *   mark_in_flight
 *   mark_landed
 *   mark_errored
 *   mark_deferred
 *   attach_prepared_context
 *   attach_bee_canon_marks
 *
 * FORK compliance: no fiat bridge. Marks attribution recorded as Marks-class only.
 * BRIDLE Rule 4: substrate failure → retry queue, never silent loss.
 *
 * Composes with:
 *   KN-Q1 writer.ts — registers this module's writeBackOnDeckEvent as callback
 *   KN-Q2 MCP tools — every mutation triggers write-back automatically
 *   KN104 provenance_chain.ts (5e7f540) — Chronos HMAC discipline
 */

import { existsSync, mkdirSync, appendFileSync } from "fs";
import { createHmac } from "crypto";
import { ODS_DIR, type OnDeckEntry } from "./state_file.js";

// ─── Pheromone substrate paths ────────────────────────────────────────────────

export const ODS_PHEROMONE_LEDGER = ODS_DIR + "/pheromone_ledger.jsonl";
const ODS_RETRY_QUEUE = ODS_DIR + "/retry_queue.jsonl";

function ensureOdsDir(): void {
  if (!existsSync(ODS_DIR)) mkdirSync(ODS_DIR, { recursive: true });
}

// ─── ODS provenance serial ─────────────────────────────────────────────────────
// Lightweight counter — uses ODS_DIR/ods_pheromone_serial.txt

import { readFileSync, writeFileSync } from "fs";
const ODS_PHEROMONE_SERIAL = ODS_DIR + "/ods_pheromone_serial.txt";

let _pheromoneSerial = 0;
let _serialLoaded = false;

function allocatePheroSerial(): string {
  ensureOdsDir();
  if (!_serialLoaded) {
    try {
      _pheromoneSerial = parseInt(readFileSync(ODS_PHEROMONE_SERIAL, "utf-8").trim(), 10) || 0;
    } catch { _pheromoneSerial = 0; }
    _serialLoaded = true;
  }
  _pheromoneSerial++;
  writeFileSync(ODS_PHEROMONE_SERIAL, String(_pheromoneSerial), "utf-8");
  return `LB-ODS.PH-${String(_pheromoneSerial).padStart(4, "0")}`;
}

// ─── Chronos HMAC ─────────────────────────────────────────────────────────────

function computeChronosHmac(payload: string, timestamp: string): string {
  const key = `lb-ods-chronos-${timestamp.slice(0, 10)}`;
  return createHmac("sha256", key).update(payload).digest("hex").slice(0, 16);
}

// ─── Pheromone entry schema ────────────────────────────────────────────────────

export type OdsPheromoneEntry = {
  provenance_class: "on_deck_scribe_state_transition";
  pheromone_serial: string;          // LB-ODS.PH-NNNN
  chronos_hmac: string;              // tamper-evidence (16-char hex)
  timestamp: string;                 // ISO-8601

  entry_id: string;                  // OnDeckEntry.id
  transition_type: string;           // append / mark_in_flight / etc.
  entry_category: string;
  entry_status: string;
  entry_k_prompt_path: string;
  entry_pod_class: string | null;
  entry_priority: number;

  prepared_context_shadow_id?: string;
  bee_canon_attribution?: object;
  commit_hash?: string;
  error_reason?: string;
};

// ─── Main write-back function ──────────────────────────────────────────────────

/**
 * Write a Pheromone provenance entry for every On Deck Scribe state transition.
 * Called by writer.ts via the registered write-back hook (KN-Q1 registerWriteBack).
 * BRIDLE Rule 4: substrate failure → retry queue append, never silent loss.
 */
export function writeBackOnDeckEvent(entry: OnDeckEntry, transition_type: string): void {
  const timestamp = new Date().toISOString();
  const serial = allocatePheroSerial();

  const payload: OdsPheromoneEntry = {
    provenance_class: "on_deck_scribe_state_transition",
    pheromone_serial: serial,
    chronos_hmac: "",
    timestamp,
    entry_id: entry.id,
    transition_type,
    entry_category: entry.category,
    entry_status: entry.status,
    entry_k_prompt_path: entry.k_prompt_path,
    entry_pod_class: entry.pod_class ?? null,
    entry_priority: entry.priority,
    ...(entry.prepared_context ? { prepared_context_shadow_id: entry.prepared_context.shadow_id } : {}),
    ...(entry.bee_canon_attribution ? { bee_canon_attribution: entry.bee_canon_attribution } : {}),
    ...(entry.commit_hash ? { commit_hash: entry.commit_hash } : {}),
    ...(entry.error_reason ? { error_reason: entry.error_reason } : {}),
  };

  const payloadStr = JSON.stringify(payload);
  payload.chronos_hmac = computeChronosHmac(payloadStr, timestamp);

  try {
    ensureOdsDir();
    appendFileSync(ODS_PHEROMONE_LEDGER, JSON.stringify(payload) + "\n", "utf-8");
  } catch (err) {
    // BRIDLE Rule 4: substrate unavailable → retry queue
    try {
      appendFileSync(ODS_RETRY_QUEUE, JSON.stringify({ ...payload, retry_reason: String(err) }) + "\n", "utf-8");
    } catch {
      // Retry queue also failed — last-resort console warning only (never silent drop)
      console.warn("[ODS-Substrate] BRIDLE Rule 4 retry queue write failed:", String(err));
    }
  }
}

// ─── Provenance query ──────────────────────────────────────────────────────────

/**
 * Read ODS pheromone ledger entries.
 * Returns up to `limit` most recent entries (default: 100).
 */
export function readOdsPheromoneEntries(limit = 100): OdsPheromoneEntry[] {
  try {
    if (!existsSync(ODS_PHEROMONE_LEDGER)) return [];
    const raw = readFileSync(ODS_PHEROMONE_LEDGER, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim());
    return lines
      .slice(-limit)
      .map((l) => {
        try { return JSON.parse(l) as OdsPheromoneEntry; } catch { return null; }
      })
      .filter((e): e is OdsPheromoneEntry => e !== null);
  } catch {
    return [];
  }
}

/**
 * Verify Chronos HMAC round-trips clean for an entry.
 */
export function verifyChronosHmac(pheroEntry: OdsPheromoneEntry): boolean {
  const { chronos_hmac, timestamp, ...rest } = pheroEntry;
  const payloadStr = JSON.stringify({ ...rest, chronos_hmac: "", timestamp });
  const expected = computeChronosHmac(payloadStr, timestamp);
  // Note: HMAC key is deterministic per UTC day — verify with same method
  // We recompute from the stripped payload (matching the original serialization order closely)
  // For audit purposes, verify via re-creation:
  const alt = computeChronosHmac(JSON.stringify({ provenance_class: pheroEntry.provenance_class, pheromone_serial: pheroEntry.pheromone_serial, chronos_hmac: "", timestamp, entry_id: pheroEntry.entry_id, transition_type: pheroEntry.transition_type, entry_category: pheroEntry.entry_category, entry_status: pheroEntry.entry_status, entry_k_prompt_path: pheroEntry.entry_k_prompt_path, entry_pod_class: pheroEntry.entry_pod_class, entry_priority: pheroEntry.entry_priority }), timestamp);
  return chronos_hmac.length === 16 && chronos_hmac === alt;
}
