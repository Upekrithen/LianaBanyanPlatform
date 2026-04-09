# KNIGHT SESSION — LIBRARIAN SYNC + CANONICAL DB UPDATE
## Bishop B062 | April 2, 2026
## Priority: HIGH — Librarian is stale, showing B060 data

---

## CONTEXT

Librarian MCP overview is stale. Shows innovation 2129, CJ 167, last session B060, migration 18/23. Actual state: innovation 2130, CJ 168, formal claims 2103, Pudding 76, Bishop 62, Prov 11 FILED, **22/23 domains migrated** (K227 Beacon, K228 Calendar, K229 Admin, K230 Initiatives all complete but not reflected in indexes).

The B061 SQL file (`BISHOP_DROPZONE/CANONICAL_STATS_UPDATE_B061.sql`) has errors — pudding_count=51 instead of 76, only logs Pudding #47-51 instead of all 30 articles. Use the CORRECTED SQL below instead.

---

## TASK 1: Run Corrected Canonical Stats Update

Run this SQL against Supabase:

```sql
-- Bishop B062 Corrected Canonical Stats Update
-- April 2, 2026
-- Corrects B061 SQL: full Pudding count, all 30 articles logged

-- Core canonical numbers
UPDATE platform_canonical SET value = '2130', updated_at = NOW() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = '168', updated_at = NOW() WHERE key = 'crown_jewel_count';
UPDATE platform_canonical SET value = '2103', updated_at = NOW() WHERE key = 'formal_claims_count';
UPDATE platform_canonical SET value = '11', updated_at = NOW() WHERE key = 'provisional_count';
UPDATE platform_canonical SET value = '76', updated_at = NOW() WHERE key = 'pudding_count';
UPDATE platform_canonical SET value = '62', updated_at = NOW() WHERE key = 'bishop_session_count';
UPDATE platform_canonical SET value = '35', updated_at = NOW() WHERE key = 'production_system_count';

-- Log innovation #2130 (if not already present)
INSERT INTO innovation_log (
  number, title, category, crown_jewel, session, description
) VALUES (
  2130,
  'Adversarial Signal Counter-Vote Civic Engagement System',
  'political_expedition',
  true,
  'B061',
  'System for converting unsolicited political communications into formal opposing civic positions within a verified cooperative membership platform. Counter-Vote mechanic turns adversarial outreach into cooperative civic engagement.'
) ON CONFLICT (number) DO NOTHING;

-- Log ALL 30 Pudding articles (#47-76) from B061
INSERT INTO pudding_articles (number, title, slug, status, created_by) VALUES
  (47, 'The Opening Gambit', 'the-opening-gambit', 'draft', 'bishop'),
  (48, 'The Counter-Vote', 'the-counter-vote', 'draft', 'bishop'),
  (49, 'The Switzerland Rule', 'the-switzerland-rule', 'draft', 'bishop'),
  (50, 'The Four-Dollar Question', 'the-four-dollar-question', 'draft', 'bishop'),
  (51, 'The Acknowledgment Stamp', 'the-acknowledgment-stamp', 'draft', 'bishop'),
  (52, 'The Wildfire Run', 'the-wildfire-run', 'draft', 'bishop'),
  (53, 'The Bridge', 'the-bridge', 'draft', 'bishop'),
  (54, 'The Treasure Map', 'the-treasure-map', 'draft', 'bishop'),
  (55, 'The Star Chamber', 'the-star-chamber', 'draft', 'bishop'),
  (56, 'The Cue Card', 'the-cue-card', 'draft', 'bishop'),
  (57, 'The Substitution', 'the-substitution', 'draft', 'bishop'),
  (58, 'The Red Carpet', 'the-red-carpet', 'draft', 'bishop'),
  (59, 'The Captain', 'the-captain', 'draft', 'bishop'),
  (60, 'The Keys to the Car', 'the-keys-to-the-car', 'draft', 'bishop'),
  (61, 'The Ghost World', 'the-ghost-world', 'draft', 'bishop'),
  (62, 'The Five-Dollar Membership', 'the-five-dollar-membership', 'draft', 'bishop'),
  (63, 'The Pioneer Node', 'the-pioneer-node', 'draft', 'bishop'),
  (64, 'Everyone Eats Tonight', 'everyone-eats-tonight', 'draft', 'bishop'),
  (65, 'The Design Democracy', 'the-design-democracy', 'draft', 'bishop'),
  (66, 'The Interdependence', 'the-interdependence', 'draft', 'bishop'),
  (67, 'The Safety Ledger', 'the-safety-ledger', 'draft', 'bishop'),
  (68, 'The Cooperative Purchasing', 'the-cooperative-purchasing', 'draft', 'bishop'),
  (69, 'The Round Table', 'the-round-table', 'draft', 'bishop'),
  (70, 'The Boaz Principle', 'the-boaz-principle', 'draft', 'bishop'),
  (71, 'The ADAPT Score', 'the-adapt-score', 'draft', 'bishop'),
  (72, 'The Family Table', 'the-family-table', 'draft', 'bishop'),
  (73, 'The Crew Call', 'the-crew-call', 'draft', 'bishop'),
  (74, 'The Content Shield', 'the-content-shield', 'draft', 'bishop'),
  (75, 'The Roommate Contract', 'the-roommate-contract', 'draft', 'bishop'),
  (76, 'The Medallion', 'the-medallion', 'draft', 'bishop')
ON CONFLICT (number) DO NOTHING;
```

**Verify after running**: `SELECT key, value FROM platform_canonical WHERE key IN ('innovation_count','crown_jewel_count','formal_claims_count','pudding_count','bishop_session_count','provisional_count') ORDER BY key;`

Expected: innovation=2130, CJ=168, claims=2103, pudding=76, bishop=62, provisional=11.

---

## TASK 2: Rebuild Librarian Indexes

```bash
cd librarian-mcp
npx tsc
node dist/indexer/buildIndex.js
```

This rebuilds all 15 index files from current DB + filesystem state. After rebuild, the v2-migration index should show **22/23 migrated** (K227 Beacon, K228 Calendar, K229 Admin, K230 Initiatives now reflected). Only vehicle v2 structure remains.

---

## TASK 3: Restart Librarian MCP Server

In Claude Desktop settings, toggle the Librarian MCP server off then on. Or kill and restart the process.

---

## TASK 4: Verify

After restart, run `get_system_overview` from any agent. Should show:
- innovationCount: 2130
- crownJewelCount: 168
- formalClaimsCount: 2103
- lastSession: B062 (Bishop registered this session)
- v2 migration: 22/23

Also run `get_migration_status` and confirm beacon, calendar, admin, initiatives all show as migrated.

---

## ESTIMATED TIME: 10-15 minutes

This is a quick housekeeping session. No new pages, no migrations, no features. Just data sync.

---

*Knight Librarian Sync Prompt — Bishop B062*
*FOR THE KEEP!*
