/**
 * Prophet Circuit — Eblit Emitter
 * Writes Prophet Circuit events to the A+F Ledger.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

function ledgerDir(): string {
  const dir = resolve(homedir(), ".lb-session", "prophet_circuit");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function emitPatternDetectionEblit(
  patternId: string,
  patternClass: string,
  confidence: number,
  session: string,
): void {
  try {
    const entry = JSON.stringify({
      event: "prophet_pattern_detected",
      pattern_id: patternId,
      pattern_class: patternClass,
      confidence,
      session,
      eblit_class: "K31_ProphetCircuit_pattern",
      stack_row: "LB-STACK-0195",
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ledgerDir(), "pattern_ledger.jsonl"), entry + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

export function emitProjectionEblit(
  patternId: string,
  horizon: number,
  projectedValue: number,
  within20: boolean,
  session: string,
): void {
  try {
    const entry = JSON.stringify({
      event: "prophet_projection",
      pattern_id: patternId,
      horizon_bushels: horizon,
      projected_value: projectedValue,
      within_20pct: within20,
      session,
      eblit_class: "K31_ProphetCircuit_projection",
      stack_row: "LB-STACK-0195",
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ledgerDir(), "projection_ledger.jsonl"), entry + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

export function emitCanonClassificationEblit(
  patternId: string,
  isCanon: boolean,
  cohortSpan: number[],
  session: string,
): void {
  try {
    const entry = JSON.stringify({
      event: "prophet_canon_classification",
      pattern_id: patternId,
      is_canon_class: isCanon,
      cohort_span: cohortSpan,
      session,
      eblit_class: "K31_ProphetCircuit_canon",
      stack_row: "LB-STACK-0195",
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ledgerDir(), "canon_ledger.jsonl"), entry + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

export function emitForecastEblit(
  session: string,
  metaStrategy: string,
  patternCount: number,
  projectionCount: number,
): void {
  try {
    const entry = JSON.stringify({
      event: "prophet_forecast_emitted",
      meta_strategy: metaStrategy,
      pattern_count: patternCount,
      projection_count: projectionCount,
      session,
      eblit_class: "K31_ProphetCircuit_forecast",
      stack_row: "LB-STACK-0195",
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ledgerDir(), "forecast_ledger.jsonl"), entry + "\n", "utf-8");
  } catch { /* non-fatal */ }
}
