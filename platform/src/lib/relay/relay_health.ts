/**
 * Relay Health Monitor -- Wave 2 / Phase alpha (BP073)
 * =====================================================
 * Pure state-machine for relay endpoint health.
 * Tracks ping/pong round-trips, marks endpoints healthy/unhealthy.
 * No Electron or Node.js imports.
 */

export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface RelayHealthState {
  endpoint: string;
  status: HealthStatus;
  /** Last successful pong latency in milliseconds. */
  lastPongMs: number | null;
  /** Consecutive ping failures before current state. */
  consecutiveFailures: number;
  /** Consecutive successes since recovering. */
  consecutiveSuccesses: number;
  lastCheckedAt: string | null;
  uptimeMs: number;
}

const FAILURE_THRESHOLD = 3;    // failures before marking "down"
const DEGRADED_THRESHOLD = 1;   // failures before marking "degraded"
const RECOVERY_THRESHOLD = 2;   // successes before marking "healthy"

export class RelayHealthMonitor {
  private readonly states = new Map<string, RelayHealthState>();
  private readonly startedAt = Date.now();

  init(endpoint: string): void {
    if (!this.states.has(endpoint)) {
      this.states.set(endpoint, {
        endpoint,
        status: "unknown",
        lastPongMs: null,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastCheckedAt: null,
        uptimeMs: 0,
      });
    }
  }

  recordPong(endpoint: string, latencyMs: number): void {
    this.init(endpoint);
    const state = this.states.get(endpoint)!;
    state.lastPongMs = latencyMs;
    state.consecutiveFailures = 0;
    state.consecutiveSuccesses++;
    state.lastCheckedAt = new Date().toISOString();
    state.uptimeMs = Date.now() - this.startedAt;

    if (state.consecutiveSuccesses >= RECOVERY_THRESHOLD || state.status === "unknown") {
      state.status = "healthy";
    }
  }

  recordFailure(endpoint: string): void {
    this.init(endpoint);
    const state = this.states.get(endpoint)!;
    state.consecutiveFailures++;
    state.consecutiveSuccesses = 0;
    state.lastCheckedAt = new Date().toISOString();

    if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
      state.status = "down";
    } else if (state.consecutiveFailures >= DEGRADED_THRESHOLD) {
      state.status = "degraded";
    }
  }

  getState(endpoint: string): RelayHealthState {
    this.init(endpoint);
    return this.states.get(endpoint)!;
  }

  isHealthy(endpoint: string): boolean {
    return this.getState(endpoint).status === "healthy";
  }

  /** Returns all endpoints ordered by health (healthy first). */
  rankedEndpoints(): RelayHealthState[] {
    const order: Record<HealthStatus, number> = {
      healthy: 0,
      degraded: 1,
      unknown: 2,
      down: 3,
    };
    return [...this.states.values()].sort(
      (a, b) => order[a.status] - order[b.status],
    );
  }

  reset(endpoint: string): void {
    this.states.delete(endpoint);
  }

  clear(): void {
    this.states.clear();
  }
}
