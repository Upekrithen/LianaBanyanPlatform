# KNIGHT SESSION 263 — Stage Chapter 10 + Spoonfuls Batch 16
## Bishop B075 | April 4, 2026

---

## MISSION

Insert BST Chapter 10 (Portable Reputation, 48 episodes) and Spoonfuls Batch 16 (7 spoonfuls from Pudding #112) into `crewman_episodes`.

---

## STEP 1: Add Configs to stage-content.ts

```typescript
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
  chapter_number: 116,
  title: "Spoonfuls Batch 16 — Pudding 112",
  source_document: "SPOONFULS_BATCH_16_PUDDING_112_B075.md",
  source_reference: "Pudding #112 The Portable Reputation",
  tags: ["spoonfuls", "pudding-112"],
  platform: "twitter",
  channel: "spoonfuls",
  expected_count: 7,
},
```

## STEP 2: Run + Verify + Build

```bash
cd platform
STAGE_CONTENT_TARGETS=10,116 node --experimental-strip-types scripts/stage-content.ts
npm run build
```

Expected: bst +48, spoonfuls +7, total ~979, all primary_spice non-null.

## DO NOT
- Modify existing episodes or scheduled_for values
