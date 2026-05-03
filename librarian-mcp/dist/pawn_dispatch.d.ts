/**
 * K532 — Pawn-via-Librarian Dispatch Channel
 *
 * Architecture A: MCP-tool-direct-Perplexity-API.
 * Sends prompt content to Perplexity API (sonar-pro), writes return to
 * expected_return_path, ledgers every dispatch for audit and cost accounting.
 *
 * Bishop calls dispatch_pawn(). Tool inlines prompt content — no local file
 * paths ever reach Perplexity's browser-sandboxed environment. Closes the
 * ERR_FILE_NOT_FOUND class failure permanently.
 *
 * Feature gate: PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false ships in
 * config/pawn_dispatch_caps.json. Founder flips to true only after Phase E
 * validation lands and ledger discipline is confirmed.
 */
export type DispatchStatus = "dispatched" | "cancelled" | "error";
export interface DispatchCaps {
    PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED: boolean;
    per_dispatch_cost_cap_usd: number;
    daily_cost_cap_usd: number;
    default_model: string;
    default_max_tokens: number;
}
export interface DispatchRecord {
    dispatch_id: string;
    prompt_hash: string;
    prompt_artifact_path: string | null;
    expected_return_path: string;
    model: string;
    max_tokens: number;
    dispatch_metadata: Record<string, unknown>;
    dispatch_timestamp: string;
    status: DispatchStatus;
    response_hash: string | null;
    cost_estimate_usd: number;
    cost_actual_usd: number | null;
    return_timestamp: string | null;
    error_class: string | null;
    attempt_log: string[];
}
export interface PawnDispatchResult {
    dispatch_id: string;
    status: DispatchStatus | "feature_flag_off" | "cost_cap_exceeded" | "duplicate_prompt_detected";
    error_class?: string;
    requires_founder_authorization?: boolean;
    requires_founder_credit_topup?: boolean;
    cost_estimate_usd?: number;
    cost_actual_usd?: number;
    message?: string;
    duplicate_advisory?: string;
}
/**
 * Core dispatch function — called by the MCP tool handler.
 * Returns structured result; tool handler converts to content[].
 */
export declare function runDispatchPawn(params: {
    prompt_content: string;
    prompt_artifact_path?: string;
    expected_return_path: string;
    model?: string;
    max_tokens?: number;
    dispatch_metadata?: Record<string, unknown>;
}): Promise<PawnDispatchResult>;
/**
 * Check status of a dispatch by dispatch_id.
 */
export declare function getDispatchStatus(dispatchId: string): DispatchRecord | null;
/**
 * Cancel a pending dispatch (marks as cancelled; does not abort in-flight HTTP).
 */
export declare function cancelDispatch(dispatchId: string): {
    success: boolean;
    message: string;
};
/**
 * List recent dispatch records from the ledger.
 */
export declare function listRecentDispatches(last_n?: number): DispatchRecord[];
