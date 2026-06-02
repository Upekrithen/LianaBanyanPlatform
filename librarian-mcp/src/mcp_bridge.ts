/**
 * mcp_bridge.ts — MoneyPenny MCP Bridge (Gates J + M)
 * =====================================================
 * Routing gates for the MoneyPenny Smart Router.
 * Each gate takes a task description and returns relevant context
 * for its routing class, enabling the briefing system to inject
 * pod-specific tool lists, key concepts, and FORK constraints.
 *
 * Gate J: House Scribe (KN-J1–J6) — Jar of Honey lifecycle,
 *         8-digit coordinates, living-gridwork, cross-cathedral routing.
 * Gate M: Forever-Stamp Joules (KN-M1–M3) — minting, transfer,
 *         redemption, and audit of the Layer 7 currency.
 *
 * Pattern: Each gate is a pure routing function —
 *   input:  task description string
 *   output: GateContext | null (null = gate does not activate)
 *
 * Existing gates A–I and L follow this same interface pattern
 * (A: schema/tables, B: edge functions, C: detective/pheromone,
 *  D: apiarist hive, E: Wrasse registry, F: phase-F logger,
 *  G: catechist/grader, H: bounty/marks, I: reminder scribe,
 *  L: strata/keyword-pyramid).
 *
 * BP071 Knight audit — 2026-06-02
 */

import type { BriefingPackage } from "./types.js";

// ─── Shared gate interface ────────────────────────────────────────────────────

export interface GateContext {
  gate: string;
  pod: string;
  description: string;
  tools: string[];
  key_concepts: string[];
  fork_constraints: string[];
}

// ─── Gate J: House Scribe ─────────────────────────────────────────────────────

/**
 * Keywords that signal House Scribe (KN-J) involvement.
 * Covers: jar lifecycle, coordinate scheme, living-gridwork, bee-canon.
 */
const GATE_J_KEYWORDS: string[] = [
  "jar", "jars", "honey", "seal", "sealed", "coordinate", "coordinates",
  "grid", "gridwork", "living", "house_scribe", "house scribe", "hive",
  "thread_closed", "federation_translation", "cross_cathedral",
  "bee", "bee-canon", "queen bee", "worker bee", "drone bee", "jar_lifecycle",
  "crate_jar", "create_jar", "assign_coordinate", "seal_jar", "query_jar",
  "cell_event", "living_cell", "hive_thread", "bee-marks", "bee canon",
];

export interface GateJContext extends GateContext {
  gate: "J";
  pod: "KN-J";
}

/**
 * Gate J — House Scribe routing gate.
 *
 * Activates when a task involves Jar of Honey operations, 8-digit coordinate
 * assignment, living-gridwork queries, or bee-canon Marks attribution.
 * Returns null when the task does not involve House Scribe operations.
 */
export function runGateJ(task: string): GateJContext | null {
  const lower = task.toLowerCase();
  const matched = GATE_J_KEYWORDS.some((kw) => lower.includes(kw));
  if (!matched) return null;

  return {
    gate: "J",
    pod: "KN-J",
    description:
      "House Scribe — Jar of Honey lifecycle, 8-digit coordinate grid, " +
      "living-gridwork Pheromone events, cross-cathedral routing, bee-canon Marks attribution.",
    tools: [
      "house_scribe_create_jar",
      "house_scribe_assign_coordinate",
      "house_scribe_seal_jar",
      "house_scribe_query_jars",
      "house_scribe_population_audit",
      "house_scribe_cell_event",
      "house_scribe_living_cell_query",
      "house_scribe_living_gridwork_snapshot",
      "house_scribe_reconcile_cell_state",
      "house_scribe_hive_thread_closed",
      "house_scribe_hive_jar_status",
      "house_scribe_query_jars_cross_cathedral",
      "house_scribe_cross_cathedral_cache_invalidate",
      "house_scribe_cross_cathedral_provenance",
    ],
    key_concepts: [
      "Jar lifecycle: created → indexed → sealed → retrievable (STRUCTURALLY-IMMUTABLE after seal)",
      "8-digit coordinate: NN-NN-NN-NN (cathedral × tier × flavor-class × jar-slot)",
      "Cell capacity: 100 Jars per cell; overflow triggers Swarming — daughter-cell spawned",
      "Bee-canon Marks: Workers/Drones pro-rata; Queen 1.5×; Project-cohort GREATER% 1.25×",
      "Living gridwork: cell living=true while Pheromone events flow (window: 60s default)",
      "Cross-cathedral routing: cohort must be ≥ federation_member for full cross-cathedral access",
      "BRIDLE Rule 4: incomplete synthesis halts Jar creation; halt flagged for Queen review",
    ],
    fork_constraints: [
      "Jar seal is FOREVER — no mutation after sealing (FORK doctrine, KN-J1)",
      "Marks-attribution NEVER bridges to fiat (FORK doctrine)",
      "BRIDLE Rule 4: incomplete synthesis halts creation; never silently proceeds",
      "Lone wolf: own-cathedral only; federation_member required for cross-cathedral queries",
    ],
  };
}

// ─── Gate M: Forever-Stamp Joules ────────────────────────────────────────────

/**
 * Keywords that signal Joules / Forever-Stamp currency (KN-M) involvement.
 * Covers: mint, transfer, redeem, audit, face_value, Marks-to-Joule conversion.
 */
const GATE_M_KEYWORDS: string[] = [
  "joule", "joules", "forever-stamp", "forever stamp", "mint", "minting",
  "minted", "redeem", "redemption", "redeemed", "transfer joule",
  "face_value", "face value", "marks_surplus", "marks surplus",
  "backing_rule", "backing rule", "in-circulation", "in circulation",
  "layer 7", "layer7", "joules_mint", "joules_transfer", "joules_redeem",
  "joules_audit", "joules_balance", "civilization-class work",
  "civilization class", "forever stamp joule",
];

export interface GateMContext extends GateContext {
  gate: "M";
  pod: "KN-M";
}

/**
 * Gate M — Forever-Stamp Joules routing gate.
 *
 * Activates when a task involves minting Joules from Marks-surplus,
 * transferring Joules between members, redeeming against civilization-class
 * work targets, or auditing the Joules ledger.
 * Returns null when the task does not involve Joules operations.
 */
export function runGateM(task: string): GateMContext | null {
  const lower = task.toLowerCase();
  const matched = GATE_M_KEYWORDS.some((kw) => lower.includes(kw));
  if (!matched) return null;

  return {
    gate: "M",
    pod: "KN-M",
    description:
      "Forever-Stamp Joules — Layer 7 Majesty incentive currency. " +
      "Mint from Marks-surplus, transfer between members, redeem against " +
      "civilization-class work targets. face_value is immutable (forever-stamp semantics).",
    tools: [
      "joules_mint",
      "joules_transfer",
      "joules_redeem",
      "joules_audit",
    ],
    key_concepts: [
      "face_value IMMUTABLE once minted — forever-stamp semantics (KN-M1)",
      "Marks consumed are ONE-WAY VALVE — never recoverable as Marks after minting",
      "Default mint rate: 1 Joule per 100 Marks-surplus (configurable via Gold tablet)",
      "backing_rule_id cites the Gold tablet (Pod-N) canonicalizing the conversion rate",
      "Redemption removes Joule from circulation permanently — irreversible",
      "Joules are Majesty incentive currency — reserved for civilization-class work targets",
      "HMAC provenance: every ledger entry is cryptographically signed (KN-M2)",
    ],
    fork_constraints: [
      "FORK doctrine: Joules are Marks-class ONLY — no fiat bridge (structural absence)",
      "face_value is IMMUTABLE after minting — forever-stamp semantics cannot be altered",
      "Redemption is permanent — Joule removed from circulation forever, no reversal",
      "cash_out_joules_to_fiat DOES NOT EXIST in this codebase (structural absence)",
    ],
  };
}

// ─── Bridge Aggregator ────────────────────────────────────────────────────────

/** Union type of all bridge gate contexts. */
export type BridgeGateContext = GateJContext | GateMContext;

/**
 * Run all MoneyPenny MCP bridge gates for a task description.
 * Returns an array of activated gate contexts (empty if no gates match).
 *
 * @param task  Natural-language task description passed to the MoneyPenny router.
 */
export function runMcpBridgeGates(task: string): BridgeGateContext[] {
  const gates: BridgeGateContext[] = [];

  const gateJ = runGateJ(task);
  if (gateJ) gates.push(gateJ);

  const gateM = runGateM(task);
  if (gateM) gates.push(gateM);

  return gates;
}

/**
 * Augment a BriefingPackage with active MCP bridge gate context.
 *
 * Called from `moneyPennyRouter.buildBriefing()` when pod-specific
 * routing context should be appended to the briefing package.
 * Returns the same object reference when no gates activate.
 */
export function augmentBriefingWithGates(
  pkg: BriefingPackage,
  task: string,
): BriefingPackage & { gateContext?: BridgeGateContext[] } {
  const gateContext = runMcpBridgeGates(task);
  if (gateContext.length === 0) return pkg;
  return { ...pkg, gateContext };
}
