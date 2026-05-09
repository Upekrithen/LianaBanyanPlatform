/**
 * MCP Tool: moneypenny_route — Route an inbound interaction (G1/G2/G3 gate)
 * Bushel 82, BP034
 */

import type { InboundChannel, CallerClass } from "../types.js";
import { route } from "../gateway/router.js";

export interface MoneyPennyRouteInput {
  channel: InboundChannel;
  caller_id: string;
  caller_display_name?: string;
  signal: string;
  caller_class_override?: CallerClass;
  is_family_emergency?: boolean;
  metadata?: Record<string, unknown>;
}

export async function moneyPennyRoute(input: MoneyPennyRouteInput) {
  const now = new Date().toISOString();
  const signal = {
    channel: input.channel,
    caller: {
      id: input.caller_id,
      display_name: input.caller_display_name,
      channel: input.channel,
    },
    signal: input.signal,
    metadata: input.metadata,
    ts: now,
  };

  const result = await route(signal, input.caller_class_override, input.is_family_emergency ?? false);

  return {
    outcome: result.decision.outcome,
    thread_id: result.thread_id,
    caller_class: result.decision.caller_class,
    availability_at_decision: result.decision.availability_at_decision,
    reason: result.decision.reason,
    receipt_path: result.decision.receipt_path,
    hold_handle: result.hold_handle
      ? {
          hold_id: result.hold_handle.hold_id,
          engager_assigned: result.hold_handle.engager_assigned,
          status: result.hold_handle.status,
        }
      : null,
    ts: result.decision.ts,
  };
}
