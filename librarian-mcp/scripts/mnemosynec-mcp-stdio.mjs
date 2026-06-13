#!/usr/bin/env node
/**
 * mnemosynec-mcp-stdio.mjs — SEG-MC-1 + SEG-MC-2 + SEG-MC-3 (BP079 Wave D)
 * ==========================================================================
 * MCP JSON-RPC 2.0 stdio shim for MnemosyneC Electron main process.
 *
 * Exposes a minimal MCP tool registry that bridges to:
 *   - MnemosyneC substrate API at http://127.0.0.1:11480 (HTTP)
 *   - Named pipe \\.\pipe\mnemosynec-mcp (Windows IPC — future expansion)
 *   - Local JSONL message store at ~/.mnemosynec/messages.jsonl
 *   - Librarian child-server proxy (SEG-MC-2)
 *   - Substrate write tools with offline queue fallback (SEG-MC-3)
 *
 * Tools registered (9 core + 12 librarian proxies = 21 when MC-2 active):
 *   ping                  — connectivity / version check
 *   get_mnemosynec_status — checks if MnemosyneC substrate HTTP is online
 *   send_message          — appends a message pearl to the JSONL store
 *   check_messages        — reads unread messages addressed to a client_id
 *   ack_message           — marks a specific pearl as read
 *   -- Substrate write tools (SEG-MC-3) --
 *   pearl_emit            — emit a pearl to substrate or queue offline
 *   eblet_emit            — emit an eblet record to substrate or queue offline
 *   soccerball_emit       — emit a soccerball session marker via DAG
 *   scribe_log            — append a scribe log entry to substrate
 *   -- Librarian read proxies (SEG-MC-2) --
 *   brief_me              — session-opening substrate brief
 *   search_knowledge      — full-text search across index files
 *   pheromone_query       — pheromone stigmergic substrate query
 *   get_schema            — table schema / columns / constraints
 *   get_page_info         — page route / queries / feature flags
 *   query_domain          — domain tables / functions / pages
 *   get_component         — React component exports / imports / queries
 *   get_architecture      — architecture concept from Cephas
 *   consult_scribes       — Cathedral Scribe RAM-access query
 *   detective_investigate — cross-Scribe investigation (Phase 0 + Phase 1)
 *   pearl_decode          — SSPS-encoded Pearl decode
 *   soccerball_decode     — Soccerball handle decode
 *
 * Auth gating: none (stdio = local trust; any local process may connect)
 *
 * Usage (add to Claude Desktop / Cursor MCP config):
 *   {
 *     "command": "node",
 *     "args": ["<workspace>/librarian-mcp/scripts/mnemosynec-mcp-stdio.mjs"]
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { z } from "zod";
import {
  pearlEmit,
  ebletEmit,
  soccerballEmit,
  scribeLog,
} from "./mnemosynec-write-tools.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Constants ─────────────────────────────────────────────────────────────────

const VERSION         = "0.3.0";
const SHIM_NAME       = "mnemosynec-mcp-stdio";
const SUBSTRATE_BASE  = process.env.MNEMOSYNEC_HTTP_BASE ?? "http://127.0.0.1:11480";
const NAMED_PIPE_PATH = "\\\\.\\pipe\\mnemosynec-mcp";
const MESSAGES_DIR    = join(homedir(), ".mnemosynec");
const MESSAGES_FILE   = join(MESSAGES_DIR, "messages.jsonl");

// ── Message JSONL helpers ─────────────────────────────────────────────────────

/**
 * Ensure the ~/.mnemosynec directory and messages.jsonl exist.
 */
function ensureStore() {
  if (!existsSync(MESSAGES_DIR)) {
    mkdirSync(MESSAGES_DIR, { recursive: true });
  }
  if (!existsSync(MESSAGES_FILE)) {
    writeFileSync(MESSAGES_FILE, "", "utf-8");
  }
}

/**
 * Read all pearls from the JSONL file. Returns an empty array if the file is
 * empty or contains only malformed lines (individual bad lines are skipped).
 */
function readPearls() {
  ensureStore();
  const raw = readFileSync(MESSAGES_FILE, "utf-8");
  const pearls = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      pearls.push(JSON.parse(trimmed));
    } catch {
      // skip malformed lines
    }
  }
  return pearls;
}

/**
 * Rewrite the JSONL file atomically (write to tmp then rename isn't available
 * cross-platform in pure fs module, so we do a synchronous overwrite — safe
 * for the single-writer pattern used in this shim).
 */
function writePearls(pearls) {
  ensureStore();
  const content = pearls.map(p => JSON.stringify(p)).join("\n");
  writeFileSync(MESSAGES_FILE, content ? content + "\n" : "", "utf-8");
}

/**
 * Append a single pearl to the JSONL file without reading all lines.
 */
function appendPearl(pearl) {
  ensureStore();
  appendFileSync(MESSAGES_FILE, JSON.stringify(pearl) + "\n", "utf-8");
}

// ── HTTP substrate helper ─────────────────────────────────────────────────────

/**
 * Perform a JSON fetch against the MnemosyneC substrate API.
 * Returns { ok: boolean, status: number, data: any, error?: string }.
 * Never throws — all errors are caught and returned as { ok: false, ... }.
 */
async function substrateGet(path) {
  try {
    const url = `${SUBSTRATE_BASE}${path}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message ?? String(err) };
  }
}

// ── Librarian child-server proxy (SEG-MC-2) ───────────────────────────────────

const LIBRARIAN_DIST = resolve(__dirname, "../dist/server.js");
const LIBRARIAN_CWD  = resolve(__dirname, "..");

/**
 * Proxy a tool call to the librarian dist/server.js via MCP stdio JSON-RPC.
 * Spawns a fresh child process per call (Wave D: correctness over performance).
 * TODO Wave E: keep child alive for performance (persistent child + request multiplexing).
 *
 * Returns an MCP-compatible content block or a graceful error object.
 */
async function proxyToLibrarian(toolName, args) {
  if (!existsSync(LIBRARIAN_DIST)) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: "librarian not available",
          hint:  "Run: cd librarian-mcp && npm run build",
        }, null, 2),
      }],
      isError: true,
    };
  }

  return new Promise((resolveFn) => {
    const child = spawn(process.execPath, [LIBRARIAN_DIST], {
      stdio: ["pipe", "pipe", "pipe"],
      env:   process.env,
      cwd:   LIBRARIAN_CWD,
    });

    let settled = false;
    const lineQueue        = [];
    const pendingResolvers = [];

    function settle(result) {
      if (!settled) {
        settled = true;
        clearTimeout(callTimeout);
        try { child.stdin.end(); } catch {}
        try { child.kill("SIGTERM"); } catch {}
        resolveFn(result);
      }
    }

    function settleError(detail) {
      settle({
        content: [{
          type: "text",
          text: JSON.stringify({
            error:  "librarian proxy error",
            detail: String(detail),
          }, null, 2),
        }],
        isError: true,
      });
    }

    const callTimeout = setTimeout(
      () => settleError("timeout: librarian did not respond within 30s"),
      30000,
    );

    const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });

    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let parsed;
      try { parsed = JSON.parse(trimmed); } catch { return; }
      const idx = pendingResolvers.findIndex(r => r.id === parsed.id);
      if (idx !== -1) {
        const { res } = pendingResolvers.splice(idx, 1)[0];
        res(parsed);
      } else {
        lineQueue.push(parsed);
      }
    });

    function waitForId(id, timeoutMs = 15000) {
      return new Promise((res, rej) => {
        const already = lineQueue.findIndex(m => m.id === id);
        if (already !== -1) { res(lineQueue.splice(already, 1)[0]); return; }
        const t = setTimeout(() => {
          const i = pendingResolvers.findIndex(r => r.id === id);
          if (i !== -1) pendingResolvers.splice(i, 1);
          rej(new Error(`timeout waiting for id=${id}`));
        }, timeoutMs);
        pendingResolvers.push({
          id,
          res: (val) => { clearTimeout(t); res(val); },
        });
      });
    }

    function sendMsg(obj) {
      child.stdin.write(JSON.stringify(obj) + "\n");
    }

    child.on("error", (err) => settleError(err.message));
    child.on("exit", (code) => {
      if (!settled) settleError(`librarian child exited early (code=${code})`);
    });

    (async () => {
      try {
        sendMsg({
          jsonrpc: "2.0",
          method:  "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities:    {},
            clientInfo:      { name: "mnemosynec-shim-proxy", version: VERSION },
          },
          id: 1,
        });

        const initResp = await waitForId(1, 15000);
        if (!initResp?.result?.serverInfo) {
          throw new Error(`initialize failed: ${JSON.stringify(initResp)}`);
        }

        sendMsg({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

        sendMsg({
          jsonrpc: "2.0",
          method:  "tools/call",
          params:  { name: toolName, arguments: args },
          id:      2,
        });

        const callResp = await waitForId(2, 25000);

        if (callResp?.error) {
          settle({
            content: [{
              type: "text",
              text: JSON.stringify({
                error:  "librarian tool error",
                detail: callResp.error,
              }, null, 2),
            }],
            isError: true,
          });
        } else {
          settle(callResp?.result ?? {
            content: [{
              type: "text",
              text: JSON.stringify({ error: "empty response from librarian" }),
            }],
            isError: true,
          });
        }
      } catch (err) {
        settleError(err.message ?? String(err));
      }
    })();
  });
}

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: SHIM_NAME,
  version: VERSION,
});

// ── Tool: ping ────────────────────────────────────────────────────────────────

server.tool(
  "ping",
  "Connectivity and version check for the MnemosyneC MCP stdio shim. " +
  "Returns pong:true plus shim version and named-pipe path. " +
  "Use as a first call to confirm the shim is running before invoking other tools.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          pong:      true,
          version:   VERSION,
          shim:      SHIM_NAME,
          pipe_path: NAMED_PIPE_PATH,
          http_base: SUBSTRATE_BASE,
          ts:        new Date().toISOString(),
        }, null, 2),
      },
    ],
  }),
);

// ── Tool: get_mnemosynec_status ───────────────────────────────────────────────

server.tool(
  "get_mnemosynec_status",
  "Check whether the MnemosyneC Electron substrate HTTP API is reachable at " +
  "http://127.0.0.1:11480. Returns status:'online' with version info when " +
  "reachable, or status:'offline' with a clear message when not running. " +
  "Never crashes — safe to call at any time.",
  {},
  async () => {
    const result = await substrateGet("/substrate/health");
    if (!result.ok) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status:    "offline",
              message:   "MnemosyneC not running or not reachable",
              http_base: SUBSTRATE_BASE,
              error:     result.error ?? `HTTP ${result.status}`,
            }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status:    "online",
            http_base: SUBSTRATE_BASE,
            response:  result.data,
          }, null, 2),
        },
      ],
    };
  },
);

// ── Tool: send_message ────────────────────────────────────────────────────────

server.tool(
  "send_message",
  "Send a message pearl to another agent. Appends an entry to " +
  "~/.mnemosynec/messages.jsonl with status:'unread'. " +
  "Returns the pearl_id of the written message. " +
  "Fields: from (sender), to (recipient), subject, body.",
  {
    from:    z.string().describe("Sender agent ID (e.g. 'knight', 'bishop', 'rook', 'pawn')"),
    to:      z.string().describe("Recipient agent ID"),
    subject: z.string().describe("Short subject line for the message"),
    body:    z.string().describe("Full message body text"),
  },
  async ({ from, to, subject, body }) => {
    try {
      const pearl = {
        pearl_id: randomUUID(),
        from,
        to,
        subject,
        body,
        status: "unread",
        ts:     new Date().toISOString(),
      };
      appendPearl(pearl);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, pearl_id: pearl.pearl_id, ts: pearl.ts }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
);

// ── Tool: check_messages ──────────────────────────────────────────────────────

server.tool(
  "check_messages",
  "Read unread message pearls addressed to a specific client_id from " +
  "~/.mnemosynec/messages.jsonl. Returns an array of pearl objects with " +
  "status=='unread' and to==client_id. Does not auto-ack — call ack_message " +
  "separately for each pearl you have processed.",
  {
    client_id: z.string().describe("The recipient agent ID to check messages for (e.g. 'knight')"),
    limit:     z.number().int().min(1).max(100).optional().default(20)
                .describe("Max number of unread messages to return (default 20)"),
  },
  async ({ client_id, limit }) => {
    try {
      const pearls = readPearls();
      const unread = pearls
        .filter(p => p.to === client_id && p.status === "unread")
        .slice(0, limit ?? 20);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, count: unread.length, messages: unread }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
);

// ── Tool: ack_message ─────────────────────────────────────────────────────────

server.tool(
  "ack_message",
  "Mark a specific message pearl as read in ~/.mnemosynec/messages.jsonl. " +
  "Locates the pearl by pearl_id and sets status to 'read'. " +
  "Returns ok:true with the updated pearl, or ok:false if the pearl was not found.",
  {
    pearl_id: z.string().describe("UUID of the pearl to acknowledge"),
  },
  async ({ pearl_id }) => {
    try {
      const pearls = readPearls();
      const idx = pearls.findIndex(p => p.pearl_id === pearl_id);
      if (idx === -1) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok:      false,
                error:   `Pearl not found: ${pearl_id}`,
                pearl_id,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
      pearls[idx] = { ...pearls[idx], status: "read", acked_at: new Date().toISOString() };
      writePearls(pearls);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, pearl: pearls[idx] }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2),
          },
        ],
        isError: true,
      };
    }
  },
);

// ── Librarian proxy tools (SEG-MC-2) — proxy_to_librarian: true ──────────────

server.tool(
  "brief_me",
  "[proxy_to_librarian] MoneyPenny Smart Router: returns a compact, task-scoped context " +
  "package in ~600 words. Call this FIRST at session start. Replaces get_system_overview + " +
  "query_domain + get_architecture + check_consistency. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    task: z.string().describe(
      "Natural language description of what you're about to work on, " +
      "e.g. 'build housing payment contribution form'",
    ),
  },
  async ({ task }) => proxyToLibrarian("brief_me", { task }),
);

server.tool(
  "search_knowledge",
  "[proxy_to_librarian] Full-text search across all librarian index files. " +
  "Returns top matches with context snippets. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    query: z.string().describe("Search query"),
    limit: z.number().int().min(1).max(100).optional().describe(
      "Max results to return (default 10)",
    ),
  },
  async ({ query, limit }) => proxyToLibrarian("search_knowledge", {
    query,
    options: limit !== undefined ? { limit } : undefined,
  }),
);

server.tool(
  "pheromone_query",
  "[proxy_to_librarian] Detective Phase 0 fast path: query the stigmergic pheromone " +
  "substrate for a claim. Returns ranked hits from the constant-time inverted-topic index. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    claim: z.string().min(3).max(500).describe(
      "Topic or claim to investigate (e.g. 'founder anecdote', 'pheromone substrate', '#2317')",
    ),
  },
  async ({ claim }) => proxyToLibrarian("pheromone_query", { claim }),
);

server.tool(
  "get_schema",
  "[proxy_to_librarian] Returns columns, types, constraints, FKs, indexes, RLS policies, " +
  "and originating migration for a table. Pass 'list' to see all tables. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    table: z.string().describe("Table name or 'list' to see all tables"),
  },
  async ({ table }) => proxyToLibrarian("get_schema", { table }),
);

server.tool(
  "get_page_info",
  "[proxy_to_librarian] Returns route, data queries, feature flag dependencies, and edge " +
  "function calls for a page. Pass 'list' to see all pages. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    page: z.string().describe("Page component name or 'list'"),
  },
  async ({ page }) => proxyToLibrarian("get_page_info", { page }),
);

server.tool(
  "query_domain",
  "[proxy_to_librarian] Returns all tables, functions, pages, feature flags, and Cephas " +
  "content for a domain (e.g. 'lb_card', 'housing', 'ghost_world'). Pass 'list' to see all " +
  "domains. Returns graceful error if librarian dist/server.js is not built.",
  {
    domain: z.string().describe("Domain name or 'list' to see all available domains"),
    query:  z.string().optional().describe("Optional filter query within the domain"),
  },
  async ({ domain, query }) => proxyToLibrarian("query_domain", {
    domain,
    ...(query !== undefined ? { query } : {}),
  }),
);

server.tool(
  "get_component",
  "[proxy_to_librarian] Returns exports, imports, Supabase queries, and props for React " +
  "components, hooks, or libs. Pass name for details or 'list' for all. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    query: z.string().describe("Component/hook/lib name, or 'list'/'hooks'/'libs' to browse"),
  },
  async ({ query }) => proxyToLibrarian("get_component", { query }),
);

server.tool(
  "get_architecture",
  "[proxy_to_librarian] Returns architectural concept explanation from Cephas. Searches by " +
  "keyword, slug, or title. Pass 'list' to see all concepts. Set brief=true (default) for " +
  "summary only, brief=false for full markdown content. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    concept: z.string().describe("Concept slug, keyword, or 'list' for all concepts"),
    brief:   z.boolean().optional().describe(
      "If true (default), returns summary only. Set false for full content.",
    ),
  },
  async ({ concept, brief }) => proxyToLibrarian("get_architecture", {
    concept,
    ...(brief !== undefined ? { brief } : {}),
  }),
);

server.tool(
  "consult_scribes",
  "[proxy_to_librarian] RAM-access pattern for the Cathedral: query Scribes for recent " +
  "observations on a topic. Scores topic against every registered Scribe's primary + adjacent " +
  "fields, returns up to max_entries from highest-scoring Scribes. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    topic:            z.string().min(2).describe(
      "Topic to look up — keyword, phrase, named entity, or canonical id",
    ),
    max_entries:      z.number().int().min(1).max(500).optional().describe(
      "Maximum entries to return (default 20)",
    ),
    include_adjacents: z.boolean().optional().describe(
      "If true (default), also return entries from adjacently-matching Scribes",
    ),
    cathedral:        z.enum(["bishop", "knight"]).optional().describe(
      "Which Cathedral to consult: 'bishop' (default) or 'knight'",
    ),
  },
  async ({ topic, max_entries, include_adjacents, cathedral }) =>
    proxyToLibrarian("consult_scribes", {
      topic,
      ...(max_entries       !== undefined ? { max_entries }       : {}),
      ...(include_adjacents !== undefined ? { include_adjacents } : {}),
      ...(cathedral         !== undefined ? { cathedral }         : {}),
    }),
);

server.tool(
  "detective_investigate",
  "[proxy_to_librarian] Cross-Scribe investigation (Phase 0 pheromone fast-path + Phase 1 " +
  "Scribe RPC fallback). Returns structured findings: phase used, hits, scribe coverage. " +
  "Use before manually scanning multiple Scribes. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    claim:               z.string().min(3).max(500).describe(
      "The claim or named entity to investigate (e.g. 'founder anecdote', 'BRIDLE Rule 3')",
    ),
    sufficiency_threshold: z.number().int().min(1).optional().describe(
      "Min pheromone hits for Phase 0 to be sufficient (default 10)",
    ),
    include_rpc_fallback: z.boolean().optional().describe(
      "If true (default), run Phase 1 consult_scribes when Phase 0 is insufficient",
    ),
    max_hits:            z.number().int().min(1).max(200).optional().describe(
      "Max Phase 0 pheromone hits to return (default 50)",
    ),
  },
  async ({ claim, sufficiency_threshold, include_rpc_fallback, max_hits }) =>
    proxyToLibrarian("detective_investigate", {
      claim,
      ...(sufficiency_threshold !== undefined ? { sufficiency_threshold } : {}),
      ...(include_rpc_fallback  !== undefined ? { include_rpc_fallback }  : {}),
      ...(max_hits              !== undefined ? { max_hits }              : {}),
    }),
);

server.tool(
  "pearl_decode",
  "[proxy_to_librarian] Decode an SSPS-wire-format message back into expanded Pearl form. " +
  "Receiver looks up canonical_ref locally and re-expands slot_values into working context. " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    ssps_payload: z.string().min(1).describe("The SSPS-encoded JSON string to decode"),
  },
  async ({ ssps_payload }) => proxyToLibrarian("pearl_decode", { ssps_payload }),
);

server.tool(
  "soccerball_decode",
  "[proxy_to_librarian] Decode a Soccerball handle back to its pearl_ids + bindings. " +
  "Returns null if the handle is not in the current process substrate (not yet emitted this session). " +
  "Returns graceful error if librarian dist/server.js is not built.",
  {
    soccerball_id: z.string().length(32).describe("32-char Soccerball handle to decode"),
  },
  async ({ soccerball_id }) => proxyToLibrarian("soccerball_decode", { soccerball_id }),
);

// ── Tools: substrate write (SEG-MC-3) ────────────────────────────────────────
// Auth gating: none — stdio = local trust. Any local process connecting via
// stdio is implicitly trusted. The write-queue fallback ensures durability
// when MnemosyneC is not running.

server.tool(
  "pearl_emit",
  "Emit a pearl (content fragment) to the MnemosyneC substrate. " +
  "When the substrate is online, writes via POST /substrate/write. " +
  "When offline, queues to ~/.mnemosynec/write-queue.jsonl for later replay. " +
  "Every call appends to the audit log at ~/.mnemosynec/mcp-audit.jsonl. " +
  "Auth: none (local stdio trust). " +
  "Returns: { ok, pearl_id, substrate:'live'|'offline', queued?:true }",
  {
    content:   z.string().describe("Pearl content text to emit to the substrate"),
    tags:      z.array(z.string()).optional().default([])
                .describe("Optional keyword tags to attach to the pearl"),
    client_id: z.string().optional().default("unknown")
                .describe("Caller agent ID (e.g. 'knight', 'bishop', 'rook', 'pawn')"),
  },
  async ({ content, tags, client_id }) => {
    try {
      const result = await pearlEmit({ content, tags: tags ?? [], client_id: client_id ?? "unknown" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2) }],
        isError: true,
      };
    }
  },
);

server.tool(
  "eblet_emit",
  "Emit an eblet (canon record) to the MnemosyneC substrate. " +
  "When the substrate is online, writes via POST /substrate/write with source tagged as 'mcp:eblet_emit:<type>'. " +
  "When offline, queues to ~/.mnemosynec/write-queue.jsonl. " +
  "Every call appends to the audit log at ~/.mnemosynec/mcp-audit.jsonl. " +
  "Auth: none (local stdio trust). " +
  "Returns: { ok, eblet_id, substrate:'live'|'offline', queued?:true }",
  {
    content:   z.string().describe("Eblet content text"),
    type:      z.string().optional().default("canon")
                .describe("Eblet type tag (e.g. 'canon', 'draft', 'rule', 'primer')"),
    client_id: z.string().optional().default("unknown")
                .describe("Caller agent ID"),
  },
  async ({ content, type, client_id }) => {
    try {
      const result = await ebletEmit({ content, type: type ?? "canon", client_id: client_id ?? "unknown" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2) }],
        isError: true,
      };
    }
  },
);

server.tool(
  "soccerball_emit",
  "Emit a soccerball session marker to the MnemosyneC DAG. " +
  "When the substrate is online, writes via POST /dag/emit with session_id and event encoded as a pearl string. " +
  "When offline, queues to ~/.mnemosynec/write-queue.jsonl. " +
  "Every call appends to the audit log at ~/.mnemosynec/mcp-audit.jsonl. " +
  "Auth: none (local stdio trust). " +
  "Returns: { ok, sid?, substrate:'live'|'offline', queued?:true }",
  {
    session_id: z.string().describe("Session identifier (e.g. 'BP079', 'K480')"),
    event:      z.string().describe("Event label (e.g. 'open', 'close', 'wave_land', 'task_complete')"),
    client_id:  z.string().optional().default("unknown")
                 .describe("Caller agent ID"),
  },
  async ({ session_id, event, client_id }) => {
    try {
      const result = await soccerballEmit({ session_id, event, client_id: client_id ?? "unknown" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2) }],
        isError: true,
      };
    }
  },
);

server.tool(
  "scribe_log",
  "Append a structured scribe log entry to the MnemosyneC substrate. " +
  "When the substrate is online, writes via POST /substrate/write with source 'mcp:scribe_log'. " +
  "When offline, queues to ~/.mnemosynec/write-queue.jsonl. " +
  "Every call appends to the audit log at ~/.mnemosynec/mcp-audit.jsonl. " +
  "Auth: none (local stdio trust). " +
  "Returns: { ok, substrate:'live'|'offline', queued?:true }",
  {
    event:     z.string().describe("Log event name (e.g. 'session_open', 'task_complete', 'wave_land')"),
    data:      z.record(z.unknown()).optional().default({})
                .describe("Arbitrary structured data payload for the log entry"),
    client_id: z.string().optional().default("unknown")
                .describe("Caller agent ID"),
  },
  async ({ event, data, client_id }) => {
    try {
      const result = await scribeLog({ event, data: data ?? {}, client_id: client_id ?? "unknown" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message ?? String(err) }, null, 2) }],
        isError: true,
      };
    }
  },
);

// ── Transport & startup ───────────────────────────────────────────────────────

const transport = new StdioServerTransport();

process.on("SIGTERM", () => {
  process.stderr.write(`[${SHIM_NAME}] SIGTERM received — shutting down\n`);
  process.exit(0);
});
process.on("SIGINT", () => {
  process.stderr.write(`[${SHIM_NAME}] SIGINT received — shutting down\n`);
  process.exit(0);
});

process.stderr.write(
  `[${SHIM_NAME}] v${VERSION} starting (pipe=${NAMED_PIPE_PATH} http=${SUBSTRATE_BASE} ` +
  `librarian=${existsSync(LIBRARIAN_DIST) ? "available" : "not-built"})\n`,
);

await server.connect(transport);
