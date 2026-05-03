/**
 * Bounty Poster Tier Scaffold — KN-H5 / BP017 Three-Tier Sovereignty
 * ====================================================================
 * Pod-H #5 of 5 — scaffold only. Full Bounty Poster Tier-testing integration
 * is Pod-H KN-H6/H7/H8 scope (per Three-Tier canon Bounty Poster addendum).
 *
 * Four Bounty classes per Three-Tier canon BP017 turn 19 addendum:
 *
 *   A. Tier A NEEDS empirical floor verification    → Marks pay-rate × 1.0 (baseline)
 *   B. Tier B SUGGESTS uplift verification          → Marks × 1.25
 *   C. Tier C FOUNDER empirical-receipt-source      → Marks × 1.5  (Project-cohort uplift)
 *   D. Cross-tier comparison receipt                → Marks × 2.0
 *
 * MCP tool: get_lb_frame_tier_bounty_pay_rate
 *   Returns BountyPayRateResult for a given tier Bounty class.
 *   Called by KN-H6+ to hydrate Bounty Poster renders.
 *
 * Cross-reference: bounties/KN094-BP011 Bounty #7 Heartbeat Interval Tuning
 *   precedent (tag: 595b7b4). This scaffold extends the existing Bounty system
 *   for tier-specific empirical-verification tasks.
 *
 * Anti-extraction by structural form:
 *   Bounty classes measure empirical uplift — not gatekeeping. Any member at
 *   any tier can participate in any Bounty class (canonical rule: capital is
 *   not the gate; contribution is).
 */
export const TIER_BOUNTY_PAY_RATES = {
    tier_a_floor_verification: {
        bounty_class: "tier_a_floor_verification",
        tier_label: "Tier A — NEEDS",
        tier_id: "needs",
        marks_multiplier: 1.0,
        uplift_class: "baseline",
        description: "Verify that Cathedral Effect retrieval lift holds at Tier A (default Claude Code plan). " +
            "Submit a cold-vs-hot accuracy run using the R10/R11 question bank. " +
            "Floor threshold: ≥30pp lift over cold baseline.",
        poster_headline: "Verify the Tier A Floor",
        poster_subhead: "Does Cathedral Effect hold on a default plan? Prove it.",
        empirical_anchor: "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
        notes: "Baseline multiplier (1.0×). " +
            "Tier A is the universal access tier — empirical floor confirmation is foundational. " +
            "Cross-reference: tier_a_floor_verification.ts (KN-H2 harness).",
    },
    tier_b_uplift_verification: {
        bounty_class: "tier_b_uplift_verification",
        tier_label: "Tier B — SUGGESTS",
        tier_id: "suggests",
        marks_multiplier: 1.25,
        uplift_class: "recommended",
        description: "Verify the documented uplift of Tier B (Claude Max or equivalent) over Tier A baseline. " +
            "Submit a paired cold-vs-hot accuracy run at Tier B config and compare to Tier A floor. " +
            "Expected: 2–3× Reckoning velocity uplift over Tier A; ≥30pp Cathedral Effect lift preserved.",
        poster_headline: "Verify the Tier B Uplift",
        poster_subhead: "Is Tier B faster? Measure it. Prove it. Earn Marks.",
        empirical_anchor: "librarian-mcp/src/three_tier/tier_a_floor_verification.ts (Tier A anchor)",
        notes: "1.25× multiplier for recommended-tier uplift verification. " +
            "Uplift receipt cross-referenced to Tier A floor; documents relative velocity gain.",
    },
    tier_c_founder_replication: {
        bounty_class: "tier_c_founder_replication",
        tier_label: "Tier C — FOUNDER",
        tier_id: "founder",
        marks_multiplier: 1.5,
        uplift_class: "maximum",
        description: "Replicate Founder's empirical-receipt-source results at Tier C. " +
            "The canonical anchor is the BP015→BP017 cascade (15 Crown Jewels + 36-hour Reckoning). " +
            "Replication confirms max-velocity is substrate-driven, not plan-dependent-exclusion. " +
            "Self-attested tier; capital alone is not the gate.",
        poster_headline: "Replicate the Founder's Receipt",
        poster_subhead: "Can you reproduce the 36-hour Reckoning at Tier C? The corpus wants to know.",
        empirical_anchor: "BP015→BP017 cascade receipt (KN-H4 LANDED tier-spec docs)",
        notes: "1.5× multiplier + Project-cohort uplift bonus. " +
            "Replication reduces to practice: A&A Innovation claim structural form confirmation. " +
            "Non-exclusive: any member with self-attested Tier C config may submit.",
    },
    cross_tier_comparison: {
        bounty_class: "cross_tier_comparison",
        tier_label: "Cross-Tier Comparison",
        tier_id: "cross_tier",
        marks_multiplier: 2.0,
        uplift_class: "cross_tier",
        description: "Submit a controlled cross-tier comparison receipt: identical question bank, " +
            "three separate runs (Tier A / Tier B / Tier C), document lift deltas. " +
            "Highest Bounty class — provides the full tier-testing matrix in one submission.",
        poster_headline: "The Full Tier Comparison",
        poster_subhead: "Run all three. Show the deltas. Highest Marks in the tier-test corpus.",
        empirical_anchor: "R10/R11/R13 cross-vendor benchmark precedents (K477/K481/K499)",
        notes: "2.0× multiplier — highest Bounty class. " +
            "Cross-tier comparison is the definitive empirical artifact; " +
            "feeds the Three-Tier canon with member-generated generalization evidence.",
    },
};
// ─── Lookup functions ─────────────────────────────────────────────────────────
/**
 * Returns pay-rate metadata for a given tier Bounty class.
 * Called by MCP tool get_lb_frame_tier_bounty_pay_rate.
 * BRIDLE Rule 4: throws on unknown class — caller must handle.
 */
export function getBountyPayRateByClass(bountyClass) {
    const meta = TIER_BOUNTY_PAY_RATES[bountyClass];
    if (!meta) {
        throw new Error(`get_lb_frame_tier_bounty_pay_rate: unknown bounty_class "${bountyClass}". ` +
            `Valid classes: ${Object.keys(TIER_BOUNTY_PAY_RATES).join(", ")}.`);
    }
    return meta;
}
/**
 * Returns pay-rate metadata for a given tier (primary class for that tier).
 * Maps: needs→tier_a_floor_verification, suggests→tier_b_uplift_verification, founder→tier_c_founder_replication.
 * Cross-tier has no tier mapping — use getBountyPayRateByClass("cross_tier_comparison") directly.
 */
export function getPrimaryBountyPayRateForTier(tier) {
    const tierToClass = {
        needs: "tier_a_floor_verification",
        suggests: "tier_b_uplift_verification",
        founder: "tier_c_founder_replication",
    };
    return getBountyPayRateByClass(tierToClass[tier]);
}
/**
 * Returns all four Bounty pay-rate definitions as an ordered array.
 * Used by KN-H6 Bounty Poster renderer to display the full tier-test menu.
 */
export function getAllTierBountyPayRates() {
    return [
        TIER_BOUNTY_PAY_RATES.tier_a_floor_verification,
        TIER_BOUNTY_PAY_RATES.tier_b_uplift_verification,
        TIER_BOUNTY_PAY_RATES.tier_c_founder_replication,
        TIER_BOUNTY_PAY_RATES.cross_tier_comparison,
    ];
}
/**
 * MCP tool handler: get_lb_frame_tier_bounty_pay_rate
 * Returns Bounty pay-rate metadata for a tier Bounty class.
 * Three modes:
 *   1. bounty_class: exact class lookup
 *   2. tier: primary class for that tier
 *   3. list_all: all four classes
 */
export function handleGetTierBountyPayRate(args) {
    try {
        if (args.list_all) {
            return { ok: true, all_classes: getAllTierBountyPayRates() };
        }
        if (args.bounty_class) {
            const meta = getBountyPayRateByClass(args.bounty_class);
            return {
                ok: true,
                bounty_class: args.bounty_class,
                marks_multiplier: meta.marks_multiplier,
                meta,
            };
        }
        if (args.tier) {
            const meta = getPrimaryBountyPayRateForTier(args.tier);
            return {
                ok: true,
                tier: args.tier,
                bounty_class: meta.bounty_class,
                marks_multiplier: meta.marks_multiplier,
                meta,
            };
        }
        return {
            ok: false,
            error: "Provide one of: bounty_class, tier, or list_all=true. " +
                "Valid bounty_class values: " +
                Object.keys(TIER_BOUNTY_PAY_RATES).join(", ") + ". " +
                "Valid tier values: needs, suggests, founder.",
        };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
//# sourceMappingURL=bounty_poster_tier_scaffold.js.map
