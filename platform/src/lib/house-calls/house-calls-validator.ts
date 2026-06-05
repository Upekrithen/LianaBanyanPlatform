// House Calls Validator -- BP073 · Knight Sonnet 4.6 Medium
// Validates house_call operations against the mnemosynec allowlist.
// Tier classification: 0 = auto-execute, 1 = notify-then-execute, 2 = Founder ratify, forbidden = never.

export interface HouseCallsAllowlist {
  allowlist_version: string;
  allowlist_hash: string;
  created_at: string;
  program: string;
  tiers: {
    tier_0: { label: string; operations: string[] };
    tier_1: { label: string; operations: string[] };
    tier_2: { label: string; operations: string[] };
    forbidden: { label: string; operations: string[] };
  };
  privacy_doorpost: string;
  ip_ledger_event_types: string[];
}

export type ValidationResult = {
  allowed: boolean;
  tier: 0 | 1 | 2 | 'forbidden';
  reason: string;
};

// Validates a house_call operation against the allowlist tier structure.
// Returns allowed=false for both forbidden and unrecognized operations.
export function validateHouseCallOperation(
  operation: string,
  allowlist: HouseCallsAllowlist
): ValidationResult {
  const { tiers } = allowlist;

  if (tiers.tier_0.operations.includes(operation)) {
    return { allowed: true, tier: 0, reason: tiers.tier_0.label };
  }
  if (tiers.tier_1.operations.includes(operation)) {
    return { allowed: true, tier: 1, reason: tiers.tier_1.label };
  }
  if (tiers.tier_2.operations.includes(operation)) {
    return { allowed: true, tier: 2, reason: tiers.tier_2.label };
  }
  if (tiers.forbidden.operations.includes(operation)) {
    return { allowed: false, tier: 'forbidden', reason: tiers.forbidden.label };
  }

  return {
    allowed: false,
    tier: 'forbidden',
    reason: `Operation '${operation}' is not recognized in the allowlist`,
  };
}

// Checks whether a consent_check hash matches the current allowlist version hash.
// A mismatch means the sender may be referencing a stale or spoofed allowlist.
export function verifyConsentCheck(
  consentCheckHash: string,
  allowlist: HouseCallsAllowlist
): boolean {
  return consentCheckHash === allowlist.allowlist_hash;
}
