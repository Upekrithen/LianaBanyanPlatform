/**
 * Watchdog health check — Hearth Ollama backend (B69)
 *
 * Hearth wraps Ollama local inference (default port 11434).
 * R-MECHANISM-VERIFY: round-trip via GET /api/tags (Ollama native endpoint).
 */

import type { HealthCheckResult } from "../types.js";
import { DEGRADED_THRESHOLD_SLOW_MS } from "../types.js";
import { httpGet, HttpProbeError, safeJson } from "./http_probe.js";

const HOST = "127.0.0.1";
const PORT = parseInt(process.env.OLLAMA_PORT ?? "11434", 10);

export async function checkHearth(): Promise<HealthCheckResult> {
  const subject = "hearth";
  try {
    const probe = await httpGet(HOST, PORT, "/api/tags");

    if (probe.status_code !== 200) {
      return {
        subject,
        status: 'degraded',
        latency_ms: probe.latency_ms,
        metadata: { error: `HTTP ${probe.status_code}` },
        checked_at: new Date().toISOString(),
      };
    }

    const parsed = safeJson(probe.body);
    const models = Array.isArray((parsed as { models?: unknown[] } | null)?.models)
      ? (parsed as { models: unknown[] }).models.length
      : 0;
    const status = probe.latency_ms > DEGRADED_THRESHOLD_SLOW_MS ? 'degraded' : 'ok';

    return {
      subject,
      status,
      latency_ms: probe.latency_ms,
      metadata: {
        details: { ollama_models_loaded: models },
      },
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    const latency = err instanceof HttpProbeError ? err.latency_ms : 0;
    return {
      subject,
      status: 'down',
      latency_ms: latency,
      metadata: { error: `Hearth/Ollama not reachable: ${String(err)}` },
      checked_at: new Date().toISOString(),
    };
  }
}
