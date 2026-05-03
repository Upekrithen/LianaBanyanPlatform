/**
 * Knight Cathedral Courier (SP-7 extension, K461/B121)
 * =====================================================
 * Auto-populates Knight's Cathedral Scribes on every npm run rebuild.
 *
 * Scans:
 *   1. BISHOP_DROPZONE/01_KnightPrompts/ → KnightQueue.jsonl (new prompt files)
 *   2. BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_*.md → KnightHandoffs.jsonl
 *   3. git tags matching v-*-K[0-9]* → landed-status entries in KnightHandoffs.jsonl
 *
 * Append-only invariant: existing tablets are never modified or deleted.
 * Idempotency: uses (source_session, source_document) composite key to detect duplicates.
 * Running the Courier twice on unchanged artifacts produces zero new tablets.
 */
import { existsSync, readFileSync, appendFileSync, readdirSync, mkdirSync, } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MCP_ROOT = resolve(__dirname, "..", "..");
const WORKSPACE = resolve(MCP_ROOT, "..");
const CATHEDRAL_DIR = resolve(MCP_ROOT, "stitchpunks/knight_cathedral/scribes");
const QUEUE_SCRIBE = resolve(CATHEDRAL_DIR, "KnightQueue.jsonl");
const HANDOFFS_SCRIBE = resolve(CATHEDRAL_DIR, "KnightHandoffs.jsonl");
/** Parse a JSONL file, returning all entry records (skip header, skip blank). */
function loadTablets(path) {
    if (!existsSync(path))
        return [];
    const lines = readFileSync(path, "utf-8").split("\n");
    const results = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            const obj = JSON.parse(trimmed);
            if (obj.type === "header")
                continue;
            results.push(obj);
        }
        catch {
            // skip malformed lines
        }
    }
    return results;
}
/** Build a Set of dedup keys from existing tablets. Key format: "source_session::source_document" */
function buildDedupSet(tablets) {
    const keys = new Set();
    for (const t of tablets) {
        const session = t.source_session ?? "";
        const doc = t.source_document ?? "";
        if (session || doc) {
            keys.add(`${session}::${doc}`);
        }
    }
    return keys;
}
/** Append a single tablet JSON line to a JSONL file. */
function appendTablet(path, tablet) {
    appendFileSync(path, JSON.stringify(tablet) + "\n", "utf-8");
}
/** Word count approximation. */
function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}
/** Extract K-number from a prompt filename like PROMPT_KNIGHT_K461_B121_... */
function extractKNumber(filename) {
    const m = filename.match(/PROMPT_KNIGHT_(K\d+[a-z]?)/i);
    return m ? m[1].toUpperCase() : null;
}
/** Extract B-number from a prompt filename. */
function extractBNumber(filename) {
    const m = filename.match(/_(B\d+)_/i);
    return m ? m[1].toUpperCase() : null;
}
/** Extract a human-readable title from a prompt file name or first H1. */
function extractTitle(filename, content) {
    const h1 = content.match(/^#\s+(.+)/m);
    if (h1)
        return h1[1].trim().slice(0, 120);
    return filename.replace(/\.md$/, "").replace(/_/g, " ").slice(0, 120);
}
/** Determine queue status from prompt file content or filename. */
function inferStatus(filename, content) {
    const lower = content.toLowerCase();
    if (lower.includes("## next") || lower.includes("next — dispatch"))
        return "NEXT";
    return "QUEUED";
}
/** Scan BISHOP_DROPZONE/01_KnightPrompts/ and sync KnightQueue.jsonl. */
function syncKnightQueue(dedupKeys) {
    const PROMPTS_DIR = resolve(WORKSPACE, "BISHOP_DROPZONE/01_KnightPrompts");
    if (!existsSync(PROMPTS_DIR))
        return 0;
    const files = readdirSync(PROMPTS_DIR).filter(f => f.startsWith("PROMPT_KNIGHT_") && f.endsWith(".md"));
    let added = 0;
    const now = new Date().toISOString();
    for (const filename of files) {
        const sourceDoc = `BISHOP_DROPZONE/01_KnightPrompts/${filename}`;
        // The courier uses the prompt filename as the source_document.
        // Source session = K-number extracted from filename (courier is the agent).
        const kNum = extractKNumber(filename) ?? "courier";
        const dedupKey = `courier::${sourceDoc}`;
        if (dedupKeys.has(dedupKey))
            continue;
        const filePath = resolve(PROMPTS_DIR, filename);
        let content = "";
        try {
            content = readFileSync(filePath, "utf-8");
        }
        catch {
            continue;
        }
        const bNum = extractBNumber(filename) ?? "";
        const title = extractTitle(filename, content);
        const observation = `[Courier-synced] ${kNum}${bNum ? "/" + bNum : ""} — ${title}`;
        const words = countWords(observation);
        const tablet = {
            observation,
            category: "queue-prompt-sync",
            timestamp: now,
            source_session: "courier",
            source_document: sourceDoc,
            tokens: words,
            k_number: kNum || undefined,
            status: inferStatus(filename, content),
        };
        appendTablet(QUEUE_SCRIBE, tablet);
        dedupKeys.add(dedupKey);
        added++;
    }
    return added;
}
/** Scan BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_*.md and sync KnightHandoffs.jsonl. */
function syncKnightHandoffs(dedupKeys) {
    const HANDOFFS_DIR = resolve(WORKSPACE, "BISHOP_DROPZONE/03_BishopHandoffs");
    if (!existsSync(HANDOFFS_DIR))
        return 0;
    const files = readdirSync(HANDOFFS_DIR).filter(f => f.startsWith("REPORT_KNIGHT_") && f.endsWith(".md"));
    let added = 0;
    const now = new Date().toISOString();
    for (const filename of files) {
        const sourceDoc = `BISHOP_DROPZONE/03_BishopHandoffs/${filename}`;
        const dedupKey = `courier::${sourceDoc}`;
        if (dedupKeys.has(dedupKey))
            continue;
        const filePath = resolve(HANDOFFS_DIR, filename);
        let content = "";
        try {
            content = readFileSync(filePath, "utf-8");
        }
        catch {
            continue;
        }
        // Extract K-number and session from filename
        const kMatch = filename.match(/REPORT_KNIGHT_(K\d+[a-z]?)_/i);
        const bMatch = filename.match(/REPORT_KNIGHT_K\d+[a-z]?_(B\d+)_/i);
        const kNum = kMatch ? kMatch[1].toUpperCase() : "?";
        const bNum = bMatch ? bMatch[1].toUpperCase() : "";
        // Extract first H1 as title
        const h1 = content.match(/^#\s+(.+)/m);
        const title = h1 ? h1[1].trim().slice(0, 100) : filename.replace(/\.md$/, "");
        // Try to extract commit hash and tag from content
        const commitMatch = content.match(/[Cc]ommit[:\s]+`?([0-9a-f]{7,40})`?/);
        const tagMatch = content.match(/[Tt]ag[:\s]+`?(v-[a-z0-9_-]+-K\d+[a-z]?)`?/);
        const observation = `[Courier-synced] ${kNum}${bNum ? "/" + bNum : ""} — ${title}`;
        const words = countWords(observation);
        const tablet = {
            observation,
            category: "landed-session",
            timestamp: now,
            source_session: "courier",
            source_document: sourceDoc,
            tokens: words,
            k_number: kNum,
        };
        if (commitMatch)
            tablet.commit_hash = commitMatch[1];
        if (tagMatch)
            tablet.git_tag = tagMatch[1];
        appendTablet(HANDOFFS_SCRIBE, tablet);
        dedupKeys.add(dedupKey);
        added++;
    }
    return added;
}
/** Scan git tags matching v-*-K[0-9]* and add landed-status entries to KnightHandoffs.jsonl. */
function syncGitTags(dedupKeys) {
    let tagLines = [];
    try {
        const output = execSync("git tag --list", {
            cwd: WORKSPACE,
            encoding: "utf-8",
            timeout: 10000,
        });
        tagLines = output.split("\n").map(l => l.trim()).filter(Boolean);
    }
    catch {
        return 0;
    }
    const K_TAG_RE = /^v-(.+)-(K\d+[a-z]?)$/i;
    let added = 0;
    const now = new Date().toISOString();
    for (const tag of tagLines) {
        const m = K_TAG_RE.exec(tag);
        if (!m)
            continue;
        const kNum = m[2].toUpperCase();
        const sourceDoc = `git-tag::${tag}`;
        const dedupKey = `courier::${sourceDoc}`;
        if (dedupKeys.has(dedupKey))
            continue;
        // Try to get the commit hash for this tag
        let commitHash = "";
        try {
            commitHash = execSync(`git rev-list -n 1 "${tag}"`, {
                cwd: WORKSPACE,
                encoding: "utf-8",
                timeout: 5000,
            }).trim().slice(0, 7);
        }
        catch {
            // best-effort
        }
        const observation = `[Courier-synced] Git tag ${tag} — ${kNum} landed`;
        const words = countWords(observation);
        const tablet = {
            observation,
            category: "landed-git-tag",
            timestamp: now,
            source_session: "courier",
            source_document: sourceDoc,
            tokens: words,
            k_number: kNum,
            git_tag: tag,
        };
        if (commitHash)
            tablet.commit_hash = commitHash;
        appendTablet(HANDOFFS_SCRIBE, tablet);
        dedupKeys.add(dedupKey);
        added++;
    }
    return added;
}
/** Main entry: run the Knight Cathedral Courier. */
export async function runKnightCathedralCourier() {
    // Ensure directories exist (idempotent)
    if (!existsSync(CATHEDRAL_DIR)) {
        mkdirSync(CATHEDRAL_DIR, { recursive: true });
    }
    // Load existing tablets for dedup
    const existingQueueTablets = loadTablets(QUEUE_SCRIBE);
    const existingHandoffTablets = loadTablets(HANDOFFS_SCRIBE);
    const queueDedupKeys = buildDedupSet(existingQueueTablets);
    const handoffDedupKeys = buildDedupSet(existingHandoffTablets);
    const newQueueTablets = syncKnightQueue(queueDedupKeys);
    const newHandoffTablets = syncKnightHandoffs(handoffDedupKeys);
    const newTagTablets = syncGitTags(handoffDedupKeys);
    return {
        newQueueTablets,
        newHandoffTablets,
        newTagTablets,
        total: newQueueTablets + newHandoffTablets + newTagTablets,
    };
}
//# sourceMappingURL=knightCathedralCourier.js.map
