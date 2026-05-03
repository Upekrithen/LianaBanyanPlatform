/**
 * Old Ones Multi-Zippleback Fleet — Phase C: Cthulhu Conflict Arbitration
 * =========================================================================
 * Bushel 29 / BP021 — old_ones_conflict.ts
 *
 * Cthulhu enforces:
 *   - Dependency ordering: Old One waits until its dependency is in awaiting_authority
 *   - Conflict detection: concurrent file-modification conflicts serialized
 *   - FleetHeartbeat monitoring for fleet-wide state visibility
 *   - Authority-grant ordering: Cthulhu recommends which Old Ones to authorize first
 *
 * G6 validation: Cthulhu detects concurrent file-modification conflict + serializes;
 * dependency-ordering delays honored.
 *
 * Composes with:
 *   old_ones_fleet.ts    — OldOneDescriptor, LoopState, FleetHeartbeat
 *   old_ones_loop.ts     — FixRecommendation (for conflict detection)
 *   ../scribes/pheromone.ts — Pheromone emission
 */

import { existsSync, appendFileSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { emitPheromone } from "../scribes/pheromone.js";
import {
  OldOneDescriptor,
  OldOneName,
  LoopState,
  FleetHeartbeat,
  HEXISLE_INNOVATION_GAPS,
  loadFleetHeartbeats,
} from "./old_ones_fleet.js";
import type { FixRecommendation } from "./old_ones_loop.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_conflict = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_conflict, "../../stitchpunks");
const OLD_ONES_DIR = resolve(STITCHPUNKS_DIR, "old_ones_fleet");
const ARBITRATION_LOG = resolve(OLD_ONES_DIR, "cthulhu_arbitration.jsonl");
const AUTHORITY_QUEUE_FILE = resolve(OLD_ONES_DIR, "authority_queue.json");

function ensureDir(): void {
  if (!existsSync(OLD_ONES_DIR)) mkdirSync(OLD_ONES_DIR, { recursive: true });
}

// ─── Conflict types ───────────────────────────────────────────────────────────

export type ConflictType =
  | "concurrent_file_modification"
  | "dependency_ordering"
  | "authority_collision"
  | "fleet_stall";

export interface ConflictEvent {
  event_id: string;
  conflict_type: ConflictType;
  old_ones_involved: OldOneName[];
  contested_resource: string;  // file path or innovation ID
  resolution: "serialized" | "deferred" | "rejected" | "resolved";
  serialized_order?: OldOneName[];  // for serialized conflicts: which fires first
  deferred_until?: string;   // for deferred: condition that unblocks
  ts: string;
}

export interface ArbitrationDecision {
  fleet_id: string;
  recommended_authority_order: OldOneName[];  // Cthulhu's recommended grant order
  blocked_old_ones: Record<OldOneName, string>; // who is blocked + why
  conflict_events: ConflictEvent[];
  dependency_violations: string[];            // Old Ones requesting authority out of order
  ts: string;
}

export interface AuthorityQueueEntry {
  old_one_name: OldOneName;
  innovation_id: string;
  dependency_met: boolean;
  blocked_by: string[];         // Old One names that must complete first
  priority_rank: number;        // lower = higher priority (0 = critical/MISS with no deps)
  queued_ts: string;
}

// ─── Dependency resolution ────────────────────────────────────────────────────

/**
 * Load the dependency map from old_ones_loop (re-declared here to avoid circular).
 * Maps innovationId → list of innovationIds that must be in awaiting_authority first.
 */
const DEPENDENCY_MAP: Record<string, string[]> = {
  "MISS-001": [],                        "MISS-002": [],
  "MISS-003": ["MISS-015", "STUB-001"],  "MISS-004": [],
  "MISS-005": ["MISS-001"],              "MISS-006": ["MISS-002"],
  "MISS-007": ["MISS-001"],              "MISS-008": ["MISS-007"],
  "MISS-009": [],                        "MISS-010": ["MISS-009"],
  "MISS-011": ["MISS-008", "MISS-009"],  "MISS-012": ["MISS-009"],
  "MISS-013": ["MISS-006", "MISS-012"],  "MISS-014": [],
  "MISS-015": ["MISS-002"],              "STUB-001": ["MISS-002", "MISS-015"],
  "STUB-002": [],                        "STUB-003": ["MISS-002"],
  "STUB-004": ["MISS-003"],             "STUB-005": [],
  "STUB-006": [],                        "STUB-007": ["MISS-001"],
};

/** Build a reverse map: innovationId → which innovations depend on it */
function buildDependentMap(): Record<string, string[]> {
  const reverse: Record<string, string[]> = {};
  for (const [id, deps] of Object.entries(DEPENDENCY_MAP)) {
    for (const dep of deps) {
      if (!reverse[dep]) reverse[dep] = [];
      reverse[dep].push(id);
    }
  }
  return reverse;
}

/**
 * Check if an Old One's current_target's dependencies are met.
 * A dependency is "met" when the responsible Old One is in
 * awaiting_authority, fixing, or complete state.
 */
export function areDependenciesMet(
  innovationId: string,
  workers: OldOneDescriptor[],
  assignmentMap: Record<string, OldOneName>
): { met: boolean; blocking_old_ones: OldOneName[] } {
  const deps = DEPENDENCY_MAP[innovationId] ?? [];
  const blockingOldOnes: OldOneName[] = [];

  for (const depId of deps) {
    const depOwner = assignmentMap[depId];
    if (!depOwner) continue;

    const depWorker = workers.find((w) => w.name === depOwner);
    if (!depWorker) continue;

    const depState = depWorker.loop_state;
    const stateMet = ["awaiting_authority", "fixing", "complete"].includes(depState);

    // Also check if the dep worker's current target matches or has passed depId
    const depProgress = depWorker.innovations_assigned.indexOf(depId);
    const depCurrent = depWorker.current_target
      ? depWorker.innovations_assigned.indexOf(depWorker.current_target)
      : -1;

    const progressMet = depProgress < depCurrent || stateMet;

    if (!progressMet && !stateMet) {
      blockingOldOnes.push(depOwner);
    }
  }

  return { met: blockingOldOnes.length === 0, blocking_old_ones: blockingOldOnes };
}

// ─── Conflict detection ───────────────────────────────────────────────────────

/**
 * Detect concurrent file-modification conflicts.
 * Two Old Ones conflict if their recommendations target the same file.
 * Returns pairs of conflicting Old Ones + contested file.
 */
export function detectFileConflicts(
  recommendations: Map<OldOneName, FixRecommendation>
): ConflictEvent[] {
  const fileOwners: Record<string, OldOneName[]> = {};

  for (const [oldOneName, rec] of recommendations) {
    const allFiles = [...rec.files_to_create, ...rec.files_to_modify];
    for (const file of allFiles) {
      if (!fileOwners[file]) fileOwners[file] = [];
      fileOwners[file].push(oldOneName);
    }
  }

  const conflicts: ConflictEvent[] = [];
  for (const [file, owners] of Object.entries(fileOwners)) {
    if (owners.length > 1) {
      // Serialize: lower alphabetical name goes first (deterministic)
      const serializedOrder = [...owners].sort();
      const eventId = `LB-CONFLICT-${Date.now()}-${file.replace(/\//g, "-").slice(-20)}`;

      const conflict: ConflictEvent = {
        event_id: eventId,
        conflict_type: "concurrent_file_modification",
        old_ones_involved: owners as OldOneName[],
        contested_resource: file,
        resolution: "serialized",
        serialized_order: serializedOrder as OldOneName[],
        ts: new Date().toISOString(),
      };
      conflicts.push(conflict);
    }
  }

  return conflicts;
}

// ─── Authority queue management ───────────────────────────────────────────────

const PRIORITY_RANK: Record<string, number> = {
  "critical": 0, "core": 1, "standard": 2
};

/**
 * Build the authority queue — ordered list of Old Ones ready for authority grant.
 * Ordering: (1) dependencies met, (2) critical innovations first, (3) no file conflicts.
 */
export function buildAuthorityQueue(
  workers: OldOneDescriptor[],
  assignmentMap: Record<string, OldOneName>,
  pendingConflicts: ConflictEvent[]
): AuthorityQueueEntry[] {
  const conflictBlocked = new Set<OldOneName>();
  for (const conflict of pendingConflicts) {
    if (conflict.resolution === "serialized" && conflict.serialized_order) {
      // All except the first in serialized order are blocked
      conflict.serialized_order.slice(1).forEach((name) => conflictBlocked.add(name));
    }
  }

  const queue: AuthorityQueueEntry[] = [];
  const now = new Date().toISOString();

  for (const worker of workers) {
    if (worker.role !== "worker") continue;
    if (worker.loop_state !== "awaiting_authority") continue;
    if (!worker.current_target) continue;

    const innovationId = worker.current_target;
    const gap = HEXISLE_INNOVATION_GAPS.find((g) => g.id === innovationId);
    const deps = areDependenciesMet(innovationId, workers, assignmentMap);
    const isConflictBlocked = conflictBlocked.has(worker.name);

    const blockedBy: string[] = [
      ...deps.blocking_old_ones,
      ...(isConflictBlocked ? ["file-conflict-serialization"] : []),
    ];

    queue.push({
      old_one_name: worker.name,
      innovation_id: innovationId,
      dependency_met: deps.met && !isConflictBlocked,
      blocked_by: blockedBy,
      priority_rank: PRIORITY_RANK[gap?.priority ?? "standard"],
      queued_ts: now,
    });
  }

  // Sort: dependency_met first, then by priority_rank
  queue.sort((a, b) => {
    if (a.dependency_met && !b.dependency_met) return -1;
    if (!a.dependency_met && b.dependency_met) return 1;
    return a.priority_rank - b.priority_rank;
  });

  return queue;
}

// ─── Full arbitration pass ────────────────────────────────────────────────────

/**
 * Cthulhu's arbitration pass — called after each Old One completes recommend().
 * Returns an ArbitrationDecision with recommended authority order + blocked Old Ones.
 *
 * G6: This function is the "Cthulhu detects concurrent file-modification conflict
 * and serializes; dependency-ordering delays honored" gate.
 */
export function runCthulhuArbitration(
  fleetId: string,
  workers: OldOneDescriptor[],
  assignmentMap: Record<string, OldOneName>,
  recommendations: Map<OldOneName, FixRecommendation>
): ArbitrationDecision {
  ensureDir();

  // Step 1: Detect file conflicts
  const conflictEvents = detectFileConflicts(recommendations);

  // Step 2: Check dependency violations
  const dependencyViolations: string[] = [];
  for (const worker of workers) {
    if (!worker.current_target) continue;
    const deps = areDependenciesMet(worker.current_target, workers, assignmentMap);
    if (!deps.met && worker.loop_state === "awaiting_authority") {
      dependencyViolations.push(
        `${worker.name} (${worker.current_target}) is awaiting_authority but ` +
        `deps [${deps.blocking_old_ones.join(", ")}] not yet ready`
      );
    }
  }

  // Step 3: Build authority queue
  const authQueue = buildAuthorityQueue(workers, assignmentMap, conflictEvents);
  const recommendedOrder = authQueue
    .filter((e) => e.dependency_met)
    .map((e) => e.old_one_name);
  const blocked: Record<string, string> = {};
  for (const entry of authQueue) {
    if (!entry.dependency_met) {
      blocked[entry.old_one_name] =
        `blocked_by: [${entry.blocked_by.join(", ")}] (${entry.innovation_id})`;
    }
  }

  const decision: ArbitrationDecision = {
    fleet_id: fleetId,
    recommended_authority_order: recommendedOrder,
    blocked_old_ones: blocked as Record<OldOneName, string>,
    conflict_events: conflictEvents,
    dependency_violations: dependencyViolations,
    ts: new Date().toISOString(),
  };

  // Log arbitration decision
  appendFileSync(ARBITRATION_LOG, JSON.stringify(decision) + "\n", "utf-8");

  // Persist authority queue for Founder review
  writeFileSync(AUTHORITY_QUEUE_FILE, JSON.stringify(authQueue, null, 2), "utf-8");

  // Emit Pheromone
  emitPheromone(
    "CthulhuArbitration",
    `cthulhu-arbitration-${fleetId}-${Date.now()}`,
    `cthulhu arbitration fleet ${fleetId} recommended-order ${recommendedOrder.join("-")} ` +
    `blocked ${Object.keys(blocked).length} conflict-events ${conflictEvents.length} ` +
    `dependency-violations ${dependencyViolations.length} hexisle-game bushel-29 ` +
    `fleet-coordination authority-queue`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "governance", audience: "knight-build" },
      synthesisClass: "cthulhu_arbitration_receipt",
    }
  );

  return decision;
}

// ─── Dependency ordering enforcement ─────────────────────────────────────────

/**
 * Enforce dependency ordering: if Dagon's dependency includes innovation_3,
 * and Shub owns innovation_3, Dagon waits until Shub.loop_state === awaiting_authority.
 *
 * Returns the set of Old Ones that are cleared to request authority + those blocked.
 */
export function enforceOrderingGates(
  workers: OldOneDescriptor[],
  assignmentMap: Record<string, OldOneName>
): {
  cleared: OldOneName[];
  deferred: Record<OldOneName, { waiting_for: OldOneName; until_state: LoopState }>;
} {
  const cleared: OldOneName[] = [];
  const deferred: Record<string, { waiting_for: OldOneName; until_state: LoopState }> = {};

  for (const worker of workers) {
    if (worker.role !== "worker") continue;
    if (!worker.current_target) continue;

    const deps = areDependenciesMet(worker.current_target, workers, assignmentMap);

    if (deps.met) {
      cleared.push(worker.name);
    } else {
      deferred[worker.name] = {
        waiting_for: deps.blocking_old_ones[0],
        until_state: "awaiting_authority",
      };

      // Emit deferred Pheromone
      emitPheromone(
        "DependencyDeferred",
        `dep-deferred-${worker.name}-${worker.current_target}-${Date.now()}`,
        `old-one ${worker.name} deferred waiting-for ${deps.blocking_old_ones[0]} ` +
        `until awaiting_authority innovation ${worker.current_target} ` +
        `dependency-ordering-enforced hexisle-game bushel-29`,
        {
          cathedral: "knight",
          flavorClass: { domain: "bread", cognition: "governance", audience: "knight-build" },
        }
      );
    }
  }

  return {
    cleared,
    deferred: deferred as Record<OldOneName, { waiting_for: OldOneName; until_state: LoopState }>,
  };
}

// ─── Fleet stall detection ────────────────────────────────────────────────────

/**
 * Detect fleet stall: all workers in awaiting_authority but none cleared by Cthulhu.
 * This indicates a circular dependency (deadlock) in the dependency graph.
 *
 * KrissKross triangle prevents fleet-wide stall: if circular dep detected,
 * Cthulhu breaks the cycle by granting authority to the innovation with most dependents.
 */
export function detectFleetStall(
  workers: OldOneDescriptor[],
  assignmentMap: Record<string, OldOneName>
): { stalled: boolean; cycle_breaker: OldOneName | null; cycle_description: string } {
  const awaitingWorkers = workers.filter(
    (w) => w.role === "worker" && w.loop_state === "awaiting_authority"
  );

  if (awaitingWorkers.length === 0) {
    return { stalled: false, cycle_breaker: null, cycle_description: "" };
  }

  const { cleared } = enforceOrderingGates(workers, assignmentMap);
  if (cleared.length > 0) {
    return { stalled: false, cycle_breaker: null, cycle_description: "" };
  }

  // All awaiting workers are blocked — potential stall
  // Find cycle breaker: innovation with most dependents (breaking it unblocks the most)
  const dependentMap = buildDependentMap();
  let maxDependents = -1;
  let cycleBreaker: OldOneName | null = null;

  for (const worker of awaitingWorkers) {
    if (!worker.current_target) continue;
    const dependentCount = (dependentMap[worker.current_target] ?? []).length;
    if (dependentCount > maxDependents) {
      maxDependents = dependentCount;
      cycleBreaker = worker.name;
    }
  }

  const stallEvent: ConflictEvent = {
    event_id: `LB-STALL-${Date.now()}`,
    conflict_type: "fleet_stall",
    old_ones_involved: awaitingWorkers.map((w) => w.name),
    contested_resource: "dependency_graph",
    resolution: cycleBreaker ? "resolved" : "rejected",
    deferred_until: cycleBreaker
      ? `Cthulhu grants authority to ${cycleBreaker} to break circular dependency`
      : undefined,
    ts: new Date().toISOString(),
  };

  ensureDir();
  appendFileSync(ARBITRATION_LOG, JSON.stringify(stallEvent) + "\n", "utf-8");

  emitPheromone(
    "FleetStallDetected",
    `fleet-stall-${Date.now()}`,
    `cthulhu fleet-stall detected ${awaitingWorkers.length} old-ones blocked ` +
    `cycle-breaker ${cycleBreaker ?? "none"} krisskross-momentum-held ` +
    `hexisle-game bushel-29 fleet-resilience`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "governance", audience: "knight-build" },
    }
  );

  return {
    stalled: true,
    cycle_breaker: cycleBreaker,
    cycle_description:
      `All ${awaitingWorkers.length} workers awaiting authority but no deps met. ` +
      (cycleBreaker
        ? `Cthulhu recommends breaking cycle by authorizing ${cycleBreaker} first.`
        : "No cycle breaker found — manual Founder intervention required."),
  };
}

// ─── Load helpers ─────────────────────────────────────────────────────────────

export function loadArbitrationLog(): ArbitrationDecision[] {
  if (!existsSync(ARBITRATION_LOG)) return [];
  try {
    return readFileSync(ARBITRATION_LOG, "utf-8")
      .split("\n").filter((l) => l.trim())
      .map((l) => JSON.parse(l));
  } catch { return []; }
}

export function loadAuthorityQueue(): AuthorityQueueEntry[] {
  if (!existsSync(AUTHORITY_QUEUE_FILE)) return [];
  try { return JSON.parse(readFileSync(AUTHORITY_QUEUE_FILE, "utf-8")); }
  catch { return []; }
}

// ─── G6 validation helper ─────────────────────────────────────────────────────

/**
 * G6: Verify Cthulhu conflict arbitration is working correctly.
 * Returns validation result suitable for test gate.
 */
export function validateArbitration(decision: ArbitrationDecision): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Each file conflict must have a serialized_order
  for (const conflict of decision.conflict_events) {
    if (
      conflict.conflict_type === "concurrent_file_modification" &&
      conflict.resolution === "serialized" &&
      (!conflict.serialized_order || conflict.serialized_order.length === 0)
    ) {
      errors.push(`G6 FAIL: conflict ${conflict.event_id} serialized but no serialized_order`);
    }
  }

  // Dependency violations must be documented (they trigger deferral, not error)
  // But blocked_old_ones must always explain WHY they are blocked
  for (const [name, reason] of Object.entries(decision.blocked_old_ones)) {
    if (!reason || reason.length < 5) {
      errors.push(`G6 FAIL: ${name} blocked but reason is empty`);
    }
  }

  return { valid: errors.length === 0, errors };
}
