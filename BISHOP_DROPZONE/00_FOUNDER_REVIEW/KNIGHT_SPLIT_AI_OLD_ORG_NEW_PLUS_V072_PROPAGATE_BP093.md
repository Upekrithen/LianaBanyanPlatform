# KNIGHT PASTE — SPLIT .AI (OLD) vs .ORG (NEW) + v0.7.2 PROPAGATE
## BP093 · SEG-AM · Sonnet 4.6 · §3 §14 §15 §17 BLOOD

**COMPOSER MODEL CHECK:** Claude Sonnet 4.6 · Bishop-authored · Knight executes only.
**STATUTE:** §17 BLOOD — use segs before every task. §14 BLOOD — gadget-first, no hallucination. §15 BLOOD — Supabase/DB direct is Bishop lane; Hugo/Firebase/build is Knight lane.
**NO BISHOP-DIRECT HUGO/FIREBASE DEPLOYS** per feedback_knight_is_operator_mechanic.

---

## PREAMBLE

Founder feedback BP093 morning: mnemosynec.org still shows v0.7.1 in gold banner (version_trust.json already updated to v0.7.2 in data/ but Hugo was not rebuilt + redeployed after Phase 3 close). Additionally, Phase 2 Phoenix-Flight design refresh (dc-savings-stats partial + Empress Campaign nav additions to mnemosynec-homepage.html) made the homepage taller — sticky alpha banner + nav + dark band + huge hero pushes headline + first paragraph below the fold. Founder direct: "keep the old version on .ai and we work on the new version as .org."

**Bishop SEG-AM empirical findings:**

| Item | Current State |
|------|---------------|
| firebase.json path | `Cephas/cephas-hugo/firebase.json` |
| Current `mnemosyne` target | `"public": "public-mnemosynec"` — serves BOTH .org and .ai (same deploy) |
| `.firebaserc` mnemosyne alias | `"mnemosyne": ["mnemosyne-lianabanyan"]` |
| `version_trust.json` top entry | `"version": "0.7.2"` · `"tier": "latest"` · `"release_date": "2026-06-24"` — **already correct in data/** |
| Pre-Phoenix-Flight last commit | `e9aa242` — "M25b v0.7.1: I12 IP Ledger Ring Bearer + Stamp-Certify + Mesh Diff Loop + My IP Ledger UI" |
| Phoenix-Flight design changes | `185cfd7` (P1 dc-savings-stats + 3 lines to mnemosynec-homepage.html) · `c41d300` (P3 Empress pages + 2 lines to mnemosynec-homepage.html) · `52a4552` · `ff1a054` |
| Current branch | `knight-mamba-phoenix-flight-bp092` |
| Hugo publishDir for .org | `public-mnemosynec` (from config-mnemosynec.toml) |
| Hugo config file | `config-mnemosynec.toml` |

**Root cause of v0.7.2 not showing:** Phase 3 built the .exe and updated `data/version_trust.json` but did NOT run `hugo --config config-mnemosynec.toml --destination public-mnemosynec` + `firebase deploy --only hosting:mnemosyne`.

---

## TASK 1 — CUT PRESERVATION BRANCH AT PRE-PHOENIX-FLIGHT COMMIT

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Confirm commit sha before cutting
git show e9aa242 --oneline | head -1

# Cut preservation branch from that commit
git branch preserve-pre-marathon-design-v0.7.1-bp093 e9aa242

# Confirm branch exists
git branch --list preserve-pre-marathon-design-v0.7.1-bp093
```

**§17 CHECK:** Confirm output shows `preserve-pre-marathon-design-v0.7.1-bp093` pointing to `e9aa242`. Do NOT checkout this branch — stay on `knight-mamba-phoenix-flight-bp092` for .org work.

---

## TASK 2 — BUILD .AI PRESERVED HUGO (OLD DESIGN → public-mnemosynec-ai/)

Build the pre-Phoenix-Flight design into a separate output directory without touching the working tree.

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Build from the preservation branch commit using git worktree (isolated, no checkout)
git worktree add ../cephas-hugo-ai-preserve preserve-pre-marathon-design-v0.7.1-bp093

# Build from the worktree — outputs to public-mnemosynec-ai/ inside the MAIN cephas-hugo dir
cd ../cephas-hugo-ai-preserve
hugo --config config-mnemosynec.toml --destination ../cephas-hugo/public-mnemosynec-ai

# Confirm output exists
ls ../cephas-hugo/public-mnemosynec-ai/index.html

# Remove worktree (clean up)
cd ../cephas-hugo
git worktree remove ../cephas-hugo-ai-preserve
```

**§17 CHECK:** Confirm `public-mnemosynec-ai/index.html` exists. Confirm output does NOT contain "dc-savings-stats" section (the Phoenix-Flight addition). Run:
```bash
# Should return empty (no dc-savings-stats in old design)
Select-String -Path "public-mnemosynec-ai/index.html" -Pattern "dc-savings-stats" -SimpleMatch | Measure-Object
```

---

## TASK 3 — ADD SECOND FIREBASE HOSTING TARGET

### 3A — Edit firebase.json

Add a new hosting entry for `mnemosynec-ai` target pointing to `public-mnemosynec-ai`.

Open `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\firebase.json`.

In the `"hosting"` array, APPEND this new entry AFTER the closing `}` of the existing `mnemosyne` block (before the final `]`):

```json
,
{
  "target": "mnemosynec-ai",
  "public": "public-mnemosynec-ai",
  "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
  "headers": [
    {
      "source": "**/*.html",
      "headers": [{"key": "Cache-Control", "value": "max-age=300"}]
    },
    {
      "source": "**/*.css",
      "headers": [{"key": "Cache-Control", "value": "max-age=86400"}]
    },
    {
      "source": "**/*.js",
      "headers": [{"key": "Cache-Control", "value": "max-age=86400"}]
    },
    {
      "source": "/download/**.exe",
      "headers": [
        {"key": "Content-Disposition", "value": "attachment"},
        {"key": "Content-Type", "value": "application/octet-stream"},
        {"key": "Cache-Control", "value": "public, max-age=3600"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-LB-Version", "value": "v0.1.0"},
        {"key": "X-LB-Phase", "value": "preserve"}
      ]
    }
  ]
}
```

**Verify** the final firebase.json is valid JSON:
```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
node -e "JSON.parse(require('fs').readFileSync('firebase.json','utf8')); console.log('JSON valid')"
```

### 3B — Edit .firebaserc

Open `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\.firebaserc`.

In the `"hosting"` object under `"lianabanyan-403dc"`, add the new target alias. The existing block is:
```json
"hosting": {
  "cephas": ["cephas-lianabanyan"],
  "museum": ["lianabanyan-museum"],
  "mnemosyne": ["mnemosyne-lianabanyan"]
}
```

Change it to:
```json
"hosting": {
  "cephas": ["cephas-lianabanyan"],
  "museum": ["lianabanyan-museum"],
  "mnemosyne": ["mnemosyne-lianabanyan"],
  "mnemosynec-ai": ["mnemosynec-ai-lianabanyan"]
}
```

**IMPORTANT — Firebase Console prerequisite:** Before `firebase deploy --only hosting:mnemosynec-ai` will work, Knight must apply the target alias in Firebase Console OR via CLI:

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Apply target: links Firebase hosting site "mnemosynec-ai-lianabanyan" to local alias "mnemosynec-ai"
# Note: "mnemosynec-ai-lianabanyan" must be an EXISTING Firebase hosting site in the lianabanyan-403dc project.
# If it does NOT exist yet, create it first:
firebase hosting:sites:create mnemosynec-ai-lianabanyan --project lianabanyan-403dc

# Then apply the target
firebase target:apply hosting mnemosynec-ai mnemosynec-ai-lianabanyan --project lianabanyan-403dc

# Confirm target listing
firebase target:list --project lianabanyan-403dc
```

**§17 CHECK:** Confirm `firebase target:list` shows both `mnemosyne → mnemosyne-lianabanyan` AND `mnemosynec-ai → mnemosynec-ai-lianabanyan`. Do NOT proceed to deploy until both are confirmed.

**DNS NOTE:** mnemosynec.ai must be pointed to Firebase via custom domain config on `mnemosynec-ai-lianabanyan`. Run:
```bash
firebase hosting:channel:list --site mnemosynec-ai-lianabanyan
```
If the .ai domain is not yet wired to this new site, Founder must add it in Firebase Console → Hosting → `mnemosynec-ai-lianabanyan` → Add custom domain → `mnemosynec.ai`. DNS propagation may take up to 24h. This is a Founder action — NOT a Knight action.

---

## TASK 4 — UPDATE .ORG HUGO BUILD (v0.7.2 — ALREADY IN version_trust.json)

Bishop SEG confirmed `data/version_trust.json` already has v0.7.2 as `"tier": "latest"`. No data file edit needed. Knight just needs to rebuild Hugo.

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Full Hugo rebuild for .org (v2 design + v0.7.2 version_trust.json propagated into HTML)
hugo --config config-mnemosynec.toml --destination public-mnemosynec

# Confirm build completed without errors — exit code must be 0
echo "Hugo exit code: $LASTEXITCODE"

# Spot-check version in output
Select-String -Path "public-mnemosynec/index.html" -Pattern "0\.7\.2" | Select-Object -First 3
```

**§17 CHECK:** Confirm Hugo exits 0 AND `public-mnemosynec/index.html` contains `0.7.2`. If grep returns empty, the Hugo template is not reading version_trust.json correctly — STOP and surface to Bishop.

---

## TASK 5 — DEPLOY BOTH TARGETS

Deploy .org first (simpler — existing target, just a rebuild):

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo

# Deploy .org (v2 design + v0.7.2)
firebase deploy --only hosting:mnemosyne --project lianabanyan-403dc

# Wait for full exit + hosting URL confirmation
```

Then deploy .ai (preserved old design):

```bash
# Deploy .ai (preserved pre-Phoenix-Flight design + v0.7.1)
firebase deploy --only hosting:mnemosynec-ai --project lianabanyan-403dc
```

**§17 CHECK:** Both deploys must exit 0. Record the "Hosting URL" line from each deploy output for the Yoke Return.

---

## TASK 6 — EMPIRICAL VERIFICATION (6 CURLS)

Run all 6 after both deploys complete:

```bash
# 1. .org returns 200
curl -sI https://mnemosynec.org/ | Select-String "HTTP/"

# 2. .org body contains v0.7.2
curl -s https://mnemosynec.org/ | Select-String "0\.7\.2" | Select-Object -First 2

# 3. .org version_trust.json returns 0.7.2 as latest tier
curl -s https://mnemosynec.org/version_trust.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.versions[0].version, d.versions[0].tier)"

# 4. .ai returns 200
curl -sI https://mnemosynec.ai/ | Select-String "HTTP/"

# 5. .ai body contains v0.7.1 (old preserved design marker)
curl -s https://mnemosynec.ai/ | Select-String "0\.7\.1" | Select-Object -First 2

# 6. .ai body does NOT contain dc-savings-stats (Phoenix-Flight addition absent from old design)
curl -s https://mnemosynec.ai/ | Select-String "dc-savings-stats" | Measure-Object
```

**PASS criteria:**
- Curls 1+4: HTTP/2 200 (or HTTP/1.1 200)
- Curl 2: at least 1 match for "0.7.2"
- Curl 3: prints `0.7.2 latest`
- Curl 5: at least 1 match for "0.7.1"
- Curl 6: Count = 0 (dc-savings-stats absent on .ai)

**ETag split confirmation** (bonus — proves the two sites are now diverged):
```bash
$etag_org = (curl -sI https://mnemosynec.org/ | Select-String "etag").ToString()
$etag_ai  = (curl -sI https://mnemosynec.ai/  | Select-String "etag").ToString()
if ($etag_org -ne $etag_ai) { "SPLIT CONFIRMED — ETags differ" } else { "WARNING — ETags same, sites may still be aliased" }
```

---

## TASK 7 — YOKE RETURN

Write to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_SPLIT_AI_ORG_V072_BP093.md`

Required fields:

```
YOKE RETURN — SPLIT .AI/.ORG + v0.7.2 PROPAGATE — BP093

PRESERVATION BRANCH SHA: <git rev-parse preserve-pre-marathon-design-v0.7.1-bp093>
PRESERVATION BRANCH NAME: preserve-pre-marathon-design-v0.7.1-bp093

FIREBASE DEPLOY .ORG: <Hosting URL from mnemosyne deploy>
FIREBASE DEPLOY .AI:  <Hosting URL from mnemosynec-ai deploy — "PENDING DNS" if domain not yet wired>

CURL 1 (.org 200):   <result>
CURL 2 (.org v0.7.2 body): <result>
CURL 3 (version_trust latest): <result>
CURL 4 (.ai 200):    <result>
CURL 5 (.ai v0.7.1 body): <result>
CURL 6 (.ai no dc-savings-stats): Count = <n>
ETAG SPLIT: <CONFIRMED / WARNING>

DNS NOTE: mnemosynec.ai custom domain — <WIRED / PENDING FOUNDER ACTION IN FIREBASE CONSOLE>

ELECTRON_TOUCHED: NO
HUGO_REBUILT: YES — public-mnemosynec (v0.7.2) + public-mnemosynec-ai (v0.7.1 preserved)
FIREBASE_JSON_EDITED: YES — added mnemosynec-ai target
FIREBASERC_EDITED: YES — added mnemosynec-ai alias
```

---

## §14 §15 §17 BLOOD INLINE REMINDERS

- **§14:** Never claim a deploy succeeded without empirical curl confirmation.
- **§15:** Supabase migrations are Bishop-direct. Hugo build + Firebase deploy = Knight lane ONLY.
- **§17:** Run git show on `e9aa242` before cutting the branch to confirm it is the correct pre-Phoenix-Flight sha. Do not guess.
- **POSTGRES ONLY** per canon_knight_sql_target_postgres_syntax_only — if any SQL runs in this task, no SQLite primitives.
- **NO AUTO-SEND** — Founder reviews Yoke Return before any further action.
- **TRUTH-ALWAYS** — If the Firebase site `mnemosynec-ai-lianabanyan` does not exist in the project, report BLOCKED with exact error; do not invent a workaround.
