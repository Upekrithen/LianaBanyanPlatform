/**
 * Provenance Chain — ROOT-Lineage Tracking for Miner Outputs (KN104 / BP016)
 * ===========================================================================
 * Cathedral-prefixed serial-number scheme for Miner lineage.
 * Every daughter Miner traces back to its Root Miner via this chain.
 *
 * Serial format: LB-CAT.<origin>-<zero-padded-seq>[.<suffix>]
 *   origin = cathedral identifier (M=bishop, K=knight, P=pawn, X=cross-cathedral)
 *   seq    = monotonically increasing per-cathedral counter (4 digits)
 *   suffix = lineage depth marker (a, b, c, ..., aa, ab, ...)
 *
 * Examples:
 *   LB-CAT.M-0042        — Root Miner #42 from bishop cathedral
 *   LB-CAT.M-0042.a      — first halved daughter of LB-CAT.M-0042
 *   LB-CAT.M-0042.a.b    — second-generation daughter
 *   LB-CAT.K-0007        — Root Miner #7 from knight cathedral
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { ProvenanceChain, ProvenanceChainEntry } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Storage ──────────────────────────────────────────────────────────────

const STITCHPUNKS_DIR =
  process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");

const PROVENANCE_DIR = resolve(STITCHPUNKS_DIR, "miners", "provenance");
const SERIAL_COUNTER_PATH = resolve(PROVENANCE_DIR, "serial_counters.json");
const PROVENANCE_LEDGER_PATH = resolve(PROVENANCE_DIR, "provenance_chain.jsonl");

function ensureProvDir(): void {
  if (!existsSync(PROVENANCE_DIR)) {
    mkdirSync(PROVENANCE_DIR, { recursive: true });
  }
}

// ─── Cathedral Code Mapping ────────────────────────────────────────────────

const CATHEDRAL_CODE: Record<string, string> = {
  bishop: "M",
  knight: "K",
  pawn:   "P",
  cross:  "X",
};

// ─── Serial Counter Management ────────────────────────────────────────────

interface SerialCounters {
  [cathedral: string]: number;
}

function readCounters(): SerialCounters {
  ensureProvDir();
  if (!existsSync(SERIAL_COUNTER_PATH)) return {};
  try {
    return JSON.parse(readFileSync(SERIAL_COUNTER_PATH, "utf-8")) as SerialCounters;
  } catch {
    return {};
  }
}

function writeCounters(counters: SerialCounters): void {
  ensureProvDir();
  writeFileSync(SERIAL_COUNTER_PATH, JSON.stringify(counters, null, 2), "utf-8");
}

/** Allocates the next sequential serial for a cathedral. Thread-safe within single process. */
export function allocateSerial(cathedral: string): string {
  const counters = readCounters();
  const code = CATHEDRAL_CODE[cathedral] ?? "X";
  const current = counters[cathedral] ?? 0;
  const next = current + 1;
  counters[cathedral] = next;
  writeCounters(counters);
  return `LB-CAT.${code}-${String(next).padStart(4, "0")}`;
}

/**
 * Generates a daughter serial from a parent serial.
 * Appends the next letter in the suffix alphabet.
 *
 * LB-CAT.M-0042        → LB-CAT.M-0042.a (first daughter)
 * LB-CAT.M-0042.a      → LB-CAT.M-0042.a.a (next generation)
 */
export function allocateDaughterSerial(parentSerial: string): string {
  return `${parentSerial}.a`;
}

// ─── Ledger Append ────────────────────────────────────────────────────────

export function appendProvenanceEntry(entry: ProvenanceChainEntry): void {
  ensureProvDir();
  const line = JSON.stringify(entry) + "\n";
  writeFileSync(PROVENANCE_LEDGER_PATH, line, { flag: "a", encoding: "utf-8" });
}

// ─── Ledger Query ─────────────────────────────────────────────────────────

/** Reads all entries for a given root serial (includes all descendants). */
export function queryProvenanceChain(rootSerial: string): ProvenanceChain {
  ensureProvDir();
  if (!existsSync(PROVENANCE_LEDGER_PATH)) return [];

  const raw = readFileSync(PROVENANCE_LEDGER_PATH, "utf-8");
  const chain: ProvenanceChain = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as ProvenanceChainEntry;
      // Include root + all descendants (serial starts with rootSerial)
      if (entry.serial === rootSerial || entry.serial.startsWith(rootSerial + ".")) {
        chain.push(entry);
      }
    } catch {
      continue;
    }
  }

  return chain;
}

/** Returns all root-level Miner serials (no parent_serial). */
export function listRootMiners(): ProvenanceChainEntry[] {
  ensureProvDir();
  if (!existsSync(PROVENANCE_LEDGER_PATH)) return [];

  const raw = readFileSync(PROVENANCE_LEDGER_PATH, "utf-8");
  const roots: ProvenanceChainEntry[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as ProvenanceChainEntry;
      if (entry.parent_serial === null && entry.role === "miner") {
        roots.push(entry);
      }
    } catch {
      continue;
    }
  }

  return roots;
}
