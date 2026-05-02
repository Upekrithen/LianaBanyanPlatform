/**
 * Pheromone Bulk Loader — Make-Yourself-Comfortable Phase 2
 * ==========================================================
 * Crawls canonical paths, extracts trigger-relevant fragments, and emits
 * pheromone-substrate-writes for each file. Idempotent + incremental.
 * Chronos-signed via timestamp on each write.
 *
 * Shadow sub-tasks (alpha–eta) each call bulkLoadPaths() with their slice of
 * canonical paths. Theta calls aggregateReceipt() after all shadows complete.
 *
 * KN086 Phase 2 / BP010 / A&A #2317 Make-Yourself-Comfortable
 */
import {
  existsSync,
  readFileSync,
  statSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
} from "fs";
import { resolve, join, basename, extname, dirname } from "path";
import { fileURLToPath } from "url";

import { emitPheromone, STITCHPUNKS_DIR } from "../scribes/pheromone.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Paths ────────────────────────────────────────────────────────────────

export const BASE_CAMP_DIR = resolve(STITCHPUNKS_DIR, "base_camp");
export const PROGRESS_PATH = resolve(BASE_CAMP_DIR, "bulk_load_progress.json");
export const WORKSPACE_ROOT = resolve(__dirname, "..", "..", "..");

// ─── Types ────────────────────────────────────────────────────────────────

export interface BulkLoadOptions {
  /** Shadow sub-task id (alpha|beta|gamma|delta|epsilon|zeta|eta|theta) */
  shadowId?: string;
  /** Cathedral to tag pheromone records with (default "bishop") */
  cathedral?: string;
  /** Decay constant in days (overrides per-path default) */
  decayConstantDays?: number;
  /** Dry-run: report what would be indexed without writing */
  dryRun?: boolean;
  /** Only process files modified after this timestamp (incremental mode) */
  sinceMs?: number;
  /** Max characters to extract per file (default 4000) */
  maxCharsPerFile?: number;
  /** Scribe ID to tag pheromone records with (default "MakeComfortable") */
  scribeId?: string;
}

export interface BulkLoadResult {
  shadowId: string;
  pathsProcessed: string[];
  filesIndexed: number;
  filesSkipped: number;
  pheromoneCount: number;
  errorCount: number;
  errors: string[];
  durationMs: number;
  ts: string;
}

// ─── Fragment extraction ──────────────────────────────────────────────────

/**
 * Extract trigger-relevant fragments from a file's content.
 * Returns a compact string: filename + first heading + named entities +
 * Wrasse triggers (frontmatter) + canonical references.
 */
export function extractFragments(
  filePath: string,
  content: string,
  maxChars = 4000
): string {
  const lines = content.split("\n");
  const fragments: string[] = [];

  // Always include filename as context
  fragments.push(`file:${basename(filePath)}`);

  // Frontmatter block — highest signal (Wrasse triggers, session IDs, names)
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    fragments.push(fmMatch[1].substring(0, 800));
  }

  // First H1/H2 heading
  for (const line of lines) {
    if (line.startsWith("# ") || line.startsWith("## ")) {
      fragments.push(line);
      break;
    }
  }

  // Innovation numbers (#NNNN) — canonical references
  const innovations = content.match(/#\d{3,4}\b/g);
  if (innovations) {
    fragments.push(innovations.slice(0, 20).join(" "));
  }

  // K-numbers and B-numbers (session references)
  const sessionRefs = content.match(/\b[KB]\d{2,4}\b/g);
  if (sessionRefs) {
    const unique = [...new Set(sessionRefs)];
    fragments.push(unique.slice(0, 30).join(" "));
  }

  // First 600 chars of body content (below frontmatter)
  const bodyStart = fmMatch ? content.indexOf("---", 3) + 3 : 0;
  const body = content.substring(bodyStart, bodyStart + 1200).trim();
  if (body) fragments.push(body.substring(0, 600));

  const combined = fragments.join("\n");
  return combined.substring(0, maxChars);
}

// ─── Path expansion ───────────────────────────────────────────────────────

/**
 * Expand a glob-style path pattern into real file paths.
 * Supports simple * wildcards (no recursive **).
 * Resolves relative paths from WORKSPACE_ROOT.
 */
export function expandPath(pattern: string, workspaceRoot: string = WORKSPACE_ROOT): string[] {
  // Absolute vs relative
  const base = pattern.startsWith("/") || pattern.match(/^[A-Z]:/i)
    ? pattern
    : resolve(workspaceRoot, pattern);

  // No wildcard → treat as direct file or directory
  if (!base.includes("*")) {
    if (existsSync(base)) {
      const s = statSync(base);
      if (s.isDirectory()) {
        return readdirSync(base)
          .filter((f) => [".md", ".yaml", ".yml", ".jsonl", ".ts", ".py"].includes(extname(f)))
          .map((f) => join(base, f));
      }
      return [base];
    }
    return [];
  }

  // Has wildcard — split into directory + glob pattern
  const lastSlash = base.lastIndexOf("/") === -1 ? base.lastIndexOf("\\") : base.lastIndexOf("/");
  const dir = base.substring(0, lastSlash);
  const glob = base.substring(lastSlash + 1);

  if (!existsSync(dir)) return [];

  // Convert glob to regex (only * supported)
  const regexStr = "^" + glob.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
  let re: RegExp;
  try {
    re = new RegExp(regexStr, "i");
  } catch {
    return [];
  }

  try {
    return readdirSync(dir)
      .filter((f) => re.test(f))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

// ─── Progress tracking ────────────────────────────────────────────────────

interface ProgressRecord {
  [filePath: string]: { lastModMs: number; ts: string };
}

function loadProgress(): ProgressRecord {
  if (!existsSync(PROGRESS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(PROGRESS_PATH, "utf-8")) as ProgressRecord;
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressRecord): void {
  if (!existsSync(BASE_CAMP_DIR)) mkdirSync(BASE_CAMP_DIR, { recursive: true });
  writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
}

// ─── Core bulk-load ───────────────────────────────────────────────────────

/**
 * Bulk-load a list of path patterns into the pheromone substrate.
 *
 * Idempotent: re-running picks up new/modified files since last run.
 * Chronos-signed: each write uses current ISO timestamp.
 * Iron Tablet integration: pheromone writes compose with tablet-layer per KN089.
 */
export async function bulkLoadPaths(
  patterns: string[],
  options: BulkLoadOptions = {}
): Promise<BulkLoadResult> {
  const t0 = Date.now();
  const {
    shadowId = "solo",
    cathedral = "bishop",
    decayConstantDays,
    dryRun = false,
    sinceMs,
    maxCharsPerFile = 4000,
    scribeId = "MakeComfortable",
  } = options;

  const progress = loadProgress();
  const result: BulkLoadResult = {
    shadowId,
    pathsProcessed: [],
    filesIndexed: 0,
    filesSkipped: 0,
    pheromoneCount: 0,
    errorCount: 0,
    errors: [],
    durationMs: 0,
    ts: new Date().toISOString(),
  };

  for (const pattern of patterns) {
    const files = expandPath(pattern);

    for (const filePath of files) {
      result.pathsProcessed.push(filePath);

      let modMs = 0;
      try {
        modMs = statSync(filePath).mtimeMs;
      } catch (e) {
        result.errors.push(`stat failed: ${filePath}: ${e}`);
        result.errorCount++;
        continue;
      }

      // Incremental: skip if not modified since last run (unless sinceMs override)
      const threshold = sinceMs ?? 0;
      const lastRun = progress[filePath];
      if (lastRun && lastRun.lastModMs >= modMs && modMs > threshold) {
        result.filesSkipped++;
        continue;
      }

      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch (e) {
        result.errors.push(`read failed: ${filePath}: ${e}`);
        result.errorCount++;
        continue;
      }

      const fragment = extractFragments(filePath, content, maxCharsPerFile);
      const tabletId = `myc::${filePath.replace(/\\/g, "/").replace(/[^a-zA-Z0-9/_.-]/g, "_")}`;
      const decay = decayConstantDays ?? 60;

      if (!dryRun) {
        try {
          emitPheromone(scribeId, tabletId, fragment, {
            cathedral,
            decayConstantDays: decay,
            ts: new Date().toISOString(),
          });

          progress[filePath] = { lastModMs: modMs, ts: new Date().toISOString() };
          result.pheromoneCount++;
        } catch (e) {
          result.errors.push(`emit failed: ${filePath}: ${e}`);
          result.errorCount++;
          continue;
        }
      } else {
        result.pheromoneCount++;
      }

      result.filesIndexed++;
    }
  }

  if (!dryRun) {
    saveProgress(progress);
  }

  result.durationMs = Date.now() - t0;
  return result;
}
