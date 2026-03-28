import { readFileSync } from "fs";
import { glob } from "glob";
import { basename } from "path";
import mammoth from "mammoth";
import type { BishopIndex, BishopChatEntry } from "../types.js";

const BISHOP_DIR = "C:/Users/Administrator/Documents/LianaBanyanBISHOP";

async function readDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch {
    return "";
  }
}

function readRtf(filePath: string): string {
  try {
    const raw = readFileSync(filePath, "utf-8");
    return raw
      .replace(/\{\\[^{}]*\}/g, "")
      .replace(/\\[a-z]+\d*\s?/gi, "")
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

function extractSummary(content: string, filename: string): string {
  const purposeMatch = content.match(/##\s*PURPOSE\s*\n+([\s\S]*?)(?=\n##|\n---)/i);
  if (purposeMatch) return purposeMatch[1].trim().slice(0, 300);

  const firstHeader = content.match(/^#\s+(.+)/m);
  if (firstHeader) return firstHeader[1].trim();

  return `Chat transcript: ${filename}`;
}

function extractKeyDecisions(content: string): string[] {
  const decisions: string[] = [];

  const decisionPatterns = [
    /(?:decided|decision|chose|chosen|approved|confirmed)[:\s]+(.{20,200})/gi,
    /(?:KEY DECISION|DECISION)[:\s]+(.+)/gi,
    /(?:we (?:will|should|must|agreed))\s+(.{20,150})/gi,
  ];

  for (const pattern of decisionPatterns) {
    const matches = content.matchAll(pattern);
    for (const m of matches) {
      const decision = m[1].trim().replace(/\n/g, " ").slice(0, 200);
      if (decision.length > 15) decisions.push(decision);
    }
  }

  return [...new Set(decisions)].slice(0, 20);
}

function extractTopics(content: string): string[] {
  const topics = new Set<string>();

  const headingMatches = content.matchAll(/^#{1,3}\s+(.+)/gm);
  for (const m of headingMatches) {
    const heading = m[1].trim().replace(/[*_`]/g, "");
    if (heading.length > 3 && heading.length < 100) {
      topics.add(heading);
    }
  }

  const topicKeywords = [
    "innovation", "patent", "crown jewel", "initiative", "deployment",
    "migration", "edge function", "membership", "stripe", "housing",
    "ghost world", "hex isle", "treasure map", "lb card", "medal",
    "guild", "crew", "beacon", "payout", "connect", "calendar",
    "cephas", "letter", "crown letter",
  ];

  const lower = content.toLowerCase();
  for (const kw of topicKeywords) {
    if (lower.includes(kw)) topics.add(kw);
  }

  return [...topics].slice(0, 30);
}

function extractDate(content: string, filename: string): string | undefined {
  const dateMatch = content.match(/(?:date|created|session)[:\s]*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i);
  if (dateMatch) return dateMatch[1].replace(/\//g, "-");

  const monthMatch = content.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (monthMatch) {
    const months: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04",
      may: "05", june: "06", july: "07", august: "08",
      september: "09", october: "10", november: "11", december: "12",
    };
    return `${monthMatch[3]}-${months[monthMatch[1].toLowerCase()]}-${monthMatch[2].padStart(2, "0")}`;
  }

  return undefined;
}

async function processFile(file: string): Promise<{ content: string; filename: string } | null> {
  const filename = basename(file);
  const ext = filename.split(".").pop()?.toLowerCase();

  let content = "";
  if (ext === "md") {
    content = readFileSync(file, "utf-8");
  } else if (ext === "docx") {
    content = await readDocx(file);
  } else if (ext === "rtf") {
    content = readRtf(file);
  }

  if (!content || content.length < 20) return null;
  return { content, filename };
}

export async function parseBishopChats(bishopDir?: string): Promise<BishopIndex> {
  const dir = bishopDir || BISHOP_DIR;
  const normalizedDir = dir.replace(/\\/g, "/");

  const mdFiles = await glob(`${normalizedDir}/**/*.md`, { absolute: true });
  const docxFiles = await glob(`${normalizedDir}/**/*.docx`, { absolute: true });
  const rtfFiles = await glob(`${normalizedDir}/**/*.rtf`, { absolute: true });
  const allFiles = [...mdFiles, ...docxFiles, ...rtfFiles];

  const chats: Record<string, BishopChatEntry> = {};
  let totalWords = 0;

  for (const file of allFiles) {
    const result = await processFile(file);
    if (!result) continue;

    const { content, filename } = result;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    totalWords += wordCount;

    const sessionIdMatch = filename.match(/(\d+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : filename.replace(/\.\w+$/, "");

    chats[filename] = {
      filename,
      path: file.replace(/\\/g, "/"),
      sessionId,
      date: extractDate(content, filename),
      summary: extractSummary(content, filename),
      keyDecisions: extractKeyDecisions(content),
      topicsDiscussed: extractTopics(content),
      wordCount,
    };
  }

  return {
    chats,
    count: Object.keys(chats).length,
    totalWords,
  };
}
