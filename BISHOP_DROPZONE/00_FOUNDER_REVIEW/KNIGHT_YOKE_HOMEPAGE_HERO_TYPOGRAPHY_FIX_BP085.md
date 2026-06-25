# Knight Yoke — Homepage Hero Typography Fix · BP085
**Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.**

**BP085 §14 + §15 + §16 BLOOD honor. Truth-Always. Preserve all other copy verbatim.**

---

## Context

Four surgical edits to `mnemosynec.ai` (and `mnemosynec.org` via same Firebase target) homepage hero. Option B · Apple pattern — NO ™ symbols in hero · trademark notice moves to site footer instead. Trademarks legally protected via documented filings + footer notice.

Primary edit file:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html
```

Footer edit file (find whichever exists):
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\themes\PaperMod\layouts\partials\footer.html
```
(Or equivalent footer partial in layouts/partials/ if PaperMod path absent.)

**SEG-1 recon already complete by Bishop.** Findings follow — Knight does NOT re-recon.

---

## SEG-1 Recon Findings (pre-confirmed by Bishop · DO NOT REPEAT)

**Hero h1 — exact current text (line 666 of partial):**
```html
<h1>Your AI has Amnesia.<br>Dr.&nbsp;MnemosyneC&trade; has the Cure.<br><a href="/how-to-read-the-substrate/" class="mn-hero-substrate-link">Substrate.</a></h1>
```

**Duplicate nav-link block — exact current text (lines 705-721 of partial):**
```html
  <!-- Nav links stay at bottom of hero card (above first-session box) -->
  <p class="mn-hp-nav-links">
    <a href="/install/">Install guide</a>
    &nbsp;&middot;&nbsp;
    <a href="/how-it-works/">How it works</a>
    &nbsp;&middot;&nbsp;
    <a href="/proofs/">All proofs</a>
    &nbsp;&middot;&nbsp;
    <a href="/diagnosis/">The Diagnosis</a>
    &nbsp;&middot;&nbsp;
    <a href="/constellation/">Constellation</a>
    &nbsp;&middot;&nbsp;
    <a href="/about/">About</a>
    &nbsp;&middot;&nbsp;
    <a href="/community/">Community</a>
  </p>
```

**Top nav:** PaperMod `header.html` uses `site.Menus.main` (config-driven). The nav-link list above is a HERO-CARD-ONLY duplicate block, NOT the top nav. It lives inside `<div class="mn-hero-body-fullwidth">`.

**Knight's call (per Founder mandate):** Remove the hero card duplicate (keep top nav intact via config — untouched).

---

## SEG-2 · Apply 4 Surgical Edits (Option B · Apple Pattern · No ™ in Hero)

### Edit A + B — Merge Substrate onto same line AND strip ™ from hero h1

Replace the current h1:
```html
<h1>Your AI has Amnesia.<br>Dr.&nbsp;MnemosyneC&trade; has the Cure.<br><a href="/how-to-read-the-substrate/" class="mn-hero-substrate-link">Substrate.</a></h1>
```

With:
```html
<h1>Your AI has Amnesia.<br>Dr.&nbsp;MnemosyneC has the Cure.&nbsp;<a href="/how-to-read-the-substrate/" class="mn-hero-substrate-link">Substrate.</a></h1>
```

Result rendered: `Your AI has Amnesia. / Dr. MnemosyneC has the Cure. Substrate.` (two visual lines via `<br>`, not three · NO ™ on either name · clean Apple-pattern hero).

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

---

### Edit C — Remove duplicate nav-link block from hero card

Replace the entire nav-link comment + `<p class="mn-hp-nav-links">` block:
```html
  <!-- Nav links stay at bottom of hero card (above first-session box) -->
  <p class="mn-hp-nav-links">
    <a href="/install/">Install guide</a>
    &nbsp;&middot;&nbsp;
    <a href="/how-it-works/">How it works</a>
    &nbsp;&middot;&nbsp;
    <a href="/proofs/">All proofs</a>
    &nbsp;&middot;&nbsp;
    <a href="/diagnosis/">The Diagnosis</a>
    &nbsp;&middot;&nbsp;
    <a href="/constellation/">Constellation</a>
    &nbsp;&middot;&nbsp;
    <a href="/about/">About</a>
    &nbsp;&middot;&nbsp;
    <a href="/community/">Community</a>
  </p>
```

With: *(nothing — delete the block entirely)*

Do NOT touch the closing `</div><!-- /mn-hero-body-fullwidth -->` that follows. Only remove the comment + `<p>` block above it.

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

---

### Edit D — Add trademark notice to site footer

Locate the footer partial (check in order):
1. `themes/PaperMod/layouts/partials/footer.html`
2. `layouts/partials/footer.html`

Find the existing copyright line (typically contains `©` or `{{- $copyrighthtml -}}`). Append below it:

```html
<p style="font-size:0.75rem;opacity:0.65;margin-top:0.25rem;">Dr. MnemosyneC &middot; Substrate &middot; Cooperative Universal Substrate &middot; MnemosyneC are trademarks of Liana Banyan Corporation.</p>
```

Style intent: small text · same font family as existing copyright · low visual weight · legally complete. Inline style is acceptable if no existing trademark class. Do NOT introduce a new CSS file for this one line.

---

### Constraints on SEG-2

- Preserve ALL other copy verbatim.
- The "Cooperative Universal Substrate™" reference in body copy BELOW the hero MAY keep its `&trade;` — it is the formal product name, used once, not in hero.
- Do NOT touch `Dr. MnemosyneC™` references on /proofs/ · /download/ · /tools/ · or any other page. Only HOMEPAGE hero h1 gets the ™ stripped.
- Do NOT touch any publish drafts.
- Only `mnemosynec-homepage.html` (Edits A+B+C) and the footer partial (Edit D).

---

## SEG-3 · Hugo Build + Firebase Deploy

Run in sequence. Exit 0 required on both or STOP and report.

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --minify --config config-mnemosynec.toml
```

Then:
```powershell
firebase deploy --only hosting:mnemosyne
```

If either exits non-zero: report the exact error. DO NOT deploy a broken build.

---

## SEG-4 · Live Verify · 7 Sharps

Wait ~30 seconds after deploy for CDN propagation, then run all 7.

### Sharp 1 — HTTP 200 + Content-Type text/html
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing
$r.StatusCode          # must be 200
$r.Headers["Content-Type"]  # must contain "text/html"
```

### Sharp 2 — "the Cure. Substrate." on SAME LINE (verbatim · no `<br>` between them)
```powershell
$html = (Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing).Content
if ($html -match 'the Cure\.&nbsp;<a[^>]*>Substrate\.') { "SHARP 2 GREEN" } else { "SHARP 2 RED" }
```

### Sharp 3 — No ™ on "Dr. MnemosyneC" in hero h1 (Option B clean hero)
```powershell
if ($html -notmatch 'MnemosyneC&trade; has the Cure') { "SHARP 3 GREEN — no ™ in hero h1" } else { "SHARP 3 RED — ™ still in hero h1" }
```

### Sharp 4 — Duplicate nav-link block GONE from hero (no `mn-hp-nav-links` in HTML)
```powershell
if ($html -notmatch 'mn-hp-nav-links') { "SHARP 4 GREEN" } else { "SHARP 4 RED — duplicate nav still present" }
```

### Sharp 5 — Top nav menu links still present (PaperMod nav via `<ul id="menu">`)
```powershell
if ($html -match '<ul id="menu"') { "SHARP 5 GREEN" } else { "SHARP 5 RED" }
```

### Sharp 6 — Trademark notice present in footer
```powershell
if ($html -match 'trademarks of Liana Banyan Corporation') { "SHARP 6 GREEN" } else { "SHARP 6 RED — trademark notice missing from footer" }
```

### Sharp 7 — "Cooperative Universal Substrate" body copy unaffected (body section present)
```powershell
if ($html -match 'Cooperative Universal Substrate') { "SHARP 7 GREEN" } else { "SHARP 7 RED" }
```

---

## 7 Sharps Return Table

Return this table with GREEN/RED status in your Yoke Return:

| # | Sharp | Expected | Result |
|---|-------|----------|--------|
| 1 | HTTP 200 + text/html | GREEN | |
| 2 | "the Cure. Substrate." single line | GREEN | |
| 3 | No ™ in hero h1 (Option B) | GREEN | |
| 4 | mn-hp-nav-links GONE from HTML | GREEN | |
| 5 | `<ul id="menu"` present (top nav) | GREEN | |
| 6 | Trademark notice in footer | GREEN | |
| 7 | Cooperative Universal Substrate in body | GREEN | |

All 7 must be GREEN. Any RED = do not mark complete, report blocker.

---

## Constraints Summary

- Sonnet 4.6 mandate (SEG-model only)
- BP085 §14 + §15 + §16 BLOOD
- Truth-Always · honest errors · no invented GREENs
- Preserve all other copy verbatim (BUILT IN PUBLIC voice)
- NEVER SCROLL SIDEWAYS (BP081 UX canon) — no new horizontal overflow introduced
- Option B / Apple pattern: NO ™ in hero h1 · trademark notice in footer only
- "Cooperative Universal Substrate™" in body copy below hero is UNTOUCHED
- Do NOT touch /proofs/ · /download/ · /tools/ — only homepage hero partial + footer
- Do NOT touch top nav (header.html) · only mnemosynec-homepage.html + footer partial

---

## Paste-Ready Knight Wake

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read the full Yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_HOMEPAGE_HERO_TYPOGRAPHY_FIX_BP085.md

4 surgical edits to mnemosynec.ai homepage — Option B (Apple pattern): no ™ in hero h1, trademark notice moved to site footer. SEG-1 recon is pre-done by Bishop — read the findings in the Yoke, do not re-recon. Proceed directly to SEG-2 edits (A+B strip ™ + merge Substrate · C remove duplicate nav · D add footer trademark notice) → SEG-3 build+deploy → SEG-4 live verify (7 Sharps). Return the 7 Sharps table GREEN/RED. BP085 §14+§15+§16 BLOOD. Est runtime 15-20 min.
```

---

*Composed by Bishop · BP085 · Sonnet 4.6 SEG · 2026-06-18 · Option B revision*
