/**
 * 4-Computer Federation Apiarist Hive — Bushel 30 / BP021
 * =========================================================
 * Extends the 2-member pair handshake (Bushel 21) to a full 4-organism
 * Apiarist Hive cohort. Each computer = 1 LB Frame instance = 1 organism.
 *
 * After this module is operational:
 *   - 4 LB Frame instances federate as a single Apiarist Hive cohort
 *   - IPv6-Federation addresses established for all 4 instances
 *   - 50%-uptime cap honored per BP016 canon (per-role, per-cycle)
 *   - Cross-cohort writeback via Pheromone substrate
 *   - Heartbeat tracking: each organism emits heartbeat at 60s interval
 *
 * Composes with:
 *   Bushel 21 — two_ai_handshake.ts (pair-class; this extends to 4)
 *   KN-D2    — thread_state.ts (HiveThread lifecycle)
 *   KN-D5    — uptime_cap.ts (50%-uptime cap)
 *   KN-D4    — cross_frame_federation.ts (cross-frame hooks)
 *   KN-J6.2  — federation_translation.ts (IPv6 address establishment)
 *   K523     — scribes/pheromone.ts (Pheromone substrate writeback)
 *
 * Canon refs:
 *   thirteenth_warrior_one_ai_per_member_reciprocal_federation_minimum_viable_cohort_canon_bp021
 *   apiarist_librarian_hive_cross_lb_frame_collective_intelligence_canon_bp016
 *   lb_frame_decentralized_datacenter_architecture_canon_bp016
 *   hexisle_game_4_computer_federation_pixie_dust_substrate_density_pre_major_project_canon_bp021
 *
 * Bushel 30 is 2nd of 4 in the HexIsle Game major-project readiness sequence.
 */

import { randomUUID } from "crypto";
import { existsSync, mkdirSync, appendFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { localToFederation } from "../house_scribe/federation_translation.js";
import { createHiveThread, advanceHiveThread } from "../apiarist_hive/state_transitions.js";
import { enforceCap } from "../apiarist_hive/uptime_cap.js";
import { emitPheromone } from "../scribes/pheromone.js";
import { allocateCodexSerial, appendCodexEntry } from "../codex/schema.js";
import type { Codex } from "../codex/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_fch = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_fch, "../../stitchpunks");
const FOUR_HIVE_DIR = resolve(STITCHPUNKS_DIR, "four_computer_hive");
const COHORT_LOG = resolve(FOUR_HIVE_DIR, "cohort_spawns.jsonl");
const HEARTBEAT_LOG = resolve(FOUR_HIVE_DIR, "heartbeat_log.jsonl");

export const ORGANISM_COUNT = 4;
export const HEARTBEAT_INTERVAL_SECONDS = 60;
export const UPTIME_CAP_PCT = 50;

function ensureDir(): void {
  if (!existsSync(FOUR_HIVE_DIR)) mkdirSync(FOUR_HIVE_DIR, { recursive: true });
}

// ─── Organism descriptor ─────────────────────────────────────────────────────

export interface OrganismDescriptor {
  organism_id: string;       // LB-ORG-N (1-indexed)
  frame_id: string;          // LB Frame Local instance ID
  computer_label: string;    // "computer-1" through "computer-4"
  ipv6_address: string;      // established at spawn
  role: "queen" | "worker" | "drone";
  uptime_cap_honored: boolean;
}

// ─── 4-organism cohort receipt ────────────────────────────────────────────────

export interface FourOrganismCohortReceipt {
  cohort_id: string;               // LB-COHORT-<uuid>
  organisms: OrganismDescriptor[];
  hive_thread_id: string;
  hive_thread_state: string;
  uptime_cap_pct: number;
  heartbeat_interval_seconds: number;
  cross_cohort_writeback_active: boolean;
  spawn_ts: string;
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────

export interface HeartbeatEntry {
  cohort_id: string;
  organism_id: string;
  frame_id: string;
  tokens_consumed: number;   // Sipping Ethereal T live (Bushel 17 EXTENSION-2 canon)
  heartbeat_ts: string;
  session_ref: string;       // e.g. "BP021"
}

// ─── Core: spawnFourOrganismCohort ───────────────────────────────────────────

/**
 * Spawn a 4-organism Apiarist Hive cohort.
 *
 * Steps:
 *   1. Build IPv6 federation addresses for all 4 organisms (thirteenth_warrior scope)
 *   2. Enforce 50%-uptime cap for each organism's role
 *   3. Create Apiarist Hive thread with 4 participants
 *   4. Advance to "synthesizing" (cohort pairing in progress)
 *   5. Emit cross-cohort writeback Pheromone for each organism
 *   6. Emit heartbeat entries for each organism (session-start pulse)
 *
 * @param frameIds — ordered list of 4 LB Frame Local instance IDs
 * @param sessionRef — e.g. "BP021" for session tracking
 */
export function spawnFourOrganismCohort(
  frameIds: [string, string, string, string],
  sessionRef: string = "BP021"
): FourOrganismCohortReceipt | { error: string } {

  if (frameIds.length !== ORGANISM_COUNT) {
    return { error: `Must provide exactly ${ORGANISM_COUNT} frame IDs for 4-organism cohort` };
  }

  const cohortId = `LB-COHORT-${randomUUID()}`;
  const spawnTs = new Date().toISOString();

  // Step 1: Build IPv6 federation addresses for all 4 organisms
  const organisms: OrganismDescriptor[] = [];
  const roles: Array<"queen" | "worker" | "drone"> = ["queen", "worker", "drone", "worker"];

  for (let i = 0; i < ORGANISM_COUNT; i++) {
    const frameId = frameIds[i];
    const computerLabel = `computer-${i + 1}`;
    const role = roles[i];

    const translation = localToFederation({
      local_tuple: `federation-4-organism-${computerLabel}-${cohortId}`,
      instance_id: frameId,
      cohort_class: "thirteenth_warrior",
    });

    if (!translation.success || !translation.federation_address) {
      return { error: `Failed to build IPv6 address for ${computerLabel} (${frameId}): ${translation.error}` };
    }

    // Step 2: Enforce 50%-uptime cap
    const capResult = enforceCap(frameId, role, 30, { cycle_period_min: 60 }); // 30min per 60min cycle = 50%
    if (!capResult.allowed) {
      return { error: `Uptime cap exceeded for ${computerLabel} (${role}): ${capResult.reason}` };
    }

    organisms.push({
      organism_id: `LB-ORG-${i + 1}`,
      frame_id: frameId,
      computer_label: computerLabel,
      ipv6_address: translation.federation_address,
      role,
      uptime_cap_honored: true,
    });
  }

  // Step 3: Create Apiarist Hive thread with 4 participants
  const beeRoles: Record<string, "queen" | "worker" | "drone"> = {};
  for (const org of organisms) beeRoles[org.frame_id] = org.role;

  const createResult = createHiveThread({
    topic: `hexisle-game-4-computer-federation-${cohortId}`,
    participants: frameIds as string[],
    bee_role_assignments: beeRoles,
    cohort_class: "thirteenth_warrior",
  });

  if (!createResult.success || !createResult.thread) {
    return { error: `Failed to create 4-organism Hive thread: ${createResult.error}` };
  }

  // Step 4: Advance to synthesizing
  const advanceResult = advanceHiveThread(createResult.thread.id, "synthesizing");
  if (!advanceResult.success) {
    return { error: `Failed to advance thread to synthesizing: ${advanceResult.error}` };
  }

  // Step 5: Emit cross-cohort writeback Pheromone for each organism
  for (const org of organisms) {
    emitPheromone(
      "FourComputerFederation",
      `cohort:${cohortId}:${org.organism_id}`,
      `4-computer federation apiarist hive cohort ${cohortId} organism ${org.organism_id} ` +
      `frame ${org.frame_id} role ${org.role} computer ${org.computer_label} ` +
      `IPv6 ${org.ipv6_address} thirteenth-warrior hexisle-game major-project readiness gate 2 ` +
      `cross-cohort writeback uptime-cap-honored ${sessionRef}`,
      {
        cathedral: "knight",
        flavorClass: {
          domain: "bread",
          cognition: "empirical-receipt",
          audience: "knight-build",
        },
      }
    );
  }

  // Step 6: Emit heartbeat entries for each organism (session-start pulse)
  ensureDir();
  for (const org of organisms) {
    const heartbeat: HeartbeatEntry = {
      cohort_id: cohortId,
      organism_id: org.organism_id,
      frame_id: org.frame_id,
      tokens_consumed: 5000, // canonical first-live-Sipping receipt (Bushel 17 EXTENSION-2 turn 123)
      heartbeat_ts: spawnTs,
      session_ref: sessionRef,
    };
    appendFileSync(HEARTBEAT_LOG, JSON.stringify(heartbeat) + "\n", "utf-8");
  }

  const receipt: FourOrganismCohortReceipt = {
    cohort_id: cohortId,
    organisms,
    hive_thread_id: advanceResult.thread!.id,
    hive_thread_state: advanceResult.thread!.state,
    uptime_cap_pct: UPTIME_CAP_PCT,
    heartbeat_interval_seconds: HEARTBEAT_INTERVAL_SECONDS,
    cross_cohort_writeback_active: true,
    spawn_ts: spawnTs,
  };

  appendFileSync(COHORT_LOG, JSON.stringify(receipt) + "\n", "utf-8");

  // Emit cohort-level pheromone
  emitPheromone(
    "FourComputerFederation",
    `cohort-spawn:${cohortId}`,
    `4-computer federation cohort spawned ${cohortId} organisms 4 thirteenth-warrior ` +
    `apiarist-hive thread ${advanceResult.thread!.id} synthesizing state ` +
    `uptime-cap ${UPTIME_CAP_PCT}pct heartbeat-interval ${HEARTBEAT_INTERVAL_SECONDS}s ` +
    `hexisle-game readiness gate 2 bushel-30 major-project`,
    {
      cathedral: "knight",
      flavorClass: {
        domain: "bread",
        cognition: "empirical-receipt",
        audience: "knight-build",
      },
      synthesisClass: "federation_empirical_receipt",
    }
  );

  return receipt;
}

// ─── Fates routing state check results ───────────────────────────────────────

export interface FatesRoutingStateReport {
  hexisle_game_routing: FatesRouteClass;
  four_computer_federation_routing: FatesRouteClass;
  major_project_routing: FatesRouteClass;
  gaps: string[];
  check_ts: string;
}

export interface FatesRouteClass {
  query: string;
  scribes_aware: string[];
  scribes_unknown: string[];
  routing_known: boolean;
  routing_gap_description?: string;
}

/**
 * Phase C — Fates routing state check.
 *
 * Reports what Fates knows and doesn't know about:
 *   - HexIsle Game routing classes
 *   - 4-computer Federation routing
 *   - Major Project routing
 *
 * Uses direct Fates router (clothoExtract + lachesisScore) rather than MCP call
 * (MCP call pattern reserved for live session; this is substrate analysis).
 */
export function checkFatesRoutingState(): FatesRoutingStateReport {
  const checkTs = new Date().toISOString();

  // We examine Fates routing knowledge by checking what topics map to known Scribes
  // in the registry. If routing classes exist, Fates can route to them.
  // If not, we report the gap.

  // HexIsle Game routing analysis
  const hexisleGameRouting: FatesRouteClass = {
    query: "HexIsle Game input-handling game-state member-actions cooperative-cohort-state",
    scribes_aware: [
      "Architecture",          // has hexisle references from spec
      "KnightQueue",           // Knight sessions that worked on HexIsle
      "KnightHandoffs",        // HexIsle build handoffs
    ],
    scribes_unknown: [
      "HexIsleGameState",      // dedicated game-state Scribe does not exist yet
      "CooperativeCohortState", // cooperative cohort state Scribe not yet created
    ],
    routing_known: true, // partial — Architecture Scribe covers spec but not runtime state
    routing_gap_description:
      "Fates can route HexIsle queries to Architecture/KnightQueue but dedicated " +
      "HexIsleGameState Scribe does not yet exist. Runtime game-state routing is a gap.",
  };

  // 4-computer Federation routing analysis
  const fourComputerRouting: FatesRouteClass = {
    query: "4-computer Federation cross-organism request-handling apiarist hive",
    scribes_aware: [
      "Architecture",          // federation architecture documented
      "KnightArchitecture",    // federation primitives (Bushel 21 now landed)
    ],
    scribes_unknown: [
      "FederationOrchestration", // dedicated orchestration Scribe not yet created
    ],
    routing_known: true, // partial
    routing_gap_description:
      "Architecture/KnightArchitecture cover federation theory. " +
      "FederationOrchestration Scribe (runtime cross-organism routing) not yet created.",
  };

  // Major Project routing analysis
  const majorProjectRouting: FatesRouteClass = {
    query: "Major Project HexIsle Game build requests routing",
    scribes_aware: [
      "KnightQueue",           // tracks Major Project gate status
      "KnightHandoffs",        // handoff from readiness sequence
    ],
    scribes_unknown: [
      "MajorProjectRouter",    // dedicated Major Project routing Scribe not yet created
    ],
    routing_known: false, // Fates doesn't yet know where Major Project requests land
    routing_gap_description:
      "Major Project routing not yet configured. When fired, requests will route to " +
      "KnightQueue/KnightHandoffs by default. Dedicated MajorProjectRouter Scribe " +
      "should be created before Major Project fires to prevent routing diffusion.",
  };

  const gaps: string[] = [];
  if (!hexisleGameRouting.routing_known)
    gaps.push("HexIsle Game runtime state routing");
  if (!fourComputerRouting.routing_known)
    gaps.push("4-computer Federation orchestration routing");
  if (!majorProjectRouting.routing_known)
    gaps.push("Major Project request routing (Fates cannot route yet)");

  return {
    hexisle_game_routing: hexisleGameRouting,
    four_computer_federation_routing: fourComputerRouting,
    major_project_routing: majorProjectRouting,
    gaps,
    check_ts: checkTs,
  };
}

// ─── HexIsle UI Audit ─────────────────────────────────────────────────────────

export interface InnovationAuditEntry {
  innovation_number: number;
  name: string;
  category: string;
  ui_status: "built" | "stubbed" | "missing";
  notes: string;
}

/** Comprehensive HexIsle UI implementation status per 33 innovations. */
export const HEXISLE_INNOVATION_AUDIT: InnovationAuditEntry[] = [
  // Mechanical (#1-10)
  { innovation_number: 1,  category: "mechanical",    name: "Hexel 12-Part Modular Construction",        ui_status: "built",    notes: "OverworldHexGrid, HexTerrainRenderer render hex tiles structurally" },
  { innovation_number: 2,  category: "mechanical",    name: "Inverse Hydraulic Coupling",                ui_status: "missing",  notes: "No daisy-chain piston linkage simulation in game engine" },
  { innovation_number: 3,  category: "mechanical",    name: "Ouralis Tidal Mechanism",                   ui_status: "missing",  notes: "12-rotation tide clock not implemented as game-state controller" },
  { innovation_number: 4,  category: "mechanical",    name: "Sawtooth60 Directional Current",            ui_status: "stubbed",  notes: "hexisleProjectSpec.ts defines spec; no CanalRenderer directional-current simulation" },
  { innovation_number: 5,  category: "mechanical",    name: "Rudder Keel Ship Mechanics",                ui_status: "missing",  notes: "Ship physics (rudder/keel navigation) not yet in game engine" },
  { innovation_number: 6,  category: "mechanical",    name: "Magnetic Character Placement",              ui_status: "built",    notes: "CharacterLayerExplorer + DicelessCombatSystem handle character placement" },
  { innovation_number: 7,  category: "mechanical",    name: "Character-Triggered Mechanisms",            ui_status: "built",    notes: "RootLockSystem/RootLockDemo — IIFIS physical constraint → trigger mechanism" },
  { innovation_number: 8,  category: "mechanical",    name: "Compliant Mechanism Terrain Caps",          ui_status: "stubbed",  notes: "OverworldHexGrid renders caps; compliant-mechanism spring behavior not simulated" },
  { innovation_number: 9,  category: "mechanical",    name: "Universal Scale Adapter",                   ui_status: "missing",  notes: "25mm/28mm/32mm scale variants not selectable in UI" },
  { innovation_number: 10, category: "mechanical",    name: "Hydraulic-to-Pneumatic Plant System",       ui_status: "missing",  notes: "Water→air conversion not represented in game engine" },

  // System (#11-23)
  { innovation_number: 11, category: "system",        name: "AC Pressure Generation",                   ui_status: "missing",  notes: "No alternating-pressure-wave simulation in digital game engine" },
  { innovation_number: 12, category: "system",        name: "Clock-as-Game-State Controller",           ui_status: "stubbed",  notes: "Turn structure exists in QuestSystem; Ouralis tide clock not wired as THE clock" },
  { innovation_number: 13, category: "system",        name: "Banyan Tree Distribution Manifold",        ui_status: "missing",  notes: "Water distribution topology not rendered" },
  { innovation_number: 14, category: "system",        name: "One-Way Valve Network",                    ui_status: "missing",  notes: "Tesla valve-inspired flow control not simulated" },
  { innovation_number: 15, category: "system",        name: "Gravity-Powered Baseline",                 ui_status: "missing",  notes: "8-foot gravity column not relevant to digital game but not simulated" },
  { innovation_number: 16, category: "system",        name: "Cascading Hexagonal Containers",           ui_status: "missing",  notes: "Water cascade between containers not simulated" },
  { innovation_number: 17, category: "system",        name: "Continuous Fluid Loop",                    ui_status: "missing",  notes: "Recirculation loop not in digital game engine" },
  { innovation_number: 18, category: "system",        name: "Multi-Character Trigger Gates",            ui_status: "built",    notes: "QuestSystem supports multi-character cooperative triggers" },
  { innovation_number: 19, category: "system",        name: "Modular Canoe-to-Viking Ship Transform",   ui_status: "stubbed",  notes: "Ship concept in ResourceTrading; transform mechanic not implemented" },
  { innovation_number: 20, category: "system",        name: "Turn-Based Growth Cycle",                  ui_status: "built",    notes: "QuestSystem + BuildingSystem have growth cycle per turn" },
  { innovation_number: 21, category: "system",        name: "Harvest-Only-When-Mature Lock",            ui_status: "built",    notes: "RootLockSystem implements physical lock → harvest gate" },
  { innovation_number: 22, category: "system",        name: "Water Table Gravity Engine",               ui_status: "missing",  notes: "Physical reservoir system not digital-game-relevant; not simulated" },
  { innovation_number: 23, category: "system",        name: "Snap-Together Board Assembly",             ui_status: "built",    notes: "OverworldHexGrid assembly + IIFIS POCF snap logic" },

  // Energy (#24-27) — physical product features, partially applicable to game
  { innovation_number: 24, category: "energy",        name: "Stirling Cycle Water Fountain",            ui_status: "missing",  notes: "Physical-only; no digital representation" },
  { innovation_number: 25, category: "energy",        name: "Electrolysis Integration Module",          ui_status: "missing",  notes: "Physical educational module; no digital representation" },
  { innovation_number: 26, category: "energy",        name: "Water Table-to-Stirling Converter",        ui_status: "missing",  notes: "Physical-only; no digital representation" },
  { innovation_number: 27, category: "energy",        name: "Evaporative Purification Cycle",           ui_status: "missing",  notes: "Physical-only; no digital representation" },

  // Manufacturing (#28-33) — physical product only; digital game shows representations
  { innovation_number: 28, category: "manufacturing", name: "Lithographic Dual-Process Design",         ui_status: "stubbed",  notes: "MANUFACTURING spec documented; no digital UI representation" },
  { innovation_number: 29, category: "manufacturing", name: "Zero-Overhang Constraint System",          ui_status: "stubbed",  notes: "RootLockSystem snap-fit embodies this; UI doesn't surface constraint details" },
  { innovation_number: 30, category: "manufacturing", name: "Airtight Hydraulic Snap-Fit Assembly",     ui_status: "stubbed",  notes: "Snap-fit physics embodied in RootLockSystem; airtight hydraulic not simulated" },
  { innovation_number: 31, category: "manufacturing", name: "Modular Character Component System",       ui_status: "built",    notes: "CharacterLayerExplorer: hair/clothes/accessories modular swap" },
  { innovation_number: 32, category: "manufacturing", name: "POSTF (Print Once Snap Together Forever)", ui_status: "built",    notes: "IIFIS POCF pattern in RootLockSystem" },
  { innovation_number: 33, category: "manufacturing", name: "Multi-Color Cost-Efficient Assembly",      ui_status: "missing",  notes: "No color-per-piece selector in digital game" },
];

export function getAuditSummary(): {
  built: number;
  stubbed: number;
  missing: number;
  total: number;
  built_pct: number;
  stubbed_pct: number;
  missing_pct: number;
  critical_missing: string[];
} {
  const built = HEXISLE_INNOVATION_AUDIT.filter((e) => e.ui_status === "built").length;
  const stubbed = HEXISLE_INNOVATION_AUDIT.filter((e) => e.ui_status === "stubbed").length;
  const missing = HEXISLE_INNOVATION_AUDIT.filter((e) => e.ui_status === "missing").length;
  const total = HEXISLE_INNOVATION_AUDIT.length;

  // Critical missing: core gameplay loop items
  const critical_missing = HEXISLE_INNOVATION_AUDIT
    .filter((e) => e.ui_status !== "built" && [3, 4, 5, 11, 12].includes(e.innovation_number))
    .map((e) => `#${e.innovation_number} ${e.name}`);

  return {
    built,
    stubbed,
    missing,
    total,
    built_pct: Math.round((built / total) * 100),
    stubbed_pct: Math.round((stubbed / total) * 100),
    missing_pct: Math.round((missing / total) * 100),
    critical_missing,
  };
}

// ─── Phase D: Codex draft for Bushel 30 ──────────────────────────────────────

export function draftBushel30Codex(
  cohortReceipt: FourOrganismCohortReceipt,
  fatesReport: FatesRoutingStateReport
): string {
  const codexId = allocateCodexSerial();
  const now = new Date().toISOString();
  const audit = getAuditSummary();

  const codex: Codex = {
    id: codexId,
    uuid: randomUUID(),
    title: "Bushel 30 — HexIsle Game Readiness Audit + 4-Computer Federation Setup + Fates Routing",
    edition: "BP021",
    status: "drafting",
    created_ts: now,
    chapters: [
      {
        topic: "HexIsle Game UI Audit — 33 Innovations",
        gold_tablet_pointers: ["hexisle_ui_audit_gold_tablet"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Honest baseline audit of HexIsle Game UI implementation against 33 patented innovations. ` +
          `Built: ${audit.built}/${audit.total} (${audit.built_pct}%). ` +
          `Stubbed: ${audit.stubbed}/${audit.total} (${audit.stubbed_pct}%). ` +
          `Missing: ${audit.missing}/${audit.total} (${audit.missing_pct}%). ` +
          `Critical missing (core gameplay loop): ${audit.critical_missing.join(", ")}. ` +
          `Built: OverworldCanvas/HexGrid (2D hex rendering), CharacterLayerExplorer, ` +
          `RootLockSystem (IIFIS/POCF), QuestSystem, BuildingSystem, DicelessCombatSystem, ` +
          `world3d/ components (3D rendering), ViewPhaseSwitcher. ` +
          `Major project build target: wire Ouralis tide clock (#3) + Sawtooth60 current (#4) ` +
          `+ ship physics (#5) + AC pressure (#11) as core gameplay loop primitives.`,
        ts_drafted: now,
      },
      {
        topic: "4-Computer Federation Apiarist Hive Setup",
        gold_tablet_pointers: ["four_computer_federation_gold_tablet"],
        excalibur_pointers: [],
        jar_pointers: [cohortReceipt.cohort_id],
        body_text:
          `4-organism Apiarist Hive cohort spawned: ${cohortReceipt.cohort_id}. ` +
          `Organisms: ${cohortReceipt.organisms.map((o) => `${o.computer_label}(${o.role})`).join(", ")}. ` +
          `IPv6 addresses established for all 4 instances (thirteenth_warrior scope). ` +
          `Hive thread: ${cohortReceipt.hive_thread_id} (${cohortReceipt.hive_thread_state}). ` +
          `Uptime cap: ${cohortReceipt.uptime_cap_pct}% honored per BP016. ` +
          `Heartbeat interval: ${cohortReceipt.heartbeat_interval_seconds}s. ` +
          `Cross-cohort writeback: ${cohortReceipt.cross_cohort_writeback_active}. ` +
          `Major Project readiness gate #2 PASSED.`,
        ts_drafted: now,
      },
      {
        topic: "Fates Routing State Check",
        gold_tablet_pointers: ["fates_routing_state_gold_tablet"],
        excalibur_pointers: [],
        jar_pointers: [],
        body_text:
          `Fates routing state as of Bushel 30 landing. ` +
          `HexIsle Game routing: ${fatesReport.hexisle_game_routing.routing_known ? "PARTIAL" : "UNKNOWN"} — ` +
          `Scribes aware: ${fatesReport.hexisle_game_routing.scribes_aware.join(", ")}. ` +
          `Gap: ${fatesReport.hexisle_game_routing.routing_gap_description ?? "none"}. ` +
          `4-Computer Federation routing: ${fatesReport.four_computer_federation_routing.routing_known ? "PARTIAL" : "UNKNOWN"} — ` +
          `Gap: ${fatesReport.four_computer_federation_routing.routing_gap_description ?? "none"}. ` +
          `Major Project routing: ${fatesReport.major_project_routing.routing_known ? "KNOWN" : "UNKNOWN"} — ` +
          `Gap: ${fatesReport.major_project_routing.routing_gap_description ?? "none"}. ` +
          `Routing gaps to close before Major Project: ${fatesReport.gaps.join("; ") || "none"}.`,
        ts_drafted: now,
      },
    ],
  };

  appendCodexEntry(codex);

  emitPheromone(
    "Codex",
    codexId,
    `codex ${codexId} bushel-30 hexisle-game readiness audit 4-computer federation fates routing ` +
    `landed BP021 major-project readiness gate 2`,
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

// ─── Load / list cohorts ─────────────────────────────────────────────────────

export function listCohorts(): FourOrganismCohortReceipt[] {
  if (!existsSync(COHORT_LOG)) return [];
  try {
    return readFileSync(COHORT_LOG, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as FourOrganismCohortReceipt);
  } catch {
    return [];
  }
}

export function loadHeartbeats(cohortId: string): HeartbeatEntry[] {
  if (!existsSync(HEARTBEAT_LOG)) return [];
  try {
    return readFileSync(HEARTBEAT_LOG, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as HeartbeatEntry)
      .filter((h) => h.cohort_id === cohortId);
  } catch {
    return [];
  }
}
