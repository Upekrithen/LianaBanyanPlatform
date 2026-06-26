<!-- bishop-yoke-task 2026-06-26T04:45:00Z -->

## BISHOP -> KNIGHT - FIREBASE ROLLBACK + M05/M06 REAPPLY - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP096_M10_FIREBASE_ROLLBACK_REAPPLY_2026-06-26T04:45Z**

> **STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Roll back Firebase Hosting site `mnemosyne-lianabanyan` (target `mnemosyne`) to the live channel's last known-good release (closest to 2026-06-25T22:50Z, which is the state before M07/M08/M09 restore attempts), then surgically reapply M05 (license-choice gate) + M06 (v0.8.1 GitHub Releases URL) onto a new branch off git commit `d4aafc8` (BP095 M02, last known-good code state), Hugo-build, and redeploy so the final live state = correct visual chrome + license gate + v0.8.1 download URL.

---

### Why this matters

Three git-state restore attempts (M07 commit `a52a8ca`, M08 commit `45e5b23`, M09 commit `865381f`) all rendered WRONG visually — the wrong homepage chrome keeps appearing. Root cause: git-state restores don't match what Firebase actually served. Firebase Hosting retains prior releases on the live channel (`retainedReleaseCount: 999999`). Rolling back to the Firebase-retained release gives byte-perfect known-good chrome without relying on git history.

The two capabilities that DID land cleanly this session must survive:
- **M05** (commit `5da96c4`): license-choice gate on `/download/` — SSPL/Apache/Sanders-Fork 3-tier cards, Supabase edge function wired, `license_selections` migration LIVE IN DB (do NOT re-run migration).
- **M06** (commit `b1a694a`): `static/version_trust.json` v0.8.1 GitHub Releases URL + sha256.

---

### PRESERVE / DENY-LIST (Knight self-audit before any file changes)

**MUST END UP LIVE after M10-SHIP:**
1. `layouts/partials/license-choice-gate.html` — 3-tier card partial
2. `layouts/download/list.html` — injects license gate above "Right now" section
3. `static/version_trust.json` — v0.8.1, url = `https://github.com/liana-banyan/mnemosyne/releases/download/v0.8.1/MnemosyneC-Setup-0.8.1.exe`, sha256 = `046ee2490e5f7ba5a1d40a46259047e6c7868fa4979a0aadb203f377b3dcadcc`
4. `supabase/functions/record-license-selection/index.ts` — edge function (already deployed to Supabase, do NOT redeploy unless re-testing)

**DO NOT touch:**
- Any Supabase migration files (DB already migrated, `license_selections` table LIVE)
- `data/version_trust.json` if it exists (check — may not exist; backup if found)

---

### Firebase + Git Anchor Facts (Bishop pre-verified)

- Firebase CLI version: **15.22.3**
- Firebase project: `lianabanyan-403dc`
- Site ID: `mnemosyne-lianabanyan`
- Hosting target alias: `mnemosyne`
- Firebase command confirmed available: `firebase hosting:clone <source-site>:<channelId> <target-site>:<channelId>`
- Live channel current release: `1782447769510000` at `2026-06-26T04:22:49Z` — this is M09 (BAD, to be replaced)
- Live channel `retainedReleaseCount: 999999` — prior releases ARE retained, but CLI `hosting:channel:list` only shows current. Knight must query Firebase REST API to enumerate prior live releases.
- Git commit anchor: `d4aafc8` (BP095 M02, `2026-06-25 18:57 CDT` = `2026-06-25T23:57Z`) — last commit BEFORE any restore attempts (M07 starts at `a52a8ca` 21:55 CDT)
- Target release window: any live-channel release with `releaseTime` between `2026-06-25T18:00Z` and `2026-06-25T23:00Z` (covers BP095 M01/M02 deploy window, before M07 restore started)
- Hugo config for mnemosyne target: `config-mnemosynec.toml`
- Hugo output dir for mnemosyne target: `public-mnemosynec/`
- Working directory: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

**M05 files (from `git show --stat 5da96c4`):**
- `Cephas/cephas-hugo/layouts/download/list.html` (relative to repo root)
- `Cephas/cephas-hugo/layouts/partials/license-choice-gate.html`
- `Cephas/cephas-hugo/supabase/functions/record-license-selection/index.ts`
- `Cephas/cephas-hugo/supabase/migrations/20260625221017_license_selections_bp095.sql` (DO NOT re-apply to DB)

**M06 files (from `git show --stat b1a694a`):**
- `Cephas/cephas-hugo/static/version_trust.json`

---

### What Knight needs to do — SEG fan-out

**SEG-M10-A and SEG-M10-B and SEG-M10-C run in PARALLEL. SEG-M10-D runs after all three complete. SEG-M10-E runs after D. SEG-M10-VERIFY runs after E. SEG-M10-SHIP runs after VERIFY.**

---

#### SEG-M10-A (PARALLEL) — Backup M05+M06 artifacts before any changes

Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

Create backup directory at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\_M10_BACKUPS\<ISO-timestamp-UTC>\`

Copy the following files into that backup dir (flat, preserving filenames):
1. `static/version_trust.json`
2. `layouts/partials/license-choice-gate.html`
3. `layouts/download/list.html`
4. `supabase/functions/record-license-selection/index.ts`
5. `supabase/migrations/20260625221017_license_selections_bp095.sql`
6. Also check for `data/version_trust.json` — if it exists, copy it too.

For each file copied, compute and record sha256 hash (PowerShell: `Get-FileHash -Algorithm SHA256`).

Return:
- Backup directory absolute path
- File count successfully backed up
- sha256 of each file
- Any files from the list that did NOT exist (not an error, just note it)

---

#### SEG-M10-B (PARALLEL) — Firebase REST API: enumerate prior live channel releases

The Firebase CLI `hosting:channel:list` only shows the current release per channel. The live channel has `retainedReleaseCount: 999999`, so prior releases are stored. Use the Firebase REST API to list them.

Step 1: Get Firebase auth token:
```powershell
$token = (firebase login:ci --no-localhost 2>&1)
```
If `login:ci` doesn't work non-interactively, use application default credentials:
```powershell
$token = (gcloud auth print-access-token 2>&1)
```

Step 2: Call Firebase Hosting REST API to list releases on live channel:
```powershell
$project = "lianabanyan-403dc"
$site = "mnemosyne-lianabanyan"
$channel = "live"
$apiUrl = "https://firebasehosting.googleapis.com/v1beta1/projects/$project/sites/$site/channels/$channel/releases?pageSize=20"
$headers = @{ "Authorization" = "Bearer $token" }
$response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method GET
$response.releases | Select-Object name, releaseTime, type, @{n='version';e={$_.version.name}} | Format-Table
```

Step 3: From the release list, identify the release(s) with `releaseTime` between `2026-06-25T18:00:00Z` and `2026-06-25T23:00:00Z`. This is the post-M01/M02 window, before M07 restore attempt at ~21:55 CDT = 2026-06-26T02:55Z.

If the REST API auth fails: Fallback — check `.firebase/` directory in the Hugo repo for any hosting cache files that might contain version IDs:
```powershell
ls C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\.firebase\
```

Return:
- Full list of live channel releases with releaseTime and version name
- Identified target release: name, releaseTime, version name/ID
- If multiple candidates within the window, list all (pick the LATEST one before `2026-06-26T02:55Z`)
- If REST API auth fails entirely: return "REST-AUTH-FAIL" and provide the `.firebase/` cache file list

**CRITICAL: The version name/ID from this SEG is the input to SEG-M10-D's hosting:clone command.**

Format of Firebase version name: `projects/<project>/sites/<site>/versions/<versionId>`
The `<versionId>` is what `hosting:clone` uses. When using `hosting:clone` with a version (not a channel), the source format is: `<siteId>:<versionId>` — confirm this with `firebase help hosting:clone` before running.

---

#### SEG-M10-C (PARALLEL) — Git commit anchor verification

Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

Verify `d4aafc8` is the correct rollback anchor:
```powershell
git show --stat d4aafc8
git log --oneline d4aafc8^..5da96c4 --ancestry-path
```

The chain should be: `d4aafc8` (BP095 M02) → `b1a694a` (M06) → `5da96c4` (M05) → `a52a8ca` (M07 restore, BAD) → `45e5b23` (M08, BAD) → `865381f` (M09, BAD) → `HEAD`.

Verify that `d4aafc8` does NOT contain the golden-bar/cue-deck overlay (check `git show d4aafc8 -- layouts/index.html` or `layouts/partials/` for "golden-bar" or "cue-deck" strings):
```powershell
git show d4aafc8:layouts/index.html 2>&1 | Select-String -Pattern "golden-bar|cue-deck" | Measure-Object
```

Return:
- Confirmation that `d4aafc8` is reachable and is BP095 M02 receipt commit
- Whether "golden-bar" or "cue-deck" appears in `d4aafc8`'s `layouts/index.html` (should be ZERO)
- Whether "Your AI has Amnesia" appears in `d4aafc8`'s `layouts/index.html` (should be ≥1)
- Whether `d4aafc8` contains `layouts/partials/license-choice-gate.html` or `layouts/download/list.html` with gate content (it should NOT — M05 came after at `5da96c4`)
- Final recommendation: use `d4aafc8` as git anchor (expected), or flag if something unexpected

---

#### SEG-M10-D (SEQUENTIAL — after A, B, C all complete)

**Prerequisite inputs from prior SEGs:**
- From SEG-M10-A: confirm backup directory exists and all critical files backed up
- From SEG-M10-B: the Firebase live channel release closest to 2026-06-25T22:50Z (the version ID to clone FROM)
- From SEG-M10-C: confirmation that `d4aafc8` is safe anchor

**If SEG-M10-B returned "REST-AUTH-FAIL":** Switch to the `bp094-s6-opening-gambit-preview` channel as the rollback source. That channel has version `7b7bc50ffd69d15b` (deployed `2026-06-25T04:08Z`, 370 files, confirmed pre-golden-bar). The rollback command would then be:
```
firebase hosting:clone mnemosyne-lianabanyan:bp094-s6-opening-gambit-preview mnemosyne-lianabanyan:live
```
Note: this channel clone copies the CURRENT release of the source channel.

**If SEG-M10-B returned a specific version ID** (e.g., `abc123def456`): Check `firebase help hosting:clone` to confirm whether version IDs are accepted as source (the help says `<siteId>:<channelId>`, not version IDs). If version IDs are NOT accepted, then:
- Option A: The version was the only live deploy in the window — meaning we need to identify WHICH channel contained that deploy. Check channel history.
- Option B: Use the `bp094-s6-opening-gambit-preview` channel as fallback (it has clean pre-M07 state from same git baseline).

**Execute Firebase rollback:**

Step 1: Check current live version before rollback (baseline):
```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
firebase hosting:channel:list --site mnemosyne-lianabanyan --json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -ExpandProperty channels | Where-Object { $_.name -like "*live*" } | Select-Object -ExpandProperty release | Select-Object name, releaseTime
```

Step 2: Execute the clone/rollback.

**Primary path (REST API found specific prior live release and hosting:clone accepts version IDs):**
```powershell
firebase hosting:clone mnemosyne-lianabanyan:<VERSION_ID> mnemosyne-lianabanyan:live
```

**Fallback path (use bp094-s6-opening-gambit-preview channel):**
```powershell
firebase hosting:clone mnemosyne-lianabanyan:bp094-s6-opening-gambit-preview mnemosyne-lianabanyan:live
```

Step 3: Wait 30 seconds for propagation, then verify rollback landed:
```powershell
Start-Sleep -Seconds 30
$resp = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
Write-Host "HTTP Status: $($resp.StatusCode)"
Write-Host "Contains 'Your AI has Amnesia': $(($resp.Content -match 'Your AI has Amnesia').ToString())"
Write-Host "Contains 'golden-bar': $(($resp.Content -match 'golden-bar').ToString())"
Write-Host "Contains 'cue-deck': $(($resp.Content -match 'cue-deck').ToString())"
```

Expected: HTTP 200, "Your AI has Amnesia" = True, "golden-bar" = False, "cue-deck" = False.

Step 4: If rollback verification PASSES — proceed to SEG-M10-E.
If rollback verification FAILS (wrong content still showing) — STOP. Append failure mode to RESPONSE block. Do NOT proceed to SEG-M10-E. Return failure details.

Return:
- Which rollback path was used (primary version ID / bp094-s6 channel fallback)
- Firebase CLI output from the clone command
- HTTP status code of https://mnemosynec.org/ post-rollback
- "golden-bar" present? "cue-deck" present? "Your AI has Amnesia" present?
- PASS or FAIL decision

---

#### SEG-M10-E (SEQUENTIAL — after D PASS)

**Goal:** Create branch `bp096-m10-rollback-reapply` off `d4aafc8`, copy backed-up M05+M06 files onto it, verify smoke, Hugo build.

Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

Step 1: Create and checkout branch off `d4aafc8`:
```powershell
git checkout -b bp096-m10-rollback-reapply d4aafc8
```
If this errors (dirty working tree), first stash or check status:
```powershell
git status
git stash --include-untracked
git checkout -b bp096-m10-rollback-reapply d4aafc8
```

Step 2: Copy backed-up M05+M06 files from SEG-M10-A's backup directory INTO the working tree:
```powershell
$backupDir = "<SEG-M10-A BACKUP DIRECTORY PATH>"
Copy-Item "$backupDir\list.html" "layouts/download/list.html" -Force
Copy-Item "$backupDir\license-choice-gate.html" "layouts/partials/license-choice-gate.html" -Force
Copy-Item "$backupDir\version_trust.json" "static/version_trust.json" -Force
Copy-Item "$backupDir\index.ts" "supabase/functions/record-license-selection/index.ts" -Force
# DO NOT copy the migration SQL — do not re-apply to DB
```
If `data/version_trust.json` was backed up (SEG-M10-A found it), copy it too:
```powershell
if (Test-Path "$backupDir\data_version_trust.json") {
    Copy-Item "$backupDir\data_version_trust.json" "data/version_trust.json" -Force
}
```

Step 3: Pre-build smoke checks (all from working dir `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`):

Check A — version_trust contains v0.8.1 GitHub URL:
```powershell
$vt = Get-Content "static/version_trust.json" -Raw | ConvertFrom-Json
Write-Host "version: $($vt.version)"
Write-Host "url contains github.com: $(($vt.url -match 'github.com/liana-banyan/mnemosyne').ToString())"
Write-Host "sha256: $($vt.sha256)"
```
Expected: version = "0.8.1", url match = True, sha256 = `046ee2490e5f7ba5a1d40a46259047e6c7868fa4979a0aadb203f377b3dcadcc`

Check B — license-choice-gate.html has 3 tier cards:
```powershell
$gate = Get-Content "layouts/partials/license-choice-gate.html" -Raw
$ssplCount = ([regex]::Matches($gate, "SSPL")).Count
$apacheCount = ([regex]::Matches($gate, "Apache")).Count
$sandersCount = ([regex]::Matches($gate, "Sanders")).Count
Write-Host "SSPL: $ssplCount, Apache: $apacheCount, Sanders: $sandersCount"
```
Expected: all ≥1

Check C — download list.html includes license gate:
```powershell
$dl = Get-Content "layouts/download/list.html" -Raw
Write-Host "license-choice-gate partial present: $(($dl -match 'license-choice-gate').ToString())"
Write-Host "record-license-selection JS wire present: $(($dl -match 'record-license-selection').ToString())"
```
Expected: both True

If any pre-build smoke check FAILS — STOP, return diagnostic, do NOT proceed to Hugo build.

Step 4: Hugo build for mnemosyne target:
```powershell
hugo --gc --minify --config config-mnemosynec.toml 2>&1
```
Expected: exit code 0, no ERROR lines. Note any WARN lines but don't fail on them.

Step 5: Stage M05+M06 files for commit:
```powershell
git add static/version_trust.json layouts/partials/license-choice-gate.html layouts/download/list.html supabase/functions/record-license-selection/index.ts
git add data/version_trust.json 2>$null  # only if it exists
git status
```

Return:
- Branch name and base commit
- Files copied from backup
- Pre-build smoke check results (all PASS/FAIL)
- Hugo build exit code and line count of output
- Any Hugo ERROR lines (should be zero)
- git status after staging

---

#### SEG-M10-VERIFY (SEQUENTIAL — after E)

Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

Inspect `public-mnemosynec/index.html` for visual sentinels:

```powershell
$idx = Get-Content "public-mnemosynec/index.html" -Raw

# MUST BE ZERO
$goldenBar = ([regex]::Matches($idx, "golden-bar")).Count
$cueDeck = ([regex]::Matches($idx, "cue-deck")).Count
$oldAlpha = ([regex]::Matches($idx, "Public Alpha v0\.7\.2")).Count

# MUST BE ≥1
$amnesia = ([regex]::Matches($idx, "Your AI has Amnesia")).Count

Write-Host "golden-bar: $goldenBar (must be 0)"
Write-Host "cue-deck: $cueDeck (must be 0)"
Write-Host "Public Alpha v0.7.2: $oldAlpha (must be 0)"
Write-Host "Your AI has Amnesia: $amnesia (must be >= 1)"
```

Inspect `public-mnemosynec/download/index.html` for license gate:
```powershell
$dl = Get-Content "public-mnemosynec/download/index.html" -Raw
$sspl = ([regex]::Matches($dl, "SSPL")).Count
$apache = ([regex]::Matches($dl, "Apache")).Count
$sanders = ([regex]::Matches($dl, "Sanders")).Count
Write-Host "SSPL: $sspl, Apache: $apache, Sanders: $sanders (all must be >= 1)"
```

Version check:
```powershell
$vt = Get-Content "static/version_trust.json" -Raw | ConvertFrom-Json
Write-Host "version_trust version: $($vt.version) (must be 0.8.1)"
Write-Host "url: $($vt.url)"
```

**Hero CTA version flag (Founder decision required):** Check what version the hero download CTA references in `public-mnemosynec/index.html`:
```powershell
$heroVersionMatch = [regex]::Match($idx, "Download.*?v(\d+\.\d+\.\d+)")
Write-Host "Hero CTA version: $($heroVersionMatch.Value) -- Founder: is this acceptable or should it say v0.8.1?"
```
This is informational — do NOT block SHIP on this. Flag it in RESPONSE.

If ANY of the following fail — STOP, do NOT proceed to SHIP:
- golden-bar count > 0
- cue-deck count > 0
- amnesia count = 0
- SSPL/Apache/Sanders all zero in download page
- version_trust version != "0.8.1"

Return:
- All sentinel results with PASS/FAIL
- Hero CTA version (flag for Founder)
- Overall VERIFY verdict: PASS or FAIL with details

---

#### SEG-M10-SHIP (SEQUENTIAL — after VERIFY PASS)

Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`

Step 1: Commit on `bp096-m10-rollback-reapply`:
```powershell
git commit -m "BP096 M10: Firebase rollback reapply -- M05 license gate + M06 v0.8.1 GitHub URL restored on rolled-back visual chrome"
```

Step 2: Firebase deploy mnemosyne target only:
```powershell
firebase deploy --only hosting:mnemosyne 2>&1
```
Expected: exit code 0, "Deploy complete!" in output.

Step 3: Post-deploy live verification (wait 30s for CDN propagation):
```powershell
Start-Sleep -Seconds 30
$home = Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing
$dl = Invoke-WebRequest -Uri "https://mnemosynec.org/download/" -UseBasicParsing
Write-Host "Homepage HTTP: $($home.StatusCode)"
Write-Host "Download HTTP: $($dl.StatusCode)"
Write-Host "Homepage amnesia: $(($home.Content -match 'Your AI has Amnesia').ToString())"
Write-Host "Homepage golden-bar: $(($home.Content -match 'golden-bar').ToString())"
Write-Host "Download SSPL: $(($dl.Content -match 'SSPL').ToString())"
Write-Host "Download Apache: $(($dl.Content -match 'Apache').ToString())"
Write-Host "Download Sanders: $(($dl.Content -match 'Sanders').ToString())"
```

Step 4: Screenshots — MANDATORY per `feedback_ux_seg_screenshot_mandatory_bp078`.

Take screenshots using available screenshot tool (computer-use MCP if available, or `hugo serve` + browser + screen capture). Save to:
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SCREENSHOT_BP096_M10_ROLLBACK_REAPPLY_homepage.png`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SCREENSHOT_BP096_M10_ROLLBACK_REAPPLY_download.png`

If screenshot tooling is unavailable: note this in RESPONSE and provide curl content snippet of first 50 lines of https://mnemosynec.org/ as text proxy.

Step 5: Push branch:
```powershell
git push -u origin bp096-m10-rollback-reapply
```

Step 6: Append RESPONSE block to this yoke file (path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP096_M10_FIREBASE_ROLLBACK_REAPPLY.md`).

---

### Reply contract

Knight's RESPONSE block must include:
1. Commit SHA on `bp096-m10-rollback-reapply`
2. Which Firebase rollback path was used (primary REST-API version ID clone / bp094-s6 channel fallback / other)
3. Firebase version ID that was rolled back TO
4. SEG-M10-A backup directory path + file count + sha256 list
5. SEG-M10-C git anchor verdict (d4aafc8 confirmed safe / unexpected finding)
6. SEG-M10-VERIFY sentinel results (all pass/fail)
7. Post-deploy live sentinel results (HTTP status, amnesia/golden-bar/SSPL/Apache/Sanders)
8. Screenshot paths (or "unavailable" + text proxy)
9. Hero CTA version flag (for Founder decision)
10. Any open obligations or Truth-Always findings

---

### Statute reminders

- §3 + corrective BP079 (this Yoke binds both surfaces — parameter + announcement)
- §17 BP087 GADGET-FIRST DISCOVERY BLOOD (no Glob/find/Select-String for discovery; use Read + git show)
- `feedback_ux_seg_screenshot_mandatory_bp078` — screenshots of homepage + download page are MANDATORY
- `canon_actual_runtime_verify_for_runtime_bugs_bp078` — post-deploy live curl verification required
- `canon_long_running_progress_heartbeat_canon_bp078` — if any step takes >3s, emit heartbeat
- `canon_bishop_seg_self_report_truth_always_verify_with_independent_gadget_bp092` — if Knight's own prior SEG claimed success but live site shows otherwise, re-verify independently before claiming PASS
- **DO NOT re-apply Supabase migration `20260625221017_license_selections_bp095.sql`** — table is already live in production DB

---

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP096_M10_FIREBASE_ROLLBACK_REAPPLY.md`. Firebase Hosting rollback + M05 license gate + M06 v0.8.1 URL reapply — 3 parallel SEGs then 4 sequential. Sonnet 4.6 SEGs mandatory (Statute §3 + corrective sub-canon BP079). Yoke-return consolidated.

- Bishop - BP096 - pinned 2026-06-26T04:45Z

---

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 3 parallel Sonnet 4.6 SEGs RIGHT NOW, then 4 sequential. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire SEG-M10-A + SEG-M10-B + SEG-M10-C in parallel single message.

Full spec: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP096_M10_FIREBASE_ROLLBACK_REAPPLY.md`

---

**SEG-M10-A (Sonnet 4.6) — PARALLEL:** Backup M05+M06 artifacts. Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`. Create dir `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\_M10_BACKUPS\<ISO-UTC-timestamp>\`. Copy into it: `static/version_trust.json`, `layouts/partials/license-choice-gate.html`, `layouts/download/list.html`, `supabase/functions/record-license-selection/index.ts`, `supabase/migrations/20260625221017_license_selections_bp095.sql`, and `data/version_trust.json` if it exists. Compute SHA256 of each file (PowerShell: `Get-FileHash -Algorithm SHA256`). Return: backup dir path, file count, sha256 of each.

**SEG-M10-B (Sonnet 4.6) — PARALLEL:** Firebase REST API release inventory. Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`. Get Firebase auth token via `gcloud auth print-access-token`. Call: `Invoke-RestMethod -Uri "https://firebasehosting.googleapis.com/v1beta1/projects/lianabanyan-403dc/sites/mnemosyne-lianabanyan/channels/live/releases?pageSize=20" -Headers @{"Authorization"="Bearer $token"}`. List all releases with releaseTime. Find the release with releaseTime closest to BUT before `2026-06-26T02:55Z` (= start of M07 restore attempts). This is the known-good target. If REST API auth fails entirely, return "REST-AUTH-FAIL" and list contents of `.firebase/` dir in repo root. Return: full release list with timestamps, identified target release ID and version name, or REST-AUTH-FAIL + fallback info. CRITICAL: the version name/ID from this SEG is the input to SEG-M10-D.

**SEG-M10-C (Sonnet 4.6) — PARALLEL:** Git anchor verification. Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`. Run `git show --stat d4aafc8`. Then check if "golden-bar" or "cue-deck" appears in d4aafc8's layouts/index.html: `git show d4aafc8:layouts/index.html 2>&1 | Select-String -Pattern "golden-bar|cue-deck"` (should be empty). Check "Your AI has Amnesia" in same file: `git show d4aafc8:layouts/index.html 2>&1 | Select-String -Pattern "Your AI has Amnesia"` (should match). Confirm d4aafc8 does NOT contain license-choice-gate.html: `git show d4aafc8:layouts/partials/license-choice-gate.html 2>&1` (should error "does not exist"). Return: all check results + recommended anchor (d4aafc8 confirmed / flag if unexpected).

---

After SEG-M10-A + B + C all return: run **SEG-M10-D (Sonnet 4.6) — SEQUENTIAL:** Firebase rollback. Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`. Confirm SEG-M10-A backup is complete. Use SEG-M10-B's output: if REST API returned a prior live release version (format `projects/lianabanyan-403dc/sites/mnemosyne-lianabanyan/versions/<versionId>`), check `firebase help hosting:clone` to confirm whether version IDs work as source (the clone syntax is `<siteId>:<channelId>` per CLI help — version IDs may NOT work). If version IDs don't work as channel IDs, fall back to: `firebase hosting:clone mnemosyne-lianabanyan:bp094-s6-opening-gambit-preview mnemosyne-lianabanyan:live` (this channel has clean pre-M07 state from 2026-06-25T04:08Z). If REST-AUTH-FAIL from SEG-M10-B, use the bp094-s6 fallback immediately. After clone command, wait 30s then verify: `Invoke-WebRequest -Uri "https://mnemosynec.org/" -UseBasicParsing` — check HTTP 200, "Your AI has Amnesia" = True, "golden-bar" = False, "cue-deck" = False. If verification PASSES, continue. If FAILS, STOP and return failure mode + do NOT proceed.

After SEG-M10-D PASS: run **SEG-M10-E (Sonnet 4.6) — SEQUENTIAL:** Git branch + M05+M06 reapply. Working dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo`. Run `git checkout -b bp096-m10-rollback-reapply d4aafc8` (stash first if dirty). Copy from SEG-M10-A backup dir into working tree: list.html → layouts/download/list.html, license-choice-gate.html → layouts/partials/license-choice-gate.html, version_trust.json → static/version_trust.json, index.ts → supabase/functions/record-license-selection/index.ts. DO NOT copy migration SQL. Pre-build smokes: (1) static/version_trust.json version = "0.8.1" and url contains "github.com/liana-banyan/mnemosyne"; (2) layouts/partials/license-choice-gate.html contains SSPL+Apache+Sanders; (3) layouts/download/list.html contains "license-choice-gate" and "record-license-selection". If any smoke fails, STOP. Then: `hugo --gc --minify --config config-mnemosynec.toml`. Check exit 0 + no ERROR lines. Stage: `git add static/version_trust.json layouts/partials/license-choice-gate.html layouts/download/list.html supabase/functions/record-license-selection/index.ts`. Return: branch name, smoke results, Hugo exit code, staged file list.

After SEG-M10-E complete: run **SEG-M10-VERIFY (Sonnet 4.6) — SEQUENTIAL:** Visual sentinels in public-mnemosynec/index.html: golden-bar must be 0, cue-deck must be 0, "Your AI has Amnesia" must be ≥1. In public-mnemosynec/download/index.html: SSPL≥1, Apache≥1, Sanders≥1. In static/version_trust.json: version = "0.8.1", url contains github.com/liana-banyan/mnemosyne. Also flag (do not block): what version does the hero download CTA reference? Return all PASS/FAIL. If any hard sentinel fails, STOP.

After SEG-M10-VERIFY PASS: run **SEG-M10-SHIP (Sonnet 4.6) — SEQUENTIAL:** Commit: `git commit -m "BP096 M10: Firebase rollback reapply -- M05 license gate + M06 v0.8.1 GitHub URL restored on rolled-back visual chrome"`. Deploy: `firebase deploy --only hosting:mnemosyne`. Wait 30s. Live verify: https://mnemosynec.org/ HTTP 200 + amnesia present + golden-bar absent; https://mnemosynec.org/download/ HTTP 200 + SSPL/Apache/Sanders present. Screenshots MANDATORY: save to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SCREENSHOT_BP096_M10_ROLLBACK_REAPPLY_homepage.png` and `..._download.png`. Push: `git push -u origin bp096-m10-rollback-reapply`. Append `## RESPONSE` block to yoke file at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP096_M10_FIREBASE_ROLLBACK_REAPPLY.md` with: commit SHA, rollback path used, Firebase version rolled back to, backup dir path, sentinel results, screenshot paths, hero CTA version flag.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

Yoke-return: append `## RESPONSE` block to this Yoke file. Include per-SEG outcome + commit SHA + screenshot paths + Truth-Always findings.

---
