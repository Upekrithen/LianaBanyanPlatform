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
export declare const DEFAULT_HS_PREFERENCES: HouseScribePreferences;
export interface SubstrateCounts {
    pheromone_records: number;
    lb_frame_instances: number;
    active_hive_threads: number;
    cathedral_tablets: Record<string, number>;
}
export interface RatioAnalysis {
    substrate_class: string;
    current_count: number;
    target_ratio: number;
    recommended_hs_count: number;
    current_hs_count: number;
    delta: number;
    drift_pct: number;
    alert: boolean;
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
    spawn_count: number;
    archive_count: number;
    alert_count: number;
}
export interface HsInstance {
    instance_id: string;
    cathedral: string;
    spawned_at: string;
    last_active_at: string;
    substrate_class: string;
    active: boolean;
}
export declare function readHsInstances(): HsInstance[];
export declare function writeHsInstances(instances: HsInstance[]): void;
export declare function countActiveHsInstances(): number;
/**
 * Count Pheromone records in the substrate index.
 * Reads the pheromone JSONL file and counts lines.
 */
export declare function countPheromoneRecords(stitchpunksDir?: string): number;
/**
 * Count Cathedral tablets per-cathedral by reading JSONL scribe files.
 */
export declare function countCathedralTablets(stitchpunksDir?: string): Record<string, number>;
/**
 * Run the House Scribe population-ratio audit.
 * Returns recommendations for spawn/archive decisions.
 *
 * BRIDLE Rule 4: any exception surfaces data_available=false.
 * Never silently scales wrong.
 */
export declare function runPopulationAudit(prefs?: Partial<HouseScribePreferences>, stitchpunksDir?: string): PopulationAuditResult;
