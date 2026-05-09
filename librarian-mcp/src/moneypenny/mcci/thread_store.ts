/**
 * MoneyPenny MCCI Thread Store (§5.1, Bushel 82, BP034)
 * Per-relationship-thread + per-topic-thread persistence.
 * Storage: JSONL at ~/.claude/state/mcci/ (compatible with substrate).
 * Also creates threads.jsonl as the B82-landed sentinel.
 *
 * G5 gate: thread persistence verified; retrieval <100ms; schema validates.
 */

import {
  appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import type { Thread, ThreadHandle, ThreadClass, ThreadState, ISO8601 } from "../types.js";

// ─── Paths ─────────────────────────────────────────────────────────────────────

export function mcciDir(): string {
  return resolve(homedir(), ".claude", "state", "mcci");
}

function indexPath(): string {
  return resolve(mcciDir(), "index.json");
}

function threadsJSONLPath(): string {
  // B82-landed sentinel — Drekaskip checks this path
  return resolve(mcciDir(), "threads.jsonl");
}

function threadFilePath(id: ThreadHandle): string {
  return resolve(mcciDir(), "threads", `${id}.json`);
}

function ensureDirs(): void {
  mkdirSync(resolve(mcciDir(), "threads"), { recursive: true });
}

// ─── Index ────────────────────────────────────────────────────────────────────

interface ThreadIndex {
  by_participant: Record<string, ThreadHandle[]>;   // participant_id → thread IDs
  by_class: Record<ThreadClass, ThreadHandle[]>;
  total: number;
  last_updated: ISO8601;
}

function loadIndex(): ThreadIndex {
  const p = indexPath();
  if (!existsSync(p)) {
    return {
      by_participant: {},
      by_class: { relationship: [], topic: [], project: [], session: [] },
      total: 0,
      last_updated: new Date().toISOString(),
    };
  }
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as ThreadIndex;
  } catch {
    return {
      by_participant: {},
      by_class: { relationship: [], topic: [], project: [], session: [] },
      total: 0,
      last_updated: new Date().toISOString(),
    };
  }
}

function saveIndex(index: ThreadIndex): void {
  ensureDirs();
  writeFileSync(indexPath(), JSON.stringify(index, null, 2));
}

function addToIndex(thread: Thread): void {
  const idx = loadIndex();
  for (const participant of thread.participants) {
    if (!idx.by_participant[participant]) idx.by_participant[participant] = [];
    if (!idx.by_participant[participant].includes(thread.id)) {
      idx.by_participant[participant].push(thread.id);
    }
  }
  if (!idx.by_class[thread.class].includes(thread.id)) {
    idx.by_class[thread.class].push(thread.id);
  }
  idx.total += 1;
  idx.last_updated = new Date().toISOString();
  saveIndex(idx);
}

// ─── Thread CRUD ──────────────────────────────────────────────────────────────

export function createThread(
  participants: string[],
  threadClass: ThreadClass,
  initialContent = "",
): Thread {
  ensureDirs();
  const now: ISO8601 = new Date().toISOString();
  const thread: Thread = {
    id: randomUUID(),
    class: threadClass,
    participants,
    state: "active",
    context: {
      full: initialContent,
      compressed_3k: "",
      summary_version: 0,
      last_compression_at: now,
    },
    metadata: {
      created_at: now,
      last_active: now,
      related_threads: [],
      canon_refs: [],
    },
  };

  writeFileSync(threadFilePath(thread.id), JSON.stringify(thread, null, 2));
  addToIndex(thread);

  // Append to JSONL sentinel (B82-landed signal)
  appendFileSync(
    threadsJSONLPath(),
    JSON.stringify({ id: thread.id, class: threadClass, ts: now }) + "\n",
  );

  return thread;
}

export function loadThread(id: ThreadHandle): Thread | null {
  const p = threadFilePath(id);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as Thread;
  } catch {
    return null;
  }
}

export function saveThread(thread: Thread): void {
  ensureDirs();
  writeFileSync(threadFilePath(thread.id), JSON.stringify(thread, null, 2));
}

export function appendToThread(id: ThreadHandle, content: string): Thread | null {
  const thread = loadThread(id);
  if (!thread) return null;

  const now: ISO8601 = new Date().toISOString();
  thread.context.full += `\n[${now}] ${content}`;
  thread.metadata.last_active = now;
  thread.state = "active";

  saveThread(thread);
  return thread;
}

export function updateThreadState(id: ThreadHandle, state: ThreadState): void {
  const thread = loadThread(id);
  if (!thread) return;
  thread.state = state;
  thread.metadata.last_active = new Date().toISOString();
  saveThread(thread);
}

export function updateThreadCompressed3k(
  id: ThreadHandle,
  compressed: string,
): void {
  const thread = loadThread(id);
  if (!thread) return;
  const now: ISO8601 = new Date().toISOString();
  thread.context.compressed_3k = compressed;
  thread.context.summary_version += 1;
  thread.context.last_compression_at = now;
  saveThread(thread);
}

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

export function findThreadsByParticipant(participantId: string): Thread[] {
  const idx = loadIndex();
  const ids = idx.by_participant[participantId] ?? [];
  return ids
    .map(id => loadThread(id))
    .filter((t): t is Thread => t !== null);
}

export function findThreadsByClass(threadClass: ThreadClass): Thread[] {
  const idx = loadIndex();
  const ids = idx.by_class[threadClass] ?? [];
  return ids
    .map(id => loadThread(id))
    .filter((t): t is Thread => t !== null);
}

export function getActiveThreadCount(): number {
  const idx = loadIndex();
  return Object.values(idx.by_class).flat().length;
}

export function getDormantThreadCount(): number {
  const idx = loadIndex();
  const allIds = Object.values(idx.by_class).flat();
  let count = 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const id of allIds) {
    const thread = loadThread(id);
    if (thread && new Date(thread.metadata.last_active).getTime() < thirtyDaysAgo) {
      count++;
    }
  }
  return count;
}

/**
 * Get or create a thread for a given participant.
 * Creates a new relationship-class thread if none exists.
 */
export async function getOrCreateThread(
  participantId: string,
  threadClass: ThreadClass = "relationship",
): Promise<Thread> {
  const existing = findThreadsByParticipant(participantId);
  const activeThread = existing.find(t => t.state === "active" && t.class === threadClass);
  if (activeThread) return activeThread;

  return createThread([participantId], threadClass);
}

/**
 * Get the N most recent messages from a thread's full log.
 */
export function getRecentMessages(thread: Thread, n: number): string[] {
  const lines = thread.context.full.split("\n").filter(Boolean);
  return lines.slice(-n);
}
