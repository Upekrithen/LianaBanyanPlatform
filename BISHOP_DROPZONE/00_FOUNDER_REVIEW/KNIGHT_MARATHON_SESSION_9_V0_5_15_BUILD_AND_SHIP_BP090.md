# KNIGHT MARATHON SESSION 9 · v0.5.15 BUILD + SHIP · BP090

---

## §0 · SUBSTRACE WAKE HEADER

**Marathon:** 9
**Version target:** 0.5.14 → 0.5.15
**Wake frame:** SUBSTRACE THEOREM · routine deploy wake
**NOT BLACK MAMBA.** This is operational mechanic work. Knight builds and ships. Bishop verifies via curl only.
**Branch:** `knight-marathon-9-v0-5-15-build-and-ship` (off main HEAD `4d01bf6`)
**Scope:** package.json version bump + data/version.json bump + build artifacts. No source-code modification of Mountain modules. They ship as-is from main.
**BP:** BP090
**Authored:** 2026-06-21
**Model dispatch:** "use segs" Sonnet 4.6

---

## §1 · CANONS CARRIED

These six canons bind Knight throughout this Marathon. No canon overrides another. All are active simultaneously.

**canon_knight_is_operator_mechanic_bishop_is_strategist_no_bishop_direct_hugo_firebase**
Knight owns build and deploy. Bishop verifies via curl only. Knight NEVER asks Bishop to run hugo, firebase, or electron-builder. Bishop NEVER touches those tools. Knight runs them.

**canon_release_on_ready_brick_wall_pre_authorized_no_reratification_bp063**
Cut the release when verified-ready. No re-asking Founder. No re-ratification. Brick Wall pre-authorized at BP063. Four-scope reconcile follows after ship.

**canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086**
autoDownload=false safety holds for the entire Marathon. Do not change it. Peers receive a 1-click prompt on next launch. No silent install. Ever.

**canon_truth_always**
This Marathon ships code. It does NOT claim score improvements. Empirical receipts only. No aspirational claims until 02d fires and produces verified output.

**canon_designed_to_be_copied**
Canonical URL only. No-Flash-Drives. Every install is autonomous. Distribution goes through mnemosynec.ai/download/ only.

**§4 Firebase deploy canon**
Firebase canonical. NEVER raw gcloud. All deploy commands use `firebase deploy --only hosting:mnemosyne`. No exceptions.

---

## §2 · STATUTES BINDING

**§3** Bishop role binding. Bishop is strategist. Knight is mechanic. Roles do not swap during this Marathon.
**§4** Firebase deploy. Canonical. No raw gcloud.
**§17** BLOOD gadget-first discovery. Every Wave runs gadget SEGs before any mutation. Read before write. Always.

---

## §3 · EMPIRICAL FOUNDATION

**Main HEAD:** `4d01bf6` (Bishop merge M3b · all 5 mountain summit attempts merged)

**Code shipping in v0.5.15 (documented Bishop commit lineage):**
- `8c54c3a` M1 · dr_m_orchestrator: substrate_reader, brain_swap, hex_mcode, dispatch_loop, minor_star_chamber, court_packages
- `86a89b2` M1b · plow/: domain_classifier, unfair_advantage, plow_loop
- `7a14e7f` M2 · scribes Wave I: reminder, wrasse, toolsmith, scribe_runner + canon_corpus stub + pearl/* + identity/ip_ledger + enforcement_council pattern-aware
- `278f101` M4+M5+M6 (Wave 6 emergency rebuild context)
- `47bff4c` M7
- `4d01bf6` M3b · librarian_corps: pyramid_index, librarian, file_cabinet, dispatcher + persistence wire-up

**Current state before Marathon fires:**
- package.json: v0.5.14 (not yet bumped)
- Cephas/cephas-hugo/data/version.json: v0.5.14 (SEG-P prior receipt)
- Live latest.yml on CDN: v0.5.14 released 2026-06-20T22:56:53Z
- All 4 peers: v0.5.14
- gemma4:12b VRAM window expires 21:32 today · Knight builds before that window closes if possible

**Wave 6 emergency rebuild empirical pattern (canonical reference):**
Knight self-healed the IIFE wrap on Catacombs IPC during Wave 6 build. Same code-author lineage applies here. If a build error surfaces that Knight authored, Knight fixes it. Bishop does not touch the build. That pattern is the standing operating procedure for this Marathon.

---

## §4 · PRE-FLIGHT CHECKS

Five SEGs. All ungated. All gadget-first per §17 BLOOD.

### SEG I-A · Gadget package.json

```
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json
Assert: "version" field reads "0.5.14"
PASS condition: exact string match
FAIL action: stop · report to Founder · do not proceed
```

### SEG I-B · Gadget data/version.json

```
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version.json
Assert: version field reads "0.5.14"
PASS condition: exact string match
FAIL action: stop · report to Founder · do not proceed
```

### SEG I-C · Gadget supabase.ts lazy Proxy intact

```
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\supabase.ts
Assert: getSupabase() function present + lazy Proxy pattern present
Wave 6 fix. Must NOT be regressed by Mountain work.
PASS condition: both symbols found
FAIL action: stop · this is a regression · report before any build
```

### SEG I-D · Gadget Catacombs IPC IIFE wrap intact

```
Read: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\catacombs.ts (or equivalent IPC registration file)
Assert: IIFE wrap present on IPC handler block
Wave 6 self-heal. Must NOT regress.
PASS condition: IIFE pattern confirmed
FAIL action: stop · report · Knight re-applies IIFE wrap before build
```

### SEG I-E · tsc --noEmit baseline

```
Command: cd C:\Users\Administrator\Documents\LianaBanyanPlatform && npx tsc --noEmit
Assert: error count does not EXCEED pre-existing 4 errors documented in Mountain SEG receipts
PASS condition: 0 to 4 errors · same error set as Mountain receipts
FAIL condition: new error introduced by Mountain merge · stop · identify root cause · fix before build
```

All five SEGs must PASS before Wave I fires.

---

## §5 · WAVE I · BUMP VERSION

Three SEGs. Ungated relative to §4 PASS.

### SEG I-A · Bump package.json

```
File: C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json
Change: "version": "0.5.14" → "version": "0.5.15"
Verify after edit: re-read line · confirm "0.5.15" present
```

### SEG I-B · Bump data/version.json

```
File: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version.json
Change: version value 0.5.14 → 0.5.15
Per SEG-P data-driven pattern: this file drives the Hugo download page version badge.
Verify after edit: re-read · confirm 0.5.15
```

### SEG I-C · Commit version bump

```
Staging: git add package.json Cephas/cephas-hugo/data/version.json
Commit message verbatim:
  BP090 Marathon 9: bump 0.5.14 → 0.5.15 for Mountains 1/1b/2/3/3b ship
Branch: knight-marathon-9-v0-5-15-build-and-ship
Do NOT use --no-verify
```

Wave I complete when commit hash confirmed.

---

## §6 · WAVE II · BUILD

One SEG. Gated on §5 complete.

### SEG II-A · npm run dist:win

```
Working directory: C:\Users\Administrator\Documents\LianaBanyanPlatform
Command: npm run dist:win
Expected duration: 15-25 minutes
Expected outputs in release/:
  MnemosyneC-Setup-0.5.15.exe     (~515 MB target)
  MnemosyneC-Setup-0.5.15.exe.blockmap
  latest.yml                      (version: 0.5.15 · new releaseDate)
```

**Assert gates Knight verifies after build completes:**

1. Floor model present in bundle (Electron app bundles Ollama + model floor)
2. Supabase anon key injected (env present in packaged output)
3. Preload sandbox flag correct (contextIsolation: true · nodeIntegration: false)
4. IPC handlers registered without collision:
   - Mountain additions to verify: `ip-ledger:get-entries` · `peer-key:read` · `peer-key:regenerate` (from M3 Knight closure)
   - No duplicate channel registration errors in build log
5. Bundled Ollama binary present in resources/

**Mountain integration check (NOT just tsc clean):**
Knight verifies that ALL Mountain TypeScript compiles into the Electron bundle without runtime errors. A clean tsc pass does not guarantee clean Electron packaging. Knight reads the full electron-builder log for require() errors, missing-module errors, and IPC collision warnings. If any surface: read the error · identify root cause · fix · re-run dist:win. Do NOT skip past build errors.

**If assert fails:**
Read the assert script. Identify root cause. Fix. Re-run dist:win. No --no-verify on git commits if cleanup is needed. Wave 6 empirical precedent: Knight self-authored the regression and Knight self-healed it. Same protocol here.

Wave II complete when MnemosyneC-Setup-0.5.15.exe confirmed in release/ and all assert gates PASS.

---

## §7 · WAVE III · SHIP TO CDN

Three SEGs. Gated on §6 complete.

### SEG III-A · Copy artifacts to Hugo static

```
Source files:
  C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.15.exe
  C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.15.exe.blockmap
  C:\Users\Administrator\Documents\LianaBanyanPlatform\release\latest.yml

Destination:
  C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\

Copy all three. Verify each file present at destination before proceeding.
```

### SEG III-B · Hugo build

```
Working directory: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
Command: hugo --minify --config config-mnemosynec.toml
Expected output: 53 pages built to public-mnemosynec/
Assert: page count >= 53 · no build errors · download/ page present in output
FAIL condition: fewer than 53 pages · any ERROR in hugo output · stop and report
```

### SEG III-C · Firebase deploy

```
Working directory: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
Command: firebase deploy --only hosting:mnemosyne
Per §4 Firebase deploy canon: this is the ONLY permitted deploy command. Never raw gcloud.
Expected: "Deploy complete!" · release URL confirmed in output · version finalized
```

Wave III complete when Firebase deploy confirms release complete.

---

## §8 · WAVE IV · LIVE CDN VERIFY

One SEG. Gated on §7 complete.

### SEG IV-A · Four-curl verification

Run all four. All must return HTTP 200.

```
curl -I https://mnemosynec.ai/download/latest.yml
  Assert: HTTP 200 · Content present · version: 0.5.15 in body · new releaseDate (not 2026-06-20T22:56:53Z)

curl -I https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.15.exe
  Assert: HTTP 200 · Content-Length ~515 MB range

curl -I https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.15.exe.blockmap
  Assert: HTTP 200

curl -I https://mnemosynec.ai/download/
  Assert: HTTP 200 · page renders v0.5.15 download button (check response body for "0.5.15")
```

**mnemosynec.org parity check:**

```
curl -I https://mnemosynec.org/download/latest.yml
  Assert: HTTP 200 · version: 0.5.15 · confirms parity surface live
```

**PASS condition:** All five curls return 200 and version strings confirm 0.5.15.
**FAIL condition:** Any non-200 · any version mismatch · stop · report to Bishop for CDN diagnosis. Knight does NOT re-deploy without understanding root cause.

Wave IV complete when all five curls PASS.

---

## §9 · RETURN PROTOCOL

When all four Waves are PASS, Knight returns the following compact receipt.

### Pearl emit

```
pearl marathon_9_v0_5_15_shipped
```

### Per-Wave status block

```
Wave I  VERSION BUMP: [AMBER|GREEN] · commit hash: [hash]
Wave II BUILD:        [AMBER|GREEN] · exe confirmed: MnemosyneC-Setup-0.5.15.exe
Wave III SHIP:        [AMBER|GREEN] · firebase deploy complete
Wave IV CDN VERIFY:   [AMBER|GREEN] · all 5 curls 200 · version 0.5.15 confirmed
```

### Artifact record

```
Feature branch: knight-marathon-9-v0-5-15-build-and-ship
Commit hash (version bump): [hash]
CDN URL (exe): https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.15.exe
CDN URL (latest.yml): https://mnemosynec.ai/download/latest.yml
CDN URL (download page): https://mnemosynec.ai/download/
```

### Mountains shipping in this binary

```
M1  · dr_m_orchestrator (substrate_reader · brain_swap · hex_mcode · dispatch_loop · minor_star_chamber · court_packages)
M1b · plow/ (domain_classifier · unfair_advantage · plow_loop)
M2  · scribes Wave I (reminder · wrasse · toolsmith · scribe_runner + canon_corpus stub + pearl/* + identity/ip_ledger + enforcement_council)
M3  · librarian_corps (pyramid_index · librarian · file_cabinet · dispatcher)
M3b · persistence wire-up
```

Push feature branch to origin after pearl emit.

---

## §10 · CLOSING

**Bishop watches CDN. Bishop NEVER re-builds or re-deploys.** If a CDN anomaly surfaces after Wave IV, Bishop reports it. Knight investigates and re-runs only if root cause is confirmed.

**Founder force-launches peers when Son arrives.** Each peer receives a 1-click Download prompt per autoDownload=false safety. No silent install. No exceptions.

**Once all 4 peers confirm v0.5.15:** Trial 02d substrate-seeding work and fire can proceed. That is the next milestone. This Marathon clears the path.

Mountains 1, 1b, 2, 3, and 3b are at the gate. Knight opens it.

---

*Help Each Other Help Ourselves.*
*FounderDenken / Crewman#6*
