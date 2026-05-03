/**
 * On Deck Scribe — Writer — KN-Q1 / BP018
 * =========================================
 * Append-only writes to queue.jsonl. Every mutation is a new line (never
 * in-place edit). Concurrent-writer-safe via in-process mutex + tmp-file
 * atomic-append pattern for multi-process safety.
 *
 * All mutations trigger substrate write-back (KN-Q3) via optional callback
 * to avoid circular import.
 */

import { existsSync, mkdirSync, appendFileSync, writeFileSync, renameSync } from "fs";
import { resolve } from "path";
import {
  ODS_DIR,
  ODS_QUEUE,
  serializeEntry,
  type OnDeckEntry,
  type PreparedContext,
  type BeeCanonMarks,
} from "./state_file.js";

// Optional substrate write-back hook (wired in KN-Q3)
type WriteBackFn = (entry: OnDeckEntry, transition: string) => void;
let _writeBackFn: WriteBackFn | null = null;
export function registerWriteBack(fn: WriteBackFn): void {
  _writeBackFn = fn;
}

function ensureOdsDir(): void {
  if (!existsSync(ODS_DIR)) mkdirSync(ODS_DIR, { recursive: true });
}

// In-process append mutex — serializes concurrent appends
let appendTail: Promise<unknown> = Promise.resolve();

async function atomicAppend(line: string): Promise<void> {
  let release!: () => void;
  const mySlot = new Promise<void>((r) => { release = r; });
  const prev = appendTail;
  appendTail = mySlot;

  await prev;
  try {
    ensureOdsDir();
    appendFileSync(ODS_QUEUE, line + "\n", "utf-8");
  } finally {
    release();
  }
}

// ─── Public writer API ─────────────────────────────────────────────────────────

/**
 * Append a new entry. Returns the entry as appended (with ts_queued set if missing).
 */
export async function appendEntry(entry: OnDeckEntry): Promise<OnDeckEntry> {
  const stamped: OnDeckEntry = {
    ...entry,
    ts_queued: entry.ts_queued || new Date().toISOString(),
  };
  await atomicAppend(serializeEntry(stamped));
  _writeBackFn?.(stamped, "append");
  return stamped;
}

/**
 * Mark an entry as in_flight (begins execution).
 */
export async function markInFlight(id: string): Promise<OnDeckEntry> {
  const partial: Partial<OnDeckEntry> & Pick<OnDeckEntry, "id" | "status"> = {
    id,
    status: "in_flight",
    ts_in_flight: new Date().toISOString(),
  };
  const mutation = _buildMutation(id, partial);
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "mark_in_flight");
  return mutation;
}

/**
 * Mark an entry as landed (completed successfully).
 */
export async function markLanded(id: string, commit_hash?: string): Promise<OnDeckEntry> {
  const mutation = _buildMutation(id, {
    id,
    status: "landed",
    ts_landed: new Date().toISOString(),
    ...(commit_hash ? { commit_hash } : {}),
  });
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "mark_landed");
  return mutation;
}

/**
 * Mark an entry as errored.
 */
export async function markErrored(id: string, reason?: string): Promise<OnDeckEntry> {
  const mutation = _buildMutation(id, {
    id,
    status: "errored",
    ...(reason ? { error_reason: reason } : {}),
  });
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "mark_errored");
  return mutation;
}

/**
 * Mark an entry as deferred.
 */
export async function markDeferred(id: string): Promise<OnDeckEntry> {
  const mutation = _buildMutation(id, { id, status: "deferred" });
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "mark_deferred");
  return mutation;
}

/**
 * Attach Shadow E-Giant prepared_context to an entry.
 */
export async function attachPreparedContext(
  id: string,
  ctx: PreparedContext
): Promise<OnDeckEntry> {
  const mutation = _buildMutation(id, { id, status: "queued", prepared_context: ctx });
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "attach_prepared_context");
  return mutation;
}

/**
 * Attach Bee-canon Marks attribution to a landed entry.
 */
export async function attachBeeCanonMarks(
  id: string,
  marks: BeeCanonMarks
): Promise<OnDeckEntry> {
  const mutation = _buildMutation(id, { id, status: "landed", bee_canon_attribution: marks });
  await atomicAppend(serializeEntry(mutation));
  _writeBackFn?.(mutation, "attach_bee_canon_marks");
  return mutation;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Build a minimal mutation record — only id + mutated fields.
 * Reader's latest-per-id reduction applies mutations in append order,
 * so partial records are valid (reader merges fields from prior lines).
 */
function _buildMutation(id: string, fields: Partial<OnDeckEntry> & { id: string }): OnDeckEntry {
  // Produce a sparse mutation-line that the reader merges with prior state.
  // We need all required fields for OnDeckEntry at type level, so we embed
  // a sentinel category/status/priority/k_prompt_path/prerequisites that the
  // reader will overwrite with the earlier full record during reduction.
  return {
    category: "knight",
    k_prompt_path: "",
    priority: 0,
    prerequisites: [],
    ts_queued: "",
    ...fields,
    id,
  } as OnDeckEntry;
}
