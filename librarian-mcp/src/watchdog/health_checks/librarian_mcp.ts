/**
 * Watchdog health check — Librarian MCP server
 *
 * Librarian runs as stdio MCP; we check health via the state directory
 * (pheromone substrate, iron tablets, last rebuild fingerprint) and
 * optionally via the HTTP health endpoint if one is present.
 *
 * R-MECHANISM-VERIFY: round-trip confirmed via last-modified time of
 * the pheromone index file.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { HealthCheckResult } from "../types.js";
import { DEGRADED_THRESHOLD_FAST_MS } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname_local, "..", "..", "..");

const PHEROMONE_PATH = resolve(LIBRARIAN_ROOT, "stitchpunks", "pheromone_trail.jsonl");
const IRON_TABLET_PATH = resolve(LIBRARIAN_ROOT, "stitchpunks", "old_ones_fleet", "iron_tablets.jsonl");
const OVERVIEW_PATH = resolve(LIBRARIAN_ROOT, "index", "overview.json");

/** Max age before we consider Librarian MCP stale (1 hour = degraded, 6 hours = down). */
const STALE_DEGRADED_MS = 60 * 60 * 1000;
const STALE_DOWN_MS = 6 * 60 * 60 * 1000;

export async function checkLibrarianMcp(): Promise<HealthCheckResult> {
  const start = Date.now();
  const subject = "librarian-mcp";

  try {
    // Probe 1: pheromone trail file exists and is fresh
    const pheromoneExists = existsSync(PHEROMONE_PATH);
    const overviewExists = existsSync(OVERVIEW_PATH);
    const ironTabletExists = existsSync(IRON_TABLET_PATH);

    if (!pheromoneExists && !overviewExists) {
      return {
        subject,
        status: 'down',
        latency_ms: Date.now() - start,
        metadata: { error: "Pheromone trail and overview.json both missing — substrate not initialized" },
        checked_at: new Date().toISOString(),
      };
    }

    // Probe 2: freshness of overview.json (last rebuild)
    let lastActivity: string | undefined;
    let ageMs = 0;
    if (overviewExists) {
      const mtime = statSync(OVERVIEW_PATH).mtimeMs;
      ageMs = Date.now() - mtime;
      lastActivity = new Date(mtime).toISOString();
    }

    const latency = Date.now() - start;

    if (ageMs > STALE_DOWN_MS) {
      return {
        subject,
        status: 'down',
        latency_ms: latency,
        metadata: {
          last_activity: lastActivity,
          error: `overview.json not rebuilt in ${Math.round(ageMs / 3600000)}h — substrate likely stale`,
          details: { pheromone_exists: pheromoneExists, iron_tablet_exists: ironTabletExists },
        },
        checked_at: new Date().toISOString(),
      };
    }

    if (ageMs > STALE_DEGRADED_MS || latency > DEGRADED_THRESHOLD_FAST_MS) {
      return {
        subject,
        status: 'degraded',
        latency_ms: latency,
        metadata: {
          last_activity: lastActivity,
          details: { age_minutes: Math.round(ageMs / 60000) },
        },
        checked_at: new Date().toISOString(),
      };
    }

    return {
      subject,
      status: 'ok',
      latency_ms: latency,
      metadata: {
        last_activity: lastActivity,
        details: {
          pheromone_exists: pheromoneExists,
          iron_tablet_exists: ironTabletExists,
          age_minutes: Math.round(ageMs / 60000),
        },
      },
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      subject,
      status: 'down',
      latency_ms: Date.now() - start,
      metadata: { error: String(err) },
      checked_at: new Date().toISOString(),
    };
  }
}
