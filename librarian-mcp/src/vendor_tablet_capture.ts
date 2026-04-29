/**
 * Vendor Tablet Capture — TypeScript stub (K-Vendor-Layer-Tablet-Capture / B132)
 *
 * The Liana Banyan platform's MCP server (server.ts) currently has NO direct
 * vendor SDK calls — it delegates model routing to the Python empirical layer.
 * This module is a future-proof stub that matches the Python API surface.
 *
 * When TS-side vendor calls are introduced, wire them through captureVendorCall().
 *
 * Storage: librarian-mcp/stitchpunks/data/vendor_tablets/<vendor>/<YYYY-MM-DD>.jsonl
 * Schema: identical to Python vendor_tablet_capture.py SCHEMA_VERSION 1
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { randomBytes } from "crypto";

const SCHEMA_VERSION = 1;

const TABLETS_ROOT = path.join(
  __dirname,
  "..",
  "stitchpunks",
  "data",
  "vendor_tablets"
);

function currentDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function currentIso(): string {
  return new Date().toISOString();
}

function getSessionId(): string {
  for (const v of ["KNIGHT_SESSION_ID", "BISHOP_SESSION_ID", "SESSION_ID"]) {
    const val = process.env[v];
    if (val && val.trim()) return val.trim();
  }
  return "unknown";
}

function callSign(): string {
  return `vendor-call-${randomBytes(6).toString("hex")}`;
}

function tabletPath(vendor: string): string {
  const dir = path.join(TABLETS_ROOT, vendor.toLowerCase());
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${currentDate()}.jsonl`);
}

interface CaptureUsage {
  input_tokens: number;
  output_tokens: number;
  cost_usd_industry_term_membership_orthogonal?: number;
}

interface TabletRecord {
  call_sign: string;
  ts: string;
  session_id: string;
  vendor: string;
  model: string;
  endpoint: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  usage: CaptureUsage | Record<string, unknown>;
  elapsed_ms: number;
  outcome: "success" | "error";
  error_class: string | null;
  schema_version: number;
}

function flushTablet(record: TabletRecord): void {
  try {
    const filePath = tabletPath(record.vendor);
    const line = JSON.stringify(record) + "\n";
    fs.appendFileSync(filePath, line, { encoding: "utf-8" });
    // Note: Node.js appendFileSync flushes the OS buffer; fsync requires fd access.
    // Acceptable for this use case — crash-safe enough for Stone Tablet semantics.
  } catch {
    // Non-blocking: capture failures never fail the vendor call
  }
}

/**
 * Wrap a vendor API call with Stone Tablet capture.
 *
 * Usage:
 *   const result = await captureVendorCall(
 *     "anthropic", "claude-haiku-4-5", "messages.create",
 *     async (recordFn) => {
 *       const response = await sdk.messages.create({ ... });
 *       recordFn(
 *         { messages: [...] },                          // request
 *         { content: [{ text: response.content[0].text }] }, // response
 *         { input_tokens: N, output_tokens: M, cost_usd_industry_term_membership_orthogonal: 0.0 }
 *       );
 *       return response;
 *     }
 *   );
 */
export async function captureVendorCall<T>(
  vendor: string,
  model: string,
  endpoint: string,
  fn: (
    record: (
      req: Record<string, unknown>,
      res: Record<string, unknown>,
      usage: CaptureUsage
    ) => void
  ) => Promise<T>,
  sessionId?: string
): Promise<T> {
  const cs = callSign();
  const sid = sessionId ?? getSessionId();
  const t0 = Date.now();

  let capturedReq: Record<string, unknown> = {};
  let capturedRes: Record<string, unknown> = {};
  let capturedUsage: CaptureUsage | Record<string, unknown> = {};
  let outcome: "success" | "error" = "success";
  let errorClass: string | null = null;

  const recordFn = (
    req: Record<string, unknown>,
    res: Record<string, unknown>,
    usage: CaptureUsage
  ) => {
    capturedReq = req;
    capturedRes = res;
    capturedUsage = usage;
  };

  try {
    return await fn(recordFn);
  } catch (err: unknown) {
    outcome = "error";
    errorClass = err instanceof Error ? err.constructor.name : "UnknownError";
    throw err;
  } finally {
    const elapsedMs = Date.now() - t0;
    flushTablet({
      call_sign: cs,
      ts: currentIso(),
      session_id: sid,
      vendor,
      model,
      endpoint,
      request: capturedReq,
      response: capturedRes,
      usage: capturedUsage,
      elapsed_ms: elapsedMs,
      outcome,
      error_class: errorClass,
      schema_version: SCHEMA_VERSION,
    });
  }
}

/**
 * Query vendor tablets by vendor/model/since_ts/call_sign.
 * Returns matching records (most recent first, up to limit).
 */
export function vendorTabletQuery(opts: {
  vendor?: string;
  model?: string;
  since_ts?: string;
  call_sign?: string;
  limit?: number;
}): TabletRecord[] {
  const limit = opts.limit ?? 50;
  const results: TabletRecord[] = [];

  if (!fs.existsSync(TABLETS_ROOT)) return results;

  try {
    const vendorDirs = fs.readdirSync(TABLETS_ROOT);
    for (const vdir of vendorDirs) {
      if (opts.vendor && vdir.toLowerCase() !== opts.vendor.toLowerCase()) continue;
      const vpath = path.join(TABLETS_ROOT, vdir);
      if (!fs.statSync(vpath).isDirectory()) continue;

      const files = fs.readdirSync(vpath)
        .filter((f) => f.endsWith(".jsonl"))
        .sort()
        .reverse(); // newest date first

      for (const file of files) {
        const lines = fs.readFileSync(path.join(vpath, file), "utf-8").split("\n").filter(Boolean).reverse();
        for (const line of lines) {
          try {
            const rec: TabletRecord = JSON.parse(line);
            if (opts.vendor && rec.vendor?.toLowerCase() !== opts.vendor.toLowerCase()) continue;
            if (opts.model && !rec.model?.toLowerCase().includes(opts.model.toLowerCase())) continue;
            if (opts.call_sign && rec.call_sign !== opts.call_sign) continue;
            if (opts.since_ts && rec.ts < opts.since_ts) continue;
            results.push(rec);
            if (results.length >= limit) return results;
          } catch {
            continue;
          }
        }
      }
    }
  } catch {
    return results;
  }

  return results;
}
