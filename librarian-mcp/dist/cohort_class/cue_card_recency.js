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
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
/**
 * Pure state machine — accepts a pre-fetched context, returns the current
 * vesting state. No I/O; testable without DB.
 */
export function calculateVestingState(ctx, nowMs) {
    const now = nowMs ?? Date.now();
    if (!ctx.most_recent_qualifying_at || ctx.active_cue_card_count === 0) {
        return {
            state: "inactive",
            context: ctx,
            reason: "No qualifying Cue Card (sent + handshake_completed + used) within last 7 days",
        };
    }
    const expiryMs = new Date(ctx.expiry_at).getTime();
    const msUntilExpiry = expiryMs - now;
    if (msUntilExpiry < 0) {
        return {
            state: "expired",
            context: ctx,
            reason: `Cue Card recency window expired ${Math.abs(Math.floor(msUntilExpiry / 3_600_000))}h ago`,
        };
    }
    if (msUntilExpiry < TWENTY_FOUR_HOURS_MS) {
        const hoursLeft = Math.floor(msUntilExpiry / 3_600_000);
        return {
            state: "expiring_warning",
            context: ctx,
            reason: `Fluid access expires in ~${hoursLeft}h. Send a Cue Card to re-up, or join the Federation for permanent fluid access.`,
        };
    }
    return {
        state: "active",
        context: ctx,
        reason: `${ctx.active_cue_card_count} qualifying Cue Card(s) active. Fluid access good until ${ctx.expiry_at}.`,
    };
}
/**
 * Determine Pied Piper sub-tier based on active card count.
 * Aligns with creator_referrals Pioneer/Vanguard tier system.
 */
export function cueCardToCohorTier(vestingState, activeCueCardCount) {
    if (vestingState !== "active" && vestingState !== "expiring_warning") {
        return "lone_wolf";
    }
    return activeCueCardCount >= 3 ? "pied_piper_tier_2_plus" : "pied_piper_tier_1";
}
/**
 * Build the re-up reminder message for LB Frame UI.
 * Uses LB animal/mascot framing per feedback_no_human_characters.md.
 */
export function buildReUpReminderMessage(state) {
    switch (state.state) {
        case "expiring_warning":
            return `Your Pied Piper fluid librarian access expires in ~${Math.floor(state.context.hours_until_expiry ?? 0)}h. Send another Cue Card to re-up for 7 days, or join the Federation for permanent fluid access.`;
        case "expired":
            return `Your Pied Piper fluid librarian access has expired. Send another Cue Card to re-up for 7 days, or join the Federation for permanent fluid access.`;
        default:
            return null;
    }
}
/**
 * Validate that a vesting context object from the DB is structurally valid.
 * Returns null if valid, or an error string if invalid.
 */
export function validateVestingContext(raw) {
    if (!raw || typeof raw !== "object")
        return null;
    const r = raw;
    if (typeof r.member_id !== "string")
        return null;
    if (typeof r.active_cue_card_count !== "number")
        return null;
    return {
        member_id: r.member_id,
        active_cue_card_count: r.active_cue_card_count,
        most_recent_qualifying_at: typeof r.most_recent_qualifying_at === "string" ? r.most_recent_qualifying_at : null,
        expiry_at: typeof r.expiry_at === "string" ? r.expiry_at : null,
        hours_until_expiry: typeof r.hours_until_expiry === "number" ? r.hours_until_expiry : null,
    };
}
//# sourceMappingURL=cue_card_recency.js.map
