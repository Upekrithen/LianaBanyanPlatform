import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type Channel = "bst" | "spoonfuls";
type Platform = "twitter" | "linkedin" | "threads" | "bluesky" | "instagram" | "facebook";

type ManualScheduleItem = {
  day: string;
  time: string;
  channel: Channel;
  platforms: Platform[];
  chapter?: number;
  seq?: number;
  spoonful_id?: string;
};

type CrewmanEpisode = {
  id: string;
  chapter_id: string | null;
  sequence_number: number | null;
  channel: Channel | null;
  platform: string | null;
  content: string | null;
  source_reference?: string | null;
};

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.resolve(PROJECT_ROOT, ".env");
const CT_OFFSET = "-05:00";

const manualSchedule: ManualScheduleItem[] = [
  { day: "2026-04-05", time: "10:00", channel: "bst", chapter: 1, seq: 1, platforms: ["twitter", "linkedin", "threads", "bluesky"] },
  { day: "2026-04-06", time: "09:00", channel: "bst", chapter: 1, seq: 2, platforms: ["twitter"] },
  { day: "2026-04-06", time: "10:00", channel: "bst", chapter: 1, seq: 3, platforms: ["twitter"] },
  { day: "2026-04-06", time: "11:00", channel: "bst", chapter: 1, seq: 4, platforms: ["twitter"] },
  { day: "2026-04-06", time: "12:00", channel: "bst", chapter: 1, seq: 5, platforms: ["twitter"] },
  { day: "2026-04-07", time: "09:00", channel: "spoonfuls", spoonful_id: "SP-050-01", platforms: ["linkedin"] },
  { day: "2026-04-07", time: "11:00", channel: "spoonfuls", spoonful_id: "SP-097-01", platforms: ["linkedin"] },
  { day: "2026-04-07", time: "13:00", channel: "spoonfuls", spoonful_id: "SP-066-01", platforms: ["linkedin"] },
  { day: "2026-04-07", time: "15:00", channel: "spoonfuls", spoonful_id: "SP-100-05", platforms: ["linkedin"] },
  { day: "2026-04-07", time: "09:00", channel: "bst", chapter: 1, seq: 6, platforms: ["twitter"] },
  { day: "2026-04-07", time: "10:00", channel: "bst", chapter: 1, seq: 7, platforms: ["twitter"] },
  { day: "2026-04-07", time: "11:00", channel: "bst", chapter: 1, seq: 8, platforms: ["twitter"] },
  { day: "2026-04-07", time: "12:00", channel: "bst", chapter: 1, seq: 9, platforms: ["twitter"] },
];

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing VITE_SUPABASE_URL (or SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY in platform/.env.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const chapterIdByNumber = await getChapterIdMap(supabase);

  console.log("Scheduling Days 1-3 manual placements...");
  for (const item of manualSchedule) {
    const scheduledFor = `${item.day}T${item.time}:00${CT_OFFSET}`;
    const matches = await findEpisodesForManualItem(supabase, item, chapterIdByNumber);
    if (matches.length === 0) {
      console.warn(`No episodes matched for ${item.channel} ${item.spoonful_id ?? `ch${item.chapter}#${item.seq}`}`);
      continue;
    }

    for (const episode of matches) {
      const { error } = await supabase
        .from("crewman_episodes")
        .update({
          scheduled_for: scheduledFor,
          platform: pickPlatform(item.platforms, episode.platform),
        })
        .eq("id", episode.id);
      if (error) throw new Error(`Failed to schedule ${episode.id}: ${error.message}`);
    }

    console.log(`Scheduled ${matches.length} episode(s) for ${scheduledFor} -> ${item.channel}`);
  }

  console.log("\nScheduling Days 4-10 via schedule-distribution-grid...");
  for (let day = 8; day <= 14; day += 1) {
    const date = `2026-04-${String(day).padStart(2, "0")}`;
    const slotsPerDay = day === 12 ? 3 : 6;
    const response = await fetch(`${supabaseUrl}/functions/v1/schedule-distribution-grid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        date,
        channels: ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"],
        slots_per_day: slotsPerDay,
        series_mix: { bst: 1, spoonfuls: 2, skipping_stones: 1 },
      }),
    });
    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`Grid scheduling failed for ${date}: ${response.status} ${raw}`);
    }
    console.log(`Grid scheduled for ${date} (${slotsPerDay} slots/day).`);
  }

  await verifyDayOne(supabase);
}

async function getChapterIdMap(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("crewman_chapters")
    .select("id, chapter_number");
  if (error) throw new Error(`Failed to read chapters: ${error.message}`);
  const chapterIdByNumber = new Map<number, string>();
  for (const row of data ?? []) {
    chapterIdByNumber.set(row.chapter_number as number, row.id as string);
  }
  return chapterIdByNumber;
}

async function findEpisodesForManualItem(
  supabase: ReturnType<typeof createClient>,
  item: ManualScheduleItem,
  chapterIdByNumber: Map<number, string>,
): Promise<CrewmanEpisode[]> {
  if (item.channel === "bst") {
    if (!item.chapter || !item.seq) return [];
    const chapterId = chapterIdByNumber.get(item.chapter);
    if (!chapterId) return [];
    const { data, error } = await supabase
      .from("crewman_episodes")
      .select("id, chapter_id, sequence_number, channel, platform, content, source_reference")
      .eq("chapter_id", chapterId)
      .eq("channel", "bst")
      .eq("sequence_number", item.seq)
      .in("platform", item.platforms);
    if (error) throw new Error(`Failed BST lookup (${item.chapter}:${item.seq}): ${error.message}`);
    return (data ?? []) as CrewmanEpisode[];
  }

  if (!item.spoonful_id) return [];
  const { data, error } = await supabase
    .from("crewman_episodes")
    .select("id, chapter_id, sequence_number, channel, platform, content, source_reference")
    .eq("channel", "spoonfuls")
    .in("platform", item.platforms)
    .or(`content.ilike.%${item.spoonful_id}%,source_reference.ilike.%${item.spoonful_id}%`);
  if (error) throw new Error(`Failed spoonful lookup (${item.spoonful_id}): ${error.message}`);
  return (data ?? []) as CrewmanEpisode[];
}

function pickPlatform(preferred: Platform[], existing: string | null) {
  if (existing && preferred.includes(existing as Platform)) return existing;
  return preferred[0];
}

async function verifyDayOne(supabase: ReturnType<typeof createClient>) {
  const dayStart = "2026-04-05T00:00:00-05:00";
  const dayEnd = "2026-04-06T00:00:00-05:00";
  const { data, error } = await supabase
    .from("crewman_episodes")
    .select("id, channel, platform, scheduled_for, content, status")
    .gte("scheduled_for", dayStart)
    .lt("scheduled_for", dayEnd)
    .order("scheduled_for", { ascending: true });

  if (error) throw new Error(`Day 1 verification failed: ${error.message}`);

  console.log("\nDay 1 verification:");
  console.table((data ?? []).map((row) => ({
    id: row.id,
    channel: row.channel,
    platform: row.platform,
    scheduled_for: row.scheduled_for,
    status: row.status,
    preview: (row.content ?? "").slice(0, 64),
  })));
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
