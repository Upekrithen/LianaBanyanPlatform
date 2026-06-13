/**
 * Per-domain Q bank loader for MMLU-Pro question banks.
 * BP081 Wave B · used by v0.1.59 Spider fan-out + v0.1.60 Deep Test tab
 *
 * Compiled output: dist/main/plow/per_domain_q_banks.js
 * At runtime __dirname = dist/main/plow/
 * Data root:  ../../../lb-reproducibility-pack/datasets/mmlu_pro_per_domain/
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  source_id: string;
  source_category: string;
}

export interface DomainStats {
  qCount: number;
  lastSealHash: string; // from SEAL.sha256
  domain: Domain;
}

export type Domain =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'computer_science'
  | 'engineering'
  | 'history'
  | 'philosophy'
  | 'law'
  | 'business'
  | 'economics'
  | 'psychology'
  | 'health'
  | 'other';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const ALL_DOMAINS: Domain[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'computer_science',
  'engineering',
  'history',
  'philosophy',
  'law',
  'business',
  'economics',
  'psychology',
  'health',
  'other',
];

const DATA_ROOT = path.join(
  __dirname,
  '../../../lb-reproducibility-pack/datasets/mmlu_pro_per_domain'
);

function domainDir(domain: Domain): string {
  return path.join(DATA_ROOT, domain);
}

// In-memory cache with 5-minute TTL
interface CacheEntry {
  questions: Question[];
  loadedAt: number; // Date.now()
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const bankCache = new Map<Domain, CacheEntry>();

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.loadedAt < CACHE_TTL_MS;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all 14 domain names.
 */
export function getDomainList(): Domain[] {
  return [...ALL_DOMAINS];
}

/**
 * Loads and parses the sealed question bank for a domain.
 * Results are cached for 5 minutes. Throws if the file is missing or malformed.
 */
export function loadDomainBank(domain: Domain): Question[] {
  const cached = bankCache.get(domain);
  if (cached && isCacheValid(cached)) {
    return cached.questions;
  }

  const filePath = path.join(domainDir(domain), 'questions.json');

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[per_domain_q_banks] Missing questions.json for domain '${domain}' at ${filePath}`
    );
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let questions: Question[];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new TypeError('questions.json must be a JSON array at top level');
    }
    questions = parsed as Question[];
  } catch (err) {
    throw new Error(
      `[per_domain_q_banks] Failed to parse questions.json for domain '${domain}': ${(err as Error).message}`
    );
  }

  bankCache.set(domain, { questions, loadedAt: Date.now() });
  return questions;
}

/**
 * Reads META.json + SEAL.sha256 for a domain and returns stats.
 * Does NOT use the cache (meta reads are cheap and infrequent).
 */
export function getDomainStats(domain: Domain): DomainStats {
  const metaPath = path.join(domainDir(domain), 'META.json');
  const sealPath = path.join(domainDir(domain), 'SEAL.sha256');

  if (!fs.existsSync(metaPath)) {
    throw new Error(
      `[per_domain_q_banks] Missing META.json for domain '${domain}' at ${metaPath}`
    );
  }
  if (!fs.existsSync(sealPath)) {
    throw new Error(
      `[per_domain_q_banks] Missing SEAL.sha256 for domain '${domain}' at ${sealPath}`
    );
  }

  const metaRaw = fs.readFileSync(metaPath, 'utf-8');
  let meta: { curation_pass_count: number; [key: string]: unknown };
  try {
    meta = JSON.parse(metaRaw) as { curation_pass_count: number; [key: string]: unknown };
  } catch (err) {
    throw new Error(
      `[per_domain_q_banks] Failed to parse META.json for domain '${domain}': ${(err as Error).message}`
    );
  }

  const sealLine = fs.readFileSync(sealPath, 'utf-8').trim();
  // Format: "sha256:<hash>  questions.json"
  const sealMatch = sealLine.match(/^sha256:([a-f0-9]{64})/);
  const lastSealHash = sealMatch ? sealMatch[1] : sealLine;

  return {
    qCount: meta.curation_pass_count as number,
    lastSealHash,
    domain,
  };
}
