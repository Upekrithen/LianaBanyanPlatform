/**
 * MCP Tool: moneypenny_resurrect — Resurrect dormant context (G8 gate)
 * Bushel 82, BP034
 */

import type { ThreadHandle, InboundChannel } from "../types.js";
import { resurrect_thread } from "../mcci/resurrection.js";

export interface MoneyPennyResurrectInput {
  thread_id: ThreadHandle;
  new_signal?: string;
  signal_channel?: InboundChannel;
  caller_id?: string;
}

export async function moneyPennyResurrect(input: MoneyPennyResurrectInput) {
  const newSignal = input.new_signal
    ? {
        channel: input.signal_channel ?? ("web" as const),
        caller: { id: input.caller_id ?? "unknown", channel: input.signal_channel ?? ("web" as const) },
        signal: input.new_signal,
        ts: new Date().toISOString(),
      }
    : undefined;

  const packet = await resurrect_thread(input.thread_id, newSignal);

  return {
    thread_id: packet.thread_id,
    days_dormant: packet.days_dormant,
    compressed_3k: packet.compressed_3k,
    last_3_messages: packet.last_3_full_messages,
    suggested_open: packet.suggested_open,
    canon_refs_loaded: packet.canon_refs_loaded,
    ts: new Date().toISOString(),
  };
}
