import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync, statSync, appendFileSync } from "fs";
import { autoRegisterFromDetective } from "./wrasse_auto_register.js";
import { tmpdir, homedir } from "os";
import { checkRebuildLock, clearPostBuildReloadLock } from "./buildGate.js";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { buildBriefing, buildChecklist, buildDebrief } from "./router/moneyPennyRouter.js";
import { validateSessionId } from "./sessionGuard.js";
import { budgetEnforce, BUDGETS, truncateList, truncateToWords } from "./router/budgets.js";
import { canonicalValueMatches, loadCanonicalFlat } from "./predicates/canonical_value_matches.js";
import { checkFreshness } from "./indexer/fingerprint.js";
import { createFreshIndexGate } from "./indexer/freshIndexGate.js";
import { getRegistry, listScribeIds, getScribe } from "./scribes/registry.js";
import { SESSION_ID_REGEX, SESSION_ID_DESCRIPTION } from "./schemas/sessionId.js";
import { appendTidbit, appendScribeEntry, appendFatesLog, readTidbits, readTablet, readFatesLog, tabletStats, SCRIBES_DIR, } from "./scribes/cathedral.js";
import { runFates } from "./scribes/fates.js";
import { consultScribes } from "./scribes/consult.js";
import { memberConsultScribes } from "./cathedral_supabase/member_consult.js";
import { memberFatesRoute } from "./cathedral_supabase/member_fates.js";
import { queryPheromone, buildPheromoneIndex, emitPheromone } from "./scribes/pheromone.js";
import { getInboundStatus } from "./scribes/hounds.js";
import { runDispatchPawn, getDispatchStatus, cancelDispatch, listRecentDispatches, } from "./pawn_dispatch.js";
import { indexPawnReturns, readHighPrioritySurface, getIndexedReturnCount, } from "./pawn_return_indexer.js";
import { teamDispatch } from "./team_dispatcher/dispatcher.js";
import { getScribeAccessDescriptor, } from "./team_dispatcher/cohort_class_enforcement.js";
import { queryProvenanceChain, listRootMiners } from "./team_dispatcher/provenance_chain.js";
import { runMinerProspect } from "./miners/miner_base.js";
import { queryIpLedger } from "./miners/ip_ledger_lock.js";
import { listAllWells } from "./miners/well_of_knowledge.js";
import { createExcaliburSlice, evaluateAndTagSlice, getSliceById, listExcaliburClassSlices, listAllSlices, recordMemberVote, } from "./excalibur_class/slice_pipeline.js";
import { handleGetTierBountyPayRate, } from "./three_tier/bounty_poster_tier_scaffold.js";
import { handleGenerateTierBountyPoster, } from "./three_tier/bounty_poster_tier_generator.js";
import { handleValidateBountyReceipt, } from "./three_tier/bounty_receipt_validator.js";
import { handleProcessBountyMarksPayout, } from "./three_tier/bounty_marks_payout.js";
import { createSubscription, activateSubscription, activateOneTimeAccess, } from "./excalibur_class/subscription_state_machine.js";
import { recordShareBackForPayment, getShareBackSummaryForSlice, getTotalShareBackEarned, } from "./excalibur_class/share_back_ledger.js";
import { probeCohortClass, formatCohortSummary } from "./cohort_class/probe.js";
import { probeTierConfig, setTierConfig, formatTierSummary, buildPlanTierAdvisory, } from "./cohort_class/tier_config_probe.js";
// KN-I1: Reminder Scribe pattern-match engine
import { runReminderScribeCheck } from "./reminder_scribe/pattern_match_engine.js";
import { createJar, sealJar, queryJars, } from "./house_scribe/jar_lifecycle.js";
import { assignCoordinate, queryJarsByCoordinate, } from "./house_scribe/coordinate_assignment.js";
import { updateCellOnEvent, queryLivingCell, buildGridworkSnapshot, detectAndReconcileInconsistencies, } from "./house_scribe/living_gridwork.js";
import { onThreadClosedWithSynthesis, queryHiveJarStatus, } from "./house_scribe/apiarist_hive_subscriber.js";
import { queryCrossCathedral, invalidateCrossCache, queryCrossCathedralProvenance, } from "./house_scribe/cross_cathedral_router.js";
import { runPopulationAudit, } from "./house_scribe/population_audit.js";
// KN-N1/N2/N3: Gold Tablet Infrastructure (Layer 4 SOURCE-class)
import { appendTablet, queryTablets, auditTablets, } from "./gold_tablet/ledger.js";
import { checkMutationAuthority, } from "./gold_tablet/authority_check.js";
import { linkExcaliburToGold, } from "./gold_tablet/excalibur_pointer.js";
import { cascadeSupersession, } from "./gold_tablet/supersession_cascade.js";
import { writeGoldPixieDust } from "./gold_tablet/pheromone.js";
// KN-D2/D4/D5: Apiarist Hive Infrastructure Remainder
import { createHiveThread, advanceHiveThread, readHiveThread, } from "./apiarist_hive/state_transitions.js";
import { onThreadClosedFederateIfEligible } from "./apiarist_hive/cross_frame_federation.js";
import { enforceCap } from "./apiarist_hive/uptime_cap.js";
// KN-J6: Dual-Tier IPv4-Local / IPv6-Federation Translation
import { localToFederation, federationToLocal, getTranslationProvenance, } from "./house_scribe/federation_translation.js";
// KN-I3: Reminder Scribe substrate write-back + provenance chain
import { writeBackViolationEvent, queryRsHistory, drainRetryQueue, aggregateByRule, } from "./reminder_scribe/substrate_writeback.js";
// KN-I4: Reminder Scribe metrics aggregator
import { buildMetricsDashboard, formatMetricsSummaryMarkdown, } from "./reminder_scribe/metrics_aggregator.js";
// KN-I2: Catechist Scribe grader extension
import { runSessionOpenGrade, formatGradeMarkdown, } from "./catechist/grader.js";
import { computeBalance, computeAudit, } from "./joules/balance.js";
import { JoulesOperations } from "./joules/operations.js";
// KN-T1/T2/T3/T4: Pod-T Keyword-Pyramid Strata Hierarchy
import { readAllAssignments, ALL_STRATA, } from "./strata/schema.js";
import { StrataQuery, } from "./strata/query.js";
import { detectiveQueryByStratum, } from "./strata/cross_cut.js";
// KN-K1/K2/K3: Pod-K Codex (Layer 8 Canon-of-Canons)
import { allocateCodexSerial, appendCodexEntry, readAllCodexEntries, getCodexById, queryCodex, } from "./codex/schema.js";
import { CodexBinding, } from "./codex/binding.js";
import { reserveNextSerial, bindReservation, expireReservations, queryReservations, resolveReservationForCreate, } from "./codex/serial_allocator.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INDEX_DIR = resolve(__dirname, "..", "index");
// K520.5 — First-Consult Edict substrate cache (A&A #2310)
const SUBSTRATE_CACHE_DIR = resolve(homedir(), ".lb-session");
const SUBSTRATE_CACHE_FILE = resolve(SUBSTRATE_CACHE_DIR, "substrate_cache.json");
// K520.6: read always-loaded OperationalGotchas tablets for substrate cache injection
function readGotchasForCache() {
    try {
        return readTablet("OperationalGotchas");
    }
    catch {
        return [];
    }
}
function writeSubstrateCache(task, briefingText) {
    // K520.8: explicit logging at every step — no silent failures
    const target = SUBSTRATE_CACHE_FILE;
    try {
        // C.2: ensure parent directory exists before write
        mkdirSync(SUBSTRATE_CACHE_DIR, { recursive: true });
        console.error(`[K520.8] writeSubstrateCache: dir ensured, target=${target}`);
        const gotchas = readGotchasForCache();
        console.error(`[K520.8] writeSubstrateCache: gotchas loaded (n=${gotchas.length})`);
        // C.4: schema must match what the gate reads: ts (epoch int), cached_at (ISO string)
        // C.2: truncate briefing to 50K chars to avoid pathological JSON size
        const payload = JSON.stringify({
            ts: Math.floor(Date.now() / 1000),
            session_task: task,
            briefing: briefingText.slice(0, 50_000),
            gotchas,
            cached_at: new Date().toISOString(),
        }, null, 2);
        writeFileSync(target, payload, "utf-8");
        console.error(`[K520.8] writeSubstrateCache: write attempted, payload=${payload.length} bytes`);
        // C.5: round-trip self-test — throw if file didn't land
        const { size } = statSync(target);
        if (size === 0) {
            throw new Error("statSync shows size=0 after write — file appears empty");
        }
        console.error(`[K520.8] writeSubstrateCache: VERIFIED file at ${target}, size=${size}`);
    }
    catch (err) {
        // Non-fatal — brief_me still returns its result — but NOW we log the cause
        console.error(`[K520.8] writeSubstrateCache: FAILED at ${target} — ${String(err)}`);
    }
}
function normalizePagination(options, defaultLimit, maxLimit = 200) {
    const offset = Math.max(0, options?.offset ?? 0);
    const limitRaw = options?.limit ?? defaultLimit;
    const limit = Math.max(1, Math.min(maxLimit, limitRaw));
    return { offset, limit };
}
function paginateResults(items, options, defaultLimit) {
    const { offset, limit } = normalizePagination(options, defaultLimit);
    const total_count = items.length;
    const results = items.slice(offset, offset + limit);
    const has_more = offset + results.length < total_count;
    return { results, total_count, offset, limit, has_more };
}
function globPatternToRegex(pattern) {
    const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`, "i");
}
function loadIndex(name) {
    const path = resolve(INDEX_DIR, `${name}.json`);
    if (!existsSync(path))
        return null;
    return JSON.parse(readFileSync(path, "utf-8"));
}
let overview = loadIndex("overview");
let schemas = loadIndex("schemas");
let functions = loadIndex("functions");
let pages = loadIndex("pages");
let cephas = loadIndex("cephas");
let context = loadIndex("context");
let bishop = loadIndex("bishop");
let domains = loadIndex("domains");
let concepts = loadIndex("concepts");
let dropzones = loadIndex("dropzones");
let transcripts = loadIndex("transcripts");
let components = loadIndex("components");
let v2Migration = loadIndex("v2-migration");
let letters = loadIndex("letters");
function reloadAll() {
    overview = loadIndex("overview");
    schemas = loadIndex("schemas");
    functions = loadIndex("functions");
    pages = loadIndex("pages");
    cephas = loadIndex("cephas");
    context = loadIndex("context");
    bishop = loadIndex("bishop");
    domains = loadIndex("domains");
    concepts = loadIndex("concepts");
    dropzones = loadIndex("dropzones");
    transcripts = loadIndex("transcripts");
    components = loadIndex("components");
    v2Migration = loadIndex("v2-migration");
    letters = loadIndex("letters");
}
// ─── K441 Half D: fingerprint-based cache invalidation ────────────────────────
// Before this Knight, every server.tool used `if (!XXX) reloadAll()` — meaning
// the in-memory index was loaded once at startup and never refreshed, so
// `npm run rebuild` writing fresh content to `index/*.json` did NOT propagate
// to a running MCP server. Founder had to restart the client to see new data.
//
// Fix: every tool that consults an index now calls `ensureFreshIndex()` first
// (delegates to the FreshIndexGate primitive in `./indexer/freshIndexGate.ts`).
// The gate reads JUST `index/last_build_fingerprint.json` (a tiny file written
// at the end of every rebuild) and compares its `treeHash` to the last value
// it saw. On change, it triggers a single `reloadAll()` and stamps the new
// fingerprint. On no-change it is essentially a single small JSON parse —
// cheap enough to do per tool call. The gate is unit-tested independently in
// `tests/test_fresh_index_gate.mjs`.
const freshIndexGate = createFreshIndexGate(INDEX_DIR, () => reloadAll(), () => overview != null);
function ensureFreshIndex() {
    return freshIndexGate.check();
}
const server = new McpServer({
    name: "librarian",
    version: "1.0.0",
});
function buildGateCheck() {
    const result = checkRebuildLock();
    if (!result)
        return null;
    if ("warning" in result) {
        // Stale lock: crashed build left a lock behind. Log and proceed.
        console.error(`[build-gate] Stale .rebuild.lock (age ${result.age_ms}ms). Proceeding. Consider running npm run build-guarded to clear.`);
        return null;
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
// ── K506 Phase A — In-process session telemetry tracker ──────────────────────
// Accumulates MCP tool call count + estimated overhead tokens for the current
// session. Auto-resets when run_session_end consumes and logs the values.
// No per-session keying needed: a single agent session is one MCP server
// process lifetime (or at least one conversation). Counters are module-level
// state; thread-safety is irrelevant here (Node.js single-thread event loop).
const _sessionTracker = {
    injection_count: 0,
    overhead_tokens_estimate: 0,
    session_start_ts: new Date().toISOString(),
    last_call_ts: new Date().toISOString(),
    tool_call_names: [],
};
function _resetSessionTracker() {
    _sessionTracker.injection_count = 0;
    _sessionTracker.overhead_tokens_estimate = 0;
    _sessionTracker.session_start_ts = new Date().toISOString();
    _sessionTracker.last_call_ts = new Date().toISOString();
    _sessionTracker.tool_call_names = [];
}
// ─────────────────────────────────────────────────────────────────────────────
function registerTool(name, desc, schema, handler) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.tool(name, desc, schema, async (args) => {
        const blocked = buildGateCheck();
        if (blocked)
            return blocked;
        const result = await handler(args);
        // K506 Phase A: track every MCP tool call as one substrate injection event
        _sessionTracker.injection_count++;
        _sessionTracker.last_call_ts = new Date().toISOString();
        _sessionTracker.tool_call_names.push(name);
        // Estimate response size in tokens (rough: chars / 4)
        const responseText = result.content
            .filter((c) => c.type === "text")
            .map((c) => c.text)
            .join("");
        _sessionTracker.overhead_tokens_estimate += Math.ceil(responseText.length / 4);
        return result;
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════
// TOOL 1: get_system_overview
// ═══════════════════════════════════════════
registerTool("get_system_overview", "Returns innovation count, initiative count, page/function/table counts, last session, and pending work. Call at session start.", {}, async () => {
    ensureFreshIndex();
    if (!overview) {
        return { content: [{ type: "text", text: "Index not built yet. Run: cd librarian-mcp && npm run rebuild" }] };
    }
    return {
        content: [{
                type: "text",
                text: JSON.stringify(overview, null, 2),
            }],
    };
});
// ═══════════════════════════════════════════
// TOOL 2: query_domain
// ═══════════════════════════════════════════
registerTool("query_domain", "Returns all tables, functions, pages, feature flags, and Cephas content for a domain (e.g. 'lb_card', 'housing', 'ghost_world'). Pass domain name or 'list' to see all domains.", { domain: z.string().describe("Domain name or 'list' to see all available domains") }, async ({ domain }) => {
    ensureFreshIndex();
    if (!domains) {
        return { content: [{ type: "text", text: "Index not built." }] };
    }
    if (domain === "list") {
        const list = Object.entries(domains.domains).map(([name, d]) => `${name}: ${d.tables.length} tables, ${d.edgeFunctions.length} functions, ${d.pages.length} pages`);
        return { content: [{ type: "text", text: list.join("\n") }] };
    }
    const d = domains.domains[domain];
    if (!d) {
        const available = Object.keys(domains.domains).join(", ");
        return { content: [{ type: "text", text: `Domain '${domain}' not found. Available: ${available}` }] };
    }
    const result = { ...d };
    if (schemas) {
        result.tableDetails = d.tables.map(t => {
            const table = schemas.tables[t];
            return table ? { name: t, columns: table.columns.length, pk: table.primaryKey, fks: table.foreignKeys } : { name: t };
        });
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 3: get_schema
// ═══════════════════════════════════════════
registerTool("get_schema", "Returns columns, types, constraints, FKs, indexes, RLS policies, and originating migration for a table. Pass 'list' to see all tables.", { table: z.string().describe("Table name or 'list' to see all tables") }, async ({ table }) => {
    ensureFreshIndex();
    if (!schemas) {
        return { content: [{ type: "text", text: "Index not built." }] };
    }
    if (table === "list") {
        const tables = Object.keys(schemas.tables).sort();
        return { content: [{ type: "text", text: `${tables.length} tables:\n${tables.join("\n")}` }] };
    }
    const t = schemas.tables[table];
    if (!t) {
        const matches = Object.keys(schemas.tables).filter(n => n.includes(table));
        return {
            content: [{
                    type: "text",
                    text: matches.length
                        ? `Table '${table}' not found. Did you mean: ${matches.join(", ")}?`
                        : `Table '${table}' not found. Use 'list' to see all tables.`,
                }],
        };
    }
    return { content: [{ type: "text", text: JSON.stringify(t, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 4: list_edge_functions
// ═══════════════════════════════════════════
registerTool("list_edge_functions", "Lists edge functions, optionally filtered by name/domain pattern. Returns name, purpose, auth pattern, and tables used.", { filter: z.string().optional().describe("Optional name/keyword filter (e.g. 'card', 'membership', 'webhook')") }, async ({ filter }) => {
    ensureFreshIndex();
    if (!functions) {
        return { content: [{ type: "text", text: "Index not built." }] };
    }
    let entries = Object.values(functions.functions);
    if (filter) {
        const lower = filter.toLowerCase();
        entries = entries.filter(f => f.name.toLowerCase().includes(lower) ||
            f.purpose.toLowerCase().includes(lower) ||
            f.tablesUsed.some(t => t.toLowerCase().includes(lower)) ||
            f.externalApis.some(a => a.toLowerCase().includes(lower)));
    }
    const summary = entries.map(f => `${f.name} | ${f.authPattern} | ${f.purpose} | tables: ${f.tablesUsed.join(", ") || "none"}`);
    return {
        content: [{
                type: "text",
                text: `${entries.length} functions${filter ? ` matching '${filter}'` : ""}:\n\n${summary.join("\n")}`,
            }],
    };
});
// ═══════════════════════════════════════════
// TOOL 5: get_page_info
// ═══════════════════════════════════════════
registerTool("get_page_info", "Returns route, data queries, feature flag dependencies, and edge function calls for a page. Pass 'list' to see all pages.", { page: z.string().describe("Page component name or 'list'") }, async ({ page }) => {
    ensureFreshIndex();
    if (!pages) {
        return { content: [{ type: "text", text: "Index not built." }] };
    }
    if (page === "list") {
        const list = Object.values(pages.pages).map(p => `${p.route} → ${p.name}`).sort();
        return { content: [{ type: "text", text: `${pages.count} pages:\n${list.join("\n")}` }] };
    }
    const p = pages.pages[page];
    if (!p) {
        const matches = Object.keys(pages.pages).filter(n => n.toLowerCase().includes(page.toLowerCase()));
        return {
            content: [{
                    type: "text",
                    text: matches.length
                        ? `Page '${page}' not found. Did you mean: ${matches.join(", ")}?`
                        : `Page '${page}' not found.`,
                }],
        };
    }
    return { content: [{ type: "text", text: JSON.stringify(p, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 6: get_canonical_numbers
// ═══════════════════════════════════════════
registerTool("get_canonical_numbers", "Returns all canonical numbers from canonical_values.yaml (single source of truth): innovations, crown jewels, patents, membership cost, creator keeps %, etc. Always reads fresh from disk.", {}, async () => {
    try {
        const flat = loadCanonicalFlat();
        const result = {
            innovationCount: flat["stats.innovation_count"],
            crownJewelCount: flat["stats.crown_jewels"],
            formalClaimsCount: flat["stats.formal_claims_approximate"],
            provisionalApps: flat["stats.patent_provisionals_filed"],
            productionSystems: flat["stats.production_systems"],
            puddings: flat["stats.puddings"],
            papers: flat["stats.papers"],
            lettersInQueue: flat["stats.letters_in_dispatch_queue"],
            creatorKeeps: `${flat["economics.creator_keeps_percentage"]}%`,
            platformMargin: flat["economics.platform_margin"],
            on500Transaction: "$416.67",
            membershipCost: `$${flat["economics.membership_cost_usd_per_year"]}/year`,
            initiativeCount: 16,
            legalEntity: flat["entity.legal_name"],
            ein: flat["entity.ein"],
            entityType: flat["entity.entity_type"],
            source: "canonical_values.yaml",
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch {
        // Fallback if YAML not found
        const fresh = loadIndex("canonical");
        ensureFreshIndex();
        const canonical = fresh || context?.canonicalNumbers || {};
        const result = {
            innovationCount: canonical.innovationCount || 2078,
            crownJewelCount: canonical.crownJewelCount || 146,
            formalClaimsCount: canonical.formalClaimsCount || 1511,
            provisionalApps: canonical.provisionalApps || 10,
            creatorKeeps: "83.3%",
            platformMargin: "Cost + 20%",
            on500Transaction: "$416.67",
            membershipCost: "$5/year",
            initiativeCount: 16,
            legalEntity: "LIANA BANYAN CORPORATION",
            ein: "41-2797446",
            state: "Wyoming C-Corp",
            source: "fallback (canonical_values.yaml not found)",
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
});
// ═══════════════════════════════════════════
// TOOL 7: get_initiative
// ═══════════════════════════════════════════
const INITIATIVES = {
    "lets_make_dinner": { number: 1, crown: "Maneet Chauhan" },
    "lets_get_groceries": { number: 2 },
    "lets_go_shopping": { number: 3, crown: "Mary Beth Laughton" },
    "household_concierge": { number: 4 },
    "the_family_table": { number: 5 },
    "tatiana_schlossburg_health_accords": { number: 6 },
    "msa": { number: 7 },
    "defense_klaus": { number: 8 },
    "rally_group": { number: 9, crown: "Kimberly A. Williams" },
    "vsl": { number: 10, crown: "Cathie Mahon" },
    "lets_make_bread": { number: 11 },
    "harper_guild": { number: 12 },
    "jukebox": { number: 13 },
    "didasko": { number: 14 },
    "power_to_the_people": { number: 15 },
    "brass_tacks": { number: 16 },
};
registerTool("get_initiative", "Returns initiative details: crown holder, tables, pages, letters, status. Pass 'list' for all initiatives.", { name: z.string().describe("Initiative name (snake_case) or 'list'") }, async ({ name }) => {
    if (name === "list") {
        const list = Object.entries(INITIATIVES).map(([k, v]) => `#${v.number} ${k}${v.crown ? ` (Crown: ${v.crown})` : ""}`);
        return { content: [{ type: "text", text: `The Sweet Sixteen:\n${list.join("\n")}` }] };
    }
    const initiative = INITIATIVES[name.toLowerCase().replace(/\s+/g, "_")];
    if (!initiative) {
        return { content: [{ type: "text", text: `Initiative '${name}' not found. Use 'list' to see all.` }] };
    }
    const result = {
        name,
        number: initiative.number,
        crownHolder: initiative.crown || "Not yet assigned",
    };
    if (cephas) {
        result.letters = Object.values(cephas.entries)
            .filter(e => e.initiative?.toLowerCase().includes(name.toLowerCase().replace(/_/g, " ")))
            .map(e => ({ path: e.path, title: e.title, recipient: e.recipient }));
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 8: get_session_context
// ═══════════════════════════════════════════
registerTool("get_session_context", "Returns what was built in a session: files changed, commits, pending work. Without session_id returns the latest.", { session_id: z.string().optional().describe("Session ID (e.g. 'A', 'C', '98') or omit for latest") }, async ({ session_id }) => {
    // K441 Half D: ensureFreshIndex() reloads only when the on-disk
    // fingerprint changes (after `npm run rebuild`). Cheap on the no-change
    // path, full reload on the change path. Replaces the prior unconditional
    // reloadAll() that paid the cost on every call.
    ensureFreshIndex();
    if (!context || !context.sessions.length) {
        return { content: [{ type: "text", text: "No session data available." }] };
    }
    let session;
    if (session_id) {
        session = context.sessions.find(s => s.id === session_id || s.id.includes(session_id));
    }
    else {
        session = context.sessions[context.sessions.length - 1];
    }
    if (!session) {
        const ids = context.sessions.map(s => s.id).join(", ");
        return { content: [{ type: "text", text: `Session '${session_id}' not found. Available: ${ids}` }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(session, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 9: search_knowledge
// ═══════════════════════════════════════════
registerTool("search_knowledge", "Text search across all index files. Returns top matches with context.", {
    query: z.string().describe("Search query"),
    options: z.object({
        offset: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(200).optional(),
    }).optional().describe("Pagination options"),
}, async ({ query, options }) => {
    ensureFreshIndex();
    const results = [];
    const lower = query.toLowerCase();
    if (schemas) {
        for (const [name, table] of Object.entries(schemas.tables)) {
            if (name.includes(lower) || table.columns.some(c => c.name.includes(lower))) {
                results.push({
                    source: "schema",
                    key: name,
                    snippet: `Table ${name}: ${table.columns.length} columns, origin: ${table.originMigration}`,
                });
            }
        }
    }
    if (functions) {
        for (const [name, func] of Object.entries(functions.functions)) {
            if (name.includes(lower) || func.purpose.toLowerCase().includes(lower)) {
                results.push({
                    source: "function",
                    key: name,
                    snippet: `${func.name}: ${func.purpose} [${func.authPattern}]`,
                });
            }
        }
    }
    if (pages) {
        for (const [name, page] of Object.entries(pages.pages)) {
            if (name.toLowerCase().includes(lower) || page.route.includes(lower)) {
                results.push({
                    source: "page",
                    key: name,
                    snippet: `${page.name} → ${page.route} ${page.isProtected ? "[protected]" : ""}`,
                });
            }
        }
    }
    if (cephas) {
        for (const [path, entry] of Object.entries(cephas.entries)) {
            if (path.toLowerCase().includes(lower) || entry.title.toLowerCase().includes(lower) ||
                entry.tags.some(t => t.toLowerCase().includes(lower))) {
                results.push({
                    source: "cephas",
                    key: path,
                    snippet: `${entry.title} [${entry.section}] ${entry.wordCount} words`,
                });
            }
        }
    }
    if (bishop) {
        for (const [, chat] of Object.entries(bishop.chats)) {
            if (chat.summary.toLowerCase().includes(lower) ||
                chat.topicsDiscussed.some(t => t.toLowerCase().includes(lower))) {
                results.push({
                    source: "bishop_chat",
                    key: chat.filename,
                    snippet: chat.summary.slice(0, 200),
                });
            }
        }
    }
    if (domains) {
        for (const [name] of Object.entries(domains.domains)) {
            if (name.includes(lower)) {
                results.push({
                    source: "domain",
                    key: name,
                    snippet: `Domain: ${name}`,
                });
            }
        }
    }
    if (concepts) {
        for (const [slug, c] of Object.entries(concepts.concepts)) {
            if (c.title.toLowerCase().includes(lower) ||
                c.keywords.some(k => k.includes(lower)) ||
                slug.includes(lower)) {
                results.push({
                    source: "concept",
                    key: slug,
                    snippet: `${c.title} [${c.section}] ${c.summary.slice(0, 120)}`,
                });
            }
        }
    }
    if (dropzones) {
        for (const [key, entry] of Object.entries(dropzones.entries)) {
            if (entry.title.toLowerCase().includes(lower) ||
                entry.tags.some(t => t.includes(lower)) ||
                entry.filename.toLowerCase().includes(lower)) {
                results.push({
                    source: "dropzone",
                    key,
                    snippet: `[${entry.agent}] ${entry.title.slice(0, 150)}`,
                });
            }
        }
    }
    if (transcripts) {
        for (const [, t] of Object.entries(transcripts.transcripts)) {
            if (t.summary.toLowerCase().includes(lower) ||
                t.topicsDiscussed.some(tp => tp.includes(lower)) ||
                t.filesModified.some(f => f.toLowerCase().includes(lower))) {
                results.push({
                    source: "transcript",
                    key: t.id.slice(0, 8),
                    snippet: `${t.estimatedDate} | ${t.messageCount} msgs | ${t.summary.slice(0, 120)}`,
                });
            }
        }
    }
    if (components) {
        for (const [path, c] of Object.entries(components.components)) {
            if (c.name.toLowerCase().includes(lower) ||
                c.exports.some(e => e.toLowerCase().includes(lower)) ||
                c.supabaseQueries.some(q => q.toLowerCase().includes(lower))) {
                results.push({
                    source: "component",
                    key: path,
                    snippet: `${c.name} | exports: ${c.exports.join(", ")} | queries: ${c.supabaseQueries.join(", ") || "none"}`,
                });
            }
        }
        for (const [name, h] of Object.entries(components.hooks)) {
            if (name.toLowerCase().includes(lower) ||
                h.exports.some(e => e.toLowerCase().includes(lower))) {
                results.push({ source: "hook", key: name, snippet: `${h.name}: ${h.exports.join(", ")}` });
            }
        }
        for (const [name, l] of Object.entries(components.libs)) {
            if (name.toLowerCase().includes(lower) ||
                l.exports.some(e => e.toLowerCase().includes(lower))) {
                results.push({ source: "lib", key: name, snippet: `${l.name}: ${l.exports.slice(0, 5).join(", ")}` });
            }
        }
    }
    const paginated = paginateResults(results, options, 20);
    if (paginated.results.length === 0) {
        return { content: [{ type: "text", text: `No results for '${query}'.` }] };
    }
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    query,
                    ...paginated,
                }, null, 2),
            }],
    };
});
// ═══════════════════════════════════════════
// TOOL 10: get_deploy_state
// ═══════════════════════════════════════════
registerTool("get_deploy_state", "Returns last deploy info, pending migrations, pending function deploys, and build commands for each site.", {}, async () => {
    ensureFreshIndex();
    const deployState = context?.deployState || {
        pendingMigrations: [],
        buildCommands: {
            "lianabanyan.com": "cd platform; npm run build; firebase deploy --only hosting:main -P default",
            "cephas.lianabanyan.com": "cd Cephas/cephas-hugo; hugo --minify; firebase deploy",
            "lianabanyan.biz": "cd business-trunk; firebase deploy --only hosting:biz",
            "the2ndsecond.com": "cd dss-the2ndsecond; npm run build; firebase deploy --only hosting:2ndsecond -P default",
        },
    };
    const result = {
        ...deployState,
        supabasePush: "cd platform; npx supabase db push",
        functionsDeployAll: "cd platform; npx supabase functions deploy --no-verify-jwt",
        fullDeploy: 'cd platform; npm run build; firebase deploy --only hosting:main -P default; cd "..\\Cephas\\cephas-hugo"; hugo --minify; firebase deploy',
        warnings: [
            "lianabanyan.com uses hosting:main, NOT hosting:dotcom",
            "PowerShell uses ';' not '&&' to chain commands",
            "Always npm run build before deploying platform",
            "Always hugo --minify before deploying Cephas",
        ],
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 11: update_session
// ═══════════════════════════════════════════
registerTool("update_session", "Appends a session summary to the index. Call at session end instead of editing MILESTONE_HANDOFF.", {
    session_id: z.string().describe("Session identifier (e.g. 'K99')"),
    summary: z.string().describe("What was built/accomplished"),
    files_changed: z.array(z.string()).optional().describe("List of files changed"),
    migrations_created: z.array(z.string()).optional().describe("New migration filenames"),
    functions_created: z.array(z.string()).optional().describe("New edge function names"),
    pages_created: z.array(z.string()).optional().describe("New page names"),
    pending_work: z.array(z.string()).optional().describe("Tasks left for next session"),
}, async ({ session_id, summary, files_changed, migrations_created, functions_created, pages_created, pending_work }) => {
    const sessionsPath = resolve(INDEX_DIR, "sessions.json");
    let sessions = [];
    if (existsSync(sessionsPath)) {
        sessions = JSON.parse(readFileSync(sessionsPath, "utf-8"));
    }
    // K460 input guard — reject implausibly high session IDs at the write path
    const guardResult = validateSessionId(session_id, sessions);
    if (guardResult.rejected) {
        return {
            content: [{ type: "text", text: JSON.stringify(guardResult, null, 2) }],
            isError: true,
        };
    }
    const newSession = {
        id: session_id,
        date: new Date().toISOString().split("T")[0],
        summary,
        filesChanged: files_changed || [],
        migrationsCreated: migrations_created || [],
        functionsCreated: functions_created || [],
        pagesCreated: pages_created || [],
        pendingWork: pending_work || [],
    };
    sessions.push(newSession);
    if (!existsSync(INDEX_DIR))
        mkdirSync(INDEX_DIR, { recursive: true });
    writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), "utf-8");
    if (overview) {
        overview.lastSession = session_id;
        overview.pendingWork = pending_work || [];
        overview.timestamp = new Date().toISOString();
        writeFileSync(resolve(INDEX_DIR, "overview.json"), JSON.stringify(overview, null, 2), "utf-8");
    }
    return {
        content: [{
                type: "text",
                text: `Session ${session_id} recorded. ${files_changed?.length || 0} files, ${migrations_created?.length || 0} migrations, ${pending_work?.length || 0} pending items.`,
            }],
    };
});
// ═══════════════════════════════════════════
// TOOL 12: get_bishop_chat
// ═══════════════════════════════════════════
registerTool("get_bishop_chat", "Returns summary, decisions, and topics from BISHOP chat transcripts. Pass filename for details, 'list' for recent 20, or 'search:keyword' to find by topic.", { chat: z.string().describe("Chat filename, 'list' for recent 20, or 'search:keyword'") }, async ({ chat }) => {
    ensureFreshIndex();
    if (!bishop) {
        return { content: [{ type: "text", text: "Bishop index not built." }] };
    }
    if (chat.startsWith("search:")) {
        const query = chat.slice(7).toLowerCase().trim();
        const matches = Object.values(bishop.chats).filter(c => c.summary.toLowerCase().includes(query) ||
            c.topicsDiscussed.some(t => t.includes(query)) ||
            c.keyDecisions.some(d => d.toLowerCase().includes(query)));
        const output = truncateList(matches.slice(0, 10), 10, c => `${c.filename} | ${c.summary.slice(0, 80)}... | topics: ${c.topicsDiscussed.slice(0, 3).join(", ")}`);
        return {
            content: [{ type: "text", text: `${matches.length} chats matching '${query}':\n\n${output}` }],
        };
    }
    if (chat === "list") {
        const all = Object.values(bishop.chats);
        const output = truncateList(all.slice(-BUDGETS.listDefault), BUDGETS.listDefault, c => `${c.filename} | ${c.wordCount} words | ${c.topicsDiscussed.slice(0, 3).join(", ")}`);
        return {
            content: [{
                    type: "text",
                    text: `${bishop.count} BISHOP chats (showing recent ${Math.min(BUDGETS.listDefault, all.length)}):\n\n${output}`,
                }],
        };
    }
    const entry = bishop.chats[chat];
    if (!entry) {
        const matches = Object.keys(bishop.chats).filter(k => k.toLowerCase().includes(chat.toLowerCase()));
        return {
            content: [{
                    type: "text",
                    text: matches.length
                        ? `Chat '${chat}' not found. Did you mean: ${matches.slice(0, 10).join(", ")}?`
                        : `Chat '${chat}' not found.`,
                }],
        };
    }
    return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 13: get_architecture
// ═══════════════════════════════════════════
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");
registerTool("get_architecture", "Returns architectural concept explanation from Cephas. Searches by keyword, slug, or title. Pass 'list' to see all concepts, or a keyword like 'joules', 'cost+20', 'three-gear', 'crown', 'medallion', etc. Set brief=true (default) for summary only, brief=false for full markdown content.", {
    concept: z.string().describe("Concept slug, keyword, or 'list' for all concepts"),
    brief: z.boolean().optional().describe("If true (default), returns summary only. Set false for full content."),
}, async ({ concept, brief }) => {
    const isBrief = brief !== false;
    ensureFreshIndex();
    if (!concepts) {
        return { content: [{ type: "text", text: "Concepts index not built. Run: cd librarian-mcp && npm run rebuild" }] };
    }
    if (concept === "list") {
        const byCategory = {};
        for (const [slug, c] of Object.entries(concepts.concepts)) {
            const cat = c.category || "uncategorized";
            if (!byCategory[cat])
                byCategory[cat] = [];
            byCategory[cat].push(`${c.title} [${slug}]`);
        }
        const formatted = Object.entries(byCategory)
            .map(([cat, items]) => `## ${cat}\n${items.map(i => `  - ${i}`).join("\n")}`)
            .join("\n\n");
        return {
            content: [{
                    type: "text",
                    text: `${concepts.count} architectural concepts:\n\n${formatted}`,
                }],
        };
    }
    const lower = concept.toLowerCase().replace(/\s+/g, "-");
    let entry = concepts.concepts[lower];
    if (!entry) {
        const byTitle = Object.values(concepts.concepts).find(c => c.title.toLowerCase().includes(concept.toLowerCase()));
        if (byTitle)
            entry = byTitle;
    }
    if (!entry && concepts.byKeyword[concept.toLowerCase()]) {
        const slugs = concepts.byKeyword[concept.toLowerCase()];
        if (slugs.length === 1) {
            entry = concepts.concepts[slugs[0]];
        }
        else {
            const matches = slugs.map(s => {
                const c = concepts.concepts[s];
                return `- **${c.title}** [${s}]: ${c.summary.slice(0, 120)}...`;
            });
            return {
                content: [{
                        type: "text",
                        text: `${slugs.length} concepts match keyword '${concept}':\n\n${matches.join("\n")}\n\nCall again with a specific slug for full details.`,
                    }],
            };
        }
    }
    if (!entry) {
        const fuzzyMatches = Object.values(concepts.concepts).filter(c => c.keywords.some(k => k.includes(concept.toLowerCase())) ||
            c.title.toLowerCase().includes(concept.toLowerCase()) ||
            c.slug.includes(lower));
        if (fuzzyMatches.length > 0) {
            const list = fuzzyMatches.slice(0, 10).map(c => `- **${c.title}** [${c.slug}]: ${c.summary.slice(0, 100)}...`);
            return {
                content: [{
                        type: "text",
                        text: `No exact match for '${concept}'. Related concepts:\n\n${list.join("\n")}`,
                    }],
            };
        }
        return { content: [{ type: "text", text: `No concept found for '${concept}'. Use 'list' to see all.` }] };
    }
    let contentField;
    if (isBrief) {
        contentField = entry.summary;
    }
    else {
        let fullContent = "";
        try {
            const contentDir = resolve(WORKSPACE_ROOT, "Cephas", "cephas-hugo", "content");
            const filePath = resolve(contentDir, entry.filePath);
            if (existsSync(filePath)) {
                fullContent = readFileSync(filePath, "utf-8");
                const fmEnd = fullContent.indexOf("---", 4);
                if (fmEnd > 0)
                    fullContent = fullContent.slice(fmEnd + 3).trim();
            }
        }
        catch { /* fall back to summary */ }
        contentField = fullContent || entry.summary;
    }
    const result = {
        title: entry.title,
        slug: entry.slug,
        category: entry.category,
        section: entry.section,
        description: entry.description,
        keywords: entry.keywords,
        relatedConcepts: entry.relatedConcepts,
        ipLedgerEntry: entry.ipLedgerEntry,
        status: entry.status,
        wordCount: entry.wordCount,
        content: contentField,
        note: isBrief ? "Brief mode. Call with brief=false for full content." : undefined,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 14: check_consistency
// ═══════════════════════════════════════════
const ARCHITECTURAL_RULES = [
    { id: "creator-keeps", rule: "Creator keeps exactly 83.3% (never 83%, never 84%). On a $500 transaction the creator gets $416.67.", source: "Structural Bylaw", severity: "critical" },
    { id: "cost-plus-20", rule: "All pricing uses Cost+20% model. Platform margin is always Cost + 20%, no more, no less.", source: "Structural Bylaw", severity: "critical" },
    { id: "membership-cost", rule: "Membership costs $5/year. This is a Structural Bylaw.", source: "Structural Bylaw", severity: "critical" },
    { id: "not-a-security", rule: "Platform tokens/credits are NOT securities. Never use 'equity', 'shares', 'dividends', 'ROI', or 'invest'. Use 'participation', 'allocation', 'contribution', 'back'.", source: "SEC Compliance", severity: "critical" },
    { id: "no-passive-income", rule: "Never promise passive income. Use 'may earn' not 'will earn'. Use 'allocation authority' not 'passive income'.", source: "SEC Compliance", severity: "critical" },
    { id: "three-gear-currency", rule: "Three currencies: Credits (immediate value), Marks (earned through service, can be backed), Joules (deferred value, grow over time). They are not interchangeable without specific conversion rules.", source: "Currency Architecture", severity: "critical" },
    { id: "wildfire-tour-data", rule: "Mock/demo data ONLY shown in WildFire Tour mode. Default state for real users must always be empty/zeroed until they have actual participation.", source: "UX Rule", severity: "important" },
    { id: "letter-sync", rule: "When ANY letter is updated in LAUNCH_DOCUMENTS_MASTER/letters/, the corresponding Cephas letter MUST be updated immediately.", source: "Content Sync", severity: "important" },
    { id: "sixteen-initiatives", rule: "There are exactly 16 initiatives (The Sweet Sixteen). Do not create new ones or merge existing ones.", source: "Platform Architecture", severity: "important" },
    { id: "cooperative-not-corporation", rule: "Liana Banyan is a cooperative ecosystem. Members fund each other through pre-orders at volume-discounted pricing. It is NOT venture-backed, NOT crypto.", source: "Core Philosophy", severity: "critical" },
    { id: "self-funding", rule: "The platform is self-funding through member participation. No external investment, no ads, no data selling.", source: "Core Philosophy", severity: "critical" },
    { id: "privacy-no-demographics", rule: "No demographic data collection. Structural Privacy Bylaw. No race, gender, age, religion data stored.", source: "Structural Bylaw", severity: "critical" },
    { id: "powershell-syntax", rule: "On Windows/PowerShell, use ';' to chain commands, NOT '&&'.", source: "Development", severity: "guideline" },
    { id: "firebase-hosting-main", rule: "lianabanyan.com uses hosting:main, NOT hosting:dotcom.", source: "Deployment", severity: "important" },
    { id: "surgical-edits", rule: "For files over 200 lines, use surgical edits (Edit), not full file rewrites (Write).", source: "Development", severity: "guideline" },
    { id: "crown-jewels-count", rule: "Crown Jewel count is canonical per canonical_values.yaml (~237 post-B126). Read from YAML rather than hardcoding.", source: "IP Portfolio", severity: "important" },
    { id: "patent-portfolio", rule: "Formal claims approximate canonical per canonical_values.yaml (~2,806 post-B126 across 13 provisionals filed + Prov 14 open). Read from YAML rather than hardcoding.", source: "IP Portfolio", severity: "important" },
    { id: "wyoming-c-corp", rule: "Legal entity is LIANA BANYAN CORPORATION, EIN 41-2797446, Wyoming C-Corp.", source: "Legal", severity: "critical" },
    { id: "cost-breakdown-required", rule: "All marketplace listings must show cost breakdown. Harper Auditors can verify costs.", source: "Marketplace Rules", severity: "important" },
    { id: "structural-bylaw-immutable", rule: "Structural Bylaws (Cost+20%, $5 membership, privacy, etc.) cannot be changed by normal vote. Requires Founder approval.", source: "Governance", severity: "critical" },
];
registerTool("check_consistency", "Validates a proposal or statement against Liana Banyan's architectural rules and constraints. Returns violations, warnings, and confirmations. Use this before implementing features to ensure alignment.", { proposal: z.string().describe("Description of what you're about to build or a statement to validate") }, async ({ proposal }) => {
    ensureFreshIndex();
    const lower = proposal.toLowerCase();
    const violations = [];
    const warnings = [];
    const confirmations = [];
    for (const rule of ARCHITECTURAL_RULES) {
        switch (rule.id) {
            case "creator-keeps":
                if (lower.includes("83%") && !lower.includes("83.3%")) {
                    violations.push({ rule, explanation: "Use 83.3%, not 83%. This is a critical number." });
                }
                if (lower.includes("83.3")) {
                    confirmations.push("Correct: 83.3% creator keeps.");
                }
                break;
            case "cost-plus-20":
                if ((lower.includes("cost") && lower.includes("25%")) || lower.includes("cost+25")) {
                    violations.push({ rule, explanation: "Platform margin is Cost+20%, not 25% or any other number." });
                }
                if (lower.includes("cost+20") || lower.includes("cost + 20")) {
                    confirmations.push("Correct: Cost+20% model.");
                }
                break;
            case "not-a-security":
                if (/\b(equity|shares?|dividend|roi)\b/.test(lower) && !lower.includes("not")) {
                    violations.push({ rule, explanation: "SEC-unsafe language detected. Replace with participation/allocation terms." });
                }
                if (/\binvest(ment|or|ing)?\b/.test(lower) && !lower.includes("not invest")) {
                    warnings.push({ rule, explanation: "The word 'invest' may trigger SEC concerns. Use 'back', 'support', or 'contribute' instead." });
                }
                break;
            case "no-passive-income":
                if (lower.includes("passive income") || lower.includes("will earn")) {
                    violations.push({ rule, explanation: "Never promise passive income. Use 'may earn' and 'allocation authority'." });
                }
                break;
            case "wildfire-tour-data":
                if ((lower.includes("mock") || lower.includes("demo") || lower.includes("sample")) && lower.includes("default")) {
                    warnings.push({ rule, explanation: "Mock/demo data should only show in WildFire Tour mode, not as default state." });
                }
                break;
            case "membership-cost":
                if (lower.includes("membership") && /\$\d/.test(lower) && !lower.includes("$5")) {
                    violations.push({ rule, explanation: "Membership is $5/year. This is a Structural Bylaw." });
                }
                if (lower.includes("$5") && lower.includes("member")) {
                    confirmations.push("Correct: $5/year membership.");
                }
                break;
            case "cooperative-not-corporation":
                if (lower.includes("venture capital") || lower.includes("series a") || lower.includes("fundraise")) {
                    violations.push({ rule, explanation: "Liana Banyan is self-funding through member participation. No VC, no external investment." });
                }
                if (lower.includes("crypto") || lower.includes("blockchain") || lower.includes("token sale")) {
                    if (!lower.includes("medallion")) {
                        warnings.push({ rule, explanation: "Liana Banyan is not crypto. Medallions are digital certificates, not tokens." });
                    }
                }
                break;
            case "privacy-no-demographics":
                if (/\b(race|gender|age|religion|ethnicity)\b/.test(lower) && lower.includes("collect")) {
                    violations.push({ rule, explanation: "Structural Privacy Bylaw prohibits collecting demographic data." });
                }
                break;
            case "sixteen-initiatives":
                if (lower.includes("new initiative") || lower.includes("17th initiative")) {
                    warnings.push({ rule, explanation: "There are exactly 16 initiatives (The Sweet Sixteen). Adding new ones requires Founder approval." });
                }
                break;
            case "three-gear-currency":
                if (lower.includes("credit") && lower.includes("joule") && lower.includes("convert")) {
                    warnings.push({ rule, explanation: "Credits, Marks, and Joules have specific conversion rules. Check the Three-Gear Currency architecture." });
                }
                break;
        }
    }
    let relatedConcepts = [];
    if (concepts) {
        const conceptTerms = lower.split(/\s+/).filter(w => w.length > 3);
        const matchedSlugs = new Set();
        for (const term of conceptTerms) {
            const kwMatches = concepts.byKeyword[term];
            if (kwMatches) {
                for (const slug of kwMatches)
                    matchedSlugs.add(slug);
            }
        }
        relatedConcepts = [...matchedSlugs].slice(0, 5).map(slug => {
            const c = concepts.concepts[slug];
            return c ? `${c.title} [${slug}]` : slug;
        });
    }
    const result = {};
    if (violations.length > 0) {
        result.status = "VIOLATIONS FOUND";
        result.violations = violations.map(v => ({
            severity: v.rule.severity,
            rule: v.rule.rule,
            source: v.rule.source,
            issue: v.explanation,
        }));
    }
    else {
        result.status = "CONSISTENT";
    }
    if (warnings.length > 0) {
        result.warnings = warnings.map(w => ({
            severity: w.rule.severity,
            rule: w.rule.rule,
            issue: w.explanation,
        }));
    }
    if (confirmations.length > 0) {
        result.confirmations = confirmations;
    }
    if (relatedConcepts.length > 0) {
        result.relatedArchitecture = relatedConcepts;
        result.hint = "Call get_architecture(slug) for full details on any related concept.";
    }
    result.rulesChecked = ARCHITECTURAL_RULES.length;
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL 14b: canonical_value_matches (K406)
// ═══════════════════════════════════════════
registerTool("canonical_value_matches", "Verify a document's canonical values against the Liana Banyan source of truth (canonical_values.yaml). Finds stale numbers, wrong percentages, and unverified claims.", {
    document_path: z.string().describe("Relative path from repo root"),
    check_all: z.boolean().optional().describe("If true (default), check all canonical keys; if false, provide expected_values"),
    expected_values: z.record(z.union([z.string(), z.number()])).optional().describe("Optional specific key-value pairs to check"),
}, async ({ document_path, check_all, expected_values }) => {
    try {
        const checkValues = (check_all !== false && !expected_values) ? undefined : expected_values;
        const result = await canonicalValueMatches(document_path, checkValues);
        const lines = [];
        lines.push(`## Canonical Value Check: ${document_path}\n`);
        lines.push(`Status: **${result.passed ? "PASSED" : "STALE VALUES FOUND"}**`);
        lines.push(`Values checked: ${result.values_checked} | Confirmed: ${result.values_confirmed}\n`);
        if (result.stale_findings.length > 0) {
            lines.push(`### Stale Findings (${result.stale_findings.length})`);
            for (const f of result.stale_findings) {
                lines.push(`- **${f.key}**: expected \`${f.expected}\`, found \`${f.found}\` (line ${f.line_number})`);
                lines.push(`  > ${f.context}`);
            }
        }
        if (result.unverified_claims.length > 0) {
            lines.push(`\n### Unverified Claims (${result.unverified_claims.length})`);
            for (const c of result.unverified_claims) {
                lines.push(`- ${c.key}: ${c.context}`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
});
// ═══════════════════════════════════════════
// TOOL 15: get_dropzone_task
// ═══════════════════════════════════════════
registerTool("get_dropzone_task", "Returns task prompts from KNIGHT/BISHOP/ROOK/PAWN dropzones. Pass agent name for that agent's tasks, a filename for details, or 'list' for all.", {
    query: z.string().describe("Agent name (KNIGHT/BISHOP/ROOK/PAWN), filename, or 'list'"),
    options: z.object({
        offset: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(200).optional(),
        session: z.string().optional(),
        pattern: z.string().optional(),
        sort: z.enum(["name", "date", "size"]).optional(),
    }).optional().describe("Pagination and filtering options"),
}, async ({ query, options }) => {
    ensureFreshIndex();
    if (!dropzones) {
        return { content: [{ type: "text", text: "Dropzone index not built." }] };
    }
    const allEntries = Object.values(dropzones.entries);
    const upper = query.toUpperCase();
    const applyFilters = (entries) => {
        let filtered = entries;
        if (options?.session) {
            const sessionNeedle = options.session.toUpperCase();
            filtered = filtered.filter((entry) => entry.filename.toUpperCase().includes(sessionNeedle));
        }
        if (options?.pattern) {
            const regex = globPatternToRegex(options.pattern);
            filtered = filtered.filter((entry) => regex.test(entry.filename) || regex.test(entry.title));
        }
        const sortBy = options?.sort ?? "name";
        if (sortBy === "size") {
            filtered = [...filtered].sort((a, b) => b.wordCount - a.wordCount);
        }
        else if (sortBy === "date") {
            filtered = [...filtered].sort((a, b) => b.filename.localeCompare(a.filename));
        }
        else {
            filtered = [...filtered].sort((a, b) => a.filename.localeCompare(b.filename));
        }
        return filtered;
    };
    const summarizeDropzone = (entry) => ({
        filename: entry.filename,
        agent: entry.agent,
        sessionId: entry.sessionId,
        title: entry.title,
        tags: entry.tags.slice(0, 5),
        wordCount: entry.wordCount,
        path: entry.path,
    });
    if (query === "list") {
        const filtered = applyFilters(allEntries);
        const paginated = paginateResults(filtered, options, 50);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        results: paginated.results.map(summarizeDropzone),
                        total_count: paginated.total_count,
                        offset: paginated.offset,
                        limit: paginated.limit,
                        has_more: paginated.has_more,
                    }, null, 2),
                }],
        };
    }
    if (dropzones.byAgent[upper]) {
        const tasks = dropzones.byAgent[upper]
            .map(key => dropzones.entries[key])
            .filter(Boolean);
        const filtered = applyFilters(tasks);
        const paginated = paginateResults(filtered, options, 50);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        agent: upper,
                        results: paginated.results.map(summarizeDropzone),
                        total_count: paginated.total_count,
                        offset: paginated.offset,
                        limit: paginated.limit,
                        has_more: paginated.has_more,
                    }, null, 2),
                }],
        };
    }
    const entry = Object.values(dropzones.entries).find(e => e.filename.toLowerCase().includes(query.toLowerCase()) ||
        e.title.toLowerCase().includes(query.toLowerCase()));
    if (entry) {
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }
    return { content: [{ type: "text", text: `No dropzone task matching '${query}'. Use 'list' to see all.` }] };
});
// ═══════════════════════════════════════════
// TOOL 16: get_transcript
// ═══════════════════════════════════════════
registerTool("get_transcript", "Returns summaries of Cursor agent chat transcripts. Pass a session UUID for details, 'recent' for latest 10, or 'list' for all.", { query: z.string().describe("Session UUID, 'recent', or 'list'") }, async ({ query }) => {
    ensureFreshIndex();
    if (!transcripts) {
        return { content: [{ type: "text", text: "Transcript index not built." }] };
    }
    if (query === "list" || query === "recent") {
        const all = Object.values(transcripts.transcripts)
            .sort((a, b) => (b.estimatedDate || "").localeCompare(a.estimatedDate || ""));
        const subset = query === "recent" ? all.slice(0, 10) : all;
        const lines = subset.map(t => `${t.id.slice(0, 8)} | ${t.estimatedDate || "?"} | ${t.messageCount} msgs | ${t.summary.slice(0, 80)}...`);
        return {
            content: [{
                    type: "text",
                    text: `${transcripts.count} transcripts (${transcripts.totalMessages} total messages):\n\n${lines.join("\n")}`,
                }],
        };
    }
    const entry = transcripts.transcripts[query] ||
        Object.values(transcripts.transcripts).find(t => t.id.startsWith(query));
    if (entry) {
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }
    return { content: [{ type: "text", text: `No transcript matching '${query}'.` }] };
});
// ═══════════════════════════════════════════
// TOOL 17: get_component
// ═══════════════════════════════════════════
registerTool("get_component", "Returns exports, imports, Supabase queries, and props for React components, hooks, or libs. Pass name for details or 'list' for all.", {
    query: z.string().describe("Component/hook/lib name, or 'list'/'hooks'/'libs' to browse"),
    options: z.object({
        offset: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(200).optional(),
        type: z.enum(["component", "hook", "lib"]).optional(),
    }).optional().describe("Pagination and type filter options"),
}, async ({ query, options }) => {
    ensureFreshIndex();
    if (!components) {
        return { content: [{ type: "text", text: "Component index not built." }] };
    }
    const allComponents = [
        ...Object.values(components.components),
        ...Object.values(components.hooks),
        ...Object.values(components.libs),
    ];
    const summarizeComponent = (entry) => ({
        name: entry.name,
        type: entry.type,
        path: entry.path,
        exports: entry.exports.slice(0, 8),
        supabaseQueries: entry.supabaseQueries,
    });
    const applyTypeFilter = (entries) => {
        if (!options?.type)
            return entries;
        return entries.filter((entry) => entry.type === options.type);
    };
    if (query === "list") {
        const filtered = applyTypeFilter(allComponents)
            .sort((a, b) => a.name.localeCompare(b.name));
        const paginated = paginateResults(filtered, options, 50);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        counts: {
                            total: components.count,
                            components: Object.keys(components.components).length,
                            hooks: Object.keys(components.hooks).length,
                            libs: Object.keys(components.libs).length,
                        },
                        results: paginated.results.map(summarizeComponent),
                        total_count: paginated.total_count,
                        offset: paginated.offset,
                        limit: paginated.limit,
                        has_more: paginated.has_more,
                    }, null, 2),
                }],
        };
    }
    if (query === "hooks") {
        const filtered = applyTypeFilter(Object.values(components.hooks))
            .sort((a, b) => a.name.localeCompare(b.name));
        const paginated = paginateResults(filtered, options, 50);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        type: "hook",
                        results: paginated.results.map(summarizeComponent),
                        total_count: paginated.total_count,
                        offset: paginated.offset,
                        limit: paginated.limit,
                        has_more: paginated.has_more,
                    }, null, 2),
                }],
        };
    }
    if (query === "libs") {
        const filtered = applyTypeFilter(Object.values(components.libs))
            .sort((a, b) => a.name.localeCompare(b.name));
        const paginated = paginateResults(filtered, options, 50);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        type: "lib",
                        results: paginated.results.map(summarizeComponent),
                        total_count: paginated.total_count,
                        offset: paginated.offset,
                        limit: paginated.limit,
                        has_more: paginated.has_more,
                    }, null, 2),
                }],
        };
    }
    const lower = query.toLowerCase();
    const entry = Object.values(components.components).find(c => c.name.toLowerCase() === lower) ||
        components.hooks[query] ||
        components.libs[query] ||
        Object.values(components.components).find(c => c.name.toLowerCase().includes(lower)) ||
        Object.values(components.libs).find(c => c.name.toLowerCase().includes(lower));
    if (entry) {
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }
    return { content: [{ type: "text", text: `No component matching '${query}'.` }] };
});
// ═══════════════════════════════════════════
// K419 — TRIPLE SCRAMBLER VERIFICATION TRIGGERS
// Trigger 1: hardwired into brief_me + moneypenny_debrief
// Trigger 2: file-based watchdog (4hr staleness check)
// Trigger 3: Cursor hooks (configured in .cursor/hooks.json)
// ═══════════════════════════════════════════
const SCRAMBLER_REPORT_DIR = resolve(__dirname, "..", "data", "scrambler-reports");
const SCRAMBLER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SCRAMBLER_WATCHDOG_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours
let _scramblerCache = null;
function runTripleScrambler(sessionId, timeoutMs = 30_000) {
    // Check cache first
    if (_scramblerCache && (Date.now() - _scramblerCache.timestamp) < SCRAMBLER_CACHE_TTL_MS) {
        return { ..._scramblerCache.result, _cached: true };
    }
    try {
        const output = execSync(`python "${resolve(__dirname, "..", "scrambler", "reconcile.py")}" "${sessionId}"`, {
            cwd: resolve(__dirname, "..", "scrambler"),
            timeout: timeoutMs,
            encoding: "utf-8",
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        const result = JSON.parse(output);
        // Cache it
        _scramblerCache = { result, timestamp: Date.now() };
        // Write report to disk (Trigger 2 evidence)
        try {
            mkdirSync(SCRAMBLER_REPORT_DIR, { recursive: true });
            const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
            const reportPath = resolve(SCRAMBLER_REPORT_DIR, `${ts}.json`);
            writeFileSync(reportPath, JSON.stringify(result, null, 2) + "\n", "utf-8");
        }
        catch { /* non-fatal */ }
        return result;
    }
    catch (err) {
        const e = err;
        return {
            _error: true,
            _message: e.message?.includes("TIMEOUT") || e.message?.includes("timed out")
                ? "Triple scrambler timed out (30s limit). Verification skipped."
                : `Triple scrambler error: ${(e.message || "unknown").slice(0, 200)}`,
        };
    }
}
function formatVerificationSection(result) {
    if (result._error) {
        return `\n## ⚠️ Verification Status\n${result._message}\n`;
    }
    const a = result.scrambler_a || {};
    const b = result.scrambler_b || {};
    const c = result.scrambler_c || {};
    const st = result.staleness || {};
    const health = result.system_health || {};
    const cached = result._cached ? " (cached)" : "";
    const lines = [];
    lines.push(`\n## Verification Status${cached}`);
    lines.push(`Health: **${health.status || "UNKNOWN"}** | A conflicts: ${a.conflicts || 0} | B disagreements: ${b.disagreements || 0} | C escalations: ${c.escalations || 0}`);
    lines.push(`Stale: ${st.stale_deliverables || 0} | Auto-complete candidates: ${st.auto_complete_candidates || 0} | Session gaps: ${st.session_gaps || 0} | Orphaned: ${(result.details?.stale_flags || []).filter((f) => f.flag === "ORPHANED").length}`);
    if (health.issues?.length > 0) {
        for (const issue of health.issues) {
            lines.push(`- ${issue}`);
        }
    }
    const details = result.details || {};
    if (details.c_decisions?.length > 0) {
        lines.push(`\n### UNRESOLVED — Founder Review Required`);
        for (const d of details.c_decisions.filter((dd) => dd.escalate)) {
            lines.push(`- **${d.deliverable_id}** → ${d.decision}: ${d.reasoning}`);
        }
    }
    if (details.auto_candidates?.length > 0) {
        // K442: letter deliverables now have explicit state via Letters summary block,
        // so we exclude them from the file-existence "POSSIBLY COMPLETED" heuristic.
        const nonLetter = details.auto_candidates.filter((ac) => !isLetterDeliverableId(ac.deliverable_id || ""));
        if (nonLetter.length > 0) {
            lines.push(`\n### Auto-Complete Candidates`);
            for (const ac of nonLetter.slice(0, 5)) {
                lines.push(`- [POSSIBLY COMPLETED] ${ac.deliverable_id} (${ac.title})`);
            }
            if (nonLetter.length > 5) {
                lines.push(`  ... and ${nonLetter.length - 5} more`);
            }
        }
    }
    return lines.join("\n");
}
function getLastReportAge() {
    try {
        if (!existsSync(SCRAMBLER_REPORT_DIR))
            return Infinity;
        const files = require("fs").readdirSync(SCRAMBLER_REPORT_DIR);
        if (files.length === 0)
            return Infinity;
        const latest = files.sort().reverse()[0];
        const stat = require("fs").statSync(resolve(SCRAMBLER_REPORT_DIR, latest));
        return Date.now() - stat.mtimeMs;
    }
    catch {
        return Infinity;
    }
}
function checkHooksConfigured() {
    const hooksLocations = [
        resolve(__dirname, "..", "..", ".cursor", "hooks.json"),
        resolve(__dirname, "..", "..", ".cursor", "hooks", "hooks.json"),
    ];
    const requiredMatchers = [
        "MCP: user-librarian/moneypenny_debrief",
        "MCP: user-librarian/touchstone_complete",
    ];
    for (const loc of hooksLocations) {
        if (existsSync(loc)) {
            try {
                const config = JSON.parse(readFileSync(loc, "utf-8"));
                const hooks = config.hooks || {};
                const allMatchers = new Set();
                for (const eventHooks of Object.values(hooks)) {
                    if (Array.isArray(eventHooks)) {
                        for (const h of eventHooks) {
                            if (h.matcher)
                                allMatchers.add(h.matcher);
                        }
                    }
                }
                const missing = requiredMatchers.filter(m => !allMatchers.has(m));
                return { configured: missing.length === 0, missing };
            }
            catch {
                return { configured: false, missing: requiredMatchers };
            }
        }
    }
    return { configured: false, missing: requiredMatchers };
}
const LETTER_SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;
let _letterSummaryCache = null;
function getLetterStateSummary() {
    if (_letterSummaryCache && (Date.now() - _letterSummaryCache.timestamp) < LETTER_SUMMARY_CACHE_TTL_MS) {
        return _letterSummaryCache.result;
    }
    try {
        const verifyPath = resolve(__dirname, "..", "touchstone", "verify.py");
        if (!existsSync(verifyPath))
            return null;
        const output = execSync(`python "${verifyPath}" --letters-summary`, {
            cwd: resolve(__dirname, "..", "touchstone"),
            timeout: 15_000,
            encoding: "utf-8",
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        const parsed = JSON.parse(output);
        _letterSummaryCache = { result: parsed, timestamp: Date.now() };
        return parsed;
    }
    catch {
        _letterSummaryCache = { result: null, timestamp: Date.now() };
        return null;
    }
}
function formatLetterStateBlock(summary) {
    if (!summary)
        return "";
    const s = summary.by_state || {};
    const total = Object.values(s).reduce((a, b) => a + (b || 0), 0);
    if (total === 0)
        return "";
    const lines = [];
    lines.push(`\n### Letters state summary (${total} letter deliverables)`);
    lines.push(`- Pending (no draft on disk): ${s.pending || 0}`);
    lines.push(`- Drafted but not locked: ${s.drafted || 0}`);
    lines.push(`- Locked, awaiting dispatch: ${s.locked || 0}`);
    lines.push(`- Dispatched, awaiting response: ${s.dispatched || 0}`);
    lines.push(`- Response received: ${s.response_received || 0}`);
    if ((s.blocked || 0) > 0)
        lines.push(`- Blocked (Founder hold): ${s.blocked}`);
    return lines.join("\n");
}
// Letter deliverable ids carry the "letter_" / "crown-letter-" / "wave-N-letter-" prefix.
// Used to filter them out of the legacy auto-complete-candidates block, which is
// now superseded for letters by the state summary above.
function isLetterDeliverableId(id) {
    return /(^|-)letter-/.test(id) || /^wave-\d+-letter-/.test(id);
}
// ═══════════════════════════════════════════
// TOOL 18: brief_me (MoneyPenny)
// ═══════════════════════════════════════════
registerTool("brief_me", "MoneyPenny Smart Router: returns a compact, task-scoped context package in ~600 words. Call this FIRST at session start instead of multiple individual queries. Replaces the need for get_system_overview + query_domain + get_architecture + check_consistency.", { task: z.string().describe("Natural language description of what you're about to work on, e.g. 'build housing payment contribution form'") }, async ({ task }) => {
    ensureFreshIndex();
    const pkg = buildBriefing(task, overview, schemas, functions, pages, concepts, domains, context, dropzones, transcripts, ARCHITECTURAL_RULES);
    const sections = [];
    sections.push(`## MoneyPenny Briefing: ${task}\n`);
    sections.push(`### Canonical Numbers`);
    sections.push(Object.entries(pkg.canonicalReminders).map(([k, v]) => `${k}: ${v}`).join(" | "));
    if (pkg.matchedDomains.length > 0) {
        sections.push(`\n### Matched Domains`);
        for (const d of pkg.matchedDomains) {
            sections.push(`**${d.name}**`);
            if (d.tables.length)
                sections.push(`  Tables: ${d.tables.join(", ")}`);
            if (d.functions.length)
                sections.push(`  Functions: ${d.functions.map(f => `${f.name}: ${truncateToWords(f.purpose, 8)}`).join("; ")}`);
            if (d.pages.length)
                sections.push(`  Pages: ${d.pages.map(p => `${p.route} -> ${p.name}`).join("; ")}`);
            if (d.featureFlags.length)
                sections.push(`  Flags: ${d.featureFlags.join(", ")}`);
        }
    }
    if (pkg.relevantConcepts.length > 0) {
        sections.push(`\n### Related Concepts`);
        for (const c of pkg.relevantConcepts) {
            sections.push(`- **${c.title}** [${c.slug}]: ${c.summary}`);
        }
        sections.push(`_Use get_architecture(slug) for full details._`);
    }
    if (pkg.applicableRules.length > 0) {
        sections.push(`\n### Applicable Rules`);
        for (const r of pkg.applicableRules) {
            sections.push(`- [${r.severity}] ${r.rule}`);
        }
    }
    if (pkg.pastWork.length > 0) {
        sections.push(`\n### Past Work`);
        for (const pw of pkg.pastWork) {
            sections.push(`- [${pw.source}] ${pw.id}: ${pw.summary}`);
        }
    }
    // ── K442: Letters state summary (replaces "POSSIBLY COMPLETED" for letter deliverables) ──
    const letterSummary = getLetterStateSummary();
    const letterStateBlock = formatLetterStateBlock(letterSummary);
    if (letterStateBlock)
        sections.push(letterStateBlock);
    // ── K419 Trigger 1A: Triple Scrambler at session start ──
    const verificationSections = [];
    const reportAge = getLastReportAge();
    const isWatchdogStale = reportAge > SCRAMBLER_WATCHDOG_STALE_MS;
    const scramblerResult = runTripleScrambler(task.slice(0, 20).replace(/\s+/g, "_"));
    verificationSections.push(formatVerificationSection(scramblerResult));
    if (isWatchdogStale && !scramblerResult._error) {
        verificationSections.push(`_Watchdog: last report was ${Math.round(reportAge / 3600000)}h ago — full reconcile ran._`);
    }
    // Trigger 3 self-monitoring
    const hookStatus = checkHooksConfigured();
    if (!hookStatus.configured) {
        verificationSections.push(`\n### ⚠️ TRIGGER 3 INCOMPLETE`);
        verificationSections.push(`Missing hooks: ${hookStatus.missing.join(", ")}`);
        verificationSections.push(`Run: \`node librarian-mcp/scripts/install-hooks.js\``);
    }
    // K429 Half B: Index freshness check in brief_me
    let indexDrift = false;
    try {
        const freshness = await checkFreshness(INDEX_DIR, WORKSPACE_ROOT);
        if (freshness.status === "DRIFT") {
            indexDrift = true;
            const ageHr = Math.round((freshness.ageMs || 0) / 3600000);
            verificationSections.push(`\n### ⚠️ LIBRARIAN INDEX DRIFT`);
            verificationSections.push(`${freshness.totalDrift} files changed since last build (${ageHr}h ago). Run: \`cd librarian-mcp && npm run rebuild\``);
        }
        else if (freshness.status === "FRESH") {
            const ageMin = freshness.ageMs < 60000 ? "<1m" : `${Math.round(freshness.ageMs / 60000)}m`;
            verificationSections.push(`_Index: fresh (${ageMin} ago)_`);
        }
    }
    catch { /* non-fatal */ }
    // If issues exist, put verification BEFORE task context
    const hasIssues = !scramblerResult._error && (scramblerResult.system_health?.status === "NEEDS_ATTENTION" ||
        !hookStatus.configured ||
        indexDrift);
    let finalOutput;
    if (hasIssues) {
        finalOutput = budgetEnforce(verificationSections.join("\n") + "\n\n" + sections.join("\n"), BUDGETS.briefMe + 200);
    }
    else {
        finalOutput = budgetEnforce(sections.join("\n") + "\n" + verificationSections.join("\n"), BUDGETS.briefMe + 200);
    }
    // K520.5: Write substrate cache so PreToolUse gate can verify consult without re-querying
    writeSubstrateCache(task, finalOutput);
    return { content: [{ type: "text", text: finalOutput }] };
});
// ═══════════════════════════════════════════
// TOOL 18b: refresh_substrate_cache (K520.5)
// ═══════════════════════════════════════════
registerTool("refresh_substrate_cache", "K520.5 / A&A #2310 — Refresh the persistent substrate cache at ~/.lb-session/substrate_cache.json. Calls brief_me logic and overwrites the cache. Use after npm run rebuild or when canonical state has changed mid-session. Gate hooks read this cache to allow Bash/MCP tool calls without re-querying.", {
    task: z.string().optional().describe("Session task description. If omitted, uses the task from the existing cache. Provide a value to override."),
}, async ({ task }) => {
    ensureFreshIndex();
    // Resolve task: use provided value or read from existing cache
    let resolvedTask = task ?? "";
    if (!resolvedTask) {
        try {
            const existing = JSON.parse(readFileSync(SUBSTRATE_CACHE_FILE, "utf-8"));
            resolvedTask = existing.session_task ?? "refresh";
        }
        catch {
            resolvedTask = "refresh";
        }
    }
    const pkg = buildBriefing(resolvedTask, overview, schemas, functions, pages, concepts, domains, context, dropzones, transcripts, ARCHITECTURAL_RULES);
    const sections = [];
    sections.push(`## Substrate Cache Refresh: ${resolvedTask}\n`);
    sections.push(`### Canonical Numbers`);
    sections.push(Object.entries(pkg.canonicalReminders).map(([k, v]) => `${k}: ${v}`).join(" | "));
    if (pkg.matchedDomains.length > 0) {
        sections.push(`\n### Matched Domains`);
        for (const d of pkg.matchedDomains) {
            sections.push(`**${d.name}**`);
            if (d.tables.length)
                sections.push(`  Tables: ${d.tables.join(", ")}`);
        }
    }
    if (pkg.applicableRules.length > 0) {
        sections.push(`\n### Applicable Rules`);
        for (const r of pkg.applicableRules) {
            sections.push(`- [${r.severity}] ${r.rule}`);
        }
    }
    const briefingText = budgetEnforce(sections.join("\n"), BUDGETS.briefMe);
    writeSubstrateCache(resolvedTask, briefingText);
    const cacheInfo = `\n\n---\nSubstrate cache refreshed at: ${new Date().toISOString()}\nCache path: ${SUBSTRATE_CACHE_FILE}\nTask: ${resolvedTask}`;
    return { content: [{ type: "text", text: briefingText + cacheInfo }] };
});
// ═══════════════════════════════════════════
// TOOL 19: moneypenny_checklist
// ═══════════════════════════════════════════
registerTool("moneypenny_checklist", "MoneyPenny pre-flight check. Validates a proposed task against architectural rules, identifies missing prerequisites (tables, functions), finds related past sessions, and returns contextual reminders. Call before implementing.", { task: z.string().describe("Description of what you're about to implement") }, async ({ task }) => {
    ensureFreshIndex();
    const result = buildChecklist(task, schemas, functions, context, concepts, domains, dropzones, ARCHITECTURAL_RULES);
    const sections = [];
    sections.push(`## MoneyPenny Checklist: ${task}\n`);
    sections.push(`Status: **${result.consistencyStatus}**\n`);
    if (result.violations.length > 0) {
        sections.push(`### VIOLATIONS`);
        for (const v of result.violations) {
            sections.push(`- VIOLATION: ${v.issue} (${v.rule})`);
        }
    }
    if (result.warnings.length > 0) {
        sections.push(`\n### Warnings`);
        for (const w of result.warnings) {
            sections.push(`- WARNING: ${w.issue}`);
        }
    }
    if (result.prerequisites.length > 0) {
        sections.push(`\n### Prerequisites`);
        for (const p of result.prerequisites) {
            sections.push(`- ${p}`);
        }
    }
    if (result.relatedSessions.length > 0) {
        sections.push(`\n### Related Past Sessions`);
        for (const s of result.relatedSessions) {
            sections.push(`- Session ${s.id}: ${s.summary}`);
        }
    }
    if (result.reminders.length > 0) {
        sections.push(`\n### Reminders`);
        for (const r of result.reminders) {
            sections.push(`- ${r}`);
        }
    }
    // Auto-wire: trigger Stitchpunk Corps session_start in background
    try {
        const startOutput = runStitchpunkHook("session_start.py", ["AUTO", "MP_CHECK", task]);
        sections.push(`\n### Corps Session Start (auto-triggered)`);
        const lastLine = startOutput.trim().split("\n").pop() || "";
        sections.push(`- ${lastLine}`);
    }
    catch { /* non-fatal */ }
    const output = budgetEnforce(sections.join("\n"), BUDGETS.checklist);
    return { content: [{ type: "text", text: output }] };
});
// ═══════════════════════════════════════════
// TOOL 20: moneypenny_debrief
// ═══════════════════════════════════════════
registerTool("moneypenny_debrief", "MoneyPenny session-end debrief. Logs what was built, validates consistency, generates sync reminders and handoff notes. Call at session end instead of manually editing MILESTONE_HANDOFF.", {
    session_id: z.string().describe("Session identifier (e.g. 'K100')"),
    summary: z.string().describe("What was built/accomplished this session"),
    files_changed: z.array(z.string()).optional().describe("Files changed"),
    migrations_created: z.array(z.string()).optional().describe("New migrations"),
    functions_created: z.array(z.string()).optional().describe("New edge functions"),
    pages_created: z.array(z.string()).optional().describe("New pages"),
    pending_work: z.array(z.string()).optional().describe("Tasks for next session"),
}, async ({ session_id, summary, files_changed, migrations_created, functions_created, pages_created, pending_work }) => {
    const result = buildDebrief(session_id, summary, files_changed || [], migrations_created || [], functions_created || [], pages_created || [], pending_work || [], INDEX_DIR, overview, ARCHITECTURAL_RULES);
    const sections = [];
    sections.push(`## MoneyPenny Debrief: Session ${result.sessionId}\n`);
    sections.push(`Logged: ${result.logged ? "YES" : "NO"}`);
    sections.push(`Consistency: ${result.consistencyCheck}\n`);
    if (result.syncReminders.length > 0) {
        sections.push(`### Action Required`);
        for (const r of result.syncReminders) {
            sections.push(`- ${r}`);
        }
    }
    sections.push(`\n### Handoff`);
    for (const n of result.handoffNotes) {
        sections.push(`- ${n}`);
    }
    // Auto-wire: trigger Stitchpunk Corps session_end (SP-3 + SP-8 + SP-10 pipeline bridge)
    try {
        const endOutput = runStitchpunkHook("session_end.py", [
            session_id.startsWith("K") ? "KNIGHT" : session_id.startsWith("B") ? "BISHOP" : "AUTO",
            session_id,
            summary,
        ]);
        sections.push(`\n### Corps Session End (auto-triggered)`);
        const lines = endOutput.trim().split("\n");
        const summaryLines = lines.filter(l => l.includes("COMPLETE") || l.includes("bridged") || l.includes("New files"));
        for (const sl of summaryLines)
            sections.push(`- ${sl.trim()}`);
    }
    catch { /* non-fatal */ }
    // ── K419 Trigger 1B: Triple Scrambler at session end ──
    _scramblerCache = null; // Force fresh run at session end
    const scramblerResult = runTripleScrambler(session_id);
    if (!scramblerResult._error) {
        sections.push(formatVerificationSection(scramblerResult));
        // K442: include Letters state summary in debrief so closeout always shows the ladder counts.
        _letterSummaryCache = null; // force fresh at session end
        const debriefLetterSummary = getLetterStateSummary();
        const debriefLetterBlock = formatLetterStateBlock(debriefLetterSummary);
        if (debriefLetterBlock)
            sections.push(debriefLetterBlock);
        const details = scramblerResult.details || {};
        // Auto-flag deliverables matching this session's work.
        // K442: skip letter deliverables — their state is reported via the Letters summary block.
        if (details.auto_candidates?.length > 0) {
            const matchingCandidates = details.auto_candidates.filter((ac) => {
                if (isLetterDeliverableId(ac.deliverable_id || ""))
                    return false;
                const titleLower = (ac.title || "").toLowerCase();
                const summaryLower = summary.toLowerCase();
                return titleLower.split(/\s+/).some((w) => w.length > 4 && summaryLower.includes(w));
            });
            if (matchingCandidates.length > 0) {
                sections.push(`\n### Session Match — Auto-Complete Candidates`);
                for (const mc of matchingCandidates) {
                    sections.push(`- [AUTO-COMPLETE CANDIDATE] **${mc.deliverable_id}**: ${mc.title}`);
                }
            }
        }
        // Escalations for Founder
        const escalations = (details.c_decisions || []).filter((d) => d.escalate);
        if (escalations.length > 0) {
            sections.push(`\n### UNRESOLVED — Founder Review Required`);
            for (const e of escalations) {
                sections.push(`- **${e.deliverable_id}** → ${e.decision}: ${e.reasoning}`);
            }
        }
    }
    else {
        sections.push(`\n### ⚠️ Verification`);
        sections.push(scramblerResult._message || "Triple scrambler did not complete.");
    }
    const output = budgetEnforce(sections.join("\n"), BUDGETS.debrief + 200);
    return { content: [{ type: "text", text: output }] };
});
// ═══════════════════════════════════════════
// TOOL 21: get_migration_status
// ═══════════════════════════════════════════
registerTool("get_migration_status", "Returns v1→v2 domain migration tracker. Shows which domains are audited, migrated, or verified. Pass 'list' for overview or a domain name for details.", { query: z.string().describe("Domain name or 'list' for overview") }, async ({ query }) => {
    ensureFreshIndex();
    if (!v2Migration) {
        return { content: [{ type: "text", text: "v2-migration index not built yet. Run: cd librarian-mcp && npm run rebuild" }] };
    }
    if (query === "list") {
        const lines = [];
        lines.push(`## v2 Migration Status\n`);
        lines.push(`Overall: ${v2Migration.overallProgress}`);
        lines.push(`v2 Total Files: ${v2Migration.v2TotalFiles} | Shared UI Components: ${v2Migration.v2SharedComponents}`);
        lines.push(`App Files: ${v2Migration.v2AppFiles.length}\n`);
        lines.push(`| Domain | v1 Tables | v1 Pages | v1 Funcs | v2 Pages | v2 Comps | Status |`);
        lines.push(`|--------|-----------|----------|----------|----------|----------|--------|`);
        for (const d of Object.values(v2Migration.domains)) {
            lines.push(`| ${d.domain} | ${d.v1Tables} | ${d.v1Pages} | ${d.v1Functions} | ${d.v2Pages} | ${d.v2Components} | ${d.auditStatus} |`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    const domain = v2Migration.domains[query];
    if (!domain) {
        const available = Object.keys(v2Migration.domains).join(", ");
        return { content: [{ type: "text", text: `Domain '${query}' not found. Available: ${available}` }] };
    }
    const detail = [
        `## ${domain.domain} — Migration Status: ${domain.auditStatus}`,
        ``,
        `### v1 Assets`,
        `- Tables: ${domain.v1Tables}`,
        `- Pages: ${domain.v1Pages}`,
        `- Edge Functions: ${domain.v1Functions}`,
        ``,
        `### v2 Assets`,
        `- Pages: ${domain.v2Pages}`,
        `- Components: ${domain.v2Components}`,
        `- Hooks: ${domain.v2Hooks}`,
        `- Libs: ${domain.v2Libs}`,
    ];
    if (domain.auditSession)
        detail.push(`\nAudit Session: ${domain.auditSession}`);
    if (domain.notes)
        detail.push(`Notes: ${domain.notes}`);
    return { content: [{ type: "text", text: detail.join("\n") }] };
});
// ═══════════════════════════════════════════
// TOOL 22: get_letter_status
// ═══════════════════════════════════════════
registerTool("get_letter_status", "Returns letter tracking status. Pass 'list' for overview, 'crown'/'media'/'political' for category, 'draft'/'locked'/'sent' for status, or a recipient name for details.", { query: z.string().describe("'list', category name, status name, or recipient name") }, async ({ query }) => {
    ensureFreshIndex();
    if (!letters) {
        return { content: [{ type: "text", text: "Letters index not built yet. Run: cd librarian-mcp && npm run rebuild" }] };
    }
    if (query === "list") {
        const lines = [];
        lines.push(`## Letter Status Dashboard\n`);
        lines.push(`Total: ${letters.count} letters\n`);
        lines.push(`### By Category`);
        for (const [cat, files] of Object.entries(letters.byCategory)) {
            lines.push(`- **${cat}**: ${files.length}`);
        }
        lines.push(`\n### By Status`);
        for (const [status, files] of Object.entries(letters.byStatus)) {
            lines.push(`- **${status}**: ${files.length}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    // Check if query matches a category
    if (letters.byCategory[query]) {
        const files = letters.byCategory[query];
        const lines = [`## ${query} Letters (${files.length})\n`];
        for (const f of files) {
            const entry = letters.letters[f];
            if (entry) {
                lines.push(`- **${entry.recipient}** — ${entry.status} (${entry.wordCount} words)`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    // Check if query matches a status
    if (letters.byStatus[query]) {
        const files = letters.byStatus[query];
        const lines = [`## ${query} Letters (${files.length})\n`];
        for (const f of files) {
            const entry = letters.letters[f];
            if (entry) {
                lines.push(`- **${entry.recipient}** [${entry.category}] (${entry.wordCount} words)`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    // Search by recipient name
    const matches = Object.values(letters.letters).filter(l => l.recipient.toLowerCase().includes(query.toLowerCase()) ||
        l.filename.toLowerCase().includes(query.toLowerCase()));
    if (matches.length === 0) {
        return { content: [{ type: "text", text: `No letters found matching '${query}'. Try 'list' to see all.` }] };
    }
    const lines = [];
    for (const m of matches) {
        lines.push(`## ${m.recipient}`);
        lines.push(`- File: ${m.filename}`);
        lines.push(`- Path: ${m.path}`);
        lines.push(`- Category: ${m.category}`);
        lines.push(`- Status: ${m.status}`);
        lines.push(`- Words: ${m.wordCount}`);
        lines.push(`- Last Modified: ${m.lastModified}`);
        lines.push(``);
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
});
// ═══════════════════════════════════════════
// TOOL 23: get_diff_since_session
// ═══════════════════════════════════════════
registerTool("get_diff_since_session", "Returns what changed since a given session. Compares current session list against a baseline session ID. Shows new sessions, files changed, migrations, and functions since then.", { session_id: z.string().describe("Baseline session ID (e.g. 'K200', 'B054'). Shows everything after this session.") }, async ({ session_id }) => {
    ensureFreshIndex();
    if (!context) {
        return { content: [{ type: "text", text: "Context index not built." }] };
    }
    const sessions = context.sessions;
    const baseIdx = sessions.findIndex(s => s.id === session_id);
    if (baseIdx === -1) {
        const recent = sessions.slice(-10).map(s => s.id).join(", ");
        return { content: [{ type: "text", text: `Session '${session_id}' not found. Recent: ${recent}` }] };
    }
    const newSessions = sessions.slice(baseIdx + 1);
    if (newSessions.length === 0) {
        return { content: [{ type: "text", text: `No sessions recorded after ${session_id}.` }] };
    }
    const allFiles = new Set();
    const allMigrations = new Set();
    const allFunctions = new Set();
    const allPages = new Set();
    for (const s of newSessions) {
        for (const f of s.filesChanged)
            allFiles.add(f);
        for (const m of s.migrationsCreated)
            allMigrations.add(m);
        for (const fn of s.functionsCreated)
            allFunctions.add(fn);
        for (const p of s.pagesCreated)
            allPages.add(p);
    }
    const lines = [];
    lines.push(`## Changes Since ${session_id}\n`);
    lines.push(`Sessions: ${newSessions.length} (${newSessions[0].id} through ${newSessions[newSessions.length - 1].id})`);
    lines.push(`Files Changed: ${allFiles.size}`);
    lines.push(`Migrations: ${allMigrations.size}`);
    lines.push(`Functions: ${allFunctions.size}`);
    lines.push(`Pages: ${allPages.size}\n`);
    lines.push(`### Sessions`);
    for (const s of newSessions) {
        lines.push(`- **${s.id}**${s.date ? ` (${s.date})` : ""}: ${s.summary}`);
    }
    if (allMigrations.size > 0) {
        lines.push(`\n### New Migrations`);
        for (const m of allMigrations)
            lines.push(`- ${m}`);
    }
    if (allFunctions.size > 0) {
        lines.push(`\n### New Functions`);
        for (const fn of allFunctions)
            lines.push(`- ${fn}`);
    }
    if (allPages.size > 0) {
        lines.push(`\n### New Pages`);
        for (const p of allPages)
            lines.push(`- ${p}`);
    }
    return { content: [{ type: "text", text: budgetEnforce(lines.join("\n"), 600) }] };
});
// ═══════════════════════════════════════════
// STITCHPUNK CORPS — Auto-Wire Tools
// ═══════════════════════════════════════════
const STITCHPUNK_DIR = resolve(__dirname, "..", "stitchpunks");
function runStitchpunkHook(script, args) {
    const cmd = `python "${resolve(STITCHPUNK_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
    try {
        const output = execSync(cmd, {
            cwd: STITCHPUNK_DIR,
            timeout: 120_000,
            encoding: "utf-8",
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        return output;
    }
    catch (err) {
        const e = err;
        return `ERROR running ${script}:\n${e.stdout || ""}\n${e.stderr || e.message || "Unknown error"}`;
    }
}
registerTool("run_session_start", "Runs the Stitchpunk Corps session start hook (SP-6 Scribe, SP-1 Cartographer, SP-5 Sentinel, SP-7 Courier). Call at the beginning of any agent session.", {
    agent: z.string().describe("Agent type: BISHOP, KNIGHT, ROOK, or PAWN"),
    session_id: z.string().describe("Session identifier (e.g. 'B064', 'K231')"),
    task: z.string().optional().describe("Task description for this session"),
}, async ({ agent, session_id, task }) => {
    const sections = [];
    // Canonical values health check at session start
    try {
        const flat = loadCanonicalFlat();
        const overviewPath = resolve(INDEX_DIR, "overview.json");
        if (existsSync(overviewPath)) {
            const ov = JSON.parse(readFileSync(overviewPath, "utf-8"));
            const drifts = [];
            if (ov.innovationCount !== undefined && ov.innovationCount !== flat["stats.innovation_count"]) {
                drifts.push(`innovationCount: overview=${ov.innovationCount}, canonical=${flat["stats.innovation_count"]}`);
            }
            if (ov.crownJewelCount !== undefined && ov.crownJewelCount !== flat["stats.crown_jewels"]) {
                drifts.push(`crownJewelCount: overview=${ov.crownJewelCount}, canonical=${flat["stats.crown_jewels"]}`);
            }
            if (ov.formalClaimsCount !== undefined && ov.formalClaimsCount !== flat["stats.formal_claims_approximate"]) {
                drifts.push(`formalClaimsCount: overview=${ov.formalClaimsCount}, canonical=${flat["stats.formal_claims_approximate"]}`);
            }
            if (ov.provisionalApps !== undefined && ov.provisionalApps !== flat["stats.patent_provisionals_filed"]) {
                drifts.push(`provisionalApps: overview=${ov.provisionalApps}, canonical=${flat["stats.patent_provisionals_filed"]}`);
            }
            if (drifts.length > 0) {
                sections.push("⚠️  CANONICAL DRIFT DETECTED — overview.json disagrees with canonical_values.yaml:");
                for (const d of drifts)
                    sections.push(`  - ${d}`);
                sections.push("  Action: run 'cd librarian-mcp && npm run rebuild' to resync, or update canonical_values.yaml if values changed.");
            }
            else {
                sections.push("✅ Canonical values: overview.json matches canonical_values.yaml");
            }
        }
    }
    catch (err) {
        sections.push(`⚠️  Canonical check skipped: ${err.message}`);
    }
    // K429 Half B: Index freshness check
    try {
        const freshness = await checkFreshness(INDEX_DIR, WORKSPACE_ROOT);
        if (freshness.status === "FRESH") {
            const ageMin = freshness.ageMs < 60000 ? "<1m" : `${Math.round(freshness.ageMs / 60000)}m`;
            sections.push(`✅ Librarian index: FRESH (built ${freshness.lastBuild}, ${ageMin} ago)`);
        }
        else if (freshness.status === "DRIFT") {
            const ageHr = Math.round((freshness.ageMs || 0) / 3600000);
            sections.push(`⚠️  LIBRARIAN INDEX DRIFT — ${freshness.totalDrift} files changed since last build (${ageHr}h ago)`);
            if (freshness.newFiles.length)
                sections.push(`  New: ${freshness.newFiles.slice(0, 5).join(", ")}${freshness.newFiles.length > 5 ? ` (+${freshness.newFiles.length - 5} more)` : ""}`);
            if (freshness.changedFiles.length)
                sections.push(`  Modified: ${freshness.changedFiles.slice(0, 5).join(", ")}${freshness.changedFiles.length > 5 ? ` (+${freshness.changedFiles.length - 5} more)` : ""}`);
            sections.push(`  Action: run \`cd librarian-mcp && npm run rebuild\` to resync.`);
        }
        else {
            sections.push(`⚠️  Librarian index: no fingerprint found. Run \`cd librarian-mcp && npm run rebuild:full\` to initialize.`);
        }
    }
    catch (err) {
        sections.push(`⚠️  Index freshness check skipped: ${err.message}`);
    }
    const output = runStitchpunkHook("session_start.py", [agent, session_id, task || ""]);
    sections.push(output);
    // SP-22/23 Cathedral status line (K436)
    try {
        const reg = getRegistry();
        const scribeIds = reg.scribes.map((s) => s.id);
        let allTimeEntries = 0;
        for (const id of scribeIds) {
            allTimeEntries += tabletStats(id).total_entries;
        }
        sections.push(`SP-22/23 Cathedral: ${scribeIds.length} Scribes registered (${scribeIds.join(", ")}), ${allTimeEntries} total tablet entries all-time. Consult via consult_scribes tool.`);
    }
    catch (err) {
        sections.push(`SP-22/23 Cathedral: status unavailable (${err.message})`);
    }
    return { content: [{ type: "text", text: sections.join("\n") }] };
});
registerTool("run_session_end", "Runs the Stitchpunk Corps session end hook (SP-6 Scribe, SP-1 Cartographer, SP-3 Classifier, SP-8 Herald, SP-10 Pipeline Bridge). Call at the end of any agent session. This auto-wires content to the Staff of Librarians. Optionally logs substrate savings when token counts are supplied.", {
    agent: z.string().describe("Agent type: BISHOP, KNIGHT, ROOK, or PAWN"),
    session_id: z.string().describe("Session identifier (e.g. 'B064', 'K231')"),
    summary: z.string().describe("What was built/accomplished this session"),
    input_tokens: z.number().int().nonnegative().optional().describe("(K505) Total input tokens this session — supply to enable substrate savings logging"),
    output_tokens: z.number().int().nonnegative().optional().describe("(K505) Total output tokens this session"),
    substrate_overhead_tokens: z.number().int().nonnegative().optional().default(0).describe("(K505) Tokens consumed by Librarian/substrate injections"),
    substrate_injection_count: z.number().int().nonnegative().optional().default(0).describe("(K505) Number of MCP tool calls + memory reads during session"),
    vendor: z.string().optional().default("anthropic").describe("(K505) Vendor for pricing: anthropic | openai | google | perplexity"),
    model: z.string().optional().describe("(K505) Model name for the savings record"),
    friction_confirmations: z.number().int().nonnegative().optional().default(0).describe("(K505, Pawn) Number of 'yes/that/do it' confirmations before task execution"),
}, async ({ agent, session_id, summary, input_tokens, output_tokens, substrate_overhead_tokens, substrate_injection_count, vendor, model, friction_confirmations }) => {
    const output = runStitchpunkHook("session_end.py", [agent, session_id, summary]);
    // SP-22/23 Cathedral session summary (K436)
    const cathedralLines = ["", "── SP-22/23 Cathedral session summary ──"];
    try {
        const sessionTidbits = readTidbits({ session: session_id });
        const tidbitsByCategory = new Map();
        for (const t of sessionTidbits) {
            tidbitsByCategory.set(t.category, (tidbitsByCategory.get(t.category) || 0) + 1);
        }
        const tidbitSummary = sessionTidbits.length === 0
            ? "0 (none — under-verification flag if non-trivial session)"
            : `${sessionTidbits.length} (${Array.from(tidbitsByCategory.entries())
                .map(([k, v]) => `${v} ${k}`)
                .join(", ")})`;
        cathedralLines.push(`SP-21 Tidbits this session: ${tidbitSummary}`);
        // Per-Scribe entries this session
        const scribeIds = listScribeIds();
        const perScribe = [];
        for (const id of scribeIds) {
            const entries = readTablet(id).filter((e) => e.session === session_id);
            if (entries.length > 0)
                perScribe.push({ id, n: entries.length });
        }
        const scribeTotal = perScribe.reduce((s, x) => s + x.n, 0);
        const scribeSummary = scribeTotal === 0
            ? "0 entries logged"
            : `${scribeTotal} entries (${perScribe.map((p) => `${p.n} ${p.id}`).join(", ")})`;
        cathedralLines.push(`SP-23 Scribe tablet entries this session: ${scribeSummary}`);
        // Fates dispatches
        const fatesThisSession = readFatesLog({ session: session_id });
        const dispatchCount = fatesThisSession.reduce((s, r) => s + (r.atropos_dispatch?.length || 0), 0);
        cathedralLines.push(`SP-22 Fates routings this session: ${fatesThisSession.length} pipeline runs → ${dispatchCount} dispatches`);
        // Coverage gaps
        const gapSet = new Set();
        for (const r of fatesThisSession) {
            for (const g of r.coverage_gaps || [])
                gapSet.add(g);
        }
        cathedralLines.push(`Coverage gaps detected: ${gapSet.size === 0 ? "none" : Array.from(gapSet).slice(0, 8).join(", ") + (gapSet.size > 8 ? `, +${gapSet.size - 8} more` : "")}`);
        // Hottest Scribe
        if (perScribe.length > 0) {
            const hottest = [...perScribe].sort((a, b) => b.n - a.n)[0];
            cathedralLines.push(`Hottest Scribe this session: ${hottest.id} (${hottest.n} entries)`);
        }
        else {
            cathedralLines.push(`Hottest Scribe this session: (none — Cathedral idle)`);
        }
    }
    catch (err) {
        cathedralLines.push(`(Cathedral summary failed: ${err.message})`);
    }
    // K505/K506 — Substrate savings
    // K506 Phase A: auto-populate injection_count + overhead_tokens from session tracker
    // when the caller didn't supply them (or supplied 0).
    const autoInjections = (substrate_injection_count == null || substrate_injection_count === 0)
        ? _sessionTracker.injection_count
        : substrate_injection_count;
    const autoOverhead = (substrate_overhead_tokens == null || substrate_overhead_tokens === 0)
        ? _sessionTracker.overhead_tokens_estimate
        : substrate_overhead_tokens;
    const autoMode = (substrate_injection_count == null || substrate_injection_count === 0) &&
        _sessionTracker.injection_count > 0;
    // Reset tracker so next session starts fresh
    _resetSessionTracker();
    const savingsLines = [];
    if (input_tokens != null && input_tokens > 0 && output_tokens != null && output_tokens > 0) {
        try {
            const agentUpper = agent.toUpperCase();
            const overheadTokens = autoOverhead;
            const injections = autoInjections;
            const { actual_cost_usd, counterfactual_cost_usd, session_savings_usd } = computeSavings({
                agent: agentUpper,
                input_tokens,
                output_tokens,
                substrate_overhead_tokens: overheadTokens,
                vendor: vendor ?? "anthropic",
            });
            const cold_multiplier = COLD_MULTIPLIERS[agentUpper] ?? 2.5;
            const modelName = model ?? (agentUpper === "BISHOP" ? "claude-opus-4-7" : "claude-sonnet-4-6");
            const record = {
                ts: new Date().toISOString(),
                agent: agentUpper,
                session_id,
                input_tokens,
                output_tokens,
                substrate_overhead_tokens: overheadTokens,
                substrate_injection_count: injections,
                vendor: vendor ?? "anthropic",
                model: modelName,
                actual_cost_usd: Math.round(actual_cost_usd * 10000) / 10000,
                counterfactual_cost_usd: Math.round(counterfactual_cost_usd * 10000) / 10000,
                session_savings_usd: Math.round(session_savings_usd * 10000) / 10000,
                cold_multiplier,
                friction_confirmations: friction_confirmations ?? 0,
                multiplier_provisional: true,
            };
            const { line_count } = appendSavingsRecord(record);
            savingsLines.push("", "── Substrate Savings This Session (K506 auto-hook) ──");
            savingsLines.push(`  Actual cost:    $${actual_cost_usd.toFixed(4)}`);
            savingsLines.push(`  Counterfactual: $${counterfactual_cost_usd.toFixed(4)} (${cold_multiplier}× cold mult.)`);
            savingsLines.push(`  Net savings:    $${session_savings_usd.toFixed(4)} [provisional]`);
            savingsLines.push(`  Overhead:       ${overheadTokens.toLocaleString()} tokens, ${injections} injections${autoMode ? " [auto-tracked]" : ""}`);
            savingsLines.push(`  Logged → substrate_savings_log.jsonl (${line_count} total entries)`);
        }
        catch (err) {
            savingsLines.push(`(K506 savings logging failed: ${err.message})`);
        }
    }
    else {
        savingsLines.push("", `── Substrate Savings ──`);
        savingsLines.push(`  Session tracker: ${_sessionTracker.injection_count + autoInjections} MCP calls (reset). Supply input_tokens + output_tokens to log savings.`);
    }
    return {
        content: [{ type: "text", text: output + "\n" + cathedralLines.join("\n") + savingsLines.join("\n") }],
    };
});
// ═══════════════════════════════════════════
// K506 Phase A — SESSION TELEMETRY TOOLS
// ═══════════════════════════════════════════
registerTool("get_session_telemetry", "K506: Returns the auto-tracked MCP call count and estimated overhead tokens accumulated since the last run_session_end (or server start). Use this to inspect current session telemetry before calling run_session_end. The tracker resets on each run_session_end call.", {}, async () => {
    const data = {
        injection_count: _sessionTracker.injection_count,
        overhead_tokens_estimate: _sessionTracker.overhead_tokens_estimate,
        session_start_ts: _sessionTracker.session_start_ts,
        last_call_ts: _sessionTracker.last_call_ts,
        unique_tools_called: [...new Set(_sessionTracker.tool_call_names)],
        total_tool_calls: _sessionTracker.tool_call_names.length,
        note: "Injection count auto-populates substrate_injection_count in run_session_end when not supplied. Supply input_tokens + output_tokens to run_session_end to complete savings logging.",
        auto_hook_status: "K506 Phase A active — overhead auto-tracked. Token counts (input/output) still require explicit supply.",
    };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});
// ═══════════════════════════════════════════
// SP-21 + SP-22/23 — TIDBIT + CATHEDRAL TOOLS (K436)
// ═══════════════════════════════════════════
registerTool("log_tidbit", "Append a verification-behavior tidbit to the SP-21 ledger (stitchpunks/data/tidbits.jsonl). Call whenever you perform a BRIDLE-Rule-2-style pre-assertion check (verified a slot, file, commit, symbol, route, or canonical value before claiming it). Returns the new line count.", {
    agent: z.enum(["BISHOP", "KNIGHT", "ROOK", "PAWN"]).describe("Calling agent"),
    session: z.string().regex(SESSION_ID_REGEX).describe(SESSION_ID_DESCRIPTION),
    category: z.string().min(3).describe("verify_<action>, e.g. verify_slot_number, verify_file_exists"),
    observation: z.string().min(10).describe("Description of what was checked and what was found. No upper bound — substance over brevity."),
    artifact: z.string().optional().describe("File path or symbol the verification served"),
}, async ({ agent, session, category, observation, artifact }) => {
    try {
        const result = appendTidbit({
            agent: agent,
            session,
            category,
            observation,
            artifact,
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ ok: true, line_count: result.line_count, ts: result.record.ts }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("fates_route", "Run the Three Fates pipeline (Clotho extracts themes, Lachesis scores against registered Scribes, Atropos returns dispatch directives) over a chunk of session text. Always logs the routing record to stitchpunks/data/fates_log.jsonl. Caller decides whether to act on the dispatch directives by calling scribe_log.", {
    session_id: z.string().describe("Session identifier (e.g. 'B116', 'K436')"),
    text: z.string().min(20).describe("The session text to route (typically the latest Founder turn + agent response)"),
    agent: z.enum(["BISHOP", "KNIGHT", "ROOK", "PAWN"]).describe("Calling agent"),
    source_exchange: z.string().optional().describe("Short label for this exchange, used in the fates_log record"),
}, async ({ session_id, text, agent, source_exchange }) => {
    try {
        const result = runFates(text);
        const logResult = appendFatesLog({
            session: session_id,
            agent: agent,
            clotho_themes: result.clotho_themes,
            lachesis_scores: result.lachesis_scores,
            atropos_dispatch: result.atropos_dispatch.map((d) => ({
                scribe_id: d.scribe_id,
                directive: d.directive,
                suggested_observation: d.suggested_observation,
            })),
            coverage_gaps: result.coverage_gaps,
            source_exchange,
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        clotho_themes: result.clotho_themes,
                        named_entities: result.named_entities,
                        lachesis_scores: result.lachesis_scores,
                        atropos_dispatch: result.atropos_dispatch,
                        coverage_gaps: result.coverage_gaps,
                        logged_to: "stitchpunks/data/fates_log.jsonl",
                        fates_log_line_count: logResult.line_count,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("scribe_log", "Append an observation to a specific Scribe's tablet (stitchpunks/scribes/scribe_<id>.jsonl). The scribe_id MUST be registered in registry.yaml — unknown ids are rejected (registration is a deliberate registry edit, not an on-the-fly call).", {
    scribe_id: z.string().describe("Registered Scribe id, e.g. R9, BRIDLE, Landing, Prov14, Vault"),
    session_id: z.string().describe("Session identifier"),
    observation: z.string().min(10).describe("Observation text — the durable record. No upper bound — substance over brevity."),
    source: z.enum([
        "founder_dialogue", "bishop_ship", "knight_ship",
        "bishop_read", "bishop_thresh", "bishop_design",
        "scribe_thresh", "fates_auto",
    ]).describe("Provenance of this observation"),
    canonical_ref: z.string().optional().describe("Pointer to the canonical document/file this observation references"),
}, async ({ scribe_id, session_id, observation, source, canonical_ref }) => {
    if (!getScribe(scribe_id)) {
        // KN084 BP009: detect read-only pheromone artifact suffix variants
        // (corpus snapshots, pre-supersede backups) and suggest base scribe.
        const READ_ONLY_SUFFIX_PATTERNS = [
            /^(.+?)_corpus$/,
            /^(.+?)_pre_.+_backup$/,
            /^(.+?)_backup$/,
        ];
        let suggestion;
        for (const pattern of READ_ONLY_SUFFIX_PATTERNS) {
            const m = scribe_id.match(pattern);
            if (m && m[1] && getScribe(m[1])) {
                suggestion = m[1];
                break;
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ok: false,
                        error: "unknown_scribe",
                        scribe_id,
                        registered: listScribeIds(),
                        suggestion,
                        note: suggestion
                            ? `'${scribe_id}' appears to be a read-only pheromone artifact (corpus snapshot or pre-supersede backup). Did you mean '${suggestion}'?`
                            : "Add the Scribe to registry.yaml first (deliberate edit), then retry.",
                    }, null, 2),
                }],
        };
    }
    try {
        const result = appendScribeEntry({
            scribe_id,
            session: session_id,
            observation,
            source: source,
            canonical_ref,
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ok: true,
                        tablet: result.tablet,
                        line_count: result.line_count,
                        ts: result.record.ts,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("consult_scribes", "RAM-access pattern for the Cathedral: query Scribes for recent observations on a topic. Scores topic against every registered Scribe's primary + adjacent fields, returns up to max_entries from the highest-scoring Scribes (primary first, adjacents next if include_adjacents=true). Extended K455c/B121: accepts cathedral ('bishop'=default or 'knight') and scope ('public'=default, 'private', 'guild:<name>', 'tribe:<name>') for cross-Cathedral consultation and permissioned scope filtering. Extended K466/B121: Scribes declare mode='observational' (default, recency top-K) or mode='corpus' (full deterministic retrieval for static reference corpora like R11). Default max_entries for corpus-mode queries is 100; for observational is 20. Optimized for fast mid-session retrieval (target p95 < 200ms for 20-tablet cathedral).", {
    topic: z.string().min(2).describe("Topic to look up — keyword, phrase, named entity, or canonical id"),
    max_entries: z.number().int().min(1).max(500).optional().describe("Maximum entries to return (default 20 for observational Scribes, 100 for corpus Scribes). Explicit override respected for both modes."),
    since_ts: z.string().optional().describe("ISO-8601 timestamp; only entries newer than this are returned"),
    include_adjacents: z.boolean().optional().describe("If true (default), also return entries from Scribes that match only on adjacent fields"),
    cathedral: z.enum(["bishop", "knight"]).optional().describe("Which Cathedral to consult: 'bishop' (default, Bishop's stitchpunks Cathedral) or 'knight' (Knight's Cathedral — cooperative-corpus flywheel, K455c). Added K455c/B121."),
    scope: z.string().optional().describe("Scope filter: 'public' (default), 'private', 'guild:<name>', or 'tribe:<name>'. Silent filter — non-matching entries omitted, not error. Added K455c/B121."),
}, async ({ topic, max_entries, since_ts, include_adjacents, cathedral, scope }) => {
    try {
        const result = consultScribes({
            topic, max_entries, since_ts, include_adjacents,
            cathedral: cathedral,
            scope,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ═══════════════════════════════════════════
// K523 — PHEROMONE SUBSTRATE TOOLS (A&A #2317)
// ═══════════════════════════════════════════
registerTool("pheromone_query", "Detective Phase 0 fast path (A&A #2317): query the stigmergic pheromone substrate for a claim. Returns ranked hits from the constant-time inverted-topic index. Falls back to N-Scribe RPC when index is sparse (phase_0_used=false, fallback_to_rpc=true). Hits carry decay_score (recency-weighted match strength). Build cost is amortized; query is sub-millisecond once index is warm. Use before consult_scribes for routine 'where does X live?' investigations.", {
    claim: z.string().min(3).max(500).describe("Topic or claim to investigate (e.g. 'founder anecdote', 'pheromone substrate', '#2317')"),
    freshness_threshold_seconds: z.number().int().min(0).optional().describe("Max age of index in seconds before warning stale (default 86400)"),
    sufficiency_threshold: z.number().int().min(1).optional().describe("Min hits to declare Phase 0 sufficient (default 10). Queries returning fewer hits set fallback_to_rpc=true."),
    decay_active: z.boolean().optional().describe("Apply exponential recency decay to scores (default true). Set false for forensic queries where age should not matter."),
    top_k: z.number().int().min(1).max(200).optional().describe("Maximum hits to return (default 20)"),
    cathedral: z.enum(["bishop", "knight", "pawn"]).optional().describe("Filter hits by Cathedral origin (default: all Cathedrals)"),
    rebuild_first: z.boolean().optional().describe("Force a full index rebuild before querying (expensive; use only when index is known-stale)"),
    flavor_domain: z.string().optional().describe("BP015 P3 Multi-Trail: filter by domain flavor-class axis (e.g. cinnamon, vanilla, spice, fruit, nut, bread, dairy). Canonical seed: cinnamon|vanilla|strawberry|chocolate|spice|fruit|vegetable|nut|bread|dairy|soup|pudding|spoonful|popcorn"),
    flavor_cognition: z.string().optional().describe("BP015 P3 Multi-Trail: filter by cognition flavor-class axis (e.g. analytical, empirical-receipt, creative, governance, discipline-class, building-in-public, brick-wall-correction, receipt-anchor)"),
    flavor_audience: z.string().optional().describe("BP015 P3 Multi-Trail: filter by audience flavor-class axis (e.g. founder-personal, bishop-substrate, knight-build, pawn-research, member-public, cathedral-public, counsel-eyes-only)"),
    synthesis_class: z.string().optional().describe("BP015 P4: filter by synthesis_class (e.g. 'detective_team_finding', 'adversarial_fence_probe'). Use to retrieve only Detective TEAM write-back findings."),
}, async ({ claim, freshness_threshold_seconds, sufficiency_threshold, decay_active, top_k, cathedral, rebuild_first, flavor_domain, flavor_cognition, flavor_audience, synthesis_class }) => {
    try {
        if (rebuild_first) {
            buildPheromoneIndex({ verbose: false });
        }
        const flavorClass = (flavor_domain || flavor_cognition || flavor_audience)
            ? { domain: flavor_domain, cognition: flavor_cognition, audience: flavor_audience }
            : undefined;
        const result = queryPheromone(claim, {
            freshnessThresholdSeconds: freshness_threshold_seconds,
            sufficiencyThreshold: sufficiency_threshold,
            decayActive: decay_active,
            topK: top_k,
            cathedral,
            flavorClass,
            synthesisClass: synthesis_class,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("pheromone_build", "Force a full pheromone substrate rebuild from all Cathedral Scribe tablets. Expensive (but fast — typically <100ms). Use after bulk Scribe imports or when pheromone_query reports record_count=0. Normal usage: index is maintained incrementally by sync-emit hooks on every scribe_log / log_tidbit call.", {
    verbose: z.boolean().optional().describe("Emit build stats to stderr (default false)"),
    decay_constant_days: z.number().min(1).max(365).optional().describe("Decay half-life for all records (default 30 days)"),
}, async ({ verbose, decay_constant_days }) => {
    try {
        const result = buildPheromoneIndex({ verbose: verbose ?? false, decayConstantDays: decay_constant_days });
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: true, ...result }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ─── Vendor Tablet Query (K-Vendor-Layer-Tablet-Capture / B132) ─────────────
import { vendorTabletQuery } from "./vendor_tablet_capture.js";
registerTool("vendor_tablet_query", "Query the Stone Tablet vendor payload provenance archive. Returns raw vendor request/response records captured at the boundary between SDK call and internal summarization. Enables 'what was the raw payload of vendor call X?' — closes the provenance loop for Detective investigations. Tablets live at stitchpunks/data/vendor_tablets/<vendor>/<YYYY-MM-DD>.jsonl (append-only, never deleted).", {
    vendor: z.string().optional().describe("Filter by vendor name: anthropic | openai | google | perplexity | groq | together | ollama"),
    model: z.string().optional().describe("Filter by model name substring (e.g. 'claude-haiku')"),
    since_ts: z.string().optional().describe("ISO-8601 cutoff; only records at or after this timestamp"),
    call_sign: z.string().optional().describe("Exact call_sign to retrieve (e.g. 'vendor-call-abc123def456')"),
    limit: z.number().int().min(1).max(200).optional().describe("Max records to return, most recent first (default 50)"),
}, async ({ vendor, model, since_ts, call_sign, limit }) => {
    try {
        const records = vendorTabletQuery({ vendor, model, since_ts, call_sign, limit });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ok: true,
                        count: records.length,
                        records,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("detective_investigate", "Cross-Scribe investigation (A&A #2316 Detective Scribe + #2317 Phase 0). Phase 0: checks pheromone substrate (constant-time) — returns Provenance Map from index if sufficient hits. Phase 1: falls through to consult_scribes RPC when Phase 0 is sparse. Returns structured findings: phase used, hits, scribe coverage, fallback details. Trigger C: operator provenance query ('where does X live?'). Use this before manually scanning multiple Scribes.", {
    claim: z.string().min(3).max(500).describe("The claim or named entity to investigate (e.g. 'founder anecdote', 'pheromone substrate', 'BRIDLE Rule 3')"),
    sufficiency_threshold: z.number().int().min(1).optional().describe("Min pheromone hits for Phase 0 to be sufficient (default 10). Lower = prefer pheromone fast-path."),
    include_rpc_fallback: z.boolean().optional().describe("If true (default), run Phase 1 consult_scribes RPC when Phase 0 is insufficient (false = pheromone-only)"),
    max_rpc_entries: z.number().int().min(1).max(100).optional().describe("Max entries from Phase 1 RPC fallback (default 20)"),
    decay_active: z.boolean().optional().describe("Apply pheromone decay scoring (default true)"),
    max_hits: z.number().int().min(1).max(200).optional().describe("Max Phase 0 pheromone hits to return (default 50). Use 5-10 for LEAN-mode invocations to cap context burn; 50-200 for deep-provenance queries. API-parity with pheromone_query top_k. (F5 KN100/BP015)"),
}, async ({ claim, sufficiency_threshold, include_rpc_fallback, max_rpc_entries, decay_active, max_hits }) => {
    try {
        // Phase 0: pheromone index pre-check
        // max_hits controls topK — pass 5-10 for LEAN-mode, omit for default 50 (F5 KN100/BP015)
        const phase0 = queryPheromone(claim, {
            sufficiencyThreshold: sufficiency_threshold,
            decayActive: decay_active,
            topK: max_hits ?? 50,
        });
        const result = {
            claim,
            phase_0: {
                used: phase0.phase_0_used,
                hits: phase0.hits,
                build_ms: phase0.build_ms,
                query_ms: phase0.query_ms,
                record_count: phase0.record_count,
                topic_count: phase0.topic_count,
            },
            phase_1: null,
            provenance_source: phase0.phase_0_used ? "pheromone_substrate" : "pending_rpc",
        };
        // Phase 1: RPC fallback when Phase 0 insufficient
        const doRpc = (include_rpc_fallback !== false) && phase0.fallback_to_rpc;
        if (doRpc) {
            const rpcResult = consultScribes({
                topic: claim,
                max_entries: max_rpc_entries ?? 20,
                include_adjacents: true,
            });
            result.phase_1 = rpcResult;
            result.provenance_source = "rpc_consult_scribes";
        }
        // K550 — Wrasse Registry Live-Update (D.1 = α direct-write on resolution success)
        // If Detective resolved anything (phase0 hits > 0 OR phase1 entries > 0), auto-register
        // trigger patterns extracted from the claim into the Wrasse registry.
        // Brick Wall: autoRegisterFromDetective never throws; lock failure silently skips.
        const phase0Hits = result.phase_0?.hits?.length ?? 0;
        const phase1Entries = (() => {
            const p1 = result.phase_1;
            return p1?.entries?.length ?? 0;
        })();
        if (phase0Hits > 0 || phase1Entries > 0) {
            const firstHitSummary = (() => {
                const hits = result.phase_0?.hits ?? [];
                if (hits.length > 0) {
                    return `Detective resolved via Pheromone Phase 0: ${hits.slice(0, 3).map(h => h.topic ?? h.scribe_id ?? "").join(", ")}`;
                }
                const p1 = result.phase_1;
                const entries = p1?.entries ?? [];
                return entries.length > 0
                    ? `Detective resolved via RPC Phase 1: ${(entries[0]?.observation ?? "").substring(0, 120)}`
                    : `Detective resolved claim: ${claim}`;
            })();
            autoRegisterFromDetective(claim, firstHitSummary, "detective_investigate/server.ts");
        }
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ═══════════════════════════════════════════
// KN100/BP015 — DETECTIVE TEAM (P4) + ADVERSARIAL FENCE TESTING (P5)
// ═══════════════════════════════════════════
/**
 * Detective TEAM Investigate — Priority 4 KN100/BP015
 *
 * Upgrades Detective from single-agent to TEAM-of-N fanning out across
 * cathedrals. Synthesized findings are WRITTEN BACK to pheromone substrate
 * as new entries tagged synthesis_class: detective_team_finding — closing
 * the Detective Self-Pheromonating Loop ("so you don't forget again").
 *
 * Phase 0: fan-out queryPheromone per cathedral
 * Phase 1: per-cathedral Phase 0 hits synthesized into cross-cathedral finding
 * Phase 2: emitPheromone write-back with synthesis_class + provenance metadata
 */
registerTool("detective_team_investigate", "Detective TEAM cross-cathedral investigation with substrate write-back (KN100/BP015 P4 — A&A #2316/#2317 upgrade). Fans out across N cathedrals (bishop/knight/pawn), synthesizes findings, writes the synthesis BACK to pheromone substrate as a detective_team_finding entry so next query surfaces the synthesis directly. 'So you don't forget again.' — Founder direct BP015. Composes with Multi-Trail Pheromone-Flavor (BP015 P3) and Adversarial Fence Testing (BP015 P5).", {
    claim: z.string().min(3).max(500).describe("The claim to investigate across all cathedrals (e.g. 'treasure maps', 'BRIDLE Rule 3 enforcement', '#2317 pheromone substrate')"),
    cathedrals: z.array(z.enum(["bishop", "knight", "pawn"])).optional().describe("Cathedrals to fan out across (default: ['bishop','knight','pawn'] — all three)"),
    top_k_per_cathedral: z.number().int().min(1).max(50).optional().describe("Phase 0 hits per cathedral agent (default 10; LEAN: 3-5)"),
    write_back: z.boolean().optional().describe("Write synthesis back to pheromone substrate as detective_team_finding entry (default true). Set false for dry-run investigation."),
    flavor_class: z.object({
        domain: z.string().optional(),
        cognition: z.string().optional(),
        audience: z.string().optional(),
    }).optional().describe("BP015 P3 Multi-Trail: flavor-class tags to stamp on the write-back synthesis entry. Enables per-axis retrieval post-write."),
    replay_class: z.string().optional().describe("Set to 'detective_team_backfill' for replay of prior investigations (marks entry for distinction from original-fire findings)"),
}, async ({ claim, cathedrals, top_k_per_cathedral, write_back, flavor_class, replay_class }) => {
    try {
        const targetCathedrals = cathedrals ?? ["bishop", "knight", "pawn"];
        const topK = top_k_per_cathedral ?? 10;
        const shouldWriteBack = write_back !== false;
        // Phase 0: fan-out per cathedral
        const agentReports = [];
        for (const cathedral of targetCathedrals) {
            const result = queryPheromone(claim, {
                topK,
                cathedral,
                decayActive: true,
            });
            agentReports.push({
                cathedral,
                hits: result.hits.length,
                phase_0_used: result.phase_0_used,
                top_hit: result.hits[0] ? `${result.hits[0].scribe}/${result.hits[0].tablet_id}` : null,
                hits_detail: result.hits.map(h => ({
                    scribe: h.scribe,
                    tablet_id: h.tablet_id,
                    decay_score: Math.round(h.decay_score * 100) / 100,
                })),
            });
        }
        // Phase 1: synthesize
        const totalHits = agentReports.reduce((s, r) => s + r.hits, 0);
        const allScribes = new Set(agentReports.flatMap(r => r.hits_detail.map(h => h.scribe)));
        const topHitsByDecay = agentReports
            .flatMap(r => r.hits_detail.map(h => ({ ...h, cathedral: r.cathedral })))
            .sort((a, b) => b.decay_score - a.decay_score)
            .slice(0, 5);
        const crossCathedralAgreement = agentReports.filter(r => r.hits > 0).length;
        const consistencyNote = crossCathedralAgreement === targetCathedrals.length
            ? `All ${targetCathedrals.length} cathedrals have substrate coverage for this claim.`
            : crossCathedralAgreement === 0
                ? "No cathedral has substrate coverage — claim may be novel or substrate needs backfill."
                : `${crossCathedralAgreement}/${targetCathedrals.length} cathedrals have coverage; partial cathedral knowledge.`;
        const synthesisStatement = [
            `Detective TEAM finding for: "${claim}"`,
            `Cathedrals fanned out: ${targetCathedrals.join(", ")}`,
            `Total hits: ${totalHits} across ${allScribes.size} scribes`,
            consistencyNote,
            topHitsByDecay.length > 0
                ? `Top anchors: ${topHitsByDecay.map(h => `${h.scribe}/${h.tablet_id} (${h.cathedral}, decay=${h.decay_score})`).join("; ")}`
                : "No hits found in any cathedral.",
            replay_class ? `replay_class: ${replay_class}` : "",
        ].filter(Boolean).join("\n");
        // Phase 2: pheromone write-back
        let writeBackResult = { ok: false };
        if (shouldWriteBack) {
            try {
                const synth_id = `detective_team_${Date.now()}_${claim.slice(0, 20).replace(/\s+/g, "_")}`;
                emitPheromone("DetectiveTEAM", synth_id, synthesisStatement, {
                    cathedral: "bishop",
                    decayConstantDays: 90,
                    flavorClass: flavor_class,
                    synthesisClass: replay_class === "detective_team_backfill"
                        ? "detective_team_backfill"
                        : "detective_team_finding",
                });
                writeBackResult = { ok: true, record_id: synth_id };
            }
            catch (wbErr) {
                writeBackResult = { ok: false, error: wbErr.message };
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        claim,
                        cathedrals: targetCathedrals,
                        agent_reports: agentReports,
                        synthesis: synthesisStatement,
                        cross_cathedral_agreement: crossCathedralAgreement,
                        total_hits: totalHits,
                        write_back_requested: shouldWriteBack,
                        write_back_result: writeBackResult,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
/**
 * Adversarial Fence Testing — Priority 5 KN100/BP015
 *
 * Implements the Adversarial Fence Testing Protocol (Founder direct clarification
 * of "Prove all things; hold fast that which is good" — 1 Thess 5:21).
 * Three probe types:
 *   1. counter_claim — submit alternative claim; verify substrate response
 *   2. cross_canon_contradiction — find entries contradicting each other
 *   3. stale_substrate — verify staleness detection works
 *
 * Writes probe results back to pheromone with synthesis_class: adversarial_fence_probe
 * for Bushel 1 Reckoning audit trail.
 */
registerTool("adversarial_fence_probe", "Adversarial Fence Testing Protocol (KN100/BP015 P5 — 'Prove all things; hold fast that which is good' — Founder BP015 clarification). Three probe types: counter_claim (submit alternative; verify substrate handles contradiction), cross_canon_contradiction (find entries that contradict each other), stale_substrate (verify staleness markers fire). Writes probe receipts back to pheromone substrate as adversarial_fence_probe entries for Bushel 1 Reckoning audit trail. 'It will happen anyway, if WE do it, then that makes us all the stronger.' — Founder direct.", {
    probe_type: z.enum(["counter_claim", "cross_canon_contradiction", "stale_substrate"]).describe("Probe class: counter_claim | cross_canon_contradiction | stale_substrate"),
    claim: z.string().min(3).max(500).describe("Primary canonical claim to probe (the 'rung' being adversarially tested)"),
    counter_claim: z.string().min(3).max(500).optional().describe("For counter_claim probe: the alternative/contradicting claim to submit against the substrate"),
    top_k: z.number().int().min(1).max(50).optional().describe("Number of substrate hits to probe against (default 10)"),
    write_back: z.boolean().optional().describe("Write probe receipt to pheromone as adversarial_fence_probe entry (default true)"),
    hold_or_discard: z.enum(["hold", "discard", "flag_reconciliation", "pending"]).optional().describe("Per-claim adjudication for Bushel 1 Reckoning (default: pending — to be adjudicated after probe review)"),
}, async ({ probe_type, claim, counter_claim, top_k, write_back, hold_or_discard }) => {
    try {
        const topK = top_k ?? 10;
        const shouldWriteBack = write_back !== false;
        const adjudication = hold_or_discard ?? "pending";
        let probeResult = { probe_type, claim };
        if (probe_type === "counter_claim") {
            // Submit the original claim to substrate
            const claimHits = queryPheromone(claim, { topK, decayActive: true });
            // Submit the counter-claim to substrate
            const counterHits = counter_claim
                ? queryPheromone(counter_claim, { topK, decayActive: true })
                : null;
            const claimCoverage = claimHits.hits.length;
            const counterCoverage = counterHits?.hits.length ?? 0;
            probeResult = {
                ...probeResult,
                counter_claim: counter_claim ?? "(none provided)",
                claim_hits: claimCoverage,
                counter_hits: counterCoverage,
                substrate_response: claimCoverage > counterCoverage
                    ? "substrate_favors_claim"
                    : claimCoverage === counterCoverage
                        ? "substrate_tied"
                        : "substrate_favors_counter",
                finding: claimCoverage > counterCoverage
                    ? `Claim '${claim}' is substrate-dominant (${claimCoverage} hits vs counter ${counterCoverage} hits). HOLD.`
                    : counterCoverage > 0
                        ? `Counter-claim '${counter_claim}' has substrate coverage (${counterCoverage} hits). FLAG FOR RECONCILIATION.`
                        : `Claim '${claim}' has minimal coverage (${claimCoverage} hits). NEEDS BACKFILL.`,
                adjudication,
            };
        }
        else if (probe_type === "cross_canon_contradiction") {
            // Query broad substrate for the claim; look for conflicting hits in same domain
            const hits = queryPheromone(claim, { topK, decayActive: false });
            // Group by scribe; multiple scribes covering same claim = potential contradiction surface
            const scribeGroups = new Map();
            for (const h of hits.hits) {
                if (!scribeGroups.has(h.scribe))
                    scribeGroups.set(h.scribe, []);
                scribeGroups.get(h.scribe).push({ tablet_id: h.tablet_id, decay_score: h.decay_score });
            }
            const multiHitScribes = [...scribeGroups.entries()].filter(([, v]) => v.length > 1);
            probeResult = {
                ...probeResult,
                total_hits: hits.hits.length,
                scribes_covered: scribeGroups.size,
                multi_hit_scribes: multiHitScribes.map(([s, entries]) => ({ scribe: s, entries })),
                finding: multiHitScribes.length > 0
                    ? `Cross-canon probe: ${multiHitScribes.length} scribe(s) have multiple entries for '${claim}' — potential contradiction surface; manual review recommended.`
                    : `No cross-canon contradiction surface found for '${claim}' (${scribeGroups.size} scribes, each with single entry). Clean.`,
                adjudication,
            };
        }
        else if (probe_type === "stale_substrate") {
            // Query with very short freshness window to force staleness detection
            const aggressiveFreshness = queryPheromone(claim, {
                topK,
                freshnessThresholdSeconds: 0, // force stale
                decayActive: true,
            });
            const normalFreshness = queryPheromone(claim, {
                topK,
                freshnessThresholdSeconds: 86400,
                decayActive: true,
            });
            probeResult = {
                ...probeResult,
                index_age_seconds: aggressiveFreshness.index_age_seconds,
                hits_normal_freshness: normalFreshness.hits.length,
                hits_aggressive_freshness: aggressiveFreshness.hits.length,
                freshness_degradation: normalFreshness.hits.length - aggressiveFreshness.hits.length,
                finding: aggressiveFreshness.index_age_seconds > 86400
                    ? `Substrate index is STALE (age=${Math.round(aggressiveFreshness.index_age_seconds / 3600)}h). Run pheromone_build or npm run rebuild.`
                    : `Substrate freshness OK (age=${Math.round(aggressiveFreshness.index_age_seconds)}s). Decay scoring functional.`,
                adjudication,
            };
        }
        // Write-back probe receipt
        let writeBackResult = { ok: false };
        if (shouldWriteBack) {
            try {
                const probe_id = `adversarial_${probe_type}_${Date.now()}_${claim.slice(0, 20).replace(/\s+/g, "_")}`;
                emitPheromone("AdversarialFenceProbe", probe_id, JSON.stringify(probeResult), {
                    cathedral: "bishop",
                    decayConstantDays: 60,
                    synthesisClass: "adversarial_fence_probe",
                });
                writeBackResult = { ok: true, record_id: probe_id };
            }
            catch (wbErr) {
                writeBackResult = { ok: false, error: wbErr.message };
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...probeResult,
                        write_back_result: writeBackResult,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ═══════════════════════════════════════════
// K524 — PHEROMONE INBOUND STATUS (A&A #2317 Claim 7)
// ═══════════════════════════════════════════
registerTool("pheromone_inbound_status", "K524 G.8: returns counts of inbound pheromone records per Cathedral from cross-Cathedral Hound transport. " +
    "Inbound records live in `stitchpunks/<cathedral>_cathedral/inbound_pheromones.jsonl` and are produced " +
    "when a sibling Cathedral emits a pheromone. These are merged into the unified index.jsonl on the next " +
    "Bloodhound rebuild (npm run pheromone:bloodhound). Use this tool to surface fresh cross-Cathedral " +
    "signals before the next rebuild, or to verify Hound propagation is working.", {}, async () => {
    try {
        const status = getInboundStatus();
        const total = status.reduce((s, c) => s + c.record_count, 0);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ok: true,
                        total_inbound: total,
                        per_cathedral: status,
                        note: "Run 'npm run pheromone:bloodhound' to merge inbound queues into unified index.jsonl",
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ═══════════════════════════════════════════
// K438b — MEMBER-FACING CATHEDRAL TOOLS
// ═══════════════════════════════════════════
// Sibling tools to the K436 stitchpunks-backed Cathedral surface above,
// targeting the per-member cathedral.* schema (#2268). Both tools require
// a Supabase service-role client (LIBRARIAN_SUPABASE_URL +
// LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY) — they fail gracefully with an
// actionable error message when the env is missing rather than crashing
// the MCP process. See librarian-mcp/src/cathedral_supabase/client.ts for
// the access-control rationale (service role + explicit member_id filter).
registerTool("member_consult_scribes", "Cathedral retrieval (#2268) — query a member's own Scribes plus optionally any commons-shared Scribes from other members. Returns top_k entries ranked by relevance (member's own ranked above shared at equal score). Backed by cathedral.member_scribes + cathedral.scribe_entries. Sibling of consult_scribes (which reads stitchpunks tablets).", {
    member_id: z.string().uuid().describe("Member's auth.users.id (UUID)"),
    query: z.string().min(5).max(2000).describe("Topic / phrase / canonical id to look up"),
    top_k: z.number().int().min(1).max(50).optional().describe("Maximum entries to return (default 10)"),
    since_ts: z.string().optional().describe("ISO-8601; only entries newer than this are returned"),
    include_shared: z.boolean().optional().describe("If true (default), also consult commons-shared Scribes from other members"),
}, async ({ member_id, query, top_k, since_ts, include_shared }) => {
    try {
        const result = await memberConsultScribes({
            member_id,
            query,
            top_k,
            since_ts,
            include_shared,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
registerTool("member_fates_route", "Three Fates routing (#2269) for a member session: Clotho extracts themes (against the member's own Scribe keywords + canonical entity regexes), Lachesis scores each Scribe, Atropos returns dispatch directives. Persists one row to cathedral.fates_log. Does NOT auto-append to scribe_entries — the member confirms in the UI before any tablet write (manual-approval default for first ship).", {
    member_id: z.string().uuid().describe("Member's auth.users.id (UUID)"),
    session_id: z.string().optional().describe("Session identifier (optional but recommended for log threading)"),
    content: z.string().min(10).max(10000).describe("Session content to route — typically the latest exchange"),
    dispatch_cap: z.number().int().min(1).max(10).optional().describe("Maximum dispatch directives returned (default 5)"),
    persist: z.boolean().optional().describe("If true (default), write a cathedral.fates_log row"),
}, async ({ member_id, session_id, content, dispatch_cap, persist }) => {
    try {
        const result = await memberFatesRoute({
            member_id,
            session_id,
            content,
            dispatch_cap,
            persist,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }],
        };
    }
});
// ═══════════════════════════════════════════
// TOUCHSTONE — Deterministic Coordinator Tools
// ═══════════════════════════════════════════
const TOUCHSTONE_DIR = resolve(__dirname, "..", "touchstone");
function runTouchstone(script, args) {
    const cmd = `python "${resolve(TOUCHSTONE_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
    try {
        return execSync(cmd, {
            cwd: TOUCHSTONE_DIR,
            timeout: 60_000,
            encoding: "utf-8",
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
    }
    catch (err) {
        const e = err;
        return `ERROR: ${e.stdout || ""}${e.stderr || e.message || "Unknown error"}`;
    }
}
function loadTouchstoneManifest() {
    const mp = resolve(TOUCHSTONE_DIR, "manifest.json");
    if (!existsSync(mp))
        return { deliverables: [] };
    return JSON.parse(readFileSync(mp, "utf-8"));
}
function saveTouchstoneManifest(manifest) {
    manifest.updated_at = new Date().toISOString();
    const mp = resolve(TOUCHSTONE_DIR, "manifest.json");
    writeFileSync(mp, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}
registerTool("touchstone_list", "Lists all deliverables in the TouchStone manifest, optionally filtered by owner or status.", {
    owner: z.string().optional().describe("Filter by owner: bishop, knight, rook, pawn, founder"),
    status: z.string().optional().describe("Filter by status: pending, in_progress, completed, blocked, failed"),
}, async ({ owner, status }) => {
    const manifest = loadTouchstoneManifest();
    let deliverables = manifest.deliverables || [];
    if (owner)
        deliverables = deliverables.filter((d) => d.owner === owner);
    if (status)
        deliverables = deliverables.filter((d) => d.status === status);
    const summary = deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        owner: d.owner,
        status: d.status,
        depends_on: d.depends_on,
        notes: d.notes,
    }));
    const counts = {};
    for (const d of deliverables) {
        counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return {
        content: [{
                type: "text",
                text: `TouchStone Manifest: ${deliverables.length} deliverables\n` +
                    `Status: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ")}\n\n` +
                    JSON.stringify(summary, null, 2),
            }],
    };
});
registerTool("touchstone_verify", "Runs verification predicates on a specific deliverable or all deliverables. Returns pass/fail with reasons.", {
    deliverable_id: z.string().optional().describe("Specific deliverable ID to verify. Omit to verify all."),
}, async ({ deliverable_id }) => {
    const args = deliverable_id ? [deliverable_id] : [];
    const output = runTouchstone("verify.py", args);
    try {
        const result = JSON.parse(output);
        if (deliverable_id) {
            const passStr = result.passed ? "PASSED" : "FAILED";
            const details = (result.predicate_results || []).map((pr) => `  ${pr.passed ? "✅" : "❌"} ${pr.predicate}: ${pr.message}`).join("\n");
            return {
                content: [{ type: "text", text: `${passStr}: ${deliverable_id}\n${details}` }],
            };
        }
        else {
            return {
                content: [{
                        type: "text",
                        text: `TouchStone Report (${result.verified_at || "now"}):\n` +
                            `Total: ${result.total} | Passed: ${result.passed} | Failed: ${result.failed} | Pending: ${result.pending} | Blocked: ${result.blocked}\n\n` +
                            `By owner:\n${Object.entries(result.by_owner || {}).map(([o, s]) => `  ${o}: ${s.passed}/${s.total} passed`).join("\n")}\n\n` +
                            `Details:\n${(result.results || []).map((r) => `  ${r.passed ? "✅" : "⬜"} [${r.status}] ${r.title || r.deliverable_id}`).join("\n")}`,
                    }],
            };
        }
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
registerTool("touchstone_claim", "Claims a pending deliverable for the calling agent, setting it to in_progress.", {
    deliverable_id: z.string().describe("The deliverable ID to claim"),
    agent: z.string().describe("The agent claiming: bishop, knight, rook, pawn"),
}, async ({ deliverable_id, agent }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd) => dd.id === deliverable_id);
    if (!d) {
        return { content: [{ type: "text", text: `Deliverable '${deliverable_id}' not found.` }] };
    }
    if (d.status !== "pending") {
        return { content: [{ type: "text", text: `Cannot claim: status is '${d.status}', not 'pending'.` }] };
    }
    if (d.owner !== agent) {
        return { content: [{ type: "text", text: `Cannot claim: owned by '${d.owner}', not '${agent}'.` }] };
    }
    d.status = "in_progress";
    saveTouchstoneManifest(manifest);
    // Log to ledger
    runTouchstone("ledger.py", ["started", deliverable_id, JSON.stringify({ agent })]);
    return {
        content: [{ type: "text", text: `✅ Claimed: ${d.title} (${deliverable_id}) → in_progress` }],
    };
});
registerTool("touchstone_complete", "Submits completion for a deliverable. Runs all predicates. If ALL pass, marks completed. If any fail, rejects with reasons. Stale predicates (10+ sessions old) are downgraded to warnings.", {
    deliverable_id: z.string().describe("The deliverable ID to mark complete"),
    agent: z.string().describe("The agent completing: bishop, knight, rook, pawn"),
}, async ({ deliverable_id, agent }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd) => dd.id === deliverable_id);
    if (!d) {
        return { content: [{ type: "text", text: `Deliverable '${deliverable_id}' not found.` }] };
    }
    const output = runTouchstone("verify.py", [deliverable_id]);
    let result;
    try {
        result = JSON.parse(output);
    }
    catch {
        return { content: [{ type: "text", text: `Verification error: ${output}` }] };
    }
    // Stale predicate handling: if deliverable is 10+ sessions old, downgrade failures to warnings
    const sessionsPath = resolve(__dirname, "..", "index", "sessions.json");
    let sessionCount = 0;
    if (existsSync(sessionsPath)) {
        try {
            sessionCount = JSON.parse(readFileSync(sessionsPath, "utf-8")).length;
        }
        catch { /* ignore */ }
    }
    const createdAt = d.created_at || "";
    let isStale = false;
    if (createdAt && sessionCount > 0) {
        const sessionsFile = JSON.parse(readFileSync(sessionsPath, "utf-8"));
        const createdDate = createdAt.slice(0, 10);
        const sessionsAfter = sessionsFile.filter((s) => (s.date || "") >= createdDate).length;
        isStale = sessionsAfter >= 10;
    }
    if (result.passed) {
        d.status = "completed";
        d.completed_at = new Date().toISOString();
        saveTouchstoneManifest(manifest);
        runTouchstone("ledger.py", ["completed", deliverable_id, JSON.stringify({ agent, predicate_count: (result.predicate_results || []).length })]);
        return {
            content: [{ type: "text", text: `✅ COMPLETED: ${d.title}\nAll ${(result.predicate_results || []).length} predicates passed.` }],
        };
    }
    else if (isStale) {
        const failDetails = (result.blocking_failures || []).map((f) => `  ⚠️ ${f} [STALE — downgraded to warning]`).join("\n");
        return {
            content: [{ type: "text", text: `⚠️ STALE PREDICATES: ${d.title}\nDeliverable is 10+ sessions old. Failures downgraded to warnings:\n${failDetails}\n\nUse touchstone_force_complete to override.` }],
        };
    }
    else {
        runTouchstone("ledger.py", ["failed", deliverable_id, JSON.stringify({ agent, failures: result.blocking_failures })]);
        const failDetails = (result.blocking_failures || []).map((f) => `  ❌ ${f}`).join("\n");
        return {
            content: [{ type: "text", text: `REJECTED: ${d.title}\nPredicates failed:\n${failDetails}` }],
        };
    }
});
registerTool("touchstone_force_complete", "Force-completes a deliverable when predicates are stale but work clearly shipped. Logs the override with reason and agent. Use when touchstone_complete rejects due to stale predicates.", {
    deliverable_id: z.string().describe("The deliverable ID to force-complete"),
    agent: z.string().describe("The agent forcing completion: bishop, knight, rook, pawn"),
    reason: z.string().describe("Why force-completing — what evidence shows it shipped"),
}, async ({ deliverable_id, agent, reason }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd) => dd.id === deliverable_id);
    if (!d) {
        return { content: [{ type: "text", text: `Deliverable '${deliverable_id}' not found.` }] };
    }
    if (d.status === "completed") {
        return { content: [{ type: "text", text: `Already completed: ${d.title}` }] };
    }
    d.status = "completed";
    d.completed_at = new Date().toISOString();
    d.force_completed = true;
    d.force_completed_by = agent;
    d.force_completed_reason = reason;
    saveTouchstoneManifest(manifest);
    runTouchstone("ledger.py", ["completed", deliverable_id, JSON.stringify({
            agent,
            force: true,
            reason,
            predicate_count: 0,
        })]);
    return {
        content: [{ type: "text", text: `⚡ FORCE-COMPLETED: ${d.title}\nAgent: ${agent}\nReason: ${reason}\nLogged for Founder audit.` }],
    };
});
// ═══════════════════════════════════════════
// SCRAMBLER — Chessboard Phase 2 Sync Tools (K407)
// ═══════════════════════════════════════════
const SCRAMBLER_DIR = resolve(__dirname, "..", "scrambler");
function runScrambler(script, args) {
    const cmd = `python "${resolve(SCRAMBLER_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
    try {
        return execSync(cmd, {
            cwd: SCRAMBLER_DIR,
            timeout: 60_000,
            encoding: "utf-8",
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
    }
    catch (err) {
        const e = err;
        return `ERROR: ${e.stdout || ""}${e.stderr || e.message || "Unknown error"}`;
    }
}
registerTool("scrambler_session_start", "Scrambler Chessboard Phase 2 + K418 Triple-Redundant: generates a session start brief from canonical state. Runs Scramblers A (ledger), B (ground truth), C (arbiter) side-by-side. Flags drift, conflicts, staleness, and session gaps.", {
    agent: z.string().describe("Agent type: bishop, knight, rook, pawn"),
    session_id: z.string().describe("Session identifier (e.g. 'B098', 'K407')"),
}, async ({ agent, session_id }) => {
    // Scrambler A — original session brief
    const output = runScrambler("session_brief.py", [agent, session_id]);
    let brief;
    try {
        brief = JSON.parse(output);
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
    const lines = [];
    lines.push(`## Scrambler Session Brief: ${session_id}\n`);
    lines.push(`Agent: **${brief.agent}** | Started: ${brief.started_at}`);
    lines.push(`Snapshot: ${brief.canonical_state_snapshot_id}`);
    // ── Scrambler A results ──
    lines.push(`\n### Scrambler A — Ledger Verifier`);
    const driftCount = (brief.drift_warnings || []).length;
    const conflictCount = (brief.canonical_conflicts || []).length;
    lines.push(`Drifts: ${driftCount} | Conflicts: ${conflictCount}`);
    if (brief.drift_warnings?.length > 0) {
        for (const d of brief.drift_warnings) {
            lines.push(`  - [${d.severity}] ${d.message}`);
        }
    }
    if (brief.canonical_conflicts?.length > 0) {
        for (const c of brief.canonical_conflicts) {
            lines.push(`  - ${c.key}: ${c.reason || c.message}`);
        }
    }
    // ── Scrambler B — Ground Truth ──
    let bResult = null;
    try {
        const bOutput = runScrambler("ground_truth.py", []);
        bResult = JSON.parse(bOutput);
        const vs = bResult.verdicts_summary || {};
        lines.push(`\n### Scrambler B — Ground Truth Verifier`);
        lines.push(`Deliverables: ${bResult.total_deliverables} | Shipped: ${vs.shipped || 0} | Likely: ${vs.likely_shipped || 0} | Missing: ${vs.missing || 0}`);
        lines.push(`Disagreements: **${bResult.disagreement_count || 0}**`);
        if (bResult.disagreements?.length > 0) {
            for (const d of bResult.disagreements.slice(0, 5)) {
                lines.push(`  - ${d.deliverable_id}: ledger=${d.ledger_says}, truth=${d.ground_truth_says}`);
            }
        }
    }
    catch {
        lines.push(`\n### Scrambler B — Ground Truth Verifier`);
        lines.push(`(could not run)`);
    }
    // ── Scrambler C — Arbiter ──
    if (bResult && (bResult.disagreement_count || 0) > 0) {
        try {
            const cOutput = runScrambler("arbiter.py", []);
            const cResult = JSON.parse(cOutput);
            lines.push(`\n### Scrambler C — Arbiter`);
            lines.push(`Activated: **${cResult.activated ? "YES" : "NO"}** | Self-healed: ${cResult.self_healed || 0} | Escalations: ${cResult.escalations || 0}`);
            if (cResult.decisions?.length > 0) {
                for (const d of cResult.decisions.slice(0, 5)) {
                    lines.push(`  - ${d.deliverable_id} → ${d.decision} (${d.confidence})${d.self_healed ? " [SELF-HEALED]" : ""}${d.escalate ? " [ESCALATE]" : ""}`);
                }
            }
        }
        catch {
            lines.push(`\n### Scrambler C — Arbiter`);
            lines.push(`(could not run)`);
        }
    }
    // ── Staleness & Gaps ──
    try {
        const staleOutput = runScrambler("staleness.py", []);
        const staleResult = JSON.parse(staleOutput);
        if (staleResult.session_gap_count > 0 || staleResult.stale_count > 0 || staleResult.auto_complete_count > 0) {
            lines.push(`\n### Staleness & Session Gaps`);
            if (staleResult.session_gap_count > 0) {
                lines.push(`Session index gaps: **${staleResult.session_gap_count}** (${staleResult.session_gaps.slice(0, 5).map((g) => g.missing_id).join(", ")}${staleResult.session_gap_count > 5 ? "..." : ""})`);
            }
            if (staleResult.stale_deliverables?.length > 0) {
                for (const f of staleResult.stale_deliverables) {
                    lines.push(`  - [${f.flag}] ${f.deliverable_id}: ${f.message}`);
                }
            }
            if (staleResult.auto_complete_candidates?.length > 0) {
                lines.push(`  Auto-complete candidates:`);
                for (const ac of staleResult.auto_complete_candidates.slice(0, 5)) {
                    lines.push(`  - [POSSIBLY COMPLETED] ${ac.deliverable_id} (score=${ac.match_score})`);
                }
            }
        }
    }
    catch {
        /* staleness check is informational, don't block on failure */
    }
    // ── Canonical Numbers ──
    const cs = brief.canonical_state || {};
    if (cs.stats) {
        lines.push(`\n### Canonical Numbers`);
        lines.push(`Innovations: ${cs.stats.innovation_count} | CJs: ${cs.stats.crown_jewels} | Claims: ${cs.stats.formal_claims_approximate}`);
    }
    // ── Prior Session ──
    if (brief.prior_session_summary) {
        const ps = brief.prior_session_summary;
        const lastKey = Object.keys(ps).find(k => k.startsWith("last_"));
        if (lastKey) {
            lines.push(`\n### Prior Session`);
            lines.push(`${lastKey}: ${ps[lastKey]}`);
        }
    }
    // ── Active Prompts ──
    const promptsKey = Object.keys(brief).find(k => k.endsWith("_prompts") && k.startsWith("active_"));
    if (promptsKey && brief[promptsKey]?.length > 0) {
        lines.push(`\n### Active Prompts`);
        for (const p of brief[promptsKey])
            lines.push(`- ${p}`);
    }
    // ── Ready to proceed ──
    const ready = brief.ready_to_proceed;
    lines.push(`\n---\nReady to proceed: **${ready ? "YES" : "NO"}**`);
    if (brief.block_reason?.length > 0) {
        lines.push(`Block reasons:`);
        for (const r of brief.block_reason)
            lines.push(`- ${r}`);
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
});
registerTool("scrambler_session_closeout", "Scrambler Chessboard Phase 2: reconciles session work against canonical state at session end. Checks for unreconciled conflicts, applies approved changes to canonical_values.yaml, saves snapshot.", {
    agent: z.string().describe("Agent type: bishop, knight, rook, pawn"),
    session_id: z.string().describe("Session identifier (e.g. 'B098', 'K407')"),
    summary: z.string().describe("What was built/accomplished this session"),
}, async ({ agent, session_id, summary }) => {
    const output = runScrambler("session_closeout.py", [agent, session_id, summary]);
    try {
        const result = JSON.parse(output);
        const lines = [];
        lines.push(`## Scrambler Session Closeout: ${session_id}\n`);
        lines.push(`Agent: **${result.agent}** | Completed: ${result.completed_at}`);
        lines.push(`Git commits: ${result.git_commits_in_session} | Ledger entries: ${result.ledger_entries_in_session}`);
        lines.push(`Drift detected: ${result.drift_detected} | Conflicts: ${result.conflicts_total}`);
        lines.push(`YAML updated: ${result.yaml_updated ? "YES" : "NO"}`);
        lines.push(`Ready for next session: **${result.ready_for_next_session ? "YES" : "NO"}**\n`);
        if (Object.keys(result.approved_changes || {}).length > 0) {
            lines.push(`### Approved Changes`);
            for (const [key, val] of Object.entries(result.approved_changes)) {
                lines.push(`- ${key}: ${val}`);
            }
        }
        if (result.unreconciled_conflicts && result.unreconciled_conflicts.length > 0) {
            lines.push(`\n### Unreconciled Conflicts (${result.unreconciled_conflicts.length})`);
            for (const c of result.unreconciled_conflicts) {
                lines.push(`- [${c.severity}] ${c.key}: ${c.reason || c.message}`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
// ═══════════════════════════════════════════
// K418 — TRIPLE-REDUNDANT VERIFICATION (Innovation #2263)
// Scrambler B (Ground Truth), Scrambler C (Arbiter), Reconciliation
// ═══════════════════════════════════════════
registerTool("scrambler_ground_truth", "Scrambler B: Ground Truth Verifier. Checks actual deployed artifacts (files, code patterns, migrations, edge functions) against pending deliverables. Returns verdicts per deliverable.", {
    deliverable_id: z.string().optional().describe("Specific deliverable to check. Omit for all."),
}, async ({ deliverable_id }) => {
    const args = deliverable_id ? [deliverable_id] : [];
    const output = runScrambler("ground_truth.py", args);
    try {
        const result = JSON.parse(output);
        if (deliverable_id) {
            const v = result.ground_truth_verdict || "unknown";
            const checks = result.checks || {};
            const lines = [
                `## Scrambler B: ${deliverable_id}`,
                `Verdict: **${v.toUpperCase()}** | Status: ${result.current_status}`,
            ];
            for (const [name, data] of Object.entries(checks)) {
                lines.push(`- ${name}: ${data.verdict} (${data.evidence?.length || 0} evidence items)`);
            }
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }
        else {
            const vs = result.verdicts_summary || {};
            const lines = [
                `## Scrambler B: Ground Truth Report`,
                `Total: ${result.total_deliverables} | Shipped: ${vs.shipped || 0} | Likely: ${vs.likely_shipped || 0} | Missing: ${vs.missing || 0} | Partial: ${vs.partial || 0} | Inconclusive: ${vs.inconclusive || 0}`,
                `Disagreements with ledger: **${result.disagreement_count}**`,
            ];
            if (result.disagreements?.length > 0) {
                lines.push(`\n### Disagreements`);
                for (const d of result.disagreements) {
                    lines.push(`- **${d.deliverable_id}** (${d.title}): ledger=${d.ledger_says}, ground_truth=${d.ground_truth_says} [${d.type}]`);
                }
            }
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
registerTool("scrambler_arbiter", "Scrambler C: Arbiter/Tiebreaker. Runs ONLY when Scramblers A and B disagree. Votes by evidence weight, self-heals the manifest when confident.", {}, async () => {
    const output = runScrambler("arbiter.py", []);
    try {
        const result = JSON.parse(output);
        const lines = [
            `## Scrambler C: Arbiter`,
            `Activated: **${result.activated ? "YES" : "NO"}**`,
        ];
        if (!result.activated) {
            lines.push(result.reason || "No disagreements between A and B.");
        }
        else {
            lines.push(`Disagreements reviewed: ${result.disagreements_reviewed}`);
            lines.push(`Self-healed: ${result.self_healed} | Escalations: ${result.escalations}`);
            if (result.decisions?.length > 0) {
                lines.push(`\n### Decisions`);
                for (const d of result.decisions) {
                    const heal = d.self_healed ? " [SELF-HEALED]" : "";
                    const esc = d.escalate ? " [ESCALATE]" : "";
                    lines.push(`- **${d.deliverable_id}** → ${d.decision} (${d.confidence})${heal}${esc}`);
                    lines.push(`  ${d.reasoning}`);
                }
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
registerTool("scrambler_tiebreak_log", "Reads the Scrambler C tiebreak audit log. Shows all arbitration decisions for Founder review.", {
    limit: z.number().optional().describe("Max entries to return (default 20)"),
}, async ({ limit }) => {
    const output = runScrambler("arbiter.py", ["--log"]);
    try {
        const result = JSON.parse(output);
        const entries = (result.entries || []).slice(-(limit || 20));
        if (entries.length === 0) {
            return { content: [{ type: "text", text: "No tiebreak decisions logged yet." }] };
        }
        const lines = [`## Tiebreak Audit Log (${entries.length} entries)\n`];
        for (const e of entries) {
            const heal = e.self_healed ? " ✅ self-healed" : "";
            lines.push(`- [${e.timestamp?.slice(0, 19) || "?"}] **${e.deliverable_id}** → ${e.decision} (${e.confidence}, score=${e.evidence_score})${heal}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
registerTool("touchstone_reconcile", "Bulk reconciliation: runs all three Scramblers (A=Ledger, B=Ground Truth, C=Arbiter) plus staleness/gap detection against all deliverables at once. Use for manual catch-up when the system has fallen behind.", {
    session_id: z.string().optional().describe("Current session ID for logging (default: 'manual')"),
}, async ({ session_id }) => {
    const sid = session_id || "manual";
    const output = runScrambler("reconcile.py", [sid]);
    try {
        const result = JSON.parse(output);
        const a = result.scrambler_a || {};
        const b = result.scrambler_b || {};
        const c = result.scrambler_c || {};
        const st = result.staleness || {};
        const health = result.system_health || {};
        const lines = [
            `## Triple-Redundant Reconciliation Report`,
            `ID: ${result.reconciliation_id}`,
            `Session: ${result.session_id} | Health: **${health.status}**\n`,
            `### Scrambler A — Ledger Verifier`,
            `Drifts: ${a.drift_count} | Material: ${a.material_drift} | Approved: ${a.approved} | Conflicts: ${a.conflicts}\n`,
            `### Scrambler B — Ground Truth Verifier`,
            `Deliverables: ${b.total_deliverables} | Disagreements with A: **${b.disagreements}**`,
            `Verdicts: ${Object.entries(b.verdicts || {}).map(([k, v]) => `${k}=${v}`).join(", ")}\n`,
            `### Scrambler C — Arbiter`,
            `Activated: ${c.activated} | Self-healed: ${c.self_healed} | Escalations: ${c.escalations}\n`,
            `### Staleness & Gaps`,
            `Session gaps: ${st.session_gaps} | Stale deliverables: ${st.stale_deliverables} | Auto-complete candidates: ${st.auto_complete_candidates}`,
        ];
        if (health.issues?.length > 0) {
            lines.push(`\n### Issues`);
            for (const issue of health.issues) {
                lines.push(`- ${issue}`);
            }
        }
        const details = result.details || {};
        if (details.c_decisions?.length > 0) {
            lines.push(`\n### Arbiter Decisions`);
            for (const d of details.c_decisions) {
                const heal = d.self_healed ? " [SELF-HEALED]" : "";
                lines.push(`- **${d.deliverable_id}** → ${d.decision}${heal}: ${d.reasoning}`);
            }
        }
        if (details.session_gaps?.length > 0) {
            lines.push(`\n### Session Gaps`);
            for (const g of details.session_gaps.slice(0, 15)) {
                lines.push(`- Missing: **${g.missing_id}** (between ${g.between})`);
            }
            if (details.session_gaps.length > 15) {
                lines.push(`  ... and ${details.session_gaps.length - 15} more`);
            }
        }
        if (details.stale_flags?.length > 0) {
            lines.push(`\n### Stale / Orphaned Deliverables`);
            for (const f of details.stale_flags) {
                lines.push(`- [${f.flag}] **${f.deliverable_id}** (${f.title}): ${f.message}`);
            }
        }
        if (details.auto_candidates?.length > 0) {
            lines.push(`\n### Auto-Complete Candidates`);
            for (const ac of details.auto_candidates) {
                lines.push(`- **${ac.deliverable_id}** (${ac.title}): match score ${ac.match_score} — verify completion`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    catch {
        return { content: [{ type: "text", text: output }] };
    }
});
// ═══════════════════════════════════════════
// K446a: Conductor's Baton — conductor_route MCP tool
// Innovation #2277 · Phase 2.1 · Cathedral integration
//
// Classifies a query and returns the routing decision (vendor, model, rationale).
// Does NOT execute the query — that's a future conductor_execute tool.
// Every call appends a hash-only routing trace to scribe_Conductor.jsonl.
// ═══════════════════════════════════════════
import { createHash } from "crypto";
const _conductorScribePath = resolve(__dirname, "..", "stitchpunks", "scribes", "scribe_Conductor.jsonl");
function _hashQuery(query) {
    return "sha256:" + createHash("sha256").update(query, "utf-8").digest("hex");
}
function _appendConductorTrace(entry) {
    try {
        appendFileSync(_conductorScribePath, JSON.stringify(entry) + "\n", "utf-8");
    }
    catch {
        // Non-fatal: scribe write failure must not break routing
    }
}
function _classifyForMcp(query) {
    const q = query.trim();
    const wc = q.split(/\s+/).filter(Boolean).length;
    const signals = [];
    const scores = {
        retrieval_only: 0, reasoning_required: 0, creative: 0,
        code_generation: 0, multi_step_planning: 0, uncertain: 0,
    };
    if (/\b(python|typescript|javascript|java|sql|bash|go|rust|c\+\+)\b/i.test(q)) {
        scores.code_generation += 0.55;
        signals.push("named-language");
    }
    if (/\b(write|implement|build)\s+(a\s+)?(function|class|query|script|migration|hook)\b/i.test(q)) {
        scores.code_generation += 0.65;
        signals.push("code-verb+noun");
    }
    if (/\b(write\s+a|draft\s+a|compose\s+a|brainstorm|come\s+up\s+with|generate\s+ideas?)\b/i.test(q)) {
        scores.creative += 0.6;
        signals.push("creative-verb");
    }
    if (/\b(plan|strategy|step[\s-]by[\s-]step|roadmap|workflow)\b/i.test(q)) {
        scores.multi_step_planning += 0.55;
        signals.push("planning-noun");
    }
    if (/^(what\s+is|what\s+are|who\s+is|when\s+(is|was)|how\s+many|how\s+much)\b/i.test(q) || wc <= 8) {
        scores.retrieval_only += 0.5;
        signals.push("retrieval-stem");
    }
    if (/\b(why|explain|compare|evaluate|pros\s+and\s+cons|difference\s+between)\b/i.test(q)) {
        scores.reasoning_required += 0.5;
        signals.push("reasoning-verb");
    }
    if (wc >= 40) {
        scores.reasoning_required += 0.3;
        signals.push("long-query");
    }
    let winner = "uncertain";
    let best = 0;
    for (const [cls, score] of Object.entries(scores)) {
        if (score > best) {
            best = score;
            winner = cls;
        }
    }
    if (best < 0.4)
        winner = "uncertain";
    return { class: winner, confidence: Math.round(best * 1000) / 1000, signals };
}
// R13 routing table (mirror of platform/src/lib/conductor/rankings.ts)
const _R13_TOP = {
    retrieval_only: { vendor: "anthropic", model: "claude-haiku-4-5", hot: 90, ageDays: 0 }, // cheapest above 85%
    reasoning_required: { vendor: "anthropic", model: "claude-haiku-4-5", hot: 90, ageDays: 0 },
    creative: { vendor: "anthropic", model: "claude-opus-4-7", hot: 0, ageDays: 0 }, // conservative fallback
    code_generation: { vendor: "anthropic", model: "claude-opus-4-7", hot: 0, ageDays: 0 },
    multi_step_planning: { vendor: "anthropic", model: "claude-opus-4-7", hot: 0, ageDays: 0 },
    uncertain: null,
};
function _routeForMcp(classified, mode, overrideVendor, overrideModel) {
    const FALLBACK_VENDOR = "anthropic";
    const FALLBACK_MODEL = "claude-sonnet-4-6";
    if (mode === "vendor-lock") {
        const v = (overrideVendor ?? FALLBACK_VENDOR);
        const m = overrideModel ?? { anthropic: "claude-sonnet-4-6", openai: "gpt-5-4-mini", google: "gemini-2-5-flash", perplexity: "sonar-pro" }[v] ?? FALLBACK_MODEL;
        return { vendor: v, model: m, rationale: `Vendor-locked to ${v} (fixed gear).`, fallbackUsed: false, rankingAgeDays: null };
    }
    if (mode === "manual" && (overrideVendor || overrideModel)) {
        const v = (overrideVendor ?? FALLBACK_VENDOR);
        const m = overrideModel ?? FALLBACK_MODEL;
        return { vendor: v, model: m, rationale: `Manual override: ${v}/${m}.`, fallbackUsed: false, rankingAgeDays: null };
    }
    if (classified.class === "uncertain") {
        return { vendor: FALLBACK_VENDOR, model: FALLBACK_MODEL, rationale: "Uncertain class — conservative Sonnet fallback.", fallbackUsed: true, rankingAgeDays: null };
    }
    const top = _R13_TOP[classified.class];
    if (!top) {
        return { vendor: FALLBACK_VENDOR, model: FALLBACK_MODEL, rationale: "No ranking data — conservative fallback.", fallbackUsed: true, rankingAgeDays: null };
    }
    const isConservative = top.hot === 0;
    return {
        vendor: top.vendor,
        model: top.model,
        rationale: isConservative
            ? `Class '${classified.class}' has no R13 data yet. Conservative flagship fallback (Opus) until R15 lands.`
            : `Auto-routed: ${top.vendor}/${top.model} (HOT%=${top.hot}%, cheapest above 85% threshold, R13 data).`,
        fallbackUsed: isConservative,
        rankingAgeDays: top.ageDays,
    };
}
registerTool("conductor_route", "Classify a query and return the routing decision (vendor, model, rationale). " +
    "Does not execute the query. Records a hash-only trace in scribe_Conductor.jsonl. " +
    "Innovation #2277 — The Conductor's Baton.", {
    query: z.string().describe("The member query to classify and route"),
    mode: z.enum(["auto", "manual", "vendor-lock"]).optional().default("auto")
        .describe("Conductor mode: auto (default), manual (member chooses), vendor-lock (fixed vendor)"),
    override: z.object({
        vendor: z.enum(["anthropic", "openai", "google", "perplexity"]).optional(),
        model: z.string().optional(),
    }).optional().describe("Member override for manual/vendor-lock modes"),
}, async ({ query, mode, override }) => {
    const classified = _classifyForMcp(query);
    const decision = _routeForMcp(classified, mode, override?.vendor, override?.model);
    // Append hash-only trace to scribe_Conductor.jsonl
    // Privacy-safe-by-default: never log raw member queries
    const trace = {
        ts: new Date().toISOString(),
        query_hash: _hashQuery(query),
        classified_as: classified.class,
        confidence: classified.confidence,
        mode,
        vendor: decision.vendor,
        model: decision.model,
        fallback_used: decision.fallbackUsed,
        ranking_age_days: decision.rankingAgeDays,
        rationale: decision.rationale,
    };
    _appendConductorTrace(trace);
    const result = {
        classified: {
            class: classified.class,
            confidence: classified.confidence,
            signals: classified.signals,
        },
        decision: {
            vendor: decision.vendor,
            model: decision.model,
            rationale: decision.rationale,
            fallback_used: decision.fallbackUsed,
            ranking_age_days: decision.rankingAgeDays,
        },
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K505 — SUBSTRATE SAVINGS TELEMETRY
// ═══════════════════════════════════════════
const SAVINGS_LOG_PATH = resolve(__dirname, "..", "stitchpunks", "data", "substrate_savings_log.jsonl");
/**
 * Vendor pricing table (per 1M tokens, USD).
 * Source: published API pricing as of 2026-04. Update as rates change.
 */
const VENDOR_PRICING = {
    anthropic: { input: 3.00, output: 15.00 }, // claude-opus-4-7 (per 1M)
    openai: { input: 2.50, output: 10.00 }, // gpt-4o (per 1M)
    google: { input: 1.25, output: 5.00 }, // gemini-2.5-pro (per 1M)
    perplexity: { input: 1.00, output: 1.00 }, // sonar-pro (per 1M)
};
/** Cold multipliers per agent, derived from R13 empirical baseline. */
const COLD_MULTIPLIERS = {
    BISHOP: 3.0,
    KNIGHT: 2.5,
    PAWN: 3.5, // includes baked-in friction_multiplier (3.0×)
    ROOK: 2.5, // same as KNIGHT until calibration data available
};
function appendSavingsRecord(record) {
    const line = JSON.stringify(record);
    const existing = existsSync(SAVINGS_LOG_PATH)
        ? readFileSync(SAVINGS_LOG_PATH, "utf-8")
        : "";
    const lines = existing.trim() ? existing.trim().split("\n") : [];
    lines.push(line);
    writeFileSync(SAVINGS_LOG_PATH, lines.join("\n") + "\n", "utf-8");
    return { line_count: lines.length };
}
function readSavingsLog() {
    if (!existsSync(SAVINGS_LOG_PATH))
        return [];
    const raw = readFileSync(SAVINGS_LOG_PATH, "utf-8").trim();
    if (!raw)
        return [];
    return raw.split("\n").map((l) => JSON.parse(l));
}
function computeSavings(params) {
    const pricing = VENDOR_PRICING[params.vendor.toLowerCase()] ?? VENDOR_PRICING["anthropic"];
    const m = 1_000_000;
    const actual_cost_usd = (params.input_tokens / m) * pricing.input +
        (params.output_tokens / m) * pricing.output;
    const overhead_cost_usd = (params.substrate_overhead_tokens / m) * pricing.input;
    const multiplier = COLD_MULTIPLIERS[params.agent.toUpperCase()] ?? 2.5;
    const counterfactual_cost_usd = actual_cost_usd * multiplier;
    const session_savings_usd = counterfactual_cost_usd - actual_cost_usd - overhead_cost_usd;
    return { actual_cost_usd, counterfactual_cost_usd, session_savings_usd };
}
registerTool("record_substrate_savings", "Log substrate savings for a completed agent session (Bishop, Knight, Pawn, Rook). Call at session end with token counts. Computes actual cost, counterfactual cost (without substrate), and net savings using agent-specific cold multipliers derived from R13. Appends to substrate_savings_log.jsonl. Returns the savings summary.", {
    agent: z.enum(["BISHOP", "KNIGHT", "PAWN", "ROOK"]).describe("Agent type"),
    session_id: z.string().describe("Session identifier, e.g. 'B124', 'K505'"),
    input_tokens: z.number().int().positive().describe("Total input tokens consumed this session"),
    output_tokens: z.number().int().positive().describe("Total output tokens generated this session"),
    substrate_overhead_tokens: z.number().int().nonnegative().default(0).describe("Tokens consumed by Librarian/substrate context injections (subtracted from net savings for honest math)"),
    substrate_injection_count: z.number().int().nonnegative().default(0).describe("Number of substrate context injections (MCP tool calls, memory file reads, Cathedral lookups)"),
    vendor: z.string().default("anthropic").describe("Vendor: anthropic | openai | google | perplexity"),
    model: z.string().default("claude-opus-4-7").describe("Model name, e.g. 'claude-opus-4-7'"),
    friction_confirmations: z.number().int().nonnegative().default(0).describe("(Pawn-only) Number of 'yes/that/do it' confirmations required before task execution. Contributes to Pawn cold_multiplier calibration."),
    notes: z.string().optional().describe("Optional notes about this session's substrate usage"),
}, async ({ agent, session_id, input_tokens, output_tokens, substrate_overhead_tokens, substrate_injection_count, vendor, model, friction_confirmations, notes }) => {
    const { actual_cost_usd, counterfactual_cost_usd, session_savings_usd } = computeSavings({
        agent, input_tokens, output_tokens, substrate_overhead_tokens, vendor
    });
    const cold_multiplier = COLD_MULTIPLIERS[agent] ?? 2.5;
    const record = {
        ts: new Date().toISOString(),
        agent,
        session_id,
        input_tokens,
        output_tokens,
        substrate_overhead_tokens,
        substrate_injection_count,
        vendor: vendor || "anthropic",
        model: model || "claude-opus-4-7",
        actual_cost_usd: Math.round(actual_cost_usd * 10000) / 10000,
        counterfactual_cost_usd: Math.round(counterfactual_cost_usd * 10000) / 10000,
        session_savings_usd: Math.round(session_savings_usd * 10000) / 10000,
        cold_multiplier,
        friction_confirmations: friction_confirmations || 0,
        multiplier_provisional: true,
        notes,
    };
    const { line_count } = appendSavingsRecord(record);
    const lines = [
        "── Substrate Savings This Session ──",
        `  Agent:          ${agent} (${session_id})`,
        `  Model:          ${model} @ ${vendor}`,
        `  Tokens:         ${input_tokens.toLocaleString()} in / ${output_tokens.toLocaleString()} out`,
        `  Substrate OH:   ${substrate_overhead_tokens.toLocaleString()} tokens (${substrate_injection_count} injections)`,
        `  Actual cost:    $${actual_cost_usd.toFixed(4)}`,
        `  Counterfactual: $${counterfactual_cost_usd.toFixed(4)} (${cold_multiplier}× cold multiplier)`,
        `  Net savings:    $${session_savings_usd.toFixed(4)}`,
        `  [provisional multipliers — calibration K-future will refine]`,
        `  Logged to substrate_savings_log.jsonl (${line_count} total entries)`,
    ];
    if (friction_confirmations > 0) {
        lines.push(`  Pawn friction:  ${friction_confirmations} confirmations logged`);
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
});
registerTool("substrate_savings_summary", "Returns aggregate substrate savings statistics from substrate_savings_log.jsonl. Shows all-time totals, rolling 7-day and 30-day windows, and per-agent breakdowns (Bishop/Knight/Pawn/Rook). The Founder can use this to see actual economic value of running Librarian substrate across all AI sessions.", {
    window: z.enum(["all", "7d", "30d"]).default("all").describe("Time window: all | 7d (last 7 days) | 30d (last 30 days)"),
    agent: z.enum(["BISHOP", "KNIGHT", "PAWN", "ROOK", "ALL"]).default("ALL").describe("Filter by agent, or ALL"),
}, async ({ window, agent }) => {
    const all = readSavingsLog();
    if (all.length === 0) {
        return {
            content: [{ type: "text", text: JSON.stringify({
                        ok: true,
                        message: "No savings records yet. Call record_substrate_savings at session end to start tracking.",
                        entries: 0,
                    }, null, 2) }],
        };
    }
    const now = Date.now();
    const windowMs = window === "7d" ? 7 * 86400000 : window === "30d" ? 30 * 86400000 : Infinity;
    const filtered = all.filter((r) => {
        const age = now - new Date(r.ts).getTime();
        if (age > windowMs)
            return false;
        if (agent !== "ALL" && r.agent !== agent)
            return false;
        return true;
    });
    const byAgent = {};
    for (const r of filtered) {
        (byAgent[r.agent] = byAgent[r.agent] ?? []).push(r);
    }
    const agentSummaries = Object.entries(byAgent).map(([ag, recs]) => ({
        agent: ag,
        sessions: recs.length,
        total_input_tokens: recs.reduce((s, r) => s + r.input_tokens, 0),
        total_output_tokens: recs.reduce((s, r) => s + r.output_tokens, 0),
        total_actual_cost_usd: Math.round(recs.reduce((s, r) => s + r.actual_cost_usd, 0) * 100) / 100,
        total_counterfactual_usd: Math.round(recs.reduce((s, r) => s + r.counterfactual_cost_usd, 0) * 100) / 100,
        total_savings_usd: Math.round(recs.reduce((s, r) => s + r.session_savings_usd, 0) * 100) / 100,
        total_substrate_overhead_tokens: recs.reduce((s, r) => s + r.substrate_overhead_tokens, 0),
        avg_cold_multiplier: recs[0]?.cold_multiplier ?? 0,
    }));
    const totals = {
        sessions: filtered.length,
        total_actual_cost_usd: Math.round(filtered.reduce((s, r) => s + r.actual_cost_usd, 0) * 100) / 100,
        total_counterfactual_usd: Math.round(filtered.reduce((s, r) => s + r.counterfactual_cost_usd, 0) * 100) / 100,
        total_savings_usd: Math.round(filtered.reduce((s, r) => s + r.session_savings_usd, 0) * 100) / 100,
        total_substrate_overhead_tokens: filtered.reduce((s, r) => s + r.substrate_overhead_tokens, 0),
    };
    const result = {
        ok: true,
        window,
        agent_filter: agent,
        all_time_entries: all.length,
        filtered_entries: filtered.length,
        totals,
        by_agent: agentSummaries,
        multiplier_provisional: true,
        calibration_note: "Cold multipliers (Bishop 3.0×, Knight 2.5×, Pawn 3.5×) are evidence-informed estimates from R13. Calibration will run every 30 days per K505 Phase E plan.",
        earliest_record: filtered.length > 0 ? filtered[0].ts : null,
        latest_record: filtered.length > 0 ? filtered[filtered.length - 1].ts : null,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K506 Phase C — PAWN AUTO-HOOK (detect paste-backs)
// ═══════════════════════════════════════════
/**
 * Pawn model signature patterns. Detects text produced by Pawn-layer AI
 * agents (Perplexity Sonar, Gemini 3.1 Pro, etc.) from Founder paste-backs.
 */
const PAWN_SIGNATURES = [
    /Prepared using (Gemini|Sonar|GPT|Claude|Grok)/i,
    /Sonar Pro|sonar-pro/i,
    /Gemini 3\.\d|gemini-3/i,
    /pawn[\s_-]?session/i,
    /PAWN TASK|Pawn Output|Pawn Result/i,
    /\[P\d{2,4}\]/, // Pawn session tag [P123]
    /friction_confirmations|Pawn-layer/i,
    /PROMPT_PAWN_B\d+/i,
];
const PAWN_TOKEN_FOOTER = /tokens?:?\s*(\d+)\s*(?:in(?:put)?)?[,\/]\s*(\d+)\s*(?:out(?:put)?)?/i;
registerTool("detect_and_log_pawn_session", "K506 Phase C: Detects whether pasted text originates from a Pawn-layer AI agent (Perplexity/Gemini/etc.) and auto-logs substrate savings. Call whenever Founder pastes Pawn task output into the Bishop conversation. Extracts token metadata when present; falls back to text-length estimate. Returns detection result + logged record.", {
    text: z.string().min(10).describe("The pasted text to analyze for Pawn authorship"),
    session_id: z.string().describe("Current Bishop session ID, e.g. 'B124'"),
    friction_confirmations: z.number().int().nonnegative().optional().default(0).describe("Number of 'yes/do it/that' confirmations Founder needed before Pawn executed. Supply if known; defaults to 0."),
    notes: z.string().optional().describe("Optional notes about this Pawn task"),
}, async ({ text, session_id, friction_confirmations, notes }) => {
    const matched = PAWN_SIGNATURES.some((re) => re.test(text));
    if (!matched) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        detected: false,
                        message: "No Pawn-layer signatures found. Text does not appear to be Pawn output.",
                        session_id,
                    }, null, 2),
                }],
        };
    }
    // Extract token counts from footer if present
    const tokenMatch = text.match(PAWN_TOKEN_FOOTER);
    const estimated = !tokenMatch;
    const input_tokens = tokenMatch ? parseInt(tokenMatch[1], 10) : Math.ceil(text.length * 0.35);
    const output_tokens = tokenMatch ? parseInt(tokenMatch[2], 10) : Math.ceil(text.length * 0.25);
    const { actual_cost_usd, counterfactual_cost_usd, session_savings_usd } = computeSavings({
        agent: "PAWN",
        input_tokens,
        output_tokens,
        substrate_overhead_tokens: 0,
        vendor: "perplexity",
    });
    const record = {
        ts: new Date().toISOString(),
        agent: "PAWN",
        session_id,
        input_tokens,
        output_tokens,
        substrate_overhead_tokens: 0,
        substrate_injection_count: 0,
        vendor: "perplexity",
        model: "sonar-pro",
        actual_cost_usd: Math.round(actual_cost_usd * 10000) / 10000,
        counterfactual_cost_usd: Math.round(counterfactual_cost_usd * 10000) / 10000,
        session_savings_usd: Math.round(session_savings_usd * 10000) / 10000,
        cold_multiplier: COLD_MULTIPLIERS["PAWN"] ?? 3.5,
        friction_confirmations: friction_confirmations ?? 0,
        multiplier_provisional: true,
        notes: [
            notes,
            estimated ? "token_counts: estimated_from_text_length" : "token_counts: extracted_from_footer",
            "auto_detected: pawn_paste_back",
        ].filter(Boolean).join("; "),
    };
    const { line_count } = appendSavingsRecord(record);
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    detected: true,
                    pawn_signatures_matched: PAWN_SIGNATURES
                        .filter((re) => re.test(text))
                        .map((re) => re.toString())
                        .slice(0, 3),
                    estimated_tokens: estimated,
                    input_tokens,
                    output_tokens,
                    actual_cost_usd: record.actual_cost_usd,
                    counterfactual_cost_usd: record.counterfactual_cost_usd,
                    session_savings_usd: record.session_savings_usd,
                    friction_confirmations,
                    logged: true,
                    line_count,
                    note: estimated
                        ? "Token counts estimated from text length (chars × 0.35/0.25). Supply token_counts in Pawn output footer for measured accuracy."
                        : "Token counts extracted from Pawn output footer.",
                }, null, 2),
            }],
    };
});
// ═══════════════════════════════════════════
// K515 — Chronos + Bureau MCP Tools
// A&A #2299 (Chronos), #2300 (Chroniclers), #2306 (Embedded Correspondent + Bureau)
// ═══════════════════════════════════════════
// WORKSPACE_ROOT already declared above — shared reference
/**
 * Run a discipline_wing Python snippet with typed args.
 * The snippet may reference `_args` (a dict loaded from args param).
 * The snippet must set `result = ...` as its last statement.
 * Returns parsed JSON from stdout, or {error: ...} on failure (fail-safe).
 *
 * Uses two temp files to avoid shell quoting issues on Windows:
 *   - a .json args file  (cleaned up in finally)
 *   - a .py code file    (cleaned up in finally)
 */
function runWingHelper(pySnippet, args) {
    const stamp = `${Date.now()}_${process.pid}`;
    const argsTmp = resolve(tmpdir(), `liana_args_${stamp}.json`);
    const codeTmp = resolve(tmpdir(), `liana_wing_${stamp}.py`);
    const fullCode = [
        "import sys, json",
        `sys.path.insert(0, r"${WORKSPACE_ROOT}")`,
        `with open(r"${argsTmp}", encoding="utf-8") as _f:`,
        `    _args = json.load(_f)`,
        pySnippet.trim(),
        "print(json.dumps(result))",
    ].join("\n");
    try {
        writeFileSync(argsTmp, JSON.stringify(args), "utf-8");
        writeFileSync(codeTmp, fullCode, "utf-8");
        const out = execSync(`python "${codeTmp}"`, {
            encoding: "utf-8",
            timeout: 15000,
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        return JSON.parse(out.trim());
    }
    catch (err) {
        return { error: String(err) };
    }
    finally {
        try {
            unlinkSync(argsTmp);
        }
        catch { /* ignore */ }
        try {
            unlinkSync(codeTmp);
        }
        catch { /* ignore */ }
    }
}
server.tool("chronos_query", "K515 — Chronos time-state aggregation query. Reads per-Augur Chronicler tablets and returns Wing-wide or per-Augur statistics. Returns fire counts, rates, trends, and last-fire timestamps. A&A #2299/#2300.", {
    augur_ids: z.array(z.string()).optional().describe("Specific Augur IDs to query (omit for all)"),
    since_ts: z.string().optional().describe("ISO timestamp — only include entries after this time"),
}, async ({ augur_ids, since_ts }) => {
    const result = runWingHelper(`from discipline_wing.chronicler import wing_chronos_query
result = wing_chronos_query(
    augur_ids=_args.get("augur_ids"),
    since_ts=_args.get("since_ts"),
)`, { augur_ids: augur_ids ?? null, since_ts: since_ts ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("correspondent_log", "K515 — Embedded Correspondent producer. Write a reasoning chunk to the agent's tablet; evaluates against 7 risk-pattern Augurs (vendor-secret-rotation, force-push, schema-destruction, filesystem-wipe, permission-grant, api-spend-spike, toolsmith-missing). Returns pre-execution advisories. A&A #2306. Closes K512.5 vulnerability class.", {
    agent: z.string().describe("Agent name: 'knight', 'bishop', 'pawn', 'rook'"),
    session: z.string().describe("Session ID, e.g. 'K515', 'B126'"),
    chunk: z.string().describe("Reasoning chunk text to log and evaluate"),
    context: z.record(z.unknown()).optional().describe("Optional context: {phase, tool_about_to_run, file_paths_in_scope}"),
}, async ({ agent, session, chunk, context }) => {
    const result = runWingHelper(`from discipline_wing.bureau import write_chunk
result = write_chunk(
    agent=_args["agent"],
    session=_args["session"],
    chunk_text=_args["chunk"],
    context=_args.get("context", {}),
)`, { agent, session, chunk, context: context ?? {} });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("bureau_subscribe", "K515 — Bureau subscription read (pull mode). Retrieves recent reasoning chunks from Embedded Correspondent tablets, filtered by risk pattern. Bishop uses this to watch other agents' reasoning streams for pre-execution risk signals. A&A #2306.", {
    watching_agent: z.string().describe("The subscribing agent: 'bishop', 'knight', etc."),
    risk_filter: z.array(z.string()).optional().describe("Risk pattern Augur IDs to filter on (omit = all)"),
    since_ts: z.string().optional().describe("Only return chunks after this ISO timestamp"),
}, async ({ watching_agent, risk_filter, since_ts }) => {
    const result = runWingHelper(`from discipline_wing.bureau import bureau_subscribe
result = bureau_subscribe(
    watching_agent=_args["watching_agent"],
    risk_filter=_args.get("risk_filter"),
    since_ts=_args.get("since_ts"),
)`, { watching_agent, risk_filter: risk_filter ?? null, since_ts: since_ts ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("bureau_query", "K515 — Bureau aggregate query (Chronos-style, for reasoning streams). Aggregates reasoning chunks across agents and sessions; filterable by agent, session, time range, and risk-pattern Augur ID. A&A #2306.", {
    agent: z.string().optional().describe("Filter to one agent (omit = all agents)"),
    session: z.string().optional().describe("Filter to one session (omit = all sessions)"),
    since_ts: z.string().optional().describe("ISO timestamp filter"),
    risk_filter: z.string().optional().describe("Filter to chunks that triggered this Augur ID"),
    limit: z.number().int().min(1).max(200).optional().default(50).describe("Max chunks to return"),
}, async ({ agent, session, since_ts, risk_filter, limit }) => {
    const result = runWingHelper(`from discipline_wing.bureau import query_bureau
result = query_bureau(
    agent=_args.get("agent"),
    session=_args.get("session"),
    since_ts=_args.get("since_ts"),
    risk_filter=_args.get("risk_filter"),
    limit=_args.get("limit", 50),
)`, { agent: agent ?? null, session: session ?? null, since_ts: since_ts ?? null, risk_filter: risk_filter ?? null, limit: limit ?? 50 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K516 — Dragonrider Phase-Shift MCP Tool
// A&A #2301 (Dragonriders) / #2295 Tier 3 sandbox-integration
// ═══════════════════════════════════════════
server.tool("dragonrider_phase_shifts", "K516 — Query Dragonrider Phase-Shift evaluation history. Returns recent borderline-signal sandbox evaluations: when they triggered, what harm was predicted, whether they escalated warn→block. A&A #2301.", {
    since_ts: z.string().optional().describe("ISO timestamp — only include evaluations after this time"),
    limit: z.number().int().min(1).max(200).optional().default(50).describe("Max records to return"),
}, async ({ since_ts, limit }) => {
    const result = runWingHelper(`from discipline_wing.dragonrider import query_phase_shifts
result = query_phase_shifts(
    since_ts=_args.get("since_ts"),
    limit=_args.get("limit", 50),
)`, { since_ts: since_ts ?? null, limit: limit ?? 50 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K517 — TimeWave Security MCP Tool
// A&A #2302 (TimeWave Security) / #2295 Tier 3 security enhancement
// ═══════════════════════════════════════════
server.tool("timewave_security_events", "K517 — Query TimeWave Security event log. Returns rejected-action audit events with pattern-hash grouping. Use to inspect repeated-rejection patterns, Wing-block sources, and Dragonrider-escalated events. Append-only log; no mutations via this interface. A&A #2302.", {
    since_ts: z.string().optional().describe("ISO timestamp — only include events after this time"),
    source: z.enum(["wing_block", "dragonrider_reject"]).optional().describe("Filter by event source"),
    pattern_hash: z.string().optional().describe("Filter by specific pattern hash (16-char hex)"),
    limit: z.number().int().min(1).max(500).optional().default(50).describe("Max events to return"),
}, async ({ since_ts, source, pattern_hash, limit }) => {
    const result = runWingHelper(`from discipline_wing.timewave_security import query_events
result = query_events(
    since_ts=_args.get("since_ts"),
    source=_args.get("source"),
    pattern_hash=_args.get("pattern_hash"),
    limit=_args.get("limit", 50),
)`, { since_ts: since_ts ?? null, source: source ?? null, pattern_hash: pattern_hash ?? null, limit: limit ?? 50 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K517 — Angel of Death Catacombs MCP Tools
// A&A #2305 (Angel of Death) / #2258 Catacombs extension
// ═══════════════════════════════════════════
server.tool("angel_of_death_buried", "K517 — Query Angel of Death Catacombs buried entries. Shows Dragonrider-rejected snapshots that were buried for forensic preservation. Filter by session, bury reason, or date. Use rehydrate path for full snapshot retrieval. A&A #2305.", {
    session: z.string().optional().describe("Filter by session identifier"),
    bury_reason: z.string().optional().describe("Filter by bury reason substring match"),
    since_date: z.string().optional().describe("ISO date — only include entries buried after this date"),
    limit: z.number().int().min(1).max(200).optional().default(50).describe("Max entries to return"),
}, async ({ session, bury_reason, since_date, limit }) => {
    const result = runWingHelper(`from discipline_wing.angel_of_death import query_buried
result = query_buried(
    session=_args.get("session"),
    bury_reason=_args.get("bury_reason"),
    since_date=_args.get("since_date"),
    limit=_args.get("limit", 50),
)`, { session: session ?? null, bury_reason: bury_reason ?? null, since_date: since_date ?? null, limit: limit ?? 50 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("angel_of_death_rehydrate", "K517 — Rehydrate (retrieve) a buried Catacombs entry by burial_id. Governance-only operation: adds rehydrate audit record to the burial file. Returns full snapshot data with complete audit trail. Original burial entry remains in Catacombs. A&A #2305.", {
    burial_id: z.string().describe("8-character burial ID to rehydrate"),
    rehydrate_reason: z.string().describe("Reason for rehydration (required for audit trail)"),
    operator: z.string().optional().default("manual_operator").describe("Who is performing the rehydration"),
}, async ({ burial_id, rehydrate_reason, operator }) => {
    const result = runWingHelper(`from discipline_wing.angel_of_death import rehydrate
result = rehydrate(
    burial_id=_args["burial_id"],
    rehydrate_reason=_args["rehydrate_reason"],
    operator=_args.get("operator", "manual_operator"),
)`, { burial_id, rehydrate_reason, operator: operator ?? "manual_operator" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K520.6 — Operational Gotchas Scribe tools (A&A #2310 always-loaded)
// ═══════════════════════════════════════════
registerTool("consult_gotchas", "K520.6 / A&A #2310 — Returns ALL Operational Gotchas tablets (always-loaded subset). No query needed — set is small and curated. Each entry has og_id, friction, workaround, agents_affected, recurrence_count. Call at session start to pre-load known frictions before any tool invocation.", {}, async () => {
    const tablets = readTablet("OperationalGotchas");
    if (tablets.length === 0) {
        return { content: [{ type: "text", text: "No Operational Gotchas tablets found. Seed via add_gotcha or check scribe_OperationalGotchas.jsonl." }] };
    }
    const lines = tablets.map((t) => {
        const id = String(t.og_id ?? "OG-???");
        const friction = String(t.friction ?? t.observation ?? "(no friction)");
        const workaround = String(t.workaround ?? "(see observation)");
        const affects = Array.isArray(t.agents_affected) ? t.agents_affected.join(", ") : "all agents";
        const recur = t.recurrence_count != null ? ` [recurrence: ${t.recurrence_count}]` : "";
        return `**${id}**${recur}: ${friction}\n  Fix: ${workaround}\n  Affects: ${affects}`;
    });
    const text = `## Operational Gotchas (${tablets.length} entries — always loaded)\n\n${lines.join("\n\n")}`;
    return { content: [{ type: "text", text }] };
});
registerTool("add_gotcha", "K520.6 — Append a new Operational Gotcha to the always-loaded Scribe. Use when a recurring friction is discovered. Assigns next OG-NNN id automatically.", {
    friction: z.string().describe("One-sentence symptom description"),
    workaround: z.string().describe("Actionable fix or mitigation"),
    agents_affected: z.array(z.enum(["Bishop", "Knight", "Pawn", "Rook"])).default(["Bishop", "Knight"]).describe("Which agent types are affected"),
    session: z.string().optional().default("manual").describe("Session ID that discovered this friction"),
    recurrence_count: z.number().int().min(1).default(1).describe("How many sessions this friction has been observed"),
}, async ({ friction, workaround, agents_affected, session, recurrence_count }) => {
    const existing = readTablet("OperationalGotchas");
    const nextNum = existing.length + 1;
    const og_id = `OG-${String(nextNum).padStart(3, "0")}`;
    const ogPath = resolve(SCRIBES_DIR, "scribe_OperationalGotchas.jsonl");
    const entry = {
        og_id,
        ts: new Date().toISOString(),
        session,
        observation: `FRICTION: ${friction}\nWORKAROUND: ${workaround}`,
        source: "knight_ship",
        friction,
        workaround,
        agents_affected,
        promotion_class: "always_loaded",
        recurrence_count,
        scope: "public",
    };
    const line = JSON.stringify(entry) + "\n";
    const { appendFileSync: afs } = await import("fs");
    afs(ogPath, line, "utf-8");
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, og_id, friction, workaround, agents_affected }, null, 2) }] };
});
registerTool("promote_to_gotchas", "K520.6 — Promote an existing Toolsmith entry to the always-loaded OperationalGotchas class. Reads Toolsmith JSONL by toolsmith_ts_id, creates an OG entry with what_fails→friction and what_works→workaround. Returns new OG-id.", {
    toolsmith_ts_id: z.string().describe("Toolsmith ID to promote (e.g. 'TS-012')"),
    session: z.string().optional().default("manual").describe("Session performing the promotion"),
}, async ({ toolsmith_ts_id, session }) => {
    const toolsmithPath = resolve(SCRIBES_DIR, "scribe_Toolsmith.jsonl");
    if (!existsSync(toolsmithPath)) {
        return { content: [{ type: "text", text: `Toolsmith tablet not found at ${toolsmithPath}` }] };
    }
    const raw = readFileSync(toolsmithPath, "utf-8");
    const entries = raw.split("\n").filter(l => l.trim()).map(l => {
        try {
            return JSON.parse(l);
        }
        catch {
            return null;
        }
    }).filter((e) => e !== null);
    const tsEntry = entries.find(e => e.toolsmith_id === toolsmith_ts_id);
    if (!tsEntry) {
        return { content: [{ type: "text", text: `Toolsmith entry '${toolsmith_ts_id}' not found. Available: ${entries.filter(e => e.toolsmith_id).map(e => e.toolsmith_id).slice(0, 10).join(", ")}...` }] };
    }
    const friction = String(tsEntry.what_fails ?? tsEntry.command_pattern ?? "(no friction text)");
    const workaround = String(tsEntry.what_works ?? "(no workaround text)");
    const existing = readTablet("OperationalGotchas");
    const nextNum = existing.length + 1;
    const og_id = `OG-${String(nextNum).padStart(3, "0")}`;
    const ogPath = resolve(SCRIBES_DIR, "scribe_OperationalGotchas.jsonl");
    const entry = {
        og_id,
        ts: new Date().toISOString(),
        session,
        observation: `FRICTION: ${friction}\nWORKAROUND: ${workaround}`,
        source: "scribe_thresh",
        friction,
        workaround,
        agents_affected: ["Bishop", "Knight"],
        promotion_class: "always_loaded",
        recurrence_count: 1,
        promoted_from: toolsmith_ts_id,
        scope: "public",
    };
    const { appendFileSync: afs } = await import("fs");
    afs(ogPath, JSON.stringify(entry) + "\n", "utf-8");
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, og_id, promoted_from: toolsmith_ts_id, friction, workaround }, null, 2) }] };
});
// K520.7 — Test-mode audit summary tool
registerTool("test_mode_audit_summary", "K520.7 — Return recent test-mode bypass events from the append-only audit log (~/.lb-session/test_mode_audit.jsonl). Use to verify the bypass mechanism is working and to inspect the audit trail during A/B empirical testing.", {
    last_n: z.number().int().min(1).max(200).default(20).describe("Return the last N audit events (default 20)"),
}, async ({ last_n }) => {
    const auditPath = resolve(homedir(), ".lb-session", "test_mode_audit.jsonl");
    if (!existsSync(auditPath)) {
        return { content: [{ type: "text", text: "No test-mode audit log found at ~/.lb-session/test_mode_audit.jsonl — no bypass events recorded yet." }] };
    }
    const raw = readFileSync(auditPath, "utf-8");
    const lines = raw.split("\n").filter(l => l.trim());
    const total = lines.length;
    const recent = lines.slice(-last_n);
    const entries = recent.map(l => { try {
        return JSON.parse(l);
    }
    catch {
        return {};
    } });
    const summary = entries.map((e, i) => {
        return `[${total - recent.length + i + 1}] ${e.ts_iso ?? "?"} | tool=${e.tool ?? "?"} | age=${e.age_seconds ?? "?"}s | token=${e.auth_token_prefix ?? "?"} | args=${(e.tool_args_summary ?? "").slice(0, 80)}`;
    }).join("\n");
    const text = `## Test-Mode Audit Log — last ${recent.length} of ${total} events\n\n${summary}\n\nAudit file: ${auditPath}`;
    return { content: [{ type: "text", text }] };
});
// ═══════════════════════════════════════════
// KN009-BP002 — CHANDELIER EMPIRICAL-MEASUREMENT-SUBSTRATE
// A&A #2291 Bedrock Foundation — multi-level L1-L12 receipt registry
// + Chronos Chronicler signatories + prerequisite-graph + three-mode
// comparator + temporal diagnostics
// ═══════════════════════════════════════════
/** Path to librarian-mcp/stitchpunks — added to Python sys.path for chandelier imports */
const CHANDELIER_STITCH_DIR = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks");
/**
 * Run a Python snippet with chandelier package importable.
 * Extends runWingHelper by injecting the stitchpunks path.
 */
function runChandelierHelper(pySnippet, args) {
    const stamp = `${Date.now()}_${process.pid}`;
    const { tmpdir } = require("os");
    const argsTmp = resolve(tmpdir(), `liana_args_${stamp}.json`);
    const codeTmp = resolve(tmpdir(), `liana_chand_${stamp}.py`);
    const fullCode = [
        "import sys, json",
        `sys.path.insert(0, r"${WORKSPACE_ROOT}")`,
        `sys.path.insert(0, r"${CHANDELIER_STITCH_DIR}")`,
        `with open(r"${argsTmp}", encoding="utf-8") as _f:`,
        `    _args = json.load(_f)`,
        pySnippet.trim(),
        "print(json.dumps(result, default=str))",
    ].join("\n");
    try {
        writeFileSync(argsTmp, JSON.stringify(args), "utf-8");
        writeFileSync(codeTmp, fullCode, "utf-8");
        const out = execSync(`python "${codeTmp}"`, {
            encoding: "utf-8",
            timeout: 90000,
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        return JSON.parse(out.trim());
    }
    catch (err) {
        return { error: String(err) };
    }
    finally {
        try {
            unlinkSync(argsTmp);
        }
        catch { /* ignore */ }
        try {
            unlinkSync(codeTmp);
        }
        catch { /* ignore */ }
    }
}
server.tool("chandelier_query_receipts", "KN009/BP002 — A&A #2291 Bedrock Foundation. Direct lookup of empirical measurement receipts by primitive subset. Returns all receipts matching the given primitive_ids (exact subset match), optionally filtered by metric and time range. Receipts are Chronos Chronicler-signed (append-only Stone Tablet).", {
    primitive_ids: z.array(z.string()).describe("Exact set of primitive IDs to look up (e.g. ['cathedral_effect', 'wrasse_scribe'])"),
    metric: z.string().optional().describe("Filter by metric name (e.g. 'hot_accuracy_pct')"),
    time_range_start: z.string().optional().describe("ISO timestamp lower bound (inclusive)"),
    time_range_end: z.string().optional().describe("ISO timestamp upper bound (inclusive)"),
}, async ({ primitive_ids, metric, time_range_start, time_range_end }) => {
    const result = runChandelierHelper(`from chandelier.chronos_chandelier_bridge import build_index
index = build_index()
time_range = None
if _args.get("time_range_start") and _args.get("time_range_end"):
    time_range = (_args["time_range_start"], _args["time_range_end"])
receipts = index.query(
    primitive_ids=_args["primitive_ids"],
    metric=_args.get("metric"),
    time_range=time_range,
)
result = {"receipts": receipts, "count": len(receipts)}`, { primitive_ids, metric: metric ?? null, time_range_start: time_range_start ?? null, time_range_end: time_range_end ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_compare_modes", "KN009/BP002 — A&A #2291 Three-Mode Comparator. Compares Basic Stock vs Modified Stock vs Full Stack vs Right Recipe (argmax) for a primitive subset on a given metric. Right Recipe is lazy — only computed when include_right_recipe=true. Core diagnostic tool for the Chandelier substrate.", {
    subset: z.array(z.string()).describe("Modified-Stock subset (the primitives to compare)"),
    metric: z.string().describe("Metric to compare on (e.g. 'hot_accuracy_pct')"),
    all_primitive_ids: z.array(z.string()).optional().describe("All primitives for Full-Stack + Right-Recipe (omit to skip those modes)"),
    basic_stock_primitive: z.string().optional().describe("Single primitive for Basic-Stock baseline (default: first in subset)"),
    include_right_recipe: z.boolean().optional().default(false).describe("Compute Right Recipe argmax (lazy — may be expensive for large N)"),
    right_recipe_max_k: z.number().int().min(1).max(12).optional().describe("Max subset size for Right Recipe search"),
}, async ({ subset, metric, all_primitive_ids, basic_stock_primitive, include_right_recipe, right_recipe_max_k }) => {
    const result = runChandelierHelper(`from chandelier.chronos_chandelier_bridge import build_index
from chandelier.three_mode_comparator import ThreeModeComparator
index = build_index()
cmp = ThreeModeComparator(index)
result = cmp.compare(
    subset=_args["subset"],
    metric=_args["metric"],
    all_primitive_ids=_args.get("all_primitive_ids"),
    basic_stock_primitive=_args.get("basic_stock_primitive"),
    include_right_recipe=bool(_args.get("include_right_recipe", False)),
    right_recipe_max_k=_args.get("right_recipe_max_k"),
)`, { subset, metric, all_primitive_ids: all_primitive_ids ?? null, basic_stock_primitive: basic_stock_primitive ?? null, include_right_recipe: include_right_recipe ?? false, right_recipe_max_k: right_recipe_max_k ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_right_recipe", "KN009/BP002 — A&A #2291 Right Recipe (argmax). Find the empirically optimal primitive subset for a given metric across all 2^N-1 possible subsets. The pudding-test: which recipe wins, empirically. Set max_subset_size to limit search scope (recommended ≤ 6 for speed).", {
    target_metric: z.string().describe("Metric to optimise (e.g. 'hot_accuracy_pct')"),
    all_primitive_ids: z.array(z.string()).describe("All primitives to consider in the search"),
    max_subset_size: z.number().int().min(1).max(12).optional().describe("Max subset size to search (default: all)"),
}, async ({ target_metric, all_primitive_ids, max_subset_size }) => {
    const result = runChandelierHelper(`from chandelier.chronos_chandelier_bridge import build_index
from chandelier.three_mode_comparator import ThreeModeComparator
index = build_index()
cmp = ThreeModeComparator(index)
result = cmp._compute_right_recipe(
    all_primitive_ids=_args["all_primitive_ids"],
    metric=_args["target_metric"],
    max_k=_args.get("max_subset_size"),
)`, { target_metric, all_primitive_ids, max_subset_size: max_subset_size ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_query_prerequisites", "KN009/BP002 — A&A #2291 Prerequisite Graph query. Returns hard prerequisites, soft enhancers, and layer classification for a primitive. Use to understand what MUST be present before a primitive can function. The build-order canon: scaffold → framing → wiring → building → edifice → paint.", {
    primitive_id: z.string().describe("Primitive to query (e.g. 'cathedral_effect', 'chandelier_substrate')"),
    include_transitive: z.boolean().optional().default(false).describe("If true, returns full transitive closure of hard prerequisites"),
}, async ({ primitive_id, include_transitive }) => {
    const result = runChandelierHelper(`from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
direct_prereqs = g.query_prerequisites(_args["primitive_id"])
enhancers = g.query_enhancers(_args["primitive_id"])
layer = g.query_layer(_args["primitive_id"])
transitive = g.transitive_prerequisites(_args["primitive_id"]) if _args.get("include_transitive") else None
result = {
    "primitive_id": _args["primitive_id"],
    "layer": layer,
    "hard_prerequisites": direct_prereqs,
    "soft_enhancers": enhancers,
    "transitive_prerequisites": transitive,
}`, { primitive_id, include_transitive: include_transitive ?? false });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_validate_subset", "KN009/BP002 — A&A #2291 Subset validation. Checks that all hard prerequisites are met within a substrate subset. Returns valid=true/false + list of missing prerequisite pairs. Use before running an L2+ measurement to confirm the subset is coherent.", {
    subset: z.array(z.string()).describe("List of primitive IDs to validate"),
    recommend_minimum: z.boolean().optional().default(false).describe("If true, also returns the minimum subset needed for each primitive in the input"),
}, async ({ subset, recommend_minimum }) => {
    const result = runChandelierHelper(`from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
valid, missing = g.validate_substrate_subset(_args["subset"])
rec = {}
if _args.get("recommend_minimum"):
    for pid in _args["subset"]:
        rec[pid] = g.recommend_minimum_subset(pid)
result = {
    "subset": _args["subset"],
    "valid": valid,
    "missing_prerequisite_pairs": missing,
    "minimum_subsets": rec if rec else None,
}`, { subset, recommend_minimum: recommend_minimum ?? false });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_temporal_query", "KN009/BP002 — A&A #2291 Temporal diagnostics. Aggregate empirical receipts by time grain (hour/day/week/month/continuous_stretch) or run substrate-state-correlation analysis. Use to answer: 'Which hours were most productive for Crown Jewel receipts?' Composes Properties 1+2+5.", {
    time_grain: z.enum(["hour", "day", "week", "month", "continuous_stretch", "substrate_correlation"]).describe("Aggregation grain or analysis type"),
    primitive_filter: z.array(z.string()).optional().describe("Filter to receipts involving these primitives"),
    metric: z.string().optional().describe("Filter by metric name"),
    time_range_start: z.string().optional().describe("ISO timestamp lower bound"),
    time_range_end: z.string().optional().describe("ISO timestamp upper bound"),
    top_n_periods: z.number().int().min(1).max(20).optional().default(5).describe("For substrate_correlation: how many top periods to rank"),
}, async ({ time_grain, primitive_filter, metric, time_range_start, time_range_end, top_n_periods }) => {
    const result = runChandelierHelper(`from chandelier.chronos_chandelier_bridge import build_index
from chandelier.temporal_diagnostics import TemporalDiagnostics
index = build_index()
td = TemporalDiagnostics(index)
time_range = None
if _args.get("time_range_start") and _args.get("time_range_end"):
    time_range = (_args["time_range_start"], _args["time_range_end"])
if _args["time_grain"] == "substrate_correlation":
    result = td.substrate_state_correlation(
        metric=_args.get("metric"),
        grain="day",
        top_n_periods=_args.get("top_n_periods", 5),
        time_range=time_range,
    )
else:
    result = td.query_temporal(
        time_grain=_args["time_grain"],
        primitive_filter=_args.get("primitive_filter"),
        metric=_args.get("metric"),
        time_range=time_range,
    )`, { time_grain, primitive_filter: primitive_filter ?? null, metric: metric ?? null, time_range_start: time_range_start ?? null, time_range_end: time_range_end ?? null, top_n_periods: top_n_periods ?? 5 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("chandelier_update_prerequisite_graph", "KN009/BP002 — A&A #2291 Prerequisite Graph writer. Add or update a primitive node in the prerequisite graph YAML. Persists to prerequisite_graph.yaml (Stone Tablet Imperative: existing nodes are updated, not deleted). Use when landing a new primitive that has structural dependencies.", {
    primitive_id: z.string().describe("Canonical primitive ID"),
    layer: z.enum(["scaffold", "framing", "wiring", "building", "edifice", "paint"]).describe("Structural layer this primitive belongs to"),
    hard_prerequisites: z.array(z.string()).optional().describe("Primitives that MUST be present"),
    soft_enhancers: z.array(z.string()).optional().describe("Primitives that ENHANCE this one"),
    orthogonals: z.array(z.string()).optional().describe("Primitives that are unaffected by presence/absence"),
    aa_number: z.string().optional().describe("A&A innovation number (e.g. '2291')"),
    landed_session: z.string().optional().describe("Knight session that built this (e.g. 'KN009')"),
    notes: z.string().optional().describe("Free-form notes about this primitive"),
}, async ({ primitive_id, layer, hard_prerequisites, soft_enhancers, orthogonals, aa_number, landed_session, notes }) => {
    const result = runChandelierHelper(`from chandelier.prerequisite_graph_loader import get_graph
g = get_graph()
node = g.update_prerequisite_graph(
    primitive_id=_args["primitive_id"],
    layer=_args["layer"],
    hard_prerequisites=_args.get("hard_prerequisites"),
    soft_enhancers=_args.get("soft_enhancers"),
    orthogonals=_args.get("orthogonals"),
    aa_number=_args.get("aa_number"),
    landed_session=_args.get("landed_session"),
    notes=_args.get("notes"),
)
result = {"ok": True, "primitive_id": _args["primitive_id"], "node": node}`, { primitive_id, layer, hard_prerequisites: hard_prerequisites ?? null, soft_enhancers: soft_enhancers ?? null, orthogonals: orthogonals ?? null, aa_number: aa_number ?? null, landed_session: landed_session ?? null, notes: notes ?? null });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// K532 — PAWN-VIA-LIBRARIAN DISPATCH TOOLS
// ═══════════════════════════════════════════
registerTool("dispatch_pawn", "K532 — Dispatch a research prompt to Pawn (Perplexity API, sonar-pro). " +
    "Inlines prompt_content — no local file paths sent to Pawn. " +
    "Returns dispatch_id; return file written to expected_return_path. " +
    "Requires PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=true in config/pawn_dispatch_caps.json. " +
    "Per-dispatch cost cap $1.00; daily cap $10.00 (configurable).", {
    prompt_content: z.string().describe("Full prompt text to send to Pawn — NOT a file path; tool inlines content"),
    prompt_artifact_path: z.string().optional().describe("Optional: Bishop dropzone path of the canonical prompt artifact (for ledger record only)"),
    expected_return_path: z.string().describe("Path where Pawn's return should be written (e.g., BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_*.md)"),
    model: z.enum(["sonar-pro", "sonar", "sonar-reasoning", "sonar-reasoning-pro"]).default("sonar-pro").describe("Perplexity model selection"),
    max_tokens: z.number().int().min(100).max(8000).default(4000).describe("Response length cap in tokens"),
    dispatch_metadata: z.object({
        session_id: z.string().optional(),
        cohort: z.string().optional(),
        founder_authorized: z.boolean().optional(),
    }).optional().describe("Bishop-side context for ledger record"),
}, async ({ prompt_content, prompt_artifact_path, expected_return_path, model, max_tokens, dispatch_metadata }) => {
    const result = await runDispatchPawn({
        prompt_content,
        prompt_artifact_path,
        expected_return_path,
        model,
        max_tokens,
        dispatch_metadata: dispatch_metadata,
    });
    // B36 Phase 1: auto-index returns
    if (result.status === "dispatched") {
        try {
            indexPawnReturns();
        }
        catch { /* best-effort */ }
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
registerTool("check_pawn_dispatch", "K532 — Check status of a Pawn dispatch by dispatch_id. Returns dispatch record including status, cost, return path, attempt_log.", {
    dispatch_id: z.string().describe("UUID returned by dispatch_pawn"),
}, async ({ dispatch_id }) => {
    const record = getDispatchStatus(dispatch_id);
    if (!record) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "not_found", dispatch_id }) }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(record, null, 2) }] };
});
registerTool("cancel_pawn_dispatch", "K532 — Cancel a pending Pawn dispatch. Marks it cancelled in the ledger. Does not abort already-in-flight HTTP calls.", {
    dispatch_id: z.string().describe("UUID returned by dispatch_pawn"),
}, async ({ dispatch_id }) => {
    const result = cancelDispatch(dispatch_id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
registerTool("list_pending_pawn_dispatches", "K532 — List recent Pawn dispatch records. Founder can inspect status, costs, return paths. Returns last N records from the ledger.", {
    last_n: z.number().int().min(1).max(100).default(20).describe("How many recent records to return"),
}, async ({ last_n }) => {
    const records = listRecentDispatches(last_n);
    const summary = records.map(r => ({
        dispatch_id: r.dispatch_id,
        status: r.status,
        model: r.model,
        cost_estimate_usd: r.cost_estimate_usd,
        cost_actual_usd: r.cost_actual_usd,
        prompt_artifact_path: r.prompt_artifact_path,
        expected_return_path: r.expected_return_path,
        dispatch_timestamp: r.dispatch_timestamp,
        return_timestamp: r.return_timestamp,
        error_class: r.error_class,
    }));
    return { content: [{ type: "text", text: JSON.stringify({ count: summary.length, dispatches: summary }, null, 2) }] };
});
registerTool("index_pawn_returns", "Bushel 36 Phase 1 (BP025) � Pawn Return Auto-Indexer. Scans dispatches/pawn/ for unprocessed *.return.json files, " +
    "extracts topics, emits pheromone records to the substrate (cathedral:pawn, synthesisClass:pawn_research_return), " +
    "surfaces FLAGGED/CRITICAL findings to high_priority_surface.jsonl for next-session-open Wrasse pre-injection. Idempotent.", {
    show_high_priority: z.boolean().optional().default(false).describe("Return recent high-priority flagged Pawn findings."),
    high_priority_limit: z.number().int().min(1).max(50).optional().default(5).describe("Max high-priority records."),
}, async ({ show_high_priority, high_priority_limit }) => {
    const result = indexPawnReturns();
    const output = {
        processed: result.processed,
        skipped_already_indexed: result.skipped_already_indexed,
        high_priority_surfaced: result.high_priority_surfaced,
        total_indexed: getIndexedReturnCount(),
        errors: result.errors,
    };
    if (show_high_priority) {
        output.high_priority_findings = readHighPrioritySurface(high_priority_limit ?? 5);
    }
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
});
// ═══════════════════════════════════════════
// KN-G — SHADOW PHASE QUERY (BP016)
// ═══════════════════════════════════════════
registerTool("shadow_phase_query", "KN-G / BP016 — Alternating Cylinder Fire observability tool. " +
    "Returns the current A/B phase assignment for each of the 8 Shadow E-Giants. " +
    "Reads from federation/cylinder_phase_state.jsonl; falls back to deterministic formula if no state file. " +
    "Use for debugging cycle coordination, verifying N/2-in-A + N/2-in-B balance, and monitoring phase transitions.", {
    shadow_id: z.string().optional().describe("Optional: specific Shadow ID (shadow_0..shadow_7) — omit for all 8"),
    cycle_number: z.number().int().min(0).optional().describe("Optional: query phase for a hypothetical cycle number instead of current"),
    include_history: z.boolean().default(false).describe("If true, include last 5 cycle snapshots from the state log"),
}, async ({ shadow_id, cycle_number, include_history }) => {
    const { homedir } = await import("os");
    const { readFileSync, existsSync } = await import("fs");
    const { resolve } = await import("path");
    const STATE_FILE = resolve(homedir(), ".lb-session", "federation", "cylinder_phase_state.jsonl");
    const SHADOW_COUNT = 8;
    // Deterministic formula: shadow_i is in phase A when (cycle + i) % 2 === 0
    function deterministicPhase(cycle, idx) {
        return (cycle + idx) % 2 === 0 ? "A" : "B";
    }
    // Read latest state from JSONL
    let latestSnapshot = null;
    const history = [];
    if (existsSync(STATE_FILE)) {
        try {
            const lines = readFileSync(STATE_FILE, "utf-8").trim().split("\n").filter(Boolean);
            for (const line of lines) {
                try {
                    history.push(JSON.parse(line));
                }
                catch { /* skip malformed */ }
            }
            if (history.length > 0)
                latestSnapshot = history[history.length - 1];
        }
        catch {
            // file unreadable — fall through to deterministic
        }
    }
    // Resolve effective cycle number
    const effectiveCycle = cycle_number !== undefined
        ? cycle_number
        : (latestSnapshot?.cycle_number ?? 0);
    // Build assignments
    const shadowIds = shadow_id
        ? [shadow_id]
        : Array.from({ length: SHADOW_COUNT }, (_, i) => `shadow_${i}`);
    const assignments = shadowIds.map(sid => {
        const idx = parseInt(sid.replace("shadow_", ""), 10);
        const phase = (latestSnapshot && cycle_number === undefined)
            ? (latestSnapshot.assignments.find(a => a.shadow_id === sid)?.phase ?? deterministicPhase(effectiveCycle, idx))
            : deterministicPhase(effectiveCycle, idx);
        return { shadow_id: sid, phase, cycle_number: effectiveCycle };
    });
    const inA = assignments.filter(a => a.phase === "A").length;
    const inB = assignments.filter(a => a.phase === "B").length;
    const balanced = !shadow_id && inA === inB;
    const result = {
        source: latestSnapshot ? "state_file" : "deterministic_formula",
        state_file: STATE_FILE,
        effective_cycle: effectiveCycle,
        published_at: latestSnapshot?.published_at ?? null,
        assignments,
        balance: { in_A: inA, in_B: inB, balanced },
    };
    if (include_history && history.length > 0) {
        result.history = history.slice(-5);
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ─── KN102: get_cohort_class ──────────────────────────────────────────────────
// Read-only. Returns current member's cohort tier + librarian mode.
// Called at LB Frame Handshake Phase 1 Discovery and on-demand for diagnostics.
// BRIDLE Rule 4: if detection fails, returns lone_wolf/brittle (safe default).
server.tool("get_cohort_class", "Returns the current member's cohort class (lone_wolf / pied_piper_tier_1 / pied_piper_tier_2_plus / federation_member / excalibur_class_subscriber) and librarian mode (brittle or fluid). Used by LB Frame Handshake Phase 1 Discovery and brief_me to surface mode context. Reads profiles.membership_status + entity_memberships + cue_card 7-day recency window via Supabase RPC. Falls back to brittle/lone_wolf if DB is unreachable.", {
    member_id: z.string().describe("Supabase auth.users UUID for the member. Required."),
}, async ({ member_id }) => {
    ensureFreshIndex();
    const result = await probeCohortClass(member_id);
    const summary = formatCohortSummary(result);
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    ...result,
                    summary,
                }, null, 2),
            }],
    };
});
// ─── KN-H1 + KN-H2 + KN-H3 + KN-H4: get_lb_frame_resource_config_tier ───────
// Read-only. Returns member's Tier choice + tier-spec metadata.
// KN-H2: Extended to return Tier A spec metadata + empirical-floor receipt pointer
//         when tier == 'needs'. Single source of truth: tier_a_needs_spec.ts (UI)
//         and TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json (empirical anchor).
// KN-H3: Extended to return Tier B spec metadata + empirical-uplift receipt pointer
//         when tier == 'suggests'. Single source of truth: tier_b_suggests_spec.ts (UI)
//         and TIER_B_EMPIRICAL_UPLIFT_RECEIPT_BP017.json (empirical anchor).
// KN-H4: Extended to return Tier C spec metadata + cascade telemetry receipt pointer
//         when tier == 'founder'. Single source of truth: tier_c_founder_spec.ts (UI)
//         and TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json (empirical anchor).
//         Tier C is the empirical-receipt-source: the BP015→BP017 cascade (27 CJ ratifications +
//         70+ clean K-lineage + 4 architectural patterns recovered) establishes the reference point.
// Called at LB Frame Handshake Phase 1 Discovery (Step 1.3) and on-demand.
// Orthogonal to get_cohort_class (Step 1.2) — Tier and cohort-class are independent axes.
// BRIDLE Rule 4: if DB unavailable, returns tier_state='not_chosen' (surface picker; don't proceed silently).
const TIER_A_SPEC_METADATA = {
    plan_requirement: "Default Claude Code Pro/Standard plan",
    upgrade_required: false,
    anyone_can_run: true,
    mcp_slots: "Default (5–10 slots)",
    cohort_class_default: "Lone Wolf",
    bag_of_holding_class: "Small bag (default-plan context-budget); warehouse-access full",
    substrate_mode: "read-only",
    cathedral_fingerprint: "brittle (cron-class; npm run rebuild)",
    spec_bullets: [
        "Default Claude Code plan (no upgrade required)",
        "Standard token budget + message-rate limits (no overrides)",
        "Pheromone substrate read-only — query the cooperative warehouse",
        "Detective TEAM read-only — cross-cathedral fan-out for canon search",
        "Brittle Cathedral fingerprint (refreshes via npm run rebuild)",
        "Lone Wolf cohort-class default (separately advanceable)",
    ],
    empirical_floor: {
        benchmark: "R10-v1",
        cold_accuracy_pct_min: 5.3,
        cold_accuracy_pct_max: 12.0,
        hot_accuracy_pct_min: 89.3,
        hot_accuracy_pct_max: 98.7,
        lift_pp_min: 78,
        lift_pp_max: 93.4,
        lift_pp_mean: 86.2,
        target_lift_pp: 30,
        pass: true,
        receipt_pointer: "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
        note: "Retrieval quality is substrate-dependent, not plan-dependent. Tier A floor is the same as Tier B/C for retrieval.",
    },
    spec_doc: "platform/src/data/lb_frame_tier_specs/tier_a_needs.md",
};
// ─── KN-H4: Tier C FOUNDER spec metadata ────────────────────────────────────
// Single source of truth for MCP tool response when tier == 'founder'.
// UI source: platform/src/data/lb_frame_tier_specs/tier_c_founder_spec.ts
// Empirical anchor: BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json
// BRIDLE Rule 4: all cascade telemetry numbers anchored to milestone artifacts + canonical_values.yaml.
const TIER_C_SPEC_METADATA = {
    plan_requirement: "Founder-equivalent plan (self-attested at install-time; no purchase required)",
    plan_note: "Tier C advisory surfaces strongly if plan below Founder-equivalent. Informational only — does not block. " +
        "Anti-extraction: capital alone is not the gate. Cohort-class advancement (separately advanceable) unlocks Federation features.",
    upgrade_required: false,
    anyone_can_run: true,
    self_attested: true,
    mcp_slots: "~30+ slots (full LB Frame core + Cathedral + Pheromone + Detective TEAM + extended MCPs)",
    cohort_class_minimum: "Federation Member (Apiarist Worker / Drone / Queen / Thirteenth Warrior cohort lead)",
    bag_of_holding_class: "Biggest bag (Founder plan context-budget); full warehouse-write privilege at all layers",
    substrate_mode: "read+write",
    pheromone_mode: "read+write",
    detective_team_mode: "full (read+write-back)",
    miner_subclass: true,
    apiarist_hive: "full",
    excalibur_class: "subscriber",
    iron_e_giant_federation: "full",
    shadow_e_giant: "Alternating Cylinder Fire daemon",
    cathedral_fingerprint: "fluid (event-driven; maximum-velocity Cue Card recency)",
    bishop_model_spec: "Claude Opus 4.7 (1M context)",
    knight_model_spec: "Claude Sonnet 4.6 (200K context)",
    spec_bullets: [
        "Founder-equivalent plan (self-attested; no purchase required — capital is not the gate)",
        "Bishop=Opus 4.7 1M + Knight=Sonnet 4.6 200K token budgets (maximum-velocity composition)",
        "~30+ MCP slots (full LB Frame core + Cathedral + Pheromone + Detective TEAM + extended MCPs)",
        "All substrate features at full velocity: Pheromone + Detective TEAM + Miner + Apiarist Hive + Excalibur + Shadow E-Giant",
        "Federation Member cohort-class minimum (Apiarist Worker / Drone / Queen — separately advanceable)",
        "Empirical-receipt-source: 27 CJ ratifications + 70+ clean K-lineage + 4 architectural patterns recovered (BP015→BP017 cascade)",
    ],
    cascade_telemetry: {
        session_arc: "BP015 → BP016 → BP017",
        crown_jewel_ratifications: {
            bp015: 0,
            bp015_note: "Substrate-readiness audit — receipt IS the enabling-disclosure artifact for Prov 16",
            bp016: 15,
            bp016_source: "MILESTONE_BP016_CLOSEOUT.md — confirmed 15 CJ ratifications, highest single-session density in BP-arc history",
            bp017_floor: 12,
            total_floor: 27,
        },
        k_lineage_clean_floor: "70+",
        k_lineage_source: "BP015 closeout '64+ consecutive clean K-lineage (zero --no-verify)' + KN-H1/H2/H3/H4 additions",
        zero_no_verify_events: true,
        pods_landed_count: 9,
        architectural_patterns_recovered: 4,
        architectural_patterns_class: "architectural-pattern-recognition tier — highest compound-lift class observed to date",
        bp015_beans_landed: 449,
        bp015_capacity_floor: "~750-800 substrate operations single-session",
        bridle_rule_4_note: "All telemetry empirically anchored: CJ counts from MILESTONE_BP016_CLOSEOUT.md; " +
            "K-lineage from git log + BP015 closeout floor; canonical values from canonical_values.yaml. " +
            "No inflation. Anti-marketing-class discipline preserved per feedback_empirically_valid_praise_only.md (B132).",
    },
    spec_doc: "platform/src/data/lb_frame_tier_specs/tier_c_founder.md",
    cascade_receipt_pointer: "BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json",
    composes_with: [
        "KN-H1 LANDED 82c52fa (Three-Tier installer + UI + persistence + MCP tools)",
        "KN-H2 LANDED c75995f (Tier A baseline empirical floor receipt)",
        "KN-H3 LANDED 94cd4c6 (Tier B uplift empirical receipt)",
        "KN-H4 LANDED (this commit — Tier C FOUNDER spec doc + cascade telemetry receipt)",
    ],
    empirical_receipt_source_note: "Tier C FOUNDER is the empirical-receipt-source for the LB Frame Three-Tier system. " +
        "The BP015→BP017 cascade telemetry IS the receipt future Tier C users replicate at their plan-class.",
};
const TIER_B_SPEC_METADATA = {
    plan_requirement: "Claude Code Max or equivalent higher-tier (recommended, not required)",
    plan_note: "Tier B advisory surfaces if plan below Max-equivalent. Informational only — does not block.",
    upgrade_required: false,
    anyone_can_run: true,
    mcp_slots: "15–20 slots minimum",
    cohort_class_recommended: "Pied Piper Tier 1+",
    bag_of_holding_class: "Bigger bag (Claude Code Max context-budget); event-driven warehouse-write at Pied Piper+ cohort",
    substrate_mode: "read+write",
    cathedral_fingerprint: "fluid (event-driven; Cue Card 7-day recency gate)",
    pheromone_mode: "read+write",
    detective_team_mode: "full (read+write-back)",
    spec_bullets: [
        "Claude Code Max or equivalent (recommended, not required)",
        "1M-context Opus 4.7 token budget (vs default Tier A bag)",
        "15–20 MCP slots minimum (full LB Frame core + Cathedral + Pheromone + Detective TEAM)",
        "Full Pheromone substrate (read + write — was read-only at Tier A)",
        "Detective TEAM full access + write-back loop (was read-only at Tier A)",
        "Fluid Cathedral fingerprint via Cue Card 7-day recency gate (was Brittle at Tier A)",
        "Pied Piper Tier 1+ cohort-class recommended (separately advanceable)",
    ],
    empirical_uplift: {
        baseline_tier: "needs",
        baseline_receipt_pointer: "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
        hot_rate_min_pct: 89.3,
        hot_rate_max_pct: 98.7,
        hot_rate_note: "HOT-rate is substrate-dependent, not plan-dependent. Same R10 baseline applies. " +
            "Fluid Cathedral may improve in fast-evolving knowledge domains.",
        reckoning_velocity_uplift_range: "2–3×",
        reckoning_velocity_source: "bp017-spec",
        pod_scaffolding_uplift_min_x: 1.5,
        pod_scaffolding_tier_b_rate: "~1 K-prompt per 30 min (vs ~60 min at Tier A)",
        pod_scaffolding_source: "bp017-spec",
        cathedral_hot_between_rebuilds_pct_range: "70–85%",
        receipt_pointer: "BISHOP_DROPZONE/14_CanonicalReferences/TIER_B_EMPIRICAL_UPLIFT_RECEIPT_BP017.json",
        uplift_pass: true,
        bridle_rule_4_note: "Velocity and pod-scaffolding claims labeled bp017-spec (architectural basis). " +
            "HOT-rate empirically verified via R10 cross-vendor benchmark. " +
            "BRIDLE Rule 4: source clearly distinguished from live-benchmark measurement.",
    },
    spec_doc: "platform/src/data/lb_frame_tier_specs/tier_b_suggests.md",
    composes_with: [
        "KN-H1 LANDED 82c52fa (Three-Tier installer + UI + persistence + MCP tools)",
        "KN-H2 LANDED (Tier A baseline empirical floor receipt)",
        "KN102+KN103 LANDED 42ad0c3 (cohort-class probe + Pied Piper Fluid Cathedral fingerprint)",
        "KN104 PRE-COLOSSUS LANDED 5e7f540 (Detective TEAM full access at Tier B)",
    ],
};
server.tool("get_lb_frame_resource_config_tier", "Returns a member's LB Frame resource-config tier choice (needs/suggests/founder) + tier-spec metadata. " +
    "KN-H2: When tier is 'needs' (Tier A), returns full Tier A spec metadata including empirical floor receipt pointer. " +
    "KN-H3: When tier is 'suggests' (Tier B), returns full Tier B spec metadata including empirical uplift receipt pointer. " +
    "KN-H4: When tier is 'founder' (Tier C), returns full Tier C spec metadata including BP015→BP017 cascade telemetry receipt pointer. " +
    "Tier C is the empirical-receipt-source: 27 CJ ratifications + 70+ clean K-lineage + 4 architectural patterns recovered. " +
    "Called at LB Frame Handshake Phase 1 Discovery Step 1.3 to check if member has already chosen a tier. " +
    "Orthogonal to get_cohort_class (Step 1.2) — Tier and cohort-class are independent axes. " +
    "Tier A NEEDS = default Claude plan, no upgrade required, empirical floor +78–93pp lift. " +
    "Tier B SUGGESTS = recommended uplift (Claude Code Max); 2–3× Reckoning velocity; Fluid Cathedral; full Pheromone+Detective TEAM. " +
    "Tier C FOUNDER = empirical-receipt-source, self-attested, no fiat-bridge; all substrate features at full velocity; Federation cohort-class minimum. " +
    "Anti-extraction by structural form: capital alone cannot purchase higher-tier participation. " +
    "Falls back gracefully if Supabase unavailable (BRIDLE Rule 4).", {
    member_id: z.string().describe("Supabase auth.users UUID for the member. Required."),
    surface: z.string().optional().describe("Detected Claude Code surface (from Phase 1 Discovery) — used for plan-tier advisory text only."),
}, async ({ member_id, surface }) => {
    ensureFreshIndex();
    const result = await probeTierConfig(member_id);
    const summary = formatTierSummary(result);
    const advisory = result.tier ? buildPlanTierAdvisory(result.tier, surface) : null;
    // KN-H2: Attach Tier A spec metadata when tier is 'needs' (or not yet chosen — show floor spec for UI)
    const tier_a_spec = (result.tier === "needs" || result.tier_state === "not_chosen")
        ? TIER_A_SPEC_METADATA
        : null;
    // KN-H3: Attach Tier B spec metadata when tier is 'suggests'
    const tier_b_spec = result.tier === "suggests" ? TIER_B_SPEC_METADATA : null;
    // KN-H4: Attach Tier C spec metadata when tier is 'founder'
    const tier_c_spec = result.tier === "founder" ? TIER_C_SPEC_METADATA : null;
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    ...result,
                    summary,
                    plan_tier_advisory: advisory,
                    tier_a_spec,
                    tier_b_spec,
                    tier_c_spec,
                    compose_note: "Run get_cohort_class for cohort-class axis (orthogonal). Both at Handshake Phase 1 Discovery.",
                }, null, 2),
            }],
    };
});
// ─── KN-H1: set_lb_frame_resource_config_tier ────────────────────────────────
// Persists user's tier choice from Handshake Step 1.3.
// Tier choice is reversible (re-selection supported; tier_chosen_at updates).
// Anti-extraction: no fiat-bridge enforcement at this layer; Tier C is self-attested.
server.tool("set_lb_frame_resource_config_tier", "Persists a member's LB Frame resource-config tier choice to user_preferences. " +
    "Called by Handshake Phase 1 Discovery Step 1.3 after user picks. " +
    "Tier choice is reversible — re-selection allowed; tier_chosen_at updates on every call. " +
    "No fiat-bridge: Tier C (founder) does NOT require fiat upgrade-purchase; user self-attests. " +
    "Returns success + reselection flag (true if overriding a previous pick). " +
    "BRIDLE Rule 8: surfaces error + retry if persistence fails; does not silently proceed.", {
    member_id: z.string().describe("Supabase auth.users UUID for the member. Required."),
    tier: z.enum(["needs", "suggests", "founder"]).describe("Chosen tier: 'needs' (Tier A, default plan), 'suggests' (Tier B, recommended uplift), 'founder' (Tier C, empirical-receipt-source)."),
}, async ({ member_id, tier }) => {
    ensureFreshIndex();
    const result = await setTierConfig(member_id, tier);
    if (!result.success) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...result,
                        retry_instruction: "Persistence failed. Surface error to user and offer retry. Do NOT silently proceed (BRIDLE Rule 8).",
                    }, null, 2),
                }],
            isError: true,
        };
    }
    const summary = `Tier ${tier} (${tier === "needs" ? "A" : tier === "suggests" ? "B" : "C"}) set successfully${result.reselection ? " (reselection — overrode previous pick)" : ""}.`;
    return {
        content: [{
                type: "text",
                text: JSON.stringify({ ...result, summary }, null, 2),
            }],
    };
});
// ═══════════════════════════════════════════
// KN104: TEAM DISPATCHER (PRE-COLOSSUS)
// ═══════════════════════════════════════════
/**
 * team_dispatch — KN104 / BP016 PRE-COLOSSUS
 * Multi-class TEAM (Detectives + Miners) cross-cathedral investigation
 * with cohort-class-aware Scribe-access enforcement and substrate write-back.
 */
registerTool("team_dispatch", "Detective TEAM dispatcher (KN104/BP016 PRE-COLOSSUS). Multi-class team composition: Detectives (pheromone + consult_scribes) + Miners (mitotic corpus-prospecting + ROOT-lineage + IP-ledger-locked). Cohort-class-aware Scribe-access enforcement (lone_wolf/pied_piper/federation_member/excalibur_class_subscriber). Substrate write-back via Pheromone with extended schema. Pairs with KN105 Excalibur Class: Miner output feeds Excalibur slice-distillation pipeline.", {
    claim: z.string().min(3).max(500).describe("The claim or topic to investigate with the full TEAM"),
    team_composition: z.array(z.enum(["detective", "miner"])).min(1).describe("Team roles to dispatch (e.g. ['detective', 'miner'])"),
    cohort_class: z.enum(["lone_wolf", "pied_piper", "federation_member", "excalibur_class_subscriber"]).describe("Cohort class — controls Scribe-access boundaries per KN102/BP016"),
    cathedrals: z.array(z.enum(["bishop", "knight", "pawn"])).optional().describe("Cathedrals to fan out across (default: all 3; bounded by cohort_class)"),
    max_agents_per_role: z.number().int().min(1).max(5).optional().describe("Max agents per role (default 2)"),
    write_back: z.boolean().optional().describe("Write synthesis to pheromone substrate (default true; overridden by cohort_class access rules)"),
    raw_corpus: z.array(z.string()).optional().describe("Raw text corpus for Miner prospecting (optional; if omitted, Miner uses pheromone substrate contents)"),
    flavor_class: z.object({
        domain: z.string().optional(),
        cognition: z.string().optional(),
        audience: z.string().optional(),
    }).optional().describe("Multi-Trail pheromone flavor tags for write-back synthesis entry"),
    replay_class: z.string().optional().describe("Set to 'detective_team_backfill' for replay pass"),
}, async ({ claim, team_composition, cohort_class, cathedrals, max_agents_per_role, write_back, raw_corpus, flavor_class, replay_class }) => {
    try {
        const corpus = raw_corpus ?? [];
        const result = await teamDispatch({
            claim,
            team_composition: team_composition,
            cohort_class: cohort_class,
            cathedrals: cathedrals ?? ["bishop", "knight", "pawn"],
            max_agents_per_role: max_agents_per_role ?? 2,
            write_back: write_back !== false,
            flavor_class,
            replay_class,
        }, async (c, cathedral, agentIdx) => {
            return runMinerProspect({
                claim: c,
                cathedral,
                raw_corpus: corpus.length > 0 ? corpus : [`topic: ${c}`],
                session_id: `team_dispatch_${Date.now()}_${agentIdx}`,
            });
        });
        const accessDescriptor = getScribeAccessDescriptor(cohort_class);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...result,
                        access_audit: {
                            tier: accessDescriptor.tier_label,
                            access_note: accessDescriptor.access_note,
                        },
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * miner_dispatch — KN104 / BP016
 * Standalone Miner-only dispatch for ad-hoc corpus prospecting.
 */
registerTool("miner_dispatch", "Standalone Miner dispatch (KN104/BP016). Runs a single Miner agent on a raw corpus. Produces ROOT-lineage tablet + halves-on-category-discovery. Cathedral-prefixed serial number generated. IP-ledger-locked + Chronos Chronicler signed. Use for targeted corpus-prospecting without full TEAM overhead.", {
    claim: z.string().min(3).max(500).describe("Topic seed for the Miner"),
    cathedral: z.enum(["bishop", "knight", "pawn"]).optional().describe("Cathedral to mine in (default: bishop)"),
    raw_corpus: z.array(z.string()).describe("Raw text corpus to mine (array of text strings)"),
    parent_serial: z.string().optional().describe("Parent Miner serial (for spawning daughter Miners)"),
    halve_threshold: z.object({
        keyword_density_delta: z.number().min(0).max(1).optional(),
        semantic_drift_threshold: z.number().min(0).max(1).optional(),
        founder_ratification_override: z.boolean().optional().describe("Explicit YES/NO from Founder; bypasses heuristic detection"),
    }).optional().describe("Halve threshold config (defaults: 0.3 keyword delta, 0.4 semantic drift)"),
    session_id: z.string().optional().describe("Session ID for IP ledger attribution"),
}, async ({ claim, cathedral, raw_corpus, parent_serial, halve_threshold, session_id }) => {
    try {
        const result = await runMinerProspect({
            claim,
            cathedral: cathedral ?? "bishop",
            raw_corpus,
            parent_serial,
            halve_threshold_config: halve_threshold ? {
                keyword_density_delta: halve_threshold.keyword_density_delta ?? 0.3,
                semantic_drift_threshold: halve_threshold.semantic_drift_threshold ?? 0.4,
                founder_ratification_override: halve_threshold.founder_ratification_override,
            } : undefined,
            session_id: session_id ?? `miner_dispatch_${Date.now()}`,
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * get_team_provenance_chain — KN104 / BP016
 * Query ROOT-lineage for Miner outputs by serial prefix.
 */
registerTool("get_team_provenance_chain", "Returns ROOT-lineage provenance chain for a given Miner serial (KN104/BP016). Resolves all descendants (daughter Miners spawned via halving). Serial format: LB-CAT.M-0042 (bishop), LB-CAT.K-0007 (knight). Also returns IP-ledger entries and Wells of Knowledge for the lineage. Use after miner_dispatch or team_dispatch to audit mitotic lineage.", {
    serial: z.string().describe("Root Miner serial (e.g. 'LB-CAT.M-0042'). Also accepts 'ALL' to list all root Miners."),
    include_ip_ledger: z.boolean().optional().describe("Include IP ledger entries (default false)"),
    include_wells: z.boolean().optional().describe("Include Wells of Knowledge entries (default false)"),
}, async ({ serial, include_ip_ledger, include_wells }) => {
    try {
        if (serial === "ALL") {
            const roots = listRootMiners();
            return {
                content: [{ type: "text", text: JSON.stringify({ root_miners: roots, count: roots.length }, null, 2) }],
            };
        }
        const chain = queryProvenanceChain(serial);
        const result = {
            serial,
            provenance_chain: chain,
            chain_length: chain.length,
        };
        if (include_ip_ledger) {
            result.ip_ledger_entries = queryIpLedger(serial);
        }
        if (include_wells) {
            const wells = listAllWells().filter(w => w.parent_serial === serial || w.daughter_serial.startsWith(serial));
            result.wells_of_knowledge = wells;
        }
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
// ═══════════════════════════════════════════
// KN105: EXCALIBUR CLASS COMMERCIAL SUBSCRIPTION
// ═══════════════════════════════════════════
/**
 * excalibur_slice_list — KN105 / BP016
 */
registerTool("excalibur_slice_list", "Lists Excalibur Class Scribe slices (KN105/BP016). By default returns only tag-assigned Excalibur Class slices. Set include_all=true to include proposed/raw_federation_library slices. Each slice includes pricing (one-time + subscription), tag-assignment gate status, contributing-member count, and topics covered.", {
    include_all: z.boolean().optional().describe("Include all slice statuses (default false = Excalibur Class only)"),
    granularity_filter: z.enum(["topic", "category"]).optional().describe("Filter by granularity (optional)"),
}, async ({ include_all, granularity_filter }) => {
    try {
        const slices = include_all ? listAllSlices() : listExcaliburClassSlices();
        const filtered = granularity_filter ? slices.filter(s => s.granularity === granularity_filter) : slices;
        return {
            content: [{ type: "text", text: JSON.stringify({ slices: filtered, count: filtered.length }, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * excalibur_slice_create — KN105 / BP016
 */
registerTool("excalibur_slice_create", "Creates a new Excalibur Class Scribe slice candidate (KN105/BP016). Status starts as 'proposed'. Pricing calculated automatically: M_share × N_opted_in × 1.20 Cost+20%; category slices get 0.70 bundle discount. Slice earns 'excalibur_class' status only after all 4 gates pass (Cathedral Effect + Furnace + Adversarial Fence + Federation vote).", {
    name: z.string().describe("Slice name (e.g. 'Gene Splicing' or 'Financial Markets')"),
    granularity: z.enum(["topic", "category"]).describe("topic = single topic; category = bundle of topics"),
    topics_included: z.array(z.string()).min(1).describe("Topics in this slice"),
    contributing_member_ids: z.array(z.string()).optional().describe("Member IDs who contributed data (all default to opted_in)"),
    m_share_override: z.number().optional().describe("Override Member pay rate (default $1/year per member per topic)"),
}, async ({ name, granularity, topics_included, contributing_member_ids, m_share_override }) => {
    try {
        const members = (contributing_member_ids ?? []).map((id, i) => ({
            member_id: id,
            data_stamps: [],
            contribution_share_proportion: 1.0 / Math.max(1, (contributing_member_ids ?? []).length),
            share_back_per_subscription: 0,
            opt_in_status: "opted_in",
        }));
        const slice = createExcaliburSlice({
            name,
            granularity,
            topics_included,
            contributing_members: members,
            m_share_override,
        });
        return {
            content: [{ type: "text", text: JSON.stringify({ slice, pricing_summary: slice.pricing }, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * excalibur_slice_evaluate_gates — KN105 / BP016
 */
registerTool("excalibur_slice_evaluate_gates", "Evaluates the 4 Excalibur tag-assignment gates for a slice (KN105/BP016). BRIDLE Rule 4: if any gate fails (including borderline scores), tag is NOT assigned — slice stays 'raw_federation_library'. Gates: (1) Cathedral Effect lift ≥30pp, (2) Furnace verification ≥0.70, (3) Adversarial Fence all-probes-pass, (4) Federation vote quorum+threshold. Returns evaluation result + recommended_status.", {
    slice_id: z.string().describe("Excalibur slice ID"),
    cathedral_effect_lift_pp: z.number().describe("Cathedral Effect cross-vendor lift in percentage points (e.g. 35 = +35pp)"),
    furnace_verification_score: z.number().min(0).max(1).describe("Furnace gear-tooth-fit score 0.0–1.0"),
    adversarial_fence_probes_passed: z.number().int().min(0).describe("Number of adversarial fence probes passed"),
    adversarial_fence_probes_total: z.number().int().min(1).describe("Total adversarial fence probes"),
    federation_vote_yes: z.number().int().min(0).describe("Federation member yes votes"),
    federation_vote_no: z.number().int().min(0).describe("Federation member no votes"),
    total_eligible_voters: z.number().int().min(1).describe("Total eligible Federation member voters (for quorum calc)"),
}, async ({ slice_id, cathedral_effect_lift_pp, furnace_verification_score, adversarial_fence_probes_passed, adversarial_fence_probes_total, federation_vote_yes, federation_vote_no, total_eligible_voters }) => {
    try {
        const gates = {
            cathedral_effect_verification: { passed: false, lift_pp: cathedral_effect_lift_pp },
            furnace_gate: { passed: false, verification_score: furnace_verification_score },
            adversarial_fence_testing: { passed: false, probes_passed: adversarial_fence_probes_passed, probes_total: adversarial_fence_probes_total },
            federation_member_vote: { yes_count: federation_vote_yes, no_count: federation_vote_no, quorum_met: false, threshold_met: false },
        };
        const updatedSlice = evaluateAndTagSlice(slice_id, gates, total_eligible_voters);
        return {
            content: [{ type: "text", text: JSON.stringify({ slice: updatedSlice, tag_assigned: updatedSlice.excalibur_tag_assigned, status: updatedSlice.status }, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * excalibur_subscription_create — KN105 / BP016
 */
registerTool("excalibur_subscription_create", "Creates and activates an Excalibur Class subscription (KN105/BP016). Upekrithen LLC seller-of-record (Apache 2.0, NOT AGPL). Payment type: 'subscription' (annual, 5-year amortized) or 'one_time' (expires 30 days). Auto-grants cohort_class=excalibur_class_subscriber + fluid librarian mode (KN102 composition). No preemptive non-profit vetting per Founder stance.", {
    subscriber_id: z.string().describe("Member/subscriber UUID"),
    slice_id: z.string().describe("Excalibur Class slice ID to subscribe to"),
    payment_type: z.enum(["subscription", "one_time"]).describe("Annual subscription or one-time access"),
    stripe_session_id: z.string().optional().describe("Stripe checkout session ID (for one-time)"),
    stripe_subscription_id: z.string().optional().describe("Stripe subscription ID (for annual)"),
}, async ({ subscriber_id, slice_id, payment_type, stripe_session_id, stripe_subscription_id }) => {
    try {
        const slice = getSliceById(slice_id);
        if (!slice) {
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: `Slice ${slice_id} not found` }) }] };
        }
        if (slice.status !== "excalibur_class") {
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: `Slice ${slice_id} has not earned Excalibur tag (status: ${slice.status}). Only the worthy wield Excalibur.` }) }] };
        }
        let sub = createSubscription(subscriber_id, slice_id, slice.granularity);
        if (payment_type === "subscription") {
            sub = activateSubscription(sub, stripe_subscription_id);
        }
        else {
            sub = activateOneTimeAccess(sub, stripe_session_id);
        }
        return {
            content: [{ type: "text", text: JSON.stringify({
                        subscription: sub,
                        cohort_class_granted: sub.cohort_class_granted,
                        access_active: true,
                        expires_at: sub.expires_at,
                    }, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * excalibur_share_back_summary — KN105 / BP016
 */
registerTool("excalibur_share_back_summary", "Returns Excalibur Class share-back-pay summary (KN105/BP016). Per-member share of subscription revenue: (revenue / 1.20) × contribution_proportion. Radical transparency per Meta-Law. For slice-level: shows all opted-in contributors and their total earned/pending/paid-out. For member-level: shows total earned across all slices.", {
    query_type: z.enum(["slice", "member"]).describe("Query by slice_id or member_id"),
    id: z.string().describe("Slice ID (if query_type=slice) or Member ID (if query_type=member)"),
    record_payment: z.object({
        subscription_revenue: z.number().describe("Revenue from this payment period ($)"),
        period_start: z.string().describe("ISO-8601 period start"),
        period_end: z.string().describe("ISO-8601 period end"),
    }).optional().describe("If provided, records a new payment and generates share-back entries for all opted-in members"),
}, async ({ query_type, id, record_payment }) => {
    try {
        if (query_type === "slice") {
            if (record_payment) {
                const slice = getSliceById(id);
                if (!slice)
                    return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: `Slice ${id} not found` }) }] };
                const entries = recordShareBackForPayment(id, slice.contributing_members, record_payment.subscription_revenue, record_payment.period_start, record_payment.period_end);
                return { content: [{ type: "text", text: JSON.stringify({ entries_created: entries.length, entries }, null, 2) }] };
            }
            const summary = getShareBackSummaryForSlice(id);
            return { content: [{ type: "text", text: JSON.stringify({ slice_id: id, summary }, null, 2) }] };
        }
        else {
            const total = getTotalShareBackEarned(id);
            return { content: [{ type: "text", text: JSON.stringify({ member_id: id, total_earned_usd: total }, null, 2) }] };
        }
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
/**
 * excalibur_member_vote — KN105 / BP016
 */
registerTool("excalibur_member_vote", "Records a Federation member vote on an Excalibur slice (KN105/BP016). Gate 4 requires quorum (default 50% of members) + approval threshold (default 60% yes). After vote, gates are re-evaluated — if all 4 gates now pass, slice is promoted to 'excalibur_class'. BRIDLE Rule 4: borderline results default to NOT promoting.", {
    slice_id: z.string().describe("Excalibur slice ID to vote on"),
    vote: z.enum(["yes", "no"]).describe("Federation member vote"),
    total_eligible_voters: z.number().int().min(1).describe("Total eligible Federation members for quorum calculation"),
}, async ({ slice_id, vote, total_eligible_voters }) => {
    try {
        const updatedSlice = recordMemberVote(slice_id, vote, total_eligible_voters);
        return {
            content: [{ type: "text", text: JSON.stringify({
                        slice_id,
                        vote_recorded: vote,
                        current_votes: updatedSlice.tag_assignment_gates.federation_member_vote,
                        slice_status: updatedSlice.status,
                        excalibur_tag_assigned: updatedSlice.excalibur_tag_assigned,
                    }, null, 2) }],
        };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err.message }) }] };
    }
});
// ═══════════════════════════════════════════
// TOOL: get_lb_frame_tier_bounty_pay_rate (KN-H5 / BP017)
// ═══════════════════════════════════════════
/**
 * get_lb_frame_tier_bounty_pay_rate — KN-H5 / BP017 Bounty Poster Tier Scaffold
 * Three modes: bounty_class (exact), tier (primary class for tier), list_all (all 4 classes).
 * Pay-rate multipliers: Tier A × 1.0 / Tier B × 1.25 / Tier C × 1.5 / Cross-tier × 2.0.
 */
registerTool("get_lb_frame_tier_bounty_pay_rate", "Returns Bounty pay-rate metadata for LB Frame Three-Tier empirical verification tasks (KN-H5/BP017). " +
    "Three modes: (1) bounty_class — exact class lookup; " +
    "(2) tier — primary bounty class for needs/suggests/founder; " +
    "(3) list_all=true — all four classes. " +
    "Pay-rate multipliers: Tier A × 1.0 (baseline) / Tier B × 1.25 (uplift) / Tier C × 1.5 (founder replication) / Cross-tier × 2.0 (full comparison). " +
    "Scaffold for KN-H6/H7/H8 Bounty Poster Tier-testing infrastructure.", {
    bounty_class: z
        .enum([
        "tier_a_floor_verification",
        "tier_b_uplift_verification",
        "tier_c_founder_replication",
        "cross_tier_comparison",
    ])
        .optional()
        .describe("Specific Bounty class to query. Mutually exclusive with tier."),
    tier: z
        .enum(["needs", "suggests", "founder"])
        .optional()
        .describe("Returns primary Bounty class for this tier. Mutually exclusive with bounty_class."),
    list_all: z
        .boolean()
        .optional()
        .describe("If true, returns all four Bounty classes with pay-rate metadata."),
}, async ({ bounty_class, tier, list_all }) => {
    const result = handleGetTierBountyPayRate({
        bounty_class: bounty_class,
        tier: tier,
        list_all,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL: generate_tier_bounty_poster (KN-H6 / BP017)
// ═══════════════════════════════════════════
/**
 * generate_tier_bounty_poster — KN-H6 / BP017 Per-Tier Bounty Poster Generator
 * Creates a Bounty Poster instance for a given Three-Tier empirical-verification class.
 * FORK doctrine: marks_pay_rate is always Marks-class — no fiat bridge possible.
 * Four classes: tier_a_floor_verification (×1.0) / tier_b_uplift_verification (×1.25) /
 *               tier_c_founder_replication (×1.5) / cross_tier_comparison (×2.0).
 */
registerTool("generate_tier_bounty_poster", "Generates a per-tier Bounty Poster instance for LB Frame Three-Tier empirical-verification tasks (KN-H6/BP017). " +
    "Creates a TierBountyPoster with UUID, description, FORK-compliant Marks pay-rate (never fiat), " +
    "submission schema (empirical-receipt JSON fields), validation criteria (pass/fail thresholds for KN-H7), " +
    "and cohort_class_eligibility (Federation Member or higher). " +
    "Four Bounty classes: " +
    "tier_a_floor_verification (×1.0 — floor verification at default plan), " +
    "tier_b_uplift_verification (×1.25 — uplift vs Tier A), " +
    "tier_c_founder_replication (×1.5 — Founder cascade replication + Apiarist cohort uplift), " +
    "cross_tier_comparison (×2.0 — all three tiers, same submitter + same bank). " +
    "Use generate_all=true to generate all four at once. " +
    "standard_rate defaults to 100 Marks; override to set base rate before multiplier.", {
    tier_class: z
        .enum([
        "tier_a_floor_verification",
        "tier_b_uplift_verification",
        "tier_c_founder_replication",
        "cross_tier_comparison",
    ])
        .optional()
        .describe("Tier Bounty class to generate. Required unless generate_all=true. " +
        "tier_a_floor_verification=×1.0 / tier_b_uplift_verification=×1.25 / " +
        "tier_c_founder_replication=×1.5 / cross_tier_comparison=×2.0."),
    standard_rate: z
        .number()
        .positive()
        .optional()
        .describe("Base Marks rate before tier multiplier. Defaults to 100 Marks. " +
        "FORK doctrine: this is a Marks count, never a fiat amount."),
    generate_all: z
        .boolean()
        .optional()
        .describe("If true, generates all four Bounty Poster classes at once (ignores tier_class). " +
        "Returns all_posters array ordered A → B → C → Cross-tier."),
}, async ({ tier_class, standard_rate, generate_all }) => {
    const result = handleGenerateTierBountyPoster({
        tier_class: tier_class,
        standard_rate,
        generate_all,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// TOOL: validate_bounty_receipt (KN-H7 / BP017)
// ═══════════════════════════════════════════
/**
 * validate_bounty_receipt — KN-H7 / BP017 Bounty Empirical-Receipt Validator
 * Validates submitted Bounty receipts against per-tier empirical criteria.
 * Anti-marketing-class discipline: suspicious inflation flagged for Founder review.
 * BRIDLE Rule 4: borderline cases default to FAIL.
 */
registerTool("validate_bounty_receipt", "Validates a submitted Bounty empirical receipt against per-tier criteria (KN-H7/BP017). " +
    "Four Bounty classes: " +
    "tier_a_floor_verification (HOT-rate lift ≥30pp; tier_config 'needs'; valid question bank), " +
    "tier_b_uplift_verification (Cathedral lift ≥30pp; Reckoning velocity ≥2× Tier A reference), " +
    "tier_c_founder_replication (Cathedral lift ≥30pp; founder_cascade_reference; own-corpus proof), " +
    "cross_tier_comparison (all 3 tiers lift ≥30pp; same submitter; same question bank; monotone uplift). " +
    "Returns: pass (bool), margin (lift_pp − 30; positive = above threshold), " +
    "failures (array of specific unmet criteria), warnings (borderline/suspicious results for Founder review). " +
    "Anti-marketing-class discipline: lift_pp > 60pp (>20% above K477/K481/K499 50pp typical ceiling) " +
    "flags suspicious_inflation warning and routes to Founder review — no auto-approval. " +
    "BRIDLE Rule 4: borderline cases (e.g. velocity 1.5–2×) default to FAIL. " +
    "Composes with KN-H6 generate_tier_bounty_poster (provides submission_schema + validation_criteria). " +
    "KN-H8 Marks payout integration is gated on a passing validation result from this tool.", {
    bounty_id: z
        .string()
        .describe("UUID of the Bounty Poster instance being validated against (from generate_tier_bounty_poster)."),
    bounty_class: z
        .enum([
        "tier_a_floor_verification",
        "tier_b_uplift_verification",
        "tier_c_founder_replication",
        "cross_tier_comparison",
    ])
        .describe("Tier Bounty class — determines which validation criteria apply. " +
        "tier_a_floor_verification: HOT-rate ≥30pp lift; tier_config 'needs'. " +
        "tier_b_uplift_verification: Cathedral lift ≥30pp; Reckoning velocity ≥2× Tier A. " +
        "tier_c_founder_replication: Cathedral lift ≥30pp; cascade-replication evidence; own-corpus. " +
        "cross_tier_comparison: all 3 tiers ≥30pp; same submitter; same bank; monotone uplift."),
    receipt_json: z
        .record(z.unknown())
        .describe("The submitted empirical receipt as a JSON object. " +
        "Required fields per class (see generate_tier_bounty_poster for full submission_schema): " +
        "Tier A: cold_accuracy_pct, hot_accuracy_pct, lift_pp, tier_config, ai_model, " +
        "question_bank_version, run_timestamp. " +
        "Tier B: tier_b_lift_pp, reckoning_velocity_ratio, tier_a_reference_receipt, tier_config, " +
        "ai_model, run_timestamp. " +
        "Tier C: founder_cascade_reference, replication_lift_pp, corpus_folder_description, " +
        "tier_config, ai_model, run_timestamp. " +
        "Cross-tier: tier_a/b/c cold+hot accuracy, same_submitter=true, question_bank_version, " +
        "tier_a/b/c model, run_timestamps object."),
}, async ({ bounty_id, bounty_class, receipt_json }) => {
    const result = handleValidateBountyReceipt({
        bounty_id,
        bounty_class: bounty_class,
        receipt_json: receipt_json,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// TOOL: process_bounty_marks_payout (KN-H8 / BP017)
// ────────────────────────────────────────────────────────────────────────────
/**
 * process_bounty_marks_payout — KN-H8 / BP017 Bounty Marks Payout Integration
 *
 * Write-class tool — atomically processes a Bounty Marks payout when a receipt
 * has passed KN-H7 validator PASS criteria.
 *
 * FORK doctrine compliance:
 *   - Payout is Marks-class ONLY. No fiat bridge.
 *   - cash_out_bounty_marks_to_fiat DOES NOT EXIST in this codebase (structural absence).
 *   - Composes with KN105 Excalibur share-back-pay FORK-compliant precedent.
 *
 * Tier multipliers: Tier A=1.0×, Tier B=1.25×, Tier C=1.5×, Cross-tier=2.0×.
 * BRIDLE Rule 4: bare pass (margin<0.5pp) capped at 0.70 quality factor.
 * Year of Jubilee: append-only audit trail; one payout per receipt.
 */
server.tool("process_bounty_marks_payout", "KN-H8 / BP017 — Atomic Bounty Marks payout. Write-class tool. " +
    "Triggered when a bounty receipt has passed the KN-H7 validate_bounty_receipt tool. " +
    "FORK doctrine: payout is Marks-class ONLY — no fiat bridge. " +
    "cash_out_bounty_marks_to_fiat does NOT exist in this codebase (structural absence). " +
    "Tier multipliers: Tier A=1.0×, Tier B=1.25×, Tier C=1.5×, Cross-tier=2.0×. " +
    "BRIDLE Rule 4 Phase B5: bare pass (margin<0.5pp) → completion_quality_factor capped at 0.70. " +
    "Year of Jubilee append-only ledger: no mutation, no deletion, one payout per receipt. " +
    "Gates: pass=true, Founder review clear (requires_founder_review=false OR founder_review_status='approved'), " +
    "not already paid. " +
    "Updates: bounty_payout_ledger (append) + profiles.current_marks_balance (+marks_earned) + " +
    "backed_marks_ledger (source=bounty_payout, direction=credit). " +
    "Membership-orthogonal: $5/year is access-gate only; bounty payouts are LB-currency-class.", {
    receipt_id: z
        .string()
        .describe("UUID of the bounty_receipts_validation_log row to pay out. " +
        "Obtain from the validate_bounty_receipt tool output (validation.bounty_id is the poster; " +
        "the log row id is the receipt_id for payout)."),
    member_id: z
        .string()
        .describe("UUID of the member receiving the Marks payout. " +
        "Must match the submitted_by field on the validation log row."),
    standard_rate: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Base Marks rate before tier multiplier. Default: 100 Marks. " +
        "marks_earned = floor(standard_rate × tier_multiplier × completion_quality_factor). " +
        "Tier multipliers: A=1.0×, B=1.25×, C=1.5×, Cross=2.0×."),
}, async ({ receipt_id, member_id, standard_rate }) => {
    const result = await handleProcessBountyMarksPayout({
        receipt_id,
        member_id,
        standard_rate,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // K448 addendum: clear the post_build_reload lock written by build-guarded.mjs.
    // Signals that this new process successfully started and is ready for tool calls.
    clearPostBuildReloadLock();
    console.error("The Librarian MCP Server is running (stdio transport)");
}
// ─── KN-I1: Reminder Scribe MCP tools ───────────────────────────────────────
/**
 * reminder_scribe_check — read-only pre-send pattern-match check.
 * Runs the Reminder Scribe engine against a response draft and returns
 * violations + correction proposals. DOES NOT log to Detective TEAM.
 * Use reminder_scribe_log_violation to write violation events.
 *
 * BRIDLE Rule 4: engine failure → error_receipt (never silently passes).
 */
server.tool("reminder_scribe_check", "KN-I1 / BP017 — Reminder Scribe pre-send pattern-match check (READ-ONLY). " +
    "Runs the Reminder Scribe engine against an AI cohort response draft. " +
    "Detects discipline violations (R-KP-1 bare K-prompt path, R-KP-2 file-not-found, " +
    "R-KP-3 queued-as-path, R-FORK-1 fiat-bridge, R-PRAISE-1/2 unanchored praise, etc.). " +
    "Returns violations + correction proposals + engine stats. " +
    "BRIDLE Rule 4: engine failure surfaces error_receipt — never silently passes. " +
    "Composes with Catechist session-open grading + Bouncer-Scales-Judge BP011 KN095. " +
    "For violation write-back to Detective TEAM use reminder_scribe_log_violation.", {
    response_draft: z
        .string()
        .min(1)
        .max(50_000)
        .describe("The AI cohort member response draft text to check for violations."),
    session_id: z
        .string()
        .optional()
        .describe("Current session ID (e.g. B135) — used in violation event metadata."),
    override_preferences: z
        .object({
        knight_kprompt_path_format: z.enum(["full_path", "bare_filename", "markdown_link"]).optional(),
        knight_kprompt_file_existence_check: z.enum(["strict", "relaxed"]).optional(),
        discipline_violation_pre_send_check: z.enum(["enabled", "disabled"]).optional(),
        bishop_intent_vs_ready_distinction: z.enum(["strict", "relaxed"]).optional(),
    })
        .optional()
        .describe("Override Reminder Scribe Preferences from canonical defaults."),
}, async ({ response_draft, session_id: _session_id, override_preferences }) => {
    try {
        const result = runReminderScribeCheck(response_draft, {
            preferences: override_preferences ?? {},
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...result,
                        note: result.clean
                            ? "Response cleared for send."
                            : `${result.violations_found} violation(s) detected. Review and apply corrections or use reminder_scribe_log_violation to record override.`,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "reminder_scribe_check engine error",
                        detail: String(err),
                        bridle_rule_4: "HALT — engine failure. Response NOT cleared for send.",
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
/**
 * reminder_scribe_log_violation — write-class tool.
 * Records a violation/correction event to the Detective TEAM provenance substrate.
 * Called after Bishop reviews a flag and either applies correction or overrides.
 * Marks-cost logic is enforced here for marks-cost class overrides.
 */
server.tool("reminder_scribe_log_violation", "KN-I1 / BP017 — Reminder Scribe violation/correction write-back (WRITE-CLASS). " +
    "Records violation + correction or override decision to Detective TEAM provenance substrate. " +
    "Called after AI cohort member reviews a reminder_scribe_check flag. " +
    "Marks-cost applies when override_used=true AND violation override_class='marks-cost'. " +
    "STRUCTURALLY-IMMUTABLE violations (R-FORK-1) cannot be overridden — reject call if attempted. " +
    "Appends to pheromone substrate with event_type=reminder_scribe_violation_correction. " +
    "Composes with KN104 Detective TEAM PRE-COLOSSUS substrate-write-back (5e7f540).", {
    session_id: z
        .string()
        .describe("Current session ID (e.g. B135) — used in violation event metadata."),
    rule_id: z
        .string()
        .describe("Rule ID that triggered the violation (e.g. R-KP-2, R-FORK-1)."),
    rule_class: z
        .string()
        .describe("Violation class (e.g. high-stakes, founder-mandatory, fork)."),
    violation_confirmed: z
        .boolean()
        .describe("Whether the AI cohort member confirmed the violation as real (vs. false-positive)."),
    correction_applied: z
        .boolean()
        .describe("Whether the correction proposal was applied to the response draft."),
    override_used: z
        .boolean()
        .describe("Whether the violation was overridden without applying the correction."),
    override_class: z
        .enum(["free", "marks-cost", "structurally-immutable"])
        .describe("Override class of the violated rule."),
    response_excerpt: z
        .string()
        .max(200)
        .optional()
        .describe("Short excerpt of the violating text from the response draft (max 200 chars)."),
    memory_pointer: z
        .string()
        .optional()
        .describe("Memory file or canon Eblet that sources this rule."),
    correction_proposal_excerpt: z
        .string()
        .max(300)
        .optional()
        .describe("Correction proposal excerpt (max 300 chars)."),
}, async ({ session_id, rule_id, rule_class, violation_confirmed, correction_applied, override_used, override_class, response_excerpt, memory_pointer, correction_proposal_excerpt, }) => {
    try {
        // Structurally-immutable violations cannot be overridden
        if (override_class === "structurally-immutable" && override_used && !correction_applied) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "STRUCTURALLY-IMMUTABLE violation cannot be overridden.",
                            rule_id,
                            guidance: "FORK-class violations (e.g. R-FORK-1 LB-currency-to-fiat) are constitutionally locked. " +
                                "Apply the correction and set correction_applied=true to proceed.",
                        }, null, 2),
                    }],
                isError: true,
            };
        }
        const marks_cost = override_class === "marks-cost" && override_used ? 1 : 0;
        const event = {
            event_type: "reminder_scribe_violation_correction",
            session_id,
            rule_id,
            rule_class,
            violation_confirmed,
            correction_applied,
            override_used,
            override_marks_cost: marks_cost,
            timestamp: new Date().toISOString(),
            response_excerpt: response_excerpt ?? "",
            memory_pointer: memory_pointer ?? "",
            correction_proposal_excerpt: correction_proposal_excerpt ?? "",
        };
        // Write to dedicated violation log (Catechist KN-I2 reads this for rolling-7d summary)
        const logDir = resolve(dirname(__filename), "../stitchpunks/reminder_scribe");
        mkdirSync(logDir, { recursive: true });
        const logPath = resolve(logDir, "violation_log.jsonl");
        appendFileSync(logPath, JSON.stringify(event) + "\n", "utf-8");
        // KN-I3: Write-back to RS provenance ledger with Cathedral-prefixed serial + Chronos HMAC
        const writeBackOpts = {
            ai_member: "bishop", // default; session actor is typically Bishop
            session_id,
            event_type: (correction_applied ? "correction_applied"
                : override_used ? "override_applied"
                    : "violation_detected"),
            rule_id,
            rule_class,
            violation_pattern_match_score: violation_confirmed ? 0.95 : 0.70,
            violation_excerpt: response_excerpt ?? "",
            pre_send_block_triggered: override_class === "structurally-immutable" || override_class === "marks-cost",
            correction_applied,
            correction_applied_at: correction_applied ? new Date().toISOString() : null,
            correction_proposal: correction_proposal_excerpt ?? "",
            override_applied: override_used,
            override_marks_cost: override_class === "marks-cost" && override_used ? 1 : 0,
            override_rationale: override_used && !correction_applied ? "Override applied by AI cohort member" : null,
            override_class,
            feedback_memory_pointer: memory_pointer ?? "",
            post_send_audit_only: false,
        };
        writeBackViolationEvent(writeBackOpts);
        // Also emit to pheromone substrate for Detective TEAM provenance (KN104)
        emitPheromone("ReminderScribe", `reminder_scribe_violation_${rule_id}_${session_id}`, JSON.stringify(event), {
            cathedral: "knight",
            synthesisClass: "reminder_scribe_violation_correction",
            flavorClass: { domain: "discipline", cognition: "violation-correction", audience: "internal" },
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        logged: true,
                        event,
                        marks_cost_applied: marks_cost,
                        note: marks_cost > 0
                            ? `${marks_cost} Mark(s) cost logged for override of marks-cost class violation ${rule_id}.`
                            : "No marks cost for this override class.",
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "reminder_scribe_log_violation write error",
                        detail: String(err),
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
// ─── KN-I4: Reminder Scribe metrics query MCP tool ───────────────────────────
/**
 * reminder_scribe_metrics_query — empirical-receipt dashboard data query.
 * Returns per-discipline-rule violation/correction metrics + FORK-class alert.
 * Supports filter parameters: window, ai_member, rule_class, visibility_scope.
 *
 * Anti-shame: empirical counts/rates/trends ONLY. No moral judgment language.
 * BRIDLE Rule 4: data_available=false surfaces UNAVAILABLE — never stale zeros.
 * Privacy: personal/federation_aggregate/public_aggregate scopes enforced.
 */
server.tool("reminder_scribe_metrics_query", "KN-I4 / BP017 — Reminder Scribe empirical-receipt metrics dashboard (READ-ONLY). " +
    "Returns per-discipline-rule violation/correction metrics + correction-stickiness + FORK-class CRITICAL alert. " +
    "Filter params: window (7d/30d/90d/all_time), ai_member (bishop/knight/pawn/rook/all), " +
    "rule_class_prefix (R-KP/R-PRAISE/R-FORK/R-DOUBLE-FILE/R-COUNSEL/R-USPTO/all). " +
    "Anti-shame: empirical numbers only — no moral judgment in output. " +
    "BRIDLE Rule 4: data_available=false → UNAVAILABLE (never stale zeros). " +
    "FORK-class alert: is_critical=true requires immediate Founder review. " +
    "Optionally format as markdown summary (format=markdown). " +
    "Composes with KN-I1 Reminder Scribe core + KN-I2 Catechist + KN-I3 provenance chain.", {
    window: z
        .enum(["7d", "30d", "90d", "all_time"])
        .optional()
        .describe("Rolling time window for metrics aggregation (default: 7d)."),
    ai_member: z
        .enum(["bishop", "knight", "pawn", "rook", "shadow_alpha", "shadow_beta", "all"])
        .optional()
        .describe("Filter by AI member (default: all)."),
    rule_class_prefix: z
        .enum(["R-KP", "R-PRAISE", "R-FORK", "R-DOUBLE-FILE", "R-COUNSEL", "R-USPTO", "all"])
        .optional()
        .describe("Filter by rule class prefix (default: all)."),
    drift_threshold_pct: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe("Correction-stickiness below this % triggers drift flag (default: 80)."),
    format: z
        .enum(["json", "markdown"])
        .optional()
        .describe("Output format: json (default) or markdown summary."),
    visibility_scope: z
        .enum(["personal", "federation_aggregate", "public_aggregate"])
        .optional()
        .describe("Privacy visibility scope (default: personal)."),
}, async ({ window: w, ai_member, rule_class_prefix, drift_threshold_pct, format, visibility_scope: _vs }) => {
    try {
        const opts = {
            window: w ?? "7d",
            ai_member: ai_member ?? "all",
            rule_class_prefix: rule_class_prefix ?? "all",
            drift_threshold_pct: drift_threshold_pct ?? 80,
        };
        const payload = buildMetricsDashboard(opts);
        if (format === "markdown") {
            return {
                content: [{
                        type: "text",
                        text: formatMetricsSummaryMarkdown(payload),
                    }],
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...payload,
                        fork_class_critical: payload.fork_class_alert.is_critical,
                        note: payload.data_available
                            ? `Metrics for ${opts.window} window. ${payload.total_violations} violation(s), ${payload.total_corrections} correction(s).`
                            : "DATA UNAVAILABLE — do not interpret as zero violations.",
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "reminder_scribe_metrics_query error",
                        detail: String(err),
                        bridle_rule_4: "Data unavailable — do not interpret as zero violations.",
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
// ─── KN-I3: Reminder Scribe query history + drain retry MCP tools ────────────
/**
 * reminder_scribe_query_history — read-only provenance chain query.
 * Returns violation/correction history from the RS provenance ledger
 * with optional filters (ai_member, rule_id, event_type, rolling_days).
 * Aggregated per-rule for Catechist-class consumption.
 *
 * Composes with KN-I2 Catechist rolling-7d violation-rate analytics.
 */
server.tool("reminder_scribe_query_history", "KN-I3 / BP017 — Reminder Scribe violation/correction provenance query (READ-ONLY). " +
    "Returns RS provenance ledger entries with Cathedral-prefixed serials + Chronos HMACs. " +
    "Optional filters: ai_member, rule_id, event_type, rolling_days. " +
    "Returns both raw entries and per-rule aggregate (total_violations, corrections, overrides, marks_spent, stickiness_pct). " +
    "Composes with KN-I2 Catechist rolling-7d summary. " +
    "FORK compliance: override_marks_cost is Marks-class; no fiat conversion. " +
    "Drain retry queue: use reminder_scribe_drain_retry to flush substrate-unavailable events.", {
    ai_member: z
        .enum(["bishop", "knight", "pawn", "rook", "shadow_alpha", "shadow_beta", "any"])
        .optional()
        .describe("Filter by AI member (omit or 'any' for all members)."),
    rule_id: z
        .string()
        .optional()
        .describe("Filter by rule ID (e.g. 'R-KP-1', 'R-FORK-1')."),
    event_type: z
        .enum(["violation_detected", "correction_applied", "override_applied"])
        .optional()
        .describe("Filter by event type."),
    rolling_days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .optional()
        .describe("Rolling window in days (default: 7)."),
    limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .describe("Max entries to return (default: 100)."),
    include_aggregate: z
        .boolean()
        .optional()
        .describe("If true, includes per-rule aggregate alongside raw entries (default: true)."),
}, async ({ ai_member, rule_id, event_type, rolling_days, limit, include_aggregate }) => {
    try {
        const entries = queryRsHistory({
            ai_member: ai_member === "any" ? undefined : ai_member,
            rule_id,
            event_type: event_type,
            rolling_days: rolling_days ?? 7,
            limit: limit ?? 100,
        });
        const aggregate = (include_aggregate !== false)
            ? aggregateByRule(entries)
            : undefined;
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        rolling_days: rolling_days ?? 7,
                        entry_count: entries.length,
                        entries,
                        aggregate,
                        note: `RS provenance ledger query. ${entries.length} entries in rolling ${rolling_days ?? 7}-day window.`,
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "reminder_scribe_query_history error",
                        detail: String(err),
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
/**
 * reminder_scribe_drain_retry — drain local retry queue to provenance ledger.
 * Called at substrate-recovery time per BRIDLE Rule 4 eventually-consistent pattern.
 */
server.tool("reminder_scribe_drain_retry", "KN-I3 / BP017 — Drain Reminder Scribe local retry queue to RS provenance ledger (WRITE-CLASS). " +
    "Flushes events queued during substrate-unavailable windows. " +
    "BRIDLE Rule 4 eventually-consistent recovery pattern. " +
    "Returns count of drained + failed entries + any errors.", {}, async () => {
    try {
        const result = drainRetryQueue();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        drained: result.drained,
                        failed: result.failed,
                        errors: result.errors,
                        note: result.drained > 0
                            ? `${result.drained} event(s) drained from retry queue to RS provenance ledger.`
                            : "Retry queue empty — nothing to drain.",
                    }, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "reminder_scribe_drain_retry error",
                        detail: String(err),
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
// ─── KN-I2: Catechist session-open grade MCP tool ────────────────────────────
/**
 * catechist_session_open_grade — session-open discipline grading.
 * Runs R01-R10 base checklist + Reminder Scribe violation-history-summary
 * (rolling 7-day window) per AI member. Anti-shame: empirical counts/rates only.
 *
 * KN036 (base R01-R10) + KN-I2 extension (violation-history-summary block).
 * BRIDLE Rule 4: if violation log unavailable, surfaces empty-history + flag.
 *
 * Substrate write-back: logs catechist_violation_summary provenance event
 * to pheromone substrate (KN104 Detective TEAM pattern).
 */
server.tool("catechist_session_open_grade", "KN-I2 / BP017 — Catechist session-open discipline grade (R01-R10 + Reminder Scribe violation history). " +
    "Extends Catechist (#2313 KN036 BP004) with per-AI-member rolling-7-day violation-count + correction-stickiness. " +
    "Anti-shame discipline: empirical counts/rates only — no moral judgment. " +
    "Returns structured grade: R01-R10 PASS/WARN/FAIL/SKIP + violation-history table. " +
    "Optionally returns formatted Markdown for session-open display. " +
    "BRIDLE Rule 4: if KN-I1 violation log unavailable, surfaces UNAVAILABLE flag + empty-history. " +
    "Substrate write-back: catechist_violation_summary provenance logged to pheromone. " +
    "Composes with Reminder Scribe KN-I1 + Bouncer-Scales-Judge KN095 BP011.", {
    session_id: z
        .string()
        .describe("Current session ID (e.g. B135) — used in grade output and provenance."),
    ai_member: z
        .enum(["bishop", "knight", "pawn", "rook"])
        .describe("AI cohort member being graded."),
    evidence: z
        .object({
        brief_me_called_first: z.boolean().optional()
            .describe("Was brief_me the first tool called at session-open?"),
        fiat_bridge_detected: z.boolean().optional()
            .describe("Was any LB-currency-to-fiat conversion language detected in this session?"),
        kprompt_paths_referenced: z.boolean().optional()
            .describe("Were any K-prompt paths referenced in this session?"),
        kprompt_paths_verified: z.boolean().optional()
            .describe("Were all referenced K-prompt paths verified to exist on disk?"),
        canon_eblet_write_proposed: z.boolean().optional()
            .describe("Was a new canon Eblet write proposed in this session?"),
        prior_detective_fanout: z.boolean().optional()
            .describe("Was Detective TEAM fan-out done before any canon Eblet write proposal?"),
        session_debrief_done: z.boolean().optional()
            .describe("Was moneypenny_debrief (or equivalent) called at session-close?"),
    })
        .describe("Session evidence for R01-R10 grading. Omit fields you have no evidence for (graded as SKIP)."),
    format: z
        .enum(["json", "markdown"])
        .optional()
        .describe("Output format. 'json' returns structured data; 'markdown' returns formatted display text. Default: json."),
}, async ({ session_id, ai_member, evidence, format }) => {
    try {
        const result = runSessionOpenGrade(session_id, ai_member, evidence);
        // Substrate write-back: catechist_violation_summary provenance (KN104 pattern)
        const summaryText = `Catechist grade ${session_id} ${ai_member}: ${result.overall_verdict} | violations_7d=${result.violation_history_summary.total_violations_7d} | stickiness=${result.violation_history_summary.overall_stickiness_pct}%`;
        emitPheromone("Catechist", `catechist_grade_${session_id}_${ai_member}`, summaryText, {
            cathedral: "bishop",
            synthesisClass: "catechist_violation_summary",
            flavorClass: { domain: "discipline", cognition: "discipline-class", audience: "bishop-substrate" },
        });
        if (format === "markdown") {
            return {
                content: [{
                        type: "text",
                        text: formatGradeMarkdown(result),
                    }],
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: "catechist_session_open_grade error",
                        detail: String(err),
                        bridle_rule_4: "HALT — grade engine failure. Review catechist/grader.ts.",
                    }, null, 2),
                }],
            isError: true,
        };
    }
});
// ─── KN-J1: House Scribe MCP tools ───────────────────────────────────────────
/**
 * house_scribe_create_jar — write-class
 * Triggered by Hive-thread closure (KN-D3 closed state).
 * Creates a new Jar of Honey in 'created' state. Emits Pixie Dust event.
 */
server.tool("house_scribe_create_jar", "KN-J1 / BP017 — House Scribe: create a new Jar of Honey in 'created' state. " +
    "Triggered by Hive-thread closure (KN-D3 closed transition). " +
    "Jar lifecycle: created → indexed → sealed → retrievable. " +
    "Jar creation = Layer 6 Pixie Dust event (pheromone substrate write). " +
    "BRIDLE Rule 4: on creation failure, returns error + halt; never seals incomplete data. " +
    "Composes with KN-D3 Hive-thread state machine + KN104 provenance chain.", {
    cathedral: z.enum(["bishop", "knight", "pawn", "rook"]).describe("Cathedral this Jar belongs to."),
    source_hive_thread_id: z.string().describe("Apiarist Hive thread ID that produced this Honey (closure event)."),
    content_type: z
        .enum(["synthesis", "comb_artifact", "royal_jelly_class", "innovation_corpus", "session_archive", "detective_finding"])
        .describe("Content class of this Jar."),
    content_summary: z.string().max(500).describe("Human-readable summary of Jar contents (max 500 chars)."),
    content_blob_pointer: z.string().describe("Pointer to actual content (IPFS hash / object-storage key / path)."),
    contributing_members: z.array(z.string()).optional().describe("Member IDs who contributed to this Hive thread."),
    queen_member_id: z.string().optional().describe("Member ID of the Hive thread Queen at closure."),
    excalibur_class_eligible: z.boolean().optional().describe("Whether this Jar can be Federation-promoted to Excalibur Class. Default: true."),
    read_cohort_minimum: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Minimum cohort required to read this Jar. Default: lone_wolf."),
    write_cohort_minimum: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Minimum cohort required to write to this Jar. Default: federation_member."),
}, async (args) => {
    try {
        const result = createJar(args);
        if (!result.success) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: result.error, bridle_rule_4: "HALT — Jar creation failed. Do not seal incomplete data." }, null, 2) }],
                isError: true,
            };
        }
        // Emit Pixie Dust pheromone event (Layer 6 Jar creation)
        try {
            emitPheromone("house_scribe", result.jar.jar_id, `Jar ${result.jar.jar_id} created from Hive-thread ${args.source_hive_thread_id} (Layer 6 Pixie Dust)`, { synthesisClass: "house_scribe_jar_created" });
        }
        catch {
            // non-fatal pheromone write failure
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, jar: result.jar }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), bridle_rule_4: "HALT — Jar creation error." }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_seal_jar — write-class
 * Finalizes Jar provenance: assigns Cathedral-prefixed HS serial + Chronos HMAC.
 * Jar becomes STRUCTURALLY-IMMUTABLE (forever-stamp class) after this call.
 * Requires jar to be in 'indexed' state (coordinate must be assigned via KN-J2).
 */
server.tool("house_scribe_seal_jar", "KN-J1 / BP017 — House Scribe: seal a Jar of Honey (forever-stamp class). " +
    "Assigns Cathedral-prefixed serial LB-{CAT}.HS-NNNN + Chronos HMAC. " +
    "Jar becomes STRUCTURALLY-IMMUTABLE after sealing — no mutation allowed (FORK doctrine). " +
    "Requires jar in 'indexed' state with coordinate assigned. " +
    "Transitions: indexed → sealed → retrievable (both in one atomic operation). " +
    "BRIDLE Rule 4: if jar not in correct state, returns error; never seals incomplete data.", {
    jar_id: z.string().describe("UUID of the Jar to seal."),
}, async ({ jar_id }) => {
    try {
        const result = sealJar(jar_id);
        if (!result.success) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: result.error, bridle_rule_4: "HALT — Jar seal failed. Check state and coordinate." }, null, 2) }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, jar: result.jar, serial: result.serial, chronos_hmac: result.hmac }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_query_jars — read-class
 * Queries Jars by coordinate, flavor-class (content_type), member, state, or cathedral.
 * Respects cohort-class access control.
 */
server.tool("house_scribe_query_jars", "KN-J1 / BP017 — House Scribe: query Jars of Honey by coordinate / content type / member / state / cathedral. " +
    "Cohort-class access control enforced: requester's cohort must meet jar's read_cohort_minimum. " +
    "Returns list of Jars matching query filters. " +
    "Composes with Detective TEAM read-side (KN104) for provenance queries.", {
    state: z
        .enum(["created", "indexed", "sealed", "retrievable"])
        .optional()
        .describe("Filter by lifecycle state."),
    cathedral: z
        .enum(["bishop", "knight", "pawn", "rook"])
        .optional()
        .describe("Filter by cathedral."),
    coordinate: z.string().optional().describe("Filter by 8-digit-grid coordinate (e.g. '04-05-03-17')."),
    content_type: z
        .enum(["synthesis", "comb_artifact", "royal_jelly_class", "innovation_corpus", "session_archive", "detective_finding"])
        .optional()
        .describe("Filter by content type (flavor-class)."),
    excalibur_eligible: z.boolean().optional().describe("Filter by Excalibur-class eligibility."),
    requester_cohort: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Requester's cohort class — used for access control filtering. Omit to return all accessible jars."),
    limit: z.number().int().min(1).max(500).optional().describe("Max jars to return. Default: 100."),
}, async (args) => {
    try {
        const jars = queryJars(args);
        return {
            content: [{ type: "text", text: JSON.stringify({ count: jars.length, jars }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_population_audit — read-class
 * Surfaces current House Scribe population-ratio + scaling recommendations.
 * Counts substrate-class items vs. current HS instance count.
 * BRIDLE Rule 4: failure surfaces unavailable flag; never silently scales wrong.
 */
server.tool("house_scribe_population_audit", "KN-J1 / BP017 — House Scribe: population-ratio audit. " +
    "Counts substrate-class items (Pheromone records / Cathedral tablets / LB Frame instances / active Hive threads). " +
    "Compares to current House Scribe count. Surfaces spawn/archive recommendations and drift alerts. " +
    "Starting ratios: 1 HS per 10K Pheromone records; 1 HS per 5K Cathedral tablets (configurable via Preferences). " +
    "Alert when ratio drifts ±20% from target. " +
    "BRIDLE Rule 4: audit failure returns data_available=false; never silently scales wrong.", {
    population_ratio_pheromone_records: z.number().int().min(1000).max(100000).optional()
        .describe("Override: Pheromone records per House Scribe. Default: 10000."),
    population_audit_interval_minutes: z.number().int().min(5).max(1440).optional()
        .describe("Override: cron interval in minutes. Default: 60."),
    lru_eviction_enabled: z.enum(["enabled", "disabled"]).optional()
        .describe("Override: whether idle House Scribes archive when ratio drops. Default: enabled."),
}, async (prefs) => {
    try {
        const result = runPopulationAudit(prefs);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), data_available: false }, null, 2) }],
            isError: true,
        };
    }
});
// ─── KN-J2: House Scribe coordinate tools ─────────────────────────────────────
/**
 * house_scribe_assign_coordinate — write-class
 * Assigns an 8-digit grid coordinate to a Jar at its `indexed` transition.
 * Handles cell-overflow Swarming (daughter-cell at adjacent flavor-class).
 */
server.tool("house_scribe_assign_coordinate", "KN-J2 / BP017 — House Scribe: assign 8-digit grid coordinate to a Jar (indexed state transition). " +
    "Coordinate: NN-NN-NN-NN (cathedral × tier × flavor-class × jar-slot). " +
    "Extends Multi-Trail BP015 P3 2D to 4D. Cell capacity: 100 Jars. " +
    "Cell overflow → Swarming: daughter-cell spawned at adjacent flavor-class. " +
    "BRIDLE Rule 4: collision detected → HALT; overflow exhausted → HALT. " +
    "Composes with KN-J1 Jar lifecycle (created → indexed transition).", {
    jar_id: z.string().describe("UUID of the Jar to assign a coordinate."),
    cathedral: z.enum(["bishop", "knight", "pawn", "apiarist_tribe_hive", "apiarist_family_hive", "apiarist_project_hive", "apiarist_guild_hive"]).describe("Cathedral this Jar belongs to (determines digits 1-2)."),
    content_type: z.enum(["synthesis", "comb_artifact", "royal_jelly_class", "innovation_corpus", "session_archive", "detective_finding"]).describe("Content type — determines tier and flavor-class derivation."),
    tier_override: z.string().regex(/^\d{2}$/).optional().describe("Override tier ID (01-07, 99). Default: derived from content_type."),
    flavor_override: z.string().regex(/^\d{2}$/).optional().describe("Override flavor ID (01-06, 99). Default: derived from content_type."),
}, async (args) => {
    try {
        const result = assignCoordinate(args);
        if (!result.success) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: result.error, collision_detected: result.collision_detected, bridle_rule_4: result.bridle_rule_4 }, null, 2) }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, coordinate: result.coordinate, swarmed: result.swarmed, jar: result.jar }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_query_jars_by_coordinate — read-class
 * Queries Jars by 8-digit coordinate: exact, wildcard, range, or cross-cathedral.
 * BRIDLE Rule 4: result-set capped at 1,000 entries.
 */
server.tool("house_scribe_query_jars_by_coordinate", "KN-J2 / BP017 — House Scribe: coordinate-based Jar query. " +
    "Pattern: exact '01-06-02-05', wildcard '01-*-*-*' (all bishop Jars), " +
    "range '01-06-01..06-*' (bishop/freeway flavors 01-06), cross-cathedral '99-*-*-*'. " +
    "BRIDLE Rule 4: result-set capped at 1,000 entries; use offset for paging. " +
    "Composes with KN-J1 queryJars + KN-J3 living-gridwork freshness.", {
    pattern: z.string().describe("Coordinate query pattern (exact, wildcard *, or range NN..NN)."),
    limit: z.number().int().min(1).max(1000).optional().describe("Max results. Default and max: 1000."),
    offset: z.number().int().min(0).optional().describe("Pagination offset. Default: 0."),
}, async ({ pattern, limit, offset }) => {
    try {
        const result = queryJarsByCoordinate(pattern, { limit, offset });
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), data_available: false }, null, 2) }],
            isError: true,
        };
    }
});
// ─── KN-J3: House Scribe Living Gridwork MCP tools ───────────────────────────
/**
 * house_scribe_cell_event — write-class
 * Fires a Pheromone-write/Pixie-Dust event on a cell, triggering
 * sub-ms cell-state-update per the Augur Living Gate pattern.
 */
server.tool("house_scribe_cell_event", "KN-J3 / BP017 — House Scribe: fire Pixie Dust / Pheromone-write event on a grid cell. " +
    "Triggers Augur Living Gate sub-ms cell-state-update (jar_count + density + decay). " +
    "Sets cell living=true for living_window_ms (default 60s). " +
    "Composes with KN-J1 Jar lifecycle + KN-J2 coordinate scheme + Pheromone substrate (#2317). " +
    "BRIDLE Rule 4: failure surfaces error + flag; no silent state corruption.", {
    coordinate: z.string().describe("8-digit grid coordinate (e.g. '01-06-02-05')."),
    event_type: z
        .enum(["pheromone_write", "jar_added", "jar_sealed", "cell_reconciled", "fallback_poll"])
        .describe("Type of event triggering cell-state update."),
    jar_id: z.string().optional().describe("Jar ID involved in the event (if applicable)."),
    detail: z.string().optional().describe("Human-readable event detail."),
    living_window_ms: z.number().int().min(1000).max(3600000).optional()
        .describe("Override: time window (ms) during which cell is living after last event. Default: 60000."),
}, async (args) => {
    try {
        const result = updateCellOnEvent(args);
        if (!result.success) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: result.error, bridle_rule_4: result.bridle_rule_4 }, null, 2) }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, cell: result.cell, processing_ms: result.processing_ms }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_query_living_cell — read-class
 * Returns LivingCellState for a coordinate (jar_count + density + decay + living flag).
 * BRIDLE Rule 4: data_available=false if state unavailable.
 */
server.tool("house_scribe_query_living_cell", "KN-J3 / BP017 — House Scribe: query living cell state for a coordinate. " +
    "Returns LivingCellState: jar_count + cell_density_score + decay_score + living flag. " +
    "living=true while Pheromone events flow; false after silence window (default 60s). " +
    "BRIDLE Rule 4: data_available=false if state unavailable; fallback_polling flag set when Augur unavailable.", {
    coordinate: z.string().describe("8-digit coordinate or cell prefix (e.g. '01-06-02-05' or '01-06-02')."),
}, async ({ coordinate }) => {
    try {
        const result = queryLivingCell(coordinate);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), data_available: false }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_gridwork_snapshot — read-class
 * Returns a full living-gridwork snapshot: all tracked cells with current state.
 */
server.tool("house_scribe_gridwork_snapshot", "KN-J3 / BP017 — House Scribe: full living-gridwork snapshot. " +
    "Returns all tracked cells with living flag + jar_count + density + decay. " +
    "Includes living/dead/fallback cell counts. " +
    "BRIDLE Rule 4: data_available=false on failure; never silent state corruption.", {}, async () => {
    try {
        const snapshot = buildGridworkSnapshot();
        return {
            content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), data_available: false }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_reconcile_cells — write-class
 * Detect and reconcile cell-state inconsistencies against KN-J1 ledger.
 * BRIDLE Rule 4: flags + reconciles; never silently leaves inconsistent state.
 */
server.tool("house_scribe_reconcile_cells", "KN-J3 / BP017 — House Scribe: detect and reconcile cell-state inconsistencies. " +
    "Compares cached cell state against KN-J1 jars ledger (source-of-truth). " +
    "Flags inconsistencies + reconciles. BRIDLE Rule 4 required before any seal operation.", {}, async () => {
    try {
        const result = detectAndReconcileInconsistencies();
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
// ─── KN-J4: Apiarist Hive Subscriber ─────────────────────────────────────────
/**
 * house_scribe_hive_thread_closed — write-class
 * Called when a Hive thread transitions active → closed (KN-D3).
 * Orchestrates: create Jar → assign coordinate → living-gridwork → seal Jar.
 * Bee-canon role mapping: Workers/Drones/Queen → Marks-attribution.
 * BRIDLE Rule 4: incomplete synthesis halts Jar creation.
 * FORK doctrine: Marks-attribution NEVER bridges to fiat.
 */
server.tool("house_scribe_hive_thread_closed", "KN-J4 / BP017 — House Scribe: handle Hive-thread closure event. " +
    "Receives thread_closed_with_synthesis event (KN-D3). " +
    "Orchestrates Jar creation (KN-J1) → coordinate assignment (KN-J2) → " +
    "living-gridwork registration (KN-J3) → seal. " +
    "Computes bee-canon Marks-attribution (Workers/Drones pro-rata; Queen supervisor multiplier; " +
    "Project-cohort GREATER % multiplier). " +
    "BRIDLE Rule 4: incomplete synthesis halts creation + flags for Queen review. " +
    "FORK doctrine: Marks-attribution is LB-currency ONLY — no fiat conversion.", {
    thread_id: z.string().describe("Unique Hive-thread ID (from KN-D3 state machine)."),
    cathedral: z.string().describe("Cathedral identifier: bishop, knight, pawn, rook, cross."),
    cohort_type: z
        .enum(["tribe", "family", "guild", "project"])
        .describe("Hive cohort class. project triggers GREATER % Marks-attribution multiplier."),
    closed_at: z.string().describe("ISO-8601 timestamp when thread closed."),
    synthesis_summary: z.string().describe("Synthesis summary text (max 500 chars). Empty → BRIDLE Rule 4 HALT."),
    synthesis_blob_pointer: z.string().describe("Object-storage key / IPFS CID for synthesis blob. Empty → BRIDLE Rule 4 HALT."),
    contributors: z
        .array(z.object({
        member_id: z.string(),
        role: z.enum(["worker", "drone", "queen"]),
        contribution_weight: z.number().min(0).max(1),
        drone_specialty: z.string().optional(),
    }))
        .describe("Contributor records. Workers/Drones pro-rata; Queen earns supervisor multiplier."),
    queen_member_id: z.string().nullable().describe("Member ID of the Queen supervisor. Null if no Queen at closure."),
    content_type: z
        .enum(["synthesis", "comb_artifact", "royal_jelly_class", "innovation_corpus", "session_archive", "detective_finding"])
        .optional()
        .describe("KN-J1 content type for coordinate assignment. Defaults to 'synthesis' for Hive thread closures."),
    read_cohort_minimum: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Minimum cohort level to read this Jar (KN-J1 CohortMinimum)."),
    write_cohort_minimum: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Minimum cohort level to write to this Jar (KN-J1 CohortMinimum)."),
    total_marks_pool: z.number().optional().describe("Optional total Marks pool for this thread (attribution context)."),
}, async ({ thread_id, cathedral, cohort_type, closed_at, synthesis_summary, synthesis_blob_pointer, contributors, queen_member_id, content_type, read_cohort_minimum, write_cohort_minimum, total_marks_pool }) => {
    try {
        const event = {
            thread_id,
            cathedral,
            cohort_type,
            closed_at,
            synthesis_summary,
            synthesis_blob_pointer,
            contributors,
            queen_member_id,
            content_type,
            read_cohort_minimum,
            write_cohort_minimum,
            total_marks_pool,
        };
        const result = onThreadClosedWithSynthesis(event);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: result.success === false,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_apiarist_hive_jar_status — read-class
 * Query Jars created from a specific Hive thread (by thread_id).
 * Returns Jar state + Marks-attribution breakdown.
 */
server.tool("house_scribe_apiarist_hive_jar_status", "KN-J4 / BP017 — House Scribe: query Jars created from a Hive thread. " +
    "Returns Jar lifecycle state + bee-canon Marks-attribution breakdown. " +
    "BRIDLE Rule 4: data_available=false if query fails.", {
    thread_id: z.string().describe("Hive-thread ID to query (from KN-D3)."),
}, async ({ thread_id }) => {
    try {
        const result = queryHiveJarStatus(thread_id);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
// ─── KN-J5: Cross-Cathedral Coordinate Routing ───────────────────────────────
/**
 * house_scribe_query_jars_cross_cathedral — read-class
 * Cross-cathedral Jar query via 8-digit-grid wildcard patterns.
 * Detective TEAM fan-out + cohort-class enforcement + cache + provenance.
 */
server.tool("house_scribe_query_jars_cross_cathedral", "KN-J5 / BP017 — House Scribe: cross-cathedral Jar query via 8-digit-grid coordinate patterns. " +
    "Patterns: `01-*-*-*` (single cathedral), `99-*-*-*` (cross-cathedral reserved), " +
    "`*-*-*-*` (all cathedrals; Federation Members only), `01..04-*-*-*` (range). " +
    "Cohort-class enforcement: lone_wolf=own-cathedral only; federation_member=full cross-cathedral. " +
    "Detective TEAM fan-out per cathedral + synthesis merge. " +
    "Cache with Augur Living Gate invalidation (KN-J3). " +
    "Provenance write-back: house_scribe_cross_cathedral_query class. " +
    "BRIDLE Rule 4: insufficient cohort → reject with advancement-suggestion; cathedral unavailable → partial results + flag.", {
    pattern: z.string().describe("Cross-cathedral query pattern. Examples: '01-*-*-*' (bishop only), '99-*-*-*' (all cross-cathedral), " +
        "'*-*-*-*' (all cathedrals; Federation Members only), '01..04-*-*-*' (cathedral range). " +
        "Standard KN-J2 wildcard/exact patterns also supported for single-cathedral queries."),
    querier_cohort_class: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .describe("Cohort class of the querying agent. Determines cross-cathedral access scope."),
    querier_cathedral: z.string().optional().describe("Own cathedral of querier (for lone_wolf own-cathedral restriction). E.g. 'bishop', 'knight'."),
    limit: z.number().int().min(1).max(1000).optional().describe("Max results returned. Default and max: 1000."),
    offset: z.number().int().min(0).optional().describe("Pagination offset. Default: 0."),
    use_cache: z.boolean().optional().describe("Use cached results if fresh. Default: true. False forces fresh fan-out."),
}, async ({ pattern, querier_cohort_class, querier_cathedral, limit, offset, use_cache }) => {
    try {
        const result = queryCrossCathedral({
            pattern,
            querier_cohort_class: querier_cohort_class,
            querier_cathedral,
            limit,
            offset,
            use_cache: use_cache !== false,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: result.cohort_rejected === true || result.data_available === false,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err), data_available: false }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_invalidate_cross_cache — write-class
 * Invalidate the cross-cathedral query cache (Augur Living Gate).
 * Called on Pheromone substrate write-events.
 */
server.tool("house_scribe_invalidate_cross_cache", "KN-J5 / BP017 — House Scribe: invalidate cross-cathedral query cache. " +
    "Called by Augur Living Gate on Pheromone write-events. " +
    "Pass pattern to invalidate a specific cache entry, or omit to clear all.", {
    pattern: z.string().optional().describe("Specific cross-cathedral query pattern to invalidate. Omit to clear full cache."),
}, async ({ pattern }) => {
    try {
        invalidateCrossCache(pattern);
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, invalidated: pattern ?? "all" }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * house_scribe_cross_cathedral_provenance — read-class
 * Query the cross-cathedral provenance log.
 */
server.tool("house_scribe_cross_cathedral_provenance", "KN-J5 / BP017 — House Scribe: query the cross-cathedral query provenance log. " +
    "Returns recent house_scribe_cross_cathedral_query entries. " +
    "BRIDLE Rule 4: data_available=false if log unavailable.", {
    limit: z.number().int().min(1).max(500).optional().describe("Max entries to return. Default: 100."),
}, async ({ limit }) => {
    try {
        const entries = queryCrossCathedralProvenance(limit ?? 100);
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: true, entries, count: entries.length }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
// ─── Pod-Q KN-Q2: On Deck Scribe MCP tools ────────────────────────────────────
import { appendEntry as odsAppendEntry, markInFlight as odsMarkInFlight, markLanded as odsMarkLanded, markErrored as odsMarkErrored, markDeferred as odsMarkDeferred, attachPreparedContext as odsAttachPreparedContext, } from "./on_deck_scribe/writer.js";
import { loadQueue as odsLoadQueue, getNextForKnight as odsGetNextForKnight, dispatchAudit as odsDispatchAudit, scanDropzoneForKPrompts, } from "./on_deck_scribe/reader.js";
import { allocateOdsSerial } from "./on_deck_scribe/serial.js";
/**
 * on_deck_query — read-class
 * Return next-fire entry OR full filtered queue from On Deck Scribe canonical state file.
 */
server.tool("on_deck_query", "KN-Q2 / BP018 — On Deck Scribe: query canonical state file. " +
    "Returns next-fire K-prompt entry for Knight (queued + prereqs met + optional filters). " +
    "Pass full_queue=true to return all entries in priority order.", {
    full_queue: z.boolean().optional().describe("Return full queue instead of next-fire entry. Default: false."),
    cohort_class: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional()
        .describe("Filter by HsCohortClass. Only entries with matching cohort_class returned."),
    category: z.string().optional().describe("Filter by category (default: 'knight'). E.g. 'bishop', 'shadow'."),
    status: z
        .enum(["queued", "in_flight", "landed", "deferred", "errored"])
        .optional()
        .describe("Filter by status (only effective when full_queue=true)."),
}, async ({ full_queue, cohort_class, category, status }) => {
    try {
        if (full_queue) {
            let all = odsLoadQueue();
            if (cohort_class)
                all = all.filter((e) => !e.cohort_class || e.cohort_class === cohort_class);
            if (category)
                all = all.filter((e) => e.category === category);
            if (status)
                all = all.filter((e) => e.status === status);
            return {
                content: [{ type: "text", text: JSON.stringify({ data_available: true, count: all.length, entries: all }, null, 2) }],
            };
        }
        else {
            const next = odsGetNextForKnight({ cohort_class, category });
            return {
                content: [{ type: "text", text: JSON.stringify({ data_available: next !== null, next_entry: next ?? null }, null, 2) }],
            };
        }
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * on_deck_append — write-class
 * Append a new K-prompt entry to the canonical queue.
 */
server.tool("on_deck_append", "KN-Q2 / BP018 — On Deck Scribe: append new K-prompt entry to canonical queue. " +
    "Allocates LB-ODS-NNNN serial. Returns entry_id.", {
    category: z
        .enum(["knight", "bishop", "shadow", "pawn", "rook"])
        .describe("Entry category."),
    k_prompt_path: z.string().describe("Absolute path to PROMPT_KNIGHT_*.md file."),
    priority: z.number().int().min(0).describe("Dispatch priority (0 = highest; lower fires first)."),
    prerequisites: z.array(z.string()).optional().describe("Entry IDs that must be 'landed' before this fires."),
    pod_class: z.string().optional().describe("Pod class label (e.g. 'Q', 'R', 'N')."),
    cohort_class: z
        .enum(["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"])
        .optional(),
    flavor_class: z
        .enum(["cinnamon", "vanilla", "cardamom", "saffron", "miner"])
        .optional(),
}, async ({ category, k_prompt_path, priority, prerequisites, pod_class, cohort_class, flavor_class }) => {
    try {
        const id = await allocateOdsSerial();
        const entry = await odsAppendEntry({
            id,
            category,
            k_prompt_path,
            priority,
            prerequisites: prerequisites ?? [],
            ...(pod_class ? { pod_class } : {}),
            ...(cohort_class ? { cohort_class } : {}),
            ...(flavor_class ? { flavor_class } : {}),
            status: "queued",
            ts_queued: new Date().toISOString(),
        });
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, entry_id: id, entry }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * on_deck_mutate — write-class
 * Mutate status, commit_hash, or error_reason on an existing entry.
 */
server.tool("on_deck_mutate", "KN-Q2 / BP018 — On Deck Scribe: mutate entry status. " +
    "Transitions: queued→in_flight, in_flight→landed, *→errored, *→deferred. " +
    "Append-only: mutation is a new line in queue.jsonl.", {
    id: z.string().describe("Entry ID (LB-ODS-NNNN)."),
    status: z
        .enum(["queued", "in_flight", "landed", "deferred", "errored"])
        .describe("New status."),
    commit_hash: z.string().optional().describe("Git commit hash when status=landed."),
    error_reason: z.string().optional().describe("Error detail when status=errored."),
}, async ({ id, status, commit_hash, error_reason }) => {
    try {
        let result;
        if (status === "in_flight")
            result = await odsMarkInFlight(id);
        else if (status === "landed")
            result = await odsMarkLanded(id, commit_hash);
        else if (status === "errored")
            result = await odsMarkErrored(id, error_reason);
        else if (status === "deferred")
            result = await odsMarkDeferred(id);
        else
            result = await odsMarkInFlight(id); // fallback
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, entry: result }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * on_deck_attach_prepared_context — write-class
 * Attach Shadow E-Giant prepared_context (pre-staging output) to a queued entry.
 */
server.tool("on_deck_attach_prepared_context", "KN-Q2 / BP018 — On Deck Scribe: attach Shadow E-Giant pre-staging output to a queued entry. " +
    "Sets prepared_context (shadow_id, wrasse_pre_injections, detective_findings, prereq summary). " +
    "Required before Pod-R auto-fire can proceed.", {
    id: z.string().describe("Entry ID to attach prepared context to."),
    shadow_id: z.string().describe("Shadow E-Giant that ran pre-staging (e.g. 'alpha', 'beta')."),
    wrasse_pre_injections: z.array(z.string()).describe("Eblet paths bulk-loaded during pre-staging."),
    detective_findings: z
        .array(z.object({
        trigger: z.string(),
        scribe: z.string(),
        excerpt: z.string(),
        score: z.number(),
    }))
        .optional()
        .describe("Detective Phase-0 hits cached during pre-staging."),
    prerequisite_context_summary: z.string().describe("Summary of prerequisite commits + test results."),
}, async ({ id, shadow_id, wrasse_pre_injections, detective_findings, prerequisite_context_summary }) => {
    try {
        const result = await odsAttachPreparedContext(id, {
            shadow_id,
            prep_ts: new Date().toISOString(),
            wrasse_pre_injections,
            detective_findings: detective_findings ?? [],
            prerequisite_context_summary,
        });
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, entry: result }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * on_deck_promote_from_dropzone — write-class
 * Scan a dropzone directory, find PROMPT_KNIGHT_*.md files, and bulk-import as queued entries.
 */
server.tool("on_deck_promote_from_dropzone", "KN-Q2 / BP018 — On Deck Scribe: bulk-import K-prompt files from a dropzone directory. " +
    "Scans for PROMPT_KNIGHT_*.md files and appends each as a queued entry. " +
    "Returns list of imported entry IDs.", {
    dropzone_path: z.string().describe("Absolute path to dropzone directory (e.g. BISHOP_DROPZONE/01_KnightPrompts/)."),
    priority: z.number().int().min(0).optional().describe("Priority for all imported entries. Default: 99."),
}, async ({ dropzone_path, priority }) => {
    try {
        const stubs = scanDropzoneForKPrompts(dropzone_path);
        const imported = [];
        for (const stub of stubs) {
            const id = await allocateOdsSerial();
            await odsAppendEntry({
                ...stub,
                id,
                priority: priority ?? stub.priority,
                ts_queued: new Date().toISOString(),
            });
            imported.push(id);
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, imported_count: imported.length, entry_ids: imported }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * on_deck_dispatch_audit — read-class
 * Return aggregated counts: queued / in_flight / landed / errored / by-category / by-cohort_class.
 */
server.tool("on_deck_dispatch_audit", "KN-Q2 / BP018 — On Deck Scribe: aggregated dispatch counts. " +
    "Returns total / queued / in_flight / landed / deferred / errored + breakdowns by category, cohort_class, pod_class.", {}, async () => {
    try {
        const audit = odsDispatchAudit();
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: true, ...audit }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
// ─── Pod-S KN-S3: Stats-Capture Bishop Substrate-Query MCP tools ──────────────
import { queryAggregate } from "./stats_capture/query_aggregate.js";
import { queryTimeline } from "./stats_capture/query_timeline.js";
import { queryParallelCompare } from "./stats_capture/query_parallel_compare.js";
import { queryAnomalies } from "./stats_capture/query_anomalies.js";
import { RetentionPruner } from "./stats_capture/retention_pruner.js";
/**
 * test_telemetry_aggregate — read-class
 * Aggregate counts by outcome, tier, k_prompt pattern, and cost accounting.
 */
server.tool("test_telemetry_aggregate", "KN-S3 / BP018 — Stats-Capture: aggregate telemetry counts. " +
    "Returns total / by_outcome / by_tier / by_k_prompt + cost-accounting (actual vs counterfactual). " +
    "Optional filters: hours window, k_prompt_pattern (glob), cohort_class.", {
    hours: z.number().int().min(1).optional().describe("Time window in hours. Default: 24."),
    k_prompt_pattern: z.string().optional().describe("K-prompt section/source filter (glob, e.g. 'KN-R*')."),
    cohort_class: z.string().optional().describe("Cohort class filter."),
}, async ({ hours, k_prompt_pattern, cohort_class }) => {
    try {
        const result = queryAggregate({ hours, k_prompt_pattern, cohort_class });
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: !result.data_available,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * test_telemetry_cost_savings — read-class
 * Focused cost-savings report (Bushel 3 Colossus / Decentralized Data Center).
 */
server.tool("test_telemetry_cost_savings", "KN-S3 / BP018 — Stats-Capture: cost-savings report. " +
    "Returns actual_spend vs counterfactual_estimate + savings_usd/pct. " +
    "Supports Bushel 3 Colossus pairing (colossus_paired_runs_count). " +
    "Decentralized Data Center Prov 16 supplementary disclosure.", {
    since: z.string().describe("ISO-8601 cutoff date (e.g. '2026-05-01T00:00:00Z')."),
    k_prompt_pattern: z.string().optional().describe("K-prompt section pattern filter."),
}, async ({ since, k_prompt_pattern }) => {
    try {
        const sinceMs = new Date(since).getTime();
        const hoursWindow = Math.ceil((Date.now() - sinceMs) / (60 * 60 * 1000));
        const result = queryAggregate({ hours: hoursWindow, k_prompt_pattern });
        const { cost_accounting } = result;
        return {
            content: [{ type: "text", text: JSON.stringify({
                        data_available: result.data_available,
                        since,
                        actual_spend_usd: cost_accounting.actual_spend_usd,
                        counterfactual_estimate_usd: cost_accounting.counterfactual_estimate_usd,
                        savings_usd: cost_accounting.savings_usd,
                        savings_pct: cost_accounting.savings_pct,
                        by_tier: result.by_tier,
                        total_snapshots: result.total,
                    }, null, 2) }],
            isError: !result.data_available,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * test_telemetry_timeline — read-class
 * Full ordered sequence of snapshots for one test_id.
 */
server.tool("test_telemetry_timeline", "KN-S3 / BP018 — Stats-Capture: ordered snapshot timeline for one test_id. " +
    "Returns bookend_start + intervals (in order) + bookend_end.", {
    test_id: z.string().describe("Test ID to retrieve timeline for."),
}, async ({ test_id }) => {
    try {
        const result = queryTimeline(test_id);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: !result.data_available,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * test_telemetry_parallel_compare — read-class
 * Correlates 5-Knight × N-pod test runs for Founder comparison.
 */
server.tool("test_telemetry_parallel_compare", "KN-S3 / BP018 — Stats-Capture: parallel-session comparison for 5-Knight × N-pod tests. " +
    "Pass test_id_pattern (glob) to match runs. Returns per-session breakdown + aggregate.", {
    test_id_pattern: z.string().describe("Test ID pattern (glob, e.g. 'KN-R4-*' or 'T7-test-*')."),
}, async ({ test_id_pattern }) => {
    try {
        const result = queryParallelCompare(test_id_pattern);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: !result.data_available,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * test_telemetry_anomalies — read-class
 * Returns flagged anomaly snapshots since a cutoff date.
 */
server.tool("test_telemetry_anomalies", "KN-S3 / BP018 — Stats-Capture: anomaly snapshots since cutoff. " +
    "Returns anomaly_flag=true snapshots from anomaly/ + live/ dirs. " +
    "Optional severity filter: 'all' (default) or 'high' (context_pct>90 or stall).", {
    since: z.string().describe("ISO-8601 cutoff date (e.g. '2026-05-01T00:00:00Z')."),
    severity: z.enum(["all", "high"]).optional().describe("Severity filter. Default: 'all'."),
}, async ({ since, severity }) => {
    try {
        const result = queryAnomalies(since, severity ?? "all");
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: !result.data_available,
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ data_available: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
/**
 * test_telemetry_protect — write-class
 * Mark a test_id for indefinite retention (move to protected/).
 */
server.tool("test_telemetry_protect", "KN-S3 / BP018 — Stats-Capture: mark a test_id for indefinite retention. " +
    "Moves all its files from live/ to protected/. Pruner will never touch protected files.", {
    test_id: z.string().describe("Test ID to protect."),
    reason: z.string().optional().describe("Optional reason for protection (logged for audit)."),
}, async ({ test_id, reason }) => {
    try {
        const pruner = new RetentionPruner();
        await pruner.protect(test_id);
        return {
            content: [{ type: "text", text: JSON.stringify({ success: true, test_id, reason: reason ?? null, protected_at: new Date().toISOString() }, null, 2) }],
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// Pod-M: Forever-Stamp Joules (Layer 7 Currency) — KN-M3 / BP018
// ─────────────────────────────────────────────────────────────────────────────
const _joulesOps = new JoulesOperations();
server.tool("joules_mint", "KN-M3 / BP018 Pod-M — Mint a new Forever-Stamp Joule from Marks-surplus. " +
    "Layer 7 currency. face_value is IMMUTABLE once minted (forever-stamp semantics). " +
    "Marks consumed are ONE-WAY VALVE — never recoverable as Marks. " +
    "backing_rule_id cites the Gold tablet (Pod-N) canonicalizing the conversion rate. " +
    "Default rate: 1 Joule per 100 Marks-surplus. Majesty incentive currency.", {
    member_id: z.string().describe("Member ID to receive the minted Joule."),
    marks_surplus: z.number().int().positive().describe("Marks-surplus to consume in the mint. Must be > 0."),
    backing_rule_id: z.string().describe("Gold tablet ID (Pod-N) for the backing rule. Must be non-empty."),
}, async ({ member_id, marks_surplus, backing_rule_id }) => {
    const result = await _joulesOps.mintFromMarksSurplus({ member_id, marks_surplus, backing_rule_id });
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
    };
});
server.tool("joules_transfer", "KN-M3 / BP018 Pod-M — Transfer a Forever-Stamp Joule between members. " +
    "face_value is preserved exactly (forever-stamp semantics). " +
    "Requires current holder to match 'from' member.", {
    from: z.string().describe("Member ID currently holding the Joule."),
    to: z.string().describe("Member ID to receive the Joule."),
    joule_uuid: z.string().describe("UUID of the Joule to transfer."),
}, async ({ from, to, joule_uuid }) => {
    const result = await _joulesOps.transfer({ from, to, joule_uuid });
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
    };
});
server.tool("joules_redeem", "KN-M3 / BP018 Pod-M — Redeem a Forever-Stamp Joule against a civilization-class work target. " +
    "Removes the Joule from circulation permanently. " +
    "redemption_target must describe the civilization-class work being rewarded.", {
    member_id: z.string().describe("Member ID redeeming the Joule (must be current holder)."),
    joule_uuid: z.string().describe("UUID of the Joule to redeem."),
    redemption_target: z.string().describe("Civilization-class work descriptor (required)."),
}, async ({ member_id, joule_uuid, redemption_target }) => {
    const result = await _joulesOps.redeem({ member_id, joule_uuid, redemption_target });
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !result.success,
    };
});
server.tool("joules_balance", "KN-M3 / BP018 Pod-M — Get the current Forever-Stamp Joules balance for a member. " +
    "Returns total_face_value, joule_count, and per-Joule face_value list.", {
    member_id: z.string().describe("Member ID to query balance for."),
}, async ({ member_id }) => {
    const balance = computeBalance(member_id);
    return {
        content: [{ type: "text", text: JSON.stringify(balance, null, 2) }],
    };
});
server.tool("joules_audit", "KN-M3 / BP018 Pod-M — Aggregate Joules audit: total minted, redeemed, in-circulation, face_value totals. " +
    "Optional 'since' ISO timestamp to filter to a window.", {
    since: z.string().optional().describe("ISO-8601 timestamp; filter audit to entries after this date."),
    member_id: z.string().optional().describe("If supplied, also include per-member balance in response."),
}, async ({ since, member_id }) => {
    const audit = computeAudit(since);
    const response = { audit };
    if (member_id) {
        response.member_balance = computeBalance(member_id);
    }
    return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// Pod-T: Keyword-Pyramid Strata Hierarchy — KN-T4 / BP018
// ─────────────────────────────────────────────────────────────────────────────
const _strataQuery = new StrataQuery();
server.tool("strata_ascend", "KN-T4 / BP018 Pod-T — Ascend the 7-layer Keyword-Pyramid from a topic toward Bedrock. " +
    "Returns topics at stratum ordinal + levels. Pyramid: Sand(0) → Soil(1) → Sediment(2) → Sandstone(3) → Limestone(4) → Granite(5) → Bedrock(6).", {
    topic: z.string().describe("Base topic to ascend from."),
    levels: z.number().int().positive().optional().describe("How many stratum levels to ascend (default 1)."),
}, async ({ topic, levels }) => {
    const results = _strataQuery.ascend(topic, levels ?? 1);
    return { content: [{ type: "text", text: JSON.stringify({ topic, levels: levels ?? 1, results }, null, 2) }] };
});
server.tool("strata_descend", "KN-T4 / BP018 Pod-T — Descend the 7-layer Keyword-Pyramid from a topic toward Sand. " +
    "Returns topics at stratum ordinal - levels. Returns empty array at Sand (bottom).", {
    topic: z.string().describe("Base topic to descend from."),
    levels: z.number().int().positive().optional().describe("How many stratum levels to descend (default 1)."),
}, async ({ topic, levels }) => {
    const results = _strataQuery.descend(topic, levels ?? 1);
    return { content: [{ type: "text", text: JSON.stringify({ topic, levels: levels ?? 1, results }, null, 2) }] };
});
server.tool("strata_by_stratum", "KN-T4 / BP018 Pod-T — List all topics assigned to a given stratum level. " +
    "Valid strata: sand, soil, sediment, sandstone, limestone, granite, bedrock.", {
    stratum: z.enum(["sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"])
        .describe("Target stratum level."),
}, async ({ stratum }) => {
    const topics = _strataQuery.byStratum(stratum);
    return { content: [{ type: "text", text: JSON.stringify({ stratum, topics, count: topics.length }, null, 2) }] };
});
server.tool("strata_promote", "KN-T4 / BP018 Pod-T — Promote a topic to a higher stratum in the 7-layer Keyword-Pyramid. " +
    "Builds promotion chain history. Bedrock rejects further promotion. Cannot demote.", {
    topic: z.string().describe("Topic to promote."),
    to_stratum: z.enum(["sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"])
        .describe("Target stratum (must be higher than current)."),
    signer: z.string().describe("Session ID or agent signing this promotion."),
    session: z.string().optional().describe("Ratification session ID (defaults to signer)."),
}, async ({ topic, to_stratum, signer, session }) => {
    try {
        const result = _strataQuery.promote(topic, to_stratum, signer, session);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, assignment: result }, null, 2) }] };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }, null, 2) }],
            isError: true,
        };
    }
});
server.tool("strata_audit", "KN-T4 / BP018 Pod-T — Audit: count topics per stratum; identify Sand/Soil topics ready for promotion. " +
    "Returns counts per stratum and promotion candidates (high-hit sand/soil topics).", {}, async () => {
    const all = readAllAssignments();
    const counts = {};
    for (const s of ALL_STRATA)
        counts[s] = 0;
    for (const a of all)
        counts[a.stratum] = (counts[a.stratum] ?? 0) + 1;
    const promotion_candidates = all
        .filter((a) => a.stratum === "sand" || a.stratum === "soil")
        .map((a) => ({ topic: a.topic, stratum: a.stratum, ordinal: a.ordinal }));
    return {
        content: [{ type: "text", text: JSON.stringify({
                    total_topics: all.length,
                    counts_by_stratum: counts,
                    promotion_candidates: promotion_candidates.slice(0, 20),
                }, null, 2) }],
    };
});
server.tool("strata_promotion_recommend", "KN-T4 / BP018 Pod-T — Recommend Sand/Soil topics for promotion based on pheromone hit-frequency × age. " +
    "Surfaces topics that appear frequently in Detective queries and may be ready for canonical elevation.", {
    claim: z.string().optional().describe("Query claim to find relevant promotion candidates. Defaults to general substrate scan."),
    topK: z.number().int().positive().optional().describe("Max candidates to return (default 10)."),
}, async ({ claim, topK }) => {
    const hits = detectiveQueryByStratum(claim ?? "canonical substrate promotion bedrock granite limestone", topK ?? 10);
    const sand_soil = hits.filter((h) => h.stratum === "sand" || h.stratum === "soil");
    return {
        content: [{ type: "text", text: JSON.stringify({
                    promotion_recommendations: sand_soil,
                    total_hits: hits.length,
                    sand_soil_count: sand_soil.length,
                }, null, 2) }],
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// Pod-K: Codex (Layer 8 Canon-of-Canons) — KN-K3 / BP018
// ─────────────────────────────────────────────────────────────────────────────
const _codexBinding = new CodexBinding();
server.tool("codex_create", "KN-K3 / BP018 Pod-K — Create a new Codex in 'drafting' state. " +
    "Layer 8 canon-of-canons bound-book artifact. Chapters added via codex_add_chapter. " +
    "Lifecycle: drafting → review → bound (immutable). " +
    "Bushel 32B (BP023): pass reservation_id from codex_reserve_next_serial to honor the reserved serial " +
    "and unify the reservation-space with the corpus-space (dual-serial-space sync-debt closure).", {
    title: z.string().describe("Human-readable title for the Codex."),
    edition: z.string().describe("Edition string (e.g. 'BP023', '2025-Q2')."),
    reservation_id: z.string().optional().describe("Optional UUID from codex_reserve_next_serial. " +
        "When provided, the Codex is created with the reserved serial (LB-CODEX-NNNN) instead of auto-allocating. " +
        "Errors: reservation_not_found | reservation_already_bound | reservation_expired | corpus_id_already_taken."),
}, async ({ title, edition, reservation_id }) => {
    const { randomUUID } = await import("crypto");
    let id;
    if (reservation_id) {
        const corpusEntryExists = (serial) => readAllCodexEntries().some((c) => c.id === serial);
        const resolved = await resolveReservationForCreate(reservation_id, corpusEntryExists);
        if ("error_code" in resolved) {
            return {
                content: [{ type: "text", text: JSON.stringify({ success: false, error: resolved.error, error_code: resolved.error_code }, null, 2) }],
                isError: true,
            };
        }
        id = resolved.serial;
    }
    else {
        id = allocateCodexSerial();
    }
    const codex = {
        id,
        uuid: randomUUID(),
        title,
        edition,
        chapters: [],
        status: "drafting",
        created_ts: new Date().toISOString(),
    };
    appendCodexEntry(codex);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, codex }, null, 2) }] };
});
server.tool("codex_add_chapter", "KN-K3 / BP018 Pod-K — Add a chapter to a Codex in 'drafting' state. " +
    "Chapter cites Gold tablets (Pod-N), Excalibur instances, Joules redemptions (Pod-M), Jars (Pod-J). " +
    "Mutations rejected on bound/superseded Codex.", {
    codex_id: z.string().describe("Codex serial (LB-CODEX-NNNN)."),
    topic: z.string().describe("Chapter topic."),
    body_text: z.string().describe("Chapter prose body."),
    stratum: z.enum(["sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"]).optional()
        .describe("Pod-T stratum citation for this chapter."),
    gold_tablet_pointers: z.array(z.string()).optional().describe("Gold tablet IDs (Pod-N)."),
    excalibur_pointers: z.array(z.string()).optional().describe("Excalibur class IDs (BP016 Pod-C)."),
    jar_pointers: z.array(z.string()).optional().describe("House Scribe Jar serials (Pod-J KN-J1)."),
    joules_redemption_pointers: z.array(z.string()).optional().describe("Joules entry IDs (Pod-M) cited."),
}, async ({ codex_id, topic, body_text, stratum, gold_tablet_pointers, excalibur_pointers, jar_pointers, joules_redemption_pointers }) => {
    const codex = getCodexById(codex_id);
    if (!codex) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Codex '${codex_id}' not found` }, null, 2) }], isError: true };
    }
    const check = _codexBinding.checkMutationAllowed(codex);
    if (!check.allowed) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: check.reason }, null, 2) }], isError: true };
    }
    const chapter = {
        topic,
        stratum: stratum ?? undefined,
        gold_tablet_pointers: gold_tablet_pointers ?? [],
        excalibur_pointers: excalibur_pointers ?? [],
        jar_pointers: jar_pointers ?? [],
        joules_redemption_pointers: joules_redemption_pointers ?? [],
        body_text,
        ts_drafted: new Date().toISOString(),
    };
    const updated = { ...codex, chapters: [...codex.chapters, chapter] };
    appendCodexEntry(updated);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, codex: updated, chapters_count: updated.chapters.length }, null, 2) }] };
});
server.tool("codex_review", "KN-K3 / BP018 Pod-K — Move a Codex from 'drafting' to 'review' (mutations frozen for review window). " +
    "Required before binding.", {
    codex_id: z.string().describe("Codex serial (LB-CODEX-NNNN)."),
}, async ({ codex_id }) => {
    const codex = getCodexById(codex_id);
    if (!codex)
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Codex '${codex_id}' not found` }, null, 2) }], isError: true };
    if (codex.status !== "drafting")
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Codex '${codex_id}' is '${codex.status}', not 'drafting'` }, null, 2) }], isError: true };
    const updated = { ...codex, status: "review" };
    appendCodexEntry(updated);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, codex: updated }, null, 2) }] };
});
server.tool("codex_bind", "KN-K3 / BP018 Pod-K — Bind a Codex: HMAC-locks all chapters; status → 'bound'; immutable after this. " +
    "Requires status='review'. Verifies all pointer references before binding.", {
    codex_id: z.string().describe("Codex serial (LB-CODEX-NNNN) in 'review' status."),
    signer: z.string().describe("Session ID or agent signing the binding ceremony."),
}, async ({ codex_id, signer }) => {
    const result = await _codexBinding.bind(codex_id, signer);
    const isError = "error" in result;
    return {
        content: [{ type: "text", text: JSON.stringify(isError ? result : { success: true, bound_codex: result }, null, 2) }],
        isError,
    };
});
server.tool("codex_query", "KN-K3 / BP018 Pod-K — Query Codices by title, edition, or status. " +
    "Returns matching Codex records.", {
    title: z.string().optional().describe("Partial title match (case-insensitive)."),
    edition: z.string().optional().describe("Exact edition match."),
    status: z.enum(["drafting", "review", "bound", "superseded"]).optional().describe("Filter by status."),
}, async ({ title, edition, status }) => {
    const results = queryCodex({ title, edition, status: status });
    return { content: [{ type: "text", text: JSON.stringify({ count: results.length, codices: results }, null, 2) }] };
});
server.tool("codex_supersede", "KN-K3 / BP018 Pod-K — Supersede a bound Codex with a new one. " +
    "Old Codex gets status='superseded' + superseded_by=new_id.", {
    old_id: z.string().describe("Codex serial of the bound Codex to supersede."),
    new_id: z.string().describe("Codex serial of the replacement Codex."),
}, async ({ old_id, new_id }) => {
    const result = await _codexBinding.supersede(old_id, new_id);
    if (result && "error" in result) {
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify({ success: true, old_id, new_id, superseded_at: new Date().toISOString() }, null, 2) }] };
});
server.tool("codex_anthology_export", "KN-K3 / BP018 Pod-K — Export a bound Codex to a named Anthology. " +
    "Valid targets: ai_cake, no_atomo, mechanical_computer, pre_cathedral_substack. " +
    "Codex must be in 'bound' status.", {
    codex_id: z.string().describe("Codex serial (LB-CODEX-NNNN) in 'bound' status."),
    target_anthology: z.enum(["ai_cake", "no_atomo", "mechanical_computer", "pre_cathedral_substack"])
        .describe("Named Anthology to export into."),
}, async ({ codex_id, target_anthology }) => {
    const codex = getCodexById(codex_id);
    if (!codex)
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Codex '${codex_id}' not found` }, null, 2) }], isError: true };
    if (codex.status !== "bound")
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Codex '${codex_id}' is '${codex.status}'; must be 'bound' for anthology export` }, null, 2) }], isError: true };
    const exported_ts = new Date().toISOString();
    const existing_exports = codex.anthology_exports ?? [];
    const updated = {
        ...codex,
        anthology_exports: [...existing_exports, { target: target_anthology, exported_ts }],
    };
    appendCodexEntry(updated);
    emitPheromone("CodexAnthology", `codex_anthology_export_${codex_id}_${target_anthology}`, `codex anthology export ${codex.title} target:${target_anthology} layer-8 canon-of-canons`, { cathedral: "knight", flavorClass: { domain: "codex", cognition: "building-in-public" } });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, codex_id, target_anthology, exported_ts, chapter_count: codex.chapters.length }, null, 2) }] };
});
// ─── Pod-K Bushel 32: Codex Serial Atomic-Reservation Primitive ──────────────
// G2: Tool implemented + wired — mcp__librarian__codex_reserve_next_serial callable.
registerTool("codex_reserve_next_serial", "Bushel 32 / BP022 — Atomically reserve the next available LB-CODEX-NNNN serial. " +
    "Reads the ledger, finds max(bound, reserved), allocates next = max+1, writes reservation row to ledger BEFORE returning. " +
    "Race-safe: in-process mutex + file-lock for cross-process concurrency. " +
    "Eliminates the Codex-collision class (5+ empirical instances: Bushels 11/15/18/9/12/13/19). " +
    "MUST be called BEFORE creating a Codex draft — draft authors with the returned serial from the start. " +
    "At LANDING, call codex_bind_reservation to transition reserved→bound.", {
    reserved_by: z.string().describe("Caller identity: session ID (e.g. 'K503') or agent name."),
    intended_title: z.string().describe("Intended Codex title (used for collision detection in reservation log)."),
    intended_session: z.string().describe("Session or Bushel session ID (e.g. 'B022', 'K503')."),
    intended_bushel: z.number().int().describe("Bushel number this serial is for (0 if not for a Bushel)."),
    ttl_days: z.number().optional().describe("Reservation TTL in days (default 7). Expired serials return to pool."),
}, async ({ reserved_by, intended_title, intended_session, intended_bushel, ttl_days }) => {
    const result = await reserveNextSerial(reserved_by, intended_title, intended_session, intended_bushel);
    if ("error" in result) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: result.error }, null, 2) }], isError: true };
    }
    const { serial, reserved_ts, reservation_id } = result;
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    success: true,
                    serial,
                    reserved_ts,
                    reservation_id,
                    ttl_days: ttl_days ?? 7,
                    message: `Serial ${serial} reserved. Use this serial in your Codex draft from the start. Call codex_bind_reservation(reservation_id, bound_codex_id) at LANDING.`,
                }, null, 2),
            }],
    };
});
registerTool("codex_bind_reservation", "Bushel 32 / BP022 — Transition a Codex reservation from status='reserved' to status='bound'. " +
    "Call AFTER codex_bind() succeeds. Links the reservation row to the now-bound Codex entry. " +
    "Fails if reservation does not exist (T7: must reserve first), or if target Codex is not yet bound.", {
    reservation_id: z.string().describe("UUID from codex_reserve_next_serial call."),
    bound_codex_id: z.string().describe("Codex serial (LB-CODEX-NNNN) that was just bound via codex_bind."),
}, async ({ reservation_id, bound_codex_id }) => {
    const result = await bindReservation(reservation_id, bound_codex_id);
    if ("error" in result) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: result.error }, null, 2) }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
registerTool("codex_expire_reservations", "Bushel 32 / BP022 — Sweep expired reservations (past TTL) and transition them to status='expired', releasing their serials back to the pool. " +
    "Returns count of expired reservations and their serials.", {
    ttl_days: z.number().optional().describe("Override TTL in days (default 7). Reservations older than this are expired."),
}, async ({ ttl_days }) => {
    const result = await expireReservations(ttl_days);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, ...result }, null, 2) }] };
});
registerTool("codex_query_reservations", "Bushel 32 / BP022 — Query Codex serial reservations by status, caller, or Bushel number. " +
    "Returns reservation rows (type='reservation') from the codex ledger.", {
    status: z.enum(["reserved", "bound", "expired"]).optional().describe("Filter by reservation status."),
    reserved_by: z.string().optional().describe("Filter by caller identity."),
    intended_bushel: z.number().optional().describe("Filter by Bushel number."),
}, async ({ status, reserved_by, intended_bushel }) => {
    const results = queryReservations({ status, reserved_by, intended_bushel });
    return { content: [{ type: "text", text: JSON.stringify({ count: results.length, reservations: results }, null, 2) }] };
});
/**
 * gold_tablet_query — read-class
 * Query active Gold Tablets by tier, scope, topic, or status.
 */
server.tool("gold_tablet_query", "KN-N1 / BP018 — Gold Tablet: query canonical regulations tablets by tier/scope/topic. " +
    "Returns active tablets by default. Pass status='all' to include superseded.", {
    tier: z.enum(["platform_canon", "platform_rules", "project_rules"]).optional()
        .describe("Filter by tier (platform_canon | platform_rules | project_rules)."),
    scope: z.string().optional().describe("Filter by scope ('platform' or project_id)."),
    topic: z.string().optional().describe("Filter by topic name."),
    status: z.enum(["active", "all"]).optional().describe("'active' (default) or 'all' including superseded."),
    limit: z.number().optional().describe("Max results (default 100)."),
    offset: z.number().optional().describe("Pagination offset."),
}, async ({ tier, scope, topic, status, limit, offset }) => {
    try {
        const results = queryTablets({ tier, scope, topic, status, limit: limit ?? 100, offset });
        return { content: [{ type: "text", text: JSON.stringify({ tablets: results, count: results.length }, null, 2) }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * gold_tablet_ratify — write-class
 * Ratify a new Gold Tablet (requires platform-tier authority for platform tiers).
 */
server.tool("gold_tablet_ratify", "KN-N2/N3 / BP018 — Gold Tablet: ratify a new canonical regulation. " +
    "Generates LB-GOLD-NNNN serial, HMAC + Chronos signatures. " +
    "Writes Pheromone Pixie-Dust provenance. Authority-gated by tier.", {
    tier: z.enum(["platform_canon", "platform_rules", "project_rules"])
        .describe("Tier (platform_canon|platform_rules|project_rules)."),
    scope: z.string().describe("'platform' or project_id."),
    topic: z.string().describe("Canonical topic name."),
    rule_text: z.string().describe("The canonical statement."),
    ratification_session: z.string().describe("Session ID (e.g. BP018)."),
    signer_id: z.string().describe("Authority signer (FOUNDER, BP018, K461 etc)."),
    founder_voice_quote: z.string().optional().describe("Optional Founder voice quote."),
    supersedes: z.array(z.string()).optional().describe("Array of prior Gold tablet IDs this replaces."),
}, async ({ tier, scope, topic, rule_text, ratification_session, signer_id, founder_voice_quote, supersedes }) => {
    try {
        const authCheck = checkMutationAuthority({ tier, scope, signer_id });
        if (!authCheck.allowed) {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: authCheck.reason }, null, 2) }], isError: true };
        }
        const result = appendTablet({ tier, scope, topic, rule_text, ratification_session, signer_id, founder_voice_quote, supersedes });
        if (result.success) {
            writeGoldPixieDust({ event_type: "tablet_ratified", gold_tablet_id: result.tablet.id, tier, scope, signer_id, timestamp: new Date().toISOString() });
        }
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * gold_tablet_supersede — write-class
 * Supersede a Gold Tablet: marks old as superseded, cascades to Excalibur instances.
 */
server.tool("gold_tablet_supersede", "KN-N2/N3 / BP018 — Gold Tablet: supersede an existing tablet. " +
    "Marks old tablet superseded + cascade-marks dependent Excalibur as needs_re_anchor. " +
    "Use gold_tablet_ratify with supersedes[] for the new tablet first.", {
    old_id: z.string().describe("Gold tablet ID to supersede (LB-GOLD-NNNN)."),
    new_id: z.string().describe("Replacing Gold tablet ID (LB-GOLD-NNNN)."),
}, async ({ old_id, new_id }) => {
    try {
        const result = cascadeSupersession(old_id, new_id);
        if (result.success) {
            writeGoldPixieDust({ event_type: "tablet_superseded", gold_tablet_id: old_id, new_gold_tablet_id: new_id, timestamp: new Date().toISOString() });
        }
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * gold_tablet_excalibur_link — write-class
 * Create bidirectional pointer between Gold Tablet and Excalibur Class instance.
 */
server.tool("gold_tablet_excalibur_link", "KN-N2/N3 / BP018 — Gold Tablet: link an Excalibur Class instance to a Gold Tablet. " +
    "Creates bidirectional pointer. Excalibur is READ-ONLY against Gold. " +
    "Gold supersession cascade will mark linked Excalibur as needs_re_anchor.", {
    gold_id: z.string().describe("Gold tablet ID (LB-GOLD-NNNN)."),
    excalibur_id: z.string().describe("Excalibur Class instance ID."),
}, async ({ gold_id, excalibur_id }) => {
    try {
        const result = linkExcaliburToGold(gold_id, excalibur_id);
        if (result.success) {
            writeGoldPixieDust({ event_type: "excalibur_linked", gold_tablet_id: gold_id, excalibur_id, timestamp: new Date().toISOString() });
        }
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * gold_tablet_audit — read-class
 * Aggregate counts by tier × status × scope.
 */
server.tool("gold_tablet_audit", "KN-N3 / BP018 — Gold Tablet: aggregate audit (counts by tier × status × scope). " +
    "Returns total + by_tier + by_status + by_scope breakdowns.", {}, async () => {
    try {
        const result = auditTablets();
        writeGoldPixieDust({ event_type: "audit_query", timestamp: new Date().toISOString() });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
// ─── KN-D2/D4/D5: Apiarist Hive Infrastructure Remainder ────────────────────
/**
 * apiarist_hive_create_thread — write-class
 * Create a new Apiarist Hive thread in `open` state.
 */
server.tool("apiarist_hive_create_thread", "KN-D2 / BP018 — Apiarist Hive: create a new hive thread in `open` state. " +
    "Assigns LB-HIVE-NNNN serial. Validates bee_role_assignments (max 1 queen).", {
    topic: z.string().describe("Thread topic."),
    participants: z.array(z.string()).describe("Member IDs participating."),
    bee_role_assignments: z.record(z.string(), z.enum(["worker", "drone", "queen"]))
        .describe("Role per participant_id (worker|drone|queen). Max 1 queen."),
    cohort_class: z.string().optional().describe("Cohort class for federation eligibility."),
}, async ({ topic, participants, bee_role_assignments, cohort_class }) => {
    try {
        const result = createHiveThread({ topic, participants, bee_role_assignments, cohort_class });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * apiarist_hive_advance_thread — write-class
 * Advance a Hive thread to the next state (guarded transitions).
 */
server.tool("apiarist_hive_advance_thread", "KN-D2 / BP018 — Apiarist Hive: advance thread state (open→synthesizing→closed→sealed). " +
    "Only valid forward transitions allowed. BRIDLE Rule 4: backward transitions rejected.", {
    thread_id: z.string().describe("Thread ID (LB-HIVE-NNNN)."),
    target: z.enum(["synthesizing", "closed", "sealed"]).describe("Target state."),
    synthesis_target: z.string().optional().describe("Jar ID (required before sealed)."),
}, async ({ thread_id, target, synthesis_target }) => {
    try {
        const result = advanceHiveThread(thread_id, target, { synthesis_target });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * apiarist_hive_federate — write-class
 * Trigger cross-frame federation for a closed Hive thread.
 */
server.tool("apiarist_hive_federate", "KN-D4 / BP018 — Apiarist Hive: trigger cross-frame federation on thread close. " +
    "Lone Wolf: broadcast_mode=none. Pied Piper: read_only. Federation: bidirectional. Excalibur: curated_slice.", {
    thread_id: z.string().describe("Thread ID to federate."),
    jar_id: z.string().describe("Jar ID created from thread closure (KN-J4)."),
    cohort_class: z.string().describe("Cohort class of the thread originator."),
    frame_instance_id: z.string().describe("LB Frame Local instance ID."),
    tags: z.array(z.string()).optional().describe("Tags for Excalibur curated-slice broadcast."),
}, async ({ thread_id, jar_id, cohort_class, frame_instance_id, tags }) => {
    try {
        const thread = readHiveThread(thread_id);
        if (!thread) {
            return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `Thread ${thread_id} not found.` }, null, 2) }], isError: true };
        }
        const receipt = onThreadClosedFederateIfEligible({ thread, jar_id, cohort_class, frame_instance_id, tags });
        return { content: [{ type: "text", text: JSON.stringify(receipt, null, 2) }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * apiarist_hive_uptime_cap — write-class
 * Check and enforce the 50%-uptime cap for a participant+role.
 */
server.tool("apiarist_hive_uptime_cap", "KN-D5 / BP018 — Apiarist Hive: enforce 50%-uptime cap per role per cycle. " +
    "Per-role independent caps (worker/drone/queen). Race-safe. Composes with Pod-G.", {
    participant_id: z.string().describe("Participant member ID."),
    role: z.enum(["worker", "drone", "queen"]).describe("Bee role."),
    attempted_duration_min: z.number().describe("Duration to attempt (minutes)."),
    cycle_period_min: z.number().optional().describe("Cycle period in minutes (default 60)."),
    cap_pct: z.number().optional().describe("Cap percentage (default 50)."),
}, async ({ participant_id, role, attempted_duration_min, cycle_period_min, cap_pct }) => {
    try {
        const result = enforceCap(participant_id, role, attempted_duration_min, { cycle_period_min, cap_pct });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
// ─── KN-J6: Dual-Tier IPv4-Local / IPv6-Federation Translation ───────────────
/**
 * coordinate_translate_local_to_federation — write-class
 * Translate a local 4-tuple + instance to an IPv6 federation address.
 */
server.tool("coordinate_translate_local_to_federation", "KN-J6.2 / BP018 — Dual-Tier Addressing: translate local 4-tuple to IPv6 federation address. " +
    "Lone Wolf REJECTED (never federates). " +
    "Scope-tier prefix encodes cohort_class structurally. Caches in Augur Living Gate.", {
    local_tuple: z.string().describe("Local 4-tuple coordinate (e.g. 'auth-user-session-token' or NN-NN-NN-NN)."),
    instance_id: z.string().describe("LB Frame Local instance ID (e.g. LB-CAT.M-0001)."),
    cohort_class: z.string().describe("HsCohortClass (lone_wolf|pied_piper_tier_1|federation_member|excalibur_subscriber|thirteenth_warrior)."),
}, async ({ local_tuple, instance_id, cohort_class }) => {
    try {
        const result = localToFederation({ local_tuple, instance_id, cohort_class: cohort_class });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * coordinate_translate_federation_to_local — read-class
 * Translate an IPv6 federation address back to local 4-tuple + instance_id.
 */
server.tool("coordinate_translate_federation_to_local", "KN-J6.2 / BP018 — Dual-Tier Addressing: reverse translate IPv6 federation address to 4-tuple. " +
    "Checks Augur cache first, then provenance ledger. Returns cohort_class from scope-tier prefix.", {
    federation_address: z.string().describe("IPv6 federation address to reverse-translate."),
}, async ({ federation_address }) => {
    try {
        const result = federationToLocal({ federation_address });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.success };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
/**
 * coordinate_translation_provenance — read-class
 * Return full provenance chain for a tuple or federation address.
 */
server.tool("coordinate_translation_provenance", "KN-J6.3 / BP018 — Dual-Tier Addressing: retrieve provenance chain for a 4-tuple or IPv6 address. " +
    "Returns all translation events (local→federation and federation→local) for the identifier.", {
    tuple_or_address: z.string().describe("Local 4-tuple or IPv6 federation address to query provenance for."),
}, async ({ tuple_or_address }) => {
    try {
        const chain = getTranslationProvenance(tuple_or_address);
        return { content: [{ type: "text", text: JSON.stringify({ chain, count: chain.length }, null, 2) }] };
    }
    catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: String(err) }, null, 2) }], isError: true };
    }
});
main().catch(err => {
    console.error("Server failed to start:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map
