/**
 * Scribes Cathedral I/O (SP-21 + SP-22/23 / K436)
 * ===============================================
 * File-system primitives for the four MCP tools (`log_tidbit`, `fates_route`,
 * `scribe_log`, `consult_scribes`) and the session-end summary.
 *
 * Backing files (one tablet per Scribe, one ledger for tidbits, one ledger for
 * Fates routing) are append-only JSONL. Every line is one JSON object terminated
 * by `\n`. The first line of each Scribe tablet is a `{"type":"header",...}`
 * record describing the Scribe's primary + adjacents.
 *
 * All paths are resolved relative to `librarian-mcp/stitchpunks/`.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  appendFileSync,
  writeFileSync,
  statSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getScribe } from "./registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Cathedral file paths.
 *
 * Default roots point at the in-repo `librarian-mcp/stitchpunks/` directory.
 * Tests (and any sandboxed caller) can override by setting the
 * `LIBRARIAN_STITCHPUNKS_DIR` env var BEFORE importing this module — it
 * redirects all I/O (tablets, tidbits, fates_log) under that directory.
 */
export const STITCHPUNKS_DIR =
  process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
export const SCRIBES_DIR = resolve(STITCHPUNKS_DIR, "scribes");
export const DATA_DIR = resolve(STITCHPUNKS_DIR, "data");
export const TIDBITS_PATH = resolve(DATA_DIR, "tidbits.jsonl");
export const FATES_LOG_PATH = resolve(DATA_DIR, "fates_log.jsonl");

export type AgentName = "BISHOP" | "KNIGHT" | "ROOK" | "PAWN";
export type ScribeSource =
  | "founder_dialogue"
  | "bishop_ship"
  | "knight_ship"
  | "bishop_read"
  | "bishop_thresh"
  | "bishop_design"
  | "scribe_thresh"
  | "fates_auto";

export interface TidbitRecord {
  ts: string;
  agent: AgentName;
  session: string;
  category: string;
  observation: string;
  artifact?: string;
  bridle_rule: 2;
}

export interface ScribeTabletEntry {
  ts: string;
  session: string;
  observation: string;
  source: ScribeSource;
  canonical_ref?: string;
  // free-form extra fields preserved when read
  [key: string]: unknown;
}

export interface FatesLogRecord {
  ts: string;
  session: string;
  agent?: AgentName;
  clotho_themes: string[];
  lachesis_scores: Record<string, number>;
  atropos_dispatch: Array<{
    scribe_id: string;
    directive: string;
    suggested_observation?: string;
  }>;
  coverage_gaps: string[];
  source_exchange?: string;
}

function ensureDir(p: string): void {
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

function appendJsonl(filePath: string, record: unknown): number {
  ensureDir(filePath);
  const line = JSON.stringify(record) + "\n";
  appendFileSync(filePath, line, "utf-8");
  return countLines(filePath);
}

function countLines(filePath: string): number {
  if (!existsSync(filePath)) return 0;
  const buf = readFileSync(filePath, "utf-8");
  if (!buf) return 0;
  // Trailing newline shouldn't add a phantom record; split + filter empties.
  return buf.split("\n").filter((l) => l.length > 0).length;
}

function readJsonl<T = Record<string, unknown>>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, "utf-8");
  if (!raw) return [];
  const out: T[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as T);
    } catch {
      // Skip malformed line; never let one bad row poison consult_scribes.
    }
  }
  return out;
}

// ─── Tidbits ──────────────────────────────────────────────────────────────

export function appendTidbit(input: {
  agent: AgentName;
  session: string;
  category: string;
  observation: string;
  artifact?: string;
}): { ok: true; line_count: number; record: TidbitRecord } {
  const record: TidbitRecord = {
    ts: new Date().toISOString(),
    agent: input.agent,
    session: input.session,
    category: input.category,
    observation: input.observation,
    artifact: input.artifact,
    bridle_rule: 2,
  };
  const line_count = appendJsonl(TIDBITS_PATH, record);
  return { ok: true, line_count, record };
}

export function readTidbits(filter?: { session?: string }): TidbitRecord[] {
  const all = readJsonl<TidbitRecord>(TIDBITS_PATH);
  if (!filter?.session) return all;
  return all.filter((t) => t.session === filter.session);
}

// ─── Scribe tablets ───────────────────────────────────────────────────────

function tabletPath(scribeId: string): string {
  return resolve(SCRIBES_DIR, `scribe_${scribeId}.jsonl`);
}

export function tabletExists(scribeId: string): boolean {
  return existsSync(tabletPath(scribeId));
}

/**
 * Ensure a tablet header row exists. Creates the file with a header line if it
 * doesn't exist yet. Idempotent — never duplicates the header.
 */
function ensureTabletHeader(scribeId: string): void {
  const path = tabletPath(scribeId);
  if (existsSync(path)) return;

  const scribe = getScribe(scribeId);
  if (!scribe) {
    // Caller should have rejected before reaching here. Fail loudly.
    throw new Error(`Cannot create tablet for unregistered Scribe '${scribeId}'.`);
  }
  const header = {
    type: "header",
    scribe_id: scribe.id,
    primary_level: scribe.primary.level,
    primary_field: scribe.primary.field,
    adjacents: scribe.adjacents,
    opened: new Date().toISOString(),
    opened_by: "K436 server (auto-created on first scribe_log)",
    spec: "../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md",
  };
  ensureDir(path);
  writeFileSync(path, JSON.stringify(header) + "\n", "utf-8");
}

export function appendScribeEntry(input: {
  scribe_id: string;
  session: string;
  observation: string;
  source: ScribeSource;
  canonical_ref?: string;
}): { ok: true; tablet: string; line_count: number; record: ScribeTabletEntry } {
  ensureTabletHeader(input.scribe_id);
  const path = tabletPath(input.scribe_id);
  const record: ScribeTabletEntry = {
    ts: new Date().toISOString(),
    session: input.session,
    observation: input.observation,
    source: input.source,
    canonical_ref: input.canonical_ref,
  };
  const line_count = appendJsonl(path, record);
  return { ok: true, tablet: path, line_count, record };
}

export function readTablet(scribeId: string): ScribeTabletEntry[] {
  const path = tabletPath(scribeId);
  const all = readJsonl<ScribeTabletEntry>(path);
  // Header row has type="header" and no observation — filter it out for callers
  // that want only observation entries.
  return all.filter((row) => (row as { type?: string }).type !== "header");
}

export function tabletStats(scribeId: string): {
  exists: boolean;
  total_entries: number;
  last_entry_ts: string | null;
} {
  const path = tabletPath(scribeId);
  if (!existsSync(path)) {
    return { exists: false, total_entries: 0, last_entry_ts: null };
  }
  const entries = readTablet(scribeId);
  return {
    exists: true,
    total_entries: entries.length,
    last_entry_ts: entries.length > 0 ? (entries[entries.length - 1].ts as string) : null,
  };
}

// ─── Fates log ────────────────────────────────────────────────────────────

export function appendFatesLog(record: Omit<FatesLogRecord, "ts">): {
  ok: true;
  line_count: number;
  record: FatesLogRecord;
} {
  const full: FatesLogRecord = { ts: new Date().toISOString(), ...record };
  const line_count = appendJsonl(FATES_LOG_PATH, full);
  return { ok: true, line_count, record: full };
}

export function readFatesLog(filter?: { session?: string }): FatesLogRecord[] {
  const all = readJsonl<FatesLogRecord>(FATES_LOG_PATH);
  // Header row may have no clotho_themes — filter to dispatch records only.
  const dispatches = all.filter((r) => Array.isArray((r as { clotho_themes?: unknown }).clotho_themes));
  if (!filter?.session) return dispatches;
  return dispatches.filter((r) => r.session === filter.session);
}

// ─── Misc helpers exported for tests / session-end summary ───────────────

export function fileMtime(filePath: string): number {
  return existsSync(filePath) ? statSync(filePath).mtimeMs : 0;
}
