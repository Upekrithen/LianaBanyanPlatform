/**
 * SE-4 HMAC Tamper-Detect (LB-STACK-0172 §Primitive3)
 * =====================================================
 * HMAC-SHA256 signing and verification for SE-4 envelopes.
 *
 * Key rotation policy:
 *   per-session (default) — new random key generated at process start
 *   per-day               — key derived from UTC date (future: via SE4KeyManager)
 *   per-cohort            — key shared across a cohort (future: via config inject)
 *
 * On HMAC mismatch (tamper detected):
 *   Receivers MUST silently quarantine — do NOT surface error to caller.
 *   Log to tamper event store (Chronicler or pheromone_tamper_log).
 *
 * Algorithm: SHA-256 (default); SHA-3 (high-security contexts via config).
 */

import { createHmac, randomBytes, timingSafeEqual, randomUUID } from 'crypto';
import { tickClock, encodeEpochId } from './se4_clock.js';
import { defaultRegistry } from './se4_registry.js';
import type { SE4Envelope, SE4HMACConfig, SE4ShadowClass } from './se4_envelope.js';
import type { SE4Registry } from './se4_registry.js';

// ─── Key management ───────────────────────────────────────────────────────────

const SE4_SALT = 'LB-SE4-SHADOW-SIGNAL-BP033';

/** Per-session key — rotated on every process restart (per-session default). */
const SESSION_KEY = `${SE4_SALT}:${randomBytes(32).toString('hex')}`;

export class SE4KeyManager {
  private readonly _key: string;
  readonly config: SE4HMACConfig;

  constructor(key?: string, config?: Partial<SE4HMACConfig>) {
    this._key = key ?? SESSION_KEY;
    this.config = {
      algorithm: config?.algorithm ?? 'SHA-256',
      rotation:  config?.rotation  ?? 'per-session',
    };
  }

  currentKey(): string {
    return this._key;
  }
}

/** Module-level default key manager (per-session rotation). */
export const defaultKeyManager = new SE4KeyManager();

// ─── Hash computation ─────────────────────────────────────────────────────────

/**
 * Compute HMAC-SHA256 of a payload string with the given key.
 * Returns hex-encoded digest.
 */
export function computePayloadHash(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload, 'utf-8').digest('hex');
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

/**
 * Sign a Shadow output: compute HMAC of JSON.stringify(payload) and attach
 * to a freshly constructed SE4Envelope.
 *
 * Also increments the Lamport clock and allocates a Shadow ID from the registry.
 * Caller is responsible for releasing the shadow ID (via registry.releaseId)
 * when the Shadow teardown occurs.
 *
 * @param shadowClass  Which SE-4 Shadow class is signing
 * @param payload      The output payload to fingerprint
 * @param options      parentShadowId, burstCount, registry, keyManager overrides
 * @returns            { envelope, shadow_id } — keep shadow_id for releaseId call
 */
export function signShadowOutput<T>(
  shadowClass: SE4ShadowClass,
  payload: T,
  options: {
    parentShadowId?: string | null;
    burstCount?: number;
    registry?: SE4Registry;
    keyManager?: SE4KeyManager;
  } = {}
): { envelope: SE4Envelope; shadow_id: string } {
  const registry   = options.registry   ?? defaultRegistry;
  const keyManager = options.keyManager ?? defaultKeyManager;

  const shadowId = registry.spawnWithRetry(shadowClass);
  const cellIdentities = registry.decodeIdentities(shadowId);
  const epoch = tickClock();
  const epochId = encodeEpochId(epoch, shadowId);

  const payloadStr  = JSON.stringify(payload);
  const payloadHash = computePayloadHash(payloadStr, keyManager.currentKey());

  const envelope: SE4Envelope = {
    signal_id:        randomUUID(),
    epoch_id:         epochId,
    parent_shadow_id: options.parentShadowId ?? null,
    shadow_class:     shadowClass,
    cell_identities:  cellIdentities,
    payload_hash:     payloadHash,
    burst_count:      options.burstCount ?? 1,
    hmac_config:      keyManager.config,
  };

  return { envelope, shadow_id: shadowId };
}

// ─── Verify ───────────────────────────────────────────────────────────────────

/**
 * Verify that a Shadow output's payload matches the HMAC in its envelope.
 *
 * Returns false on any mismatch (tamper detected).
 * Callers MUST quarantine the record — never surface HMAC failure to caller.
 */
export function verifyEnvelope(
  envelope: SE4Envelope,
  payload: unknown,
  keyManager: SE4KeyManager = defaultKeyManager
): boolean {
  try {
    const payloadStr  = JSON.stringify(payload);
    const expected    = computePayloadHash(payloadStr, keyManager.currentKey());
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf   = Buffer.from(envelope.payload_hash, 'hex');
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}
