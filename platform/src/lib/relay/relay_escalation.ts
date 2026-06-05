/**
 * Relay Escalation -- Wave 2 / Phase alpha (BP073)
 * ================================================
 * Pure LAN->WAN->relay escalation logic.
 * Designed to be testable without Electron or live network.
 * The RelayEscalator accepts pluggable "try" functions so tests can inject fakes.
 *
 * Circuit breaker, retry with exponential backoff, and per-hop cost accounting
 * are all integrated here.
 */

import type { EscalationMethod, RelayConnectionResult } from "./relay_protocol";
import { recordHop, formatCost } from "./relay_cost";
import type { RelayPool } from "./relay_pool";

// ─── Circuit breaker ──────────────────────────────────────────────────────────

export type CircuitState = "closed" | "open" | "half-open";

interface BreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureAt: number | null;
  halfOpenAt: number | null;
}

const OPEN_THRESHOLD = 3;
const RECOVERY_MS = 30_000;

export class CircuitBreaker {
  private readonly breakers = new Map<string, BreakerState>();

  private get(key: string): BreakerState {
    if (!this.breakers.has(key)) {
      this.breakers.set(key, {
        state: "closed",
        failureCount: 0,
        lastFailureAt: null,
        halfOpenAt: null,
      });
    }
    return this.breakers.get(key)!;
  }

  canAttempt(key: string): boolean {
    const b = this.get(key);
    if (b.state === "closed") return true;
    if (b.state === "open") {
      if (b.halfOpenAt && Date.now() >= b.halfOpenAt) {
        b.state = "half-open";
        return true;
      }
      return false;
    }
    return true; // half-open: allow one probe
  }

  recordSuccess(key: string): void {
    const b = this.get(key);
    b.state = "closed";
    b.failureCount = 0;
    b.lastFailureAt = null;
    b.halfOpenAt = null;
  }

  recordFailure(key: string): void {
    const b = this.get(key);
    b.failureCount++;
    b.lastFailureAt = Date.now();
    if (b.failureCount >= OPEN_THRESHOLD && b.state !== "open") {
      b.state = "open";
      b.halfOpenAt = Date.now() + RECOVERY_MS;
    }
  }

  getState(key: string): CircuitState {
    return this.get(key).state;
  }

  reset(key: string): void {
    this.breakers.delete(key);
  }
}

// ─── Escalation config ────────────────────────────────────────────────────────

export interface EscalationConfig {
  maxRelayAttempts: number;
  timeoutMs: number;
  preferDirect: boolean;
  /** Injected "try LAN" function for testability. */
  tryLan?: (peerId: string) => Promise<boolean>;
  /** Injected "try WAN soccerball" function for testability. */
  tryWan?: (peerId: string) => Promise<boolean>;
  /** Injected "try relay" function for testability. */
  tryRelay?: (peerId: string, endpoint: string) => Promise<boolean>;
}

export const DEFAULT_ESCALATION_CONFIG: EscalationConfig = {
  maxRelayAttempts: 3,
  timeoutMs: 10_000,
  preferDirect: true,
};

// ─── RelayEscalator ───────────────────────────────────────────────────────────

let sessionCounter = 0;

export class RelayEscalator {
  private readonly config: EscalationConfig;
  private readonly pool: RelayPool;
  readonly circuitBreaker: CircuitBreaker;

  constructor(pool: RelayPool, config: EscalationConfig = DEFAULT_ESCALATION_CONFIG) {
    this.pool = pool;
    this.config = { ...DEFAULT_ESCALATION_CONFIG, ...config };
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Connect to a peer using escalating discovery.
   * Order: LAN mDNS -> WAN soccerball -> relay-assisted (with circuit breaker).
   */
  async connect(targetPeerId: string, ourPeerId: string): Promise<RelayConnectionResult> {
    sessionCounter++;
    const sessionId = `esc-${Date.now()}-${sessionCounter}`;

    // Step 1: LAN mDNS
    const lanOk = this.config.tryLan
      ? await this.config.tryLan(targetPeerId)
      : false;

    if (lanOk) {
      const hopRec = recordHop(sessionId, 0, ourPeerId, targetPeerId, "lan", "lan_mdns");
      return {
        method: "lan_mdns",
        peerId: targetPeerId,
        relayUsed: false,
        connectedAt: new Date().toISOString(),
        estimatedCost: formatCost("lan_mdns", 1),
        hopCount: 1,
        sessionId,
        note: `LAN mDNS connection. Hop cost: $${hopRec.relayComputeUsd.toFixed(4)} compute.`,
      };
    }

    // Step 2: WAN soccerball
    const wanOk = this.config.tryWan
      ? await this.config.tryWan(targetPeerId)
      : false;

    if (wanOk) {
      const hopRec = recordHop(sessionId, 0, ourPeerId, targetPeerId, "wan", "wan_soccerball");
      return {
        method: "wan_soccerball",
        peerId: targetPeerId,
        relayUsed: false,
        connectedAt: new Date().toISOString(),
        estimatedCost: formatCost("wan_soccerball", 1),
        hopCount: 1,
        sessionId,
        note: `WAN soccerball DAG lookup. Hop cost: $${hopRec.relayComputeUsd.toFixed(4)} compute.`,
      };
    }

    // Step 3: Relay-assisted (with circuit breaker + exponential backoff)
    const endpoint = this.pool.selectEndpoint();
    if (!endpoint) {
      throw new Error(`[RelayEscalator] No healthy relay endpoints available for peer ${targetPeerId}`);
    }

    if (!this.circuitBreaker.canAttempt(endpoint.url)) {
      throw new Error(
        `[RelayEscalator] Circuit OPEN for relay ${endpoint.url}. ` +
        `Connect attempt for peer ${targetPeerId} rejected.`,
      );
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.config.maxRelayAttempts; attempt++) {
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await delay(backoffMs);
      }

      try {
        const relayOk = this.config.tryRelay
          ? await this.config.tryRelay(targetPeerId, endpoint.url)
          : true; // prod: real WS handshake

        if (relayOk) {
          const hopIndex = attempt;
          const hopRec = recordHop(
            sessionId,
            hopIndex,
            ourPeerId,
            targetPeerId,
            endpoint.url,
            "relay_assisted",
          );

          this.circuitBreaker.recordSuccess(endpoint.url);
          this.pool.recordSuccess(endpoint.url);

          const hopCount = attempt + 1;
          return {
            method: "relay_assisted",
            peerId: targetPeerId,
            relayUsed: true,
            relayEndpoint: endpoint.url,
            estimatedCost: formatCost("relay_assisted", hopCount),
            connectedAt: new Date().toISOString(),
            hopCount,
            sessionId,
            note:
              attempt === 0
                ? `Relay connected via ${endpoint.label} on first attempt. ` +
                  `Relay compute: ~$${hopRec.relayComputeUsd.toFixed(4)}/hop.`
                : `Relay connected via ${endpoint.label} after ${attempt + 1} attempts.`,
          };
        }

        throw new Error("Relay try function returned false");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.circuitBreaker.recordFailure(endpoint.url);
        this.pool.recordFailure(endpoint.url);
      }
    }

    throw new Error(
      `[RelayEscalator] All ${this.config.maxRelayAttempts} relay attempts failed for peer ` +
      `${targetPeerId} via ${endpoint.url}. Last error: ${lastError?.message}.`,
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
