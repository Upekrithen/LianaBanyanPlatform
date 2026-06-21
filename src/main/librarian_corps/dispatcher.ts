// BP089 Mountain 3 · I-D · Librarian Corps Dispatcher
// Single entry point Dr. M uses. Routes to correct Librarian Council.
// 60s in-process path cache. Divergence threshold 0.15 (M5 Scribe Council).
// Escalation: flagship adjudicator_council fires only on divergence > 0.15.
// Wire format: hex-mcode response frames.
// Vote logging: Supabase librarian_council_vote_log (schema ss7).

import { encodeFrame } from '../wire/hex-encode';
import { buildPyramidIndex, resolveByTopic, resolveByAddress, type PyramidLayer, type PyramidHit } from './pyramid_index';
import { createLibrarian, type LibrarianRole, type LibrarianCouncilResponse, type BaseLibrarian } from './librarian';

const CACHE_TTL_MS = 60_000;
const ESCALATION_THRESHOLD = 0.15;
const VOTE_LOG_TIMEOUT_MS = 8_000;
const SUPABASE_URL: string = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const SUPABASE_ANON_KEY: string = process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

export interface DispatchRequest {
  query: string;
  preferredTier?: 'canon' | 'pearl' | 'eblet';
  returnFormat?: 'content' | 'address' | 'composes_with_chain';
}

export interface DispatchResponse {
  hit: PyramidHit | null;
  librarianRole: LibrarianRole;
  councilPackage: string;
  content: string | null;
  composesWithChain: string[];
  hexFrame: string;
  latencyMs: number;
  pyramidResolveMs: number;
  cabinetOpenMs: number;
  councilVoteMs: number;
  divergenceScore: number;
  escalated: boolean;
  fromCache: boolean;
}

interface CacheEntry { response: DispatchResponse; expireAtMs: number; }
const _responseCache = new Map<string, CacheEntry>();
let _pyramidIndex: PyramidLayer[] | null = null;
const _librarianPool = new Map<LibrarianRole, BaseLibrarian>();

function getLibrarian(role: LibrarianRole): BaseLibrarian {
  if (!_librarianPool.has(role)) _librarianPool.set(role, createLibrarian(role));
  return _librarianPool.get(role)!;
}

function supabaseHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };
}

async function writeVoteLog(params: { cabinetPath: string; librarianRole: LibrarianRole; councilPackage: string; memberVotes: LibrarianCouncilResponse['votes']; consensusYN: boolean; escalatedYN: boolean; divergenceScore: number; latencyMs: number }): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/librarian_council_vote_log`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ cabinet_path: params.cabinetPath, librarian_role: params.librarianRole, council_package: params.councilPackage, member_votes: params.memberVotes, consensus_y_n: params.consensusYN, escalated_y_n: params.escalatedYN, divergence_score: params.divergenceScore.toFixed(4), latency_ms: params.latencyMs, session_bp: 'BP089' }),
      signal: AbortSignal.timeout(VOTE_LOG_TIMEOUT_MS),
    });
  } catch { /* non-fatal */ }
}

async function getPyramidIndex(): Promise<PyramidLayer[]> {
  if (_pyramidIndex === null) _pyramidIndex = await buildPyramidIndex();
  return _pyramidIndex;
}

function selectLibrarianRole(hit: PyramidHit | null, query: string): LibrarianRole {
  if (!hit) return 'domain_librarian';
  if (hit.tier === 'canon') return 'canon_librarian';
  if (hit.tier === 'pearl') return 'pearl_librarian';
  const lq = query.toLowerCase();
  if (hit.topicTags.some(t => ['receipt', 'thunderclap'].includes(t)) || lq.includes('receipt') || lq.includes('thunderclap')) return 'receipts_librarian';
  if (hit.topicTags.some(t => ['typescript', 'sql', 'seg'].includes(t)) || lq.includes('seg') || lq.includes('typescript')) return 'code_librarian';
  if (hit.topicTags.some(t => ['downloaded', 'vendor'].includes(t)) || lq.includes('vendor')) return 'downloaded_librarian';
  if (hit.topicTags.some(t => ['food', 'gaming', 'domain'].includes(t))) return 'domain_librarian';
  return 'domain_librarian';
}

async function escalateToAdjudicator(req: DispatchRequest, councilResponse: LibrarianCouncilResponse): Promise<string | null> {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    fetch(`${SUPABASE_URL}/functions/v1/pearl-emit`, {
      method: 'POST', headers: { ...supabaseHeaders() },
      body: JSON.stringify({ pearl_id: `council_escalation_${Date.now()}`, payload: { event: 'council_escalated', query: req.query, librarianRole: councilResponse.librarianRole, divergenceScore: councilResponse.divergenceScore, bp: 'BP089' } }),
      signal: AbortSignal.timeout(5_000),
    }).catch(() => {});
  }
  const sorted = [...councilResponse.votes].sort((a, b) => a.latencyMs - b.latencyMs);
  return sorted[0]?.content ?? councilResponse.consensusContent ?? null;
}

function normalizeQueryKey(query: string): string { return query.toLowerCase().trim().replace(/\s+/g, ' '); }

function checkCache(key: string): DispatchResponse | null {
  const entry = _responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expireAtMs) { _responseCache.delete(key); return null; }
  return { ...entry.response, fromCache: true };
}

function storeCache(key: string, response: DispatchResponse): void {
  _responseCache.set(key, { response, expireAtMs: Date.now() + CACHE_TTL_MS });
}

let _dispatchCounter = 0;

export async function dispatch(req: DispatchRequest): Promise<DispatchResponse> {
  const wallStart = Date.now();
  const cacheKey = normalizeQueryKey(req.query);
  _dispatchCounter++;
  const dispatchId = `d${_dispatchCounter.toString(16).padStart(7, '0')}`;
  const cached = checkCache(cacheKey);
  if (cached) return cached;

  const pyramidStart = Date.now();
  const index = await getPyramidIndex();
  let hit: PyramidHit | null = null;
  try {
    if (/^canon_|^pearl_|::/.test(req.query)) {
      hit = await resolveByAddress(req.query, index);
    } else {
      hit = await resolveByTopic(req.query, index);
    }
    if (hit && req.preferredTier && hit.tier !== req.preferredTier) {
      const tierHit = await resolveByTopic(`${req.preferredTier} ${req.query}`, index);
      if (tierHit?.tier === req.preferredTier) hit = tierHit;
    }
  } catch { hit = null; }
  const pyramidResolveMs = Date.now() - pyramidStart;

  const librarianRole = selectLibrarianRole(hit, req.query);
  const librarian = getLibrarian(librarianRole);
  await librarian.spin_up(index);

  const councilStart = Date.now();
  const councilResponse = await librarian.council_resolve({ query: req.query, role: librarianRole, returnFormat: req.returnFormat ?? 'content' });
  const councilVoteMs = Date.now() - councilStart;
  const cabinetOpenMs = Math.max(...councilResponse.votes.map(v => v.latencyMs));

  let finalContent: string | null = councilResponse.consensusContent;
  let escalated = councilResponse.escalated;
  if (councilResponse.divergenceScore > ESCALATION_THRESHOLD) {
    finalContent = await escalateToAdjudicator(req, councilResponse);
    escalated = true;
  }

  const latencyMs = Date.now() - wallStart;
  await writeVoteLog({ cabinetPath: hit?.address ?? req.query, librarianRole, councilPackage: councilResponse.councilPackage, memberVotes: councilResponse.votes, consensusYN: !escalated, escalatedYN: escalated, divergenceScore: councilResponse.divergenceScore, latencyMs });

  const composesWithChain = [...new Set(councilResponse.votes.flatMap(v => v.composesWithChain))].slice(0, 10);
  const payload: Record<string, unknown> = { content: finalContent, address: hit?.address ?? null, composesWithChain, librarianRole, councilPackage: councilResponse.councilPackage, divergenceScore: councilResponse.divergenceScore, escalated, latencyMs, councilVoteMs, fromCache: false };
  const hexFrame = encodeFrame(dispatchId, 'answer', payload);

  const response: DispatchResponse = { hit, librarianRole, councilPackage: councilResponse.councilPackage, content: finalContent, composesWithChain, hexFrame, latencyMs, pyramidResolveMs, cabinetOpenMs, councilVoteMs, divergenceScore: councilResponse.divergenceScore, escalated, fromCache: false };
  storeCache(cacheKey, response);
  return response;
}

export function clearDispatchCache(): void { _responseCache.clear(); }

export async function teardownAllLibrarians(): Promise<void> {
  await Promise.allSettled([..._librarianPool.values()].map(l => l.teardown()));
  _librarianPool.clear(); _pyramidIndex = null;
}

export async function rebuildPyramidIndex(): Promise<void> {
  _pyramidIndex = await buildPyramidIndex();
  for (const librarian of _librarianPool.values()) await librarian.spin_up(_pyramidIndex);
}
