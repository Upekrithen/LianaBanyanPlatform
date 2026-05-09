/**
 * SE-4 Envelope Validator (LB-STACK-0172)
 * ========================================
 * Validates SE4Envelope integrity across all three primitives:
 *   1. HMAC tamper detection
 *   2. Lamport clock monotonicity
 *   3. Power-set collision detection
 *
 * Usage:
 *   const result = validateEnvelope(envelope, payload, registry);
 *   if (!result.valid) { quarantine(record); return; }
 */

import type { SE4Envelope, SE4ValidationResult } from './se4_envelope.js';
import { verifyEnvelope, defaultKeyManager, type SE4KeyManager } from './se4_hmac.js';
import { decodeEpoch } from './se4_clock.js';
import type { SE4Registry } from './se4_registry.js';
import { defaultRegistry } from './se4_registry.js';

// ─── validateEnvelope ────────────────────────────────────────────────────────

export interface ValidateEnvelopeOptions {
  keyManager?: SE4KeyManager;
  /** If provided, check that epoch >= expectedEpochMin (clock-ordering guard). */
  expectedEpochMin?: number;
  /**
   * If provided, check that envelope.cell_identities do not overlap with any
   * of the known sibling shadow IDs (collision guard).
   */
  knownShadowIds?: string[];
  registry?: SE4Registry;
}

/**
 * Validate a SE4Envelope for HMAC integrity, clock validity, and collision.
 *
 * - tamperDetected: HMAC of payload does not match envelope.payload_hash
 * - clockViolation: epoch_id is malformed OR epoch < expectedEpochMin
 * - collisionDetected: cell_identities overlaps with a known sibling shadow
 */
export function validateEnvelope(
  envelope: SE4Envelope,
  payload: unknown,
  options: ValidateEnvelopeOptions = {}
): SE4ValidationResult {
  const km       = options.keyManager ?? defaultKeyManager;
  const registry = options.registry  ?? defaultRegistry;

  // ─── Primitive 3: HMAC tamper detection ────────────────────────────────────
  const tamperDetected = !verifyEnvelope(envelope, payload, km);

  // ─── Primitive 1: Clock validity ──────────────────────────────────────────
  const epoch = decodeEpoch(envelope.epoch_id);
  let clockViolation = isNaN(epoch) || epoch < 0;
  if (!clockViolation && options.expectedEpochMin !== undefined) {
    clockViolation = epoch < options.expectedEpochMin;
  }

  // ─── Primitive 2: Power-set collision detection ────────────────────────────
  let collisionDetected = false;
  if (options.knownShadowIds && options.knownShadowIds.length > 0) {
    const myIdentities = new Set(envelope.cell_identities);
    for (const otherId of options.knownShadowIds) {
      const otherCells = registry.decodeIdentities(otherId);
      if (otherCells.some((c) => myIdentities.has(c))) {
        collisionDetected = true;
        break;
      }
    }
  }

  return {
    valid: !tamperDetected && !clockViolation && !collisionDetected,
    tamperDetected,
    clockViolation,
    collisionDetected,
  };
}

// ─── Bulk validation with quarantine ─────────────────────────────────────────

export interface BulkValidationResult<T> {
  valid: Array<{ record: T; envelope: SE4Envelope }>;
  quarantined: Array<{ record: T; envelope: SE4Envelope; reason: SE4ValidationResult }>;
}

/**
 * Validate a batch of records, separating valid from quarantined.
 * Used by pheromone trail retrieval and Chronicler diagnostic windows.
 */
export function validateBatch<T>(
  records: Array<{ record: T; envelope: SE4Envelope; payload: unknown }>,
  options: ValidateEnvelopeOptions = {}
): BulkValidationResult<T> {
  const valid: BulkValidationResult<T>['valid'] = [];
  const quarantined: BulkValidationResult<T>['quarantined'] = [];

  for (const { record, envelope, payload } of records) {
    const result = validateEnvelope(envelope, payload, options);
    if (result.valid) {
      valid.push({ record, envelope });
    } else {
      quarantined.push({ record, envelope, reason: result });
    }
  }

  return { valid, quarantined };
}
