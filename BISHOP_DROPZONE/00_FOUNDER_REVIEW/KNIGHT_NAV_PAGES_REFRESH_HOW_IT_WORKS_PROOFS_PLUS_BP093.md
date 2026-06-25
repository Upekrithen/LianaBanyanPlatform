# KNIGHT NAV PAGES REFRESH — HOW-IT-WORKS + PROOFS + V2 DESIGN PROPAGATION
## BP093 · Phase 5 of Marathon Bundle · Sonnet 4.6 SEG-AC

---

## PREAMBLE

**Knight model:** claude-sonnet-4-6 (Sonnet 4.6 ONLY — do not use Opus, do not use Haiku)
**Bishop model that composed this paste:** claude-sonnet-4-6 (SEG-AC)
**Authority:** §3 §14 §15 §17 BLOOD
**Directive:** "use segs" — Knight runs independent verification SEGs after each major task
**BP093 corrective canon check:** Before executing, Knight SHALL confirm it is running on claude-sonnet-4-6. If the model string in the session header is anything other than sonnet-4-6 or claude-sonnet-4-6, STOP and surface to Founder.

---

## CONTEXT

Founder shared two new Composer-built HTML pages that replace broken/blank pages on mnemosynec.org:

- `C:\Users\Administrator\Downloads\mnemosynec-how-it-works.html` — replaces broken `/how-it-works/`
- `C:\Users\Administrator\Downloads\mnemosynec-proofs.html` — replaces blank `/proofs/`

Both files use the **v2 design system** (Inter + IBM Plex Mono + teal #4fc3d0 + amber accents + dark-first CSS variables + frosted-glass nav). The homepage currently uses the old gold/amber system (#0a1628 background + #d69e2e accent). The v2 system is the target for all nav pages going forward.

**Hugo project:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`
**Config:** `config-mnemosynec.toml` (contentDir = `content-mnemosynec`, publishDir = `public-mnemosynec`)
**Source HTML files:** `C:\Users\Administrator\Downloads\mnemosynec-how-it-works.html` and `mnemosynec-proofs.html`

**Top nav pages (from config-mnemosynec.toml):**
| Route | Content file | Layout | Status |
|---|---|---|---|
| /download/ | content-mnemosynec/download/_index.md | layouts/download/list.html | Old gold system — TODO flag |
| /proofs/ | content-mnemosynec/proofs/_index.md | PaperMod default (no custom layout) | REPLACE with new HTML |
| /diagnosis/ | content-mnemosynec/diagnosis/_index.md | PaperMod default | Old plain markdown — TODO flag |
| /constellation/ | content-mnemosynec/constellation/_index.md | PaperMod default | Old plain markdown — TODO flag |
| /about/ | content-mnemosynec/about/_index.md | PaperMod default | Old plain markdown — TODO flag |
| /tools/ | content-mnemosynec/tools/_index.md | PaperMod default | Old plain markdown — TODO flag |
| /live/SubstrateAwakens/ | content-mnemosynec/live/SubstrateAwakens/_index.md | PaperMod default | TODO flag |
| /join/ (external lianabanyan.com) | — | — | External — skip |
| /bounties/ | content-mnemosynec/bounties/_index.md | layouts/bounties/bounties.html | TODO flag |
| /how-it-works/ | content-mnemosynec/how-it-works/_index.md | PaperMod default (no custom layout) | REPLACE with new HTML |

**NOT in top nav but linked from new pages:** /how-to-read-the-substrate/ — exists, leave as-is for now.

---

## TASK 1 — Port `mnemosynec-how-it-works.html` into Hugo at `/how-it-works/`

### Step 1a — Create layout file

Create `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\how-it-works\list.html` with the following content:

```
{{- define "main" }}
{{/* HOW IT WORKS · v2 design system · BP093 */}}
```

Then paste the ENTIRE body content from `C:\Users\Administrator\Downloads\mnemosynec-how-it-works.html` — specifically everything between `<body>` and `</body>` (inclusive of all `<style>`, `<nav>`, `<section>`, `<footer>`, and `<script>` tags inside the body).

**Critical nav update:** In the pasted HTML, replace the hardcoded nav links so they use Hugo-relative paths:
- `href="https://mnemosynec.org/#architecture"` → keep as-is (anchor on homepage)
- `href="https://mnemosynec.org/#benchmarks"` → keep as-is (anchor on homepage)
- `href="how-it-works"` → `href="/how-it-works/"` (fix relative to absolute)
- `href="proofs"` → `href="/proofs/"` (fix relative to absolute)
- `href="https://mnemosynec.org"` (Download button) → `href="/download/"` (point to internal download page)
- `href="https://mnemosynec.org/how-to-read-the-substrate/"` → `href="/how-to-read-the-substrate/"` (internal)
- `href="https://mnemosynec.org/proofs/"` → `href="/proofs/"` (internal)
- Logo href `https://mnemosynec.org` → `href="/"`

**Google Fonts import:** The `<link>` tags for Google Fonts are in `<head>` of the source HTML. Since the layout only defines `{{- define "main" }}`, add the font imports via the `layouts/partials/extend_head.html` partial instead. OR: include the font `<link>` tags inside a `<style>` comment workaround using a `<link>` injected at the top of the `main` block (Hugo allows this — it renders before `</head>` close in some configs, or inject as inline `@import` in the style block):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300..700&display=swap" rel="stylesheet">
```

Place these three lines at the very top of the `list.html` body output (inside the `define "main"` block), before the `<style>` tag. Hugo will pass these through as raw HTML. This is the same pattern used by the download layout — it works.

**Chart.js:** The how-it-works page does NOT use Chart.js (chart is embedded inline SVG). No external JS dependency beyond the theme toggle + chart-expand script already in the file.

**Close the block:**
```
{{- end }}
```

### Step 1b — Update `content-mnemosynec/how-it-works/_index.md` frontmatter

Replace the existing frontmatter to ensure the layout resolves correctly:

```yaml
---
title: "How It Works — MnemosyneC"
description: "How We Make Sure Things Are True. Fast. Free. Three Layers: Reader, Verifier, Accumulator. The Substrate Compounding Chart. Knowledge Lifecycle. Frontier Mesh."
date: 2026-06-23
draft: false
layout: "list"
---
```

Leave the existing markdown body as-is (it will not render — the custom layout takes over the `main` block entirely).

### Step 1c — Preserve canonical content

The new page preserves ALL the content Founder requires:
- 4 KPI strip: $0 / 6%→78% / 16.6ms / 95%
- Three Layers accordion: 01 Reader (Gemma 4 12B · local · $0/call) / 02 Verifier (Shadow E-Giant™ · 3+ parallel) / 03 Accumulator (Eblet store · append-only JSONL · SHA256)
- Substrate Compounding Chart (inline SVG — self-contained, no external file needed)
- Knowledge Lifecycle flow: Pheromone → Socceri Triad → Living Connection → Stone Tablet
- Frontier Mesh 6-card grid: Not RAG / Third Option / Substrate Works Without MnemosyneC / Mesh Proof 20/20 / Vendor Resilience / Patent Pledge #2260
- Three Tiers section: FREE $0/call / FLAGSHIP / API SSPL
- Footer: liturgy, cooperative tag, "For Alford"

**NO new data center SVG file needed** — the compounding chart is fully inline SVG in the HTML.

---

## TASK 2 — Port `mnemosynec-proofs.html` into Hugo at `/proofs/`

### Step 2a — Create layout file

Create `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\proofs\list.html`

Same pattern as Task 1: `{{- define "main" }}` ... `{{- end }}`

Place the Google Fonts link tags at the top of the main block.

**Nav link fixes** (same as Task 1):
- Logo href `https://mnemosynec.org` → `href="/"`
- `href="https://mnemosynec.org/#architecture"` → keep (homepage anchor)
- `href="how-it-works"` → `href="/how-it-works/"`
- `href="proofs"` → `href="/proofs/"`
- `href="https://mnemosynec.org"` (Download button) → `href="/download/"`
- `href="https://mnemosynec.org/how-it-works/"` → `href="/how-it-works/"`
- `href="https://mnemosynec.org/how-to-read-the-substrate/"` → `href="/how-to-read-the-substrate/"`
- `href="https://mnemosynec.org/proofs/"` (self-links in proof cards footer) → `href="/proofs/"`
- `href="https://mnemosynec.org/license"` → `href="/license"` (or keep external if /license doesn't exist in Hugo)
- `href="https://mnemosynec.org/license"` in footer links → same treatment

**SVG clipPath id collision:** The proofs page uses `id="plotClip2"` for the second chart clipPath. The how-it-works page uses `id="plotClip"`. These are on different pages — no collision. No change needed.

### Step 2b — Update `content-mnemosynec/proofs/_index.md` frontmatter

```yaml
---
title: "Proofs — MnemosyneC"
description: "We don't ask you to trust us. We prove it. 4 Pinned Proofs: Mesh R10 20/20 at 16.6ms, Knight Wave 2 11 MAMBAs, Accuracy Lift 6→78%, BP063 vs BP087 comparative. Reproducible methodology. Patent Pledge #2260."
date: 2026-06-23
draft: false
layout: "list"
---
```

Leave existing markdown body as-is.

### Step 2c — Canonical content preserved

- Hero: "We Don't Ask You to Trust Us. We Prove It." + hero-sub
- 4 Pinned Proof cards (2×2 grid):
  - Mesh R10 20/20 correct · 16.6ms median · SHA256 hash-verified (✓ Pinned)
  - Knight Wave 2 Ride · 11 MAMBAs · 89% context (✓ Pinned)
  - Accuracy Lift: 6%→78% free / 89–93% flagship (✓ Pinned)
  - BP063 vs BP087 comparative: 1 MAMBA crash → 11 MAMBAs (✓ Pinned)
- Inline SVG compounding chart (same chart as how-it-works, click-to-expand)
- Accuracy benchmark table: 7 models × cold/warm/lift/notes
- 6-step reproducible methodology (steps 01–06 with code snippets)
- Patent Pledge #2260 amber box
- Footer: liturgy, "For Alford"

---

## TASK 3 — Enumerate + refresh other nav pages

Knight SHALL NOT rewrite content for these pages without Founder direction. The task is design-system propagation only: update CSS variables + font imports to v2 teal system.

**Pages to flag for Founder review (content refresh needed, but NOT in this paste):**

| Page | Current state | Action in this paste |
|---|---|---|
| /download/ | `layouts/download/list.html` — old gold system (#d69e2e, #0a1628) | Apply v2 CSS variables + font import at top of layout. Do NOT rewrite download content. |
| /diagnosis/ | PaperMod default, plain markdown | Add v2 design wrapper — see note below |
| /constellation/ | PaperMod default, plain markdown | Add v2 design wrapper — see note below |
| /about/ | PaperMod default, plain markdown | Add v2 design wrapper — see note below |
| /tools/ | PaperMod default, plain markdown | TODO flag for Founder — leave as-is |
| /live/SubstrateAwakens/ | PaperMod default | TODO flag for Founder — leave as-is |
| /bounties/ | `layouts/bounties/bounties.html` | TODO flag for Founder — leave as-is |

**For /download/ specifically:** At the top of `layouts/download/list.html`, after the existing comment block, add the v2 font import and a CSS override that adds the v2 CSS variable definitions into `:root` and `[data-theme="dark"]`. This does NOT change the download page's visual design — it only layers the v2 tokens so they're available if the page references them. The download page's existing colors will continue to work unchanged.

Insert this block at the top of the `main` block in `layouts/download/list.html` (after the opening comment):

```html
<!-- V2 DESIGN TOKENS · BP093 · forward-compatible only, does not override existing styles -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300..700&display=swap" rel="stylesheet">
<style>
:root {
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --primary-v2: #4fc3d0;
  --amber-v2: #f5b942;
}
</style>
```

**For /diagnosis/, /constellation/, /about/ — PaperMod pages:** These render through `_default/baseof.html` → PaperMod theme. Bishop recommends adding a dedicated layout for each in a future Marathon block when Founder provides updated content. For BP093, Knight SHALL flag them with a TODO comment in the baseof.html extend_head partial:

Add to `layouts/partials/extend_head.html` (create if doesn't exist, append if exists):

```html
<!-- V2 DESIGN TOKENS · BP093 · Inter + IBM Plex Mono available site-wide -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300..700&display=swap" rel="stylesheet">
<style>
:root {
  --font-body-v2: Inter, system-ui, sans-serif;
  --font-mono-v2: 'IBM Plex Mono', monospace;
  --primary-v2: #4fc3d0;
  --amber-v2: #f5b942;
}
</style>
<!-- TODO BP093: /diagnosis/ /constellation/ /about/ /tools/ /live/ /bounties/ need v2 content refresh. Fonts now available. -->
```

**Knight: first read `layouts/partials/extend_head.html` before writing** — it may already exist with content from BP084. Append only, do not overwrite.

---

## TASK 4 — Hugo build + Firebase deploy

```powershell
# Step 1: Hugo build — WAIT for full exit before continuing
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --config config-mnemosynec.toml --destination public-mnemosynec
# Expected: exit 0, "N pages" built, no ERROR lines

# Step 2: Verify output dirs exist before deploy
Test-Path "public-mnemosynec\how-it-works\index.html"
Test-Path "public-mnemosynec\proofs\index.html"
# Both must return True before proceeding

# Step 3: Firebase deploy
firebase deploy --only hosting:mnemosyne
# Wait for "Deploy complete!" before continuing
```

**Race condition guard:** If `Test-Path` returns False for either file, STOP. Do not deploy. Report which file is missing and surface to Founder. The most common cause: layout file in wrong directory (Hugo uses the section name, not content dir structure, to resolve layouts).

**Layout resolution chain for sections:**
- `/how-it-works/` → Hugo looks for `layouts/how-it-works/list.html` FIRST, then `layouts/_default/list.html`
- `/proofs/` → Hugo looks for `layouts/proofs/list.html` FIRST, then `layouts/_default/list.html`

Creating `layouts/how-it-works/list.html` and `layouts/proofs/list.html` is the correct and sufficient approach.

---

## TASK 5 — Empirical verification

Run ALL of the following. Report PASS/FAIL for each line:

```powershell
# HOW-IT-WORKS page
$r1 = Invoke-WebRequest -Uri "https://mnemosynec.org/how-it-works/" -UseBasicParsing
$r1.StatusCode  # Expect: 200
$r1.Content -match "True\. Fast\. Free\."  # Expect: True
$r1.Content -match "Reader"  # Expect: True
$r1.Content -match "Verifier"  # Expect: True
$r1.Content -match "Accumulator"  # Expect: True
$r1.Content -match "Pheromone"  # Expect: True (lifecycle section)
$r1.Content -match "Stone Tablet"  # Expect: True
$r1.Content -match "4fc3d0"  # Expect: True (v2 teal token in CSS)
$r1.Content -match "IBM Plex Mono"  # Expect: True (v2 font)

# PROOFS page
$r2 = Invoke-WebRequest -Uri "https://mnemosynec.org/proofs/" -UseBasicParsing
$r2.StatusCode  # Expect: 200
$r2.Content -match "Pinned Proof"  # Expect: True
$r2.Content -match "Mesh R10"  # Expect: True (proof card title fragment)
$r2.Content -match "20 / 20 correct"  # Expect: True
$r2.Content -match "Patent Pledge"  # Expect: True
$r2.Content -match "4fc3d0"  # Expect: True (v2 teal)

# MIRROR CHECK — mnemosynec.ai (same Firebase hosting target)
$r3 = Invoke-WebRequest -Uri "https://mnemosynec.ai/how-it-works/" -UseBasicParsing
$r3.StatusCode  # Expect: 200
$r4 = Invoke-WebRequest -Uri "https://mnemosynec.ai/proofs/" -UseBasicParsing
$r4.StatusCode  # Expect: 200

# DOWNLOAD page — confirm not broken
$r5 = Invoke-WebRequest -Uri "https://mnemosynec.org/download/" -UseBasicParsing
$r5.StatusCode  # Expect: 200

# HOMEPAGE — confirm not broken by our changes
$r6 = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
$r6.StatusCode  # Expect: 200
```

If any check fails: do NOT declare success. Report the exact failure line + status code to Founder.

---

## TASK 6 — Yoke return

Knight returns with:

1. **Files created:**
   - `layouts/how-it-works/list.html` — byte size
   - `layouts/proofs/list.html` — byte size
   - Edits to `content-mnemosynec/how-it-works/_index.md` (frontmatter only)
   - Edits to `content-mnemosynec/proofs/_index.md` (frontmatter only)
   - Edit to `layouts/partials/extend_head.html` (v2 font tokens appended)
   - Edit to `layouts/download/list.html` (v2 token block prepended)

2. **Hugo build output:** Full line count + any WARN/ERROR lines

3. **Firebase deploy URL:** The Hosting URL from "Deploy complete!" output

4. **Verification results:** PASS/FAIL table for all 12+ curl/PowerShell checks in Task 5

5. **Pages NOT refreshed (TODO for Founder):**
   - /diagnosis/ — plain markdown, needs v2 content + layout
   - /constellation/ — plain markdown, needs v2 content + layout
   - /about/ — plain markdown, needs v2 content + layout
   - /tools/ — needs Founder direction
   - /live/SubstrateAwakens/ — needs Founder direction
   - /bounties/ — has custom layout, needs Founder direction

6. **ELECTRON_TOUCHED:** NO

---

## §15 BLOOD NOTE

After Knight Yokes with verification results, Bishop re-gadgets independently:
- Query `curl -sI https://mnemosynec.org/how-it-works/` directly
- Grep body for "True. Fast. Free." and "4fc3d0" teal token
- Do NOT accept Knight's self-report as the only verification
- Knight false-negatives have occurred before (see BISHOP_EMPRESS_MIGRATIONS_RECEIPT_BP092.md)
- Empirical DB/live-site state wins over Knight report

---

## MARATHON BUNDLE RECOMMENDATION

**Recommend: Phase 5 of existing Marathon Bundle** — not a separate Yoke.

Rationale:
- Phase 2 of Marathon covers the homepage design refresh (v2 tokens on index). Phase 5 (this paste) extends those tokens to /how-it-works/ and /proofs/ and seeds extend_head.html with the font.
- Single-Yoke discipline: one Firebase deploy for all Marathon phases is cleaner than interleaved deploys.
- Phase 4 (or current last phase) should confirm completion of Phase 2 homepage before Phase 5 fires — the layout patterns in Phase 5 reference the v2 system that Phase 2 establishes.
- If Phase 2 is already complete, Knight can fire Phase 5 immediately as the next step.

**If Marathon bundle is not in play:** Fire as a standalone Yoke after confirming the v2 design tokens are present in the site (check that the homepage has been updated or that the tokens will be self-contained within the new layout files — which they are, since each layout file includes its own full `<style>` block with all CSS variables).

---

## WALL-CLOCK ESTIMATE

- Task 1 (how-it-works port): 15 min
- Task 2 (proofs port): 15 min
- Task 3 (extend_head + download token): 10 min
- Task 4 (Hugo build + deploy): 10–20 min
- Task 5 (verification): 10 min
- Total: 60–70 min Knight work

---

*Composed: BP093 SEG-AC · Sonnet 4.6 · 2026-06-23*
*Paste path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_NAV_PAGES_REFRESH_HOW_IT_WORKS_PROOFS_PLUS_BP093.md`*
