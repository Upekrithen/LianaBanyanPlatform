# KNIGHT SESSION 264 — Canonical Stats Sync + Dynamic Template Update
## Bishop B075 | April 4, 2026

---

## MISSION

Update `platform_canonical` table with current values from B075 session production. This ensures:
1. The Dynamic Stats Template System (K170) renders correct numbers everywhere
2. The Sentinel (fixed in K259) reads correct values
3. The landing page stats (fixed in K256) stay accurate
4. All `{{variableName}}` references in Cephas content resolve correctly

---

## CANONICAL VALUES TO UPDATE

```sql
-- Innovation count
UPDATE platform_canonical SET value = '2144', updated_at = NOW()
WHERE key = 'innovation_count';

-- Crown Jewel count
UPDATE platform_canonical SET value = '182', updated_at = NOW()
WHERE key = 'crown_jewel_count';

-- Patent provisional count (Prov 12 filing today)
UPDATE platform_canonical SET value = '12', updated_at = NOW()
WHERE key = 'provisional_count';

-- BST episode count
UPDATE platform_canonical SET value = '488', updated_at = NOW()
WHERE key = 'bst_episode_count';

-- Spoonfuls count
UPDATE platform_canonical SET value = '599', updated_at = NOW()
WHERE key = 'spoonfuls_count';

-- Pudding count
UPDATE platform_canonical SET value = '112', updated_at = NOW()
WHERE key = 'pudding_count';

-- Total distributable episodes
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('total_distributable_episodes', '979', 'Total BST + Spoonfuls episodes staged', NOW())
ON CONFLICT (key) DO UPDATE SET value = '979', updated_at = NOW();

-- Days of hourly content
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('days_hourly_content', '20.3', 'Days of continuous hourly BST posting', NOW())
ON CONFLICT (key) DO UPDATE SET value = '20.3', updated_at = NOW();

-- Compiled documents count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('compiled_documents_count', '38', 'Documents compiled in compilation pipeline', NOW())
ON CONFLICT (key) DO UPDATE SET value = '38', updated_at = NOW();

-- BST chapter count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('bst_chapter_count', '10', 'BST chapters produced', NOW())
ON CONFLICT (key) DO UPDATE SET value = '10', updated_at = NOW();

-- Paper count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('paper_count', '34', 'Academic papers written', NOW())
ON CONFLICT (key) DO UPDATE SET value = '34', updated_at = NOW();
```

---

## VERIFY

```sql
SELECT key, value, updated_at
FROM platform_canonical
WHERE key IN (
  'innovation_count', 'crown_jewel_count', 'provisional_count',
  'bst_episode_count', 'spoonfuls_count', 'pudding_count',
  'total_distributable_episodes', 'days_hourly_content',
  'compiled_documents_count', 'bst_chapter_count', 'paper_count'
)
ORDER BY key;
```

All values should match the B075 production totals listed above.

---

## ALSO: Update Index.tsx Patent Count

If K256 set the patent count to 12 but it was supposed to wait for Prov 12 filing, verify the value is correct. If Prov 12 has NOT yet been filed, change it back to 11. The Founder will confirm.

**Check**: Is the landing page stat "12 Patent Applications" or "11 Patent Applications"? It should match the filed count.

---

## ACCEPTANCE CRITERIA

- [ ] All platform_canonical values updated to B075 current state
- [ ] No stale canonical values remain for updated keys
- [ ] `npm run build` passes (if any code changed)

## DO NOT

- Modify the DNA Lock parameters
- Change membership_cost or creator_keeps values
- Update values that were not listed above
