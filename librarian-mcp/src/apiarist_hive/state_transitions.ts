/**
 * Apiarist Hive State Transitions Ledger — KN-D2 / BP018 Pod D
 * ==============================================================
 * Persistent append-only JSONL ledger of Hive thread state changes.
 * Supabase RLS enforced via migration (see platform/supabase/migrations/).
 * Local file-based backing for test isolation.
 */

import { existsSync, appendFileSync, readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import type { HiveThread, HiveThreadState, BeeRoles } from "./thread_state.js";
import { transitionState, validateRoleAssignments } from "./thread_state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_hs = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_hs, "../../stitchpunks");
const HIVE_DIR = resolve(STITCHPUNKS_DIR, "apiarist_hive");
const THREADS_LEDGER = resolve(HIVE_DIR, "threads.jsonl");

let _serialCounter = 0;
// Per-process salt prevents ID collisions when test files run concurrently
const _processSalt = randomBytes(3).toString("hex");

function ensureDir(): void {
  if (!existsSync(HIVE_DIR)) mkdirSync(HIVE_DIR, { recursive: true });
}

function appendThreadEntry(thread: HiveThread): void {
  ensureDir();
  appendFileSync(THREADS_LEDGER, JSON.stringify(thread) + "\n", "utf-8");
}

function readAllEntries(): HiveThread[] {
  if (!existsSync(THREADS_LEDGER)) return [];
  try {
    return readFileSync(THREADS_LEDGER, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as HiveThread);
  } catch {
    return [];
  }
}

function latestPerThread(): Map<string, HiveThread> {
  const all = readAllEntries();
  const map = new Map<string, HiveThread>();
  for (const t of all) map.set(t.id, t);
  return map;
}

function nextSerial(): string {
  _serialCounter += 1;
  return `LB-HIVE-${_processSalt}-${String(_serialCounter).padStart(4, "0")}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface CreateThreadParams {
  topic: string;
  participants: string[];
  bee_role_assignments: BeeRoles;
  cohort_class?: string;
}

export interface CreateThreadResult {
  success: boolean;
  thread?: HiveThread;
  error?: string;
}

/** Create a new Hive thread in `open` state. */
export function createHiveThread(params: CreateThreadParams): CreateThreadResult {
  const validation = validateRoleAssignments(params.participants, params.bee_role_assignments);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join("; ") };
  }

  const thread: HiveThread = {
    id: nextSerial(),
    topic: params.topic,
    state: "open",
    participants: params.participants,
    bee_role_assignments: params.bee_role_assignments,
    cohort_class: params.cohort_class,
    cross_frame_pointers: [],
    ts_opened: new Date().toISOString(),
  };

  appendThreadEntry(thread);
  return { success: true, thread };
}

export interface AdvanceThreadResult {
  success: boolean;
  thread?: HiveThread;
  error?: string;
  bridle_flag?: string;
}

/** Advance thread to the next state (guarded by VALID_TRANSITIONS). */
export function advanceHiveThread(
  thread_id: string,
  target: HiveThreadState,
  opts: { synthesis_target?: string } = {}
): AdvanceThreadResult {
  const current = latestPerThread().get(thread_id);
  if (!current) {
    return { success: false, error: `Thread ${thread_id} not found.` };
  }

  let threadToTransition = current;
  if (opts.synthesis_target) {
    threadToTransition = { ...current, synthesis_target: opts.synthesis_target };
  }

  const result = transitionState(threadToTransition, target);
  if (!result.success) {
    return { success: false, error: result.error, bridle_flag: result.bridle_flag };
  }

  appendThreadEntry(result.thread!);
  return { success: true, thread: result.thread };
}

/** Read the current state of a Hive thread. */
export function readHiveThread(thread_id: string): HiveThread | null {
  return latestPerThread().get(thread_id) ?? null;
}

/** List all threads (optionally filter by state). */
export function listHiveThreads(filter_state?: HiveThreadState): HiveThread[] {
  const map = latestPerThread();
  const all = Array.from(map.values());
  return filter_state ? all.filter((t) => t.state === filter_state) : all;
}
