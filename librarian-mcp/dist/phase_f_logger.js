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
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CALL_LOG_PATH = path.join(__dirname, "..", "stitchpunks", "wrasse", "phase_f_call_log.jsonl");
const CONFIG_PATH = path.join(__dirname, "..", "config", "wrasse.json");
// ─── Session state ────────────────────────────────────────────────────────────
let _sessionId = "K-unknown";
let _wrasseMode = "off";
let _enabled = false;
export function setPhaseFSession(sessionId, wrasseMode) {
    _sessionId = sessionId;
    _wrasseMode = wrasseMode;
    _enabled = true;
}
export function disablePhaseF() {
    _enabled = false;
}
function isLoggingEnabled() {
    if (!_enabled)
        return false;
    try {
        const raw = fs.readFileSync(CONFIG_PATH, "utf8");
        const cfg = JSON.parse(raw);
        return cfg.PHASE_F_LOGGING_ENABLED === true;
    }
    catch {
        return false;
    }
}
function extractResponseChars(result) {
    if (!result?.content)
        return 0;
    return result.content.reduce((sum, c) => sum + (c.text?.length ?? 0), 0);
}
// ─── Append-only call log ─────────────────────────────────────────────────────
function appendCallLog(record) {
    try {
        const line = JSON.stringify(record) + "\n";
        const fd = fs.openSync(CALL_LOG_PATH, "a");
        try {
            fs.writeSync(fd, line);
            fs.fdatasyncSync(fd);
        }
        finally {
            fs.closeSync(fd);
        }
    }
    catch (e) {
        process.stderr.write(`[phase_f_logger] append error: ${e}\n`);
    }
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Log a tool response. Call immediately after any MCP tool handler returns.
 * No-op when logging is disabled.
 */
export function logToolResponse(toolName, result) {
    if (!isLoggingEnabled())
        return;
    try {
        const chars = extractResponseChars(result);
        const record = {
            ts: new Date().toISOString(),
            tool: toolName,
            source: "mcp_server",
            response_chars: chars,
            response_tokens_estimated: Math.ceil(chars / 4),
            session_id: _sessionId,
            wrasse_mode: _wrasseMode,
        };
        appendCallLog(record);
    }
    catch { /* silent */ }
}
/**
 * Wrap a tool handler to auto-log its response.
 * Usage: registerTool("my_tool", desc, schema, wrapWithPhaseF("my_tool", handler))
 */
export function wrapWithPhaseF(toolName, handler) {
    return async (...args) => {
        const result = await handler(...args);
        logToolResponse(toolName, result);
        return result;
    };
}
//# sourceMappingURL=phase_f_logger.js.map
