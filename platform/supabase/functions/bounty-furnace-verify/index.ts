/**
 * bounty-furnace-verify — KN088 / BP009
 * ============================================================
 * Furnace gear-tooth-fit verification for Bounty submissions.
 * Scores submission description + evidence against the Bounty's
 * requirements using the Mechanical Computer pattern:
 *   - Pre-assembled verification rubric (canonical per Bounty slug)
 *   - Structured scoring on key criteria
 *   - PASS (≥ threshold) → furnace_passed
 *   - FAIL (< threshold) → furnace_failed with notes
 *
 * Composes with:
 *   - KN044 Furnace gear-tooth-fit architecture
 *   - Slow Blade V2 (adversarial submission defense)
 *   - Stone Tablet Imperative (verification result is append-only record)
 *
 * Request body:
 *   submission_id     UUID
 *   bounty_slug       string
 *   description       string
 *   evidence_url      string?
 *   hardware_platform string?
 *
 * On success: updates bounty_submissions row with furnace_score + status.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Per-Bounty verification rubric (gear-tooth-fit criteria)
// Each criterion: { key, question, weight }
const RUBRIC_BY_SLUG: Record<string, Array<{ key: string; pattern: RegExp; weight: number }>> = {
  'raspberry-pi-led-hardware-control': [
    { key: 'mentions_raspberry_pi',  pattern: /raspberry\s*pi/i,               weight: 0.20 },
    { key: 'mentions_lb_frame',      pattern: /lb\s*frame|liana\s*banyan/i,     weight: 0.15 },
    { key: 'mentions_haiku_tier',    pattern: /haiku|cheaper?\s*model/i,        weight: 0.15 },
    { key: 'mentions_actuations',    pattern: /actuat|led|servo|gpio/i,         weight: 0.15 },
    { key: 'mentions_reliability',   pattern: /reliab|\d+\.?\d*\s*%/i,          weight: 0.15 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.10 },
    { key: 'mentions_log',           pattern: /log|transcript|output/i,         weight: 0.10 },
  ],
  'cross-silicon-benchmark': [
    { key: 'mentions_silicon',       pattern: /apple\s*silicon|nvidia|cerebras|groq|amd\s*mi|intel/i, weight: 0.25 },
    { key: 'mentions_cathedral',     pattern: /cathedral\s*effect|substrate/i,  weight: 0.20 },
    { key: 'has_metrics',            pattern: /tokens?\/s|cost.{0,10}token|pct|percent|delta/i, weight: 0.20 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.15 },
    { key: 'mentions_cold_start',    pattern: /cold.{0,10}start|baseline/i,     weight: 0.10 },
    { key: 'has_json_or_structured', pattern: /json|csv|table|structured/i,     weight: 0.10 },
  ],
  'hardware-control-safety-case': [
    { key: 'mentions_slow_blade',    pattern: /slow\s*blade|adversar/i,         weight: 0.20 },
    { key: 'mentions_furnace',       pattern: /furnace|gear.{0,5}tooth/i,       weight: 0.20 },
    { key: 'mentions_standard',      pattern: /iec\s*62443|nist\s*800|sp\s*800/i, weight: 0.20 },
    { key: 'mentions_red_team',      pattern: /red.{0,10}team|inject|adversar/i, weight: 0.20 },
    { key: 'mentions_safety_case',   pattern: /safety\s*case|document/i,        weight: 0.10 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.10 },
  ],
  'nist-ai-rmf-mapping': [
    { key: 'mentions_nist_rmf',      pattern: /nist\s*ai\s*rmf|ai\s*risk\s*manag/i, weight: 0.25 },
    { key: 'mentions_primitives',    pattern: /wrasse|conductor|catechist|augur|furnace/i, weight: 0.25 },
    { key: 'mentions_mapping',       pattern: /mapping|cross.{0,10}ref|table/i,  weight: 0.20 },
    { key: 'mentions_all_primitives',pattern: /slow\s*blade|pheromone|stone\s*tablet/i, weight: 0.15 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.15 },
  ],
  'mikey-uk-discord-demo': [
    { key: 'mentions_handshake',     pattern: /handshake|phase\s*5|receipt/i,   weight: 0.30 },
    { key: 'mentions_cue_card',      pattern: /cue\s*card|referral/i,           weight: 0.25 },
    { key: 'mentions_uk',            pattern: /uk|united\s*kingdom|discord/i,   weight: 0.20 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.15 },
    { key: 'mentions_pied_piper',    pattern: /pied\s*piper|chain|recursive/i,  weight: 0.10 },
  ],
  'anthropic-compatible-lb-frame-demo': [
    { key: 'mentions_claude_haiku',  pattern: /haiku|claude\s*haiku|entry.{0,10}level/i, weight: 0.25 },
    { key: 'mentions_benchmark',     pattern: /r10|r11|benchmark|cathedral\s*effect/i, weight: 0.25 },
    { key: 'mentions_quality_score', pattern: /catechist|score|\d+\/10|quality/i, weight: 0.20 },
    { key: 'mentions_savings',       pattern: /savings?|cheaper?|\d+\s*%|cost/i, weight: 0.15 },
    { key: 'has_evidence_url',       pattern: /https?:\/\//i,                   weight: 0.15 },
  ],
};

// Default rubric for unknown slugs
const DEFAULT_RUBRIC = [
  { key: 'has_description',   pattern: /.{50,}/,              weight: 0.40 },
  { key: 'has_evidence_url',  pattern: /https?:\/\//i,        weight: 0.30 },
  { key: 'has_specifics',     pattern: /\d/,                  weight: 0.30 },
];

// Thresholds per tier (high=0.70, mid=0.65, standard=0.60)
const PASS_THRESHOLD_BY_SLUG: Record<string, number> = {
  'raspberry-pi-led-hardware-control': 0.70,
  'cross-silicon-benchmark':           0.70,
  'hardware-control-safety-case':      0.65,
  'nist-ai-rmf-mapping':               0.65,
  'mikey-uk-discord-demo':             0.60,
  'anthropic-compatible-lb-frame-demo': 0.65,
};

function computeFurnaceScore(bountySlug: string, text: string, evidenceUrl: string | null): number {
  const rubric = RUBRIC_BY_SLUG[bountySlug] ?? DEFAULT_RUBRIC;
  const fullText = [text, evidenceUrl ?? ''].join(' ');
  let score = 0;
  for (const criterion of rubric) {
    if (criterion.pattern.test(fullText)) {
      score += criterion.weight;
    }
  }
  return Math.min(1, Math.round(score * 100) / 100);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      submission_id,
      bounty_slug,
      description,
      evidence_url = null,
      hardware_platform = null,
    } = body;

    if (!submission_id || !bounty_slug || !description) {
      return new Response(
        JSON.stringify({ success: false, error: 'submission_id, bounty_slug, description required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullText = [description, hardware_platform ?? ''].join(' ');
    const furnaceScore = computeFurnaceScore(bounty_slug, fullText, evidence_url);
    const threshold = PASS_THRESHOLD_BY_SLUG[bounty_slug] ?? 0.60;
    const passed = furnaceScore >= threshold;
    const newStatus = passed ? 'furnace_passed' : 'furnace_failed';

    const furnaceNotes = passed
      ? `Gear-tooth-fit confirmed. Score ${furnaceScore.toFixed(2)} ≥ threshold ${threshold.toFixed(2)}. Pending Founder / community review for award.`
      : `Gear-tooth-fit insufficient. Score ${furnaceScore.toFixed(2)} < threshold ${threshold.toFixed(2)}. Please revise your submission to address the requirements more specifically.`;

    await db
      .from('bounty_submissions')
      .update({
        status: newStatus,
        furnace_score: furnaceScore,
        furnace_notes: furnaceNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission_id);

    console.log(
      `[bounty-furnace-verify] Submission ${submission_id} scored ${furnaceScore.toFixed(2)} → ${newStatus}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        submission_id,
        furnace_score: furnaceScore,
        status: newStatus,
        passed,
        notes: furnaceNotes,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[bounty-furnace-verify] error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
