/**
 * Gold Tablet Authority Enforcement — KN-N2 / BP018 Pod N
 * =========================================================
 * Authority tiers for Gold Tablet mutation:
 *
 *   platform_canon  — Founder + ratified Bishop sessions only (HMAC signer in platform-authority-list)
 *   platform_rules  — same mutation gate as platform_canon; READ open to all members
 *   project_rules   — project-scope signer can mutate within own project; READ open within Federation cohort
 *
 * Excalibur derives-from-Gold (read-only pointer — Excalibur cannot mutate Gold).
 */

import type { GoldTier } from "./schema.js";

// ─── Platform authority list ──────────────────────────────────────────────────

/**
 * Canonical list of platform-tier authority signers.
 * Matches: Founder + ratified Bishop sessions.
 * In production this would be verified against a signed allowlist.
 * For now, prefixes identify authority tier:
 *   "FOUNDER" — always platform authority
 *   "BP*"     — ratified Bishop session
 *   "K*"      — Knight session (platform authority for canonical mutations)
 */
const PLATFORM_AUTHORITY_PREFIXES = ["FOUNDER", "BP", "K"];

export function isPlatformAuthority(signer_id: string): boolean {
  return PLATFORM_AUTHORITY_PREFIXES.some((prefix) => signer_id.startsWith(prefix));
}

// ─── Authority check result ────────────────────────────────────────────────────

export interface AuthorityCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a signer_id has authority to MUTATE a given tier × scope.
 *
 * platform_canon  → platform authority required
 * platform_rules  → platform authority required
 * project_rules   → project-scope signer allowed for matching scope; platform always allowed
 */
export function checkMutationAuthority(opts: {
  tier: GoldTier;
  scope: string;
  signer_id: string;
  signer_project_scope?: string;  // for project_rules: the project this signer owns
}): AuthorityCheckResult {
  const { tier, scope, signer_id, signer_project_scope } = opts;

  if (tier === "platform_canon" || tier === "platform_rules") {
    if (!isPlatformAuthority(signer_id)) {
      return {
        allowed: false,
        reason: `${tier} mutation requires platform-tier authority (Founder or ratified session). Got signer: '${signer_id}'.`,
      };
    }
    return { allowed: true };
  }

  if (tier === "project_rules") {
    // Platform authority always allowed
    if (isPlatformAuthority(signer_id)) return { allowed: true };

    // Project signer allowed within their own scope
    if (scope !== "platform" && signer_project_scope === scope) {
      return { allowed: true };
    }

    // Cross-project mutation rejected
    return {
      allowed: false,
      reason: `project_rules mutation for scope '${scope}' rejected: signer '${signer_id}' is not platform authority and has project scope '${signer_project_scope ?? "none"}'.`,
    };
  }

  return { allowed: false, reason: `Unknown tier: ${tier}` };
}

/**
 * READ authority:
 *   platform_canon  → open to all members
 *   platform_rules  → open to all members
 *   project_rules   → open to Federation Member cohort and above, or matching project scope
 */
export function checkReadAuthority(opts: {
  tier: GoldTier;
  scope: string;
  reader_cohort_class: string;
  reader_project_scope?: string;
}): AuthorityCheckResult {
  const { tier, scope, reader_cohort_class, reader_project_scope } = opts;

  if (tier === "platform_canon" || tier === "platform_rules") {
    return { allowed: true }; // Open to all
  }

  if (tier === "project_rules") {
    const federationClasses = ["federation_member", "excalibur_subscriber", "thirteenth_warrior"];
    if (federationClasses.includes(reader_cohort_class)) return { allowed: true };
    if (scope !== "platform" && reader_project_scope === scope) return { allowed: true };
    return {
      allowed: false,
      reason: `project_rules for scope '${scope}' requires Federation Member or higher cohort. Got: '${reader_cohort_class}'.`,
    };
  }

  return { allowed: false, reason: `Unknown tier: ${tier}` };
}
