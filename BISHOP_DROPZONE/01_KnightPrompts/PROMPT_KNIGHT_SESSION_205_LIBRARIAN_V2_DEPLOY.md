# KNIGHT SESSION 205 — Librarian V2 Deploy + Stats Sync
## Priority: HIGH | Source: Bishop B056

---

## CONTEXT

Bishop B056 upgraded the Librarian MCP server to V2 with:
- 3 new tools (23 total): `get_migration_status`, `get_letter_status`, `get_diff_since_session`
- 2 new indexers: `parseV2.ts` (v2 scaffold tracker), `parseLetters.ts` (letter status)
- 7 new domains in domainMapper: governance, content, outreach, manufacturing, defense, helm, currency (29 total)
- Fixed canonical number extraction (reads `patentApplications` from hook file)
- Fixed `useCanonicalStats.ts` defaults

**TypeScript compiles clean. Indexes rebuild in 30 seconds. All files are in the codebase.**

---

## TASK 1: Verify Librarian MCP Build

1. Navigate to `librarian-mcp/`
2. Run `npx tsc` — should compile with zero errors
3. Run `node dist/indexer/buildIndex.js` — should complete in ~30s
4. Verify output:
   - 580+ tables, 139+ functions, 469+ pages
   - 29 domains mapped
   - 84 letters indexed
   - v2 migration: 168 source files, 3/23 audited
5. Verify the MCP server starts: `node dist/server.js` (stdio mode — will hang waiting for MCP client)

**If anything fails, check the TypeScript source files Bishop modified:**
- `src/types.ts` — added V2MigrationIndex, LetterIndex, V2DomainStatus, LetterEntry
- `src/indexer/parseV2.ts` — NEW: v2 scaffold parser
- `src/indexer/parseLetters.ts` — NEW: letter status parser
- `src/indexer/buildIndex.ts` — added steps 12/13 for v2 + letters
- `src/indexer/parseContext.ts` — fixed canonical extraction
- `src/indexer/domainMapper.ts` — added 7 domains
- `src/server.ts` — added tools 21-23, V2MigrationIndex/LetterIndex imports

---

## TASK 2: Sync DB Canonical Stats

Update `platform_canonical` table in Supabase to match current reality:

```sql
-- Innovation count: 2129 (AI Nanny #2129, added B054)
UPDATE platform_canonical SET value = 2129 WHERE key = 'innovation_count';

-- Crown jewels: 167 (164 + 3 from B052)
UPDATE platform_canonical SET value = 167 WHERE key = 'crown_jewels';

-- Patent applications: 10 FILED (Prov 11 NOT filed)
UPDATE platform_canonical SET value = 10 WHERE key = 'patent_applications';

-- Patent claims: 2097
UPDATE platform_canonical SET value = 2097 WHERE key = 'patent_claims';

-- Production systems: 35
UPDATE platform_canonical SET value = 35 WHERE key = 'production_systems';

-- Dirty dozen green: 11
UPDATE platform_canonical SET value = 11 WHERE key = 'dirty_dozen_green';

-- Pudding articles: 26
UPDATE platform_canonical SET value = 26 WHERE key = 'pudding_articles';

-- Academic papers: 30
UPDATE platform_canonical SET value = 30 WHERE key = 'academic_papers';

-- Knight sessions: 204
UPDATE platform_canonical SET value = 204 WHERE key = 'knight_sessions';

-- Bishop sessions: 56
UPDATE platform_canonical SET value = 56 WHERE key = 'bishop_sessions';

-- Pawn batches: 29
UPDATE platform_canonical SET value = 29 WHERE key = 'pawn_batches';
```

If the `platform_canonical` table doesn't have these rows, INSERT them:

```sql
INSERT INTO platform_canonical (key, value) VALUES
  ('innovation_count', 2129),
  ('crown_jewels', 167),
  ('patent_applications', 10),
  ('patent_claims', 2097),
  ('production_systems', 35),
  ('dirty_dozen_green', 11),
  ('pudding_articles', 26),
  ('academic_papers', 30),
  ('knight_sessions', 204),
  ('bishop_sessions', 56),
  ('pawn_batches', 29)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## TASK 3: Deploy Platform with Updated Defaults

The `useCanonicalStats.ts` defaults were updated by Bishop:
- innovationCount: 2128 → 2129
- patentApplications: 11 → 10
- dirtyDozenGreen: 5 → 11
- puddingArticles: 23 → 26
- academicPapers: 7 → 30
- knightSessions: 195 → 204
- bishopSessions: 49 → 56
- pawnBatches: 28 → 29

Deploy the platform:
```bash
cd platform && npm run build && firebase deploy --only hosting:main -P default
```

---

## VERIFICATION

After all tasks, run `brief_me("verify librarian v2")` and confirm:
- Innovation count shows 2129
- 29 domains listed
- Letters index available
- v2 migration tracker available

---

*Bishop B056 — Librarian V2 Deploy*
*3 new tools. 7 new domains. 84 letters tracked.*
*FOR THE KEEP!*
