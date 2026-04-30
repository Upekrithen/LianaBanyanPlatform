/**
 * Three-Mode Comparator MCP Tool — KN010 / A&A #2291
 *
 * TypeScript wrapper that calls the Python ThreeModeComparator via subprocess
 * OR constructs the comparison from direct JSONL reads.
 *
 * This implementation uses direct JSONL reads (no Python subprocess dependency):
 *   - Basic Stock   : receipts for single primitive (basic_stock_primitive or subset[0])
 *   - Modified Stock: receipts for the exact subset S
 *   - Full Stack    : receipts for all_primitive_ids (all on)
 *   - Right Recipe  : lazily computed (calls right_recipe via receipts scan)
 *
 * Returns structured comparison + winner + lean-vs-full ratio.
 *
 * Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
 */

import { queryReceipts, Receipt } from "./query_receipts.js";

export interface ModeResult {
  mode: string;
  primitive_ids: string[];
  receipts_found: number;
  latest_delta: number | null;
  latest_receipt_id: string | null;
  metric: string;
}

export interface ThreeModeResult {
  query: {
    subset: string[];
    metric: string;
    basic_stock_primitive: string;
  };
  basic_stock: ModeResult;
  modified_stock: ModeResult;
  full_stack: ModeResult | null;
  right_recipe: {
    found: boolean;
    primitive_ids?: string[];
    best_delta?: number;
    best_receipt_id?: string;
    subsets_evaluated?: number;
    message?: string;
  } | null;
  comparison_summary: {
    lines: string[];
    has_basic_stock: boolean;
    has_modified_stock: boolean;
    has_full_stack: boolean;
    has_right_recipe: boolean;
    winner: string;
    lean_vs_full_ratio: number | null;
  };
}

function primitiveKey(ids: string[]): string {
  return [...ids].sort().join("|");
}

async function getModeResult(
  primitiveIds: string[],
  metric: string,
  timeRange?: [string, string]
): Promise<ModeResult> {
  const res = await queryReceipts({
    primitive_ids: primitiveIds,
    metric,
    time_range: timeRange,
    limit: 50,
  });
  const receipts = res.receipts;
  if (receipts.length === 0) {
    return {
      mode: "",
      primitive_ids: [...primitiveIds].sort(),
      receipts_found: 0,
      latest_delta: null,
      latest_receipt_id: null,
      metric,
    };
  }
  const latest = receipts[receipts.length - 1];
  return {
    mode: "",
    primitive_ids: [...primitiveIds].sort(),
    receipts_found: receipts.length,
    latest_delta: latest.delta ?? null,
    latest_receipt_id: latest.receipt_id ?? null,
    metric,
  };
}

async function computeRightRecipe(
  allPrimitiveIds: string[],
  metric: string,
  maxK: number | null,
  timeRange?: [string, string]
): Promise<ThreeModeResult["right_recipe"]> {
  // Simple full-enum right recipe (for TS: enumerate all subsets up to maxK)
  // For large N, this is slow — prefer Python right_recipe_engine.py for N>12
  const n = allPrimitiveIds.length;
  if (n > 12) {
    return {
      found: false,
      message: `N=${n} > 12: use Python right_recipe_engine.py for beam-search argmax.`,
    };
  }

  let bestDelta: number | null = null;
  let bestIds: string[] = [];
  let bestReceiptId: string | null = null;
  let subsetsEvaluated = 0;
  const cap = maxK ?? n;

  for (let k = 1; k <= cap; k++) {
    for (const combo of combinations(allPrimitiveIds, k)) {
      const result = await getModeResult(combo, metric, timeRange);
      if (result.latest_delta !== null) {
        subsetsEvaluated++;
        if (bestDelta === null || result.latest_delta > bestDelta) {
          bestDelta = result.latest_delta;
          bestIds = combo;
          bestReceiptId = result.latest_receipt_id;
        }
      }
    }
  }

  if (bestDelta === null) {
    return {
      found: false,
      subsets_evaluated: subsetsEvaluated,
      message: "No receipts found for any subset. Run measurements first.",
    };
  }

  return {
    found: true,
    primitive_ids: bestIds,
    best_delta: bestDelta,
    best_receipt_id: bestReceiptId ?? undefined,
    subsets_evaluated: subsetsEvaluated,
  };
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

export async function threeModeCompare(params: {
  subset: string[];
  metric: string;
  all_primitive_ids?: string[];
  basic_stock_primitive?: string;
  include_right_recipe?: boolean;
  right_recipe_max_k?: number;
  time_range?: [string, string];
}): Promise<ThreeModeResult> {
  const {
    subset,
    metric,
    all_primitive_ids,
    basic_stock_primitive,
    include_right_recipe = false,
    right_recipe_max_k = null,
    time_range,
  } = params;

  const sortedSubset = [...subset].sort();
  const bsPrimitive = basic_stock_primitive ?? sortedSubset[0] ?? "";

  const basicStock = await getModeResult([bsPrimitive], metric, time_range);
  basicStock.mode = "basic_stock";

  const modifiedStock = await getModeResult(sortedSubset, metric, time_range);
  modifiedStock.mode = "modified_stock";

  let fullStack: ModeResult | null = null;
  let rightRecipe: ThreeModeResult["right_recipe"] = null;

  if (all_primitive_ids && all_primitive_ids.length > 0) {
    const sortedAll = [...all_primitive_ids].sort();
    fullStack = await getModeResult(sortedAll, metric, time_range);
    fullStack.mode = "full_stack";

    if (include_right_recipe) {
      rightRecipe = await computeRightRecipe(
        sortedAll,
        metric,
        right_recipe_max_k ?? null,
        time_range
      );
    }
  }

  // Build comparison summary
  const bsDelta = basicStock.latest_delta;
  const msDelta = modifiedStock.latest_delta;
  const fsDelta = fullStack?.latest_delta ?? null;
  const lines: string[] = [];

  if (bsDelta !== null && msDelta !== null) {
    const lift = +(msDelta - bsDelta).toFixed(4);
    lines.push(`Modified-Stock lift over Basic-Stock: ${lift >= 0 ? "+" : ""}${lift} (${metric})`);
  }

  if (fsDelta !== null && msDelta !== null) {
    const ratio = +(msDelta - fsDelta).toFixed(4);
    lines.push(
      `Modified-Stock vs Full-Stack: ${ratio >= 0 ? "+" : ""}${ratio} ` +
        `(${ratio >= 0 ? "leaner wins" : "full stack wins"})`
    );
  }

  let rrWinner = "";
  if (rightRecipe?.found && rightRecipe.primitive_ids) {
    const isOptimal =
      primitiveKey(rightRecipe.primitive_ids) === primitiveKey(sortedSubset);
    rrWinner = `Right Recipe: [${rightRecipe.primitive_ids.join(", ")}] ` +
      `(delta=${rightRecipe.best_delta?.toFixed(4)}) ` +
      (isOptimal ? "← this IS the optimal subset" : "← different from Modified-Stock");
    lines.push(rrWinner);
  }

  if (lines.length === 0) {
    lines.push("Insufficient receipts for comparison. Run measurements first.");
  }

  // Determine winner
  const deltas = [
    { label: "basic_stock", delta: bsDelta },
    { label: "modified_stock", delta: msDelta },
    { label: "full_stack", delta: fsDelta },
  ].filter((d) => d.delta !== null) as { label: string; delta: number }[];

  const winner =
    deltas.length > 0
      ? deltas.reduce((a, b) => (a.delta > b.delta ? a : b)).label
      : "unknown";

  const leanVsFullRatio =
    msDelta !== null && fsDelta !== null && fsDelta !== 0
      ? +((msDelta / fsDelta) * 100).toFixed(2)
      : null;

  return {
    query: {
      subset: sortedSubset,
      metric,
      basic_stock_primitive: bsPrimitive,
    },
    basic_stock: basicStock,
    modified_stock: modifiedStock,
    full_stack: fullStack,
    right_recipe: rightRecipe,
    comparison_summary: {
      lines,
      has_basic_stock: (basicStock.receipts_found ?? 0) > 0,
      has_modified_stock: (modifiedStock.receipts_found ?? 0) > 0,
      has_full_stack: ((fullStack?.receipts_found) ?? 0) > 0,
      has_right_recipe: !!(rightRecipe?.found),
      winner,
      lean_vs_full_ratio: leanVsFullRatio,
    },
  };
}

// ── MCP tool handler ───────────────────────────────────────────────────────────

export const threeModeCompareTool = {
  name: "chandelier_three_mode_compare",
  description:
    "Compare Basic-Stock vs Modified-Stock vs Full-Stack vs Right-Recipe for a given primitive subset and metric. Returns structured comparison + winner.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subset: {
        type: "array",
        items: { type: "string" },
        description: "The Modified-Stock subset (primitive IDs to compare)",
      },
      metric: {
        type: "string",
        description: "Metric to compare on (e.g. 'hot_accuracy_pct')",
      },
      all_primitive_ids: {
        type: "array",
        items: { type: "string" },
        description: "Full primitive list for Full-Stack + Right-Recipe modes",
      },
      basic_stock_primitive: {
        type: "string",
        description: "Single primitive for Basic-Stock baseline",
      },
      include_right_recipe: {
        type: "boolean",
        description: "If true, compute Right Recipe argmax (lazy, expensive for N>12)",
      },
      right_recipe_max_k: {
        type: "number",
        description: "Max subset size for Right Recipe search",
      },
      time_range: {
        type: "array",
        items: { type: "string" },
        description: "[start_iso, end_iso] filter",
      },
    },
    required: ["subset", "metric"],
  },
  handler: async (args: Record<string, unknown>): Promise<ThreeModeResult> => {
    return threeModeCompare({
      subset: (args.subset as string[]) ?? [],
      metric: (args.metric as string) ?? "",
      all_primitive_ids: args.all_primitive_ids as string[] | undefined,
      basic_stock_primitive: args.basic_stock_primitive as string | undefined,
      include_right_recipe: (args.include_right_recipe as boolean) ?? false,
      right_recipe_max_k: args.right_recipe_max_k as number | undefined,
      time_range: args.time_range as [string, string] | undefined,
    });
  },
};
