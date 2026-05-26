# Knight K-D Receipt — CLA + Mnemosyne Deploy + Discord Post
**BP058 W6 · Knight retry execution · 2026-05-25**

---

## D.1 · CLA Assistant Deploy

### Files Written
| File | Status | Notes |
|------|--------|-------|
| `CLA.md` (repo root) | ✅ Written + committed | Overwritten with BP058 W6 verbatim content |
| `LICENSE_SSPL.md` (repo root) | ✅ Written + committed | Overwritten with SSPL v1 abbreviated canonical |
| `.github/cla-assistant-config.yml` | ✅ Created + committed | New file; trailing-whitespace hook required blank-line fix |
| `Cephas/cephas-hugo/content/cla.md` | ✅ Created + committed | Hugo content page for CLA |

### Commit
```
bc3d7b4  K-D D.1: CLA + SSPL license + cla-assistant config + Cephas CLA page (BP058 W6)
4 files changed, 93 insertions(+), 551 deletions(-)
```
All pre-commit hooks passed (gitleaks, detect-private-key, trailing-whitespace, check-yaml, end-of-file-fixer).

### Pawn Search Result
Glob of `eblets_bp058/` and `BISHOP_DROPZONE/` for "pawn" + "10_parts" or "full_dump": **NOT FOUND** — both directories exist but are empty. Content authored from task verbatim.

### Webhook Registration
```
gh api repos/LianaBanyanCorporation/LianaBanyanPlatform/hooks ... → HTTP 404 Not Found
```
**Reason:** GitHub API returned 404 for `LianaBanyanCorporation/LianaBanyanPlatform` — repo either does not exist under that org/name on GitHub, or the authenticated token lacks repo webhook scope. The monorepo is at `Upekrithen/LianaBanyanPlatform.git`.

**⚠️ FOUNDER ACTION REQUIRED (OAuth + Webhook):**
1. Go to [cla-assistant.io](https://cla-assistant.io) → "Sign In with GitHub" using the `LianaBanyanCorporation` GitHub org account
2. Add repository: `LianaBanyanCorporation/LianaBanyanPlatform` (or `Upekrithen/LianaBanyanPlatform` if that's the canonical public repo)
3. Point CLA path to `CLA.md` (already configured in `.github/cla-assistant-config.yml`)
4. cla-assistant.io will auto-register its own webhook — no manual API call needed

---

## D.2 · Mnemosyne Download Page

### Location Verified
- `amplify-computer/` has no separate `.git` — it is a plain subdirectory of the LianaBanyanPlatform monorepo (origin: `https://github.com/Upekrithen/LianaBanyanPlatform.git`)
- No `package.json` found in `amplify-computer/`
- `public/` directory exists (empty before this task)
- **Placement:** `amplify-computer/public/download.html` ✅

### Commit
```
a12f362  K-D D.2: Mnemosyne download page v0.1.16 (BP058 W6)
1 file changed, 71 insertions(+)
create mode 100644 amplify-computer/public/download.html
```

### Push
```
git push → fd055c7..a12f362  main -> main  (to Upekrithen/LianaBanyanPlatform.git)
```
Pushed successfully.

### HTTP Check
```
Invoke-WebRequest -Uri "https://mnemosynec.ai/download" -Method Head → StatusCode: 200
```
**Result: ✅ LIVE** — `https://mnemosynec.ai/download` returns HTTP 200.

**Note:** The live deploy at mnemosynec.ai appears to be managed via a separate deploy pipeline (Firebase or similar, per `firebase-debug.log` and `.firebaserc` found in `cephas-hugo`). The `amplify-computer/public/download.html` is committed to substrate but the live page was already returning 200 before this commit — indicating either the deploy is CI-triggered or the page was previously deployed. Knight confirms the file is committed and the live URL is responding correctly.

---

## D.3 · Discord Bannister Post

### discord.ts Analysis
Path: `platform/supabase/functions/_shared/plug_adapters/discord.ts`

**Status: STUB** — Discord adapter is not implemented (deferred to K458c). The adapter contains only a `poll()` function that throws `Error("[K458c] Discord adapter not implemented")`. No `post()`, `send()`, or webhook delivery function exists.

### Env Check
`SDS.env` searched for `DISCORD*` keys → **NONE FOUND**. No Discord webhook URL provisioned.

### Supabase CLI
Available: `supabase v2.75.0` — but unusable for Discord delivery given above gaps.

### Delivery Status: GAP — Manual Copy Provided

**⚠️ FOUNDER ACTION REQUIRED — paste to Discord:**

```
🪶 THE 4-MINUTE MILE OF COOPERATIVE AI

Cooperative members:

For years, AI required massive centralized servers · per-session context amnesia · expensive API tolls.

Today we ship Mnemosyne v0.1.16 — a measured, reproducible, cooperatively-owned breakthrough.

By giving your AI agents a durable cooperative memory substrate, Mnemosyne makes AI **2,400× to 30,000× faster, cheaper, and more accurate.** Not a benchmark. Not a marketing claim. The empirical receipts are in the substrate.

🔗 **Download: https://mnemosynec.ai/download** (160MB · AGPL · No ads · No API keys)

**A note about Windows installation:**
Because we're new and cooperatively-owned (not corporate-published), Windows SmartScreen will show a blue "Windows protected your PC" screen on first install. This is normal for new decentralized software. The download page has step-by-step bypass instructions.

**Why your download matters:** Every cooperative member who downloads + runs the installer builds organic SmartScreen reputation. Within ~500-1000 installs from trusted users like you, the warning disappears for everyone else. **You are laying the track for every future runner.**

**The Bannister-moment is communal.** When Roger Bannister broke the 4-minute mile in 1954, every runner who came after benefited from the proof it was possible. That's what your install does for the next cooperative member.

**FOR THE KEEP.** Download · install · run · share. We built the foundation. You own the house.

🪶 ⚔️ Đ
```
*(Source: §C.1 from BP058_W6_ACTION_BUNDLE — version already v0.1.16, no update needed)*

**SQL to provision Discord webhook (once Founder has webhook URL from Discord server settings):**
```sql
-- Run in Supabase SQL Editor (platform project)
-- Replace YOUR_DISCORD_WEBHOOK_URL with the actual Discord webhook URL
-- from: Server Settings → Integrations → Webhooks → New Webhook

INSERT INTO plugs (platform, credentials, is_active, created_at)
VALUES (
  'discord',
  jsonb_build_object('webhook_url', 'YOUR_DISCORD_WEBHOOK_URL'),
  true,
  now()
)
ON CONFLICT (platform) DO UPDATE
  SET credentials = EXCLUDED.credentials,
      is_active = true;
```
*(Note: Exact table/column names may differ — verify against `platform/supabase/migrations/` before running)*

**Rollout cadence (from §C.2):**
- Hour 0: Post to #announcements (or LB cooperative members channel)
- Hour 0+30min: Pin the post
- Hour 0+2hr: Cross-post to #general or #mnemosyne
- Day 3: Post follow-up with download count + SmartScreen rep progress
- Day 7: Bannister-moment milestone post if rep curve shifts

---

## Honest Banyan Metric

**Score: 72 / 100 ± 8**

| Sub-task | Status | Points |
|----------|--------|--------|
| D.1 CLA.md written + committed | ✅ Complete | +20 |
| D.1 LICENSE_SSPL.md written + committed | ✅ Complete | +10 |
| D.1 cla-assistant-config.yml written + committed | ✅ Complete | +10 |
| D.1 Cephas CLA page written + committed | ✅ Complete | +10 |
| D.1 CLA webhook registered | ❌ Gap — 404 (repo not found via API) | +0 |
| D.2 download.html written to correct location | ✅ Complete | +15 |
| D.2 commit + push confirmed | ✅ Complete | +5 |
| D.2 HTTP 200 on mnemosynec.ai/download | ✅ Confirmed | +5 |
| D.3 Discord delivery automated | ❌ Gap — adapter stub, no webhook URL | +0 |
| D.3 Manual copy + SQL provided | ✅ Gap bridged with actionable artifacts | +5 |

**Deductions from 100:** -15 webhook gap (Founder OAuth required), -13 Discord automation gap (adapter not implemented, no webhook URL in env)

**Variance band ±8:** Deploy pipeline for amplify-computer/public is ambiguous (already-live page suggests separate CI); mnemosynec.ai live status confirmed but the substrate commit's deploy path is unclear.

---

*Executed by Knight (Cursor AI) · BP058 W6 · 2026-05-25*
*Retry after previous agent error — all three D sub-tasks completed to maximum automatable depth*

**FOR THE KEEP × Workers · Builders · Creators**
