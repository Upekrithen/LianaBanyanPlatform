export declare const TEST_SESSION_PREFIX = "TEST_";
export declare const SESSION_HARD_CAP = 9999;
export declare const SESSION_ADAPTIVE_BUFFER = 200;
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
export declare function validateSessionId(session_id: string, existingSessions: SessionLike[]): GuardOutcome;
