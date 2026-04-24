# Self-Handoff — B122 Session Remaining Work: K477 + K478

**Written by:** Knight/Sonnet 4.6  
**Date:** 2026-04-24  
**Context:** End of B122 session — 3 tasks completed (K480, K479, K476). Two tasks remain: K477 and K478. This note is for the next Knight session resuming B122 work.

---

## Session State: What Was Completed

| Task | Status | Tag |
|---|---|---|
| K480 — Toolsmith Scribe Stand-Up | ✅ LANDED | (committed in previous session) |
| K479 — Synapses Phase 1: Retroactive K475 Capture | ✅ LANDED | `v-synapses-phase-1-retroactive-K479` |
| K476 — KISS CLI Subcommands | ✅ LANDED | `v0.4.0`, `v-kiss-cli-subcommands-K476` (in `librarian-mcp-public/`) |

K476 is fully landed and is the prerequisite gate for K477. The `librarian query --format=comet` CLI is working and the `--format` parameter is the surface K477 will iterate on.

---

## K477 — Injection-Pathway Iterations

**Priority:** Next task to run after this handoff.  
**Predecessor gates:** K475 (landed, tag `v-r12-pawn-comet-definitive-K475`) AND K476 (landed, tag `v-kiss-cli-subcommands-K476`). Both gates cleared.  
**Target tag:** `v-injection-pathway-iterations-K477`  
**Budget cap:** $10 (expected ~$5-7)

### What K477 is

K475 established that the Cathedral-arm Cranewell-auto HOT% is ~12% — far below the 80%+ architectural prediction. Three hypotheses explain the gap. K477 runs three targeted interventions against a 50-question Cranewell and 50-question Covenant mini-benchmark (not the full 300 from K475), scoring HOT% for each:

- **Iteration A — Authoritative-context wrapper**: prefix tablets with explicit authority framing that tells the LLM these are ground-truth sources
- **Iteration B — Multi-turn follow-up**: ask a clarifying "Can you include [specific fact] in your answer?" follow-up when the first response misses a key HOT element
- **Iteration C — Top-K sweep**: increase from k=3 to k=5 and k=8 tablets; more context surface area

The winning iteration becomes the default `--format=comet` behavior in `librarian-mcp-public` (update `cathedral.py:format_query_output`).

### K477 Harness Notes

The benchmark harness approach mirrors K475 (`run_r12_pawn_comet.py`). Key K475 learnings to apply from `synapse_K475.jsonl`:

1. **NO `wait_for_load_state('networkidle')`** — use `domcontentloaded` instead. Perplexity has persistent WebSocket connections that prevent networkidle from ever firing. See K475-001.
2. **Selector**: combine all potential answer area selectors into a single CSS OR-selector string and wait once with a reasonable timeout. See K475-002.
3. **Session persistence**: use `context.storage_state(path=...)` NOT `launch_persistent_context()`. The latter locks the profile directory and causes `exitCode=21` if a prior process was killed. See K475-005 (supersedes K475-003).
4. **Stagger-parallel**: use `asyncio` with a semaphore (10 concurrent max, 15s stagger). Do NOT run serially. See K475-006.
5. **Rate-limit throttle**: if ≥2 rate-limit events occur in the last 10 submissions, increase the stagger interval. See K475-022.
6. **Grading**: K477 uses the same 2-part substring grading as K475 (both required HOT elements must appear in response for a HIT). Be aware that "echo artifacts" (Perplexity echoing question terms) can inflate HOT% on cold arms — this is a methodological caveat to note in the report.

### K477 Deliverables (from prompt)

1. **Iteration A benchmark results** — 50Q Cranewell + 50Q Covenant through authoritative-wrapper format
2. **Iteration B benchmark results** — same corpus, multi-turn follow-up harness
3. **Iteration C benchmark results** — same corpus, k=5 and k=8 tablet sweep
4. **Winner integration** — update `cathedral.py:format_query_output` in `librarian-mcp-public` with the winning format as the default `--format=comet` output
5. **Handoff report** at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K477_B122_INJECTION_PATHWAY_ITERATIONS.md`
6. **Commit + tag** `v-injection-pathway-iterations-K477` in `librarian-mcp-public`

### Corpus files needed

K477 uses the same R12 corpus from K475:
- Cranewell corpus: `librarian-mcp/r12_pawn_comet/corpus/cranewell/` (synthetic pure-fiction)
- Covenant corpus: `librarian-mcp/r12_pawn_comet/corpus/covenant/` (partial-prior)

The K476 CLI's ingest pipeline is the injection mechanism for K477 — the benchmark harness should ingest each corpus into a temp Cathedral using `_cmd_ingest()` programmatically (or `librarian ingest` CLI), then use `_cmd_query()` / `query_cathedral()` + the format variant under test.

---

## K478 — LB Substack Plug

**Priority:** After K477 (or can be parallelized as it's independent).  
**Predecessor gate:** Independent — no dependency.  
**Target tag:** `v-lb-substack-plug-K478`  
**Budget cap:** $3 (expected ~$1-2)

### What K478 is

Sets up the Substack distribution channel for Liana Banyan. File-creation and documentation task — no live API calls, no benchmark runs. Relatively fast.

### K478 Deliverables (from prompt)

1. **`BISHOP_DROPZONE/02_ProjectOps/SUBSTACK_ACCOUNT_SETUP.md`** — account setup documentation with recommended publication name options, checklist of fields Founder fills in personally (bio, avatar, payment info), recommended initial settings (free tier default, paid "Commons Supporter" at $5/mo or $50/yr, Substack Notes enabled, recommendations enabled)

2. **`BISHOP_DROPZONE/02_ProjectOps/SUBSTACK_EDITORIAL_VOICE.md`** — voice guide with:
   - Centering principle: "here's the horse, your reins" (user-sovereignty, NOT walled-garden)
   - Prohibited framings list (anti-patterns: "we built the best AI for you", etc.)
   - Approved framings pattern library
   - Rhetorical Keystones to cite naturally (17+ anchors from `project_rhetorical_keystones.md`)
   - Technical rigor standard (every number claim cites methodology)
   - "Prove it first. Product it second." as editorial filter

3. **Cross-post pipeline scaffolding** — `scripts/substack_crosspost.py`: read article from `BISHOP_DROPZONE/09_Articles/`, format for Substack email, stub the Substack API call (no live publish — publication hold in force). Documented in `BISHOP_DROPZONE/02_ProjectOps/SUBSTACK_CROSSPOST_GUIDE.md`.

4. **Launch content plan** — `BISHOP_DROPZONE/02_ProjectOps/SUBSTACK_LAUNCH_PLAN.md`: first 3 posts mapped (Article 1: Cathedral Effect framing piece using R10/R12 numbers; Article 2: "The reins of our very fast horse" manifesto; Article 3: technical reader piece on the three-tier product structure). Each post: title, hook, key claim, evidence links, approximate length.

5. **Handoff report** at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K478_B122_LB_SUBSTACK_PLUG.md`

6. **Commit + tag** `v-lb-substack-plug-K478`

### Editorial voice constraint (IMPORTANT)

K478's editorial voice is user-sovereignty-oriented, NOT platform-centric. The "reins of our very fast horse" keystone governs. Content must center "here's the horse, you drive" — not "come into our cathedral." See K478 prompt §Context for the Founder-corrected framing.

---

## Notes on Session 3 Rule

This session completed K480 (small), K479 (small), and K476 (medium-small). Three tasks, but none were heavy benchmark runs. The "3 big ones" rule was designed to prevent session context explosion from live-API-call tasks. By that reading, K477 (which requires live Playwright benchmark runs equivalent to K475's scope) should be treated as the first "big one" of the next session. K478 is light and can follow.

Suggested next session order:
1. K477 (heavy — dedicated session may be warranted)
2. K478 (light — can finish same session after K477)

---

*Written by Knight/Sonnet 4.6 at end of B122 session.*
