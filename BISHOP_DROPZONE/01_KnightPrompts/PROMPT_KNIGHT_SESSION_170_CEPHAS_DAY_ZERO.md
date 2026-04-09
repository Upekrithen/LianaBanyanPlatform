# KNIGHT SESSION 170 — Cephas Day 0 Deploy + Dynamic Stats + Seibel Red Carpet
## Bishop B048 | CRITICAL PATH — Everything else depends on content being live
## Priority: HIGHEST

---

## CONTEXT

Bishop B048 produced:
- "6 Easy Steps" V2 (3-level progressive disclosure business plan, 43K chars)
- 5 new Pudding article drafts (full text in BISHOP_DROPZONE/PUDDING_ARTICLES_FULL_DRAFTS_B048/)
- Revised Battery Dispatch with Golden Key hooks
- Seibel Red Carpet cover note

All content needs to be deployed to Cephas (DB-served, NOT Hugo). And the BIGGEST win: make all stats DYNAMIC so we never do manual find/replace again.

---

## DELIVERABLE 1: Dynamic Stats Template System (THE BIG WIN)

### What
Add template variable interpolation to the Cephas content renderer. Any content served from `cephas_content_registry` can use `{{variableName}}` syntax that gets replaced at render time with live values from `platform_canonical`.

### Template Variables

| Variable | Source | Current Value |
|----------|--------|-------------|
| `{{innovationCount}}` | platform_canonical.innovation_count | 2,104 |
| `{{crownJewels}}` | platform_canonical.crown_jewels | 161 |
| `{{patentApplications}}` | platform_canonical.patent_applications | 11 |
| `{{patentClaims}}` | platform_canonical.patent_claims | 2081 |
| `{{productionSystems}}` | platform_canonical.production_systems | 31 |
| `{{charitableInitiatives}}` | hardcoded or new column | 16 |
| `{{founderAge}}` | hardcoded or calculated | 53 |
| `{{founderTitle}}` | hardcoded | Founder & General Manager |
| `{{entityName}}` | hardcoded | Liana Banyan Corporation |
| `{{membershipCost}}` | hardcoded | $5/year |
| `{{creatorRetention}}` | hardcoded | 83.3% |
| `{{platformMargin}}` | hardcoded | Cost + 20% |
| `{{knightSessions}}` | new column or hardcoded | 169 |
| `{{bishopSessions}}` | new column or hardcoded | 048 |
| `{{pawnBatches}}` | new column or hardcoded | 28 |
| `{{dirtyDozenGreen}}` | new column or hardcoded | 5 |
| `{{dirtyDozenTotal}}` | hardcoded | 12 |
| `{{puddingArticles}}` | count from cephas_content_registry | 22 |
| `{{academicPapers}}` | hardcoded | 7 |

### Implementation

1. **In the content renderer** (wherever `cephas_content_registry.content` is rendered to HTML/markdown):
   ```typescript
   function interpolateStats(content: string, stats: CanonicalStats): string {
     return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
       return stats[key]?.toString() ?? match;
     });
   }
   ```

2. **Extend `useCanonicalStats`** (already exists from K168) to include ALL template variables, not just innovation count and crown jewels.

3. **Migration**: Add any missing columns to `platform_canonical`:
   ```sql
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS charitable_initiatives INTEGER DEFAULT 16;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS founder_age INTEGER DEFAULT 53;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS dirty_dozen_green INTEGER DEFAULT 5;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS pudding_articles INTEGER DEFAULT 22;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS academic_papers INTEGER DEFAULT 7;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS knight_sessions INTEGER DEFAULT 169;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS bishop_sessions INTEGER DEFAULT 48;
   ALTER TABLE platform_canonical ADD COLUMN IF NOT EXISTS pawn_batches INTEGER DEFAULT 28;
   ```

4. **Update all Cephas content** to use `{{variables}}` instead of hardcoded numbers.

### Result
When K171 deploys and changes `innovation_count` to 2,110 — EVERY article, EVERY letter, EVERY business plan on Cephas automatically shows 2,110. No Bishop session needed. No manual find/replace. Forever.

---

## DELIVERABLE 2: Deploy "6 Easy Steps" V2 to Cephas

1. Insert into `cephas_content_registry`:
   - slug: `business-plan` (primary) + `six-easy-steps` (alias)
   - title: "How to Save the World in 6 Easy Steps"
   - content_type: `business-plan`
   - content: Full V2 text from `BISHOP_DROPZONE/HOW_TO_SAVE_THE_WORLD_IN_6_EASY_STEPS_V2.md`
   - **Replace all hardcoded numbers with `{{template}}` variables**
   
2. Ensure route `/business-plan` resolves on cephas.lianabanyan.com
3. Verify 3-level disclosure renders correctly (blockquotes for Level 2/3)

---

## DELIVERABLE 3: Deploy 5 New Pudding Articles

Insert into `cephas_content_registry`:

| # | Slug | Title | Source |
|---|------|-------|--------|
| 18 | `pudding/zero-storage-full-income` | Zero Storage, Full Income | BISHOP_DROPZONE/PUDDING_FULL/ |
| 19 | `pudding/pearl-diver-neighborhood-intelligence` | Pearl Diver: Your Neighborhood Knows More Than Google | Same |
| 20 | `pudding/five-dollar-classroom` | The $5 Classroom | Same |
| 21 | `pudding/why-the-first-ten-matter` | Why the First 10 Matter | Same |
| 22 | `pudding/four-currencies-one-subscription` | Four Currencies, One Subscription | Same |

All articles should use `{{template}}` variables for stats.

---

## DELIVERABLE 4: Update 17 Existing Pudding Articles

For each of the 17 existing Pudding articles in `cephas_content_registry`:
1. Replace all hardcoded innovation counts with `{{innovationCount}}`
2. Replace all hardcoded patent claims with `{{patentClaims}}`
3. Replace all hardcoded production systems with `{{productionSystems}}`
4. Replace all hardcoded initiative counts with `{{charitableInitiatives}}`
5. Replace all hardcoded patent application counts with `{{patentApplications}}`
6. Replace "Founder & CEO" with `{{founderTitle}}`

Use the Stats Update Manifest (BISHOP_DROPZONE/STATS_UPDATE_MANIFEST_80_DRAFTS_B048.md) for the find patterns. But instead of replacing with new hardcoded numbers, replace with `{{variables}}`.

---

## DELIVERABLE 5: Wire Seibel Red Carpet Cover Note

1. Read `BISHOP_DROPZONE/SEIBEL_PACKAGE_INSERT_B048.md`
2. Add cover note to Seibel's Red Carpet configuration in `redCarpetRecipients.ts`
3. The cover note appears AFTER email recognition, BEFORE walkthrough Section 1
4. Include link to `/business-plan` on Cephas
5. Include "Read the Business Plan →" CTA button

---

## DELIVERABLE 6: Golden Key Embed Points

Each new Pudding article needs a Golden Key clue embedded. The clue is a word or phrase hidden in the article text that can be submitted at `/golden-key` for Keys.

Bishop will provide the specific clue words in the article drafts. Knight wires the submission + validation.

If Golden Key quest page doesn't exist yet, create a minimal version:
- Route: `/golden-key`
- Input field: "Enter today's key word"
- Validation: check against `golden_key_answers` table (time-rotating)
- Reward: Keys (per existing TasteTester-style diminishing tiers)

---

## DELIVERABLE 7: Verify All Cross-Links

After deployment:
1. Every Pudding article links to related articles (internal cross-references)
2. Business plan links to relevant Pudding articles at each Level 2/3 section
3. Red Carpet pages link to relevant Cephas content
4. Battery Dispatch posts (when fired) will link to live Cephas URLs

Test: click every link. Every one must resolve.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] Migration: platform_canonical new columns
[ ] Template interpolation function in content renderer
[ ] useCanonicalStats extended with all variables
[ ] "6 Easy Steps" V2 inserted with {{variables}}
[ ] 5 new Pudding articles inserted with {{variables}}
[ ] 17 existing Pudding articles updated to {{variables}}
[ ] Seibel Red Carpet cover note wired
[ ] Golden Key minimal quest page (if not exists)
[ ] Golden Key clues embedded in 5 new articles
[ ] All cross-links verified
[ ] Build: zero errors
[ ] Migration pushed to Supabase
[ ] All 8 hosting targets deployed
[ ] Cephas deployed
```

---

*Knight Session 170 Prompt — Bishop (Foreman), B048*
*CRITICAL PATH: Day 0 depends on this session.*
*FOR THE KEEP!*
