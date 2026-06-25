# KNIGHT ORG · BLACK-ON-BLACK FIX · MERGE BARS · NO EM-DASH · BP093
**Composer:** Sonnet 4.6
**Bishop SEG:** BP093
**Statute:** §3 IDENTITY · §14 CURL EMPIRICAL · §15 BLOOD (Supabase direct) · §17 BLOOD (curl+Read discovery · no bash-grep)
**Session type:** FOLLOW-ON paste · fires AFTER SEG-AP Yoke returns · SEPARATE from .ai split work
**Target:** mnemosynec.org ONLY · do NOT touch lianabanyan.com or .ai hosting

---

## PREAMBLE

Knight: you are a fresh session. SEG-AP (Phase 1 .ai split) is a parallel track - do NOT modify any .ai files or .ai Firebase hosting target. This paste is .org only.

Composer model check: confirm you are running Sonnet 4.6 or your available flagship. Report model at Yoke return.

Use segs throughout. Empirical curl verification required before Yoke return.

---

## CONTEXT · Founder feedback BP093 2026-06-24

Three issues confirmed on live mnemosynec.org after Phase 4 deploy (Last-Modified 16:37 UTC):

1. **Black-on-black text** - the body section listing "ChatGPT, Claude, Gemini..." / "on your own computer." / "FREE (SSPL license) to use FOREVER" is rendering text in dark color on dark background - unreadable in dark mode.

2. **Wasted vertical space at top** - alpha banner row + Substrate Replaces strip row + gray nav too tall. Founder wants:
   - ONE yellow bar merging both: `Public Alpha v0.7.2 - Substrate Replaces New Data Centers - how it works` on ONE row
   - NO em-dash anywhere (Founder direct: "get rid of the em-dash always")
   - Nav bar height = gold bar height (compress to match)

3. **HARD CANON: NO EM-DASHES on .org / public surfaces** - replace ALL `&mdash;` with ` - ` (space-hyphen-space) or rephrase. Applies to every partial rendered on mnemosynec.org.

**ELECTRON_TOUCHED: NO** - this is Hugo + Firebase deploy only.

---

## BISHOP GADGET FINDINGS (read-verified pre-paste)

### Black-on-black section
**File:** `layouts/partials/mnemosynec-homepage.html` lines 351-354
**Element:** `<ul>` list items inside `<div style="margin-top:var(--space-8);padding-top:var(--space-6);border-top:1px solid var(--divider)">` within `<section class="hero">`
**Current color:** `color:var(--textMuted)` inline on each `<li>` - dark mode value `#7a8088`
**Background:** dark mode `--bg:#0c0d0e` (hero section has radial gradient overlay that darkens further)
**Fix needed:** replace `color:var(--textMuted)` with `color:var(--text)` on each `<li>` element in that list. Dark mode `--text:#d8dce0` gives contrast ratio ~14:1 against `#0c0d0e`.

### Alpha banner (current state)
**File:** `layouts/partials/alpha-banner.html`
**Current content (isMnemosynec branch, lines 16-20):**
```
PUBLIC ALPHA &middot; Build Log Live &middot; v0.7.2
&nbsp;&middot;&nbsp;
<code>Substrate Replaces New Data Centers.</code>
&nbsp;&mdash;&nbsp;        <- em-dash here, needs removal
<a href="/how-it-works/">How it works</a>
```
**Existing behavior:** already one yellow bar (#f59e0b bg, #1c1917 text, padding 0.55rem, dismissible). The em-dash between strip text and link needs to replace with ` - `.

### Substrate Replaces strip (separate element - REMOVE)
**File:** `layouts/partials/mnemosynec-homepage.html` lines 238-244
**Element:** `<div id="lb-dc-strip" class="substrate-replaces-strip">` - a SECOND gray bar below the alpha banner
**CSS class:** `.substrate-replaces-strip` (lines 39-42 of same file) - `background:var(--surfaceOff)`, gray, separate row
**Action:** DELETE this entire div and its inline `<script>` (lines 238-244). The alpha-banner already carries this information. Removing the strip eliminates one full row of wasted vertical space.

### Nav element
**File:** `layouts/partials/mnemosynec-homepage.html` lines 311-326
**CSS class:** `.nav` (line 45 of same file)
**Current padding:** `padding:var(--space-2) var(--space-6)` - `var(--space-2)` = 0.5rem
**Current height:** approximately 52-60px (28px logo image + 2x0.5rem padding + border)
**Gold bar height:** approximately 38-42px (0.55rem + 0.82rem font + border)
**Fix:** reduce nav padding to `padding:0.3rem var(--space-6)` and ensure logo image remains 28px. This should bring nav down to ~38-40px matching the gold bar.

### Em-dash inventory (Bishop verified via Read tool)
**Total `&mdash;` occurrences across .org partials:**
- `alpha-banner.html`: 2 occurrences (lines 19, 23) - line 19 is the isMnemosynec branch; line 23 is the else branch
- `mnemosynec-homepage.html`: 22 occurrences across modal, architecture cards, commercial section, proofs section, footer

**Total: 24 `&mdash;` occurrences** requiring replacement.

Most are inside the installer modal or body copy - replace ALL with ` - ` (space-hyphen-space) or rephrase where grammatically awkward. See replacement guidance in TASK 4 below.

---

## TASK 1 · Fix black-on-black text in hero list

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

Find lines 351-354. The three `<li>` elements each have inline `color:var(--textMuted)`. Change each to `color:var(--text)`.

Current (line 352):
```html
<li style="display:flex;align-items:baseline;gap:var(--space-3);font-size:var(--text-sm);color:var(--textMuted)">
```

Replace with:
```html
<li style="display:flex;align-items:baseline;gap:var(--space-3);font-size:var(--text-sm);color:var(--text)">
```

Apply to all THREE `<li>` elements in that `<ul>` block (lines 352, 353, 354).

**Contrast verification:** dark mode `--text:#d8dce0` on `--bg:#0c0d0e` = approximately 14.3:1 contrast ratio. WCAG AA minimum 4.5:1 - passes.

---

## TASK 2 · Merge alpha banner + Substrate Replaces strip into ONE yellow bar

### Step 2A - Edit alpha-banner.html

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\alpha-banner.html`

Replace the isMnemosynec branch content (lines 16-20) to remove the em-dash and reformat to clean single row.

Current:
```html
  {{ if .Site.Params.isMnemosynec }}
    PUBLIC ALPHA &middot; Build Log Live &middot; v{{ with (index .Site.Data.version_trust.versions 0) }}{{ .version }}{{ end }}
    &nbsp;&middot;&nbsp;
    <code style="font-family:monospace;font-weight:700;font-size:0.82rem;letter-spacing:0.02em;">Substrate Replaces New Data Centers.</code>
    &nbsp;&mdash;&nbsp;
    <a href="/how-it-works/" style="color:#1c1917;text-decoration:underline;">How it works</a>
  {{ else }}
    Cooperative Substrate &middot; ALPHA &middot; Members Welcome
    &nbsp;&mdash;&nbsp;
    <a href="https://mnemosynec.org/" style="color:#1c1917;text-decoration:underline;">Learn More</a>
  {{ end }}
```

Replace with:
```html
  {{ if .Site.Params.isMnemosynec }}
    Public Alpha v{{ with (index .Site.Data.version_trust.versions 0) }}{{ .version }}{{ end }}
    &nbsp;&middot;&nbsp;
    <code style="font-family:monospace;font-weight:700;font-size:0.82rem;letter-spacing:0.02em;">Substrate Replaces New Data Centers</code>
    &nbsp;-&nbsp;
    <a href="/how-it-works/" style="color:#1c1917;text-decoration:underline;">how it works</a>
  {{ else }}
    Cooperative Substrate &middot; ALPHA &middot; Members Welcome
    &nbsp;-&nbsp;
    <a href="https://mnemosynec.org/" style="color:#1c1917;text-decoration:underline;">Learn More</a>
  {{ end }}
```

Note: "PUBLIC ALPHA" uppercase changed to "Public Alpha" per Founder feedback re casing; period removed from "New Data Centers." to avoid double-punctuation before " - "; "How it works" lowercased to "how it works" to match casual inline style. If Founder prefers different casing, flag at Yoke return before considering it canon.

### Step 2B - Remove the lb-dc-strip div from mnemosynec-homepage.html

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

DELETE lines 237-244 entirely:
```html
{{/* ======= BP092 HARD CANON: Substrate Replaces New Data Centers. STRIP ======= */}}
<div id="lb-dc-strip" class="substrate-replaces-strip">
  <code>Substrate Replaces New Data Centers.</code>
  &nbsp;&mdash;&nbsp;
  <a href="/how-it-works/" style="color:var(--primary);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--primary) 40%,transparent)">How it works</a>
  <button class="substrate-replaces-strip-close" onclick="(function(){localStorage.setItem('lb_dc_strip_dismissed','1');document.getElementById('lb-dc-strip').style.display='none';})()" aria-label="Dismiss">&times;</button>
</div>
<script>(function(){if(localStorage.getItem('lb_dc_strip_dismissed')==='1'){var s=document.getElementById('lb-dc-strip');if(s)s.style.display='none';}})()</script>
```

Also remove the `.substrate-replaces-strip` CSS block from the `<style>` section (lines 38-42):
```css
/* ---- SUBSTRATE REPLACES STRIP · BP092 HARD CANON ---- */
.substrate-replaces-strip{background:var(--surfaceOff);border-bottom:1px solid var(--divider);padding:0.45rem 3rem 0.45rem 1rem;font-size:0.78rem;text-align:center;position:relative;z-index:9998;color:var(--text)}
.substrate-replaces-strip code{font-family:var(--font-mono);font-weight:700;font-size:0.78rem;letter-spacing:0.02em;background:transparent;color:var(--primary);padding:0}
.substrate-replaces-strip-close{position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:1rem;color:var(--textFaint);line-height:1;padding:0.2rem 0.4rem}
.substrate-replaces-strip-close:hover{color:var(--text)}
```

**Result:** page now shows: gold alpha banner (one row) then nav (compressed). Two rows total instead of three.

---

## TASK 3 · Compress nav height to match gold bar

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

Find `.nav` CSS definition (line 45 in the `<style>` block):

Current:
```css
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:var(--space-2) var(--space-6);display:flex;align-items:center;justify-content:space-between}
```

Replace `padding:var(--space-2) var(--space-6)` with `padding:0.3rem var(--space-6)`:

New:
```css
.nav{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0.3rem var(--space-6);display:flex;align-items:center;justify-content:space-between}
```

Logo image is 28px, padding 0.3rem (4.8px) top + bottom = total nav height approximately 38px. The alpha gold bar is 0.55rem + 0.82rem line-height + border = approximately 37-39px. Heights will match.

Also update `.logo` to ensure vertical alignment stays correct - current `.logo` is fine (uses `display:flex;align-items:center`).

---

## TASK 4 · Strip ALL em-dashes from .org content

**HARD CANON: NO EM-DASHES on public surfaces. Replace all `&mdash;` with ` - ` (space-hyphen-space) unless a clean rephrasing is more natural.**

### 4A - alpha-banner.html
Already handled in TASK 2 (both `&mdash;` on lines 19 and 23 replaced).

### 4B - mnemosynec-homepage.html (22 occurrences)

Knight: make these replacements one at a time using Edit tool. Verify each replacement. The full list:

1. **Line 240** (lb-dc-strip): DELETED in Task 2 - no action needed.
2. **Line 261** (modal welcome block): `Substrate &mdash; Dr.` → `Substrate - Dr.`
3. **Line 267** (SSPL lic-desc): `everyone &mdash; individuals` → `everyone - individuals`
4. **Line 279** (full text lic-desc): `mnemosynec.org/license</a> &mdash; all four` → `mnemosynec.org/license</a> - all four`
5. **Line 290** (Patent Peace title): `Patent Peace &mdash; Pledge #2260` → `Patent Peace - Pledge #2260`
6. **Line 291** (patent body): `this substrate. Under Cooperative Defensive Patent Pledge #2260, we will not assert these patents against any user of Dr. MnemosyneC &mdash; <strong>unless` → replace `&mdash;` with ` - `
7. **Line 342** (img alt text): `Dr. MnemosyneC &mdash; memory specialist` → `Dr. MnemosyneC - memory specialist`
8. **Line 369** (SmartScreen c-body): `unsigned installers from new publishers &mdash; this is normal` → `unsigned installers from new publishers - this is normal`
9. **Line 373** (c-steps li): `open-source &mdash; <a` → `open-source - <a`
10. **Line 426** (compounding chart cs): `across waves &mdash; more substrate` → `across waves - more substrate`
11. **Line 446** (architecture sub): `works &mdash; uncertain at first` → `works - uncertain at first`
12. **Line 454** (card-librarian label): `A little more &mdash;` → `A little more -`
13. **Line 484** (card-verifier label): `A little more &mdash;` → `A little more -`
14. **Line 514** (card-accum label): `A little more &mdash;` → `A little more -`
15. **Line 599** (offer-headline): `Get it While It's Hot &mdash; <span>` → `Get it While It's Hot - <span>`
16. **Line 605** (decay schedule label): `The Decay Schedule &mdash; 30-Day Windows` → `The Decay Schedule - 30-Day Windows`
17. **Line 609** (math-val): `1 &mdash; Initial` → `1 - Initial`
18. **Line 634** (Section 13 note): `Don&rsquo;t integrate &mdash; accept inferiority. B &middot; Integrate and open-source...C &middot; License commercially. The 30-day window opens C. Dr. MnemosyneC does not forget &mdash; and neither does Pledge #2260.` → replace BOTH `&mdash;` with ` - `
19. **Line 664** (proof card pn): `Mesh Proof &mdash; R10` → `Mesh Proof - R10`
20. **Line 670** (proof card pn): `Benchmark R10 &mdash; Free Local Model` → `Benchmark R10 - Free Local Model`
21. **Line 676** (proof card pn): `Trial 02b &mdash; 4-Peer Cooperative` → `Trial 02b - 4-Peer Cooperative`
22. **Line 692** (footer coop-tag): `$5/yr &mdash; one vote` → `$5/yr - one vote`

**Total replacements: 22 in homepage + 2 in alpha-banner = 24 total.**
(Line 240 is deleted in Task 2, not replaced.)

---

## TASK 5 · Hugo build + Firebase deploy (.org only)

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Build for mnemosynec.org only
hugo --config config-mnemosynec.toml --minify

# Verify build succeeded (check public-mnemosynec/ exists and is populated)
# Then deploy to mnemosyne hosting target only - NOT the default .ai hosting
firebase deploy --only hosting:mnemosyne --config firebase-mnemosynec.json
```

If `firebase-mnemosynec.json` is the correct Firebase config file for .org, use it. If the config file name differs, check `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\` for the correct Firebase config for mnemosynec.org hosting. Report the config file used in Yoke return.

**DO NOT run `firebase deploy` without `--only hosting:mnemosyne`** - that would also deploy .ai which is mid-SEG-AP.

---

## TASK 6 · Empirical verification (curl)

After deploy completes, run ALL of the following:

### 6A - Merge verification: "Substrate Replaces" appears once and on same row as "Public Alpha"
```bash
curl.exe -s https://mnemosynec.org/ | findstr /i "substrate replaces"
```
Expected: exactly ONE match. Should appear inside the alpha banner element, NOT as a separate lb-dc-strip element.

### 6B - Em-dash elimination
```bash
curl.exe -s https://mnemosynec.org/ | findstr "&mdash;"
```
Expected: zero matches (empty output).

Also check for Unicode em-dash character (U+2014):
```bash
curl.exe -s https://mnemosynec.org/ > tmp_verify.html
# Open tmp_verify.html and search for literal em-dash — character
# or use: findstr /c:"—" tmp_verify.html
```
Expected: zero matches.

### 6C - Black-on-black section: verify color value in source
```bash
curl.exe -s https://mnemosynec.org/ | findstr /i "color:var(--textMuted)"
```
Expected: the three hero list items should NOT appear in this output (they should now use `--text` not `--textMuted`).

### 6D - Strip div is gone
```bash
curl.exe -s https://mnemosynec.org/ | findstr "lb-dc-strip"
```
Expected: zero matches.

### 6E - Pixel height verification (descriptive, not automated)
Note in Yoke return: combined alpha banner + nav height is visually compressed vs prior. Estimate from padding values: alpha bar ~38px + nav ~38px = ~76px total. Prior was ~38px alpha + ~38px gray strip + ~52px nav = ~128px total. Reduction of approximately 52px (~2 inches at 96dpi).

---

## TASK 7 · Yoke return

Return with:

```
YOKE RETURN · BP093 · KNIGHT
Model: [your model]
ELECTRON_TOUCHED: NO

TASK 1 (black-on-black):
- Section found: hero ul li elements lines 351-354
- color changed: var(--textMuted) → var(--text) on 3 li elements
- Contrast ratio (dark mode): [calculated or estimated]
- curl 6C result: [output]

TASK 2 (merge bars):
- alpha-banner.html isMnemosynec branch: em-dash removed, content reformatted to single row
- lb-dc-strip div: DELETED from mnemosynec-homepage.html
- substrate-replaces-strip CSS: DELETED
- curl 6A result (strip appears once): [output]
- curl 6D result (lb-dc-strip gone): [output]

TASK 3 (nav compress):
- .nav padding changed to: 0.3rem var(--space-6)
- Estimated nav height: [px]

TASK 4 (em-dash strip):
- Total &mdash; replaced: [count]
- curl 6B result (em-dash search): [output]

TASK 5 (Hugo build + Firebase):
- Firebase config used: [filename]
- Deploy target: hosting:mnemosyne
- Build result: [success/error]
- Deploy result: [success/error]

TASK 6 (empirical verification):
- 6A substrate strip once: [PASS/FAIL + output]
- 6B em-dash zero: [PASS/FAIL + output]
- 6C color corrected: [PASS/FAIL + output]
- 6D lb-dc-strip gone: [PASS/FAIL + output]
- 6E pixel height reduction: [estimated]

OPEN QUESTIONS FOR FOUNDER:
- "Public Alpha" vs "PUBLIC ALPHA" - casing choice confirmed/changed?
- "how it works" link casing - lowercase matches Founder preference?
- Any other banner copy adjustments needed?
```

---

## FILE PATHS FOR REFERENCE

- Homepage partial: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`
- Alpha banner: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\alpha-banner.html`
- Config (mnemosynec): `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\config-mnemosynec.toml`
- Baseof: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\_default\baseof.html`
- Publish dir: `public-mnemosynec\` (per config-mnemosynec.toml)

---

*BP093 · Bishop Sonnet 4.6 · Follow-on paste fires after SEG-AP Yoke returns*
