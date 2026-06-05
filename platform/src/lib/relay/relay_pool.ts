/**
 * Relay Pool -- Wave 2 / Phase alpha (BP073)
 * ==========================================
 * Pool of relay endpoints with:
 *   - Round-robin / least-failures load distribution
 *   - Automatic failover when an endpoint is unhealthy
 *   - Priority-aware selection
 * No Electron or Node.js imports.
 */

import type { RelayEndpointDescriptor } from "./relay_protocol";
import { RelayHealthMonitor } from "./relay_health";

export type SelectionStrategy = "priority" | "round_robin" | "least_failures";

export interface RelayPoolConfig {
  strategy: SelectionStrategy;
  healthMonitor?: RelayHealthMonitor;
}

export class RelayPool {
  private readonly endpoints: RelayEndpointDescriptor[];
  private readonly config: RelayPoolConfig;
  private readonly healthMonitor: RelayHealthMonitor;
  private roundRobinIndex = 0;

  constructor(endpoints: RelayEndpointDescriptor[], config: RelayPoolConfig) {
    if (endpoints.length === 0) throw new Error("[RelayPool] At least one endpoint required");
    this.endpoints = [...endpoints].sort((a, b) => a.priority - b.priority);
    this.config = config;
    this.healthMonitor = config.healthMonitor ?? new RelayHealthMonitor();

    // Seed health monitor with all endpoints
    for (const ep of this.endpoints) {
      this.healthMonitor.init(ep.url);
    }
  }

  /**
   * Select the best available relay endpoint.
   * Falls back through pool on failure; returns null if all are down.
   */
  selectEndpoint(): RelayEndpointDescriptor | null {
    const healthy = this._healthyEndpoints();
    if (healthy.length === 0) return null;

    switch (this.config.strategy) {
      case "round_robin":
        return this._roundRobin(healthy);
      case "least_failures":
        return this._leastFailures(healthy);
      case "priority":
      default:
        return healthy[0]; // already sorted by priority
    }
  }

  /**
   * Record a successful connection to an endpoint.
   */
  recordSuccess(url: string): void {
    const ep = this._find(url);
    if (ep) {
      ep.healthy = true;
      ep.consecutiveFailures = 0;
      ep.lastCheckedAt = new Date().toISOString();
    }
    this.healthMonitor.recordPong(url, 0);
  }

  /**
   * Record a failed connection attempt.
   */
  recordFailure(url: string): void {
    const ep = this._find(url);
    if (ep) {
      ep.consecutiveFailures++;
      ep.lastCheckedAt = new Date().toISOString();
      if (ep.consecutiveFailures >= 3) {
        ep.healthy = false;
      }
    }
    this.healthMonitor.recordFailure(url);
  }

  /**
   * Force-mark an endpoint healthy (e.g., after manual reset).
   */
  markHealthy(url: string): void {
    const ep = this._find(url);
    if (ep) {
      ep.healthy = true;
      ep.consecutiveFailures = 0;
      ep.lastCheckedAt = new Date().toISOString();
    }
    this.healthMonitor.reset(url);
  }

  /** All endpoints in priority order. */
  all(): RelayEndpointDescriptor[] {
    return [...this.endpoints];
  }

  /** Endpoints currently marked healthy. */
  healthyCount(): number {
    return this._healthyEndpoints().length;
  }

  /** Total endpoint count in pool. */
  totalCount(): number {
    return this.endpoints.length;
  }

  private _healthyEndpoints(): RelayEndpointDescriptor[] {
    return this.endpoints.filter((ep) => ep.healthy);
  }

  private _roundRobin(pool: RelayEndpointDescriptor[]): RelayEndpointDescriptor {
    const ep = pool[this.roundRobinIndex % pool.length];
    this.roundRobinIndex++;
    return ep;
  }

  private _leastFailures(pool: RelayEndpointDescriptor[]): RelayEndpointDescriptor {
    return pool.reduce((best, ep) =>
      ep.consecutiveFailures < best.consecutiveFailures ? ep : best,
    );
  }

  private _find(url: string): RelayEndpointDescriptor | undefined {
    return this.endpoints.find((ep) => ep.url === url);
  }
}

// ─── Default relay pool for the platform ─────────────────────────────────────

export const DEFAULT_RELAY_ENDPOINTS: RelayEndpointDescriptor[] = [
  {
    url: "wss://relay.mnemosynec.ai",
    label: "Primary Relay (mnemosynec.ai)",
    region: "us-east",
    priority: 1,
    healthy: true,
    lastCheckedAt: null,
    consecutiveFailures: 0,
  },
  {
    url: "wss://relay2.lianabanyan.com",
    label: "Secondary Relay (lianabanyan.com)",
    region: "us-west",
    priority: 2,
    healthy: true,
    lastCheckedAt: null,
    consecutiveFailures: 0,
  },
];

export function createDefaultRelayPool(strategy: SelectionStrategy = "priority"): RelayPool {
  return new RelayPool(DEFAULT_RELAY_ENDPOINTS, { strategy });
}
