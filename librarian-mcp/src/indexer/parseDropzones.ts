import { readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import { basename } from "path";
import type { DropzoneIndex, DropzoneEntry } from "../types.js";

const AGENTS = ["KNIGHT", "BISHOP", "ROOK", "PAWN"] as const;

function extractTitle(content: string, filename: string): string {
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch) return titleMatch[1].trim().slice(0, 200);

  const missionMatch = content.match(/(?:MISSION|TASK|PROMPT)[:\s]+(.+)/i);
  if (missionMatch) return missionMatch[1].trim().slice(0, 200);

  return filename.replace(/\.md$/, "").replace(/_/g, " ");
}

function extractSummary(content: string): string {
  const lines = content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith("|"));
  return lines.slice(0, 5).join(" ").trim().slice(0, 400) || "No summary available.";
}

function extractTags(content: string, filename: string): string[] {
  const tags = new Set<string>();
  const lower = content.toLowerCase();

  const kwPatterns = [
    "migration", "deployment", "stripe", "supabase", "firebase",
    "letter", "patent", "innovation", "crown", "initiative",
    "housing", "ghost world", "hex isle", "treasure map",
    "lb card", "membership", "calendar", "beacon", "crew",
    "guild", "payout", "connect", "social", "political",
    "onboarding", "audit", "compliance", "legal", "sec",
  ];

  for (const kw of kwPatterns) {
    if (lower.includes(kw)) tags.add(kw);
  }

  const sessionMatch = filename.match(/SESSION[_\s]*(\d+)/i);
  if (sessionMatch) tags.add(`session-${sessionMatch[1]}`);

  return [...tags].slice(0, 20);
}

export async function parseDropzones(workspaceRoot: string): Promise<DropzoneIndex> {
  const entries: Record<string, DropzoneEntry> = {};
  const byAgent: Record<string, string[]> = {};
  let totalWords = 0;

  for (const agent of AGENTS) {
    const dir = resolve(workspaceRoot, `${agent}_DROPZONE`);
    const normalizedDir = dir.replace(/\\/g, "/");
    const files = await glob(`${normalizedDir}/**/*.md`, { absolute: true });
    byAgent[agent] = [];

    for (const file of files) {
      const filename = basename(file);
      const content = readFileSync(file, "utf-8");
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      totalWords += wordCount;

      const sessionMatch = filename.match(/SESSION[_\s]*(\d+)/i);
      const key = `${agent}/${filename}`;

      entries[key] = {
        filename,
        path: file.replace(/\\/g, "/"),
        agent,
        sessionId: sessionMatch?.[1],
        title: extractTitle(content, filename),
        summary: extractSummary(content),
        tags: extractTags(content, filename),
        wordCount,
      };

      byAgent[agent].push(key);
    }
  }

  return {
    entries,
    byAgent,
    count: Object.keys(entries).length,
    totalWords,
  };
}
