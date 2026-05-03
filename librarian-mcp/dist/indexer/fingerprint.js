/**
 * Fingerprint + Dual-Mode Librarian Gate (KN102 extension / BP016)
 * =================================================================
 * Original fingerprint logic (K441) handles the Brittle Cathedral (Lone Wolf).
 * KN102 adds a Fluid path: direct-from-disk reads via Pheromone substrate —
 * no snapshot, no drift. Brittleness is the conversion-engine.
 *
 * Mode assignment is caller-supplied (from cohort_class/probe.ts at Handshake);
 * this module stays pure — no DB calls.
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
const SCAN_DIRS = [
    "BISHOP_DROPZONE",
    "KNIGHT_DROPZONE",
    "ROOK_DROPZONE",
    "PAWN_DROPZONE",
    "CONTEXT_MANAGEMENT",
    "Cephas/cephas-hugo/content",
    "platform/supabase/migrations",
    "platform/supabase/functions",
    "platform/src/pages",
    "platform/src/components",
    "platform/src/hooks",
    "platform/src/lib",
];
// Critical single-file sources outside the scan dirs. Edits to these must
// trigger DRIFT even though they live at paths we otherwise don't recurse into.
const SCAN_FILES = [
    "librarian-mcp/canonical_values.yaml",
];
const SCAN_EXTENSIONS = new Set([
    ".md", ".ts", ".tsx", ".sql", ".yaml", ".yml", ".json", ".css",
    ".docx", ".rtf",
]);
async function collectFileMtimes(workspaceRoot) {
    const mtimes = {};
    for (const dir of SCAN_DIRS) {
        const absDir = resolve(workspaceRoot, dir).replace(/\\/g, "/");
        if (!existsSync(absDir))
            continue;
        const files = await glob(`${absDir}/**/*`, { absolute: true, nodir: true });
        for (const file of files) {
            const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
            if (!SCAN_EXTENSIONS.has(ext))
                continue;
            try {
                const stat = statSync(file);
                const relPath = file.replace(/\\/g, "/").replace(workspaceRoot.replace(/\\/g, "/") + "/", "");
                mtimes[relPath] = stat.mtimeMs;
            }
            catch { /* skip inaccessible files */ }
        }
    }
    for (const relPath of SCAN_FILES) {
        const absFile = resolve(workspaceRoot, relPath).replace(/\\/g, "/");
        if (!existsSync(absFile))
            continue;
        try {
            const stat = statSync(absFile);
            mtimes[relPath] = stat.mtimeMs;
        }
        catch { /* skip inaccessible files */ }
    }
    return mtimes;
}
function computeTreeHash(mtimes) {
    const sorted = Object.entries(mtimes).sort(([a], [b]) => a.localeCompare(b));
    const hash = createHash("sha256");
    for (const [path, mtime] of sorted) {
        hash.update(`${path}:${mtime}\n`);
    }
    return hash.digest("hex").slice(0, 16);
}
export async function writeFingerprint(indexDir, workspaceRoot, elapsedMs, mode) {
    const mtimes = await collectFileMtimes(workspaceRoot);
    const record = {
        timestamp: new Date().toISOString(),
        elapsedMs,
        mode,
        treeHash: computeTreeHash(mtimes),
        fileCount: Object.keys(mtimes).length,
        fileMtimes: mtimes,
    };
    writeFileSync(resolve(indexDir, "last_build_fingerprint.json"), JSON.stringify(record, null, 2), "utf-8");
    return record;
}
export async function checkFreshness(indexDir, workspaceRoot) {
    const fpPath = resolve(indexDir, "last_build_fingerprint.json");
    if (!existsSync(fpPath)) {
        return {
            status: "UNKNOWN",
            lastBuild: null,
            lastBuildMode: null,
            ageMs: null,
            changedFiles: [],
            newFiles: [],
            deletedFiles: [],
            totalDrift: 0,
        };
    }
    let prev;
    try {
        prev = JSON.parse(readFileSync(fpPath, "utf-8"));
    }
    catch {
        return {
            status: "UNKNOWN",
            lastBuild: null,
            lastBuildMode: null,
            ageMs: null,
            changedFiles: [],
            newFiles: [],
            deletedFiles: [],
            totalDrift: 0,
        };
    }
    const currentMtimes = await collectFileMtimes(workspaceRoot);
    const currentHash = computeTreeHash(currentMtimes);
    const ageMs = Date.now() - new Date(prev.timestamp).getTime();
    if (currentHash === prev.treeHash) {
        return {
            status: "FRESH",
            lastBuild: prev.timestamp,
            lastBuildMode: prev.mode,
            ageMs,
            changedFiles: [],
            newFiles: [],
            deletedFiles: [],
            totalDrift: 0,
        };
    }
    const changedFiles = [];
    const newFiles = [];
    const deletedFiles = [];
    const prevFiles = new Set(Object.keys(prev.fileMtimes));
    const currentFiles = new Set(Object.keys(currentMtimes));
    for (const f of currentFiles) {
        if (!prevFiles.has(f)) {
            newFiles.push(f);
        }
        else if (currentMtimes[f] !== prev.fileMtimes[f]) {
            changedFiles.push(f);
        }
    }
    for (const f of prevFiles) {
        if (!currentFiles.has(f)) {
            deletedFiles.push(f);
        }
    }
    return {
        status: "DRIFT",
        lastBuild: prev.timestamp,
        lastBuildMode: prev.mode,
        ageMs,
        changedFiles,
        newFiles,
        deletedFiles,
        totalDrift: changedFiles.length + newFiles.length + deletedFiles.length,
    };
}
export function getChangedDropzoneFiles(report) {
    const dropzonePrefixes = ["BISHOP_DROPZONE/", "KNIGHT_DROPZONE/", "ROOK_DROPZONE/", "PAWN_DROPZONE/"];
    const all = [...report.changedFiles, ...report.newFiles];
    return all.filter(f => dropzonePrefixes.some(p => f.startsWith(p)));
}
// ─── KN102: Dual-Mode Librarian Fingerprint ──────────────────────────────────
/**
 * Fluid path (fix #4): direct-from-disk fingerprint at call-time.
 * Eliminates the snapshot concept for Pied Piper+ users.
 * Drift stops being a concept — there's no snapshot to drift from.
 * Pheromone substrate (sub-ms coverage) routes reads; this function
 * captures the current mtime-hash without writing any persistent file.
 *
 * Latency target: ≤5ms (Pheromone substrate sub-ms coverage).
 */
export async function getDirectFromDiskFingerprint(workspaceRoot) {
    const t0 = Date.now();
    const mtimes = await collectFileMtimes(workspaceRoot);
    const treeHash = computeTreeHash(mtimes);
    const latencyMs = Date.now() - t0;
    return {
        treeHash,
        fileCount: Object.keys(mtimes).length,
        capturedAt: new Date().toISOString(),
        latencyMs,
    };
}
/**
 * Dispatch to the appropriate fingerprint path based on librarian mode.
 *
 * - brittle: reads the persisted last_build_fingerprint.json (existing K441 path)
 * - fluid:   calls getDirectFromDiskFingerprint (no snapshot; always current)
 *
 * Returns a unified result shape consumable by brief_me / get_system_overview.
 */
export async function getLibrarianFingerprint(modeCtx, indexDir, workspaceRoot) {
    if (modeCtx.mode === "fluid") {
        const fp = await getDirectFromDiskFingerprint(workspaceRoot);
        return {
            mode: "fluid",
            treeHash: fp.treeHash,
            fileCount: fp.fileCount,
            capturedAt: fp.capturedAt,
            staleness: "fluid_realtime",
            latencyMs: fp.latencyMs,
        };
    }
    // brittle path: existing snapshot check
    const report = await checkFreshness(indexDir, workspaceRoot);
    return {
        mode: "brittle",
        treeHash: null,
        fileCount: 0,
        capturedAt: report.lastBuild,
        staleness: report.status === "FRESH" ? "fresh" : report.status === "DRIFT" ? "drift" : "unknown",
    };
}
//# sourceMappingURL=fingerprint.js.map
