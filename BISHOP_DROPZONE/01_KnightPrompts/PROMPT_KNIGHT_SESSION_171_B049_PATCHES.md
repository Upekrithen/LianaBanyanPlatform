# KNIGHT SESSION 171 — B049 Patches + Pudding #23 + Stats + Golden Key Seeds
## Bishop B049 | Quick deployment session
## Priority: HIGHEST — do this FIRST before any DD gate work

---

## CONTEXT

Bishop B049 produced several items that need deployment:
- 1 new Pudding article (#23 — Hood Uber)
- 1 patch to "6 Easy Steps" V2 (Hood Uber in Step 3)
- 6 Golden Key answer seeds
- Canonical stats update (innovation_count=2105, pudding_articles=23, bishop_sessions=49, etc.)

K170 deployed the template system. This session uses it.

---

## TASK 1: Run Canonical Stats Update

```sql
-- B049 stats
UPDATE platform_canonical SET value = 2105, updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 23, updated_at = now() WHERE key = 'pudding_articles';
UPDATE platform_canonical SET value = 170, updated_at = now() WHERE key = 'knight_sessions';
UPDATE platform_canonical SET value = 49, updated_at = now() WHERE key = 'bishop_sessions';
UPDATE platform_canonical SET value = 5, updated_at = now() WHERE key = 'dirty_dozen_green';
```

Verify: `SELECT key, value FROM platform_canonical ORDER BY key;`

---

## TASK 2: Insert Pudding Article #23 — Hood Uber

Read `BISHOP_DROPZONE/PUDDING_23_HOOD_UBER_PROVES_THE_NEED.md` and insert into `cephas_content_registry`:

- slug: `pudding/hood-uber-proves-the-need`
- title: "Hood Uber Proves the Need. We Built the Fix."
- category: `article`
- style: `pudding`
- content: Full article text from the file (use `{{template}}` variables — they're already in the draft)
- innovation_ids: Rideshare Routes, Defense Klaus, Earn-Down
- bishop_session: 'B049'
- knight_session: 'K171'

---

## TASK 3: Patch 6 Easy Steps V2 — Hood Uber in Step 3

Read `BISHOP_DROPZONE/SIX_EASY_STEPS_V2_HOOD_UBER_PATCH_B049.md` for the exact SQL.

Short version: Insert a Rideshare Routes paragraph between "Defense Klaus" and "LifeLine Medications" in the `six-easy-steps` slug content.

```sql
UPDATE cephas_content_registry
SET content_markdown = REPLACE(
  content_markdown,
  '**LifeLine Medications** is prescription access at cost plus 20%',
  E'**Rideshare Routes** is cooperative transportation. In March 2026, a San Antonio news outlet documented over 21,000 residents using informal community ridesharing organized through Facebook groups — with no background checks, no payment protection, and a driver who was shot over an unpaid fare. The demand for affordable community transportation is proven. The infrastructure to make it safe doesn''t exist yet — until now. Rideshare Routes charges {{platformMargin}}. The driver keeps {{creatorRetention}}. Payment is processed by Stripe before the trip — no cash disputes. Background verification uses tiered assessment with community vouching, not Uber''s binary pass/fail. The Earn-Down program lets drivers accumulate toward owning the vehicle they drive. Defense Klaus provides panic buttons and legal defense for drivers working alone. The safe version of what 21,000 San Antonians built on faith.\n\n**LifeLine Medications** is prescription access at cost plus 20%'
),
updated_at = now()
WHERE slug = 'six-easy-steps';
```

---

## TASK 4: Seed Golden Key Answers

Read `BISHOP_DROPZONE/GOLDEN_KEY_SEEDS_B049.md` for the full SQL.

```sql
INSERT INTO golden_key_answers (article_slug, key_word, clue_hint, active, created_at) VALUES
  ('pudding/zero-storage-full-income', 'REGISTRAR', 'The platform isn''t a landlord. It''s a ___', true, now()),
  ('pudding/pearl-diver-neighborhood-intelligence', 'PEARL', 'What do you call the diver who finds deals?', true, now()),
  ('pudding/five-dollar-classroom', 'CLASSROOM', 'What costs $5 and creates a career?', true, now()),
  ('pudding/why-the-first-ten-matter', 'TEN', 'What''s the maximum number of pioneers in the top tier?', true, now()),
  ('pudding/four-currencies-one-subscription', '83.3', 'What percentage does the creator keep?', true, now()),
  ('pudding/hood-uber-proves-the-need', 'ROUTES', 'The cooperative rideshare is called Rideshare ___', true, now())
ON CONFLICT (article_slug) DO UPDATE SET
  key_word = EXCLUDED.key_word,
  clue_hint = EXCLUDED.clue_hint,
  active = true,
  updated_at = now();
```

If `golden_key_answers` table doesn't have an `article_slug` unique constraint, add one first or adjust the ON CONFLICT clause.

---

## TASK 5: Build + Deploy

```
[ ] Build: zero errors
[ ] Push migration to Supabase
[ ] Deploy all 8 hosting targets
[ ] Deploy Cephas
[ ] Verify: cephas.lianabanyan.com/pudding/hood-uber-proves-the-need loads
[ ] Verify: cephas.lianabanyan.com/six-easy-steps shows Rideshare Routes in Step 3
[ ] Verify: /golden-key accepts "ROUTES" as an answer
```

---

## ESTIMATED TIME: 30-45 minutes. This is a quick patch session.

---

*Knight Session 171 — Bishop (Foreman), B049*
*FOR THE KEEP!*
