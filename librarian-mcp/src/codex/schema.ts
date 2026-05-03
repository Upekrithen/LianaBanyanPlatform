/**
 * Codex Schema + Store — KN-K1 / BP018
 * =======================================
 * Layer 8 canon-of-canons: bound-book artifacts aggregating per-Topic chapters.
 *
 * Each chapter cites:
 *   - Gold tablets (Pod-N)
 *   - Excalibur instances (BP016 Pod-C)
 *   - Forever-Stamp Joules redemptions (Pod-M)
 *   - House Scribe Jars (Pod-J KN-J1)
 *
 * Binding ceremony makes Codex immutable (HMAC-locked, status = "bound").
 * Anthology integration targets: AI Cake / No Atomo / Mechanical Computer / Pre-Cathedral Substack.
 *
 * Storage: stitchpunks/codex/codex_ledger.jsonl (append-only; last write per ID wins)
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  mkdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_c = dirname(__filename);

export const STITCHPUNKS_DIR = resolve(__dirname_c, "../../stitchpunks");
export const CODEX_DIR = resolve(STITCHPUNKS_DIR, "codex");
export const CODEX_LEDGER = resolve(CODEX_DIR, "codex_ledger.jsonl");
const CODEX_SERIAL_COUNTER = resolve(CODEX_DIR, "codex_serial_counter.json");

export function ensureCodexDir(): void {
  if (!existsSync(CODEX_DIR)) mkdirSync(CODEX_DIR, { recursive: true });
}

// ─── Stratum import (Pod-T dependency) ───────────────────────────────────────

import type { Stratum } from "../strata/schema.js";

// ─── Serial allocation ────────────────────────────────────────────────────────

export function allocateCodexSerial(): string {
  ensureCodexDir();
  let next = 1;
  if (existsSync(CODEX_SERIAL_COUNTER)) {
    try {
      next = (JSON.parse(readFileSync(CODEX_SERIAL_COUNTER, "utf-8")) as { next: number }).next;
    } catch { /* fall through */ }
  }
  writeFileSync(CODEX_SERIAL_COUNTER, JSON.stringify({ next: next + 1 }, null, 2), "utf-8");
  return `LB-CODEX-${String(next).padStart(4, "0")}`;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

export interface CodexChapter {
  topic: string;
  stratum?: Stratum;                       // Pod-T citation
  gold_tablet_pointers: string[];          // Pod-N citations
  excalibur_pointers: string[];            // BP016 Pod-C citations
  joules_redemption_pointers?: string[];   // Pod-M citations (post-binding redemptions)
  jar_pointers: string[];                  // Pod-J KN-J1 (preserved synthesis Jars)
  body_text: string;                       // chapter prose
  ts_drafted: string;                      // ISO-8601
}

export type CodexStatus = "drafting" | "review" | "bound" | "superseded";

export const ANTHOLOGY_TARGETS = [
  "ai_cake",
  "no_atomo",
  "mechanical_computer",
  "pre_cathedral_substack",
] as const;

export type AnthologyTarget = (typeof ANTHOLOGY_TARGETS)[number];

export interface Codex {
  id: string;                    // LB-CODEX-NNNN serial
  uuid: string;                  // UUID v4 — stable identity across rewrites
  title: string;
  edition: string;
  chapters: CodexChapter[];
  status: CodexStatus;
  created_ts: string;
  bound_ts?: string;
  bound_hmac?: string;           // immutable once bound
  superseded_by?: string;        // ID of replacement Codex
  anthology_exports?: Array<{ target: AnthologyTarget; exported_ts: string }>;
}

// ─── Ledger read/write ────────────────────────────────────────────────────────

export function readAllCodexEntries(): Codex[] {
  ensureCodexDir();
  if (!existsSync(CODEX_LEDGER)) return [];
  try {
    const raw = readFileSync(CODEX_LEDGER, "utf-8");
    const byId = new Map<string, Codex>();
    for (const line of raw.split("\n").filter((l) => l.trim())) {
      try {
        const c = JSON.parse(line) as Codex;
        byId.set(c.id, c);
      } catch { /* skip malformed lines */ }
    }
    return Array.from(byId.values());
  } catch {
    return [];
  }
}

export function appendCodexEntry(codex: Codex): void {
  ensureCodexDir();
  appendFileSync(CODEX_LEDGER, JSON.stringify(codex) + "\n", "utf-8");
}

export function getCodexById(id: string): Codex | undefined {
  return readAllCodexEntries().find((c) => c.id === id);
}

export function queryCodex(filter: {
  title?: string;
  edition?: string;
  status?: CodexStatus;
}): Codex[] {
  return readAllCodexEntries().filter((c) => {
    if (filter.title && !c.title.toLowerCase().includes(filter.title.toLowerCase())) return false;
    if (filter.edition && c.edition !== filter.edition) return false;
    if (filter.status && c.status !== filter.status) return false;
    return true;
  });
}
