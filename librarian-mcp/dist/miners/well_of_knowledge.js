/**
 * Well of Knowledge — Miner-Scribe Seed + Topic Specialization (KN104 / BP016)
 * ==============================================================================
 * When a Miner halves on discovering a new category, the daughter Miner is
 * seeded to a Well of Knowledge — a specialized topic domain.
 *
 * The Well records:
 *   - Which daughter serial owns this Well
 *   - The originating topic seed
 *   - The parent Miner serial (for ROOT-lineage tracing)
 *   - The cathedral where the Well lives
 *
 * Wells are the future Scribe-specialization anchors — when Colossus is built,
 * each Well becomes a full Scribe substrate entry in its cathedral.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STITCHPUNKS_DIR = process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");
const WELLS_DIR = resolve(STITCHPUNKS_DIR, "miners", "wells_of_knowledge");
const WELLS_REGISTRY_PATH = resolve(WELLS_DIR, "wells_registry.jsonl");
// ─── Registry I/O ─────────────────────────────────────────────────────────
function ensureWellsDir() {
    if (!existsSync(WELLS_DIR))
        mkdirSync(WELLS_DIR, { recursive: true });
}
function appendWellEntry(entry) {
    ensureWellsDir();
    writeFileSync(WELLS_REGISTRY_PATH, JSON.stringify(entry) + "\n", {
        flag: "a",
        encoding: "utf-8",
    });
}
// ─── Seed API ──────────────────────────────────────────────────────────────
/**
 * Seeds a Well of Knowledge for a daughter Miner.
 * Called when a parent Miner halves upon category-discovery.
 */
export function seedWellOfKnowledge(daughterSerial, topicSeed, parentSerial, cathedral) {
    const entry = {
        daughter_serial: daughterSerial,
        parent_serial: parentSerial,
        topic_seed: topicSeed,
        cathedral,
        created_at: new Date().toISOString(),
        status: "seeded",
    };
    appendWellEntry(entry);
    return entry;
}
// ─── Query API ──────────────────────────────────────────────────────────────
/** Returns all Wells for a given cathedral. */
export function listWellsForCathedral(cathedral) {
    ensureWellsDir();
    if (!existsSync(WELLS_REGISTRY_PATH))
        return [];
    const lines = readFileSync(WELLS_REGISTRY_PATH, "utf-8").split("\n").filter(l => l.trim());
    const results = [];
    for (const line of lines) {
        try {
            const entry = JSON.parse(line);
            if (entry.cathedral === cathedral)
                results.push(entry);
        }
        catch {
            continue;
        }
    }
    return results;
}
/** Returns the Well owned by a given daughter serial. */
export function getWellForSerial(serial) {
    ensureWellsDir();
    if (!existsSync(WELLS_REGISTRY_PATH))
        return null;
    const lines = readFileSync(WELLS_REGISTRY_PATH, "utf-8").split("\n").filter(l => l.trim());
    for (const line of lines.reverse()) {
        try {
            const entry = JSON.parse(line);
            if (entry.daughter_serial === serial)
                return entry;
        }
        catch {
            continue;
        }
    }
    return null;
}
/** Lists all Wells (all cathedrals). */
export function listAllWells() {
    ensureWellsDir();
    if (!existsSync(WELLS_REGISTRY_PATH))
        return [];
    const lines = readFileSync(WELLS_REGISTRY_PATH, "utf-8").split("\n").filter(l => l.trim());
    const results = [];
    for (const line of lines) {
        try {
            results.push(JSON.parse(line));
        }
        catch {
            continue;
        }
    }
    return results;
}
//# sourceMappingURL=well_of_knowledge.js.map
