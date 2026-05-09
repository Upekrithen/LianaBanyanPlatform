/**
 * MoneyPenny Thread Resurrection (§5.4, Bushel 82, BP034)
 * The "don't worry about context anymore" primitive.
 * When a dormant thread re-activates after weeks/months:
 *   → warm-reopen packet lets anyone continue as if no time passed.
 *
 * G8 gate: dormant thread (>30 days) resurrection produces warm-reopen packet <2s;
 * days-dormant correctly computed; suggested-open in caller-class-appropriate tone.
 */

import type {
  ContextPacket, Thread, ThreadHandle, InboundSignal, ISO8601, CallerClass,
} from "../types.js";
import { loadThread, getRecentMessages, appendToThread, updateThreadState } from "./thread_store.js";
import { compress_to_3k } from "./compression_3k.js";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

// ─── Days Dormant Calculator ──────────────────────────────────────────────────

export function daysSince(timestamp: ISO8601): number {
  const ms = Date.now() - new Date(timestamp).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

// ─── Canon Ref Loader ─────────────────────────────────────────────────────────

function loadCanonRefs(refs: string[]): string[] {
  // Return refs as-is; full resolution from Librarian substrate deferred to v2
  return refs.map(ref => `${ref} [canon anchor]`);
}

// ─── Caller Class Inference ───────────────────────────────────────────────────

function inferCallerClass(thread: Thread): CallerClass {
  // Try to infer from thread content
  const fullLog = thread.context.full + thread.context.compressed_3k;
  const callerClassMatch = fullLog.match(
    /caller.class[:\s]+([A-Z_]+)/i,
  );
  if (callerClassMatch) {
    return callerClassMatch[1] as CallerClass;
  }
  return "UNKNOWN";
}

// ─── Warm-Reopen Synthesis ────────────────────────────────────────────────────

type WarmReopenTone =
  | "executive"     // WB, MS class
  | "personal"      // FAMILY
  | "professional"  // COUNSEL, PRESS, TALENTS
  | "neutral"       // UNKNOWN, INTERNAL_AI
  ;

function getTone(callerClass: CallerClass): WarmReopenTone {
  switch (callerClass) {
    case "WARREN_BUFFETT":
    case "MACKENZIE_SCOTT":
      return "executive";
    case "FAMILY":
      return "personal";
    case "COUNSEL":
    case "PRESS":
    case "TALENTS_PRACTITIONER":
      return "professional";
    default:
      return "neutral";
  }
}

function buildWarmReopen(thread: Thread, newSignal?: InboundSignal): string {
  const callerClass = inferCallerClass(thread);
  const tone = getTone(callerClass);
  const dormantDays = daysSince(thread.metadata.last_active);

  const context = thread.context.compressed_3k || thread.context.full.slice(-500);
  const signalText = newSignal?.signal ?? "";

  const openers: Record<WarmReopenTone, string> = {
    executive: `Welcome back. It's been ${dormantDays} day${dormantDays !== 1 ? "s" : ""} since we last spoke.`,
    personal: `Hey! Good to hear from you again after ${dormantDays} day${dormantDays !== 1 ? "s" : ""}.`,
    professional: `Good to reconnect. Our last exchange was ${dormantDays} day${dormantDays !== 1 ? "s" : ""} ago.`,
    neutral: `Resuming thread from ${dormantDays} day${dormantDays !== 1 ? "s" : ""} ago.`,
  };

  const opener = openers[tone];

  const recap = context.length > 50
    ? `\n\nWhere we left off: ${context.slice(0, 300)}${context.length > 300 ? "..." : ""}`
    : "";

  const response = signalText.length > 0
    ? `\n\nYou're reaching out about: "${signalText.slice(0, 100)}${signalText.length > 100 ? "..." : ""}"`
    : "";

  return `${opener}${recap}${response}`;
}

// ─── Main Resurrection Entry Point ───────────────────────────────────────────

/**
 * Resurrect a dormant thread when a new signal arrives.
 * Returns a ContextPacket — the warm-reopen packet.
 * This is the "magic" that eliminates re-introduction overhead.
 */
export async function resurrect_thread(
  thread_id: ThreadHandle,
  new_signal?: InboundSignal,
): Promise<ContextPacket> {
  const thread = loadThread(thread_id);
  if (!thread) {
    throw new Error(`Thread ${thread_id} not found — cannot resurrect`);
  }

  // Ensure compressed context is fresh (or compress now)
  let compressed_3k = thread.context.compressed_3k;
  if (!compressed_3k || compressed_3k.length < 50) {
    compressed_3k = await compress_to_3k(thread);
  }

  const recentMessages = getRecentMessages(thread, 3);
  const dormantDays = daysSince(thread.metadata.last_active);
  const canonRefsLoaded = loadCanonRefs(thread.metadata.canon_refs);
  const suggestedOpen = buildWarmReopen(thread, new_signal);

  // Reactivate the thread
  if (thread.state === "dormant") {
    updateThreadState(thread_id, "active");
    if (new_signal) {
      appendToThread(
        thread_id,
        `[RESURRECTION] New signal after ${dormantDays}d dormancy: ${new_signal.signal}`,
      );
    }
  }

  return {
    thread_id,
    compressed_3k,
    last_3_full_messages: recentMessages,
    days_dormant: dormantDays,
    new_signal,
    suggested_open: suggestedOpen,
    canon_refs_loaded: canonRefsLoaded,
  };
}

/**
 * Mark threads dormant if they haven't been active in N days.
 * Called by a periodic maintenance pass (optional cron).
 */
export function markDormantThreads(dormancyThresholdDays = 30): number {
  const threadsDir = resolve(homedir(), ".claude", "state", "mcci", "threads");
  if (!existsSync(threadsDir)) return 0;

  let marked = 0;
  const threshold = Date.now() - dormancyThresholdDays * 24 * 60 * 60 * 1000;

  try {
    const files = readdirSync(threadsDir).filter(f => f.endsWith(".json"));
    for (const file of files) {
      const id = file.replace(".json", "");
      const thread = loadThread(id);
      if (
        thread &&
        thread.state === "active" &&
        new Date(thread.metadata.last_active).getTime() < threshold
      ) {
        updateThreadState(id, "dormant");
        marked++;
      }
    }
  } catch { /* non-fatal */ }

  return marked;
}

export function getDormantThreads(dormancyDays = 30): Thread[] {
  const threadsDir = resolve(homedir(), ".claude", "state", "mcci", "threads");
  if (!existsSync(threadsDir)) return [];

  const result: Thread[] = [];
  const threshold = Date.now() - dormancyDays * 24 * 60 * 60 * 1000;

  try {
    const files = readdirSync(threadsDir).filter(f => f.endsWith(".json"));
    for (const file of files) {
      const id = file.replace(".json", "");
      const thread = loadThread(id);
      if (thread && new Date(thread.metadata.last_active).getTime() < threshold) {
        result.push(thread);
      }
    }
  } catch { /* non-fatal */ }

  return result;
}
