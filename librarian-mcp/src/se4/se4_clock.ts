/**
 * SE-4 Lamport Clock — Burst Signaling Primitive (LB-STACK-0172 §Primitive1)
 * ==========================================================================
 * Monotonic logical time for Shadow event ordering across a session.
 *
 * Clock rule (per Lamport 1978):
 *   On SEND: increment local epoch, stamp epoch_id with current value.
 *   On RECEIVE: local = max(local, received) + 1
 *
 * This module is a per-process singleton — all SE-4 events in a Librarian
 * MCP server process share one global epoch. This is correct because the
 * Librarian MCP is single-process and all Shadow events route through it.
 *
 * For sessions with N > 4 concurrent Shadow classes, a vector-clock extension
 * is provided via SE4VectorClock.
 */

// ─── Scalar Lamport clock (default) ──────────────────────────────────────────

let _epoch = 0;

/** Increment and return the current epoch. Call on every SE-4 event send. */
export function tickClock(): number {
  return ++_epoch;
}

/**
 * Advance clock on receiving a message from another Shadow.
 * Rule: local = max(local, received) + 1
 */
export function advanceClock(received: number): number {
  _epoch = Math.max(_epoch, received) + 1;
  return _epoch;
}

/** Current epoch value without incrementing. */
export function currentEpoch(): number {
  return _epoch;
}

/** Reset epoch to zero (test harness only — never call in production). */
export function resetClock(): void {
  _epoch = 0;
}

/** Encode epoch_id field: "<epoch>:<shadowId>" */
export function encodeEpochId(epoch: number, shadowId: string): string {
  return `${epoch}:${shadowId}`;
}

/** Decode epoch number from an epoch_id string. Returns NaN if malformed. */
export function decodeEpoch(epochId: string): number {
  return parseInt(epochId.split(':')[0], 10);
}

/** Decode shadow ID suffix from an epoch_id string. */
export function decodeEpochShadowId(epochId: string): string {
  const colon = epochId.indexOf(':');
  return colon === -1 ? '' : epochId.slice(colon + 1);
}

// ─── Vector clock (for N > 4 concurrent Shadow classes) ──────────────────────

/**
 * SE4VectorClock — per-shadow logical vector for high-concurrency sessions.
 * Each Shadow instance maintains its own vector, keyed by shadow_id.
 */
export class SE4VectorClock {
  private clocks: Map<string, number>;

  constructor(initial?: Record<string, number>) {
    this.clocks = new Map(Object.entries(initial ?? {}));
  }

  /** Increment this Shadow's own counter. Returns the new vector snapshot. */
  tick(ownId: string): Record<string, number> {
    const current = this.clocks.get(ownId) ?? 0;
    this.clocks.set(ownId, current + 1);
    return this.snapshot();
  }

  /**
   * Merge a received vector into this clock.
   * Rule: for each key, take max(local, received); then increment ownId.
   */
  advance(ownId: string, received: Record<string, number>): Record<string, number> {
    for (const [id, epoch] of Object.entries(received)) {
      const local = this.clocks.get(id) ?? 0;
      this.clocks.set(id, Math.max(local, epoch));
    }
    // Increment own counter after merge
    const ownCurrent = this.clocks.get(ownId) ?? 0;
    this.clocks.set(ownId, ownCurrent + 1);
    return this.snapshot();
  }

  /** Current vector snapshot (plain object). */
  snapshot(): Record<string, number> {
    return Object.fromEntries(this.clocks);
  }

  /** Serialize to epoch_id string for SE4Envelope (JSON-encoded vector). */
  toEpochId(ownId: string): string {
    return JSON.stringify(this.snapshot()) + ':' + ownId;
  }
}
