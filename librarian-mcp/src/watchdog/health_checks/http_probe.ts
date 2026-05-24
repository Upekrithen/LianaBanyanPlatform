/**
 * Watchdog — shared HTTP health probe utility.
 *
 * R-MECHANISM-VERIFY: all HTTP probes use a real TCP round-trip.
 * The DOWN_TIMEOUT_MS (30s) applies as the hard abort timeout.
 */

import { request } from "node:http";
import { DOWN_TIMEOUT_MS } from "../types.js";

export interface HttpProbeResult {
  status_code: number;
  body: string;
  latency_ms: number;
}

export class HttpProbeError extends Error {
  constructor(
    message: string,
    public readonly latency_ms: number,
  ) {
    super(message);
    this.name = "HttpProbeError";
  }
}

/** Perform an HTTP GET and return status code + body. Throws HttpProbeError on network failure. */
export function httpGet(
  host: string,
  port: number,
  path: string,
  timeoutMs = DOWN_TIMEOUT_MS,
): Promise<HttpProbeResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const req = request(
      { hostname: host, port, path, method: "GET", timeout: timeoutMs },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        res.on("end", () => {
          resolve({
            status_code: res.statusCode ?? 0,
            body,
            latency_ms: Date.now() - start,
          });
        });
        res.on("error", (err: Error) => {
          reject(new HttpProbeError(err.message, Date.now() - start));
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new HttpProbeError(`Timeout after ${timeoutMs}ms`, Date.now() - start));
    });

    req.on("error", (err: Error) => {
      reject(new HttpProbeError(err.message, Date.now() - start));
    });

    req.end();
  });
}

/** Parse JSON body safely; returns null on failure. */
export function safeJson(body: string): Record<string, unknown> | null {
  try { return JSON.parse(body) as Record<string, unknown>; } catch { return null; }
}
