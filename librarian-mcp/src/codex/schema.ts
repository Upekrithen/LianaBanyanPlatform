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

// ─── Reservation schema (Bushel 32 / BP022) ───────────────────────────────────

export type CodexReservationStatus = "reserved" | "bound" | "expired";

export interface CodexReservation {
  type: "reservation";
  serial: string;               // LB-CODEX-NNNN
  reserved_by: string;          // caller identity (session ID or agent name)
  intended_title: string;
  intended_session: string;
  intended_bushel: number;
  reserved_ts: string;          // ISO-8601
  reservation_id: string;       // UUID v4 — stable identity
  status: CodexReservationStatus;
  originally_proposed_serial?: string;  // collision-migration: original serial before rename
  bound_codex_id?: string;      // populated when status transitions to "bound"
  bound_ts?: string;
  expires_ts?: string;          // populated when status transitions to "expired"
}

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
        const c = JSON.parse(line) as Codex & { type?: string };
        if (c.type === "reservation") continue; // skip reservation rows
        if (!c.id) continue;                    // skip malformed entries
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

// ─── Reservation ledger read/write (Bushel 32 / BP022) ───────────────────────

export function appendReservationEntry(reservation: CodexReservation): void {
  ensureCodexDir();
  appendFileSync(CODEX_LEDGER, JSON.stringify(reservation) + "\n", "utf-8");
}

export function readAllReservationEntries(): CodexReservation[] {
  ensureCodexDir();
  if (!existsSync(CODEX_LEDGER)) return [];
  try {
    const raw = readFileSync(CODEX_LEDGER, "utf-8");
    const byId = new Map<string, CodexReservation>();
    for (const line of raw.split("\n").filter((l) => l.trim())) {
      try {
        const entry = JSON.parse(line) as Record<string, unknown>;
        if (entry.type === "reservation") {
          const r = entry as unknown as CodexReservation;
          byId.set(r.reservation_id, r);
        }
      } catch { /* skip malformed lines */ }
    }
    return Array.from(byId.values());
  } catch {
    return [];
  }
}

export function getReservationById(reservation_id: string): CodexReservation | undefined {
  return readAllReservationEntries().find((r) => r.reservation_id === reservation_id);
}

export function getReservationBySerial(serial: string): CodexReservation | undefined {
  return readAllReservationEntries().find((r) => r.serial === serial);
}

/**
 * Parse a serial string like "LB-CODEX-0034" → 34.
 * Returns 0 for unparseable entries so they don't inflate the max.
 */
export function parseSerialNumber(serial: string): number {
  const m = serial.match(/LB-CODEX-(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Find the highest allocated serial across ALL ledger entries:
 * - Bound/drafting/review Codex entries
 * - Active (non-expired) reservation entries
 */
export function findMaxAllocatedSerial(): number {
  let max = 0;
  const codices = readAllCodexEntries();
  for (const c of codices) {
    const n = parseSerialNumber(c.id);
    if (n > max) max = n;
  }
  const reservations = readAllReservationEntries();
  for (const r of reservations) {
    if (r.status !== "expired") {
      const n = parseSerialNumber(r.serial);
      if (n > max) max = n;
    }
  }
  return max;
}
