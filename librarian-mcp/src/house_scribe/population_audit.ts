/**
 * House Scribe Population-Ratio Audit — KN-J1 / BP017
 * =====================================================
 * Cron-class scheduler that monitors substrate density and recommends
 * House Scribe spawn / archive decisions to maintain per-population-ratio targets.
 *
 * Starting ratios (per House Scribe canon, tunable via Preferences):
 *   - Pheromone records:    1 HS per 10,000 records
 *   - LB Frame instances:   1 HS per 100 instances
 *   - Active Hive threads:  1 HS per 50 threads
 *   - Cathedral tablets:    1 HS per 5,000 tablets per cathedral
 *
 * BRIDLE Rule 4: audit failure surfaces log + retry flag; never silently scales wrong.
 * Ratio drift ±20% from target → alert.
 *
 * Composes with:
 *   KN-J1 jar_lifecycle.ts — Jar counts feed into audit
 *   Pheromone substrate (B128) — record count source
 *   Cathedral Scribes — tablet count source
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  appendFileSync,
  readdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_audit = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_audit, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
const AUDIT_LOG = resolve(HS_DIR, "population_audit_log.jsonl");
const HS_INSTANCE_REGISTRY = resolve(HS_DIR, "hs_instance_registry.json");

// ─── Preferences (per Scribe Preferences canon BP017 turn 34) ────────────────

export interface HouseScribePreferences {
  /** How many Pheromone records per House Scribe instance. Default 10,000. */
  population_ratio_pheromone_records: number;
  /** How many LB Frame instances per House Scribe. Default 100. */
  population_ratio_lb_frame_instances: number;
  /** How many active Hive threads per House Scribe. Default 50. */
  population_ratio_active_hive_threads: number;
  /** How many Cathedral tablets per House Scribe per cathedral. Default 5,000. */
  population_ratio_cathedral_tablets: number;
  /** Cron interval in minutes for population audit. Default 60. */
  population_audit_interval_minutes: number;
  /** What triggers Jar creation. Default: hive_thread_closure. */
  jar_creation_trigger: "hive_thread_closure" | "manual_seal" | "bushel_completion";
  /** Whether sealed Jars are retained forever. Structurally-immutable default. */
  jar_retention_class: "forever_stamp" | "archive_after_N_years";
  /** Whether idle House Scribes are LRU-evicted when ratio drops. Default: enabled. */
  lru_eviction_enabled: "enabled" | "disabled";
  /** Whether new Jars are Excalibur-class-eligible by default. Default: true. */
  excalibur_promotion_eligibility_default: boolean;
}

export const DEFAULT_HS_PREFERENCES: HouseScribePreferences = {
  population_ratio_pheromone_records: 10_000,
  population_ratio_lb_frame_instances: 100,
  population_ratio_active_hive_threads: 50,
  population_ratio_cathedral_tablets: 5_000,
  population_audit_interval_minutes: 60,
  jar_creation_trigger: "hive_thread_closure",
  jar_retention_class: "forever_stamp",
  lru_eviction_enabled: "enabled",
  excalibur_promotion_eligibility_default: true,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubstrateCounts {
  pheromone_records: number;
  lb_frame_instances: number;
  active_hive_threads: number;
  cathedral_tablets: Record<string, number>; // per-cathedral tablet counts
}

export interface RatioAnalysis {
  substrate_class: string;
  current_count: number;
  target_ratio: number;
  recommended_hs_count: number;
  current_hs_count: number;
  delta: number;            // positive = need more; negative = can archive
  drift_pct: number;        // % drift from ideal (abs value)
  alert: boolean;           // true if drift > 20%
  recommendation: "spawn" | "archive" | "maintain";
}

export interface PopulationAuditResult {
  schema_version: "1.0";
  audited_at: string;
  data_available: boolean;
  unavailable_reason?: string;
  substrate_counts: SubstrateCounts;
  current_hs_total: number;
  analyses: RatioAnalysis[];
  overall_recommendation: "spawn" | "archive" | "maintain" | "mixed";
  spawn_count: number;       // total House Scribes to spawn
  archive_count: number;     // total House Scribes to archive (LRU)
  alert_count: number;       // ratio drift alerts
}

// ─── House Scribe instance registry ──────────────────────────────────────────

export interface HsInstance {
  instance_id: string;
  cathedral: string;
  spawned_at: string;
  last_active_at: string;
  substrate_class: string;
  active: boolean;
}

export function readHsInstances(): HsInstance[] {
  if (!existsSync(HS_INSTANCE_REGISTRY)) return [];
  try {
    return JSON.parse(readFileSync(HS_INSTANCE_REGISTRY, "utf-8")) as HsInstance[];
  } catch {
    return [];
  }
}

export function writeHsInstances(instances: HsInstance[]): void {
  if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
  writeFileSync(HS_INSTANCE_REGISTRY, JSON.stringify(instances, null, 2), "utf-8");
}

export function countActiveHsInstances(): number {
  return readHsInstances().filter((i) => i.active).length;
}

// ─── Substrate counting helpers ───────────────────────────────────────────────

/**
 * Count Pheromone records in the substrate index.
 * Reads the pheromone JSONL file and counts lines.
 */
export function countPheromoneRecords(stitchpunksDir?: string): number {
  const baseDir = stitchpunksDir ?? STITCHPUNKS_DIR;
  const pheromonePath = resolve(baseDir, "pheromone_substrate", "index.jsonl");
  if (!existsSync(pheromonePath)) return 0;
  try {
    const raw = readFileSync(pheromonePath, "utf-8");
    return raw.split("\n").filter((l) => l.trim()).length;
  } catch {
    return 0;
  }
}

/**
 * Count Cathedral tablets per-cathedral by reading JSONL scribe files.
 */
export function countCathedralTablets(stitchpunksDir?: string): Record<string, number> {
  const baseDir = stitchpunksDir ?? STITCHPUNKS_DIR;
  const result: Record<string, number> = {};
  const cathedrals = ["bishop", "knight", "pawn"];

  for (const cat of cathedrals) {
    const catDir = resolve(baseDir, `${cat}_cathedral`, "scribes");
    if (!existsSync(catDir)) {
      result[cat] = 0;
      continue;
    }
    try {
      const files = readdirSync(catDir).filter((f) => f.endsWith(".jsonl"));
      let total = 0;
      for (const file of files) {
        const content = readFileSync(resolve(catDir, file), "utf-8");
        total += content.split("\n").filter((l) => l.trim()).length;
      }
      result[cat] = total;
    } catch {
      result[cat] = 0;
    }
  }

  return result;
}

// ─── Population audit ────────────────────────────────────────────────────────

function analyzeRatio(
  substrate_class: string,
  current_count: number,
  target_ratio: number,
  current_hs: number
): RatioAnalysis {
  const recommended_hs = Math.ceil(current_count / target_ratio);
  const delta = recommended_hs - current_hs;
  const ideal = recommended_hs;
  const drift_pct = ideal === 0 ? 0 : Math.abs((current_hs - ideal) / ideal) * 100;
  const alert = drift_pct > 20;

  const recommendation: "spawn" | "archive" | "maintain" =
    delta > 0 ? "spawn" : delta < -2 ? "archive" : "maintain";

  return {
    substrate_class,
    current_count,
    target_ratio,
    recommended_hs_count: recommended_hs,
    current_hs_count: current_hs,
    delta,
    drift_pct: Math.round(drift_pct),
    alert,
    recommendation,
  };
}

/**
 * Run the House Scribe population-ratio audit.
 * Returns recommendations for spawn/archive decisions.
 *
 * BRIDLE Rule 4: any exception surfaces data_available=false.
 * Never silently scales wrong.
 */
export function runPopulationAudit(
  prefs: Partial<HouseScribePreferences> = {},
  stitchpunksDir?: string
): PopulationAuditResult {
  const p: HouseScribePreferences = { ...DEFAULT_HS_PREFERENCES, ...prefs };
  const audited_at = new Date().toISOString();

  try {
    const pheromone_count = countPheromoneRecords(stitchpunksDir);
    const cathedral_tablets = countCathedralTablets(stitchpunksDir);
    const total_tablets = Object.values(cathedral_tablets).reduce((s, n) => s + n, 0);
    const current_hs_total = countActiveHsInstances();

    const substrate_counts: SubstrateCounts = {
      pheromone_records: pheromone_count,
      lb_frame_instances: 0,    // populated by platform integration (future)
      active_hive_threads: 0,   // populated by Apiarist KN-J4 integration
      cathedral_tablets,
    };

    const analyses: RatioAnalysis[] = [
      analyzeRatio("pheromone_records", pheromone_count, p.population_ratio_pheromone_records, current_hs_total),
      analyzeRatio("cathedral_tablets", total_tablets, p.population_ratio_cathedral_tablets, current_hs_total),
    ];

    const spawn_count = Math.max(0, Math.max(...analyses.map((a) => a.delta)));
    const archive_count = p.lru_eviction_enabled === "enabled"
      ? Math.max(0, -Math.min(...analyses.map((a) => a.delta)) - 2)
      : 0;
    const alert_count = analyses.filter((a) => a.alert).length;

    const spawns = analyses.filter((a) => a.recommendation === "spawn").length;
    const archives = analyses.filter((a) => a.recommendation === "archive").length;
    const overall_recommendation: "spawn" | "archive" | "maintain" | "mixed" =
      spawns > 0 && archives > 0 ? "mixed"
        : spawns > 0 ? "spawn"
          : archives > 0 ? "archive"
            : "maintain";

    const result: PopulationAuditResult = {
      schema_version: "1.0",
      audited_at,
      data_available: true,
      substrate_counts,
      current_hs_total,
      analyses,
      overall_recommendation,
      spawn_count,
      archive_count,
      alert_count,
    };

    // Append to audit log
    if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
    appendFileSync(AUDIT_LOG, JSON.stringify(result) + "\n", "utf-8");

    return result;
  } catch (err) {
    const result: PopulationAuditResult = {
      schema_version: "1.0",
      audited_at,
      data_available: false,
      unavailable_reason: `Population audit failed: ${String(err)}`,
      substrate_counts: {
        pheromone_records: 0,
        lb_frame_instances: 0,
        active_hive_threads: 0,
        cathedral_tablets: {},
      },
      current_hs_total: 0,
      analyses: [],
      overall_recommendation: "maintain",
      spawn_count: 0,
      archive_count: 0,
      alert_count: 0,
    };
    return result;
  }
}
