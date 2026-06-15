/**
 * ram_detector.ts — v0.4.2 BP083 SEG-3
 *
 * Detects available system RAM and returns the hardware tier for model selection.
 * Cooperative-class onboarding: auto-detect and recommend — never guess, never fail silently.
 */

import { totalmem } from 'os';

export type HardwareTier = 'lightweight' | 'standard' | 'premium' | 'heavy';

export interface HardwareTierInfo {
  tier: HardwareTier;
  ramGb: number;
  recommendedModel: string;
  displayName: string;
  description: string;
  mmluProExpected: string;
}

const TIER_DEFS: Record<HardwareTier, Omit<HardwareTierInfo, 'tier' | 'ramGb'>> = {
  lightweight: {
    recommendedModel: 'gemma2:2b',
    displayName: 'Lightweight (gemma2:2b)',
    description: 'For machines with 6–11 GB RAM. Substrate compensates for smaller model context.',
    mmluProExpected: '~50–70% MMLU-Pro (substrate-compensated)',
  },
  standard: {
    recommendedModel: 'qwen2.5:7b',
    displayName: 'Standard (qwen2.5:7b)',
    description: 'For machines with 12–15 GB RAM. Strong reasoning with good efficiency.',
    mmluProExpected: '~75–85% MMLU-Pro',
  },
  premium: {
    recommendedModel: 'gemma4:12b',
    displayName: 'Premium (gemma4:12b)',
    description: 'For machines with 16+ GB RAM. The Founder M0 baseline model — 97.1% on canonical 70-q.',
    mmluProExpected: '97.1% MMLU-Pro (Founder M0 canonical receipt)',
  },
  heavy: {
    recommendedModel: 'llama3.3:70b-instruct-q4_K_M',
    displayName: 'Heavy (llama3.3:70b)',
    description: 'Opt-in advanced tier for 48+ GB RAM. Research-grade accuracy. NOT auto-recommended — click to switch.',
    mmluProExpected: 'Research-grade (not yet benchmarked in cooperative)',
  },
};

/**
 * Returns total system RAM in GB (rounded to 1 decimal).
 */
export function getTotalRamGb(): number {
  return Math.round((totalmem() / (1024 * 1024 * 1024)) * 10) / 10;
}

/**
 * Maps system RAM to a hardware tier.
 *
 * Thresholds (BP083 SEG-5 tuning):
 *   < 12 GB  → lightweight (gemma2:2b, ~3 GB VRAM)
 *   12–15 GB → standard    (qwen2.5:7b, ~8 GB VRAM)
 *   16+ GB   → premium     (gemma4:12b, ~10 GB VRAM) — DEFAULT for all 16+ GB machines
 *
 * NOTE: 'heavy' (llama3.3:70b) is NEVER auto-recommended.
 * It is available as opt-in via Settings — user must explicitly switch.
 * M0 at 61.6 GB maps to 'premium' by default.
 */
export function getTierForRam(ramGb: number): HardwareTier {
  if (ramGb < 12) return 'lightweight';
  if (ramGb < 16) return 'standard';
  return 'premium'; // 16+ GB always gets premium as default; heavy is opt-in only
}

/**
 * Returns the full tier info for the current machine.
 */
export function detectHardwareTier(): HardwareTierInfo {
  const ramGb = getTotalRamGb();
  const tier = getTierForRam(ramGb);
  return {
    tier,
    ramGb,
    ...TIER_DEFS[tier],
  };
}

/**
 * Returns just the recommended model name for the current machine.
 */
export function getRecommendedModel(): string {
  return detectHardwareTier().recommendedModel;
}

/**
 * All tier definitions — for Settings UI display.
 */
export function getAllTiers(): HardwareTierInfo[] {
  const ramGb = getTotalRamGb();
  return (['lightweight', 'standard', 'premium', 'heavy'] as HardwareTier[]).map((tier) => ({
    tier,
    ramGb,
    ...TIER_DEFS[tier],
  }));
}
