/**
 * Gold Tablet HMAC — KN-N1 / BP018 Pod N
 * ========================================
 * HMAC-SHA256 signature generation and verification for Gold Tablet entries.
 * Key derived from ratification_session + tier + scope to prevent cross-context forgery.
 */

import { createHmac, timingSafeEqual } from "crypto";

const GOLD_HMAC_SALT = "LB-GOLD-CANONICAL-AUTHORITY-BP018";

/**
 * Build deterministic signing payload from a Gold Tablet's immutable fields.
 * Does NOT include hmac_signature or chronos_ts (generated after payload).
 */
function buildPayload(opts: {
  id: string;
  tier: string;
  scope: string;
  topic: string;
  rule_text: string;
  ratification_session: string;
  ratification_ts: string;
}): string {
  return [
    opts.id,
    opts.tier,
    opts.scope,
    opts.topic,
    opts.rule_text,
    opts.ratification_session,
    opts.ratification_ts,
  ].join("|");
}

/**
 * Derive a per-tablet HMAC key from the session + tier + scope triplet.
 * This binds the signature to the authority context.
 */
function deriveKey(ratification_session: string, tier: string, scope: string): string {
  return `${GOLD_HMAC_SALT}:${ratification_session}:${tier}:${scope}`;
}

/** Generate an HMAC-SHA256 signature for a Gold Tablet. */
export function signGoldTablet(opts: {
  id: string;
  tier: string;
  scope: string;
  topic: string;
  rule_text: string;
  ratification_session: string;
  ratification_ts: string;
}): string {
  const key = deriveKey(opts.ratification_session, opts.tier, opts.scope);
  const payload = buildPayload(opts);
  return createHmac("sha256", key).update(payload).digest("hex");
}

/** Verify an HMAC-SHA256 signature against a Gold Tablet's fields. Returns true if valid. */
export function verifyGoldTablet(opts: {
  id: string;
  tier: string;
  scope: string;
  topic: string;
  rule_text: string;
  ratification_session: string;
  ratification_ts: string;
  hmac_signature: string;
}): boolean {
  try {
    const expected = signGoldTablet(opts);
    // Constant-time comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(opts.hmac_signature, "hex");
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/** Generate a Chronos-class timestamp string (ISO-8601 with milliseconds). */
export function chronosTimestamp(): string {
  return new Date().toISOString();
}
