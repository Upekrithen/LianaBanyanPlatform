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

import {
  buildCoordinate,
  validateCoordinate,
  cellPrefix,
  jarSlot,
  cathedralToId,
  flavorNameToId,
  swarmDaughterCell,
  coordinateMatchesQuery,
  parseWildcardQuery,
  MAX_JARS_PER_CELL,
  WILDCARD_RESULT_CAP,
  type CoordinateQuery,
} from "./coordinate_scheme.js";
import { readAllJars, indexJar, type JarOfHoney, type ContentType } from "./jar_lifecycle.js";

// ─── Content-type → Tier + Flavor mapping ────────────────────────────────────
// Layer 6 Jars of Honey = Freeway tier (06) in BP011 7-layer strata.
// Flavor-class derived from semantic content class.

const CONTENT_TYPE_TO_TIER: Record<ContentType, string> = {
  synthesis:          "06",  // Freeway — Layer 6 Jars
  comb_artifact:      "06",
  royal_jelly_class:  "06",
  innovation_corpus:  "07",  // Bedrock — foundational patent corpus
  session_archive:    "05",  // Highway — session-level archive
  detective_finding:  "06",
};

const CONTENT_TYPE_TO_FLAVOR: Record<ContentType, string> = {
  synthesis:          "02",  // vanilla — synthesis
  comb_artifact:      "01",  // cinnamon — comb artifact
  royal_jelly_class:  "06",  // nut — royal jelly premium
  innovation_corpus:  "03",  // spice — innovation / patent
  session_archive:    "04",  // fruit — session archive
  detective_finding:  "05",  // vegetable — detective finding
};

// ─── Assignment types ─────────────────────────────────────────────────────────

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
  swarmed?: boolean;          // true if cell was full and daughter-cell was spawned
  error?: string;
  collision_detected?: boolean;
  bridle_rule_4?: string;
}

// ─── Cell occupancy helpers ───────────────────────────────────────────────────

/**
 * Find occupied slots in a cell prefix, across all jars in the ledger.
 */
function occupiedSlots(allJars: JarOfHoney[], prefix: string): Set<number> {
  const occupied = new Set<number>();
  for (const jar of allJars) {
    if (jar.coordinate && cellPrefix(jar.coordinate) === prefix) {
      occupied.add(jarSlot(jar.coordinate));
    }
  }
  return occupied;
}

/**
 * Find next available slot in a cell (0-99).
 * Returns null if cell is full (MAX_JARS_PER_CELL reached).
 */
function nextAvailableSlot(occupied: Set<number>): number | null {
  for (let slot = 0; slot < MAX_JARS_PER_CELL; slot++) {
    if (!occupied.has(slot)) return slot;
  }
  return null;
}

// ─── Main assignment function ─────────────────────────────────────────────────

/**
 * Assign an 8-digit grid coordinate to a Jar at its `indexed` state transition.
 * Detects collisions and handles cell-overflow Swarming.
 *
 * Calls KN-J1 indexJar() to persist the coordinate and transition state.
 */
export function assignCoordinate(opts: AssignCoordinateOpts): AssignCoordinateResult {
  const allJars = readAllJars();
  const targetJar = allJars.find((j) => j.jar_id === opts.jar_id);

  if (!targetJar) {
    return { success: false, error: `Jar ${opts.jar_id} not found`, bridle_rule_4: "HALT — Jar not found." };
  }

  if (targetJar.state !== "created") {
    return {
      success: false,
      error: `Jar ${opts.jar_id} is in state '${targetJar.state}' — coordinate assignment only valid from 'created' state`,
    };
  }

  const cathedral_id = cathedralToId(opts.cathedral);
  const tier_id = opts.tier_override ?? CONTENT_TYPE_TO_TIER[opts.content_type] ?? "06";
  const flavor_id = opts.flavor_override ?? CONTENT_TYPE_TO_FLAVOR[opts.content_type] ?? "02";

  let currentPrefix = `${cathedral_id}-${tier_id}-${flavor_id}`;
  let swarmed = false;

  for (let attempt = 0; attempt < 99; attempt++) {
    const occupied = occupiedSlots(allJars, currentPrefix);
    const slot = nextAvailableSlot(occupied);

    if (slot !== null) {
      const coordinate = buildCoordinate(
        currentPrefix.split("-")[0],
        currentPrefix.split("-")[1],
        currentPrefix.split("-")[2],
        slot
      );

      // BRIDLE Rule 4: collision detection
      const alreadyUsed = allJars.some((j) => j.coordinate === coordinate);
      if (alreadyUsed) {
        return {
          success: false,
          coordinate,
          collision_detected: true,
          error: `Collision detected for coordinate ${coordinate}. BRIDLE Rule 4: HALT — duplicate assignment rejected.`,
          bridle_rule_4: "HALT — coordinate collision detected.",
        };
      }

      // Validate the coordinate
      const validation = validateCoordinate(coordinate);
      if (!validation.valid) {
        return { success: false, error: `Invalid coordinate generated: ${validation.errors.join("; ")}` };
      }

      // Assign via KN-J1 indexJar (state: created → indexed)
      const result = indexJar(opts.jar_id, coordinate);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, coordinate, jar: result.jar!, swarmed };
    }

    // Cell full — Swarm to daughter-cell
    const daughterPrefix = swarmDaughterCell(currentPrefix);
    if (!daughterPrefix) {
      return {
        success: false,
        error: `Cell ${currentPrefix} full; Swarming failed to produce valid daughter cell.`,
        bridle_rule_4: "HALT — Swarming failure; do not silently skip.",
      };
    }

    currentPrefix = daughterPrefix;
    swarmed = true;
  }

  return {
    success: false,
    error: `All 99 flavor cells exhausted for cathedral ${cathedral_id} tier ${tier_id}. Population scaling needed.`,
    bridle_rule_4: "HALT — cell overflow exhausted; House Scribe spawn recommended.",
  };
}

// ─── Coordinate-based query (extends KN-J1 queryJars) ────────────────────────

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
export function queryJarsByCoordinate(
  pattern: string,
  opts: { limit?: number; offset?: number } = {}
): CoordinateQueryResult {
  const limit = Math.min(opts.limit ?? WILDCARD_RESULT_CAP, WILDCARD_RESULT_CAP);
  const offset = opts.offset ?? 0;

  try {
    const allJars = readAllJars();
    const seeded = allJars.filter((j) => j.coordinate);

    let query: CoordinateQuery;

    // Detect range pattern: "NN-NN-NN..NN-*"
    const rangeMatch = pattern.match(/^(\d{2})-(\d{2})-(\d{2})\.\.(\d{2})-(.{2})$/);
    if (rangeMatch) {
      query = {
        cathedral_id: rangeMatch[1],
        tier_id: rangeMatch[2],
        flavor_range: [rangeMatch[3], rangeMatch[4]],
        jar_slot: rangeMatch[5] === "**" || rangeMatch[5] === "*" ? "*" : rangeMatch[5],
      };
    } else {
      const parsed = parseWildcardQuery(pattern);
      if (!parsed) {
        return { data_available: false, total: 0, returned: 0, capped: false, jars: [], unavailable_reason: `Invalid coordinate query pattern: '${pattern}'` };
      }
      query = parsed;
    }

    const matched = seeded.filter((j) => coordinateMatchesQuery(j.coordinate!, query));
    const total = matched.length;
    const capped = total > WILDCARD_RESULT_CAP;
    const sliced = matched.slice(offset, offset + limit);

    return { data_available: true, total, returned: sliced.length, capped, jars: sliced };
  } catch (err) {
    return {
      data_available: false,
      total: 0,
      returned: 0,
      capped: false,
      jars: [],
      unavailable_reason: `Coordinate query error: ${String(err)}`,
    };
  }
}
