/**
 * Relay Protocol -- Wave 2 / Phase alpha (BP073)
 * ================================================
 * Pure types shared between relay server, relay client, and test harness.
 * No Electron or Node.js imports. Safe in both browser and Node environments.
 *
 * Escalation order: LAN mDNS -> WAN soccerball -> relay-assisted
 * Cost: $0 transport / ~$0.0001/grading / relay compute ~$0.001/hop
 */

// ─── Escalation methods ───────────────────────────────────────────────────────

export type EscalationMethod = "lan_mdns" | "wan_soccerball" | "relay_assisted" | "manual";

// ─── Relay wire message types ─────────────────────────────────────────────────

export type RelayMsgType =
  | "relay_join"        // Client -> relay: register peerId
  | "relay_leave"       // Client -> relay: deregister
  | "relay_route"       // Client -> relay -> target: forward message
  | "relay_broadcast"   // Relay -> all clients: push peer list
  | "relay_peer_list"   // Relay -> joining client: current peer list
  | "relay_auth"        // Client -> relay: authenticate with token
  | "relay_auth_ack"    // Relay -> client: auth result
  | "ping"
  | "pong"
  | "relay_health"      // Client -> relay: health check request
  | "relay_health_ack"; // Relay -> client: health check response

export interface RelayMsg {
  type: RelayMsgType;
  peerId: string;
  payload?: unknown;
  ts: string;
  sessionId?: string;
}

// ─── Payload shapes ───────────────────────────────────────────────────────────

export interface RelayJoinPayload {
  peerId: string;
  displayName?: string;
  authToken?: string;
}

export interface RelayLeavePayload {
  peerId: string;
  reason?: string;
}

export interface RelayRoutePayload {
  toPeerId: string;
  innerMsg: RelayMsg;
  hopCount?: number;
}

export interface RelayBroadcastPayload {
  peers: RelayPeerEntry[];
  broadcastAt: string;
}

export interface RelayAuthPayload {
  token: string;
  peerId: string;
}

export interface RelayAuthAckPayload {
  accepted: boolean;
  reason?: string;
  sessionId?: string;
}

export interface RelayHealthAckPayload {
  relayVersion: string;
  connectedPeers: number;
  uptimeMs: number;
  serverTs: string;
}

// ─── Peer record ──────────────────────────────────────────────────────────────

export interface RelayPeerEntry {
  peerId: string;
  displayName?: string;
  connectedAt: string;
  authenticated: boolean;
}

// ─── Session / hop cost record ────────────────────────────────────────────────

export interface RelayHopRecord {
  sessionId: string;
  hopIndex: number;
  fromPeerId: string;
  toPeerId: string;
  relayEndpoint: string;
  method: EscalationMethod;
  /** Always $0 -- peer-to-peer after handshake. */
  transportUsd: 0;
  /** Relay compute per hop (~$0.001 for signaling overhead). */
  relayComputeUsd: number;
  /** Grading cost: ~$0.0001 per graded answer. */
  gradingUsd: number;
  recordedAt: string;
}

// ─── Relay endpoint descriptor ────────────────────────────────────────────────

export interface RelayEndpointDescriptor {
  url: string;
  label: string;
  region?: string;
  priority: number;       // lower = higher priority
  healthy: boolean;
  lastCheckedAt: string | null;
  consecutiveFailures: number;
}

// ─── Relay connection result ──────────────────────────────────────────────────

export interface RelayConnectionResult {
  method: EscalationMethod;
  peerId: string;
  relayUsed: boolean;
  relayEndpoint?: string;
  /** Human-readable cost. Never flat "$0" if relay was used. */
  estimatedCost: string;
  connectedAt: string;
  hopCount: number;
  sessionId: string;
  note: string;
}
