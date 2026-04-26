import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { checkRebuildLock, clearPostBuildReloadLock } from "./buildGate.js";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import type {
  SystemOverview, SchemaIndex, FunctionIndex, PageIndex,
  CephasIndex, ContextIndex, BishopIndex, DomainIndex,
  ConceptsIndex, SessionEntry, ArchitecturalRule,
  DropzoneIndex, TranscriptIndex, ComponentIndex,
  V2MigrationIndex, LetterIndex,
} from "./types.js";
import { buildBriefing, buildChecklist, buildDebrief } from "./router/moneyPennyRouter.js";
import { validateSessionId } from "./sessionGuard.js";
import { budgetEnforce, BUDGETS, truncateList, truncateToWords } from "./router/budgets.js";
import { canonicalValueMatches, loadCanonicalFlat } from "./predicates/canonical_value_matches.js";
import { checkFreshness } from "./indexer/fingerprint.js";
import { createFreshIndexGate } from "./indexer/freshIndexGate.js";
import { getRegistry, listScribeIds, getScribe } from "./scribes/registry.js";
import {
  appendTidbit,
  appendScribeEntry,
  appendFatesLog,
  readTidbits,
  readTablet,
  readFatesLog,
  tabletStats,
  type AgentName,
  type ScribeSource,
} from "./scribes/cathedral.js";
import { runFates } from "./scribes/fates.js";
import { consultScribes } from "./scribes/consult.js";
import { memberConsultScribes } from "./cathedral_supabase/member_consult.js";
import { memberFatesRoute } from "./cathedral_supabase/member_fates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INDEX_DIR = resolve(__dirname, "..", "index");

type PaginationOptions = {
  offset?: number;
  limit?: number;
};

function normalizePagination(
  options: PaginationOptions | undefined,
  defaultLimit: number,
  maxLimit = 200,
) {
  const offset = Math.max(0, options?.offset ?? 0);
  const limitRaw = options?.limit ?? defaultLimit;
  const limit = Math.max(1, Math.min(maxLimit, limitRaw));
  return { offset, limit };
}

function paginateResults<T>(
  items: T[],
  options: PaginationOptions | undefined,
  defaultLimit: number,
) {
  const { offset, limit } = normalizePagination(options, defaultLimit);
  const total_count = items.length;
  const results = items.slice(offset, offset + limit);
  const has_more = offset + results.length < total_count;
  return { results, total_count, offset, limit, has_more };
}

function globPatternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

function loadIndex<T>(name: string): T | null {
  const path = resolve(INDEX_DIR, `${name}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

let overview = loadIndex<SystemOverview>("overview");
let schemas = loadIndex<SchemaIndex>("schemas");
let functions = loadIndex<FunctionIndex>("functions");
let pages = loadIndex<PageIndex>("pages");
let cephas = loadIndex<CephasIndex>("cephas");
let context = loadIndex<ContextIndex>("context");
let bishop = loadIndex<BishopIndex>("bishop");
let domains = loadIndex<DomainIndex>("domains");
let concepts = loadIndex<ConceptsIndex>("concepts");
let dropzones = loadIndex<DropzoneIndex>("dropzones");
let transcripts = loadIndex<TranscriptIndex>("transcripts");
let components = loadIndex<ComponentIndex>("components");
let v2Migration = loadIndex<V2MigrationIndex>("v2-migration");
let letters = loadIndex<LetterIndex>("letters");

function reloadAll() {
  overview = loadIndex<SystemOverview>("overview");
  schemas = loadIndex<SchemaIndex>("schemas");
  functions = loadIndex<FunctionIndex>("functions");
  pages = loadIndex<PageIndex>("pages");
  cephas = loadIndex<CephasIndex>("cephas");
  context = loadIndex<ContextIndex>("context");
  bishop = loadIndex<BishopIndex>("bishop");
  domains = loadIndex<DomainIndex>("domains");
  concepts = loadIndex<ConceptsIndex>("concepts");
  dropzones = loadIndex<DropzoneIndex>("dropzones");
  transcripts = loadIndex<TranscriptIndex>("transcripts");
  components = loadIndex<ComponentIndex>("components");
  v2Migration = loadIndex<V2MigrationIndex>("v2-migration");
  letters = loadIndex<LetterIndex>("letters");
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
const freshIndexGate = createFreshIndexGate(
  INDEX_DIR,
  () => reloadAll(),
  () => overview != null,
);
function ensureFreshIndex() {
  return freshIndexGate.check();
}

const server = new McpServer({
  name: "librarian",
  version: "1.0.0",
});

// ─── K448: Build-gate dispatcher ─────────────────────────────────────────────
// One function + one early-return guards ALL tool calls. When build-guarded.mjs
// is running tsc, .rebuild.lock exists and concurrent callers receive a
// structured error with retry_after_ms instead of hanging silently (B118 incident).
type ToolContent = { content: Array<{ type: "text"; text: string }> };

function buildGateCheck(): ToolContent | null {
  const result = checkRebuildLock();
  if (!result) return null;
  if ("warning" in result) {
    // Stale lock: crashed build left a lock behind. Log and proceed.
    console.error(`[build-gate] Stale .rebuild.lock (age ${result.age_ms}ms). Proceeding. Consider running npm run build-guarded to clear.`);
    return null;
  }
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

/**
 * Wrapper around server.tool() that injects the build-gate check before every
 * handler runs. This is the single integration point — no per-handler changes
 * needed. The generic preserves Zod schema→args type inference so handlers
 * keep their strongly-typed parameter destructuring.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodShape = Record<string, z.ZodType<any, any, any>>;

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
  tool_call_names: [] as string[],
};

function _resetSessionTracker() {
  _sessionTracker.injection_count = 0;
  _sessionTracker.overhead_tokens_estimate = 0;
  _sessionTracker.session_start_ts = new Date().toISOString();
  _sessionTracker.last_call_ts = new Date().toISOString();
  _sessionTracker.tool_call_names = [];
}
// ─────────────────────────────────────────────────────────────────────────────

function registerTool<S extends AnyZodShape>(
  name: string,
  desc: string,
  schema: S,
  handler: (args: z.infer<z.ZodObject<S>>) => Promise<ToolContent>,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (server.tool as any)(name, desc, schema, async (args: z.infer<z.ZodObject<S>>) => {
    const blocked = buildGateCheck();
    if (blocked) return blocked;
    const result = await handler(args);
    // K506 Phase A: track every MCP tool call as one substrate injection event
    _sessionTracker.injection_count++;
    _sessionTracker.last_call_ts = new Date().toISOString();
    _sessionTracker.tool_call_names.push(name);
    // Estimate response size in tokens (rough: chars / 4)
    const responseText = result.content
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { type: string; text?: string }) => (c as { type: string; text: string }).text)
      .join("");
    _sessionTracker.overhead_tokens_estimate += Math.ceil(responseText.length / 4);
    return result;
  });
}
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════
// TOOL 1: get_system_overview
// ═══════════════════════════════════════════

registerTool(
  "get_system_overview",
  "Returns innovation count, initiative count, page/function/table counts, last session, and pending work. Call at session start.",
  {},
  async () => {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 2: query_domain
// ═══════════════════════════════════════════

registerTool(
  "query_domain",
  "Returns all tables, functions, pages, feature flags, and Cephas content for a domain (e.g. 'lb_card', 'housing', 'ghost_world'). Pass domain name or 'list' to see all domains.",
  { domain: z.string().describe("Domain name or 'list' to see all available domains") },
  async ({ domain }) => {
    ensureFreshIndex();
    if (!domains) {
      return { content: [{ type: "text", text: "Index not built." }] };
    }

    if (domain === "list") {
      const list = Object.entries(domains.domains).map(([name, d]) =>
        `${name}: ${d.tables.length} tables, ${d.edgeFunctions.length} functions, ${d.pages.length} pages`
      );
      return { content: [{ type: "text", text: list.join("\n") }] };
    }

    const d = domains.domains[domain];
    if (!d) {
      const available = Object.keys(domains.domains).join(", ");
      return { content: [{ type: "text", text: `Domain '${domain}' not found. Available: ${available}` }] };
    }

    const result: Record<string, unknown> = { ...d };

    if (schemas) {
      result.tableDetails = d.tables.map(t => {
        const table = schemas!.tables[t];
        return table ? { name: t, columns: table.columns.length, pk: table.primaryKey, fks: table.foreignKeys } : { name: t };
      });
    }

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 3: get_schema
// ═══════════════════════════════════════════

registerTool(
  "get_schema",
  "Returns columns, types, constraints, FKs, indexes, RLS policies, and originating migration for a table. Pass 'list' to see all tables.",
  { table: z.string().describe("Table name or 'list' to see all tables") },
  async ({ table }) => {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 4: list_edge_functions
// ═══════════════════════════════════════════

registerTool(
  "list_edge_functions",
  "Lists edge functions, optionally filtered by name/domain pattern. Returns name, purpose, auth pattern, and tables used.",
  { filter: z.string().optional().describe("Optional name/keyword filter (e.g. 'card', 'membership', 'webhook')") },
  async ({ filter }) => {
    ensureFreshIndex();
    if (!functions) {
      return { content: [{ type: "text", text: "Index not built." }] };
    }

    let entries = Object.values(functions.functions);
    if (filter) {
      const lower = filter.toLowerCase();
      entries = entries.filter(f =>
        f.name.toLowerCase().includes(lower) ||
        f.purpose.toLowerCase().includes(lower) ||
        f.tablesUsed.some(t => t.toLowerCase().includes(lower)) ||
        f.externalApis.some(a => a.toLowerCase().includes(lower))
      );
    }

    const summary = entries.map(f =>
      `${f.name} | ${f.authPattern} | ${f.purpose} | tables: ${f.tablesUsed.join(", ") || "none"}`
    );

    return {
      content: [{
        type: "text",
        text: `${entries.length} functions${filter ? ` matching '${filter}'` : ""}:\n\n${summary.join("\n")}`,
      }],
    };
  }
);

// ═══════════════════════════════════════════
// TOOL 5: get_page_info
// ═══════════════════════════════════════════

registerTool(
  "get_page_info",
  "Returns route, data queries, feature flag dependencies, and edge function calls for a page. Pass 'list' to see all pages.",
  { page: z.string().describe("Page component name or 'list'") },
  async ({ page }) => {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 6: get_canonical_numbers
// ═══════════════════════════════════════════

registerTool(
  "get_canonical_numbers",
  "Returns all canonical numbers from canonical_values.yaml (single source of truth): innovations, crown jewels, patents, membership cost, creator keeps %, etc. Always reads fresh from disk.",
  {},
  async () => {
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
    } catch {
      // Fallback if YAML not found
      const fresh = loadIndex<Record<string, unknown>>("canonical");
      ensureFreshIndex();
      const canonical = fresh || context?.canonicalNumbers || {};
      const result = {
        innovationCount: (canonical as Record<string, unknown>).innovationCount || 2078,
        crownJewelCount: (canonical as Record<string, unknown>).crownJewelCount || 146,
        formalClaimsCount: (canonical as Record<string, unknown>).formalClaimsCount || 1511,
        provisionalApps: (canonical as Record<string, unknown>).provisionalApps || 10,
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
  }
);

// ═══════════════════════════════════════════
// TOOL 7: get_initiative
// ═══════════════════════════════════════════

const INITIATIVES: Record<string, { number: number; crown?: string }> = {
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

registerTool(
  "get_initiative",
  "Returns initiative details: crown holder, tables, pages, letters, status. Pass 'list' for all initiatives.",
  { name: z.string().describe("Initiative name (snake_case) or 'list'") },
  async ({ name }) => {
    if (name === "list") {
      const list = Object.entries(INITIATIVES).map(([k, v]) =>
        `#${v.number} ${k}${v.crown ? ` (Crown: ${v.crown})` : ""}`
      );
      return { content: [{ type: "text", text: `The Sweet Sixteen:\n${list.join("\n")}` }] };
    }

    const initiative = INITIATIVES[name.toLowerCase().replace(/\s+/g, "_")];
    if (!initiative) {
      return { content: [{ type: "text", text: `Initiative '${name}' not found. Use 'list' to see all.` }] };
    }

    const result: Record<string, unknown> = {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 8: get_session_context
// ═══════════════════════════════════════════

registerTool(
  "get_session_context",
  "Returns what was built in a session: files changed, commits, pending work. Without session_id returns the latest.",
  { session_id: z.string().optional().describe("Session ID (e.g. 'A', 'C', '98') or omit for latest") },
  async ({ session_id }) => {
    // K441 Half D: ensureFreshIndex() reloads only when the on-disk
    // fingerprint changes (after `npm run rebuild`). Cheap on the no-change
    // path, full reload on the change path. Replaces the prior unconditional
    // reloadAll() that paid the cost on every call.
    ensureFreshIndex();
    if (!context || !context.sessions.length) {
      return { content: [{ type: "text", text: "No session data available." }] };
    }

    let session: SessionEntry | undefined;
    if (session_id) {
      session = context.sessions.find(s => s.id === session_id || s.id.includes(session_id));
    } else {
      session = context.sessions[context.sessions.length - 1];
    }

    if (!session) {
      const ids = context.sessions.map(s => s.id).join(", ");
      return { content: [{ type: "text", text: `Session '${session_id}' not found. Available: ${ids}` }] };
    }

    return { content: [{ type: "text", text: JSON.stringify(session, null, 2) }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 9: search_knowledge
// ═══════════════════════════════════════════

registerTool(
  "search_knowledge",
  "Text search across all index files. Returns top matches with context.",
  {
    query: z.string().describe("Search query"),
    options: z.object({
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(200).optional(),
    }).optional().describe("Pagination options"),
  },
  async ({ query, options }) => {
    ensureFreshIndex();
    const results: { source: string; key: string; snippet: string }[] = [];
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
  }
);

// ═══════════════════════════════════════════
// TOOL 10: get_deploy_state
// ═══════════════════════════════════════════

registerTool(
  "get_deploy_state",
  "Returns last deploy info, pending migrations, pending function deploys, and build commands for each site.",
  {},
  async () => {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 11: update_session
// ═══════════════════════════════════════════

registerTool(
  "update_session",
  "Appends a session summary to the index. Call at session end instead of editing MILESTONE_HANDOFF.",
  {
    session_id: z.string().describe("Session identifier (e.g. 'K99')"),
    summary: z.string().describe("What was built/accomplished"),
    files_changed: z.array(z.string()).optional().describe("List of files changed"),
    migrations_created: z.array(z.string()).optional().describe("New migration filenames"),
    functions_created: z.array(z.string()).optional().describe("New edge function names"),
    pages_created: z.array(z.string()).optional().describe("New page names"),
    pending_work: z.array(z.string()).optional().describe("Tasks left for next session"),
  },
  async ({ session_id, summary, files_changed, migrations_created, functions_created, pages_created, pending_work }) => {
    const sessionsPath = resolve(INDEX_DIR, "sessions.json");

    let sessions: SessionEntry[] = [];
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

    const newSession: SessionEntry = {
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

    if (!existsSync(INDEX_DIR)) mkdirSync(INDEX_DIR, { recursive: true });
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
  }
);

// ═══════════════════════════════════════════
// TOOL 12: get_bishop_chat
// ═══════════════════════════════════════════

registerTool(
  "get_bishop_chat",
  "Returns summary, decisions, and topics from BISHOP chat transcripts. Pass filename for details, 'list' for recent 20, or 'search:keyword' to find by topic.",
  { chat: z.string().describe("Chat filename, 'list' for recent 20, or 'search:keyword'") },
  async ({ chat }) => {
    ensureFreshIndex();
    if (!bishop) {
      return { content: [{ type: "text", text: "Bishop index not built." }] };
    }

    if (chat.startsWith("search:")) {
      const query = chat.slice(7).toLowerCase().trim();
      const matches = Object.values(bishop.chats).filter(c =>
        c.summary.toLowerCase().includes(query) ||
        c.topicsDiscussed.some(t => t.includes(query)) ||
        c.keyDecisions.some(d => d.toLowerCase().includes(query))
      );
      const output = truncateList(matches.slice(0, 10), 10, c =>
        `${c.filename} | ${c.summary.slice(0, 80)}... | topics: ${c.topicsDiscussed.slice(0, 3).join(", ")}`
      );
      return {
        content: [{ type: "text", text: `${matches.length} chats matching '${query}':\n\n${output}` }],
      };
    }

    if (chat === "list") {
      const all = Object.values(bishop.chats);
      const output = truncateList(all.slice(-BUDGETS.listDefault), BUDGETS.listDefault, c =>
        `${c.filename} | ${c.wordCount} words | ${c.topicsDiscussed.slice(0, 3).join(", ")}`
      );
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
  }
);

// ═══════════════════════════════════════════
// TOOL 13: get_architecture
// ═══════════════════════════════════════════

const WORKSPACE_ROOT = resolve(__dirname, "..", "..");

registerTool(
  "get_architecture",
  "Returns architectural concept explanation from Cephas. Searches by keyword, slug, or title. Pass 'list' to see all concepts, or a keyword like 'joules', 'cost+20', 'three-gear', 'crown', 'medallion', etc. Set brief=true (default) for summary only, brief=false for full markdown content.",
  {
    concept: z.string().describe("Concept slug, keyword, or 'list' for all concepts"),
    brief: z.boolean().optional().describe("If true (default), returns summary only. Set false for full content."),
  },
  async ({ concept, brief }) => {
    const isBrief = brief !== false;
    ensureFreshIndex();
    if (!concepts) {
      return { content: [{ type: "text", text: "Concepts index not built. Run: cd librarian-mcp && npm run rebuild" }] };
    }

    if (concept === "list") {
      const byCategory: Record<string, string[]> = {};
      for (const [slug, c] of Object.entries(concepts.concepts)) {
        const cat = c.category || "uncategorized";
        if (!byCategory[cat]) byCategory[cat] = [];
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
      const byTitle = Object.values(concepts.concepts).find(c =>
        c.title.toLowerCase().includes(concept.toLowerCase())
      );
      if (byTitle) entry = byTitle;
    }

    if (!entry && concepts.byKeyword[concept.toLowerCase()]) {
      const slugs = concepts.byKeyword[concept.toLowerCase()];
      if (slugs.length === 1) {
        entry = concepts.concepts[slugs[0]];
      } else {
        const matches = slugs.map(s => {
          const c = concepts!.concepts[s];
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
      const fuzzyMatches = Object.values(concepts.concepts).filter(c =>
        c.keywords.some(k => k.includes(concept.toLowerCase())) ||
        c.title.toLowerCase().includes(concept.toLowerCase()) ||
        c.slug.includes(lower)
      );
      if (fuzzyMatches.length > 0) {
        const list = fuzzyMatches.slice(0, 10).map(c =>
          `- **${c.title}** [${c.slug}]: ${c.summary.slice(0, 100)}...`
        );
        return {
          content: [{
            type: "text",
            text: `No exact match for '${concept}'. Related concepts:\n\n${list.join("\n")}`,
          }],
        };
      }
      return { content: [{ type: "text", text: `No concept found for '${concept}'. Use 'list' to see all.` }] };
    }

    let contentField: string;
    if (isBrief) {
      contentField = entry.summary;
    } else {
      let fullContent = "";
      try {
        const contentDir = resolve(WORKSPACE_ROOT, "Cephas", "cephas-hugo", "content");
        const filePath = resolve(contentDir, entry.filePath);
        if (existsSync(filePath)) {
          fullContent = readFileSync(filePath, "utf-8");
          const fmEnd = fullContent.indexOf("---", 4);
          if (fmEnd > 0) fullContent = fullContent.slice(fmEnd + 3).trim();
        }
      } catch { /* fall back to summary */ }
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
  }
);

// ═══════════════════════════════════════════
// TOOL 14: check_consistency
// ═══════════════════════════════════════════

const ARCHITECTURAL_RULES: ArchitecturalRule[] = [
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
  { id: "crown-jewels-count", rule: "There are exactly 123 Crown Jewels filed across 8 provisional patent applications.", source: "IP Portfolio", severity: "important" },
  { id: "patent-portfolio", rule: "1,401 formal claims across 8 provisional applications. THE BEHEMOTH patent portfolio.", source: "IP Portfolio", severity: "important" },
  { id: "wyoming-c-corp", rule: "Legal entity is LIANA BANYAN CORPORATION, EIN 41-2797446, Wyoming C-Corp.", source: "Legal", severity: "critical" },
  { id: "cost-breakdown-required", rule: "All marketplace listings must show cost breakdown. Harper Auditors can verify costs.", source: "Marketplace Rules", severity: "important" },
  { id: "structural-bylaw-immutable", rule: "Structural Bylaws (Cost+20%, $5 membership, privacy, etc.) cannot be changed by normal vote. Requires Founder approval.", source: "Governance", severity: "critical" },
];

registerTool(
  "check_consistency",
  "Validates a proposal or statement against Liana Banyan's architectural rules and constraints. Returns violations, warnings, and confirmations. Use this before implementing features to ensure alignment.",
  { proposal: z.string().describe("Description of what you're about to build or a statement to validate") },
  async ({ proposal }) => {
    ensureFreshIndex();

    const lower = proposal.toLowerCase();
    const violations: { rule: ArchitecturalRule; explanation: string }[] = [];
    const warnings: { rule: ArchitecturalRule; explanation: string }[] = [];
    const confirmations: string[] = [];

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

    let relatedConcepts: string[] = [];
    if (concepts) {
      const conceptTerms = lower.split(/\s+/).filter(w => w.length > 3);
      const matchedSlugs = new Set<string>();
      for (const term of conceptTerms) {
        const kwMatches = concepts.byKeyword[term];
        if (kwMatches) {
          for (const slug of kwMatches) matchedSlugs.add(slug);
        }
      }
      relatedConcepts = [...matchedSlugs].slice(0, 5).map(slug => {
        const c = concepts!.concepts[slug];
        return c ? `${c.title} [${slug}]` : slug;
      });
    }

    const result: Record<string, unknown> = {};

    if (violations.length > 0) {
      result.status = "VIOLATIONS FOUND";
      result.violations = violations.map(v => ({
        severity: v.rule.severity,
        rule: v.rule.rule,
        source: v.rule.source,
        issue: v.explanation,
      }));
    } else {
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
  }
);

// ═══════════════════════════════════════════
// TOOL 14b: canonical_value_matches (K406)
// ═══════════════════════════════════════════

registerTool(
  "canonical_value_matches",
  "Verify a document's canonical values against the Liana Banyan source of truth (canonical_values.yaml). Finds stale numbers, wrong percentages, and unverified claims.",
  {
    document_path: z.string().describe("Relative path from repo root"),
    check_all: z.boolean().optional().describe("If true (default), check all canonical keys; if false, provide expected_values"),
    expected_values: z.record(z.union([z.string(), z.number()])).optional().describe("Optional specific key-value pairs to check"),
  },
  async ({ document_path, check_all, expected_values }) => {
    try {
      const checkValues = (check_all !== false && !expected_values) ? undefined : expected_values;
      const result = await canonicalValueMatches(document_path, checkValues);

      const lines: string[] = [];
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
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }] };
    }
  }
);

// ═══════════════════════════════════════════
// TOOL 15: get_dropzone_task
// ═══════════════════════════════════════════

registerTool(
  "get_dropzone_task",
  "Returns task prompts from KNIGHT/BISHOP/ROOK/PAWN dropzones. Pass agent name for that agent's tasks, a filename for details, or 'list' for all.",
  {
    query: z.string().describe("Agent name (KNIGHT/BISHOP/ROOK/PAWN), filename, or 'list'"),
    options: z.object({
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(200).optional(),
      session: z.string().optional(),
      pattern: z.string().optional(),
      sort: z.enum(["name", "date", "size"]).optional(),
    }).optional().describe("Pagination and filtering options"),
  },
  async ({ query, options }) => {
    ensureFreshIndex();
    if (!dropzones) {
      return { content: [{ type: "text", text: "Dropzone index not built." }] };
    }

    const allEntries = Object.values(dropzones.entries);
    const upper = query.toUpperCase();
    const applyFilters = (entries: typeof allEntries) => {
      let filtered = entries;
      if (options?.session) {
        const sessionNeedle = options.session.toUpperCase();
        filtered = filtered.filter((entry) =>
          entry.filename.toUpperCase().includes(sessionNeedle),
        );
      }
      if (options?.pattern) {
        const regex = globPatternToRegex(options.pattern);
        filtered = filtered.filter((entry) =>
          regex.test(entry.filename) || regex.test(entry.title),
        );
      }
      const sortBy = options?.sort ?? "name";
      if (sortBy === "size") {
        filtered = [...filtered].sort((a, b) => b.wordCount - a.wordCount);
      } else if (sortBy === "date") {
        filtered = [...filtered].sort((a, b) => b.filename.localeCompare(a.filename));
      } else {
        filtered = [...filtered].sort((a, b) => a.filename.localeCompare(b.filename));
      }
      return filtered;
    };

    const summarizeDropzone = (entry: typeof allEntries[number]) => ({
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
        .map(key => dropzones!.entries[key])
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

    const entry = Object.values(dropzones.entries).find(e =>
      e.filename.toLowerCase().includes(query.toLowerCase()) ||
      e.title.toLowerCase().includes(query.toLowerCase())
    );
    if (entry) {
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }

    return { content: [{ type: "text", text: `No dropzone task matching '${query}'. Use 'list' to see all.` }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 16: get_transcript
// ═══════════════════════════════════════════

registerTool(
  "get_transcript",
  "Returns summaries of Cursor agent chat transcripts. Pass a session UUID for details, 'recent' for latest 10, or 'list' for all.",
  { query: z.string().describe("Session UUID, 'recent', or 'list'") },
  async ({ query }) => {
    ensureFreshIndex();
    if (!transcripts) {
      return { content: [{ type: "text", text: "Transcript index not built." }] };
    }

    if (query === "list" || query === "recent") {
      const all = Object.values(transcripts.transcripts)
        .sort((a, b) => (b.estimatedDate || "").localeCompare(a.estimatedDate || ""));
      const subset = query === "recent" ? all.slice(0, 10) : all;
      const lines = subset.map(t =>
        `${t.id.slice(0, 8)} | ${t.estimatedDate || "?"} | ${t.messageCount} msgs | ${t.summary.slice(0, 80)}...`
      );
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
  }
);

// ═══════════════════════════════════════════
// TOOL 17: get_component
// ═══════════════════════════════════════════

registerTool(
  "get_component",
  "Returns exports, imports, Supabase queries, and props for React components, hooks, or libs. Pass name for details or 'list' for all.",
  {
    query: z.string().describe("Component/hook/lib name, or 'list'/'hooks'/'libs' to browse"),
    options: z.object({
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(200).optional(),
      type: z.enum(["component", "hook", "lib"]).optional(),
    }).optional().describe("Pagination and type filter options"),
  },
  async ({ query, options }) => {
    ensureFreshIndex();
    if (!components) {
      return { content: [{ type: "text", text: "Component index not built." }] };
    }

    const allComponents = [
      ...Object.values(components.components),
      ...Object.values(components.hooks),
      ...Object.values(components.libs),
    ];

    const summarizeComponent = (entry: typeof allComponents[number]) => ({
      name: entry.name,
      type: entry.type,
      path: entry.path,
      exports: entry.exports.slice(0, 8),
      supabaseQueries: entry.supabaseQueries,
    });

    const applyTypeFilter = (entries: typeof allComponents) => {
      if (!options?.type) return entries;
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
    const entry =
      Object.values(components.components).find(c => c.name.toLowerCase() === lower) ||
      components.hooks[query] ||
      components.libs[query] ||
      Object.values(components.components).find(c => c.name.toLowerCase().includes(lower)) ||
      Object.values(components.libs).find(c => c.name.toLowerCase().includes(lower));

    if (entry) {
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }

    return { content: [{ type: "text", text: `No component matching '${query}'.` }] };
  }
);

// ═══════════════════════════════════════════
// K419 — TRIPLE SCRAMBLER VERIFICATION TRIGGERS
// Trigger 1: hardwired into brief_me + moneypenny_debrief
// Trigger 2: file-based watchdog (4hr staleness check)
// Trigger 3: Cursor hooks (configured in .cursor/hooks.json)
// ═══════════════════════════════════════════

const SCRAMBLER_REPORT_DIR = resolve(__dirname, "..", "data", "scrambler-reports");
const SCRAMBLER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SCRAMBLER_WATCHDOG_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours

let _scramblerCache: { result: any; timestamp: number } | null = null;

function runTripleScrambler(sessionId: string, timeoutMs: number = 30_000): any {
  // Check cache first
  if (_scramblerCache && (Date.now() - _scramblerCache.timestamp) < SCRAMBLER_CACHE_TTL_MS) {
    return { ..._scramblerCache.result, _cached: true };
  }

  try {
    const output = execSync(
      `python "${resolve(__dirname, "..", "scrambler", "reconcile.py")}" "${sessionId}"`,
      {
        cwd: resolve(__dirname, "..", "scrambler"),
        timeout: timeoutMs,
        encoding: "utf-8",
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );
    const result = JSON.parse(output);

    // Cache it
    _scramblerCache = { result, timestamp: Date.now() };

    // Write report to disk (Trigger 2 evidence)
    try {
      mkdirSync(SCRAMBLER_REPORT_DIR, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const reportPath = resolve(SCRAMBLER_REPORT_DIR, `${ts}.json`);
      writeFileSync(reportPath, JSON.stringify(result, null, 2) + "\n", "utf-8");
    } catch { /* non-fatal */ }

    return result;
  } catch (err: unknown) {
    const e = err as { message?: string };
    return {
      _error: true,
      _message: e.message?.includes("TIMEOUT") || e.message?.includes("timed out")
        ? "Triple scrambler timed out (30s limit). Verification skipped."
        : `Triple scrambler error: ${(e.message || "unknown").slice(0, 200)}`,
    };
  }
}

function formatVerificationSection(result: any): string {
  if (result._error) {
    return `\n## ⚠️ Verification Status\n${result._message}\n`;
  }

  const a = result.scrambler_a || {};
  const b = result.scrambler_b || {};
  const c = result.scrambler_c || {};
  const st = result.staleness || {};
  const health = result.system_health || {};
  const cached = result._cached ? " (cached)" : "";

  const lines: string[] = [];
  lines.push(`\n## Verification Status${cached}`);
  lines.push(`Health: **${health.status || "UNKNOWN"}** | A conflicts: ${a.conflicts || 0} | B disagreements: ${b.disagreements || 0} | C escalations: ${c.escalations || 0}`);
  lines.push(`Stale: ${st.stale_deliverables || 0} | Auto-complete candidates: ${st.auto_complete_candidates || 0} | Session gaps: ${st.session_gaps || 0} | Orphaned: ${(result.details?.stale_flags || []).filter((f: any) => f.flag === "ORPHANED").length}`);

  if (health.issues?.length > 0) {
    for (const issue of health.issues) {
      lines.push(`- ${issue}`);
    }
  }

  const details = result.details || {};
  if (details.c_decisions?.length > 0) {
    lines.push(`\n### UNRESOLVED — Founder Review Required`);
    for (const d of details.c_decisions.filter((dd: any) => dd.escalate)) {
      lines.push(`- **${d.deliverable_id}** → ${d.decision}: ${d.reasoning}`);
    }
  }
  if (details.auto_candidates?.length > 0) {
    // K442: letter deliverables now have explicit state via Letters summary block,
    // so we exclude them from the file-existence "POSSIBLY COMPLETED" heuristic.
    const nonLetter = details.auto_candidates.filter((ac: any) => !isLetterDeliverableId(ac.deliverable_id || ""));
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

function getLastReportAge(): number {
  try {
    if (!existsSync(SCRAMBLER_REPORT_DIR)) return Infinity;
    const files = require("fs").readdirSync(SCRAMBLER_REPORT_DIR) as string[];
    if (files.length === 0) return Infinity;
    const latest = files.sort().reverse()[0];
    const stat = require("fs").statSync(resolve(SCRAMBLER_REPORT_DIR, latest));
    return Date.now() - stat.mtimeMs;
  } catch {
    return Infinity;
  }
}

function checkHooksConfigured(): { configured: boolean; missing: string[] } {
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
        const allMatchers = new Set<string>();

        for (const eventHooks of Object.values(hooks) as any[][]) {
          if (Array.isArray(eventHooks)) {
            for (const h of eventHooks) {
              if (h.matcher) allMatchers.add(h.matcher);
            }
          }
        }

        const missing = requiredMatchers.filter(m => !allMatchers.has(m));
        return { configured: missing.length === 0, missing };
      } catch {
        return { configured: false, missing: requiredMatchers };
      }
    }
  }

  return { configured: false, missing: requiredMatchers };
}

// ═══════════════════════════════════════════
// K442 — LETTER STATE SUMMARY (3-state ladder)
// Replaces the file-existence "POSSIBLY COMPLETED" heuristic for letter
// deliverables. Calls librarian-mcp/touchstone/verify.py --letters-summary
// (cached 5 min) and renders a compact state breakdown.
// ═══════════════════════════════════════════

interface LetterStateSummary {
  by_state: Record<string, number>;
  by_recipient: Array<{
    id: string;
    title?: string;
    recipient: string;
    state: string;
    resolved_path?: string | null;
  }>;
}

const LETTER_SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;
let _letterSummaryCache: { result: LetterStateSummary | null; timestamp: number } | null = null;

function getLetterStateSummary(): LetterStateSummary | null {
  if (_letterSummaryCache && (Date.now() - _letterSummaryCache.timestamp) < LETTER_SUMMARY_CACHE_TTL_MS) {
    return _letterSummaryCache.result;
  }
  try {
    const verifyPath = resolve(__dirname, "..", "touchstone", "verify.py");
    if (!existsSync(verifyPath)) return null;
    const output = execSync(`python "${verifyPath}" --letters-summary`, {
      cwd: resolve(__dirname, "..", "touchstone"),
      timeout: 15_000,
      encoding: "utf-8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    const parsed = JSON.parse(output) as LetterStateSummary;
    _letterSummaryCache = { result: parsed, timestamp: Date.now() };
    return parsed;
  } catch {
    _letterSummaryCache = { result: null, timestamp: Date.now() };
    return null;
  }
}

function formatLetterStateBlock(summary: LetterStateSummary | null): string {
  if (!summary) return "";
  const s = summary.by_state || {};
  const total = Object.values(s).reduce((a, b) => a + (b || 0), 0);
  if (total === 0) return "";

  const lines: string[] = [];
  lines.push(`\n### Letters state summary (${total} letter deliverables)`);
  lines.push(`- Pending (no draft on disk): ${s.pending || 0}`);
  lines.push(`- Drafted but not locked: ${s.drafted || 0}`);
  lines.push(`- Locked, awaiting dispatch: ${s.locked || 0}`);
  lines.push(`- Dispatched, awaiting response: ${s.dispatched || 0}`);
  lines.push(`- Response received: ${s.response_received || 0}`);
  if ((s.blocked || 0) > 0) lines.push(`- Blocked (Founder hold): ${s.blocked}`);
  return lines.join("\n");
}

// Letter deliverable ids carry the "letter_" / "crown-letter-" / "wave-N-letter-" prefix.
// Used to filter them out of the legacy auto-complete-candidates block, which is
// now superseded for letters by the state summary above.
function isLetterDeliverableId(id: string): boolean {
  return /(^|-)letter-/.test(id) || /^wave-\d+-letter-/.test(id);
}

// ═══════════════════════════════════════════
// TOOL 18: brief_me (MoneyPenny)
// ═══════════════════════════════════════════

registerTool(
  "brief_me",
  "MoneyPenny Smart Router: returns a compact, task-scoped context package in ~600 words. Call this FIRST at session start instead of multiple individual queries. Replaces the need for get_system_overview + query_domain + get_architecture + check_consistency.",
  { task: z.string().describe("Natural language description of what you're about to work on, e.g. 'build housing payment contribution form'") },
  async ({ task }) => {
    ensureFreshIndex();

    const pkg = buildBriefing(
      task, overview, schemas, functions, pages, concepts,
      domains, context, dropzones, transcripts, ARCHITECTURAL_RULES,
    );

    const sections: string[] = [];
    sections.push(`## MoneyPenny Briefing: ${task}\n`);

    sections.push(`### Canonical Numbers`);
    sections.push(Object.entries(pkg.canonicalReminders).map(([k, v]) => `${k}: ${v}`).join(" | "));

    if (pkg.matchedDomains.length > 0) {
      sections.push(`\n### Matched Domains`);
      for (const d of pkg.matchedDomains) {
        sections.push(`**${d.name}**`);
        if (d.tables.length) sections.push(`  Tables: ${d.tables.join(", ")}`);
        if (d.functions.length) sections.push(`  Functions: ${d.functions.map(f => `${f.name}: ${truncateToWords(f.purpose, 8)}`).join("; ")}`);
        if (d.pages.length) sections.push(`  Pages: ${d.pages.map(p => `${p.route} -> ${p.name}`).join("; ")}`);
        if (d.featureFlags.length) sections.push(`  Flags: ${d.featureFlags.join(", ")}`);
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
    if (letterStateBlock) sections.push(letterStateBlock);

    // ── K419 Trigger 1A: Triple Scrambler at session start ──
    const verificationSections: string[] = [];
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
      } else if (freshness.status === "FRESH") {
        const ageMin = freshness.ageMs! < 60000 ? "<1m" : `${Math.round(freshness.ageMs! / 60000)}m`;
        verificationSections.push(`_Index: fresh (${ageMin} ago)_`);
      }
    } catch { /* non-fatal */ }

    // If issues exist, put verification BEFORE task context
    const hasIssues = !scramblerResult._error && (
      scramblerResult.system_health?.status === "NEEDS_ATTENTION" ||
      !hookStatus.configured ||
      indexDrift
    );

    let finalOutput: string;
    if (hasIssues) {
      finalOutput = budgetEnforce(
        verificationSections.join("\n") + "\n\n" + sections.join("\n"),
        BUDGETS.briefMe + 200,
      );
    } else {
      finalOutput = budgetEnforce(
        sections.join("\n") + "\n" + verificationSections.join("\n"),
        BUDGETS.briefMe + 200,
      );
    }

    return { content: [{ type: "text", text: finalOutput }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 19: moneypenny_checklist
// ═══════════════════════════════════════════

registerTool(
  "moneypenny_checklist",
  "MoneyPenny pre-flight check. Validates a proposed task against architectural rules, identifies missing prerequisites (tables, functions), finds related past sessions, and returns contextual reminders. Call before implementing.",
  { task: z.string().describe("Description of what you're about to implement") },
  async ({ task }) => {
    ensureFreshIndex();

    const result = buildChecklist(
      task, schemas, functions, context, concepts,
      domains, dropzones, ARCHITECTURAL_RULES,
    );

    const sections: string[] = [];
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
    } catch { /* non-fatal */ }

    const output = budgetEnforce(sections.join("\n"), BUDGETS.checklist);
    return { content: [{ type: "text", text: output }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 20: moneypenny_debrief
// ═══════════════════════════════════════════

registerTool(
  "moneypenny_debrief",
  "MoneyPenny session-end debrief. Logs what was built, validates consistency, generates sync reminders and handoff notes. Call at session end instead of manually editing MILESTONE_HANDOFF.",
  {
    session_id: z.string().describe("Session identifier (e.g. 'K100')"),
    summary: z.string().describe("What was built/accomplished this session"),
    files_changed: z.array(z.string()).optional().describe("Files changed"),
    migrations_created: z.array(z.string()).optional().describe("New migrations"),
    functions_created: z.array(z.string()).optional().describe("New edge functions"),
    pages_created: z.array(z.string()).optional().describe("New pages"),
    pending_work: z.array(z.string()).optional().describe("Tasks for next session"),
  },
  async ({ session_id, summary, files_changed, migrations_created, functions_created, pages_created, pending_work }) => {
    const result = buildDebrief(
      session_id, summary,
      files_changed || [], migrations_created || [],
      functions_created || [], pages_created || [],
      pending_work || [],
      INDEX_DIR, overview, ARCHITECTURAL_RULES,
    );

    const sections: string[] = [];
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
      for (const sl of summaryLines) sections.push(`- ${sl.trim()}`);
    } catch { /* non-fatal */ }

    // ── K419 Trigger 1B: Triple Scrambler at session end ──
    _scramblerCache = null; // Force fresh run at session end
    const scramblerResult = runTripleScrambler(session_id);

    if (!scramblerResult._error) {
      sections.push(formatVerificationSection(scramblerResult));

      // K442: include Letters state summary in debrief so closeout always shows the ladder counts.
      _letterSummaryCache = null; // force fresh at session end
      const debriefLetterSummary = getLetterStateSummary();
      const debriefLetterBlock = formatLetterStateBlock(debriefLetterSummary);
      if (debriefLetterBlock) sections.push(debriefLetterBlock);

      const details = scramblerResult.details || {};
      // Auto-flag deliverables matching this session's work.
      // K442: skip letter deliverables — their state is reported via the Letters summary block.
      if (details.auto_candidates?.length > 0) {
        const matchingCandidates = details.auto_candidates.filter((ac: any) => {
          if (isLetterDeliverableId(ac.deliverable_id || "")) return false;
          const titleLower = (ac.title || "").toLowerCase();
          const summaryLower = summary.toLowerCase();
          return titleLower.split(/\s+/).some((w: string) => w.length > 4 && summaryLower.includes(w));
        });
        if (matchingCandidates.length > 0) {
          sections.push(`\n### Session Match — Auto-Complete Candidates`);
          for (const mc of matchingCandidates) {
            sections.push(`- [AUTO-COMPLETE CANDIDATE] **${mc.deliverable_id}**: ${mc.title}`);
          }
        }
      }

      // Escalations for Founder
      const escalations = (details.c_decisions || []).filter((d: any) => d.escalate);
      if (escalations.length > 0) {
        sections.push(`\n### UNRESOLVED — Founder Review Required`);
        for (const e of escalations) {
          sections.push(`- **${e.deliverable_id}** → ${e.decision}: ${e.reasoning}`);
        }
      }
    } else {
      sections.push(`\n### ⚠️ Verification`);
      sections.push(scramblerResult._message || "Triple scrambler did not complete.");
    }

    const output = budgetEnforce(sections.join("\n"), BUDGETS.debrief + 200);
    return { content: [{ type: "text", text: output }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 21: get_migration_status
// ═══════════════════════════════════════════

registerTool(
  "get_migration_status",
  "Returns v1→v2 domain migration tracker. Shows which domains are audited, migrated, or verified. Pass 'list' for overview or a domain name for details.",
  { query: z.string().describe("Domain name or 'list' for overview") },
  async ({ query }) => {
    ensureFreshIndex();
    if (!v2Migration) {
      return { content: [{ type: "text", text: "v2-migration index not built yet. Run: cd librarian-mcp && npm run rebuild" }] };
    }

    if (query === "list") {
      const lines: string[] = [];
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
    if (domain.auditSession) detail.push(`\nAudit Session: ${domain.auditSession}`);
    if (domain.notes) detail.push(`Notes: ${domain.notes}`);

    return { content: [{ type: "text", text: detail.join("\n") }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 22: get_letter_status
// ═══════════════════════════════════════════

registerTool(
  "get_letter_status",
  "Returns letter tracking status. Pass 'list' for overview, 'crown'/'media'/'political' for category, 'draft'/'locked'/'sent' for status, or a recipient name for details.",
  { query: z.string().describe("'list', category name, status name, or recipient name") },
  async ({ query }) => {
    ensureFreshIndex();
    if (!letters) {
      return { content: [{ type: "text", text: "Letters index not built yet. Run: cd librarian-mcp && npm run rebuild" }] };
    }

    if (query === "list") {
      const lines: string[] = [];
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
    const matches = Object.values(letters.letters).filter(l =>
      l.recipient.toLowerCase().includes(query.toLowerCase()) ||
      l.filename.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
      return { content: [{ type: "text", text: `No letters found matching '${query}'. Try 'list' to see all.` }] };
    }

    const lines: string[] = [];
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
  }
);

// ═══════════════════════════════════════════
// TOOL 23: get_diff_since_session
// ═══════════════════════════════════════════

registerTool(
  "get_diff_since_session",
  "Returns what changed since a given session. Compares current session list against a baseline session ID. Shows new sessions, files changed, migrations, and functions since then.",
  { session_id: z.string().describe("Baseline session ID (e.g. 'K200', 'B054'). Shows everything after this session.") },
  async ({ session_id }) => {
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

    const allFiles = new Set<string>();
    const allMigrations = new Set<string>();
    const allFunctions = new Set<string>();
    const allPages = new Set<string>();

    for (const s of newSessions) {
      for (const f of s.filesChanged) allFiles.add(f);
      for (const m of s.migrationsCreated) allMigrations.add(m);
      for (const fn of s.functionsCreated) allFunctions.add(fn);
      for (const p of s.pagesCreated) allPages.add(p);
    }

    const lines: string[] = [];
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
      for (const m of allMigrations) lines.push(`- ${m}`);
    }

    if (allFunctions.size > 0) {
      lines.push(`\n### New Functions`);
      for (const fn of allFunctions) lines.push(`- ${fn}`);
    }

    if (allPages.size > 0) {
      lines.push(`\n### New Pages`);
      for (const p of allPages) lines.push(`- ${p}`);
    }

    return { content: [{ type: "text", text: budgetEnforce(lines.join("\n"), 600) }] };
  }
);

// ═══════════════════════════════════════════
// STITCHPUNK CORPS — Auto-Wire Tools
// ═══════════════════════════════════════════

const STITCHPUNK_DIR = resolve(__dirname, "..", "stitchpunks");

function runStitchpunkHook(script: string, args: string[]): string {
  const cmd = `python "${resolve(STITCHPUNK_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
  try {
    const output = execSync(cmd, {
      cwd: STITCHPUNK_DIR,
      timeout: 120_000,
      encoding: "utf-8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    return output;
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return `ERROR running ${script}:\n${e.stdout || ""}\n${e.stderr || e.message || "Unknown error"}`;
  }
}

registerTool(
  "run_session_start",
  "Runs the Stitchpunk Corps session start hook (SP-6 Scribe, SP-1 Cartographer, SP-5 Sentinel, SP-7 Courier). Call at the beginning of any agent session.",
  {
    agent: z.string().describe("Agent type: BISHOP, KNIGHT, ROOK, or PAWN"),
    session_id: z.string().describe("Session identifier (e.g. 'B064', 'K231')"),
    task: z.string().optional().describe("Task description for this session"),
  },
  async ({ agent, session_id, task }) => {
    const sections: string[] = [];

    // Canonical values health check at session start
    try {
      const flat = loadCanonicalFlat();
      const overviewPath = resolve(INDEX_DIR, "overview.json");
      if (existsSync(overviewPath)) {
        const ov = JSON.parse(readFileSync(overviewPath, "utf-8"));
        const drifts: string[] = [];
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
          for (const d of drifts) sections.push(`  - ${d}`);
          sections.push("  Action: run 'cd librarian-mcp && npm run rebuild' to resync, or update canonical_values.yaml if values changed.");
        } else {
          sections.push("✅ Canonical values: overview.json matches canonical_values.yaml");
        }
      }
    } catch (err) {
      sections.push(`⚠️  Canonical check skipped: ${(err as Error).message}`);
    }

    // K429 Half B: Index freshness check
    try {
      const freshness = await checkFreshness(INDEX_DIR, WORKSPACE_ROOT);
      if (freshness.status === "FRESH") {
        const ageMin = freshness.ageMs! < 60000 ? "<1m" : `${Math.round(freshness.ageMs! / 60000)}m`;
        sections.push(`✅ Librarian index: FRESH (built ${freshness.lastBuild}, ${ageMin} ago)`);
      } else if (freshness.status === "DRIFT") {
        const ageHr = Math.round((freshness.ageMs || 0) / 3600000);
        sections.push(`⚠️  LIBRARIAN INDEX DRIFT — ${freshness.totalDrift} files changed since last build (${ageHr}h ago)`);
        if (freshness.newFiles.length) sections.push(`  New: ${freshness.newFiles.slice(0, 5).join(", ")}${freshness.newFiles.length > 5 ? ` (+${freshness.newFiles.length - 5} more)` : ""}`);
        if (freshness.changedFiles.length) sections.push(`  Modified: ${freshness.changedFiles.slice(0, 5).join(", ")}${freshness.changedFiles.length > 5 ? ` (+${freshness.changedFiles.length - 5} more)` : ""}`);
        sections.push(`  Action: run \`cd librarian-mcp && npm run rebuild\` to resync.`);
      } else {
        sections.push(`⚠️  Librarian index: no fingerprint found. Run \`cd librarian-mcp && npm run rebuild:full\` to initialize.`);
      }
    } catch (err) {
      sections.push(`⚠️  Index freshness check skipped: ${(err as Error).message}`);
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
      sections.push(
        `SP-22/23 Cathedral: ${scribeIds.length} Scribes registered (${scribeIds.join(", ")}), ${allTimeEntries} total tablet entries all-time. Consult via consult_scribes tool.`
      );
    } catch (err) {
      sections.push(`SP-22/23 Cathedral: status unavailable (${(err as Error).message})`);
    }

    return { content: [{ type: "text", text: sections.join("\n") }] };
  }
);

registerTool(
  "run_session_end",
  "Runs the Stitchpunk Corps session end hook (SP-6 Scribe, SP-1 Cartographer, SP-3 Classifier, SP-8 Herald, SP-10 Pipeline Bridge). Call at the end of any agent session. This auto-wires content to the Staff of Librarians. Optionally logs substrate savings when token counts are supplied.",
  {
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
  },
  async ({
    agent, session_id, summary,
    input_tokens, output_tokens, substrate_overhead_tokens,
    substrate_injection_count, vendor, model, friction_confirmations
  }) => {
    const output = runStitchpunkHook("session_end.py", [agent, session_id, summary]);

    // SP-22/23 Cathedral session summary (K436)
    const cathedralLines: string[] = ["", "── SP-22/23 Cathedral session summary ──"];
    try {
      const sessionTidbits = readTidbits({ session: session_id });
      const tidbitsByCategory = new Map<string, number>();
      for (const t of sessionTidbits) {
        tidbitsByCategory.set(t.category, (tidbitsByCategory.get(t.category) || 0) + 1);
      }
      const tidbitSummary =
        sessionTidbits.length === 0
          ? "0 (none — under-verification flag if non-trivial session)"
          : `${sessionTidbits.length} (${Array.from(tidbitsByCategory.entries())
              .map(([k, v]) => `${v} ${k}`)
              .join(", ")})`;
      cathedralLines.push(`SP-21 Tidbits this session: ${tidbitSummary}`);

      // Per-Scribe entries this session
      const scribeIds = listScribeIds();
      const perScribe: Array<{ id: string; n: number }> = [];
      for (const id of scribeIds) {
        const entries = readTablet(id).filter((e) => e.session === session_id);
        if (entries.length > 0) perScribe.push({ id, n: entries.length });
      }
      const scribeTotal = perScribe.reduce((s, x) => s + x.n, 0);
      const scribeSummary =
        scribeTotal === 0
          ? "0 entries logged"
          : `${scribeTotal} entries (${perScribe.map((p) => `${p.n} ${p.id}`).join(", ")})`;
      cathedralLines.push(`SP-23 Scribe tablet entries this session: ${scribeSummary}`);

      // Fates dispatches
      const fatesThisSession = readFatesLog({ session: session_id });
      const dispatchCount = fatesThisSession.reduce(
        (s, r) => s + (r.atropos_dispatch?.length || 0),
        0,
      );
      cathedralLines.push(
        `SP-22 Fates routings this session: ${fatesThisSession.length} pipeline runs → ${dispatchCount} dispatches`,
      );

      // Coverage gaps
      const gapSet = new Set<string>();
      for (const r of fatesThisSession) {
        for (const g of r.coverage_gaps || []) gapSet.add(g);
      }
      cathedralLines.push(
        `Coverage gaps detected: ${gapSet.size === 0 ? "none" : Array.from(gapSet).slice(0, 8).join(", ") + (gapSet.size > 8 ? `, +${gapSet.size - 8} more` : "")}`,
      );

      // Hottest Scribe
      if (perScribe.length > 0) {
        const hottest = [...perScribe].sort((a, b) => b.n - a.n)[0];
        cathedralLines.push(`Hottest Scribe this session: ${hottest.id} (${hottest.n} entries)`);
      } else {
        cathedralLines.push(`Hottest Scribe this session: (none — Cathedral idle)`);
      }
    } catch (err) {
      cathedralLines.push(`(Cathedral summary failed: ${(err as Error).message})`);
    }

    // K505/K506 — Substrate savings
    // K506 Phase A: auto-populate injection_count + overhead_tokens from session tracker
    // when the caller didn't supply them (or supplied 0).
    const autoInjections =
      (substrate_injection_count == null || substrate_injection_count === 0)
        ? _sessionTracker.injection_count
        : substrate_injection_count;
    const autoOverhead =
      (substrate_overhead_tokens == null || substrate_overhead_tokens === 0)
        ? _sessionTracker.overhead_tokens_estimate
        : substrate_overhead_tokens;
    const autoMode = (substrate_injection_count == null || substrate_injection_count === 0) &&
                     _sessionTracker.injection_count > 0;

    // Reset tracker so next session starts fresh
    _resetSessionTracker();

    const savingsLines: string[] = [];
    if (input_tokens != null && input_tokens > 0 && output_tokens != null && output_tokens > 0) {
      try {
        const agentUpper = agent.toUpperCase() as "BISHOP" | "KNIGHT" | "PAWN" | "ROOK";
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
        const record: SavingsRecord = {
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
      } catch (err) {
        savingsLines.push(`(K506 savings logging failed: ${(err as Error).message})`);
      }
    } else {
      savingsLines.push("", `── Substrate Savings ──`);
      savingsLines.push(`  Session tracker: ${_sessionTracker.injection_count + autoInjections} MCP calls (reset). Supply input_tokens + output_tokens to log savings.`);
    }

    return {
      content: [{ type: "text", text: output + "\n" + cathedralLines.join("\n") + savingsLines.join("\n") }],
    };
  }
);

// ═══════════════════════════════════════════
// K506 Phase A — SESSION TELEMETRY TOOLS
// ═══════════════════════════════════════════

registerTool(
  "get_session_telemetry",
  "K506: Returns the auto-tracked MCP call count and estimated overhead tokens accumulated since the last run_session_end (or server start). Use this to inspect current session telemetry before calling run_session_end. The tracker resets on each run_session_end call.",
  {},
  async () => {
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
  }
);

// ═══════════════════════════════════════════
// SP-21 + SP-22/23 — TIDBIT + CATHEDRAL TOOLS (K436)
// ═══════════════════════════════════════════

registerTool(
  "log_tidbit",
  "Append a verification-behavior tidbit to the SP-21 ledger (stitchpunks/data/tidbits.jsonl). Call whenever you perform a BRIDLE-Rule-2-style pre-assertion check (verified a slot, file, commit, symbol, route, or canonical value before claiming it). Returns the new line count.",
  {
    agent: z.enum(["BISHOP", "KNIGHT", "ROOK", "PAWN"]).describe("Calling agent"),
    session: z.string().regex(/^[BKRP]\d+$/).describe("Session id, e.g. B116, K436"),
    category: z.string().min(3).describe("verify_<action>, e.g. verify_slot_number, verify_file_exists"),
    observation: z.string().min(10).max(500).describe("One-sentence description of what was checked and what was found"),
    artifact: z.string().optional().describe("File path or symbol the verification served"),
  },
  async ({ agent, session, category, observation, artifact }) => {
    try {
      const result = appendTidbit({
        agent: agent as AgentName,
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
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

registerTool(
  "fates_route",
  "Run the Three Fates pipeline (Clotho extracts themes, Lachesis scores against registered Scribes, Atropos returns dispatch directives) over a chunk of session text. Always logs the routing record to stitchpunks/data/fates_log.jsonl. Caller decides whether to act on the dispatch directives by calling scribe_log.",
  {
    session_id: z.string().describe("Session identifier (e.g. 'B116', 'K436')"),
    text: z.string().min(20).describe("The session text to route (typically the latest Founder turn + agent response)"),
    agent: z.enum(["BISHOP", "KNIGHT", "ROOK", "PAWN"]).describe("Calling agent"),
    source_exchange: z.string().optional().describe("Short label for this exchange, used in the fates_log record"),
  },
  async ({ session_id, text, agent, source_exchange }) => {
    try {
      const result = runFates(text);
      const logResult = appendFatesLog({
        session: session_id,
        agent: agent as AgentName,
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
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

registerTool(
  "scribe_log",
  "Append an observation to a specific Scribe's tablet (stitchpunks/scribes/scribe_<id>.jsonl). The scribe_id MUST be registered in registry.yaml — unknown ids are rejected (registration is a deliberate registry edit, not an on-the-fly call).",
  {
    scribe_id: z.string().describe("Registered Scribe id, e.g. R9, BRIDLE, Landing, Prov14, Vault"),
    session_id: z.string().describe("Session identifier"),
    observation: z.string().min(10).max(500).describe("Observation text — the durable record"),
    source: z.enum([
      "founder_dialogue", "bishop_ship", "knight_ship",
      "bishop_read", "bishop_thresh", "bishop_design",
      "scribe_thresh", "fates_auto",
    ]).describe("Provenance of this observation"),
    canonical_ref: z.string().optional().describe("Pointer to the canonical document/file this observation references"),
  },
  async ({ scribe_id, session_id, observation, source, canonical_ref }) => {
    if (!getScribe(scribe_id)) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: "unknown_scribe",
            scribe_id,
            registered: listScribeIds(),
            note: "Add the Scribe to registry.yaml first (deliberate edit), then retry.",
          }, null, 2),
        }],
      };
    }
    try {
      const result = appendScribeEntry({
        scribe_id,
        session: session_id,
        observation,
        source: source as ScribeSource,
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
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

registerTool(
  "consult_scribes",
  "RAM-access pattern for the Cathedral: query Scribes for recent observations on a topic. Scores topic against every registered Scribe's primary + adjacent fields, returns up to max_entries from the highest-scoring Scribes (primary first, adjacents next if include_adjacents=true). Extended K455c/B121: accepts cathedral ('bishop'=default or 'knight') and scope ('public'=default, 'private', 'guild:<name>', 'tribe:<name>') for cross-Cathedral consultation and permissioned scope filtering. Extended K466/B121: Scribes declare mode='observational' (default, recency top-K) or mode='corpus' (full deterministic retrieval for static reference corpora like R11). Default max_entries for corpus-mode queries is 100; for observational is 20. Optimized for fast mid-session retrieval (target p95 < 200ms for 20-tablet cathedral).",
  {
    topic: z.string().min(2).describe("Topic to look up — keyword, phrase, named entity, or canonical id"),
    max_entries: z.number().int().min(1).max(500).optional().describe("Maximum entries to return (default 20 for observational Scribes, 100 for corpus Scribes). Explicit override respected for both modes."),
    since_ts: z.string().optional().describe("ISO-8601 timestamp; only entries newer than this are returned"),
    include_adjacents: z.boolean().optional().describe("If true (default), also return entries from Scribes that match only on adjacent fields"),
    cathedral: z.enum(["bishop", "knight"]).optional().describe("Which Cathedral to consult: 'bishop' (default, Bishop's stitchpunks Cathedral) or 'knight' (Knight's Cathedral — cooperative-corpus flywheel, K455c). Added K455c/B121."),
    scope: z.string().optional().describe("Scope filter: 'public' (default), 'private', 'guild:<name>', or 'tribe:<name>'. Silent filter — non-matching entries omitted, not error. Added K455c/B121."),
  },
  async ({ topic, max_entries, since_ts, include_adjacents, cathedral, scope }) => {
    try {
      const result = consultScribes({
        topic, max_entries, since_ts, include_adjacents,
        cathedral: cathedral as "bishop" | "knight" | undefined,
        scope,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

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

registerTool(
  "member_consult_scribes",
  "Cathedral retrieval (#2268) — query a member's own Scribes plus optionally any commons-shared Scribes from other members. Returns top_k entries ranked by relevance (member's own ranked above shared at equal score). Backed by cathedral.member_scribes + cathedral.scribe_entries. Sibling of consult_scribes (which reads stitchpunks tablets).",
  {
    member_id: z.string().uuid().describe("Member's auth.users.id (UUID)"),
    query: z.string().min(5).max(2000).describe("Topic / phrase / canonical id to look up"),
    top_k: z.number().int().min(1).max(50).optional().describe("Maximum entries to return (default 10)"),
    since_ts: z.string().optional().describe("ISO-8601; only entries newer than this are returned"),
    include_shared: z.boolean().optional().describe("If true (default), also consult commons-shared Scribes from other members"),
  },
  async ({ member_id, query, top_k, since_ts, include_shared }) => {
    try {
      const result = await memberConsultScribes({
        member_id,
        query,
        top_k,
        since_ts,
        include_shared,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

registerTool(
  "member_fates_route",
  "Three Fates routing (#2269) for a member session: Clotho extracts themes (against the member's own Scribe keywords + canonical entity regexes), Lachesis scores each Scribe, Atropos returns dispatch directives. Persists one row to cathedral.fates_log. Does NOT auto-append to scribe_entries — the member confirms in the UI before any tablet write (manual-approval default for first ship).",
  {
    member_id: z.string().uuid().describe("Member's auth.users.id (UUID)"),
    session_id: z.string().optional().describe("Session identifier (optional but recommended for log threading)"),
    content: z.string().min(10).max(10000).describe("Session content to route — typically the latest exchange"),
    dispatch_cap: z.number().int().min(1).max(10).optional().describe("Maximum dispatch directives returned (default 5)"),
    persist: z.boolean().optional().describe("If true (default), write a cathedral.fates_log row"),
  },
  async ({ member_id, session_id, content, dispatch_cap, persist }) => {
    try {
      const result = await memberFatesRoute({
        member_id,
        session_id,
        content,
        dispatch_cap,
        persist,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: false, error: (err as Error).message }) }],
      };
    }
  }
);

// ═══════════════════════════════════════════
// TOUCHSTONE — Deterministic Coordinator Tools
// ═══════════════════════════════════════════

const TOUCHSTONE_DIR = resolve(__dirname, "..", "touchstone");

function runTouchstone(script: string, args: string[]): string {
  const cmd = `python "${resolve(TOUCHSTONE_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
  try {
    return execSync(cmd, {
      cwd: TOUCHSTONE_DIR,
      timeout: 60_000,
      encoding: "utf-8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return `ERROR: ${e.stdout || ""}${e.stderr || e.message || "Unknown error"}`;
  }
}

function loadTouchstoneManifest(): any {
  const mp = resolve(TOUCHSTONE_DIR, "manifest.json");
  if (!existsSync(mp)) return { deliverables: [] };
  return JSON.parse(readFileSync(mp, "utf-8"));
}

function saveTouchstoneManifest(manifest: any): void {
  manifest.updated_at = new Date().toISOString();
  const mp = resolve(TOUCHSTONE_DIR, "manifest.json");
  writeFileSync(mp, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

registerTool(
  "touchstone_list",
  "Lists all deliverables in the TouchStone manifest, optionally filtered by owner or status.",
  {
    owner: z.string().optional().describe("Filter by owner: bishop, knight, rook, pawn, founder"),
    status: z.string().optional().describe("Filter by status: pending, in_progress, completed, blocked, failed"),
  },
  async ({ owner, status }) => {
    const manifest = loadTouchstoneManifest();
    let deliverables = manifest.deliverables || [];

    if (owner) deliverables = deliverables.filter((d: any) => d.owner === owner);
    if (status) deliverables = deliverables.filter((d: any) => d.status === status);

    const summary = deliverables.map((d: any) => ({
      id: d.id,
      title: d.title,
      owner: d.owner,
      status: d.status,
      depends_on: d.depends_on,
      notes: d.notes,
    }));

    const counts: Record<string, number> = {};
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
  }
);

registerTool(
  "touchstone_verify",
  "Runs verification predicates on a specific deliverable or all deliverables. Returns pass/fail with reasons.",
  {
    deliverable_id: z.string().optional().describe("Specific deliverable ID to verify. Omit to verify all."),
  },
  async ({ deliverable_id }) => {
    const args = deliverable_id ? [deliverable_id] : [];
    const output = runTouchstone("verify.py", args);

    try {
      const result = JSON.parse(output);
      if (deliverable_id) {
        const passStr = result.passed ? "PASSED" : "FAILED";
        const details = (result.predicate_results || []).map((pr: any) =>
          `  ${pr.passed ? "✅" : "❌"} ${pr.predicate}: ${pr.message}`
        ).join("\n");
        return {
          content: [{ type: "text", text: `${passStr}: ${deliverable_id}\n${details}` }],
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `TouchStone Report (${result.verified_at || "now"}):\n` +
              `Total: ${result.total} | Passed: ${result.passed} | Failed: ${result.failed} | Pending: ${result.pending} | Blocked: ${result.blocked}\n\n` +
              `By owner:\n${Object.entries(result.by_owner || {}).map(([o, s]: [string, any]) =>
                `  ${o}: ${s.passed}/${s.total} passed`).join("\n")}\n\n` +
              `Details:\n${(result.results || []).map((r: any) =>
                `  ${r.passed ? "✅" : "⬜"} [${r.status}] ${r.title || r.deliverable_id}`
              ).join("\n")}`,
          }],
        };
      }
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

registerTool(
  "touchstone_claim",
  "Claims a pending deliverable for the calling agent, setting it to in_progress.",
  {
    deliverable_id: z.string().describe("The deliverable ID to claim"),
    agent: z.string().describe("The agent claiming: bishop, knight, rook, pawn"),
  },
  async ({ deliverable_id, agent }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd: any) => dd.id === deliverable_id);

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
  }
);

registerTool(
  "touchstone_complete",
  "Submits completion for a deliverable. Runs all predicates. If ALL pass, marks completed. If any fail, rejects with reasons. Stale predicates (10+ sessions old) are downgraded to warnings.",
  {
    deliverable_id: z.string().describe("The deliverable ID to mark complete"),
    agent: z.string().describe("The agent completing: bishop, knight, rook, pawn"),
  },
  async ({ deliverable_id, agent }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd: any) => dd.id === deliverable_id);

    if (!d) {
      return { content: [{ type: "text", text: `Deliverable '${deliverable_id}' not found.` }] };
    }

    const output = runTouchstone("verify.py", [deliverable_id]);
    let result: any;
    try {
      result = JSON.parse(output);
    } catch {
      return { content: [{ type: "text", text: `Verification error: ${output}` }] };
    }

    // Stale predicate handling: if deliverable is 10+ sessions old, downgrade failures to warnings
    const sessionsPath = resolve(__dirname, "..", "index", "sessions.json");
    let sessionCount = 0;
    if (existsSync(sessionsPath)) {
      try { sessionCount = JSON.parse(readFileSync(sessionsPath, "utf-8")).length; } catch { /* ignore */ }
    }
    const createdAt = d.created_at || "";
    let isStale = false;
    if (createdAt && sessionCount > 0) {
      const sessionsFile = JSON.parse(readFileSync(sessionsPath, "utf-8"));
      const createdDate = createdAt.slice(0, 10);
      const sessionsAfter = sessionsFile.filter((s: any) => (s.date || "") >= createdDate).length;
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
    } else if (isStale) {
      const failDetails = (result.blocking_failures || []).map((f: string) => `  ⚠️ ${f} [STALE — downgraded to warning]`).join("\n");
      return {
        content: [{ type: "text", text: `⚠️ STALE PREDICATES: ${d.title}\nDeliverable is 10+ sessions old. Failures downgraded to warnings:\n${failDetails}\n\nUse touchstone_force_complete to override.` }],
      };
    } else {
      runTouchstone("ledger.py", ["failed", deliverable_id, JSON.stringify({ agent, failures: result.blocking_failures })]);
      const failDetails = (result.blocking_failures || []).map((f: string) => `  ❌ ${f}`).join("\n");
      return {
        content: [{ type: "text", text: `REJECTED: ${d.title}\nPredicates failed:\n${failDetails}` }],
      };
    }
  }
);

registerTool(
  "touchstone_force_complete",
  "Force-completes a deliverable when predicates are stale but work clearly shipped. Logs the override with reason and agent. Use when touchstone_complete rejects due to stale predicates.",
  {
    deliverable_id: z.string().describe("The deliverable ID to force-complete"),
    agent: z.string().describe("The agent forcing completion: bishop, knight, rook, pawn"),
    reason: z.string().describe("Why force-completing — what evidence shows it shipped"),
  },
  async ({ deliverable_id, agent, reason }) => {
    const manifest = loadTouchstoneManifest();
    const d = (manifest.deliverables || []).find((dd: any) => dd.id === deliverable_id);

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
  }
);

// ═══════════════════════════════════════════
// SCRAMBLER — Chessboard Phase 2 Sync Tools (K407)
// ═══════════════════════════════════════════

const SCRAMBLER_DIR = resolve(__dirname, "..", "scrambler");

function runScrambler(script: string, args: string[]): string {
  const cmd = `python "${resolve(SCRAMBLER_DIR, script)}" ${args.map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
  try {
    return execSync(cmd, {
      cwd: SCRAMBLER_DIR,
      timeout: 60_000,
      encoding: "utf-8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return `ERROR: ${e.stdout || ""}${e.stderr || e.message || "Unknown error"}`;
  }
}

registerTool(
  "scrambler_session_start",
  "Scrambler Chessboard Phase 2 + K418 Triple-Redundant: generates a session start brief from canonical state. Runs Scramblers A (ledger), B (ground truth), C (arbiter) side-by-side. Flags drift, conflicts, staleness, and session gaps.",
  {
    agent: z.string().describe("Agent type: bishop, knight, rook, pawn"),
    session_id: z.string().describe("Session identifier (e.g. 'B098', 'K407')"),
  },
  async ({ agent, session_id }) => {
    // Scrambler A — original session brief
    const output = runScrambler("session_brief.py", [agent, session_id]);

    let brief: any;
    try {
      brief = JSON.parse(output);
    } catch {
      return { content: [{ type: "text", text: output }] };
    }

    const lines: string[] = [];
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
    let bResult: any = null;
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
    } catch {
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
      } catch {
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
          lines.push(`Session index gaps: **${staleResult.session_gap_count}** (${staleResult.session_gaps.slice(0, 5).map((g: any) => g.missing_id).join(", ")}${staleResult.session_gap_count > 5 ? "..." : ""})`);
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
    } catch {
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
      for (const p of brief[promptsKey]) lines.push(`- ${p}`);
    }

    // ── Ready to proceed ──
    const ready = brief.ready_to_proceed;
    lines.push(`\n---\nReady to proceed: **${ready ? "YES" : "NO"}**`);
    if (brief.block_reason?.length > 0) {
      lines.push(`Block reasons:`);
      for (const r of brief.block_reason) lines.push(`- ${r}`);
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

registerTool(
  "scrambler_session_closeout",
  "Scrambler Chessboard Phase 2: reconciles session work against canonical state at session end. Checks for unreconciled conflicts, applies approved changes to canonical_values.yaml, saves snapshot.",
  {
    agent: z.string().describe("Agent type: bishop, knight, rook, pawn"),
    session_id: z.string().describe("Session identifier (e.g. 'B098', 'K407')"),
    summary: z.string().describe("What was built/accomplished this session"),
  },
  async ({ agent, session_id, summary }) => {
    const output = runScrambler("session_closeout.py", [agent, session_id, summary]);

    try {
      const result = JSON.parse(output);
      const lines: string[] = [];
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
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

// ═══════════════════════════════════════════
// K418 — TRIPLE-REDUNDANT VERIFICATION (Innovation #2263)
// Scrambler B (Ground Truth), Scrambler C (Arbiter), Reconciliation
// ═══════════════════════════════════════════

registerTool(
  "scrambler_ground_truth",
  "Scrambler B: Ground Truth Verifier. Checks actual deployed artifacts (files, code patterns, migrations, edge functions) against pending deliverables. Returns verdicts per deliverable.",
  {
    deliverable_id: z.string().optional().describe("Specific deliverable to check. Omit for all."),
  },
  async ({ deliverable_id }) => {
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
        for (const [name, data] of Object.entries(checks) as [string, any][]) {
          lines.push(`- ${name}: ${data.verdict} (${data.evidence?.length || 0} evidence items)`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } else {
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
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

registerTool(
  "scrambler_arbiter",
  "Scrambler C: Arbiter/Tiebreaker. Runs ONLY when Scramblers A and B disagree. Votes by evidence weight, self-heals the manifest when confident.",
  {},
  async () => {
    const output = runScrambler("arbiter.py", []);

    try {
      const result = JSON.parse(output);
      const lines = [
        `## Scrambler C: Arbiter`,
        `Activated: **${result.activated ? "YES" : "NO"}**`,
      ];

      if (!result.activated) {
        lines.push(result.reason || "No disagreements between A and B.");
      } else {
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
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

registerTool(
  "scrambler_tiebreak_log",
  "Reads the Scrambler C tiebreak audit log. Shows all arbitration decisions for Founder review.",
  {
    limit: z.number().optional().describe("Max entries to return (default 20)"),
  },
  async ({ limit }) => {
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
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

registerTool(
  "touchstone_reconcile",
  "Bulk reconciliation: runs all three Scramblers (A=Ledger, B=Ground Truth, C=Arbiter) plus staleness/gap detection against all deliverables at once. Use for manual catch-up when the system has fallen behind.",
  {
    session_id: z.string().optional().describe("Current session ID for logging (default: 'manual')"),
  },
  async ({ session_id }) => {
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
    } catch {
      return { content: [{ type: "text", text: output }] };
    }
  }
);

// ═══════════════════════════════════════════
// K446a: Conductor's Baton — conductor_route MCP tool
// Innovation #2277 · Phase 2.1 · Cathedral integration
//
// Classifies a query and returns the routing decision (vendor, model, rationale).
// Does NOT execute the query — that's a future conductor_execute tool.
// Every call appends a hash-only routing trace to scribe_Conductor.jsonl.
// ═══════════════════════════════════════════

import { createHash } from "crypto";
import { appendFileSync } from "fs";

const _conductorScribePath = resolve(
  __dirname, "..", "stitchpunks", "scribes", "scribe_Conductor.jsonl"
);

function _hashQuery(query: string): string {
  return "sha256:" + createHash("sha256").update(query, "utf-8").digest("hex");
}

function _appendConductorTrace(entry: object): void {
  try {
    appendFileSync(_conductorScribePath, JSON.stringify(entry) + "\n", "utf-8");
  } catch {
    // Non-fatal: scribe write failure must not break routing
  }
}

// Inline classifier + router (import from platform/ is not wired into librarian-mcp build).
// These are self-contained implementations mirroring platform/src/lib/conductor/*.ts
// so the MCP server remains buildable without cross-package deps.

type _QueryClass = "retrieval_only"|"reasoning_required"|"creative"|"code_generation"|"multi_step_planning"|"uncertain";
type _ConductorMode = "auto"|"manual"|"vendor-lock";
type _VendorName = "anthropic"|"openai"|"google"|"perplexity";

interface _ClassifiedQuery { class: _QueryClass; confidence: number; signals: string[] }
interface _RoutingDecision { vendor: _VendorName; model: string; rationale: string; fallbackUsed: boolean; rankingAgeDays: number|null }

function _classifyForMcp(query: string): _ClassifiedQuery {
  const q = query.trim();
  const wc = q.split(/\s+/).filter(Boolean).length;
  const signals: string[] = [];
  const scores: Record<_QueryClass, number> = {
    retrieval_only: 0, reasoning_required: 0, creative: 0,
    code_generation: 0, multi_step_planning: 0, uncertain: 0,
  };

  if (/\b(python|typescript|javascript|java|sql|bash|go|rust|c\+\+)\b/i.test(q)) { scores.code_generation += 0.55; signals.push("named-language"); }
  if (/\b(write|implement|build)\s+(a\s+)?(function|class|query|script|migration|hook)\b/i.test(q)) { scores.code_generation += 0.65; signals.push("code-verb+noun"); }
  if (/\b(write\s+a|draft\s+a|compose\s+a|brainstorm|come\s+up\s+with|generate\s+ideas?)\b/i.test(q)) { scores.creative += 0.6; signals.push("creative-verb"); }
  if (/\b(plan|strategy|step[\s-]by[\s-]step|roadmap|workflow)\b/i.test(q)) { scores.multi_step_planning += 0.55; signals.push("planning-noun"); }
  if (/^(what\s+is|what\s+are|who\s+is|when\s+(is|was)|how\s+many|how\s+much)\b/i.test(q) || wc <= 8) { scores.retrieval_only += 0.5; signals.push("retrieval-stem"); }
  if (/\b(why|explain|compare|evaluate|pros\s+and\s+cons|difference\s+between)\b/i.test(q)) { scores.reasoning_required += 0.5; signals.push("reasoning-verb"); }
  if (wc >= 40) { scores.reasoning_required += 0.3; signals.push("long-query"); }

  let winner: _QueryClass = "uncertain";
  let best = 0;
  for (const [cls, score] of Object.entries(scores) as [_QueryClass, number][]) {
    if (score > best) { best = score; winner = cls; }
  }
  if (best < 0.4) winner = "uncertain";
  return { class: winner, confidence: Math.round(best * 1000) / 1000, signals };
}

// R13 routing table (mirror of platform/src/lib/conductor/rankings.ts)
const _R13_TOP: Record<_QueryClass, {vendor: _VendorName; model: string; hot: number; ageDays: number} | null> = {
  retrieval_only:    { vendor: "anthropic", model: "claude-haiku-4-5", hot: 90, ageDays: 0 },  // cheapest above 85%
  reasoning_required:{ vendor: "anthropic", model: "claude-haiku-4-5", hot: 90, ageDays: 0 },
  creative:          { vendor: "anthropic", model: "claude-opus-4-7",  hot: 0,  ageDays: 0 },  // conservative fallback
  code_generation:   { vendor: "anthropic", model: "claude-opus-4-7",  hot: 0,  ageDays: 0 },
  multi_step_planning:{ vendor: "anthropic", model: "claude-opus-4-7", hot: 0,  ageDays: 0 },
  uncertain: null,
};

function _routeForMcp(
  classified: _ClassifiedQuery,
  mode: _ConductorMode,
  overrideVendor?: string,
  overrideModel?: string,
): _RoutingDecision {
  const FALLBACK_VENDOR: _VendorName = "anthropic";
  const FALLBACK_MODEL = "claude-sonnet-4-6";

  if (mode === "vendor-lock") {
    const v = (overrideVendor ?? FALLBACK_VENDOR) as _VendorName;
    const m = overrideModel ?? { anthropic: "claude-sonnet-4-6", openai: "gpt-5-4-mini", google: "gemini-2-5-flash", perplexity: "sonar-pro" }[v] ?? FALLBACK_MODEL;
    return { vendor: v, model: m, rationale: `Vendor-locked to ${v} (fixed gear).`, fallbackUsed: false, rankingAgeDays: null };
  }

  if (mode === "manual" && (overrideVendor || overrideModel)) {
    const v = (overrideVendor ?? FALLBACK_VENDOR) as _VendorName;
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

registerTool(
  "conductor_route",
  "Classify a query and return the routing decision (vendor, model, rationale). " +
  "Does not execute the query. Records a hash-only trace in scribe_Conductor.jsonl. " +
  "Innovation #2277 — The Conductor's Baton.",
  {
    query: z.string().describe("The member query to classify and route"),
    mode: z.enum(["auto", "manual", "vendor-lock"]).optional().default("auto")
      .describe("Conductor mode: auto (default), manual (member chooses), vendor-lock (fixed vendor)"),
    override: z.object({
      vendor: z.enum(["anthropic", "openai", "google", "perplexity"]).optional(),
      model: z.string().optional(),
    }).optional().describe("Member override for manual/vendor-lock modes"),
  },
  async ({ query, mode, override }) => {
    const classified = _classifyForMcp(query);
    const decision = _routeForMcp(classified, mode as _ConductorMode, override?.vendor, override?.model);

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
  },
);

// ═══════════════════════════════════════════
// K505 — SUBSTRATE SAVINGS TELEMETRY
// ═══════════════════════════════════════════

const SAVINGS_LOG_PATH = resolve(
  __dirname, "..", "stitchpunks", "data", "substrate_savings_log.jsonl"
);

/**
 * Vendor pricing table (per 1M tokens, USD).
 * Source: published API pricing as of 2026-04. Update as rates change.
 */
const VENDOR_PRICING: Record<string, { input: number; output: number }> = {
  anthropic: { input: 3.00, output: 15.00 },   // claude-opus-4-7 (per 1M)
  openai:    { input: 2.50, output: 10.00 },    // gpt-4o (per 1M)
  google:    { input: 1.25, output:  5.00 },    // gemini-2.5-pro (per 1M)
  perplexity:{ input: 1.00, output:  1.00 },    // sonar-pro (per 1M)
};

/** Cold multipliers per agent, derived from R13 empirical baseline. */
const COLD_MULTIPLIERS: Record<string, number> = {
  BISHOP: 3.0,
  KNIGHT: 2.5,
  PAWN:   3.5,  // includes baked-in friction_multiplier (3.0×)
  ROOK:   2.5,  // same as KNIGHT until calibration data available
};

interface SavingsRecord {
  ts: string;
  agent: string;
  session_id: string;
  input_tokens: number;
  output_tokens: number;
  substrate_overhead_tokens: number;
  substrate_injection_count: number;
  vendor: string;
  model: string;
  actual_cost_usd: number;
  counterfactual_cost_usd: number;
  session_savings_usd: number;
  cold_multiplier: number;
  friction_confirmations: number;
  multiplier_provisional: boolean;
  notes?: string;
}

function appendSavingsRecord(record: SavingsRecord): { line_count: number } {
  const line = JSON.stringify(record);
  const existing = existsSync(SAVINGS_LOG_PATH)
    ? readFileSync(SAVINGS_LOG_PATH, "utf-8")
    : "";
  const lines = existing.trim() ? existing.trim().split("\n") : [];
  lines.push(line);
  writeFileSync(SAVINGS_LOG_PATH, lines.join("\n") + "\n", "utf-8");
  return { line_count: lines.length };
}

function readSavingsLog(): SavingsRecord[] {
  if (!existsSync(SAVINGS_LOG_PATH)) return [];
  const raw = readFileSync(SAVINGS_LOG_PATH, "utf-8").trim();
  if (!raw) return [];
  return raw.split("\n").map((l) => JSON.parse(l) as SavingsRecord);
}

function computeSavings(params: {
  agent: string;
  input_tokens: number;
  output_tokens: number;
  substrate_overhead_tokens: number;
  vendor: string;
}): { actual_cost_usd: number; counterfactual_cost_usd: number; session_savings_usd: number } {
  const pricing = VENDOR_PRICING[params.vendor.toLowerCase()] ?? VENDOR_PRICING["anthropic"];
  const m = 1_000_000;
  const actual_cost_usd =
    (params.input_tokens / m) * pricing.input +
    (params.output_tokens / m) * pricing.output;
  const overhead_cost_usd = (params.substrate_overhead_tokens / m) * pricing.input;
  const multiplier = COLD_MULTIPLIERS[params.agent.toUpperCase()] ?? 2.5;
  const counterfactual_cost_usd = actual_cost_usd * multiplier;
  const session_savings_usd = counterfactual_cost_usd - actual_cost_usd - overhead_cost_usd;
  return { actual_cost_usd, counterfactual_cost_usd, session_savings_usd };
}

registerTool(
  "record_substrate_savings",
  "Log substrate savings for a completed agent session (Bishop, Knight, Pawn, Rook). Call at session end with token counts. Computes actual cost, counterfactual cost (without substrate), and net savings using agent-specific cold multipliers derived from R13. Appends to substrate_savings_log.jsonl. Returns the savings summary.",
  {
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
  },
  async ({
    agent, session_id, input_tokens, output_tokens,
    substrate_overhead_tokens, substrate_injection_count,
    vendor, model, friction_confirmations, notes
  }) => {
    const { actual_cost_usd, counterfactual_cost_usd, session_savings_usd } = computeSavings({
      agent, input_tokens, output_tokens, substrate_overhead_tokens, vendor
    });
    const cold_multiplier = COLD_MULTIPLIERS[agent] ?? 2.5;
    const record: SavingsRecord = {
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
  }
);

registerTool(
  "substrate_savings_summary",
  "Returns aggregate substrate savings statistics from substrate_savings_log.jsonl. Shows all-time totals, rolling 7-day and 30-day windows, and per-agent breakdowns (Bishop/Knight/Pawn/Rook). The Founder can use this to see actual economic value of running Librarian substrate across all AI sessions.",
  {
    window: z.enum(["all", "7d", "30d"]).default("all").describe("Time window: all | 7d (last 7 days) | 30d (last 30 days)"),
    agent: z.enum(["BISHOP", "KNIGHT", "PAWN", "ROOK", "ALL"]).default("ALL").describe("Filter by agent, or ALL"),
  },
  async ({ window, agent }) => {
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
      if (age > windowMs) return false;
      if (agent !== "ALL" && r.agent !== agent) return false;
      return true;
    });

    const byAgent: Record<string, SavingsRecord[]> = {};
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
  }
);

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
  /\[P\d{2,4}\]/,                        // Pawn session tag [P123]
  /friction_confirmations|Pawn-layer/i,
  /PROMPT_PAWN_B\d+/i,
];

const PAWN_TOKEN_FOOTER = /tokens?:?\s*(\d+)\s*(?:in(?:put)?)?[,\/]\s*(\d+)\s*(?:out(?:put)?)?/i;

registerTool(
  "detect_and_log_pawn_session",
  "K506 Phase C: Detects whether pasted text originates from a Pawn-layer AI agent (Perplexity/Gemini/etc.) and auto-logs substrate savings. Call whenever Founder pastes Pawn task output into the Bishop conversation. Extracts token metadata when present; falls back to text-length estimate. Returns detection result + logged record.",
  {
    text: z.string().min(10).describe("The pasted text to analyze for Pawn authorship"),
    session_id: z.string().describe("Current Bishop session ID, e.g. 'B124'"),
    friction_confirmations: z.number().int().nonnegative().optional().default(0).describe("Number of 'yes/do it/that' confirmations Founder needed before Pawn executed. Supply if known; defaults to 0."),
    notes: z.string().optional().describe("Optional notes about this Pawn task"),
  },
  async ({ text, session_id, friction_confirmations, notes }) => {
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

    const record: SavingsRecord = {
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
  }
);

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
function runWingHelper(pySnippet: string, args: unknown): unknown {
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
  } catch (err) {
    return { error: String(err) };
  } finally {
    try { unlinkSync(argsTmp); } catch { /* ignore */ }
    try { unlinkSync(codeTmp); } catch { /* ignore */ }
  }
}

server.tool(
  "chronos_query",
  "K515 — Chronos time-state aggregation query. Reads per-Augur Chronicler tablets and returns Wing-wide or per-Augur statistics. Returns fire counts, rates, trends, and last-fire timestamps. A&A #2299/#2300.",
  {
    augur_ids: z.array(z.string()).optional().describe("Specific Augur IDs to query (omit for all)"),
    since_ts: z.string().optional().describe("ISO timestamp — only include entries after this time"),
  },
  async ({ augur_ids, since_ts }) => {
    const result = runWingHelper(
      `from discipline_wing.chronicler import wing_chronos_query
result = wing_chronos_query(
    augur_ids=_args.get("augur_ids"),
    since_ts=_args.get("since_ts"),
)`,
      { augur_ids: augur_ids ?? null, since_ts: since_ts ?? null }
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "correspondent_log",
  "K515 — Embedded Correspondent producer. Write a reasoning chunk to the agent's tablet; evaluates against 7 risk-pattern Augurs (vendor-secret-rotation, force-push, schema-destruction, filesystem-wipe, permission-grant, api-spend-spike, toolsmith-missing). Returns pre-execution advisories. A&A #2306. Closes K512.5 vulnerability class.",
  {
    agent: z.string().describe("Agent name: 'knight', 'bishop', 'pawn', 'rook'"),
    session: z.string().describe("Session ID, e.g. 'K515', 'B126'"),
    chunk: z.string().describe("Reasoning chunk text to log and evaluate"),
    context: z.record(z.unknown()).optional().describe("Optional context: {phase, tool_about_to_run, file_paths_in_scope}"),
  },
  async ({ agent, session, chunk, context }) => {
    const result = runWingHelper(
      `from discipline_wing.bureau import write_chunk
result = write_chunk(
    agent=_args["agent"],
    session=_args["session"],
    chunk_text=_args["chunk"],
    context=_args.get("context", {}),
)`,
      { agent, session, chunk, context: context ?? {} }
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "bureau_subscribe",
  "K515 — Bureau subscription read (pull mode). Retrieves recent reasoning chunks from Embedded Correspondent tablets, filtered by risk pattern. Bishop uses this to watch other agents' reasoning streams for pre-execution risk signals. A&A #2306.",
  {
    watching_agent: z.string().describe("The subscribing agent: 'bishop', 'knight', etc."),
    risk_filter: z.array(z.string()).optional().describe("Risk pattern Augur IDs to filter on (omit = all)"),
    since_ts: z.string().optional().describe("Only return chunks after this ISO timestamp"),
  },
  async ({ watching_agent, risk_filter, since_ts }) => {
    const result = runWingHelper(
      `from discipline_wing.bureau import bureau_subscribe
result = bureau_subscribe(
    watching_agent=_args["watching_agent"],
    risk_filter=_args.get("risk_filter"),
    since_ts=_args.get("since_ts"),
)`,
      { watching_agent, risk_filter: risk_filter ?? null, since_ts: since_ts ?? null }
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "bureau_query",
  "K515 — Bureau aggregate query (Chronos-style, for reasoning streams). Aggregates reasoning chunks across agents and sessions; filterable by agent, session, time range, and risk-pattern Augur ID. A&A #2306.",
  {
    agent: z.string().optional().describe("Filter to one agent (omit = all agents)"),
    session: z.string().optional().describe("Filter to one session (omit = all sessions)"),
    since_ts: z.string().optional().describe("ISO timestamp filter"),
    risk_filter: z.string().optional().describe("Filter to chunks that triggered this Augur ID"),
    limit: z.number().int().min(1).max(200).optional().default(50).describe("Max chunks to return"),
  },
  async ({ agent, session, since_ts, risk_filter, limit }) => {
    const result = runWingHelper(
      `from discipline_wing.bureau import query_bureau
result = query_bureau(
    agent=_args.get("agent"),
    session=_args.get("session"),
    since_ts=_args.get("since_ts"),
    risk_filter=_args.get("risk_filter"),
    limit=_args.get("limit", 50),
)`,
      { agent: agent ?? null, session: session ?? null, since_ts: since_ts ?? null, risk_filter: risk_filter ?? null, limit: limit ?? 50 }
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

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

main().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
