---
yoke: KNIGHT_NUDGE_v0_1_55_STAGING_UPLOAD_BP081
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
parent_yoke: KNIGHT_YOKE_v0_1_55_BP081.md
purpose: STAGING upload — GitHub pre-release URL for Founder to smoke-test from. NOT a SHIP. No Latest promotion. No Cephas/Hugo data swap yet.
status: ACTIVE
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6. Pre-dispatch model-selector verify mandatory. Yoke-return MUST report 'Model used: Sonnet 4.6' verbatim."
  - "Forward-pressure ≠ verified-ratify (BP080) — this is STAGING. DO NOT promote to Latest. DO NOT touch Cephas/Hugo data layer. DO NOT trigger the 4 EVERY TIME sharpenings yet."
  - "Founder's install workflow requires mnemosynec.ai download URL — local .exe is not the canonical path. Founder cannot smoke until installer is reachable via URL."
  - "Truth-Always — confirm Composer-2.5 hallucination receipt: 'pre-existing TS errors at index.ts:3823' from earlier SEG-1 yoke-return DID NOT EXIST. Sonnet 4.6 VERIFY confirmed clean tsc. Log this in the yoke-return for canon."
---

# Knight Nudge · v0.1.55 STAGING UPLOAD · BP081

Knight — Bishop. VERIFY landed GREEN-after-fix. Excellent adversarial audit work on the 2 Composer-2.5 NSIS bugs.

Founder confirmed his install workflow: **he cannot install on any machine until the .exe is reachable via a download URL.** Local `release/MnemosyneC-Setup-0.1.55.exe` is not enough. So we need a STAGING upload — but NOT a full SHIP.

---

## STAGING-UPLOAD SEG (Sonnet 4.6)

### Goal

Upload `C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.1.55.exe` (~511 MB) to a GitHub release **marked Pre-release**, on the MnemosyneC repo. Founder downloads from that URL, installs on M0 + M1, smokes. On green → Founder pastes "publish it" → SHIP SEG promotes to Latest and does the 4 EVERY TIME sharpenings.

### What this SEG DOES

1. **Create GitHub release** for tag `v0.1.55` on the MnemosyneC repo:
   - Title: `v0.1.55 — Staging (M0/M1 smoke-test)`
   - **Pre-release flag: TRUE**
   - **NOT marked as Latest**
   - Body: short release notes — SEG-1 OllamaManager singleton · SEG-2 NSIS LAN binding (Composer-2.5 bugs caught + fixed by Sonnet 4.6 VERIFY) · SEG-3 COMMUNITY-CONNECT · SEG-4 mascot fold-in · SEG-5 cooldown decay Option 2. Note: "STAGING release for M0/M1 smoke-test. Do not install unless directed."

2. **Upload installer** as release asset:
   - File: `release/MnemosyneC-Setup-0.1.55.exe`
   - Use `gh release upload` or GitHub API
   - Verify uploaded size matches local (536,253,269 bytes)

3. **Verify URL reachable** from anonymous client:
   - `curl -I -L <download_url>` returns 200 (after GitHub redirect)
   - `Content-Length` matches
   - No auth required

### What this SEG DOES NOT DO (forward-pressure trap protection)

- ❌ Does NOT promote to Latest
- ❌ Does NOT touch Cephas / Hugo / Firebase
- ❌ Does NOT bump `data/version.json` on the website
- ❌ Does NOT run the 4 EVERY TIME sharpenings
- ❌ Does NOT update mnemosynec.ai surfaces

Those all wait until SHIP SEG after Founder green-light.

### Founder hand-off

Yoke-return must include:
- The full GitHub release URL Founder clicks to download
- The direct .exe download URL Founder pastes into a browser
- Confirmation pre-release flag is TRUE
- Confirmation Latest is unchanged (`gh release view --json isLatest` or equivalent)

### Yoke-return format

```
STAGING-UPLOAD SEG · v0.1.55 · status: [GREEN | DRIFT | BLOCKED]
- Model used: Sonnet 4.6  ← VERBATIM
- Subagent ID: [...]
- GitHub release URL: https://github.com/<org>/<repo>/releases/tag/v0.1.55
- Direct .exe URL: https://github.com/<org>/<repo>/releases/download/v0.1.55/MnemosyneC-Setup-0.1.55.exe
- Pre-release flag: TRUE
- Latest release unchanged: [confirmed, prior Latest = v0.1.53]
- Anon download verify: HTTP [200], Content-Length [536253269]
- Drift caught: [...]
- Recommend immediate-next: Founder downloads + installs M0 + M1 + smoke-walks
```

### Truth-Always log (in yoke-return body)

Confirm for the canon record:
- VERIFY SEG ran on Sonnet 4.6 ✅
- Composer-2.5 hallucination receipt: the SEG-1 Composer-2.5 yoke-return claimed "two pre-existing TS errors at index.ts:3823 (OllamaManager)" — Sonnet 4.6 VERIFY found ZERO TS errors (`tsc --noEmit` exit 0). Composer-2.5 fabricated the claim. Log as BP081 BLOOD STATUTE empirical receipt.

---

## After this SEG lands

Bishop relays the direct .exe URL to Founder. Founder:
1. Downloads from the URL on M0 (192.168.86.30)
2. Installs (accepts admin elevation for OLLAMA_HOST)
3. Smokes: LEAN Ask cold → real response · COMMUNITY-CONNECT 4 states · mascot on Home tab
4. `netstat -an | findstr 11434` → `0.0.0.0:11434`
5. Walks to wife's M1 (192.168.86.45) → same install + smoke
6. On both green → pastes "publish it" to Knight → SHIP SEG fires

— Bishop · BP081 · 2026-06-12
