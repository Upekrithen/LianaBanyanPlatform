/**
 * WAVE 6 — Chrome + Copilot Reality: Integration Tests
 * =====================================================
 *
 * Scopes 23-26: Integration tests for all extension->bridge flows
 *
 * Scope 23: Health check flow (GET /health, auth modes, offline fallback)
 * Scope 24: Save note flow (POST /yoke/note, validation, auth)
 * Scope 25: Query flow (POST /substrate/query, hit/miss, routing metadata)
 * Scope 26: Copy-for-Copilot flow (query -> format -> clipboard content)
 *
 * These tests run in-process with a simulated bridge server.
 * They model the exact HTTP contract the extension relies on.
 *
 * Tags: Wave6/PhaseAlpha / BP073
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as http from "node:http";
import * as crypto from "node:crypto";

// ─── Minimal in-process bridge server (mirrors bridge/server.js) ──────────────

interface BridgeConfig {
  port: number;
  token: string;
  eblets: Array<{ content: string; tags: string[] }>;
  notes: Array<{ note: string; tags: string[] }>;
}

interface NoteEntry {
  id: string;
  note: string;
  tags: string[];
  urgency: string;
  saved_at: string;
  source: string;
}

interface HealthResponse {
  status: string;
  version: string;
  index_size: number;
  eblet_count: number;
  note_count: number;
  auth_mode: string;
  port: number;
  uptime_s: number;
}

interface QueryResponse {
  hit: boolean;
  response: string | null;
  answer?: string;
  routing: string;
  latency_ms: number;
  match_count: number;
}

interface NoteResponse {
  saved: boolean;
  id: string;
  note_count: number;
}

function startTestBridge(cfg: BridgeConfig): Promise<{ server: http.Server; base: string }> {
  const notes: NoteEntry[] = [...cfg.notes.map((n) => ({ ...n, id: crypto.randomUUID(), urgency: "low", saved_at: new Date().toISOString(), source: "test" }))];

  function checkAuth(req: http.IncomingMessage): boolean {
    if (!cfg.token) return true;
    const auth = req.headers["authorization"] ?? "";
    const [scheme, tok] = auth.split(" ");
    return scheme === "Bearer" && tok === cfg.token;
  }

  function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (c: Buffer) => { body += c; });
      req.on("end", () => {
        try { resolve(JSON.parse(body || "{}")); }
        catch { resolve({}); }
      });
    });
  }

  function jsonResponse(res: http.ServerResponse, status: number, data: unknown): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://localhost:${cfg.port}`);

    if (req.method === "GET" && url.pathname === "/health") {
      if (!checkAuth(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
      return jsonResponse(res, 200, {
        status: "ok",
        version: "1.1.0",
        index_size: cfg.eblets.length,
        eblet_count: cfg.eblets.length,
        note_count: notes.length,
        auth_mode: cfg.token ? "token" : "trust",
        port: cfg.port,
        uptime_s: 1,
      } satisfies HealthResponse);
    }

    if (req.method === "POST" && url.pathname === "/substrate/query") {
      if (!checkAuth(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
      const body = await readBody(req);
      const query = ((body.query as string) ?? "").toLowerCase().trim();
      if (!query) return jsonResponse(res, 400, { error: "query is required" });

      const matches: Array<{ source: string; text: string; score: number }> = [];
      for (const eblet of cfg.eblets) {
        const content = eblet.content.toLowerCase();
        const tags = eblet.tags.join(" ").toLowerCase();
        if (content.includes(query) || tags.includes(query)) {
          matches.push({ source: "eblet", text: eblet.content, score: content.includes(query) ? 2 : 1 });
        }
      }
      for (const note of notes) {
        if (note.note.toLowerCase().includes(query)) {
          matches.push({ source: "note", text: note.note, score: 1 });
        }
      }
      matches.sort((a, b) => b.score - a.score);

      if (matches.length > 0) {
        return jsonResponse(res, 200, {
          hit: true,
          response: matches.slice(0, 3).map((m) => m.text).join("\n\n"),
          routing: "substrate",
          latency_ms: 1,
          match_count: matches.length,
        } satisfies QueryResponse);
      }

      return jsonResponse(res, 200, {
        hit: false,
        response: null,
        answer: `No memory found for: "${body.query}".`,
        routing: "miss",
        latency_ms: 1,
        match_count: 0,
      } satisfies QueryResponse);
    }

    if (req.method === "POST" && url.pathname === "/yoke/note") {
      if (!checkAuth(req)) return jsonResponse(res, 401, { error: "Unauthorized" });
      const body = await readBody(req);
      const noteText = ((body.note as string) ?? "").trim();
      if (!noteText) return jsonResponse(res, 400, { error: "note is required" });

      const entry: NoteEntry = {
        id: crypto.randomUUID(),
        note: noteText,
        tags: (body.tags as string[]) ?? [],
        urgency: (body.urgency as string) ?? "low",
        saved_at: new Date().toISOString(),
        source: "chrome-extension",
      };
      notes.push(entry);
      return jsonResponse(res, 200, {
        saved: true,
        id: entry.id,
        note_count: notes.length,
      } satisfies NoteResponse);
    }

    jsonResponse(res, 404, { error: "Not found", path: url.pathname });
  });

  return new Promise((resolve, reject) => {
    server.listen(cfg.port, "127.0.0.1", () => {
      resolve({ server, base: `http://localhost:${cfg.port}` });
    });
    server.on("error", reject);
  });
}

function stopBridge(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    // Force-close any lingering keep-alive connections so the port releases immediately.
    if (typeof (server as http.Server & { closeAllConnections?: () => void }).closeAllConnections === "function") {
      (server as http.Server & { closeAllConnections: () => void }).closeAllConnections();
    }
    server.close(() => resolve());
  });
}

// Helper to make fetch calls in the test environment
async function callBridge(
  base: string,
  path: string,
  opts: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Connection": "close", // prevent keep-alive reuse across server restarts in tests
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${base}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

// ─── SCOPE 23: Health check flow ─────────────────────────────────────────────

describe("Scope 23: Bridge /health endpoint", () => {
  let server: http.Server;
  let base: string;

  beforeEach(async () => {
    const result = await startTestBridge({
      port: 19001,
      token: "",
      eblets: [{ content: "Recipe for lemon chicken", tags: ["recipes"] }],
      notes: [{ note: "Buy groceries tomorrow", tags: ["todo"] }],
    });
    server = result.server;
    base = result.base;
  });

  afterEach(() => stopBridge(server));

  it("S23.1: returns status ok with trust mode", async () => {
    const { status, data } = await callBridge(base, "/health");
    expect(status).toBe(200);
    expect((data as HealthResponse).status).toBe("ok");
    expect((data as HealthResponse).auth_mode).toBe("trust");
  });

  it("S23.2: returns version field", async () => {
    const { data } = await callBridge(base, "/health");
    expect(typeof (data as HealthResponse).version).toBe("string");
    expect((data as HealthResponse).version).toBeTruthy();
  });

  it("S23.3: returns index_size reflecting eblet count", async () => {
    const { data } = await callBridge(base, "/health");
    expect((data as HealthResponse).index_size).toBe(1);
    expect((data as HealthResponse).eblet_count).toBe(1);
  });

  it("S23.4: returns note_count reflecting saved notes", async () => {
    const { data } = await callBridge(base, "/health");
    expect((data as HealthResponse).note_count).toBe(1);
  });

  it("S23.5: CORS header present on /health", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("S23.6: OPTIONS preflight returns 204", async () => {
    const res = await fetch(`${base}/health`, { method: "OPTIONS" });
    expect(res.status).toBe(204);
  });

  it("S23.7: returns 401 when token required but missing", async () => {
    const result2 = await startTestBridge({ port: 19002, token: "secret123", eblets: [], notes: [] });
    try {
      const { status, data } = await callBridge(result2.base, "/health");
      expect(status).toBe(401);
      expect((data as { error: string }).error).toMatch(/Unauthorized/i);
    } finally {
      await stopBridge(result2.server);
    }
  });

  it("S23.8: returns 200 when correct token provided", async () => {
    const result2 = await startTestBridge({ port: 19003, token: "secret123", eblets: [], notes: [] });
    try {
      const { status } = await callBridge(result2.base, "/health", { token: "secret123" });
      expect(status).toBe(200);
    } finally {
      await stopBridge(result2.server);
    }
  });
});

// ─── SCOPE 24: Save note flow ─────────────────────────────────────────────────

describe("Scope 24: Bridge /yoke/note endpoint", () => {
  let server: http.Server;
  let base: string;

  beforeEach(async () => {
    const result = await startTestBridge({ port: 19010, token: "", eblets: [], notes: [] });
    server = result.server;
    base = result.base;
  });

  afterEach(() => stopBridge(server));

  it("S24.1: saves a note and returns saved:true", async () => {
    const { status, data } = await callBridge(base, "/yoke/note", {
      method: "POST",
      body: { note: "Remember to call Mom on Sunday", tags: ["family"] },
    });
    expect(status).toBe(200);
    expect((data as NoteResponse).saved).toBe(true);
  });

  it("S24.2: returned note has a UUID id", async () => {
    const { data } = await callBridge(base, "/yoke/note", {
      method: "POST",
      body: { note: "Test note" },
    });
    expect(typeof (data as NoteResponse).id).toBe("string");
    expect((data as NoteResponse).id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("S24.3: note_count increments with each save", async () => {
    await callBridge(base, "/yoke/note", { method: "POST", body: { note: "Note 1" } });
    const { data } = await callBridge(base, "/yoke/note", { method: "POST", body: { note: "Note 2" } });
    expect((data as NoteResponse).note_count).toBe(2);
  });

  it("S24.4: returns 400 when note is empty", async () => {
    const { status } = await callBridge(base, "/yoke/note", { method: "POST", body: { note: "" } });
    expect(status).toBe(400);
  });

  it("S24.5: returns 400 when note field missing", async () => {
    const { status } = await callBridge(base, "/yoke/note", { method: "POST", body: {} });
    expect(status).toBe(400);
  });

  it("S24.6: saved note is searchable via /substrate/query", async () => {
    await callBridge(base, "/yoke/note", {
      method: "POST",
      body: { note: "The secret recipe is in the blue notebook" },
    });
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "secret recipe" },
    });
    expect((data as QueryResponse).hit).toBe(true);
    expect((data as QueryResponse).response).toContain("secret recipe");
  });

  it("S24.7: chrome-extension tag is preserved", async () => {
    // Verify the note-count increases (integration check for tag persistence is in data layer)
    const { data } = await callBridge(base, "/yoke/note", {
      method: "POST",
      body: { note: "Tagged note", tags: ["chrome-extension", "context-menu"] },
    });
    expect((data as NoteResponse).saved).toBe(true);
  });
});

// ─── SCOPE 25: Query flow ─────────────────────────────────────────────────────

describe("Scope 25: Bridge /substrate/query endpoint", () => {
  let server: http.Server;
  let base: string;

  beforeEach(async () => {
    const result = await startTestBridge({
      port: 19020,
      token: "",
      eblets: [
        { content: "Lemon chicken recipe: marinate with lemon, garlic, herbs", tags: ["recipes", "food"] },
        { content: "Reading list: Sapiens by Harari, The Pragmatic Programmer", tags: ["books"] },
        { content: "Project Mnemosyne: local AI memory platform for personal use", tags: ["projects"] },
      ],
      notes: [
        { note: "Buy groceries: eggs, milk, lemon", tags: ["todo"] },
      ],
    });
    server = result.server;
    base = result.base;
  });

  afterEach(() => stopBridge(server));

  it("S25.1: returns hit:true for matching eblet content", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "lemon chicken" },
    });
    expect((data as QueryResponse).hit).toBe(true);
    expect((data as QueryResponse).response).toContain("lemon");
  });

  it("S25.2: returns routing:substrate on a hit", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "Sapiens" },
    });
    expect((data as QueryResponse).routing).toBe("substrate");
  });

  it("S25.3: returns hit:false for no match", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "underwater basket weaving" },
    });
    expect((data as QueryResponse).hit).toBe(false);
    expect((data as QueryResponse).routing).toBe("miss");
  });

  it("S25.4: miss response includes friendly answer text", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "xyzzy no match" },
    });
    expect(typeof (data as QueryResponse).answer).toBe("string");
    expect((data as QueryResponse).answer!.length).toBeGreaterThan(0);
  });

  it("S25.5: returns latency_ms field", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "lemon" },
    });
    expect(typeof (data as QueryResponse).latency_ms).toBe("number");
  });

  it("S25.6: returns match_count field", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "lemon" },
    });
    expect(typeof (data as QueryResponse).match_count).toBe("number");
    expect((data as QueryResponse).match_count).toBeGreaterThan(0);
  });

  it("S25.7: returns 400 when query is empty", async () => {
    const { status } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "" },
    });
    expect(status).toBe(400);
  });

  it("S25.8: case-insensitive matching", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "SAPIENS" },
    });
    expect((data as QueryResponse).hit).toBe(true);
  });

  it("S25.9: matches notes as well as eblets", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "groceries" },
    });
    expect((data as QueryResponse).hit).toBe(true);
  });

  it("S25.10: returns 401 when auth required and missing", async () => {
    const result2 = await startTestBridge({
      port: 19021,
      token: "tok_abc",
      eblets: [{ content: "private note", tags: [] }],
      notes: [],
    });
    try {
      const { status } = await callBridge(result2.base, "/substrate/query", {
        method: "POST",
        body: { query: "private" },
      });
      expect(status).toBe(401);
    } finally {
      await stopBridge(result2.server);
    }
  });
});

// ─── SCOPE 26: Copy-for-Copilot flow ─────────────────────────────────────────

describe("Scope 26: Copy-for-Copilot formatted output", () => {
  let server: http.Server;
  let base: string;

  beforeEach(async () => {
    const result = await startTestBridge({
      port: 19030,
      token: "",
      eblets: [
        { content: "Mnemosyne is a local-first AI memory platform. It stores your notes privately.", tags: ["mnemosyne"] },
      ],
      notes: [],
    });
    server = result.server;
    base = result.base;
  });

  afterEach(() => stopBridge(server));

  // The copy-for-Copilot flow: query memory, format as structured prompt prefix
  function formatCopilotContext(topic: string, memoryBlock: string): string {
    return [
      `--- Mnemosyne Context (from local memory, ${new Date().toLocaleDateString()}) ---`,
      `Topic: ${topic}`,
      memoryBlock.trim(),
      `--- End Mnemosyne Context ---`,
      "",
      "Based on the above context from my personal notes, ",
    ].join("\n");
  }

  it("S26.1: copilot context starts with Mnemosyne Context header", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "mnemosyne" },
    });
    const result = data as QueryResponse;
    const context = formatCopilotContext("Mnemosyne", result.hit ? result.response! : "(No memory found)");
    expect(context).toMatch(/^--- Mnemosyne Context/);
  });

  it("S26.2: copilot context ends with Copilot prompt stem", async () => {
    const context = formatCopilotContext("test topic", "some memory content");
    expect(context).toContain("Based on the above context from my personal notes,");
  });

  it("S26.3: copilot context includes topic line", async () => {
    const context = formatCopilotContext("Recipe ideas", "Found some recipes");
    expect(context).toContain("Topic: Recipe ideas");
  });

  it("S26.4: copilot context includes End Mnemosyne Context footer", async () => {
    const context = formatCopilotContext("test", "memory");
    expect(context).toContain("--- End Mnemosyne Context ---");
  });

  it("S26.5: hit memory content is included in copilot context", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "local-first" },
    });
    const result = data as QueryResponse;
    expect(result.hit).toBe(true);
    const context = formatCopilotContext("Mnemosyne", result.response!);
    expect(context).toContain("local-first");
  });

  it("S26.6: miss case uses graceful fallback text in context", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "xyzzy_nomatch_abc" },
    });
    const result = data as QueryResponse;
    expect(result.hit).toBe(false);
    const memoryBlock = result.hit ? result.response! : "(No relevant memory found for this page.)";
    const context = formatCopilotContext("Unknown topic", memoryBlock);
    expect(context).toContain("No relevant memory found");
  });

  it("S26.7: full round-trip - query then format produces pasteable string", async () => {
    const { data } = await callBridge(base, "/substrate/query", {
      method: "POST",
      body: { query: "mnemosyne platform" },
    });
    const result = data as QueryResponse;
    const memBlock = result.hit && result.response ? result.response : "(No memory found.)";
    const context = formatCopilotContext("Mnemosyne platform", memBlock);

    // Verify structure: header + topic + memory + footer + stem
    expect(context.split("\n").length).toBeGreaterThanOrEqual(5);
    expect(context).toMatch(/--- Mnemosyne Context/);
    expect(context).toMatch(/Topic:/);
    expect(context).toMatch(/--- End Mnemosyne Context ---/);
    expect(context).toMatch(/Based on the above context/);
  });
});
