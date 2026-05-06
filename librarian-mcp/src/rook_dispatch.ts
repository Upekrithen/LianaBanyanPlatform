/**
 * Bushel 36 Phase 2 (BP025) — Rook Dispatch Mechanism
 *
 * Dispatches multimodal prompts to Gemini (Google AI) via the @google/generative-ai SDK.
 * Writes ROOK_RETURN_*.md to BISHOP_DROPZONE/02_RookReturns/ and emits a pheromone
 * record to the substrate via the Phase 1 indexer pattern.
 *
 * Key safety rules:
 *   - GEMINI_API_KEY is read from process.env — never logged, never written to disk.
 *   - Daily spend is gated by config/rook_dispatch_caps.json (default $20/day).
 *   - All writes are append-only or idempotent.
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { emitPheromone } from "./scribes/pheromone.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LIBRARIAN_ROOT = resolve(__dirname, "..");
const PLATFORM_ROOT = resolve(LIBRARIAN_ROOT, "..");
const BISHOP_DROPZONE = resolve(PLATFORM_ROOT, "BISHOP_DROPZONE");
const ROOK_RETURNS_DIR = resolve(BISHOP_DROPZONE, "02_RookReturns");
const CAPS_PATH = resolve(LIBRARIAN_ROOT, "config", "rook_dispatch_caps.json");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MultimodalInput {
  type: "pdf" | "image" | "text";
  path: string;
}

export interface RookDispatchParams {
  prompt_content: string;
  expected_return_path?: string;
  multimodal_inputs?: MultimodalInput[];
  model?: string;
  max_tokens?: number;
}

export interface RookDispatchResult {
  status: "dispatched" | "error" | "capped";
  rook_return_path: string;
  dispatch_id: string;
  model_used: string;
  tokens_used?: number;
  cost_estimate_usd?: number;
  message?: string;
}

interface RookCaps {
  max_cost_per_dispatch_usd: number;
  max_cost_per_day_usd: number;
  daily_totals: Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function loadCaps(): RookCaps {
  try {
    return JSON.parse(readFileSync(CAPS_PATH, "utf-8")) as RookCaps;
  } catch {
    return {
      max_cost_per_dispatch_usd: 1.0,
      max_cost_per_day_usd: 20.0,
      daily_totals: {},
    };
  }
}

function saveCaps(caps: RookCaps): void {
  writeFileSync(CAPS_PATH, JSON.stringify(caps, null, 2), "utf-8");
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyTotal(caps: RookCaps): number {
  return caps.daily_totals[todayKey()] ?? 0;
}

function addDailyTotal(caps: RookCaps, amount: number): void {
  const key = todayKey();
  caps.daily_totals[key] = (caps.daily_totals[key] ?? 0) + amount;
  saveCaps(caps);
}

/** Rough cost estimate for Gemini 2.0 Flash (per Google pricing as of 2026). */
function estimateCost(promptLen: number, maxTokens: number): number {
  const inputTokensEst = Math.ceil(promptLen / 4);
  const inputCostPer1M = 0.075;
  const outputCostPer1M = 0.30;
  return (inputTokensEst / 1_000_000) * inputCostPer1M +
         (maxTokens / 1_000_000) * outputCostPer1M;
}

function mimeTypeFor(type: "pdf" | "image" | "text", filePath: string): string {
  if (type === "pdf") return "application/pdf";
  if (type === "text") return "text/plain";
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp",
  };
  return map[ext] ?? "image/jpeg";
}

// ─── Core dispatch ────────────────────────────────────────────────────────────

export async function runDispatchRook(
  params: RookDispatchParams
): Promise<RookDispatchResult> {
  const dispatchId = randomUUID();
  const modelName = params.model ?? "gemini-2.5-flash";
  const maxTokens = params.max_tokens ?? 2048;

  // 1. API key gate
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return {
      status: "error",
      rook_return_path: "",
      dispatch_id: dispatchId,
      model_used: modelName,
      message: "GEMINI_API_KEY not found in process.env. Ensure it is set before dispatching.",
    };
  }

  // 2. Cost cap gate
  const caps = loadCaps();
  const costEstimate = estimateCost(
    params.prompt_content.length + (params.multimodal_inputs?.length ?? 0) * 2000,
    maxTokens
  );
  const dailyTotal = getDailyTotal(caps);

  if (dailyTotal + costEstimate > caps.max_cost_per_day_usd) {
    return {
      status: "capped",
      rook_return_path: "",
      dispatch_id: dispatchId,
      model_used: modelName,
      cost_estimate_usd: costEstimate,
      message: `Daily spend $${dailyTotal.toFixed(4)} + estimated $${costEstimate.toFixed(4)} would exceed daily cap $${caps.max_cost_per_day_usd}. Contact Founder to reset.`,
    };
  }

  // 3. Build Gemini prompt parts
  const parts: Part[] = [];

  // Attach multimodal inputs first
  if (params.multimodal_inputs && params.multimodal_inputs.length > 0) {
    for (const input of params.multimodal_inputs) {
      try {
        if (input.type === "text") {
          const textContent = readFileSync(input.path, "utf-8");
          parts.push({ text: `[Attached text: ${input.path}]\n${textContent}` });
        } else {
          // PDF or image — base64 encode as InlineDataPart
          const fileData = readFileSync(input.path);
          const base64Data = fileData.toString("base64");
          parts.push({
            inlineData: {
              mimeType: mimeTypeFor(input.type, input.path),
              data: base64Data,
            },
          });
        }
      } catch (err) {
        parts.push({ text: `[Warning: could not load attachment ${input.path}: ${String(err)}]` });
      }
    }
  }

  // Main prompt text
  parts.push({ text: params.prompt_content });

  // 4. Call Gemini
  let responseText: string;
  let tokensUsed: number | undefined;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: modelName });
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: maxTokens },
    });
    const response = result.response;
    responseText = response.text();
    const usageMeta = response.usageMetadata;
    if (usageMeta) {
      tokensUsed = (usageMeta.promptTokenCount ?? 0) + (usageMeta.candidatesTokenCount ?? 0);
    }
  } catch (err) {
    return {
      status: "error",
      rook_return_path: "",
      dispatch_id: dispatchId,
      model_used: modelName,
      cost_estimate_usd: costEstimate,
      message: `Gemini API error: ${String(err)}`,
    };
  }

  // 5. Write return file
  ensureDir(ROOK_RETURNS_DIR);
  const returnFileName = params.expected_return_path
    ? `ROOK_RETURN_${dispatchId}_${params.expected_return_path.replace(/[^a-z0-9_.-]/gi, "_")}.md`
    : `ROOK_RETURN_${dispatchId}.md`;
  const returnFilePath = resolve(ROOK_RETURNS_DIR, returnFileName);
  const dispatchedAt = new Date().toISOString();
  const promptExcerpt = params.prompt_content.slice(0, 200);

  const returnContent = `# Rook Return — ${dispatchId}
**Model**: ${modelName}
**Dispatched**: ${dispatchedAt}
**Prompt**: ${promptExcerpt}${params.prompt_content.length > 200 ? "…" : ""}

---

${responseText}
`;

  writeFileSync(returnFilePath, returnContent, "utf-8");

  // 6. Emit pheromone record to substrate (reuse Phase 1 pattern)
  try {
    emitPheromone(
      "RookReturn",
      dispatchId,
      responseText,
      {
        cathedral: "rook",
        decayConstantDays: 21,
        synthesisClass: "rook_gemini_return",
        flavorClass: {
          cognition: "multimodal-receipt",
          audience: "rook-research",
        },
      }
    );
  } catch { /* non-fatal — pheromone emission is best-effort */ }

  // 7. Update daily cost ledger
  const actualCost = tokensUsed
    ? (tokensUsed / 1_000_000) * 0.30
    : costEstimate;
  addDailyTotal(caps, actualCost);

  return {
    status: "dispatched",
    rook_return_path: returnFilePath,
    dispatch_id: dispatchId,
    model_used: modelName,
    tokens_used: tokensUsed,
    cost_estimate_usd: actualCost,
  };
}
