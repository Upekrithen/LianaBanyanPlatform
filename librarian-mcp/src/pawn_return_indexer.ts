/**
 * Pawn Return Auto-Indexer — Bushel 36 Phase 1 (BP025)
 *
 * Watches dispatches/pawn/ for new *.return.json files.
 * For each unprocessed return:
 *   1. Parses response_text → extracts topics via pheromone.extractTopics()
 *   2. Emits a PheromoneRecord to the main substrate (cathedral: "pawn",
 *      synthesisClass: "pawn_research_return")
 *   3. Writes an indexed-ledger row to stitchpunks/pawn_cathedral/return_index.jsonl
 *   4. Flags "FLAGGED" / "CRITICAL" returns to high_priority_surface.jsonl
 *      for next-session-open Wrasse pre-injection.
 *
 * Stone Tablet Imperative: all writes are append-only. Idempotent on re-run
 * (already-indexed dispatch_ids are skipped).
 */

import {
  existsSync,
  mkdirSync,
  appendFileSync,
  readFileSync,
  readdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  emitPheromone,
  extractTopics,
  STITCHPUNKS_DIR,
} from "./scribes/pheromone.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DISPATCHES_PAWN_DIR = resolve(__dirname, "..", "dispatches", "pawn");
const PAWN_CATHEDRAL_DIR = resolve(STITCHPUNKS_DIR, "pawn_cathedral");

// Ledger of already-indexed dispatch_ids (append-only; idempotency guard)
const RETURN_INDEX_LEDGER = resolve(PAWN_CATHEDRAL_DIR, "return_index.jsonl");
// High-priority findings surface for next session-open
const HIGH_PRIORITY_SURFACE = resolve(PAWN_CATHEDRAL_DIR, "high_priority_surface.jsonl");

// ─── Schema ──────────────────────────────────────────────────────────────────

export interface ReturnIndexRecord {
  ts: string;
  dispatch_id: string;
  return_path: string;
  topics_extracted: number;
  pheromone_written: boolean;
  high_priority: boolean;
  return_timestamp: string;
  cost_actual_usd?: number;
  excerpt_head: string;         // first 200 chars of response_text
}

export interface HighPriorityRecord {
  ts: string;
  dispatch_id: string;
  flag_class: "FLAGGED" | "CRITICAL";
  topics: string[];
  excerpt: string;              // first 500 chars
  return_path: string;
}

export interface IndexResult {
  processed: number;
  skipped_already_indexed: number;
  high_priority_surfaced: number;
  errors: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadIndexedIds(): Set<string> {
  const ids = new Set<string>();
  if (!existsSync(RETURN_INDEX_LEDGER)) return ids;
  const lines = readFileSync(RETURN_INDEX_LEDGER, "utf-8")
    .split("\n")
    .filter((l) => l.trim());
  for (const line of lines) {
    try {
      const rec = JSON.parse(line) as { dispatch_id?: string };
      if (rec.dispatch_id) ids.add(rec.dispatch_id);
    } catch { /* skip malformed */ }
  }
  return ids;
}

function isFlaggedPriority(text: string): "FLAGGED" | "CRITICAL" | null {
  if (/\bCRITICAL\b/i.test(text)) return "CRITICAL";
  if (/\bFLAGGED\b/i.test(text)) return "FLAGGED";
  return null;
}

// ─── Core indexer ─────────────────────────────────────────────────────────────

/**
 * Scan dispatches/pawn/ for any *.return.json files not yet in the index.
 * Returns a summary of what was processed.
 */
export function indexPawnReturns(): IndexResult {
  const result: IndexResult = {
    processed: 0,
    skipped_already_indexed: 0,
    high_priority_surfaced: 0,
    errors: [],
  };

  if (!existsSync(DISPATCHES_PAWN_DIR)) {
    return result; // no dispatches yet — safe no-op
  }

  const indexedIds = loadIndexedIds();
  ensureDir(RETURN_INDEX_LEDGER);
  ensureDir(HIGH_PRIORITY_SURFACE);

  const returnFiles = readdirSync(DISPATCHES_PAWN_DIR).filter((f) =>
    f.endsWith(".return.json")
  );

  for (const fileName of returnFiles) {
    const filePath = resolve(DISPATCHES_PAWN_DIR, fileName);
    let returnData: {
      dispatch_id: string;
      response_text: string;
      return_timestamp: string;
      cost_actual_usd?: number;
    };

    try {
      returnData = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      result.errors.push(`parse_error:${fileName}:${String(err)}`);
      continue;
    }

    const { dispatch_id, response_text, return_timestamp, cost_actual_usd } =
      returnData;

    if (!dispatch_id || !response_text) {
      result.errors.push(`missing_fields:${fileName}`);
      continue;
    }

    if (indexedIds.has(dispatch_id)) {
      result.skipped_already_indexed++;
      continue;
    }

    // Extract topics from the response text
    const topics = extractTopics(response_text);
    const ts = new Date().toISOString();

    // Emit pheromone record to main substrate
    let pheromoneWritten = false;
    try {
      emitPheromone(
        "PawnReturn",
        dispatch_id,
        response_text,
        {
          cathedral: "pawn",
          decayConstantDays: 14,   // Pawn returns decay faster than architectural canon
          synthesisClass: "pawn_research_return",
          flavorClass: {
            cognition: "empirical-receipt",
            audience: "pawn-research",
          },
        }
      );
      pheromoneWritten = true;
    } catch (err) {
      result.errors.push(`pheromone_emit_error:${dispatch_id}:${String(err)}`);
    }

    // Check for high-priority flags
    const flagClass = isFlaggedPriority(response_text);
    let highPriority = false;

    if (flagClass) {
      highPriority = true;
      result.high_priority_surfaced++;
      const hpRecord: HighPriorityRecord = {
        ts,
        dispatch_id,
        flag_class: flagClass,
        topics: topics.slice(0, 20),
        excerpt: response_text.slice(0, 500),
        return_path: filePath,
      };
      ensureDir(HIGH_PRIORITY_SURFACE);
      appendFileSync(
        HIGH_PRIORITY_SURFACE,
        JSON.stringify(hpRecord) + "\n",
        "utf-8"
      );
    }

    // Append to index ledger
    const indexRecord: ReturnIndexRecord = {
      ts,
      dispatch_id,
      return_path: filePath,
      topics_extracted: topics.length,
      pheromone_written: pheromoneWritten,
      high_priority: highPriority,
      return_timestamp: return_timestamp ?? ts,
      ...(cost_actual_usd !== undefined ? { cost_actual_usd } : {}),
      excerpt_head: response_text.slice(0, 200),
    };
    appendFileSync(
      RETURN_INDEX_LEDGER,
      JSON.stringify(indexRecord) + "\n",
      "utf-8"
    );

    indexedIds.add(dispatch_id);
    result.processed++;
  }

  return result;
}

/**
 * Read the high-priority surface — used by session-open Wrasse pre-injection
 * to surface recent flagged Pawn findings.
 */
export function readHighPrioritySurface(limit = 10): HighPriorityRecord[] {
  if (!existsSync(HIGH_PRIORITY_SURFACE)) return [];
  const lines = readFileSync(HIGH_PRIORITY_SURFACE, "utf-8")
    .split("\n")
    .filter((l) => l.trim());
  const records: HighPriorityRecord[] = [];
  for (const line of lines) {
    try {
      records.push(JSON.parse(line) as HighPriorityRecord);
    } catch { /* skip malformed */ }
  }
  // Return most recent first
  return records.reverse().slice(0, limit);
}

/**
 * Returns a count of indexed dispatch_ids.
 */
export function getIndexedReturnCount(): number {
  return loadIndexedIds().size;
}
