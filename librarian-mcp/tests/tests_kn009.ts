/**
 * tests_kn009.ts — Chandelier Empirical-Measurement-Substrate TypeScript tests
 * KN009 / A&A #2291 Bedrock Foundation
 *
 * Tests the chandelier Python stack via the same temp-file bridge used in server.ts,
 * verifying that all 7 MCP tool snippets return expected schemas.
 *
 * Run: npx tsx --test tests/tests_kn009.ts
 *      (from librarian-mcp/)
 *
 * Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

// ── Path constants ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");
const CHANDELIER_STITCH_DIR = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks");

// ── Helper: run Python snippet with chandelier paths ──────────────────────────

function runChand(pySnippet: string, args: unknown): unknown {
  const stamp = `${Date.now()}_${process.pid}_ts`;
  const argsTmp = resolve(tmpdir(), `liana_args_${stamp}.json`);
  const codeTmp = resolve(tmpdir(), `liana_chand_ts_${stamp}.py`);

  const fullCode = [
    "import sys, json",
    `sys.path.insert(0, r"${WORKSPACE_ROOT}")`,
    `sys.path.insert(0, r"${CHANDELIER_STITCH_DIR}")`,
    `with open(r"${argsTmp}", encoding="utf-8") as _f:`,
    `    _args = json.load(_f)`,
    pySnippet.trim(),
    "print(json.dumps(result, default=str))",
  ].join("\n");

  try {
    writeFileSync(argsTmp, JSON.stringify(args), "utf-8");
    writeFileSync(codeTmp, fullCode, "utf-8");
    const out = execSync(`python "${codeTmp}"`, {
      encoding: "utf-8",
      timeout: 30000,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    return JSON.parse(out.trim());
  } catch (err) {
    return { error: String(err) };
  } finally {
    try { unlinkSync(argsTmp); } catch { /* ignore */ }
    try { unlinkSync(codeTmp); } catch { /* ignore */ }
  }
}

// ── Helper: seed a test receipt and return its index ─────────────────────────

function seedTestReceipt(primitive_id: string, metric: string): unknown {
  return runChand(
    `from chandelier.chandelier_runner_l1 import run_l1
result = run_l1(
    primitive_id=_args["primitive_id"],
    metric=_args["metric"],
    baseline_score=0.5,
    baseline_description="baseline",
    treatment_score=0.8,
    treatment_description="treatment",
    session_id="KN009-TS-TEST",
)`,
    { primitive_id, metric }
  );
}

// ═══════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════

describe("Chandelier MCP tool snippets — schema + correctness (KN009)", () => {

  it("T1: Python chandelier package importable from STITCH_DIR path", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
index = build_index()
result = {"ok": True, "total_receipts": index.total_receipts()}`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Import failed: ${JSON.stringify(result)}`);
    assert.equal(result.ok, true);
    assert.ok(typeof result.total_receipts === "number");
  });

  it("T2: chandelier_query_receipts — returns receipts array with count", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
index = build_index()
receipts = index.query(
    primitive_ids=_args["primitive_ids"],
    metric=_args.get("metric"),
)
result = {"receipts": receipts, "count": len(receipts)}`,
      { primitive_ids: ["cathedral_effect"], metric: "hot_accuracy_pct" }
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("receipts" in result);
    assert.ok("count" in result);
    assert.ok(typeof result.count === "number");
  });

  it("T3: chandelier_query_receipts — L2 synergy receipt has synergy_delta field", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
index = build_index()
receipts = index.query(
    primitive_ids=["cathedral_effect", "wrasse_scribe"],
    metric="combined_accuracy_pct",
)
result = {"receipts": receipts, "count": len(receipts)}`,
      {}
    ) as { receipts: Array<Record<string, unknown>>; count: number };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    if (result.count > 0) {
      const r = result.receipts[0];
      assert.ok("synergy_delta" in r, "L2 receipt missing synergy_delta");
      assert.ok("decomposition" in r, "L2 receipt missing decomposition");
    }
  });

  it("T4: chandelier_compare_modes — basic_stock + modified_stock returned", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.three_mode_comparator import ThreeModeComparator
index = build_index()
cmp = ThreeModeComparator(index)
result = cmp.compare(
    subset=["cathedral_effect", "wrasse_scribe"],
    metric="hot_accuracy_pct",
    basic_stock_primitive="cathedral_effect",
)`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("basic_stock" in result);
    assert.ok("modified_stock" in result);
    assert.ok("comparison_summary" in result);
  });

  it("T5: chandelier_compare_modes — full_stack returned when all_primitive_ids provided", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.three_mode_comparator import ThreeModeComparator
index = build_index()
cmp = ThreeModeComparator(index)
result = cmp.compare(
    subset=["cathedral_effect", "wrasse_scribe"],
    metric="hot_accuracy_pct",
    all_primitive_ids=["cathedral_effect", "wrasse_scribe", "pheromone_substrate"],
)`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("full_stack" in result, "full_stack not in result");
  });

  it("T6: chandelier_right_recipe — returns found flag and subsets_evaluated", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.three_mode_comparator import ThreeModeComparator
index = build_index()
cmp = ThreeModeComparator(index)
result = cmp._compute_right_recipe(
    all_primitive_ids=["cathedral_effect", "wrasse_scribe"],
    metric="hot_accuracy_pct",
    max_k=2,
)`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("found" in result);
    assert.ok("subsets_evaluated" in result);
  });

  it("T7: chandelier_query_prerequisites — returns layer + hard_prerequisites", () => {
    const result = runChand(
      `from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
result = {
    "primitive_id": "cathedral_effect",
    "layer": g.query_layer("cathedral_effect"),
    "hard_prerequisites": g.query_prerequisites("cathedral_effect"),
    "soft_enhancers": g.query_enhancers("cathedral_effect"),
}`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.layer, "building");
    assert.ok(Array.isArray(result.hard_prerequisites));
    assert.ok((result.hard_prerequisites as string[]).includes("wrasse_scribe"));
  });

  it("T8: chandelier_validate_subset — valid subset returns valid=true", () => {
    const result = runChand(
      `from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
# stone_tablet_imperative has no prerequisites — always valid alone
valid, missing = g.validate_substrate_subset(["stone_tablet_imperative"])
result = {"valid": valid, "missing": missing}`,
      {}
    ) as { valid: boolean; missing: string[] };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.valid, true);
    assert.equal(result.missing.length, 0);
  });

  it("T9: chandelier_validate_subset — invalid subset returns valid=false", () => {
    const result = runChand(
      `from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
# cathedral_effect requires wrasse_scribe + pheromone_substrate — not in subset
valid, missing = g.validate_substrate_subset(["cathedral_effect"])
result = {"valid": valid, "missing": missing}`,
      {}
    ) as { valid: boolean; missing: string[] };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.valid, false);
    assert.ok(result.missing.length > 0);
  });

  it("T10: chandelier_temporal_query (hour) — returns grain + buckets", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.temporal_diagnostics import TemporalDiagnostics
index = build_index()
td = TemporalDiagnostics(index)
result = td.query_temporal(time_grain="hour")`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.grain, "hour");
    assert.ok("buckets" in result);
  });

  it("T11: chandelier_temporal_query (continuous_stretch) — returns stretches list", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.temporal_diagnostics import TemporalDiagnostics
index = build_index()
td = TemporalDiagnostics(index)
result = td.query_temporal(time_grain="continuous_stretch")`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("stretches" in result);
    assert.ok("longest_stretch" in result);
  });

  it("T12: chandelier_temporal_query (substrate_correlation) — returns top_periods", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
from chandelier.temporal_diagnostics import TemporalDiagnostics
index = build_index()
td = TemporalDiagnostics(index)
result = td.substrate_state_correlation(top_n_periods=3)`,
      {}
    ) as Record<string, unknown>;
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok("top_periods" in result);
    assert.ok("most_correlated_primitives" in result);
  });

  it("T13: seed receipt Stone Tablet total >= 13 (9 L1 + 4 L2)", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import build_index
index = build_index()
l1 = index.receipts_for_level(1)
l2 = index.receipts_for_level(2)
result = {"l1_count": len(l1), "l2_count": len(l2), "total": index.total_receipts()}`,
      {}
    ) as { l1_count: number; l2_count: number; total: number };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.ok(result.l1_count >= 9, `Expected ≥9 L1 receipts, got ${result.l1_count}`);
    assert.ok(result.l2_count >= 4, `Expected ≥4 L2 receipts, got ${result.l2_count}`);
  });

  it("T14: verify_receipt returns True for a fresh L1 receipt (E2E signature round-trip)", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import sign_and_store, verify_receipt
body = {
    "receipt_id": "rc_ts_test01",
    "receipt_class": "L1",
    "primitive_ids": ["ts_verify_prim"],
    "primitive_tuple_key": "ts_verify_prim",
    "session_id": "KN009-TS",
    "timestamp": "2026-04-29T21:00:00Z",
    "metric": "ts_acc",
    "baseline": {"description": "b", "score": 0.5},
    "treatment": {"description": "t", "score": 0.8},
    "delta": 0.3,
    "harness_id": "rp_2326",
    "trade_offs": "",
    "toolsmith_log": "TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002",
}
signed = sign_and_store(body, session_id="KN009-TS")
valid = verify_receipt(signed)
result = {"valid": valid, "receipt_id": signed["receipt_id"]}`,
      {}
    ) as { valid: boolean; receipt_id: string };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.valid, true);
  });

  it("T15: verify_receipt returns False for tampered receipt", () => {
    const result = runChand(
      `from chandelier.chronos_chandelier_bridge import sign_and_store, verify_receipt
body = {
    "receipt_id": "rc_ts_tamper01",
    "receipt_class": "L1",
    "primitive_ids": ["ts_tamper_prim"],
    "primitive_tuple_key": "ts_tamper_prim",
    "session_id": "KN009-TS",
    "timestamp": "2026-04-29T21:00:00Z",
    "metric": "ts_acc",
    "baseline": {"description": "b", "score": 0.5},
    "treatment": {"description": "t", "score": 0.8},
    "delta": 0.3,
    "harness_id": "rp_2326",
    "trade_offs": "",
    "toolsmith_log": "TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002",
}
signed = sign_and_store(body, session_id="KN009-TS")
tampered = dict(signed)
tampered["delta"] = 9999.0
valid = verify_receipt(tampered)
result = {"tampered_valid": valid}`,
      {}
    ) as { tampered_valid: boolean };
    assert.ok(!("error" in result), `Error: ${JSON.stringify(result)}`);
    assert.equal(result.tampered_valid, false);
  });

});
