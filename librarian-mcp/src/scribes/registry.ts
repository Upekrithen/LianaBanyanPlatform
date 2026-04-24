/**
 * Scribes Cathedral Registry Loader (SP-23 / K436)
 * ================================================
 * Parses `librarian-mcp/stitchpunks/scribes/registry.yaml` once at server start,
 * caches in-process. Exposes the public surface used by the Three Fates router
 * (Lachesis scoring) and by the consult_scribes tool.
 *
 * K474/B122 — Self-Indexing Scribes:
 * After parsing registry.yaml, loads auto-derived keyword sidecars from
 * stitchpunks/scribes/auto_keywords/<scribe_id>.yaml and merges them per
 * LIBRARIAN_KEYWORDS_MODE:
 *   "union"     (default): hand-curated + auto-derived (deduplicated)
 *   "auto-only":           auto-derived only; hand-curated keywords ignored
 *   "hand-only":           hand-curated only; auto sidecar ignored (legacy / test stability)
 */
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { loadAutoKeywordSidecar, getAutoKeywordsDir } from "./autoExtract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default registry root is the in-repo stitchpunks/scribes/ directory.
 * Tests can override via `LIBRARIAN_STITCHPUNKS_DIR` env var (which also
 * redirects cathedral.ts file I/O — see cathedral.ts).
 */
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
  ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
  : resolve(__dirname, "..", "..", "stitchpunks");
export const SCRIBES_DIR = resolve(STITCHPUNKS_DIR, "scribes");
export const REGISTRY_PATH = resolve(SCRIBES_DIR, "registry.yaml");

export interface ScribeAdjacent {
  level: number;
  field: string;
}

export interface ScribeEntry {
  id: string;
  /**
   * Serving semantics for this Scribe's tablets (K466/B121).
   * - "observational" (default): tablets returned recency-sorted, top-K.
   *   Use for session logs, handoffs, BRIDLE memory — newer observations matter more.
   * - "corpus": static reference semantics; tablets returned in original (deterministic)
   *   order, all entries up to max_entries. Use for R11, canonical_values, rulebooks.
   */
  mode?: "observational" | "corpus";
  /**
   * Optional corpus provenance label (K472/B121 Fix 2).
   * Tags Scribes containing reference corpus material (e.g. "r11_reference") so
   * Lachesis can distinguish synthetic-corpus content from observational LB substrate.
   * Used by consultScribes corpus-mode priority boost (Fix 3).
   */
  corpus_label?: string;
  primary: {
    level: number;
    field: string;
    canonical_keepers?: string[];
  };
  adjacents: ScribeAdjacent[];
  keywords: string[];
  activation_threshold?: string;
}

export interface ScribesRegistry {
  version: string;
  opened: string;
  opener: string;
  spec: string;
  scribes: ScribeEntry[];
}

interface RegistryCache {
  registry: ScribesRegistry | null;
  loadedAtMs: number;
  mtimeMs: number;
  /** Cache key includes keyword mode so mode changes force a reload. */
  keywordsMode: string;
}

const cache: RegistryCache = { registry: null, loadedAtMs: 0, mtimeMs: 0, keywordsMode: "" };

/**
 * Returns the active LIBRARIAN_KEYWORDS_MODE.
 *   "union"     (default): hand-curated + auto-derived
 *   "auto-only":           auto-derived only
 *   "hand-only":           hand-curated only
 */
function getKeywordsMode(): string {
  const raw = (process.env.LIBRARIAN_KEYWORDS_MODE ?? "union").trim().toLowerCase();
  if (raw === "auto-only" || raw === "hand-only" || raw === "union") return raw;
  return "union";
}

function loadFromDisk(): ScribesRegistry {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`Scribes registry not found at ${REGISTRY_PATH}`);
  }
  const raw = readFileSync(REGISTRY_PATH, "utf-8");
  const parsed = yaml.load(raw) as Partial<ScribesRegistry> | undefined;
  if (!parsed || !Array.isArray(parsed.scribes)) {
    throw new Error(`Scribes registry malformed (no 'scribes' array) at ${REGISTRY_PATH}`);
  }
  // Defensive defaults
  for (const s of parsed.scribes) {
    s.adjacents = s.adjacents || [];
    s.keywords = (s.keywords || []).filter((k) => typeof k === "string");
  }

  // K474/B122: merge auto-derived keywords based on LIBRARIAN_KEYWORDS_MODE
  const mode = getKeywordsMode();
  if (mode !== "hand-only") {
    const autoDir = getAutoKeywordsDir();
    for (const s of parsed.scribes) {
      const autoKws = loadAutoKeywordSidecar(s.id, autoDir);
      if (mode === "auto-only") {
        // Replace hand-curated keywords with auto-derived only
        s.keywords = autoKws;
      } else {
        // union: hand-curated first (preserve order), append unique auto keywords
        const existing = new Set(s.keywords.map((k) => k.toLowerCase()));
        for (const kw of autoKws) {
          if (!existing.has(kw.toLowerCase())) {
            s.keywords.push(kw);
            existing.add(kw.toLowerCase());
          }
        }
      }
    }
  }

  return parsed as ScribesRegistry;
}

/** Returns the parsed registry. Re-reads from disk if the YAML mtime or keywords mode changed. */
export function getRegistry(forceReload = false): ScribesRegistry {
  const mtime = existsSync(REGISTRY_PATH) ? statSync(REGISTRY_PATH).mtimeMs : 0;
  const mode = getKeywordsMode();
  if (!cache.registry || forceReload || mtime !== cache.mtimeMs || mode !== cache.keywordsMode) {
    cache.registry = loadFromDisk();
    cache.loadedAtMs = Date.now();
    cache.mtimeMs = mtime;
    cache.keywordsMode = mode;
  }
  return cache.registry;
}

/** Returns a single Scribe entry by id, or null if unknown. */
export function getScribe(id: string): ScribeEntry | null {
  const reg = getRegistry();
  return reg.scribes.find((s) => s.id === id) || null;
}

/** Returns the list of registered Scribe ids. */
export function listScribeIds(): string[] {
  return getRegistry().scribes.map((s) => s.id);
}

/**
 * Computes a keyword rarity map: lowercased keyword → count of Scribes that list it
 * in their primary keyword array. Keywords appearing in only one Scribe are rare and
 * signal highly specific (often synthetic-proper-noun) queries (K472/B121 Fix 1).
 *
 * Rarity of a keyword = 1 − (count / totalScribes). Keywords in 1 Scribe out of 9
 * have rarity ≈ 0.89; keywords in 2 Scribes have rarity ≈ 0.78.
 */
export function computeKeywordRarityMap(): Map<string, number> {
  const reg = getRegistry();
  const countByKeyword = new Map<string, number>();
  for (const scribe of reg.scribes) {
    for (const kw of scribe.keywords) {
      const key = kw.toLowerCase();
      countByKeyword.set(key, (countByKeyword.get(key) ?? 0) + 1);
    }
  }
  return countByKeyword;
}

/**
 * Lachesis scoring formula (per SP-22/23 spec + K436 prompt + K472 Fix 1):
 *   base score = (primary_matches * 1.0) + (adjacent_matches * 0.5)
 *   rare-token bonus = +1.0 per primary match via a keyword unique to this Scribe
 *
 * `themes` is the Clotho-extracted theme list (or a consult_scribes topic string).
 * Matching is case-insensitive substring against the Scribe's keyword library
 * (primary list) and adjacent-field text.
 *
 * `rarityMap` (optional, K472 Fix 1): maps lowercased keyword → Scribe count.
 * When provided, primary matches via keywords that appear in only one Scribe receive
 * an additive +1.0 bonus, boosting synthetic-proper-noun queries (e.g. "Verdania",
 * "Thornwick", "Reference Architecture") to score near-unity for the correct Scribe.
 * Natural-language queries are unaffected because their matching keywords are common.
 *
 * Returns 0 if the Scribe is unknown.
 */
export function scoreScribe(
  scribeId: string,
  themes: string[],
  rarityMap?: Map<string, number>,
): { score: number; primaryMatches: string[]; adjacentMatches: string[] } {
  const scribe = getScribe(scribeId);
  if (!scribe) return { score: 0, primaryMatches: [], adjacentMatches: [] };

  const primaryMatches = new Set<string>();
  const adjacentMatches = new Set<string>();
  // Tracks additive rare-token bonus per matched theme
  const rarityBonus = new Map<string, number>();

  const primaryHaystack = scribe.keywords.map((k) => k.toLowerCase());
  const primaryFieldLower = scribe.primary.field.toLowerCase();
  const adjacentHaystack = scribe.adjacents.map((a) => a.field.toLowerCase());

  for (const themeRaw of themes) {
    const theme = themeRaw.toLowerCase().trim();
    if (!theme) continue;

    // Find primary keyword match (first match wins to avoid double-counting)
    let matchedKeyword: string | null = null;
    for (const kw of primaryHaystack) {
      if (theme.includes(kw) || kw.includes(theme)) {
        matchedKeyword = kw;
        break;
      }
    }
    const hitsPrimary = matchedKeyword !== null || primaryFieldLower.includes(theme);

    if (hitsPrimary) {
      primaryMatches.add(themeRaw);
      // K472 Fix 1: rare-token bonus — keyword appears in only this Scribe's list.
      // Additive +1.0 per match; does not replace the base 1.0 primary credit.
      if (rarityMap && matchedKeyword) {
        const count = rarityMap.get(matchedKeyword) ?? 1;
        if (count === 1) {
          rarityBonus.set(themeRaw, (rarityBonus.get(themeRaw) ?? 0) + 1.0);
        }
      }
      continue; // do not double-count as adjacent if already primary
    }

    const hitsAdjacent = adjacentHaystack.some((field) =>
      field.includes(theme) || theme.includes(field),
    );
    if (hitsAdjacent) {
      adjacentMatches.add(themeRaw);
    }
  }

  const baseScore = primaryMatches.size * 1.0 + adjacentMatches.size * 0.5;
  const bonus = rarityBonus.size > 0
    ? Array.from(rarityBonus.values()).reduce((a, b) => a + b, 0)
    : 0;
  const score = baseScore + bonus;

  return {
    score,
    primaryMatches: Array.from(primaryMatches),
    adjacentMatches: Array.from(adjacentMatches),
  };
}
