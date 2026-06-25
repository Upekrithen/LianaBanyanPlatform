# KNIGHT ORG READABILITY TUNE — BROCHURE DENSITY — BP093
**Composer**: Bishop · Sonnet 4.6 · SEG-AN · 2026-06-24
**Authority**: §3 (Cooperative canon) · §14 (Dispatch discipline) · §15 (BLOOD direct-DB) · §17 (Truth-Always SEG)
**Target**: mnemosynec.org Hugo build only — do NOT touch .ai site
**ELECTRON_TOUCHED**: NO

---

## PREAMBLE

Knight: This is a layout/CSS tune dispatch only. You are NOT rewriting Founder copy. You are NOT touching the .ai site (Cephas SEG-AM is a separate dispatch). You ARE compressing the v2 visual layout on .org to recover brochure density. Bishop has gadgeted the full template via SEG-AN.

**Composer model check**: Sonnet 4.6 (Bishop) composed this paste. Knight executes.

**Use segs**: SEG-AN (this gadget) identified all selectors. No need for Knight to re-explore CSS.

---

## CONTEXT — Founder Feedback BP093

> "I could read it before. Now it's too tall and buries the info. The old design fit more per scroll — brochure density, not magazine density. Tune it back without losing the v2 tokens."

The v2 homepage was ported from `mnemosynec-design-demo-v2 (2).html` at BP093. The refresh pushed hero padding and section spacing into magazine territory. Target: above-the-fold shows headline + sub + Download button + first 1–2 body paragraphs. Currently above-the-fold shows barely the headline.

**PRESERVE** (hard canon — do not touch):
- v2 design tokens: `#4fc3d0` teal · Inter + IBM Plex Mono · amber `#f5b942`
- substrate-compounding chart embed (SVG img in `.cw-box`)
- Gold alpha banner with "Substrate Replaces New Data Centers."
- License modal at Download
- Knowledge Lifecycle section
- Frontier Mesh section (currently: Architecture / Three Layers flip cards)
- Three Tiers section (currently: Commercial License section)
- Footer with liturgy ("Let's Help Each Other Help Ourselves" + "For Alford")

---

## TARGET FILE

All CSS edits go to the inline `<style>` block in:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html
```

The entire v2 CSS lives in the `<style>` block at lines 15–235 of that file. There is no separate `.css` file for the homepage.

---

## TASK 1 — Hero CSS Compression

**Current** (line 93 of mnemosynec-homepage.html):
```css
.hero{padding-block:clamp(var(--space-16),10vw,var(--space-24));...}
```
`--space-16 = 4rem`, `--space-24 = 6rem` → hero runs 4–6rem top + bottom = 8–12rem total vertical padding. With the mascot image (240px), headline, and sub this pushes hero to ~70% of viewport.

**Target**: hero fits in ~40% of initial viewport.

**Edit** — find this exact string in the `<style>` block and replace:

FIND:
```
.hero{padding-block:clamp(var(--space-16),10vw,var(--space-24));
```
REPLACE WITH:
```
.hero{padding-block:clamp(var(--space-6),4vw,var(--space-10));
```
This reduces hero vertical padding to clamp(1.5rem, 4vw, 2.5rem) per side — ~3–5rem total vs 8–12rem current. Target: hero occupies ~35–45% of a 1080p viewport.

Also compress the mascot image size in the hero to prevent it from vertically dominating. Find this in the HTML body of the same file:

FIND:
```
width="240" height="240"
             style="object-fit:cover;border-radius:var(--radius-xl);background:#ffffff;box-shadow:0 0 0 4px var(--primaryHl),var(--shadowLg);display:block"
```
REPLACE WITH:
```
width="180" height="180"
             style="object-fit:cover;border-radius:var(--radius-xl);background:#ffffff;box-shadow:0 0 0 4px var(--primaryHl),var(--shadowLg);display:block"
```

---

## TASK 2 — Remove Dark Band Between Alpha Banner and Nav

**Diagnosis**: The page render order in `baseof.html` is:
1. `partial "alpha-banner.html"` → amber gold stripe (correct)
2. `partialCached "header.html"` → PaperMod's default `<header class="header"><nav class="nav">` — THIS is the dark band (~50–80px), the PaperMod nav sitting between the alpha banner and the custom `.nav` inside `mnemosynec-homepage.html`
3. `<main class="main">` → renders the homepage partial which opens with its OWN `.nav` block

**The dark band = PaperMod's default header.html**, which is unconditionally injected in baseof.html.

**Fix approach** — in `baseof.html`, wrap the header partial in an `isMnemosynec` guard to suppress it on the MnemosyneC homepage:

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\_default\baseof.html`

FIND:
```
    {{- partial "alpha-banner.html" . -}}
    {{ partialCached "header.html" . .Page -}}
```
REPLACE WITH:
```
    {{- partial "alpha-banner.html" . -}}
    {{- if not .Site.Params.isMnemosynec }}
    {{ partialCached "header.html" . .Page -}}
    {{- end }}
```

This suppresses the PaperMod nav entirely on .org (which sets `isMnemosynec = true` in config). The custom `.nav` inside `mnemosynec-homepage.html` serves as the sole nav. The .ai site (no `isMnemosynec` param) is unaffected.

**Verify** after edit: no double nav visible on .org, PaperMod nav still visible on any Cephas museum pages.

---

## TASK 3 — Three Layers: Make All Cards Simultaneously Visible

**Diagnosis**: The Three Layers section uses flip cards (`.fp > .fc` with `.ff-f` front / `.ff-b` back), NOT `<details>` elements. The front faces are already visible by default. The issue is `min-height:300px` on `.fc` and the flip card perspective overhead.

**Option A (recommended — lighter touch)**: Reduce `min-height` so cards don't consume excess vertical space, and reduce the gap in the arch grid.

FIND in the `<style>` block:
```
.fc{position:relative;min-height:300px;transform-style:preserve-3d;transition:transform .65s cubic-bezier(0.16,1,0.3,1)}
```
REPLACE WITH:
```
.fc{position:relative;min-height:220px;transform-style:preserve-3d;transition:transform .65s cubic-bezier(0.16,1,0.3,1)}
```

FIND:
```
.ag{display:grid;gap:var(--space-5);margin-top:var(--space-8)}
```
REPLACE WITH:
```
.ag{display:grid;gap:var(--space-4);margin-top:var(--space-5)}
```

**Option B (more aggressive — Founder may prefer)**: Replace flip cards with a static 3-column grid that shows all content simultaneously, no flip interaction. This would require more significant HTML surgery. Bishop recommends Option A for this pass — recovers density without losing the interactive flip mechanic that showcases the architecture.

---

## TASK 4 — Section Spacing Compression

**Current**: `section{padding-block:clamp(var(--space-12),6vw,var(--space-24))}` = clamp(3rem, 6vw, 6rem) per section, top and bottom. With 6 sections + 3 `<hr class="div">` dividers this stacks to enormous scroll depth.

**Target**: Reduce by ~35%.

FIND in the `<style>` block:
```
section{padding-block:clamp(var(--space-12),6vw,var(--space-24))}
```
REPLACE WITH:
```
section{padding-block:clamp(var(--space-8),4vw,var(--space-16))}
```
This changes the range from clamp(3rem, 6vw, 6rem) → clamp(2rem, 4vw, 4rem). Approximately 33% reduction.

Also compress chart box top margin:

FIND:
```
.cw-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-8);box-shadow:var(--shadowSm);margin-top:var(--space-8)}
```
REPLACE WITH:
```
.cw-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-5);box-shadow:var(--shadowSm);margin-top:var(--space-5)}
```

Compress KPI strip top margin:

FIND:
```
.kpi-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--divider);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;margin-top:var(--space-6)}
```
REPLACE WITH:
```
.kpi-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--divider);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;margin-top:var(--space-4)}
```

Also reduce the KPI cell padding:

FIND:
```
.kc{background:var(--surface);padding:var(--space-5) var(--space-6)}
```
REPLACE WITH:
```
.kc{background:var(--surface);padding:var(--space-3) var(--space-5)}
```

---

## TASK 5 — Sticky Nav: Compress Height

**Current**: `.nav{...padding:var(--space-3) var(--space-6)...}` = 0.75rem top + bottom = ~24px + logo 36px height = ~60px total nav height, sticky so it permanently consumes viewport real estate.

**Founder direct**: "make it shorter or scroll off."

**Bishop recommendation**: Compress to smaller padding. Removing sticky entirely risks users losing nav mid-page. Shorter is the lighter touch.

FIND:
```
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:var(--space-3) var(--space-6);display:flex;align-items:center;justify-content:space-between}
```
REPLACE WITH:
```
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:var(--space-2) var(--space-6);display:flex;align-items:center;justify-content:space-between}
```
`--space-2 = 0.5rem` vs `--space-3 = 0.75rem` — saves ~8px. Small but compounds with logo sizing.

Also reduce logo image size in nav from 36px to 28px:

FIND (in HTML body, not CSS):
```
<img src="/img/mascots/dr-mnemosynec.png" alt="Dr. MnemosyneC" width="36" height="36" style="border-radius:50%;object-fit:cover;border:2px solid var(--primaryHl);background:#fff" loading="lazy">
```
REPLACE WITH:
```
<img src="/img/mascots/dr-mnemosynec.png" alt="Dr. MnemosyneC" width="28" height="28" style="border-radius:50%;object-fit:cover;border:2px solid var(--primaryHl);background:#fff" loading="lazy">
```

---

## TASK 6 — Empirical Verification (Knight runs)

After making all edits and BEFORE deploy, verify:

```powershell
# 1. Hugo build completes without error
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo --minify 2>&1 | tail -5

# 2. Check build output size (should be similar to pre-tune)
ls public\index.html

# 3. Verify .org Firebase hosting config is targeted (NOT .ai)
cat firebase.json | Select-String "mnemosynec"
```

Visual verification target (Knight describes what is visible above the fold in a 1080p browser window after deploy):
- Alpha banner (amber, "PUBLIC ALPHA · Build Log Live · v0.7.1")
- Custom .nav (Dr. MnemosyneC logo + Download button)
- Hero eyebrow badge ("Free · Private · Works with any AI")
- H1 headline ("Your AI has Amnesia. Dr. MnemosyneC has the Cure: Substrate.")
- Hero sub paragraph ("Every time you start a new session…")
- Download button and "Read the Substrate →" button
- At least the start of the checkmark list

If the Download button is NOT visible above the fold on a 1080p screen, the hero compression is insufficient — reduce hero padding further to `clamp(var(--space-4), 3vw, var(--space-8))` and repeat.

**.ai confirmation**: After deploy, verify https://mnemosynec.ai still returns the preserved old design. A different ETag from https://mnemosynec.org confirms they are serving separate builds.

```powershell
curl -sI https://mnemosynec.org/ | Select-String "etag|200"
curl -sI https://mnemosynec.ai/ | Select-String "etag|200"
```

---

## TASK 7 — Hugo Build + Firebase Deploy

**Race-condition guard**: Ensure no other Hugo build is running before firing.

**Target hosting**: `mnemosynec` (mnemosynec.org) only. Do NOT deploy to any `.ai` Firebase target.

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Build
hugo --minify

# Deploy to .org only — verify the hosting target name before executing
firebase deploy --only hosting:mnemosynec
```

**If `hosting:mnemosynec` is not the correct target name**, run `firebase hosting:channel:list` first to list configured hosting targets and confirm. Do NOT guess the target name.

---

## TASK 8 — Yoke Return

Knight returns to BISHOP_DROPZONE with:

```
YOKE: KNIGHT_ORG_READABILITY_TUNE_BP093
STATUS: [PASS / PARTIAL / FAIL]
ELECTRON_TOUCHED: NO

ABOVE-FOLD PIXEL AUDIT (1080p):
- Alpha banner height: ___px
- Nav height: ___px
- Hero visible area before fold: ___px
- Download button visible above fold: [YES / NO]
- Hero approximate % of initial viewport: ___%

DARK BAND:
- PaperMod header suppressed on .org: [YES / NO]
- Double nav visible: [YES / NO]

TASKS COMPLETED:
- [ ] Task 1: Hero padding compressed
- [ ] Task 2: Dark band removed (baseof.html guard)
- [ ] Task 3: Flip card min-height reduced
- [ ] Task 4: Section spacing compressed
- [ ] Task 5: Sticky nav compressed
- [ ] Task 6: Empirical verification passed
- [ ] Task 7: Hugo build + Firebase deploy complete

DEPLOY URL: https://mnemosynec.org/
.AI SEPARATE CONFIRMED: [YES / NO]

ISSUES / BLOCKERS:
[List any, or "None"]
```

---

## BUNDLE RECOMMENDATION WITH SEG-AM

**SEG-AM** (separate dispatch) covers: .ai / .org Hugo hosting split + v0.7.2 version propagation. Both SEG-AM and SEG-AN touch the same Hugo build pipeline and Firebase deploy for .org.

**Bishop recommendation: YES, bundle into one Knight session.**

Reason: Both dispatches require `hugo --minify` + `firebase deploy --only hosting:mnemosynec`. Running them separately doubles build/deploy time and risks race conditions if Knight sessions overlap. Execute SEG-AM tasks first (version data + .ai split wiring), then apply this readability tune, then one combined build + deploy.

If SEG-AM is already in flight or the .ai split is not yet landed, execute this tune as a standalone and note "SEG-AM PENDING" in the Yoke return.

---

**Wall-clock estimate**: 30–45 min Knight · includes edit + build + deploy + empirical verify.

**Bishop out · SEG-AN sealed.**
