# KNIGHT SESSION 267 — Stage Chapter 11 + Spoonfuls Batch 17
## Bishop B075 | April 4, 2026

---

## MISSION

Insert BST Chapter 11 (Contingency Operators, 48 episodes) and Spoonfuls Batch 17 (7 spoonfuls from Pudding #114) into `crewman_episodes`.

---

## STEP 1: Add Configs to stage-content.ts

```typescript
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
  chapter_number: 117,
  title: "Spoonfuls Batch 17 — Pudding 114",
  source_document: "SPOONFULS_BATCH_17_PUDDING_114_B075.md",
  source_reference: "Pudding #114 Play With These Numbers",
  tags: ["spoonfuls", "pudding-114"],
  platform: "twitter",
  channel: "spoonfuls",
  expected_count: 7,
},
```

## STEP 2: Run + Verify + Build

```bash
cd platform
STAGE_CONTENT_TARGETS=11,117 node --experimental-strip-types scripts/stage-content.ts
npm run build
```

Expected: bst +48, spoonfuls +7, total ~1034, all primary_spice non-null.

## DO NOT
- Modify existing episodes or scheduled_for values
