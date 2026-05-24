/**
 * Watchdog health check — Knight-Bishop bridge MCP
 *
 * The Knight-Bishop bridge MCP connects Cursor (Knight) to Librarian (Bishop).
 * Health is inferred from the BISHOP_DROPZONE handoff file freshness
 * and the presence of the MCP config.
 *
 * R-MECHANISM-VERIFY: file presence + mtime round-trip.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { HealthCheckResult } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname_local, "..", "..", "..", "..");

const DROPZONE_PATH   = resolve(WORKSPACE_ROOT, "BISHOP_DROPZONE");
const MCP_CONFIG_PATH = resolve(homedir(), ".cursor", "mcp.json");

const STALE_DEGRADED_MS = 24 * 60 * 60 * 1000;  // 24 hours

export async function checkKnightBishopBridge(): Promise<HealthCheckResult> {
  const start = Date.now();
  const subject = "knight-bishop-bridge";

  const dropzoneExists = existsSync(DROPZONE_PATH);
  const mcpConfigExists = existsSync(MCP_CONFIG_PATH);

  if (!dropzoneExists) {
    return {
      subject,
      status: 'down',
      latency_ms: Date.now() - start,
      metadata: {
        error: "BISHOP_DROPZONE directory not found — bridge path broken",
        details: { mcp_config_exists: mcpConfigExists },
      },
      checked_at: new Date().toISOString(),
    };
  }

  // Check most recent file in BISHOP_DROPZONE/01_KnightPrompts for activity
  const promptsDir = resolve(DROPZONE_PATH, "01_KnightPrompts");
  let lastActivity: string | undefined;
  let ageMs = Infinity;

  if (existsSync(promptsDir)) {
    try {
      const mtime = statSync(promptsDir).mtimeMs;
      ageMs = Date.now() - mtime;
      lastActivity = new Date(mtime).toISOString();
    } catch { /* ignore */ }
  }

  const latency = Date.now() - start;

  if (ageMs > STALE_DEGRADED_MS) {
    return {
      subject,
      status: 'degraded',
      latency_ms: latency,
      metadata: {
        last_activity: lastActivity,
        error: `Dropzone not updated in ${Math.round(ageMs / 3600000)}h`,
        details: { mcp_config_exists: mcpConfigExists },
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
      details: { dropzone_exists: true, mcp_config_exists: mcpConfigExists },
    },
    checked_at: new Date().toISOString(),
  };
}
