/**
 * Excalibur Slice Pipeline — KN105 / BP016
 * ==========================================
 * Per-topic / per-category Scribe-distillation pipeline.
 * Consumes KN104 TEAM dispatcher Detective + Miner output to build Excalibur slices.
 *
 * Flow:
 *   1. Accept a topic/category claim
 *   2. Run TEAM dispatch (Detectives + Miners) on the claim
 *   3. Aggregate the TEAM findings into a Scribe slice candidate
 *   4. Evaluate all 4 Excalibur tag-assignment gates
 *   5. If all gates pass: mark slice as "excalibur_class"; otherwise "raw_federation_library"
 *   6. Calculate pricing + member share-back
 *   7. Store slice record for subscription management
 */

import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { evaluateExcaliburGates, DEFAULT_GATE_THRESHOLDS } from "./tag_assignment_gates.js";
import { buildSlicePricing, normalizeContributionProportions } from "./pricing_engine.js";
import type {
  ExcaliburSlice,
  ExcaliburTagGates,
  MemberContribution,
  ExcaliburGranularity,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STITCHPUNKS_DIR =
  process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");

const EXCALIBUR_DIR = resolve(STITCHPUNKS_DIR, "excalibur_class");
const SLICES_PATH = resolve(EXCALIBUR_DIR, "slices.jsonl");

// ─── Storage ──────────────────────────────────────────────────────────────

function ensureDir(): void {
  if (!existsSync(EXCALIBUR_DIR)) mkdirSync(EXCALIBUR_DIR, { recursive: true });
}

function persistSlice(slice: ExcaliburSlice): void {
  ensureDir();
  writeFileSync(SLICES_PATH, JSON.stringify(slice) + "\n", { flag: "a", encoding: "utf-8" });
}

function readAllSlices(): ExcaliburSlice[] {
  ensureDir();
  if (!existsSync(SLICES_PATH)) return [];
  const lines = readFileSync(SLICES_PATH, "utf-8").split("\n").filter(l => l.trim());
  const byId = new Map<string, ExcaliburSlice>();
  for (const line of lines) {
    try {
      const slice = JSON.parse(line) as ExcaliburSlice;
      byId.set(slice.id, slice);
    } catch {
      continue;
    }
  }
  return Array.from(byId.values());
}

// ─── Slice Creation ────────────────────────────────────────────────────────

export interface CreateSliceParams {
  name: string;
  granularity: ExcaliburGranularity;
  topics_included: string[];
  contributing_members: MemberContribution[];
  initial_gate_results?: Partial<ExcaliburTagGates>;
  total_eligible_voters?: number;
  m_share_override?: number;
}

/**
 * Creates a new Excalibur Slice candidate.
 * Status is "proposed" until all gates are evaluated.
 */
export function createExcaliburSlice(params: CreateSliceParams): ExcaliburSlice {
  const normalizedMembers = normalizeContributionProportions(params.contributing_members);

  const defaultGates: ExcaliburTagGates = {
    cathedral_effect_verification: { passed: false, lift_pp: 0 },
    furnace_gate: { passed: false, verification_score: 0 },
    adversarial_fence_testing: { passed: false, probes_passed: 0, probes_total: 0 },
    federation_member_vote: { yes_count: 0, no_count: 0, quorum_met: false, threshold_met: false },
    ...params.initial_gate_results,
  };

  const pricing = buildSlicePricing(
    {
      granularity: params.granularity,
      contributing_members: normalizedMembers,
      topics_included: params.topics_included,
    },
    params.m_share_override,
  );

  const slice: ExcaliburSlice = {
    id: randomUUID(),
    granularity: params.granularity,
    name: params.name,
    topics_included: params.topics_included,
    contributing_members: normalizedMembers,
    excalibur_tag_assigned: false,
    tag_assignment_at: null,
    tag_assignment_gates: defaultGates,
    pricing,
    status: "proposed",
  };

  persistSlice(slice);
  return slice;
}

// ─── Gate Evaluation & Tag Assignment ─────────────────────────────────────

/**
 * Evaluates all 4 gates for a slice and updates its status.
 * BRIDLE Rule 4: ambiguous → NOT assigning tag.
 */
export function evaluateAndTagSlice(
  sliceId: string,
  gateResults: ExcaliburTagGates,
  totalEligibleVoters: number = 1,
): ExcaliburSlice {
  const slices = readAllSlices();
  const slice = slices.find(s => s.id === sliceId);
  if (!slice) throw new Error(`Excalibur slice ${sliceId} not found`);

  const evaluation = evaluateExcaliburGates(gateResults, DEFAULT_GATE_THRESHOLDS, totalEligibleVoters);

  const now = new Date().toISOString();
  const updated: ExcaliburSlice = {
    ...slice,
    tag_assignment_gates: gateResults,
    excalibur_tag_assigned: evaluation.all_passed,
    tag_assignment_at: evaluation.all_passed ? now : null,
    status: evaluation.recommended_status,
  };

  // Recalculate pricing with current contributors
  updated.pricing = buildSlicePricing(updated);

  persistSlice(updated);
  return updated;
}

// ─── Query API ────────────────────────────────────────────────────────────

export function getSliceById(sliceId: string): ExcaliburSlice | null {
  return readAllSlices().find(s => s.id === sliceId) ?? null;
}

export function getSliceByName(name: string): ExcaliburSlice | null {
  return readAllSlices().find(s => s.name === name) ?? null;
}

export function listExcaliburClassSlices(): ExcaliburSlice[] {
  return readAllSlices().filter(s => s.status === "excalibur_class");
}

export function listAllSlices(): ExcaliburSlice[] {
  return readAllSlices();
}

/** Records a Federation member vote on a slice. Re-evaluates gates after vote. */
export function recordMemberVote(
  sliceId: string,
  vote: "yes" | "no",
  totalEligibleVoters: number,
): ExcaliburSlice {
  const slice = getSliceById(sliceId);
  if (!slice) throw new Error(`Excalibur slice ${sliceId} not found`);

  const updatedGates: ExcaliburTagGates = {
    ...slice.tag_assignment_gates,
    federation_member_vote: {
      yes_count: slice.tag_assignment_gates.federation_member_vote.yes_count + (vote === "yes" ? 1 : 0),
      no_count: slice.tag_assignment_gates.federation_member_vote.no_count + (vote === "no" ? 1 : 0),
      quorum_met: false,  // recalculated in evaluateAndTagSlice
      threshold_met: false,
    },
  };

  return evaluateAndTagSlice(sliceId, updatedGates, totalEligibleVoters);
}
