import { PeerNode } from './types.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env');
}

export async function getActivePeers(minPeers = 2): Promise<PeerNode[]> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const response = await fetch(
    // A1 recon: no "status" column in peer_presence — TTL gate IS last_seen_at >= now()-5min
    `${SUPABASE_URL}/rest/v1/peer_presence?last_seen_at=gte.${fiveMinAgo}&select=peer_id,last_seen_at,capabilities`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`peer_presence query failed: ${response.status} ${response.statusText}`);
  }

  const rows = await response.json() as Array<{peer_id: string; last_seen_at: string; capabilities?: Record<string, unknown>}>;

  if (rows.length < minPeers) {
    throw new Error(
      `GATE FAIL: only ${rows.length} active peers, need ${minPeers}. ` +
      `Power on machines + launch MnemosyneC on each.`
    );
  }

  return rows.map((row, i) => ({
    node_id: row.peer_id,
    machine_label: `M${i}`,
    last_seen: row.last_seen_at,
    status: 'active' as const,
    metadata: row.capabilities
  }));
}

export async function getPeerCount(): Promise<number> {
  try {
    const peers = await getActivePeers(0);
    return peers.length;
  } catch {
    return 0;
  }
}
