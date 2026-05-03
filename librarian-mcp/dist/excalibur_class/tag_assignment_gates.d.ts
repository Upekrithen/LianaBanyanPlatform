/**
 * Excalibur Tag Assignment Gates — KN105 / BP016
 * ================================================
 * A Scribe slice earns the Excalibur tag ONLY if ALL 4 gates pass:
 *
 *   Gate 1: Cathedral Effect cross-vendor verification — lift ≥ +30pp (configurable)
 *   Gate 2: Furnace gear-tooth-fit verification — slice engages cleanly with Wrasse Registry
 *   Gate 3: Adversarial Fence Testing — slice holds under probe (per BP015 protocol)
 *   Gate 4: Federation member-vote — quorum + approval threshold met
 *
 * BRIDLE Rule 4: if gate results ambiguous (e.g., Cathedral Effect lift 28pp vs 30pp threshold),
 * default to NOT assigning tag. Conservative. Only the worthy wield Excalibur.
 *
 * Slices that fail any gate stay as "raw Federation Library" — NOT "Excalibur Class".
 */
import type { ExcaliburTagGates, ExcaliburSlice } from "./types.js";
export interface GateThresholds {
    cathedral_effect_min_lift_pp: number;
    furnace_min_verification_score: number;
    adversarial_fence_min_pass_rate: number;
    federation_vote_quorum: number;
    federation_vote_approval_threshold: number;
}
export declare const DEFAULT_GATE_THRESHOLDS: GateThresholds;
export interface GateEvaluationResult {
    all_passed: boolean;
    gates: {
        cathedral_effect: {
            passed: boolean;
            lift_pp: number;
            threshold: number;
            note: string;
        };
        furnace: {
            passed: boolean;
            score: number;
            threshold: number;
            note: string;
        };
        adversarial_fence: {
            passed: boolean;
            pass_rate: number;
            threshold: number;
            note: string;
        };
        federation_vote: {
            passed: boolean;
            quorum_met: boolean;
            threshold_met: boolean;
            note: string;
        };
    };
    bridle_note: string;
    recommended_status: ExcaliburSlice["status"];
}
/**
 * Evaluates all 4 Excalibur tag-assignment gates for a slice.
 * BRIDLE Rule 4: ambiguous (borderline) results default to FAIL.
 */
export declare function evaluateExcaliburGates(gates: ExcaliburTagGates, thresholds?: GateThresholds, totalEligibleVoters?: number): GateEvaluationResult;
/**
 * Checks if a specific gate has passed for a slice.
 * Used for incremental gate evaluation (e.g., after each vote).
 */
export declare function checkSingleGate(gate: keyof ExcaliburTagGates, gates: ExcaliburTagGates, thresholds?: GateThresholds, totalEligibleVoters?: number): boolean;
