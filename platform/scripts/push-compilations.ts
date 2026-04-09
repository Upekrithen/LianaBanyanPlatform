import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type Section =
  | "pudding"
  | "journal"
  | "paper"
  | "letter"
  | "article"
  | "aa-formal"
  | "cephas"
  | "general";

type EnvMap = Record<string, string>;

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const BISHOP_DROPZONE = path.resolve(PROJECT_ROOT, "..", "BISHOP_DROPZONE");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");

const COMPILED_PREFIX = "COMPILED_";
const HISTORY_PREFIX = "HISTORY_";
const BLUEPRINT_PREFIX = "BLUEPRINT_";

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase credentials. Expected SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or publishable key.",
    );
  }

  const allFiles = await readdir(BISHOP_DROPZONE);
  const upsertExisting = process.argv.includes("--upsert-existing");
  const compiledFiles = allFiles
    .filter((file) => /^COMPILED_.*\.md$/i.test(file))
    .sort((a, b) => a.localeCompare(b));
  const historyFiles = allFiles.filter((file) => /^HISTORY_.*\.md$/i.test(file));
  const blueprintFiles = allFiles.filter((file) => /^BLUEPRINT_.*\.md$/i.test(file));

  if (compiledFiles.length === 0) {
    console.log("No COMPILED_*.md files found.");
    return;
  }

  console.log(`Found ${compiledFiles.length} compiled files in BISHOP_DROPZONE.`);
  console.log(`Mode: ${upsertExisting ? "upsert_existing" : "insert_missing_only"}`);
  const existingSlugs = await fetchExistingSlugs(supabaseUrl, supabaseKey);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const filename of compiledFiles) {
    try {
      const sourcePath = path.resolve(BISHOP_DROPZONE, filename);
      const compiledMarkdown = await readFile(sourcePath, "utf8");
      const base = filename.replace(/^COMPILED_/i, "").replace(/\.md$/i, "");
      const slug = toSlug(base);

      if (existingSlugs.has(slug) && !upsertExisting) {
        skipped += 1;
        console.log(`SKIP ${slug} (already exists)`);
        continue;
      }

      const title = extractTitle(compiledMarkdown) ?? prettifyBase(base);
      const section = detectSection(filename, compiledMarkdown);
      const category = sectionToCategory(section);
      const sourceFiles = extractSourceFiles(compiledMarkdown);
      const sourceCount = sourceFiles.length;
      const familyName = prettifyBase(base);

      const historyFile = findCompanion(base, HISTORY_PREFIX, historyFiles);
      const blueprintFile = findCompanion(base, BLUEPRINT_PREFIX, blueprintFiles);
      const notes = await buildNotes(historyFile, blueprintFile);

      const payload = {
        slug,
        title,
        family_name: familyName,
        section,
        category,
        compiled_markdown: compiledMarkdown,
        source_count: sourceCount,
        source_files: sourceFiles.map((file) => ({ path: file })),
        compilation_notes: notes ? JSON.stringify(notes) : null,
        compiled_by: "bishop",
        status: "canonical",
      };

      await postCompilation(supabaseUrl, supabaseKey, payload);
      inserted += 1;
      console.log(`OK   ${slug}`);
    } catch (error) {
      errors += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`ERR  ${filename}: ${message}`);
    }
  }

  console.log("\nPush complete:");
  console.log(`  inserted: ${inserted}`);
  console.log(`  skipped: ${skipped}`);
  console.log(`  errors: ${errors}`);
}

async function fetchExistingSlugs(supabaseUrl: string, supabaseKey: string): Promise<Set<string>> {
  const url = new URL(`${supabaseUrl}/rest/v1/compiled_documents`);
  url.searchParams.set("select", "slug");
  url.searchParams.set("limit", "1000");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to query existing compiled_documents rows: ${response.status} ${body}`);
  }

  const rows = (await response.json()) as Array<{ slug?: string | null }>;
  return new Set(rows.map((row) => row.slug).filter((slug): slug is string => Boolean(slug)));
}

async function postCompilation(supabaseUrl: string, supabaseKey: string, payload: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/functions/v1/compile-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`compile-document failed: ${response.status} ${raw}`);
  }
}

async function buildNotes(historyFile: string | null, blueprintFile: string | null) {
  if (!historyFile && !blueprintFile) return null;
  const notes: Record<string, string> = {};

  if (historyFile) {
    notes.history_file = historyFile;
    notes.history_markdown = await readFile(path.resolve(BISHOP_DROPZONE, historyFile), "utf8");
  }
  if (blueprintFile) {
    notes.blueprint_file = blueprintFile;
    notes.blueprint_markdown = await readFile(path.resolve(BISHOP_DROPZONE, blueprintFile), "utf8");
  }

  return notes;
}

function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function extractSourceFiles(markdown: string): string[] {
  const files = new Set<string>();
  const mdFilePattern = /`([^`\n]+?\.(?:md|tsx?|sql|json|txt|html))`/gi;
  const bulletFilePattern = /(?:^|\n)\s*[-*]\s+([A-Za-z0-9_./\\ -]+\.(?:md|tsx?|sql|json|txt|html))/gim;

  for (const match of markdown.matchAll(mdFilePattern)) {
    files.add(match[1].trim());
  }
  for (const match of markdown.matchAll(bulletFilePattern)) {
    files.add(match[1].trim());
  }

  return [...files].sort((a, b) => a.localeCompare(b));
}

function findCompanion(base: string, prefix: string, candidates: string[]): string | null {
  const exact = `${prefix}${base}.md`;
  if (candidates.includes(exact)) return exact;

  const baseTokens = tokenize(base);
  const scored = candidates
    .filter((candidate) => candidate.startsWith(prefix))
    .map((candidate) => {
      const stem = candidate.replace(prefix, "").replace(/\.md$/i, "");
      const stemTokens = tokenize(stem);
      const overlap = stemTokens.filter((token) => baseTokens.includes(token)).length;
      const contains = stem.includes(base) || base.includes(stem) ? 2 : 0;
      return { candidate, score: overlap + contains };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate ?? null;
}

function tokenize(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function detectSection(filename: string, markdown: string): Section {
  const base = filename.toLowerCase().replace(/^compiled_/i, "").replace(/\.md$/i, "");
  if (base.includes("aa_formals")) return "aa-formal";
  if (base.includes("founders_journal")) return "journal";
  if (base.includes("pudding")) return "pudding";
  if (base.includes("academic_papers")) return "paper";
  if (base.includes("cephas")) return "cephas";
  if (base.includes("letter") || base.includes("letters")) return "letter";
  if (base.includes("article") || base.includes("articles")) return "article";

  const contentHint = markdown.toLowerCase();
  if (contentHint.includes("cephas")) return "cephas";
  if (contentHint.includes("pudding")) return "pudding";
  if (contentHint.includes("journal")) return "journal";
  if (contentHint.includes("academic paper")) return "paper";
  if (contentHint.includes("letter")) return "letter";
  if (contentHint.includes("article")) return "article";
  return "general";
}

function sectionToCategory(section: Section): string {
  const map: Record<Section, string> = {
    pudding: "pudding",
    journal: "founders-journal",
    paper: "academic-paper",
    letter: "letter",
    article: "article",
    "aa-formal": "aa-formal",
    cephas: "cephas",
    general: "general",
  };
  return map[section];
}

function prettifyBase(base: string): string {
  return base
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function toSlug(base: string): string {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function loadEnv(): Promise<EnvMap> {
  const env: EnvMap = { ...(process.env as Record<string, string>) };
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
