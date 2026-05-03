/**
 * Keyword-Pyramid Strata Schema — KN-T1 / BP018
 * ===============================================
 * 7-layer keyword-pyramid substrate classification system.
 * Organizes substrate content from ephemeral (Sand) to immutable foundation (Bedrock).
 *
 * Pre-ratified: BP017 turns 60-61 (Keyword-Pyramid Strata Hierarchy canon).
 *
 * Composes with:
 *   Eblets (stratum field on frontmatter)
 *   House Scribe Jars (KN-J1 — stratum × cohort_class queries)
 *   Detective TEAM (KN104 — stratum × decay_score ranking)
 *   Multi-Trail Pheromone-Flavor (BP015 — 2D coordinate = stratum × flavor)
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_s = dirname(__filename);

export const STITCHPUNKS_DIR = resolve(__dirname_s, "../../stitchpunks");
export const STRATA_DIR = resolve(STITCHPUNKS_DIR, "strata");
export const STRATA_LEDGER = resolve(STRATA_DIR, "strata_assignments.jsonl");

export function ensureStrataDir(): void {
  if (!existsSync(STRATA_DIR)) mkdirSync(STRATA_DIR, { recursive: true });
}

// ─── 7-Stratum enumeration ───────────────────────────────────────────────────

export type Stratum =
  | "sand"
  | "soil"
  | "sediment"
  | "sandstone"
  | "limestone"
  | "granite"
  | "bedrock";

export const STRATUM_ORDINALS: Record<Stratum, number> = {
  sand:      0,   // ephemeral / freshly observed
  soil:      1,   // surface-layer / weakly canonical
  sediment:  2,   // settling / candidate-canonical
  sandstone: 3,   // compressed / actively-canonical
  limestone: 4,   // metamorphic-precursor / structurally-canonical
  granite:   5,   // hard-canonical / rarely-changes
  bedrock:   6,   // immutable-foundation / never-changes
};

export const ALL_STRATA: Stratum[] = ["sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"];

export function isValidStratum(s: string): s is Stratum {
  return s in STRATUM_ORDINALS;
}

// ─── Stratum assignment ───────────────────────────────────────────────────────

export interface StratumAssignment {
  topic: string;
  stratum: Stratum;
  ordinal: number;
  ratification_session: string;
  promotion_chain: string[];    // history of stratum transitions (e.g. ["sand", "soil", "sediment"])
  ts: string;                   // ISO-8601 last-modified timestamp
}

// ─── Ledger read/write ────────────────────────────────────────────────────────

export function readAllAssignments(): StratumAssignment[] {
  ensureStrataDir();
  if (!existsSync(STRATA_LEDGER)) return [];
  try {
    const raw = readFileSync(STRATA_LEDGER, "utf-8");
    // JSONL — last write per topic wins (in-memory dedup below)
    const lines = raw.split("\n").filter((l) => l.trim());
    const byTopic = new Map<string, StratumAssignment>();
    for (const line of lines) {
      try {
        const a = JSON.parse(line) as StratumAssignment;
        byTopic.set(a.topic, a);
      } catch { /* skip malformed */ }
    }
    return Array.from(byTopic.values());
  } catch {
    return [];
  }
}

export function writeAssignment(assignment: StratumAssignment): void {
  ensureStrataDir();
  appendFileSync(STRATA_LEDGER, JSON.stringify(assignment) + "\n", "utf-8");
}

export function getAssignment(topic: string): StratumAssignment | undefined {
  return readAllAssignments().find((a) => a.topic === topic);
}
