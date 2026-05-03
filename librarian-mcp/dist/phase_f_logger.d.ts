/**
 * Phase F MCP Response Logger — K551/B133
 *
 * Middleware wrapper for MCP tool responses. Logs every tool response's
 * char count + tool name + timestamp + session_id to phase_f_call_log.jsonl.
 *
 * Used for Phase F substrate instrumentation: measuring real token cost at
 * MCP tool call sites rather than via prompt-file proxy (which structurally
 * under-states due to C-3 confound).
 *
 * Stone Tablet Imperative: append-only writes, fsync after each record.
 * Brick Wall: never throws to caller; log errors are silent (logged to stderr).
 *
 * Usage in server.ts:
 *   import { logToolResponse, setPhaseFSession } from "./phase_f_logger.js";
 *   // At session start:
 *   setPhaseFSession("K551", "off"); // wrasse_mode: "off" or "on"
 *   // Wrap any tool response:
 *   const result = await someToolHandler(args);
 *   logToolResponse("tool_name", result);
 *   return result;
 */
export declare function setPhaseFSession(sessionId: string, wrasseMode: "on" | "off"): void;
export declare function disablePhaseF(): void;
type McpContent = {
    type: string;
    text?: string;
};
type McpResult = {
    content?: McpContent[];
};
/**
 * Log a tool response. Call immediately after any MCP tool handler returns.
 * No-op when logging is disabled.
 */
export declare function logToolResponse(toolName: string, result: McpResult): void;
/**
 * Wrap a tool handler to auto-log its response.
 * Usage: registerTool("my_tool", desc, schema, wrapWithPhaseF("my_tool", handler))
 */
export declare function wrapWithPhaseF<T extends McpResult>(toolName: string, handler: (...args: unknown[]) => Promise<T>): (...args: unknown[]) => Promise<T>;
export {};
