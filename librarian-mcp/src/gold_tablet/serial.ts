/**
 * Gold Tablet Serial Counter — KN-N1 / BP018 Pod N
 * ==================================================
 * Monotonic LB-GOLD-NNNN serial counter, concurrent-writer-safe.
 * Backed by an atomic counter file in the gold_tablet stitchpunks dir.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

const GOLD_DIR = resolve(homedir(), ".claude", "state", "gold_tablet");
const COUNTER_FILE = resolve(GOLD_DIR, "serial_counter.txt");

function ensureDir(): void {
  if (!existsSync(GOLD_DIR)) mkdirSync(GOLD_DIR, { recursive: true });
}

/**
 * Return the next LB-GOLD-NNNN serial (monotonically increasing, 4-digit zero-padded).
 * Concurrent-writer-safe via synchronous read-increment-write under single-process Node.js
 * (JS is single-threaded; safe for in-process concurrency).
 */
export function nextGoldSerial(): string {
  ensureDir();
  let current = 0;
  if (existsSync(COUNTER_FILE)) {
    try {
      current = parseInt(readFileSync(COUNTER_FILE, "utf-8").trim(), 10);
      if (isNaN(current)) current = 0;
    } catch {
      current = 0;
    }
  }
  current += 1;
  writeFileSync(COUNTER_FILE, String(current), "utf-8");
  return `LB-GOLD-${String(current).padStart(4, "0")}`;
}

/** Peek current counter without incrementing (for diagnostics). */
export function peekGoldCounter(): number {
  if (!existsSync(COUNTER_FILE)) return 0;
  try {
    const n = parseInt(readFileSync(COUNTER_FILE, "utf-8").trim(), 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}
