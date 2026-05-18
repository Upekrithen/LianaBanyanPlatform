/**
 * Thorax Construction-Flag Protocol — Public Exports
 * ==================================================
 * Dream #5 · BP046B · Phase 1
 *
 * Half-duplex token-pass through choke point, 12-channel parallelism,
 * persistent-bestie model, per-stream flag constriction.
 *
 * Canon: CANON_DREAM_5_THORAX_DEFENSIVE_ARCHITECTURE_BP046B.md
 * Project memory: project_thorax_construction_flag_12_relay_threads_bp046b.md
 */

export * from "./thorax_types.js";
export * from "./thorax_choke.js";
export * from "./thorax_channels.js";
export * from "./thorax_handshake.js";
export * from "./thorax_stamp.js";
export * from "./thorax_eblit.js";
export * from "./thorax_flag.js";
export * from "./thorax_phalanx.js";
export * from "./thorax_celpane.js";
export * from "./thorax_refusal.js";
export * from "./thorax_transmission.js";

// MCP tool handlers + schemas (imported by server.ts)
export {
  ThoraxInitSchema,
  handleThoraxInit,
  ThoraxHandshakeSchema,
  handleThoraxHandshake,
  ThoraxTransmitSchema,
  handleThoraxTransmit,
  ThoraxStampSchema,
  handleThoraxStamp,
  ThoraxFlagStreamSchema,
  handleThoraxFlagStream,
  ThoraxChannelStatusSchema,
  handleThoraxChannelStatus,
  ThoraxPhalanxSchema,
  handleThoraxPhalanx,
} from "./thorax_tools.js";
