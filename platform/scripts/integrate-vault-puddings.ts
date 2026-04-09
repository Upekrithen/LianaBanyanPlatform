import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type VaultMapping = {
  source: string;
  preferred_number: number;
  title: string;
  slug: string;
  primary_spice: string;
  secondary: [string, string];
};

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
const REPO_ROOT = path.resolve(PROJECT_ROOT, "..");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");
const SOURCE_DIR = path.resolve(REPO_ROOT, "Asteroid-ProofVault", "02_WRITTEN", "06_Pudding_Articles");
const BISHOP_DROPZONE = path.resolve(REPO_ROOT, "BISHOP_DROPZONE");

const mappings: VaultMapping[] = [
  {
    source: "CEPHAS_PUDDING_BACKER_ELECTION.md",
    preferred_number: 130,
    title: "The Backer Election",
    slug: "the-backer-election",
    primary_spice: "oregano",
    secondary: ["paprika", "pepper"],
  },
  {
    source: "CEPHAS_PUDDING_BATTERY_DISPATCH_UNIVERSAL_REMOTE.md",
    preferred_number: 131,
    title: "Battery Dispatch",
    slug: "battery-dispatch",
    primary_spice: "cumin",
    secondary: ["oregano", "sugar"],
  },
  {
    source: "CEPHAS_PUDDING_CAPTAIN_SYSTEM.md",
    preferred_number: 132,
    title: "The Captain System",
    slug: "the-captain-system",
    primary_spice: "paprika",
    secondary: ["oregano", "basil"],
  },
  {
    source: "CEPHAS_PUDDING_COLD_START_HUB.md",
    preferred_number: 133,
    title: "Cold Start Hub",
    slug: "cold-start-hub",
    primary_spice: "sugar",
    secondary: ["paprika", "oregano"],
  },
  {
    source: "CEPHAS_PUDDING_GHOST_WORLD.md",
    preferred_number: 134,
    title: "Ghost World",
    slug: "ghost-world",
    primary_spice: "cinnamon",
    secondary: ["cumin", "basil"],
  },
  {
    source: "CEPHAS_PUDDING_GUEST_MARKS_WALLET.md",
    preferred_number: 135,
    title: "The Guest Marks Wallet",
    slug: "the-guest-marks-wallet",
    primary_spice: "garlic",
    secondary: ["ginger", "sugar"],
  },
  {
    source: "CEPHAS_PUDDING_LB_CARD.md",
    preferred_number: 136,
    title: "The LB Card",
    slug: "the-lb-card",
    primary_spice: "garlic",
    secondary: ["pepper", "paprika"],
  },
  {
    source: "CEPHAS_PUDDING_MARKS_PAYBACK.md",
    preferred_number: 137,
    title: "Marks Payback",
    slug: "marks-payback",
    primary_spice: "garlic",
    secondary: ["oregano", "paprika"],
  },
  {
    source: "CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md",
    preferred_number: 138,
    title: "MoneyPenny the Receptionist",
    slug: "moneypenny-the-receptionist",
    primary_spice: "oregano",
    secondary: ["cinnamon", "basil"],
  },
  {
    source: "CEPHAS_PUDDING_PATHFINDER_JOURNAL.md",
    preferred_number: 139,
    title: "The Pathfinder Journal",
    slug: "the-pathfinder-journal",
    primary_spice: "basil",
    secondary: ["paprika", "cinnamon"],
  },
  {
    source: "CEPHAS_PUDDING_ROOMMATE_ACCOUNTABILITY.md",
    preferred_number: 140,
    title: "Roommate Accountability",
    slug: "roommate-accountability",
    primary_spice: "pepper",
    secondary: ["oregano", "paprika"],
  },
  {
    source: "CEPHAS_PUDDING_YOURE_IN_CHARGE_OF_YOU.md",
    preferred_number: 141,
    title: "You're in Charge of You",
    slug: "youre-in-charge-of-you",
    primary_spice: "paprika",
    secondary: ["basil", "pepper"],
  },
];

async function main() {
  const env = await loadEnv();
  const supabaseUrl = (env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/+$/, "");
  const publishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing Supabase URL/key in platform/.env");
  }

  const existingRows = await fetchExistingPuddingRows(supabaseUrl, publishableKey);
  const existingNumbers = new Set(existingRows.map((row) => row.pudding_number));
  const existingByNumber = new Map(existingRows.map((row) => [row.pudding_number, row]));
  const plannedAssignments = resolveAssignments(mappings, existingNumbers, existingByNumber);
  const conflictMessages = plannedAssignments
    .filter((item) => item.assigned_number !== item.mapping.preferred_number)
    .map(
      (item) =>
        `${item.mapping.source}: preferred #${item.mapping.preferred_number} unavailable, assigned #${item.assigned_number}`,
    );
  if (conflictMessages.length > 0) {
    console.log("Number conflicts detected; using non-destructive reassignment:");
    for (const line of conflictMessages) console.log(`  - ${line}`);
  }

  const rows: PuddingRow[] = [];
  const plannedContent: Array<{
    mapping: VaultMapping;
    assigned_number: number;
    sourcePath: string;
    narrative: string;
    row: PuddingRow;
  }> = [];
  for (const plan of plannedAssignments) {
    const { mapping, assigned_number } = plan;
    const sourcePath = path.resolve(SOURCE_DIR, mapping.source);
    const sourceMarkdown = await readFile(sourcePath, "utf8");
    const narrative = extractNarrative(sourceMarkdown);
    const innovations = parseInnovations(sourceMarkdown);
    const puddingText = buildPuddingText(narrative);
    const wordCount = countWords(narrative);

    const row: PuddingRow = {
      pudding_number: assigned_number,
      title: mapping.title,
      slug: mapping.slug,
      source_paper: toRepoPath(sourcePath),
      source_paper_word_count: wordCount,
      pudding_text: puddingText,
      not_pudding_summary:
        `Source technical explainer: ${toRepoPath(sourcePath)}. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.`,
      primary_spice: mapping.primary_spice,
      secondary_spices: [...mapping.secondary],
      innovations_referenced: innovations,
      bishop_session: "B075",
      status: "draft",
    };

    rows.push(row);
    plannedContent.push({
      mapping,
      assigned_number,
      sourcePath,
      narrative,
      row,
    });
  }

  await reconcileSlugConflicts(rows, supabaseUrl, publishableKey);

  for (const item of plannedContent) {
    await writeSystemAFile(item.mapping, item.assigned_number, item.sourcePath, item.narrative, item.row);
  }

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/cephas_puddings?on_conflict=pudding_number`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(rows),
  });

  const insertRaw = await insertResponse.text();
  if (!insertResponse.ok) {
    throw new Error(`Insert failed: ${insertResponse.status} ${insertRaw}`);
  }

  const inserted = JSON.parse(insertRaw) as Array<{ pudding_number: number; title: string; primary_spice: string }>;
  console.log(`Upserted ${inserted.length} vault pudding rows.`);

  const insertedNumbers = rows.map((row) => row.pudding_number).sort((a, b) => a - b);
  const rangeRows = await fetchRangeRows(
    supabaseUrl,
    publishableKey,
    insertedNumbers[0],
    insertedNumbers[insertedNumbers.length - 1],
  );
  console.log(
    `Range check ${insertedNumbers[0]}-${insertedNumbers[insertedNumbers.length - 1]}: ${rangeRows.length} rows.`,
  );
  for (const row of rangeRows.sort((a, b) => a.pudding_number - b.pudding_number)) {
    console.log(`  #${row.pudding_number} ${row.title} [${row.primary_spice}]`);
  }

  const maxNumber = await fetchMaxPuddingNumber(supabaseUrl, publishableKey);
  console.log(`MAX pudding_number: ${maxNumber}`);

  const gaps = await findGapsThrough(supabaseUrl, publishableKey, 141);
  console.log(gaps.length === 0 ? "No gaps between 1 and 141." : `Gaps 1-141: ${gaps.join(", ")}`);
}

async function writeSystemAFile(
  mapping: VaultMapping,
  assignedNumber: number,
  sourcePath: string,
  narrative: string,
  row: PuddingRow,
) {
  const outputName = `PUDDING_${String(assignedNumber).padStart(3, "0")}_${mapping.slug.replace(/-/g, "_").toUpperCase()}_B075.md`;
  const outputPath = path.resolve(BISHOP_DROPZONE, outputName);
  const sourceRepoPath = toRepoPath(sourcePath);
  const secondary = mapping.secondary;

  const sqlBlock = [
    "INSERT INTO cephas_puddings (",
    "  pudding_number, title, slug, source_paper, source_paper_word_count,",
    "  pudding_text, not_pudding_summary, primary_spice, secondary_spices,",
    "  innovations_referenced, bishop_session, status",
    ") VALUES (",
    `  ${row.pudding_number},`,
    `  '${escapeSql(row.title)}',`,
    `  '${escapeSql(row.slug)}',`,
    `  '${escapeSql(row.source_paper ?? "")}',`,
    `  ${row.source_paper_word_count ?? "NULL"},`,
    `  '${escapeSql(row.pudding_text)}',`,
    `  '${escapeSql(row.not_pudding_summary ?? "")}',`,
    `  '${escapeSql(row.primary_spice)}',`,
    `  ARRAY['${escapeSql(secondary[0])}','${escapeSql(secondary[1])}']::text[],`,
    `  ARRAY[${row.innovations_referenced.join(", ")}]::int[],`,
    "  'B075',",
    "  'draft'",
    ")",
    "ON CONFLICT (pudding_number) DO UPDATE SET",
    "  title = EXCLUDED.title,",
    "  slug = EXCLUDED.slug,",
    "  source_paper = EXCLUDED.source_paper,",
    "  source_paper_word_count = EXCLUDED.source_paper_word_count,",
    "  pudding_text = EXCLUDED.pudding_text,",
    "  not_pudding_summary = EXCLUDED.not_pudding_summary,",
    "  primary_spice = EXCLUDED.primary_spice,",
    "  secondary_spices = EXCLUDED.secondary_spices,",
    "  innovations_referenced = EXCLUDED.innovations_referenced,",
    "  bishop_session = EXCLUDED.bishop_session,",
    "  status = EXCLUDED.status;",
  ].join("\n");

  const fileContent = [
    `# Pudding #${assignedNumber} — ${mapping.title}`,
    "",
    '**"This is NOT Pudding" — a "Proof is in the Pudding" article**',
    `**Series**: Proof is in the Pudding | **Number**: ${assignedNumber}`,
    "**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)",
    "**Date**: April 4, 2026",
    `**Source**: ${sourceRepoPath}`,
    "",
    "---",
    "",
    "## The Pudding",
    "",
    narrative.trim(),
    "",
    "---",
    "",
    "## This is NOT Pudding",
    "",
    `This entry is integrated from the vault source file \`${sourceRepoPath}\` and normalized into System A structure for sequential indexing and Cephas table continuity.`,
    "The full technical and implementation detail remains in the original vault document and related Cephas publication routes.",
    "",
    "---",
    "",
    "## Depth Layers",
    "",
    "| Layer | Name | What You Get |",
    "|-------|------|-------------|",
    "| 1 | Skipping Stone | This article title + one-sentence hook |",
    "| 2 | The Proof is in the Pudding | You are here — the accessible version |",
    "| 3 | This is NOT Pudding | Full technical documentation + implementation details |",
    "| 4 | Reading Beacon | Schedule your return |",
    "",
    "---",
    "",
    "## Spice Tags",
    "",
    "| Tag | Type |",
    "|-----|------|",
    `| ${mapping.primary_spice} (domain) | Primary |`,
    `| ${secondary[0]} (domain) | Secondary |`,
    `| ${secondary[1]} (domain) | Secondary |`,
    "",
    "---",
    "",
    "## SQL Insert",
    "",
    "```sql",
    sqlBlock,
    "```",
    "",
  ].join("\n");

  await writeFile(outputPath, fileContent, "utf8");
  console.log(`Wrote ${toRepoPath(outputPath)}`);
}

function extractNarrative(markdown: string) {
  const codeFenceMatch = markdown.match(/```markdown\s*([\s\S]*?)```/i);
  let body = codeFenceMatch ? codeFenceMatch[1] : markdown;

  body = body.replace(/\r/g, "");
  body = body.replace(/^---\n[\s\S]*?\n---\n?/m, "");
  body = body.replace(/^\*\*(Style|Category|Innovations|Bishop Session):.*$/gim, "");
  body = body.replace(/^##\s+Bishop Session.*$/gim, "");
  body = body.replace(/^##\s+Route:.*$/gim, "");
  body = body.replace(/^##\s+SEC CLEAN:.*$/gim, "");
  body = body.replace(/^##\s+LANGUAGE CLEAN:.*$/gim, "");
  body = body.replace(/^> \*\*NOTE TO KNIGHT\*\*:.*$/gim, "");
  body = body.replace(/{{<\/?\*[^*]*\*\/>}}/g, "");
  body = body.replace(/\n{3,}/g, "\n\n");
  return body.trim();
}

function parseInnovations(markdown: string) {
  const line = markdown.match(/^\*\*Innovations:\*\*\s*(.+)$/im)?.[1] ?? "";
  const ids = [...line.matchAll(/#(\d+)/g)].map((match) => Number(match[1])).filter((value) => Number.isInteger(value));
  return [...new Set(ids)];
}

function buildPuddingText(narrative: string) {
  const cleaned = narrative
    .replace(/[#*_`>|[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 2400);
}

function countWords(text: string) {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/g).length;
}

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

async function fetchExistingPuddingRows(supabaseUrl: string, key: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number,source_paper,title&limit=5000`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Could not fetch existing pudding rows: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as Array<{ pudding_number: number; source_paper: string | null; title: string | null }>;
}

async function fetchRangeRows(supabaseUrl: string, key: string, start: number, end: number) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number,title,primary_spice&pudding_number=gte.${start}&pudding_number=lte.${end}&order=pudding_number.asc&limit=500`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Range verify failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as Array<{ pudding_number: number; title: string; primary_spice: string }>;
}

async function fetchMaxPuddingNumber(supabaseUrl: string, key: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number&order=pudding_number.desc&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Max query failed: ${response.status} ${await response.text()}`);
  }
  const rows = (await response.json()) as Array<{ pudding_number: number }>;
  return rows[0]?.pudding_number ?? 0;
}

async function findGapsThrough(supabaseUrl: string, key: string, max: number) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number&pudding_number=lte.${max}&order=pudding_number.asc&limit=5000`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Gap query failed: ${response.status} ${await response.text()}`);
  }
  const rows = (await response.json()) as Array<{ pudding_number: number }>;
  const numbers = new Set(rows.map((row) => row.pudding_number));
  const gaps: number[] = [];
  for (let i = 1; i <= max; i += 1) {
    if (!numbers.has(i)) gaps.push(i);
  }
  return gaps;
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

function toRepoPath(fullPath: string) {
  return path.relative(REPO_ROOT, fullPath).replace(/\\/g, "/");
}

async function reconcileSlugConflicts(rows: PuddingRow[], supabaseUrl: string, key: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cephas_puddings?select=pudding_number,slug&limit=5000`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Slug lookup failed: ${response.status} ${await response.text()}`);
  }

  const existing = (await response.json()) as Array<{ pudding_number: number; slug: string }>;
  const slugOwner = new Map(existing.map((row) => [row.slug, row.pudding_number]));
  const localSeen = new Set<string>();

  rows.sort((a, b) => a.pudding_number - b.pudding_number);
  for (const row of rows) {
    const base = row.slug;
    let candidate = base;
    let suffix = 1;

    while (
      (slugOwner.has(candidate) && slugOwner.get(candidate) !== row.pudding_number) ||
      localSeen.has(candidate)
    ) {
      suffix += 1;
      candidate = `${base}-${row.pudding_number}${suffix > 2 ? `-${suffix - 1}` : ""}`;
    }

    if (candidate !== row.slug) {
      console.log(`Slug conflict: "${row.slug}" -> "${candidate}"`);
      row.slug = candidate;
    }

    localSeen.add(candidate);
    slugOwner.set(candidate, row.pudding_number);
  }
}

function resolveAssignments(
  maps: VaultMapping[],
  existingNumbers: Set<number>,
  existingByNumber: Map<number, { pudding_number: number; source_paper: string | null; title: string | null }>,
) {
  const assignments: Array<{ mapping: VaultMapping; assigned_number: number }> = [];
  const reserved = new Set<number>();
  let tailCursor = Math.max(141, ...existingNumbers) + 1;

  for (const mapping of maps) {
    const preferred = mapping.preferred_number;
    const existingAtPreferred = existingByNumber.get(preferred);
    const expectedSource = toRepoPath(path.resolve(SOURCE_DIR, mapping.source));
    const preferredOwnedBySameSource =
      existingAtPreferred?.source_paper?.replace(/\\/g, "/") === expectedSource;

    if ((!existingNumbers.has(preferred) || preferredOwnedBySameSource) && !reserved.has(preferred)) {
      assignments.push({ mapping, assigned_number: preferred });
      reserved.add(preferred);
      continue;
    }

    while (existingNumbers.has(tailCursor) || reserved.has(tailCursor)) {
      tailCursor += 1;
    }
    assignments.push({ mapping, assigned_number: tailCursor });
    reserved.add(tailCursor);
    tailCursor += 1;
  }

  return assignments;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
