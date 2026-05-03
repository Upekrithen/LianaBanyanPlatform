/**
 * Eblet Layer — KN089 / BP011 Pod W Bean 1
 * ==========================================
 * Content-addressed file operations for Iron Tablet eblet files.
 *
 * An eblet file is a content-addressed Markdown file at an arbitrary path
 * (typically ~/.claude/state/eblets/CANON/<topic>.eblet.md). Every write is
 * an atomic replace (temp-file + rename). Content-hash coordination detects
 * concurrent writes: if the on-disk hash changed since the caller last read,
 * a ConcurrencyConflict is returned alongside the completed write.
 *
 * Conflict semantics: LAST-WRITE-WINS on the Eblet (the write proceeds anyway),
 * but the Stone Tablet ledger records all attempts including conflicted ones.
 * Auto-resolution is NOT performed; callers decide what to do with the conflict.
 *
 * Windows note: rename does not atomically replace on Windows, so we unlink
 * the destination before rename.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
// ─── Path helpers ─────────────────────────────────────────────────────────────
/** Resolve ~ in eblet paths. */
export function resolveEbletPath(ebletPath) {
    if (ebletPath.startsWith("~/") || ebletPath === "~") {
        return join(homedir(), ebletPath.slice(2));
    }
    return resolve(ebletPath);
}
function ensureParentDir(absPath) {
    const d = dirname(absPath);
    if (!existsSync(d))
        mkdirSync(d, { recursive: true });
}
// ─── Hash ─────────────────────────────────────────────────────────────────────
/** SHA-256 hex of a content string. */
export function hashContent(content) {
    return createHash("sha256").update(content, "utf-8").digest("hex");
}
// ─── Read ─────────────────────────────────────────────────────────────────────
/**
 * Read the current eblet file.
 * Returns null if the file does not exist (valid state: uninitialized eblet).
 */
export function ebletRead(ebletPath) {
    const absPath = resolveEbletPath(ebletPath);
    if (!existsSync(absPath))
        return null;
    const content = readFileSync(absPath, "utf-8");
    return { content, hash: hashContent(content) };
}
// ─── Atomic write ─────────────────────────────────────────────────────────────
function atomicWrite(absPath, content) {
    ensureParentDir(absPath);
    const tmpPath = absPath + ".iron_tmp";
    writeFileSync(tmpPath, content, "utf-8");
    try {
        // Windows: unlink before rename to avoid EPERM
        if (existsSync(absPath)) {
            unlinkSync(absPath);
        }
        renameSync(tmpPath, absPath);
    }
    catch (err) {
        try {
            unlinkSync(tmpPath);
        }
        catch { /* ignore cleanup failure */ }
        throw err;
    }
}
// ─── Write with conflict detection ───────────────────────────────────────────
/**
 * Write new content to the eblet file atomically.
 *
 * @param callerKnownHash  The hash the caller observed before acquiring the Stone
 *   mutex. If null/undefined the caller treats the eblet as empty/new.
 *   If the on-disk hash differs → ConcurrencyConflict (another organism wrote
 *   between the caller's read and now). The write proceeds anyway (last-write-wins).
 */
export function ebletWrite(params) {
    const absPath = resolveEbletPath(params.ebletPath);
    const existing = ebletRead(params.ebletPath);
    const existingHash = existing?.hash ?? null;
    const newHash = hashContent(params.content);
    let conflict;
    if (existingHash !== null && existingHash !== params.callerKnownHash) {
        conflict = {
            type: "hash_divergence",
            callerHash: params.callerKnownHash ?? "",
            existingHash,
            scribeId: params.scribeId,
            ts: new Date().toISOString(),
        };
    }
    atomicWrite(absPath, params.content);
    return { ebletHash: newHash, conflict };
}
//# sourceMappingURL=eblet_layer.js.map
