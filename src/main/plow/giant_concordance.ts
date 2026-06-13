/**
 * Giant concordance — BP081 v0.1.59.1 real implementation
 * 3-voter Ollama dispatch with perspective-diverse prompts.
 * Caithedral spelling preserved per BP081 blood statute.
 */

export interface VoterVote {
  voter: number;
  verdict: 'verified' | 'rejected';
  confidence: number;
}

export interface ConcordanceResult {
  verdict: 'verified' | 'rejected' | 'split';
  confidence: number;
  votes: VoterVote[];
  error?: string;
}

// ─── Prompt templates ─────────────────────────────────────────────────────────

function buildCorrectnessPrompt(question: string, candidateAnswer: string): string {
  return `You are a strict factual verifier. Given a question and a candidate answer, determine if the answer is factually correct.

Question: ${question}
Candidate Answer: ${candidateAnswer}

Respond with ONLY one word: VERIFIED (if the answer is factually correct) or REJECTED (if it is wrong, incomplete, or uncertain).`;
}

function buildConsistencyPrompt(question: string, candidateAnswer: string): string {
  return `You are a logical consistency checker. Given a question and a candidate answer, determine if the answer is internally consistent and logically valid.

Question: ${question}
Candidate Answer: ${candidateAnswer}

Respond with ONLY one word: VERIFIED (if the answer is logically consistent and valid) or REJECTED (if it contains contradictions, logical errors, or is too vague to accept).`;
}

function buildCoveragePrompt(question: string, candidateAnswer: string): string {
  return `You are a completeness evaluator. Given a question and a candidate answer, determine if the answer adequately covers the key points needed to answer the question.

Question: ${question}
Candidate Answer: ${candidateAnswer}

Respond with ONLY one word: VERIFIED (if the answer adequately covers the question) or REJECTED (if it is missing critical information or is too superficial).`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runGiantConcordance(
  question: string,
  candidateAnswer: string,
  opts?: { voters?: number; model?: string; ollamaBaseUrl?: string },
): Promise<ConcordanceResult> {
  const model = opts?.model ?? 'gemma4:12b';
  const ollamaBaseUrl = opts?.ollamaBaseUrl ?? 'http://127.0.0.1:11434';

  const voterPrompts = [
    buildCorrectnessPrompt(question, candidateAnswer),
    buildConsistencyPrompt(question, candidateAnswer),
    buildCoveragePrompt(question, candidateAnswer),
  ];

  const votes = await Promise.all(
    voterPrompts.map(async (prompt, i): Promise<VoterVote> => {
      try {
        const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt, stream: false }),
          signal: AbortSignal.timeout(30_000),
        });
        const data = (await response.json()) as { response?: string };
        const text: string = data.response?.trim().toUpperCase() ?? '';
        const verdict: 'verified' | 'rejected' = text.startsWith('VERIFIED') ? 'verified' : 'rejected';
        const confidence = text.startsWith('VERIFIED') || text.startsWith('REJECTED') ? 0.9 : 0.5;
        return { voter: i + 1, verdict, confidence };
      } catch (err) {
        console.error(`[GiantConcordance] Voter ${i + 1} error:`, err);
        return { voter: i + 1, verdict: 'rejected', confidence: 0 };
      }
    }),
  );

  // Check if all voters failed (network error = confidence 0 + rejected)
  const allFailed = votes.every((v) => v.confidence === 0 && v.verdict === 'rejected');
  if (allFailed) {
    console.error('[GiantConcordance] ollama_unreachable — all voters failed with network error');
    return { verdict: 'rejected', confidence: 0, votes, error: 'ollama_unreachable' };
  }

  const verifiedCount = votes.filter((v) => v.verdict === 'verified').length;
  const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;

  let verdict: 'verified' | 'rejected' | 'split';
  if (verifiedCount >= 2) {
    verdict = 'verified';
  } else if (verifiedCount === 1) {
    verdict = 'split';
  } else {
    verdict = 'rejected';
  }

  console.log(
    `[GiantConcordance] verdict=${verdict} confidence=${avgConfidence.toFixed(3)} ` +
    `voters=[${votes.map((v) => `${v.voter}:${v.verdict}(${v.confidence})`).join(',')}]`,
  );

  return { verdict, confidence: avgConfidence, votes };
}
