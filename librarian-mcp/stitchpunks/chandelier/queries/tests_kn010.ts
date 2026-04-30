/**
 * Tests KN010 TypeScript — query_receipts + three_mode_compare + pudding_render
 *
 * Tests: 12 covering MCP tool output schema, rendering, and edge cases.
 * Uses node:test (no external dependencies).
 *
 * Run: node --experimental-vm-modules --test tests_kn010.ts
 *   or: npx tsx tests_kn010.ts
 *
 * Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderPudding, PuddingInput } from "./pudding_render.js";
import { threeModeCompareTool } from "./three_mode_compare.js";
import { queryReceiptsTool } from "./query_receipts.js";

// ── Test helpers ──────────────────────────────────────────────────────────────

function assertHasKeys(obj: Record<string, unknown>, keys: string[]): void {
  for (const k of keys) {
    assert.ok(k in obj, `Missing key: ${k}`);
  }
}

// ── pudding_render tests ──────────────────────────────────────────────────────

describe("pudding_render", () => {
  it("renders generic pudding with markdown", () => {
    const input: PuddingInput = {
      type: "generic",
      data: { metric: "hot_accuracy_pct", delta: 0.861, session: "KN010" },
      title: "Test Pudding",
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.length > 0, "markdown should be non-empty");
    assert.strictEqual(out.source_type, "generic");
    assert.ok(typeof out.reproducibility_hash === "string");
  });

  it("renders falsification pudding with verdict", () => {
    const input: PuddingInput = {
      type: "falsification",
      data: {
        verdict: "CONFIRMED",
        claimed_delta: 0.411,
        empirical_delta: 0.861,
        confidence_interval_95: [0.80, 0.90],
        n_receipts: 3,
        verdict_rationale: "Empirical Δ=0.8610 ≥ threshold=0.3699. Claim CONFIRMED.",
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("CONFIRMED"), "should include CONFIRMED");
    assert.ok(out.markdown.includes("0.411"), "should include claimed delta");
    assert.ok(out.plot_description !== null);
  });

  it("renders three_mode_compare pudding with table", () => {
    const input: PuddingInput = {
      type: "three_mode_compare",
      data: {
        query: { subset: ["cathedral_effect"], metric: "hot_accuracy_pct", basic_stock_primitive: "cathedral_effect" },
        basic_stock: { mode: "basic_stock", primitive_ids: ["cathedral_effect"], receipts_found: 1, latest_delta: 0.2, latest_receipt_id: "rc_001", metric: "hot_accuracy_pct" },
        modified_stock: { mode: "modified_stock", primitive_ids: ["cathedral_effect"], receipts_found: 1, latest_delta: 0.861, latest_receipt_id: "rc_002", metric: "hot_accuracy_pct" },
        full_stack: null,
        right_recipe: null,
        comparison_summary: {
          lines: ["Modified-Stock lift over Basic-Stock: +0.661 (hot_accuracy_pct)"],
          has_basic_stock: true, has_modified_stock: true, has_full_stack: false, has_right_recipe: false,
        },
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("Three-Mode") || out.markdown.includes("Mode"), "should include mode table");
    assert.ok(out.markdown.includes("hot_accuracy_pct"), "should include metric");
  });

  it("renders right_recipe pudding with winner card", () => {
    const input: PuddingInput = {
      type: "right_recipe",
      data: {
        metric: "hot_accuracy_pct",
        winner: { primitive_ids: ["cathedral_effect", "pheromone_substrate"], delta: 0.9, receipt_id: "rc_007" },
        subsets_evaluated: 7,
        method: "full_enum",
        confidence: "high",
        caveats: [],
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("cathedral_effect"), "should include winner primitive");
    assert.ok(out.markdown.includes("0.9"), "should include delta");
  });

  it("renders crown_jewel_temporal pudding with histograms", () => {
    const hourHist: Record<string, number> = {};
    for (let h = 0; h < 24; h++) hourHist[String(h).padStart(2, "0")] = h === 10 ? 5 : 1;
    const input: PuddingInput = {
      type: "crown_jewel_temporal",
      data: {
        histograms: {
          total_cj: 28,
          parsed_ok: 26,
          missing_ts: 2,
          hour_of_day: hourHist,
          day_of_week: { Mon: 4, Tue: 3, Wed: 6, Thu: 5, Fri: 4, Sat: 3, Sun: 3 },
          peak_hour: 10,
          peak_day: "Wed",
        },
        caveats: ["2 CJ entries had no parseable timestamp."],
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("Crown Jewel"), "should include CJ title");
    assert.ok(out.markdown.includes("10:00") || out.markdown.includes("10"), "should include peak hour");
    assert.ok(out.markdown.includes("Wed") || out.markdown.includes("day"), "should include peak day");
  });

  it("renders continuous_stretch pudding", () => {
    const input: PuddingInput = {
      type: "continuous_stretch",
      data: {
        longest_stretch: { start: "2026-01-01T09:00:00Z", end: "2026-01-01T14:00:00Z", duration_hours: 5, count: 10, receipt_ids: [] },
        top_stretches: [
          { start: "2026-01-01T09:00:00Z", end: "2026-01-01T14:00:00Z", duration_hours: 5, count: 10, receipt_ids: [] },
        ],
        total_stretches: 3,
        total_receipts_analysed: 15,
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("Stretch") || out.markdown.includes("stretch"), "should include stretch content");
    assert.ok(out.markdown.includes("5"), "should include duration");
  });

  it("renders substrate_correlator pudding with table", () => {
    const input: PuddingInput = {
      type: "substrate_correlator",
      data: {
        correlation_table: [
          { primitive_id: "cathedral_effect", correlation_score: 1.0, top_period_appearances: 5, interpretation: "Strong" },
          { primitive_id: "wrasse_scribe", correlation_score: 0.6, top_period_appearances: 3, interpretation: "Moderate" },
        ],
        top_periods: [],
        grain: "day",
        metric: "hot_accuracy_pct",
        caveat: "Correlation ≠ causation.",
      },
    };
    const out = renderPudding(input);
    assert.ok(out.markdown.includes("cathedral_effect"), "should include primitive name");
    assert.ok(out.markdown.includes("1"), "should include correlation score");
  });

  it("reproducibility hash is deterministic", () => {
    const input: PuddingInput = { type: "generic", data: { x: 1 }, title: "T" };
    const out1 = renderPudding(input);
    const out2 = renderPudding(input);
    assert.strictEqual(out1.reproducibility_hash, out2.reproducibility_hash);
  });

  it("different inputs produce different hashes", () => {
    const out1 = renderPudding({ type: "generic", data: { x: 1 } });
    const out2 = renderPudding({ type: "generic", data: { x: 2 } });
    assert.notStrictEqual(out1.reproducibility_hash, out2.reproducibility_hash);
  });
});

// ── queryReceiptsTool schema tests ───────────────────────────────────────────

describe("queryReceiptsTool", () => {
  it("tool has correct name and required inputSchema", () => {
    assert.strictEqual(queryReceiptsTool.name, "query_chandelier_receipts");
    assertHasKeys(queryReceiptsTool.inputSchema.properties, [
      "primitive_ids", "receipt_id", "metric", "session_id", "time_range", "level", "limit"
    ]);
  });

  it("tool handler returns QueryResult schema", async () => {
    // Should complete without error even with no tablet on disk
    const result = await queryReceiptsTool.handler({
      metric: "hot_accuracy_pct",
      limit: 10,
    });
    assertHasKeys(result as unknown as Record<string, unknown>, ["receipts", "total_found", "query_params", "tablet_path"]);
    assert.ok(Array.isArray((result as { receipts: unknown[] }).receipts));
  });
});

// ── threeModeCompareTool schema tests ────────────────────────────────────────

describe("threeModeCompareTool", () => {
  it("tool has correct name", () => {
    assert.strictEqual(threeModeCompareTool.name, "chandelier_three_mode_compare");
  });

  it("tool handler returns comparison schema on empty index", async () => {
    const result = await threeModeCompareTool.handler({
      subset: ["cathedral_effect"],
      metric: "hot_accuracy_pct",
    });
    assertHasKeys(result as unknown as Record<string, unknown>, [
      "query", "basic_stock", "modified_stock", "comparison_summary"
    ]);
    const r = result as { comparison_summary: { winner: string } };
    assert.ok(typeof r.comparison_summary.winner === "string");
  });
});
