# SURFACE MAP: Hugo vs React — BP071 Eblet
**Generated:** 2026-06-02 by Knight (Black Mamba Thirty, Scope 8)  
**Purpose:** Audit which BP071 content edits hit the FROZEN Hugo surface vs the LIVE React app

---

## Surface Status Summary

| Surface | Location | Deploy Target | Status |
|---------|----------|---------------|--------|
| **React (live)** | `platform/src/` | Firebase `lianabanyan.com` + subdomains | **LIVE** — Vite/React SPA |
| **Hugo (frozen)** | `Cephas/cephas-hugo/` | Firebase `cephas.lianabanyan.com`, museum, mnemosyne | **FROZEN** — not currently redeploying |
| Hugo `public/` | `Cephas/cephas-hugo/public/` | Static build output | STALE — does not reflect current content edits |

**Critical:** The React app at `lianabanyan.com` is the **authoritative live surface** users see. The Hugo static site at `cephas.lianabanyan.com` deploys via `hugo --minify && firebase deploy` but is **currently frozen** — content edits in `Cephas/cephas-hugo/content/` do NOT reach users until that command is run.

---

## Content Domains: Hugo vs React

### Pages/Sections ONLY in Hugo (frozen)

| Hugo Path | Description | BP071 Risk |
|-----------|-------------|------------|
| `content/almanac/issue-003/` | Banyan Almanac empirical receipts, CAI multipliers | Contains 31,833x and 39.2Mx disputed composites |
| `content/almanac/issue-004/` | Banyan Almanac issue 004 | May contain stale composites |
| `content/codex/cai-multiplier/` | Doctrine: CAI-4.5 efficiency multiplier | Contains 31,833x |
| `content/save-the-world/paper-8-cai-substrate-orchestra/` | Save-the-World Paper 8 | References 31,833x |
| `content/academic/how-to-bake-ai-cake-paper.md` | AI Cake / No Atomo academic paper | Full paper — NO React equivalent |
| `content/im-just-a-bill/` | 100+ legislative analysis pages | Hugo-only |
| `content/glass-door/` | Regulatory position papers (FTC, SEC, USPTO, etc.) | Hugo-only |
| `content/council-charter/` | Cooperative governance charter | Hugo-only |
| `content/press/` | Press release archive | Hugo-only |
| `content/programs/` | Sub-programs detail pages | Hugo-only |
| `content/spinouts/` | Spinout venture pages | Hugo-only |
| `content/proofs/charts_bp058/` | Empirical proof charts (BP058) | Hugo-only |
| `content/letters/` | Crown letters + iterations archive | Partially mirrored in Supabase/React |
| `content/codex/` (26 chapters) | Doctrine/codex articles | Hugo-only static pages |

### Pages/Sections ONLY in React (live at lianabanyan.com)

| React Path | Description |
|------------|-------------|
| `pages/HexIsle*.tsx` | HexIsle manufacturing game |
| `pages/museum/` | Interactive museum portal |
| `pages/GhostWorld*.tsx` | Ghost World mall/map |
| `pages/CrewCall*.tsx` | Crew call board |
| `pages/helm/` | Knight/Helm admin pages |
| `pages/cathedral/` | Cathedral scribe interface |
| `pages/Guilds.tsx` | Guild system |
| `pages/PatentPortfolio.tsx` | Live patent portfolio (stats from Supabase) |
| `pages/HallOfInnovations.tsx` | Dynamic innovation count from Supabase |
| `pages/RedCarpet.tsx` | Live Red Carpet walkthrough |
| `pages/IPPortfolioPage.tsx` | IP portfolio detail UI |
| `pages/Senate.tsx` | Governance senate view |
| `pages/LibrarianPage.tsx` | Librarian AI interface |
| `pages/StarterKitPage.tsx` | Starter kit commerce page |
| `pages/marketplace/` routes | Full commerce marketplace |

### Pages in BOTH (React = authoritative for live)

| Feature | Hugo Path | React Path | Live Authority |
|---------|-----------|------------|----------------|
| Cephas knowledge base | `content/articles/`, `content/under-the-hood/` | `CephasContentDetailPage.tsx` (reads Supabase) | **React via Supabase** |
| Initiative pages | `content/initiatives/` (all 16) | `InitiativePage.tsx`, individual init pages | **React** |
| FAQ / Welcome | `content/welcome/faq/`, `content/welcome/how-it-works/` | `FAQ.tsx`, `WelcomeGatePage.tsx` | **React** |
| Patent/Innovation stats | `content/verification/`, `content/innovations/bag-*/` | `HallOfInnovations.tsx`, `PatentPortfolio.tsx` | **React via Supabase `platform_canonical`** |
| Academic papers listing | `content/papers/` | `AcademicPapersDirectory.tsx`, `PaperPage.tsx` | React lists; Hugo has full text |
| Crown letters | `content/letters/` | `CrownLettersPage.tsx`, `RedCarpet.tsx` | **Supabase + React** |
| Under-the-hood docs | `content/under-the-hood/` (100+ pages) | `UnderTheHoodPage.tsx` (links to cephas.lianabanyan.com) | Hugo serves the full articles at cephas subdomain |
| Author bio / stats | Hugo author page | `AuthorBio.tsx` uses `useCanonicalStats` | **React dynamic** |

---

## BP071 Content Edits: Hugo vs React Surface

### Edits that hit FROZEN Hugo (unreachable until Hugo redeploy)

| BP071 Edit | Hugo File | Action |
|------------|-----------|--------|
| Disputed composites (31,833x, 39.2Mx, 37,000x) | `almanac/issue-003/`, `codex/cai-multiplier/`, `save-the-world/paper-8-*/` | FROZEN. Must fix before any Hugo redeploy |
| AI-cake percentage metaphor | `content/academic/how-to-bake-ai-cake-paper.md` | FROZEN. No React equivalent needed |
| Download page updates | `content/download/_index.md` | Git M (modified) — will deploy on next Hugo build |
| SSPL license sweep | Various `content/` files | KniPr029 sweep — FROZEN unless redeployed |

### Edits applied to LIVE React app (Scope 7, commit 905a5d8)

**33 files patched in `platform/src/` with canon values:**

| Old Value | Canon Value | React Files Fixed |
|-----------|-------------|-------------------|
| `2,097` patent claims | `2,473` | durinsDoor.ts, CrownLetterUpdate.tsx, xrayGlossary.ts, BenefitsPage.tsx, guildHandshakeProtocol.ts, SocialShareBar.tsx, The300Page.tsx, guildSystem.ts, The2ndSecondPortal.tsx, redCarpetRecipients.ts, guildRecruitingCards.ts, crowsNestItems.ts, alcoveSystem.ts, IPPortfolioPage.tsx, LBInternalPositions.tsx, CephasPressJunketPage.tsx, FriendPage.tsx, Senate.tsx, spotlightAlgorithm.ts, foundingTransactions.ts, platformBlueprint.ts (non-capsule) |
| `2,506` patent claims | `2,473` | ShowMeHelp.tsx, LibrarianPage.tsx, crowsNestItems.ts, mediumArticleDrafts.ts, RedCarpetWalkthrough.tsx |
| `2,700` patent claims | `2,473` | scheduleOpeningGambit.ts, scheduleOpeningGambitSalvo.ts, scheduleOpeningGambitPosts.ts |
| `2097` (bare int) | `2473` | ipfsService.ts, nervous-system/index.ts, platformMetrics.ts, platformBlueprint.ts |
| Provisional count (8/11/13/17/20) | `21` | ipfsService.ts, nervous-system/index.ts, crowsNestItems.ts, scheduleOpeningGambitSalvo.ts, ShowMeHelp.tsx, RedCarpetWalkthrough.tsx, mediumArticleDrafts.ts |

**Authoritative React hook (already correct before Scope 7):**
- `useCanonicalStats.ts` DEFAULTS: `innovationCount: 2270`, `patentApplications: 21`, `patentClaims: 2473`
- `HallOfInnovations.tsx`: uses `stats.patentClaims` dynamically from Supabase
- `AuthorBio.tsx`: uses `vars.formalClaimsCount` from `cephasTemplateEngine.ts`

### Disputed Composites: Surface Status

| Composite | Hugo Status | React Status |
|-----------|-------------|--------------|
| `31,833x` CAI multiplier | FROZEN in almanac, codex, save-the-world | NOT FOUND in React |
| `39.2Mx` Banyan Metric | FROZEN in almanac, stats-rollup | NOT FOUND in React |
| `37,000x` | FROZEN in Hugo almanac | NOT FOUND in React |
| `97%` (AI %) | FROZEN in academic paper | Only in CSS keyframe (unrelated) in React |
| `98.7%` | Not found in Hugo scan | NOT FOUND in React |
| AI-cake % metaphor | Full paper in `content/academic/` | Referenced as TITLE only in LibrarianMedallion.tsx |
| `2,806` claims | NOT FOUND in either surface | CLEAN |

---

## Action Items: Re-applying Hugo Edits to React

| # | Hugo Edit | React Status |
|---|-----------|--------------|
| 1 | Disputed composites (31,833x, 39.2Mx) in almanac/codex | CLEAN in React — no action needed |
| 2 | AI-cake academic paper content | No React equivalent needed |
| 3 | Patent claim count (2,097 to 2,473) | **DONE** — Scope 7 commit 905a5d8 |
| 4 | Provisional count fixes | **DONE** — Scope 7 commit 905a5d8 |
| 5 | Download page / SSPL text | React has no download page; Hugo cephas.lianabanyan.com/download/ is the source |
| 6 | Welcome/FAQ content | Check React FAQ.tsx against Hugo welcome/faq/ when Hugo is next edited |

---

## Hugo Redeploy Checklist (when unfreeze occurs)

Before running `hugo --minify && firebase deploy`:
1. Sweep `content/almanac/`, `content/codex/`, `content/save-the-world/` for `31,833x`, `39.2Mx`, `37,000x` — add caveat language or qualify as peak-saga measurements
2. Run patent claim count sweep: replace any `2,097` with `2,473`
3. Check provisional counts: replace `11 provisional` with `21 provisional` where applicable
4. Verify download page reflects current Mnemosyne version and SSPL license

---

## Canonical Numbers (BP071 Canon)

| Metric | Canon | Keep |
|--------|-------|------|
| Innovation count | `2,270` | Yes |
| Formal patent claims | `2,473` | Yes |
| Provisional filings | `21` | Yes |
| Creator keeps % | `83.3%` | Yes |
| Platform margin | `20%` | Yes |
| kappa | `0.936` | Yes |
| Accuracy uplift | `+72-83pp` | Yes |
| Accuracy range | `6% to 78%` | Yes |
| Latency | `16.6ms` | Yes |
| AI cost | `$0/call` | Yes |
| Membership | `$5/yr` | Yes |
| Crown Jewels | `228` | Yes |

---

*Knight — Black Mamba Thirty, Scope 8, BP071 — 2026-06-02*