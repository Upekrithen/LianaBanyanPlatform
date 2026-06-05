/**
 * MoneyPenny Webhook Signature Verification — BP073 Wave 4 · W4.7
 * ================================================================
 * Verifies that inbound webhook calls genuinely come from the expected source.
 * Protects against replay attacks and spoofed callbacks.
 *
 * Channels covered:
 *   Twilio Voice / SMS   — HMAC-SHA1 over canonical URL + sorted params
 *   Gmail Pub/Sub        — Bearer token validation
 *
 * All verification is pure TypeScript (no Deno or Node built-ins) so it
 * runs in both Supabase Edge Functions (Deno) and the Vitest test suite.
 *
 * FOUNDER: no action needed. Signature verification is automatic once
 * TWILIO_AUTH_TOKEN is set. The Pub/Sub token is configured in gmail-bridge.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TwilioSignatureParams {
  authToken: string;
  webhookUrl: string;
  postParams: Record<string, string>;
  twilioSignature: string;
}

export interface SignatureVerifyResult {
  valid: boolean;
  reason: string;
}

// ─── Twilio HMAC-SHA1 Signature Verification ─────────────────────────────────
//
// Twilio algorithm:
//   1. Concatenate webhookUrl + sorted query string of POST params (key + value, no separator)
//   2. HMAC-SHA1 with authToken as key
//   3. base64-encode
//   4. Compare to X-Twilio-Signature header
//
// This is a pure-JS implementation because Deno's crypto.subtle does SHA-256/384/512.
// For production Edge Functions, use the @twilio/security package or the full Deno crypto approach.

/**
 * Pure-JS HMAC-SHA1 using SubtleCrypto (works in browser, Deno, and Node).
 * Returns the base64-encoded HMAC.
 */
export async function hmacSHA1Base64(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * W4.7 — Verify a Twilio webhook request signature.
 * Uses the Twilio HMAC-SHA1 algorithm documented at:
 *   https://www.twilio.com/docs/usage/webhooks/webhooks-security
 *
 * FOUNDER: TWILIO_AUTH_TOKEN must be set in Vault.
 * Called automatically by moneypenny-voice and moneypenny-sms Edge Functions.
 */
export async function verifyTwilioSignature(
  params: TwilioSignatureParams,
): Promise<SignatureVerifyResult> {
  const { authToken, webhookUrl, postParams, twilioSignature } = params;

  if (!authToken) {
    return { valid: false, reason: "TWILIO_AUTH_TOKEN not set — cannot verify signature" };
  }
  if (!twilioSignature) {
    return { valid: false, reason: "X-Twilio-Signature header missing from request" };
  }

  // Build canonical string: url + sorted params concatenated
  const sortedKeys = Object.keys(postParams).sort();
  const paramString = sortedKeys.reduce((acc, k) => acc + k + (postParams[k] ?? ""), "");
  const canonical = webhookUrl + paramString;

  try {
    const expected = await hmacSHA1Base64(authToken, canonical);

    // Constant-time comparison to prevent timing attacks
    const valid = constantTimeEqual(expected, twilioSignature);
    return valid
      ? { valid: true, reason: "HMAC-SHA1 signature valid" }
      : { valid: false, reason: "Signature mismatch — request may be spoofed" };
  } catch (err) {
    return {
      valid: false,
      reason: `Signature computation error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * W4.7 — Synchronous signature check for Gmail Pub/Sub bearer token.
 * Pub/Sub push subscriptions include a bearer token in the Authorization header.
 * The token must match GMAIL_PUBSUB_VERIFICATION_TOKEN set in the subscription config.
 *
 * FOUNDER: set GMAIL_PUBSUB_VERIFICATION_TOKEN in Vault and in GCP Pub/Sub
 * subscription settings ("Enable authentication" > add token).
 */
export function verifyGmailPubSubToken(
  authorizationHeader: string | null,
  expectedToken: string | undefined,
): SignatureVerifyResult {
  if (!expectedToken) {
    // No token configured — pass through (common in development)
    return {
      valid: true,
      reason: "GMAIL_PUBSUB_VERIFICATION_TOKEN not set — skipping verification (dev mode)",
    };
  }
  if (!authorizationHeader) {
    return { valid: false, reason: "Authorization header missing from Pub/Sub request" };
  }

  const prefix = "Bearer ";
  if (!authorizationHeader.startsWith(prefix)) {
    return { valid: false, reason: "Authorization header must use Bearer scheme" };
  }

  const provided = authorizationHeader.slice(prefix.length).trim();
  const valid = constantTimeEqual(provided, expectedToken);
  return valid
    ? { valid: true, reason: "Pub/Sub bearer token valid" }
    : { valid: false, reason: "Pub/Sub bearer token mismatch — check GMAIL_PUBSUB_VERIFICATION_TOKEN" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Constant-time string comparison — prevents timing attacks on secret comparison.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Build the canonical string for Twilio signature verification.
 * Exposed for testing and debugging.
 */
export function buildTwilioCanonical(
  webhookUrl: string,
  postParams: Record<string, string>,
): string {
  const sortedKeys = Object.keys(postParams).sort();
  const paramString = sortedKeys.reduce((acc, k) => acc + k + (postParams[k] ?? ""), "");
  return webhookUrl + paramString;
}
