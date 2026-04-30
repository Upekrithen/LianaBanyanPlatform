/**
 * Query Receipts — KN010 / A&A #2291
 *
 * TypeScript MCP tool: direct receipt lookup from the Chandelier Stone Tablet.
 * Reads chandelier_receipts.jsonl directly (no Python call needed for reads).
 *
 * Supported query modes:
 *   by_primitive_ids : exact-subset match (sorted, pipe-joined key)
 *   by_receipt_id    : direct id lookup
 *   by_metric        : all receipts for a given metric
 *   by_session_id    : all receipts from a given session
 *   by_time_range    : all receipts within (start_iso, end_iso)
 *   by_level         : all receipts at a given receipt_class (e.g. "L1", "L2")
 *
 * Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
 */

import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Stone Tablet path relative to this file's location
// queries/ → chandelier/ → stitchpunks/ → librarian-mcp/ → chronos/chronicler_receipts/
const TABLET_PATH = resolve(
  __dirname,
  "..",
  "..",
  "chronos",
  "chronicler_receipts",
  "chandelier_receipts.jsonl"
);

export interface Receipt {
  receipt_id: string;
  receipt_class: string;
  primitive_ids: string[];
  primitive_tuple_key: string;
  session_id: string;
  timestamp: string;
  metric: string;
  baseline: { description: string; score: number };
  treatment: { description: string; score: number };
  delta: number;
  chronos_signature: {
    temporal_anchor: string;
    chronicler_hash: string;
    signed_ts: string;
    session_id: string;
  };
  [key: string]: unknown;
}

export interface QueryParams {
  primitive_ids?: string[];
  receipt_id?: string;
  metric?: string;
  session_id?: string;
  time_range?: [string, string];
  level?: string;
  limit?: number;
}

export interface QueryResult {
  receipts: Receipt[];
  total_found: number;
  query_params: QueryParams;
  tablet_path: string;
}

async function loadAllReceipts(): Promise<Receipt[]> {
  return new Promise((resolve_fn, reject) => {
    const receipts: Receipt[] = [];
    try {
      const rl = createInterface({
        input: createReadStream(TABLET_PATH, { encoding: "utf-8" }),
        crlfDelay: Infinity,
      });
      rl.on("line", (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          receipts.push(JSON.parse(trimmed) as Receipt);
        } catch {
          // Skip malformed lines
        }
      });
      rl.on("close", () => resolve_fn(receipts));
      rl.on("error", (err) => reject(err));
    } catch (err) {
      // File doesn't exist yet → return empty
      resolve_fn([]);
    }
  });
}

function primitiveKey(ids: string[]): string {
  return [...ids].sort().join("|");
}

export async function queryReceipts(params: QueryParams): Promise<QueryResult> {
  let receipts = await loadAllReceipts();
  const limit = params.limit ?? 100;

  if (params.receipt_id) {
    receipts = receipts.filter((r) => r.receipt_id === params.receipt_id);
  }

  if (params.primitive_ids && params.primitive_ids.length > 0) {
    const targetKey = primitiveKey(params.primitive_ids);
    receipts = receipts.filter((r) => r.primitive_tuple_key === targetKey);
  }

  if (params.metric) {
    receipts = receipts.filter((r) => r.metric === params.metric);
  }

  if (params.session_id) {
    receipts = receipts.filter(
      (r) =>
        r.session_id === params.session_id ||
        r.chronos_signature?.session_id === params.session_id
    );
  }

  if (params.time_range) {
    const [start, end] = params.time_range;
    receipts = receipts.filter((r) => {
      const ts =
        r.chronos_signature?.temporal_anchor || r.timestamp || "";
      return ts >= start && ts <= end;
    });
  }

  if (params.level) {
    receipts = receipts.filter((r) => r.receipt_class === params.level);
  }

  const total = receipts.length;
  const sliced = receipts.slice(-limit); // most recent N

  return {
    receipts: sliced,
    total_found: total,
    query_params: params,
    tablet_path: TABLET_PATH,
  };
}

// ── MCP tool handler (ready to register with McpServer) ───────────────────────

export const queryReceiptsTool = {
  name: "query_chandelier_receipts",
  description:
    "Query Chandelier Stone Tablet receipts by primitive_ids, metric, session_id, time_range, level, or receipt_id. Returns signed receipt objects with delta + Chronos signature.",
  inputSchema: {
    type: "object" as const,
    properties: {
      primitive_ids: {
        type: "array",
        items: { type: "string" },
        description: "Exact primitive ID set (sorted internally for lookup)",
      },
      receipt_id: {
        type: "string",
        description: "Direct receipt ID lookup",
      },
      metric: {
        type: "string",
        description: "Filter by metric name (e.g. 'hot_accuracy_pct')",
      },
      session_id: {
        type: "string",
        description: "Filter by session ID (e.g. 'KN009-BP002')",
      },
      time_range: {
        type: "array",
        items: { type: "string" },
        description: "[start_iso, end_iso] filter on Chronos temporal anchor",
      },
      level: {
        type: "string",
        description: "Filter by receipt class (e.g. 'L1', 'L2', 'L3')",
      },
      limit: {
        type: "number",
        description: "Max results to return (default 100, most-recent N)",
      },
    },
  },
  handler: async (args: Record<string, unknown>): Promise<QueryResult> => {
    return queryReceipts({
      primitive_ids: args.primitive_ids as string[] | undefined,
      receipt_id: args.receipt_id as string | undefined,
      metric: args.metric as string | undefined,
      session_id: args.session_id as string | undefined,
      time_range: args.time_range as [string, string] | undefined,
      level: args.level as string | undefined,
      limit: args.limit as number | undefined,
    });
  },
};
