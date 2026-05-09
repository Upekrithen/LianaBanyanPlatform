/**
 * SE-4 Power-Set Uniqueness Registry (LB-STACK-0172 §Primitive2)
 * ================================================================
 * Manages combinatorially-unique Shadow IDs via bit-mask allocation.
 *
 * Each Shadow spawn receives the next available single-bit CelPane position
 * (cell_k). The composite interference pattern of any subset of concurrently
 * active Shadows is uniquely decodable because:
 *   - Each Shadow holds exactly one bit (cell_k)
 *   - No two active Shadows share any cell_identities element
 *   - All allocated IDs form an antichain in the power-set lattice
 *
 * At N active Shadows, the space is 2^N - 1 (power-set minus empty set).
 * Power-set uniqueness is guaranteed structurally — no collision possible.
 *
 * Diagnostic-channel: CelPane slots 56–63 reserved for Chronicler parity-class
 * diagnostic bursts (Tier 2). Non-chronicler classes skip these slots.
 *
 * Default chain length: 64 (max concurrent Shadows per session).
 */

import { randomUUID } from 'crypto';
import type { SE4ShadowClass } from './se4_envelope.js';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_CHAIN_LENGTH = 64;
export const DIAGNOSTIC_SLOT_START = 56;
export const DIAGNOSTIC_SLOT_END = 63;

// ─── Registry class ───────────────────────────────────────────────────────────

export class SE4Registry {
  private readonly _sessionId: string;
  private readonly _chainLength: number;
  private _allocated: bigint; // bitmask: bit k = 1 means slot k is allocated

  constructor(sessionId: string, chainLength = DEFAULT_CHAIN_LENGTH) {
    this._sessionId = sessionId;
    this._chainLength = Math.min(chainLength, 64);
    this._allocated = 0n;
  }

  get sessionId(): string {
    return this._sessionId;
  }

  /**
   * Allocate the next available Shadow ID for the given class.
   * Returns a composite ID: "<sessionId>:<bitIndex>"
   *
   * Diagnostic-channel slots (56–63) are reserved for 'chronicler' only.
   * All other shadow classes skip these slots.
   *
   * Throws SE4RegistryExhaustedError if all slots are consumed.
   */
  spawnShadowId(shadowClass: SE4ShadowClass): string {
    for (let k = 0; k < this._chainLength; k++) {
      const isReservedDiagnostic = k >= DIAGNOSTIC_SLOT_START && k <= DIAGNOSTIC_SLOT_END;
      if (isReservedDiagnostic && shadowClass !== 'chronicler') continue;

      if ((this._allocated & (1n << BigInt(k))) === 0n) {
        this._allocated |= (1n << BigInt(k));
        return `${this._sessionId}:${k}`;
      }
    }
    throw new SE4RegistryExhaustedError(this._sessionId, shadowClass);
  }

  /**
   * Attempt to spawn a Shadow ID, returning null instead of throwing on
   * exhaustion. Used by collision-avoidance retry logic.
   */
  trySpawnShadowId(shadowClass: SE4ShadowClass): string | null {
    try {
      return this.spawnShadowId(shadowClass);
    } catch (e) {
      if (e instanceof SE4RegistryExhaustedError) return null;
      throw e;
    }
  }

  /**
   * Spawn with retry (up to maxRetry attempts). Used by Knight Bushel
   * collision-avoidance when two sub-shadows would share a cell_identities
   * subset. With single-bit allocation this can only fail on exhaustion.
   */
  spawnWithRetry(shadowClass: SE4ShadowClass, maxRetry = 3): string {
    for (let attempt = 0; attempt < maxRetry; attempt++) {
      const id = this.trySpawnShadowId(shadowClass);
      if (id !== null) return id;
    }
    throw new SE4RegistryExhaustedError(this._sessionId, shadowClass);
  }

  /** Release a Shadow ID slot back to the free pool. */
  releaseId(shadowId: string): void {
    const k = this._extractBitIndex(shadowId);
    if (k !== null) {
      this._allocated &= ~(1n << BigInt(k));
    }
  }

  /**
   * Decode cell_identities from a shadow ID.
   * Returns ['cell_<k>'] for bit index k.
   */
  decodeIdentities(shadowId: string): string[] {
    const k = this._extractBitIndex(shadowId);
    return k !== null ? [`cell_${k}`] : [];
  }

  /** Count of currently allocated (active) Shadow slots. */
  activeCount(): number {
    let count = 0;
    let mask = this._allocated;
    while (mask > 0n) {
      count += Number(mask & 1n);
      mask >>= 1n;
    }
    return count;
  }

  /**
   * Check if two shadow IDs would collide (share any cell_identities element).
   * With single-bit allocation, this is always false for distinct IDs — but
   * the check is included for completeness and future multi-bit allocation.
   */
  wouldCollide(shadowIdA: string, shadowIdB: string): boolean {
    const cellsA = this.decodeIdentities(shadowIdA);
    const cellsB = new Set(this.decodeIdentities(shadowIdB));
    return cellsA.some((c) => cellsB.has(c));
  }

  /**
   * Enumerate all allocated shadow IDs (useful for G3 integration test
   * collision-rate measurement across a Bushel fire).
   */
  allocatedIds(): string[] {
    const ids: string[] = [];
    for (let k = 0; k < this._chainLength; k++) {
      if ((this._allocated & (1n << BigInt(k))) !== 0n) {
        ids.push(`${this._sessionId}:${k}`);
      }
    }
    return ids;
  }

  /** Snapshot of full bit-mask state (for diagnostics). */
  bitmaskSnapshot(): string {
    return this._allocated.toString(2).padStart(this._chainLength, '0');
  }

  private _extractBitIndex(shadowId: string): number | null {
    const colon = shadowId.lastIndexOf(':');
    if (colon === -1) return null;
    const k = parseInt(shadowId.slice(colon + 1), 10);
    return isNaN(k) ? null : k;
  }
}

// ─── Custom error ─────────────────────────────────────────────────────────────

export class SE4RegistryExhaustedError extends Error {
  constructor(sessionId: string, shadowClass: SE4ShadowClass) {
    super(
      `SE4Registry: session '${sessionId}' exhausted all available slots for shadow class '${shadowClass}'`
    );
    this.name = 'SE4RegistryExhaustedError';
  }
}

// ─── Module-level default registry (per-process session) ─────────────────────

export const DEFAULT_SESSION_ID = randomUUID();

/**
 * Default session registry — module-level singleton.
 * All SE-4 integrations use this unless they construct a dedicated registry
 * (e.g. for isolated test sessions).
 */
export const defaultRegistry = new SE4Registry(DEFAULT_SESSION_ID);
