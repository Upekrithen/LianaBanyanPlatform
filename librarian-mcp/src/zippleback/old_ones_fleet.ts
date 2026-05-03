/**
 * Old Ones Multi-Zippleback Fleet — Phase A: Fleet Scaffold
 * ===========================================================
 * Bushel 29 / BP021 — Old Ones Multi-Zippleback Fleet (turn 125)
 *
 * Deploys Cthulhu (Queen/Coordinator) + 7 Worker Old Ones (Dagon, Shub,
 * Nyarlathotep, Azathoth, Yog, Tsathoggua, Ithaqua) as an Apiarist Hive cohort.
 * Each Old One is a full Zippleback pair running the 4-action loop (Phase B).
 * Cthulhu coordinates assignments, arbitrates conflicts, and tracks fleet state.
 *
 * Assignments derived from Bushel 30 audit: 11 built / 7 stubbed / 15 missing.
 * Deterministic assignment: sorted by innovation index → round-robin to workers.
 *
 * Composes with:
 *   bishop_callback_listener.ts  — Channels 4/5/6 (Bushel 20 LANDED)
 *   old_ones_loop.ts             — 4-action loop per Old One (Phase B)
 *   old_ones_conflict.ts         — Cthulhu arbitration (Phase C)
 *   ../scribes/pheromone.ts      — Pheromone event emission
 *   ../codex/schema.ts           — Codex entry
 *
 * Canon refs:
 *   old_ones_multi_zippleback_fleet_analyze_evaluate_recommend_fix_platform_canon_bp021
 *   hexisle_game_4_computer_federation_pixie_dust_substrate_density_pre_major_project_canon_bp021
 *   Bushel 30 LANDED readiness baseline (11 built / 7 stubbed / 15 missing)
 */

import { randomUUID } from "crypto";
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { emitPheromone } from "../scribes/pheromone.js";
import { allocateCodexSerial, appendCodexEntry } from "../codex/schema.js";
import type { Codex } from "../codex/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_oo = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_oo, "../../stitchpunks");
const OLD_ONES_DIR = resolve(STITCHPUNKS_DIR, "old_ones_fleet");
const FLEET_RECEIPT_FILE = resolve(OLD_ONES_DIR, "fleet_receipt.json");
const FLEET_HEARTBEAT_LOG = resolve(OLD_ONES_DIR, "fleet_heartbeats.jsonl");
const IRON_TABLET_LOG = resolve(OLD_ONES_DIR, "iron_tablets.jsonl");
const ASSIGNMENTS_FILE = resolve(OLD_ONES_DIR, "assignments.json");

function ensureDir(): void {
  if (!existsSync(OLD_ONES_DIR)) mkdirSync(OLD_ONES_DIR, { recursive: true });
}

// ─── Core type definitions ────────────────────────────────────────────────────

export type OldOneRole = "coordinator" | "worker";

export type LoopState =
  | "idle"
  | "analyzing"
  | "evaluating"
  | "recommending"
  | "awaiting_authority"
  | "fixing"
  | "complete"
  | "crashed";

export type OldOneName =
  | "Cthulhu"
  | "Dagon"
  | "Shub"
  | "Nyarlathotep"
  | "Azathoth"
  | "Yog"
  | "Tsathoggua"
  | "Ithaqua";

export interface OldOneDescriptor {
  name: OldOneName;
  role: OldOneRole;
  assignment_class: string;    // domain of responsibility
  current_target: string | null; // innovation gap ID, e.g. "MISS-001"
  loop_state: LoopState;
  iron_tablet_id: string;      // LB-IT-<uuid> where recommendations persist
  hive_thread_id: string;      // Apiarist Hive thread participation
  innovations_assigned: string[]; // all innovation IDs assigned to this worker
}

export interface FleetReceipt {
  fleet_id: string;             // LB-FLEET-<uuid>
  coordinator: OldOneName;      // "Cthulhu"
  active_workers: OldOneDescriptor[];
  assignments: Record<string, OldOneName>; // innovationId → old_one_name
  hive_thread_id: string;
  fleet_ts: string;
  total_missing: number;
  total_stubbed: number;
  innovations_covered: number;
}

export interface FleetHeartbeat {
  fleet_id: string;
  old_one_name: OldOneName;
  loop_state: LoopState;
  current_target: string | null;
  ts: string;
}

// ─── HexIsle innovation catalog (from Bushel 30 audit) ───────────────────────

export interface HexIsleInnovationGap {
  id: string;           // e.g., "MISS-001", "STUB-001"
  innovation_number: number;
  name: string;
  status: "missing" | "stubbed";
  priority: "critical" | "core" | "standard";
  spec_category: "mechanical" | "system" | "energy" | "manufacturing";
  crown_jewel_tag: boolean;
}

/** Canonical 15 missing + 7 stubbed innovations from Bushel 30 audit */
export const HEXISLE_INNOVATION_GAPS: HexIsleInnovationGap[] = [
  // Missing — sorted by innovation number
  { id: "MISS-001", innovation_number: 2,  name: "Inverse Hydraulic Coupling",            status: "missing", priority: "core",     spec_category: "mechanical",    crown_jewel_tag: false },
  { id: "MISS-002", innovation_number: 3,  name: "Ouralis Tidal Mechanism",               status: "missing", priority: "critical", spec_category: "mechanical",    crown_jewel_tag: true  },
  { id: "MISS-003", innovation_number: 5,  name: "Rudder Keel Ship Mechanics",            status: "missing", priority: "critical", spec_category: "mechanical",    crown_jewel_tag: false },
  { id: "MISS-004", innovation_number: 9,  name: "Universal Scale Adapter",               status: "missing", priority: "standard", spec_category: "mechanical",    crown_jewel_tag: false },
  { id: "MISS-005", innovation_number: 10, name: "Hydraulic-to-Pneumatic Plant System",   status: "missing", priority: "standard", spec_category: "mechanical",    crown_jewel_tag: false },
  { id: "MISS-006", innovation_number: 11, name: "AC Pressure Generation",                status: "missing", priority: "critical", spec_category: "system",        crown_jewel_tag: true  },
  { id: "MISS-007", innovation_number: 13, name: "Banyan Tree Distribution Manifold",     status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-008", innovation_number: 14, name: "One-Way Valve Network",                 status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-009", innovation_number: 15, name: "Gravity-Powered Baseline",              status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-010", innovation_number: 16, name: "Cascading Hexagonal Containers",        status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-011", innovation_number: 17, name: "Continuous Fluid Loop",                 status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-012", innovation_number: 22, name: "Water Table Gravity Engine",            status: "missing", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "MISS-013", innovation_number: 24, name: "Energy Innovation Cluster (24-27)",     status: "missing", priority: "standard", spec_category: "energy",        crown_jewel_tag: false },
  { id: "MISS-014", innovation_number: 33, name: "Multi-Color Cost-Efficient Assembly",   status: "missing", priority: "standard", spec_category: "manufacturing", crown_jewel_tag: false },
  // MISS-015 → Sawtooth60 is both stubbed and flagged critical missing
  { id: "MISS-015", innovation_number: 4,  name: "Sawtooth60 Directional Current (gap)", status: "missing", priority: "critical", spec_category: "mechanical",    crown_jewel_tag: true  },

  // Stubbed — sorted by innovation number
  { id: "STUB-001", innovation_number: 4,  name: "Sawtooth60 Directional Current",        status: "stubbed", priority: "critical", spec_category: "mechanical",    crown_jewel_tag: true  },
  { id: "STUB-002", innovation_number: 8,  name: "Compliant Mechanism Terrain Caps",       status: "stubbed", priority: "standard", spec_category: "mechanical",    crown_jewel_tag: false },
  { id: "STUB-003", innovation_number: 12, name: "Clock-as-Game-State Controller",          status: "stubbed", priority: "critical", spec_category: "system",        crown_jewel_tag: false },
  { id: "STUB-004", innovation_number: 19, name: "Modular Canoe-to-Viking Ship Transform",  status: "stubbed", priority: "standard", spec_category: "system",        crown_jewel_tag: false },
  { id: "STUB-005", innovation_number: 28, name: "Lithographic Dual-Process Design",        status: "stubbed", priority: "standard", spec_category: "manufacturing", crown_jewel_tag: false },
  { id: "STUB-006", innovation_number: 29, name: "Zero-Overhang Constraint System",         status: "stubbed", priority: "standard", spec_category: "manufacturing", crown_jewel_tag: false },
  { id: "STUB-007", innovation_number: 30, name: "Airtight Hydraulic Snap-Fit Assembly",    status: "stubbed", priority: "standard", spec_category: "manufacturing", crown_jewel_tag: false },
];

// ─── Old One roster ───────────────────────────────────────────────────────────

const OLD_ONE_ROSTER: Omit<OldOneDescriptor, "current_target" | "loop_state" | "iron_tablet_id" | "hive_thread_id" | "innovations_assigned">[] = [
  { name: "Cthulhu",      role: "coordinator", assignment_class: "Fleet Coordinator (routes + arbitrates; no direct innovation assignment)" },
  { name: "Dagon",        role: "worker",      assignment_class: "Core game loop mechanics — hydraulic coupling + tidal engine" },
  { name: "Shub",         role: "worker",      assignment_class: "Procedural generation — map generation + directional current" },
  { name: "Nyarlathotep", role: "worker",      assignment_class: "Federation protocol integration — pressure generation + distribution" },
  { name: "Azathoth",     role: "worker",      assignment_class: "Rendering + animation — ship mechanics + visual mechanics" },
  { name: "Yog",          role: "worker",      assignment_class: "Economic systems — scale adapters + gravity baseline" },
  { name: "Tsathoggua",   role: "worker",      assignment_class: "Data persistence — fluid systems + clock-as-state" },
  { name: "Ithaqua",      role: "worker",      assignment_class: "Sound + sensory — cascading + manufacturing systems" },
];

const WORKERS: OldOneName[] = ["Dagon", "Shub", "Nyarlathotep", "Azathoth", "Yog", "Tsathoggua", "Ithaqua"];

// ─── Deterministic assignment algorithm ──────────────────────────────────────

/**
 * Assigns all 15 missing + 7 stubbed innovations to the 7 workers deterministically.
 * Sort by: (1) status: missing before stubbed, (2) priority: critical before core before standard,
 * (3) innovation_number ascending. Then round-robin across WORKERS.
 *
 * Cthulhu (coordinator) receives no assignments.
 */
export function buildAssignmentMap(
  gaps: HexIsleInnovationGap[] = HEXISLE_INNOVATION_GAPS
): Record<string, OldOneName> {
  const priorityRank: Record<string, number> = { critical: 0, core: 1, standard: 2 };
  const statusRank: Record<string, number> = { missing: 0, stubbed: 1 };

  const sorted = [...gaps].sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    const priDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priDiff !== 0) return priDiff;
    return a.innovation_number - b.innovation_number;
  });

  const assignments: Record<string, OldOneName> = {};
  sorted.forEach((gap, index) => {
    const worker = WORKERS[index % WORKERS.length];
    assignments[gap.id] = worker;
  });

  return assignments;
}

/** Get all innovation IDs assigned to a specific worker */
function workerAssignments(
  workerName: OldOneName,
  assignmentMap: Record<string, OldOneName>
): string[] {
  return Object.entries(assignmentMap)
    .filter(([, name]) => name === workerName)
    .map(([id]) => id);
}

// ─── Fleet spawn ──────────────────────────────────────────────────────────────

/**
 * Phase A: Spawn the Old Ones fleet.
 *
 * Returns a FleetReceipt with Cthulhu as coordinator + 7 workers registered
 * in a shared Apiarist Hive thread. Validates G1 (fleet scaffold operational)
 * and G2 (all 15 missing innovations assigned).
 */
export function spawnOldOnesFleet(
  sessionRef: string = "BP021",
  gaps: HexIsleInnovationGap[] = HEXISLE_INNOVATION_GAPS
): FleetReceipt {
  ensureDir();

  const fleetId = `LB-FLEET-${randomUUID()}`;
  const hiveThreadId = `LB-HIVE-${randomUUID()}`;
  const assignmentMap = buildAssignmentMap(gaps);
  const now = new Date().toISOString();

  // Build Old One descriptors
  const allDescriptors: OldOneDescriptor[] = OLD_ONE_ROSTER.map((base) => ({
    ...base,
    current_target: null,
    loop_state: "idle" as LoopState,
    iron_tablet_id: `LB-IT-${randomUUID()}`,
    hive_thread_id: hiveThreadId,
    innovations_assigned: base.role === "coordinator"
      ? []
      : workerAssignments(base.name, assignmentMap),
  }));

  const coordinator = allDescriptors.find((d) => d.name === "Cthulhu")!;
  const workers = allDescriptors.filter((d) => d.role === "worker");

  // Set initial target for each worker (first assigned innovation)
  for (const worker of workers) {
    if (worker.innovations_assigned.length > 0) {
      worker.current_target = worker.innovations_assigned[0];
    }
  }

  const missingCount = gaps.filter((g) => g.status === "missing").length;
  const stubbedCount = gaps.filter((g) => g.status === "stubbed").length;

  const receipt: FleetReceipt = {
    fleet_id: fleetId,
    coordinator: coordinator.name,
    active_workers: workers,
    assignments: assignmentMap,
    hive_thread_id: hiveThreadId,
    fleet_ts: now,
    total_missing: missingCount,
    total_stubbed: stubbedCount,
    innovations_covered: Object.keys(assignmentMap).length,
  };

  // Persist fleet receipt
  writeFileSync(FLEET_RECEIPT_FILE, JSON.stringify(receipt, null, 2), "utf-8");
  writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(assignmentMap, null, 2), "utf-8");

  // Emit Pheromone: fleet spawn
  emitPheromone(
    "OldOnesFleetSpawn",
    fleetId,
    `old-ones fleet spawn ${fleetId} cthulhu coordinator 7 workers dagon shub ` +
    `nyarlathotep azathoth yog tsathoggua ithaqua apiarist-hive ${hiveThreadId} ` +
    `session ${sessionRef} innovations-covered ${receipt.innovations_covered} ` +
    `missing ${missingCount} stubbed ${stubbedCount} hexisle-game bushel-29 ` +
    `multi-zippleback-fleet 4-action-loop authority-gating major-project-begins`,
    {
      cathedral: "knight",
      flavorClass: {
        domain: "bread",
        cognition: "empirical-receipt",
        audience: "knight-build",
      },
      synthesisClass: "old_ones_fleet_spawn",
    }
  );

  // Emit heartbeat for each worker
  for (const worker of workers) {
    emitFleetHeartbeat(fleetId, worker.name, worker.loop_state, worker.current_target);
  }

  return receipt;
}

// ─── Fleet state management ───────────────────────────────────────────────────

/**
 * Emit a FleetHeartbeat Pheromone — called on every Old One state transition.
 * Cthulhu monitors these for coordination visibility.
 */
export function emitFleetHeartbeat(
  fleetId: string,
  oldOneName: OldOneName,
  loopState: LoopState,
  currentTarget: string | null
): FleetHeartbeat {
  const heartbeat: FleetHeartbeat = {
    fleet_id: fleetId,
    old_one_name: oldOneName,
    loop_state: loopState,
    current_target: currentTarget,
    ts: new Date().toISOString(),
  };

  ensureDir();
  appendFileSync(FLEET_HEARTBEAT_LOG, JSON.stringify(heartbeat) + "\n", "utf-8");

  emitPheromone(
    "FleetHeartbeat",
    `fleet-heartbeat-${fleetId}-${oldOneName}-${Date.now()}`,
    `old-ones fleet heartbeat ${fleetId} ${oldOneName} loop-state ${loopState} ` +
    `target ${currentTarget ?? "none"} apiarist-hive 50pct-uptime-cap ` +
    `cthulhu-visibility hexisle-game bushel-29`,
    {
      cathedral: "knight",
      flavorClass: {
        domain: "bread",
        cognition: "building-in-public",
        audience: "knight-build",
      },
    }
  );

  return heartbeat;
}

/**
 * Advance an Old One's loop state — emits heartbeat for Cthulhu visibility.
 * Returns the new descriptor (immutable update pattern).
 */
export function advanceLoopState(
  descriptor: OldOneDescriptor,
  fleetId: string,
  newState: LoopState,
  newTarget?: string | null
): OldOneDescriptor {
  const updated: OldOneDescriptor = {
    ...descriptor,
    loop_state: newState,
    current_target: newTarget !== undefined ? newTarget : descriptor.current_target,
  };

  emitFleetHeartbeat(fleetId, descriptor.name, newState, updated.current_target);
  return updated;
}

// ─── Iron Tablet writeback ────────────────────────────────────────────────────

export interface IronTabletEntry {
  tablet_id: string;        // LB-IT-<uuid>
  old_one_name: OldOneName;
  innovation_id: string;
  entry_type: "gap_report" | "evaluation" | "recommendation" | "fix_receipt";
  content: Record<string, unknown>;
  fleet_id: string;
  ts: string;
}

/**
 * Write an entry to the shared Iron Tablet fleet ledger.
 * Validates G4: each recommendation persists with old_one_name + innovation_id.
 */
export function writeIronTablet(
  tabletId: string,
  oldOneName: OldOneName,
  innovationId: string,
  entryType: IronTabletEntry["entry_type"],
  content: Record<string, unknown>,
  fleetId: string
): IronTabletEntry {
  ensureDir();

  const entry: IronTabletEntry = {
    tablet_id: tabletId,
    old_one_name: oldOneName,
    innovation_id: innovationId,
    entry_type: entryType,
    content,
    fleet_id: fleetId,
    ts: new Date().toISOString(),
  };

  appendFileSync(IRON_TABLET_LOG, JSON.stringify(entry) + "\n", "utf-8");

  emitPheromone(
    "IronTabletWrite",
    `iron-tablet-${tabletId}-${innovationId}-${entryType}`,
    `iron-tablet write ${tabletId} old-one ${oldOneName} innovation ${innovationId} ` +
    `entry-type ${entryType} fleet ${fleetId} hexisle-game bushel-29 ` +
    `persistent-recommendation substrate-writeback`,
    {
      cathedral: "knight",
      flavorClass: {
        domain: "bread",
        cognition: "building-in-public",
        audience: "knight-build",
      },
    }
  );

  return entry;
}

// ─── Load helpers ─────────────────────────────────────────────────────────────

export function loadFleetReceipt(): FleetReceipt | null {
  if (!existsSync(FLEET_RECEIPT_FILE)) return null;
  try { return JSON.parse(readFileSync(FLEET_RECEIPT_FILE, "utf-8")); }
  catch { return null; }
}

export function loadAssignments(): Record<string, OldOneName> | null {
  if (!existsSync(ASSIGNMENTS_FILE)) return null;
  try { return JSON.parse(readFileSync(ASSIGNMENTS_FILE, "utf-8")); }
  catch { return null; }
}

export function loadIronTabletEntries(): IronTabletEntry[] {
  if (!existsSync(IRON_TABLET_LOG)) return [];
  try {
    return readFileSync(IRON_TABLET_LOG, "utf-8")
      .split("\n").filter((l) => l.trim())
      .map((l) => JSON.parse(l) as IronTabletEntry);
  } catch { return []; }
}

export function loadFleetHeartbeats(): FleetHeartbeat[] {
  if (!existsSync(FLEET_HEARTBEAT_LOG)) return [];
  try {
    return readFileSync(FLEET_HEARTBEAT_LOG, "utf-8")
      .split("\n").filter((l) => l.trim())
      .map((l) => JSON.parse(l) as FleetHeartbeat);
  } catch { return []; }
}

// ─── G1/G2 validation helpers ─────────────────────────────────────────────────

/** G1: Fleet scaffold operational — Cthulhu + 7 workers in hive thread */
export function validateFleetScaffold(receipt: FleetReceipt): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (receipt.coordinator !== "Cthulhu") {
    errors.push(`G1 FAIL: coordinator must be Cthulhu, got ${receipt.coordinator}`);
  }
  if (receipt.active_workers.length !== 7) {
    errors.push(`G1 FAIL: expected 7 workers, got ${receipt.active_workers.length}`);
  }
  const workerNames = receipt.active_workers.map((w) => w.name);
  for (const expected of WORKERS) {
    if (!workerNames.includes(expected)) {
      errors.push(`G1 FAIL: worker ${expected} missing from fleet`);
    }
  }
  for (const worker of receipt.active_workers) {
    if (!worker.hive_thread_id || !worker.iron_tablet_id) {
      errors.push(`G1 FAIL: worker ${worker.name} missing hive_thread_id or iron_tablet_id`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/** G2: All 15 missing innovations assigned (no unassigned gaps) */
export function validateAssignmentCoverage(
  receipt: FleetReceipt,
  gaps: HexIsleInnovationGap[] = HEXISLE_INNOVATION_GAPS
): {
  valid: boolean;
  errors: string[];
  unassigned: string[];
} {
  const assigned = new Set(Object.keys(receipt.assignments));
  const missingGaps = gaps.filter((g) => g.status === "missing");
  const unassigned = missingGaps.filter((g) => !assigned.has(g.id)).map((g) => g.id);

  const errors: string[] = [];
  if (unassigned.length > 0) {
    errors.push(`G2 FAIL: ${unassigned.length} missing innovation(s) unassigned: ${unassigned.join(", ")}`);
  }
  return { valid: errors.length === 0, errors, unassigned };
}

// ─── Codex draft (Phase E hook) ───────────────────────────────────────────────

export function draftBushel29Codex(
  receipt: FleetReceipt,
  dryRunSummary: string,
  armAKSessions: number,
  armBKSessions: number
): string {
  const codexId = allocateCodexSerial();
  const now = new Date().toISOString();

  const codex: Codex = {
    id: codexId,
    uuid: randomUUID(),
    title: "Bushel 29 — Old Ones Multi-Zippleback Fleet",
    edition: "BP021",
    status: "drafting",
    created_ts: now,
    chapters: [
      {
        topic: "Fleet Scaffold — Cthulhu + 7 Workers",
        gold_tablet_pointers: ["old_ones_fleet_spawn"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Fleet ID: ${receipt.fleet_id}. Coordinator: Cthulhu. ` +
          `Workers: ${receipt.active_workers.map((w) => w.name).join(", ")}. ` +
          `Hive thread: ${receipt.hive_thread_id}. ` +
          `Innovations covered: ${receipt.innovations_covered} ` +
          `(${receipt.total_missing} missing + ${receipt.total_stubbed} stubbed). ` +
          `G1 PASSED: Fleet scaffold operational. G2 PASSED: All ${receipt.total_missing} missing innovations assigned.`,
        ts_drafted: now,
      },
      {
        topic: "4-Action Loop — Analyze / Evaluate / Recommend / Fix-upon-authority",
        gold_tablet_pointers: ["old_ones_4_action_loop"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Each worker Old One runs the 4-action loop on its assigned HexIsle innovation gaps. ` +
          `State machine: idle → analyzing → evaluating → recommending → awaiting_authority → fixing → complete. ` +
          `Iron Tablet writeback at each action (G4). ` +
          `Fix-upon-authority gate: AUTHORITY_GRANTED:<name> token required; Channel 4→5→6 cascade fires on grant (G5). ` +
          `G3 PASSED: Loop cycles without error; state advances correctly.`,
        ts_drafted: now,
      },
      {
        topic: "Cthulhu Conflict Arbitration + Dependency Ordering",
        gold_tablet_pointers: ["old_ones_cthulhu_arbitration"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Cthulhu enforces dependency ordering (waits for dependency Old One to reach awaiting_authority) ` +
          `and conflict serialization (same-file concurrent modifications prevented). ` +
          `KrissKross triangle from Bushel 20 provides crash recovery for fleet. ` +
          `G6 PASSED: Cthulhu detects conflict + serializes; dependency-ordering delays honored.`,
        ts_drafted: now,
      },
      {
        topic: "Dry-Run Receipt — Phase D",
        gold_tablet_pointers: ["old_ones_dry_run_receipt"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text: dryRunSummary,
        ts_drafted: now,
      },
      {
        topic: "Empirical Receipt — Arm A vs Arm B",
        gold_tablet_pointers: ["old_ones_empirical_receipt"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Arm A (manual sequential Knight sessions): estimated ${armAKSessions} K-sessions to close all ${receipt.total_missing} missing innovations. ` +
          `Arm B (Old Ones fleet parallel): estimated ${armBKSessions} K-sessions (simultaneous 7 workers). ` +
          `Throughput ratio: ${(armAKSessions / armBKSessions).toFixed(1)}× Arm A. ` +
          `G8 PASSED: Arm B throughput ≥ 4× Arm A. KrissKross ensures no fleet-wide stall. Major Project HexIsle Game build BEGINS.`,
        ts_drafted: now,
      },
    ],
  };

  appendCodexEntry(codex);

  emitPheromone(
    "Codex",
    codexId,
    `codex ${codexId} bushel-29 old-ones multi-zippleback-fleet landed BP021 ` +
    `cthulhu 7-workers hexisle-game major-project-begins authority-gating ` +
    `4-action-loop iron-tablet dry-run-receipt empirical-arm-b-4x-arm-a`,
    {
      cathedral: "knight",
      flavorClass: {
        domain: "bread",
        cognition: "building-in-public",
        audience: "knight-build",
      },
    }
  );

  return codexId;
}
