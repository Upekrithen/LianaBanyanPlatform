/**
 * BP028 — AutoBaton task-class router + MAD-data telemetry.
 * Single entry point: autobatonDispatch(). See PROMPT_KNIGHT_AUTOBATON...BP028.md.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runDispatchPawn } from "./pawn_dispatch.js";
import { runDispatchRook } from "./rook_dispatch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const PLATFORM_ROOT = resolve(LIBRARIAN_ROOT, "..");
const BISHOP_DROPZONE = resolve(PLATFORM_ROOT, "BISHOP_DROPZONE");

export const AUTOBATON_TASK_CLASSES = [
  "synthesis",
  "coordination",
  "edit_precision",
  "flagship_deliberation",
  "research_external",
  "cross_domain_synthesis",
] as const;

export type AutobatonTaskClass = (typeof AUTOBATON_TASK_CLASSES)[number];

export type ModelRoutedReason =
  | "default"
  | "explicit"
  | "override"
  | "ab_candidate"
  | "ab_baseline";

export interface MadDataRow {
  ts: string;
  session_id: string;
  dispatch_id: string;
  task_class: string;
  model_routed: string;
  model_routed_reason: ModelRoutedReason;
  cost_estimate_usd: number;
  duration_ms: number;
  tokens_in: number;
  tokens_out: number;
  founder_grade: null;
  substrate_context_loaded: boolean;
  substrate_eblets_pre_injected: string[];
  ab_test_arm?: "candidate" | "baseline";
}

export function madDataJsonlPath(): string {
  const base =
    process.env["LB_SESSION_DIR"]?.trim() || resolve(homedir(), ".lb-session");
  return resolve(base, "mad_data.jsonl");
}

export function appendMadDataRow(row: MadDataRow): void {
  try {
    const p = madDataJsonlPath();
    mkdirSync(dirname(p), { recursive: true });
    appendFileSync(p, JSON.stringify(row) + "\n", "utf-8");
  } catch {
    /* non-fatal */
  }
}

function estimateAnthropicCostUsd(model: string, tokensIn: number, tokensOut: number): number {
  const m = model.toLowerCase();
  let inK = 0.003;
  let outK = 0.015;
  if (m.includes("haiku")) {
    inK = 0.0008;
    outK = 0.004;
  } else if (m.includes("opus")) {
    inK = 0.015;
    outK = 0.075;
  }
  return (tokensIn / 1000) * inK + (tokensOut / 1000) * outK;
}

/** Heuristic when task_class is omitted. */
export function inferTaskClassFromPrompt(prompt: string): AutobatonTaskClass {
  const q = prompt.trim();
  const wc = q.split(/\s+/).filter(Boolean).length;
  const lower = q.toLowerCase();

  if (/\b(cite|sources?|perplexity|web search|current events|news today|look up online)\b/i.test(q)) {
    return "research_external";
  }
  if (
    /\b(cross-domain|patent\s+and\s+code|legal\s+and\s+technical|multimodal\s+synthesis)\b/i.test(q)
  ) {
    return "cross_domain_synthesis";
  }
  if (/\b(deliberat|verdict|star chamber|multi-stakeholder|adjudic)\b/i.test(q)) {
    return "flagship_deliberation";
  }
  if (/\b(exact (edit|replace)|diff patch|line \d+|character-precision|typos? in)\b/i.test(q)) {
    return "edit_precision";
  }
  if (/\b(coordinate|schedule|delegate|sync with|standing meeting|roadmap checkpoint)\b/i.test(q)) {
    return "coordination";
  }
  if (wc >= 35 || /\b(synthesize|integrate|draft|compose|summarize|seg |eblet|canon)\b/i.test(lower)) {
    return "synthesis";
  }
  return "coordination";
}

export function resolveTaskClass(
  explicit: AutobatonTaskClass | undefined,
  prompt: string,
): AutobatonTaskClass {
  if (explicit && (AUTOBATON_TASK_CLASSES as readonly string[]).includes(explicit)) {
    return explicit;
  }
  return inferTaskClassFromPrompt(prompt);
}

export interface RoutePlan {
  kind: "anthropic" | "pawn" | "rook";
  model: string;
}

export function planRouteForTaskClass(taskClass: AutobatonTaskClass): RoutePlan {
  switch (taskClass) {
    case "synthesis":
      return { kind: "anthropic", model: "claude-haiku-4-5-20251001" };
    case "coordination":
    case "edit_precision":
      return { kind: "anthropic", model: "claude-sonnet-4-6" };
    case "flagship_deliberation":
      return { kind: "anthropic", model: "claude-opus-4-7" };
    case "research_external":
      return { kind: "pawn", model: "sonar-pro" };
    case "cross_domain_synthesis":
      return { kind: "rook", model: "gemini-3.1-pro-preview" };
  }
}

export function stripModelIdentifiersForBlindGrade(text: string): string {
  return text
    .replace(/\bclaude-[a-z0-9._-]+\b/gi, "[model]")
    .replace(/\bgemini[-a-z0-9._]+\b/gi, "[model]")
    .replace(/\bsonar[-a-z0-9]*\b/gi, "[model]")
    .replace(/\bgpt-[a-z0-9._-]+\b/gi, "[model]");
}

async function callAnthropicMessages(params: {
  model: string;
  prompt: string;
  maxTokens: number;
}): Promise<{ text: string; tokensIn: number; tokensOut: number; error?: string }> {
  const apiKey = process.env["ANTHROPIC_API_KEY"]?.trim();
  if (!apiKey) {
    return {
      text: "",
      tokensIn: 0,
      tokensOut: 0,
      error:
        "ANTHROPIC_API_KEY not set in process.env. Export the key before AutoBaton Anthropic dispatch.",
    };
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: params.maxTokens,
      messages: [{ role: "user", content: params.prompt }],
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return {
      text: "",
      tokensIn: 0,
      tokensOut: 0,
      error: `Anthropic HTTP ${res.status}: ${errBody.slice(0, 500)}`,
    };
  }
  let parsed: {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  try {
    parsed = (await res.json()) as typeof parsed;
  } catch {
    return { text: "", tokensIn: 0, tokensOut: 0, error: "Anthropic: malformed JSON response" };
  }
  const text =
    parsed.content?.map((b) => (b.type === "text" && b.text ? b.text : "")).join("") ?? "";
  const tokensIn = parsed.usage?.input_tokens ?? Math.ceil(params.prompt.length / 4);
  const tokensOut = parsed.usage?.output_tokens ?? Math.ceil(text.length / 4);
  return { text, tokensIn, tokensOut };
}

export interface AutobatonDispatchParams {
  prompt: string;
  task_class?: AutobatonTaskClass;
  session_id?: string;
  model_override?: string;
  max_tokens?: number;
  ab_test?: boolean;
  blind_grade_output?: boolean;
  substrate_context_loaded?: boolean;
  substrate_eblets_pre_injected?: string[];
  /** When false, skip HTTP / vendor calls (routing + MAD row only). */
  execute?: boolean;
}

export interface AutobatonDispatchResult {
  ok: boolean;
  dispatch_id: string;
  task_class: AutobatonTaskClass;
  route_kind: RoutePlan["kind"];
  model_routed: string;
  model_routed_reason: ModelRoutedReason;
  output?: string;
  output_for_grade?: string;
  error?: string;
  duration_ms: number;
  tokens_in: number;
  tokens_out: number;
  cost_estimate_usd: number;
  rook_return_path?: string;
  pawn_dispatch_id?: string;
  ab_test_arm?: "candidate" | "baseline";
}

export async function autobatonDispatch(
  params: AutobatonDispatchParams,
): Promise<AutobatonDispatchResult> {
  const dispatchId = randomUUID();
  const t0 = Date.now();
  const sessionId = params.session_id ?? "autobaton";
  const explicitClass = params.task_class !== undefined;
  const taskClass = resolveTaskClass(params.task_class, params.prompt);
  const plan = planRouteForTaskClass(taskClass);

  let modelRouted = plan.model;
  let reason: ModelRoutedReason = params.model_override
    ? "override"
    : explicitClass
      ? "explicit"
      : "default";

  let abArm: "candidate" | "baseline" | undefined;

  if (params.ab_test && taskClass === "synthesis" && !params.model_override) {
    const coin = Math.random() < 0.5;
    abArm = coin ? "candidate" : "baseline";
    if (abArm === "candidate") {
      modelRouted = "claude-haiku-4-5-20251001";
      reason = "ab_candidate";
    } else {
      modelRouted = "claude-sonnet-4-6";
      reason = "ab_baseline";
    }
  }

  if (params.model_override?.trim()) {
    modelRouted = params.model_override.trim();
    reason = "override";
    abArm = undefined;
  }

  const maxTok =
    params.max_tokens ?? (taskClass === "flagship_deliberation" ? 8192 : 4096);

  let output = "";
  let tokensIn = Math.ceil(params.prompt.length / 4);
  let tokensOut = 0;
  let cost = 0;
  let error: string | undefined;
  let rookPath: string | undefined;
  let pawnId: string | undefined;

  const run = params.execute !== false;

  if (run) {
    try {
      if (plan.kind === "anthropic") {
        const anth = await callAnthropicMessages({
          model: modelRouted,
          prompt: params.prompt,
          maxTokens: maxTok,
        });
        if (anth.error) {
          error = anth.error;
        } else {
          output = anth.text;
          tokensIn = anth.tokensIn;
          tokensOut = anth.tokensOut;
          cost = estimateAnthropicCostUsd(modelRouted, tokensIn, tokensOut);
        }
      } else if (plan.kind === "rook") {
        const r = await runDispatchRook({
          prompt_content: params.prompt,
          model: modelRouted,
          max_tokens: maxTok,
          expected_return_path: `AUTOBATON_${dispatchId}`,
        });
        if (r.status !== "dispatched") {
          error = r.message ?? `rook status ${r.status}`;
        } else {
          output = `[Returned in file ${r.rook_return_path}]`;
          rookPath = r.rook_return_path;
          tokensOut = r.tokens_used ?? 0;
          cost = r.cost_estimate_usd ?? 0;
        }
      } else {
        const returnPath = resolve(
          BISHOP_DROPZONE,
          "02_PawnPrompts",
          `AUTOBATON_PAWN_${dispatchId}.md`,
        );
        const pr = await runDispatchPawn({
          prompt_content: params.prompt,
          expected_return_path: returnPath,
          model: modelRouted,
          max_tokens: maxTok,
          dispatch_metadata: { session_id: sessionId, autobaton_dispatch_id: dispatchId },
        });
        pawnId = pr.dispatch_id || undefined;
        if (pr.status !== "dispatched") {
          error = pr.message ?? `pawn status ${pr.status}`;
        } else {
          output = `[Pawn dispatch ${pr.dispatch_id} — return path ${returnPath}]`;
          cost = pr.cost_estimate_usd ?? 0;
        }
      }
    } catch (e) {
      error = String(e);
    }
  } else {
    cost = estimateAnthropicCostUsd(modelRouted, tokensIn, maxTok);
    tokensOut = 0;
  }

  const duration = Date.now() - t0;

  const mad: MadDataRow = {
    ts: new Date().toISOString(),
    session_id: sessionId,
    dispatch_id: dispatchId,
    task_class: taskClass,
    model_routed: modelRouted,
    model_routed_reason: reason,
    cost_estimate_usd: Math.round(cost * 1_000_000) / 1_000_000,
    duration_ms: duration,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    founder_grade: null,
    substrate_context_loaded: params.substrate_context_loaded ?? false,
    substrate_eblets_pre_injected: params.substrate_eblets_pre_injected ?? [],
    ...(abArm ? { ab_test_arm: abArm } : {}),
  };
  appendMadDataRow(mad);

  const outputForGrade =
    params.blind_grade_output && output
      ? stripModelIdentifiersForBlindGrade(output)
      : output;

  return {
    ok: !error,
    dispatch_id: dispatchId,
    task_class: taskClass,
    route_kind: plan.kind,
    model_routed: modelRouted,
    model_routed_reason: reason,
    output,
    output_for_grade: outputForGrade,
    error,
    duration_ms: duration,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_estimate_usd: mad.cost_estimate_usd,
    rook_return_path: rookPath,
    pawn_dispatch_id: pawnId,
    ab_test_arm: abArm,
  };
}
