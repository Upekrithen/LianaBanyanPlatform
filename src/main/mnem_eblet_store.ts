// mnem_eblet_store.ts -- BP077 v0.1.27 local eblet store reader
// Reads C:\Users\Administrator\Documents\Asteroid-ProofVault\ for *.eblet.md files.
// BM25-lite scoring against user query (same algorithm pattern as substrate_router.ts).
// Returns top-3 eblet snippets as string[].
//
// Known limitation (spec §8 integration spec): the eblet store path is outside the app
// bundle. In packaged/installed builds, this path may not exist on the end-user machine.
// The function gracefully returns [] when the path is absent -- no crash, no warning
// surfaced to the user.

import { existsSync, readdirSync, readFileSync } from 'fs';

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
