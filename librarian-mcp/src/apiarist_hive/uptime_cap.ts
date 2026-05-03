/**
 * Apiarist Hive 50%-Uptime Cap — KN-D5 / BP018 Pod D
 * ====================================================
 * Parallels the Shadow Alternating Cylinder Fire (Pod-G) 50%-uptime discipline.
 * Each Hive participant may not occupy any single role for more than 50% of
 * the cycle period (configurable; default 60 minutes).
 *
 * Per-role independent caps:
 *   Worker ≤50% + Drone ≤50% + Queen ≤50% are independent.
 *   (A participant could theoretically be 50% worker AND 50% drone in same cycle —
 *    but that would be 100% total, which is intentional: each ROLE is independently capped.)
 *
 * Race condition safe: all operations are synchronous in Node.js event loop.
 *
 * Composes with:
 *   Pod-G alternating cylinder fire (Shadow uptime + Hive uptime are independent)
 *   KN-D2 thread_state.ts (role assignments)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { BeeRole } from "./thread_state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_uc = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_uc, "../../stitchpunks");
const HIVE_DIR = resolve(STITCHPUNKS_DIR, "apiarist_hive");
const UPTIME_STATE_FILE = resolve(HIVE_DIR, "uptime_cap_state.json");

export const DEFAULT_CYCLE_PERIOD_MIN = 60;
export const DEFAULT_CAP_PCT = 50.0;

function ensureDir(): void {
  if (!existsSync(HIVE_DIR)) mkdirSync(HIVE_DIR, { recursive: true });
}

// ─── State management ─────────────────────────────────────────────────────────

interface CycleEntry {
  participant_id: string;
  role: BeeRole;
  cycle_start_ts: string;    // ISO-8601; cycle resets when now > cycle_start + period
  used_min: number;          // minutes used in this role in current cycle
}

type UptimeState = CycleEntry[];

function loadState(): UptimeState {
  if (!existsSync(UPTIME_STATE_FILE)) return [];
  try {
    return JSON.parse(readFileSync(UPTIME_STATE_FILE, "utf-8")) as UptimeState;
  } catch {
    return [];
  }
}

function saveState(state: UptimeState): void {
  ensureDir();
  writeFileSync(UPTIME_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function isCycleExpired(entry: CycleEntry, cycle_period_min: number): boolean {
  const cycleStart = new Date(entry.cycle_start_ts).getTime();
  const cycleEnd = cycleStart + cycle_period_min * 60 * 1000;
  return Date.now() >= cycleEnd;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface EnforcementResult {
  allowed: boolean;
  participant_id: string;
  role: BeeRole;
  used_min_before: number;
  attempted_min: number;
  cycle_period_min: number;
  cap_pct: number;
  reason?: string;
}

/**
 * Check and enforce the 50%-uptime cap for a participant+role attempt.
 * If allowed, record the duration.
 */
export function enforceCap(
  participant_id: string,
  role: BeeRole,
  attemptedDurationMin: number,
  opts: { cap_pct?: number; cycle_period_min?: number } = {}
): EnforcementResult {
  const cap_pct = opts.cap_pct ?? DEFAULT_CAP_PCT;
  const cycle_period_min = opts.cycle_period_min ?? DEFAULT_CYCLE_PERIOD_MIN;
  const cap_min = (cap_pct / 100) * cycle_period_min;

  let state = loadState();

  // Find or create entry for this participant + role
  let entryIdx = state.findIndex(
    (e) => e.participant_id === participant_id && e.role === role
  );

  let entry: CycleEntry;
  if (entryIdx === -1 || isCycleExpired(state[entryIdx], cycle_period_min)) {
    // New cycle
    entry = {
      participant_id,
      role,
      cycle_start_ts: new Date().toISOString(),
      used_min: 0,
    };
    if (entryIdx === -1) {
      state.push(entry);
      entryIdx = state.length - 1;
    } else {
      state[entryIdx] = entry;
    }
  } else {
    entry = state[entryIdx];
  }

  const used_before = entry.used_min;
  const projected = used_before + attemptedDurationMin;

  if (projected > cap_min) {
    saveState(state);
    return {
      allowed: false,
      participant_id,
      role,
      used_min_before: used_before,
      attempted_min: attemptedDurationMin,
      cycle_period_min,
      cap_pct,
      reason: `Cap exceeded: ${used_before.toFixed(1)} + ${attemptedDurationMin} = ${projected.toFixed(1)} min > ${cap_min} min (${cap_pct}% of ${cycle_period_min} min cycle).`,
    };
  }

  // Allow and record
  state[entryIdx] = { ...entry, used_min: projected };
  saveState(state);

  return {
    allowed: true,
    participant_id,
    role,
    used_min_before: used_before,
    attempted_min: attemptedDurationMin,
    cycle_period_min,
    cap_pct,
  };
}

/**
 * Manually reset cycle for a participant+role (for testing or cycle boundary).
 */
export function resetCycle(participant_id: string, role: BeeRole): void {
  const state = loadState().filter(
    (e) => !(e.participant_id === participant_id && e.role === role)
  );
  saveState(state);
}

/** Get current usage for a participant+role in current cycle. */
export function getUsage(
  participant_id: string,
  role: BeeRole,
  cycle_period_min: number = DEFAULT_CYCLE_PERIOD_MIN
): number {
  const state = loadState();
  const entry = state.find((e) => e.participant_id === participant_id && e.role === role);
  if (!entry || isCycleExpired(entry, cycle_period_min)) return 0;
  return entry.used_min;
}
