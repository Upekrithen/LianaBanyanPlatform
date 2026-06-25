# BP093 KNIGHT MARATHON BUNDLE · UNIFIED 5-PHASE

```
BP093 KNIGHT MARATHON BUNDLE · UNIFIED 5-PHASE · Sonnet 4.6 ONLY (Statutes §3) · §14 §15 §17 BLOOD · use segs

⚠️ CONFIRM YOUR COMPOSER MODEL IS SONNET 4.6 BEFORE PROCEEDING. (BP093 corrective canon — Composer 2.5 Fast was caught twice this session.)

Discovery rule: librarian gadgets only — pheromone_query / search_knowledge / consult_scribes / pearl_decode / brief_me. NO bash grep / find / Glob / Select-String for discovery. Shell ALLOWED ONLY for: psql per §15, curl per §14 REST, git mechanical, build/copy/deploy.
```

**MODEL CONFIRMED LINE (Knight fills this in FIRST before any task):**
`MODEL CONFIRMED: claude-sonnet-4-6` ← write this at the top of your Yoke Return, or STOP and escalate to Founder.

---

## OVERVIEW TABLE — All 5 Phases

| Phase | Name | Wall-Clock | ELECTRON_TOUCHED | Gate | On-Gate-Failure |
|---|---|---|---|---|---|
| 1 | v0.7.1 Deploy Fix + Gold Banner Add | 20–30 min | NO | 4-curl acceptance (Check 1–4 all pass) | **HARD STOP** — do not proceed to Phase 2 |
| 2 | v2 Design Refresh + Substrate Compounding Chart | 30–60 min | NO | 5-curl acceptance (Check 1–5 all pass) | STOP Phase 3+ · Phase 1 stands |
| 3 | Peer-Side 12-Blade Plow + Minor Council Wiring | 6.5–12.5 hr | **YES** | 2Q smoke: `iterations_run > 1` for ≥3/5 peers + `council_votes_per_iteration` populated | SKIP 42Q THUNDERCLAP · wiring stands · report in Yoke |
| 4 | Substrate Bridge flat→TIC + THIRD Plow Run | 67–117 min | NO | TIC files written > 0 + sample verify PASS | HARD STOP on Task 3 schema failure · Task 4 gates on Task 3 |
| 5 | Nav Pages Refresh: how-it-works + proofs | 60–90 min | NO | `Test-Path` both output html files True before deploy + 12+ curl checks | STOP deploy if Test-Path fails — surface to Founder |

**Sequential not parallel.** Complete each Phase fully (including its Yoke sub-receipt) before starting the next. Phase 3 is the longest by wall-clock. Phase 4 Task 4 (Third Plow 42Q) may be queued if M0 is busy — flag that explicitly in the Yoke return.

---

## PHASE 1 — v0.7.1 Deploy Fix + Gold Banner Add

**§3 §14 §15 §17 BLOOD · Knight reads this Phase completely before executing any task.**

Wall-clock: 20–30 min (Hugo build ~5 min + banner edit ~3 min + deploy ~10 min + verify ~5 min)
ELECTRON_TOUCHED: NO
Gate: All 4 curl checks PASS. Failure = HARD STOP.

**Source SEG:** KNIGHT_V071_DEPLOY_FIX_GOLD_BANNER_ADD_BP093.md (SEG-V · Bishop Sonnet 4.6)

---

### Phase 1 · Empirical Diagnosis (What Bishop Found)

Bishop independently gadgeted mnemosynec.org at 22:06–22:15 local 2026-06-23. Empirical state:

| Check | Result |
|---|---|
| `curl -sI https://mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe` | **HTTP 200 · Content-Length: 540639032** — .exe IS live |
| `curl -sI https://mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe` | **HTTP 503** — old .exe not present |
| `curl -s https://mnemosynec.org/download/` | **Returns 404 HTML** — Tower of Peace page NOT live |
| `curl -s https://mnemosynec.org/version_trust.json` | **Returns 404 HTML** — not served at root (data/ is build-time only) |
| GitHub release v0.7.1 | **EXISTS** — "MnemosyneC v0.7.1 — IP Ledger Ring Bearer + Empress Campaign" · tagged 2026-06-24T02:41:26Z |
| Gold alpha banner | `PUBLIC ALPHA · Build Log Live · v0.7.1` — version IS correct |
| "Substrate Replaces New Data Centers." on live site | **ABSENT** — not in banner, not on page |

**Root cause:** Firebase deploy cache at `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\.firebase\hosting.cHVibGljLW1uZW1vc3luZWM.cache` shows hash `cf83c13c222d54469aeade2918014cb6c8e61a64c6ea615c3c7dd471e2392252` for `download/index.html` = SHA256 of empty string. Race condition — Firebase started before Hugo finished writing files.

Local `public-mnemosynec/download/index.html` = 74,615 bytes (correct). Fix: re-run Hugo, then deploy.

**Note on version_trust.json:** Lives at `data/version_trust.json` — Hugo data source consumed at build time, NOT served as static file. The live `/version_trust.json` URL will always 404 on Firebase. This is expected, not a bug. BP090 canon: Tower template reads version_trust.json, not version.json.

---

### Phase 1 · Task 1 — Re-run Hugo build for mnemosynec config

Working directory: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

```powershell
hugo --config config-mnemosynec.toml --destination public-mnemosynec
```

Wait for Hugo to report "Total in X ms" and confirm no errors before proceeding. Do NOT start `firebase deploy` until Hugo has fully exited.

Verify:
```powershell
(Get-Item "public-mnemosynec\download\index.html").Length
# Expected: > 70000 bytes (should be ~74615)

(Get-FileHash "public-mnemosynec\download\index.html" -Algorithm SHA256).Hash.ToLower()
# Expected: NOT cf83c13c222d54469aeade2918014cb6c8e61a64c6ea615c3c7dd471e2392252
# (that hash = empty file = the race-condition artifact)
```

---

### Phase 1 · Task 2 — Add "Substrate Replaces New Data Centers." to gold alpha banner

File to edit:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\alpha-banner.html`

Current banner text (mnemosynec branch, line ~16):
```
PUBLIC ALPHA &middot; Build Log Live &middot; v{{ with (index .Site.Data.version_trust.versions 0) }}{{ .version }}{{ end }}
&nbsp;&mdash;&nbsp;
<a href="/how-it-works/" style="color:#1c1917;text-decoration:underline;">How it works</a>
```

Required edit — replace the mnemosynec banner content block with:
```html
  {{ if .Site.Params.isMnemosynec }}
    PUBLIC ALPHA &middot; Build Log Live &middot; v{{ with (index .Site.Data.version_trust.versions 0) }}{{ .version }}{{ end }}
    &nbsp;&middot;&nbsp;
    <code style="font-family:monospace;font-weight:700;font-size:0.82rem;letter-spacing:0.02em;">Substrate Replaces New Data Centers.</code>
    &nbsp;&mdash;&nbsp;
    <a href="/how-it-works/" style="color:#1c1917;text-decoration:underline;">How it works</a>
  {{ else }}
```

**Canon verbatim requirement (BP092 HARD CANON):** The phrase must appear exactly as: `Substrate Replaces New Data Centers.` — with period, verbatim. No paraphrase. Monospace font per canon. On the gold bar per Founder direction. The `lb_dc_strip_dismissed` localStorage key is the dismissal key per canon.

After editing, rebuild Hugo (same command as Task 1) so the alpha-banner change is baked into all pages.

---

### Phase 1 · Task 3 — Confirm .exe SHA256

The v0.7.1 .exe IS live at HTTP 200. Bishop confirmed Content-Length: 540639032.

Canonical SHA256 per `data/version_trust.json`: `7cb983022d2fcc91d6f1240c467dc02374a1aeba92b2711296eb5629854da845`

Firebase serves the file correctly. No re-upload needed unless SHA256 mismatch confirmed.

Optional verify (skip if confident):
```powershell
# Only run if you have a local copy of the uploaded .exe:
# (Get-FileHash "static\download\MnemosyneC-Setup-0.7.1.exe" -Algorithm SHA256).Hash.ToLower()
# Expected: 7cb983022d2fcc91d6f1240c467dc02374a1aeba92b2711296eb5629854da845
```

---

### Phase 1 · Task 4 — Confirm GitHub release v0.7.1

Bishop confirmed: `gh release list --repo liana-banyan/mnemosyne --limit 5` shows:
```
MnemosyneC v0.7.1 — IP Ledger Ring Bearer + Empress Campaign   Latest   v0.7.1   2026-06-24T02:41:26Z
```
GitHub release IS cut. No action required.

---

### Phase 1 · Task 5 — Firebase deploy

Working directory: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

After Hugo build is CONFIRMED COMPLETE (Task 1), run:
```powershell
firebase deploy --only hosting:mnemosyne
```

Wait for "Deploy complete!" confirmation. Copy the hosting URL from the output.

**CRITICAL: Do not run this command until Hugo has fully exited. The race condition from the prior deploy was caused by Firebase starting before Hugo finished writing files.**

---

### Phase 1 · Task 6 — Empirical Verification (4 curl checks · Gate)

After Firebase deploy completes, run all four:

```powershell
# Check 1 — Download page live (should NOT be 404)
curl -s https://mnemosynec.org/download/ | Select-String 'v0\.7\.1|Tower of Peace|Download v0'

# Check 2 — No stale version on download page
curl -s https://mnemosynec.org/download/ | Select-String 'v0\.5\.18'
# Expected: NO MATCH (empty result = good)

# Check 3 — .exe still present
(Invoke-WebRequest -Uri 'https://mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe' -Method Head).StatusCode
# Expected: 200

# Check 4 — "Substrate Replaces New Data Centers." on page (check root page, banner is on all pages)
curl -s https://mnemosynec.org/ | Select-String 'Substrate Replaces New Data Centers'
# Expected: MATCH with the phrase
```

**GATE: All 4 checks must pass. If any fail, HARD STOP. Do not proceed to Phase 2. Surface to Founder.**

---

### Phase 1 · §15 BLOOD Note

Bishop will independently re-gadget after this Yoke Return lands. The four canonical curl checks in Task 6 will be re-run by Bishop to empirically confirm the live state. Knight's Yoke Return is necessary but not sufficient — Bishop's independent gadget is the seal.

---

### Phase 1 · Yoke Sub-Receipt (Knight fills in before Phase 2)

```
PHASE 1 YOKE · KNIGHT · BP093

MODEL CONFIRMED: claude-sonnet-4-6

Task 1 — Hugo rebuild:
  Hugo exit code: [0/error]
  download/index.html byte size: [N bytes]
  download/index.html SHA256: [hash]
  NOT empty-file hash: [YES/NO]

Task 2 — Gold banner edit:
  "Substrate Replaces New Data Centers." added: [YES/NO]
  Rebuild confirmed: [YES/NO]

Task 3 — .exe SHA256:
  Local SHA256 match: [YES/NO/SKIPPED]

Task 4 — GitHub release:
  v0.7.1 confirmed: YES (Bishop pre-confirmed)

Task 5 — Firebase deploy:
  Deploy output URL: [url]
  Deploy exit code: [0/error]

Task 6 — Curl checks:
  Check 1 (download page live): [result]
  Check 2 (no 0.5.18 on page): [empty = good / found = BAD]
  Check 3 (.exe HTTP status): [200/other]
  Check 4 (Substrate Replaces banner): [MATCH/NO MATCH]

GATE: [PASS / FAIL — HARD STOP]
ELECTRON_TOUCHED: NO
```

---

## PHASE 2 — v2 Design Refresh + Substrate Compounding Chart

**§3 §17 BLOOD · Knight reads this Phase completely before executing any task.**

Wall-clock: 30–60 min
ELECTRON_TOUCHED: NO
Gate: All 5 curl checks PASS. Failure = STOP Phase 3+ · Phase 1 stands.

**Source SEG:** KNIGHT_DESIGN_REFRESH_PLUS_COMPOUNDING_CHART_BP093.md (SEG-Y · Bishop Sonnet 4.6)

---

### Phase 2 · Source Assets (Knight reads these)

```
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (2).html   ← CANONICAL (69,435 bytes · 2026-06-20 15:51 · most recent, most complete)
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (1).html   ← intermediate draft (65,431 bytes · 2026-06-20 00:11)
C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2.html        ← v2 base (56,658 bytes · 2026-06-19 23:37)
C:\Users\Administrator\Downloads\mnemosynec-design-demo.html           ← v1 baseline (32,840 bytes · 2026-06-19 22:50)
C:\Users\Administrator\Downloads\substrate-compounding-chart.svg       ← chart source (10,662 bytes · standalone SVG, self-contained)
C:\Users\Administrator\Downloads\substrate-compounding-chart.html      ← chart wrapper with click-expand JS (14,589 bytes)
```

Canonical design = `mnemosynec-design-demo-v2 (2).html` — newest timestamp, largest file, all features of prior versions PLUS: sliding decay table, 4-layer license summary panel, "A little more —" label on arch cards, horizontal bar chart (indexAxis:'y'), chart-tile click-expand on ALL interactive blocks.

Hugo template files being modified:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html  ← PRIMARY TARGET
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\alpha-banner.html         ← PRESERVE AS-IS (Phase 1 completed it)
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\index.html                         ← PRESERVE AS-IS
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\download\list.html                 ← Fix 404 (see Task 3)
```

---

### Phase 2 · Delta Table · Current Hugo template → Canonical demo (2)

| Element | Current `mnemosynec-homepage.html` | Canonical demo (2) |
|---|---|---|
| Color palette | Gold/amber `#d69e2e` dark navy `#0a1628` | Teal primary `#4fc3d0` `#0c0d0e` near-black · full CSS variable system |
| CSS architecture | ~740 lines hand-rolled BEM · navy hexagon texture bg | CSS var tokens · Inter + IBM Plex Mono · radial gradient hero |
| Logo in nav | SVG icon-only `Dr. MnemosyneC` text | Mascot portrait photo `<img>` from S3 + `Dr. MnemosyneC` text |
| Hero structure | 2-col grid LEFT:h1+dl-btn / RIGHT:mascot | 2-col flex LEFT:h1+bullets+CTA / RIGHT:mascot portrait · radial bg |
| Hero subhead | "The Substrate Cure to AI Amnesia." (gold) | Feature bullet list: Works with ChatGPT/Claude · Private · Free |
| Hero eyebrow | None | Pill badge: "Free · Private · Works with any AI" |
| Download CTA | Green `mn-v2-dl-btn` button stateful | Teal `btn-p` + modal-gated installer click-through |
| Installer modal | None | Full modal (SSPL terms · Apache · patent pledge · TUP · warranty · checkbox gate) |
| KPI strip | None | 4-cell strip: 89.3% / 6% / +83pts / $0 |
| Benchmark chart | Custom CSS bar chart (horizontal bars, no Chart.js) | Chart.js horizontal bar `indexAxis:'y'` with click-expand |
| Benchmark chart heading | "Does It Actually Work?" (amber h2) | "Memory That Actually Works" + "Prove It Yourself →" CTA |
| Architecture section | 3-layer `<details>` accordions | 3 flip cards (3D rotateY) with "A little more —" sublabel |
| Layer 1 name | "Reader" | "The Librarian" |
| Lifecycle section | Absent | 4-step flow: Pheromone → Socceri Triad → Living Connection → Stone Tablet |
| Commercial section | Absent | Full "Android-of-AI Licensing" card with decay schedule table, countdown timer, Saladin badge, 4-layer license summary |
| Proofs section | Accordion-based with screenshot lightboxes | 3-card grid with click-expand tiles |
| Substrate compounding chart | Absent | NOT IN DEMO FILE — Bishop-specified insertion in Benchmarks section |
| Footer | Custom dark footer with navigation links | 3-col footer: Cooperative info / Links / Legal + Cooperative Liturgy block |
| Cooperative Liturgy | Absent | "Let's Help Each Other Help Ourselves." / "Coffee's for Closers. Help Yourself." / "For Alford." |
| Theme toggle | Absent (dark-only) | Light/dark toggle in nav |
| Download page `/download/` | `layouts/download/list.html` (404 in production) | No explicit download page in demo — fix must restore working Hugo template |
| Alpha banner | `partials/alpha-banner.html` (gold bar v0.7.1, now with Substrate Replaces phrase) | Not in demo — PRESERVE existing partial |
| Substrate DC strip | Not visible from homepage partial | Add per BP092 canon below alpha banner |

---

### Phase 2 · Task 1 — Port canonical design demo HTML into Hugo homepage template

**Target file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

Replace the entire content of `mnemosynec-homepage.html` with a Hugo-templated version of the canonical demo. Do NOT rewrite the demo design — port its structure faithfully.

**Mandatory adaptations from demo → Hugo template:**

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
- Add `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` inside the partial or at bottom before closing

**F. Nav links to preserve:**
- `Architecture` · `Benchmarks` · `Commercial` · `Proofs` (as in demo)
- Download button → opens modal

**G. Commercial section email:**
- Use `licensing@lianabanyan.com` (canonical from latest demo (2) file)

**H. Commercial section — licensing window (decay schedule):**
- Use demo (2) decay schedule table verbatim: 30-day windows, diminishing term (5yr → 4yr → 3yr → 2yr → 1yr → Full FRAND)

**I. Footer Cooperative Liturgy:**
- Include the full liturgy block from demo (2):
  ```
  Let's Help Each Other Help Ourselves.
  Coffee's for Closers. Help Yourself.
  For Alford.
  ```
- "For Alford." is a reservation marker — include as-is

---

### Phase 2 · Task 2 — Embed the substrate-compounding-chart

**Chart analysis:**
- `substrate-compounding-chart.svg` — standalone SVG, self-contained, no external dependencies, 187 lines, dark bg `#0f0f0f`
- `substrate-compounding-chart.html` — wrapper adding click-to-expand JS pattern (`chart-tile` class + backdrop modal)
- What it visualizes: X-axis = Cumulative MAMBA Count (0–11), Y-axis = Cumulative Context % (0–120%). Three curves: gray dashed (no substrate, crashes at MAMBA 1–2); green (Wave 1 with substrate, 10.75%/MAMBA); amber (Wave 2 compounding, 6.57%/MAMBA). Founder quote: "Notice how the MORE there is, the FASTER and MORE efficient it gets?" Title: "Substrate Compounding — Context Cost Per MAMBA Decreases Across Waves"
- Target location: Inside `#benchmarks` section, after the Chart.js recall chart's closing `</div>`, before the closing `</div class="c">`.

Copy chart file:
```
SOURCE:  C:\Users\Administrator\Downloads\substrate-compounding-chart.svg
DEST:    C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\charts\substrate-compounding-chart.svg
```
(Create `static/charts/` directory if it does not exist.)

Embed HTML to insert in Benchmarks section (after Chart.js recall chart):

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

### Phase 2 · Task 3 — Fix the /download/ 404 and rebuild

The `/download/` page is returning 404 in production. The `layouts/download/list.html` file EXISTS (Tower of Peace v0.4.4) but there are multiple `.tmp.*` orphan files alongside it. The 404 is likely a Hugo build artifact or routing issue. Knight does NOT rewrite this file — verify it builds correctly after the homepage port is done.

---

### Phase 2 · Task 4 — Build and deploy (NO RACE CONDITION)

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

**Race condition guard:** Do NOT run firebase deploy in background or in parallel with hugo. The `if ($LASTEXITCODE -ne 0)` pattern above enforces sequential execution.

---

### Phase 2 · Task 5 — Empirical Verification (5 curl checks · Gate)

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

**GATE: All 5 checks must pass. If any fail, STOP Phase 3+. Phase 1 stands. Surface failures to Founder.**

---

### Phase 2 · Constraints

- ELECTRON_TOUCHED: NO (this dispatch does not touch Electron/MnemosyneC app code)
- Hugo config target: `config-mnemosynec.toml` ONLY
- Firebase target: `hosting:mnemosyne` ONLY
- Do NOT modify `alpha-banner.html` — it is correct (Phase 1 completed it)
- Do NOT use `version.json` — use `version_trust.json` per BP090 canon
- Do NOT push to any other Firebase site
- Do NOT rewrite the demo design — port its structure faithfully into Hugo template syntax

---

### Phase 2 · §15 BLOOD Note

After Knight reports, Bishop re-gadgets independently via `curl -s https://mnemosynec.org/ | grep "has the Cure"` and `curl -s https://mnemosynec.org/charts/substrate-compounding-chart.svg | head -3` to confirm deployment before closing SEG-Y receipt.

---

### Phase 2 · Yoke Sub-Receipt (Knight fills in before Phase 3)

```
PHASE 2 YOKE · KNIGHT · BP093

Curl Check 1 (homepage + headline): [PASS/FAIL + output]
Curl Check 2 (download page + v0.7.1): [PASS/FAIL + status]
Curl Check 3 (chart SVG 200): [PASS/FAIL + status]
Curl Check 4 (Substrate Replaces): [PASS/FAIL + output]
Curl Check 5 (compounding embed): [PASS/FAIL + output]
Firebase deploy URL: [url]
Hugo build warnings: [none / list]
/download/ 404 resolved: [YES/NO + how]
New chart URL: https://mnemosynec.org/charts/substrate-compounding-chart.svg
Design tokens propagated: [YES/NO]

GATE: [PASS — proceed to Phase 3 / FAIL — STOP, list failures]
ELECTRON_TOUCHED: NO
```

---

## PHASE 3 — Peer-Side 12-Blade Plow + Minor Council Wiring

**§3 §14 §15 §17 BLOOD · ELECTRON_TOUCHED: YES · Knight reads this Phase completely before executing any task.**

Wall-clock: 4–8 hr (TypeScript wiring) + 30 min (2Q smoke) + 2–4 hr (42Q THUNDERCLAP with Plow-accelerated pace) = 6.5–12.5 hr total

Gate: 2Q smoke `iterations_run > 1` for at least 3 of 5 peers + `council_votes_per_iteration` array populated + not null.

Failure = SKIP 42Q THUNDERCLAP but wiring stands. Report in Yoke. Proceed to Phase 4.

---

### Phase 3 · Background and Doctrine

**BP093 SEG-R empirical audit findings:**

`validate-relay.mjs` orchestrator writes `plow_max_iterations=12` to route payload at lines 849–866. But NO peer-side worker code reads it. The "Plow: mesh-12-blade · Minor Council 3 judges per iteration" startup banner is a log statement only — no Minor Council invocation exists in the codebase. The Plow doctrine is configured but NOT wired in the peer.

Per `canon_batchecks_vs_real_swings_full_power_wiring_threshold_bp092`: Canon-ratified + NOT WIRED = batcheck (false positive). This is a batcheck. Phase 3 converts it to a real swing.

**Reference implementation:**

Per BP093 SEG-U: `plow-cli-12blade.js` IS a working reference implementation of the 12 blades. Knight uses it as the pattern for the peer worker.

The 12 blades are:
1. Spider — reads vault JSON files, matches question keywords, injects `known[]` facts as context
2. Sprite — lightweight semantic expansion of query terms
3. Specialists (Wikipedia / arXiv / Wikidata / Ollama-synth) — external knowledge retrieval
4. Miner — extracts key claims from candidate answers
5. Saladin — pattern matching against historical correct patterns
6. Furnace — burns weak hypotheses, keeps survivors
7. Three Fates — concordance vote (CONCORDANT / PARTIAL / DISCORDANT)
8. Scribe — writes iteration receipt to JSONL
9. Detective TEAM — parallel investigation of competing answers
10. Psionic — confidence scoring
11. Auditor — fact-checks final answer
12. Sentinel — upserts results to Supabase (existing `plow-cli-12blade.js` handles this)

**What Phase 3 ports:** The iterative loop (Plow maxIterations) + 3-judge Minor Council consensus check between iterations, into the peer relay worker.

---

### Phase 3 · Task 3.1 — GADGET reference implementation FIRST (§14 §17 BLOOD)

**Read these files head-to-tail:**

1. `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js`
   - Understand each blade's invocation pattern
   - Note: how it reads `plow_max_iterations`, how it fires the iteration loop, how it calls local ollama, how it collects and scores candidate answers

2. Identify the peer relay-poll handler. Knight SHALL Read the following likely paths to find the route-processing function:
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\relay.ts` (if exists)
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\peer.ts` (if exists)
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\worker.ts` (if exists)

   Knight identifies which file contains the function that:
   - Polls `relay_routes` or `relay_route_assignments` for pending routes
   - Reads the question from the route payload
   - Calls ollama.generate() to produce an answer
   - Writes the answer back to `relay_route_replies`

   If none of the above paths exist, Knight reads `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\` directory listing (via shell `Get-ChildItem`, which is ALLOWED for navigation) and identifies the correct file.

**Discovery rule (§17 BLOOD):** Knight's fresh observation of the actual file locations wins over Bishop's guesses above. If the actual structure differs, proceed based on what Knight finds on disk.

---

### Phase 3 · Task 3.2 — Wire peer-side Plow loop

**In the route-processing function (identified in Task 3.1), after receiving a route payload:**

Implement this logic (adapt to the language/framework of the actual peer worker file):

```typescript
// Read Plow configuration from payload
const plow_max_iterations = payload_json?.plow_max_iterations ?? 1;

let finalAnswer: string | null = null;
let iterations_run = 0;
const council_votes_per_iteration: Array<{
  iter: number;
  valid: number;
  invalid: number;
  refine: number;
}> = [];

let contextAccumulated = question; // starts with base question

for (let iter = 1; iter <= plow_max_iterations; iter++) {
  iterations_run = iter;

  // === Step 1: Generate candidate answer ===
  const candidateResponse = await ollama.generate({
    model: routePayload.model || 'llama3.3:70b',
    prompt: contextAccumulated,
    stream: false,
  });
  const candidateAnswer = candidateResponse.response?.trim() ?? '';

  // === Step 2: Fire 3-judge Minor Council ===
  // Use a SMALLER local model for council (gemma2:2b is fast + diverse)
  // 3 parallel calls — small model keeps total time under 30s per iteration
  const councilModel = 'gemma2:2b';
  const councilPromptTemplate = (q: string, a: string) =>
    `Independently evaluate this question and answer. Be brief and direct.\n\nQuestion: ${q}\n\nProposed answer: ${a}\n\nReply with exactly one of: VALID / INVALID / NEEDS_REFINEMENT\nThen one sentence of reasoning.\n\nYour verdict:`;

  const councilResponses = await Promise.all([
    ollama.generate({ model: councilModel, prompt: councilPromptTemplate(question, candidateAnswer), stream: false }),
    ollama.generate({ model: councilModel, prompt: councilPromptTemplate(question, candidateAnswer), stream: false }),
    ollama.generate({ model: councilModel, prompt: councilPromptTemplate(question, candidateAnswer), stream: false }),
  ]);

  // === Step 3: Count votes ===
  let valid = 0, invalid = 0, refine = 0;
  const councilReasons: string[] = [];

  for (const resp of councilResponses) {
    const text = (resp.response ?? '').toUpperCase();
    if (text.includes('NEEDS_REFINEMENT')) { refine++; }
    else if (text.includes('INVALID')) { invalid++; }
    else if (text.includes('VALID')) { valid++; }
    else { refine++; } // treat ambiguous as NEEDS_REFINEMENT
    councilReasons.push(resp.response?.slice(0, 200) ?? '');
  }

  council_votes_per_iteration.push({ iter, valid, invalid, refine });

  // === Step 4: Converge or continue ===
  if (valid >= 2) {
    // Council consensus: VALID — accept answer, break loop
    finalAnswer = candidateAnswer;
    break;
  }

  // Not converged — append council reasoning to context for next iteration
  const reasoningNote = councilReasons.filter(r => r.length > 0).join('\n');
  contextAccumulated = `${contextAccumulated}\n\n[Previous attempt was rated ${invalid} INVALID, ${refine} NEEDS_REFINEMENT by council. Reasons:\n${reasoningNote}\n\nRevised answer:]`;

  // On final iteration, keep whatever we have
  if (iter === plow_max_iterations) {
    finalAnswer = candidateAnswer;
  }
}

// === Write final answer with Plow receipt ===
const answerJson = {
  answer: finalAnswer,
  answer_letter: extractAnswerLetter(finalAnswer), // existing extraction logic
  iterations_run,
  council_votes_per_iteration,
};
```

**Integration notes:**
- `ollama` here refers to whatever ollama client is already used in the peer worker — do NOT import a new library, use the existing pattern
- `question` is whatever variable holds the question text from the route payload — match the existing naming convention in the file
- `extractAnswerLetter` is whatever existing function extracts the answer letter (A/B/C/D/E) from the model's text — use the existing implementation
- The `answerJson` object is what gets written to `relay_route_replies.answer_json` — add `iterations_run` and `council_votes_per_iteration` as additional fields to whatever object is already being built

**If the peer worker currently builds answer_json differently** (e.g., only sets `answer_letter`), Knight extends that object rather than replacing it. Non-breaking addition to existing `jsonb` column.

**§14 BLOOD check:** Knight confirms no Electron renderer code or browser-side code is touched. The peer relay worker is Node.js main-process code only. If Knight accidentally navigates to `src/renderer/`, STOP and surface to Founder.

---

### Phase 3 · Task 3.3 — Receipt schema extension in validate-relay.mjs

In `validate-relay.mjs` (orchestrator), find the section around lines 1100–1200 where the per-peer summary is built (post-poll aggregation).

**After reading the actual file to find the exact location**, update the per-peer summary construction to pull `iterations_run` and `council_votes_per_iteration` from each reply's `answer_json`:

```javascript
// In the per-peer summary builder (adapt to actual structure):
const perPeerSummary = {
  // ... existing fields ...
  iterations_run: replyRow.answer_json?.iterations_run ?? null,
  council_votes_per_iteration: replyRow.answer_json?.council_votes_per_iteration ?? null,
};
```

This is a non-breaking addition — the receipt JSON gets richer, existing fields are unchanged.

**§17 BLOOD:** If the actual structure at lines 1100–1200 differs from Bishop's description, Knight adapts to what is actually there. Knight's fresh read wins.

---

### Phase 3 · Task 3.4 — Fire 2Q smoke validation (Gate check)

```powershell
# Knight runs the 2Q smoke validation:
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c_SMOKE_2Q.cmd
```

Note: This is the SEG-O-patched version with `--receipt=` and the SEG-K mojibake fix already applied.

After the smoke run completes, Bishop gadgets via psql (§15 BLOOD — Bishop executes this gadget independently):

```sql
SELECT route_id, answer_json->>'iterations_run' AS iters,
       answer_json->'council_votes_per_iteration' AS council, processing_ms
  FROM relay_route_replies
  WHERE route_id IN (
    SELECT id FROM relay_routes
    WHERE session_id LIKE '%SMOKE_2Q_BP093%'
    ORDER BY created_at DESC
    LIMIT 10
  );
```

**PASS gate:** `iterations_run > 1` for at least 3 of 5 peers AND `council_votes_per_iteration` array populated AND not null.

If smoke PASSES → proceed to Task 3.5 (42Q THUNDERCLAP).
If smoke FAILS → STOP at this task. Wiring stands. Report in Yoke. Proceed to Phase 4.

---

### Phase 3 · Task 3.5 — If 2Q smoke PASSES, fire 42Q THUNDERCLAP

```powershell
# Knight runs the full 42Q validation:
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c.cmd
```

Note: This is the SEG-O-patched version with Round-Up Phase 2.

Expected wall-clock: 2–4 hr with Plow accelerating convergence (vs 7–10 hr cascade-only).

Receipt lands in:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\`

Knight notes start time and end time. Full receipt path reported in Yoke return.

---

### Phase 3 · Task 3.6 — Yoke Sub-Receipt for Phase 3

```
PHASE 3 YOKE · KNIGHT · BP093

TypeScript wiring:
  File modified: [absolute path]
  Lines added: [approx count]
  plow_max_iterations read from payload: [YES/NO]
  Minor Council 3-judge loop wired: [YES/NO]
  iterations_run written to answer_json: [YES/NO]
  council_votes_per_iteration written to answer_json: [YES/NO]

validate-relay.mjs receipt extension:
  File modified: [absolute path — likely C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs]
  Approximate line range: [N-M]
  iterations_run in per-peer summary: [YES/NO]
  council_votes_per_iteration in per-peer summary: [YES/NO]

2Q smoke:
  Session ID: [SMOKE_2Q_BP093_...]
  Peers responded: [N/5]
  iterations_run per peer: [list e.g. 3, 4, 2, 5, 3]
  council_votes populated: [YES/NO]
  GATE RESULT: [PASS / FAIL — reason]

42Q THUNDERCLAP (if 2Q smoke PASSED):
  Start time: [HH:MM UTC]
  End time: [HH:MM UTC]
  Wall-clock: [minutes]
  Receipt path: [absolute path]
  Final accuracy: [Q correct / 42]
  Median Plow iteration count: [N]
  Three Fates concordance: CONCORDANT [N] / PARTIAL [N] / DISCORDANT [N]
  OR: SKIPPED — 2Q smoke failed

ELECTRON_TOUCHED: YES
FILES_TOUCHED:
  - [peer worker file] (MODIFIED)
  - [validate-relay.mjs absolute path] (MODIFIED)
```

---

## PHASE 4 — Substrate Bridge flat→TIC + THIRD Plow Run

**§3 §14 §15 §17 BLOOD · Knight reads this Phase completely before executing any task.**

Wall-clock: 67–117 min (Tasks 1–3 can complete immediately; Task 4 can run in background while Knight completes Phase 5; Task 5 gates on Task 4 completion)
ELECTRON_TOUCHED: NO
Gate: TIC files written > 0 + sample verify PASS for all 5 sampled files.

**Source SEG:** KNIGHT_PHASE_4_SUBSTRATE_BRIDGE_BP093.md (SEG-AB · Bishop Sonnet 4.6)

---

### Phase 4 · Context — SEG-AA Empirical Findings

Source file confirmed on disk:
`C:\Users\Administrator\AppData\Roaming\mnemosynec\substrate\verified_eblets.jsonl`

**Line count:** 17,926 lines (Bishop observed; Knight re-verify with `(Get-Content <path> | Measure-Object -Line).Lines`)

**Class breakdown (Bishop count — Knight re-verify on disk):**
| Class | Pattern | Count |
|---|---|---|
| Class A | `context_seed:mmlu_pro:<domain>:bp083` | 12,062 |
| Class B | `canonical_plow:wikipedia\|arxiv\|openalex:<domain>:bp083` | 5,584 |
| Starter | `starter_chocolate:<domain>:v0.3.7` | 280 |
| **Total** | | **17,926** |

**Why the bridge is needed:**
`plow-cli-12blade.js` Spider blade (Blade 1) reads `<vault>/*.json` files via `fs.readdirSync(vaultPath).filter(f => f.endsWith('.json'))`, parses each as JSON, and looks for `data.known[]` arrays. It matches question keywords against `JSON.stringify(data).toLowerCase()`. The flat JSONL at `verified_eblets.jsonl` is invisible to Spider — it only reads individual `.json` files.

**First Plow baseline (empirical receipt):**
- Run: `FIRST_PLOW_42Q_BP093` · 6 questions complete
- Spider hits (`eblet_snapshot.known_count`) across all 6 Q: **0** (zero)
- Avg BMV: **31.7**
- Concordant: 1 · Discordant: 4 · Partial: 1

This is the zero-substrate baseline. After the bridge, the THIRD run should show Spider hits > 0 and BMV uplift.

---

### Phase 4 · Task 1 — Build flat→TIC Bridge Script

Write this file exactly to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js`

```javascript
#!/usr/bin/env node
/**
 * bridge_flat_to_tic_bp093.js
 * Converts verified_eblets.jsonl (flat) → TIC-schema .json files
 * that plow-cli-12blade.js Spider blade can read.
 *
 * Usage:
 *   node bridge_flat_to_tic_bp093.js \
 *     --in  <path/to/verified_eblets.jsonl> \
 *     --out <path/to/output-vault-dir> \
 *     [--class A|B|both|all]   (default: both = A+B)
 *
 * NEVER loads whole file into memory. Stream-parses line by line via readline.
 *
 * §14 BLOOD: no Electron/peer code touched.
 * §17 BLOOD: empirical — run and inspect sample output before claiming success.
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const readline = require('readline');
const crypto  = require('crypto');

function getArg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const IN_FILE   = getArg('--in',    null);
const OUT_DIR   = getArg('--out',   null);
const CLASS_ARG = (getArg('--class', 'both')).toLowerCase();

if (!IN_FILE || !OUT_DIR) {
  console.error('Usage: node bridge_flat_to_tic_bp093.js --in <jsonl-path> --out <vault-dir> [--class A|B|both|all]');
  process.exit(1);
}

const INCLUDE_A       = ['a', 'both', 'all'].includes(CLASS_ARG);
const INCLUDE_B       = ['b', 'both', 'all'].includes(CLASS_ARG);
const INCLUDE_STARTER = CLASS_ARG === 'all';

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function sha8(sha256) {
  return String(sha256 || '').slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, 'x');
}

function domainFromProvenance(prov) {
  const parts = String(prov || '').split(':');
  if (parts[0] === 'context_seed')      return parts[2] || 'unknown';
  if (parts[0] === 'canonical_plow')    return parts[2] || 'unknown';
  if (parts[0] === 'starter_chocolate') return parts[1] || 'unknown';
  return 'unknown';
}

function classifyEntry(prov) {
  if (!prov) return null;
  if (prov.startsWith('context_seed:'))      return 'A';
  if (prov.startsWith('canonical_plow:'))    return 'B';
  if (prov.startsWith('starter_chocolate:')) return 'STARTER';
  return null;
}

function safeSlug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

function buildFact(entry, cls) {
  if (cls === 'A' || cls === 'STARTER') {
    const q = String(entry.question || '').trim();
    const a = String(entry.answer   || '').trim();
    return `${q} → ${a}`;
  }
  if (cls === 'B') {
    const text = String(entry.answer || '').trim();
    return text.length > 500 ? text.slice(0, 500) + '…' : text;
  }
  return String(entry.answer || entry.question || '').slice(0, 500);
}

function buildTIC(entry, cls, bridgedAt) {
  const domain = domainFromProvenance(entry.provenance);
  const fact   = buildFact(entry, cls);

  return {
    id:       entry.sha256 ? entry.sha256.slice(0, 16) : crypto.randomBytes(8).toString('hex'),
    domain,
    known: [
      {
        fact,
        source:   entry.provenance || 'unknown',
        sha256:   entry.sha256     || '',
        verified: true
      }
    ],
    theories_open:            [],
    eliminated:               [],
    dependencies_upstream:    [],
    applications_downstream:  [],
    provenance:    entry.provenance || '',
    bridged_at_iso: bridgedAt
  };
}

async function main() {
  ensureDir(OUT_DIR);

  const BRIDGED_AT = new Date().toISOString().slice(0, 10);

  let written = 0, skipped = 0, lineNo = 0, filteredOut = 0;
  const domainCounts = {};

  const rl = readline.createInterface({
    input:     fs.createReadStream(IN_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lineNo++;
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try { entry = JSON.parse(trimmed); }
    catch { skipped++; continue; }

    const cls = classifyEntry(entry.provenance);
    if (!cls) { skipped++; continue; }

    if (cls === 'A'       && !INCLUDE_A)       { filteredOut++; continue; }
    if (cls === 'B'       && !INCLUDE_B)       { filteredOut++; continue; }
    if (cls === 'STARTER' && !INCLUDE_STARTER) { filteredOut++; continue; }

    const tic      = buildTIC(entry, cls, BRIDGED_AT);
    const domain   = tic.domain;
    const filename = `bp083_${safeSlug(domain)}_${sha8(entry.sha256)}.json`;
    const outPath  = path.join(OUT_DIR, filename);

    try {
      fs.writeFileSync(outPath, JSON.stringify(tic, null, 2), 'utf8');
      written++;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch (err) {
      console.error(`[bridge] write error line ${lineNo}: ${err.message}`);
      skipped++;
      continue;
    }

    if (written % 500 === 0) {
      console.log(`[bridge] progress: ${written} written (line ${lineNo}, skipped ${skipped})`);
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log('BRIDGE COMPLETE');
  console.log(`  Input file:     ${IN_FILE}`);
  console.log(`  Output dir:     ${OUT_DIR}`);
  console.log(`  Lines read:     ${lineNo}`);
  console.log(`  Written:        ${written}`);
  console.log(`  Skipped:        ${skipped}`);
  console.log(`  Filtered out:   ${filteredOut}`);
  console.log('\nPer-domain breakdown:');
  for (const [d, c] of Object.entries(domainCounts).sort()) {
    console.log(`  ${d.padEnd(20)} ${c}`);
  }
  console.log('══════════════════════════════════════════\n');

  let inputSha256 = '';
  try {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(IN_FILE);
    await new Promise((resolve, reject) => {
      stream.on('data', d => hash.update(d));
      stream.on('end',  resolve);
      stream.on('error', reject);
    });
    inputSha256 = hash.digest('hex');
  } catch { inputSha256 = 'error-computing'; }

  const domainRows = Object.entries(domainCounts).sort()
    .map(([d, c]) => `| ${d} | ${c} |`).join('\n');

  const manifest = `# _MANIFEST.md — Substrate Bridge BP093
Generated: ${new Date().toISOString()}
Source: ${IN_FILE}
Source sha256: ${inputSha256}
Class filter: ${CLASS_ARG}

## Totals
| Metric | Count |
|---|---|
| Lines read | ${lineNo} |
| TIC files written | ${written} |
| Skipped (malformed) | ${skipped} |
| Filtered out (class) | ${filteredOut} |

## Per-Domain Count
| Domain | Files |
|---|---|
${domainRows}
`;

  fs.writeFileSync(path.join(OUT_DIR, '_MANIFEST.md'), manifest, 'utf8');
  console.log(`[bridge] Manifest written → ${path.join(OUT_DIR, '_MANIFEST.md')}`);
}

main().catch(err => {
  console.error('[bridge] fatal:', err);
  process.exit(1);
});
```

---

### Phase 4 · Task 2 — Run the Bridge

After writing the script, execute:

```powershell
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js" `
  --in  "C:\Users\Administrator\AppData\Roaming\mnemosynec\substrate\verified_eblets.jsonl" `
  --out "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged" `
  --class both
```

Expected behavior:
- Output dir created automatically if absent
- Progress printed every 500 entries written
- Final summary shows per-domain breakdown
- `_MANIFEST.md` written to output dir
- Expected TIC files: ~17,646 (Class A: 12,062 + Class B: 5,584) with `--class both`

**§17 BLOOD verify after run:**
```powershell
(Get-ChildItem "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged" -Filter "*.json" | Where-Object { $_.Name -ne '_MANIFEST.md' }).Count
```
Count must be > 0. If 0, the stream-parse failed — check Node version (`node --version` must be >= 14 for `for await` readline).

---

### Phase 4 · Task 3 — Sample Verify (5 Files) — Gate

After Task 2 completes, Knight reads 5 files from the output vault to confirm TIC schema is correct.

**Method:** Use shell `Get-ChildItem` on `substrate_mmlu_pro_bp083_bridged/*.json` to find files, then Read 5 of them (NOT `_MANIFEST.md`).

For each file, confirm ALL of the following:
- `id` field present (16-char hex string)
- `domain` field is a valid MMLU-Pro domain string (e.g., `math`, `physics`, `engineering`)
- `known` is an array with at least 1 element
- `known[0].fact` is a non-empty string >= 10 chars
- `known[0].verified` is `true`
- `known[0].source` matches the original provenance pattern
- `theories_open`, `eliminated`, `dependencies_upstream`, `applications_downstream` are all empty arrays
- `bridged_at_iso` is present

**Pass criteria:** All 5 files pass all checks. If any fail, report exact field/value that failed.

**GATE FAILURE:** If sample verify fails, HARD STOP on Phase 4 Tasks 4–5. Surface to Founder with exact failure details. Do NOT proceed to Task 4 if schema is wrong — Task 4's entire value depends on Spider blade reading these files correctly.

---

### Phase 4 · Task 4 — Fire Plow Primed-Substrate Run (THIRD Run)

First, check if M0 is idle:
```powershell
curl -s http://localhost:11434/api/ps
```

If response shows any model with `size_vram > 0` and `expires_at` in the future, M0 is busy. **Queue Task 4** for after current work completes. Report QUEUED in Yoke. Proceed to Phase 5 — Phase 4 Task 4 can run in background.

If M0 is idle (empty `models` array), proceed:

```powershell
New-Item -ItemType Directory -Force "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093" | Out-Null

node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js" `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\shard_42q_12blade_bp093.json" `
  --model llama3.3:70b `
  --ollama http://localhost:11434 `
  --out "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_bridged.jsonl" `
  --telemetry "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_telem_bridged.json" `
  --vault "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged"
```

What this proves: Spider blade will now scan up to 100 files from `substrate_mmlu_pro_bp083_bridged/`, match question keywords, and inject `known[]` facts as context. BMV uplift (if any) is the substrate-compounding empirical receipt.

Note start time and end time in Yoke return. Expected wall-clock: 45–90 min for 42Q at llama3.3:70b.

---

### Phase 4 · Task 5 — Empirical Compounding Report

After Task 4 completes, Knight writes a comparison report.

**Report path:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md`

Knight gadgets per-Q Spider hits:
```powershell
# First Plow baseline:
Get-Content "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\FIRST_PLOW_42Q_BP093\twelveblade_telemetry.jsonl" |
  ForEach-Object { try { ($_ | ConvertFrom-Json).eblet_snapshot.known_count } catch { 0 } } |
  Measure-Object -Sum -Average

# Third Plow bridged:
Get-Content "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_telem_bridged.json" |
  ConvertFrom-Json | ... # adapt to actual structure
```

Extract `bmv_score` per question from First and Third runs. Compute:
- Delta BMV per Q (Third minus First)
- Mean BMV uplift across all Q
- Count of Q where BMV improved vs regressed

Three Fates concordance distribution comparison (First vs Third vs Delta).

**Report must include:**
1. Whether Spider hit count increased (expected: yes, if domain keywords overlap >= 2 words)
2. Whether BMV improved (expected: yes for domain-matched Q)
3. Honest null result if no uplift: state "substrate compounding not demonstrated at 42Q scale — possible causes: Spider 100-file cap, keyword overlap threshold >= 2"
4. Next step recommendation (scale bridge → full 17K files visible, increase Spider cap to 500)

---

### Phase 4 · §14 §15 §17 BLOOD Reminders

**§14 BLOOD:** No Electron, no peer-mesh, no MnemosyneC app code. This phase touches `tools/plow-cli/` only. If Knight accidentally opens any file under `src/` (Electron/React) it must stop and return to Bishop.

**§15 BLOOD:** Supabase direct access stays within existing `plow-cli-12blade.js` patterns. Knight does not add new Supabase endpoints. The bridge writes filesystem JSON only.

**§17 BLOOD:** If any empirical observation contradicts the Context section, Knight's fresh observation wins. Log the discrepancy in the Yoke return.

**§3 BLOOD (Postgres syntax):** No SQL in this phase, but for any incidental DB work: `gen_random_uuid()` not `uuid()`, `TIMESTAMPTZ` not `DATETIME`, `BIGSERIAL` not `INTEGER AUTOINCREMENT`.

---

### Phase 4 · Yoke Sub-Receipt

```
PHASE 4 YOKE · KNIGHT · BP093

Bridge script:       C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js
TIC files written:   [count]
Sample verify:       PASS / FAIL (list any failures)
MANIFEST sha256:     [input file sha256 from _MANIFEST.md]

THIRD Plow run:
  Start:             [HH:MM UTC]
  End:               [HH:MM UTC]
  Wall-clock:        [minutes]
  OR Queue status:   QUEUED — M0 busy with [model], ETA [time]

Compounding report:  C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md
  Spider hit delta:  +[n] (First: 0, Third: [n])
  BMV delta:         +[n] (First avg: 31.7, Third avg: [n])
  Concordance delta: CONCORDANT [first]->[third]

ELECTRON_TOUCHED: NO
FILES_TOUCHED:
  - tools/plow-cli/bridge_flat_to_tic_bp093.js (NEW)
  - Asteroid-ProofVault/state/eblets/substrate_mmlu_pro_bp083_bridged/ (NEW DIR, [n] files)
  - receipts/PLOW/THIRD_PLOW_42Q_BRIDGED_BP093/ (NEW DIR)
  - BISHOP_DROPZONE/00_FOUNDER_REVIEW/SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md (NEW)
```

---

## PHASE 5 — Nav Pages Refresh: how-it-works + proofs + v2 Design Propagation

**§3 §14 §15 §17 BLOOD · Knight reads this Phase completely before executing any task.**

Wall-clock: 60–90 min (Tasks 1–3: 40 min · Task 4 Hugo+deploy: 10–20 min · Task 5 verify: 10 min)
ELECTRON_TOUCHED: NO
Gate: `Test-Path` returns True for both `public-mnemosynec\how-it-works\index.html` and `public-mnemosynec\proofs\index.html` before deploy. 12+ curl checks must pass.

**Source SEG:** KNIGHT_NAV_PAGES_REFRESH_HOW_IT_WORKS_PROOFS_PLUS_BP093.md (SEG-AC · Bishop Sonnet 4.6)

---

### Phase 5 · Context

Founder shared two new Composer-built HTML pages:
- `C:\Users\Administrator\Downloads\mnemosynec-how-it-works.html` — replaces broken `/how-it-works/`
- `C:\Users\Administrator\Downloads\mnemosynec-proofs.html` — replaces blank `/proofs/`

Both use the v2 design system (Inter + IBM Plex Mono + teal #4fc3d0 + amber accents + dark-first CSS variables + frosted-glass nav). Phase 2 established the v2 system on the homepage. Phase 5 extends those tokens to nav pages.

**Hugo project:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`
**Config:** `config-mnemosynec.toml`

**Nav pages status table:**
| Route | Content file | Layout | Status |
|---|---|---|---|
| /download/ | content-mnemosynec/download/_index.md | layouts/download/list.html | Old gold system — v2 tokens added in Task 3 |
| /proofs/ | content-mnemosynec/proofs/_index.md | PaperMod default (no custom layout) | REPLACE with new HTML — Task 2 |
| /diagnosis/ | content-mnemosynec/diagnosis/_index.md | PaperMod default | TODO flag for Founder |
| /constellation/ | content-mnemosynec/constellation/_index.md | PaperMod default | TODO flag for Founder |
| /about/ | content-mnemosynec/about/_index.md | PaperMod default | TODO flag for Founder |
| /tools/ | content-mnemosynec/tools/_index.md | PaperMod default | TODO flag for Founder |
| /live/SubstrateAwakens/ | content-mnemosynec/live/SubstrateAwakens/_index.md | PaperMod default | TODO flag for Founder |
| /bounties/ | content-mnemosynec/bounties/_index.md | layouts/bounties/bounties.html | TODO flag for Founder |
| /how-it-works/ | content-mnemosynec/how-it-works/_index.md | PaperMod default (no custom layout) | REPLACE with new HTML — Task 1 |

---

### Phase 5 · Task 1 — Port `mnemosynec-how-it-works.html` into Hugo at `/how-it-works/`

**Step 1a — Create layout file:**

Create: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\how-it-works\list.html`

Structure:
```
{{- define "main" }}
[Google Fonts link tags — see below]
[ENTIRE body content from mnemosynec-how-it-works.html — everything between <body> and </body>]
{{- end }}
```

Place these three font lines at the very top of the `define "main"` block, before any `<style>` tag:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300..700&display=swap" rel="stylesheet">
```

**Critical nav link updates in the pasted HTML:**
- `href="https://mnemosynec.org/#architecture"` → keep as-is (homepage anchor)
- `href="https://mnemosynec.org/#benchmarks"` → keep as-is (homepage anchor)
- `href="how-it-works"` → `href="/how-it-works/"` (fix relative to absolute)
- `href="proofs"` → `href="/proofs/"` (fix relative to absolute)
- `href="https://mnemosynec.org"` (Download button in nav) → `href="/download/"`
- `href="https://mnemosynec.org/how-to-read-the-substrate/"` → `href="/how-to-read-the-substrate/"`
- `href="https://mnemosynec.org/proofs/"` → `href="/proofs/"`
- Logo href `https://mnemosynec.org` → `href="/"`

**No Chart.js needed** — the how-it-works page's compounding chart is embedded inline SVG. No external JS dependency beyond theme toggle + chart-expand script already in the file.

**Step 1b — Update content file frontmatter:**

Replace frontmatter in `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\how-it-works\_index.md`:

```yaml
---
title: "How It Works — MnemosyneC"
description: "How We Make Sure Things Are True. Fast. Free. Three Layers: Reader, Verifier, Accumulator. The Substrate Compounding Chart. Knowledge Lifecycle. Frontier Mesh."
date: 2026-06-23
draft: false
layout: "list"
---
```

Leave existing markdown body as-is (custom layout takes over the `main` block entirely).

**Step 1c — Canonical content preserved on the page:**
- 4 KPI strip: $0 / 6%→78% / 16.6ms / 95%
- Three Layers accordion: 01 Reader (Gemma 4 12B · local · $0/call) / 02 Verifier (Shadow E-Giant · 3+ parallel) / 03 Accumulator (Eblet store · append-only JSONL · SHA256)
- Substrate Compounding Chart (inline SVG — self-contained, no external file needed)
- Knowledge Lifecycle flow: Pheromone → Socceri Triad → Living Connection → Stone Tablet
- Frontier Mesh 6-card grid: Not RAG / Third Option / Substrate Works Without MnemosyneC / Mesh Proof 20/20 / Vendor Resilience / Patent Pledge #2260
- Three Tiers section: FREE $0/call / FLAGSHIP / API SSPL
- Footer: liturgy, cooperative tag, "For Alford"

---

### Phase 5 · Task 2 — Port `mnemosynec-proofs.html` into Hugo at `/proofs/`

**Step 2a — Create layout file:**

Create: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\proofs\list.html`

Same pattern as Task 1: `{{- define "main" }}` ... `{{- end }}`
Place Google Fonts link tags at the top of the main block.

**Nav link fixes:**
- Logo href `https://mnemosynec.org` → `href="/"`
- `href="https://mnemosynec.org/#architecture"` → keep (homepage anchor)
- `href="how-it-works"` → `href="/how-it-works/"`
- `href="proofs"` → `href="/proofs/"`
- `href="https://mnemosynec.org"` (Download button) → `href="/download/"`
- `href="https://mnemosynec.org/how-it-works/"` → `href="/how-it-works/"`
- `href="https://mnemosynec.org/how-to-read-the-substrate/"` → `href="/how-to-read-the-substrate/"`
- `href="https://mnemosynec.org/proofs/"` (self-links) → `href="/proofs/"`
- `href="https://mnemosynec.org/license"` → `href="/license"` (or keep external if /license doesn't exist in Hugo)

**SVG clipPath id collision note:** The proofs page uses `id="plotClip2"`. The how-it-works page uses `id="plotClip"`. Different pages — no collision. No change needed.

**Step 2b — Update content file frontmatter:**

Replace frontmatter in `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\proofs\_index.md`:

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

**Step 2c — Canonical content preserved:**
- Hero: "We Don't Ask You to Trust Us. We Prove It." + hero-sub
- 4 Pinned Proof cards (2x2 grid): Mesh R10 20/20 / Knight Wave 2 Ride / Accuracy Lift 6→78% / BP063 vs BP087
- Inline SVG compounding chart (click-to-expand)
- Accuracy benchmark table: 7 models x cold/warm/lift/notes
- 6-step reproducible methodology (steps 01–06 with code snippets)
- Patent Pledge #2260 amber box
- Footer: liturgy, "For Alford"

---

### Phase 5 · Task 3 — Enumerate and refresh other nav pages (design tokens only)

Knight SHALL NOT rewrite content for these pages without Founder direction.

**For /download/ specifically:** At the top of `layouts/download/list.html`, after the existing comment block, add the v2 font import and CSS override:

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

**For /diagnosis/, /constellation/, /about/ — PaperMod pages:**

Read `layouts/partials/extend_head.html` FIRST (may already exist with content from BP084). Then APPEND only — do not overwrite:

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

**Pages flagged for Founder review (NOT refreshed in this paste):**
| Page | Status |
|---|---|
| /diagnosis/ | TODO — needs v2 content + layout |
| /constellation/ | TODO — needs v2 content + layout |
| /about/ | TODO — needs v2 content + layout |
| /tools/ | TODO — needs Founder direction |
| /live/SubstrateAwakens/ | TODO — needs Founder direction |
| /bounties/ | TODO — has custom layout, needs Founder direction |

---

### Phase 5 · Task 4 — Hugo build + Firebase deploy

```powershell
# Step 1: Hugo build — WAIT for full exit before continuing
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --config config-mnemosynec.toml --destination public-mnemosynec
# Expected: exit 0, "N pages" built, no ERROR lines

# Step 2: Verify output dirs exist before deploy — GATE
Test-Path "public-mnemosynec\how-it-works\index.html"
Test-Path "public-mnemosynec\proofs\index.html"
# Both must return True before proceeding

# Step 3: Firebase deploy — ONLY after both Test-Path = True
firebase deploy --only hosting:mnemosyne
# Wait for "Deploy complete!" before continuing
```

**Race condition guard:** If `Test-Path` returns False for either file, STOP. Do not deploy. Report which file is missing to Founder.

**Layout resolution chain:**
- `/how-it-works/` → Hugo looks for `layouts/how-it-works/list.html` FIRST
- `/proofs/` → Hugo looks for `layouts/proofs/list.html` FIRST

Creating `layouts/how-it-works/list.html` and `layouts/proofs/list.html` is the correct and sufficient approach.

---

### Phase 5 · Task 5 — Empirical Verification (12+ checks · Gate)

Run ALL of the following. Report PASS/FAIL for each:

```powershell
# HOW-IT-WORKS page
$r1 = Invoke-WebRequest -Uri "https://mnemosynec.org/how-it-works/" -UseBasicParsing
$r1.StatusCode                              # Expect: 200
$r1.Content -match "True\. Fast\. Free\."  # Expect: True
$r1.Content -match "Reader"                # Expect: True
$r1.Content -match "Verifier"              # Expect: True
$r1.Content -match "Accumulator"           # Expect: True
$r1.Content -match "Pheromone"             # Expect: True
$r1.Content -match "Stone Tablet"          # Expect: True
$r1.Content -match "4fc3d0"                # Expect: True (v2 teal token)
$r1.Content -match "IBM Plex Mono"         # Expect: True (v2 font)

# PROOFS page
$r2 = Invoke-WebRequest -Uri "https://mnemosynec.org/proofs/" -UseBasicParsing
$r2.StatusCode                             # Expect: 200
$r2.Content -match "Pinned Proof"          # Expect: True
$r2.Content -match "Mesh R10"              # Expect: True
$r2.Content -match "20 / 20 correct"       # Expect: True
$r2.Content -match "Patent Pledge"         # Expect: True
$r2.Content -match "4fc3d0"                # Expect: True (v2 teal)

# MIRROR CHECK — mnemosynec.ai
$r3 = Invoke-WebRequest -Uri "https://mnemosynec.ai/how-it-works/" -UseBasicParsing
$r3.StatusCode                             # Expect: 200
$r4 = Invoke-WebRequest -Uri "https://mnemosynec.ai/proofs/" -UseBasicParsing
$r4.StatusCode                             # Expect: 200

# DOWNLOAD page — confirm not broken
$r5 = Invoke-WebRequest -Uri "https://mnemosynec.org/download/" -UseBasicParsing
$r5.StatusCode                             # Expect: 200

# HOMEPAGE — confirm not broken by our changes
$r6 = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
$r6.StatusCode                             # Expect: 200
```

If any check fails: do NOT declare success. Report the exact failure line + status code to Founder.

---

### Phase 5 · §15 BLOOD Note

After Knight Yokes with verification results, Bishop re-gadgets independently:
- `curl -sI https://mnemosynec.org/how-it-works/` directly
- Grep body for "True. Fast. Free." and "4fc3d0" teal token
- Do NOT accept Knight's self-report as the only verification
- Knight false-negatives have occurred before (see BISHOP_EMPRESS_MIGRATIONS_RECEIPT_BP092.md)
- Empirical live-site state wins over Knight report

---

### Phase 5 · Yoke Sub-Receipt

```
PHASE 5 YOKE · KNIGHT · BP093

Files created:
  - layouts/how-it-works/list.html — [N] bytes
  - layouts/proofs/list.html — [N] bytes
  - content-mnemosynec/how-it-works/_index.md (frontmatter updated)
  - content-mnemosynec/proofs/_index.md (frontmatter updated)
  - layouts/partials/extend_head.html (v2 font tokens appended)
  - layouts/download/list.html (v2 token block prepended)

Hugo build:
  Exit code: [0/error]
  Pages built: [N]
  Warnings/errors: [none / list]

Test-Path before deploy:
  public-mnemosynec\how-it-works\index.html: [True/False]
  public-mnemosynec\proofs\index.html: [True/False]

Firebase deploy URL: [url]

Verification results:
  how-it-works/ 200: [PASS/FAIL]
  how-it-works/ "True. Fast. Free.": [PASS/FAIL]
  how-it-works/ Reader/Verifier/Accumulator: [PASS/FAIL]
  how-it-works/ Pheromone + Stone Tablet: [PASS/FAIL]
  how-it-works/ 4fc3d0 teal token: [PASS/FAIL]
  how-it-works/ IBM Plex Mono: [PASS/FAIL]
  proofs/ 200: [PASS/FAIL]
  proofs/ Pinned Proof: [PASS/FAIL]
  proofs/ Mesh R10 + 20/20: [PASS/FAIL]
  proofs/ Patent Pledge: [PASS/FAIL]
  mnemosynec.ai/how-it-works/ 200: [PASS/FAIL]
  mnemosynec.ai/proofs/ 200: [PASS/FAIL]
  download/ 200: [PASS/FAIL]
  homepage/ 200: [PASS/FAIL]

Pages NOT refreshed (TODO for Founder):
  /diagnosis/ /constellation/ /about/ /tools/ /live/SubstrateAwakens/ /bounties/

ELECTRON_TOUCHED: NO
```

---

## UNIFIED YOKE RETURN FORMAT

After ALL 5 phases complete, Knight sends ONE consolidated Yoke Return message to Bishop at BISHOP_DROPZONE:

```
MARATHON YOKE RETURN · KNIGHT · BP093 · UNIFIED 5-PHASE

MODEL CONFIRMED: claude-sonnet-4-6

================================================================================
PHASE 1 — v0.7.1 Deploy Fix + Gold Banner
================================================================================
Status: [COMPLETE / HARD STOP — reason]
Curl exits:
  Check 1 (download page live): [PASS/FAIL]
  Check 2 (no 0.5.18): [PASS/FAIL]
  Check 3 (.exe HTTP 200): [PASS/FAIL]
  Check 4 (Substrate Replaces): [PASS/FAIL]
Firebase URL: [url]
ELECTRON_TOUCHED: NO

================================================================================
PHASE 2 — v2 Design Refresh + Chart
================================================================================
Status: [COMPLETE / STOPPED — reason]
Curl exits:
  Check 1 (homepage + headline): [PASS/FAIL]
  Check 2 (download + v0.7.1): [PASS/FAIL]
  Check 3 (chart SVG 200): [PASS/FAIL]
  Check 4 (Substrate Replaces): [PASS/FAIL]
  Check 5 (compounding embed): [PASS/FAIL]
New chart URL: https://mnemosynec.org/charts/substrate-compounding-chart.svg
Design tokens propagated: [YES/NO]
ELECTRON_TOUCHED: NO

================================================================================
PHASE 3 — Peer-Side Plow + Minor Council
================================================================================
Status: [COMPLETE / PARTIAL — 2Q smoke only / WIRING_FAILED — reason]
TypeScript file modified: [absolute path]
2Q smoke session_id: [SMOKE_2Q_BP093_...]
iterations_run per Q per peer: [table or list]
council_votes populated: [YES/NO]
2Q smoke gate: [PASS / FAIL]
42Q THUNDERCLAP receipt path: [absolute path / SKIPPED — smoke failed]
Final accuracy: [N/42 / SKIPPED]
Median Plow iteration count: [N / SKIPPED]
Three Fates concordance: CONCORDANT [N] / PARTIAL [N] / DISCORDANT [N] / SKIPPED
ELECTRON_TOUCHED: YES

================================================================================
PHASE 4 — Substrate Bridge + THIRD Plow
================================================================================
Status: [COMPLETE / QUEUED — M0 busy / PARTIAL — Tasks 1-3 done, Task 4 queued]
Bridge script: C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js
TIC files written: [count]
Sample verify: [PASS / FAIL — details]
MANIFEST sha256 of input: [hash]
THIRD Plow start: [HH:MM UTC]
THIRD Plow end: [HH:MM UTC / QUEUED]
Compounding report: [absolute path / PENDING Task 4]
Spider hit delta: [+N (First: 0, Third: N) / PENDING]
BMV delta: [+N (First avg: 31.7, Third avg: N) / PENDING]
Concordance delta: [CONCORDANT N->N / PENDING]
ELECTRON_TOUCHED: NO

================================================================================
PHASE 5 — Nav Pages Refresh
================================================================================
Status: [COMPLETE / STOPPED — reason]
how-it-works URL: https://mnemosynec.org/how-it-works/
proofs URL: https://mnemosynec.org/proofs/
Nav pages refreshed: how-it-works / proofs / download (v2 tokens) / extend_head (fonts)
Nav pages NOT refreshed (TODO): /diagnosis/ /constellation/ /about/ /tools/ /live/ /bounties/
All 14 curl checks: [PASS / list of failures]
ELECTRON_TOUCHED: NO

================================================================================
TOTALS
================================================================================
ELECTRON_TOUCHED per phase: [NO / NO / YES / NO / NO]
Total files modified: [N]
Total Knight session token usage: [N tokens if visible]
Wall-clock total: [HH:MM]
```

---

## BISHOP NEXT-TURN ACTIONS (After Unified Yoke Lands)

1. **Re-gadget all curl URLs from Phases 1 + 2 + 5 independently** via shell:
   - `curl -s https://mnemosynec.org/ | Select-String 'Substrate Replaces New Data Centers'`
   - `curl -s https://mnemosynec.org/ | Select-String 'has the Cure'`
   - `curl -sI https://mnemosynec.org/how-it-works/` — expect 200
   - `curl -sI https://mnemosynec.org/proofs/` — expect 200
   - `curl -sI https://mnemosynec.org/charts/substrate-compounding-chart.svg` — expect 200

2. **psql gadget 2Q smoke + 42Q THUNDERCLAP receipts** (§15 BLOOD, independent of Knight self-report):
   ```sql
   SELECT route_id, answer_json->>'iterations_run' AS iters,
          answer_json->'council_votes_per_iteration' AS council, processing_ms
     FROM relay_route_replies
     WHERE route_id IN (
       SELECT id FROM relay_routes
       WHERE session_id LIKE '%SMOKE_2Q_BP093%'
       ORDER BY created_at DESC LIMIT 10
     );
   ```

3. **Read FIRST / SECOND / THIRD Plow JSONL for BMV deltas:**
   - FIRST: `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\FIRST_PLOW_42Q_BP093\`
   - THIRD: `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\`
   - Extract per-Q BMV scores, compute delta distribution

4. **Mint canon eblet:**
   - Title: `canon_bp093_overnight_marathon_completion_receipt`
   - Path: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_bp093_overnight_marathon_completion_receipt.eblet.md`
   - Content: Phase results summary, all curl pass/fail, 42Q THUNDERCLAP final accuracy, BMV delta, Plow wiring status (batcheck → real swing confirmation or pending)

---

*BP093 KNIGHT MARATHON BUNDLE · UNIFIED 5-PHASE · Sonnet 4.6 · SEG-AD · 2026-06-23*
*Composed from: SEG-V (Phase 1) · SEG-Y (Phase 2) · SEG-AD inline (Phase 3) · SEG-AB (Phase 4) · SEG-AC (Phase 5)*
*Dropzone: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_BUNDLE_BP093_OVERNIGHT.md`*
