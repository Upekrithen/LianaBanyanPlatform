/**
 * Joules Serial Allocator — KN-M1 / BP018
 * ========================================
 * Allocates LB-JOULES-NNNN serials from a persistent JSON counter file.
 * Stored in stitchpunks/joules/ alongside the ledger.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_j = dirname(__filename);

export const STITCHPUNKS_DIR = resolve(__dirname_j, "../../stitchpunks");
export const JOULES_DIR = resolve(STITCHPUNKS_DIR, "joules");
const JOULES_SERIAL_COUNTER = resolve(JOULES_DIR, "joules_serial_counter.json");

export function ensureJoulesDir(): void {
  if (!existsSync(JOULES_DIR)) mkdirSync(JOULES_DIR, { recursive: true });
}

interface JoulesCounter {
  next: number;
}

function readCounter(): JoulesCounter {
  ensureJoulesDir();
  if (!existsSync(JOULES_SERIAL_COUNTER)) return { next: 1 };
  try {
    return JSON.parse(readFileSync(JOULES_SERIAL_COUNTER, "utf-8")) as JoulesCounter;
  } catch {
    return { next: 1 };
  }
}

/**
 * Allocate the next Joules serial.
 * Format: LB-JOULES-NNNN (zero-padded to 4 digits, grows beyond 9999 naturally)
 */
export function allocateJoulesSerial(): string {
  ensureJoulesDir();
  const counter = readCounter();
  const serial = `LB-JOULES-${String(counter.next).padStart(4, "0")}`;
  writeFileSync(JOULES_SERIAL_COUNTER, JSON.stringify({ next: counter.next + 1 }, null, 2), "utf-8");
  return serial;
}
