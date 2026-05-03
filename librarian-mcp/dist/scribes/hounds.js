/**
 * Pheromone Hounds — Cross-Cathedral Transport (K524 / A&A #2317 Claim 7)
 * =========================================================================
 * Implements explicit Hound-carried pheromone propagation. After a Cathedral
 * emits a pheromone, lightweight summary records are broadcast to sibling
 * Cathedrals so cross-Cathedral queries surface fresh signals without waiting
 * for the next Bloodhound rebuild.
 *
 * Stigmergy analog: ant-trail markers persisting across colony chambers.
 *
 * Storage (one inbound queue per Cathedral):
 *   stitchpunks/bishop_cathedral/inbound_pheromones.jsonl  ← from knight + pawn
 *   stitchpunks/knight_cathedral/inbound_pheromones.jsonl  ← from bishop + pawn
 *   stitchpunks/pawn_cathedral/inbound_pheromones.jsonl    ← from bishop + knight
 *
 * Atomic append: OS-level append is atomic for records < PIPE_BUF (~4 KB
 * on Linux/macOS). InboundPheromoneRecord is always well under this limit.
 * On Windows the append mode still achieves inter-process safety for small
 * records since individual write() calls are atomic up to the sector size.
 *
 * Failure isolation: each sibling append is wrapped in its own try/catch.
 * One corrupted sibling file never blocks the other or the source write.
 *
 * A&A #2317 Claim 7 — Cross-Cathedral propagation via Hounds.
 */
import { existsSync, mkdirSync, appendFileSync, readFileSync, } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ─── Paths ────────────────────────────────────────────────────────────────
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
/** Returns the inbound_pheromones.jsonl path for a given Cathedral. */
export function inboundPheromonePathFor(cathedral) {
    return resolve(STITCHPUNKS_DIR, `${cathedral}_cathedral`, "inbound_pheromones.jsonl");
}
// ─── Propagation ──────────────────────────────────────────────────────────
const ALL_CATHEDRALS = new Set(["bishop", "knight", "pawn"]);
const MAX_COMPACT_TOPICS = 5;
function ensureParentDir(p) {
    const d = dirname(p);
    if (!existsSync(d))
        mkdirSync(d, { recursive: true });
}
/**
 * Propagate a pheromone record from sourceCathedral to all sibling Cathedrals.
 *
 * Each sibling receives a compact InboundPheromoneRecord appended to
 * `stitchpunks/<sibling>_cathedral/inbound_pheromones.jsonl`.
 * The sourceCathedral itself does NOT receive a copy.
 *
 * Non-fatal: individual sibling failures are caught and written to stderr.
 * A failure for one sibling never blocks the other.
 */
export function propagatePheromone(record, sourceCathedral) {
    const inbound = {
        ts: record.ts,
        source_cathedral: sourceCathedral,
        scribe: record.scribe,
        tablet_id: record.tablet_id,
        topics_compact: record.topics.slice(0, MAX_COMPACT_TOPICS),
        decay_constant_days: record.decay_constant_days,
        original_index_ref: `${sourceCathedral}::${record.scribe}::${record.tablet_id}`,
    };
    const line = JSON.stringify(inbound) + "\n";
    for (const sibling of ALL_CATHEDRALS) {
        if (sibling === sourceCathedral)
            continue;
        try {
            const targetPath = inboundPheromonePathFor(sibling);
            ensureParentDir(targetPath);
            appendFileSync(targetPath, line, "utf-8");
        }
        catch (err) {
            // Non-fatal: propagation failure must never break the originating Scribe write
            process.stderr.write(`[hounds] propagation to ${sibling} failed ` +
                `(${sourceCathedral}::${record.scribe}::${record.tablet_id}): ` +
                `${err.message}\n`);
        }
    }
}
/**
 * Returns the count of inbound pheromone records per Cathedral.
 * "Inbound" = present in inbound_pheromones.jsonl (not yet merged into the
 * unified pheromone index by Bloodhound). Bloodhound deduplicates on merge.
 */
export function getInboundStatus() {
    return ["bishop", "knight", "pawn"].map((cath) => {
        const path = inboundPheromonePathFor(cath);
        if (!existsSync(path)) {
            return { cathedral: cath, path, exists: false, record_count: 0 };
        }
        try {
            const raw = readFileSync(path, "utf-8");
            const count = raw.split("\n").filter((l) => l.trim()).length;
            return { cathedral: cath, path, exists: true, record_count: count };
        }
        catch {
            return { cathedral: cath, path, exists: true, record_count: -1 };
        }
    });
}
//# sourceMappingURL=hounds.js.map
