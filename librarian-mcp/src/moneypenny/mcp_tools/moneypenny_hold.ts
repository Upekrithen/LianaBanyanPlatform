/**
 * MCP Tool: moneypenny_hold — Place inbound on substantive hold (G4 gate)
 * Bushel 82, BP034
 */

import { randomUUID } from "node:crypto";
import type { ThreadHandle, CallerClass } from "../types.js";
import { kissakiRankForCaller } from "../gateway/priority_taxonomy.js";
import { enqueueHold, updateHoldStatus } from "../gateway/no_collision_arbiter.js";
import { initiateEngagement } from "../gateway/hold_and_engage.js";

export interface MoneyPennyHoldInput {
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  reason: string;
  caller_message?: string;
}

export function moneyPennyHold(input: MoneyPennyHoldInput) {
  const now = new Date().toISOString();
  const hold = {
    hold_id: randomUUID(),
    thread_id: input.thread_id,
    caller_class: input.caller_class,
    held_at: now,
    reason: input.reason,
    engager_assigned: kissakiRankForCaller(input.caller_class),
    status: "active" as const,
  };

  enqueueHold(hold);
  if (input.caller_message) initiateEngagement(hold, input.caller_message);

  return {
    hold_id: hold.hold_id,
    thread_id: hold.thread_id,
    caller_class: hold.caller_class,
    engager_assigned: hold.engager_assigned,
    status: hold.status,
    ts: now,
  };
}

export interface MoneyPennyReleaseHoldInput {
  hold_id: string;
  thread_id: ThreadHandle;
}

export function moneyPennyReleaseHold(input: MoneyPennyReleaseHoldInput) {
  updateHoldStatus(input.hold_id, "released");
  return { hold_id: input.hold_id, status: "released", ts: new Date().toISOString() };
}
