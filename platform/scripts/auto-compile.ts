import { readFile } from "node:fs/promises";
import path from "node:path";

type EnvMap = Record<string, string>;

type CompilationState = "pending" | "in_progress" | "compiled" | "skipped" | "needs_review";

interface CompilationStatusRow {
  family_name: string;
  section: string | null;
  variant_count: number;
  status: CompilationState;
}

interface ArchiveEntry {
  filename?: string;
  slug?: string;
  title?: string;
  section?: string;
  category?: string;
  section_librarian?: number;
  content_chars?: number;
  archive_file?: string;
  path?: string;
  read_at?: string;
}

interface ArchiveIndex {
  entries?: ArchiveEntry[];
}

interface ArchiveRecord {
  content_markdown?: string;
}

interface VariantRecord {
  filename: string;
  archive_file: string;
  path: string | null;
  title: string | null;
  section: string | null;
  category: string | null;
  section_librarian: number | null;
  read_at: string | null;
  content_markdown: string;
}

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PROJECT_ROOT, "..");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");
const STITCHPUNKS_DATA_DIR = path.resolve(REPO_ROOT, "librarian-mcp", "stitchpunks", "data");
const ARCHIVE_DIR = path.resolve(STITCHPUNKS_DATA_DIR, "content_archive");

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

  const familyFilter = parseFamilyFilter(process.argv);
  const index = await loadArchiveIndex();
  const familyEntries = buildFamilyEntries(index.entries ?? []);
  const pendingFamilies = await fetchPendingFamilies(supabaseUrl, supabaseKey, familyFilter);

  let autoCompiledCount = 0;
  let needsReviewCount = 0;
  let skippedCount = 0;
  const bySection: Record<string, { autoCompiled: number; needsReview: number; skipped: number }> = {};

  for (const row of pendingFamilies) {
    const familyName = normalizeFamilyName(row.family_name);
    const section = row.section ?? "misc";
    bySection[section] ??= { autoCompiled: 0, needsReview: 0, skipped: 0 };

    try {
      const variants = await resolveVariants(familyEntries.get(familyName) ?? []);
      if (variants.length === 0) {
        await updateStatus(supabaseUrl, supabaseKey, familyName, {
          status: "needs_review",
          notes: "No variant content found in archive; manual review required.",
          assigned_to: "bishop",
        });
        needsReviewCount += 1;
        bySection[section].needsReview += 1;
        continue;
      }

      if (isPatentBag(section, familyName)) {
        await updateStatus(supabaseUrl, supabaseKey, familyName, {
          status: "needs_review",
          notes: "Patent bag family flagged for Bishop-only IP-sensitive compilation.",
          assigned_to: "bishop",
        });
        needsReviewCount += 1;
        bySection[section].needsReview += 1;
        continue;
      }

      const deduped = dedupeByContent(variants);
      if (deduped.length === 1 && variants.length === 1) {
        await updateStatus(supabaseUrl, supabaseKey, familyName, {
          status: "skipped",
          notes: "Single-version family; no compilation required.",
          assigned_to: "auto",
        });
        skippedCount += 1;
        bySection[section].skipped += 1;
        continue;
      }

      if (deduped.length === 1) {
        const winner = chooseNewest(deduped);
        const docId = await submitCompiledDocument(supabaseUrl, supabaseKey, familyName, variants, winner, "duplicates");
        await updateStatus(supabaseUrl, supabaseKey, familyName, {
          status: "compiled",
          notes: `Auto-compiled: all variants were identical. Winner: ${winner.filename}`,
          assigned_to: "auto",
          compiled_document_id: docId,
        });
        autoCompiledCount += 1;
        bySection[section].autoCompiled += 1;
        continue;
      }

      const superset = pickSupersetVariant(deduped);
      if (superset) {
        const docId = await submitCompiledDocument(supabaseUrl, supabaseKey, familyName, variants, superset, "superset");
        await updateStatus(supabaseUrl, supabaseKey, familyName, {
          status: "compiled",
          notes: `Auto-compiled: ${superset.filename} is a content superset of other variants.`,
          assigned_to: "auto",
          compiled_document_id: docId,
        });
        autoCompiledCount += 1;
        bySection[section].autoCompiled += 1;
        continue;
      }

      await updateStatus(supabaseUrl, supabaseKey, familyName, {
        status: "needs_review",
        notes: "Substantive variant differences detected; human review required.",
        assigned_to: "bishop",
      });
      needsReviewCount += 1;
      bySection[section].needsReview += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await updateStatus(supabaseUrl, supabaseKey, familyName, {
        status: "needs_review",
        notes: `Auto-compile error: ${message.slice(0, 500)}`,
        assigned_to: "bishop",
      });
      needsReviewCount += 1;
      bySection[section].needsReview += 1;
      console.warn(`WARN ${familyName}: ${message}`);
    }
  }

  console.log("\nAuto-Compile Results");
  console.log(`Families processed: ${pendingFamilies.length}`);
  console.log(`Auto-compiled: ${autoCompiledCount}`);
  console.log(`Needs review: ${needsReviewCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log("\nBy section:");
  for (const [section, stats] of Object.entries(bySection).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(
      `  ${section} -> auto:${stats.autoCompiled} | review:${stats.needsReview} | skipped:${stats.skipped}`,
    );
  }
}

function parseFamilyFilter(argv: string[]): string[] {
  const token = argv.find((arg) => arg.startsWith("--families="));
  if (!token) return [];
  return token
    .slice("--families=".length)
    .split(",")
    .map((value) => normalizeFamilyName(value))
    .filter(Boolean);
}

function normalizeFamilyName(filename: string, slug = ""): string {
  let name = (filename || "").trim().toLowerCase();
  if (name.includes(".")) name = name.slice(0, name.lastIndexOf("."));
  name = name.replace(/\s*\(copy\)$/g, "");
  name = name.replace(/[-_ ](?:copy|final|draft|revised|rev\d+)$/g, "");
  name = name.replace(/[-_ ]v\d+$/g, "");
  name = name.replace(/[-_ ]\d{8,14}$/g, "");
  name = name.replace(/[-_ ]\d+$/g, "");
  name = name.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return name || slug || "unknown-family";
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
    `Could not load archive report. Expected one of: ${REPORT_CANDIDATES.map((p) => path.basename(p)).join(", ")}`,
  );
}

function buildFamilyEntries(entries: ArchiveEntry[]) {
  const map = new Map<string, ArchiveEntry[]>();
  for (const entry of entries) {
    const familyName = normalizeFamilyName(entry.filename ?? "", entry.slug ?? "");
    const bucket = map.get(familyName) ?? [];
    bucket.push(entry);
    map.set(familyName, bucket);
  }
  return map;
}

async function resolveVariants(entries: ArchiveEntry[]): Promise<VariantRecord[]> {
  const variants: VariantRecord[] = [];
  for (const entry of entries) {
    if (!entry.archive_file) continue;
    const archivePath = path.resolve(ARCHIVE_DIR, entry.archive_file);
    let contentMarkdown = "";
    try {
      const raw = await readFile(archivePath, "utf8");
      const parsed = JSON.parse(raw) as ArchiveRecord;
      contentMarkdown = parsed.content_markdown ?? "";
    } catch {
      contentMarkdown = "";
    }
    if (!contentMarkdown.trim()) continue;
    variants.push({
      filename: entry.filename ?? "unknown",
      archive_file: entry.archive_file,
      path: entry.path ?? null,
      title: entry.title ?? null,
      section: entry.section ?? null,
      category: entry.category ?? null,
      section_librarian: entry.section_librarian ?? null,
      read_at: entry.read_at ?? null,
      content_markdown: contentMarkdown,
    });
  }
  return variants;
}

function dedupeByContent(variants: VariantRecord[]): VariantRecord[] {
  const byHash = new Map<string, VariantRecord>();
  for (const variant of variants) {
    const key = variant.content_markdown.trim();
    if (!byHash.has(key) || (byHash.get(key)?.content_markdown.length ?? 0) < variant.content_markdown.length) {
      byHash.set(key, variant);
    }
  }
  return [...byHash.values()];
}

function chooseNewest(variants: VariantRecord[]): VariantRecord {
  return [...variants].sort((a, b) => {
    const aDate = a.read_at ? Date.parse(a.read_at) : 0;
    const bDate = b.read_at ? Date.parse(b.read_at) : 0;
    if (bDate !== aDate) return bDate - aDate;
    return b.content_markdown.length - a.content_markdown.length;
  })[0];
}

function pickSupersetVariant(variants: VariantRecord[]): VariantRecord | null {
  const lineSets = variants.map((variant) => ({
    variant,
    lines: new Set(
      variant.content_markdown
        .split(/\r?\n/g)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  }));

  for (const candidate of lineSets) {
    let containsAll = true;
    for (const other of lineSets) {
      if (candidate.variant.archive_file === other.variant.archive_file) continue;
      for (const line of other.lines) {
        if (!candidate.lines.has(line)) {
          containsAll = false;
          break;
        }
      }
      if (!containsAll) break;
    }
    if (containsAll) return candidate.variant;
  }

  return null;
}

function prettifyFamilyName(familyName: string): string {
  return familyName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function isPatentBag(section: string, familyName: string): boolean {
  const value = `${section} ${familyName}`.toLowerCase();
  return value.includes("patent") || value.includes("bag");
}

function buildCompiledMarkdown(
  familyName: string,
  winner: VariantRecord,
  variants: VariantRecord[],
  mode: "duplicates" | "superset",
): string {
  const modeText = mode === "duplicates" ? "all variants were identical" : "one variant contained all others";
  return [
    `# [AUTO-COMPILED] ${winner.title ?? prettifyFamilyName(familyName)}`,
    "",
    `**Family**: ${familyName}`,
    `**Sources**: ${variants.length} variants`,
    `**Compiled by**: KNIGHT auto-compiler`,
    `**Rule**: ${modeText}`,
    "",
    "---",
    "",
    winner.content_markdown.trim(),
    "",
    "---",
    "",
    "## Auto-Compilation Notes",
    `- Winner variant: ${winner.filename}`,
    `- Rule applied: ${mode}`,
    "- Patent Bag families are excluded from auto-compilation.",
    "",
  ].join("\n");
}

async function submitCompiledDocument(
  supabaseUrl: string,
  supabaseKey: string,
  familyName: string,
  allVariants: VariantRecord[],
  winner: VariantRecord,
  mode: "duplicates" | "superset",
): Promise<string | null> {
  const payload = {
    slug: `auto-compiled-${toSlug(familyName)}`,
    title: `[AUTO-COMPILED] ${winner.title ?? prettifyFamilyName(familyName)}`,
    family_name: familyName,
    section: winner.section,
    category: winner.category,
    section_librarian: winner.section_librarian,
    compiled_markdown: buildCompiledMarkdown(familyName, winner, allVariants, mode),
    source_count: allVariants.length,
    source_files: allVariants.map((variant) => ({
      filename: variant.filename,
      path: variant.path,
      content_hash: variant.archive_file.replace(/\.json$/i, ""),
      chars: variant.content_markdown.length,
    })),
    unique_variants: dedupeByContent(allVariants).length,
    compilation_notes: `Auto-compiled by script: ${mode}`,
    compiled_by: "auto",
    founder_corrections_applied: [],
    status: "canonical",
    compiled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const url = new URL(`${supabaseUrl}/rest/v1/compiled_documents`);
  url.searchParams.set("on_conflict", "slug");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([payload]),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`compiled_documents upsert failed (${familyName}): ${response.status} ${raw}`);
  }

  try {
    const parsed = JSON.parse(raw) as Array<{ id?: string | null }>;
    return parsed?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchPendingFamilies(supabaseUrl: string, supabaseKey: string, familyFilter: string[]) {
  const url = new URL(`${supabaseUrl}/rest/v1/compilation_status`);
  url.searchParams.set("select", "family_name,section,variant_count,status");
  url.searchParams.set("status", "eq.pending");
  url.searchParams.set("order", "variant_count.desc,family_name.asc");
  url.searchParams.set("limit", "2000");

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pending families: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as CompilationStatusRow[];
  if (familyFilter.length === 0) return rows;
  const filterSet = new Set(familyFilter);
  return rows.filter((row) => filterSet.has(normalizeFamilyName(row.family_name)));
}

async function updateStatus(
  supabaseUrl: string,
  supabaseKey: string,
  familyName: string,
  patch: {
    status: CompilationState;
    notes?: string | null;
    assigned_to?: string | null;
    compiled_document_id?: string | null;
  },
) {
  const url = new URL(`${supabaseUrl}/rest/v1/compilation_status`);
  url.searchParams.set("family_name", `eq.${familyName}`);

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update compilation_status (${familyName}): ${response.status} ${await response.text()}`);
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
