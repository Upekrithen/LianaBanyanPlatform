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
import type { ConcurrencyConflict } from "./types.js";
/** Resolve ~ in eblet paths. */
export declare function resolveEbletPath(ebletPath: string): string;
/** SHA-256 hex of a content string. */
export declare function hashContent(content: string): string;
/**
 * Read the current eblet file.
 * Returns null if the file does not exist (valid state: uninitialized eblet).
 */
export declare function ebletRead(ebletPath: string): {
    content: string;
    hash: string;
} | null;
/**
 * Write new content to the eblet file atomically.
 *
 * @param callerKnownHash  The hash the caller observed before acquiring the Stone
 *   mutex. If null/undefined the caller treats the eblet as empty/new.
 *   If the on-disk hash differs → ConcurrencyConflict (another organism wrote
 *   between the caller's read and now). The write proceeds anyway (last-write-wins).
 */
export declare function ebletWrite(params: {
    ebletPath: string;
    content: string;
    callerKnownHash: string | null;
    scribeId: string;
}): {
    ebletHash: string;
    conflict?: ConcurrencyConflict;
};
