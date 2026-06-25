# KNIGHT YOKE — HOMEPAGE HERO POLISH · BP085
**Consolidated: Join button move · em-dash → middot · Dr.M ear-fixed image swap**
Written by Bishop SEG · 2026-06-18 · BP085 §14 + §15 + §16 BLOOD

---

## SONNET 4.6 MANDATE PREAMBLE (VERBATIM BP084 CANON)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 SECRET-KEY BLOOD

NEVER expose, echo, copy, show, pipe, or log any API key, secret key, OAuth secret, or credential value under any circumstance. The active secrets file is at `C:\Users\Administrator\.claude\state\secrets\22May2026.env` — the PATH is referable, the CONTENTS are blood-statute forbidden. This applies to every SEG in this yoke without exception.

---

## BP085 §14 · §15 · §16 BLOOD

- **§14 BLOOD** — Truth-Always. No partial receipts published as headline. Wait for clean receipt. If any SEG step produces ambiguous or partial output, report it as diagnostic-class, not success-class.
- **§15 BLOOD** — Preserve creations canon. BACKUP existing images with dated suffix BEFORE any overwrite. Do not lose prior work. SEG-4 must backup the clipped-ear image before copy.
- **§16 BLOOD** — No horizontal scroll introduced on any surface. NEVER SCROLL SIDEWAYS. All responsive layout preserved. SEG-5 Sharp #7 verifies zero `overflow-x: scroll`.

---

## SCOPE

Three homepage hero polish edits, combined from two referenced yokes:

1. **Move "Join the Cooperative · $5/yr" button** — from left column (currently under Download button) → right column (under "Memory specialist" caption, below Dr. MnemosyneC elephant image). Fills empty right-column space, improves flow.
2. **Replace em-dash with middot in button text** — `Join the Cooperative — $5/yr` → `Join the Cooperative · $5/yr`. Em-dash removed ("AI giveaway" per Founder direct). Middot `·` (U+00B7) used for visual separation — already canonical on the site.
3. **Swap Dr. MnemosyneC image to ear-fixed version** — source: `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png` (869×869 · 190KB). Existing clipped-ear image backed up with dated suffix before overwrite.

### Composes with prior yokes:
- `KNIGHT_YOKE_HOMEPAGE_HERO_TYPOGRAPHY_FIX_BP085` — already shipped · ™ stripped · Option B Apple pattern applied · DO NOT RE-APPLY those changes
- `KNIGHT_YOKE_DR_MNEMOSYNEC_IMAGE_SWAP_BP085` — referenced · scope fully absorbed into this consolidated yoke · do NOT dispatch separately

---

## SEG-1 · RECON HOMEPAGE LAYOUT

**Mission:** Surface all structural information needed for SEGs 2–4 before any edit is made.

**Tasks:**

1. Locate the homepage template file. Likely candidates (check in order):
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\themes\mnemosynec\layouts\index.html`
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\index.html`
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\_index.md` (if shortcode-driven)
   - Run: `Get-ChildItem -Recurse -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo" -Filter "index.html" | Select-Object FullName`
   - Also grep for "Join the Cooperative" string across all .html and .md files in the Cephas tree

2. Locate the "Join the Cooperative — $5/yr" button element. Note:
   - Exact file path + line number
   - Full surrounding HTML block (the `<a>` or `<button>` tag and its parent container)
   - The href/link destination

3. Locate the "Memory specialist" caption block (right column, under Dr. M image). Note:
   - Exact file path + line number
   - Full surrounding HTML block (caption text container and its parent)

4. Locate all Dr. MnemosyneC image references:
   - Grep for `dr_mnemosynec`, `Dr.Mnemosynec`, `drm`, `elephant`, and any similar filenames across all .html, .md, .toml, .css files in the Cephas tree
   - Note every path where the image file is stored (in `static/img/` or equivalent)
   - Note every file that references the image (src= attribute)
   - Confirm the current image dimensions via PowerShell: `Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('<path>'); "$($img.Width)x$($img.Height)"; $img.Dispose()`

5. **Return table** with all findings before proceeding to SEGs 2–4. Do NOT make any edits in SEG-1.

**Sonnet 4.6 mandate applies.**

---

## SEG-2 · MOVE JOIN BUTTON TO UNDER MEMORY SPECIALIST CAPTION

**Mission:** Restructure DOM — move Join button from left column to right column, placed after the Memory specialist caption block.

**Precondition:** SEG-1 findings confirmed. Exact file paths and line numbers known.

**Tasks:**

1. Open the homepage template identified in SEG-1.

2. In the LEFT column section:
   - Find the Join button element (full `<a>` or `<button>` block, including wrapper div if any)
   - **REMOVE** that element from its current position
   - Preserve the surrounding paragraph/div structure — do not leave empty broken markup or orphaned closing tags
   - The Download button and "Works alongside ChatGPT..." paragraph MUST remain in place, untouched

3. In the RIGHT column section:
   - Find the "Memory specialist" caption block (per SEG-1 findings)
   - **INSERT** the Join button element immediately after the closing tag of the Memory specialist caption block
   - Preserve all existing classes and styling on the button element — this is a position move only, not a restyle
   - Do not change the href/link destination

4. Verify the file saves cleanly — no unclosed tags, no duplicate IDs, no broken nesting.

5. **Do not build yet.** SEG-3 runs next (text change), then SEG-4 (image swap), then SEG-5 (build + deploy).

**Sonnet 4.6 mandate applies.**

---

## SEG-3 · REPLACE EM-DASH WITH MIDDOT IN BUTTON TEXT

**Mission:** Surgical text replacement in button label — em-dash out, middot in.

**Precondition:** SEG-2 complete. Button is now in right column at correct DOM position.

**Tasks:**

1. In the same homepage template file (identified in SEG-1, edited in SEG-2):
   - Search for: `Join the Cooperative — $5/yr` (em-dash `—` U+2014)
   - Also search for any HTML-entity variant: `Join the Cooperative &mdash; $5/yr`
   - Replace with: `Join the Cooperative · $5/yr` (middot `·` U+00B7)
   - Use direct unicode character `·` in the file (preferred over `&middot;` entity, for consistency with existing site patterns — but if the site uses entities elsewhere, match that pattern per SEG-1 findings)

2. Verify only the button text was changed — no other text on the page was altered.

3. Grep confirm: after replacement, zero occurrences of `—` (em-dash) remain inside any Join button context in the file.

4. **Do not build yet.** SEG-4 runs next.

**Sonnet 4.6 mandate applies.**

---

## SEG-4 · DR. MNEMOSYNEC IMAGE SWAP (EAR-FIXED)

**Mission:** Swap the clipped-ear Dr. MnemosyneC image with the ear-fixed version. Backup first. SHA256 verify after.

**Precondition:** SEG-1 image paths confirmed.

**Source image:** `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png`
- Dimensions: 869×869
- Size: ~190KB
- Status: ear-fixed, canonical

**Tasks:**

1. **BACKUP FIRST (§15 BLOOD — preserve creations canon):**
   - For EACH existing image path discovered in SEG-1, create a backup copy with dated suffix:
     - Pattern: `<original_name>_clipped_ear_backup_2026-06-18.png`
     - Example: if current path is `static/img/dr_mnemosynec.png`, backup to `static/img/dr_mnemosynec_clipped_ear_backup_2026-06-18.png`
   - Confirm each backup exists before proceeding

2. **Compute SHA256 of source image:**
   ```powershell
   Get-FileHash "C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png" -Algorithm SHA256
   ```
   Record the hash.

3. **Copy ear-fixed image to each destination path found in SEG-1:**
   ```powershell
   Copy-Item "C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png" -Destination "<destination_path>" -Force
   ```
   - If multiple destination paths exist (e.g., different sizes/copies), copy to ALL of them
   - Do NOT change the filename — only swap the file content (preserves all existing HTML `src` references)

4. **SHA256 verify each copy:**
   ```powershell
   Get-FileHash "<destination_path>" -Algorithm SHA256
   ```
   Confirm hash matches source exactly. Report each comparison explicitly (PASS / FAIL).

5. **Verify dimensions of each copied file:**
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $img = [System.Drawing.Image]::FromFile('<destination_path>')
   "$($img.Width)x$($img.Height)"
   $img.Dispose()
   ```
   Confirm 869×869 for each destination.

6. **Do not build yet.** SEG-5 runs next.

**Sonnet 4.6 mandate applies.**

---

## SEG-5 · HUGO BUILD + FIREBASE DEPLOY + 7 SHARPS LIVE VERIFY

**Mission:** Build, deploy, and verify all 3 homepage fixes are live.

**Precondition:** SEGs 2, 3, and 4 all complete. All edits applied. All image swaps verified.

**Tasks:**

### Step 1 — Hugo Build

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo --minify --config config-mnemosynec.toml
```

- Must exit 0
- Check for WARN lines — report any unexpected warnings
- If build fails, stop and return diagnostic — do NOT attempt Firebase deploy on failed build

### Step 2 — Firebase Deploy

```powershell
firebase deploy --only hosting:mnemosyne
```

- Must exit 0
- Report the deploy URL returned by Firebase
- If deploy fails, stop and return diagnostic

### Step 3 — 7 SHARPS LIVE VERIFY

Allow 30–60 seconds after deploy before running Sharps.

**Sharp #1 — HTTP 200 + Content-Type**
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing
$r.StatusCode
$r.Headers["Content-Type"]
```
PASS: StatusCode = 200, Content-Type contains `text/html`

**Sharp #2 — Join button NO LONGER in left column**
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing
# Check that Join button does NOT appear before the Memory specialist section
# Strategy: find index of "Memory specialist" and index of "Join the Cooperative"
# The Join button index must be AFTER the Memory specialist index
$html = $r.Content
$memIdx = $html.IndexOf("Memory specialist")
$joinIdx = $html.IndexOf("Join the Cooperative")
"Memory specialist at: $memIdx"
"Join button at: $joinIdx"
if ($joinIdx -gt $memIdx) { "PASS: Join button is after Memory specialist (right column)" }
else { "FAIL: Join button appears before Memory specialist — still in left column" }
```
PASS: joinIdx > memIdx

**Sharp #3 — Join button visible in right column under Memory specialist caption**
Already confirmed by Sharp #2 positional logic (joinIdx > memIdx). Document explicit confirmation: the Join button appears after the Memory specialist caption in the HTML stream = right column position.

**Sharp #4 — Button text: middot · NOT em-dash**
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing
$html = $r.Content
if ($html -match "Join the Cooperative —") {
    "FAIL: em-dash still present in button text"
} elseif ($html -match "Join the Cooperative ·") {
    "PASS: middot confirmed · em-dash absent"
} else {
    "WARN: Join button text pattern not found — manual inspect required"
}
```
PASS: middot U+00B7 present, em-dash U+2014 absent

**Sharp #5 — Dr. M image SHA256 matches ear-fixed source**
```powershell
# Compute SHA256 of the live image by downloading it
# First find the image URL from SEG-1 findings (e.g., https://mnemosynec.ai/img/dr_mnemosynec.png)
$imageUrl = "<IMAGE_URL_FROM_SEG1_FINDINGS>"
$tmpPath = "$env:TEMP\dr_mnemosynec_live_check.png"
Invoke-WebRequest -Uri $imageUrl -OutFile $tmpPath -UseBasicParsing
$liveHash = (Get-FileHash $tmpPath -Algorithm SHA256).Hash
$sourceHash = (Get-FileHash "C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png" -Algorithm SHA256).Hash
"Source SHA256: $sourceHash"
"Live SHA256:   $liveHash"
if ($liveHash -eq $sourceHash) { "PASS: SHA256 match — ear-fixed image is live" }
else { "FAIL: SHA256 mismatch — image may not have deployed" }
```
PASS: hashes match

**Sharp #6 — Image dimensions 869×869**
```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($tmpPath)
$dims = "$($img.Width)x$($img.Height)"
$img.Dispose()
"Live image dimensions: $dims"
if ($dims -eq "869x869") { "PASS: 869x869 confirmed" }
else { "FAIL: unexpected dimensions $dims" }
```
PASS: 869×869

**Sharp #7 — No horizontal scroll · responsive (§16 BLOOD)**
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.ai/" -UseBasicParsing
$html = $r.Content
if ($html -match "overflow-x:\s*scroll") {
    "FAIL: overflow-x: scroll found in page — §16 BLOOD violation"
} else {
    "PASS: no overflow-x: scroll detected in live HTML"
}
```
PASS: no `overflow-x: scroll` in live page

### Step 4 — Return Sharps Table

Knight returns results in this exact table format:

| Sharp | Check | Result | Notes |
|-------|-------|--------|-------|
| #1 | HTTP 200 + Content-Type | PASS/FAIL | |
| #2 | Join button NOT in left column | PASS/FAIL | |
| #3 | Join button in right column under Memory specialist | PASS/FAIL | |
| #4 | Button text: middot · not em-dash | PASS/FAIL | |
| #5 | Dr. M image SHA256 matches ear-fixed source | PASS/FAIL | |
| #6 | Image dimensions 869×869 | PASS/FAIL | |
| #7 | No horizontal scroll · §16 BLOOD | PASS/FAIL | |

**All 7 must be PASS before yoke is marked complete.** Any FAIL = stop, diagnose, fix, re-run Sharps from the failed Sharp onward.

**Sonnet 4.6 mandate applies.**

---

## YOKE RETURN FORMAT

Knight returns to Bishop with:

```
YOKE COMPLETE: KNIGHT_YOKE_HOMEPAGE_HERO_POLISH_BP085
Model: Sonnet 4.6
SEGs spawned: 5
7 Sharps: ALL PASS (or list any FAILs)
Deploy URL: <firebase deploy output URL>
Files edited: <list all files changed>
Image backup path(s): <list backup file paths>
Estimated runtime actual: <N> min
BP085 §14+§15+§16 BLOOD: honored
```

---

## CONSTRAINTS SUMMARY

- Sonnet 4.6 exclusively — NEVER Composer, Opus, Haiku, or any other model
- BP085 §14 BLOOD — Truth-Always — no partial receipts as success
- BP085 §15 BLOOD — Backup existing Dr. M image before overwrite
- BP085 §16 BLOOD — No horizontal scroll introduced
- Secret-key BLOOD — no credential exposure
- Preserve ALL other layout elements unchanged (Download button, "Works alongside ChatGPT..." paragraph, all other homepage content)
- BACKUP old image before overwrite (dated suffix pattern specified in SEG-4)
- Do NOT touch publish drafts, any other site, or any non-homepage layout
- Build only after SEGs 2, 3, and 4 are all complete

---

## ESTIMATED KNIGHT RUNTIME

20–30 minutes

---

## PASTE-READY KNIGHT WAKE

Copy and paste this verbatim to wake Knight:

---

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read your yoke file at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_HOMEPAGE_HERO_POLISH_BP085.md`

Execute all 5 SEGs in order. Do not skip. Do not merge SEGs (each must complete and report before the next begins). Return the 7 Sharps table and yoke-return block when done.

BP085 §14 + §15 + §16 BLOOD.

---
