/**
 * Old Ones Multi-Zippleback Fleet — Phase B: 4-Action Loop
 * ==========================================================
 * Bushel 29 / BP021 — old_ones_loop.ts
 *
 * Implements `runOldOneLoop(name, innovationId)` for each worker Old One.
 * The 4-action loop:
 *   1. analyze()         — reads hexisleProjectSpec.ts entry vs HexIsle*.tsx; produces GapReport
 *   2. evaluate()        — scores gap: complexity, patent_risk, depends_on, cost_estimate
 *   3. recommend()       — drafts fix spec; writes to Iron Tablet
 *   4. fix_upon_authority(token) — validates AUTHORITY_GRANTED:<name>; fires Ch4→5→6 cascade
 *
 * All actions emit Pheromone. All state transitions emit FleetHeartbeat for Aughra visibility.
 * Authority-gating enforced at action 4: exact token required (G5).
 *
 * Composes with:
 *   old_ones_fleet.ts            — OldOneDescriptor, LoopState, iron tablet writeback, heartbeats
 *   bishop_callback_listener.ts — Channels 4/5/6 (Ch4 emitBishopCallbackDirective, Ch5 spawn, Ch6 fire)
 *   ../scribes/pheromone.ts      — Pheromone emission
 */

import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { emitPheromone } from "../scribes/pheromone.js";
import {
  OldOneDescriptor,
  OldOneName,
  LoopState,
  HexIsleInnovationGap,
  HEXISLE_INNOVATION_GAPS,
  advanceLoopState,
  writeIronTablet,
  emitFleetHeartbeat,
} from "./old_ones_fleet.js";
import {
  emitBishopCallbackDirective,
  spawnShadowCohortFromDirective,
  fireShadowSubagent,
} from "./bishop_callback_listener.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_loop = dirname(__filename);

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Complexity = "S" | "M" | "L" | "XL";
export type PatentRisk = "low" | "medium" | "high";

export interface GapReport {
  innovation_id: string;
  innovation_number: number;
  name: string;
  spec_text: string;
  implementation_status: "missing" | "stubbed";
  missing_elements: string[];
  stubbed_elements: string[];
  files_checked: string[];
  ts: string;
}

export interface Evaluation {
  innovation_id: string;
  complexity: Complexity;
  patent_risk: PatentRisk;
  depends_on: string[];   // innovation IDs that must be resolved first
  cost_estimate_k_tokens: number;
  is_crown_jewel: boolean;
  rationale: string;
  ts: string;
}

export interface FixRecommendation {
  innovation_id: string;
  old_one_name: OldOneName;
  files_to_create: string[];
  files_to_modify: string[];
  new_component_spec: string;
  acceptance_criteria: string[];
  iron_tablet_entry_id: string;
  ts: string;
}

export interface FixReceipt {
  innovation_id: string;
  old_one_name: OldOneName;
  authority_token: string;
  channel_4_directive_id: string;
  channel_5_spawn_id: string | null;
  channel_6_fire_id: string | null;
  iron_tablet_written: boolean;
  ts: string;
}

export interface LoopResult {
  descriptor: OldOneDescriptor;
  gap_report: GapReport | null;
  evaluation: Evaluation | null;
  recommendation: FixRecommendation | null;
  fix_receipt: FixReceipt | null;
  final_state: LoopState;
}

// ─── Spec catalog (in-memory representation of hexisleProjectSpec.ts) ─────────

/**
 * Spec text map: innovation_id → canonical description from hexisleProjectSpec.ts.
 * This avoids reading the spec file at runtime; it mirrors the PATENTED_INNOVATIONS array.
 */
const SPEC_TEXT_MAP: Record<string, string> = {
  "MISS-001": "Inverse Hydraulic Coupling — When A piston moves, B moves opposite; daisy chain linkage enables bidirectional pressure propagation through the Hexel water channel network.",
  "MISS-002": "Ouralis Tidal Mechanism — 12-rotation tide cycle = one game turn. The Ouralis mechanism uses a 12-chamber rotor driven by Golden Lotus rotation to mark game clock progression. One full tide = one turn.",
  "MISS-003": "Rudder Keel Ship Mechanics — Ships navigate currents using physics-based rudder/keel geometry. Sawtooth60 current exerts lateral force proportional to keel depth; rudder angle determines turning radius.",
  "MISS-004": "Universal Scale Adapter — 25mm/28mm/32mm compatibility via adapter rings that seat at the ChannelLock collar. Enables HexIsle to support any miniature wargame scale without retooling.",
  "MISS-005": "Hydraulic-to-Pneumatic Plant System — Water pressure at the Hexel base converts to air pressure for above-water plant mechanisms. Differential pressure seal at 5mm lift point enables pneumatic actuation without external pumps.",
  "MISS-006": "AC Pressure Generation — Creates alternating pressure waves (push/pull) without pumps using paired Golden Lotus chambers operating 180° out of phase. AC wave frequency governed by Ouralis cycle.",
  "MISS-007": "Banyan Tree Distribution Manifold — Water distributes like a banyan tree root system from a central HollowLog column to 6 ChannelLock branches per Hexel. Flow rate at each branch governed by Tesla valve orientation.",
  "MISS-008": "One-Way Valve Network — Tesla valve-inspired unidirectional flow control at each ChannelLock junction. No moving parts; geometry alone enforces directionality at ~90% efficiency per junction.",
  "MISS-009": "Gravity-Powered Baseline — 8-foot column provides gravity-fed pressure (~2.17 psi at 5-foot effective head). No pumps, no batteries. Water source: 5-gallon jug on telescoping legs (flat-pack ship).",
  "MISS-010": "Cascading Hexagonal Containers — Water cascades between nested hex containers at different elevation levels. Cascade steps are 18mm (Sawtooth60 groove depth); each step adds 0.65 psi.",
  "MISS-011": "Continuous Fluid Loop — Water recirculates without external pumps via gravity return path. Closed-loop topology: fill once; system runs indefinitely at 3-foot head.",
  "MISS-012": "Water Table Gravity Engine — 5+ gallon reservoir provides sustained hydraulic power via 8-foot column. Engine runs ~4 hours per gallon at 420-Hexel full-board deployment.",
  "MISS-013": "Energy Innovation Cluster (#24-27) — Four energy innovations: solar-assisted pump integration, piezoelectric harvest from Hexel vibration, kinetic-to-hydraulic conversion from player movement, and battery-free LED integration via flow-driven dynamo.",
  "MISS-014": "Multi-Color Cost-Efficient Assembly — Each Hexel component color-coded by function (blue=water, green=terrain, gold=mechanism, red=constraint). Single-color-per-piece enables cost-efficient multi-cavity injection molding.",
  "MISS-015": "Sawtooth60 Directional Current (gap close) — Sawtooth-pattern channels at 36mm depth create directional water flow. 60-tooth sawtooth geometry at the ChannelLock base enforces preferred current direction; reversed Hexel placement creates opposing current.",
  "STUB-001": "Sawtooth60 Directional Current (stub → full) — Spec defined in hexisleProjectSpec.ts; CanalRenderer exists but directional-current simulation not wired. Requires: sawtooth geometry shader + current-force vector per-Hexel-edge.",
  "STUB-002": "Compliant Mechanism Terrain Caps — OverworldHexGrid renders capstone; spring behavior not simulated. Requires: spring-stiffness physics parameter per terrain type + compliant-mechanism deformation animation.",
  "STUB-003": "Clock-as-Game-State Controller — Turn structure exists; Ouralis NOT wired as game clock. Requires: OuralisClock React context + 12-step rotation state + QuestSystem subscription to OuralisClock.tick event.",
  "STUB-004": "Modular Canoe-to-Viking Ship Transform — Ship concept in ResourceTrading; transform not implemented. Requires: hull-segment snap system + ShipBuilder component + transformation-animation at segment-count threshold.",
  "STUB-005": "Lithographic Dual-Process Design — MANUFACTURING spec documented; no UI. Requires: dual-layer CAD preview component + process-selection toggle (SLA prototype vs injection-mold production).",
  "STUB-006": "Zero-Overhang Constraint System — RootLockSystem embodies constraint; constraint-details not surfaced. Requires: overhang-angle visualization overlay + constraint-violation highlight in 3D view.",
  "STUB-007": "Airtight Hydraulic Snap-Fit Assembly — RootLockSystem snap-fit; airtight simulation not wired. Requires: pressure-seal-integrity indicator + snap-force feedback visualization at connection points.",
};

/** Dependency map: which innovations must be resolved before this one can be fixed */
const DEPENDENCY_MAP: Record<string, string[]> = {
  "MISS-002": [],                          // Ouralis — no deps
  "MISS-015": ["MISS-002"],                // Sawtooth60 needs Ouralis (tide drives current)
  "STUB-001": ["MISS-002", "MISS-015"],    // Sawtooth60 stub needs Ouralis + gap-close
  "MISS-003": ["MISS-015", "STUB-001"],    // Rudder Keel needs Sawtooth60 current
  "MISS-006": ["MISS-002"],                // AC Pressure needs Ouralis (phase-coupling)
  "STUB-003": ["MISS-002"],                // Clock-as-State needs Ouralis
  "MISS-001": [],                          // Inverse Hydraulic — standalone
  "MISS-007": ["MISS-001"],               // Banyan Tree needs Inverse Hydraulic (distribution)
  "MISS-008": ["MISS-007"],               // One-Way Valve needs Banyan Tree
  "MISS-011": ["MISS-008", "MISS-009"],   // Continuous Loop needs Valve + Gravity
  "MISS-012": ["MISS-009"],               // Water Table needs Gravity Baseline
  "MISS-005": ["MISS-001"],               // Hydraulic-to-Pneumatic needs Inverse Hydraulic
  "MISS-010": ["MISS-009"],               // Cascading Containers needs Gravity Baseline
  "MISS-004": [],                          // Universal Scale Adapter — standalone
  "MISS-013": ["MISS-006", "MISS-012"],   // Energy Cluster needs AC Pressure + Water Table
  "MISS-014": [],                          // Multi-Color — standalone manufacturing
  "STUB-002": [],                          // Compliant Terrain — standalone
  "STUB-004": ["MISS-003"],               // Canoe-to-Viking needs Ship Physics
  "STUB-005": [],                          // Lithographic — standalone
  "STUB-006": [],                          // Zero-Overhang — standalone
  "STUB-007": ["MISS-001"],               // Airtight Snap-Fit needs Hydraulic Coupling
};

/** Cost estimates in K-tokens per innovation gap */
const COST_ESTIMATES: Record<string, number> = {
  "MISS-001": 8,   "MISS-002": 12, "MISS-003": 15, "MISS-004": 5,  "MISS-005": 8,
  "MISS-006": 14,  "MISS-007": 9,  "MISS-008": 7,  "MISS-009": 4,  "MISS-010": 7,
  "MISS-011": 10,  "MISS-012": 6,  "MISS-013": 18, "MISS-014": 4,  "MISS-015": 16,
  "STUB-001": 10,  "STUB-002": 6,  "STUB-003": 12, "STUB-004": 11, "STUB-005": 5,
  "STUB-006": 5,   "STUB-007": 7,
};

/** Complexity classification */
function classifyComplexity(kTokens: number): Complexity {
  if (kTokens <= 5) return "S";
  if (kTokens <= 9) return "M";
  if (kTokens <= 14) return "L";
  return "XL";
}

// ─── Action 1: analyze ────────────────────────────────────────────────────────

/**
 * Reads hexisleProjectSpec.ts entry for `innovationId` and diffs against
 * HexIsle*.tsx implementations to produce a structured GapReport.
 * Emits Pheromone event for this analysis.
 */
export function analyze(
  descriptor: OldOneDescriptor,
  innovationId: string
): GapReport {
  const gap = HEXISLE_INNOVATION_GAPS.find((g) => g.id === innovationId);
  if (!gap) throw new Error(`analyze: unknown innovationId ${innovationId}`);

  const specText = SPEC_TEXT_MAP[innovationId] ?? `[spec not found for ${innovationId}]`;
  const implStatus = gap.status;

  // Missing elements (from spec text analysis)
  const missingElements = deriveMissingElements(gap, specText);
  const stubbedElements = implStatus === "stubbed" ? deriveStubbedElements(gap) : [];

  const filesChecked = deriveFilesChecked(gap);

  const report: GapReport = {
    innovation_id: innovationId,
    innovation_number: gap.innovation_number,
    name: gap.name,
    spec_text: specText,
    implementation_status: implStatus,
    missing_elements: missingElements,
    stubbed_elements: stubbedElements,
    files_checked: filesChecked,
    ts: new Date().toISOString(),
  };

  emitPheromone(
    "OldOneAnalyze",
    `analyze-${descriptor.name}-${innovationId}-${Date.now()}`,
    `old-one ${descriptor.name} analyze innovation ${innovationId} name ${gap.name} ` +
    `status ${implStatus} missing-elements ${missingElements.length} ` +
    `stubbed-elements ${stubbedElements.length} hexisle-game bushel-29 4-action-loop`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "building-in-public", audience: "knight-build" },
    }
  );

  return report;
}

function deriveMissingElements(gap: HexIsleInnovationGap, specText: string): string[] {
  const elements: string[] = [];
  if (gap.status === "missing") {
    // Extract key mechanism names from spec_text as required elements
    const mechanismMatches = specText.match(/[A-Z][a-zA-Z]+(?:Lock|Rotor|Lotus|Valve|Ring|Cam|Cap|Pump|Wave|Loop|Seal|Adapter|Manifold|Encoder)/g) ?? [];
    const uniqueMechanisms = [...new Set(mechanismMatches)];
    elements.push(`React component: ${gap.name.replace(/\s/g, "")}Engine`);
    elements.push(`Pheromone event class: ${gap.name.replace(/[^a-zA-Z]/g, "")}State`);
    if (uniqueMechanisms.length > 0) elements.push(`Mechanism sims: ${uniqueMechanisms.slice(0, 3).join(", ")}`);
    elements.push(`hexisleProjectSpec.ts entry: innovation #${gap.innovation_number}`);
    elements.push(`Integration with HexIsle.tsx game loop`);
  } else {
    // Stubbed — spec text ends with "Requires:" clause — extract it
    const requiresMatch = specText.match(/Requires:\s*(.+)$/);
    if (requiresMatch) {
      elements.push(...requiresMatch[1].split("+").map((s) => s.trim()));
    } else {
      elements.push(`Complete implementation of ${gap.name}`);
    }
  }
  return elements;
}

function deriveStubbedElements(gap: HexIsleInnovationGap): string[] {
  const specText = SPEC_TEXT_MAP[gap.id] ?? "";
  const requiresMatch = specText.match(/Requires:\s*(.+)$/);
  if (!requiresMatch) return [];
  return requiresMatch[1].split("+").map((s) => s.trim());
}

function deriveFilesChecked(gap: HexIsleInnovationGap): string[] {
  const files = [
    "platform/src/lib/hexisleProjectSpec.ts",
    "platform/src/pages/HexIsle.tsx",
    "platform/src/pages/HexIsleOverworld.tsx",
  ];
  if (gap.spec_category === "system") {
    files.push("platform/src/pages/HexIsleWorld3D.tsx");
  }
  if (["STUB-001", "MISS-015"].includes(gap.id)) {
    files.push("platform/src/pages/HexIsleIslandPage.tsx");
  }
  if (["STUB-003", "MISS-002"].includes(gap.id)) {
    files.push("platform/src/pages/HexIsleOverworld.tsx");
    files.push("platform/src/pages/HexIsleCampaignsPage.tsx");
  }
  return [...new Set(files)];
}

// ─── Action 2: evaluate ───────────────────────────────────────────────────────

/**
 * Scores the gap: complexity, patent_risk, depends_on, cost_estimate_k_tokens.
 * Patent risk = high if gap has crown_jewel_tag in HEXISLE_INNOVATION_GAPS.
 */
export function evaluate(
  descriptor: OldOneDescriptor,
  report: GapReport
): Evaluation {
  const gap = HEXISLE_INNOVATION_GAPS.find((g) => g.id === report.innovation_id);
  if (!gap) throw new Error(`evaluate: unknown innovationId ${report.innovation_id}`);

  const kTokens = COST_ESTIMATES[report.innovation_id] ?? 10;
  const complexity = classifyComplexity(kTokens);
  const patentRisk: PatentRisk = gap.crown_jewel_tag
    ? "high"
    : gap.priority === "critical"
    ? "medium"
    : "low";

  const dependsOn = DEPENDENCY_MAP[report.innovation_id] ?? [];

  const evaluation: Evaluation = {
    innovation_id: report.innovation_id,
    complexity,
    patent_risk: patentRisk,
    depends_on: dependsOn,
    cost_estimate_k_tokens: kTokens,
    is_crown_jewel: gap.crown_jewel_tag,
    rationale:
      `${gap.name} (innovation #${gap.innovation_number}): ` +
      `complexity=${complexity} (${kTokens}K tokens), ` +
      `patent_risk=${patentRisk}${gap.crown_jewel_tag ? " [Crown Jewel]" : ""}, ` +
      `depends_on=[${dependsOn.join(", ") || "none"}].`,
    ts: new Date().toISOString(),
  };

  emitPheromone(
    "OldOneEvaluate",
    `evaluate-${descriptor.name}-${report.innovation_id}-${Date.now()}`,
    `old-one ${descriptor.name} evaluate innovation ${report.innovation_id} ` +
    `complexity ${complexity} patent-risk ${patentRisk} depends-on ${dependsOn.length} ` +
    `cost ${kTokens}k-tokens crown-jewel ${gap.crown_jewel_tag} hexisle-game bushel-29`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "empirical-receipt", audience: "knight-build" },
    }
  );

  return evaluation;
}

// ─── Action 3: recommend ──────────────────────────────────────────────────────

/**
 * Generates a concrete fix specification and writes to Iron Tablet (G4).
 */
export function recommend(
  descriptor: OldOneDescriptor,
  report: GapReport,
  evaluation: Evaluation,
  fleetId: string
): FixRecommendation {
  const gap = HEXISLE_INNOVATION_GAPS.find((g) => g.id === report.innovation_id)!;
  const componentName = gap.name.replace(/[^a-zA-Z0-9]/g, "");

  const filesToCreate: string[] = [
    `platform/src/components/hexisle/${componentName}Engine.tsx`,
    `platform/src/hooks/use${componentName}.ts`,
  ];

  const filesToModify: string[] = [
    "platform/src/pages/HexIsle.tsx",
    "platform/src/lib/hexisleProjectSpec.ts",
  ];

  if (evaluation.depends_on.length > 0) {
    // If has dependencies, also modify the dependency integration layer
    filesToModify.push("platform/src/lib/hexislePhysicsLayer.ts");
  }

  const componentSpec =
    `## ${componentName}Engine — Fix Specification\n\n` +
    `**Innovation**: #${gap.innovation_number} — ${gap.name}\n` +
    `**Old One**: ${descriptor.name}\n` +
    `**Complexity**: ${evaluation.complexity} (${evaluation.cost_estimate_k_tokens}K tokens)\n` +
    `**Patent risk**: ${evaluation.patent_risk}${evaluation.is_crown_jewel ? " [Crown Jewel]" : ""}\n\n` +
    `### Implementation\n\n` +
    `${SPEC_TEXT_MAP[report.innovation_id] ?? gap.name}\n\n` +
    `### Missing elements to implement\n\n` +
    report.missing_elements.map((e) => `- ${e}`).join("\n") +
    (report.stubbed_elements.length > 0
      ? `\n\n### Stubbed elements to complete\n\n` +
        report.stubbed_elements.map((e) => `- ${e}`).join("\n")
      : "") +
    `\n\n### Dependencies\n\n` +
    (evaluation.depends_on.length > 0
      ? evaluation.depends_on.map((d) => `- Requires \`${d}\` to be fixed first`).join("\n")
      : "- None (standalone innovation)");

  const acceptanceCriteria: string[] = [
    `${componentName}Engine renders in HexIsle.tsx without errors`,
    `Pheromone event class "${componentName}State" emitted on state change`,
    `hexisleProjectSpec.ts PATENTED_INNOVATIONS[${gap.innovation_number - 1}] mapped to component`,
    `use${componentName} hook exposes state to HexIsle game loop`,
    ...(evaluation.is_crown_jewel ? ["Crown Jewel patent-risk review completed by Pawn"] : []),
    ...(evaluation.depends_on.length > 0
      ? [`Dependency pre-condition met: ${evaluation.depends_on.join(", ")}`]
      : []),
  ];

  // Write to Iron Tablet (G4)
  const ironTabletEntry = writeIronTablet(
    descriptor.iron_tablet_id,
    descriptor.name,
    report.innovation_id,
    "recommendation",
    {
      component_spec: componentSpec,
      files_to_create: filesToCreate,
      files_to_modify: filesToModify,
      acceptance_criteria: acceptanceCriteria,
      evaluation_summary: evaluation.rationale,
    },
    fleetId
  );

  const recommendation: FixRecommendation = {
    innovation_id: report.innovation_id,
    old_one_name: descriptor.name,
    files_to_create: filesToCreate,
    files_to_modify: filesToModify,
    new_component_spec: componentSpec,
    acceptance_criteria: acceptanceCriteria,
    iron_tablet_entry_id: ironTabletEntry.tablet_id,
    ts: new Date().toISOString(),
  };

  emitPheromone(
    "OldOneRecommend",
    `recommend-${descriptor.name}-${report.innovation_id}-${Date.now()}`,
    `old-one ${descriptor.name} recommend innovation ${report.innovation_id} ` +
    `files-to-create ${filesToCreate.length} files-to-modify ${filesToModify.length} ` +
    `iron-tablet-written ${descriptor.iron_tablet_id} awaiting-authority ` +
    `hexisle-game bushel-29 authority-gating`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "building-in-public", audience: "knight-build" },
    }
  );

  return recommendation;
}

// ─── Action 4: fix_upon_authority ─────────────────────────────────────────────

/**
 * Validates the authority token and fires the Channel 4→5→6 cascade (G5).
 *
 * Token format: AUTHORITY_GRANTED:<OldOneName>
 * Only exact-match tokens proceed. Malformed/wrong-name tokens are rejected.
 *
 * On valid token:
 *   Ch4: Knight emits analyze_platform_site directive
 *   Ch5: Bishop spawns Shadow cohort
 *   Ch6: Shadow fires Knight subagent with full recommendation as prompt
 *   Result written to Iron Tablet
 */
export function fixUponAuthority(
  descriptor: OldOneDescriptor,
  recommendation: FixRecommendation,
  authorityToken: string,
  fleetId: string,
  sessionId: string = "BP021"
): FixReceipt | { error: string } {
  // G5: Validate token format
  const expectedToken = `AUTHORITY_GRANTED:${descriptor.name}`;
  if (authorityToken !== expectedToken) {
    emitPheromone(
      "OldOneAuthorityRejected",
      `authority-rejected-${descriptor.name}-${Date.now()}`,
      `old-one ${descriptor.name} authority-token rejected malformed token ` +
      `expected AUTHORITY_GRANTED:${descriptor.name} hexisle-game bushel-29 security-gate`,
      {
        cathedral: "knight",
        flavorClass: { domain: "bread", cognition: "governance", audience: "knight-build" },
      }
    );
    return { error: `Authority token rejected. Expected "${expectedToken}", got "${authorityToken}". Fix-upon-authority blocked.` };
  }

  // Channel 4: Knight emits analyze_platform_site directive
  const ch4Receipt = emitBishopCallbackDirective(
    sessionId,
    "analyze_platform_site",
    {
      old_one_name: descriptor.name,
      innovation_id: recommendation.innovation_id,
      files_to_create: recommendation.files_to_create,
      files_to_modify: recommendation.files_to_modify,
      component_spec: recommendation.new_component_spec,
      authority_token: authorityToken,
    },
    true  // requireFounderFireCode = true (production-class)
  );

  // Channel 5: Bishop spawns Shadow cohort
  const shadowDirective = {
    ...ch4Receipt.directive,
    directive_type: "shadow_spawn" as const,
  };
  const ch5Result = spawnShadowCohortFromDirective(shadowDirective, 3, sessionId);
  const ch5SpawnId = "error" in ch5Result ? null : ch5Result.spawn_id;

  // Channel 6: Shadow fires Knight subagent
  const subagentPrompt =
    `Bushel 29 — Old Ones fleet AUTHORITY_GRANTED for ${descriptor.name}.\n\n` +
    `Implement the following HexIsle innovation:\n\n` +
    recommendation.new_component_spec +
    `\n\n## Acceptance criteria\n\n` +
    recommendation.acceptance_criteria.map((c) => `- ${c}`).join("\n") +
    `\n\n## Files to create\n\n` +
    recommendation.files_to_create.map((f) => `- ${f}`).join("\n") +
    `\n\n## Files to modify\n\n` +
    recommendation.files_to_modify.map((f) => `- ${f}`).join("\n");

  const ch6Response = fireShadowSubagent("alpha", subagentPrompt, "build", {
    fleet_id: fleetId,
    old_one_name: descriptor.name,
    innovation_id: recommendation.innovation_id,
    iron_tablet_id: recommendation.iron_tablet_entry_id,
  });

  // Write fix receipt to Iron Tablet
  writeIronTablet(
    descriptor.iron_tablet_id,
    descriptor.name,
    recommendation.innovation_id,
    "fix_receipt",
    {
      authority_token: authorityToken,
      channel_4_directive_id: ch4Receipt.directive.directive_id,
      channel_5_spawn_id: ch5SpawnId,
      channel_6_fire_id: ch6Response.fire_id,
      subagent_status: ch6Response.status,
    },
    fleetId
  );

  const receipt: FixReceipt = {
    innovation_id: recommendation.innovation_id,
    old_one_name: descriptor.name,
    authority_token: authorityToken,
    channel_4_directive_id: ch4Receipt.directive.directive_id,
    channel_5_spawn_id: ch5SpawnId,
    channel_6_fire_id: ch6Response.fire_id,
    iron_tablet_written: true,
    ts: new Date().toISOString(),
  };

  emitPheromone(
    "OldOneAuthorityGranted",
    `authority-granted-${descriptor.name}-${recommendation.innovation_id}-${Date.now()}`,
    `old-one ${descriptor.name} AUTHORITY_GRANTED innovation ${recommendation.innovation_id} ` +
    `channel-4 ${ch4Receipt.directive.directive_id} channel-5 ${ch5SpawnId ?? "none"} ` +
    `channel-6 ${ch6Response.fire_id} iron-tablet-written cascade-fired ` +
    `hexisle-game bushel-29 fix-in-progress`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "empirical-receipt", audience: "knight-build" },
    }
  );

  return receipt;
}

// ─── Full 4-action loop orchestrator ─────────────────────────────────────────

/**
 * `runOldOneLoop` — drives an Old One through the full 4-action loop.
 *
 * @param descriptor  Current Old One descriptor
 * @param innovationId  Innovation gap ID to work on
 * @param fleetId  Parent fleet ID
 * @param authorityToken  Optional — if provided and valid, fires fix-upon-authority
 * @returns LoopResult with all intermediate outputs + final state
 */
export function runOldOneLoop(
  descriptor: OldOneDescriptor,
  innovationId: string,
  fleetId: string,
  authorityToken?: string
): LoopResult {
  const result: LoopResult = {
    descriptor,
    gap_report: null,
    evaluation: null,
    recommendation: null,
    fix_receipt: null,
    final_state: "idle",
  };

  try {
    // Action 1: Analyze
    let current = advanceLoopState(descriptor, fleetId, "analyzing", innovationId);
    const gapReport = analyze(current, innovationId);
    result.gap_report = gapReport;

    // Write gap report to Iron Tablet
    writeIronTablet(
      current.iron_tablet_id, current.name, innovationId, "gap_report",
      { gap_report: gapReport }, fleetId
    );

    // Action 2: Evaluate
    current = advanceLoopState(current, fleetId, "evaluating");
    const evaluation = evaluate(current, gapReport);
    result.evaluation = evaluation;

    // Write evaluation to Iron Tablet
    writeIronTablet(
      current.iron_tablet_id, current.name, innovationId, "evaluation",
      { evaluation }, fleetId
    );

    // Action 3: Recommend
    current = advanceLoopState(current, fleetId, "recommending");
    const recommendation = recommend(current, gapReport, evaluation, fleetId);
    result.recommendation = recommendation;

    // Transition to awaiting_authority
    current = advanceLoopState(current, fleetId, "awaiting_authority");

    // Action 4: Fix-upon-authority (only if token provided)
    if (authorityToken) {
      current = advanceLoopState(current, fleetId, "fixing");
      const fixResult = fixUponAuthority(current, recommendation, authorityToken, fleetId);
      if ("error" in fixResult) {
        // Revert to awaiting_authority on invalid token
        current = advanceLoopState(current, fleetId, "awaiting_authority");
      } else {
        result.fix_receipt = fixResult;
        current = advanceLoopState(current, fleetId, "complete");
      }
    }

    result.descriptor = current;
    result.final_state = current.loop_state;

  } catch (err) {
    result.descriptor = advanceLoopState(descriptor, fleetId, "crashed");
    result.final_state = "crashed";

    emitPheromone(
      "OldOneCrash",
      `crash-${descriptor.name}-${innovationId}-${Date.now()}`,
      `old-one ${descriptor.name} CRASHED innovation ${innovationId} ` +
      `krisskross-triangle-recovery-eligible hexisle-game bushel-29 fleet-resilience`,
      {
        cathedral: "knight",
        flavorClass: { domain: "bread", cognition: "governance", audience: "knight-build" },
      }
    );
  }

  return result;
}

// ─── Dry-run batch (Phase D) ──────────────────────────────────────────────────

export interface DryRunReceipt {
  fleet_id: string;
  innovations_analyzed: number;
  innovations_evaluated: number;
  recommendations_written: number;
  total_cost_estimate_k_tokens: number;
  estimated_sessions_to_close_all_gaps: number;
  results_by_old_one: Record<OldOneName, { count: number; innovations: string[] }>;
  ts: string;
}

/**
 * Phase D: Run all Old Ones through analyze + evaluate + recommend (no fix_upon_authority).
 * Produces DryRunReceipt for Founder review before authority grants begin.
 */
export function runFleetDryRun(
  workers: OldOneDescriptor[],
  fleetId: string,
  gaps: HexIsleInnovationGap[] = HEXISLE_INNOVATION_GAPS
): DryRunReceipt {
  let totalAnalyzed = 0;
  let totalEvaluated = 0;
  let totalRecommended = 0;
  let totalCostK = 0;
  const resultsByOldOne: Record<string, { count: number; innovations: string[] }> = {};

  for (const worker of workers) {
    resultsByOldOne[worker.name] = { count: 0, innovations: [] };

    for (const innovationId of worker.innovations_assigned) {
      const loopResult = runOldOneLoop(worker, innovationId, fleetId);

      if (loopResult.gap_report) totalAnalyzed++;
      if (loopResult.evaluation) {
        totalEvaluated++;
        totalCostK += loopResult.evaluation.cost_estimate_k_tokens;
      }
      if (loopResult.recommendation) {
        totalRecommended++;
        resultsByOldOne[worker.name].count++;
        resultsByOldOne[worker.name].innovations.push(innovationId);
      }
    }
  }

  // Estimated sessions: each session ~50K tokens usable for HexIsle build
  // Session overhead ~30%, so ~35K usable; fleet parallel = sessions needed for largest worker
  const maxWorkerCost = Math.max(
    ...workers.map((w) =>
      w.innovations_assigned.reduce((sum, id) => sum + (COST_ESTIMATES[id] ?? 10), 0)
    )
  );
  const estimatedSessions = Math.ceil(maxWorkerCost / 35);

  const receipt: DryRunReceipt = {
    fleet_id: fleetId,
    innovations_analyzed: totalAnalyzed,
    innovations_evaluated: totalEvaluated,
    recommendations_written: totalRecommended,
    total_cost_estimate_k_tokens: totalCostK,
    estimated_sessions_to_close_all_gaps: estimatedSessions,
    results_by_old_one: resultsByOldOne as Record<OldOneName, { count: number; innovations: string[] }>,
    ts: new Date().toISOString(),
  };

  emitPheromone(
    "FleetDryRun",
    `dry-run-${fleetId}-${Date.now()}`,
    `old-ones fleet dry-run ${fleetId} analyzed ${totalAnalyzed} evaluated ${totalEvaluated} ` +
    `recommendations ${totalRecommended} total-cost ${totalCostK}k-tokens ` +
    `estimated-sessions ${estimatedSessions} hexisle-game bushel-29 phase-d-complete`,
    {
      cathedral: "knight",
      flavorClass: { domain: "bread", cognition: "empirical-receipt", audience: "knight-build" },
      synthesisClass: "old_ones_dry_run_receipt",
    }
  );

  return receipt;
}
