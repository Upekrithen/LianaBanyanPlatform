/**
 * andon_replow.ts — Andon Re-Plow loop for per-domain MMLU-Pro Q banks.
 * BP081 v0.1.59 SEG-4 "Plow the Field"
 *
 * Andon discipline: ONLY verified answers (model correct) are written to substrate.
 * Wrong answers are never written.
 */

import { loadDomainBank, type Domain } from './per_domain_q_banks';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

// ─── Constants ────────────────────────────────────────────────────────────────

const OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'gemma4:12b';
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveModel(): string {
  try {
    const home = process.env.USERPROFILE || process.env.HOME || homedir();
    const p = path.join(home, '.lb_substrate', 'sku_tier.json');
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8')) as { model?: string };
      if (data.model) return data.model;
    }
  } catch { /* noop */ }
  return DEFAULT_MODEL;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlowResult {
  ok: boolean;
  verdict: 'verified' | 'rejected' | 'quarantined';
  ebletWritten: boolean;
  question?: string;
  answer?: string;
  modelAnswer?: string;
  error?: string;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Run one Andon Re-Plow iteration for a given question text + domain.
 *
 * Steps:
 *   1. Look up the correct answer from the sealed domain bank.
 *   2. Ask the local Ollama model.
 *   3. Grade the response (letter-match for MMLU-Pro).
 *   4. Write a verified eblet if correct (Andon discipline).
 *   5. Return verdict: 'verified' | 'rejected' | 'quarantined'.
 */
export async function runAndonReplowLoop(question: string, domain: string): Promise<PlowResult> {
  // ── Step 1: load domain bank + find entry ──────────────────────────────────
  let bank;
  try {
    bank = loadDomainBank(domain as Domain);
  } catch (err) {
    return {
      ok: false,
      verdict: 'quarantined',
      ebletWritten: false,
      error: `Bank load failed: ${(err as Error).message}`,
    };
  }

  const entry = bank.find((q) => q.question.trim() === question.trim());
  if (!entry) {
    return {
      ok: false,
      verdict: 'quarantined',
      ebletWritten: false,
      error: 'Question not found in domain bank',
    };
  }

  // ── Step 2: build MMLU-Pro prompt + ask local model ────────────────────────
  const optionsText = entry.options
    .map((o, i) => `${OPTION_LABELS[i] ?? String(i)}. ${o}`)
    .join('\n');
  const prompt =
    `Answer the following multiple-choice question. ` +
    `Reply with ONLY the letter of the correct answer (e.g. "A").\n\n` +
    `Question: ${entry.question}\n\n${optionsText}\n\nAnswer:`;

  const model = resolveModel();
  let modelAnswer = '';

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { num_predict: 8, temperature: 0.0 },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (resp.ok) {
      const data = (await resp.json()) as { response?: string };
      modelAnswer = data.response?.trim() ?? '';
    } else {
      return {
        ok: false,
        verdict: 'quarantined',
        ebletWritten: false,
        error: `Ollama HTTP ${resp.status}`,
      };
    }
  } catch (err) {
    return {
      ok: false,
      verdict: 'quarantined',
      ebletWritten: false,
      error: `Model call failed: ${String(err).slice(0, 80)}`,
    };
  }

  // ── Step 3: grade ──────────────────────────────────────────────────────────
  const correctLetter = entry.correct_answer.trim().toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
  const modelLetter = modelAnswer.toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
  const isCorrect = correctLetter.length > 0 && correctLetter === modelLetter;

  if (!isCorrect) {
    return {
      ok: true,
      verdict: 'rejected',
      ebletWritten: false,
      question: entry.question,
      answer: entry.correct_answer,
      modelAnswer,
    };
  }

  // ── Step 4: write verified eblet (Andon discipline) ────────────────────────
  let ebletWritten = false;
  try {
    const { writeVerifiedEblet } = await import('../mnem_eblet_store');
    const sha256 = createHash('sha256')
      .update(entry.question + entry.correct_answer)
      .digest('hex');
    await writeVerifiedEblet({
      question: entry.question,
      answer: entry.correct_answer,
      provenance: `plow-field:${domain}`,
      verified: true,
      sha256,
      timestamp: Date.now(),
    });
    ebletWritten = true;
  } catch (err) {
    console.warn('[andon_replow] eblet write failed (non-fatal):', err);
  }

  return {
    ok: true,
    verdict: 'verified',
    ebletWritten,
    question: entry.question,
    answer: entry.correct_answer,
    modelAnswer,
  };
}
