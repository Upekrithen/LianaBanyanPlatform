/**
 * Thorax MCP Tools — Zod schemas + handlers
 * ==========================================
 * Dream #5 · BP046B · Phase 1
 *
 * 7 MCP tools:
 *   1. thorax_init          — initialize all 12 channels
 *   2. thorax_handshake     — initiate or accept pheromone handshake
 *   3. thorax_transmit      — transmit through choke point (East or West)
 *   4. thorax_stamp         — apply 2-stamp share or 3-stamp adopt
 *   5. thorax_flag_stream   — flag a stream (per-stream constriction + AoD)
 *   6. thorax_channel_status — get current state of all 12 channels
 *   7. thorax_phalanx       — enqueue/review Phalanx fallback
 *
 * Registered in server.ts via registerTool (beacon_scribe pattern).
 *
 * Ship gates tested by the smoke gate functions in each module.
 */

import { z } from "zod";

// ─── Import substrate modules ──────────────────────────────────────────────────

import {
  initializeChannels,
  readAllChannels,
  smokeGate3,
} from "./thorax_channels.js";

import {
  acquireChoke, releaseChoke, isChokeClear,
  getAllChokeStatus,
} from "./thorax_choke.js";

import {
  initiateHandshake, acceptHandshake,
  readHandshake, findPendingHandshakeForChannel,
  smokeGate1,
} from "./thorax_handshake.js";

import {
  applyStamp, verifyStamps,
} from "./thorax_stamp.js";

import {
  flagStream, readChannelFlags,
} from "./thorax_flag.js";

import {
  enqueuePhalanx, reviewPhalanxEntry, readActivePhalanxQueue, smokeGate7,
} from "./thorax_phalanx.js";

import {
  transmit, readChannelTransmissions,
  smokeGate2, smokeGate4,
} from "./thorax_transmission.js";

import {
  captureEblitSnapshot, readEblitSnapshot, verifyEblitIntegrity,
} from "./thorax_eblit.js";

import {
  bindCelPaneSignature, verifyCelPaneConsistency,
} from "./thorax_celpane.js";

import {
  cpRefusalGate, smokeGate8,
} from "./thorax_refusal.js";

// ─── Tool 1: thorax_init ─────────────────────────────────────────────────────

export const ThoraxInitSchema = {
  force_reinit: z.boolean().optional().describe(
    "If true, logs re-init even if channels already exist. Idempotent by default."
  ),
};

export async function handleThoraxInit(args: { force_reinit?: boolean }) {
  const result = initializeChannels();
  return {
    initialized: result.initialized,
    skipped: result.skipped,
    total_channels: result.initialized.length + result.skipped.length,
    message: `Thorax 12-channel relay-thread substrate initialized. Phase 1 GO.`,
  };
}

// ─── Tool 2: thorax_handshake ────────────────────────────────────────────────

export const ThoraxHandshakeSchema = {
  action: z.enum(["initiate", "accept", "status"]).describe(
    "initiate = East node starts handshake. accept = West node completes it. status = check current handshake state."
  ),
  channel_id: z.number().int().min(1).max(12).describe("Relay-thread channel (1-12)"),
  east_node_id: z.string().optional().describe("East node identifier (for initiate)"),
  west_node_id: z.string().optional().describe("West node identifier (for initiate)"),
  handshake_id: z.string().optional().describe("Handshake ID (for accept/status)"),
  accepting_node_id: z.string().optional().describe("Node ID accepting the handshake (for accept)"),
};

export async function handleThoraxHandshake(args: {
  action: "initiate" | "accept" | "status";
  channel_id: number;
  east_node_id?: string;
  west_node_id?: string;
  handshake_id?: string;
  accepting_node_id?: string;
}) {
  const { action, channel_id } = args;

  if (action === "initiate") {
    if (!args.east_node_id || !args.west_node_id) {
      return { success: false, error: "east_node_id and west_node_id required for initiate." };
    }
    const result = initiateHandshake(channel_id, args.east_node_id, args.west_node_id);
    return {
      ...result,
      note: "Pheromone signal emitted. West node must accept to complete reciprocal handshake.",
    };
  }

  if (action === "accept") {
    if (!args.handshake_id || !args.accepting_node_id) {
      return { success: false, error: "handshake_id and accepting_node_id required for accept." };
    }
    const result = acceptHandshake(args.handshake_id, args.accepting_node_id);
    if (result.bestie_established) {
      return {
        ...result,
        note: "Persistent-bestie established. Airport-secure-zone active. Channel ready for transmission.",
      };
    }
    return { ...result, note: "Partial acceptance recorded. Both nodes must accept to complete." };
  }

  if (action === "status") {
    const gate1 = smokeGate1(channel_id);
    const pending = findPendingHandshakeForChannel(channel_id);
    return { channel_id, gate1_smoke: gate1, pending_handshake: pending };
  }

  return { success: false, error: `Unknown action: ${action}` };
}

// ─── Tool 3: thorax_transmit ─────────────────────────────────────────────────

export const ThoraxTransmitSchema = {
  channel_id: z.number().int().min(1).max(12).describe("Relay-thread channel (1-12)"),
  direction: z.enum(["east", "west"]).describe(
    "east = originating direction. west = reciprocal direction. Alternates post-shift-to-side."
  ),
  sender_node_id: z.string().describe("Node ID of the sender"),
  payload_hash: z.string().describe(
    "SHA-256 hash of the payload. Never include raw payload — substrate stores hash only."
  ),
  celpane_chain_id: z.string().optional().describe("CelPane chain ID for shadow blink-skip binding"),
};

export async function handleThoraxTransmit(args: {
  channel_id: number;
  direction: "east" | "west";
  sender_node_id: string;
  payload_hash: string;
  celpane_chain_id?: string;
}) {
  const result = transmit(
    args.channel_id,
    args.direction,
    args.sender_node_id,
    args.payload_hash,
    { celpane_chain_id: args.celpane_chain_id }
  );

  if (result.refused) {
    return {
      success: false,
      refused: true,
      refusal_reasons: result.refusal_reasons,
      error: result.error,
      note: "CP-class refusal default: UNANIMOUS OR REFUSED. Isolated state is safe default.",
    };
  }

  return {
    ...result,
    note: "Transmission complete. Choke released. Shift-to-side recorded. Reciprocal direction may now enter.",
  };
}

// ─── Tool 4: thorax_stamp ────────────────────────────────────────────────────

export const ThoraxStampSchema = {
  action: z.enum(["apply", "verify"]).describe(
    "apply = add a stamp. verify = check current stamp state (share/adopt authorization)."
  ),
  channel_id: z.number().int().min(1).max(12).describe("Relay-thread channel (1-12)"),
  stamper_node_id: z.string().optional().describe("Stamping node ID (for apply)"),
  stamper_direction: z.enum(["east", "west"]).optional().describe("Which side is stamping (for apply)"),
};

export async function handleThoraxStamp(args: {
  action: "apply" | "verify";
  channel_id: number;
  stamper_node_id?: string;
  stamper_direction?: "east" | "west";
}) {
  if (args.action === "apply") {
    if (!args.stamper_node_id || !args.stamper_direction) {
      return { success: false, error: "stamper_node_id and stamper_direction required for apply." };
    }
    const result = applyStamp(args.channel_id, args.stamper_node_id, args.stamper_direction);
    return {
      ...result,
      note: result.adopt_threshold_met
        ? "3-stamp adopt threshold met."
        : result.share_threshold_met
        ? "2-stamp share authorized (1 East + 1 West)."
        : "Stamp applied. Share requires 1 East + 1 West. Adopt requires 3 total.",
    };
  }

  if (args.action === "verify") {
    const result = verifyStamps(args.channel_id);
    return {
      ...result,
      note: result.adopt_authorized
        ? "Adopt authorized (3 stamps)."
        : result.share_authorized
        ? "Share authorized (1E + 1W)."
        : "Insufficient stamps for share or adopt.",
    };
  }

  return { success: false, error: `Unknown action: ${args.action}` };
}

// ─── Tool 5: thorax_flag_stream ───────────────────────────────────────────────

export const ThoraxFlagStreamSchema = {
  channel_id: z.number().int().min(1).max(12).describe(
    "Channel to flag. OTHER 11 channels are unaffected (per-stream, NOT global)."
  ),
  flag_reason: z.string().min(1).max(500).describe("Reason for flagging this stream"),
  flagged_by: z.string().describe("Node ID or operator flagging the stream"),
};

export async function handleThoraxFlagStream(args: {
  channel_id: number;
  flag_reason: string;
  flagged_by: string;
}) {
  const result = flagStream(args.channel_id, args.flag_reason, args.flagged_by);

  if (result.success) {
    return {
      ...result,
      note: `Channel ${args.channel_id} rendered stationary. Entry/exit constricted. OTHER ${result.unaffected_channels?.length} channels unaffected. Angel of Death burial ID: ${result.angel_of_death_burial_id}.`,
    };
  }
  return result;
}

// ─── Tool 6: thorax_channel_status ───────────────────────────────────────────

export const ThoraxChannelStatusSchema = {
  channel_id: z.number().int().min(1).max(12).optional().describe(
    "Optional: get status for a specific channel. Omit for all 12 channels."
  ),
  include_smoke_gates: z.boolean().optional().describe(
    "If true, run ship gate smoke checks and include results."
  ),
};

export async function handleThoraxChannelStatus(args: {
  channel_id?: number;
  include_smoke_gates?: boolean;
}) {
  const choke_status = getAllChokeStatus();

  if (args.channel_id !== undefined) {
    const channels = readAllChannels();
    const ch = channels.find((c) => c.channel_id === args.channel_id);
    const choke = choke_status.find((c) => c.channel_id === args.channel_id);

    const result: Record<string, unknown> = { channel: ch, choke };

    if (args.include_smoke_gates) {
      result.gate_1 = smokeGate1(args.channel_id);
      result.gate_2 = smokeGate2(args.channel_id);
      result.gate_4 = smokeGate4(args.channel_id);
      result.gate_7 = smokeGate7(args.channel_id);
    }

    return result;
  }

  const all_channels = readAllChannels();
  const result: Record<string, unknown> = {
    channels: all_channels,
    choke_points: choke_status,
    total: all_channels.length,
    by_state: {
      uninitialized: all_channels.filter((c) => c.state === "uninitialized").length,
      handshake_pending: all_channels.filter((c) => c.state === "handshake_pending").length,
      bestie_open: all_channels.filter((c) => c.state === "bestie_open").length,
      transmitting_east: all_channels.filter((c) => c.state === "transmitting_east").length,
      transmitting_west: all_channels.filter((c) => c.state === "transmitting_west").length,
      flagged: all_channels.filter((c) => c.state === "flagged").length,
      phalanx: all_channels.filter((c) => c.state === "phalanx").length,
      sealed: all_channels.filter((c) => c.state === "sealed").length,
    },
  };

  if (args.include_smoke_gates) {
    result.gate_3 = smokeGate3();
  }

  return result;
}

// ─── Tool 7: thorax_phalanx ──────────────────────────────────────────────────

export const ThoraxPhalanxSchema = {
  action: z.enum(["enqueue", "review", "list"]).describe(
    "enqueue = add flagged channel to queue. review = approve/reject entry. list = view active queue."
  ),
  channel_id: z.number().int().min(1).max(12).optional().describe(
    "Channel to enqueue (for enqueue action)"
  ),
  reason: z.enum(["handshake_failed", "flagged", "cp_refused", "timeout"]).optional().describe(
    "Reason for Phalanx enqueue"
  ),
  flag_record_id: z.string().optional().describe("Flag record ID (for enqueue)"),
  queue_id: z.string().optional().describe("Phalanx queue entry ID (for review)"),
  outcome: z.enum(["reinstated", "sealed_angel_of_death"]).optional().describe(
    "Review outcome: reinstated = channel returns to bestie_open; sealed = Angel of Death furnace complete"
  ),
  reviewer: z.string().optional().describe("Reviewer identity (for review)"),
};

export async function handleThoraxPhalanx(args: {
  action: "enqueue" | "review" | "list";
  channel_id?: number;
  reason?: "handshake_failed" | "flagged" | "cp_refused" | "timeout";
  flag_record_id?: string;
  queue_id?: string;
  outcome?: "reinstated" | "sealed_angel_of_death";
  reviewer?: string;
}) {
  if (args.action === "list") {
    const queue = readActivePhalanxQueue();
    return {
      active_queue: queue,
      count: queue.length,
      note: "Phalanx fallback queue — streams awaiting independent review for reinstatement or furnace.",
    };
  }

  if (args.action === "enqueue") {
    if (args.channel_id === undefined || !args.reason) {
      return { success: false, error: "channel_id and reason required for enqueue." };
    }
    const result = enqueuePhalanx(args.channel_id, args.reason, {
      flag_record_id: args.flag_record_id,
    });
    return {
      ...result,
      note: `Channel ${args.channel_id} enqueued to Phalanx. Awaiting independent review. Entry point attuned to frequency signature.`,
    };
  }

  if (args.action === "review") {
    if (!args.queue_id || !args.outcome || !args.reviewer) {
      return { success: false, error: "queue_id, outcome, and reviewer required for review." };
    }
    const result = reviewPhalanxEntry(args.queue_id, args.outcome, args.reviewer);
    return {
      ...result,
      note: args.outcome === "reinstated"
        ? "Channel reinstated to bestie_open. Airport-secure-zone re-established."
        : "Channel sealed. Angel of Death furnace sentence complete.",
    };
  }

  return { success: false, error: `Unknown action: ${args.action}` };
}
