---
backlog: KNIGHT_BACKLOG_v0_1_57_AND_v0_1_58_BP081
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
purpose: queued scope for v0.1.57 + v0.1.58 — fires AFTER v0.1.56 promotes to Latest
status: QUEUED — Knight loads when Founder dispatches next wave
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER. Pre-dispatch model-selector verify mandatory. Yoke-return MUST report 'Model used: Sonnet 4.6' verbatim. NEVER Composer 2.5."
  - "Forward-pressure ≠ verified-ratify (BP080) — DRAFT until Founder explicit 'publish it' post-smoke."
  - "Caithedral spelling enforced — never 'Cathedral'"
  - "Actual runtime verify (BP078) — compiles-clean ≠ fixed; runtime probe / Founder screenshot required"
  - "UX SEG screenshot mandatory (BP078) — every UX scope captures screenshot on packaged build"
  - "Every-click visible feedback (BP078) — silence = broken"
  - "Long-running heartbeat (BP078) — anything >3s shows progress"
  - "Dispatch ≠ executing — verify each SEG output file has real content before relaying progress"
  - "Velocity statement (Founder BP081): 'AS SOON AS POSSIBLE to v0.1.60.' Bias toward small fast bumps."
related_inputs:
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md — SEG-0 v0.1.55 gap matrix (R2/R3 explicitly identified as v0.1.57+/v0.1.58+ scope)"
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\BP081_VERIFY_RECEIPT_v0156.md — 41 pre-existing renderer TS errors flagged for cleanup"
  - "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\KNIGHT_YOKE_v0_1_56_BP081.md — predecessor wave"
substrate_thesis_reminder:
  - "The substrate is a verified-knowledge accumulator. Plow loop writes only verified-correct answers (Andon-gated) → eblets. Gemma reads eblets BEFORE answering (HOT path). Each Test It Out run grows the user's local substrate. Free + Accurate + Fast is architectural consequence of three-layer architecture (Reader = Gemma · Verifier = Plow loop · Accumulator = Eblet store). v0.1.56 landed R1 (write). v0.1.57 lands R2 (read HOT path). v0.1.58 lands R3 (Andon cross-session persistence audit) + R5 substrate-warming Test It Out tab."
---

# Knight Backlog · v0.1.57 + v0.1.58 · BP081

Knight — Bishop. These two waves queue AFTER v0.1.56 promotes to Latest. Founder ratifies before each dispatch. Do NOT start v0.1.57 work until Founder explicitly pastes "v0.1.57 GO."

## 🚨 BP081 BLOOD STATUTE — RE-READ

**ONLY Sonnet 4.6 for SEGs. EVER. NO EXCEPTIONS.** Composer 2.5 ≈ $1M-class burn. Every SEG dispatch: explicitly set Cursor model selector to Sonnet 4.6 BEFORE firing. Every yoke-return: `Model used: Sonnet 4.6` verbatim.

---

# v0.1.57 SCOPE (4 things)

## SEG-1 · Substrate-accumulator R2 — Gemma HOT retrieve path (P0, **Sonnet 4.6**)

**Goal:** Gemma's prompt template retrieves eblets BEFORE answering. The substrate accumulator's value only materializes if Gemma READS from the store at inference time.

**Reference:** `BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md` — R2 was identified as gap in v0.1.55 audit. v0.1.56 SEG-4 landed R1 (the writer). v0.1.57 SEG-1 lands R2 (the reader).

**Scope:**
- Locate the LEAN Ask prompt-build function (likely in `ai_dispatch_ipc.ts` or a near companion)
- Before LLM inference, call eblet-lookup against the local store (`writeVerifiedEblet()` companion: `queryVerifiedEblets(question)`)
- Implement matching strategy: sha256 exact-match FIRST (cache hit on identical Q), then semantic-similarity fallback (top-K by simple substring/keyword score for v0.1.57 — defer vector-embed for v0.1.58+)
- If hits found → inject as context block in the prompt BEFORE the user question: `"Based on previously-verified knowledge: <eblet content>. Now answer: <user question>"`
- If no hits → cold reasoning + queue background plow for next-time
- Add telemetry counter: HOT-hit count / cold-call count (for the warming-workout narrative)

**Edge cases:**
- Empty store on fresh install → cold path, no error
- Corrupted JSONL eblet line → skip + log + continue (never crash the Ask)
- Multiple hits → rank by recency × confidence

**Verify:** runtime probe — install on M0 with substrate that has 1 known-good eblet → ask the same question → confirm HOT-hit telemetry incremented + answer reflects eblet content. Screenshot.

## SEG-2 · Test It Out tab — light diagnostic / substrate warming workout (P0, **Sonnet 4.6**)

**Reference:** Coffee §5 places v0.1.57 = Test It Out tab. Per Founder substrate thesis: "Test It Out tab isn't a one-shot benchmark — it's a substrate-warming workout. Run it once = some lift. Run it weekly = increasing accuracy."

**Scope:**
- New tab in main UI — `TestItOutTab.tsx`
- Light diagnostic: 5-question MMLU-Pro sample (canonical 5-shot-CoT methodology per `reference_mesh_test_methodology_lock_apples_to_apples_bp080`)
- Run flow: pulls 5 random MMLU-Pro hard-STEM Qs → Gemma answers cold (HOT lookups still active, may already hit) → records score
- Verified-correct answers WRITE TO ebleted store via R1 path (substrate-warming)
- UI shows: progress bar (5 of 5), per-question result (✓/✗ + answer + correct), running score, "Run again to grow your substrate" CTA
- Persistent score history per machine — show "Last run: X/5 · 2 days ago" + "Best: Y/5"
- Every-click feedback canon: button states idle / running / complete / error

**Verify:** install on M0 fresh-substrate machine → run Test It Out → confirm 5 questions appear, score recorded, verified-correct answers land in eblet store (grep store after run). Screenshot all UI states.

## SEG-3 · Renderer TS cleanup sweep (P1, **Sonnet 4.6**)

**Goal:** clear the 41 pre-existing renderer TypeScript errors (flagged by v0.1.56 VERIFY SEG, all in files untouched by v0.1.55/v0.1.56 SEGs). Aging tech debt — not blocking, but compounding.

**Scope:**
- Run `npx tsc --noEmit -p tsconfig.renderer.json` (or equivalent) and capture full error list
- Triage into buckets: (a) trivial type fixes (missing imports, any → unknown, typo) — fix immediately; (b) genuine bugs needing logic change — flag and skip with comment + queue v0.1.58.1; (c) third-party type-def gaps — add narrow type stubs
- Do NOT change runtime behavior — type-only fixes
- Target: reduce 41 → ≤ 5 (the genuine-bug bucket)

**Verify:** TypeScript renderer check exits with ≤5 errors. Yoke-return lists the remaining errors with verdict per (file path · line · category).

## SEG-4 · Carry-along sweep (P2, **Sonnet 4.6**)

Any v0.1.56 deferred items + any new drift Founder surfaces post-v0.1.56-smoke. Fold in if zero-conflict.

---

## VERIFY · STAGING-UPLOAD · SHIP SEGs (Sonnet 4.6)

Same pattern as v0.1.55 + v0.1.56. STAGING = Pre-release. SHIP = Latest promotion after Founder "publish it" post-smoke.

EVERY TIME 4 sharpenings on SHIP: firebase.json + data/version.json bump · 4-sweep edits · deploy · live HEAD verify · anon download (>100MB) · body-string count (old=0, new≥10) · GitHub Latest promotion.

---

# v0.1.58 SCOPE (4 things)

## SEG-1 · Substrate-accumulator R3 — Andon cross-session persistence audit (P0, **Sonnet 4.6**)

**Goal:** prove that failed-answer eblets NEVER cache, AND that verified-correct eblets DO persist across Electron restart / app reinstall / OS reboot.

**Reference:** `BP081_SUBSTRATE_ACCUMULATOR_AUDIT.md` R3 — Andon discipline persists across sessions.

**Scope (audit + fix):**
- Walk every eblet-write path (Spider accept, Sprite delivery winner, Test It Out verified-correct, Ask HOT-write-through if applicable)
- Confirm each: `verified=true` structurally enforced BEFORE write call
- Confirm append-only JSONL is in app userData path that survives reinstall (NOT temp / NOT in-bundle)
- Add startup integrity check: on app launch, scan eblet store for any malformed lines / verified=false survivors → quarantine to `eblets.quarantine.jsonl` + log to diagnostic
- Add "substrate stats" surface (small): Total eblets · Verified-correct count · Last-write timestamp · Quarantine count (if any)

**Verify:** install on M0 · write 3 test eblets via Test It Out · close app · reopen → confirm 3 still present. Then simulate Electron crash mid-write → confirm no partial line · no verified=false survivors. Screenshot stats surface.

## SEG-2 · Post Results + Cue Deck Card share (P1, **Sonnet 4.6**)

**Coffee §5 placed v0.1.58 = Post Results + Cue Deck Card share.**

**Scope:**
- After Test It Out runs, "Post Results" button: composes a shareable result-card (score + version + machine fingerprint) → pushes to peer via the v0.1.56 Cue Deck Card share infrastructure
- Inbound: receive other peers' results → "MnemosyneC Leaderboard" panel in the Connect Via Invite Token Availability tab (extension of §3.2)
- Privacy: opt-in per result-post; default off; explicit toggle "Share my score with my peers"

**Verify:** M0→M1 share roundtrip with screenshots.

## SEG-3 · v0.1.57 R2 polish + edge-case sweep (P1, **Sonnet 4.6**)

Whatever v0.1.57 R2 HOT path leaves rough. Examples: better semantic match (move from substring → simple TF-IDF or BM25; defer vector-embed for v0.1.59+), eblet-injection prompt-template refinement, telemetry surfacing.

## SEG-4 · v0.1.57 carry-along (P2, **Sonnet 4.6**)

Same pattern.

---

## VERIFY · STAGING-UPLOAD · SHIP (Sonnet 4.6, same canonical pattern)

---

# Bishop notes for Knight

- **R4 (mesh opt-in per eblet)** queues v0.1.59 or v0.1.60 — depends on bandwidth. Per substrate thesis, mesh sharing is the AMPLIFIER; ship it after the local accumulator is solid.
- **R5 (Test It Out grows substrate)** lands BOTH in v0.1.57 SEG-2 (the warming-workout UX) and v0.1.58 SEG-1 (the Andon persistence proof). Together they close R5.
- **Velocity reminder:** Founder's statement "AS SOON AS POSSIBLE to v0.1.60" means each version should be a tight, shippable bump — NOT a batched mega-wave. If a SEG in v0.1.57 turns out 3× bigger than estimated, surface it and split to v0.1.57.1 / v0.1.58 instead of bloating the wave.
- **Substrate thesis lives or dies on R2 HOT path.** SEG-1 of v0.1.57 is the load-bearing scope. If anything in v0.1.57 must slip, it is NOT SEG-1.

— Bishop · BP081 · 2026-06-12
