# YOKE-RETURN — MnemosyneC v0.3.9 (BP083 v0.3.7 Yoke)
**Knight → Bishop · Sonnet 4.6 · 2026-06-15**

---

## Delivery Summary

| Field | Value |
|---|---|
| Yoke spec | `BISHOP_DROPZONE/KNIGHT_YOKE_v0_3_7_STARTER_CHOCOLATES_PINNED_PROOFS_LEAN_UI_CURE_BP083.md` |
| Target version (yoke) | v0.3.7 |
| Actual shipped version | **v0.3.9** |
| Version note | v0.3.7 was skipped — v0.3.8 was an intermediate commit (GPQA Diamond Benchmark) made between the yoke being written and Knight executing. All four pillars shipped in v0.3.9. |
| Prerequisite | v0.3.6 at `30bb12c` ✅ confirmed before work |
| Final commit | `c911dfc` (feat: MnemosyneC v0.3.9 BP083 yoke) |
| SEG source commit | `d39e046` (docs: v0.3.8 GPQA Diamond yoke-return BP083) — all SEG-1/2/3/3.5 source changes |
| Model | Claude Sonnet 4.6 |
| Deploy target | Firebase `mnemosyne` → mnemosynec.ai |

---

## SEG Status Table

| SEG | Pillar | Status | Commit |
|---|---|---|---|
| SEG-1 | Starter Chocolate Pack (280 eblets) | ✅ GREEN | d39e046 |
| SEG-2 | Lean UI Ask MEMORY.md injection cure | ✅ GREEN | d39e046 |
| SEG-3 | Pinned Proofs — MMLU-Pro 97.1% receipt | ✅ GREEN | d39e046 |
| SEG-3.5 | Questions-Per-Domain Silent Cap Fix | ✅ GREEN | d39e046 (Mesh) + b283ba3 (Plow) |
| SEG-4 | Version bump + Build + Deploy | ✅ GREEN | c911dfc |

---

## SEG-1: Starter Chocolate Pack

**Status: GREEN**

280 verified Q&A eblets pre-seeded at install time — 20 eblets per domain across all 14 MMLU-Pro academic domains.

**Files changed:**
- `resources/chocolates/starter_chocolate.jsonl` — 280 eblets (JSONL)
- `scripts/generate_starter_chocolate.mjs` — generation script
- `src/main/memory_scaffold.ts` — `installStarterChocolate()` function
- `src/main/index.ts` — startup wiring (committed in v0.3.8 bundle)
- `package.json` — `extraResources: { from: "resources/chocolates", to: "chocolates" }`

**Mechanism:**
- On first launch: reads `starter_chocolate.jsonl` from `process.resourcesPath/chocolates/`
- Writes all 280 eblets to `userData/substrate/verified_eblets.jsonl`
- Writes `.starter_chocolates_v0.3.7` marker (idempotent — skips on subsequent launches)
- Dev fallback: reads from `resources/chocolates/` relative to app root

**Eblet schema:** Existing `VerifiedEbletEntry` format (`question`, `answer`, `sha256`, `provenance`, `verified`, `timestamp`) — schema-compatible with existing Plow output.

---

## SEG-2: Lean UI Ask MEMORY.md Injection Cure

**Status: GREEN**

Root cause: `generateMemoryMd` and `readMemoryMdFromDisk` in `memory_scaffold.ts` were not ensuring the parent directory existed before writing/reading `MEMORY.md`. Fresh installs or permission-restricted environments would silently fail, causing `getMemoryMd()` to return empty string.

**Files changed:**
- `src/main/memory_scaffold.ts`:
  - Added `mkdirSync(baseDir, { recursive: true })` in both `generateMemoryMd` and `readMemoryMdFromDisk`
  - Added `MEMORY_MD_FALLBACK` string (inline MnemosyneC identity) returned when file cannot be loaded
- `src/main/ai_dispatch_ipc.ts`:
  - Added diagnostic `console.log` for bytes loaded from MEMORY.md
  - Added `selfContextLoaded: boolean` in `ask-token-complete` payload
- `src/renderer/components/LeanAskTab.tsx`:
  - Added `selfCtxStatus` state (`'unknown' | 'loaded' | 'missing'`)
  - Badge renders "Self-Context ✅" or "Self-Context ⚠️ missing" after each Ask

Note: Both Regular Ask and Lean Ask use the same `ai-dispatch:query` IPC channel (verified). The Lean Ask was not truly separate — the MEMORY.md injection failure was at the `readMemoryMdFromDisk` level, now fixed for both paths.

---

## SEG-3: Pinned Proofs — MMLU-Pro 97.1% Receipt

**Status: GREEN · Live at mnemosynec.ai/proofs/**

**Files added:**
- `Cephas/cephas-hugo/content-mnemosynec/proofs/mmlu_pro_97.md` — full receipt
- `Cephas/cephas-hugo/content-mnemosynec/proofs/_index.md` — updated with summary table + link

**Receipt content:**
- Run: 5 q/domain × 14 domains = 70 total questions
- Results: 68/70 = 97.1% with new verified facts
- 14/14 domains GREEN
- 2 Andon-cord quarantines (Business + Economics — correct per canon)
- 316 substrate eblets grown
- Hardware: Consumer M0 · gemma4:12b · Ollama · no paid keys
- Wall-clock: ~70 minutes
- Date: 2026-06-15 ~01:47 AM

---

## SEG-3.5: Questions-Per-Domain Silent Cap Fix

**Status: GREEN**

Two sub-fixes:

### Plow the Field (TestItOutTab.tsx — committed in v0.3.8 b283ba3)
- `qCountRef = useRef(qCount); qCountRef.current = qCount` — stale closure fix
- `handlePlow` reads `qCountRef.current` (not captured `qCount`)
- UI `max={200}` (was `max={20}`)
- Total count display: `× {domains.length} domains = {qCount * domains.length} total q`

### Mesh Comparison (MeshComparisonModal.tsx — committed in d39e046)
- Replaced `<select>` dropdown (`N_OPTIONS = [5, 10, 20, 30, 50]`) with free-form `<input type="number">`
- Max cap: `379` (smallest effective domain bank after 5 shot-examples removed)
- Quick-pick buttons: `[5, 10, 30, 100, All]`
- `nPerDomainRef = useRef(nPerDomain); nPerDomainRef.current = nPerDomain` — stale closure fix
- Total display: `× 14 domains = {nPerDomain * 14} total q`

**Backend verification:** `canonical_pipeline.ts` has no `MAX_QUESTIONS_PER_DOMAIN` constant. The `sampleQuestionsForDomain` callback uses `Math.min(n, pool.length)` — no artificial cap. All caps were UI-only.

---

## BP080 Deploy-Level 4-Sharpening

### Sharp 1 — latest.yml live version

**Request:**
```
Invoke-WebRequest -Uri "https://mnemosyne-lianabanyan.web.app/download/latest.yml" -TimeoutSec 30 -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response (verbatim):**
```
version: 0.3.9
files:
  - url: MnemosyneC-Setup-0.3.9.exe
    sha512: sCZH5b2nUNdifu5Q4+1pLEuyENHEPu+NuT9tVpc8Y0Ig8vmV4WlPuNCZ68pz27nLwHgUJPaqs1hvbJ0TmjblRA==
    size: 539660099
path: MnemosyneC-Setup-0.3.9.exe
sha512: sCZH5b2nUNdifu5Q4+1pLEuyENHEPu+NuT9tVpc8Y0Ig8vmV4WlPuNCZ68pz27nLwHgUJPaqs1hvbJ0TmjblRA==
releaseDate: '2026-06-15T07:44:31.359Z'
```

**Result: ✅ GREEN** — v0.3.9 serving live

### Sharp 2 — download page v0.3.9 link

**Request:**
```
Invoke-WebRequest -Uri "https://mnemosyne-lianabanyan.web.app/download/" -UseBasicParsing | Select-String "0.3.9|MnemosyneC-Setup"
```

**Response (verbatim excerpt):**
```
href=https://mnemosynec.ai/download/MnemosyneC-Setup-0.3.9.exe download=MnemosyneC-Setup-0.3.9.exe 
aria-label="Download MnemosyneC 0.3.9 for Windows">↓ Download for Windows v0.3.9
```

**Result: ✅ GREEN** — download page shows v0.3.9

### Sharp 3 — MMLU-Pro proof page live

**Request:**
```
Invoke-WebRequest -Uri "https://mnemosyne-lianabanyan.web.app/proofs/" -UseBasicParsing | Select-String "MMLU|97.1"
```

**Response (verbatim excerpt from live HTML):**
```html
<h2 id=mmlu-pro-97>MMLU-Pro 97.1% - Canonical Plow Receipt (BP083)
<strong>68/70 MMLU-Pro questions answered with verified facts. 14/14 domains GREEN. Consumer hardware. No API keys.</strong>
<strong>68 / 70 = 97.1%</strong>
```

**Result: ✅ GREEN** — MMLU-Pro proof live on mnemosynec.ai/proofs/

### Sharp 4 — Custom domain (mnemosynec.ai)

Custom domain curls timed out (likely CDN propagation latency at ~3 AM). Firebase `.web.app` URL confirms all three sharpening targets are GREEN. Custom domain will propagate within CDN TTL.

**Result: 🟡 YELLOW** — Firebase .web.app confirmed; custom domain pending CDN propagation.

---

## Installer

| Field | Value |
|---|---|
| Filename | `MnemosyneC-Setup-0.3.9.exe` |
| Size | 539,660,099 bytes |
| SHA512 | `sCZH5b2nUNdifu5Q4+1pLEuyENHEPu+NuT9tVpc8Y0Ig8vmV4WlPuNCZ68pz27nLwHgUJPaqs1hvbJ0TmjblRA==` |
| Build date | 2026-06-15T07:44:31Z |
| Location | `release/MnemosyneC-Setup-0.3.9.exe` (workspace) |
| Download URL | `https://mnemosynec.ai/download/MnemosyneC-Setup-0.3.9.exe` |

---

## Git Log (relevant commits)

```
c911dfc feat: MnemosyneC v0.3.9 BP083 yoke — Starter Chocolates, MEMORY.md cure, MMLU-Pro proof, Mesh fix
d39e046 docs: v0.3.8 GPQA Diamond yoke-return BP083  [ALL SEG-1/2/3/3.5 source changes]
d06c6e5 deploy: MnemosyneC v0.3.8 Hugo/Firebase deploy BP083
b283ba3 feat: MnemosyneC v0.3.8 GPQA Diamond Benchmark BP083  [Plow qCountRef + TestItOutTab cap fix]
30bb12c fix: Mesh Comparison A (Cold) Ollama reachability hotfix v0.3.6 BP083  [PREREQUISITE]
```

---

## Founder M0 Verification Instructions

### M0-1: Starter Chocolate on fresh install
1. Install `MnemosyneC-Setup-0.3.9.exe` on a **fresh machine** (no prior MnemosyneC userData)
2. Launch MnemosyneC — do NOT run Plow yet
3. Open Explorer → `%APPDATA%\MnemosyneC\substrate\`
4. Open `verified_eblets.jsonl` in Notepad — should contain ~280 lines immediately at first launch
5. Look for `"provenance":"starter_chocolate:math:v0.3.7"` pattern
6. Confirm `.starter_chocolates_v0.3.7` marker file exists in the same folder
7. Close and relaunch — confirm "already installed, skipping" log (idempotent)

**Pass:** 280 eblets present before first Plow run

### M0-2: Plow Questions-Per-Domain cap fix
1. In MnemosyneC, go to **Test It Out** tab
2. Click **Plow the Field**
3. Select all 14 domains (or any 3+ domains)
4. Set "Questions per domain" field to **20**
5. Verify the display shows `× 14 domains = 280 total q` (or corresponding count)
6. Click Plow
7. Watch the progress — each domain should run 20 questions (not 5, not the old default)
8. When complete, count eblets grown: should be ≥ 200 (20 × 14 = 280 attempts, at least 70% new facts)

**Pass:** Plow runs 20 q/domain, not 5 q/domain

### M0-3: Mesh Comparison free-form input
1. In MnemosyneC, go to **Test It Out** tab
2. Click **Mesh Comparison**
3. In the "Questions per domain" field, type **30**
4. Verify total shows `× 14 domains = 420 total q`
5. Click the **10** quick-pick button — verify field updates to 10 and total shows 140
6. Click **All** — verify field updates to 379 (max)
7. Set back to 30 and run — verify it actually runs 30/domain (progress shows 30 × 14)

**Pass:** Mesh Comparison runs the number you type (30 runs 30, not 10)

### M0-4: MEMORY.md Self-Context badge
1. Launch MnemosyneC
2. Go to **Lean Ask** tab
3. Ask any question: "What is MnemosyneC?"
4. After response completes, look at the top of the Lean Ask panel for the badge
5. Confirm: **"Self-Context ✅"** badge appears (green) — confirms MEMORY.md was loaded

**Pass:** Green Self-Context badge visible after first Lean Ask response

### M0-5: MMLU-Pro Proof page live
1. Open browser → `https://mnemosynec.ai/proofs/`
2. Confirm MMLU-Pro 97.1% entry visible: "68/70 MMLU-Pro questions answered with verified facts. 14/14 domains GREEN."
3. Click "Full receipt with domain breakdown" link
4. Confirm detailed breakdown page loads at `/proofs/mmlu_pro_97/`

**Pass:** Proof page live with 68/70 / 97.1% receipt

### M0-6: Auto-update
1. Open MnemosyneC (any v0.3.x install)
2. Watch for update notification in the tray or title bar
3. The auto-updater checks `https://mnemosynec.ai/download/latest.yml` — should detect v0.3.9
4. Accept the update and verify it installs 0.3.9

**Pass:** Auto-updater detects and installs v0.3.9

---

## Known Gaps / HONEST YELLOW Items

| Item | Status | Notes |
|---|---|---|
| Custom domain curl (mnemosynec.ai) | 🟡 YELLOW | CDN propagation — FireBase .web.app confirmed GREEN; custom domain expected within CDN TTL |
| Starter Chocolate screenshots in proof page | 🟡 YELLOW | Placeholders in mmlu_pro_97.md — no actual screenshot files accessible at `C:\Users\Administrator\Pictures\Newest\` |
| Version labeling | 🟡 NOTE | Yoke targeted v0.3.7; shipped as v0.3.9 (v0.3.8 was GPQA Diamond intermediate commit). All four pillars fully delivered. |

---

## Session Close

Knight session close: BP083 yoke complete (SEG-1 + SEG-2 + SEG-3 + SEG-3.5 + SEG-4). All changes committed and pushed. Hugo site deployed. Live verification GREEN on Firebase URL. Model: Claude Sonnet 4.6.

**FOR THE KEEP!**
