/**
 * LocalToFederation + FederationToLocal Translation Primitives — KN-J6.2 / BP018
 * ================================================================================
 * Translate IPv4-class 4-tuples ↔ IPv6-class federation addresses.
 *
 * Rules:
 *   - Lone Wolf: NEVER translates (returns error; never federates)
 *   - Pied Piper → read-only broadcast (no write-back to other frames)
 *   - Federation Member → full bidirectional
 *   - Excalibur / Thirteenth Warrior → curated-slice
 *
 * Pipeline:
 *   1. Validate cohort_class != lone_wolf
 *   2. Hash instance_id + tuple
 *   3. Build IPv6 address with scope-tier prefix
 *   4. Write provenance event to ledger
 *   5. Cache in Augur Living Gate (in-process LRU)
 *   6. Return address + provenance_id
 *
 * Composes with:
 *   KN-J6.1 ipv6_federation_address.ts
 *   KN-J5 cross_cathedral_router.ts (HsCohortClass)
 */

import { createHash, randomUUID } from "crypto";
import { existsSync, appendFileSync, readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { HsCohortClass } from "./cross_cathedral_router.js";
import {
  buildFederationAddress,
  parseFederationAddress,
  isValidIPv6,
  type IPv6FederationAddress,
  type ParsedFederationAddress,
} from "./ipv6_federation_address.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_ft = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_ft, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
const TRANSLATION_LEDGER = resolve(HS_DIR, "federation_translation_provenance.jsonl");

function ensureDir(): void {
  if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
}

// ─── In-process Augur Living Gate (LRU cache) ─────────────────────────────────

const CACHE_MAX = 500;
const _cache: Map<string, { address: IPv6FederationAddress; provenance_id: string }> = new Map();

function cacheGet(key: string) {
  return _cache.get(key) ?? null;
}

function cachePut(key: string, value: { address: IPv6FederationAddress; provenance_id: string }) {
  if (_cache.size >= CACHE_MAX) {
    const firstKey = _cache.keys().next().value as string | undefined;
    if (firstKey !== undefined) _cache.delete(firstKey);
  }
  _cache.set(key, value);
}

// ─── Provenance ledger ────────────────────────────────────────────────────────

interface TranslationProvenanceEntry {
  provenance_id: string;
  direction: "local_to_federation" | "federation_to_local";
  local_tuple?: string;
  federation_address?: IPv6FederationAddress;
  instance_id?: string;
  cohort_class: string;
  cache_hit?: boolean;
  timestamp: string;
}

function writeProvenanceLedger(entry: TranslationProvenanceEntry): void {
  try {
    ensureDir();
    appendFileSync(TRANSLATION_LEDGER, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

export function readTranslationProvenance(limit = 100): TranslationProvenanceEntry[] {
  if (!existsSync(TRANSLATION_LEDGER)) return [];
  try {
    return readFileSync(TRANSLATION_LEDGER, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as TranslationProvenanceEntry)
      .slice(-limit);
  } catch {
    return [];
  }
}

// ─── Translation primitives ───────────────────────────────────────────────────

export interface LocalToFederationOpts {
  local_tuple: string;        // 4-tuple from KN-J2 (e.g. "auth-user-session-token")
  instance_id: string;        // LB-CAT.M-NNNN
  cohort_class: HsCohortClass;
}

export interface LocalToFederationResult {
  success: boolean;
  federation_address?: IPv6FederationAddress;
  provenance_id?: string;
  cache_hit?: boolean;
  error?: string;
}

/**
 * Translate a local 4-tuple + instance to an IPv6 federation address.
 * Lone Wolf is REJECTED — never federates.
 */
export function localToFederation(opts: LocalToFederationOpts): LocalToFederationResult {
  const { local_tuple, instance_id, cohort_class } = opts;

  if (cohort_class === "lone_wolf") {
    return {
      success: false,
      error: "Lone Wolf cohort cannot translate to federation (Lone Wolf NEVER federates).",
    };
  }

  const cacheKey = `ltf:${cohort_class}:${instance_id}:${local_tuple}`;
  const cached = cacheGet(cacheKey);

  if (cached) {
    writeProvenanceLedger({
      provenance_id: cached.provenance_id,
      direction: "local_to_federation",
      local_tuple,
      federation_address: cached.address,
      instance_id,
      cohort_class,
      cache_hit: true,
      timestamp: new Date().toISOString(),
    });
    return { success: true, federation_address: cached.address, provenance_id: cached.provenance_id, cache_hit: true };
  }

  const instance_hash = createHash("sha256").update(instance_id).digest("hex").slice(0, 8);
  const tuple_hash = createHash("sha256").update(local_tuple).digest("hex").slice(0, 8);

  const federation_address = buildFederationAddress({
    cohort_class,
    instance_hash,
    tuple_hash,
    resource_suffix: local_tuple,
  });

  const provenance_id = `LB-TRANS-${randomUUID()}`;

  writeProvenanceLedger({
    provenance_id,
    direction: "local_to_federation",
    local_tuple,
    federation_address,
    instance_id,
    cohort_class,
    cache_hit: false,
    timestamp: new Date().toISOString(),
  });

  cachePut(cacheKey, { address: federation_address, provenance_id });

  return { success: true, federation_address, provenance_id, cache_hit: false };
}

export interface FederationToLocalOpts {
  federation_address: IPv6FederationAddress;
}

export interface FederationToLocalResult {
  success: boolean;
  local_tuple?: string;
  instance_id?: string;
  cohort_class?: HsCohortClass;
  error?: string;
}

/**
 * Translate a federation IPv6 address back to local 4-tuple components.
 * Performs reverse lookup from Augur cache, then provenance ledger.
 */
export function federationToLocal(opts: FederationToLocalOpts): FederationToLocalResult {
  const { federation_address } = opts;

  if (!isValidIPv6(federation_address)) {
    return { success: false, error: `Invalid IPv6 address: ${federation_address}` };
  }

  // Check cache (reverse: scan by address)
  for (const [key, val] of _cache) {
    if (val.address === federation_address && key.startsWith("ltf:")) {
      const parts = key.split(":");
      if (parts.length >= 4) {
        const cohort_class = parts[1] as HsCohortClass;
        const instance_id = parts[2];
        const local_tuple = parts.slice(3).join(":");
        return { success: true, local_tuple, instance_id, cohort_class };
      }
    }
  }

  // Fallback: scan provenance ledger
  const entries = readTranslationProvenance(1000);
  const match = entries
    .filter((e) => e.direction === "local_to_federation" && e.federation_address === federation_address)
    .slice(-1)[0];

  if (match) {
    return {
      success: true,
      local_tuple: match.local_tuple,
      instance_id: match.instance_id,
      cohort_class: match.cohort_class as HsCohortClass,
    };
  }

  // Parse address for cohort_class at minimum
  const parsed = parseFederationAddress(federation_address);
  if (parsed) {
    return {
      success: true,
      cohort_class: parsed.cohort_class,
      error: "Provenance not found — cohort_class inferred from prefix only. Full tuple recovery requires provenance ledger.",
    };
  }

  return { success: false, error: "Could not reverse-translate federation address." };
}

/** Get full translation provenance chain for a tuple or address. */
export function getTranslationProvenance(
  tuple_or_address: string
): TranslationProvenanceEntry[] {
  return readTranslationProvenance(1000).filter(
    (e) =>
      e.local_tuple === tuple_or_address ||
      e.federation_address === tuple_or_address
  );
}
