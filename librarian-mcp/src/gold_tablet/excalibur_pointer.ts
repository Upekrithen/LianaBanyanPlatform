/**
 * Gold Tablet ↔ Excalibur Bidirectional Ledger Pointer — KN-N2 / BP018 Pod N
 * =============================================================================
 * Excalibur derives FROM Gold via ledger-pointer.
 * Invariants:
 *   - Excalibur instances are READ-ONLY against Gold (cannot mutate)
 *   - Gold supersession cascade-marks dependent Excalibur as `needs_re_anchor`
 *   - Both directions are stored in a dedicated JSONL ledger
 */

import { existsSync, appendFileSync, readFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";
import { appendExcaliburPointer } from "./ledger.js";

const GOLD_DIR = resolve(homedir(), ".claude", "state", "gold_tablet");
const POINTER_LEDGER = resolve(GOLD_DIR, "excalibur_pointers.jsonl");

function ensureDir(): void {
  if (!existsSync(GOLD_DIR)) mkdirSync(GOLD_DIR, { recursive: true });
}

export interface ExcaliburPointerEntry {
  gold_tablet_id: string;
  excalibur_id: string;
  linked_at: string;
  excalibur_status: "anchored" | "needs_re_anchor";
}

function readPointers(): ExcaliburPointerEntry[] {
  if (!existsSync(POINTER_LEDGER)) return [];
  try {
    return readFileSync(POINTER_LEDGER, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as ExcaliburPointerEntry);
  } catch {
    return [];
  }
}

function appendPointer(entry: ExcaliburPointerEntry): void {
  ensureDir();
  appendFileSync(POINTER_LEDGER, JSON.stringify(entry) + "\n", "utf-8");
}

export interface LinkResult {
  success: boolean;
  entry?: ExcaliburPointerEntry;
  error?: string;
}

/**
 * Create a bidirectional pointer between a Gold Tablet and an Excalibur Class instance.
 * Appends to the pointer ledger AND updates the Gold Tablet's excalibur_pointers array.
 */
export function linkExcaliburToGold(gold_tablet_id: string, excalibur_id: string): LinkResult {
  try {
    const entry: ExcaliburPointerEntry = {
      gold_tablet_id,
      excalibur_id,
      linked_at: new Date().toISOString(),
      excalibur_status: "anchored",
    };
    appendPointer(entry);
    appendExcaliburPointer(gold_tablet_id, excalibur_id);
    return { success: true, entry };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Get all Excalibur pointers for a given Gold Tablet.
 * Returns latest-per-excalibur_id (last write wins for status).
 */
export function getExcaliburPointers(gold_tablet_id: string): ExcaliburPointerEntry[] {
  const all = readPointers().filter((p) => p.gold_tablet_id === gold_tablet_id);
  // Latest-per-excalibur_id
  const map = new Map<string, ExcaliburPointerEntry>();
  for (const entry of all) {
    map.set(entry.excalibur_id, entry);
  }
  return Array.from(map.values());
}

/**
 * Get all Gold Tablet pointers for a given Excalibur instance.
 */
export function getGoldTabletsForExcalibur(excalibur_id: string): ExcaliburPointerEntry[] {
  const all = readPointers().filter((p) => p.excalibur_id === excalibur_id);
  const map = new Map<string, ExcaliburPointerEntry>();
  for (const entry of all) {
    map.set(entry.gold_tablet_id, entry);
  }
  return Array.from(map.values());
}

/**
 * Mark all Excalibur instances pointing to a Gold Tablet as `needs_re_anchor`.
 * Called by supersession_cascade when a Gold Tablet is superseded.
 */
export function markExcaliburNeedsReAnchor(gold_tablet_id: string): string[] {
  const pointers = getExcaliburPointers(gold_tablet_id);
  const affected: string[] = [];
  for (const p of pointers) {
    if (p.excalibur_status === "anchored") {
      const updated: ExcaliburPointerEntry = {
        ...p,
        excalibur_status: "needs_re_anchor",
        linked_at: new Date().toISOString(),
      };
      appendPointer(updated);
      affected.push(p.excalibur_id);
    }
  }
  return affected;
}
