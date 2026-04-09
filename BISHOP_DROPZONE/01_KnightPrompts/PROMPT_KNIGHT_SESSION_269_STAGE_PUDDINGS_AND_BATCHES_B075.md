# KNIGHT SESSION 269 — Stage Puddings 109-120 + Batches 13-19 (Bulk Catch-Up)
## Bishop B075 | April 4, 2026

---

## MISSION

Bulk insert all B075 Puddings (#109-#120) into `cephas_puddings` table and all Spoonfuls Batches (13-19) into `crewman_episodes` via existing stage-content.ts patterns. This catches up the database to B075 production.

---

## CONTEXT

B075 has produced 12 Puddings and 7 Spoonfuls batches that are not yet in the database:

### Puddings (12)
- #109 The Lighthouse Ladder
- #110 The Invisible Temperament
- #111 Self-Funding Economics
- #112 The Portable Reputation
- #113 The Patent Bags
- #114 Play With These Numbers
- #115 What the Attic Knows
- #116 The Missing Claims
- #117 The Locked Folders
- #118 The Cleanest Family
- #119 The Strategic Pivot
- #120 Load-Bearing Fables

### Spoonfuls Batches (already staged 13, 14, 15, 16, 17)
Remaining to stage:
- Batch 18 (Pudding #115, 7 spoonfuls) — chapter 118
- Batch 19 (Puddings #116-119, 15 spoonfuls) — chapter 119

---

## STEP 1: Insert Puddings into cephas_puddings

Each Pudding file has a SQL INSERT statement at the bottom. Extract and execute them, or write a script that reads each file and runs the inserts.

**Pudding files in BISHOP_DROPZONE**:
- PUDDING_109_THE_LIGHTHOUSE_LADDER_B075.md
- PUDDING_110_THE_INVISIBLE_TEMPERAMENT_B075.md
- PUDDING_111_SELF_FUNDING_ECONOMICS_B075.md
- PUDDING_112_THE_PORTABLE_REPUTATION_B075.md
- PUDDING_113_THE_PATENT_BAGS_B075.md
- PUDDING_114_PLAY_WITH_THESE_NUMBERS_B075.md
- PUDDING_115_WHAT_THE_ATTIC_KNOWS_B075.md
- PUDDING_116_THE_MISSING_CLAIMS_B075.md
- PUDDING_117_THE_LOCKED_FOLDERS_B075.md
- PUDDING_118_THE_CLEANEST_FAMILY_B075.md
- PUDDING_119_THE_STRATEGIC_PIVOT_B075.md
- PUDDING_120_LOAD_BEARING_FABLES_B075.md

## STEP 2: Add Batch 18 + 19 Configs to stage-content.ts

```typescript
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
```

## STEP 3: Run + Verify + Build

```bash
cd platform
STAGE_CONTENT_TARGETS=118,119 node --experimental-strip-types scripts/stage-content.ts
npm run build
```

Expected: spoonfuls +22 (7+15), all with primary_spice set.

## STEP 4: Verify Pudding Count

```sql
SELECT COUNT(*) FROM cephas_puddings;
-- Expected: should include #109-#120 (12 new)

SELECT pudding_number, title, primary_spice, bishop_session
FROM cephas_puddings
WHERE bishop_session = 'B075'
ORDER BY pudding_number;
-- Should show 12 rows for #109-#120
```

## ACCEPTANCE CRITERIA

- [ ] 12 B075 Puddings in cephas_puddings table
- [ ] 22 new Spoonfuls in crewman_episodes (Batches 18 + 19)
- [ ] All entries have primary_spice set
- [ ] `npm run build` passes

## DO NOT
- Modify existing Puddings or Spoonfuls
- Change any scheduled_for values
