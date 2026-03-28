import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parseMigrations } from "./parseMigrations.js";
import { parseEdgeFunctions } from "./parseEdgeFunctions.js";
import { parsePages } from "./parsePages.js";
import { parseCephas } from "./parseCephas.js";
import { parseContext } from "./parseContext.js";
import { parseBishopChats } from "./parseBishopChats.js";
import { buildDomainIndex } from "./domainMapper.js";
import { parseConcepts } from "./parseConcepts.js";
import { parseDropzones } from "./parseDropzones.js";
import { parseTranscripts } from "./parseTranscripts.js";
import { parseComponents } from "./parseComponents.js";
import type { SystemOverview } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE = resolve(__dirname, "..", "..", "..");
const INDEX_DIR = resolve(__dirname, "..", "..", "index");

function writeIndex(name: string, data: unknown): void {
  const path = resolve(INDEX_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  const size = JSON.stringify(data).length;
  console.log(`  ✓ ${name}.json (${(size / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  THE LIBRARIAN — Index Builder");
  console.log("═══════════════════════════════════════════");
  console.log(`  Workspace: ${WORKSPACE}`);
  console.log("");

  if (!existsSync(INDEX_DIR)) {
    mkdirSync(INDEX_DIR, { recursive: true });
  }

  const start = Date.now();

  console.log("[1/11] Parsing migrations...");
  const schemas = await parseMigrations(WORKSPACE);
  writeIndex("schemas", schemas);
  console.log(`       ${Object.keys(schemas.tables).length} tables, ${schemas.migrationCount} migrations\n`);

  console.log("[2/11] Parsing edge functions...");
  const functions = await parseEdgeFunctions(WORKSPACE);
  writeIndex("functions", functions);
  console.log(`       ${functions.count} functions, ${functions.sharedModules.length} shared modules\n`);

  console.log("[3/11] Parsing pages...");
  const pages = await parsePages(WORKSPACE);
  writeIndex("pages", pages);
  console.log(`       ${pages.count} pages, ${Object.keys(pages.routes).length} routes\n`);

  console.log("[4/11] Parsing Cephas content...");
  const cephas = await parseCephas(WORKSPACE);
  writeIndex("cephas", cephas);
  console.log(`       ${cephas.count} entries across ${Object.keys(cephas.sections).length} sections\n`);

  console.log("[5/11] Parsing context management...");
  const context = await parseContext(WORKSPACE);
  writeIndex("context", context);
  console.log(`       ${context.sessions.length} sessions, ${Object.keys(context.canonicalNumbers).length} canonical numbers\n`);

  console.log("[6/11] Parsing BISHOP chat transcripts...");
  const bishop = await parseBishopChats();
  writeIndex("bishop", bishop);
  console.log(`       ${bishop.count} chats, ${bishop.totalWords.toLocaleString()} total words\n`);

  console.log("[7/11] Building domain map...");
  const domains = buildDomainIndex(schemas, functions, pages, cephas);
  writeIndex("domains", domains);
  console.log(`       ${domains.count} domains mapped\n`);

  console.log("[8/11] Parsing all Cephas content as concepts...");
  const concepts = await parseConcepts(WORKSPACE);
  writeIndex("concepts", concepts);
  console.log(`       ${concepts.count} concepts, ${concepts.totalWords.toLocaleString()} words, ${Object.keys(concepts.byKeyword).length} keywords\n`);

  console.log("[9/11] Parsing dropzones (KNIGHT/BISHOP/ROOK/PAWN)...");
  const dropzones = await parseDropzones(WORKSPACE);
  writeIndex("dropzones", dropzones);
  console.log(`       ${dropzones.count} entries, ${dropzones.totalWords.toLocaleString()} words\n`);

  console.log("[10/11] Parsing Cursor agent transcripts...");
  const transcripts = await parseTranscripts();
  writeIndex("transcripts", transcripts);
  console.log(`       ${transcripts.count} sessions, ${transcripts.totalMessages.toLocaleString()} messages\n`);

  console.log("[11/11] Parsing React components, hooks, and libs...");
  const components = await parseComponents(WORKSPACE);
  writeIndex("components", components);
  console.log(`       ${Object.keys(components.components).length} components, ${Object.keys(components.hooks).length} hooks, ${Object.keys(components.libs).length} libs\n`);

  const overview: SystemOverview = {
    innovationCount: (context.canonicalNumbers.innovationCount as number) || 1938,
    crownJewelCount: (context.canonicalNumbers.crownJewelCount as number) || 123,
    formalClaimsCount: (context.canonicalNumbers.formalClaimsCount as number) || 1401,
    provisionalApps: (context.canonicalNumbers.provisionalApps as number) || 8,
    initiativeCount: 16,
    tableCount: Object.keys(schemas.tables).length,
    edgeFunctionCount: functions.count,
    pageCount: pages.count,
    cephasPageCount: cephas.count,
    migrationCount: schemas.migrationCount,
    conceptCount: concepts.count,
    dropzoneCount: dropzones.count,
    transcriptCount: transcripts.count,
    componentCount: components.count,
    bishopChatCount: bishop.count,
    membershipCost: "$5/year",
    creatorKeeps: "83.3%",
    platformMargin: "Cost + 20%",
    lastSession: context.sessions.length > 0 ? context.sessions[context.sessions.length - 1].id : undefined,
    pendingWork: context.pendingWork,
    timestamp: new Date().toISOString(),
  };
  writeIndex("overview", overview);
  writeIndex("canonical", context.canonicalNumbers);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("═══════════════════════════════════════════");
  console.log(`  Index built in ${elapsed}s`);
  console.log(`  ${Object.keys(schemas.tables).length} tables | ${functions.count} functions | ${pages.count} pages`);
  console.log(`  ${cephas.count} Cephas entries | ${bishop.count} BISHOP chats`);
  console.log(`  ${concepts.count} concepts (full content) | ${domains.count} domains`);
  console.log(`  ${dropzones.count} dropzone tasks | ${transcripts.count} agent transcripts`);
  console.log(`  ${components.count} components/hooks/libs`);
  console.log("═══════════════════════════════════════════");
}

main().catch(err => {
  console.error("Index build failed:", err);
  process.exit(1);
});
