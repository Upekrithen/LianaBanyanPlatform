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
export type CFPPayloadType = "rule_export" | "aggregate_export" | "naf_decision" | "naf_default" | "majcom_aggregate_export" | "majcom_rule_proposal" | "majcom_policy_receipt" | "majcom_cross_majcom_pattern" | "band_audit_rollup";
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
export declare function signPayload(payload: unknown, source_wing_id: string, payload_type: CFPPayloadType): CFPEnvelope;
export declare function verifyEnvelope(envelope: CFPEnvelope): CFPVerifyResult;
/** Wrap a rule definition in a CFP rule_export envelope (C.5, C.14). */
export declare function createRuleExport(rule: object, source_wing_id: string): CFPEnvelope;
/** Wrap aggregate signals in a CFP aggregate_export envelope (C.1–C.3, C.14). */
export declare function createAggregateExport(signals: object, source_wing_id: string): CFPEnvelope;
/** Wrap a governance decision in a CFP naf_decision envelope (C.6, C.13, C.14). */
export declare function createNafDecision(decision: {
    candidate_id: string;
    action: "accept" | "reject";
    reason: string;
    governor: string;
}, naf_wing_id: string): CFPEnvelope;
/** Wrap a NAF-promoted rule in a CFP naf_default envelope (C.7, C.14). */
export declare function createNafDefault(rule: object, naf_wing_id: string): CFPEnvelope;
/**
 * Wrap NAF aggregate signals for MAJCOM rollup (B.4, C.2).
 * Privacy-stripped: only aggregate counts reach MAJCOM.
 */
export declare function createMajcomAggregateExport(signals: object, source_naf_id: string): CFPEnvelope;
/**
 * Wrap a rule proposal from a NAF to MAJCOM (B.3, C.3).
 */
export declare function createMajcomRuleProposal(rule: object, source_naf_id: string): CFPEnvelope;
/**
 * Wrap MAJCOM-default policy receipt acknowledgement (C.5, C.6).
 * NAF acknowledges receipt of a MAJCOM-promoted rule.
 */
export declare function createMajcomPolicyReceipt(receipt: {
    rule_id: string;
    majcom_id: string;
    naf_id: string;
    install_status: "installed" | "deferred" | "declined";
}, source_naf_id: string): CFPEnvelope;
/**
 * Wrap a cross-MAJCOM aggregate pattern share (B.6, C.12).
 * MAJCOM-to-MAJCOM transport for Sphinx Band-level federation.
 * Phase 1: interface ready; transport to second MAJCOM pending.
 */
export declare function createCrossMAJCOMPattern(pattern: object, source_majcom_id: string, destination_majcom: string, sphinx_band: string): CFPEnvelope;
/**
 * Wrap a Band-tier audit rollup from MAJCOM (C.16).
 * MAJCOM emits aggregate audit summary to Sphinx Band governance.
 */
export declare function createBandAuditRollup(audit: object, source_majcom_id: string, sphinx_band: string): CFPEnvelope;
/** Parse an envelope and verify its provenance hash. Returns payload + validity. */
export declare function parseEnvelope(envelope: CFPEnvelope): {
    payload: unknown;
    source_wing_id: string;
    valid: boolean;
    reason?: string;
};
