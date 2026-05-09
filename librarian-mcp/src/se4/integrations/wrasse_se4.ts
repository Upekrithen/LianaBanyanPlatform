/**
 * SE-4 Wrasse Composite Trigger (Tier 3 / B-SE4-3)
 * ==================================================
 * Extends Wrasse from single-keyword point-trigger to multi-keyword
 * compositional triggers via power-set burst encoding.
 *
 * WrasseTriggerSE4.compositeMode controls matching behavior:
 *   'any'       — fire if ANY keyword matches (existing behavior, backward-compat)
 *   'all'       — fire if ALL keywords match
 *   'power-set' — fire on ANY non-empty subset match; cell_identities encodes
 *                 which subset triggered the injection
 *
 * Backward-compatible: existing single-keyword triggers continue to work as
 * compositeMode 'any' with keywords: [singleKeyword].
 *
 * WrasseCompositeReceipt carries:
 *   matchedSubset  — which keywords matched (subset of keywords array)
 *   envelope       — SE-4 envelope for the pre-injection event
 *   injectionPayload — the pre-injected content
 *
 * Integration point: wrasseFireTrigger() — wraps executeWrasseTrigger().
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-3 #1
 */

import { signShadowOutput, defaultKeyManager } from '../se4_hmac.js';
import { defaultRegistry } from '../se4_registry.js';
import type { SE4WrasseCompositeMode, SE4WrasseCompositeReceipt, SE4Envelope } from '../se4_envelope.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WrasseTriggerSE4 {
  trigger_id: string;
  keywords: string[];
  compositeMode: SE4WrasseCompositeMode;
  description: string;
  build_pre_inject: (matchedSubset: string[]) => string;
}

// ─── Power-set subset enumeration ────────────────────────────────────────────

function enumerateSubsets<T>(items: T[]): T[][] {
  const results: T[][] = [];
  const n = items.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i]);
    }
    results.push(subset);
  }
  return results;
}

// ─── Intent parse matching ────────────────────────────────────────────────────

/**
 * Check which keywords from the trigger are present in the intent string.
 * Case-insensitive substring match (mirrors existing Wrasse behavior).
 */
function matchingKeywords(intent: string, keywords: string[]): string[] {
  const lower = intent.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

// ─── wrasseFireTrigger ────────────────────────────────────────────────────────

/**
 * Execute a SE-4 Wrasse trigger against an intent string.
 *
 * For compositeMode 'power-set': fires if ANY non-empty subset of keywords
 * matches. Returns the first (largest) matching subset.
 *
 * Returns null if no match.
 */
export function wrasseFireTrigger(
  trigger: WrasseTriggerSE4,
  intent: string
): SE4WrasseCompositeReceipt | null {
  const matched = matchingKeywords(intent, trigger.keywords);

  let targetSubset: string[] | null = null;

  switch (trigger.compositeMode) {
    case 'any':
      // Fire if any keyword matches; subset = matching keywords
      if (matched.length > 0) targetSubset = matched;
      break;

    case 'all':
      // Fire only if all keywords match
      if (matched.length === trigger.keywords.length) targetSubset = matched;
      break;

    case 'power-set': {
      // Fire on the LARGEST non-empty subset match
      // (greedy: prefer richer matches)
      const allSubsets = enumerateSubsets(trigger.keywords);
      // Sort largest subsets first
      allSubsets.sort((a, b) => b.length - a.length);
      for (const subset of allSubsets) {
        if (subset.every((kw) => matched.includes(kw))) {
          targetSubset = subset;
          break;
        }
      }
      break;
    }
  }

  if (!targetSubset) return null;

  // Build pre-injection payload
  const injectionPayload = trigger.build_pre_inject(targetSubset);

  // Sign the pre-injection event with SE-4
  // cell_identities encodes which subset triggered (via bit-mask position)
  const payload = {
    trigger_id:      trigger.trigger_id,
    matched_subset:  targetSubset,
    composite_mode:  trigger.compositeMode,
    intent_fragment: intent.slice(0, 120),
    ts:              new Date().toISOString(),
  };

  const { envelope, shadow_id } = signShadowOutput('wrasse', payload, {
    registry:   defaultRegistry,
    keyManager: defaultKeyManager,
  });
  defaultRegistry.releaseId(shadow_id);

  // Encode matched subset in cell_identities alongside the registry cell
  const subsetCells = targetSubset.map((kw) => `kw_${kw.replace(/\s+/g, '_').slice(0, 20)}`);
  const envelopeWithSubset: SE4Envelope = {
    ...envelope,
    cell_identities: [...envelope.cell_identities, ...subsetCells],
  };

  return {
    matchedSubset:   targetSubset,
    envelope:        envelopeWithSubset,
    injectionPayload,
  };
}

// ─── Registry of SE-4 Wrasse triggers ────────────────────────────────────────

const _se4TriggerRegistry: WrasseTriggerSE4[] = [];

/** Register a SE-4 Wrasse trigger. */
export function registerSE4WrasseTrigger(trigger: WrasseTriggerSE4): void {
  _se4TriggerRegistry.push(trigger);
}

/**
 * Fire all registered SE-4 Wrasse triggers against an intent string.
 * Returns all non-null receipts (one per fired trigger).
 */
export function fireAllSE4WrasseTriggers(intent: string): SE4WrasseCompositeReceipt[] {
  const receipts: SE4WrasseCompositeReceipt[] = [];
  for (const trigger of _se4TriggerRegistry) {
    const receipt = wrasseFireTrigger(trigger, intent);
    if (receipt) receipts.push(receipt);
  }
  return receipts;
}

/**
 * Convert a legacy WrasseTrigger (single keyword) to a SE-4 WrasseTriggerSE4
 * with compositeMode 'any'. Backward-compatible bridge.
 */
export function legacyToSE4Trigger(opts: {
  trigger_id: string;
  trigger_phrase: string;
  build_pre_inject: () => unknown;
}): WrasseTriggerSE4 {
  return {
    trigger_id:    opts.trigger_id,
    keywords:      [opts.trigger_phrase],
    compositeMode: 'any',
    description:   `Legacy single-keyword trigger: '${opts.trigger_phrase}'`,
    build_pre_inject: (_subset: string[]) => JSON.stringify(opts.build_pre_inject()),
  };
}
