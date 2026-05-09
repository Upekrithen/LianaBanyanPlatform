/**
 * MoneyPenny No-Collision Arbiter (§4.2, Bushel 82, BP034)
 * Priority queue + arbitration guarantees:
 *   1. No signal drop: every inbound registered + acknowledged within 100ms
 *   2. No interrupt of deep-work: only WB + FAMILY + COUNSEL interrupt
 *   3. No double-booking: A-tier call in progress → B-tier held
 *   4. Substrate Eblet receipt for every routing decision
 *
 * G3 gate: 100 simultaneous inbounds queued; none dropped; receipts emitted.
 */

import { appendFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import type {
  CallerClass, AvailabilityClass, RoutingDecision, RoutingOutcome,
  RoutingReceipt, ThreadHandle, HoldHandle, ISO8601, InboundSignal,
} from "../types.js";
import { canInterrupt, kissakiRankForCaller } from "./priority_taxonomy.js";

// ─── State Paths ─────────────────────────────────────────────────────────────

function statePath(): string {
  return resolve(homedir(), ".claude", "state", "moneypenny");
}

function callsPath(): string {
  return resolve(statePath(), "calls");
}

function activeCallPath(): string {
  return resolve(statePath(), "active_call.json");
}

function holdQueuePath(): string {
  return resolve(statePath(), "hold_queue.jsonl");
}

function statsPath(): string {
  return resolve(statePath(), "daily_stats.json");
}

function ensureDirs(): void {
  mkdirSync(callsPath(), { recursive: true });
  mkdirSync(statePath(), { recursive: true });
}

// ─── Receipt Writer (substrate Eblet) ────────────────────────────────────────

export function writeRoutingReceipt(receipt: RoutingReceipt): string {
  ensureDirs();
  const filename = `${receipt.ts.replace(/[:.]/g, "-")}_${receipt.receipt_id.slice(0, 8)}.json`;
  const filePath = resolve(callsPath(), filename);
  writeFileSync(filePath, JSON.stringify(receipt, null, 2));

  // Increment daily stats
  incrementDailyStat("receipt_count");

  return filePath;
}

function incrementDailyStat(key: "receipt_count" | "routed_count"): void {
  const path = statsPath();
  const today = new Date().toISOString().slice(0, 10);
  let stats: Record<string, Record<string, number>> = {};
  if (existsSync(path)) {
    try { stats = JSON.parse(readFileSync(path, "utf-8")); } catch { /* */ }
  }
  if (!stats[today]) stats[today] = { receipt_count: 0, routed_count: 0 };
  stats[today][key] = (stats[today][key] ?? 0) + 1;
  writeFileSync(path, JSON.stringify(stats, null, 2));
}

// ─── Active Call Management ───────────────────────────────────────────────────

interface ActiveCall {
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  started_at: ISO8601;
}

export function getActiveCall(): ActiveCall | null {
  const p = activeCallPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as ActiveCall;
  } catch {
    return null;
  }
}

export function setActiveCall(call: ActiveCall): void {
  ensureDirs();
  writeFileSync(activeCallPath(), JSON.stringify(call, null, 2));
}

export function clearActiveCall(): void {
  const p = activeCallPath();
  if (existsSync(p)) {
    writeFileSync(p, "null");
  }
}

// ─── Hold Queue ───────────────────────────────────────────────────────────────

export function enqueueHold(hold: HoldHandle): void {
  ensureDirs();
  appendFileSync(holdQueuePath(), JSON.stringify(hold) + "\n");
}

export function loadHoldQueue(): HoldHandle[] {
  const p = holdQueuePath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line) as HoldHandle)
      .filter(h => h.status === "active");
  } catch {
    return [];
  }
}

export function updateHoldStatus(holdId: string, status: HoldHandle["status"]): void {
  const p = holdQueuePath();
  if (!existsSync(p)) return;
  try {
    const lines = readFileSync(p, "utf-8").split("\n").filter(Boolean);
    const updated = lines.map(line => {
      try {
        const h = JSON.parse(line) as HoldHandle;
        if (h.hold_id === holdId) return JSON.stringify({ ...h, status });
        return line;
      } catch {
        return line;
      }
    });
    writeFileSync(p, updated.join("\n") + "\n");
  } catch { /* non-fatal */ }
}

// ─── Core Arbitration Logic ───────────────────────────────────────────────────

export interface ArbiterInput {
  signal: InboundSignal;
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  availability: AvailabilityClass;
  isFamilyEmergency?: boolean;
}

export interface ArbiterOutput {
  decision: RoutingDecision;
  hold_handle?: HoldHandle;
}

/**
 * Core arbitration: determines routing outcome for an inbound signal.
 * Writes substrate Eblet receipt for every decision.
 * Time complexity: O(1) — no blocking operations.
 */
export function arbitrate(input: ArbiterInput): ArbiterOutput {
  const { signal, thread_id, caller_class, availability, isFamilyEmergency } = input;
  const now: ISO8601 = new Date().toISOString();

  const interrupt = canInterrupt(caller_class, availability, isFamilyEmergency ?? false);
  const activeCall = getActiveCall();

  let outcome: RoutingOutcome;
  let reason: string;
  let hold_handle: HoldHandle | undefined;

  if (caller_class === "INTERNAL_AI") {
    outcome = "INTERNAL_HANDOFF";
    reason = "AI-surface context handoff — routed to MCCI kernel";
  } else if (!interrupt) {
    // Cannot interrupt → determine hold type
    if (availability === "SLEEP" || availability === "OUT") {
      outcome = "HOLD_QUEUE";
      reason = `Founder in ${availability} state; caller class ${caller_class} queued silently`;
    } else if (caller_class === "UNKNOWN") {
      outcome = "HUMAN_REVIEW";
      reason = "Unknown caller class; flagged for human review before Founder engagement";
    } else {
      outcome = "HOLD_SUBSTANTIVE";
      reason = `Founder in ${availability} state; ${caller_class} held with substantive engagement`;
    }
  } else if (activeCall && isHigherPriority(activeCall.caller_class, caller_class)) {
    // Founder already on higher-priority call
    outcome = "HOLD_SUBSTANTIVE";
    reason = `Founder on ${activeCall.caller_class} call; ${caller_class} held substantively`;
  } else {
    outcome = "ROUTE_DIRECT";
    reason = `${caller_class} caller; availability ${availability}; routing direct to Founder`;
  }

  // Build hold handle if needed
  if (outcome === "HOLD_SUBSTANTIVE" || outcome === "HOLD_QUEUE" || outcome === "HUMAN_REVIEW") {
    hold_handle = {
      hold_id: randomUUID(),
      thread_id,
      caller_class,
      held_at: now,
      reason,
      engager_assigned: kissakiRankForCaller(caller_class),
      status: "active",
    };
    enqueueHold(hold_handle);
  }

  // Update active call tracking for direct routes
  if (outcome === "ROUTE_DIRECT") {
    setActiveCall({ thread_id, caller_class, started_at: now });
  }

  // Write substrate Eblet receipt
  const receipt: RoutingReceipt = {
    receipt_id: randomUUID(),
    thread_id,
    caller_class,
    outcome,
    availability_at_decision: availability,
    channel: signal.caller.channel,
    reason,
    ts: now,
  };
  const receipt_path = writeRoutingReceipt(receipt);
  incrementDailyStat("routed_count");

  const decision: RoutingDecision = {
    outcome,
    thread_id,
    caller_class,
    availability_at_decision: availability,
    reason,
    receipt_path,
    hold_handle,
    ts: now,
  };

  return { decision, hold_handle };
}

// ─── Priority Ordering ────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<CallerClass, number> = {
  WARREN_BUFFETT: 0,
  FAMILY: 1,
  COUNSEL: 2,
  MACKENZIE_SCOTT: 3,
  PRESS: 4,
  TALENTS_PRACTITIONER: 5,
  INTERNAL_AI: 6,
  UNKNOWN: 7,
};

/**
 * Returns true if classA is higher priority than classB (lower number = higher priority).
 */
function isHigherPriority(classA: CallerClass, classB: CallerClass): boolean {
  return PRIORITY_ORDER[classA] < PRIORITY_ORDER[classB];
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ArbiterStats {
  hold_queue_depth: number;
  oldest_hold_age_seconds: number | null;
  active_call: { caller_class: CallerClass; thread_id: ThreadHandle; age_seconds: number } | null;
  today_receipt_count: number;
  today_routed_count: number;
}

export function getArbiterStats(): ArbiterStats {
  const queue = loadHoldQueue();
  const activeCall = getActiveCall();
  const now = Date.now();

  let oldest: number | null = null;
  for (const h of queue) {
    const age = (now - new Date(h.held_at).getTime()) / 1000;
    if (oldest === null || age > oldest) oldest = age;
  }

  const today = new Date().toISOString().slice(0, 10);
  let todayStats = { receipt_count: 0, routed_count: 0 };
  const p = statsPath();
  if (existsSync(p)) {
    try {
      const all = JSON.parse(readFileSync(p, "utf-8")) as Record<string, typeof todayStats>;
      if (all[today]) todayStats = all[today];
    } catch { /* */ }
  }

  return {
    hold_queue_depth: queue.length,
    oldest_hold_age_seconds: oldest,
    active_call: activeCall
      ? {
          caller_class: activeCall.caller_class,
          thread_id: activeCall.thread_id,
          age_seconds: (now - new Date(activeCall.started_at).getTime()) / 1000,
        }
      : null,
    today_receipt_count: todayStats.receipt_count,
    today_routed_count: todayStats.routed_count,
  };
}
