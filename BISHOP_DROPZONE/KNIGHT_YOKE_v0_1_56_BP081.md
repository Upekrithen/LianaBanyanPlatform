---
yoke: KNIGHT_YOKE_v0_1_56_BP081
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
target_version: v0.1.56
parent_yoke: KNIGHT_YOKE_v0_1_55_BP081.md
predecessor_status: v0.1.55 HELD at staging (GitHub Pre-release URL); LEAN Ask broken on pre-existing-Ollama machines → v0.1.56 fixes BEFORE Latest promotion
status: DRAFT — Founder ratifies before SHIP publish
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER. Pre-dispatch model-selector verify mandatory. Yoke-return MUST report 'Model used: Sonnet 4.6' verbatim. NEVER Composer 2.5."
  - "Forward-pressure ≠ verified-ratify (BP080) — DRAFT until Founder explicit 'publish it' AFTER M0 + M1 + 2 flash-drive machines (where LEAN Ask was broken) all GREEN smoke."
  - "Caithedral spelling enforced — never 'Cathedral'"
  - "Actual runtime verify (BP078) — compiles-clean ≠ fixed; CDP DevTools probe OR Founder-install screenshot REQUIRED"
  - "UX SEG screenshot mandatory (BP078) — every UX scope captures screenshot on packaged build"
  - "Every-click visible feedback (BP078) — silence = broken"
  - "Long-running heartbeat (BP078) — anything >3s shows progress"
  - "Dispatch ≠ executing — verify each SEG output file has real content before relaying progress"
  - "Velocity statement (Founder BP081): 'We just need to get to .1.60 AS SOON AS POSSIBLE.'"
related_inputs:
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\BP081_FOUNDER_SMOKE_FINDINGS_v0_1_55.md"
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\BP081_FEATURE_SPEC_INVITE_TOKEN_AVAILABILITY_TAB.md"
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md"
---

# 🐎 Knight Yoke · v0.1.56 Wave · BP081

## Wake-up

Knight — Bishop dispatching v0.1.56. Path B: Yoke first, then bedrock.

**Read frontmatter `hard_bindings` above before any SEG fires.**

## 🚨 BP081 BLOOD STATUTE — RE-READ

**ONLY Sonnet 4.6 for SEGs. EVER.** Composer 2.5 burned ~$1M-class dollars BP080/BP081. Sonnet 4.6 VERIFY caught 2 NSIS bugs + 1 TS-error hallucination Composer-2.5 shipped. Every yoke-return reports `Model used: Sonnet 4.6` verbatim.

## v0.1.55 state (read before dispatching v0.1.56)

- v0.1.55 .exe at GitHub Pre-release URL, NOT promoted to Latest
- Founder installed on 4 machines (M0 admin + wife's M1 admin + 2 flash-drive)
- LAN auto-discovery WORKS across 4 machines ✅
- LEAN Ask BROKEN on 2 flash-drive machines DESPITE Gemma 4 12B being pre-pulled
- Cause hypothesis: OllamaManager hard-codes model identifier that doesn't match `ollama list` output
- **v0.1.55 stays at staging until v0.1.56 fixes this AND smoke is GREEN on all 4 machines**

## v0.1.56 SCOPE (5 things)

### SEG-1 · LEAN Ask model-detection family-match (P0, **Sonnet 4.6**)

**Symptom:** LEAN Ask fails on machines with pre-existing Ollama + Gemma 4 12B already pulled.

**Required fix:**
- OllamaManager init calls `ollama list` (or equivalent API endpoint)
- Parses returned model list
- Matches by FAMILY prefix (`gemma`), then SIZE (`12b`/`13b`/`27b`), then VERSION (prefer higher: 4 > 3 > 2)
- Selects best-fit existing model — does NOT pull if compatible model is present
- Only pulls if zero compatible models found
- Caches selected model identifier for subsequent calls

**Edge cases:**
- `gemma2:12b` vs `gemma:12b` vs `gemma4:12b` — all match family "gemma" + size "12b"
- Empty `ollama list` → trigger SEG-2 progressive pull
- Ollama service not running → graceful error + retry button (every-click-feedback)

**Verify:** runtime probe — install on M2 (192.168.86.64) which has pre-pulled Gemma — LEAN Ask returns valid response, no "Could not reach", no spurious pull. Screenshot + log line "selected model: <name>" embedded in yoke-return.

### SEG-2 · Gemma 4 12B progressive auto-pull (P0, **Sonnet 4.6**)

**Goal:** When SEG-1 family-match returns empty, run `ollama pull gemma4:12b` (Knight confirms exact upstream tag) with progress UI.

**Requirements:**
- Progress bar: % + downloaded/total + ETA
- Heartbeat every 2s (long-running canon)
- Cancel button (every-click-feedback)
- On success → switch app state to use this model
- On failure → error + retry (no silent fail)

**Bishop recommendation:** progressive auto-pull (Coffee §6 open Founder decision). If Founder ratifies progressive in his paste prompt, proceed; if not, write bundle-config stub + surface back.

**Verify:** install on fresh-Ollama M0 → first-launch triggers pull → progress visible → completion → Ask works. Screenshot all states.

### SEG-3 · Connect Via Invite Token Availability tab (P0, **Sonnet 4.6**)

**Full spec:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\BP081_FEATURE_SPEC_INVITE_TOKEN_AVAILABILITY_TAB.md`

**Summary:**
- Rename "Connect via invite token" → **"Connect Via Invite Token Availability"** (verbatim, capitalize "Via")
- Button → opens tab
- Tab shows: §3.1 MY Cue Deck Card always-visible (with share controls — clipboard, QR, mesh send) + §3.2 RECEIVED cards (others shared to user)
- Two-way symmetry: outbound (send mine) + inbound (receive theirs)

**Verify:** screenshot button rename, screenshot tab with My card, screenshot empty state, simulate M0→M1 share and screenshot received-card state.

### SEG-4 · Substrate-accumulator R1 — plow-loop writes eblets on accept (P1, **Sonnet 4.6**)

**Reference:** `BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md` SEG-0 v0.1.55 gap-matrix — R1, R3, R4 confirmed gaps. v0.1.56 lands R1.

**Scope:**
- Locate accept handler in plow/Spider/Sprite/SEG pipeline
- Add eblet-write call: question + answer + provenance + verified=true + sha256
- Append-only — never overwrite, never delete
- Test: run a single plow round → confirm eblet appears in local store

**Verify:** SEG returns: file path to newly-written test eblet + sha256 + grep-confirmation in local store.

### SEG-5 · v0.1.55 carry-along sweep (P2, **Sonnet 4.6**)

Fold-in if zero-conflict; else queue v0.1.56.1:
- federation:connect-peer IPC
- silent email
- dispute submissions for Provs 1–11 titles + 10/11/12 dates
- CI Firebase token regen

---

## VERIFY SEG (sequential after SEGs 1–5 land, **Sonnet 4.6**)

- All SEG output files exist + have real content (dispatch ≠ executing trap)
- TypeScript build clean (zero errors, zero new warnings)
- Packaged build produced
- Install on M0 + M2 (the two failure-mode-representative machines) → smoke-walk SEGs 1–4 → screenshots embedded
- LEAN Ask returns valid response on BOTH machines (pre-existing Gemma AND fresh Gemma path)
- COMMUNITY-CONNECT tab visible, shareable, receives test card
- Eblet written by SEG-4 visible on disk
- GREEN per-scope, or surface drift inline (fix-as-we-go canon)

---

## STAGING-UPLOAD SEG (Sonnet 4.6)

GitHub Pre-release for `v0.1.56`. NOT Latest. Anon HEAD verify. Return direct .exe URL.

Founder smokes on all 4 machines (M0 + M1 + M2 + M3) from staging URL.

---

## SHIP SEG (Sonnet 4.6) · 4 EVERY TIME sharpenings — DRAFT until Founder explicit "publish it"

When Founder pastes "publish it":

1. firebase.json + data/version.json bump → 0.1.56
2. 4-sweep file edits Cephas + Hugo
3. Deploy via Firebase wrappers (Squarespace DNS untouched — §4 BP080)
4. Live URL HEAD verify
5. Anon download verify (>100 MB)
6. Body-string count: old=0, new≥10
7. GitHub Latest promotion (Gates 2+3) — **this is the first v0.1.x promotion to Latest since v0.1.25; v0.1.55 stays as Pre-release**

---

## Yoke-return format per SEG

```
SEG-N · v0.1.56 · status: [GREEN | DRIFT | BLOCKED]
- Model used: Sonnet 4.6  ← VERBATIM
- Files touched: [...]
- Runtime verify: [screenshot path | CDP probe output | N/A reason]
- Drift caught: [...]
- Recommend immediate-next: [...]
```

ROLL.

— Bishop · BP081 · 2026-06-12
