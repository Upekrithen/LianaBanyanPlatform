import { readFileSync } from "fs";
import { basename } from "path";
import { glob } from "glob";
import type { SessionEssenceIndex, SessionEssenceEntry } from "../types.js";

const SESSIONS_DIR = "C:/Users/Administrator/.claude/state/eblets/SESSIONS";

function extractFrontmatter(content: string): Record<string, string> {
  const fm: Record<string, string> = {};
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return fm;
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) fm[kv[1].trim()] = kv[2].trim();
  }
  return fm;
}

function extractTitle(content: string, fm: Record<string, string>): string {
  // Try ## Scale-class milestone section
  const scaleMatch = content.match(/##\s+Scale-class milestone\s*\n+\*\*([^*]+)\*\*/);
  if (scaleMatch) return scaleMatch[1].trim().slice(0, 200);

  // Try first bold in scale section
  const boldMatch = content.match(/##\s+Scale-class milestone[\s\S]{0,20}\n+([^\n]+)/);
  if (boldMatch) return boldMatch[1].replace(/\*\*/g, "").trim().slice(0, 200);

  // Fallback to bp
  return `Session Essence ${fm.bp || "unknown"}`;
}

function extractSnippet(content: string): string {
  // Strip frontmatter
  const body = content.replace(/^---[\s\S]*?---\s*\n/, "");
  // Get first non-empty, non-heading lines
  const lines = body.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
  return lines.slice(0, 4).join(" ").replace(/\*\*/g, "").trim().slice(0, 400);
}

function extractKeywords(content: string, bp: string): string[] {
  const kws = new Set<string>();

  // Always add bp
  kws.add(bp.toLowerCase());

  // Extract quoted Founder phrases (short ones)
  const quotes = [...content.matchAll(/\*"([^"]{5,80})"\*/g)];
  for (const q of quotes.slice(0, 6)) {
    kws.add(q[1].toLowerCase().trim());
  }

  // Extract bold terms from "Terms coined" section
  const termsSection = content.match(/##\s+Terms coined[\s\S]{0,2000}/i);
  if (termsSection) {
    const bolds = [...termsSection[0].matchAll(/\*\*([^*]{2,60})\*\*/g)];
    for (const b of bolds.slice(0, 15)) {
      kws.add(b[1].toLowerCase().trim());
    }
  }

  // Extract bold terms from "Key decisions" section
  const decisionsSection = content.match(/##\s+Key decisions[\s\S]{0,3000}/i);
  if (decisionsSection) {
    const bolds = [...decisionsSection[0].matchAll(/\*\*([^*]{2,60})\*\*/g)];
    for (const b of bolds.slice(0, 20)) {
      kws.add(b[1].toLowerCase().trim());
    }
  }

  // Extract date from frontmatter or date section
  const dateMatch = content.match(/date:\s*([\d-]+)/);
  if (dateMatch) kws.add(dateMatch[1]);

  return [...kws].slice(0, 50);
}

export async function parseSessionEssences(): Promise<SessionEssenceIndex> {
  const entries: Record<string, SessionEssenceEntry> = {};

  const pattern = `${SESSIONS_DIR}/session_essence_bp*.md`;
  const files = await glob(pattern.replace(/\\/g, "/"), { absolute: true });

  for (const file of files) {
    const filename = basename(file);
    let content: string;
    try {
      content = readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    const fm = extractFrontmatter(content);
    const bp = (fm.bp || filename.match(/bp(\w+)/i)?.[1] || "unknown").toUpperCase();
    const bpKey = bp.startsWith("BP") ? bp : `BP${bp}`;

    const entry: SessionEssenceEntry = {
      bp: bpKey,
      date: fm.date,
      title: extractTitle(content, fm),
      snippet: extractSnippet(content),
      keywords: extractKeywords(content, bpKey),
      filename,
      path: file.replace(/\\/g, "/"),
    };

    entries[bpKey] = entry;
  }

  return {
    entries,
    count: Object.keys(entries).length,
  };
}
