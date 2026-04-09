# KNIGHT SESSION 306 — V2 Cephas Gateway (AppShell)
## Bishop B079 | April 5, 2026 | Phase 2 page 5 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_31_MASTER_DESIGN_PACKET_B057.md` § 1
**Depends on**: K294 Foundation primitives (especially `VersionToggle`)
**Tracker row**: `Cephas Gateway` (B31 batch)

---

## PAGE PURPOSE

Calm, high-trust entry to ~161 publications without document-volume overwhelm. **Library lobby with a serious back room.** Discovery-led default, search-led secondary.

## ROUTE

`/cephas` (AppShell). Available to members and ghosts (read-only for ghosts).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Cephas Knowledge System"
- **Headline**: "Find the right depth before you read the full thing."
- **Body**: "Cephas is the platform's living library: academic papers, Pudding explainers, deep articles, standalone writing, business plans, and A&A formals, all organized so members can move from quick orientation to full detail."
- **Primary CTA**: "Browse by category"
- **Secondary CTA**: "Search all publications"
- **Proof strip**: "~161 publications" · "6 content categories" · "3 reading levels" · "live stat templates"

## SECTION FLOW

1. Hero with global search + VersionToggle explainer
2. **Category rail** — 6 families with live counts (papers, Puddings, articles, standalones, business plans, A&A formals)
3. **"Start with Pudding" shelf** — accessible explainers, orientation, easy on-ramps
   - Sublabel: "Short, clear, and made to be approachable."
4. **"This is NOT Pudding" shelf** — deeper formal material: Cephas deep articles, long-form business writing, serious standalone works
   - Sublabel: "Formal, deeper, and higher-commitment reading."
5. **"The Proof is in the Pudding" shelf** — academic papers, A&A formals, business plans, highest-commitment reads
   - Sublabel: "Academic papers, A&A formals, and the library's most rigorous work."
6. **Search/filter workspace** (topic, format, stage, reading level)
7. **Publication table** with metadata + saved sorts
8. **Content Pipeline explainer**: SEED → TLDR → BLOG → ARTICLE → PAPER
9. **Recently updated + staff-curated collections**

## PUDDING TRILOGY (CANONICAL — Founder-approved naming)

These 3 shelf names form a deliberate arc:

1. **Start with Pudding** = invitation (easy, accessible) — Pudding articles, 100+ entries
2. **This is NOT Pudding** = tonal shift (Jim Carrey/Grinch reference + "this is more serious") — deep articles, standalones, business writing
3. **The Proof is in the Pudding** = payoff (idiom = "evidence is in the results" + academic rigor) — papers, A&A formals

Works for people who catch the references AND people who don't. Tonal escalation is self-explanatory in plain English.

**Do NOT rename these shelves. Do NOT combine them. Do NOT add a fourth.**

## DESIGN INSTRUCTION

- **Library lobby with a serious back room**: warm entry, rigorous interior
- **Discovery-led default** (3 shelves as depth ladder), **search-led secondary**
- **VersionToggle is first-class** — every publication card previews "At a Glance" by default; reader can toggle to "Full Read" / "Academic" versions
- NO academic gatekeeping (e.g., "subscribers only" framing)
- NO paywall styling — Cephas is open, invitation to read
- Calm typography, high white space, reading-comfort priority

## VERSIONTOGGLE INTEGRATION

Every publication card shows a `<VersionToggle>` from K294:
- "At a Glance" (default) — TL;DR card
- "Full Read" — reading-level medium, member-accessible framing
- "Academic" — formal citation-heavy version (when available)

For publications that don't have all 3 versions yet, disable unavailable tabs on that card.

## MOBILE

- Three shelves render as **tappable horizontal scroll rails** (high on page)
- Discovery before precision controls (filters move below fold on mobile)
- Publication table collapses to single-column card stack
- StickyMobileCTA: "Browse by category"

## COMPONENTS TO USE (from K294)

- `<AppShell pageTitle="Cephas">`
- `<Hero variant="app">`
- `<VersionToggle>` — used on EVERY publication card
- `<StickyMobileCTA>`
- `useTourTarget('cephas')` on hero

## NEW COMPONENTS (build in `platform/src/components/v2/cephas/`)

- `CephasSearchBar.tsx` — universal search in hero, filters across all categories
- `CategoryRail.tsx` — 6 category cards with live counts
- `PuddingTrilogyShelves.tsx` — renders the 3 shelves (Start with Pudding / This is NOT Pudding / The Proof is in the Pudding)
- `ShelfRail.tsx` — single shelf component, accepts title + sublabel + publications
- `PublicationCard.tsx` — card with VersionToggle, metadata, reading-level tag
- `PublicationSearchWorkspace.tsx` — topic/format/stage/reading-level filter
- `PublicationTable.tsx` — sortable table with saved sorts
- `ContentPipelineExplainer.tsx` — SEED → TLDR → BLOG → ARTICLE → PAPER visual
- `RecentlyUpdatedBand.tsx` — recently updated + staff-curated

## DATA

- Publications from `cephas_publications` table (audit canonical source)
- 6 categories: papers, Puddings, articles, standalones, business plans, A&A formals
- Live counts via `{{variableName}}` dynamic stats templating per K170 — do NOT hardcode
- Reading-level tags: "At a Glance" / "Full Read" / "Academic"

## BANNED

- NO subscriber-only / paywall / premium framing
- NO "unlock academic" gatekeeping
- NO "exclusive" / "VIP" content
- NO red states
- NO promotional flourish on publication cards
- NO LLC / CEO / invest
- NO hardcoded publication counts (use dynamic stats templates)
- NO renaming of Pudding Trilogy shelves

## ACCEPTANCE

- [ ] Route `/cephas` wired in AppShell sidebar
- [ ] Hero copy matches spec EXACTLY (note: "~161 publications" uses `~` tilde)
- [ ] Three Pudding Trilogy shelves named EXACTLY: "Start with Pudding" / "This is NOT Pudding" / "The Proof is in the Pudding"
- [ ] Each shelf has the exact sublabel from spec
- [ ] VersionToggle renders on every publication card
- [ ] Category rail shows 6 families with live counts (dynamic stats, not hardcoded)
- [ ] Search workspace has 4 filter axes: topic, format, stage, reading level
- [ ] Content Pipeline explainer renders: SEED → TLDR → BLOG → ARTICLE → PAPER
- [ ] `data-tour-target="cephas"` on hero
- [ ] Mobile: 3 shelves as horizontal scroll rails, high on page
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K306'`, `in_progress` → `review`
- [ ] Librarian K306 logged
- [ ] Screenshots → `PHASE_2_VISUAL_REVIEW_B079/`

## DO NOT

- Do not build publication detail pages (stub links to existing `/cephas/:slug`)
- Do not rebuild Cephas backend
- Do not add "publish new" / "edit" CTAs — this is a read-side surface
- Do not add any "Share to social" buttons (Battery Dispatch owns that flow)

---

*Bishop B079 — Phase 2 page 5 of 6 — Cephas Gateway*
*Pudding Trilogy shelves debut in platform UI. Dynamic stats templating from K170.*
*FOR THE KEEP!*
