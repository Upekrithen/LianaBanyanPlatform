# KNIGHT PROMPT — K532 — Pawn-via-Librarian Dispatch Channel

**Filed**: B130A, 2026-04-27 by Bishop on Founder ratification.
**Gate**: K530 Chrome Omnibox Substrate Injection ✅ LANDED (`v-chrome-omnibox-substrate-injection-K530`, commit `faf328e`). K525 Conductor's Baton LAUNCH ✅ LANDED (`v-conductors-baton-launch-K525`, commit `3801ec7`). K528 R11-v2 Full-Stack REAL Test ✅ LANDED (closeout commit `6f2b47a`). All predecessors clean.
**Knight**: Sonnet 4.6 (recommend fresh Cursor session per TS-085; ~4-8 hr wallclock; industry-term API/compute spend, membership-orthogonal — $5/year membership unchanged, identical for all)
**Budget**: medium (~4-8 hr Knight wallclock; per-call Perplexity API spend at runtime ~$0.04-0.24/dispatch per K528 receipts)
**Tag-on-close**: `v-pawn-via-librarian-dispatch-K532`
**Predecessors**: K508 Comet Bridge MAIN-world fetch override (perplexity.ai surface proven), K518 Member-Tier Wing Deployment, K521.5 Together AI 70B Cathedral seal, K525 Conductor's Baton LAUNCH (production-stable routing engine + feature-flag publication-gate pattern), K528 R11-v2 Full-Stack REAL Test (Perplexity Spaces empirical at 94.6% HOT @ $0.239/HOT — the cost anchor for Pawn-via-API economics), K530 Chrome Omnibox Substrate Injection (Comet Bridge generalization at perplexity.ai = Pawn's surface).

## Why now

**Founder direction (B130A)**: *"I still want the pawn validation, just after we hard-wire it."* Pawn dispatch via local-file-path references fails (Pawn-in-Perplexity-browser is filesystem-sandboxed; ERR_FILE_NOT_FOUND on any local path). Per `project_pawn_via_librarian_dispatch_b130.md`, the durable channel is the unblock — not the inline-paste workaround.

This K-session builds the bidirectional Bishop ↔ Pawn dispatch loop that:
- Closes the Pawn validation deferral blocking Wave 1 letter character-flag validation
- Establishes the canonical pattern for ALL future Pawn research dispatches (recurring: every Wave of letters, every Pudding, every Crown Letter target validation)
- Composes with K530 Comet Bridge substrate at the perplexity.ai surface
- Records every dispatch + return for audit, ledger, and discipline (per K525 / K528 hook-discipline patterns)

## Phase A — Setup

**A.0** Task-fresh librarian consult: `mcp__librarian__brief_me("K532 — Pawn-via-Librarian Dispatch Channel — bidirectional Bishop/Pawn loop via Perplexity API or Comet Bridge sibling")`.
**A.0a** Step-0 git check-ignore on planned new files (`librarian-mcp/src/pawn_dispatch.ts`, `librarian-mcp/scripts/pawn_dispatch_*.mjs`, possibly `lb-pawn-bridge-extension/` if architecture B is chosen).
**A.0b** Step-0a Toolsmith consult: `mcp__librarian__consult_scribes(Toolsmith)` keywords `["pawn dispatch", "perplexity api", "comet bridge", "browser sandbox", "mcp tool wiring", "audit ledger"]`.
**A.0c** Read full text of:
   - `project_pawn_via_librarian_dispatch_b130.md` (the architectural ratification + scope)
   - `feedback_pawn_needs_context.md` (Pawn-input discipline)
   - `BISHOP_DROPZONE/02_PawnPrompts/PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md` (the canonical Pawn prompt awaiting dispatch — primary integration test target)
   - `lb-omnibox-extension/manifest.json` + `injected.js` + `background.js` (K530 Comet Bridge substrate; potential extension reuse for architecture B)
   - K525 stack: `platform/src/lib/conductor/router.ts` + `circuitBreaker.ts` + `costCap.ts` + `telemetry.ts` (publication-gate pattern + circuit-breaker / cost-cap discipline reuse)
   - K528 results: `librarian-mcp/r10_cross_vendor/results_r11v2_K528/perplexity_spaces.jsonl` (per-call Perplexity API cost empirical)

**A.1** Architectural decision (write to `BISHOP_DROPZONE/03_BishopHandoffs/K532_ARCHITECTURE_DECISION.md` for Founder ratification AT END of Phase A, BEFORE Phase B):

Three options to evaluate, with tradeoff table. **Bishop recommendation: Architecture A (MCP tool wiring direct to Perplexity API) — cleanest, audited by default, no browser-context dependency. Founder confirms before Phase B.**

| # | Architecture | Pros | Cons | Recommended? |
|---|---|---|---|---|
| **A** | **MCP tool wiring** — `mcp__librarian__dispatch_pawn` tool that hits Perplexity API directly with prompt content; bypasses browser entirely | Cleanest, audited, no browser dependency, deterministic, ledgerable per-call, async-friendly (dispatch returns dispatch_id; poll for result) | Per-call API cost (~$0.04-0.24/dispatch per K528 perplexity_spaces empirical); requires Perplexity API key + cost-cap discipline | ✅ **Yes, primary** |
| **B** | **Comet Bridge sibling extension** — new `lb-pawn-bridge-extension/` (sibling to `lb-omnibox-extension/`) that auto-injects prompt into Pawn's chat at perplexity.ai, polls for response, writes return | Leverages K530 substrate; no API cost; uses Founder's existing Perplexity browser session | Requires Founder's Comet/Perplexity browser open + extension running; flakier (DOM scraping for response; brittle to Perplexity UI changes); browser-bound; harder to audit | Fallback if A's API cost is unacceptable |
| **C** | **Hybrid** — A as primary; B as fallback when API quota exhausted or Founder wants browser-bound dispatch | Resilient to API quota; preserves option-value | Doubled implementation; harder to test; harder to maintain | Only if A+B both deemed essential |

**A.2** API authentication audit (if Architecture A chosen): verify Perplexity API key location in `Asteroid-ProofVault/LockBox/SDS.env` (per K528 perplexity_adapter.py pattern); confirm cost-allowance + rate-limit ceiling with Founder if not already authorized.

## Phase B — Build (Architecture A reference; Architecture B/C addendums on Founder ratification)

**B.1** New MCP tool surface: `mcp__librarian__dispatch_pawn`. Schema:
- `prompt_content` (string, required) — full prompt text to send to Pawn (NOT a file path; the tool inlines content)
- `prompt_artifact_path` (string, optional) — Bishop dropzone path of the canonical prompt artifact (for ledger record)
- `expected_return_path` (string, required) — where Pawn's return should be written (e.g., `BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_*.md`)
- `model` (enum, default `sonar-pro`) — Perplexity model selection (sonar-pro, sonar-reasoning, sonar-large-online)
- `max_tokens` (number, default 4000) — response length cap
- `dispatch_metadata` (object, optional) — Bishop-side context (session_id, cohort, Founder-authorization-flag)

Tool returns:
- `dispatch_id` (string) — UUID for ledger record + correlation
- `status` (enum: `dispatched`, `error`)
- `error_class` (string, if error)
- `cost_estimate_usd` (number) — pre-call estimate based on prompt length
- `cost_actual_usd` (number) — post-call actual

**B.2** Dispatch flow:
1. Tool invocation → write dispatch record to `librarian-mcp/dispatches/pawn/<dispatch_id>.dispatch.json` (prompt content, metadata, timestamp, dispatch_id, expected_return_path)
2. POST to Perplexity API `https://api.perplexity.ai/chat/completions` with model + prompt content + max_tokens
3. Receive response → write to `expected_return_path` AND to `librarian-mcp/dispatches/pawn/<dispatch_id>.return.json` (response, cost_actual_usd, timestamp)
4. Append ledger entry to `BISHOP_DROPZONE/99_Misc/TOKEN_USAGE_LEDGER.md` `## Pawn Dispatches` section: dispatch_id, prompt_artifact, response_artifact, cost_actual, timestamp, dispatch_metadata
5. Return success status + dispatch_id

**B.3** Cost-cap discipline (reuse K525 pattern from `costCap.ts`):
- Per-dispatch cost-cap: $1.00 hard ceiling per single dispatch (K528 anchor: largest single Pawn dispatch is ~$0.50 max for Keirsey research class)
- Daily cost-cap: $10.00 daily ceiling (configurable in `librarian-mcp/config/pawn_dispatch_caps.json`)
- Founder-authorization-required for any dispatch projected to exceed per-dispatch cap; tool returns `error_class: cost_cap_exceeded` with `requires_founder_authorization: true` if uncertainty about cap
- Telemetry: every dispatch's pre/post cost goes to `librarian-mcp/telemetry/pawn_dispatch_costs.jsonl` for daily reconciliation

**B.4** Audit ledger:
- Append-only `librarian-mcp/dispatches/pawn/dispatch_ledger.jsonl` — every dispatch record carries: dispatch_id, prompt_hash (SHA-256 of prompt content for de-dup detection), response_hash, cost_actual_usd, model, dispatch_timestamp, return_timestamp, expected_return_path, dispatch_metadata, success/error
- Bishop can query ledger for: "all Pawn dispatches in B130", "all dispatches for cohort=Keirsey", "total Pawn spend this session", "any duplicate prompts dispatched"

**B.5** Error handling:
- Network failure → retry with exponential backoff (per K528 perplexity_adapter.py pattern; max 5 retries, parse Retry-After header)
- API quota exhausted (401/429) → return `error_class: quota_exhausted`, write partial state to ledger, surface `requires_founder_credit_topup: true` to Bishop
- Malformed response → write raw response to dispatch ledger as-is + flag `error_class: malformed_response`; Bishop investigates
- Rate-limit ceiling at corpus size (per K528 chatgpt_memory finding) → smaller prompts only; document max_prompt_size in tool metadata

**B.6** Bishop integration: Bishop calls `mcp__librarian__dispatch_pawn(prompt_content="...", expected_return_path="BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md", ...)`. Tool returns dispatch_id. Bishop polls `expected_return_path` until file exists OR uses `mcp__librarian__check_pawn_dispatch(dispatch_id)` for status.

**B.7** Founder-facing control surface: `mcp__librarian__list_pending_pawn_dispatches` returns recent dispatch records + status; Founder can override / cancel pending dispatches via `mcp__librarian__cancel_pawn_dispatch(dispatch_id)`.

**B.8** Publication gate: `PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false` default in `librarian-mcp/config/pawn_dispatch_caps.json`. Until Founder flips to `true`, the tool returns `error_class: feature_flag_off` immediately. Same K525 mechanical-publication-gate pattern.

## Phase C — Verification (10 checks)

**C.1** Tool registers cleanly with MCP server (smoke test: `npm run build-guarded` per Rule 10 BRIDLE; `mcp__librarian__list_tools` includes `dispatch_pawn`)
**C.2** Feature-flag-off default → calling tool returns `feature_flag_off` error (NOT a Perplexity API call)
**C.3** Feature-flag-on + valid prompt → dispatch lands at Perplexity, response written to expected_return_path, ledger updated (use a minimal test prompt: "Return the literal string 'K532 verification ping'")
**C.4** Cost-cap enforcement: prompt with projected cost > $1.00 returns `cost_cap_exceeded` error WITHOUT calling API
**C.5** Audit ledger contains: dispatch_id, prompt_hash, response_hash, cost_actual_usd, model, both timestamps
**C.6** Duplicate-prompt detection: dispatching same prompt twice surfaces `duplicate_prompt_detected` advisory (NOT error — Bishop may want re-validation)
**C.7** Network failure simulation: kill local network → tool retries with backoff → returns `network_failure` error after retry exhaustion; ledger captures attempt log
**C.8** API quota exhausted simulation (mock 401): tool returns `quota_exhausted` + `requires_founder_credit_topup: true`
**C.9** Cancel pending dispatch via `mcp__librarian__cancel_pawn_dispatch(dispatch_id)` → in-flight dispatch terminates cleanly; ledger marks cancelled
**C.10** End-to-end integration test: dispatch the actual `PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md` prompt → confirm Pawn return lands at `PAWN_RETURN_*.md` → confirm Bishop can read return via standard `Read` tool → confirm ledger entry complete

## Phase D — Documentation

**D.1** Update `project_pawn_via_librarian_dispatch_b130.md` with K532 LANDED status + commit hash + tag + integration-test results.
**D.2** Toolsmith entries (TS-NNN sequence per Knight scaffolding):
- TS for the architectural decision (A vs B vs C, with rationale)
- TS for any Perplexity API quirks discovered during build
- TS for any cost-cap calibration (e.g., "K528 anchor: Keirsey research = ~$0.50 max single dispatch; cost-cap $1.00 default appropriate")
- TS for the duplicate-prompt-detection pattern (Bishop discipline reinforcement)
**D.3** Synapse cluster (≥12 entries) on the Pawn-dispatch design choices, integration patterns with K525 + K530 substrate, ledger schema.
**D.4** Update `BISHOP_DROPZONE/99_Misc/TOKEN_USAGE_LEDGER.md` with `## Pawn Dispatches (K532-onwards)` section header + first integration-test entry.
**D.5** Update K530 closeout follow-up section: K532 LANDED, Pawn-via-Librarian channel now durable, K530 Comet Bridge substrate composes with K532 dispatch (architecture A is primary, B remains optional fallback).

## Phase E — Close

**E.1** Knight report at `BISHOP_DROPZONE/04_KnightReports/REPORT_KNIGHT_K532_B130.md`. Sections: what was built, architectural decision rationale, C-phase verification results, integration-test outcome (Keirsey research dispatch + return), Toolsmith entries filed, follow-up items (cost-cap calibration after first 5-10 real dispatches; potential Comet Bridge sibling extension if API cost is concern).
**E.2** Commit + tag `v-pawn-via-librarian-dispatch-K532`. Hook discipline: NO `--no-verify`. Apply TS-079 + TS-100 + `--assume-unchanged` recipes if locked-file friction surfaces (per K528 + K530 pattern).
**E.3** Update KNIGHT_QUEUE.md with K532 LANDED status.
**E.4** Verify the dispatched Keirsey research return at `BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md` is structurally valid (markdown table per prompt deliverable format) — Bishop will absorb, not Knight.

## Constraints

- **Three-Class Substrate Sovereignty (#2315)** — Pawn dispatches are Bishop-side internal research, NOT member queries. They live entirely in the Cathedral substrate's audit/ledger; never published, never cited externally, never attributed to recipients per the Pawn prompt's discretion clause.
- **Hook discipline inviolable**: NO `--no-verify` under any circumstance. Apply TS-079 + TS-100 + `--assume-unchanged` recipes if hooks fail. K528 + K530 set the precedent.
- **Path B / build-for-long-haul**: build the durable channel; don't ship a workaround dressed up as a tool.
- **Publication gate**: `PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false` ships in source. Founder flips to `true` only after Phase E validation lands and ledger discipline is confirmed.
- **Step-0a Toolsmith consult** + **Step-0 git check-ignore** + **Toolsmith write at close** + **Synapse minimum ≥12** — standard Knight scaffolding discipline.
- **Long Haul AND Fix Along the Way.**

## Empirical proof point at K532 close

Bishop calls:
```
mcp__librarian__dispatch_pawn({
  prompt_content: <full content of PAWN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md>,
  expected_return_path: "BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md",
  model: "sonar-pro",
  dispatch_metadata: { session_id: "B130A", cohort: "Keirsey-validation", founder_authorized: true }
})
```

Tool returns dispatch_id. Pawn executes research at Perplexity. Return lands at expected_return_path within ~30-90 sec. Ledger entry captures cost_actual + both hashes + timestamps. Bishop absorbs return into `BISHOP_DROPZONE/03_BishopHandoffs/B130_LETTER_RECIPIENTS_KEIRSEY_ANALYSIS.md`. **The deferred Pawn validation flow now closes in <2 min wallclock per dispatch — no Founder browser interaction, no path-translation bugs, no ERR_FILE_NOT_FOUND class failures.**

This is the canonical empirical anchor for `project_pawn_via_librarian_dispatch_b130.md` Path B / build-for-long-haul rationale + the unblock for ALL Wave-N letter character-flag validation Founder is now gearing up for.

## K-future composition

K532 unlocks:
- Wave 1 letter character-flag validation (immediate — fire the Keirsey Pawn prompt)
- Wave 2/3 letter validation (recurring — every cohort gets a Pawn pre-dispatch read)
- Pudding Pawn-research-validation passes (every Pudding draft can have Pawn fact-check / target-validation)
- Crown Letter target validation (per-recipient pre-dispatch read)
- Future Pawn-as-Bishop-collaborator workflows (Bishop drafts substrate question → Pawn researches via real-time web → Bishop ratifies into canon)

K532 composes with:
- K530 Comet Bridge substrate (architecture B fallback path; future hybrid if needed)
- K525 Conductor's Baton (cost-cap + circuit-breaker discipline pattern)
- K528 Cathedral economics (Perplexity Sonar-Pro per-call cost anchor: $0.239/HOT empirical)
- K538-class Synapses production (Pawn becomes a first-class agent in cross-Cathedral Synapses traffic)

---

*Filed B130A by Bishop. Path B / build-for-long-haul. Hard-wire Pawn into the Librarian once; close the deferral forever; unblock all downstream Pawn-validation workflows. Three-Class Substrate Sovereignty honored end-to-end. The receipt is K528. The substrate is K530 + K532. The next dispatch is the proof.*
