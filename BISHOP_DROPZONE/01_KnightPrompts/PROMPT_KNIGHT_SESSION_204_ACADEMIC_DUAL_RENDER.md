# KNIGHT SESSION 204 — Dual-Render Publication Layout
## Priority: HIGH — Academics judge credibility by presentation before reading a word
## Bishop B053
## Depends on: K203 (mobile fixes), K202 (Red Carpet DB)
## Innovation: #2128 Dual-Render Publication System

---

## CONTEXT

Liana Banyan has **~160 distinct publications** across 6 categories: academic papers (~30), Cephas articles (12), Pudding articles (26), standalone articles (17), business plans (2), and 73 A&A formal innovation documents. They all render through the same generic `CephasContentDetailPage.tsx` — a markdown renderer with no author attribution, no abstract block, no citations, no PDF download, no related publications.

When Julian Posada at Yale or Erik Brynjolfsson at Stanford clicks a link to "The $5 Career," they need to see something that signals serious scholarship — not a blog post. When a family member clicks the same link from a Cue Card, they need the three-level progressive disclosure (Skipping Stones / Wading In / Deep Dive) that makes complex ideas accessible.

**Solution:** Dual-render. Same content, two presentation modes. Toggle between them.

---

## TASK 1: AcademicPaperLayout Component

**New file:** `platform/src/components/cephas/AcademicPaperLayout.tsx`

This is the "Stanford mode" — clean, institutional, credible.

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to [Category]                     [Member View]  │
│                                                          │
│  LIANA BANYAN CORPORATION                                │
│  Working Paper Series                                    │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  The $5 Career: How a Cooperative Platform               │
│  Makes Full Employment Possible at Scale                 │
│                                                          │
│  Jonathan Jones                                          │
│  Founder & General Manager, Liana Banyan Corporation     │
│  March 2026                                              │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ABSTRACT                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ This paper examines how a worker-owned cooperative │  │
│  │ platform with $5/year membership and 83.3% creator │  │
│  │ retention can generate sustainable employment...   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [📄 Download PDF]  [📋 Cite This Paper]  [🔗 Share]    │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  BODY TEXT                                               │
│  (serif font, proper margins, academic spacing)          │
│  (footnotes rendered as superscript numbers)             │
│  (figures with captions)                                 │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  CITATION                                                │
│  Jones, J. (2026). The $5 Career: How a Cooperative     │
│  Platform Makes Full Employment Possible at Scale.       │
│  Liana Banyan Working Paper Series, WP-2026-07.         │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  RELATED PUBLICATIONS                                    │
│  • Accounts Payable & Eligible Marks                     │
│  • How to Bake an AI Cake                                │
│  • Compounding Innovation Velocity                       │
│  • WaterWheels                                           │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ABOUT THE AUTHOR                                        │
│  Jonathan Jones is a U.S. Army veteran and founder of    │
│  Liana Banyan Corporation, a worker-owned cooperative... │
│                                                          │
│  ABOUT LIANA BANYAN                                      │
│  {{innovationCount}} innovations · {{patentCount}}       │
│  patent applications · $5/year · 83.3% creator split     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Props

```typescript
interface AcademicPaperLayoutProps {
  title: string;
  subtitle?: string;
  author?: string;           // Default: "Jonathan Jones"
  authorTitle?: string;      // Default: "Founder & General Manager, Liana Banyan Corporation"
  date?: string;             // e.g., "March 2026"
  paperNumber?: string;      // e.g., "WP-2026-07"
  abstract?: string;         // First paragraph or explicit abstract field
  category?: string;         // paper, article, pudding, formal
  innovationNumbers?: number[];
  relatedSlugs?: string[];   // Slugs of related publications
  children: React.ReactNode; // The actual content
}
```

### Typography
- **Title:** `font-family: 'Crimson Pro', Georgia, serif` — 2rem, weight 700
- **Author/date:** `font-family: 'Source Sans 3', sans-serif` — 0.95rem, weight 400, muted
- **Abstract:** Indented block, lighter background, italic
- **Body:** `font-family: 'Crimson Pro', Georgia, serif` — 1.05rem, line-height 1.8, max-width 680px
- **Headings in body:** `font-family: 'Source Sans 3', sans-serif` — weight 600
- **Citations/footnotes:** 0.85rem, numbered superscripts

### PDF Download
Use `html2canvas` + `jsPDF` (already in dependencies from K200 Printable Cue Cards) to generate a clean PDF of the paper content. Strip interactive elements, render at print resolution.

### Citation Generator
Auto-generate APA citation from metadata:
```
Jones, J. (2026). {title}. Liana Banyan Working Paper Series, {paperNumber}.
```
Copy-to-clipboard button.

### Share
Standard share links: copy URL, LinkedIn, Twitter/X, email.

---

## TASK 2: View Toggle on CephasContentDetailPage

**Modify:** `platform/src/pages/CephasContentDetailPage.tsx`

Add a toggle button in the top-right corner:

```tsx
const [viewMode, setViewMode] = useState<'member' | 'academic'>('member');
```

**Member View** (default): Current three-level tabs (At a Glance / More Info / Full Detail) with interactive features (beacons, notes, X-Ray badge).

**Academic View**: Wraps content in `AcademicPaperLayout` with proper header, abstract extraction, citation, related papers.

Toggle button:
```tsx
<button onClick={() => setViewMode(v => v === 'member' ? 'academic' : 'member')}>
  {viewMode === 'member' ? '📄 Academic View' : '👤 Member View'}
</button>
```

### Abstract Extraction
If the content doesn't have an explicit `abstract` field in the DB, extract the first paragraph of `content_markdown` as the abstract for academic view.

### Related Papers
Query `cephas_content_registry` for other documents in the same category, or with overlapping `innovation_ids`. Show up to 6 related publications.

---

## TASK 3: Publication Type Badges

Different publication types get different visual treatment in both views:

| Type | Badge Color | Label | Icon |
|------|------------|-------|------|
| paper | Indigo | Working Paper | 📄 |
| article | Amber | Article | 📰 |
| pudding | Orange | Pudding | 🍮 |
| formal | Slate | A&A Formal | ⚖️ |
| business-plan | Emerald | Business Plan | 📊 |
| economics | Teal | Economics | 📈 |

In **academic view**, the badge appears as a subtle chip above the title:
```
LIANA BANYAN CORPORATION · Working Paper Series
```

In **member view**, the badge appears as the existing category Badge component.

---

## TASK 4: Author Bio Component

**New file:** `platform/src/components/cephas/AuthorBio.tsx`

A reusable author bio block for the bottom of academic view:

```tsx
interface AuthorBioProps {
  compact?: boolean; // true = one-line, false = full block
}
```

**Full block (default):**
```
ABOUT THE AUTHOR

Jonathan Jones is a U.S. Army National Guard veteran (enlisted at 16, Infantry 11B,
OCS to IFR-rated Aviation 15A), father of eight, and the founder of Liana Banyan
Corporation — a Wyoming C-Corp building the world's first worker-owned cooperative
economic platform. The platform has {{innovationCount}} documented innovations,
{{patentCount}} provisional patent applications covering {{formalClaimsCount}} formal
claims, and {{productionSystemCount}} live production systems.
```

Uses `useCanonicalStats` + `buildTemplateVars` for live numbers.

**Compact (one-line):**
```
Jonathan Jones · Founder & General Manager · Liana Banyan Corporation
```

---

## TASK 5: Publication Index Page

**New file:** `platform/src/pages/PublicationsIndex.tsx`
**Route:** `/publications` (add to routes/cephas.tsx)

A dedicated page listing ALL publications, filterable by type:

```
┌──────────────────────────────────────────────────────────┐
│  LIANA BANYAN PUBLICATIONS                               │
│                                                          │
│  [All] [Papers] [Articles] [Pudding] [Formal] [Plans]   │
│                                                          │
│  Showing 160 publications                                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 📄 The $5 Career                   March 2026     │  │
│  │ Working Paper · WP-2026-07                        │  │
│  │ How a cooperative platform makes full employment  │  │
│  │ possible at scale.                                │  │
│  │ [Read →]                                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🍮 Making Affordability a Status Symbol Mar 2026  │  │
│  │ Pudding #26 · Economics                           │  │
│  │ FoundersCard costs $495. Liana Banyan costs $5.   │  │
│  │ [Read →]                                          │  │
│  └────────────────────────────────────────────────────┘  │
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

Query `cephas_content_registry` for all published content, sorted by date descending. Each card links to the content detail page.

---

## TASK 6: Database Fields

**Migration:** `20260401000001_k204_publication_metadata.sql`

Add optional columns to `cephas_content_registry` for academic presentation:

```sql
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS paper_number TEXT;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Jonathan Jones';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS author_title TEXT DEFAULT 'Founder & General Manager, Liana Banyan Corporation';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS publication_date DATE;
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS publication_type TEXT DEFAULT 'article';
-- publication_type: 'paper', 'article', 'pudding', 'formal', 'business-plan', 'economics'
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS related_slugs TEXT[] DEFAULT '{}';
ALTER TABLE cephas_content_registry ADD COLUMN IF NOT EXISTS citation_text TEXT;

-- Update platform_canonical
UPDATE platform_canonical SET value = '2128', updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2128;

-- Log innovation
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2128, 'Dual-Render Publication System', 'Academic view (Stanford-style: abstract, citation, author bio, PDF download, related papers) and Member view (three-level progressive disclosure with beacons, notes, X-Ray) for the same content. Toggle between modes.', 'content', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;
```

---

## VERIFICATION

1. Navigate to any Cephas content page (e.g., `/cephas/economics/boaz-principle`)
2. See **Member View** by default (existing three-level tabs, beacons, notes)
3. Click **📄 Academic View** toggle
4. See Stanford-style layout: institutional header, abstract, serif body, citation block, author bio, related papers
5. Click **📋 Cite This Paper** → copies APA citation to clipboard
6. Click **📄 Download PDF** → generates clean PDF
7. Click **👤 Member View** → back to interactive three-level view
8. Navigate to `/publications` → see all ~160 publications listed, filterable by type
9. Mobile: Academic view is responsive (single column, smaller margins)
10. Template variables (`{{innovationCount}}` etc.) work in both views

---

## DEPLOY

```powershell
cd platform; npx supabase db push; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 204 — Bishop B053*
*Same content. Two faces. Scholar or member — you choose how to read.*
*When Posada clicks the link, he sees Stanford. When your family clicks, they see the fable.*
*FOR THE KEEP!*
