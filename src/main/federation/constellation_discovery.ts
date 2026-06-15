/**
 * constellation_discovery.ts — v0.4.0 BP083 LAN/WAN peer discovery
 *
 * SCAFFOLD v0.4.0 — LAN peer discovery via saved peer list + HTTP heartbeat check.
 * Production: replace with Apiarist Hive Federate routing in v0.5.0.
 *
 * Peers are saved in %APPDATA%/MnemosyneC/constellation_peers.json.
 * Heartbeat: simple HTTP GET to peer's MnemosyneC peer_server /api/heartbeat.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import type { ConstellationPeer } from './mic_types';

const PEERS_DIR = () => join(app.getPath('appData'), 'MnemosyneC');
const PEERS_FILE = () => join(PEERS_DIR(), 'constellation_peers.json');

function ensurePeersDir(): void {
  const dir = PEERS_DIR();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadSavedPeers(): ConstellationPeer[] {
  try {
    const f = PEERS_FILE();
    if (!existsSync(f)) return [];
    const saved = JSON.parse(readFileSync(f, 'utf8')) as ConstellationPeer[];
    // Mark all offline initially — heartbeat check will update
    return saved.map((p) => ({ ...p, online: false }));
  } catch {
    return [];
  }
}

export function savePeers(peers: ConstellationPeer[]): void {
  try {
    ensurePeersDir();
    writeFileSync(PEERS_FILE(), JSON.stringify(peers, null, 2), 'utf8');
  } catch (err) {
    console.error('[ConstellationDiscovery] savePeers error:', err);
  }
}

export async function heartbeatPeer(peer: ConstellationPeer): Promise<boolean> {
  // SCAFFOLD v0.4.0: simple HTTP ping
  try {
    const res = await fetch(`http://${peer.address}/api/heartbeat`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function discoverPeers(): Promise<ConstellationPeer[]> {
  const saved = loadSavedPeers();
  if (saved.length === 0) return [];

  // Check each peer's heartbeat in parallel
  const results = await Promise.all(
    saved.map(async (peer) => {
      const online = await heartbeatPeer(peer);
      return { ...peer, online, lastSeen: online ? Date.now() : peer.lastSeen };
    }),
  );

  // Save updated status
  savePeers(results);
  return results;
}

export function addOrUpdatePeer(peer: ConstellationPeer): void {
  const saved = loadSavedPeers();
  const idx = saved.findIndex((p) => p.id === peer.id);
  if (idx >= 0) {
    saved[idx] = peer;
  } else {
    saved.push(peer);
  }
  savePeers(saved);
}

export function removePeer(peerId: string): void {
  const saved = loadSavedPeers();
  savePeers(saved.filter((p) => p.id !== peerId));
}

export async function getPeerInfo(peerAddress: string): Promise<Partial<ConstellationPeer> | null> {
  // SCAFFOLD v0.4.0: query peer for its info (installed domains, model, etc.)
  try {
    const res = await fetch(`http://${peerAddress}/api/info`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Partial<ConstellationPeer>;
  } catch {
    return null;
  }
}
