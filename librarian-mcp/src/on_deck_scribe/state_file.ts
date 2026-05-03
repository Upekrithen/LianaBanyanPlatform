/**
 * On Deck Scribe — Canonical State File Types — KN-Q1 / BP018
 * ============================================================
 * Append-only JSONL ledger at ~/.claude/state/on_deck_scribe/queue.jsonl.
 * One entry per line; mutations are NEW lines with the same `id`.
 * Reader reduces to latest-line-per-id to get current state.
 *
 * State file IS the queue Knight reads next; Shadow E-Giants pre-stage it
 * via prepared_context attachment.
 *
 * Composes with:
 *   Pod-Q KN-Q2 — MCP tool wiring
 *   Pod-Q KN-Q3 — Wrasse pre-injection triggers
 *   Pod-R        — Shadow E-Giant overlap-trigger consumer
 *   Pod-G LANDED af1cc47 — Shadow Alternating Cylinder Fire
 *   KN-J5 HsCohortClass — cohort-based access semantics
 */

import { homedir } from "os";
import { resolve } from "path";

// ─── Substrate path ────────────────────────────────────────────────────────────

export const ODS_DIR  = resolve(homedir(), ".claude", "state", "on_deck_scribe");
export const ODS_QUEUE = resolve(ODS_DIR, "queue.jsonl");
export const ODS_SERIAL = resolve(ODS_DIR, "serial.txt");

// ─── Canonical cohort class ────────────────────────────────────────────────────
// Mirrors HsCohortClass from cross_cathedral_router.ts (avoid circular import)

export type HsCohortClass =
  | "lone_wolf"
  | "pied_piper_tier_1"
  | "federation_member"
  | "excalibur_subscriber"
  | "thirteenth_warrior";

// ─── Flavor class ──────────────────────────────────────────────────────────────
// BP015 multi-trail pheromone-flavor

export type FlavorClass =
  | "cinnamon"
  | "vanilla"
  | "cardamom"
  | "saffron"
  | "miner";

// ─── Bee-canon Marks attribution ───────────────────────────────────────────────

export type BeeCanonMarks = {
  workers_drones_pro_rata: number;   // pro-rata Marks for K-prompt build work
  queen_multiplier: number;          // 1.5× for Queen-class contribution
  project_cohort_multiplier: number; // 1.25× for project-cohort attribution
};

// ─── Prepared context ──────────────────────────────────────────────────────────
// Shadow E-Giant pre-staging output; attached before Knight auto-fires

export type DetectiveFinding = {
  trigger: string;
  scribe: string;
  excerpt: string;
  score: number;
};

export type PreparedContext = {
  shadow_id: string;                        // which Shadow E-Giant (alpha-theta) prepared it
  prep_ts: string;                          // ISO-8601
  wrasse_pre_injections: string[];          // Eblet paths bulk-loaded
  detective_findings: DetectiveFinding[];   // Phase-0 hits already cached
  prerequisite_context_summary: string;     // prereq commits + test results summary
};

// ─── On Deck Entry ─────────────────────────────────────────────────────────────

export type OnDeckStatus =
  | "queued"
  | "in_flight"
  | "landed"
  | "deferred"
  | "errored";

export type OnDeckCategory =
  | "knight"
  | "bishop"
  | "shadow"
  | "pawn"
  | "rook";

export type OnDeckEntry = {
  id: string;                              // LB-ODS-NNNN serial
  category: OnDeckCategory;
  pod_class?: string;                      // e.g. "Q" / "R" / "N" / "J6"
  k_prompt_path: string;                   // absolute path to PROMPT_KNIGHT_*.md
  status: OnDeckStatus;
  priority: number;                        // 0 = highest; lower numbers fire first
  prerequisites: string[];                 // entry IDs that must be "landed" first
  cohort_class?: HsCohortClass;
  flavor_class?: FlavorClass;
  prepared_context?: PreparedContext;      // Shadow pre-staging (null until pre-staged)
  ts_queued: string;                       // ISO-8601
  ts_in_flight?: string;
  ts_landed?: string;
  error_reason?: string;
  commit_hash?: string;                    // git commit when landed
  bee_canon_attribution?: BeeCanonMarks;
};

// ─── Serialization helpers ─────────────────────────────────────────────────────

export function serializeEntry(entry: OnDeckEntry): string {
  return JSON.stringify(entry);
}

export function deserializeEntry(line: string): OnDeckEntry | null {
  try {
    return JSON.parse(line.trim()) as OnDeckEntry;
  } catch {
    return null;
  }
}
