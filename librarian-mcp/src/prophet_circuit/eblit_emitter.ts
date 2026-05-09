/**
 * Prophet Circuit — Eblit Emitter
 * Writes Prophet Circuit events (pattern_detected, forecast_emitted, canon_confirmed)
 * to the A+F Ledger and pheromone substrate.
 * K31 Prophet Circuit (LB-STACK-0195) — Bushel 79 BP034.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { emitPheromone } from "../scribes/pheromone.js";
import type { ProphetForecast, ProphetCircuitReceipt } from "./types.js";

function ebletDir(): string {
  const dir = resolve(homedir(), ".lb-session", "prophet_circuit");
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Emit an Eblit snapshot when a pattern is detected (flip-the-script event). */
export function emitPatternDetectedEblit(
  patternId: string,
  confidence: number,
  session: string,
): void {
  try {
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      kind: "prophet_circuit_pattern_detected",
      pattern_id: patternId,
      confidence,
      session,
      eblit_class: "K31_ProphetCircuit_pattern",
      stack_row: "LB-STACK-0195",
    }) + "\n";
    appendFileSync(resolve(ebletDir(), "pattern_detected_ledger.jsonl"), entry);
  } catch { /* non-fatal */ }
}

/** Emit an Eblit snapshot when a ProphetForecast is synthesized. */
export function emitForecastEblit(forecast: ProphetForecast, session: string): void {
  try {
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      kind: "prophet_circuit_forecast_emitted",
      forecast_id: forecast.forecast_id,
      patterns_count: forecast.patterns_detected.length,
      projections_count: forecast.projections.length,
      classifications_count: forecast.classifications.length,
      synthesis_strategy: forecast.synthesis_strategy,
      session,
      eblit_class: "K31_ProphetCircuit_forecast",
      stack_row: "LB-STACK-0195",
    }) + "\n";
    appendFileSync(resolve(ebletDir(), "forecast_ledger.jsonl"), entry);

    emitPheromone("prophet_circuit", forecast.forecast_id, [
      `prophet_forecast`,
      `strategy:${forecast.synthesis_strategy}`,
      `patterns:${forecast.patterns_detected.length}`,
    ].join(" | "), {
      cathedral: "knight",
      synthesisClass: "prophet_circuit_forecast",
      ts: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}

/** Emit full K31 reduction-to-practice receipt to A+F Ledger. */
export async function emitK31Receipt(
  receipt: ProphetCircuitReceipt,
  session: string,
): Promise<void> {
  try {
    const { ironTabletWrite } = await import("../iron_tablet/iron_tablet.js");
    const ebletPath = resolve(ebletDir(), "K31_prophet_circuit_receipt.json");

    await ironTabletWrite({
      scribeId: "prophet_circuit",
      ebletPath,
      content: JSON.stringify(receipt, null, 2),
      provenance: { session, decisionId: "K31_ProphetCircuit_RTP_B79" },
    });
  } catch (e) {
    const { writeFileSync, mkdirSync: md } = await import("node:fs");
    const dir = resolve(homedir(), ".lb-session", "prophet_circuit");
    md(dir, { recursive: true });
    writeFileSync(resolve(dir, "K31_prophet_circuit_receipt.json"), JSON.stringify(receipt, null, 2));
  }
}

/** Emit canon Eblet file for K31 kernel slot confirmation. */
export async function emitCanonEblet(receipt: ProphetCircuitReceipt): Promise<string> {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { resolve: r } = await import("node:path");
  const { homedir: hd } = await import("node:os");

  const canonDir = r(hd(), ".claude", "state", "eblets", "CANON");
  mkdirSync(canonDir, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const path = r(canonDir, `prophet_circuit_k31_${ts}.eblet.md`);

  const content = [
    `# K31 Prophet Circuit — Canon Eblet`,
    `**Kernel slot:** K31 (LB-STACK-0195 / LB-CODEX-0185)`,
    `**Verdict:** ${receipt.k31_verdict}`,
    `**Session:** ${receipt.session}`,
    `**Authored:** ${receipt.authored}`,
    ``,
    `## Empirical Receipt`,
    `\`\`\`json`,
    JSON.stringify({
      version: "B79_BP034",
      hypothesis_pass_rate: [receipt.h1.h1_pass, receipt.h2.h2_pass, receipt.h3.h3_pass].filter(Boolean).length / 3,
      accuracy_threshold: { h1: "≥75%", h2: "≥70%", h3: "≥80%" },
      hardened_metrics: {
        h1_accuracy: receipt.h1.accuracy.toFixed(4),
        h2_calibration: receipt.h2.mean_calibration.toFixed(4),
        h3_accuracy: receipt.h3.accuracy.toFixed(4),
      },
    }, null, 2),
    `\`\`\``,
    ``,
    `## H1: Pattern Detection`,
    `- Accuracy: ${(receipt.h1.accuracy * 100).toFixed(1)}% (target ≥75%) → **${receipt.h1.h1_pass ? "PASS" : "FAIL"}**`,
    `- Precision: ${(receipt.h1.precision * 100).toFixed(1)}%`,
    `- Recall: ${(receipt.h1.recall * 100).toFixed(1)}%`,
    ``,
    `## H2: Trend Extrapolation`,
    `- Mean calibration: ${(receipt.h2.mean_calibration * 100).toFixed(1)}% within ±20% CI (target ≥70%) → **${receipt.h2.h2_pass ? "PASS" : "FAIL"}**`,
    `- Horizons: 5, 10, 20 Bushels`,
    ``,
    `## H3: Cross-Cohort Recognition`,
    `- Accuracy: ${(receipt.h3.accuracy * 100).toFixed(1)}% (target ≥80%) → **${receipt.h3.h3_pass ? "PASS" : "FAIL"}**`,
    ``,
    `## Trinity Position`,
    `K28 (Hygiene) + K29 (Oracle) + K30 (Contingency) + **K31 (Prophet)** = Decision-Class Trinity COMPLETE`,
    ``,
    `## Trademark Positioning`,
    `K31 is an **architectural metaphor** for the "forward-pattern projection decision-class kernel."`,
    `Avoid literal "circuit" descriptions; use "kernel slot" or "decision-class primitive."`,
  ].join("\n");

  writeFileSync(path, content);
  return path;
}
