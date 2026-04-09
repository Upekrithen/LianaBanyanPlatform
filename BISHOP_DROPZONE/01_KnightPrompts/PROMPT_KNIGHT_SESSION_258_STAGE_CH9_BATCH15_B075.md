# KNIGHT SESSION 258 — Stage Chapter 9 + Spoonfuls Batch 15
## Bishop B075 | April 4, 2026

---

## MISSION

Insert BST Chapter 9 (Self-Funding Economics, 52 episodes) and Spoonfuls Batch 15 (7 spoonfuls from Pudding #111) into `crewman_episodes`.

---

## CONTEXT

- Chapter 9 source: `BISHOP_DROPZONE/CREWMAN6_CHAPTER_09_SELF_FUNDING_ECONOMICS_EPISODES_B075.md`
- Spoonfuls Batch 15 source: `BISHOP_DROPZONE/SPOONFULS_BATCH_15_PUDDING_111_B075.md`
- Prior total: ~865 episodes
- After this session: ~924 episodes

---

## STEP 1: Add Configs to stage-content.ts

```typescript
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
  chapter_number: 115,
  title: "Spoonfuls Batch 15 — Pudding 111",
  source_document: "SPOONFULS_BATCH_15_PUDDING_111_B075.md",
  source_reference: "Pudding #111 Self-Funding Economics",
  tags: ["spoonfuls", "pudding-111"],
  platform: "twitter",
  channel: "spoonfuls",
  expected_count: 7,
},
```

## STEP 2: Run + Verify + Build

```bash
cd platform
STAGE_CONTENT_TARGETS=9,115 node --experimental-strip-types scripts/stage-content.ts
npm run build
```

Expected: bst +52, spoonfuls +7, total ~924, all primary_spice non-null.

## DO NOT
- Modify existing episodes or scheduled_for values
