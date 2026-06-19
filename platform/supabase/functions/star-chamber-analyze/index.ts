/**
 * STAR CHAMBER ANALYZE — AI Judge Verdict Engine (Dual-Engine)
 * ============================================================
 * Four AI judges analyze a case: Oracle (patterns), Morpheus (behavior),
 * Red Queen (rules), and Dredd (tiebreaker if no consensus).
 *
 * Mutual LLM fallback: Claude <-> Perplexity. If either provider is down,
 * the other catches. Oracle/Morpheus/Dredd prefer Claude; Red Queen prefers
 * Perplexity (web-grounded rule checking). Seamless to the user.
 *
 * Request body: { caseId: string }
 * Returns: { success, analyses, recommendedAction, dreddInvoked }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JUDGE_PROMPTS: Record<string, string> = {
  oracle: `You are ORACLE, the Pattern Detection judge on the Liana Banyan Star Chamber.
Your role: Identify patterns, precedents, and predict consequences.
Analyze this case by:
1. Finding similar past patterns (even hypothetical)
2. Identifying the root cause vs. symptoms
3. Predicting what happens if no action is taken
4. Recommending ONE specific action
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  morpheus: `You are MORPHEUS, the Behavioral Risk judge on the Liana Banyan Star Chamber.
Your role: Assess behavioral patterns, motivations, and systemic risks.
Analyze this case by:
1. Evaluating the behavioral pattern (one-time vs. systematic)
2. Assessing risk to the cooperative community
3. Considering the human element (intent vs. impact)
4. Recommending ONE specific action that addresses behavior, not just symptoms
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  red_queen: `You are RED QUEEN, the Rule Compliance judge on the Liana Banyan Star Chamber.
Your role: Enforce platform rules strictly but fairly. You have access to current legal and regulatory information.
Analyze this case by:
1. Identifying which specific platform rules apply (Cost+20% pricing, HEOHO principles, membership agreements)
2. Checking relevant cooperative law, Texas business code, or regulatory requirements if applicable
3. Determining if a violation occurred (yes/no/ambiguous) with cited basis
4. Checking if this is a first offense or repeat pattern
5. Recommending ONE specific action based on rule application
Liana Banyan principles: Cost+20% pricing, HEOHO (Help Each Other Help Ourselves), earned participation, transparent governance, Subchapter T cooperative structure.
Format: 2-3 paragraphs. Cite any rules or laws referenced. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  dredd: `You are DREDD, the Final Arbiter on the Liana Banyan Star Chamber.
You are ONLY invoked when Oracle, Morpheus, and Red Queen disagree.
Your role: Break the tie with a definitive ruling.
You have access to all three prior analyses. Weigh them and decide.
Principles: Favor the cooperative's long-term health. Protect members. Enforce rules but allow mercy for first offenses.
Format: 2-3 paragraphs. Address each judge's reasoning. End with "FINAL RULING: [specific action]" and "CONFIDENCE: [0-100]%"`,
};

interface JudgeResult {
  analysis: string;
  recommendedAction: string;
  confidence: number;
  engine: LLMProvider | 'error';
}

type LLMProvider = 'claude' | 'perplexity';

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  primary: LLMProvider = 'claude',
): Promise<{ text: string; engine: LLMProvider | 'error' }> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');

  const claudeCall = async (): Promise<string | null> => {
    if (!anthropicKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.content?.[0]?.text;
      return (text && text.length > 50) ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  const perplexityCall = async (): Promise<string | null> => {
    if (!perplexityKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      return (text && text.length > 50) ? text : null;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  const providers: Array<{ name: LLMProvider; call: () => Promise<string | null> }> =
    primary === 'claude'
      ? [{ name: 'claude', call: claudeCall }, { name: 'perplexity', call: perplexityCall }]
      : [{ name: 'perplexity', call: perplexityCall }, { name: 'claude', call: claudeCall }];

  for (const provider of providers) {
    const result = await provider.call();
    if (result) {
      console.log(`Judge used engine: ${provider.name}${provider.name !== primary ? ' (fallback)' : ''}`);
      return { text: result, engine: provider.name };
    }
    console.warn(`${provider.name} failed, trying next provider...`);
  }

  console.error('ALL LLM providers failed for this judge call');
  return {
    text: 'Analysis temporarily unavailable. Both AI providers are currently unreachable. This judge will provide analysis when service is restored.',
    engine: 'error',
  };
}

function callJudge(
  judgeName: string,
  caseContext: string,
  extraContext?: string,
  primaryEngine: LLMProvider = 'claude',
): Promise<JudgeResult> {
  const systemPrompt = JUDGE_PROMPTS[judgeName];
  const userContent = extraContext
    ? `${caseContext}\n\nPRIOR JUDGE ANALYSES:\n${extraContext}`
    : caseContext;

  return callLLM(systemPrompt, userContent, primaryEngine).then(({ text, engine }) => {
    const actionMatch = text.match(/(?:RECOMMENDED ACTION|FINAL RULING):\s*(.+)/i);
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)%/i);
    return {
      analysis: text,
      recommendedAction: actionMatch ? actionMatch[1].trim() : 'No specific action recommended',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1], 10) : 50,
      engine,
    };
  });
}

function normalizeAction(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('warn')) return 'warn';
  if (lower.includes('suspend')) return 'suspend';
  if (lower.includes('dismiss') || lower.includes('close') || lower.includes('no action')) return 'dismiss';
  if (lower.includes('refund') || lower.includes('compensat') || lower.includes('payment')) return 'compensate';
  if (lower.includes('ban') || lower.includes('remov') || lower.includes('expel')) return 'ban';
  if (lower.includes('mediat') || lower.includes('review')) return 'mediate';
  if (lower.includes('train') || lower.includes('educat')) return 'training';
  return 'other';
}

// ─── MAMBA-ε: mesh_benchmark_verify handler ───────────────────────────────────
//
// Called by Ascending Andon when mesh peer confidence variance > threshold.
// Runs a 4-judge Star Chamber on the MMLU-Pro question + collected peer answers.
// Three honest falsification criteria are pre-recorded before each fire (per canon).
//
// Budget guard: each call costs ~$0.06-0.10 (Haiku × 4 judges). Caller is
// responsible for capping fires per benchmark run.
//
// Canon: canon_star_chamber_mesh_integrated_verification_andon_escalation_bp087

interface MeshBenchmarkVerifyBody {
  mode: 'mesh_benchmark_verify';
  question: string;
  options: string[];
  domain: string;
  peer_answers: Array<{ peer_id: string; answer_letter: string | null; confidence: number }>;
  dispatch_id: string;
  confidence_variance: number;
  andon_threshold: number;
}

async function handleMeshBenchmarkVerify(
  body: MeshBenchmarkVerifyBody,
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const {
    question,
    options,
    domain,
    peer_answers,
    dispatch_id,
    confidence_variance,
    andon_threshold,
  } = body;

  if (!question || !options || !peer_answers) {
    return new Response(
      JSON.stringify({ success: false, error: 'mesh_benchmark_verify requires question, options, peer_answers' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // Pre-record three honest falsification criteria (per Star Chamber canon)
  const falsificationCriteria = [
    `FC-1: If ≥3 of ${peer_answers.length} peers agreed on the same letter with high confidence, Star Chamber should CONFIRM that letter unless there is a clear factual error.`,
    `FC-2: If peer answers are uniformly distributed (all letters equally represented), Star Chamber should treat this as a genuine knowledge gap, not a system error.`,
    `FC-3: If the variance is driven by ONE outlier peer (one peer far from majority), Star Chamber should consider the majority verdict more reliable.`,
  ];

  const optionLines = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n');
  const peerSummary = peer_answers
    .map((p) => `  Peer ${p.peer_id.slice(0, 8)}: ${p.answer_letter ?? 'NO_ANSWER'} (conf: ${p.confidence}%)`)
    .join('\n');

  const benchmarkContext = `DOMAIN: ${domain}
QUESTION: ${question}
OPTIONS:\n${optionLines}

PEER MESH ANSWERS (${peer_answers.length} peers — Ascending Andon triggered, variance=${confidence_variance.toFixed(1)} > ${andon_threshold}):
${peerSummary}

FALSIFICATION CRITERIA:
${falsificationCriteria.join('\n')}

Your task: Determine the CORRECT answer letter (A-J). Analyze the question using your knowledge. Do NOT simply defer to peer majority — evaluate the question independently.`;

  const verifyPrompt = `Given the above MMLU-Pro question and the mesh peer answers, determine the single correct answer letter.
Respond with exactly: "ANSWER: <letter>" on its own line, followed by a 1-2 sentence explanation.
Then on its own line: "CONFIDENCE: <0-100>%"`;

  // Run 4 judges in parallel (ε1: mesh-as-internal when no external budget; external vendors when available)
  const judgeNames = ['oracle', 'morpheus', 'red_queen', 'dredd'] as const;
  const judgeResults = await Promise.all(
    judgeNames.map((judge) =>
      callJudge(judge, benchmarkContext, verifyPrompt, judge === 'red_queen' ? 'perplexity' : 'claude')
    )
  );

  // Extract answer letters from judge analyses
  const judgeAnswers = judgeResults.map((r) => {
    const match = r.analysis.match(/ANSWER:\s*([A-J])/i);
    return match ? match[1]!.toUpperCase() : null;
  });

  const judgeConfs = judgeResults.map((r) => r.confidence);

  // ε2: Variance calculation — H = Variance / 100
  const validConfs = judgeConfs.filter((c) => c > 0);
  const mean = validConfs.reduce((a, b) => a + b, 0) / (validConfs.length || 1);
  const variance = validConfs.reduce((s, c) => s + (c - mean) ** 2, 0) / (validConfs.length || 1);
  const H = variance / 100;
  const consensusThreshold = 0.15;
  const consensusReached = H <= consensusThreshold;

  // Plurality vote on answer letters
  const letterVotes = new Map<string, number>();
  for (const letter of judgeAnswers) {
    if (letter) letterVotes.set(letter, (letterVotes.get(letter) ?? 0) + 1);
  }
  let starChamberAnswer: string | null = null;
  let maxVotes = 0;
  for (const [letter, count] of letterVotes.entries()) {
    if (count > maxVotes) { maxVotes = count; starChamberAnswer = letter; }
  }

  console.log(
    `[StarChamber-ε] dispatch_id=${dispatch_id} domain=${domain} ` +
    `star_chamber_answer=${starChamberAnswer} H=${H.toFixed(3)} ` +
    `consensus=${consensusReached} judge_answers=${JSON.stringify(judgeAnswers)}`
  );

  // Log to star_chamber_mesh_fires table if it exists (graceful fallback)
  try {
    await supabase.from('star_chamber_mesh_fires').insert({
      dispatch_id,
      domain,
      question: question.slice(0, 300),
      confidence_variance,
      andon_threshold,
      peer_answers_json: peer_answers,
      star_chamber_answer: starChamberAnswer,
      judge_answers: judgeAnswers,
      judge_confidences: judgeConfs,
      H_score: H,
      consensus_reached: consensusReached,
      falsification_criteria: falsificationCriteria,
      created_at: new Date().toISOString(),
    });
  } catch { /* table may not exist yet — non-fatal */ }

  return new Response(
    JSON.stringify({
      success: true,
      mode: 'mesh_benchmark_verify',
      dispatch_id,
      star_chamber_answer: starChamberAnswer,
      judge_answers: Object.fromEntries(judgeNames.map((n, i) => [n, judgeAnswers[i]])),
      judge_confidences: Object.fromEntries(judgeNames.map((n, i) => [n, judgeConfs[i]])),
      confidence_variance_H: H,
      consensus_reached: consensusReached,
      falsification_criteria: falsificationCriteria,
      cost_guard: { estimated_usd: 0.08, note: 'Haiku×4 judges · cap fires per benchmark run' },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const hasAnyLLM = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('PERPLEXITY_API_KEY');
  if (!hasAnyLLM) {
    return new Response(
      JSON.stringify({ success: false, error: 'No LLM API keys configured (need ANTHROPIC_API_KEY or PERPLEXITY_API_KEY)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { caseId, mode } = body;

    // MAMBA-ε: mesh_benchmark_verify mode — Star Chamber as MMLU-Pro answer verifier
    // Triggered by Ascending Andon when peer confidence variance > threshold.
    // Runs 4 judges (Oracle/Morpheus/Red Queen/Dredd) on the question + candidate answers.
    // Returns consensus answer letter + H = Variance / 100 score.
    if (mode === 'mesh_benchmark_verify') {
      return await handleMeshBenchmarkVerify(body, supabase);
    }

    if (!caseId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing caseId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: caseData, error: fetchErr } = await supabase
      .from('star_chamber_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (fetchErr || !caseData) {
      return new Response(
        JSON.stringify({ success: false, error: `Case not found: ${fetchErr?.message || 'unknown'}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Set status to under_review
    await supabase.from('star_chamber_cases').update({ status: 'under_review' }).eq('id', caseId);

    const evidence = (caseData.evidence || []) as { type: string; description: string; url?: string }[];
    const caseContext = `CASE #${caseData.case_number}: ${caseData.title}
TYPE: ${caseData.case_type} | SEVERITY: ${caseData.severity} | FILED: ${caseData.created_at}

DESCRIPTION:
${caseData.description}

EVIDENCE:
${evidence.length > 0 ? evidence.map((e) => `- [${e.type}] ${e.description}${e.url ? ` (${e.url})` : ''}`).join('\n') : '(none provided)'}`;

    console.log(`⚖️ Star Chamber: Analyzing case #${caseData.case_number} — running 3 judges in parallel`);

    // Run Oracle, Morpheus, Red Queen in parallel with engine preferences
    const [oracleResult, morpheusResult, redQueenResult] = await Promise.all([
      callJudge('oracle', caseContext, undefined, 'claude'),
      callJudge('morpheus', caseContext, undefined, 'claude'),
      callJudge('red_queen', caseContext, undefined, 'perplexity'),
    ]);

    const appendEngine = (text: string, engine: string) =>
      text + `\n\n---\n_Engine: ${engine}_`;

    console.log(`Engines — Oracle: ${oracleResult.engine}, Morpheus: ${morpheusResult.engine}, Red Queen: ${redQueenResult.engine}`);

    // Write analyses with engine metadata
    await Promise.all([
      supabase.from('star_chamber_cases').update({ oracle_analysis: appendEngine(oracleResult.analysis, oracleResult.engine) }).eq('id', caseId),
      supabase.from('star_chamber_cases').update({ morpheus_analysis: appendEngine(morpheusResult.analysis, morpheusResult.engine) }).eq('id', caseId),
      supabase.from('star_chamber_cases').update({ red_queen_analysis: appendEngine(redQueenResult.analysis, redQueenResult.engine) }).eq('id', caseId),
    ]);

    // Check consensus
    const oracleCategory = normalizeAction(oracleResult.recommendedAction);
    const morpheusCategory = normalizeAction(morpheusResult.recommendedAction);
    const redQueenCategory = normalizeAction(redQueenResult.recommendedAction);

    const allSame = oracleCategory === morpheusCategory && morpheusCategory === redQueenCategory;

    let recommendedAction: string;
    let dreddInvoked = false;
    let dreddResult: JudgeResult | null = null;

    if (allSame) {
      // Consensus — use highest-confidence judge's specific wording
      const best = [oracleResult, morpheusResult, redQueenResult].sort((a, b) => b.confidence - a.confidence)[0];
      recommendedAction = best.recommendedAction;
      console.log(`✅ Consensus reached: ${oracleCategory} — Dredd not needed`);
    } else {
      // Disagreement — invoke Dredd
      dreddInvoked = true;
      const priorAnalyses = `ORACLE: ${oracleResult.analysis}\n\nMORPHEUS: ${morpheusResult.analysis}\n\nRED QUEEN: ${redQueenResult.analysis}`;

      console.log(`⚔️ No consensus (${oracleCategory}/${morpheusCategory}/${redQueenCategory}) — invoking Dredd`);

      dreddResult = await callJudge('dredd', caseContext, priorAnalyses, 'claude');
      console.log(`Dredd engine: ${dreddResult.engine}`);
      await supabase.from('star_chamber_cases').update({ dredd_verdict: appendEngine(dreddResult.analysis, dreddResult.engine) }).eq('id', caseId);
      recommendedAction = dreddResult.recommendedAction;
    }

    // Set recommended action and mark analysis complete
    await supabase.from('star_chamber_cases').update({
      recommended_action: recommendedAction,
      status: 'analysis_complete',
    }).eq('id', caseId);

    console.log(`⚖️ Case #${caseData.case_number} analysis complete. Recommended: ${recommendedAction}`);

    return new Response(
      JSON.stringify({
        success: true,
        caseNumber: caseData.case_number,
        analyses: {
          oracle: oracleResult.recommendedAction,
          morpheus: morpheusResult.recommendedAction,
          red_queen: redQueenResult.recommendedAction,
          dredd: dreddResult?.recommendedAction || null,
        },
        consensus: !dreddInvoked,
        dreddInvoked,
        recommendedAction,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Star Chamber analyze error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
