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

import { queryRsHistory, aggregateByRule, type RsProvenanceEntry } from "./substrate_writeback.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RollingWindow = "7d" | "30d" | "90d" | "all_time";
export type AiMemberFilter = "bishop" | "knight" | "pawn" | "rook" | "shadow_alpha" | "shadow_beta" | "all";
export type RuleClassFilter =
  | "R-KP"
  | "R-PRAISE"
  | "R-FORK"
  | "R-DOUBLE-FILE"
  | "R-COUNSEL"
  | "R-USPTO"
  | "R-PHA"       // Pre-Hoc Permission Ask (BRICK-WALL-FIRST-HALF) [BP028]
  | "R-MS"        // Missing Surface (BRICK-WALL-SECOND-HALF) [BP028]
  | "R-REV"       // Pre-Emptive Review Pressure (REVIEW-IN-LAST-HOURS) [BP028]
  | "R-PAWN"      // dispatch_pawn-when-paste-routed (PAWN-BLIND-WORKAROUND) [BP028]
  | "R-ROOK"      // dispatch_rook-pre-restart (MCP-RESTART-NEEDED) [BP028]
  | "all";
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

  // Metric 1: violations heatmap
  violations_heatmap: ViolationCell[];

  // Metric 2: correction stickiness aggregated
  cohort_stickiness_pct: number;

  // Metric 3: override marks spend
  marks_cost_spend: MarksCostEntry[];
  total_marks_spent: number;

  // Metric 4: pre-send blocks
  presend_blocks_by_member: Record<string, number>;
  total_presend_blocks: number;

  // Metric 5: FORK-class CRITICAL alert
  fork_class_alert: ForkClassAlert;

  // Metric 6: cohort discipline composite
  cohort_discipline_rate: number; // 0-100; composite across all rules + members

  // Metric 7: drift flags (stickiness < threshold)
  drift_flags: DriftFlag[];

  // Summary stats
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
  drift_threshold_pct?: number; // default 80 (below 80% stickiness = drift)
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_TO_DAYS: Record<RollingWindow, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "all_time": 36500, // 100 years = effectively all-time
};

const FORK_RULE_IDS = ["R-FORK-1", "R-FORK-2", "R-FORK-3"]; // extensible FORK-class
const DEFAULT_DRIFT_THRESHOLD = 80;

// ─── Main aggregator ──────────────────────────────────────────────────────────

/**
 * Build the Reminder Scribe metrics dashboard payload.
 *
 * BRIDLE Rule 4: any exception surfaces data_available=false + reason.
 * Anti-shame: all metric labels are empirical (no moral judgment).
 */
export function buildMetricsDashboard(opts: MetricsQueryOpts = {}): MetricsDashboardPayload {
  const generated_at = new Date().toISOString();
  const window: RollingWindow = opts.window ?? "7d";
  const window_days = WINDOW_TO_DAYS[window];
  const drift_threshold = opts.drift_threshold_pct ?? DEFAULT_DRIFT_THRESHOLD;

  try {
    const entries = queryRsHistory({
      ai_member: opts.ai_member === "all" ? undefined : opts.ai_member,
      rolling_days: window_days,
      limit: 2000,
    });

    // Apply rule_class_prefix filter
    const filteredEntries = opts.rule_class_prefix && opts.rule_class_prefix !== "all"
      ? entries.filter((e) => e.rule_id.startsWith(opts.rule_class_prefix!))
      : entries;

    const entry_count = filteredEntries.length;

    // ── Metric 1: violations heatmap ──────────────────────────────────────────
    const heatmapMap = new Map<string, ViolationCell>();
    for (const e of filteredEntries) {
      const key = `${e.ai_member}::${e.rule_id}`;
      const existing = heatmapMap.get(key) ?? {
        ai_member: e.ai_member,
        rule_id: e.rule_id,
        violations: 0,
        corrections: 0,
        overrides: 0,
        stickiness_pct: 100,
      };
      if (e.event_type === "violation_detected" || !e.correction_applied) {
        existing.violations++;
      }
      if (e.correction_applied) existing.corrections++;
      if (e.override_applied) existing.overrides++;
      existing.stickiness_pct = existing.violations === 0 ? 100
        : Math.round((existing.corrections / existing.violations) * 100);
      heatmapMap.set(key, existing);
    }
    const violations_heatmap = Array.from(heatmapMap.values());

    // ── Metric 2: correction stickiness (cohort aggregate) ───────────────────
    const total_violations = filteredEntries.filter(
      (e) => e.event_type === "violation_detected"
    ).length;
    const total_corrections = filteredEntries.filter(
      (e) => e.correction_applied
    ).length;
    const cohort_stickiness_pct = total_violations === 0 ? 100
      : Math.round((total_corrections / total_violations) * 100);

    // ── Metric 3: override marks spend ────────────────────────────────────────
    const marksMap = new Map<string, MarksCostEntry>();
    for (const e of filteredEntries) {
      if (!e.override_applied || !e.override_marks_cost) continue;
      const key = `${e.ai_member}::${e.rule_id}`;
      const existing = marksMap.get(key) ?? {
        ai_member: e.ai_member,
        rule_id: e.rule_id,
        marks_spent: 0,
      };
      existing.marks_spent += e.override_marks_cost;
      marksMap.set(key, existing);
    }
    const marks_cost_spend = Array.from(marksMap.values());
    const total_marks_spent = marks_cost_spend.reduce((s, m) => s + m.marks_spent, 0);

    // ── Metric 4: pre-send block frequency ───────────────────────────────────
    const presend_blocks_by_member: Record<string, number> = {};
    for (const e of filteredEntries) {
      if (!e.pre_send_block_triggered) continue;
      presend_blocks_by_member[e.ai_member] =
        (presend_blocks_by_member[e.ai_member] ?? 0) + 1;
    }
    const total_presend_blocks = Object.values(presend_blocks_by_member)
      .reduce((s, n) => s + n, 0);

    // ── Metric 5: FORK-class CRITICAL alert ───────────────────────────────────
    const forkViolations = filteredEntries.filter(
      (e) => FORK_RULE_IDS.includes(e.rule_id)
    );
    const affectedForkRules = [...new Set(forkViolations.map((e) => e.rule_id))];
    const forkTs = forkViolations.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]?.timestamp ?? null;
    const fork_class_alert: ForkClassAlert = {
      is_critical: forkViolations.length > 0,
      fork_violations_detected: forkViolations.length,
      affected_rule_ids: affectedForkRules,
      alert_message: forkViolations.length === 0
        ? "FORK-class absolute-zero confirmed — no violations detected."
        : `CRITICAL: ${forkViolations.length} FORK-class violation(s) detected. Rule(s): ${affectedForkRules.join(", ")}. ` +
          "FORK violations are STRUCTURALLY-IMMUTABLE. Immediate Founder review required.",
      earliest_fork_ts: forkTs,
    };

    // ── Metric 6: cohort discipline-rate (composite) ──────────────────────────
    // Composite: avg stickiness across all cells in heatmap
    const cohort_discipline_rate = violations_heatmap.length === 0
      ? 100
      : Math.round(
          violations_heatmap.reduce((s, c) => s + c.stickiness_pct, 0) / violations_heatmap.length
        );

    // ── Metric 7: drift flags ─────────────────────────────────────────────────
    const drift_flags: DriftFlag[] = violations_heatmap
      .filter((c) => c.violations > 0 && c.stickiness_pct < drift_threshold)
      .map((c) => ({
        rule_id: c.rule_id,
        ai_member: c.ai_member,
        current_stickiness_pct: c.stickiness_pct,
        threshold_pct: drift_threshold,
        drifting: true,
      }));

    const total_overrides = filteredEntries.filter((e) => e.override_applied).length;

    return {
      schema_version: "1.0",
      generated_at,
      window,
      window_days,
      data_available: true,
      violations_heatmap,
      cohort_stickiness_pct,
      marks_cost_spend,
      total_marks_spent,
      presend_blocks_by_member,
      total_presend_blocks,
      fork_class_alert,
      cohort_discipline_rate,
      drift_flags,
      total_violations,
      total_corrections,
      total_overrides,
      entry_count,
    };
  } catch (err) {
    // BRIDLE Rule 4: never silently render stale zero-counts
    return {
      schema_version: "1.0",
      generated_at,
      window,
      window_days,
      data_available: false,
      unavailable_reason: `Provenance chain query failed: ${String(err)}. Do not interpret as zero violations.`,
      violations_heatmap: [],
      cohort_stickiness_pct: 0,
      marks_cost_spend: [],
      total_marks_spent: 0,
      presend_blocks_by_member: {},
      total_presend_blocks: 0,
      fork_class_alert: {
        is_critical: false,
        fork_violations_detected: 0,
        affected_rule_ids: [],
        alert_message: "DATA UNAVAILABLE — FORK-class status unknown. Treat as unverified.",
        earliest_fork_ts: null,
      },
      cohort_discipline_rate: 0,
      drift_flags: [],
      total_violations: 0,
      total_corrections: 0,
      total_overrides: 0,
      entry_count: 0,
    };
  }
}

// ─── Markdown summary formatter ───────────────────────────────────────────────

/**
 * Format MetricsDashboardPayload as human-readable Markdown.
 * Anti-shame: empirical language only. No moral judgment.
 */
export function formatMetricsSummaryMarkdown(payload: MetricsDashboardPayload): string {
  const lines: string[] = [];

  lines.push(`## Reminder Scribe Metrics Dashboard (${payload.window})`);
  lines.push(`Generated: ${payload.generated_at}`);
  lines.push("");

  if (!payload.data_available) {
    lines.push(`**DATA UNAVAILABLE**: ${payload.unavailable_reason}`);
    lines.push("Do not interpret absence of data as zero violations.");
    return lines.join("\n");
  }

  // FORK-class alert (always first — highest priority)
  if (payload.fork_class_alert.is_critical) {
    lines.push(`### 🚨 FORK-CLASS CRITICAL ALERT`);
    lines.push(payload.fork_class_alert.alert_message);
    lines.push("");
  } else {
    lines.push(`**FORK-class check**: ${payload.fork_class_alert.alert_message}`);
    lines.push("");
  }

  // Cohort summary
  lines.push(`### Cohort Discipline Summary`);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Cohort discipline-rate | **${payload.cohort_discipline_rate}%** |`);
  lines.push(`| Cohort correction-stickiness | **${payload.cohort_stickiness_pct}%** |`);
  lines.push(`| Total violations (${payload.window}) | ${payload.total_violations} |`);
  lines.push(`| Total corrections applied | ${payload.total_corrections} |`);
  lines.push(`| Total overrides | ${payload.total_overrides} |`);
  lines.push(`| Total Marks spent (overrides) | ${payload.total_marks_spent} |`);
  lines.push(`| Pre-send blocks | ${payload.total_presend_blocks} |`);
  lines.push("");

  // Drift flags
  if (payload.drift_flags.length > 0) {
    lines.push(`### Drift Indicators`);
    lines.push(`| AI Member | Rule | Stickiness | Threshold |`);
    lines.push(`|---|---|---|---|`);
    for (const flag of payload.drift_flags) {
      lines.push(`| ${flag.ai_member} | ${flag.rule_id} | ${flag.current_stickiness_pct}% | ${flag.threshold_pct}% |`);
    }
    lines.push("");
  }

  // Violations heatmap
  if (payload.violations_heatmap.length > 0) {
    lines.push(`### Violations Heatmap (violations × corrections × stickiness)`);
    lines.push(`| AI Member | Rule | Violations | Corrections | Overrides | Stickiness |`);
    lines.push(`|---|---|---|---|---|---|`);
    for (const cell of payload.violations_heatmap.sort(
      (a, b) => b.violations - a.violations
    )) {
      lines.push(
        `| ${cell.ai_member} | ${cell.rule_id} | ${cell.violations} | ${cell.corrections} | ${cell.overrides} | ${cell.stickiness_pct}% |`
      );
    }
    lines.push("");
  }

  lines.push(`*Empirical receipt — counts and rates only. Anti-shame discipline per Reminder Scribe canon BP017 turn 22.*`);

  return lines.join("\n");
}
