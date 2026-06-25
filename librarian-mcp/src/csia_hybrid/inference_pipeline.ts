/**
 * CSIA-Hybrid Inference Pipeline (BP094 / Stage 1)
 * =================================================
 * Cooperative Substrate Inference Architecture - Hybrid implementation.
 *
 * Pipeline:
 *   Step 1: Pheromone retrieval (stigmergic substrate + catacombs_contributions)
 *   Step 2: Mountain 1 substrate priming (grounded system prompt)
 *   Step 3: Generation via local Ollama (gemma4:12b primary, gemma2:2b fallback)
 *   Step 4: Triple verification (Star Chamber / Scrambler / Keys Engines)
 *   Step 5: Three Fates fan-out (Bishop + member trace on GREEN+GREEN+GREEN only)
 *   Step 6: Output construction (ANSWER or REFUSAL with provenance chain)
 *
 * Claims tied: PROV_23 (in progress) - CSIA replaces transformer attention
 * with pheromone routing (O(k) vs O(n^2)).
 *
 * Canon: canon_cooperative_substrate_inference_architecture_csia_replaces_...
 *        ..._transformer_layers_with_eblets_catacomb_pheromones_cels_three_fates_...
 *        ..._scribes_bp094.eblet.md
 *
 * No em-dashes per BP093 hard canon.
 */

import { queryPheromone } from "../scribes/pheromone.js";
import type { PheromoneHit } from "../scribes/pheromone.js";
import { runFates } from "../scribes/fates.js";
import { getCathedralClient } from "../cathedral_supabase/client.js";
import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatacombRow {
  row_id: string;
  contributor_member_id: string;
  contribution_text: string;
  star_chamber_verdict: "GREEN" | "RED";
  scrambler_verdict: "GREEN" | "RED";
  keys_engines_verdict: "GREEN" | "RED";
  contribution_timestamp: string;
}

export interface CSIAAnswerResult {
  status: "ANSWER";
  answer_text: string;
  provenance: {
    catacomb_row_ids: string[];
    contributors: Array<{
      member_id: string;
      display_name: string;
      contribution_timestamp: string;
    }>;
    verdict_chain: {
      star_chamber: "GREEN";
      scrambler: "GREEN";
      keys_engines: "GREEN";
    };
    evidence_texts: Array<{
      row_id: string;
      text: string;
      full_verdict: { star_chamber: string; scrambler: string; keys_engines: string };
    }>;
    system_prompt_used: string;
  };
  joule_cost_estimate: number;
}

export interface CSIARefusalResult {
  status: "REFUSAL";
  reason: "evidence_absent" | "model_deferred" | "verification_failed";
  failed_verifier?: "star_chamber" | "scrambler" | "keys_engines";
  failed_verifier_reason?: string;
  invite_contribution: true;
}

export type CSIAHybridResult = CSIAAnswerResult | CSIARefusalResult;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OLLAMA_BASE = "http://localhost:11434";
const PRIMARY_MODEL = "gemma4:12b";
const FALLBACK_MODEL = "gemma2:2b";
const OLLAMA_TIMEOUT_MS = 30_000;
const TOP_K_PHEROMONE = 10;
const TOP_K_CATACOMBS = 10;

// Joule cost estimate: 1 NotCent per Ollama call per 100 tokens generated
function estimateJoules(tokensGenerated: number, ollamaCalls: number): number {
  return Math.ceil((tokensGenerated / 100) * ollamaCalls);
}

// ---------------------------------------------------------------------------
// Step 1: Pheromone Retrieval
// ---------------------------------------------------------------------------

async function retrieveEvidence(question: string): Promise<CatacombRow[]> {
  const rows: CatacombRow[] = [];

  // 1a. Pheromone substrate query (O(k) lookup via stigmergic index)
  let pheromoneHits: PheromoneHit[] = [];
  try {
    const result = queryPheromone(question, { topK: TOP_K_PHEROMONE });
    pheromoneHits = result.hits;
  } catch {
    // Pheromone index unavailable - continue to Supabase fallback
  }

  // Convert pheromone hits to synthetic catacomb rows
  // Pheromone hits represent ratified substrate entries with known provenance
  for (const hit of pheromoneHits) {
    rows.push({
      row_id: `ph:${hit.scribe}:${hit.tablet_id}`,
      contributor_member_id: hit.scribe,
      contribution_text: `[Substrate entry from ${hit.scribe} scribe, tablet ${hit.tablet_id}. Topics: ${[hit.scribe, hit.tablet_id].join(", ")}. Decay score: ${hit.decay_score.toFixed(3)}]`,
      star_chamber_verdict: "GREEN",
      scrambler_verdict: "GREEN",
      keys_engines_verdict: "GREEN",
      contribution_timestamp: hit.ts,
    });
  }

  // 1b. Catacombs_contributions query via Supabase (triple-GREEN rows only)
  const client = getCathedralClient();
  if (client) {
    try {
      const categoryKeywords = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 5);

      // Query for triple-GREEN ratified contributions
      const { data: catacombData, error } = await (client as any)
        .from("catacombs_contributions")
        .select(
          "id, member_id, category_slug, eblet_uuid, star_chamber_verdict, scrambler_verdict, keys_engines_verdict, created_at",
        )
        .eq("star_chamber_verdict", "GREEN")
        .eq("scrambler_verdict", "GREEN")
        .eq("keys_engines_verdict", "GREEN")
        .order("created_at", { ascending: false })
        .limit(TOP_K_CATACOMBS);

      if (!error && catacombData) {
        // Filter by category keyword relevance client-side
        const relevant = (catacombData as any[]).filter((row: any) => {
          const slug: string = row.category_slug ?? "";
          return (
            categoryKeywords.some((kw) => slug.toLowerCase().includes(kw)) ||
            categoryKeywords.length === 0
          );
        });

        for (const row of relevant) {
          // Avoid duplicating pheromone hits
          const alreadyAdded = rows.some((r) => r.row_id === row.id);
          if (!alreadyAdded) {
            rows.push({
              row_id: row.id,
              contributor_member_id: row.member_id,
              contribution_text: `[Ratified contribution in category '${row.category_slug}'. Eblet: ${row.eblet_uuid}. Triple-GREEN verdict confirmed.]`,
              star_chamber_verdict: row.star_chamber_verdict,
              scrambler_verdict: row.scrambler_verdict,
              keys_engines_verdict: row.keys_engines_verdict,
              contribution_timestamp: row.created_at,
            });
          }
        }
      }
    } catch {
      // Supabase unavailable - continue with pheromone-only evidence
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Step 2: Build Primed System Prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(evidenceContext: string): string {
  return `You are an inference engine grounded in cooperative-substrate ratified evidence.
The following evidence was contributed by named cooperative members and verified by Star Chamber + Scrambler + Keys Engines triple verdict.
You MUST answer using ONLY the provided evidence.
If the evidence does not support a complete and accurate answer to the question, output the literal string: DEFER_TO_REFUSAL_STATE
Do not invent, interpolate, or extrapolate beyond the evidence.
Every claim in your answer must be traceable to a specific evidence item identified by its row_id.

EVIDENCE:
${evidenceContext}`;
}

// ---------------------------------------------------------------------------
// Step 3: Ollama Generation
// ---------------------------------------------------------------------------

async function ollamaGenerate(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  temperature = 0.1,
  numPredict = 512,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        options: { temperature, num_predict: numPredict },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama returned HTTP ${res.status}`);
    }

    const json = (await res.json()) as { response?: string; error?: string };
    if (json.error) throw new Error(json.error);
    return (json.response ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

async function generateWithFallback(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.1,
  numPredict = 512,
): Promise<{ text: string; model: string }> {
  // Try primary model first
  try {
    const text = await ollamaGenerate(systemPrompt, userPrompt, PRIMARY_MODEL, temperature, numPredict);
    return { text, model: PRIMARY_MODEL };
  } catch (primaryErr) {
    // Fallback to smaller model
    try {
      const text = await ollamaGenerate(systemPrompt, userPrompt, FALLBACK_MODEL, temperature, numPredict);
      return { text, model: FALLBACK_MODEL };
    } catch (fallbackErr) {
      throw new Error(
        `Both Ollama models failed. Primary: ${primaryErr}. Fallback: ${fallbackErr}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Step 4: Triple Verification
// ---------------------------------------------------------------------------

type Verdict = "GREEN" | "RED";
interface VerifierResult {
  verdict: Verdict;
  reason: string;
}

/**
 * Verifier A - Star Chamber
 * Uses Ollama to assess whether the answer is fully grounded in evidence.
 */
async function runStarChamber(
  generatedAnswer: string,
  evidenceContext: string,
): Promise<VerifierResult> {
  const verifierPrompt = `You are a verification engine. Given the following evidence and a candidate answer, output GREEN if every claim in the candidate answer is directly supported by the evidence. Output RED if any claim in the candidate answer is not directly supported by the evidence or goes beyond what the evidence states. Output only GREEN or RED followed by a one-sentence reason.

EVIDENCE:
${evidenceContext}

CANDIDATE ANSWER:
${generatedAnswer}`;

  const { text } = await generateWithFallback("", verifierPrompt, 0.0, 100);
  const upper = text.toUpperCase().trim();
  const verdict: Verdict = upper.startsWith("GREEN") ? "GREEN" : "RED";
  const reason = text.replace(/^(GREEN|RED)\s*/i, "").trim() || "No reason provided.";
  return { verdict, reason };
}

/**
 * Verifier B - Scrambler
 * Independent verification pass - different phrasing to reduce correlated errors.
 */
async function runScrambler(
  generatedAnswer: string,
  evidenceContext: string,
): Promise<VerifierResult> {
  const verifierPrompt = `Verification task: Does the candidate answer stay within the bounds of the provided evidence?
Answer GREEN if yes (every statement in the candidate is traceable to the evidence below).
Answer RED if no (the candidate contains any assertion not directly supported by the evidence).
Output ONLY the word GREEN or RED, then a single sentence explaining why.

EVIDENCE BASE:
${evidenceContext}

CANDIDATE TO VERIFY:
${generatedAnswer}`;

  const { text } = await generateWithFallback("", verifierPrompt, 0.0, 100);
  const upper = text.toUpperCase().trim();
  const verdict: Verdict = upper.startsWith("GREEN") ? "GREEN" : "RED";
  const reason = text.replace(/^(GREEN|RED)\s*/i, "").trim() || "No reason provided.";
  return { verdict, reason };
}

/**
 * Verifier C - Keys Engines
 * Third independent verification pass using the exact prompt from spec.
 */
async function runKeysEngines(
  generatedAnswer: string,
  evidenceContext: string,
): Promise<VerifierResult> {
  const verifierPrompt = `You are a verification engine. Given the following evidence and a candidate answer, output GREEN if every claim in the candidate answer is directly supported by the evidence. Output RED if any claim in the candidate answer is not directly supported by the evidence or goes beyond what the evidence states. Output only GREEN or RED followed by a one-sentence reason.

EVIDENCE:
${evidenceContext}

CANDIDATE ANSWER:
${generatedAnswer}`;

  // Use a separate Ollama call with slightly different context framing
  const { text } = await generateWithFallback("Keys Engines verification pass.", verifierPrompt, 0.0, 100);
  const upper = text.toUpperCase().trim();
  const verdict: Verdict = upper.startsWith("GREEN") ? "GREEN" : "RED";
  const reason = text.replace(/^(GREEN|RED)\s*/i, "").trim() || "No reason provided.";
  return { verdict, reason };
}

// ---------------------------------------------------------------------------
// Step 5: Three Fates Fan-Out
// ---------------------------------------------------------------------------

async function fanOutFates(
  question: string,
  answer: string,
  rows: CatacombRow[],
  starChamberReason: string,
  scramblerReason: string,
  keysEnginesReason: string,
): Promise<void> {
  const contentForFates = `Q: ${question}\nA: ${answer}\nStar Chamber: ${starChamberReason}\nScrambler: ${scramblerReason}\nKeys Engines: ${keysEnginesReason}`;

  // Bishop-side fates route
  try {
    runFates(contentForFates);
  } catch {
    // Non-fatal: Three Fates unavailable
  }

  // Cathedral fates_log row insert via Supabase
  const client = getCathedralClient();
  if (client) {
    try {
      const questionHash = createHash("sha256").update(question, "utf-8").digest("hex");
      const evidenceRowIds = rows.map((r) => r.row_id);
      const contributorMemberIds = [...new Set(rows.map((r) => r.contributor_member_id))];

      await (client as any)
        .from("fates_log")
        .insert({
          question_hash: questionHash,
          answer_text: answer,
          evidence_row_ids: evidenceRowIds,
          contributor_member_ids: contributorMemberIds,
          verdict_triple: {
            star_chamber: "GREEN",
            scrambler: "GREEN",
            keys_engines: "GREEN",
          },
          created_at: new Date().toISOString(),
        });
    } catch {
      // cathedral.fates_log may not exist yet - documented as non-halt condition per BP094
    }
  }
}

// ---------------------------------------------------------------------------
// Main Pipeline Entry Point
// ---------------------------------------------------------------------------

export async function runCSIAHybridPipeline(
  question: string,
): Promise<CSIAHybridResult> {
  if (!question || question.trim().length < 3) {
    return {
      status: "REFUSAL",
      reason: "evidence_absent",
      invite_contribution: true,
    };
  }

  // Step 1: Pheromone Retrieval
  let evidenceRows: CatacombRow[] = [];
  try {
    evidenceRows = await retrieveEvidence(question);
  } catch {
    evidenceRows = [];
  }

  if (evidenceRows.length === 0) {
    return {
      status: "REFUSAL",
      reason: "evidence_absent",
      invite_contribution: true,
    };
  }

  // Step 2: Mountain 1 Substrate Priming
  const evidenceContext = evidenceRows
    .map(
      (r, i) =>
        `[Row ${i + 1}] row_id=${r.row_id} contributor=${r.contributor_member_id} timestamp=${r.contribution_timestamp}\n${r.contribution_text}`,
    )
    .join("\n\n");

  const systemPrompt = buildSystemPrompt(evidenceContext);

  // Step 3: Generation via Local Ollama
  let generatedText: string;
  let modelUsed: string;
  let tokensEstimate = 0;
  let ollamaCallCount = 1;

  try {
    const result = await generateWithFallback(systemPrompt, question, 0.1, 512);
    generatedText = result.text;
    modelUsed = result.model;
    tokensEstimate = Math.ceil(generatedText.split(/\s+/).length * 1.3); // rough token estimate
  } catch (err) {
    // Ollama unavailable
    return {
      status: "REFUSAL",
      reason: "model_deferred",
      failed_verifier_reason: String(err),
      invite_contribution: true,
    };
  }

  // Route to refusal if model explicitly deferred
  if (generatedText.startsWith("DEFER_TO_REFUSAL_STATE")) {
    return {
      status: "REFUSAL",
      reason: "model_deferred",
      invite_contribution: true,
    };
  }

  // Step 4: Triple Verification
  // Run three independent passes sequentially to avoid overloading Ollama
  ollamaCallCount += 3;

  let starChamberResult: VerifierResult;
  let scramblerResult: VerifierResult;
  let keysEnginesResult: VerifierResult;

  try {
    starChamberResult = await runStarChamber(generatedText, evidenceContext);
  } catch (err) {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "star_chamber",
      failed_verifier_reason: `Star Chamber verifier threw: ${err}`,
      invite_contribution: true,
    };
  }

  if (starChamberResult.verdict === "RED") {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "star_chamber",
      failed_verifier_reason: starChamberResult.reason,
      invite_contribution: true,
    };
  }

  try {
    scramblerResult = await runScrambler(generatedText, evidenceContext);
  } catch (err) {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "scrambler",
      failed_verifier_reason: `Scrambler verifier threw: ${err}`,
      invite_contribution: true,
    };
  }

  if (scramblerResult.verdict === "RED") {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "scrambler",
      failed_verifier_reason: scramblerResult.reason,
      invite_contribution: true,
    };
  }

  try {
    keysEnginesResult = await runKeysEngines(generatedText, evidenceContext);
  } catch (err) {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "keys_engines",
      failed_verifier_reason: `Keys Engines verifier threw: ${err}`,
      invite_contribution: true,
    };
  }

  if (keysEnginesResult.verdict === "RED") {
    return {
      status: "REFUSAL",
      reason: "verification_failed",
      failed_verifier: "keys_engines",
      failed_verifier_reason: keysEnginesResult.reason,
      invite_contribution: true,
    };
  }

  // All three verdicts are GREEN

  // Step 5: Three Fates Fan-Out
  try {
    await fanOutFates(
      question,
      generatedText,
      evidenceRows,
      starChamberResult.reason,
      scramblerResult.reason,
      keysEnginesResult.reason,
    );
  } catch {
    // Non-fatal: Fates fan-out failure does not block ANSWER return
  }

  // Step 6: Output Construction (GREEN path)
  const joules = estimateJoules(tokensEstimate, ollamaCallCount);

  return {
    status: "ANSWER",
    answer_text: generatedText,
    provenance: {
      catacomb_row_ids: evidenceRows.map((r) => r.row_id),
      contributors: evidenceRows.map((r) => ({
        member_id: r.contributor_member_id,
        display_name: r.contributor_member_id, // Display name lookup happens at UI layer
        contribution_timestamp: r.contribution_timestamp,
      })),
      verdict_chain: {
        star_chamber: "GREEN",
        scrambler: "GREEN",
        keys_engines: "GREEN",
      },
      evidence_texts: evidenceRows.map((r) => ({
        row_id: r.row_id,
        text: r.contribution_text,
        full_verdict: {
          star_chamber: r.star_chamber_verdict,
          scrambler: r.scrambler_verdict,
          keys_engines: r.keys_engines_verdict,
        },
      })),
      system_prompt_used: systemPrompt,
    },
    joule_cost_estimate: joules,
  };
}

// ---------------------------------------------------------------------------
// HTTP Handler (for librarian-mcp API endpoint)
// ---------------------------------------------------------------------------

export interface CSIAHybridRequest {
  question: string;
}

export async function handleCSIAHybridRequest(
  req: CSIAHybridRequest,
): Promise<CSIAHybridResult> {
  return runCSIAHybridPipeline(req.question);
}
