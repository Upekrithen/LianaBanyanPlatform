/**
 * TRUST MATCH CYCLE DETECTOR — Phase E countermeasure (K501)
 * ============================================================
 * Closes attack vector B.2 (Trilateral Ring) from Pawn red-team B119.
 *
 * Detects closed cycles of length 3–5 in the Trust Match bond graph.
 * Cycles ≥ 6 are NOT flagged (architectural constraint: longer rings are
 * statistically less likely to be coordinated).
 *
 * Uses iterative DFS for cycle detection. For pre-launch scale (< 100 bonds)
 * a full recompute is fine; see inline note for future incremental strategy.
 *
 * All detected cycles go to trust_match_cycles_audit for curator review.
 * NO automatic consequences — curator must decide verdict.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrustMatchBond {
  id: string;             // trust match bond UUID
  member_a_id: string;
  member_b_id: string;
  stake_marks: number;    // marks staked in this bond
}

export interface DetectedCycle {
  member_ids: string[];   // ordered cycle, e.g. [A, B, C] (A→B→C→A)
  trust_match_ids: string[];
  cycle_length: number;
  total_stake_marks: number;
}

export interface TrustMatchCycleAuditRow {
  id: string;
  cycle_member_ids: string[];
  cycle_trust_match_ids: string[];
  cycle_length: number;
  total_stake_marks: number;
  first_detected_at: string;
  last_seen_at: string;
  curator_verdict: CycleCuratorVerdict;
  curator_member_id: string | null;
  curator_reviewed_at: string | null;
  curator_notes: string | null;
  consequences_applied: boolean;
  created_at: string;
}

export type CycleCuratorVerdict =
  | "pending"
  | "legitimate_collaboration"
  | "under_investigation"
  | "coordinated_ring";

export interface CycleDetectorDB {
  getAllActiveBonds(): Promise<TrustMatchBond[]>;
  getExistingCycles(): Promise<TrustMatchCycleAuditRow[]>;
  insertCycle(cycle: Omit<TrustMatchCycleAuditRow, "id" | "created_at">): Promise<TrustMatchCycleAuditRow>;
  updateCycleLastSeen(cycleId: string, lastSeenAt: Date): Promise<void>;
  getCyclesByCuratorVerdict(verdict: CycleCuratorVerdict): Promise<TrustMatchCycleAuditRow[]>;
  updateCycleVerdict(
    cycleId: string,
    verdict: CycleCuratorVerdict,
    curatorMemberId: string,
    notes: string | null,
    now: Date,
  ): Promise<TrustMatchCycleAuditRow>;
  applyCoordinatedRingConsequences(cycleId: string): Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MIN_CYCLE_LENGTH = 3;
export const MAX_CYCLE_LENGTH = 5;

// ── Graph building ─────────────────────────────────────────────────────────────

interface Graph {
  adjacency: Map<string, Map<string, string>>;  // member_id → (neighbor_id → bond_id)
  bondStake: Map<string, number>;               // bond_id → stake_marks
}

function buildGraph(bonds: TrustMatchBond[]): Graph {
  const adjacency = new Map<string, Map<string, string>>();
  const bondStake = new Map<string, number>();

  for (const bond of bonds) {
    if (!adjacency.has(bond.member_a_id)) adjacency.set(bond.member_a_id, new Map());
    if (!adjacency.has(bond.member_b_id)) adjacency.set(bond.member_b_id, new Map());

    // Trust Match bonds are bidirectional in the graph
    adjacency.get(bond.member_a_id)!.set(bond.member_b_id, bond.id);
    adjacency.get(bond.member_b_id)!.set(bond.member_a_id, bond.id);
    bondStake.set(bond.id, bond.stake_marks);
  }

  return { adjacency, bondStake };
}

// ── Cycle detection (iterative DFS) ───────────────────────────────────────────

/**
 * Find all simple cycles of length MIN_CYCLE_LENGTH to MAX_CYCLE_LENGTH.
 *
 * Algorithm: for each node as start, DFS up to MAX_CYCLE_LENGTH depth.
 * If we can return to the start node in exactly [min, max] steps, record the cycle.
 * Canonical form (smallest member_id first, then lexicographic rotation) deduplicates.
 */
export function detectCycles(bonds: TrustMatchBond[]): DetectedCycle[] {
  const graph = buildGraph(bonds);
  const nodes = Array.from(graph.adjacency.keys());
  const found = new Map<string, DetectedCycle>();

  function dfs(
    start: string,
    current: string,
    path: string[],
    bondPath: string[],
    depth: number,
  ): void {
    if (depth > MAX_CYCLE_LENGTH) return;

    const neighbors = graph.adjacency.get(current);
    if (!neighbors) return;

    for (const [neighbor, bondId] of neighbors.entries()) {
      if (neighbor === start && depth >= MIN_CYCLE_LENGTH) {
        // Found a cycle
        const cycle = [...path];
        const cycleBonds = [...bondPath, bondId];
        const canonical = canonicalize(cycle);
        if (!found.has(canonical)) {
          const totalStake = cycleBonds.reduce(
            (sum, bid) => sum + (graph.bondStake.get(bid) ?? 0),
            0,
          );
          found.set(canonical, {
            member_ids: cycle,
            trust_match_ids: cycleBonds,
            cycle_length: cycle.length,
            total_stake_marks: totalStake,
          });
        }
      } else if (!path.includes(neighbor) && depth + 1 <= MAX_CYCLE_LENGTH) {
        dfs(start, neighbor, [...path, neighbor], [...bondPath, bondId], depth + 1);
      }
    }
  }

  for (const node of nodes) {
    dfs(node, node, [node], [], 1);
  }

  return Array.from(found.values());
}

/**
 * Canonical form for an undirected cycle.
 * Rotates so smallest member_id is first, then picks the lexicographically
 * smaller of the two traversal directions. This ensures A→B→C→A and
 * A→C→B→A (same ring, opposite directions) produce the same key.
 */
function canonicalize(cycle: string[]): string {
  const minIdx = cycle.reduce(
    (minI, val, i) => (val < cycle[minI] ? i : minI),
    0,
  );
  const forward = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx)];
  // Reverse direction: reverse the non-start elements, then rotate to start at min
  const reversed = [forward[0], ...forward.slice(1).reverse()];

  const fwdKey = forward.join("|");
  const revKey = reversed.join("|");
  return fwdKey <= revKey ? fwdKey : revKey;
}

// ── Daily audit job ───────────────────────────────────────────────────────────

/**
 * Run the daily cycle audit. Detects all cycles; inserts new ones, updates last_seen
 * on existing ones. Returns counts for monitoring.
 */
export async function runDailyCycleAudit(
  db: CycleDetectorDB,
  now = new Date(),
): Promise<{
  newCycles: number;
  updatedCycles: number;
  totalCyclesInAuditTable: number;
}> {
  const bonds = await db.getAllActiveBonds();
  const detected = detectCycles(bonds);
  const existing = await db.getExistingCycles();

  // Build canonical key map for existing cycles
  const existingKeys = new Map<string, TrustMatchCycleAuditRow>();
  for (const row of existing) {
    existingKeys.set(canonicalize(row.cycle_member_ids), row);
  }

  let newCycles = 0;
  let updatedCycles = 0;

  for (const cycle of detected) {
    const key = canonicalize(cycle.member_ids);
    const existingRow = existingKeys.get(key);

    if (existingRow) {
      // Already known — update last_seen
      await db.updateCycleLastSeen(existingRow.id, now);
      updatedCycles++;
    } else {
      // New cycle — insert and flag for curator review
      await db.insertCycle({
        cycle_member_ids: cycle.member_ids,
        cycle_trust_match_ids: cycle.trust_match_ids,
        cycle_length: cycle.cycle_length,
        total_stake_marks: cycle.total_stake_marks,
        first_detected_at: now.toISOString(),
        last_seen_at: now.toISOString(),
        curator_verdict: "pending",
        curator_member_id: null,
        curator_reviewed_at: null,
        curator_notes: null,
        consequences_applied: false,
      });
      newCycles++;
    }
  }

  return {
    newCycles,
    updatedCycles,
    totalCyclesInAuditTable: existing.length + newCycles,
  };
}

// ── Curator verdict application ───────────────────────────────────────────────

/**
 * Apply a curator verdict to a detected cycle.
 *
 * "coordinated_ring" consequence (staged — requires Founder confirmation before
 * consequences_applied is set):
 *   - Each member's Trust Match Seasoning age reduced 30 days
 *   - Refunded stakes go to global sponsor pool
 *   - GSR review on all members
 *
 * "legitimate_collaboration" — cycle is excluded from future runs (no re-flagging).
 * "under_investigation" — continued monitoring, no immediate consequences.
 */
export async function applyCycleVerdict(
  db: CycleDetectorDB,
  cycleId: string,
  verdict: Exclude<CycleCuratorVerdict, "pending">,
  curatorMemberId: string,
  notes: string | null,
  now = new Date(),
): Promise<TrustMatchCycleAuditRow> {
  const updated = await db.updateCycleVerdict(cycleId, verdict, curatorMemberId, notes, now);

  if (verdict === "coordinated_ring") {
    // Consequences staged — must be confirmed by Founder before applying.
    // The applyCoordinatedRingConsequences call is intentionally NOT here.
    // It is invoked separately after Founder sign-off.
  }

  return updated;
}
