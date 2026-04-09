# KNIGHT SESSION 255 — Stage Chapter 7 + Spoonfuls Batch 13
## Bishop B075 | April 4, 2026

---

## MISSION

Insert BST Chapter 7 (Lighthouse Ladder, 52 episodes) and Spoonfuls Batch 13 (8 spoonfuls from Pudding #109) into the `crewman_episodes` table. Spice-tag all entries. Verify counts.

---

## CONTEXT

- Chapter 7 source: `BISHOP_DROPZONE/CREWMAN6_CHAPTER_07_LIGHTHOUSE_LADDER_EPISODES_B075.md`
- Spoonfuls Batch 13 source: `BISHOP_DROPZONE/SPOONFULS_BATCH_13_PUDDING_109_B075.md`
- Prior staging (K249): 744 episodes (194 BST Ch.1-6 + 550 Spoonfuls Batches 1-12)
- After this session: 804 episodes (246 BST Ch.1-7 + 558 Spoonfuls Batches 1-13)

---

## STEP 1: Insert BST Chapter 7 Episodes

Insert 52 episodes into `crewman_episodes` with:
- `series`: 'bst'
- `chapter`: 7
- `chapter_title`: 'The Lighthouse Ladder'
- `episode_key`: 'CH07-EP-001' through 'CH07-EP-052'
- `content`: Episode text from the source file (each ~280 chars)
- `primary_spice`: 'basil'
- `secondary_spices`: ARRAY['oregano', 'paprika']
- `status`: 'staged'
- `bishop_session`: 'B075'

Read the full episode content from `CREWMAN6_CHAPTER_07_LIGHTHOUSE_LADDER_EPISODES_B075.md` and generate the INSERT statements.

---

## STEP 2: Insert Spoonfuls Batch 13

Insert 8 spoonfuls into `crewman_episodes` with:
- `series`: 'spoonfuls'
- `episode_key`: as specified in source (S-109-001 through S-109-008)
- `content`: Spoonful text (before the hashtag)
- `primary_spice`: as tagged per spoonful (varies — basil, oregano, pepper, paprika, cumin, ginger, garlic)
- `pudding_number`: 109
- `status`: 'staged'
- `bishop_session`: 'B075'

Read spice tags from each spoonful's `#Spoonfuls #SpiceName` suffix.

---

## STEP 3: Verify Counts

```sql
-- Total by series
SELECT series, COUNT(*) FROM crewman_episodes GROUP BY series;
-- Expected: bst = 246 (194 + 52), spoonfuls = 558 (550 + 8)

-- Chapter 7 specifically
SELECT COUNT(*) FROM crewman_episodes WHERE series = 'bst' AND chapter = 7;
-- Expected: 52

-- Batch 13 specifically
SELECT COUNT(*) FROM crewman_episodes WHERE series = 'spoonfuls' AND pudding_number = 109;
-- Expected: 8

-- Spice coverage
SELECT COUNT(*) FROM crewman_episodes WHERE primary_spice IS NOT NULL;
-- Expected: 804 (100%)

-- Grand total
SELECT COUNT(*) FROM crewman_episodes;
-- Expected: 804
```

---

## ACCEPTANCE CRITERIA

- [ ] 52 BST Ch.7 episodes inserted with correct content
- [ ] 8 Spoonfuls Batch 13 inserted with correct content
- [ ] All 60 new entries have `primary_spice` set
- [ ] Total crewman_episodes = 804
- [ ] `npm run build` passes

---

## DO NOT

- Modify any existing episodes from Ch.1-6 or Batches 1-12
- Change any `scheduled_for` values set by K254
- Set any of these new episodes to 'published' status
