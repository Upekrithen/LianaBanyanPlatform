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
import type { ExcaliburSlice, ExcaliburTagGates, MemberContribution, ExcaliburGranularity } from "./types.js";
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
export declare function createExcaliburSlice(params: CreateSliceParams): ExcaliburSlice;
/**
 * Evaluates all 4 gates for a slice and updates its status.
 * BRIDLE Rule 4: ambiguous → NOT assigning tag.
 */
export declare function evaluateAndTagSlice(sliceId: string, gateResults: ExcaliburTagGates, totalEligibleVoters?: number): ExcaliburSlice;
export declare function getSliceById(sliceId: string): ExcaliburSlice | null;
export declare function getSliceByName(name: string): ExcaliburSlice | null;
export declare function listExcaliburClassSlices(): ExcaliburSlice[];
export declare function listAllSlices(): ExcaliburSlice[];
/** Records a Federation member vote on a slice. Re-evaluates gates after vote. */
export declare function recordMemberVote(sliceId: string, vote: "yes" | "no", totalEligibleVoters: number): ExcaliburSlice;
