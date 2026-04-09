import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
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
import { budgetEnforce, BUDGETS, truncateList, truncateToWords } from "./router/budgets.js";

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

const server = new McpServer({
  name: "librarian",
  version: "1.0.0",
});

// ═══════════════════════════════════════════
// TOOL 1: get_system_overview
// ═══════════════════════════════════════════

server.tool(
  "get_system_overview",
  "Returns innovation count, initiative count, page/function/table counts, last session, and pending work. Call at session start.",
  {},
  async () => {
    if (!overview) reloadAll();
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

server.tool(
  "query_domain",
  "Returns all tables, functions, pages, feature flags, and Cephas content for a domain (e.g. 'lb_card', 'housing', 'ghost_world'). Pass domain name or 'list' to see all domains.",
  { domain: z.string().describe("Domain name or 'list' to see all available domains") },
  async ({ domain }) => {
    if (!domains) reloadAll();
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

server.tool(
  "get_schema",
  "Returns columns, types, constraints, FKs, indexes, RLS policies, and originating migration for a table. Pass 'list' to see all tables.",
  { table: z.string().describe("Table name or 'list' to see all tables") },
  async ({ table }) => {
    if (!schemas) reloadAll();
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

server.tool(
  "list_edge_functions",
  "Lists edge functions, optionally filtered by name/domain pattern. Returns name, purpose, auth pattern, and tables used.",
  { filter: z.string().optional().describe("Optional name/keyword filter (e.g. 'card', 'membership', 'webhook')") },
  async ({ filter }) => {
    if (!functions) reloadAll();
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

server.tool(
  "get_page_info",
  "Returns route, data queries, feature flag dependencies, and edge function calls for a page. Pass 'list' to see all pages.",
  { page: z.string().describe("Page component name or 'list'") },
  async ({ page }) => {
    if (!pages) reloadAll();
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

server.tool(
  "get_canonical_numbers",
  "Returns all canonical numbers: innovations, crown jewels, patents, membership cost, creator keeps %, etc. Always reads fresh from disk.",
  {},
  async () => {
    const fresh = loadIndex<Record<string, unknown>>("canonical");
    if (!context) reloadAll();
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
    };

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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

server.tool(
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

server.tool(
  "get_session_context",
  "Returns what was built in a session: files changed, commits, pending work. Without session_id returns the latest.",
  { session_id: z.string().optional().describe("Session ID (e.g. 'A', 'C', '98') or omit for latest") },
  async ({ session_id }) => {
    // Sessions can be updated by hooks or rebuilds while server stays hot.
    // Reload index snapshots so this tool does not serve stale empty context.
    reloadAll();
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

server.tool(
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
    reloadAll();
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

server.tool(
  "get_deploy_state",
  "Returns last deploy info, pending migrations, pending function deploys, and build commands for each site.",
  {},
  async () => {
    if (!context) reloadAll();

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

server.tool(
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

server.tool(
  "get_bishop_chat",
  "Returns summary, decisions, and topics from BISHOP chat transcripts. Pass filename for details, 'list' for recent 20, or 'search:keyword' to find by topic.",
  { chat: z.string().describe("Chat filename, 'list' for recent 20, or 'search:keyword'") },
  async ({ chat }) => {
    if (!bishop) reloadAll();
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

server.tool(
  "get_architecture",
  "Returns architectural concept explanation from Cephas. Searches by keyword, slug, or title. Pass 'list' to see all concepts, or a keyword like 'joules', 'cost+20', 'three-gear', 'crown', 'medallion', etc. Set brief=true (default) for summary only, brief=false for full markdown content.",
  {
    concept: z.string().describe("Concept slug, keyword, or 'list' for all concepts"),
    brief: z.boolean().optional().describe("If true (default), returns summary only. Set false for full content."),
  },
  async ({ concept, brief }) => {
    const isBrief = brief !== false;
    if (!concepts) reloadAll();
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

server.tool(
  "check_consistency",
  "Validates a proposal or statement against Liana Banyan's architectural rules and constraints. Returns violations, warnings, and confirmations. Use this before implementing features to ensure alignment.",
  { proposal: z.string().describe("Description of what you're about to build or a statement to validate") },
  async ({ proposal }) => {
    if (!concepts) reloadAll();

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
// TOOL 15: get_dropzone_task
// ═══════════════════════════════════════════

server.tool(
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
    if (!dropzones) reloadAll();
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

server.tool(
  "get_transcript",
  "Returns summaries of Cursor agent chat transcripts. Pass a session UUID for details, 'recent' for latest 10, or 'list' for all.",
  { query: z.string().describe("Session UUID, 'recent', or 'list'") },
  async ({ query }) => {
    if (!transcripts) reloadAll();
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

server.tool(
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
    if (!components) reloadAll();
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
// TOOL 18: brief_me (MoneyPenny)
// ═══════════════════════════════════════════

server.tool(
  "brief_me",
  "MoneyPenny Smart Router: returns a compact, task-scoped context package in ~600 words. Call this FIRST at session start instead of multiple individual queries. Replaces the need for get_system_overview + query_domain + get_architecture + check_consistency.",
  { task: z.string().describe("Natural language description of what you're about to work on, e.g. 'build housing payment contribution form'") },
  async ({ task }) => {
    if (!domains) reloadAll();

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

    const output = budgetEnforce(sections.join("\n"), BUDGETS.briefMe);
    return { content: [{ type: "text", text: output }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 19: moneypenny_checklist
// ═══════════════════════════════════════════

server.tool(
  "moneypenny_checklist",
  "MoneyPenny pre-flight check. Validates a proposed task against architectural rules, identifies missing prerequisites (tables, functions), finds related past sessions, and returns contextual reminders. Call before implementing.",
  { task: z.string().describe("Description of what you're about to implement") },
  async ({ task }) => {
    if (!domains) reloadAll();

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

server.tool(
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

    const output = budgetEnforce(sections.join("\n"), BUDGETS.debrief);
    return { content: [{ type: "text", text: output }] };
  }
);

// ═══════════════════════════════════════════
// TOOL 21: get_migration_status
// ═══════════════════════════════════════════

server.tool(
  "get_migration_status",
  "Returns v1→v2 domain migration tracker. Shows which domains are audited, migrated, or verified. Pass 'list' for overview or a domain name for details.",
  { query: z.string().describe("Domain name or 'list' for overview") },
  async ({ query }) => {
    if (!v2Migration) reloadAll();
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

server.tool(
  "get_letter_status",
  "Returns letter tracking status. Pass 'list' for overview, 'crown'/'media'/'political' for category, 'draft'/'locked'/'sent' for status, or a recipient name for details.",
  { query: z.string().describe("'list', category name, status name, or recipient name") },
  async ({ query }) => {
    if (!letters) reloadAll();
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

server.tool(
  "get_diff_since_session",
  "Returns what changed since a given session. Compares current session list against a baseline session ID. Shows new sessions, files changed, migrations, and functions since then.",
  { session_id: z.string().describe("Baseline session ID (e.g. 'K200', 'B054'). Shows everything after this session.") },
  async ({ session_id }) => {
    if (!context) reloadAll();
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

server.tool(
  "run_session_start",
  "Runs the Stitchpunk Corps session start hook (SP-6 Scribe, SP-1 Cartographer, SP-5 Sentinel, SP-7 Courier). Call at the beginning of any agent session.",
  {
    agent: z.string().describe("Agent type: BISHOP, KNIGHT, ROOK, or PAWN"),
    session_id: z.string().describe("Session identifier (e.g. 'B064', 'K231')"),
    task: z.string().optional().describe("Task description for this session"),
  },
  async ({ agent, session_id, task }) => {
    const output = runStitchpunkHook("session_start.py", [agent, session_id, task || ""]);
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "run_session_end",
  "Runs the Stitchpunk Corps session end hook (SP-6 Scribe, SP-1 Cartographer, SP-3 Classifier, SP-8 Herald, SP-10 Pipeline Bridge). Call at the end of any agent session. This auto-wires content to the Staff of Librarians.",
  {
    agent: z.string().describe("Agent type: BISHOP, KNIGHT, ROOK, or PAWN"),
    session_id: z.string().describe("Session identifier (e.g. 'B064', 'K231')"),
    summary: z.string().describe("What was built/accomplished this session"),
  },
  async ({ agent, session_id, summary }) => {
    const output = runStitchpunkHook("session_end.py", [agent, session_id, summary]);
    return { content: [{ type: "text", text: output }] };
  }
);

// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("The Librarian MCP Server is running (stdio transport)");
}

main().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
