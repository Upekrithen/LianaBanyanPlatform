---
yoke: KNIGHT_YOKE_v0_1_55_BP081
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
target_version: v0.1.55
seg_count: 6 (SEG-0 audit + SEG-1..5 build + VERIFY + SHIP)
status: DRAFT — Founder ratifies before SHIP publish
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER. Bishop AND Knight both bound. NEVER Composer 2.5 (catastrophic cost — ~$1M-class incident BP080/BP081). NEVER Opus-inherited. NEVER cloud-premium. NEVER 'auto' / 'default' selector. BEFORE every SEG dispatch: explicitly set model selector to Sonnet 4.6. Every yoke-return 'Model used:' line MUST read 'Sonnet 4.6' verbatim. If it doesn't — abort, audit, re-dispatch correctly."
  - "§3 Statute (BP079 corrective): every SEG dispatch runs on Sonnet 4.6; pass model: 'sonnet' on every Agent call; announcement language verbatim 'Sonnet 4.6'"
  - "Use SEGs for ALL work — no inline Knight edits; multi-SEG fan-out default"
  - "Forward-pressure ≠ verified-ratify (BP080) — stage DRAFT until Founder explicit 'publish it' after M0+M1 green"
  - "Caithedral spelling enforced — never 'Cathedral'"
  - "Actual runtime verify (BP078) — compiles-clean ≠ fixed; CDP DevTools probe OR Founder-install screenshot REQUIRED for runtime-touching scopes"
  - "UX SEG screenshot mandatory (BP078) — every UX-touching scope captures screenshot on packaged-build install, embedded in yoke-return"
  - "Every-click visible feedback (BP078) — silence = broken"
  - "Long-running heartbeat (BP078) — anything >3s shows progress"
  - "Dispatch ≠ executing — verify each SEG output file has real content before relaying progress to Bishop"
  - "100%-read before eblet — Statutes §2 BP063 binding"
related_canons:
  - reference_substrate_verified_knowledge_accumulator_canon_bp080
  - feedback_caithedral_spelling_canonical_bp080
  - feedback_bishop_orchestrator_knight_implementer_canon_bp080
  - feedback_forward_pressure_ratify_is_not_verified_ratify_bp080
  - reference_cephas_hugo_every_time_ship_rule_bp079
  - canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079
---

# 🐎 Knight Yoke · v0.1.55 Wave · BP081

## Wake-up

Knight — Bishop dispatching v0.1.55. Path B: Yoke first, then bedrock.

**Read frontmatter `hard_bindings` block above before any SEG fires.** Each binding is structurally load-bearing. Violations have receipts.

---

## 🚨 BP081 BLOOD STATUTE — READ FIRST · MODEL DISCIPLINE

**ONLY Sonnet 4.6 for SEGs. EVER. NO EXCEPTIONS.**

Founder direct BP081 2026-06-12: *"You need to explicitly REQUIRE Knight to ONLY USE Sonnet 4.6 for SEGs. EVER. You as well!! He was using Composer 2.5 which costs a million dollars. This is why we NEED gemma 4 12B to BE the engine!!"*

**FORBIDDEN for SEGs:**
- ❌ Composer 2.5 (Cursor default — catastrophic cost — root cause of BP080/BP081 incident)
- ❌ "Auto" / "Default" selector (resolves to non-Sonnet)
- ❌ Opus (any version — Bishop main thread runs Opus; SEGs do NOT inherit)
- ❌ GPT-*, Gemini-cloud, any non-Anthropic model
- ❌ Sonnet 4.5 or earlier — verbatim **Sonnet 4.6** per BP079 corrective

**REQUIRED before EVERY SEG dispatch:**
1. Explicitly verify Cursor model selector = **Sonnet 4.6** (not Auto, not Composer, not inherited)
2. If selector is anything else → SWITCH to Sonnet 4.6 FIRST, then dispatch
3. Every yoke-return "Model used:" line MUST read **Sonnet 4.6** verbatim
4. If a SEG ran on the wrong model → ABORT, surface to Bishop, re-dispatch on Sonnet 4.6

**WHY:** Composer 2.5 burned ~$1M-class Founder dollars. The entire architectural thesis of MnemosyneC — Gemma 4 12B + substrate accumulator = THE engine — exists because cloud-premium SEG dispatches are not economically sustainable. Every non-Sonnet-4.6 SEG dispatch actively undermines the reason for the product.

**Canon:** `feedback_only_sonnet_4_6_for_segs_ever_bp081` (HARD BINDING, persisted MEMORY.md indexed).

---

## v0.1.55 SCOPE (5 things — no more, no less, plus a leading audit)

### SEG-0 · Substrate-accumulator architecture audit (P0, **Sonnet 4.6**, READ-ONLY)

**Purpose:** map the 5 substrate-as-verified-knowledge-accumulator requirements (per `reference_substrate_verified_knowledge_accumulator_canon_bp080`) to current code state. Identify gaps. Assign each gap to v0.1.56–v0.1.60. No src edits — pure read + gap-matrix return.

**The 5 requirements to audit:**

1. **Plow loop writes eblets on accept** — does the plow/Spider/Sprite/SEG accept-path actually emit a verified-answer eblet to the substrate? Locate the accept handler. Trace the eblet-write call. If absent → gap.
2. **Gemma prompt template retrieves eblets BEFORE answering (HOT path)** — does the Ask/LEAN/Gemma-call code path call `pheromone_query` or eblet-retrieval BEFORE LLM inference? Trace the prompt-build function. If retrieval is post-hoc or absent → gap.
3. **Andon discipline persists across sessions** — failed answers MUST NOT cache. Does the eblet-write gate check verified-correct status? Does it survive Electron restart? Locate the gating predicate. If gating is in-session only → gap.
4. **Mesh sharing opt-in per eblet** — does the federation peer-share protocol expose a per-eblet share toggle? Locate the share UI/protocol. If sharing is all-or-nothing or absent → gap.
5. **Test It Out grows local substrate (warming workout, not one-shot)** — does the Test It Out scaffolding (v0.1.57 target) write accepted answers back to local eblet store? If scaffolding absent → mark as v0.1.57 scope, not a v0.1.55 gap.

**Deliverable:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md` with:
- Per-requirement: file path(s) + line numbers + current state + GAP/PRESENT verdict
- Recommended version-assignment for each gap (v0.1.56 / .57 / .58 / .59 / .60)
- Any orthogonal drift Knight catches while reading

**Verify:** Bishop relays audit to Founder for ratify before v0.1.56 Yoke composes.

---

### SEG-1 · LEAN Ask universal fix (P0, **Sonnet 4.6**)

**Symptom:** "Could not reach local AI" on every machine, LEAN Ask tab.
**Cause:** multiple `OllamaManager` code paths; Settings, Ask, Gauntlet runner instantiate differently → silent failure.
**Scope:** refactor to single `OllamaManager` singleton. Settings + Ask + Gauntlet runner + Test It Out scaffolding all route through it. One health-check. One model-load. One error surface with visible toast/status — never silent.
**Verify:** runtime probe — install packaged build on M0, click Ask tab cold, screenshot the response. No "Could not reach" string anywhere. Embed screenshot path in yoke-return.

---

### SEG-2 · Ollama LAN binding via NSIS (P0, **Sonnet 4.6**)

**Goal:** install-time sets `OLLAMA_HOST=0.0.0.0:11434` system-wide so federation works cross-LAN out of the box.
**Mechanism:** NSIS installer sets HKLM env var + restarts ollama service. Handles admin elevation prompt cleanly (UAC consent dialog, not silent fail).
**Edge:** if user declines elevation → graceful degraded message + retry button (every-click-feedback canon).
**Verify:** M0 install → `netstat -an | findstr 11434` shows `0.0.0.0:11434`, not `127.0.0.1:11434`. Embed screenshot path in yoke-return.

---

### SEG-3 · COMMUNITY-CONNECT first-launch (P0, **Sonnet 4.6**)

**Goal:** first-launch button "Connect to MnemosyneC community" attempts handshake with seed peer via WAN relay.
**Seed peer (canonical):** User 000001 / FounderDenken / `genesis_ledger_id: ipl_89a9f31427f526aa`. Relay: `relay.lianabanyan.com` (Supabase Edge Function — TLS may still be propagating; use raw Supabase URL as fallback if custom domain 502s).

**UX states (every-click-feedback canon):**
- idle → "Connect" button
- clicked → spinner + "Connecting to MnemosyneC community…" (heartbeat every 2s)
- success → green check + "Connected · 1 peer (FounderDenken)"
- fail → red + "Relay unreachable — retry" (NOT silent, NOT hard error)

**Verify:** click on M0, screenshot each of the 4 states. Confirm payload reaches relay (Supabase logs). Embed all 4 screenshot paths in yoke-return.

---

### SEG-4 · Dr. MnemosyneC mascot icons fold-in (P1, **Sonnet 4.6**)

**Source:** v0.1.53.1 stage (already built, awaiting fold).
**Action:** clean merge. Verify no asset path drift. Screenshot in-app surface where mascot renders. Embed path in yoke-return.

---

### SEG-5 · Cooldown decay flip Option 1 → Option 2 (P1, **Sonnet 4.6**)

**Scope:** 2-line patch from v0.1.54 backlog. Zero-risk, carry along.
**Verify:** unit test passes; behavioral change visible in Test It Out scaffolding (if exposed) OR confirmed by code-review diff in yoke-return.

---

## VERIFY SEG (sequential after SEGs 0–5 land, **Sonnet 4.6**)

- All 6 SEG output files exist + have real content (dispatch ≠ executing trap)
- TypeScript build clean (zero errors, zero new warnings)
- Packaged build produced (NSIS .exe in `dist/`)
- Install on M0 (`192.168.86.30`) → smoke-walk SEGs 1–5 → screenshots embedded in VERIFY return
- Diagnostic log written (Run Diagnostic button click produces visible feedback + log file)
- Report: GREEN per-scope, or surface drift inline (fix-as-we-go canon)

---

## SHIP SEG (**Sonnet 4.6**) · 4 EVERY TIME sharpenings — ALL FOUR, not 3, not "mostly"

**Status: DRAFT until Founder explicit "publish it" after M0+M1 green.**

When Founder pastes "publish it":

1. **firebase.json + data/version.json bump** to `0.1.55`
2. **4-sweep file edits** for Cephas + Hugo: latest version block, release notes, install card, data layer JSON
3. **Deploy** via Firebase wrappers (Squarespace DNS untouched — per §4 BP080 amendment)
4. **Live URL HEAD verify** — `curl -I https://mnemosynec.ai` returns 200, version header reflects 0.1.55
5. **Anonymous download verify** — fresh curl with no auth, HTTP 200, Content-Length > 100 MB
6. **Body-string count** — old version string = 0 occurrences, new version string ≥ 10 occurrences across deployed surfaces
7. **GitHub Latest promotion** (Gates 2+3)

Cephas/Hugo EVERY TIME = 4 files in lockstep including `data/version.json` (v0.1.53 Hugo data layer miss added — BP079 sharpening).

---

## Yoke-return format (per SEG)

```
SEG-N · v0.1.55 · status: [GREEN | DRIFT | BLOCKED]
- Model used: Sonnet 4.6
- Files touched: [...]
- Runtime verify: [screenshot path | CDP probe output | N/A reason]
- Drift caught (if any): [...]
- Recommend immediate-next: [...]
```

ROLL. Bishop monitoring `relay.lianabanyan.com` TLS status in parallel.

— Bishop · BP081 · 2026-06-12
