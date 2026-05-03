/**
 * Bounty Empirical-Receipt Validator — KN-H7 / BP017
 * ====================================================
 * Validates submitted Bounty receipts against per-tier empirical criteria.
 *
 * Four Bounty classes (per Three-Tier canon BP017 + KN-H6 submission schemas):
 *   A. tier_a_floor_verification:   HOT-rate lift ≥30pp; tier_config 'needs'; valid question bank
 *   B. tier_b_uplift_verification:  Cathedral lift ≥30pp; Reckoning velocity ≥2× Tier A reference
 *   C. tier_c_founder_replication:  Cathedral lift ≥30pp; founder_cascade_reference; own-corpus
 *   D. cross_tier_comparison:       All 3 tiers lift ≥30pp; same submitter; same bank; monotone uplift
 *
 * Anti-marketing-class discipline (B132/B133 — feedback_empirically_valid_praise_only):
 *   Cathedral Effect cross-vendor baselines (K477/K481/K499): R11 typical HOT-rate 30–50pp.
 *   If reported lift_pp > 60pp (>20% above typical 50pp ceiling) without exceptional evidence,
 *   flag as warnings.suspicious_inflation and route to Founder review. Do NOT auto-approve.
 *
 * BRIDLE Rule 4 conservative defaults:
 *   When ANY criterion fails — including borderline results (e.g. velocity 1.5–2×) —
 *   the receipt FAILS. Anti-extraction structural form: Bounty Marks-payouts must be
 *   empirically anchored, not commercially motivated approximations.
 *
 * Composes with:
 *   - KN-H6 bounty_poster_tier_generator.ts (submission_schema + VALIDATION_CRITERIA)
 *   - KN-H2 tier_a_floor_verification.ts (Tier A floor receipt anchor)
 *   - KN094 Bounty #7 Heartbeat Interval Tuning (precedent Bounty system)
 *   - KN-H8: Marks payout integration (next in Pod-H sequence)
 *
 * Cathedral Effect baseline anchors:
 *   K477: injection-pathway iterations; K481: speed-run covenant Iter-C;
 *   K499: R13 cross-vendor benchmark (800/800 HOT; typical lift 30–50pp).
 */
import { SUBMISSION_SCHEMAS, } from "./bounty_poster_tier_generator.js";
// ─── Cathedral Effect cross-vendor baselines ──────────────────────────────────
// R11/R13 empirical range: 30–50pp typical; R13 peak multi-tier composite ~60pp.
// Source: K477 + K481 injection-pathway iterations; K499 R13 benchmark.
const CATHEDRAL_LIFT_PASS_PP = 30;
const CATHEDRAL_BASELINE_TYPICAL_MAX_PP = 50;
const SUSPICIOUS_INFLATION_THRESHOLD_PP = CATHEDRAL_BASELINE_TYPICAL_MAX_PP * 1.2; // 60pp
// Tier B Reckoning velocity thresholds per KN-H7 spec
const TIER_B_VELOCITY_PASS_THRESHOLD = 2.0; // ≥2× Tier A per Three-Tier canon KN-H7
const TIER_B_VELOCITY_BORDERLINE_THRESHOLD = 1.5; // 1.5–2× → borderline → FAIL + warning
// ─── Internal helpers ─────────────────────────────────────────────────────────
function isValidISO8601(value) {
    if (typeof value !== "string")
        return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
}
function isValidQuestionBank(value) {
    if (typeof value !== "string")
        return false;
    return /^R(10|11|13)/i.test(value);
}
/**
 * Check whether a submitted lift_pp value is suspiciously high relative to the
 * Cathedral Effect cross-vendor baseline established by K477/K481/K499.
 * Claims >60pp without corroborating evidence are flagged — not auto-rejected.
 */
function checkSuspiciousInflation(lift_pp, field_label, warnings) {
    if (lift_pp > SUSPICIOUS_INFLATION_THRESHOLD_PP) {
        warnings.push({
            code: "suspicious_inflation",
            message: `${field_label} = ${lift_pp}pp exceeds the Cathedral Effect cross-vendor typical ceiling ` +
                `(${SUSPICIOUS_INFLATION_THRESHOLD_PP}pp; K477/K481/K499 baseline). ` +
                `This may indicate a marketing-class inflation. Per B132/B133 discipline: ` +
                `Founder review required before Marks payout is approved.`,
            requires_founder_review: true,
        });
    }
}
// ─── Tier A Floor Verification ────────────────────────────────────────────────
function validateTierA(receipt, failures, warnings) {
    let bridle_rule_4_applied = false;
    // Required fields presence check
    const schema = SUBMISSION_SCHEMAS.tier_a_floor_verification;
    for (const field of schema.required_fields) {
        if (receipt[field.name] === undefined || receipt[field.name] === null) {
            failures.push({
                field: field.name,
                criterion: `Required field '${field.name}' must be present: ${field.description}`,
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
        }
    }
    // lift_pp ≥ 30
    const lift_pp = typeof receipt.lift_pp === "number" ? receipt.lift_pp : NaN;
    const margin = isNaN(lift_pp) ? -CATHEDRAL_LIFT_PASS_PP : lift_pp - CATHEDRAL_LIFT_PASS_PP;
    if (isNaN(lift_pp)) {
        failures.push({
            field: "lift_pp",
            criterion: "lift_pp must be a number",
            expected: "≥ 30",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else if (lift_pp < CATHEDRAL_LIFT_PASS_PP) {
        failures.push({
            field: "lift_pp",
            criterion: `Cathedral Effect lift must be ≥ ${CATHEDRAL_LIFT_PASS_PP}pp (HOT over cold baseline)`,
            actual: lift_pp,
            expected: `≥ ${CATHEDRAL_LIFT_PASS_PP}`,
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else {
        checkSuspiciousInflation(lift_pp, "lift_pp", warnings);
    }
    // tier_config must be 'needs'
    if (receipt.tier_config !== "needs") {
        failures.push({
            field: "tier_config",
            criterion: "tier_config must be 'needs' for Tier A floor verification",
            actual: String(receipt.tier_config ?? "missing"),
            expected: "'needs'",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // question_bank_version must be R10, R11, or R13
    if (!isValidQuestionBank(receipt.question_bank_version)) {
        failures.push({
            field: "question_bank_version",
            criterion: "question_bank_version must reference a valid benchmark: R10, R11, or R13",
            actual: String(receipt.question_bank_version ?? "missing"),
            expected: "R10, R11, or R13",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // run_timestamp — parseable ISO 8601
    if (!isValidISO8601(receipt.run_timestamp)) {
        failures.push({
            field: "run_timestamp",
            criterion: "run_timestamp must be a parseable ISO 8601 timestamp",
            actual: String(receipt.run_timestamp ?? "missing"),
            expected: "ISO 8601 string",
        });
    }
    return { margin, bridle_rule_4_applied };
}
// ─── Tier B Uplift Verification ───────────────────────────────────────────────
function validateTierB(receipt, failures, warnings) {
    let bridle_rule_4_applied = false;
    const schema = SUBMISSION_SCHEMAS.tier_b_uplift_verification;
    for (const field of schema.required_fields) {
        if (receipt[field.name] === undefined || receipt[field.name] === null) {
            failures.push({
                field: field.name,
                criterion: `Required field '${field.name}' must be present: ${field.description}`,
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
        }
    }
    // tier_b_lift_pp ≥ 30
    const lift_pp = typeof receipt.tier_b_lift_pp === "number" ? receipt.tier_b_lift_pp : NaN;
    const margin = isNaN(lift_pp) ? -CATHEDRAL_LIFT_PASS_PP : lift_pp - CATHEDRAL_LIFT_PASS_PP;
    if (isNaN(lift_pp)) {
        failures.push({
            field: "tier_b_lift_pp",
            criterion: "tier_b_lift_pp must be a number",
            expected: "≥ 30",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else if (lift_pp < CATHEDRAL_LIFT_PASS_PP) {
        failures.push({
            field: "tier_b_lift_pp",
            criterion: `Cathedral Effect lift at Tier B must be ≥ ${CATHEDRAL_LIFT_PASS_PP}pp`,
            actual: lift_pp,
            expected: `≥ ${CATHEDRAL_LIFT_PASS_PP}`,
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else {
        checkSuspiciousInflation(lift_pp, "tier_b_lift_pp", warnings);
    }
    // reckoning_velocity_ratio ≥ 2.0 per KN-H7 spec
    // 1.5–2.0 is borderline → BRIDLE Rule 4: FAIL + warning
    const velocity = typeof receipt.reckoning_velocity_ratio === "number"
        ? receipt.reckoning_velocity_ratio
        : NaN;
    if (isNaN(velocity)) {
        failures.push({
            field: "reckoning_velocity_ratio",
            criterion: "reckoning_velocity_ratio must be a number (Reckoning velocity vs Tier A baseline)",
            expected: `≥ ${TIER_B_VELOCITY_PASS_THRESHOLD}×`,
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else if (velocity < TIER_B_VELOCITY_BORDERLINE_THRESHOLD) {
        failures.push({
            field: "reckoning_velocity_ratio",
            criterion: `Reckoning velocity at Tier B must be ≥ ${TIER_B_VELOCITY_PASS_THRESHOLD}× Tier A. ` +
                `Received ${velocity}× which is below the minimum evidence threshold.`,
            actual: velocity,
            expected: `≥ ${TIER_B_VELOCITY_PASS_THRESHOLD}×`,
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else if (velocity < TIER_B_VELOCITY_PASS_THRESHOLD) {
        // BRIDLE Rule 4: borderline (1.5–2×) → FAIL + warning
        failures.push({
            field: "reckoning_velocity_ratio",
            criterion: `Reckoning velocity ${velocity}× is below the ${TIER_B_VELOCITY_PASS_THRESHOLD}× canonical threshold. ` +
                `BRIDLE Rule 4: borderline results default to FAIL. ` +
                `Expected range: 2–3× per Three-Tier canon. Resubmit with stronger evidence.`,
            actual: velocity,
            expected: `≥ ${TIER_B_VELOCITY_PASS_THRESHOLD}×`,
            bridle_rule: "rule_4",
        });
        warnings.push({
            code: "borderline_velocity",
            message: `Reckoning velocity ${velocity}× is borderline (threshold: ${TIER_B_VELOCITY_PASS_THRESHOLD}×). ` +
                `Per Three-Tier canon, 2–3× is the expected range. ` +
                `BRIDLE Rule 4 applied: FAIL. Founder may override with explicit evidence.`,
            requires_founder_review: true,
        });
        bridle_rule_4_applied = true;
    }
    // tier_a_reference_receipt must be present
    const ref = receipt.tier_a_reference_receipt;
    if (!ref || (typeof ref === "string" && ref.trim().length === 0)) {
        failures.push({
            field: "tier_a_reference_receipt",
            criterion: "tier_a_reference_receipt is required — cannot validate Tier B uplift without Tier A floor anchor",
            expected: "bounty_id UUID or URL to a valid Tier A floor receipt",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // tier_config must be 'suggests'
    if (receipt.tier_config !== "suggests") {
        failures.push({
            field: "tier_config",
            criterion: "tier_config must be 'suggests' for Tier B uplift verification",
            actual: String(receipt.tier_config ?? "missing"),
            expected: "'suggests'",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // run_timestamp
    if (!isValidISO8601(receipt.run_timestamp)) {
        failures.push({
            field: "run_timestamp",
            criterion: "run_timestamp must be a parseable ISO 8601 timestamp",
            actual: String(receipt.run_timestamp ?? "missing"),
            expected: "ISO 8601 string",
        });
    }
    return { margin, bridle_rule_4_applied };
}
// ─── Tier C Founder Replication ───────────────────────────────────────────────
function validateTierC(receipt, failures, warnings) {
    let bridle_rule_4_applied = false;
    const schema = SUBMISSION_SCHEMAS.tier_c_founder_replication;
    for (const field of schema.required_fields) {
        if (receipt[field.name] === undefined || receipt[field.name] === null) {
            failures.push({
                field: field.name,
                criterion: `Required field '${field.name}' must be present: ${field.description}`,
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
        }
    }
    // replication_lift_pp ≥ 30
    const lift_pp = typeof receipt.replication_lift_pp === "number" ? receipt.replication_lift_pp : NaN;
    const margin = isNaN(lift_pp) ? -CATHEDRAL_LIFT_PASS_PP : lift_pp - CATHEDRAL_LIFT_PASS_PP;
    if (isNaN(lift_pp)) {
        failures.push({
            field: "replication_lift_pp",
            criterion: "replication_lift_pp must be a number",
            expected: "≥ 30",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else if (lift_pp < CATHEDRAL_LIFT_PASS_PP) {
        failures.push({
            field: "replication_lift_pp",
            criterion: `Cathedral Effect lift at Tier C replication must be ≥ ${CATHEDRAL_LIFT_PASS_PP}pp`,
            actual: lift_pp,
            expected: `≥ ${CATHEDRAL_LIFT_PASS_PP}`,
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    else {
        checkSuspiciousInflation(lift_pp, "replication_lift_pp", warnings);
    }
    // founder_cascade_reference must be present and non-empty
    const ref = receipt.founder_cascade_reference;
    if (!ref || (typeof ref === "string" && ref.trim().length === 0)) {
        failures.push({
            field: "founder_cascade_reference",
            criterion: "founder_cascade_reference must reference a valid Tier C receipt anchor " +
                "(e.g. KN-H4 LANDED tier-spec docs or BP015→BP017 cascade receipt)",
            expected: "canonical anchor reference string",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // corpus_folder_description must be present — proves own-corpus replication
    const corpus = receipt.corpus_folder_description;
    if (!corpus || (typeof corpus === "string" && corpus.trim().length === 0)) {
        failures.push({
            field: "corpus_folder_description",
            criterion: "corpus_folder_description is required — confirms submitter used own corpus, " +
                "not the Founder's. Only own-corpus replications are accepted.",
            expected: "non-empty description of submitter's own folder/project",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // tier_config must be 'founder'
    if (receipt.tier_config !== "founder") {
        failures.push({
            field: "tier_config",
            criterion: "tier_config must be 'founder' for Tier C replication",
            actual: String(receipt.tier_config ?? "missing"),
            expected: "'founder'",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // run_timestamp
    if (!isValidISO8601(receipt.run_timestamp)) {
        failures.push({
            field: "run_timestamp",
            criterion: "run_timestamp must be a parseable ISO 8601 timestamp",
            actual: String(receipt.run_timestamp ?? "missing"),
            expected: "ISO 8601 string",
        });
    }
    // Optional: warn if crown_jewels_surfaced is suspiciously high
    const cj = receipt.crown_jewels_surfaced;
    if (typeof cj === "number" && cj > 30) {
        // Founder reference: 15 Crown Jewels in BP015→BP017 cascade
        warnings.push({
            code: "crown_jewels_inflation",
            message: `crown_jewels_surfaced = ${cj}. Founder reference for BP015→BP017 cascade: 15 Crown Jewels. ` +
                `Claims significantly exceeding this reference may indicate over-classification. ` +
                `Founder review recommended.`,
            requires_founder_review: true,
        });
    }
    return { margin, bridle_rule_4_applied };
}
// ─── Cross-Tier Comparison ────────────────────────────────────────────────────
function validateCrossTier(receipt, failures, warnings) {
    let bridle_rule_4_applied = false;
    const schema = SUBMISSION_SCHEMAS.cross_tier_comparison;
    for (const field of schema.required_fields) {
        if (receipt[field.name] === undefined || receipt[field.name] === null) {
            failures.push({
                field: field.name,
                criterion: `Required field '${field.name}' must be present: ${field.description}`,
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
        }
    }
    // same_submitter must be explicitly true
    if (receipt.same_submitter !== true) {
        failures.push({
            field: "same_submitter",
            criterion: "same_submitter must be true — all three tier runs must be by the same member " +
                "for a valid cross-tier comparison",
            actual: String(receipt.same_submitter ?? "missing"),
            expected: "true",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // question_bank_version — same across all three tiers
    const qbv = receipt.question_bank_version;
    if (!isValidQuestionBank(qbv)) {
        failures.push({
            field: "question_bank_version",
            criterion: "question_bank_version must be a valid benchmark (R10, R11, R13) and must be " +
                "the same for all three tier runs",
            actual: String(qbv ?? "missing"),
            expected: "R10, R11, or R13",
            bridle_rule: "rule_4",
        });
        bridle_rule_4_applied = true;
    }
    // Per-tier lift_pp ≥ 30
    const tierFields = [
        { cold: "tier_a_cold_accuracy_pct", hot: "tier_a_hot_accuracy_pct", label: "Tier A" },
        { cold: "tier_b_cold_accuracy_pct", hot: "tier_b_hot_accuracy_pct", label: "Tier B" },
        { cold: "tier_c_cold_accuracy_pct", hot: "tier_c_hot_accuracy_pct", label: "Tier C" },
    ];
    const liftValues = [];
    const hotValues = [];
    for (const { cold, hot, label } of tierFields) {
        const coldVal = typeof receipt[cold] === "number" ? receipt[cold] : NaN;
        const hotVal = typeof receipt[hot] === "number" ? receipt[hot] : NaN;
        if (isNaN(coldVal) || isNaN(hotVal)) {
            failures.push({
                field: `${cold} / ${hot}`,
                criterion: `${label} cold and hot accuracy values must both be numbers`,
                expected: "number (0–100)",
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
            liftValues.push(NaN);
            hotValues.push(NaN);
        }
        else {
            const lift = hotVal - coldVal;
            liftValues.push(lift);
            hotValues.push(hotVal);
            if (lift < CATHEDRAL_LIFT_PASS_PP) {
                failures.push({
                    field: `${hot} - ${cold}`,
                    criterion: `${label} Cathedral Effect lift must be ≥ ${CATHEDRAL_LIFT_PASS_PP}pp`,
                    actual: lift,
                    expected: `≥ ${CATHEDRAL_LIFT_PASS_PP}`,
                    bridle_rule: "rule_4",
                });
                bridle_rule_4_applied = true;
            }
            else {
                checkSuspiciousInflation(lift, `${label} lift_pp`, warnings);
            }
        }
    }
    const margin = liftValues.some((v) => isNaN(v))
        ? -CATHEDRAL_LIFT_PASS_PP
        : Math.min(...liftValues) - CATHEDRAL_LIFT_PASS_PP;
    // Monotone uplift check: tier_c_hot > tier_b_hot > tier_a_hot
    // Non-monotone → flag for Founder review (not auto-rejected — anomalies may be valid findings)
    const [hotA, hotB, hotC] = hotValues;
    if (!isNaN(hotA) && !isNaN(hotB) && !isNaN(hotC)) {
        if (!(hotC > hotB && hotB > hotA)) {
            warnings.push({
                code: "non_monotone_uplift",
                message: `Non-monotone HOT accuracy pattern: Tier A = ${hotA}%, Tier B = ${hotB}%, Tier C = ${hotC}%. ` +
                    `Expected: Tier C > Tier B > Tier A. ` +
                    `Anomalies may be valid findings but require Founder review — not auto-rejected.`,
                requires_founder_review: true,
            });
        }
    }
    // run_timestamps
    const timestamps = receipt.run_timestamps;
    if (!timestamps || typeof timestamps !== "object") {
        failures.push({
            field: "run_timestamps",
            criterion: "run_timestamps must be an object with ISO 8601 timestamps for each tier: " +
                "{tier_a: string, tier_b: string, tier_c: string}",
            expected: "object with tier_a, tier_b, tier_c ISO 8601 strings",
        });
    }
    else {
        for (const key of ["tier_a", "tier_b", "tier_c"]) {
            if (!isValidISO8601(timestamps[key])) {
                failures.push({
                    field: `run_timestamps.${key}`,
                    criterion: `run_timestamps.${key} must be a parseable ISO 8601 timestamp`,
                    actual: String(timestamps[key] ?? "missing"),
                    expected: "ISO 8601 string",
                });
            }
        }
    }
    return { margin, bridle_rule_4_applied };
}
// ─── Primary Validator ────────────────────────────────────────────────────────
/**
 * Validates a submitted Bounty empirical receipt against per-tier criteria.
 *
 * Returns:
 *   - pass: true only if ALL criteria are met (no failures)
 *   - margin: lift_pp − 30 (primary threshold); negative = failing
 *   - failures: specific criteria not met (each is a distinct, actionable failure)
 *   - warnings: borderline or suspicious results requiring Founder review
 *   - requires_founder_review: true if any warning flags manual review
 *   - bridle_rule_4_applied: true if BRIDLE Rule 4 converted a borderline → FAIL
 *
 * BRIDLE Rule 4: when any criterion fails, the receipt FAILS.
 * Do NOT approve borderline cases without explicit evidence.
 */
export function validateBountyReceipt(bounty_id, bounty_class, receipt) {
    const validated_at = new Date().toISOString();
    const failures = [];
    const warnings = [];
    let margin = 0;
    let bridle_rule_4_applied = false;
    switch (bounty_class) {
        case "tier_a_floor_verification": {
            const r = validateTierA(receipt, failures, warnings);
            margin = r.margin;
            bridle_rule_4_applied = r.bridle_rule_4_applied;
            break;
        }
        case "tier_b_uplift_verification": {
            const r = validateTierB(receipt, failures, warnings);
            margin = r.margin;
            bridle_rule_4_applied = r.bridle_rule_4_applied;
            break;
        }
        case "tier_c_founder_replication": {
            const r = validateTierC(receipt, failures, warnings);
            margin = r.margin;
            bridle_rule_4_applied = r.bridle_rule_4_applied;
            break;
        }
        case "cross_tier_comparison": {
            const r = validateCrossTier(receipt, failures, warnings);
            margin = r.margin;
            bridle_rule_4_applied = r.bridle_rule_4_applied;
            break;
        }
        default: {
            // TypeScript exhaustiveness guard — should not reach at runtime
            failures.push({
                field: "bounty_class",
                criterion: `Unknown bounty_class: ${String(bounty_class)}`,
                bridle_rule: "rule_4",
            });
            bridle_rule_4_applied = true;
        }
    }
    const pass = failures.length === 0;
    const requires_founder_review = warnings.some((w) => w.requires_founder_review);
    return {
        pass,
        margin,
        failures,
        warnings,
        bounty_id,
        bounty_class,
        validated_at,
        requires_founder_review,
        bridle_rule_4_applied,
    };
}
/**
 * MCP tool handler: validate_bounty_receipt
 *
 * Read-class tool — validates a submitted Bounty empirical receipt.
 * Returns pass/fail + margin + failures + warnings.
 * Suspicious-inflation and borderline results are flagged for Founder review.
 * BRIDLE Rule 4: borderline cases default to FAIL.
 */
export function handleValidateBountyReceipt(args) {
    try {
        if (!args.bounty_id) {
            return { ok: false, error: "bounty_id is required." };
        }
        if (!args.bounty_class) {
            return {
                ok: false,
                error: "bounty_class is required. Valid values: " +
                    "tier_a_floor_verification | tier_b_uplift_verification | " +
                    "tier_c_founder_replication | cross_tier_comparison.",
            };
        }
        if (!args.receipt_json || typeof args.receipt_json !== "object") {
            return { ok: false, error: "receipt_json must be a non-null object." };
        }
        const validation = validateBountyReceipt(args.bounty_id, args.bounty_class, args.receipt_json);
        return { ok: true, validation };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
// ─── Test Cases (7 cases per KN-H7 Phase D) ──────────────────────────────────
// These are the canonical test cases used by the Phase D test suite.
// Import and run these in tests to verify the validator harness.
export const KN_H7_TEST_CASES = [
    {
        id: "T1",
        description: "Tier A receipt with ≥30pp lift PASSES",
        args: {
            bounty_id: "test-bounty-t1",
            bounty_class: "tier_a_floor_verification",
            receipt_json: {
                cold_accuracy_pct: 50,
                hot_accuracy_pct: 82,
                lift_pp: 32,
                tier_config: "needs",
                ai_model: "claude-haiku-3-5",
                question_bank_version: "R11",
                run_timestamp: "2026-05-01T12:00:00Z",
            },
        },
        expected_pass: true,
    },
    {
        id: "T2",
        description: "Tier A receipt with <30pp lift FAILS",
        args: {
            bounty_id: "test-bounty-t2",
            bounty_class: "tier_a_floor_verification",
            receipt_json: {
                cold_accuracy_pct: 55,
                hot_accuracy_pct: 76,
                lift_pp: 21,
                tier_config: "needs",
                ai_model: "claude-haiku-3-5",
                question_bank_version: "R11",
                run_timestamp: "2026-05-01T12:00:00Z",
            },
        },
        expected_pass: false,
    },
    {
        id: "T3",
        description: "Tier B receipt with ≥2× Reckoning velocity PASSES",
        args: {
            bounty_id: "test-bounty-t3",
            bounty_class: "tier_b_uplift_verification",
            receipt_json: {
                tier_a_cold_accuracy_pct: 50,
                tier_b_cold_accuracy_pct: 52,
                tier_b_hot_accuracy_pct: 84,
                tier_b_lift_pp: 32,
                tier_a_reference_receipt: "prior-tier-a-receipt-uuid",
                tier_config: "suggests",
                ai_model: "claude-sonnet-4-6",
                reckoning_velocity_ratio: 2.3,
                run_timestamp: "2026-05-01T13:00:00Z",
            },
        },
        expected_pass: true,
    },
    {
        id: "T4",
        description: "Tier C cascade-replication receipt PASSES with Crown-Jewel evidence",
        args: {
            bounty_id: "test-bounty-t4",
            bounty_class: "tier_c_founder_replication",
            receipt_json: {
                founder_cascade_reference: "KN-H4 LANDED tier-spec docs / BP015→BP017 cascade receipt",
                replication_cold_accuracy_pct: 48,
                replication_hot_accuracy_pct: 81,
                replication_lift_pp: 33,
                reckoning_velocity_hours: 40,
                tier_config: "founder",
                ai_model: "claude-opus-4-7",
                corpus_folder_description: "Own project folder: 65GB ML research corpus, 12,000 files, 2018-2026.",
                run_timestamp: "2026-05-01T14:00:00Z",
                crown_jewels_surfaced: 12,
            },
        },
        expected_pass: true,
    },
    {
        id: "T5",
        description: "Cross-tier comparison receipt PASSES with all-3-tiers schema",
        args: {
            bounty_id: "test-bounty-t5",
            bounty_class: "cross_tier_comparison",
            receipt_json: {
                tier_a_cold_accuracy_pct: 48,
                tier_a_hot_accuracy_pct: 80,
                tier_b_cold_accuracy_pct: 50,
                tier_b_hot_accuracy_pct: 85,
                tier_c_cold_accuracy_pct: 52,
                tier_c_hot_accuracy_pct: 90,
                question_bank_version: "R13",
                tier_a_model: "gpt-4o-mini",
                tier_b_model: "claude-sonnet-4-6",
                tier_c_model: "claude-opus-4-7",
                same_submitter: true,
                run_timestamps: {
                    tier_a: "2026-04-30T10:00:00Z",
                    tier_b: "2026-04-30T14:00:00Z",
                    tier_c: "2026-04-30T18:00:00Z",
                },
            },
        },
        expected_pass: true,
    },
    {
        id: "T6",
        description: "Suspicious-inflation case flagged as warning + surfaces for Founder review",
        args: {
            bounty_id: "test-bounty-t6",
            bounty_class: "tier_a_floor_verification",
            receipt_json: {
                cold_accuracy_pct: 20,
                hot_accuracy_pct: 95,
                lift_pp: 75, // >60pp ceiling — suspicious inflation
                tier_config: "needs",
                ai_model: "claude-haiku-3-5",
                question_bank_version: "R11",
                run_timestamp: "2026-05-01T12:00:00Z",
            },
        },
        expected_pass: true, // passes numerically but with suspicious_inflation warning
        expected_requires_founder_review: true,
    },
    {
        id: "T7",
        description: "BRIDLE Rule 4: borderline velocity (1.7×, below 2×) defaults to FAIL — anti-marketing-class",
        args: {
            bounty_id: "test-bounty-t7",
            bounty_class: "tier_b_uplift_verification",
            receipt_json: {
                tier_a_cold_accuracy_pct: 50,
                tier_b_cold_accuracy_pct: 52,
                tier_b_hot_accuracy_pct: 84,
                tier_b_lift_pp: 32,
                tier_a_reference_receipt: "prior-tier-a-receipt-uuid",
                tier_config: "suggests",
                ai_model: "claude-sonnet-4-6",
                reckoning_velocity_ratio: 1.7, // borderline: 1.5–2× → BRIDLE Rule 4 → FAIL
                run_timestamp: "2026-05-01T13:00:00Z",
            },
        },
        expected_pass: false,
        expected_bridle_rule_4_applied: true,
    },
];
//# sourceMappingURL=bounty_receipt_validator.js.map
