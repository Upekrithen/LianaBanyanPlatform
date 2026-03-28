export interface ConstitutionalCheckResult {
  passed: boolean;
  constitutionalViolation: boolean;
  initiativeViolation: boolean;
  autoApproved: boolean;
  flags: string[];
  reason?: string;
}

const PRICING_KEYWORDS = ['margin', 'cost plus', 'cost+', 'pricing', 'markup', 'percentage', 'creator share', '83%', '16.7%', '20%'];
const REDUCE_KEYWORDS = ['lower', 'reduce', 'decrease', 'remove', 'eliminate'];
const VALVE_KEYWORDS = ['valve', 'withdrawal', 'cash out', 'cash-out', 'redeem', 'convert to cash', 'extract'];
const MARGIN_LOCK_KEYWORDS = ['margin', 'lock', 'unlock', 'flexible margin', 'dynamic pricing'];
const MARGIN_UNLOCK_KEYWORDS = ['unlock', 'flexible', 'dynamic', 'variable', 'adjust margin', 'change margin'];
const PROTECTION_KEYWORDS = ['privacy', 'data', 'personal information', 'tracking', 'surveillance', 'mandatory', 'require', 'force'];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function containsNearby(text: string, groupA: string[], groupB: string[], window = 80): boolean {
  const lower = text.toLowerCase();
  for (const a of groupA) {
    const idx = lower.indexOf(a.toLowerCase());
    if (idx === -1) continue;
    const slice = lower.slice(Math.max(0, idx - window), idx + a.length + window);
    if (groupB.some((b) => slice.includes(b.toLowerCase()))) return true;
  }
  return false;
}

export function runConstitutionalCheck(
  _systemId: string,
  modificationDescription: string,
  baselineConfig: { constitutional_rules?: string[] } | null
): ConstitutionalCheckResult {
  const rules = baselineConfig?.constitutional_rules ?? [];
  const flags: string[] = [];
  const desc = modificationDescription;

  // 1. Cost+20% floor check
  if (rules.includes('cost_plus_20') && containsAny(desc, PRICING_KEYWORDS)) {
    if (containsNearby(desc, PRICING_KEYWORDS, REDUCE_KEYWORDS)) {
      return {
        passed: false,
        constitutionalViolation: true,
        initiativeViolation: false,
        autoApproved: false,
        flags: ['cost_plus_20_violation'],
        reason: 'Cannot modify Cost+20% pricing floor. This is a constitutional protection.',
      };
    }
  }

  // 2. One-way valve check
  if (rules.includes('one_way_valve') && containsAny(desc, VALVE_KEYWORDS)) {
    return {
      passed: false,
      constitutionalViolation: true,
      initiativeViolation: false,
      autoApproved: false,
      flags: ['one_way_valve_violation'],
      reason: 'Cannot modify one-way valve. Credits and Marks cannot be converted to cash.',
    };
  }

  // 3. Margin lock check
  if (rules.includes('margin_lock') && containsAny(desc, MARGIN_LOCK_KEYWORDS)) {
    if (containsAny(desc, MARGIN_UNLOCK_KEYWORDS)) {
      return {
        passed: false,
        constitutionalViolation: true,
        initiativeViolation: false,
        autoApproved: false,
        flags: ['margin_lock_violation'],
        reason: 'Cannot unlock margin. The 20% margin is permanently locked by operating agreement.',
      };
    }
  }

  // 4. Member protection check
  if (containsAny(desc, PROTECTION_KEYWORDS)) {
    flags.push('member_protection_review');
    return {
      passed: true,
      constitutionalViolation: false,
      initiativeViolation: false,
      autoApproved: false,
      flags,
      reason: 'Modification may affect member protections. Requires manual review.',
    };
  }

  // 5. All checks pass
  return {
    passed: true,
    constitutionalViolation: false,
    initiativeViolation: false,
    autoApproved: true,
    flags,
  };
}
