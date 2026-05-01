/**
 * sessionId.ts — canonical session-ID validation (KN076 / OG-017 fix)
 * ======================================================================
 * Single source of truth for the session-ID regex used across all Librarian
 * MCP tools (log_tidbit, add_gotcha, scribe_log, etc.).
 *
 * History:
 *   Original regex /^[BKP]\d{3}$/ — single-letter prefix + exactly 3 digits.
 *   This rejected BP-prefix session IDs (e.g. BP009) that emerged in the
 *   pod-era naming scheme (KN076 / B009 empirical discovery).
 *
 *   KN076 fix: unified regex accepts both legacy (B, K, P, R) and pod-era
 *   compound prefixes (BP, KP, KN, PP, RR) followed by one or more digits.
 *   Note: digit count is unbounded (\d+) to accommodate future numbering.
 */

/** Canonical session-ID regex — all Librarian tools must use this. */
export const SESSION_ID_REGEX = /^(BP|KP|KN|PP|RR|B|K|P|R)\d+$/;

/** Zod .describe() string for session fields. */
export const SESSION_ID_DESCRIPTION =
  "Session id, e.g. B116, K436, BP009, KN076. " +
  "Pod-era compound prefixes (BP, KP, KN, PP, RR) accepted per KN076/BP009 fix.";

/**
 * Parse and validate a session ID string.
 * Returns the ID unchanged if valid; throws with a helpful message if not.
 */
export function parseSessionId(raw: string): string {
  if (!SESSION_ID_REGEX.test(raw)) {
    throw new Error(
      `Invalid session ID '${raw}'. ` +
        "Expected format: B###, BP###, K###, KN###, KP###, P###, PP###, R###, RR### " +
        "(uppercase prefix + one or more digits).",
    );
  }
  return raw;
}
