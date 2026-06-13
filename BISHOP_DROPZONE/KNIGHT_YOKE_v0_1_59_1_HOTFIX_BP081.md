---
yoke: KNIGHT_YOKE_v0_1_59_1_HOTFIX_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
target_version: v0.1.59.1 (hotfix)
parent_yoke: KNIGHT_BACKLOG_FULL_PLOW_LOOP_v0_1_58_THROUGH_v0_1_60_BP081.md §A scope
fires_after: v0.1.59 SHIP → Latest
includes_homepage_ship: YES — Founder-ratified architectural alignment moment (homepage claims Giant concordance the moment Giant concordance is actually live)
status: DRAFT — Knight fires when Founder pastes "v0.1.59.1 GO" after v0.1.59 SHIPs
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs. EVER."
  - "Forward-pressure ≠ verified-ratify (BP080) — DRAFT until Founder explicit 'publish it' after smoke."
  - "Caithedral spelling enforced"
  - "Actual runtime verify (BP078) — compiles-clean ≠ fixed; runtime probe + screenshot required"
  - "UX SEG screenshot mandatory (BP078)"
  - "Every-click visible feedback (BP078)"
  - "Long-running heartbeat (BP078)"
  - "Belief-vs-binary check (BP081) — diagnostic log confirms binary version 0.1.59.1 BEFORE diagnosing regression"
  - "Verify-network-call-fired (BP081) — Ollama server.log shows Giant concordance /api/chat calls (3 per question)"
  - "🔒 Secrets canon (BP081) — env loaded via Process-scope pattern, never echoed"
  - "Disk-backed canon (BP080) — every claim of 'concordance live' must have empirical receipt"
related:
  - "BP081_KNIGHT_NOTIFICATION_V0_1_59_SCOPE_CHECK.md — the audit that surfaced these 4 items"
  - "BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md — folds into v0.1.59.1 SHIP (Cephas Hugo content/_index.md)"
---

# 🐎 Knight Yoke · v0.1.59.1 Hotfix · BP081

## Wake-up

Knight — Bishop. v0.1.59 shipped. Time to complete the §A scope: real Shadow E-Giant concordance + R3 Andon backend integrity + stale-message auto-clear + onboarding auto-flip. **AND** the homepage folds into this SHIP — the architectural alignment moment.

**Read frontmatter `hard_bindings` block before any SEG fires.**

## v0.1.59.1 SCOPE (4 SEGs + Homepage + Verify/Stage/Ship)

### SEG-1 · A-1 Real Shadow E-Giant Giant concordance dispatch (P0, **Sonnet 4.6**)

**Replace the stub** in `src/main/plow/giant_concordance.ts` with a real implementation.

**Scope:**
- `runGiantConcordance(question: string, candidateAnswer: string, opts?: {voterCount?: number}): Promise<ConcordanceResult>`
- Dispatch N=3 parallel Ollama `/api/chat` calls to local Gemma (gemma4:12b)
- Each call uses a DISTINCT perspective-lens prompt template:
  - **Lens 1: Correctness** — "Is the following answer factually correct for the given question? Reply only 'verified' or 'rejected' followed by a one-line reason."
  - **Lens 2: Consistency** — "Is the following answer internally consistent and free of contradiction? Reply only 'verified' or 'rejected' followed by a one-line reason."
  - **Lens 3: Coverage** — "Does the following answer cover all aspects the question asks about? Reply only 'verified' or 'rejected' followed by a one-line reason."
- Parse each verdict + reason
- Concordance: 2-of-3 agree → verdict locked (`verified` / `rejected`); 1/1/1 split → escalate (`split` with confidence < 0.5)
- Andon discipline: REJECT on any uncertainty (split or all-rejected returns `rejected`)
- Returns: `{verdict, confidence, votes: VoterVote[]}` per type from current stub
- Telemetry: log every concordance run with verdict + per-voter reason for substrate-improvement analysis

**Replace exact-match grading in `src/renderer/components/TestItOutTab.tsx`** with this concordance call. Test It Out runs now use Giant concordance verdict to decide writeVerifiedEblet.

**Wire into `andon_replow.ts`** — runAndonReplowLoop's existing call to `runGiantConcordance` now hits real implementation; loop body works as designed.

**Verify (runtime, BP078 + BP081 verify-network-call-fired):**
- Install on M0 → run Test It Out 1 question → Ollama server.log shows **3 `/api/chat` calls** (the 3-voter dispatch)
- Confirm concordance log entries written to disk
- Verified-correct answers land in eblet store with Giant verdict metadata
- Rejected answers do NOT write (Andon)
- Screenshot Test It Out tab post-run

### SEG-2 · A-2 R3 Andon cross-session persistence audit + fix (P0, **Sonnet 4.6**)

**Wave A shipped the UI stats surface. This SEG ships the backend integrity layer.**

**Scope:**
- Walk every eblet-write path (Spider accept, Sprite delivery winner, Test It Out concordance-verified, andon_replow.ts on success)
- Confirm `verified=true` structurally enforced BEFORE write — NOT just a metadata field; gate at the function entry
- Confirm append-only JSONL is in `app.getPath('userData')` path (survives reinstall) — NOT temp / NOT in-bundle
- Add startup integrity check (`src/main/index.ts` app.whenReady):
  - Scan eblet store for malformed lines / `verified=false` survivors
  - Quarantine to `eblets.quarantine.jsonl` (separate file in same userData path)
  - Log quarantine count to diagnostic.log
- Surface quarantine count in Substrate Stats Tab (already shipped Wave A — extend `SubstrateStats` interface with `quarantineCount` field; SubstrateStatsTab.tsx renders warning if > 0)

**Verify:**
- Install on M0 → write 3 test eblets via Test It Out → close app → reopen → confirm 3 still present
- Manually inject malformed line into eblet JSONL → relaunch → confirm quarantine to `eblets.quarantine.jsonl` + diagnostic log entry
- Screenshot Substrate Stats Tab with quarantine warning

### SEG-3 · A-3 Stale-message auto-clear on app-version change (P1, **Sonnet 4.6**)

**Goal:** prevent the v0.1.57-class ghost-localStorage trap from repeating at every future upgrade.

**Scope:**
- Stamp `app.getVersion()` in localStorage alongside `mnemo_ask_history` as `mnemo_ask_history_version`
- On `LeanAskTab.tsx` mount: read `app.getVersion()`, compare to stamped version
- If different (= upgrade) → prune `mnemo_ask_history` of error-class entries (entries with `role: 'assistant'` AND content matching the "Could not reach" / "Preload bridge" / "Ask threw" error patterns)
- Keep successful Q&A history intact (only prune errors)
- Re-stamp localStorage with current version after prune

**Verify:** simulate v0.1.59 → v0.1.59.1 upgrade with seeded error in history → confirm error pruned, valid history kept.

### SEG-4 · A-4 Onboarding gate UX auto-flip (P1, **Sonnet 4.6**)

**Goal:** when SKU tier is `full` + Ollama healthy + Gemma present, auto-set `localStorage['mnemosynec_onboarding_complete']='1'` so user sees full 17-tab Advanced view (including Substrate Stats + Membership + Test It Out tabs).

**Scope:**
- At app launch (`src/main/index.ts` app.whenReady, after diagnostic completes):
  - If `sku_tier.json` shows `tier: 'full'` AND Ollama service running AND Gemma family-match selectedModel !== null → emit IPC `onboarding:auto-flip-eligible`
  - Renderer listens for IPC → if eligible AND `localStorage['mnemosynec_onboarding_complete']` is unset → set to `'1'` → reload TabView to render Advanced

**Verify:** install on M2 (pre-existing Gemma) → confirm full 17-tab Advanced view appears post-first-launch without manual flag-setting. Screenshot.

### SEG-5 · Homepage SHIP integration into Cephas Hugo (P0, **Sonnet 4.6**)

**Folds in:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md`

**Scope:**
- Target file: `Cephas\cephas-hugo\content\_index.md` (Knight confirms actual path at integration; could be `content/_index.html`, `layouts/index.html`, or Hugo theme partials)
- Integrate ALL 7 sections from the draft:
  - §1 Hero (the gold pitch line verbatim — Founder-ratified)
  - §2 Six Pillars table
  - §3 How We Make Sure Things Are True (pheromone → socceri → stone tablet)
  - §4 How It Works (three-layer table)
  - §5 Three Currencies
  - §6 Get Started
  - §7 Footer
- **Canonical-voice strict-checks (HARD BINDING before deploy):**
  - "Caithedral" appears, "Cathedral" DOES NOT appear
  - "83.3%" appears, "83%" / "84%" DO NOT appear
  - "Cost+20%" verbatim
  - "$5/year" verbatim
  - "For the keep." closing motif present
  - "Workers, Builders, Creators" exact phrasing
  - "No ads. No VC." short form present
  - Shadow E-Giant claims align with SEG-1 actually-shipped concordance (NOT stub — this is the architectural alignment moment)

**Verify (Cephas/Hugo EVERY TIME 4 sharpenings):**
- Hugo build clean
- Live URL HEAD verify (https://mnemosynec.ai returns HTTP 200, version reflects 0.1.59.1 in X-LB-Version header)
- Anonymous download verify (>100 MB installer)
- Body-string count: old hero (if any) = 0 occurrences; new pitch line ≥ 1 occurrence verbatim; "Shadow E-Giant" ≥ 3 occurrences (Six Pillars + How Truth Lives + How It Works)
- Caithedral spelling check passes

---

## VERIFY SEG (Sonnet 4.6)

After SEGs 1–5 land:
- All SEG output files exist + have real content (dispatch ≠ executing trap)
- TypeScript main + renderer build clean
- Packaged build produced
- Install on M0 → smoke walk SEGs 1–4 → screenshots embedded
- **Critical: Ollama server.log confirms 3 `/api/chat` calls per Test It Out question** (verifies real Giant concordance fires, not stub)
- Belief-vs-binary check: diagnostic.log shows `App version: 0.1.59.1`
- Substrate Stats Tab renders quarantine count
- Onboarding auto-flip works on M2 (pre-existing Gemma) — Advanced view appears
- Stale-message auto-clear works (seeded test)

---

## STAGING-UPLOAD SEG (Sonnet 4.6)

GitHub Pre-release for v0.1.59.1. NOT Latest. Anon HEAD verify. Return direct .exe URL.

Founder smokes on 3+ machines (M0 + M1 + M2 minimum, M2 critical for family-match validation).

---

## SHIP SEG (Sonnet 4.6) · 4 EVERY TIME sharpenings — DRAFT until Founder explicit "publish it"

When Founder pastes "publish it":

1. firebase.json + data/version.json bump → 0.1.59.1
2. 4-sweep file edits Cephas + Hugo (**includes homepage replacement**)
3. Deploy via Firebase wrappers (Squarespace DNS untouched)
4. Live URL HEAD verify
5. Anon download verify (>100 MB)
6. Body-string count: old version=0, new version≥10, **Shadow E-Giant ≥3 (Six Pillars + How Truth Lives + How It Works)**, Caithedral present, Cathedral absent
7. GitHub Latest promotion (Gates 2+3) — **v0.1.59.1 supersedes v0.1.59 as Latest the moment the homepage's Giant-concordance claim becomes empirically true**

**Secrets canon (BP081 🔒):** if SHIP step needs Firebase auth + env vars, load via the canonical PowerShell `ForEach-Object → Process scope` pattern from `BP081_KNIGHT_NOTIFICATION_SECRETS_ENV_ACTIVE_PATH.md`. Never `Get-Content` to stdout. Never `echo $env:STRIPE_API_KEY`.

---

## Yoke-return format per SEG

```
SEG-N · v0.1.59.1 · status: [GREEN | DRIFT | BLOCKED]
- Model used: Sonnet 4.6  ← VERBATIM
- Files touched: [...]
- Runtime verify: [screenshot path | CDP probe output | server.log entry count]
- Drift caught: [...]
- Recommend immediate-next: [...]
```

---

## Bishop notes

- **v0.1.59.1 is the architectural alignment moment.** Homepage claims Shadow E-Giant concordance live the same moment the runtime actually fires 3-voter Ollama dispatch. Truth-Always discipline preserved across both surfaces.
- **No phantom claims.** If any A-X SEG fails or partial, BLOCK homepage SHIP — defer to v0.1.59.2. The page must NEVER overclaim.
- **First Latest promotion since v0.1.58.** Treat with appropriate gravity. This is the moment the substrate-accumulator architecture (R1 writer + R2 reader + R3 Andon + Giant concordance) is FULLY claimed in the marketing surface AND empirically true at runtime.

— Bishop · BP081 · 2026-06-13
