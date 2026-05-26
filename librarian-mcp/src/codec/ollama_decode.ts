/**
 * Ollama Decode Binding — BP058 W15 V15.1
 *
 * Local LLM render at consumption boundary.
 * Ollama at IN/OUT boundaries does natural-language ↔ Speckle conversion.
 * Graceful fallback if Ollama not running.
 */

import { soccerball_decode, speckle_lookup } from "./hex_warehouse.js";

const OLLAMA_BASE = process.env.LB_OLLAMA_URL ?? "http://localhost:11434";
const DEFAULT_MODEL = "llama3.3";
const FALLBACK_MODEL = "qwen2.5:7b";

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * ollama_available — health-check Ollama endpoint.
 * Returns true if Ollama is reachable and has at least one model.
 */
export async function ollama_available(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * ollama_list_models — list available Ollama models.
 */
export async function ollama_list_models(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { models?: Array<{ name: string }> };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

// ─── Core Decode ──────────────────────────────────────────────────────────────

/**
 * ollama_decode — render a Soccerball handle as natural language via local Ollama.
 *
 * Workflow:
 *   1. Look up soccerball_id in MassCrystal → get pearls + bindings
 *   2. Build prompt: "Explain this knowledge bundle: {pearls, bindings}"
 *   3. POST to Ollama chat completions
 *   4. Return rendered natural language
 *
 * Graceful fallback: if Ollama not running, returns decoded JSON with notice.
 */
export async function ollama_decode(
  soccerball_id: string,
  model?: string
): Promise<string> {
  const decoded = soccerball_decode(soccerball_id);

  if (!decoded) {
    return JSON.stringify({
      status: "not_found",
      soccerball_id,
      note: "Soccerball not in MassCrystal substrate. Emit first via soccerball_emit.",
    }, null, 2);
  }

  const available = await ollama_available();

  if (!available) {
    return JSON.stringify({
      status: "ollama_unavailable",
      soccerball_id,
      decoded,
      note: "Ollama not available · install at ollama.ai · run: ollama serve",
      fallback_raw: decoded,
    }, null, 2);
  }

  // Select model: prefer requested → default → first available fallback
  const models = await ollama_list_models();
  const selectedModel = model
    ?? (models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : null)
    ?? (models.includes(FALLBACK_MODEL) ? FALLBACK_MODEL : null)
    ?? models[0]
    ?? DEFAULT_MODEL;

  const prompt = buildDecodePrompt(soccerball_id, decoded.pearls, decoded.bindings);

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const text = await res.text();
      return JSON.stringify({ status: "ollama_error", error: text, decoded }, null, 2);
    }

    const data = await res.json() as { message?: { content?: string } };
    return data.message?.content ?? JSON.stringify(decoded, null, 2);
  } catch (err) {
    return JSON.stringify({
      status: "ollama_error",
      error: String(err),
      decoded,
    }, null, 2);
  }
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildDecodePrompt(
  soccerball_id: string,
  pearls: string[],
  bindings: Record<string, string>
): string {
  const bindingLines = Object.entries(bindings)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  return [
    `Soccerball handle: ${soccerball_id}`,
    ``,
    `This is a Speckle Architecture knowledge bundle containing ${pearls.length} Pearl(s):`,
    pearls.map((p, i) => `  ${i + 1}. Pearl ID: ${p}`).join("\n"),
    ``,
    `Bindings:`,
    bindingLines || "  (none)",
    ``,
    `Please provide a concise natural-language explanation of what this knowledge bundle represents,`,
    `suitable for a cooperative platform member. Be brief (2-3 sentences) and helpful.`,
  ].join("\n");
}
