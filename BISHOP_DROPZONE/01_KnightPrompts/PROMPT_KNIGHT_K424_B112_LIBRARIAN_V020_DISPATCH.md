# Knight K424 — librarian-mcp v0.2.0 + Operational Canon preload + metrics + PyPI + CI/CD
## B112, April 21, 2026 — DISPATCH (finalized from B111 stub)
## Supersedes: `PROMPT_KNIGHT_K424_B111_STUB_MCP_V020_PACKAGING.md` (keep stub as audit trail)

**Status:** Dispatched. Execute after Bishop posts this prompt into LianaBanyanKNIGHT inbox.
**Prerequisite:** K423 complete ✓. R10 Eyewitness Benchmark results locked at 8-model × 4-vendor × 1,200 calls, inter-rater κ 0.883 / 0.850. Mean HOT 94.8% / COLD 8.7%. Full table in `EYEWITNESS_BENCHMARK_RESULTS_B111.md`.
**Priority:** High. Blocks Eyewitness Program public launch (Apr 26–27). Blocks Yale demo-table polish (Apr 28).
**Estimated Knight session:** 4–6 hours.

---

## Design calls locked (R10 evidence now in)

Three design questions in the B111 stub were marked "depends on R10." R10 is done. Resolutions:

1. **No vendor preload truncation observed.** All 8 models carried the full ~87k preload and scored ≥89.3% HOT. No Azure-OpenAI cap, no silent-truncation signals in the JSONL. Decision: `librarian_context` v0.2.0 does **not** need a defensive `max_tokens` cap for vendor-compat reasons. The `max_tokens` parameter still ships for intent-scoped slices, but not as a truncation guard. (Note for Knight: the benchmark results file labels OpenAI as "OpenAI (direct)" while the B111 closeout mentions an Azure swap. Confirm which was actually hit in K423 before documenting in README.)
2. **Cross-vendor cost variance was enormous** — $0.0001 (Gemini 2.5 Flash COLD) to $0.1272 (Opus HOT). Decision: `librarian_metrics.summary()` **must** break down per-vendor + per-model. Aggregate-only would hide the headline finding (Haiku ties Opus at 19× cost difference).
3. **No model scored below 89% HOT.** Decision: no compatibility-warning logic required in v0.2.0. Defer to v0.3.0 if real-world evidence surfaces a failing vendor.

---

## Scope — locked, seven deliverables

### 1. `librarian_context` v0.2.0 (intent-aware querying)

API:
```python
librarian_context(intent: str | list[str] = "", max_tokens: int = 16000)
  -> {"packet": str, "sections_included": list[str], "token_count": int, "source_version": str}
```

Intents (authoritative set — document in README):
- `""` (default / empty) — return the full 87k R9-v2 preload (same as v0.1.0-alpha behavior)
- `"outreach"` — Operational Canon + letter_dispatch_queue summary + Opening Gambit v2 + Wave schedule
- `"architecture"` — R9 technical brief + Pledge text + IP Load Balancing v2 + Pedestal Stake / Upekrithen structure
- `"founder_voice"` — Rhetorical Keystones + Anachronism Principle + Pine Books / Librarian metaphor anchor + Cloyd Pattern
- `"benchmark"` — R9-v2 preload + 75-Q bank reference + grading rubric + posture-disclosure text
- `"canonical"` — canonical_values.yaml + CANONICAL_LAWS_AND_FRAMEWORKS.md (reasoning-layer only, no prose)
- `"operational"` — shorthand for `["outreach", "canonical"]`

Behavior:
- Lists = union of sections, deduplicated, capped at `max_tokens` if aggregate exceeds cap (truncate lowest-priority section first, with a `truncation_note` field in the response)
- `source_version` field returns the git SHA of the underlying memory content used for this response
- Prompt-caching-compatible: the full preload is still a single cacheable string with an `{"cache_control": {"type": "ephemeral"}}` hint in the MCP response metadata for the caller to propagate
- Logging: every call writes one line to `~/.librarian-mcp/context_queries.jsonl` with `{timestamp, intent, token_count, caller_model?}` — used by Bishop to track which intents are load-bearing

### 2. Operational Canon preload extension

Extend the R9-v2 preload with a new ~20–30k-token **Operational Canon** section containing, in order:

1. Opening Gambit v2 (Circle priorities, Wave schedule) — source: `00_FOUNDER_REVIEW/OPENING_GAMBIT_v2_B111.md` (or latest)
2. `letter_dispatch_queue` summary — recipient, category, status, subject_line (NO bodies). Pull live from Supabase via read-only query; cache to `memory/operational_canon/letter_queue_snapshot.md` with ingest timestamp
3. Pledge structure one-pager — Cooperative Defensive Patent Pledge (#2260) + IP Load Balancing v2 (60/20/10/10) + Upekrithen LLC seller-of-record
4. Cephas content registry — titles + categories (NO bodies)
5. Glass Door protocol one-pager
6. Medallion sponsorship mechanics one-pager
7. Three-clock timeline canon (problem 40y+ / IT '97 / platform decade-plus prep + 6mo build)
8. Witness Program overview + current member count + status

Total preload after extension target: **~110–120k tokens**. Verify with a tokenizer — if any single model's context window (e.g. GPT-4o-mini at 128k) would be squeezed, trim lowest-priority items until 110k ceiling holds.

### 3. `librarian_metrics` tool — NEW

API:
```python
record_measurement(session_id, vendor, model, condition, question_id, correct, input_tokens, output_tokens, cost_usd, latency_s) -> None
summary(since_timestamp: str | None = None) -> dict
opt_in_share(enabled: bool = True) -> {"status": "enabled" | "disabled"}
```

Storage: `~/.librarian-mcp/metrics.jsonl` in user home (NOT the repo).

`summary()` return schema (locked per R10 learnings — must be per-vendor/model):
```json
{
  "total_calls": int,
  "per_vendor": {
    "anthropic": {"calls": int, "hot_accuracy": float, "cold_baseline_est": float, "dollars_saved_est": float, "cache_hit_rate": float},
    "google": {...},
    "openai": {...},
    "perplexity": {...}
  },
  "per_model": {"claude-haiku-4-5-20251001": {...}, ...},
  "cumulative_hot_accuracy": float,
  "cumulative_cold_baseline_est": float,
  "cumulative_dollars_saved_est": float,
  "opt_in_share": bool,
  "since": timestamp
}
```

`opt_in_share()` — flips local flag. When enabled, `summary()` is allowed to be POSTed anonymously to the commons dashboard. **Default is OFF.** Commons dashboard endpoint: **TBD — do not ship the POST path in K424; ship the local recorder + the opt-in flag. The POST path ships in K425 or separate.**

### 4. `pyproject.toml` PyPI packaging

- Target package name: `librarian-mcp`. If taken on PyPI, fall back to `liana-banyan-librarian-mcp`. Check availability as step 1 of K424 and surface the chosen name in the PR description.
- Dependencies pinned: `mcp>=1.0`, `anthropic`, `tiktoken` (for token counting). Dev deps: `pytest`, `ruff`, `mypy`.
- Build system: `hatchling` (standard modern Python packaging).
- Entry point: `librarian-mcp = "librarian_mcp.cli:main"`.

### 5. `.github/workflows/publish.yml`

- Trigger: `on: push: tags: v*`
- Job: build + publish to PyPI via `pypa/gh-action-pypi-publish@release/v1`, using a `PYPI_API_TOKEN` secret
- **Do not actually publish from K424.** Stage the workflow; Founder (or Bishop on Founder authorization) triggers the first publish by pushing a tag manually.

### 6. `.github/workflows/ci.yml`

- Trigger: `on: [push, pull_request]`
- Matrix: Python 3.10 / 3.11 / 3.12
- Steps: install → `ruff check` → `mypy --strict librarian_mcp/` → `pytest -v`
- Fail build on any step failure

### 7. Repo-org transfer (conditional on Founder action)

- GitHub org `liana-banyan` must exist. Founder action: create the org if missing; grant Knight maintainer access.
- If org exists at K424 dispatch time: transfer `Upekrithen/librarian-mcp` → `liana-banyan/librarian-mcp`. Update all URL references in README, pyproject metadata, MCP manifest, AGENTS.md, and letter drafts that cite the repo (NYT v2, Doctorow V04, Scott v014h, Sanders/AOC memo).
- If org doesn't exist at dispatch: skip transfer, document blocker in K424 report, flag for K425.

---

## Acceptance criteria (Knight marks done when all pass)

- [ ] `pip install git+https://github.com/<final-url>/librarian-mcp.git@k424` succeeds on Python 3.10 / 3.11 / 3.12 in a fresh venv
- [ ] `librarian_context()` returns ≥85k tokens, valid JSON, with `source_version` populated
- [ ] `librarian_context(intent="outreach")` returns ≤20k tokens and `sections_included` includes `"letter_dispatch_queue"` and `"opening_gambit"`
- [ ] `librarian_context(intent=["benchmark", "founder_voice"])` returns union, deduplicated, ≤16k tokens
- [ ] `librarian_metrics.record_measurement(...)` then `librarian_metrics.summary()` shows per-vendor breakdown with non-zero values
- [ ] `librarian_metrics.opt_in_share(True)` then `opt_in_share(False)` round-trips correctly; `summary()` reflects the flag
- [ ] `ruff check` passes clean
- [ ] `mypy --strict` passes clean
- [ ] `pytest` passes with ≥80% coverage on new code (including `librarian_metrics` and intent-aware `librarian_context`)
- [ ] README updated with full tool API + intent table + metrics schema
- [ ] CHANGELOG.md entry for v0.2.0 with R10 evidence cited inline
- [ ] Operational Canon section audited by Bishop for no-body / no-secret violations before merge

---

## Non-goals (explicitly out of scope)

- Actually publishing to PyPI (stage the workflow, Founder triggers first publish)
- Building the commons dashboard server that receives POSTed summaries (K425 or separate)
- Moving to `liana-banyan` GitHub org if the org doesn't exist yet (flag for Founder action, don't block on it)
- Any change to the R9-v2 preload content itself — extend only, don't edit
- Any schema migration to Supabase — read-only queries only for Operational Canon ingestion

---

## Reporting requirements (for Knight session-close report)

1. Commit SHA of the final merge
2. PyPI package name finalized (and why, if the fallback was used)
3. Link to the passing CI run
4. Copy of `librarian_metrics.summary()` output from a manual smoke-test run against 3+ vendors
5. Token count of each intent's return packet (for Bishop's records)
6. List of any Operational Canon items that were trimmed to stay under the 110–120k ceiling
7. Any discovered deviation from the 8-model table (if a vendor API changed mid-K424, note it)
8. Blockers encountered + open questions for Bishop

---

## Upstream / downstream dependencies

- **Upstream:** K423 R10 results ✓. Bishop memory files `project_eyewitness_cross_vendor_finding_b111.md` + `project_librarian_mcp_public.md` + `project_rhetorical_keystones.md` (for `intent="founder_voice"` sourcing). Pine Books anchor `project_pine_books_anchor.md`. Canonical laws at `CANONICAL_LAWS_AND_FRAMEWORKS.md`.
- **Downstream:** K425 (SP-20 Pollinator, secrets canonicalization) — K425 will extend `librarian_metrics` to also record Pollinator-driven canon-drift events. Don't bake Pollinator assumptions into K424 schema; keep `record_measurement` signature additive-safe.
- **External-facing:** Eyewitness Program launch posts (Apr 26–27) should reference v0.2.0 install command. NYT op-ed self-pub variant and Doctorow V04 currently reference v0.1.0-alpha — Bishop will update post-K424 to v0.2.0 if Founder ratifies.

---

*Dispatched B112, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Supersedes K424 B111 stub. For the Keep.*
