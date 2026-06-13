#!/usr/bin/env node
/**
 * mnemosynec-mcp-http.mjs — SEG-MC-6 (BP079 Wave D)
 * ===================================================
 * Standalone HTTP+SSE transport server for remote cohort clients (Rook, Pawn).
 *
 * Runs on port 11482 (configurable via MCP_HTTP_PORT env var).
 * Proxies authenticated tool calls through to the librarian dist/server.js
 * via the same child-proxy pattern as the stdio shim (SEG-MC-2).
 *
 * Endpoints:
 *   GET  /mcp/health  — unauthenticated health check
 *   POST /mcp         — JSON-RPC tool call (Bearer token required)
 *   GET  /mcp/sse     — SSE stream (?token=<secret> query param required)
 *
 * Auth: shared secret from ~/.mnemosynec/mcp-secret.txt
 *       Auto-generated on first start if file doesn't exist.
 *
 * Config: ~/.mnemosynec/config.json
 *   { "remote_mcp_enabled": false, "mcp_http_port": 11482, "rate_limit_per_minute": 100 }
 *   Server starts if config has remote_mcp_enabled:true OR --force flag is passed.
 *
 * Usage:
 *   node scripts/mnemosynec-mcp-http.mjs [--force]
 *   npm run mcp:http   (runs with --force for testing)
 */

import { createServer }  from "node:http";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir }        from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath }  from "node:url";
import { randomBytes }    from "node:crypto";
import { spawn }          from "node:child_process";
import { createInterface } from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Constants ─────────────────────────────────────────────────────────────────

const VERSION          = "0.1.39";
const SERVER_NAME      = "mnemosynec-mcp-http";
const DEFAULT_PORT     = 11482;
const MNEMOSYNEC_DIR   = join(homedir(), ".mnemosynec");
const CONFIG_FILE      = join(MNEMOSYNEC_DIR, "config.json");
const SECRET_FILE      = join(MNEMOSYNEC_DIR, "mcp-secret.txt");
const LIBRARIAN_DIST   = resolve(__dirname, "../dist/server.js");
const LIBRARIAN_CWD    = resolve(__dirname, "..");

const FORCE_MODE       = process.argv.includes("--force");

// ── Config bootstrap ──────────────────────────────────────────────────────────

function ensureMnemosynecDir() {
  if (!existsSync(MNEMOSYNEC_DIR)) {
    mkdirSync(MNEMOSYNEC_DIR, { recursive: true });
  }
}

function loadConfig() {
  ensureMnemosynecDir();
  if (!existsSync(CONFIG_FILE)) {
    const defaults = {
      remote_mcp_enabled:   false,
      mcp_http_port:        DEFAULT_PORT,
      rate_limit_per_minute: 100,
    };
    writeFileSync(CONFIG_FILE, JSON.stringify(defaults, null, 2) + "\n", "utf-8");
    log(`Config bootstrapped at ${CONFIG_FILE}`);
    return defaults;
  }
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch (err) {
    log(`WARN: could not parse config.json (${err.message}) — using defaults`);
    return { remote_mcp_enabled: false, mcp_http_port: DEFAULT_PORT, rate_limit_per_minute: 100 };
  }
}

// ── Secret management ─────────────────────────────────────────────────────────

function loadOrCreateSecret() {
  ensureMnemosynecDir();
  if (!existsSync(SECRET_FILE)) {
    const secret = randomBytes(32).toString("hex");
    writeFileSync(SECRET_FILE, secret, { encoding: "utf-8", mode: 0o600 });
    log(`Generated new MCP shared secret → ${SECRET_FILE}`);
    return secret;
  }
  return readFileSync(SECRET_FILE, "utf-8").trim();
}

// ── Rate limiter (in-memory Map, no external deps) ────────────────────────────

/** @type {Map<string, {count: number, resetAt: number}>} */
const rateLimitMap = new Map();

function checkRateLimit(ip, limitPerMinute) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= limitPerMinute) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Prune stale entries periodically to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, 120_000).unref();

// ── Logging ───────────────────────────────────────────────────────────────────

function log(msg) {
  process.stderr.write(`[${SERVER_NAME}] ${msg}\n`);
}

// ── JSON response helpers ─────────────────────────────────────────────────────

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type":  "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

// ── Auth helper ───────────────────────────────────────────────────────────────

function extractBearer(req) {
  const auth = req.headers["authorization"] ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

// ── Body reader ───────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8"))); }
      catch (e) { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

// ── Librarian proxy (mirrors SEG-MC-2 pattern) ───────────────────────────────

async function proxyToLibrarian(toolName, args) {
  if (!existsSync(LIBRARIAN_DIST)) {
    return {
      error: "librarian not available",
      hint:  "Run: cd librarian-mcp && npm run build",
    };
  }

  return new Promise((resolveFn) => {
    const child = spawn(process.execPath, [LIBRARIAN_DIST], {
      stdio: ["pipe", "pipe", "pipe"],
      env:   process.env,
      cwd:   LIBRARIAN_CWD,
    });

    let settled          = false;
    const lineQueue      = [];
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
      settle({ error: "librarian proxy error", detail: String(detail) });
    }

    const callTimeout = setTimeout(
      () => settleError("timeout: librarian did not respond within 30s"),
      30_000,
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

    function waitForId(id, timeoutMs = 15_000) {
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
    child.on("exit",  (code) => {
      if (!settled) settleError(`librarian child exited early (code=${code})`);
    });

    (async () => {
      try {
        sendMsg({
          jsonrpc: "2.0", method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities:    {},
            clientInfo:      { name: "mnemosynec-http-proxy", version: VERSION },
          },
          id: 1,
        });

        const initResp = await waitForId(1, 15_000);
        if (!initResp?.result?.serverInfo) {
          throw new Error(`initialize failed: ${JSON.stringify(initResp)}`);
        }

        sendMsg({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

        sendMsg({
          jsonrpc: "2.0", method: "tools/call",
          params: { name: toolName, arguments: args },
          id: 2,
        });

        const callResp = await waitForId(2, 25_000);

        if (callResp?.error) {
          settle({ error: "librarian tool error", detail: callResp.error });
        } else {
          settle(callResp?.result ?? { error: "empty response from librarian" });
        }
      } catch (err) {
        settleError(err.message ?? String(err));
      }
    })();
  });
}

// ── SSE session store ─────────────────────────────────────────────────────────

/** @type {Map<string, {res: import('node:http').ServerResponse, pingTimer: NodeJS.Timeout}>} */
const sseSessions = new Map();

function registerSseSession(sessionId, res) {
  res.writeHead(200, {
    "Content-Type":      "text/event-stream",
    "Cache-Control":     "no-cache",
    "Connection":        "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const pingTimer = setInterval(() => {
    try {
      res.write('data: {"type":"ping"}\n\n');
    } catch {
      clearSseSession(sessionId);
    }
  }, 30_000);

  sseSessions.set(sessionId, { res, pingTimer });

  res.write(`data: {"type":"connected","session_id":"${sessionId}"}\n\n`);

  res.on("close", () => clearSseSession(sessionId));
  res.on("error", () => clearSseSession(sessionId));
}

function clearSseSession(sessionId) {
  const session = sseSessions.get(sessionId);
  if (session) {
    clearInterval(session.pingTimer);
    sseSessions.delete(sessionId);
    log(`SSE session closed: ${sessionId}`);
  }
}

function broadcastSseEvent(sessionId, eventData) {
  const session = sseSessions.get(sessionId);
  if (!session) return false;
  try {
    session.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    return true;
  } catch {
    clearSseSession(sessionId);
    return false;
  }
}

// ── HTTP request handler ──────────────────────────────────────────────────────

function makeHandler(secret, config) {
  const rateLimitPerMinute = config.rate_limit_per_minute ?? 100;

  return async function requestHandler(req, res) {
    const ip  = req.socket?.remoteAddress ?? "unknown";
    const url = new URL(req.url ?? "/", `http://127.0.0.1`);

    // ── GET /mcp/health — unauthenticated ─────────────────────────────────────
    if (req.method === "GET" && url.pathname === "/mcp/health") {
      return sendJson(res, 200, {
        status:  "ok",
        version: VERSION,
        port:    config.mcp_http_port ?? DEFAULT_PORT,
      });
    }

    // ── Rate limit check (applies to all authenticated endpoints) ─────────────
    if (!checkRateLimit(ip, rateLimitPerMinute)) {
      return sendError(res, 429, "rate limit exceeded — 100 requests/minute per IP");
    }

    // ── GET /mcp/sse — SSE stream (token in query param) ─────────────────────
    if (req.method === "GET" && url.pathname === "/mcp/sse") {
      const token = url.searchParams.get("token");
      if (!token || token !== secret) {
        return sendError(res, 401, "unauthorized — valid ?token=<secret> required");
      }

      const sessionId = `sse-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      log(`SSE session opened: ${sessionId} from ${ip}`);
      registerSseSession(sessionId, res);
      return;
    }

    // ── POST /mcp — JSON-RPC tool call ────────────────────────────────────────
    if (req.method === "POST" && url.pathname === "/mcp") {
      const bearer = extractBearer(req);
      if (!bearer || bearer !== secret) {
        return sendError(res, 401, "unauthorized — Bearer token required");
      }

      let body;
      try {
        body = await readBody(req);
      } catch {
        return sendError(res, 400, "invalid JSON body");
      }

      if (body.jsonrpc !== "2.0") {
        return sendError(res, 400, "only JSON-RPC 2.0 supported");
      }

      const { method, params, id } = body;

      // Handle MCP initialize handshake
      if (method === "initialize") {
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities:    { tools: {} },
            serverInfo:      { name: SERVER_NAME, version: VERSION },
          },
        });
      }

      if (method === "notifications/initialized") {
        return sendJson(res, 200, { jsonrpc: "2.0", id: null, result: {} });
      }

      // tools/list — return empty list (proxy handles actual tool dispatch)
      if (method === "tools/list") {
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id,
          result: { tools: [] },
        });
      }

      // tools/call — proxy to librarian
      if (method === "tools/call") {
        const toolName = params?.name;
        const toolArgs = params?.arguments ?? {};

        if (!toolName) {
          return sendJson(res, 200, {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "params.name is required for tools/call" },
          });
        }

        log(`tools/call: ${toolName} from ${ip}`);

        try {
          const result = await proxyToLibrarian(toolName, toolArgs);
          return sendJson(res, 200, { jsonrpc: "2.0", id, result });
        } catch (err) {
          return sendJson(res, 200, {
            jsonrpc: "2.0",
            id,
            error: { code: -32603, message: err.message ?? String(err) },
          });
        }
      }

      // Unknown method
      return sendJson(res, 200, {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `method not found: ${method}` },
      });
    }

    // ── 404 for anything else ─────────────────────────────────────────────────
    sendError(res, 404, `not found: ${req.method} ${url.pathname}`);
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const config = loadConfig();
const port   = parseInt(process.env.MCP_HTTP_PORT ?? String(config.mcp_http_port ?? DEFAULT_PORT), 10);

if (!FORCE_MODE && !config.remote_mcp_enabled) {
  log(
    `remote_mcp_enabled is false in ${CONFIG_FILE} and --force not passed. ` +
    `Set "remote_mcp_enabled": true or run with --force to start the HTTP server.`,
  );
  process.exit(0);
}

const secret = loadOrCreateSecret();

const httpServer = createServer(makeHandler(secret, { ...config, mcp_http_port: port }));

httpServer.on("error", (err) => {
  log(`Server error: ${err.message}`);
  process.exit(1);
});

httpServer.listen(port, "127.0.0.1", () => {
  log(`v${VERSION} listening on http://127.0.0.1:${port}`);
  log(`Health: http://127.0.0.1:${port}/mcp/health`);
  log(`Secret file: ${SECRET_FILE}`);
  log(`Librarian: ${existsSync(LIBRARIAN_DIST) ? "available" : "not-built (proxy will fail)"}`);
  if (FORCE_MODE) log("Running in --force mode (remote_mcp_enabled override)");
});

process.on("SIGTERM", () => {
  log("SIGTERM received — shutting down");
  for (const sessionId of sseSessions.keys()) clearSseSession(sessionId);
  httpServer.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  log("SIGINT received — shutting down");
  for (const sessionId of sseSessions.keys()) clearSseSession(sessionId);
  httpServer.close(() => process.exit(0));
});

// Export for testing
export { makeHandler, loadConfig, loadOrCreateSecret, checkRateLimit, VERSION, DEFAULT_PORT };
