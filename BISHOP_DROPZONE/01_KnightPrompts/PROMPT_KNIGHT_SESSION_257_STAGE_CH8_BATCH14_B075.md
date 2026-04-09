# KNIGHT SESSION 257 — Stage Chapter 8 + Spoonfuls Batch 14
## Bishop B075 | April 4, 2026

---

## MISSION

Insert BST Chapter 8 (Invisible Temperament, 48 episodes) and Spoonfuls Batch 14 (7 spoonfuls from Pudding #110) into `crewman_episodes` using the same staging script pattern from K255.

---

## CONTEXT

- Chapter 8 source: `BISHOP_DROPZONE/CREWMAN6_CHAPTER_08_INVISIBLE_TEMPERAMENT_EPISODES_B075.md`
- Spoonfuls Batch 14 source: `BISHOP_DROPZONE/SPOONFULS_BATCH_14_PUDDING_110_B075.md`
- Prior staging (K255): 810 episodes in DB
- After this session: 865 episodes (810 + 48 BST + 7 Spoonfuls)

---

## STEP 1: Add Chapter 8 Config to stage-content.ts

Add to the chapters array:
```typescript
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
```

Add Spoonfuls Batch 14 as chapter 114:
```typescript
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
```

## STEP 2: Run Targeted Staging

```bash
cd platform
STAGE_CONTENT_TARGETS=8,114 node --experimental-strip-types scripts/stage-content.ts
```

## STEP 3: Verify

```sql
SELECT series, COUNT(*) FROM crewman_episodes GROUP BY series;
-- Expected: bst increased by 48, spoonfuls increased by 7

SELECT COUNT(*) FROM crewman_episodes WHERE series = 'bst' AND chapter = 8;
-- Expected: 48

SELECT COUNT(*) FROM crewman_episodes WHERE series = 'spoonfuls' AND pudding_number = 110;
-- Expected: 7

SELECT COUNT(*) FROM crewman_episodes;
-- Expected: ~865
```

## STEP 4: Build

```bash
npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] 48 BST Ch.8 episodes inserted
- [ ] 7 Spoonfuls Batch 14 inserted
- [ ] All 55 new entries have primary_spice set
- [ ] `npm run build` passes

## DO NOT

- Modify existing episodes
- Change any scheduled_for values
