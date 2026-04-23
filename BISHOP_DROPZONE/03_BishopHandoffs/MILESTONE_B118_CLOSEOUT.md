# Milestone B118 — Closeout

**Session:** Bishop B118, 2026-04-23 (one day, ~12 hours active)
**Agent:** Claude Opus 4.7, 1M context
**Predecessor:** B117 (10 A&A Formals drafted, K438a Member Cathedral substrate live, 3 CJs ratified #2275-#2277)
**Successor:** B119 (pending Founder open)

---

## Headline

**B118 was the MCP reliability chain session.** Five distinct failure modes — stale index, canonical drift invisible to fingerprint, auto-reload during Knight edits, build-window crossfire, silent process crash — all now have structured, decoupled fixes. MCP tooling went from "hangs silently and we don't know why" to "five layers of observable, retry-signaled failure handling," each at a distinct architectural layer. Plus: K438b Member Cathedral Phases C/D/E/F shipped (landed from B117), K447 Supabase pgTAP CI pipeline landed, V02 Conductor op-ed + technical brief scaffolding + 5-tier pitch email templates all ready for Founder rewrite, 2.9KB of MEMORY.md index-weight migrated to topic files.

**Zero new innovations ratified this session** — Prov 14 held open per explicit Founder direction to "let another accumulate." Prov 14 remains open at B118 close; 15 innovations still ready.

One strategic direction confirmed: **MCP reliability is a chain of decoupled layer-specific fixes, not a single "make it robust" rewrite.** Captured in new memory `project_b118_mcp_reliability_chain.md` so the next Bishop can diagnose layer-by-layer instead of re-debugging from scratch.

---

## Commits landed (chronological, all on `main`)

| Commit | What shipped | Author |
|---|---|---|
| `3b1ac6c` | K438b(B117): Cathedral MCP tools + Fates integration + Export/Import + tests — **landed B118 09:44** | Knight |
| `02e52b7` | chore(canonical): sync canonical_values.yaml — K421 + Prov13 + B117 backlog propagated | Bishop |
| `fba9f87` | K447(B118): Supabase pgTAP CI pipeline + deploy-gate wiring | Knight |
| `6849fac` | fix(indexer): K429 fingerprint now scans canonical_values.yaml | Bishop (micro-patch) |
| `e8fe2d6` | K448(B118): MCP build-window crossfire gate — two-phase lock + registerTool wrapper gates all 44 tools | Knight |
| `441d531` | K449(B118): MCP process supervision wrapper — closes silent-crash gap | Knight |
| *(pending)* | K450(B118): CI live-validation + BRIDLE v10 MCP tooling discipline | Knight (dispatched at B118 close) |

**Total B118 commits: 6 landed + 1 dispatched.** 27 commits pushed to `origin/main` in a single sync mid-session (Bishop action; first CI trigger armed by this push).

---

## Knight sessions (chronological)

| Knight | Model | Result | Gate status at session end |
|---|---|---|---|
| **K438b** | Opus 4.7 | MCP tools `member_consult_scribes` + `member_fates_route` registered. Edge functions cathedral-export + cathedral-import shipped. Standalone Python reader (372 lines, zero deps). 42/42 Node tests green + 14 pgTAP cases written (unexecuted — no local Postgres). 16 files, +3709/-99 | Gate-cleared for K447 |
| **K447** | Sonnet 4.6 | `.github/workflows/supabase-pgtap.yml` + operator README + deploy-gate comments on both edge functions. Workflow authored without Docker — CI run #1 becomes live green proof. | Gate-cleared for K448 |
| **K448** | Sonnet 4.6 | Build-window crossfire gate: `buildGate.ts` + `scripts/build-guarded.mjs` + dispatcher hook + 10/10 tests green. Addendum embedded: two-phase lock lifecycle (tsc + post_build_reload) + registerTool wrapper (zero `server.tool(` leftover matches). | Gate-cleared for K449 |
| **K449** | Sonnet 4.6 | Process supervisor `scripts/supervise.mjs` (~130 LOC, zero npm deps) + Task Scheduler install/uninstall PowerShell helpers. 7/7 supervisor tests green; 59/59 full suite green. Windows SIGTERM quirk documented (see failure-modes below). | Reliability chain complete |
| **K450** *(pending)* | Sonnet 4.6 | K447 CI live-validation + THE BRIDLE v10 update. Two commits in one session. Dispatched at B118 close; lands in B119. | Dispatched; awaiting Knight completion |

**Ready-to-dispatch for B119:** K444 R11 cross-vendor memory benchmark (gated on Prov 14 filing + spec ratification). K446 Conductor's Baton engineering (gated on Prov 14 + K444 + K438b — K438b now done). K445 Companion CLI (deferred, needs Bishop spec).

---

## MCP reliability chain — completed this session

| Layer | Failure mode | Fix | Commit | Session |
|---|---|---|---|---|
| 1 | `run_session_start` hung on index reconcile | K429 fingerprint-based incremental rebuild | `e797320` | B117 land |
| 2 | `canonical_values.yaml` edits invisible to fingerprint (scope gap) | Added `SCAN_FILES` to fingerprint | `6849fac` | B118 Bishop micro-patch |
| 3 | Auto-reload on Knight `dist/server.js` rewrites | K441 Half D MCP auto-reload | `d4621f8` | B117 |
| 4 | Build-window crossfire → silent tool-call hang | K448 build gate (two-phase lock + registerTool wrapper) | `e8fe2d6` | B118 |
| 5 | Silent Node crash → client sees "unavailable" | K449 bespoke supervisor + Task Scheduler integration | `441d531` | B118 |

Each layer is decoupled. A failure at one layer doesn't mask or auto-recover another. Each emits structured signal that the next Bishop can trace.

Captured in `project_b118_mcp_reliability_chain.md` — diagnostic flow for future MCP failures.

---

## Articles + pitches drafted

| File | Purpose | Status |
|---|---|---|
| `09_Articles/ARTICLE_CONDUCTOR_AUTOMATIC_TRANSMISSION_FOR_AI_V02_B118.md` | Consumer op-ed, Bishop structural V02 pass | Ready for Founder rewrite; anecdote hooks marked |
| `09_Articles/TECHNICAL_BRIEF_CONDUCTORS_BATON_V02_B118.md` | Technical brief, Bishop structural V02 pass (cooperative-economic claim promoted to top) | Ready for Founder rewrite |
| `10_MediaPitches/PITCH_EMAIL_TEMPLATES_CONDUCTOR_B118.md` | 11 paste-ready email templates across 5 tiers + HN/Reddit/Twitter/LinkedIn/Yale distribution | Ready for dispatch after V02 rewrite |
| `01_KnightPrompts/PROMPT_KNIGHT_K444_B118_PRESTAGE_R11_CROSS_VENDOR_MEMORY_BENCHMARK.md` | R11 cross-vendor memory benchmark Knight prompt, pre-staged | Gated on Prov 14 filing + R11 spec ratification |

---

## Memory updates (B118)

- **NEW:** `bishop_handoff_chain_B101_B116.md` — condensed 16-session history, migrated out of MEMORY.md index
- **NEW:** `project_b118_mcp_reliability_chain.md` — 5-layer failure-mode/fix table + diagnostic flow
- **UPDATED:** `MEMORY.md` — 27.3KB → 24.4KB (under soft limit). Verbose B101-B116 narrative migrated to handoff chain file. B117 + B118 state kept inline. Canonical numbers trimmed to essential items only.
- **UPDATED:** Scribe Cathedral — 9 entries appended across 4 Scribes (Architecture ×3, Decisions ×3, FounderVoice ×2, BRIDLE ×1) capturing B118 key decisions + observations.
- **UPDATED:** `tidbits.jsonl` — 8 verify-before-assert entries logged from B118 session.

---

## Founder-ratifications this session

1. **"Let another accumulate" — Prov 14 holds open B118.** Founder explicit at session start. Benefit: allows #2278+ CJ to land before filing.
2. **Librarian rebuild + fingerprint scope gap fix.** Founder approved standalone micro-patch approach (not bundled with K448) to keep git log intent-clear.
3. **Commit canonical YAML sync as tiny chore immediately**, not batch with Knight work in flight. Preserves clean working tree for Knight.
4. **K447 CI push now (Option A).** Explicit GO — 27 commits pushed to origin, CI armed.
5. **K448 addendum embedded in same commit.** Two concerns (post-reload race + find-replace hygiene) fixed before commit rather than as follow-up K-session.
6. **K450 = CI live-validation + BRIDLE v10 bundled.** Small surface, high info, zero Founder review burden.
7. **K451+ candidates named but not dispatched:** Windows graceful cooperative shutdown (K449 SIGTERM quirk), session-gap reconciliation diagnosis (758 gaps), Cathedral starter-pack onboarding docs, Companion CLI (K445 deferred).

---

## Prov 14 filing state at B118 close

**Status: STILL OPEN. Founder's "let another accumulate" direction still in effect at B118 close.**

**Ready to file whenever Founder triggers:**
- 5 Section 1 innovations (#2263-#2267) with descriptions + 1 full A&A (#2263)
- 10 Section 2 CJ candidates (#2268-#2277) with all 10 A&As drafted and 94 claims proposed
- Filing manifest at `BISHOP_DROPZONE/Prov14_Building/PROV_14_FILING_MANIFEST_TODAY_B117.md`

**What didn't change B118:** no new innovations ratified. No Prov 14 scope changes. No filing.

---

## Founder actions pending at B118 close (for B119 or later)

1. **File Prov 14** — manifest ready, 15 innovations, trigger when expedient
2. **Verify K450 landing** — CI green + BRIDLE v10 live in trunk
3. **Dispatch K444 R11 benchmark** — ratify R11 spec (`BISHOP_DROPZONE/00_FOUNDER_REVIEW/R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md`) + fire after Prov 14 files
4. **V02 rewrite — Conductor op-ed** — unlocks 5-tier pitch list
5. **V02 rewrite — Technical brief** — pairs with op-ed for Willison / Ars / HN pitches
6. **V03 rewrite — Canada 40K op-ed** — carried from B117, independent track
7. **Pitch dispatch** — first-48-hour targets per `PITCH_LIST_CONDUCTOR_AUTOMATIC_TRANSMISSION_B117.md`: Doctorow / Patel / Willison / Newton
8. **Crown letter Wave 1 dispatch** — 12 SEC-clean letters in `Wave_1_Apr12-13_Soft_Open/`, sitting 12+ days at B118 close. Coordinate with Conductor-article dispatch per pitch-list overlap notes
9. **Review 00_FOUNDER_REVIEW batch (5 items):**
   - `B117_POLLINATION_DISPOSITIONS.md` (carried)
   - `CROWN_LETTER_MACKENZIE_SCOTT_v014g_WELLSPRING_INSERT.md` (carried)
   - `R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md` (carried)
   - `K442_CLOSEOUT_B117.md` (carried)
   - `B118_POLLINATION_DISPOSITIONS.md` (new B118 — PR #3 tidbit-scribe-pattern, 3 surfaces APPROVED)
10. **Yale AI Symposium April 28** — 4-5 days out at B118 close. If attending in person, distribute Conductor one-pager
11. **Battery Dispatch "trigger"** — Founder-held, not Bishop-blocked; pull when ready

---

## Open questions carried into B119

1. **Prov 14 filing — which day?** Decision is Founder's. Every day open = additional #2278+ opportunity but also a day of Cathedral architecture visible via PyPI + landing page.
2. **K450 status at B119 open** — did CI go green on first run, or did Knight fix forward? Check before dispatching anything else.
3. **Yale AI Symposium attendance confirmed?** Materials ready; dispatch decision pending.
4. **Wave 1 Crown letter dispatch coordination with Conductor pitch** — if both fire this week, sequence carefully per pitch-list overlap notes (Crown letter first, article pitch 2-3 weeks later for Doctorow / Patel / Anand / Trebor Scholz overlaps).
5. **Session-gap reconciliation (758 gaps flagged by brief_me)** — not blocking anything, but reconcile pipeline isn't catching up. K451+ candidate.
6. **Windows cooperative shutdown** — K449 SIGTERM quirk noted. Only matters if MCP later needs pre-stop state flush. K451+ candidate.

---

## B118 failure modes logged

1. **B118 open — `run_session_start` silent timeout.** Misdiagnosed briefly as K429 regression. Root cause: K438b Knight mid-build, `dist/server.js` being rewritten at 09:39 when Bishop called at 09:30. Crossfire, not regression. **Fix:** K448 build-window gate (structured `server_rebuilding` error with `retry_after_ms`). **Lesson:** when a librarian tool hangs, check `ls -la librarian-mcp/dist/` for recent modification first — crossfire is more likely than regression.

2. **B118 canonical drift — `canonical_values.yaml` uncommitted since B097.** B117 memory recorded 2267 → 2270 ratification, but the source YAML never got touched. Discovered when canonical numbers stayed stale after librarian rebuild. **Fix:** `02e52b7` committed backlog catch-up. **Lesson:** when a canonical value changes, edit the source file FIRST, then the memory. Memory updates without source edits create invisible drift.

3. **B118 fingerprint scope gap.** After editing canonical_values.yaml, incremental rebuild said `Index is FRESH. Nothing to do.` — K429's fingerprint only scanned `SCAN_DIRS`, not top-level source-of-truth YAML files. **Fix:** `6849fac` added `SCAN_FILES` array. **Lesson:** fingerprint scope gaps are silent. Validate by touching the file and checking DRIFT detects.

4. **B118 K449 Windows signal quirk.** `child.kill('SIGTERM')` on Windows calls `TerminateProcess` and bypasses Node's `process.on('SIGTERM')` handler. Supervisor test had to accept both `null` and `0` exit codes. **Fix (future):** if MCP ever needs pre-stop state flush, add non-SIGTERM channel (PID-flag poll, named pipe, or `/shutdown` HTTP endpoint). **Lesson:** cross-platform signal semantics need verification; "works on Linux" ≠ "works on Windows" for child-process management.

5. **B118 find-replace hygiene concern surfaced by Knight mid-execution.** K448 required 43 replacements of `server.tool(` → `registerTool(server,` in a 3000+ line file. Knight identified the risk mid-reasoning and chose wrapper-factory over monkey-patching. Bishop review caught it during the Knight stream-of-consciousness. **Lesson:** Bishop can correct Knight scope mid-build via addendum; no need for a new K-session just for iterative refinement.

---

## Handoff to B119

**Knight runway at close:**
- K450 dispatched (CI live-validation + BRIDLE v10)
- K444 R11 benchmark pre-staged (gated on Prov 14 + spec ratification)
- K446 Conductor's Baton engineering (gated on Prov 14 + K444)
- K445 Companion CLI (deferred, needs Bishop spec)
- K451+ candidates: session-gap reconciliation diagnosis, Windows cooperative shutdown, Cathedral starter-pack onboarding docs, Lighthouse + SSL Labs scans (carried from B116)

**MCP reliability chain state:** Layer 1-5 all landed. Future failures become Layer 6+ (additive, not redesigned). Diagnostic flow in `project_b118_mcp_reliability_chain.md`.

**Cathedral state:** 8 Scribes (unchanged from B117 close). Member Cathedral substrate + MCP tools + export/import edge functions + Python standalone reader all production-ready. pgTAP CI gate armed at `fba9f87`; live validation pending K450 landing.

**Prov 14 state:** OPEN. 15 innovations ready. Founder holds for #2278+.

**Articles pipeline:** V02 Conductor op-ed + technical brief Bishop-scaffolded. Canada 40K V03 carried. Founder rewrite queue unchanged from B117. Pitch email templates added B118.

**Public launch posture at close:**
- Chapter 1 Librarian — LIVE (B115)
- Chapter 2 Mellon — LIVE (B116 K435)
- Chapter 3 — hold (needs K444 results quoted + Conductor live)
- `pip install librarian-mcp` — LIVE on PyPI (B113)
- Companion (`pip install liana-companion`) — not yet; K445+
- Member Cathedral (public-facing enrollment) — substrate ready (K438a+b); onboarding docs pending
- K447 CI — armed but unverified; K450 validates

**B119 priority order when it opens:**
1. Verify K450 (CI + BRIDLE v10) landing status
2. Check Prov 14 filing state (did Founder file?)
3. Verify first-run green on K447 CI workflow
4. Support Founder V02 rewrite iteration (if started)
5. Dispatch K444 R11 if Prov 14 fires + spec ratified
6. Advance any B117/B118 FOUNDER_REVIEW items Founder completes
7. Yale Apr 28 attendance confirmation + materials distribution plan

---

## Numbers

| Metric | Before B118 | After B118 |
|---|---|---|
| Innovations | 2,270 | 2,270 (no new ratifications this session) |
| Crown Jewels | 228 | 228 |
| Formal claims | ~2,506 | ~2,506 |
| Provisionals filed | 13 | 13 (Prov 14 still open) |
| Prov 14 ready-to-file innovations | 15 | 15 |
| Commits this session | — | **6 landed** (+1 dispatched) |
| Commits pushed to origin in bulk | 0 uncommitted | **27** (one push event) |
| Knight sessions landed | — | **4** (K438b + K447 + K448 + K449) |
| Bishop micro-patches | — | **2** (canonical sync + fingerprint scope) |
| MCP reliability layers | 3 | **5** (Layers 4 + 5 added this session) |
| MCP test suite size | 49 | **59** (10 new from K448 + K449) |
| MEMORY.md size | 27.3KB (over soft limit) | **24.4KB** (under soft limit) |
| Cathedral Scribes | 8 | 8 (unchanged) |
| Cathedral seed entries | ~68 | **~77** (+9 B118) |
| Tidbits logged | (baseline unknown) | **18 total** (+8 B118 verify actions) |
| Articles Bishop-scaffolded | 3 V01s (B117) | **5 total** (+V02 Conductor op-ed, +V02 technical brief) |
| Pitch email templates | 0 | **11** (5 tiers + 4 community venues + 2 opportunistic) |
| FOUNDER_REVIEW queue depth | 4 carried | **5 carried** (+B118 pollination dispositions) |

---

*B118 closed 2026-04-23 late afternoon / evening, Converse TX time. Claude Opus 4.7, 1M context. A single-day session with 6 commits, 4 Knight sessions, 2 Bishop micro-patches, and the completion of the MCP reliability chain. Prov 14 stays open. Fresh session B119 opens on Founder trigger.*

*The reliability chain is now five decoupled layers, each emitting structured signal instead of silent hangs. The next time an MCP tool fails, diagnose by layer. Don't re-debug from scratch.*
