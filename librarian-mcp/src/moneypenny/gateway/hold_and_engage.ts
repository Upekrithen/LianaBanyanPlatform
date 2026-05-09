/**
 * MoneyPenny Hold-and-Engage Orchestration (§4.3, Bushel 82, BP034)
 * When a B-tier caller is held while Founder finishes A-tier conversation:
 *   1. Dispatch Substantive Engager
 *   2. Load caller history + 3K-summary + canon Eblets
 *   3. Engage in substantive interim conversation (not "please hold")
 *   4. When Founder available → produce transition packet
 *   5. Founder absorbs in <60 seconds; picks up seamlessly
 *
 * G4 gate: substantive engagement verified; transition packet delivered.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import type {
  HoldHandle, TransitionPacket, ThreadHandle, ISO8601, CallerClass,
} from "../types.js";
import { kissakiRankForCaller } from "./priority_taxonomy.js";
import { updateHoldStatus } from "./no_collision_arbiter.js";

// ─── Paths ────────────────────────────────────────────────────────────────────

function engagementPath(): string {
  return resolve(homedir(), ".claude", "state", "moneypenny", "engagements");
}

function transitionPacketsPath(): string {
  return resolve(homedir(), ".claude", "state", "moneypenny", "transition_packets");
}

function ensureDirs(): void {
  mkdirSync(engagementPath(), { recursive: true });
  mkdirSync(transitionPacketsPath(), { recursive: true });
}

// ─── Engagement Record ────────────────────────────────────────────────────────

export interface EngagementRecord {
  engagement_id: string;
  hold_id: string;
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  kissaki_rank: string;
  substrate_ai: string;
  started_at: ISO8601;
  last_message_at: ISO8601;
  messages: Array<{ role: "engager" | "caller"; text: string; ts: ISO8601 }>;
  status: "active" | "completed" | "transferred";
  open_questions: string[];
  canon_refs: string[];
}

/**
 * Initiate substantive engagement for a held caller.
 * Returns the engagement record (non-blocking: actual AI engagement happens
 * when the Substantive Engager agent processes the record).
 */
export function initiateEngagement(hold: HoldHandle, callerSignal: string): EngagementRecord {
  ensureDirs();
  const now: ISO8601 = new Date().toISOString();
  const rank = kissakiRankForCaller(hold.caller_class);
  const substrates: Record<string, string> = {
    APPRENTICE: "sonnet-4-6",
    JOURNEYMAN: "claude-sonnet-4-6",
    MASTER: "claude-opus-4-7",
    KISSAKI: "founder-direct",
  };

  const engagement: EngagementRecord = {
    engagement_id: randomUUID(),
    hold_id: hold.hold_id,
    thread_id: hold.thread_id,
    caller_class: hold.caller_class,
    kissaki_rank: rank,
    substrate_ai: substrates[rank] ?? "claude-sonnet-4-6",
    started_at: now,
    last_message_at: now,
    messages: [
      {
        role: "caller",
        text: callerSignal,
        ts: now,
      },
    ],
    status: "active",
    open_questions: [],
    canon_refs: [],
  };

  const filePath = resolve(engagementPath(), `${engagement.engagement_id}.json`);
  writeFileSync(filePath, JSON.stringify(engagement, null, 2));

  return engagement;
}

/**
 * Append a message to an active engagement.
 */
export function appendEngagementMessage(
  engagementId: string,
  role: "engager" | "caller",
  text: string,
): void {
  const filePath = resolve(engagementPath(), `${engagementId}.json`);
  if (!existsSync(filePath)) return;
  try {
    const engagement = JSON.parse(readFileSync(filePath, "utf-8")) as EngagementRecord;
    const now: ISO8601 = new Date().toISOString();
    engagement.messages.push({ role, text, ts: now });
    engagement.last_message_at = now;
    writeFileSync(filePath, JSON.stringify(engagement, null, 2));
  } catch { /* non-fatal */ }
}

/**
 * Build a transition packet when Founder becomes available.
 * Per §4.3 step 4: 3K-summary of held conversation + open questions.
 */
export function buildTransitionPacket(
  engagement: EngagementRecord,
  threadCompressed3k: string,
): TransitionPacket {
  ensureDirs();
  const now: ISO8601 = new Date().toISOString();

  // Synthesize a concise recap of the held conversation
  const conversationSummary = engagement.messages
    .slice(-20)  // last 20 messages max
    .map(m => `[${m.role.toUpperCase()}] ${m.text}`)
    .join("\n");

  // Extract open questions from messages (simple heuristic: questions ending with "?")
  const openQuestions = engagement.open_questions.length > 0
    ? engagement.open_questions
    : engagement.messages
        .filter(m => m.text.trim().endsWith("?"))
        .slice(-5)
        .map(m => m.text.trim());

  const summary = [
    `## Held Conversation Summary`,
    `Caller class: ${engagement.caller_class}`,
    `Duration: ${formatDuration(engagement.started_at, now)}`,
    `Kissaki rank: ${engagement.kissaki_rank}`,
    ``,
    `### Prior thread context (3K-compressed):`,
    threadCompressed3k.slice(0, 1000),
    ``,
    `### Conversation recap:`,
    conversationSummary.slice(0, 1500),
  ].join("\n");

  const suggestedPickup = buildPickupLine(engagement.caller_class, engagement.messages);

  const packet: TransitionPacket = {
    thread_id: engagement.thread_id,
    hold_id: engagement.hold_id,
    caller_class: engagement.caller_class,
    summary,
    open_questions: openQuestions,
    suggested_pickup_line: suggestedPickup,
    engager_notes: `${engagement.messages.length} messages exchanged. Last message: ${engagement.last_message_at}`,
    ts: now,
  };

  // Write to transition_packets store
  const packetPath = resolve(transitionPacketsPath(), `${engagement.hold_id}_packet.json`);
  writeFileSync(packetPath, JSON.stringify(packet, null, 2));

  // Mark engagement as transferred
  const filePath = resolve(engagementPath(), `${engagement.engagement_id}.json`);
  if (existsSync(filePath)) {
    try {
      const updated = { ...engagement, status: "transferred" as const };
      writeFileSync(filePath, JSON.stringify(updated, null, 2));
    } catch { /* non-fatal */ }
  }

  // Mark hold as delivered
  updateHoldStatus(engagement.hold_id, "delivered");

  return packet;
}

/**
 * Load pending transition packets for Founder review.
 */
export function loadPendingTransitionPackets(): TransitionPacket[] {
  const dir = transitionPacketsPath();
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir)
      .filter((f: string) => f.endsWith("_packet.json"))
      .map((f: string) => {
        try {
          return JSON.parse(readFileSync(resolve(dir, f), "utf-8")) as TransitionPacket;
        } catch {
          return null;
        }
      })
      .filter((p: TransitionPacket | null): p is TransitionPacket => p !== null);
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(start: ISO8601, end: ISO8601): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function buildPickupLine(
  callerClass: CallerClass,
  messages: EngagementRecord["messages"],
): string {
  const lastCallerMessage = messages.filter(m => m.role === "caller").slice(-1)[0];
  const lastText = lastCallerMessage?.text ?? "";

  const openers: Record<CallerClass, string> = {
    WARREN_BUFFETT: "Good to speak with you directly. I've been briefed.",
    MACKENZIE_SCOTT: "Thank you for your patience. Let me pick up where we left off.",
    FAMILY: "Hey, I'm here now. What do you need?",
    COUNSEL: "I'm with you now. Let's continue on that matter.",
    PRESS: "Thanks for waiting. I understand you were discussing — ",
    TALENTS_PRACTITIONER: "I've reviewed what you shared. Let's continue.",
    INTERNAL_AI: "Handoff received. Context loaded.",
    UNKNOWN: "Thank you for your patience. Let me understand what brings you here.",
  };

  const opener = openers[callerClass] ?? "I'm with you now.";
  return lastText.length > 0
    ? `${opener} You mentioned: "${lastText.slice(0, 80)}${lastText.length > 80 ? "..." : ""}"`
    : opener;
}
