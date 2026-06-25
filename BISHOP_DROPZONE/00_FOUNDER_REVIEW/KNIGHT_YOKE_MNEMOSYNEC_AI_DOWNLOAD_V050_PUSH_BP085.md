# KNIGHT YOKE — MnemosyneC v0.5.0 Download Page Verification + Push — BP085
**Issued:** 2026-06-16  
**Priority:** P0 — Founder's son installing RIGHT NOW  
**Bishop PREAMBLE:** Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Don't burn your context budget doing the work yourself. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## EMPIRICAL STATE AS OF BISHOP RECON (2026-06-16)

### mnemosynec.ai/download — WHAT IS LIVE TODAY
- v0.5.0 IS listed on the page as 🟡 LATEST with date 2026-06-20 ("Substrate Awakens · live mesh event")
- The binary URL `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` returns data (binary content exceeded 10MB fetch limit — NOT a 404). Binary IS accessible.
- 19 total versions listed. v0.1.60 is 🟢 STABLE. All others between are 🔵 HISTORICAL.

### GitHub Fallback
- `lianabanyan` is NOT a recognized GitHub user/org in gh CLI.
- Web search found no public `lianabanyan/mnemosynec` GitHub repo.
- **GitHub fallback is MISSING or PRIVATE** — BP081 canon violation: "self-host primary + GitHub fallback" requires BOTH.

### Local Build Artifacts Found
Four copies of the binary exist locally:
1. `C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.0.exe`
2. `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public\download\MnemosyneC-Setup-0.5.0.exe`
3. `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\download\MnemosyneC-Setup-0.5.0.exe`
4. `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\MnemosyneC-Setup-0.5.0.exe`

---

## ROOT CAUSE ASSESSMENT

**mnemosynec.ai/download self-host: FUNCTIONAL.** v0.5.0 IS listed and binary IS downloadable. The Founder's report that son "can't see v0.5.0" is likely one of:
- Browser cache on son's machine showing stale page (hard refresh / incognito will cure)
- Son is looking at a different URL (e.g., mnemosynec.ai/downloads/ with an 's', or an old bookmark)
- The page loaded before the deploy propagated and son hasn't refreshed

**GitHub fallback: MISSING.** This IS a BP081 canon violation. No public `lianabanyan` org exists. The fallback link on the page either points to a private repo or doesn't exist yet.

---

## WORKAROUND FOR SON RIGHT NOW

**Self-host IS working.** Direct son to:
```
https://mnemosynec.ai/download/
```
Have son do a **hard refresh** (Ctrl+Shift+R or Ctrl+F5) or open in a **private/incognito window**.

Direct binary link (send this to son if page still looks wrong):
```
https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe
```

---

## KNIGHT SHARPS (5 required)

### Sharp 1 — Confirm binary resolves + byte-count correct
SEG task: Download binary from `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` via curl (or PowerShell Invoke-WebRequest) and compare SHA256/file size against the canonical build at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.0.exe`

```powershell
# Run from PowerShell on this machine
$local = Get-FileHash "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.0.exe" -Algorithm SHA256
Write-Host "LOCAL SHA256: $($local.Hash)"
# Then compare to live download
Invoke-WebRequest -Uri "https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe" -OutFile "$env:TEMP\v050_live.exe"
$live = Get-FileHash "$env:TEMP\v050_live.exe" -Algorithm SHA256
Write-Host "LIVE SHA256: $($live.Hash)"
if ($local.Hash -eq $live.Hash) { Write-Host "MATCH — binary identical" } else { Write-Host "MISMATCH — investigate" }
```

Receipt: SHA256 match = GREEN. Mismatch = P0 escalate to Founder.

---

### Sharp 2 — Establish GitHub public fallback
BP081 requires BOTH self-host AND GitHub fallback. GitHub fallback is currently missing.

SEG task:
1. Confirm with Founder whether a public GitHub org/repo exists or needs to be created.
2. If repo exists but is private: Founder to set public, OR create a Releases page with v0.5.0 `.exe` attached.
3. If repo does not exist: create `lianabanyan/mnemosynec` (or the correct org name) with a Releases entry for v0.5.0.
4. Update the download page fallback link to point to the correct GitHub Releases URL.

Receipt: `gh release view v0.5.0 --repo <org>/mnemosynec` returns the release. GREEN when son can also download from GitHub URL directly.

---

### Sharp 3 — Tower of Peace badge integrity check
Per BP082 Tower of Peace canon: v0.5.0 should be 🟡 LATEST, v0.1.60 should be 🟢 STABLE.

SEG task: Read the download page source (Hugo template or data file) and confirm:
- v0.5.0 tier = `latest`
- v0.1.60 tier = `stable`
- No version between v0.1.60 and v0.5.0 is incorrectly badged STABLE
- DEPRECATED badge applied to any version flagged for removal

Files to check:
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\downloads.yaml` (or `.json` or `.toml` — search for the data file that drives the download page)
- The Hugo template rendering the tier badges

Receipt: All tiers match canon. GREEN.

---

### Sharp 4 — Firebase deploy freshness check
Confirm the live site is running the latest Cephas Hugo build (not a stale cached deploy).

SEG task:
```powershell
# In the cephas-hugo directory
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
firebase hosting:channel:list 2>&1
firebase deploy --only hosting --dry-run 2>&1
```

If dry-run shows pending changes → deploy is stale → run `firebase deploy --only hosting`.
If no pending changes → live site IS current → page display issue is client-side cache on son's machine.

Receipt: `firebase deploy` completes with hosting URL confirmed, OR dry-run confirms no diff. GREEN.

---

### Sharp 5 — Son's machine install receipt
After son installs v0.5.0, confirm version in app:

SEG task: Ask Founder to relay son's confirmation:
- Open MnemosyneC → Settings (or Help → About)
- Confirm version reads `0.5.0`
- If onboarding-stuck bug recurs (per BP083 HARD BINDING): workaround is rename/delete `%APPDATA%\mnemosynec\` folder, re-launch, complete onboarding fresh.

Receipt: Son confirms "0.5.0" in app. GREEN.

---

## YOKE RETURN TEMPLATE

```
KNIGHT YOKE RETURN — MNEMOSYNEC_AI_DOWNLOAD_V050 — BP085
Model: Sonnet 4.6

Sharp 1 — Binary SHA256: [ ] GREEN / [ ] RED — Hash: _______________
Sharp 2 — GitHub fallback: [ ] GREEN / [ ] RED — URL: _______________
Sharp 3 — Tower of Peace badges: [ ] GREEN / [ ] RED
Sharp 4 — Firebase deploy: [ ] GREEN / [ ] RED
Sharp 5 — Son install receipt: [ ] GREEN / [ ] RED — Version confirmed: ___

Root cause confirmed: _______________________________________________
Action taken: ______________________________________________________
Son status: ________________________________________________________
```

---

## IMPORTANT NOTES FOR KNIGHT

1. DO NOT deploy without Founder confirmation if Sharp 1 returns a SHA256 mismatch — that means a different binary is live than the local build.
2. The GitHub fallback (Sharp 2) requires Founder involvement — Knight cannot create a public GitHub org unilaterally. Flag as BLOCKED and surface immediately.
3. BP083 onboarding-stuck canon: if son's onboarding gets stuck, the cure is wiping `%APPDATA%\mnemosynec\` (lowercase) — NOT reinstalling.
4. Restart-after-install canon (BP083): after v0.5.0 installs, son MUST fully close and reopen MnemosyneC — auto-update doesn't fully tear down renderer state.
