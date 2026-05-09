/**
 * SE-4 Shadow E-Signal — Barrel Export (LB-STACK-0172 / BP033)
 * =============================================================
 * All public types, classes, and functions from the SE-4 Core Library.
 *
 * Quick import:
 *   import { signShadowOutput, verifyEnvelope, defaultRegistry } from '../se4/index.js';
 */

// Types
export type {
  SE4ShadowClass,
  SE4HMACConfig,
  SE4Envelope,
  SE4ValidationResult,
  SE4SignedOutput,
  SE4DetectiveHit,
  SE4DetectiveResult,
  SE4ChroniclerAuditWindow,
  SE4AnomalyClass,
  SE4RookSurface,
  SE4RookReturnFields,
  SE4WrasseCompositeMode,
  SE4WrasseCompositeReceipt,
  SE4PawnParallelFireReceipt,
  SE4PawnDispatch,
  SE4PawnReturn,
  SE4ShadowBackgroundTaskReceipt,
} from './se4_envelope.js';

// Clock
export {
  tickClock,
  advanceClock,
  currentEpoch,
  resetClock,
  encodeEpochId,
  decodeEpoch,
  decodeEpochShadowId,
  SE4VectorClock,
} from './se4_clock.js';

// Registry
export {
  SE4Registry,
  SE4RegistryExhaustedError,
  DEFAULT_SESSION_ID,
  DEFAULT_CHAIN_LENGTH,
  DIAGNOSTIC_SLOT_START,
  DIAGNOSTIC_SLOT_END,
  defaultRegistry,
} from './se4_registry.js';

// HMAC
export {
  SE4KeyManager,
  defaultKeyManager,
  computePayloadHash,
  signShadowOutput,
  verifyEnvelope,
} from './se4_hmac.js';

// Validator
export {
  validateEnvelope,
  validateBatch,
  type ValidateEnvelopeOptions,
  type BulkValidationResult,
} from './se4_validator.js';
