# K343: Source-Linking Integration — Wire Archive to Platform
# Priority: HIGH — closes the gap between cataloged archive content and discoverable platform surfaces
# Bishop: B084 | Date: 2026-04-06

## THE PROBLEM

B083 excavated 52,145 archive files, organized 2,238 Upekrithen-Trunk files, extracted 61 innovations, and wrote 22 puddings + 3 papers + 6 letters. K341 comprehension-passed 9,270 files. But none of this content is **linked** through the platform. The innovations exist as DB rows. The archive exists as files on disk. The puddings describe concepts. Nothing connects back to the source.

A member browsing innovation #2183 (Senate Virtual Complex) cannot discover that it came from `SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md`. A reader of Pudding #169 (SCaaS) cannot link to the source innovation or the founding document. The Galactic Empire creative content, the Sacred Texts, the Founder's handwritten notes — all of it is invisible to the platform.

## OBJECTIVE

Build the source-linking layer that connects:
- **Innovation → Source Documents** (where the idea came from)
- **Pudding → Innovation(s)** (what innovations a pudding explains)
- **Paper → Innovation(s)** (what innovations a paper formalizes)
- **Compiled Document → Innovation(s)** (what innovations a family covers)
- **Innovation → Cephas Concept** (bidirectional link to knowledge base)

## PHASE 1: SCHEMA (Migration)

### 1a. Add source_documents to innovation_log

```sql
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS source_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS source_session TEXT;
-- source_documents format: [{"path": "Upekrithen-Trunk/SACRED_TEXTS/...", "section": "lines 155-161", "type": "founding_document"}]

CREATE INDEX IF NOT EXISTS idx_innovation_log_source_docs
ON innovation_log USING gin (source_documents);
```

### 1b. Add innovation_refs to cephas_puddings (already has innovations_referenced but it's empty)

```sql
-- innovations_referenced column already exists as INTEGER[]
-- Just needs backfill — see Phase 3
```

### 1c. Create cross-reference table for many-to-many linking

```sql
CREATE TABLE IF NOT EXISTS content_source_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Source side
  source_type TEXT NOT NULL CHECK (source_type IN ('archive_file', 'compiled_document', 'upekrithen_trunk', 'founding_document')),
  source_path TEXT NOT NULL,
  source_section TEXT, -- optional: "lines 155-161" or section heading

  -- Target side
  target_type TEXT NOT NULL CHECK (target_type IN ('innovation', 'pudding', 'paper', 'letter', 'cephas_concept')),
  target_id TEXT NOT NULL, -- innovation_number, pudding_number, paper slug, etc.

  -- Metadata
  link_type TEXT DEFAULT 'derived_from' CHECK (link_type IN ('derived_from', 'describes', 'formalizes', 'references', 'implements')),
  confidence TEXT DEFAULT 'high' CHECK (confidence IN ('high', 'medium', 'low')),
  bishop_session TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(source_path, target_type, target_id)
);

CREATE INDEX idx_content_source_links_target ON content_source_links (target_type, target_id);
CREATE INDEX idx_content_source_links_source ON content_source_links (source_path);

-- RLS
ALTER TABLE content_source_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read content_source_links" ON content_source_links FOR SELECT USING (true);
CREATE POLICY "Auth insert content_source_links" ON content_source_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## PHASE 2: BACKFILL innovation_log.source_documents (B083 innovations)

Use the mapping from `BISHOP_DROPZONE/UPEKRITHEN_TRUNK_DEEP_PARSE_FINDINGS_B084.md` and `BISHOP_DROPZONE/INNOVATION_TO_UPEKRITHEN_TRUNK_MAPPING_B083.md` to populate source_documents for the 61 B083 innovations (#2162-#2222).

Key mappings (from the deep parse findings):

| Innovation | Source Document |
|-----------|----------------|
| #2162 Company Island | HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md, lines 46-100 |
| #2164 Guild Tokens | HEXISLE_CREATIVE/Lore/THE GALACTIC EMPIRE OF LIANA BANYAN.md, line 118 |
| #2165 Board Game Lobby | SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md (Agora pattern) |
| #2169 Polka-Dot Metatag | SACRED_TEXTS/SECRET_PLANS/ (IP protection docs) |
| #2170 Gamified IDE Labyrinth | SACRED_TEXTS/THE LABYRINTH - PROGRAMMING COMPLEX.docx |
| #2174 Chronicle Keeper | SACRED_TEXTS/THE CHRONICLER'S HALL & BOAZ PRINCIPLE.md, lines 220-278 |
| #2176 SCaaS | SACRED_TEXTS/STAR CHAMBER AS A SERVICE (SCaaS).docx |
| #2183 Senate Virtual Complex | SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md |
| #2184 Patent Priority Voting | SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md, lines 155-161 |
| #2185 Defense Klaus Alert | SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md, lines 62-116 |
| #2186 Passive Anomaly Detection | SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md, lines 32-57 |
| #2187 Blast Door Architecture | SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md, lines 15-29 |
| #2188 Spite Vote | SACRED_TEXTS/GrandMaster_Blueprint_01.md + LUDICROUS_SPEED_CHRONICLE_MASTER.md |
| #2189 Steward Director | MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md, lines 161-165 |
| #2190 Castle Dev Ecosystem | SACRED_TEXTS/THE CASTLE -TURNKEY DEVELOPER ECOSYSTEM.docx |
| #2192 Universal Circuit Redundancy | MASTERS_ACADEMIC/Liana Banyan Business Plan Final Corrected.md, lines 160-161 |
| #2194 Boaz Rewards | SACRED_TEXTS/THE CHRONICLER'S HALL & BOAZ PRINCIPLE.md, lines 381-399 |
| #2195 Seven Hiring Models | HEXISLE_CREATIVE/Lore/HEXISLE - THE COMPLETE GAMIFICATION.md, lines 206-278 |
| #2197 Multi-Vendor Food | FOUNDERS_LORE/48HoursNotes (converted) |
| #2199 Castle Floor Expansion | FOUNDERS_LORE/186KHandwrittenNotes (converted) |
| #2200 Skittles Spell | FOUNDERS_LORE/186KHandwrittenNotes (converted) |
| #2201 Banyan Spore Growth | FOUNDERS_LORE/186KHandwrittenNotes (converted) |
| #2202 Ambassador QR | FOUNDERS_LORE/186KHandwrittenNotes (converted) |
| #2203 Medallion Cascade | FOUNDERS_LORE/186KHandwrittenNotes (converted) |
| #2212 Wave-Based Pricing | ECONOMIC_PHILOSOPHY/ (pricing models) |
| #2222 BandWagon | FOUNDERS_JOURNALS/ (core loop analysis) |

For innovations where the exact source is unclear, use `source_session: "B083"` and leave source_documents as `[]` — Bishop will backfill later from the K341 comprehension data.

## PHASE 3: BACKFILL pudding innovations_referenced

Update the 22 B083 puddings to link to their parent innovations:

```sql
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2179] WHERE pudding_number = 160; -- Ratchet -> Credits one-way valve
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2167] WHERE pudding_number = 161; -- Castle -> Living Castle
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2165] WHERE pudding_number = 162; -- Board Game Lobby
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2166] WHERE pudding_number = 163; -- Red Queen -> AI assistant
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2217] WHERE pudding_number = 164; -- Portal Doors -> Access Gating
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2221] WHERE pudding_number = 165; -- Flywheel
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2170] WHERE pudding_number = 166; -- Labyrinth -> Gamified IDE
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2216] WHERE pudding_number = 167; -- Project Seed -> Maturity System
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2167, 2168, 2199] WHERE pudding_number = 168; -- Build Your Kingdom -> Castle + Marketplace + Expansion
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2176] WHERE pudding_number = 169; -- SCaaS
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2220] WHERE pudding_number = 170; -- Compensation Slider
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2174] WHERE pudding_number = 171; -- Chronicle Keeper
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2194] WHERE pudding_number = 172; -- Leave the Corners -> Boaz Rewards
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2175] WHERE pudding_number = 173; -- Campaign to Novel
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2204] WHERE pudding_number = 174; -- Montana Principle -> Manufacturing Hubs
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2179] WHERE pudding_number = 175; -- Birthright -> Marks Redemption
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2171, 2172] WHERE pudding_number = 176; -- Daily Mazes -> Code Challenges + Team Raids
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2218, 2219] WHERE pudding_number = 177; -- Island Rules -> Ownership + Governance
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2162] WHERE pudding_number = 178; -- 20% Rule -> Company Island
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2198] WHERE pudding_number = 179; -- Drink Cookbook -> Progressive Pricing
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2212] WHERE pudding_number = 180; -- Wave Pricing -> Impatience Tax
UPDATE cephas_puddings SET innovations_referenced = ARRAY[2222] WHERE pudding_number = 181; -- BandWagon
```

## PHASE 4: CONTENT SOURCE LINKS (cross-reference table seed)

Insert high-confidence links from the deep parse findings into `content_source_links`. This creates the bidirectional web:

```sql
-- Example pattern (Knight generates all rows from the mapping docs):
INSERT INTO content_source_links (source_type, source_path, source_section, target_type, target_id, link_type, confidence, bishop_session)
VALUES
  ('upekrithen_trunk', 'SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'full document', 'innovation', '2183', 'derived_from', 'high', 'B084'),
  ('upekrithen_trunk', 'SACRED_TEXTS/SECRET_PLANS/THE_SENATE_ARCHITECTURE.md', 'lines 155-161', 'innovation', '2184', 'derived_from', 'high', 'B084'),
  ('upekrithen_trunk', 'SACRED_TEXTS/SECRET_PLANS/DEFENSE_KLAUS_FAMILY_TABLE_INTEGRATION.md', 'lines 62-116', 'innovation', '2185', 'derived_from', 'high', 'B084'),
  -- ... Knight generates all rows from UPEKRITHEN_TRUNK_DEEP_PARSE_FINDINGS_B084.md
  -- ... and from INNOVATION_TO_UPEKRITHEN_TRUNK_MAPPING_B083.md
ON CONFLICT (source_path, target_type, target_id) DO NOTHING;
```

## PHASE 5: UI SURFACE (Innovation Detail Page)

On the Innovation detail view (if one exists, or create a component), render:
- **Source Documents**: List of archive paths with readable labels
- **Related Puddings**: Query cephas_puddings WHERE innovation_number = ANY(innovations_referenced)
- **Related Papers**: Query cephas_content_registry WHERE category = 'academic_paper' AND content references this innovation
- **Crown Jewel badge**: If is_crown_jewel = true

### Component: `InnovationSourceLinks.tsx`
```tsx
// Reads from content_source_links WHERE target_type = 'innovation' AND target_id = innovation_number
// Displays source documents grouped by source_type
// Links to compiled_documents where family_name matches
```

## PHASE 6: COMPILED DOCUMENTS BRIDGE

The `compiled_documents` table already has `source_files` (JSONB) and `family_name`. Wire it:

1. For each compiled_documents entry, extract innovation numbers mentioned in `compiled_markdown`
2. Insert corresponding `content_source_links` rows linking compiled_document → innovation
3. On the Cephas article/pudding pages, show "Source Material" section linking to the compiled_document family

## VALIDATION

After all phases:
1. Query: `SELECT count(*) FROM innovation_log WHERE source_documents != '[]'::jsonb` — should be > 0 for B083 innovations
2. Query: `SELECT count(*) FROM cephas_puddings WHERE innovations_referenced != '{}'` — should be 22 for B083 puddings
3. Query: `SELECT count(*) FROM content_source_links` — should have entries for all mapped relationships
4. UI: Innovation detail page shows source documents and related content
5. Build: `npm run build` passes

## REFERENCE DOCUMENTS

- `BISHOP_DROPZONE/UPEKRITHEN_TRUNK_DEEP_PARSE_FINDINGS_B084.md` — 44 findings with exact source paths
- `BISHOP_DROPZONE/INNOVATION_TO_UPEKRITHEN_TRUNK_MAPPING_B083.md` — 2,161 innovations mapped to 11 trunk categories
- `librarian-mcp/stitchpunks/data/K341_EXEC_SUMMARY.json` — comprehension pass results with per-file innovation refs
- `librarian-mcp/stitchpunks/data/content_archive_index.json` — 1,146 compiled families

## NOTES

- Phase 1-4 are database/data work. Phase 5-6 require React components.
- If this is too large for one Knight session, split: K343a (schema + backfill, Phases 1-4), K343b (UI + compiled bridge, Phases 5-6).
- The `content_source_links` table is the backbone. Everything else reads from it.
- DO NOT duplicate data — link by reference (paths, IDs), not by copying content.
