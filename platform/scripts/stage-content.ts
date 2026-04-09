import { readFile } from "node:fs/promises";
import path from "node:path";

type Channel = "bst" | "spoonfuls";

type StageEpisode = {
  sequence_number: number;
  content: string;
  source_reference: string;
  tags: string[];
  platform: string;
  channel: Channel;
  primary_spice?: string | null;
  secondary_spices?: string[] | null;
};

type ChapterConfig = {
  chapter_number: number;
  title: string;
  source_document: string;
  source_reference?: string;
  tags?: string[];
  platform: string;
  channel: Channel;
  expected_count: number;
  default_primary_spice?: string | null;
  default_secondary_spices?: string[] | null;
};

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const BISHOP_DROPZONE = path.resolve(PROJECT_ROOT, "..", "BISHOP_DROPZONE");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");

const SPICES = new Set([
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
const SPOONFUL_PRIMARY_SPICE_FALLBACKS: Record<string, string> = {
  "SPOONFULS_BATCH_03_PUDDINGS_047_056_B072.md#47": "oregano",
};

const BST_CHAPTERS: ChapterConfig[] = [
  {
    chapter_number: 1,
    title: "StarScreaming: Building in Public",
    source_document: "CREWMAN6_CHAPTER_01_STARSCREAMING_EPISODES_B071.md",
    source_reference: "StarScreaming paper",
    tags: ["starscreaming", "building-in-public"],
    platform: "twitter",
    channel: "bst",
    expected_count: 52,
  },
  {
    chapter_number: 2,
    title: "Blizzard: The Avalanche of Ideas",
    source_document: "CREWMAN6_CHAPTER_02_BLIZZARD_EPISODES_B071.md",
    source_reference: "100 innovations in 100 days",
    tags: ["blizzard", "avalanche-of-ideas"],
    platform: "twitter",
    channel: "bst",
    expected_count: 42,
  },
  {
    chapter_number: 3,
    title: "Genesis: Where It All Began",
    source_document: "CREWMAN6_CHAPTER_03_GENESIS_EPISODES_B072.md",
    source_reference: "Genesis compilation paper",
    tags: ["genesis", "origin-story"],
    platform: "twitter",
    channel: "bst",
    expected_count: 48,
  },
  {
    chapter_number: 4,
    title: "The Cake: How AI Actually Works",
    source_document: "CREWMAN6_CHAPTER_04_AI_CAKE_EPISODES_B073.md",
    source_reference: "AI Cake V2 paper",
    tags: ["ai-cake", "how-ai-works"],
    platform: "twitter",
    channel: "bst",
    expected_count: 52,
  },
  {
    chapter_number: 8,
    title: "The Invisible Temperament",
    source_document: "CREWMAN6_CHAPTER_08_INVISIBLE_TEMPERAMENT_EPISODES_B075.md",
    source_reference: "The Invisible Temperament paper",
    tags: ["invisible-temperament", "onboarding-personalization"],
    platform: "twitter",
    channel: "bst",
    expected_count: 48,
    default_primary_spice: "cinnamon",
    default_secondary_spices: ["basil", "pepper"],
  },
  {
    chapter_number: 9,
    title: "Self-Funding Economics",
    source_document: "CREWMAN6_CHAPTER_09_SELF_FUNDING_ECONOMICS_EPISODES_B075.md",
    source_reference: "Self-Funding Economics paper",
    tags: ["self-funding", "cost-plus-20", "dna-lock"],
    platform: "twitter",
    channel: "bst",
    expected_count: 52,
    default_primary_spice: "garlic",
    default_secondary_spices: ["pepper", "salt"],
  },
  {
    chapter_number: 10,
    title: "The Portable Reputation",
    source_document: "CREWMAN6_CHAPTER_10_PORTABLE_REPUTATION_EPISODES_B075.md",
    source_reference: "The Portable Reputation paper",
    tags: ["portable-reputation", "influence-portfolio", "shadow-marks"],
    platform: "twitter",
    channel: "bst",
    expected_count: 48,
    default_primary_spice: "ginger",
    default_secondary_spices: ["oregano", "cinnamon"],
  },
  {
    chapter_number: 11,
    title: "Contingency Operators",
    source_document: "CREWMAN6_CHAPTER_11_CONTINGENCY_OPERATORS_EPISODES_B075.md",
    source_reference: "Contingency Operators paper",
    tags: ["contingency-operators", "financial-literacy", "what-if-sandbox"],
    platform: "twitter",
    channel: "bst",
    expected_count: 48,
    default_primary_spice: "garlic",
    default_secondary_spices: ["basil", "pepper"],
  },
  {
    chapter_number: 7,
    title: "The Lighthouse Ladder",
    source_document: "CREWMAN6_CHAPTER_07_LIGHTHOUSE_LADDER_EPISODES_B075.md",
    source_reference: "The Lighthouse Ladder paper",
    tags: ["lighthouse-ladder", "mentorship-architecture"],
    platform: "twitter",
    channel: "bst",
    expected_count: 52,
    default_primary_spice: "basil",
    default_secondary_spices: ["oregano", "paprika"],
  },
];

const SPOONFUL_CHAPTERS: ChapterConfig[] = [
  {
    chapter_number: 101,
    title: "Spoonfuls: The Century (Puddings #95-#100)",
    source_document: "SPOONFULS_BATCH_01_PUDDINGS_095_100_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 38,
  },
  {
    chapter_number: 102,
    title: "Spoonfuls: Beyond 100 (Puddings #101-#104)",
    source_document: "SPOONFULS_BATCH_02_PUDDINGS_101_104_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 28,
  },
  {
    chapter_number: 103,
    title: "Spoonfuls: The Middle (Puddings #47-#56)",
    source_document: "SPOONFULS_BATCH_03_PUDDINGS_047_056_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 60,
  },
  {
    chapter_number: 104,
    title: "Spoonfuls: Momentum (Puddings #57-#67)",
    source_document: "SPOONFULS_BATCH_04_PUDDINGS_057_067_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 66,
  },
  {
    chapter_number: 105,
    title: "Spoonfuls: The Climb (Puddings #68-#76)",
    source_document: "SPOONFULS_BATCH_05_PUDDINGS_068_076_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 54,
  },
  {
    chapter_number: 106,
    title: "Spoonfuls: The Ridge (Puddings #77-#88)",
    source_document: "SPOONFULS_BATCH_06_PUDDINGS_077_088_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 72,
  },
  {
    chapter_number: 107,
    title: "Spoonfuls: The Peak (Puddings #89-#94)",
    source_document: "SPOONFULS_BATCH_07_PUDDINGS_089_094_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 36,
  },
  {
    chapter_number: 108,
    title: "Spoonfuls: Foundation (Puddings #23-#34)",
    source_document: "SPOONFULS_BATCH_08_PUDDINGS_023_034_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 66,
  },
  {
    chapter_number: 109,
    title: "Spoonfuls: Deep Roots (Puddings #35-#46)",
    source_document: "SPOONFULS_BATCH_09_PUDDINGS_035_046_B072.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 72,
  },
  {
    chapter_number: 110,
    title: "Spoonfuls: Origins (Puddings #1-#17)",
    source_document: "SPOONFULS_BATCH_10_PUDDINGS_001_017_B073.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 42,
  },
  {
    chapter_number: 111,
    title: "Spoonfuls: Compiled (Puddings #18-#22)",
    source_document: "SPOONFULS_BATCH_11_PUDDINGS_018_022_B073.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 16,
  },
  {
    chapter_number: 113,
    title: "Spoonfuls: Lighthouse Ladder (Pudding #109)",
    source_document: "SPOONFULS_BATCH_13_PUDDING_109_B075.md",
    platform: "linkedin",
    channel: "spoonfuls",
    expected_count: 8,
  },
  {
    chapter_number: 114,
    title: "Spoonfuls Batch 14 — Pudding 110",
    source_document: "SPOONFULS_BATCH_14_PUDDING_110_B075.md",
    source_reference: "Pudding #110 The Invisible Temperament",
    tags: ["spoonfuls", "pudding-110"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 7,
  },
  {
    chapter_number: 115,
    title: "Spoonfuls Batch 15 — Pudding 111",
    source_document: "SPOONFULS_BATCH_15_PUDDING_111_B075.md",
    source_reference: "Pudding #111 Self-Funding Economics",
    tags: ["spoonfuls", "pudding-111"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 7,
  },
  {
    chapter_number: 116,
    title: "Spoonfuls Batch 16 — Pudding 112",
    source_document: "SPOONFULS_BATCH_16_PUDDING_112_B075.md",
    source_reference: "Pudding #112 The Portable Reputation",
    tags: ["spoonfuls", "pudding-112"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 7,
  },
  {
    chapter_number: 117,
    title: "Spoonfuls Batch 17 — Pudding 114",
    source_document: "SPOONFULS_BATCH_17_PUDDING_114_B075.md",
    source_reference: "Pudding #114 Play With These Numbers",
    tags: ["spoonfuls", "pudding-114"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 7,
  },
  {
    chapter_number: 118,
    title: "Spoonfuls Batch 18 — Pudding 115",
    source_document: "SPOONFULS_BATCH_18_PUDDING_115_B075.md",
    source_reference: "Pudding #115 What the Attic Knows",
    tags: ["spoonfuls", "pudding-115"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 7,
  },
  {
    chapter_number: 119,
    title: "Spoonfuls Batch 19 — Puddings 116-119",
    source_document: "SPOONFULS_BATCH_19_PUDDINGS_116_119_B075.md",
    source_reference: "Puddings #116-119 (4 Puddings batched)",
    tags: ["spoonfuls", "pudding-116", "pudding-117", "pudding-118", "pudding-119"],
    platform: "twitter",
    channel: "spoonfuls",
    expected_count: 15,
  },
];
const TARGET_CHAPTER_OVERRIDE = parseTargetChapterOverride(process.env.STAGE_CONTENT_TARGETS ?? null);

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in env.");
  }

  const targetBstChapters = filterTargetChapters(BST_CHAPTERS, TARGET_CHAPTER_OVERRIDE);
  const targetSpoonfulChapters = filterTargetChapters(SPOONFUL_CHAPTERS, TARGET_CHAPTER_OVERRIDE);
  const targetChapterNumbers = [...targetBstChapters, ...targetSpoonfulChapters].map((chapter) => chapter.chapter_number);
  if (targetChapterNumbers.length === 0) {
    throw new Error("No matching chapters found for STAGE_CONTENT_TARGETS.");
  }

  let stagedTotal = 0;
  for (const chapter of targetBstChapters) {
    const content = await readFile(path.resolve(BISHOP_DROPZONE, chapter.source_document), "utf8");
    const episodes = parseBstEpisodes(content, chapter);
    assertCount(chapter.source_document, episodes.length, chapter.expected_count);
    await stageChapter(supabaseUrl, publishableKey, chapter, episodes);
    stagedTotal += episodes.length;
  }

  for (const chapter of targetSpoonfulChapters) {
    const content = await readFile(path.resolve(BISHOP_DROPZONE, chapter.source_document), "utf8");
    const episodes = parseSpoonfulEpisodes(content, chapter);
    assertCount(chapter.source_document, episodes.length, chapter.expected_count);
    await stageChapter(supabaseUrl, publishableKey, chapter, episodes);
    stagedTotal += episodes.length;
  }

  console.log(`\nStaging complete. Total episodes submitted: ${stagedTotal}`);
  const verification = await verifyCounts(supabaseUrl, publishableKey, targetChapterNumbers);
  console.log("\nVerification:");
  console.log(JSON.stringify(verification, null, 2));
}

function parseBstEpisodes(markdown: string, chapter: ChapterConfig): StageEpisode[] {
  const matches = [...markdown.matchAll(/^### EP-(?:\d+-)?(\d+)\s*$/gm)];
  const episodes: StageEpisode[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const bodyStart = (current.index ?? 0) + current[0].length;
    const bodyEnd = next ? next.index ?? markdown.length : markdown.length;
    const content = markdown.slice(bodyStart, bodyEnd).trim();
    if (!content) continue;

    episodes.push({
      sequence_number: Number(current[1]),
      content,
      source_reference: chapter.source_reference ?? chapter.title,
      tags: chapter.tags ?? [],
      platform: chapter.platform,
      channel: chapter.channel,
      primary_spice: chapter.default_primary_spice ?? null,
      secondary_spices: chapter.default_secondary_spices ?? [],
    });
  }
  return episodes.sort((a, b) => a.sequence_number - b.sequence_number);
}

function parseSpoonfulEpisodes(markdown: string, chapter: ChapterConfig): StageEpisode[] {
  if (markdown.includes("### SP-")) {
    return parseLegacySpoonfulEpisodes(markdown, chapter);
  }
  return parseModernSpoonfulEpisodes(markdown, chapter);
}

function parseLegacySpoonfulEpisodes(markdown: string, chapter: ChapterConfig): StageEpisode[] {
  const puddingMatches = [...markdown.matchAll(/^# PUDDING #?(\d+)\s+[—-]\s+(.+)$/gm)];
  const episodes: StageEpisode[] = [];
  let sequence = 1;

  for (let i = 0; i < puddingMatches.length; i += 1) {
    const match = puddingMatches[i];
    const next = puddingMatches[i + 1];
    const sectionStart = (match.index ?? 0) + match[0].length;
    const sectionEnd = next ? next.index ?? markdown.length : markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);
    const puddingNumber = String(Number(match[1]));
    const puddingTitle = match[2].trim();
    const primarySpice = extractPrimarySpice(section);

    const episodeHeaders = [...section.matchAll(/^### SP-(\d+)-(\d+)(?:\s+\[([A-Z]+)\])?\s*$/gm)];
    for (let epIndex = 0; epIndex < episodeHeaders.length; epIndex += 1) {
      const ep = episodeHeaders[epIndex];
      const nextEp = episodeHeaders[epIndex + 1];
      const bodyStart = (ep.index ?? 0) + ep[0].length;
      const bodyEnd = nextEp ? nextEp.index ?? section.length : section.length;
      const content = section.slice(bodyStart, bodyEnd).trim();
      if (!content) continue;
      const headerSpice = ep[3]?.toLowerCase() ?? null;
      const fallbackPrimarySpice = SPOONFUL_PRIMARY_SPICE_FALLBACKS[`${chapter.source_document}#${puddingNumber}`] ?? null;
      const resolvedPrimarySpice = primarySpice ?? headerSpice ?? fallbackPrimarySpice;
      episodes.push({
        sequence_number: sequence,
        content,
        source_reference: `Pudding #${puddingNumber}: ${puddingTitle}`,
        tags: [`pudding-${puddingNumber}`, "spoonful"],
        platform: chapter.platform,
        channel: chapter.channel,
        primary_spice: resolvedPrimarySpice,
        secondary_spices: extractSecondarySpices(content, resolvedPrimarySpice),
      });
      sequence += 1;
    }
  }

  return episodes;
}

function parseModernSpoonfulEpisodes(markdown: string, chapter: ChapterConfig): StageEpisode[] {
  const puddingMatches = [...markdown.matchAll(/^## PUDDING_(\d+)\s+[—-]\s+(.+)$/gm)];
  const episodes: StageEpisode[] = [];
  let sequence = 1;

  for (let i = 0; i < puddingMatches.length; i += 1) {
    const match = puddingMatches[i];
    const next = puddingMatches[i + 1];
    const sectionStart = (match.index ?? 0) + match[0].length;
    const sectionEnd = next ? next.index ?? markdown.length : markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);
    const puddingNumber = String(Number(match[1]));
    const puddingTitle = match[2].trim();
    const primarySpice = extractPrimarySpice(section);

    const entries = [...section.matchAll(/^\*\*S-\d{2,3}-\d{3}\*\*:\s*(.+)\n(?:→ Links to:\s*(.+))?/gm)];
    for (const entry of entries) {
      const rawContent = (entry[1] ?? "").trim();
      const taggedSpices = extractTaggedSpices(rawContent);
      const primaryFromTag = taggedSpices[0] ?? null;
      const content = stripHashtagSuffix(rawContent);
      if (!content) continue;
      const sourceReference = (entry[2] ?? "").trim() || `Pudding #${puddingNumber}: ${puddingTitle}`;
      const resolvedPrimarySpice = primaryFromTag ?? primarySpice;
      const resolvedSecondarySpices = taggedSpices.slice(1).filter((spice) => spice !== resolvedPrimarySpice);
      episodes.push({
        sequence_number: sequence,
        content,
        source_reference: sourceReference,
        tags: [`pudding-${puddingNumber}`, "spoonful"],
        platform: chapter.platform,
        channel: chapter.channel,
        primary_spice: resolvedPrimarySpice,
        secondary_spices: resolvedSecondarySpices.length > 0
          ? resolvedSecondarySpices
          : extractSecondarySpices(rawContent, resolvedPrimarySpice),
      });
      sequence += 1;
    }
  }

  return episodes;
}

function extractPrimarySpice(section: string): string | null {
  const spiceMatch = section.match(/\*\*Spice:\s*([^*]+)\*\*/i) ?? section.match(/Spice:\s*([A-Za-z]+)/i);
  if (!spiceMatch) return null;
  return spiceMatch[1].split(/[\/,]/)[0].trim().toLowerCase();
}

function extractSecondarySpices(content: string, primarySpice: string | null): string[] {
  const hashtagMatches = [...content.matchAll(/#([A-Za-z]+)/g)];
  const spices = new Set<string>();
  for (const match of hashtagMatches) {
    const spice = match[1].toLowerCase();
    if (!SPICES.has(spice)) continue;
    if (primarySpice && spice === primarySpice.toLowerCase()) continue;
    spices.add(spice);
  }
  return [...spices];
}

function extractTaggedSpices(content: string): string[] {
  const hashtagMatches = [...content.matchAll(/#([A-Za-z]+)/g)];
  const orderedSpices: string[] = [];
  for (const match of hashtagMatches) {
    const tag = match[1].toLowerCase();
    if (!SPICES.has(tag)) continue;
    if (!orderedSpices.includes(tag)) orderedSpices.push(tag);
  }
  return orderedSpices;
}

function stripHashtagSuffix(content: string): string {
  const hashIndex = content.indexOf("#");
  if (hashIndex === -1) return content.trim();
  return content.slice(0, hashIndex).trim();
}

function parseTargetChapterOverride(raw: string | null): Set<number> | null {
  if (!raw || !raw.trim()) return null;
  const numbers = raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
  return new Set(numbers);
}

function filterTargetChapters(chapters: ChapterConfig[], override: Set<number> | null): ChapterConfig[] {
  if (!override) return chapters;
  return chapters.filter((chapter) => override.has(chapter.chapter_number));
}

async function stageChapter(
  supabaseUrl: string,
  publishableKey: string,
  chapter: ChapterConfig,
  episodes: StageEpisode[],
) {
  const payload = {
    chapter_number: chapter.chapter_number,
    title: chapter.title,
    source_document: chapter.source_document,
    vote_threshold: 100,
    episodes,
  };

  const response = await fetch(`${supabaseUrl}/functions/v1/stage-crewman-chapter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Failed staging chapter ${chapter.chapter_number}: ${response.status} ${raw}`);
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  console.log(
    `Staged chapter ${chapter.chapter_number} (${chapter.channel}) -> ${String(parsed.episode_count ?? episodes.length)} episodes`,
  );
}

async function verifyCounts(supabaseUrl: string, publishableKey: string, targetChapterNumbers: number[]) {
  let chapterIds: string[] = [];
  let chapterNumberById = new Map<string, number>();

  const chapterUrl = new URL(`${supabaseUrl}/rest/v1/crewman_chapters`);
  chapterUrl.searchParams.set("select", "id,chapter_number,title");
  chapterUrl.searchParams.set("chapter_number", `in.(${targetChapterNumbers.join(",")})`);
  chapterUrl.searchParams.set("limit", "50");

  const chapterResponse = await fetch(chapterUrl.toString(), {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });
  const chapterRaw = await chapterResponse.text();
  if (chapterResponse.ok) {
    const chapters = JSON.parse(chapterRaw) as Array<{ id: string; chapter_number: number; title: string }>;
    chapterIds = chapters.map((chapter) => chapter.id);
    chapterNumberById = new Map(chapters.map((chapter) => [chapter.id, chapter.chapter_number]));
  }

  const episodeUrl = new URL(`${supabaseUrl}/rest/v1/crewman_episodes`);
  episodeUrl.searchParams.set("select", "channel,primary_spice,chapter_id");
  if (chapterIds.length > 0) {
    episodeUrl.searchParams.set("chapter_id", `in.(${chapterIds.join(",")})`);
  } else {
    episodeUrl.searchParams.set("channel", "in.(bst,spoonfuls)");
  }
  episodeUrl.searchParams.set("limit", "2000");

  const episodeResponse = await fetch(episodeUrl.toString(), {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });
  const episodeRaw = await episodeResponse.text();
  if (!episodeResponse.ok) {
    return { verification_error: `Could not query crewman_episodes: ${episodeResponse.status} ${episodeRaw}` };
  }

  const rows = JSON.parse(episodeRaw) as Array<{ channel: string | null; primary_spice: string | null; chapter_id: string }>;
  const byChannel = new Map<string, number>();
  const spoonfulPrimarySpiceCounts = new Map<string, number>();
  const byChapterNumber = new Map<number, number>();

  for (const row of rows) {
    const channel = (row.channel ?? "unknown").toLowerCase();
    byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);
    const chapterNumber = chapterNumberById.get(row.chapter_id);
    if (chapterNumber !== undefined) {
      byChapterNumber.set(chapterNumber, (byChapterNumber.get(chapterNumber) ?? 0) + 1);
    }
    if (channel === "spoonfuls" && row.primary_spice) {
      const spice = row.primary_spice.toLowerCase();
      spoonfulPrimarySpiceCounts.set(spice, (spoonfulPrimarySpiceCounts.get(spice) ?? 0) + 1);
    }
  }

  const global = await verifyGlobalCounts(supabaseUrl, publishableKey);

  return {
    total: rows.length,
    scope: chapterIds.length > 0 ? "target_chapters" : "all_visible_bst_and_spoonfuls",
    by_channel: Object.fromEntries([...byChannel.entries()].sort()),
    by_chapter_number: Object.fromEntries([...byChapterNumber.entries()].sort((a, b) => a[0] - b[0])),
    spoonful_primary_spice_counts: Object.fromEntries([...spoonfulPrimarySpiceCounts.entries()].sort()),
    global,
  };
}

async function verifyGlobalCounts(supabaseUrl: string, publishableKey: string) {
  const chapterNumberById = await fetchAllChapterNumbers(supabaseUrl, publishableKey);

  const episodeUrl = new URL(`${supabaseUrl}/rest/v1/crewman_episodes`);
  episodeUrl.searchParams.set("select", "channel,primary_spice,chapter_id,source_reference");
  episodeUrl.searchParams.set("channel", "in.(bst,spoonfuls)");
  episodeUrl.searchParams.set("limit", "5000");

  const episodeResponse = await fetch(episodeUrl.toString(), {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });
  const episodeRaw = await episodeResponse.text();
  if (!episodeResponse.ok) {
    return { verification_error: `Could not query global crewman_episodes: ${episodeResponse.status} ${episodeRaw}` };
  }

  const rows = JSON.parse(episodeRaw) as Array<{
    channel: string | null;
    primary_spice: string | null;
    chapter_id: string;
    source_reference: string | null;
  }>;

  const byChannel = new Map<string, number>();
  let chapter7Count = 0;
  let pudding109Count = 0;
  let primarySpiceCount = 0;

  for (const row of rows) {
    const channel = (row.channel ?? "unknown").toLowerCase();
    byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);
    if (row.primary_spice) primarySpiceCount += 1;

    const chapterNumber = chapterNumberById.get(row.chapter_id);
    if (channel === "bst" && chapterNumber === 7) chapter7Count += 1;
    if (channel === "spoonfuls" && (row.source_reference ?? "").toLowerCase().includes("pudding #109")) pudding109Count += 1;
  }

  return {
    total: rows.length,
    by_channel: Object.fromEntries([...byChannel.entries()].sort()),
    chapter_7_count: chapter7Count,
    pudding_109_count: pudding109Count,
    primary_spice_non_null_count: primarySpiceCount,
  };
}

async function fetchAllChapterNumbers(supabaseUrl: string, publishableKey: string) {
  const chapterUrl = new URL(`${supabaseUrl}/rest/v1/crewman_chapters`);
  chapterUrl.searchParams.set("select", "id,chapter_number");
  chapterUrl.searchParams.set("limit", "500");

  const chapterResponse = await fetch(chapterUrl.toString(), {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  });
  const chapterRaw = await chapterResponse.text();
  if (!chapterResponse.ok) return new Map<string, number>();
  const chapters = JSON.parse(chapterRaw) as Array<{ id: string; chapter_number: number }>;
  return new Map(chapters.map((chapter) => [chapter.id, chapter.chapter_number]));
}

function assertCount(source: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(`${source}: expected ${expected} episodes, parsed ${actual}`);
  }
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
