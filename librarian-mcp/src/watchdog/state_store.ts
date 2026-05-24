/**
 * Watchdog Knight — Health State Store (G3 gate)
 *
 * Persists health state to:
 *   ~/.claude/state/watchdog/state.json       — current health snapshot
 *   ~/.claude/state/watchdog/history.jsonl    — append-only event log
 *   ~/.claude/state/watchdog/heartbeat.txt    — G6: heartbeat written every poll cycle
 *
 * Survives daemon restart: state restorable from disk.
 */

import {
  readFileSync, writeFileSync, appendFileSync,
  existsSync, mkdirSync,
} from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { WatchdogState, HealthCheckResult, HealthEvent } from "./types.js";

// ─── Paths ────────────────────────────────────────────────────────────────────

function watchdogDir(): string {
  return resolve(homedir(), ".claude", "state", "watchdog");
}

export function statePath(): string  { return resolve(watchdogDir(), "state.json"); }
export function historyPath(): string { return resolve(watchdogDir(), "history.jsonl"); }
export function heartbeatPath(): string { return resolve(watchdogDir(), "heartbeat.txt"); }

function ensureDir(): void {
  mkdirSync(watchdogDir(), { recursive: true });
}

// ─── State ────────────────────────────────────────────────────────────────────

const EMPTY_STATE: WatchdogState = {
  subjects: {},
  last_poll_at: new Date(0).toISOString(),
  daemon_start: new Date().toISOString(),
  poll_count: 0,
};

export function loadState(): WatchdogState {
  const p = statePath();
  if (!existsSync(p)) return { ...EMPTY_STATE, daemon_start: new Date().toISOString() };
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as WatchdogState;
  } catch {
    return { ...EMPTY_STATE, daemon_start: new Date().toISOString() };
  }
}

export function saveState(state: WatchdogState): void {
  ensureDir();
  writeFileSync(statePath(), JSON.stringify(state, null, 2), "utf-8");
}

export function updateSubjectResult(
  state: WatchdogState,
  result: HealthCheckResult,
): WatchdogState {
  return {
    ...state,
    subjects: { ...state.subjects, [result.subject]: result },
    last_poll_at: new Date().toISOString(),
  };
}

// ─── History ─────────────────────────────────────────────────────────────────

export function appendHistory(event: HealthEvent): void {
  ensureDir();
  appendFileSync(historyPath(), JSON.stringify(event) + "\n", "utf-8");
}

export function readHistory(maxLines = 500): HealthEvent[] {
  const p = historyPath();
  if (!existsSync(p)) return [];
  try {
    const lines = readFileSync(p, "utf-8").split("\n").filter(Boolean);
    const tail = lines.slice(-maxLines);
    return tail.map(l => JSON.parse(l) as HealthEvent);
  } catch {
    return [];
  }
}

export function readHistorySince(sinceISO: string): HealthEvent[] {
  const p = historyPath();
  if (!existsSync(p)) return [];
  try {
    const cutoff = new Date(sinceISO).getTime();
    const lines = readFileSync(p, "utf-8").split("\n").filter(Boolean);
    return lines
      .map(l => JSON.parse(l) as HealthEvent)
      .filter(e => new Date(e.ts).getTime() >= cutoff);
  } catch {
    return [];
  }
}

// ─── Heartbeat (G6) ──────────────────────────────────────────────────────────

export function writeHeartbeat(pollCount: number): void {
  ensureDir();
  writeFileSync(
    heartbeatPath(),
    JSON.stringify({ ts: new Date().toISOString(), poll_count: pollCount }),
    "utf-8",
  );
}

export function readHeartbeat(): { ts: string; poll_count: number } | null {
  const p = heartbeatPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as { ts: string; poll_count: number };
  } catch {
    return null;
  }
}

/** G6: returns true if the heartbeat is older than maxAgeMs (daemon appears stuck). */
export function heartbeatStale(maxAgeMs: number): boolean {
  const hb = readHeartbeat();
  if (!hb) return true;
  return Date.now() - new Date(hb.ts).getTime() > maxAgeMs;
}
