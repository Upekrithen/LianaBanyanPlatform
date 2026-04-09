# Knight Session 53 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: Latest from Session 52
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Both are content/UX focused.

---

## TASK A: Pudding Styles on Cephas — Interactive Scrollytelling

### Context

**Founder ORDERED this. Do NOT skip.**

The academic papers on Cephas stay in clean academic prose. But ALL OTHER Cephas content (letters, articles, innovations, general pages) gets "Pudding-style" interactive scrollytelling for accessibility and readability.

"Pudding" refers to The Pudding (pudding.cool) — data-driven visual essays with scroll-triggered animations, sticky elements, progressive reveal, and rich interactive sections.

### What Pudding Style Means:

1. **Scroll-triggered sections** — Content reveals as user scrolls. Key stats/quotes stick to viewport briefly.
2. **Progressive depth** — First pass shows headlines + key numbers. Scroll deeper for full content.
3. **Sticky annotations** — Important context stays pinned while supporting text scrolls past.
4. **Visual data callouts** — Numbers, percentages, and comparisons get large visual treatment (not buried in paragraphs).
5. **Chapter markers** — Side navigation showing progress through the document.
6. **Mobile-first** — Works on phones. No horizontal scrolling. Touch-friendly.

### Implementation:

1. **Create Hugo partial** `layouts/partials/pudding-section.html`:
   ```html
   <!-- Scroll-triggered section with sticky header -->
   <section class="pudding-section" data-pudding-trigger>
     <div class="pudding-sticky">{{ .Title }}</div>
     <div class="pudding-content">{{ .Content }}</div>
   </section>
   ```

2. **Create Hugo shortcodes** in `layouts/shortcodes/`:
   - `pudding-stat.html` — Large number display with label (e.g., "83.3%" with "Creator Share")
   - `pudding-compare.html` — Side-by-side comparison boxes
   - `pudding-sticky-quote.html` — Quote that sticks during scroll
   - `pudding-progress.html` — Chapter progress indicator
   - `pudding-reveal.html` — Content that fades in on scroll

3. **Create CSS** `static/css/pudding.css`:
   - Intersection Observer-based scroll triggers (via JS in `static/js/pudding.js`)
   - Sticky positioning for annotations
   - Fade-in/slide-up animations on scroll
   - Dark theme compatible (Cephas uses dark theme)
   - Mobile responsive breakpoints
   - Print-friendly fallback (no animations in print)

4. **Create a layout override** for non-paper content:
   - `layouts/letters/single.html` — Letter layout with Pudding sections
   - `layouts/articles/single.html` — Article layout with Pudding sections
   - Papers keep their existing clean academic layout

5. **Test on one existing letter** — Apply Pudding shortcodes to `crown-initiative/dale-dougherty.md` as a proof of concept.

### Verification:
- Dale Dougherty letter renders with scroll-triggered sections
- Stats display as large visual callouts
- Sticky quotes work on scroll
- Mobile responsive (test at 375px width)
- Academic papers are NOT affected

---

## TASK B: Cephas Navigation Enhancement

### Context

With 102 letters now on Cephas across 8 categories, the navigation needs to surface them properly.

### Steps:

1. **Update the letters `_index.md`** to list all categories with counts:
   - Crown Initiative (22 letters)
   - Circle 1: Investors (11 letters)
   - Circle 2: Media (11 letters)
   - Circle 3: Academics (16 letters)
   - Blessing (3 letters)
   - Pitches (17 letters)
   - Partnerships (5 letters)
   - Professional (1 letter)
   - Political Expedition (4 letters)
   - Health (3 letters)

2. **Add category `_index.md` files** for any subdirectories that don't have them yet (check: crown-initiative, health, political-expedition/crown-letter files at root)

3. **Add a "Letters Directory" section** to the Cephas homepage that shows category cards with letter counts

### Verification:
- Cephas letters page shows all categories
- Each category page lists its letters
- Homepage has letters directory section

---

## Deploy

After both tasks:
1. Hugo build: `hugo --minify`
2. `firebase deploy --only hosting:cephas`
3. Update handoff

**FOR THE KEEP!**
