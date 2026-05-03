/**
 * IPv6 Federation Address Scheme — KN-J6.1 / BP018
 * ==================================================
 * Dual-tier coordinate addressing:
 *   LOCAL  → IPv4-class 4-tuple (KN-J2; unchanged)
 *   FEDERATION → IPv6-class 8-group hexadecimal at federation boundary
 *
 * Scope-tier prefixes encode HsCohortClass structurally:
 *   Lone Wolf       → fe80:: (link-local; NEVER federates)
 *   Pied Piper      → fc00:: (unique-local; small-group private federation)
 *   Federation Member → 2001:db8:6c:: (global unicast; 6c = ASCII 'l' for LianaBanyan)
 *   Excalibur Class → 2001:db8:6c:65:: (65 = ASCII 'e' for Excalibur)
 *   Thirteenth Warrior → 2001:db8:6c:78:: (78 = ASCII 'x' for XIII)
 *
 * Founder ratification (BP018):
 *   "can we expand in advance to IPv6 with hexadecimal? It opens up the possibilities.
 *    I would think it would be better to keep (our equivalent to) IPv4 with the TCP/IP
 *    setup we are using FOR THE SUB of each LB Frame Local. But when translating /
 *    transferring to FEDERATION, we make it hexadecimal, for obvious reasons."
 *
 * Composes with:
 *   KN-J2 coordinate_scheme.ts (4-tuple unchanged for LOCAL)
 *   KN-J5 cross_cathedral_router.ts (extended for IPv6 wildcard patterns)
 *   KN-J6.2 federation_translation.ts (LocalToFederation + FederationToLocal primitives)
 */

import type { HsCohortClass } from "./cross_cathedral_router.js";
import { createHash } from "crypto";

// ─── Scope-tier prefixes ──────────────────────────────────────────────────────

export const SCOPE_TIER_PREFIXES: Record<HsCohortClass, string> = {
  lone_wolf:             "fe80::",
  pied_piper_tier_1:     "fc00::",
  federation_member:     "2001:db8:6c::",    // 6c = ASCII 'l' (LianaBanyan)
  excalibur_subscriber:  "2001:db8:6c:65::", // 65 = ASCII 'e' (Excalibur)
  thirteenth_warrior:    "2001:db8:6c:78::", // 78 = ASCII 'x' (XIII)
} as const;

/** Canonical 128-bit IPv6 address string (8 hex groups, zero-compressed). */
export type IPv6FederationAddress = string;

// ─── Build a federation address ───────────────────────────────────────────────

export interface BuildFederationAddressOpts {
  cohort_class: HsCohortClass;
  instance_hash: string;     // hash of LB Frame Local instance ID
  tuple_hash: string;        // hash of original IPv4-tuple
  resource_suffix: string;   // semantic resource identifier
}

/**
 * Build an IPv6 federation address from cohort_class + instance + tuple hashes.
 * Format: <scope-prefix><instance-4hex>:<tuple-4hex>:<resource-4hex>:0
 *
 * Uses hash(instance_hash) and hash(tuple_hash) for the middle groups.
 * The scope-tier prefix encodes cohort_class.
 */
export function buildFederationAddress(opts: BuildFederationAddressOpts): IPv6FederationAddress {
  const prefix = SCOPE_TIER_PREFIXES[opts.cohort_class];

  // Derive 4-hex groups from hashes
  const instH = createHash("sha256").update(opts.instance_hash).digest("hex").slice(0, 4);
  const tupleH = createHash("sha256").update(opts.tuple_hash).digest("hex").slice(0, 4);
  const resH = createHash("sha256").update(opts.resource_suffix).digest("hex").slice(0, 4);

  // Build full 128-bit address:
  // prefix already provides first N groups; fill remainder
  // We embed: prefix::<instH>:<tupleH>:<resH>:0000
  const addr = buildFullAddress(prefix, instH, tupleH, resH);
  return canonicalizeIPv6(addr);
}

/** Build raw 8-group address from scope prefix + 3 derived groups. */
function buildFullAddress(prefix: string, instH: string, tupleH: string, resH: string): string {
  // Normalize prefix: remove trailing '::'
  // prefix forms are like "fe80::", "2001:db8:lb::"
  // We need exactly 8 groups; prefix fills the first N groups
  const prefix_clean = prefix.replace(/::/g, "").replace(/:$/, "");
  const prefix_groups = prefix_clean ? prefix_clean.split(":") : [];

  // Payload: instH, tupleH, resH, padding
  const payload_groups = [instH, tupleH, resH, "0000"];

  // Total groups = 8; middle groups = 8 - prefix_groups.length - payload_groups.length
  const middle_count = 8 - prefix_groups.length - payload_groups.length;
  const middle_groups = Array.from({ length: Math.max(0, middle_count) }, () => "0000");

  const all_groups = [...prefix_groups, ...middle_groups, ...payload_groups];

  // Ensure exactly 8 groups (truncate or pad)
  while (all_groups.length < 8) all_groups.push("0000");
  const final_groups = all_groups.slice(0, 8);

  return final_groups.join(":");
}

// ─── Parse a federation address ───────────────────────────────────────────────

export interface ParsedFederationAddress {
  cohort_class: HsCohortClass;
  instance_hash: string;
  tuple_hash: string;
  resource_suffix: string;
  raw: IPv6FederationAddress;
}

/**
 * Parse a federation address back to its components.
 * Reads the scope-tier prefix to determine cohort_class.
 * Instance, tuple, resource hashes are in groups 5-7.
 */
export function parseFederationAddress(addr: IPv6FederationAddress): ParsedFederationAddress | null {
  try {
    const expanded = expandIPv6(addr);
    if (!expanded) return null;

    const groups = expanded.split(":");
    if (groups.length !== 8) return null;

    const cohort_class = inferCohortClass(expanded);
    if (!cohort_class) return null;

    // instance_hash in group 5, tuple_hash in group 6, resource in group 7
    return {
      cohort_class,
      instance_hash: groups[4],
      tuple_hash: groups[5],
      resource_suffix: groups[6],
      raw: addr,
    };
  } catch {
    return null;
  }
}

// ─── Cohort inference from prefix ─────────────────────────────────────────────

/** Infer HsCohortClass from scope-tier prefix of an expanded IPv6 address. */
export function inferCohortClass(addr: string): HsCohortClass | null {
  const expanded = expandIPv6(addr);
  if (!expanded) return null;

  // Check prefixes from most-specific to least-specific
  if (expanded.startsWith("2001:0db8:006c:0078")) return "thirteenth_warrior"; // 2001:db8:lb:xiii
  if (expanded.startsWith("2001:0db8:006c:0065")) return "excalibur_subscriber"; // 2001:db8:lb:excl
  if (expanded.startsWith("2001:0db8:006c")) return "federation_member";          // 2001:db8:lb
  if (expanded.startsWith("fc00")) return "pied_piper_tier_1";
  if (expanded.startsWith("fe80")) return "lone_wolf";
  return null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validate an IPv6 address string. Returns true if parseable as valid IPv6. */
export function isValidIPv6(addr: string): boolean {
  try {
    return expandIPv6(addr) !== null;
  } catch {
    return false;
  }
}

/** Expand an IPv6 address (with :: zero-compression) to full 8-group form. */
export function expandIPv6(addr: string): string | null {
  if (!addr || typeof addr !== "string") return null;

  // Already expanded?
  const groups = addr.split(":");
  if (groups.length === 8 && !addr.includes("::") && groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) {
    return groups.map((g) => g.toLowerCase().padStart(4, "0")).join(":");
  }

  // Handle :: zero-compression
  if (addr.includes("::")) {
    const [left, right] = addr.split("::");
    const leftGroups = left ? left.split(":") : [];
    const rightGroups = right ? right.split(":") : [];
    const zeroCount = 8 - leftGroups.length - rightGroups.length;
    if (zeroCount < 0) return null;
    const zeros = Array.from({ length: zeroCount }, () => "0000");
    const full = [...leftGroups, ...zeros, ...rightGroups];
    if (full.length !== 8) return null;
    if (!full.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
    return full.map((g) => g.toLowerCase().padStart(4, "0")).join(":");
  }

  return null;
}

/** Canonicalize: expand, then apply longest-run zero-compression. */
export function canonicalizeIPv6(addr: string): string {
  const expanded = expandIPv6(addr);
  if (!expanded) return addr; // return as-is if unparseable

  // Apply zero-compression (longest run of consecutive 0000 groups)
  const groups = expanded.split(":");
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  let runLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === "0000") {
      if (runStart === -1) { runStart = i; runLen = 1; }
      else runLen++;
      if (runLen > bestLen) { bestStart = runStart; bestLen = runLen; }
    } else {
      runStart = -1; runLen = 0;
    }
  }

  if (bestStart !== -1 && bestLen > 1) {
    const left = groups.slice(0, bestStart).map((g) => g.replace(/^0+/, "") || "0");
    const right = groups.slice(bestStart + bestLen).map((g) => g.replace(/^0+/, "") || "0");
    const leftStr = left.join(":");
    const rightStr = right.join(":");
    return (leftStr && rightStr) ? `${leftStr}::${rightStr}` : leftStr ? `${leftStr}::` : `::${rightStr}`;
  }

  return groups.map((g) => g.replace(/^0+/, "") || "0").join(":");
}
