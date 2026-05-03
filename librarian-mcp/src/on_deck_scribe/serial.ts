/**
 * On Deck Scribe — Serial Counter — KN-Q1 / BP018
 * ================================================
 * Monotonic LB-ODS-NNNN counter at ~/.claude/state/on_deck_scribe/serial.txt.
 * Uses in-process mutex to prevent duplicate serials under concurrent callers.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { ODS_DIR, ODS_SERIAL } from "./state_file.js";

function ensureOdsDir(): void {
  if (!existsSync(ODS_DIR)) mkdirSync(ODS_DIR, { recursive: true });
}

// In-process mutex — serializes counter increments under Promise.all concurrency
let serialTail: Promise<unknown> = Promise.resolve();

/**
 * Allocate the next LB-ODS-NNNN serial.
 * Thread-safe: in-process mutex prevents duplicates under concurrent calls.
 */
export async function allocateOdsSerial(): Promise<string> {
  let release!: () => void;
  const mySlot = new Promise<void>((r) => { release = r; });
  const prev = serialTail;
  serialTail = mySlot;

  await prev;
  try {
    ensureOdsDir();
    let current = 0;
    if (existsSync(ODS_SERIAL)) {
      const raw = readFileSync(ODS_SERIAL, "utf-8").trim();
      current = parseInt(raw, 10) || 0;
    }
    const next = current + 1;
    writeFileSync(ODS_SERIAL, String(next), "utf-8");
    return `LB-ODS-${String(next).padStart(4, "0")}`;
  } finally {
    release();
  }
}
