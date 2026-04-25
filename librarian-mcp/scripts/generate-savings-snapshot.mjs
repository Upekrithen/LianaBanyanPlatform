/**
 * SAVINGS SNAPSHOT GENERATOR — K505 Phase D support
 * ==================================================
 * Reads substrate_savings_log.jsonl and writes platform/public/founder-savings-data.json
 * so the FounderSavingsDashboard React page can load it as a static asset.
 *
 * Usage:
 *   node scripts/generate-savings-snapshot.mjs
 *
 * Or via package.json:
 *   npm run generate:savings-snapshot
 *
 * Add to npm run build via package.json scripts if you want auto-generation.
 * The output file is gitignored (operational data, not source code).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const SAVINGS_LOG = resolve(REPO_ROOT, "stitchpunks", "data", "substrate_savings_log.jsonl");
const OUT_DIR = resolve(REPO_ROOT, "..", "platform", "public");
const OUT_FILE = resolve(OUT_DIR, "founder-savings-data.json");

// Cold multipliers per agent (K505 provisional)
const COLD_MULTIPLIERS = { BISHOP: 3.0, KNIGHT: 2.5, PAWN: 3.5, ROOK: 2.5 };

function readLog() {
  if (!existsSync(SAVINGS_LOG)) return [];
  const raw = readFileSync(SAVINGS_LOG, "utf-8").trim();
  if (!raw) return [];
  return raw.split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

function filterWindow(records, windowMs) {
  if (!isFinite(windowMs)) return records;
  const now = Date.now();
  return records.filter((r) => now - new Date(r.ts).getTime() <= windowMs);
}

function buildWindowSummary(records) {
  const byAgent = {};
  for (const r of records) {
    (byAgent[r.agent] = byAgent[r.agent] ?? []).push(r);
  }

  const by_agent = Object.entries(byAgent).map(([agent, recs]) => ({
    agent,
    sessions: recs.length,
    total_input_tokens: recs.reduce((s, r) => s + (r.input_tokens || 0), 0),
    total_output_tokens: recs.reduce((s, r) => s + (r.output_tokens || 0), 0),
    total_actual_cost_usd: Math.round(recs.reduce((s, r) => s + (r.actual_cost_usd || 0), 0) * 100) / 100,
    total_counterfactual_usd: Math.round(recs.reduce((s, r) => s + (r.counterfactual_cost_usd || 0), 0) * 100) / 100,
    total_savings_usd: Math.round(recs.reduce((s, r) => s + (r.session_savings_usd || 0), 0) * 100) / 100,
    total_substrate_overhead_tokens: recs.reduce((s, r) => s + (r.substrate_overhead_tokens || 0), 0),
    avg_cold_multiplier: COLD_MULTIPLIERS[agent] ?? 2.5,
  }));

  const totals = {
    sessions: records.length,
    total_actual_cost_usd: Math.round(records.reduce((s, r) => s + (r.actual_cost_usd || 0), 0) * 100) / 100,
    total_counterfactual_usd: Math.round(records.reduce((s, r) => s + (r.counterfactual_cost_usd || 0), 0) * 100) / 100,
    total_savings_usd: Math.round(records.reduce((s, r) => s + (r.session_savings_usd || 0), 0) * 100) / 100,
    total_substrate_overhead_tokens: records.reduce((s, r) => s + (r.substrate_overhead_tokens || 0), 0),
  };

  return { totals, by_agent, entries: records.length };
}

function main() {
  const all = readLog();
  console.log(`Read ${all.length} records from substrate_savings_log.jsonl`);

  const windows = {
    all:  buildWindowSummary(filterWindow(all, Infinity)),
    "7d": buildWindowSummary(filterWindow(all, 7 * 86400000)),
    "30d": buildWindowSummary(filterWindow(all, 30 * 86400000)),
  };

  const snapshot = {
    generated_at: new Date().toISOString(),
    windows,
    multiplier_provisional: true,
    calibration_note:
      "Cold multipliers (Bishop 3.0×, Knight 2.5×, Pawn 3.5×) are evidence-informed estimates from R13 empirical baseline. Calibration runs every 30 days per K505 Phase E plan.",
    earliest_record: all.length > 0 ? all[0].ts : null,
    latest_record: all.length > 0 ? all[all.length - 1].ts : null,
    total_all_time_entries: all.length,
  };

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2), "utf-8");

  console.log(`✅ Savings snapshot written to ${OUT_FILE}`);
  console.log(`   All-time sessions: ${windows.all.entries}`);
  console.log(`   All-time savings:  $${windows.all.totals.total_savings_usd.toFixed(2)}`);
  console.log(`   7-day savings:     $${windows["7d"].totals.total_savings_usd.toFixed(2)}`);
  console.log(`   30-day savings:    $${windows["30d"].totals.total_savings_usd.toFixed(2)}`);
}

main();
