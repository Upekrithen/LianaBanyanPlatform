/**
 * Drekaskip Wave Generator — HTTP Daemon (Bushel 61A / G10 T4 production-class)
 * Runs as a long-running daemon process on port DREKASKIP_PORT (default 7461).
 *
 * Endpoints:
 *   POST /wave/dispatch        → instantiate K30 wave, return wave_id
 *   GET  /wave/:id/status      → K30 branch states (running/completed/timed_out)
 *   GET  /wave/:id/stream      → SSE real-time K30 branch events + merge progress
 *   GET  /sagas                → list all sagas
 *   GET  /sagas/:id            → query saga by ID
 *   GET  /healthz              → 200 + recent wave activity summary
 *
 * G10 T4 production-class:
 *   - Long-running daemon (not a unit-test scope)
 *   - /healthz reports activity summary
 *   - Crash-recovery: in-flight waves marked aborted on restart; disk-persisted
 *   - Production environment matches dev (4-Tier Proof Matrix T4, LB-STACK-0238)
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  initWaveGenerator,
  dispatchWave,
  getWaveStatus,
  getActivitySummary,
  subscribeToWave,
  loadSaga,
  listAllSagas,
} from "./wave_generator.js";
import type { WaveConfig } from "./types.js";

const PORT = parseInt(process.env.DREKASKIP_PORT ?? "7461", 10);

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const baseUrl = `http://localhost:${PORT}`;
  const url = new URL(req.url ?? "/", baseUrl);
  const method = req.method ?? "GET";
  const path = url.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // GET /healthz
  if (method === "GET" && path === "/healthz") {
    json(res, 200, { status: "ok", daemon: "drekaskip", ...getActivitySummary() });
    return;
  }

  // POST /wave/dispatch
  if (method === "POST" && path === "/wave/dispatch") {
    try {
      const raw = await parseBody(req);
      const config = JSON.parse(raw) as WaveConfig;

      if (!config.saga_id || !Array.isArray(config.axes) || config.axes.length === 0) {
        json(res, 400, { error: "saga_id and axes[] are required" });
        return;
      }
      if (!config.budget || typeof config.budget.max_segs !== "number") {
        json(res, 400, { error: "budget.max_segs required" });
        return;
      }

      const wave = await dispatchWave(config);
      json(res, 202, { wave_id: wave.wave_id, saga_id: wave.saga_id, budget: wave.config.budget });
    } catch (e) {
      json(res, 400, { error: String(e) });
    }
    return;
  }

  // GET /wave/:id/status
  const statusMatch = path.match(/^\/wave\/([^/]+)\/status$/);
  if (method === "GET" && statusMatch) {
    const waveId = decodeURIComponent(statusMatch[1]);
    const status = getWaveStatus(waveId);
    if (!status) { json(res, 404, { error: "wave not found" }); return; }
    json(res, 200, status);
    return;
  }

  // GET /wave/:id/stream — SSE real-time stream
  const streamMatch = path.match(/^\/wave\/([^/]+)\/stream$/);
  if (method === "GET" && streamMatch) {
    const waveId = decodeURIComponent(streamMatch[1]);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.flushHeaders();

    const write = (event: { event: string; data: Record<string, unknown>; ts: string }) => {
      res.write(`event: ${event.event}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    };

    // Send current status immediately
    const current = getWaveStatus(waveId);
    if (current) {
      write({ event: "wave:status", data: current as unknown as Record<string, unknown>, ts: new Date().toISOString() });
    }

    const unsubscribe = subscribeToWave(waveId, (event) => write(event));

    req.on("close", () => {
      unsubscribe();
    });

    // Keep alive ping every 15s
    const keepAlive = setInterval(() => {
      try { res.write(": keepalive\n\n"); } catch { clearInterval(keepAlive); }
    }, 15000);

    req.on("close", () => clearInterval(keepAlive));
    return;
  }

  // GET /sagas
  if (method === "GET" && path === "/sagas") {
    const sagas = listAllSagas();
    json(res, 200, sagas);
    return;
  }

  // GET /sagas/:id
  const sagaMatch = path.match(/^\/sagas\/(.+)$/);
  if (method === "GET" && sagaMatch) {
    const sagaId = decodeURIComponent(sagaMatch[1]);
    const saga = loadSaga(sagaId);
    json(res, 200, saga);
    return;
  }

  json(res, 404, { error: "not found" });
}

export function startDaemon(): void {
  // G10: crash-recovery init — restore persisted waves from disk
  initWaveGenerator();

  const server = createServer((req, res) => {
    handleRequest(req, res).catch(err => {
      console.error("[drekaskip] Request error:", err);
      if (!res.headersSent) json(res, 500, { error: "internal error" });
    });
  });

  server.listen(PORT, () => {
    console.log(`[drekaskip] Wave Generator daemon listening on port ${PORT}`);
    console.log(`[drekaskip] K30 §10 config: discard_threshold=Infinity, merge_policy=fan_in_synthesize`);
    console.log(`[drekaskip] Commit ref: 03e6337 (K30 Contingency Operator, LB-STACK-0185)`);
  });

  server.on("error", (err) => {
    console.error("[drekaskip] Daemon error:", err);
    process.exit(1);
  });

  // Graceful shutdown
  for (const sig of ["SIGTERM", "SIGINT"]) {
    process.on(sig, () => {
      console.log(`[drekaskip] Received ${sig} — shutting down gracefully`);
      server.close(() => process.exit(0));
    });
  }
}
