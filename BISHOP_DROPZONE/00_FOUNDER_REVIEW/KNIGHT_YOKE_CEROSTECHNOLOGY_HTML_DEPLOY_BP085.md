# KNIGHT YOKE · CerosTechnology.com HTML Deploy · Pawn Build to Live · BP085

**Issued by:** Bishop (Sonnet 4.6 SEG)
**Date:** 2026-06-17
**BP:** BP085
**Status:** PASTE-READY — Founder Review Pending (DNS gate at SEG-5)
**Composes with:** `KNIGHT_YOKE_CEROSTECHNOLOGY_REBUILD_BECOME_THE_BOSS_BP085.md` — this yoke is the SHORTCUT path; the 8-SEG rebuild yoke is superseded for deploy purposes now that Pawn delivered a near-publish-ready build.

---

## PREAMBLE

**Sonnet 4.6 mandate (verbatim — HARD BINDING):**
> "Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report 'Sonnet 4.6' verbatim. BP081 BLOOD."

**Scope:** Deploy Pawn's single-file CT.com build (`C:\Users\Administrator\Downloads\cerostechnology.html`) to cerostechnology.com via Firebase Hosting. The Pawn build is the content source of record. Knight does NOT rewrite content or styling — surgical canon fixes only if the parallel Bishop audit flagged specific drift. Once staged, wire the Firebase custom domain + surface DNS records for Founder to add in Squarespace.

**Truth-Always layer:** Do not assume the Pawn build is clean just because it was delivered. Read the Bishop audit if present. If no audit file exists, do a fast self-audit against the 5 mandatory literals before staging. Never deploy content you haven't verified against the required verbatims.

**NEVER SCROLL SIDEWAYS canon (BP081 HARD BINDING):** No `overflow-x: scroll` or `overflow-x: auto` on any element at any viewport. Flex-wrap, vertical stacks, responsive collapse only.

---

## SEG DECOMPOSITION

SEG-1 and SEG-2 run in parallel. SEG-3 gates on both completing. SEG-4 gates on SEG-3. SEG-5 gates on SEG-4 + Founder DNS confirmation. SEG-6 gates on SEG-5 + domain propagation.

---

### SEG-1 · Recon — Current cerostechnology.com Hosting State

**Goal:** Ground truth on what exists before touching anything.

**Steps:**

1. **Firebase state.** The project is `lianabanyan-403dc` (confirmed in `.firebaserc`). Check whether a `ceros-technology` hosting site already exists:
   ```
   firebase hosting:sites:list --project lianabanyan-403dc
   ```
   Record output verbatim. Note whether `ceros-technology` appears.

2. **DNS state.** Run:
   ```
   nslookup cerostechnology.com
   ```
   and:
   ```
   curl -s -o /dev/null -w "%{http_code}" https://cerostechnology.com
   ```
   Record: current HTTP status, any IP addresses returned, any CNAME. If Squarespace placeholder is serving, note the Squarespace IP range. If Firebase is already serving, note which site.

3. **Local disk check.** Search for any existing cerostechnology site folder:
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\` — any `ceros*` folder
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\business-trunk\` contents
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\` — any cerostechnology subfolder

4. **Confirm Pawn build exists:** verify `C:\Users\Administrator\Downloads\cerostechnology.html` is present and non-empty (`Get-Item` size check).

**Output:** Write `CEROSTECH_DEPLOY_RECON_BP085.md` to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` containing:
- Firebase: `ceros-technology` site exists? (YES/NO)
- DNS: current state + HTTP status
- Local disk: any existing ceros site folder (path or NONE)
- Pawn build: file size in bytes

**SEG-1 is a gate for SEG-3.** Do not proceed to SEG-3 until this file is written.

---

### SEG-2 · Read Bishop Audit Results

**Goal:** Determine whether the Pawn build needs any surgical canon fixes before staging.

**Steps:**

1. **Check for audit file.** Scan `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` for any file matching:
   - `*BISHOP_AUDIT*CEROS*`
   - `*AUDIT*cerostechnology*`
   - `*CT_AUDIT*`
   - `*CEROSTECH*AUDIT*`
   Also check `C:\Users\Administrator\Documents\LianaBanyanPlatform\PAWN_DROPZONE\` for any audit output.

2. **If audit file found:** Read it in full. Extract all flagged items. Categorize each as:
   - FORBIDDEN WORD violation (must fix before deploy)
   - WRONG VERBATIM number/phrase (must fix before deploy)
   - WRONG SIGNATURE SPACING (must fix before deploy)
   - STYLE/LAYOUT issue (fix if trivial, defer if complex)
   - CLEAN (no fix needed)

3. **If no audit file found:** Perform a self-audit of `C:\Users\Administrator\Downloads\cerostechnology.html`. Check these 5 mandatory literals using PowerShell `Select-String` — each must appear verbatim:
   - `83.3%` (not "83" or "~83%" or "eighty-three")
   - `$5/year` (exact — not "$5 per year" or "$5/yr")
   - `Pledge #2260` (exact — not "Pledge 2260" or "#2260")
   - `Boarding Declaration` (must appear — framing gate)
   - `NOID` (must appear — NOIDs card gate)
   Also check: `overflow-x: scroll` must NOT appear anywhere.

4. **Apply surgical fixes.** If fixes are needed, open `cerostechnology.html` in a SEG, apply the minimum necessary edits (find-and-replace on exact strings), save to the same path. Log every change made with before/after strings.

5. **If clean (no fixes needed):** Proceed directly, noting "Bishop audit CLEAN — no fixes applied."

**Output:** Write `CEROSTECH_AUDIT_RESULT_BP085.md` to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` containing:
- Audit source: Bishop file (path) OR self-audit
- Fixes applied: list with before/after, OR "NONE — CLEAN"
- Final status: READY TO STAGE or BLOCKED (with blocker description)

**SEG-2 is a gate for SEG-3.** Do not proceed to SEG-3 if status is BLOCKED.

---

### SEG-3 · Stage the HTML

**Goal:** Copy the (optionally patched) Pawn build into the correct deploy source directory.

**Context:** Firebase Hosting for this project uses target-based deploys. Each target points to a Firebase Hosting site. Static sites with a single HTML file use a `public/` directory. The pattern used by existing targets (main, dotcom, biz, etc.) is a shared `dist/` build. For a standalone static HTML, the simplest correct pattern is a dedicated `public/` directory per site — not shared with the SPA build output.

**Steps:**

1. **Create staging directory:**
   ```
   New-Item -ItemType Directory -Force -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\ceros-public"
   ```

2. **Copy Pawn build as index.html:**
   ```
   Copy-Item "C:\Users\Administrator\Downloads\cerostechnology.html" `
     "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\ceros-public\index.html" -Force
   ```

3. **Verify copy:** `Get-Item` the destination and confirm size matches source.

4. **Add `ceros-technology` hosting target to `.firebaserc`:** The current `.firebaserc` is at `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\.firebaserc`. It uses project `lianabanyan-403dc`. Add a new entry under `lianabanyan-403dc` → `hosting`:
   ```json
   "cerostechnology": [
     "ceros-technology"
   ]
   ```
   Use an Edit SEG to add this entry. The Firebase site ID to create will be `ceros-technology` (hyphens, Firebase convention). The target alias will be `cerostechnology` (no hyphens, matching the domain).

5. **Add `ceros-technology` hosting block to `firebase.json`:** Add a new hosting entry:
   ```json
   {
     "target": "cerostechnology",
     "public": "ceros-public",
     "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
     "headers": [
       {
         "source": "**",
         "headers": [
           { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
           { "key": "X-Content-Type-Options", "value": "nosniff" }
         ]
       },
       {
         "source": "index.html",
         "headers": [
           { "key": "Content-Type", "value": "text/html; charset=UTF-8" },
           { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
         ]
       }
     ]
   }
   ```
   This is a static single-file site — no SPA rewrites needed.

6. **Stage complete check:** confirm `ceros-public/index.html` exists + `.firebaserc` has `cerostechnology` entry + `firebase.json` has `cerostechnology` target block.

**Output:** Write `CEROSTECH_STAGE_RESULT_BP085.md` to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` — staging path, file size, config changes confirmed.

---

### SEG-4 · Firebase Site Create + Deploy

**Goal:** Create the Firebase Hosting site if needed and deploy the staged HTML.

**Steps:**

1. **CD to platform directory:**
   All Firebase CLI commands run from `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`.

2. **Create Firebase Hosting site (if not already exists from SEG-1):**
   ```
   firebase hosting:sites:create ceros-technology --project lianabanyan-403dc
   ```
   If the site already exists, this will return an error — that is fine, proceed. Log the output either way.

3. **Apply the hosting target:**
   ```
   firebase target:apply hosting cerostechnology ceros-technology --project lianabanyan-403dc
   ```
   This links the alias `cerostechnology` to the Firebase site ID `ceros-technology`.

4. **Deploy:**
   ```
   firebase deploy --only hosting:cerostechnology --project lianabanyan-403dc
   ```
   Capture full output. Expect: `Deploy complete!` + a hosting URL like `https://ceros-technology.web.app`.

5. **Verify deploy exit 0.** If non-zero exit: read error output in full, diagnose root cause, apply fix, retry once. If second attempt fails: STOP, write failure note to `CEROSTECH_DEPLOY_RESULT_BP085.md`, surface to Founder.

6. **Smoke test the web.app URL:**
   ```
   curl -s -o /dev/null -w "%{http_code}" https://ceros-technology.web.app
   ```
   Must return 200. Also verify content:
   ```
   curl -s https://ceros-technology.web.app | Select-String "Permission to Board", "NOID", "97.1", "5/year", "2260"
   ```
   All 5 must match.

**Output:** Write `CEROSTECH_DEPLOY_RESULT_BP085.md` to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` containing:
- Firebase site create: output
- firebase target:apply: output
- Deploy: exit code + URL
- web.app smoke test: HTTP status + 5 content matches (PASS/FAIL each)

**SEG-4 is a gate for SEG-5.** Do not proceed if deploy exit code was non-zero or smoke test failed.

---

### SEG-5 · Custom Domain Wiring (Founder DNS Gate)

**Goal:** Wire `cerostechnology.com` to the Firebase Hosting site. This SEG surfaces DNS records for Founder to add — Knight does NOT have access to the Squarespace DNS console.

**Steps:**

1. **Initiate Firebase Custom Domain:**
   ```
   firebase hosting:channel:list --project lianabanyan-403dc
   ```
   Then open the Firebase Console custom domain wizard programmatically:
   ```
   firebase hosting:sites:get ceros-technology --project lianabanyan-403dc
   ```
   Note: The Firebase CLI `hosting:domain` command flow varies by CLI version. The canonical path is:
   - Firebase Console → Hosting → `ceros-technology` site → Add custom domain → enter `cerostechnology.com`
   - Firebase will provide a TXT record for domain ownership verification + two A records for the domain.
   
   Run this CLI command to begin the domain add flow:
   ```
   firebase hosting:channel:deploy live --only hosting:cerostechnology --project lianabanyan-403dc
   ```
   Then check the Firebase Console UI for the DNS records it generates.

2. **Retrieve DNS records.** The standard Firebase Hosting DNS records for a custom domain are:
   - **TXT record** (for ownership verification): `firebase-site-verification=[token]` at root `@`
   - **A records** (two IPs for Firebase CDN): typically `151.101.1.195` and `151.101.65.195` at root `@`
   - **WWW CNAME** (if www redirect desired): `cerostechnology.com` → `ceros-technology.web.app`

   Surface the EXACT records from the Firebase Console — do not guess IPs. If CLI does not return them, note that Founder must visit Firebase Console → Hosting → ceros-technology → Add custom domain → cerostechnology.com to get the exact TXT + A record values.

3. **PAUSE. Surface to Founder:**

   ---
   **FOUNDER DNS ACTION REQUIRED**

   Knight has deployed the site to: `https://ceros-technology.web.app` (live and verified above).

   To connect `cerostechnology.com` you need to add these DNS records in your Squarespace DNS console (Domains → cerostechnology.com → DNS Settings → Custom Records):

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | TXT  | @    | [from Firebase Console] | 3600 |
   | A    | @    | 151.101.1.195 | 3600 |
   | A    | @    | 151.101.65.195 | 3600 |
   | CNAME | www | ceros-technology.web.app. | 3600 |

   **Step 1:** Visit Firebase Console → Hosting → ceros-technology → "Add custom domain" → enter `cerostechnology.com` → copy the TXT verification token shown.
   **Step 2:** Add the TXT record + both A records + CNAME in Squarespace DNS.
   **Step 3:** Return here and confirm "DNS records added" to proceed to SEG-6.

   DNS propagation typically takes 15 minutes to 4 hours. SSL provisioning by Firebase after domain verification takes up to 24 hours.

   ---

4. **Do not proceed to SEG-6 until Founder confirms DNS records are added.**

**Output:** Write `CEROSTECH_DNS_GATE_BP085.md` to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` containing:
- web.app URL (live)
- DNS records surfaced (exact values from Firebase Console, or placeholder if CLI could not retrieve)
- Status: WAITING ON FOUNDER DNS CONFIRMATION

---

### SEG-6 · Live Verify + 6 Sharps

**Prerequisites:** Founder has confirmed DNS records added. Allow at least 15 minutes before beginning verification. If domain does not resolve after 4 hours, diagnose DNS propagation — do not assume Firebase misconfiguration.

**Steps:**

1. **HTTP 200 check:**
   ```
   curl -s -o /dev/null -w "%{http_code}" https://cerostechnology.com
   ```
   Must return 200. If 301/302, follow redirect. If 000 (connection refused), DNS has not propagated — wait and retry.

2. **SSL check:**
   ```
   curl -vI https://cerostechnology.com 2>&1 | Select-String "SSL certificate verify ok", "issuer", "expire"
   ```
   Must show valid certificate issued by Firebase/Let's Encrypt.

3. **Content verification — 5 mandatory literals:**
   ```powershell
   $content = curl -s https://cerostechnology.com
   @("Permission to Board", "NOID", "97.1", "5/year", "2260") | ForEach-Object {
     if ($content -match [regex]::Escape($_)) { "PASS: $_" } else { "FAIL: $_" }
   }
   ```
   All 5 must PASS.

4. **No horizontal scroll check:**
   ```powershell
   $content = curl -s https://cerostechnology.com
   if ($content -match "overflow-x:\s*(scroll|auto)") { "FAIL: overflow-x found" } else { "PASS: no overflow-x" }
   ```
   Must PASS.

5. **Mobile responsive check (structural):**
   ```powershell
   $content = curl -s https://cerostechnology.com
   if ($content -match 'viewport.*width=device-width') { "PASS: viewport meta present" } else { "FAIL: viewport meta missing" }
   ```
   Must PASS. Full visual mobile check is a Founder action — open cerostechnology.com on a phone after DNS propagates.

6. **Checkout modal gate (advisory):** The 3 checkout modals (PM Boarding · Code Breaker · PROV_23) reference Stripe. If Stripe publishable key (`pk_live_`) is hardcoded in the HTML, verify it is the correct key. If the modals depend on the same Edge Functions as mnemosynec.ai, they will function once the Edge Functions are live. This is an advisory check — do not block deploy on modal backend wiring; surface as a follow-on task if Edge Functions are not yet wired.

**Output:** Write `CEROSTECH_LIVE_VERIFY_BP085.md` to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` containing the Sharps table below with PASS/FAIL per row.

---

## SHARPS RETURN TABLE

Knight fills this table in Yoke-Return. All 6 must be GREEN for the yoke to be marked COMPLETE.

| # | Sharp | Pass Condition | Status |
|---|-------|----------------|--------|
| S1 | Firebase deploy exit 0 + web.app 200 | `firebase deploy` exits 0 · `https://ceros-technology.web.app` returns HTTP 200 | — |
| S2 | 5 mandatory literals present | "Permission to Board" + "NOID" + "97.1%" + "$5/year" + "Pledge #2260" all found via grep | — |
| S3 | No horizontal scroll | Zero instances of `overflow-x: scroll` or `overflow-x: auto` in deployed HTML | — |
| S4 | DNS records surfaced for Founder | TXT + A + CNAME values written to `CEROSTECH_DNS_GATE_BP085.md` | — |
| S5 | cerostechnology.com returns HTTP 200 + valid SSL | curl 200 · SSL cert valid (after DNS propagation) | — |
| S6 | Mobile viewport meta present | `<meta name="viewport" content="width=device-width` found in served HTML | — |

---

## TRUTH-ALWAYS LAYER

- If any Sharp is RED, Knight writes the failure honestly to the Yoke-Return. Do not mark a Sharp GREEN on optimism.
- S4 (DNS records) is surfaced in this yoke but fulfilled by Founder. Knight marks S4 GREEN when the Firebase Console shows the DNS records and Knight has written them to disk — not after DNS propagates. Propagation is on Founder's timeline.
- S5 gates on DNS propagation (up to 24h for SSL). Knight may deliver the Yoke-Return with S5 PENDING and update the file after propagation confirms.
- Stripe/Edge Function wiring for checkout modals is out of scope for this yoke. If modals are broken, Knight creates a follow-on task — does not block the live-verify Sharp.
- If the Bishop audit file arrives after SEG-2 self-audit is already complete, Knight reads it anyway and applies any fixes it found that the self-audit missed. Truth-Always > "already checked."

---

## WAN-RELAY / THORAX CANON NOTE

cerostechnology.com is a CT Member Business site — it does NOT host a cooperative relay node. No Thorax heartbeat wiring is needed for this deploy. Thorax heartbeat canon (fork/derivative cooperative access) applies when a derivative wants to reach the Cooperative Node Frontier — a standalone marketing/portal site is exempt. Knight does not add heartbeat endpoints to this deploy.

---

## DISTRIBUTION CANON (BP081 BLOOD)

Firebase Hosting is the PRIMARY self-host channel. After deploy, Knight optionally mirrors the `cerostechnology.html` source to the canonical GitHub repo (`LianaBanyanPlatform` or a dedicated `ceros-technology-site` repo) as the fallback — not a prerequisite to go live. Pattern: PRIMARY = `https://cerostechnology.com` (Firebase) · FALLBACK = GitHub raw URL or GitHub Pages if Founder wants it. Founder decides on GitHub fallback scope.

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Yoke: KNIGHT_YOKE_CEROSTECHNOLOGY_HTML_DEPLOY_BP085
Path: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_CEROSTECHNOLOGY_HTML_DEPLOY_BP085.md

Read the yoke. Execute 6 SEGs. This is a SHORTCUT deploy path — Pawn delivered a near-ready single-file build. Your job is integrate + verify + deploy, not rebuild.

CRITICAL SEQUENCE:
- SEG-1 (recon) and SEG-2 (audit) run in parallel first
- SEG-3 (stage) gates on BOTH SEG-1 and SEG-2 clean
- SEG-4 (deploy) gates on SEG-3
- SEG-5 (DNS) gates on SEG-4 + requires FOUNDER DNS ACTION — surface records, pause, wait for Founder confirmation
- SEG-6 (live verify) gates on SEG-5 + DNS propagation

Firebase project: lianabanyan-403dc
Platform dir: C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\
Pawn build source: C:\Users\Administrator\Downloads\cerostechnology.html
Target staging dir: C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\ceros-public\
Firebase site ID to create: ceros-technology
Firebase target alias: cerostechnology

DO NOT overwrite Pawn content or styling. Surgical fixes ONLY if SEG-2 audit flags specific drift.
DO NOT deploy if any mandatory literal fails verification (83.3% · $5/year · Pledge #2260 · Boarding Declaration · NOID).
DO surface DNS records at SEG-5 and STOP — do not try to access Squarespace DNS console yourself.

Return YOKE_RETURN_CEROSTECHNOLOGY_HTML_DEPLOY_BP085.md to BISHOP_DROPZONE/00_FOUNDER_REVIEW/ with all 6 Sharps filled.
Sonnet 4.6 verbatim in your return.
```

---

*Yoke composed by Bishop (Sonnet 4.6 SEG) · BP085 · 2026-06-17*
