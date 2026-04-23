/**
 * Scribes Cathedral Registry Loader (SP-23 / K436)
 * ================================================
 * Parses `librarian-mcp/stitchpunks/scribes/registry.yaml` once at server start,
 * caches in-process. Exposes the public surface used by the Three Fates router
 * (Lachesis scoring) and by the consult_scribes tool.
 */
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

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
}

const cache: RegistryCache = { registry: null, loadedAtMs: 0, mtimeMs: 0 };

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
  return parsed as ScribesRegistry;
}

/** Returns the parsed registry. Re-reads from disk if the YAML mtime changed. */
export function getRegistry(forceReload = false): ScribesRegistry {
  const mtime = existsSync(REGISTRY_PATH) ? statSync(REGISTRY_PATH).mtimeMs : 0;
  if (!cache.registry || forceReload || mtime !== cache.mtimeMs) {
    cache.registry = loadFromDisk();
    cache.loadedAtMs = Date.now();
    cache.mtimeMs = mtime;
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
 * Lachesis scoring formula (per SP-22/23 spec + K436 prompt):
 *   score = (primary_matches * 1.0) + (adjacent_matches * 0.5)
 *
 * `themes` is the Clotho-extracted theme list. Matching is case-insensitive
 * substring against the Scribe's keyword library (primary list) and against the
 * Scribe's adjacent-field text.
 *
 * Returns 0 if the Scribe is unknown.
 */
export function scoreScribe(
  scribeId: string,
  themes: string[],
): { score: number; primaryMatches: string[]; adjacentMatches: string[] } {
  const scribe = getScribe(scribeId);
  if (!scribe) return { score: 0, primaryMatches: [], adjacentMatches: [] };

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
      continue; // do not double-count as adjacent if already primary
    }

    const hitsAdjacent = adjacentHaystack.some((field) =>
      field.includes(theme) || theme.includes(field),
    );
    if (hitsAdjacent) {
      adjacentMatches.add(themeRaw);
    }
  }

  const score = primaryMatches.size * 1.0 + adjacentMatches.size * 0.5;
  return {
    score,
    primaryMatches: Array.from(primaryMatches),
    adjacentMatches: Array.from(adjacentMatches),
  };
}
