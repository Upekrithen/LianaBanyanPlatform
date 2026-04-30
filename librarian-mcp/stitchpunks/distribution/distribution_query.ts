/**
 * distribution_query.ts — KN020/BP002
 *
 * MCP tool: query the distribution queue.
 * Answers: "What's queued for distribution? What's been fired today?"
 */

import * as fs from "fs";
import * as path from "path";

const RELAY_LOG_PATH = path.join(__dirname, "synaptic_relay_log.jsonl");
const TOKEN_STORE_PATH = path.join(__dirname, "distribution_token_store.jsonl");

interface RelayEntry {
  channel: string;
  submission_id: string;
  published_at: string;
  receipt_hash: number;
}

interface TokenEntry {
  token_id: string;
  channel: string;
  action: string;
  issued_at: number;
  expires_at: number;
  consumed: boolean;
  metadata: Record<string, unknown>;
}

function loadJsonl<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export function distributionQuery(
  mode: "fired_today" | "pending_tokens" | "all_fired" | "grid_status"
): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const relayLog = loadJsonl<RelayEntry>(RELAY_LOG_PATH);
  const tokenStore = loadJsonl<TokenEntry>(TOKEN_STORE_PATH);

  switch (mode) {
    case "fired_today": {
      const fired = relayLog.filter((e) => e.published_at.startsWith(today));
      return {
        mode,
        date: today,
        count: fired.length,
        grid_max: 24,
        grid_remaining: Math.max(0, 24 - fired.length),
        entries: fired,
      };
    }

    case "pending_tokens": {
      const now = Date.now() / 1000;
      const pending = tokenStore.filter(
        (t) => !t.consumed && t.expires_at > now
      );
      return {
        mode,
        pending_count: pending.length,
        tokens: pending.map((t) => ({
          token_id: t.token_id.slice(0, 8),
          channel: t.channel,
          action: t.action,
          expires_in_seconds: Math.round(t.expires_at - now),
        })),
      };
    }

    case "all_fired": {
      return {
        mode,
        total_fired: relayLog.length,
        entries: relayLog,
      };
    }

    case "grid_status": {
      const firedToday = relayLog.filter((e) =>
        e.published_at.startsWith(today)
      ).length;
      return {
        mode,
        date: today,
        fired_today: firedToday,
        grid_max_per_day: 24,
        grid_remaining: Math.max(0, 24 - firedToday),
        grid_limit_hit: firedToday >= 24,
        fire_control: "PUBLICATION GATE HARD — Founder approval required per publish action",
      };
    }

    default:
      return { error: `Unknown mode: ${mode}` };
  }
}
