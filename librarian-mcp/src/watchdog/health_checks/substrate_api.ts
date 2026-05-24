/**
 * Watchdog health check — Substrate API server :11480
 * (AMPLIFY Computer electron daemon — amplify-computer/src/main/substrate_api.ts)
 *
 * R-MECHANISM-VERIFY: round-trip via GET /healthz
 */

import type { HealthCheckResult } from "../types.js";
import { DEGRADED_THRESHOLD_FAST_MS } from "../types.js";
import { httpGet, HttpProbeError, safeJson } from "./http_probe.js";

const HOST = "127.0.0.1";
const PORT = parseInt(process.env.SUBSTRATE_API_PORT ?? "11480", 10);

export async function checkSubstrateApi(): Promise<HealthCheckResult> {
  const subject = "substrate-api";
  try {
    const probe = await httpGet(HOST, PORT, "/healthz");

    if (probe.status_code !== 200) {
      return {
        subject,
        status: 'degraded',
        latency_ms: probe.latency_ms,
        metadata: {
          error: `Substrate API HTTP ${probe.status_code}`,
          details: { body: probe.body.slice(0, 200) },
        },
        checked_at: new Date().toISOString(),
      };
    }

    const parsed = safeJson(probe.body);
    const status = probe.latency_ms > DEGRADED_THRESHOLD_FAST_MS ? 'degraded' : 'ok';

    return {
      subject,
      status,
      latency_ms: probe.latency_ms,
      metadata: {
        version: (parsed as { version?: string } | null)?.version,
        details: parsed ?? {},
      },
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    const latency = err instanceof HttpProbeError ? err.latency_ms : 0;
    return {
      subject,
      status: 'down',
      latency_ms: latency,
      metadata: { error: `Substrate API :${PORT} not reachable — AMPLIFY daemon may be stopped. ${String(err)}` },
      checked_at: new Date().toISOString(),
    };
  }
}
