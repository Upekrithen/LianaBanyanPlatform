# KNIGHT YOKE PASTE — DOMAIN SPLIT + READABILITY TUNE + CONTRAST FIXES — BUNDLE
## BP093 · SEG-AM + SEG-AN + SEG-AO CONSOLIDATED · Sonnet 4.6 · §3 §14 §15 §17 BLOOD

**COMPOSER MODEL CHECK:** Claude Sonnet 4.6 · Bishop-authored · Knight executes only. Forbidden: any model other than Sonnet 4.6 composing or expanding this paste. Forbidden: bash-grep/find for discovery. Forbidden: deploying without Phase 5 verification gate.

**§17 BLOOD:** Use segs before every task. Read sources, do not discover by exploration.
**§14 BLOOD:** Gadget-first. Never claim success without empirical curl confirmation.
**§15 BLOOD:** Supabase/DB direct = Bishop lane. Hugo build + Firebase deploy = Knight lane ONLY. NO Bishop-direct Hugo/Firebase deploys per `feedback_knight_is_operator_mechanic`.
**§3:** Cooperative canon applies. Postgres only if any SQL runs. No SQLite primitives.

---

## 1. PREAMBLE

This bundle consolidates three Bishop SEGs from BP093 morning into one Marathon-class Knight Yoke. All three phases touch `layouts/partials/mnemosynec-homepage.html` and feed into a single Hugo build + dual Firebase deploy. Running them separately would triple build time and risk race conditions.

**Execution order:** Phase 1 (domain split wiring) → Phase 2 (readability edits to same file) → Phase 3 (rename override + contrast fixes to same file) → Phase 4 (single Hugo build + dual Firebase deploy) → Phase 5 (empirical verification).

**FOUNDER-DIRECT OVERRIDE ON PHASE 3 RENAME (BP093 2026-06-24):**
SEG-AO recommended "The Window Persists, But Diminishes." Founder direct BP093 overrides this. Knight applies verbatim Founder phrase instead:

> **"Get it While It's Hot — Pricing Cool-down Schedule"**

Exact HTML replacement at line 599 of `mnemosynec-homepage.html`:

```
OLD: <div class="offer-headline">The Decay Schedule &mdash; <span>Mercy Persists, But Diminishes</span></div>
NEW: <div class="offer-headline">Get it While It's Hot &mdash; <span>Pricing Cool-down Schedule</span></div>
```

SEG-AO's "Window Persists" recommendation is SUPERSEDED and must NOT be applied.

Additionally: Knight scans the offer section body copy for instances where "decay" reads naturally as "cool-down" and lists candidates in the Yoke Return for Founder ratify. Do NOT auto-apply those. Surface list only.

---

## 2. OVERVIEW TABLE

| Phase | Content | Files Touched | Est. Wall-Clock | ELECTRON_TOUCHED |
|-------|---------|---------------|-----------------|-----------------|
| Phase 1 | .ai preservation branch + 2nd Firebase target + v0.7.2 .org wiring | `firebase.json` · `.firebaserc` · git branch | ~20–30 min | NO |
| Phase 2 | .org readability tune — hero padding · baseof.html guard · flip-card · section spacing | `mnemosynec-homepage.html` · `baseof.html` | ~10 min | NO |
| Phase 3 | Mercy rename (Founder override) + 6 contrast WCAG fixes | `mnemosynec-homepage.html` | ~10 min | NO |
| Phase 4 | Single Hugo build (.org) + preserve build (.ai) + dual Firebase deploy | build artifacts | ~5–10 min | NO |
| Phase 5 | Empirical verification — curls + ETag + contrast audit | read-only | ~10 min | NO |
| **TOTAL** | | | **~55–70 min** | **NO** |

**Sequential, NOT parallel.** Phase 2 and Phase 3 both edit `mnemosynec-homepage.html` — Phase 2 must fully complete before Phase 3 begins. Phase 4 must not fire until both Phase 2 and Phase 3 are complete.

---

## 3. PHASE 1 — .ai PRESERVATION + 2nd FIREBASE TARGET + v0.7.2 .ORG WIRING

**Source:** `KNIGHT_SPLIT_AI_OLD_ORG_NEW_PLUS_V072_PROPAGATE_BP093.md` (read in full before executing)

**§17 CHECK at start of Phase 1:** Confirm you are on branch `knight-mamba-phoenix-flight-bp092` before any action.

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
git branch --show-current
```

Expected: `knight-mamba-phoenix-flight-bp092`. If not, STOP and surface to Bishop.

---

### PHASE 1 · TASK 1 — Cut Preservation Branch at Pre-Phoenix-Flight Commit

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Confirm sha before cutting
git show e9aa242 --oneline | head -1

# Cut preservation branch
git branch preserve-pre-marathon-design-v0.7.1-bp093 e9aa242

# Confirm branch exists
git branch --list preserve-pre-marathon-design-v0.7.1-bp093
```

**§17 CHECK:** Output must show `preserve-pre-marathon-design-v0.7.1-bp093` pointing to `e9aa242`. Do NOT checkout this branch — stay on `knight-mamba-phoenix-flight-bp092` for all .org edits.

---

### PHASE 1 · TASK 2 — Build .ai Preserved Hugo to public-mnemosynec-ai/

Build from the preservation branch via git worktree (isolated — does not alter working tree):

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Add worktree from preservation branch
git worktree add ../cephas-hugo-ai-preserve preserve-pre-marathon-design-v0.7.1-bp093

# Build from worktree → output to main dir's public-mnemosynec-ai/
cd ../cephas-hugo-ai-preserve
hugo --config config-mnemosynec.toml --destination ../cephas-hugo/public-mnemosynec-ai

# Confirm output
ls ../cephas-hugo/public-mnemosynec-ai/index.html

# Remove worktree (clean up)
cd ../cephas-hugo
git worktree remove ../cephas-hugo-ai-preserve
```

**§17 CHECK:** Confirm `public-mnemosynec-ai/index.html` exists. Confirm dc-savings-stats is ABSENT (Phoenix-Flight additions must not appear in the preserved build):

```powershell
Select-String -Path "public-mnemosynec-ai/index.html" -Pattern "dc-savings-stats" -SimpleMatch | Measure-Object
```

Expected: Count = 0. If Count > 0, the worktree built from the wrong commit — STOP and surface to Bishop.

---

### PHASE 1 · TASK 3 — Add Second Firebase Hosting Target

#### TASK 3A — Edit firebase.json

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\firebase.json`

In the `"hosting"` array, APPEND the following new entry AFTER the closing `}` of the existing `mnemosyne` block and BEFORE the final `]`:

```json
,
{
  "target": "mnemosynec-ai",
  "public": "public-mnemosynec-ai",
  "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
  "headers": [
    {
      "source": "**/*.html",
      "headers": [{"key": "Cache-Control", "value": "max-age=300"}]
    },
    {
      "source": "**/*.css",
      "headers": [{"key": "Cache-Control", "value": "max-age=86400"}]
    },
    {
      "source": "**/*.js",
      "headers": [{"key": "Cache-Control", "value": "max-age=86400"}]
    },
    {
      "source": "/download/**.exe",
      "headers": [
        {"key": "Content-Disposition", "value": "attachment"},
        {"key": "Content-Type", "value": "application/octet-stream"},
        {"key": "Cache-Control", "value": "public, max-age=3600"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-LB-Version", "value": "v0.1.0"},
        {"key": "X-LB-Phase", "value": "preserve"}
      ]
    }
  ]
}
```

Verify firebase.json is valid JSON after edit:

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
node -e "JSON.parse(require('fs').readFileSync('firebase.json','utf8')); console.log('JSON valid')"
```

Expected: `JSON valid`. If parse error, DO NOT proceed — fix the JSON and re-verify before continuing.

#### TASK 3B — Edit .firebaserc

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\.firebaserc`

In the `"hosting"` object under `"lianabanyan-403dc"`, add the new target alias.

FIND this exact block:
```json
"hosting": {
  "cephas": ["cephas-lianabanyan"],
  "museum": ["lianabanyan-museum"],
  "mnemosyne": ["mnemosyne-lianabanyan"]
}
```

REPLACE WITH:
```json
"hosting": {
  "cephas": ["cephas-lianabanyan"],
  "museum": ["lianabanyan-museum"],
  "mnemosyne": ["mnemosyne-lianabanyan"],
  "mnemosynec-ai": ["mnemosynec-ai-lianabanyan"]
}
```

#### TASK 3C — Firebase CLI: Create Site + Apply Target

The Firebase hosting site `mnemosynec-ai-lianabanyan` must exist before deploy. If it does not exist, create it, then apply the target alias:

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Create the Firebase hosting site (skip if it already exists — CLI will report "already exists")
firebase hosting:sites:create mnemosynec-ai-lianabanyan --project lianabanyan-403dc

# Apply the target alias
firebase target:apply hosting mnemosynec-ai mnemosynec-ai-lianabanyan --project lianabanyan-403dc

# Confirm both targets are listed
firebase target:list --project lianabanyan-403dc
```

**§17 CHECK:** `firebase target:list` must show BOTH:
- `mnemosyne → mnemosyne-lianabanyan`
- `mnemosynec-ai → mnemosynec-ai-lianabanyan`

Do NOT proceed to Phase 4 deploy until both are confirmed.

**TRUTH-ALWAYS:** If Firebase CLI returns an error on site creation, report BLOCKED with exact error text. Do not invent a workaround.

---

### PHASE 1 · TASK 4 — Verify v0.7.2 Already in version_trust.json

Bishop SEG-AM confirmed `data/version_trust.json` already has `"version": "0.7.2"` as `"tier": "latest"`. No data file edit required — Hugo rebuild in Phase 4 will propagate it into the built HTML.

**§17 QUICK CHECK** (read-only — confirm no drift since SEG-AM):

```powershell
Get-Content "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version_trust.json" | Select-Object -First 10
```

Expected: top entry shows `"version": "0.7.2"` with `"tier": "latest"`. If it shows `0.7.1` as latest, STOP — surface to Bishop before building.

---

> **CRITICAL FOUNDER ACTION FLAG — PHASE 1:**
> After Knight creates `mnemosynec-ai-lianabanyan` Firebase hosting site, Founder must wire the `mnemosynec.ai` custom domain in Firebase Console. This is a UI action, NOT a Knight action.
> Path: Firebase Console → Hosting → mnemosynec-ai-lianabanyan → Add custom domain → `mnemosynec.ai`
> DNS propagation: up to 24 hours after wiring.
> Knight flags this in the Yoke Return as "PENDING FOUNDER ACTION IN FIREBASE CONSOLE."

---

## 4. PHASE 2 — .ORG READABILITY TUNE (DO NOT BUILD/DEPLOY YET)

**Source:** `KNIGHT_ORG_READABILITY_TUNE_BROCHURE_DENSITY_BP093.md` (read in full before executing)

**§17 CHECK at start of Phase 2:** Confirm you are on branch `knight-mamba-phoenix-flight-bp092`. Confirm Phase 1 Tasks 1–4 are complete and no worktree is active.

**Target file for all CSS edits:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

**PRESERVE (do not touch):** v2 design tokens (`#4fc3d0` teal · Inter + IBM Plex Mono · amber `#f5b942`) · substrate-compounding chart SVG · gold alpha banner · license modal · Knowledge Lifecycle section · Frontier Mesh flip cards · Three Tiers section · Footer liturgy.

Phase 3 also edits `mnemosynec-homepage.html` — do NOT build or deploy between Phase 2 and Phase 3.

---

### PHASE 2 · TASK 1 — Hero CSS Compression

File: `mnemosynec-homepage.html` — edit the `<style>` block.

**Edit A — Hero padding:**

FIND (exact string in `<style>` block):
```
.hero{padding-block:clamp(var(--space-16),10vw,var(--space-24));
```

REPLACE WITH:
```
.hero{padding-block:clamp(var(--space-6),4vw,var(--space-10));
```

This changes hero vertical padding from clamp(4rem, 10vw, 6rem) → clamp(1.5rem, 4vw, 2.5rem) per side. Recovers approximately 5–9rem of vertical space in the hero. Target: hero occupies ~35–45% of 1080p viewport.

**Edit B — Mascot image size in hero (HTML body, not CSS):**

FIND (exact string):
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

### PHASE 2 · TASK 2 — Suppress PaperMod Default Header on .org (Dark Band Removal)

**Diagnosis:** PaperMod's `header.html` partial is unconditionally injected in `baseof.html` between the alpha-banner and the `<main>` block. This renders a dark band (~50–80px) between the amber alpha banner and the custom `.nav` inside `mnemosynec-homepage.html`. The custom `.nav` in the homepage partial is the sole intended nav for .org.

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\_default\baseof.html`

FIND (exact string):
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

**Effect:** Pages using `config-mnemosynec.toml` (which sets `isMnemosynec = true`) suppress the PaperMod nav. All Cephas museum pages (no `isMnemosynec` param) continue to show the PaperMod nav unaffected. The .ai site (no `isMnemosynec` param in its build) is unaffected.

**§17 CHECK:** After edit, confirm no double nav visible — the custom `.nav` inside `mnemosynec-homepage.html` is the only nav on .org.

---

### PHASE 2 · TASK 3 — Flip Card min-height Reduction (Three Layers Section)

File: `mnemosynec-homepage.html` — edit `<style>` block.

**Edit A — Flip card min-height:**

FIND (exact string):
```
.fc{position:relative;min-height:300px;transform-style:preserve-3d;transition:transform .65s cubic-bezier(0.16,1,0.3,1)}
```

REPLACE WITH:
```
.fc{position:relative;min-height:220px;transform-style:preserve-3d;transition:transform .65s cubic-bezier(0.16,1,0.3,1)}
```

**Edit B — Architecture grid gap + margin:**

FIND (exact string):
```
.ag{display:grid;gap:var(--space-5);margin-top:var(--space-8)}
```

REPLACE WITH:
```
.ag{display:grid;gap:var(--space-4);margin-top:var(--space-5)}
```

Bishop recommends Option A (lighter touch) — preserves the flip interaction mechanic. Option B (full static grid) would require HTML surgery and is deferred to a future pass if Founder prefers after seeing Option A live.

---

### PHASE 2 · TASK 4 — Section Spacing Compression

File: `mnemosynec-homepage.html` — edit `<style>` block.

**Edit A — Section padding:**

FIND (exact string):
```
section{padding-block:clamp(var(--space-12),6vw,var(--space-24))}
```

REPLACE WITH:
```
section{padding-block:clamp(var(--space-8),4vw,var(--space-16))}
```

Range changes from clamp(3rem, 6vw, 6rem) → clamp(2rem, 4vw, 4rem). Approximately 33% reduction.

**Edit B — Chart box spacing:**

FIND (exact string):
```
.cw-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-8);box-shadow:var(--shadowSm);margin-top:var(--space-8)}
```

REPLACE WITH:
```
.cw-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-5);box-shadow:var(--shadowSm);margin-top:var(--space-5)}
```

**Edit C — KPI strip top margin:**

FIND (exact string):
```
.kpi-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--divider);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;margin-top:var(--space-6)}
```

REPLACE WITH:
```
.kpi-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--divider);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;margin-top:var(--space-4)}
```

**Edit D — KPI cell padding:**

FIND (exact string):
```
.kc{background:var(--surface);padding:var(--space-5) var(--space-6)}
```

REPLACE WITH:
```
.kc{background:var(--surface);padding:var(--space-3) var(--space-5)}
```

---

### PHASE 2 · TASK 5 — Sticky Nav Height Compression

File: `mnemosynec-homepage.html` — edit `<style>` block AND HTML body.

**Edit A — Nav CSS padding:**

FIND (exact string):
```
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:var(--space-3) var(--space-6);display:flex;align-items:center;justify-content:space-between}
```

REPLACE WITH:
```
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:var(--space-2) var(--space-6);display:flex;align-items:center;justify-content:space-between}
```

`--space-2 = 0.5rem` vs `--space-3 = 0.75rem`. Saves ~8px. Sticky nav remains functional for mid-page navigation.

**Edit B — Nav logo image size (HTML body):**

FIND (exact string):
```
<img src="/img/mascots/dr-mnemosynec.png" alt="Dr. MnemosyneC" width="36" height="36" style="border-radius:50%;object-fit:cover;border:2px solid var(--primaryHl);background:#fff" loading="lazy">
```

REPLACE WITH:
```
<img src="/img/mascots/dr-mnemosynec.png" alt="Dr. MnemosyneC" width="28" height="28" style="border-radius:50%;object-fit:cover;border:2px solid var(--primaryHl);background:#fff" loading="lazy">
```

---

**Phase 2 complete. DO NOT build or deploy yet. Proceed directly to Phase 3.**

---

## 5. PHASE 3 — MERCY RENAME (FOUNDER OVERRIDE) + CONTRAST WCAG FIXES

**Source:** `KNIGHT_MERCY_RENAME_CONTRAST_FIXES_BP093.md` (read in full before executing)

**§17 CHECK at start of Phase 3:** Confirm Phase 2 edits are applied to `mnemosynec-homepage.html` and `baseof.html` before executing any Phase 3 edit. Both phases touch the same file — order matters.

**Target file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

---

### PHASE 3 · TASK 1 — Mercy Rename (FOUNDER OVERRIDE APPLIES)

**OVERRIDE:** SEG-AO recommended "The Window Persists, But Diminishes." Founder direct BP093 2026-06-24 overrides this. Apply ONLY the Founder verbatim phrase.

File: `mnemosynec-homepage.html` — line 599.

**Current text (exact):**
```html
<div class="offer-headline">The Decay Schedule &mdash; <span>Mercy Persists, But Diminishes</span></div>
```

**REPLACE WITH (Founder verbatim — apply exactly):**
```html
<div class="offer-headline">Get it While It's Hot &mdash; <span>Pricing Cool-down Schedule</span></div>
```

**Do NOT apply** SEG-AO's "The Window Persists, But Diminishes" — that recommendation is superseded.

**Line 605 — leave untouched:**
```html
<div style="...">The Decay Schedule &mdash; 30-Day Windows</div>
```
This table sub-label is accurate and clear. Not a "mercy" reference. No edit.

---

### PHASE 3 · TASK 2 — Button Contrast Fix (.btn-s)

File: `mnemosynec-homepage.html` — `<style>` block.

**Current CSS (search for `.btn-s{`):**
```css
.btn-s{background:transparent;color:var(--textMuted);border:1px solid var(--border);padding:var(--space-3) var(--space-6);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:500;text-decoration:none}
```

Problem: `color:var(--textMuted)` in light mode = `#6b7280` on `#f4f5f6` = 4.43:1. WCAG AA minimum = 4.5:1. FAILS by 0.07.

FIND (exact string):
```
.btn-s{background:transparent;color:var(--textMuted);border:1px solid var(--border);padding:var(--space-3) var(--space-6);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:500;text-decoration:none}
```

REPLACE WITH:
```
.btn-s{background:transparent;color:var(--text);border:1px solid var(--border);padding:var(--space-3) var(--space-6);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:500;text-decoration:none}
```

Post-fix contrast: `#1a1d21` on `#f4f5f6` = **15.49:1** (WCAG AAA). Dark mode also passes (no change needed).

---

### PHASE 3 · TASK 3 — Offer Section Contrast Fixes

#### TASK 3a — .offer-eyebrow (HTML body edit, NOT CSS rule)

File: `mnemosynec-homepage.html` — line ~597.

Current contrast: amber `#c47a0a` on offer-header bg `≈ #f9f1e6` = **3.06:1 FAILS** WCAG AA.

FIND (exact string):
```html
<div class="offer-eyebrow">SSPL Section 13 &middot; Commercial License Window</div>
```

REPLACE WITH:
```html
<div class="offer-eyebrow" style="color:var(--text)">SSPL Section 13 &middot; Commercial License Window</div>
```

Post-fix: `#1a1d21` on `#f9f1e6` = **15.1:1** ✓

#### TASK 3b — h2 amber span in offer section

File: `mnemosynec-homepage.html` — line ~592.

Current: amber span "Commercial Operators: Read This." = `#c47a0a` on offer-section-bg `≈ #f2f0ec` = **3.01:1 FAILS** WCAG AA.

FIND (exact string):
```html
<h2 class="h2">Free Forever. <span style="color:var(--amber)">Commercial Operators: Read This.</span></h2>
```

REPLACE WITH:
```html
<h2 class="h2">Free Forever. <span style="color:var(--text)">Commercial Operators: Read This.</span></h2>
```

Post-fix: **15.5:1** ✓. Amber accent is preserved through offer-eyebrow and table accent colors. The h2 span in dark text remains visually distinct by weight from the main heading.

---

### PHASE 3 · TASK 4 — .pb Badge Darkened Green

File: `mnemosynec-homepage.html` — `<style>` block.

Current: `.pb` badge uses `color:var(--green)` = `#1e7d43` on `var(--greenDim)` = `#d4f1e2` = **4.30:1 FAILS** WCAG AA (borderline).

FIND (exact string — search for `.pb{` in style block to locate full rule):
The `.pb` CSS rule — change `color:var(--green)` to `color:#155e32`.

`#155e32` is `var(--green)` darkened ~20% — still reads as green, raises contrast to ~4.8:1. ✓

If the `.pb` rule is minified and combined with other rules, locate and change ONLY `color:var(--green)` within the `.pb{...}` selector to `color:#155e32`. Do not alter any other property.

---

### PHASE 3 · TASK 5 — Footer Link Contrast Fix (.fls a)

File: `mnemosynec-homepage.html` — `<style>` block.

Current: `.fls a` uses `color:var(--textMuted)` = `#6b7280` on `var(--bg)` = `#f4f5f6` = **4.43:1 FAILS** (same failure as `.btn-s`).

Locate the `.fls a` CSS rule and change `color:var(--textMuted)` → `color:var(--text)`.

Post-fix: **15.49:1** ✓

---

### PHASE 3 · TASK 6 — .substrate-replaces-strip Contrast Check

File: `mnemosynec-homepage.html`.

Bishop SEG-AO flagged `.substrate-replaces-strip` body text as borderline (~4.2:1). Knight reads the actual CSS value in the file for `.substrate-replaces-strip` color properties.

If the text color is `var(--textMuted)` or any value that computes below 4.5:1 on the strip background: change to `color:var(--text)`.

If the text color is already `var(--text)` or equivalent dark value: no edit needed. Report the actual value found in the Yoke Return.

---

### PHASE 3 · TASK 7 — Scan "decay" Body Copy for Cool-down Candidates (SURFACE ONLY, DO NOT AUTO-APPLY)

Founder direct: harmonize the offer section's body copy where "decay" reads naturally as "cool-down" — Knight identifies candidates and lists them in the Yoke Return for Founder ratify. Do NOT auto-apply.

Knight: Read through the offer section body text (the pricing/Mercy/decay schedule area of `mnemosynec-homepage.html`). List every instance of the word "decay" (case-insensitive) in the offer section with:
- Exact surrounding sentence
- Line number
- Knight's suggested replacement (if "cool-down" fits naturally) or "leave — technical usage" (if it refers to the schedule mechanic specifically)

Return this list in the Yoke Return block under "DECAY CANDIDATES FOR FOUNDER RATIFY."

---

**Phase 3 complete. Proceed to Phase 4.**

---

## 6. PHASE 4 — SINGLE HUGO BUILD + DUAL FIREBASE DEPLOY

**§14 BLOOD:** Both Hugo builds must exit 0. Do not proceed to Firebase deploy if either Hugo build errors.

**§17 CHECK at start of Phase 4:** Confirm all Phase 2 + Phase 3 edits are applied to `mnemosynec-homepage.html`. Run a quick grep for "Mercy" to confirm it is absent:

```powershell
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html" -Pattern "Mercy" -SimpleMatch | Measure-Object
```

Expected: Count = 0. If Count > 0, Phase 3 Task 1 did not apply correctly — fix before building.

Also confirm "Get it While It's Hot" is present:

```powershell
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html" -Pattern "Get it While" -SimpleMatch | Measure-Object
```

Expected: Count = 1. If Count = 0, Phase 3 Task 1 did not apply correctly — fix before building.

---

### PHASE 4 · TASK 1 — Hugo Build for .org (All 3 Phases Applied)

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

hugo --config config-mnemosynec.toml --destination public-mnemosynec --minify

# Confirm exit code
echo "Hugo .org exit code: $LASTEXITCODE"

# Spot-check version in output
Select-String -Path "public-mnemosynec/index.html" -Pattern "0\.7\.2" | Select-Object -First 3

# Confirm "Get it While It's Hot" in output
Select-String -Path "public-mnemosynec/index.html" -Pattern "Get it While" | Measure-Object

# Confirm "Mercy" absent from output
Select-String -Path "public-mnemosynec/index.html" -Pattern "Mercy" -SimpleMatch | Measure-Object
```

**§17 CHECK:** Exit code must be 0. v0.7.2 must appear. "Get it While" count must be >= 1. "Mercy" count must be 0. If any check fails, STOP — surface to Bishop before deploying.

---

### PHASE 4 · TASK 2 — Hugo Build for .ai (Preservation Build — Already in public-mnemosynec-ai/)

The .ai preservation build was completed in Phase 1 Task 2. Verify it is still present and was not overwritten:

```powershell
ls C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec-ai\index.html

# Confirm dc-savings-stats still absent (old design)
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec-ai\index.html" -Pattern "dc-savings-stats" -SimpleMatch | Measure-Object
```

Expected: file exists, Count = 0. If the file was overwritten or Count > 0, re-run Phase 1 Task 2 to rebuild the .ai preservation output.

---

### PHASE 4 · TASK 3 — Dual Firebase Deploy

Deploy both targets in a single command to minimize deploy window:

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

firebase deploy --only hosting:mnemosyne,mnemosynec-ai --project lianabanyan-403dc
```

Wait for full exit. Record the "Hosting URL" lines from both targets in the deploy output.

If the combined deploy command is not supported (older Firebase CLI), deploy sequentially:

```powershell
# .org first
firebase deploy --only hosting:mnemosyne --project lianabanyan-403dc

# .ai second
firebase deploy --only hosting:mnemosynec-ai --project lianabanyan-403dc
```

**§14 BLOOD:** Both deploys must exit 0. Record exact URLs returned. Do NOT assume deploy succeeded — capture the CLI output.

---

## 7. PHASE 5 — EMPIRICAL VERIFICATION

**Forbidden: deploying without Phase 5 verification gate.** All checks below run AFTER both deploys complete.

Allow 30–60 seconds post-deploy for CDN propagation before running curls.

---

### PHASE 5 · TASK 1 — .org Verification (5 checks)

```powershell
# Check 1: .org returns 200
curl -sI https://mnemosynec.org/ | Select-String "HTTP/"

# Check 2: .org body contains v0.7.2
curl -s https://mnemosynec.org/ | Select-String "0\.7\.2" | Select-Object -First 3

# Check 3: .org body contains "Get it While It's Hot"
curl -s https://mnemosynec.org/ | Select-String "Get it While" | Measure-Object

# Check 4: .org body does NOT contain "Mercy"
curl -s https://mnemosynec.org/ | Select-String "Mercy" -SimpleMatch | Measure-Object

# Check 5: .org version_trust.json returns 0.7.2 as latest tier
curl -s https://mnemosynec.org/version_trust.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.versions[0].version, d.versions[0].tier)"
```

**PASS criteria:**
- Check 1: HTTP/2 200 (or HTTP/1.1 200)
- Check 2: at least 1 match for "0.7.2"
- Check 3: Count >= 1
- Check 4: Count = 0 (Mercy absent)
- Check 5: prints `0.7.2 latest`

---

### PHASE 5 · TASK 2 — .ai Verification (3 checks)

```powershell
# Check 1: .ai returns 200
curl -sI https://mnemosynec.ai/ | Select-String "HTTP/"

# Check 2: .ai body contains v0.7.1 (preserved old design marker)
curl -s https://mnemosynec.ai/ | Select-String "0\.7\.1" | Select-Object -First 2

# Check 3: .ai body does NOT contain dc-savings-stats (Phoenix-Flight additions absent)
curl -s https://mnemosynec.ai/ | Select-String "dc-savings-stats" -SimpleMatch | Measure-Object
```

**PASS criteria:**
- Check 1: HTTP/2 200 (or HTTP/1.1 200)
- Check 2: at least 1 match for "0.7.1"
- Check 3: Count = 0

**DNS NOTE:** If mnemosynec.ai custom domain is not yet wired in Firebase Console, Check 1 may return non-200 or fail. If .ai DNS not yet propagated, report `DNS PENDING FOUNDER ACTION` — do NOT flag as a Phase 4 failure.

---

### PHASE 5 · TASK 3 — ETag Split Confirmation

```powershell
$etag_org = (curl -sI https://mnemosynec.org/ | Select-String "etag").ToString()
$etag_ai  = (curl -sI https://mnemosynec.ai/  | Select-String "etag").ToString()

Write-Host "ETag .org: $etag_org"
Write-Host "ETag .ai:  $etag_ai"

if ($etag_org -ne $etag_ai) {
    Write-Host "SPLIT CONFIRMED — ETags differ (sites serving separate builds)"
} else {
    Write-Host "WARNING — ETags same, sites may still be aliased to the same deploy"
}
```

**PASS:** ETags differ. **WARNING:** ETags same — if both return same ETag despite separate deploys, the .ai domain may still be aliased to the mnemosyne-lianabanyan site in Firebase. Surface to Bishop if WARNING.

---

### PHASE 5 · TASK 4 — Contrast Fix Verification (CSS values in served HTML)

For each of the 6 contrast fixes, confirm the CSS/style value is present in the served .org HTML:

```powershell
$html = curl -s https://mnemosynec.org/

# Fix 1: .btn-s uses color:var(--text) not color:var(--textMuted)
$html | Select-String "\.btn-s\{[^}]*color:var\(--text\)" | Measure-Object
# Also confirm textMuted is NOT in .btn-s (absence check)

# Fix 2: offer-eyebrow has style="color:var(--text)"
$html | Select-String "offer-eyebrow.*color:var\(--text\)" | Measure-Object

# Fix 3: h2 Free Forever span has color:var(--text) not color:var(--amber)
$html | Select-String "Free Forever.*color:var\(--text\)" | Measure-Object

# Fix 4: .pb badge has color:#155e32
$html | Select-String "\.pb\{[^}]*#155e32" | Measure-Object

# Fix 5: footer .fls a has color:var(--text)
$html | Select-String "\.fls a\{[^}]*color:var\(--text\)" | Measure-Object

# Fix 6: substrate-replaces-strip — report whatever color value is present
$html | Select-String "substrate-replaces-strip" | Select-Object -First 5
```

Report Count for each check and the actual value found for Fix 6 in the Yoke Return.

---

### PHASE 5 · TASK 5 — Hero Padding Value Confirmation

Confirm the hero padding in served CSS reflects the compressed value from Phase 2:

```powershell
$html = curl -s https://mnemosynec.org/
$html | Select-String "\.hero\{padding-block" | Select-Object -First 3
```

Expected: contains `clamp(var(--space-6),4vw,var(--space-10))` (compressed). If it still shows `clamp(var(--space-16),10vw,var(--space-24))` (old value), Phase 2 Task 1 did not apply or Hugo did not rebuild correctly.

---

### PHASE 5 · TASK 6 — GitHub Release v0.7.2 Active Check

```powershell
# Check GitHub releases page for v0.7.2 active status
curl -s https://api.github.com/repos/lianabanyan/mnemosynec/releases | node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); r.slice(0,3).forEach(x=>console.log(x.tag_name, x.draft, x.prerelease))"
```

If the repo path differs, use the correct GitHub API URL. Report the result in the Yoke Return. If v0.7.2 release is not present, note "GITHUB RELEASE v0.7.2 NOT FOUND — surface to Bishop."

---

## 8. YOKE RETURN FORMAT

Knight writes the full Yoke Return at the end of the Marathon session. Return block structure:

```
═══ YOKE RETURN — DOMAIN SPLIT + READABILITY + CONTRAST BUNDLE — BP093 ═══
Sonnet 4.6 · Knight Execution · 2026-06-24

PHASE 1 STATUS: [PASS / PARTIAL / FAIL / BLOCKED]
  Preservation branch: preserve-pre-marathon-design-v0.7.1-bp093
  Preservation sha: <git rev-parse preserve-pre-marathon-design-v0.7.1-bp093>
  .ai Hugo build: public-mnemosynec-ai/ [EXISTS / MISSING]
  dc-savings-stats absent from .ai build: [YES / NO]
  firebase.json edited: [YES / NO]
  .firebaserc edited: [YES / NO]
  Firebase site created: mnemosynec-ai-lianabanyan [YES / ALREADY EXISTS / BLOCKED: <error>]
  firebase target:list confirmed: [YES / NO]
  version_trust.json top entry: <version + tier>

  FOUNDER ACTION REQUIRED: Wire mnemosynec.ai custom domain in Firebase Console
    → Firebase Console → Hosting → mnemosynec-ai-lianabanyan → Add custom domain → mnemosynec.ai
    → DNS propagation: up to 24 hours

PHASE 2 STATUS: [PASS / PARTIAL / FAIL]
  Task 1 hero padding compressed: [YES / NO] (new value: ___)
  Task 1 mascot image 180px: [YES / NO]
  Task 2 baseof.html isMnemosynec guard applied: [YES / NO]
  Task 3 flip card min-height 220px: [YES / NO]
  Task 3 ag gap/margin compressed: [YES / NO]
  Task 4 section padding compressed: [YES / NO]
  Task 4 cw-box spacing compressed: [YES / NO]
  Task 4 kpi-strip margin compressed: [YES / NO]
  Task 4 kc padding compressed: [YES / NO]
  Task 5 nav padding --space-2: [YES / NO]
  Task 5 nav logo 28px: [YES / NO]

PHASE 3 STATUS: [PASS / PARTIAL / FAIL]
  Task 1 Mercy rename FOUNDER OVERRIDE applied: [YES / NO]
    Applied phrase: "Get it While It's Hot — Pricing Cool-down Schedule"
    "Mercy" count in file post-edit: <n>
  Task 2 .btn-s color:var(--text): [YES / NO]
  Task 3a offer-eyebrow style color:var(--text): [YES / NO]
  Task 3b h2 amber span color:var(--text): [YES / NO]
  Task 4 .pb badge color:#155e32: [YES / NO]
  Task 5 .fls a color:var(--text): [YES / NO]
  Task 6 .substrate-replaces-strip color value found: <actual value>

  DECAY CANDIDATES FOR FOUNDER RATIFY:
  (Knight lists each instance of "decay" in the offer section body copy with line number,
   surrounding sentence, and suggested replacement or "leave — technical usage")
  ---
  [List here — do NOT auto-apply any of these]
  ---
  Founder: reply YES/NO to each candidate for Bishop to action in next pass.

PHASE 4 STATUS: [PASS / PARTIAL / FAIL]
  .org Hugo build exit code: <n>
  .org Hugo wall-clock: <time>
  .org v0.7.2 in built HTML: [YES / NO]
  .org "Get it While" in built HTML: [YES / NO]
  .org "Mercy" in built HTML count: <n>
  .ai preservation build verified present: [YES / NO]
  Firebase deploy .org URL: <url>
  Firebase deploy .ai URL: <url or "PENDING DNS — Founder action required">
  Firebase deploy exit code: <n>

PHASE 5 STATUS: [PASS / PARTIAL / FAIL]
  .org curl 200: [YES / NO]
  .org curl v0.7.2: [YES / NO — match count: <n>]
  .org curl "Get it While": [YES / NO — count: <n>]
  .org curl "Mercy" absent: [YES / NO — count must be 0]
  .org version_trust.json: <0.7.2 latest / OTHER>
  .ai curl 200: [YES / NO / DNS PENDING]
  .ai curl v0.7.1: [YES / NO — match count: <n>]
  .ai curl dc-savings-stats absent: [YES / NO — count must be 0]
  ETag .org: <value>
  ETag .ai: <value>
  ETag SPLIT: [CONFIRMED / WARNING / DNS PENDING]
  Hero padding in served CSS: <value>
  Contrast fix 1 (.btn-s color:var(--text)): [CONFIRMED / NOT FOUND]
  Contrast fix 2 (offer-eyebrow inline color:var(--text)): [CONFIRMED / NOT FOUND]
  Contrast fix 3 (h2 span color:var(--text)): [CONFIRMED / NOT FOUND]
  Contrast fix 4 (.pb #155e32): [CONFIRMED / NOT FOUND]
  Contrast fix 5 (.fls a color:var(--text)): [CONFIRMED / NOT FOUND]
  Contrast fix 6 (substrate-replaces-strip value): <actual>
  GitHub release v0.7.2: [ACTIVE / NOT FOUND / CHECK FAILED]

ELECTRON_TOUCHED: NO
HUGO_REBUILT: YES — public-mnemosynec (.org v0.7.2 + all 3 phases) + public-mnemosynec-ai (.ai v0.7.1 preserved)
FIREBASE_JSON_EDITED: YES — added mnemosynec-ai target
FIREBASERC_EDITED: YES — added mnemosynec-ai alias
BASEOF_HTML_EDITED: YES — isMnemosynec guard added

Bishop next-turn:
  - Independent re-gadget all curls (curl .org + curl .ai + ETag diff)
  - Verify Etag diff confirms split (not aliased)
  - Audit any remaining contrast borderline elements
  - Ratify "decay" body copy candidates from Yoke Return
  - Canon eblet mint for BP093 domain-split + Founder phrase "Get it While It's Hot"
  - GitHub release v0.7.2 verify if Knight flags as NOT FOUND
═══ END YOKE RETURN ═══
```

---

## 9. §14 §15 §17 BLOOD INLINE REMINDERS

**§14 BLOOD — inline per phase:**
- Phase 1: Never claim Firebase site created without `firebase target:list` empirical confirmation.
- Phase 2: Never claim dark band removed without post-build visual or DOM confirmation that no double nav renders.
- Phase 3: Never claim rename applied without Count = 0 check for "Mercy" in the file.
- Phase 4: Never claim deploy succeeded without capturing the Firebase CLI "Hosting URL" output line.
- Phase 5: Never report Phase 5 PASS without running all curl checks. A 200 alone does not confirm content is correct.

**§15 BLOOD:**
- Supabase migrations, psql, REST, edge functions = Bishop lane.
- Hugo build, Firebase deploy, git worktree, firebase.json, .firebaserc, baseof.html = Knight lane exclusively.
- No Bishop-direct Hugo or Firebase actions.

**§17 BLOOD — use segs:**
- Run `git show e9aa242 --oneline` before cutting the preservation branch — confirm sha identity empirically.
- Read `version_trust.json` before building — confirm 0.7.2 is top entry before assuming.
- Run `firebase target:list` after applying target — confirm both targets before deploying.
- Check "Mercy" count = 0 in built HTML before deploying to .org.
- Do not guess any Firebase target name — read `firebase.json` and `firebase target:list` output.

**POSTGRES ONLY** (if any SQL touches this session — unlikely given Phase scope): no SQLite primitives. `gen_random_uuid()` / `TIMESTAMPTZ` / `BIGSERIAL` / `BYTEA` only.

**NO AUTO-SEND:** Founder reviews Yoke Return before any further action. No automated follow-up dispatch.

**TRUTH-ALWAYS:** If any task is BLOCKED (Firebase site already exists with different config, git sha mismatch, Hugo build error, Firebase deploy error), report exact CLI error text. Do not invent workarounds. Surface BLOCKED to Bishop.

---

*BP093 · Sonnet 4.6 · Bishop-authored · Knight executes only · 2026-06-24*
*Consolidates SEG-AM + SEG-AN + SEG-AO into single Marathon-class Yoke*
*Founder phrase "Get it While It's Hot — Pricing Cool-down Schedule" overrides all prior SEG-AO rename recommendations*
