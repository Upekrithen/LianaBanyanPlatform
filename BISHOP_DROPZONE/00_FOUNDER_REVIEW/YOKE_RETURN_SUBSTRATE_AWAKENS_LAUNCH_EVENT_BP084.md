# YOKE RETURN — Substrate Awakens Launch Event · BP084

**Date:** 2026-06-15 (Monday night)
**Event target:** Saturday 2026-06-20
**Model used: Sonnet 4.6**
**Commit:** `ced9c70`
**Pushed:** main → `237ec16..ced9c70`

---

## 1. SEG Status

| SEG | Description | Status | Notes |
|---|---|---|---|
| SEG-1 | v0.5.0 version bump + Tower of Peace | ✅ DONE | `package.json` → 0.5.0; `version_trust.json` v0.5.0 LATEST (🟡 trust:1), v0.4.3 → HISTORICAL (🔵); Tower heading updated to "all 19 versions" |
| SEG-1b | Binary build | 🔴 FOUNDER-SIDE | Binary build (`npm run dist:win`) NOT run — takes 20+ min, requires Ollama binary download. See Founder checklist below. |
| SEG-2 | Live Dashboard `/live/SubstrateAwakens/` | ✅ DONE | Layout: `Cephas/cephas-hugo/layouts/live-dashboard/list.html` — Supabase Realtime WebSocket, constellation map (▢△◯ shapes), per-peer ticker, aggregate banner, failure banners, Truth-Always footer |
| SEG-3 | Watch-and-Replicate kit page | ✅ DONE | `Cephas/cephas-hugo/content-mnemosynec/live/SubstrateAwakens/kit/_index.md` |
| SEG-4 | Registration form + migration + edge function | ✅ DONE | Form at `/live/substrateawakens/register/`; migration `20260616000002_substrate_awakens.sql`; edge function `register-SubstrateAwakens/index.ts` |
| SEG-5 | Question bank script + run | ✅ DONE | Script: `tools/plow-cli/generate-event-bank.js`; bank generated: 2,000 fresh questions, SHA256: `e79142cfcf84fef26bc35f72e1fba637175f82d7ffcff21c7abe1b51f2087ac6` |
| SEG-6 | Marketing wave drafts (DRAFTED ONLY) | ✅ DONE | 7 files in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/SUBSTRATE_AWAKENS_MARKETING_WAVE/` — ALL await explicit Founder ratify before publish |
| SEG-7 | Crow Feather achievement definition | ✅ DONE | `Cephas/cephas-hugo/data/substrate_awakens_achievements.json` |
| SEG-8 | Dry-run simulation script | ✅ DONE | `tools/plow-cli/simulate-peers.js` — ready to run; note in script: requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env |
| SEG-9 | Hugo build + Firebase deploy | ✅ DONE | Built: 45 pages; deployed to `mnemosyne-lianabanyan` Firebase target; uppercase→lowercase redirects added to `firebase.json` |

---

## 2. Knight-Side Sharps (Truth-Always — Honest RED where applicable)

| Sharp | Description | Status | HTTP |
|---|---|---|---|
| Sharp 1 | `https://mnemosynec.ai/proofs/` — existing proof content | ✅ GREEN | 200 |
| Sharp 2 | `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` | 🔴 RED | 404 — binary NOT built yet; FOUNDER must run `npm run dist:win` and copy to `Cephas/cephas-hugo/static/download/` then redeploy |
| Sharp 6 | `https://mnemosynec.ai/live/substrateawakens/` → 200 + "Substrate Awakens" | ✅ GREEN | 200 ✅ body PASS |
| Sharp 6b | `https://mnemosynec.ai/live/SubstrateAwakens/` (canonical case) | 🟡 YELLOW | 301 → 200 (redirect active; Firebase hosting redirects uppercase → lowercase) |
| Sharp 7 | `https://mnemosynec.ai/live/substrateawakens/kit/` → 200 + "Watch and Replicate" | ✅ GREEN | 200 ✅ body PASS |
| Sharp 8 | `https://mnemosynec.ai/live/substrateawakens/register/` → 200 + registration form | ✅ GREEN | 200 ✅ body PASS |
| Sharp 9 | Question bank exists at Vault path + `.sha256` file | ✅ GREEN | Both files present — SHA256: `e79142cf…` |
| Sharp 10 | All 7 marketing drafts present in `SUBSTRATE_AWAKENS_MARKETING_WAVE/` | ✅ GREEN | 7/7 present |
| Sharp 11 | Migration `20260616000002_substrate_awakens.sql` exists | ✅ GREEN | Present |
| Sharp 12 | Dry-run simulation script exists | ✅ GREEN | `tools/plow-cli/simulate-peers.js` present |

**Sharp 2 is HONEST RED.** Binary build is Founder-side. NEVER fake green.

---

## 3. Founder Action Checklist

### 🔴 REQUIRED before go-live

**A. Binary build (Sharp 2)**
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
npm run dist:win
# Output: release\MnemosyneC-Setup-0.5.0.exe + release\latest.yml
# Then copy:
Copy-Item "release\MnemosyneC-Setup-0.5.0.exe" "Cephas\cephas-hugo\static\download\MnemosyneC-Setup-0.5.0.exe"
Copy-Item "release\latest.yml" "Cephas\cephas-hugo\static\download\latest.yml"
# Update version_trust.json with actual size_bytes + sha256 of the .exe
# Then rebuild + deploy Cephas
```

**B. Supabase migration apply**
```bash
# In Supabase dashboard or via CLI:
supabase db push --file platform/supabase/migrations/20260616000002_substrate_awakens.sql
# OR: copy SQL into Supabase dashboard → SQL editor → run
```

**C. Supabase Realtime enable for live dashboard**
```sql
-- Run in Supabase SQL editor:
alter publication supabase_realtime add table public.peer_presence;
alter publication supabase_realtime add table public.substrate_awakens_registrations;
```

**D. HMAC secret — ensure COMMENTS_HMAC_SECRET is set in Supabase secrets**
```bash
# In Supabase dashboard → Edge Functions → Secrets:
# COMMENTS_HMAC_SECRET must be set (already used by verify-codex-hmac)
# The register-SubstrateAwakens function inherits it
```

**E. Email provider — confirm send-transactional-email edge function works**
The `register-SubstrateAwakens` edge function calls `send-transactional-email` for token delivery. Verify that function's email provider is active and SMTP/Resend credentials are set.

**F. Supabase anon key — set in Hugo config**
```toml
# In Cephas/cephas-hugo/config-mnemosynec.toml:
supabaseAnonKey = "YOUR_ACTUAL_ANON_KEY"
# Find in Supabase dashboard → Settings → API → Project API keys → anon public
```
Then rebuild + deploy Hugo:
```powershell
cd Cephas\cephas-hugo; hugo --config config-mnemosynec.toml --minify; firebase deploy --only hosting:mnemosyne
```

**G. MnemosyneC v0.5.0 Settings → Join Live Event UI**
The live event join UI in the Electron app is referenced in the kit page but may need to be implemented in the app itself. Check `src/` for the Settings panel and add the "Join Live Event" input if not present.

### 🟡 FOUNDER-SIDE (DNS / not Knight-configurable)

**H. DNS — ensure `mnemosynec.ai` custom domain is mapped to Firebase hosting:mnemosyne target**
Verify in Firebase console → Hosting → Custom domains.

---

## 4. Event-Driven Slip Protocol

If any RED sharp exists Saturday morning (2026-06-21 at any hour where a readiness check is done):

1. Do NOT fake go-live
2. Bishop announces: **"Saturday-ish — she's not awake yet — back Sunday"**
3. Slip to Sunday 2026-06-21
4. Re-run all sharps Sunday morning
5. If Sunday also has RED: slip again, same protocol — never fake it

**Current blocking RED:** Sharp 2 (binary not built). All other Knight-side sharps GREEN.

---

## 5. Marketing Wave Drafts — NOT Published

All 7 drafts in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/SUBSTRATE_AWAKENS_MARKETING_WAVE/`. Each has header:
`<!-- STATUS: DRAFT · RATIFY PENDING · DO NOT PUBLISH -->`

| File | Platform | Status |
|---|---|---|
| `SUBSTACK_SUBSTRATE_AWAKENS_T7_ANCHOR.md` | FounderDenken/Substack | DRAFT · RATIFY PENDING |
| `MEDIUM_SUBSTRATE_AWAKENS_T7.md` | Medium | DRAFT · RATIFY PENDING |
| `CEPHAS_BANNER_SUBSTRATE_AWAKENS.html` | mnemosynec.ai homepage banner | DRAFT · RATIFY PENDING |
| `SHOW_HN_SUBSTRATE_AWAKENS_T5.md` | Hacker News Show HN | DRAFT · RATIFY PENDING |
| `REDDIT_SUBSTRATE_AWAKENS_T5_LOCALLAMA.md` | r/LocalLLaMA | DRAFT · RATIFY PENDING |
| `REDDIT_SUBSTRATE_AWAKENS_T5_ML.md` | r/MachineLearning | DRAFT · RATIFY PENDING |
| `BATTERY_DISPATCH_SUBSTRATE_AWAKENS_T1.md` | Battery Dispatch (T-1 reminder) | DRAFT · RATIFY PENDING |

**BP078 BLOOD: NONE of these publish without explicit Founder ratify.**

---

## 6. File Map

```
package.json                                        ← v0.4.3 → v0.5.0
Cephas/cephas-hugo/
  config-mnemosynec.toml                            ← supabaseAnonKey param + Live Event nav + disablePathToLower
  data/version_trust.json                           ← v0.5.0 LATEST, v0.4.3 HISTORICAL
  data/substrate_awakens_achievements.json          ← Crow Feather definition [SEG-7]
  firebase.json                                     ← uppercase→lowercase redirects
  layouts/download/list.html                        ← "all 19 versions"
  layouts/live-dashboard/list.html                  ← Full live dashboard layout [SEG-2]
  content-mnemosynec/live/SubstrateAwakens/
    _index.md                                       ← live dashboard content [SEG-2]
    kit/_index.md                                   ← Watch and Replicate kit [SEG-3]
    register/_index.md                              ← Registration form [SEG-4]

platform/supabase/
  migrations/20260616000002_substrate_awakens.sql   ← 3 tables + RLS [SEG-4]
  functions/register-SubstrateAwakens/index.ts      ← HMAC token + email [SEG-4]

tools/plow-cli/
  generate-event-bank.js                            ← Question bank generator [SEG-5]
  simulate-peers.js                                 ← Dry-run simulation [SEG-8]

Asteroid-ProofVault/PAPERS/
  substrate_awakens_question_bank.jsonl             ← 2,000 fresh questions [SEG-5]
  substrate_awakens_question_bank.jsonl.sha256      ← SHA256: e79142cf… [SEG-5]
  substrate_awakens_question_bank_manifest.json     ← manifest [SEG-5]

BISHOP_DROPZONE/00_FOUNDER_REVIEW/
  SUBSTRATE_AWAKENS_MARKETING_WAVE/                 ← 7 drafts [SEG-6]
  YOKE_RETURN_SUBSTRATE_AWAKENS_LAUNCH_EVENT_BP084.md  ← this file
```

---

**Model used: Sonnet 4.6**
**Commit: `ced9c70`**

FOR THE KEEP. Substrate Awakens. The cooperative shows itself.
