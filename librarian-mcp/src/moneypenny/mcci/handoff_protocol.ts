/**
 * MoneyPenny MCCI Handoff Protocol (§5.2, Bushel 82, BP034)
 * Context handoff between AI surfaces: Pawn → Bishop → Knight → Founder → ...
 *
 * Handoff sequence:
 *   1. Agent A signals MoneyPenny: "Handing thread X to agent B"
 *   2. MoneyPenny invokes compression_3k on Thread X full log
 *   3. Write new thread.context.summary_version = N+1
 *   4. Dispatch to Agent B with packet
 *   5. Agent B acknowledges; thread state updated; Agent A closed
 *
 * G6 gate: Pawn → Bishop → Knight → Founder handoff with zero context loss.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import type { HandoffPacket, Thread, ThreadHandle, ISO8601 } from "../types.js";
import { loadThread, saveThread, getRecentMessages, updateThreadCompressed3k } from "./thread_store.js";
import { compress_to_3k } from "./compression_3k.js";

// ─── Paths ────────────────────────────────────────────────────────────────────

function handoffDir(): string {
  return resolve(homedir(), ".claude", "state", "mcci", "handoffs");
}

function handoffFilePath(handoffId: string): string {
  return resolve(handoffDir(), `${handoffId}.json`);
}

function pendingHandoffsPath(agentId: string): string {
  return resolve(handoffDir(), `pending_${agentId.replace(/[^a-z0-9_]/gi, "_")}.jsonl`);
}

function ensureDir(): void {
  mkdirSync(handoffDir(), { recursive: true });
}

// ─── Open Questions Extractor ─────────────────────────────────────────────────

function extractOpenQuestions(content: string): string[] {
  const lines = content.split("\n");
  return lines
    .filter(l => l.trim().endsWith("?"))
    .map(l => l.trim())
    .slice(-5);
}

function extractCanonRefs(content: string): string[] {
  const matches = content.match(/LB-(?:STACK|CODEX)-\d+/g) ?? [];
  return [...new Set(matches)];
}

function extractEscalationTriggers(content: string): string[] {
  const triggers: string[] = [];
  const escalationPatterns = [
    /escalat/i, /urgent/i, /immediate/i, /crisis/i,
    /legal action/i, /threat/i, /time.sensitive/i,
  ];
  const lines = content.split("\n");
  for (const line of lines) {
    if (escalationPatterns.some(p => p.test(line))) {
      triggers.push(line.trim().slice(0, 100));
    }
  }
  return [...new Set(triggers)].slice(0, 5);
}

// ─── Handoff Core ─────────────────────────────────────────────────────────────

/**
 * Initiate a context handoff from agentA to agentB for a given thread.
 * Returns the HandoffPacket — agent B should acknowledge via acknowledgeHandoff().
 */
export async function initiateHandoff(
  threadId: ThreadHandle,
  fromAgent: string,
  toAgent: string,
): Promise<HandoffPacket> {
  ensureDir();

  const thread = loadThread(threadId);
  if (!thread) {
    throw new Error(`Thread ${threadId} not found — cannot initiate handoff`);
  }

  const now: ISO8601 = new Date().toISOString();

  // Step 2: Compress
  const compressed_3k = await compress_to_3k(thread);

  // Step 3: Increment summary version
  await updateThreadCompressed3k(threadId, compressed_3k);
  const updatedThread = loadThread(threadId)!;

  const recentMessages = getRecentMessages(updatedThread, 3);
  const openQuestions = extractOpenQuestions(updatedThread.context.full);
  const canonRefs = extractCanonRefs(updatedThread.context.full);
  const escalationTriggers = extractEscalationTriggers(updatedThread.context.full);

  const packet: HandoffPacket = {
    thread_id: threadId,
    from_agent: fromAgent,
    to_agent: toAgent,
    compressed_3k,
    last_3_full_messages: recentMessages,
    open_questions: openQuestions,
    canon_refs: canonRefs,
    escalation_triggers: escalationTriggers,
    summary_version: updatedThread.context.summary_version,
    ts: now,
  };

  // Step 4: Write packet to disk + queue for agent B
  const handoffId = randomUUID();
  writeFileSync(handoffFilePath(handoffId), JSON.stringify(packet, null, 2));

  // Queue for receiving agent
  const pendingPath = pendingHandoffsPath(toAgent);
  appendFileSync(
    pendingPath,
    JSON.stringify({ handoff_id: handoffId, thread_id: threadId, from: fromAgent, ts: now }) + "\n",
  );

  return packet;
}

/**
 * Acknowledge receipt of a handoff. Called by the receiving agent.
 * Updates thread state to reflect new active agent.
 */
export function acknowledgeHandoff(
  threadId: ThreadHandle,
  toAgent: string,
  handoffId?: string,
): void {
  const thread = loadThread(threadId);
  if (!thread) return;

  const now: ISO8601 = new Date().toISOString();
  thread.metadata.last_active = now;

  // Add agent to participants if not already there
  if (!thread.participants.includes(toAgent)) {
    thread.participants.push(toAgent);
  }

  saveThread(thread);
}

/**
 * Load pending handoffs for a given agent.
 */
export function loadPendingHandoffs(agentId: string): Array<{
  handoff_id: string;
  thread_id: ThreadHandle;
  from: string;
  ts: ISO8601;
}> {
  const p = pendingHandoffsPath(agentId);
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * Load a handoff packet by ID.
 */
export function loadHandoffPacket(handoffId: string): HandoffPacket | null {
  const p = handoffFilePath(handoffId);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as HandoffPacket;
  } catch {
    return null;
  }
}
