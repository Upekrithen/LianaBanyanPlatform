import { readFileSync, statSync } from "fs";
import { glob } from "glob";
import { basename } from "path";
/**
 * K441 Half A — session-closeout auto-ingest.
 *
 * Reads `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B*_CLOSEOUT.md` files,
 * extracts one SessionEntry per closeout, and returns them sorted by
 * B-number ascending. The caller (buildIndex) merges these with whatever
 * the legacy `parseContext` returned (closeouts win on duplicates) and
 * picks the highest B-number as `overview.lastSession`.
 *
 * Supplements (does not replace) the older parseContext path so older
 * sessions discovered through MILESTONE_HANDOFF_MARCH_2026.md still surface.
 *
 * Knight session-report ingestion is intentionally a no-op for now — see
 * `parseKnightReports` placeholder below for the documented gap.
 */
const CLOSEOUT_GLOB = "BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B*_CLOSEOUT.md";
const CLOSEOUT_FILENAME_RE = /MILESTONE_B(\d+)(?:_[A-Z0-9_]+)?_CLOSEOUT\.md$/i;
function extractSessionId(filePath) {
    const m = basename(filePath).match(CLOSEOUT_FILENAME_RE);
    if (!m)
        return null;
    return `B${m[1]}`;
}
function extractDate(body) {
    // Preferred form: `**Session:** Bishop B116, 2026-04-22 (...)` or similar.
    const sessionLine = body.match(/^\*\*Session:\*\*[^\n]*?(\d{4}-\d{2}-\d{2})/m);
    if (sessionLine)
        return sessionLine[1];
    const anyDate = body.match(/(\d{4}-\d{2}-\d{2})/);
    return anyDate?.[1];
}
function extractSummary(body) {
    // Prefer the first paragraph after `## Headline` (B109+ convention),
    // else fall back to the first non-blank paragraph after the H1 title.
    const headlineSection = body.match(/##\s+Headline\s*\n+([\s\S]+?)(?=\n##\s|\n---\s*\n|$)/i);
    let candidate = headlineSection?.[1] ?? "";
    if (!candidate) {
        const afterH1 = body.replace(/^#\s+[^\n]*\n/, "");
        const para = afterH1.split(/\n{2,}/).find((p) => p.trim().length > 0 && !p.trim().startsWith("#"));
        candidate = para ?? "";
    }
    candidate = candidate
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\s+/g, " ")
        .trim();
    if (candidate.length > 800)
        candidate = candidate.slice(0, 797).trimEnd() + "...";
    return candidate || "(no summary extractable)";
}
function extractFilesChanged(body) {
    // Look for an "Artifacts shipped" or "Files changed" section. Be tolerant
    // of variants ("Files shipped", "Artifacts", etc.) — match anything
    // starting with `## Artifacts` or `## Files`.
    const section = body.match(/##\s+(?:Artifacts|Files)[^\n]*\n([\s\S]+?)(?=\n##\s|$)/i);
    const scope = section?.[1] ?? body; // fall back to whole body
    const files = new Set();
    // Backtick-quoted filenames with extensions we care about.
    const fileRe = /`([A-Za-z0-9_./\-]+\.(?:tsx?|sql|md|css|json|jsonl|yaml|yml|py|sh|mjs|html))`/g;
    let m;
    while ((m = fileRe.exec(scope)) !== null) {
        files.add(m[1]);
    }
    // Commit hashes are not files but show up alongside; skip with shape filter above.
    const arr = [...files];
    return {
        files: arr,
        migrations: arr.filter((f) => f.endsWith(".sql")),
        functions: arr.filter((f) => f.includes("functions/")),
        pages: arr.filter((f) => f.includes("pages/") && f.endsWith(".tsx")),
    };
}
function extractPendingWork(body) {
    const out = [];
    // Sections we recognize as "pending"-shaped.
    const sectionRes = [
        /##\s+Founder actions pending\s*\n([\s\S]+?)(?=\n##\s|$)/i,
        /##\s+Handoff to B\d+\s*\n([\s\S]+?)(?=\n##\s|$)/i,
        /##\s+Pending work\s*\n([\s\S]+?)(?=\n##\s|$)/i,
        /##\s+Open follow-?ups?\s*\n([\s\S]+?)(?=\n##\s|$)/i,
    ];
    for (const re of sectionRes) {
        const sec = body.match(re);
        if (!sec)
            continue;
        for (const line of sec[1].split("\n")) {
            const item = line.match(/^\s*[-*]\s+(.+)/);
            if (item) {
                const text = item[1].replace(/`/g, "").trim();
                if (text)
                    out.push(text);
            }
        }
    }
    return [...new Set(out)];
}
export async function parseSessionCloseouts(workspaceRoot) {
    const pattern = `${workspaceRoot.replace(/\\/g, "/")}/${CLOSEOUT_GLOB}`;
    const files = await glob(pattern, { absolute: true, nodir: true });
    const out = [];
    // Track the highest-B-number variant per session so that an "extended"
    // closeout doesn't overwrite the canonical one (and vice versa).
    const bestByBnum = new Map();
    for (const filePath of files) {
        const id = extractSessionId(filePath);
        if (!id)
            continue;
        let body;
        try {
            body = readFileSync(filePath, "utf-8");
        }
        catch {
            continue;
        }
        if (!body.trim())
            continue;
        const bNumber = parseInt(id.slice(1), 10);
        const { files: filesChanged, migrations, functions, pages } = extractFilesChanged(body);
        const entry = {
            id,
            date: extractDate(body),
            summary: extractSummary(body),
            filesChanged,
            migrationsCreated: migrations,
            functionsCreated: functions,
            pagesCreated: pages,
            pendingWork: extractPendingWork(body),
            sourcePath: filePath.replace(/\\/g, "/").replace(workspaceRoot.replace(/\\/g, "/") + "/", ""),
            bNumber,
        };
        // Prefer the closeout with the most pendingWork+filesChanged signal —
        // i.e. an "EXTENDED" closeout usually has more substance than the base.
        // Fall back to mtime tiebreak.
        const prev = bestByBnum.get(bNumber);
        if (!prev) {
            bestByBnum.set(bNumber, entry);
            continue;
        }
        const score = entry.filesChanged.length + entry.pendingWork.length;
        const prevScore = prev.filesChanged.length + prev.pendingWork.length;
        if (score > prevScore) {
            bestByBnum.set(bNumber, entry);
        }
        else if (score === prevScore) {
            try {
                const a = statSync(filePath).mtimeMs;
                const b = statSync(`${workspaceRoot}/${prev.sourcePath}`).mtimeMs;
                if (a > b)
                    bestByBnum.set(bNumber, entry);
            }
            catch { /* keep prev */ }
        }
    }
    for (const e of bestByBnum.values())
        out.push(e);
    out.sort((a, b) => a.bNumber - b.bNumber);
    return out;
}
/**
 * Knight session-report ingestion — DOCUMENTED GAP (K441).
 *
 * No `K<NNN>_REPORT_*.md` convention exists yet in this repo. Knight reports
 * are currently embedded in commit messages and Bishop closeout files. When
 * a Knight-report folder convention is established (e.g.
 * `KNIGHT_DROPZONE/03_KnightReports/K<NNN>_REPORT.md`), add a parallel
 * parser here and merge into the SessionEntry stream with id="K<NNN>".
 */
export async function parseKnightReports(_workspaceRoot) {
    return [];
}
/** Pick the highest B-number from a list of SessionEntry-like values. */
export function pickHighestBSession(sessions) {
    let bestId;
    let bestN = -1;
    for (const s of sessions) {
        const m = s.id.match(/^B(\d+)$/);
        if (!m)
            continue;
        const n = parseInt(m[1], 10);
        if (n > bestN) {
            bestN = n;
            bestId = s.id;
        }
    }
    return bestId;
}
/**
 * Merge two session lists, preferring entries from `closeouts` over `legacy`
 * when IDs collide. Closeout files are the authoritative source for B-sessions.
 * Returns the merged list sorted by B-number ascending; non-B IDs preserve
 * their relative order at the front.
 */
export function mergeSessionStreams(legacy, closeouts) {
    const byId = new Map();
    for (const s of legacy)
        byId.set(s.id, s);
    for (const s of closeouts)
        byId.set(s.id, s); // closeout wins
    const merged = [...byId.values()];
    merged.sort((a, b) => {
        const am = a.id.match(/^B(\d+)$/);
        const bm = b.id.match(/^B(\d+)$/);
        if (am && bm)
            return parseInt(am[1]) - parseInt(bm[1]);
        if (am)
            return 1;
        if (bm)
            return -1;
        return a.id.localeCompare(b.id);
    });
    return merged;
}
//# sourceMappingURL=parseSessionCloseouts.js.map
