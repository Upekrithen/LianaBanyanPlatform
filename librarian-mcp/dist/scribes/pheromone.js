/**
 * Pheromone Substrate — Stigmergic Cross-Scribe Index (K523 / A&A #2317)
 * =======================================================================
 * Implements the production pheromone-index system: persistent JSONL storage,
 * in-memory inverted-topic index, sync-emit hooks, exponential-decay scoring,
 * and constant-time query for Detective Phase 0.
 *
 * Claims 4-7 of A&A #2317:
 *   Claim 4 — Detective Phase 0 integration
 *   Claim 5 — Pheromone-emit hook on tablet-write
 *   Claim 6 — Pheromone-decay (recency-bias)
 *   Claim 7 — Cross-Cathedral propagation via Hounds
 *
 * Storage: stitchpunks/pheromone_substrate/index.jsonl (gitignored)
 * Single-writer append-only pattern matches existing Scribe substrate.
 */
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync, statSync, readdirSync, renameSync, unlinkSync, } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ─── Paths ────────────────────────────────────────────────────────────────
export const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
export const PHEROMONE_DIR = resolve(STITCHPUNKS_DIR, "pheromone_substrate");
export const PHEROMONE_INDEX_PATH = resolve(PHEROMONE_DIR, "index.jsonl");
// Bishop scribes dir (primary tablets)
const SCRIBES_DIR = resolve(STITCHPUNKS_DIR, "scribes");
// Cathedral subdirectories housing additional JSONL tablets
const KNIGHT_SCRIBES_DIR = resolve(STITCHPUNKS_DIR, "knight_cathedral", "scribes");
const PAWN_SCRIBES_DIR = resolve(STITCHPUNKS_DIR, "pawn_cathedral", "scribes");
// ─── Stop-words ───────────────────────────────────────────────────────────
const STOP = new Set(("the a an and or of to in for is are was were be been being it " +
    "this that these those at by on with as from i me my we us our you your " +
    "has have had do does did will would could should can may might must " +
    "b125 b126 b127 b128 b129 b130 k520 k521 k522 k523 ts ts- mcp api " +
    "session sessions tool tools tablet tablets file files line lines " +
    "code type which what when where why how also since because if then " +
    "so but not no yes all any some each every one two three four five " +
    "six seven eight nine ten context json yaml md py rust new old current " +
    "per via str int bool null true false")
    .split(/\s+/));
// ─── Topic extraction (mirrors PoC algorithm) ──────────────────────────────
export function extractTopics(text) {
    if (!text)
        return [];
    const topics = new Set();
    // Quoted phrases (full phrase weight)
    for (const m of text.matchAll(/[`"']([A-Za-z][\w\s\-]{3,40})[`"']/g)) {
        topics.add(m[1].toLowerCase().trim());
    }
    // Innovation numbers (#NNNN or #NNN)
    for (const m of text.matchAll(/#(\d{3,4})\b/g)) {
        topics.add(`innovation_${m[1]}`);
    }
    // Capitalized multi-word phrases (proper nouns, named primitives)
    for (const m of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/g)) {
        const phrase = m[1].toLowerCase().trim();
        const firstToken = phrase.split(" ")[0];
        if (!STOP.has(firstToken)) {
            topics.add(phrase);
        }
    }
    // Hyphenated technical terms (e.g. "append-only", "decay-constant", "cross-vendor")
    for (const m of text.toLowerCase().matchAll(/\b([a-z]{3,}(?:-[a-z]{3,})+)\b/g)) {
        topics.add(m[1]);
    }
    // Single alphabetic tokens (4+ chars, not stop)
    for (const m of text.toLowerCase().matchAll(/\b([a-z][a-z_]{3,30})\b/g)) {
        if (!STOP.has(m[1])) {
            topics.add(m[1]);
        }
    }
    return Array.from(topics);
}
let _indexState = null;
function ensureDir(p) {
    const d = dirname(p);
    if (!existsSync(d))
        mkdirSync(d, { recursive: true });
}
function fileModMs(path) {
    return existsSync(path) ? statSync(path).mtimeMs : 0;
}
function makeKey(rec) {
    return `${rec.cathedral ?? "bishop"}::${rec.scribe}::${rec.tablet_id}`;
}
function rebuildFromDisk() {
    const t0 = Date.now();
    const byTopic = new Map();
    const byKey = new Map();
    if (existsSync(PHEROMONE_INDEX_PATH)) {
        const raw = readFileSync(PHEROMONE_INDEX_PATH, "utf-8");
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            let rec;
            try {
                rec = JSON.parse(trimmed);
            }
            catch {
                continue;
            }
            // Idempotent: last write for a given key wins
            const key = makeKey(rec);
            byKey.set(key, rec);
        }
        // Build inverted index from deduplicated records
        for (const rec of byKey.values()) {
            for (const topic of rec.topics) {
                const bucket = byTopic.get(topic);
                if (bucket) {
                    bucket.push(rec);
                }
                else {
                    byTopic.set(topic, [rec]);
                }
            }
        }
    }
    return {
        byTopic,
        byKey,
        recordCount: byKey.size,
        topicCount: byTopic.size,
        builtAtMs: Date.now(),
        fileModMs: fileModMs(PHEROMONE_INDEX_PATH),
    };
}
/** Returns the in-memory index, rebuilding from disk if stale. */
function getIndex() {
    const currentModMs = fileModMs(PHEROMONE_INDEX_PATH);
    if (!_indexState ||
        _indexState.fileModMs !== currentModMs) {
        _indexState = rebuildFromDisk();
    }
    return _indexState;
}
/** Force rebuild (used by build-from-scratch path). */
export function forceRebuild() {
    _indexState = rebuildFromDisk();
    return _indexState;
}
// ─── Core emit ────────────────────────────────────────────────────────────
const DEFAULT_DECAY_CONSTANT_DAYS = 30;
/**
 * Emit a pheromone record for a tablet write.
 * Sync-fast: target <5ms. Does NOT call costly ML extraction.
 * Appends to PHEROMONE_INDEX_PATH, then updates in-memory index.
 *
 * Idempotent: re-emitting same (scribe, tablet_id, cathedral) updates the record.
 */
export function emitPheromone(scribe, tabletId, content, options = {}) {
    const t0 = Date.now();
    const topics = extractTopics(content);
    const record = {
        ts: options.ts ?? new Date().toISOString(),
        scribe,
        tablet_id: tabletId,
        topics,
        decay_constant_days: options.decayConstantDays ?? DEFAULT_DECAY_CONSTANT_DAYS,
        cathedral: options.cathedral ?? "bishop",
        ...(options.flavorClass ? { flavor_class: options.flavorClass } : {}),
        ...(options.synthesisClass ? { synthesis_class: options.synthesisClass } : {}),
    };
    // Append to JSONL (single-writer; append is atomic on all supported platforms)
    ensureDir(PHEROMONE_INDEX_PATH);
    appendFileSync(PHEROMONE_INDEX_PATH, JSON.stringify(record) + "\n", "utf-8");
    // Update in-memory index without full rebuild
    if (_indexState) {
        const key = makeKey(record);
        const old = _indexState.byKey.get(key);
        if (old) {
            // Remove old record from byTopic
            for (const topic of old.topics) {
                const bucket = _indexState.byTopic.get(topic);
                if (bucket) {
                    const idx = bucket.indexOf(old);
                    if (idx !== -1)
                        bucket.splice(idx, 1);
                    if (bucket.length === 0)
                        _indexState.byTopic.delete(topic);
                }
            }
        }
        // Insert new record
        _indexState.byKey.set(key, record);
        for (const topic of topics) {
            const bucket = _indexState.byTopic.get(topic);
            if (bucket) {
                bucket.push(record);
            }
            else {
                _indexState.byTopic.set(topic, [record]);
            }
        }
        _indexState.recordCount = _indexState.byKey.size;
        _indexState.topicCount = _indexState.byTopic.size;
        _indexState.fileModMs = fileModMs(PHEROMONE_INDEX_PATH);
    }
    const elapsed = Date.now() - t0;
    if (elapsed > 5) {
        // Log slow emits for tuning; never block caller
        process.stderr.write(`[pheromone] slow emit ${elapsed}ms for scribe=${scribe} tablet=${tabletId}\n`);
    }
    return record;
}
// ─── Decay scoring ────────────────────────────────────────────────────────
function decayScore(rec, matchStrength, nowMs) {
    const ageMs = nowMs - new Date(rec.ts).getTime();
    const ageDays = ageMs / 86_400_000;
    const lambda = rec.decay_constant_days;
    return matchStrength * Math.exp(-ageDays / lambda);
}
/**
 * Query the pheromone substrate for a claim.
 * Returns ranked hits, build/query timing, and phase-0 flags.
 *
 * This is the Detective Phase 0 fast path — constant-time vs N-Scribe RPC.
 */
export function queryPheromone(claim, options = {}) {
    const { freshnessThresholdSeconds = 86_400, sufficiencyThreshold = 10, decayActive = true, topK = 20, cathedral, flavorClass, synthesisClass, } = options;
    const buildT0 = Date.now();
    const state = getIndex();
    const buildMs = Date.now() - buildT0;
    // Staleness check
    const indexAgeSeconds = (Date.now() - state.builtAtMs) / 1000;
    const queryT0 = Date.now();
    const nowMs = Date.now();
    const queryTokens = extractTopics(claim);
    // Accumulate hits: key -> { rec, matchStrength }
    const accum = new Map();
    for (const tok of queryTokens) {
        const bucket = state.byTopic.get(tok) ?? [];
        for (const rec of bucket) {
            if (cathedral && rec.cathedral !== cathedral)
                continue;
            // BP015 P3: flavor_class filter (AND semantics across supplied axes)
            if (flavorClass) {
                const fc = rec.flavor_class ?? {};
                if (flavorClass.domain && fc.domain !== flavorClass.domain)
                    continue;
                if (flavorClass.cognition && fc.cognition !== flavorClass.cognition)
                    continue;
                if (flavorClass.audience && fc.audience !== flavorClass.audience)
                    continue;
            }
            // BP015 P4: synthesis_class filter
            if (synthesisClass && rec.synthesis_class !== synthesisClass)
                continue;
            const key = makeKey(rec);
            const existing = accum.get(key);
            if (existing) {
                existing.matchStrength++;
            }
            else {
                accum.set(key, { rec, matchStrength: 1 });
            }
        }
    }
    // Score + rank
    const hits = [];
    for (const { rec, matchStrength } of accum.values()) {
        const ds = decayActive ? decayScore(rec, matchStrength, nowMs) : matchStrength;
        hits.push({
            scribe: rec.scribe,
            tablet_id: rec.tablet_id,
            match_strength: matchStrength,
            decay_score: ds,
            ts: rec.ts,
            cathedral: rec.cathedral,
            flavor_class: rec.flavor_class,
            synthesis_class: rec.synthesis_class,
        });
    }
    hits.sort((a, b) => b.decay_score - a.decay_score);
    const topHits = hits.slice(0, topK);
    const queryMs = Date.now() - queryT0;
    const totalRawHits = hits.length;
    const phase0Used = totalRawHits >= sufficiencyThreshold;
    const fallbackToRpc = !phase0Used;
    return {
        hits: topHits,
        build_ms: buildMs,
        query_ms: queryMs,
        phase_0_used: phase0Used,
        fallback_to_rpc: fallbackToRpc,
        index_age_seconds: indexAgeSeconds,
        topic_count: state.topicCount,
        record_count: state.recordCount,
    };
}
/**
 * Scan all Scribe JSONL files across all Cathedrals and rebuild the
 * pheromone substrate from scratch. Used by:
 *  - Phase D Bloodhound cron
 *  - CLI `npm run pheromone:build`
 *  - npm run rebuild (via SP-7 Courier hook)
 */
export function buildPheromoneIndex(options = {}) {
    const t0 = Date.now();
    const { decayConstantDays = DEFAULT_DECAY_CONSTANT_DAYS, verbose = false } = options;
    ensureDir(PHEROMONE_INDEX_PATH);
    // Collect all (file, cathedral) pairs to scan
    const sources = [
        { dir: SCRIBES_DIR, cathedral: "bishop", prefix: "scribe_" },
        { dir: KNIGHT_SCRIBES_DIR, cathedral: "knight", prefix: "" },
        { dir: PAWN_SCRIBES_DIR, cathedral: "pawn", prefix: "" },
    ];
    // Accumulate deduplicated records: key -> record
    const byKey = new Map();
    let tabletCount = 0;
    let scribeCount = 0;
    for (const { dir, cathedral, prefix } of sources) {
        if (!existsSync(dir))
            continue;
        let files;
        try {
            files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
        }
        catch {
            continue;
        }
        for (const file of files) {
            const scribeName = file.replace(new RegExp(`^${prefix}`), "").replace(/\.jsonl$/, "");
            const filePath = resolve(dir, file);
            scribeCount++;
            let raw;
            try {
                raw = readFileSync(filePath, "utf-8");
            }
            catch {
                continue;
            }
            for (const line of raw.split("\n")) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                let rec;
                try {
                    rec = JSON.parse(trimmed);
                }
                catch {
                    continue;
                }
                // Skip header records
                if (rec.type === "header")
                    continue;
                tabletCount++;
                // Flatten string values for topic extraction
                const text = Object.values(rec).filter((v) => typeof v === "string").join(" ");
                const topics = extractTopics(text);
                if (topics.length === 0)
                    continue;
                const tabletId = rec.id ||
                    rec.toolsmith_id ||
                    rec.scribe_id ||
                    `${scribeName}_${tabletCount}`;
                const ts = rec.ts || rec.created_at || new Date().toISOString();
                const phrec = {
                    ts,
                    scribe: scribeName,
                    tablet_id: tabletId,
                    topics,
                    decay_constant_days: decayConstantDays,
                    cathedral,
                };
                // Last write wins for deduplication
                byKey.set(makeKey(phrec), phrec);
            }
        }
    }
    // Write the new index atomically (write to temp, then rename)
    const lines = [];
    for (const rec of byKey.values()) {
        lines.push(JSON.stringify(rec));
    }
    const tmpPath = PHEROMONE_INDEX_PATH + ".tmp";
    writeFileSync(tmpPath, lines.join("\n") + (lines.length > 0 ? "\n" : ""), "utf-8");
    // On Windows, rename over existing may fail — delete first, then rename
    if (existsSync(PHEROMONE_INDEX_PATH)) {
        try {
            unlinkSync(PHEROMONE_INDEX_PATH);
        }
        catch { /* ignore if locked */ }
    }
    try {
        renameSync(tmpPath, PHEROMONE_INDEX_PATH);
    }
    catch {
        // Final fallback: direct write
        writeFileSync(PHEROMONE_INDEX_PATH, lines.join("\n") + (lines.length > 0 ? "\n" : ""), "utf-8");
        if (existsSync(tmpPath)) {
            try {
                unlinkSync(tmpPath);
            }
            catch { /* ignore */ }
        }
    }
    // Rebuild in-memory index
    _indexState = rebuildFromDisk();
    const buildMs = Date.now() - t0;
    if (verbose) {
        process.stderr.write(`[pheromone] build complete: ${byKey.size} records, ${_indexState.topicCount} topics, ` +
            `${scribeCount} scribe files, ${tabletCount} tablets, ${buildMs}ms\n`);
    }
    return {
        scribeCount,
        tabletCount,
        recordsEmitted: byKey.size,
        topicCount: _indexState.topicCount,
        buildMs,
    };
}
//# sourceMappingURL=pheromone.js.map
