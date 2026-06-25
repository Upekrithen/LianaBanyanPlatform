# Knight Marathon 15 — Hugo Homepage Title Fix Redeploy

**Marathon ID:** K-MARATHON-15
**BP:** BP090
**Date:** 2026-06-22 morning Central
**Status:** LANDED · 2026-06-22 ~11:45 Central · All T1–T4 gates PASS
**Founder ratify:** explicit — "Yes,(a) and stage marathon 15" 2026-06-22 ~10:15 Central
**Predecessor:** none (parallel-track to M13/M14)
**Governing canon:** `canon_tagline_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089` · TRUTH-ALWAYS

## Objective

Fix the mnemosynec.org homepage `<title>` and OG meta tag to correct the Founder-flagged misnomer "MnemosyneC — The AI that remembers" → "Dr. Mnemosynec REMEMBERS for your AI" so LinkedIn/X/Reddit social cards pull the corrected title for tomorrow's launch wave.

## Truth-Always context

LinkedIn was caught (2026-06-22 ~09:45 Central) rendering the stale "MnemosyneC — The AI that remembers" tagline as the OG card title. This violates Founder canon `canon_tagline_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089` which superseded that phrasing back at BP089. The Hugo source was never updated.

Bishop has ALREADY corrected the front-matter source file at:
`Cephas/cephas-hugo/content-mnemosynec/_index.md` line 2 — title changed from `"MnemosyneC — The AI that remembers"` to `"Dr. Mnemosynec REMEMBERS for your AI"` (committed by Bishop direct Edit 2026-06-22 ~09:50 Central).

Knight's job: rebuild Hugo + redeploy to Firebase + verify the live `<title>` now shows the corrected string.

## Scope — 4 blocks

### Block 1 — Verify source file already corrected

```bash
cd "C:/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo"
head -3 content-mnemosynec/_index.md
```

Expected output: `title: "Dr. Mnemosynec REMEMBERS for your AI"` on line 2.

T1 gate: if line 2 still shows "The AI that remembers" → ABORT, Bishop's edit didn't persist; diagnose.

### Block 2 — Hugo rebuild

```bash
cd "C:/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo"
hugo --config config-mnemosynec.toml --cleanDestinationDir
```

T2 gate: hugo build exit 0 + at least 40 pages built (matches recent baseline).

### Block 3 — Firebase deploy

```bash
firebase deploy --only hosting:mnemosyne
```

T3 gate: "Deploy complete!" message confirmed + Hosting URL https://mnemosyne-lianabanyan.web.app responds 200.

### Block 4 — Live verification

```bash
curl -s https://mnemosynec.ai/ | grep -oE '<title>[^<]*</title>'
curl -s https://mnemosynec.ai/ | grep -oE '<meta property="og:title"[^>]*>'
curl -s https://mnemosynec.org/ | grep -oE '<title>[^<]*</title>'
```

T4 gate: all three return strings containing "Dr. Mnemosynec REMEMBERS for your AI". If old "The AI that remembers" appears anywhere → diagnose CDN cache or Hugo template override.

### LinkedIn / Twitter cache refresh (POST-DEPLOY, Founder action)

After T4 passes, Founder pastes the URL into:
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

This forces re-scrape so existing shares of mnemosynec.org pull the new title. Without this, LinkedIn keeps the cached "AI that remembers" for ~7 days.

## Truth-Always gates

- T1: Source file shows corrected title in front-matter
- T2: Hugo build exit 0 + page count ≥40
- T3: Firebase deploy complete
- T4: Live HTML on both mnemosynec.ai and mnemosynec.org shows corrected `<title>` + og:title meta

## Wall-clock estimate

3-7 minutes total (build ~60s · deploy ~30s · verify curl ~10s · LinkedIn re-scrape ~10s Founder).

## Return-to-Bishop spec

Brief: commit hash if any · build page count · Firebase deploy URL · curl verification outputs · LinkedIn Post Inspector status.

## Dependencies

None. Fires independently of M13/M14. Recommended to fire BEFORE tomorrow's social blast so cards render correctly.
