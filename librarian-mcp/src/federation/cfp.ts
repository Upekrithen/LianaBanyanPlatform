/**
 * Cathedral Federation Protocol (CFP) — Minimal Implementation
 * K519 / A&A #2292
 *
 * CFP is the transport layer for the NAF voluntary federation:
 *   rule_export      → member submits rule for NAF promotion
 *   aggregate_export → member Wing emits opt-in aggregate signals to NAF
 *   naf_decision     → NAF records accept/reject governance decision
 *   naf_default      → NAF publishes a rule as opt-in default for member Wings
 *
 * Provenance: every envelope carries a SHA256 hash of
 *   (source_wing_id + ":" + ts + ":" + JSON.stringify(payload)).
 * This provides tamper-evidence and chain-of-custody for governance audits.
 *
 * Design principle (A&A #2292):
 *   "Every NAF-tier action traces back to source Wing(s)."
 *   The provenance_hash is the cryptographic anchor for that trace.
 *
 * Sovereignty guarantee (C.2 / C.3):
 *   createRuleExport and createAggregateExport run _stripProhibited()
 *   before signing, ensuring no substrate content or member-identifiable
 *   data can enter the federation transport layer.
 */

import { createHash } from "crypto";

export type CFPPayloadType =
  | "rule_export"
  | "aggregate_export"
  | "naf_decision"
  | "naf_default";

export interface CFPEnvelope {
  cfp_version: "1.0";
  payload_type: CFPPayloadType;
  source_wing_id: string;
  ts: string;
  /** SHA256(source_wing_id + ":" + ts + ":" + JSON.stringify(payload)) */
  provenance_hash: string;
  payload: unknown;
}

export interface CFPVerifyResult {
  valid: boolean;
  reason?: string;
}

// ── Signing & verification ─────────────────────────────────────────────────────

function _hashPayload(
  source_wing_id: string,
  ts: string,
  payload: unknown
): string {
  const material = `${source_wing_id}:${ts}:${JSON.stringify(payload)}`;
  return createHash("sha256").update(material, "utf8").digest("hex");
}

export function signPayload(
  payload: unknown,
  source_wing_id: string,
  payload_type: CFPPayloadType
): CFPEnvelope {
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_wing_id, ts, payload);
  return {
    cfp_version: "1.0",
    payload_type,
    source_wing_id,
    ts,
    provenance_hash,
    payload,
  };
}

export function verifyEnvelope(envelope: CFPEnvelope): CFPVerifyResult {
  if (!envelope || envelope.cfp_version !== "1.0") {
    return { valid: false, reason: "Missing or unsupported cfp_version" };
  }
  if (!envelope.source_wing_id) {
    return { valid: false, reason: "Missing source_wing_id" };
  }
  if (!envelope.ts) {
    return { valid: false, reason: "Missing ts" };
  }
  if (!envelope.provenance_hash) {
    return { valid: false, reason: "Missing provenance_hash" };
  }
  const expected = _hashPayload(
    envelope.source_wing_id,
    envelope.ts,
    envelope.payload
  );
  if (expected !== envelope.provenance_hash) {
    return {
      valid: false,
      reason:
        "Provenance hash mismatch — envelope may have been tampered with.",
    };
  }
  return { valid: true };
}

// ── Envelope constructors ──────────────────────────────────────────────────────

/** Wrap a rule definition in a CFP rule_export envelope (C.5, C.14). */
export function createRuleExport(
  rule: object,
  source_wing_id: string
): CFPEnvelope {
  const safe = _stripProhibited(rule);
  return signPayload(safe, source_wing_id, "rule_export");
}

/** Wrap aggregate signals in a CFP aggregate_export envelope (C.1–C.3, C.14). */
export function createAggregateExport(
  signals: object,
  source_wing_id: string
): CFPEnvelope {
  const safe = _stripProhibited(signals);
  return signPayload(safe, source_wing_id, "aggregate_export");
}

/** Wrap a governance decision in a CFP naf_decision envelope (C.6, C.13, C.14). */
export function createNafDecision(
  decision: {
    candidate_id: string;
    action: "accept" | "reject";
    reason: string;
    governor: string;
  },
  naf_wing_id: string
): CFPEnvelope {
  return signPayload(decision, naf_wing_id, "naf_decision");
}

/** Wrap a NAF-promoted rule in a CFP naf_default envelope (C.7, C.14). */
export function createNafDefault(
  rule: object,
  naf_wing_id: string
): CFPEnvelope {
  const safe = _stripProhibited(rule);
  return signPayload(safe, naf_wing_id, "naf_default");
}

// ── Parse & verify ─────────────────────────────────────────────────────────────

/** Parse an envelope and verify its provenance hash. Returns payload + validity. */
export function parseEnvelope(envelope: CFPEnvelope): {
  payload: unknown;
  source_wing_id: string;
  valid: boolean;
  reason?: string;
} {
  const result = verifyEnvelope(envelope);
  return {
    payload: envelope.payload,
    source_wing_id: envelope.source_wing_id,
    valid: result.valid,
    reason: result.reason,
  };
}

// ── Privacy guard ──────────────────────────────────────────────────────────────

/**
 * Fields that must NEVER appear in any CFP envelope (C.2, C.3).
 * Aggregates and rule exports are stripped of these keys before signing.
 */
const _PROHIBITED_FIELDS = new Set([
  "content",
  "text",
  "query",
  "query_text",
  "substrate",
  "email",
  "name",
  "user_id",
  "member_id",
  "username",
  "ip",
  "device_id",
  "location",
  "query_snippet",
]);

function _stripProhibited(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(_stripProhibited);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    obj as Record<string, unknown>
  )) {
    if (!_PROHIBITED_FIELDS.has(key.toLowerCase())) {
      result[key] = _stripProhibited(value);
    }
  }
  return result;
}
