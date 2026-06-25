# KNIGHT YOKE DISPATCH · BP093 · v0.7.1 DEPLOY · FIREBASE + GITHUB RELEASE
**§3 Sonnet 4.6 binding · §17 BLOOD gadget-first preamble · use segs**

Bishop SEG-J (BP093) composed this dispatch after independent gadget verification (§14 §17 BLOOD). All paths, hashes, and target names below are Bishop-verified empirically — not assumptions.

**SEG-E SHIP-BLOCKER**: `mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe` returns 404. The file was never copied into the Firebase hosting public folder and no GitHub release v0.7.1 exists. This paste fixes both gaps.

**Wall-clock estimate**: 15–25 min (515.6 MB upload is the bottleneck).

---

## BISHOP GADGET RECEIPTS (Knight reads, does not repeat)

| Item | Verified value |
|------|----------------|
| Firebase config path | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\firebase.json` |
| Firebase target name | `mnemosyne` |
| Firebase public folder | `public-mnemosynec` (relative to `Cephas\cephas-hugo\`) |
| .exe source path | `C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe` |
| .blockmap source path | `C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe.blockmap` |
| Hugo static download folder | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\` |
| SHA256 (Bishop-verified) | `7CB983022D2FCC91D6F1240C467DC02374A1AEBA92B2711296EB5629854DA845` |
| File size | 515.60 MB (540,639,032 bytes) |
| version_trust.json entry | Already present — filename + sha256 + tier=latest confirmed |
| Download page filename key | `{{ .filename }}` pulled from version_trust.json — data-driven, no hardcoded string to update |
| GitHub mnemosyne remote | `https://github.com/liana-banyan/mnemosyne.git` |
| Platform repo remote | `https://github.com/Upekrithen/LianaBanyanPlatform.git` |
| firebase.json /download/*.exe header | `Content-Disposition: attachment` + `Content-Type: application/octet-stream` + `Cache-Control: public, max-age=3600` — already correct for .exe serving |

---

## PRE-FLIGHT CHECK · Knight SHALL verify before any copy or deploy

Run each command. If any fails the stated condition, STOP and return SEG to Bishop before proceeding.

```powershell
# CHECK 1 — .exe exists at source
Test-Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe"
# EXPECT: True

# CHECK 2 — SHA256 matches BP092 + BP093 Bishop receipt
(Get-FileHash "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe" -Algorithm SHA256).Hash
# EXPECT: 7CB983022D2FCC91D6F1240C467DC02374A1AEBA92B2711296EB5629854DA845

# CHECK 3 — File size confirms ~515.6 MB
[math]::Round((Get-Item "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe").Length / 1MB, 2)
# EXPECT: 515.6 (accept 515.0–516.2)

# CHECK 4 — Confirm the URL is currently 404 (proves the gap is real)
$r = Invoke-WebRequest -Uri "https://mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe" -Method Head -SkipHttpErrorCheck -UseBasicParsing 2>$null; $r.StatusCode
# EXPECT: 404 (or error — either confirms the file is absent from hosting)
```

---

## STEP 1 · Copy .exe + .blockmap + SHA256 sidecar into Hugo static download folder

The Firebase deploy reads from `public-mnemosynec/download/`. Hugo copies `static/download/` into `public-mnemosynec/download/` at build time. The pattern established by all prior releases (0.3.0 through 0.7.0) is: place files in `static/download/`, rebuild Hugo, then `firebase deploy`.

**DO NOT commit the .exe or .blockmap to git.** They are large binaries. The `.gitignore` already excludes large binaries in `static/download/` based on prior sessions — if Knight sees any `git status` staging of the .exe, stop and do not commit.

```powershell
# 1a — Copy .exe into Hugo static download folder
Copy-Item `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe" `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\MnemosyneC-Setup-0.7.1.exe" `
  -Force

# 1b — Copy .blockmap into Hugo static download folder
Copy-Item `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe.blockmap" `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\MnemosyneC-Setup-0.7.1.exe.blockmap" `
  -Force

# 1c — Write SHA256 sidecar text file
Set-Content `
  -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\MnemosyneC-Setup-0.7.1.exe.sha256" `
  -Value "7CB983022D2FCC91D6F1240C467DC02374A1AEBA92B2711296EB5629854DA845  MnemosyneC-Setup-0.7.1.exe" `
  -Encoding UTF8

# 1d — Confirm all three files are present
Get-ChildItem "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\" |
  Where-Object { $_.Name -like "*0.7.1*" } |
  Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}
# EXPECT: 3 rows — MnemosyneC-Setup-0.7.1.exe (~515.6 MB) + .blockmap (~0.53 MB) + .sha256 (~0 MB)
```

---

## STEP 2 · Hugo build + Firebase deploy (mnemosyne target)

```powershell
# 2a — Hugo build (generates public-mnemosynec/ from static/ + layouts/ + data/)
Set-Location "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --environment production
# EXPECT: exit 0 · "Total in" line completes without error

# 2b — Confirm .exe is present in built public-mnemosynec/download/
Test-Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\download\MnemosyneC-Setup-0.7.1.exe"
# EXPECT: True

# 2c — Firebase deploy (mnemosyne target only — do NOT deploy all targets)
firebase deploy --only hosting:mnemosyne --project default
# EXPECT: Deploy complete. Hosting URL: https://mnemosynec.org (or mnemosynec-org.web.app)
# NOTE: This same Firebase hosting target also serves mnemosynec.ai — single deploy covers both domains.
# Wall-clock: 515 MB upload may take 10–20 min depending on connection speed.
```

**If firebase deploy reports "File too large" error**: Firebase Hosting has a 2 GB per-file limit (well above 515.6 MB) and a 10 GB per-deploy limit. 515.6 MB is within limits. If an error occurs, return SEG to Bishop with the exact error text.

---

## STEP 3 · GitHub release v0.7.1 (liana-banyan/mnemosyne repo)

The `mnemosyne` remote (`https://github.com/liana-banyan/mnemosyne.git`) is the public-facing MnemosyneC repo. The release asset goes there so the "GitHub mirror" fallback link on /download/ resolves.

```powershell
# 3a — Write release notes file
Set-Content `
  -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\v0.7.1-release-notes.md" `
  -Value @'
## MnemosyneC v0.7.1 — IP Ledger Ring Bearer + Empress Campaign

### What's new in v0.7.1

**IP Ledger I12 (M25)**
- Ring Bearer keygen — Ed25519 identity key generated and stored per member on first use
- Stamp-Certify — one-click IP timestamping for eblets, files, and contributions
- Mesh Diff Loop (15-min interval) — live cross-peer IP Ledger reconciliation
- My IP Ledger UI tab — browse your stamped contributions inside the app

**Live cooperative substrate**
- 5-peer fleet confirmed active
- Empress Campaign Block 3 deployed
- M24 Posse decomposition + Round-Up hotfix wired
- ABSTAIN auto-re-fire cascade operational (Tier 1 → Posse → Tier 2 → Tier 3)

**Binary integrity**
- SHA-256: 7CB983022D2FCC91D6F1240C467DC02374A1AEBA92B2711296EB5629854DA845
- Size: 515.6 MB
- Platform: Windows x64 (NSIS installer)

Download and verify: https://mnemosynec.org/download/
'@

# 3b — Create GitHub release with .exe attached
# Knight SHALL be in the platform repo root — gh CLI reads from ambient git context
Set-Location "C:\Users\Administrator\Documents\LianaBanyanPlatform"

gh release create v0.7.1 `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.1.exe" `
  --repo liana-banyan/mnemosyne `
  --title "MnemosyneC v0.7.1 — IP Ledger Ring Bearer + Empress Campaign" `
  --notes-file "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\v0.7.1-release-notes.md"
# EXPECT: https://github.com/liana-banyan/mnemosyne/releases/tag/v0.7.1

# 3c — Verify release is live
gh release view v0.7.1 --repo liana-banyan/mnemosyne
# EXPECT: title, tag v0.7.1, ACTIVE status, 1 asset (MnemosyneC-Setup-0.7.1.exe ~515.6 MB)
```

**If `gh release create` fails with "tag already exists"**: run `gh release delete v0.7.1 --repo liana-banyan/mnemosyne --yes` first, then re-run step 3b.

**Note on tag**: the gh CLI will create tag v0.7.1 on the default branch of liana-banyan/mnemosyne. That repo may be on `main` or `knight-marathon-m24-posse-tier2-abstain`. Knight should NOT override the branch — let gh create the tag on whatever HEAD is current in that repo. The release asset (binary) is what matters; the tag commit is secondary.

---

## STEP 4 · Empirical verification — Knight runs ALL checks after deploy

```powershell
# 4a — Primary download URL — expect HTTP 200 + correct Content-Length
$r1 = Invoke-WebRequest -Uri "https://mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe" -Method Head -UseBasicParsing
Write-Host "mnemosynec.org .exe status:  $($r1.StatusCode)"
Write-Host "Content-Length:              $($r1.Headers['Content-Length'])"
# EXPECT: 200 · Content-Length: 540639032 (or within ±100 bytes — Firebase may report slightly different)

# 4b — SHA256 sidecar
$r2 = Invoke-WebRequest -Uri "https://mnemosynec.org/download/MnemosyneC-Setup-0.7.1.exe.sha256" -Method Head -UseBasicParsing
Write-Host "mnemosynec.org .sha256 status: $($r2.StatusCode)"
# EXPECT: 200

# 4c — mnemosynec.ai (same Firebase hosting target — should resolve identically)
$r3 = Invoke-WebRequest -Uri "https://mnemosynec.ai/download/MnemosyneC-Setup-0.7.1.exe" -Method Head -UseBasicParsing
Write-Host "mnemosynec.ai .exe status:  $($r3.StatusCode)"
# EXPECT: 200

# 4d — GitHub release
gh release view v0.7.1 --repo liana-banyan/mnemosyne --json tagName,isDraft,assets | ConvertFrom-Json
# EXPECT: tagName=v0.7.1, isDraft=false, assets array contains MnemosyneC-Setup-0.7.1.exe
```

**PASS criteria**: all four checks return the expected values. If any check fails, return SEG to Bishop with exact output.

---

## STEP 5 · Knight returns to Yoke

Knight returns the following in Yoke receipt. No paraphrase — exact values:

```
YOKE RECEIPT · BP093 · v0.7.1 DEPLOY

1. Firebase deploy output URL: [paste Firebase hosting URL here]
2. mnemosynec.org .exe HTTP status: [200 or FAIL + error]
3. mnemosynec.org .sha256 HTTP status: [200 or FAIL + error]
4. mnemosynec.ai .exe HTTP status: [200 or FAIL + error]
5. GitHub release URL: [paste full URL here]
6. gh release view isDraft: [false or FAIL]
7. ELECTRON_TOUCHED: NO
8. Wall-clock minutes: [actual]
```

---

## §15 BLOOD NOTE

Bishop will gadget the same URLs independently after Knight returns Yoke receipt, per canon_bishop_seg_self_report_truth_always_verify_with_independent_gadget_bp092. Bishop does NOT take Knight's word alone for HTTP 200 — Bishop will run independent curl/Invoke-WebRequest SEG to confirm Truth-Always.

---

*BP093 · Bishop SEG-J · Sonnet 4.6 · 2026-06-23*
*Gadget-first: firebase.json read · release/ Glob · SHA256 Get-FileHash · version_trust.json read · git config read · layouts/download/list.html read*
