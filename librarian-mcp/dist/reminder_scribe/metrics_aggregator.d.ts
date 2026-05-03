/**
 * Reminder Scribe Metrics Aggregator — KN-I4 / BP017
 * ====================================================
 * Queries KN-I3 provenance chain and computes per-rule / per-member /
 * per-time-window metrics for the Reminder Scribe empirical-receipt dashboard.
 *
 * Metric classes (per KN-I4 Phase B1):
 *   1. Violations per rule per AI member (rolling-window counts)
 *   2. Correction-stickiness rate (corrections / violations per rule)
 *   3. Override Marks-cost spend (sum per AI member)
 *   4. Pre-send-block frequency (blocks per AI member)
 *   5. FORK-class violation absolute zero (CRITICAL alert if ≥ 1)
 *   6. Cohort discipline-rate (composite metric across all rules + members)
 *   7. Drift-flag indicators (stickiness below threshold)
 *
 * Anti-shame discipline (Reminder Scribe canon BP017 turn 22):
 *   Empirical numbers + rates only. No moral judgment language.
 *   No personalized callouts beyond what metrics permit.
 *
 * BRIDLE Rule 4: if provenance query fails, surfaces data_available=false
 * + timestamp. Never shows stale-cached zero-counts as "no violations".
 *
 * Composes with:
 *   KN-I3 substrate_writeback.ts (b59b20b) — provenance chain query
 *   KN-I2 catechist/grader.ts — Catechist composition
 */
export type RollingWindow = "7d" | "30d" | "90d" | "all_time";
export type AiMemberFilter = "bishop" | "knight" | "pawn" | "rook" | "shadow_alpha" | "shadow_beta" | "all";
export type RuleClassFilter = "R-KP" | "R-PRAISE" | "R-FORK" | "R-DOUBLE-FILE" | "R-COUNSEL" | "R-USPTO" | "all";
export type VisibilityScope = "personal" | "federation_aggregate" | "public_aggregate";
export interface ViolationCell {
    ai_member: string;
    rule_id: string;
    violations: number;
    corrections: number;
    overrides: number;
    stickiness_pct: number;
}
export interface MarksCostEntry {
    ai_member: string;
    rule_id: string;
    marks_spent: number;
}
export interface ForkClassAlert {
    is_critical: boolean;
    fork_violations_detected: number;
    affected_rule_ids: string[];
    alert_message: string;
    earliest_fork_ts: string | null;
}
export interface DriftFlag {
    rule_id: string;
    ai_member: string;
    current_stickiness_pct: number;
    threshold_pct: number;
    drifting: boolean;
}
export interface MetricsDashboardPayload {
    schema_version: "1.0";
    generated_at: string;
    window: RollingWindow;
    window_days: number;
    data_available: boolean;
    unavailable_reason?: string;
    violations_heatmap: ViolationCell[];
    cohort_stickiness_pct: number;
    marks_cost_spend: MarksCostEntry[];
    total_marks_spent: number;
    presend_blocks_by_member: Record<string, number>;
    total_presend_blocks: number;
    fork_class_alert: ForkClassAlert;
    cohort_discipline_rate: number;
    drift_flags: DriftFlag[];
    total_violations: number;
    total_corrections: number;
    total_overrides: number;
    entry_count: number;
}
export interface MetricsQueryOpts {
    window?: RollingWindow;
    ai_member?: AiMemberFilter;
    rule_class_prefix?: RuleClassFilter;
    visibility_scope?: VisibilityScope;
    drift_threshold_pct?: number;
}
/**
 * Build the Reminder Scribe metrics dashboard payload.
 *
 * BRIDLE Rule 4: any exception surfaces data_available=false + reason.
 * Anti-shame: all metric labels are empirical (no moral judgment).
 */
export declare function buildMetricsDashboard(opts?: MetricsQueryOpts): MetricsDashboardPayload;
/**
 * Format MetricsDashboardPayload as human-readable Markdown.
 * Anti-shame: empirical language only. No moral judgment.
 */
export declare function formatMetricsSummaryMarkdown(payload: MetricsDashboardPayload): string;
