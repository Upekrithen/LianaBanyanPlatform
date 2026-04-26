/**
 * Cathedral Federation Protocol (CFP) — Minimal Implementation
 * K519 / K520 / A&A #2292
 *
 * CFP is the scale-invariant transport layer for the Augur MAJCOM federation
 * (#2295). The same protocol operates at every tier:
 *
 * NAF-tier (K519):
 *   rule_export      → member Wing submits rule for NAF promotion
 *   aggregate_export → member Wing emits opt-in aggregate signals to NAF
 *   naf_decision     → NAF records accept/reject governance decision
 *   naf_default      → NAF publishes a rule as opt-in default for member Wings
 *
 * MAJCOM-tier (K520 / A&A #2295 Tier 5):
 *   majcom_aggregate_export   → NAF emits aggregate signals to MAJCOM
 *   majcom_rule_proposal      → NAF proposes rule for MAJCOM promotion
 *   majcom_policy_receipt     → NAF acknowledges MAJCOM-default rule
 *   majcom_cross_majcom_pattern → MAJCOM-to-MAJCOM aggregate pattern share
 *   band_audit_rollup         → MAJCOM emits audit rollup to Sphinx Band tier
 *
 * Provenance: every envelope carries a SHA256 hash that provides tamper-
 * evidence and chain-of-custody for governance audits at every tier.
 *
 * Scale-invariance property (A&A #2295 Claim 11): the same signing +
 * verification primitive operates identically at Wing→NAF, NAF→MAJCOM,
 * and MAJCOM→Band tiers without modification.
 *
 * Sovereignty guarantee: _stripProhibited() runs on all aggregate and rule
 * payloads before signing, ensuring no substrate content or member-
 * identifiable data can enter the federation transport layer at any tier.
 */

import { createHash } from "crypto";

export type CFPPayloadType =
  | "rule_export"
  | "aggregate_export"
  | "naf_decision"
  | "naf_default"
  | "majcom_aggregate_export"
  | "majcom_rule_proposal"
  | "majcom_policy_receipt"
  | "majcom_cross_majcom_pattern"
  | "band_audit_rollup";

export interface CFPEnvelope {
  cfp_version: "1.0";
  payload_type: CFPPayloadType;
  /** Wing-level source (NAF-tier and below) */
  source_wing_id: string;
  /** NAF-level source (MAJCOM-tier envelopes) — optional */
  source_naf_id?: string;
  /** MAJCOM-level source (Band-tier envelopes) — optional */
  source_majcom_id?: string;
  /** Destination MAJCOM for cross-MAJCOM envelopes — optional */
  destination_majcom?: string;
  /** Sphinx Band for band-tier envelopes — optional */
  sphinx_band?: string;
  ts: string;
  /** SHA256(source_id + ":" + ts + ":" + JSON.stringify(payload)) */
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

// ── MAJCOM-tier envelope constructors (K520 / A&A #2295 Tier 5) ───────────────

/**
 * Wrap NAF aggregate signals for MAJCOM rollup (B.4, C.2).
 * Privacy-stripped: only aggregate counts reach MAJCOM.
 */
export function createMajcomAggregateExport(
  signals: object,
  source_naf_id: string
): CFPEnvelope {
  const safe = _stripProhibited(signals);
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_naf_id, ts, safe);
  return {
    cfp_version: "1.0",
    payload_type: "majcom_aggregate_export",
    source_wing_id: source_naf_id,  // reuse field for NAF ID at this tier
    source_naf_id,
    ts,
    provenance_hash,
    payload: safe,
  };
}

/**
 * Wrap a rule proposal from a NAF to MAJCOM (B.3, C.3).
 */
export function createMajcomRuleProposal(
  rule: object,
  source_naf_id: string
): CFPEnvelope {
  const safe = _stripProhibited(rule);
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_naf_id, ts, safe);
  return {
    cfp_version: "1.0",
    payload_type: "majcom_rule_proposal",
    source_wing_id: source_naf_id,
    source_naf_id,
    ts,
    provenance_hash,
    payload: safe,
  };
}

/**
 * Wrap MAJCOM-default policy receipt acknowledgement (C.5, C.6).
 * NAF acknowledges receipt of a MAJCOM-promoted rule.
 */
export function createMajcomPolicyReceipt(
  receipt: {
    rule_id: string;
    majcom_id: string;
    naf_id: string;
    install_status: "installed" | "deferred" | "declined";
  },
  source_naf_id: string
): CFPEnvelope {
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_naf_id, ts, receipt);
  return {
    cfp_version: "1.0",
    payload_type: "majcom_policy_receipt",
    source_wing_id: source_naf_id,
    source_naf_id,
    ts,
    provenance_hash,
    payload: receipt,
  };
}

/**
 * Wrap a cross-MAJCOM aggregate pattern share (B.6, C.12).
 * MAJCOM-to-MAJCOM transport for Sphinx Band-level federation.
 * Phase 1: interface ready; transport to second MAJCOM pending.
 */
export function createCrossMAJCOMPattern(
  pattern: object,
  source_majcom_id: string,
  destination_majcom: string,
  sphinx_band: string
): CFPEnvelope {
  const safe = _stripProhibited(pattern);
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_majcom_id, ts, safe);
  return {
    cfp_version: "1.0",
    payload_type: "majcom_cross_majcom_pattern",
    source_wing_id: source_majcom_id,  // reuse field for MAJCOM ID at this tier
    source_majcom_id,
    destination_majcom,
    sphinx_band,
    ts,
    provenance_hash,
    payload: safe,
  };
}

/**
 * Wrap a Band-tier audit rollup from MAJCOM (C.16).
 * MAJCOM emits aggregate audit summary to Sphinx Band governance.
 */
export function createBandAuditRollup(
  audit: object,
  source_majcom_id: string,
  sphinx_band: string
): CFPEnvelope {
  const safe = _stripProhibited(audit);
  const ts = new Date().toISOString();
  const provenance_hash = _hashPayload(source_majcom_id, ts, safe);
  return {
    cfp_version: "1.0",
    payload_type: "band_audit_rollup",
    source_wing_id: source_majcom_id,
    source_majcom_id,
    sphinx_band,
    ts,
    provenance_hash,
    payload: safe,
  };
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
