/**
 * Stats-Capture Aggregate Query — KN-S3 / BP018
 * ===============================================
 * Scans telemetry subdirs and returns aggregate counts.
 * BRIDLE Rule 4: data_available=false if telemetry root inaccessible.
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { TELEMETRY_ROOT } from "./harness.js";

export type AggregateResult = {
  data_available: boolean;
  hours_window: number;
  total: number;
  by_outcome: { pass: number; fail: number; errored: number; in_flight: number };
  by_tier: { live: number; failed: number; anomaly: number; protected: number };
  by_k_prompt: Record<string, number>;
  cost_accounting: {
    actual_spend_usd: number;
    counterfactual_estimate_usd: number;
    savings_usd: number;
    savings_pct: number;
  };
  error?: string;
};

function readJsonSnap(filepath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(filepath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function scanDir(dir: string, cutoffMs: number): Array<Record<string, unknown>> {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const results: Array<Record<string, unknown>> = [];
  const now = Date.now();
  for (const f of files) {
    const snap = readJsonSnap(resolve(dir, f));
    if (!snap) continue;
    // Filter by timestamp if present
    if (snap.timestamp && typeof snap.timestamp === "string") {
      const age = now - new Date(snap.timestamp).getTime();
      if (age > cutoffMs) continue;
    }
    results.push(snap);
  }
  return results;
}

export function queryAggregate(opts: {
  hours?: number;
  k_prompt_pattern?: string;
  cohort_class?: string;
  root?: string;
}): AggregateResult {
  const { hours = 24, k_prompt_pattern, cohort_class, root = TELEMETRY_ROOT } = opts;
  const cutoffMs = hours * 60 * 60 * 1000;

  try {
    const live      = scanDir(resolve(root, "live"),      cutoffMs);
    const failed    = scanDir(resolve(root, "failed"),    cutoffMs);
    const anomaly   = scanDir(resolve(root, "anomaly"),   cutoffMs);
    const protected_ = scanDir(resolve(root, "protected"), cutoffMs);

    const allSnaps = [...live, ...failed, ...anomaly, ...protected_];

    // Apply pattern filters
    const filtered = allSnaps.filter((s) => {
      if (k_prompt_pattern) {
        const src = String(s.k_prompt_source ?? "");
        const section = String(s.k_prompt_section ?? "");
        const pat = k_prompt_pattern.replace(/\*/g, ".*");
        const re = new RegExp(pat, "i");
        if (!re.test(src) && !re.test(section)) return false;
      }
      return true;
    });

    // Aggregate counts
    const by_outcome = { pass: 0, fail: 0, errored: 0, in_flight: 0 };
    const by_k_prompt: Record<string, number> = {};
    let actual_spend = 0;
    let counterfactual = 0;

    for (const s of filtered) {
      const outcome = String(s.outcome ?? "in_flight") as keyof typeof by_outcome;
      if (outcome in by_outcome) by_outcome[outcome]++;

      const kprompt = String(s.k_prompt_section ?? s.k_prompt_source ?? "unknown");
      by_k_prompt[kprompt] = (by_k_prompt[kprompt] ?? 0) + 1;

      actual_spend += Number(s.vendor_api_spend_usd ?? 0);
      counterfactual += Number(s.counterfactual_cost_estimate_usd ?? 0);
    }

    const savings = counterfactual - actual_spend;
    const savings_pct = counterfactual > 0 ? (savings / counterfactual) * 100 : 0;

    return {
      data_available: true,
      hours_window: hours,
      total: filtered.length,
      by_outcome,
      by_tier: {
        live: live.length,
        failed: failed.length,
        anomaly: anomaly.length,
        protected: protected_.length,
      },
      by_k_prompt,
      cost_accounting: {
        actual_spend_usd: Math.round(actual_spend * 10000) / 10000,
        counterfactual_estimate_usd: Math.round(counterfactual * 10000) / 10000,
        savings_usd: Math.round(savings * 10000) / 10000,
        savings_pct: Math.round(savings_pct * 100) / 100,
      },
    };
  } catch (err) {
    return {
      data_available: false,
      hours_window: hours,
      total: 0,
      by_outcome: { pass: 0, fail: 0, errored: 0, in_flight: 0 },
      by_tier: { live: 0, failed: 0, anomaly: 0, protected: 0 },
      by_k_prompt: {},
      cost_accounting: { actual_spend_usd: 0, counterfactual_estimate_usd: 0, savings_usd: 0, savings_pct: 0 },
      error: String(err),
    };
  }
}
