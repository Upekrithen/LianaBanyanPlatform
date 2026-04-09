import { readFileSync, existsSync } from "fs";
import { glob } from "glob";
import { basename } from "path";
import type { ContextIndex, SessionEntry } from "../types.js";

function extractSessions(handoff: string): SessionEntry[] {
  const sessions: SessionEntry[] = [];
  const sessionBlocks = handoff.split(/(?=###\s+Session\s+)/);

  for (const block of sessionBlocks) {
    const headerMatch = block.match(/###\s+Session\s+(\S+)\s*[—–-]*\s*(COMPLETED|IN PROGRESS)?/i);
    if (!headerMatch) continue;

    const id = headerMatch[1];
    const status = headerMatch[2]?.toUpperCase() || "UNKNOWN";
    const commitMatch = block.match(/commit\s+[`"]?([a-f0-9]{7,})[`"]?/i);
    const dateMatch = block.match(/(\d{4}-\d{2}-\d{2})/);

    const tasks: string[] = [];
    const taskMatches = block.matchAll(/\|\s*\w+\d*\s*\|\s*(.+?)\s*\|\s*(DONE|SKIPPED|PENDING)/gi);
    for (const m of taskMatches) tasks.push(`${m[2]}: ${m[1].trim()}`);

    const filesChanged: string[] = [];
    const fileMatches = block.matchAll(/[`"]([A-Za-z_/]+\.(tsx?|sql|ts|css|md))[`"]/g);
    for (const m of fileMatches) filesChanged.push(m[1]);

    const migrations = filesChanged.filter(f => f.endsWith(".sql"));
    const functions = filesChanged.filter(f => f.includes("functions/"));
    const pages = filesChanged.filter(f => f.includes("pages/") && f.endsWith(".tsx"));

    const pendingMatches = block.matchAll(/pending[:\s]*(.+)/gi);
    const pending: string[] = [];
    for (const m of pendingMatches) pending.push(m[1].trim());

    sessions.push({
      id,
      date: dateMatch?.[1],
      summary: `Session ${id} — ${status}${commitMatch ? ` (${commitMatch[1]})` : ""}${tasks.length ? `. ${tasks.length} tasks.` : ""}`,
      filesChanged: [...new Set(filesChanged)],
      migrationsCreated: migrations,
      functionsCreated: functions,
      pagesCreated: pages,
      pendingWork: pending,
    });
  }
  return sessions;
}

function loadSessionsFromIndex(workspaceRoot: string): SessionEntry[] {
  const sessionsPath = `${workspaceRoot}/librarian-mcp/index/sessions.json`;
  if (!existsSync(sessionsPath)) return [];
  try {
    const raw = readFileSync(sessionsPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is SessionEntry => Boolean(entry && typeof entry.id === "string" && typeof entry.summary === "string"))
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        summary: entry.summary,
        filesChanged: Array.isArray(entry.filesChanged) ? entry.filesChanged : [],
        migrationsCreated: Array.isArray(entry.migrationsCreated) ? entry.migrationsCreated : [],
        functionsCreated: Array.isArray(entry.functionsCreated) ? entry.functionsCreated : [],
        pagesCreated: Array.isArray(entry.pagesCreated) ? entry.pagesCreated : [],
        pendingWork: Array.isArray(entry.pendingWork) ? entry.pendingWork : [],
      }));
  } catch {
    return [];
  }
}

function extractCanonicalNumbers(handoff: string, rules: string, workspaceRoot?: string): Record<string, string | number> {
  const canonical: Record<string, string | number> = {};

  // Primary source of truth: useCanonicalStats.ts in the platform codebase
  let innovationCount = 2130;
  let crownJewelCount = 168;
  let productionSystems = 35;
  let patentClaims = 2103;
  let patentApps = 11;
  if (workspaceRoot) {
    try {
      const statsFile = readFileSync(`${workspaceRoot}/platform/src/hooks/useCanonicalStats.ts`, "utf-8");
      const innovMatch = statsFile.match(/innovationCount:\s*(\d[\d_]+)/);
      if (innovMatch) innovationCount = parseInt(innovMatch[1].replace(/_/g, ""));
      const crownMatch = statsFile.match(/crownJewels:\s*(\d[\d_]+)/);
      if (crownMatch) crownJewelCount = parseInt(crownMatch[1].replace(/_/g, ""));
      const prodMatch = statsFile.match(/productionSystems:\s*(\d[\d_]+)/);
      if (prodMatch) productionSystems = parseInt(prodMatch[1].replace(/_/g, ""));
      const claimsMatch = statsFile.match(/patentClaims:\s*(\d[\d_]+)/);
      if (claimsMatch) patentClaims = parseInt(claimsMatch[1].replace(/_/g, ""));
      const appsMatch = statsFile.match(/patentApplications:\s*(\d[\d_]+)/);
      if (appsMatch) patentApps = parseInt(appsMatch[1].replace(/_/g, ""));
    } catch { /* file may not exist */ }
  }
  canonical.innovationCount = innovationCount;
  canonical.crownJewelCount = crownJewelCount;
  canonical.productionSystems = productionSystems;
  canonical.formalClaimsCount = patentClaims;
  canonical.provisionalApps = patentApps;

  canonical.creatorKeeps = "83.3%";
  canonical.platformMargin = "Cost + 20%";
  canonical.on500Transaction = "$416.67";
  canonical.membershipCost = "$5/year";
  canonical.initiativeCount = 16;

  return canonical;
}

function extractPendingWork(handoff: string): string[] {
  const pending: string[] = [];
  const pendingSection = handoff.match(/##\s*PENDING\s*WORK[\s\S]*?(?=\n##\s)/i);
  if (pendingSection) {
    const lines = pendingSection[0].split("\n");
    for (const line of lines) {
      const item = line.match(/^[-*]\s+(.+)/);
      if (item) pending.push(item[1].trim());
    }
  }

  const tableMatches = handoff.matchAll(/\|\s*\w+\s*\|.*?\|\s*PENDING\s*\|/gi);
  for (const m of tableMatches) {
    const cells = m[0].split("|").map(c => c.trim()).filter(Boolean);
    if (cells.length >= 2) pending.push(cells[1]);
  }

  return [...new Set(pending)];
}

function extractRules(rules: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = rules.split("\n");
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
    if (match) {
      result[match[1].trim()] = match[2].trim();
    }
  }
  return result;
}

export async function parseContext(workspaceRoot: string): Promise<ContextIndex> {
  const handoffPath = `${workspaceRoot}/CONTEXT_MANAGEMENT/MILESTONE_HANDOFF_MARCH_2026.md`;
  const rulesPath = `${workspaceRoot}/.cursor/rules/liana-banyan-context.mdc`;

  const handoff = existsSync(handoffPath) ? readFileSync(handoffPath, "utf-8") : "";
  const rules = existsSync(rulesPath) ? readFileSync(rulesPath, "utf-8") : "";

  const handoffSessions = extractSessions(handoff);
  const indexedSessions = loadSessionsFromIndex(workspaceRoot);
  const sessions = handoffSessions.length > 0 ? handoffSessions : indexedSessions;
  const canonicalNumbers = extractCanonicalNumbers(handoff, rules, workspaceRoot);
  const pendingWork = extractPendingWork(handoff);
  const rulesMap = extractRules(rules);

  const migrationFiles = await glob(`${workspaceRoot.replace(/\\/g, "/")}/platform/supabase/migrations/*.sql`, { absolute: true });
  migrationFiles.sort();
  const pendingMigrations: string[] = [];
  const lastCommitMigrations = handoff.match(/latest.*?migration.*?(\d{14,})/i);
  if (lastCommitMigrations) {
    const cutoff = lastCommitMigrations[1];
    for (const f of migrationFiles) {
      const ts = basename(f).match(/^(\d+)/)?.[1] || "";
      if (ts > cutoff) pendingMigrations.push(basename(f));
    }
  }

  return {
    sessions,
    canonicalNumbers,
    pendingWork,
    deployState: {
      pendingMigrations,
      buildCommands: {
        "lianabanyan.com": "cd platform; npm run build; firebase deploy --only hosting:main -P default",
        "cephas.lianabanyan.com": "cd Cephas/cephas-hugo; hugo --minify; firebase deploy",
        "lianabanyan.biz": "cd business-trunk; firebase deploy --only hosting:biz",
        "the2ndsecond.com": "cd dss-the2ndsecond; npm run build; firebase deploy --only hosting:2ndsecond -P default",
      },
    },
    rules: rulesMap,
  };
}
