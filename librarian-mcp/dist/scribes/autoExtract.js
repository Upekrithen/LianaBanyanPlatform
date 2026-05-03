/**
 * autoExtract.ts — Self-Indexing Scribes: Corpus-Derived Distinctiveness Keywords (K474/B122)
 * =============================================================================================
 * Computes TF-IDF-with-exclusivity-floor keyword lists from each Scribe's canonical_keepers.
 *
 * Algorithm:
 *   1. Resolve canonical_keeper paths (supports globs, directories, .md/.txt/.json/.jsonl).
 *   2. Tokenize corpus into 1-4 grams (lowercase, no stopwords, no all-numeric/non-alpha).
 *   3. TF = per-Scribe term frequency; DF = count of Scribes containing term.
 *   4. distinctiveness_S(t) = tf_S(t) / (df(t) ** 1.5)
 *   5. Select top-150 by distinctiveness meeting: tf≥2, df≤ceil(N/2).
 *   6. ALWAYS include df==1 && tf≥2 terms (corpus-exclusive, highest signal class).
 *   7. Emit sidecar YAML: stitchpunks/scribes/auto_keywords/<scribe_id>.yaml
 *
 * Exported surface:
 *   extractAutoKeywords(scribeId, keeperPaths)  → KeywordList
 *   extractAllAutoKeywords(registry)             → Map<scribeId, KeywordList>
 *   AUTO_KEYWORDS_DIR                            → resolved path to sidecar directory
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { globSync } from "glob";
import { createHash } from "crypto";
import yaml from "js-yaml";
import { SCRIBES_DIR } from "./registry.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename);
// dist/scribes/ → librarian-mcp/
const LIBRARIAN_ROOT = resolve(__dirname_local, "..", "..");
// librarian-mcp/ → workspace root (LianaBanyanPlatform/)
const WORKSPACE_ROOT = resolve(LIBRARIAN_ROOT, "..");
export const EXTRACTOR_VERSION = "K475.1";
const MAX_NGRAM = 4;
const TOP_K = 150;
const MIN_TF = 2;
const MAX_KEYWORDS_PER_SIDECAR = 2000;
// ─── Stopwords (standard English ~150) ───────────────────────────────────────
const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "but", "nor", "so", "yet", "for", "at",
    "by", "from", "in", "into", "of", "on", "to", "up", "with", "about",
    "above", "after", "before", "between", "during", "off", "out", "over",
    "through", "under", "until", "while", "as", "if", "than", "though",
    "since", "when", "where", "which", "who", "whom", "whose", "that", "this",
    "these", "those", "it", "its", "he", "she", "they", "we", "you", "i",
    "me", "him", "her", "us", "them", "my", "your", "his", "our", "their",
    "what", "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "not", "only", "same", "too", "very", "can", "will",
    "just", "should", "now", "do", "did", "does", "doing", "be", "been",
    "being", "have", "has", "had", "having", "is", "are", "was", "were",
    "get", "got", "go", "going", "gone", "make", "made", "take", "took",
    "see", "saw", "know", "knew", "think", "thought", "come", "came",
    "give", "gave", "find", "found", "use", "used", "using", "need", "want",
    "look", "looking", "like", "may", "might", "must", "shall", "would",
    "could", "also", "then", "there", "here", "way", "even", "back", "any",
    "many", "new", "old", "good", "first", "last", "long", "great", "little",
    "own", "right", "high", "place", "large", "next", "early", "young",
    "important", "public", "private", "real", "best", "free", "true", "false",
    "per", "via", "eg", "ie", "etc", "vs", "re", "note", "see", "ref",
    "yes", "ok", "s", "t", "v", "x", "e", "p", "c", "b", "d", "f", "g", "h",
    "n", "m", "l", "k", "r", "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine", "ten", "also", "however", "therefore",
    "thus", "hence", "although", "nevertheless", "furthermore", "moreover",
    "instead", "otherwise", "meanwhile", "simply", "already", "always",
    "never", "often", "usually", "sometimes", "well", "still", "just",
    "another", "rather", "quite", "much", "less", "more", "enough", "else",
]);
// ─── Auto keywords directory ──────────────────────────────────────────────────
/**
 * Returns the auto_keywords directory for the Bishop cathedral (scribes sub-dir).
 * Respects LIBRARIAN_STITCHPUNKS_DIR override (for tests).
 */
export function getAutoKeywordsDir() {
    return resolve(SCRIBES_DIR, "auto_keywords");
}
/**
 * Returns the auto_keywords directory for a specific cathedral base dir.
 * Used by rebuild_auto_keywords.mjs to support both Bishop and Knight.
 */
export function getAutoKeywordsDirForBase(cathedralScribesDir) {
    return resolve(cathedralScribesDir, "auto_keywords");
}
// ─── Path resolution ──────────────────────────────────────────────────────────
const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".jsonl"]);
/**
 * Resolve a single canonical_keeper pattern to a list of readable file paths.
 * Tries WORKSPACE_ROOT → LIBRARIAN_ROOT → SCRIBES_DIR as base directories.
 * Handles:
 *   - Directory paths (suffix "/" or path is a dir): expands recursively to all text files
 *   - Glob patterns (contains * or ?)
 *   - Plain file paths
 * Logs a warning and returns [] if nothing resolves.
 */
function resolveKeeperPattern(pattern) {
    // Strip parenthetical annotations (e.g. "BISHOP_DROPZONE/... (every Knight prompt carries it)")
    // that appear in registry.yaml as human-readable notes appended to path strings.
    let trimmed = pattern.trim().replace(/\s*\([^)]*\)\s*$/, "").trim();
    const isDir = trimmed.endsWith("/") || trimmed.endsWith("\\");
    const isGlob = trimmed.includes("*") || trimmed.includes("?");
    const bases = [WORKSPACE_ROOT, LIBRARIAN_ROOT, SCRIBES_DIR];
    for (const base of bases) {
        const candidate = resolve(base, trimmed.replace(/[\\/]+$/, ""));
        if (isDir || (!isGlob && existsSync(candidate) && statSync(candidate).isDirectory())) {
            const files = collectTextFiles(candidate);
            if (files.length > 0)
                return files;
            continue;
        }
        if (isGlob) {
            // Use glob relative to base
            const globPattern = resolve(base, trimmed).replace(/\\/g, "/");
            try {
                const matches = globSync(globPattern, { nodir: true });
                const filtered = matches.filter((f) => TEXT_EXTENSIONS.has(extname(f).toLowerCase()));
                if (filtered.length > 0)
                    return filtered;
            }
            catch {
                // ignore glob errors, try next base
            }
            continue;
        }
        // Plain file path
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            if (TEXT_EXTENSIONS.has(extname(candidate).toLowerCase()))
                return [candidate];
        }
    }
    console.warn(`[autoExtract] WARNING: Could not resolve keeper pattern: "${pattern}" — skipping`);
    return [];
}
/**
 * Recursively collect all .md/.txt/.json/.jsonl files under a directory.
 * Returns [] if directory doesn't exist.
 */
function collectTextFiles(dir) {
    if (!existsSync(dir) || !statSync(dir).isDirectory())
        return [];
    const results = [];
    for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) {
            results.push(...collectTextFiles(full));
        }
        else if (st.isFile() && TEXT_EXTENSIONS.has(extname(full).toLowerCase())) {
            results.push(full);
        }
    }
    return results;
}
/**
 * Resolve all keeper patterns for a Scribe, returning deduplicated file paths.
 */
export function resolveKeeperPaths(patterns) {
    const seen = new Set();
    const out = [];
    for (const p of patterns) {
        for (const f of resolveKeeperPattern(p)) {
            if (!seen.has(f)) {
                seen.add(f);
                out.push(f);
            }
        }
    }
    return out;
}
// ─── Text extraction ──────────────────────────────────────────────────────────
/**
 * Extract plain text from a file. Returns null on read error (with warning).
 * - .md / .txt: return as-is
 * - .json: recursive deep extraction of all string values
 * - .jsonl: line-by-line, extract string fields from each JSON object
 */
export function extractTextFromFile(filePath) {
    try {
        const raw = readFileSync(filePath, "utf-8");
        const ext = extname(filePath).toLowerCase();
        if (ext === ".md" || ext === ".txt")
            return raw;
        if (ext === ".json") {
            try {
                const parsed = JSON.parse(raw);
                return deepExtractStrings(parsed).join(" ");
            }
            catch {
                return raw; // treat as plain text if parse fails
            }
        }
        if (ext === ".jsonl") {
            const lines = [];
            for (const line of raw.split("\n")) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                try {
                    const obj = JSON.parse(trimmed);
                    lines.push(deepExtractStrings(obj).join(" "));
                }
                catch {
                    lines.push(trimmed);
                }
            }
            return lines.join(" ");
        }
        return raw;
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[autoExtract] WARNING: Cannot read "${filePath}": ${msg} — skipping`);
        return null;
    }
}
/** Recursively extract all string values from a JSON structure. */
function deepExtractStrings(val, acc = []) {
    if (typeof val === "string") {
        acc.push(val);
        return acc;
    }
    if (Array.isArray(val)) {
        val.forEach((v) => deepExtractStrings(v, acc));
        return acc;
    }
    if (val && typeof val === "object") {
        for (const v of Object.values(val)) {
            deepExtractStrings(v, acc);
        }
    }
    return acc;
}
// ─── N-gram extraction ────────────────────────────────────────────────────────
/**
 * Returns true if the ngram should be dropped:
 *   - entirely numeric (e.g. "123", "4.7")
 *   - entirely non-alpha (e.g. "---", "===")
 *   - all tokens are stopwords
 *   - any single-char token appears
 */
function shouldDrop(tokens) {
    // All numeric
    if (tokens.every((t) => /^[\d.,%-]+$/.test(t)))
        return true;
    // All non-alpha characters (no letter in the entire gram)
    const joined = tokens.join("");
    if (!/[a-z]/.test(joined))
        return true;
    // All stopwords
    if (tokens.every((t) => STOPWORDS.has(t)))
        return true;
    return false;
}
/**
 * Tokenize text into 1-4 grams (lowercase, punctuation-stripped).
 * Returns a Map<ngram, count>.
 *
 * Approach: split into word tokens, slide an n-gram window for n=1..MAX_NGRAM.
 */
export function tokenizeToNgrams(text, maxN = MAX_NGRAM) {
    // Normalize: lowercase, replace non-alphanumeric-non-space with space
    const normalized = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const words = normalized.split(" ").filter((w) => w.length > 0);
    const counts = new Map();
    for (let i = 0; i < words.length; i++) {
        for (let n = 1; n <= maxN && i + n <= words.length; n++) {
            const tokens = words.slice(i, i + n);
            if (shouldDrop(tokens))
                continue;
            const gram = tokens.join(" ");
            counts.set(gram, (counts.get(gram) ?? 0) + 1);
        }
    }
    return counts;
}
/**
 * Build corpus for a single Scribe from its resolved keeper file paths.
 * Returns null if no files could be read (all missing or unreadable).
 */
function buildScribeCorpus(scribeId, filePaths) {
    const termFreq = new Map();
    const hashAccum = createHash("sha256");
    let fileCount = 0;
    for (const filePath of filePaths) {
        const text = extractTextFromFile(filePath);
        if (text === null)
            continue;
        fileCount++;
        hashAccum.update(text);
        const grams = tokenizeToNgrams(text);
        for (const [gram, cnt] of grams) {
            termFreq.set(gram, (termFreq.get(gram) ?? 0) + cnt);
        }
    }
    if (fileCount === 0)
        return null;
    return { scribeId, termFreq, sourceHash: hashAccum.digest("hex").slice(0, 16), fileCount };
}
/**
 * Given per-Scribe corpora, compute document frequency: df(t) = # Scribes containing t.
 */
function computeDf(corpora) {
    const df = new Map();
    for (const corpus of corpora) {
        for (const [term] of corpus.termFreq) {
            df.set(term, (df.get(term) ?? 0) + 1);
        }
    }
    return df;
}
/**
 * Select distinctiveness keywords for one Scribe given corpus-wide df.
 *
 * Selection criteria:
 *   - tf_S(t) >= MIN_TF (avoid hapax legomena / typos)
 *   - df(t) <= ceil(numScribes / 2) (not too common across Scribes)
 *   - Top-TOP_K by distinctiveness_S(t) = tf_S(t) / df(t)^1.5
 *   - ALWAYS include df(t)==1 && tf_S(t)>=MIN_TF terms (exclusive corpus tokens)
 *   - Hard cap: MAX_KEYWORDS_PER_SIDECAR total (applied last, absolute)
 *
 * Returns sorted keyword list (exclusive tokens first by tf desc, then top-K by distinctiveness).
 * Priority within the cap: (1) exclusivity-floor matches ordered by tf desc, (2) distinctiveness remainder.
 */
function selectKeywords(corpus, df, numScribes) {
    const dfCeiling = Math.ceil(numScribes / 2);
    const candidates = [];
    for (const [term, tf] of corpus.termFreq) {
        if (tf < MIN_TF)
            continue;
        const d = df.get(term) ?? 1;
        if (d > dfCeiling)
            continue;
        const score = tf / Math.pow(d, 1.5);
        const exclusive = d === 1;
        candidates.push({ term, score, exclusive });
    }
    // Exclusive (df==1) tokens: sort by tf descending (score == tf for df==1)
    const exclusiveSorted = candidates
        .filter((c) => c.exclusive)
        .sort((a, b) => b.score - a.score);
    // Hard cap: if exclusive tokens alone exceed the cap, take top-cap by tf
    if (exclusiveSorted.length >= MAX_KEYWORDS_PER_SIDECAR) {
        return exclusiveSorted.slice(0, MAX_KEYWORDS_PER_SIDECAR).map((c) => c.term);
    }
    const exclusiveTerms = exclusiveSorted.map((c) => c.term);
    const exclusiveSet = new Set(exclusiveTerms);
    const nonExclusive = candidates
        .filter((c) => !c.exclusive)
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K)
        .map((c) => c.term)
        .filter((t) => !exclusiveSet.has(t));
    // Combine and apply absolute hard cap
    const combined = [...exclusiveTerms, ...nonExclusive];
    return combined.slice(0, MAX_KEYWORDS_PER_SIDECAR);
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Extract auto keywords for a single Scribe from its keeper paths.
 * Deterministic: same inputs → same output.
 * Returns [] if no keeper files can be read.
 */
export function extractAutoKeywords(scribeId, keeperPaths) {
    const filePaths = resolveKeeperPaths(keeperPaths);
    if (filePaths.length === 0) {
        console.warn(`[autoExtract] WARNING: No resolvable keeper files for Scribe "${scribeId}" — auto keywords will be empty`);
        return [];
    }
    const corpus = buildScribeCorpus(scribeId, filePaths);
    if (!corpus) {
        console.warn(`[autoExtract] WARNING: All keeper files unreadable for Scribe "${scribeId}" — auto keywords will be empty`);
        return [];
    }
    // Single-Scribe extraction: df=1 for all terms (every term is exclusive by definition)
    const df = new Map();
    for (const [term] of corpus.termFreq)
        df.set(term, 1);
    return selectKeywords(corpus, df, 1);
}
/**
 * Extract auto keywords for ALL Scribes in a registry simultaneously.
 * Cross-Scribe df is computed after all corpora are built, ensuring accurate
 * distinctiveness scoring relative to the full Scribe population.
 *
 * Returns a Map<scribeId, AutoExtractSummary>.
 */
export function extractAllAutoKeywords(registry) {
    const corpora = [];
    const keeperCounts = new Map();
    // Build corpus for each Scribe
    for (const scribe of registry.scribes) {
        const patterns = scribe.primary.canonical_keepers ?? [];
        keeperCounts.set(scribe.id, patterns.length);
        const filePaths = resolveKeeperPaths(patterns);
        if (filePaths.length === 0) {
            console.warn(`[autoExtract] WARNING: Scribe "${scribe.id}" has no resolvable keeper files — skipping corpus`);
            continue;
        }
        const corpus = buildScribeCorpus(scribe.id, filePaths);
        if (corpus) {
            corpora.push(corpus);
        }
        else {
            console.warn(`[autoExtract] WARNING: Scribe "${scribe.id}" corpus is empty (all files unreadable) — skipping`);
        }
    }
    // Cross-Scribe document frequency
    const df = computeDf(corpora);
    const numScribes = corpora.length;
    // Select keywords per Scribe
    const results = new Map();
    for (const corpus of corpora) {
        const keywords = selectKeywords(corpus, df, numScribes);
        results.set(corpus.scribeId, {
            scribeId: corpus.scribeId,
            keywords,
            sourceHash: corpus.sourceHash,
            fileCount: corpus.fileCount,
            keeperCount: keeperCounts.get(corpus.scribeId) ?? 0,
        });
    }
    // Scribes with no corpus get empty result
    for (const scribe of registry.scribes) {
        if (!results.has(scribe.id)) {
            results.set(scribe.id, {
                scribeId: scribe.id,
                keywords: [],
                sourceHash: "",
                fileCount: 0,
                keeperCount: keeperCounts.get(scribe.id) ?? 0,
            });
        }
    }
    return results;
}
/**
 * Load auto keywords from the sidecar YAML for a Scribe.
 * Returns [] if the sidecar file doesn't exist or is malformed.
 */
export function loadAutoKeywordSidecar(scribeId, autoKeywordsDir) {
    const sidecarPath = resolve(autoKeywordsDir, `${scribeId}.yaml`);
    if (!existsSync(sidecarPath))
        return [];
    try {
        const raw = readFileSync(sidecarPath, "utf-8");
        const parsed = yaml.load(raw);
        if (!parsed || !Array.isArray(parsed.keywords))
            return [];
        return parsed.keywords.filter((k) => typeof k === "string");
    }
    catch {
        console.warn(`[autoExtract] WARNING: Could not parse sidecar "${sidecarPath}" — ignoring`);
        return [];
    }
}
/**
 * Write the auto keywords sidecar YAML for a Scribe.
 * Creates the directory if it doesn't exist.
 */
export function writeAutoKeywordSidecar(summary, autoKeywordsDir) {
    mkdirSync(autoKeywordsDir, { recursive: true });
    const sidecar = {
        scribe_id: summary.scribeId,
        generated_at: new Date().toISOString(),
        extractor_version: EXTRACTOR_VERSION,
        source_hash: summary.sourceHash,
        keeper_count: summary.keeperCount,
        file_count: summary.fileCount,
        keyword_count: summary.keywords.length,
        keywords: summary.keywords,
    };
    const sidecarPath = resolve(autoKeywordsDir, `${summary.scribeId}.yaml`);
    const content = yaml.dump(sidecar, { lineWidth: 120, quotingType: '"' });
    writeFileSync(sidecarPath, content, "utf-8");
}
//# sourceMappingURL=autoExtract.js.map
