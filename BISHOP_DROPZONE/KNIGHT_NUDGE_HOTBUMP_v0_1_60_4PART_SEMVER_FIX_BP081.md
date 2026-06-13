---
nudge: KNIGHT_NUDGE_HOTBUMP_v0_1_60_4PART_SEMVER_FIX_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: HOTBUMP v0.1.59.1 → v0.1.60 to fix recurring 4-part-semver auto-update break + SHIP everything (v0.1.59 wave + v0.1.59.1 §A + homepage) as v0.1.60 LATEST in single ship cycle
priority: P0
status: ACTIVE — Founder ratified Path A BP081 2026-06-13
related: BP081_KNIGHT_NOTIFICATION_V0_1_59_SCOPE_CHECK.md, KNIGHT_YOKE_v0_1_59_1_HOTFIX_BP081.md (already completed by Knight), BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs"
  - "🔒 Secrets canon — env loaded via Process-scope pattern, never echoed"
  - "Belief-vs-binary check (BP081) — diagnostic.log must show 'App version: 0.1.60'"
  - "Verify-network-call-fired (BP081) — Ollama server.log MUST show 3 /api/chat per Test It Out question (real Giant concordance, not stub)"
  - "Truth-Always disk-backed canon (BP080) — homepage MUST NOT ship until real Giant concordance is empirically live"
---

# 🐎 Knight Hotbump · v0.1.59.1 → v0.1.60 · BP081

## Same-class recurrence

The binary you just built — `release/MnemosyneC-Setup-0.1.5-9.1.exe` — is the **same 4-part-semver auto-update break** that bit us in v0.1.57.1 earlier today. The `0.1.5-9.1` filename means `latest.yml` reports `0.1.5-9.1` → existing v0.1.59 users will NOT auto-update.

You called it "normal electron-builder NSIS behavior." It is the SAME behavior — and it's the SAME bug. Last time we hotbumped to v0.1.58 (3-part). Same fix applies.

## The hotbump

**Skip v0.1.59 SHIP entirely.** Bump v0.1.59.1 → **v0.1.60** (3-part). Rebuild. SHIP v0.1.60 LATEST with EVERYTHING.

### Why v0.1.60 is the right label

- Per the `version_shift_notice` in the main backlog, the original v0.1.60 scope (Spider fan-out + per-domain Q banks + Andon re-plow + Plow the Field + Clipboard hotkey) was already absorbed INTO the v0.1.59 wave you just shipped.
- The label v0.1.60 is therefore FREE.
- **Symbolically: v0.1.60 = the moat-built moment.** Real Shadow E-Giant concordance live + homepage claims it at the same instant. Architectural alignment preserved.

### What v0.1.60 SHIPS as Latest (everything from v0.1.59 + v0.1.59.1 + homepage)

**From the v0.1.59 wave (already built):**
- Spider domain fan-out + Andon re-plow loop
- Plow the Field UI (14-domain multi-select, per-domain progress, "Substrate grew by N eblets 🌱")
- Clipboard Q+A capture modal (Ctrl+Shift+M, BP041 SAGA 3 collision handled cleanly)
- LB Membership backend + Tab 19 💎 ($5/yr, 83.3%, Cost+20% canonical-numbers-verified)
- MCP Substrate Bridge scaffold (port 11456, 5 tool stubs, Bearer auth, Settings panel)
- Browser extension MV3 scaffold (chatgpt.com / claude.ai / gemini.google.com)
- Substrate Stats Tab 18 📊 (Wave A backend + UI)

**From v0.1.59.1 §A (already built):**
- A-1 REAL 3-voter Shadow E-Giant concordance (correctness / consistency / coverage lenses, gemma4:12b, 2+/3 verified, Ollama-unreachable fallback)
- A-2 R3 Andon backend integrity (startup quarantine scan, verified=false write-gate, atomic rewrite)
- A-3 Stale-message auto-clear on version change (LeanAskTab.tsx + version-check IPC)
- A-4 Onboarding auto-flip (Ollama+Gemma+testItOut≥1 → auto-set mnemosynec_onboarding_complete='1')

**Homepage SHIP integration:**
- `BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md` folds into Cephas Hugo `content/_index.md` (or actual path Knight confirms)
- ALL 7 sections present: gold pitch line · Six Pillars · How We Make Sure Things Are True (pheromone→socceri→stone tablet) · How It Works · Three Currencies · Get Started · Footer
- Canonical-voice strict-checks at SHIP: Caithedral ≥1 / Cathedral=0 / 83.3% verbatim / Cost+20% / Shadow E-Giant ≥3 occurrences / "For the keep." closing motif

## Knight steps (Sonnet 4.6 throughout)

### Step 1 · Version bump
- `package.json`: `0.1.59.1` → `0.1.60` (3-part semver)
- Cephas/Hugo: `data/version.json` `_index.md` `list.html` firebase headers all bump to `0.1.60`

### Step 2 · Rebuild
- `npm run build` then `npm run dist:win`
- Verify: `release/MnemosyneC-Setup-0.1.60.exe` (3-part name, NO hyphen-split)
- Verify: `latest.yml` shows `version: 0.1.60` (NOT `0.1.5-...` or `0.1.6-0`)

### Step 3 · Homepage integration into Cephas Hugo
- Read `BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md`
- Replace `Cephas/cephas-hugo/content/_index.md` (or homepage source equivalent) with the 7 sections
- Run canonical-voice strict-checks BEFORE deploy:
  - `grep -c "Caithedral" content/_index.md` → ≥1
  - `grep -c "Cathedral" content/_index.md` → 0
  - `grep -c "83.3%" content/_index.md` → ≥1
  - `grep -c "Shadow E-Giant" content/_index.md` → ≥3
  - `grep -c "For the keep" content/_index.md` → ≥1

### Step 4 · VERIFY SEG
- Belief-vs-binary: install v0.1.60 on M0, diagnostic.log shows `App version: 0.1.60`
- Verify-network-call-fired: run Test It Out 1 question, Ollama server.log shows **3 `/api/chat` calls** (proves real Giant concordance fires, not stub)
- Real Plow run on 1 domain × 3 questions → confirm eblets land with Giant verdict metadata
- Screenshot Test It Out · Substrate Stats Tab · Tab 19 💎 Membership · clipboard modal · Settings MCP panel

### Step 5 · STAGING-UPLOAD SEG
- GitHub Pre-release for v0.1.60
- Pre-release flag TRUE, isLatest FALSE (initially)
- Anon HEAD verify · Content-Length ≈ 537 MB · 3-part filename `MnemosyneC-Setup-0.1.60.exe`

### Step 6 · SHIP SEG (after Founder pastes "publish it" post-smoke)

🔒 **Secrets canon** — if Firebase deploy needs env vars, load via canonical PowerShell `ForEach-Object → Process scope` pattern from `BP081_KNIGHT_NOTIFICATION_SECRETS_ENV_ACTIVE_PATH.md`. Never `Get-Content` → stdout.

4 EVERY TIME sharpenings:
1. firebase.json + data/version.json bump (already done Step 1)
2. 4-sweep Cephas + Hugo (already done Step 1 + Step 3 homepage integration)
3. Firebase deploy
4. Live URL HEAD verify (https://mnemosynec.ai returns 200, X-LB-Version 0.1.60)
5. Anon download verify (>100 MB)
6. Body-string count: old version=0, new ≥10, **Shadow E-Giant ≥3, Caithedral present, Cathedral absent, "For the keep." present**
7. GitHub Latest promotion — **v0.1.60 supersedes v0.1.58 as Latest. v0.1.57/v0.1.59/v0.1.59.1 demoted to Pre-release.**

## Yoke-return required

```
v0.1.60 hotbump-from-v0.1.59.1 · status: [GREEN | DRIFT | BLOCKED]
- Model used: Sonnet 4.6
- Binary name verified 3-part: MnemosyneC-Setup-0.1.60.exe Y/N
- latest.yml version field: <value>
- Belief-vs-binary on M0: diagnostic.log App version: 0.1.60 Y/N
- Verify-network-call-fired: Ollama /api/chat call count per question = 3 Y/N (proves real Giant)
- Homepage canonical checks: Caithedral=1+ ✓ / Cathedral=0 ✓ / Shadow E-Giant=3+ ✓ / 83.3% ✓
- Drift caught: [...]
- Recommend immediate-next: Founder smoke on M0+M1+M2 → publish it
```

## Bishop notes

- **This is the architectural alignment moment.** Don't dilute it with a separate v0.1.59 SHIP that gets superseded 30 minutes later. v0.1.60 = the moment everything goes live together.
- **Same-class catch protects users.** The 4-part semver bug isn't a "filename quirk" — it's a real auto-update break. We caught it twice in one day (v0.1.57.1 + v0.1.59.1). Truth-Always discipline at the binary layer.
- **First Latest promotion since v0.1.58.** Treat with appropriate gravity. The substrate-accumulator architecture (R1 writer + R2 reader + R3 Andon + Real Giant concordance + 14-domain Plow + Substrate Stats + Cue Deck Share + LB Membership + MCP Bridge scaffold + Browser extension scaffold) all goes live as Latest in one moment.

— Bishop · BP081 · 2026-06-13
