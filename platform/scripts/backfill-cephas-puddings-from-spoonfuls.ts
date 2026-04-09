import { readFile } from "node:fs/promises";
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
const SOURCE_FILE = "SPOONFULS_BATCH_10_PUDDINGS_001_017_B073.md";

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  }

  const sourcePath = path.resolve(BISHOP_DROPZONE, SOURCE_FILE);
  const markdown = await readFile(sourcePath, "utf8");

  const existingNumbers = await fetchExistingNumbers(supabaseUrl, publishableKey);
  const rows = parsePuddings(markdown)
    .filter((row) => !existingNumbers.has(row.pudding_number));

  if (rows.length === 0) {
    console.log("No missing pudding rows found from spoonful source.");
    return;
  }

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
    throw new Error(`Spoonful backfill failed: ${response.status} ${raw}`);
  }

  const saved = JSON.parse(raw) as Array<{ pudding_number: number }>;
  const min = Math.min(...saved.map((row) => row.pudding_number));
  const max = Math.max(...saved.map((row) => row.pudding_number));
  console.log(`Inserted ${saved.length} pudding rows from spoonful source (${min}-${max}).`);
}

async function fetchExistingNumbers(supabaseUrl: string, publishableKey: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number&limit=5000`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Could not query existing pudding numbers: ${response.status} ${await response.text()}`);
  }
  const rows = await response.json() as Array<{ pudding_number: number }>;
  return new Set(rows.map((row) => row.pudding_number));
}

function parsePuddings(markdown: string): PuddingRow[] {
  const session = markdown.match(/Session\s+(B\d{3})/i)?.[1]?.toUpperCase() ?? "B073";
  const sections = [...markdown.matchAll(/^##\s+PUDDING_(\d{2})\s+[—-]\s+(.+)$/gim)];
  const rows: PuddingRow[] = [];

  for (let i = 0; i < sections.length; i += 1) {
    const current = sections[i];
    const next = sections[i + 1];
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? markdown.length;
    const body = markdown.slice(start, end);

    const puddingNumber = Number(current[1]);
    const title = (current[2] ?? "").trim();
    if (!Number.isInteger(puddingNumber) || puddingNumber <= 0 || !title) continue;

    const primarySpice = body.match(/\*\*Spice:\s*([A-Za-z]+)/i)?.[1]?.toLowerCase() ?? "salt";
    const firstSpoonful = body.match(/\*\*S-\d{2}-\d{3}\*\*:\s*(.+)$/m)?.[1]?.trim() ?? "";
    const sourceRef = body.match(/→\s*Links to:\s*(.+)$/m)?.[1]?.trim() ?? null;

    rows.push({
      pudding_number: puddingNumber,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      source_paper: `${SOURCE_FILE} (Spoonfuls source)`,
      source_paper_word_count: null,
      pudding_text: firstSpoonful || `Spoonful-derived summary for ${title}.`,
      not_pudding_summary: sourceRef,
      primary_spice: primarySpice,
      secondary_spices: [],
      innovations_referenced: [],
      bishop_session: session,
      status: "draft",
    });
  }

  return rows;
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

