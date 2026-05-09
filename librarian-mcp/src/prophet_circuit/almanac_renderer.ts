/**
 * Prophet Circuit — Almanac §4 Trends Renderer
 * Renders a ProphetForecast into Almanac §4 Markdown format.
 * K31 Prophet Circuit (LB-STACK-0195) — Bushel 79 BP034.
 *
 * G6 gate: output validates against Almanac schema (structure + required sections).
 */

import type { ProphetForecast, Pattern, PatternProjection, CohortClassification } from "./types.js";

export interface AlmanacSchema {
  version: string;
  section: "§4_Trends";
  forecast_id: string;
  session: string;
  authored: string;
  pattern_count: number;
  projection_count: number;
  classification_count: number;
  canon_class_count: number;
  mean_calibration: number;
  synthesis_strategy: string;
  content_md: string;
}

/** Validate rendered Almanac output meets schema requirements. */
export function validateAlmanacSchema(schema: AlmanacSchema): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema.version) errors.push("missing version");
  if (schema.section !== "§4_Trends") errors.push("wrong section");
  if (!schema.forecast_id) errors.push("missing forecast_id");
  if (!schema.session) errors.push("missing session");
  if (!schema.authored) errors.push("missing authored");
  if (schema.pattern_count < 0) errors.push("invalid pattern_count");
  if (!schema.content_md.includes("## Almanac §4")) errors.push("content_md missing header");
  if (!schema.content_md.includes("### Pattern Library")) errors.push("content_md missing Pattern Library section");
  if (!schema.content_md.includes("### Forward Projections")) errors.push("content_md missing Forward Projections section");
  if (!schema.content_md.includes("### Canon Classification")) errors.push("content_md missing Canon Classification section");

  return { valid: errors.length === 0, errors };
}

/** Render pattern library section. */
function renderPatternLibrary(patterns: Pattern[]): string {
  if (patterns.length === 0) return "_No patterns detected._\n";
  const rows = patterns.slice(0, 20).map(p =>
    `| ${p.pattern_id} | ${p.structure_description} | ${(p.confidence * 100).toFixed(0)}% | ${p.period ?? "—"} | ${["regex", "periodicity", "correlation", "graph_motif"][p.detected_by_strategy] ?? p.detected_by_strategy} |`
  );
  return [
    "| Pattern ID | Description | Confidence | Period | Strategy |",
    "|---|---|---|---|---|",
    ...rows,
    patterns.length > 20 ? `\n_...and ${patterns.length - 20} more patterns._` : "",
  ].join("\n");
}

/** Render forward projections section. */
function renderProjections(projections: PatternProjection[]): string {
  if (projections.length === 0) return "_No projections computed._\n";
  const rows = projections.slice(0, 15).map(p => {
    const h5 = p.confidence_bands.find(b => b.horizon === 5);
    const h10 = p.confidence_bands.find(b => b.horizon === 10);
    const h20 = p.confidence_bands.find(b => b.horizon === 20);
    return [
      `| ${p.pattern_id}`,
      `${["linear", "exp_smooth", "arima", "ensemble"][p.strategy_index] ?? p.strategy_index}`,
      h5 ? `${h5.predicted_values[0].toFixed(2)} (${(h5.within_20pct_fraction * 100).toFixed(0)}%)` : "—",
      h10 ? `${h10.predicted_values[0].toFixed(2)} (${(h10.within_20pct_fraction * 100).toFixed(0)}%)` : "—",
      h20 ? `${h20.predicted_values[0].toFixed(2)} (${(h20.within_20pct_fraction * 100).toFixed(0)}%)` : "—",
      `${(p.calibration_score * 100).toFixed(0)}% |`,
    ].join(" | ");
  });
  return [
    "| Pattern ID | Strategy | Next-5 | Next-10 | Next-20 | Calibration |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

/** Render canon classification section. */
function renderClassifications(classifications: CohortClassification[]): string {
  if (classifications.length === 0) return "_No classifications computed._\n";
  const canons = classifications.filter(c => c.canon_class);
  const bushels = classifications.filter(c => !c.canon_class);

  return [
    `**Canon-class patterns (spans ≥3 BP-cohorts):** ${canons.length}`,
    `**Bushel-class patterns (within-cohort):** ${bushels.length}`,
    "",
    "**Canon-class breakdown:**",
    ...canons.slice(0, 10).map(c =>
      `- \`${c.pattern_id}\` — cohorts: ${c.cohort_span.join(", ")} | founder_corr: ${c.founder_correlation.toFixed(2)} | conf: ${(c.confidence * 100).toFixed(0)}%`
    ),
  ].join("\n");
}

/**
 * Render a ProphetForecast into Almanac §4 format.
 * Returns an AlmanacSchema with structured metadata + Markdown content.
 *
 * G6 gate: output must pass validateAlmanacSchema().
 */
export function renderAlmanac(forecast: ProphetForecast): AlmanacSchema {
  const canonCount = forecast.classifications.filter(c => c.canon_class).length;
  const meanCalib = forecast.projections.length > 0
    ? forecast.projections.reduce((s, p) => s + p.calibration_score, 0) / forecast.projections.length
    : 0;

  const content_md = [
    `## Almanac §4 — Trends & Forward Projections`,
    ``,
    `> **Prophet Circuit K31** | Session: ${forecast.session} | ${forecast.authored}`,
    `> Synthesis strategy: \`${forecast.synthesis_strategy}\` | Forecast ID: \`${forecast.forecast_id}\``,
    ``,
    `### Pattern Library`,
    ``,
    renderPatternLibrary(forecast.patterns_detected),
    ``,
    `### Forward Projections`,
    ``,
    renderProjections(forecast.projections),
    ``,
    `### Canon Classification`,
    ``,
    renderClassifications(forecast.classifications),
    ``,
    `### Forward Summary`,
    ``,
    forecast.forward_summary,
    ``,
    `---`,
    `_Generated by Prophet Circuit K31 (LB-STACK-0195) — Decision-Class Trinity vertex: Foresee_`,
  ].join("\n");

  return {
    version: "B79_BP034",
    section: "§4_Trends",
    forecast_id: forecast.forecast_id,
    session: forecast.session,
    authored: forecast.authored,
    pattern_count: forecast.patterns_detected.length,
    projection_count: forecast.projections.length,
    classification_count: forecast.classifications.length,
    canon_class_count: canonCount,
    mean_calibration: meanCalib,
    synthesis_strategy: forecast.synthesis_strategy,
    content_md,
  };
}

/** Write rendered Almanac §4 to disk. */
export async function writeAlmanacSection(schema: AlmanacSchema, outPath: string): Promise<void> {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, schema.content_md);
}
