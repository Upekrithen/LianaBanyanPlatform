/**
 * House Scribe Cross-Cathedral Coordinate Router — KN-J5 / BP017
 * ===============================================================
 * Enables cross-cathedral Jar queries via the 8-digit grid coordinate scheme.
 *
 * Supported cross-cathedral patterns:
 *   `01-*-*-*`       All Jars in bishop cathedral (single-cathedral fan-out)
 *   `99-*-*-*`       Cross-cathedral reserved query (all non-own-cathedral Jars)
 *   `*-*-*-*`        All Jars across all cathedrals (Federation Members only)
 *   `01..04-*-*-*`   Jars in cathedrals 01–04 (range query)
 *
 * Cohort-class enforcement (per Federation Scribe-sharing canon BP016):
 *   lone_wolf              → own-cathedral only (read_cohort_minimum = lone_wolf)
 *   pied_piper_tier_1      → own-cathedral + Pied-Piper-class Jars
 *   federation_member      → full cross-cathedral read
 *   excalibur_subscriber   → curated Excalibur-class Jars (Layer 5)
 *   thirteenth_warrior     → Layer 7+ civilization-class access
 *
 * Detective TEAM fan-out:
 *   - Dispatches per-cathedral House Scribe instances
 *   - Synthesis aggregator merges results
 *   - Substrate write-back logs `house_scribe_cross_cathedral_query` provenance class
 *
 * Cache layer:
 *   - Per-cathedral Jar-index summary (cell-density per coordinate)
 *   - Cache-invalidation on Pheromone substrate write-events (Augur Living Gate)
 *   - Composes with KN-J3 living-gridwork freshness
 *
 * BRIDLE Rule 4 conservative defaults:
 *   - Insufficient cohort-class → reject with advancement-suggestion (no silent truncation)
 *   - Cathedral unavailable → partial results + flag (no silent drop)
 *   - Cache-stale detection → fallback to source-of-truth per-cathedral House Scribe
 *
 * Composes with:
 *   KN-J1 jar_lifecycle.ts
 *   KN-J2 coordinate_scheme.ts + coordinate_assignment.ts
 *   KN-J3 living_gridwork.ts
 *   KN-J4 apiarist_hive_subscriber.ts
 *   KN104 team_dispatcher + cohort_class_enforcement
 */
import { type JarOfHoney } from "./jar_lifecycle.js";
export type HsCohortClass = "lone_wolf" | "pied_piper_tier_1" | "federation_member" | "excalibur_subscriber" | "thirteenth_warrior";
export interface CrossCathedralQueryOpts {
    pattern: string;
    querier_cohort_class: HsCohortClass;
    querier_cathedral?: string;
    limit?: number;
    offset?: number;
    use_cache?: boolean;
}
export interface CathedralResult {
    cathedral_id: string;
    cathedral_name: string;
    jars: JarOfHoney[];
    available: boolean;
    error?: string;
}
export interface CrossCathedralQueryResult {
    data_available: boolean;
    pattern: string;
    querier_cohort_class: HsCohortClass;
    jars: JarOfHoney[];
    per_cathedral: CathedralResult[];
    total_found: number;
    cache_used: boolean;
    cache_stale?: boolean;
    cohort_rejected?: boolean;
    cohort_advancement_suggestion?: string;
    provenance_serial?: string;
    bridle_rule_4?: string;
    partial_results?: boolean;
}
/**
 * Execute a cross-cathedral Jar query.
 * Enforces cohort-class, fans out to N cathedrals, merges results.
 */
export declare function queryCrossCathedral(opts: CrossCathedralQueryOpts): CrossCathedralQueryResult;
/**
 * Invalidate the cross-cathedral cache for a given pattern.
 * Called by KN-J3 Augur Living Gate on Pheromone write-events.
 */
export declare function invalidateCrossCache(pattern?: string): void;
/**
 * Query cross-cathedral provenance log.
 */
export declare function queryCrossCathedralProvenance(limit?: number): Array<Record<string, unknown>>;
