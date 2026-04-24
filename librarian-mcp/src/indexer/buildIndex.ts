import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parseMigrations } from "./parseMigrations.js";
import { parseEdgeFunctions } from "./parseEdgeFunctions.js";
import { parsePages } from "./parsePages.js";
import { parseCephas } from "./parseCephas.js";
import { parseContext } from "./parseContext.js";
import {
  parseSessionCloseouts,
  mergeSessionStreams,
  pickHighestBSession,
} from "./parseSessionCloseouts.js";
import { parseBishopChats } from "./parseBishopChats.js";
import { buildDomainIndex } from "./domainMapper.js";
import { parseConcepts } from "./parseConcepts.js";
import { parseDropzones } from "./parseDropzones.js";
import { parseTranscripts } from "./parseTranscripts.js";
import { parseComponents } from "./parseComponents.js";
import { parseV2 } from "./parseV2.js";
import { parseLetters } from "./parseLetters.js";
import { writeFingerprint, checkFreshness } from "./fingerprint.js";
import { runKnightCathedralCourier } from "./knightCathedralCourier.js";
import type { SystemOverview } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE = resolve(__dirname, "..", "..", "..");
const INDEX_DIR = resolve(__dirname, "..", "..", "index");

const isIncremental = process.argv.includes("--incremental");

function writeIndex(name: string, data: unknown): void {
  const path = resolve(INDEX_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  const size = JSON.stringify(data).length;
  console.log(`  ✓ ${name}.json (${(size / 1024).toFixed(1)} KB)`);
}

async function main() {
  const mode = isIncremental ? "incremental" : "full";
  console.log("═══════════════════════════════════════════");
  console.log(`  THE LIBRARIAN — Index Builder (${mode})`);
  console.log("═══════════════════════════════════════════");
  console.log(`  Workspace: ${WORKSPACE}`);

  if (isIncremental) {
    const freshness = await checkFreshness(INDEX_DIR, WORKSPACE);
    if (freshness.status === "FRESH") {
      console.log(`\n  Index is FRESH (built ${freshness.lastBuild}, ${freshness.ageMs! < 60000 ? "<1m" : Math.round(freshness.ageMs! / 60000) + "m"} ago). Nothing to do.`);
      console.log("═══════════════════════════════════════════");
      return;
    }
    if (freshness.status === "DRIFT") {
      console.log(`\n  Index DRIFT detected: ${freshness.totalDrift} files changed since last build.`);
      if (freshness.newFiles.length) console.log(`    New: ${freshness.newFiles.length} files`);
      if (freshness.changedFiles.length) console.log(`    Modified: ${freshness.changedFiles.length} files`);
      if (freshness.deletedFiles.length) console.log(`    Deleted: ${freshness.deletedFiles.length} files`);
    } else {
      console.log("\n  No previous fingerprint found — running full build.");
    }
  }
  console.log("");

  if (!existsSync(INDEX_DIR)) {
    mkdirSync(INDEX_DIR, { recursive: true });
  }

  const start = Date.now();

  console.log("[1/13] Parsing migrations...");
  const schemas = await parseMigrations(WORKSPACE);
  writeIndex("schemas", schemas);
  console.log(`       ${Object.keys(schemas.tables).length} tables, ${schemas.migrationCount} migrations\n`);

  console.log("[2/13] Parsing edge functions...");
  const functions = await parseEdgeFunctions(WORKSPACE);
  writeIndex("functions", functions);
  console.log(`       ${functions.count} functions, ${functions.sharedModules.length} shared modules\n`);

  console.log("[3/13] Parsing pages...");
  const pages = await parsePages(WORKSPACE);
  writeIndex("pages", pages);
  console.log(`       ${pages.count} pages, ${Object.keys(pages.routes).length} routes\n`);

  console.log("[4/13] Parsing Cephas content...");
  const cephas = await parseCephas(WORKSPACE);
  writeIndex("cephas", cephas);
  console.log(`       ${cephas.count} entries across ${Object.keys(cephas.sections).length} sections\n`);

  console.log("[5/13] Parsing context management...");
  const context = await parseContext(WORKSPACE);

  // K441 Half A: ingest BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B*_CLOSEOUT.md
  // and merge into context.sessions. Closeout files are the authoritative source
  // for B-session lastSession + summaries; the legacy MILESTONE_HANDOFF_MARCH_2026.md
  // path lags real time and is the reason overview.lastSession got pinned at B113
  // until this Knight landed.
  const sessionIngestStart = Date.now();
  const closeouts = await parseSessionCloseouts(WORKSPACE);
  context.sessions = mergeSessionStreams(context.sessions, closeouts);
  const sessionIngestMs = Date.now() - sessionIngestStart;

  writeIndex("context", context);
  console.log(`       ${context.sessions.length} sessions (${closeouts.length} from closeouts, +${sessionIngestMs}ms), ${Object.keys(context.canonicalNumbers).length} canonical numbers\n`);

  console.log("[6/13] Parsing BISHOP chat transcripts...");
  const bishop = await parseBishopChats();
  writeIndex("bishop", bishop);
  console.log(`       ${bishop.count} chats, ${bishop.totalWords.toLocaleString()} total words\n`);

  console.log("[7/13] Building domain map...");
  const domains = buildDomainIndex(schemas, functions, pages, cephas);
  writeIndex("domains", domains);
  console.log(`       ${domains.count} domains mapped\n`);

  console.log("[8/13] Parsing all Cephas content as concepts...");
  const concepts = await parseConcepts(WORKSPACE);
  writeIndex("concepts", concepts);
  console.log(`       ${concepts.count} concepts, ${concepts.totalWords.toLocaleString()} words, ${Object.keys(concepts.byKeyword).length} keywords\n`);

  console.log("[9/13] Parsing dropzones (KNIGHT/BISHOP/ROOK/PAWN)...");
  const dropzones = await parseDropzones(WORKSPACE);
  writeIndex("dropzones", dropzones);
  console.log(`       ${dropzones.count} entries, ${dropzones.totalWords.toLocaleString()} words\n`);

  console.log("[10/13] Parsing Cursor agent transcripts...");
  const transcripts = await parseTranscripts();
  writeIndex("transcripts", transcripts);
  console.log(`       ${transcripts.count} sessions, ${transcripts.totalMessages.toLocaleString()} messages\n`);

  console.log("[11/13] Parsing React components, hooks, and libs...");
  const components = await parseComponents(WORKSPACE);
  writeIndex("components", components);
  console.log(`       ${Object.keys(components.components).length} components, ${Object.keys(components.hooks).length} hooks, ${Object.keys(components.libs).length} libs\n`);

  console.log("[12/13] Parsing v2 scaffold and migration status...");
  const v2Migration = await parseV2(WORKSPACE, domains);
  writeIndex("v2-migration", v2Migration);
  console.log(`       ${v2Migration.v2TotalFiles} v2 files, ${v2Migration.overallProgress}\n`);

  console.log("[13/13] Parsing letters...");
  const letters = await parseLetters(WORKSPACE);
  writeIndex("letters", letters);
  console.log(`       ${letters.count} letters, ${Object.keys(letters.byCategory).length} categories\n`);

  console.log("[14/13] Running Knight Cathedral Courier (SP-7 extension)...");
  const courierResult = await runKnightCathedralCourier();
  if (courierResult.total > 0) {
    console.log(`       +${courierResult.newQueueTablets} queue, +${courierResult.newHandoffTablets} handoff, +${courierResult.newTagTablets} tag tablets appended\n`);
  } else {
    console.log(`       Idempotent — 0 new tablets (Scribes already current)\n`);
  }

  // K441 Half A: lastSession is now derived from the highest B-numbered closeout
  // file on disk, falling back to the legacy parseContext stream if none found,
  // and finally to whatever the previous overview.json had (so a temporarily
  // empty closeout glob doesn't blank the field).
  //
  // pendingWork: prefer the most-recent closeout's pendingWork over the legacy
  // MILESTONE_HANDOFF_MARCH_2026.md extraction. Falls back to the existing
  // overview value if the closeout had nothing extractable, then to context's.
  const existingOverviewPath = resolve(INDEX_DIR, "overview.json");
  let existingLastSession: string | undefined;
  let existingPendingWork: string[] = [];
  if (existsSync(existingOverviewPath)) {
    try {
      const existing = JSON.parse(readFileSync(existingOverviewPath, "utf-8"));
      existingLastSession = existing.lastSession;
      existingPendingWork = existing.pendingWork || [];
    } catch { /* ignore parse errors */ }
  }

  const closeoutDerivedLastSession = pickHighestBSession(closeouts);
  const latestCloseoutPending = closeouts.length > 0
    ? closeouts[closeouts.length - 1].pendingWork
    : [];
  const resolvedLastSession =
    closeoutDerivedLastSession
    ?? (context.sessions.length > 0 ? context.sessions[context.sessions.length - 1].id : undefined)
    ?? existingLastSession;
  const resolvedPendingWork =
    latestCloseoutPending.length > 0
      ? latestCloseoutPending
      : (existingPendingWork.length > 0 ? existingPendingWork : context.pendingWork);

  // K460 session-counter codegen: count canonical-format sessions per prefix from
  // the merged session stream. Only ^[PREFIX]\d+$ format counts; compound/legacy IDs
  // are excluded. Pawn sessions (P-prefix) are omitted — none exist in sessions.json
  // as of B121; pawnBatches in useCanonicalStats.ts remains hand-maintained.
  // These are MCP-logged counts (only sessions that called update_session); renamed
  // *McpLogged in K462 to distinguish from the artifact-derived UI-facing counts.
  const CANONICAL_ID = /^([A-Z])(\d+)$/;
  const knightSessionsMcpLogged = context.sessions.filter(s =>
    s.id && CANONICAL_ID.test(s.id) && s.id.startsWith("K"),
  ).length;
  const bishopSessionsMcpLogged = context.sessions.filter(s =>
    s.id && CANONICAL_ID.test(s.id) && s.id.startsWith("B"),
  ).length;

  // K462 artifact-derived counts (KEPT AS DIAGNOSTIC per K463 constraint).
  // These count unique files matching the formal PROMPT_KNIGHT_K<NNN> pattern only.
  // They are NOT the UI-facing values — see knightSessionMax/bishopSessionMax below.
  //
  // knightPromptCount: unique K-numbers in PROMPT_KNIGHT_K<NNN>_*.md files.
  // bishopSessionCount: unique B-numbers across both dropzone directories.
  const KNIGHT_PROMPTS_DIR = resolve(WORKSPACE, "BISHOP_DROPZONE/01_KnightPrompts");
  const BISHOP_HANDOFFS_DIR = resolve(WORKSPACE, "BISHOP_DROPZONE/03_BishopHandoffs");
  const K_NUMBER_RE = /PROMPT_KNIGHT_K(\d+)/i;
  const B_NUMBER_RE = /B(\d+)/g;

  const uniqueKNumbers = new Set<string>();
  if (existsSync(KNIGHT_PROMPTS_DIR)) {
    for (const fname of readdirSync(KNIGHT_PROMPTS_DIR)) {
      const m = K_NUMBER_RE.exec(fname);
      if (m) uniqueKNumbers.add(m[1]);
    }
  }
  const knightPromptCount = uniqueKNumbers.size;

  const uniqueBNumbers = new Set<string>();
  for (const dir of [BISHOP_HANDOFFS_DIR, KNIGHT_PROMPTS_DIR]) {
    if (!existsSync(dir)) continue;
    for (const fname of readdirSync(dir)) {
      let m: RegExpExecArray | null;
      B_NUMBER_RE.lastIndex = 0;
      while ((m = B_NUMBER_RE.exec(fname)) !== null) {
        uniqueBNumbers.add(m[1]);
      }
    }
  }
  const bishopSessionCount = uniqueBNumbers.size;

  // K463 — max session number: UI-facing values.
  // Scans ALL canonical artifact sources and takes the MAX K# / MAX B# seen.
  // Sources: prompt filenames (already scanned above), BishopHandoffs filenames,
  // sessions.json entry IDs, and git tags. Session numbers in the 900+ range
  // (e.g. K999 ghost anchor) are capped at 900 to exclude non-sequential ghost IDs.
  const MAX_REALISTIC_SESSION = 900;
  const kAllNums: number[] = Array.from(uniqueKNumbers).map(n => parseInt(n, 10));
  const bAllNums: number[] = Array.from(uniqueBNumbers).map(n => parseInt(n, 10));

  // Also scan sessions.json IDs for K/B prefix entries
  const sessionsPath = resolve(INDEX_DIR, "sessions.json");
  if (existsSync(sessionsPath)) {
    try {
      const sessData = JSON.parse(readFileSync(sessionsPath, "utf-8")) as Record<string, unknown>;
      for (const id of Object.keys(sessData)) {
        const km = /^K(\d+)$/i.exec(id);
        if (km) kAllNums.push(parseInt(km[1], 10));
        const bm = /^B(\d+)$/i.exec(id);
        if (bm) bAllNums.push(parseInt(bm[1], 10));
      }
    } catch { /* sessions.json may not exist during fresh build */ }
  }

  // Scan git tags for v-*-K<NNN> and v-*-B<NNN> patterns
  try {
    const tags = execSync("git tag", { cwd: WORKSPACE, encoding: "utf-8", timeout: 5000 }).split("\n");
    for (const tag of tags) {
      const km = /K(\d+)$/i.exec(tag);
      if (km) kAllNums.push(parseInt(km[1], 10));
      const bm = /B(\d+)$/i.exec(tag);
      if (bm) bAllNums.push(parseInt(bm[1], 10));
    }
  } catch { /* git not available in some environments */ }

  const knightSessionMax = kAllNums.filter(n => n <= MAX_REALISTIC_SESSION).reduce((a, b) => Math.max(a, b), 0);
  const bishopSessionMax = bAllNums.filter(n => n <= MAX_REALISTIC_SESSION).reduce((a, b) => Math.max(a, b), 0);

  const overview: SystemOverview = {
    innovationCount: (context.canonicalNumbers.innovationCount as number) || 2130,
    crownJewelCount: (context.canonicalNumbers.crownJewelCount as number) || 168,
    formalClaimsCount: (context.canonicalNumbers.formalClaimsCount as number) || 2103,
    provisionalApps: (context.canonicalNumbers.provisionalApps as number) || 11,
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
    knightSessionsMcpLogged,
    bishopSessionsMcpLogged,
    knightPromptCount,
    bishopSessionCount,
    knightSessionMax,
    bishopSessionMax,
    membershipCost: "$5/year",
    creatorKeeps: "83.3%",
    platformMargin: "Cost + 20%",
    lastSession: resolvedLastSession,
    pendingWork: resolvedPendingWork,
    timestamp: new Date().toISOString(),
  };
  writeIndex("overview", overview);
  writeIndex("canonical", context.canonicalNumbers);

  const elapsedMs = Date.now() - start;
  const elapsed = (elapsedMs / 1000).toFixed(1);

  const fp = await writeFingerprint(INDEX_DIR, WORKSPACE, elapsedMs, mode);

  console.log("═══════════════════════════════════════════");
  console.log(`  Index built in ${elapsed}s (${mode})`);
  console.log(`  ${Object.keys(schemas.tables).length} tables | ${functions.count} functions | ${pages.count} pages`);
  console.log(`  ${cephas.count} Cephas entries | ${bishop.count} BISHOP chats`);
  console.log(`  ${concepts.count} concepts (full content) | ${domains.count} domains`);
  console.log(`  ${dropzones.count} dropzone tasks | ${transcripts.count} agent transcripts`);
  console.log(`  ${components.count} components/hooks/libs`);
  console.log(`  Fingerprint: ${fp.treeHash} (${fp.fileCount} files tracked)`);
  console.log("═══════════════════════════════════════════");
}

main().catch(err => {
  console.error("Index build failed:", err);
  process.exit(1);
});
