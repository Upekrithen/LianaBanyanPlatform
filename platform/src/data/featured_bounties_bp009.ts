/**
 * featured_bounties_bp009 — Static seed data for LB Frame v1 featured Bounties
 * KN088 / BP009. Six Bounties shipped in LB Frame v1.
 *
 * These Bounties crowdsource empirical anchors that Path B requires before
 * Wave 1 enterprise outreach (NIST + DARPA + Anthropic + Chip-maker cohort).
 *
 * Per KN088 spec:
 *   - Raspberry Pi LED demo → Robotics Provisional (Prov-17/18+) empirical anchor
 *   - Cross-silicon benchmark → Chip-maker Wave 1 cohort empirical anchor
 *   - Hardware-control safety case → USCYBERCOM/CISA cyber-physical safety
 *   - NIST AI RMF mapping → NIST standards-body conversation
 *   - Mikey UK Discord demo → International Federation tier-1
 *   - Anthropic-compatible demo → Anthropic partner-lane Wave 1
 *
 * Composes with:
 *   - Stance on Competition / Kallistra framing (each Bounty ships with "make more WITH us")
 *   - Dual-license framework (#2314): license_scope = "AGPL" | "Apache" | "Both"
 *   - Marks as reward currency (closed-loop, no fiat cashout per BRIDLE Rule 2)
 */

export interface FeaturedBounty {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  empiricalAnchor: string;
  enterpriseCohort: string | null;
  rewardMarks: number;
  rewardCurrency: 'Marks' | 'Credits';
  licenseScope: 'AGPL' | 'Apache' | 'Both';
  featuredOrder: number;
  verificationMethod: string;
  submissionRequirements: string;
  tier: 'high' | 'mid' | 'standard';
  iconEmoji: string;
}

export const FEATURED_BOUNTIES_BP009: FeaturedBounty[] = [
  {
    slug: 'raspberry-pi-led-hardware-control',
    title: 'Raspberry Pi LED Hardware Control',
    tagline: 'Prove cheap AI + LB substrate can reliably operate physical hardware.',
    description:
      'Demonstrate substrate-routed hardware control on a Raspberry Pi: use LB Frame ' +
      '(Haiku-tier AI + Wrasse pre-injection + Furnace verification) to control LED or servo output ' +
      'with >99% command reliability. This proves the Robotics Provisional empirical claim: ' +
      'cheaper AI + LB substrate = reliable hardware control without a frontier model.',
    empiricalAnchor: 'Robotics Provisional (Prov-17/18+) — claim 1: method for controlling physical hardware via AI executing pre-assembled canonical circuits',
    enterpriseCohort: 'NSA / DARPA / Sony / Boston Dynamics / Tesla Optimus',
    rewardMarks: 1000,
    rewardCurrency: 'Marks',
    licenseScope: 'Both',
    featuredOrder: 1,
    verificationMethod: 'Furnace gear-tooth-fit score ≥ 0.90 + video Shutterbug receipt showing hardware actuation + hardware log transcript',
    submissionRequirements:
      'Video (≥ 60s) showing Raspberry Pi receiving commands from LB Frame with LB substrate visible. ' +
      'Hardware log showing >20 successful actuations. GitHub repo link with reproducible setup. ' +
      'State which AI tier (Haiku/Sonnet/Opus) was used and the cost per command.',
    tier: 'high',
    iconEmoji: '🤖',
  },
  {
    slug: 'cross-silicon-benchmark',
    title: 'Cross-Silicon Benchmark',
    tagline: 'Run LB substrate across Apple Silicon, NVIDIA H100, and Cerebras — compare cost and quality.',
    description:
      'Replicate the KN042 substrate-routed memory expansion test on at least two of: ' +
      'Apple Silicon (M3/M4), NVIDIA H100, Cerebras CS-2/CS-3, Groq LPU, AMD MI300X. ' +
      'Report: tokens/second, cost per token, Cathedral Effect quality gain vs cold-start baseline, ' +
      'Conductor model-tier routing savings. Each approved silicon variant earns the full reward independently.',
    empiricalAnchor: 'Chip-maker Wave 1 cohort empirical anchor — NVIDIA / AMD / Intel / Cerebras / Groq / Sambanova / Apple outreach',
    enterpriseCohort: 'NVIDIA / AMD / Intel / Cerebras / Groq / Sambanova / Apple',
    rewardMarks: 1000,
    rewardCurrency: 'Marks',
    licenseScope: 'Both',
    featuredOrder: 2,
    verificationMethod: 'Catechist verification of methodology + KN042 replication protocol + substrate-savings telemetry output',
    submissionRequirements:
      'Submit a structured JSON report per silicon: {platform, model_tier, tokens_per_sec, ' +
      'cost_per_token_usd, cathedral_effect_delta_pct, conductor_savings_pct}. ' +
      'Include raw log files. Each unique silicon platform earns the full reward independently.',
    tier: 'high',
    iconEmoji: '⚡',
  },
  {
    slug: 'hardware-control-safety-case',
    title: 'Hardware-Control Safety Case',
    tagline: 'Write a cyber-physical safety case using Slow Blade V2 + Furnace on an LB-Frame-controlled device.',
    description:
      'Produce a structured safety case document demonstrating Slow Blade V2 adversarial defense ' +
      '+ Furnace gear-tooth-fit verification protecting a hardware control loop. ' +
      'Map each substrate primitive to an IEC 62443 / NIST SP 800-82 control. ' +
      'Include at least one red-team attempt (adversarial injection) showing the defense firing.',
    empiricalAnchor: 'USCYBERCOM / CISA hardware safety + AI safety standards body conversation',
    enterpriseCohort: 'USCYBERCOM / CISA / NIST',
    rewardMarks: 500,
    rewardCurrency: 'Marks',
    licenseScope: 'Both',
    featuredOrder: 3,
    verificationMethod: 'Slow Blade V2 defense log + Furnace gear-tooth-fit score ≥ 0.85 + structured safety case peer-reviewed by two community members',
    submissionRequirements:
      'Submit: (1) safety case PDF/MD per standard template, ' +
      '(2) red-team log showing at least one adversarial command attempt intercepted, ' +
      '(3) Furnace verification transcript, ' +
      '(4) IEC 62443 / NIST 800-82 mapping table. Two community members must co-sign the review.',
    tier: 'mid',
    iconEmoji: '🛡️',
  },
  {
    slug: 'nist-ai-rmf-mapping',
    title: 'NIST AI RMF Mapping',
    tagline: 'Map every LB substrate primitive to the NIST AI Risk Management Framework.',
    description:
      'Produce a complete cross-reference mapping every substrate primitive ' +
      '(Wrasse, Conductor\'s Baton, Cathedral Effect, Augur, Furnace, Slow Blade, ' +
      'Pheromone, Stone Tablet, CheckBook Suite, Catechist) to the relevant ' +
      'NIST AI RMF 1.0 function, category, and subcategory. Verified by Catechist for completeness. ' +
      'This establishes substrate as an empirical standards primitive (#2299) before the NIST conversation.',
    empiricalAnchor: 'NIST AI standards-body conversation — establishing substrate as empirical standards primitive (#2299)',
    enterpriseCohort: 'NIST / DARPA / Anthropic Wave 1 cohort',
    rewardMarks: 500,
    rewardCurrency: 'Marks',
    licenseScope: 'Both',
    featuredOrder: 4,
    verificationMethod: 'Catechist verification of completeness across all R01-R10 primitives + cross-reference table reviewed by Founder',
    submissionRequirements:
      'Submit a structured mapping table (CSV or MD): rows = substrate primitives, ' +
      'columns = NIST AI RMF Function / Category / Subcategory / Gap-or-Gap-free / Evidence. ' +
      'Must cover all 10 substrate primitives. Catechist will score completeness.',
    tier: 'mid',
    iconEmoji: '📋',
  },
  {
    slug: 'mikey-uk-discord-demo',
    title: 'Mikey UK Discord Demo',
    tagline: 'First international LB Frame Handshake + Cue Card send from the UK.',
    description:
      'Complete a full LB Frame Handshake on a UK-based machine, send at least one Cue Card ' +
      'via the one-button mechanic, and document the onboarding chain (sender → recipient → ' +
      'recipient\'s own Handshake if possible). This is the first Federation member outside the US — ' +
      'Pied Piper recursion empirical receipt.',
    empiricalAnchor: 'International Federation member tier-1 onboarding — Pied Piper recursion chain (Mikey UK, Discord)',
    enterpriseCohort: 'International Federation — UK',
    rewardMarks: 250,
    rewardCurrency: 'Marks',
    licenseScope: 'AGPL',
    featuredOrder: 5,
    verificationMethod: 'LB Frame Handshake Phase 5 receipt artifact from UK machine + Cue Card send confirmation + creator_referrals row showing HANDSHAKE_COMPLETED',
    submissionRequirements:
      'Submit: (1) Phase 5 Handshake receipt artifact (HANDSHAKE_RECEIPT_<session>_<date>.md), ' +
      '(2) screenshot of Cue Card send confirmation, ' +
      '(3) referral DB row showing handshake_vesting_state = HANDSHAKE_COMPLETED. ' +
      'Bonus: recipient also completes Handshake → full Pied Piper chain receipt.',
    tier: 'standard',
    iconEmoji: '🌍',
  },
  {
    slug: 'anthropic-compatible-lb-frame-demo',
    title: 'Anthropic-Compatible LB Frame Demo',
    tagline: 'Demonstrate LB substrate amplifying Claude Haiku to near-Sonnet quality on the R10 benchmark.',
    description:
      'Run the Cathedral Effect R10/R11 benchmark with LB substrate on Anthropic Claude Haiku ' +
      '(or equivalent entry-level tier), demonstrating it achieves quality scores within 10% of ' +
      'Sonnet on knowledge-retrieval questions. This is the empirical anchor for the Anthropic ' +
      'partner-lane Wave 1 conversation — substrate making cheap models capable.',
    empiricalAnchor: 'Anthropic partner-lane Wave 1 cohort empirical anchor',
    enterpriseCohort: 'Anthropic / Partner Wave 1',
    rewardMarks: 500,
    rewardCurrency: 'Marks',
    licenseScope: 'Both',
    featuredOrder: 6,
    verificationMethod: 'R10/R11 benchmark protocol results + Catechist scoring + substrate-savings telemetry showing model tier used',
    submissionRequirements:
      'Submit: (1) R10 or R11 benchmark results JSON per standard protocol, ' +
      '(2) model tier log (must show Haiku or equivalent, NOT Sonnet/Opus), ' +
      '(3) Catechist score ≥ 8/10 on knowledge-retrieval questions, ' +
      '(4) cost comparison vs cold-start Sonnet equivalent showing savings ≥ 30%.',
    tier: 'mid',
    iconEmoji: '🧠',
  },
  // KN094 / BP011 — Bounty #7: first community-empirical-tuning-class Bounty.
  // Founder ratified 2026-05-01 (BP011 turn 16). Extends KN088 6→7.
  {
    slug: 'heartbeat-interval-tuning',
    title: 'Heartbeat Interval Tuning — Empirical Cohort-Detection Accuracy',
    tagline: 'Tune the Iron E-Giant\'s heartbeat. Receipt empirical. Earn Marks.',
    description:
      'Find a heartbeat interval setting that beats the BP011 baseline (60s → 100% cohort-overlap-refresh ' +
      'detection across 5/5 scenarios, KN091 commit a3cc7a2). Adjust `iron_tablet_metrics_config.yaml` ' +
      'within the allowed range [30s, 300s], run a 24-hour synthetic 8-Shadow test, ' +
      'report cohort-detect accuracy and Stone Tablet storage cost. ' +
      'If your setting achieves ≥95% accuracy with lower storage cost, you earn the Marks. ' +
      'Kallistra framing: "Tune your own heartbeat — and earn Marks every time you find a better ' +
      'setting than ours. We pay for empirical receipts that strengthen the substrate."',
    empiricalAnchor:
      'KN091 commit a3cc7a2 baseline: 60s heartbeat → 100% cohort-overlap-refresh detection in ' +
      '5/5 BP011 test scenarios. Iron E-Giant Federation operations — empirical tuning by community ' +
      'members running their own Federation member-LB-Frames.',
    enterpriseCohort: null,
    rewardMarks: 500,
    rewardCurrency: 'Marks',
    // AGPL Community default; Apache 2.0 if submitter attaches dual-license assertion
    licenseScope: 'AGPL',
    featuredOrder: 7,
    verificationMethod:
      'Furnace cross-org rubric (KN091 furnace_cross_org.py); weighted score = ' +
      '0.6 × (accuracy_pct / 100) + 0.2 × (1 − storage_overrun_pct) + 0.2 × (1 − latency_overrun_pct). ' +
      'Pass threshold 0.65. Anti-farming: vesting at Furnace pass + independent reproducibility re-run ' +
      'by another organism within 7 days.',
    submissionRequirements:
      'Submit: (a) adjusted iron_tablet_metrics_config.yaml snippet within bounded range [30s, 300s]; ' +
      '(b) 24-hour synthetic 8-Shadow run transcript; ' +
      '(c) cohort-detect-accuracy-pct measured and reported; ' +
      '(d) Stone Tablet rolling-30-day MB measured and reported. ' +
      'Reward is declining-rate per creator_referrals tier: first 3 submissions earn full 500 Marks; ' +
      'subsequent earn 250–100 Marks. Apache 2.0 dual-license available if submitter asserts it.',
    tier: 'mid',
    iconEmoji: '💓',
  },
];

export function getBountyBySlug(slug: string): FeaturedBounty | undefined {
  return FEATURED_BOUNTIES_BP009.find((b) => b.slug === slug);
}
