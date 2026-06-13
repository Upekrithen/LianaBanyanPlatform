#!/usr/bin/env node
/**
 * mnemosynec-write-tools.mjs — SEG-MC-3 (BP079 Wave D)
 * =====================================================
 * Substrate write functions with offline-queue fallback + audit trail.
 *
 * Substrate API routes used (from src/main/substrate_api.ts):
 *   pearl_emit      → POST /substrate/write  { text, source:"mcp:pearl_emit", keywords:tags }
 *   eblet_emit      → POST /substrate/write  { text, source:"mcp:eblet_emit:<type>" }
 *   soccerball_emit → POST /dag/emit         { pearls:["<session_id>|<event>|<client_id>"] }
 *   scribe_log      → POST /substrate/write  { text:JSON.stringify({event,data}), source:"mcp:scribe_log" }
 *
 * When MnemosyneC is offline (or POST fails), entries are queued to:
 *   ~/.mnemosynec/write-queue.jsonl
 *
 * Every call (live or queued) appends to:
 *   ~/.mnemosynec/mcp-audit.jsonl
 */

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBSTRATE_BASE  = process.env.MNEMOSYNEC_HTTP_BASE ?? "http://127.0.0.1:11480";
const MNEMOSYNEC_DIR  = join(homedir(), ".mnemosynec");
const WRITE_QUEUE     = join(MNEMOSYNEC_DIR, "write-queue.jsonl");
const AUDIT_LOG       = join(MNEMOSYNEC_DIR, "mcp-audit.jsonl");

// ── Internal helpers ──────────────────────────────────────────────────────────

function ensureDir() {
  if (!existsSync(MNEMOSYNEC_DIR)) {
    mkdirSync(MNEMOSYNEC_DIR, { recursive: true });
  }
}

/**
 * Append one JSON line to the audit log.
 * Never throws — audit failures must not break the write tools.
 */
export function appendAudit(entry) {
  try {
    ensureDir();
    const line = JSON.stringify({
      ts:        new Date().toISOString(),
      client_id: entry.client_id ?? "unknown",
      tool:      entry.tool,
      result_id: entry.result_id ?? null,
      success:   entry.success ?? false,
      ...( entry.error ? { error: entry.error } : {} ),
    });
    appendFileSync(AUDIT_LOG, line + "\n", "utf-8");
  } catch {
    // silently swallow — audit is best-effort
  }
}

/**
 * Append a write entry to the offline queue.
 */
function queueWrite(type, payload) {
  ensureDir();
  const entry = {
    queued_at: new Date().toISOString(),
    type,
    ...payload,
  };
  appendFileSync(WRITE_QUEUE, JSON.stringify(entry) + "\n", "utf-8");
  return entry;
}

/**
 * POST JSON to the substrate API.
 * Returns { ok, status, data } — never throws.
 */
async function substratePost(path, body) {
  try {
    const url = `${SUBSTRATE_BASE}${path}`;
    const response = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(4000),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message ?? String(err) };
  }
}

// ── Public write functions ────────────────────────────────────────────────────

/**
 * Emit a pearl to the substrate.
 *
 * Live path:  POST /substrate/write { text: content, source: "mcp:pearl_emit", keywords: tags }
 * Offline:    queues to ~/.mnemosynec/write-queue.jsonl with type:"pearl_emit"
 *
 * @param {{ content: string, tags?: string[], client_id?: string }} args
 * @returns {Promise<{ ok: boolean, pearl_id?: string, queued?: boolean, error?: string }>}
 */
export async function pearlEmit({ content, tags = [], client_id = "unknown" }) {
  const pearl_id = randomUUID();

  const result = await substratePost("/substrate/write", {
    id:       pearl_id,
    text:     content,
    source:   "mcp:pearl_emit",
    keywords: tags,
  });

  if (result.ok) {
    appendAudit({ tool: "pearl_emit", client_id, result_id: result.data?.id ?? pearl_id, success: true });
    return { ok: true, pearl_id: result.data?.id ?? pearl_id, substrate: "live" };
  }

  // Offline fallback — queue for later replay
  queueWrite("pearl_emit", { content, tags, client_id, pearl_id });
  appendAudit({ tool: "pearl_emit", client_id, result_id: pearl_id, success: true, error: `queued (substrate: ${result.error ?? `HTTP ${result.status}`})` });
  return { ok: true, pearl_id, queued: true, substrate: "offline" };
}

/**
 * Emit an eblet to the substrate.
 *
 * Live path:  POST /substrate/write { text: content, source: "mcp:eblet_emit:<type>" }
 * Offline:    queues to ~/.mnemosynec/write-queue.jsonl with type:"eblet_emit"
 *
 * @param {{ content: string, type?: string, client_id?: string }} args
 * @returns {Promise<{ ok: boolean, eblet_id?: string, queued?: boolean, error?: string }>}
 */
export async function ebletEmit({ content, type = "canon", client_id = "unknown" }) {
  const eblet_id = randomUUID();

  const result = await substratePost("/substrate/write", {
    id:     eblet_id,
    text:   content,
    source: `mcp:eblet_emit:${type}`,
  });

  if (result.ok) {
    appendAudit({ tool: "eblet_emit", client_id, result_id: result.data?.id ?? eblet_id, success: true });
    return { ok: true, eblet_id: result.data?.id ?? eblet_id, substrate: "live" };
  }

  queueWrite("eblet_emit", { content, type, client_id, eblet_id });
  appendAudit({ tool: "eblet_emit", client_id, result_id: eblet_id, success: true, error: `queued (substrate: ${result.error ?? `HTTP ${result.status}`})` });
  return { ok: true, eblet_id, queued: true, substrate: "offline" };
}

/**
 * Emit a soccerball session marker to the DAG.
 *
 * Live path:  POST /dag/emit { pearls: ["<session_id>|<event>|<client_id>"] }
 * Offline:    queues to ~/.mnemosynec/write-queue.jsonl with type:"soccerball_emit"
 *
 * @param {{ session_id: string, event: string, client_id?: string }} args
 * @returns {Promise<{ ok: boolean, sid?: string, queued?: boolean, error?: string }>}
 */
export async function soccerballEmit({ session_id, event, client_id = "unknown" }) {
  const pearlStr = `${session_id}|${event}|${client_id}`;

  const result = await substratePost("/dag/emit", {
    pearls: [pearlStr],
  });

  if (result.ok) {
    appendAudit({ tool: "soccerball_emit", client_id, result_id: result.data?.sid ?? session_id, success: true });
    return { ok: true, sid: result.data?.sid, substrate: "live" };
  }

  queueWrite("soccerball_emit", { session_id, event, client_id });
  appendAudit({ tool: "soccerball_emit", client_id, result_id: session_id, success: true, error: `queued (substrate: ${result.error ?? `HTTP ${result.status}`})` });
  return { ok: true, queued: true, substrate: "offline" };
}

/**
 * Append a scribe log entry to the substrate.
 *
 * Live path:  POST /substrate/write { text: JSON.stringify({event, data}), source: "mcp:scribe_log" }
 * Offline:    queues to ~/.mnemosynec/write-queue.jsonl with type:"scribe_log"
 *
 * @param {{ event: string, data?: object, client_id?: string }} args
 * @returns {Promise<{ ok: boolean, queued?: boolean, error?: string }>}
 */
export async function scribeLog({ event, data = {}, client_id = "unknown" }) {
  const log_id = randomUUID();

  const result = await substratePost("/substrate/write", {
    id:     log_id,
    text:   JSON.stringify({ event, data, client_id, ts: new Date().toISOString() }),
    source: "mcp:scribe_log",
  });

  if (result.ok) {
    appendAudit({ tool: "scribe_log", client_id, result_id: result.data?.id ?? log_id, success: true });
    return { ok: true, substrate: "live" };
  }

  queueWrite("scribe_log", { event, data, client_id, log_id });
  appendAudit({ tool: "scribe_log", client_id, result_id: log_id, success: true, error: `queued (substrate: ${result.error ?? `HTTP ${result.status}`})` });
  return { ok: true, queued: true, substrate: "offline" };
}
