/**
 * mic_dispatcher.ts — MIC (Machine In Charge) Conductor v0.4.0 BP083
 *
 * Greedy domain-to-peer assignment algorithm.
 * Assigns domains to the peer with the lowest pending load.
 * Domain-Chocolate match bonus: if a peer has the domain installed, it gets
 * priority (load - 1 effective). Per-domain isolation (BP078 canon) ensures
 * no cross-domain contamination.
 *
 * SCAFFOLD v0.4.0 — peer dispatch via HTTP POST to peer_server.ts port 7474.
 * Thorax encryption + Socceri transport deferred to v0.4.1.
 */

import type {
  ConstellationPeer,
  DomainWorkUnit,
  MicWorkload,
  MicAggregatedResult,
  PeerPlowResult,
  MicStatusEvent,
  MicStartPayload,
} from './mic_types';
import { discoverPeers } from './constellation_discovery';
import { randomBytes } from 'crypto';

const PEER_SERVER_PORT = 7474;

export function generateWorkloadId(): string {
  return 'mic_' + randomBytes(6).toString('hex');
}

// ─── Greedy partition algorithm ───────────────────────────────────────────────

export function partitionWorkload(
  domains: string[],
  questionBanks: Record<string, string[]>,
  peers: ConstellationPeer[],
  selfId: string,
): DomainWorkUnit[] {
  const onlinePeers = peers.filter((p) => p.online);

  // Build worker roster (self + online peers)
  const workers: Array<{ id: string; load: number; installedDomains: string[] }> = [
    { id: selfId, load: 0, installedDomains: [] },
    ...onlinePeers.map((p) => ({
      id: p.id,
      load: 0,
      installedDomains: p.installedDomains,
    })),
  ];

  const units: DomainWorkUnit[] = [];

  for (const domain of domains) {
    // Pick worker with lowest effective load
    // Domain-Chocolate match: subtract 1 from effective load if domain is installed
    let bestWorker = workers[0]!;
    let bestEffectiveLoad =
      bestWorker.load - (bestWorker.installedDomains.includes(domain) ? 1 : 0);

    for (const worker of workers.slice(1)) {
      const effectiveLoad = worker.load - (worker.installedDomains.includes(domain) ? 1 : 0);
      if (effectiveLoad < bestEffectiveLoad) {
        bestWorker = worker;
        bestEffectiveLoad = effectiveLoad;
      }
    }

    bestWorker.load++;

    units.push({
      domain,
      questions: questionBanks[domain] ?? [],
      assignedTo: bestWorker.id,
      status: 'pending',
      ebletCount: 0,
      andonEvents: 0,
    });
  }

  return units;
}

// ─── Estimated wall-clock ─────────────────────────────────────────────────────

export function estimateWallClockMs(
  units: DomainWorkUnit[],
  peers: ConstellationPeer[],
  selfId: string,
): number {
  // Per-domain estimate: ~5 min per domain per machine (rough average at 100 q)
  const PER_DOMAIN_MS = 5 * 60 * 1000;
  const workerCount = 1 + peers.filter((p) => p.online).length;
  const maxDomainsPerWorker = Math.ceil(units.length / workerCount);
  return maxDomainsPerWorker * PER_DOMAIN_MS;
}

// ─── Dispatch single domain to peer (HTTP scaffold) ───────────────────────────

async function dispatchDomainToPeer(
  peer: ConstellationPeer,
  domain: string,
  questions: string[],
  payload: MicStartPayload,
): Promise<PeerPlowResult> {
  // SCAFFOLD v0.4.0: HTTP POST to peer's MnemosyneC peer_server
  // Full Thorax encryption + Socceri transport in v0.4.1
  const url = `http://${peer.address}/api/plow-domain`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        questions,
        ollamaBaseUrl: payload.ollamaBaseUrl ?? 'http://127.0.0.1:11434',
        model: payload.model ?? 'gemma4:12b',
      }),
      signal: AbortSignal.timeout(30 * 60 * 1000), // 30 min timeout for a full domain
    });

    if (!res.ok) {
      return {
        peerId: peer.id,
        domain,
        ebletsWritten: 0,
        quarantined: 0,
        andonEvents: 0,
        status: 'red',
        error: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as {
      ebletsWritten?: number;
      quarantined?: number;
      andonEvents?: number;
      status?: 'green' | 'yellow' | 'red';
    };

    return {
      peerId: peer.id,
      domain,
      ebletsWritten: data.ebletsWritten ?? 0,
      quarantined: data.quarantined ?? 0,
      andonEvents: data.andonEvents ?? 0,
      status: data.status ?? 'yellow',
    };
  } catch (err) {
    return {
      peerId: peer.id,
      domain,
      ebletsWritten: 0,
      quarantined: 0,
      andonEvents: 0,
      status: 'red',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── MIC Orchestrator ─────────────────────────────────────────────────────────

export async function runMicPlow(
  payload: MicStartPayload,
  selfId: string,
  questionBanks: Record<string, string[]>,
  onProgress: (event: MicStatusEvent) => void,
  cancelToken: { cancelled: boolean },
  runSelfDomain: (domain: string, questions: string[]) => Promise<PeerPlowResult>,
): Promise<MicAggregatedResult> {
  const workloadId = generateWorkloadId();

  onProgress({ type: 'mic-start', workloadId, message: 'MIC: discovering Constellation peers…' });

  // 1. Discover peers
  const peers = await discoverPeers();
  const onlinePeers = peers.filter((p) => p.online);

  onProgress({
    type: 'peer-discovered',
    workloadId,
    message: `MIC: ${onlinePeers.length} online peers discovered`,
  });

  // 2. Partition domains
  const units = partitionWorkload(payload.domains, questionBanks, peers, selfId);
  const estimatedMs = estimateWallClockMs(units, peers, selfId);

  const workload: MicWorkload = {
    id: workloadId,
    micId: selfId,
    domains: units,
    peers,
    selfId,
    startTime: Date.now(),
    totalEblets: 0,
    status: 'dispatching',
    estimatedWallClockMs: estimatedMs,
  };

  onProgress({ type: 'workload-partitioned', workloadId, workload });

  // 3. Dispatch in parallel — self + peers
  const selfUnits = units.filter((u) => u.assignedTo === selfId);
  const peerUnits = units.filter((u) => u.assignedTo !== selfId);

  const selfResultPromises = selfUnits.map(async (unit) => {
    if (cancelToken.cancelled) return null;
    onProgress({ type: 'self-progress', workloadId, domain: unit.domain, message: `Running ${unit.domain} locally…` });
    return runSelfDomain(unit.domain, unit.questions);
  });

  const peerResultPromises = peerUnits.map(async (unit) => {
    if (cancelToken.cancelled) return null;
    const peer = peers.find((p) => p.id === unit.assignedTo);
    if (!peer) {
      // Peer vanished — fall back to self
      onProgress({ type: 'peer-failed', workloadId, peerId: unit.assignedTo ?? '?', domain: unit.domain, message: `Peer ${unit.assignedTo} not found — reassigning to self` });
      return runSelfDomain(unit.domain, unit.questions);
    }
    onProgress({ type: 'dispatch-sent', workloadId, peerId: peer.id, domain: unit.domain, message: `Dispatching ${unit.domain} to ${peer.name}…` });
    const result = await dispatchDomainToPeer(peer, unit.domain, unit.questions, payload);
    if (result.status === 'red' && result.error) {
      // Failure recovery: reassign to self
      onProgress({ type: 'peer-failed', workloadId, peerId: peer.id, domain: unit.domain, message: `${peer.name} failed for ${unit.domain}: ${result.error} — running locally as fallback` });
      return runSelfDomain(unit.domain, unit.questions);
    }
    onProgress({ type: 'peer-complete', workloadId, peerId: peer.id, domain: unit.domain });
    return result;
  });

  const allResults = await Promise.all([...selfResultPromises, ...peerResultPromises]);
  const validResults = allResults.filter((r): r is PeerPlowResult => r !== null);

  const selfResults = validResults.filter((r) => r.peerId === selfId);
  const peerResults = validResults.filter((r) => r.peerId !== selfId);

  const totalEbletsWritten = validResults.reduce((s, r) => s + r.ebletsWritten, 0);
  const totalQuarantined = validResults.reduce((s, r) => s + r.quarantined, 0);
  const totalAndonEvents = validResults.reduce((s, r) => s + r.andonEvents, 0);

  const overallStatus: MicAggregatedResult['overallStatus'] =
    totalEbletsWritten >= 5 ? 'GREEN' : totalEbletsWritten > 0 ? 'YELLOW' : 'RED';

  const aggregated: MicAggregatedResult = {
    workloadId,
    totalEbletsWritten,
    totalQuarantined,
    totalAndonEvents,
    peerResults,
    selfResults,
    overallStatus,
    completedAt: Date.now(),
  };

  onProgress({ type: 'complete', workloadId, result: aggregated });
  return aggregated;
}
