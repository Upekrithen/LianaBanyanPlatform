/**
 * MoneyPenny MCCI Context Kernel — Main Entry Point (§5, Bushel 82, BP034)
 * Continuous context store: the "don't worry about context anymore" substrate.
 * Orchestrates: thread_store + handoff_protocol + compression_3k + resurrection
 *
 * G5/G6/G7/G8 gates live here.
 */

import type {
  Thread, ThreadHandle, HandoffPacket, ContextPacket,
  InboundSignal, ThreadClass,
} from "../types.js";
import {
  createThread, loadThread, appendToThread, getOrCreateThread,
  updateThreadState, findThreadsByParticipant, getActiveThreadCount,
} from "./thread_store.js";
import { compress_to_3k, verifyCompression } from "./compression_3k.js";
import { initiateHandoff, acknowledgeHandoff, loadPendingHandoffs } from "./handoff_protocol.js";
import { resurrect_thread, daysSince } from "./resurrection.js";

// ─── Context Kernel ───────────────────────────────────────────────────────────

export class MCCIContextKernel {
  // ── Thread Management ────────────────────────────────────────────────────

  async getOrCreateRelationshipThread(participantId: string): Promise<Thread> {
    return getOrCreateThread(participantId, "relationship");
  }

  async createProjectThread(participants: string[], initialContent = ""): Promise<Thread> {
    return createThread(participants, "project", initialContent);
  }

  loadThread(id: ThreadHandle): Thread | null {
    return loadThread(id);
  }

  appendContext(threadId: ThreadHandle, content: string): Thread | null {
    return appendToThread(threadId, content);
  }

  archiveThread(threadId: ThreadHandle): void {
    updateThreadState(threadId, "archived");
  }

  // ── Compression ──────────────────────────────────────────────────────────

  async compress(threadId: ThreadHandle): Promise<{
    compressed: string;
    verification: ReturnType<typeof verifyCompression>;
  }> {
    const thread = loadThread(threadId);
    if (!thread) throw new Error(`Thread ${threadId} not found`);

    const compressed = await compress_to_3k(thread);
    const verification = verifyCompression(compressed);
    return { compressed, verification };
  }

  // ── Handoff Protocol ─────────────────────────────────────────────────────

  async handoff(
    threadId: ThreadHandle,
    fromAgent: string,
    toAgent: string,
  ): Promise<HandoffPacket> {
    return initiateHandoff(threadId, fromAgent, toAgent);
  }

  acknowledge(threadId: ThreadHandle, agentId: string): void {
    acknowledgeHandoff(threadId, agentId);
  }

  getPendingHandoffs(agentId: string): ReturnType<typeof loadPendingHandoffs> {
    return loadPendingHandoffs(agentId);
  }

  // ── Resurrection ─────────────────────────────────────────────────────────

  async resurrect(threadId: ThreadHandle, newSignal?: InboundSignal): Promise<ContextPacket> {
    return resurrect_thread(threadId, newSignal);
  }

  // ── Lookup Helpers ───────────────────────────────────────────────────────

  findThreadsForParticipant(participantId: string): Thread[] {
    return findThreadsByParticipant(participantId);
  }

  getThreadAge(threadId: ThreadHandle): number {
    const thread = loadThread(threadId);
    if (!thread) return -1;
    return daysSince(thread.metadata.last_active);
  }

  isDormant(threadId: ThreadHandle, thresholdDays = 30): boolean {
    return this.getThreadAge(threadId) >= thresholdDays;
  }

  getTotalActiveThreads(): number {
    return getActiveThreadCount();
  }
}

// Singleton instance for use across the server
export const mcci = new MCCIContextKernel();
