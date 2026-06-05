// ============================================================================
// BP073 β-W18 — Prediction commitment schema with salt + nonce discipline.
// Prevents hash replay (nonce) and cross-predictor collision (salt).
// ============================================================================

/**
 * A sealed prediction committed before a benchmark run begins.
 * Hash is over the full object minus the `predictionHash` field itself,
 * using JSON with sorted keys (see hashPrediction below).
 *
 * Salt + nonce discipline:
 *   nonce  — per-run random UUID; ensures two identical predictions in the
 *            same run do NOT produce the same hash (no replay attack).
 *   salt   — per-predictor constant; ensures Bishop and Knight cannot
 *            produce colliding hashes even if their text prediction matches.
 */
export interface PredictionCommitment {
  models: string[];
  dimensions: string[];
  expectedRanking: string[];
  expectedScoresByDim: Record<string, Record<string, number>>;
  predictedAt: string;           // ISO-8601 UTC
  predictionHash: string;        // SHA-256 of this object (minus this field)
  nonce: string;                 // per-run random UUID — prevents hash replay
  salt: string;                  // per-predictor salt — prevents cross-predictor collision
  predictor: 'Bishop' | 'Knight' | 'Founder';
  preRunAnchorCommit: string;    // git HEAD SHA at prediction time
}

/** Input type for hashPrediction — everything except the hash itself. */
export type PredictionInput = Omit<PredictionCommitment, 'predictionHash'>;

/**
 * Produce a SHA-256 hex digest over the sorted-key JSON of the input.
 * Sorted keys make the hash deterministic regardless of object property
 * insertion order.
 *
 * Runtime: Web Crypto API (browser) or Node.js crypto module.
 * Returns a promise because SubtleCrypto.digest is async.
 */
export async function hashPrediction(p: PredictionInput): Promise<string> {
  const sortedJson = JSON.stringify(p, Object.keys(p).sort() as (keyof PredictionInput)[]);
  const encoded = new TextEncoder().encode(sortedJson);

  // SubtleCrypto path (browser + Node >= 18 with globalThis.crypto)
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const buf = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Node.js fallback (environments without SubtleCrypto globalThis)
  const { createHash } = await import('crypto');
  return createHash('sha256').update(encoded).digest('hex');
}

/**
 * Convenience: build a fully-sealed PredictionCommitment in one call.
 * Caller supplies all fields except predictionHash; this function computes it.
 *
 * Usage:
 *   const commitment = await sealPrediction({ ..., nonce: crypto.randomUUID(), salt: PREDICTOR_SALT });
 */
export async function sealPrediction(input: PredictionInput): Promise<PredictionCommitment> {
  const predictionHash = await hashPrediction(input);
  return { ...input, predictionHash };
}
