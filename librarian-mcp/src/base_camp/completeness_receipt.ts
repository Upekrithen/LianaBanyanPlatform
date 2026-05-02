/**
 * Make-Yourself-Comfortable Completeness Receipt
 * ===============================================
 * Generates the Make-Comfortable Receipt after bulk-load completes.
 * Measures files indexed, pheromones emitted, completeness %, and
 * Detective Phase-0 hit-ratio pre-vs-post improvement.
 *
 * Chronos Chronicler signed (HMAC-SHA256 via session timestamp).
 * Separate metric class from STUPENDOUS / COLOSSUS architecture measurement
 * per Founder turn 30 "I prefer not, as articulated".
 *
 * KN086 Phase 2 / BP010 / ATSRS-004
 */
import { createHmac } from "crypto";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { queryPheromone, STITCHPUNKS_DIR } from "../scribes/pheromone.js";
import type { BulkLoadResult } from "./pheromone_bulk_loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Paths ────────────────────────────────────────────────────────────────

export const BASE_CAMP_DIR = resolve(STITCHPUNKS_DIR, "base_camp");
export const RECEIPT_PATH = resolve(BASE_CAMP_DIR, "make_comfortable_receipt.json");

// ─── Schema ───────────────────────────────────────────────────────────────

export type ReceiptStatus = "comfortable" | "partial" | "failed";

export interface MakeComfortableReceipt {
  receipt_id: string;
  ts: string;
  user_choice_scope: {
    default_integrated: string[];
    user_added: string[];
    user_opted_out: string[];
  };
  shadow_results: Array<{
    shadow_id: string;
    files_indexed: number;
    pheromone_count: number;
    error_count: number;
    duration_ms: number;
  }>;
  files_indexed: number;
  pheromones_emitted: number;
  completeness_pct: number;
  canonical_file_count_target: number;
  detective_phase0_hit_ratio_pre_load: number;
  detective_phase0_hit_ratio_post_load: number;
  hit_ratio_improvement_factor: number;
  chronos_chronicler_sig: string;
  status: ReceiptStatus;
  next_recommended_action: string;
  error_count: number;
  errors: string[];
}

// ─── Chronos signing ─────────────────────────────────────────────────────

function chronosSign(payload: string): string {
  const secret = process.env.CHRONOS_SIGNING_SECRET ?? "base-camp-protocol-v1-bp010";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// ─── Receipt ID sequence ──────────────────────────────────────────────────

function nextReceiptId(): string {
  let seq = 1;
  if (existsSync(RECEIPT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(RECEIPT_PATH, "utf-8")) as MakeComfortableReceipt;
      const m = prev.receipt_id?.match(/MYC-(\d+)/);
      if (m) seq = parseInt(m[1], 10) + 1;
    } catch {
      // ignore
    }
  }
  return `MYC-${String(seq).padStart(3, "0")}`;
}

// ─── Detective Phase-0 hit-ratio measurement ─────────────────────────────

/**
 * Measure Detective Phase-0 hit ratio on a fixed test query set.
 * Returns the fraction of queries that return ≥1 high-decay hit (score ≥0.1).
 *
 * Test queries span the BP010 substrate-friction failure modes:
 * - Didasko / education / Sweet Sixteen
 * - HexIsle Ghost world
 * - Make yourself comfortable
 * - Treasure Maps
 * - canonical architecture primitives
 */
const TEST_QUERIES = [
  "Didasko Initiative education teaching Sweet Sixteen Crowns",
  "HexIsle Ghost world storefronts member journey",
  "Make yourself comfortable pheromone substrate all data at fingertips",
  "Treasure Maps interactive guides member navigation",
  "Base Camp Protocol Handshake LB Frame Install",
  "Iron Tablet Stone mutex atomic write concurrency",
  "Detective Phase-0 pheromone query hit ratio measurement",
  "canonical values Crown Jewels patent provisional applications",
];

export function measurePhase0HitRatio(): number {
  let hits = 0;
  for (const query of TEST_QUERIES) {
    const result = queryPheromone(query, { topK: 5, decayActive: true });
    if (result.hits.some((h) => h.decay_score >= 0.1)) {
      hits++;
    }
  }
  return hits / TEST_QUERIES.length;
}

// ─── Receipt generation ───────────────────────────────────────────────────

export interface ReceiptOptions {
  shadowResults: BulkLoadResult[];
  defaultIntegrated: string[];
  userAdded?: string[];
  userOptedOut?: string[];
  canonicalFileCountTarget?: number;
  /** Pre-load hit ratio (measured before bulk-load; pass from caller) */
  preLoadHitRatio?: number;
}

export function generateReceipt(opts: ReceiptOptions): MakeComfortableReceipt {
  const {
    shadowResults,
    defaultIntegrated,
    userAdded = [],
    userOptedOut = [],
    canonicalFileCountTarget = 500,
    preLoadHitRatio = 0,
  } = opts;

  const ts = new Date().toISOString();
  const receiptId = nextReceiptId();

  // Aggregate shadow results
  let totalFilesIndexed = 0;
  let totalPheromones = 0;
  let totalErrors = 0;
  const allErrors: string[] = [];

  const shadowSummaries = shadowResults.map((r) => {
    totalFilesIndexed += r.filesIndexed;
    totalPheromones += r.pheromoneCount;
    totalErrors += r.errorCount;
    allErrors.push(...r.errors);
    return {
      shadow_id: r.shadowId,
      files_indexed: r.filesIndexed,
      pheromone_count: r.pheromoneCount,
      error_count: r.errorCount,
      duration_ms: r.durationMs,
    };
  });

  const completenessPct = Math.min(
    100,
    Math.round((totalFilesIndexed / Math.max(canonicalFileCountTarget, 1)) * 100)
  );

  // Measure post-load hit ratio
  const postLoadHitRatio = measurePhase0HitRatio();
  const improvementFactor =
    preLoadHitRatio > 0
      ? Math.round((postLoadHitRatio / preLoadHitRatio) * 100) / 100
      : postLoadHitRatio > 0
      ? 999 // was zero; now positive → infinite improvement
      : 1;

  // Determine status
  let status: ReceiptStatus;
  if (totalErrors > totalFilesIndexed * 0.1) {
    status = "failed";
  } else if (completenessPct >= 90) {
    status = "comfortable";
  } else {
    status = "partial";
  }

  const nextAction =
    status === "comfortable"
      ? "Substrate complete per user-choice scope. Ready for STUPENDOUS BP012 fire (structurally higher-floor receipt than substrate-incompleteness baseline)."
      : status === "partial"
      ? `Completeness ${completenessPct}% — below 90% threshold. Knight diagnoses missing paths; re-run Make-Comfortable targeting failed shadow sub-tasks.`
      : `${totalErrors} errors during bulk-load. Diagnose substrate-friction class; Bouncer PASS_OVERRIDE may be needed for blocked path types.`;

  // Chronos sign the canonical payload
  const sigPayload = `${receiptId}|${ts}|${totalFilesIndexed}|${totalPheromones}|${completenessPct}|${postLoadHitRatio}`;
  const sig = chronosSign(sigPayload);

  const receipt: MakeComfortableReceipt = {
    receipt_id: receiptId,
    ts,
    user_choice_scope: {
      default_integrated: defaultIntegrated,
      user_added: userAdded,
      user_opted_out: userOptedOut,
    },
    shadow_results: shadowSummaries,
    files_indexed: totalFilesIndexed,
    pheromones_emitted: totalPheromones,
    completeness_pct: completenessPct,
    canonical_file_count_target: canonicalFileCountTarget,
    detective_phase0_hit_ratio_pre_load: preLoadHitRatio,
    detective_phase0_hit_ratio_post_load: postLoadHitRatio,
    hit_ratio_improvement_factor: improvementFactor,
    chronos_chronicler_sig: sig,
    status,
    next_recommended_action: nextAction,
    error_count: totalErrors,
    errors: allErrors.slice(0, 20),
  };

  // Persist receipt
  if (!existsSync(BASE_CAMP_DIR)) mkdirSync(BASE_CAMP_DIR, { recursive: true });
  writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), "utf-8");

  return receipt;
}
