/**
 * Make Yourself Comfortable — Base Camp Protocol Phase 2
 * =======================================================
 * Main entry point. Orchestrates 8-Shadow parallel bulk-load (alpha–theta)
 * per KN091 In-concert protocol, generates Make-Comfortable Receipt, and
 * logs the "Comfortable" state to the pheromone substrate.
 *
 * Phase 2 of Base Camp Protocol (Phase 1 = KN086 LB Frame Handshake LANDED 232e47e).
 *
 * Founder canonical phrasing:
 *   "Make yourself comfortable — because when done, you're comfortable
 *    because all that data is at fingertips."   — BP010 turn 29
 *
 * Usage:
 *   node dist/base_camp/make_yourself_comfortable.js [--dry-run] [--scope default]
 *   import { runMakeYourselfComfortable } from "./base_camp/make_yourself_comfortable.js"
 *
 * KN086 Phase 2 / BP010 / ATSRS-004 / A&A #2317
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import jsYaml from "js-yaml";
import { bulkLoadPaths } from "./pheromone_bulk_loader.js";
import { generateReceipt, measurePhase0HitRatio, RECEIPT_PATH } from "./completeness_receipt.js";
import { loadUserChoiceScope, saveUserChoiceScope, DEFAULT_SCOPE, ALL_CATEGORIES, } from "./user_choice_integration.js";
export { DEFAULT_SCOPE, ALL_CATEGORIES, loadUserChoiceScope, saveUserChoiceScope };
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ─── Registry loading ─────────────────────────────────────────────────────
// Registry lives in src/base_camp/ (not copied by tsc into dist/)
// __dirname = dist/base_camp → ../.. = librarian-mcp
const LIBRARIAN_MCP_DIR = resolve(__dirname, "..", "..");
const REGISTRY_PATH = resolve(LIBRARIAN_MCP_DIR, "src", "base_camp", "canonical_paths_registry.yaml");
const WORKSPACE_ROOT = resolve(LIBRARIAN_MCP_DIR, "..");
function loadRegistry() {
    try {
        const raw = readFileSync(REGISTRY_PATH, "utf-8");
        return jsYaml.load(raw);
    }
    catch {
        return { default_integration_set: {} };
    }
}
export const SHADOW_TASKS = [
    { id: "alpha", categories: ["project_memory"], description: "Project memory MD files" },
    { id: "beta", categories: ["canonical_eblets"], description: "Canonical + Golden Eblets" },
    { id: "gamma", categories: ["bishop_state"], description: "Bishop session-state Eblets" },
    {
        id: "delta",
        categories: ["scribe_registry_metadata"],
        description: "Scribe registry JSONL metadata",
    },
    {
        id: "epsilon",
        categories: ["canonical_values", "cephas_content"],
        description: "Canonical values YAML + Cephas content",
    },
    { id: "zeta", categories: ["bishop_dropzone"], description: "Bishop dropzone handoffs + letters" },
    { id: "eta", categories: ["knight_dropzone"], description: "Knight dropzone reports + prompts" },
];
// ─── Main orchestrator ───────────────────────────────────────────────────
export async function runMakeYourselfComfortable(options = {}) {
    const { scope = "default", customScope, dryRun = false, sequential = false, skipMeasurement = false, canonicalFileCountTarget = 500, } = options;
    const registry = loadRegistry();
    // Resolve user scope
    const userScope = scope === "custom" && customScope
        ? customScope
        : scope === "minimal"
            ? { ...DEFAULT_SCOPE, enabled_categories: ["canonical_values"] }
            : loadUserChoiceScope();
    // Pre-load Phase-0 measurement (before any writes)
    const preLoadHitRatio = skipMeasurement ? 0 : measurePhase0HitRatio();
    // Build shadow-to-paths mapping from registry
    const shadowPathMap = new Map();
    for (const shadow of SHADOW_TASKS) {
        const patterns = [];
        let decayDays = 60;
        for (const cat of shadow.categories) {
            if (!userScope.enabled_categories.includes(cat))
                continue;
            const entry = registry.default_integration_set[cat];
            if (!entry)
                continue;
            patterns.push(...entry.paths);
            if (entry.decay_constant_days)
                decayDays = entry.decay_constant_days;
        }
        // Resolve relative paths to workspace root
        const resolved = patterns.map((p) => p.startsWith("/") || p.match(/^[A-Z]:/i)
            ? p
            : resolve(WORKSPACE_ROOT, p));
        shadowPathMap.set(shadow.id, { patterns: resolved, decayDays });
    }
    // Add custom paths → theta handles them
    if (userScope.custom_paths.length > 0) {
        const existing = shadowPathMap.get("theta") ?? { patterns: [], decayDays: 60 };
        shadowPathMap.set("theta", {
            patterns: [...existing.patterns, ...userScope.custom_paths],
            decayDays: existing.decayDays,
        });
    }
    // Execute shadows
    const shadowEntries = Array.from(shadowPathMap.entries()).filter(([, v]) => v.patterns.length > 0);
    let shadowResults;
    if (sequential) {
        shadowResults = [];
        for (const [shadowId, { patterns, decayDays }] of shadowEntries) {
            const result = await bulkLoadPaths(patterns, {
                shadowId,
                decayConstantDays: decayDays,
                dryRun,
            });
            shadowResults.push(result);
        }
    }
    else {
        // Parallel execution (Iron-E-Giant Federation 8-Shadow LICKETY-SPLIT)
        shadowResults = await Promise.all(shadowEntries.map(([shadowId, { patterns, decayDays }]) => bulkLoadPaths(patterns, {
            shadowId,
            decayConstantDays: decayDays,
            dryRun,
        })));
    }
    // Theta: receipt aggregation + Chronos signing
    const defaultIntegrated = userScope.enabled_categories;
    const receipt = generateReceipt({
        shadowResults,
        defaultIntegrated,
        userAdded: userScope.custom_paths,
        userOptedOut: userScope.disabled_categories,
        canonicalFileCountTarget,
        preLoadHitRatio,
    });
    return { receipt, shadowResults, userScope };
}
// ─── CLI entry point ──────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const dryRun = process.argv.includes("--dry-run");
    const scopeArg = process.argv.find((a) => a.startsWith("--scope="))?.split("=")[1];
    console.log(`\n🏕  Base Camp Protocol — Make Yourself Comfortable`);
    console.log(`   Phase 2 / BP010 / LICKETY-SPLIT 8-Shadow parallel`);
    console.log(`   Mode: ${dryRun ? "DRY-RUN" : "LIVE"} | Scope: ${scopeArg ?? "default"}\n`);
    const result = await runMakeYourselfComfortable({
        scope: scopeArg ?? "default",
        dryRun,
        sequential: false,
    });
    const { receipt } = result;
    console.log(`Receipt: ${receipt.receipt_id}`);
    console.log(`Status:  ${receipt.status.toUpperCase()}`);
    console.log(`Files indexed:       ${receipt.files_indexed}`);
    console.log(`Pheromones emitted:  ${receipt.pheromones_emitted}`);
    console.log(`Completeness:        ${receipt.completeness_pct}%`);
    console.log(`Phase-0 hit ratio:   ${receipt.detective_phase0_hit_ratio_pre_load.toFixed(2)} → ${receipt.detective_phase0_hit_ratio_post_load.toFixed(2)} (${receipt.hit_ratio_improvement_factor}×)`);
    if (receipt.error_count > 0) {
        console.log(`\n⚠  ${receipt.error_count} errors. First 5:`);
        receipt.errors.slice(0, 5).forEach((e) => console.log(`   ${e}`));
    }
    console.log(`\n→ ${receipt.next_recommended_action}`);
    console.log(`\nReceipt saved: ${RECEIPT_PATH}`);
    console.log(`Chronos sig: ${receipt.chronos_chronicler_sig.substring(0, 16)}...`);
}
//# sourceMappingURL=make_yourself_comfortable.js.map
