import { readFileSync, existsSync, statSync } from "fs";
import { glob } from "glob";
import { basename, relative } from "path";
import matter from "gray-matter";
import type { LetterIndex, LetterEntry } from "../types.js";

// Known crown letter recipients (last names — match anywhere in filename)
const CROWN_RECIPIENTS = [
  "buffett", "scott", "khan", "newmark", "seibel", "simon",
  "dougherty", "glenn", "williams", "kaiser", "trebor", "scholz",
  "herjavec", "kimmel", "swift", "gates", "schlossberg",
];

// Blessing/celebrity letters
const BLESSING_KEYWORDS = [
  "blessing", "parton", "pitbull", "staples", "ziwe", "fumudoh",
];

// Academic/media letter keywords
const MEDIA_KEYWORDS = [
  "media", "pitch", "press", "medium", "substack", "dispatch",
];

const POLITICAL_KEYWORDS = [
  "politic", "expedition", "congress", "olaf", "scholz_o",
];

function detectCategory(filename: string, content: string): LetterEntry["category"] {
  const lower = filename.toLowerCase();

  // Crown letters — 12 core recipients
  for (const name of CROWN_RECIPIENTS) {
    if (lower.includes(name)) return "crown";
  }

  // Blessing letters (celebrities)
  for (const kw of BLESSING_KEYWORDS) {
    if (lower.includes(kw)) return "crown";
  }

  // Media pitches
  for (const kw of MEDIA_KEYWORDS) {
    if (lower.includes(kw)) return "media";
  }

  // Political
  for (const kw of POLITICAL_KEYWORDS) {
    if (lower.includes(kw)) return "political";
  }

  if (/partner/i.test(filename)) return "partnership";
  if (/circle.?4|patron/i.test(content.slice(0, 500))) return "circle4";

  // Check directory path for category hints
  if (/crown/i.test(content.slice(0, 200))) return "crown";
  if (/academic|yale|indl|symposium/i.test(lower)) return "media";

  return "other";
}

// Known locked filenames (partial match, case-insensitive)
const LOCKED_NAMES = [
  "seibel", "simon", "newmark", "khan", "buffett",
  "dougherty", "glenn", "williams", "kaiser",
  "trebor_scholz", "olaf_scholz", "brynjolfsson", "doctorow", "schneider",
];

function detectStatus(filename: string, content: string, path: string): LetterEntry["status"] {
  const lower = filename.toLowerCase();

  // Check if in send-now or sent directories
  if (/send[-_]now|sent\//i.test(path)) return "sent";

  // Check content for status markers
  if (/STATUS:\s*LOCKED/i.test(content)) return "locked";
  if (/STATUS:\s*SENT/i.test(content)) return "sent";
  if (/STATUS:\s*REVIEWED/i.test(content)) return "reviewed";

  // Check for LOCKED letter patterns (crown letters that are locked)
  if (/LOCKED/i.test(lower)) return "locked";
  for (const name of LOCKED_NAMES) {
    if (lower.includes(name) && /sec[-_]safe|final|locked|v\d+/i.test(lower)) return "locked";
  }

  // Check for template variables
  if (/\{\{[a-zA-Z]/.test(content)) return "template";

  return "draft";
}

function extractRecipient(filename: string, content: string): string {
  // Try filename first: LETTER-BUFFETT.md → Buffett
  const nameMatch = filename.match(/LETTER[-_](.+?)(?:[-_]V\d+)?\.md$/i);
  if (nameMatch) {
    return nameMatch[1].replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  // Try front matter
  try {
    const parsed = matter(content);
    if (parsed.data.recipient) return parsed.data.recipient;
  } catch { /* no front matter */ }

  // Try first line
  const dearMatch = content.match(/Dear\s+(?:Mr\.|Mrs\.|Ms\.|Dr\.)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (dearMatch) return dearMatch[1];

  return basename(filename, ".md");
}

export async function parseLetters(workspaceRoot: string): Promise<LetterIndex> {
  const letters: Record<string, LetterEntry> = {};
  const byCategory: Record<string, string[]> = {};
  const byStatus: Record<string, string[]> = {};
  let totalWords = 0;

  // Scan letter directories
  const letterDirs = [
    `${workspaceRoot}/Asteroid-ProofVault/02_WRITTEN/01_Crown_Letters`,
    `${workspaceRoot}/Asteroid-ProofVault/02_WRITTEN/02_Circle4_Patron_Letters`,
    `${workspaceRoot}/Asteroid-ProofVault/02_WRITTEN/03_Media_Pitches`,
    `${workspaceRoot}/Asteroid-ProofVault/02_WRITTEN/04_Partnerships`,
    `${workspaceRoot}/Asteroid-ProofVault/02_WRITTEN/05_Political_Letters`,
    `${workspaceRoot}/letters`,
    `${workspaceRoot}/BISHOP_DROPZONE`,
  ];

  for (const dir of letterDirs) {
    const normalizedDir = dir.replace(/\\/g, "/");
    const files = await glob(`${normalizedDir}/**/LETTER*.md`, { absolute: true, nocase: true });

    for (const filePath of files) {
      const filename = basename(filePath);
      if (letters[filename]) continue; // dedupe

      let content = "";
      try {
        content = readFileSync(filePath, "utf-8");
      } catch { continue; }

      const stat = statSync(filePath);
      const wordCount = content.split(/\s+/).length;
      totalWords += wordCount;

      const recipient = extractRecipient(filename, content);
      const category = detectCategory(filename, content);
      const status = detectStatus(filename, content, filePath);

      const entry: LetterEntry = {
        filename,
        path: relative(workspaceRoot, filePath).replace(/\\/g, "/"),
        recipient,
        category,
        status,
        wordCount,
        lastModified: stat.mtime.toISOString(),
      };

      letters[filename] = entry;

      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(filename);

      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(filename);
    }
  }

  return {
    letters,
    byCategory,
    byStatus,
    count: Object.keys(letters).length,
    totalWords,
  };
}
