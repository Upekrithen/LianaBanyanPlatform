/**
 * SE-4 Detective Compositional Query (Tier 1 / B-SE4-1)
 * ======================================================
 * Extends Detective Phase 0 with power-set burst encoding for array claims.
 *
 * detectiveQueryBatch(['SE-4', 'HMAC', 'power-set']) fires ONE burst that
 * returns:
 *   unionHits             — all hits for any claim in the array
 *   intersectionSubsets   — hits per non-empty subset (2^N - 1 combinations)
 *     'SE-4&HMAC&power-set' — hits matching all three
 *     'SE-4&HMAC'           — hits matching SE-4 and HMAC
 *     'SE-4&power-set'      — hits matching SE-4 and power-set
 *     'HMAC&power-set'      — hits matching HMAC and power-set
 *     'SE-4'                — hits matching SE-4 only
 *     'HMAC'                — hits matching HMAC only
 *     'power-set'           — hits matching power-set only
 *
 * This replaces 7 separate detective_investigate calls with one burst.
 *
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-1 #4
 *
 * SE4DetectiveResult is the MCP response type for se4_detective_investigate.
 */

import {
  queryPheromone,
  type PheromoneHit,
  type QueryOptions,
} from '../../scribes/pheromone.js';
import { signShadowOutput, defaultKeyManager } from '../se4_hmac.js';
import { defaultRegistry } from '../se4_registry.js';
import type { SE4DetectiveResult, SE4DetectiveHit } from '../se4_envelope.js';

// ─── Power-set enumeration ────────────────────────────────────────────────────

/**
 * Enumerate all non-empty subsets of an array.
 * Returns each subset as a sorted array of its elements.
 * For N claims: yields 2^N - 1 subsets.
 */
function enumerateSubsets<T>(items: T[]): T[][] {
  const results: T[][] = [];
  const n = items.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i]);
    }
    results.push(subset);
  }
  return results;
}

/** Build subset key: sorted elements joined with '&'. */
function subsetKey(subset: string[]): string {
  return [...subset].sort().join('&');
}

// ─── PheromoneHit → SE4DetectiveHit ──────────────────────────────────────────

function toSE4Hit(hit: PheromoneHit, matchedClaims: string[]): SE4DetectiveHit {
  return {
    scribe:         hit.scribe,
    tablet_id:      hit.tablet_id,
    match_strength: hit.match_strength,
    decay_score:    hit.decay_score,
    ts:             hit.ts,
    cathedral:      hit.cathedral,
    matched_claims: matchedClaims,
  };
}

// ─── detectiveQueryBatch ──────────────────────────────────────────────────────

export interface DetectiveBatchOptions extends QueryOptions {
  topKPerClaim?: number;  // default 20
  topKUnion?: number;     // default 50
}

/**
 * Fire a power-set compositional Detective query.
 *
 * @param claims   Array of claim strings (max 8 for 255-subset enumeration)
 * @param options  Query options (passed to each queryPheromone call)
 * @returns        SE4DetectiveResult with union, all 2^N-1 intersection subsets,
 *                 and the SE-4 envelope for the burst.
 */
export function detectiveQueryBatch(
  claims: string[],
  options: DetectiveBatchOptions = {}
): SE4DetectiveResult {
  if (claims.length === 0) {
    throw new Error('SE4 Detective: claims array must not be empty');
  }
  if (claims.length > 8) {
    throw new Error('SE4 Detective: max 8 claims per power-set burst (255 subsets)');
  }

  const topKPerClaim = options.topKPerClaim ?? 20;
  const topKUnion    = options.topKUnion    ?? 50;

  // Query pheromone substrate once per claim, collect hits per claim
  const hitsByKey = new Map<string, {
    hit: PheromoneHit;
    matchedClaimsMask: number;
  }>();

  for (let i = 0; i < claims.length; i++) {
    const claimResult = queryPheromone(claims[i], {
      ...options,
      topK: topKPerClaim,
    });
    for (const hit of claimResult.hits) {
      const key = `${hit.scribe}::${hit.tablet_id}::${hit.cathedral ?? 'bishop'}`;
      const existing = hitsByKey.get(key);
      if (existing) {
        existing.matchedClaimsMask |= (1 << i);
        // Take max decay_score and sum match_strength across claims
        if (hit.decay_score > existing.hit.decay_score) {
          existing.hit = hit;
        }
        existing.hit.match_strength++;
      } else {
        hitsByKey.set(key, { hit: { ...hit }, matchedClaimsMask: (1 << i) });
      }
    }
  }

  // Build union hits (all hits regardless of how many claims matched)
  const allEntries = [...hitsByKey.values()];
  allEntries.sort((a, b) => b.hit.decay_score - a.hit.decay_score);
  const unionHits: SE4DetectiveHit[] = allEntries
    .slice(0, topKUnion)
    .map(({ hit, matchedClaimsMask }) => {
      const matchedClaims = claims.filter((_, i) => (matchedClaimsMask >> i) & 1);
      return toSE4Hit(hit, matchedClaims);
    });

  // Build intersection subsets
  const subsets = enumerateSubsets(claims);
  const intersectionSubsets: Record<string, SE4DetectiveHit[]> = {};

  for (const subset of subsets) {
    const key = subsetKey(subset);
    // A hit belongs to this subset if it matches ALL claims in the subset
    const subsetMask = subset.reduce(
      (acc, claim) => acc | (1 << claims.indexOf(claim)),
      0
    );
    const subsetHits: SE4DetectiveHit[] = allEntries
      .filter(({ matchedClaimsMask }) => (matchedClaimsMask & subsetMask) === subsetMask)
      .map(({ hit, matchedClaimsMask }) => {
        const matchedClaims = claims.filter((_, i) => (matchedClaimsMask >> i) & 1);
        return toSE4Hit(hit, matchedClaims);
      });
    intersectionSubsets[key] = subsetHits;
  }

  // Sign the entire burst result with a detective SE-4 envelope
  const burstPayload = {
    claims,
    burstCount: subsets.length,
    unionHitCount: unionHits.length,
    ts: new Date().toISOString(),
  };

  const { envelope, shadow_id } = signShadowOutput(
    'detective',
    burstPayload,
    { registry: defaultRegistry, keyManager: defaultKeyManager }
  );

  // Release immediately — detective queries are stateless
  defaultRegistry.releaseId(shadow_id);

  return {
    claims,
    burstCount: subsets.length,
    unionHits,
    intersectionSubsets,
    envelope: { ...envelope, burst_count: subsets.length },
  };
}
