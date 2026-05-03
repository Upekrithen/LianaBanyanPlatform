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
import { readAllJars, } from "./jar_lifecycle.js";
import { CATHEDRAL_IDS, CATHEDRAL_FROM_ID, coordinateMatchesQuery, parseWildcardQuery, } from "./coordinate_scheme.js";
import { buildGridworkSnapshot } from "./living_gridwork.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname_cc = dirname(__filename);
const STITCHPUNKS_DIR = resolve(__dirname_cc, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
const CROSS_CATHEDRAL_CACHE = resolve(HS_DIR, "cross_cathedral_cache.json");
const CROSS_CATHEDRAL_PROVENANCE = resolve(HS_DIR, "cross_cathedral_provenance.jsonl");
// Reserved cathedral ID for cross-cathedral wildcard
const CROSS_CATHEDRAL_ID = "99";
// All known cathedral IDs (for fan-out)
const ALL_CATHEDRAL_IDS = Object.values(CATHEDRAL_IDS).filter((id) => id !== CROSS_CATHEDRAL_ID);
/** Cohort rank for comparison (higher = broader access). */
const COHORT_RANK = {
    lone_wolf: 0,
    pied_piper_tier_1: 1,
    federation_member: 2,
    excalibur_subscriber: 3,
    thirteenth_warrior: 4,
};
/** Jar CohortMinimum → minimum HsCohortClass required to read. */
const COHORT_MIN_RANK = {
    lone_wolf: 0,
    pied_piper_tier_1: 1,
    federation_member: 2,
    excalibur_subscriber: 3,
    thirteenth_warrior: 4,
};
function parseCrossPattern(pattern) {
    // `*-*-*-*` → all cathedrals
    if (pattern === "*-*-*-*") {
        return { mode: "all", cathedral_ids: ALL_CATHEDRAL_IDS, sub_pattern: "*-*-*" };
    }
    // `99-*-*-*` → cross-cathedral (all non-own)
    if (pattern.startsWith("99-")) {
        const sub = pattern.slice(3); // strip "99-"
        return { mode: "cross_cathedral", cathedral_ids: ALL_CATHEDRAL_IDS, sub_pattern: sub };
    }
    // `01..04-*-*-*` → range
    const rangeMatch = pattern.match(/^(\d{2})\.\.(\d{2})-(.+)$/);
    if (rangeMatch) {
        const lo = parseInt(rangeMatch[1], 10);
        const hi = parseInt(rangeMatch[2], 10);
        const sub = rangeMatch[3];
        const ids = ALL_CATHEDRAL_IDS.filter((id) => {
            const n = parseInt(id, 10);
            return n >= lo && n <= hi;
        });
        return { mode: "range", cathedral_ids: ids, sub_pattern: sub };
    }
    // `01-*-*-*` → single cathedral
    const singleMatch = pattern.match(/^(\d{2})-(.+)$/);
    if (singleMatch) {
        const catId = singleMatch[1];
        const sub = singleMatch[2];
        return { mode: "single", cathedral_ids: [catId], sub_pattern: sub };
    }
    return null;
}
// ─── Cohort enforcement ───────────────────────────────────────────────────────
function checkCohortAccess(mode, querier, querier_cathedral) {
    if (mode === "all" || mode === "cross_cathedral") {
        // Federation Members and above can do full cross-cathedral
        if (COHORT_RANK[querier] < COHORT_RANK["federation_member"]) {
            return {
                allowed: false,
                suggestion: "Cross-cathedral access requires Federation Member cohort-class or higher. " +
                    "Advance your cohort by participating in Federation governance votes.",
            };
        }
    }
    if (mode === "range") {
        if (COHORT_RANK[querier] < COHORT_RANK["pied_piper_tier_1"]) {
            return {
                allowed: false,
                suggestion: "Range queries require Pied Piper Tier 1 or higher cohort-class.",
            };
        }
    }
    return { allowed: true };
}
function filterJarsByCohort(jars, querier) {
    const rank = COHORT_RANK[querier];
    return jars.filter((jar) => {
        const minRank = COHORT_MIN_RANK[jar.read_cohort_minimum ?? "lone_wolf"] ?? 0;
        return rank >= minRank;
    });
}
// ─── Per-cathedral fan-out ────────────────────────────────────────────────────
function queryOneCathedral(cathedral_id, sub_pattern, querier) {
    const cathedral_name = CATHEDRAL_FROM_ID[cathedral_id] ?? "unknown";
    try {
        const allJars = readAllJars();
        // Filter: Jars in this cathedral that match the sub-pattern (tier-flavor-slot)
        const fullPattern = `${cathedral_id}-${sub_pattern}`;
        const parsed = parseWildcardQuery(fullPattern);
        let jars;
        if (!parsed) {
            // Treat as exact coordinate if it validates
            jars = allJars.filter((j) => j.coordinate && j.coordinate.startsWith(cathedral_id));
        }
        else {
            jars = allJars.filter((j) => {
                if (!j.coordinate)
                    return false;
                return coordinateMatchesQuery(j.coordinate, parsed);
            });
        }
        // Cohort filter
        const filtered = filterJarsByCohort(jars, querier);
        return { cathedral_id, cathedral_name, jars: filtered, available: true };
    }
    catch (err) {
        return {
            cathedral_id,
            cathedral_name,
            jars: [],
            available: false,
            error: String(err),
        };
    }
}
function loadCache() {
    if (!existsSync(CROSS_CATHEDRAL_CACHE))
        return [];
    try {
        return JSON.parse(readFileSync(CROSS_CATHEDRAL_CACHE, "utf-8"));
    }
    catch {
        return [];
    }
}
function saveCache(store) {
    try {
        if (!existsSync(HS_DIR))
            mkdirSync(HS_DIR, { recursive: true });
        writeFileSync(CROSS_CATHEDRAL_CACHE, JSON.stringify(store, null, 2), "utf-8");
    }
    catch {
        // non-fatal
    }
}
function getLivingSnapshotHash() {
    try {
        const snap = buildGridworkSnapshot();
        const count = snap.cells.length;
        const densities = snap.cells.map((c) => c.jar_count).join(",");
        return `${count}:${densities}`;
    }
    catch {
        return "";
    }
}
function lookupCache(pattern, querier) {
    const store = loadCache();
    const entry = store.find((e) => e.pattern === pattern && e.querier_cohort_class === querier);
    if (!entry)
        return { hit: false, stale: false };
    const currentHash = getLivingSnapshotHash();
    const stale = currentHash !== entry.living_snapshot_hash;
    return { hit: true, entry, stale };
}
function writeCache(pattern, querier, results, per_cathedral_counts) {
    const store = loadCache().filter((e) => !(e.pattern === pattern && e.querier_cohort_class === querier));
    const entry = {
        pattern,
        querier_cohort_class: querier,
        results,
        per_cathedral_counts,
        cached_at: new Date().toISOString(),
        living_snapshot_hash: getLivingSnapshotHash(),
    };
    store.push(entry);
    saveCache(store);
}
// ─── Provenance write-back ────────────────────────────────────────────────────
function writeProvenanceEntry(pattern, querier, result_count, cathedral_ids_queried) {
    const serial = `LB-CROSS.HS-${Date.now()}`;
    const entry = {
        serial,
        provenance_class: "house_scribe_cross_cathedral_query",
        pattern,
        querier_cohort_class: querier,
        cathedral_ids_queried,
        result_count,
        timestamp: new Date().toISOString(),
    };
    try {
        if (!existsSync(HS_DIR))
            mkdirSync(HS_DIR, { recursive: true });
        appendFileSync(CROSS_CATHEDRAL_PROVENANCE, JSON.stringify(entry) + "\n", "utf-8");
    }
    catch {
        // non-fatal
    }
    return serial;
}
// ─── Main cross-cathedral router ──────────────────────────────────────────────
/**
 * Execute a cross-cathedral Jar query.
 * Enforces cohort-class, fans out to N cathedrals, merges results.
 */
export function queryCrossCathedral(opts) {
    const { pattern, querier_cohort_class, querier_cathedral, limit = 1000, offset = 0, use_cache = true, } = opts;
    // Parse pattern
    const parsed = parseCrossPattern(pattern);
    if (!parsed) {
        return {
            data_available: false,
            pattern,
            querier_cohort_class,
            jars: [],
            per_cathedral: [],
            total_found: 0,
            cache_used: false,
            bridle_rule_4: `HALT — unrecognised cross-cathedral pattern: "${pattern}". Valid: NN-*-*-*, 99-*-*-*, *-*-*-*, NN..NN-*-*-*.`,
        };
    }
    // Cohort enforcement
    const access = checkCohortAccess(parsed.mode, querier_cohort_class, querier_cathedral);
    if (!access.allowed) {
        return {
            data_available: false,
            pattern,
            querier_cohort_class,
            jars: [],
            per_cathedral: [],
            total_found: 0,
            cache_used: false,
            cohort_rejected: true,
            cohort_advancement_suggestion: access.suggestion,
            bridle_rule_4: "HALT — cohort-class insufficient for cross-cathedral access.",
        };
    }
    // For lone_wolf: restrict to own cathedral only
    let targetCathedralIds = parsed.cathedral_ids;
    if (querier_cohort_class === "lone_wolf" && querier_cathedral) {
        const ownId = CATHEDRAL_IDS[querier_cathedral] ?? querier_cathedral;
        targetCathedralIds = [ownId];
    }
    // Cache lookup
    const cacheKey = `${pattern}@${querier_cohort_class}`;
    if (use_cache) {
        const { hit, entry, stale } = lookupCache(pattern, querier_cohort_class);
        if (hit && entry && !stale) {
            const serial = writeProvenanceEntry(pattern, querier_cohort_class, entry.results.length, targetCathedralIds);
            const paginated = entry.results.slice(offset, offset + limit);
            return {
                data_available: true,
                pattern,
                querier_cohort_class,
                jars: paginated,
                per_cathedral: [],
                total_found: entry.results.length,
                cache_used: true,
                cache_stale: false,
                provenance_serial: serial,
            };
        }
        if (hit && stale) {
            // Proceed to fresh query; report stale flag
        }
    }
    // Fan-out to per-cathedral House Scribe instances
    const perCathedralResults = [];
    for (const catId of targetCathedralIds) {
        const result = queryOneCathedral(catId, parsed.sub_pattern, querier_cohort_class);
        perCathedralResults.push(result);
    }
    // Merge results
    const allJars = [];
    for (const cat of perCathedralResults) {
        allJars.push(...cat.jars);
    }
    // Deduplicate by jar_id
    const seen = new Set();
    const deduplicated = allJars.filter((j) => {
        if (seen.has(j.jar_id))
            return false;
        seen.add(j.jar_id);
        return true;
    });
    const anyUnavailable = perCathedralResults.some((c) => !c.available);
    const totalFound = deduplicated.length;
    const paginated = deduplicated.slice(offset, offset + limit);
    // Update cache
    if (use_cache) {
        const counts = {};
        for (const cat of perCathedralResults) {
            counts[cat.cathedral_id] = cat.jars.length;
        }
        writeCache(pattern, querier_cohort_class, deduplicated, counts);
    }
    // Provenance write-back
    const serial = writeProvenanceEntry(pattern, querier_cohort_class, totalFound, targetCathedralIds);
    return {
        data_available: true,
        pattern,
        querier_cohort_class,
        jars: paginated,
        per_cathedral: perCathedralResults,
        total_found: totalFound,
        cache_used: false,
        partial_results: anyUnavailable,
        bridle_rule_4: anyUnavailable
            ? "PARTIAL — one or more cathedrals unavailable. Results incomplete. Flagged for retry."
            : undefined,
        provenance_serial: serial,
    };
}
/**
 * Invalidate the cross-cathedral cache for a given pattern.
 * Called by KN-J3 Augur Living Gate on Pheromone write-events.
 */
export function invalidateCrossCache(pattern) {
    if (!existsSync(CROSS_CATHEDRAL_CACHE))
        return;
    try {
        let store = loadCache();
        if (pattern) {
            store = store.filter((e) => e.pattern !== pattern);
        }
        else {
            store = [];
        }
        saveCache(store);
    }
    catch {
        // non-fatal
    }
}
/**
 * Query cross-cathedral provenance log.
 */
export function queryCrossCathedralProvenance(limit = 100) {
    if (!existsSync(CROSS_CATHEDRAL_PROVENANCE))
        return [];
    try {
        const raw = readFileSync(CROSS_CATHEDRAL_PROVENANCE, "utf-8");
        const entries = raw
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => JSON.parse(l));
        return entries.slice(-limit);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=cross_cathedral_router.js.map
