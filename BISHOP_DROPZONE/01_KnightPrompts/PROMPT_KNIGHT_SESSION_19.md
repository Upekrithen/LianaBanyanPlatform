# KNIGHT SESSION 19 — Cephas Document Deployment + Under the Hood + Fly on the Wall

## Mission
Deploy ALL platform documents to Cephas in a searchable, categorized format. Academic papers get clean prose styling. Everything else gets pudding styles (interactive scrollytelling). ALL documents must also be referenced in Under the Hood (technical transparency) and Fly on the Wall (public observation log).

## Context
Bishop Session 12 completed a full deep read of all 7 directory tiers (601+ documents across 6 primary directories). Every document is now cataloged. This session deploys them all to Cephas.

## Prerequisites
- Migrations 000001-000019 all live on Supabase remote
- Platform running at `LianaBanyanPlatform/platform/`
- All academic papers restored (8 corrupted files fixed in Session 12)

---

## PART 1: DOCUMENT CATEGORIES FOR CEPHAS

### Category A: Academic Papers (CLEAN PROSE — NO pudding styles)
**Source:** `academic-papers/`
**Style:** Clean academic formatting. No flipblock shortcodes, no scrollytelling. Proper citations, formal structure.
**Searchable:** Yes — full-text indexed

| Paper | Versions Available |
|-------|-------------------|
| Marks-Based Democratic Participation | Academic + TLDR + 6th Grade |
| Muffled Rule: Architectural Civility | Academic + TLDR + 6th Grade |
| Grassroots Intelligence | Academic + TLDR + 6th Grade |
| Attention as Funding | Academic + TLDR + 6th Grade |
| Historical Influence Value Index (HIVI) | Academic + TLDR |
| Three-Gear Currency | TLDR (Hugo flipblock format) |
| Boaz Principle / Generosity Potential | Academic + TLDR |
| Ghost Credits / Demand Validation | TLDR |
| Anti-Extractive Derivative | TLDR |
| IP Load Balancing | Academic |
| Patent Sponsorship Model | Academic |
| Nine Laws of Interaction Dynamics | Academic |
| Simultaneous Pricing | Academic |
| Sustained Prosperity | Academic |
| Twenty Laws of C+20 | Academic |
| Cold Start / Theseus | Academic |
| Inception Principle | Academic |
| Book of Peace Mechanics | Academic |
| Core System Architectures | Academic |
| HexIsle: It's Not Ambitious | Academic |
| 300 Framework | TLDR |
| Automated Trust / Harper System | Academic |
| Margin Sacrifice / Mutual Credit | Academic |
| Academic Paper Final (securities law) | Academic |
| Complete Bibliography | Reference |
| Publication Package | Reference |
| Publishing Targets | Reference |

**Also in BISHOP_DROPZONE (additional paper versions):**
- Papers 1-5 full drafts (Lighthouse Ladder, Invisible Temperament, Self-Funding Economics, Portable Reputation, Contingency Operators)
- ROI Predictability V1-V3
- XP Score System Academic
- PAPERS_CONVERSATIONAL/ — 7 college freshman versions
- PAPERS_SIMPLE/ — 7 sixth-grade versions
- HUMANIZED_FINAL/ — 7 humanized versions + 3 articles

### Category B: Crown Letters & Outreach (PUDDING STYLES)
**Source:** `01 MarkupFiles/` + `BISHOP_DROPZONE/`
**Style:** Interactive scrollytelling with pudding styles. Each letter gets its own page.
**Searchable:** Yes — by recipient name, role, initiative

**Master registries (deploy as navigation/index pages):**
- 00_CROWN_LETTERS_INDEX.md
- 00_CROWN_LETTER_PACKAGES_MASTER_REGISTRY.md
- 00_MASTER_LETTER_REGISTRY.md
- ALL_187_LETTERS_POST_PAWN_FIXES.md

**Individual Crown Letters (~47 unique recipients):**
Deploy the LATEST/CANONICAL version of each. Key recipients:
- MacKenzie Scott ("Cardboard Boots" — Board Chair)
- Warren Buffett (multiple versions — use V03 CORRECTED or FRENCH FLEET FINAL)
- Melinda French Gates (use V03 FINAL WITH)
- Sal Khan (use FINAL or VERSION_C — Chancellor)
- Michael Seibel (CEO — use FINAL)
- Tom Simon (CFO — use highest numbered version, 007)
- Craig Newmark (use V4 DRAFT or latest LOCKED)
- Dale Dougherty (Industry Chancellor / Lord Banyan of the Forge — use FINAL)
- Jessica Jackley (use V05)
- Taylor Swift (use V04 CROWN)
- Jose Andres, Dolly Parton, Pitbull, Jimmy Kimmel, Maneet Chauhan, Keanu Reeves, etc.
- ALL partnership letters: Bambu Lab, ForgeCore/Colby, Slant3D, Kallistra, TerraTiles, Lorescape, OpenWarHex

**Outreach Letters (LETTER- series):**
Deploy latest version of each. ~30+ unique recipients including:
- Bill Gates (+ HOLD variant)
- Cory Doctorow, Nathan Schneider, Trebor Scholz, Erik Brynjolfsson
- Casey Newton, Ezra Klein, Kara Swisher, Nilay Patel
- Hank Green, Seth Godin, Simon Sinek
- Kate Raworth, Mariana Mazzucato, Daron Acemoglu

**Public Open Letters:**
- Warren Buffett public open letter
- MacKenzie Scott public open letter
- Canada 40K appeal + cue card
- Join the 300 USS Liana Banyan

### Category C: System Design Documents (PUDDING STYLES)
**Source:** `BISHOP_DROPZONE/` + `docs/`
**Style:** Interactive scrollytelling with expandable sections

| Document | Source |
|----------|--------|
| BandWagon Design Document | BISHOP_DROPZONE |
| Steward/Pizza Oven Design Document | BISHOP_DROPZONE |
| Co-Role Templates Spec | BISHOP_DROPZONE |
| MoneyPenny Virtual Assistant Spec | BISHOP_DROPZONE |
| Patriotic Interdependentalist Page Spec | BISHOP_DROPZONE |
| Temperament Weighting Spec | BISHOP_DROPZONE |
| Vault Resilience & Governance Spec | BISHOP_DROPZONE |
| Bounty Display Pattern | docs/ |
| Make A Name For Yourself System | docs/ |
| Voting Credit System Spec | docs/ |
| Supabase Email Templates | docs/ |
| Supabase Environment Strategy | docs/ops/ |
| Supabase Failover Plan | docs/ops/ |
| Essential Videos Plan | docs/videos/ |

### Category D: Initiative Content (PUDDING STYLES)
**Source:** `BISHOP_DROPZONE/INITIATIVE_CONTENT_*`
**Style:** Each initiative gets a dedicated page with pudding-style interactive elements

| Initiative | File |
|-----------|------|
| Defense Klaus | INITIATIVE_CONTENT_DEFENSE_KLAUS.md |
| Didasko | INITIATIVE_CONTENT_DIDASKO.md |
| Harper Guild | INITIATIVE_CONTENT_HARPER_GUILD.md |
| JukeBox | INITIATIVE_CONTENT_JUKEBOX.md |
| Let's Get Groceries | INITIATIVE_CONTENT_LETS_GET_GROCERIES.md |
| Let's Go Shopping | INITIATIVE_CONTENT_LETS_GO_SHOPPING.md |
| Let's Make Bread | INITIATIVE_CONTENT_LETS_MAKE_BREAD.md |
| Let's Make Dinner | INITIATIVE_CONTENT_LETS_MAKE_DINNER.md |
| Lifeline Medications | INITIATIVE_CONTENT_LIFELINE_MEDICATIONS.md |
| Rally Group | INITIATIVE_CONTENT_RALLY_GROUP.md |
| VSL | INITIATIVE_CONTENT_VSL.md |
| Initiative 15 (all candidates) | INITIATIVE_15_ALL_THREE_CANDIDATES.md |

Cross-reference with SWEET_SIXTEEN_CANONICAL.md for the authoritative list of all 16 initiatives.

### Category E: Innovation & Patent Documentation (PUDDING STYLES)
**Source:** `BISHOP_DROPZONE/`
**Style:** Searchable innovation registry with expandable detail cards

| Document | Purpose |
|----------|---------|
| INNOVATION_DATA_54_TO_150.md | Innovation details batch |
| INNOVATION_DOCUMENTATION_F1_F8.md | Filed innovations |
| BATCH_8_INNOVATIONS_INTEGRATED.md | Latest batch |
| PATENT_BAG_CANONICAL_MAPPING.md | Bag-to-claim mapping |
| PATENT_VS_IMPLEMENTATION_AUDIT.md | Implementation status |
| SINGLE_PROVISIONAL_FILING_PREP.md | Filing preparation |

### Category F: HexIsle / Gaming Content (PUDDING STYLES)
**Source:** `BISHOP_DROPZONE/` + `Asteroid-ProofVault/`
**Style:** Richly illustrated interactive pages

| Document | Content |
|----------|---------|
| Expanded Fable Arc | Founder's vision for fable series |
| Unified Fable Arc Production Scripts | Complete production scripts |
| Unified Fable Visual World | Visual worldbuilding |
| Scripts 08-10 (Little Red Hen, Grasshopper & Ants, Stone Soup) | Individual fable scripts |
| Kickstarter Creative Direction | Campaign strategy |
| INSTAGRAM_FACTORY_CREATORS_COMPLETE.md | 47 creator profiles |
| HexIsle Hall of Records 3D | From SECRET_PLANS |
| Tereno Hydraulic Gaming System | Technical spec |

### Category G: Articles & Thought Leadership (PUDDING STYLES)
**Source:** `BISHOP_DROPZONE/` + `01 MarkupFiles/`
**Style:** Magazine-style layout with pull quotes and callouts

| Article | Topic |
|---------|-------|
| Ambassador of the Quan | Origin story |
| Not Left or Right, Forward | Political philosophy |
| Ruprecht Is the New Quan | Cultural reference |
| Canada 40K Rescue Fleet | International expansion |
| Aircraft Carrier Article | Patent portfolio metaphor |
| Star Chamber SaaS series (4 parts) | SCaaS concept |
| How Liana Banyan Uses AI (humanized) | AI transparency |
| The Midas Touch (humanized) | Economics narrative |
| Why Code Breakers Matter (humanized) | Innovation narrative |

### Category H: Vault Archives (PUDDING STYLES — historical reference)
**Source:** `Asteroid-ProofVault/A_CLAUDE_VAULT_REFINED/` + `7Holy/`
**Style:** Archive browsing interface with search

Key documents to surface:
- Liana Banyan Origin Story
- The Galactic Empire of Liana Banyan
- Star Chamber Advisory Council Handover
- Star Chamber as a Service (SCaaS)
- The Castle: Turnkey Developer Ecosystem
- The Labyrinth: Programming Complex
- The Chronicler's Hall & Boaz Principle
- Master Blueprint 034
- Ludicrous Speed Chronicle
- Defense Klaus + Family Table Integration (SECRET_PLANS)
- The Senate Architecture (SECRET_PLANS)
- Economics of Reciprocity article
- THE 300 Strategic Allies Complete

---

## PART 2: UNDER THE HOOD REFERENCES

Every document deployed to Cephas MUST have a corresponding Under the Hood entry. Under the Hood is the technical transparency layer — it shows HOW things work.

### Implementation

Create a `under_the_hood` metadata field on each Cephas document entry:

```typescript
interface UnderTheHoodRef {
  document_id: string;
  technical_summary: string;      // 1-2 sentence technical explanation
  innovation_ids: string[];       // e.g., ["MDP-001", "MDP-002"]
  related_patents: string[];      // USPTO application numbers
  system_components: string[];    // e.g., ["coverage_minutes", "round_table"]
  implementation_status: 'live' | 'planned' | 'in_development';
}
```

### Mapping Rules
- Academic papers → link to their innovation IDs and relevant patent bags
- Crown letters → link to the initiative(s) they reference
- System design docs → link to the database tables/functions they describe
- Initiative content → link to the SWEET_SIXTEEN_CANONICAL entry
- Innovation docs → link directly to USPTO provisional application numbers

---

## PART 3: FLY ON THE WALL REFERENCES

Every document deployed to Cephas MUST have a Fly on the Wall entry. Fly on the Wall is the public observation log — it shows the HISTORY of how decisions were made.

### Implementation

Create a `fly_on_the_wall` metadata field:

```typescript
interface FlyOnTheWallRef {
  document_id: string;
  creation_context: string;       // When/why this was created
  revision_history: string[];     // Key revision notes
  bishop_session: string;         // Which Bishop session touched it
  knight_session: string;         // Which Knight session deployed it
  decision_log: string[];         // Key decisions made about this document
}
```

### Mapping Rules
- Track which AI session created/modified each document
- Note any Founder directives that shaped the document
- Reference any Pawn prior art screening results
- Link to relevant handoff documents that provide context

---

## PART 4: CEPHAS CONTENT PIPELINE

### Step 1: Create Content Registry Table

```sql
-- Migration 000020
CREATE TABLE cephas_content_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'academic_paper', 'crown_letter', 'outreach_letter', 'open_letter',
    'system_design', 'initiative', 'innovation', 'hexisle',
    'article', 'vault_archive', 'reference'
  )),
  subcategory TEXT,
  source_path TEXT NOT NULL,
  content_markdown TEXT,
  style TEXT NOT NULL CHECK (style IN ('clean_academic', 'pudding')),
  version TEXT DEFAULT '1.0',

  -- Under the Hood
  technical_summary TEXT,
  innovation_ids TEXT[],
  related_patents TEXT[],
  system_components TEXT[],
  implementation_status TEXT DEFAULT 'planned',

  -- Fly on the Wall
  creation_context TEXT,
  revision_history TEXT[],
  bishop_session TEXT,
  knight_session TEXT,
  decision_log TEXT[],

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(technical_summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content_markdown, '')), 'C')
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cephas_search ON cephas_content_registry USING gin(search_vector);
CREATE INDEX idx_cephas_category ON cephas_content_registry(category);
CREATE INDEX idx_cephas_style ON cephas_content_registry(style);
```

### Step 2: Build Content Ingestion Script

Create a script that reads each markdown file, extracts frontmatter, and inserts into the registry. For files without frontmatter, generate metadata from filename conventions:
- `PAPER_*` → category: academic_paper, style: clean_academic
- `CROWN_LETTER_*` → category: crown_letter, style: pudding
- `LETTER_*` / `LETTER-*` → category: outreach_letter, style: pudding
- `INITIATIVE_CONTENT_*` → category: initiative, style: pudding
- `INNOVATION_*` → category: innovation, style: pudding
- `ARTICLE_*` → category: article, style: pudding
- `SPEC_*` → category: system_design, style: pudding

### Step 3: Build Cephas Routes

```
/cephas/papers/          → Academic paper listing (clean prose)
/cephas/papers/:slug     → Individual paper (clean prose)
/cephas/letters/         → Crown letter & outreach listing
/cephas/letters/:slug    → Individual letter (pudding)
/cephas/systems/         → System design docs
/cephas/systems/:slug    → Individual system doc (pudding)
/cephas/initiatives/     → Initiative content
/cephas/initiatives/:slug → Individual initiative (pudding)
/cephas/innovations/     → Innovation registry (searchable)
/cephas/hexisle/         → HexIsle content
/cephas/articles/        → Articles & thought leadership
/cephas/vault/           → Vault archive browser
/cephas/search           → Full-text search across all content
/cephas/under-the-hood   → Technical transparency index
/cephas/fly-on-the-wall  → Public observation log
```

### Step 4: Pudding Style Components

Build reusable pudding-style components for non-academic content:
- `<ScrollySection>` — scrollytelling with sticky graphics
- `<FlipCard>` — interactive reveal cards (similar to Hugo flipblock)
- `<PullQuote>` — highlighted founder quotes
- `<InnovationCard>` — expandable innovation detail with patent link
- `<TimelineEntry>` — chronological decision/revision display
- `<InitiativeCard>` — Sweet Sixteen initiative display with status
- `<LetterHeader>` — Crown letter recipient info with role badge

### Step 5: Clean Academic Components

For papers only:
- `<AcademicHeader>` — title, author, date, innovation IDs
- `<AbstractBlock>` — highlighted abstract
- `<CitationBlock>` — proper citation formatting
- `<InnovationClaimList>` — numbered claim list
- `<VersionToggle>` — switch between Academic / TLDR / 6th Grade versions

---

## PART 5: DEPLOYMENT CHECKLIST

- [ ] Create migration 000020 (cephas_content_registry table)
- [ ] Build content ingestion script
- [ ] Ingest all Category A documents (academic papers — clean prose)
- [ ] Ingest all Category B documents (crown letters — pudding)
- [ ] Ingest all Category C documents (system design — pudding)
- [ ] Ingest all Category D documents (initiative content — pudding)
- [ ] Ingest all Category E documents (innovation docs — pudding)
- [ ] Ingest all Category F documents (HexIsle — pudding)
- [ ] Ingest all Category G documents (articles — pudding)
- [ ] Ingest all Category H documents (vault archives — pudding)
- [ ] Build Cephas route structure
- [ ] Build pudding style components
- [ ] Build clean academic components
- [ ] Build full-text search
- [ ] Build Under the Hood index page
- [ ] Build Fly on the Wall log page
- [ ] Populate Under the Hood metadata for all documents
- [ ] Populate Fly on the Wall metadata for all documents
- [ ] Wire version toggle for multi-version papers
- [ ] Test search across all categories
- [ ] Deploy to Firebase

---

## PART 6: CONTENT COUNT SUMMARY

| Category | Document Count | Style |
|----------|---------------|-------|
| Academic Papers | ~60 (including all versions) | Clean Academic |
| Crown Letters | ~50 unique recipients | Pudding |
| Outreach Letters | ~35 unique recipients | Pudding |
| Open Letters | ~5 | Pudding |
| System Design | ~14 | Pudding |
| Initiative Content | ~12 | Pudding |
| Innovation Docs | ~10 | Pudding |
| HexIsle/Gaming | ~10 | Pudding |
| Articles | ~15 | Pudding |
| Vault Archives | ~30 key documents | Pudding |
| **TOTAL** | **~241 unique documents** | Mixed |

---

## NOTES FROM BISHOP SESSION 12

- Founder directive: "ALL documents should be in Cephas searchable with pudding styles EXCEPT papers. AND in Under the Hood AND Fly on the Wall."
- Papers get clean academic prose, no pudding styles
- Every other category gets pudding styles (interactive scrollytelling)
- Full-text search is mandatory across all categories
- Under the Hood = technical transparency (HOW it works)
- Fly on the Wall = observation log (HOW decisions were made)
- Eight corrupted files were restored during Session 12 — all papers now intact
- 1,662 innovations total as of Session 11B continued
- Six USPTO provisional applications filed

---

*Generated by Bishop Session 12 — March 14, 2026*
*For Knight (Cursor) execution*
