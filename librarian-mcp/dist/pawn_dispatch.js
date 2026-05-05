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
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, } from "fs";
import { createHash, randomUUID } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const DISPATCHES_DIR = resolve(LIBRARIAN_ROOT, "dispatches", "pawn");
const TELEMETRY_DIR = resolve(LIBRARIAN_ROOT, "telemetry");
const CONFIG_PATH = resolve(LIBRARIAN_ROOT, "config", "pawn_dispatch_caps.json");
const LEDGER_PATH = resolve(DISPATCHES_DIR, "dispatch_ledger.jsonl");
const TELEMETRY_PATH = resolve(TELEMETRY_DIR, "pawn_dispatch_costs.jsonl");
// BP025 lockbox-as-runtime-source pattern: read PERPLEXITY key from disk at
// dispatch time so rotation = file edit + zero process restart.
const LOCKBOX_NEW_KEY_PATH = resolve(LIBRARIAN_ROOT, "..", "Asteroid-ProofVault", "LockBox", "newKey.env");
function loadPerplexityKey() {
    try {
        if (existsSync(LOCKBOX_NEW_KEY_PATH)) {
            const contents = readFileSync(LOCKBOX_NEW_KEY_PATH, "utf-8");
            for (const rawLine of contents.split(/\r?\n/)) {
                if (!rawLine.includes("PERPLEXITY") || !rawLine.includes("="))
                    continue;
                const value = rawLine.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
                if (value)
                    return value;
            }
        }
    }
    catch { /* fall through to env */ }
    return process.env["PERPLEXITY_API_KEY"];
}
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const PRICING_USD_PER_1M = {
    "sonar": { input: 1.00, output: 1.00 },
    "sonar-pro": { input: 3.00, output: 15.00 },
    "sonar-reasoning": { input: 1.00, output: 5.00 },
    "sonar-reasoning-pro": { input: 2.00, output: 8.00 },
};
const DEFAULT_PRICING = { input: 3.00, output: 15.00 };
function ensureDir(p) {
    if (!existsSync(p))
        mkdirSync(p, { recursive: true });
}
function sha256(text) {
    return createHash("sha256").update(text, "utf-8").digest("hex");
}
function loadCaps() {
    try {
        return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    }
    catch {
        return {
            PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED: false,
            per_dispatch_cost_cap_usd: 1.00,
            daily_cost_cap_usd: 10.00,
            default_model: "sonar-pro",
            default_max_tokens: 4000,
        };
    }
}
function estimateCost(promptText, model, maxTokens) {
    const pricing = PRICING_USD_PER_1M[model] ?? DEFAULT_PRICING;
    const inputTokensEst = Math.ceil(promptText.length / 4);
    const outputTokensEst = maxTokens;
    return (inputTokensEst / 1_000_000) * pricing.input +
        (outputTokensEst / 1_000_000) * pricing.output;
}
function actualCost(inputTokens, outputTokens, model) {
    const pricing = PRICING_USD_PER_1M[model] ?? DEFAULT_PRICING;
    return (inputTokens / 1_000_000) * pricing.input +
        (outputTokens / 1_000_000) * pricing.output;
}
function appendLedger(record) {
    ensureDir(DISPATCHES_DIR);
    appendFileSync(LEDGER_PATH, JSON.stringify(record) + "\n", "utf-8");
}
function appendTelemetry(entry) {
    ensureDir(TELEMETRY_DIR);
    appendFileSync(TELEMETRY_PATH, JSON.stringify(entry) + "\n", "utf-8");
}
function getDailySpend() {
    if (!existsSync(TELEMETRY_PATH))
        return 0;
    const today = new Date().toISOString().slice(0, 10);
    const lines = readFileSync(TELEMETRY_PATH, "utf-8").split("\n").filter(l => l.trim());
    let spend = 0;
    for (const line of lines) {
        try {
            const entry = JSON.parse(line);
            if (entry.date === today && typeof entry.cost_actual_usd === "number") {
                spend += entry.cost_actual_usd;
            }
        }
        catch { /* skip malformed */ }
    }
    return spend;
}
function readDispatch(dispatchId) {
    const dispatchFile = resolve(DISPATCHES_DIR, `${dispatchId}.dispatch.json`);
    if (!existsSync(dispatchFile))
        return null;
    try {
        return JSON.parse(readFileSync(dispatchFile, "utf-8"));
    }
    catch {
        return null;
    }
}
function updateDispatch(record) {
    ensureDir(DISPATCHES_DIR);
    const dispatchFile = resolve(DISPATCHES_DIR, `${record.dispatch_id}.dispatch.json`);
    writeFileSync(dispatchFile, JSON.stringify(record, null, 2), "utf-8");
}
/**
 * Core dispatch function — called by the MCP tool handler.
 * Returns structured result; tool handler converts to content[].
 */
export async function runDispatchPawn(params) {
    const caps = loadCaps();
    // B.8 — Feature gate
    if (!caps.PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED) {
        return {
            dispatch_id: "",
            status: "feature_flag_off",
            error_class: "feature_flag_off",
            message: "PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false in config/pawn_dispatch_caps.json. " +
                "Founder flips to true after Phase E validation + ledger discipline confirmed.",
        };
    }
    const model = params.model ?? caps.default_model;
    const maxTokens = params.max_tokens ?? caps.default_max_tokens;
    const dispatchMetadata = params.dispatch_metadata ?? {};
    const promptHash = sha256(params.prompt_content);
    // B.3 — Pre-call cost cap check
    const costEstimate = estimateCost(params.prompt_content, model, maxTokens);
    if (costEstimate > caps.per_dispatch_cost_cap_usd) {
        return {
            dispatch_id: "",
            status: "cost_cap_exceeded",
            error_class: "cost_cap_exceeded",
            requires_founder_authorization: true,
            cost_estimate_usd: costEstimate,
            message: `Projected cost $${costEstimate.toFixed(4)} exceeds per-dispatch cap $${caps.per_dispatch_cost_cap_usd}. Founder must authorize via dispatch_metadata.founder_authorized=true override.`,
        };
    }
    // Daily cap check
    const dailySpend = getDailySpend();
    if (dailySpend + costEstimate > caps.daily_cost_cap_usd) {
        return {
            dispatch_id: "",
            status: "cost_cap_exceeded",
            error_class: "daily_cost_cap_exceeded",
            requires_founder_authorization: true,
            cost_estimate_usd: costEstimate,
            message: `Daily spend $${dailySpend.toFixed(4)} + projected $${costEstimate.toFixed(4)} would exceed daily cap $${caps.daily_cost_cap_usd}.`,
        };
    }
    // C.6 — Duplicate prompt detection (advisory, not error)
    let duplicateAdvisory;
    if (existsSync(LEDGER_PATH)) {
        const ledgerLines = readFileSync(LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
        const dup = ledgerLines.find(line => {
            try {
                const entry = JSON.parse(line);
                return entry.prompt_hash === promptHash && entry.status === "dispatched";
            }
            catch {
                return false;
            }
        });
        if (dup) {
            try {
                const dupRecord = JSON.parse(dup);
                duplicateAdvisory = `duplicate_prompt_detected: prompt_hash ${promptHash} matches dispatch_id ${dupRecord.dispatch_id} (${dupRecord.dispatch_timestamp}). Proceeding anyway — re-validation is valid.`;
            }
            catch { /* skip */ }
        }
    }
    const dispatchId = randomUUID();
    const dispatchTimestamp = new Date().toISOString();
    const record = {
        dispatch_id: dispatchId,
        prompt_hash: promptHash,
        prompt_artifact_path: params.prompt_artifact_path ?? null,
        expected_return_path: params.expected_return_path,
        model,
        max_tokens: maxTokens,
        dispatch_metadata: dispatchMetadata,
        dispatch_timestamp: dispatchTimestamp,
        status: "dispatched",
        response_hash: null,
        cost_estimate_usd: costEstimate,
        cost_actual_usd: null,
        return_timestamp: null,
        error_class: null,
        attempt_log: [`[${dispatchTimestamp}] dispatch_initiated model=${model} max_tokens=${maxTokens} prompt_hash=${promptHash}`],
    };
    ensureDir(DISPATCHES_DIR);
    updateDispatch(record);
    // B.2 — API call with B.5 retry logic
    // BP025: read from lockbox newKey.env at dispatch time (rotation = file edit, zero restart)
    const apiKey = loadPerplexityKey();
    if (!apiKey) {
        record.status = "error";
        record.error_class = "missing_api_key";
        record.attempt_log.push(`[${new Date().toISOString()}] ERROR: PERPLEXITY_API_KEY not found in lockbox newKey.env or process.env`);
        updateDispatch(record);
        appendLedger(record);
        return { dispatch_id: dispatchId, status: "error", error_class: "missing_api_key", message: "PERPLEXITY_API_KEY not found. Add a line containing 'PERPLEXITY' substring with '=value' to Asteroid-ProofVault/LockBox/newKey.env." };
    }
    const requestBody = {
        model,
        max_tokens: maxTokens,
        messages: [
            {
                role: "user",
                content: params.prompt_content,
            },
        ],
    };
    let responseText = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let costActual = 0;
    let lastErrorClass = "";
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const attemptTs = new Date().toISOString();
        record.attempt_log.push(`[${attemptTs}] attempt ${attempt}/${maxRetries}`);
        updateDispatch(record);
        try {
            const response = await fetch(PERPLEXITY_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (response.status === 401) {
                lastErrorClass = "quota_exhausted";
                record.attempt_log.push(`[${new Date().toISOString()}] HTTP 401 — quota exhausted`);
                updateDispatch(record);
                record.status = "error";
                record.error_class = "quota_exhausted";
                updateDispatch(record);
                appendLedger(record);
                return {
                    dispatch_id: dispatchId,
                    status: "error",
                    error_class: "quota_exhausted",
                    requires_founder_credit_topup: true,
                    message: "Perplexity API returned 401 — account quota exhausted. Top up at perplexity.ai/settings/api.",
                };
            }
            if (response.status === 429) {
                const retryAfterHeader = response.headers.get("Retry-After");
                let waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 30_000);
                if (retryAfterHeader) {
                    const parsed = parseFloat(retryAfterHeader);
                    if (!isNaN(parsed))
                        waitMs = parsed * 1000;
                }
                lastErrorClass = "rate_limited";
                record.attempt_log.push(`[${new Date().toISOString()}] HTTP 429 — rate limited, waiting ${waitMs}ms`);
                updateDispatch(record);
                await new Promise(res => setTimeout(res, waitMs));
                continue;
            }
            if (!response.ok) {
                const errBody = await response.text().catch(() => "(unreadable)");
                lastErrorClass = `http_${response.status}`;
                record.attempt_log.push(`[${new Date().toISOString()}] HTTP ${response.status} — ${errBody.slice(0, 200)}`);
                updateDispatch(record);
                if (attempt < maxRetries) {
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
                    continue;
                }
                break;
            }
            // Parse successful response
            let parsed;
            try {
                parsed = await response.json();
            }
            catch {
                lastErrorClass = "malformed_response";
                record.attempt_log.push(`[${new Date().toISOString()}] malformed JSON response`);
                updateDispatch(record);
                break;
            }
            const choice = parsed.choices?.[0];
            if (!choice?.message?.content) {
                lastErrorClass = "malformed_response";
                record.attempt_log.push(`[${new Date().toISOString()}] empty content in response`);
                updateDispatch(record);
                break;
            }
            responseText = choice.message.content;
            inputTokens = parsed.usage?.prompt_tokens ?? 0;
            outputTokens = parsed.usage?.completion_tokens ?? 0;
            costActual = actualCost(inputTokens, outputTokens, model);
            lastErrorClass = "";
            break;
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            lastErrorClass = "network_failure";
            record.attempt_log.push(`[${new Date().toISOString()}] network error attempt ${attempt}: ${errMsg.slice(0, 200)}`);
            updateDispatch(record);
            if (attempt < maxRetries) {
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
                continue;
            }
        }
    }
    if (!responseText) {
        record.status = "error";
        record.error_class = lastErrorClass || "unknown_error";
        record.cost_actual_usd = 0;
        updateDispatch(record);
        appendLedger(record);
        appendTelemetry({
            dispatch_id: dispatchId,
            date: new Date().toISOString().slice(0, 10),
            model,
            cost_actual_usd: 0,
            status: "error",
            error_class: record.error_class,
            dispatch_timestamp: dispatchTimestamp,
        });
        return {
            dispatch_id: dispatchId,
            status: "error",
            error_class: record.error_class,
            message: `All ${maxRetries} retries exhausted. Last error class: ${record.error_class}. See dispatch record ${dispatchId}.dispatch.json.`,
        };
    }
    // Success — write return file + finalize records
    const returnTimestamp = new Date().toISOString();
    const responseHash = sha256(responseText);
    // Write to expected_return_path (resolve relative to workspace root if not absolute)
    try {
        const workspaceRoot = resolve(LIBRARIAN_ROOT, "..");
        const returnPath = params.expected_return_path.startsWith("/") || params.expected_return_path.includes(":")
            ? params.expected_return_path
            : resolve(workspaceRoot, params.expected_return_path);
        const returnDir = dirname(returnPath);
        ensureDir(returnDir);
        writeFileSync(returnPath, responseText, "utf-8");
        record.attempt_log.push(`[${returnTimestamp}] return written to ${returnPath}`);
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        record.attempt_log.push(`[${returnTimestamp}] WARNING: failed to write return file: ${errMsg.slice(0, 200)}`);
    }
    // Write return JSON alongside dispatch JSON
    const returnJsonPath = resolve(DISPATCHES_DIR, `${dispatchId}.return.json`);
    writeFileSync(returnJsonPath, JSON.stringify({
        dispatch_id: dispatchId,
        response_text: responseText,
        response_hash: responseHash,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_actual_usd: costActual,
        return_timestamp: returnTimestamp,
    }, null, 2), "utf-8");
    record.status = "dispatched";
    record.response_hash = responseHash;
    record.cost_actual_usd = costActual;
    record.return_timestamp = returnTimestamp;
    updateDispatch(record);
    appendLedger(record);
    appendTelemetry({
        dispatch_id: dispatchId,
        date: new Date().toISOString().slice(0, 10),
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_actual_usd: costActual,
        status: "dispatched",
        dispatch_timestamp: dispatchTimestamp,
        return_timestamp: returnTimestamp,
    });
    const result = {
        dispatch_id: dispatchId,
        status: "dispatched",
        cost_estimate_usd: costEstimate,
        cost_actual_usd: costActual,
        message: `Dispatch complete. Return written to ${params.expected_return_path}. Cost: $${costActual.toFixed(6)}.`,
    };
    if (duplicateAdvisory) {
        result.duplicate_advisory = duplicateAdvisory;
    }
    return result;
}
/**
 * Check status of a dispatch by dispatch_id.
 */
export function getDispatchStatus(dispatchId) {
    return readDispatch(dispatchId);
}
/**
 * Cancel a pending dispatch (marks as cancelled; does not abort in-flight HTTP).
 */
export function cancelDispatch(dispatchId) {
    const record = readDispatch(dispatchId);
    if (!record) {
        return { success: false, message: `No dispatch found for id ${dispatchId}` };
    }
    if (record.status !== "dispatched") {
        return { success: false, message: `Dispatch ${dispatchId} has status ${record.status} — cannot cancel` };
    }
    record.status = "cancelled";
    record.attempt_log.push(`[${new Date().toISOString()}] CANCELLED by operator`);
    updateDispatch(record);
    appendLedger(record);
    return { success: true, message: `Dispatch ${dispatchId} marked as cancelled.` };
}
/**
 * List recent dispatch records from the ledger.
 */
export function listRecentDispatches(last_n = 20) {
    if (!existsSync(LEDGER_PATH))
        return [];
    const lines = readFileSync(LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
    const recent = lines.slice(-last_n);
    const results = [];
    for (const line of recent) {
        try {
            results.push(JSON.parse(line));
        }
        catch { /* skip */ }
    }
    return results;
}
//# sourceMappingURL=pawn_dispatch.js.map
