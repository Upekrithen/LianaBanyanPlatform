/**
 * Cursor Context-Budget Watcher — MCP Query Layer
 * KN012 / A&A #2293
 *
 * MCP tools:
 *   query_snapshots_by_session(session_id)   — all snapshots for a session
 *   query_snapshots_by_threshold(threshold_percent) — all snapshots at/above threshold
 *   replay_session_progression(session_id)   — chronological context-budget progression
 *
 * Stone Tablet: librarian-mcp/stitchpunks/chronos/chronicler_receipts/snapshot_receipts.jsonl
 *
 * Toolsmith log: TS-CURSOR-CONTEXT-BUDGET-WATCHER-KN012-BP002
 */

import * as fs from "fs";
import * as path from "path";

// ── Paths ─────────────────────────────────────────────────────────────────────

const HERE = path.dirname(__filename);
const TABLET_PATH = path.join(HERE, "..", "chronos", "chronicler_receipts", "snapshot_receipts.jsonl");

// ── Types ─────────────────────────────────────────────────────────────────────

interface SnapshotRecord {
  type: string;
  threshold_triggered: number;
  direction: string;
  context_budget_percent: number | null;
  active_files: string[];
  tool_call_count: number;
  session_id: string;
  bean_id: string;
  transcript_size_bytes: number | null;
  snapshot_id: string;
  chronicler_hash: string;
  snapped_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSnapshots(tabletPath: string = TABLET_PATH): SnapshotRecord[] {
  if (!fs.existsSync(tabletPath)) return [];
  return fs
    .readFileSync(tabletPath, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l) as SnapshotRecord;
      } catch {
        return null;
      }
    })
    .filter((x): x is SnapshotRecord => x !== null);
}

// ── Tool implementations ──────────────────────────────────────────────────────

function querySnapshotsBySession(session_id: string): Record<string, unknown> {
  const all = loadSnapshots();
  const filtered = all.filter(
    (s) => s.session_id === session_id || s.session_id?.includes(session_id),
  );
  return {
    session_id,
    count: filtered.length,
    snapshots: filtered.sort((a, b) => a.snapped_at.localeCompare(b.snapped_at)),
  };
}

function querySnapshotsByThreshold(threshold_percent: number): Record<string, unknown> {
  const all = loadSnapshots();
  const filtered = all.filter((s) => s.threshold_triggered >= threshold_percent);
  return {
    threshold_percent,
    count: filtered.length,
    snapshots: filtered.sort((a, b) => a.snapped_at.localeCompare(b.snapped_at)),
  };
}

function replaySessionProgression(session_id: string): Record<string, unknown> {
  const all = loadSnapshots();
  const session_snaps = all
    .filter((s) => s.session_id === session_id || s.session_id?.includes(session_id))
    .sort((a, b) => a.snapped_at.localeCompare(b.snapped_at));

  if (session_snaps.length === 0) {
    return { session_id, progression: [], note: "No snapshots found for this session" };
  }

  const progression = session_snaps.map((s, i) => ({
    step: i + 1,
    timestamp: s.snapped_at,
    context_budget_percent: s.context_budget_percent,
    threshold_triggered: s.threshold_triggered,
    direction: s.direction,
    tool_call_count: s.tool_call_count,
    active_files_count: s.active_files?.length ?? 0,
    bean_id: s.bean_id,
    snapshot_id: s.snapshot_id,
  }));

  const first = session_snaps[0];
  const last = session_snaps[session_snaps.length - 1];
  const pct_start = first.context_budget_percent ?? 0;
  const pct_end = last.context_budget_percent ?? 0;

  return {
    session_id,
    total_snapshots: session_snaps.length,
    context_start_pct: pct_start,
    context_end_pct: pct_end,
    context_climb_pp: Math.round((pct_end - pct_start) * 10) / 10,
    session_duration_note:
      first.snapped_at && last.snapped_at
        ? `${first.snapped_at} → ${last.snapped_at}`
        : "unknown",
    progression,
  };
}

// ── MCP TOOL DEFINITIONS ──────────────────────────────────────────────────────

const TOOLS = {
  query_snapshots_by_session: {
    description:
      "Retrieve all context-budget snapshots for a given Cursor session ID. Returns sorted list of threshold-crossing events.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", description: "Cursor session UUID or session tag" },
      },
      required: ["session_id"],
    },
  },
  query_snapshots_by_threshold: {
    description:
      "Retrieve all snapshots where threshold_triggered >= threshold_percent. Useful for finding sessions that hit high context usage.",
    inputSchema: {
      type: "object",
      properties: {
        threshold_percent: {
          type: "number",
          description: "Minimum threshold percentage (e.g. 80 for all 80%+ snapshots)",
        },
      },
      required: ["threshold_percent"],
    },
  },
  replay_session_progression: {
    description:
      "Replay the full context-budget progression for a session: context_start → end, climb in pp, per-step tool_call_count. Used by Herder Scribe to train predictive models.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", description: "Cursor session UUID or session tag" },
      },
      required: ["session_id"],
    },
  },
} as const;

type ToolName = keyof typeof TOOLS;

function dispatch(toolName: string, args: Record<string, unknown>): unknown {
  switch (toolName as ToolName) {
    case "query_snapshots_by_session":
      return querySnapshotsBySession((args.session_id as string) ?? "");
    case "query_snapshots_by_threshold":
      return querySnapshotsByThreshold((args.threshold_percent as number) ?? 80);
    case "replay_session_progression":
      return replaySessionProgression((args.session_id as string) ?? "");
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ── JSON-RPC MCP server ───────────────────────────────────────────────────────

function handleRequest(req: Record<string, unknown>): Record<string, unknown> {
  const id = req.id ?? null;
  const method = req.method as string;
  const params = (req.params as Record<string, unknown>) ?? {};

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "snapshot-watcher", version: "1.0.0" },
      },
    };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: Object.entries(TOOLS).map(([name, def]) => ({
          name,
          description: def.description,
          inputSchema: def.inputSchema,
        })),
      },
    };
  }

  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments as Record<string, unknown>) ?? {};
    try {
      const result = dispatch(toolName, toolArgs);
      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      };
    } catch (e) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: String(e) },
      };
    }
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown method: ${method}` } };
}

function main(): void {
  let buffer = "";
  process.stdin.setEncoding("utf-8");

  process.stdin.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const req = JSON.parse(trimmed) as Record<string, unknown>;
        const response = handleRequest(req);
        process.stdout.write(JSON.stringify(response) + "\n");
      } catch {
        process.stdout.write(
          JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n",
        );
      }
    }
  });

  process.stdin.on("end", () => process.exit(0));
}

main();
