/**
 * Relay Registry -- Wave 2 / Phase alpha (BP073)
 * ================================================
 * In-memory peer registry for the relay server.
 * Tracks connected peers, their session IDs, and authentication state.
 * Pure TypeScript -- no Electron or Node.js imports.
 */

import type { RelayPeerEntry } from "./relay_protocol";

export interface RegistryEntry extends RelayPeerEntry {
  sessionId: string;
  /** Socket/connection handle. Opaque to registry -- set by caller. */
  socket?: unknown;
}

export class RelayRegistry {
  private readonly peers = new Map<string, RegistryEntry>();

  register(entry: RegistryEntry): void {
    this.peers.set(entry.peerId, entry);
  }

  unregister(peerId: string): RegistryEntry | undefined {
    const entry = this.peers.get(peerId);
    this.peers.delete(peerId);
    return entry;
  }

  get(peerId: string): RegistryEntry | undefined {
    return this.peers.get(peerId);
  }

  has(peerId: string): boolean {
    return this.peers.has(peerId);
  }

  /** All authenticated peers. */
  authenticatedPeers(): RegistryEntry[] {
    return [...this.peers.values()].filter((e) => e.authenticated);
  }

  /** All peers (authenticated or not). */
  allPeers(): RegistryEntry[] {
    return [...this.peers.values()];
  }

  size(): number {
    return this.peers.size;
  }

  /** Snapshot suitable for relay_peer_list broadcast. */
  snapshot(): RelayPeerEntry[] {
    return [...this.peers.values()].map(({ peerId, displayName, connectedAt, authenticated }) => ({
      peerId,
      displayName,
      connectedAt,
      authenticated,
    }));
  }

  /** Mark a peer as authenticated. Returns false if peer not found. */
  markAuthenticated(peerId: string, sessionId: string): boolean {
    const entry = this.peers.get(peerId);
    if (!entry) return false;
    entry.authenticated = true;
    entry.sessionId = sessionId;
    return true;
  }

  clear(): void {
    this.peers.clear();
  }
}
