/**
 * Relay Cost Accounting -- Wave 2 / Phase alpha (BP073)
 * ======================================================
 * Honest per-hop cost telemetry for LAN->WAN->relay escalation.
 *
 * Doctrine:
 *   - Transport is ALWAYS $0 (peer-to-peer after relay handshake)
 *   - Relay compute: ~$0.001 per signaling hop
 *   - Grading: ~$0.0001 per graded answer
 *   - NEVER display flat "$0" when relay was used
 *
 * No Electron or Node.js imports.
 */

import type { EscalationMethod, RelayHopRecord } from "./relay_protocol";

// ─── Cost constants ───────────────────────────────────────────────────────────

export const RELAY_COMPUTE_USD_PER_HOP = 0.001;
export const GRADING_USD_PER_ANSWER = 0.0001;
export const TRANSPORT_USD = 0 as const;

// ─── Cost log ────────────────────────────────────────────────────────────────

const hopLog: RelayHopRecord[] = [];

export function getHopLog(): RelayHopRecord[] {
  return [...hopLog];
}

export function clearHopLog(): void {
  hopLog.length = 0;
}

// ─── Record a hop ─────────────────────────────────────────────────────────────

export function recordHop(
  sessionId: string,
  hopIndex: number,
  fromPeerId: string,
  toPeerId: string,
  relayEndpoint: string,
  method: EscalationMethod,
): RelayHopRecord {
  const relayComputeUsd = method === "relay_assisted" ? RELAY_COMPUTE_USD_PER_HOP : 0;
  const gradingUsd = GRADING_USD_PER_ANSWER; // always charged on relay path

  const record: RelayHopRecord = {
    sessionId,
    hopIndex,
    fromPeerId,
    toPeerId,
    relayEndpoint,
    method,
    transportUsd: TRANSPORT_USD,
    relayComputeUsd,
    gradingUsd,
    recordedAt: new Date().toISOString(),
  };

  hopLog.push(record);
  return record;
}

// ─── Cost string formatting ───────────────────────────────────────────────────

/**
 * Format cost as a human-readable string.
 * NEVER returns flat "$0" when relay was used.
 */
export function formatCost(
  method: EscalationMethod,
  hopCount: number,
): string {
  if (method === "lan_mdns" || method === "wan_soccerball") {
    return "$0 transport / ~$0.0001 grading (direct peer-to-peer)";
  }

  const relayCompute = (RELAY_COMPUTE_USD_PER_HOP * hopCount).toFixed(4);
  const grading = GRADING_USD_PER_ANSWER.toFixed(4);
  return (
    `$0 transport / ~$${relayCompute} relay compute (${hopCount} hop${hopCount !== 1 ? "s" : ""})` +
    ` / ~$${grading} grading`
  );
}

/**
 * Aggregate cost summary for a session.
 */
export interface CostSummary {
  totalTransportUsd: 0;
  totalRelayComputeUsd: number;
  totalGradingUsd: number;
  totalUsd: number;
  hopCount: number;
  displayString: string;
}

export function summarizeCost(records: RelayHopRecord[]): CostSummary {
  const totalRelayComputeUsd = records.reduce((sum, r) => sum + r.relayComputeUsd, 0);
  const totalGradingUsd = records.reduce((sum, r) => sum + r.gradingUsd, 0);
  const totalUsd = totalRelayComputeUsd + totalGradingUsd;
  const hopCount = records.length;

  const displayString =
    hopCount === 0
      ? "$0 transport / $0 relay / ~$0.0001 grading"
      : formatCost("relay_assisted", hopCount);

  return {
    totalTransportUsd: TRANSPORT_USD,
    totalRelayComputeUsd,
    totalGradingUsd,
    totalUsd,
    hopCount,
    displayString,
  };
}

/**
 * Validate that a cost string is never a flat "$0".
 * Returns true if the cost is honest (relay costs are disclosed).
 */
export function isCostHonest(costString: string, relayWasUsed: boolean): boolean {
  if (!relayWasUsed) return true; // Direct peers may report $0 transport
  // If relay was used, must mention relay compute or grading
  return costString.includes("relay compute") || costString.includes("grading");
}
