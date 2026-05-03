/**
 * Strata Cross-Cut Wiring — KN-T3 / BP018
 * ==========================================
 * Wires stratum tagging into existing substrate primitives:
 *   - Eblets: stratum field on retrieval priority (higher stratum = higher priority)
 *   - House Scribe Jars (Pod-J KN-J1): stratum × cohort_class queries
 *   - Detective TEAM (Pod-C KN104): stratum × decay_score ranking
 *   - Multi-Trail Pheromone-Flavor (BP015): 2D coordinate = stratum × flavor
 *
 * Consistency rule: same topic stratum-tagged across all primitives must match.
 * Caller is responsible for keeping substrate in sync after promote().
 */

import { readAllAssignments, getAssignment, STRATUM_ORDINALS, type Stratum, type StratumAssignment } from "./schema.js";
import { queryJars } from "../house_scribe/jar_lifecycle.js";
import { queryPheromone, type PheromoneHit } from "../scribes/pheromone.js";

// ─── Eblet cross-cut ──────────────────────────────────────────────────────────

export interface EbletStratumPriority {
  path: string;
  stratum: Stratum;
  ordinal: number;
  priority_score: number; // ordinal-based; higher = more preferred on retrieval
}

/**
 * Rank an array of Eblet-style objects by stratum priority.
 * Objects must carry a `stratum` field (Stratum string) or `topic` field resolvable to stratum.
 */
export function rankByStratumPriority<T extends { stratum?: Stratum; topic?: string }>(
  items: T[]
): Array<T & { stratum_ordinal: number }> {
  return items
    .map((item) => {
      let ordinal = 0;
      if (item.stratum && item.stratum in STRATUM_ORDINALS) {
        ordinal = STRATUM_ORDINALS[item.stratum];
      } else if (item.topic) {
        const a = getAssignment(item.topic);
        ordinal = a ? a.ordinal : 0;
      }
      return { ...item, stratum_ordinal: ordinal };
    })
    .sort((a, b) => b.stratum_ordinal - a.stratum_ordinal);
}

// ─── House Scribe Jar cross-cut ───────────────────────────────────────────────

export interface JarStratumQuery {
  stratum: Stratum;
  cohort_class?: string;
  limit?: number;
}

/**
 * Query House Scribe Jars by stratum (via content_type as proxy).
 * Jars tagged with a matching stratum topic in their content_summary are returned.
 * Real implementation: add stratum field to JarOfHoney schema in a future KN-J6.
 */
export function queryJarsByStratum(query: JarStratumQuery) {
  const topicsAtStratum = readAllAssignments()
    .filter((a) => a.stratum === query.stratum)
    .map((a) => a.topic);

  const allJars = queryJars({ limit: query.limit ?? 100 });

  return allJars.filter((jar) => {
    const summary = (jar.content_summary ?? "").toLowerCase();
    return topicsAtStratum.some((t) => summary.includes(t.toLowerCase()));
  });
}

// ─── Detective TEAM cross-cut ─────────────────────────────────────────────────

export interface StratumDecayHit extends PheromoneHit {
  stratum: Stratum;
  stratum_ordinal: number;
  composite_score: number; // decay_score × (1 + ordinal/6) — bedrock gets 2×, sand gets 1×
}

/**
 * Run Detective TEAM pheromone query ranked by stratum × decay_score.
 * Higher-stratum results get a composite boost (bedrock wins over sand at same decay).
 */
export function detectiveQueryByStratum(claim: string, topK: number = 20): StratumDecayHit[] {
  const result = queryPheromone(claim, { topK: topK * 2 });

  return result.hits
    .map((hit): StratumDecayHit => {
      const topic = hit.tablet_id;
      const a = getAssignment(topic) ?? getAssignment(hit.scribe);
      const stratum: Stratum = a?.stratum ?? "sand";
      const stratum_ordinal = STRATUM_ORDINALS[stratum];
      const composite_score = hit.decay_score * (1 + stratum_ordinal / 6);
      return { ...hit, stratum, stratum_ordinal, composite_score };
    })
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, topK);
}

// ─── Multi-Trail Pheromone-Flavor 2D coordinate ───────────────────────────────

export interface StratumFlavorCoordinate {
  stratum: Stratum;
  stratum_ordinal: number;
  flavor_domain: string | undefined;
  flavor_cognition: string | undefined;
  coordinate_string: string; // "{stratum}::{flavor_domain}::{flavor_cognition}"
}

/**
 * Build a 2D stratum × pheromone-flavor coordinate for a topic.
 * Used as the orthogonal composition with Multi-Trail Pheromone-Flavor (BP015).
 */
export function buildStratumFlavorCoordinate(
  topic: string,
  flavor_domain?: string,
  flavor_cognition?: string
): StratumFlavorCoordinate {
  const a = getAssignment(topic);
  const stratum: Stratum = a?.stratum ?? "sand";
  const stratum_ordinal = STRATUM_ORDINALS[stratum];
  const coordinate_string = `${stratum}::${flavor_domain ?? "*"}::${flavor_cognition ?? "*"}`;
  return { stratum, stratum_ordinal, flavor_domain, flavor_cognition, coordinate_string };
}

// ─── Consistency check ────────────────────────────────────────────────────────

export interface ConsistencyReport {
  topic: string;
  stratum_assignment: Stratum | undefined;
  pheromone_found: boolean;
  consistent: boolean;
  notes: string[];
}

/**
 * Check cross-primitive consistency for a topic.
 * Verifies stratum assignment is coherent with pheromone records.
 */
export function checkCrossCutConsistency(topic: string): ConsistencyReport {
  const a = getAssignment(topic);
  const phResult = queryPheromone(topic, { topK: 5 });
  const pheromone_found = phResult.hits.length > 0;

  const notes: string[] = [];
  if (!a) notes.push("No stratum assignment found — topic defaults to 'sand'");
  if (!pheromone_found) notes.push("No pheromone records found for this topic");

  return {
    topic,
    stratum_assignment: a?.stratum,
    pheromone_found,
    consistent: a !== undefined && pheromone_found,
    notes,
  };
}
