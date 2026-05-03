/**
 * House Scribe 8-Digit Grid Coordinate Scheme — KN-J2 / BP017
 * =============================================================
 * 4-field composite address: cathedral × tier × flavor-class × jar-ID
 *
 * Format: NN-NN-NN-NN  (4 fields × 2 digits each = 8-digit composite)
 *
 * Extends Multi-Trail Pheromone-Flavor 2D (tier × flavor-class) to 4D.
 * Composes with:
 *   BP011 7-layer strata (tier digits 01-07)
 *   KN-J1 Jar lifecycle (coordinate assigned at 'indexed' transition)
 *   HexIsle hexagon brand canon (hexagonal-cell visual — KN-J5)
 *   KN-J3 Living Gridwork (event-driven freshness layer next)
 *
 * Cell capacity: 100 Jars per cell (00-99).
 * Cell overflow → Swarming: daughter-cell spawned at adjacent flavor-class.
 *
 * BRIDLE Rule 4:
 *   - Collision detection: NEVER assign duplicate coordinate; log + halt on collision
 *   - Cell overflow: log + halt if daughter-cell spawn also fails
 *   - Wildcard queries: cap result-set at 1000 entries (paging beyond)
 */
export declare const CATHEDRAL_IDS: Record<string, string>;
export declare const CATHEDRAL_FROM_ID: Record<string, string>;
export declare const TIER_IDS: Record<string, string>;
export declare const TIER_FROM_ID: Record<string, string>;
export declare const FLAVOR_IDS: Record<string, string>;
export declare const FLAVOR_FROM_ID: Record<string, string>;
export interface ParsedCoordinate {
    raw: string;
    cathedral_id: string;
    tier_id: string;
    flavor_id: string;
    jar_slot: string;
    cathedral_name: string;
    tier_name: string;
    flavor_name: string;
    is_cross_cathedral: boolean;
    is_cross_tier: boolean;
    is_cross_flavor: boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    parsed: ParsedCoordinate | null;
}
export interface CoordinateQuery {
    cathedral_id?: string | "*";
    tier_id?: string | "*";
    flavor_id?: string | "*";
    jar_slot?: string | "*";
    /** Raw wildcard string like "01-*-*-*" */
    wildcard?: string;
    /** Range query e.g. flavor 01..06 */
    flavor_range?: [string, string];
    limit?: number;
    offset?: number;
}
export declare const MAX_JARS_PER_CELL = 100;
export declare const WILDCARD_RESULT_CAP = 1000;
/**
 * Build an 8-digit composite coordinate string.
 * All fields are 2-digit zero-padded.
 */
export declare function buildCoordinate(cathedral_id: string, tier_id: string, flavor_id: string, jar_slot: number): string;
/**
 * Parse and validate a raw 8-digit coordinate string.
 * Returns ParsedCoordinate on success, or ValidationResult with errors.
 */
export declare function parseCoordinate(raw: string): ParsedCoordinate | null;
export declare function validateCoordinate(raw: string): ValidationResult;
/** The cell prefix (first 3 fields) for a coordinate — used in collision detection. */
export declare function cellPrefix(coordinate: string): string;
/** Extract jar_slot number from a coordinate. */
export declare function jarSlot(coordinate: string): number;
/**
 * Parse a wildcard query string like "01-*-03-*" into a CoordinateQuery.
 * Fields may be 2-digit values or "*" (match any).
 */
export declare function parseWildcardQuery(pattern: string): CoordinateQuery | null;
/**
 * Test whether a coordinate matches a CoordinateQuery.
 * Supports wildcards and flavor_range.
 */
export declare function coordinateMatchesQuery(coordinate: string, query: CoordinateQuery): boolean;
/**
 * When a cell reaches MAX_JARS_PER_CELL (100), Swarming spawns a daughter-cell
 * at the adjacent flavor-class position (flavor_id + 1 mod 99, wrapping to 01).
 *
 * Returns the new cell prefix for the daughter cell.
 * If flavor wraps past 99, returns cross-flavor (99).
 */
export declare function swarmDaughterCell(overflowCellPrefix: string): string | null;
export declare function cathedralToId(cathedral: string): string;
export declare function tierNameToId(tier: string): string;
export declare function flavorNameToId(flavor: string): string;
/**
 * Convert a legacy 2D Multi-Trail coordinate (tier × flavor-class) to a 4D coordinate.
 * Cathedral defaults to 99 (cross-cathedral), jar_slot defaults to 00.
 */
export declare function twoDToFourD(tier_id: string, flavor_id: string): string;
/**
 * Extract the 2D Multi-Trail portion (tier × flavor-class) from a 4D coordinate.
 * Preserves backward compatibility for legacy queries.
 */
export declare function fourDToTwoD(coordinate: string): {
    tier_id: string;
    flavor_id: string;
} | null;
