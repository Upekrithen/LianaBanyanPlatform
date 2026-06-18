/**
 * LB Hexadecimal Machine Code Wire Format
 * Canon: canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085
 * Founder-direct LIVE per BP086 §F
 *
 * Encodes plow dispatch payloads as hexadecimal machine code for compact,
 * deterministic peer-to-peer wire transfer across the LAN-as-WAN mesh.
 */

export interface HexFrame {
  magic: string;    // "LBHX" = 4C42 4858
  version: number;  // 1
  frame_type: 'DISPATCH' | 'RESPONSE' | 'HEARTBEAT' | 'ACK';
  node_id: string;
  payload_hex: string;
  checksum: string;  // CRC32-like XOR fold of payload as 8-char hex
  timestamp_ms: number;
}

export function encodeHexFrame(
  frameType: HexFrame['frame_type'],
  nodeId: string,
  payload: unknown
): { hex: string; frame: HexFrame; byteSize: number; encodeTimeMs: number } {
  const start = Date.now();
  const payloadJson = JSON.stringify(payload);
  const payloadHex = Buffer.from(payloadJson, 'utf8').toString('hex');

  // XOR-fold checksum — deterministic, no crypto dependency
  let checksum = 0;
  for (let i = 0; i < payloadHex.length; i += 2) {
    checksum ^= parseInt(payloadHex.slice(i, i + 2), 16);
    checksum = ((checksum << 5) ^ (checksum >> 27)) >>> 0;
  }

  const frame: HexFrame = {
    magic: '4C425858',
    version: 1,
    frame_type: frameType,
    node_id: nodeId,
    payload_hex: payloadHex,
    checksum: checksum.toString(16).padStart(8, '0'),
    timestamp_ms: Date.now()
  };

  const frameHex = Buffer.from(JSON.stringify(frame), 'utf8').toString('hex');
  const byteSize = frameHex.length / 2;
  const encodeTimeMs = Date.now() - start;

  return { hex: frameHex, frame, byteSize, encodeTimeMs };
}

export function decodeHexFrame(hex: string): { frame: HexFrame; payload: unknown; decodeTimeMs: number } {
  const start = Date.now();
  const frameJson = Buffer.from(hex, 'hex').toString('utf8');
  const frame: HexFrame = JSON.parse(frameJson);
  const payloadJson = Buffer.from(frame.payload_hex, 'hex').toString('utf8');
  const payload = JSON.parse(payloadJson);
  const decodeTimeMs = Date.now() - start;
  return { frame, payload, decodeTimeMs };
}

export function createDispatchFrame(nodeId: string, question: unknown, options: unknown): ReturnType<typeof encodeHexFrame> {
  return encodeHexFrame('DISPATCH', nodeId, { question, options, ts: Date.now() });
}

export function createResponseFrame(nodeId: string, result: unknown): ReturnType<typeof encodeHexFrame> {
  return encodeHexFrame('RESPONSE', nodeId, { result, ts: Date.now() });
}

export function createHeartbeatFrame(nodeId: string): ReturnType<typeof encodeHexFrame> {
  return encodeHexFrame('HEARTBEAT', nodeId, { ts: Date.now() });
}
