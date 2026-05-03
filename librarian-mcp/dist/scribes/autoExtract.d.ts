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
import type { ScribesRegistry } from "./registry.js";
export declare const EXTRACTOR_VERSION = "K475.1";
export type KeywordList = string[];
export type AutoKeywordsMap = Map<string, KeywordList>;
/**
 * Returns the auto_keywords directory for the Bishop cathedral (scribes sub-dir).
 * Respects LIBRARIAN_STITCHPUNKS_DIR override (for tests).
 */
export declare function getAutoKeywordsDir(): string;
/**
 * Returns the auto_keywords directory for a specific cathedral base dir.
 * Used by rebuild_auto_keywords.mjs to support both Bishop and Knight.
 */
export declare function getAutoKeywordsDirForBase(cathedralScribesDir: string): string;
/**
 * Resolve all keeper patterns for a Scribe, returning deduplicated file paths.
 */
export declare function resolveKeeperPaths(patterns: string[]): string[];
/**
 * Extract plain text from a file. Returns null on read error (with warning).
 * - .md / .txt: return as-is
 * - .json: recursive deep extraction of all string values
 * - .jsonl: line-by-line, extract string fields from each JSON object
 */
export declare function extractTextFromFile(filePath: string): string | null;
/**
 * Tokenize text into 1-4 grams (lowercase, punctuation-stripped).
 * Returns a Map<ngram, count>.
 *
 * Approach: split into word tokens, slide an n-gram window for n=1..MAX_NGRAM.
 */
export declare function tokenizeToNgrams(text: string, maxN?: number): Map<string, number>;
/**
 * Extract auto keywords for a single Scribe from its keeper paths.
 * Deterministic: same inputs → same output.
 * Returns [] if no keeper files can be read.
 */
export declare function extractAutoKeywords(scribeId: string, keeperPaths: string[]): KeywordList;
export interface AutoExtractResult {
    keywords: KeywordList;
    sourceHash: string;
    fileCount: number;
    keeperCount: number;
}
export interface AutoExtractSummary {
    scribeId: string;
    keywords: KeywordList;
    sourceHash: string;
    fileCount: number;
    keeperCount: number;
}
/**
 * Extract auto keywords for ALL Scribes in a registry simultaneously.
 * Cross-Scribe df is computed after all corpora are built, ensuring accurate
 * distinctiveness scoring relative to the full Scribe population.
 *
 * Returns a Map<scribeId, AutoExtractSummary>.
 */
export declare function extractAllAutoKeywords(registry: ScribesRegistry): Map<string, AutoExtractSummary>;
export interface AutoKeywordSidecar {
    scribe_id: string;
    generated_at: string;
    extractor_version: string;
    source_hash: string;
    keeper_count: number;
    file_count: number;
    keyword_count: number;
    keywords: string[];
}
/**
 * Load auto keywords from the sidecar YAML for a Scribe.
 * Returns [] if the sidecar file doesn't exist or is malformed.
 */
export declare function loadAutoKeywordSidecar(scribeId: string, autoKeywordsDir: string): KeywordList;
/**
 * Write the auto keywords sidecar YAML for a Scribe.
 * Creates the directory if it doesn't exist.
 */
export declare function writeAutoKeywordSidecar(summary: AutoExtractSummary, autoKeywordsDir: string): void;
