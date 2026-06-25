# KNIGHT PASTE — SEG-AO · Mercy Rename + Contrast Fixes
**Bishop:** Sonnet 4.6 · SEG-AO · BP093 2026-06-24  
**§17 BLOOD:** Read via curl + file Read only · no bash-grep · no discovery by find  
**Composer model check:** Sonnet 4.6 confirmed (model named in session header)  
**ELECTRON_TOUCHED:** NO  
**Composes with:** SEG-AN (hero compression + accordion + section spacing) · SEG-AM (to be bundled)

---

## PREAMBLE

Surgical accessibility + copy patches for mnemosynec.org. Two Founder-flagged issues from BP093 concurrent with SEG-AN structural tune. These touch different surfaces from SEG-AN and can be bundled into one Knight Yoke: single Hugo build, single Firebase deploy for .org only.

---

## CONTEXT — Founder Feedback BP093 2026-06-24

> 1. Remove all "mercy" references on the page. Specifically rename "The Decay Schedule — Mercy Persists, But Diminishes" to a different phrase. "Mercy" reads as internal Saladin's Pattern™ doctrine, doesn't land for first-time readers.
> 2. Contrast accessibility failures: "light gray on light blue background for buttons" AND "FREE FOREVER in light gray on light tan background" — both fail WCAG. Founder literally cannot read them.

---

## GADGET FINDINGS (Bishop empirical · 2026-06-24)

### "Mercy" on live .org HTML
Curl + Python scan of https://mnemosynec.org/:

- **Count: 1 occurrence** of "Mercy" in live HTML
- **Line:** `<div class="offer-headline">The Decay Schedule &mdash; <span>Mercy Persists, But Diminishes</span></div>`
- **Source file:** `layouts/partials/mnemosynec-homepage.html` line 599
- **No other "mercy"/"Mercy" found** anywhere in the live .org HTML

### Contrast failures identified

**BUTTON (.btn-s):**
- Element: `.btn-s` — the secondary button ("Read the Substrate →" in hero, "Prove It Yourself →" in benchmarks)
- CSS: `color:var(--textMuted)` = `#6b7280` on `background:var(--bg)` = `#f4f5f6` (light blue-gray)
- Current contrast ratio: **4.43:1** — WCAG AA minimum is 4.5:1 — FAILS by 0.07
- In dark mode: 4.88:1 (passes), so fix is light-mode specific

**"FREE FOREVER" / section heading contrast:**
- The `<h2 class="h2">Free Forever. <span style="color:var(--amber)">Commercial Operators: Read This.</span></h2>` in the commercial section
- The `.offer-section` background is `color-mix(in srgb, var(--amber) 4%, var(--bg))` ≈ `#f2f0ec` (light tan)
- "Free Forever." text color is `var(--text)` = `#1a1d21` — this part PASSES (15.5:1)
- BUT the `.offer-eyebrow` label ("SSPL Section 13 · Commercial License Window") and `.offer-headline span` ("Mercy Persists...") use `var(--amber)` = `#c47a0a` on the offer-header background `color-mix(amber 10%, surface)` ≈ `#f9f1e6`
- `.offer-eyebrow` contrast: **3.06:1** — FAILS WCAG AA (needs 4.5:1)
- The Founder's "FREE FOREVER in light gray on light tan" most likely refers to the `h2` secondary text span or the eyebrow — amber (`#c47a0a`) reads as "light gray" against the warm-tan background
- `.pb` badge (Verified · BPxxx) in Proofs: green `#1e7d43` on greenDim `#d4f1e2` = **4.30:1** — also borderline FAIL

---

## TASK 1 — Mercy Rename

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

**Line 599 — exact current text:**
```html
<div class="offer-headline">The Decay Schedule &mdash; <span>Mercy Persists, But Diminishes</span></div>
```

**Replace with:**
```html
<div class="offer-headline">The Decay Schedule &mdash; <span>The Window Persists, But Diminishes</span></div>
```

**Rationale:** "The Window Persists, But Diminishes" — lands for general readers because the page already uses "window" language (Window 1, Window 2... in the table below). Keeps the cadence. No doctrine reference. Reinforces the mechanic being described without requiring internal Saladin's Pattern vocabulary.

**Alternative if Founder prefers:** `Trust Persists, But Diminishes` — also clean, abstract, universal. Bishop recommends "Window" as stronger because it's self-referential to the table.

**Also: line 605 — second "Decay Schedule" occurrence:**
```html
<div style="...">The Decay Schedule &mdash; 30-Day Windows</div>
```
This is a table sub-label, NOT a "mercy" reference — leave untouched. It is accurate and clear.

**Scan of content/_index.md:** No "mercy" found. Clean.

**Scan for any other .org Hugo content "mercy":** Bishop Read of all partials and layouts confirms single occurrence in mnemosynec-homepage.html line 599 only.

---

## TASK 2 — Button Contrast Fix (.btn-s)

**File:** `layouts/partials/mnemosynec-homepage.html`

**Current CSS (minified in `<style>` block, search for `.btn-s{`):**
```css
.btn-s{background:transparent;color:var(--textMuted);border:1px solid var(--border);padding:var(--space-3) var(--space-6);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:500;text-decoration:none}
```

**Problem:** `color:var(--textMuted)` in light mode = `#6b7280` on `#f4f5f6` = **4.43:1** (FAILS WCAG AA by margin 0.07)

**Fix:** Change `color:var(--textMuted)` → `color:var(--text)` in the `.btn-s` rule.

```css
.btn-s{background:transparent;color:var(--text);border:1px solid var(--border);padding:var(--space-3) var(--space-6);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:500;text-decoration:none}
```

**Post-fix contrast:** `#1a1d21` on `#f4f5f6` = **15.49:1** (WCAG AAA ✓)
**Dark mode post-fix:** `#d8dce0` on `#0c0d0e` = passes (no change needed, dark already passes with textMuted)

**Note:** The `.btn-s:hover` rule adds `color:var(--text)` — so hover was already correct. This brings the default state up to match hover intent.

---

## TASK 3 — "FREE FOREVER" / Offer Section Contrast Fix

The Founder-described "FREE FOREVER in light gray on light tan background" maps to TWO elements in the commercial offer section:

### 3a — `.offer-eyebrow` label

**Current:** `color:var(--amber)` = `#c47a0a` on offer-header bg `≈ #f9f1e6` = **3.06:1 FAILS**

**Fix:** Change `.offer-eyebrow` to use a darker variant. Add a light-mode override:

```css
.offer-eyebrow{font-size:var(--text-xs);font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--amber)}
```
Replace with:
```css
.offer-eyebrow{font-size:var(--text-xs);font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);filter:brightness(0.7)}
```

**But filter approach affects all themes.** Cleaner fix: add a light-mode explicit color override inline or via CSS variable. The cleanest surgical patch is:

In the `:root,[data-theme="light"]` block, add:
```css
--amberLabel:#7a4d00;
```
And change `.offer-eyebrow{color:var(--amberLabel,var(--amber))}` — but that's two-file invasive.

**Simplest single-file fix:** Inline override on the offer-eyebrow element in the HTML:

**Line ~597-599 current:**
```html
<div class="offer-eyebrow">SSPL Section 13 &middot; Commercial License Window</div>
```
**Replace with:**
```html
<div class="offer-eyebrow" style="color:var(--text)">SSPL Section 13 &middot; Commercial License Window</div>
```
Post-fix: `#1a1d21` on `#f9f1e6` = **15.1:1** ✓

### 3b — h2 "Free Forever." + amber span

The `<h2 class="h2">Free Forever. <span style="color:var(--amber)">Commercial Operators: Read This.</span></h2>` — the "Free Forever." portion uses `var(--text)` (passes). The amber span "Commercial Operators: Read This." uses amber = **3.01:1 on offer-bg** — FAILS.

**Fix the span:**
```html
<h2 class="h2">Free Forever. <span style="color:var(--text);opacity:0.85">Commercial Operators: Read This.</span></h2>
```
OR more robustly:
```html
<h2 class="h2">Free Forever. <span style="color:var(--amber);font-weight:800">Commercial Operators: Read This.</span></h2>
```
The weight bump alone doesn't fix contrast. Best fix:
```html
<h2 class="h2">Free Forever. <span style="color:var(--text)">Commercial Operators: Read This.</span></h2>
```
Post-fix contrast: **15.5:1** ✓. The amber accent is preserved through the offer-eyebrow and table accent colors — the h2 sub-span in dark text is still visually distinct by weight difference from the main heading text if desired.

---

## TASK 4 — Scan for Additional Light-on-Light Failures

From Bishop Read of full mnemosynec-homepage.html source and contrast math:

| Element | CSS | Contrast | WCAG AA | Status |
|---------|-----|----------|---------|--------|
| `.btn-s` default text | textMuted on bg | 4.43:1 | 4.5:1 | ❌ FAIL (Task 2) |
| `.offer-eyebrow` | amber on offer-hdr | 3.06:1 | 4.5:1 | ❌ FAIL (Task 3) |
| h2 amber span | amber on offer-section-bg | 3.01:1 | 4.5:1 | ❌ FAIL (Task 3) |
| `.pb` badge (Proofs) | green #1e7d43 on greenDim #d4f1e2 | 4.30:1 | 4.5:1 | ❌ BORDERLINE FAIL |
| `.substrate-replaces-strip` body | textMuted on surfaceOff | ~4.2:1 | 4.5:1 | ⚠️ CHECK |
| `footer .fls a` | textMuted on bg | 4.43:1 | 4.5:1 | ❌ FAIL (same as btn-s) |

**Additional fix — `.pb` badge:**
The `.pb` badge CSS uses `background:var(--greenDim);color:var(--green)` = 4.30:1 in light mode. Fix:
```css
.pb{...;color:var(--green)}
```
Change to `color:var(--text)` in light mode — or add explicit override: `filter:brightness(0.75)` on green. Simplest: add `font-weight:800` (already has 700) — no contrast impact. Actual fix: in light CSS block, darken `--greenDim` to `#b8e8cc` which raises contrast. Or just set color to `#155e32` (4.82:1 pass). Bishop recommends inline style fix on `.pb`:

```css
.pb{...;color:#155e32}
```
(This is `var(--green)` darkened by ~20% — still reads as green, passes 4.8:1)

**Footer links (`.fls a`):** Same textMuted-on-bg failure as btn-s. Fix via:
```css
.fls a{color:var(--text);...}
```
Or more subtle:
```css
.fls a{color:var(--textMuted)}
```
and add a `:root,[data-theme="light"]` override setting textMuted to a darker value — but that's invasive. Surgical fix: in the `.fls a` rule, change to `color:var(--text)` — links in footer already have hover color, this just brings default up to AA.

---

## TASK 5 — Hugo Build + Firebase Deploy

```bash
# From: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\
hugo --minify

# Deploy to mnemosynec ONLY (NOT .ai):
firebase deploy --only hosting:mnemosynec
```

Confirm target in `firebase.json` — hosting site ID should be `mnemosynec` (not `lianabanyan-ai`).

---

## TASK 6 — Empirical Verification

```bash
# 1. Mercy count — expect 0:
curl -s https://mnemosynec.org/ | python -c "import sys; d=sys.stdin.read(); print('Mercy count:', d.count('Mercy'))"

# 2. Replacement text — expect 1:
curl -s https://mnemosynec.org/ | python -c "import sys; d=sys.stdin.read(); print('Window Persists count:', d.count('Window Persists, But Diminishes'))"

# 3. btn-s color class audit (visual or computed):
# In browser DevTools light mode: inspect .btn-s computed color
# Expect: rgb(26, 29, 33) [--text] not rgb(107, 114, 128) [--textMuted]

# 4. offer-eyebrow color:
# Expect: color:var(--text) inline style visible on element
```

---

## TASK 7 — Yoke Return

Knight return block should include:

```
MERCY_RENAME: COMPLETE
  - "Mercy Persists, But Diminishes" → "The Window Persists, But Diminishes"
  - Mercy count in live HTML: 0 ✓
  - Window Persists count: 1 ✓

CONTRAST_FIXES: COMPLETE
  - .btn-s: 4.43:1 → 15.49:1 (color:var(--text))
  - offer-eyebrow: 3.06:1 → 15.1:1 (color:var(--text) inline)
  - h2 amber span: 3.01:1 → 15.5:1 (color:var(--text))
  - .pb badge: 4.30:1 → 4.8:1 (#155e32)
  - footer .fls a: 4.43:1 → 15.49:1 (color:var(--text))

ELECTRON_TOUCHED: NO
DEPLOY: hosting:mnemosynec ONLY
```

---

## COMPOSITION NOTE — Bundle with SEG-AN + SEG-AM

Bishop recommends Knight run SEG-AN + SEG-AM + SEG-AO as ONE Yoke:

- All three touch `layouts/partials/mnemosynec-homepage.html`
- Single Hugo build, single Firebase deploy to hosting:mnemosynec
- Apply in order: SEG-AM edits → SEG-AN edits → SEG-AO edits → build → deploy
- Eliminates three separate build+deploy cycles

Bishop will compose the bundle paste once SEG-AN and SEG-AM both land in BISHOP_DROPZONE.

---

## SUMMARY TABLE

| Task | File | Change | Contrast Before | Contrast After |
|------|------|--------|----------------|----------------|
| Mercy rename | mnemosynec-homepage.html L599 | "Mercy Persists" → "The Window Persists" | n/a | n/a |
| .btn-s text | mnemosynec-homepage.html CSS | color: textMuted → text | 4.43:1 ❌ | 15.49:1 ✓ |
| offer-eyebrow | mnemosynec-homepage.html L597 | add style="color:var(--text)" | 3.06:1 ❌ | 15.1:1 ✓ |
| h2 amber span | mnemosynec-homepage.html L592 | span color → var(--text) | 3.01:1 ❌ | 15.5:1 ✓ |
| .pb badge | mnemosynec-homepage.html CSS | color: #155e32 (darkened green) | 4.30:1 ❌ | 4.8:1 ✓ |
| footer .fls a | mnemosynec-homepage.html CSS | color: textMuted → text | 4.43:1 ❌ | 15.49:1 ✓ |

*SEG-AO Bishop · BP093 · Sonnet 4.6 · 2026-06-24*
