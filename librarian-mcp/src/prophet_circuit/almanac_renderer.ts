/**
 * Prophet Circuit — Almanac §4 Trends Renderer
 * Renders ProphetForecast → Almanac §4 Trends Markdown.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import type { ProphetForecast, AlmanacTrend } from "./types.js";

/** Validate that the forecast conforms to the Almanac §4 schema. */
export function validateAlmanacSchema(forecast: ProphetForecast): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!forecast.session) errors.push("Missing: session");
  if (!forecast.authored) errors.push("Missing: authored");
  if (!Array.isArray(forecast.patterns_detected) || forecast.patterns_detected.length === 0)
    errors.push("Missing: patterns_detected (must be non-empty)");
  if (!Array.isArray(forecast.trend_projections) || forecast.trend_projections.length === 0)
    errors.push("Missing: trend_projections (must be non-empty)");
  if (!Array.isArray(forecast.almanac_trends) || forecast.almanac_trends.length === 0)
    errors.push("Missing: almanac_trends (must be non-empty)");
  if (!forecast.meta_strategy)
    errors.push("Missing: meta_strategy");
  if (typeof forecast.forward_horizon_bushels !== "number" || forecast.forward_horizon_bushels <= 0)
    errors.push("Invalid: forward_horizon_bushels must be positive");

  for (const t of forecast.almanac_trends) {
    if (!t.trend_id) errors.push(`Trend missing trend_id`);
    if (typeof t.confidence !== "number" || t.confidence < 0 || t.confidence > 1)
      errors.push(`Trend ${t.trend_id}: confidence out of [0,1]`);
    if (!["rising", "falling", "periodic", "stable"].includes(t.projected_direction))
      errors.push(`Trend ${t.trend_id}: invalid projected_direction`);
  }

  return { valid: errors.length === 0, errors };
}

function trendBadge(trend: AlmanacTrend): string {
  const arrow = { rising: "↑", falling: "↓", periodic: "⟲", stable: "→" }[trend.projected_direction];
  const cls = trend.canon_class ? "**CANON**" : "Bushel";
  return `${arrow} ${cls}`;
}

function confidenceBar(confidence: number): string {
  const filled = Math.round(confidence * 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${(confidence * 100).toFixed(1)}%`;
}

/**
 * Render ProphetForecast → Almanac §4 Trends Markdown.
 * G6 gate: output must validate against Almanac schema.
 */
export function renderAlmanacSection4(forecast: ProphetForecast): string {
  const { valid, errors } = validateAlmanacSchema(forecast);

  const lines: string[] = [
    `# Almanac §4 — Forward-Pattern Trends`,
    ``,
    `**Session:** ${forecast.session}  `,
    `**Authored:** ${forecast.authored}  `,
    `**Meta-Strategy:** ${forecast.meta_strategy}  `,
    `**Horizon:** ${forecast.forward_horizon_bushels} Bushels  `,
    `**Schema Valid:** ${valid ? "✓ PASS" : "✗ FAIL"}  `,
    ``,
  ];

  if (!valid) {
    lines.push(`> ⚠ Schema errors:`);
    for (const e of errors) lines.push(`> - ${e}`);
    lines.push(``);
  }

  lines.push(`## Detected Patterns (${forecast.patterns_detected.length})`);
  lines.push(``);
  for (const p of forecast.patterns_detected) {
    lines.push(`- **${p.pattern_id}**: ${p.structure_description}`);
    lines.push(`  - Confidence: ${(p.confidence * 100).toFixed(1)}%`);
    lines.push(`  - Evidence samples: ${p.substrate_evidence.length}`);
    lines.push(`  - Winning branch: \`${p.winning_branch}\``);
  }
  lines.push(``);

  lines.push(`## Trend Projections (${forecast.trend_projections.length})`);
  lines.push(``);
  lines.push(`| Pattern | Horizon | Projected | Method | Within ±20% |`);
  lines.push(`|---------|---------|-----------|--------|-------------|`);
  for (const p of forecast.trend_projections) {
    const within = p.within_20pct ? "✓" : "✗";
    lines.push(`| ${p.pattern_id} | +${p.horizon}B | ${p.projected_value} | ${p.method} | ${within} |`);
  }
  lines.push(``);

  lines.push(`## §4 Almanac Trends`);
  lines.push(``);
  for (const t of forecast.almanac_trends) {
    lines.push(`### ${t.trend_id}`);
    lines.push(``);
    lines.push(`${trendBadge(t)} — ${t.description}`);
    lines.push(``);
    lines.push(`Confidence: \`${confidenceBar(t.confidence)}\``);
    lines.push(``);
    lines.push(`- Direction: **${t.projected_direction}**`);
    lines.push(`- Canon Class: ${t.canon_class ? "**Yes** — cross-cohort pattern" : "No — bushel-scoped"}`);
    lines.push(`- Horizon: +${t.horizon_bushels} Bushels`);
    lines.push(``);
  }

  lines.push(`## Cohort Classifications (${forecast.cohort_classifications.length})`);
  lines.push(``);
  for (const c of forecast.cohort_classifications) {
    const verdict = c.is_canon_class ? "**CANON CLASS**" : "Bushel Class";
    const check = c.correct ? "✓" : "✗";
    lines.push(`- ${c.pattern_id}: ${verdict} — cohorts [${c.cohort_span.join(", ")}] — ${check} — classifier: \`${c.winning_classifier}\``);
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(`*Prophet Circuit K31 (LB-STACK-0195) — Recursive K30-of-K30 Decision-Class Kernel — B79/BP034*`);

  return lines.join("\n");
}
