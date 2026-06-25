# KNIGHT DISPATCH · DESIGN REFRESH + SUBSTRATE COMPOUNDING CHART · BP093

**§3 Sonnet 4.6 · §17 BLOOD · use segs · Composer model: Sonnet 4.6**

Bishop has read all 6 source files 100%. This paste is complete and executable.

---

## SOURCE ASSETS — Knight reads these (absolute paths)

```
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (2).html   ← CANONICAL (69,435 bytes · 2026-06-20 15:51 · most recent, most complete)
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (1).html   ← intermediate draft (65,431 bytes · 2026-06-20 00:11)
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2.html        ← v2 base (56,658 bytes · 2026-06-19 23:37)
C:\Users\Administrator\Downloads\mnemosynec-design-demo.html           ← v1 baseline (32,840 bytes · 2026-06-19 22:50)
C:\Users\Administrator\Downloads\substrate-compounding-chart.svg       ← chart source (10,662 bytes · standalone SVG, self-contained)
C:\Users\Administrator\Downloads\substrate-compounding-chart.html      ← chart wrapper with click-expand JS (14,589 bytes)
```

Canonical design = `mnemosynec-design-demo-v2 (2).html` — newest timestamp, largest file, contains all features of prior versions PLUS: sliding decay table, 4-layer license summary panel, "A little more —" label on arch cards, horizontal bar chart (indexAxis:'y'), chart-tile click-expand on ALL interactive blocks.

Hugo template files being modified:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html  ← PRIMARY TARGET
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\alpha-banner.html         ← PRESERVE AS-IS
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\index.html                         ← PRESERVE AS-IS (already routes to partial)
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\download\list.html                 ← Fix 404 (see Task 3)
```

---

## DELTA TABLE · Current Hugo template → Canonical demo (2)

| Element | Current `mnemosynec-homepage.html` | Canonical demo (2) |
|---|---|---|
| Color palette | Gold/amber `#d69e2e` dark navy `#0a1628` old system | Teal primary `#4fc3d0` `#0c0d0e` near-black · full CSS variable system |
| CSS architecture | ~740 lines hand-rolled BEM · navy hexagon texture bg | CSS var tokens · Inter + IBM Plex Mono · radial gradient hero |
| Logo in nav | SVG icon-only `Dr. MnemosyneC` text | Mascot portrait photo `<img>` from S3 + `Dr. MnemosyneC` text |
| Hero structure | 2-col grid LEFT:h1+dl-btn / RIGHT:mascot · gold border card | 2-col flex LEFT:h1+bullets+CTA / RIGHT:mascot portrait · radial bg |
| Hero subhead | "The Substrate Cure to AI Amnesia." (gold) | Feature bullet list: Works with ChatGPT/Claude · Private · Free |
| Hero eyebrow | None | Pill badge: "Free · Private · Works with any AI" |
| Download CTA | Green `mn-v2-dl-btn` button stateful | Teal `btn-p` + modal-gated installer click-through |
| Installer modal | None | Full modal (SSPL terms · Apache · patent pledge · TUP · warranty · checkbox gate) |
| KPI strip | None | 4-cell strip: 89.3% / 6% / +83pts / $0 |
| Benchmark chart | Custom CSS bar chart (horizontal bars, no Chart.js) | Chart.js horizontal bar `indexAxis:'y'` with click-expand |
| Benchmark chart heading | "Does It Actually Work?" (amber h2) | "Memory That Actually Works" + "Prove It Yourself →" CTA |
| Architecture section | 3-layer `<details>` accordions | 3 flip cards (3D rotateY) with "A little more —" sublabel |
| Layer 1 name | "Reader" | "The Librarian" |
| Lifecycle section | Absent (no flow diagram) | 4-step flow: Pheromone → Socceri Triad → Living Connection → Stone Tablet |
| Commercial section | Absent | Full "Android-of-AI Licensing" card with decay schedule table, countdown timer, Saladin badge, 4-layer license summary |
| Proofs section | Accordion-based with screenshot lightboxes | 3-card grid with click-expand tiles |
| Substrate compounding chart | Absent | NOT IN DEMO FILE — Bishop-specified insertion in Benchmarks section |
| Footer | Custom dark footer with navigation links | 3-col footer: Cooperative info / Links / Legal + Cooperative Liturgy block |
| Cooperative Liturgy | Absent | "Let's Help Each Other Help Ourselves." / "Coffee's for Closers. Help Yourself." / "For Alford." |
| Theme toggle | Absent (dark-only) | Light/dark toggle in nav |
| Download page `/download/` | `layouts/download/list.html` (404 in production) | No explicit download page in demo — fix must restore working Hugo template |
| Alpha banner | `partials/alpha-banner.html` (gold bar v0.7.1) | Not in demo — PRESERVE existing partial, do not remove |
| Substrate DC strip | Not visible from homepage partial | Add per BP092 canon below alpha banner |

---

## TASK 1 — Port canonical design demo HTML into Hugo as new homepage template

**Target file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

**Method:** Replace the entire content of `mnemosynec-homepage.html` with a Hugo-templated version of the canonical demo. Do NOT rewrite the demo design — port its structure faithfully.

### Mandatory adaptations from demo → Hugo template:

**A. Keep existing Hugo Go template hooks (do not drop):**
- Download button must still use `{{ .Site.Data.version_trust.versions }}` for version + download URL (not `version.json`)
- Alpha banner is injected by `baseof.html` or `index.html` — do NOT embed it inside the partial
- Mascot image path: change S3 URL `https://agi-prod-file-upload-public-main-use1.s3.amazonaws.com/cc4fc93e-0811-4b93-b21b-78092aa8ac93` → `/img/mascots/dr-mnemosynec.png`

**B. Download CTA:**
- Demo uses `onclick="openModal(event)"` which gates download behind the license modal
- Port the full installer modal HTML + JS from the demo
- Download button inside modal: `href="{{ (index .Site.Data.version_trust.versions 0).download_url }}"` for actual file

**C. Hero headline:**
- Demo (2) headline: `Your AI has Amnesia.<br><em>Dr. MnemosyneC</em> has the Cure: <a href="...">Substrate.</a>`
- Keep the Substrate link target as `/how-to-read-the-substrate/`

**D. Add BP092 HARD CANON "Substrate Replaces New Data Centers." strip:**
- Per `canon_substrate_replaces_new_data_centers_economic_claim_banner_pattern_bp092`
- Insert BELOW alpha banner (which is already rendered by baseof), ABOVE the nav
- Exact copy: `Substrate Replaces New Data Centers.` (with period, monospace, dismissible via `lb_dc_strip_dismissed` localStorage key)
- CSS class `.substrate-replaces-strip`

**E. Chart.js dependency:**
- Add `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` inside the partial `<style>` block or at bottom of partial before closing

**F. Nav links to preserve:**
- `Architecture` · `Benchmarks` · `Commercial` · `Proofs` (as in demo)
- Download button → opens modal

**G. Commercial section email:**
- Demo (1) uses `hello@upekrithen.com`, demo (2) uses `licensing@lianabanyan.com`
- Use `licensing@lianabanyan.com` (canonical from latest file)

**H. Commercial section — licensing window:**
- Demo (2) has CORRECTED window structure: 30-day windows with diminishing term (5yr → 4yr → 3yr → 2yr → 1yr → Full FRAND)
- Use demo (2) decay schedule table verbatim

**I. Footer Cooperative Liturgy:**
- Include the full liturgy block from demo (2):
  ```
  Let's Help Each Other Help Ourselves.
  Coffee's for Closers. Help Yourself.
  For Alford.
  ```
- "For Alford." is a reservation marker — include as-is

---

## TASK 2 — Embed the substrate-compounding-chart

### Chart analysis:
- **`substrate-compounding-chart.svg`** — standalone SVG, self-contained, no external dependencies, 187 lines, dark bg `#0f0f0f`
- **`substrate-compounding-chart.html`** — wrapper adding click-to-expand JS pattern (`chart-tile` class + backdrop modal). The SVG content is identical to the .svg file.
- **What it visualizes:** X-axis = Cumulative MAMBA Count (0–11), Y-axis = Cumulative Context % (0–120%). Three curves: gray dashed (no substrate, crashes at MAMBA 1–2 into 100% session limit); green (Wave 1 with substrate, 10.75%/MAMBA); amber (Wave 2 compounding, 6.57%/MAMBA). Founder quote embedded: "Notice how the MORE there is, the FASTER and MORE efficient it gets?" Title: "Substrate Compounding — Context Cost Per MAMBA Decreases Across Waves"
- **Embed type:** The demo (2) has the chart-tile click-expand pattern applied to the `benchmarkChart` canvas wrapper — but the SVG compounding chart is NOT yet in the demo. Bishop locates it in the **Benchmarks section**, below the Chart.js bar chart, as a second chart in its own `cw-box` wrapper.
- **Target location in page:** Inside `#benchmarks` section, after the Chart.js recall chart's closing `</div>`, before the closing `</div class="c">`.

### Copy chart file:
```
SOURCE:  C:\Users\Administrator\Downloads\substrate-compounding-chart.svg
DEST:    C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\charts\substrate-compounding-chart.svg
```
(Create `static/charts/` directory if it does not exist.)

### Embed HTML to insert in Benchmarks section (after Chart.js recall chart):

```html
<!-- ======= SUBSTRATE COMPOUNDING CHART ======= -->
<div class="cw-box chart-tile" style="margin-top:var(--space-8)" aria-label="Click to expand chart">
  <div class="ct-row">
    <div>
      <div class="ct">Substrate Compounding</div>
      <div class="cs">Context cost per MAMBA decreases across waves &mdash; more substrate, fewer tokens per unit of work</div>
    </div>
  </div>
  <img src="/charts/substrate-compounding-chart.svg"
       alt="Substrate Compounding chart: X axis = Cumulative MAMBA Count 0-11, Y axis = Cumulative Context %. Three curves: gray dashed (no substrate, crashes at MAMBA 1-2), green Wave 1 at 10.75% per MAMBA, amber Wave 1+2 compounding at 6.57% per MAMBA. Founder quote: Notice how the MORE there is, the FASTER and MORE efficient it gets?"
       width="900" height="520"
       style="width:100%;height:auto;border-radius:var(--radius-lg)"
       loading="lazy">
  <p class="cn">Empirical anchor: 28-screenshot Pinned Proof &middot; canon_pinned_proof_bp087_knight_wave_2_ride_28_screenshots_0022_0053 &middot; Founder direct BP087 2026-06-20</p>
</div>
```

Note: The `chart-tile` class applies the click-expand JS already present in the demo's script block, so clicking this chart will expand it fullscreen.

---

## TASK 3 — Fix the /download/ 404 and rebuild

The `/download/` page is returning 404 in production. The `layouts/download/list.html` file EXISTS (Tower of Peace v0.4.4) but there are multiple `.tmp.*` orphan files alongside it. The 404 is likely a Hugo build artifact or routing issue. Knight does NOT rewrite this file — verify it builds correctly after the homepage port is done.

---

## TASK 4 — Build and deploy (NO RACE CONDITION)

```powershell
# Step 1: Hugo build — WAIT for full exit before proceeding
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo --config config-mnemosynec.toml --destination public-mnemosynec
if ($LASTEXITCODE -ne 0) { Write-Error "Hugo build FAILED. Abort deploy."; exit 1 }

# Step 2: Verify output exists
if (-not (Test-Path "public-mnemosynec\index.html")) { Write-Error "public-mnemosynec\index.html missing. Abort."; exit 1 }

# Step 3: Firebase deploy — only after build confirmed
firebase deploy --only hosting:mnemosyne
```

**Race condition guard:** Do NOT run firebase deploy in background or in parallel with hugo. The `&&` or `if ($LASTEXITCODE -ne 0)` pattern above enforces sequential execution.

---

## TASK 5 — Empirical verification (5 curl checks)

Run after Firebase deploy confirms success:

```powershell
# Check 1: Homepage 200 + canonical hero headline present
$r1 = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
Write-Host "STATUS:" $r1.StatusCode
$r1.Content | Select-String "has the Cure"

# Check 2: Download page 200 (no longer 404) + v0.7.1 present
$r2 = Invoke-WebRequest -Uri "https://mnemosynec.org/download/" -UseBasicParsing
Write-Host "STATUS:" $r2.StatusCode
$r2.Content | Select-String "v0.7"

# Check 3: Chart SVG serves HTTP 200
$r3 = Invoke-WebRequest -Uri "https://mnemosynec.org/charts/substrate-compounding-chart.svg" -UseBasicParsing
Write-Host "CHART STATUS:" $r3.StatusCode

# Check 4: Substrate Replaces New Data Centers canon phrase present
$r4 = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
$r4.Content | Select-String "Substrate Replaces"

# Check 5: Compounding chart embed reference present
$r5 = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
$r5.Content | Select-String "compounding"
```

---

## TASK 6 — Yoke return

Knight returns to BISHOP_DROPZONE with:
1. All 5 curl outputs (full text)
2. Firebase deploy URL + hosting channel
3. `ELECTRON_TOUCHED: NO`
4. Whether `/download/` 404 is resolved (YES/NO + how)
5. Hugo build output line count + any warnings

---

## §15 BLOOD NOTE

After Knight reports, Bishop re-gadgets independently via `curl -s https://mnemosynec.org/ | grep "has the Cure"` and `curl -s https://mnemosynec.org/charts/substrate-compounding-chart.svg | head -3` to confirm deployment before closing SEG-Y receipt.

---

## CONSTRAINTS

- ELECTRON_TOUCHED: NO (this dispatch does not touch Electron/MnemosyneC app code)
- Hugo config target: `config-mnemosynec.toml` ONLY
- Firebase target: `hosting:mnemosyne` ONLY
- Do NOT modify `alpha-banner.html` — it is correct (v0.7.1 per SEG-V)
- Do NOT use `version.json` — use `version_trust.json` per BP090 canon
- Do NOT push to any other Firebase site
- Do NOT rewrite the demo design — port its structure faithfully into Hugo template syntax

---

*Bishop SEG-Y · Sonnet 4.6 · BP093 · 2026-06-23*
