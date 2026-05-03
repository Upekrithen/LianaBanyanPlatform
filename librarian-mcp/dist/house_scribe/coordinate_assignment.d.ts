/**
 * House Scribe Coordinate Assignment — KN-J2 / BP017
 * ====================================================
 * Integrates the 8-digit grid coordinate scheme with the KN-J1 Jar lifecycle
 * `indexed` transition. Assigns coordinates to Jars, detects collisions,
 * and handles cell-overflow Swarming (daughter-cell spawn).
 *
 * BRIDLE Rule 4:
 *   - Collision detection: NEVER assign duplicate coordinate; log + halt
 *   - Cell overflow: spawn daughter-cell at adjacent flavor; halt if all flavors full
 *
 * Coordinate derivation from Hive-thread metadata:
 *   cathedral_id ← from jar.cathedral
 *   tier_id ← from content_type (synthesis → Highway/05; etc.)
 *   flavor_id ← from content_type (synthesis → vanilla/02; etc.)
 *   jar_slot ← next available in cell (00-99)
 */
import { type JarOfHoney, type ContentType } from "./jar_lifecycle.js";
export interface AssignCoordinateOpts {
    jar_id: string;
    cathedral: string;
    content_type: ContentType;
    /** Override tier derivation. Default: derived from content_type. */
    tier_override?: string;
    /** Override flavor derivation. Default: derived from content_type. */
    flavor_override?: string;
}
export interface AssignCoordinateResult {
    success: boolean;
    coordinate?: string;
    jar?: JarOfHoney;
    swarmed?: boolean;
    error?: string;
    collision_detected?: boolean;
    bridle_rule_4?: string;
}
/**
 * Assign an 8-digit grid coordinate to a Jar at its `indexed` state transition.
 * Detects collisions and handles cell-overflow Swarming.
 *
 * Calls KN-J1 indexJar() to persist the coordinate and transition state.
 */
export declare function assignCoordinate(opts: AssignCoordinateOpts): AssignCoordinateResult;
export interface CoordinateQueryResult {
    data_available: boolean;
    total: number;
    returned: number;
    capped: boolean;
    jars: JarOfHoney[];
    unavailable_reason?: string;
}
/**
 * Query Jars by 8-digit coordinate — exact, wildcard, range, or cross-cathedral.
 *
 * Pattern examples:
 *   "01-06-02-05"   → exact match
 *   "01-*-*-*"      → all Jars in cathedral 01
 *   "01-06-01..06-*" → flavor range 01-06 in bishop/freeway
 *   "99-*-*-*"      → cross-cathedral Jars
 *
 * BRIDLE Rule 4: result-set capped at WILDCARD_RESULT_CAP (1000).
 */
export declare function queryJarsByCoordinate(pattern: string, opts?: {
    limit?: number;
    offset?: number;
}): CoordinateQueryResult;
