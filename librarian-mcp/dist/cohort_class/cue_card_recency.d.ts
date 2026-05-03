/**
 * Cue Card 7-Day Recency State Machine (KN103 / BP016)
 * =====================================================
 * Implements the Pied Piper vesting state machine.
 * Three-gate condition (anti-farming preserved from KN087 Slow Blade V2):
 *   Gate 1: Cue Card SENT            — cue_card_sent_at populated
 *   Gate 2: Recipient HANDSHAKE_COMPLETED — handshake_vesting_state = COMPLETED
 *   Gate 3: Recipient USED           — recipient_used_at populated
 *
 * All 3 gates must hit within the last 7 days for "active" state.
 *
 * State transitions:
 *   inactive        → No qualifying Cue Card (Lone Wolf)
 *   active          → All 3 gates within last 7 days (Pied Piper)
 *   expiring_warning → Within 24h of 7-day expiry
 *   expired         → 7+ days since last qualifying Cue Card (auto-downgrade)
 *
 * Pairs with KN102 cohort-class probe (one cannot land without the other).
 */
export type CueCardVestingState = "inactive" | "active" | "expiring_warning" | "expired";
export interface CueCardVestingContext {
    member_id: string;
    /** Count of qualifying cards (all 3 gates) within last 7 days */
    active_cue_card_count: number;
    /** ISO-8601 timestamp of the most recent qualifying card */
    most_recent_qualifying_at: string | null;
    /** most_recent_qualifying_at + 7 days */
    expiry_at: string | null;
    /** Floating-point hours until expiry (null if no active cards) */
    hours_until_expiry: number | null;
}
export interface VestingStateResult {
    state: CueCardVestingState;
    context: CueCardVestingContext;
    /** Human-readable reason for the current state */
    reason: string;
}
/**
 * Pure state machine — accepts a pre-fetched context, returns the current
 * vesting state. No I/O; testable without DB.
 */
export declare function calculateVestingState(ctx: CueCardVestingContext, nowMs?: number): VestingStateResult;
/**
 * Determine Pied Piper sub-tier based on active card count.
 * Aligns with creator_referrals Pioneer/Vanguard tier system.
 */
export declare function cueCardToCohorTier(vestingState: CueCardVestingState, activeCueCardCount: number): "lone_wolf" | "pied_piper_tier_1" | "pied_piper_tier_2_plus";
/**
 * Build the re-up reminder message for LB Frame UI.
 * Uses LB animal/mascot framing per feedback_no_human_characters.md.
 */
export declare function buildReUpReminderMessage(state: VestingStateResult): string | null;
/**
 * Validate that a vesting context object from the DB is structurally valid.
 * Returns null if valid, or an error string if invalid.
 */
export declare function validateVestingContext(raw: unknown): CueCardVestingContext | null;
