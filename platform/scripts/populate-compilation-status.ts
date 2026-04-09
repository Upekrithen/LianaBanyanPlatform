import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type EnvMap = Record<string, string>;

interface ArchiveEntry {
  filename?: string;
  slug?: string;
  section?: string;
  archive_file?: string;
}

interface ArchiveIndex {
  entries?: ArchiveEntry[];
}

interface CompiledDocumentRow {
  id: string;
  family_name: string | null;
}

interface CompilationStatusRow {
  family_name: string;
  status: "pending" | "in_progress" | "compiled" | "skipped" | "needs_review";
  compiled_document_id: string | null;
}

interface FamilyAggregate {
  familyName: string;
  section: string;
  variantCount: number;
}

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PROJECT_ROOT, "..");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");
const STITCHPUNKS_DATA_DIR = path.resolve(REPO_ROOT, "librarian-mcp", "stitchpunks", "data");
const BISHOP_DROPZONE = path.resolve(REPO_ROOT, "BISHOP_DROPZONE");

const REPORT_CANDIDATES = [
  path.resolve(STITCHPUNKS_DATA_DIR, "archivist_report.json"),
  path.resolve(STITCHPUNKS_DATA_DIR, "content_archive_index.json"),
];

async function main() {
  const env = await loadEnv();
  const supabaseUrl = (env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    env.SUPABASE_ANON_KEY ??
    "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY in platform/.env.");
  }

  const index = await loadArchiveIndex();
  const families = buildFamilies(index.entries ?? []);
  const compiledByDb = await fetchCompiledDocumentsByFamily(supabaseUrl, supabaseKey);
  const currentStatuses = await fetchCurrentStatuses(supabaseUrl, supabaseKey);
  const compiledByDropzone = await readCompiledDropzoneFamilies();

  const rows = families
    .filter((family) => family.variantCount >= 2)
    .map((family) => {
      const dbDoc = compiledByDb.get(family.familyName) ?? null;
      const inDropzone = compiledByDropzone.has(family.familyName);
      const current = currentStatuses.get(family.familyName);
      const isCompiled = Boolean(dbDoc || inDropzone || current?.status === "compiled");

      return {
        family_name: family.familyName,
        section: family.section,
        variant_count: family.variantCount,
        status: (isCompiled ? "compiled" : current?.status ?? "pending") as CompilationStatusRow["status"],
        compiled_document_id: dbDoc?.id ?? current?.compiled_document_id ?? null,
        assigned_to: isCompiled ? "auto" : null,
        notes: inDropzone && !dbDoc ? "COMPILED_*.md present in BISHOP_DROPZONE" : null,
        updated_at: new Date().toISOString(),
      };
    });

  const dedupedRows = dedupeRowsByFamily(rows);
  await upsertCompilationStatuses(supabaseUrl, supabaseKey, dedupedRows);
  printSummary(dedupedRows);
}

function normalizeFamilyName(filename: string, slug = ""): string {
  let name = filename.trim().toLowerCase();
  if (name.includes(".")) {
    name = name.slice(0, name.lastIndexOf("."));
  }
  name = name.replace(/\s*\(copy\)$/g, "");
  name = name.replace(/[-_ ](?:copy|final|draft|revised|rev\d+)$/g, "");
  name = name.replace(/[-_ ]v\d+$/g, "");
  name = name.replace(/[-_ ]\d{8,14}$/g, "");
  name = name.replace(/[-_ ]\d+$/g, "");
  name = name.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return name || slug || "unknown-family";
}

function sectionFromRaw(value?: string): string {
  const raw = (value ?? "").toLowerCase();
  if (raw.includes("letter")) return "letters";
  if (raw.includes("paper")) return "papers";
  if (raw.includes("blueprint")) return "blueprints";
  if (raw.includes("patent")) return "patent_bags";
  if (raw.includes("campaign") || raw.includes("press")) return "campaign_press";
  if (raw.includes("journal")) return "journals";
  return "misc";
}

function buildFamilies(entries: ArchiveEntry[]): FamilyAggregate[] {
  const byFamily = new Map<string, { section: string; archives: Set<string> }>();

  for (const entry of entries) {
    const familyName = normalizeFamilyName(entry.filename ?? "", entry.slug ?? "");
    const section = sectionFromRaw(entry.section);
    const aggregate = byFamily.get(familyName) ?? { section, archives: new Set<string>() };
    if (!byFamily.has(familyName)) byFamily.set(familyName, aggregate);
    if (entry.archive_file) {
      aggregate.archives.add(entry.archive_file);
    } else {
      aggregate.archives.add(`no-hash:${entry.filename ?? entry.slug ?? "unknown"}`);
    }
  }

  return [...byFamily.entries()].map(([familyName, aggregate]) => ({
    familyName,
    section: aggregate.section,
    variantCount: aggregate.archives.size,
  }));
}

async function loadArchiveIndex(): Promise<ArchiveIndex> {
  for (const candidate of REPORT_CANDIDATES) {
    try {
      const raw = await readFile(candidate, "utf8");
      const parsed = JSON.parse(raw) as ArchiveIndex;
      if (Array.isArray(parsed.entries)) {
        console.log(`Using archive report: ${path.basename(candidate)}`);
        return parsed;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    `Could not load archivist report. Expected one of: ${REPORT_CANDIDATES.map((p) => path.basename(p)).join(", ")}`,
  );
}

async function readCompiledDropzoneFamilies(): Promise<Set<string>> {
  const files = await listFilesRecursive(BISHOP_DROPZONE);
  const families = new Set<string>();

  for (const file of files) {
    const base = path.basename(file);
    if (!/^COMPILED_.*\.md$/i.test(base)) continue;
    const stem = base.replace(/^COMPILED_/i, "").replace(/\.md$/i, "");
    families.add(normalizeFamilyName(stem));
  }
  return families;
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function fetchCompiledDocumentsByFamily(supabaseUrl: string, supabaseKey: string) {
  const url = new URL(`${supabaseUrl}/rest/v1/compiled_documents`);
  url.searchParams.set("select", "id,family_name");
  url.searchParams.set("limit", "2000");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read compiled_documents: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as CompiledDocumentRow[];
  const map = new Map<string, CompiledDocumentRow>();
  for (const row of rows) {
    const normalized = normalizeFamilyName(row.family_name ?? "");
    if (normalized) map.set(normalized, row);
  }
  return map;
}

async function fetchCurrentStatuses(supabaseUrl: string, supabaseKey: string) {
  const url = new URL(`${supabaseUrl}/rest/v1/compilation_status`);
  url.searchParams.set("select", "family_name,status,compiled_document_id");
  url.searchParams.set("limit", "4000");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    // Table may not exist yet on first run. Return empty map and let migration happen first.
    console.warn(`compilation_status read skipped: ${response.status}`);
    return new Map<string, CompilationStatusRow>();
  }

  const rows = (await response.json()) as CompilationStatusRow[];
  return new Map(rows.map((row) => [normalizeFamilyName(row.family_name), row]));
}

async function upsertCompilationStatuses(
  supabaseUrl: string,
  supabaseKey: string,
  rows: Array<Record<string, unknown>>,
) {
  const url = new URL(`${supabaseUrl}/rest/v1/compilation_status`);
  url.searchParams.set("on_conflict", "family_name");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`Failed to upsert compilation_status rows: ${response.status} ${await response.text()}`);
  }
}

function dedupeRowsByFamily(rows: Array<Record<string, unknown>>) {
  const byFamily = new Map<string, Record<string, unknown>>();

  for (const row of rows) {
    const familyName = String(row.family_name ?? "").trim().toLowerCase();
    if (!familyName) continue;

    const existing = byFamily.get(familyName);
    if (!existing) {
      byFamily.set(familyName, row);
      continue;
    }

    const rowCompiled = row.status === "compiled";
    const existingCompiled = existing.status === "compiled";
    const rowVariantCount = Number(row.variant_count ?? 0);
    const existingVariantCount = Number(existing.variant_count ?? 0);

    // Prefer compiled rows; otherwise keep the row with the larger variant_count.
    if ((rowCompiled && !existingCompiled) || (rowCompiled === existingCompiled && rowVariantCount > existingVariantCount)) {
      byFamily.set(familyName, row);
    }
  }

  return [...byFamily.values()];
}

function printSummary(rows: Array<{ section: string; status: string }>) {
  const total = rows.length;
  const byStatus = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const bySection = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.section] = (acc[row.section] ?? 0) + 1;
    return acc;
  }, {});

  console.log("\nCompilation Status Population Complete");
  console.log(`Total families (2+ variants): ${total}`);
  console.log(`Compiled: ${byStatus.compiled ?? 0}`);
  console.log(`Pending: ${byStatus.pending ?? 0}`);
  console.log("\nBy section:");
  for (const [section, count] of Object.entries(bySection).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${section}: ${count}`);
  }
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
