/**
 * Stitchpunk — Ollama Insert Swap Mechanism
 * Provides the swap interface: infer(prompt, schema) with hot-swap capability.
 * G1: swap completes in < 5sec without process restart.
 * K28 §6 — Bushel 72 BP032.
 */

import type { StitchpunkIdentity, StitchpunkOutput } from "./types.js";

export const OLLAMA_BASE_URL = "http://127.0.0.1:11434";

export interface OllamaInsert {
  model_tag: string;
  active: boolean;
}

let _currentInsert: OllamaInsert = {
  model_tag: "llama3.1:8b-instruct-q4_K_M",
  active: true,
};

/**
 * Swap the current Ollama insert.
 * Returns elapsed ms — must be < 5000 to pass G1.
 */
export async function swapInsert(newModelTag: string): Promise<number> {
  const swapStart = Date.now();
  // Validate model is available by checking Ollama tags endpoint
  const resp = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(4000) });
  if (!resp.ok) throw new Error(`Ollama unreachable: ${resp.status}`);
  const tags = await resp.json() as { models: Array<{ name: string }> };
  const available = tags.models.map((m) => m.name);
  const found = available.some(n => n === newModelTag || n.startsWith(newModelTag.split(":")[0]));
  if (!found) throw new Error(`Model ${newModelTag} not found. Available: ${available.join(", ")}`);
  _currentInsert = { model_tag: newModelTag, active: true };
  return Date.now() - swapStart;
}

export function currentInsert(): OllamaInsert {
  return { ..._currentInsert };
}

/**
 * Run inference through the current Ollama insert with Stitchpunk identity wrapping.
 * Returns structured StitchpunkOutput parsed from model response.
 */
export async function infer(
  identity: StitchpunkIdentity,
  userInput: string,
  timeoutMs = 30000,
): Promise<{ output: StitchpunkOutput; inference_ms: number }> {
  const inferStart = Date.now();
  const model = _currentInsert.model_tag;

  const systemPrompt = identity.persona_prompt;
  const userPrompt = [
    `INPUT: ${userInput}`,
    "",
    "Respond ONLY with a JSON object matching the required schema. No markdown, no extra text.",
  ].join("\n");

  const body = JSON.stringify({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: false,
    options: { temperature: 0, seed: 42 },
  });

  let rawText = "";
  try {
    const resp = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) throw new Error(`Ollama /api/chat returned ${resp.status}`);
    const data = await resp.json() as { message?: { content: string } };
    rawText = data.message?.content ?? "";
  } catch (e) {
    rawText = `{"error": "${(e as Error).message}"}`;
  }

  const output = parseOutput(identity, rawText);
  return { output, inference_ms: Date.now() - inferStart };
}

/** Parse and validate Ollama response into StitchpunkOutput. */
function parseOutput(identity: StitchpunkIdentity, rawText: string): StitchpunkOutput {
  let parsed: Partial<StitchpunkOutput> = {};
  try {
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
    }
  } catch { /* keep parsed as empty */ }

  // Detect trigger words (case-insensitive, anywhere in output or parsed JSON)
  const searchText = (rawText + JSON.stringify(parsed)).toLowerCase();
  const triggerWords: string[] = [];
  for (const t of identity.trigger_vocabulary) {
    if (searchText.includes(t.toLowerCase())) {
      triggerWords.push(t);
    }
  }

  return {
    trigger_words: (parsed.trigger_words ?? triggerWords),
    summary: (parsed.summary ?? rawText.slice(0, 200)).slice(0, 200),
    schema_version: parsed.schema_version ?? identity.output_schema_version,
    stitchpunk_id: parsed.stitchpunk_id ?? identity.id,
    citations: parsed.citations ?? [],
    semantic_claims: parsed.semantic_claims ?? [],
    raw_text: rawText,
  };
}
