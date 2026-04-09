import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type PuddingRow = {
  pudding_number: number;
  title: string;
  slug: string;
  source_paper: string | null;
  source_paper_word_count: number | null;
  pudding_text: string;
  not_pudding_summary: string | null;
  primary_spice: string;
  secondary_spices: string[];
  innovations_referenced: number[];
  bishop_session: string;
  status: string;
};

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const BISHOP_DROPZONE = path.resolve(PROJECT_ROOT, "..", "BISHOP_DROPZONE");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");
const KNOWN_SPICES = new Set([
  "salt",
  "pepper",
  "garlic",
  "cumin",
  "cinnamon",
  "paprika",
  "oregano",
  "sugar",
  "basil",
  "ginger",
]);

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  }

  const files = await listFilesRecursive(BISHOP_DROPZONE);
  const candidates = files
    .map((fullPath) => {
      const name = path.basename(fullPath);
      const match = name.match(/^PUDDING_(\d+)_.*\.md$/i);
      return { fullPath, name, number: Number(match?.[1] ?? 0) };
    })
    .filter((item) => Number.isInteger(item.number) && item.number > 0 && item.number < 109);

  const byNumber = new Map<number, Array<{ fullPath: string; name: string; number: number }>>();
  for (const candidate of candidates) {
    const list = byNumber.get(candidate.number) ?? [];
    list.push(candidate);
    byNumber.set(candidate.number, list);
  }

  const targets = [...byNumber.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, variants]) => pickPreferredVariant(variants));

  if (targets.length === 0) {
    console.log("No pre-B075 pudding files found.");
    return;
  }

  const rows: PuddingRow[] = [];
  const skipped: string[] = [];
  let sqlParsed = 0;
  let fallbackParsed = 0;
  for (const target of targets) {
    const markdown = await readFile(target.fullPath, "utf8");
    try {
      const parsed = parseSqlInsert(markdown, target.name);
      rows.push(parsed);
      sqlParsed += 1;
    } catch {
      try {
        const parsed = parseFallbackMarkdown(markdown, target.number, target.name);
        rows.push(parsed);
        fallbackParsed += 1;
      } catch {
        skipped.push(target.name);
      }
    }
  }

  if (rows.length === 0) {
    throw new Error("No parseable pre-B075 pudding rows found.");
  }

  await reconcileSlugConflicts(rows, supabaseUrl, publishableKey);

  const response = await fetch(`${supabaseUrl}/rest/v1/cephas_puddings?on_conflict=pudding_number`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(rows),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Backfill failed: ${response.status} ${raw}`);
  }

  const returned = JSON.parse(raw) as Array<{ pudding_number: number }>;
  const min = Math.min(...rows.map((row) => row.pudding_number));
  const max = Math.max(...rows.map((row) => row.pudding_number));
  console.log(
    `Backfill complete. Upserted ${returned.length} rows from ${rows.length} files (puddings ${min}-${max}).`,
  );
  console.log(`Parsed with SQL blocks: ${sqlParsed}`);
  console.log(`Parsed with fallback markdown parser: ${fallbackParsed}`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} files that could not be parsed.`);
  }
}

function pickPreferredVariant(variants: Array<{ fullPath: string; name: string; number: number }>) {
  return [...variants].sort((a, b) => variantScore(b) - variantScore(a))[0];
}

function variantScore(item: { fullPath: string; name: string }) {
  let score = 0;
  if (/_B\d{3}\.md$/i.test(item.name)) score += 100;
  if (!/archive/i.test(item.fullPath)) score += 20;
  const depth = item.fullPath.split(/[\\/]/g).length;
  score += Math.max(0, 20 - depth);
  return score;
}

function parseSqlInsert(markdown: string, sourceFile: string): PuddingRow {
  const match = markdown.match(/\) VALUES \(([\s\S]*?)\);\s*```/m);
  if (!match) {
    throw new Error(`${sourceFile}: could not locate SQL VALUES block`);
  }

  const rawLines = match[1]
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/,$/, ""));

  if (rawLines.length < 12) {
    throw new Error(`${sourceFile}: unexpected VALUES line count (${rawLines.length})`);
  }

  const pudding_number = Number(rawLines[0]);
  const title = parseSqlString(rawLines[1]);
  const slug = parseSqlString(rawLines[2]);
  const source_paper = parseSqlNullableString(rawLines[3]);
  const source_paper_word_count = parseSqlNullableInt(rawLines[4]);
  const pudding_text = parseSqlString(rawLines[5]);
  const not_pudding_summary = parseSqlNullableString(rawLines[6]);
  const primary_spice = parseSqlString(rawLines[7]);
  const secondary_spices = parseSqlTextArray(rawLines[8]);
  const innovations_referenced = parseSqlIntArray(rawLines[9]);
  const bishop_session = parseSqlString(rawLines[10]);
  const status = parseSqlString(rawLines[11]);

  if (!Number.isInteger(pudding_number)) {
    throw new Error(`${sourceFile}: invalid pudding_number`);
  }

  return {
    pudding_number,
    title,
    slug,
    source_paper,
    source_paper_word_count,
    pudding_text,
    not_pudding_summary,
    primary_spice,
    secondary_spices,
    innovations_referenced,
    bishop_session,
    status,
  };
}

function parseFallbackMarkdown(markdown: string, puddingNumber: number, sourceFile: string): PuddingRow {
  const title = parseTitle(markdown, sourceFile, puddingNumber);
  const slug = slugify(sourceFile, title);
  const source_paper = parseSourcePaper(markdown);
  const source_paper_word_count = parseSourceWordCount(markdown);
  const pudding_text = parseSection(markdown, "The Pudding") ?? parseFirstParagraph(markdown);
  const not_pudding_summary = parseSection(markdown, "This is NOT Pudding")
    ? parseFirstParagraph(parseSection(markdown, "This is NOT Pudding") ?? "")
    : null;
  const spices = parseSpices(markdown);
  const bishop_session = parseBishopSession(markdown, sourceFile);
  const innovations_referenced = parseInnovationIds(markdown);

  if (!pudding_text) {
    throw new Error(`${sourceFile}: missing pudding text`);
  }

  return {
    pudding_number: puddingNumber,
    title,
    slug,
    source_paper,
    source_paper_word_count,
    pudding_text,
    not_pudding_summary,
    primary_spice: spices.primary,
    secondary_spices: spices.secondary,
    innovations_referenced,
    bishop_session,
    status: "draft",
  };
}

function parseTitle(markdown: string, sourceFile: string, puddingNumber: number) {
  const heading =
    markdown.match(/^#\s*Pudding\s*#?\d+\s*[—:-]\s*(.+)$/im)?.[1]?.trim() ??
    markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading && heading.length > 0) return heading;
  const fallback = sourceFile.replace(/^PUDDING_\d+_/, "").replace(/_B\d{3}\.md$/i, "").replace(/\.md$/i, "");
  return fallback
    .split("_")
    .filter(Boolean)
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(" ") || `Pudding ${puddingNumber}`;
}

function parseSourcePaper(markdown: string) {
  const sourceLine = markdown.match(/\*\*Source\*\*:\s*(.+)$/im)?.[1]?.trim();
  return sourceLine && sourceLine.length > 0 ? sourceLine : null;
}

function parseSourceWordCount(markdown: string) {
  const match = markdown.match(/(~?\d{1,3}(?:,\d{3})*)-word/i);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

function parseSection(markdown: string, sectionTitle: string): string | null {
  const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^##\\s+${escaped}\\s*$`, "im");
  const startMatch = regex.exec(markdown);
  if (!startMatch || startMatch.index === undefined) return null;
  const start = startMatch.index + startMatch[0].length;
  const rest = markdown.slice(start);
  const endMatch = rest.match(/^##\s+/m);
  const section = (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
  return section.length > 0 ? section : null;
}

function parseFirstParagraph(text: string): string {
  const paragraph = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  return (paragraph ?? "").replace(/\s+/g, " ").trim();
}

function parseSpices(markdown: string): { primary: string; secondary: string[] } {
  const spiceSection = parseSection(markdown, "Spice Tags") ?? "";
  const primaryFromTable =
    spiceSection.match(/\|\s*([A-Za-z]+)[^|]*\|\s*Primary/i)?.[1]?.toLowerCase() ??
    markdown.match(/Spice:\s*([A-Za-z]+)/i)?.[1]?.toLowerCase();
  const secondary = [...spiceSection.matchAll(/\|\s*([A-Za-z]+)[^|]*\|\s*Secondary/gi)]
    .map((match) => (match[1] ?? "").toLowerCase())
    .filter((spice) => KNOWN_SPICES.has(spice));
  const uniqueSecondary = [...new Set(secondary)];
  const primary = KNOWN_SPICES.has(primaryFromTable ?? "") ? (primaryFromTable as string) : "salt";
  return {
    primary,
    secondary: uniqueSecondary.filter((spice) => spice !== primary),
  };
}

function parseBishopSession(markdown: string, sourceFile: string): string {
  const fromContent = markdown.match(/\*\*Session\*\*:\s*([A-Z]\d{3})/i)?.[1];
  if (fromContent) return fromContent.toUpperCase();
  const fromFile = sourceFile.match(/_B(\d{3})\.md$/i)?.[1];
  if (fromFile) return `B${fromFile}`;
  return "UNKNOWN";
}

function parseInnovationIds(markdown: string): number[] {
  const ids = [...markdown.matchAll(/Innovation(?:s)?\s*#(\d{1,4})/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isInteger(value));
  return [...new Set(ids)];
}

function slugify(sourceFile: string, title: string): string {
  const fromFile = sourceFile
    .replace(/^PUDDING_\d+_/, "")
    .replace(/_B\d{3}\.md$/i, "")
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "-");
  if (fromFile) return fromFile;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function parseSqlString(value: string): string {
  if (!value.startsWith("'") || !value.endsWith("'")) {
    throw new Error(`Expected SQL string, received: ${value}`);
  }
  return value.slice(1, -1).replace(/''/g, "'");
}

function parseSqlNullableString(value: string): string | null {
  if (value.toUpperCase() === "NULL") return null;
  return parseSqlString(value);
}

function parseSqlNullableInt(value: string): number | null {
  if (value.toUpperCase() === "NULL") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected numeric value, received: ${value}`);
  }
  return parsed;
}

function parseSqlTextArray(value: string): string[] {
  if (!value.startsWith("ARRAY[")) {
    throw new Error(`Expected ARRAY[...] text array, received: ${value}`);
  }
  const inner = value.slice("ARRAY[".length, -1).trim();
  if (!inner) return [];
  const parts = inner.split(",").map((part) => part.trim());
  return parts.map((part) => parseSqlString(part));
}

function parseSqlIntArray(value: string): number[] {
  if (!value.startsWith("ARRAY[")) {
    throw new Error(`Expected ARRAY[...] int array, received: ${value}`);
  }
  const inner = value.slice("ARRAY[".length, -1).trim();
  if (!inner) return [];
  return inner.split(",").map((part) => Number(part.trim()));
}

async function loadEnv() {
  const env = { ...process.env } as Record<string, string>;
  const raw = await readFile(ENV_FILE, "utf8");
  for (const line of raw.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    env[key] = value;
  }
  return env;
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const output: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath);
      output.push(...nested);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      output.push(fullPath);
    }
  }
  return output;
}

async function reconcileSlugConflicts(rows: PuddingRow[], supabaseUrl: string, publishableKey: string) {
  const existingResponse = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number,slug&limit=5000`,
    {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
    },
  );
  if (!existingResponse.ok) {
    throw new Error(`Failed to read existing slugs: ${existingResponse.status} ${await existingResponse.text()}`);
  }

  const existing = (await existingResponse.json()) as Array<{ pudding_number: number; slug: string }>;
  const existingSlugToNumber = new Map(existing.map((row) => [row.slug, row.pudding_number]));
  const seen = new Map<string, number>();

  rows.sort((a, b) => a.pudding_number - b.pudding_number);
  for (const row of rows) {
    const base = row.slug;
    let candidate = base;
    let suffix = 0;

    while (true) {
      const localCollision = seen.has(candidate) && seen.get(candidate) !== row.pudding_number;
      const remoteOwner = existingSlugToNumber.get(candidate);
      const remoteCollision = remoteOwner !== undefined && remoteOwner !== row.pudding_number;
      if (!localCollision && !remoteCollision) break;
      suffix += 1;
      candidate = `${base}-${row.pudding_number}${suffix > 1 ? `-${suffix}` : ""}`;
    }

    row.slug = candidate;
    seen.set(candidate, row.pudding_number);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

