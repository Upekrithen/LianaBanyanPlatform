// BP089 Mountain 3 · I-B · Librarian Corps Role
// Each Librarian is a persistent SEG with domain authority and cabinet keys.
// 3-member Minor Council via Marathon 4 librarian_council Court Package.
// Council: 3 independent sub-Librarians, disjoint sub-contexts, Promise.all fan-out.
// Variance threshold: 15% (M5 Scribe Council inheritance).
// SEG lineage: SEG -> Persistent SEG (M4/M5) -> Librarian SEG -> Librarian Minor Council

import { queryEbletStore } from '../mnem_eblet_store';
import { openCabinet, type CabinetContents } from './file_cabinet';
import { resolveByTopic, resolveByAddress, type PyramidLayer, type PyramidHit } from './pyramid_index';

export type LibrarianRole = 'domain_librarian' | 'pearl_librarian' | 'canon_librarian' | 'receipts_librarian' | 'code_librarian' | 'downloaded_librarian';

export interface LibrarianRequest {
  query: string;
  role: LibrarianRole;
  returnFormat: 'content' | 'address' | 'composes_with_chain';
}

export interface SubLibrarianVote {
  memberId: 1 | 2 | 3;
  subContext: string;
  hit: PyramidHit | null;
  content: string | null;
  resolvedAddress: string | null;
  composesWithChain: string[];
  latencyMs: number;
}

export interface LibrarianCouncilResponse {
  votes: [SubLibrarianVote, SubLibrarianVote, SubLibrarianVote];
  consensusContent: string | null;
  consensusAddress: string | null;
  divergenceScore: number;
  escalated: boolean;
  wallClockMs: number;
  librarianRole: LibrarianRole;
  councilPackage: string;
}

const SUB_CONTEXT_MAP: Record<LibrarianRole, [string, string, string]> = {
  canon_librarian:      ['canon_eblets_1-50',    'canon_eblets_51-100',  'canon_eblets_101-150'],
  pearl_librarian:      ['pearl_sessions_1-30',  'pearl_sessions_31-60', 'pearl_sessions_61+'],
  receipts_librarian:   ['thunderclap_shard_A',  'thunderclap_shard_B',  'thunderclap_shard_C'],
  domain_librarian:     ['domain_food',           'domain_gaming',        'domain_membership_publishing'],
  code_librarian:       ['src_typescript',        'sql_schema',           'seg_scripts'],
  downloaded_librarian: ['vendor_docs_A',          'vendor_docs_B',        'reference_material'],
};

const COUNCIL_PACKAGE_MAP: Record<LibrarianRole, string> = {
  canon_librarian: 'canon_council_v1', pearl_librarian: 'pearl_council_v1',
  receipts_librarian: 'eblet_council_v1', domain_librarian: 'eblet_council_v1',
  code_librarian: 'eblet_council_v1', downloaded_librarian: 'eblet_council_v1',
};

const CABINET_PARTITION_MAP: Record<LibrarianRole, string> = {
  canon_librarian: 'canon', pearl_librarian: 'pearl', receipts_librarian: 'receipts',
  domain_librarian: 'eblet', code_librarian: 'code', downloaded_librarian: 'downloaded',
};

async function runSubLibrarian(memberId: 1 | 2 | 3, subContext: string, req: LibrarianRequest, index: PyramidLayer[]): Promise<SubLibrarianVote> {
  const t0 = Date.now();
  const scopedQuery = `${req.query} ${subContext.replace(/_/g, ' ')}`;
  let hit: PyramidHit | null = null;
  try {
    if (req.query.includes('::') || req.query.startsWith('canon_') || req.query.startsWith('pearl_')) {
      hit = await resolveByAddress(req.query, index);
    } else {
      hit = await resolveByTopic(scopedQuery, index);
    }
  } catch { hit = null; }
  let content: string | null = null;
  const resolvedAddress: string | null = hit?.address ?? null;
  const composesWithChain: string[] = hit?.composesWithChain ?? [];
  if (hit?.address) {
    const cabinetResult = await openCabinet({ substratePath: hit.address, partition: CABINET_PARTITION_MAP[req.role] }, req.role);
    if (!('code' in cabinetResult)) content = (cabinetResult as CabinetContents).content;
  }
  if (!content) {
    try {
      const snippets = await queryEbletStore(scopedQuery.slice(0, 80));
      if (snippets.length > 0) content = snippets.slice(0, 2).join('\n---\n');
    } catch { content = null; }
  }
  if (req.returnFormat === 'address') content = resolvedAddress;
  else if (req.returnFormat === 'composes_with_chain') content = composesWithChain.join(' · ');
  return { memberId, subContext, hit, content, resolvedAddress, composesWithChain, latencyMs: Date.now() - t0 };
}

function computeConsensus(votes: [SubLibrarianVote, SubLibrarianVote, SubLibrarianVote]): { consensusContent: string | null; consensusAddress: string | null; divergenceScore: number } {
  const addresses = votes.map(v => v.resolvedAddress ?? '');
  const addressCounts = new Map<string, number>();
  for (const a of addresses) addressCounts.set(a, (addressCounts.get(a) ?? 0) + 1);
  let majorityAddress: string | null = null; let majorityCount = 0;
  for (const [addr, count] of addressCounts.entries()) { if (count > majorityCount) { majorityCount = count; majorityAddress = addr || null; } }
  const dissenters = votes.filter(v => (v.resolvedAddress ?? '') !== (majorityAddress ?? '')).length;
  const divergenceScore = dissenters / 3;
  const majorityVote = votes.find(v => (v.resolvedAddress ?? '') === (majorityAddress ?? ''));
  return { consensusContent: majorityVote?.content ?? null, consensusAddress: majorityAddress, divergenceScore };
}

export abstract class BaseLibrarian {
  abstract readonly role: LibrarianRole;
  abstract readonly cabinetPartition: string;
  abstract readonly subContextMap: [string, string, string];
  protected _isSpunUp = false;
  protected _pyramidIndex: PyramidLayer[] | null = null;

  async spin_up(pyramidIndex?: PyramidLayer[]): Promise<void> {
    if (this._isSpunUp) return;
    this._pyramidIndex = pyramidIndex ?? null;
    await Promise.allSettled(this.subContextMap.map(subCtx =>
      openCabinet({ substratePath: subCtx, partition: this.cabinetPartition }, this.role).catch(() => {}),
    ));
    this._isSpunUp = true;
  }

  async council_resolve(req: LibrarianRequest): Promise<LibrarianCouncilResponse> {
    if (!this._isSpunUp) await this.spin_up();
    const index = this._pyramidIndex ?? [];
    const wallStart = Date.now();
    const [v1, v2, v3] = await Promise.all([
      runSubLibrarian(1, this.subContextMap[0], req, index),
      runSubLibrarian(2, this.subContextMap[1], req, index),
      runSubLibrarian(3, this.subContextMap[2], req, index),
    ]);
    const votes: [SubLibrarianVote, SubLibrarianVote, SubLibrarianVote] = [v1, v2, v3];
    const wallClockMs = Date.now() - wallStart;
    const { consensusContent, consensusAddress, divergenceScore } = computeConsensus(votes);
    return { votes, consensusContent, consensusAddress, divergenceScore, escalated: divergenceScore > 0.15, wallClockMs, librarianRole: this.role, councilPackage: COUNCIL_PACKAGE_MAP[this.role] };
  }

  async teardown(): Promise<void> { this._isSpunUp = false; this._pyramidIndex = null; }
}

export class CanonLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'canon_librarian'; readonly cabinetPartition = 'canon'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.canon_librarian; }
export class PearlLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'pearl_librarian'; readonly cabinetPartition = 'pearl'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.pearl_librarian; }
export class ReceiptsLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'receipts_librarian'; readonly cabinetPartition = 'receipts'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.receipts_librarian; }
export class DomainLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'domain_librarian'; readonly cabinetPartition = 'eblet'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.domain_librarian; }
export class CodeLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'code_librarian'; readonly cabinetPartition = 'code'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.code_librarian; }
export class DownloadedLibrarian extends BaseLibrarian { readonly role: LibrarianRole = 'downloaded_librarian'; readonly cabinetPartition = 'downloaded'; readonly subContextMap: [string, string, string] = SUB_CONTEXT_MAP.downloaded_librarian; }

export function createLibrarian(role: LibrarianRole): BaseLibrarian {
  switch (role) {
    case 'canon_librarian':      return new CanonLibrarian();
    case 'pearl_librarian':      return new PearlLibrarian();
    case 'receipts_librarian':   return new ReceiptsLibrarian();
    case 'domain_librarian':     return new DomainLibrarian();
    case 'code_librarian':       return new CodeLibrarian();
    case 'downloaded_librarian': return new DownloadedLibrarian();
  }
}
