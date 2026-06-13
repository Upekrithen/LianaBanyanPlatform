// mnem_eblet_store.ts -- BP077 v0.1.27 local eblet store reader + SEG-4 verified writer
// Reads C:\Users\Administrator\Documents\Asteroid-ProofVault\ for *.eblet.md files.
// BM25-lite scoring against user query (same algorithm pattern as substrate_router.ts).
// Returns top-3 eblet snippets as string[].
//
// SEG-4 addition: writeVerifiedEblet() appends plow-accepted Q&A pairs to
// {userData}/substrate/verified_eblets.jsonl (append-only JSONL).
// Andon discipline: verified:true gate — unverified answers NEVER cached here.
//
// Known limitation (spec §8 integration spec): the legacy EBLET_STORE_PATH is outside
// the app bundle. In packaged/installed builds, this path may not exist on the end-user
// machine. The function gracefully returns [] when the path is absent -- no crash, no
// warning surfaced to the user.

import { existsSync, readdirSync, readFileSync, appendFileSync, mkdirSync, writeFileSync, renameSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { app } from 'electron';

const EBLET_STORE_PATH = 'C:\\Users\\Administrator\\Documents\\Asteroid-ProofVault';

// Maximum chars read from each eblet file for scoring and snippet extraction.
const SCORE_WINDOW = 300;
const SNIPPET_WINDOW = 500;

const STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'have', 'they', 'will', 'been', 'were',
  'what', 'when', 'where', 'which', 'while', 'your', 'more', 'also', 'into',
  'than', 'then', 'some', 'about', 'just', 'would', 'could', 'should',
  'their', 'there', 'these', 'those', 'each', 'such', 'other', 'after',
  'over', 'under', 'only', 'very', 'still', 'well', 'back', 'even',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .filter((w) => !STOP_WORDS.has(w));
}

interface EbletEntry {
  filename: string;
  head: string;
  content: string;
  tokens: string[];
}

function loadEblets(): EbletEntry[] {
  if (!existsSync(EBLET_STORE_PATH)) return [];

  let files: string[];
  try {
    files = readdirSync(EBLET_STORE_PATH).filter((f) => f.endsWith('.eblet.md'));
  } catch {
    return [];
  }

  const entries: EbletEntry[] = [];
  for (const file of files) {
    try {
      const fullPath = `${EBLET_STORE_PATH}\\${file}`;
      const raw = readFileSync(fullPath, 'utf-8');
      const head = raw.slice(0, SCORE_WINDOW);
      const content = raw.slice(0, SNIPPET_WINDOW);
      // Score on filename tokens + first-300-chars content tokens.
      const tokens = Array.from(
        new Set([...tokenize(file.replace(/_/g, ' ')), ...tokenize(head)]),
      );
      entries.push({ filename: file, head, content, tokens });
    } catch {
      // Unreadable file -- skip
    }
  }
  return entries;
}

function bm25Score(queryTokens: string[], docTokens: string[], corpusSize: number): number {
  let score = 0;
  const docSet = new Set(docTokens);
  for (const qt of queryTokens) {
    if (docSet.has(qt)) {
      // IDF approximation: log(1 + corpus / 1) since we don't track per-term doc freq across corpus
      const idf = Math.log(1 + corpusSize);
      // TF: count occurrences
      const tf = docTokens.filter((t) => t === qt).length;
      score += idf * tf;
    }
  }
  return score;
}

/**
 * Query the local eblet store at the Asteroid-ProofVault path for files matching
 * the user query using BM25-lite. Returns top-3 eblet snippets (first 500 chars each)
 * as string[]. Returns [] if the eblet store path does not exist (expected in
 * end-user installs where the path is outside the app bundle).
 */
export async function queryEbletStore(query: string): Promise<string[]> {
  const entries = loadEblets();
  if (entries.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const corpusSize = entries.length;

  const scored = entries
    .map((e) => ({ entry: e, score: bm25Score(queryTokens, e.tokens, corpusSize) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map((r) => `[${r.entry.filename}]\n${r.entry.content}`);
}

// ─── SEG-4 v0.1.56: Verified eblet writer · SEG-1 v0.1.57: HOT retrieve path ──

export interface VerifiedEbletEntry {
  question: string;
  answer: string;
  provenance: string;   // format: spider:<name>:<session> | sprite:<id>:<session>
  verified: true;       // Andon: ONLY true entries may be written here
  sha256: string;       // sha256(question + answer)
  timestamp: number;
}

/**
 * Module-scoped telemetry counters for the HOT retrieve path.
 * Callers (ai_dispatch_ipc) increment these after each queryVerifiedEblets() call.
 * Exported as a mutable object so cross-module increments are type-safe.
 */
export const substrateCounters = { hotHits: 0, coldCalls: 0 };

const VERIFIED_STOP_WORDS = new Set([
  'the', 'a', 'is', 'what', 'how', 'why', 'when', 'where', 'who', 'of',
  'in', 'on', 'at', 'to', 'for', 'with', 'an', 'and', 'or', 'not', 'be',
  'are', 'was', 'were',
]);

function tokenizeQuestion(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter((w) => !VERIFIED_STOP_WORDS.has(w));
}

/**
 * Query the persistent verified eblet store ({userData}/substrate/verified_eblets.jsonl)
 * for Q&A pairs relevant to the user's question.
 *
 * Strategy:
 *   1. Exact match: question.trim().toLowerCase() === eblet.question.trim().toLowerCase()
 *      → return immediately as sole top hit.
 *   2. Keyword fallback: score each eblet by token overlap on (question + answer),
 *      return top-K sorted by score desc, ties broken by recency (timestamp desc).
 *
 * Edge cases:
 *   - Missing file → [] (fresh install, no crash)
 *   - Malformed JSONL line → skip + warn, continue
 *   - Empty/stopword-only question → []
 *
 * Note: VerifiedEbletEntry.sha256 stores sha256(question+answer); a direct question-string
 * equality check is used for exact-match because sha256(question) ≠ sha256(question+answer).
 */
export async function queryVerifiedEblets(question: string, topK = 3): Promise<VerifiedEbletEntry[]> {
  const ebletFile = resolve(app.getPath('userData'), 'substrate', 'verified_eblets.jsonl');
  if (!existsSync(ebletFile)) return [];

  let raw: string;
  try {
    raw = readFileSync(ebletFile, 'utf-8');
  } catch {
    return [];
  }

  const entries: VerifiedEbletEntry[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Partial<VerifiedEbletEntry>;
      if (parsed.question && parsed.answer && parsed.sha256 && parsed.verified === true) {
        entries.push(parsed as VerifiedEbletEntry);
      }
    } catch {
      console.warn('[SubstrateHOT] Malformed verified_eblets line skipped:', trimmed.slice(0, 80));
    }
  }

  if (entries.length === 0) return [];

  // Exact match on question text (case-insensitive, trimmed)
  const qNorm = question.trim().toLowerCase();
  const exact = entries.find((e) => e.question.trim().toLowerCase() === qNorm);
  if (exact) return [exact];

  // Keyword fallback
  const qTokens = tokenizeQuestion(question);
  if (qTokens.length === 0) return [];
  const qSet = new Set(qTokens);

  const scored = entries.map((e) => {
    const corpus = tokenizeQuestion(e.question + ' ' + e.answer);
    let score = 0;
    for (const tok of qSet) {
      score += corpus.filter((t) => t === tok).length;
    }
    return { entry: e, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.timestamp - a.entry.timestamp)
    .slice(0, topK)
    .map((r) => r.entry);
}

// ─── SEG-A2 BP081: Substrate stats query ──────────────────────────────────────

export interface SubstrateStats {
  totalEblets: number;
  verifiedCount: number;
  lastWriteTimestamp: number | null;
  topDomains: Array<{ domain: string; count: number; lastWrite: number }>;
  recentWrites: Array<{ questionExcerpt: string; provenanceSource: string; timestamp: number }>;
  growthTrend: Array<{ date: string; count: number }>;
  quarantinedCount: number;
  error?: string;
}

let _statsCache: { data: SubstrateStats; cachedAt: number } | null = null;
const STATS_CACHE_TTL_MS = 10_000;

/**
 * Query the verified eblet store and return aggregate substrate stats.
 * Results are cached for 10 seconds (non-blocking; synchronous after first read).
 * On empty store: returns zeros/empty arrays. On malformed store: returns best-effort + error field.
 */
export function queryStats(): SubstrateStats {
  const now = Date.now();
  if (_statsCache && now - _statsCache.cachedAt < STATS_CACHE_TTL_MS) {
    return _statsCache.data;
  }

  const ebletFile = resolve(app.getPath('userData'), 'substrate', 'verified_eblets.jsonl');

  const empty = (): SubstrateStats => ({
    totalEblets: 0,
    verifiedCount: 0,
    lastWriteTimestamp: null,
    topDomains: [],
    recentWrites: [],
    growthTrend: buildEmptyGrowthTrend(),
    quarantinedCount: 0,
  });

  if (!existsSync(ebletFile)) {
    const result = empty();
    _statsCache = { data: result, cachedAt: now };
    return result;
  }

  let raw: string;
  try {
    raw = readFileSync(ebletFile, 'utf-8');
  } catch (e) {
    const result: SubstrateStats = { ...empty(), error: String(e) };
    _statsCache = { data: result, cachedAt: now };
    return result;
  }

  const entries: VerifiedEbletEntry[] = [];
  let parseErrorCount = 0;
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Partial<VerifiedEbletEntry>;
      if (parsed.question && parsed.answer && parsed.sha256 && parsed.verified === true) {
        entries.push(parsed as VerifiedEbletEntry);
      }
    } catch {
      parseErrorCount++;
    }
  }

  const totalEblets = entries.length;
  const verifiedCount = entries.filter((e) => e.verified === true).length;
  const lastWriteTimestamp = entries.length > 0
    ? Math.max(...entries.map((e) => e.timestamp))
    : null;

  // Top domains extracted from provenance (format: type:<name>:<session> or bare string)
  const domainMap = new Map<string, { count: number; lastWrite: number }>();
  for (const e of entries) {
    const domain = e.provenance.split(':')[0] || 'unknown';
    const existing = domainMap.get(domain);
    if (!existing) {
      domainMap.set(domain, { count: 1, lastWrite: e.timestamp });
    } else {
      existing.count++;
      if (e.timestamp > existing.lastWrite) existing.lastWrite = e.timestamp;
    }
  }
  const topDomains = Array.from(domainMap.entries())
    .map(([domain, { count, lastWrite }]) => ({ domain, count, lastWrite }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const recentWrites = [...entries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
    .map((e) => ({
      questionExcerpt: e.question.slice(0, 80),
      provenanceSource: e.provenance,
      timestamp: e.timestamp,
    }));

  const growthTrend = buildGrowthTrend(entries);

  const result: SubstrateStats = {
    totalEblets,
    verifiedCount,
    lastWriteTimestamp,
    topDomains,
    recentWrites,
    growthTrend,
    quarantinedCount: 0,
    ...(parseErrorCount > 0 ? { error: `${parseErrorCount} malformed line(s) skipped` } : {}),
  };

  _statsCache = { data: result, cachedAt: now };
  return result;
}

function buildEmptyGrowthTrend(): Array<{ date: string; count: number }> {
  return buildGrowthTrend([]);
}

function buildGrowthTrend(entries: VerifiedEbletEntry[]): Array<{ date: string; count: number }> {
  const DAY_MS = 86_400_000;
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const basTs = base.getTime();

  const dayCounts = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(basTs - i * DAY_MS);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dayCounts.set(key, 0);
  }
  for (const e of entries) {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dayCounts.has(key)) {
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(dayCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── A-2 BP081 v0.1.59.1: Startup integrity check ────────────────────────────

export interface StartupIntegrityResult {
  totalLines: number;
  quarantined: number;
  malformedLines: number;
  verifiedFalseLines: number;
}

/**
 * Run on app startup: scan verified_eblets.jsonl, quarantine malformed or
 * unverified lines, rewrite clean file atomically.
 * Non-fatal: always returns a result even if checks partially fail.
 */
export async function runStartupIntegrityCheck(): Promise<StartupIntegrityResult> {
  const ebletDir = resolve(app.getPath('userData'), 'substrate');
  const ebletFile = resolve(ebletDir, 'verified_eblets.jsonl');
  const quarantineFile = resolve(ebletDir, 'eblets.quarantine.jsonl');

  const result: StartupIntegrityResult = {
    totalLines: 0,
    quarantined: 0,
    malformedLines: 0,
    verifiedFalseLines: 0,
  };

  if (!existsSync(ebletFile)) {
    return result;
  }

  let raw: string;
  try {
    raw = readFileSync(ebletFile, 'utf-8');
  } catch (e) {
    console.error('[EbletStore] Startup check: could not read eblet file:', e);
    return result;
  }

  const cleanLines: string[] = [];
  const quarantineLines: string[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    result.totalLines++;

    let parsed: Partial<VerifiedEbletEntry> | null = null;
    try {
      parsed = JSON.parse(trimmed) as Partial<VerifiedEbletEntry>;
    } catch {
      result.malformedLines++;
      result.quarantined++;
      quarantineLines.push(trimmed);
      continue;
    }

    if (parsed.verified !== true) {
      result.verifiedFalseLines++;
      result.quarantined++;
      quarantineLines.push(trimmed);
      continue;
    }

    cleanLines.push(trimmed);
  }

  // Write quarantine file (append-only)
  if (quarantineLines.length > 0) {
    try {
      if (!existsSync(ebletDir)) mkdirSync(ebletDir, { recursive: true });
      appendFileSync(quarantineFile, quarantineLines.join('\n') + '\n', 'utf-8');
    } catch (e) {
      console.error('[EbletStore] Startup check: could not write quarantine file:', e);
    }
  }

  // Atomically rewrite clean file
  try {
    const tmpFile = resolve(ebletDir, 'verified_eblets.jsonl.tmp');
    writeFileSync(tmpFile, cleanLines.join('\n') + (cleanLines.length > 0 ? '\n' : ''), 'utf-8');
    renameSync(tmpFile, ebletFile);
  } catch (e) {
    console.error('[EbletStore] Startup check: could not rewrite clean file:', e);
  }

  console.log(
    `[EbletStore] Startup check: ${result.totalLines} total, ${result.quarantined} quarantined, ` +
    `${result.malformedLines} malformed, ${result.verifiedFalseLines} verified=false survivors`,
  );

  return result;
}

/**
 * Append a plow-accepted, specialist-verified Q&A eblet to the persistent store.
 *
 * Store location: {userData}/substrate/verified_eblets.jsonl (append-only JSONL).
 * Andon discipline: the `verified: true` field is structurally required; callers that
 * cannot supply it (e.g., unverified Ollama raw output) must NOT call this function.
 *
 * Returns the sha256 of (question + answer) as write confirmation.
 */
export async function writeVerifiedEblet(entry: VerifiedEbletEntry): Promise<string> {
  if (!entry.verified) {
    console.error('[EbletStore] Andon violation: attempted write with verified=false — blocked');
    return '';
  }

  const ebletDir = resolve(app.getPath('userData'), 'substrate');
  const ebletFile = resolve(ebletDir, 'verified_eblets.jsonl');

  if (!existsSync(ebletDir)) {
    mkdirSync(ebletDir, { recursive: true });
  }

  const expectedSha = createHash('sha256')
    .update(entry.question + entry.answer)
    .digest('hex');

  const line = JSON.stringify({
    question: entry.question,
    answer: entry.answer,
    provenance: entry.provenance,
    verified: true,
    sha256: expectedSha,
    timestamp: entry.timestamp,
  });

  appendFileSync(ebletFile, line + '\n', 'utf-8');
  return expectedSha;
}
