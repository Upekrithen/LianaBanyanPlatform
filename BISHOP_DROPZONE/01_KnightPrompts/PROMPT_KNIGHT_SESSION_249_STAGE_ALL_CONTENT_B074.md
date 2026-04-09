# KNIGHT SESSION 249 — Stage All Content into Crewman Episodes
## Dispatched by: Bishop B074
## Date: April 4, 2026
## Priority: CRITICAL — All content produced but zero episodes staged in database

---

## MISSION

Stage all 550 Spoonfuls and 194 BST episodes into the `crewman_episodes` table via the existing `stage-crewman-chapter` edge function. After this session, every piece of distributable content exists in the database ready for scheduling and dispatch.

---

## CONTEXT

### What Exists
- `stage-crewman-chapter` edge function (DEPLOYED): accepts `{ chapter_number, title, source_document, episodes[] }` where each episode has `{ sequence_number, content, source_reference, tags, platform, channel }`
- `crewman_chapters` + `crewman_episodes` tables (DEPLOYED, K240)
- Distribution Grid columns on crewman_episodes: `channel`, `scheduled_for`, `content_type`, `cross_ref_post_id`, `cross_ref_text` (K245)
- Spice columns: `primary_spice`, `secondary_spices` on crewman_episodes (K246)

### Content Files (ALL in BISHOP_DROPZONE)
**BST Episodes (194 total, 4 chapters):**
- `CREWMAN6_BST_CHAPTER_01_STARSCREAMING_EPISODES_B070.md` — 52 episodes
- `CREWMAN6_BST_CHAPTER_02_BLIZZARD_EPISODES_B070.md` — 42 episodes
- `CREWMAN6_BST_CHAPTER_03_GENESIS_EPISODES_B072.md` — 48 episodes
- `CREWMAN6_CHAPTER_04_AI_CAKE_EPISODES_B073.md` — 52 episodes

**Spoonfuls (550 total, 11 batches):**
- `SPOONFULS_BATCH_01_PUDDINGS_095_100_B072.md` — 38 spoonfuls
- `SPOONFULS_BATCH_02_PUDDINGS_101_104_B072.md` — 28 spoonfuls
- `SPOONFULS_BATCH_03_PUDDINGS_047_056_B072.md` — 60 spoonfuls
- `SPOONFULS_BATCH_04_PUDDINGS_057_067_B072.md` — 66 spoonfuls
- `SPOONFULS_BATCH_05_PUDDINGS_068_076_B072.md` — 54 spoonfuls
- `SPOONFULS_BATCH_06_PUDDINGS_077_088_B072.md` — 72 spoonfuls
- `SPOONFULS_BATCH_07_PUDDINGS_089_094_B072.md` — 36 spoonfuls
- `SPOONFULS_BATCH_08_PUDDINGS_023_034_B072.md` — 66 spoonfuls
- `SPOONFULS_BATCH_09_PUDDINGS_035_046_B072.md` — 72 spoonfuls
- `SPOONFULS_BATCH_10_PUDDINGS_001_017_B073.md` — 42 spoonfuls
- `SPOONFULS_BATCH_11_PUDDINGS_018_022_B073.md` — 16 spoonfuls

---

## IMPLEMENTATION

### Step 1: Build Content Parser Script

File: `platform/scripts/stage-content.ts`

A Node/Deno script that:
1. Reads each BST chapter file from BISHOP_DROPZONE
2. Parses episodes (each file uses a consistent format: `### EP-NNN` header + content block + optional tags)
3. Reads each Spoonfuls batch file
4. Parses spoonfuls (each batch uses: `### SP-PPP-NN` header + content + spice tags)
5. Calls `stage-crewman-chapter` for each chapter/batch

### Step 2: Stage BST Episodes (4 chapters)

For each BST chapter, call `stage-crewman-chapter`:

```json
{
  "chapter_number": 1,
  "title": "StarScreaming: Building in Public",
  "source_document": "CREWMAN6_BST_CHAPTER_01_STARSCREAMING_EPISODES_B070.md",
  "vote_threshold": 100,
  "episodes": [
    {
      "sequence_number": 1,
      "content": "<parsed episode text>",
      "source_reference": "StarScreaming paper",
      "tags": ["starscreaming", "building-in-public"],
      "platform": "twitter",
      "channel": "bst"
    }
    // ... all episodes
  ]
}
```

Chapter mapping:
| Chapter | Title | Source | Episodes |
|---------|-------|--------|----------|
| 1 | StarScreaming: Building in Public | StarScreaming paper | 52 |
| 2 | Blizzard: The Avalanche of Ideas | 100 innovations in 100 days | 42 |
| 3 | Genesis: Where It All Began | Genesis compilation paper | 48 |
| 4 | The Cake: How AI Actually Works | AI Cake V2 paper | 52 |

### Step 3: Stage Spoonfuls (11 batches as chapters)

Spoonfuls use separate chapter numbers (100+) to avoid collision with BST:

| Chapter # | Title | Source Puddings | Spoonfuls |
|-----------|-------|-----------------|-----------|
| 101 | Spoonfuls: The Century (Puddings #95-#100) | Batch 01 | 38 |
| 102 | Spoonfuls: Beyond 100 (Puddings #101-#104) | Batch 02 | 28 |
| 103 | Spoonfuls: The Middle (Puddings #47-#56) | Batch 03 | 60 |
| 104 | Spoonfuls: Momentum (Puddings #57-#67) | Batch 04 | 66 |
| 105 | Spoonfuls: The Climb (Puddings #68-#76) | Batch 05 | 54 |
| 106 | Spoonfuls: The Ridge (Puddings #77-#88) | Batch 06 | 72 |
| 107 | Spoonfuls: The Peak (Puddings #89-#94) | Batch 07 | 36 |
| 108 | Spoonfuls: Foundation (Puddings #23-#34) | Batch 08 | 66 |
| 109 | Spoonfuls: Deep Roots (Puddings #35-#46) | Batch 09 | 72 |
| 110 | Spoonfuls: Origins (Puddings #1-#17) | Batch 10 | 42 |
| 111 | Spoonfuls: Compiled (Puddings #18-#22) | Batch 11 | 16 |

Each Spoonful episode:
```json
{
  "sequence_number": 1,
  "content": "<spoonful text ~280 chars>",
  "source_reference": "Pudding #XX: <title>",
  "tags": ["pudding-XX", "spoonful"],
  "platform": "linkedin",
  "channel": "spoonfuls"
}
```

### Step 4: Preserve Spice Tags

Each Spoonfuls batch file includes `primary_spice` and `secondary_spices` per spoonful. After staging, run UPDATE queries to set spice columns:

```sql
-- Example: After staging batch, update spice tags
UPDATE crewman_episodes
SET primary_spice = 'garlic',
    secondary_spices = ARRAY['pepper']
WHERE chapter_id = '<chapter_uuid>'
  AND sequence_number = 1;
```

Alternatively, extend the parser to include spice data in tags array with a prefix convention (e.g., `spice:garlic`, `spice2:pepper`) and post-process into the dedicated columns.

**Better approach**: Add `primary_spice` and `secondary_spices` fields directly to the episode INSERT. The `stage-crewman-chapter` function inserts raw into `crewman_episodes` — if those columns exist (they do from K246 migration), Supabase will accept them. Modify the function to pass through `primary_spice` and `secondary_spices` from the episode input.

### Step 5: Update stage-crewman-chapter Function

Add spice fields to the type and insert:

```typescript
type StageEpisodeInput = {
  sequence_number: number;
  content: string;
  source_reference?: string | null;
  tags?: string[] | null;
  platform?: string | null;
  channel?: "bst" | "spoonfuls" | "skipping_stones" | null;
  primary_spice?: string | null;       // ADD
  secondary_spices?: string[] | null;  // ADD
};
```

And in the insert mapping:
```typescript
normalizedEpisodes.map((episode) => ({
  chapter_id: chapter.id,
  sequence_number: episode.sequence_number,
  content: episode.content,
  source_reference: episode.source_reference,
  tags: episode.tags,
  platform: episode.platform,
  channel: episode.channel,
  primary_spice: episode.primary_spice ?? null,
  secondary_spices: episode.secondary_spices ?? [],
  status: "queued",
})),
```

### Step 6: Verification

After staging, verify counts:
```sql
SELECT channel, COUNT(*) FROM crewman_episodes GROUP BY channel;
-- Expected: bst = 194, spoonfuls = 550
-- Total: 744 episodes staged

SELECT channel, primary_spice, COUNT(*) FROM crewman_episodes
WHERE primary_spice IS NOT NULL GROUP BY channel, primary_spice;
-- All 550 spoonfuls should have spice tags
```

---

## DELIVERABLES

1. Updated `stage-crewman-chapter` edge function with `primary_spice` / `secondary_spices` passthrough
2. Content parser script (`platform/scripts/stage-content.ts`) that reads all BISHOP_DROPZONE files
3. All 194 BST episodes staged (chapters 1-4)
4. All 550 Spoonfuls staged (chapters 101-111) with spice tags preserved
5. Verification query output confirming 744 total episodes

---

## IMPORTANT NOTES

- Do NOT modify episode content — stage exactly as written in the source files
- Spoonfuls are ~280 chars max — they're micro-posts, not full articles
- BST episodes are longer (~500-1500 chars) — full thought pieces
- The `platform` field defaults: BST → "twitter", Spoonfuls → "linkedin" (can be overridden by Grid Scheduler later)
- `scheduled_for` stays NULL for now — K251 handles scheduling
- Deploy the updated edge function BEFORE running the staging script
