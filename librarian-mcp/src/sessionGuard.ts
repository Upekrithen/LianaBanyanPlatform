// sessionGuard.ts — K460: input validation for update_session MCP tool
//
// Guard design: combination approach
//   1. TEST_ prefix escape hatch — bypasses all checks; sanctioned for test use only
//   2. Idempotence — existing IDs skip the guard (they passed once or predate it)
//   3. Hard cap — rejects numeric part > SESSION_HARD_CAP (catches extreme injections
//      even on a fresh/empty store where no currentMax is available)
//   4. Adaptive buffer — rejects if num > currentPrefixMax + SESSION_ADAPTIVE_BUFFER
//      (catches plausible-looking but implausibly-high IDs relative to real history)
//
// Only canonical-format IDs (single uppercase letter + digits, e.g., K460) are
// subject to rules 3 and 4. Compound / legacy IDs (K394-K395, B-session-note, etc.)
// pass through unchanged.
//
// Rationale: the hard cap alone would miss e.g. K600 when currentMax is K100 and
// the buffer catches it. The buffer alone would fail on an empty store. Both are
// needed. The generous buffer (200) accommodates batch numbering and legitimate jumps.

export const TEST_SESSION_PREFIX = "TEST_";
export const SESSION_HARD_CAP = 9999;
export const SESSION_ADAPTIVE_BUFFER = 200;

export interface SessionLike {
  id: string;
}

export interface GuardResult {
  rejected: false;
}

export interface GuardRejection {
  rejected: true;
  offending_id: string;
  rule_fired: "hard_cap" | "adaptive_buffer";
  message: string;
  how_to_proceed: string;
}

export type GuardOutcome = GuardResult | GuardRejection;

/**
 * Validate a proposed session_id before writing to sessions.json.
 *
 * Returns { rejected: false } when the ID is acceptable.
 * Returns { rejected: true, ... } with structured error details when not.
 */
export function validateSessionId(
  session_id: string,
  existingSessions: SessionLike[],
): GuardOutcome {
  // Rule 1: TEST_ prefix escape hatch
  if (session_id.startsWith(TEST_SESSION_PREFIX)) {
    return { rejected: false };
  }

  // Only apply structural guard to canonical format: single uppercase letter + digits
  const prefixMatch = session_id.match(/^([A-Z])(\d+)$/);
  if (!prefixMatch) {
    return { rejected: false };
  }

  const prefix = prefixMatch[1];
  const num = parseInt(prefixMatch[2], 10);

  // Rule 2: Idempotence — re-recording an existing session ID skips the guard
  const alreadyExists = existingSessions.some(s => s.id === session_id);
  if (alreadyExists) {
    return { rejected: false };
  }

  const escapeTip = `To record a high-numbered test session, prefix it with '${TEST_SESSION_PREFIX}' (e.g., '${TEST_SESSION_PREFIX}${session_id}'). For a legitimate production jump, contact Bishop to adjust the threshold.`;

  // Rule 3: Hard cap
  if (num > SESSION_HARD_CAP) {
    return {
      rejected: true,
      offending_id: session_id,
      rule_fired: "hard_cap",
      message: `Session ID '${session_id}' rejected: numeric component ${num} exceeds hard cap ${SESSION_HARD_CAP}.`,
      how_to_proceed: escapeTip,
    };
  }

  // Rule 4: Adaptive buffer — find current max for this prefix
  const currentMax = existingSessions
    .map(s => {
      const m = (s.id ?? "").match(/^([A-Z])(\d+)$/);
      return m && m[1] === prefix ? parseInt(m[2], 10) : null;
    })
    .filter((n): n is number => n !== null)
    .reduce((max, n) => Math.max(max, n), 0);

  if (currentMax > 0 && num > currentMax + SESSION_ADAPTIVE_BUFFER) {
    return {
      rejected: true,
      offending_id: session_id,
      rule_fired: "adaptive_buffer",
      message: `Session ID '${session_id}' rejected: ${num} exceeds current max for prefix '${prefix}' (${currentMax}) by more than the adaptive buffer (${SESSION_ADAPTIVE_BUFFER}).`,
      how_to_proceed: escapeTip,
    };
  }

  return { rejected: false };
}
