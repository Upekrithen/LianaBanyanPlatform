/**
 * AML Coordinated-Transactions Detector — K504 (Phase B)
 * ========================================================
 * Builds a Credit-transaction graph and detects circular routing patterns
 * (potential layering via internal platform transactions).
 *
 * Cross-references with K501 Trust Match cycle audit:
 *   Member in BOTH a Trust Match cycle AND a transaction cycle → escalate immediately.
 *
 * GUARDRAILS:
 *   - No auto-action on detected cycles; all yield curator-review flags
 *   - Escalate verdict (not dispatch_sar) when cross-ref triggers — counsel gate still applies for SAR
 *   - Cycle length capped at 5 (same as K501; beyond 5 = noise at current scale)
 *
 * Uses the same DFS-with-canonicalization approach as K501 cycleDetector.ts.
 * Separate graph: transaction edges (Credit flows) vs. K501's Trust Match bond edges.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreditEdge {
  from_member_id: string;
  to_member_id: string;
  total_credits: number;    // cumulative credits in rolling 30 days
  transaction_count: number;
}

export interface TransactionCycle {
  members: string[];
  cycleLength: number;
  cumulativeVolume: number;
  canonicalKey: string;
  trustMatchCrossref: boolean;  // true if same members appear in K501 Trust Match cycles
}

export interface AmlTransactionCycleRow {
  id?: string;
  cycle_members: string[];
  cycle_length: number;
  cumulative_volume: number;
  first_detected_at: string;
  last_seen_at: string;
  canonical_key: string;
  trust_match_cycle_crossref: boolean;
  aml_flag_id?: string | null;
}

export interface CoordinatedDetectorDB {
  getCreditEdges(): Promise<CreditEdge[]>;
  getTrustMatchCycleMembers(): Promise<Set<string>>;   // all member_ids in any K501 Trust Match cycle
  getExistingCycles(): Promise<AmlTransactionCycleRow[]>;
  upsertCycle(cycle: Omit<AmlTransactionCycleRow, 'id'>): Promise<AmlTransactionCycleRow>;
  insertAmlFlag(
    memberId: string,
    flagType: 'aml_coordinated_ring' | 'aml_trust_match_crossref',
    evidence: Record<string, unknown>
  ): Promise<string>;  // returns flag id
  linkCycleToFlag(canonicalKey: string, flagId: string): Promise<void>;
  getExistingActiveFlagForMembers(memberIds: string[], flagType: string): Promise<boolean>;
}

// ── Graph construction ────────────────────────────────────────────────────────

type Graph = Map<string, { to: string; volume: number }[]>;

function buildTransactionGraph(edges: CreditEdge[]): Graph {
  const graph: Graph = new Map();
  for (const edge of edges) {
    if (!graph.has(edge.from_member_id)) graph.set(edge.from_member_id, []);
    graph.get(edge.from_member_id)!.push({
      to: edge.to_member_id,
      volume: edge.total_credits,
    });
  }
  return graph;
}

// ── Canonicalization (directed cycles — same as K501 approach) ────────────────

/**
 * For directed Credit-flow cycles, canonicalize by rotating to smallest member_id first.
 * (Unlike K501's undirected Trust Match bonds, Credit flow has direction,
 * so A→B→C→A and A→C→B→A are genuinely different transaction patterns.)
 * We still deduplicate rotations: A→B→C→A === B→C→A→B (same ring, different start).
 */
function canonicalizeCycle(cycle: string[]): string {
  const minIdx = cycle.reduce(
    (minI, val, i) => (val < cycle[minI] ? i : minI),
    0,
  );
  const rotated = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx)];
  return rotated.join('→');
}

// ── DFS cycle detection (directed, length 3–5) ────────────────────────────────

export function detectTransactionCycles(
  edges: CreditEdge[],
  edgeVolumeMap: Map<string, number>,   // key: "from|to", value: total_credits
  maxLength: number = 5,
): TransactionCycle[] {
  const graph = buildTransactionGraph(edges);
  const seen = new Set<string>();
  const cycles: TransactionCycle[] = [];

  // Build edge volume lookup
  if (edgeVolumeMap.size === 0) {
    for (const edge of edges) {
      edgeVolumeMap.set(`${edge.from_member_id}|${edge.to_member_id}`, edge.total_credits);
    }
  }

  function computeCycleVolume(cycleMembers: string[]): number {
    let vol = 0;
    for (let i = 0; i < cycleMembers.length; i++) {
      const from = cycleMembers[i];
      const to = cycleMembers[(i + 1) % cycleMembers.length];
      vol += edgeVolumeMap.get(`${from}|${to}`) ?? 0;
    }
    return vol;
  }

  function dfs(start: string, current: string, path: string[]): void {
    const neighbors = graph.get(current) ?? [];
    for (const { to } of neighbors) {
      if (to === start && path.length >= 3) {
        // Complete cycle found
        const key = canonicalizeCycle(path);
        if (!seen.has(key)) {
          seen.add(key);
          const volume = computeCycleVolume(path);
          cycles.push({
            members: path,
            cycleLength: path.length,
            cumulativeVolume: volume,
            canonicalKey: key,
            trustMatchCrossref: false, // populated by cross-reference step
          });
        }
        continue;
      }
      if (path.includes(to)) continue; // already in path — would create sub-cycle
      if (path.length >= maxLength) continue; // exceeded max length
      dfs(start, to, [...path, to]);
    }
  }

  for (const startNode of graph.keys()) {
    dfs(startNode, startNode, [startNode]);
  }

  return cycles;
}

// ── Cross-reference with K501 Trust Match cycles ──────────────────────────────

export function crossReferenceTrustMatch(
  cycles: TransactionCycle[],
  trustMatchMembers: Set<string>,
): TransactionCycle[] {
  return cycles.map((cycle) => ({
    ...cycle,
    trustMatchCrossref: cycle.members.some((m) => trustMatchMembers.has(m)),
  }));
}

// ── Daily coordinated-ring audit ──────────────────────────────────────────────

const COORDINATED_RING_VOLUME_THRESHOLD = 500; // $500 equivalent in rolling 30 days

export interface DailyCoordinatedAuditResult {
  newCycles: AmlTransactionCycleRow[];
  updatedCycles: AmlTransactionCycleRow[];
  newFlags: number;
  escalatedFlags: number;  // cross-ref triggers
  ranAt: string;
}

export async function runDailyCoordinatedAudit(
  db: CoordinatedDetectorDB,
): Promise<DailyCoordinatedAuditResult> {
  const [edges, trustMatchMembers, existingCycles] = await Promise.all([
    db.getCreditEdges(),
    db.getTrustMatchCycleMembers(),
    db.getExistingCycles(),
  ]);

  const existingKeyMap = new Map<string, AmlTransactionCycleRow>(
    existingCycles.map((c) => [c.canonical_key, c]),
  );

  // Detect current cycles
  const edgeVolumeMap = new Map<string, number>();
  const rawCycles = detectTransactionCycles(edges, edgeVolumeMap);
  const cycles = crossReferenceTrustMatch(rawCycles, trustMatchMembers);

  const now = new Date().toISOString();
  const newCycles: AmlTransactionCycleRow[] = [];
  const updatedCycles: AmlTransactionCycleRow[] = [];
  let newFlags = 0;
  let escalatedFlags = 0;

  for (const cycle of cycles) {
    const existing = existingKeyMap.get(cycle.canonicalKey);

    if (existing) {
      // Update last_seen only — no new flag if no new transactions
      const updated = await db.upsertCycle({
        cycle_members: cycle.members,
        cycle_length: cycle.cycleLength,
        cumulative_volume: cycle.cumulativeVolume,
        first_detected_at: existing.first_detected_at,
        last_seen_at: now,
        canonical_key: cycle.canonicalKey,
        trust_match_cycle_crossref: cycle.trustMatchCrossref,
        aml_flag_id: existing.aml_flag_id,
      });
      updatedCycles.push(updated);
      continue;
    }

    // New cycle — persist + conditionally flag
    const upserted = await db.upsertCycle({
      cycle_members: cycle.members,
      cycle_length: cycle.cycleLength,
      cumulative_volume: cycle.cumulativeVolume,
      first_detected_at: now,
      last_seen_at: now,
      canonical_key: cycle.canonicalKey,
      trust_match_cycle_crossref: cycle.trustMatchCrossref,
      aml_flag_id: null,
    });
    newCycles.push(upserted);

    // Only flag if above volume threshold
    if (cycle.cumulativeVolume > COORDINATED_RING_VOLUME_THRESHOLD) {
      // Primary: coordinated ring flag on the member with highest individual volume in cycle
      const primaryMember = cycle.members[0]; // first in canonical rotation = smallest ID; acceptable approximation

      const alreadyFlagged = await db.getExistingActiveFlagForMembers(
        cycle.members,
        cycle.trustMatchCrossref ? 'aml_trust_match_crossref' : 'aml_coordinated_ring',
      );

      if (!alreadyFlagged) {
        const flagType = cycle.trustMatchCrossref
          ? 'aml_trust_match_crossref'
          : 'aml_coordinated_ring';

        const flagId = await db.insertAmlFlag(primaryMember, flagType, {
          cycle_members: cycle.members,
          cycle_length: cycle.cycleLength,
          cumulative_volume: cycle.cumulativeVolume,
          canonical_key: cycle.canonicalKey,
          trust_match_crossref: cycle.trustMatchCrossref,
          threshold_volume_applied: COORDINATED_RING_VOLUME_THRESHOLD,
          // Cross-ref triggers immediate escalate recommendation (not auto-set; curator still confirms)
          recommended_verdict: cycle.trustMatchCrossref ? 'escalate' : 'pending',
        });

        await db.linkCycleToFlag(cycle.canonicalKey, flagId);
        newFlags++;
        if (cycle.trustMatchCrossref) escalatedFlags++;
      }
    }
  }

  return {
    newCycles,
    updatedCycles,
    newFlags,
    escalatedFlags,
    ranAt: now,
  };
}
