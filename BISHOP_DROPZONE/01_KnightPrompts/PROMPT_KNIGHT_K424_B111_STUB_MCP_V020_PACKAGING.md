# Knight K424 — librarian-mcp v0.2.0 + metrics tool + PyPI packaging — STUB
## B111, April 20, 2026 — Bishop stage (not yet dispatched)

**Status:** Stub — full prompt drafted after K423 R10 results land and any Microsoft/Azure caveats are known. Do NOT execute K424 until Bishop formally dispatches.

**Why this is staged but not dispatched:** K423 was re-scoped at B111 to R10-only (cross-vendor benchmark) because the op-ed dispatch sequence depends on the cross-vendor table landing before the NYT pitch and the Doctorow V04 send. The v0.2.0 work is important but does not block any near-term external-facing deadline — Yale demo-table works fine with v0.1.0-alpha, and the external replicator arm of R10 can run against v0.1.0-alpha.

---

## Scope expansion — Founder-ratified B111 (two tracks combined into K424)

**Track 1 (near-term preload extension) + Track 2 (librarian_context v0.2.0) — both approved for combined K424 execution.** Do not split into K424a/K424b; the two tracks are complementary and should ship together so canon-ingestion capability lands with the intent-query tool that exposes it.

## Intended K424 scope (preview only — subject to revision based on R10 findings)

1. **`librarian_context` v0.2.0** — upgrade from the v0.1.0-alpha stub to the full R9 memory-packet architecture. Input: optional session-intent string. Output: structured JSON packet equivalent to the 87k-token R9-v2 preload, including MEMORY_PUBLIC + canonical_values.yaml + R9 licensing brief + CANONICAL_LAWS_AND_FRAMEWORKS.md + Session Reasoning Archive, with per-section token counts and a `source_version` field. Prompt-caching-compatible headers (`cache_control: ephemeral` marker propagated through MCP).

2. **`librarian_metrics` tool — NEW** — local-JSONL metrics recorder. API:
   - `record_measurement(session_id, vendor, model, condition, question_id, correct, input_tokens, output_tokens, cost_usd, latency_s)` — writes to `~/.librarian-mcp/metrics.jsonl` in the user's home directory (NOT the repo).
   - `summary(since_timestamp=None)` — returns cumulative savings as {total_calls, hot_accuracy, cold_baseline_est, dollars_saved_est, cache_hit_rate}.
   - `opt_in_share()` — one-time prompt to the user; if accepted, flips a local flag that allows `summary()` to be POSTed anonymously to a commons dashboard (dashboard endpoint TBD). Default is OFF. This is the thermometer's user-facing lever.

3. **`pyproject.toml` PyPI publishing** — prepare the v0.1.0 for PyPI (pending final name availability check — is `librarian-mcp` taken on PyPI? if so, fall back to `liana-banyan-librarian-mcp` or similar). Add GitHub Actions workflow `.github/workflows/publish.yml` that auto-publishes on tag push. Do NOT actually publish to PyPI in K424 — stage the workflow, let Bishop or Founder trigger the first real publish.

4. **Repo-org transfer** — GitHub repo currently at `Upekrithen/librarian-mcp`; move to `liana-banyan/librarian-mcp` once the `liana-banyan` GitHub org is created (Founder action). K424 updates all URL references in README, docs, and package metadata post-transfer.

5. **CI/CD** — GitHub Actions for tests (pytest), linting (ruff), type-checking (mypy on strict). Matrix: Python 3.10/3.11/3.12.

6. **Operational Canon preload extension (Track 1 near-term fix).** Extend the R9-v2 preload (currently MEMORY_PUBLIC + canonical_values.yaml + R9 licensing brief + CANONICAL_LAWS_AND_FRAMEWORKS + SP-15 Session Reasoning Archive, ~87k tokens) with a new **Operational Canon section** (~20–30k tokens) containing:
   - Current Opening Gambit v2 (Circle priorities, Wave schedule, dispatch timing) from `BISHOP_DROPZONE/00_FOUNDER_REVIEW/OPENING_GAMBIT_v2_B111.md`
   - Current `letter_dispatch_queue` summary (recipient name / status / category / subject_line, no bodies) from Supabase
   - Pledge structure + Pedestal Stake / Upekrithen LLC structure summary
   - Cephas content registry (titles + categories, no bodies)
   - Glass Door protocol summary
   - Medallion sponsorship mechanics summary
   - Three-clock timeline canon (IT '97 / problem 40y+ / platform 10y+prep + 6mo build)
   - Witness Program overview + status
   
   Goal: Bishop should be able to query operational context (outreach priorities, dispatch state, legal structure) without Grepping 50 files. This closes the B111 "canon-not-fully-ingested" gap Founder identified.
   
   Total preload after extension: ~110–120k tokens. Still within cacheable range for all primary grader/benchmark models. Intent-aware query via `librarian_context(intent=...)` (see Track 2 below) returns just the relevant slice rather than the whole packet.

7. **`librarian_context` v0.2.0 intent-aware querying (Track 2 medium-term).** API:
   - `librarian_context(intent: str, max_tokens: int = 16000) -> {packet: str, sections_included: list, token_count: int}`
   - Intent examples: `"outreach"` → returns Operational Canon + relevant letter-dispatch state. `"architecture"` → returns technical R9 + Pledge + IP split. `"founder_voice"` → returns Rhetorical Keystones + Anachronism Principle + Pine Books anchor. `"benchmark"` → returns R9-v2 preload + question bank reference + grading rubric. Default (no intent) returns the current 87k full preload.
   - Stretch: support `intent` as a list; return union of sections.
   - Logging: record each `librarian_context` call to local JSONL (`~/.librarian-mcp/context_queries.jsonl`) for Bishop self-reflection on which intents are most queried — informs Stitchpunk pipeline priorities.

---

## Why K424 needs R10 results first

- If R10 reveals that Microsoft Azure OpenAI truncates the preload (system-prompt length cap), `librarian_context` v0.2.0 should ship with a `max_tokens` parameter so clients can request a smaller packet. K423 tells us if that's needed.
- If cross-vendor costs vary wildly, `librarian_metrics` should record vendor+model metadata so the `summary()` output is per-vendor, not aggregate-only.
- If a specific vendor's HOT score is dramatically weak, `librarian_context` should surface a compatibility warning when that vendor is detected.

---

## Dependencies

- K423 completed and R10 results committed
- Founder reviewed R10 table and approved v0.2.0 design calls that depend on findings
- PyPI name reserved (or alternative decided)
- `liana-banyan` GitHub org created (Founder action)

---

*Stub saved B111, April 20, 2026. Full prompt to be drafted after K423 lands. This stub exists so that after R10 completes, K424 can be finalized and dispatched without a round-trip delay.*
