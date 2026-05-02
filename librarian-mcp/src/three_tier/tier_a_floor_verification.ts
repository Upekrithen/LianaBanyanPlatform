/**
 * Tier A Floor Verification Harness — KN-H2 / BP017
 * ====================================================
 * Verifies that Cathedral Effect lift holds at Tier A (default-plan) config.
 *
 * Sources empirical data from R10 cross-vendor benchmark results
 * (librarian-mcp/r10_cross_vendor/results/). Calculates HOT-rate and
 * lift-vs-cold-baseline across all vendor pairs. Checks ≥30pp lift target.
 *
 * BRIDLE Rule 4 + Rule 5:
 *   If lift_pp_min < TARGET_LIFT_PP, this process exits non-zero and writes
 *   an ERROR receipt. Do NOT silently document inflated numbers.
 *
 * Usage:
 *   npx ts-node librarian-mcp/src/three_tier/tier_a_floor_verification.ts
 *
 * Output:
 *   BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

// ─── Config ──────────────────────────────────────────────────────────────────

const TARGET_LIFT_PP = 30; // ≥30pp required; BRIDLE Rule 5 halts if not met
const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const R10_RESULTS_DIR = join(WORKSPACE_ROOT, "librarian-mcp/r10_cross_vendor/results");
const RECEIPT_PATH = join(
  WORKSPACE_ROOT,
  "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json"
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface VendorResult {
  vendor: string;
  model: string;
  condition: "hot" | "cold";
  n_questions: number;
  accuracy_pct: number;
}

interface BenchmarkSummary {
  benchmark: string;
  vendor_results: Record<string, VendorResult>;
  timestamp: string;
}

interface VendorPairLift {
  vendor: string;
  model: string;
  cold_accuracy_pct: number;
  hot_accuracy_pct: number;
  lift_pp: number;
  meets_target: boolean;
}

export interface TierAFloorReceipt {
  schema_version: "1.0";
  generated_at: string;
  tier: "needs";
  tier_label: "Tier A — NEEDS";
  benchmark: string;
  benchmark_run: string;
  refs: string[];
  n_vendor_pairs: number;
  vendor_pairs: VendorPairLift[];
  cold_accuracy_pct_min: number;
  cold_accuracy_pct_max: number;
  hot_accuracy_pct_min: number;
  hot_accuracy_pct_max: number;
  lift_pp_min: number;
  lift_pp_max: number;
  lift_pp_mean: number;
  target_lift_pp: number;
  empirical_floor_pass: boolean;
  empirical_floor_note: string;
  bridle_rule_4_applied: boolean;
  receipt_path: string;
}

// ─── Load benchmark results ──────────────────────────────────────────────────

function findBestRun(resultsDir: string): string | null {
  if (!existsSync(resultsDir)) return null;
  const runs = readdirSync(resultsDir)
    .filter((name) => name.startsWith("run_") && !name.endsWith(".md"))
    .sort()
    .reverse(); // most recent first
  return runs.length > 0 ? join(resultsDir, runs[0]) : null;
}

function loadSummary(runDir: string): BenchmarkSummary | null {
  const summaryPath = join(runDir, "summary.json");
  if (!existsSync(summaryPath)) return null;
  try {
    return JSON.parse(readFileSync(summaryPath, "utf-8")) as BenchmarkSummary;
  } catch {
    return null;
  }
}

// ─── Calculate lift per vendor pair ─────────────────────────────────────────

function calculateVendorPairs(summary: BenchmarkSummary): VendorPairLift[] {
  const results = summary.vendor_results;
  const pairs: VendorPairLift[] = [];

  // Group by vendor+model — find cold/hot pairs
  const keys = Object.keys(results);
  const hotKeys = keys.filter((k) => k.endsWith("_hot"));

  for (const hotKey of hotKeys) {
    const coldKey = hotKey.replace(/_hot$/, "_cold");
    if (!results[hotKey] || !results[coldKey]) continue;

    const hot = results[hotKey];
    const cold = results[coldKey];
    const lift_pp = hot.accuracy_pct - cold.accuracy_pct;

    pairs.push({
      vendor: hot.vendor,
      model: hot.model,
      cold_accuracy_pct: cold.accuracy_pct,
      hot_accuracy_pct: hot.accuracy_pct,
      lift_pp,
      meets_target: lift_pp >= TARGET_LIFT_PP,
    });
  }

  return pairs.sort((a, b) => b.lift_pp - a.lift_pp);
}

// ─── Helper: floor note builder ─────────────────────────────────────────────

function buildFloorNote(
  pass: boolean,
  n: number,
  liftMin: number,
  liftMax: number,
  liftMean: number,
  allMeet: boolean,
  target: number
): string {
  if (pass) {
    const suffix = allMeet ? "" : " NOTE: Some pairs below target — see vendor_pairs for details.";
    const meanRounded = Math.round(liftMean * 10) / 10;
    return (
      `PASS: All ${n} vendor pairs show Cathedral Effect lift ≥ ${target}pp over cold baseline at Tier A default-plan config. ` +
      `Min lift: ${liftMin}pp. Max lift: ${liftMax}pp. Mean lift: ${meanRounded}pp. ` +
      `Tier A empirical floor confirmed — retrieval quality is substrate-dependent, not plan-dependent.` +
      suffix
    );
  }
  return (
    `FAIL: Minimum lift ${liftMin}pp is below target ${target}pp. ` +
    `BRIDLE Rule 4/5: Do NOT document this as a passing receipt. Review R10 results and re-run.`
  );
}

// ─── Main verification ────────────────────────────────────────────────────────

export function runTierAFloorVerification(): TierAFloorReceipt {
  const generated_at = new Date().toISOString();

  // Find and load the most recent R10 benchmark run
  const runDir = findBestRun(R10_RESULTS_DIR);
  if (!runDir) {
    const errorReceipt: TierAFloorReceipt = {
      schema_version: "1.0",
      generated_at,
      tier: "needs",
      tier_label: "Tier A — NEEDS",
      benchmark: "R10-v1",
      benchmark_run: "MISSING",
      refs: [],
      n_vendor_pairs: 0,
      vendor_pairs: [],
      cold_accuracy_pct_min: 0,
      cold_accuracy_pct_max: 0,
      hot_accuracy_pct_min: 0,
      hot_accuracy_pct_max: 0,
      lift_pp_min: 0,
      lift_pp_max: 0,
      lift_pp_mean: 0,
      target_lift_pp: TARGET_LIFT_PP,
      empirical_floor_pass: false,
      empirical_floor_note:
        "BRIDLE Rule 4/5 ERROR: R10 benchmark results directory not found at expected path. " +
        "Cannot document empirical floor. Run R10 benchmark first.",
      bridle_rule_4_applied: true,
      receipt_path: RECEIPT_PATH,
    };
    return errorReceipt;
  }

  const summary = loadSummary(runDir);
  if (!summary) {
    throw new Error(`BRIDLE Rule 4/5: Could not parse summary.json at ${runDir}`);
  }

  const pairs = calculateVendorPairs(summary);
  if (pairs.length === 0) {
    throw new Error(
      "BRIDLE Rule 4/5 ERROR: No vendor pairs found in benchmark results. Cannot verify empirical floor."
    );
  }

  const coldValues = pairs.map((p) => p.cold_accuracy_pct);
  const hotValues = pairs.map((p) => p.hot_accuracy_pct);
  const liftValues = pairs.map((p) => p.lift_pp);

  const lift_pp_min = Math.min(...liftValues);
  const lift_pp_max = Math.max(...liftValues);
  const lift_pp_mean = liftValues.reduce((a, b) => a + b, 0) / liftValues.length;
  const empirical_floor_pass = lift_pp_min >= TARGET_LIFT_PP;
  const allPairsMeetTarget = pairs.every((p) => p.meets_target);

  const runDirName = runDir.split(/[\\/]/).pop() ?? "unknown";

  const receipt: TierAFloorReceipt = {
    schema_version: "1.0",
    generated_at,
    tier: "needs",
    tier_label: "Tier A — NEEDS",
    benchmark: summary.benchmark ?? "R10-v1",
    benchmark_run: runDirName,
    refs: ["K477", "K481", "R10-cross-vendor", `r10_cross_vendor/results/${runDirName}`],
    n_vendor_pairs: pairs.length,
    vendor_pairs: pairs,
    cold_accuracy_pct_min: Math.min(...coldValues),
    cold_accuracy_pct_max: Math.max(...coldValues),
    hot_accuracy_pct_min: Math.min(...hotValues),
    hot_accuracy_pct_max: Math.max(...hotValues),
    lift_pp_min,
    lift_pp_max,
    lift_pp_mean: Math.round(lift_pp_mean * 10) / 10,
    target_lift_pp: TARGET_LIFT_PP,
    empirical_floor_pass,
    empirical_floor_note: buildFloorNote(
      empirical_floor_pass,
      pairs.length,
      lift_pp_min,
      lift_pp_max,
      lift_pp_mean,
      allPairsMeetTarget,
      TARGET_LIFT_PP
    ),
    bridle_rule_4_applied: !empirical_floor_pass,
    receipt_path: RECEIPT_PATH,
  };

  return receipt;
}

// ─── Write receipt and exit ───────────────────────────────────────────────────

function main() {
  console.log("KN-H2 Tier A Floor Verification — running...");

  let receipt: TierAFloorReceipt;
  try {
    receipt = runTierAFloorVerification();
  } catch (err) {
    console.error(`ERROR: ${String(err)}`);
    process.exit(1);
  }

  const json = JSON.stringify(receipt, null, 2);
  writeFileSync(RECEIPT_PATH, json, "utf-8");

  console.log(`\nReceipt written to: ${RECEIPT_PATH}`);
  console.log(`  Benchmark: ${receipt.benchmark} (${receipt.benchmark_run})`);
  console.log(`  Vendor pairs: ${receipt.n_vendor_pairs}`);
  console.log(
    `  Cold baseline: ${receipt.cold_accuracy_pct_min}% – ${receipt.cold_accuracy_pct_max}%`
  );
  console.log(
    `  Hot (Tier A): ${receipt.hot_accuracy_pct_min}% – ${receipt.hot_accuracy_pct_max}%`
  );
  console.log(`  Lift: ${receipt.lift_pp_min}pp – ${receipt.lift_pp_max}pp`);
  console.log(`  Target ≥${receipt.target_lift_pp}pp: ${receipt.empirical_floor_pass ? "PASS ✓" : "FAIL ✗"}`);
  console.log(`\n${receipt.empirical_floor_note}`);

  // BRIDLE Rule 5: exit non-zero if floor not met
  if (!receipt.empirical_floor_pass) {
    console.error(
      "\nBRIDLE Rule 4/5 HALT: Empirical floor verification FAILED. " +
        "Do NOT document Tier A as meeting floor spec. Review and re-run."
    );
    process.exit(1);
  }

  process.exit(0);
}

main();
