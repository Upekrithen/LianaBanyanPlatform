/**
 * Vendor Tablet Capture — TypeScript stub (K-Vendor-Layer-Tablet-Capture / B132)
 *
 * The Liana Banyan platform's MCP server (server.ts) currently has NO direct
 * vendor SDK calls — it delegates model routing to the Python empirical layer.
 * This module is a future-proof stub that matches the Python API surface.
 *
 * When TS-side vendor calls are introduced, wire them through captureVendorCall().
 *
 * Storage: librarian-mcp/stitchpunks/data/vendor_tablets/<vendor>/<YYYY-MM-DD>.jsonl
 * Schema: identical to Python vendor_tablet_capture.py SCHEMA_VERSION 1
 */
interface CaptureUsage {
    input_tokens: number;
    output_tokens: number;
    cost_usd_industry_term_membership_orthogonal?: number;
}
interface TabletRecord {
    call_sign: string;
    ts: string;
    session_id: string;
    vendor: string;
    model: string;
    endpoint: string;
    request: Record<string, unknown>;
    response: Record<string, unknown>;
    usage: CaptureUsage | Record<string, unknown>;
    elapsed_ms: number;
    outcome: "success" | "error";
    error_class: string | null;
    schema_version: number;
}
/**
 * Wrap a vendor API call with Stone Tablet capture.
 *
 * Usage:
 *   const result = await captureVendorCall(
 *     "anthropic", "claude-haiku-4-5", "messages.create",
 *     async (recordFn) => {
 *       const response = await sdk.messages.create({ ... });
 *       recordFn(
 *         { messages: [...] },                          // request
 *         { content: [{ text: response.content[0].text }] }, // response
 *         { input_tokens: N, output_tokens: M, cost_usd_industry_term_membership_orthogonal: 0.0 }
 *       );
 *       return response;
 *     }
 *   );
 */
export declare function captureVendorCall<T>(vendor: string, model: string, endpoint: string, fn: (record: (req: Record<string, unknown>, res: Record<string, unknown>, usage: CaptureUsage) => void) => Promise<T>, sessionId?: string): Promise<T>;
/**
 * Query vendor tablets by vendor/model/since_ts/call_sign.
 * Returns matching records (most recent first, up to limit).
 */
export declare function vendorTabletQuery(opts: {
    vendor?: string;
    model?: string;
    since_ts?: string;
    call_sign?: string;
    limit?: number;
}): TabletRecord[];
export {};
