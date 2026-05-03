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
// ─── Cathedral IDs ────────────────────────────────────────────────────────────
export const CATHEDRAL_IDS = {
    bishop: "01",
    knight: "02",
    pawn: "03",
    apiarist_tribe_hive: "04",
    apiarist_family_hive: "05",
    apiarist_project_hive: "06",
    apiarist_guild_hive: "07",
    cross: "99",
};
export const CATHEDRAL_FROM_ID = Object.fromEntries(Object.entries(CATHEDRAL_IDS).map(([k, v]) => [v, k]));
// ─── Tier IDs (per BP011 7-layer strata) ─────────────────────────────────────
export const TIER_IDS = {
    sand: "01", // Layer 1 — Sand
    gravel: "02", // Layer 2 — Gravel
    dirt_road: "03", // Layer 3 — Dirt-road
    paved_road: "04", // Layer 4 — Paved-road
    highway: "05", // Layer 5 — Highway
    freeway: "06", // Layer 6 — Freeway (Jars of Honey live here)
    bedrock: "07", // Layer 7 — Bedrock
    cross_tier: "99",
};
export const TIER_FROM_ID = Object.fromEntries(Object.entries(TIER_IDS).map(([k, v]) => [v, k]));
// ─── Flavor-class IDs (per BP015 Multi-Trail Pheromone-Flavor) ────────────────
export const FLAVOR_IDS = {
    cinnamon: "01",
    vanilla: "02",
    spice: "03",
    fruit: "04",
    vegetable: "05",
    nut: "06",
    cross_flavor: "99",
};
export const FLAVOR_FROM_ID = Object.fromEntries(Object.entries(FLAVOR_IDS).map(([k, v]) => [v, k]));
export const MAX_JARS_PER_CELL = 100; // slots 00-99
export const WILDCARD_RESULT_CAP = 1000;
// ─── Coordinate construction ──────────────────────────────────────────────────
/**
 * Build an 8-digit composite coordinate string.
 * All fields are 2-digit zero-padded.
 */
export function buildCoordinate(cathedral_id, tier_id, flavor_id, jar_slot) {
    return `${cathedral_id}-${tier_id}-${flavor_id}-${String(jar_slot).padStart(2, "0")}`;
}
// ─── Coordinate parsing ───────────────────────────────────────────────────────
/**
 * Parse and validate a raw 8-digit coordinate string.
 * Returns ParsedCoordinate on success, or ValidationResult with errors.
 */
export function parseCoordinate(raw) {
    const parts = raw.split("-");
    if (parts.length !== 4)
        return null;
    const [cathedral_id, tier_id, flavor_id, jar_slot] = parts;
    if (!/^\d{2}$/.test(cathedral_id) ||
        !/^\d{2}$/.test(tier_id) ||
        !/^\d{2}$/.test(flavor_id) ||
        !/^\d{2}$/.test(jar_slot))
        return null;
    return {
        raw,
        cathedral_id,
        tier_id,
        flavor_id,
        jar_slot,
        cathedral_name: CATHEDRAL_FROM_ID[cathedral_id] ?? `cathedral_${cathedral_id}`,
        tier_name: TIER_FROM_ID[tier_id] ?? `tier_${tier_id}`,
        flavor_name: FLAVOR_FROM_ID[flavor_id] ?? `flavor_${flavor_id}`,
        is_cross_cathedral: cathedral_id === "99",
        is_cross_tier: tier_id === "99",
        is_cross_flavor: flavor_id === "99",
    };
}
export function validateCoordinate(raw) {
    const errors = [];
    if (!raw || typeof raw !== "string") {
        return { valid: false, errors: ["Coordinate must be a non-empty string"], parsed: null };
    }
    const parts = raw.split("-");
    if (parts.length !== 4) {
        return { valid: false, errors: ["Coordinate must have exactly 4 fields separated by '-'"], parsed: null };
    }
    const [cathedral_id, tier_id, flavor_id, jar_slot] = parts;
    if (!/^\d{2}$/.test(cathedral_id))
        errors.push(`Invalid cathedral_id '${cathedral_id}': must be 2 digits`);
    if (!/^\d{2}$/.test(tier_id))
        errors.push(`Invalid tier_id '${tier_id}': must be 2 digits`);
    if (!/^\d{2}$/.test(flavor_id))
        errors.push(`Invalid flavor_id '${flavor_id}': must be 2 digits`);
    if (!/^\d{2}$/.test(jar_slot))
        errors.push(`Invalid jar_slot '${jar_slot}': must be 2 digits`);
    if (errors.length > 0)
        return { valid: false, errors, parsed: null };
    const catNum = parseInt(cathedral_id, 10);
    const tierNum = parseInt(tier_id, 10);
    const flavorNum = parseInt(flavor_id, 10);
    const slotNum = parseInt(jar_slot, 10);
    if ((catNum < 1 || catNum > 99))
        errors.push(`Cathedral ID ${cathedral_id} out of range 01-99`);
    if ((tierNum < 1 || tierNum > 99))
        errors.push(`Tier ID ${tier_id} out of range 01-99`);
    if ((flavorNum < 1 || flavorNum > 99))
        errors.push(`Flavor ID ${flavor_id} out of range 01-99`);
    if (slotNum < 0 || slotNum > 99)
        errors.push(`Jar slot ${jar_slot} out of range 00-99`);
    if (errors.length > 0)
        return { valid: false, errors, parsed: null };
    return { valid: true, errors: [], parsed: parseCoordinate(raw) };
}
// ─── Cell-prefix extraction ───────────────────────────────────────────────────
/** The cell prefix (first 3 fields) for a coordinate — used in collision detection. */
export function cellPrefix(coordinate) {
    const parts = coordinate.split("-");
    return parts.slice(0, 3).join("-");
}
/** Extract jar_slot number from a coordinate. */
export function jarSlot(coordinate) {
    const parts = coordinate.split("-");
    return parts.length === 4 ? parseInt(parts[3], 10) : -1;
}
// ─── Wildcard query matching ───────────────────────────────────────────────────
/**
 * Parse a wildcard query string like "01-*-03-*" into a CoordinateQuery.
 * Fields may be 2-digit values or "*" (match any).
 */
export function parseWildcardQuery(pattern) {
    const parts = pattern.split("-");
    if (parts.length !== 4)
        return null;
    const [c, t, f, j] = parts;
    return {
        cathedral_id: c === "*" ? "*" : c,
        tier_id: t === "*" ? "*" : t,
        flavor_id: f === "*" ? "*" : f,
        jar_slot: j === "*" ? "*" : j,
        wildcard: pattern,
    };
}
/**
 * Test whether a coordinate matches a CoordinateQuery.
 * Supports wildcards and flavor_range.
 */
export function coordinateMatchesQuery(coordinate, query) {
    const parsed = parseCoordinate(coordinate);
    if (!parsed)
        return false;
    if (query.cathedral_id && query.cathedral_id !== "*" && parsed.cathedral_id !== query.cathedral_id)
        return false;
    if (query.tier_id && query.tier_id !== "*" && parsed.tier_id !== query.tier_id)
        return false;
    if (query.flavor_id && query.flavor_id !== "*" && parsed.flavor_id !== query.flavor_id)
        return false;
    if (query.jar_slot && query.jar_slot !== "*" && parsed.jar_slot !== query.jar_slot)
        return false;
    // Flavor range [from, to] — inclusive comparison on numeric value
    if (query.flavor_range) {
        const [fromId, toId] = query.flavor_range;
        const flavorNum = parseInt(parsed.flavor_id, 10);
        const fromNum = parseInt(fromId, 10);
        const toNum = parseInt(toId, 10);
        if (flavorNum < fromNum || flavorNum > toNum)
            return false;
    }
    return true;
}
// ─── Daughter-cell Swarming ───────────────────────────────────────────────────
/**
 * When a cell reaches MAX_JARS_PER_CELL (100), Swarming spawns a daughter-cell
 * at the adjacent flavor-class position (flavor_id + 1 mod 99, wrapping to 01).
 *
 * Returns the new cell prefix for the daughter cell.
 * If flavor wraps past 99, returns cross-flavor (99).
 */
export function swarmDaughterCell(overflowCellPrefix) {
    const parts = overflowCellPrefix.split("-");
    if (parts.length !== 3)
        return null;
    const [cathedral_id, tier_id, flavor_id] = parts;
    const flavorNum = parseInt(flavor_id, 10);
    // Adjacent flavor: increment, wrap at 98 → 01 (skip cross-flavor 99 for regular Swarming)
    let nextFlavor = flavorNum + 1;
    if (nextFlavor >= 99)
        nextFlavor = 1;
    return `${cathedral_id}-${tier_id}-${String(nextFlavor).padStart(2, "0")}`;
}
// ─── Cathedral → ID + Tier mapping helpers ────────────────────────────────────
export function cathedralToId(cathedral) {
    return CATHEDRAL_IDS[cathedral] ?? CATHEDRAL_IDS["cross"];
}
export function tierNameToId(tier) {
    return TIER_IDS[tier] ?? TIER_IDS["freeway"]; // default Freeway = Layer 6 (Jars of Honey)
}
export function flavorNameToId(flavor) {
    return FLAVOR_IDS[flavor] ?? FLAVOR_IDS["vanilla"]; // default vanilla
}
// ─── 2D-to-4D extension (Multi-Trail BP015 P3 compatibility) ─────────────────
/**
 * Convert a legacy 2D Multi-Trail coordinate (tier × flavor-class) to a 4D coordinate.
 * Cathedral defaults to 99 (cross-cathedral), jar_slot defaults to 00.
 */
export function twoDToFourD(tier_id, flavor_id) {
    return buildCoordinate("99", tier_id, flavor_id, 0);
}
/**
 * Extract the 2D Multi-Trail portion (tier × flavor-class) from a 4D coordinate.
 * Preserves backward compatibility for legacy queries.
 */
export function fourDToTwoD(coordinate) {
    const parsed = parseCoordinate(coordinate);
    if (!parsed)
        return null;
    return { tier_id: parsed.tier_id, flavor_id: parsed.flavor_id };
}
//# sourceMappingURL=coordinate_scheme.js.map
