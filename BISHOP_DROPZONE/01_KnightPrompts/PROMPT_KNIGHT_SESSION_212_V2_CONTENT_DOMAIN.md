# KNIGHT SESSION 212 — v2 Content Domain Migration
## Priority: HIGH | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency) complete or in parallel after K208
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md` (Pawn's UI/UX audit)

---

## CONTEXT

Content is the 5th v2 domain — the knowledge engine. It covers Cephas (articles, papers, pudding), the Content Pipeline (SEED→PAPER), Knowledge Graph, Guided Tour, Helm Content Queue, paper quizzes, and the template engine ({{variable}} interpolation). This is where all ~161 publications live and how members discover platform knowledge.

---

## V1 INVENTORY (from B056 deep audit)

### Tables (14 across 5 migrations)
- `content_topics` — topic taxonomy
- `user_topic_preferences` — member topic interests
- `content_topic_tags` — content↔topic linking
- `user_blocked_tags` — Shirley Temple content filtering
- `user_feature_discovery` — progressive feature revelation
- `platform_features` — feature registry for trickle reveal
- `content_pipeline` — SEED→TLDR→BLOG→ARTICLE→PAPER stages
- `cephas_content_registry` — master doc library with full-text search
- `cephas_resource_links` — community-submitted resources
- `cephas_resource_votes` — voting on community resources
- `knowledge_graph_edges` — bidirectional article links (explains, references, teaches, extends, implements)
- `helm_content_queue` — 17 content types, founder-gated review
- `paper_quizzes` — quiz definitions
- `paper_quiz_questions` — quiz questions
- `paper_quiz_attempts` — member quiz attempts
- `paper_read_completions` — reading completion tracking
- `publication_submissions` — publication upload

### Edge Functions (1 primary)
- `medium-publish` — Medium.com API integration

### Pages (12)
CephasGatewayPage, CephasContentDetailPage, CephasCategoryListingPage, CephasSearchPage, CephasInnovationPedestalsPage, CephasPressJunketPage, ContentControlsPage (Shirley Temple Policy), ContentPipelinePage (SEED→PAPER), GuidedTourPage (3 modes), HelmContentCenter (review workflow), PublicationsIndex, PuddingDemo

### Components (32)
**Cephas (19)**: AbstractBlock, AcademicHeader, AcademicPaperLayout, AuthorBio, CephasResourcePanel, CitationBlock, FlipCard, InitiativeCard, InnovationCard, InnovationClaimList, InnovationPedestal, KnowledgeGraphNav, LearnMoreBadge, LetterHeader, PullQuote, ScrollySection, TimelineEntry, VersionToggle (3 reading levels)
**Pudding (7)**: DataVizBar, ExpandableBlock, HoverPreviewGrid, ImageCarousel, PuddingCueCards, RevealBlock, ScrollySection
**Content Mgmt (6)**: ContentControlsPanel, ContentEditModal, EditableContent, HelmContentLibrary, ProgressiveDisclosureGuide + CrowFeather notifications

### Hooks (2)
useCephasKnowledge (resource links/voting), useTourPackages

### Lib Modules (4)
contentPipeline.ts (full SEED→PAPER API), cephasTemplateEngine.ts ({{variable}} interpolation from platform_canonical), nervous-system/cephasSync.ts (94+ letter sync map), nervous-system/contentVersioning.ts

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/content/
├── pages/
│   ├── CephasGatewayPage.tsx       # Main knowledge hub landing (AppShell)
│   ├── CephasDetailPage.tsx        # Article/paper/pudding detail (AppShell, VersionToggle)
│   ├── CephasCategoryPage.tsx      # Category listing with search (AppShell)
│   ├── CephasSearchPage.tsx        # Full-text search across all content (AppShell)
│   ├── ContentPipelinePage.tsx     # SEED→PAPER stages dashboard (AppShell)
│   ├── PuddingPage.tsx            # Pudding article viewer (AppShell)
│   ├── GuidedTourPage.tsx         # 3-mode tour: explore/learn/verify (AppShell)
│   ├── PublicationsPage.tsx       # Publications index (AppShell)
│   └── ContentControlsPage.tsx    # Shirley Temple Policy config (AppShell)
├── components/
│   ├── CephasArticleLayout.tsx     # Academic paper layout (header, abstract, citations)
│   ├── VersionToggle.tsx           # 3 reading levels: At a Glance / More Info / Full Detail
│   ├── KnowledgeGraphNav.tsx       # Bidirectional article navigation
│   ├── ContentPipelineTracker.tsx  # SEED→PAPER stage progression
│   ├── InnovationPedestal.tsx      # Innovation display with claim list
│   ├── PuddingRenderer.tsx         # Pudding-specific components (data viz, scrolly, reveal)
│   ├── ResourcePanel.tsx           # Community resource links + voting
│   ├── FlipCard.tsx                # Interactive flip card for concepts
│   ├── ProgressiveDisclosure.tsx   # 60/30/10 reveal pattern
│   └── QuizEngine.tsx              # Paper quiz system
├── hooks/
│   ├── useCephasContent.ts         # Content fetching + full-text search
│   ├── useContentPipeline.ts       # Pipeline stage management
│   ├── useKnowledgeGraph.ts        # Graph navigation
│   ├── useQuiz.ts                  # Quiz attempt tracking
│   └── useTourPackages.ts          # Guided tour state
├── lib/
│   ├── contentTypes.ts             # Types
│   ├── pipelineStages.ts           # SEED→TLDR→BLOG→ARTICLE→PAPER definitions
│   ├── templateEngine.ts           # {{variable}} interpolation from canonical stats
│   ├── knowledgeGraphTypes.ts      # Edge types: explains, references, teaches, extends, implements
│   └── shirleyTemple.ts            # Content filtering (vertical rating + horizontal topic)
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Three-Tier Reading (VersionToggle)**: Every content piece has 3 levels — At a Glance (~50 words), More Info (~300 words), Full Detail (full text). This is the 60/30/10 progressive disclosure principle.

2. **Content Pipeline stages**: SEED (<50 words) → TLDR (100-300) → BLOG (500-1.5K) → ARTICLE (1.5-5K) → PAPER (3-15K). Each stage has explicit word count bounds.

3. **Shirley Temple Policy**: Content filtering with two axes — vertical (rating/depth level) and horizontal (topic tags). Members can block tags they don't want to see.

4. **Knowledge Graph**: Bidirectional edges between articles. 5 edge types: explains, references, teaches, extends, implements. Powers "related content" and deep-dive navigation.

5. **Template Engine**: `{{innovationCount}}`, `{{crownJewelCount}}`, etc. interpolated from `platform_canonical` table at render time. Dynamic Stats Template System — all Cephas content uses this. No manual find/replace. FOREVER.

6. **Helm Content Queue**: 17 content types (letters, articles, papers, pudding, cue cards, etc.) flow through founder-gated review before dispatch. This is the Content Command Center (K190).

7. **Pudding articles**: Distinct visual style — data viz bars, scrolly sections, reveal blocks, hover preview grids. Separate renderer from academic papers.

8. **AppShell for ALL content pages** — content is post-auth, member-facing. No FocusShell pages in this domain.

---

## BUILD STEPS

1. Use Librarian: `get_schema("cephas_content_registry")`, `get_schema("content_pipeline")`, `get_schema("knowledge_graph_edges")`, `get_schema("helm_content_queue")`, `get_schema("paper_quizzes")`
2. Create v2 migration if needed (most tables exist from v1 migrations)
3. Build pages — start with CephasGatewayPage (hub), then CephasDetailPage (VersionToggle), then pipeline
4. Port template engine — critical: `{{variable}}` syntax must work in v2
5. Wire routes in `routes.tsx`
6. Export public API: `useCephasContent`, `VersionToggle`, `KnowledgeGraphNav`, `contentRoutes`
7. Register in `AppRouter.tsx`

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership, MembershipGate } from '../membership';
// Content is member-gated (except Ghost browse, which is in onboarding)
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

**Every session must end with this.** No exceptions.

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/cephas` shows gateway with categories
3. `/cephas/:slug` shows article with VersionToggle (3 levels)
4. `{{innovationCount}}` renders as `2129` (not raw template string)
5. Knowledge graph navigation works between related articles
6. `/content/pipeline` shows SEED→PAPER stages
7. `get_migration_status("content")` shows v2 pages > 0
8. Librarian indexes rebuilt

---

*Bishop B057 — v2 Content Domain*
*Knowledge engine: Cephas + Pipeline + Knowledge Graph + Template Engine*
*FOR THE KEEP!*
