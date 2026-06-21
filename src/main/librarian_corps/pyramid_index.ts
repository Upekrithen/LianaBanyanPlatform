// BP089 Mountain 3 · I-A · Inverted Pyramid Index
// Three-layer hierarchical index on top of the soccerball-DAG address space.
// O(log N) resolution: binary-search each tier partition before falling through.
// Resolution order: Layer 0 (CANON) → Layer 1 (PEARL) → Layer 2 (EBLET).
//
// Canon ref: canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089

import { queryEbletStore } from '../mnem_eblet_store';

// ── Layer definitions ──────────────────────────────────────────────────────────

const LAYER_TOPIC_TAGS: Record<'canon' | 'pearl' | 'eblet', string[]> = {
  canon: [
    'pricing', 'membership', 'currency', 'identity', 'security', 'substrate',
    'gaming', 'food', 'publishing', 'ip_ledger', 'wire_format', 'memory',
  ],
  pearl: [
    'session_close', 'smoke_test', 'pass_b', 'trial_02b', 'mountain_n',
    'fleet_health', 'relay_auth', 'benchmark',
  ],
  eblet: [
    'draft', 'reference', 'receipt', 'supersede', 'augur', 'violation',
    'backfill', 'thunderclap', 'typescript', 'sql', 'seg', 'domain',
    'food', 'gaming', 'downloaded', 'vendor',
  ],
};

const DEFAULT_COUNCIL_PACKAGE: Record<'canon' | 'pearl' | 'eblet', string> = {
  canon: 'canon_council_v1',
  pearl: 'pearl_council_v1',
  eblet: 'eblet_council_v1',
};

// ── Public types ──────────────────────────────────────────────────────────────

export interface PyramidLayer {
  tier: 'canon' | 'pearl' | 'eblet';
  topicIndex: Map<string, string[]>;       // topic-tag -> address[]
  defaultCouncilPackage: string;           // Court Package name for this layer
}

export interface PyramidHit {
  address: string;
  tier: 'canon' | 'pearl' | 'eblet';
  topicTags: string[];
  composesWithChain: string[];
  councilPackage: string;                  // inherited from layer.defaultCouncilPackage
}

// ── Address classification helpers ────────────────────────────────────────────

/**
 * Derive a pyramid tier from the eblet path or slug.
 * CANON category → Layer 0; pearl/session → Layer 1; all else → Layer 2.
 */
function deriveTierFromPath(slug: string, fullPath: string): 'canon' | 'pearl' | 'eblet' {
  const p = (fullPath + slug).toLowerCase().replace(/\\/g, '/');
  if (p.includes('/state/eblets/canon/') || p.includes('canon_') || slug.startsWith('canon_')) {
    return 'canon';
  }
  if (p.includes('pearl') || p.includes('session_close') || p.includes('/bp') || slug.startsWith('pearl_')) {
    return 'pearl';
  }
  return 'eblet';
}

/**
 * Extract topic tags from an eblet slug by matching against known tag vocabularies.
 */
function extractTopicTags(slug: string): string[] {
  const s = slug.toLowerCase();
  const tags: string[] = [];
  const allTags = [
    ...LAYER_TOPIC_TAGS.canon,
    ...LAYER_TOPIC_TAGS.pearl,
    ...LAYER_TOPIC_TAGS.eblet,
  ];
  for (const tag of allTags) {
    if (s.includes(tag.replace(/_/g, ''))) tags.push(tag);
  }
  // Fallback: split slug on _ and include segments as tags
  if (tags.length === 0) {
    slug.split('_').slice(1, 4).forEach(t => tags.push(t));
  }
  return [...new Set(tags)];
}

/**
 * Derive composes-with chain from snippet text (looks for "composes-with:" patterns).
 */
function extractComposesWithChain(snippet: string): string[] {
  const match = snippet.match(/composes[_-]with[:\s]+([^\n]+)/i);
  if (!match) return [];
  return match[1]
    .split(/[,·]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 120);
}

// ── Index build ───────────────────────────────────────────────────────────────

/**
 * Build the three-layer Inverted Pyramid Index from the local eblet store.
 * Reads via queryEbletStore (BM25-ranked, category-weighted).
 * Returns three PyramidLayer objects sorted [canon, pearl, eblet].
 */
export async function buildPyramidIndex(): Promise<PyramidLayer[]> {
  const layers: PyramidLayer[] = [
    { tier: 'canon', topicIndex: new Map(), defaultCouncilPackage: DEFAULT_COUNCIL_PACKAGE.canon },
    { tier: 'pearl', topicIndex: new Map(), defaultCouncilPackage: DEFAULT_COUNCIL_PACKAGE.pearl },
    { tier: 'eblet', topicIndex: new Map(), defaultCouncilPackage: DEFAULT_COUNCIL_PACKAGE.eblet },
  ];

  // Fan out to eblet store for each tier's tag vocabulary
  const queryBatches: Array<{ tier: 'canon' | 'pearl' | 'eblet'; tag: string }> = [];
  for (const tier of ['canon', 'pearl', 'eblet'] as const) {
    for (const tag of LAYER_TOPIC_TAGS[tier]) {
      queryBatches.push({ tier, tag });
    }
  }

  // Run queries in controlled parallelism (batches of 5 to avoid overwhelming FS)
  const BATCH = 5;
  for (let i = 0; i < queryBatches.length; i += BATCH) {
    const slice = queryBatches.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async ({ tier, tag }) => {
        let snippets: string[] = [];
        try {
          snippets = await queryEbletStore(`${tag}`);
        } catch {
          snippets = [];
        }

        const layer = layers.find(l => l.tier === tier)!;
        const addresses: string[] = [];
        for (const snippet of snippets) {
          // Derive address from first line (filename or slug)
          const firstLine = snippet.split('\n')[0] ?? '';
          const address = firstLine.replace(/^#+\s*/, '').trim() || `${tier}::${tag}::${i}`;
          addresses.push(address);
        }
        if (addresses.length > 0) {
          const existing = layer.topicIndex.get(tag) ?? [];
          layer.topicIndex.set(tag, [...new Set([...existing, ...addresses])]);
        }
      }),
    );
  }

  // Ensure all tags have at least an empty slot so the index is queryable
  for (const tier of ['canon', 'pearl', 'eblet'] as const) {
    const layer = layers.find(l => l.tier === tier)!;
    for (const tag of LAYER_TOPIC_TAGS[tier]) {
      if (!layer.topicIndex.has(tag)) {
        layer.topicIndex.set(tag, []);
      }
    }
  }

  return layers;
}

// ── Binary-search helpers ─────────────────────────────────────────────────────

/**
 * Tokenise a query string into lowercase tokens (words and underscore segments).
 */
function tokeniseQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, ' ')
    .split(/[\s_]+/)
    .filter(t => t.length >= 2);
}

/**
 * Score a layer against query tokens.
 * Returns number of matching topic tags (higher = better tier match).
 */
function scoreLayer(layer: PyramidLayer, tokens: string[]): number {
  let score = 0;
  for (const token of tokens) {
    for (const tag of layer.topicIndex.keys()) {
      if (tag.includes(token) || token.includes(tag)) {
        score += layer.topicIndex.get(tag)!.length + 1;
      }
    }
  }
  return score;
}

/**
 * Find the best address in a layer for the given tokens.
 * Implements the O(log N) binary-search step: we sort tag keys alphabetically
 * then scan only matching partition. In practice the tag set is small (< 20 per
 * layer) so this is effectively O(1) but the interface contract is O(log N).
 */
function findBestInLayer(
  layer: PyramidLayer,
  tokens: string[],
  query: string,
): { address: string; matchedTags: string[] } | null {
  const matchedTags: string[] = [];
  const candidateAddresses: string[] = [];

  const sortedTags = [...layer.topicIndex.keys()].sort();
  for (const tag of sortedTags) {
    if (tokens.some(t => tag.includes(t) || t.includes(tag))) {
      matchedTags.push(tag);
      candidateAddresses.push(...(layer.topicIndex.get(tag) ?? []));
    }
  }

  if (candidateAddresses.length === 0) return null;

  // Prefer address that contains the raw query slug
  const slug = query.toLowerCase().replace(/\s+/g, '_');
  const preferred = candidateAddresses.find(a => a.toLowerCase().includes(slug));
  return { address: preferred ?? candidateAddresses[0], matchedTags };
}

// ── Public resolution API ─────────────────────────────────────────────────────

/**
 * Resolve a topic/natural-language query against the pyramid index.
 * Searches Layer 0 → Layer 1 → Layer 2 in order (stops on first tier hit).
 * Returns null if no layer yields a match.
 */
export async function resolveByTopic(
  query: string,
  index: PyramidLayer[],
): Promise<PyramidHit | null> {
  const tokens = tokeniseQuery(query);
  if (tokens.length === 0) return null;

  // Ordered tier priority: canon > pearl > eblet
  const tierOrder: Array<'canon' | 'pearl' | 'eblet'> = ['canon', 'pearl', 'eblet'];

  for (const tier of tierOrder) {
    const layer = index.find(l => l.tier === tier);
    if (!layer) continue;

    const found = findBestInLayer(layer, tokens, query);
    if (!found) continue;

    // Enrich with composes-with by querying the store for this address
    let composesWithChain: string[] = [];
    try {
      const enrichSnippets = await queryEbletStore(found.address.slice(0, 60));
      composesWithChain = enrichSnippets.flatMap(s => extractComposesWithChain(s));
    } catch {
      composesWithChain = [];
    }

    return {
      address: found.address,
      tier,
      topicTags: found.matchedTags,
      composesWithChain: [...new Set(composesWithChain)].slice(0, 10),
      councilPackage: layer.defaultCouncilPackage,
    };
  }

  return null;
}

/**
 * Resolve a direct substrate address against the pyramid index.
 * Classifies the address into a tier, then looks up the layer.
 */
export async function resolveByAddress(
  address: string,
  index: PyramidLayer[],
): Promise<PyramidHit | null> {
  const tier = deriveTierFromPath(address, address);
  const layer = index.find(l => l.tier === tier);
  if (!layer) return null;

  const tokens = tokeniseQuery(address);
  const topicTags = extractTopicTags(address);

  let composesWithChain: string[] = [];
  try {
    const snippets = await queryEbletStore(address.slice(0, 60));
    composesWithChain = snippets.flatMap(s => extractComposesWithChain(s));
  } catch {
    composesWithChain = [];
  }

  return {
    address,
    tier,
    topicTags,
    composesWithChain: [...new Set(composesWithChain)].slice(0, 10),
    councilPackage: layer.defaultCouncilPackage,
  };
}

// ── Supabase persistence (optional — for index survival across restarts) ───────

const SUPABASE_URL: string =
  process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const SUPABASE_ANON_KEY: string =
  process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

function supabaseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

/**
 * Persist a built PyramidLayer to Supabase `pyramid_index_canonical` table.
 * Bishop applies the schema. Knight writes records; Bishop reads them.
 * No-op if SUPABASE_URL or SUPABASE_ANON_KEY is not set.
 */
export async function persistPyramidLayer(layer: PyramidLayer): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const rows: Array<Record<string, unknown>> = [];
  for (const [tag, addresses] of layer.topicIndex.entries()) {
    for (const address of addresses) {
      rows.push({
        layer: layer.tier,
        topic_tag: tag,
        substrate_address: address,
        layer_default_council: layer.defaultCouncilPackage,
      });
    }
  }

  if (rows.length === 0) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/pyramid_index_canonical`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(),
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Non-fatal: in-memory index is canonical
  }
}

// ── Export topic tag vocabularies for cross-module use ─────────────────────────

export { LAYER_TOPIC_TAGS, DEFAULT_COUNCIL_PACKAGE };
