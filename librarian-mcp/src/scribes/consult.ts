/**
 * Scribes Consult — RAM-access pattern (SP-23 / K436)
 * ===================================================
 * `consult_scribes` query path. Scores `topic` against every registered Scribe,
 * then returns the most recent N entries from the highest-scoring Scribes.
 *
 * Extended K455c/B121: accepts `cathedral` and `scope` parameters for
 * cross-Cathedral consultation and permissioned scope filtering.
 *
 * Extended K466/B121: Scribe-level `mode` field controls retrieval semantics.
 *   "observational" (default): tablets returned recency-sorted, top-K.
 *   "corpus": tablets returned in original (deterministic) order, all up to
 *   max_entries. Default max_entries for corpus queries is 100 (vs 20 observational).
 *
 * Latency target: p95 < 200ms for a 20-tablet cathedral with synthetic 500-entry
 * tablets. Hot path keeps work small: tablets are read once each, sliced by ts.
 */
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getRegistry, scoreScribe } from "./registry.js";
import { readTablet, type ScribeTabletEntry, STITCHPUNKS_DIR } from "./cathedral.js";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Cathedral paths ──────────────────────────────────────────────────────

/** Resolved path to Knight's Cathedral directory */
const KNIGHT_CATHEDRAL_DIR = resolve(STITCHPUNKS_DIR, "knight_cathedral");
const KNIGHT_SCRIBES_DIR = resolve(KNIGHT_CATHEDRAL_DIR, "scribes");
const KNIGHT_REGISTRY_PATH = resolve(KNIGHT_CATHEDRAL_DIR, "registry.yaml");

// ─── Types ────────────────────────────────────────────────────────────────

export interface ConsultEntry extends ScribeTabletEntry {
  scribe_id: string;
}

export interface ConsultResult {
  topic: string;
  cathedral: string;
  scope: string;
  scribes_consulted: Array<{
    scribe_id: string;
    score: number;
    is_primary: boolean;
    /** K466: serving mode for this Scribe */
    mode: "observational" | "corpus";
    entries_returned: number;
  }>;
  entries: ConsultEntry[];
  truncated: boolean;
  elapsed_ms: number;
}

// ─── Knight Cathedral registry loader ────────────────────────────────────

interface KnightScribesRegistry {
  version?: string;
  scribes: Array<{
    id: string;
    /** K466: corpus = full deterministic retrieval; observational = recency top-K (default) */
    mode?: "observational" | "corpus";
    primary: { level: number; field: string };
    adjacents: Array<{ level: number; field: string }>;
    keywords: string[];
    activation_threshold?: string;
  }>;
}

/** Simple in-process cache for Knight's registry (mtime-invalidated). */
let _knightReg: KnightScribesRegistry | null = null;
let _knightRegMtime = 0;

function getKnightRegistry(): KnightScribesRegistry {
  if (!existsSync(KNIGHT_REGISTRY_PATH)) {
    return { scribes: [] };
  }
  const { mtimeMs } = statSync(KNIGHT_REGISTRY_PATH);
  if (!_knightReg || mtimeMs !== _knightRegMtime) {
    const raw = readFileSync(KNIGHT_REGISTRY_PATH, "utf-8");
    const parsed = yaml.load(raw) as Partial<KnightScribesRegistry> | undefined;
    _knightReg = { scribes: (parsed?.scribes || []) };
    for (const s of _knightReg.scribes) {
      s.adjacents = s.adjacents || [];
      s.keywords = (s.keywords || []).filter((k: unknown) => typeof k === "string");
    }
    _knightRegMtime = mtimeMs;
  }
  return _knightReg!;
}

/** Score a Knight Scribe against a topic (mirrors Bishop scoreScribe logic). */
function scoreKnightScribe(
  scribe: KnightScribesRegistry["scribes"][0],
  themes: string[],
): { score: number; primaryMatches: string[]; adjacentMatches: string[] } {
  const primaryMatches = new Set<string>();
  const adjacentMatches = new Set<string>();

  const primaryHaystack = scribe.keywords.map((k) => k.toLowerCase());
  const primaryFieldLower = scribe.primary.field.toLowerCase();
  const adjacentHaystack = scribe.adjacents.map((a) => a.field.toLowerCase());

  for (const themeRaw of themes) {
    const theme = themeRaw.toLowerCase().trim();
    if (!theme) continue;

    const hitsPrimary =
      primaryHaystack.some((kw) => theme.includes(kw) || kw.includes(theme)) ||
      primaryFieldLower.includes(theme);
    if (hitsPrimary) {
      primaryMatches.add(themeRaw);
      continue;
    }

    const hitsAdjacent = adjacentHaystack.some((field) =>
      field.includes(theme) || theme.includes(field),
    );
    if (hitsAdjacent) {
      adjacentMatches.add(themeRaw);
    }
  }

  const score = primaryMatches.size * 1.0 + adjacentMatches.size * 0.5;
  return { score, primaryMatches: Array.from(primaryMatches), adjacentMatches: Array.from(adjacentMatches) };
}

/**
 * Read a Knight Cathedral tablet. Knight tablets live at:
 *   stitchpunks/knight_cathedral/scribes/<ScribeId>.jsonl
 * (no "scribe_" prefix, unlike Bishop's tablets).
 *
 * Knight tablet entries use: observation, category, timestamp, source_session, source_document, tokens
 * We normalize to the common ScribeTabletEntry shape: ts, session, observation, source, canonical_ref
 */
function readKnightTablet(scribeId: string): ScribeTabletEntry[] {
  const tabletPath = resolve(KNIGHT_SCRIBES_DIR, `${scribeId}.jsonl`);
  if (!existsSync(tabletPath)) return [];

  const raw = readFileSync(tabletPath, "utf-8");
  if (!raw) return [];

  const out: ScribeTabletEntry[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>;
      // Skip header rows
      if (obj.type === "header") continue;
      // Normalize Knight field names → common ScribeTabletEntry shape
      // Knight uses: timestamp, source_session, source_document, tokens, observation, category
      // Bishop uses: ts, session, observation, source, canonical_ref
      const entry: ScribeTabletEntry = {
        ts: (obj.timestamp as string) || (obj.ts as string) || "",
        session: (obj.source_session as string) || (obj.session as string) || "",
        observation: (obj.observation as string) || "",
        source: ((obj.source_document as string) || (obj.source as string) || "knight_ship") as ScribeTabletEntry["source"],
        canonical_ref: (obj.source_document as string) || (obj.canonical_ref as string),
        // Preserve all original fields (including scope)
        ...obj,
      };
      out.push(entry);
    } catch {
      // Skip malformed lines
    }
  }
  return out;
}

// ─── Scope filter ─────────────────────────────────────────────────────────

/**
 * Returns true if an entry passes the scope filter.
 *
 * Rules:
 * - If entry has no scope field, treat as "public" (pre-retrofit compat,
 *   though retrofit-tablet-scope.mjs ensures all entries now have scope).
 * - If caller requests "public", return only entries with scope === "public"
 *   (or no scope, for backward compat).
 * - If caller requests "private", return only entries where scope === "private".
 *   In a real multi-Cathedral deployment, the caller's identity would gate this;
 *   here we implement the filter but not the auth check (auth is out of scope K455c).
 * - guild:<name> and tribe:<name> are matched exactly.
 */
function passesScope(entry: ScribeTabletEntry, requestedScope: string): boolean {
  const entryScope = (entry as Record<string, unknown>).scope;
  // Pre-retrofit tablets (no scope field) are treated as "public"
  if (entryScope === undefined || entryScope === null) {
    return requestedScope === "public";
  }
  return entryScope === requestedScope;
}

// ─── Main consult function ────────────────────────────────────────────────

// ─── Corpus mode constants ─────────────────────────────────────────────────

/**
 * Default max_entries for observational Scribes (recency-sorted top-K).
 * Matches the server.ts documented default.
 */
const OBSERVATIONAL_DEFAULT_MAX = 20;

/**
 * Default max_entries for corpus Scribes (static reference, full retrieval).
 * Higher default because reference corpora must be fully visible (K466).
 */
const CORPUS_DEFAULT_MAX = 100;

/**
 * Hard per-Scribe cap for corpus mode to prevent runaway memory on huge corpora.
 */
const CORPUS_PER_SCRIBE_CAP = 500;

// ─── Scribe mode lookup ────────────────────────────────────────────────────

/** Returns the serving mode for a Scribe. Defaults to "observational" if unset. */
function getScribeMode(
  scribeId: string,
  cathedral: "bishop" | "knight",
): "observational" | "corpus" {
  if (cathedral === "bishop") {
    const scribe = getRegistry().scribes.find((s) => s.id === scribeId);
    return scribe?.mode ?? "observational";
  } else {
    const scribe = getKnightRegistry().scribes.find((s) => s.id === scribeId);
    return scribe?.mode ?? "observational";
  }
}

export function consultScribes(input: {
  topic: string;
  max_entries?: number;
  since_ts?: string;
  include_adjacents?: boolean;
  /** Which Cathedral to consult. "bishop" = Bishop's Cathedral (default). "knight" = Knight's Cathedral. */
  cathedral?: "bishop" | "knight";
  /** Scope filter. Defaults to "public". Silent filter: non-matching entries are omitted. */
  scope?: string;
}): ConsultResult {
  const t0 = Date.now();
  const include_adjacents = input.include_adjacents ?? true;
  const sinceMs = input.since_ts ? Date.parse(input.since_ts) : NaN;
  const cathedral = input.cathedral ?? "bishop";
  const scope = input.scope ?? "public";

  const themes = [input.topic];

  type Ranked = {
    scribe_id: string;
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
  };
  const ranked: Ranked[] = [];

  if (cathedral === "bishop") {
    // Bishop's Cathedral: use existing registry.ts + cathedral.ts
    const reg = getRegistry();
    for (const s of reg.scribes) {
      const r = scoreScribe(s.id, themes);
      if (r.score <= 0) continue;
      ranked.push({
        scribe_id: s.id,
        score: r.score,
        primaryMatches: r.primaryMatches,
        adjacentMatches: r.adjacentMatches,
      });
    }
  } else {
    // Knight's Cathedral: use Knight-specific registry + tablet reader
    const knightReg = getKnightRegistry();
    for (const s of knightReg.scribes) {
      const r = scoreKnightScribe(s, themes);
      if (r.score <= 0) continue;
      ranked.push({
        scribe_id: s.id,
        score: r.score,
        primaryMatches: r.primaryMatches,
        adjacentMatches: r.adjacentMatches,
      });
    }
  }

  ranked.sort((a, b) => b.score - a.score);
  const filtered = ranked.filter((r) =>
    include_adjacents ? true : r.primaryMatches.length > 0,
  );

  // Determine effective max_entries.
  // If the caller didn't specify and any top-ranked Scribe is corpus-mode,
  // use CORPUS_DEFAULT_MAX so the full corpus is retrievable by default.
  let effectiveMax: number;
  if (input.max_entries !== undefined) {
    effectiveMax = Math.max(1, Math.min(500, input.max_entries));
  } else {
    const hasCorpusScribe = filtered.some(
      (r) => getScribeMode(r.scribe_id, cathedral) === "corpus",
    );
    effectiveMax = hasCorpusScribe ? CORPUS_DEFAULT_MAX : OBSERVATIONAL_DEFAULT_MAX;
  }

  const entries: ConsultEntry[] = [];
  const consulted: ConsultResult["scribes_consulted"] = [];

  for (const r of filtered) {
    const scribeMode = getScribeMode(r.scribe_id, cathedral);
    const isCorpus = scribeMode === "corpus";

    // Observational Scribes stop contributing once global cap is reached.
    // Corpus Scribes always contribute their full set (up to CORPUS_PER_SCRIBE_CAP).
    if (!isCorpus && entries.length >= effectiveMax) break;

    // Read tablet based on cathedral
    const rawTablet = cathedral === "bishop"
      ? readTablet(r.scribe_id)
      : readKnightTablet(r.scribe_id);

    // Filter out header rows (both Cathedral formats)
    const tablet = rawTablet.filter(
      (e) => (e as Record<string, unknown>).type !== "header",
    );

    let candidates: typeof tablet;
    if (isCorpus) {
      // Corpus mode: original append order (deterministic), all entries.
      // If corpus exceeds CORPUS_PER_SCRIBE_CAP, take first-N (stable chunk).
      candidates = tablet.slice(0, CORPUS_PER_SCRIBE_CAP);
    } else {
      // Observational mode: newest first (append-order reversed, recency top-K).
      candidates = [...tablet].reverse();
    }

    const taken: ConsultEntry[] = [];

    for (const entry of candidates) {
      // Corpus: cap at CORPUS_PER_SCRIBE_CAP per scribe, ignore global effectiveMax mid-loop.
      // Observational: respect global effectiveMax.
      if (!isCorpus && entries.length + taken.length >= effectiveMax) break;
      if (isCorpus && taken.length >= CORPUS_PER_SCRIBE_CAP) break;

      // Scope filter
      if (!passesScope(entry, scope)) continue;

      // Timestamp filter
      if (Number.isFinite(sinceMs)) {
        const ts = String(entry.ts || (entry as Record<string, unknown>).timestamp || "");
        const entryMs = Date.parse(ts);
        if (Number.isFinite(entryMs) && entryMs <= sinceMs) continue;
      }

      taken.push({ ...entry, scribe_id: r.scribe_id });
    }

    // For corpus Scribes: if caller set explicit max_entries, honour it as total cap.
    // Trim excess from corpus results to respect explicit caller cap.
    if (isCorpus && input.max_entries !== undefined) {
      const remaining = effectiveMax - entries.length;
      if (taken.length > remaining) {
        taken.splice(remaining);
      }
    }

    if (taken.length === 0) continue;
    entries.push(...taken);
    consulted.push({
      scribe_id: r.scribe_id,
      score: round2(r.score),
      is_primary: r.primaryMatches.length > 0,
      mode: scribeMode,
      entries_returned: taken.length,
    });
  }

  return {
    topic: input.topic,
    cathedral,
    scope,
    scribes_consulted: consulted,
    entries,
    truncated: entries.length >= effectiveMax,
    elapsed_ms: Date.now() - t0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
